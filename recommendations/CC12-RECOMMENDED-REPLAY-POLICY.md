# ‏Cross-Cutting 12 — Recommended Replay Policy

> ‏מטרת המסמך: לסנתז את Recommendation Sheets של Deterministic Market Replay, Backtest, RCA, Recovery, Execution, Risk, Observability ו־Testing למדיניות `Replay` אחת reproducible, deterministic, inspectable ו־safe עבור `Research / Replay / Shadow / Paper`.
>
> ‏המסמך אינו הוראה למסחר בכסף אמיתי ואינו אישור `Live`. הוא מגדיר Time Machine מחקרית ותפעולית שמאפשרת לשחזר מה המערכת ידעה, איזה State בנתה, איזו החלטה קיבלה, ואיפה שתי גרסאות התחילו לסטות — בלי לאפשר ל־wall clock, concurrency או randomness סמוי לשנות את התוצאה.

---

## ‏1. Decision

‏`Replay` אינו:

```text
Historical file
→ play events
→ show chart
```

‏וגם אינו:

```text
another backtest implementation
```

‏אלא:

```text
Immutable Recorded Tape
→ Canonical Reader
→ Deterministic Ordering
→ ReplayClock / Virtual Scheduler
→ Same Market-State Core
→ Same Feature / Eligibility / Rank / Decision Core
→ Same Risk / Safety / Compliance Semantics
→ Simulated Execution Adapter
→ Decision / Order / Fill / Risk / Data-Quality Ledgers
→ Deterministic Fingerprints
→ Run Diff / First Divergence
→ RCA / Regression / Controlled Experiment
```

‏העיקרון המחייב:

```text
Same tape
+ same versions
+ same config
+ same seed
= same logical outputs
```

‏אם אותו Run אינו ניתן לשחזור — אין לו ערך מלא כ־Evidence.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏Replay משתמש באותו Decision Core

‏הבדל הסביבה צריך להיות בעיקר ב־Adapters:

```text
Live/Shadow source → CanonicalEventBus → Shared Core
Replay source      → CanonicalEventBus → Shared Core
```

‏ה־Shared Core כולל לפחות:

```text
MarketState
Feature Engine
Eligibility
Ranking
Candidate Gate
Decision
Risk
Safety
Compliance semantics
OrderIntent generation
Position accounting
```

‏אין branch סמוי בסגנון:

```text
if replay:
    use easier logic
```

‏כאשר נדרש הבדל אמיתי, הוא חייב להיות מפורש, versioned ומתועד כ־adapter או policy difference.

### ‏`P0 — Required`: ‏Virtual Time הוא authority סמנטי

‏כל logic תלוי־זמן משתמש ב־Clock abstraction.

‏`ReplayClock` מנהל לפחות:

```text
feature age
quote age
signal TTL
candidate TTL
order TTL
position max-hold
cooldown
scanner cadence
session boundaries
heartbeat/data timeout semantics
risk reset boundaries
scheduled execution-simulation events
```

‏`wall clock` אינו רשאי לשנות decision semantics.

### ‏`P0 — Required`: ‏Canonical deterministic ordering

‏כל Event נושא ככל האפשר:

```text
EventId
EventType
InstrumentId
EventTime
ReceiveTime
ProviderSequence
IngestSequence
Source
SchemaVersion
QualityFlags
Payload
```

‏Ordering policy היא versioned contract.

‏Baseline:

```text
EventTime
→ ProviderSequence when semantically valid
→ ReceiveTime when available
→ Stable IngestSequence
```

‏אם Provider דורש semantics אחרים — ניצור `OrderingPolicyVersion` אחר, לא תיקון שקט.

### ‏`P0 — Required`: ‏`Replay != Simulation`

‏שלוש שכבות provenance נפרדות:

```text
RECORDED_FACT
DERIVED_STATE
SIMULATED_CONSEQUENCE
```

‏דוגמאות:

```text
recorded quote/trade       = RECORDED_FACT
feature/rank               = DERIVED_STATE
hypothetical fill/slippage = SIMULATED_CONSEQUENCE
```

‏אסור להציג hypothetical fill כאילו היה fill מוקלט.

### ‏`P0 — Required`: ‏Dataset ו־Run immutable/versioned

‏כל Dataset מקבל לפחות:

```text
DatasetId
SchemaVersion
SourceProfile
CoverageProfile
UniverseVersion
StartTime
EndTime
CleaningProfile
OrderingPolicyVersion
Checksum
CreatedAt
```

