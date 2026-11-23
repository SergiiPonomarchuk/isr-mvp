"""Read-only Values grounding inventory. No provider or database write API.

Profile text/raw artifacts stay in memory. Reports contain IDs, fixed reason
codes and digests only. A paginated scan is not an atomic database snapshot.
"""
from __future__ import annotations
import argparse
import collections
import copy
import datetime as dt
import hashlib
import json
import math
import os
from pathlib import Path
import re
import sys
import tempfile

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from vectorizer.values_metadata import validate_gl_cs, overall_grounding
from vectorizer.pipeline import validate_vector_schema
from vectorizer.run import format_for_firestore

LIVE_PROJECT = 'project-a3d59130-5adf-4677-9e2'
FIELDS = ('uid', 'values_taxonomy', 'values_description')
FLAT = ('domains', 'items', 'conflict_resolution', 'contextual_shifts')
SIZES = (18, 17, 8, 18, 6, 6, 21, 18, 6, 27)
STATES = ('already_correct', 'calculable_from_stored_grounding',
          'recoverable_from_artifact', 'unresolved', 'not_vectorized')


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False).encode()).hexdigest()


def safe_id(uid):
    text = str(uid)
    return text if re.fullmatch(r'[0-9]{1,32}', text) else 'id-sha256:' + hashlib.sha256(text.encode()).hexdigest()


def finite_number(value):
    if type(value) not in (int, float):
        return False
    try:
        return math.isfinite(value)
    except OverflowError:
        return False


def valid_scalars(values):
    return isinstance(values, list) and all(x is None or finite_number(x) for x in values)


def flattened(taxonomy):
    if not isinstance(taxonomy, dict) or set(taxonomy) - set(FLAT) - {'meta'}:
        raise ValueError('invalid_flattened_layout')
    domains, items = taxonomy.get('domains'), taxonomy.get('items')
    conflicts, shifts = taxonomy.get('conflict_resolution'), taxonomy.get('contextual_shifts')
    if not valid_scalars(domains) or len(domains) != 10 or not valid_scalars(conflicts) or len(conflicts) != 36:
        raise ValueError('invalid_flattened_layout')
    if not isinstance(items, dict) or set(items) != {f'd{i}' for i in range(1, 11)}:
        raise ValueError('invalid_flattened_layout')
    if any(not valid_scalars(items[f'd{i+1}']) or len(items[f'd{i+1}']) != n for i, n in enumerate(SIZES)):
        raise ValueError('invalid_flattened_layout')
    if not isinstance(shifts, dict) or set(shifts) != {'work', 'family', 'private', 'crisis'} or any(not valid_scalars(v) or len(v) != 10 for v in shifts.values()):
        raise ValueError('invalid_flattened_layout')
    return {k: taxonomy[k] for k in FLAT}


def provenance(meta, uid, narrative):
    if not isinstance(meta, dict) or type(meta.get('uid')) not in (int, str) or str(meta['uid']) != uid:
        return 'source_uid_mismatch'
    source_hash = meta.get('hash')
    if not isinstance(source_hash, str) or not re.fullmatch('[0-9a-f]{40}', source_hash):
        return 'missing_source_hash'
    if not isinstance(narrative, str) or not narrative:
        return 'missing_current_narrative'
    if source_hash != hashlib.sha1(narrative.encode('utf-8')).hexdigest():
        return 'narrative_hash_mismatch'
    return None


def pairs_from_metadata(meta):
    if not isinstance(meta, dict) or meta.get('version') not in ('1.0', '2.1'):
        raise ValueError('unknown_metadata_version')
    raw = meta.get('gl_cs')
    if isinstance(raw, dict):
        if set(raw) != {f'd{i}' for i in range(1, 11)}:
            raise ValueError('invalid_grounding_metadata')
        values = []
        for i in range(1, 11):
            pair = raw[f'd{i}']
            if not isinstance(pair, dict) or set(pair) != {'grounding', 'confidence'}:
                raise ValueError('invalid_grounding_metadata')
            values.append([pair['grounding'], pair['confidence']])
        raw = values
    try:
        return validate_gl_cs(raw)
    except ValueError:
        raise ValueError('invalid_grounding_metadata') from None


