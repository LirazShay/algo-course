# ‏שלב 15 — בחירת `Top Candidate` והחלטת `Trade / No Trade`

> ‏מטרת הפרק: להבין את השלב שבו הסורק כבר דירג את כל השוק, אבל עדיין לא שלחנו שום פקודה. נלמד איך לבחור מועמדת מובילה, איך להחליט אם היא באמת טובה מספיק לעסקה, ומתי התשובה הנכונה היא `NO TRADE`.
>
> ‏העיקרון המרכזי: **המניה במקום #1 היא רק הטובה ביותר מבין מה שיש כרגע. זה לא אומר שהיא טובה מספיק.**

---

# ‏1. `Ranking` אינו `Decision`

‏בשלב 14 בנינו מנגנון שמסוגל לומר:

```text
#1 AAA  Score 91
#2 BBB  Score 88
#3 CCC  Score 77
```

‏זהו `Ranking`.

‏אבל עכשיו מגיעה שאלה אחרת לגמרי:

> ‏האם בכלל כדאי לבצע עסקה ב־`AAA`?

‏יכול להיות שהמניה הטובה ביותר בשוק כרגע עדיין גרועה למסחר.

‏לכן מפרידים:

```text
Ranking Engine
      ↓
Top Candidate
      ↓
Trade Decision Engine
      ↓
TRADE / NO TRADE
```

---

# ‏2. למה `Top 1` עלול להיות מועמד גרוע

‏נניח שכל השוק חלש.

```text
AAA = 52
BBB = 50
CCC = 47
```

‏`AAA` במקום הראשון.

‏אבל אולי בדרך כלל אנחנו צריכים איכות של לפחות:

```text
75+
```

‏לכן:

```text
AAA is best
```

‏אינו שקול ל־:

```text
AAA is good
```

---

# ‏3. שתי שאלות שחייבים לשאול

‏בכל Decision Cycle יש שתי שאלות נפרדות:

## ‏שאלה 1 — מי הכי טובה יחסית לאחרות?

‏זו שאלה `Relative`.

## ‏שאלה 2 — האם היא טובה מספיק באופן מוחלט?

‏זו שאלה `Absolute`.

‏עסקה יכולה להתבצע רק כאשר התשובה לשתיהן מספקת.

---

# ‏4. `Absolute Quality Threshold`

‏זהו סף איכות מינימלי.

‏לדוגמה:

```text
if top_score < 75:
    NO TRADE
```

‏המספר 75 הוא רק דוגמה.

‏אסור לבחור אותו לפי תחושת בטן.

‏צריך ללמוד אותו מהנתונים.

---

# ‏5. למה Threshold קבוע יכול להיות בעייתי

‏נניח שה־Score מתפלג אחרת בשעות שונות.

‏בפתיחת המסחר:

```text
Top Scores frequently 90–100
```

‏באמצע יום שקט:

```text
Top Scores frequently 60–75
```

‏Threshold קבוע יכול להיות:

- ‏קל מדי במצב אחד.
- ‏קשוח מדי במצב אחר.

‏לכן בהמשך נבדוק גם:

`Dynamic Thresholds`

‏אבל מתחילים פשוט.

---

# ‏6. `Separation Margin`

‏לא מספיק לבדוק את המקום הראשון.

‏נבדוק גם כמה הוא טוב מהמקום השני.

‏לדוגמה:

```text
AAA = 92
BBB = 91.8
```

‏לעומת:

```text
AAA = 92
BBB = 78
```

‏בשני המקרים `AAA` במקום הראשון.

‏אבל במקרה השני היא הרבה יותר חריגה ביחס לשוק.

---

# ‏7. נוסחה פשוטה ל־Separation

```text
separation = top1_score - top2_score
```

‏אפשר גם לחשב:

```text
Top1 - Top5 average
Top1 - market median
Top1 percentile distance
```

‏הרעיון:

> ‏כמה באמת ייחודית המועמדת הראשונה?

---

# ‏8. למה `Separation` יכול להיות שימושי אצלך

‏אם שתי מניות כמעט זהות בציון, בחירה אגרסיבית במקום הראשון יכולה להיות שרירותית.

‏אבל אם מניה אחת בולטת מאוד מעל כולן, יכול להיות שזה מצב שונה סטטיסטית.

‏לא מניחים שזה נכון.

‏בודקים:

```text
Does larger separation predict better forward outcome?
```

---

# ‏9. `Rank Stability`

‏נניח:

```text
12:00:00 AAA #1
12:00:01 BBB #1
12:00:02 CCC #1
12:00:03 AAA #1
```

‏המקום הראשון מתחלף כל שנייה.

‏זה נקרא:

`Rank Churn`

‏ייתכן שהשוק פשוט רועש.

---

# ‏10. `Persistence`

‏אפשר למדוד כמה זמן מועמדת נשארה חזקה.

```text
rank_1_duration_ms
rank_top3_duration_ms
score_above_threshold_duration_ms
```

‏זה נקרא בקירוב:

`Persistence`

‏אבל חשוב:

> ‏אישור ממושך יותר מפחית רעש — ובאותו זמן מוסיף איחור.

‏זו פשרה מרכזית.

---

# ‏11. Confirmation מול Latency

