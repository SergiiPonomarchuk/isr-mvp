"""Values metadata contract using synthetic data and mocked providers only."""
import copy
import json
import unittest
from unittest.mock import patch
from vectorizer import pipeline, run
from vectorizer.values_metadata import (
    validate_gl_cs, overall_grounding, finalized_metadata,
    metadata_for_firestore, metadata_from_firestore,
)

GROUNDING = [10, 20, 30, 40, 10, 20, 30, 40, 11, 22]


def meta():
    return dict(version="1.0", uid=7, vector_id="uid_7_1", timestamp="synthetic",
                hash="synthetic-hash", overall_confidence=60,
                overall_grounding=999, gl_cs=[[g, 60] for g in GROUNDING])


def vector(step2=False):
    return dict(meta=meta(), core_values=dict(domains=[None] * 10,
                items=[None] * 10 if step2 else None), conflict_resolution=[0] * 36,
                contextual_shifts={k: [0] * 10 for k in ("work", "family", "private", "crisis")})


class MetadataTests(unittest.TestCase):
    def test_plain_mean_zeros_maxima_fraction_and_no_confidence_weights(self):
        self.assertEqual(overall_grounding([[0, 100]] * 10), 0)
        self.assertEqual(overall_grounding([[100, 0]] * 10), 100)
        pairs = [[g, i * 10] for i, g in enumerate(GROUNDING)]
        self.assertEqual(overall_grounding(pairs), 23.3)
        pairs[0][0] = 10.25
        self.assertEqual(overall_grounding(pairs), 23.325)

    def test_bad_pairs_fail_without_inference_or_padding(self):
        for bad in (None, {}, [], [[0, 0]] * 9, [[0, 0]] * 11, [[0]] * 10):
            with self.subTest(bad_shape=type(bad).__name__), self.assertRaises(ValueError):
                validate_gl_cs(bad)
        for value in (True, False, None, "10", -1, 101, float('nan'), float('inf')):
            for slot in (0, 1):
                pairs = [[20, 60] for _ in range(10)]
                pairs[3][slot] = value
                with self.subTest(slot=slot, bad_type=type(value).__name__), self.assertRaises(ValueError):
                    validate_gl_cs(pairs)

    def test_canonical_metadata_overwrites_model_summary_without_mutating_source(self):
        source = meta()
        before = copy.deepcopy(source)
        result = finalized_metadata(source)
        self.assertEqual(result['overall_grounding'], 23.3)
        self.assertEqual(result['overall_confidence'], 60)
        self.assertEqual(source, before)
        result['gl_cs'][0][0] = 0
        self.assertEqual(source, before)
        for version in (None, '2.1', 'unknown'):
            with self.assertRaises(ValueError):
                finalized_metadata({**meta(), 'version': version})

    def test_firestore_map_round_trip_and_strict_shape(self):
        source = meta()
        encoded = metadata_for_firestore(source)
        self.assertEqual(encoded['gl_cs']['d1'], dict(grounding=10, confidence=60))
        self.assertEqual(set(encoded['gl_cs']), {f'd{i}' for i in range(1, 11)})
        self.assertEqual(metadata_from_firestore(encoded), finalized_metadata(source))
        self.assertEqual(json.loads(json.dumps(encoded)), encoded)
        for mutate in (
            lambda v: v['gl_cs'].pop('d10'),
            lambda v: v['gl_cs'].update(d11=dict(grounding=1, confidence=1)),
            lambda v: v['gl_cs']['d1'].pop('confidence'),
            lambda v: v['gl_cs']['d1'].update(extra=1),
            lambda v: v['gl_cs']['d1'].update(grounding=True),
        ):
            damaged = copy.deepcopy(encoded)
            mutate(damaged)
            with self.assertRaises(ValueError):
                metadata_from_firestore(damaged)
        with self.assertRaises(ValueError):
            metadata_from_firestore(source)

    def test_formatter_preserves_flattened_values_and_adds_safe_metadata(self):
        value = vector(True)
        value['core_values']['domains'] = [None, 10, 20, 30, 40, 50, 60, 70, 80, 90]
        value['core_values']['items'] = [list(range(n)) for n in pipeline.DOMAIN_ITEM_COUNTS.values()]
        before = copy.deepcopy(value)
        result = run.format_for_firestore(value)
        self.assertEqual(set(result), {'domains', 'items', 'contextual_shifts', 'conflict_resolution', 'meta'})
        self.assertEqual(result['domains'], before['core_values']['domains'])
        self.assertEqual(result['items'], {f'd{i+1}': row for i, row in enumerate(before['core_values']['items'])})
        for key in ('conflict_resolution', 'contextual_shifts'):
            self.assertEqual(result[key], before[key])
        self.assertEqual(result['meta']['overall_grounding'], 23.3)
        self.assertEqual(value, before)
        # Metadata contains no array-of-arrays, which Firestore cannot store.
        self.assertTrue(all(isinstance(v, dict) for v in result['meta']['gl_cs'].values()))
        with self.assertRaises(ValueError):
            run.format_for_firestore({k: v for k, v in value.items() if k != 'meta'})

    def test_two_stage_pipeline_host_computes_both_summaries_and_version(self):
        first, second = vector(), vector(True)
        first['meta']['overall_grounding'] = 'ignore model summary'
        second['meta'].update(version='2.1', gl_cs=[[100, 1]] * 10, overall_grounding=-100)
        with patch.object(pipeline, 'call_gemini_api', side_effect=[first, second]) as provider, patch.object(pipeline.time, 'sleep'):
            result = pipeline.run_vectorization_pipeline('7', 'Synthetic values narrative.', 'unit-test-not-a-key')
        self.assertEqual(provider.call_count, 2)
        prompt = provider.call_args_list[1].kwargs['user_prompt']
        stage1 = json.loads(prompt.split('STEP 1 JSON:\n', 1)[1].split('\n\nValues Description:', 1)[0])
        for value in (stage1, result):
            self.assertEqual(value['meta']['version'], '1.0')
            self.assertEqual(value['meta']['overall_grounding'], 23.3)
            self.assertEqual(value['meta']['overall_confidence'], 60)
            self.assertEqual(value['meta']['gl_cs'], [[g, 60] for g in GROUNDING])
            self.assertEqual(value['core_values']['domains'], [None] * 10)
        self.assertEqual(result['meta']['uid'], 7)
        self.assertIn('do not generate or estimate', provider.call_args_list[0].kwargs['system_prompt'])
        self.assertNotIn('"version": "2.1"', provider.call_args_list[1].kwargs['system_prompt'])

    def test_invalid_step_one_metadata_refuses_before_second_stage(self):
        first = vector()
        first['meta']['gl_cs'][0][0] = True
        with patch.object(pipeline, 'call_gemini_api', return_value=first) as provider, patch.object(pipeline.time, 'sleep'):
            with self.assertRaises(ValueError):
                pipeline.run_vectorization_pipeline('7', 'Synthetic.', 'unit-test-not-a-key')
        self.assertEqual(provider.call_count, 1)
