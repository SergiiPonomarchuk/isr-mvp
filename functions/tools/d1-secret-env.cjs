// D1 launcher-only bridge: Firebase CLI otherwise fetches declared secrets from
// Secret Manager even when the authorized key is already inherited in memory.
// No secret file is read/written by this adapter and no value is logged.
const path = require('node:path');
const entry = process.env.D1_FIREBASE_CLI_ENTRY;
if (entry && path.resolve(process.argv[1] || '') === path.resolve(entry)) {
  if (!/^(127\.0\.0\.1|localhost):\d+$/.test(process.env.FIRESTORE_EMULATOR_HOST || '')) {
    throw Error('D1 secret bridge is emulator-only');
  }
  const { FunctionsEmulator } = require(path.resolve(path.dirname(entry), '../emulator/functionsEmulator.js'));
  FunctionsEmulator.prototype.resolveSecretEnvs = async function (backend, trigger) {
    const declarations = trigger?.secretEnvironmentVariables || backend.secretEnv || [];
    const result = {};
    for (const declaration of declarations) {
      if (declaration.key !== 'GEMINI_API_KEY' || !process.env.GEMINI_API_KEY) {
        throw Error('D1 secret bridge refuses an unavailable or unexpected secret');
      }
      result[declaration.key] = process.env.GEMINI_API_KEY;
    }
    return result;
  };
}