‏נניח שאנחנו דורשים מהמניה להיות #1 במשך חמש שניות לפני כניסה.

‏זה עשוי להפחית False Signals.

‏אבל אם רוב ה־Edge קיים רק בשלוש השניות הראשונות, הרגנו את ההזדמנות.

‏לכן אי אפשר לומר:

```text
more confirmation = always better
```

‏הכל צריך להיבדק מול `Forward Returns` ו־`Net PnL`.

---

# ‏12. `Candidate Age`

‏אנחנו צריכים לדעת לא רק מיהי המועמדת, אלא גם בת כמה ההזדמנות.

```text
candidate_first_seen_time
candidate_age_ms
```

‏מניה שקיבלה Score גבוה לראשונה לפני 300ms שונה ממניה שנמצאת באותו מצב כבר 25 שניות.

---

# ‏13. `Signal TTL`

‏`TTL` = Time To Live.

‏אנחנו יכולים לומר:

> ‏החלטת מסחר תקפה רק לזמן קצר.

‏לדוגמה:

```text
signal_ttl = 1500 ms
```

‏אם עבר יותר מזה לפני שליחת Order:

```text
recalculate / reject
```

‏המספר צריך להגיע ממחקר, לא מהשערה.

---

# ‏14. `Freshness Gate`

‏גם אם ה־Score גבוה מאוד:

```text
Score = 97
```

‏אם ה־Quote בן ארבע שניות באסטרטגיה של שניות:

```text
NO TRADE
```

‏לכן צריך לבדוק:

```text
trade_age
quote_age
feature_age
score_age
```

---

# ‏15. `Data Confidence`

‏אפשר שהמניה מצוינת אבל הנתונים שלה חלקיים.

‏לדוגמה:

```text
momentum OK
activity OK
bid missing
ask stale
```

‏במצב כזה לא נכון להתייחס אליה כמו מועמדת מלאה.

‏אפשר להגדיר:

```text
DataQualityState = GOOD / DEGRADED / INVALID
```

‏ורק `GOOD` מורשה למסחר חי.

---

# ‏16. `Execution Readiness`

‏המניה יכולה להיות חזקה מבחינת Signal אבל בלתי־מתאימה לביצוע.

‏לכן לפני `TRADE` בודקים שוב:

```text
spread
bid/ask freshness
depth
estimated slippage
expected fill probability
order size vs available liquidity
```

‏זה לא אותו דבר כמו Prediction.

---

# ‏17. Prediction מול Execution

‏נניח:

```text
AAA Prediction = excellent
AAA Spread     = terrible
```

‏ו־:

```text
BBB Prediction = very good
BBB Spread     = excellent
```

‏יכול להיות ש־`BBB` היא העסקה הטובה יותר נטו.

‏לכן החלטה אמיתית אינה:

```text
highest prediction score
```

‏אלא משהו קרוב יותר ל־:

```text
best executable expected opportunity
```

---

# ‏18. `Expected Gross Edge`

‏זהו הרווח הצפוי לפני עלויות.

‏לדוגמה:

```text
Expected future move = +0.12%
```

‏אבל זה עדיין לא מספיק.

---

# ‏19. `Expected Net Edge`

‏המודל הנכון יותר הוא:

```text
Expected Net Edge
= Expected Gross Edge
- Spread Cost
- Slippage
- Commission
- Fees
- Expected execution penalty
```

‏רק ה־Net מעניין אותנו כלכלית.

---

# ‏20. דוגמה פשוטה

```text
Expected Gross Move = +0.10%
Expected Costs      = 0.07%
Expected Net Edge   = +0.03%
```

‏לעומת:

```text
Expected Gross Move = +0.20%
Expected Costs      = 0.25%
Expected Net Edge   = -0.05%
```

‏המניה השנייה נראית “חזקה” יותר.

‏אבל היא עסקה גרועה יותר.

---

# ‏21. `Opportunity Threshold`

‏אפשר להגדיר:

```text
if expected_net_edge < minimum_required_edge:
    NO TRADE
```

‏ה־minimum required edge צריך לכלול מרווח ביטחון.

‏לא כדאי לבצע עסקה כאשר התחזית בקושי מכסה את העלויות.

---

# ‏22. `Margin of Safety`

‏אם המודל מעריך:

```text
Expected Edge = +0.011%
```

‏והעלות המשוערת היא:

```text
0.010%
```

‏זה אולי חיובי מתמטית.

‏אבל טעות קטנה באומדן הופכת אותו לשלילי.

‏לכן נרצה Buffer.

```text
Expected Edge must exceed costs by a meaningful margin
```

---

# ‏23. למה חשוב במיוחד אצלך

‏כאשר המטרה היא רווח קטן מאוד לעסקה, כל טעות זעירה חשובה:

- ‏סנט נוסף ב־Spread.
- ‏50ms של איחור.
- ‏Partial Fill.
- ‏שינוי Quote.
- ‏Commission.
- ‏Slippage.

‏לכן Decision Engine למסחר של שניות צריך להיות הרבה יותר Cost-Aware ממערכת שמחזיקה עסקה ימים.

---

# ‏24. `Trade / No Trade` הוא Classifier נוסף

