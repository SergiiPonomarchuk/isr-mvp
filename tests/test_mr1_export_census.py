"""Safety/format cases for key-only accepted-export census; synthetic bytes only."""
import json
import sys
import tempfile
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import mr1_export_census as C


def vint(n):
    out=bytearray()
    while n>=128:
        out.append((n&127)|128);n>>=7
    return bytes(out)+bytes([n])


def sized(field, value):
    return vint(field*8+2)+vint(len(value))+value


def key(collection, uid, child=False):
    # Legacy datastore Path.Element is a protobuf group, not a message field.
    element=b'\x0b'+sized(2,collection.encode())+sized(4,uid.encode())+b'\x0c'
    if child:element+=b'\x0b'+sized(2,b'child')+sized(4,b'1')+b'\x0c'
    return sized(14,element)


def record(payload, kind=1):
    # The census intentionally does not claim CRC verification.
    return b'\0'*4+len(payload).to_bytes(2,'little')+bytes([kind])+payload


class CensusTests(unittest.TestCase):
    def test_legacy_group_keys_and_nonnumeric_names(self):
        self.assertEqual(C.numeric_key(key('users','123')),('users','123'))
        self.assertEqual(C.numeric_key(key('user_vectors','123')),('user_vectors','123'))
        self.assertEqual(C.numeric_key(key('users','not-numeric')),('users',None))
        self.assertIsNone(C.numeric_key(key('users','1',child=True)))
        self.assertIsNone(C.numeric_key(key('unrelated','1')))

    def test_properties_never_supply_keys_or_leak_to_report(self):
        with tempfile.TemporaryDirectory() as folder:
            snapshot=Path(folder);base=snapshot/'firestore_export/all_namespaces/all_kinds';base.mkdir(parents=True)
            data=b''
            for collection,uid in [('users','1'),('users','2'),('user_vectors','1'),('user_vectors','3')]:
                # Property bytes are opaque to this inventory and need not be decodable.
                entity=sized(13,key(collection,uid))+sized(15,b'private-marker\xff\xff')
                data+=record(entity)
            # A property containing a key-like sequence must not become a participant.
            data+=record(sized(13,key('unrelated','1'))+sized(15,key('users','999')))
            (base/'output-0').write_bytes(data)
            result=C.census(snapshot)
            self.assertEqual((result['numeric_users'],result['numeric_user_vectors']),(2,2))
            self.assertEqual((result['missing_vector_keys'],result['orphan_vector_keys']),(1,1))
            self.assertEqual(result['profile_properties_decoded'],0)
            self.assertFalse(result['crc_verified'])
            self.assertNotIn('private-marker',json.dumps(result))
            self.assertNotIn('999',json.dumps(result))

    def test_fragmented_record_reassembles_before_key_parse(self):
        entity=sized(13,key('users','42'))
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'output-0';path.write_bytes(record(entity[:5],2)+record(entity[5:],4))
            self.assertEqual(list(C.records(path)),[entity])

    def test_invalid_group_or_truncated_record_is_refused(self):
        with self.assertRaises(ValueError):list(C.fields(b'\x0b\x14'))
        with self.assertRaises(ValueError):list(C.fields(b'\x0b'))
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'output-0';path.write_bytes(record(b'abc')[:-1])
            with self.assertRaises(ValueError):list(C.records(path))
