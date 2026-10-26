# ‏שלב 13 — `Feature Engineering`: איך להפוך נתוני שוק למדדים שבאמת עוזרים לסורק

> ‏מטרת הפרק: להבין איך לוקחים `Raw Market Data` — עסקאות, מחירים, `Bid/Ask`, נפח וזמן — והופכים אותו ל־`Features` שהסורק יכול להשוות בין אלפי מניות.
>
> ‏כמו בכל הקורס: קודם נלמד את התמונה המקצועית הכללית, אחר כך את ה־Best Practices ורזי המקצוע, ולבסוף נתאים את הדברים לרובוט שלך — סריקה של כל השוק, דירוג מתמשך, והחזקה של שניות בודדות ועד בערך דקה.

---

# ‏1. מה זה בכלל `Feature`?

‏`Feature` הוא מספר או ערך שמתאר משהו על מצב המניה ברגע מסוים.

‏לדוגמה:

```text
change_5s      = +0.12%
change_30s     = +0.45%
trades_5s      = 83
volume_10s     = 18,400
spread_pct     = 0.025%
quote_age_ms   = 42
```

‏כל שורה כזאת היא `Feature`.

‏הרובוט לא באמת מבין גרף.

‏הוא מבין ערכים.

---

# ‏2. ההבדל בין `Raw Data` ל־`Feature`

‏`Raw Data` הוא מה שהגיע מהשוק.

‏לדוגמה:

```text
Trade: 100.05 × 200
Trade: 100.07 × 100
Bid:   100.06 × 500
Ask:   100.08 × 400
```

‏`Feature` הוא משהו שחישבנו מתוך המידע הזה.

‏למשל:

```text
spread_abs = 0.02
spread_pct = 0.01999%
mid        = 100.07
trades_1s  = 2
volume_1s  = 300
```

---

# ‏3. למה `Feature Engineering` חשוב כל כך?

‏כי ה־`Score` יכול לעבוד רק עם מה שנתנו לו.

‏אם אנחנו מודדים רק:

```text
change_30s
```

‏אז הסורק יודע רק מי עלתה הכי הרבה ב־30 שניות.

‏אם נוסיף:

```text
change_5s
change_10s
acceleration
trade_rate
spread_pct
activity_acceleration
path_efficiency
```

‏הוא יכול להבדיל בין סוגים שונים של תנועה.

---

# ‏4. Feature טוב צריך לענות על שאלה

‏אל תיצור Feature רק משום שאפשר.

‏לכל Feature צריך להיות רעיון ברור.

‏לדוגמה:

```text
change_5s
```

‏שאלה:

> ‏כמה המניה זזה בחמש השניות האחרונות?

```text
activity_acceleration
```

‏שאלה:

> ‏האם קצב העסקאות מתחזק עכשיו?

```text
spread_pct
```

‏שאלה:

> ‏כמה יקר יחסית לבצע עסקה במחיר הנוכחי?

---

# ‏5. Feature אינו חייב להיות Indicator מוכר

‏הרבה אנשים חושבים על:

```text
RSI
MACD
EMA
Bollinger Bands
```

‏אלה Features אפשריים.

‏אבל Feature יכול להיות גם משהו הרבה יותר ישיר:

```text
trades_last_3s
ask_size_change_1s
seconds_since_last_trade
spread_change_2s
return_latest_2s_minus_previous_2s
```

‏למערכת שלך דווקא Features פשוטים ומהירים יכולים להיות רלוונטיים מאוד.

---

# ‏6. ארבע משפחות בסיסיות של Features

‏נוח לחשוב על Features בארבע משפחות:

1. ‏מחיר ותנועה.
2. ‏פעילות ונפח.
3. ‏נזילות וביצוע.
4. ‏זמן ואיכות נתונים.

‏בהמשך נוסיף גם Context ו־Interactions.

---

# ‏7. Features של מחיר

‏דוגמאות:

```text
return_1s
return_2s
return_5s
return_10s
return_30s
return_60s
```

‏אפשר גם לחשב:

```text
high_10s
low_10s
range_10s
position_in_range_10s
```

---

# ‏8. `Position in Range`

‏נניח שב־10 שניות האחרונות:

```text
Low  = 99.80
High = 100.20
Now  = 100.18
```

‏המניה נמצאת קרוב מאוד לקצה העליון של הטווח.

‏אפשר לחשב:

```text
position_in_range = (Now - Low) / (High - Low)
```

‏ערך קרוב ל־1 אומר שהמחיר קרוב לשיא החלון.

---

# ‏9. Features של צורת תנועה

‏מהשלבים הקודמים אפשר ליצור:

```text
velocity_5s
velocity_10s
acceleration_5s
path_efficiency_10s
positive_step_ratio
reversal_count
```

‏המטרה היא לתאר לא רק כמה המחיר השתנה, אלא איך הוא הגיע לשם.

---

# ‏10. Features של פעילות

‏דוגמאות:

```text
trades_1s
trades_5s
trades_10s
volume_1s
volume_5s
volume_10s
dollar_volume_10s
```

‏אלה מתארים כמה מסחר התרחש לאחרונה.

---

# ‏11. `Trade Rate`

‏במקום רק:

```text
trades_10s = 100
```

‏אפשר לחשב:

```text
trade_rate = 100 / 10 = 10 trades/sec
```

‏זה שימושי כאשר משווים חלונות שונים.

---

# ‏12. `Dollar Volume`

‏`Volume` מודד מניות.

‏`Dollar Volume` מודד בערך כמה כסף עבר.

```text
dollar_volume ≈ traded_shares × average_price
```

‏כך אפשר להשוות טוב יותר מניה של $5 למניה של $200.

---

# ‏13. Features של נזילות

‏דוגמאות:

```text
spread_abs
spread_pct
bid_size
ask_size
top_book_notional_bid
top_book_notional_ask
```

‏אפשר גם לבנות:

```text
order_size / ask_size
```

‏כדי להבין כמה מהכמות הגלויה אתה עומד לצרוך.

---

# ‏14. `Spread` באחוזים עדיף לעיתים על סנטים

‏נניח:

```text
AAA price = $5
spread    = $0.02

BBB price = $200
spread    = $0.02
```

