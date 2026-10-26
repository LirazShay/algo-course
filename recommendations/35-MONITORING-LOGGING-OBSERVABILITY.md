# ‏35 — Recommendation Sheet: Monitoring / Logging / Observability

> ‏מקור לימודי עיקרי: `../35-MONITORING-LOGGING-AND-OBSERVABILITY.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מעשי לשכבת Observability של הרובוט כך שכל Decision, ‏Order, ‏Fill, ‏State Transition, ‏Recovery ו־`NO_TRADE` יהיו ניתנים לקישור, חקירה ושחזור; תוך הפרדה ברורה בין `Metrics`, ‏`Structured Events`, ‏`Traces`, ‏`Truth Ledgers` ו־`Incident Artifacts`.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה להפעלה עם כסף אמיתי.

---

## ‏1. Decision

‏לא נבנה Observability סביב כלי visualization מסוים, ולא נמדוד “הכול”.

‏ה־Baseline הוא Evidence Chain מקצה לקצה:

```text
Market Event
→ Feature Snapshot
→ Score / Rank Snapshot
→ Decision
→ Risk Decision
→ Order Intent
→ Broker Order
→ Fill
→ Position
→ Exit Decision
→ Costs / PnL Attribution
→ Recovery / Incident Evidence
```

‏החלטת ה־Baseline:

```text
Metrics = aggregate health / distributions / percentiles
Structured Events = detailed machine-readable context
Traces = end-to-end latency / causality path
Truth Ledgers = durable authoritative audit
Incident Artifacts = focused high-resolution evidence
Dashboards = views over evidence, not source of truth
```

‏העיקרון המרכזי:

```text
If behavior matters,
it must be observable with stable IDs, timestamps, versions and reason codes.
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Truth Ledgers לפני Dashboards

‏הסדר המומלץ לבנייה:

```text
1. Decision / Order / Fill / Position ledgers
2. Structured state/recovery events
3. Core metrics
4. Readiness dashboard
5. Safety alerts
6. Correlation / trace context
7. Latency traces
8. Research dashboards
9. Advanced anomaly detection
```

‏הסיבה: Dashboard יפה שאינו נשען על Truth עקבי אינו Observability.

---

### ‏`P0 — Required`: Stable Correlation Graph

‏נשמור מזהים יציבים לפחות עבור:

```text
run_id
session_id
decision_id
candidate_snapshot_id
order_intent_id
client_order_id
broker_order_id
execution_id
position_id
recovery_id
incident_id
```

‏אין חובה לשמות המדויקים, אבל כל ישות חייבת להיות traceable לישות שממנה נולדה.

‏Contract לדוגמה:

```text
Decision
→ OrderIntent
→ BrokerOrder
→ Fill
→ Position
→ ExitDecision
```

‏וכל Fill חייב להיות ניתן לקישור חזרה ל־Decision המקורי.

---

### ‏`P0 — Required`: `NO_TRADE` הוא Event ראשון במעלה

‏לכל Decision cycle משמעותי נשמור:

```text
decision_id
as_of_time
rank1
rank2_or_topn
score / score gap
trade_or_no_trade
reason_codes
data_health
risk_state
broker_state
versions
```

‏אם שומרים רק עסקאות שבוצעו, נוצרת Selection Bias תפעולית ומחקרית.

---

### ‏`P0 — Required`: State / Recovery Observability

‏כל State Transition משמעותי שומר:

```text
event_id
entity_id
old_state
new_state
reason_code
event_time
processed_time
state_version
system_epoch
incident_id? / recovery_id?
```

‏ננטר לפחות:

```text
time_in_state
transition_count
unexpected_transition_count
recovery_duration
reconciliation_duration
unknown_state_duration
last_successful_reconciliation_age
```

‏`DEGRADED` ללא סיבה, גיל ו־capability impact אינו state שימושי.

---

### ‏`P0 — Required`: Durable Audit != Best-Effort Telemetry

‏נפריד בין:

```text
Best-effort telemetry export
vs
Durable truth/audit persistence
```

‏לכן:

- ‏Metric exporter יכול להיכשל בלי לעצור את כל המערכת.
- ‏Trace exporter יכול לבצע sampling.
- ‏אבל `Order`, ‏`Fill`, ‏`Position`, ‏`Risk override`, ‏`Manual resume`, ‏`Config change` ו־State transitions קריטיים אינם best effort.

