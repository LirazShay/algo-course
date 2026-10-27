# ‏Cross-Cutting 16 — Recommended Performance Priorities

> ‏מטרת המסמך: לסנתז את Recommendation Sheets של Performance, Latency, Scanner, Data Engineering, Testing, Observability, Replay, Execution, Recovery ו־Production Safety למדיניות `Performance Priorities` אחת evidence-driven עבור `Research / Replay / Shadow / Paper` ותכנון `Production Engineering`.
>
> ‏המסמך אינו אישור `Live`, אינו מגדיר יעדי latency לחשבון אמיתי ואינו מציע מרוץ ל־HFT. המטרה היא לשמר Evidence טרייה ו־Decision semantics תחת עומס, למדוד היכן זמן באמת נצרך, ולייעל רק bottlenecks שמוכחים כמשמעותיים.

---

## ‏1. Decision

‏`Performance` אצלנו אינו:

```text
lowest benchmark number
maximum threads
minimum microseconds
```

‏אלא:

```text
Fresh Evidence
→ Current Canonical State
→ Incremental Features
→ Whole-Market Fast Path
→ Top-K / Top-N Deep Path
→ Decision
→ Risk / Safety / Compliance
→ Revalidation
→ Simulated / Paper Execution
→ Position / Exit
→ Flat
```

‏תוך שמירה על:

```text
Correctness
Determinism
Freshness
Bounded Queues
Tail Latency
Recovery
Safety
Replayability
```

‏העיקרון המחייב:

```text
Performance = preserving useful decision quality under realistic load.
```

‏ולכן:

```text
Fastest Possible != Objective

Fresh Enough
+ Fast Enough
+ Bounded Under Bursts
+ Deterministic
+ Recoverable
+ Safe
= Objective
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏Performance נמדד End-to-End

‏לא נאשר Optimization מפני שפונקציה בודדת ירדה מ־`20µs` ל־`8µs`.

‏נמדוד את השרשרת הרלוונטית, למשל:

```text
feed_receive_to_ready
ready_to_feature
feature_to_rank
rank_to_decision
decision_to_risk
decision_to_revalidation
revalidation_to_submit
submit_to_ack
submit_to_first_fill
first_fill_to_position_ready
exit_intent_to_flat
```

‏נשמור לכל stage לפחות:

```text
P50
P90
P95
P99
```

‏ומדדי freshness/queue/capacity במקביל.

### ‏`P0 — Required`: ‏Freshness ו־Queue Age קודמים ל־Raw Compute Speed

‏ה־Performance Truth הראשוני:

```text
quote_age
trade_age
feature_age
rank_age
candidate_age
signal_age
signal_age_at_handoff
oldest_queue_item_age
fresh_coverage_ratio
```

‏חישוב מהיר על state ישן אינו system low-latency במובן השימושי.

‏כאשר work עבר את ה־TTL הכלכלי או הסמנטי שלו:

```text
expire / coalesce / drop / re-decide
```

‏לפי contract מפורש — לא “לעבד מאוחר כי כבר חיכינו”.

### ‏`P0 — Required`: ‏Latency נבחן ביחס ל־Signal Horizon

‏מדד רעיוני:

```text
LatencyPressure
=
EndToEndLatency / SignalHalfLife
```

‏הערך המספרי המדויק של ה־Half-Life הוא Hypothesis אמפירית ולא constant ארכיטקטוני.

‏נשתמש ב־Replay/Research כדי לבנות:

```text
edge_vs_delay
selection_quality_vs_delay
net_outcome_vs_delay
fill_quality_vs_delay
exit_giveback_vs_delay
```

‏המטרה היא לזהות `Latency Cliff` ולהשאיר headroom לפניו.

### ‏`P0 — Required`: ‏Bounded Queues + Explicit Backpressure

‏לכל queue משמעותי נגדיר:

```text
capacity
priority_class
overflow_behavior
coalescing_semantics
stale_work_policy
loss_tolerance
```

‏לא יהיו queues בלתי־מוגבלים.

‏אסור `drop random` ואסור silent loss של Truth קריטי.

‏לעולם לא נשמט בשקט:

```text
order / cancel facts
fills
position facts
risk / safety facts
reconciliation facts
critical trading-status facts
```

### ‏`P0 — Required`: ‏Business-Priority Scheduling

‏תחת עומס, סדר הקדימויות הוא סמנטי ולא FIFO נאיבי:

```text
Safety / Emergency Control
> Position / Exit / Working Orders
> Fills / Cancels / Reconciliation
> Risk / Compliance
> Entry Execution
> Top Candidates
> Full-Universe Scanner
> Optional Deep Research / Diagnostics / UI
```

‏Existing Exposure מקבל עדיפות על Opportunity היפותטית.

### ‏`P0 — Required`: ‏Incremental Computation לפני Micro-Optimization

‏ברירת המחדל:

```text
rolling state
ring / bounded buffers
incremental sums / counts
incremental feature state
dirty-symbol updates
event-type selective updates
cached reusable canonical state
```

‏לא:

```text
rescan full history
rebuild all windows
recompute all features
full-sort entire universe
```

‏על כל event.

### ‏`P0 — Required`: ‏Fast Path / Deep Path

‏לכל ה־Universe:

```text
canonical state
cheap required features
hard eligibility
cheap comparable rank inputs
Top-K / Top-N selection
```

‏ורק לקבוצה קטנה:

```text
expensive enrichment
richer microstructure context
advanced diagnostics
capacity / execution research
```

‏ה־Deep Path לעולם אינו authority שחוסם Position/Exit work ואינו רשאי להקפיא את Fast Path.

### ‏`P0 — Required`: ‏Correctness / Determinism / Safety קודמים למהירות

‏כל Optimization הנוגע ל־:

```text
parallelism
ordering
batching
coalescing
precision
caching
incremental state
memory reuse
```

‏חייב לעבור:

```text
unit / property / invariant tests
deterministic replay
behavioral diff
fault / recovery checks where relevant
```

‏אותם semantic inputs ואותן versions אמורים להחזיר אותו outcome, אלא אם שינוי timing/freshness אמיתי ומוסבר שינה את Evidence שהייתה זמינה.

### ‏`P0 — Required`: ‏Performance Change הוא Behavioral-Change Candidate

‏אחרי Optimization משמעותי נשווה לפחות:

```text
state hashes
feature values
eligibility
Top-K / Top-1
reason codes
TRADE / NO_TRADE / UNKNOWN research decisions
entry / exit timing
simulated execution outcomes
recovery timing
```

‏שינוי התנהגות אינו בהכרח Bug — אך הוא חייב להיות:

```text
observed
classified
explained
reviewed
```

‏ולא side effect מקרי של scheduler חדש.

### ‏`P0 — Required`: ‏Overload הוא State מפורש

‏כאשר המערכת אינה עומדת ב־arrival rate או freshness contract:

```text
NORMAL
→ REDUCED_DEEP_PATH
→ FAST_ONLY_DIAGNOSTIC / RESEARCH
→ BLOCK_NEW_ENTRIES
```

‏ה־mode המדויק נשלט על ידי Safety/Scanner contracts, אבל degradation אינה שקטה.

‏לכל מעבר נשמור:

```text
reason_code
started_at
affected_capabilities
queue_age
freshness state
recovery condition
```

### ‏`P1 — Preferred`: ‏KISS / Low-Hop Topology

‏ברירת המחדל למערכת האישית:

```text
modular monolith or small number of processes
+ in-process hot state
+ low-hop pipeline
+ bounded partitions
+ explicit ownership
```

‏לא:

```text
microservices by default
remote feature lookup in hot path
many RPC hops
complex distributed scheduling
```

‏Process/service boundary חדש דורש Evidence של fault-isolation, security או scaling שמצדיק את serialization/network/operations cost.

### ‏`P1 — Preferred`: ‏Single Writer per Hot-State Partition

‏כאשר מתאים:

```text
Stable SymbolId
→ bounded partition
→ one logical state writer
```

‏זה מפשט:

```text
ordering
locking
determinism
ownership
RCA
```

‏Account-wide Risk/Execution authorities נשארים boundaries נפרדים.

### ‏`P1 — Preferred`: ‏Hot / Cold Separation

‏Hot:

```text
ingest
canonical state
required features
ranking
decision
risk / safety
execution state
position / exit
```

‏Cold:

```text
reports
historical aggregation
deep RCA
research exports
rich UI enrichment
large diagnostics
```

‏Cold work לא ירוץ על critical workers כאשר הוא יכול ליצור tail spikes.

### ‏`P1 — Preferred`: ‏Observability עם Overhead Budget

‏ב־hot path:

```text
cheap counters
histograms
stable IDs
compact structured events
```

‏לא:

```text
large string formatting per tick
full payload logs for every event
full distributed tracing for every market message
```

‏אבל Truth Ledger ו־critical evidence אינם הופכים best-effort בגלל performance.

### ‏`P1 — Preferred`: ‏Capacity Envelope + Knee Point

‏נמדוד workload כ־:

```text
symbol_count
× event_rate_distribution
× feature_cost
× ranking_frequency
× deep_path_rate
```

‏ונבנה עקומה:

```text
load
→ queue age
→ freshness
→ P95/P99 latency
→ CPU / memory / GC
```

‏המטרה היא לזהות `Knee Point` ולהפעיל את ה־baseline מתחתיו עם headroom.

‏מדד רעיוני:

```text
ThroughputHeadroom
=
SustainableRate / ObservedPeakRate
```

### ‏`P1 — Preferred`: ‏Cold Start, Burst, Steady State ו־Recovery נמדדים בנפרד

‏Benchmark משמעותי כולל לפחות:

```text
cold_start
warmup
steady_state
correlated_burst
reconnect / backlog
recovery
```

‏Warm microbenchmark לבדו אינו Production Performance Evidence.

### ‏`P1 — Preferred`: ‏Recovery Performance הוא חלק מה־Contract

‏נמדוד:

```text
restart_to_connected
restart_to_reconciled
restart_to_warmed
restart_to_ready
backlog_drain_time
catch_up_rate
live_arrival_rate
```

‏אם נוצר backlog, נדרש לאורך זמן:

```text
catch_up_rate > live_arrival_rate
```

‏כדי לסגור אותו.

‏אך `processed backlog` אינו Resume permission; readiness/reconciliation/freshness נשארים authorities.

### ‏`P1 — Preferred`: ‏Memory / GC Optimization רק אחרי Profile

‏נמדוד:

```text
allocation_bytes_per_sec
allocations_per_event
heap growth
GC count
GC pause P95/P99
copy volume
hot object lifetime
```

‏רק לאחר profile נשקול:

```text
buffer pooling
Span / streaming parsing
dense arrays / SoA
object reuse
copy reduction
```

‏Pooling שמוסיף stale-state risk או lifecycle bugs נדחה גם אם הוא מהיר יותר.

---

## ‏3. Why

‏במערכת short-horizon, performance failure אינו רק “האפליקציה איטית”. הוא יכול לשנות את ה־Evidence עצמה:

```text
old quote
→ old feature
→ stale rank
→ stale candidate
→ late decision
```

‏תחת burst, הבעיה יכולה להחמיר בדיוק כאשר השוק משתנה מהר יותר.

‏לכן Tail Latency, Queue Age, Fresh Coverage ו־Decision Age חשובים יותר ממספר throughput יחיד.

‏במקביל, premature optimization מוסיף:

```text
ordering bugs
nondeterminism
complex lifecycle
harder recovery
harder RCA
more operational states
```

‏לכן Optimization מתקדם רק כאשר ה־bottleneck מדוד וה־gain נשמר תחת workload רלוונטי.

---

## ‏4. Use When

‏המדיניות רלוונטית כאשר:

- ‏ה־Universe רחב.
- ‏Signal/Decision TTL קצר.
- ‏יש correlated market bursts.
- ‏Cross-sectional fairness תלויה ב־freshness.
- ‏נוסף Feature יקר.
- ‏משנים batching/concurrency/partitioning/storage/logging.
- ‏רואים queue lag, CPU saturation, GC spikes או allocation pressure.
- ‏Recovery/reconnect יוצר backlog.
- ‏Execution/Position work מתחרים עם Scanner analytics.
- ‏מתקרבים ל־capacity knee.

---

## ‏5. Do Not Use When

‏אין הצדקה ל־low-level tuning כאשר:

- ‏Correctness בסיסי עדיין לא מוכח.
- ‏Replay אינו deterministic.
- ‏אין workload/measurement אמין.
- ‏ה־bottleneck העיקרי חיצוני ל־process.
- ‏Feature יקר עדיין לא הוכיח decision value.
- ‏ה־optimization אינו משנה freshness, tail latency, queue age, recovery או decision quality.
- ‏הבעיה האמיתית היא שה־Signal horizon אינו מתאים לתשתית הקיימת.

---

## ‏6. Alternatives

### ‏Baseline

```text
Simple low-hop process
+ incremental features
+ cheap whole-market path
+ small deep path
+ bounded queues
+ measurement
```

### ‏Preferred Default

```text
bounded partitions
+ single-writer hot state
+ dense stable IDs where useful
+ hot/cold separation
+ measured allocation/copy reduction
```

### ‏Challenger

```text
partial Top-K selection
adaptive batching
candidate warm cache
more specialized memory layouts
```

### ‏Advanced Option

```text
SIMD
specialized parsers
buffer pooling
custom scheduler
placement / affinity experiments
```

### ‏Specialist / Avoid Unless Evidence

```text
lock-free everywhere
thread-per-symbol
busy waiting
NUMA tuning
native / unsafe code
GPU
kernel bypass
custom network stack
FPGA
```

---

## ‏7. Trade-offs

| בחירה | יתרון אפשרי | מחיר / סיכון |
|---|---|---|
| ‏Batching גדול | ‏Throughput גבוה יותר | ‏Latency/Tail גבוהים יותר |
| ‏יותר Parallelism | ‏Processing capacity | ‏Ordering, merge ו־determinism מורכבים יותר |
| ‏Pooling | ‏פחות GC | ‏Lifecycle/stale-state bugs |
| ‏Compression | ‏פחות I/O | ‏יותר CPU |
| ‏יותר Snapshots | ‏Recovery מהיר יותר | ‏Write/I/O overhead |
| ‏Process isolation | ‏Fault isolation | ‏Serialization/network/ops overhead |
| ‏Low-level numeric optimization | ‏Compute speed | ‏Precision/semantic risk |

‏כל trade-off מוכרע באמצעות workload רלוונטי ולא preference תאורטי.

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מתחיל עם:

- ‏Optimization ללא profile.
- ‏Unbounded queues.
- ‏Thread לכל Symbol.
- ‏Lock-free architecture רחבה.
- ‏Microservices רק “בשביל scale”.
- ‏Remote Feature Store ב־hot path.
- ‏Full tracing לכל tick.
- ‏Heavy string logging לכל market event.
- ‏Dynamic batching/scheduler מורכב.
- ‏Manual memory management ללא bottleneck מוכח.
- ‏CPU pinning/NUMA/busy-waiting כברירת מחדל.
- ‏GPU/FPGA/kernel bypass.
- ‏Sub-microsecond targets שאין להם relationship ל־Signal Half-Life.

---

## ‏9. What to Add Later

‏לפי Evidence בלבד:

```text
P2
- dense arrays / SoA
- partial Top-K selection
- parser / copy / allocation reduction
- candidate hysteresis / warm cache
- more efficient snapshot/recovery paths