‏אפשר לחשוב על המערכת כך:

```text
Scanner finds best candidate
        ↓
Decision Engine asks:
"Is this opportunity worth trading?"
        ↓
YES / NO
```

‏כלומר Ranking ו־Decision הם שני מודלים לוגיים שונים, גם אם בתחילת הדרך שניהם מבוססים על Rules פשוטים.

---

# ‏25. `Abstention`

‏ב־Machine Learning קיים רעיון חשוב:

`Abstention`

‏כלומר המודל רשאי לומר:

> ‏אני לא מספיק בטוח כדי לקבל החלטה.

‏במסחר:

```text
NO TRADE
```

‏הוא המקבילה הטבעית.

---

# ‏26. רובוט לא חייב לסחור כל Cycle

‏אם אנחנו סורקים כל שנייה:

```text
23,400 cycles in a 6.5-hour regular session
```

‏זה לא אומר שצריכות להיות 23,400 עסקאות.

‏הסורק שואל כל פעם:

> ‏האם קיימת עכשיו הזדמנות טובה מספיק?

‏ברוב המחזורים התשובה יכולה להיות:

```text
NO TRADE
```

‏וזה תקין לחלוטין.

---

# ‏27. `No Trade Rate`

‏צריך למדוד גם כמה פעמים המערכת מסרבת לסחור.

```text
trade_decisions
no_trade_decisions
no_trade_rate
```

‏אם היא סוחרת כמעט תמיד, ייתכן שהThreshold נמוך מדי.

‏אם היא כמעט אף פעם לא סוחרת, אולי הוא גבוה מדי.

‏אבל אין יעד “נכון” מראש.

‏המדד החשוב הוא ביצועים נטו.

---

# ‏28. Quality מול Frequency

‏יש Trade-off טבעי:

```text
higher threshold
→ fewer trades
→ potentially higher average quality
```

‏לעומת:

```text
lower threshold
→ more trades
→ potentially lower average quality
```

‏לכן לא מנסים למקסם מספר עסקאות.

‏מנסים למקסם תוצאה נטו יציבה ביחס לסיכון.

---

# ‏29. אל תכריח את המערכת “להעסיק את הכסף”

‏רעיון מסוכן הוא:

> ‏הכסף חייב להיות תמיד בתוך מניה כלשהי.

‏אם אין הזדמנות עם Edge מספק, Cash הוא State תקין.

‏החזקת מזומן יכולה להיות החלטה טובה יותר מעסקה שלילית.

---

# ‏30. `Top N` לפני Top 1

‏לפעמים כדאי שהשלב הראשון יחזיר:

```text
Top 5 Candidates
```

‏ורק Decision Engine יבחר אחת מהן.

‏למה?

‏כי המועמדת #1 מבחינת Prediction יכולה להיכשל ב־Execution Gate.

‏אז אפשר לבדוק #2.

---

# ‏31. האם עוברים אוטומטית ל־#2?

‏לא בהכרח.

‏אם #1 נפסלה בגלל:

```text
bad spread
```

‏אפשר לבדוק #2.

‏אבל אם #1 נפסלה בגלל:

```text
market data degraded globally
```

‏כנראה צריך:

```text
NO TRADE
```

‏לכן צריך לסווג Rejection Reason.

---

# ‏32. `Candidate Ladder`

‏מבנה אפשרי:

```text
#1 AAA → fails execution gate
#2 BBB → passes
#3 CCC
#4 DDD
#5 EEE
```

‏ואז `BBB` יכולה להפוך ל־Selected Candidate.

‏אבל חשוב לשמור:

```text
scanner_rank = 2
selected_rank = 2
why_rank_1_rejected = SPREAD_TOO_WIDE
```

---

# ‏33. `Selection Reason`

‏כל Trade צריך להיות ניתן להסבר.

‏לכן נשמור למשל:

```text
selected_symbol
selected_rank
score
score_components
separation
candidate_age
expected_edge
expected_cost
expected_net_edge
selection_reasons
```

---

# ‏34. `No Trade Reason`

‏גם החלטה לא לסחור צריכה להיות מוסברת.

‏לדוגמה:

```text
NO_CANDIDATE_ABOVE_THRESHOLD
INSUFFICIENT_SEPARATION
DATA_STALE
SPREAD_TOO_WIDE
LOW_EXPECTED_NET_EDGE
MARKET_HALTED
BROKER_NOT_READY
RISK_LIMIT_REACHED
```

‏זה קריטי ל־RCA.

---

# ‏35. `Decision Snapshot`

‏בכל החלטה נשמור Snapshot של המצב.

```text
decision_time
universe_version
feature_version
score_version
filter_version
market_data_source
ranked_candidates
selected_candidate
trade_decision
reason
```

‏כך אפשר לשחזר בדיוק מה קרה.

---

# ‏36. למה זה חשוב לשיפור האלגוריתם

‏נניח בחרנו `AAA` והיא לא עלתה.

‏בלי Snapshot אנחנו יכולים רק לנחש.

‏עם Snapshot אפשר לשאול:

- ‏האם Score היה גבוה בגלל Feature אחד חריג?
- ‏האם #2 דווקא הצליחה?
- ‏האם Separation היה נמוך?
- ‏האם Signal כבר היה זקן?
- ‏האם Spread התרחב?
- ‏האם Rank התחלף מיד?
- ‏האם כל השוק התהפך?

‏זה הופך הפסד לחומר מחקר.

---

# ‏37. `Decision Time` מול `Order Time`

‏צריך לשמור לפחות:

```text
signal_time
decision_time
order_submit_time
broker_ack_time
fill_time
```

‏כי Candidate טובה בזמן `decision_time` יכולה כבר להיות גרועה בזמן `order_submit_time`.

---

# ‏38. `Pre-Trade Recheck`

‏לפני שליחת הפקודה בפועל, עושים בדיקה אחרונה.

```text
Is candidate still valid?
Is quote still fresh?
Is spread still acceptable?
Is score still above threshold?
Did ranking collapse?
Is broker ready?
Is risk state valid?
```

‏אם לא:

```text
ABORT
```

---

# ‏39. למה Recheck חשוב במיוחד במסחר מהיר

‏בין:

```text
Signal
```

‏לבין:

```text
Order Submit
```

‏יכולות לעבור מאות מילישניות או יותר.

‏במניה מהירה זה מספיק כדי לשנות את כל התמונה.

---

# ‏40. `Decision Latency Budget`

‏אפשר להגדיר Budget רעיוני:

```text
market event
→ feature update
→ ranking
→ decision
→ execution recheck
→ order submit
```

‏כל שלב צורך זמן.

‏אם הזמן הכולל ארוך מחיי ה־Signal:

> ‏אין לנו Edge בר־ביצוע, גם אם ה־Prediction מצוין.

---

# ‏41. `Score Drop` בזמן ההחלטה

‏נניח:

```text
T0      Score = 94
T+300ms Score = 89
T+700ms Score = 74
```

‏ייתכן שההזדמנות מתפרקת.

‏לכן אפשר למדוד:

```text
score_velocity
score_decay
rank_decay
```

‏ולבדוק אם הם עוזרים להחליט.

---

# ‏42. `Score Rising` לפני כניסה

‏המצב ההפוך:

```text
82 → 87 → 93
```

‏יכול להיות מעניין.

‏אבל שוב:

> ‏לא מניחים ש־rising score טוב יותר. מודדים.

---

# ‏43. `Decision Confidence`

‏המילה Confidence מסוכנת אם משתמשים בה בצורה רופפת.

‏Score גבוה אינו בהכרח Probability.

‏אפשר לבנות Confidence מתוך כמה מרכיבים:

```text
absolute quality
separation
stability
data quality
execution quality
model calibration
```

‏אבל צריך להגדיר במפורש מה המספר אומר.

---

# ‏44. Probability אמיתית דורשת Calibration

‏אם נרצה לומר:

```text
Probability of hitting +0.05% within 10s = 63%
```

‏זה כבר דורש מודל ו־Calibration שנבדקו היסטורית.

‏אסור לקחת Score של 63 ולהציג אותו כ־63%.

---

# ‏45. החלטה תלויה ב־Horizon

‏מניה יכולה להיות מצוינת ל־60 שניות אבל גרועה ל־5 שניות.

‏לכן Decision צריך לדעת מה היעד.

```text
expected_move_2s
expected_move_5s
expected_move_10s
expected_move_30s
expected_move_60s
```

‏עבור הרובוט שלך נרצה לתת משקל גדול במיוחד לחלונות הקצרים.

---

# ‏46. `Time-to-Target`

‏לא מספיק לשאול אם המניה הגיעה ליעד.

‏צריך לשאול:

```text
How long did it take?
```

‏אם היא הגיעה ליעד אחרי חמש דקות — זה כמעט לא רלוונטי לאסטרטגיה שמוכנה להחזיק עד דקה.

---

# ‏47. `Time-to-First-Profit`

‏מדד חשוב אצלך:

```text
time_to_first_positive_net_mark
```

‏כלומר כמה זמן עבר עד שהעסקה הייתה חיובית לאחר עלויות משוערות.

‏זה שונה מ־Last Price שעלה מעט.

---

# ‏48. `MFE` ו־`MAE` כחלק מהDecision Research

‏נרצה לדעת לאחר בחירת Candidate:

`MFE` — כמה לטובתנו היא הלכה.

`MAE` — כמה נגדנו היא הלכה.

‏בחלונות:

```text
1s
2s
5s
10s
30s
60s
```

‏כך נוכל להבין אם הבחירה הייתה טובה אפילו אם Exit Rule מסוים היה גרוע.

---

# ‏49. `Top-1 Hit Rate`

‏נמדוד למשל:

```text
P(forward_return_5s > 0 | rank = 1)
```

‏אבל Hit Rate לבד אינו מספיק.

‏יכול להיות:

```text
80% wins of +$0.01
20% losses of -$0.20
```

‏וזו עדיין מערכת גרועה.

---

# ‏50. `Expected Value`

‏המדד הכלכלי העקרוני:

```text
EV = P(win) × AvgWin - P(loss) × AvgLoss - Costs
```

‏זו נוסחה פשוטה רעיונית.

‏במערכת אמיתית יהיו יותר מצבים, Partial Fills ועוד.

