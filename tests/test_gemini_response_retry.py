"""Interrupted responses must use the existing bounded embedding retry."""
import collections
import http.client
import io
from pathlib import Path
import sys
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import embed_people
import gemini_api


class ResponseRetryTests(unittest.TestCase):
    def response(self, content=None, error=None):
        response = Mock()
        response.__enter__ = Mock(return_value=response)
        response.__exit__ = Mock(return_value=False)
        response.read = Mock(return_value=content, side_effect=error)
        return response

    def test_interrupted_response_retries_and_counts_request(self):
        broken = self.response(error=http.client.IncompleteRead(b"private", 42))
        good = self.response(b'{"embeddings":[{"values":[3,4]}]}')
        summary, sleep = collections.Counter(), Mock()
        def embed(texts, task, key):
            return gemini_api.embed_texts(texts, task, key, dims=2)
        with patch.object(gemini_api.urllib.request, "urlopen", side_effect=[broken, good]):
            vectors = embed_people.embed_with_retry(["synthetic"], "fake-key", embed, sleep, summary, 5)
        self.assertEqual(vectors, [[0.6, 0.8]])
        self.assertEqual(summary["requests"], 2)
        sleep.assert_called_once_with(30)

    def test_malformed_json_becomes_safe_retryable_error(self):
        with patch.object(gemini_api.urllib.request, "urlopen", return_value=self.response(b'{"private":')):
            with self.assertRaises(gemini_api.GeminiError) as caught:
                gemini_api.post("test", {}, "fake-key")
        self.assertIsNone(caught.exception.status)
        self.assertNotIn("private", str(caught.exception))

    def test_protocol_error_becomes_safe_retryable_error(self):
        with patch.object(gemini_api.urllib.request, "urlopen", return_value=self.response(error=http.client.IncompleteRead(b"private", 42))):
            with self.assertRaises(gemini_api.GeminiError) as caught:
                gemini_api.post("test", {}, "fake-key")
        self.assertIsNone(caught.exception.status)
        self.assertNotIn("private", str(caught.exception))
