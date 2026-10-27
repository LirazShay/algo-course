# ‏62 — Recommendation Sheet: Live Trading Subtleties

> ‏מקור לימודי עיקרי: `../62-LIVE-TRADING-SUBTLETIES.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מחקרי, ארכיטקטוני ותפעולי לשלב שבו מערכת `Short-Horizon Momentum` פוגשת סביבה חיה, כך שהמעבר מ־Research/Replay/Shadow/Paper לא יטשטש את ההבדל בין מודל לבין אמת חיצונית. הדגש הוא על Calibration, Reconciliation, Drift Attribution, Safety, Versioning, Incident Learning ו־Evidence — לא על הגדלת סיכון או על הנחה ש־Backtest מוצלח מבטיח תוצאה חיה.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה להפעלה בכסף אמיתי, אינו מגדיר Exposure אמיתי ואינו מבטיח רווח.

---

## ‏1. Decision

‏`Live` אינו:

```text
Backtest
+ Broker API
```

‏הוא **סביבת Calibration חדשה שבה External Truth יכול לסטות מהמודל בכל boundary**.

‏נפריד תמיד בין ארבע שכבות אמת:

```text
Research Truth
Simulation Truth
Local System Truth
Broker / Market Truth
```

‏ה־Baseline:

```text
Live Market Evidence
→ Canonical State
→ Scanner / Rank
→ Negative Evidence
→ TRADE / NO_TRADE Decision
→ Risk / Safety Gate
→ Immutable Intent
→ Execution Engine
→ Broker / External Side Effect
→ Broker Events / Fills / Positions
→ Reconciliation
→ Position / Exit Monitor
→ Flat / Terminal State
→ Live Calibration / RCA
→ Replay / Research Feedback
```

‏העקרונות המחייבים:

```text
Local Truth != Broker Truth
Sent != Accepted
Accepted != Working
Working != Filled
CancelRequested != Canceled
UNKNOWN_EFFECT != Permission To Retry
Process Alive != Trading Ready
Paper != Live Execution Truth
PnL != Process Quality
Small External Validation != Final Validation
Resume != Button
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Broker / External Truth גובר על Local Assumption

‏כאשר קיימת סתירה בין state מקומי לבין Broker state:

```text
LocalPosition = 0
BrokerPosition = non-zero
```

‏או:

```text
LocalOrder = CANCELED
BrokerOrder = WORKING / PARTIAL
```

‏המצב הוא Incident עד reconciliation.

‏אין ליצור Risk חדש על בסיס state מקומי שאינו reconciled.

### ‏`P0 — Required`: Reconciliation לפני new risk

‏ב־Startup, Reconnect, `UNKNOWN_EFFECT`, mismatch, manual intervention או failover:

```text
Freeze New Entry Risk
→ Query Orders
→ Query Executions / Fills
→ Query Positions
→ Query Account / Exposure State
→ Match Stable IDs
→ Rebuild Canonical Execution State
→ Validate Invariants
→ Rebuild Readiness
→ Explicit Resume
```

‏`Connected = true` אינו Resume criterion.

### ‏`P0 — Required`: Stable Business IDs

‏כל Position Episode ו־Order lifecycle יקבלו correlation מלא:

```text
DecisionId
IntentId
AttemptId
ClientOrderId
BrokerOrderId
ExecutionId
PositionEpisodeId
MarketGeneration
BrokerSessionGeneration
ExecutionEpoch
StrategyVersion
```

‏המטרה:

```text
one business intent
→ traceable external side effects
→ no duplicate risk under retry/reconnect
```

### ‏`P0 — Required`: ‏`UNKNOWN_EFFECT` הוא state עסקי אמיתי

‏אם connection נופל לאחר Send ולפני confirmation:

```text
UNKNOWN_EFFECT
```

‏לא:

```text
FAILED
```

‏ולא:

```text
retry immediately
```

‏הפעולה הבאה היא reconciliation.

### ‏`P0 — Required`: Pending Exposure נכנס ל־Risk

‏Risk אינו רק Position confirmed.

‏נשמור לפחות:

```text
ActualFilledExposure
PotentiallyLiveEntryExposure
PotentiallyLiveExitExposure
UnknownExposure
ReservedExposure
```

‏כל approval חדש חייב להתחשב ב־potential exposure, לא רק ב־fills ידועים.

### ‏`P0 — Required`: ‏`Flat` חייב להיות מוכח

‏`Flat` אינו:

```text
exit submitted
```

‏ואינו:

```text
first exit fill received
```

‏ה־Definition:

```text
BrokerPosition == TargetFlat
AND no potentially-live exposure
AND no unresolved execution effect
AND reconciliation state acceptable
```

### ‏`P0 — Required`: Position / Exit path מקבל Priority נפרדת

‏Position פעיל לא יחכה ל־full-universe scan.

‏Priority:

```text
Safety / Flatten
> Position / Exit
> Broker / Fills / Cancels / Reconciliation
> Risk
> Entry
> Scanner
> Diagnostics / UI
```

