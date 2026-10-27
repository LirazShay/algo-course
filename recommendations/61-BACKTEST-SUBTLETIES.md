# ‏61 — Recommendation Sheet: Backtest Subtleties

> ‏מקור לימודי עיקרי: `../61-BACKTEST-SUBTLETIES.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מחקרי ל־`Backtest` של רובוט `Short-Horizon Momentum` כך שהוא לא יחשב רק PnL היסטורי, אלא ישחזר בצורה point-in-time את מה שהיה ידוע, את החלטות המערכת, את מגבלות ה־Execution, את uncertainty של fill/latency/queue ואת השפעת ה־Strategy state, ה־capital וה־risk לאורך הזמן.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה להפעלה בכסף אמיתי, אינו מאשר מעבר למסחר חי ואינו מבטיח רווח.

---

## ‏1. Decision

‏`Backtest` אצלנו אינו מחשבון:

```text
Historical Prices
→ Entry
→ Exit
→ PnL
```

‏הוא **Causal Point-in-Time Execution Simulator with Explicit Uncertainty**.

‏ה־Baseline:

```text
Historical Market Reality
→ What Was Observable As-Known-At
→ Canonical State
→ Strategy State
→ Features / Eligibility / Ranking / Vetoes
→ TRADE / NO_TRADE Decision
→ Decision-to-Submit Delay
→ Pre-Submit Revalidation
→ Execution Simulation
→ Fill / Partial / No Fill / Cancel / Unknown
→ Position / Pending Exposure
→ Exit Logic / Time-to-Flat
→ Costs / Impact / Adverse Selection
→ Net Executable Outcome
→ Attribution / RCA
```

‏העקרונות המחייבים:

```text
Historical Truth != Live-Known Truth
Touch != Fill
Print != Executable Price
Trigger != Fill
CancelRequested != Canceled
Average Latency != Latency Distribution
Gross Alpha != Executable Net Edge
Top-1 Winner != Unbiased Sample
Backtest Truth != Live Truth
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: שלוש רמות Backtest נפרדות

‏לא כל רעיון צריך מיד סימולטור Microstructure כבד.

‏נשתמש בשלושה Levels:

```text
Level 1 — Fast Causal Screening
Level 2 — Event-Level Realistic Execution Replay
Level 3 — Stress / Uncertainty Envelope
```

‏תפקידיהם שונים.

### ‏Level 1 — Fast Causal Screening

‏נועד לענות מהר על:

```text
Does the signal appear predictive?
Does ranking sort future outcomes?
Does the candidate logic behave coherently?
```

‏הוא מתאים ל־Feature screening, labels, horizons, ranking buckets ו־ablation ראשוני.

‏הוא **אינו** Evidence מספיק ל־profitability או ל־Promotion של Execution policy.

### ‏Level 2 — Event-Level Realistic Execution Replay

‏ל־survivors של Level 1 נדרוש לפחות:

```text
point-in-time data
historical universe
Bid / Ask
signal TTL
entry latency
exit latency
order lifecycle
partial fills when relevant
no-fill state
cancel/fill race when relevant
point-in-time costs
veto/cooldown state
pending exposure
TimeToFlat
```

‏ה־Execution Model צריך להתאים ל־Order policy שנבדקת.

### ‏Level 3 — Stress / Uncertainty Envelope

‏נריץ את אותה Strategy תחת assumptions פחות נוחים:

```text
higher latency
wider spread
worse slippage
lower fill probability
lower available depth
higher adverse-selection cost
higher market-data degradation
higher exit friction
```

‏המטרה אינה להיות פסימיים לשם הפסימיות.

‏המטרה היא למדוד **כמה Edge נשאר כאשר model uncertainty זזה בטווח סביר**.

---

## ‏3. `P0` — Backtest משחזר `As-Known-At`

‏Decision בזמן `T` רשאי להשתמש רק ב־Evidence שהיה זמין למערכת עד `T`.

```text
usable_event.receive_time <= decision_time
```

‏כאשר `receive_time` אינו קיים, ה־Dataset חייב להצהיר במפורש מה ידוע ומה משוער.

‏אסור ש־Backtest יקבל Future Information דרך:

```text
later correction
end-of-bar values
future universe membership
end-of-day normalization
future corporate-action cleanup
final session labels
future negative-memory confirmation
future feature scaling statistics
```

---

## ‏4. Four-Layer Truth Model

‏כל Run צריך להפריד:

```text
Historical Market Reality
Observed / Available Reality
Strategy Decision Reality
Execution Reality
```

‏לדוגמה:

```text
market moved through 100.20
```

‏אינו אומר:

```text
our system observed 100.20 in time
```

‏ואינו אומר:

```text
our order could fill 300 shares at 100.20
```

‏הפרדה זו היא תנאי ל־RCA אמין.

---

## ‏5. `P0` — Event-Level Path כאשר ה־Strategy תלויה במסלול

‏כאשר Exit/Stop/Giveback/TTL/Partial Fill תלויים בסדר האירועים, Bar יחיד אינו מספיק.

```text
OHLC
!=
ordered market path
```

‏לכן עבור Strategy של milliseconds-to-seconds:

- ‏Bar Backtest מתאים רק ל־screening coarse כאשר hypothesis מאפשרת זאת.
- ‏Event-level evidence נדרש לפני Promotion של logic path-dependent.
- ‏אם Dataset אינו ברזולוציה הנדרשת, מסמנים `INSUFFICIENT_FIDELITY` ולא ממציאים path.

---

## ‏6. `P0` — Execution Price מגיע מ־Executable State

