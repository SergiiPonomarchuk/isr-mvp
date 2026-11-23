"""R1 three-field metadata recovery using the existing guarded journal engine."""
import copy
import datetime as dt
import hashlib
import re
import grounding_metadata_plan as G
import inventory_values_grounding as I

VERSION='optional-metadata-plan-1'
EXTRA=('timestamp','vector_id','overall_confidence')
PATHS=tuple('values_taxonomy.meta.'+k for k in EXTRA)
ENTRY_KEYS={'uid','before_update_time','before_meta_present','values_sha256','narrative_sha1','before_meta','new_meta','source_refs'}

def extras(meta):
    G.require(isinstance(meta,dict) and all(k in meta for k in EXTRA),'optional_source_fields_missing')
    stamp=meta['timestamp'];identifier=meta['vector_id'];confidence=meta['overall_confidence']
    try:
        valid=isinstance(stamp,str) and len(stamp)<=64 and dt.datetime.fromisoformat(stamp.replace('Z','+00:00')).tzinfo is not None
    except (ValueError,TypeError):valid=False
    G.require(valid,'invalid_historical_timestamp')
    G.require(isinstance(identifier,str) and re.fullmatch(r'[A-Za-z0-9_.:\-]{1,128}',identifier),'invalid_vector_identifier')
    G.require(I.finite_number(confidence) and 0<=confidence<=100,'invalid_overall_confidence')
    return {k:copy.deepcopy(meta[k]) for k in EXTRA}

def validate_scope(scope):
    G.require(scope.get('version')=='optional-metadata-scope-1','invalid_scope_version')
    G.require(type(scope.get('expected_candidates')) is int and 1<=scope['expected_candidates']<=500,'invalid_scope_count')
    for key in ('grounding_plan_sha256','grounding_plan_file_sha256','grounding_scope_sha256','candidate_uids_sha256'):
        G.require(isinstance(scope.get(key),str) and re.fullmatch('[0-9a-f]{64}',scope[key]),'invalid_scope_digest')

def validate_plan(plan,scope,sources=None):
    validate_scope(scope)
    G.require(plan.get('ready') is True and isinstance(plan.get('payload'),dict),'plan_not_ready')
    p=plan['payload'];G.require(I.digest(p)==plan.get('plan_sha256'),'plan_hash_mismatch')
    G.require(p.get('version')==VERSION and p.get('project')==scope['project'],'plan_target_mismatch')
    G.require(p.get('scope_sha256')==I.digest(scope) and p.get('grounding_plan_sha256')==scope['grounding_plan_sha256'],'scope_changed')
    G.require(p.get('artifact_hashes')==scope['artifact_hashes'],'source_binding_changed')
    entries=p.get('entries',[])
    G.require(len(entries)==scope['expected_candidates'] and len({e['uid'] for e in entries})==len(entries),'plan_count_or_duplicate_changed')
    G.require(I.digest(sorted(e['uid'] for e in entries))==scope['candidate_uids_sha256'],'candidate_ids_changed')
    for e in entries:
        uid=e['uid'];G.require(isinstance(uid,str) and re.fullmatch('[0-9]{1,32}',uid) and uid not in scope['deferred'],'deferred_or_invalid_id')
        G.require(set(e)==ENTRY_KEYS and e['before_meta_present'] is True and isinstance(e['before_update_time'],str),'invalid_entry_shape')
        G.require(re.fullmatch('[0-9a-f]{64}',e['values_sha256']) and re.fullmatch('[0-9a-f]{40}',e['narrative_sha1']),'invalid_digest')
        before,new=e['before_meta'],e['new_meta']
        G.require(isinstance(before,dict) and set(before)==G.META_KEYS and type(before.get('uid')) is int and str(before['uid'])==uid and before.get('hash')==e['narrative_sha1'],'invalid_before_metadata')
        G.require(G.same_metadata(before,G.minimal_metadata(uid,{'meta':before})),'invalid_before_metadata')
        G.require(isinstance(new,dict) and set(new)==G.META_KEYS|set(EXTRA),'unexpected_metadata_field')
        G.require(G.same_metadata({k:new[k] for k in G.META_KEYS},before),'grounding_metadata_changed')
        triplet=extras(new)
        G.require(isinstance(e['source_refs'],list) and e['source_refs'],'missing_source_binding')
        if sources is not None:
            matched=[]
            for source in sources.get(uid,[]):
                raw=source.get('raw');meta=raw.get('meta') if isinstance(raw,dict) else None
                if not isinstance(meta,dict):continue
                ref={'file_sha256':source['file_sha256'],'entry_sha256':I.digest(raw),'source_version':meta.get('version')}
                if ref not in e['source_refs']:continue
                G.require(G.same_metadata(G.minimal_metadata(uid,raw),before) and e['values_sha256'] in G.source_values_hashes(raw),'source_derivation_changed')
                G.require(G.same_metadata(extras(meta),triplet),'optional_source_derivation_changed')
                matched.append(ref)
            G.require(sorted(matched,key=I.digest)==sorted(e['source_refs'],key=I.digest),'source_entry_changed')
    return entries