‏`TimeToFlat` הוא KPI מרכזי.

### ‏`P0 — Required`: Pre-Submit Revalidation

‏לפני כל side effect שמגדיל Risk נבדוק מחדש:

```text
candidate still eligible
signal not expired
critical data fresh
fresh coverage acceptable
vetoes still clear
trading status actionable
spread / execution economics acceptable
remaining net edge positive
risk state known
environment/account verified
execution ownership valid
```

‏אם לא:

```text
NO_TRADE / BLOCK_NEW_ENTRIES
```

### ‏`P0 — Required`: Entry Readiness נפרדת מ־Exit Readiness

‏מצבי יכולת אפשריים:

```text
FULL
NO_NEW_ENTRIES
EXIT_ONLY
CANCEL_ONLY
HALTED
```

‏Unknown critical state בדרך כלל חוסם יצירת Risk חדש, אך אינו אמור למחוק יכולת לצמצם Risk כאשר הדבר בטוח ומוגדר.

---

## ‏3. Live הוא Calibration Layer

‏השאלה המרכזית אינה:

```text
Did the live result match backtest PnL?
```

‏אלא:

```text
Where did actual behavior first diverge from the modeled chain?
```

‏נפרק את הפער ל־:

```text
Prediction Gap
Data Gap
Feature Gap
Ranking Gap
Decision Gap
Latency Gap
Execution Gap
Cost Gap
Risk / Size Gap
Operational Gap
```

‏Strategy change אינו המסקנה הראשונה.

---

## ‏4. Live Edge Funnel

‏לכל Episode נרצה לעקוב אחר:

```text
GrossPrediction
→ ExecutablePrediction
→ EdgeAfterDecisionDelay
→ EdgeAfterSubmitDelay
→ EdgeAfterEntryExecution
→ EdgeAfterAdverseSelection
→ EdgeAtExitTrigger
→ EdgeAfterExitExecution
→ NetRealizedOutcome
```

‏ונשמור לפי האפשרות:

```text
EdgeAtDetection
EdgeAtDecision
EdgeAtSubmit
EdgeAtFill
EdgeAtExitTrigger
EdgeAtFlat
```

‏המטרה אינה false precision; אם שלב אינו ניתן לאמידה באמינות מספקת הוא יסומן `UNKNOWN / LOW_CONFIDENCE`.

---

## ‏5. `Decision Twin`

‏לכל Episode חיצוני משמעותי נשמור reference מחקרי:

```text
same candidate
same decision context
modeled entry
observed entry outcome
modeled exit
observed exit outcome
modeled costs
observed costs
```

‏ה־Twin אינו Truth counterfactual; הוא כלי Attribution.

‏נשתמש בו לשאלה:

```text
Where was edge lost relative to the model?
```

---

## ‏6. Decision / Submit / Fill Evidence

### ‏Decision Snapshot

```text
DecisionId
CandidateSet
Rank / Score / RankGap
DataFreshness
FreshCoverage
VetoState
ExecutionFeasibility
ExpectedCosts
ExpectedNetEdge
RiskState
Versions
DecisionTime
```

### ‏Submit Snapshot

```text
IntentId
SubmitTime
SignalAgeAtSubmit
RankAtSubmit
Bid / Ask / Spread
RemainingEdgeAtSubmit
RiskReservation
MarketGeneration
BrokerSessionGeneration
ExecutionEpoch
```

### ‏Fill Snapshot

```text
ExecutionId
FillTime
FillPrice
FillQty
Bid / Ask around fill
Spread
SignalAgeAtFill
RankAgeAtFill
RemainingEdgeAtFill
Route / Venue when known
Liquidity classification when known
```

---

## ‏7. Fill Quality > Fill Rate

‏נמדוד:

```text
fill_rate
partial_fill_rate
time_to_first_fill
time_to_full_fill
post_fill_markout
missed_opportunity_after_no_fill
```

‏Fill rate גבוה אינו Promotion metric בפני עצמו.

‏Pattern מסוכן:

```text
higher fill rate
+
worse post-fill markout
```

‏יכול להעיד על adverse selection.

---

## ‏8. No-Fill ו־Reject הם Evidence

‏לא נשמור רק Trades שהצליחו להגיע ל־Fill.

‏Lifecycle outcomes:

```text
FILLED
PARTIALLY_FILLED
CANCELED_UNFILLED
CANCELED_AFTER_PARTIAL
REJECTED
EXPIRED
UNKNOWN_EFFECT
```

‏No-fill נדרש למדידת Missed Opportunity.

‏Reject מקבל taxonomy פנימי ולא נשאר raw broker string בלבד.

---

## ‏9. Reject Taxonomy

‏Baseline:

```text
REJECT_INVALID_PARAMETERS
REJECT_CAPABILITY_UNSUPPORTED
REJECT_ACCOUNT_OR_PERMISSION
REJECT_SESSION_OR_STATUS
REJECT_PRICE_CONSTRAINT
REJECT_QUANTITY_CONSTRAINT
REJECT_RISK
REJECT_STALE_INTENT
REJECT_DUPLICATE
REJECT_UNKNOWN
```

