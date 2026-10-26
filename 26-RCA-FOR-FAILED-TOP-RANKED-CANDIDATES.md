# ‏שלב 26 — `RCA` ל־Rank #1 שנכשל: להפוך כישלון לידע ולא ל־Tweak אקראי

> ‏מטרת הפרק: לבנות שיטת `Root Cause Analysis` מסודרת לכל מצב שבו המניה שדורגה במקום הראשון לא סיפקה את התוצאה שציפינו לה. במקום לומר “ה־Score היה גרוע” או לשנות משקל באופן אינטואיטיבי, נפרק את האירוע לשכבות, נאסוף Evidence, נריץ Counterfactuals ונחליט האם באמת צריך שינוי.
>
> ‏העיקרון המרכזי: **עסקה שנכשלה אינה הוכחה שהמודל שגוי, ועסקה שהצליחה אינה הוכחה שהמודל נכון. `RCA` מקצועי מחפש דפוס חוזר, סיבה ניתנת לבדיקה והשפעה מדידה.**
>
> ‏כמו בכל הקורס: קודם נלמד את שיטת החקירה הכללית, אחר כך את ה־Best Practices ורזי המקצוע, ולבסוף נתאים אותה לרובוט שלך — Scanner של כל השוק, בחירת `Top Candidate`, והחזקה של שניות בודדות ועד בערך דקה.

---

# ‏1. מהו `RCA`?

‏`RCA` = `Root Cause Analysis`.

‏המטרה אינה רק לתאר מה קרה.

‏המטרה היא להגיע לשאלה:

> ‏מה הייתה הסיבה הסבירה ביותר לכשל, איזה Evidence תומך בה, ואיזה ניסוי יכול להפריך או לאשש אותה?

---

# ‏2. למה Rank #1 שנכשל הוא אירוע מחקרי חשוב

‏הרובוט שלך עושה משהו מאוד ממוקד:

```text
Thousands of symbols
→ Filters
→ Features
→ Score
→ Rank
→ #1 Candidate
→ Trade / No Trade
```

‏לכן כאשר #1 נכשל, יש לנו הזדמנות ללמוד על כל השרשרת.

‏אבל חשוב:

> ‏#1 יכול להיכשל גם כאשר כל המערכת עבדה בדיוק לפי התכנון.

‏אין מודל חיזוי מושלם.

---

# ‏3. Failure אינו בהכרח Bug

‏נפריד בין שלושה דברים:

```text
Bug
Model Error
Normal Random Outcome
```

‏`Bug` = המערכת עשתה משהו שלא התכוונו אליו.

‏`Model Error` = המערכת עשתה בדיוק מה שתוכנן, אבל התחזית הייתה חלשה.

‏`Normal Random Outcome` = גם אסטרטגיה בעלת Edge מפסידה בחלק מהעסקאות.

‏אסור לערבב ביניהם.

---

# ‏4. מה נחשב “Rank #1 נכשל”?

‏צריך הגדרה מפורשת.

‏אפשר להגדיר כמה סוגי Failure:

```text
No positive move within horizon
Target not reached
Stop reached first
Net PnL < 0
Execution consumed expected edge
Rank #2/#3 significantly outperformed #1
Signal decayed before fill
```

‏לא חייבת להיות הגדרה אחת בלבד.

---

# ‏5. Outcome Labels שונים

‏אותו Candidate יכול להיות:

```text
Correct prediction
Bad execution
Negative net trade
```

‏לכן כדאי לשמור Labels נפרדים:

```text
prediction_outcome
ranking_outcome
execution_outcome
exit_outcome
net_outcome
```

---

# ‏6. העיקרון: אל תשנה מודל אחרי Trade אחד

‏אחד האנטי־פאטרנים המסוכנים הוא:

```text
Trade lost
→ change threshold
→ next trade lost
→ change weight
→ next trade won
→ assume fixed
```

‏זו כמעט הזמנה ל־Overfitting.

‏עסקה בודדת היא Case Study, לא Evidence מספיק לשינוי מודל.

---

# ‏7. שתי רמות RCA

‏נשתמש בשתי רמות:

## ‏`Single-Event RCA`

‏חקירת אירוע בודד לעומק.

## ‏`Population RCA`

‏חקירת קבוצה של אירועים דומים כדי לראות אם יש דפוס.

‏השנייה חשובה יותר לקבלת החלטות מערכתיות.

---

# ‏8. ה־RCA Decision Tree שלנו

‏נבדוק לפי הסדר:

```text
1. Data
2. Eligibility / Filters
3. Features
4. Score
5. Ranking
6. Regime
7. Decision timing
8. Entry execution
9. Exit logic
10. Costs
11. Risk / sizing
12. Randomness / irreducible model error
```

‏הסדר חשוב כי אין טעם לכוון Score אם הבעיה בכלל הייתה Quote ישן.

---

# ‏9. שכבה 1 — `Data RCA`

‏לפני הכול נשאל:

> ‏האם הנתונים שעליהם התקבלה ההחלטה היו נכונים?

‏נבדוק:

- ‏Timestamp.
- ‏Sequence.
- ‏Missing events.
- ‏Duplicate events.
- ‏Stale quote.
- ‏Stale trade.
- ‏Bid/Ask validity.
- ‏Feed disconnect.
- ‏Provider mismatch.
- ‏Clock skew.

---

# ‏10. Data Age בזמן Signal

‏נשמור:

```text
signal_time
last_trade_time
last_quote_time
trade_age_ms
quote_age_ms
```

‏אם Rank #1 נבחר על Quote בן 2 שניות בזמן ששאר השוק מעודכן ל־100ms, זו בעיית Data לפני שהיא בעיית Strategy.

---

# ‏11. Cross-Provider Verification

‏כאשר יש יותר ממקור נתונים אחד, Failure חריג יכול להיבדק מול Feed נוסף.

‏נשאל:

```text
Did provider A show the same state as provider B?
```

‏המטרה אינה לבחור בדיעבד את המקור שנוח לנו.

‏המטרה היא לזהות corruption או coverage gap.

---

# ‏12. Sequence Gap

‏אם חסרו Events לפני Signal, Features כמו:

```text
trade_count_5s
volume_5s
velocity_2s
```

‏יכולים להיות שגויים.

‏לכן נשמור `sequence_gap_detected` כחלק מה־Decision Snapshot.

---

# ‏13. שכבה 2 — `Eligibility / Filter RCA`

‏השאלה:

> ‏האם Candidate בכלל היה אמור להגיע ל־Ranking?

‏נבדוק את כל ה־Filters שהיו אמורים לפעול.

---

# ‏14. Filter Bypass

‏לפעמים הכלל קיים אבל מסיבה טכנית לא הופעל.

‏לדוגמה:

```text
spread_filter = enabled
but spread_value = null
system treated null as pass
```

‏זה Bug.

---

# ‏15. Filter Threshold Problem

‏מצב אחר:

```text
Spread allowed <= 20 bps
Actual = 19.8 bps
```

‏המערכת עבדה לפי התכנון.

‏אם שוב ושוב Candidates סביב 18–20bps נכשלים, ייתכן שה־threshold חלש.

‏אבל זה כבר Hypothesis למחקר — לא תיקון מיידי.

---

# ‏16. Rejected Winner Analysis

‏באותו Timestamp נשאל גם:

> ‏האם Candidate שנפסל היה מצליח הרבה יותר?

‏כך אפשר לגלות Filter אגרסיבי מדי.

---

# ‏17. שכבה 3 — `Feature RCA`

‏נבדוק איזה Features גרמו למניה להיראות טובה.

‏נשמור `Feature Snapshot` מלא בזמן Signal.

‏לדוגמה:

```text
momentum_1s
momentum_5s
momentum_10s
trade_rate_5s
activity_acceleration
spread_bps
quote_age_ms
rank_persistence
```

---

# ‏18. Feature Contribution

‏אם ה־Score הוא מודולרי, נשמור Contribution לכל Feature:

```text
momentum contribution = +24
activity contribution = +18
liquidity contribution = +7
staleness penalty = -2
```

‏כך אפשר להבין למה #1 ניצח.

---

# ‏19. Feature Was Right, Outcome Was Wrong

‏לדוגמה:

```text
Momentum = genuinely strong
Activity = genuinely accelerating
Liquidity = good
```

‏והמניה עדיין ירדה.

‏זה לא אומר שה־Features היו שגויים.

‏ייתכן שהשוק פשוט שינה כיוון.

---

# ‏20. Feature Staleness

‏Feature יכול להיות מחושב נכון אבל כבר לא רלוונטי.

‏למשל:

```text
feature_as_of = 10:15:30.100
order_submit = 10:15:31.000
```

‏במסחר של שניות 900ms יכולים להיות משמעותיים.

---

# ‏21. Feature Decay

‏נמדוד:

```text
feature_at_signal
feature_at_submit
feature_at_fill
```

‏ונשאל:

> ‏האם הסיגנל עדיין היה קיים כאשר באמת נכנסנו?

---

# ‏22. שכבה 4 — `Score RCA`

‏נבדוק האם ה־Score נתן משקל לא נכון לסימנים.

‏אבל לא נתחיל משם אוטומטית.

---

# ‏23. Score Decomposition

‏לכל Candidate נשמור:

```text
momentum_subscore
activity_subscore
liquidity_subscore
execution_subscore
context_subscore
final_score
```

---

# ‏24. Dominating Feature

‏נחפש Feature אחד שמשתלט על הציון.

‏לדוגמה:

```text
momentum = extreme
activity = weak
liquidity = average
```

‏אבל המשקל של momentum גדול כל כך שהמניה עדיין #1.

‏זו Hypothesis אפשרית ל־RCA קבוצתי.

---

# ‏25. Correlated Features

‏ייתכן שה־Score “סופר אותו מידע שלוש פעמים”.

‏למשל:

```text
return_5s
velocity_5s
slope_5s
```

‏שלושתם יכולים לתאר כמעט אותה תנועה.

---

# ‏26. Nonlinear Failure

‏Feature טוב עד נקודה מסוימת יכול להפוך לרע בקצה.

‏לדוגמה:

```text
higher acceleration = better
```

‏אולי נכון עד Percentile 95.

‏ב־Percentile 99.9 אולי אנחנו כבר קונים exhaustion.

---

# ‏27. Saturation

‏לכן נשאל:

> ‏האם Feature צריך להמשיך להוסיף Score ללא גבול?

‏לעיתים התשובה היא לא.

---

# ‏28. Interaction Failure

‏Feature יכול להיות טוב רק בתנאי Feature אחר.

‏לדוגמה:

```text
high momentum + high activity = good
high momentum + low activity = weak
```

‏זה Interaction.

---

# ‏29. שכבה 5 — `Ranking RCA`

‏גם אם Score עצמו סביר, ייתכן שהבחירה ב־#1 הייתה חלשה.

---

# ‏30. Rank Separation

‏נשמור:

```text
score_1
score_2
score_3
rank_gap_1_2
rank_gap_1_5
```

‏#1 עם פער עצום שונה מ־#1 שניצח ב־0.01 נקודות.

---

# ‏31. Weak Winner

‏אם:

```text
#1 = 82.11
#2 = 82.10
#3 = 82.09
```

‏הבחירה ב־#1 כמעט שרירותית.

‏ייתכן ש־`NO TRADE` היה עדיף.

---

# ‏32. Rank Stability

‏נבדוק:

```text
rank(t-3s)
rank(t-2s)
rank(t-1s)
rank(t)
```

‏Candidate שקפץ מ־#140 ל־#1 בשבריר שנייה שונה מ־Candidate שהיה Top-3 במשך 10 שניות.

---

# ‏33. Rank Churn

‏נמדוד כמה פעמים המקום הראשון התחלף בזמן קצר.

‏High churn יכול להצביע על שוק רועש או Score רגיש מדי.

---

# ‏34. Counterfactual Rank #2

‏נחשב:

```text
Outcome(rank1)
Outcome(rank2)
Outcome(rank3)
```

‏אם #2 מנצח #1 לפעמים — זה נורמלי.

‏אם #2 מנצח #1 באופן עקבי — זו בעיית Ranking אפשרית.

---

# ‏35. `Selection Regret`

‏נגדיר:

```text
Regret = BestOutcomeAmongEligible - OutcomeChosen
```

‏המטרה אינה לדרוש Regret אפס.

‏המטרה היא לבדוק אם הוא גדול ושיטתי.

---

# ‏36. Winner's Curse

‏כאשר בוחרים את הערך הקיצוני ביותר מתוך אלפי מניות, חלק מהקיצוניות יכולה להיות Noise.

‏לכן #1 דורש בדיקה מיוחדת.

---

# ‏37. Extreme Score Diagnostics

‏נבדוק האם Scores קיצוניים במיוחד:

```text
perform better
plateau
or reverse
```

---

# ‏38. שכבה 6 — `Regime RCA`

‏ייתכן שהמודל טוב בדרך כלל אבל לא במצב השוק הנוכחי.

---

# ‏39. Regime Snapshot

‏נשמור בזמן Signal:

```text
time_of_day
market_volatility
market_breadth
market_activity
cross_section_dispersion
liquidity_regime
candidate_density
```

---

# ‏40. Context Mismatch

‏לדוגמה:

‏Feature מסוים יכול לעבוד היטב בפתיחה ולהיכשל באמצע היום.

‏אם רוב Failures נמצאים באותו Regime, זו Evidence חשובה.

---

# ‏41. Regime Transition

‏מצב קשה במיוחד הוא מעבר מהיר:

```text
quiet → fast
broad rally → reversal
normal liquidity → spread expansion
```

‏ה־Signal יכול להיווצר תחת Regime אחד ולהתבצע תחת אחר.

---

# ‏42. Regime at Signal מול Fill

‏נשמור:

```text
regime_at_signal
regime_at_submit
regime_at_fill
```

---

# ‏43. שכבה 7 — `Decision Timing RCA`

‏יכול להיות שה־Scanner צדק אבל החליט מאוחר מדי.

---

# ‏44. Signal Age

‏נמדוד:

```text
signal_age_ms_at_decision
signal_age_ms_at_submit
signal_age_ms_at_fill
```

---

# ‏45. Edge Decay

‏נשווה:

```text
expected_edge_at_signal
expected_edge_at_submit
expected_edge_at_fill
```

‏אם ה־Edge כמעט נעלם לפני Fill, זו בעיית Timing/Execution ולא בהכרח Prediction.

---

# ‏46. Late Entry

‏דפוס אפשרי:

```text
Scanner detects move
Rank rises
Order arrives
Move already exhausted
```

‏זה Failure מסוג `Late Entry`.

---

# ‏47. Early Entry

‏גם ההפך אפשרי:

```text
Momentum begins
Scanner promotes too early
movement fails to confirm
```

---

# ‏48. Confirmation Trade-Off

‏יותר confirmation מפחית False Positives אבל עלול לגרום לכניסה מאוחרת.

‏זו Trade-off שצריך למדוד.

---

# ‏49. שכבה 8 — `Execution RCA`

‏נשאל:

> ‏האם התחזית הייתה טובה אבל הביצוע הרס אותה?

---

# ‏50. Entry Implementation Shortfall

‏נחשב:

```text
entry_shortfall = actual_fill - reference_price
```

‏ל־Long.

---

# ‏51. Fill Delay

‏נבדוק:

```text
order_submit_time
first_fill_time
full_fill_time
```

---

# ‏52. Partial Fill Problem

‏ייתכן שרק חלק מהכמות התמלא במחיר טוב והשאר במחיר גרוע יותר.

‏ננתח לפי VWAP של ה־fills.

---

# ‏53. Queue Failure

‏ב־Passive Limit:

```text
price touched
but order not filled
```

‏זה לא בהכרח Simulation Bug.

‏יכול להיות שלא הגענו לתור.

---

# ‏54. Aggressiveness Failure

‏נבדוק האם היינו:

```text
too passive
or
too aggressive
```

‏Too passive → missed move.

‏Too aggressive → paid too much spread/slippage.

---

# ‏55. Cancel/Replace Failure

‏ייתכן שהמערכת רדפה אחרי המחיר:

```text
place
cancel
replace
cancel
replace
```

‏ובסוף קיבלה Fill גרוע.

---

# ‏56. Chase Distance

