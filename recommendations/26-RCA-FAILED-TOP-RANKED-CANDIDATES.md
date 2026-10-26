# ‏26 — Recommendation Sheet: RCA for Failed Top-Ranked Candidates

> ‏מקור לימודי עיקרי: `../26-RCA-FOR-FAILED-TOP-RANKED-CANDIDATES.md`.
>
> ‏מטרת הקובץ: לקבוע שיטת `Root Cause Analysis` שבה Failure של `Rank #1`, Trade כושל, Missed Opportunity או Near Miss הופכים ל־Evidence מובנה — לא ל־storytelling ולא ל־tweak אינטואיטיבי. המערכת צריכה לדעת לשחזר מה קרה, למצוא את ה־First Divergence, להפריד בין Data / Prediction / Ranking / Regime / Timing / Execution / Exit / Costs / Risk / Variance, ורק אז לייצר Hypothesis שניתנת להפרכה.
>
> ‏המקטע ממשיך את 15 ו־21–25: ‏15 הפריד Ranking מ־`TRADE / NO TRADE`; ‏21 הגדיר Execution Reality; ‏22–24 הגדירו Predictive Validation, הגנה מ־Overfitting וניסוי מבוקר; ‏25 הוסיף Market Context. ‏26 סוגר את הלולאה: Failure אינו Change Request — הוא קלט למחקר.

---

## ‏1. Decision

‏השאלה המרכזית אינה:

```text
Why did this trade lose?
```

‏אלא:

```text
What is the earliest evidence-backed divergence
between intended behavior and observed outcome,
which layer owns it,
and does the same pattern repeat strongly enough
that changing the system is justified?
```

‏לכן ה־Baseline הוא:

```text
Event closes / anomaly detected
→ freeze immutable evidence
→ operational health checks
→ find first divergence
→ classify primary + contributing causes
→ compare Top-N / NO_TRADE counterfactuals
→ compare population
→ NO_ACTION / COLLECT / BUG_FIX / HYPOTHESIS
→ controlled experiment
→ OOS validation
→ promote or reject
→ monitor recurrence
```

‏הכלל המחייב:

```text
RCA → Hypothesis → Experiment → Validation → Promotion
```

‏ולא:

```text
RCA → Immediate tweak
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: First-Divergence RCA

‏בכל RCA עוברים את השרשרת לפי הסדר, ולא מתחילים מ־Score רק כי התוצאה הייתה שלילית:

```text
1. Data / Clock / Provider Health
2. Eligibility / Filters / Tradeability
3. Feature State
4. Score Construction
5. Ranking / Separation / Stability
6. Regime / Context
7. Decision Timing / Signal Decay
8. Entry Execution
9. Exit Logic / Exit Execution
10. Costs / Net Economics
11. Risk / Sizing / Exposure
12. Expected Variance / Unknown
```

‏ה־Primary Cause הוא השכבה המוקדמת ביותר שבה נמצאה חריגה בעלת Evidence מספק שיכולה להסביר מהותית את התוצאה.

‏למה זה חשוב:

```text
stale quote
→ wrong feature
→ wrong score
→ wrong rank
→ bad trade
```

‏אם מקור הבעיה הוא Quote ישן, אסור לסכם אותה כ־`BAD_SCORE`.

### ‏`P0 — Required`: Failure ≠ Bug ≠ Model Error

‏שלוש קטגוריות בסיסיות:

```text
BUG
MODEL_ERROR
EXPECTED_VARIANCE
```

‏`BUG` — ההתנהגות בפועל אינה תואמת Specification.

‏`MODEL_ERROR` — המערכת פעלה בדיוק לפי Specification, אך ההערכה הייתה חלשה או לא generalize.

‏`EXPECTED_VARIANCE` — גם Decision סביר תחת מודל בעל Edge יכול להסתיים בתוצאה שלילית.

‏אין להעניש מודל על Variance צפויה ואין לתגמל אותו אוטומטית על Winner מקרי.

### ‏`P0 — Required`: Labels נפרדים לכל שכבה

‏אותו Event יכול להיות:

```text
prediction_outcome = GOOD
ranking_outcome    = GOOD
execution_outcome  = BAD
exit_outcome       = BAD
net_outcome        = NEGATIVE
```

‏לכן נשמור לפחות:

```text
prediction_outcome
ranking_outcome
decision_outcome
execution_outcome
exit_outcome
cost_outcome
risk_outcome
net_outcome
```

‏`net_pnl < 0` אינו Root Cause.

### ‏`P0 — Required`: Immutable RCA Packet

‏לכל Event מהותי נבנה Packet שאפשר לפתוח, לשחזר ולהשוות בעתיד.

‏מינימום:

```text
rca_event_id
trade_id / decision_id
run_id
strategy_version
feature_version
filter_version
score_version
execution_version
cost_model_version
universe_version
symbol
signal_time
submit_time
first_fill_time
full_fill_or_terminal_time
exit_time
signal_snapshot
universe_snapshot
feature_snapshot
score_decomposition
rank_snapshot
regime_snapshot
quote_trade_window
order_events
fills
exit_events
cost_breakdown
forward_path
top_n_snapshot
counterfactuals
primary_failure_code
contributing_failure_codes
rca_confidence
severity
action
experiment_id_if_any
```

‏ה־Packet נבנה מה־state המקורי; אין “שכתוב” היסטורי לאחר שהעתיד ידוע.

### ‏`P0 — Required`: Decision Trace מכני

‏נשמור הסבר מכני של ההחלטה:

```text
filter A: PASS
filter B: PASS
momentum_subscore: +18
activity_subscore: +14
execution_gate: PASS
final_score: 84
rank: 1
absolute_gate: PASS
decision: TRADE
```

‏המטרה היא לדעת:

```text
why selected
why traded / not traded
why filled / not filled
why exited
```

‏אם אי אפשר לענות — קודם מתקנים Observability.

### ‏`P0 — Required`: Top-N, לא רק #1

‏בכל RCA נשמור לפחות Top-N קטן ומספיק למחקר, למשל Top-10:

```text
rank
score
subscores
key features
eligibility state
future labels
execution feasibility snapshot
```

‏כך אפשר להבחין בין:

```text
market-wide failure
```

‏לבין:

```text
#1 failed while #2/#3 succeeded
```

‏אלה Root Causes שונים.

### ‏`P0 — Required`: Signal / Submit / Fill snapshots

‏במסחר קצר נשמור לפחות:

```text
rank_at_signal
rank_at_submit
rank_at_fill

