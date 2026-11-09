/**
 * Task L1: run the daily deadline run once, by hand, against the Firestore emulator.
 * The emulator does not fire schedules, so this is how AC4 is checked.
 *
 * Emulator only: refuses to run unless FIRESTORE_EMULATOR_HOST is set.
 *
 * Usage (PowerShell, from functions/):
 *   $env:FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080"
 *   node tools/close_expired.js --project project-a3d59130-5adf-4677-9e2 --today 2026-12-10
 */
const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");
const Lifecycle = require("../lifecycle");
const { closeExpiredTopics } = require("../deadlines");

function arg(name, dflt) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
}

async function main() {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    console.error("refusing: FIRESTORE_EMULATOR_HOST is not set (this tool runs against the emulator only)");
    process.exit(2);
  }
  const projectId = arg("--project", process.env.GCLOUD_PROJECT || "demo-isr");
  const today = arg("--today", Lifecycle.todayIn(Lifecycle.TIME_ZONE, new Date()));
  admin.initializeApp({ projectId });
  const result = await closeExpiredTopics(admin.firestore(), FieldValue, today);
  const counts = {};
  result.changes.forEach((c) => { const k = `${c.from} -> ${c.action}`; counts[k] = (counts[k] || 0) + 1; });
  console.log(`today ${result.today}: checked ${result.checked} topics, changed ${result.changes.length}`);
  Object.keys(counts).sort().forEach((k) => console.log(`  ${k}: ${counts[k]}`));
  if (process.argv.includes("--details")) result.changes.forEach((c) => console.log("  ", JSON.stringify(c)));
}

main().catch((e) => { console.error(e); process.exit(1); });
