# ‏57 — Recommendation Sheet: 100 Practical Tips for a Personal Algo Builder

> ‏מקור לימודי עיקרי: `../57-100-PRACTICAL-TIPS-FOR-A-PERSONAL-ALGO-BUILDER.md`.
>
> ‏מטרת הקובץ: להפוך את מאה הטיפים של הפרק ל־Operating Playbook מעשי עבור רובוט `Short-Horizon Momentum`: לא אוסף טריקים, אלא מערכת הרגלים קטנים שמקטינה ambiguity, שומרת freshness ו־state truth, מחזקת reproducibility ו־RCA, ומכריחה כל complexity חדש להוכיח incremental net value.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה להפעלה בכסף אמיתי ואינו מבטיח רווח.

---

## ‏1. Decision

‏מקטע 57 לא יהפוך אצלנו ל־100 חוקים קשיחים.

‏הוא יהפוך ל־**Operating Habits Registry**.

‏ה־Baseline:

```text
Tip / Habit
→ Why it matters
→ Default behavior
→ Trigger
→ Evidence
→ Automation candidate
→ Owner
```

‏העיקרון המחייב:

```text
Habits > Tricks
```

‏והכלל העליון:

```text
Every useful habit should reduce at least one of:
ambiguity
hidden state
stale evidence
unmeasured assumptions
blind retries
unexplained decisions
unreproducible outcomes
```

‏טיפ שאינו עושה אחד מאלה, ואינו משפר `Net Edge`, אינו Priority רק מפני שהוא נשמע מקצועי.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ארבעה Habits שאינם ניתנים למשא ומתן

‏עבור הרובוט שלנו ארבעה הרגלים יהפכו ל־P0:

```text
H57-P0-01 — measure signal age / half-life
H57-P0-02 — pre-submit revalidation
H57-P0-03 — measure TimeToFlat
H57-P0-04 — store NO_TRADE as a full decision
```

‏למה דווקא אלה:

- ‏ה־Strategy שלנו קצרה; signal טוב שמתיישן לפני execution אינו edge שמיש.
- ‏Winner שנבחר לפני מאות milliseconds עשוי כבר לא להיות winner בזמן submit.
- ‏Exit שנשלח אינו הצלחה אם Position לא נהיית `Flat` בזמן.
- ‏בלי `NO_TRADE` מלא אין dataset נכון של החלטות שנדחו, opportunity cost ו־selection quality.

### ‏`P0 — Required`: Champion פשוט, Challenger ניסיוני

```text
Champion
=
Simple + Known + Reproducible + Measured

Challenger
=
One controlled change + explicit hypothesis
```

‏כל Tip שמציע Feature, Order tactic, model או optimization חדש מתחיל כ־Challenger.

‏הוא אינו מקבל Production authority עד שהוא מוכיח:

```text
incremental predictive value
or
incremental execution value
or
material safety / reliability value
```

‏אחרי Costs, Latency ו־Complexity Tax.

### ‏`P0 — Required`: One Question Before Complexity

‏לפני כל תוספת:

```text
What is the simplest experiment that can prove or falsify this idea?
```

‏זהו KISS Gate מחייב.

---

## ‏3. למה זו ההמלצה

‏הפרק מחזק תבנית שחוזרת לאורך כל ה־Playbook:

```text
Professional system
!=
maximum sophistication

Professional system
=
explicit state
+ measurable decisions
+ reproducible evidence
+ controlled experiments
+ safe execution
+ fast learning loop
```

‏100 טיפים נפרדים נראים קטנים, אבל כאשר הם מופעלים כ־habits קבועים הם מונעים class שלם של failures:

- ‏Research drift.
- ‏Data ambiguity.
- ‏Scanner bias.
- ‏Stale execution.
- ‏Duplicate side effects.
- ‏Risk blind spots.
- ‏Untraceable incidents.
- ‏Complexity ללא Evidence.

---

## ‏4. Use When

‏ה־Operating Habits Registry ישמש ב־:

