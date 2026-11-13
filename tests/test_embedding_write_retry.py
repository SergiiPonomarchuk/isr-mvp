"""Retry the same buffered write without another embedding API request."""
import sys
from pathlib import Path
import unittest
from unittest.mock import Mock

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from embed_people import commit_with_retry


class TransientError(Exception):
    pass


class CommitRetryTests(unittest.TestCase):
    def test_transient_failure_reuses_batch_and_succeeds(self):
        batch = Mock()
        batch.commit.side_effect = [TransientError(), TransientError(), ["saved"]]
        sleep = Mock()
        self.assertEqual(commit_with_retry(batch, (TransientError,), sleep), ["saved"])
        self.assertEqual(batch.commit.call_count, 3)
        self.assertTrue(all(c.kwargs == {"retry": None, "timeout": 120}
                            for c in batch.commit.call_args_list))
        self.assertEqual([c.args[0] for c in sleep.call_args_list], [2, 4])

    def test_permanent_error_propagates_immediately(self):
        batch, sleep = Mock(), Mock()
        batch.commit.side_effect = ValueError("permanent")
        with self.assertRaises(ValueError):
            commit_with_retry(batch, (TransientError,), sleep)
        self.assertEqual(batch.commit.call_count, 1)
        sleep.assert_not_called()

    def test_transient_retries_are_bounded(self):
        batch, sleep = Mock(), Mock()
        batch.commit.side_effect = TransientError()
        with self.assertRaises(TransientError):
            commit_with_retry(batch, (TransientError,), sleep)
        self.assertEqual(batch.commit.call_count, 6)
        self.assertEqual([c.args[0] for c in sleep.call_args_list], [2, 4, 8, 16, 30])