def load_artifacts(paths, max_bytes=64 * 1024 * 1024):
    index, summaries = {}, []
    def unique(pairs):
        result = {}
        for k, v in pairs:
            if k in result:
                raise ValueError('duplicate_json_key')
            result[k] = v
        return result
    def constant(_):
        raise ValueError('invalid_json_number')
    for number, path in enumerate(paths, 1):
        summary = dict(source_id=f'artifact_{number}', entries=0, invalid_entry_ids=0)
        try:
            p = Path(path)
            if p.stat().st_size > max_bytes:
                raise ValueError('artifact_too_large')
            with p.open('rb') as source:
                data = source.read(max_bytes + 1)
            if len(data) > max_bytes:
                raise ValueError('artifact_too_large')
            summary['file_sha256'] = hashlib.sha256(data).hexdigest()
            vectors = json.loads(data.decode('utf-8-sig'), object_pairs_hook=unique, parse_constant=constant)
            if not isinstance(vectors, dict):
                raise ValueError('unsupported_artifact_layout')
            summary['entries'] = len(vectors)
            for uid, raw in vectors.items():
                if not re.fullmatch(r'[0-9]{1,32}', uid):
                    summary['invalid_entry_ids'] += 1
                    continue
                index.setdefault(uid, []).append(dict(raw=raw, source_id=summary['source_id'], file_sha256=summary['file_sha256']))
        except FileNotFoundError:
            summary['error'] = 'artifact_missing'
        except OSError:
            summary['error'] = 'artifact_unreadable'
        except (ValueError, UnicodeError):
            # Never emit parser excerpts or input-dependent exception messages.
            summary['error'] = 'artifact_invalid_or_oversized'
        summaries.append(summary)
    return index, summaries


def classify(uid, data, artifacts=(), update_time=None):
    uid = str(uid)
    row = dict(uid=safe_id(uid), state='unresolved', reasons=[])
    if update_time is not None:
        row['update_time'] = update_time.isoformat()
    taxonomy = data.get('values_taxonomy')
    if taxonomy is None or taxonomy == {}:
        row['state'] = 'not_vectorized'
        return row
    try:
        flat = flattened(taxonomy)
        row['taxonomy_sha256'] = digest(flat)
    except (ValueError, TypeError, OverflowError):
        row['reasons'] = ['invalid_flattened_layout']
        return row
    if type(data.get('uid')) not in (int, str) or str(data['uid']) != uid:
        row['reasons'] = ['profile_uid_mismatch']
        return row
    narrative = data.get('values_description')
    candidates, failures = [], []
    stored = taxonomy.get('meta')
    if stored is not None:
        try:
            pairs = pairs_from_metadata(stored)
            problem = provenance(stored, uid, narrative)
            if problem:
                failures.append(problem)
            else:
                candidates.append(dict(pairs=pairs, version=stored['version'], route='stored', source_id='stored_metadata'))
        except ValueError as e:
            failures.append(str(e))  # Fixed reason codes only, never SDK/raw input errors.
    for artifact in artifacts:
        try:
            raw = artifact['raw']
            if not isinstance(raw, dict) or not isinstance(raw.get('meta'), dict):
                raise ValueError('artifact_layout_invalid')
            meta = raw['meta']
            pairs = pairs_from_metadata(meta)
            problem = provenance(meta, uid, narrative)
            if problem:
                raise ValueError(problem)
            try:
                validate_vector_schema(raw, is_step2=True)
                canonical = copy.deepcopy(raw)
                canonical['meta']['version'] = '1.0'  # In-memory layout check only; never a migration.
                candidate_flat = flattened(format_for_firestore(canonical))
            except (ValueError, TypeError, KeyError):
                raise ValueError('artifact_layout_invalid') from None
            if digest(candidate_flat) != row['taxonomy_sha256']:
                raise ValueError('artifact_values_mismatch')
            candidates.append(dict(pairs=pairs, version=meta['version'], route='artifact',
                                   source_id=artifact['source_id'], file_sha256=artifact['file_sha256']))
        except (ValueError, TypeError, KeyError) as e:
            reason = str(e) if isinstance(e, ValueError) else 'artifact_layout_invalid'
            failures.append(reason)
    row['source_rejections'] = sorted(set(failures))
    if not candidates:
        row['reasons'] = row['source_rejections'] or ['missing_grounding_and_retained_source']
        return row
    if len({digest(c['pairs']) for c in candidates}) > 1:
        row['reasons'] = ['conflicting_verified_sources']
        return row
    # Malformed stored provenance cannot be silently repaired using a backup.
    if stored is not None and failures and not any(c['route'] == 'stored' for c in candidates):
        row['reasons'] = ['stored_metadata_requires_review']
        return row
    chosen = next((c for c in candidates if c['route'] == 'stored'), candidates[0])
    row['verified_source_ids'] = sorted({c['source_id'] for c in candidates})
    row['source_file_sha256'] = sorted({c['file_sha256'] for c in candidates if 'file_sha256' in c})
    row['source_versions'] = sorted({c['version'] for c in candidates})
    row['requires_version_normalization'] = chosen['version'] != '1.0'
    if chosen['route'] == 'artifact':
        row['state'] = 'recoverable_from_artifact'
    else:
        og = stored.get('overall_grounding')
        correct = finite_number(og) and og == overall_grounding(chosen['pairs'])
        canonical = chosen['version'] == '1.0' and isinstance(stored.get('gl_cs'), dict)
        row['state'] = 'already_correct' if correct and canonical else 'calculable_from_stored_grounding'
    return row