‏נשמור:

```text
signal_price
first_order_price
final_fill_price
chase_bps
```

---

# ‏57. Execution Counterfactuals

‏נריץ את אותו Signal עם:

```text
passive
marketable limit
aggressive limit
skip if not filled quickly
```

‏כדי להבין אם הבעיה הייתה Strategy או Execution Policy.

---

# ‏58. שכבה 9 — `Exit RCA`

‏ייתכן שהכניסה הייתה טובה וה־Exit היה הבעיה.

---

# ‏59. Exit Reason

‏נשמור תמיד:

```text
take_profit
time_stop
stop_loss
signal_exit
thesis_exit
risk_exit
manual_exit
system_exit
```

---

# ‏60. MFE מול Realized PnL

‏דוגמה:

```text
MFE = +18 bps
Realized = -4 bps
```

‏ה־Scanner כנראה מצא תנועה.

‏הבעיה יכולה להיות Exit Capture.

---

# ‏61. Exit Efficiency

‏אפשר למדוד בקירוב:

```text
captured_fraction = realized_positive_move / MFE
```

‏כאשר ההגדרה מתאימה למקרה.

---

# ‏62. Time Stop Too Short

‏אם הרבה עסקאות יוצאות 2 שניות לפני שהמהלך מתחיל, ייתכן שה־Time Stop קצר מדי.

‏אבל חייבים לבדוק Population, לא אנקדוטה.

---

# ‏63. Time Stop Too Long

‏אם רוב המהלכים המוצלחים מתחילים תוך 4 שניות ואחרי 12 שניות התוחלת שלילית, החזקה ארוכה מדי יכולה להיות בעיה.

---

# ‏64. Stop Placement RCA

‏נבדוק:

```text
MAE before success
stop distance
stop-hit-first rate
```

---

# ‏65. Giveback

‏נמדוד:

```text
MFE - realized_return
```

‏כדי להבין כמה רווח פוטנציאלי החזרנו לשוק.

---

# ‏66. Exit Counterfactuals

‏נוכל להשוות:

```text
actual exit
fixed target
fixed time
signal exit
trailing
best realistic exit family
```

‏לא כדי לבחור בדיעבד את הטוב ביותר לכל Trade, אלא כדי להשוות Policies על אוכלוסייה שלמה.

---

# ‏67. שכבה 10 — `Cost RCA`

‏ייתכן שהעסקה הייתה נכונה בכיוון אבל לא כלכלית.

---

# ‏68. Cost Attribution

‏נפרק:

```text
commission
fees
spread
entry_slippage
exit_slippage
market_impact
```

---

# ‏69. Gross Winner, Net Loser

‏זו קטגוריה חשובה:

```text
Gross PnL > 0
Net PnL < 0
```

‏במסחר קצר זו יכולה להיות בעיה מרכזית.

---

# ‏70. Cost-to-Edge Ratio

‏נשמור:

```text
expected_cost / expected_gross_edge
actual_cost / realized_gross_move
```

---

# ‏71. Spread Expansion

‏Candidate יכול לעבור Filter בזמן Signal ואז ה־Spread להתרחב לפני Entry או Exit.

‏נשמור את ה־Spread בכל שלב.

---

# ‏72. Fee Model Error

‏אם Backtest השתמש בתעריף לא נכון, הבעיה היא Research Infrastructure.

---

# ‏73. שכבה 11 — `Risk / Sizing RCA`

‏לפעמים Signal טוב הופך להפסד גדול בגלל Position Size לא מתאים.

---

# ‏74. PnL מול Quality

‏Trade יכול להיות Prediction Failure קטן אך PnL Failure גדול בגלל Sizing.

‏לכן אין להשתמש ב־PnL בלבד כדי לשפוט Scanner.

---

# ‏75. Liquidity-adjusted Sizing

‏נבדוק האם הכמות הייתה גדולה יחסית ל־Depth ול־recent traded volume.

---

# ‏76. Partial Exposure

‏אם המערכת התכוונה ל־100 מניות וקיבלה 37 בלבד, ה־Risk וה־PnL שונים מהתכנון.

---

# ‏77. שכבה 12 — `Randomness / Model Error`

‏אחרי שבדקנו הכול, ייתכן שהתשובה היא פשוט:

> ‏המודל העריך הסתברות חיובית, אבל הפעם התוצאה הייתה שלילית.

‏וזה תקין.

---

# ‏78. אל תחפש Root Cause מזויף

‏זה רז מקצוע חשוב.

‏לא לכל הפסד יש “סיבה מיוחדת”.

‏אם נחפש הסבר מושלם לכל Trade, כמעט תמיד נמצא Pattern מקרי ונבנה עליו Overfitting.

---

# ‏79. `Unexplained / Expected Variance`

‏זו קטגוריית Failure חוקית.

```text
root_cause = EXPECTED_VARIANCE
```

---

# ‏80. Failure Taxonomy רשמית

‏נגדיר Codes קבועים, למשל:

```text
DATA_STALE
DATA_GAP
FILTER_WEAK
FEATURE_DECAY
SCORE_DOMINATION
RANK_WEAK_SEPARATION
RANK_CHURN
REGIME_MISMATCH
SIGNAL_LATE
ENTRY_SLIPPAGE
PASSIVE_MISSED_FILL
PARTIAL_FILL
EXIT_TOO_EARLY
EXIT_TOO_LATE
COST_ERASED_EDGE
SIZE_TOO_LARGE
EXPECTED_VARIANCE
UNKNOWN
```

---

# ‏81. למה Codes עדיפים על טקסט חופשי

‏כי אז אפשר לשאול:

```text
How many failures were FEATURE_DECAY?
What is their average loss?
Which hour produces them?
Did version 12 reduce them?
```

---

# ‏82. Primary מול Contributing Cause

‏Failure יכול לכלול יותר מסיבה אחת.

‏לדוגמה:

```text
Primary: SIGNAL_LATE
Contributing: SPREAD_EXPANSION
```

---

# ‏83. Confidence ברמת ה־RCA

‏לא תמיד נדע בוודאות.

‏נשמור:

```text
rca_confidence = high / medium / low
```

---

# ‏84. Evidence לפני Conclusion

‏כל RCA צריך לכלול:

```text
Observation
Evidence
Hypothesis
Counterfactual
Conclusion
Confidence
Next experiment
```

---

# ‏85. `RCA Packet`

‏לכל אירוע נרצה חבילה שניתנת לפתיחה מחדש.

‏היא תכלול לפחות:

```text
run_id
strategy_version
symbol
signal_time
signal_snapshot
universe_snapshot
rank_snapshot
feature_snapshot
regime_snapshot
quote/trade window
order events
fills
exit events
cost breakdown
forward path
counterfactual top-N
```

---

# ‏86. חלון זמן סביב האירוע

‏לרוב נרצה לשמור:

```text
T-30s ... Signal ... Fill ... Exit ... T+60s
```

‏הטווח המדויק תלוי באסטרטגיה.

---

# ‏87. למה צריך גם Before וגם After

‏לפני האירוע רואים איך Candidate נבנה.

‏אחרי האירוע רואים איך התחזית התפתחה.

---

# ‏88. `Decision Trace`

‏נשמור הסבר מכני:

```text
Passed filter X
Passed filter Y
Momentum score +18
Activity score +14
Liquidity score +6
Total = 84
Rank = 1
Decision = TRADE
```

---

# ‏89. Top-N Snapshot

‏לא מספיק לשמור #1.

‏נשמור גם:

```text
Top 10
scores
features
future outcomes
```

---

# ‏90. למה Top-N חשוב ל־RCA

‏כי אפשר להבדיל בין:

```text
Entire market failed
```

‏לבין:

```text
#1 failed but #2/#3 succeeded
```

‏אלה בעיות שונות.

---

# ‏91. Market Context Snapshot

‏נשמור גם:

```text
index move
market breadth
market volatility
cross-sectional activity
candidate count
```

---

# ‏92. Candidate Density

‏אם רק מניה אחת עברה Filters, הבחירה שונה ממצב שבו 150 מניות נראו חזקות.

---

# ‏93. “Best of Bad Set”

‏לעיתים #1 הוא פשוט הטוב ביותר מתוך קבוצה חלשה.