‏אותם שני סנטים.

‏אבל ביחס למחיר המניה הם שונים מאוד.

‏לכן:

```text
spread_pct = spread / mid_price
```

‏יכול להיות Feature השוואתי טוב יותר.

---

# ‏15. Features של זמן

‏דוגמאות:

```text
trade_age_ms
quote_age_ms
time_since_last_trade_ms
time_since_momentum_started
time_since_peak_velocity
```

‏במסחר של שניות, זמן הוא Feature אמיתי ולא Metadata בלבד.

---

# ‏16. Feature של טריות

‏נניח:

```text
quote_age_ms = 20
```

‏לעומת:

```text
quote_age_ms = 4200
```

‏אותו Bid/Ask יכול להיות שימושי במקרה הראשון וחסר משמעות במקרה השני.

---

# ‏17. Features יחסיים עדיפים לעיתים על מוחלטים

‏לדוגמה:

```text
trades_10s = 100
```

‏נשמע פעיל.

‏אבל אם בדרך כלל יש למניה 1,000 עסקאות ב־10 שניות — זה דווקא חלש.

‏לכן אפשר לחשב:

```text
relative_trade_rate
```

‏כלומר:

> ‏כמה הפעילות עכשיו חריגה ביחס לפעילות הרגילה שלה.

---

# ‏18. `Relative Volume` / `RVOL`

‏`RVOL` הוא רעיון כללי של השוואת הפעילות הנוכחית לרמה רגילה או צפויה.

‏למשל:

```text
current_volume_rate / typical_volume_rate
```

‏אם התוצאה:

```text
3.0
```

‏הפעילות בערך פי שלושה מהרגיל לפי ההגדרה שבחרנו.

---

# ‏19. חשוב להתחשב בשעת היום

‏פעילות ב־09:31 אינה דומה לפעילות ב־13:30.

‏לכן Baseline טוב יכול להיות:

> ‏מה הפעילות הרגילה במניה **בשעה הזאת של היום**.

‏לא רק ממוצע יומי כללי.

---

# ‏20. `Cross-Sectional Features`

‏המערכת שלך משווה את כל השוק באותו רגע.

‏לכן אפשר לחשב:

```text
momentum_rank
trade_rate_rank
spread_rank
liquidity_rank
```

‏או:

```text
momentum_percentile = 99.6
```

‏כלומר המניה חזקה יותר מ־99.6% מהמניות כרגע לפי המדד הזה.

---

# ‏21. למה Rank יכול להיות שימושי

‏נניח ביום שקט:

```text
+0.10% in 10s
```

‏יכול להיות קיצוני מאוד.

‏ביום סוער זה אולי רגיל.

‏Rank אומר:

> ‏כמה המניה יוצאת דופן ביחס לכל האחרות **כרגע**.

---

# ‏22. `Normalization`

‏`Normalization` = להפוך מדדים שונים לקנה מידה שקל להשוות.

‏נניח:

```text
change_10s = 0.25
trades_10s = 180
spread_pct = 0.03
```

‏אי אפשר פשוט לחבר אותם.

‏היחידות שונות.

---

# ‏23. `Min-Max Scaling`

‏דרך אחת היא למפות ערכים לטווח:

```text
0..1
```

‏אבל זו שיטה רגישה לערכים קיצוניים.

‏אם מניה אחת חריגה מאוד, כל השאר עלולות להידחס לאזור קטן.

---

# ‏24. `Z-Score`

‏`Z-Score` שואל:

> ‏כמה סטיות תקן הערך רחוק מהממוצע?

‏בפשטות:

```text
z = (value - mean) / std
```

‏זה שימושי בחלק מהמקרים, אבל פחות יציב אם ההתפלגות מאוד חריגה או משתנה מהר.

---

# ‏25. `Percentile` הוא לעיתים פשוט ועמיד יותר

‏במקום להניח התפלגות מסוימת, אפשר לשאול:

```text
באיזה אחוזון המניה נמצאת?
```

‏לדוגמה:

```text
99th percentile
```

‏כלומר היא חזקה כמעט יותר מכל השוק לפי Feature מסוים.

---

# ‏26. Features של `Delta`

‏`Delta` = שינוי במדד עצמו.

‏לדוגמה:

```text
spread_now - spread_2s_ago
```

‏או:

```text
trade_rate_now - trade_rate_previous_window
```

‏זה עוזר להבין האם תנאי השוק משתפרים או מדרדרים.

---

# ‏27. Features של Ratio

‏לדוגמה:

```text
latest_5s_return / previous_5s_return
```

‏או:

```text
buy_size / sell_size
```

‏Ratios יכולים לתאר יחסים, אבל צריך להיזהר מחלוקה במספר קטן מאוד.

---

# ‏28. בעיית חלוקה באפס

‏אם מחשבים:

```text
A / B
```

‏ו־`B` קרוב לאפס, נקבל ערך עצום ולא יציב.

‏לכן צריך להגדיר מראש:

- ‏מה עושים כשמכנה = 0.
- ‏מה עושים כשהמכנה זעיר.
- ‏האם עושים clipping.
- ‏האם Feature כזה בכלל יציב מספיק.

---

# ‏29. `Clipping`

‏`Clipping` = הגבלת ערך לטווח מקסימלי/מינימלי.

‏לדוגמה:

```text
raw_ratio = 87
clipped_ratio = 10
```

‏זה יכול למנוע מ־outlier אחד להשתלט על Score.

‏אבל צריך לתעד את הגבול ולא להסתיר מידע בלי סיבה.

---

# ‏30. `Winsorization`

‏רעיון דומה הוא להחליף ערכים קיצוניים בערכי גבול סטטיסטיים.

‏זה נפוץ בעיבוד נתונים, אבל לא תמיד נכון ל־real-time trading.

‏אם דווקא אירוע קיצוני הוא מה שאנחנו מחפשים, Winsorization אגרסיבי עלול למחוק את האות.

---

# ‏31. `Rolling Window`

‏רוב Features אצלך יהיו על חלון מתגלגל.

‏לדוגמה:

```text
trades_10s
```

‏פירושו:

> ‏כמה עסקאות התרחשו בין `NOW-10s` לבין `NOW`.