‏אם Durable Truth אינו אמין, זו בעיית Readiness/Safety, לא “בעיה בדשבורד”.

---

### ‏`P0 — Required`: Structured Events, לא Log Strings

‏נשתמש ב־event names יציבים:

```text
MarketDataGapDetected
DataHealthChanged
ScannerCycleCompleted
TopCandidateChanged
DecisionCreated
RiskDecision
OrderIntentCreated
OrderSubmitted
OrderAcknowledged
OrderPartiallyFilled
OrderFilled
OrderCancelRequested
OrderCancelled
PositionChanged
ExitTriggered
RecoveryStarted
RecoveryPhaseChanged
RecoveryCompleted
ConfigChanged
StateTransition
```

‏כל event מכיל fields מפורשים במקום parsing של הודעת טקסט.

---

### ‏`P0 — Required`: Never Sample Truth Events

‏אין sampling ל־:

```text
Order submit
Order state transition
Fill
Position change
Risk block / override
System state transition
Recovery lifecycle
Manual safety action
```

‏Sampling מותר רק ל־high-frequency diagnostics שאינם Authoritative Truth.

---

### ‏`P0 — Required`: Layered Health

‏נשמור Health נפרד עבור:

```text
DATA_HEALTH
SCANNER_HEALTH
RISK_HEALTH
EXECUTION_HEALTH
BROKER_HEALTH
STATE_STORE_HEALTH
SYSTEM_HEALTH (derived)
```

‏`SYSTEM_HEALTH` אינו boolean עצמאי. הוא נגזר מ־state/capabilities של השכבות.

---

### ‏`P1 — Preferred`: Metrics לפי Questions

‏סט Baseline שימושי:

```text
fresh_coverage_ratio
market_data_last_event_age
market_data_processing_lag_p50/p95/p99
sequence_gap_count
out_of_order_event_count
dropped_event_count
scanner_cycle_latency_p50/p95/p99
feature_compute_latency_p50/p95/p99
rank_latency_p50/p95/p99
decision_latency_p50/p95/p99
rank1_changes_per_minute
rank1_age
rank_gap
broker_ack_latency_p50/p95/p99
fill_latency_p50/p95/p99
cancel_latency_p50/p95/p99
working_orders
open_positions
pending_exposure
unknown_order_effects
reconciliation_mismatches
recovery_count
recovery_duration
state_transition_count
```

‏המטרה היא לא רשימת Metrics ארוכה אלא יכולת לענות על שאלות תפעוליות אמיתיות.

---

### ‏`P1 — Preferred`: Funnel Observability

‏Scanner Funnel:

```text
raw universe
→ data valid
→ tradable
→ feature ready
→ passes filters
→ scored
→ ranked
→ candidate
→ trade ready
```

‏Order Funnel:

```text
Decision
→ Risk Approved
→ Intent
→ Submitted
→ Acked
→ Partially/Fully Filled
→ Position
```

‏לכל drop נשמור Reason Code.

---

### ‏`P1 — Preferred`: Latency Budget מקצה לקצה

‏נפרק:

```text
market_event_to_receive
receive_to_feature
feature_to_rank
rank_to_decision
decision_to_risk
risk_to_submit
submit_to_ack
ack_to_fill
exit_decision_to_flat
```

‏אבל המדד העסקי המרכזי הוא:

```text
market_event → executable action
```

‏נמדוד `p50/p90/p95/p99/max`, לא רק average.

---

### ‏`P1 — Preferred`: Queue Depth + Queue Age

‏לכל queue משמעותי:

```text
queue_depth
oldest_item_age
rejections
dropped_events
coalesced_events
backpressure_activations
```

‏`oldest_item_age` חשוב לעיתים יותר מ־queue count.

---

### ‏`P1 — Preferred`: Market Data Health

‏ננטר בנפרד:

```text
provider/exchange_to_receive_lag
receive_to_processed_lag
fresh_coverage_ratio
freshness_distribution
sequence_gap_count
reconnect_count
subscription_desired_vs_active
```

‏Connection alive אינו Feed Healthy.

‏גם Silence היא Signal: absence of expected progress צריך להיות detectable.

---

### ‏`P1 — Preferred`: Feature / Score / Rank Health

‏לכל Feature family:

```text
missing_rate
invalid_rate
zero_rate
percentiles
extreme_value_count
update_frequency
source_age
```

‏ל־Score/Rank:

```text
score_distribution
rank_gap
candidate_density
rank1_churn
rank1_persistence
```

‏שינוי Distribution יכול לנבוע מ־Regime אמיתי, Data semantics, Feature bug או deployment — Observability מראה את השינוי; Experiment/RCA בודקים את הסיבה.

---

### ‏`P1 — Preferred`: Version Context בכל Evidence

‏Decision / Trace / Incident artifact משמעותי ישמור:

```text
commit_sha
build_id
environment
strategy_version
config_version
config_hash
feature_version
score_version
execution_policy_version
risk_policy_version
data_provider_version / feed_epoch
```

‏Config change נחשב Operational Deployment לצורך before/after comparison.

---

### ‏`P1 — Preferred`: Decision Packet

‏לכל Decision משמעותי נשמור Snapshot קומפקטי:

```text
decision_id
as_of_time
symbol
rank
score
score_components
rank_gap
feature_summary
freshness
coverage
spread / executability summary
regime
risk_state
broker_state
expected_net_edge if modeled
trade_or_no_trade
reason_codes
versions
```

‏כך אפשר לענות:

```text
Why this symbol?
Why now?
Why not #2?
Why TRADE instead of NO_TRADE?
```

---

### ‏`P1 — Preferred`: Execution Observability

‏ננטר:

```text
intents_created
risk_approved
orders_submitted
orders_acked
orders_rejected
partial_fills
full_fills
cancel_requests
cancel_confirmations
unknown_effects
```

‏איכות Execution:

```text
slippage
implementation_shortfall
effective_spread
markout
time_to_fill
time_to_flat
unprotected_position_duration
```

‏Reference prices חייבים להיות side-aware ו־timestamped.

---

### ‏`P1 — Preferred`: Edge Decay לאורך Pipeline

‏כאשר יש מודל מתאים נשמור:

```text
edge_at_decision
edge_at_submit
edge_at_ack
edge_at_fill
```

‏ונמדוד:

```text
edge_lost_before_fill
```

‏זה מחבר Observability למחקר 21–22 ולא רק ל־Operations.

---

### ‏`P1 — Preferred`: Recovery Observability

‏כל Recovery phase מקבל timing:

```text
Detect
Contain
Reconcile
Rebuild
Validate
Resume
```

‏נשמור:

```text
recovery_id
incident_id
reason
phase
phase_age
blocker_codes
attempt
open_exposure
unknown_orders
last_reconciliation
```

‏`RECOVERING` בלי progress visibility הוא anti-pattern.

---

### ‏`P1 — Preferred`: Incident Packet + Flight Recorder

‏ב־Incident משמעותי נאסוף אוטומטית:

```text
system/broker/data/risk states
working orders
positions
recent decisions
recent state transitions
recent errors
latency percentiles
queue depths/ages
config/versions
recovery context
```

‏בנוסף נשמור high-resolution pre-roll/post-roll קצר באמצעות Flight Recorder או חלופה דומה.

‏כך אין צורך לשמור `TRACE` מלא לנצח.

---

### ‏`P1 — Preferred`: Dashboard קטן ומכוון Questions

‏Baseline ראשון יכול להיות Dashboard יחיד עם sections:

```text
System Readiness
Market Data Health
Scanner Health
Top Candidates
Risk State
Broker State
Open Orders
Open Positions
Latency
Recovery / Recent Alerts
```

‏בהמשך אפשר לפצל ל־Data/Scanner/Execution/Risk/Outcomes/Recovery dashboards אם זה באמת משפר חקירה.

---

### ‏`P1 — Preferred`: Alert Safety-first

‏Alerts ראשונים:

```text
market data unsafe
fresh coverage unsafe
broker unsynced
position mismatch
unknown order effect
orphan order / position
position age abnormal
recovery stuck
risk locked
critical invariant violation
truth persistence unhealthy
```

‏Alert חייב להיות actionable ולקשר ל־Runbook.

---

### ‏`P1 — Preferred`: Alert Aggregation / Hysteresis

‏Provider outage לא ייצור אלפי alerts לכל Symbol.

‏נשתמש ב־:

```text
aggregation
deduplication
cooldown
hysteresis
multi-window detection
```

‏Risk-critical invariant אינו מקבל debounce שמאחר containment.

---

### ‏`P1 — Preferred`: Readiness != Liveness

‏`/live` עונה:

```text
Is process alive and capable of progressing/recovering?
```

‏`/ready` עונה:

```text
Are required capabilities actually verified?
```

‏אין להשתמש ב־process heartbeat כ־Trading Readiness.

---

### ‏`P1 — Preferred`: Progress Heartbeats

‏ננטר progress, לא רק process life:

```text
last_processed_sequence
last_scanner_cycle
last_broker_event
last_successful_reconciliation
last_full_fresh_coverage
```

‏כך מזהים `stalled-but-alive`.

---

### ‏`P1 — Preferred`: Cardinality Budget

‏Metrics אינם Database.

‏לא נכניס labels בלתי bounded כמו:

```text
symbol x decision_id x order_id
```

‏ל־Metrics.

‏High-cardinality context נשמר ב־Events/Logs/Traces/Ledgers.

‏Symbol-level rich telemetry יישמר בעיקר עבור:

```text
Top-N
Candidates
near-threshold rejects
periodic samples
incident windows
```

---

### ‏`P1 — Preferred`: Retention Tiers

‏נפריד בין:

```text
short-lived high-frequency diagnostics
medium-lived structured operational events
longer-lived aggregates
long-lived truth ledgers
long-lived incident/RCA artifacts
```

‏Order/Fill/Decision/State evidence חשוב יותר מ־DEBUG noise.

---

### ‏`P1 — Preferred`: Telemetry מחוץ ל־Critical Path

‏Exporter איטי לא יעכב Submit/Fill processing.

‏נעדיף async/buffered export, עם מדדים ל־:

```text
export_queue_depth
export_failures
dropped_telemetry
last_successful_export
```

‏אבל שוב: Durable Truth אינו exporter best-effort.

---

### ‏`P1 — Preferred`: Security / Audit

‏אסור לכתוב:

```text
passwords
tokens
API secrets
session credentials
```

‏נפעיל redaction ונשמור manual actions עם:

```text
actor
action
time
reason
previous_state
new_state
result
```

‏כל telemetry נושאת `environment = REPLAY/SHADOW/PAPER/...`; אין לערבב environments בדוחות.

---

### ‏`P2 — Challenger`: Scoped Dynamic Diagnostics

‏במקום `DEBUG` גלובלי:

```text
DEBUG for symbol X / decision Y / incident Z / component K
for limited duration
```

‏זה עדיף על הצפת כל ה־Universe.

---

### ‏`P2 — Challenger`: Distributed / End-to-End Tracing

‏נוסיף tracing מלא כאשר הוא מוכיח ערך בחקירת latency/cause path.

‏Spans אפשריים:

```text
market receive
feature update
rank update
decision
risk
serialization
submit
ack
fill
```

‏ה־Baseline אינו מחייב tracing לכל Tick.

---

### ‏`P2 — Challenger`: SLI / SLO / Burn Rate

‏אחרי שיש Measurements אמינים נגדיר SLOs כגון:

```text
fresh coverage objective
scanner latency objective
broker ack latency objective
safe resume objective
```

‏ה־thresholds נגזרים מה־Signal/Edge horizon וה־execution requirements; אין מספרי קסם.

‏אין Error Budget ל־Safety Invariants כמו duplicate unintended exposure.

---

### ‏`P2 — Challenger`: Baseline-aware Alerts

‏Alerts יכולים להשוות ל־baseline לפי:

```text
time of day
regime
provider
execution mode
```

‏אבל לא נאפשר adaptive baseline מהיר כל כך שהוא “מלמד” degradation איטי כתקין.

---

### ‏`P2 — Challenger`: Provider/Broker Divergence Monitoring

‏אם שני מקורות זמינים:

```text
quote divergence
trade divergence
freshness divergence
missing-symbol divergence
```

‏מדדים אלה הם diagnostics; אין להפוך noise טבעי ל־hard gate ללא Evidence.

---

## ‏3. Why

‏Observability היא חלק מה־correctness של מערכת קצרה ומהירה.

‏ב־horizon של שניות, איבוד Edge יכול להגיע מ־:

```text
Provider lag
→ local queue age
→ feature delay
→ rank delay
→ decision delay
→ broker delay
→ fill delay
```

‏PnL סופי לבדו אינו אומר איפה נוצר הכשל.

‏Evidence Chain מאפשר:

```text
Observation
→ First Divergence
→ RCA
→ Hypothesis
→ Controlled Experiment / Fix
→ Regression Test
→ New Monitor
```

