# ‏Cross-Cutting 14 — Recommended Observability Stack

> ‏מטרת המסמך: לסנתז את Recommendation Sheets של Monitoring/Logging/Observability, Scanner Diagnostics, Replay, Testing, Recovery, Execution, Risk, Readiness ו־Daily Review ל־`Observability Stack` אחד evidence-first, explainable ו־replay-friendly עבור `Research / Replay / Shadow / Paper` ותכנון Production Engineering.
>
> ‏המסמך אינו אישור `Live` ואינו מדריך להפעלת כסף אמיתי. הוא מגדיר אילו Evidence, IDs, Metrics, Events, Ledgers ו־Incident Artifacts נדרשים כדי לדעת מה המערכת ראתה, החליטה ועשתה, לזהות degradation, לבצע RCA ולשחזר התנהגות.

---

## ‏1. Decision

‏`Observability` אצלנו אינה:

```text
logs + dashboards
```

‏אלא שרשרת ראיות:

```text
Market / Data Reality
→ Canonical State
→ Feature / Scanner State
→ Ranking / Decision
→ Risk / Safety / Compliance
→ Order Intent / Execution
→ Fill / Position / Exit
→ Economic Outcome
→ Recovery / Incident
→ Replay / RCA / Learning
```

‏ה־stack צריך לענות במהירות על ארבע שאלות:

```text
1. Is the system trustworthy enough to make a decision?
2. What exactly did it know and decide at time T?
3. Where did the first meaningful divergence/failure occur?
4. Can we reproduce the evidence afterward?
```

‏העיקרון המחייב:

```text
Truth first
→ correlation second
→ diagnostics third
→ visualization fourth
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏Five-Layer Observability Model

‏נשתמש בחמש שכבות עם תפקיד שונה:

```text
1. Truth Ledgers
2. Structured Events
3. Metrics
4. Traces / Correlation Context
5. Incident / Replay Artifacts
```

‏`Dashboards` ו־Alerts הם views/actions מעל השכבות האלה, לא Source of Truth.

### ‏`P0 — Required`: ‏Truth Ledgers הם durable ולא sampled

‏נשמור durably לפחות:

```text
Decision Ledger
Order Intent / Order Ledger
Fill Ledger
Position / Exposure Ledger
Risk / Safety / Compliance Decision Ledger
State / Recovery Journal
Config / Version Change Journal
```

‏Events בעלי משמעות כלכלית או state-authoritative אינם עוברים sampling.

‏אם durable truth אינו אמין:

```text
READINESS / SAFETY PROBLEM
```

‏ולא רק `observability degradation`.

### ‏`P0 — Required`: ‏Stable Correlation Graph

‏כל Evidence משמעותי יקושר באמצעות IDs יציבים, למשל:

```text
RunId
SessionId
DecisionEpoch
DecisionId
CandidateSnapshotId
RiskDecisionId
ComplianceDecisionId
OrderIntentId
AttemptId
ClientOrderId
BrokerOrderId
ExecutionId
PositionEpisodeId
RecoveryId
IncidentId
```

‏ה־graph הקנוני:

```text
Decision
→ Risk / Compliance Decision
→ OrderIntent
→ Attempt / BrokerOrder
→ Fill
→ Position Episode
→ Exit Decision
→ Exit Execution
→ Flat / Outcome
```

‏כל Fill חייב להיות traceable חזרה להקשר שבו נוצר ה־Intent.

### ‏`P0 — Required`: ‏`NO_TRADE` ו־`UNKNOWN` הם First-Class Evidence

‏לכל Decision Epoch משמעותי נשמור:

```text
TRADE
NO_TRADE
UNKNOWN / NOT_READY
```

‏יחד עם:

```text
Top-K
DecisionReadiness
ReasonCodes
DataHealth
ScannerHealth
RiskState
ComplianceState
VersionContext
```

‏שימוש רק ב־executed outcomes יוצר blind spot ו־selection bias.

### ‏`P0 — Required`: ‏Health הוא layered capability state

‏נפריד לפחות:

```text
DATA_HEALTH
SCANNER_HEALTH
DECISION_HEALTH
RISK_HEALTH
EXECUTION_HEALTH
BROKER_ADAPTER_HEALTH
PERSISTENCE_HEALTH
REPLAY_EVIDENCE_HEALTH
OBSERVABILITY_HEALTH
```

‏`SYSTEM_HEALTH` יכול להיות derived summary בלבד.

‏אסור:

```text
connected = true
→ healthy = true
```

### ‏`P0 — Required`: ‏Readiness נפרדת מ־Liveness

```text
Liveness:
Can this process make progress or recover?

