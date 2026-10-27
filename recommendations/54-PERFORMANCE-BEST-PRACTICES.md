# ‏54 — Recommendation Sheet: Performance Best Practices

> ‏מקור לימודי עיקרי: `../54-PERFORMANCE-BEST-PRACTICES.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline הנדסי, מחקרי ותפעולי ל־Performance של רובוט `Short-Horizon Momentum`, כך שהמערכת תהיה מהירה מספיק לשימור Edge של מילישניות–שניות, אך תישאר דטרמיניסטית, ניתנת לבדיקה, ניתנת ל־RCA ושמרנית תחת עומס; בלי `optimization theatre`, בלי להקריב correctness, ובלי לרדוף אחרי microseconds שאינם משנים את התוצאה הכלכלית.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו מגדיר יעדי latency לחשבון חי ואינו מבטיח רווח.

---

## ‏1. Decision

‏Performance אצלנו אינו יעד עצמאי של “להיות הכי מהירים”.

‏הוא **Edge Preservation Constraint תחת עומס אמיתי**.

‏ה־Baseline:

```text
Fresh Market Evidence
→ Canonical State
→ Incremental Fast Features
→ Whole-Market Fast Rank
→ Top-N Deep Enrichment
→ Decision
→ Risk / Safety
→ Pre-Submit Revalidation
→ Submit
→ ACK / Fill
→ Exit
→ Flat
```

‏כל Optimization חייב לענות לפחות על אחת השאלות:

```text
Did freshness improve?
Did P95/P99 improve?
Did queue age fall?
Did decision age fall?
Did execution quality improve?
Did time-to-flat improve?
Did Net Edge Retained improve?
Did operational reliability improve?
```

‏אם לא — הוא כנראה אינו Priority.

‏העיקרון המחייב:

```text
Optimize only after measurement.

Fastest Possible != Objective
Fast Enough + Stable + Deterministic + Safe = Objective
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: End-to-End Performance Contract

‏נמדוד את כל המסלול, לא רק function יחיד:

```text
feed_receive_to_ready_ms
ready_to_rank_ms
rank_to_decision_ms
decision_to_risk_ms
decision_to_submit_ms
submit_to_ack_ms
submit_to_first_fill_ms
first_to_last_fill_ms
fill_to_exit_decision_ms
exit_decision_to_flat_ms
```

‏בנוסף:

```text
queue_depth
queue_age_ms
oldest_item_age_ms
fresh_coverage_ratio
allocation_rate
GC_pause_ms
processing_rate
arrival_rate
```

‏ה־Primary performance question:

```text
Is the system current enough for the signal horizon?
```

‏לא:

```text
How many operations per second did one benchmark method achieve?
```

### ‏`P0 — Required`: Tail Latency לפני Average

‏לכל stage קריטי נשמור לפחות:

```text
P50
P90
P95
P99
```

‏`P99.9` רק כאשר sample size ו־measurement fidelity מצדיקים זאת.

‏Average אינו KPI מספיק.

‏מערכת:

```text
5ms average
+ 300ms burst spikes
```

‏עלולה להיות גרועה יותר למערכת שלנו ממערכת:

```text
8ms average
+ tightly bounded tails
```

### ‏`P0 — Required`: Latency Pressure / Break-Even Performance

‏המדד הרעיוני:

```text
LatencyPressure
=
EndToEndLatency / SignalHalfLife
```

‏לא נקבע יעדי `ms` קשיחים לפני Measurement של Signal Half-Life ושל Break-Even Latency.

‏מחקר latency יכלול Artificial Delay / Recorded Delay curves כדי למצוא:

```text
edge_vs_delay
net_edge_vs_delay
selection_quality_vs_delay
fill_quality_vs_delay
exit_giveback_vs_delay
```

‏המטרה:

```text
Find the latency cliff.
Operate with headroom before it.
```

### ‏`P0 — Required`: Queue Age / Freshness הם Performance Truth

‏Queue Depth בלבד אינה מספיקה.

‏נמדוד:

```text
queue_depth
oldest_item_age
age_percentiles
arrival_rate
processing_rate
```

‏אם Work ישן מה־economic TTL שלו:

```text
expire / cancel / coalesce / drop according to semantics
```

‏ולא לעבד אותו רק מפני שהוא בתור.