‏אבל הרעיון חשוב:

> ‏לא ממקסמים Win Rate. ממקסמים ערך צפוי נטו תחת סיכון סביר.

---

# ‏51. `Decision Threshold Curve`

‏נבדוק הרבה Thresholds.

‏לדוגמה:

| Minimum Score | Trades | Hit Rate | Avg Net | Total Net |
|---|---:|---:|---:|---:|
| 60 | 10,000 | 51% | $0.01 | $100 |
| 70 | 5,000 | 55% | $0.03 | $150 |
| 80 | 1,500 | 61% | $0.08 | $120 |
| 90 | 200 | 70% | $0.20 | $40 |

‏המספרים דמיוניים.

‏המטרה היא להבין שהThreshold הטוב ביותר אינו בהכרח זה עם Hit Rate הכי גבוה.

---

# ‏52. `Opportunity Cost`

‏אם בחרנו Candidate אחת, אנחנו מוותרים באותו רגע על אחרות.

‏לכן מחקר טוב ישמור גם:

```text
Top 5 at decision time
```

‏ואחר כך יבדוק:

```text
What happened to #2, #3, #4, #5?
```

---

# ‏53. `Counterfactual Selection Analysis`

‏זהו ניתוח:

> ‏מה היה קורה אילו בחרנו אחרת?

‏לדוגמה:

```text
#1 → -0.08%
#2 → +0.12%
#3 → +0.03%
```

‏אז אפשר לחקור:

> ‏איזה Feature גרם ל־#1 לעבור את #2?

‏זה כלי חזק מאוד לשיפור Score.

---

# ‏54. `Regret`

‏אפשר למדוד רעיונית:

```text
regret = best_outcome_in_candidate_set - selected_outcome
```

‏לא כדי “להעניש” את המודל על מידע עתידי שהוא לא ידע.

‏אלא כדי לזהות דפוסים חוזרים שבהם הוא בוחר סוג Candidate פחות טוב.

---

# ‏55. `Candidate Churn`

‏אם Top Candidate משתנה כל 100ms:

```text
AAA → BBB → CCC → AAA → DDD
```

‏יש שתי אפשרויות:

1. ‏השוק באמת משתנה מהר.
2. ‏הScore רגיש מדי לרעש.

‏צריך למדוד ולא לנחש.

---

# ‏56. `Hysteresis`

‏רעיון הנדסי שימושי:

‏לא מחליפים Candidate רק בגלל הבדל זעיר.

‏לדוגמה:

```text
current candidate = AAA score 90
new candidate     = BBB score 90.2
```

‏אולי לא כדאי להחליף מיד.

‏אפשר לדרוש פער מסוים.

‏זה נקרא באופן כללי `Hysteresis`.

---

# ‏57. למה Hysteresis יכול לעזור

‏הוא יכול להפחית:

- ‏Candidate churn.
- ‏חישובים מיותרים.
- ‏Subscription churn ב־Deep Feed.
- ‏Order indecision.

‏אבל אם הוא חזק מדי הוא יכול להשאיר אותנו עם Candidate ישנה.

‏גם אותו בודקים בנתונים.

---

# ‏58. `Cooldown`

‏אחרי Trade או Reject אפשר להגדיר Cooldown.

‏לדוגמה:

```text
Do not immediately re-enter same symbol for X seconds
```

‏זה יכול למנוע לולאות.

‏אבל עלול גם להחמיץ Re-Acceleration אמיתי.

‏לכן זה Research Variable.

---

# ‏59. Re-entry אינו אותו דבר כמו Entry ראשון

‏אם יצאנו ממניה לפני שלוש שניות והיא שוב #1:

‏המצב שונה ממניה חדשה לחלוטין.

‏נרצה Features כגון:

```text
seconds_since_last_trade
previous_trade_result
reentry_count
```

‏אבל לא חייבים להשתמש בהם ביום הראשון.

---

# ‏60. `State-Aware Decision`

‏Decision תלוי במצב המערכת.

```text
FLAT
ENTERING
POSITION
EXITING
RECOVERY
```

‏אם אנחנו כבר ב־`POSITION`, Candidate חדשה אינה בהכרח מותרת.

‏זה תלוי בחוקי המערכת.

---

# ‏61. Account/Broker Readiness

‏לפני Trade צריך לבדוק גם את העולם שמחוץ לשוק:

```text
broker connected
account synchronized
buying power known
no unknown open order
risk limits OK
market data healthy
clock healthy
```

‏אם לא:

```text
NO TRADE
```

---

# ‏62. `Risk Gate`

‏גם Candidate מושלמת יכולה להיפסל בגלל Risk.

‏לדוגמה:

```text
daily_loss_limit reached
max_order_rate reached
position already open
account state uncertain
```

‏זה לא אומר שהSignal היה גרוע.

‏לכן שומרים Rejection Reason נפרד.

---

# ‏63. Prediction Rejection מול Operational Rejection

‏נבדיל:

```text
MODEL_REJECT
EXECUTION_REJECT
RISK_REJECT
DATA_REJECT
BROKER_REJECT
SYSTEM_REJECT
```

‏כך אפשר לדעת למה לא סחרנו.

---

# ‏64. `Decision Funnel`