```text
Experiment design
Code review
Feature review
Scanner changes
Execution changes
Risk changes
Performance work
Incident RCA
Daily review
Promotion review
Retirement review
```

‏הוא מתאים במיוחד כאשר שינוי נראה “קטן מדי בשביל מסמך design” אך עדיין יכול להשפיע על correctness, freshness או execution economics.

---

## ‏5. Do Not Use When

‏לא משתמשים בטיפים כתחליף ל־:

- ‏Evidence אמפירי.
- ‏Broker/API documentation.
- ‏Regulatory verification.
- ‏Point-in-time testing.
- ‏Risk/Safety authority.
- ‏Controlled experiment.

‏טיפ הוא habit או heuristic.

‏הוא אינו Fact אוניברסלי רק כי הוא מופיע ברשימה.

---

## ‏6. Hierarchy

```text
Baseline
→ Explicit measurable habits

Preferred Default
→ Automate repeated high-value habits

Challenger
→ New habit/process with measurable benefit

Advanced Option
→ Adaptive automation around proven habits

Specialist Option
→ Domain-specific optimization

Avoid Unless Evidence
→ Rituals / process overhead with no measurable value
```

---

## ‏7. 100 Tips → Operating Habits Registry

### ‏A — Research / Hypotheses

| # | Habit | Priority | Default |
|---|---|---:|---|
| 1 | ‏כתוב hypothesis לפני ניסוי | `P0` | ‏נשמר ב־Experiment Manifest |
| 2 | ‏קבע Primary Metric מראש | `P0` | ‏Metric אחד מכריע + Guardrails |
| 3 | ‏שמור Negative Results | `P1` | ‏Experiment Registry כולל losers |
| 4 | ‏שנה משתנה מהותי אחד | `P0` | ‏Champion/Challenger controlled diff |
| 5 | ‏Experiment ID קבוע | `P0` | ‏קושר code/data/config/result |
| 6 | ‏Baseline פשוט | `P0` | ‏Champion משעמם ויציב |
| 7 | ‏Ablation ל־Feature חדש | `P1` | ‏בדוק incremental contribution |
| 8 | ‏חפש failure cases ידנית | `P1` | ‏RCA samples לצד aggregates |
| 9 | ‏Research question לפני implementation | `P1` | ‏קודם האם האפקט קיים |
| 10 | ‏הגדר rejection criterion מראש | `P0` | ‏מונע endless tuning |

### ‏B — Labels / Metrics / Validation

| # | Habit | Priority | Default |
|---|---|---:|---|
| 11 | ‏מדוד `Net`, לא רק `Gross` | `P0` | ‏Costs/Spread/Slippage/Latency כלולים |
| 12 | ‏שמור כמה horizons | `P1` | ‏רק horizons שנתמכים ב־data fidelity |
| 13 | ‏שמור `time_to_first_profit` | `P1` | ‏Metric מחייב ל־short horizon |
| 14 | ‏שמור `time_to_target` | `P1` | ‏מוכיח אם target מהיר ריאלי |
| 15 | ‏שמור `MFE` + `MAE` | `P1` | ‏Path-aware evaluation |
| 16 | ‏מדוד Giveback | `P1` | ‏Input ל־Exit research |
| 17 | ‏אל תסתפק Hit Rate | `P0` | ‏EV + payoff distribution |
| 18 | ‏בדוק Distribution | `P0` | ‏Quantiles/tails/regimes |
| 19 | ‏נתח לפי Regime | `P1` | ‏לא מניח stability אוניברסלית |
| 20 | ‏שמור untouched Holdout | `P0` | ‏Viewed test set אינו untouched |

### ‏C — Market Data

