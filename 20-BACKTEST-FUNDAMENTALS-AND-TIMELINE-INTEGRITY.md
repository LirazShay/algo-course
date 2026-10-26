# ‏שלב 20 — `Backtest` מהיסוד: ציר זמן נכון, מידע שהיה ידוע אז ותוצאה שאפשר לסמוך עליה

> ‏מטרת הפרק: להבין איך בונים `Backtest` שבאמת מנסה לענות על השאלה “מה היה קורה אילו האלגוריתם היה רץ אז?”, ולא בדיקה שמקבלת בטעות מידע מהעתיד, מחיר בלתי־אפשרי או Universe שלא היה קיים באותו רגע.
>
> ‏העיקרון המרכזי: **בכל Timestamp המנוע רשאי לדעת רק מה שהיה ידוע עד אותו Timestamp.** כל Signal, Rank, Decision, Order, Fill ו־Exit חייבים להיות מסודרים על ציר זמן מפורש.

---

# ‏1. מהו `Backtest`?

‏`Backtest` הוא הרצה של אסטרטגיה על נתוני עבר.

‏אבל ההגדרה החשובה יותר היא:

> ‏ניסיון לשחזר בצורה הוגנת את תהליך קבלת ההחלטות שהיה מתרחש בזמן אמת.

‏כלומר לא רק:

```text
האם המחיר עלה אחר כך?
```

‏אלא:

```text
מה האלגוריתם ידע ברגע ההחלטה?
מה הוא היה בוחר?
איזו פקודה הוא היה שולח?
באיזה מחיר היה אפשר לבצע?
מה היה קורה אחר כך?
```

---

# ‏2. `Backtest` הוא סימולציה של מערכת — לא רק נוסחה

‏במערכת שלנו יש שרשרת:

```text
Market Data
→ Feature Engine
→ Filters
→ Score
→ Ranking
→ Trade / No Trade
→ Entry
→ Position
→ Exit
→ Costs
→ Net Result
```

‏Backtest טוב צריך לשחזר את כל השרשרת הזאת לפי הסדר.

---

# ‏3. למה Backtest קל לזיוף בלי להתכוון

‏יש הרבה דרכים לקבל תוצאה יפה בטעות:

- ‏שימוש במחיר עתידי בתוך Feature.
- ‏בחירת מניות לפי רשימת היום במקום רשימת אותו יום.
- ‏הנחה שכל `Limit Order` התמלאה.
- ‏שימוש ב־`Last` כאילו הוא מחיר קנייה ומכירה.
- ‏התעלמות מ־Spread ועלויות.
- ‏התעלמות מ־Delisted Symbols.
- ‏בחירת Threshold אחרי שראינו את התוצאה.
- ‏חישוב Feature באמצעות Window שכולל את האירוע שאמור להיות בעתיד.
- ‏שימוש בנתונים מתוקנים בדיעבד כאילו היו ידועים בזמן אמת.

---

# ‏4. `Look-Ahead Bias`

‏`Look-Ahead Bias` קורה כאשר ה־Backtest משתמש במידע שלא היה זמין בזמן ההחלטה.

‏לדוגמה:

```text
10:00:00.000  Decision
10:00:00.500  Trade occurs
```

‏אם ה־Decision ב־10:00:00 השתמש בעסקה של 10:00:00.500 — הכנסנו את העתיד לעבר.

---

# ‏5. דוגמה עדינה יותר ל־Look-Ahead

‏נניח שאנחנו מחשבים:

```text
volume_10s
```

‏ב־10:00:10.

‏מותר להשתמש רק באירועים עד 10:00:10.

‏אם הקוד בנה Bar של:

```text
10:00:00 - 10:00:10
```

‏אבל בפועל הוא נסגר רק אחרי שהתקבל Event נוסף ב־10:00:10.300, צריך להבין איזה Timestamp מייצג מה.

‏אחרת Bar “מושלם” יכול להכיל מידע שלא היה זמין בזמן ההחלטה.

---

# ‏6. `As-Of Time`

‏לכל Snapshot מחקרי כדאי להיות שדה:

```text
as_of_time
```

‏המשמעות:

> ‏כל הנתונים וה־Features ברשומה הזאת מייצגים רק מידע שהיה זמין עד הזמן הזה.

---

# ‏7. כמה סוגי זמן קיימים

‏במערכת אמיתית ייתכן שנרצה להבדיל בין:

```text
exchange_event_time
provider_receive_time
local_receive_time
process_time
decision_time
order_send_time
broker_ack_time
fill_time
```

‏לא תמיד יהיו לנו כולם היסטורית.

‏אבל צריך לדעת מה יש לנו ומה אין לנו.

---

# ‏8. `Event Time` מול `Processing Time`

‏`Event Time` אומר מתי האירוע התרחש בשוק.

‏`Processing Time` אומר מתי המערכת שלנו עיבדה אותו.

‏ב־Backtest אידיאלי של Signal נשתמש ב־Event Time בצורה עקבית.

‏ב־Backtest של Production Latency נרצה גם לדמות Processing/Receive Delay.

---

# ‏9. סדר אירועים חייב להיות מוגדר

‏נניח שבאותה אלפית שנייה יש:

```text
Quote update
Trade
Scanner cycle
```

‏צריך כלל דטרמיניסטי שמגדיר מה קרה קודם.

‏אחרת אותה ריצה יכולה לתת תוצאה אחרת.

---

# ‏10. `Determinism`

‏Backtest טוב צריך להיות דטרמיניסטי.

‏כלומר:

```text
same data
same code
same config
same seed
→ same result
```

‏אם אותה הרצה נותנת תוצאה אחרת בלי סיבה, קשה מאוד לחקור אותה.

---

# ‏11. מהו `Point-in-Time Data`?

‏`Point-in-Time Data` הוא מידע כפי שהיה ידוע באותו זמן היסטורי.

‏לא כפי שהוא נראה היום אחרי תיקונים, מיזוגים, שינויי Symbols או מחיקות.

---

# ‏12. `Survivorship Bias`

‏אם היום יש לנו רשימה של 4,000 מניות ואנחנו מריצים אותה על 2024, אנחנו עלולים להכניס מניות שלא היו קיימות אז ולהוציא מניות שנמחקו מאז.

‏זה `Survivorship Bias`.

‏ה־Universe ההיסטורי צריך להיות:

```text
Universe(as_of_time)
```

‏ולא:

```text
Universe(today)
```

---

# ‏13. Universe היסטורי הוא חלק מה־Backtest

‏לכל זמן צריך לדעת:

- ‏אילו Symbols היו קיימים.
- ‏אילו היו Tradable.
- ‏אילו היו Halted.
- ‏איזה Security Type היה להם.
- ‏איזה Symbol/Identifier היה נכון אז.

---

# ‏14. `Corporate Actions`

‏Splits, mergers, symbol changes ודיבידנדים יכולים לשנות סדרות מחיר.

‏צריך להבין האם הנתונים שלנו:

```text
raw
adjusted
split-adjusted
fully-adjusted
```

‏ולא לערבב ביניהם בלי הגדרה.

---

# ‏15. למסחר של שניות Raw Price חשוב במיוחד

‏כאשר מדמים Fill היסטורי, בדרך כלל צריך להבין את המחיר האמיתי שנצפה בזמן האירוע.

