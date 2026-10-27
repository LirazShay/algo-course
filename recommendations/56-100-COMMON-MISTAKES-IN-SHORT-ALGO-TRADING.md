# ‏56 — Recommendation Sheet: 100 Common Mistakes in Short Algo Trading

> ‏מקור לימודי עיקרי: `../56-100-COMMON-MISTAKES-IN-SHORT-ALGO-TRADING.md`.
>
> ‏מטרת הקובץ: להפוך את מאה ה־anti-patterns של הפרק ל־Failure Prevention Map מעשי עבור רובוט `Short-Horizon Momentum`: לא רק לדעת מה עלול להשתבש, אלא לקשור כל class של טעות ל־Detection, Control, Test, Metric, Owner ו־Promotion Gate.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה להפעלה בכסף אמיתי ואינו מבטיח רווח.

---

## ‏1. Decision

‏מקטע 56 לא יישמר אצלנו כרשימת “מאה דברים שכדאי לזכור”.

‏הוא יהפוך ל־**Mistakes Registry + Failure Prevention Control Map**.

‏ה־Baseline:

```text
Anti-Pattern
→ Failure Mode
→ Detection
→ Preventive Control
→ Test / Metric
→ Severity
→ Owner
→ Promotion Blocker if Critical
```

‏העיקרון המחייב:

```text
A known failure mode without a control
is not knowledge.
It is deferred risk.
```

‏והעיקרון הכלכלי:

```text
Gross Signal
→ Data Integrity
→ Ranking Integrity
→ Execution Reality
→ Cost / Impact
→ Risk / Capacity
→ Operational Readiness
→ Net Executable Outcome
```

‏כאשר חוליה אחת נשברת, אין להסיק מיד שה־Alpha עצמו נשבר.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Registry אחיד לכל Failure Mode משמעותי

‏נחזיק רשומה לוגית מהצורה:

```text
MistakeControl
{
  id,
  category,
  title,
  severity,
  detectability,
  affected_stage,
  failure_mode,
  detection_signal,
  preventive_control,
  regression_test,
  operational_metric,
  owner,
  status,
  evidence_link
}
```

‏ה־Registry אינו חייב להתחיל כמערכת תוכנה נפרדת.

‏ב־KISS baseline הוא יכול להיות Markdown/YAML versioned בתוך ה־repo, כל עוד אפשר לענות:

```text
What can fail?
How do we detect it?
What blocks recurrence?
Which test proves the control?
Who owns it?
```

### ‏`P0 — Required`: ארבעת ה־Failure Modes הקריטיים ביותר לרובוט שלנו

‏הפרק מזהה ארבעה anti-patterns שצריכים להפוך אצלנו ל־Golden Failure Scenarios:

```text
F56-P0-01 — stale signal reaches execution
F56-P0-02 — rank winner selected from insufficiently fresh universe
F56-P0-03 — fill looks good by price but is toxic by post-fill markout
F56-P0-04 — exit command is timely but position does not become flat in time
```

‏ארבעתם הם Promotion Blockers.

‏אין מעבר משכבת Research/Replay ל־Shadow/Paper כאשר אחד מהם אינו ניתן למדידה ושחזור.

### ‏`P0 — Required`: לפני שמאשימים את Strategy — Failure Attribution Ladder

```text
Data
→ Universe / Coverage
→ Features
→ Ranking
→ Signal Age
→ Entry Feasibility
→ Order Lifecycle
→ Fill Quality
→ Exit / Time-to-Flat
→ Costs / Impact
→ Risk / Capacity
→ Operations / Recovery
→ Strategy / Alpha
```

‏`STRATEGY_FAILURE` הוא classification מאוחר, לא ברירת מחדל.

### ‏`P0 — Required`: Positive Metrics יכולים להיות Anti-Metrics

‏לעולם לא נפרש Metric “טוב” ללא counterpart כלכלי:

```text
High Fill Rate
→ check post-fill markout

Low Average Latency
→ check P95/P99 + queue age

High Win Rate
→ check payoff distribution + Net EV

High Coverage
→ check freshness distribution

High Gross PnL
→ check costs / impact / executable fills
```

### ‏`P0 — Required`: Timing הוא חלק מן ה־Signal

```text
same value
at different age
!= same signal
```

‏לכן כל Feature/Candidate/Intent קצר־חיים צריך לשאת מספיק provenance כדי לדעת:

```text
as_of
feature_age
candidate_age
signal_age
market_state_version
```

### ‏`P0 — Required`: Complexity Must Pay Rent

‏כל Feature, Model, Queue Model, Order Tactic, Route, Optimization או Infrastructure layer חדש צריך להראות לפחות אחד מאלה:

```text
incremental predictive value
incremental execution value
lower operational risk
lower tail risk
lower cost
higher reproducibility
material performance headroom
```

‏אם אינו מראה ערך כזה — complexity היא Cost, לא sophistication.

---

## ‏3. Why

‏הפרקים 01–55 כבר הגדירו contracts נכונים בנפרד.