| # | Habit | Priority | Default |
|---|---|---:|---|
| 21 | ‏`EventTime` ו־`ReceiveTime` נפרדים | `P0` | ‏As-known-at semantics |
| 22 | ‏שמור Sequence כאשר קיים | `P0` | ‏Gap detection ו־RCA |
| 23 | ‏אל תמחק Raw מוקדם | `P1` | ‏Retention לפי replay/RCA need |
| 24 | ‏שמור `ProviderId` | `P0` | ‏Provenance נשמר אחרי normalization |
| 25 | ‏שמור `SchemaVersion` | `P0` | ‏Parser/normalizer changes versioned |
| 26 | ‏Stale value הוא state שונה | `P0` | ‏Age הוא חלק מה־evidence |
| 27 | ‏Quality state מפורש | `P0` | ‏GOOD/DEGRADED/STALE/GAPPED/UNKNOWN |
| 28 | ‏Cross-provider comparison מדי פעם | `P2` | ‏Diagnostic / calibration tool |
| 29 | ‏No update != No activity | `P0` | ‏מבדילים quiet/stale/gap |
| 30 | ‏Data מספיק ל־deterministic replay | `P0` | ‏Replay contract מחייב |

### ‏D — Scanner / Ranking

| # | Habit | Priority | Default |
|---|---|---:|---|
| 31 | ‏Incremental computation | `P1` | ‏לא full recompute בכל tick |
| 32 | ‏Fast Path לכל ה־Universe | `P1` | ‏Deep רק Top-N |
| 33 | ‏שמור Top-N | `P1` | ‏לא Top-1 בלבד |
| 34 | ‏שמור `RankGap` | `P1` | ‏Confidence/context |
| 35 | ‏שמור `RankAge` | `P0` | ‏Age של winner הוא Evidence |
| 36 | ‏שמור `RankChurn` | `P1` | ‏מזהה chase instability |
| 37 | ‏Tie-breakers דטרמיניסטיים | `P0` | ‏Same input => same ranking |
| 38 | ‏אל תדרג stale עם fresh | `P0` | ‏Freshness eligibility gate |
| 39 | ‏שמור rejection reasons | `P1` | ‏Explain why not candidate |
| 40 | ‏`NO_TRADE` הוא Decision מלא | `P0` | ‏Snapshot + reason codes + metrics |

### ‏E — Momentum / Microstructure

| # | Habit | Priority | Default |
|---|---|---:|---|
| 41 | ‏לא להסתמך רק על `Last` | `P0` | ‏Execution economics uses quotes |
| 42 | ‏Price movement × Activity | `P1` | ‏Return לבד אינו מספיק |
| 43 | ‏Acceleration לצד Velocity | `P2` | ‏רק אם מוסיף incremental value |
| 44 | ‏שמור Persistence | `P1` | ‏Burst קצר != pressure יציב |
| 45 | ‏Flow × Price Response | `P1` | ‏Aggression בלי progress ≠ continuation |
| 46 | ‏Trade Flow != Book Imbalance | `P0` | ‏Semantic fields נפרדים |
| 47 | ‏נרמל Book Sizes | `P2` | ‏Raw shares אינם comparable |
| 48 | ‏Microprice הוא Feature | `P1` | ‏לא Fair Value |
| 49 | ‏מדוד Signal Half-Life | `P0` | ‏Input ל־latency budget |
| 50 | ‏חפש Agreement בין signals | `P2` | ‏Hypothesis בלבד עד ablation |

### ‏F — Entry / Orders

| # | Habit | Priority | Default |
|---|---|---:|---|
| 51 | ‏`OrderIntent` לפני Broker Order | `P0` | ‏Business intent נפרד מ־API primitive |
| 52 | ‏שמור `SignalTime` ב־Intent | `P0` | ‏Signal age measured |
| 53 | ‏שמור `SignalTTL` | `P0` | ‏Expired intent אינו Entry |
| 54 | ‏Pre-submit revalidation | `P0` | ‏Fresh rank/price/risk/status check |
| 55 | ‏Hard price bounds | `P0` | ‏No unlimited chasing |
| 56 | ‏Urgency != Order Type | `P1` | ‏Intent semantics separate |
| 57 | ‏Fill Probability + Opportunity Cost | `P1` | ‏No-fill אינו free |
| 58 | ‏מדוד Cancel/Replace cost | `P2` | ‏כולל queue loss |
| 59 | ‏Partial Fill first-class | `P0` | ‏Exposure updates immediately |
| 60 | ‏Advanced order must beat baseline | `P1` | ‏No sophistication by availability |