‏אסור להשתמש ב־`Last` כברירת מחדל למחיר Fill.

‏נשמור בנפרד:

```text
reference_price
quote_at_arrival
executable_price
simulated_fill_price
```

‏ל־aggressive order נבדוק available liquidity וה־price bound.

‏ל־passive order נבדוק fill model ולא `touch = fill`.

---

## ‏7. `P0` — Passive Fill אינו ודאי

‏ל־passive orders:

```text
P(fill | price, queue, flow, time, venue, regime)
```

‏Queue position היא latent variable כאשר אין Evidence מדויק.

‏לכן נשמור:

```text
queue_model
queue_confidence
fill_model_version
fill_confidence
```

‏ונבדוק לפחות כמה fidelity assumptions.

---

## ‏8. Fill-Fidelity Envelope

‏ל־passive execution נרצה לפחות:

```text
Optimistic Fill Model
Baseline Fill Model
Conservative Fill Model
```

‏אם Strategy חיובית רק תחת optimistic fill assumptions:

```text
REJECT / RESEARCH_MORE
```

‏לא `PROMOTE`.

---

## ‏9. `P0` — Partial Fills הם Position אמיתי

‏Simulation חייב לעדכן אחרי כל Partial Fill:

```text
filled_qty
avg_fill_price
actual_position
remaining_working_qty
potentially_live_qty
pending_exposure
risk
exit_obligation
```

‏אין מצב שבו Partial Fill נשמר רק כ־Execution diagnostic בזמן שה־Position Engine ממשיך לחשוב `flat`.

---

## ‏10. `P0` — Cancel / Fill Race

‏Backtest חייב לאפשר:

```text
CancelRequested
→ Fill
→ CancelConfirmed
```

‏ולא להניח:

```text
CancelRequested == Canceled
```

‏אותו עיקרון חל על Replace overlap.

---

## ‏11. `UNKNOWN_EFFECT` ב־Fault Backtests

‏נריץ fault scenarios שבהם:

```text
submit sent
→ timeout / disconnect
→ external effect unknown
```

‏המערכת צריכה לעבור ל־reconciliation ולא לשלוח duplicate blindly.

‏כך Backtest בודק גם Execution correctness תחת ambiguity, לא רק happy path.

---

## ‏12. `P0` — Signal TTL ו־Order Aging

‏נשמור לפחות:

```text
signal_age_at_decision
signal_age_at_submit
signal_age_at_fill
order_age
remaining_edge
```

‏Fill שמתרחש אחרי שה־Signal כבר expired הוא:

```text
technically filled
but potentially economically stale
```

‏ה־Backtest צריך לתייג זאת במפורש.

---

## ‏13. Latency היא Distribution

‏Baseline constant latency יכול להיות שימושי ל־screening.

‏לפני Promotion נדרוש:

```text
p50
p90
p95
p99
```

‏וכאשר יש Evidence:

```text
latency by regime
latency by load
entry latency
exit latency
broker path latency
market-data latency
```

---

## ‏14. Correlated Latency

‏אסור להניח שכל latency sample independent כאשר production slowdowns נוטים להתרחש בזמן burst.

‏Stress simulation צריך לכלול episodes שבהם יחד:

```text
market activity ↑
queue age ↑
processing latency ↑
spread ↑
depth ↓
```

‏זה קריטי במיוחד ל־short-horizon edge.

---

## ‏15. Latency Sensitivity Curve

‏לא נבדוק latency point אחד בלבד.

‏נריץ grid או empirical distributions כדי לגזור:

```text
NetOutcome(latency)
FillQuality(latency)
RankDecay(latency)
TimeToFlat(latency)
```

‏המטרה היא לזהות:

```text
Break-Even Latency
Latency Cliff
Latency Headroom
```

---

## ‏16. Signal Half-Life Contract

```text
LatencyPressure
=
EndToEndLatency / SignalHalfLife
```

‏Backtest שמצליח רק כאשר `LatencyPressure` נמוך באופן בלתי־מציאותי אינו שימושי למערכת שלנו.

---

## ‏17. Spread ו־Slippage הם Point-in-Time

‏לא משתמשים ב־daily average spread לתמחור Trade בודד.

‏נשמור Point-in-Time:

```text
entry_spread
exit_spread
spread_at_submit
spread_at_fill
```

‏Slippage יותנה ככל האפשר ב־:

```text
size
spread
depth
volatility
urgency
market state
```

‏ולא ב־constant bps אוניברסלי בלבד.

---

## ‏18. `P0` — Adverse Selection בתוך ה־Execution Model

‏Fill Rate גבוה אינו בהכרח טוב.

‏נמדוד:

```text
Fill Rate
+
Post-Fill Markout
```

‏ונשווה:

```text
Outcome | Filled
Outcome | Unfilled
```

‏כדי לזהות fill-selection bias.

---

## ‏19. No-Fill הוא Outcome כלכלי

‏כל Attempt נשמר גם כאשר לא התמלא.

‏נבדוק:

```text
no_fill_count
missed_opportunity_after_no_fill
avoided_bad_fill_after_no_fill
```

‏No-fill יכול להיות:

- ‏missed winner.
- ‏correct avoidance.
- ‏uninformative.

‏אין להפוך אותו אוטומטית ל־0 PnL.

---

## ‏20. Missed Opportunity

‏Missed Opportunity הוא חלק מהשוואת Execution policies, אבל לא “הפסד דמיוני” בכל פעם שהשוק זז בלעדינו.

‏הוא נמדד רק במסגרת Counterfactual מוגדרת:

```text
same signal
same context
different execution policy
```

