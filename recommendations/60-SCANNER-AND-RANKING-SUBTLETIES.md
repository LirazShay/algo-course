# ‏60 — Recommendation Sheet: Scanner and Ranking Subtleties

> ‏מקור לימודי עיקרי: `../60-SCANNER-AND-RANKING-SUBTLETIES.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מחקרי, ארכיטקטוני ותפעולי ל־Cross-Sectional Ranking של רובוט `Short-Horizon Momentum`, כך ש־`Rank #1` לא יהפוך בטעות ל־Trade רק משום שהוא המספר הגבוה ביותר; אלא יעבור בדיקות של Freshness, Fairness, Separation, Stability, Executability, Costs, Latency, Exit Feasibility ו־Absolute Quality.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה להפעלה בכסף אמיתי, אינו מגדיר Exposure אמיתי ואינו מבטיח רווח.

---

## ‏1. Decision

‏`Rank #1` אינו אמת אובייקטיבית.

‏הוא **Hypothesis שנוצר ממנגנון מדידה Cross-Sectional תחת uncertainty**.

‏ה־Baseline:

```text
Point-in-Time Universe
→ Hard Eligibility
→ Fresh Comparable State
→ Incremental Features
→ Predictive Score
→ Cross-Sectional Rank
→ Top-N Snapshot
→ Separation / Stability / Confidence
→ Execution Re-Rank / Feasibility
→ Absolute Candidate Gate
→ TRADE_CANDIDATE / NO_TRADE
→ Pre-Submit Revalidation
→ Execution
→ Rank / Outcome RCA
```

‏העקרונות המחייבים:

```text
Rank #1 != Trade
Relative Best != Absolute Good Enough
Prediction Rank != Execution Rank
Fresh Rank != Fresh Inputs
Score != Probability
Score != Economic Value
Rank Stability != Profitability
Fast Ranking on stale inputs = economically slow ranking
```

‏ה־winner הסופי צריך לשרוד את השרשרת:

```text
Predictive Strength
+ Freshness
+ Cross-Sectional Fairness
+ Separation
+ Stability
+ Executability
- Costs
- Latency Decay
- Expected Adverse Selection
- Switching Cost
+ Exit Feasibility
→ Net Executable Edge
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Hard Eligibility לפני Ranking actionable

‏אין Score שמפצה על Candidate שאינה eligible.

‏לפני Ranking actionable נדרשים לפחות:

```text
data quality acceptable
critical inputs fresh
feature readiness proven
trading status known / allowed
instrument eligible
universe membership valid point-in-time
required execution state known
risk/safety do not prohibit new entry
```

‏Candidate שנכשלה:

```text
NOT_ELIGIBLE_FOR_ACTIONABLE_RANK
```

‏אפשר עדיין לחשב לה Shadow/Research Score, אבל אסור ש־Score יחזיר אותה למסלול Entry.

### ‏`P0 — Required`: Rank Snapshot חייב להיות Point-in-Time ו־As-Of מפורש

‏לכל ranking decision נשמור:

```text
rank_id
rank_generation
decision_as_of_time
rank_computed_at
universe_version
eligible_count
fresh_eligible_count
fresh_coverage_ratio
model_version
feature_version
filter_version
ranking_policy_version
data_generation
```

‏ולכל Candidate ב־Top-N:

```text
feature_as_of_time
trade_as_of_time
quote_as_of_time
book_as_of_time when relevant
max_critical_input_age
feature_age
rank_age
```

‏המטרה היא שנוכל לענות:

```text
What market state was each candidate actually compared on?
```

### ‏`P0 — Required`: Freshness Parity היא חלק מ־Ranking correctness

‏Cross-Sectional Ranking אינו הוגן כאשר Candidate אחת משתמשת ב־state בן `20ms` ואחרת ב־state בן `800ms`, אם הפער מהותי ל־signal horizon.

‏נמדוד לפחות:

```text
fresh_coverage_ratio
median_input_age
p95_input_age
max_critical_input_age
freshness_skew
candidate_input_age
```

‏ה־thresholds עצמם ייקבעו אמפירית לפי signal half-life, Provider ו־Regime.

‏אם ה־Universe comparison אינו trustworthy:

```text
RANK_NOT_ACTIONABLE
NO_TRADE_DATA_FAIRNESS
```

### ‏`P0 — Required`: Fresh Rank אינו Fresh Inputs

‏המערכת אינה רשאית להסתפק ב־:

```text
rank_computed_5ms_ago
```

‏אם אותו Rank חושב על Inputs ישנים.

‏נפריד:

```text
RankAge
InputAge
FeatureAge
```

‏ונחשב validity על פי הישן/קריטי שבהם.

### ‏`P0 — Required`: Relative Best AND Absolute Good Enough

‏תמיד יהיה Rank #1 גם ביום שבו כל Candidates חלשות.

‏לכן:

```text
ActionableCandidate
=
RelativeBest
AND
AbsoluteGoodEnough
```

‏Absolute Gate יכול לכלול לפי הגרסה המאומתת:

```text
minimum prediction quality
minimum expected net edge
minimum data confidence
minimum execution feasibility
maximum tolerated risk / cost / staleness
```

‏המספרים עצמם אינם hard-coded לפי אינטואיציה; הם דורשים sweep, sensitivity ו־OOS validation.

### ‏`P0 — Required`: Top-N Snapshot — לא Top-1 בלבד

‏לכל Decision משמעותי נשמור Top-N קטן, לפחות מספיק כדי לענות:

```text
Why #1?
Why not #2?
How close was #3?
Was the winner clearly separated?
```

‏Baseline fields:

```text
symbol
rank
raw_score
adjusted_score if any
prediction_score
execution_score_or_diagnostics
expected_net_edge
rank_gap_to_1
feature_values
feature_contributions
freshness
quality
spread
liquidity
expected_cost
expected_markout_or_adverse_selection if available
exit_feasibility
reason_codes
```

### ‏`P0 — Required`: Prediction Rank ו־Execution Rank נפרדים

‏לא נמחץ הכול לציון אחד שבו Signal חזק מסתיר Execution גרוע.

‏Baseline:

```text
Prediction Rank
→ Top-N
→ Execution Feasibility / Economic Re-Rank
→ Candidate Gate
```

‏מחקר יכול להשוות:

```text
raw_predictive_rank
expected_net_edge_rank
```

‏כאשר ה־Execution Rank כולל לפי זמינות:

```text
spread
slippage
fill probability
latency decay
adverse selection
impact
exit feasibility
```

‏Candidate יכולה להיות:

```text
Prediction Winner
but
Execution Loser
```

### ‏`P0 — Required`: Candidate Revalidation לפני Submit

‏ב־short horizon Rank שנוצר קודם אינו authorization קבוע.

‏לפני Submit שמגדיל risk נבדוק לפחות:

```text
candidate still eligible?
data still fresh?
rank still acceptable?
score still valid?
rank gap not materially collapsed?
trading status still valid?
spread / liquidity still acceptable?
expected net edge still positive enough?
execution state known?
```

‏אם Reality הידרדרה:

```text
NO_TRADE_REVALIDATION
```

‏זו הצלחה של Control, לא Failure של Scanner.

### ‏`P0 — Required`: Rank Drift נשמר לאורך כל ה־Decision Path

‏נשמור כאשר אפשר:

```text
RankAtDetection
RankAtDecision
RankAtSubmit
RankAtAck
RankAtFill
```

‏וכן:

```text
ScoreAtDetection
ScoreAtSubmit
SignalAgeAtSubmit
SignalAgeAtFill
```

‏כך אפשר למדוד:

```text
Detection-to-Execution Drift
```

‏ולא להאשים Strategy כאשר ה־Trade בוצע אחרי שה־winner כבר נעלם.

### ‏`P0 — Required`: Deterministic Tie-Breaking

‏אותו State + אותם Versions חייבים לתת אותו Rank.

‏אסור שה־winner יהיה תלוי ב־:

```text
Dictionary enumeration order
thread scheduling
partition completion order
incidental event arrival order
```

‏Tie-breaker אפשרי, versioned ומוסבר:

```text
1. higher expected net edge
2. fresher critical state
3. lower expected execution drag
4. stronger validated persistence
5. stable instrument key
```

‏כל tie-breaker חייב להיות point-in-time; אסור להשתמש במידע עתידי.

### ‏`P0 — Required`: Rank Generation / Versioning

‏נעלה `rank_generation` או נשמור Version boundary כאשר משתנה אחד מאלה:

```text
model
features
filters
ranking policy
universe definition
data provider / semantics
schema / normalizer semantics
regime policy with semantic effect
```

‏אין להשוות Rank לפני/אחרי change כאילו הוא אותו Measurement Contract ללא version context.

---

## ‏3. Rank Separation, Compression ו־Noise Floor

### ‏`P1 — Preferred Default`: Rank Gap הוא Context — לא Rule אוטומטי

‏נשמור:

```text
score_gap_1_2
score_gap_1_5
normalized_rank_gap
percentile_gap
expected_edge_gap
```

‏אבל:

```text
large gap + weak absolute quality
!= trade
```

‏וגם:

```text
small gap + strong candidates
!= automatic reject
```

‏ה־Gap הוא Feature/Diagnostic שצריך Validation.

### ‏`P1 — Preferred Default`: Score Compression מזוהה מפורשות

‏מצב:

```text
A 91.2
B 91.1
C 91.0
D 90.9
```

‏מראה סדר מתמטי אך ייתכן שאין separation כלכלית.

‏נשמור distribution של:

```text
P50
P90
P95
P99
max
rank1_minus_rank2
rank1_minus_rank5
```

‏ונבדוק האם gaps מסוימים באמת קשורים ל־future net outcome.

### ‏`P2 — Challenger`: Score Noise Floor

‏אם ההפרש בין Candidates קטן מה־noise של המודל/feature pipeline:

```text
ordering confidence = LOW
```

‏מחקר עתידי יכול להשתמש ב־uncertainty bands / confidence intervals, אבל אין צורך להתחיל במודל Bayesian או probabilistic מורכב.

‏ה־KISS baseline הוא:

```text
empirical variability
+ repeated replay
+ OOS rank-gap calibration
```

---

## ‏4. Winner's Curse ו־Top-K Research

### ‏`P1 — Preferred Default`: Top-1 Winner's Curse נמדד

‏כאשר בוחרים Max מתוך אלפי Symbols, בוחרים גם Extreme Noise.

‏לכן `Top Score` נחשב biased-upward candidate עד Validation.

‏נשווה:

```text
Top 1
Top 3
Top 5
Top 10
Rank buckets
Random eligible baseline
Naive simple baseline
```

### ‏`P1 — Preferred Default`: Rank Buckets / Monotonicity

‏Baseline research:

```text
Rank 1
Ranks 2-5
Ranks 6-10
Ranks 11-50
Rest eligible
```

‏נבדוק:

```text
forward outcome
net outcome
hit rate
time to target
MFE / MAE
fill probability
post-fill markout
costs
```

‏Ranking איכותי אמור להראות לפחות tendency של monotonic sorting OOS, גם אם לא בכל sample.

### ‏`P1 — Preferred Default`: Counterfactual Candidate Outcome

‏לכל Rank #1 משמעותי נשמור Outcome של #2/#3 כאשר Data מאפשרת.

‏נמדוד:

```text
SelectionRegret
=
BestCounterfactualNetOutcome
-
SelectedCandidateNetOutcome
```

‏אין להשתמש ב־counterfactual כאילו היה fill אמיתי; execution feasibility/fill model confidence חייבים להישמר.

---

## ‏5. Rank Churn, Persistence ו־Switching

### ‏`P1 — Preferred Default`: Rank Churn הוא First-Class Metric

‏נשמור:

```text
rank_changes_per_second
rank1_changes_per_second
top_n_turnover
candidate_dwell_time
candidate_reentry_rate
rank_volatility
```

‏Churn גבוה יכול לנבוע מ־:

```text
real market burst
weak signal
score noise
stale asymmetry
bad normalization
CPU / scheduling bias
```

‏ולכן אינו מקבל פרשנות אחת אוטומטית.

### ‏`P1 — Preferred Default`: Persistence נמדדת — לא נהפכת אוטומטית ל־Gate

‏נחקור:

```text
CandidateDwellTime
TimeSinceFirstTopRank
TopNResidenceTime
```

‏מול:

```text
forward net outcome
markout
execution feasibility
```

‏ייתכן sweet spot:

```text
transient-too-short
→ useful persistence
→ stale-too-old
```

‏אבל הסף צריך לצאת מ־Evidence.

### ‏`P2 — Challenger`: Rank / Score Velocity

‏אפשר לחקור:

```text
rank_velocity
rank_acceleration
score_velocity
score_slope
recent_peak_score
```

‏מועמד:

```text
50 → 20 → 7 → 2
```

‏שונה ממועמד:

```text
1 → 12 → 2 → 18
```

‏אבל Features אלה אינם נכנסים ל־Champion בלי incremental OOS value.

### ‏`P0 — Required`: Rank Churn אינו יוצר Order Churn אוטומטי

‏אסור:

```text
A top → submit A
B top → cancel A → submit B
A top → cancel B → submit A
```

‏רק משום שה־sort השתנה.

‏Execution state הוא durable ונפרד מ־Ranking state.

### ‏`P2 — Challenger`: Candidate Switching עם Hysteresis

‏Switch אפשרי רק אם:

```text
NewExpectedNetEdge
>
CurrentExpectedNetEdge
+ SwitchingCost
+ SafetyMargin
```

‏כאשר `SwitchingCost` כולל לפחות:

```text
cancel latency
cancel/fill race risk
lost queue value
new submit latency
new spread/slippage
new uncertainty
position unwind cost if already filled
```

‏ה־Champion הראשוני אינו aggressive switching policy.

### ‏`P0 — Required`: State-Aware Ranking / Selection

‏החלטת Candidate תלויה גם ב־:

```text
FLAT
PENDING_ENTRY
PARTIALLY_FILLED
POSITION_OPEN
PENDING_EXIT
UNKNOWN_EXECUTION_STATE
```

‏Ranking חדש אינו רשאי למחוק Execution reality קיימת.

‏כאשר Position קיימת:

```text
Position Monitoring / Exit
>
Broad Market Opportunity Switching
```

---

## ‏6. Timing, Watermarks ו־Scheduling Bias

### ‏`P1 — Preferred Default`: Hybrid Ranking Timing

‏ה־Baseline שכבר הוגדר ב־50 נשמר:

```text
Event-driven state / feature updates
+
controlled ranking checkpoints
```

‏אפשרויות המחקר:

```text
rank on every event
rank on watermark
rank on controlled cadence
```

‏כל אחת נמדדת לפי:

```text
freshness
cross-sectional fairness
rank latency
compute cost
candidate recall
decision impact
```

### ‏`P0 — Required`: Event-Driven Freshness Bias נמדד

‏Symbol שקיבל Event כרגע עלול לקבל יתרון על Symbol שה־state שלו לא עודכן עדיין.

‏נשמור:

```text
feature_as_of_time
rank_as_of_time
freshness_by_candidate
```

‏ולא נציג latest-updated symbol כ־winner “אובייקטיבי”.

### ‏`P1 — Preferred Default`: Watermark / Comparison Cut מפורש

‏כאשר ranking cycle משתמש ב־as-of cut, נשמור:

```text
watermark_time
coverage_at_watermark
late_symbol_count
stale_symbol_count
```

‏אין צורך להמתין ל־perfect simultaneity; צריך Evidence שההשוואה הוגנת מספיק ל־horizon.

### ‏`P0 — Required`: CPU / Partition Fairness

‏תחת Load נמדוד:

```text
queue_age_by_partition
freshness_by_partition
compute_latency_by_partition
rank_share_by_partition
processing_lag_by_symbol_bucket
```

‏אם Partition מסוים מקבל יותר הזדמנויות להופיע Top-N בגלל scheduling, זה Scanner correctness bug.

### ‏`P0 — Required`: Universe iteration-order independence

‏Property:

```text
same frozen inputs
+ same versions
+ different universe iteration order
=> same semantic ranking / decision
```

‏אם לא — קיימת processing/fairness bias.

---

## ‏7. Normalization, Cohorts ו־Regime

### ‏`P1 — Preferred Default`: Normalization פשוטה לפני Cohort Complexity

‏Percentile / robust cross-sectional normalization נשאר Baseline מחקרי כאשר מתאים.

‏לא מתחילים מיד ב־:

```text
per-sector dynamic normalization
per-volatility cohort model
per-price bucket ranker
many regime-specific formulas
```

‏קודם נמדוד Bias אמיתי.

### ‏`P2 — Challenger`: Cohort Ranking

‏Cohorts אפשריים למחקר:

```text
liquidity bucket
volatility bucket
price bucket
sector
market-cap bucket
time-of-day regime
```

‏Promotion רק אם:

```text
bias reduced
OOS ranking quality improves
net outcome improves
complexity remains explainable
```

### ‏`P1 — Preferred Default`: Time-of-Day / Regime Segmentation

‏נחתוך לפחות Research Metrics לפי:

```text
open
midday
close
fast market
quiet market
high / low volatility
```

‏לא בהכרח ניצור מודל נפרד לכל regime; קודם נמדוד calibration drift.

### ‏`P1 — Preferred Default`: Sector / Shared-Factor Context כ־Diagnostic

‏אם Top-N כולו מאותו Sector, נשמור זאת.

‏אפשר לחקור:

```text
absolute momentum
market-relative momentum
sector-relative momentum
```

‏אבל sector adjustment אינו Baseline חובה עד Evidence.

---

## ‏8. Score Semantics ו־Calibration

### ‏`P0 — Required`: Score אינו Probability בלי Calibration

‏`Score = 0.82` אינו:

```text
82% probability of profit
```

‏אלא אם נבנה calibration contract שמוכיח זאת.

### ‏`P1 — Preferred Default`: Score Calibration Tables

‏נמדוד OOS:

```text
score bucket
→ forward gross outcome
→ executable net outcome
→ hit rate
→ time to target
→ MAE / MFE
```

‏ונחתוך לפי regime כאשר sample size מאפשר.

### ‏`P0 — Required`: Score אינו Economic Value

‏Candidate בעל Score גבוה יכול להיות:

```text
spread too wide
slippage too high
fill probability poor
adverse selection high
exit weak
expected net edge <= 0
```

‏לכן:

```text
PredictionScore
!=
ExpectedNetEdge
```

### ‏`P1 — Preferred Default`: Feature Contribution ≠ Causal Contribution

‏Contribution ל־Score מסביר למה המודל דירג.

‏הוא לא מוכיח שה־Feature מוסיף Outcome.

‏לכך נדרש:

```text
ablation
controlled experiment
OOS validation
```

---

## ‏9. Ranking Contract / Data Model

### ‏`P1 — Preferred Default`: ‏`RankSnapshot`

```text
RankSnapshot
- rank_id
- rank_generation
- decision_as_of_time
- computed_at
- watermark_time
- universe_version
- expected_universe_count
- eligible_count
- fresh_eligible_count
- fresh_coverage_ratio
- model_version
- feature_version
- filter_version
- ranking_policy_version
- data_generation
- scanner_mode
- queue_age
- compute_latency
- top_n[]
```

### ‏`P1 — Preferred Default`: ‏`RankedCandidate`

```text
RankedCandidate
- instrument_id
- prediction_rank
- prediction_score
- execution_rank optional
- expected_net_edge optional
- absolute_quality
- rank_gap_to_previous
- rank_gap_to_next
- feature_as_of_time
- max_critical_input_age
- rank_age
- dwell_time
- rank_churn_context
- quality_state
- eligibility_state
- execution_feasibility
- exit_feasibility
- score_contributions
- reason_codes
```

### ‏`P1 — Preferred Default`: Winner Explanation Snapshot

‏ל־#1 נשמור לפחות:

```text
why_rank_1
why_not_rank_2
primary_positive_drivers
primary_uncertainties
rank_separation
freshness_context
execution_drag
absolute_gate_result
```

‏Explainability כאן היא Tool ל־RCA ו־Performance iteration — לא UI decoration.

---

## ‏10. Decision Outcomes / Reason Codes

‏Baseline outcomes:

```text
RANK_ACTIONABLE
RANK_RESEARCH_ONLY
NO_TRADE_NO_ABSOLUTE_EDGE
NO_TRADE_DATA_FAIRNESS
NO_TRADE_STALE_WINNER
NO_TRADE_RANK_DECAY
NO_TRADE_EXECUTION_DRAG
NO_TRADE_EXIT_INFEASIBLE
NO_TRADE_SYSTEM_STATE
NO_TRADE_UNRESOLVED_UNCERTAINTY
```

‏Candidate-level rejection יכול לאפשר מעבר ל־#2/#3 רק לפי rules של מקטע 15.

‏Global/system/data failure אינו מפעיל fallback אוטומטי ל־Candidate אחרת.

---

## ‏11. Metrics

### ‏Primary Ranking KPIs

```text
rank_age
input_age
feature_age
fresh_coverage_ratio
freshness_skew
rank_gap_1_2
rank_gap_1_5
rank1_churn_rate
top_n_turnover
candidate_dwell_time
rank_decay
rank_at_detection
rank_at_submit
rank_at_fill
rank_to_trade_conversion
```

### ‏Economic KPIs

```text
expected_net_edge_by_rank
realized_net_outcome_by_rank
fill_rate_by_rank
post_fill_markout_by_rank
missed_opportunity_by_rank
selection_regret
net_edge_retained_by_rank
no_trade_counterfactual_outcome
```

### ‏Fairness / Runtime KPIs

```text
queue_age_by_partition
freshness_by_partition
rank_share_by_partition
compute_latency_by_partition
stale_winner_rate
ranking_revalidation_failure_rate
```

### ‏Top-K Quality

```text
Top1Outcome
Top3OutcomeDistribution
Top5OutcomeDistribution
RankBucketMonotonicity
CandidateRecall
```

---

## ‏12. Research / Experiment Ladder

‏נשתמש בסדר:

```text
Simple Rank Baseline
→ Top-K / Bucket Validation
→ Gap / Churn / Persistence Diagnostics
→ Freshness / Fairness Validation
→ Execution-Aware Re-Rank Shadow
→ Candidate Switching Shadow
→ OOS / Walk-Forward
→ Replay Stress
→ Paper Lifecycle Validation
→ Champion / Challenger
```

### ‏Experiment 1 — Does Rank Add Value?

‏השווה:

```text
Rank #1
vs
Top 3 / Top 5
vs
Random Eligible
vs
Naive Momentum Baseline
```

‏Promotion requires ranking to sort future executable outcomes better than simple baselines OOS.

### ‏Experiment 2 — Rank Gap

```text
rank_gap_bucket
→ future net outcome
```

‏המטרה: לבדוק אם Separation באמת informative.

### ‏Experiment 3 — Persistence

```text
candidate_dwell_time
→ future net outcome
```

‏מחפשים robust region, לא magic threshold.

### ‏Experiment 4 — Rank Decay

```text
rank_age
→ predictive value / net edge
```

‏מכאן אפשר לגזור Rank TTL אמפירי.

### ‏Experiment 5 — Prediction Rank vs Execution Rank

‏Shadow compare:

```text
candidate_selected_by_prediction_rank
vs
candidate_selected_by_expected_net_edge_rank
```

‏Primary metric:

```text
incremental net outcome on changed decisions
```

### ‏Experiment 6 — Candidate Switching

‏Compare:

```text
hold current candidate
vs
switch on every winner change
vs
hysteresis + switching cost
```

‏Guardrails:

```text
order churn
cancel/fill races
latency
missed opportunity
net edge retained
```

### ‏Experiment 7 — Scheduling / Fairness Stress

‏Repeat same market evidence with:

```text
universe order randomized
partition order randomized
CPU pressure
queue backlog
```

‏Semantic ranking should remain invariant within defined as-of contract.

---

## ‏13. Promotion Criteria

‏Ranking/Selection change מתקדם רק אם:

- ‏משפר OOS sorting of executable outcomes.
- ‏משפר `Net Edge Retained` או Selection Regret באופן יציב.
- ‏Decision Impact Rate מספיק כדי להצדיק Complexity.
- ‏התוצאה אינה תלויה ב־symbol/day/regime יחיד.
- ‏Freshness/Fairness אינם מדרדרים.
- ‏Rank churn / order churn אינם מחמירים מעבר לערך הכלכלי שנוסף.
- ‏Latency tax אינו מוחק את השיפור.
- ‏Replay נשאר deterministic.
- ‏Explainability ו־RCA נשארים אפשריים.
- ‏Risk/Safety hard constraints אינם נעקפים.

---

## ‏14. Rejection Criteria

‏נReject שינוי אם:

- ‏משפר headline backtest אך לא executable net outcome.
- ‏עובד רק כאשר Top-1 נבחר בדיעבד.
- ‏מסתמך על stale/future cross-sectional data.
- ‏נראה טוב רק בגלל score normalization leakage.
- ‏מגדיל Candidate churn בלי net benefit.
- ‏מגדיל switching/order churn ורaces.
- ‏אין superiority מול Naive/Random baseline.
- ‏אינו יציב OOS/regime.
- ‏מוסיף latency שמוחקת signal half-life.
- ‏Rarely changes decisions.
- ‏דורש opacity שמונעת RCA ללא incremental value משמעותי.
- ‏עובד רק תחת unrealistic fill assumptions.

---

## ‏15. Failure Modes / RCA Taxonomy

```text
RK_STALE_WINNER
RK_INPUT_AGE_SKEW
RK_PARTIAL_COVERAGE
RK_EVENT_DRIVEN_BIAS
RK_PARTITION_BIAS
RK_BACKPRESSURE_BIAS
RK_SCORE_COMPRESSION
RK_NOISE_EXTREME
RK_WINNERS_CURSE
RK_TIE_NONDETERMINISTIC
RK_NORMALIZATION_BIAS
RK_COHORT_MISMATCH
RK_UNIVERSE_BIAS
RK_FUTURE_LEAKAGE
RK_RANK_CHURN
RK_SWITCH_THRASH
RK_RANK_DECAY
RK_EXECUTION_DRIFT
RK_PREDICTION_EXECUTION_MISMATCH
RK_EXIT_INFEASIBLE
RK_VERSION_MISMATCH
RK_DATA_GENERATION_MISMATCH
RK_EXPLAINABILITY_GAP
RK_UNKNOWN
```

‏ב־RCA נשמור:

```text
primary_cause
contributing_causes
confidence
first_divergence
rank_snapshot_id
data_evidence_ids
execution_evidence_ids
```

‏`UNKNOWN` עדיף על explanation מומצא.

---

## ‏16. RCA — First Divergence

‏במקום:

```text
Rank #1 lost
→ ranking is bad
```

‏נבדוק:

```text
Data correct/fresh?
Universe complete enough?
Feature ready?
Score correct?
Rank fair?
Winner separated?
Winner still alive at submit?
Execution feasible?
Fill quality acceptable?
Exit timely?
Regime shifted?
```

‏הנקודה הראשונה שבה Reality סטתה מה־expected chain היא Primary RCA candidate.

---

## ‏17. Golden Scenarios

‏נבנה לפחות:

1. ‏Winner ברור עם gap גדול ו־fresh parity תקין.
2. ‏Top-1/Top-2 כמעט tie.
3. ‏Winner טרי מול competitors stale.
4. ‏Fresh coverage נמוך.
5. ‏Rank #1 משתנה במהירות A/B/A/C.
6. ‏Candidate עולה בהדרגה 50→20→7→2.
7. ‏Candidate הגיע לשיא ומתחיל להתדרדר אך נשאר #1 רגעית.
8. ‏Rank #1 predictive חזק אך execution economics גרועים.
9. ‏Rank #2 predictive מעט חלש יותר אך executable יותר.
10. ‏Top-N כולו מאותו sector.
11. ‏Normalization regime shift.
12. ‏Universe eligibility משתנה.
13. ‏Equal scores עם deterministic tie-break.
14. ‏Universe iteration order reversed.
15. ‏Partition backlog skew.
16. ‏Data provider failover / generation change.
17. ‏Rank deteriorates between Decision and Submit.
18. ‏Pending Entry כאשר Candidate אחר עוקף.
19. ‏Partial Fill כאשר Candidate אחר עוקף.
20. ‏Active Position בזמן broad-market scanner overload.
21. ‏NO_TRADE כאשר winner אינו Absolute Good Enough.
22. ‏Winner's curse — Top1 noise extreme, Top3 bucket better OOS.

---

## ‏18. Property / Invariant Tests

```text
same state + same versions => same rank
same state + different iteration order => same semantic rank
ineligible candidate cannot become actionable winner
stale critical input cannot pass actionable freshness gate
unknown critical quality cannot silently become GOOD
future data cannot affect current cross-sectional normalization
rank computation cannot mutate execution state
new rank cannot erase pending exposure
NO_TRADE remains valid even when a rank #1 exists
```

‏בנוסף:

```text
rank_at_submit timestamp >= rank_at_detection timestamp
rank snapshot references exact universe/data/model generations
```

‏Metamorphic tests אפשריים כאשר Feature אמור להיות scale-invariant.

---

## ‏19. Observability / Diagnostics

‏לכל actionable decision נרצה Trace:

```text
Market Evidence
→ Feature Snapshot
→ Score
→ Rank
→ Top-N Shape
→ Candidate Gate
→ Revalidation
→ Execution Intent
```

‏Dashboard/diagnostics צריכים להציג לפחות:

```text
Top-N table
rank gap
candidate age
input ages
fresh coverage
rank churn
expected net edge
eligibility / rejection reason
rank-at-submit drift
```

‏לא נסתפק ב־:

```text
XYZ is Rank #1
```

---

## ‏20. Performance / Fast Path

‏Ranking optimization כפוף ל־48/50/54.

‏העיקרון:

```text
fresh enough + fair enough + deterministic enough
before
faster microbenchmark
```

‏Baseline:

```text
incremental features
cheap full-universe score
small Top-N snapshot
deep Top-N economics
bounded ranking cadence
```

‏לא מריצים Deep Execution Analysis לכל אלפי Symbols בכל Event ללא Evidence.

‏`RankLatency / SignalHalfLife` נשמר KPI.

---

## ‏21. User-Specific Application

‏לרובוט שלנו שמנסה לזהות הזדמנות קצרה מאוד מתוך אלפי מניות:

‏הסיכון המרכזי אינו רק “בחרנו מניה לא נכונה”.

‏הסיכונים המרכזיים הם:

```text
winner was stale
winner only looked strong because others were stale
winner was an extreme noise observation
winner changed before submit
winner had no meaningful gap
winner was predictively good but economically unexecutable
switching chased rank churn
ranking consumed too much of signal lifetime
```

‏לכן ה־Champion הראשוני יהיה:

```text
Hard Eligibility
→ Simple Explainable Prediction Score
→ Deterministic Cross-Sectional Rank
→ Top-N Snapshot
→ Freshness / Coverage Gate
→ Absolute Quality Gate
→ Simple Execution-Aware Recheck
→ NO_TRADE or Candidate
→ Pre-Submit Revalidation
```

‏לא נתחיל ב־ML Ranker כבד, Dynamic Cohort Engine או aggressive switching.

---

## ‏22. Priority Map

### ‏`P0`

- ‏Point-in-time Universe / As-Of contract.
- ‏Hard Eligibility לפני Actionable Rank.
- ‏Freshness / Coverage / Fairness gates.
- ‏Top-N snapshot.
- ‏RelativeBest + AbsoluteGoodEnough.
- ‏Prediction vs Execution distinction.
- ‏Deterministic tie-breaking.
- ‏Rank/data/model versioning.
- ‏Pre-submit revalidation.
- ‏Rank drift tracking.
- ‏Execution state cannot be overwritten by rank churn.
- ‏Risk/Safety remain hard constraints.

### ‏`P1`

- ‏Rank gaps / compression diagnostics.
- ‏Top-K / bucket monotonicity research.
- ‏Rank churn / dwell / turnover metrics.
- ‏Simple normalization.
- ‏Regime segmentation.
- ‏Score calibration.
- ‏Counterfactual #2/#3 outcomes.
- ‏Winner explanation snapshot.
- ‏Fairness/load diagnostics.

### ‏`P2`

- ‏Rank/score velocity.
- ‏Persistence gates after validation.
- ‏Execution-aware re-rank.
- ‏Hysteresis candidate switching.
- ‏Cohort normalization.
- ‏Market/sector-relative adjustments.

### ‏`P3`

- ‏Learned ranker.
- ‏Uncertainty-aware ranking model.
- ‏Dynamic switching policy.
- ‏Regime-adaptive ranking.

### ‏`P4`

- ‏Heavy ML rank ensemble.
- ‏Per-symbol ranking policy.
- ‏Complex online learning / auto-retuning.

---

## ‏23. What I Would Avoid Initially

‏לא הייתי מתחיל מ־:

- ‏ML ranker opaque.
- ‏עשרות normalization layers.
- ‏Dynamic cohorts רבים.
- ‏per-symbol weights.
- ‏automatic candidate switch על כל Top-1 change.
- ‏Full-universe deep execution analysis בכל event.
- ‏Score שמנסה לבלוע Data Quality, Risk, Safety ו־Execution לתוך מספר אחד.
- ‏Threshold tuning על אותו holdout שוב ושוב.
- ‏Assumption ש־Rank #1 = trade.

---

## ‏24. What to Add Later

‏רק אם Evidence מצדיק:

- ‏Execution-aware ranking calibrated empirically.
- ‏Cohort / regime rankers.
- ‏Rank uncertainty bands.
- ‏Candidate persistence model.
- ‏Switch-cost-aware dynamic replacement.
- ‏Sector / market relative context.
- ‏Learned ranker.
- ‏Adaptive Top-N depth.
- ‏Online calibration monitoring.

---

## ‏25. Required Data / Evidence

‏לפחות:

```text
point-in-time universe
Top-N snapshots
feature values / versions
input ages
fresh coverage
score distribution
rank gaps
rank churn / dwell
rank at detection/submit/fill
execution feasibility
cost estimates
fill / no-fill outcome
post-fill markout
exit outcome / TimeToFlat
NO_TRADE outcomes
regime/session
provider/data generation
```

‏בלי Top-N context קשה להעריך Winner's Curse ו־Selection Regret.

---

## ‏26. Confidence

### ‏High Confidence

- ‏Rank #1 לבדו אינו מספיק ל־Trade.
- ‏Freshness/Fairness הן חלק מ־Cross-Sectional correctness.
- ‏Relative Rank חייב Absolute Gate.
- ‏Score אינו Probability בלי Calibration.
- ‏Prediction Rank ו־Execution economics הם שאלות שונות.
- ‏Tie-breaking צריך להיות deterministic.
- ‏Execution state אינו נמחק בגלל Rank חדש.
- ‏Pre-submit revalidation נדרש ל־short-lived signals.

### ‏Medium Confidence — Requires Empirical Calibration

- ‏Rank gap כ־predictor.
- ‏Candidate persistence / dwell thresholds.
- ‏Rank velocity / score velocity.
- ‏Cohort normalization.
- ‏Sector-relative adjustments.
- ‏Hysteresis/switch cost policy.
- ‏Execution-aware re-rank.

### ‏Low / Research Only

- ‏Complex learned ranker.
- ‏Dynamic regime-specific model switching.
- ‏Online auto-retuning.
- ‏Per-symbol ranking logic.

---

## ‏27. Time-Sensitive Facts

‏מקטע 60 מתודולוגי בעיקרו ואינו מקבע Broker/Venue/Regulatory semantics תלויי־זמן.

‏לכן לא נדרש Web verification חדש למסקנות הליבה.

‏אם Ranking עתידי ישתמש ב־:

```text
provider-specific fields
broker availability
venue-specific liquidity
session/order capabilities
market-status semantics
```

‏ה־capabilities וה־definitions ייבדקו מול תיעוד עדכני לפני שימוש תפעולי.

---

## ‏28. Relationship to Earlier Sheets

- ‏`14` — Source of Truth ל־Score / Cross-Sectional Ranking model.
- ‏`15` — Source of Truth ל־Candidate Selection ו־`TRADE / NO_TRADE`.
- ‏`22` — Source of Truth ל־predictive validation של Scanner.
- ‏`23` — Source of Truth ל־leakage / overfitting / holdout integrity.
- ‏`24` — Source of Truth ל־Champion/Challenger controlled experiments.
- ‏`25` — Regime analysis.
- ‏`26` — Rank #1 failure RCA / First Divergence.
- ‏`46` — Fill conditionality / adverse selection.
- ‏`48` — latency as edge preservation.
- ‏`50` — Scanner runtime architecture, incremental state ו־Top-N funnel.
- ‏`59` — Market Data semantics, freshness ו־cross-sectional data integrity.

‏מקטע 60 מוסיף מעליהם:

```text
Cross-Sectional Selection Mechanics
+ Winner Uncertainty
+ Rank Stability / Churn
+ Separation / Noise Floor
+ Timing Fairness
+ Switching Economics
```

---

## ‏29. Relationship to 60A

‏60 עונה:

```text
Who ranks best,
how trustworthy is that ordering,
and is the winner still actionable?
```

‏`60A` יוסיף שכבה עצמאית:

```text
What negative evidence should veto,
penalize,
or cool down a candidate
regardless of its positive rank?
```

‏לכן לא ננסה להחביא את כל Negative Evidence בתוך Score.

‏הארכיטקטורה המועדפת לקראת 60A:

```text
Positive Evidence / Ranking
+
Negative Evidence / Veto
+
Execution Feasibility
→ Decision Aggregator
```

---

## ‏30. Recommendation Summary

‏ברירת המחדל לרובוט שלנו:

```text
Point-in-Time Eligible Universe
→ Freshness/Fairness Gate
→ Simple Explainable Score
→ Deterministic Cross-Sectional Rank
→ Top-N Snapshot
→ Rank Gap / Churn / Persistence Diagnostics
→ Prediction Rank
→ Execution Feasibility / Expected Net Edge
→ RelativeBest + AbsoluteGoodEnough
→ TRADE_CANDIDATE or NO_TRADE
→ Pre-Submit Revalidation
→ Rank-at-Submit / Rank-at-Fill Tracking
→ RCA / Selection Regret / Learning
```

‏המסר המרכזי:

```text
Do not optimize for being Rank #1.
Optimize for selecting, in time,
a fresh, fair, explainable and executable opportunity
whose net edge survives the path to action.
```