---

## ‏4. Use When

‏ה־Baseline מתאים כאשר:

- ‏יש pipeline של Data → Rank → Decision → Execution.
- ‏צריך Replay/RCA אמיתי.
- ‏קיימים Async events ו־partial/unknown states.
- ‏רוצים להבחין בין Signal failure ל־Execution failure.
- ‏רוצים לזהות degradation לפני שהוא הופך ל־Incident גדול יותר.
- ‏רוצים לקשר Operational Health ל־Research Outcomes.

---

## ‏5. Do Not Use When

‏אל תשתמשו ב־Observability כתחליף ל־:

- ‏State Machine.
- ‏Risk controls.
- ‏Reconciliation.
- ‏Durable persistence.
- ‏Replay correctness.
- ‏Validation של Strategy.

‏Alert אינו מנגנון containment. ‏Dashboard אינו source of truth.

---

## ‏6. Alternatives

### ‏Alternative A — Logs בלבד

‏פשוט, אבל חלש ב־aggregates, percentiles, correlations ו־fast diagnosis.

### ‏Alternative B — Metrics בלבד

‏טוב ל־health trends, גרוע ל־causality/individual trade reconstruction.

### ‏Alternative C — Full tracing לכל event

‏עשיר מאוד אך יקר ומסוכן מבחינת overhead/cardinality.

### ‏Alternative D — Vendor-first stack

‏לבחור כלי ואז להתאים אליו את telemetry.

‏פחות מומלץ. קודם מגדירים Evidence Contract, אחר כך כלי.

---

## ‏7. Trade-offs

| Choice | יתרון | מחיר |
|---|---|---|
| ‏Rich structured events | ‏RCA חזק | ‏נפח אחסון |
| ‏Metrics aggregates | ‏Monitoring זול ומהיר | ‏אין detail per event |
| ‏Tracing | ‏Latency causality | ‏overhead / volume |
| ‏Flight recorder | ‏High-resolution incidents | ‏מורכבות buffering |
| ‏High retention | ‏מחקר ארוך | ‏עלות storage |
| ‏Low-cardinality metrics | ‏Stack יציב | ‏פחות drill-down ישיר |
| ‏Async telemetry export | ‏לא פוגע critical path | ‏אפשר לאבד best-effort telemetry |

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מתחיל עם:

- ‏עשרות dashboards.
- ‏מאות alerts.
- ‏`TRACE` לכל Tick.
- ‏high-cardinality labels לכל Symbol/Decision/Order.
- ‏אחסון מלא של כל Feature לכל Symbol לנצח.
- ‏auto-anomaly detection לפני שיש baseline אמין.
- ‏dynamic thresholds מורכבים לפני hard safety checks.
- ‏tool-specific coupling בליבת הקוד.
- ‏green/red global status יחיד.

---

## ‏9. What to Add Later

‏לאחר שה־Baseline מוכיח את עצמו:

```text
Scoped dynamic debug
→ richer end-to-end tracing
→ SLO / burn-rate alerting
→ incident flight recorder automation
→ provider cross-check dashboards
→ anomaly detection
→ automatic incident packet generation
→ long-term reliability trend analysis
```

---

## ‏10. Required Data / Evidence

‏כדי לקדם את ה־Observability stack נדרשים:

```text
stable IDs
canonical timestamps
state transition journal
order/fill/position ledgers
decision records
reason-code registry
version metadata
market-data freshness/coverage events
queue/backpressure metrics
broker/recovery events
```

‏כל Incident רציני צריך להיות ניתן לשחזור לפחות ברמת timeline ו־Decision/Order/Fill graph.

---

## ‏11. Promotion Criteria

‏Observability Baseline נחשב מוכן כאשר:

- ‏כל Order ניתן לעקוב חזרה ל־Decision.
- ‏כל Fill ניתן לעקוב ל־Order Intent ול־Position.
- ‏כל State Transition משמעותי מקבל reason code.
- ‏כל `NO_TRADE` משמעותי ניתן להסבר.
- ‏ניתן לראות Data coverage/freshness בזמן אמת.
- ‏ניתן לראות `UNKNOWN` באופן בולט.
- ‏ניתן לפרק latency לפי pipeline stages.
- ‏Restart/Recovery incidents מייצרים evidence usable ל־RCA.
- ‏Fault injection מפעיל alert צפוי.
- ‏אין secrets ב־logs/traces.
- ‏Metrics cardinality נשלטת.
- ‏Telemetry overhead אינו פוגע באופן מהותי ב־critical path.
- ‏Truth persistence failure נחשף כ־safety/readiness problem.

