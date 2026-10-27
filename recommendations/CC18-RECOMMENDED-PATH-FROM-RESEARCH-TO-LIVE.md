# ‏Cross-Cutting 18 — Recommended Path from Research to Live

> ‏מטרת המסמך: לסנתז את Recommendation Sheets של Research, Backtest, Replay, Shadow/Paper, Production Engineering, Risk/Safety, Readiness, Versioning, Observability ו־Learning למסלול Promotion אחד, מדורג ו־evidence-gated.
>
> ‏למרות שם ה־Pack שנקבע ב־Mandate, המסמך **אינו מדריך להפעלת מסחר בכסף אמיתי ואינו מעניק הרשאת `Live`**. נקודת הסיום שלו היא `ELIGIBLE_FOR_EXTERNAL_LIVE_READINESS_REVIEW` — סטטוס Governance בלבד. כל החלטה עתידית מעבר לכך דורשת בדיקת זכאות, הרשאות חשבון, Broker, דין/רגולציה ובקרה אנושית מתאימה מחוץ ל־Playbook הזה.

---

## ‏1. Decision

‏המסלול המומלץ אינו:

```text
Backtest profitable
→ Paper profitable
→ Live
```

‏ואינו:

```text
system works technically
→ enable external risk
```

‏אלא:

```text
Research Thesis
→ Point-in-Time Historical Validation
→ Deterministic Replay
→ Signal-Only Shadow
→ Execution Shadow
→ Paper Lifecycle
→ Production Engineering Hardening
→ Gate-by-Gate Readiness Review
→ Independent Evidence Review
→ ELIGIBLE_FOR_EXTERNAL_LIVE_READINESS_REVIEW
```

‏כל מעבר הוא **Promotion Gate חדש**, לא continuation אוטומטי של השלב הקודם.

‏העקרונות המחייבים:

```text
P0 FAIL / UNKNOWN => STOP PROMOTION

Readiness is scoped, versioned and expiring.

Paper success != live proof.

Production Engineering Ready != Live Authorized.

Economic evidence cannot override correctness, safety or eligibility blockers.
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏Stage Model מפורש

‏נשתמש ב־states הבאים:

```text
NOT_READY
RESEARCH_READY
REPLAY_READY
SHADOW_READY
PAPER_READY
PRODUCTION_ENGINEERING_READY
ELIGIBLE_FOR_EXTERNAL_LIVE_READINESS_REVIEW
```

‏לא יהיה state פנימי בשם `LIVE_APPROVED` במסגרת Playbook זה.

### ‏`P0 — Required`: ‏Promotion הוא Gate, לא Score

‏כל transition יקבל:

```text
RequiredGateSet
PASS / PARTIAL / FAIL / UNKNOWN per gate
P0 / P1 / P2 / P3 severity
EvidenceRefs
OpenUnknowns
Decision
Expiry / RevalidationTriggers
```

‏אין:

```text
ReadinessScore = 94/100
```

‏שיכול לקזז blocker.

### ‏`P0 — Required`: ‏כל Promotion קשור לגרסה מדויקת

‏כל `PromotionPacket` יקושר לפחות ל־:

```text
StrategyVersionId
BuildId / CommitSha
ResolvedConfigFingerprint
Dataset / Evidence Window
DataContractVersion
UniverseVersion
FeatureSetVersion
VetoPolicyVersion
RiskPolicyVersion
ExecutionPolicyVersion
SafetyPolicyVersion
CostModelVersion
Environment
```

‏שינוי behavior משמעותי פג את ה־promotion evidence הרלוונטי ודורש revalidation.

### ‏`P0 — Required`: ‏Research Ready לפני Systems Validation

‏`RESEARCH_READY` דורש לפחות:

```text
Written Edge Thesis
Prediction Target
Executable Outcome Definition
Falsification Criteria
Point-in-Time Data Contract
Cost / Latency Assumptions
Baseline StrategyVersion
Chronological Validation Plan
Holdout Discipline
Reproducible Experiment Artifact
```

‏אם לא ניתן להסביר מה בדיוק נבדק ומה יפריך אותו — אין Promotion.

### ‏`P0 — Required`: ‏Historical Validation לפני Forward Validation

‏לפני Shadow/Paper נדרש:

```text
Point-in-Time correctness
→ chronological validation
→ protected OOS / walk-forward where material
→ realistic cost assumptions
→ realistic execution assumptions
→ stress / sensitivity
→ regime / episode coverage
```

‏Peak backtest, parameter spike או תקופה אחת אינם מספיקים.

### ‏`P0 — Required`: ‏Deterministic Replay Gate

‏לפני `SHADOW_READY` נדרש שה־core יהיה replayable באופן אמין:

```text
Recorded Inputs
→ ReplayClock
→ Same Core
→ Same Eligibility
→ Same Rank / Veto / Decision
→ Deterministic Evidence
```

‏Replay mismatch לא מוסבר הוא blocker, גם אם aggregate result נראה טוב.

### ‏`P0 — Required`: ‏Shadow לפני Paper

‏הסדר:

```text
Signal-Only Shadow
→ Execution Shadow
→ Paper Broker Lifecycle
```

‏`Signal-Only Shadow` מוכיח live-data parity, freshness, ranking ו־decision behavior ללא side effects.

‏`Execution Shadow` מוסיף hypothetical intents/fills ומודד executability תחת timing חי.

‏רק לאחר מכן `Paper` בודק external lifecycle מדומה/מבודד:

```text
Submit
Ack
Partial Fill
Fill
Cancel
Reject
Unknown Effect
Position
Exit
Reconciliation
```

### ‏`P0 — Required`: ‏Paper הוא Systems Evidence, לא Proof of Live Economics

‏Paper נדרש להוכיח:

```text
Order lifecycle correctness
State ownership
Partial-fill handling
Position truth
Exit lifecycle
Restart / reconnect
Reconciliation
Unknown-effect handling
Observability
Recovery
```

‏אין להסיק ממנו לבדו equivalence ל־real fills, real queue position, real impact או future profitability.

### ‏`P0 — Required`: ‏Production Engineering Hardening לפני External Review

‏`PRODUCTION_ENGINEERING_READY` דורש לפחות:

```text
Durable state
Durable intent
Explicit state machines
Single execution owner / fencing
Reconciliation
Position-first recovery
Degraded modes
Safety latches
Environment isolation
Immutable deploy identity
Rollback
Observability
Fault-oriented acceptance
Performance headroom
```

‏הגדרה זו מתייחסת ל־Replay/Shadow/Paper engineering readiness בלבד.

### ‏`P0 — Required`: ‏Safety / Risk / Compliance הם Independent Gates

‏Promotion חסום כאשר קיים blocker באחד מ־:

```text
Risk
Safety
Compliance / Conduct
Ownership
Environment identity
External-state reconciliation
Persistence / recoverability
```

‏Score, predicted edge או Paper PnL אינם יכולים לקזז אותם.

### ‏`P0 — Required`: ‏External Truth לפני Confidence מקומי

‏בשלב Paper/Production Engineering נדרש להוכיח:

```text
Local Orders == Paper/External Environment Orders after reconciliation
Local Fills == authoritative fills
Local Position == authoritative position
Pending Exposure known
Unknown Effects resolved
No orphan order / position state
```

‏Mismatch משמעותי מחזיר את המערכת ל־:

```text
ENTRY_BLOCKED / RECOVERING / NOT_READY
```

‏ולא ל־“ננסה שוב”.

### ‏`P0 — Required`: ‏Critical UNKNOWN עוצר Promotion

‏דוגמאות:

```text
unknown data semantics
unknown account/environment identity
unknown position truth
unknown order effect
unknown eligibility
unknown risk state
unknown replay divergence
unknown external dependency behavior
```

‏`UNKNOWN` אינו `PASS`, אינו `N/A` ואינו `probably fine`.

### ‏`P0 — Required`: ‏Entry Readiness ו־Exit Readiness נפרדים

‏המערכת יכולה להיות:

```text
ENTRY_BLOCKED
EXIT_ONLY
RECOVERING
```

‏בלי לאבד capability לצמצם exposure מדומה/Paper קיים כאשר הדבר בטוח.

‏Promotion stage לעולם אינו מבטל את העיקרון:

```text
Existing Exposure
> New Opportunity
```

### ‏`P0 — Required`: ‏Economic Readiness הוא Net + Uncertainty

‏Evidence כלכלי יפריד:

```text
Gross Predictive Opportunity
- Spread / Fees / Slippage
- Latency Decay
- Adverse Selection
- Impact where modeled
- Partial / No-Fill Effects
= Net Executable Estimate
```

‏אך גם Net חיובי אינו מספיק ללא:

```text
Margin of Safety
Uncertainty Bounds
Sensitivity / Stress
Regime Coverage
```

### ‏`P0 — Required`: ‏Forward Evidence קפוא לפי Version

‏ב־Shadow/Paper:

```text
Version change
→ previous evidence window closes
→ new window begins
```

‏אין tuning שקט בתוך אותו validation window.

### ‏`P0 — Required`: ‏Promotion Review הוא Decision Record

‏לכל transition נשמור:

```text
PromotionId
FromStage
ToStage
StrategyVersionId
RequiredGateSet
EvidenceWindow
GateResults
P0Blockers
P1Dispositions
OpenUnknowns
KnownResidualRisks
Decision
DecisionReason
Reviewer / GovernanceContext
CreatedAt
ExpiresAt / RevalidationTriggers
RollbackStage
```

### ‏`P0 — Required`: ‏No Auto-Promotion

‏אפשר לאוטומט:

```text
collect evidence
run tests
compute metrics
check deterministic gates
flag stale evidence
assemble PromotionPacket
```

‏אבל לא:

```text
auto-promote stage
auto-enable external risk
auto-waive P0 blocker
auto-convert UNKNOWN to PASS
```

### ‏`P0 — Required`: ‏Rollback / Demotion הוא חלק מהמסלול

‏Stage אינו הישג חד־כיווני.

‏נגדיר transitions לאחור:

```text
PRODUCTION_ENGINEERING_READY
→ PAPER_READY
→ SHADOW_READY
→ RESEARCH_READY
```

‏לפי root cause.

‏Triggers לדוגמה:

```text
critical incident
replay non-determinism
state mismatch
cost-model drift
provider semantic change
major strategy version change
unresolved external fact change
performance/freshness regression
safety invariant failure
```

### ‏`P1 — Preferred`: ‏Stage-Specific Required Gate Sets

#### ‏`RESEARCH_READY`

```text
thesis
PIT data
experiment contract
baseline
OOS plan
cost/execution assumptions
reproducibility
```

#### ‏`REPLAY_READY`

```text
immutable recording
ReplayClock
deterministic ordering
same core
output parity / explained divergence
reproducible run
```

#### ‏`SHADOW_READY`

```text
live-data freshness
coverage
training-serving parity
latency tails
NO_TRADE / UNKNOWN correctness
zero external side effects
```

#### ‏`PAPER_READY`

```text
order lifecycle
partial fills
cancel/fill race
position truth
exit
reconciliation
restart/recovery
paper-environment isolation
```

#### ‏`PRODUCTION_ENGINEERING_READY`

```text
durability
safety control plane
fault acceptance
single owner / fencing
observability
rollback
performance headroom
readiness packet
```

#### ‏`ELIGIBLE_FOR_EXTERNAL_LIVE_READINESS_REVIEW`

```text
all relevant prior P0 gates PASS
no critical UNKNOWN
stable scoped version
independent review packet complete
current external eligibility facts identified for verification
no assumption that prior stages authorize live-money use
```

### ‏`P1 — Preferred`: ‏Minimum Observation Window נקבע לפי Evidence, לא Calendar Magic

‏לא נקבע כלל כגון:

```text
7 good days => promote
30 days => ready
```

‏במקום זאת נדרוש coverage מספק של:

```text
decision episodes
market regimes
load/burst conditions
failure/recovery scenarios
execution states
relevant disagreement cases
```

‏משך זמן הוא input, לא promotion rule בפני עצמו.

### ‏`P1 — Preferred`: ‏Independent Review לפני External Live-Readiness Review

‏לפני status הסופי במסמך זה, reviewer שאינו תלוי ב־PnL האחרון צריך לעבור לפחות על:

```text
P0 gate evidence
open unknowns
version identity
holdout contamination
replay parity
fault acceptance
risk/safety evidence
paper reconciliation
rollback readiness
external facts requiring current verification
```

### ‏`P1 — Preferred`: ‏Promotion Packet נשאר קטן וניווטי

‏לא ננסה לדחוס את כל ה־telemetry למסמך אחד.

‏ה־Packet יצביע ל־artifacts:

```text
Research Result
Replay Run
Shadow Report
Paper Report
Fault Test Report
Readiness Packet
Incident / RCA History
Strategy Manifest
Config Fingerprint
Version Diff
```

---

## ‏3. Why

‏לכל stage יש סוג אחר של uncertainty:

```text
Research
→ Is the hypothesis real or overfit?