‏Broker-specific strings ממופים ל־canonical reason codes.

‏Business logic לא יסתמך על substring פריך כאשר ניתן להימנע מכך.

---

## ‏10. Capability Discovery

‏המערכת צריכה לדעת מה נתמך **בסביבה הפעילה כרגע**, לא מה שהקוד מניח.

‏Capability record יכול לכלול:

```text
order_types
cancel_replace_semantics
session_support
quantity / precision rules
routing capabilities
market-data dependencies
paper_vs_external differences
verified_at
source/version
```

‏Capability לא ידועה אינה silently enabled.

---

## ‏11. Environment / Account Identity

‏נשמור ונציג במפורש:

```text
ENVIRONMENT
ACCOUNT_ID / ACCOUNT_FINGERPRINT
EXECUTION_MODE
EXECUTION_ENABLED
BUILD_VERSION
CONFIG_VERSION
STRATEGY_VERSION
```

‏לא מסתמכים על צבע UI בלבד.

‏Mismatch חוסם new risk.

---

## ‏12. Startup Readiness

‏`ProcessStarted` אינו `Ready`.

‏לפני capability של new entry נדרש לפחות:

```text
market_data_healthy
broker_connected
account_verified
positions_reconciled
open_orders_reconciled
clock_healthy
config_verified
strategy_version_known
risk_limits_loaded
kill_switch_healthy
journal_writable
execution_owner_verified
feature_warmup_ready
```

‏פלט readiness:

```text
READY_DISABLED
READY_FOR_RESEARCH
READY_FOR_ENTRY
DEGRADED
BLOCKED
UNKNOWN
```

---

## ‏13. Warmup

‏לכל Feature:

```text
NOT_READY
WARMING
READY
INVALID
```

‏Missing history אינו Neutral value.

‏Candidate עם Feature לא מוכן אינו מקבל יתרון Cross-Sectional בגלל default value שגוי.

---

## ‏14. Reconnect Semantics

‏Reconnect אינו Startup רגיל משום שיכולים להיות side effects קיימים.

‏Baseline:

```text
BLOCK_NEW_ENTRIES
→ Restore Connectivity
→ Increment Session / Data Generation where needed
→ Query External Truth
→ Reconcile Orders / Executions / Positions
→ Rebuild Canonical State
→ Rewarm / Resnapshot Data where required
→ Validate Freshness
→ Validate Risk / Safety
→ READY_DISABLED
→ Explicit Resume
```

‏Intent ישן אינו חוצה generation/epoch אוטומטית.

---

## ‏15. Market / Broker Generations

‏נשמור לפחות:

```text
MarketDataGeneration
BrokerSessionGeneration
ExecutionEpoch
SafetyEpoch
```

‏שינוי generation גורר invalidation/revalidation מתאים.

‏Stale callback מסשן ישן אינו הופך ל־current truth ללא reducer semantics ברורים.

---

## ‏16. Snapshot + Stream Reconciliation

‏כאשר API מספק Snapshot וגם Stream:

‏נגדיר במפורש:

```text
which source establishes baseline
when stream becomes authoritative
how overlap is deduplicated
how gaps are detected
how generation change is represented
```

‏אין merge בסגנון `last arrival wins` ללא contract.

---

## ‏17. Single Active Execution Owner

‏Preferred Default:

```text
one logical owner of state-changing broker actions
```

‏עם fencing/epoch כאשר קיימת failover architecture.

‏Split brain הוא Safety failure.

‏Heartbeat לבדו אינו הוכחה לבעלות תקינה.

---

## ‏18. Manual Intervention

‏כל פעולה ידנית על Order/Position/Config היא Event:

```text
OperatorActionId
Actor
Action
Scope
Reason
Timestamp
BeforeState
AfterState when known
```

‏Ownership:

```text
STRATEGY
OPERATOR
BROKER
EXTERNAL_UNKNOWN
```

‏Manual action שמשנה Broker truth מחייב reconciliation לפני new risk.

---

## ‏19. Live Drift Taxonomy

‏נעקוב לפחות אחרי:

```text
PredictionDrift
DataDrift
FeatureDrift
RankDrift
DecisionDrift
ExecutionDrift
LatencyDrift
CostDrift
OperationalDrift
```

‏Drift הוא diagnosis category, לא הוכחת cause.

---

## ‏20. Prediction Drift

‏בודק:

```text
score / rank bucket
→ future outcome
```

‏אם mapping נחלש גם לפני Execution — זו עדות שהבעיה עשויה להיות Predictive/Regime.

---

## ‏21. Data Drift

‏נבדוק:

```text
coverage
freshness
conditions
provider latency
missing/gap rate
quote semantics
aggregation
corrections
provider fingerprint
```

‏Provider change הוא Research Event.

---

## ‏22. Feature / Rank Drift

‏Feature parity:

```text
same canonical state
→ same feature semantics
```

‏Rank parity:

```text
same comparable candidate set / as_of
→ explainable ranking
```

‏נבדוק גם:

```text
rank_gap
rank_churn
top_n_turnover
freshness skew
partition bias
```

---

## ‏23. Latency Drift

‏נפרק:

```text
market_event_to_receive
receive_to_feature
feature_to_rank
rank_to_decision
decision_to_submit
submit_to_ack
submit_to_first_fill
exit_trigger_to_submit
exit_trigger_to_flat
```

‏נמדוד:

```text
P50
P95
P99
max / severe tail where useful
```

‏Tail metrics ייחתכו לפי Market Regime/Burst state.

---

## ‏24. Cost / Execution Drift

‏נשווה modeled מול observed:

```text
spread paid
slippage
fees / commissions
impact proxy
post-fill markout
fill probability
time to fill
partial fill ratio
missed opportunity
exit giveback
```

‏ההשוואה תהיה versioned ו־context-aware.

---

## ‏25. Operational Drift

‏Operational changes כוללים:

```text
runtime update
OS update
infrastructure change
provider change
broker change
config change
build change
deployment topology change
storage / logging change
```

‏גם ללא שינוי Strategy הם יכולים לשנות outcomes.

---

## ‏26. Version Everything That Can Change Decisions

‏לכל Decision משמעותי נשמור לפחות:

```text
build_commit
strategy_version
feature_version
filter_version
ranking_version
negative_evidence_version
execution_policy_version
risk_config_version
broker_adapter_version
market_data_parser_version
config_version
```

‏Config הוא Risk Artifact כמו code.

---

## ‏27. Runtime Override Audit

‏כל Override משמעותי:

```text
who
what
when
why
old_value
new_value
expiry when temporary
```

‏Temporary override ללא expiry הוא anti-pattern.

---

## ‏28. Process Quality != PnL

‏Daily review אינו מתחיל ב־PnL.

‏Baseline order:

```text
Safety
→ Data Quality
→ State / Reconciliation Quality
→ Decision Quality
→ Execution Quality
→ Exit Quality
→ Costs
→ PnL
```

‏אפשר לקבל:

```text
Bad Process + Good Outcome
```

‏או:

```text
Good Process + Bad Outcome
```

‏שני המקרים דורשים classification נכון.

---

## ‏29. Incident vs Expected Loss

‏Loss מתוך distribution צפוי אינו Incident אוטומטי.

‏Incident נוצר כאשר:

```text
contract violated
state became unknown
external truth diverged unexpectedly
safety invariant failed / nearly failed
system left expected envelope materially
```

---

## ‏30. Near Misses הם Evidence

‏Near Miss שבו Guard עצר exposure שגוי נשמר כמו Incident לצורך learning.

‏נמדוד:

```text
guard_activation
what_was_prevented
correct_guard_rate
false_positive_rate
```

---

## ‏31. Incident Packet

‏לכל Incident/Near Miss משמעותי נשמור:

```text
incident_id
decision_context
market_data_snapshot
feature_snapshot
rank_snapshot
negative_evidence
risk_state
order_intents
broker_events
fills
positions
latencies
logs
operator_actions
build/config versions
generations/epochs
first_divergence
```

---

## ‏32. First-Divergence RCA

‏הסדר:

```text
Data
→ Feature
→ Rank
→ Negative Evidence
→ Decision
→ Risk
→ Submit
→ Broker Lifecycle
→ Fill
→ Position State
→ Exit
→ Costs
→ Operations
```

‏מחפשים את השכבה הראשונה שבה reality סטתה מה־expected contract.

‏`PnL < 0` אינו Root Cause.

---

## ‏33. Live RCA Taxonomy

```text
LIVE_DATA_DIVERGENCE
LIVE_FEATURE_DIVERGENCE
LIVE_RANK_DIVERGENCE
LIVE_SIGNAL_EXPIRED
LIVE_VETO_CHANGED
LIVE_RISK_BLOCK
LIVE_REJECT
LIVE_NO_FILL
LIVE_PARTIAL_FILL
LIVE_SLIPPAGE_HIGH
LIVE_ADVERSE_SELECTION
LIVE_EXIT_DELAY
LIVE_EXIT_LIQUIDITY
LIVE_POSITION_MISMATCH
LIVE_ORDER_MISMATCH
LIVE_ORPHAN_ORDER
LIVE_UNKNOWN_EFFECT
LIVE_RECONNECT
LIVE_STALE_STATE
LIVE_STALE_CALLBACK
LIVE_DUPLICATE_CALLBACK
LIVE_OPERATOR_ACTION
LIVE_CONFIG_DRIFT
LIVE_BUILD_DRIFT
LIVE_ACCOUNT_MISMATCH
LIVE_LATENCY_SPIKE
LIVE_FEED_FAILOVER
LIVE_SPLIT_BRAIN
LIVE_UNKNOWN
```

‏`UNKNOWN` הוא label תקף כאשר Evidence אינו מספיק.

---

## ‏34. External Validation Ladder