P3
- adaptive batching
- custom schedulers
- SIMD
- runtime / GC tuning
- host / network placement experiments

P4
- affinity / NUMA / busy wait
- native / unsafe code
- specialized networking
- GPU / accelerator paths
```

---

## ‏10. Required Data / Evidence

‏לפני Performance change משמעותי נדרש לפחות:

```text
WorkloadId
MarketRegime / workload class
SymbolCount
EventRateDistribution
BurstProfile
FeatureSetVersion
RankingCadence
DeepPathRate
QueueDepth / QueueAge histograms
Latency histograms
FreshCoverage distribution
Allocation / GC metrics
CPU / memory profile
Provider-latency estimate
Simulator/Paper-adapter latency where relevant
CodeVersion
ConfigVersion
Machine / Environment fingerprint
```

‏ל־Experiment:

```text
Frozen workload where possible
Before
After
Behavioral Diff
Latency Distribution Diff
Freshness Diff
Resource Diff
Recovery Diff
Complexity Cost
Economic / Decision-quality Diff where modeled
```

---

## ‏11. Promotion Criteria

‏Optimization מקודם רק אם:

1. ‏ה־bottleneck הוכח במדידה/profile.
2. ‏השיפור נראה ב־End-to-End או critical stage משמעותי.
3. ‏`P95/P99` לא מוחמרים במקום אחר.
4. ‏Freshness ו־queue age משתפרים או נשארים יציבים.
5. ‏Replay/Invariant/Golden tests נשארים תקינים.
6. ‏Behavior differences מוסברים.
7. ‏Recovery אינו נפגע.
8. ‏Safety/Position priorities נשמרים תחת burst.
9. ‏Complexity/maintenance cost סביר.
10. ‏ה־gain שורד workload רלוונטי ולא רק microbenchmark.
11. ‏כאשר אפשר למדוד זאת — decision quality או `Net Edge Retained` אינם נפגעים.

---

## ‏12. Rejection Criteria

‏נReject Optimization אם:

- ‏ה־gain קיים רק ב־microbenchmark.
- ‏Average משתפר אך Tail מחמיר מהותית.
- ‏Fresh Coverage / Queue Age מחמירים.
- ‏Ordering/Determinism/Correctness נפגעים.
- ‏Position/Exit/Safety work מקבלים פחות priority.
- ‏Recovery איטי או פחות אמין.
- ‏ה־bottleneck האמיתי חיצוני.
- ‏Resource usage עולה בלי gain שימושי.
- ‏Complexity גדולה עבור gain קטן.
- ‏ה־workload מלאכותי ולא מייצג bursts/recovery.
- ‏השינוי דורש semantics לא ברורים כדי להיות מהיר.

---

## ‏13. Metrics

### ‏Latency

```text
feed_receive_to_ready
ready_to_feature
feature_to_rank
rank_to_decision
decision_to_revalidation
revalidation_to_submit
submit_to_ack
submit_to_first_fill
exit_intent_to_flat
```

‏לכל stage:

```text
P50 / P90 / P95 / P99
```

### ‏Freshness / Queue

```text
fresh_coverage_ratio
quote_age_distribution
trade_age_distribution
feature_age_distribution
rank_age
signal_age_at_handoff
queue_depth
oldest_item_age
queue_age_p95
queue_age_p99
```

### ‏Runtime

```text
CPU utilization
allocation_bytes_per_sec
allocations_per_event
GC count
GC pause P95/P99
heap size
thread-pool queue / starvation indicators
context-switch indicators where useful
```

### ‏Capacity

```text
sustainable_events_per_sec
observed_peak_events_per_sec
throughput_headroom
capacity_knee_point
catch_up_ratio
```

### ‏Recovery

```text
restart_to_reconciled
restart_to_warmed
restart_to_ready
backlog_drain_time
```

### ‏Decision / Economic Diagnostics

```text
selection_regret_by_decision_age
no_trade_latency_rate
net_edge_retained_by_latency_bucket
exit_giveback_by_exit_latency
```

‏אלה Research metrics בלבד ואינם guarantee of profitability.

---

## ‏14. Failure Modes

```text
PERF_PARTIAL_UNIVERSE_FRESHNESS
PERF_QUEUE_BACKLOG
PERF_QUEUE_STALE
PERF_FEATURE_CPU
PERF_RANKING_OVERLOAD
PERF_DEEP_PATH_STARVATION
PERF_EXIT_STARVATION
PERF_GC_PAUSE
PERF_ALLOCATION_PRESSURE
PERF_LOCK_CONTENTION
PERF_THREADPOOL_STARVATION
PERF_SCHEDULING_BIAS
PERF_NONDETERMINISTIC_MERGE
PERF_LOGGING_PRESSURE
PERF_TRACE_PRESSURE
PERF_PERSISTENCE_PRESSURE
PERF_PROVIDER_DELAY
PERF_EXTERNAL_ADAPTER_DELAY
PERF_RECONNECT_STORM
PERF_RECOVERY_TOO_SLOW
PERF_RETRY_STORM
PERF_MEMORY_LEAK
PERF_TIMER_EXPLOSION
PERF_SEMANTIC_DRIFT
PERF_PREMATURE_OPTIMIZATION
PERF_FALSE_PRECISION
PERF_UNKNOWN
```

---

## ‏15. User-Specific Application

‏ל־whole-market short-horizon system שלנו, סדר הקדימויות המומלץ:

```text
1. Measure whole-path freshness and tails.
2. Keep canonical per-symbol state current.
3. Compute short windows incrementally.
4. Keep whole-market Fast Path cheap.
5. Deep-enrich only Top-K / Top-N.
6. Bound every queue and measure age.
7. Prioritize Position / Exit / Fill truth over new Scanner work.
8. Shed optional work before trust is lost.
9. Block new candidates when cross-sectional freshness is no longer trustworthy.
10. Optimize allocations/copies only after profiling.
11. Tune placement/runtime only after algorithmic/queue bottlenecks are resolved.
12. Use specialist techniques only when a measured bottleneck survives all simpler layers.
```

‏עבור horizons קצרים במיוחד, המטרה אינה “לנצח HFT”.

‏המטרה היא:

```text
avoid wasting the edge we can actually observe
through avoidable local delay and stale work
```

---

## ‏16. Optimization Ladder

```text
L0 — Measure End-to-End
L1 — Fix correctness / freshness / backpressure
L2 — Remove unnecessary work / synchronous blocking
L3 — Incremental algorithms / better data structures
L4 — Hot/Cold separation / bounded concurrency / priority
L5 — Reduce allocations / copies where profile proves value
L6 — Network / deployment placement
L7 — Runtime / GC / OS tuning
L8 — Specialist low-level techniques
```

‏אין קפיצה ל־`L7/L8` כל עוד `L1–L4` מכילים bottleneck גדול.

---

## ‏17. Performance Experiment Contract

```text
PerformanceExperiment
{
  Hypothesis,
  WorkloadId,
  CodeVersion,
  ConfigVersion,
  EnvironmentFingerprint,

  PrimaryMetric,
  TailGuardrails,
  FreshnessGuardrails,
  QueueAgeGuardrails,
  RecoveryGuardrails,
  SafetyInvariants,
  DecisionHashOrBehavioralDiff,

  BeforeDistribution,
  AfterDistribution,
  ResourceDiff,
  ComplexityAdded,
  DecisionOrEconomicEffect,

  Decision: PROMOTE | REJECT | RESEARCH_MORE
}
```

‏`PrimaryMetric` יהיה בדרך כלל `P95/P99` של stage או end-to-end bottleneck אמיתי — לא score composite שמסתיר regression.

---

## ‏18. Testing / Regression Policy

### ‏Fast CI

‏בודק catastrophic regressions ו־semantic invariants בלבד.

### ‏Scheduled / On-Demand

```text
correlated burst replay
large-universe load
allocation / GC profile
soak
recovery / catch-up
freshness-vs-load curve
telemetry-pressure scenario
slow-persistence scenario
```

### ‏Golden Performance Scenarios

‏לפחות:

1. ‏Normal load ללא backlog.
2. ‏Correlated whole-market burst.
3. ‏Top-K churn גבוה.
4. ‏Deep Path slowdown.
5. ‏GC/allocation spike.
6. ‏Slow persistence.
7. ‏Provider-delay spike.
8. ‏Reconnect storm/backlog.
9. ‏Exit בזמן Scanner overload.
10. ‏Safety transition כאשר queues מלאים.
11. ‏Optimization עם replay equivalence.

---

## ‏19. Hard Invariants

```text
Safety correctness > performance
```

```text
Position / Exit work cannot be starved by Scanner analytics
```

```text
Critical truth events are never silently dropped for speed
```

```text
Stale actionable work cannot become fresh merely because it was processed late
```

```text
No performance optimization may bypass Risk / Safety / Compliance / Reconciliation
```

```text
No unbounded production queue
```

```text
No performance claim without workload + percentile + version context
```

---

## ‏20. Fact / Judgment / Hypothesis

### ‏Fact / Established Engineering Principle

- ‏Averages can hide damaging tail latency.
- ‏Unbounded queues can convert overload into growing latency and stale work.
- ‏Incremental computation can avoid repeated work when state can be updated locally.
- ‏More concurrency can add scheduling, ordering and synchronization overhead.
- ‏Optimization can change behavior when it changes timing, ordering or precision.

### ‏Judgment — Recommended Baseline

- ‏Measure end-to-end before low-level tuning.
- ‏Treat freshness and queue age as performance truth.
- ‏Use incremental features and a Fast/Deep funnel.
- ‏Prefer low-hop modular architecture initially.
- ‏Protect Position/Exit/Safety work with explicit priority.
- ‏Use bounded queues and explicit overload modes.
- ‏Profile before pooling, SIMD, affinity or native code.

### ‏Hypothesis — Requires Measurement

- ‏Exact Signal Half-Life and latency cliff.
- ‏Exact `Top-N` size.
- ‏Optimal ranking cadence.
- ‏Optimal partition/worker count.
- ‏Best batching size.
- ‏Whether dense arrays/SoA materially help.
- ‏Whether provider/network placement dominates local compute.
- ‏Whether advanced runtime tuning has meaningful incremental value.

---

## ‏21. Confidence

### ‏High

‏גבוה לגבי:

- ‏Measurement before optimization.
- ‏End-to-end + P95/P99.
- ‏Freshness and queue age.
- ‏Bounded queues/backpressure.
- ‏Incremental computation.
- ‏Business-priority scheduling.
- ‏Fast/Deep separation.
- ‏Correctness/determinism/safety before speed.

### ‏Medium

‏בינוני לגבי:

- ‏partition count.
- ‏data-layout choices.
- ‏batching.
- ‏ranking cadence.
- ‏Top-N size.
- ‏pooling/parser specialization.

### ‏Evidence-Only

‏לא נקדם ללא bottleneck מדוד:

- ‏CPU affinity / NUMA.
- ‏busy waiting.
- ‏native/unsafe paths.
- ‏GPU/accelerators.
- ‏specialized network stacks.

---

## ‏22. Time-Sensitive Facts

‏עקרונות ה־Performance במסמך זה אינם דורשים אימות Web חדש.

‏לפני קיבוע תפעולי של capability חיצונית יש לאמת מחדש, לפי הצורך:

```text
provider pacing / subscription limits
broker/API rate or pacing limits
runtime/JIT/GC version behavior
host/cloud characteristics
provider/network characteristics
```

‏לא קובע כאן מספר חיצוני תלוי־זמן.

---

## ‏23. Recommendation Summary

```text
Measure End-to-End
→ Protect Freshness / Truth
→ Bound Queues + Explicit Backpressure
→ Remove Unnecessary Work
→ Incremental Computation
→ Whole-Market Fast Path
→ Small Deep Path
→ Position/Exit/Safety Priority
→ Hot/Cold Separation
→ Profile Memory / GC / Copies
→ Capacity + Recovery Headroom
→ Placement / Runtime Tuning if measured
→ Specialist Optimization only with Evidence
```

‏השורה התחתונה:

> ‏ה־Performance baseline צריך להיות **מהיר מספיק כדי לשמור Evidence טרייה, יציב מספיק כדי לשרוד bursts, ודטרמיניסטי מספיק כדי שכל שיפור יהיה ניתן להוכחה ול־RCA** — לא אוסף טריקים שמייצר benchmark מרשים אך מערכת פחות אמינה.