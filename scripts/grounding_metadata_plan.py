"""Grounding-only plans and recovery journal. No provider calls or live target selection."""
from __future__ import annotations
from contextlib import contextmanager
import copy
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
import inventory_values_grounding as I
from vectorizer.values_metadata import metadata_for_firestore, metadata_from_firestore

PLAN_VERSION = 'grounding-metadata-plan-1'
FIELD = 'values_taxonomy.meta'
META_KEYS = {'version','uid','hash','gl_cs','overall_grounding'}
STATES = {'intent','applied','reconciled','rollback_intent','rolled_back'}


class GuardError(Exception):
    """Fixed, content-free error codes only."""


def require(value, code):
    if not value:
        raise GuardError(code)


def strict_json(data):
    def unique(pairs):
        result={}
        for k,v in pairs:
            require(k not in result,'duplicate_json_key')
            result[k]=v
        return result
    def constant(_):
        raise GuardError('invalid_json_number')
    try:
        return json.loads(data,object_pairs_hook=unique,parse_constant=constant)
    except (ValueError,UnicodeError):
        raise GuardError('invalid_json') from None


def stamp(value):
    if callable(getattr(value,'rfc3339',None)):
        return value.rfc3339()
    return value.astimezone(dt.timezone.utc).isoformat().replace('+00:00','Z')


def load_sources(paths, scope):
    index,summaries=I.load_artifacts(paths)
    require(not any(s.get('error') or s.get('invalid_entry_ids') for s in summaries),'invalid_source_file')
    require(sorted(s['file_sha256'] for s in summaries)==sorted(scope['artifact_hashes']),'source_files_changed')
    return index


def minimal_metadata(uid, raw):
    require(isinstance(raw,dict) and isinstance(raw.get('meta'),dict),'invalid_source_entry')
    m=raw['meta']
    require(type(m.get('uid')) in (int,str) and str(m['uid'])==uid,'source_uid_mismatch')
    pairs=I.pairs_from_metadata(m)
    require(isinstance(m.get('hash'),str) and re.fullmatch('[0-9a-f]{40}',m['hash']),'missing_source_hash')
    return metadata_for_firestore(dict(version='1.0',uid=int(uid),hash=m['hash'],gl_cs=pairs))


def source_values_hashes(raw):
    try:
        I.validate_vector_schema(raw,is_step2=True)
        canonical=copy.deepcopy(raw);canonical['meta']['version']='1.0'
        direct=dict(domains=raw['core_values']['domains'],
                    items={f'd{i+1}':v for i,v in enumerate(raw['core_values']['items'])},
                    conflict_resolution=raw['conflict_resolution'],contextual_shifts=raw['contextual_shifts'])
        return {I.digest(I.flattened(I.format_for_firestore(canonical))),I.digest(I.flattened(direct))}
    except (ValueError,TypeError,KeyError):
        raise GuardError('source_values_layout_changed') from None


def matches_base(snapshot, entry):
    require(snapshot.exists,'profile_missing')
    data=snapshot.to_dict()
    require(type(data.get('uid')) in (int,str) and str(data['uid'])==entry['uid'],'profile_uid_changed')
    narrative=data.get('values_description')
    require(isinstance(narrative,str) and hashlib.sha1(narrative.encode()).hexdigest()==entry['narrative_sha1'],'narrative_changed')
    try:
        require(I.digest(I.flattened(data.get('values_taxonomy')))==entry['values_sha256'],'values_changed')
    except (ValueError,TypeError):
        raise GuardError('values_changed') from None
    return data


def before_meta(data,entry):
    taxonomy=data['values_taxonomy']
    return ('meta' in taxonomy)==entry['before_meta_present'] and taxonomy.get('meta') is None