‏אם freshness אינה ניתנת להבטחה:

```text
BLOCK_NEW_ENTRIES
```

‏הוא outcome תקין.

### ‏`P0 — Required`: Business-Priority Scheduling

‏בזמן עומס סדר העדיפות:

```text
Safety / Kill / Flatten
> Position / Exit / Working Orders
> Broker Fills / Cancels / Reconciliation
> Risk
> Entry Execution
> Top Candidates
> Full-Universe Scanner
> Diagnostics / Research / UI
```

‏`FIFO` טכני אינו override של priority כלכלי.

‏Event ישן ולא רלוונטי ל־Symbol ללא Position אינו רשאי לעכב Exit טרי.

### ‏`P0 — Required`: Bounded Queues + Explicit Overflow Policy

‏Queue לא תהיה unbounded.

‏לכל stream נגדיר:

```text
capacity
overflow_behavior
coalescing_semantics
stale_work_policy
priority_class
loss_tolerance
```

‏אסור `drop random`.

‏אסור לזרוק silently:

```text
broker fills
order/cancel facts
position facts
risk facts
safety facts
trading-status facts
reconciliation facts
```

### ‏`P0 — Required`: Incremental Computation לפני Micro-Optimization

‏ברירת המחדל:

```text
rolling sum/count
ring buffers
fixed bounded windows
dirty-symbol updates
event-type selective updates
incremental feature state
```

‏לא:

```text
rescan all history
recompute all features
full-sort all symbols
```

‏אחרי כל Tick.

### ‏`P0 — Required`: Fast Path / Deep Path

‏לכל ה־Universe:

```text
canonical state update
cheap features
eligibility
coarse/final cheap score
Top-N retrieval
```

‏ל־Top-N בלבד:

```text
expensive flow analysis
L2 / deeper book
capacity model
advanced execution context
special diagnostics
```

‏ה־Deep Path לא יוכל להפוך bottleneck שמקפיא את ה־Fast Path.

### ‏`P0 — Required`: Correctness / Determinism Dominate Performance

‏Optimization שנוגע ב־:

```text
parallelism
ordering
batching
coalescing
precision
caching
incremental state
```

‏חייב לעבור:

```text
unit/property tests
invariant tests
deterministic replay
behavioral diff
```

‏אם אותה Evidence אמורה לתת אותה Decision, optimization לא רשאי לשנות Winner בגלל scheduling accident.

### ‏`P0 — Required`: Performance Change = Behavioral Change Candidate

‏אחרי optimization משמעותי נשווה:

```text
state hashes
feature values
Top-N
Top-1
TRADE / NO_TRADE
reason codes
entry/exit timing
simulated fills
```

‏שינוי Decision יכול להיות לגיטימי אם המערכת החדשה רואה Evidence טרייה יותר.

‏אבל הוא חייב להיות:

```text
observed
classified
explained
approved
```

‏לא Side Effect מקרי.

### ‏`P1 — Preferred Default`: KISS Process Topology

‏לרובוט אישי נעדיף בתחילה:

```text
modular monolith / low-hop pipeline
+ in-process hot state
+ bounded partitions
+ explicit ownership
```

‏על:

```text
many microservices
many RPC hops
remote feature lookups
complex distributed scheduling
```

‏Service boundary נוסף חייב להצדיק את:

```text
serialization
queueing
network latency
failure modes
operational cost
```

### ‏`P1 — Preferred Default`: Single Writer per Partition

‏כאשר מתאים:

```text
SymbolId hash
→ bounded partition
→ one logical writer for symbol state
```

‏זה מפשט:

```text
ordering
locking
determinism
state ownership
RCA
```

‏Account-wide Risk נשאר authority נפרד ואינו נפתר רק דרך partitioning.

### ‏`P1 — Preferred Default`: Canonical Dense Symbol ID

‏אם Universe מאפשר:

```text
symbol string
→ stable internal integer SymbolId
```

‏נשתמש ב־ID הזה ב־hot path.

‏Arrays/SoA/compact structures הם אופציה טובה כאשר profile מראה שה־Dictionary/string overhead מהותי.

### ‏`P1 — Preferred Default`: Hot vs Cold Path Separation

‏Hot Path:

```text
market ingest
canonical state
features needed now
ranking
decision
risk
execution
position
```

‏Cold Path:

```text
reports
historical aggregation
deep RCA
heavy diagnostics
research exports
UI enrichment
```

‏Cold work אינו רץ על אותם critical workers אם הוא יכול לגרום Tail spikes.

### ‏`P1 — Preferred Default`: Observability בלי Self-Inflicted Latency

‏ב־Hot Path:

```text
cheap counters
histograms
stable IDs
compact structured events
```

‏לא:

```text
large string formatting per tick
full payload logging per event
full tracing for every market message
```

‏אבל Order/Fill/Safety truth נשאר reconstructable.

### ‏`P1 — Preferred Default`: Throughput Headroom

‏נבנה `Capacity Envelope`:

```text
symbols
× events/sec
× feature cost
× ranking frequency
× enrichment cost
```

‏ונמדוד את עקומת:

```text
load
→ queue age
→ freshness
→ tail latency
```

‏נזהה `Knee Point` ונפעל מתחתיו עם Margin.

‏מדד רעיוני:

```text
ThroughputHeadroom
=
SustainableRate / CurrentPeakRate
```

### ‏`P1 — Preferred Default`: Recovery Performance הוא חלק מה־SLO

‏נמדוד:

```text
restart_to_connected
restart_to_reconciled
restart_to_warmed
restart_to_ready
catch_up_rate
live_event_rate
```

‏אם יש backlog:

```text
catch_up_rate / live_event_rate > 1
```

‏נדרש כדי לסגור פער.

‏אך אין חזרה ל־new risk רק מפני שסיימנו processing; freshness/reconciliation/readiness עדיין שולטים.

### ‏`P1 — Preferred Default`: Separate Cold Start vs Steady State

‏Benchmark ישמור לפחות:

```text
cold_start
warmup
steady_state
burst
recovery
```

‏Benchmark קצר שמודד רק מצב Warm אינו מספיק.

---

## ‏3. Why

‏האסטרטגיה שלנו פועלת ב־horizon קצר.

‏לכן latency גדול יחסית ל־Signal Half-Life יכול לשנות:

```text
who is Top-1
whether the candidate still exists
what spread/depth exist
whether the entry remains economic
whether the exit can preserve profit
```

‏אבל Latency אינו מגיע רק מהקוד המקומי.

‏הוא נבנה מ־:

```text
provider delay
network delay
ingest
parse
state update
feature compute
ranking
queueing
decision
risk
broker path
venue/execution
```

‏לכן optimization מקומי חייב להימדד מול End-to-End outcome.

---

## ‏4. Use When

‏ה־Baseline נדרש כאשר:

- ‏אנחנו מעבדים אלפי Symbols.
- ‏ה־Signal Half-Life הוא מילישניות–שניות.
- ‏Market bursts יכולים להיות חזקים מהממוצע.
- ‏Ranking תלוי ב־cross-sectional freshness.
- ‏Entry/Exit sensitive ל־Signal Age.
- ‏אנחנו מוסיפים Feature יקר.
- ‏אנחנו משנים concurrency / queues / storage / logging.
- ‏אנחנו רואים GC, queue lag, CPU saturation או freshness drift.
- ‏אנחנו מתקרבים ל־Throughput knee.
- ‏Recovery/reconnect duration מתחיל להשפיע על Exposure או Availability.

---

## ‏5. Do Not Use When

‏אין הצדקה ל־low-level optimization כאשר:

- ‏ה־bottleneck הוא Provider/Broker RTT גדול בהרבה.
- ‏המערכת עדיין חסרת correctness בסיסי.
- ‏אין Measurement אמין.
- ‏אין Replay/Tests שמגינים על semantics.
- ‏ה־Feature עצמו עדיין לא הוכיח predictive value.
- ‏האופטימיזציה לא משנה Freshness/Decision/Execution/Cost.
- ‏הבעיה היא בכלל Strategy Half-Life שאינה מתאימה לתשתית שלנו.

---

## ‏6. Alternatives

### ‏Baseline

```text
Simple modular process
+ incremental features
+ cheap full-universe path
+ fixed Top-N deep path
+ bounded queues
+ measurement
```

### ‏Preferred Default

```text
partitioned single-writer state
+ dense SymbolId
+ hot/cold separation
+ measured allocation reduction
+ deterministic merge
```

### ‏Challenger