‏מקטע 56 מוסיף שכבה אחרת:

```text
“What happens when someone violates one of those contracts
in a way that still looks superficially reasonable?”
```

‏זו שכבת Anti-Self-Deception / Anti-Silent-Failure.

‏רוב הכשלים המסוכנים כאן אינם syntax errors.

‏הם נראים כמו:

```text
backtest that is too good
rank that looks plausible
fill that looks cheap
system that is technically connected
latency average that looks fast
config that parses successfully
```

‏אבל המשמעות הכלכלית או התפעולית שגויה.

---

## ‏4. Use When

‏ה־Mistakes Registry משמש לפחות ב־:

- ‏Design Review.
- ‏Research Review.
- ‏Backtest Review.
- ‏Feature Promotion.
- ‏Scanner/Ranking changes.
- ‏Execution policy changes.
- ‏Broker/Data Provider changes.
- ‏Performance optimization.
- ‏Capital/size experiment planning.
- ‏Incident RCA.
- ‏Near-Miss RCA.
- ‏Pre-Paper readiness.
- ‏Pre-Production design review.

---

## ‏5. Do Not Use When

‏לא משתמשים ברשימה כדי:

- ‏להוסיף 100 guards ל־hot path בלי הבחנה.
- ‏ליצור מערכת governance כבדה יותר מן הרובוט עצמו.
- ‏לסמן checkbox “טופל” בלי Test/Metric.
- ‏להחליף reasoning ב־rule count.
- ‏להתייחס לכל טעות באותה Severity.
- ‏להניח שכל anti-pattern רלוונטי לכל architecture.

‏המטרה היא Risk-based prioritization.

---

## ‏6. Severity Model

```text
P0 — יכול ליצור false evidence, duplicate/unknown exposure,
     stale/unsafe execution או מצב שבו איננו יודעים את ה־truth.

P1 — יכול למחוק Net Edge באופן שיטתי או לשבור reliability משמעותית.

P2 — עלול לגרום degradation, wasted complexity או drift שקשה לאבחן.

P3 — advanced/specialist concern; מטפלים כאשר architecture/evidence מצדיקים.
```

‏Severity אינה frequency בלבד.

‏אירוע נדיר שיכול להכפיל Exposure או לשבש Truth נשאר P0.

---

# ‏7. The 100-Mistake Control Map

## ‏7.1 Research / Backtest — 1–10

| # | Anti-pattern | Priority | Detection / Control |
|---:|---|---:|---|
| 1 | ‏להתאהב ב־Backtest יפה | `P0` | ‏פירוק Prediction/Execution/Costs/Regimes/OOS; אין Promotion מ־equity curve בלבד. |
| 2 | ‏לשנות Hypothesis אחרי Result | `P0` | ‏Pre-Registration Lite + immutable experiment manifest. |
| 3 | ‏לזכור רק winning trials | `P0` | ‏Experiment Registry סופר גם losers/retries/variants. |
| 4 | ‏Reuse של Holdout | `P0` | ‏Holdout contamination flag; dataset שנצפה כבר אינו untouched. |
| 5 | ‏Average Return בלבד | `P1` | ‏Distribution, quantiles, MFE/MAE, tails, drawdown ו־time-to-profit. |
| 6 | ‏Gross במקום Net | `P0` | ‏`NetExecutableEdge` כחובה בכל experiment משמעותי. |
| 7 | ‏Touch = Fill | `P0` | ‏Execution-aware fill model + queue/latency/partial-fill scenarios. |
| 8 | ‏להתעלם מ־Missed Opportunity | `P1` | ‏Filled/Unfilled/Late/Canceled cohorts + opportunity-cost labels. |
| 9 | ‏Future information עקיף | `P0` | ‏As-Known-At semantics, availability-time tests, leakage canaries. |
| 10 | ‏Survivorship Bias | `P0` | ‏Point-in-time historical universe. |

### ‏Controls מרכזיים ל־1–10

```text
ExperimentId
DatasetId
UniverseVersion
CodeVersion
ConfigVersion
CostModelVersion
ExecutionModelVersion
PrimaryMetric
TrialCount
DecisionRecord
```

---

## ‏7.2 Labels / Prediction — 11–20

| # | Anti-pattern | Priority | Detection / Control |
|---:|---|---:|---|
| 11 | ‏Future `Last` במקום executable price | `P0` | ‏Quote/executable labels לצד mid/last labels. |
| 12 | ‏Horizon לא מתאים | `P1` | ‏Label horizon חייב להתאים holding/decision horizon ול־data fidelity. |
| 13 | ‏רק end-of-horizon | `P1` | ‏MFE/MAE, path, time-to-target, giveback. |
| 14 | ‏SignalHalfLife קצר מה־pipeline | `P0` | ‏LatencyPressure + artificial-delay replay + break-even latency. |
| 15 | ‏Top1 = truth | `P1` | ‏Rank separation, stability, Top-K diagnostics, winner’s-curse review. |
| 16 | ‏Accuracy במקום Economics | `P0` | ‏Net EV + payoff distribution + costs. |
| 17 | ‏Regime dependence מוסתרת | `P1` | ‏Regime-conditioned OOS results. |
| 18 | ‏Correlation = tradable edge | `P0` | ‏Causal timing + execution-aware validation. |
| 19 | ‏More features = more information | `P2` | ‏Ablation + Decision Impact Rate + compute/latency cost. |
| 20 | ‏Feature שלא פורש | `P2` | ‏Drift monitor + retirement/revalidation process. |

