"""Read-only key census of an accepted emulator export; no profile property decoding.

This is a structural inventory, not CRC verification or a restoration tool.
Reports contain counts only. No credentials, profile fields or raw records are saved.
"""
from __future__ import annotations
import argparse
import json
import time
from pathlib import Path


def varint(data, pos):
    value = shift = 0
    while pos < len(data) and shift < 70:
        byte = data[pos]
        pos += 1
        value |= (byte & 127) << shift
        if byte < 128:
            return value, pos
        shift += 7
    raise ValueError('Invalid structural varint')


def field_at(data, pos, depth=0):
    if depth > 32:
        raise ValueError('Structural group nesting too deep')
    tag, pos = varint(data, pos)
    field, wire = tag >> 3, tag & 7
    if wire == 2:
        length, pos = varint(data, pos)
        end = pos + length
        if end > len(data):
            raise ValueError('Truncated structural field')
        value, pos = data[pos:end], end
    elif wire == 0:
        value, pos = varint(data, pos)
    elif wire in (1, 5):
        length = 8 if wire == 1 else 4
        if pos + length > len(data):
            raise ValueError('Truncated fixed structural field')
        value, pos = data[pos:pos+length], pos+length
    elif wire == 3:
        start = pos
        while pos < len(data):
            close, after = varint(data, pos)
            if close & 7 == 4:
                if close >> 3 != field:
                    raise ValueError('Mismatched structural group')
                return (field, wire, data[start:pos]), after
            _, pos = field_at(data, pos, depth+1)
        raise ValueError('Unterminated structural group')
    else:
        raise ValueError('Unsupported structural wire type')
    return (field, wire, value), pos


def fields(data):
    pos = 0
    while pos < len(data):
        row, pos = field_at(data, pos)
        yield row


def records(path):
    with path.open('rb') as stream:
        acc = bytearray()
        while header := stream.read(7):
            if len(header) != 7:
                raise ValueError('Truncated RecordIO header')
            length = int.from_bytes(header[4:6], 'little')
            kind = header[6]
            if kind == 0:
                stream.read((32768-stream.tell()%32768)%32768)
                continue
            if kind not in (1, 2, 3, 4):
                raise ValueError('Invalid RecordIO record type')
            if kind in (1, 2):
                acc = bytearray()
            piece = stream.read(length)
            if len(piece) != length or len(acc)+len(piece) > 16*1024*1024:
                raise ValueError('Invalid RecordIO fragment size')
            acc.extend(piece)
            if kind in (1, 4):
                yield bytes(acc)
            remaining = (32768-stream.tell()%32768)%32768
            if 0 < remaining < 7:
                stream.read(remaining)


def numeric_key(key):
    path = next((v for f, w, v in fields(key) if f == 14 and w == 2), b'')
    elements = [v for f, w, v in fields(path) if f == 1 and w in (2, 3)]
    if len(elements) != 1:
        return None
    parts = list(fields(elements[0]))
    kind = next((v for f, w, v in parts if f == 2 and w == 2), b'')
    if kind not in (b'users', b'user_vectors'):
        return None
    name = next((v for f, w, v in parts if f == 4 and w == 2), None)
    ident = next((v for f, w, v in parts if f == 3 and w == 0), None)
    if name is not None:
        if not name.isdigit():
            return kind.decode(), None
        return kind.decode(), name.decode('ascii')
    return (kind.decode(), str(ident)) if ident is not None else (kind.decode(), None)


def census(snapshot):
    started = time.perf_counter()
    shards = sorted((snapshot/'firestore_export/all_namespaces/all_kinds').glob('output-*'))
    if not shards:
        raise ValueError('Expected accepted snapshot export shards')
    ids = {'users': set(), 'user_vectors': set()}
    nonnumeric = dict.fromkeys(ids, 0)
    duplicate_keys = dict.fromkeys(ids, 0)
    count = 0
    for shard in shards:
        for record in records(shard):
            count += 1
            # Inspect only the entity key; property payloads are not decoded.
            key = next((v for f, w, v in fields(record) if f == 13 and w == 2), b'')
            row = numeric_key(key) if key else None
            if row is None:
                continue
            collection, uid = row
            if uid is None:
                nonnumeric[collection] += 1
            else:
                duplicate_keys[collection] += uid in ids[collection]
                ids[collection].add(uid)
    return dict(snapshot=snapshot.name, shards=len(shards), source_bytes=sum(p.stat().st_size for p in shards),
                entity_records=count, numeric_users=len(ids['users']), numeric_user_vectors=len(ids['user_vectors']),
                missing_vector_keys=len(ids['users']-ids['user_vectors']), orphan_vector_keys=len(ids['user_vectors']-ids['users']),
                nonnumeric_keys=nonnumeric, duplicate_keys=duplicate_keys, profile_properties_decoded=0,
                crc_verified=False, elapsed_seconds=round(time.perf_counter()-started, 3), provider_calls=0, database_rpcs=0)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--snapshot', required=True)
    parser.add_argument('--report', required=True)
    args = parser.parse_args()
    result = census(Path(args.snapshot))
    Path(args.report).write_text(json.dumps(result, indent=2)+'\n', encoding='utf8')
    print(json.dumps(result))


if __name__ == '__main__':
    main()