‏בכל רגע החלון זז.

---

# ‏32. חלונות שונים מספרים סיפורים שונים

```text
1s  → מה קורה ממש עכשיו
5s  → מה קרה לאחרונה מאוד
10s → האם זה מחזיק קצת יותר
30s → הקשר רחב יותר
60s → הקשר רחב עוד יותר
```

‏אין חלון “נכון” אחד לכל דבר.

---

# ‏33. לא כל Feature צריך את אותם חלונות

‏לדוגמה:

‏ל־momentum אולי נרצה:

```text
1s, 2s, 5s, 10s, 30s, 60s
```

‏ל־spread אולי מספיק:

```text
now, avg_2s, max_5s
```

‏ל־daily context אולי נרצה דקות או שעות.

---

# ‏34. Feature duplication

‏נניח שיש לנו:

```text
change_5s
velocity_5s
```

‏אם:

```text
velocity_5s = change_5s / 5
```

‏הם למעשה מכילים כמעט אותו מידע.

‏שני שמות אינם שני Signals.

---

# ‏35. Correlated Features

‏Features רבים יכולים להיות מאוד דומים.

‏לדוגמה:

```text
return_9s
return_10s
return_11s
```

‏יכול להיות שהם כמעט אותו דבר.

‏יותר Features אינם בהכרח יותר חכמה.

---

# ‏36. `Feature Explosion`

‏קל מאוד לייצר:

```text
100 windows
× 20 metrics
× 10 transformations
= 20,000 features
```

‏זה נשמע עשיר.

‏אבל יוצר:

- ‏יותר רעש.
- ‏יותר Overfitting.
- ‏יותר זמן חישוב.
- ‏יותר קושי להבין למה המערכת החליטה.

---

# ‏37. Best Practice: להתחיל ממשפחות, לא מאלפי Features

‏גישה טובה:

```text
Price
Activity
Liquidity
Timing
Context
```

‏בכל משפחה בוחרים מעט Features הגיוניים.

‏אחר כך מודדים אם כל תוספת באמת משפרת תוצאה.

---

# ‏38. `Interactions`

‏לפעמים Feature אחד משמעותי רק יחד עם Feature אחר.

‏לדוגמה:

```text
high_momentum AND low_spread
```

‏יכול להיות יותר מעניין מאשר:

```text
high_momentum
```

‏לבד.

---

# ‏39. דוגמת Interaction פשוטה

‏נניח:

```text
momentum = 0.40%
spread   = 0.30%
```

‏המומנטום חזק, אבל עלות הביצוע גבוהה.

‏לעומת:

```text
momentum = 0.30%
spread   = 0.01%
```

‏ייתכן שהמניה השנייה טובה יותר לעסקה אמיתית.

---

# ‏40. Feature של `Executable Momentum`

‏אפשר להמציא Feature רעיוני כמו:

```text
expected_short_move - estimated_execution_cost
```

‏זה כבר משלב Signal עם עלות ביצוע.

‏לא חייבים להשתמש בנוסחה הזאת בדיוק.

‏העיקרון הוא לחשוב על מה שנשאר אחרי חיכוך.

---

# ‏41. Context Features

‏אותו Feature יכול להתנהג אחרת בהקשרים שונים.

‏אפשר לשמור למשל:

```text
seconds_from_open
market_index_return_1m
market_volatility_state
session
```

‏אלה לא מתארים רק את המניה, אלא את הסביבה שלה.

---

# ‏42. `Market Relative Momentum`

‏אם כל השוק עולה מהר, מניה שעולה 0.20% אולי אינה מיוחדת.

‏אפשר לחשב:

```text
stock_return_10s - market_return_10s
```

‏וכך לראות כמה היא חזקה יחסית לשוק.

---

# ‏43. `Sector Relative` / קבוצת השוואה

‏אפשר להשוות גם מול קבוצה דומה:

```text
stock_return - sector_return
```

‏אבל זה כבר מוסיף מורכבות.

‏לא מוסיפים רק משום שזה נשמע מקצועי.

---

# ‏44. Feature צריך להיות זמין בזמן ההחלטה

‏זה כלל קריטי.

‏אם Feature משתמש במידע שהגיע אחרי רגע ההחלטה — יש `Leakage`.

‏לדוגמה:

‏בשעה:

```text
10:00:00.000
```

‏אסור ל־Feature להשתמש בעסקה שקרתה:

```text
10:00:00.100
```

‏גם אם היא קיימת בקובץ ההיסטורי.

---

# ‏45. `Look-Ahead Bias`

‏`Look-Ahead Bias` הוא מצב שבו המחקר משתמש בטעות בעתיד.

‏זה אחד הבאגים המסוכנים ביותר ב־Algo Research.

‏כי התוצאות יכולות להיראות מצוינות — אבל בלתי אפשריות בעולם האמיתי.

---

# ‏46. `Feature Leakage`

‏Leakage יכול להתרחש גם בצורה פחות ברורה.

‏לדוגמה:

‏אם מחשבים ממוצע יומי מלא שמכיל גם את סוף היום, ואז משתמשים בו בהחלטה ב־10:00 בבוקר.

‏המערכת קיבלה מידע מהעתיד בלי שהתכוונו.

---

# ‏47. חוק As-Of

‏לכל Feature צריך להיות כלל:

> ‏הערך מחושב אך ורק ממידע שהיה ידוע עד `decision_time`.

‏זה נקרא חשיבה של:

`As-Of Time`

---

# ‏48. Feature timestamps

‏כדאי לדעת לא רק:

```text
feature_value
```

‏אלא גם:

```text
feature_asof_time
source_event_time
computed_at
```

‏כך אפשר לחקור בעיות תזמון.

---

# ‏49. Missing Feature אינו בהכרח אפס

‏אם אין לנו `Bid`, זה לא אומר:

```text
bid = 0
```

‏ואם אין מספיק היסטוריה ל־`change_60s`, זה לא אומר:

```text
change_60s = 0
```

‏צריך לשמור:

```text
missing
```

‏או Validity Flag מתאים.

---

# ‏50. Missingness עצמה יכולה להיות מידע

‏לפעמים העובדה שחסר מידע מספרת משהו.