def build_plan(inventory_bytes,scope,sources,store):
    require(hashlib.sha256(inventory_bytes).hexdigest()==scope['inventory_sha256'],'inventory_changed')
    inventory=strict_json(inventory_bytes)
    require(inventory.get('complete') and inventory.get('project')==scope['project'],'inventory_target_mismatch')
    rows=inventory['rows'];require(len({r['uid'] for r in rows})==len(rows),'duplicate_inventory_id')
    selected=sorted((r for r in rows if r['state']=='recoverable_from_artifact' and r['uid'] not in scope['deferred']),key=lambda r:r['uid'])
    require(len(selected)==scope['expected_candidates'],'candidate_count_changed')
    require(I.digest([r['uid'] for r in selected])==scope['candidate_uids_sha256'],'candidate_ids_changed')
    require(all(re.fullmatch('[0-9]{1,32}',r['uid']) for r in selected),'invalid_profile_id')
    snapshots=store.read_many([r['uid'] for r in selected])
    entries,conflicts=[],[]
    for row in selected:
        uid=row['uid']
        try:
            snap=snapshots[uid];require(snap.exists,'profile_missing')
            if row.get('precise_update_time'):
                require(stamp(snap.update_time)==row['precise_update_time'],'profile_update_time_changed')
            else:
                require(snap.update_time.isoformat()==row['update_time'],'profile_update_time_changed')
                require(getattr(snap.update_time,'nanosecond',0)%1000==0,'inventory_time_precision_insufficient')
            data=snap.to_dict();taxonomy=data.get('values_taxonomy')
            require(isinstance(taxonomy,dict) and taxonomy.get('meta') is None,'metadata_already_present')
            require(I.digest(I.flattened(taxonomy))==row['taxonomy_sha256'],'values_changed')
            verified=I.classify(uid,data,sources.get(uid,[]))
            require(verified['state']=='recoverable_from_artifact','source_provenance_changed')
            candidates=[]
            for source in sources.get(uid,[]):
                if I.classify(uid,data,[source])['state']!='recoverable_from_artifact':continue
                raw=source['raw'];metadata=minimal_metadata(uid,raw)
                candidates.append((metadata,dict(file_sha256=source['file_sha256'],entry_sha256=I.digest(raw),source_version=raw['meta']['version'])))
            require(candidates and len({I.digest(m) for m,_ in candidates})==1,'grounding_source_conflict')
            meta=candidates[0][0]
            entries.append(dict(uid=uid,before_update_time=stamp(snap.update_time),
                before_meta_present='meta' in taxonomy,values_sha256=row['taxonomy_sha256'],
                narrative_sha1=meta['hash'],new_meta=meta,
                source_refs=sorted((ref for _,ref in candidates),key=lambda ref:(ref['file_sha256'],ref['entry_sha256']))))
        except (GuardError,ValueError,KeyError,TypeError) as error:
            code=str(error) if isinstance(error,GuardError) else 'invalid_candidate'
            conflicts.append(dict(uid=uid,reason=code))
    payload=dict(version=PLAN_VERSION,project=scope['project'],scope_sha256=I.digest(scope),
                 inventory_sha256=scope['inventory_sha256'],artifact_hashes=scope['artifact_hashes'],entries=entries)
    ready=not conflicts and len(entries)==scope['expected_candidates']
    return dict(version=PLAN_VERSION,ready=ready,proposed=len(entries),expected=scope['expected_candidates'],
                conflicts=conflicts,payload=payload if ready else None,plan_sha256=I.digest(payload) if ready else None)


def validate_plan(plan,scope,sources=None):
    require(plan.get('ready') is True and isinstance(plan.get('payload'),dict),'plan_not_ready')
    p=plan['payload'];require(I.digest(p)==plan.get('plan_sha256'),'plan_hash_mismatch')
    require(p.get('version')==PLAN_VERSION and p.get('project')==scope['project'],'plan_target_mismatch')
    require(p.get('scope_sha256')==I.digest(scope) and p.get('inventory_sha256')==scope['inventory_sha256'],'scope_changed')
    require(sorted(p.get('artifact_hashes',[]))==sorted(scope['artifact_hashes']),'source_binding_changed')
    entries=p.get('entries',[]);require(len(entries)==scope['expected_candidates'],'plan_count_changed')
    require(len({e['uid'] for e in entries})==len(entries),'duplicate_plan_id')
    require(I.digest(sorted(e['uid'] for e in entries))==scope['candidate_uids_sha256'],'candidate_ids_changed')
    for e in entries:
        uid=e.get('uid');require(isinstance(uid,str) and re.fullmatch('[0-9]{1,32}',uid) and uid not in scope['deferred'],'deferred_or_invalid_id')
        require(set(e)=={'uid','before_update_time','before_meta_present','values_sha256','narrative_sha1','new_meta','source_refs'},'unexpected_plan_field')
        require(type(e['before_meta_present']) is bool and isinstance(e['before_update_time'],str),'invalid_before_state')
        require(re.fullmatch('[0-9a-f]{64}',e['values_sha256']) and re.fullmatch('[0-9a-f]{40}',e['narrative_sha1']),'invalid_digest')
        m=e['new_meta'];require(isinstance(m,dict) and set(m)==META_KEYS,'unexpected_metadata_field')
        require(type(m['uid']) is int and str(m['uid'])==uid and m['hash']==e['narrative_sha1'],'metadata_identity_mismatch')
        decoded=metadata_from_firestore(m);require(I.finite_number(m['overall_grounding']) and decoded['overall_grounding']==m['overall_grounding'],'incorrect_overall_grounding')
        require(e['source_refs'],'missing_source_binding')
        if sources is not None:
            matched=[]
            for source in sources.get(uid,[]):
                raw=source.get('raw')
                if not isinstance(raw,dict) or not isinstance(raw.get('meta'),dict):continue
                ref=dict(file_sha256=source['file_sha256'],entry_sha256=I.digest(raw),source_version=raw['meta'].get('version'))
                if ref in e['source_refs']:
                    require(minimal_metadata(uid,raw)==m and e['values_sha256'] in source_values_hashes(raw),'source_derivation_changed')
                    matched.append(ref)
            require(sorted(matched,key=I.digest)==sorted(e['source_refs'],key=I.digest),'source_entry_changed')
    return entries