```text
partial selection / heap
adaptive batching
warm candidate cache
more specialized memory layouts
```

### ‏Advanced Option

```text
SIMD
specialized parsers
ArrayPool / object pooling
custom schedulers
CPU-affinity experiments
```

### ‏Specialist Option

```text
NativeAOT / native code
NUMA tuning
busy-waiting
kernel/network specialization
GPU batch compute
```

### ‏Avoid Unless Evidence

```text
lock-free everything
thread-per-symbol
microservices by default
GPU scanner for tiny work
unsafe code for vanity gains
sub-microsecond targets
FPGA / kernel bypass / custom NIC stack
```

---

## ‏7. Trade-offs

### ‏Batching

```text
larger batch
→ higher throughput
→ potentially worse latency
```

### ‏Parallelism

```text
more parallelism
→ potentially higher throughput
→ more scheduling / ordering / determinism complexity
```

### ‏Pooling

```text
fewer allocations
→ lower GC pressure
→ more lifecycle / stale-state risk
```

### ‏Compression

```text
less I/O/storage
→ more CPU
```

### ‏Snapshots

```text
faster recovery
→ more write/I/O cost
```

### ‏Process isolation

```text
better fault containment
→ more serialization/network/ops overhead
```

### ‏Precision

```text
faster numeric representation
→ potential semantic / accounting risk
```

‏כל trade-off חייב להימדד על workload רלוונטי.

---

## ‏8. What I Would Avoid Initially

‏לא נתחיל עם:

- ‏`FPGA`.
- ‏kernel bypass.
- ‏custom network stack.
- ‏CPU pinning בכל מקום.
- ‏NUMA tuning.
- ‏busy waiting.
- ‏lock-free architecture רחבה.
- ‏GPU scanner.
- ‏hundreds of microservices.
- ‏remote Feature Store ב־hot path.
- ‏per-event full tracing.
- ‏heavy string logging לכל Market Event.
- ‏adaptive scheduler מורכב.
- ‏dynamic batching מורכב.
- ‏manual memory management בלי profile.

---

## ‏9. What to Add Later

‏רק לאחר Measurement:

1. ‏`ArrayPool<T>` / pooling ל־buffers חמים.
2. ‏`Span<T>` / streaming parser.
3. ‏SoA / dense arrays במקום object graph כבד.
4. ‏Partial Top-K selection.
5. ‏Candidate warm-cache / promotion hysteresis.
6. ‏SIMD לחישובים רחבים.
7. ‏Custom partition scheduler.
8. ‏Affinity/host tuning.
9. ‏Native code ל־bottleneck מוכח.
10. ‏More specialized deployment placement כאשר Network dominates.

---

## ‏10. Required Data / Evidence

‏לפני Performance change משמעותי נשמור:

```text
workload_id
market_regime
symbol_count
event_rate_distribution
burst_profile
feature_set_version
ranking_rate
queue_metrics
latency_histograms
allocation_rate
GC metrics
CPU profile
memory profile
provider latency estimate
broker latency estimate
code_version
config_version
machine/environment fingerprint
```

‏לכל experiment:

```text
before
after
same workload where possible
behavioral diff
latency distribution diff
freshness diff
resource diff
economic diff
```

---

## ‏11. Promotion Criteria

‏Optimization מתקדם רק אם:

1. ‏ה־bottleneck הוכח ב־profile/measurement.
2. ‏השיפור מופיע ב־End-to-End או ב־critical stage בעל משמעות.
3. ‏P95/P99 לא הורעו במקום אחר.
4. ‏Freshness / queue age השתפרו או נשארו יציבים.
5. ‏Replay/Invariant tests נשארו תקינים.
6. ‏Decision differences מוסברים.
7. ‏Recovery לא נפגע.
8. ‏Complexity/maintenance cost סביר.
9. ‏השיפור שורד workload של burst, לא רק benchmark שקט.
10. ‏כאשר רלוונטי — Net Edge Retained או execution quality משתפרים.

---

## ‏12. Rejection Criteria

‏נreject Optimization כאשר:

- ‏השיפור קיים רק ב־microbenchmark ולא ב־End-to-End.
- ‏Average משתפר אבל Tail מחמיר materially.
- ‏Correctness/ordering/determinism נפגעים.
- ‏Queue age או Fresh Coverage מחמירים.
- ‏הפתרון מוסיף Complexity גבוהה עבור Gain זניח.
- ‏ה־bottleneck האמיתי חיצוני.
- ‏CPU עולה בלי improvement כלכלי.
- ‏Pooling/lock-free/unsafe code מייצרים failure surface לא מוצדק.
- ‏ה־optimization תלוי ב־workload מלאכותי.
- ‏הוא משפר Entry אבל פוגע ב־Exit/Recovery/Safety.

---

## ‏13. Metrics

### ‏Latency

```text
feed_receive_to_ready_ms
ready_to_feature_ms
feature_to_rank_ms
rank_to_decision_ms
decision_to_submit_ms
submit_to_ack_ms
submit_to_fill_ms
exit_intent_to_flat_ms
```

‏לכל אחד:

```text
P50 / P90 / P95 / P99
```

### ‏Queue / Freshness

```text
queue_depth
oldest_item_age
queue_age_p95
queue_age_p99
fresh_coverage_ratio
symbol_freshness_distribution
rank_age
signal_age_at_submit
```

### ‏Runtime

```text
CPU utilization
allocation bytes/sec
allocations/event
GC count
GC pause P95/P99
heap size
thread-pool queue
thread-pool starvation
context-switch indicators
```

### ‏Capacity

```text
sustainable_events_per_sec
peak_events_per_sec
headroom
catch_up_ratio
knee_point
```

### ‏Recovery

```text
restart_to_reconciled
restart_to_ready
backlog_drain_time
```

### ‏Economics

```text
Net Edge Retained by latency bucket
markout by signal age
selection regret by decision age
exit giveback by exit latency
NO_TRADE_LATENCY rate
```

---

## ‏14. Failure Modes

```text
PERF_FEED_DELAY
PERF_PARSE_CPU
PERF_STATE_UPDATE_CPU
PERF_FEATURE_CPU
PERF_RANKING_OVERLOAD
PERF_QUEUE_BACKLOG
PERF_QUEUE_STALE
PERF_GC_PAUSE
PERF_LOH_PRESSURE
PERF_THREADPOOL_STARVATION
PERF_LOCK_CONTENTION
PERF_SCHEDULING_BIAS
PERF_LOGGING_PRESSURE
PERF_TRACE_PRESSURE
PERF_PERSISTENCE_PRESSURE
PERF_PROVIDER_RTT
PERF_BROKER_RTT
PERF_RECONNECT_STORM
PERF_RECOVERY_TOO_SLOW
PERF_SUBSCRIPTION_CHURN
PERF_RATE_LIMIT_PRESSURE
PERF_RETRY_STORM
PERF_MEMORY_LEAK
PERF_SOCKET_HANDLE_LEAK
PERF_TIMER_EXPLOSION
PERF_SEMANTIC_DRIFT
PERF_NONDETERMINISTIC_MERGE
PERF_FALSE_PRECISION
PERF_PREMATURE_OPTIMIZATION
PERF_UNKNOWN
```

---

## ‏15. User-Specific Application

‏לרובוט שלנו, שסורק אלפי מניות ומחפש מומנטום קצר:

### ‏Whole-Market

‏המערכת לא תחשב Deep L2/Flow/Capacity לכל Symbol בכל Event.

‏ה־Baseline:

```text
broad cheap L1 / state / momentum / activity
→ rank
→ Top-N
→ deep enrichment
```

### ‏Windows

‏ה־horizons הקצרים יישמרו באמצעות structures אינקרמנטליים.

‏לא נבצע scan מלא של history עבור כל horizon בכל update.

### ‏Scanner

‏נמדוד `fresh_coverage_ratio` ו־cross-sectional fairness.

‏Top-1 שאינו מבוסס על Universe טרי מספיק אינו Candidate אמין.

### ‏Execution

‏Entry latency חשוב, אבל:

```text
Exit / Position / Fill processing
```

‏מקבלים עדיפות גבוהה יותר תחת עומס.

### ‏Capital / Scale

‏יותר Capital או יותר Symbols אינם רק שינוי כמותי.

‏הם יכולים להזיז את המערכת לאורך Capacity Curve וליצור bottleneck חדש.

### ‏Environment

‏לפני low-level code tuning, נבדוק אם:

```text
provider RTT
broker RTT
machine load
browser/runtime throttling
cloud/host placement
```

