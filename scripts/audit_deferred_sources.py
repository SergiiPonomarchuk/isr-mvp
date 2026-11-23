"""Read-only provenance review of the16 frozen deferred profiles and user archives."""
import argparse, hashlib, json, sys
from pathlib import Path
import inventory_values_grounding as I
import audit_db_completeness as A

def evidence(uid,current,historical):
    if historical is None:return {'state':'profile_not_in_archive'}
    result={'state':'no_verified_grounding','narrative_matches_current':isinstance(current.get('values_description'),str) and current['values_description']==historical.get('values_description')}
    tax=historical.get('values_taxonomy');meta=tax.get('meta') if isinstance(tax,dict) else None
    result['available_metadata_fields']=[k for k in ('version','uid','hash','gl_cs','overall_grounding','timestamp','vector_id','overall_confidence') if isinstance(meta,dict) and k in meta]
    try:result['values_match_current']=I.digest(I.flattened(tax))==I.digest(I.flattened(current.get('values_taxonomy')))
    except (ValueError,TypeError):result['values_match_current']=False
    if not isinstance(meta,dict):result['reason']='metadata_absent';return result
    reason=I.provenance(meta,uid,current.get('values_description'))
    if reason:result['reason']=reason;return result
    try:I.pairs_from_metadata(meta)
    except ValueError:result['reason']='invalid_grounding_metadata';return result
    result['state']='verified_grounding_same_values' if result['values_match_current'] else 'grounding_present_but_values_differ'
    return result

def archives(folders,current):
    out=[]
    for folder in folders:
        folder=Path(folder);manifest=A.G_json((folder/'manifest.json').read_bytes())
        if manifest.get('project')!=I.LIVE_PROJECT or manifest.get('script')!='scripts/backup_firestore.py (R0)' or not manifest.get('finished_utc'):raise ValueError('invalid_backup_manifest')
        found={};h=hashlib.sha256();count=0;seen=set()
        with (folder/'users.jsonl').open('rb') as f:
            for line in f:
                h.update(line);r=A.G_json(line);parts=r.get('path','').split('/')
                if len(parts)!=2 or parts[0]!='users' or not isinstance(r.get('data'),dict) or parts[1] in seen:raise ValueError('invalid_user_archive')
                seen.add(parts[1]);count+=1
                if parts[1] in current:found[parts[1]]={k:r['data'][k] for k in I.FIELDS if k in r['data']}
        if count!=manifest.get('documents',{}).get('users'):raise ValueError('archive_count_mismatch')
        out.append({'finished_utc':manifest['finished_utc'],'users_file_sha256':h.hexdigest(),'users_count':count,'evidence':{uid:evidence(uid,u,found.get(uid)) for uid,u in sorted(current.items())}})
    return out

def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--project',required=True);p.add_argument('--i-know-this-is-live',action='store_true',dest='live');p.add_argument('--artifact',action='append',default=[]);p.add_argument('--backup',action='append',default=[]);p.add_argument('--report',required=True);a=p.parse_args(argv)
    try:
        I.check_target(a.project,a.live)
        if Path(a.report).exists():raise ValueError('existing_report')
        scope=A.G_json((Path(__file__).resolve().parents[1]/'specs/tasks/Values-grounding-restoration-scope.json').read_bytes());ids=sorted(scope['deferred'])
        sources,receipts=I.load_artifacts(a.artifact)
        if any('error' in x for x in receipts):raise ValueError('invalid_source')
        from google.cloud import firestore
        db=firestore.Client(project=a.project)
        try:
            snaps=db.get_all([db.collection('users').document(uid) for uid in ids],field_paths=I.FIELDS,timeout=60)
            current={s.id:s.to_dict() for s in snaps if s.exists}
        finally:db.close()
        if set(current)!=set(ids):raise ValueError('deferred_profile_missing')
        r={'version':'deferred-source-audit-1','project':a.project,'retained_source_rows':[I.classify(uid,current[uid],sources.get(uid,[])) for uid in ids],'source_receipts':receipts,'archives':archives(a.backup,current),'production_writes':0,'provider_calls':0}
        I.save_report(r,a.report)
        print(json.dumps({'deferred_profiles':len(ids),'archives_checked':len(r['archives']),'verified_same_values_candidates':sum(v['state']=='verified_grounding_same_values' for x in r['archives'] for v in x['evidence'].values()),'production_writes':0,'provider_calls':0}));return 0
    except Exception as error:
        print(json.dumps({'stopped':True,'error_class':type(error).__name__}),file=sys.stderr);return 1

if __name__=='__main__':sys.exit(main())