---

## ‏7.3 Market Data — 21–30

| # | Anti-pattern | Priority | Detection / Control |
|---:|---|---:|---|
| 21 | ‏`Last` מייצג את כל השוק | `P0` | ‏Age, spread, quote context, trade conditions, activity. |
| 22 | ‏Displayed size כאמת קבועה | `P1` | ‏Persistence/depletion/replenishment; displayed != guaranteed. |
| 23 | ‏EventTime = ReceiveTime | `P0` | ‏Clock/timestamp separation + latency decomposition. |
| 24 | ‏Sequence Gap ignored | `P0` | ‏Gap state + resync + quality downgrade/block. |
| 25 | ‏Duplicate event counted twice | `P0` | ‏Idempotent ingestion + duplicate regression test. |
| 26 | ‏Out-of-order silently reordered | `P0` | ‏Explicit ordering/bounded-lateness policy. |
| 27 | ‏Torn snapshot | `P0` | ‏Logical snapshot/version consistency. |
| 28 | ‏Quote Age ignored | `P0` | ‏Per-field freshness + stale reason code. |
| 29 | ‏All providers see same market | `P1` | ‏Provider provenance/fingerprint + bakeoff. |
| 30 | ‏Feed replacement without revalidation | `P0` | ‏Provider change = Research Event. |

---

## ‏7.4 Scanner / Cross-Sectional Ranking — 31–40

| # | Anti-pattern | Priority | Detection / Control |
|---:|---|---:|---|
| 31 | ‏Full recompute ל־~4,000 Symbols בכל tick | `P1` | ‏Incremental state, dirty symbols, bounded rank cadence. |
| 32 | ‏Deep analysis לכל השוק | `P1` | ‏Fast Path + Top-N Deep Path. |
| 33 | ‏Symbols לא נמדדים באותו as-of | `P0` | ‏Cross-sectional watermark/freshness window. |
| 34 | ‏Fresh Coverage לא נמדד | `P0` | ‏Explicit denominator + coverage gate. |
| 35 | ‏Raw values לא comparable | `P1` | ‏Normalization/percentile/notional/own-history baseline. |
| 36 | ‏אין deterministic tie-break | `P1` | ‏Versioned stable ordering + replay test. |
| 37 | ‏Top1 בלי separation | `P1` | ‏Rank gap/confidence. |
| 38 | ‏Rank churn ignored | `P1` | ‏Persistence/churn/dwell metrics; hysteresis challenger. |
| 39 | ‏Highest score = most executable | `P0` | ‏Prediction Rank מול Executable Candidate Gate. |
| 40 | ‏אין `NO_TRADE` | `P0` | ‏Absolute economic/quality gates. |

---

## ‏7.5 Momentum / Microstructure — 41–50

| # | Anti-pattern | Priority | Detection / Control |
|---:|---|---:|---|
| 41 | ‏כל עלייה קצרה = Momentum | `P1` | ‏Multi-horizon consistency + activity. |
| 42 | ‏Return בלי Path | `P1` | ‏Shape/acceleration/pullback/persistence/age. |
| 43 | ‏Trade Activity ignored | `P1` | ‏Trade count/notional/activity surprise. |
| 44 | ‏Book Imbalance כאות ודאי | `P1` | ‏Book dynamics + flow + price response. |
| 45 | ‏Book/Order/Trade Flow imbalance מעורבבים | `P0` | ‏Semantic contracts ושמות נפרדים. |
| 46 | ‏Microprice = Fair Value | `P1` | ‏Calibration מול next-mid/executable outcomes. |
| 47 | ‏Large print לבדו = signal | `P1` | ‏Persistence/context + `UNKNOWN` classification. |
| 48 | ‏Absorption ignored | `P1` | ‏Aggression × weak price response candidate. |
| 49 | ‏Exhaustion ignored | `P1` | ‏Flow/activity decay + failure-to-extend. |
| 50 | ‏Microstructure אחיד בכל Symbol | `P2` | ‏Symbol/regime conditioning only after evidence. |

---

## ‏7.6 Entry / Orders — 51–60