‏ובצירוף Confidence של ה־counterfactual.

---

## ‏21. `P0` — Exit Modeling חשוב לפחות כמו Entry

‏נשמור:

```text
exit_trigger_time
exit_decision_time
exit_submit_time
exit_arrival_time
first_exit_fill_time
flat_time
```

‏ונמדוד:

```text
TimeToFlat
```

‏לא רק Time-to-first-fill.

---

## ‏22. Stop/Target Semantics

```text
TargetTouched != TargetFilled
StopTriggered != StopFilled
```

‏אם price crossed threshold אך לא הייתה executable liquidity, Backtest אינו רשאי לתת Fill קסם.

---

## ‏23. MFE / MAE / Giveback

‏לכל Position נשמור לפחות:

```text
MFE
MAE
exit_return
giveback
```

‏כאשר:

```text
giveback = MFE - exit_return
```

‏זה מאפשר להפריד:

```text
good entry + bad exit
```

‏מ־:

```text
bad prediction from the start
```

---

## ‏24. `P0` — Size אינו Linear Scaling

‏אין:

```text
PnL(10x capital) = 10 × PnL(base capital)
```

‏בלי בדיקת impact/capacity.

‏נבדוק:

```text
NetEdge(size)
MarginalEdge(size)
TimeToFlat(size)
FillRate(size)
Slippage(size)
```

---

## ‏25. Capacity Curve בתוך Backtest

‏Backtest משמעותי ל־Scaling ישמור מספר size buckets.

‏נרצה לזהות:

```text
comfortable size
capacity knee
break-even size
stress size
```

‏Scaling capital נחשב Experiment חדש.

---

## ‏26. `P0` — Historical Point-in-Time Universe

‏Universe הוא Data.

‏נדרש:

```text
Universe(as_of_time)
```

‏ולא current symbol list שמוחזרת לעבר.

‏נשמור:

```text
UniverseVersion
EligibleCount
ExcludedCount
ExclusionReasons
```

---

## ‏27. Symbol Lifecycle / Corporate Actions

‏Backtest צריך להכיר:

```text
listings
delistings
ticker changes
mergers
splits
```

‏Execution research קצר ישתמש ב־raw tradable prices של התקופה כאשר מתאים.

‏Adjusted prices אינם מוחלפים אוטומטית במחירים שבהם ניתן היה לבצע Orders.

---

## ‏28. Session / Auction / Halt Context

‏Premarket, Regular, After-hours, Auctions ו־Halt/Reopen הם contexts שונים.

‏ה־Backtest לא יערבב אותם כאילו אותו model מתאים אוטומטית לכולם.

‏Intervals לא־tradable נשמרים ככאלה.

---

## ‏29. Data Gaps / Batching / Corrections

‏Replay צריך לשמר כאשר אפשר:

```text
gap state
batch arrival
late events
corrections
original observed state
later corrected state
```

‏Data cleaning אינו רשאי להפוך Live-like imperfections ל־perfect history בלי provenance.

---

## ‏30. Deterministic Replay מול Stochastic Execution Simulation

‏אלה שתי מטרות שונות.

‏`Deterministic Replay`:

```text
same tape + same versions
→ same market/strategy decisions
```

‏`Stochastic Execution Simulation`:

```text
same decision path
→ multiple plausible fill / latency outcomes
```

‏נפריד ביניהם במפורש.

---

## ‏31. Seeded Randomness

‏כאשר execution model stochastic:

```text
random_seed
```

‏הוא חלק מה־Experiment Manifest.

‏כל Run צריך להיות ניתן לשחזור.

---

## ‏32. Monte Carlo Execution Paths

‏ל־uncertain fills/latency/queue אפשר להריץ מספר plausible paths.

‏התוצר אינו PnL יחיד אלא distribution:

```text
median
p10
p25
p75
p90
worst-tail mean
```

‏וכאשר מתאים:

```text
probability_net_positive
probability_stress_failure
```

---

## ‏33. Best / Base / Stress אינם Labels שיווקיים

‏לכל Scenario נדרש contract מתועד של assumptions.

```text
Optimistic
Baseline
Conservative / Stress
```

‏אסור לשנות כמה assumptions יחד בלי לתעד זאת.

---

## ‏34. Parameter Surface > Best Parameter

‏לא נבחר magic point.

‏נבדוק:

```text
metric(parameter)
```

‏על טווח ונחפש:

```text
robust plateau
```

‏ולא spike חד.

---

## ‏35. Multiple Testing / Winner's Curse

‏כל Trial נוסף מגדיל false-positive risk.

‏נשמור:

```text
trial_count
parameter_family
hypothesis_id
```

‏וה־winner של 500 configurations אינו מקבל Promotion בלי Confirmatory/OOS evidence.

---

## ‏36. `P0` — Top-1 Selection Bias

‏בחירת Maximum מתוך אלפי Symbols יוצרת Winner's Curse גם אם Feature עצמו unbiased.

‏לכן נמדוד:

```text
Top1
Top3
Top5
Top10
RankBuckets
```

‏ונבדוק Rank monotonicity, RankGap ו־Top-N counterfactuals.

---

## ‏37. Rank State בתוך Backtest

‏לכל Decision נשמור:

```text
TopN
RankGap
RankChurn
CandidateDwellTime
RankAtDetection
RankAtDecision
RankAtSubmit
RankAtFill
```

‏כך Backtest משחזר גם selection mechanics ולא רק את ה־winner הסופי.

---

## ‏38. Freshness Fairness / Watermark

‏Cross-sectional ranking משתמש ב־explicit cutoff/watermark.