---

## ‏12. Rejection Criteria

‏נדחה Design שבו:

- ‏יש Dashboard ללא stable correlation IDs.
- ‏שומרים רק Trades ולא `NO_TRADE`.
- ‏שומרים רק averages בלי tails.
- ‏`connected=true` משמש health/readiness.
- ‏`SYSTEM_HEALTH` הוא boolean עצמאי.
- ‏Unknown financial state יכול להיראות green.
- ‏Metric labels כוללים IDs בלתי bounded.
- ‏critical events עוברים sampling.
- ‏telemetry export נמצא ב־critical path.
- ‏truth ledger נחשב “עוד log”.
- ‏alerts אינם actionable ואין להם runbook.
- ‏Paper/Replay/Shadow data מתערבבים ללא environment tag.
- ‏Version context חסר.

---

## ‏13. Metrics

### ‏Data

```text
fresh_coverage_ratio
last_event_age
provider_lag_p50/p95/p99
local_processing_lag_p50/p95/p99
sequence_gap_count
out_of_order_count
dropped_event_count
subscription_diff_count
```

### ‏Scanner / Ranking

```text
scanner_cycle_p50/p95/p99
feature_latency_p50/p95/p99
rank_latency_p50/p95/p99
rank1_changes_per_minute
rank1_age
rank_gap
candidate_funnel_counts
no_trade_reason_counts
```

### ‏Execution / Broker

```text
submit_to_ack_p50/p95/p99
ack_to_fill_p50/p95/p99
cancel_latency_p50/p95/p99
fill_rate
partial_fill_rate
unknown_order_effect_count
reconciliation_mismatch_count
working_orders
pending_exposure
```

### ‏Position / Exit

```text
position_age
time_to_flat
unprotected_position_duration
slippage
implementation_shortfall
markout
edge_lost_before_fill
```

### ‏Recovery

```text
recovery_count
recovery_duration
reconciliation_duration
unknown_state_duration
safe_resume_success/failure
stuck_recovery_count
```

### ‏Observability stack

```text
telemetry_export_queue_depth
telemetry_export_failures
dropped_telemetry
metrics_cardinality
log_volume
trace_volume
storage_growth
```

---

## ‏14. Failure Modes

### ‏14.1 Metric Cardinality Explosion

‏Monitoring stack עצמו נהיה bottleneck.

### ‏14.2 Truth/Event Confusion

‏Best-effort log משמש בטעות כ־source of truth.

### ‏14.3 Missing Correlation

‏יש המון telemetry אבל אי אפשר לקשר Decision → Order → Fill.

### ‏14.4 Silent Degradation

‏Feed חלקי אך Scanner נראה “פעיל”.

### ‏14.5 Tail Blindness

‏Average תקין מסתיר `p99` גרוע.

### ‏14.6 Alert Storm

‏אירוע Provider יחיד יוצר אלפי התראות.

### ‏14.7 Green While Unknown

‏Overall health נראה תקין בזמן unresolved financial state.

### ‏14.8 Telemetry Critical-Path Coupling

‏Exporter איטי מגדיל execution latency.

### ‏14.9 Missing Version Context

‏לא ניתן לדעת איזה Code/Config יצר behavior.

### ‏14.10 Overlogging

‏נפח גבוה מסתיר Signal ומגדיל עלות.

### ‏14.11 Underlogging

‏Incident לא ניתן לשחזור כי חסר pre-context.

### ‏14.12 Observability Failure Hidden

‏Exporter נפל ואף אחד לא יודע שה־dashboard stale.

---

## ‏15. User-Specific Application

‏לרובוט Whole-Market Short-Horizon שלנו, סדר העבודה המומלץ:

```text
Truth Ledgers
→ Decision IDs + Reason Codes
→ Whole-Market Freshness/Coverage Metrics
→ Scanner/Rank Funnel
→ State + Recovery Journal
→ Broker/Execution Funnel
→ Percentile Latency Budget
→ One Readiness Dashboard
→ Safety Alerts
→ Incident Packet / Flight Recorder
→ Research dashboards
```

‏ארבעת המדדים החשובים במיוחד לשיטה שלנו:

```text
Fresh Coverage Ratio
End-to-End Latency / Signal TTL
Unknown Financial State Duration
Time to Flat / Unprotected Position Duration
```

‏ומבחינת מחקר:

```text
Rank at decision
→ Rank at submit
→ Rank at fill
→ Edge at each stage
```

‏כך נוכל להבחין אם הבעיה הייתה Scanner, ‏Latency, ‏Execution או Exit.

---

## ‏16. Concrete / Baseline Contract

‏כל `DecisionRecord`:

```text
decision_id
run_id
session_id
environment
as_of_time
symbol
rank
rank_percentile
score
score_components
rank_gap
feature_summary
fresh_coverage_ratio
data_health
risk_state
broker_state
system_state
trade_or_no_trade
reason_codes
strategy_version
config_version
config_hash
feature_version
score_version
execution_policy_version
risk_policy_version
commit_sha
```

‏כל `OrderTelemetryRecord`:

```text
order_intent_id
decision_id
client_order_id
broker_order_id
submit_time
ack_time
fill_times
cancel_request_time
cancel_confirm_time
state
state_version
unknown_effect_flag
```

‏כל `StateTransitionRecord`:

```text
event_id
entity_id
old_state
new_state
reason_code
event_time
processed_time
state_version
system_epoch
incident_id
recovery_id
```

‏כל `IncidentPacket`:

```text
incident_id
trigger_time
pre_roll_start
post_roll_end
system/broker/data/risk states
open orders
positions
recent decisions
recent state transitions
recent errors
latency percentiles
queue depths/ages
versions/config hashes
recovery context
```

---

## ‏17. Confidence

### ‏High

- ‏Stable correlation IDs.
- ‏Structured events.
- ‏Truth ledger vs telemetry separation.
- ‏Percentiles over averages.
- ‏Freshness/coverage as first-class metrics.
- ‏State/recovery observability.
- ‏No sampling of truth events.
- ‏Low-cardinality metrics.
- ‏Version/environment context.

### ‏Medium

- ‏Flight Recorder implementation details.
- ‏Trace depth required for initial release.
- ‏Dynamic baseline alerting.
- ‏Exact retention tiers.

### ‏Low / Evidence Required

- ‏Automated anomaly detection.
- ‏Advanced correlation-based auto-containment.
- ‏Large-scale distributed tracing for every market event.

---

## ‏18. Time-Sensitive Facts

‏המקטע מתודולוגי ואינו מחייב כרגע אימות Web חדש.

‏אם בהמשך נבחר stack/vendor ספציפי ל־metrics/logs/traces, יש לאמת מחדש:

```text
pricing
retention limits
ingest limits
cardinality limits
export semantics
security model
```

‏לפני קיבוע ארכיטקטוני.

---

## ‏19. Relationship to Later Sheets

### ‏36 — Kill Switches / Safety Controls

‏35 מגדיר מה אנחנו רואים ומודדים; 36 יגדיר אילו Safety actions מופעלות כאשר Evidence אומר שהמערכת אינה בטוחה.

### ‏37+ Production / Performance / Testing topics

‏ה־metrics וה־incident evidence יהפכו inputs למדידת performance, regression, deployment safety ו־capacity.

### ‏26 — RCA

‏35 מספק את חומר הגלם ל־First-Divergence RCA.

### ‏27 — Replay

‏Incident artifacts צריכים להיות replayable ככל האפשר.

### ‏33–34 — State / Recovery

‏Observability אינה מחליפה State/Recovery; היא הופכת אותם לגלויים, מדידים ו־auditable.

---

## ‏20. Recommendation Summary

```text
Truth Ledgers First
→ Stable IDs
→ Structured Events
→ Whole-Market Freshness/Coverage
→ Decision + NO_TRADE Records
→ State / Recovery Journal
→ Low-Cardinality Metrics
→ Percentile Latency Budget
→ Execution / Position Funnel
→ One Readiness Dashboard
→ Safety Alerts + Runbooks
→ Incident Packet / Flight Recorder
→ Replay / RCA Feedback
→ Advanced Tracing only when Evidence justifies it
```

‏משפט המפתח:

> ‏Observability אינה “יש לנו גרפים”. Observability היא היכולת להפוך Decision, ‏Order, ‏Fill, ‏State change ו־Incident לשרשרת ראיות מלאה שניתן למדוד, להסביר ולשחזר.