| # | Anti-pattern | Priority | Detection / Control |
|---:|---|---:|---|
| 51 | ‏Order Type לפי הרגל | `P1` | ‏Execution objective first. |
| 52 | ‏Limit תמיד “בטוח” | `P1` | ‏Opportunity cost + markout + fill probability. |
| 53 | ‏Market תמיד “מהיר” ולכן טוב | `P1` | ‏Price protection / marketable-limit research baseline. |
| 54 | ‏Order TTL ignored | `P0` | ‏Intent expiry + pre-submit/working revalidation. |
| 55 | ‏Cancel/Replace chasing | `P1` | ‏Expected-value replace policy + chase budget. |
| 56 | ‏`CancelRequested = Canceled` | `P0` | ‏Explicit state machine + cancel/fill race test. |
| 57 | ‏Partial Fill כחריג | `P0` | ‏Position/Risk update on every fill; remaining qty explicit. |
| 58 | ‏אין Hard Price Bounds | `P0` | ‏Max acceptable price/slippage/chase cap. |
| 59 | ‏Order tactic changed בלי economics | `P1` | ‏Champion/Challenger on net retained edge. |
| 60 | ‏Advanced order = better | `P2` | ‏Simple champion; capability/versioned challenger. |

---

## ‏7.7 Execution / Fills — 61–70

| # | Anti-pattern | Priority | Detection / Control |
|---:|---|---:|---|
| 61 | ‏`Sent = Accepted` | `P0` | ‏ACK/effect state separate; `UNKNOWN_EFFECT`. |
| 62 | ‏Blind retry after timeout | `P0` | ‏Stable IntentId + reconcile-before-retry taxonomy. |
| 63 | ‏IntentId = BrokerOrderId | `P0` | ‏Business intent identity separate from attempts. |
| 64 | ‏Fill Rate בלי outcome | `P1` | ‏Side-aware post-fill markouts. |
| 65 | ‏Adverse Selection ignored | `P1` | ‏Expected adverse-selection cost + toxic-fill rate. |
| 66 | ‏Entry Fill בלבד | `P0` | ‏Round-trip execution metrics. |
| 67 | ‏`TimeToFlat` לא נמדד | `P0` | ‏Exit-decision-to-flat KPI. |
| 68 | ‏Local Position = Broker Position | `P0` | ‏Broker truth + continuous reconciliation. |
| 69 | ‏Pending Exposure ignored | `P0` | ‏Risk reservation includes potentially-live quantity. |
| 70 | ‏Self-interaction בין intents | `P0` | ‏Symbol/account execution ownership + exposure invariants. |

---

## ‏7.8 Latency / Performance — 71–80

| # | Anti-pattern | Priority | Detection / Control |
|---:|---|---:|---|
| 71 | ‏Microseconds בלי SignalHalfLife | `P2` | ‏LatencyPressure + economic ROI. |
| 72 | ‏Average latency בלבד | `P0` | ‏P50/P95/P99/jitter + market-regime split. |
| 73 | ‏Microbenchmark = system proof | `P1` | ‏End-to-end profiling. |
| 74 | ‏Unbounded Queue | `P0` | ‏Bounded queues + age/deadline + load shedding. |
| 75 | ‏Old work beats fresh work | `P0` | ‏Stale-work cancellation + business priority. |
| 76 | ‏Parallelism breaks ordering | `P0` | ‏Partition/single-writer + deterministic merge/replay. |
| 77 | ‏Locks בלי contention measurement | `P2` | ‏Contention profiling. |
| 78 | ‏Lock-free assumed faster | `P3` | ‏Production-like benchmark + correctness tests. |
| 79 | ‏GC tail ignored | `P1` | ‏Allocation/GC telemetry under bursts. |
| 80 | ‏Throughput optimized over Freshness | `P0` | ‏Queue age + decision age + coverage as first-class metrics. |

---

## ‏7.9 Risk / Capacity — 81–90

| # | Anti-pattern | Priority | Detection / Control |
|---:|---|---:|---|
| 81 | ‏Linear size scaling | `P0` | ‏Capacity curve + controlled size experiment. |
| 82 | ‏Size רק לפי Capital | `P0` | ‏`min(Risk, Liquidity, Impact, Exposure, Capital, Strategy, Account)`. |
| 83 | ‏Small spread = cheap execution | `P1` | ‏Depth/sweep/impact/executable cost. |
| 84 | ‏High volume = high current capacity | `P1` | ‏Current participation/depth/resilience. |
| 85 | ‏Entry Capacity בלבד | `P0` | ‏Exit/stress capacity + time-to-flat. |
| 86 | ‏אין session risk limits | `P0` | ‏Layered session/daily risk budget. |
| 87 | ‏Correlated exposure ignored | `P1` | ‏Aggregate factor/market exposure context. |
| 88 | ‏Risk constant כשה־Data Quality יורדת | `P0` | ‏Degrade/block new entries under uncertainty. |
| 89 | ‏Kill Switch יחיד | `P0` | ‏Scoped safety states: block/exit-only/cancel/flatten. |
| 90 | ‏Resume מהר מדי | `P0` | ‏Reconcile → prove invariants → explicit resume. |

---

## ‏7.10 Production / Operations / Learning Loop — 91–100

