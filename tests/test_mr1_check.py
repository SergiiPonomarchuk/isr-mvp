"""Hand-calculated independent-auditor cases; no database or model access."""
import copy
import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import ai_config as AI
import mr1_check as C


def fixture():
    basis = lambda n: [1 if j == n else 0 for j in range(768)]
    ref = dict(id='r', alpha=1, aspect_id='a',
               relevance=dict(D=0, G=0, S=.8, X=.2), aggregation=dict(R=.6, E=.2, C=.2), mu=40, sigma=30)
    model = dict(refs=[ref], relevance=ref['relevance'], aggregation=ref['aggregation'], mu=40, sigma=30)
    bundle = dict(version=C.VERSION, model=model, scope='building', aspects={'a': dict(vector=basis(0), demographics={})})
    users = {str(i): dict(uid=i, birthDate='1990-01-01', skills=[], features=[], post=[],
                         geography=[dict(type='home', geo=[47.59, 7.61])], socialRelations=[]) for i in (1, 2)}
    users['1']['socialRelations'] = [dict(relative=2, type='spouse')]
    vectors = {str(i): dict(profile_vector=basis(i-1), experience_vectors={}, embedding_model=AI.EMBED_MODEL,
                           embedding_dims=768, embedding_template=AI.EMBED_TEMPLATE_VERSION) for i in (1, 2)}
    rows = []
    # Mean R = (.8 + .06)/2 = .43; E and C both normalize to 1.
    for uid, raw, direct, social, tie, norm, isr in [('1', .8, .8, 0, 0, 1.860, 1.516), ('2', .06, 0, .06, .3, .140, .484)]:
        rows.append(dict(user_id=uid, cohort='A' if uid == '1' else 'B', relevance_score=raw, direct_relevance=direct,
                         social_addition=social, social_tie=tie, social_source=None if uid == '1' else '1',
                         education_expertise=1, experience_expertise=0, expertise_score=1,
                         D_score=0, G_score=0, S_score=1 if uid == '1' else 0, X_score=tie,
                         normalized_relevance=norm, normalized_experience=1, normalized_contribution=1, isr_score=isr,
                         social_links={'2': .3} if uid == '1' else {},
                         mr1_evidence={'r': dict(D=1, G=1, S=1 if uid == '1' else 0, X=0, education=0, experience=0)}))
    issue = dict(scoring_version=C.VERSION, mr1_model=bundle, created_at='2026-11-16T12:00:00Z', location=[47.59, 7.61],
                 relevance_scores={'1': .8, '2': .06}, isr_scores={'1': 1.516, '2': .484})
    return [issue, dict(issue, participants=['1', '2']), dict(member_count=2), rows, users, vectors]


class AuditTests(unittest.TestCase):
    def test_manual_two_person_public_and_raw_ceiling(self):
        self.assertEqual(C.audit(*fixture())['problems'], [])
        values = fixture()
        values[3][1]['direct_relevance'] = .00001
        self.assertIn('2:direct_relevance', C.audit(*values)['problems'])

    def test_source_evidence_cache_and_membership_corruption(self):
        for tamper, expected in [
            (lambda f: f[3][0]['mr1_evidence']['r'].update(S=.2), '1:evidence:r:S'),
            (lambda f: f[0]['isr_scores'].update({'2': 9}), 'public:isr_scores'),
            (lambda f: f[3].pop(), 'public:membership')
        ]:
            values = copy.deepcopy(fixture())
            tamper(values)
            self.assertIn(expected, C.audit(*values)['problems'])

    def test_unknown_version_never_uses_legacy_math(self):
        values = fixture()
        values[0]['scoring_version'] = 'unknown'
        with self.assertRaises(ValueError):
            C.audit(*values)


class CBCPolicyTests(unittest.TestCase):
    def test_current_and_frozen_legacy_education(self):
        issue, _, _, _, users, vectors = fixture()
        user, vec = users['1'], vectors['1']
        user['skills'] = [dict(id='e', type='education', educationLevel='Vocational')]
        vec['experience_vectors'] = {'e': [.5, 3 ** .5 / 2] + [0] * 766}
        bundle = issue['mr1_model']
        current = C.evaluate(user, vec, bundle, issue['location'], issue['created_at'])
        self.assertAlmostEqual(current['aspects']['r']['education'], .5)
        bundle['version'] = C.LEGACY_VERSION
        bundle['model']['refs'][0]['cbc_adjustment'] = .9
        old = C.evaluate(user, vec, bundle, issue['location'], issue['created_at'])
        self.assertAlmostEqual(old['aspects']['r']['education'], 2 * .5 ** 1.8)

    def test_new_adjustments_and_root_bundle_mismatch_refused(self):
        for field in ('cbc_adjustment', 'CBC_adjustment_factor', 'cbc_adjustment_factor', 'cbc'):
            f = fixture()
            f[0]['mr1_model']['model']['refs'][0][field] = 1
            with self.assertRaises(ValueError):
                C.audit(*f)
        f = fixture()
        f[0]['mr1_model']['version'] = C.LEGACY_VERSION
        with self.assertRaises(ValueError):
            C.audit(*f)