‏מבחינה מחקרית הארכיטקטורה צריכה לתמוך ב־:

```text
Research
→ Deterministic Replay
→ Signal Shadow
→ Execution Shadow
→ Paper Lifecycle
→ External-Environment Calibration under authorized controls
→ repeated calibrated evidence
```

‏המקטע אינו קובע סכומי כסף, Exposure או הוראות ביצוע בפועל.

‏כל מעבר שלב הוא experiment חדש עם Acceptance/Stop criteria.

---

## ‏35. Capital / Exposure Scaling הוא Experiment נפרד

‏הגדלת size אינה inference אוטומטי מ־success בגודל קטן.

‏Scaling משנה:

```text
impact
fill probability
partial fills
exit feasibility
capacity
risk
```

‏לכן כל size regime חדש דורש evidence מחדש.

‏אין שימוש ב־capital כדי “לאסוף data מהר יותר”.

---

## ‏36. Promotion חייב להיות Evidence-Based

‏Promotion architecture תבדוק לפחות:

```text
reconciliation clean
unknown exposure absent
no duplicate side effects
latency within validated envelope
execution outcomes within calibrated envelope
post-fill toxicity within expected range
exit / time-to-flat within expected range
data quality stable
config/build provenance complete
safety controls verified
simulation error acceptable
```

‏Profitability לבדה אינה Promotion criterion.

---

## ‏37. Stop / Rollback Conditions

‏עצירה/חזרה למצב שמרני כאשר מתגלה degradation מהותי ב־:

```text
unknown_effect_rate
position_mismatch
open_order_mismatch
duplicate intent/order
latency tails
reject rate
slippage / cost gap
post-fill markout
data freshness / coverage
exit time-to-flat
reconciliation quality
config / environment identity
```

‏התגובה אינה בהכרח “כבה הכול”; capabilities יכולות לרדת ל־:

```text
NO_NEW_ENTRIES
EXIT_ONLY
CANCEL_ONLY
```

‏לפי state הידוע וה־Safety policy.

---

## ‏38. Resume Is a Proof

‏לאחר Incident:

```text
Truth Reconciled
+ Freshness Restored
+ Positions Known
+ Orders Known
+ Pending Effects Known
+ Risk Known
+ Root Cause Understood Enough
+ Controls Healthy
+ Versions Verified
→ READY_DISABLED
```

‏ורק אחר כך Explicit Resume לפי policy מורשית.

‏אין auto-resume רק משום שמדד חזר ל־green.

---

## ‏39. Shared Decision Core

‏ככל האפשר:

```text
Research / Replay / Shadow / Paper / Production-design
```

‏משתפים אותו Decision Core.

‏ההבדל המרכזי בין Shadow ל־side-effect environment צריך להיות Execution boundary, לא Strategy logic חלופית.

‏`if (live) use different score logic` הוא anti-pattern אלא אם ההבדל מפורש, versioned ונחוץ.

---

## ‏40. Golden Live Episodes

‏נשמור Episodes אמיתיים/מוקלטים או fixtures equivalent עבור:

```text
clean decision
clean no-trade
no fill
partial fill
toxic fill
late fill
late exit
reject
unknown effect
cancel/fill race
reconnect
feed gap
provider failover
halt / fast market
manual intervention
position mismatch
orphan order
```

‏גרסה חדשה צריכה להיות replayable עליהם.

---

## ‏41. Live → Replay Parity

‏על Live-recorded episode:

```text
Recorded Input
+ same versions/config
→ Replay
```

‏אם Replay אינו משחזר את Decision:

```text
Parity Failure
```

‏אם Replay משחזר Decision אבל outcome שונה:

‏מחפשים Execution/Latency/Market/Broker divergence.

---

## ‏42. Counterfactual Replay

‏אפשר לבדוק:

```text
lower/higher modeled latency
alternative execution tactic
alternative veto state
alternative exit policy
```

‏אבל output מסומן:

```text
COUNTERFACTUAL
```

‏לא Fact.

‏Counterfactual שדורש Market Reaction שונה משלנו מקבל confidence נמוך יותר.

---

## ‏43. Live-to-Research Calibration Loop

```text
Observed Divergence
→ Classify
→ Preserve Raw Evidence
→ Form Hypothesis
→ Replay / Backtest
→ Shadow
→ Controlled Promotion
```

‏לא:

```text
one bad trade
→ tweak strategy immediately
```

‏Safety invariant violation הוא exception: תיקון Safety יכול להיות דחוף גם בלי statistical sample גדול.

---

## ‏44. Simulator Calibration

‏נשווה לפחות:

```text
PredictedFillRate vs ObservedFillRate
PredictedSlippage vs ObservedSlippage
PredictedLatency vs ObservedLatency
PredictedMarkout vs ObservedMarkout
PredictedNoFillRate vs ObservedNoFillRate
PredictedTimeToFlat vs ObservedTimeToFlat
PredictedRejectRate vs ObservedRejectRate where modeled
```

‏הפער הוא first-class metric:

```text
SimulationError
```

‏Calibration משנה Model Version; Results היסטוריים אינם נדרסים.

---

## ‏45. Calibration by Context

‏לא מספיק global average.

‏נחתוך לפי:

```text
liquidity bucket
spread bucket
volatility bucket
market activity
session phase
signal horizon
execution tactic
route / venue when known
market regime
```

‏המטרה היא לזהות היכן Simulator מדויק והיכן הוא optimistic/pessimistic.

---

## ‏46. Fast-Market Correlation

‏לא נניח independence בין:

```text
signal rate
feed load
queue age
spread
latency
fill quality
exit liquidity
```

‏Fast Market יכול להחמיר הכול יחד.

‏Stress/Replay חייבים לבדוק correlated degradation.

---

## ‏47. Position Monitor Contract

‏Position פעיל יקבל path ייעודי עם:

```text
fresh position market state
entry thesis snapshot
actual fills
current signal/edge context when useful
exit state
pending exit orders
risk state
broker reconciliation state
```

‏ה־Monitor אינו תלוי ב־Scanner completing full-universe cycle.

---

## ‏48. Exit Metrics

‏נמדוד בנפרד:

```text
exit_trigger_to_decision
exit_trigger_to_submit
exit_submit_to_ack
exit_submit_to_first_fill
exit_trigger_to_flat
exit_slippage
exit_giveback
partial_exit_rate
exit_unknown_effect_rate
```

‏Entry execution statistics אינם Proxy ל־Exit quality.

---

## ‏49. Clock / Timestamp Contract

‏נפריד:

```text
market event time
provider time
broker event time
local receive time
processing time
monotonic duration clock
```

‏ל־durations מקומיים נעדיף monotonic clock.

‏אין לחסר timestamps ממערכות שונות בלי synchronization semantics ידועים.

‏Precision format אינו Accuracy evidence.

---

## ‏50. Observability under Stress

‏Telemetry צריכה:

```text
survive incidents enough for RCA
```

‏אבל:

```text
noncritical telemetry must not block the hot path
```

‏Business-critical journal נשאר durable לפי Risk class.

---

## ‏51. Live Dashboard Baseline

‏Dashboard תפעולי צריך להציג לפחות:

```text
Mode
EntryReadiness
ExitReadiness
Environment / Account fingerprint
Execution owner / epoch
Positions
Pending Exposure
Open Orders
Unknown Effects
Reconciliation State
Data Freshness
Fresh Coverage
Latency P50/P95/P99
Rejects
Net Edge Funnel
TimeToFlat
Current Incidents
```

‏Dashboard אינו Source of Truth; הוא projection של truth sources.

---

## ‏52. Alerts

‏Alert טוב כולל:

```text
what changed
why it matters
current exposure
affected capability
reason code
operational response class
```

‏Severity גבוהה שמורה בעיקר לאירועים שיכולים ליצור exposure שגוי, unknown truth או failure לצמצם Risk.

‏נמנע Alert fatigue.

---

## ‏53. Pre-Session / Startup Checklist

‏ברמת Production design נוודא:

```text
environment/account verified
market data healthy
broker state reachable
positions/orders reconciled
clock sane
build/config versions verified
risk controls loaded
kill/safety controls healthy
journal/persistence healthy
no stale recovery state
feature warmup acceptable
```

‏ה־Checklist ממומש ככל האפשר כ־machine-verifiable Readiness ולא כזיכרון אנושי בלבד.

---

## ‏54. Post-Session / End-of-Run Checklist

```text
positions match expected state
open orders match expected state
unknown effects resolved or explicitly carried
reconciliation clean
incidents / near misses captured
live-vs-modeled metrics persisted
raw evidence retained
```

---

## ‏55. Daily Review Order

```text
Safety
→ Reconciliation / State Truth
→ Data Quality
→ Decision Quality
→ Execution Quality
→ Exit Quality
→ Costs
→ Drift
→ PnL
```

‏כך Winner מקרי אינו מסתיר Process failure.

---

## ‏56. Testing / Fault Injection

‏חובה לכסות לפחות:

```text
submit then disconnect before ack
partial fill then disconnect
cancel request then fill
exit pending then broker disconnect
market data stale with open position
broker healthy + data unhealthy
broker unhealthy + data healthy
provider failover
duplicate callback
stale callback from prior generation
manual cancel
manual position change
split brain attempt
kill switch under scanner burst
logging / storage degradation
clock anomaly
restart with working order
```

---

## ‏57. Golden Properties / Invariants

```text
same IntentId cannot create duplicate authorized exposure
```

```text
UNKNOWN_EFFECT cannot blind-retry
```

```text
CancelRequested != Canceled
```

```text
partial fill changes exposure immediately
```

```text
pending exposure counts before new approval
```

```text
FLAT => broker position reconciled + no potentially-live exposure
```

```text
critical unknown state => no new entry risk
```

```text
exit/risk actions are not starved by scanner analytics
```

```text
old generation intent/callback cannot silently become current
```