‏מבנה אפשרי:

```text
Universe
↓
Filters
↓
Ranked Candidates
↓
Top N
↓
Absolute Quality Gate
↓
Separation / Stability Gate
↓
Execution Gate
↓
Expected Net Edge Gate
↓
Risk / System Gate
↓
TRADE
```

‏אם משהו נכשל:

```text
NO TRADE + reason
```

---

# ‏65. לא חייבים שכל Gate יהיה Hard Rule

‏חלק מהמדדים יכולים להיכנס למודל במקום להיות Gate קשיח.

‏למשל:

```text
separation
stability
spread
```

‏אפשר:

- ‏להשתמש בהם כ־Features.
- ‏להשתמש בהם כ־Hard Threshold.
- ‏לשלב בין השניים.

‏הבחירה היא נושא למחקר.

---

# ‏66. `Two-Stage Model`

‏גישה מתקדמת:

## ‏Stage 1

‏Ranking Model בוחר Top Candidates.

## ‏Stage 2

‏Decision Model מעריך:

```text
trade worthiness
```

‏זה יכול להיות Rule Engine פשוט בהתחלה.

‏בהמשך הוא יכול להיות מודל נפרד.

---

# ‏67. למה Two-Stage יכול להיות טוב

‏Ranking שואל:

> ‏מי הטובה ביותר יחסית?

‏Decision שואל:

> ‏האם התנאים מספיק טובים לבצע בכלל?

‏אלה מטרות שונות.

‏הפרדה ביניהן מונעת Score אחד שמנסה לפתור הכל.

---

# ‏68. `Top Candidate` אינו בהכרח Symbol יחיד

‏אפשר לשמור:

```text
CandidateSet = Top 5
```

‏ואז לבצע Deep Observation על כולם לזמן קצר.

‏רק לאחר מכן לבחור אחד.

‏זה מתאים לארכיטקטורה של:

```text
Wide Scan → Deep Watch → Trade
```

---

# ‏69. `Deep Confirmation`

‏Top Candidates יכולים לקבל מידע עשיר יותר:

```text
fresher bid/ask
more recent trades
depth
microstructure features
```

‏כך לא חייבים לשלם/לעבד את המידע העמוק ביותר עבור כל אלפי המניות.

---

# ‏70. אבל Deep Confirmation מוסיף Latency

‏אם המעבר ל־Deep Feed לוקח שנייה והEdge נמשך חצי שנייה, הפסדנו.

‏לכן צריך למדוד:

```text
candidate_detected_to_deep_ready_ms
```

‏ולהחליט אם הארכיטקטורה שווה את המחיר.

---

# ‏71. `Decision SLA`

‏אפשר להגדיר יעד ביצועים פנימי:

```text
P95 candidate-to-decision < X ms
```

‏לא בגלל מספר תעשייתי כלשהו.

‏אלא לפי Signal Half-Life שנמדד אצלנו.

---

# ‏72. `Decision Consistency`

‏אותו Input צריך לתת אותה Decision.

‏אם Replay של אותו Snapshot מפיק פעם `TRADE` ופעם `NO TRADE`, יש בעיית דטרמיניזם.

‏לכן Decision Engine צריך להיות reproducible.

---

# ‏73. Versioning

‏לכל החלטה נשמור:

```text
feature_version
filter_version
score_version
decision_version
cost_model_version
risk_policy_version
```

‏כך אפשר להשוות גרסאות בצורה אמינה.

---

# ‏74. `Trade Decision ID`

‏כל החלטה יכולה לקבל מזהה:

```text
decision_id
```

‏שמחבר:

```text
market snapshot
ranking
candidate
order
fills
exit
final PnL
```

‏זה מצוין ל־debugging ולמחקר.

---

# ‏75. Best Practice — שמור גם Decisions שלא הפכו לTrade

‏טעות נפוצה היא לשמור רק עסקאות שבוצעו.

‏אבל אז אי אפשר לחקור:

> ‏האם ה־NO TRADE שלנו היה נכון?

‏צריך לשמור Sample מספק גם של:

```text
rejected candidates
no-trade cycles
shadow decisions
```

---

# ‏76. `Shadow Decision`

‏אפשר להריץ Rule חדש בלי לתת לו לסחור.

‏לדוגמה:

```text
Production decision = NO TRADE
Shadow policy       = TRADE AAA
```

‏אחר כך בודקים מה היה קורה.

‏זה מאפשר לבדוק Decision Policy חדשה בלי כסף אמיתי.

---

# ‏77. Thresholds לא מכוונים על אותו Dataset שעליו מודדים

‏אם ניסינו 500 Thresholds ובחרנו את הטוב ביותר באותו Dataset:

‏כנראה ביצענו Overfitting.

‏לכן:

```text
train / tune period
validation period
out-of-sample test
```

‏נלמד זאת לעומק בפרקי Backtest ו־Overfitting.

---

# ‏78. `Robust Region`

‏עדיף לעיתים Threshold שבו אזור רחב עובד טוב:

```text
74–80 all perform similarly well
```

‏מאשר:

```text
77.3 works amazingly
77.2 fails
77.4 fails
```

‏המצב השני חשוד כ־Overfitting.

---

# ‏79. `Decision Surface`

