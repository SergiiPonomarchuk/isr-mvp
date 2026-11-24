"""Independent offline tally/task audit of C2b supplied-fixture evidence; no DB/model imports."""
import argparse,json,math
from pathlib import Path
import isr_core
ROOT=Path(__file__).resolve().parents[1]
def check(report):
    problems=[]
    if report.get('status')!='completed':return ['report_incomplete']
    worker=report.get('worker',report)
    if worker.get('version')!='c2b-emulator-1':return ['format_unknown']
    cases=worker.get('cases',[])
    if sorted(c.get('members',0) for c in cases)!=[2,7,17]:problems.append('fixture_set')
    for case in cases:
        prefix='fixture_'+str(case.get('members'))+':'
        a=case.get('audit')
        if not isinstance(a,dict):problems.append(prefix+'audit_missing');continue
        rows=a.get('members',[]);ids=[str(m.get('uid')) for m in rows]
        if len(ids)!=len(set(ids)) or len(rows)!=case.get('joined_members') or len(rows)!=a.get('generation',{}).get('member_count'):problems.append(prefix+'membership')
        if a.get('generation',{}).get('publication_version')!='c2b-emulator-1':problems.append(prefix+'generation_version')
        weights={str(m.get('uid')):m.get('isr') for m in rows}
        if any(type(v) not in (int,float) or not math.isfinite(v) for v in weights.values()):problems.append(prefix+'weight');continue
        options=a.get('options',[]);expected=isr_core.tally(a.get('votes',{}),weights,len(options));actual=a.get('tally',{})
        if a.get('winner')!=expected['winner'] or actual.get('winner')!=expected['winner']:problems.append(prefix+'winner')
        if actual.get('excluded')!=expected['excluded'] or actual.get('note')!=expected['note']:problems.append(prefix+'exclusions')
        rounded=lambda x:math.floor(x*1000+.5)/1000
        scores=[rounded(x) for x in expected['scores']]
        if actual.get('scores')!=scores:problems.append(prefix+'scores')
        counted=[dict(x,weight=rounded(x['weight'])) for x in expected['counted']]
        if actual.get('counted')!=counted:problems.append(prefix+'counted')
        if actual.get('generation')!=a.get('generation'):problems.append(prefix+'tally_generation')
        winner=expected['winner']
        if winner is not None:
            fields=('step','in_charge_uid','in_charge_name','deadline')
            tasks=[{k:x.get(k) for k in fields} for x in a.get('tasks',[])]
            steps=[dict(step=x.get('step',''),in_charge_uid=str(x.get('in_charge_uid','')),in_charge_name=x.get('in_charge_name',''),deadline=x.get('deadline')) for x in options[winner].get('description',[])]
            if tasks!=steps:problems.append(prefix+'tasks')
    return problems

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--report',required=True,type=Path);a=p.parse_args();file=a.report.resolve()
    if not file.is_relative_to(ROOT/'specs/tasks/M3-c2b-evidence'):raise ValueError('Evidence path refused')
    problems=check(json.loads(file.read_text(encoding='utf-8')));print(json.dumps({'complete':not problems,'problems':problems,'database_reads':0,'writes':0,'requests':0}));return bool(problems)
if __name__=='__main__':raise SystemExit(main())