@contextmanager
def journal_lock(path):
    path=Path(path);path.parent.mkdir(parents=True,exist_ok=True)
    lock=path.with_name(path.name+'.run-lock')
    descriptor=os.open(lock,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600)
    try:
        os.write(descriptor,str(os.getpid()).encode());os.fsync(descriptor)
        yield
    finally:os.close(descriptor);lock.unlink()


class Journal:
    def __init__(self,path,plan):
        self.path=Path(path);self.states={};self.previous='0'*64
        self.header=dict(version='grounding-metadata-journal-1',plan_sha256=plan['plan_sha256'],project=plan['payload']['project'])
        self.allowed={e['uid'] for e in plan['payload']['entries']}
        if not self.path.exists():
            self.path.parent.mkdir(parents=True,exist_ok=True)
            with self.path.open('x',encoding='utf-8'):pass
            self._write(dict(kind='header',**self.header))
        else:
            data=self.path.read_bytes();require(data and data.endswith(b'\n'),'incomplete_journal')
            for index,line in enumerate(data.splitlines()):
                record=strict_json(line);require(record.get('previous')==self.previous,'journal_chain_changed')
                require(I.digest(dict(payload=record['payload'],previous=self.previous))==record.get('sha256'),'journal_hash_changed')
                value=record['payload'];self.previous=record['sha256']
                if index==0:require(value==dict(kind='header',**self.header),'journal_binding_changed')
                else:self._accept(value)
    def _accept(self,value):
        require(value.get('uid') in self.allowed and value.get('state') in STATES,'invalid_journal_event')
        self.states[value['uid']]=value
    def _write(self,value):
        body=dict(payload=value,previous=self.previous);record={**body,'sha256':I.digest(body)}
        with self.path.open('a',encoding='utf-8') as out:
            out.write(json.dumps(record,separators=(',',':'),allow_nan=False)+'\n');out.flush();os.fsync(out.fileno())
        self.previous=record['sha256']
    def append(self,uid,state,**fields):
        value={**self.states.get(uid,{}),**fields,'uid':uid,'state':state}
        self._accept(value);self._write(value)


def same_metadata(actual,desired):
    try:return I.digest(actual)==I.digest(desired)
    except (ValueError,TypeError):return False


def check_post(snapshot,entry,event):
    data=matches_base(snapshot,entry)
    require(same_metadata(data['values_taxonomy'].get('meta'),entry['new_meta']),'metadata_changed')
    require(stamp(snapshot.update_time)==event.get('post_time'),'post_update_time_changed')
    return data


def run_apply(store,plan,journal,progress=None):
    entries=plan['payload']['entries'];snapshots=store.read_many([e['uid'] for e in entries])
    actions,conflicts=[],[]
    for e in entries:
        uid=e['uid'];event=journal.states.get(uid,{})
        try:
            snap=snapshots[uid];data=matches_base(snap,e);state=event.get('state')
            if state in ('applied','reconciled'):
                check_post(snap,e,event);actions.append(('skip',e,snap))
            elif state in (None,'intent','rolled_back'):
                if state=='intent' and same_metadata(data['values_taxonomy'].get('meta'),e['new_meta']):
                    actions.append(('reconcile',e,snap));continue
                require(before_meta(data,e),'before_metadata_changed')
                expected=event.get('rollback_time') if state=='rolled_back' else event.get('before_time',e['before_update_time'])
                require(stamp(snap.update_time)==expected,'profile_update_time_changed')
                actions.append(('write',e,snap))
            else:raise GuardError('unfinished_rollback')
        except (GuardError,ValueError,TypeError,KeyError) as error:
            conflicts.append(dict(uid=uid,reason=str(error) if isinstance(error,GuardError) else 'invalid_profile'))
    if conflicts:return dict(complete=False,write_attempts=0,confirmed_writes=0,conflicts=conflicts)
    attempts,confirmed,reconciled=0,0,0
    for index,(action,e,snap) in enumerate(actions,1):
        uid=e['uid']
        if action=='reconcile':
            journal.append(uid,'reconciled',post_time=stamp(snap.update_time),ownership='unproven')
            reconciled+=1
        elif action=='write':
            journal.append(uid,'intent',before_time=stamp(snap.update_time))
            attempts+=1
            try:
                written=store.compare_and_set(uid,e['new_meta'],snap)
                journal.append(uid,'applied',post_time=stamp(written),ownership='acknowledged')
                confirmed+=1
                fresh=store.read_many([uid])[uid]
                check_post(fresh,e,journal.states[uid])
            except Exception as error:
                reason=str(error) if isinstance(error,GuardError) else 'write_or_verification_unconfirmed'
                return dict(complete=False,write_attempts=attempts,confirmed_writes=confirmed,
                            conflicts=[dict(uid=uid,reason=reason)])
        if progress:progress(index)
    ambiguous=sum(v.get('state')=='reconciled' for v in journal.states.values())
    return dict(complete=True,write_attempts=attempts,confirmed_writes=confirmed,reconciled=reconciled,
                ambiguous_ownership=ambiguous,rollback_ready=ambiguous==0,conflicts=[])