Replay
→ Can behavior be reproduced causally?

Shadow
→ Does the same core behave correctly on live-arriving data?

Paper
→ Does order/position/recovery lifecycle work against an external-like state machine?

Production Engineering
→ Does the system preserve truth under faults, deployments and recovery?

External Live-Readiness Review
→ Are all remaining non-research eligibility, governance and real-world requirements independently satisfied?
```

‏דילוג על stage אינו “חיסכון בזמן”; הוא פשוט משאיר סוג uncertainty לא נמדד.

---

## ‏4. Use When

‏המסלול משמש:

- ‏כאשר Hypothesis מחקרית עוברת משלב סטטיסטי למערכת event-driven.
- ‏לפני מעבר מ־Replay ל־Shadow.
- ‏לפני מעבר מ־Shadow ל־Paper.
- ‏לפני הכרזה על `Production Engineering Ready`.
- ‏לאחר StrategyVersion מהותית.
- ‏לאחר Provider/Data Contract/Execution/Risk/Safety change משמעותי.
- ‏לאחר incident שמערער evidence קודם.
- ‏כאשר צריך להחליט אם Evidence ישן עדיין תקף לגרסה הנוכחית.

---

## ‏5. Do Not Use When

‏אין להשתמש במסלול כדי:

- ‏להפוך Backtest טוב להרשאה חיצונית.
- ‏להפוך Paper PnL להוכחת real-world economics.
- ‏לעקוף תנאי Broker/Account/Eligibility/Regulation.
- ‏לדלג על Replay מפני ש־Paper “עובד”.
- ‏להפוך `Production Engineering Ready` ל־`Live Authorized`.
- ‏לקזז `P0 UNKNOWN` באמצעות metric כלכלי.
- ‏לקבוע readiness לפי מספר ימים בלבד.
- ‏להגדיל scope בגלל רצף תוצאות טובות.
- ‏להסתיר incident פתוח באמצעות redeploy/version חדש.

---

## ‏6. Alternatives

### ‏Alternative A — `Research → Paper`

‏מהיר יותר, אך מערבב hypothesis, timing parity ו־order lifecycle בלי לדעת היכן First Divergence.

### ‏Alternative B — `Research → Shadow → Paper`

‏טוב יותר, אך עדיין חלש אם Replay אינו deterministic או Production Engineering אינו hardened.

### ‏Preferred

```text
Research
→ Replay
→ Signal Shadow
→ Execution Shadow
→ Paper
→ Production Engineering
→ External Live-Readiness Review eligibility
```

### ‏Advanced

‏אפשר להוסיף sub-stages לפי subsystem, אך רק אם הם פותרים ambiguity אמיתי. אין יתרון ל־stage proliferation לצורך bureaucracy.

---

## ‏7. Trade-offs

### ‏Speed vs Evidence

‏יותר Gates מאטים promotion, אך מצמצמים uncertainty ו־attribution ambiguity.

### ‏Realism vs Control

‏Shadow/Replay נותנים שליטה גבוהה; Paper מוסיף external lifecycle realism אך עדיין אינו real-market execution proof.

### ‏Strict Versioning vs Revalidation Cost

‏Revalidation אחרי שינוי מהותי עולה זמן, אך מונעת שימוש ב־evidence של גרסה אחרת.

### ‏Broad Scope vs Confidence

‏Scope רחב דורש יותר regime/failure/evidence coverage. Scope מצומצם יותר יכול להיות מוכח בקלות יחסית, אך אינו מצדיק extrapolation מעבר למה שנבדק.

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מתחיל עם:

- ‏`Live Readiness Score` יחיד.
- ‏Auto-promotion בין stages.
- ‏Calendar-only rules כגון “אחרי X ימים”.
- ‏Promotion על PnL בלבד.
- ‏Paper-first בלי Replay/Shadow.
- ‏מספר רב של environments/adapters.
- ‏Canary architecture מורכבת.
- ‏Dynamic scope expansion.
- ‏Feature/Model changes בתוך validation window.
- ‏Exceptions ידניים ל־P0 blockers.
- ‏Assumption ש־`connected == ready`.

---

## ‏9. What to Add Later

### ‏`P1`

- ‏Canonical `PromotionPacket` template.
- ‏Required Gate Set לכל transition.
- ‏Evidence expiry/revalidation rules.
- ‏Stage history ו־demotion history.

### ‏`P2`

- ‏Machine-readable readiness registry.
- ‏Automatic stale-evidence detection.
- ‏Version-diff-driven validation scope.
- ‏Automated links ל־Replay/Shadow/Paper/Fault artifacts.

### ‏`P3`

- ‏Independent automated conformance suites נגד external Paper environment.
- ‏Dependency graph שמזהה אילו Gates נפגעו משינוי Provider/Schema/Policy.

### ‏`P4`

‏Formal assurance, canary/deployment sophistication או multi-environment orchestration רק אם scale/failure evidence מצדיקים זאת.

---

## ‏10. Required Data / Evidence

‏לכל Promotion נרצה Evidence לפי ה־stage:

```text
PromotionPacket
- PromotionId
- FromStage
- ToStage
- StrategyVersionId
- BuildId
- ConfigFingerprint
- Environment
- EvidenceWindow
- RequiredGateSet
- GateResults
- P0Blockers
- P1Dispositions
- OpenUnknowns
- KnownResidualRisks
- DatasetIds
- ExperimentIds
- ReplayRunIds
- ShadowRunIds
- PaperRunIds
- FaultTestRunIds
- ReadinessPacketId
- IncidentRefs
- RCAPointers
- VersionDiff
- RollbackStage
- ExternalFactsNeedingCurrentVerification
- Decision
- DecisionReason
- ReviewedAt
- ExpiresAt
```

‏Evidence צריך לכלול לפי הרלוונטיות:

```text
PIT correctness
OOS / walk-forward results
stress / sensitivity
regime / episode coverage
replay parity
freshness / coverage
latency tails
NO_TRADE / UNKNOWN behavior
order lifecycle
partial fills
cancel/fill race
reconciliation
restart / recovery
fault acceptance
risk/safety/compliance
performance headroom
version identity
rollback proof
```

---

## ‏11. Promotion Criteria

‏Promotion בין stages מותר במסגרת המחקרית רק כאשר:

1. ‏כל `P0` של ה־target stage הוא `PASS`.
2. ‏אין `Critical UNKNOWN` פתוח.
3. ‏Evidence שייך בדיוק ל־Version ול־scope המקודמים.
4. ‏ה־Evidence מספיק עצמאי מה־Discovery שהוליד את Hypothesis.
5. ‏ה־behavior ניתן לשחזור ב־Replay היכן שרלוונטי.
6. ‏כל divergence מהותי מוסבר או מסווג כ־blocker.
7. ‏Risk/Safety/Compliance gates אינם תלויים ב־economic score.
8. ‏Known residual risks מתועדים ויש להם bounds/owner.
9. ‏Rollback/Demotion path קיים.
10. ‏אין assumption ש־Promotion stage מעניק הרשאה חיצונית שלא נבדקה.

‏לקבלת `ELIGIBLE_FOR_EXTERNAL_LIVE_READINESS_REVIEW` נדרש בנוסף:

```text
PRODUCTION_ENGINEERING_READY == PASS
all prior relevant stage gates == PASS
critical unknown count == 0
current-version PromotionPacket complete
external eligibility facts explicitly marked for current verification
```

‏גם status זה **אינו** `Live Authorized`.

---

## ‏12. Rejection Criteria

‏Promotion נדחה או מוחזר שלב כאשר:

- ‏`P0 FAIL` או `P0 UNKNOWN` קיים.
- ‏Evidence שייך לגרסה אחרת.
- ‏Holdout contamination מהותי אינו פתור.
- ‏Replay אינו deterministic ללא explanation.
- ‏Shadow/Replay parity נכשלת.
- ‏Paper lifecycle/reconciliation אינו אמין.
- ‏Unknown external effect נשאר unresolved.
- ‏Exit/position truth אינו מוכח.
- ‏Safety/Risk/Compliance blocker פתוח.
- ‏Fault scenario מהותי נכשל.
- ‏Performance/freshness קורסים תחת load רלוונטי.
- ‏Result תלוי ב־optimistic execution/cost assumption.
- ‏Scope של הטענה רחב יותר מה־Evidence.
- ‏External eligibility fact אינו מאומת במקום שבו הוא נדרש.

‏`NO_GO`, ‏`HOLD` ו־`DEMOTE` הן תוצאות מקצועיות תקינות.

---

## ‏13. Metrics

### ‏Research / Validation

```text
OOS performance by episode/regime
Holdout contamination count
Effective sample size
Sensitivity / stress stability
Reproducibility rate
```

### ‏Replay / Shadow

```text
ReplayParityRate
DecisionDivergenceRate
FirstDivergenceByLayer
FreshCoverageRatio
TopCandidateAge
SignalSurvivalRate
p95 / p99 decision latency
```

### ‏Paper / Lifecycle

```text
OrderStateMismatchRate
PartialFillHandlingFailures
CancelFillRaceFailures
UnknownEffectRate
ReconciliationMismatchRate
RestartRecoverySuccessRate
TimeToReconciled
TimeToFlat
```

### ‏Production Engineering

```text
CriticalInvariantViolationRate
SafetyLatchRate
RecoverySuccessRate
FaultAcceptancePassRate
DurableStateFailureRate
p95 / p99 queue age
PerformanceHeadroom
ObservabilityCompleteness
```

### ‏Governance

```text
P0OpenCount
CriticalUnknownCount
StaleEvidenceCount
PromotionRollbackRate
StageDemotionRate
TimeToExplain
EvidenceCoverageByGate
```

‏אין `Readiness Score` יחיד.

---

## ‏14. Failure Modes

### ‏Backtest-to-Paper Jump

‏מדלגים על Replay/Shadow ולכן לא יודעים אם failure הוא Data/Serving/Timing או Order lifecycle.

### ‏Paper-PnL Fallacy

‏מתייחסים ל־Paper outcome כהוכחה ל־real execution.

### ‏Green-Checklist Theater

‏הרבה PASS מסתירים `P0 UNKNOWN` אחד.

### ‏Version Drift

‏Evidence נאסף על Version אחת אך Promotion ניתן לאחרת.

### ‏Calendar Promotion

‏“עבר מספיק זמן” מחליף Evidence coverage.

### ‏Incident Amnesia

‏Deploy חדש מסתיר blocker ישן בלי RCA.

### ‏Scope Creep

‏Evidence לסביבה/Universe/Policy מצומצמים משמש להצדקת scope רחב יותר.

### ‏External-Fact Staleness

‏Broker/Account/Regulatory/Data capability assumed from old information.

### ‏Irreversible Promotion

‏אין demotion/rollback path.

### ‏Authority Confusion

‏Strategy, CI או automation מעניקים לעצמם permission שחייב להיות governance/external decision.

---

## ‏15. User-Specific Application

‏עבור מערכת Scanner רחבת־שוק וקצרת־horizon, המסלול המחקרי המומלץ הוא:

```text
Simple Evidence MVP
→ PIT Historical Validation
→ Deterministic Whole-Market Replay
→ Signal Shadow on live-arriving data
→ Execution Shadow
→ Isolated Paper lifecycle
→ Long-running Paper / fault / recovery evidence
→ Production Engineering Readiness
→ External Live-Readiness Review eligibility only
```

‏הדגש אינו “להגיע ל־Live מהר”, אלא לשמר בכל stage:

```text
Freshness
Fair comparison
Determinism
Net-edge evidence
Execution realism
Position truth
Exit capability
Risk / Safety
Recovery
Explainability
```

‏כאשר שינוי Strategy משמעותי נעשה בדרך, אין “להמשיך מהמקום שבו היינו”; ה־Validation Scope נגזר מחדש מה־diff.

‏המערכת יכולה להתקדם במחקר גם אם לעולם לא עוברת מעבר ל־Paper. ‏`Paper/Shadow` יציבים, reproducible ו־useful הם outcome מקצועי מלא בפני עצמו.

---

## ‏16. Confidence

### ‏High Confidence

- ‏Stage-by-stage promotion עדיף על קפיצה מ־Backtest/Paper.
- ‏P0 blockers חייבים להיות non-compensable.
- ‏Readiness חייב להיות scoped/versioned/expiring.
- ‏Replay/Shadow/Paper בודקים uncertainties שונים.
- ‏Paper אינו proof של real execution economics.
- ‏Production Engineering Ready אינו external authorization.
- ‏Rollback/Demotion צריכים להיות first-class.
- ‏Critical Unknown חייב לחסום promotion.

### ‏Medium Confidence

- ‏החלוקה המדויקת בין `Signal Shadow` ל־`Execution Shadow` תישאר שימושית לאורך כל חיי המערכת; אפשר בעתיד לאחד tooling אך לא semantics.
- ‏Independent review לפני status הסופי ייתן ROI גבוה למערכת אישית כאשר evidence volume גדל.

### ‏Hypotheses to Validate

- ‏איזה Evidence Window מספיק לכל transition.
- ‏אילו Regime/Failure buckets הם minimum useful coverage בפועל.
- ‏איזה subset של P1 findings יכול להישאר backlog בלי לפגוע ב־target stage.

---

## ‏17. Time-Sensitive Facts

‏ה־Promotion methodology עצמה אינה תלויה תאריך משמעותית.

‏לעומת זאת, ה־external facts הבאים חייבים אימות עדכני ורלוונטי בזמן review חיצוני:

```text
Broker account capabilities
Account eligibility / permissions
Applicable trading restrictions
Market-data entitlements
Fees / commissions
API behavior / limits
Venue / market rules
Regulatory requirements
Tax / accounting obligations where relevant
```

‏אין לקבע Fact כזה ב־Strategy core ללא:

```text
Source
VerifiedAt
ValidFrom / applicability
AffectedScope
RevalidationTrigger
```

‏ה־Playbook הזה אינו מכריע את ה־external review ואינו מחליף אותו.

---

## ‏18. Fact / Judgment / Hypothesis

### ‏Fact

- ‏Backtest/Replay, Shadow ו־Paper בודקים סוגי uncertainty שונים.
- ‏Paper environment אינו שקול בהכרח ל־real-market execution.
- ‏שינוי StrategyVersion יכול לפגוע בתקפות Evidence שנאסף לגרסה קודמת.
- ‏Critical state ambiguity מקשה להוכיח bounded behavior/recoverability.

### ‏Judgment

- ‏ברירת המחדל שלנו היא Promotion מדורג: Research → Replay → Shadow → Paper → Production Engineering.
- ‏כל `P0 FAIL/UNKNOWN` חוסם promotion.
- ‏`ELIGIBLE_FOR_EXTERNAL_LIVE_READINESS_REVIEW` הוא קו הסיום של Playbook זה.
- ‏Promotion חייב להיות reversible באמצעות Demotion/Rollback.

### ‏Hypothesis

- ‏ה־highest-value transition evidence למערכת short-horizon יהיה לעיתים freshness/replay/reconciliation evidence יותר מאשר עוד ימים של Paper PnL.
- ‏Stage-specific Gate Sets קטנים וברורים ישפרו decision quality יותר מ־checklist ענק ואחיד לכל transition.

---

## ‏19. Priority Map

### ‏`P0`

```text
Stage model
Gate-by-gate promotion
Version-scoped evidence
PIT historical validation
Deterministic replay
Shadow before Paper
Paper lifecycle correctness
Production engineering hardening
Risk / Safety / Compliance independent gates
Critical UNKNOWN blocks
Rollback / demotion
No auto-promotion
```

### ‏`P1`

```text
Stage-specific Required Gate Sets
Independent review
Evidence expiry rules
PromotionPacket
Episode/regime/failure coverage
```

### ‏`P2`

```text
Machine-readable readiness registry
Automatic stale-evidence detection
Version-diff-driven validation scope
```

### ‏`P3/P4`

‏Automation ו־formal assurance נוספים רק אם complexity/scale מצדיקים אותם; הם אינם מחליפים governance או eligibility review.

---

## ‏20. Definition of Done

‏ה־Path נחשב מוגדר היטב רק אם אפשר לענות על:

```text
1. What stage are we in now?
2. What exact StrategyVersion is being evaluated?
3. What gates are required for the next stage?
4. Which P0 gates are PASS / FAIL / UNKNOWN?
5. What evidence supports each PASS?
6. Which evidence is stale or belongs to another version?
7. What type of uncertainty does the next stage test?
8. What would force demotion?
9. Can replay reproduce the decision path?
10. Are position / order / reconciliation semantics proven in Paper?
11. Are safety, risk and compliance independent of economic score?
12. Is rollback ready?
13. Which external facts still require current verification?
14. Does any document incorrectly imply that engineering readiness equals authorization?
```

‏אם התשובה ל־14 היא כן — ה־Path עדיין אינו תקין.

---

## ‏21. Recommendation Summary

```text
Research
→ prove the hypothesis without leakage

Replay
→ prove causal reproducibility

Shadow
→ prove live-data parity without side effects

Paper
→ prove lifecycle / state / recovery in an isolated external-like environment

Production Engineering
→ prove durability, safety, observability and fault recovery

External Live-Readiness Review
→ separate governance/eligibility decision outside this Playbook
```

‏השורה התחתונה:

```text
Advance only when the next uncertainty has been explicitly tested.
Do not convert evidence into authority it does not grant.
```