‏כל Replay Run מקבל לפחות:

```text
ReplayRunId
DatasetId
CodeCommit
StrategyVersion
ConfigFingerprint
FeatureVersion
RankingVersion
DecisionVersion
RiskVersion
ExecutionModelVersion
CostModelVersion
ReplayPolicyVersion
RandomSeed
ReplayMode
StartTime
EndTime
```

‏שינוי תוכן תחת אותו `DatasetId` הוא failure של Evidence lineage.

### ‏`P0 — Required`: ‏`FUNCTIONAL_DETERMINISTIC` הוא mode ראשון

‏ה־mode הראשי נועד לענות:

```text
Is logic/state reproducible and correct?
```

‏במצב זה Event/boundary הבא מתקדם באופן deterministic אחרי שהעיבוד הנדרש הושלם.

‏`PERFORMANCE_STRESS` הוא mode אחר שנועד לבדוק pressure, queues ו־capacity.

‏אין להסיק correctness מ־performance run ולהפך.

### ‏`P1 — Preferred`: ‏Replay speed אינו משנה החלטות פונקציונליות

‏באותם assumptions:

```text
1x
10x
100x
MAX_SPEED
```

‏צריכים להפיק אותו:

```text
Decision Ledger
OrderIntent sequence
Simulated Fill Ledger
Final logical state
```

‏אם לא — נפתח RCA ל־wall-clock leak, race או nondeterminism.

### ‏`P0 — Required`: ‏Whole-market integrity כאשר Ranking הוא cross-sectional

‏Replay של Symbol אחד אינו יכול לשחזר Rank whole-market נאמן בלי state מתאים של המתחרים.

‏נשמור:

```text
ExpectedUniverse
ObservedUniverse
FreshCoverage
MissingSymbols
LateSymbols
RankingPopulation
RankingValidity
```

‏כאשר coverage אינה מספקת:

```text
DEGRADED / INVALID / UNKNOWN
```

‏ולא Winner שנראה מדויק אך נוצר מ־Universe חלקי.

### ‏`P1 — Preferred`: ‏Ledgers הם contract, לא רק Logs

‏לפחות:

```text
DecisionLedger
OrderLedger
FillLedger
PositionRiskLedger
DataQualityLedger
```

‏Logs יכולים להסביר, אך First Divergence צריך להתבסס על state/ledger structured.

### ‏`P1 — Preferred`: ‏Deterministic output fingerprints

‏נשמור hashes יציבים כגון:

```text
NormalizedEventSequenceHash
DecisionLedgerHash
OrderLedgerHash
FillLedgerHash
FinalStateHash
```

‏ה־contract:

```text
D + C + K + S + E = H
```

‏כאשר:

```text
D = Dataset
C = Code/Strategy version
K = Config
S = Seed
E = Execution/Simulation model
H = Output fingerprints
```

### ‏`P0 — Required`: ‏Warm-up הוא state מפורש

‏Feature שחסר לו history הוא:

```text
WARMING_UP / NOT_READY
```

‏לא `0`, לא default ולא valid feature.

‏Risk-increasing simulated entry אינה מותרת עד שכל required state usable לפי policy.

### ‏`P0 — Required`: ‏Replay side-effect isolation

‏Replay חייב להיות structurally incapable of reaching a real execution endpoint.

‏Baseline:

```text
Replay
→ SimulatedExecutionAdapter only
```

‏Isolation failure הוא `P0` fail-fast.

‏ככל האפשר סביבת Replay אינה מחזיקה credentials שמאפשרים side effect חיצוני אמיתי.

### ‏`P1 — Preferred`: ‏First Divergence לפני Final PnL

‏השוואת שתי גרסאות מתחילה ב־:

```text
First Market-State Divergence
→ First Feature Divergence
→ First Eligibility Divergence
→ First Rank Divergence
→ First Decision Divergence
→ First Order Divergence
→ First Fill Divergence
```

‏רק לאחר מכן נפרש metric/PnL delta downstream.

### ‏`P1 — Preferred`: ‏Golden Replay Suite

‏נשמור scenarios קבועים שמייצגים:

```text
normal session
quiet period
burst/load period
rank churn
spread expansion
partial fill
cancel/fill race
data gap
halt/resume
restart/reconcile
```

‏Golden scenario אינו חייב להיות “יום רווחי”; הוא צריך להגן על semantics ו־failure handling.

---

## ‏3. Why