def inventory(db, artifacts, artifact_summaries, page_size=200, progress=None):
    if type(page_size) is not int or not 1 <= page_size <= 500:
        raise ValueError('Page size must be 1..500')
    query = db.collection('users').select(FIELDS).order_by('__name__')
    rows, last = [], None
    while True:
        page = query.limit(page_size)
        if last is not None:
            page = page.start_after(last)
        snapshots = page.get(timeout=60)
        for snap in snapshots:
            rows.append(classify(snap.id, snap.to_dict(), artifacts.get(snap.id, []), snap.update_time))
        if progress:
            progress(len(rows))
        if len(snapshots) < page_size:
            break
        last = snapshots[-1]
    counts = dict.fromkeys(STATES, 0)
    reasons, rejected = collections.Counter(), collections.Counter()
    for row in rows:
        counts[row['state']] += 1
        reasons.update(row['reasons'])
        rejected.update(row.get('source_rejections', []))
    return dict(version='values-grounding-inventory-1', complete=True, atomic_snapshot=False,
                scanned=len(rows), vectorized=len(rows)-counts['not_vectorized'], counts=counts,
                unresolved_reasons=dict(sorted(reasons.items())), source_rejection_reasons=dict(sorted(rejected.items())), artifact_summaries=artifact_summaries,
                rows=rows, production_writes=0, provider_requests=0)


def check_target(project, live, env=None):
    env = os.environ if env is None else env
    host = env.get('FIRESTORE_EMULATOR_HOST')
    if host:
        if live or not project.startswith('demo-') or not re.fullmatch(r'(127\.0\.0\.1|localhost):[0-9]+', host):
            raise ValueError('Refusing ambiguous emulator target')
        port = int(host.rsplit(':', 1)[1])
        if not 1 <= port <= 65535:
            raise ValueError('Invalid emulator port')
        return 'emulator'
    if not live or project != LIVE_PROJECT:
        raise ValueError('Explicit acknowledged live project required')
    return 'live_read_only'


def save_report(report, path):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    lock = path.with_name(path.name + '.lock')
    descriptor = os.open(lock, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    temporary = None
    try:
        if path.exists():
            raise FileExistsError('Report already exists')
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=path.parent, delete=False) as output:
            temporary = Path(output.name)
            json.dump(report, output, indent=2, allow_nan=False)
            output.write('\n')
            output.flush()
            os.fsync(output.fileno())
        os.replace(temporary, path)
        temporary = None
    finally:
        os.close(descriptor)
        lock.unlink()
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project', required=True)
    parser.add_argument('--i-know-this-is-live', action='store_true', dest='live')
    parser.add_argument('--artifact', action='append', default=[])
    parser.add_argument('--report', required=True)
    parser.add_argument('--page-size', type=int, default=200)
    args = parser.parse_args(argv)
    try:
        mode = check_target(args.project, args.live)
        if Path(args.report).exists():
            raise ValueError('Report already exists')
        sources, summaries = load_artifacts(args.artifact)
        from google.cloud import firestore
        db = firestore.Client(project=args.project)
        try:
            report = inventory(db, sources, summaries, args.page_size,
                               lambda count: print(json.dumps({'scanned': count}), flush=True))
        finally:
            close = getattr(db, 'close', None)
            if close:
                close()
        report.update(project=args.project, target=mode, generated_at=dt.datetime.now(dt.timezone.utc).isoformat())
        save_report(report, args.report)
        print(json.dumps({k: report[k] for k in ('complete', 'scanned', 'vectorized', 'counts', 'unresolved_reasons', 'production_writes', 'provider_requests')}))
        return 0
    except Exception as error:
        print('Inventory aborted; no database writes. Error class: ' + type(error).__name__, file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