def build_plan(grounding_bytes,grounding_scope,scope,sources,store):
    validate_scope(scope)
    G.require(hashlib.sha256(grounding_bytes).hexdigest()==scope['grounding_plan_file_sha256'],'grounding_plan_file_changed')
    G.require(I.digest(grounding_scope)==scope['grounding_scope_sha256'],'grounding_scope_changed')
    original=G.strict_json(grounding_bytes);old=G.validate_plan(original,grounding_scope,sources)
    G.require(original['plan_sha256']==scope['grounding_plan_sha256'],'grounding_plan_changed')
    G.require(original['payload']['project']==scope['project'] and len(old)==scope['expected_candidates'],'scope_target_or_count_changed')
    G.require(I.digest(sorted(e['uid'] for e in old))==scope['candidate_uids_sha256'],'candidate_ids_changed')
    snapshots=store.read_many([e['uid'] for e in old]);entries=[];conflicts=[]
    for e in old:
        uid=e['uid']
        try:
            G.require(uid not in scope['deferred'],'deferred_id')
            snap=snapshots[uid];data=G.matches_base(snap,e)
            G.require(G.same_metadata(data['values_taxonomy'].get('meta'),e['new_meta']),'grounding_or_optional_metadata_already_changed')
            candidates=[]
            for source in sources.get(uid,[]):
                raw=source['raw'];m=raw.get('meta',{})
                ref={'file_sha256':source['file_sha256'],'entry_sha256':I.digest(raw),'source_version':m.get('version')}
                if ref in e['source_refs']:candidates.append(extras(m))
            G.require(candidates and len(candidates)==len(e['source_refs']) and len({I.digest(v) for v in candidates})==1,'ambiguous_optional_source')
            entries.append({'uid':uid,'before_update_time':G.stamp(snap.update_time),'before_meta_present':True,
                'values_sha256':e['values_sha256'],'narrative_sha1':e['narrative_sha1'],'before_meta':copy.deepcopy(e['new_meta']),
                'new_meta':{**copy.deepcopy(e['new_meta']),**candidates[0]},'source_refs':copy.deepcopy(e['source_refs'])})
        except (G.GuardError,ValueError,TypeError,KeyError) as error:
            conflicts.append({'uid':uid,'reason':str(error) if isinstance(error,G.GuardError) else 'invalid_candidate'})
    payload={'version':VERSION,'project':scope['project'],'scope_sha256':I.digest(scope),'grounding_plan_sha256':scope['grounding_plan_sha256'],'artifact_hashes':scope['artifact_hashes'],'entries':entries}
    ready=not conflicts and len(entries)==scope['expected_candidates']
    return {'version':VERSION,'ready':ready,'proposed':len(entries),'expected':scope['expected_candidates'],'conflicts':conflicts,'payload':payload if ready else None,'plan_sha256':I.digest(payload) if ready else None}

class SnapshotView:
    """Map only the verified base map to virtual null for the existing engine."""
    def __init__(self,snapshot,entry):
        self.original=snapshot;self.entry=entry;self.id=snapshot.id;self.exists=snapshot.exists;self.update_time=snapshot.update_time
    def to_dict(self):
        data=copy.deepcopy(self.original.to_dict())
        tax=data.get('values_taxonomy')
        if isinstance(tax,dict):
            actual=tax.get('meta')
            if G.same_metadata(actual,self.entry['before_meta']):tax['meta']=None
            elif not G.same_metadata(actual,self.entry['new_meta']):tax['meta']={'r1_metadata_conflict':True}
        return data

class EngineStore:
    def __init__(self,raw,plan):
        self.raw=raw;self.entries={e['uid']:e for e in plan['payload']['entries']};self.delete_value=raw.delete_value
    def read_many(self,uids):
        return {uid:SnapshotView(snap,self.entries[uid]) for uid,snap in self.raw.read_many(uids).items()}
    def compare_and_set(self,uid,metadata,snapshot):
        G.require(isinstance(snapshot,SnapshotView) and snapshot.id==uid,'invalid_snapshot_view')
        if metadata is None:patch={path:self.raw.delete_value for path in PATHS}
        else:
            G.require(G.same_metadata(metadata,self.entries[uid]['new_meta']),'unexpected_metadata_write')
            patch={path:metadata[key] for path,key in zip(PATHS,EXTRA)}
        return self.raw.patch(uid,patch,snapshot.original)

class FirestoreStore:
    def __init__(self,client):
        from google.cloud import firestore
        self.client=client;self.reader=G.FirestoreStore(client);self.delete_value=firestore.DELETE_FIELD
    def read_many(self,uids):return self.reader.read_many(uids)
    def patch(self,uid,updates,snapshot):
        G.require(set(updates)==set(PATHS),'unexpected_field_patch')
        return self.client.collection('users').document(uid).update(updates,option=self.client.write_option(last_update_time=snapshot.update_time),retry=None,timeout=60).update_time