### ‏Fact

‏מערכת event-driven יכולה לקבל תוצאה שונה כאשר אותו מידע מעובד בסדר אחר.

### ‏Fact

‏Timers, TTL, partial fills, cancel/fill races, ranking cadences ו־risk state תלויים בזמן וב־event ordering.

### ‏Fact

‏`Replay` משחזר recorded inputs; execution של פעולה היפותטית הוא Simulation נפרד.

### ‏Fact

‏Cross-sectional Rank אינו ניתן לשחזור באופן אמין כאשר ה־ranking population חסר בלי שהחוסר מסומן.

### ‏Judgment

‏Replay deterministic הוא תשתית בסיסית ל־RCA, regression, Champion/Challenger ו־operational learning, משום שבלי reproducibility אי אפשר לדעת אם שינוי נבע מהקוד, מהנתונים או מ־nondeterminism.

### ‏Judgment

‏נעדיף Shared Core עם Adapters שונים על פני Replay implementation עצמאי.

### ‏Hypothesis

‏Golden Replay Suite ו־First-Divergence tooling יקצרו משמעותית את זמן ה־RCA ואת recurrence rate של תקלות; גודל השיפור יימדד ולא יונח מראש.

---

## ‏4. Use When

‏ה־Replay Policy מיועד במיוחד ל־:

- ‏שחזור Decision או Incident.
- ‏RCA ל־Top Candidate כושל.
- ‏RCA ל־`NO_TRADE` או missed opportunity.
- ‏השוואת Champion ו־Challenger על אותו Tape.
- ‏Regression של fixed bugs.
- ‏בדיקת Risk/Safety state לאורך Session.
- ‏בדיקת signal/rank decay.
- ‏בדיקת Entry/Exit policies על אותו path.
- ‏בדיקת Restart/Reconciliation.
- ‏Fault injection.
- ‏Performance/burst experiments.
- ‏Shadow-vs-Replay parity investigation.

---

## ‏5. Do Not Use When

‏Replay לבדו אינו מוכיח:

- ‏Future profitability.
- ‏ש־fill model מדמה Venue/Broker בדיוק.
- ‏ש־queue position אמיתית ידועה.
- ‏ש־hidden liquidity שוחזרה.
- ‏ש־regime עתידי יתנהג כמו tape היסטורי.
- ‏ש־Shadow/Paper forward evidence מיותר.
- ‏ש־Production Engineering readiness הושגה.

‏Replay הוא מנגנון Evidence/Reproduction, לא oracle.

---

## ‏6. Alternatives

### ‏Alternative A — Batch Backtest בלבד

‏מתאים למחקר population מהיר, אך חלש ל־state-machine RCA, timers ו־event-order bugs.

### ‏Alternative B — Snapshot Replay

‏יכול להספיק כאשר hypothesis אינה תלויה ב־micro-ordering.

‏ה־fidelity חייב להיות מסומן במפורש.

### ‏Alternative C — Full Exchange Simulator

‏עשיר פוטנציאלית, אך בעל complexity ו־false-precision risk גבוהים.

‏`P4 — Specialist` בלבד.

### ‏Alternative D — Replay UI/Video

‏שימושי לצפייה, אך אינו תחליף ל־engine שמריץ מחדש את ה־Core.

---

## ‏7. Trade-offs

### ‏Correctness vs Speed

‏Correctness קודם. Optimization מגיע לאחר determinism ו־invariants.

### ‏Raw Fidelity vs Storage Cost

‏Raw/canonical event retention יקר יותר, אך מאפשר recomputation ו־RCA אמין יותר.

### ‏Checkpoints vs Complexity

‏Checkpoints מקצרים seek, אבל מוסיפים serialization/version compatibility burden.

### ‏Single-thread vs Parallelism

‏Single-thread פשוט לדטרמיניזם; parallelism אפשרי אם merge/publication deterministic.

### ‏Functional Determinism vs Production Pressure

‏צריך את שניהם, אך במצבי Run נפרדים.

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מתחיל מ־:

- ‏Matching engine מלא.
- ‏L3/queue simulator מלא.
- ‏Checkpoint בכל interval קצר.
- ‏Distributed replay cluster.
- ‏UI כבד לפני engine contracts.
- ‏Automatic counterfactual generation מורכב.
- ‏AI RCA verdicts.
- ‏Selected-winner replay שמתחזה ל־whole-market replay.
- ‏Hidden wall-clock dependencies.
- ‏Unseeded randomness.
- ‏Replay-specific Strategy logic.
- ‏Derived-only storage במקום source tape.