‏לדוגמה:

> ‏אין Trade חדש כבר 8 שניות.

‏זה שונה מאוד ממניה עם מחיר שלא השתנה אבל עם עשרות עסקאות.

‏לכן אפשר ליצור Features כמו:

```text
time_since_last_trade
```

---

# ‏51. `Feature Validity`

‏לכל Feature אפשר לשמור:

```text
value
is_valid
age
reason_if_invalid
```

‏זה יותר בטוח מאשר להכניס מספר מזויף.

---

# ‏52. Real-Time Feature Engineering

‏ב־Backtest אפשר לחשב הכול בדיעבד.

‏ב־Live Trading צריך לחשב תוך כדי זרימה.

‏לכן Feature טוב עבורנו צריך להיות גם:

- ‏מהיר לחישוב.
- ‏ניתן לעדכון Incremental.
- ‏לא דורש סריקה מחדש של כל ההיסטוריה בכל Tick.

---

# ‏53. `Incremental Computation`

‏במקום לחשב מחדש:

```text
trades_10s
```

‏מכל ההיסטוריה בכל פעם, אפשר לשמור Queue של אירועים בחלון.

‏כאשר Trade חדש מגיע:

1. ‏מוסיפים אותו.
2. ‏מסירים אירועים ישנים מ־10 שניות.
3. ‏מעדכנים Count וסכום.

‏כך העלות נמוכה בהרבה.

---

# ‏54. למה זה חשוב בסריקה של כל השוק

‏אם יש 4,000 מניות וכל אחת מקבלת עדכונים רבים, חישוב כבד לכל Update יכול ליצור Backpressure.

‏לכן העיקרון הוא:

> ‏Precompute incrementally, rank cheaply.

---

# ‏55. Feature Cache

‏אפשר לשמור לכל Symbol State כזה:

```text
symbol
last_price
returns
trade_counts
volumes
spread
liquidity
feature_timestamp
```

‏ואז ה־Scanner לא מחשב הכול מחדש.

‏הוא קורא את המצב המחושב האחרון.

---

# ‏56. `Feature Store` — בהסבר פשוט

‏`Feature Store` הוא מקום מסודר שבו Features נשמרים בצורה עקבית.

‏לא חייבים מערכת Enterprise.

‏אצלך זה יכול להיות פשוט:

- ‏מבנה זיכרון ל־Live.
- ‏טבלה/DB למחקר.
- ‏Schema קבוע.
- ‏Feature version.

---

# ‏57. Live ו־Backtest חייבים לחשב אותו דבר

‏זה Best Practice קריטי.

‏אנחנו לא רוצים:

```text
Backtest Feature Code A
Live Feature Code B
```

‏כי אפילו הבדל קטן יכול ליצור תוצאות שונות.

‏עדיף להשתמש באותה הגדרה ואותה לוגיקה ככל האפשר.

---

# ‏58. `Training-Serving Skew`

‏זה שם מקצועי לפער בין מה שחישבנו במחקר לבין מה שקורה ב־Live.

‏למשל:

- ‏ב־Backtest השתמשנו Tick-by-Tick.
- ‏ב־Live יש Snapshot כל שנייה.

‏אז Feature בעל אותו שם יכול למעשה להיות שונה.

---

# ‏59. Feature Definitions צריכות להיות מדויקות

‏לא לכתוב רק:

```text
momentum_10s
```

‏אלא להגדיר:

```text
source_price      = last_trade
anchor_rule       = nearest_at_or_before(now-10s)
return_formula    = pct_change
missing_tolerance = 2s
session_scope     = RTH
```

‏כך אין ויכוח מה Feature אומר.

---

# ‏60. `Feature Versioning`

‏אם שינית נוסחה, זה Feature חדש.

‏לדוגמה:

```text
momentum_10s_v1
momentum_10s_v2
```

‏או Metadata של גרסה.

‏כך אפשר לשחזר למה Score השתנה.

---

# ‏61. Feature Names צריכים לשאת משמעות

‏עדיף:

```text
trade_count_5s
```

‏מאשר:

```text
x17
```

‏במערכת מחקרית, שמות ברורים חוסכים טעויות עצומות.

---

# ‏62. Feature Registry

‏כדאי להחזיק טבלה שמתארת כל Feature:

| Feature | משמעות | מקור | חלון | יחידה | גרסה |
|---|---|---|---|---|---|
| `return_5s` | שינוי מחיר | Trades | 5s | % | v1 |
| `trade_rate_5s` | קצב עסקאות | Trades | 5s | trades/s | v1 |
| `spread_pct` | מרווח יחסי | Quotes | now | % | v1 |

‏זה הופך להיות מילון השפה של הסורק.

---

# ‏63. Feature טוב אינו בהכרח Feature מנבא

‏`spread_pct` הוא Feature שימושי מאוד.

‏אבל הוא אולי לא מנבא שהמחיר יעלה.

‏הוא יכול להיות Feature של:

```text
executability
```

‏ולא של:

```text
direction prediction
```

‏חשוב להפריד בין תפקידים.

---

# ‏64. משפחות תפקידים של Features

‏אפשר לסווג:

```text
Signal Features
Execution Features
Risk Features
Context Features
Data Quality Features
```

‏לא חייבים לדחוף את כולם לאותו Score.

---

# ‏65. `Signal Feature`

‏מנסה לענות:

> ‏האם יש סיכוי לתנועה חיובית בהמשך?

‏למשל:

```text
return_5s
acceleration
activity_acceleration
```

---

# ‏66. `Execution Feature`

‏מנסה לענות:

> ‏האם אפשר לבצע את העסקה במחיר סביר?

‏למשל:

```text
spread_pct
ask_size
quote_age
```

---

# ‏67. `Risk Feature`

‏מנסה לענות:

> ‏כמה מסוכן המצב?

‏למשל:

```text
recent_range
volatility_10s
max_drawdown_30s
```

---

# ‏68. `Context Feature`

‏מנסה לענות:

> ‏באיזה סוג סביבה אנחנו?

‏למשל:

```text
time_of_day
market_direction
market_volatility
session
```

---

# ‏69. `Data Quality Feature`

‏מנסה לענות:

> ‏כמה אפשר לסמוך על המידע?

‏למשל:

```text
quote_age_ms
missing_tick_count
feed_gap_ms
```

---

# ‏70. למה לא כדאי לערבב הכול מוקדם מדי

‏אם Score כולל 50 דברים בלי להבין מה תפקידם, קשה לדעת:

- ‏למה מניה קיבלה ציון גבוה.
- ‏איזה Feature עזר.
- ‏איזה Feature הרס.
- ‏איך לשפר את המערכת.

‏לכן בהמשך נלמד Sub-Scores.

---

# ‏71. Feature usefulness צריך להימדד

‏לכל Feature נשאל:

```text
כאשר הערך שלו גבוה/נמוך — מה קורה אחר כך?
```

‏לדוגמה:

```text
Feature bucket 1 → forward_return_5s average
Feature bucket 2 → forward_return_5s average
...
Feature bucket 10 → forward_return_5s average
```

---

# ‏72. `Bucket Analysis`

‏מחלקים את Feature לקבוצות.

‏למשל `trade_rate`:

```text
0-10 percentile
10-20
...
90-100
```

‏ואז בודקים מה קרה אחרי 1/2/5/10/30/60 שניות בכל קבוצה.

‏כך רואים אם יש קשר שימושי.

---

# ‏73. `Monotonicity`

‏Feature אידאלי לפעמים מציג קשר ברור:

```text
higher feature → better future result
```

‏אבל המציאות לא תמיד כזאת.

‏יכול להיות:

```text
low = bad
medium = good
extreme = bad
```

‏זה קשר לא־ליניארי.

---

# ‏74. Nonlinear Features

‏לכן לפעמים:

```text
more is better
```

‏היא הנחה שגויה.

‏לדוגמה Momentum קיצוני מאוד יכול לפעמים לייצג מהלך שכבר התעייף.

‏צריך למדוד ולא להניח.

---

# ‏75. `Ablation Test`

‏`Ablation` = מסירים Feature ורואים מה קרה.

‏לדוגמה:

```text
Model A = momentum + activity + spread
Model B = momentum + spread
```

‏אם אין הבדל, אולי Activity Feature לא מוסיף מספיק.

---

# ‏76. One-Feature-at-a-Time

‏דרך פשוטה למחקר מוקדם:

1. ‏בונים Baseline.
2. ‏מוסיפים Feature אחד.
3. ‏בודקים שינוי.
4. ‏מתעדים.

‏כך יודעים מה באמת עזר.

---

# ‏77. למה “ה־AI מצא 30 Features” אינו מספיק

‏`AI` יכול להציע רעיונות מצוינים.

‏אבל כל Feature עדיין צריך לעבור:

```text
Definition
Correctness
No leakage
Stability
Cost
Predictive test
Execution relevance
```

---

# ‏78. Feature צריך להצדיק את עלות החישוב שלו

‏Feature שדורש:

- ‏Level 2 מלא.
- ‏חישוב כבד.
- ‏Latency גבוה.

‏צריך להוכיח שהוא נותן שיפור מספיק.

‏אם Feature פשוט נותן כמעט אותה תוצאה — הפשוט עדיף.

---

# ‏79. `Cost of Feature`

‏לכל Feature אפשר לחשוב על עלות:

```text
Data cost
CPU cost
Memory cost
Latency cost
Complexity cost
Debugging cost
```

‏זו חשיבה חשובה מאוד במערכת אמיתית.

---

# ‏80. Features בזמן החלטה לעומת בזמן Position

‏לפני קנייה אולי נרצה:

```text
momentum
activity
spread
liquidity
signal_age
```

‏אחרי קנייה ייתכן שנרצה גם:

```text
momentum_decay
bid_deterioration
spread_expansion
time_in_position
```

‏כלומר Feature set יכול להשתנות לפי State.

---

# ‏81. Features מיוחדים לרובוט שלך

‏לשיטה שלך הייתי רוצה לחקור לפחות משפחות כאלה:

```text
Immediate momentum
Momentum acceleration
Activity acceleration
Trade density
Path consistency
Spread quality
Top-of-book capacity
Freshness
Relative rank
Signal age
```

‏לא משום שכולם בהכרח טובים — אלא משום שהם עונים על שאלות רלוונטיות למסחר של שניות.

---

# ‏82. `Time-to-First-Profit` כ־Target למחקר Features

‏אצלך Feature יכול להיות שימושי גם אם הוא לא מנבא רווח גדול.

‏יכול להיות שהוא מנבא:

> ‏האם המחיר ייתן אפילו יתרון קטן מאוד בתוך כמה שניות.

‏לכן נבדוק:

```text
P(first_profit <= 1s)
P(first_profit <= 2s)
P(first_profit <= 5s)
P(first_profit <= 10s)
```

---

# ‏83. Feature טוב לאסטרטגיה שלך יכול להיות שונה מ־Feature טוב למסחר יומי רגיל

‏לדוגמה:

‏`RSI` על 14 נרות של שעה יכול להיות שימושי בהקשר מסוים.

‏אבל הוא לא בהכרח רלוונטי להחלטה שאמורה להתממש תוך 5 שניות.

‏הפוך גם נכון:

‏`trade_rate_2s` יכול להיות קריטי אצלך וכמעט חסר חשיבות למשקיע שבועי.

---

# ‏84. ועדיין לומדים את הידע הכללי

‏העיקרון שלנו הוא לא להתעלם ממדדים כלליים.

‏נלמד בהמשך גם Indicators מוכרים, Technical Analysis, Volatility, VWAP ועוד.

‏אבל תמיד נשאל:

> ‏באיזה Horizon המדד נבנה, ובאיזה Horizon אנחנו מנסים לקבל החלטה?

---

# ‏85. Feature Drift

‏Feature שעבד בחודש אחד יכול לשנות התנהגות.

‏לדוגמה:

```text
trade_rate > 50
```

‏יכול להיות חריג בתקופה אחת ורגיל בתקופה אחרת.

‏לכן צריך לעקוב אחר התפלגות Features לאורך זמן.

---

# ‏86. `Distribution Drift`

‏אם בעבר:

```text
median spread_pct = 0.03%
```

