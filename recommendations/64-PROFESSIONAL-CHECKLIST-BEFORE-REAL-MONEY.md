# ‏64 — Recommendation Sheet: Professional Checklist Before Real Money

> ‏מקור לימודי עיקרי: `../64-PROFESSIONAL-CHECKLIST-BEFORE-REAL-MONEY.md`.
>
> ‏מטרת הקובץ: להגדיר `Go / No-Go` מקצועי ומבוסס Evidence לכל מעבר של מערכת `Short-Horizon Momentum` משלב מחקרי לשלב חיצוני יותר. ההמלצה אינה שואלת אם ה־Strategy “נראית טובה”, אלא אם כל שרשרת ה־Data, Decision, Execution, Exit, Risk, Recovery, Operations ו־Eligibility מוכיחה correctness, controllability ו־risk containment.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא **אינו אישור למסחר בכסף אמיתי**, אינו מגדיר סכום חשיפה, ואינו מחליף זכאות חוקית, הרשאות חשבון או תנאי Broker. כאשר eligibility או permission אינם מאומתים — ברירת המחדל נשארת `Paper / Shadow`.

---

## ‏1. Decision

‏החלטת readiness אינה:

```text
The strategy made money
```

‏ואינה:

```text
The system ran without crashing
```

‏ההחלטה היא:

```text
Can the next controlled stage be entered
without any open P0 blocker,
with evidence that state, risk and external side effects remain bounded,
observable, recoverable and attributable?
```

‏ה־Baseline:

```text
Research Readiness
AND Point-in-Time Correctness
AND Market-Data Readiness
AND Scanner / Veto Readiness
AND Economic Readiness
AND Execution Readiness
AND Exit Readiness
AND Risk Readiness
AND Recovery / Reconciliation Readiness
AND Testing / Performance Readiness
AND Observability Readiness
AND Security / Operations Readiness
AND Eligibility / Account Readiness
→ GO | CONDITIONAL_GO | NO_GO
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Readiness הוא Gate, לא Score

‏לא נשתמש ב־:

```text
ReadinessScore = 93/100
```

‏כדי לעקוף blocker.

‏המודל:

```text
P0 = all must pass
P1 = explicit disposition required
P2 = bounded backlog
```

‏אם `P0` אחד פתוח:

```text
NO_GO for new external risk
```

### ‏`P0 — Required`: אין Promotion על בסיס PnL בלבד

‏Positive outcome אינו יכול לגבור על:

```text
unknown state
broken reconciliation
unverified exit
stale data
unbounded retry
missing kill control
account/environment mismatch
unresolved eligibility
```

### ‏`P0 — Required`: כל GO הוא scoped ו־expiring

‏`GO` תקף רק עבור:

```text
StrategyVersion
BuildVersion
ConfigVersion
Environment
Account / AccountFingerprint
DataProvider / Data Contract
BrokerAdapter / Execution Policy
RiskConfig
Approved Scope
Evidence Window
Expiration / Revalidation Trigger
```

‏שינוי מהותי יכול לפוג readiness קודמת.

### ‏`P0 — Required`: Entry ו־Exit readiness נבחנים בנפרד

‏המערכת יכולה להיות במצב:

```text
SHADOW_READY
ENTRY_BLOCKED
EXIT_ONLY
LIVE_READY
DEGRADED
HALTED
```

‏כשל ביכולת ליצור Risk חדש אינו צריך למחוק אוטומטית יכולת בטוחה לצמצם Risk.

### ‏`P0 — Required`: External truth קודם ל־local confidence

‏לפני readiness נדרש:

```text
Local Positions == Broker Positions
Local Working Orders == Broker Working Orders
Pending Exposure reconciled
No unresolved unknown effect
No unexplained orphan state
```

‏Mismatch מוביל לפחות ל־:

```text
ENTRY_BLOCKED
```

---

## ‏3. Why

‏מערכת קצרה יכולה להיראות נכונה ברמת Strategy ועדיין להיכשל בגלל boundary חיצוני:

```text
prediction good
+ stale data
+ unfair ranking
+ late submit
+ partial fill
+ broken cancel semantics
+ slow exit
+ wrong local exposure
= unsafe / economically invalid outcome
```

‏לכן `Live Readiness` הוא property של המערכת כולה, לא של model יחיד.

---

## ‏4. Readiness Severity Model

### ‏`P0 — Blocker`

‏Failure שאינו מאפשר Promotion.

‏דוגמאות:

```text
state correctness unknown
risk unbounded
exit path unverified
external effect ambiguous without reconciliation
critical data stale
eligibility unresolved
```

### ‏`P1 — Disposition Required`

‏בעיה חשובה שחייבת לקבל אחת מהחלטות:

```text
FIXED
ACCEPTED_WITH_BOUNDS
DISABLED_BY_SCOPE
DEFERRED_WITH_JUSTIFICATION
```

### ‏`P2 — Improvement`

‏שיפור שאפשר להשאיר backlog כאשר:

```text
risk understood
scope bounded
no P0 dependency exists
```

---

## ‏5. Go/No-Go Outcomes

‏נשתמש ב־outcomes מפורשים:

```text
GO
CONDITIONAL_GO
NO_GO
```

### ‏`GO`

‏כל `P0` עבר ואין finding פתוח שמערער את ה־approved scope.

### ‏`CONDITIONAL_GO`

‏מותר רק scope מצומצם ומפורש, למשל:

```text
Shadow only
specific universe
specific session conditions
advanced tactic disabled
specific capability disabled
research-only external calibration
```

### ‏`NO_GO`

‏כל `P0` פתוח, או Evidence אינו מאפשר לדעת אם risk bounded.

---

## ‏6. Research Readiness

‏לפני Promotion חייבים להיות:

```text
Written Edge Thesis
Prediction Target
Executable Outcome
Falsification Criteria
Kill / Suspension Criteria
Protected OOS Evidence
Realistic Costs
Realistic Latency
Realistic Fill Assumptions
Basic Ablation
Regime Coverage
Negative Results Registry
```

‏ה־result לא יכול להישען באופן מהותי על period יחיד, parameter spike יחיד או assumption אופטימי יחיד.

---

## ‏7. Point-in-Time Correctness

### ‏`P0`

‏חובה להוכיח:

```text
Features use only then-known information
Labels cannot leak into features
Universe is point-in-time correct
Corporate actions are explicit
Corrections/backfills preserve knowledge-time semantics
No future joins
No hindsight-cleaned historical state
```

‏Leakage uncertainty מהותי הוא `NO_GO` למחקר הנוכחי.

---

## ‏8. Market-Data Readiness

### ‏Data Provenance

```text
provider
source/feed
schema/version
event time
receive time
sequence semantics
trade/quote conditions
units/precision/size semantics
```

### ‏Quality State

‏לא Boolean `connected`, אלא state כגון:

```text
HEALTHY
DEGRADED
STALE
GAPPED
RECOVERING
UNKNOWN
```

### ‏`P0`

‏נדרש detection ל־:

```text
staleness
gaps
duplicates
out-of-order
snapshot reset
reconnect generation
coverage loss
```

‏Data degradation מהותי חייב להיות מסוגל לחסום Entries חדשים.

---

## ‏9. Scanner Readiness

‏ה־Scanner צריך להוכיח:

```text
determinism under same input
explicit tie-breaking
per-symbol freshness
FreshCoverageRatio
rank timestamp
candidate revalidation
NO_TRADE output
fairness under partial coverage
```

‏אסור ל־winner לנצח רק משום שהמתחרים שלו stale או missing.

‏Metrics מומלצים:

```text
RankGap
RankChurn
TopNTurnover
CandidatePersistence
WinnerAge
FreshCoverageRatio
```

---

## ‏10. Negative Evidence / Veto Readiness

### ‏Hard Vetoes

‏Safety/Data/Status vetoes:

```text
independent of score
point-in-time correct
reason-coded
versioned
replayable
```

### ‏Behavioral Vetoes

‏דורשים:

```text
OOS evidence
false-veto measurement
missed-opportunity measurement
ablation
```

‏`HighScore` אינו עוקף `HardVeto`.

---

## ‏11. Economic Readiness

‏לפני Promotion נדרש model של:

```text
ExpectedGrossEdge
- ExpectedEntryCost
- ExpectedExitCost
- ExpectedAdverseSelection
- ExpectedImpact
- ExpectedLatencyDecay
- ExpectedMiss / NoFillCost
= ExpectedNetExecutableEdge
```

‏אבל `> 0` אינו מספיק כאשר uncertainty material.

‏נוסיף:

```text
RequiredMarginOfSafety
UncertaintyBuffer
EdgeHeadroom
```

‏כאשר:

```text
EdgeHeadroom <= 0
```

‏ה־default הוא:

```text
NO_TRADE / NO_GO for that thesis or context
```

---

## ‏12. Cost Readiness

‏Round-trip cost model חייב לכלול לפי הרלוונטיות:

```text
commissions / fees
spread
entry slippage
exit slippage
impact
adverse selection
latency decay
partial-fill effects
no-fill / missed-opportunity effects
```

‏ננטר גם:

```text
modeled_cost vs observed_cost
cost drift
cost ratio to gross edge
```

---

## ‏13. Capacity Readiness

‏אין assumption של infinite liquidity.

‏נבדוק:

```text
NetEdge(size)
MarginalEdge(size)
EntryCapacity(size)
ExitCapacity(size)
Impact(size)
FillProbability(size)
TimeToFlat(size)
```

‏הגדלת size היא Experiment חדש, לא reward על תוצאה טובה.

---

## ‏14. Execution Readiness

### ‏Order Lifecycle

‏State model חייב לייצג:

```text
IntentCreated
SendAttempted
BrokerAccepted
Working
PartiallyFilled
Filled
CancelRequested
Canceled
Rejected
Expired
UnknownEffect
```

‏החוזים:

```text
Sent != Accepted
Accepted != Working
Working != Filled
CancelRequested != Canceled
UNKNOWN_EFFECT != retry permission
```

### ‏Identity

‏נדרש correlation באמצעות IDs יציבים:

```text
DecisionId
IntentId
AttemptId
ClientOrderId
BrokerOrderId
ExecutionId
PositionEpisodeId
ExecutionEpoch
```

### ‏Retry

‏Retry של side effect אינו מתבצע בעיוורון כאשר effect אינו ידוע.

‏הפעולה הבאה היא:

```text
Reconcile → decide
```

---

## ‏15. Fill-Economics Readiness

‏נמדוד לפחות:

```text
ArrivalPrice
SubmitPriceContext
FillPrice
EffectiveSpread
EntrySlippage
PartialFillRate
NoFillRate
TimeToFirstFill
TimeToFullFill
PostFillMarkout
MissedOpportunityAfterNoFill
```

‏Fill rate לבדו אינו promotion metric.

---

## ‏16. Exit Readiness

‏Exit הוא `P0` עצמאי.

‏נדרש:

```text
position-specific monitor
exit path independent of full-universe scan
partial-exit handling
duplicate-exit protection
cancel/fill-race handling
degraded-mode exit semantics
emergency flatten semantics
broker reconciliation to flat
```

‏Metrics:

```text
exit_trigger_to_decision
exit_trigger_to_submit
exit_submit_to_ack
exit_submit_to_first_fill
exit_trigger_to_flat
exit_slippage
exit_giveback
partial_exit_rate
```

‏`Flat` חייב להיות מוכח מול external truth.

---

## ‏17. Risk Readiness

‏Risk state חייב לכלול:

```text
FilledPosition
WorkingEntryExposure
WorkingExitExposure
PendingExposure
UnknownExposure
ReservedExposure
```

‏Partial fill משנה exposure מיד.

‏Limits לא נעלמים בזמן:

```text
reconnect
restart
recovery
provider failover
manual intervention
```

---

## ‏18. Pending Exposure Rule

‏כל approval חדש יתחשב ב־potential exposure, לא רק ב־confirmed positions.

‏חוזה:

```text
KnownPosition
+ PotentiallyLiveEntry
+ UnknownExternalEffect
<= ApprovedRiskEnvelope
```

‏אם אי אפשר לחשב envelope באמינות:

```text
ENTRY_BLOCKED
```

---

## ‏19. Kill / Safety Readiness

‏נדרש להוכיח בפועל ולא רק לתעד:

```text
kill switch activation
entry block
cancel path
exit-only degradation
flatten path when supported and safe
manual safety procedure
recovery after safety event
```

‏Control שלא נבדק אינו נחשב ready.

---

## ‏20. Recovery Readiness

‏תרחישים חובה:

```text
restart while flat
restart with position
restart with working order
broker reconnect
market-data reconnect
partial fill then disconnect
cancel then fill
unknown submit effect
stale callback from prior generation
provider failover
```

‏Recovery output:

```text
external truth queried
canonical state rebuilt
invariants validated
readiness rebuilt
explicit resume required
```

---

## ‏21. Reconciliation Readiness

‏Reconciliation הוא prerequisite ל־new risk לאחר:

```text
startup
reconnect
unknown effect
manual broker action
mismatch
failover
restart
```

‏ה־minimum:

```text
query orders
query executions/fills
query positions
query account/exposure state
match stable IDs
resolve or classify orphan state
```

---

## ‏22. Testing Readiness

### ‏`P0`

‏נדרשים לפחות:

```text
fast deterministic CI
core unit/property tests
replay tests
state-machine invariant tests
fault injection
restart/recovery tests
overload/burst tests
exit-under-load test
broker/data failure tests
```

‏למערכת broad-universe נדרש burst שמייצג את scale בפועל, לא toy load בלבד.

---

## ‏23. Acceptance Scenario Pack

### ‏Normal Path

```text
fresh universe
→ candidate qualifies
→ no veto
→ decision
→ order lifecycle
→ partial/full fill
→ position monitor
→ exit
→ reconciled flat
```

### ‏No-Trade Paths

```text
high score + stale data → NO_TRADE
high score + hard veto → NO_TRADE
high score + negative headroom → NO_TRADE
high score + weak exit feasibility → NO_TRADE
```

### ‏Failure Paths

```text
broker disconnect with pending order
data disconnect while flat
data disconnect while position open
partial fill then disconnect
cancel requested then fill
restart with position
restart with open order
unknown submit effect
scanner overload while exit needed
storage / telemetry slowdown
duplicate callback
out-of-order event
stale callback after reconnect
```

---

## ‏24. Performance Readiness

‏Performance readiness הוא economic correctness תחת load.

‏נמדוד:

```text
market_event_to_decision p50/p95/p99
decision_to_submit p50/p95/p99
exit_trigger_to_submit p50/p95/p99
queue age
backlog depth
dropped/coalesced work
reconnect catch-up time
GC/allocation pressure
```

‏אין unbounded queue growth.

‏Telemetry לא תחסום hot/safety path.

---

## ‏25. Clock Readiness

‏נפריד:

```text
market event time
provider time
broker event time
local wall time
local receive time
monotonic duration clock
```

‏ל־durations מקומיים נעדיף monotonic clock.

‏Clock anomaly שמשבשת time-sensitive decisions יכולה לחסום Entries.

---

## ‏26. Observability Readiness

‏עבור כל Episode צריך להיות אפשר לשחזר:

```text
what market state was seen
why candidate won
why candidates were rejected
what vetoes existed
what decision was made
what risk state existed
what intent was created
what broker events arrived
what fills occurred
how position evolved
why exit triggered
when flat was proven
```

‏Correlation identity מקצה לקצה הוא `P0`.

---

## ‏27. Incident Packet

‏לאירוע משמעותי נשמור:

```text
IncidentId
DecisionContext
DataSnapshot
FeatureSnapshot
RankSnapshot
VetoState
RiskState
OrderIntents
BrokerEvents
Fills
Positions
Latencies
Logs
OperatorActions
Build / Config Versions
Generations / Epochs
FirstDivergence
```

---

## ‏28. Security / Operations Readiness

### ‏`P0`

```text
no hard-coded secrets
least privilege
environment separation
account identity verification
build/config identity
change audit
rollback / forward-recovery path
single active execution owner when applicable
critical-state backup/restore tested
operator actions journaled
emergency runbook tested safely
```

‏Paper/Shadow ו־external execution environments לא יובחנו רק לפי צבע UI.

---

## ‏29. Environment / Account Identity

‏לפני כל external side effect המערכת תדע להוכיח:

```text
ENVIRONMENT
ACCOUNT_ID / fingerprint
EXECUTION_MODE
EXECUTION_ENABLED
BUILD_VERSION
CONFIG_VERSION
STRATEGY_VERSION
RISK_CONFIG_VERSION
```

‏Mismatch:

```text
BLOCK_NEW_ENTRIES
```

---

## ‏30. Eligibility / Account Readiness

‏זהו `P0` נפרד מ־Strategy quality.

‏לפני כל שימוש חיצוני יש לאמת בזמן הרלוונטי:

```text
account type
legal / contractual eligibility
trading permissions
market-data entitlements
API permission
settlement constraints
margin constraints when relevant
day-trading constraints when relevant
borrow / short constraints when relevant
```

‏אם eligibility/permission אינה מאומתת:

```text
Paper / Shadow only
```

‏פרטים אלה תלויי Broker, jurisdiction, account ו־time ולכן אינם מקובעים במסמך זה.

---

## ‏31. Paper / Shadow Readiness

‏לפני כל promotion מעבר ל־research-only נרצה:

```text
live-data Shadow over representative conditions
all decisions journaled
WouldTrade / WouldNotTrade analyzable
Replay / Shadow / Paper comparable by episode
paper-vs-model gaps understood
model-vs-live-observation drift measured
```

‏Paper הוא Evidence, לא proof של fill economics אמיתי.

---

## ‏32. Evidence Pack

‏לכל Promotion משמעותי נשמור immutable-ish reference של:

```text
StrategyVersion
FeatureVersion
FilterVersion
VetoVersion
ExecutionPolicyVersion
RiskConfigVersion
DataProviderVersion
BrokerAdapterVersion
DatasetIds
ReplayResults
ShadowResults
PaperResults when applicable
LatencyReport
CostReport
FillReport
RecoveryTestReport
SafetyTestReport
KnownRisks
Assumptions
GoNoGoRecord
```

‏Promotion שלא ניתן לשחזר בדיעבד אינו מספיק מקצועי.

---

## ‏33. Known Risks Register

‏לכל risk פתוח:

```text
RiskId
Description
Severity
Likelihood
Detection
Mitigation
ResidualRisk
Owner
ReviewDate
```

‏`KnownRisk` אינו `IgnoredRisk`.

‏Risk שמערער P0 אינו מתקבל באמצעות documentation בלבד.

---

## ‏34. Assumption Register

‏נפריד בין Fact לבין assumptions כגון:

```text
expected fill probability
expected queue behavior
expected provider latency
expected broker latency
expected spread under burst
expected adverse selection
expected exit liquidity
```

‏לכל assumption משמעותית צריך להיות:

```text
metric
validation method
confidence
failure threshold
revalidation trigger
```

---

## ‏35. Unknowns Budget

‏נסווג unknowns:

```text
KNOWN_SAFE_UNKNOWN
BOUNDED_UNKNOWN
UNBOUNDED_UNKNOWN
SAFETY_CRITICAL_UNKNOWN
```

‏`SAFETY_CRITICAL_UNKNOWN` הוא `P0 NO_GO`.

‏מספר גדול של `BOUNDED_UNKNOWN` יחד יכול להפוך למערכת שאינה באמת bounded ולכן דורש review מצטבר.

---

## ‏36. Promotion Criteria

‏Promotion criteria נכתבים **לפני** evaluation.

‏הם יכסו לפחות:

```text
data quality envelope
latency envelope
execution-cost envelope
fill-quality envelope
post-fill markout envelope
exit / time-to-flat envelope
reconciliation cleanliness
risk invariants
kill/recovery drills
edge-retention envelope
simulation error
incident / near-miss status
```

‏ה־thresholds עצמם מגיעים מ־Evidence, לא מחוק אצבע אוניברסלי.

---

## ‏37. NO-GO Criteria

‏`NO_GO` מיידי כאשר קיים אחד מ־:

```text
unknown environment/account identity
stale or materially incomplete data
broken reconciliation
unresolved exposure mismatch
kill control not verified
unknown duplicate-order risk
unbounded retry behavior
exit path not verified
unexplained model/external mismatch
costs consume expected edge
signal expires before executable action
critical observability missing
eligibility / permissions unresolved
safety-critical unknown
```

---

## ‏38. Conditional GO

‏כאשר P0 core תקין אך scope מסוים טרם הוכח, נעדיף:

```text
CONDITIONAL_GO
```

‏עם:

```text
allowed capabilities
blocked capabilities
allowed universe
allowed session/state
required monitoring
expiration
rollback trigger
```

‏כך נמנעים מ־all-or-nothing promotion.

---

## ‏39. Readiness State Machine

‏Preferred Default:

```text
OFFLINE
→ STARTING
→ RECONCILING
→ SHADOW_READY
→ ENTRY_BLOCKED
→ LIVE_READY
→ DEGRADED
→ EXIT_ONLY
→ HALTED
```

‏לא כל transition אפשרי מכל state.

‏כל transition יקבל:

```text
ReasonCode
EvidenceReference
Generation/Epoch
Timestamp
```

---

## ‏40. Live Permission Token

‏ב־Production design, Strategy לא מקבלת הרשאת side effect גלובלית נצחית.

‏לפני פעולה שמגדילה Risk נדרש token קצר־חיים שמייצג:

```text
DataReady
ScannerReady
RiskReady
BrokerReady
SafetyReady
EligibilityReady
SignalStillValid
ExecutionOwnerValid
```

‏אם token פג לפני submit:

```text
revalidate
```

---

## ‏41. Fail-Closed Entry

‏במקרה של ambiguity קריטית:

```text
New Risk → blocked
Risk Reduction → preserved where safely defined
```

‏זהו contract חשוב יותר מ־“stop everything”.

---

## ‏42. Daily Readiness vs Promotion Readiness

‏Promotion יכול להיות מאושר עקרונית ועדיין session מסוים להיות `NO_GO`.

‏Daily/session gate יבדוק לפחות:

```text
correct environment/account
correct build/config
market-data health
broker readiness
positions/orders reconciled
clock health
risk config loaded
safety controls healthy
journal/storage healthy
no unresolved critical incident
feature warmup ready
```

---

## ‏43. Readiness Expiration

‏Evidence יכול לפוג בעקבות:

```text
strategy change
feature/filter/veto change
execution-policy change
broker-adapter change
provider change
risk-config change
deployment/runtime change
safety-critical infrastructure change
```

‏שינוי כזה יכול לדרוש revalidation חלקית או מלאה.

---

## ‏44. Change Classification

‏נסווג שינוי:

```text
NO_BEHAVIORAL_IMPACT
OBSERVABILITY_ONLY
MODEL_BEHAVIOR_CHANGE
EXECUTION_BEHAVIOR_CHANGE
RISK_BEHAVIOR_CHANGE
INFRASTRUCTURE_BEHAVIOR_CHANGE
SAFETY_CRITICAL_CHANGE
```

‏ככל שהשינוי קרוב יותר ל־Execution/Risk/Safety, revalidation מחמירה יותר.

---

## ‏45. Change Freeze סביב Promotion

‏לא נשנה יחד:

```text
strategy
execution
risk
infrastructure
```

‏רגע לפני Promotion.

‏Preferred flow:

```text
Freeze Baseline
→ Validate
→ Record Evidence Pack
→ Promote Bounded Stage
→ Observe
→ Attribute
→ Change One Meaningful Dimension
```

---

## ‏46. Configuration Drift

‏נשמור:

```text
ExpectedConfigHash
LoadedConfigHash
```

‏Config drift הוא behavioral risk כמו code drift כאשר הוא משנה decisions או risk.

---

## ‏47. Operator Readiness

‏גם במערכת אוטומטית נדרש Runbook שמסביר:

```text
how to identify environment
how to inspect positions/orders
how to enter safety state
how to reconcile
when not to intervene manually
how to record manual action
how to escalate
how to resume
```

‏אין reliance על memory בלבד בזמן Incident.

---

## ‏48. RCA Before Resume

‏Warning/Error משמעותי ב־CI, Replay, Shadow, Paper או external calibration לא נסגר רק בתיקון נקודתי.

‏נדרש:

```text
What happened?
Why did it happen?
Why was it not prevented/detected earlier?
Where else can the same pattern exist?
What test/control/checklist item prevents recurrence?
```

‏רק לאחר מכן readiness יכולה להיבנות מחדש.

---

## ‏49. Stop Conditions

‏נגדיר מראש triggers כגון:

```text
unexplained order-state mismatch
repeated data gaps
latency outside validated envelope
unexpected cost increase
abnormal fill toxicity
risk invariant violation
recovery failure
safety-control failure
edge-retention collapse
regime outside validated envelope
```

‏Stop אינו “give it one more try”.

---

## ‏50. Resume Conditions

‏Resume דורש:

```text
cause understood enough
mitigation applied
external truth reconciled
state known
tests pass
readiness restored
versions verified
explicit resume decision recorded
```

‏Green metric יחיד אינו auto-resume.

---

## ‏51. Automatic Downgrade

‏Readiness יכולה לרדת אוטומטית:

```text
LIVE_READY
→ ENTRY_BLOCKED
→ EXIT_ONLY
→ HALTED
```

‏לפי severity ו־known state.

‏Downgrade צריך להיות reason-coded ומדיד.

---

## ‏52. First External Objective

‏המטרה המחקרית הראשונה של external calibration אינה:

```text
maximize profit
```

‏אלא:

```text
measure the gap between modeled reality and observed external reality
```

‏נרצה ללמוד:

```text
actual latency
actual fill behavior
actual costs
actual adverse selection
actual no-fill rate
actual exit behavior
actual operational error rate
actual simulation error
```

---

## ‏53. Edge Retention Before PnL

‏Metric רעיוני:

```text
EdgeRetention = RealizedExecutableEdge / ExpectedExecutableEdge
```

‏רק כאשר המונה והמכנה מוגדרים באופן עקבי.

‏נשתמש בו יחד עם decomposition ולא כמספר קסם יחיד.

---

## ‏54. First-Divergence RCA

‏כאשר expected ו־observed שונים:

```text
Market Observation
→ Canonical Data
→ Feature
→ Rank
→ Veto
→ Decision
→ Risk Gate
→ Intent
→ Submit
→ Broker Lifecycle
→ Fill
→ Position
→ Exit
→ Flat
```

‏מחפשים את השלב הראשון שבו chain diverged.

‏`PnL < 0` אינו Root Cause.

---

## ‏55. Primary Readiness Metrics

```text
p0_open_count
p1_open_count
unknown_critical_count
fresh_coverage_ratio
reconciliation_failure_rate
position_mismatch_count
open_order_mismatch_count
unknown_effect_rate
duplicate_intent_rate
candidate_to_decision_ms
decision_to_submit_ms
exit_trigger_to_flat_ms
entry_slippage_bps
exit_slippage_bps
post_fill_markout
realized_round_trip_cost_bps
net_edge_retained
simulation_error
kill_drill_pass_rate
recovery_drill_pass_rate
```

---

## ‏56. Diagnostic Metrics

```text
rank_gap
rank_churn
candidate_persistence
veto_rate_by_reason
false_veto_estimate
no_fill_opportunity
partial_fill_rate
queue_age
reconnect_count
stale_callback_count
duplicate_callback_count
manual_action_count
config_drift_count
runtime_override_count
```

---

## ‏57. Go/No-Go Record

‏כל Promotion משמעותי יפיק:

```text
DecisionId
Timestamp
StrategyVersion
BuildVersion
ConfigVersion
Environment
AccountFingerprint
Decision = GO | CONDITIONAL_GO | NO_GO
ApprovedScope
P0GateResults
P1Findings
P2Backlog
KnownRisks
Unknowns
EvidencePackId
Owner / Reviewer
Conditions
Expiration
RevalidationTriggers
```

---

## ‏58. Minimal P0 Gate לרובוט שלנו

‏ה־minimum שצריך להיות machine-verifiable ככל האפשר:

```text
1. Data fresh and trustworthy?
2. Universe/ranking fair and current?
3. Hard vetoes clear?
4. Signal still alive?
5. Entry executable?
6. Exit executable?
7. Net edge positive with sufficient headroom?
8. Pending/unknown exposure bounded and known?
9. Broker state reconciled?
10. Exit path healthy?
11. Kill/recovery controls verified?
12. Correct environment/account/build/config?
13. Eligibility/permissions verified?
```

‏אם תשובה מהותית היא `UNKNOWN`:

```text
NO new entry risk
```

---

## ‏59. User-Specific Application

‏למערכת שלנו, readiness לא תישען על השאלה:

```text
Can we find the fastest-rising stock?
```

‏אלא על השרשרת:

```text
Broad-universe data is fresh
→ ranking is fair
→ candidate remains valid
→ vetoes are clear
→ executable economics retain headroom
→ broker/account/environment state is known
→ execution state is bounded
→ exit path is ready
→ safety/recovery are proven
→ eligibility is verified
→ only then can the next controlled stage be considered
```

‏ה־baseline נשאר `Replay / Shadow / Paper` עד שכל Gate הרלוונטי לשלב הבא מוכח.

---

## ‏60. What I Would Avoid Initially

‏לא הייתי מתחיל ב־:

- ‏Readiness score יחיד.
- ‏Checklist ידני בלבד ללא machine-verifiable gates.
- ‏Automatic resume.
- ‏Automatic capital/exposure ramp.
- ‏Multi-instance active-active execution.
- ‏Complex exception overrides.
- ‏Promotion בזמן שמשנים כמה שכבות יחד.
- ‏PnL-only review.
- ‏Assumption ש־Paper מוכיח execution economics.
- ‏“Connected = Ready”.
- ‏“Small exposure = safe enough”.
- ‏Runtime changes שאינם versioned/audited.

---

## ‏61. What to Add Later

‏לאחר Baseline ו־Evidence:

- ‏Automated Evidence Pack generation.
- ‏Formal policy engine ל־readiness gates.
- ‏Signed/attested config provenance.
- ‏Canary/shadow deployment comparison.
- ‏Formal control charts ל־readiness drift.
- ‏Context-specific readiness envelopes.
- ‏Automated change-impact classification.
- ‏More granular capability tokens.
- ‏Multi-provider failover readiness models.
- ‏Advanced incident-learning automation.

---

## ‏62. Alternatives

### ‏Alternative A — Manual Checklist בלבד

‏יתרון: פשוט להתחיל.

‏חיסרון: נשען על זיכרון אנושי וקשה לשחזור.

‏שימוש: temporary bootstrap בלבד.

### ‏Alternative B — Binary Global Ready Flag

‏יתרון: פשוט תפעולית.

‏חיסרון: אינו מבדיל Entry/Exit/Research/Degraded capabilities.

‏שימוש: לא מומלץ כמודל production יחיד.

### ‏Alternative C — Capability-Based Readiness

```text
ENTRY_ALLOWED
EXIT_ALLOWED
CANCEL_ALLOWED
RECONCILE_ALLOWED
RESEARCH_ALLOWED
```

‏יתרון: מדויק יותר תחת degradation.

‏חיסרון: דורש state machine ברורה.

‏שימוש: Preferred Default.

---

## ‏63. Failure Modes

```text
P0 accidentally treated as warning
stale GO reused after config change
wrong account/environment
local state trusted over broker state
unknown effect blind retried
exit starved by scanner load
paper result treated as live proof
readiness based on average latency only
positive PnL hides invariant violation
manual intervention not reconciled
operator bypass undocumented
unknowns accumulate silently
promotion criteria changed after seeing results
```

---

## ‏64. Promotion Criteria

‏מעבר לשלב מבוקר יותר דורש Evidence כגון:

- ‏אין `P0` פתוח.
- ‏כל `P1` קיבל disposition מפורש.
- ‏Research/OOS/robustness evidence קיים.
- ‏Point-in-time correctness מאומת.
- ‏Data quality נשארת בתוך envelope.
- ‏Scanner/veto behavior replayable ומוסבר.
- ‏Execution/partial/no-fill behavior בתוך envelope.
- ‏Exit/`TimeToFlat` בתוך envelope.
- ‏Risk invariants נשמרים.
- ‏Reconciliation clean.
- ‏Kill/recovery/fault-injection drills עוברים.
- ‏Latency/cost/simulation error נמדדים ומתקבלים ביחס ל־Edge headroom.
- ‏Build/config/account/environment provenance מלא.
- ‏Eligibility/permissions מאומתים בזמן הרלוונטי.
- ‏Evidence Pack ו־Go/No-Go Record נוצרו.

---

## ‏65. Rejection / Pause Criteria

‏אין Promotion או שחוזרים ל־Shadow/Research כאשר:

- ‏P0 פתוח.
- ‏Safety-critical unknown קיים.
- ‏Broker/local state אינם מתיישבים.
- ‏Pending exposure אינו ידוע.
- ‏Exit path אינו מוכח.
- ‏Latency tails מחוץ ל־validated envelope.
- ‏Costs/Slippage מוחקים Edge headroom.
- ‏Data freshness/coverage אינם יציבים.
- ‏Simulation error אינו מוסבר.
- ‏Recovery/kill drill נכשל.
- ‏Account/environment identity אינה ודאית.
- ‏Eligibility/permission לא מאומתים.
- ‏Promotion נשען על sample קטן/correlated מדי.
- ‏Process invariants נשברו גם אם PnL חיובי.

---

## ‏66. Fact / Judgment / Hypothesis

### ‏Fact / engineering semantics

- ‏`Sent`, ‏`Accepted`, ‏`Working`, ‏`Filled` ו־`Canceled` הם states שונים.
- ‏Partial fill משנה exposure.
- ‏Local state יכול לסטות מ־Broker state.
- ‏Paper execution אינו בהכרח משחזר external execution.
- ‏Configuration, data source, broker behavior ו־permissions יכולים להשתנות בזמן.

### ‏Judgment

- ‏למערכת שלנו נכון להשתמש ב־P0 gates וב־capability-based readiness במקום readiness score יחיד.
- ‏Exit, reconciliation ו־risk truth צריכים לקבל עדיפות על scanner/entry בזמן degradation.
- ‏Evidence Pack, Go/No-Go Record, Known Risks ו־Assumption Register צריכים להיות first-class artifacts.
- ‏`CONDITIONAL_GO` עדיף על הרחבת scope לא מוכחת.
- ‏Readiness צריכה לפוג עם שינוי מהותי ולא להישאר “מאושרת לנצח”.

### ‏Hypothesis

- ‏ה־validated latency/cost/fill envelopes בפועל.
- ‏כמה Shadow/Paper evidence נדרש לפני כל Promotion.
- ‏איזה uncertainty buffer מתאים לכל regime.
- ‏איזה capabilities ניתן לשמר בבטחה תחת כל סוג degradation.

---

## ‏67. Confidence

### ‏High Confidence

‏ב־:

```text
P0 blockers should not be averaged away
external state requires reconciliation
pending exposure matters
exit readiness must be independent
unknown critical state should block new risk
promotion criteria should be predeclared
GO should be scoped/versioned/expiring
```

### ‏Medium Confidence

‏ב־capability-based readiness architecture וב־Evidence Pack structure המומלצים עבור המערכת שלנו.

### ‏Empirical / Must Validate

‏כל threshold על:

```text
latency
cost
slippage
fill quality
edge headroom
simulation error
sample size
promotion duration
capacity
```

---

## ‏68. Time-Sensitive Facts

‏לפני כל שימוש תפעולי יש לאמת בזמן הרלוונטי:

```text
broker/API capabilities
account permissions
market-data entitlements
fees / commissions
routing/order semantics
session behavior
settlement rules
margin/day-trading constraints where applicable
borrow constraints where applicable
regulatory / contractual eligibility
```

‏אין להסיק מהקורס או מה־Recommendation Sheet שמאפיין חיצוני נשאר נכון בעתיד.

---

## ‏69. Relationship to Earlier Sheets

### ‏28 — Paper / Shadow

‏28 הוא בסיס ה־forward validation ללא הנחה ש־Paper מוכיח external execution.

### ‏33–36 — State / Recovery / Observability / Safety

‏64 הופך את החוזים שלהם ל־readiness gates מחייבים.

### ‏49–55 — Best Practices

‏64 מרכז את ה־Research, Scanner, Execution, Data, Testing, Performance ו־Operations best practices ל־Promotion checklist אחד.

### ‏60A — Negative Evidence

‏Hard vetoes הם `P0` ואינם ניתנים לעקיפה באמצעות Score.

### ‏61 — Backtest Subtleties

‏Simulation correctness היא prerequisite ולא production proof.

### ‏62 — Live Trading Subtleties

‏62 מספק Reconciliation, Drift, Incident ו־Calibration semantics.

‏64 קובע מתי evidence מאותה שכבה מספיק כדי לאפשר stage transition.

### ‏63 — Professional Edge

‏Edge evidence הוא תנאי הכרחי ל־readiness אך אינו מספיק לבדו.

‏Strategy יכולה להיות בעלת Edge candidate טוב ועדיין לקבל `NO_GO` בגלל operations, risk, eligibility או recovery.

---

## ‏70. Relationship to 65

‏64 מסיים את מקטע `Practitioner Mastery` ושואל:

```text
Is the whole system ready for the next controlled stage?
```

‏65 יתחיל את מקטע הידע הרחב עם:

```text
Classic Indicators
```

‏ה־Recommendation Playbook צריך להמשיך לשפוט Indicators לפי incremental information ו־decision value, לא לפי פופולריות.

---

## ‏71. Recommended Hierarchy

```text
Baseline
→ P0 Gates + Shadow/Paper + Explicit NO_GO

