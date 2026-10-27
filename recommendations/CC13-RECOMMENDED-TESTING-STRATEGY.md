# ‏Cross-Cutting 13 — Recommended Testing Strategy

> ‏מטרת המסמך: לסנתז את Recommendation Sheets של Testing Best Practices, Replay, Backtest, Execution, Risk, Safety, Recovery, Data Engineering ו־Readiness לאסטרטגיית `Testing` אחת deterministic, risk-based, fast-feedback ו־evidence-producing עבור `Research / Replay / Shadow / Paper`.
>
> ‏המסמך אינו אישור `Live` ואינו מגדיר בדיקות שמטרתן להפעיל מסחר אמיתי. הוא מגדיר כיצד להוכיח correctness, determinism, safety semantics, recovery, economic math ו־behavioral stability בסביבות מחקריות ומבודדות.

---

## ‏1. Decision

‏מטרת `Testing` אצלנו אינה:

```text
maximize line coverage
or
make CI green
```

‏אלא:

```text
Critical Contract Coverage
+ Invariant Coverage
+ Timeline Coverage
+ Failure-Mode Coverage
+ Recovery Coverage
+ Economic Correctness
+ Replay Reproducibility
+ External Contract Conformance
```

‏ה־Testing Strategy צריכה להגן קודם כול על כל דבר שיכול לשנות:

```text
Market Truth
Decision Truth
Exposure Truth
Order / Fill Truth
Risk / Safety State
Recovery State
Economic Outcome
Evidence Reproducibility
```

‏העיקרון המחייב:

```text
Test value
=
meaningful contract protected
× failure class detected
÷ feedback cost
```

‏לכן `100% line coverage` אינו יעד־על, ו־E2E כבד אינו הוכחה טובה יותר כאשר Unit/Property/Replay קטן יכול להוכיח את אותו contract בצורה מהירה ודטרמיניסטית יותר.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏Testing Pyramid מותאם למערכת Event-Driven

‏ברירת המחדל:

```text
Many Fast Unit / Property / Invariant Tests
        ↓
Component / Reducer / State-Machine Tests
        ↓
Deterministic Integration Tests
        ↓
Mini Replay / Golden Scenario Tests
        ↓
Fault / Recovery Tests
        ↓
Large Replay / Stress / Performance Suites
        ↓
Controlled Paper / External Conformance
        ↓
Small End-to-End Acceptance Layer
```

‏כל behavior ייבדק בשכבה **הזולה והנמוכה ביותר** שיכולה להוכיח אותו באמת.

‏לא נרים full system כדי לבדוק rounding, TTL boundary או transition קטן.

### ‏`P0 — Required`: ‏Fast Suite הוא Gate לכל שינוי

‏`Fast` חייב להיות:

```text
deterministic
hermetic
network-free
broker-free
wall-clock-sleep-free
parallel-friendly where isolated
small enough to run constantly
```

‏יעד Engineering התחלתי:

```text
Preferred: ~1–3 minutes
Investigate aggressively: >5 minutes
Architecture RCA: sustained drift toward 10+ minutes
```

‏אלה Targets ולא Truth אוניברסלי; אם הם מפסיקים להתאים, משנים אותם על בסיס measurement.

### ‏`P0 — Required`: ‏Time הוא Dependency מפורש

‏כל logic תלוי זמן מקבל Clock/Scheduler controllable.

‏נבדוק דטרמיניסטית:

```text
feature age
quote age
signal TTL
candidate TTL
order TTL
cooldown
position max hold
recovery timeout
session boundaries
heartbeat / stale transitions
```

‏ללא `sleep` כדי “לחכות שזה יקרה”.

### ‏`P0 — Required`: ‏Critical Invariants קודמים ל־Examples

‏Baseline invariants:

```text
FilledQty <= AuthorizedQty

PotentialExposure
= FilledExposure
+ PotentiallyLiveExposure

StaleRequiredData
=> no actionable new-entry candidate

UNKNOWN_EFFECT
=> no blind duplicate side effect

CancelRequested
!= Canceled

Flat
=> Position == 0
   AND no potentially-live exposure
   AND no unresolved execution effect

SafetyBlockNewEntries
=> no risk-increasing intent reaches execution side effect

ReplaySameInputs
=> same semantic outputs
```

### ‏`P0 — Required`: ‏Property-Based Testing ל־state classes

‏Property tests יכסו מחלקות של states ולא רק דוגמאות ידניות.

‏High-value properties:

```text
Duplicate event idempotence
Duplicate fill idempotence
No future knowledge
Exposure conservation
Deterministic ranking
No overfill
No duplicate economic effect
Restart idempotence where external truth unchanged
Safety monotonicity
Unknown never silently becomes safe
```

‏Failure seed נשמר, ו־shrinking מועדף כדי לייצר minimal reproducer.

### ‏`P0 — Required`: ‏State-Machine Transition Coverage