score_at_signal
score_at_submit
score_at_fill

features_at_signal
features_at_submit
features_at_fill

regime_at_signal
regime_at_submit
regime_at_fill

spread_at_signal
spread_at_submit
spread_at_fill
```

‏כך נוכל לענות על השאלה הקריטית:

```text
Was the trade already dead before fill?
```

### ‏`P0 — Required`: Unknown ו־Expected Variance הן תוצאות חוקיות

‏אם אין מספיק Evidence:

```text
root_cause = UNKNOWN
```

‏אם הכול התנהג כמתוכנן ואין Pattern שיטתי:

```text
root_cause = EXPECTED_VARIANCE
```

‏עדיף Unknown מקצועי מהסבר מומצא.

### ‏`P0 — Required`: No future information in proposed fixes

‏לכל Fix או Feature שנולד מ־RCA נבדוק:

```text
was this information observable at decision time?
```

‏אם התשובה לא — הוא אינו Candidate ל־Live rule.

### ‏`P1 — Preferred Default`: Two-level RCA

‏נפריד:

```text
Single-Event RCA
Population RCA
```

‏Single Event משמש לשחזור, תיוג והפקת שאלות.

‏Population RCA הוא הבסיס לשינוי Strategy.

‏אין לקדם שינוי Model על בסיס Case יחיד, אלא אם מדובר ב־Operational/Safety Bug חד־משמעי.

### ‏`P1 — Preferred Default`: Automated flags, human/research conclusion

‏אוטומציה יכולה להפיק Flags כמו:

```text
DATA_STALE
WEAK_SEPARATION
SIGNAL_DECAY_BEFORE_FILL
EXIT_CAPTURE_FAILURE
SPREAD_EXPANSION
```

‏אבל Flag אינו Final Verdict.

‏האוטומציה מצביעה על Evidence Candidates; ה־Conclusion דורש קשר סיבתי סביר ו־Population evidence.

---

## ‏3. Why

‏RCA חשוב במיוחד לרובוט שלנו כי הוא מבצע Selection אגרסיבי מתוך Universe רחב:

```text
Thousands of symbols
→ Filters
→ Score
→ Rank
→ #1
```

‏במבנה כזה יהיו תמיד:

- ‏Winner's Curse.
- ‏Noise קיצוני מתוך Cross-Section גדול.
- ‏Trade-offs בין Confirmation ל־Late Entry.
- ‏Signal decay בזמן latency קצר יחסית ל־holding horizon.
- ‏Gross Winners שהופכים ל־Net Losers.
- ‏#1 חלש שנבחר מתוך סט חלש.
- ‏Errors שנובעים מ־Data/Execution ולא מ־Prediction.

‏ללא RCA מובנה, כל Loss מזמין Rule חדש וכל Winner מחזק נרטיב — מתכון ל־Overfitting.

---

## ‏4. Use When

‏ה־RCA Baseline מופעל לפחות עבור:

- ‏Top losses.
- ‏Rank #1 עם outcome חלש מהצפוי.
- ‏Top-1 שנפסד משמעותית ל־#2/#3.
- ‏Gross Winner / Net Loser.
- ‏Signal שהיה חיובי בזמן Signal אך נעלם לפני Fill.
- ‏No Fill / Partial Fill חריג.
- ‏MFE גבוה ו־realized outcome חלש.
- ‏Near Miss operational.
- ‏Duplicate / Unknown / state mismatch.
- ‏Missed Opportunity משמעותי אחרי `NO_TRADE`.
- ‏Regression לאחר Strategy Version חדש.
- ‏Random sample של Trades רגילים.
- ‏Top Winners, כדי להימנע מ־success bias.

---

## ‏5. Do Not Use When

‏לא משתמשים ב־RCA כדי:

- ‏להמציא Rule אחרי Loss יחיד.
- ‏לשכתב Hypothesis בדיעבד.
- ‏להסביר כל Trade עד שיש סיפור משכנע.
- ‏להחליף Statistical/Population Validation באנקדוטה.
- ‏לבטל Safety Rule רק כי חסם Winner.
- ‏לכוון Threshold בדיוק סביב Event בודד.
- ‏לבנות Exceptions לפי Symbol/שעה ללא Hypothesis מראש.
- ‏לשנות Production ישירות מתוך Dashboard RCA.

---

## ‏6. RCA Layer 1 — Data / Clock / Provider

### ‏בדיקות Baseline

```text
timestamp validity
sequence continuity
missing events
duplicates
out-of-order events
quote freshness
trade freshness
bid/ask sanity
feed health
provider mismatch
clock skew
reconnect state
```

‏Fields קריטיים:

```text
signal_time
last_trade_time
last_quote_time
trade_age_ms
quote_age_ms
sequence_gap_detected
provider_id
feed_state
clock_health
```

‏אם Data לא אמין — Strategy RCA נעצר עד שה־Data issue מובן.

### ‏Cross-provider check

‏כאשר יש מקור נוסף זמין אפשר להשתמש בו כ־diagnostic reference, אך לא לבחור בדיעבד את המקור “הנוח”.

‏מטרת ההשוואה היא לזהות:

```text
corruption
coverage gap
provider-specific lag
field semantic mismatch
```

---

## ‏7. RCA Layer 2 — Eligibility / Filters

‏השאלה:

```text
Should this candidate have reached ranking at all?
```

‏נבדוק:

```text
filter versions
input values
missing/null policy
reason codes
threshold margins
tradability state
market status
planned-size executability
```

### ‏Filter bypass הוא Bug

‏לדוגמה:

```text
spread_filter = enabled
spread = null
null treated as pass
```

‏זו אינה Strategy Hypothesis אלא Specification violation.

### ‏Threshold boundary הוא Research question

‏אם Candidate עבר Threshold כחוק אך Failures מצטברים סמוך לסף, נוצרת Hypothesis ל־Population experiment.

‏לא עושים:

```text
failure at 19.8 bps
→ threshold 19.7 bps
```

‏עושים:

```text
bucket analysis
→ saved losses
→ lost winners
→ net effect
```

### ‏Rejected Winner Analysis

‏נחקור גם Candidates שנפסלו והצליחו, כדי לאמוד False Negatives של Filter.

---

## ‏8. RCA Layer 3 — Features

‏לכל Decision נשמור Feature Snapshot מלא.

‏דוגמאות:

```text
momentum_1s
momentum_5s
momentum_10s
trade_rate_5s
activity_acceleration
path_efficiency
spread_bps
quote_age_ms
rank_persistence
```

### ‏Feature contribution

‏כאשר Score מאפשר זאת:

```text
raw_value
normalized_value
weight
contribution
status
age_ms
```

### ‏Feature Staleness / Decay

‏נשווה:

```text
feature_at_signal
feature_at_submit
feature_at_fill
```

‏Feature יכול להיות נכון בזמן Signal אך לא רלוונטי בזמן Fill.

### ‏Possible feature failure hypotheses

```text
FEATURE_DECAY
FEATURE_STALE
FEATURE_SATURATION
FEATURE_EXTREME_REVERSAL
FEATURE_REDUNDANCY
MISSING_INTERACTION
MISSING_CONTEXT
```

‏אך כל אחד מהם דורש Population evidence.

---

## ‏9. RCA Layer 4 — Score

‏נבדוק Score Decomposition ולא רק `final_score`.

‏Baseline:

```text
momentum_subscore
activity_subscore
consistency_subscore
context fields
final_prediction_score
```

‏Execution/Data Quality נשארים Gates או axes נפרדים בהתאם לפרקים 11–15.

### ‏Score failure hypotheses

- ‏Feature אחד dominates יתר על המידה.
- ‏כמה Features correlated סופרים אותו מידע שוב.
- ‏Extreme value ממשיך לקבל reward מעבר לאזור שבו outcome משתפר.
- ‏Interaction חסר.
- ‏Normalization מתנהגת שונה ב־regime מסוים.

‏לא עושים Weight tweak מתוך Event יחיד.

---

## ‏10. RCA Layer 5 — Ranking

‏נשמור:

```text
score_1
score_2
score_3
score_5
rank_gap_1_2
rank_gap_1_5
rank_persistence
rank_churn
```

### ‏Weak Winner

‏#1 עם separation זעיר הוא מצב שונה מ־#1 מבודד.

‏Hypothesis אפשרית:

```text
weak separation + low persistence
→ poor continuation
```

‏אבל רק Population analysis יכול לקדם אותה.

### ‏Counterfactual Top-N

‏נשמור Outcomes של:

```text
rank1
rank2
rank3
best_top5
```

‏כדי למדוד:

```text
Selection Regret = BestEligibleOutcome - ChosenOutcome
```

‏Regret אינו יעד של 0; הוא diagnostic distribution.

### ‏Winner's Curse

‏ב־Universe של אלפי Symbols קיצון יכול להיות Noise.

‏לכן נבדוק Extreme Score buckets:

```text
improves
plateaus
reverses
```

---

## ‏11. RCA Layer 6 — Regime / Context

‏נשתמש ב־Snapshot ממקטע 25:

```text
seconds_since_open
market_volatility_percentile
market_breadth
market_activity_percentile
market_spread_percentile
cross_section_dispersion
candidate_count
rank1_rank2_gap
feed_latency_percentile
```

‏נשווה:

```text
regime_at_signal
regime_at_submit
regime_at_fill
```

‏Failure יכול לנבוע מ־Transition, למשל:

```text
quiet → fast
normal liquidity → spread stress
broad rally → reversal
```

‏`REGIME_MISMATCH` אינו מותר כ־story בלבד; צריך Cluster/Population evidence.

---

## ‏12. RCA Layer 7 — Decision Timing

‏נמדוד:

```text
signal_age_at_decision
signal_age_at_submit
signal_age_at_fill
expected_edge_at_signal
expected_edge_at_submit
expected_edge_at_fill
```

### ‏Signal Death Point

‏נגדיר את הרגע הראשון שבו התנאים כבר לא היו עומדים ב־Trade policy.

‏נשאל:

```text
signal_death_time < fill_time ?
```

‏אם כן, זו Evidence חזקה ל־Timing/Execution issue.

### ‏Late vs Early

```text
LATE_ENTRY
EARLY_ENTRY
```

‏נבדקים כ־Population patterns, לא Labels אינטואיטיביים.

‏Confirmation הוא Trade-off:

```text
more confirmation
→ fewer false positives
→ potentially more late fills
```

---

## ‏13. RCA Layer 8 — Entry Execution

‏ננתח:

```text
order_submit_time
broker_ack_time
first_fill_time
full_fill_or_terminal_time
fill_vwap
reference_price
entry_slippage
chase_bps
partial_fill_ratio
cancel_replace_count
```

### ‏Execution Counterfactuals

‏על Population, עם אותו Signal:

```text
passive
marketable limit
aggressive capped limit
skip if not filled quickly
```

‏המטרה היא לבדוק Execution Policy, לא לבחור בדיעבד את הטקטיקה המושלמת לכל Trade.

### ‏Key failure types

```text
ENTRY_SLIPPAGE
PASSIVE_MISSED_FILL
PARTIAL_FILL
CHASE_TOO_FAR
CANCEL_REPLACE_CHURN
FILL_DELAY
```

---

## ‏14. RCA Layer 9 — Exit

‏נשמור תמיד `exit_reason` מובנה.

‏Baseline reasons:

```text
TAKE_PROFIT
TIME_STOP
HARD_STOP
SIGNAL_EXIT
THESIS_EXIT
RISK_EXIT
SYSTEM_EXIT
```

### ‏MFE vs Realized

‏דפוס חשוב:

```text
MFE materially positive
Realized <= 0
```

‏יכול להצביע על Exit Capture issue.

‏מדדים:

```text
MFE
MAE
giveback = MFE - realized_move
capture_fraction when meaningful
time_to_mfe
time_to_exit
time_to_flat
```

### ‏Exit Counterfactuals

‏אפשר להשוות Policies על אוכלוסייה:

```text
actual
fixed target
fixed time
signal exit
trailing challenger
```

‏אין לבחור ex-post את best exit לכל Event.

---

## ‏15. RCA Layer 10 — Costs / Net Economics

‏נפרק:

```text
commission
regulatory fees
spread cost
entry slippage
exit slippage
market impact / depth cost
missed-fill opportunity cost where relevant
```

### ‏Gross Winner / Net Loser

```text
Gross > 0
Net < 0
```

‏מקבל Failure Code מפורש:

```text
COST_ERASED_EDGE
```

‏נשמור:

```text
expected_cost / expected_gross_edge
actual_cost / realized_gross_move
```

‏Fee Model שגוי הוא Infrastructure/Research bug, לא Strategy failure.

---

## ‏16. RCA Layer 11 — Risk / Sizing

‏PnL יכול להיראות חמור בגלל Size, אף שה־Prediction error קטן.

‏נבדוק:

```text
planned_qty
filled_qty
size_to_depth
size_to_recent_volume
reserved_exposure
other_open_exposure
slippage_vs_size
```

‏Failure possible:

```text
SIZE_TOO_LARGE
LIQUIDITY_CAP_INSUFFICIENT
EXPOSURE_ACCOUNTING_ERROR
```

‏PnL לבדו אינו מדד לאיכות Scanner.

---

## ‏17. RCA Layer 12 — Randomness / Irreducible Error

‏לא לכל Loss יש Root Cause שניתן למנוע.

‏אם:

```text
Data good
Eligibility correct
Features valid
Ranking well separated
Timing acceptable
Execution within model
Costs normal
Exit followed policy
```

‏והתוצאה עדיין שלילית, אפשר לסווג:

```text
EXPECTED_VARIANCE
```

‏או:

```text
UNKNOWN
```

‏אם Evidence לא מספיקה.

‏זה עדיף על Narrative Fallacy.

---

## ‏18. Failure Taxonomy

### ‏`P1 — Preferred Default`: Codes יציבים

‏Baseline:

```text
DATA_STALE
DATA_GAP
DATA_SEQUENCE_ERROR
CLOCK_SKEW
FILTER_BYPASS
FILTER_WEAK
FEATURE_STALE
FEATURE_DECAY
FEATURE_SATURATION
SCORE_DOMINATION
RANK_WEAK_SEPARATION
RANK_CHURN
REGIME_MISMATCH
SIGNAL_LATE
SIGNAL_EARLY
SIGNAL_DECAY_BEFORE_FILL
ENTRY_SLIPPAGE
PASSIVE_MISSED_FILL
PARTIAL_FILL
CHASE_TOO_FAR
EXIT_TOO_EARLY
EXIT_TOO_LATE
EXIT_CAPTURE_FAILURE
COST_ERASED_EDGE
SIZE_TOO_LARGE
OPERATIONAL_STATE_ERROR
EXPECTED_VARIANCE
UNKNOWN
```

‏אפשר להרחיב רק כאשר Cluster חדש מצדיק Code יציב.

### ‏Primary + Contributing

```text
primary_failure_code
contributing_failure_codes[]
```

‏דוגמה:

```text
Primary: ENTRY_SLIPPAGE
Contributing: SIGNAL_LATE, SPREAD_EXPANSION
```

### ‏Confidence

```text
HIGH
MEDIUM
LOW
```

‏Cause ללא Confidence הוא False Precision.

---

## ‏19. Severity / Priority

‏Severity נפרדת מ־Cause Confidence.

‏אפשר להשתמש:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

‏Priority מחקרי/תפעולי נגזר רעיונית מ:

```text
frequency
× severity
× confidence
× preventability
```

‏לא חייבים Score מספרי מורכב; צריך סדר עבודה עקבי.

### ‏Operational failures first

‏בעיות כמו:

```text
stale feed
duplicate order
unknown position
state mismatch
```

‏מקבלות קדימות גבוהה גם אם Average PnL impact עדיין קטן.

---

## ‏20. Near Miss RCA

‏נחקור גם מצבים שבהם כמעט נגרם Failure:

```text
spread nearly exceeded hard limit
latency nearly exceeded signal TTL
duplicate order prevented by guard
position mismatch recovered before harm
feed stale but no trade happened
```

‏Near Miss הוא Safety Evidence חשוב ולעיתים בעל ערך גבוה יותר מ־PnL loss רגיל.

---

## ‏21. Missed Opportunity RCA

‏`NO_TRADE` ו־Rejected Candidates נבדקים גם הם.

‏Taxonomy אפשרית:

```text
FILTERED_OUT
SCORE_TOO_LOW
NO_TRADE_THRESHOLD
EXECUTION_NOT_FILLED
RISK_BLOCKED
SYSTEM_UNAVAILABLE
```

‏אבל Safety Rule אינו “שגוי” רק כי מנע Winner.

‏המדד הוא Population net effect + tail protection, לא missed winner anecdote.

---

## ‏22. Success RCA

‏נחקור גם Winners.

‏מטרות:

- ‏לזהות Good Outcome for Wrong Reason.
- ‏לאמוד כמה Winners הם market-wide luck.
- ‏לוודא ש־Signal validity ו־execution integrity קיימים גם כש־PnL חיובי.
- ‏להבין אילו Patterns חוזרים באמת ב־successful population.

‏Random sample של Events רגילים מונע Sample Selection Bias של חקירת Losses בלבד.

---

## ‏23. Time-to-Failure / Time-to-Profit

‏לשיטה שלנו חשוב במיוחד למדוד:

```text
time_to_first_positive_net_mark
time_to_5bps
time_to_10bps
time_to_target
time_to_failure
time_to_rank_loss
time_to_score_collapse
time_to_spread_expansion
time_to_liquidity_loss
```

‏הספים הם Research parameters, לא Facts.

‏Fast Failure של מאות milliseconds שונה מהותית מ־Slow Failure אחרי עשרות שניות.

---

## ‏24. Shape-based RCA

‏נשמור Timelines ולא Snapshot יחיד.

### ‏Momentum shape

```text
burst → continuation
burst → plateau
burst → reversal
steady climb → continuation
```

### ‏Activity shape

```text
accelerating
stable
fading
collapsing
```

### ‏Liquidity shape

```text
spread stable
spread widening
depth stable
depth disappearing
```

‏Joint patterns הם Hypotheses אפשריות, אך אסור ליצור interaction explosion.

---

## ‏25. Timeline-first RCA

‏RCA Report צריך להציג Timeline מובנה, למשל:

```text
T-10s  candidate rising
T-3s   rank #4
T-1s   rank #2
T0     rank #1 / signal
T+180  decision
T+320  submit
T+640  fill
T+1.2s momentum decelerates
T+3s   rank falls to #8
T+5s   exit
```

‏במקביל נשמור State transitions:

```text
SCANNING
→ CANDIDATE
→ DECIDED
→ ORDER_WORKING
→ PARTIALLY_FILLED
→ POSITION
→ EXITING
→ FLAT
```

‏ו־Feature/Score/Rank timelines.

---

## ‏26. First Divergence

### ‏Recommended diagnostic

‏נשווה Expected vs Observed לאורך השרשרת:

```text
expected data health       vs observed
expected feature freshness vs observed
expected rank stability    vs observed
expected edge persistence  vs observed
expected execution cost    vs observed
expected exit behavior     vs observed
```

‏נזהה את הרגע הראשון שבו ההבדל נעשה מהותי.

‏זה ה־First Divergence.

‏היתרון: הוא מונע האשמה של שכבה מאוחרת כאשר הנזק התחיל מוקדם יותר.

---

## ‏27. Counterfactuals

### ‏Minimum Counterfactual Set

```text
rank2_outcome
rank3_outcome
best_top5_outcome
no_trade_outcome
alternative_entry_outcomes
alternative_exit_outcomes
```

### ‏Rules

- ‏אותו Dataset.
- ‏אותו as-of contract.
- ‏אותו Cost/Execution fidelity.
- ‏שינוי גורם אחד ככל האפשר.
- ‏אין best-ex-post per-event optimization.

### ‏NO_TRADE counterfactual

‏נשאל:

```text
Was there observable evidence that should have prevented trade?
```

‏Candidates:

```text
weak separation
high churn
spread stress
stale quote
signal age
poor absolute quality
```

‏אך שינוי Gate דורש Population experiment.

---

## ‏28. Population RCA

‏Case Study יוצר שאלה.

‏Population RCA יוצר Evidence.

‏Views מינימליים:

```text
by score bucket
by rank gap
by rank persistence
by time of day
by regime
by spread
by activity
by latency
by strategy version
by failure code
```

‏לכל View נשמור:

```text
sample count
episode count
unique days
unique symbols
failure rate
median outcome
tail outcome
net outcome
```

---

## ‏29. Failure Clustering

‏נעדיף Clusters חוזרים על פני 500 סיפורים ייחודיים.

‏דוגמאות:

```text
A: fast burst + low depth + late fill
B: stable rank + good liquidity + random reversal
C: high momentum + fading activity
D: positive prediction + spread expansion + net loss
```

‏Cluster שחוזר הוא Candidate ל־Hypothesis.

‏Case בודד בדרך כלל אינו.

---

## ‏30. Residual Analysis

‏אפשר להגדיר רעיונית:

```text
residual = actual_outcome - expected_outcome
```

‏נבדוק האם Residuals מרוכזים לפי:

- ‏Feature missing מהמודל.
- ‏Regime.
- ‏Latency.
- ‏Execution state.
- ‏Spread dynamics.
- ‏Rank persistence.

‏Residual pattern יכול להוביל ל־Feature/Interaction/Policy Hypothesis, לא ל־Production change ישיר.

---

## ‏31. Objective RCA

‏לפעמים הבעיה אינה Feature אלא Objective.

‏נבדוק התאמה בין:

```text
prediction target
ranking target
trading horizon
execution reality
net economic objective
```

‏דוגמה:

```text
prediction target = future mid return @60s
actual trade thesis = net executable profit within 5–10s
```

‏זה Objective mismatch.

‏Top-1 metrics חייבים להתאים למטרה:

```text
Top1 hit rate
Top1 net EV
Top1 regret
Top1 time_to_profit
Top1 MFE
Top1 MAE
```

---

## ‏32. Evidence / Hypothesis / Conclusion

‏כל Report מפריד:

### ‏Observation

‏מה קרה בפועל.

### ‏Evidence

‏Metrics / Events שתומכים בטענה.

### ‏Hypothesis

‏הסבר שניתן להפריך.

### ‏Counterfactual

‏מה היה קורה תחת policy חלופית מוגדרת.

### ‏Conclusion

‏הסיווג הנוכחי.

### ‏Confidence

‏עוצמת ה־Evidence.

### ‏Next Experiment

‏אם נדרש.

‏AI או כלי אוטומטי אינם רשאים להציג Hypothesis כ־Fact.

---

## ‏33. RCA Report Contract

‏מינימום:

```text
Event ID
Strategy version
Outcome labels
Primary cause
Contributing causes
Confidence
Severity
Observations
Evidence
First divergence
Counterfactual result
Population evidence
Action
Experiment ID
```

‏Human-readable summary:

```text
What happened?
What is the first divergence?
Why do we think it happened?
What evidence supports that?
What do we propose to test?
```

‏ובמקביל fields machine-readable לצבירה.

---

## ‏34. Action Categories

‏RCA מסתיים באחת מפעולות Baseline:

```text
NO_ACTION
OBSERVE
COLLECT_MORE_DATA
ADD_TELEMETRY
BUG_FIX
OPERATIONAL_FIX
RUN_EXPERIMENT
ROLLBACK_VERSION
TIGHTEN_SAFETY
```

### ‏`NO_ACTION`

‏כאשר האירוע מתאים ל־Expected Variance ואין Pattern חוזר.

### ‏`ADD_TELEMETRY`

‏כאשר אי אפשר לענות על שאלה מהותית כי חסרה Observability.

### ‏`BUG_FIX`

‏כאשר Implementation מפר Specification; כולל Regression Test ו־Similar-Area Review.

### ‏`RUN_EXPERIMENT`

‏כאשר יש Hypothesis ניתנת לבדיקה עם Population sufficient.

---

## ‏35. Bug Fix vs Strategy Change

‏זה גבול מחייב.

### ‏Bug Fix

```text
actual behavior != specification
```

‏תהליך:

```text
RCA
→ fix
→ regression test
→ similar-area review
→ deploy under engineering controls
```

### ‏Strategy Change

```text
specification behaved as designed
but evidence suggests another policy may be better
```

‏תהליך:

```text
RCA
→ hypothesis
→ controlled experiment
→ OOS
→ shadow when needed
→ promotion decision
```

---

## ‏36. Operational RCA Template

‏לכשל תפעולי:

```text
Impact
Timeline
Detection
Root cause
Contributing factors
Why safeguards failed
Fix
Regression test
Similar areas review
Monitoring improvement
```

‏`Five Whys` מתאים בעיקר כאן, בזהירות.

---

## ‏37. Strategy RCA Template

‏לכשל אסטרטגי:

```text
Observation
Population
Expected behavior
Actual behavior
Feature / rank / context analysis
Execution / cost attribution
Counterfactuals
Hypothesis
Experiment design
Decision
```

---

## ‏38. Similar-Area Review

‏כאשר נמצא Bug, לא מתקנים רק Instance.

‏דוגמה:

```text
bug found in entry timestamp handling
```

‏נבדוק גם:

```text
exit timestamps
replay
backtest
live ingestion
latency metrics
```

‏העיקרון:

```text
Fix class, not instance
```

---

## ‏39. Regression Asset

‏Failure חשוב יכול להפוך ל:

- ‏Unit/Integration regression test.
- ‏Golden Replay scenario.
- ‏RCA dataset row.
- ‏Failure Library exemplar.

‏כך Event חד־פעמי הופך לנכס מחקרי/הנדסי מתמשך.

---

## ‏40. Replay as RCA Tool

‏Replay ישמש את 26, אבל יוגדר לעומק ב־27.

‏דרישות Baseline ל־RCA:

```text
same raw events
same event order
same strategy/config versions
same seeds where applicable
→ same features
→ same score
→ same rank
→ same decision
```

‏אם אותו Event אינו reproducible, קודם מתקנים Determinism לפני Model RCA עמוק.

### ‏Counterfactual Replay

‏משנים גורם אחד בלבד:

```text
execution policy
filter threshold
feature
exit policy
```

‏ושומרים את השאר Frozen ככל האפשר.

---

## ‏41. RCA Data Retention

‏נשמור מספיק High-resolution evidence כדי לשחזר Events חשובים.

‏אפשר tiering:

```text
recent full-resolution data
compressed historical data
selected RCA windows retained long-term
```

‏RCA windows מייצגים יכולים להפוך ל־Regression Suite.

---

## ‏42. Daily / Weekly / Monthly Review

### ‏Daily

```text
Top losses
Top missed opportunities
Largest execution shortfalls
Operational anomalies
Unexpected failure clusters
Near misses
```

### ‏Weekly

‏מחפשים Clusters ו־Population patterns.

### ‏Monthly

‏נבדוק:

```text
failure mix drift
unknown rate
repeat failure rate
failure rate by version
cost/execution failure drift
```

---

## ‏43. RCA Metrics

‏Baseline dashboard:

```text
failure_count
failure_rate
failure_rate_by_cause
loss_by_cause
severity_by_cause
unknown_cause_rate
repeat_failure_rate
near_miss_count
prevented_failure_rate
missed_opportunity_rate
rca_coverage
mean_time_to_classify
hypotheses_created
experiments_created
fixes_promoted
```

### ‏RCA Effectiveness

‏נמדוד האם פעולות שנולדו מ־RCA באמת שיפרו Population עתידי.

‏דוגמה:

```text
Late Entry failures ↓
Missed Fill failures ↑
```

‏זה יכול להעיד שהחלפנו בעיה אחת באחרת.

---

## ‏44. Version Comparison

‏Failure Taxonomy נשארת עקבית בין Strategy Versions.

‏כך אפשר למדוד:

```text
v12 vs v13
failure mix
loss by cause
unknown rate
repeat rate
```

‏כל RCA חייב לשמור versioning של Code + Config.

‏`Configuration Is Code` לצורך reproducibility.

---

## ‏45. RCA → Observability Loop

‏כל שאלה שלא ניתן לענות עליה בגלל Field חסר מייצרת Telemetry requirement.

‏דוגמאות:

- ‏אין `rank_at_fill` → להוסיף.
- ‏אין quote age → להוסיף.
- ‏אין score decomposition → להוסיף.
- ‏אין cancel-confirm timestamp → להוסיף.
- ‏אין actual cost attribution → להוסיף.

‏Unknown rate גבוה הוא לעיתים Observability problem, לא “שוק מורכב”.

---

## ‏46. RCA → Hypothesis Queue

‏Hypothesis חדשה נכנסת ל־Backlog עם:

```text
hypothesis_id
source_rca_cluster
evidence_count
frequency
severity
expected_impact
preventability
complexity
experiment_cost
priority
status
```

‏Priority גבוהה לרעיונות שמסבירים הרבה Failures, בעלי impact מהותי, ניתנים לבדיקה פשוטה ואינם מוסיפים complexity גדולה.

---

## ‏47. Counterfactual First

‏לפני Code change נבדוק היסטורית:

```text
If this rule had existed,
what would it have done across the full population?
```

‏נמדוד שני צדדים:

```text
saved losses
lost winners
```

‏והחלטה לפי:

```text
expected net effect
```

‏לא לפי `fewer losing trades` בלבד.

---

## ‏48. Promotion Criteria

‏Hypothesis שנולדה מ־RCA מתקדמת רק כאשר:

1. ‏יש Pattern חוזר או Severity שמצדיק מחקר.
2. ‏ה־Evidence נמדדת ולא Narrative בלבד.
3. ‏ה־Proposed signal היה זמין בזמן אמת.
4. ‏אפשר להגדיר Counterfactual הוגן.
5. ‏יש Data/episodes מספיקים.
6. ‏הניסוי שומר את משטר 23–24.
7. ‏יש incremental value OOS.
8. ‏השיפור נשאר אחרי realistic Costs/Execution.
9. ‏אין Guardrail regression מהותי.
10. ‏המורכבות הנוספת מוצדקת.
11. ‏יש Shadow/rollback/monitoring כאשר נדרש.

---

## ‏49. Rejection / No-Action Criteria

‏לא משנים Strategy כאשר:

- ‏אין Pattern.
- ‏התוצאה תואמת Expected Failure Rate.
- ‏Evidence חלשה.
- ‏Cause confidence נמוכה ואין Severity תפעולית.
- ‏ה־Fix דורש future information.
- ‏Counterfactual פוגע ב־Net outcome.
- ‏השיפור קיים רק ב־case הנבדק.
- ‏Rule מוסיף complexity גדולה עבור tiny effect.
- ‏Guardrails נפגעים.
- ‏Missed Winners עולים יותר מה־Failures שנחסכו.

---

## ‏50. Failure Modes של תהליך RCA עצמו

### ‏Narrative Fallacy

‏סיפור משכנע ללא Metric.

### ‏Hindsight Bias

‏שימוש במה שקרה אחר כך כאילו היה ידוע בזמן Decision.

### ‏Patchwork Strategy

‏Rule חדש לכל Failure.

### ‏Loss-only sample bias

‏חקירת Losses בלבד.

### ‏PnL attribution error

‏האשמת Scanner כאשר Execution/Size/Costs יצרו את ההפסד.

### ‏Over-classification

‏הכרחת Cause במקום `UNKNOWN`.

### ‏Code churn

‏שינויים מידיים לפני Population validation.

### ‏Counterfactual cheating

‏בחירת best policy ex-post לכל Event.

---

## ‏51. What I Would Avoid Initially

‏לא נתחיל עם:

- ‏LLM שמייצר Root Cause חופשי בלי Evidence contract.
- ‏מאות Failure Codes.
- ‏Cause scoring מתוחכם.
- ‏Full causal graph.
- ‏Automatic strategy patching.
- ‏Rotation logic מתוך RCA של #2/#3.
- ‏Rule generation אוטומטי.
- ‏Per-symbol exceptions.
- ‏Complex cluster models.
- ‏כלי Dashboard ענק לפני שיש RCA Packet תקין.

‏KISS:

```text
capture
→ first divergence
→ stable taxonomy
→ population
→ hypothesis
→ experiment
```

---

## ‏52. What to Add Later

### ‏`P2`

- ‏Failure clustering אוטומטי.
- ‏Cause candidate ranking.
- ‏RCA confidence model.
- ‏Residual dashboards.
- ‏Near-miss trend analysis.
- ‏Replacement-candidate research.
- ‏RCA-specific replay UI.

### ‏`P3`

- ‏ML-assisted anomaly clustering.
- ‏AI-assisted evidence summarization עם Fact/Hypothesis separation.
- ‏Causal/interaction discovery challengers.
- ‏Automated experiment proposal generation.

### ‏`P4`

- ‏Specialist automated remediation — רק ל־well-defined operational classes, לא Strategy auto-tuning.

---

## ‏53. Required Data / Evidence

‏לפני Production-grade RCA נדרשים לפחות:

```text
raw / normalized event retention
point-in-time quote/trade state
feature vectors at signal/submit/fill
score decomposition
Top-N ranks at signal/submit/fill
filter reason codes + margins
regime snapshot
order lifecycle events
fill ledger
exit reason + exit timeline
cost attribution
risk/sizing state
strategy/config versions
forward labels
MFE / MAE
time-to-profit / time-to-target
```

‏בלי זה, Root Cause Coverage תהיה נמוכה וה־RCA יגלוש לניחושים.

---

## ‏54. Metrics

### ‏Research quality

```text
rca_coverage
unknown_rate
high_confidence_cause_rate
repeat_failure_rate
hypothesis_conversion_rate
experiment_conversion_rate
```

### ‏System outcome

```text
failure_rate_by_cause
loss_by_cause
near_miss_rate
execution_shortfall_by_cause
missed_opportunity_rate
expected_variance_rate
```

### ‏Learning effectiveness

```text
future_failure_reduction_after_fix
future_net_ev_change_after_strategy_promotion
regression_rate
rollback_rate
```

---

## ‏55. Confidence

### ‏High confidence

- ‏צריך להפריד Data/Model/Execution/Exit/Costs/Risk.
- ‏Event יחיד אינו מספיק ל־Strategy Change.
- ‏Top-N evidence חיוני ל־Ranking RCA.
- ‏Actual fills הם Position truth.
- ‏`UNKNOWN` ו־`EXPECTED_VARIANCE` הן Outcomes חוקיים.
- ‏Bug fix ו־Strategy change חייבים מסלולים שונים.
- ‏Reproducibility היא תנאי ל־RCA אמין.
- ‏Future information אסור ב־Proposed fixes.

### ‏Medium confidence

- ‏First-Divergence ordering לעיל הוא Baseline טוב לרובוט.
- ‏Stable taxonomy + packet + timeline יקטינו משמעותית RCA זמן ידני.
- ‏Failure clustering יהיה בעל ערך לאחר הצטברות events.

### ‏Low / Unproven

- ‏כל Failure Code ספציפי באמת מנבא performance עתידי.
- ‏Rank persistence / separation gate ישפר Net EV.
- ‏Replacement candidate / rotation יוסיף Edge.
- ‏Automated cause scoring ישפר החלטות.

‏אלה Hypotheses למחקר.

---

## ‏56. Time-Sensitive Facts

‏המקטע הזה מתודולוגי ברובו.

‏Facts שיידרשו לאימות עדכני בעת Implementation:

- ‏Broker order-state semantics.
- ‏Cancel/replace acknowledgements.
- ‏Provider sequence/clock semantics.
- ‏Market-data field meanings.
- ‏Historical/live timestamp alignment.
- ‏Fee schedules.
- ‏Provider retention/coverage.

‏אין לקודד assumption כזה כ־Root Cause rule בלי current verification.

---

## ‏57. Current Verification Snapshot

‏לא בוצע Web verification חדש במקטע זה, משום שההמלצה היא methodological ואינה תלויה ב־Broker/API capability חדש.

‏כאשר RCA rule עתידי יסתמך על provider/broker semantics משתנים, הוא יחויב ב־current verification לפני Operational use.

---

## ‏58. Relationship to Earlier Sheets

### ‏05 / 06 — Data / Time

‏מגדירים freshness, clocks ו־event time; כאן הם הופכים לשכבת RCA ראשונה.

### ‏11 / 12 — Liquidity / Filters

‏מספקים Gates/reason codes; כאן בודקים bypass, margins ו־rejected winners.

### ‏13 / 14 — Features / Ranking

‏מספקים lineage, decomposition ו־Top-N; כאן משתמשים בהם ל־Feature/Score/Rank RCA.

### ‏15 — Trade / No Trade

‏`NO_TRADE` counterfactual ו־absolute gate נבדקים כאן Population-wide.

### ‏16 / 17 — Entry / Exit

‏ה־timing, fills, chase, exit reason ו־time-to-flat הופכים ל־execution/exit attribution.

### ‏18 — Costs

‏מונע האשמת Prediction כאשר friction מחק Gross Edge.

### ‏19 — Risk

‏מפריד Prediction quality מ־PnL severity caused by sizing/exposure.

### ‏20–24 — Backtest / Validation / Experiments

‏מגדירים את הכללים שמונעים מ־RCA להפוך ל־Overfitting engine.

### ‏25 — Regime

‏Regime snapshot הוא RCA dimension, לא verdict אוטומטי.

---

## ‏59. Relationship to Later Sheets

### ‏27 — Deterministic Market Replay

‏יהפוך את RCA Packet לחלון Event-by-Event שניתן לשחזר ולשנות בו גורם אחד.

### ‏Testing / Observability / Versioning later

‏RCA findings יהפכו ל־Golden scenarios, tests, alerts ו־version comparisons.

### ‏Feature Retirement / Daily Review later

‏Failure/negative-result evidence ישמש להסרת complexity שאינה מצדיקה את עצמה.

### ‏ML/AI later

‏Taxonomy ו־RCA dataset יכולים להפוך ל־training/analysis inputs, אבל רק לאחר שהם אמינים.

---

## ‏60. User-Specific Application

‏לרובוט שלנו, שמטרתו לזהות Momentum קצר מאוד ולהחזיק שניות עד בערך דקה, סדר RCA המועדף הוא:

```text
1. Data fresh and ordered?
2. Candidate still #1 / near #1 at submit?
3. Score / features still valid?
4. Spread / liquidity still executable?
5. Did signal die before fill?
6. Entry slippage / fill delay?
7. Did positive executable movement appear quickly?
8. MFE / MAE / path quality?
9. Was exit aligned with short-horizon thesis?
10. Did costs erase gross edge?
11. What did #2/#3 do?
12. Is this a repeated pattern or expected variance?
```

‏Failure families שרלוונטיות במיוחד למחקר:

```text
FAST_FALSE_BREAKOUT
MOMENTUM_EXHAUSTION
ACTIVITY_FADE
RANK_CHURN
WEAK_TOP1_SEPARATION
SIGNAL_DECAY_BEFORE_FILL
SPREAD_EXPANSION
LATE_ENTRY
MISSED_PASSIVE_FILL
EXIT_CAPTURE_FAILURE
COST_ERASED_EDGE
EXPECTED_VARIANCE
```

‏הן אינן Rules; הן Research labels/hypotheses עד שיוכחו.

---

## ‏61. Concrete Baseline Contract

```text
ON decision/trade terminal event:
    persist immutable RCA packet