‏Series מתוקן בדיעבד טוב למחקרים מסוימים, אבל עלול להיות לא מתאים לשחזור Execution.

---

# ‏16. Snapshot של “כל השוק” חייב להיות לוגי

‏אם מדרגים 4,000 מניות ב־10:00:00, לא חייב שכל המניות עודכנו בדיוק באותו microsecond.

‏אבל חייב להיות כלל:

```text
for each symbol:
    use latest valid state where timestamp <= as_of_time
```

---

# ‏17. לא להשתמש ב־Nearest אם הוא בעתיד

‏זו טעות מסוכנת.

‏נניח אנחנו מחפשים מחיר סביב:

```text
10:00:00
```

‏ומצאנו:

```text
09:59:59.800
10:00:00.100
```

‏אסור לבחור אוטומטית את “הקרוב ביותר”.

‏ב־Feature Historical Anchor לרוב צריך:

```text
latest timestamp <= target_time
```

---

# ‏18. Anchor היסטורי

‏למשל לחישוב:

```text
change_10s
```

‏ב־10:00:20:

```text
target_anchor = 10:00:10
```

‏נבחר את הנתון האחרון שהיה ידוע עד 10:00:10.

---

# ‏19. מה עושים אם אין Anchor תקין?

‏לא ממציאים.

‏אפשר:

```text
feature = null
feature_valid = false
```

‏או לפסול את המניה לפי Data Quality Filter.

---

# ‏20. Interpolation יכולה להיות מסוכנת

‏אם בין שתי עסקאות אנחנו “ממציאים” מחיר באמצע, אנחנו יוצרים מידע שלא בהכרח היה קיים.

‏Interpolation יכולה להתאים למחקרים מסוימים.

‏אבל צריך להגדיר אותה במפורש ולא להשתמש בה בלי להבין את המשמעות.

---

# ‏21. `Backtest Clock`

‏כדאי לחשוב על המנוע כעל שעון וירטואלי:

```text
09:30:00
09:30:00.001
09:30:00.002
...
```

‏אבל לא חייבים לעבור כל millisecond.

‏אפשר לקדם את השעון מאירוע לאירוע.

---

# ‏22. `Event-Driven Backtest`

‏במנוע Event-Driven:

```text
next market event
→ update canonical state
→ update features
→ maybe scan
→ maybe decide
→ maybe update order/position
```

‏זו דרך טבעית במיוחד למערכת מסחר מהירה.

---

# ‏23. `Snapshot Backtest`

‏אפשר גם להריץ כל:

```text
1s
5s
10s
```

‏ולבנות Snapshot.

‏זה פשוט יותר.

‏אבל צריך לדעת מה אובד בין Snapshot ל־Snapshot.

---

# ‏24. Hybrid

‏אפשר להשתמש ב־Event Data כדי לעדכן State continuously, אבל לבצע Ranking רק כל:

```text
1 second
2 seconds
5 seconds
```

‏זו ארכיטקטורה הגיונית למחקר של הסורק שלך.

---

# ‏25. `Decision Time`

‏ברגע שה־Scanner מסיים דירוג יש לנו:

```text
decision_time
```

‏זה הזמן שממנו מותר להתחיל למדוד את העתיד.

---

# ‏26. `Label` אינו Feature

‏Feature משתמש בעבר.

‏Label משתמש בעתיד כדי למדוד מה קרה אחרי ההחלטה.

‏לדוגמה:

```text
feature: momentum_10s at T
label: forward_return_5s from T to T+5s
```

---

# ‏27. Separation מוחלט בין Features ל־Labels

‏ה־Feature Engine לא צריך גישה ל־future data.

‏ה־Label Engine כן.

‏עדיף אפילו להפריד אותם ברמת קוד/מודול.

---

# ‏28. `Forward Return`

‏דוגמה בסיסית:

```text
forward_return_5s = price(T+5s) / price(T) - 1
```

‏אבל זה מדד מחקרי בלבד.

‏הוא עדיין לא אומר שהיינו יכולים לקנות ב־price(T) ולמכור ב־price(T+5s).

---

# ‏29. למה Forward Return אינו PnL

‏PnL אמיתי תלוי ב:

- ‏Entry Fill.
- ‏Exit Fill.
- ‏Spread.
- ‏Slippage.
- ‏Fees.
- ‏Latency.
- ‏Partial Fills.

‏לכן צריך לשמור הפרדה בין:

```text
Prediction Quality
```

‏לבין:

```text
Execution PnL
```

---

# ‏30. Baseline לפני Simulation מלאה

‏בהתחלה אפשר לבדוק:

```text
Signal at T
→ what happened to Mid/Last/Bid/Ask after 1s/2s/5s/10s/30s/60s?
```

‏זה בודק האם ל־Scanner בכלל יש כוח ניבוי.

‏רק אחר כך מדמים Orders באופן מורכב.

---

# ‏31. שני סוגי Backtest שאנחנו צריכים

## ‏א. `Signal Backtest`

‏בודק:

> ‏האם הבחירה של הסורק הייתה טובה?

## ‏ב. `Execution Backtest`

‏בודק:

> ‏האם אפשר היה להפוך את הבחירה הזאת לרווח אמיתי?

---

# ‏32. לא לערבב בין השניים מוקדם מדי

‏אם Strategy מפסידה, צריך לדעת האם:

```text
Scanner bad
```

‏או:

```text
Scanner good, execution bad
```

‏אם הכל מחובר מהיום הראשון, קשה לבצע RCA.

---

# ‏33. Cross-Sectional Backtest

‏המערכת שלך אינה שואלת רק:

```text
Is XYZ good?
```

‏אלא:

```text
Which symbol is best right now?
```

‏לכן ה־Backtest חייב לשחזר את כל ה־Universe בכל Decision Time.

---

# ‏34. אסור לבדוק רק את המנצחת בדיעבד

‏צריך לחשב Score לכל המניות שהיו זמינות אז.

‏רק אז לבחור:

```text
Rank #1
```

‏אחרת זו אינה סימולציה של הסורק.

---

# ‏35. לשמור Top N

‏בכל Decision Snapshot כדאי לשמור למשל:

```text
rank_1
rank_2
rank_3
...
rank_20
```

‏זה מאפשר אחר כך לחקור:

- ‏האם #1 באמת עדיפה.
- ‏מה היה קורה עם #2.
- ‏כמה גדול Gap.
- ‏כמה Ranking יציב.

---

# ‏36. `NO TRADE` חייב להופיע גם ב־Backtest

‏אם בזמן אמת המערכת הייתה אומרת:

```text
NO TRADE
```

‏ה־Backtest לא רשאי “להכריח” עסקה כדי שיהיה יותר Data.

---

# ‏37. Decision Snapshot

‏לכל החלטה כדאי לשמור:

```text
as_of_time
universe_version
filter_version
feature_version
score_version
decision_version
ranked_candidates
selected_candidate
decision
reason
```

---

# ‏38. `Reproducibility`

‏כדי לשחזר תוצאה צריך לדעת:

```text
data_version
code_commit
config_hash
feature_version
score_version
cost_model_version
execution_model_version
random_seed
```

---

# ‏39. `Backtest Run ID`