‏כל state machine קריטית מקבלת:

```text
legal transitions
illegal transitions
late-event semantics
terminal-state semantics
restart semantics
reconciliation semantics
```

‏Execution coverage כולל לפחות:

```text
CREATED → SUBMITTING → WORKING → PARTIALLY_FILLED → FILLED
WORKING → CANCEL_REQUESTED → PARTIALLY_FILLED → CANCELED
SUBMITTING → UNKNOWN_EFFECT → RECONCILING → resolved state
```

‏בדיקה אינה מסתיימת ב־“לא נזרקה Exception”; היא מוכיחה את ה־state, exposure, reservation, journal ו־next action.

### ‏`P0 — Required`: ‏Deterministic Replay כ־Regression Gate

‏אותו:

```text
DatasetId
Code / Build Identity
StrategyVersion
ConfigFingerprint
Feature / Rank / Risk / Execution versions
RandomSeed
```

‏חייב להחזיר אותו semantic stream.

‏נשמור לפחות:

```text
DecisionHash
OrderIntentHash
FillLedgerHash when deterministic
FinalStateHash
```

‏שינוי Hash לא מוסבר מחייב `Behavioral Diff`, לא רק update של expected snapshot.

### ‏`P0 — Required`: ‏Golden Scenario Corpus קטן ומשמעותי

‏Baseline corpus יכלול לפחות:

```text
GS-001 normal full lifecycle → flat
GS-002 partial fill → cancel remainder → flat
GS-003 cancel/fill race
GS-004 unknown submit effect → reconcile
GS-005 restart with open order / exposure state
GS-006 stale candidate rejected
GS-007 duplicate execution callback
GS-008 out-of-order callback
GS-009 feed gap → trust degraded → new entry blocked
GS-010 safety trip during partial exposure
GS-011 flat local position but working order still exists
GS-012 provider generation / reconnect transition
GS-013 deterministic rank tie-break
GS-014 NO_TRADE because executable economics fail
GS-015 recovery requires explicit readiness before resume
GS-016 whole-market coverage degradation invalidates actionable rank
```

‏Golden Scenario בודק semantic outcome ו־reason codes; הוא אינו dump ענק שאיש אינו קורא.

### ‏`P0 — Required`: ‏Incident / Near-Miss → Regression Test

‏כל incident משמעותי או near miss עובר:

```text
Incident
→ RCA
→ First Divergence
→ Minimal Reproducer
→ Regression Test
→ Similar-Area Search
→ Permanent Scenario / Property where appropriate
```

‏“תיקנו את המקום שנשבר” אינו סוף העבודה.

### ‏`P0 — Required`: ‏Flaky Test הוא Bug

‏Flake מסווג כ־:

```text
PRODUCT_NONDETERMINISM
TEST_NONDETERMINISM
INFRA_FAILURE
DATA_CONTRACT_INSTABILITY
PERFORMANCE_VARIANCE
```

‏אסור:

```text
fail
→ retry
→ pass
→ erase first failure
```

‏Retry תשתיתי, אם נדרש, אינו מוחק את failure הראשון ואינו הופך את ה־run ל־clean.

### ‏`P0 — Required`: ‏RCA לפני התקדמות לאחר Failure מהותי

‏כאשר CI מחזיר Error/Warning משמעותי:

```text
What failed?
→ Why?
→ Which contract/invariant was missing or violated?
→ Where else can the same class exist?
→ What architectural/test change prevents recurrence?
→ Add regression coverage
→ then continue
```

‏הכלל חשוב במיוחד עבור:

```text
dropped events
sequence gaps
future-knowledge leakage
unknown-effect retry
duplicate side effects
position mismatch
reconciliation failure
performance regression
flaky concurrency
```

### ‏`P1 — Preferred Default`: ‏Risk-Based Test Depth

‏CI depth נקבע לפי השפעת השינוי.

‏Risk classes גבוהים במיוחד:

```text
Execution
Risk
Safety
Recovery
Position Accounting
Point-in-Time Semantics
Data Integrity
Broker / Provider Boundary
Persistence / Restart
```

‏שינוי ב־UI text אינו מקבל אותה מטריצת בדיקות כמו שינוי ב־`PotentialExposure`.

### ‏`P1 — Preferred Default`: ‏Pre-Merge Gate לפי Change Risk

‏לכל שינוי:

```text
Fast green
```

‏לשינוי ב־critical subsystem:

```text
+ relevant component/integration
+ relevant mini replay/golden
+ no unexplained warnings
```

‏לשינוי behavior כלכלי/Execution/Recovery:

```text
+ Behavioral Diff reviewed
+ relevant fault/recovery scenarios
```

### ‏`P1 — Preferred Default`: ‏Large Suites מחוץ ל־Fast Path

‏`Nightly / On-demand / Release` יכולים לכלול:

```text
full-session replay
multi-regime corpus
wide fault matrix
stress / soak
performance regression
reconnect bursts
larger historical regression corpus
controlled provider/broker conformance
```

‏כך נשמרים גם Fast Feedback וגם depth.

---

## ‏3. Why

### ‏Fact

‏מערכת Event-Driven יכולה לשנות outcome בגלל ordering, timing, freshness, partial fills, retries, persistence, reconnect ו־concurrency — גם כאשר business rule יחיד נראה פשוט.

### ‏Fact

‏Line Coverage אינו מוכיח failure-mode coverage או invariant coverage.

### ‏Fact

‏Wall-clock sleeps ו־uncontrolled scheduling מייצרים tests איטיים וקשים לשחזור.

### ‏Fact

‏Replay deterministic מאפשר להפוך incidents ו־behavior changes ל־reproducible evidence.

### ‏Judgment

‏ה־Fast suite צריך להגן בעיקר על domain contracts, invariants ו־small state machines; seams גדולים יותר נבדקים בשכבות Integration/Replay.

### ‏Judgment

‏Full-day replay, fault matrix רחבה ו־performance stress חשובים, אך אינם צריכים לשבת ב־default edit loop.

### ‏Judgment

‏במערכת Short-Horizon, quality של test failure artifact ויכולת reproduction חשובות כמעט כמו עצם גילוי ה־failure.

### ‏Hypothesis

‏Mini Replay corpus קטן אך איכותי ייתן יותר protection-per-second מאוסף גדול של E2E tests רחבים.

### ‏Hypothesis

‏Risk-based CI selection יקטין feedback time בלי להקטין materially את defect detection עבור critical paths; יש למדוד זאת.

---

## ‏4. Use When

‏ה־Baseline מתאים במיוחד כאשר קיימים:

```text
whole-market scanner
short signal half-life
asynchronous market data
cross-sectional ranking
stateful risk/execution
partial fills
recovery/reconciliation
Replay / Paper parity requirements
```

‏הוא מתאים גם בשלבי Research מוקדמים, משום שרוב החוזים המסוכנים ניתנים לבדיקה ב־Fake / Replay / Simulation ללא external side effect אמיתי.

---

## ‏5. Do Not Use When

‏אין להפוך את הפירמידה לדוגמה קשיחה.

‏לדוגמה:

- ‏Pure math library יכולה להיות כמעט כולה Unit/Property.
- ‏Provider/Broker Adapter דורש יותר Contract/Conformance.
- ‏Operator UI קריטי יכול להצדיק מעט Browser E2E.
- ‏Performance subsystem יכול לדרוש benchmark harness נפרד.

‏העיקרון נשאר:

```text
Use the cheapest layer that can prove the real contract.
```

---

## ‏6. Recommended Test Layers

### ‏6.1 `FAST_DOMAIN`

‏רץ בכל שינוי.

‏כולל:

```text
feature math
eligibility
ranking tie-breaks
reason codes
state reducers
risk rules
safety rules
execution invariants
position accounting
economic math
serialization/config validation
small property tests
small state-machine tests
```

### ‏6.2 `COMPONENT`

‏בודק subsystem עם dependencies נשלטים:

```text
Canonical Data → Market State
Market State → Features
Features → Eligibility / Rank
Decision → Risk
Risk → Execution Intent
Broker Events → Canonical Execution State
Journal → Recovery State
```

### ‏6.3 `INTEGRATION`

‏בודק seams אמיתיים יותר בלי external production dependencies.

‏מטרתו:

```text
contract compatibility
state propagation
ordering across boundaries
persistence/reload semantics
error propagation
```

### ‏6.4 `MINI_REPLAY / GOLDEN`

‏בודק:

```text
determinism
point-in-time semantics
cross-sectional behavior
TRADE / NO_TRADE / UNKNOWN
order/fill lifecycle
recovery sequence
first divergence
```

### ‏6.5 `FAULT / RECOVERY`

‏מזריק במפורש:

```text
timeout
dropped ACK
duplicate event
out-of-order event
sequence gap
stale feed
provider disconnect
broker disconnect
slow persistence
process crash
queue overload
clock anomaly
partial fill
cancel/fill race
unknown effect
```

### ‏6.6 `PERFORMANCE`

‏בודק:

```text
event throughput
feature throughput
scanner cycle
rank publish latency
queue age
backpressure
burst handling
recovery duration
memory / allocation trends
```

‏`Correctness Replay` ו־`Performance Replay` נשארים מטרות שונות.

### ‏6.7 `CONFORMANCE`

‏בודק semantics חיצוניים שה־Fake אינו יכול להוכיח:

```text
schema / field contracts
timestamp semantics
sequence semantics
cancel/replace mapping
partial-fill callbacks
ID stability
reconnect behavior
unsupported capabilities
```

‏בסיס המסמך מגביל זאת ל־sandbox/paper/recorded conformance; אין צורך ב־real-money side effects.