### ‏G — Execution / Broker

| # | Habit | Priority | Default |
|---|---|---:|---|
| 61 | ‏Stable client identity | `P0` | ‏Intent/Attempt IDs נפרדים |
| 62 | ‏Journal לפני side effect | `P0` | ‏Write-before-send |
| 63 | ‏No blind retry after timeout | `P0` | ‏Reconcile first |
| 64 | ‏`UNKNOWN_EFFECT` first-class | `P0` | ‏No fake success/failure |
| 65 | ‏Broker truth after reconnect | `P0` | ‏Orders/Fills/Positions reconcile |
| 66 | ‏חשב `PendingExposure` | `P0` | ‏Risk כולל potentially-live orders |
| 67 | ‏Exit/Cancel priority | `P0` | ‏Risk reduction > new risk |
| 68 | ‏מדוד `TimeToFlat` | `P0` | ‏Exit submit אינו completion |
| 69 | ‏שמור raw broker events | `P1` | ‏Races/quirks replayable |
| 70 | ‏Adapter conformance suite | `P1` | ‏Broker semantics contract |

### ‏H — Risk / Economics

| # | Habit | Priority | Default |
|---|---|---:|---|
| 71 | ‏Risk Gate ממש לפני Entry | `P0` | ‏Last-mile authorization |
| 72 | ‏Size = min(multiple caps) | `P0` | ‏Risk/Liquidity/Impact/Exposure/Capital |
| 73 | ‏שמור `ExpectedNetEdge` בזמן decision | `P1` | ‏Ex-ante auditability |
| 74 | ‏Minimum edge מעל uncertainty | `P1` | ‏Margin of safety |
| 75 | ‏Entry Capacity != Exit Capacity | `P0` | ‏Exit feasibility נבדקת |
| 76 | ‏Capacity לפני scaling | `P0` | ‏No linear scaling assumption |
| 77 | ‏Daily/session risk budget | `P0` | ‏Layered stop-new-risk controls |
| 78 | ‏Economic `NO_TRADE` reasons | `P1` | ‏Spread/slippage/impact/adverse selection |
| 79 | ‏מדוד `NetEdgeRetained` | `P1` | ‏כמה Alpha שרד execution |
| 80 | ‏Strategy Loss != Execution Loss | `P0` | ‏Attribution separate |

### ‏I — Testing / Performance / Observability

| # | Habit | Priority | Default |
|---|---|---:|---|
| 81 | ‏Fake Clock בבדיקות | `P1` | ‏Fast deterministic TTL/recovery tests |
| 82 | ‏Incident → Regression Test | `P0` | ‏Durable learning |
| 83 | ‏Invariant tests | `P0` | ‏NoOverfill/NoDuplicate/FlatMeansFlat |
| 84 | ‏Golden Replays | `P1` | ‏Semantic regression guard |
| 85 | ‏Production-like profiling | `P1` | ‏Burst/queue/GC included |
| 86 | ‏Track P99 | `P0` | ‏Tail matters more than average |
| 87 | ‏Track Queue Age | `P0` | ‏Freshness/backpressure signal |
| 88 | ‏Trace important decisions | `P1` | ‏Candidate→Intent→Fill→Exit |
| 89 | ‏Reason codes | `P1` | ‏Structured RCA/analytics |
| 90 | ‏Bounded observability overhead | `P1` | ‏Telemetry אינו hot-path bottleneck |

### ‏J — Operations / Workflow / Learning Loop

