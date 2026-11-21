# 04 Expertise

**2026-11-21 reconciliation boundary:** preserve the current CBC adjustment and corrected paired-reference/one-floor math while possible removal is separately clarified. The [X/Values task](tasks/X-eligibility-values-reconciliation.md) changes no Expertise formula or recency behavior. References to single-vector runtime below are dated historical evidence; main b8014ac includes the mr1 evaluator. No new Expertise migration/implementation is authorized by documentation reconciliation.


Status: current single-vector calculation VERIFIED at3c25ef7; PD-9 multi-reference extension specified, not implemented.

Expertise is max(age floor, education evidence) + work evidence, without Education/Experience component weights or resources. [PD-8](decisions/PD-8-resources-option-level.md) owns that definition. [PD-9](decisions/PD-9-multi-reference-derivation.md) sections2/6 own exact notation, CBC/nominal-power mapping and the multi-reference evidence-before-floor convention. [Assessment document](../docs/ISR-Expertise-Assessment-v1.md) explains it with corrected examples.

Current code: functions/isr.js ageInYears:36, ageFloor:53, educationParams:63, educationSum:92, experienceSum:108. Create uses one issue vector and CBC adjustment, rounds stored parts/total to3 decimals before public normalization (functions/index.js:352-382); Join mirrors this and renormalizes the enlarged public (functions/join-issue.js:20-73). Canonical Python normalization is scripts/isr_core.py, not the older helper normalization in scripts/expertise.py.

Implementation gaps: no recency decay despite stored metadata; expertise-depth/domain labels do not directly change math; activity skills ignored; missing skill vectors skipped; malformed JS work duration defaults to1; no graduation/in_progress filter in core. Runtime College CBC1.5/P3 differs from the doc's Course/Cert3/.5 rule; unrecognized labels default1/4. Invalid birthDate currently falls back to raw education without floor, although PD-8 requires birthDate. These need explicit decisions, not silent changes during mr1 implementation.

Inputs: users.skills, user_vectors.experience_vectors, one frozen registration date, issue/aspect vectors and CBC adjustment. Outputs: member education_expertise, experience_expertise, expertise_score and normalized total E (legacy field normalized_experience). No profile contact fields or age copied into derivation logs.

## Change history

- 2026-11-16: added current baseline and intended PD-9 extension; no runtime change.