### ‏6.8 `ACCEPTANCE`

‏מספר קטן של journeys end-to-end שמוכיחים wiring מלא.

‏הם אינם replacement ל־domain invariants.

---

## ‏7. Time / Scheduler Contract

‏כל רכיב תלוי זמן יקבל dependency מפורש:

```text
Clock
Scheduler
EvaluationTime
Deadline
Expiry
```

‏בדיקות boundary:

```text
threshold - epsilon
threshold
threshold + epsilon
```

‏ל־:

```text
TTL
freshness
latency budget
price bound
risk limit
position timeout
```

‏`Sleep` אינו synchronization strategy.

---

## ‏8. Determinism Contract

‏מקורות nondeterminism שייאסרו או ינוהלו במפורש:

```text
wall-clock reads
unseeded randomness
unordered iteration
unstable sorting
implicit DB ordering
filesystem enumeration ordering
race-dependent publication
parallel reduction with unstable semantics
```

‏כל randomness המשפיעה על outcome מקבלת seed.

‏כל tie מקבל deterministic tie-breaker.

‏Parallelism מותר רק אם publication/merge semantics נשארים deterministic במקום שבו החוזה דורש זאת.

---

## ‏9. Property / Invariant Catalog

### ‏Data

```text
DuplicateEconomicEventDoesNotDoubleCount
UnknownNeverSilentlyBecomesZero
AsKnownAtNeverUsesFutureAvailability
GapChangesQualityStatePredictably
ProviderGenerationInvalidatesOldDependentState
```

### ‏Scanner / Ranking

```text
SameStateSameConfigSameRank
IneligibleCannotBecomeActionable
CoverageFailureBlocksActionableWholeMarketRank
NO_TRADEAlwaysAllowed
IterationOrderDoesNotCreateWinnerBias
```

### ‏Risk / Safety

```text
StrategyCannotWeakenSafetyState
UnknownRiskTruthCannotAuthorizeNewExposure
ReservationCannotBeDoubleSpent
SafetyBlockPreventsNewRisk
RiskReducingCapabilityIsEvaluatedSeparately
```

### ‏Execution

```text
DuplicateIntentDoesNotDuplicateExposure
DuplicateFillDoesNotDoublePosition
CancelRequestedDoesNotReleaseRiskPrematurely
UnknownEffectRequiresReconciliation
PotentialExposureNeverExceedsAuthorization
```

### ‏Position

```text
PositionEqualsAuthoritativeProcessedFillsAfterReconciliation
FlatMeansNoFilledAndNoPotentiallyLiveExposure
EveryPositionChangeHasEvidence
```

### ‏Recovery

```text
RestartDoesNotEraseExternalReality
RestartTwiceEqualsRestartOnceWhenExternalTruthUnchanged
ResumeRequiresVerifiedReadiness
OldEpochIntentCannotCreateNewRisk
```

### ‏Research

```text
FeatureAtTUsesOnlyAllowedAvailability<=T
LabelsNeverEnterFeatureInputs
SameManifestReproducesSemanticRun
ExperimentArtifactRetainsOriginalDatasetIdentity
```

---

## ‏10. Execution Boundary Matrix

‏Automated coverage נדרש לפחות ל־:

```text
full fill
partial fill
multiple partial fills
reject
cancel
cancel/fill race
replace overlap
timeout before definitive response
ACK lost after external acceptance
duplicate callback
out-of-order callback
late fill after cancel request
late fill after strategy abandonment
disconnect during entry
disconnect during exit
restart with working order
restart with unknown fill
orphan order
position mismatch
unknown effect
safety trip during partial fill
ownership/split-brain prevention scenario
```

‏כל Scenario מוכיח לפחות:

```text
Position
PendingExposure
RiskReservation
Order/Intent State
Journal Evidence
Allowed Next Action
```

---

## ‏11. Recovery Test Contract

‏בכל recovery scenario נשווה:

```text
Local Journal
Observed Open Orders
Observed Executions/Fills
Observed Position
Risk Reservations
Pending Exposure
Safety State
Execution Epoch
Readiness Evidence
```

‏ונדרוש convergence למצב explainable.

‏נמדוד:

```text
DetectionTime
ContainmentTime
ReconciliationTime
ReadyAgainTime
```

‏`Connection restored` אינו assertion של Recovery complete.

---

## ‏12. Safety Test Contract

‏לפחות:

```text
safety trip while idle
trip during submit
trip during partial fill
trip while exit pending
stale feed with no position
stale feed with existing exposure
broker disconnect with working entry
broker disconnect with working exit
position mismatch
unknown effect
critical latch survives restart
resume requires explicit validation
```

‏Expected properties:

```text
new risk blocked
existing exposure remains managed where safely possible
critical latch persists
resume is not automatic
```

---

## ‏13. Data / Market-State Tests

‏נבדוק:

```text
duplicate trades
same-timestamp distinct events
out-of-order sequence
gap
provider generation/reset
reconnect backlog
stale quote
fresh trade + stale quote
torn quote
locked/crossed state
unknown enum
schema drift
unit mismatch
partial universe
```

‏Assertion כולל:

```text
value
quality state
reason code
freshness
provenance
```

‏ולא value בלבד.

---

## ‏14. Scanner / Ranking Tests

‏נבדוק:

```text
Top1
TopK
ties
missing features
stale candidate
filtered candidate
low coverage
warm-up
rank drift during Deep Path
deep-result expiry
NO_TRADE
UNKNOWN
iteration-order independence
```

‏Metamorphic properties מותרות רק כאשר monotonicity באמת חלק מה־Feature/Rank contract.

---

## ‏15. Research / Leakage Tests

‏נחזיק automated checks ל־:

```text
future timestamp violation
availability-time violation
feature/label separation
shifted-label canary
shuffle-label sanity
time-shift sanity
train/validation/test chronology
point-in-time universe
normalization fit window
cost/execution model version binding
```

‏`Leakage Canary` מכוון הוא Challenger בעל ערך: הכנסת future input בלתי־חוקי צריכה להיכשל בקול רם.

---

## ‏16. Economic Correctness Tests

‏נבדוק contracts לגרסאות המודלים שלנו:

```text
price precision
tick/price rounding
quantity rounding
fees
minimum fee semantics
spread cost
slippage
impact estimate
adverse-selection component
average fill price
partial fills
realized result
net result
```

‏External fee schedule משתנה אינו hardcoded כ־Truth בתוך test framework; fixture/config versioned מוכיח את המתמטיקה של המודל הנתון.

‏Attribution צריך להיסגר לפי ה־contract:

```text
Gross
- Explicit Costs
- Spread
- Slippage
- Impact
- Other Modeled Friction
= Net
```

---

## ‏17. Performance / Backpressure Tests

‏נמדוד distributions ולא ממוצע יחיד:

```text
P50
P95
P99
```

‏ל־:

```text
feature update
scanner cycle
ranking
Deep Path
decision path
queue age
exit-to-flat in simulation/paper
recovery-to-ready
```

‏Load scenarios:

```text
baseline load
burst load
hot-symbol skew
reconnect flood
slow storage
slow logger
slow deep path
```

‏נדרש להוכיח:

```text
queue age is visible
no silent stale decisions
critical events are preserved
optional work sheds before critical work
trust loss blocks new-risk decisions
recovery restores readiness before resume
```

‏Performance regression gate יסתמך על repeated measurements/trends ולא על run יחיד רועש.

---

## ‏18. Concurrency Tests

‏Races קריטיים ייבדקו ב־controlled interleavings, לא בתקווה שה־scheduler יפיק אותם במקרה.

‏לדוגמה:

```text
A reads order state
PAUSE A
B applies fill
RESUME A
```

‏Stress concurrency משלים את הבדיקה, אך אינו מחליף reproducer דטרמיניסטי.

---

## ‏19. Test Data Strategy

‏נחזיק שלושה סוגי fixtures:

### ‏Tiny Synthetic

‏Minimal cases לחוק אחד.

### ‏Recorded Real / Recorded Paper

‏Quirks אמיתיים של data/broker semantics ללא יצירת Risk חי.

### ‏Historical Regression Corpus

‏חלונות כגון:

```text
quiet session
open burst
high volatility
halts/status transitions
provider degradation
reconnect flood
wide spreads
rank churn
```

‏כל Fixture משמעותי כולל:

```text
FixtureId
DatasetId / Source
SchemaVersion
ParserVersion
TimeRange
Provenance
ExpectedProperties
```

---

## ‏20. Failure Artifact Contract

‏Failure משמעותי שומר:

```text
TestId
Classification
Seed
Fixture / EventStream
ConfigFingerprint
Versions
Relevant State Trace
Decision Trace
ReasonCodes
FirstDivergence
Minimal Reproduction Command
```

‏המטרה:

```text
failure observed
→ reproducible locally
→ minimal reproducer
→ RCA
→ permanent protection
```

---

## ‏21. CI Strategy

### ‏Fast — every change

```text
Unit
Property
State Machine
Core Invariants
Config / Serialization
Tiny Golden where cheap
```

### ‏Relevant Deep — change/risk based

```text
Component
Integration
Mini Replay
Golden
Targeted Fault/Recovery
Behavioral Diff
```

### ‏Nightly / On-Demand / Release

```text
Full-session replay
Historical corpus
Wide fault matrix
Stress / Soak
Performance trends
Large scenario sets
Controlled conformance
```

‏ה־CI חייב להציג גם:

```text
slowest tests
suite duration trend
flaky/quarantine state
failure classification
```

---

## ‏22. Acceptance Scenarios

‏מספר קטן בלבד:

### ‏A — Normal lifecycle