def run_rollback(store,plan,journal,progress=None):
    entries=plan['payload']['entries'];snapshots=store.read_many([e['uid'] for e in entries])
    actions,conflicts=[],[]
    for e in entries:
        uid=e['uid'];event=journal.states.get(uid,{})
        try:
            snap=snapshots[uid];data=matches_base(snap,e);state=event.get('state')
            if state=='reconciled':raise GuardError('rollback_ownership_unproven')
            if state in ('applied','rollback_intent'):
                if state=='rollback_intent' and before_meta(data,e):
                    actions.append(('reconcile',e,snap));continue
                check_post(snap,e,event);actions.append(('restore',e,snap))
            elif state=='rolled_back':
                require(before_meta(data,e) and stamp(snap.update_time)==event.get('rollback_time'),'rollback_state_changed')
                actions.append(('skip',e,snap))
            elif state in (None,'intent'):
                require(before_meta(data,e) and stamp(snap.update_time)==event.get('before_time',e['before_update_time']),'rollback_unknown_write')
                actions.append(('skip',e,snap))
            else:raise GuardError('invalid_journal_state')
        except (GuardError,ValueError,TypeError,KeyError) as error:
            conflicts.append(dict(uid=uid,reason=str(error) if isinstance(error,GuardError) else 'invalid_profile'))
    if conflicts:return dict(complete=False,write_attempts=0,confirmed_writes=0,conflicts=conflicts)
    attempts,confirmed=0,0
    for index,(action,e,snap) in enumerate(actions,1):
        uid=e['uid']
        if action=='reconcile':
            journal.append(uid,'rolled_back',rollback_time=stamp(snap.update_time),rollback_reconciled=True)
        elif action=='restore':
            journal.append(uid,'rollback_intent')
            attempts+=1
            try:
                written=store.compare_and_set(uid,None if e['before_meta_present'] else store.delete_value,snap)
                journal.append(uid,'rolled_back',rollback_time=stamp(written))
                confirmed+=1
                fresh=store.read_many([uid])[uid];data=matches_base(fresh,e)
                require(before_meta(data,e) and stamp(fresh.update_time)==stamp(written),'rollback_verification_changed')
            except Exception as error:
                reason=str(error) if isinstance(error,GuardError) else 'rollback_unconfirmed'
                return dict(complete=False,write_attempts=attempts,confirmed_writes=confirmed,
                            conflicts=[dict(uid=uid,reason=reason)])
        if progress:progress(index)
    return dict(complete=True,write_attempts=attempts,confirmed_writes=confirmed,conflicts=[])


def verify(store,plan):
    entries=plan['payload']['entries'];snapshots=store.read_many([e['uid'] for e in entries]);counts=dict(desired=0,before=0,conflict=0);conflicts=[]
    for e in entries:
        try:
            data=matches_base(snapshots[e['uid']],e)
            if same_metadata(data['values_taxonomy'].get('meta'),e['new_meta']):counts['desired']+=1
            elif before_meta(data,e):counts['before']+=1
            else:raise GuardError('metadata_changed')
        except (GuardError,ValueError,TypeError,KeyError) as error:
            counts['conflict']+=1;conflicts.append(dict(uid=e['uid'],reason=str(error) if isinstance(error,GuardError) else 'invalid_profile'))
    return dict(complete=not conflicts,counts=counts,conflicts=conflicts,write_attempts=0)


class FirestoreStore:
    def __init__(self,client):
        from google.cloud import firestore
        self.client=client;self.delete_value=firestore.DELETE_FIELD
    def read_many(self,uids):
        result={}
        for start in range(0,len(uids),75):
            refs=[self.client.collection('users').document(uid) for uid in uids[start:start+75]]
            for snapshot in self.client.get_all(refs,field_paths=I.FIELDS,timeout=60):result[snapshot.id]=snapshot
        return result
    def compare_and_set(self,uid,metadata,snapshot):
        result=self.client.collection('users').document(uid).update(
            {FIELD:metadata},option=self.client.write_option(last_update_time=snapshot.update_time),retry=None,timeout=60)
        return result.update_time