| # | Habit | Priority | Default |
|---|---|---:|---|
| 91 | ‏Hard PAPER/LIVE separation | `P0` | ‏Account/credential/config/UI isolation |
| 92 | ‏Automated startup checklist | `P0` | ‏Data/Broker/Clock/Risk/Ownership proof |
| 93 | ‏Build/Config IDs בכל decision | `P0` | ‏Exact production provenance |
| 94 | ‏Deploy recoverable | `P1` | ‏Rollback/forward-recovery planned |
| 95 | ‏Runbook במקום memory | `P0` | ‏Incident steps written/tested |
| 96 | ‏Analyze Near Misses | `P0` | ‏Near-miss→control/test |
| 97 | ‏Automated daily review | `P1` | ‏Candidates/trades/NO_TRADE/anomalies |
| 98 | ‏Retire useless features | `P1` | ‏Complexity debt removed |
| 99 | ‏Simple Champion + experimental Challenger | `P0` | ‏Controlled evolution |
| 100 | ‏Simplest falsifying experiment first | `P0` | ‏KISS research gate |

---

## ‏8. Twenty Highest-Value Habits for Our Robot

‏הפרק מסמן 20 habits בעלי leverage גבוה במיוחד.

‏אצלנו הם יקובצו כך:

### ‏Signal / Timing

```text
SignalHalfLife
LatencyPressure
TimeToFirstProfit
TimeToTarget
Giveback
SignalTTL
```

### ‏Ranking

```text
Top-N
RankGap
RankAge
Freshness eligibility
NO_TRADE
```

### ‏Execution

```text
PreSubmitRevalidation
HardPriceBounds
FillProbability
OpportunityCost
PendingExposure
ExitCancelPriority
TimeToFlat
PostFillMarkout
```

### ‏Economics / Governance

```text
NetEdgeRetained
Simple Champion / Controlled Challenger
```

‏אלה יקבלו קדימות על Feature sophistication או micro-optimization מתקדם.

---

## ‏9. Four Daily Loops

### ‏9.1 Experiment Loop

```text
Question
→ Hypothesis
→ Primary Metric
→ Frozen Baseline
→ Small Controlled Change
→ Result
→ Reproduce
→ Promote / Reject / Research More
```

### ‏9.2 Decision Loop

```text
Fresh Evidence
→ Rank
→ Candidate Gate
→ Net Edge
→ Risk
→ Revalidate
→ Intent
→ Execute or NO_TRADE
```

### ‏9.3 Incident Loop

```text
Detect
→ Block New Risk
→ Establish Truth
→ Preserve Evidence
→ Reconcile
→ First Divergence
→ Regression Test
→ Similar-Area Search
```

### ‏9.4 Daily Learning Loop

```text
Top Candidates
+ Trades
+ NO_TRADE
+ Data Quality
+ Latency
+ Execution Anomalies
+ Near Misses
→ Review
→ One or Few Actionable Learnings
```

---

## ‏10. Automation Candidates

‏לא כל habit צריך UI או Service חדש.

‏ה־Preferred order:

```text
Manual explicit habit
→ Structured artifact
→ Simple automated check
→ Gate
→ Adaptive automation only if justified
```

‏Habits שמתאימים במיוחד לאוטומציה מוקדמת:

- ‏Manifest completeness.
- ‏Build/config stamping.
- ‏Freshness/coverage gates.
- ‏Signal TTL check.
- ‏Pre-submit revalidation.
- ‏Risk/Exposure invariants.
- ‏Startup readiness.
- ‏PAPER/LIVE mismatch detection.
- ‏Regression replay.
- ‏Daily anomaly summary.

---

## ‏11. Habits That Must Not Become Rituals

‏יש סכנה להפוך Best Practices ל־process theatre.

‏לכן כל habit חוזר נשאל:

```text
What failure does this prevent?
What evidence does it create?
What decision does it improve?
What would happen if we removed it?
```

‏אם אין תשובה טובה — Simplify או Retire.

---

## ‏12. Required Data / Evidence

‏כדי ליישם את ההרגלים החשובים צריך לשמור לפחות:

```text
ExperimentId
DatasetId
CodeVersion
ConfigVersion
FeatureVersion
RiskVersion
ExecutionVersion
ProviderFingerprint
EventTime
ReceiveTime
FeatureReadyTime
RankTime
DecisionTime
SignalTime
SignalTTL
SubmitTime
AckTime
FillTime
ExitDecisionTime
FlatTime
Rank
RankGap
RankAge
FreshCoverageRatio
ExpectedNetEdge
ActualNetOutcome
FillProbabilityEstimate
PostFillMarkout
PendingExposure
NO_TRADE reason
DataQuality
ExecutionState
```