```text
Fresh State
→ Candidate
→ Risk/Safety/Compliance allow
→ Simulated/Paper Entry
→ Fill
→ Exit
→ Verified Flat
→ Complete Evidence
```

### ‏B — Partial fill + signal expires

```text
Candidate
→ Partial Fill
→ Signal/Entry validity expires
→ Cancel remainder
→ Exit actual filled quantity
→ Verified Flat
```

### ‏C — Healthy NO_TRADE

```text
Rank #1 exists
→ executable economics / veto fails
→ NO_TRADE
→ reason/evidence preserved
```

### ‏D — Unknown effect recovery

```text
Attempt
→ transport ambiguity
→ UNKNOWN_EFFECT
→ duplicate attempt blocked
→ reconcile
→ rebuild state
```

### ‏E — Data degradation and recovery

```text
Data trust lost
→ block new risk
→ maintain safe existing-state handling
→ restore feed
→ warm/revalidate
→ explicit resume
```

---

## ‏23. Browser / UI Testing Policy

‏Browser E2E ישמש רק ל־operator workflows שבאמת תלויים ב־UI:

```text
pause / resume
safety state visibility
critical diagnostic visibility
mode/environment visibility
manual acknowledgement where required
```

‏Business invariants נשארים Domain/Component/Replay tests גם אם יש UI שמציג אותם.

---

## ‏24. Alternatives

### ‏Alternative A — E2E-heavy

```text
+ broad wiring confidence
- slow
- flaky
- hard RCA
- poor combinatorial coverage
```

‏לא Baseline.

### ‏Alternative B — Unit-only

```text
+ fast
+ local
- weak on seams
- weak on persistence/recovery/external semantics
```

‏לא מספיק.

### ‏Alternative C — Snapshot-heavy

‏שימושי כאשר ה־artifact עצמו הוא contract; אחרת הוא נוטה ל־noise ו־blind approval.

### ‏Alternative D — Manual/Paper-only validation

‏מתאים ל־discovery/conformance מוגבל, לא ל־Regression Strategy.

### ‏Alternative E — Massive chaos / mutation platform

‏רלוונטי רק לאחר bottleneck/coverage gap מוכח.

---

## ‏25. Trade-offs

### ‏Fast feedback מול breadth

‏נפתר באמצעות Fast required + deeper asynchronous suites.

### ‏Determinism מול realism

‏נדרשים שניהם:

```text
Deterministic correctness suite
+
explicit stochastic/stress experiments with seeds/distributions
```

### ‏Mocks מול external truth

‏Fakes מאפשרים coverage עמוק; Conformance מוכיח external semantics. אף אחד מהם אינו תחליף לשני.

### ‏Golden tests מול maintainability

‏Golden corpus קטן, semantically meaningful ו־incident-driven עדיף על אלפי snapshots.

### ‏Strict gates מול development velocity

‏`P0` invariants קשיחים; Deep suites נבחרות לפי Risk כדי לא להפוך כל edit למחקר של שעה.

---

## ‏26. What I Would Avoid Initially

‏לא נתחיל עם:

- ‏מאות Browser E2E tests.
- ‏Full-day replay בכל commit.
- ‏Real network/broker ב־Fast suite.
- ‏`Thread.Sleep` או wait קבוע ל־correctness.
- ‏Snapshot JSON ענק לכל object.
- ‏Retry אוטומטי שמסתיר first failure.
- ‏100% line coverage כ־release criterion.
- ‏Chaos רחב ללא Hypothesis.
- ‏Mutation testing על כל repository בכל שינוי.
- ‏Shared mutable fixtures שיוצרים order-dependent tests.
- ‏Manual-only critical scenarios.

---

## ‏27. What to Add Later

### ‏`P2`

- ‏Deterministic concurrency harness רחב יותר.
- ‏Broader property/metamorphic generators.
- ‏Automatic behavioral-diff report.
- ‏Larger historical regression corpus.
- ‏Fault-matrix automation.

### ‏`P3`

- ‏Model-based execution testing.
- ‏Targeted mutation testing.
- ‏Dedicated benchmark runners.
- ‏Cross-provider conformance corpus.

### ‏`P4`

- ‏Large chaos platform.
- ‏Distributed test farm.
- ‏Massive browser E2E infrastructure.

‏כל תוספת צריכה להקטין Risk או Feedback Time באופן measurable.

---

## ‏28. Required Data / Evidence

‏כדי להעריך את Testing Strategy נשמור לפחות:

```text
FastSuiteDuration trend
IntegrationDuration trend
ReplaySmokeDuration
NightlyDuration
FlakyRate
QuarantinedCount
FailureReproductionRate
CriticalInvariantCoverage
CriticalFailureModeCoverage
RecoveryScenarioCoverage
IncidentRegressionCoverage
DataContractCoverage
ExecutionContractCoverage
ReplayDeterminismFailures
BehavioralDiffCount
UnexplainedWarningCount
PerformanceRegressionCount
MeanTimeToReproduce
MeanTimeToRCA
```