---

## ‏9. What to Add Later

### ‏`P2`

- ‏Checkpoint/Seek.
- ‏Incident package export.
- ‏Fault injection.
- ‏Restart/Reconciliation Replay.
- ‏Performance/Burst Suite.
- ‏Replay UI עם pause/step/bookmarks.

### ‏`P3`

- ‏Automatic First-Divergence visualization.
- ‏Live/Shadow-vs-Replay session diff.
- ‏Scenario catalog/coverage automation.
- ‏Branching counterfactual orchestration.
- ‏Fidelity classification automation.

### ‏`P4`

- ‏Depth/queue specialized simulation.
- ‏Large-scale distributed replay.
- ‏Advanced impact models.

---

## ‏10. Required Data / Evidence

‏מינימום עבור Replay אמין:

```text
canonical market events
event timestamps
receive timestamps when available
sequence / ingest ordering metadata
universe/session metadata
data-quality events
strategy/config/version identities
```

‏עבור System/Incident Replay נוסיף:

```text
decision snapshots
order intents
order lifecycle events
fills
position/risk transitions
recovery events
operator/safety events when relevant
```

‏עבור execution calibration:

```text
bid/ask at relevant times
sizes/depth where available
observed paper execution timings
observed fill/slippage/markout data
```

‏כל evidence חייב לשאת provenance מפורש.

---

## ‏11. Promotion Criteria

‏Replay infrastructure יכולה להתקדם מ־Prototype ל־Baseline רק אם:

1. ‏אותו Dataset/Version/Config/Seed מייצר אותו Decision Ledger במספר reruns.
2. ‏כל Strategy timer משתמש ב־ReplayClock semantics.
3. ‏Ordering policy מפורשת ו־versioned.
4. ‏Shared Core משמש גם Replay וגם Shadow/Paper ככל האפשר.
5. ‏Whole-market coverage/validity מדווחים.
6. ‏Run Manifest מספיק לשחזור.
7. ‏Recorded facts ו־simulated consequences נשמרים בנפרד.
8. ‏Execution model versioned.
9. ‏Position/Order/Risk invariants נשמרים.
10. ‏Replay structurally אינו יכול להגיע ל־real execution endpoint.
11. ‏Golden suite כוללת normal + key failure scenarios.
12. ‏Run Diff מזהה First Divergence בזמן וב־layer.
13. ‏Output artifacts immutable/auditable.
14. ‏Performance mode אינו משנה semantics של Functional mode.

### ‏Promotion ל־Checkpoints

‏רק אם startup/seek latency הוא bottleneck מדוד, ו־checkpoint parity מול full replay מוכחת.

### ‏Promotion ל־Fault Injection

‏רק לאחר deterministic baseline, כדי שלא נבלבל fault effect עם nondeterminism קיים.

---

## ‏12. Rejection Criteria

‏Replay Evidence נדחה או מסומן `UNTRUSTED` כאשר:

- ‏Ordering אינו deterministic.
- ‏Wall clock חודר ל־Strategy semantics.
- ‏Replay speed משנה outputs פונקציונליים ללא סיבה מוצהרת.
- ‏Dataset השתנה תחת אותו ID/checksum.
- ‏Randomness משפיעה ללא seed/version.
- ‏Replay ו־Shadow/Paper משתמשים ב־Core שונה מהותית.
- ‏Whole-market Rank מחושב מ־Universe חלקי ללא degradation flag.
- ‏Execution simulation אינה versioned.
- ‏Warm-up חסר אך features מסומנים valid.
- ‏Checkpoint אינו compatible עם state/schema version.
- ‏Recorded vs simulated provenance אינו ברור.
- ‏Side-effect isolation אינו מוכח.
- ‏Run אינו reproducible.
- ‏השוואה נעשית רק לפי PnL ללא divergence/context.

---

## ‏13. Metrics

### ‏Determinism

```text
RerunMatchRate
LedgerHashMatchRate
UnexpectedDivergenceCount
NondeterminismIncidentCount
```

### ‏Coverage / Fidelity

```text
SymbolCoverageRatio
SequenceGapRate
StaleEventRate
DegradedReplayDuration
HighMediumLowFidelityRunCount
```

### ‏Debuggability

```text
TimeToReproduceIncident
TimeToFirstDivergence
UnknownRcaRateAfterReplay
GoldenScenarioCoverage
```