‏נשמור:

```text
DecisionAsOfTime
FreshCoverageRatio
InputAgeByCandidate
FreshnessSkew
```

‏Winner שנוצר משום שחלק מהמתחרים stale אינו Evidence תקין.

---

## ‏39. Negative Evidence Point-in-Time

‏כל Veto / Penalty / Cooldown מ־60A חייב להיות observable בזמן שבו הופעל.

‏אין להשתמש ב־:

```text
future failed-breakout confirmation
future giveback
future markout
```

‏כדי להצדיק historical veto מוקדם יותר.

---

## ‏40. Stateful Strategy Simulation

‏Backtest משחזר גם Strategy Memory:

```text
cooldowns
negative memory
recent failed episodes
last-fill toxicity state
rank persistence
position state
pending orders
risk reservations
```

‏Trade-by-trade independent simulation אינו מספיק כאשר החלטה אחת משנה את opportunity set הבא.

---

## ‏41. Restart Semantics

‏כאשר Production state יכול להשתנות בעקבות Restart, נריץ גם scenarios של:

```text
restart
→ state recovery
→ reconciliation
→ readiness
```

‏כדי לוודא שה־Backtest אינו מניח memory מושלמת אם המערכת האמיתית אינה מבטיחה זאת.

---

## ‏42. Capital / Buying-Power / Exposure Constraints

‏אין unlimited capital.

‏בכל רגע:

```text
filled exposure
+ working exposure
+ uncertain exposure
+ reserved capacity
```

‏צריכים להשפיע על האפשרות לבחור Opportunity חדשה.

---

## ‏43. Concurrent Opportunities

‏כאשר A/B/C מופיעות יחד אבל אפשר לממן רק אחת:

‏בחירת Candidate היא חלק מה־Strategy.

‏Backtest חייב לשחזר:

```text
arrival ordering
ranking state
current reservations
pending exposure
selection policy
```

---

## ‏44. Pending Orders צורכים Capacity

‏Order שלא התמלא עדיין אינו “חינם”.

‏הוא יכול לצרוך:

```text
capital reservation
risk reservation
position capacity
attention / execution slot
```

‏לכן הסימולטור לא פותח Opportunity אחרת כאילו Pending Exposure לא קיימת.

---

## ‏45. Cost Model מפורק

‏נשמור בנפרד:

```text
spread
slippage
impact
commission
fees
adverse_selection
latency_cost
missed_opportunity
```

‏כך אפשר לדעת מה באמת מחק את ה־Gross Edge.

---

## ‏46. Break-Even Cost / Edge Headroom

‏לכל Strategy/Regime נמדוד:

```text
EdgeHeadroom
=
GrossEdge - ExpectedCosts - StressBuffer
```

‏וכן:

```text
BreakEvenAdditionalCost
```

‏Strategy עם Headroom זעיר רגישה יותר ל־model error ול־Live drift.

---

## ‏47. Regime Analysis בלי Leakage

‏נבדוק לפחות:

```text
time of day
volatility bucket
liquidity bucket
price bucket
market stress
session state
```

‏אבל כל Regime label חייב להיות observable point-in-time.

‏אין להשתמש בתיאור retrospective של כל היום כדי להחליט מה הייתה ה־regime ב־10:02.

---

## ‏48. Sample Independence

‏`1000` signals מאותו market burst אינם `1000` observations עצמאיים.

‏נוסיף analysis לפי:

```text
day
symbol
episode
regime
```

‏ונעקוב אחרי effective sample size.

---

## ‏49. Chronological Risk

‏Drawdown מחושב לפי sequence אמיתי.

‏אין shuffle לפני חישוב:

```text
equity curve
drawdown
capital path
risk-limit interactions
```

‏Sequence risk הוא חלק מה־System outcome.

---

## ‏50. Metrics — לא רק PnL

‏Baseline metrics:

```text
net outcome
trade count
NO_TRADE count
fill rate
partial fill rate
missed opportunity
post-fill markout
MFE
MAE
giveback
TimeToFirstProfit
TimeToTarget
TimeToFill
TimeToFlat
RankGap
RankChurn
NetEdgeRetained
```

‏בנוסף נשמור distributions ולא רק mean.

---

## ‏51. Label Horizon Grid

‏נבדוק מספר horizons רק כאשר Data fidelity תומכת בהם.

‏המטרה:

```text
understand decay curve
```

‏לא:

```text
select hindsight-best horizon
```

‏כל horizon search נספר כחלק מ־multiple testing.

---

## ‏52. Entry Label != Executable Trade Outcome

‏Feature יכול לחזות future price move ועדיין להיכשל כלכלית בגלל:

```text
spread
slippage
latency
fill selection
exit friction
```

‏לכן Prediction metrics ו־Execution metrics נשמרים בנפרד.

---

## ‏53. Counterfactual Exit Policies

‏על אותו Decision אפשר להשוות:

```text
fixed target
time exit
signal decay
giveback logic
```

‏אבל כל Policy נוספת היא Experiment נוסף.

‏אין לבחור את המנצחת בדיעבד ללא OOS discipline.

---

## ‏54. Counterfactual Entry Policies

‏Passive/Aggressive/Marketable-Limit comparison אפשרי רק אם לכל אחד execution model מתאים.

‏אסור:

```text
compare passive with touch=fill
against aggressive with realistic slippage
```

‏זו השוואה לא הוגנת.

---

## ‏55. Shadow Counterfactuals

‏ב־Shadow/Paper ניתן לשמור:

```text
chosen policy
unchosen policy decisions
observed market path
```