---

## ‏13. Promotion Criteria

‏Operating habit או automation חדשה מקודמת כאשר:

1. ‏היא מונעת failure מוכר או משפרת evidence משמעותית.
2. ‏היא דטרמיניסטית/ניתנת לשחזור כאשר רלוונטי.
3. ‏היא אינה שוברת hot-path latency באופן מהותי.
4. ‏היא אינה יוצרת hidden state חדש.
5. ‏יש owner ו־reason ברור.
6. ‏היא נבדקה ב־Replay/Shadow/Paper לפי סוגה.
7. ‏היא מפחיתה toil או ambiguity בלי להוסיף complexity לא פרופורציונלית.

---

## ‏14. Rejection Criteria

‏Habit/Automation נדחית או מפושטת כאשר:

- ‏אין Failure Mode ברור שהיא פותרת.
- ‏היא מוסיפה state שלא ניתן להסביר.
- ‏היא יוצרת false confidence.
- ‏היא מחייבת manual ceremony ללא evidence.
- ‏היא הופכת harmless warning ל־blocking gate ללא justification.
- ‏היא מוסיפה latency/operational burden גדול יותר מהערך.
- ‏היא מנסה להחליף Risk/Safety authority ב־heuristic.
- ‏היא מקדמת sophistication לפני measurement.

---

## ‏15. Metrics

### ‏15.1 Research Discipline

```text
experiments_with_registered_hypothesis_ratio
experiments_with_primary_metric_ratio
negative_results_recorded_ratio
clean_rerun_success_rate
feature_retirement_count
```

### ‏15.2 Data / Scanner Discipline

```text
fresh_coverage_ratio
stale_candidate_rate
rank_churn
rank_age_at_decision
rejection_reason_coverage
no_trade_reason_coverage
```

### ‏15.3 Execution Discipline

```text
signal_age_at_submit
signal_age_at_fill
pre_submit_reject_rate
unknown_effect_rate
partial_fill_rate
pending_exposure_mismatch_rate
time_to_flat_p50_p95_p99
post_fill_markout
```

### ‏15.4 Learning Discipline

```text
incidents_with_regression_test_ratio
near_misses_reviewed_ratio
rca_first_divergence_found_ratio
daily_review_completion_rate
actions_closed_from_daily_review
```

‏ה־metrics האלו אינם Score של “כמה אנחנו מקצועיים”.

‏הם diagnostics ל־process drift.

---

## ‏16. Failure Modes

```text
H57_PROCESS_THEATRE
H57_HABIT_WITHOUT_OWNER
H57_HABIT_WITHOUT_EVIDENCE
H57_AUTOMATION_WITH_HIDDEN_STATE
H57_TOO_MANY_GATES
H57_FALSE_CONFIDENCE
H57_COMPLEXITY_BEFORE_MEASUREMENT
H57_NO_NEGATIVE_RESULT_MEMORY
H57_NO_REJECTION_CRITERION
H57_NO_TRADE_NOT_CAPTURED
H57_SIGNAL_AGE_NOT_MEASURED
H57_PRE_SUBMIT_NOT_REVALIDATED
H57_TIME_TO_FLAT_NOT_MEASURED
H57_DAILY_REVIEW_NO_ACTION
H57_NEAR_MISS_IGNORED
H57_FEATURE_NEVER_RETIRED
H57_CHAMPION_DRIFT
H57_CHALLENGER_AUTO_PROMOTED
H57_UNKNOWN
```

---

## ‏17. Golden Scenarios

### ‏G57-01 — Stale Winner Before Submit

```text
Given candidate A was Rank #1
And SignalAge now exceeds TTL
When pre-submit revalidation runs
Then no entry is sent
And NO_TRADE_STALE_SIGNAL is recorded
```