‏כל ריצה צריכה לקבל מזהה ייחודי:

```text
backtest_run_id
```

‏כך אפשר להשוות ריצות בלי להתבלבל.

---

# ‏40. Configuration אינה קוד בלבד

‏Parameters כמו:

```text
scan_interval
min_trade_count
max_spread
score_weights
max_signal_age
holding_time
```

‏צריכים להישמר כחלק מארטיפקט הריצה.

---

# ‏41. `Immutable Run Artifact`

‏אחרי ריצה לא משנים את תוצאותיה.

‏אם משנים Config — יוצרים Run חדש.

---

# ‏42. Universe Snapshot

‏בכל נקודת החלטה כדאי לדעת כמה מניות עברו כל שלב:

```text
base_universe_count
tradable_count
fresh_count
filtered_count
ranked_count
```

---

# ‏43. Funnel Diagnostics

‏אם מ־4,000 מניות נשארו 3, כדאי לדעת למה.

‏לדוגמה:

```text
1500 rejected: stale data
900 rejected: insufficient activity
600 rejected: spread too wide
700 rejected: momentum condition
297 rejected: other
3 survived
```

---

# ‏44. Backtest צריך לשמור Rejection Reasons

‏לא רק מי עבר.

‏גם מי נפסל ולמה.

‏אחרת אי אפשר לדעת אם Filter מחק הזדמנויות טובות.

---

# ‏45. `Rejected Opportunity Analysis`

‏אפשר למדוד מה קרה למניות שנפסלו.

‏לדוגמה:

```text
rejected_by_spread_filter
→ average forward_return_5s
```

‏זה מאפשר לבדוק אם Filter באמת מועיל.

---

# ‏46. Signal Frequency

‏Backtest צריך לדווח:

```text
signals_per_hour
trade_decisions_per_hour
no_trade_rate
```

‏אסטרטגיה יכולה להיות “רווחית” רק כי היא עשתה 2 עסקאות בשנה.

---

# ‏47. Turnover

‏במסחר קצר מאוד, Turnover גבוה.

‏לכן צריך לעקוב אחרי:

```text
notional_traded_per_day
round_trips_per_day
capital_turnover
```

‏ולא רק PnL.

---

# ‏48. Capital Availability

‏אם המודל מניח Position אחת בכל רגע, Backtest חייב לכבד זאת.

‏לא ניתן לבצע בו־זמנית 20 עסקאות אם האסטרטגיה בזמן אמת מחזיקה אחת בלבד.

---

# ‏49. Position State

‏צריך State אמיתי:

```text
FLAT
ENTERING
POSITION
EXITING
```

‏ולא לחשב כל Signal כאילו אין עסקאות קיימות.

---

# ‏50. Overlapping Signals

‏אם Signal חדש מגיע כאשר יש Position קיימת, צריך להגדיר Policy:

```text
ignore
replace
queue
compare-and-switch
```

‏ה־Backtest חייב להשתמש באותה Policy שמתוכננת ל־Live.

---

# ‏51. Cooldown

‏אם יש Cooldown אחרי Exit, הוא חייב להיות ב־Backtest.

‏אי אפשר להסיר אותו היסטורית רק כדי לקבל עוד Trades.

---

# ‏52. Duplicate Signals

‏אותה מניה יכולה לקבל Rank #1 שוב ושוב.

‏צריך להגדיר האם כל Snapshot יוצר Signal חדש או שזה אותו Opportunity State.

---

# ‏53. Signal Identity

‏אפשר לשמור:

```text
signal_id
symbol
first_seen_time
last_seen_time
peak_score
```

‏זה שימושי לחקר Persistence.

---

# ‏54. Entry Assumption

‏Backtest בסיסי חייב להגדיר במפורש:

```text
when does entry start?
```

‏לדוגמה:

```text
entry cannot occur before decision_time + assumed_latency
```

---

# ‏55. אסור Fill בזמן ההחלטה אם זה בלתי־אפשרי

‏אם החלטנו ב־T אחרי שקיבלנו נתון ב־T, לא הגיוני בדרך כלל להניח Fill באותו Event שכבר שימש לקבלת ההחלטה.

‏צריך סדר אירועים הוגן.

---

# ‏56. Exit Assumption

‏גם Exit צריך Timeline:

```text
exit_signal_time
exit_order_time
exit_fill_time
```

‏ולא רק:

```text
sell at best future price
```

---

# ‏57. `MFE`

‏`Maximum Favorable Excursion` מודד כמה רחוק המחיר הגיע לטובתנו במהלך חלון עתידי.

‏זה כלי מחקרי חשוב.

‏אבל הוא אינו Exit Price אוטומטי.

---

# ‏58. `MAE`

‏`Maximum Adverse Excursion` מודד כמה רחוק המחיר הלך נגדנו.

‏זה עוזר להבין Risk ו־Stop behavior.

---

# ‏59. למה אסור למכור ב־MFE בדיעבד

‏אם המחיר הגיע לשיא ב־T+7s, בזמן אמת לא ידענו שזה השיא.

‏Backtest שאומר:

```text
sell at max price in next 30s
```

‏משתמש בעתיד.

---

# ‏60. `Time to First Profit`

‏למערכת שלך זה מדד חשוב:

```text
time_to_first_positive_executable_pnl
```

‏לא רק האם היה רווח בדקה.

---

# ‏61. `Time to Target`

‏אפשר למדוד:

```text
time_to_target_5bps
time_to_target_10bps
time_to_target_20bps
```

‏לפי Cost Model מתאים.

---

# ‏62. Multiple Forward Horizons

‏בכל Signal כדאי למדוד:

```text
1s
2s
5s
10s
20s
30s
60s
```

‏כך רואים איפה ה־Edge מופיע ומתי הוא נעלם.

---

# ‏63. `Edge Decay`

‏יכול להיות:

```text
+ at 2s
+ at 5s
flat at 20s
negative at 60s
```

‏זה אומר שה־Signal קצר חיים.

---

# ‏64. Backtest לפי Holding Horizon

‏אסור להניח ש־Score שמתאים ל־5s מתאים גם ל־60s.

‏צריך למדוד בנפרד.

---

# ‏65. `Trade Count` אינו Sample Count

‏אם יש 100 Snapshots של אותה Opportunity, זה לא בהכרח 100 תצפיות עצמאיות.

‏יש תלות גבוהה ביניהן.

---

# ‏66. Correlated Samples

‏במסחר מהיר, Signals סמוכים מאוד בזמן יכולים להיות כמעט אותו אירוע.

‏זה חשוב כאשר מחשבים Confidence ו־Statistical Significance.

---

# ‏67. Event Clustering

‏אפשר לקבץ Signals סמוכים לאותה Opportunity Episode.

‏לדוגמה:

```text
same symbol
within 20s
continuous high rank
→ one episode
```

---

# ‏68. יום מסחר אינו תמיד Sample עצמאי מושלם

‏ימים שונים יכולים להיות תלויים באותו Regime.

‏לכן בהמשך נלמד Split לפי זמן ו־Regime.

---

# ‏69. Session Context

‏יש הבדל בין:

```text
pre-market
open
midday
close
post-market
```

‏Backtest צריך לשמור Session.

---