### ‏Research Velocity

```text
MedianFunctionalReplayDuration
ExperimentsPerDay
SuiteDuration
SeekStartupLatency
```

### ‏Performance

```text
SustainableEventRate
P95/P99ProcessingLag
MaxQueueDepth
PeakMemory
```

### ‏Simulation Calibration

```text
FillPriceError
FillRateError
LatencyError
SlippageError
MarkoutError
```

‏Calibration metrics אינם משנים recorded facts; הם משפרים את Simulation Model בלבד.

---

## ‏14. Failure Modes

### ‏Hidden Wall-Clock Dependency

```text
1x != MAX_SPEED
```

‏תגובה: locate time leak → fix → permanent regression scenario.

### ‏Concurrency Nondeterminism

‏אותו run מייצר rank/tie שונה.

‏תגובה: deterministic barrier/merge/publication order.

### ‏Dataset Mutation

‏אותו `DatasetId` עם checksum אחר.

‏תגובה: invalidate evidence → create new dataset version.

### ‏Partial-Universe False Winner

‏Rank נראה טוב רק כי competitors חסרים.

‏תגובה: degrade/invalidate ranking validity.

### ‏Warm-Up Contamination

‏Feature defaulted במקום `NOT_READY`.

‏תגובה: explicit warm-up + block affected decision.

### ‏Simulation Mistaken for Fact

‏Hypothetical fill מוצג כ־observed.

‏תגובה: provenance separation.

### ‏Side-Effect Escape

‏Replay יכול resolve real broker/side-effect adapter.

‏תגובה: `P0` architecture failure / fail fast.

### ‏Checkpoint Drift

‏Seek-to-T שונה מ־full-replay-to-T.

‏תגובה: compatibility + state-hash parity tests.

### ‏Replay-Specific Logic Drift

‏Replay “עובר” אך Shadow/Paper משתמשים ב־Core אחר.

‏תגובה: collapse logic back into shared core or document explicit adapter difference.

---

## ‏15. User-Specific Application

‏למערכת שלנו יש ארבעה מאפיינים שמעלים את חשיבות Replay:

```text
broad universe
cross-sectional ranking
short signal half-life
execution-sensitive outcome
```

‏לכן ה־baseline המותאם הוא:

```text
Record/reconstruct whole-market canonical state
→ deterministic ReplayClock
→ same ranking cadence
→ persist Top-K + reasons
→ same Risk/Safety semantics
→ versioned execution simulation
→ compare decision timelines
→ first-divergence RCA
```

‏לכל Incident או שינוי מהותי נרצה לענות:

```text
What was knowable at T?
Was the market-wide ranking valid?
Why was candidate A above B/C?
When did the signal/rank decay?
Was prediction, data, ranking, execution or risk the first divergence?
What did NO_TRADE imply under the same tape?
What did Champion and Challenger do differently first?
```

‏ה־Replay אינו משמש כדי לבחור בדיעבד את הפעולה הטובה ביותר; הוא משמש כדי לשחזר ולהשוות policies שהוגדרו מראש.

---

## ‏16. Confidence

### ‏High Confidence

- ‏Replay deterministic דורש clock, ordering, tie-breaks ו־seed מפורשים.
- ‏Recorded facts חייבים להיות נפרדים מ־simulated consequences.
- ‏Shared Core מפחית Research/Serving skew.
- ‏Whole-market ranking דורש coverage מספיק.
- ‏Immutable datasets/manifests נדרשים ל־reproducibility.
- ‏First Divergence הוא primitive מרכזי ל־RCA והשוואת גרסאות.

### ‏Medium Confidence

- ‏ה־Golden Scenario set המינימלי המדויק.
- ‏מתי Checkpoints מצדיקים את המורכבות.
- ‏Retention tiers המדויקים.
- ‏היקף Performance Replay שיידרש בפועל.

### ‏Unproven

- ‏הערך של queue/depth simulation מתקדם למערכת שלנו.
- ‏כמה distributed replay יידרש.
- ‏כמה Replay כשלעצמו ישפר economics; הוא Evidence infrastructure, לא מקור Edge.

---

## ‏17. Time-Sensitive Facts

‏ה־Policy מתודולוגית ואינה מניחה capability קבועה של Broker/Data Provider.

‏לפני implementation מול ספק מסוים יש לאמת בזמן אמת:

- ‏אילו timestamp ו־sequence fields זמינים.
- ‏Historical trades/quotes resolution ו־coverage.
- ‏האם receive timestamps זמינים או נרשמים אצלנו.
- ‏L1/L2 retention capabilities.
- ‏Session/Halt/Status semantics.
- ‏Broker event/order/fill fields הזמינים להקלטה.
- ‏Data licensing/retention restrictions כאשר רלוונטי.

‏שינויים כאלה יוצרים Reference/Capability update; הם אינם משנים את העקרונות של determinism, provenance ו־reproducibility.

---

## ‏18. Priority Map

### ‏`P0`

- ‏Shared Core.
- ‏ReplayClock.
- ‏Deterministic ordering.
- ‏Immutable Dataset/Run identity.
- ‏Recorded/Derived/Simulated provenance.
- ‏Whole-market validity semantics.
- ‏Warm-up correctness.
- ‏Side-effect isolation.
- ‏Position/order/risk invariants.
- ‏Reproducible reruns.

### ‏`P1`

- ‏Structured ledgers.
- ‏Output hashes.
- ‏Speed invariance.
- ‏First-Divergence diff.
- ‏Golden Replay Suite.
- ‏Incident replay packets.

### ‏`P2`

- ‏Checkpoint/Seek.
- ‏Fault Injection.
- ‏Restart/Reconciliation Replay.
- ‏Performance Stress suite.
- ‏Replay UI.

### ‏`P3`

- ‏Automatic divergence visualization.
- ‏Scenario coverage automation.
- ‏Counterfactual branching orchestration.
- ‏Shadow-vs-Replay parity automation.

### ‏`P4`

- ‏L3/queue simulation.
- ‏Distributed Replay.
- ‏Advanced impact simulation.

---

## ‏19. Concrete Baseline Contract

### ‏Replay lifecycle

```text
CREATED
→ LOADING
→ WARMING_UP
→ RUNNING
↔ PAUSED
→ COMPLETED
```

‏Branches:

```text
SEEKING
FAILED
CANCELLED
```

### ‏Functional scheduler advances to

```text
next market event
next virtual timer
next scanner cadence boundary
next execution-simulation event
```

### ‏Debug controls

```text
NEXT_EVENT
NEXT_DECISION
NEXT_ORDER
NEXT_FILL
NEXT_INTERVAL
```

‏הם אינם משנים semantics.

### ‏Run result minimum

```text
RunManifest
DecisionLedger
OrderLedger
FillLedger
PositionRiskLedger
DataQualityLedger
OutputHashes
Warnings / Fidelity
FinalState
```

---

## ‏20. Definition of Done

‏`CC12 — Recommended Replay Policy` נחשב מיושם ברמת Recommendation כאשר:

1. ‏יש distinction חד בין Replay, Backtest ו־Simulation.
2. ‏Shared Core הוא default architectural decision.
3. ‏Virtual Clock ו־ordering contract מוגדרים.
4. ‏Dataset/Run/version identity מוגדרים.
5. ‏Recorded/Derived/Simulated provenance מוגדר.
6. ‏Whole-market ranking integrity מכוסה.
7. ‏Warm-up ו־data quality states מכוסים.
8. ‏Ledgers ו־hashes מוגדרים.
9. ‏First Divergence הוא comparison primitive.
10. ‏Golden Replay Suite מוגדרת כ־baseline.
11. ‏Side-effect isolation מוגדר כ־`P0`.
12. ‏Promotion/Rejection criteria מפורשים.
13. ‏Metrics ו־Failure Modes מפורשים.
14. ‏Advanced simulation/checkpoints/distributed replay אינם נכנסים מוקדם ללא Evidence.

---

## ‏21. Recommendation Summary

```text
Immutable Tape
→ Deterministic Ordering
→ ReplayClock
→ Shared Core
→ Simulated Execution Boundary
→ Structured Ledgers
→ Output Hashes
→ First Divergence
→ RCA / Regression / Controlled Comparison
```

‏ברירת המחדל:

```text
Reproducibility first
→ Fidelity second
→ Speed third
```

‏Replay מהיר שאינו deterministic אינו כלי Evidence אמין.

‏Replay עשיר שאינו משתמש באותו Core עדיין עלול לבדוק מערכת אחרת.

‏המטרה היא Time Machine executable: לחזור לרגע, לבנות מחדש את הידע וה־state של המערכת, לקבל שוב את אותה החלטה, ולשנות גורם אחד בלבד כאשר רוצים ללמוד.