### ‏G57-02 — Top-1 Without Fresh Coverage

```text
Given only part of the universe is fresh
When ranking produces a winner
Then candidate is not actionable
Until coverage gate is satisfied
```

### ‏G57-03 — Good Fill, Bad Markout

```text
Given fill price looks favorable
When post-fill markout is strongly adverse
Then execution quality is classified separately from fill price
```

### ‏G57-04 — Exit Sent, Not Flat

```text
Given exit command was sent on time
When position remains non-flat
Then outcome is not counted as successful exit
And TimeToFlat continues until broker truth is flat
```

### ‏G57-05 — Challenger Looks Better Only Because Baseline Drifted

```text
Given Champion changed during experiment
When Challenger comparison completes
Then result is invalidated or rerun against frozen Champion
```

### ‏G57-06 — Daily Review Finds No Actionable Evidence

```text
Given review generated many dashboards
But no traceable hypothesis / control / test
Then review is classified as process theatre
```

---

## ‏18. Invariants

```text
Every actionable decision has version/provenance context.
Every new-entry intent has SignalTime and TTL.
Expired intent cannot create new risk.
NO_TRADE is persisted as a real decision.
Partial fill updates exposure immediately.
UNKNOWN_EFFECT cannot trigger blind retry.
Same frozen input + versions => same semantic result.
A Challenger cannot silently replace the Champion.
An incident/near-miss of material severity must create durable learning evidence.
A habit cannot override Risk or Safety authority.
```

---

## ‏19. User-Specific Application

‏לרובוט שלנו יש כמה מאפיינים שמגדילים את הערך של habits קטנים:

- ‏Whole-market universe של אלפי Symbols.
- ‏Signal horizon קצר.
- ‏Ranking cross-sectional.
- ‏Entry/Exit sensitivity גבוהה ל־freshness.
- ‏Execution דרך external broker state.
- ‏רצון לשמור KISS ולהימנע מ־HFT theatre.

‏לכן סדר העדיפויות שלנו:

```text
Truth
→ Freshness
→ Determinism
→ Explainability
→ Execution Safety
→ Net Economics
→ Performance
→ Sophistication
```

‏לא להפך.

---

## ‏20. Concrete Baseline Contract

```text
Research:
- Every meaningful experiment has ID, hypothesis, primary metric, rejection rule.
- Baseline is frozen.
- Negative results are retained.

Data:
- EventTime/ReceiveTime/quality/provenance are explicit.
- Replayable evidence is retained.

Scanner:
- Top-N, RankGap, RankAge, FreshCoverage and NO_TRADE are recorded.

Execution:
- OrderIntent carries SignalTime/TTL.
- Pre-submit revalidation is mandatory.
- UNKNOWN_EFFECT and Partial Fill are first-class.
- PendingExposure is part of Risk.
- TimeToFlat is measured.

Operations:
- Build/config/account/environment are explicit.
- Startup readiness is proven.
- Incidents and near-misses feed tests.

Learning:
- Daily review produces a small number of traceable actions.
- Features and process controls can be retired when they stop paying rent.
```

---

## ‏21. Confidence

| החלטה | Confidence |
|---|---:|
| ‏Explicit experiment discipline | `HIGH` |
| ‏Signal age / TTL / pre-submit revalidation | `HIGH` |
| ‏Top-N + RankGap + RankAge | `HIGH` |
| ‏NO_TRADE as full decision | `HIGH` |
| ‏Pending exposure / TimeToFlat | `HIGH` |
| ‏Incident→Regression loop | `HIGH` |
| ‏Automated daily review | `MEDIUM-HIGH` |
| ‏Specific advanced microstructure tips | `MEDIUM`, require OOS evidence |
| ‏Adaptive automation of habits | `LOW-MEDIUM` until operational evidence |

---

## ‏22. Time-Sensitive Facts

‏מקטע 57 אינו מקבע מספר Broker/Venue/Regulation תלוי־זמן.

‏לכן לא נדרש Web verification חדש.