Readiness:
Are required capabilities currently verified and trustworthy?
```

‏Process alive אינו אומר Data fresh, Broker reconciled או Ranking valid.

### ‏`P0 — Required`: ‏Progress Heartbeats, לא רק Process Heartbeats

‏נשמור progress markers כגון:

```text
last_market_event_processed
last_canonical_sequence
last_full_fresh_coverage
last_scanner_epoch_completed
last_decision_epoch
last_broker_event
last_successful_reconciliation
last_truth_persisted
```

‏כך `stalled-but-alive` הופך detectable.

### ‏`P0 — Required`: ‏Structured Events עם schema יציב

‏נשתמש ב־events machine-readable, למשל:

```text
DataHealthChanged
SequenceGapDetected
FreshCoverageChanged
ScannerEpochCompleted
TopCandidateChanged
DecisionCreated
RiskDecisionCreated
ComplianceDecisionCreated
OrderIntentCreated
OrderStateChanged
FillRecorded
PositionChanged
ExitTriggered
RecoveryStarted
RecoveryPhaseChanged
RecoveryCompleted
SafetyStateChanged
ConfigChanged
ReadinessChanged
```

‏כל event כולל לפחות:

```text
EventId
EventType
EntityId
EventTime
ProcessedTime
ReasonCode
Environment
VersionContext
CorrelationIds
```

### ‏`P0 — Required`: ‏Reason Codes הם contract, לא prose חופשי

‏Critical outcomes יקבלו ReasonCode יציב ו־versioned.

‏לדוגמה categories:

```text
DATA_*
SCANNER_*
RANK_*
ENTRY_*
EXECUTION_*
RISK_*
SAFETY_*
COMPLIANCE_*
RECOVERY_*
SYSTEM_*
```

‏טקסט אנושי יכול להתווסף, אבל automation/RCA אינו תלוי parsing שלו.

### ‏`P0 — Required`: ‏Version Context בכל Evidence מהותי

‏נשמור לפי ה־scope הרלוונטי:

```text
GitCommit / BuildIdentity
StrategyVersionId
ConfigFingerprint
FeatureSetVersion
UniverseDefinitionVersion
DataContractVersion
VetoPolicyVersion
ExecutionPolicyVersion
RiskPolicyVersion
CompliancePolicyVersion
CostModelVersion
Environment
DataGeneration
```

‏אין להשוות שני outcomes כאילו הם אותו behavior אם context זה השתנה בלי להיות גלוי.

### ‏`P0 — Required`: ‏Scanner Observability מפרידה Health מ־Opportunity

‏נשמור בנפרד:

```text
MarketOpportunity
ScannerHealth
DecisionReadiness
Business / Research Outcome
```

‏מצבים חוקיים כוללים:

```text
HEALTHY + NO OPPORTUNITY
DEGRADED + UNKNOWN
HEALTHY + CANDIDATE
```

‏`0 trades` אינו diagnostic.

### ‏`P0 — Required`: ‏Whole-Market Evidence בכל Decision Epoch

‏ל־cross-sectional scanner נשמור לפחות:

```text
ExpectedUniverseCount
ObservedUniverseCount
FreshObservedUniverseCount
FreshEligibleUniverseCount
FreshCoverageRatio
InputAgeDistribution
Top1DataAge
Top1FeatureAge
Top1RankAge
RankGap
TopK
DecisionReadiness
```

‏Candidate טרי בתוך cross-section חלקי אינו מספיק כדי להכריז Rank trustworthy.

### ‏`P0 — Required`: ‏Top-K נשמר, לא רק Winner

‏לכל Decision משמעותי נשמור Top-K קטן מספיק ל־RCA, כולל:

```text
Rank
Score / ordering evidence
Key components
Eligibility
Freshness
Veto / disqualification state
Execution feasibility
Candidate age / TTL
```

‏זה מאפשר:

```text
Why #1?
Why not #2?
Did #1 change before handoff?
Was winner selection stable?
```

### ‏`P0 — Required`: ‏Latency נמדדת כשרשרת, לא כמספר אחד

‏נפרק לפחות:

```text
market_event_to_receive
receive_to_canonical
canonical_to_feature
feature_to_rank
rank_to_decision
decision_to_risk
risk_to_intent
intent_to_submit
submit_to_ack
ack_to_fill
exit_decision_to_flat
```

‏נמדוד tails:

```text
p50
p95
p99
max where useful
```

‏Average לבדו אינו מספיק ל־short-horizon pipeline.

### ‏`P0 — Required`: ‏Queue Age הוא signal תפעולי מרכזי

‏לכל bounded queue משמעותי נשמור:

```text
queue_depth
oldest_item_age
drop_count
coalesce_count
rejection_count
backpressure_state
```

‏Queue קטנה עם item ישן מאוד יכולה להיות חמורה יותר מ־queue גדולה אך טרייה.

### ‏`P0 — Required`: ‏Exposure / Execution Truth גלוי בכל עת

‏Observability צריכה להציג בנפרד:

```text
FilledExposure
WorkingOrderPotentialExposure
PendingSubmitExposure
CancelPendingExposure
UnknownEffectExposure
PotentialTotalExposure
```

‏וכן:

```text
WorkingOrders
UnknownEffects
ReconciliationMismatches
TimeToFlat
UnprotectedExposureDuration
```

‏`CancelRequested` אינו שווה `Canceled` גם בדשבורד.

### ‏`P0 — Required`: ‏Recovery Phase Visibility

‏כל Recovery עוקב אחר:

```text
Detect
→ Contain
→ Reconcile
→ Rebuild
→ Validate
→ ReadyToResume
```

‏עם:

```text
RecoveryId
IncidentId
Phase
PhaseAge
BlockerCodes
KnownExposure
UnknownOrders
LastSuccessfulReconciliation
CapabilitiesCurrentlyAllowed
```

‏`RECOVERING` ללא phase/progress הוא state לא שימושי.

### ‏`P0 — Required`: ‏Observability Failure עצמה observable

‏נמדוד:

```text
telemetry_export_failures
telemetry_queue_age
telemetry_queue_depth
dropped_best_effort_telemetry
last_successful_export
truth_persistence_failures
ledger_write_lag
```

‏Dashboard stale שאינו מסומן גרוע יותר מ־Dashboard חסר.

### ‏`P0 — Required`: ‏Critical telemetry לא יושב ב־hot path כאשר אפשר להפריד

‏Best-effort metrics/traces מיוצאים asynchronously.

‏אבל durable truth persistence מקבלת contract נפרד ואינה “נזרקת” כדי להציל latency בלי state מפורש.

### ‏`P1 — Preferred`: ‏Decision Packet קנוני

‏לכל Decision משמעותי נשמור Snapshot קומפקטי:

```text
DecisionId
DecisionEpoch
AsOfTime
InstrumentId
Rank
RankGap
TopKReference
FeatureSummary
FreshnessSummary
CoverageSummary
Eligibility
VetoSummary
ExecutionFeasibility
ExpectedGrossEdge if modeled
RemainingNetEdge if modeled
RiskState
ComplianceState
DecisionReadiness
Decision
ReasonCodes
VersionContext
```

### ‏`P1 — Preferred`: ‏Execution / Economic Funnel

‏נמדוד funnel מפורש:

```text
Candidate
→ Decision
→ Risk Allowed
→ Compliance Allowed
→ Intent
→ Submitted
→ Acked
→ Partial / Full Fill
→ Position
→ Exit Decision
→ Flat
```

‏לכל drop/abort נשמור ReasonCode.

‏מדדי economics/quality:

```text
FillRate
PartialFillRate
NoFillRate
Slippage
ImplementationShortfall
EffectiveSpread
Markout
TimeToFill
TimeToFlat
NetEdgeRetained
```

### ‏`P1 — Preferred`: ‏Edge Decay לאורך ה־pipeline

‏כאשר יש model תקף נשמור:

```text
edge_at_decision
edge_at_revalidation
edge_at_submit
edge_at_ack
edge_at_fill
```

‏כך ניתן להבדיל בין:

```text
Prediction problem
Latency problem
Execution problem
Cost problem
Exit problem
```

### ‏`P1 — Preferred`: ‏Incident Packet אוטומטי

‏Incident משמעותי ייצור Artifact הכולל לפחות:

```text
IncidentId
TriggerTime
PreRollWindow
PostRollWindow
System/Data/Scanner/Risk/Execution states
Open orders
Positions / exposure
Recent decisions
Recent state transitions
Recent errors
Latency percentiles
Queue ages/depths
Versions / config fingerprints
Recovery context
Relevant ledger references
Replay dataset/window reference
```

### ‏`P1 — Preferred`: ‏Flight Recorder bounded

‏במקום `TRACE` מלא לנצח, נשמור rolling high-resolution window שמאפשר incident pre-roll/post-roll.

‏Exact duration היא decision תפעולית שתיקבע לפי storage, horizon ו־RCA needs.

### ‏`P1 — Preferred`: ‏One Primary Readiness Dashboard בתחילת הדרך

‏ה־Dashboard הראשון יענה על Questions, לא יציג vanity charts.

‏Sections מומלצים:

```text
Readiness / Current Capabilities
Market Data Health
Scanner / Decision Health
Top Candidates
Risk / Compliance State
Orders / Exposure / Position
Execution Quality
Latency / Queue Age
Recovery / Incidents
Observability Health
```

### ‏`P1 — Preferred`: ‏Alerting safety-first ו־actionable

‏Alerts ראשונים יתמקדו ב־:

```text
critical data trust lost
fresh coverage unsafe
ranking not trustworthy
unknown execution effect
position / broker mismatch
unowned / orphan state
risk or safety lock
reconciliation failure
recovery stuck
truth persistence unhealthy
critical invariant violation
observability blind spot
```

‏כל alert צריך לכלול:

```text
severity
reason
scope
current capability impact
evidence link
runbook / expected next diagnostic action
```

### ‏`P1 — Preferred`: ‏Aggregation / Dedup / Hysteresis

‏Provider-wide incident אינו הופך ל־4,000 alerts.

‏נשתמש ב־:

```text
aggregation
deduplication
cooldown
hysteresis
multi-window detection
```

‏אבל invariant safety-critical אינו נדחה על ידי debounce שמונע containment בזמן.

### ‏`P1 — Preferred`: ‏Cardinality Budget

‏Metrics labels נשארים bounded.

‏לא נשתמש ב־IDs כמו:

```text
DecisionId
OrderId
InstrumentId x DecisionId
```

‏כ־unbounded metric labels.

‏High-cardinality detail שייך ל־Events, Ledgers, Traces או queryable evidence store.

### ‏`P1 — Preferred`: ‏Retention Tiers

```text
HOT
- recent high-resolution operational diagnostics