| # | Anti-pattern | Priority | Detection / Control |
|---:|---|---:|---|
| 91 | ‏Live Config לא versioned | `P0` | ‏Immutable config/version fingerprint. |
| 92 | ‏Paper/Live separation חלשה | `P0` | ‏Hard env/account/credential separation. |
| 93 | ‏Secrets בלוג/config רגיל | `P0` | ‏Secret store + redaction + rotation tests. |
| 94 | ‏לא יודעים מי/מה שלח Order | `P0` | ‏Correlation IDs + build/strategy/operator/system identity. |
| 95 | ‏`Process Alive = SafeToTrade` | `P0` | ‏Security/Operational/Execution readiness gates. |
| 96 | ‏Near Miss ללא RCA | `P1` | ‏Near-miss → RCA → control/test. |
| 97 | ‏Local symptom fix בלבד | `P0` | ‏Systemic RCA + similar-area search. |
| 98 | ‏אין Live-vs-Replay/Shadow diff | `P1` | ‏Production fingerprint + decision/state comparison. |
| 99 | ‏“המערכת גמורה” אחרי תקופה טובה | `P1` | ‏Continuous validation + drift + champion/challenger. |
| 100 | ‏Complexity לפני Measurement | `P0` | ‏Observe → Hypothesize → Measure → Reproduce → Stress → Keep only survivors. |

---

# ‏8. The 20 High-Risk Mistakes for Our Robot

‏הפרק מסמן 20 טעויות בעלות רלוונטיות מיוחדת ל־millisecond-to-seconds momentum.

‏אצלנו הן יקבלו review מפורש:

1. ‏`SignalHalfLife < PipelineLatency`.
2. ‏Top1 נבחר על timestamps לא־השוואתיים.
3. ‏`Last` חיובי אבל spread/cost מוחקים את ה־edge.
4. ‏Rank winner מתחלף לפני Submit.
5. ‏Passive Fill מגיע עקב adverse selection.
6. ‏Aggressive/marketable Entry chase אחרי מהלך שכבר נגמר.
7. ‏Exit מגיב מאוחר ל־giveback.
8. ‏`CancelRequested` נתפס כ־Canceled.
9. ‏Partial Fill לא נכלל ב־Exposure.
10. ‏Queue Age גדל בזמן burst.
11. ‏Runtime/GC tail spike בדיוק בזמן event קריטי.
12. ‏Provider gap יוצר momentum מדומה.
13. ‏Book Imbalance transient מקבל confidence מופרז.
14. ‏Cross-sectional Rank נבנה על partial fresh coverage.
15. ‏Backtest מניח Fill בלתי־אפשרי.
16. ‏Round-trip cost גדול מן target move.
17. ‏Exit capacity נמוכה מ־Entry capacity.
18. ‏אין `NO_TRADE` ולכן Candidate חלש נבחר בכוח.
19. ‏Complexity גדלה מהר יותר מן Evidence.
20. ‏Telemetry קיימת אך אין RCA chain לעסקה בודדת.

### ‏Priority Map

```text
P0 immediate control:
1, 2, 3, 4, 5, 7, 8, 9, 10, 12, 14, 15, 16, 17, 18, 20

P1 strong validation:
6, 11, 13, 19
```

‏החלוקה היא Judgment עבור הארכיטקטורה שלנו; היא יכולה להשתנות עם Evidence.

---

# ‏9. Four Golden Failure Scenarios

## ‏`GF56-01 — Stale Signal Reaches Submit`

```text
candidate created
→ queue delay grows
→ signal expires
→ submit path attempts entry
```

‏Expected:

```text
NO SUBMIT
reason = STALE_INTENT / SIGNAL_EXPIRED
```

‏Evidence:

```text
candidate_age
signal_age
queue_age
valid_until
recheck_result
```

## ‏`GF56-02 — Winner from Partial Fresh Universe`

```text
4000 symbols expected
only subset fresh
→ rank produces Top1
```

‏Expected:

```text
rank_trusted = false
NO_TRADE_DATA_COVERAGE
```

‏אלא אם Policy מחקרית מפורשת מגדירה אחרת.

## ‏`GF56-03 — Good Price, Toxic Fill`

```text
passive fill obtains favorable-looking price
→ 100ms/500ms/1s markout moves materially against fill
```

‏Expected:

```text
fill_quality != GOOD solely because fill price looked attractive
adverse_selection evidence preserved
```

## ‏`GF56-04 — Exit Sent, Not Flat`

```text
exit decision emitted promptly
→ order sent
→ partial/no fill
→ position remains
```

‏Expected:

```text
time_to_exit_intent != time_to_flat
system remains POSITION/EXITING
risk remains active
```

‏`FLAT` אסור להיקבע לפי Intent או Submit בלבד.

---

# ‏10. Cross-Layer Review Gates

## ‏10.1 Research Gate

‏אין Promotion אם:

```text
holdout contaminated
trial count unknown
future leakage unresolved
cost model optimistic-only
fill model unrealistic
result cannot be reproduced
```

## ‏10.2 Data Gate

‏אין Candidate executable אם:

```text
critical gap unresolved
snapshot torn
freshness unknown
provider generation stale
provenance incompatible
```

## ‏10.3 Scanner Gate