‏הם הגורם הדומיננטי.

---

## ‏16. Concrete Baseline Contract

```text
PerformanceBaseline
{
  workload_id,
  code_version,
  config_version,
  environment_fingerprint,

  signal_half_life_estimate,
  break_even_latency_estimate,

  latency_histograms,
  queue_age_histograms,
  fresh_coverage_histogram,

  event_rate_distribution,
  peak_burst_rate,
  sustainable_rate,
  knee_point_estimate,

  allocation_rate,
  gc_metrics,
  cpu_metrics,
  memory_metrics,

  restart_to_ready,
  catch_up_ratio,

  decision_hash,
  strategy_behavior_diff,

  performance_status,
  reason_codes
}
```

‏כל Performance comparison משמעותי ישתמש ב־Baseline versioned.

---

## ‏17. Confidence

### ‏High Confidence

‏יש Confidence גבוה ב־:

- ‏מדידה לפני Optimization.
- ‏End-to-End לפני microbenchmark.
- ‏Tail latency ו־queue age כ־metrics מרכזיים.
- ‏Incremental computation לפני low-level tuning.
- ‏bounded queues ו־backpressure.
- ‏business-priority scheduling.
- ‏Fast/Deep funnel.
- ‏determinism/correctness לפני speed.
- ‏profiling לפני pooling/lock-free/affinity.

### ‏Medium Confidence

‏נדרש Measurement ספציפי למערכת עבור:

- ‏מספר partitions/workers האופטימלי.
- ‏Array vs Dictionary / AoS vs SoA.
- ‏batch size.
- ‏ranking frequency.
- ‏Top-N size.
- ‏pooling usefulness.
- ‏parser specialization.

### ‏Low Confidence לפני Experiment

‏אין כרגע Evidence מספיק להצדיק:

- ‏CPU affinity.
- ‏NUMA tuning.
- ‏busy waiting.
- ‏native code.
- ‏GPU.
- ‏custom lock-free algorithms.
- ‏specialized network stacks.

---

## ‏18. Time-Sensitive Facts

‏Performance principles עצמם אינם תלויי־זמן בצורה משמעותית.

‏אבל כמה dependencies תפעוליים כן משתנים:

- ‏Broker/API pacing limits.
- ‏Provider subscription/rate limits.
- ‏Cloud/hosting characteristics.
- ‏Runtime/JIT/GC behavior בין גרסאות `.NET`.
- ‏Provider/Broker network behavior.

‏לכן אין להכניס ל־Core constants קבועים עבור מגבלות Provider/Broker ללא capability/version verification עדכנית.

‏במקטע זה לא נקבעו limits חיצוניים מספריים חדשים ולכן לא נדרש Web verification נוסף.

---

## ‏19. Relationship to Earlier / Later Sheets

### ‏06 — Time / Sampling / Latency

‏מגדיר את clock/time semantics הבסיסיים.

### ‏35 — Observability

‏מגדיר Evidence/telemetry; 54 דורש שה־telemetry עצמה לא תהפוך bottleneck.

### ‏48 — Latency Edge

‏48 מגדיר Latency כ־Edge Preservation Constraint ואת Timing Contract.

‏54 מרחיב ל־:

```text
CPU
memory
GC
queues
throughput
concurrency
data structures
recovery
capacity envelope
```

### ‏50 — Scanner Best Practices

‏50 מגדיר Fast/Deep scanner funnel ו־fairness.

‏54 מגדיר איך ליישם אותו בלי collapse תחת load.

### ‏51 — Execution Engine

‏51 מגדיר correctness/idempotency/reconciliation.

‏54 מגדיר Priority ו־latency בלי לעקוף את safety semantics של 51.

### ‏52 — Data Engineering

‏52 מגדיר Raw/Canonical/Data Quality/As-Known-At.

‏54 מגדיר throughput/freshness/backpressure מבלי לשכתב את Truth contract.

### ‏53 — Testing

‏53 מגדיר Fast/Replay/Fault/Performance suites.

‏54 מספק את ה־Performance SLIs וה־regression dimensions שאותם tests צריכים למדוד.

### ‏55 — Security and Operations Best Practices

‏55 יוסיף את ה־operational/security controls סביב Deployment, credentials, production access ו־incident response.