‏כאשר יש כמה תנאים:

```text
score
separation
spread
stability
```

‏אפשר לנתח איך התוצאה משתנה בשילובים שונים.

‏לא רק Threshold אחד בכל פעם.

‏זה נקרא רעיונית Decision Surface.

---

# ‏80. Precision מול Opportunity Capture

‏אם נהיה בררנים מאוד:

```text
higher precision
lower opportunity count
```

‏אם נהיה פתוחים מדי:

```text
more opportunities
more weak trades
```

‏אין תשובה פילוסופית.

‏המחקר צריך למצוא את האיזון הכלכלי.

---

# ‏81. מדדים שנרצה לנתח לפי Decision Bucket

‏לדוגמה לפי Score/Confidence bucket:

```text
trade_count
hit_rate_2s
hit_rate_5s
hit_rate_10s
time_to_first_profit
time_to_target
MFE_10s
MAE_10s
avg_net_pnl
median_net_pnl
P5/P95 outcome
```

‏כך יודעים אם איכות גבוהה באמת מתורגמת לתוצאה.

---

# ‏82. `Top 1` צריך לנצח Baselines

‏נשווה אותו לפחות ל־:

```text
random eligible stock
Top 5 random choice
simple momentum-only rank
previous score version
```

‏אם Score מורכב לא מנצח Baseline פשוט, אין סיבה להשתמש בו.

---

# ‏83. אצלך: מהו Success אמיתי של Candidate?

‏לא מספיק לומר:

```text
price higher after 60s
```

‏אצלך נרצה לבדוק בין היתר:

```text
Did price become executable-profit positive quickly?
How fast?
Was target reachable before adverse move?
Could entry realistically fill?
Could exit realistically fill?
Was net result positive after costs?
```

‏זו הגדרה הרבה יותר מחמירה — ומתאימה לאופי המסחר שלך.

---

# ‏84. אבל אנחנו עדיין לומדים גם את התמונה הכללית

‏במערכות אחרות Holding Horizon יכול להיות:

```text
minutes
hours
days
weeks
```

‏אותם עקרונות של Ranking, Threshold, EV ו־Abstention עדיין קיימים.

‏רק Labels, Costs, Signal Decay ו־Execution Constraints משתנים.

---

# ‏85. Anti-Pattern — תמיד לקחת #1

‏החוק:

```text
always buy rank 1
```

‏הוא Baseline מחקרי מעניין.

‏אבל כמערכת Production הוא מסוכן אם אין Gate נוסף.

---

# ‏86. Anti-Pattern — Score גבוה מבטל בעיות ביצוע

‏לא נכון:

```text
Score 99 → ignore spread
```

‏Signal חזק לא הופך Execution גרוע לטוב.

---

# ‏87. Anti-Pattern — יותר עסקאות = יותר רווח

‏לא בהכרח.

‏אם Edge לעסקה שלילי:

```text
more trades = faster losses
```

‏Frequency רק מכפילה את מה שכבר קיים.

---

# ‏88. Anti-Pattern — לשנות Threshold אחרי כל הפסד

‏עסקה בודדת היא רעש.

‏אם משנים מערכת לאחר כל הפסד:

‏אנחנו מתחילים להתאים את האלגוריתם למקריות.

‏שיפור צריך להתבסס על Sample, RCA והיפותזה מוגדרת.

---

# ‏89. Anti-Pattern — להתעלם מ־NO TRADE False Negatives

‏אם רק בודקים Trades שבוצעו, לא רואים הזדמנויות טובות שפסלנו.

‏לכן בודקים גם:

```text
What happened after NO TRADE?
```

---

# ‏90. `False Positive` ו־`False Negative`

‏במילים פשוטות:

## ‏False Positive

‏נכנסנו לעסקה שהתבררה כגרועה.

## ‏False Negative

‏לא נכנסנו למניה שהתבררה כהזדמנות טובה.

‏Threshold משנה את האיזון ביניהם.

---

# ‏91. `Decision Confusion Matrix` רעיונית

‏אפשר להגדיר Label כגון:

```text
Would this candidate have produced positive executable net result within 10s?
```

‏ואז להשוות:

```text
TRADE / NO TRADE
```

‏מול:

```text
GOOD / BAD opportunity
```

‏זה מאפשר מדדי Precision/Recall.

---

# ‏92. אבל Label חייב להתאים למסחר אמיתי

‏אם Label הוא:

```text
Last price rose
```

‏אבל לא יכולנו למכור ברווח בגלל Spread — הLabel מטעה.

‏לכן Labels צריכים להיות ככל האפשר Execution-Aware.

---

# ‏93. `Trade Readiness Contract`

‏אפשר לנסח חוזה מערכת ברור:

```text
A trade may be opened only if:
1. Market data is healthy
2. Candidate passes filters
3. Rank quality is sufficient
4. Absolute quality is sufficient
5. Execution conditions are acceptable
6. Expected net edge exceeds threshold
7. Risk state permits trading
8. Broker/account state is synchronized
9. Final pre-trade recheck still passes
```

‏אם תנאי אחד נכשל:

```text
NO TRADE
```

---

# ‏94. למה Contract כזה חשוב

‏הוא נותן:

- ‏התנהגות צפויה.
- ‏יכולת בדיקה.
- ‏יכולת Audit.
- ‏RCA ברור.
- ‏פחות “אם פה אז אולי שם”.

‏זה Best Practice חשוב למערכת אוטומטית.

---

# ‏95. State מינימלי לשמור לכל Candidate

```text
symbol
rank
score
sub_scores
score_delta
rank_duration
candidate_age
separation_top2
separation_top5
quote_age_ms
trade_age_ms
spread
estimated_slippage
expected_gross_edge
expected_cost
expected_net_edge
execution_quality
selection_status
rejection_reason
```

---

# ‏96. State מינימלי לכל Decision

```text
decision_id
decision_time
candidate_set
selected_symbol
trade_or_no_trade
decision_reason
versions
system_health
broker_state
risk_state
```

---

# ‏97. Baseline ראשון פשוט למחקר

‏לפני מודל מסובך אפשר להתחיל עם Decision Policy פשוטה:

```text
1. Take Top 1 after hard filters
2. Require minimum score
3. Require fresh data
4. Require acceptable spread
5. Require minimum expected net edge
6. Recheck immediately before order
7. Otherwise NO TRADE
```

‏ואז למדוד.

‏זו נקודת בסיס טובה להשוואה.

---

# ‏98. איך משפרים את Decision Engine

‏לא מוסיפים 30 Rules בבת אחת.

‏עובדים כך:

```text
Baseline
↓
Observe failures
↓
Form hypothesis
↓
Add one meaningful condition/feature
↓
Backtest / Replay / Shadow
↓
Compare out-of-sample
↓
Keep or remove
```

---

# ‏99. השאלה המרכזית של שלב 15

‏בכל Cycle הרובוט צריך לענות על:

> ‏"מבין כל מה שאני יכול לסחור בו כרגע, האם קיימת הזדמנות אחת שהאיכות החזויה שלה, תנאי הביצוע שלה והעלות שלה מספיק טובים כדי להצדיק Trade עכשיו?"

‏אם כן:

```text
TRADE CANDIDATE
```

‏אם לא:

```text
NO TRADE
```

---

# ‏100. מה לזכור מהפרק

1. ‏מקום #1 אינו אישור קנייה.
2. ‏צריך גם איכות מוחלטת וגם איכות יחסית.
3. ‏`Separation`, ‏Stability ו־Candidate Age יכולים להיות חשובים.
4. ‏Signal חייב להיות טרי.
5. ‏Prediction טוב אינו מספיק אם Execution גרוע.
6. ‏המדד הכלכלי הוא Expected **Net** Edge.
7. ‏`NO TRADE` הוא פלט תקין וחיוני.
8. ‏אפשר לעבור מ־#1 ל־#2 רק כאשר סיבת הפסילה מאפשרת זאת.
9. ‏Decision צריך להיות מוסבר, מתועד וניתן לשחזור.
10. ‏צריך למדוד גם Decisions שלא הפכו לעסקה.
11. ‏הצלחה אצלך נמדדת במיוחד בשניות הראשונות וביכולת להגיע לרווח בר־ביצוע.
12. ‏Thresholds ו־Gates צריכים להיות מוכחים Out-of-Sample.
13. ‏רובוט טוב אינו זה שסוחר הכי הרבה — אלא זה שיודע גם מתי לא לסחור.

---

# ‏בדיקת הבנה עצמית

1. ‏למה המניה במקום #1 יכולה עדיין לקבל `NO TRADE`?
2. ‏מה ההבדל בין Relative Quality ל־Absolute Quality?
3. ‏מהו `Separation Margin`?
4. ‏למה Persistence יכולה לעזור וגם להזיק?
5. ‏מהו `Signal TTL`?
6. ‏למה Expected Gross Edge אינו מספיק?
7. ‏מה ההבדל בין Prediction Rejection ל־Risk Rejection?
8. ‏מתי הגיוני לבדוק את #2 אם #1 נפסלה?
9. ‏למה צריך לשמור גם NO TRADE Decisions?
10. ‏מה משמעות `Abstention` במערכת מסחר?
11. ‏למה Score של 90 אינו 90% הצלחה?
12. ‏מהו `Pre-Trade Recheck` ולמה הוא קריטי למסחר של שניות?
13. ‏למה Threshold חד שעובד רק בערך אחד מדויק הוא חשוד?
14. ‏כיצד תבדוק אם Top-1 באמת עדיף על Baseline פשוט?
15. ‏מהו Trade Readiness Contract?

---

# ‏Checkpoint

‏שלב 15 הגדיר את המעבר בין Scanner לבין Execution: לא מספיק לדעת מי במקום הראשון. המערכת צריכה להחליט אם קיימת הזדמנות **מספיק טובה, טרייה, ניתנת לביצוע ורווחית נטו** — ורק אז להעביר Candidate לשלב הכניסה.

‏בשלב 16 נלמד את **הכניסה לעסקה עצמה**: מתי לשלוח Order, איזה Order Type מתאים למצב, כמה אגרסיבי להיות, איך לבצע Recheck בזמן אמת, ומה עושים אם המחיר מתחיל לברוח בזמן שאנחנו מנסים להיכנס.