```text
manual broker mutation requires reconciliation before new risk
```

```text
same recorded episode + same versions => same replay decision
```

---

## ‏58. Primary Metrics

```text
candidate_to_decision_ms
decision_to_submit_ms
submit_to_ack_ms
submit_to_first_fill_ms
signal_age_at_submit_ms
signal_age_at_fill_ms
fill_rate
partial_fill_rate
reject_rate
unknown_effect_rate
position_mismatch_count
open_order_mismatch_count
entry_slippage_bps
exit_slippage_bps
post_fill_markout
realized_round_trip_cost_bps
exit_trigger_to_flat_ms
exit_giveback
net_edge_retained
simulation_error
reconciliation_failure_rate
```

---

## ‏59. Secondary / Diagnostic Metrics

```text
fresh_coverage_ratio
feature_age
rank_age
rank_gap
rank_churn
veto_rate_by_reason
false_veto_estimate
missed_winner_estimate
no_fill_opportunity
queue_age
reconnect_count
stale_callback_count
duplicate_callback_count
manual_action_count
runtime_override_count
```

---

## ‏60. `NetEdgeRetained`

‏Concept:

```text
NetEdgeRetained
=
RealizedNetOutcome / PredictedExecutableEdge
```

‏רק כאשר denominator מוגדר ועקבי.

‏נשתמש בו יחד עם decomposition, לא כמספר יחיד שמסתיר attribution.

---

## ‏61. Promotion Criteria

‏Promotion של capability/strategy version דורש evidence כגון:

- ‏State/reconciliation invariants נשמרים.
- ‏No duplicate risk.
- ‏Unknown effects מטופלים ומנוטרים.
- ‏Data/feature/rank parity מוסברת.
- ‏Latency tails בתוך envelope שנבדק.
- ‏Observed fills/costs אינם גרועים מהותית מן envelope ללא הסבר.
- ‏Exit / `TimeToFlat` מתנהגים בתוך envelope.
- ‏No-fill/partial/reject distributions מובנים.
- ‏Post-fill markout אינו חושף toxicity בלתי צפויה מהותית.
- ‏Simulation error מדוד ומתקבל על הדעת.
- ‏Incidents/Near Misses נסגרו עם RCA מתאים.
- ‏Config/build/account provenance מלא.
- ‏Guardrails ו־kill paths נבדקו.
- ‏Evidence מכסה יותר מ־episode/regime יחיד.

---

## ‏62. Rejection / Pause Criteria

‏אין Promotion או שחוזרים לשלב מחקרי/Shadow כאשר:

- ‏Broker/Local truth מתפצלים ללא reconciliation אמין.
- ‏Duplicate side effects אפשריים.
- ‏Unknown exposure אינו פתור.
- ‏Latency tails מחוץ ל־assumptions.
- ‏Execution gap מוחק Net Edge.
- ‏Exit delay/giveback materially גרועים מהמודל.
- ‏Data quality/freshness אינם יציבים.
- ‏Paper assumptions הוכחו כאופטימיים מדי.
- ‏Simulation error אינו ניתן להסבר.
- ‏Result נשען על מעט Episodes correlated.
- ‏Config/Build/Environment provenance חסר.
- ‏Safety/Recovery drill נכשל.
- ‏PnL חיובי אך Process invariants נשברו.

---

## ‏63. Confidence

### ‏High Confidence

‏ב־:

```text
Broker truth must be reconciled
UNKNOWN_EFFECT must not blind-retry
partial/pending exposure matters
process quality != PnL
entry/exit readiness should be separable
external side effects require durable identity/audit
```

### ‏Medium Confidence

‏ב־Baseline architecture וב־metrics hierarchy עבור המערכת שלנו.

### ‏Empirical / Must Validate

‏כל threshold על:

```text
latency
slippage
markout
veto rate
reconciliation tolerance
simulation error
promotion duration/sample
capacity
```

‏אינו אוניברסלי ונדרש validation.

---

## ‏64. Fact / Judgment / Hypothesis

### ‏Fact / engineering semantics

- ‏External side effects יכולים להיות ambiguous תחת timeout/disconnect.
- ‏ACK אינו Fill.
- ‏Partial fill משנה exposure.
- ‏Local state יכול לסטות מ־Broker state.
- ‏Paper execution אינו בהכרח זהה ל־external execution.

### ‏Judgment

- ‏Reconciliation-before-entry, explicit epochs, dedicated Position Monitor ו־fail-closed Entry הם Baseline מתאים למערכת שלנו.
- ‏Process review צריך להקדים PnL review.
- ‏Live evidence צריך לכייל את Simulator דרך versioned research loop.

### ‏Hypothesis

- ‏כמה Edge נשמר בפועל.
- ‏אילו Regimes גורמים ל־execution drift הגדול ביותר.
- ‏אילו Vetoes/Order tactics משפרים Net Outcome.
- ‏כמה Calibration evidence נדרש לפני promotion של כל capability.

---

## ‏65. Time-Sensitive Facts