# ‏70. Open שונה מאמצע היום

‏בפתיחה:

- ‏Volume גבוה יותר.
- ‏Spreads יכולים להיות שונים.
- ‏Volatility שונה.
- ‏Auction משפיעה.

‏לכן לא נכון לערבב הכל בלי Segment Analysis.

---

# ‏71. Halt ו־Resume

‏אם מניה Halted, Backtest חייב לדעת שלא ניתן לסחור בה כרגיל.

‏אירוע Resume גם יכול להיות חריג מאוד.

---

# ‏72. Missing Data

‏Data חסר אינו שווה:

```text
price unchanged
```

‏צריך להבדיל:

```text
no event
no data
stale data
feed gap
```

---

# ‏73. `No Change` מול `No Data`

‏אם Last לא השתנה 5 שניות, זה מצב אחד.

‏אם לא קיבלנו Feed 5 שניות, זה מצב אחר.

‏Backtest צריך לדעת להבדיל.

---

# ‏74. Out-of-Order Events

‏נתוני עבר יכולים להכיל Events שלא מסודרים.

‏צריך Policy:

```text
sort by authoritative timestamp
reject invalid records
track corrections
```

---

# ‏75. Duplicates

‏Duplicate Event יכול להכפיל Volume או Trade Count בטעות.

‏Data Cleaning חייב להיות מתועד וגרסאי.

---

# ‏76. Data Corrections

‏אם ספק מתקן Tick בדיעבד, צריך לדעת אם Dataset ההיסטורי כולל Correction שלא היה ידוע בזמן אמת.

‏זו אחת הסיבות לכך ש־Historical Data אינו תמיד זהה ל־Live Data.

---

# ‏77. `Historical / Live Parity`

‏מטרה חשובה:

> ‏אותו Event Schema ואותו Feature Code ככל האפשר ב־Historical וב־Live.

‏כך מצמצמים Training/Serving Skew.

---

# ‏78. לא לכתוב Feature פעמיים

‏Anti-pattern:

```text
FeatureCalculatorBacktest
FeatureCalculatorLive
```

‏עם לוגיקה שונה.

‏עדיף Core משותף ככל האפשר.

---

# ‏79. `Replay` הוא כלי חזק

‏Replay מזין את אותם Historical Events למערכת כמעט כאילו הם Live.

‏כך אפשר לבדוק:

```text
Collector-compatible input
→ same state machine
→ same scanner
→ simulated broker
```

‏נקדיש לזה פרק נפרד בהמשך.

---

# ‏80. `Simulated Broker`

‏כדאי שה־Backtest לא “יקנה” ישירות.

‏עדיף Interface דומה ל־Broker:

```text
SubmitOrder
CancelOrder
OrderAck
PartialFill
Fill
Reject
```

‏גם אם בשלב הראשון המודל פשוט.

---

# ‏81. Simple First

‏לא צריך להתחיל עם סימולציית Exchange מושלמת.

‏אפשר להתחיל:

```text
Signal Backtest
→ simple latency
→ simple executable price
→ explicit costs
```

‏ולאחר מכן לשפר.

---

# ‏82. Complexity חייבת לפתור Bias אמיתי

‏כל שכבת מורכבות צריכה לענות:

> ‏איזו טעות היא מתקנת?

‏אם אין תשובה, ייתכן שהיא רק מסבכת את המנוע.

---

# ‏83. Baseline Model

‏לפני Score מתקדם, כדאי Backtest של Baseline פשוט.

‏למשל:

```text
rank by change_10s
```

‏זה נותן נקודת השוואה.

---

# ‏84. Benchmark

‏כל שיפור צריך להיות מול משהו.

‏לדוגמה:

```text
random tradable stock
highest momentum only
current production score
previous score version
```

---

# ‏85. `Ablation`

‏אם הוספנו Feature חדש, נרצה להשוות:

```text
Score A
Score A + Feature X
```

‏ולא רק להריץ את המודל החדש לבד.

---

# ‏86. לא לבחור Parameters מתוך אותו Data בלי סוף

‏אם ניסינו 5,000 Thresholds ובחרנו את הטוב ביותר על אותו Dataset, התוצאה עלולה להיות מקרית.

‏זה חלק מ־Overfitting.

‏נקדיש לכך פרק נפרד.

---

# ‏87. `In-Sample` ו־`Out-of-Sample`

‏ברמה הבסיסית:

```text
In-Sample = data used to develop/tune
Out-of-Sample = data kept aside for evaluation
```

‏לא בוחרים את המודל לפי Out-of-Sample שוב ושוב.

---

# ‏88. Split לפי זמן

‏בנתוני שוק לא עושים Shuffle אקראי פשוט כאילו כל הרשומות עצמאיות.

‏לרוב נכון יותר לשמור סדר זמן.

---

# ‏89. `Walk-Forward`

‏רעיון בסיסי:

```text
train / tune on past
validate on next period
roll forward
repeat
```

‏כך מדמים תהליך שבו בכל תקופה יודעים רק את העבר.

---

# ‏90. `Backtest` אינו Proof

‏גם Backtest נקי יכול להיכשל Live.

‏הוא נותן Evidence.

‏לא הבטחה.

---

# ‏91. למה?

‏כי העתיד יכול להיות שונה:

- ‏Regime משתנה.
- ‏Market Structure משתנה.
- ‏Fees משתנים.
- ‏Data Feed משתנה.
- ‏Participants משתנים.
- ‏Latency משתנה.
- ‏Edge נעלם.

---

# ‏92. Structural Break

‏מערכת שהייתה טובה ב־Period אחד יכולה להפסיק לעבוד אחרי שינוי מבני בשוק.

‏לכן חשוב לנתח לפי תקופות.

---

# ‏93. Metrics בסיסיים של Signal Backtest

‏כדאי לשמור:

```text
sample_count
hit_rate
average_forward_return
median_forward_return
p10
p25
p75
p90
MFE
MAE
time_to_first_profit
time_to_target
```

---

# ‏94. Metrics בסיסיים של Trading Backtest

```text
trade_count
gross_pnl
net_pnl
win_rate
average_win
average_loss
expected_value
max_drawdown
turnover
costs
fill_rate
average_hold_time
```

---

# ‏95. Win Rate לבדה חסרת משמעות

‏אפשר להרוויח עם Win Rate נמוך אם הזכיות גדולות.

‏אפשר להפסיד עם Win Rate גבוה אם ההפסדים גדולים.

---

# ‏96. Expected Value

‏בפשטות:

```text
EV = P(win) × AvgWin - P(loss) × AvgLoss
```

‏אבל למסחר אמיתי צריך להשתמש בתוצאות Net.

---

# ‏97. Distribution ולא רק Average

‏ממוצע יכול להסתיר Tail Risk.

‏צריך לראות Distribution.

---

# ‏98. Percentiles

‏לדוגמה:

```text
P10
P50
P90
P99 loss
```

‏נותנים תמונה רחבה יותר.

---

# ‏99. Outliers

‏עסקה אחת חריגה יכולה להסביר חלק גדול מהרווח.

‏צריך לשאול:

```text
what if top 1% best trades are removed?
```

---

# ‏100. Concentration of PnL

‏בדיקה חשובה:

```text
% of PnL from top 1 trade
% from top 10 trades
% from top day
% from top symbol
```

---

# ‏101. PnL לפי Symbol

‏אם כל ה־Edge הגיע מ־3 מניות חריגות, זה מידע חשוב.

---

# ‏102. PnL לפי שעה

‏אולי האסטרטגיה עובדת רק בפתיחה.

---

# ‏103. PnL לפי Score Bucket

‏אם Score טוב:

```text
higher score
→ better future outcome
```

‏אמורה להיות נטייה סבירה לכיוון הזה.

---

# ‏104. Rank Bucket

‏למשל:

```text
Rank 1
Rank 2-5
Rank 6-20
Rank 21-100
```

‏ואז להשוות Forward Outcomes.

---

# ‏105. Top-1 Diagnostic

‏למערכת שלך חשוב במיוחד:

```text
when Rank #1 chosen:
what happened at +1s/+2s/+5s/+10s/+30s/+60s?
```

---

# ‏106. Counterfactual

‏בכל בחירה אפשר לשמור:

```text
what happened to #2?
what happened to #3?
```

‏כך אפשר לבדוק אם Ranking באמת בחר נכון.

---

# ‏107. Regret

‏אפשר להגדיר מחקרית:

```text
regret = best_available_future_outcome - chosen_outcome
```

‏לא כדי “לרמות” את המודל, אלא כדי להבין איפה הוא מפספס.

---

# ‏108. `Oracle` כגבול עליון

‏אפשר ליצור Oracle שיודע את העתיד רק לצורכי Benchmark.

‏הוא לעולם לא משמש Strategy.

‏הוא עונה:

> ‏כמה Opportunity בכלל הייתה קיימת?

---

# ‏109. Oracle אינו Target ריאלי

‏אם Oracle מרוויח מאוד והאסטרטגיה לא, זה אומר שיש Opportunity תיאורטית.

‏לא בהכרח שיש Feature שמאפשר לזהות אותה בזמן אמת.

---

# ‏110. `Backtest Invariants`

‏כדאי להגדיר חוקים שאסור לעבור:

```text
feature_timestamp <= decision_time
order_time >= decision_time
fill_time >= order_time
exit_fill_time >= entry_fill_time
no future data in feature engine
position cannot be negative unless shorting is enabled
```

---

# ‏111. Assertions בתוך המנוע

‏אם Invariant נשבר:

```text
fail the run
```

‏לא “להמשיך ולרשום Warning”.

---

# ‏112. Unit Tests לציר זמן

‏צריך Test שבו בכוונה Event עתידי מופיע ב־Dataset ולוודא שה־Feature Engine לא רואה אותו.

---

# ‏113. Test ל־Anchor

‏אם Anchor המבוקש הוא:

```text
T-10s
```

‏ויש Records ב:

```text
T-10.1s
T-9.9s
```

‏המערכת צריכה לבחור את הראשון, לא את העתידי.

---

# ‏114. Test ל־Universe

‏מניה שנרשמה למסחר רק מ־Date X לא יכולה להופיע קודם.

---

# ‏115. Test ל־Halt

‏מניה Halted לא יכולה לקבל Fill רגיל בזמן Halt.

---

# ‏116. Test ל־Costs

‏אותו Trade עם Cost Model שונה צריך להפיק Net PnL שונה בצורה צפויה.

---

# ‏117. Golden Dataset

‏כדאי לשמור Dataset קטן מאוד שבו אנחנו יודעים ידנית מה צריך לקרות.

‏למשל 3 Symbols במשך 60 שניות.

---

# ‏118. Golden Backtest

‏על Dataset הזה אנחנו יודעים:

```text
who ranks #1
when signal fires
what decision happens
what expected result is
```

‏וכל שינוי במנוע נבדק מולו.

---

# ‏119. Property-Based Tests

‏אפשר לבדוק חוקים כלליים:

```text
future event cannot change past decision
adding unrelated future data cannot change earlier output
same input produces same output
```

---

# ‏120. Differential Testing

‏אם משנים Engine, אפשר להריץ Old vs New על אותו Day ולראות בדיוק איפה התוצאות מתחילות לסטות.

---

# ‏121. Run Diff

‏כדאי להציג:

```text
changed decisions
changed ranks
changed fills
changed pnl
changed rejection reasons
```

---

# ‏122. Debuggable Backtest

‏על כל Trade צריך להיות אפשר לענות:

```text
Why this symbol?
Why now?
Why this score?
Why this order?
Why this fill?
Why this exit?
```

---

# ‏123. `Decision Trace`

‏למשל:

```text
T = 10:31:05.000
Universe = 4012
Passed filters = 86
XYZ rank = 1
Score = 0.842
Gap to #2 = 0.071
Decision = TRADE
```

---

# ‏124. `Feature Snapshot`

‏לשמור Features ששימשו בפועל:

```text
momentum_5s
momentum_10s
velocity
acceleration
trade_rate
spread_bps
freshness_ms
```

---

# ‏125. לא לחשב Features מחדש בדיעבד בלי Version

‏אם Formula השתנתה, צריך Version חדש.

‏אחרת Trade היסטורי יכול “לשנות הסבר”.

---

# ‏126. Data Lineage

‏לכל Result כדאי לדעת:

```text
source dataset
normalization version
feature version
score version
execution model version
```

---

# ‏127. Raw Data Retention

‏ככל שניתן, שומרים Raw Events כדי שנוכל לבנות מחדש Derived State.

---

# ‏128. Derived Data Cache

‏למהירות אפשר לשמור Features מחושבים מראש.

‏אבל צריך יכולת לדעת מאיזה Raw Data ו־Version הם נוצרו.

---

# ‏129. Incremental Backtest

‏למערכת של אלפי מניות לא חייבים לחשב הכל מחדש לכל Timestamp.

‏אפשר לעדכן State רק עבור Symbols שקיבלו Events.

---

# ‏130. אבל Ranking הוא Global

‏גם אם Features מתעדכנים Incrementally, בזמן Ranking צריך להשוות את כל ה־Eligible Symbols במצב העדכני שלהם.

---

# ‏131. Performance אינו תירוץ לשגיאת Timeline

‏Optimization אסור שישנה Semantics.

‏ראשית Correctness.

‏אחר כך Speed.

---

# ‏132. Partitioning

‏אפשר להריץ Days במקביל אם כל Day עצמאי מבחינת State הנדרש.

‏אבל אם Strategy תלויה ב־Previous Day State, צריך להעביר State נכון.

---

# ‏133. Warmup

‏Feature של 60 שניות דורש History לפני שהוא Valid.

‏לכן בתחילת Session יכול להיות:

```text
feature_valid = false
```

‏עד שיש מספיק Data.

---

# ‏134. Warmup לא צריך להשתמש בעתיד

‏אי אפשר “למלא” את תחילת היום באמצעות נתונים מאוחר יותר באותו יום.

---

# ‏135. Previous Session Context

‏אם Feature דורש Previous Close או נתוני יום קודם, צריך לטעון אותם לפני תחילת Replay.

---

# ‏136. Time Zones

‏Storage מומלץ בדרך כלל ב־UTC, עם Session Calendar ברור.

‏אבל תצוגה ו־Market Session צריכים להיות לפי Timezone הנכון של הבורסה.