‏אין trusted Top1 אם:

```text
coverage inadequate
rank_as_of inconsistent
winner unstable beyond policy
missing/invalid values silently coerced
```

## ‏10.4 Execution Gate

‏אין Risk חדש אם:

```text
intent stale
broker effect unknown
pending exposure unresolved
cancel state ambiguous
account/broker state unreconciled
```

## ‏10.5 Performance Gate

‏אין claim של “fast enough” בלי:

```text
P95/P99
queue age
freshness
burst workload
signal half-life context
```

## ‏10.6 Risk / Capacity Gate

‏אין Size scaling אם:

```text
capacity curve absent
exit capacity unknown
impact model uncalibrated
pending exposure omitted
stress scenario fails
```

## ‏10.7 Operations Gate

‏אין Resume/New Risk אם:

```text
wrong/unknown environment
wrong/unknown account
unknown build/config
duplicate execution owner
reconciliation incomplete
safety latch unresolved
```

---

# ‏11. Fact / Judgment / Hypothesis

### ‏Fact / Contract from Earlier Sheets

‏ה־Playbook כבר קבע בין היתר:

```text
Touch != Fill
CancelRequested != Canceled
Sent != Accepted
Unknown != Good
Missing != Zero
Process Alive != Safe To Trade
Displayed Liquidity != Total Liquidity
Top1 != Automatically Trade
```

### ‏Judgment

‏ה־Mistakes Registry צריך להיות cross-cutting artifact פעיל ולא appendix סטטי.

‏ה־P0/P1 mapping במסמך זה הוא priority engineering עבור הרובוט שלנו.

### ‏Hypothesis

‏אנו מצפים שה־Registry יוריד בעיקר:

```text
silent data/ranking errors
false-positive strategy RCA
execution state ambiguity
repeat incidents
unnecessary complexity
```

‏ההשפעה בפועל תימדד לפי incident/near-miss recurrence, detection latency ו־escaped defects.

---

# ‏12. Required Data / Evidence

‏כדי שה־controls לא יהיו תאורטיים בלבד, נשמור לפי הצורך:

```text
dataset/version lineage
freshness and coverage
feature/rank snapshots
candidate age
signal TTL
order intent + attempts
broker ACK/fill/cancel events
pending exposure
post-fill markouts
execution costs
capacity estimates
queue age / P99 latency
build/config/account/environment fingerprints
reconciliation state
incident/near-miss records
```

---

# ‏13. Promotion Criteria

‏ה־Failure Prevention layer נחשבת מוכנה לשלב הבא כאשר:

1. ‏כל ארבעת `GF56` ניתנים לשחזור דטרמיניסטי.
2. ‏לכל P0 anti-pattern רלוונטי יש Preventive Control או explicit accepted limitation.
3. ‏לכל P0 control יש Test/Metric או proof אחר שניתן לאמת.
4. ‏`NO_TRADE` ו־`BLOCK_NEW_ENTRIES` נשמרים כ־valid success outcomes.
5. ‏RCA יכול להפריד Data/Scanner/Execution/Cost/Risk/Ops מ־Alpha.
6. ‏Near Miss משמעותי מקבל regression artifact.
7. ‏יש owner ברור לכל control critical.
8. ‏אין “green dashboard” שמסתיר unknown state קריטי.

---

# ‏14. Rejection / Block Criteria

‏Promotion נחסם כאשר:

```text
future leakage unresolved
fresh coverage unavailable
stale intent can submit
cancel/fill race untested
partial fills can escape risk accounting
unknown broker effect can auto-retry
local/broker position can diverge silently
exit success measured by submit rather than flat
unbounded queues can create stale decisions
paper/live identity can be confused
config/build cannot be reconstructed
near-miss recurrence has no systemic RCA
```

---

# ‏15. Metrics

## ‏15.1 Prevention Metrics

```text
P0 controls with tests / total P0 controls
critical invariant coverage
known failure modes without owners
known failure modes without regression tests
```

## ‏15.2 Escape Metrics

```text
escaped critical defects
repeat incident rate
repeat near-miss rate
unknown-state occurrences
silent-recovery occurrences
```

## ‏15.3 Detection Metrics

```text
time_to_detect
time_to_classify
time_to_first_divergence
time_to_reproduce
```

## ‏15.4 Economic Diagnostics

```text
net edge retained
selection regret
toxic fill rate
missed opportunity
time_to_flat
cost attribution completeness
```

## ‏15.5 Research Integrity

```text
unregistered trials
holdout reuse count
reproducibility pass rate
provider/version changes without revalidation
```

---

# ‏16. Failure Modes of the Mistakes Registry Itself

‏גם ה־Registry יכול להיכשל.

### ‏`MR-01 — Checklist Theater`

‏מסמנים “done” בלי Evidence.

### ‏`MR-02 — Everything is P0`

‏כאשר הכול critical, שום דבר אינו מתועדף.

### ‏`MR-03 — Static Registry`

‏המערכת השתנתה אבל הרשימה לא.