‏כדי לכייל את ה־Backtest מול Reality.

---

## ‏56. Backtest-to-Live Calibration

‏ה־Simulation עצמו מקבל Calibration metrics:

```text
predicted_fill_rate vs observed_fill_rate
predicted_slippage vs observed_slippage
predicted_latency vs observed_latency
predicted_markout vs observed_markout
predicted_no_trade_rate vs observed_no_trade_rate
predicted_time_to_flat vs observed_time_to_flat
```

‏`Simulation Error` הוא Metric מפורש.

---

## ‏57. Calibration לפי Context

‏נפריד לפחות כאשר sample מאפשר:

```text
normal vs fast market
liquid vs thin
open vs midday
small vs larger requested size
passive vs aggressive
```

‏מודל שמכויל בממוצע אך נכשל בדיוק ב־fast markets אינו מספיק.

---

## ‏58. Model Versioning

‏כל Model משמעותי מקבל Version:

```text
fill_model_version
queue_model_version
latency_model_version
cost_model_version
impact_model_version
execution_policy_version
```

‏Result אינו קיים ללא versions שלו.

---

## ‏59. Experiment Manifest

‏כל Run שומר לפחות:

```text
experiment_id
dataset_version
universe_version
code_version
config_version
feature_version
filter_version
ranking_version
veto_version
label_version
execution_model_version
cost_model_version
latency_model_version
random_seed
start_time
end_time
```

---

## ‏60. Reproducibility Gate

```text
same frozen data
+ same code
+ same config
+ same model versions
+ same seed
→ same semantic result
```

‏אם Run אינו reproducible, הוא אינו יכול לשמש Promotion evidence.

---

## ‏61. Immutable Results / Negative Results

‏אין overwrite של Result ישן.

‏Run חדש:

```text
new experiment_id
```

‏גם Negative Result נשמר כחלק מ־Research Memory.

---

## ‏62. Primary Metric מראש

‏לכל Experiment משמעותי נגדיר לפני הריצה:

```text
primary_metric
secondary_metrics
guardrails
promotion_criteria
rejection_criteria
```

‏Diagnostic metric אינו מקבל אוטומטית סמכות Promotion.

---

## ‏63. Holdout / Walk-Forward

‏Holdout שנצפה שוב ושוב במהלך Development אינו Holdout אמיתי.

‏למערכת time-varying נעדיף:

```text
chronological split
walk-forward
locked confirmatory period
```

‏על random split נאיבי.

---

## ‏64. Purging / Embargo / Overlap Awareness

‏כאשר label windows חופפים בזמן, יש dependency בין samples.

‏ה־validation design צריך למנוע leakage דרך overlap של feature/label periods.

---

## ‏65. Null / Canary Tests

‏לפני שנאמין ל־Alpha נריץ ככל שמתאים:

```text
random eligible baseline
naive momentum baseline
shuffle test
time-shift test
data-corruption canary
```

‏אם pipeline ממשיך להפיק “edge” כאשר signal הושמד בכוונה, יש חשד לבאג או Leakage.

---

## ‏66. Ablation

‏כל Feature/Rule/Veto חשוב צריך להיות ניתן להסרה.

‏נמדוד:

```text
candidate changes
decision changes
net outcome changes
latency changes
complexity changes
```

‏Contribution ל־Score אינו Causal contribution ל־performance.

---

## ‏67. Complexity Tax

‏גרסה מורכבת צריכה להראות incremental value אחרי:

```text
latency cost
operational complexity
failure surface
maintenance cost
sample reduction
```

‏PnL headline גבוה יותר אינו מספיק.

---

## ‏68. `NO_TRADE` הוא Full Outcome

‏Backtest שומר:

```text
candidate set
reason codes
vetoes
freshness
expected costs
NO_TRADE decision
forward outcome
```

‏כך ניתן לבדוק אם המערכת הייתה selective בצורה מועילה או פשוט פחדנית מדי.

---

## ‏69. Decision Journal

‏לכל Decision נשמור לפחות:

```text
decision_id
as_of_time
candidate_set
top_n
scores
ranks
rank_gaps
freshness
vetoes
expected_costs
execution_plan
risk_state
final_decision
```

‏ל־Trade נוסיף Order/Fill/Exit lifecycle.

---

## ‏70. Backtest Diff

‏כאשר משווים Strategy versions, לא מסתפקים ב־PnL difference.

‏נפיק:

```text
same decisions
new decisions
removed decisions
candidate replacements
changed sizes
changed execution modes
changed fills
changed exits
changed NO_TRADE reasons
```

---

## ‏71. First Divergence בין Versions

‏לכל Difference חשוב נחפש:

```text
first event where behavior diverged
```

‏כדי להבדיל בין Cause לבין downstream symptom.

---

## ‏72. Performance Attribution

‏Improvement יסווג לפי:

```text
Prediction
Candidate Selection
Negative Evidence
Execution
Costs
Exit
Risk / Sizing
Operational Assumption
```

‏אם “momentum improvement” נובע בפועל מ־fee assumption, הסיפור המחקרי שגוי.

---

## ‏73. Backtest Speed מול Fidelity

‏KISS baseline:

```text
cheap screening for many ideas
→ deep replay only for survivors
→ stress only for serious candidates
```

‏אין טעם להריץ expensive microstructure simulation על כל Feature חלש.

---

## ‏74. Calibrated Realism, לא Maximum Pessimism

‏היעד אינו להעניש את Strategy.

‏היעד:

```text
best estimate
+ uncertainty range
```