---

# ‏137. DST

‏שעון קיץ יכול לגרום לטעויות אם משתמשים בשעות Hardcoded.

‏צריך Calendar אמיתי.

---

# ‏138. Trading Calendar

‏צריך לדעת:

- ‏ימי מסחר.
- ‏חגים.
- ‏ימים מקוצרים.
- ‏שעות Pre/Post אם רלוונטי.

---

# ‏139. Scheduled Events

‏ב־Backtest Advanced אפשר לסמן אירועים כמו Open/Close/Auction boundaries.

---

# ‏140. Backtest Mode צריך להיות מפורש

‏למשל:

```text
SIGNAL_ONLY
SIMPLE_EXECUTION
MICROSTRUCTURE_EXECUTION
REPLAY
```

‏כך לא משווים בטעות תוצאות מסוגים שונים.

---

# ‏141. `Simple Execution` הוא לא שקר אם מסמנים אותו

‏מותר להתחיל במודל פשוט.

‏הבעיה היא להציג אותו כאילו הוא ריאליסטי יותר ממה שהוא.

---

# ‏142. Assumption Registry

‏כדאי לשמור רשימה:

```text
assumed_latency_ms
fill_model
cost_model
spread_model
partial_fill_model
session_policy
```

---

# ‏143. Assumptions חייבות להיות Visible

‏Report של Backtest בלי Assumptions הוא מסוכן.

---

# ‏144. Best Case / Base Case / Stress Case

‏אפשר להריץ:

```text
optimistic execution
base execution
pessimistic execution
```

‏אם Strategy עובדת רק ב־Best Case — זו אזהרה.

---

# ‏145. Sensitivity

‏בודקים מה קורה כאשר:

```text
latency +50ms
spread +20%
slippage +50%
fees +20%
```

‏לא מחפשים רק Scenario אחד מושלם.

---

# ‏146. Robustness לפני Precision

‏עדיף Strategy שמרוויחה מעט במגוון Assumptions סבירות מאשר אחת שמרוויחה הרבה רק בהנחה מדויקת אחת.

---

# ‏147. Backtest Report

‏Report טוב צריך לכלול:

```text
period
universe
strategy version
assumptions
trade count
signal count
no-trade count
gross pnl
costs
net pnl
drawdown
forward-return diagnostics
rank diagnostics
execution diagnostics
```

---

# ‏148. Report לפי Subsets

‏למשל:

```text
by month
by day
by hour
by symbol
by price bucket
by liquidity bucket
by score bucket
by regime
```

---

# ‏149. לא להסתפק ב־Equity Curve

‏Equity Curve יפה יכולה להסתיר:

- ‏מעט Trades.
- ‏Outlier אחד.
- ‏תקופה אחת טובה.
- ‏Cost model חלש.
- ‏Drawdown חריג.

---

# ‏150. Trade Ledger

‏כל Trade צריך להופיע בטבלה מפורטת.

‏לא רק Aggregates.

---

# ‏151. Signal Ledger

‏גם Signals שלא הפכו ל־Trade צריכים להישמר.

‏אחרת אי אפשר לחקור `NO TRADE` ו־Filters.

---

# ‏152. Rejected Candidate Ledger

‏למחקר מתקדם כדאי לשמור Sample של מועמדות שנפסלו.

---

# ‏153. Why-Not-Trade Analysis

‏אפשר לשאול:

```text
What happened after NO TRADE?
```

‏אם הרבה NO TRADE היו הזדמנויות מצוינות, Threshold אולי קשיח מדי.

---

# ‏154. `False Positive`

‏Trade שהמערכת בחרה אבל לא נתן Outcome רצוי.

---

# ‏155. `False Negative`

‏Opportunity טובה שהמערכת פספסה.

---

# ‏156. Scanner Quality אינו רק PnL

‏אפשר למדוד:

```text
selection precision
rank quality
missed opportunity rate
time-to-profit
```

‏גם לפני Execution מלא.

---

# ‏157. `Backtest` כסביבת Debug

‏הערך שלו אינו רק “כמה הייתי מרוויח”.

‏הוא גם מאפשר לשאול:

> ‏למה האלגוריתם החליט כך?

---

# ‏158. RCA של Trade כושל

‏נרצה לראות:

```text
market state
feature values
rank
score gap
candidate age
spread
activity
future path
```

---

# ‏159. RCA של Trade מוצלח

‏גם הצלחות צריך לחקור.

‏אולי הן מקריות.

---

# ‏160. `Luck` מול `Repeatable Pattern`

‏Trade אחד מצוין אינו Edge.

‏Edge דורש Pattern שחוזר מספיק פעמים בתנאים שונים.

---

# ‏161. `Backtest` הוא ניסוי

‏לכל ריצה צריך להיות:

```text
hypothesis
change
expected effect
result
interpretation
```

---

# ‏162. One Change at a Time

‏אם שינינו 10 Features, 4 Filters ו־Exit יחד, אי אפשר לדעת מה גרם לתוצאה.

---

# ‏163. Experiment Registry

‏אפשר לשמור:

```text
experiment_id
parent_run_id
hypothesis
changes
metrics
conclusion
```

---

# ‏164. Negative Result הוא Result

‏אם Feature לא עזר — זה ידע.

‏לא מוחקים את הניסוי כאילו לא קרה.

---

# ‏165. `Research Debt`

‏כאשר מריצים מאות וריאציות בלי תיעוד, מאבדים יכולת להבין למה Strategy נראית כמו שהיא נראית.

---

# ‏166. Backtest Fast Enough to Iterate

‏מחקר טוב צריך להיות מספיק מהיר להריץ הרבה ניסויים.

‏אבל מהירות אינה שווה ויתור על Correctness.

---

# ‏167. Caching

‏אפשר Cache ל־Features שאינם משתנים בין ניסויים.

‏למשל:

```text
returns
activity rates
spread_bps
```

‏ואז לשנות רק Score/Filters.

---

# ‏168. Precomputation

‏למערכת שלך Precompute של Anchors/Features יכול לחסוך זמן רב.

---

# ‏169. Dataset Fingerprint

‏כדאי ליצור Hash/Version ל־Dataset.

‏כך יודעים ששתי ריצות באמת השתמשו באותו Input.

---

# ‏170. Code Commit

‏כל Backtest Report צריך לשמור Commit SHA של הקוד.

---

# ‏171. Environment Version

‏גם גרסת Runtime/Dependencies יכולה להשפיע.

‏לכן למחקר רציני שומרים Environment Metadata.

---

# ‏172. Database Snapshot

‏אם המחקר קורא DB שמשתנה תוך כדי, תוצאות לא יהיו Reproducible.

‏עדיף Snapshot או Dataset Immutable.

---

# ‏173. Data Quality Report לפני Backtest

‏לפני הרצה כדאי לדעת:

```text
missing timestamps
duplicate events
out-of-order events
coverage by symbol
feed gaps
session gaps
```

---

# ‏174. Garbage In, Garbage Out

‏Backtest מצוין על Data גרוע עדיין גרוע.

---

# ‏175. Coverage Bias

‏אם Feed היסטורי מכסה טוב רק מניות פעילות, התוצאות יכולות להיות מוטות.

---

# ‏176. Provider Differences