‏זה Failure של Decision Threshold יותר מאשר Ranking.

---

# ‏94. `NO TRADE` Counterfactual

‏בכל Failure נשאל:

> ‏האם היה סימן שהיה צריך לגרום ל־NO TRADE?

‏לדוגמה:

```text
weak separation
high spread
rank churn
low activity
stale quote
```

---

# ‏95. Trade/No-Trade Boundary RCA

‏Failures ליד סף ההחלטה מעניינים במיוחד.

‏נבדוק אם Threshold קטן היה משפר Population שלם.

---

# ‏96. אל תזיז Threshold לפי Case אחד

‏במקום:

```text
failure at score 81
→ change threshold to 82
```

‏נעשה:

```text
analyze score buckets 75–90
```

---

# ‏97. Bucket RCA

‏נחלק Failures לפי:

```text
score bucket
spread bucket
activity bucket
rank persistence bucket
latency bucket
regime
```

---

# ‏98. Failure Clustering

‏במקום 500 סיפורים נפרדים, נחפש Clusters.

‏לדוגמה:

```text
Cluster A: fast burst + low depth + late fill
Cluster B: stable rank + good liquidity + random reversal
Cluster C: high momentum + falling activity
```

---

# ‏99. Cluster Value

‏Cluster חוזר יכול להפוך ל־Hypothesis טובה.

‏Case בודד בדרך כלל לא.

---

# ‏100. Success RCA

‏לא חוקרים רק הפסדים.

‏צריך לחקור גם Trades מוצלחים.

---

# ‏101. למה Success RCA חשוב

‏אחרת נלמד רק “איך להימנע מכישלון” ולא מה באמת יצר Edge.

---

# ‏102. Good Outcome for Wrong Reason

‏עסקה יכולה להרוויח אף שה־Signal היה חלש.

‏לדוגמה:

```text
bad signal
market-wide spike after entry
profit
```

‏לא נרצה לתגמל את המודל על מזל.

---

# ‏103. Bad Outcome for Good Reason

‏ולהפך:

```text
strong valid signal
unexpected reversal
loss
```

‏לא בהכרח נרצה לשנות את המודל.

---

# ‏104. Calibration דרך קבוצות

‏אם Score מסוים מבטיח סטטיסטית הסתברות גבוהה יותר, נבדוק מאות/אלפי אירועים — לא Trade אחד.

---

# ‏105. `Expected Failure Rate`

‏מערכת טובה צריכה לדעת שגם בתנאים מצוינים יהיו Failures.

‏נרצה להבין מהו Failure Rate צפוי בכל Score/Regime bucket.

---

# ‏106. Unexpected Failure

‏Failure הופך מעניין במיוחד כאשר הוא קורה במקום שבו המודל היה אמור להיות חזק מאוד.

---

# ‏107. Residual Analysis

‏אפשר לחשוב על Error כ־Residual:

```text
actual_outcome - expected_outcome
```

‏נחפש האם ה־Residuals קשורים למשתנה שלא הכנסנו למודל.

---

# ‏108. Missing Feature Discovery

‏אם Failures גדולים מרוכזים כאשר:

```text
spread expanding rapidly
```

‏ייתכן שחסר Feature של `spread_velocity`.

‏אבל זו רק Hypothesis.

---

# ‏109. Missing Interaction Discovery

‏אולי:

```text
momentum strong
```

‏טוב רק כאשר:

```text
activity accelerating
```

‏זו Hypothesis ל־Interaction.

---

# ‏110. Missing Regime Discovery

‏אם Cluster של כישלונות מופיע בזמן תופעה שחוזרת, ייתכן שחסר Regime.

---

# ‏111. Missing Execution Rule

‏אם Prediction נכון אבל Fill מאוחר מוחק Edge, אולי צריך:

```text
max_signal_age
max_chase_bps
order_ttl
```

---

# ‏112. Missing Exit Rule

‏אם MFE טוב אבל רווח חוזר שוב ושוב לאפס, אולי Exit Policy דורש מחקר.

---

# ‏113. RCA אינו Change Request אוטומטי

‏התוצאה של RCA יכולה להיות:

```text
NO_ACTION
COLLECT_MORE_DATA
NEW_HYPOTHESIS
BUG_FIX
NEW_EXPERIMENT
OPERATIONAL_FIX
```

---

# ‏114. `NO_ACTION` הוא תוצאה טובה

‏אם האירוע נראה כמו Variance צפויה ואין Pattern חוזר, לא משנים דבר.

---

# ‏115. Bug Fix מול Strategy Change

‏Bug Fix מתקנים כאשר ההתנהגות אינה תואמת Specification.

‏Strategy Change דורש ניסוי מסודר.

‏לא מערבבים ביניהם.

---

# ‏116. Hypothesis Template

‏לדוגמה:

```text
Observation:
Failures with rank_persistence < 2s have poor 10s forward returns.

Hypothesis:
Very recent rank jumps are dominated by noise.

Proposed experiment:
Require rank_persistence >= X.

Primary metric:
Net EV at 10s.

Guardrails:
Trade count, missed winners, latency, cost.
```

---

# ‏117. Counterfactual First

‏לפני שינוי קוד, ננסה לענות היסטורית:

> ‏אם הכלל החדש היה קיים אז, מה היה קורה לכל אוכלוסיית האירועים?

---

# ‏118. Measure Both Saved Losses and Lost Winners

‏Filter חדש יכול למנוע Failures — אבל גם למחוק Winners.

‏נמדוד את שניהם.

---

# ‏119. Net Effect

‏המטרה אינה:

```text
fewer losing trades
```

‏אלא:

```text
better expected net outcome
```

---

# ‏120. Failure Cost

‏Failures שונים בעוצמה.

‏נמדוד:

```text
count
average_loss
median_loss
tail_loss
capital_impact
```

---

# ‏121. Severity

‏אפשר לתייג:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

‏אבל Severity צריכה להיות מבוססת הגדרה ברורה.

---

# ‏122. Operational Failures מקבלים עדיפות

‏אם Failure נובע מ־stale feed, duplicate order או unknown position, זו בדרך כלל בעיה חמורה יותר ממודל שפשוט טעה בתחזית.

---

# ‏123. Near Miss RCA

‏נחקור גם מצבים שבהם המערכת כמעט כשלה:

```text
spread nearly exceeded limit
latency nearly exceeded TTL
position mismatch briefly occurred
```

‏Near Misses יכולים לחשוף בעיה לפני הפסד אמיתי.

---

# ‏124. RCA Dashboard

‏נרצה Dashboard עם:

```text
failures by cause
failures by regime
failures by score bucket
failures by time of day
failures by symbol
failures by strategy version
average loss by cause
```

---

# ‏125. RCA Trend

‏נבדוק האם Version חדש:

```text
reduced one failure type
but increased another
```

---

# ‏126. Regression in Failure Mix

‏לדוגמה:

```text
Late Entry failures ↓
Missed Fill failures ↑
```

‏יכול להיות שהחלפנו בעיה אחת באחרת.

---

# ‏127. Version Comparison

‏לכל Strategy Version נחשב Failure Taxonomy זהה.

‏כך ההשוואה עקבית.

---

# ‏128. Replay as RCA Tool

‏Replay מאפשר להריץ שוב את אותו חלון שוק עם:

```text
same data
same timestamps
same version
```

‏ולבדוק אם האירוע reproducible.

---

# ‏129. Deterministic Replay

‏אם אותה גרסה על אותם Events נותנת תוצאה אחרת, יש בעיית Determinism או State.

---

# ‏130. Counterfactual Replay

‏נוכל לשנות רכיב אחד בלבד:

```text
execution policy
filter threshold
feature
exit rule
```

‏ולהשוות.

---

# ‏131. Freeze Everything Else

‏זה עיקרון ניסויי:

> ‏ב־Counterfactual טוב משנים גורם אחד ושומרים את השאר קבוע ככל האפשר.

---

# ‏132. RCA Timeline

‏נציג כל Failure על Timeline:

```text
T-10s candidate rising
T-3s rank #4
T-1s rank #2
T0 rank #1 / signal
T+180ms decision
T+320ms submit
T+640ms fill
T+1.2s momentum decelerates
T+3s rank falls to #8
T+5s stop
```

