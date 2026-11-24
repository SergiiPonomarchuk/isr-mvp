"""Read-only mr1 public audit, independently recomputed with Python arithmetic.

Reports contain identifiers and mismatch fields only; profiles remain in memory.
Legacy D1 scoring is deliberately handled by check_demo.py, never reinterpreted.
"""
from __future__ import annotations
import argparse
import json
import math
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import relevance_evaluator as D
import expertise as E
import isr_core as ISR
import multi_reference as M
from demo_common import target

VERSION = 'mr1-cbc-table-1'
LEGACY_VERSION = 'mr1-context-review-1'

def adjustment(bundle, ref):
    version = bundle.get('version')
    if version == VERSION:
        if any(k in ref for k in ('cbc_adjustment', 'CBC_adjustment_factor', 'cbc_adjustment_factor', 'cbc')):
            raise ValueError('CBC is fixed by education category')
        return 1
    if version != LEGACY_VERSION:
        raise ValueError('Unsupported scoring version')
    value = ref.get('cbc_adjustment')
    if type(value) not in (int, float) or not math.isfinite(value) or value <= 0:
        raise ValueError('Invalid frozen CBC adjustment')
    return value

TOL = .00100001
USER_FIELDS = ['uid', 'displayName', 'birthDate', 'skills', 'geography', 'socialRelations', 'features', 'post']
VECTOR_FIELDS = ['profile_vector', 'experience_vectors', 'embedding_model', 'embedding_dims', 'embedding_template']


def vector(v):
    return list(v or [])


def evaluate(user, vectors, bundle, location, registered):
    import ai_config as AI
    if (vectors.get('embedding_model') != AI.EMBED_MODEL or vectors.get('embedding_dims') != 768
            or vectors.get('embedding_template') != AI.EMBED_TEMPLATE_VERSION):
        raise ValueError('Profile embedding metadata')
    profile = vector(vectors.get('profile_vector'))
    if len(profile) != 768 or not all(math.isfinite(x) for x in profile):
        raise ValueError('Profile vector')
    near = D.nearest_anchor(user.get('geography'), location)
    g = D.g_score(near[0], bundle['model']['mu'], bundle['model']['sigma']) if near else 0
    skills = {str(k): vector(v) for k, v in vectors.get('experience_vectors', {}).items()}
    for s in user['skills']:
        if s['type'] in ('education', 'work experience'):
            v = skills.get(str(s['id']), [])
            if len(v) != 768 or not all(math.isfinite(x) for x in v):
                raise ValueError('Skill vector')
    aspects = {}
    for ref in bundle['model']['refs']:
        a = bundle['aspects'][ref['aspect_id']]
        rules = dict(a['demographics'])
        if bundle['scope'] in ('unit', 'building'):
            rules['property_kinds'] = [k for k in rules.get('property_kinds', []) if k not in ('flat', 'house')]
        d, _, _ = D.evaluate_demographic_rules(user, rules, E.to_date(registered).year)
        aspects[ref['id']] = dict(D=d, G=g, S=max(0, E.cosine_similarity(profile, a['vector'])), X=0,
                                 education=E.education_sum(user['skills'], skills, a['vector'], adjustment(bundle, ref)),
                                 experience=E.experience_sum(user['skills'], skills, a['vector']))
    return dict(uid=str(user['uid']), age=E.age_in_years(user['birthDate'], registered), aspects=aspects)


def outgoing(user):
    defaults = {k: v for names, v in [
        ('spouse partner wife husband', .3), ('parent father mother child son daughter sibling sister brother', .2),
        ('grandparent grandfather grandmother grandchild grandson granddaughter', .1),
        ('aunt uncle niece nephew cousin mother-in-law father-in-law sister-in-law brother-in-law son-in-law daughter-in-law', 0)
    ] for k in names.split()}
    defaults['close friend'] = .1
    result = {}
    for r in user['socialRelations']:
        kind = str(r.get('type', '')).strip().lower()
        tie = r.get('tie')
        if tie is None:
            if kind not in defaults:
                continue
            tie = defaults[kind]
        if type(tie) not in (float, int) or not math.isfinite(tie) or not 0 <= tie <= 1:
            raise ValueError('Relationship tie')
        uid = str(r.get('relative', ''))
        if not re.fullmatch(r'\d+', uid):
            raise ValueError('Relationship identifier')
        result[uid] = max(tie, result.get(uid, 0))
    return result