‏והיום:

```text
median spread_pct = 0.08%
```

‏משהו השתנה.

‏זה יכול להיות שוק אחר, Universe אחר, Feed אחר או Bug.

---

# ‏87. Feature Monitoring ב־Production

‏כדאי לנטר לפחות:

```text
min
max
median
p90
p99
missing_rate
invalid_rate
```

‏ל־Features חשובים.

---

# ‏88. Feature Debugging

‏אם מניה קיבלה Rank #1, אנחנו צריכים להיות מסוגלים לראות:

```text
return_5s = ?
return_10s = ?
acceleration = ?
trade_rate = ?
spread_pct = ?
quote_age = ?
```

‏בלי זה קשה לעשות RCA אמיתי.

---

# ‏89. Feature Snapshot לכל החלטה

‏Best Practice:

> ‏לשמור את כל ה־Features שהיו קיימים בדיוק ברגע ההחלטה.

‏כך אפשר לשחזר בדיעבד למה נבחרה המניה.

---

# ‏90. `Decision Feature Vector`

‏אפשר לשמור רשומה כמו:

```text
symbol = XYZ
decision_time = ...
feature_version = v12
return_5s = ...
return_10s = ...
trade_rate_5s = ...
spread_pct = ...
...
```

‏זו “תמונת המוח” של הסורק באותו רגע.

---

# ‏91. חשוב לשמור גם מועמדות שלא נבחרו

‏אם שומרים רק את Top 1, אי אפשר להבין:

- ‏למה מקום 2 היה אולי טוב יותר.
- ‏האם Score באמת מדרג נכון.
- ‏מה מאפיין מניות שנדחו.

‏לכן למחקר כדאי לשמור לפחות Top N ולעיתים את כל Universe המסונן.

---

# ‏92. Feature Importance אינה הוכחה סופית

‏במודלים מסוימים אפשר לקבל `Feature Importance`.

‏אבל Importance לא אומר בהכרח:

> ‏ה־Feature גורם לתוצאה.

‏הוא רק אומר שהמודל השתמש בו בדרך מסוימת.

---

# ‏93. Correlation אינה Causation

‏אם Activity גבוהה קשורה ל־Forward Return טוב, זה עדיין לא אומר שפעילות “גורמת” לעלייה.

‏אבל לצורך Prediction אנחנו לא תמיד צריכים סיבתיות מלאה.

‏אנחנו כן צריכים:

- ‏קשר יציב.
- ‏ללא Leakage.
- ‏יכולת להישאר חי אחרי עלויות.

---

# ‏94. Feature Stability חשובה

‏Feature טוב למחקר צריך לעבוד לא רק:

- ‏ביום אחד.
- ‏במניה אחת.
- ‏בשבוע אחד.

‏אלא להראות ערך על תקופות ומצבים שונים.

---

# ‏95. `Robustness Test`

‏נבדוק למשל:

```text
Opening hour
Midday
Closing hour
High-volatility days
Quiet days
Different price buckets
Different liquidity buckets
```

‏ונראה אם Feature עדיין מועיל.

---

# ‏96. Feature יכול להיות טוב רק ב־Regime מסוים

‏זה לא בהכרח רע.

‏למשל:

> ‏Acceleration עובד טוב בפתיחה אבל לא בצהריים.

‏אז אולי לא מוחקים אותו.

‏אולי הופכים אותו ל־Regime-aware Feature.

---

# ‏97. `Feature × Regime`

‏לדוגמה:

```text
acceleration_when_opening
```

‏או משתמשים באותו Feature אבל במשקל שונה לפי מצב שוק.

‏זה יופיע בהמשך בפרקי Score ו־Regime Analysis.

---

# ‏98. Anti-Pattern: Feature Kitchen Sink

‏זה מצב שבו מכניסים הכול:

```text
RSI
MACD
EMA
VWAP
100 returns
40 ratios
20 order-book metrics
```

‏ואז נותנים למודל “להסתדר”.

‏זה יכול לעבוד במחקר ולהיכשל ב־Live בגלל Overfitting ומורכבות.

---

# ‏99. Anti-Pattern: Feature בלי Definition מדויק

‏אם שני מפתחים מחשבים:

```text
volume_10s
```

‏בצורות שונות, קיבלת שתי מערכות שונות.

‏לכן Definition הוא חלק מה־Feature.

---

# ‏100. Anti-Pattern: Feature שמבוסס על Data שלא יהיה ב־Live

‏למשל Backtest משתמש ב־full consolidated tick history.

‏אבל Live עובד על Feed חלקי.

‏אז Feature מעולה במחקר עלול להיות בלתי אפשרי בפועל.

---

# ‏101. Anti-Pattern: Threshold שנראה מדעי אבל נבחר ידנית

‏לדוגמה:

```text
trade_rate > 37.4
```

‏אם בחרנו 37.4 כי זה נתן את התוצאה הכי יפה מתוך 500 ניסויים — זה חשוד מאוד.

‏זה כבר מתחבר ל־Overfitting.

---

# ‏102. Best Practice: Feature Card

‏לכל Feature חשוב כדאי לשמור “כרטיס” קטן:

```text
Name
Purpose
Formula
Inputs
Window
As-of rule
Missing rule
Unit
Expected range
Computation cost
Version
Validation tests
```

---

# ‏103. Best Practice: Unit Tests ל־Features

‏Feature הוא קוד עסקי.

‏צריך לבדוק אותו.

‏למשל:

```text
price T-5s = 100
price now  = 101
return_5s  = 1%
```

‏וגם מקרי קצה:

- ‏אין עוגן.
- ‏מחיר חסר.
- ‏אותו timestamp.
- ‏אירועים out-of-order.

---

# ‏104. Property Tests

‏אפשר גם לבדוק חוקים כלליים.

‏למשל:

```text
spread_pct >= 0
```

‏או:

```text
0 <= position_in_range <= 1
```

‏אם לא — משהו לא תקין או שההגדרה צריכה הסבר.

---

# ‏105. Determinism

‏אם מריצים Replay פעמיים על אותם נתונים, Features צריכים להיות זהים.

‏אם לא — קשה מאוד לסמוך על המחקר.

---