‏כל Tip שנשען בעתיד על capability ספציפי של Broker/Data Provider חייב לעבור verification מחדש במסמך הייעודי שלו.

---

## ‏23. Relationship to Earlier Sheets

‏מקטע 57 אינו מחליף את ה־sheets הקודמים.

‏הוא הופך אותם להרגלי עבודה יומיומיים.

```text
49 — Research governance
53 — Testing discipline
54 — Performance discipline
55 — Security / Operations
56 — Failure Prevention Map
57 — Positive Operating Habits
```

‏במיוחד:

```text
56 asks:
What should never happen again?

57 asks:
What should we routinely do so those failures become less likely?
```

---

## ‏24. Relationship to Segment 58

‏מקטע 58 — `Order and Execution Subtleties` — יעמיק את ההרגלים של:

```text
OrderIntent
SignalTTL
PreSubmitRevalidation
HardPriceBounds
FillProbability
CancelReplaceCost
PartialFills
UNKNOWN_EFFECT
PendingExposure
TimeToFlat
```

‏58 הוא refinement של execution mechanics.

‏57 נשאר Operating Habits layer רחב.

---

## ‏25. What I Would Avoid Initially

‏לא הייתי בונה עכשיו:

- ‏Habit-management service נפרד.
- ‏100 runtime gates.
- ‏Process score שמדרג “מקצועיות”.
- ‏AI שמחליט אוטומטית איזה habit להפעיל.
- ‏Daily review עם עשרות dashboards שאיש אינו פועל לפיהם.
- ‏Enterprise workflow engine.
- ‏Adaptive automation לפני שיש manual contract ברור.

‏ה־KISS baseline מספיק:

```text
versioned Markdown / YAML
+ tests
+ reason codes
+ manifests
+ small automated checks
+ daily summary
```

---

## ‏26. What to Add Later

### ‏`P2`

- ‏Automated experiment completeness checks.
- ‏Feature retirement report.
- ‏Near-miss trend report.
- ‏Daily decision attribution summary.
- ‏Habit/control coverage mapping.

### ‏`P3`

- ‏Automatic stale-control detection.
- ‏Control effectiveness scoring.
- ‏Experiment recommendation assistant.
- ‏Adaptive review prioritization.

### ‏`P4`

- ‏Organization-scale governance tooling.
- ‏Advanced causal attribution across incidents.

‏רק אם ה־system complexity מצדיקה זאת.

---

## ‏27. Tests

‏מקטע 57 עצמו דורש לפחות:

```text
TestExperimentRequiresHypothesis
TestExperimentRequiresPrimaryMetric
TestExpiredSignalCannotSubmit
TestPreSubmitRevalidationRejectsStaleWinner
TestNoTradePersistsSnapshotAndReason
TestPartialFillUpdatesExposure
TestUnknownEffectDoesNotBlindRetry
TestTimeToFlatEndsOnlyAtBrokerFlatTruth
TestChampionRemainsFrozenDuringExperiment
TestIncidentCreatesRegressionArtifact
TestNearMissCanCreateControlWithoutRealLoss
TestBuildConfigIdsPresentInDecisionRecord
TestFreshnessGateExcludesStaleSymbols
```

---

## ‏28. Recommendation Summary

‏ההמלצה למקטע 57 היא לא “ליישם 100 טיפים”.

‏ההמלצה היא לבנות **Operating Discipline קטן, מפורש ומדיד**.

```text
Write the hypothesis.
Measure the age.
Keep the baseline simple.
Record NO_TRADE.
Revalidate before side effects.
Treat uncertainty as state.
Measure flatness, not just send time.
Preserve negative results.
Turn incidents into tests.
Retire complexity that does not pay rent.
```

‏ה־baseline הסופי:

```text
Simple Champion
→ Explicit Evidence
→ Small Controlled Experiments
→ Fresh Decisions
→ Safe Execution
→ Full Attribution
→ Daily Learning
→ Retire What Does Not Survive
```

‏זהו הצד החיובי המשלים ל־Failure Prevention Map של מקטע 56.