WARM
- structured events / replayable windows

LONG-LIVED
- truth ledgers / incidents / RCA / aggregate research evidence

AGGREGATE
- long-term metrics and trends
```

‏אין למחוק truth קריטי רק משום שהוא “log ישן”.

### ‏`P1 — Preferred`: ‏Environment Isolation

‏כל Evidence נושא:

```text
REPLAY
SHADOW
PAPER
```

‏ואין לערבב metrics/incident conclusions בין environments בלי dimension מפורש.

### ‏`P1 — Preferred`: ‏Security / Redaction

‏Telemetry לא תכלול:

```text
passwords
tokens
API secrets
session credentials
```

‏Manual/operator actions נשמרות עם actor/action/reason/result כאשר רלוונטי לתכנון Production Engineering.

### ‏`P2 — Challenger`: ‏Scoped Dynamic Diagnostics

‏במקום global `DEBUG`:

```text
Enable diagnostics for:
- Instrument X
- Decision Y
- Incident Z
- Component K
for bounded duration
```

### ‏`P2 — Challenger`: ‏Distributed / End-to-End Tracing

‏נוסיף רק כאשר latency/RCA evidence מראה שהוא מצדיק overhead.

‏Spans אפשריים:

```text
receive
canonicalize
feature
rank
decision
risk
intent
submit
ack
fill
```

‏לא נתחיל ב־trace לכל Tick.

### ‏`P2 — Challenger`: ‏SLI / SLO / Burn Rate

‏לאחר שנצבר baseline אמין ניתן להגדיר objectives עבור:

```text
Fresh Coverage
Decision Latency
Replay Evidence Availability
Recovery / Safe Resume
Broker / Adapter Synchronization
```

‏Thresholds נגזרים ממדידה ומה־strategy horizon, לא ממספרי קסם.

‏אין `error budget` להפרת invariant כגון duplicate unintended economic effect.

### ‏`P3/P4 — Evidence Only`

‏לא נקדם אוטומטית:

```text
full tracing of all market events
automatic anomaly containment
large vendor-heavy observability platform
AI-generated operational verdicts
auto-remediation without deterministic safety contract
```

---

## ‏3. Why

### ‏Fact

‏מערכת event-driven קצרה יכולה להיכשל בלי crash: feed יכול להיות מחובר אך stale, scanner יכול לרוץ על cross-section חלקי, queue יכולה לצבור age, order יכול להיות במצב uncertain, ו־recovery יכול להיתקע כאשר process עדיין alive.

### ‏Fact

‏Metrics בלבד אינם מאפשרים לשחזר Decision יחיד; Logs בלבד חלשים ל־distribution/tails; Traces בלבד אינם ledger authoritative.

### ‏Judgment

‏למערכת שלנו, Evidence Chain עם Truth Ledgers + Structured Events + low-cardinality Metrics הוא Baseline טוב יותר מ־vendor-first observability.

### ‏Judgment

‏`First Divergence` הוא primitive חשוב יותר לחקירה מאשר final PnL או global red/green status.

### ‏Hypothesis

‏Incident Packets ו־Flight Recorder יקצרו משמעותית `time_to_reproduce` ו־`time_to_first_divergence`; הערך המדויק יימדד בפועל.

---

## ‏4. Use When

‏ה־baseline מתאים כאשר צריך:

- ‏להוכיח Data/Scanner readiness לפני Decision מחקרי.
- ‏להסביר `TRADE / NO_TRADE / UNKNOWN`.
- ‏לשחזר Decision/Order/Fill/Exit timeline.
- ‏לבדוק signal/edge decay לאורך pipeline.
- ‏לזהות stuck-but-alive components.
- ‏לחקור partial fills, unknown effects ו־reconciliation.
- ‏ליצור Replay/Golden regression מ־Incident.
- ‏להפריד failure של Signal מ־failure של Execution או Infrastructure.
- ‏להזין Daily Review ו־Research Queue ב־Evidence במקום anecdotes.

---

## ‏5. Do Not Use When

‏Observability אינה תחליף ל־:

- ‏State Machine תקין.
- ‏Risk/Safety/Compliance controls.
- ‏Durable persistence.
- ‏Reconciliation.
- ‏Testing.
- ‏Replay correctness.
- ‏Strategy validation.
- ‏Data quality contracts.

‏Alert אינו containment mechanism. Dashboard אינו truth. Trace אינו Fill Ledger.

---

## ‏6. Alternatives

### ‏Alternative A — Logs-first

‏פשוט להתחלה, אך נחלש מהר ב־aggregation, percentiles, correlation ו־machine analysis.

### ‏Alternative B — Metrics-first

‏טוב ל־health overview, חלש מאוד ב־per-decision reconstruction.

### ‏Alternative C — Full tracing-first

‏נותן causality עשירה אך יקר, high-volume ועלול להיכנס ל־critical path.

### ‏Alternative D — Vendor-first stack

‏מהיר להרים, אך מסוכן כאשר schemas וה־code מתחילים להיבנות סביב מוצר מסוים במקום סביב Evidence Contract.

### ‏Preferred

```text
Evidence Contract
→ simple storage/export adapters
→ one useful dashboard
→ alerts/runbooks
→ richer tooling only after bottleneck evidence
```

---

## ‏7. Trade-offs

| Choice | יתרון | מחיר |
|---|---|---|
| ‏Truth Ledgers | ‏Audit/RCA חזק | ‏Persistence/storage cost |
| ‏Structured Events | ‏Queryable detail | ‏Schema governance |
| ‏Metrics | ‏זול ומהיר ל־health | ‏detail מוגבל |
| ‏Traces | ‏Latency causality | ‏overhead/cardinality |
| ‏Flight Recorder | ‏Incident fidelity גבוהה | ‏buffer/storage complexity |
| ‏Low-cardinality metrics | ‏Stack יציב | ‏drill-down דרך evidence store |
| ‏Async export | ‏מגן על hot path | ‏אפשר לאבד best-effort diagnostics |
| ‏Long retention | ‏Research/RCA טובים | ‏Storage/governance cost |

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מתחיל עם:

- ‏עשרות dashboards.
- ‏מאות alerts.
- ‏`TRACE` לכל market event.
- ‏unbounded metric labels.
- ‏אחסון כל Feature לכל Symbol לנצח.
- ‏AI anomaly detection לפני baseline אמין.
- ‏adaptive thresholds מורכבים לפני hard readiness/safety checks.
- ‏tool/vendor coupling בתוך domain core.
- ‏overall green/red boolean יחיד.
- ‏PnL dashboard ללא Decision/Execution context.
- ‏sampling של fills/orders/critical transitions.

---

## ‏9. What to Add Later

### ‏`P2`

- ‏Scoped dynamic diagnostics.
- ‏Flight Recorder automation.
- ‏Automatic Incident Packet generation.
- ‏Richer end-to-end tracing.
- ‏Readiness/history comparisons.
- ‏SLO/burn-rate views לאחר baseline measurement.

### ‏`P3`

- ‏Cross-provider divergence views כאשר יש provider נוסף.
- ‏Automated first-divergence visualization.
- ‏Long-term reliability/regression trend analysis.
- ‏Replay links ישירים מתוך Incident UI.

### ‏`P4`

- ‏Advanced anomaly models.
- ‏Large distributed tracing infrastructure.
- ‏Automated containment/remediation רק תחת safety contract מפורש ו־evidence חזק.

---

## ‏10. Required Data / Evidence

‏ה־stack דורש לפחות:

```text
Stable IDs
Canonical timestamps / clock domains
Decision records
Top-K snapshots
Reason-code registry
State transition journal
Order/fill/position ledgers
Risk/Safety/Compliance decisions
Version/config metadata
Data freshness/coverage evidence
Queue/backpressure metrics
Recovery/reconciliation events
Replay dataset/run references
```

‏כדי להצדיק tracing/flight recorder עשיר יותר נדרש Evidence של:

```text
incidents not diagnosable from current evidence
latency attribution gaps
reproduction cost
high unknown-RCA rate
```

---

## ‏11. Promotion Criteria

‏`Observability Stack` נחשב Baseline טוב כאשר:

1. ‏כל Decision משמעותי כולל `TRADE / NO_TRADE / UNKNOWN`, reason codes ו־version context.
2. ‏כל Order/Fill ניתן לקישור חזרה ל־Decision/Intent.
3. ‏Position/Pending Exposure/Unknown Effect גלויים ואינם מתמזגים ל־boolean אחד.
4. ‏Whole-market freshness/coverage ו־DecisionReadiness נמדדים.
5. ‏ניתן לראות p95/p99 latency לפי pipeline stage.
6. ‏Progress stalls detectable גם כאשר process alive.
7. ‏Recovery מציג phase, blockers ו־age.
8. ‏Truth persistence failure נראה כ־Readiness/Safety issue.
9. ‏Fault/Golden scenarios מפיקים את alerts וה־evidence הצפויים.
10. ‏Incident משמעותי ניתן להפוך ל־Replay/RCA artifact.
11. ‏Metrics cardinality נשלטת.
12. ‏Best-effort telemetry failure אינו משנה Decision semantics.
13. ‏אין secrets ב־telemetry.
14. ‏Environment/version dimensions מפורשים.
15. ‏Dashboard/alerts נשענים על אותם Evidence contracts כמו Replay/Testing.

---

## ‏12. Rejection Criteria

‏Design יידחה או יעבור redesign אם:

- ‏Dashboard הוא source of truth בפועל.
- ‏Critical events עוברים sampling.
- ‏`connected=true` משמש readiness.
- ‏`SYSTEM_HEALTH` הוא boolean ללא layer details.
- ‏`UNKNOWN` יכול להיראות green.
- ‏שומרים רק executed trades.
- ‏אין correlation בין Decision→Order→Fill.
- ‏שומרים averages בלבד ללא tails.
- ‏Metric labels בלתי bounded.
- ‏Exporter נמצא ב־critical execution path ללא isolation.
- ‏Observability failure אינו observable.
- ‏Alerts אינם actionable.
- ‏Version/Environment context חסר.
- ‏Paper/Replay/Shadow evidence מתערבב.
- ‏PnL מוצג ללא cost/execution attribution.
- ‏Incident אינו ניתן לשחזור או לפחות להסבר timeline-wise.

---

## ‏13. Metrics

### ‏Data / Market Truth

```text
FreshCoverageRatio
LastEventAge
ProviderLagP50/P95/P99
LocalProcessingLagP50/P95/P99
SequenceGapCount
OutOfOrderCount
DroppedEventCount
GenerationChangeCount
```

### ‏Scanner / Ranking

```text
ScannerCycleP50/P95/P99
FeatureLatencyP50/P95/P99
RankLatencyP50/P95/P99
DecisionReadinessCounts
Rank1Age
RankGap
RankChurn
CandidateFunnelCounts
NoTradeReasonCounts
UnknownDecisionCount
```

### ‏Execution / Exposure

```text
IntentCount
SubmitToAckP50/P95/P99
AckToFillP50/P95/P99
NoFillRate
PartialFillRate
UnknownEffectCount
ReconciliationMismatchCount
WorkingOrders
PotentialTotalExposure
TimeToFlat
UnprotectedExposureDuration
```

### ‏Economics

```text
Slippage
ImplementationShortfall
Markout
NetEdgeRetained
EdgeLostBeforeFill
CostModelUnknownRate
OutcomeByRankBucket
```

### ‏Recovery / Safety

```text
RecoveryCount
RecoveryDuration
PhaseAge
ReconciliationDuration
UnknownStateDuration
ReadinessBlockedDuration
SafeResumeSuccessRate
StuckRecoveryCount
```

### ‏Observability Health

```text
TruthWriteFailureCount
LedgerWriteLag
TelemetryQueueAge
TelemetryQueueDepth
TelemetryExportFailureCount
DroppedBestEffortTelemetry
MetricsCardinality
LogVolume
TraceVolume
IncidentPacketCompleteness
```

### ‏RCA / Learning

```text
TimeToReproduceIncident
TimeToFirstDivergence
UnknownRcaRate
IncidentToRegressionRate
IncidentToReplayArtifactRate
RepeatedFailureClassRate
```

---

## ‏14. Failure Modes

### ‏`O14-01 — GREEN_WHILE_UNKNOWN`

‏Overall status תקין כאשר financial/data truth לא ידוע.

### ‏`O14-02 — TRUTH_AS_LOG`

‏Best-effort log משמש בטעות כ־authoritative ledger.

### ‏`O14-03 — MISSING_CORRELATION`

‏יש הרבה telemetry אך אי אפשר לקשר Decision ל־Fill.

### ‏`O14-04 — PARTIAL_UNIVERSE_BLINDNESS`

‏Scanner נראה פעיל למרות cross-section חסר.

### ‏`O14-05 — TAIL_BLINDNESS`

‏Average נראה תקין בזמן p99 פוגע ב־signal lifetime.

### ‏`O14-06 — ALERT_STORM`

‏Incident אחד יוצר alerts per-symbol במקום root-cause scope.

### ‏`O14-07 — CARDINALITY_EXPLOSION`

‏Monitoring stack עצמו הופך bottleneck.

### ‏`O14-08 — TELEMETRY_ON_HOT_PATH`

‏Exporter איטי מגדיל decision/execution latency.

### ‏`O14-09 — STALE_DASHBOARD_UNMARKED`

‏Observability נשברת אך UI עדיין נראה authoritative.

### ‏`O14-10 — VERSIONLESS_EVIDENCE`

‏אי אפשר לדעת איזה code/config יצר outcome.

### ‏`O14-11 — OVERLOGGING`

‏נפח גדול מסתיר Signal ומייקר RCA.

### ‏`O14-12 — UNDERLOGGING`

‏חסר pre-context ולכן Incident אינו ניתן לשחזור.

### ‏`O14-13 — TRADE_ONLY_BIAS`

‏אין evidence ל־NO_TRADE / UNKNOWN / losers.

### ‏`O14-14 — METRIC_AS_CAUSE`

‏Correlation metric מקבל פירוש causal ללא Replay/RCA.

### ‏`O14-15 — DASHBOARD_DRIVEN_SEMANTICS`

‏Domain behavior משתנה כדי להתאים ל־UI/monitoring tool במקום ל־contract.

---

## ‏15. User-Specific Application

‏ל־Whole-Market Short-Horizon system שלנו סדר הבנייה המומלץ הוא:

```text
1. Truth Ledgers
2. Stable IDs + Reason Codes
3. Whole-Market Freshness/Coverage
4. DecisionReadiness + Top-K Evidence
5. Scanner Funnel
6. Order/Fill/Exposure Truth
7. State + Recovery Journal
8. Pipeline Latency + Queue Age
9. One Readiness Dashboard
10. Safety-first Alerts
11. Incident Packet / Flight Recorder
12. Research / reliability views
13. Rich tracing only if measured need exists
```

‏המדדים החשובים במיוחד למערכת קצרה ורחבת Universe:

```text
FreshCoverageRatio
Top1 / Rank Age
EndToEndDecisionLatency
QueueOldestItemAge
UnknownEffectDuration
PotentialTotalExposure
TimeToFlat
NetEdgeRetained
```

‏ובכל Episode חשוב נרצה לראות:

```text
Rank at decision
→ Rank at revalidation
→ Rank at submit
→ Rank at fill