‏Feed A ו־Feed B יכולים להציג Last/Quotes שונים מעט.

‏לכן Dataset Source הוא חלק מה־Experiment.

---

# ‏177. Provider-Agnostic Architecture

‏ה־Backtest Engine לא צריך להיות תלוי ב־Provider אחד.

‏הוא צריך לקבל Canonical Events.

---

# ‏178. Canonical Event Schema

‏למשל:

```text
symbol
event_time
event_type
price
size
bid
ask
bid_size
ask_size
source
```

---

# ‏179. Source Metadata

‏אם Data מגיע מכמה Feeds, שומרים `source`.

---

# ‏180. Live Comparison

‏בעתיד נרצה להשוות:

```text
historical model prediction
paper execution
live execution
```

‏כדי למדוד Simulation Gap.

---

# ‏181. Simulation Gap

‏זה ההבדל בין מה שה־Backtest ציפה לבין מה שקורה בפועל.

---

# ‏182. Backtest Calibration

‏כאשר יש Live Data, משתמשים בו כדי לשפר:

```text
latency assumptions
slippage assumptions
fill assumptions
cost assumptions
```

---

# ‏183. לא להתאים את Backtest כדי “להצדיק” Live

‏אם Live גרוע, לא משנים Assumptions בדיעבד רק כדי לגרום לעבר להיראות תואם.

‏מתעדים שינוי ומריצים Version חדש.

---

# ‏184. Research Freeze

‏לפני מבחן Out-of-Sample כדאי להקפיא:

```text
features
filters
score
entry
exit
cost assumptions
```

---

# ‏185. Forward Test

‏אחרי Backtest מגיע שלב שבו המודל רץ על Data חדש שלא שימש לפיתוח.

---

# ‏186. Shadow / Paper לפני Live

‏Backtest הוא רק שכבה אחת.

‏בהמשך נלמד Replay, Paper ו־Shadow Mode.

---

# ‏187. מה Backtest לא יכול להבטיח

‏הוא לא יכול להבטיח:

- ‏שה־Edge יישאר.
- ‏ש־Fill יהיה זהה.
- ‏ש־Latency יהיה זהה.
- ‏ש־Data Feed יהיה זהה.
- ‏ש־Market Regime יחזור.

---

# ‏188. מה Backtest כן יכול לעשות

‏הוא יכול:

- ‏לפסול רעיונות חלשים.
- ‏לגלות Leakage.
- ‏להשוות Alternatives.
- ‏למדוד Sensitivity.
- ‏לספק RCA.
- ‏למדוד האם Ranking מוסיף מידע.

---

# ‏189. Anti-Pattern — “קניתי ב־Low ומכרתי ב־High”

‏זה אינו Backtest.

‏זו ידיעת העתיד.

---

# ‏190. Anti-Pattern — “אם High הבא עבר Target, נניח Fill”

‏זה עלול להיות אופטימי מדי בלי לדעת את סדר האירועים, Spread, Queue ו־Liquidity.

‏נדון בזה לעומק בשלב 21.

---

# ‏191. Anti-Pattern — Fill ב־Mid ללא הצדקה

‏Mid הוא Benchmark טוב.

‏אבל לא תמיד מחיר בר־ביצוע.

---

# ‏192. Anti-Pattern — Zero Costs

‏במסחר של Edge קטן, זה יכול להפוך אסטרטגיה מפסידה לרווחית על הנייר.

---

# ‏193. Anti-Pattern — Universe של היום

‏זה יוצר Survivorship Bias.

---

# ‏194. Anti-Pattern — Parameter Mining

‏ניסיון של אלפי Configs עד שמשהו נראה טוב אינו הוכחה ל־Edge.

---

# ‏195. Anti-Pattern — למחוק ימים רעים כי “היו חריגים”

‏אם בזמן אמת לא הייתה דרך ידועה מראש להחריג אותם, אסור להסיר אותם בדיעבד.

---

# ‏196. Anti-Pattern — Data Cleaning עם Future Knowledge

‏גם ניקוי Data יכול להכניס Leakage אם הוא משתמש במידע עתידי כדי להחליט איזה Record “לא הגיוני”.

---

# ‏197. Anti-Pattern — Backtest אחד בלבד

‏צריך לראות Stability על Periods, Regimes ו־Assumptions שונות.

---

# ‏198. Best Practice — מודל פשוט קודם

‏בנה Baseline שקל להסביר.

‏רק אז הוסף מורכבות.

---

# ‏199. Best Practice — Separation of Concerns

```text
Data
Features
Filters
Score
Decision
Execution
Costs
Metrics
```

‏כל שכבה נבדקת בנפרד.

---

# ‏200. Best Practice — כל Result צריך להיות Explainable

‏אם אי אפשר להסביר למה Trade הופיע בדוח, המערכת קשה מדי למחקר.

---

# ‏201. התאמה לרובוט שלך

‏עבור המודל שלך נרצה Backtest שמבצע בכל Cycle:

```text
1. advance historical clock
2. update canonical market state
3. compute/update features
4. build eligible universe
5. rank all eligible symbols
6. decide TRADE / NO TRADE
7. if trading allowed: simulate entry
8. manage position
9. simulate exit
10. apply costs
11. record diagnostics
```

---

# ‏202. ה־Target הראשוני שלנו אינו “PnL יומי” בלבד

‏בשלב המחקר הראשון נרצה לדעת:

> ‏כאשר הסורק בוחר #1, האם המניה אכן נוטה לנוע לטובתנו מהר יותר ממניות אחרות?

---

# ‏203. לכן נשמור Forward Outcomes לכל Rank גבוה

‏למשל:

```text
Rank 1
Rank 2
Rank 3
Rank 5
Rank 10
```

‏ולא רק למניה שקנינו.

---

# ‏204. אם Rank #1 לא ממשיכה מהר

‏זה חומר ל־RCA.

‏נבדוק:

- ‏איזה Feature הטעה.
- ‏האם Score היה גבוה בגלל Spike ישן.
- ‏האם Activity נחלשה.
- ‏האם Spread השתנה.
- ‏האם Candidate הייתה כבר “זקנה”.
- ‏האם #2 הייתה טובה יותר.

---

# ‏205. אם היא עלתה רק אחרי 3 דקות

‏זה יכול להיות Signal טוב למסחר אחר.

‏אבל אולי לא למסחר שלך.

‏לכן Horizon חייב להיות חלק מההגדרה.

---

# ‏206. אם היא עלתה 0.30% אבל קודם ירדה 0.40%

‏צריך למדוד Path, לא רק Endpoint.

‏זו הסיבה ל־MFE/MAE ו־Time-to-Target.

---

# ‏207. אם Last עלה אבל Bid לא

‏זה יכול להיות Signal פחות Executable.

‏בשלב 21 נכניס מודל מפורט יותר של Quote/Trade Execution.

---

# ‏208. אם Strategy “רווחית” רק לפני Costs

‏מבחינת רובוט Live היא עדיין לא מוכחת.

---

# ‏209. אם Strategy רגישה ל־10ms

‏צריך לשאול האם תשתית אישית באמת יכולה לעמוד בזה.

---

# ‏210. אם Strategy נשארת טובה גם ב־Latency שמרני