‏`line_coverage` מותר כ־guardrail משני בלבד.

---

## ‏29. Promotion Criteria

‏Testing architecture יכולה להיחשב Baseline מוכח כאשר:

1. ‏Fast suite דטרמיניסטי ומהיר מספיק להרצה בכל שינוי.
2. ‏אין sleep-based synchronization ב־critical tests.
3. ‏critical data/risk/execution/position invariants מכוסים.
4. ‏Point-in-time/leakage guards קיימים.
5. ‏Replay rerun זהה תחת manifest קבוע.
6. ‏Golden corpus מכסה normal + failure boundaries משמעותיים.
7. ‏Execution partial/cancel/unknown/reconcile scenarios מכוסים.
8. ‏Safety/Recovery scenarios קיימים.
9. ‏Data/Broker contracts נבדקים בשכבה מתאימה.
10. ‏CI failure מייצר reproducer/artifact שימושי.
11. ‏Flaky tests אינם מנורמלים כרעש.
12. ‏Material warning/error עובר triage/RCA.
13. ‏Incident משמעותי הופך ל־regression protection.
14. ‏Full-session/stress/performance suites אינם חונקים את Fast loop.
15. ‏Change-risk mapping מפעיל את ה־deep suites הרלוונטיים.

---

## ‏30. Rejection Criteria

‏נפסול design או שינוי Testing כאשר:

```text
Fast suite slows materially without protection value
sleep added to synchronize correctness
retry hides first failure
critical behavior tested only manually
future knowledge enters fixture
paper/conformance replaces deterministic regression
snapshot noise replaces semantic assertion
shared state makes order-dependent tests
flaky test becomes accepted normal state
critical warning is bypassed without RCA
behavioral hash changes without review
external contract change is silently absorbed
```

---

## ‏31. Metrics

### ‏Feedback Health

```text
fast_suite_duration
p95_fast_test_duration
integration_duration
replay_smoke_duration
nightly_duration
```

### ‏Determinism / Reliability

```text
flaky_rate
nondeterminism_incidents
replay_hash_mismatch_count
order_dependent_test_count
```

### ‏Protection Quality

```text
critical_invariant_coverage
critical_failure_mode_coverage
recovery_scenario_coverage
incident_to_regression_rate
contract_coverage
```

### ‏Debuggability

```text
failure_reproduction_rate
mean_time_to_reproduce
mean_time_to_first_divergence
mean_time_to_RCA
```

### ‏Performance Protection

```text
performance_regression_count
benchmark_variance
queue/backpressure regression count
```

---

## ‏32. Failure Modes

```text
CC13-01 COVERAGE_VANITY
CC13-02 FAST_SUITE_TOO_SLOW
CC13-03 SLEEP_BASED_SYNC
CC13-04 FLAKY_RETRY_HIDDEN
CC13-05 NONDETERMINISTIC_REPLAY
CC13-06 FUTURE_KNOWLEDGE_FIXTURE
CC13-07 PERFECT_MOCK_FALSE_CONFIDENCE
CC13-08 INCIDENT_NOT_REGRESSED
CC13-09 UNKNOWN_EFFECT_UNTESTED
CC13-10 CANCEL_FILL_RACE_UNTESTED
CC13-11 RECOVERY_PATH_UNTESTED
CC13-12 SAFETY_PRIORITY_UNTESTED
CC13-13 SHARED_STATE_INTERFERENCE
CC13-14 PERFORMANCE_REGRESSION_UNDETECTED
CC13-15 CONTRACT_DRIFT_UNDETECTED
CC13-16 WARNING_NORMALIZED
CC13-17 PAPER_AS_REGRESSION_SUITE
CC13-18 SNAPSHOT_WORSHIP
CC13-19 IMPLEMENTATION_COUPLED_ASSERTION
CC13-20 FAILURE_NOT_REPRODUCIBLE
```

---

## ‏33. User-Specific Application

‏למערכת שלנו, ברירת המחדל הקונקרטית היא:

```text
Every change:
  Fast domain/property/invariant suite

Critical subsystem change:
  + relevant component/integration
  + mini golden replay

Behavior-changing execution/risk/recovery change:
  + behavioral diff
  + targeted fault/recovery

Outside edit loop:
  full-session replay
  historical corpus
  stress/performance
  wider conformance
```

‏העקרונות החשובים במיוחד:

1. ‏Fast CI נשאר קטן בכוונה.
2. ‏Waiting מוחלף ב־fake clocks / explicit signals.
3. ‏Feature/Eligibility/Ranking/Risk/Execution invariants נשארים ב־Fast כאשר אפשר.
4. ‏כל boundary bug חשוב הופך ל־Mini Replay fixture.
5. ‏Full-day replay אינו חלק מה־default developer loop.
6. ‏Relevant deep tests נבחרים לפי subsystem ו־Risk Class.
7. ‏First failure נשמר; Retry אינו מנקה אותו.
8. ‏Warning/Error מהותי גורר RCA לפני המשך.
9. ‏Incident/Near Miss משמעותי הופך ל־regression coverage.
10. ‏Slow-test list ו־suite trends נמדדים כדי לשמור על feedback מהיר.

‏המטרה אינה “פחות בדיקות”.

‏המטרה היא:

```text
more protection per second of feedback
```

---

## ‏34. Confidence

### ‏High Confidence

- ‏Invariant-first testing.
- ‏Fake time במקום sleeps.
- ‏Deterministic Replay regression.
- ‏Risk-based test depth.
- ‏Incident-to-test rule.
- ‏Fault/Recovery coverage.
- ‏Flaky failure RCA.
- ‏External contract/conformance testing.
- ‏Fast feedback loop כדרישת Architecture.

### ‏Medium Confidence

- ‏ה־runtime budget המדויק של Fast suite לאורך חיי הפרויקט.
- ‏כמה Mini Replay scenarios צריכים לרוץ בכל merge.
- ‏החלוקה האופטימלית בין Integration ל־Replay gates.
- ‏היקף Property/Metamorphic generation הדרוש בתחילת הדרך.

### ‏Evidence-Only

- ‏Massive mutation testing.
- ‏Large chaos infrastructure.
- ‏Distributed test farm.
- ‏Large browser E2E farm.

---

## ‏35. Time-Sensitive Facts

‏המסמך אינו מקבע Facts חיצוניים תלויי זמן לגבי Broker, Venue או Provider.

‏לעומת זאת, Conformance fixtures חייבים לעבור revalidation כאשר משתנים:

```text
API version
provider schema
broker/sandbox semantics
session semantics
capability contract
external fee/config model used by tests
```

‏שינוי חיצוני מהותי יכול להפוך test evidence ישן ל־stale גם אם הקוד המקומי לא השתנה.

---

## ‏36. Concrete Baseline Contract

```text
TestPolicy
{
  FastSuiteRequired: true,
  NoRealNetworkInFast: true,
  NoExternalBrokerInFast: true,
  NoSleepForCorrectness: true,
  DeterministicClockRequired: true,
  CriticalInvariantCoverageRequired: true,
  ReplayManifestRequired: true,
  FirstFailurePreserved: true,
  FlakyRequiresRCA: true,
  CriticalWarningRequiresTriage: true,
  IncidentToRegressionRequired: true,
  FailureArtifactRequired: true,
  DeepSuiteSelectedByRiskClass: true
}
```

‏CI conceptual mapping:

```text
Fast
→ every change

Relevant Component / Integration / Mini Replay
→ subsystem and risk-class dependent

Fault / Recovery / Behavioral Diff
→ critical behavior-changing changes

Large Replay / Performance / Wide Fault
→ nightly / release / on-demand

Controlled Paper / External Conformance
→ validation stage only
```

---

## ‏37. Recommendation Summary

### ‏Baseline

```text
Fast Domain + Property + Invariant
→ Component Seams
→ Mini Golden Replay
→ Risk-Based Integration
→ Targeted Fault / Recovery
→ Large Replay / Performance outside Fast Loop
→ Controlled Conformance
→ Small Acceptance Layer
```

### ‏Preferred Default

- ‏Critical contracts before coverage percentage.
- ‏Fake time and deterministic scheduling.
- ‏Golden scenarios based on boundaries/incidents.
- ‏Behavioral Diff whenever deterministic outputs change.
- ‏Fast suite as mandatory every-change gate.
- ‏Deep suites selected by change risk.
- ‏Flaky = bug until proven otherwise.
- ‏Failure artifacts optimized for reproduction/RCA.
- ‏No unexplained warning/error before progression.

### ‏Add Later

- ‏Deterministic concurrency harness.
- ‏Broader property/metamorphic generation.
- ‏Automated diff review support.
- ‏Model-based execution testing.
- ‏Targeted mutation testing.
- ‏Dedicated benchmark infrastructure.

### ‏Avoid Unless Evidence

- ‏Massive E2E suite.
- ‏Full-day replay on every edit.
- ‏Real external dependencies in Fast.
- ‏Sleep-based synchronization.
- ‏Blind snapshot approval.
- ‏Retry that hides failure.
- ‏100% coverage theater.
- ‏Chaos/distributed testing infrastructure without measured need.

### ‏Bottom line

```text
Fast enough to run constantly
Deep enough to protect truth and exposure semantics
Deterministic enough to reproduce every important failure
Risk-based enough to keep feedback practical
```

‏Testing אינו שלב אחרון אחרי implementation.

‏הוא המנגנון שמאפשר למערכת להשתנות בלי לאבד את היכולת להוכיח מה היא עושה ולמה.