Preferred Default
→ Capability-Based Readiness + Evidence Pack + Go/No-Go Record

Challenger
→ automated policy evaluation with explicit human-auditable reasons

Advanced Option
→ context-specific readiness envelopes + canary comparison

Specialist Option
→ formal control-plane attestations / multi-provider failover governance

Avoid Unless Evidence
→ scalar readiness score, auto-resume, auto-ramp, exception-heavy overrides
```

---

## ‏72. Recommendation Summary

‏ברירת המחדל המומלצת לרובוט שלנו היא להתייחס ל־Readiness כאל **מערכת Gates מבוססת Evidence**, לא כאל תחושת מוכנות ולא כאל ציון ממוצע.

‏החוזה:

```text
Edge Thesis Valid Enough
+ Point-in-Time Correctness
+ Fresh / Trustworthy Data
+ Fair / Current Ranking
+ Hard Veto Discipline
+ Positive Net Edge With Headroom
+ Bounded Execution Lifecycle
+ Independent Exit Readiness
+ Pending Exposure Accounting
+ Broker Reconciliation
+ Kill / Recovery Proof
+ Performance Under Load
+ End-to-End Observability
+ Environment / Account / Config Identity
+ Eligibility / Permissions Verified
+ No Open P0
→ GO / CONDITIONAL_GO for a bounded, versioned, expiring scope
```

‏ה־success criterion אינו:

```text
we feel ready
```

‏אלא:

```text
we can prove what is ready,
what is not ready,
which evidence supports the decision,
what conditions invalidate it,
and how the system fails safely when reality diverges
```

‏עד אז ה־default נשאר `Research / Replay / Shadow / Paper`.