‏זה סימן חזק יותר ל־Robustness.

---

# ‏211. Backtest צריך לעזור לנו לבחור ארכיטקטורה

‏לא רק Parameters.

‏למשל:

```text
scan every 1s vs 5s
wide scan vs deep watch
last-only vs quote-aware
single-stage vs two-stage ranking
```

---

# ‏212. מחקר צריך להיות זול להרצה

‏אם כל Experiment לוקח שעות רבות, קשה לבצע Iteration נכון.

‏לכן Performance של Research Engine הוא Capability אסטרטגי.

---

# ‏213. אבל Accuracy לפני Speed

‏Backtest מהיר ושגוי גרוע יותר מ־Backtest איטי ונכון.

---

# ‏214. רז מקצוע — Debugability היא יתרון תחרותי

‏מערכת שבה אפשר להבין Trade כושל בתוך דקות משתפרת מהר יותר ממערכת Black Box.

---

# ‏215. רז מקצוע — שמור את “העבר כפי שנראה אז”

‏Historical Database איכותי הוא נכס.

‏ככל שאפשר לשחזר State אמיתי, איכות המחקר עולה.

---

# ‏216. רז מקצוע — אל תמדוד רק את Trades שביצעת

‏שמור גם:

```text
Top candidates not selected
NO TRADE snapshots
rejected candidates
```

‏שם נמצאת הרבה אינפורמציה לשיפור.

---

# ‏217. רז מקצוע — Backtest טוב צריך להיות מסוגל להוכיח שהמודל החדש גרוע יותר

‏אם כל שינוי “משפר” משהו, כנראה שהמחקר אינו מספיק קשוח.

---

# ‏218. רז מקצוע — Stable Edge חשוב יותר מ־Peak Backtest

‏אלגוריתם עם:

```text
good-enough results across many periods
```

‏יכול להיות מעניין יותר מאלגוריתם שמבריק בחלון אחד.

---

# ‏219. רז מקצוע — שמור Baseline קבוע

‏אל תזיז את Goalpost בכל ניסוי.

---

# ‏220. רז מקצוע — “לא יודע” הוא Result לגיטימי

‏אם Data אינו מספיק כדי להסיק — לא ממציאים מסקנה.

---

# ‏221. Checklist לפני שמאמינים ל־Backtest

- ‏האם כל Feature משתמש רק בעבר?
- ‏האם Universe היסטורי נכון?
- ‏האם Symbol lifecycle נכון?
- ‏האם Session/Calendar נכון?
- ‏האם Data gaps מטופלים?
- ‏האם `NO TRADE` נשמר?
- ‏האם Position state נשמר?
- ‏האם Entry/Exit מתרחשים רק אחרי Decision?
- ‏האם Costs קיימות?
- ‏האם Assumptions כתובות?
- ‏האם Run Reproducible?
- ‏האם יש Out-of-Sample?
- ‏האם יש Diagnostics לפי Rank?
- ‏האם יש Trade/Signal Ledger?

---

# ‏222. Checklist לכל Trade

```text
signal_time
as_of_time
symbol
rank
score
score_gap
feature_snapshot
decision
entry_order_time
entry_fill_time
entry_fill_price
exit_reason
exit_order_time
exit_fill_time
exit_fill_price
gross_pnl
costs
net_pnl
MFE
MAE
time_to_first_profit
time_to_target
```

---

# ‏223. Baseline מומלץ למחקר הראשוני שלנו

‏גרסה ראשונית יכולה להיות:

```text
Historical canonical market data
→ 1-second research snapshots
→ current filters
→ current features
→ rank all eligible symbols
→ save Top 20
→ save forward outcomes at 1/2/5/10/30/60s
→ no execution assumptions yet
```

‏כך קודם נבדוק את ה־Scanner עצמו.

---

# ‏224. שלב שני של אותו Research

‏לאחר שיש Evidence שה־Ranking טוב:

```text
add simple entry latency
add executable quote assumption
add explicit costs
add exit policy
```

---

# ‏225. שלב שלישי

‏רק אז:

```text
partial fills
queue approximation
cancel/replace
order lifetime
microstructure-aware execution
```

‏זה יהיה עיקר שלב 21.

---

# ‏226. למה הסדר הזה חשוב

‏אם מתחילים מיד במנוע Execution מורכב, אפשר לבזבז שבועות על סימולציה של Strategy שאין לה Signal Edge בכלל.

---

# ‏227. סדר המחקר הנכון

```text
Does the signal predict?
↓
Does ranking improve selection?
↓
Is the move fast enough?
↓
Is it executable?
↓
Does it survive costs?
↓
Is it robust out-of-sample?
↓
Can it survive live conditions?
```

---

# ‏228. המשפט החשוב ביותר בפרק

> ‏`Backtest` אינו מכונה שמספרת כמה כסף “היינו עושים”. הוא ניסוי שמנסה לשחזר בצורה הוגנת מה האלגוריתם היה יודע, בוחר ומבצע באותו רגע היסטורי.

---

# ‏229. מה צריך לזכור

1. ‏העתיד לעולם לא נכנס ל־Feature.
2. ‏Universe חייב להיות Point-in-Time.
3. ‏Decision, Order ו־Fill הם אירועים שונים.
4. ‏Forward Return אינו PnL.
5. ‏Signal Backtest ו־Execution Backtest הם שכבות שונות.
6. ‏כל Run חייב להיות Reproducible.
7. ‏כל Trade חייב להיות Explainable.
8. ‏`NO TRADE` הוא חלק אמיתי מהאסטרטגיה.
9. ‏Costs ו־Execution assumptions חייבות להיות מפורשות.
10. ‏Backtest טוב מספק Evidence — לא הבטחה.

---

# ‏230. בדיקה עצמית

‏אם אתה מסוגל לענות על השאלות הבאות, הפרק הושג:

1. ‏מה ההבדל בין `Feature` ל־`Label`?
2. ‏מהו `Look-Ahead Bias`?
3. ‏למה Universe של היום אינו מתאים ל־Backtest של לפני שנתיים?
4. ‏למה מחיר “הקרוב ביותר” ל־Anchor יכול להיות שגיאה?
5. ‏למה Forward Return אינו PnL?
6. ‏למה חשוב להפריד Signal Backtest מ־Execution Backtest?
7. ‏מהו `as_of_time`?
8. ‏למה צריך לשמור Top N ולא רק Rank #1?
9. ‏למה `NO TRADE` חייב להופיע גם ב־Backtest?
10. ‏אילו Metadata נדרשים כדי לשחזר Run בדיוק?
11. ‏למה Backtest רווחי עדיין אינו הוכחה ל־Edge עתידי?
12. ‏מה צריך לבדוק קודם: Prediction או Execution?

---

# ‏Checkpoint

‏בשלב הזה אנחנו יודעים מהו Backtest הוגן ברמת Timeline, Data, Universe, Decision, Labels, State ו־Reproducibility.

‏השלב הבא הוא **21 — Backtest ריאליסטי למסחר של שניות**: איך מדמים `Bid/Ask`, Spread, latency, Fill, Partial Fill, Queue, order lifetime, cancel/replace ו־Slippage בצורה שלא נותנת לאסטרטגיה “מחירי קסם” שלא היו באמת זמינים.