---

## ‏20. Tests / Invariants

### ‏Golden Performance Scenarios

1. ‏Normal market load — no backlog.
2. ‏Correlated burst across large symbol set.
3. ‏Hot Top-N churn.
4. ‏GC pressure spike.
5. ‏Logging/telemetry pressure.
6. ‏Slow persistence.
7. ‏Provider latency spike.
8. ‏Broker latency spike.
9. ‏Reconnect storm.
10. ‏Recovery with backlog.
11. ‏Exit while Scanner overloaded.
12. ‏Safety event while queues full.
13. ‏Deep Path slowdown.
14. ‏Subscription churn.
15. ‏Performance optimization with replay equivalence.

### ‏Hard Invariants

```text
Safety correctness > performance
```

```text
Exit / Position work cannot be starved by Scanner analytics
```

```text
Critical broker/risk/safety events are never silently dropped
```

```text
Stale actionable work cannot be treated as fresh merely because it was eventually processed
```

```text
Same semantic inputs + same versions
=> same deterministic business outcome
unless fresher timing evidence explicitly explains the difference
```

```text
Optimization cannot bypass risk/safety/reconciliation
```

```text
Unbounded queue is not an allowed production backpressure strategy
```

```text
No performance claim without workload + percentile + version context
```

### ‏Property Tests

```text
increasing noncritical diagnostics load
must not violate safety/position invariants
```

```text
under overload,
new-entry work may degrade before exit/risk work
```

```text
coalescing is allowed only for event classes whose semantics permit it
```

```text
replaying the same event stream twice
must produce the same decision hash
```

### ‏Performance Regression Tests

‏Fast CI:

```text
catastrophic regression smoke only
```

‏Scheduled suite:

```text
burst replay
large-universe load
GC/allocation profile
soak
recovery/catch-up
freshness-vs-load curve
```

---

## ‏21. Optimization Ladder

```text
L0 — Measure End-to-End
L1 — Fix correctness/freshness/backpressure
L2 — Remove unnecessary work / synchronous blocking
L3 — Incremental algorithms / better data structures
L4 — Hot/Cold separation / bounded concurrency
L5 — Reduce allocations/copies where profile proves value
L6 — Network/deployment placement
L7 — Runtime/GC/OS tuning
L8 — Specialist low-level techniques
```

‏אין קפיצה ל־L7/L8 כאשר L1–L4 עדיין מכילים bottleneck גדול.

---

## ‏22. Recommended Performance Experiment Template

```text
Hypothesis:
Changing X will reduce Y tail latency without changing semantic behavior.

Frozen:
- dataset/workload
- config
- feature versions
- execution model
- machine class

Primary Metric:
- target P95/P99 stage or end-to-end latency

Guardrails:
- decision hash / approved behavior diff
- fresh coverage
- queue age
- allocations
- CPU
- recovery time
- safety invariants

Result:
- latency distribution before/after
- resource distribution before/after
- behavioral diff
- complexity added
- economic effect

Decision:
PROMOTE / REJECT / RESEARCH_MORE
```

---

## ‏23. Recommendation Summary

### ‏`P0`

‏למדוד End-to-End, ‏P95/P99, queue age, freshness ו־recovery; להשתמש ב־bounded queues, business priorities ו־explicit overload states; לשמור correctness/determinism/safety לפני speed.

### ‏`P1`

‏Incremental rolling computation, Fast Path לכל ה־Universe, Deep Path ל־Top-N, bounded partitions, Hot/Cold separation ו־simple in-process architecture.

### ‏`P2`

‏Structural optimization לפי profiling: dense IDs, arrays/SoA, partial selection, parser/copy/allocation reduction, candidate hysteresis ו־recovery acceleration.

### ‏`P3`

‏Adaptive batching, custom schedulers, advanced runtime tuning, SIMD ו־specialized deployment experiments.

### ‏`P4`

‏CPU affinity, NUMA, busy-waiting, native/unsafe code, GPU או low-level networking — רק כאשר Evidence מראה bottleneck אמיתי ו־Net benefit ברור.

‏השורה התחתונה:

```text
Fresh enough
+ Fast enough
+ Bounded under bursts
+ Deterministic
+ Safe
+ Economically useful
```

‏זה היעד.

‏לא:

```text
lowest benchmark number at any cost
```