AUTOMATIC HEALTH PASS:
    validate data/clock/provider
    validate eligibility/filter execution
    validate order/position reconciliation

TIMELINE:
    reconstruct market + state + feature + rank + order events
    identify signal death point
    identify first divergence

COUNTERFACTUALS:
    compare Top-N
    compare NO_TRADE
    compare limited policy challengers

CLASSIFY:
    primary cause
    contributing causes
    confidence
    severity

POPULATION:
    join with historical events by stable taxonomy
    inspect buckets/clusters/episodes

ACTION:
    BUG → fix + regression + similar-area review
    PATTERN → hypothesis backlog
    INSUFFICIENT → collect/telemetry
    VARIANCE → no action

RESEARCH:
    hypothesis → controlled experiment → OOS → promotion/rejection

MONITOR:
    recurrence + failure mix + RCA effectiveness
```

---

## ‏62. Recommendation Summary

### ‏Baseline

```text
Immutable RCA Packet
→ First-Divergence Tree
→ Stable Failure Taxonomy
→ Primary + Contributing Causes
→ Confidence + Severity
→ Top-N / NO_TRADE Counterfactuals
→ Population RCA
→ Explicit Action
→ Experiment, not tweak
```

### ‏Preferred Default

- ‏Operational/Data checks לפני Strategy blame.
- ‏Top-N snapshots + timelines.
- ‏Signal/Submit/Fill comparison.
- ‏`UNKNOWN`/`EXPECTED_VARIANCE` כ־valid outcomes.
- ‏Bug path נפרד מ־Strategy path.
- ‏Near Miss / Success / Missed Opportunity sampling.
- ‏RCA outputs machine-readable + human-readable.
- ‏Every important claim backed by Metric/Event.

### ‏Challenger

- ‏Automated clustering.
- ‏Cause ranking/confidence scoring.
- ‏Residual analysis.
- ‏Replacement-candidate analysis.
- ‏RCA replay UI.

### ‏Avoid Unless Evidence

- ‏Rule per loss.
- ‏Post-hoc storytelling.
- ‏Future-aware fixes.
- ‏Automatic strategy patching.
- ‏Per-symbol exceptions.
- ‏AI verdicts without evidence separation.
- ‏Counterfactual cherry-picking.

‏המבחן הסופי למקטע הזה אינו האם אנחנו מסוגלים להסביר כל Loss. המבחן הוא האם אנחנו יודעים לשחזר Facts, למצוא את השכבה שבה נוצרה הסטייה, להודות כשאין Root Cause בר־מניעה, ולהפוך Pattern אמיתי לניסוי מבוקר במקום ל־tweak אקראי.