‏זה הרבה יותר אינפורמטיבי משורת PnL אחת.

---

# ‏133. State Transition Timeline

‏בנוסף לשוק נשמור:

```text
SCANNING
CANDIDATE
DECIDED
ORDER_WORKING
PARTIALLY_FILLED
POSITION
EXITING
FLAT
```

---

# ‏134. Feature Timeline

‏נרצה לראות Features מרכזיים לאורך זמן.

‏למשל:

```text
momentum_5s
activity_rate
spread_bps
rank
score
```

---

# ‏135. Signal Death Point

‏נגדיר את הרגע שבו התנאים כבר לא היו עומדים בדרישות ה־Trade.

‏נשווה אותו ל־Fill.

---

# ‏136. Was the Trade Already Dead Before Fill?

‏זו אחת השאלות החשובות ביותר במסחר קצר.

‏אם כן, הבעיה היא כנראה Execution/Decision latency.

---

# ‏137. Was the Signal Still Good After Fill?

‏אם כן אבל Trade נכשל מאוחר יותר, נמשיך ל־Exit/Variance analysis.

---

# ‏138. `time_to_failure`

‏נמדוד כמה מהר Candidate נכשל אחרי Signal/Fill.

---

# ‏139. Fast Failure מול Slow Failure

‏Failure בתוך 300ms שונה מכשל אחרי 40 שניות.

‏ייתכן שמדובר בסיבות שונות לחלוטין.

---

# ‏140. `time_to_rank_loss`

‏כמה זמן עבר עד שהמניה איבדה את המקום הראשון?

---

# ‏141. `time_to_score_collapse`

‏כמה זמן עבר עד שה־Score ירד מתחת לסף?

---

# ‏142. `time_to_spread_expansion`

‏כמה מהר ה־Spread נהיה לא מתאים?

---

# ‏143. `time_to_liquidity_loss`

‏כמה מהר Depth נעלם?

---

# ‏144. Competing Candidate Analysis

‏בזמן שאנחנו בפוזיציה נבדוק מה קרה למועמדים אחרים.

‏זה עוזר להבין Opportunity Cost.

---

# ‏145. Replacement Candidate

‏אם #2 הפך בבירור לטוב יותר בזמן שאנחנו עדיין מחזיקים #1, זה מידע למחקר Exit/Rotation עתידי.

‏לא בהכרח צריך ליישם Rotation מיד.

---

# ‏146. RCA ו־Opportunity Cost

‏עסקה Flat יכולה להיות כשל אם היא חסמה עסקה טובה בהרבה.

---

# ‏147. אבל Opportunity Cost אינו תמיד Realized Loss

‏צריך להפריד בין:

```text
actual PnL
counterfactual missed PnL
```

---

# ‏148. Sample Selection Bias ב־RCA

‏אם נחקור רק עסקאות שהפסידו כסף, נפספס Bugs שאירעו בעסקאות מרוויחות.

---

# ‏149. Random RCA Sampling

‏Best Practice:

‏לחקור גם Sample אקראי של Trades רגילים.

---

# ‏150. Top Winners Review

‏נבדוק גם Winners קיצוניים כדי להבין אם הם נובעים מאותו Edge או מאירועים מקריים.

---

# ‏151. RCA of `NO TRADE`

‏גם החלטות לא לסחור ראויות לבדיקה.

‏במיוחד כאשר Candidate שנפסל עשה מהלך גדול.

---

# ‏152. Missed Opportunity Taxonomy

‏לדוגמה:

```text
FILTERED_OUT
SCORE_TOO_LOW
NO_TRADE_THRESHOLD
EXECUTION_NOT_FILLED
RISK_BLOCKED
SYSTEM_UNAVAILABLE
```

---

# ‏153. Good Missed Trade

‏לפעמים פספסנו Winner מסיבה נכונה.

‏לדוגמה Candidate היה לא נזיל מדי.

‏אין להסיק שצריך להסיר את Filter.

---

# ‏154. Safety Overrides Profit

‏כלל בטיחות לא צריך להישפט רק לפי “כמה רווחים הוא מנע”.

‏יש Rules שמטרתם למנוע Tail Risk.

---

# ‏155. RCA לפי Horizon

‏Candidate יכול להיות:

```text
bad at 2s
good at 30s
```

‏או להפך.

‏לכן Root Cause תלוי ב־Holding Thesis.

---

# ‏156. Horizon Mismatch

‏אם המודל נבנה על Outcome של 60 שניות אבל אנחנו יוצאים אחרי 8 שניות, ייתכן שהבעיה היא Label/Objective mismatch.

---

# ‏157. Objective RCA

‏נשאל:

> ‏האם אנחנו בכלל מאמנים/מדרגים לפי המטרה הכלכלית שאנחנו באמת רוצים?

---

# ‏158. Prediction Target מול Trading Target

‏לדוגמה:

```text
Prediction target = future mid return
Trading target = net executable PnL after costs
```

‏הם לא אותו דבר.

---

# ‏159. Ranking Metric RCA

‏מודל יכול להיות טוב ב־average return אבל גרוע ב־Top-1 selection.

‏לכן צריך למדוד את מטרת הדירוג עצמה.

---

# ‏160. Top-1 Specific Metrics

‏נשמור למשל:

```text
Top1 hit rate
Top1 net EV
Top1 regret
Top1 time_to_profit
Top1 MFE
Top1 MAE
```

---

# ‏161. Failure Probability Calibration

‏אם Candidate עם confidence גבוה נכשל הרבה יותר מהצפוי, calibration לא טובה.

---

# ‏162. Confidence ≠ Certainty

‏גם confidence גבוה אינו 100%.

---

# ‏163. RCA Severity vs Confidence

‏Failure גדול עם RCA confidence נמוך לא צריך להוביל מיד לשינוי גדול.

---

# ‏164. Bayesian Mindset

‏כל Failure מעדכן את האמונה שלנו במודל מעט.

‏לא מוחק אותה לחלוטין.

---

# ‏165. Avoid Narrative Fallacy

‏לאחר מעשה קל מאוד להמציא סיפור:

> ‏“המניה נכשלה כי היה לחץ מוכרים.”

‏השאלה היא:

> ‏האם יש מדד מוגדר שהיה זמין בזמן אמת וניתן לבדיקה על Population?

---

# ‏166. Observable vs Story

‏נעדיף:

```text
spread widened from 8 to 31 bps
trade_rate fell 65%
rank dropped 1 → 14
```

‏על פני:

```text
market looked weak
```

---

# ‏167. Every RCA Claim Needs Data

‏כל טענה צריכה לכלול Metric או Event שתומך בה.

---

# ‏168. `Five Whys` — בזהירות

‏אפשר להשתמש ב־Five Whys לבעיה תפעולית.

‏לדוגמה:

```text
Why duplicate order?
Why retry sent?
Why acknowledgement considered missing?
Why timeout too short?
Why latency percentile not modeled?
```

‏אבל בשוק אקראי אין תמיד שרשרת סיבתית יחידה.

---

# ‏169. Fishbone / Cause Categories

‏לבעיות מורכבות אפשר לקבץ:

```text
Data
Model
Execution
Infrastructure
Risk
Market Context
Configuration
```

---

# ‏170. Operational RCA Template

‏ל־Bug תפעולי נרצה:

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

---

# ‏171. Strategy RCA Template

‏לכשל Strategy נרצה:

```text
Observation
Population
Expected behavior
Actual behavior
Feature/rank/context analysis
Counterfactuals
Hypothesis
Experiment design
Decision
```

---

# ‏172. Similar-Area Review

‏אם מצאנו Bug ב־entry timestamps, נחפש אותו גם ב־exit timestamps, replay, backtest ו־live ingestion.

---

# ‏173. Fix Class, Not Instance

‏Best Practice:

> ‏אל תתקן רק את האירוע. חפש את משפחת הבעיות.

---

# ‏174. Regression Test from RCA

‏Bug אמיתי צריך בדרך כלל להפוך ל־test case.

---

# ‏175. Golden Failure Case

‏אירוע חשוב יכול להישמר כ־Golden Replay Scenario.

---

# ‏176. RCA Dataset

‏עם הזמן נוכל ליצור Dataset של Failures מתויגים.