### ‏`MR-04 — Duplicate Controls`

‏אותו invariant מיושם בחמישה מקומות עם semantics שונים.

### ‏`MR-05 — No Ownership`

‏כשל מוכר ללא subsystem owner.

### ‏`MR-06 — No Test Link`

‏Control קיים במסמך בלבד.

### ‏`MR-07 — Symptom Taxonomy`

‏RCA code מתאר symptom ולא first divergence/root class.

### ‏`MR-08 — Over-Gating Research`

‏Guardrails productionיים כבדים מוכנסים מוקדם מדי לכל exploration ומאטים למידה בלי להגן על side effect אמיתי.

---

# ‏17. Unified RCA Taxonomy

‏הפרק מציע vocabulary ראשוני. אצלנו נשמור אותו כ־family taxonomy:

```text
RS_*   Research / Statistical Integrity
DT_*   Data Truth / Timing
SC_*   Scanner / Coverage / Ranking
SG_*   Signal Decay / Predictive State
BK_*   Book State
OF_*   Order Flow
EX_*   Execution / Fill / Exit
LT_*   Latency / Queue / Tail
RK_*   Risk / Capacity / Exposure
OP_*   Operations / Environment / Recovery
```

‏דוגמאות:

```text
RS_LEAKAGE
RS_OVERFIT
RS_MULTIPLE_TESTING
DT_STALE
DT_GAP
DT_DUPLICATE
DT_ORDERING
SC_PARTIAL_COVERAGE
SC_RANK_CHURN
SC_TOP1_WINNERS_CURSE
SG_DECAY
BK_TRANSIENT
OF_MISCLASSIFIED
EX_STALE_INTENT
EX_DUPLICATE
EX_CANCEL_FILL_RACE
EX_PARTIAL_FILL
EX_ADVERSE_SELECTION
EX_EXIT_DELAY
LT_QUEUE_AGE
LT_TAIL_SPIKE
RK_PENDING_EXPOSURE
RK_CAPACITY
OP_WRONG_ENV
OP_RECONCILIATION
OP_CONFIG_DRIFT
OP_NEAR_MISS
```

‏בהמשך RCA יכול להוסיף subtype, אבל ה־family נשאר stable ככל האפשר.

---

# ‏18. Invariants

```text
No future knowledge enters a decision.
```

```text
Unknown critical data/execution state cannot become GOOD implicitly.
```

```text
Insufficient fresh cross-sectional coverage cannot produce a trusted market-wide Top1.
```

```text
Expired signal cannot create new entry risk.
```

```text
CancelRequested does not release exposure as if cancellation were confirmed.
```

```text
Partial fill immediately changes actual exposure.
```

```text
UNKNOWN_EFFECT cannot trigger blind duplicate submit.
```

```text
FLAT requires broker/account truth consistent with no position and no potentially-live exposure.
```

```text
Performance degradation cannot starve exits/risk truth behind scanner analytics.
```

```text
Paper/Live identity mismatch blocks new risk.
```

```text
A significant incident or near miss creates durable learning evidence.
```

---

# ‏19. Tests

### ‏Unit / Property

- ‏Timestamp causality.
- ‏Duplicate idempotence.
- ‏Stable ranking ties.
- ‏Missing/Unknown handling.
- ‏Signal expiration.
- ‏Pending exposure arithmetic.
- ‏`Flat Means Flat`.
- ‏No blind retry from unknown effect.

### ‏Replay / Golden

- ‏Four `GF56` scenarios.
- ‏Partial coverage ranking.
- ‏Provider gap creates false momentum candidate.
- ‏Rank churn before submit.
- ‏Passive toxic fill.
- ‏Late exit / giveback.
- ‏Queue backlog under burst.
- ‏Data generation change invalidates stale candidate.

### ‏Fault / Recovery

- ‏Disconnect after submit.
- ‏Cancel/fill race.
- ‏Partial fill + restart.
- ‏Duplicate execution callback.
- ‏Wrong environment/account.
- ‏Duplicate execution owner.
- ‏Resume with unresolved broker truth.

### ‏Research Sanity

- ‏Leakage canary.
- ‏Shuffle test.
- ‏Time-shift test.
- ‏Optimistic/base/conservative fill model sensitivity.
- ‏Fee/slippage/latency sensitivity.

---

# ‏20. Operational Review: Before Blaming Alpha

‏לכל failed top-ranked candidate או unexpected loss נשאל בסדר הבא:

```text
1. Was the market data valid and fresh?
2. Was the universe/coverage correct?
3. Was ranking deterministic and comparable?
4. Was the signal still alive?
5. Was execution feasible at decision time?
6. Did the order lifecycle behave as intended?
7. Was the fill toxic / delayed / partial?
8. Did exit remain executable?
9. Were all costs/impact included?
10. Did risk/capacity assumptions hold?
11. Was there any ops/performance incident?
12. Only then: was the predictive hypothesis wrong?
```

---

# ‏21. User-Specific Application