‏Model מחמיר מדי יכול לייצר false rejection בדיוק כפי שמודל אופטימי מדי מייצר false promotion.

---

## ‏75. Confidence Bands / Scenario Envelope

‏במקום מספר יחיד:

```text
Expected Net Outcome = X
```

‏נעדיף:

```text
Base
Conservative
Stress
+ confidence / limitations
```

‏במיוחד כאשר Queue/Fill reality אינה נצפית במדויק.

---

## ‏76. Required Data / Evidence

‏ל־Level 2/3 נרצה ככל שה־Hypothesis דורשת:

```text
raw/canonical events
Bid/Ask
trade prints + conditions
sequence/gap state
receive timestamps
historical universe
trading status
session context
order-policy parameters
cost versions
latency traces/distributions
fill/partial/no-fill observations
position/pending-exposure state
```

‏אם Evidence מסוים חסר, Confidence יורד או Fidelity level מוגבל.

---

## ‏77. Promotion Criteria

‏Backtest evidence יכול להתקדם ל־Replay/Shadow/Paper validation רק אם:

- ‏ה־Dataset point-in-time correct ברמת ה־Hypothesis.
- ‏Universe היסטורי נכון.
- ‏אין Leakage ידוע.
- ‏ה־Strategy reproducible.
- ‏Execution model מתאים ל־Order policy.
- ‏Fill assumptions שורדים Conservative model.
- ‏Latency sensitivity אינה מוחקת מיד את ה־Edge.
- ‏Costs מלאים ברמת המחקר.
- ‏NO_TRADE / no-fill / partial fills נשמרים.
- ‏Top-1 selection bias נבדק.
- ‏OOS/Walk-forward עברו.
- ‏Parameter surface אינה needle-like.
- ‏Stress case אינו מוחק לחלוטין את ה־Edge ללא הסבר.
- ‏Net benefit אינו תלוי רק ב־sample קטן/יום אחד/symbol אחד.
- ‏Known limitations מתועדות.

---

## ‏78. Rejection Criteria

‏נפסול או נחזיר ל־Research אם:

- ‏Edge קיים רק עם look-ahead או corrected future data.
- ‏Touch=Fill הוא תנאי להצלחה.
- ‏ה־Strategy נשברת תחת latency/slippage שינוי קטן.
- ‏Passive alpha נעלם ב־fill model שמרני.
- ‏Top-1 בלבד עובד ללא rank monotonicity סבירה או Top-K evidence.
- ‏תוצאה נשענת על future universe.
- ‏Exit realism מוחק את ה־PnL.
- ‏Size scaling מניח linearity לא מציאותית.
- ‏Result אינו reproducible.
- ‏Holdout כבר שימש שוב ושוב ל־tuning.
- ‏Complexity עלתה בלי incremental net value.
- ‏Stress failures אינם מובנים או מוסברים.

---

## ‏79. Metrics

### ‏Research / Prediction

```text
forward outcome by rank
rank monotonicity
rank gap
rank churn
candidate persistence
Decision Impact Rate
```

### ‏Execution

```text
fill_rate
partial_fill_rate
no_fill_rate
signal_age_at_fill
slippage
markout
cancel_fill_race_rate
missed_opportunity
```

### ‏Exit

```text
TimeToFirstProfit
TimeToTarget
MFE
MAE
giveback
TimeToFlat
exit_slippage
```

### ‏Economics

```text
gross_edge
net_edge
net_edge_retained
break_even_cost
edge_headroom
capacity_curve
```

### ‏Model Quality

```text
simulation_error
predicted_vs_observed_fill
predicted_vs_observed_slippage
predicted_vs_observed_latency
predicted_vs_observed_markout
```

---

## ‏80. Failure Modes / RCA Taxonomy

```text
BT_LOOKAHEAD
BT_AS_KNOWN_AT_VIOLATION
BT_FUTURE_UNIVERSE
BT_BAR_PATH_FANTASY
BT_TOUCH_EQUALS_FILL
BT_PRINT_EQUALS_EXECUTABLE
BT_QUEUE_OPTIMISM
BT_PARTIAL_FILL_IGNORED
BT_CANCEL_FILL_RACE_IGNORED
BT_REPLACE_PRIORITY_IGNORED
BT_SIGNAL_TTL_IGNORED
BT_LATENCY_CONSTANT_BIAS
BT_LATENCY_REGIME_MISMATCH
BT_SPREAD_AVERAGED
BT_SLIPPAGE_UNREALISTIC
BT_ADVERSE_SELECTION_IGNORED
BT_FILL_SELECTION_BIAS
BT_NO_FILL_DROPPED
BT_EXIT_FANTASY
BT_TIME_TO_FLAT_IGNORED
BT_SIZE_LINEARITY
BT_CAPACITY_IGNORED
BT_SESSION_MISCLASSIFIED
BT_DATA_GAP_HIDDEN
BT_BATCHING_ARTIFACT
BT_NONDETERMINISTIC_REPLAY
BT_PARAMETER_HUNTING
BT_MULTIPLE_TESTING
BT_TOP1_SELECTION_BIAS
BT_STATE_MEMORY_MISSING
BT_CAPITAL_CONSTRAINT_MISSING
BT_PENDING_EXPOSURE_MISSING
BT_COST_UNDERSPECIFIED
BT_REGIME_LEAKAGE
BT_CLUSTERED_SAMPLE_OVERCOUNT
BT_HOLDOUT_CONTAMINATED
BT_SIMULATION_CALIBRATION_DRIFT
BT_UNKNOWN
```

---

## ‏81. Golden Scenarios

‏נשמור לפחות:

1. ‏Signal מתקבל, Quote משתנה לפני Arrival.
2. ‏Passive Limit נוגע במחיר אך אינו מתמלא.
3. ‏Partial Fill ואז remainder canceled.
4. ‏Cancel Request ולאחריו Fill.
5. ‏Marketable Limit עוצר ב־hard price cap.
6. ‏Signal expired לפני Fill.
7. ‏Latency spike בזמן market burst.
8. ‏Filled loser מול unfilled winner.
9. ‏Target print קיים אך אין executable liquidity.
10. ‏Exit trigger מהיר אך TimeToFlat ארוך.
11. ‏Size גדול צורך מספר levels.
12. ‏Historical correction מגיע אחרי Decision.
13. ‏Universe symbol לא היה קיים בזמן ההיסטורי.
14. ‏Halt/Reopen בתוך Position lifecycle.
15. ‏Data gap יוצר momentum jump מזויף.
16. ‏Provider batching יוצר fake acceleration.
17. ‏Cooldown משפיע על Opportunity עתידית.
18. ‏שלוש Opportunities מתחרות על Capital אחד.
19. ‏Pending order חוסם Opportunity אחרת.
20. ‏Restart באמצע stateful cooldown/order lifecycle.
21. ‏Top-1 משתנה בגלל stale competitors.
22. ‏Optimistic fill חיובי, Conservative fill שלילי.
23. ‏Backtest ו־Shadow מתפצלים ב־first fill.
24. ‏אותו Run עם אותו Seed חוזר בדיוק.

---

## ‏82. Property / Invariant Tests

```text
Decision at T cannot consume evidence received after T.
Ineligible symbol cannot become executable winner.
Unknown critical data cannot silently become valid.
Touch alone cannot force passive fill.
Marketable limit cannot fill beyond its limit price.
Cancel request alone cannot erase potentially-live exposure.
Duplicate fill cannot double-count position.
Partial fill must change exposure immediately.
Expired signal cannot create new entry risk.
NO_TRADE is persisted as a decision.
Pending exposure consumes capacity.
Flat requires no position and no potentially-live exposure.
Same frozen inputs + versions + seed => same semantic result.
Changed execution model version must invalidate direct result comparability.
```

---

## ‏83. Metamorphic / Sanity Tests

‏נוסיף בדיקות כגון:

```text
increase latency
→ result must not improve systematically without an explainable mechanism
```

```text
worsen spread/slippage assumptions
→ net execution result should not improve mechanically
```

```text
remove future-only fields
→ decisions should remain unchanged if no leakage existed
```

```text
randomize universe iteration order
→ semantic ranking should remain unchanged
```

‏חריגה אינה תמיד Bug, אבל דורשת הסבר.

---

## ‏84. User-Specific Application

‏לרובוט שלנו יש כמה מאפיינים שמגדילים במיוחד את הסיכון ל־Backtest fantasy:

- ‏Universe רחב של אלפי Symbols.
- ‏בחירת Top Candidate Cross-Sectional.
- ‏Signal horizon של milliseconds-to-seconds.
- ‏Execution timing משמעותי ביחס ל־Signal half-life.
- ‏מטרה ל־small fast gains, ולכן round-trip costs גדולים יחסית ל־gross edge.
- ‏Ranking churn ו־candidate replacement יכולים להוסיף Execution churn.
- ‏Last-only screening יכול להיות שימושי למחקר, אך אינו מספיק ל־Execution proof.
- ‏Data/Execution provider separation יכול ליצור semantic/timing divergence.

‏לכן ה־Baseline שלנו צריך לתת משקל גבוה במיוחד ל־:

```text
As-Known-At
FreshCoverage
RankAge
SignalAge
Bid/Ask at arrival
Fill/No-Fill selection
Markout
TimeToFlat
LatencyPressure
NetEdgeRetained
```

---

## ‏85. Concrete Baseline Contract

‏כל Backtest candidate ל־Promotion צריך להחזיר Artifact עם לפחות:

```text
BacktestRun
- experiment_id
- dataset_version
- universe_version
- code_version
- config_version
- model_versions
- seed
- fidelity_level
- scenario
- start_time
- end_time
- decision_count
- trade_count
- no_trade_count
- fill_count
- partial_fill_count
- no_fill_count
- net_result
- net_edge_retained
- fill_rate
- markout_summary
- latency_summary
- TimeToFlat_summary
- regime_breakdown
- sensitivity_summary
- stress_summary
- known_limitations
- reproducibility_hash
```

---

## ‏86. Backtest Decision Record

‏לכל Decision:

```text
decision_id
as_of_time
universe_version
data_generation
candidate_set
top_n
rank_gap
freshness
positive_evidence
negative_evidence
expected_costs
expected_execution
risk_state
final_decision
reason_codes
```

‏ולכל Attempt:

```text
intent_id
order_policy
submit_time
arrival_time
fill_state
partial_fills
cancel_state
signal_age
pending_exposure
exit_lifecycle
flat_time
```

---

## ‏87. What I Would Avoid Initially

‏לא נתחיל מ־:

- ‏Exchange simulator מושלם לכל Venue.
- ‏MBO queue reconstruction לכל Universe.
- ‏Hundreds of stochastic knobs.
- ‏Per-symbol fill models.
- ‏ML execution simulator.
- ‏Microsecond precision כאשר ה־Dataset אינו מצדיק זאת.
- ‏Multi-venue market-impact model כבד לכל Feature screening.
- ‏אלפי parameter combinations ללא hypothesis.

‏אלה יכולים להגיע רק כאשר Evidence מוכיח שה־Baseline אינו מספיק.