‏זה נכס מחקרי חשוב.

---

# ‏177. Failure Library

‏נשמור דוגמאות מייצגות מכל Failure Code.

---

# ‏178. Why This Matters for AI Later

‏אם בעתיד נשתמש ב־ML/AI, Labels איכותיים של Failure Types יכולים לעזור לניתוח.

‏אבל קודם צריך Taxonomy אמין.

---

# ‏179. Do Not Let AI Invent Causes

‏אם כלי AI מנתח RCA, הוא חייב להבדיל בין:

```text
observed facts
computed metrics
hypotheses
```

‏אסור להציג Hypothesis כעובדה.

---

# ‏180. Automated RCA

‏חלק מהחקירה אפשר להפוך לאוטומטי.

‏לדוגמה:

```text
if quote_age_ms > threshold → DATA_STALE
if rank_gap_1_2 < threshold → WEAK_SEPARATION flag
if MFE > target and realized < 0 → EXIT_CAPTURE flag
```

---

# ‏181. Automated RCA אינו Final Verdict

‏Rules כאלה מייצרים Flags.

‏הם לא תמיד מוכיחים Root Cause.

---

# ‏182. RCA Confidence Scoring

‏אפשר בעתיד לתת לכל Cause Candidate ציון Evidence.

‏לדוגמה:

```text
DATA_STALE: 0.95
SIGNAL_LATE: 0.70
EXIT_TOO_LATE: 0.15
```

---

# ‏183. Cause Ranking

‏כאשר יש כמה הסברים אפשריים, נדרג אותם לפי Evidence.

---

# ‏184. Unknown הוא טוב יותר מהמצאה

‏אם אין מספיק Evidence:

```text
root_cause = UNKNOWN
```

‏זו תשובה מקצועית.

---

# ‏185. RCA Coverage

‏נמדוד איזה אחוז מה־Failures מקבלים Cause ברמת confidence סבירה.

---

# ‏186. Too Much UNKNOWN

‏אם כמעט הכול UNKNOWN, חסרה Observability.

---

# ‏187. RCA Drives Observability

‏כל פעם שאי אפשר לענות על שאלה חשובה בגלל שחסר Field, נרשום דרישת Telemetry.

---

# ‏188. Example: Failed Rank #1

‏נניח:

```text
Signal time: 10:32:15.200
XYZ rank: #1
Score: 91
Rank #2 score: 90.8
Spread: 11 bps
Quote age: 40 ms
Rank persistence: 0.4 s
```

‏נשלח Order.

---

# ‏189. Example Timeline

```text
+150 ms  order submitted
+430 ms  fill
+700 ms  activity starts falling
+1.1 s   rank drops to #7
+2.5 s   spread widens to 22 bps
+4.0 s   stop exit
```

---

# ‏190. Example First Observation

‏ה־Data היה טרי.

‏לכן לא נראה שמדובר ב־Data Failure.

---

# ‏191. Example Rank Observation

‏הפער בין #1 ל־#2 היה זעיר:

```text
0.2 score points
```

‏ו־Rank persistence הייתה רק 0.4s.

---

# ‏192. Example Hypothesis

```text
Hypothesis:
Very fresh #1 candidates with tiny separation gap have weak continuation.
```

---

# ‏193. Example Experiment

‏נבדוק Population שלם לפי:

```text
rank_persistence buckets
× separation_gap buckets
```

‏ונמדוד:

```text
5s/10s forward return
Net EV
MFE/MAE
trade count
missed winners
```

---

# ‏194. Example Decision

‏אם התופעה חוזרת Out-of-Sample, ייתכן שנוסיף:

```text
minimum persistence
```

‏או interaction בתוך Score.

‏אם לא — `NO_ACTION`.

---

# ‏195. Example: Prediction Good, Execution Bad

```text
signal mid = 50.00
future mid +5s = 50.10
fill = 50.08
exit = 50.09
```

‏Prediction הייתה טובה.

‏Execution כמעט אכלה את כל התנועה.

---

# ‏196. Example Root Cause

```text
Primary: ENTRY_SLIPPAGE
Contributing: SIGNAL_LATE
```

‏לא `BAD_SCORE`.

---

# ‏197. Example: Gross Winner, Net Loser

```text
Gross move = +8 bps
Round-trip friction = 11 bps
Net = -3 bps
```

‏Root Cause אפשרי:

```text
COST_ERASED_EDGE
```

---

# ‏198. Example: Good Candidate, Bad Exit

```text
MFE = +22 bps
Realized = -2 bps
```

‏כאן נחקור Exit לפני שנשנה Scanner.

---

# ‏199. Example: Random Loss

```text
Data good
Signal strong
Rank separation good
Execution good
Costs normal
Exit followed policy
```

‏והמחיר פשוט התהפך.

‏ייתכן:

```text
EXPECTED_VARIANCE
```

---

# ‏200. Checklist — Data

- ‏האם Trade/Quote היו טריים?
- ‏האם היו Sequence Gaps?
- ‏האם Feed היה מחובר ובריא?
- ‏האם timestamps מסונכרנים?
- ‏האם היו Duplicate/Out-of-order events?

---

# ‏201. Checklist — Filters

- ‏האם Candidate עבר כל Filter כמתוכנן?
- ‏האם Null טופל נכון?
- ‏האם threshold היה versioned?
- ‏האם Candidate היה Tradable?

---

# ‏202. Checklist — Features

- ‏אילו Features דחפו את ה־Score?
- ‏האם היו stale?
- ‏האם הם דעכו לפני Fill?
- ‏האם Feature קיצוני נמצא באזור exhaustion?

---

# ‏203. Checklist — Ranking

- ‏מה היה Gap מול #2/#5?
- ‏כמה זמן Candidate היה Top-ranked?
- ‏האם Rank היה יציב?
- ‏מה עשו #2/#3 אחר כך?

---

# ‏204. Checklist — Regime

- ‏מה היה Regime בזמן Signal?
- ‏האם הוא השתנה לפני Fill?
- ‏האם Failure Type מרוכז באותו Regime?

---

# ‏205. Checklist — Entry

- ‏מה היה Signal Age?
- ‏מה היה Entry Slippage?
- ‏כמה זמן לקח Fill?
- ‏האם היה Partial Fill?
- ‏האם רדפנו אחרי המחיר?

---

# ‏206. Checklist — Exit

- ‏למה יצאנו?
- ‏מה היו MFE/MAE?
- ‏כמה רווח הוחזר?
- ‏האם Time Stop היה מתאים?
- ‏מה היה `time_to_flat`?

---

# ‏207. Checklist — Costs

- ‏מה הייתה העלות הכוללת?
- ‏כמה מה־Gross Edge היא אכלה?
- ‏האם התעריפים היו נכונים?
- ‏האם Spread התרחב?

---

# ‏208. Checklist — Risk

- ‏האם הכמות הייתה מתאימה לנזילות?
- ‏האם Position Size הגדיל Slippage?
- ‏האם הייתה חשיפה נוספת?

---

# ‏209. Checklist — Randomness

- ‏האם כל השאר נראה תקין?
- ‏האם Failure Rate דומה לצפוי ב־bucket הזה?
- ‏האם יש Pattern חוזר?

---

# ‏210. `RCA Report` מינימלי

‏כל Report צריך להכיל:

```text
Event ID
Strategy version
Outcome
Primary cause
Contributing causes
Confidence
Evidence
Counterfactual result
Population evidence
Action
Experiment ID
```

---

# ‏211. Action Categories

```text
NO_ACTION
OBSERVE
COLLECT_MORE_DATA
BUG_FIX
ADD_TELEMETRY
RUN_EXPERIMENT
ROLLBACK_VERSION
TIGHTEN_SAFETY
```

---

# ‏212. Severity × Confidence Matrix

‏אירוע:

```text
High severity + high confidence operational bug
```

‏דורש תגובה מהירה.

‏לעומת:

```text
Low severity + low confidence strategy anomaly
```

‏יכול להיכנס למעקב.

---

# ‏213. RCA Priority Score

‏אפשר לתעדף לפי:

```text
frequency × severity × confidence × preventability
```

‏לא חייבים נוסחה מסובכת; העיקר סדר עבודה עקבי.