Edge at decision
→ Edge at submit
→ Edge at fill
→ Net outcome
```

‏כך ניתן למקם את `First Divergence` בין Signal, Ranking, Data, Latency, Execution, Risk או Exit.

---

## ‏16. Confidence

### ‏High Confidence

- ‏Truth Ledgers לפני Dashboards.
- ‏Stable correlation IDs.
- ‏Structured Events ו־Reason Codes.
- ‏`NO_TRADE / UNKNOWN` כ־Evidence.
- ‏Whole-market freshness/coverage.
- ‏Percentile latency במקום average בלבד.
- ‏Queue age/backpressure observability.
- ‏State/Recovery phase visibility.
- ‏No sampling of authoritative events.
- ‏Low-cardinality Metrics.
- ‏Version/Environment context.
- ‏Incident-to-Replay/RCA linkage.

### ‏Medium Confidence

- ‏Exact Flight Recorder duration.
- ‏Exact retention tiers.
- ‏כמה tracing נדרש ב־baseline.
- ‏איזה SLO thresholds יתאימו לאחר measurement.
- ‏היקף dashboard splitting לאחר שהמערכת גדלה.

### ‏Low / Evidence Required

- ‏Automated anomaly detection.
- ‏Automatic root-cause classification.
- ‏Auto-remediation/containment driven by statistical anomaly alone.
- ‏Full distributed tracing לכל event.
- ‏Large observability platform לפני צורך מוכח.

---

## ‏17. Time-Sensitive Facts

‏ההמלצה כאן vendor-agnostic ומתודולוגית, ולכן אין צורך לאמת Facts חיצוניים חדשים לצורך ה־Baseline.

‏כאשר ייבחרו מוצרים/שירותים ספציפיים ל־metrics, logs, tracing או storage, יש לאמת מחדש לפני קיבוע:

```text
pricing
retention limits
ingest limits
cardinality limits
export guarantees
query limits
security model
availability / durability guarantees
```

‏גם capabilities של Data Provider/Broker שמשפיעים על timestamps, IDs או event retention דורשים אימות עדכני בזמן Implementation.

---

## ‏18. Concrete Baseline Contract

```text
ObservabilityPolicy
{
  truth_ledgers_required: true,
  authoritative_event_sampling: false,
  stable_correlation_ids_required: true,
  no_trade_and_unknown_recorded: true,
  version_context_required: true,
  layered_health_required: true,
  readiness_separate_from_liveness: true,
  whole_market_coverage_visible: true,
  percentile_latency_required: true,
  queue_age_required: true,
  exposure_truth_visible: true,
  recovery_phase_visible: true,
  telemetry_health_visible: true,
  bounded_metric_cardinality: true,
  environment_tag_required: true,
  incident_packet_required_for_material_incidents: true,
  secrets_in_telemetry_forbidden: true
}
```

‏Final baseline:

```text
Durable Truth
→ Stable IDs / Reason Codes
→ Structured Events
→ Low-Cardinality Metrics
→ Decision + Top-K Evidence
→ Data / Scanner / Risk / Execution Health
→ Percentile Latency + Queue Age
→ One Readiness Dashboard
→ Safety-first Alerts
→ Incident Packet / Flight Recorder
→ Replay / First-Divergence RCA
→ Controlled Learning Loop
```

‏משפט המפתח:

> ‏Observability טובה אינה אומרת שיש לנו הרבה גרפים; היא אומרת שכל behavior חשוב יכול להפוך ל־Evidence מקושר, מדיד, explainable ו־replayable.