# ‏106. `Feature Lineage`

‏אנחנו רוצים לדעת:

```text
Raw events
↓
Normalized data
↓
Feature computation
↓
Feature value
↓
Score
↓
Decision
```

‏זה מאפשר לעקוב מהחלטה חזרה לנתונים המקוריים.

---

# ‏107. דוגמה ל־Feature Vector עבור מניה

```text
Symbol                  XYZ
return_1s               +0.03%
return_5s               +0.14%
return_10s              +0.25%
return_30s              +0.52%
acceleration_5s         +0.08%
trade_rate_5s           15.8 trades/s
activity_accel          +42%
spread_pct              0.018%
ask_capacity_ratio      0.12
quote_age_ms            28
momentum_percentile     99.4
```

‏עכשיו יש לסורק תיאור עשיר הרבה יותר של המניה.

---

# ‏108. אבל עדיין לא החלטנו אם לקנות

‏וזה חשוב.

‏Feature Engineering רק יוצר את חומרי הגלם.

‏השלב הבא הוא:

`Score / Ranking`

‏ושם נחליט איך לשלב Features שונים.

---

# ‏109. Feature Research Table מומלץ

‏למחקר אפשר לשמור טבלה רעיונית:

```text
symbol
asof_time
feature_version
return_1s
return_5s
return_10s
acceleration
trade_rate
spread_pct
quote_age
rank

forward_return_1s
forward_return_2s
forward_return_5s
forward_return_10s
forward_return_30s
forward_return_60s

time_to_first_profit
time_to_target
mfe_60s
mae_60s
```

‏כך אפשר לבדוק ישירות אילו Features עוזרים לבחור מועמדות טובות.

---

# ‏110. מה במיוחד חשוב אצלך

‏אצלך אנחנו לא שואלים רק:

> ‏האם Feature מנבא Return חיובי בהמשך היום?

‏אנחנו שואלים:

> ‏האם Feature עוזר לבחור מניה שנותנת תנועה חיובית מהר מספיק כדי לבצע כניסה ויציאה קצרות, אחרי Spread, Slippage ועמלות?

---

# ‏111. ה־Target צריך להתאים ל־Feature Horizon

‏אם Feature נמדד על:

```text
5 seconds
```

‏ומטרת העסקה היא:

```text
5-30 seconds
```

‏נבדוק Targets בטווחים רלוונטיים.

‏לא רק:

```text
next day return
```

---

# ‏112. `Feature Half-Life`

‏רעיון מתקדם ושימושי:

> ‏כמה זמן Feature נשאר רלוונטי?

‏למשל Feature יכול להיות מצוין אם מבצעים תוך 300ms, אבל חסר ערך אחרי 5 שניות.

‏לכן נבדוק את איכות Feature כפונקציה של delay.

---

# ‏113. `Signal Decay Curve`

‏אפשר למדוד:

```text
Edge after 100ms
Edge after 500ms
Edge after 1s
Edge after 2s
Edge after 5s
```

‏כך נדע אם Feature דורש מערכת מהירה מאוד או שהוא סלחני יותר.

---

# ‏114. זה מחבר Feature Engineering ל־Latency

‏Feature אינו טוב “באופן מוחלט”.

‏הוא טוב אם:

```text
predictive edge
-
latency decay
-
execution cost
>
0
```

‏זו כבר חשיבה של מערכת מלאה.

---

# ‏115. `Feature Budget`

‏Best Practice נוסף:

‏להגדיר כמה מורכבות מותרת ל־Feature Engine.

‏לדוגמה:

```text
max compute per symbol
max memory per symbol
max feature age
max ranking latency
```

‏זה מונע מחקר שמייצר מערכת שאי אפשר להריץ בזמן אמת.

---

# ‏116. Fast Path מול Deep Path

‏אפשר לבנות שתי שכבות:

```text
Fast Features
↓
כל השוק
↓
Top Candidates
↓
Deep Features
↓
מספר קטן של מניות
```

‏זה ממשיך את רעיון Wide Scan / Deep Observation.

---

# ‏117. דוגמה ל־Fast Features

```text
return_5s
return_10s
trade_rate_5s
spread_pct
quote_age
```

‏זולים ומהירים.

---

# ‏118. דוגמה ל־Deep Features

‏רק על Top Candidates:

```text
recent microstructure
book imbalance
microprice
queue behavior
fine-grained order-flow
```

‏אם נוכיח שהם שווים את העלות.

---

# ‏119. `Feature Gate`

‏לפני ש־Feature חדש נכנס ל־Production, הוא צריך לעבור:

```text
Definition complete
No leakage
Correct on test cases
Computable live
Stable enough
Adds measurable value
Does not break latency budget
```

---

# ‏120. סדר העבודה המומלץ

```text
1. Hypothesis
2. Define feature
3. Implement once
4. Unit test
5. Historical calculation
6. Bucket analysis
7. Add to baseline
8. Ablation test
9. Walk-forward validation
10. Shadow live
11. Production candidate
```

---

# ‏121. מה לא לעשות

‏לא:

```text
מצאתי Feature שנראה טוב על יום אחד
→ מיד נכנס ל-Score
```

‏כן:

```text
רעיון
→ בדיקה
→ אימות
→ השוואה
→ ורק אז שילוב
```

---

# ‏122. Feature Notebook / Catalog

‏כדאי לתעד לכל Feature:

- ‏מה הרעיון.
- ‏למה חשבנו שיעזור.
- ‏באילו Horizons.
- ‏תוצאה במחקר.
- ‏מתי נכשל.
- ‏האם נשאר פעיל.

‏כך לא חוזרים שוב ושוב לאותם ניסויים.

---

# ‏123. רז מקצוע: Feature פשוט שקל להסביר הוא נכס

‏אם שני Features נותנים כמעט אותה תוצאה:

- ‏אחד פשוט וברור.
- ‏אחד מורכב מאוד.

‏בדרך כלל נעדיף את הפשוט.

‏קל יותר:

- ‏לבדוק.
- ‏לנטר.
- ‏לתקן.
- ‏להבין Drift.

---

# ‏124. רז מקצוע: Features צריכים להתאים למקור הנתונים האמיתי