---

# ‏214. Preventability

‏שאלה חשובה:

> ‏האם יכולנו למנוע את הכשל עם מידע שהיה זמין בזמן אמת?

‏אם לא, אסור “לתקן” אותו באמצעות ידע בדיעבד.

---

# ‏215. Hindsight Bias

‏אחרי שראינו את העתיד, כמעט כל Failure נראה ברור.

‏לכן כל Proposed Fix צריך לעבור בדיקה:

> ‏האם הכלל היה ניתן לחישוב לפני התוצאה?

---

# ‏216. No Future Information in RCA Fixes

‏זה כלל קשיח.

---

# ‏217. RCA and Overfitting

‏RCA עצמו יכול להפוך למנוע Overfitting אם כל Failure מייצר Rule חדש.

---

# ‏218. Rule Explosion

‏נזהר ממצב:

```text
if A and B and C → reject
if D and E → reject
if F at 10:32 → reject
```

‏זה `Patchwork Strategy`.

---

# ‏219. Prefer General Explanations

‏עדיף למצוא כלל רחב ומדיד מאשר Exception לכל Trade.

---

# ‏220. Simplicity Penalty

‏Hypothesis שמוסיפה מורכבות צריכה להצדיק אותה באמצעות Improvement ברור.

---

# ‏221. RCA → Experiment, not RCA → Production

‏זו אחת השורות החשובות בפרק.

```text
RCA
→ Hypothesis
→ Controlled Experiment
→ Validation
→ Promotion
```

‏לא:

```text
RCA
→ Immediate tweak
```

---

# ‏222. RCA Backlog

‏נשמור Hypotheses שלא נבדקו עדיין.

‏כך לא משנים מערכת מתוך לחץ רגעי.

---

# ‏223. Cluster Before Prioritize

‏אם 30 Failures שייכים לאותו Cluster, נחקור אותם יחד.

---

# ‏224. High-frequency Small Failure

‏בעיה קטנה שחוזרת אלפי פעמים יכולה להיות חשובה יותר מ־Loss נדיר וגדול.

---

# ‏225. Tail Failure

‏אבל Failure נדיר בעל Tail Risk גבוה דורש שכבת Safety גם אם אינו משפיע הרבה על Average EV.

---

# ‏226. Profitability vs Safety

‏RCA צריך למדוד שניהם.

‏לא כל Safety Rule נועד למקסם Average Return.

---

# ‏227. RCA and Kill Switches

‏Operational Failure חמור יכול ליצור Trigger חדש ל־Kill Switch.

‏את התכנון המלא נלמד בהמשך הקורס.

---

# ‏228. RCA and Monitoring

‏כל Failure Class חשוב צריך Metric/Alert מתאים כאשר אפשר.

---

# ‏229. RCA and Versioning

‏כל RCA חייב לדעת:

```text
strategy_version
feature_version
score_version
filter_version
execution_version
cost_model_version
```

---

# ‏230. Configuration Is Code

‏Threshold ששונה בקובץ Config יכול לשנות התנהגות כמו שינוי קוד.

‏לכן גם Config צריך Versioning.

---

# ‏231. Reproducibility Test

‏צריך להיות אפשר להריץ את Event שוב ולקבל:

```text
same features
same score
same rank
same decision
```

‏בהינתן אותם Inputs ואותה גרסה.

---

# ‏232. If Not Reproducible

‏קודם מתקנים Reproducibility.

‏אין טעם לנתח Model Quality על מערכת לא־דטרמיניסטית בלי להבין למה.

---

# ‏233. Data Retention for RCA

‏נשמור מספיק Raw/Normalized events כדי לשחזר Decisions משמעותיים.

---

# ‏234. Storage Trade-Off

‏לא תמיד צריך לשמור כל Byte לנצח.

‏אפשר להשתמש ב־tiers:

```text
full high-resolution recent data
compressed historical data
selected RCA windows permanently
```

---

# ‏235. RCA Windows as Research Assets

‏חלונות Failure/Success מייצגים יכולים להפוך ל־Regression Suite של האסטרטגיה.

---

# ‏236. Human-readable Summary

‏מעבר ל־JSON/DB, רצוי Summary קצר:

```text
What happened?
Why do we think it happened?
What evidence supports that?
What are we going to test?
```

---

# ‏237. Machine-readable RCA

‏במקביל נשמור Fields מובנים כדי לנתח אלפי אירועים.

---

# ‏238. Do Not Confuse Explanation with Prediction

‏אפשר להסביר Trade היטב בדיעבד ועדיין לא להיות מסוגלים לחזות אותו מראש.

‏זה הבדל קריטי.

---

# ‏239. Test Predictive Availability

‏לכל Feature שה־RCA מציע נוסיף שאלה:

> ‏האם היה זמין בזמן Signal?

---

# ‏240. Test Economic Value

‏גם אם Feature מנבא Failure, נבדוק האם שימוש בו משפר Net EV אחרי Missed Opportunities.

---

# ‏241. Test Operational Cost

‏Feature חדש יכול להיות יקר לחישוב או להוסיף Latency.

‏גם זו עלות.

---

# ‏242. Fast RCA for Live Operations

‏בלייב נרצה מסלול מהיר:

```text
Was data healthy?
Was broker state healthy?
Was risk state healthy?
Was order behavior expected?
```

‏אם לא — זו קודם בעיה תפעולית.

---

# ‏243. Deep RCA for Research

‏לאחר מכן אפשר לחקור Prediction/Ranking/Regime לעומק.

---

# ‏244. Daily RCA Review

‏אפשר לסכם כל יום:

```text
Top losses
Top missed opportunities
Largest execution shortfalls
Unexpected failure clusters
Operational anomalies
```

---

# ‏245. Weekly RCA Review

‏ברמה שבועית נחפש Patterns חוזרים ולא רק אירועים בודדים.

---

# ‏246. Monthly Model Review

‏נבחן האם Failure Mix משתנה לאורך זמן.

---

# ‏247. RCA Metrics

‏דוגמאות:

```text
failure_count
failure_rate
failure_rate_by_cause
loss_by_cause
unknown_cause_rate
repeat_failure_rate
prevented_failure_rate
```

---

# ‏248. Repeat Failure Rate

‏אם תיקנו בעיה והיא ממשיכה להופיע, צריך להבין אם:

```text
fix incomplete
wrong root cause
regression
monitoring wrong
```

---

# ‏249. `RCA Effectiveness`

‏נמדוד האם פעולות שנולדו מ־RCA באמת שיפרו Population עתידי.

---

# ‏250. Closing the Loop

‏המחזור הנכון:

```text
Failure
→ Capture
→ Classify
→ Investigate
→ Hypothesis
→ Experiment
→ Validate
→ Deploy or Reject
→ Monitor
→ Measure recurrence
```

---

# ‏251. רז מקצוע — אל תעניש את המודל על מזל רע

‏אם Failure הוא Variance צפויה, שינוי המודל יכול דווקא להרוס Edge אמיתי.

---

# ‏252. רז מקצוע — אל תתגמל את המודל על מזל טוב

‏Trade מרוויח אינו פוטר אותנו מבדיקת Execution, Data ו־Signal validity.

---

# ‏253. רז מקצוע — הכישלונות היקרים ביותר הם לפעמים אלה שלא רואים ב־PnL

‏לדוגמה:

- ‏Order duplicate שבמקרה בוטל בזמן.
- ‏Feed stale שבמקרה לא הוביל ל־Trade.
- ‏Position mismatch שתוקן לפני נזק.

‏אלה Near Misses.

---

# ‏254. רז מקצוע — מערכת טובה מסבירה את עצמה

‏אם אחרי Trade איננו יודעים:

```text
why selected
why traded
why filled
why exited
```

‏חסרה Observability.

---

# ‏255. רז מקצוע — השאלה הנכונה אינה “למה הפסדנו?”

‏אלא:

> ‏“האם ההפסד הזה היה צפוי כחלק מההתפלגות, או שהוא חושף שגיאה שיטתית שניתן למדוד ולמנוע?”

---

# ‏256. התאמה ישירה לרובוט שלך

‏לרובוט שמחזיק שניות עד דקה, סדר הבדיקה המומלץ הוא:

```text
1. Data fresh?
2. Candidate still #1 / near #1 at submit?
3. Score still strong?
4. Spread/depth still acceptable?
5. Signal decayed before fill?
6. Entry slippage?
7. Did positive move appear quickly?
8. MFE / MAE?
9. Was exit aligned with thesis?
10. Did costs erase gross edge?
11. What did #2/#3 do?
12. Is this pattern repeated?
```

---

# ‏257. Failure Categories שמתאימות במיוחד לאסטרטגיה שלך

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

---

# ‏258. השאלה החשובה: האם המניה “לא עלתה מספיק מהר”?

‏מכיוון שה־Thesis שלך קצר, נמדוד מפורשות:

```text
time_to_first_positive_net_mark
 time_to_5bps
 time_to_10bps
 time_to_target
```

‏הספים עצמם ייקבעו במחקר, לא באינטואיציה.

---

# ‏259. `Failure by Time-to-Profit`

‏אם Winners כמעט תמיד מתחילים לזוז תוך 2–3 שניות ו־Failures נשארים Flat, זה יכול להפוך ל־Exit/Decision Hypothesis.

---

# ‏260. `Failure by Momentum Shape`

‏נבדוק האם כישלונות מאופיינים ב:

```text
burst → plateau
burst → reversal
steady climb → continuation
```

---

# ‏261. `Failure by Activity Shape`

‏נבדוק:

```text
activity increasing
activity flat
activity collapsing
```

‏סביב Signal ו־Fill.

---

# ‏262. `Failure by Liquidity Shape`

‏נבדוק:

```text
spread stable
spread widening
depth disappearing
```

---

# ‏263. Joint Failure Analysis

‏ה־Edge יכול להיות ב־combination:

```text
momentum weakening
+ activity fading
+ spread widening
```

‏ולא באף Feature לבדו.

---

# ‏264. But Beware Interaction Explosion

‏לא נבדוק אלפי שילובים בלי משמעת מחקרית.

‏אחרת נחזור ל־Overfitting.

---

# ‏265. RCA Hypothesis Queue

‏כל Hypothesis תיכנס לתור עם:

```text
priority
evidence_count
expected impact
complexity
experiment cost
```

---

# ‏266. Highest-Value RCA First

‏נעדיף Hypothesis שיכולה:

- ‏להסביר הרבה Failures.
- ‏להקטין Loss משמעותי.
- ‏להיות נבדקת בצורה פשוטה.
- ‏לא להוסיף מורכבות רבה.

---

# ‏267. `No Magic Fix`

‏אין Feature אחד שימנע כל Rank #1 כושל.

‏המטרה היא לשפר את ההתפלגות, לא ליצור ודאות.

---

# ‏268. Baseline RCA Workflow לרובוט

```text
Trade closes
→ build immutable RCA packet
→ run automatic health checks
→ calculate forward path and counterfactual Top-N
→ assign candidate failure flags
→ cluster with historical failures
→ human/research review when warranted
→ create hypothesis only if pattern exists
→ run controlled experiment
→ validate out of sample
```

---

# ‏269. מה לא עושים

‏לא עושים:

```text
loss
→ inspect chart
→ invent story
→ add rule
```

---

# ‏270. מה כן עושים

```text
loss
→ reconstruct facts
→ classify
→ compare population
→ build falsifiable hypothesis
→ experiment
→ validate
```

---

# ‏271. Minimum RCA Fields שאנחנו רוצים במערכת

```text
trade_id
symbol
strategy_version
signal_time
submit_time
first_fill_time
full_fill_time
exit_time
rank_at_signal
rank_at_submit
rank_at_fill
score_at_signal
score_at_submit
score_at_fill
rank_gap
rank_persistence
feature_snapshot
regime_snapshot
spread_at_signal
spread_at_fill
entry_slippage
exit_slippage
MFE
MAE
time_to_first_profit
time_to_target
gross_pnl
net_pnl
exit_reason
primary_failure_code
contributing_failure_codes
rca_confidence
```

---

# ‏272. Minimum Counterfactual Fields

```text
rank2_outcome
rank3_outcome
best_top5_outcome
no_trade_outcome
alternative_entry_outcomes
alternative_exit_outcomes
```

---

# ‏273. Minimum Population Views

```text
by score bucket
by rank gap
by persistence
by time of day
by regime
by spread
by activity
by latency
by strategy version
```

---

# ‏274. תנאי מעבר מ־RCA למחקר

‏נמשיך ל־Experiment רק כאשר:

- ‏יש Pattern חוזר או Severity גבוהה.
- ‏יש Evidence מדיד.
- ‏ה־Hypothesis ניתנת לחישוב בזמן אמת.
- ‏אפשר להגדיר Counterfactual.
- ‏יש מספיק Data לבדיקה הוגנת.

---

# ‏275. תנאי מעבר ממחקר לשינוי Production

- ‏השינוי משפר Metric ראשי.
- ‏הוא שורד Out-of-Sample.
- ‏הוא לא פוגע Guardrails באופן לא סביר.
- ‏הוא נשאר חיובי אחרי Costs/Execution.
- ‏המורכבות הנוספת מוצדקת.
- ‏יש Rollback ו־Monitoring.

---

# ‏276. מתי לא לעשות שום דבר

‏כאשר:

- ‏אין Pattern.
- ‏האירוע תואם Failure Rate צפוי.
- ‏Evidence חלשה.
- ‏השינוי המוצע משתמש ב־future information.
- ‏Counterfactual מראה שה־Fix מזיק יותר ממה שהוא עוזר.

---

# ‏277. תרגיל מסכם

‏קח 100 אירועי Rank #1 שנכשלו ו־100 שהצליחו.

‏לכל אחד שמור את אותו RCA Packet.

‏לאחר מכן:

1. ‏תייג Failure Codes.
2. ‏קבץ לפי Regime.
3. ‏קבץ לפי Rank Gap.
4. ‏קבץ לפי Persistence.
5. ‏קבץ לפי Latency.
6. ‏קבץ לפי Spread.
7. ‏השווה Top-1 מול #2/#3.
8. ‏בדוק MFE/MAE ו־time-to-profit.
9. ‏מצא 3 Clusters חוזרים בלבד.
10. ‏הפוך כל Cluster ל־Hypothesis ניתנת להפרכה.

---

# ‏278. מבחן עצמי

‏לפני שממשיכים, צריך להיות מסוגל לענות:

1. ‏למה Trade כושל אינו בהכרח Strategy Failure?
2. ‏איך מבדילים Prediction Failure מ־Execution Failure?
3. ‏למה צריך לשמור Top-N ולא רק #1?
4. ‏מהו `Selection Regret`?
5. ‏למה MFE גבוה עם PnL שלילי יכול להצביע על Exit Problem?
6. ‏למה אסור ליצור Rule חדש מכל הפסד?
7. ‏מה ההבדל בין Evidence, Hypothesis ו־Conclusion?
8. ‏למה `UNKNOWN` או `EXPECTED_VARIANCE` הן תוצאות RCA לגיטימיות?
9. ‏איך RCA צריך להפוך לניסוי מבוקר?
10. ‏מהו RCA Packet מינימלי?

---

# ‏279. מה למדנו

‏`RCA` מקצועי אינו חיפוש אחר סיפור משכנע.

‏הוא תהליך שמפריד בין:

```text
Data
Prediction
Ranking
Context
Execution
Exit
Costs
Risk
Randomness
```

‏ומחייב Evidence לפני שינוי.

---

# ‏280. העיקרון לקחת הלאה

> ‏**כישלון טוב למחקר הוא לא כישלון שאנחנו יכולים להסביר בדיעבד; הוא כישלון שממנו אפשר להפיק Hypothesis שניתנת למדידה, להפרכה ולבדיקה על אוכלוסייה חדשה.**

---

# ‏281. מעבר לשלב הבא

‏אחרי שלמדנו לבנות Strategy, Backtest, Validation ו־RCA, אפשר לעבור משלב המחקר אל שכבת ההפעלה.

‏בשלב הבא נלמד `Replay`: איך לשחזר יום מסחר Event-by-Event ולהריץ עליו שוב את אותו Scanner בצורה דטרמיניסטית — גשר קריטי בין Backtest לבין Live.