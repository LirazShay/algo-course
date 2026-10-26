# ‏48 — Recommendation Sheet: Latency Edge without pretending to be HFT

> ‏מקור לימודי עיקרי: `../48-LATENCY-EDGE-WITHOUT-PRETENDING-TO-BE-HFT.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מחקרי, ארכיטקטוני ותפעולי ל־`Latency` עבור רובוט `Short-Horizon Momentum`, כך שנמדוד את כל השרשרת מ־Market Event ועד Decision, Submit, Fill ו־Flat, נגזור יעדי ביצועים מ־Signal Half-Life ו־Net Edge ולא ממספרי vanity, ונשפר קודם את ה־bottlenecks הכלכליים הגדולים לפני שנכנסים ל־micro-optimizations שמוסיפים Complexity ללא Evidence.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו מגדיר מסחר אמיתי, Exposure אמיתי או יעדי latency תפעוליים לחשבון חי.

---

## ‏1. Decision

‏`Latency` תוגדר אצלנו כ־**Edge Preservation Constraint**, לא כ־מטרה עצמאית להיות “הכי מהירים”.

‏ה־Baseline:

```text
Market Evidence
→ Fresh Receive
→ Canonical State
→ Fast Features
→ Whole-Market Rank
→ Top-N Deep Checks
→ Decision
→ Risk / Safety
→ Freshness + TTL Recheck
→ Order Intent
→ Broker Submit
→ ACK / Fill
→ Position
→ Exit Decision
→ Flat
```

‏בכל boundary משמעותי נשמור:

```text
timestamp
monotonic duration where applicable
queue age
state/version
quality/confidence
```

‏העיקרון המחייב:

```text
Latency is useful only when it preserves executable edge.

Fastest Possible != Objective
Fast Enough + Stable + Measured + Safe = Objective
```

‏המדד הרעיוני המרכזי:

```text
LatencyPressure
=
EndToEndLatency / SignalHalfLife
```

‏אותו `80ms` יכול להיות מצוין ל־Signal שחי שניות, ובלתי־שמיש ל־Signal שחי זמן קצר בהרבה.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏Timing Contract מקצה לקצה

‏לכל Decision/Intent/Fill משמעותי נשמור, ככל שהמקורות מאפשרים:

```text
market_event_time?
provider_time?
app_receive_time
canonical_state_time
feature_ready_time
rank_ready_time
decision_time
risk_approved_time
intent_created_time
intent_dequeued_time
broker_send_time
broker_ack_time?
first_fill_time?
terminal_fill_time?
exit_signal_time?
exit_decision_time?
exit_send_time?
flat_time?
```

‏לא כל timestamp שייך לאותו clock domain.

‏לכן לכל זמן חיצוני נשמור גם provenance/semantics כאשר ידוע:

```text
time_source
time_semantics
clock_domain
precision_claim
quality
```

### ‏`P0 — Required`: ‏Durations מקומיים עם Clock מונוטוני

‏Durations בתוך process יימדדו בעזרת monotonic clock.

‏Wall-clock timestamps נשמרים לצורך correlation/audit.

‏אין להחסיר timestamps משני clocks שונים ולקרוא לתוצאה “latency” בלי synchronization contract.

### ‏`P0 — Required`: ‏Freshness לפני Compute Speed

‏הסדר:

```text
Is the evidence fresh?
→ Is the pipeline current?
→ How fast did we compute?
```

‏חישוב Score ב־`1ms` על Quote ישן אינו low latency במובן הכלכלי.

‏נשמור לפחות:

```text
quote_age
trade_age
feature_age
rank_age
candidate_age
signal_age
signal_age_at_submit
signal_age_at_fill
```

### ‏`P0 — Required`: ‏Signal TTL / Decision TTL

‏Intent קצר חייב לשאת:

```text
created_at
valid_until
signal_version
market_state_version
```

‏בזמן dequeue ובזמן pre-submit recheck:

```text
if now > valid_until:
    reject as stale