‏אם Feature תלוי ב־Tick-by-Tick Consolidated Feed יקר, צריך לדעת זאת מראש.

‏אם אפשר לקבל 95% מהערך עם Top-of-Book זול — אולי זה עדיף.

‏זו החלטת Cost/Benefit, לא דוגמה של “יותר Data תמיד טוב יותר”.

---

# ‏125. רז מקצוע: Feature צריך לשרוד Reconnect

‏אם חיבור נפל ל־3 שניות, Rolling Features יכולים להפוך לאמינים פחות.

‏לכן לאחר Gap צריך לדעת:

- ‏אילו Features עדיין valid.
- ‏אילו צריך לאפס.
- ‏אילו צריכים Warm-up מחדש.

---

# ‏126. `Warm-Up`

‏Feature של 60 שניות דורש היסטוריה.

‏מיד אחרי Startup אין אותה.

‏לכן יש מצב:

```text
WARMING_UP
```

‏ולא מתחילים לסחור כאילו כל Features תקינים.

---

# ‏127. Warm-Up יכול להיות פר Feature

‏למשל:

```text
return_5s  → ready after ~5s
return_60s → ready after ~60s
RVOL       → אולי דורש baseline היסטורי
```

‏כך המערכת יודעת בדיוק מה אמין.

---

# ‏128. רז מקצוע: לשמור Features לפני ואחרי Order

‏כדאי לשמור:

```text
features_at_signal
features_at_order_send
features_at_fill
```

‏כך אפשר לראות כמה המצב השתנה בגלל Latency.

---

# ‏129. זה מאפשר `Execution Drift Analysis`

‏לדוגמה:

```text
Signal:
spread = 0.01
momentum = strong

Order send:
spread = 0.03
momentum = weaker
```

‏אולי האסטרטגיה טובה, אבל Execution איטי מדי.

---

# ‏130. רז מקצוע: Feature יכול להיות Diagnostic בלבד

‏לא כל Feature צריך להשפיע על Score.

‏אפשר לשמור Feature רק כדי להבין כישלונות.

‏לדוגמה:

```text
feed_gap_ms
rank_distance_to_second
book_change_since_signal
```

‏זה יכול להיות יקר ערך ל־RCA.

---

# ‏131. Feature Set בסיסי מומלץ למחקר ראשון

‏לא כמסקנה סופית, אלא Baseline:

```text
return_1s
return_5s
return_10s
return_30s
return_60s

acceleration_5s
path_efficiency_10s

trade_rate_1s
trade_rate_5s
trade_rate_10s
activity_acceleration

volume_5s
volume_10s
dollar_volume_10s

spread_pct
bid_size
ask_size

trade_age_ms
quote_age_ms

momentum_percentile
activity_percentile
```

---

# ‏132. Feature Set מתקדם אפשרי

‏רק לאחר Baseline והוכחת צורך:

```text
order_book_imbalance
microprice
spread_velocity
quote_update_rate
aggressor_flow
short-term volatility
market-relative momentum
sector-relative momentum
execution_probability proxies
```

---

# ‏133. לא כולם חייבים להיות ב־Score

‏ייתכן מבנה כזה:

```text
Signal Score:
  momentum
  acceleration
  activity

Execution Gate:
  spread
  liquidity
  freshness

Risk Gate:
  volatility
  halt/state
```

‏זה לעיתים נקי יותר מאשר Score אחד ענק.

---

# ‏134. השאלה החשובה מכל Feature

‏בסוף נשאל:

> ‏אם Feature הזה לא היה קיים — האם ההחלטות היו פחות טובות בעולם אמיתי?

‏אם התשובה אינה נתמכת בנתונים, אין סיבה להחזיק אותו רק משום שהוא מעניין.

---

# ‏135. מה צריך לזכור משלב 13

1. ‏`Feature` הוא תיאור מחושב של מצב השוק, לא קסם.
2. ‏כל Feature צריך לענות על שאלה ברורה.
3. ‏יותר Features אינם בהכרח מערכת טובה יותר.
4. ‏יש להפריד בין Signal, Execution, Risk, Context ו־Data Quality Features.
5. ‏Normalization, Rank ו־Percentile עוזרים להשוות מניות שונות.
6. ‏אסור להשתמש במידע שלא היה קיים בזמן ההחלטה.
7. ‏Live ו־Backtest צריכים להשתמש באותה הגדרה ככל האפשר.
8. ‏Feature צריך להצדיק גם את עלות הנתונים והחישוב שלו.
9. ‏אצלך בודקים בעיקר האם Feature משפר תנועה חיובית מהירה ו־Net Edge לאחר ביצוע.
10. ‏כל Feature חדש צריך לעבור Definition, Tests, Historical Validation, Ablation ו־Shadow לפני Production.

---

# ‏בדיקת הבנה עצמית

‏נסה לענות בלי לחזור לפרק:

1. ‏מה ההבדל בין Raw Data ל־Feature?
2. ‏למה `velocity_5s` ו־`change_5s` יכולים להיות כמעט אותו מידע?
3. ‏למה `Percentile` יכול להיות שימושי בסריקה של כל השוק?
4. ‏מהו `Feature Leakage`?
5. ‏מהו `As-Of Time`?
6. ‏למה Missing אינו שווה לאפס?
7. ‏מה ההבדל בין Signal Feature ל־Execution Feature?
8. ‏למה צריך Feature Versioning?
9. ‏מהו Ablation Test?
10. ‏למה Feature טוב למסחר יומי רגיל לא בהכרח טוב לעסקה של 5 שניות?
11. ‏מהו Signal Decay?
12. ‏למה כדאי לשמור Features גם ברגע Signal וגם ברגע Order Send?

---

# ‏Checkpoint

‏שלב 13 הגדיר איך לבנות את שכבת ה־Features של הסורק בצורה נקייה, מדידה, ניתנת לשחזור ויעילה ל־Live Trading.

‏בשלב 14 נעבור ל־**`Score` ודירוג כל השוק**: איך משלבים Features שונים, איך לא נותנים למדד אחד להשתלט בטעות, איך בונים Sub-Scores, ואיך בודקים שהמניה במקום הראשון באמת טובה יותר מהמניות שמתחתיה.