---

## ‏88. What to Add Later

‏לאחר Calibration אפשר להוסיף:

- ‏empirical latency traces.
- ‏regime-conditioned fill distributions.
- ‏queue depletion/replenishment models.
- ‏venue-aware routing simulation.
- ‏impact model לפי size/participation.
- ‏Monte Carlo execution paths.
- ‏agent-like market-impact approximation אם capacity מצדיקה זאת.
- ‏failure replay עם recorded production incidents.

---

## ‏89. Fact / Judgment / Hypothesis

### ‏Fact / Engineering Constraint

‏Point-in-time correctness, event ordering, `Touch != Fill`, Partial Fill state, Cancel/Fill race ו־Versioned reproducibility הם תנאי correctness של המודל.

### ‏Judgment

‏למערכת שלנו מומלץ לעבוד בשלוש רמות Fidelity במקום לבנות מראש Simulator כבד אחד.

### ‏Hypothesis

‏ה־Fill/Latency/Cost/Impact distributions הספציפיים, threshold surfaces וה־Stress envelope המדויק צריכים Calibration אמפירי מול Replay/Shadow/Paper evidence.

---

## ‏90. Confidence

‏Confidence גבוה:

- ‏Point-in-time/As-Known-At.
- ‏Historical Universe.
- ‏Execution lifecycle realism.
- ‏Partial/no-fill preservation.
- ‏Reproducibility/versioning.
- ‏Stress/sensitivity לפני Promotion.

‏Confidence בינוני עד שיש Calibration:

- ‏Queue fill probability.
- ‏Market impact magnitude.
- ‏Latency distributions לפי Regime.
- ‏Missed-opportunity counterfactuals.
- ‏Venue-specific execution outcomes.

---

## ‏91. Time-Sensitive Facts

‏המקטע עצמו אינו מקבע Capability, Fee, Venue Rule או Broker limit תלויי־זמן.

‏לכן לא נדרש Web verification חדש.

‏לפני שימוש תפעולי ב־:

```text
broker order semantics
current commissions/fees
venue rules
market-data entitlement semantics
current trading calendars
```

‏נדרש אימות עדכני מול מקור רשמי.

---

## ‏92. Relationship to Earlier Sheets

### ‏20 — Backtest Fundamentals

‏20 נשאר Source of Truth ל־Timeline Integrity, Point-in-Time Universe ו־Research legality.

‏61 מוסיף את מלכודות ה־microstructure, state, uncertainty, calibration ו־model sensitivity.

### ‏21 — Realistic Seconds Execution Backtest

‏21 נשאר Source of Truth ל־Execution Simulation baseline.

‏61 מוסיף envelopes, fill selection, stress, counterfactual discipline ו־model error.

### ‏23 — Overfitting / Leakage

‏23 נשאר Source of Truth ל־anti-overfitting methodology.

‏61 מחיל אותה על fills, latency, vetoes, horizons ו־execution assumptions.

### ‏27 — Deterministic Replay

‏27 נשאר Source of Truth ל־deterministic recorded-tape replay.

‏61 מפריד אותו מ־stochastic execution uncertainty ומחבר את שניהם למחקר.

### ‏49 — Quant Research Best Practices

‏49 נשאר Source of Truth ל־Experiment Registry, Manifest, Holdout ו־Research governance.

‏61 מגדיר מה Backtest Artifact צריך להכיל.

### ‏59 — Market Data Subtleties

‏59 נשאר Source of Truth ל־data semantics.

‏61 דורש שה־Backtest ישמר את אותם semantics ולא ישתמש ב־clean history טוב יותר מה־Live reality.

### ‏60 — Scanner and Ranking Subtleties

‏60 נשאר Source of Truth ל־Rank uncertainty.

‏61 בודק אותה היסטורית עם Top-K, Winner's Curse, RankGap, Churn ו־freshness fairness.

### ‏60A — Negative Evidence

‏60A נשאר Source of Truth ל־Veto/Penalty/Cooldown logic.

‏61 מחייב point-in-time simulation, state persistence ו־false-veto/missed-winner accounting.

---

## ‏93. Relationship to 62

‏61 שואל:

```text
Could this historical Strategy have worked
under a realistic, causal and uncertainty-aware simulation?
```

‏62 ישאל:

```text
When the real system meets live external boundaries,
where does reality diverge from our model?
```

‏כלומר:

```text
Backtest Model
→ Replay / Shadow / Paper Calibration
→ Live Drift Measurement
```

---

## ‏94. Recommendation Summary

‏ה־Baseline המומלץ:

```text
Fast Causal Screening
→ Event-Level Realistic Replay
→ Stress / Uncertainty Envelope
→ OOS / Walk-Forward
→ Replay / Shadow / Paper Calibration
```

‏עם חוקים שאינם ניתנים לפיצוי:

```text
No future knowledge.
No future universe.
No touch-equals-fill fantasy.
No ignored partial fills.
No ignored pending exposure.
No constant-latency certainty.
No exit fantasy.
No hidden NO_TRADE/no-fill data loss.
No promotion from one optimistic scenario.
No unreproducible result.
```

‏ה־Backtest הטוב ביותר עבור הרובוט שלנו אינו זה שמציג את ה־PnL הגבוה ביותר.

‏הוא זה שמאפשר לענות באופן משכנע:

```text
What did we know?
What would we decide?
What could we actually execute?
How uncertain is that claim?
How much edge survives conservative assumptions?
What would falsify the result?
```

‏זו נקודת המעבר מ־historical story ל־research evidence.