```

‏אסור לשלוח Intent ישן רק מפני שהוא כבר נמצא בתור.

### ‏`P0 — Required`: ‏P50 אינו מספיק

‏לכל stage קריטי נשמור לפחות:

```text
p50
p90
p95
p99
max
```

‏`p99.9` יתווסף רק כאשר sample size ו־measurement fidelity מצדיקים זאת.

‏Tail latency הוא P0 משום שהוא יכול להיות correlated עם:

```text
market bursts
provider bursts
open/close transitions
fast markets
storage pressure
GC/runtime pauses
broker congestion
```

### ‏`P0 — Required`: ‏Queue Age הוא Latency Metric ראשון במעלה

‏נמדוד בכל bounded pipeline רלוונטי:

```text
queue_depth
oldest_item_age
arrival_rate
processing_rate
```

‏Queue length לבדו אינו מספיק.

‏אם oldest actionable item ישן מדי ביחס ל־Signal TTL:

```text
BLOCK_NEW_ENTRIES
```

‏יכול להיות ה־safe outcome.

### ‏`P0 — Required`: ‏Backpressure הוא Safety State

‏כאשר:

```text
producer_rate > consumer_rate
```

‏למשך זמן משמעותי, לא מעבדים “עבר” כאילו הוא הווה.

‏Baseline degradation order:

```text
coalesce state-only market updates where semantically safe
→ drop noncritical diagnostics if needed
→ disable expensive optional enrichment
→ preserve broker/risk/fill truth
→ block new entries if freshness cannot be guaranteed
```

‏לעולם לא נזרוק בשקט:

```text
order acknowledgement
fill
cancel state
position update
risk event
reconciliation event
```

### ‏`P0 — Required`: ‏Priority לפי חשיבות כלכלית

‏בזמן עומס:

```text
Exit / Position Management
> Broker Orders / Fills / Cancels
> Risk / Safety / Reconciliation
> Entry Execution
> Scanner Refresh
> Diagnostics / Research Enrichment / UI
```

‏UI או telemetry enrichment אינם רשאים לעכב Exit.

### ‏`P0 — Required`: ‏Cross-Sectional Freshness / Fairness

‏ל־whole-market ranking נשמור:

```text
rank_as_of_time
fresh_symbol_count
expected_symbol_count
fresh_coverage_ratio
oldest_symbol_age
newest_symbol_age
ranking_duration
```

‏Rank #1 אינו trusted כאשר הוא “המנצח מבין מי שהספיק להתעדכן”.

### ‏`P0 — Required`: ‏Latency breach אינו override ל־Risk/Safety

‏Performance optimization לעולם אינו עוקף:

```text
no duplicate intent
no entry on stale data
no entry while broker truth unknown
no entry while risk state unknown
no overfill
no exit quantity above known position
```

‏Correctness קודם ל־speed.

### ‏`P0 — Required`: ‏Entry ו־Exit מקבלים Budgets שונים

‏נמדוד Entry בנפרד מ־Exit.

‏Entry:

```text
market_to_decision
decision_to_submit
submit_to_ack
submit_to_first_fill
signal_age_at_fill
```

‏Exit:

```text
exit_signal_to_decision
exit_decision_to_submit
exit_submit_to_ack
exit_signal_to_flat
exit_decision_to_flat
```

‏`Time-to-Flat` הוא KPI קריטי ואינו נגזר מ־Entry latency.

### ‏`P1 — Preferred Default`: ‏Latency Budget לפי Stage

‏לא נקבע עדיין מספרי יעד קשיחים.

‏נגדיר לכל stage Contract:

```text
stage_name
budget_basis
budget_ms?
p50_ms
p95_ms
p99_ms
max_ms
breach_count
breach_rate
```

‏`budget_ms` יקודם רק לאחר Signal-decay evidence.

### ‏`P1 — Preferred Default`: ‏Economic SLO במקום Arbitrary SLO

‏יעד ביצועים צריך להיגזר מ־:

```text
Signal Half-Life
Break-Even Latency
Latency Cliff
Observed Distribution
Safety Headroom
```

‏לדוגמה רעיונית:

```text
share_of_entries_submitted_before_fraction_of_signal_half_life
```

‏ולא:

```text
latency must be < 100ms because 100ms sounds fast
```

### ‏`P1 — Preferred Default`: ‏Artificial Delay Experiment

‏לכל Strategy Candidate נריץ Replay sensitivity עם delays שונים שמתאימים ל־data fidelity.

‏Conceptual grid:

```text
0 model delay
25ms
50ms
100ms
250ms
500ms
1s
2s
```

‏ה־grid אינו target ואינו קבוע.

‏נמדוד בכל delay:

```text
Net EV
Trade / No-Trade changes
Top-N / Rank changes
Fill Rate
Slippage
Markout
Missed Opportunity
Selection Regret
Time-to-Flat / Exit Giveback where applicable
```

### ‏`P1 — Preferred Default`: ‏Break-Even Latency + Headroom

‏נחפש:

```text
BreakEvenLatency
=
delay where ExpectedNetEdge reaches approximately zero
```

‏ונגזור:

```text
LatencyHeadroom
=
BreakEvenLatency - ObservedLatency
```

‏Production-like target עתידי חייב לשמור headroom גם ב־tail, לא רק ב־median.

### ‏`P1 — Preferred Default`: ‏Correlated Latency Model

‏Replay לא יניח latency constant ובלתי־תלוי בשוק.

‏נשמור distributions לפי context, למשל:

```text
normal
open/close transition
high activity
fast market
provider degraded
broker degraded
recovery
```

‏כאשר יש shadow traces אמיתיים, ניתן להשתמש בהם כ־empirical latency source.

### ‏`P1 — Preferred Default`: ‏Fast Path + Top-N Deep Path

```text
Whole Market
→ cheap incremental state/features
→ controlled rank
→ Top-N
→ deep Book / Flow / Capacity / Execution checks
```

‏לא נשלם Deep Path cost עבור כל אלפי הסמלים בכל event.

### ‏`P1 — Preferred Default`: ‏Feature Registry כולל Serving Cost

‏לכל Feature משמעותי נשמור:

```text
predictive_value
incremental_net_value
compute_cost
latency_cost
memory_cost
freshness_requirement
fidelity_requirement
```

‏Feature מעט טוב יותר offline אך יקר מאוד ב־serving יכול להיות גרוע יותר end-to-end.

### ‏`P1 — Preferred Default`: ‏Hot Path קטן וברור

‏Hot path צריך לכלול רק מה שנחוץ להחלטה בטוחה ועדכנית.

‏Baseline:

```text
current state
incremental features
rank state
candidate gate
risk state
safety state
execution recheck
order intent
```

‏לא ב־hot path:

```text
UI rendering
remote analytics enrichment
noncritical synchronous logging
slow research queries
bulk report generation
```

### ‏`P1 — Preferred Default`: ‏Precomputed Risk/Broker State

‏Risk decision לא יבצע full account query לפני כל Entry.

‏נשמור local reconciled state:

```text
positions
working orders
pending exposure
unknown exposure
remaining limits
broker readiness
last reconciliation age
```

‏אם ה־state stale/unknown:

```text
BLOCK_NEW_ENTRIES
```

### ‏`P1 — Preferred Default`: ‏Bounded Queues / Channels

‏כל queue אסינכרוני ב־critical architecture חייב Contract:

```text
capacity
overflow_policy
priority
oldest_age_metric
criticality
coalescing_allowed
loss_allowed
```

‏אין unbounded queue כברירת מחדל.

### ‏`P1 — Preferred Default`: ‏Event-Driven Ingestion כאשר הספק מאפשר

‏Streaming מתאים יותר מ־slow polling ל־short-horizon research.

‏אבל streaming אינו מספיק:

```text
fast feed
+ slow consumer
=
stale system
```

‏לכן throughput/backpressure נמדדים יחד עם freshness.

### ‏`P1 — Preferred Default`: ‏Browser אינו assumed deterministic execution runtime

‏Browser/JS יכולים להיות מצוינים ל־collector/POC/research.

‏אם הם נמצאים ב־critical path, נמדוד:

```text
event_loop_lag
background throttling behavior
DOM/update cost
message jitter
```

‏Baseline production architecture עתידי יעדיף controlled local service ל־critical state/decision path אם evidence מראה שה־browser jitter משמעותי.

### ‏`P1 — Preferred Default`: ‏KISS deployment benchmark

‏לא נבחר deployment לפי ping בלבד.

‏נשווה end-to-end בין חלופות כגון:

```text
local runtime
remote/cloud runtime near provider path
remote/cloud runtime near broker/provider path
```

‏ההשוואה כוללת:

```text
market freshness
decision latency
broker path
jitter
reconnect/recovery
reliability
operational complexity
```

‏אין promotion של deployment חדש ללא end-to-end evidence.

---

## ‏3. למה זו ברירת המחדל

‏במערכת שאינה microsecond-HFT, רוב הערך אינו מגיע מהחלפת `4ms` ב־`3ms` בכל מקום.

‏ה־big wins בדרך כלל מתחילים ב־:

```text
remove polling delay
reduce stale data
avoid backlog
remove synchronous I/O
avoid full recomputation
keep broker session warm
reject stale intents
prioritize exits
fix large network/deployment bottlenecks
```

‏רק אחרי שה־waterfall נקי, low-level tuning מתחיל להיות candidate אמיתי.

‏הגישה הזאת מפחיתה:

- ‏Complexity.
- ‏Concurrency bugs.
- ‏Fragile runtime behavior.
- ‏Unexplained latency.
- ‏Premature optimization.
- ‏Operational risk.

---

## ‏4. Core Latency Domains

‏נפריד לפחות:

```text
Market Observation Latency
Provider Transport Latency
App Receive Latency
Canonicalization Latency
Feature Latency
Ranking Latency
Decision Latency
Risk/Safety Latency
Intent Queue Latency
Order Serialization/Send Latency
Broker ACK Latency
Execution / Fill Delay
Callback Latency
Cancel Latency
Exit Detection Latency
Exit-to-Flat Latency
Recovery-to-Ready Latency
```

‏`Submit-to-Fill` אינו pure latency metric משום שהוא תלוי גם ב־Queue, ‏Order aggressiveness, ‏Liquidity ו־Routing.

---

## ‏5. Latency Waterfall Contract

‏לכל Decision trace משמעותי נשמור Waterfall עם stable IDs:

```text
run_id
session_id
decision_id
order_intent_id
client_order_id
broker_order_id?
execution_id?
position_id?
```

‏Stages לדוגמה:

```text
MARKET_TO_RECEIVE
RECEIVE_TO_CANONICAL
CANONICAL_TO_FEATURE
FEATURE_TO_RANK
RANK_TO_DECISION
DECISION_TO_RISK
RISK_TO_INTENT
INTENT_QUEUE_WAIT
INTENT_TO_SUBMIT
SUBMIT_TO_ACK
ACK_TO_FIRST_FILL
SUBMIT_TO_FIRST_FILL
CANCEL_REQUEST_TO_CONFIRM
EXIT_DECISION_TO_FLAT
```

‏כל stage כולל:

```text
start_time
end_time
duration_monotonic
quality
cause_if_breached
```

---

## ‏6. Signal Half-Life Contract

‏`Signal Half-Life` יוגדר אמפירית כ־decay profile, לא כ־מספר פיזיקלי קשיח.

‏נמדוד:

```text
expected_edge(age)
rank_persistence(age)
trade_probability(age)
executable_edge(age)
```

‏Horizon grid מותאם ל־data fidelity.

‏מכאן נגזור:

```text
SignalHalfLifeEstimate
BreakEvenLatencyEstimate
LatencyCliffEstimate
LatencyConfidence
```

---

## ‏7. Latency Pressure

‏Diagnostic בסיסי:

```text
LatencyPressureP50 = p50_end_to_end / signal_half_life
LatencyPressureP95 = p95_end_to_end / signal_half_life
LatencyPressureP99 = p99_end_to_end / signal_half_life
```

‏זה אינו score universal.

‏הוא כלי להשוואה בין Strategy/Regime/Deployment כאשר half-life meaningful.

---

## ‏8. Latency Cliff

‏לא נניח decay לינארי.

‏נחפש regions:

```text
SAFE_HEADROOM
DEGRADING
MARGINAL
CLIFF
BEYOND_EDGE
```

‏אם conclusion משתנה מאוד ליד threshold בודד, Strategy רגישה מדי וזקוקה ל־stress evidence נוסף.

---

## ‏9. Freshness Contract

‏לכל Input משמעותי:

```text
source_time?
received_time
state_as_of
feature_as_of
age_at_decision
age_at_submit
quality
```

‏אין fallback אוטומטי ל־old-but-last-known-good עבור Entry.

```text
STALE != FRESH
UNKNOWN != FRESH
```

---

## ‏10. Scanner Timing Contract

‏Whole-market scanner ישמור:

```text
cycle_id
cycle_start
cycle_end
rank_as_of
cycle_duration
fresh_coverage_ratio
oldest_symbol_age
newest_symbol_age
candidate_ready_time
```

‏אם Ranking אינו full-cycle אלא incremental, עדיין נדרש logical `as_of`/freshness contract.

---

## ‏11. Fast Path / Deep Path

‏Fast Path לכל ה־Universe:

```text
freshness
short momentum
activity
simple spread/liquidity
cheap flow/book context where available
score/rank inputs
```

‏Deep Path ל־Top-N בלבד:

```text
advanced order flow
book dynamics
queue context
adverse-selection context
capacity
broker capability / execution recheck
```

‏כל Deep check צריך להצדיק:

```text
quality_gain > latency_cost
```

---

## ‏12. Latest-State vs Event-History Processing

‏Features מסווגים:

```text
STATE
PATH
FLOW
```

‏`STATE` יכול לעיתים לאפשר coalescing.

‏`PATH/FLOW` בדרך כלל דורשים Event History.

‏אסור להפעיל coalescing כללי שמוחק Volume/Trade-count/Order-flow semantics.

---

## ‏13. Backpressure State Machine

‏Operational states אפשריים:

```text
NORMAL
PRESSURE_RISING
DEGRADED
ENTRY_BLOCKED
RECOVERING
READY
```

‏Triggers מבוססים על שילוב:

```text
queue_age
fresh_coverage
processing_rate / arrival_rate
stage p99
critical consumer lag
```

‏לא על Queue Length יחיד.

---

## ‏14. Recovery after Latency Incident

‏כאשר latency חוזרת לכאורה לנורמה, אין Resume מיידי.

‏נבדוק:

```text
queues drained or bounded-current
stale intents expired
market state fresh
coverage restored
broker state reconciled
positions/orders known
scanner warm
risk/safety state valid
latency stable over recovery window
```

‏רק אז:

```text
RECOVERY_VALIDATED
```

‏יכול לאפשר חזרה ל־Entry capability.

---

## ‏15. Latency Safety Gate

‏Entry gate יכול לקבל inputs:

```text
signal_age
signal_ttl
queue_age
market_to_decision
expected_submit_latency
fresh_coverage_ratio
latency_state
```

‏Outputs:

```text
ALLOW
WAIT
BLOCK_NEW_ENTRIES
NO_TRADE_LATENCY
```

‏Risk-reducing actions נשמרות ככל שה־state מאפשר אותן בבטחה.

---

## ‏16. Latency SLI Baseline

‏ננטר לפחות:

```text
fresh_coverage_ratio
market_to_receive_p95/p99
receive_to_feature_p95/p99
feature_to_rank_p95/p99
rank_to_decision_p95/p99
decision_to_submit_p95/p99
signal_age_at_submit_p95/p99
signal_age_at_fill_p95/p99
submit_to_ack_p95/p99
cancel_to_confirm_p95/p99
exit_to_flat_p95/p99
queue_age_p95/p99
scanner_cycle_p95/p99
```

‏כאשר Stage לא נמדד בגלל clock-domain limits, נציג `UNKNOWN` ולא precision מזויפת.

---

## ‏17. Latency SLO Policy

‏אין כאן יעד מספרי גלובלי.

‏Promotion של SLO מחייב:

```text
signal decay evidence
live-like/shadow latency distribution
replay sensitivity
broker/provider distribution
P99 headroom
safety margin
```

‏SLO הוא versioned configuration.

---

## ‏18. Jitter

‏נמדוד variability ולא רק percentile בודד.

‏Indicators אפשריים:

```text
p99 - p50
p95 - p50
coefficient-like spread where meaningful
spike frequency
consecutive breach duration
```

‏מערכת מעט איטית יותר אך יציבה יכולה להיות כלכלית יותר ממערכת עם median מהיר ו־tails קיצוניים.

---

## ‏19. Tail Latency by Regime

‏נפלח לפי:

```text
OPEN
MIDDAY
CLOSE
FAST_MARKET
HIGH_ACTIVITY
PROVIDER_DEGRADED
BROKER_DEGRADED
RECOVERY
```

‏P99 global יכול להסתיר failure regime קטן אך חשוב.

---

## ‏20. Latency by Outcome

‏נבדוק קשרים:

```text
signal_age_at_fill → markout
market_to_decision → selection regret
decision_to_submit → price drift
submit_to_fill → markout / net outcome
exit_to_flat → MFE giveback
queue_age → stale decision rate
```

‏המטרה: להוכיח איזה latency באמת עולה כסף.

---

## ‏21. Artificial Delay Experiment Contract

‏לכל experiment:

```text
experiment_id
strategy_version
dataset_version
latency_model_version
delay_profile
regime_scope
primary_metric
guardrails
```

‏Primary metric מומלץ:

```text
Net Edge Retained
```

‏Guardrails:

```text
Fill Rate
Markout
Selection Regret
Missed Opportunity
Stale Fill Rate
Exit Giveback
```

---

## ‏22. Replay Latency Fidelity

‏Fidelity ladder:

```text
L0 — zero/instantaneous delay, diagnostic only
L1 — fixed delay
L2 — empirical distribution
L3 — stage-wise distributions
L4 — regime-conditioned distributions
L5 — recorded shadow latency traces
L6 — recorded traces + correlated backlog/provider/broker stress
```

‏`L0` אינו production-realistic evidence.

---

## ‏23. Data Fidelity Ceiling

‏Latency research אינו יכול להיות מדויק יותר מה־data.

```text
1s snapshots
!=
50ms microstructure evidence
```

‏לפני Feature/Horizon מהיר נדרשים:

```text
timestamp resolution
timestamp semantics
sequence/order evidence
receive timestamps
sufficient market-state resolution
```

---

## ‏24. Same-Timestamp Ambiguity

‏כאשר dataset נותן כמה events באותו timestamp בלי sequence:

```text
order = UNKNOWN
```

‏Replay אינו רשאי לבחור ordering נוח בדיעבד.

---

## ‏25. No Same-Tick Oracle Fill

‏Simulation אינו רשאי להניח:

```text
observe event
→ decide instantly
→ fill on same event
```

‏אלא אם data/model מוכיחים ordering ו־reaction feasibility.

‏Baseline כולל לפחות:

```text
observation delay
processing delay
submit delay
execution model delay
```

---

## ‏26. Runtime / `.NET` Baseline

‏מתחילים ב־KISS:

```text
Release build
async for I/O
bounded channels/queues
incremental computation
compact state
avoid blocking hot path
measure allocation rate
measure GC pauses
measure contention
```

‏לא baseline:

```text
unsafe everywhere
lock-free everything
manual pooling everywhere
CPU affinity
busy waiting
custom allocators
```

---

## ‏27. Allocation / GC Policy

‏נמדוד:

```text
allocation_rate
Gen0/Gen1/Gen2 frequency
pause_duration
LOH activity
P99 correlation with GC
```

‏Optimization כמו:

```text
Span<T>
ArrayPool<T>
object pooling
struct-oriented layout
```

‏תיכנס רק אם profiler מראה bottleneck אמיתי.

---

## ‏28. Threading / Concurrency Policy

‏`async` משמש I/O concurrency; הוא אינו מאיץ CPU work אוטומטית.

‏נמדוד:

```text
thread pool queueing
starvation
lock wait
contention rate
critical section duration
```

‏Single-writer / partitioned ownership עדיפים במקומות שבהם הם משפרים determinism ו־correctness בלי לפגוע throughput.

---

## ‏29. Lock-Free Policy

‏`Lock-free` הוא Advanced Option.

‏Promotion מחייב:

```text
measured contention
measurable latency gain
proof/invariants
stress tests
maintainability review
```

‏Race שיכול ליצור duplicate exposure חמור יותר מחיסכון של milliseconds בודדים.

---

## ‏30. Serialization Policy

‏לא פוסלים `JSON` אידיאולוגית.

‏אם הוא עומד ב־throughput/latency targets, KISS מנצח.

‏אם profiler מראה serialization bottleneck:

```text
reduce payload
avoid repeated parse/format
use compact DTO/state
then consider different representation
```

---

## ‏31. Logging / Persistence Policy

‏Hot path logging:

```text
small structured event
stable IDs
critical timestamps
reason codes
```

‏Enrichment יכול להיות off-path.

‏נפריד:

```text
Best-effort telemetry
Critical durable trade/order/fill journal
```

‏Critical truth אינו sampled away.

---

## ‏32. Storage Backpressure

‏Storage pipeline יקבל:

```text
bounded buffers
criticality classes
queue age
write latency
failure/degradation policy
```

‏Slow research/telemetry storage אינו רשאי לחסום Trading Decision path ללא policy מפורשת.

---

## ‏33. Network / Deployment Policy

‏נמדוד end-to-end:

```text
DNS/connect setup when relevant
TLS/session setup when relevant
RTT
packet loss/retransmit evidence
message arrival jitter
provider freshness
broker send/ack
reconnect
subscription restore
```

‏`ping` לבדו אינו deployment benchmark.

---

## ‏34. Connection Warm-up

‏לפני research/shadow session משמעותי ניתן pre-warm:

```text
connections
subscriptions
universe/config
critical caches
strategy code paths
broker/session readiness in non-risk mode
```

‏Cold start / restart דורשים warm-up/readiness gates.

---

## ‏35. Reconnect Latency

‏נמדוד:

```text
time_to_detect_disconnect
time_to_reconnect
time_to_restore_subscriptions
time_to_rebuild_state
time_to_reconcile
time_to_ready
```

‏`Connection Alive != Data Fresh != Ready`.

---

## ‏36. Heartbeat Contract

‏Heartbeat אמיתי כולל progress:

```text
last_market_event_age
last_scanner_progress_age
last_broker_message_age
last_reconciliation_age
```

‏Process alive ללא progress אינו Healthy.

---

## ‏37. Batching Policy

‏Batching הוא throughput/latency trade-off.

‏אם משתמשים בו:

```text
flush by count OR max_age
```

‏כך ניתן upper bound ל־waiting delay.

‏Batch size/time הם experiment/config, לא constants קדושים.

---

## ‏38. Caching Policy

‏Cache חייב:

```text
value
as_of
version
source
quality
TTL
```

‏Cache stale יכול להיות גרוע מ־computation איטי.

‏Static metadata, risk limits ו־symbol mappings הם candidates טובים ל־precompute; market state אינו static.

---

## ‏39. Broker Request Scheduling

‏Request priority:

```text
EXIT
CANCEL
RECONCILIATION
RISK_REDUCING
ENTRY
NONCRITICAL_METADATA
DIAGNOSTICS
```

‏Rate limits/throttling הם חלק מ־latency model.

‏Metadata call לא חשוב אינו רשאי לעכב Exit/Cancel.

---

## ‏40. Local Architecture

‏Baseline עבור רובוט אישי:

```text
few processes / modular monolith
clear interfaces
minimal network hops in critical path
```

‏`Interface boundary != Network boundary`.

‏Microservices ייכנסו רק אם isolation/scaling benefit מצדיק את serialization/network/ops tax.

---

## ‏41. Browser / Local WebSocket

‏Local `WebSocket` יכול להיות מספיק ל־POC/collector/shadow pipeline אם benchmarks מאשרים זאת.

‏נמדוד:

```text
message latency
message jitter
event-loop lag
backlog
reconnect behavior
```

‏לא מחליפים transport רק משום שקיים transport “מהיר יותר”.

---

## ‏42. Geography / Placement

‏Network path יכול להיות bottleneck גדול יותר מה־CPU.

‏Placement experiment בודק:

```text
Data Provider path
Broker path
Recovery path
Operational simplicity
Reliability
Cost
```

‏אין הנחה ש־local או cloud תמיד עדיפים.

---

## ‏43. Optimization Ladder

‏סדר מחייב:

```text
1. Measure end-to-end
2. Fix correctness
3. Fix freshness / stale-state bugs
4. Remove obvious blocking I/O
5. Bound queues / fix backpressure
6. Remove repeated unnecessary work
7. Improve algorithms/data structures
8. Reduce allocations/copies where proven
9. Improve deployment/network placement where proven
10. Runtime/OS tuning
11. Exotic low-latency techniques only if evidence requires
```

---

## ‏44. What I Would Avoid Initially

‏לא נתחיל עם:

```text
FPGA
kernel bypass
co-location
custom network stacks
nanosecond optimization
lock-free everything
busy waiting
real-time OS migration
manual memory management everywhere
per-core pinning everywhere
custom binary protocol without need
```

‏גם לא נבצע premature rewrite רק כדי להוריד microbenchmark שאינו bottleneck end-to-end.

---

## ‏45. What to Add Later

‏רק אם Evidence מצדיק:

```text
incremental ranking structure
specialized data layout
advanced pooling
CPU affinity
OS/network tuning
micro-batching optimization
process separation / specialized IPC
regime-conditioned latency model
latency-adjusted execution/candidate logic
recorded-trace replay
```

---

## ‏46. Latency-Adjusted Candidate Logic

‏זה Challenger בלבד.

‏Hypotheses אפשריות:

```text
adjusted_edge = predicted_edge * decay(signal_age)
max_latency depends on signal_half_life
rank gap predicts candidate stability
confirmation window improves net EV
```

‏אין promotion בלי experiment נפרד.

---

## ‏47. Confirmation / Hysteresis

‏תגובה מהירה לכל Rank noise אינה בהכרח טובה.

‏נבדוק:

```text
0ms confirmation
short confirmation windows
rank-gap hysteresis
candidate-switch hysteresis
```

‏Primary question:

```text
Does the reduction in false/churn decisions exceed the waiting cost?
```

---

## ‏48. Candidate Churn Metrics

‏נשמור:

```text
top1_changes_per_second
top1_persistence
topn_persistence
rank_gap
rank_velocity
candidate_age_at_submit
```

‏כך latency requirement נגזרת מה־actual opportunity dynamics.

---

## ‏49. Exit Latency Research

‏נמדוד:

```text
time_to_target
exit_trigger_time
exit_decision_time
flat_time
MFE at trigger
realized outcome
giveback_from_MFE
```

‏ונבדוק:

```text
exit_to_flat latency
→ giveback distribution
```

‏ל־small-profit research, Exit latency יכולה להיות חשובה יותר משיפור נוסף ב־Entry latency.

---

## ‏50. Entry Latency Research

‏נמדוד:

```text
signal_age_at_decision
signal_age_at_submit
signal_age_at_fill
rank_at_signal
rank_at_submit
rank_at_fill
book/flow drift
markout
```

‏כך מפרידים Prediction failure מ־late chase.

---

## ‏51. Latency × Adverse Selection

‏מקטע 46 נשאר Source of Truth ל־Markout.

‏Segment 48 מוסיף conditioning:

```text
Markout | SignalAge
Markout | DecisionToFill
Markout | QueueAge
Markout | LatencyRegime
```

‏אם fills מאוחרים toxic יותר באופן עקבי, latency הוא economic driver ולא רק ops metric.

---

## ‏52. Latency × Queue

‏מקטע 38 נשאר Source of Truth ל־Queue uncertainty.

‏Latency משפיעה על:

```text
arrival queue position
cancel/fill race window
reprice turnaround
queue reset cost
```

‏מהירות גבוהה יותר אינה מבטיחה Queue Value טוב יותר.

---

## ‏53. Latency × Capacity

‏מקטע 47 נשאר Source of Truth ל־Capacity.

‏Latency יכולה להפוך:

```text
decision-time depth
```

‏ל־:

```text
stale capacity estimate
```

‏נמדוד:

```text
capacity_age_at_submit
book drift
decision_depth vs arrival_depth
latency_to_liquidity_half_life
```

---

## ‏54. Latency × Routing

‏Route מהיר יותר אינו automatically better.

‏נשווה:

```text
latency
fill quality
markout
fees
missed opportunity
unknown-state rate
net execution quality
```

---

## ‏55. Latency × Recovery

‏אחרי outage/reconnect:

```text
correctness
→ reconciliation
→ freshness
→ warm-up
→ readiness
→ speed
```

‏אין “fast resume” שמדלג על Safe Resume Contract.

---

## ‏56. Required Data / Evidence

‏לפחות:

```text
boundary timestamps
monotonic durations
provider timestamp semantics where available
receive timestamps
signal age
decision/intent IDs
queue age
fresh coverage
scanner timing
broker send/ack/fill/cancel timing
exit-to-flat timing
CPU/GC/contention telemetry
deployment/runtime/config version
```

‏למחקר latency-sensitive נדרש גם market-data fidelity שתואם ל־horizon.

---

## ‏57. Dataset Contract

‏טבלת Decision/Execution בסיסית:

```text
session_id
decision_id
symbol
strategy_version
latency_model_version
deployment_version
signal_time
signal_age_at_decision
signal_age_at_submit
signal_age_at_fill
market_to_decision_ms
decision_to_submit_ms
submit_to_ack_ms
submit_to_first_fill_ms
exit_to_flat_ms?
scanner_cycle_ms
queue_age_ms
fresh_coverage_ratio
execution_mode
markout_1s
markout_5s
net_outcome
quality_flags
```

---

## ‏58. Promotion Criteria

‏Latency optimization/policy מקודמים רק אם:

1. ‏ה־bottleneck נמדד end-to-end.
2. ‏השיפור מופיע ב־P95/P99 או במדד economically relevant, לא רק microbenchmark.
3. ‏Freshness/queue-age אינם מוחמרים.
4. ‏Decision semantics נשארים נכונים או השינוי המכוון עבר validation.
5. ‏אין ירידה ב־Risk/Safety correctness.
6. ‏Replay/Shadow מראים incremental Net Edge או headroom משמעותי.
7. ‏Burst/soak/fault tests עוברים.
8. ‏Complexity tax מוצדק.
9. ‏Rollback ברור.

---

## ‏59. Rejection Criteria

‏Optimization נדחית אם:

```text
only microbenchmark improves
end-to-end unchanged
P99 worsens
jitter worsens materially
freshness worsens
queue age worsens
semantics drift unintentionally
correctness becomes harder to prove
recovery becomes weaker
operational complexity exceeds value
```

‏גם Optimization שמורידה latency אך מגדילה adverse selection או impact יכולה להידחות.

---

## ‏60. Metrics

### ‏Freshness

```text
quote_age
trade_age
feature_age
rank_age
signal_age
fresh_coverage_ratio
```

### ‏Scanner

```text
scanner_cycle_p50/p95/p99
top1_persistence
rank_age
candidate_ready_latency
```

### ‏Pipeline

```text
market_to_decision_p50/p95/p99
decision_to_submit_p50/p95/p99
intent_queue_age_p50/p95/p99
```

### ‏Broker

```text
submit_to_ack_p50/p95/p99
submit_to_first_fill_p50/p95/p99
cancel_to_confirm_p50/p95/p99
```

### ‏Exit

```text
exit_to_flat_p50/p95/p99
giveback_by_exit_latency
```

### ‏Runtime

```text
CPU
allocation_rate
GC_pause_p95/p99
thread_pool_queue
lock_wait
storage_queue_age
```

### ‏Economics

```text
NetEdgeRetained by latency bucket
Markout by signal-age bucket
SelectionRegret by latency bucket
NO_TRADE_LATENCY rate
```

---

## ‏61. Failure Modes

```text
LATENCY_STALE_SIGNAL_SUBMIT
LATENCY_STALE_FILL
LATENCY_SCANNER_BACKLOG
LATENCY_LOW_FRESH_COVERAGE
LATENCY_QUEUE_AGE_BREACH
LATENCY_PROVIDER_STALL
LATENCY_BROKER_SPIKE
LATENCY_CANCEL_TOO_LATE
LATENCY_EXIT_GIVEBACK
LATENCY_GC_PAUSE
LATENCY_THREAD_POOL_STARVATION
LATENCY_LOCK_CONTENTION
LATENCY_SYNC_IO_BLOCK
LATENCY_STORAGE_BACKPRESSURE
LATENCY_BROWSER_EVENT_LOOP_STALL
LATENCY_RECONNECT_SLOW
LATENCY_COLD_START
LATENCY_CLOCK_SEMANTICS_INVALID
LATENCY_FALSE_PRECISION
LATENCY_UNEXPLAINED
```

---

## ‏62. RCA Contract

‏לכל incident משמעותי:

```text
incident_id
first_divergence_time
first_slow_stage
market_regime
provider_state
broker_state
fresh_coverage
queue_age_by_stage
stage_latency_histograms
CPU/GC/contention
orders/fills affected
candidate/rank state
versions/config
```

‏השאלה הראשונה:

```text
What slowed first?
```

‏לא:

```text
Why was everything slow?
```

---

## ‏63. Incident Packet

‏נשמור סביב incident:

```text
pre-roll latency trace
post-roll latency trace
queue age history
freshness history
state transitions
candidate changes
broker events
GC/runtime events
recovery transitions
```

‏Truth Events אינם sampled away.

---

## ‏64. Tests / Invariants

### ‏Timing invariants

```text
local monotonic duration >= 0
stale intent cannot be submitted
expired signal cannot create new risk
unknown clock semantics cannot produce trusted cross-domain latency
```

### ‏Queue invariants

```text
bounded critical queues
queue overflow policy explicit
critical broker/risk events are never silently dropped
```

### ‏Ranking invariants

```text
rank has explicit as_of/freshness context
low fresh coverage cannot silently produce trusted Rank #1
```

### ‏Safety invariants

```text
latency optimization cannot bypass risk
latency breach may block new risk
exit/risk-reducing actions remain prioritized
```

### ‏Replay invariants

```text
same events + same latency model + same versions
=> same decisions and timing semantics
```

---

## ‏65. Golden Scenarios

1. ‏Normal load, stable P99.
2. ‏Market burst doubles event rate.
3. ‏Feature engine slowed deliberately.
4. ‏Ranking cycle exceeds Signal TTL.
5. ‏Broker ACK latency spikes.
6. ‏Cancel/Fill race under slow cancel path.
7. ‏Storage stalls while market data continues.
8. ‏GC/CPU stall creates stale intent.
9. ‏Fresh coverage collapses while process remains alive.
10. ‏Reconnect restores socket but not freshness.
11. ‏Cold restart during session.
12. ‏Exit arrives while Entry queue is backed up.
13. ‏Browser collector event loop stalls.
14. ‏Same-timestamp events without sequence.
15. ‏Fast feed overwhelms slower consumer.

---

## ‏66. Fault Injection

‏ב־Replay/Shadow/Paper בלבד נבדוק deliberate:

```text
processing delays
queue backlog
broker delays
storage delays
CPU stalls
GC-like pauses
provider gaps
reconnect delays
clock offsets in telemetry
```

‏Expected outcome הוא safe degradation, לא “להספיק בכל מחיר”.

---

## ‏67. Burst Test

‏נזרים event rate גבוה מה־baseline ונמדוד:

```text
queue growth
oldest age
P99
fresh coverage
CPU
GC
memory
NO_TRADE_LATENCY rate
recovery time
```

---

## ‏68. Soak Test

‏נבדוק לאורך session ארוך:

```text
memory growth
allocation drift
latency drift
log/storage buildup
connection stability
resource leakage
```

‏מערכת מהירה לעשר דקות אינה בהכרח יציבה לאורך session.

---

## ‏69. Performance Regression Policy

‏נשמור baselines versioned ל־:

```text
scanner cycle
feature compute
ranking
risk decision
intent creation
serialization
```

‏CI shared runner אינו source of truth ל־tight timing.

‏CI בודק בעיקר:

```text
functional performance regressions
allocation explosion
time complexity regressions
stale-signal behavior under injected delay
```

‏Tight latency benchmarking דורש controlled environment.

---

## ‏70. Correctness Diff after Optimization

‏כל optimization שמשנה concurrency/event ordering עוברת:

```text
same replay
old implementation
new implementation
→ decision diff
→ state diff
→ timing diff
```

‏Faster but semantically different אינו “performance improvement” עד שהשינוי אושר במפורש.

---

## ‏71. Observability Contract

‏Dashboard ראשון יציג:

```text
fresh coverage
market_to_decision p50/p95/p99
decision_to_submit p50/p95/p99
signal_age_at_submit
signal_age_at_fill
submit_to_ack
cancel_to_confirm
exit_to_flat
queue age
scanner cycle
CPU
GC pauses
broker readiness
latency state
```

‏Dashboard הוא View, לא enforcement.

---

## ‏72. Alerting

‏Alerts actionable בלבד:

```text
signal_age high
scanner cycle beyond supported horizon
queue age breach
fresh coverage collapse
broker latency spike
exit_to_flat spike
GC/runtime pause anomaly
backlog growth
recovery not converging
```

‏Alerting אינו Safety Engine; containment חייב לעבוד גם אם alert exporter נפל.

---

## ‏73. Optimization ROI

‏לכל change משמעותי נרשום:

```text
bottleneck
baseline p95/p99
expected gain
realized gain
economic impact
complexity added
new failure modes
rollback
```

‏המדד:

```text
Economic Benefit / Engineering + Operational Complexity
```

---

## ‏74. Use When

‏ה־Sheet רלוונטי כאשר:

- ‏Signal decay קצר מספיק כך שזמן משנה Economics.
- ‏Scanner רחב יוצר fairness/backlog challenges.
- ‏Broker/provider path תורם delay משמעותי.
- ‏Entry/Exit outcomes תלויים ב־signal age.
- ‏P99 spikes או queue age קיימים.
- ‏נדרש להחליט האם Optimization מסוימת באמת שווה את המורכבות.

---

## ‏75. Do Not Use When

‏אל תשתמש ב־latency optimization כתירוץ ל־:

- ‏עקיפת Risk/Safety.
- ‏same-tick fill assumptions.
- ‏future leakage.
- ‏discarding critical truth events.
- ‏שינוי architecture ללא profiling.
- ‏רדיפה אחרי microseconds כאשר data/Signal horizon הם seconds.
- ‏הצגת timestamp precision כ־accuracy.

---

## ‏76. Alternatives

### ‏A — Keep Current Simple Architecture

‏מתאים כאשר P95/P99 כבר רחוקים מה־Latency Cliff.

### ‏B — Remove Big Bottleneck Only

‏לרוב זהו challenger הראשון.

### ‏C — Algorithm/Data-Structure Optimization

‏רק לאחר profiling.

### ‏D — Deployment/Network Placement Change

‏כאשר network path הוא bottleneck.

### ‏E — Runtime/OS Low-Latency Tuning

‏`P3/P4` בלבד.

### ‏F — HFT-style Infrastructure

‏מחוץ ל־Baseline; specialist/evidence-only.

---

## ‏77. Trade-offs

### ‏Speed vs Correctness

‏Correctness wins.

### ‏Throughput vs Latency

‏Batching יכול לשפר throughput ולהחמיר waiting latency.

### ‏Freshness vs Completeness

‏לא זורקים path events שדרושים ל־Flow רק כדי להיות “current”.

### ‏Performance vs Observability

‏Instrumentation נדרש, אך overhead שלו נמדד.

### ‏Single Process vs Isolation

‏פחות hops מול fault isolation.

### ‏Passive Wait vs Fast Aggression

‏Latency cost מול Spread/Impact/Adverse Selection.

---

## ‏78. User-Specific Application

‏למערכת שלנו יש:

```text
whole-market universe
seconds / sub-seconds research horizons
Top-N handoff
separate market-data and broker domains
fast entry/exit objective
single-position research baseline
```

‏לכן ארבעה priorities בולטים במיוחד:

1. ‏Whole-market freshness/fairness לפני rank.
2. ‏Signal age + stale-intent rejection לפני submit.
3. ‏Exit-to-flat latency נמדדת בנפרד ובקדימות גבוהה.
4. ‏Top-N deep enrichment במקום לחשב כל microstructure feature על כל ה־Universe.

‏אין צורך להתחרות ב־microseconds. צריך להוכיח שה־P95/P99 שלנו נשארים בתוך חלון ה־Edge שאנו באמת חוקרים.

---

## ‏79. Concrete Baseline Contract

```text
LatencyContext
- context_id
- strategy_version
- latency_model_version
- deployment_version
- signal_time
- signal_half_life_estimate?
- signal_valid_until
- app_receive_time
- feature_ready_time
- rank_ready_time
- decision_time
- intent_created_time
- intent_dequeued_time
- broker_send_time?
- broker_ack_time?
- first_fill_time?
- flat_time?
- queue_age_ms
- fresh_coverage_ratio
- latency_state
- clock_quality
- confidence
```

---

## ‏80. `LatencyAssessment` Contract

```text
LatencyAssessment
- signal_age_ms
- signal_ttl_remaining_ms
- market_to_decision_ms?
- decision_to_submit_estimate_ms?
- queue_age_ms
- fresh_coverage_ratio
- latency_pressure?
- latency_headroom?
- state: NORMAL | DEGRADED | ENTRY_BLOCKED | UNKNOWN
- confidence
- reason_codes[]
```

---

## ‏81. `LatencyIncident` Contract

```text
LatencyIncident
- incident_id
- detected_at
- first_divergence_at?
- first_slow_stage?
- severity
- market_regime
- provider_state
- broker_state
- p95_snapshot
- p99_snapshot
- queue_age_snapshot
- fresh_coverage_snapshot
- affected_decision_ids[]
- affected_order_ids[]
- recovery_id?
- deployment_version
- config_version
```

---

## ‏82. Fact / Judgment / Hypothesis

### ‏Facts / Strong Engineering Principles

- ‏Latency היא end-to-end property, לא function timing יחיד.
- ‏P95/P99 יכולים לחשוף failures שממוצע מסתיר.
- ‏Data freshness ו־compute speed הם שני dimensions שונים.
- ‏Bounded queues/backpressure נדרשים למניעת stale backlog.
- ‏Same-tick execution ללא ordering/reaction evidence אינו baseline ריאלי.
- ‏Clock domains שונים דורשים semantics מפורשים.
- ‏Performance optimization יכולה לשנות event ordering ולכן דורשת correctness validation.

### ‏Judgments / Recommended Baseline

- ‏KISS architecture עם מעט hops.
- ‏Streaming + controlled ranking.
- ‏Top-N deep path.
- ‏Economic SLOs.
- ‏Stale-intent rejection.
- ‏P95/P99 + queue age + fresh coverage כ־core health.
- ‏Low-level tuning רק אחרי profiling.

### ‏Hypotheses to Test

- ‏Rank gap predicts signal persistence.
- ‏Short confirmation/hysteresis improves Net EV.
- ‏Cloud placement near provider/broker materially improves edge.
- ‏Specific GC/runtime tuning improves P99 enough to matter economically.
- ‏Latency-adjusted candidate logic improves decisions.
- ‏Faster Entry improves outcome after accounting for adverse selection/impact.

---

## ‏83. Confidence

### ‏High Confidence

```text
measure end-to-end
freshness before speed
P95/P99 + queue age
stale signal rejection
bounded queues
exit priority
correctness before optimization
artificial-delay sensitivity testing
```

### ‏Medium Confidence

```text
specific hot-path architecture
single-writer partitioning choices
micro-batching
browser vs local-service boundary
incremental ranking implementation
```

### ‏Low / Evidence-Only

```text
CPU affinity
PTP requirement
lock-free redesign
busy waiting
specialized IPC
OS-level tuning
co-location/HFT-like infrastructure
```

---

## ‏84. Time-Sensitive Facts

‏מקטע 48 אינו קובע כרגע vendor-specific rate limits, endpoint regions, broker SLA או runtime-version guarantees.

‏לכן לא נדרש Web verification חדש ל־Baseline הזה.

‏לפני Implementation שתלוי בספק/ברוקר/Cloud/Runtime ספציפיים יש לאמת מחדש:

```text
endpoint geography
rate/throttle behavior
connection/reconnect semantics
runtime performance characteristics
provider timestamp semantics
broker callback semantics
```

---

## ‏85. Relationship to Earlier Sheets

### ‏06 — Time / Sampling / Latency

‏מגדיר את Timing/Freshness foundation; 48 מעמיק performance economics, tails, deployment ו־optimization ladder.

### ‏21 — Realistic Seconds Execution Backtest

‏48 מספק latency distributions/assumptions ל־execution replay.

### ‏27 — Deterministic Replay

‏48 מוסיף versioned latency model/trace injection בלי לפגוע determinism.

### ‏34 — Recovery

‏Latency recovery אינו Resume עד queues/freshness/reconciliation מתוקנים.

### ‏35 — Observability

‏Latency waterfall וה־incident packet נשענים על Evidence Chain.

### ‏36 — Safety

‏Latency breach יכול לחסום Risk חדש אך לא לבטל Risk-reducing capability.

### ‏37/38/39 — Execution / Queue / Routing

‏Latency משפיעה על queue arrival, cancel/replace, route timing ו־fill quality, אך אינה מחליפה את models שלהם.

### ‏44/45 — Flow / Book

‏Feature half-life ו־book/flow drift קובעים כמה latency אפשר לסבול.

### ‏46 — Adverse Selection

‏Markout conditioned on signal age/latency בודק אם lateness הופכת fills ל־toxic.

### ‏47 — Capacity

‏Latency משפיעה על validity של liquidity/depth/capacity estimates.

---

## ‏86. Relationship to Later Sheets

‏מקטע 49 יקבע משמעת מחקר שמונעת parameter hunting גם ב־Latency tuning.

‏מקטעי performance/production מאוחרים יותר צריכים להשתמש ב־48 כ־Baseline כדי לא להפוך optimization לפרויקט vanity.

---

## ‏87. Promotion Ladder

```text
Instrument Timing
→ Measure Shadow Distributions
→ Artificial Delay Replay
→ Identify Economic Bottleneck
→ Simple Optimization
→ Correctness Diff
→ Load/Burst/Soak Tests
→ Shadow Champion/Challenger
→ Promote only if Net Edge / Headroom improves
```

‏המסלול נעצר בכל שלב אם Complexity אינה מוצדקת.

---

## ‏88. Recommendation Summary

‏לרובוט שלנו לא נבנה `HFT`.

‏נבנה מערכת שבה:

```text
Signal Half-Life is measured
→ End-to-End latency is decomposed
→ Freshness and queue age are explicit
→ P95/P99 tails are first-class
→ Stale signals cannot create new risk
→ Whole-market ranking has time fairness
→ Hot path stays small
→ Exit is prioritized
→ Latency is replayed realistically
→ Optimizations are profiled and economically justified
→ Correctness / Safety never trade places with speed
```

‏ה־Baseline המעשי:

```text
Streaming Market Data
→ Canonical Current State
→ Fast Incremental Features
→ Fresh Whole-Market Rank
→ Top-N Deep Checks
→ Decision + Risk + Safety
→ TTL/Freshness Recheck
→ Order Intent
→ Broker
→ Fill / Position
→ Fast Risk-Reducing Exit Path
```

‏בכל boundary:

```text
Timestamp
Queue Age
Freshness
Version
Reason Code
```

‏והמבחן הסופי אינו:

```text
Are we low latency?
```

‏אלא:

```text
For the signals we actually research,
do our P95/P99 end-to-end delays remain inside a measured window
where executable net edge still survives under realistic stress?
```