def audit(issue, discussion, public, rows, users, vectors):
    if issue.get('scoring_version') not in (VERSION, LEGACY_VERSION):
        raise ValueError('Use check_demo.py for legacy scoring; unsupported version')
    bundle = issue['mr1_model']
    if bundle.get('version') != issue['scoring_version']:
        raise ValueError('Issue and model scoring versions disagree')
    model = bundle['model']
    evaluated = {uid: evaluate(u, vectors[uid], bundle, issue['location'], issue['created_at']) for uid, u in users.items()}
    formed = M.cohorts(model, list(evaluated.values()), {uid: outgoing(u) for uid, u in users.items()})
    expected = {m['uid']: m for m in formed['members']}
    problems = []
    by_id = {str(m['user_id']): m for m in rows}
    def equal(uid, field, expected_value, tolerance=TOL):
        value = by_id[uid].get(field)
        if type(value) not in (float, int) or not math.isfinite(value) or abs(value - expected_value) > tolerance:
            problems.append(uid + ':' + field)
    for uid, m in by_id.items():
        if m.get('membership_source') == 'explicit_join':
            p = evaluated[uid]
            score = M.member(model, p['age'], p['aspects'])
            score.update(uid=uid, direct_relevance=score['R'], social_addition=0, social_source=None, social_tie=0, cohort='explicit')
            if score['R'] < .15:
                for source in sorted(by_id):
                    a = by_id[source]
                    if a.get('cohort') != 'A' or uid not in a.get('social_links', {}):
                        continue
                    tie = a['social_links'][uid]
                    addition = model['relevance']['X'] * tie
                    if score['direct_relevance'] + addition <= a['direct_relevance'] + M.EPS and addition > score['social_addition']:
                        score.update(R=score['direct_relevance'] + addition, social_addition=addition, social_source=source, social_tie=tie)
            score['effective']['X'] = score['social_addition'] / model['relevance']['X'] if model['relevance']['X'] else 0
            expected[uid] = score
    if set(by_id) != set(expected) or len(by_id) != len(rows) or public.get('member_count') != len(rows):
        problems.append('public:membership')
    for uid in set(by_id) & set(expected):
        actual, recomputed = by_id[uid], expected[uid]
        for field, value in [('relevance_score', recomputed['R']), ('direct_relevance', recomputed['direct_relevance']),
                             ('social_addition', recomputed['social_addition']), ('social_tie', recomputed['social_tie']),
                             ('expertise_score', recomputed['E']), ('experience_expertise', recomputed['experience']),
                             ('education_expertise', max(E.age_floor(evaluated[uid]['age']), recomputed['education_raw']))]:
            equal(uid, field, value, 1e-9 if field in ("direct_relevance", "social_addition", "social_tie") else TOL)
        if actual.get('cohort') != recomputed['cohort'] or actual.get('social_source') != recomputed['social_source']:
            problems.append(uid + ':cohort/source')
        for component in M.DIMS:
            equal(uid, component + '_score', recomputed['effective'][component], 1e-9)
        for ref, evidence in evaluated[uid]['aspects'].items():
            for field, value in evidence.items():
                stored = actual.get('mr1_evidence', {}).get(ref, {}).get(field)
                if type(stored) not in (float, int) or abs(stored - value) > 1e-8:
                    problems.append(uid + ':evidence:' + ref + ':' + field)
    normalized = M.public_scores(model, [dict(uid=str(m['user_id']), R=m['relevance_score'], E=m['expertise_score']) for m in rows])
    for m, score in zip(rows, normalized):
        uid = str(m['user_id'])
        for field, source in [('normalized_relevance', 'R_norm'), ('normalized_experience', 'E_norm'),
                              ('normalized_contribution', 'C_norm'), ('isr_score', 'isr')]:
            equal(uid, field, score[source])
    for topic in (issue, discussion):
        for field, source in [('relevance_scores', 'relevance_score'), ('isr_scores', 'isr_score')]:
            scores = topic.get(field, {})
            if set(scores) != set(by_id) or any(abs(scores.get(uid, math.inf) - m[source]) > TOL for uid, m in by_id.items()):
                problems.append('public:' + field)
    if set(map(str, discussion.get('participants', []))) != set(by_id):
        problems.append('public:participants')
    return dict(version=issue['scoring_version'], population=len(users), members=len(rows), A=len(formed['A']), B=len(formed['B']), problems=problems)


def audit_db(db, issue_id):
    issue = db.collection('issues').document(issue_id).get().to_dict()
    discussion = db.collection('discussions').document(issue_id).get().to_dict()
    if any(x and any(k in x for k in ('publication_version', 'prototype_version', 'build_id')) for x in (issue, discussion)):
        raise ValueError('publication_adapter_required: use the generation audit')
    publics = list(db.collection('microcommunities').where('issue_id', '==', issue_id).stream())
    if len(publics) != 1:
        raise ValueError('Expected one public')
    rows = [s.to_dict() for s in db.collection('microcommunity_members').where('microcommunity_id', '==', publics[0].id).stream()]
    users = {s.id: s.to_dict() for s in db.collection('users').select(USER_FIELDS).stream() if re.fullmatch(r'\d+', s.id)}
    vectors = {s.id: s.to_dict() for s in db.get_all([db.collection('user_vectors').document(uid) for uid in users], field_paths=VECTOR_FIELDS)}
    return audit(issue, discussion, publics[0].to_dict(), rows, users, vectors)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project', required=True)
    parser.add_argument('--i-know-this-is-live', action='store_true', dest='live')
    parser.add_argument('--issue-id', required=True)
    args = parser.parse_args(argv)
    target(args.project, args.live)
    from google.cloud import firestore
    result = audit_db(firestore.Client(project=args.project), args.issue_id)
    print(json.dumps(result))
    return bool(result['problems'])


if __name__ == '__main__':
    sys.exit(main())