‏המקטע אינו מקבע semantics ספציפיים של Broker, Venue, API, account permission, pacing או fee schedule.

‏לפני Implementation של Capability חיצונית יש לאמת בזמן הרלוונטי:

```text
supported order semantics
cancel/replace behavior
paper-vs-production differences
callback / timestamp semantics
account permissions
session behavior
routing capabilities
fees / commissions where material
```

‏אין להסיק מתיאור כללי שה־Broker בפועל תומך ב־capability מסוים.

---

## ‏66. Relationship to Earlier Sheets

### ‏28 — Paper / Shadow

‏28 קובע Forward validation ללא external-risk assumptions.

‏62 מוסיף Calibration מול external truth ואת ה־gaps ש־Paper אינו יכול להוכיח.

### ‏34 — Recovery / Safe Resume

‏34 נשאר Source of Truth ל־Recovery lifecycle.

‏62 מחיל אותו על Live calibration ו־observed broker divergence.

### ‏35–36 — Observability / Safety

‏62 משתמש ב־Evidence Chain, incident packets, kill/safety controls ו־priority under failure.

### ‏46 — Adverse Selection

‏Post-fill markout ו־filled/no-fill selection משמשים למדידת Live fill quality.

### ‏48 — Latency

‏Live tail latency מכייל את `LatencyPressure` ואת Break-Even assumptions.

### ‏49 — Quant Research

‏Live observations נכנסים ל־Experiment Registry ו־versioned evidence; הם אינם license ל־one-trade tuning.

### ‏51 — Execution Engine

‏51 נשאר Source of Truth ל־Intent/Attempt/Journal/Reconciliation/Execution lifecycle.

### ‏55 — Security / Operations

‏55 נשאר Source of Truth ל־Environment, identity, ownership, audit ו־readiness.

### ‏61 — Backtest Subtleties

‏61 מגדיר Simulation Error כבעיה מחקרית.

‏62 הוא המקור המרכזי ל־observed calibration evidence שמודד אותה.

---

## ‏67. Relationship to 63

‏62 שואל:

```text
How much of modeled edge survives contact with external reality?
```

‏63 ישאל:

```text
What is the economic source of the edge,
why should it exist,
and why might it persist or decay?
```

‏לכן Live calibration אינה הוכחה ש־Edge קבוע; היא Evidence נוסף לגבי usability וה־decay שלו.

---

## ‏68. What I Would Avoid Initially

‏לא הייתי מתחיל ב־:

- ‏many execution tactics simultaneously.
- ‏multi-instance active-active execution.
- ‏automatic strategy retuning from live outcomes.
- ‏complex learned drift detector בלי baseline metrics.
- ‏automatic resume after incidents.
- ‏dozens of runtime overrides.
- ‏complex venue-specific policy לפני basic execution calibration.
- ‏large external-risk experiments כדי “לקבל sample”.
- ‏dashboard-driven manual trading logic.

---

## ‏69. What to Add Later

‏רק לאחר Evidence:

- ‏regime-conditioned calibration models.
- ‏route/venue-specific execution calibration.
- ‏adaptive execution policy.
- ‏formal control charts / drift detectors.
- ‏automated canary/shadow deployment comparison.
- ‏advanced capacity/impact calibration.
- ‏more sophisticated counterfactual matching.
- ‏learned execution-risk model.

---

## ‏70. Recommended Hierarchy

```text
Baseline
→ Reconciliation + Stable IDs + Explicit Unknown + Dedicated Exit + Measurement

Preferred Default
→ Shadow/Paper parity + versioned Live Calibration + First-Divergence RCA

Challenger
→ one controlled execution/decision change at a time

Advanced Option
→ regime-aware calibration + contextual execution models

Specialist Option
→ route/venue-specific or learned execution optimization

Avoid Unless Evidence
→ automatic retuning / automatic resume / complex active-active execution
```

---

## ‏71. Recommendation Summary

‏ברירת המחדל המומלצת לרובוט שלנו היא להתייחס ל־Live כאל **מערכת Calibration נגד Broker/Market truth**, לא כשלב שבו Backtest “מוכיח את עצמו”.

‏החוזה:

```text
External Truth First
+ Reconciliation Before New Risk
+ Stable IDs
+ UNKNOWN_EFFECT
+ Pending Exposure
+ Dedicated Exit / Position Path
+ Fail-Closed Entry Under Uncertainty
+ Versioned Build / Config / Policy
+ Live Edge Funnel
+ Drift Attribution
+ Simulation Error
+ Real-Episode Replay
+ Incident / Near-Miss Learning
→ Explainable Calibration Evidence
```

‏ה־success criterion אינו:

```text
PnL was positive
```

‏אלא:

```text
state remained correct
external truth remained reconcilable
risk invariants held
edge loss was measured and attributable
execution/exit stayed within validated envelopes
divergences fed back into reproducible research
```

‏כל הגדלה עתידית של capability או exposure היא ניסוי חדש ונפרד; היא אינה inference אוטומטי מהצלחת המודל או מיום מוצלח.