‏לרובוט שלנו, שסורק אלפי מניות ומחפש opportunity קצרה מאוד, הטעויות המסוכנות ביותר אינן “indicator לא נכון” בלבד.

‏הן בעיקר failures של **age, comparability, executability ו־state truth**.

‏לכן סדר ההשקעה המומלץ:

```text
P0 — Causality / Freshness / Coverage
→ P0 — Execution State / Exposure / Flatness
→ P0 — Costs / Capacity / Safe Resume
→ P1 — Rank Stability / Markout / Performance Tails
→ P2 — Advanced Microstructure / Optimization
```

‏במיוחד אין להגדיל sophistication לפני שאפשר לענות לכל Trade/No-Trade:

```text
What did we know?
Why did it rank here?
Was it fresh?
Was it executable?
What happened at fill?
What happened before flat?
What did the round trip cost?
Where did the first divergence occur?
```

---

# ‏22. What I Would Avoid Initially

‏לא נבנה כרגע:

- ‏מערכת scoring אוטומטית לכל 100 mistakes.
- ‏AI שמחליט לבד איזה control חסר.
- ‏Enterprise GRC platform.
- ‏100 runtime gates בלתי־תלויים.
- ‏Dashboard עם מאה warning lights.
- ‏Severity model מתמטי מורכב ללא incidents אמיתיים.
- ‏Automation שסוגר RCA אוטומטית.

‏KISS:

```text
small registry
+ strong P0 invariants
+ golden failures
+ reason codes
+ incident-to-test loop
```

---

# ‏23. What to Add Later

### ‏`P2`

- ‏Registry machine-readable.
- ‏Automatic links בין incident ↔ RCA ↔ test ↔ control.
- ‏Control coverage report.
- ‏Repeat-failure detection.

### ‏`P3`

- ‏Risk-weighted control scoring.
- ‏Automated architecture lint for common anti-patterns.
- ‏Cross-environment drift report.
- ‏Automated live-vs-replay divergence clustering.

### ‏`P4`

- ‏Formal verification/model checking ל־state-machine invariants נבחרים.
- ‏Advanced fault campaign generation.

---

# ‏24. Relationship to Earlier Sheets

‏מקטע 56 אינו מחליף את sheets הקודמים.

‏הוא משמש אינדקס cross-cutting אליהם:

```text
01–19  Strategy / Market / Execution / Risk contracts
20–28  Backtest / Validation / Replay / Shadow evidence
29–43  Broker / State / Recovery / Safety / Advanced execution
44–47  Flow / Book / Adverse Selection / Capacity
48      Latency edge preservation
49      Research operating system
50      Scanner runtime
51      Execution runtime
52      Data evidence integrity
53      Testing strategy
54      Performance discipline
55      Security / Operations control plane
56      Failure Prevention Map across all of the above
```

---

# ‏25. Relationship to Segment 57

‏מקטע 56 אומר:

```text
What repeatedly goes wrong?
```

‏מקטע 57 יענה:

```text
What practical habits make the right behavior the easy/default behavior?
```

‏לכן 57 הוא הצד החיובי המשלים ל־56, לא replacement.

---

# ‏26. Confidence

```text
Overall Recommendation Confidence: HIGH
```

‏הסיבה: ה־Sheet אינו מניח Edge חדש; הוא מאחד contracts ו־failure modes שכבר הוגדרו ונבדקו רעיונית לאורך הפרקים הקודמים.

‏ה־priority המדויק של טעויות P1/P2 עשוי להשתנות עם architecture ו־incident data.

---

# ‏27. Time-Sensitive Facts

‏לא נקבע במקטע זה Fact רגולטורי, Broker limit, Venue rule או Provider capability חדש.

‏לכן לא נדרש Web verification חדש.

‏אם anti-pattern עתידי יתבסס על:

```text
broker behavior
provider semantics
venue rules
fees
rate limits
regulatory constraints
```

‏יש לבצע verification עדכני במסמך הרלוונטי לפני שימוש תפעולי.

---

# ‏28. Recommendation Summary

```text
Baseline
→ Mistakes Registry + P0 Control Map

Preferred Default
→ Four Golden Failure Scenarios
  + Cross-Layer Promotion Gates
  + Incident/Near-Miss → RCA → Regression Test

Challenger
→ Machine-Readable Registry + Control Coverage Report

Advanced Option
→ Automated drift/failure clustering

Specialist Option
→ Formal verification / model checking for selected invariants

Avoid Unless Evidence
→ Enterprise governance complexity
  + hundreds of runtime guards
  + “AI safety layer” without deterministic contracts
```

‏העיקרון המסכם:

```text
Observe
→ Hypothesize
→ Measure
→ Reproduce
→ Stress
→ Execute Realistically
→ Attribute First Divergence
→ Add Control
→ Add Regression Test
→ Keep Only What Survives
```

‏מערכת מקצועית אינה מערכת שאין בה failures.

‏היא מערכת שבה failures אינם נשארים מסתוריים, אינם חוזרים באותה צורה, ואינם הופכים אוטומטית ל־Risk חדש.