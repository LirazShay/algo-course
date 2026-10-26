# ‏שלב 12 — `Filters`: מה פוסלים לפני הדירוג

> ‏מטרת הפרק: להבין איך מסננים אלפי מניות לפני שלב ה־`Score` והדירוג, בלי לבזבז משאבים על מועמדות לא רלוונטיות ובלי למחוק בטעות הזדמנויות טובות.
>
> ‏כמו בכל הקורס: קודם נלמד את הרעיון הכללי, אחר כך את ה־Best Practices ורזי המקצוע, ולבסוף נתאים אותו לרובוט שלך — סריקה של כל השוק, עסקה של שניות בודדות ועד בערך דקה, ורווח יעד קטן נטו.

---

# ‏1. מה זה `Filter`?

‏`Filter` הוא תנאי שאומר:

> ‏"אם המניה לא עומדת בדרישה הזאת — היא לא ממשיכה לשלב הבא."

‏לדוגמה:

```text
אם אין Bid או Ask תקינים → פסול
אם הנתונים ישנים מדי → פסול
אם המסחר במניה נעצר → פסול
```

‏זה שונה מ־`Score`.

‏`Score` אומר:

> ‏"עד כמה המניה טובה יחסית לאחרות?"

‏`Filter` אומר:

> ‏"האם בכלל מותר לה להשתתף בתחרות?"

---

# ‏2. למה בכלל צריך Filters?

‏נניח שיש לנו:

```text
4,000 symbols
```

‏אין טעם לחשב לכל אחד מהם מודל כבד אם חלק גדול מהם:

- ‏לא נסחר כרגע.
- ‏חסר להם מידע.
- ‏ה־Spread שלהם קיצוני.
- ‏אין בהם כמעט פעילות.
- ‏אי אפשר לבצע בהם את גודל העסקה שלנו.
- ‏הם אינם מוצר שאנחנו רוצים לסחור בו.

‏לכן המבנה הטבעי הוא:

```text
Universe
    ↓
Cheap Safety Filters
    ↓
Tradability Filters
    ↓
Activity / Quality Filters
    ↓
Feature Engine
    ↓
Score / Ranking
```

---

# ‏3. ההבדל בין `Universe` לבין `Filter`

‏בשלב 07 בנינו `Universe`.

‏`Universe` הוא:

> ‏מי רשאי עקרונית להשתתף.

‏`Filter` הוא:

> ‏מי מתאים **עכשיו**.

‏לדוגמה:

‏מניה יכולה להיות חלק קבוע מה־Universe, אבל כרגע:

```text
halted = true
```

‏ולכן להיפסל זמנית.

---

# ‏4. שתי משפחות מרכזיות: `Hard Filter` ו־`Soft Filter`

## ‏`Hard Filter`

‏אם הוא נכשל — המניה יוצאת לחלוטין.

‏דוגמאות:

```text
halted
missing market data
stale quote
invalid price
not tradable
```

## ‏`Soft Filter`

‏הוא מייצג מצב פחות טוב, אבל לא תמיד נכון למחוק בגללו מועמדת.

‏לדוגמה:

```text
spread קצת גדול
activity קצת נמוכה
momentum קצת חלש
```

‏במקרים כאלה לפעמים עדיף:

- ‏להוריד Score.
- ‏להוריד Confidence.
- ‏לתת Penalty.
- ‏או רק לתעד.

---

# ‏5. כלל מקצועי חשוב: לא להפוך כל העדפה ל־Hard Filter

‏נניח שהגדרנו:

```text
trades_10s >= 50
```

‏ומניה עם:

```text
49 trades
```

‏נפסלת.

‏אבל מניה עם:

```text
50 trades
```

‏עוברת.

‏האם באמת קיים הבדל מהותי ביניהן?

‏כנראה שלא.

‏לכן Threshold קשיח צריך הצדקה.

‏אם המשתנה הוא רציף ואין גבול טבעי, לעיתים עדיף להשתמש בו כחלק מה־Score ולא כ־Hard Filter.

---

# ‏6. מתי `Hard Filter` כן הגיוני מאוד?

‏כאשר קיים גבול אמיתי של:

- ‏בטיחות.
- ‏חוקיות.
- ‏יכולת ביצוע.
- ‏תקינות נתונים.
- ‏הרשאת מסחר.
- ‏מצב מערכת.

‏לדוגמה:

```text
No quote → cannot evaluate execution
Trading halt → cannot trade normally
Broker says instrument unavailable → cannot submit order
```

‏כאן אין טעם לתת “Penalty”.

‏פשוט לא סוחרים.

---

# ‏7. משפחת Filter ראשונה — `Data Quality`

‏לפני הכול צריך לוודא שאנחנו בכלל יודעים מה קורה.

‏דוגמאות:

```text
last_price exists
bid exists
ask exists
timestamp valid
ask >= bid
price > 0
```

‏אם הנתונים בלתי אפשריים או חסרים, אסור לתת למניה Score רגיל.

---

# ‏8. `Freshness Filter`

‏נתון נכון אבל ישן יכול להיות מסוכן בדיוק כמו נתון שגוי.

‏לדוגמה:

```text
quote_age_ms = 4200
```

‏למסחר של שניות, Quote בן 4.2 שניות יכול להיות כמעט חסר ערך.

‏אפשר להגדיר:

```text
if quote_age_ms > max_quote_age:
    reject
```

‏אבל את `max_quote_age` צריך למדוד ולהתאים ל־Feed ולקצב האסטרטגיה.

---

# ‏9. `No Data` אינו `No Change`

‏זה Filter בטיחותי חשוב.

```text
No Change = קיבלנו עדכונים, המחיר לא השתנה
No Data   = לא קיבלנו מידע
```

‏אסור לפרש חוסר מידע כאילו השוק שקט.

---

# ‏10. `Heartbeat Filter`

‏לפני דירוג כל השוק אפשר לבדוק:

```text
market_data_feed_alive?
clock_ok?
collector_alive?
```

‏אם Feed שלם מת:

```text
NO NEW TRADES
```

‏זה לא Filter למניה בודדת.

‏זה Filter לכל המערכת.

---

# ‏11. `Tradability Filter`

‏שאלה בסיסית:

> ‏האם אפשר בכלל לסחור במכשיר הזה דרך הברוקר שבחרנו?

‏לדוגמה:

```text
instrument_supported
trading_permission_ok
order_type_supported
session_supported
```

‏חשוב להפריד בין:

```text
Good signal
```

‏לבין:

```text
Executable signal
```

---

# ‏12. `Halt Filter`

‏אם המסחר במניה נעצר, התנהגות השוק משתנה לחלוטין.

‏לרובוט שמנסה להיכנס ולצאת תוך שניות:

> ‏מניה במצב Halt אינה מועמדת רגילה.

‏לכן בדרך כלל:

```text
if halted:
    reject_new_entry
```

‏חידוש מסחר לאחר Halt הוא מצב מיוחד שיכול להילמד בנפרד בפרקי Microstructure ו־Fast Markets.

---

# ‏13. `Session Filter`

‏השוק לפני הפתיחה, במסחר הרגיל ואחרי הסגירה אינו אותו שוק.

‏לכן אפשר להגדיר:

```text
PRE
RTH
POST
```

‏ולכל Session כללים אחרים.

‏לדוגמה:

```text
RTH → enabled
PRE → research only
POST → disabled
```

‏או להפך, אם המחקר יוכיח שיש Edge טוב בזמן אחר.

---

# ‏14. Filter לפי מחיר

‏אפשר לבחור טווח מחיר.

‏לדוגמה:

```text
$2 <= price <= $300
```

‏אבל אסור לבחור טווח רק כי “ככה כולם עושים”.

‏צריך להבין מה הוא פותר.

‏מחיר נמוך מאוד יכול להיות קשור ל:

- ‏Tick יחסי גדול יותר.
- ‏תנודתיות גבוהה.
- ‏Spread יחסי גדול.
- ‏סיכוני halt.

‏מחיר גבוה מאוד יכול לגרום לכך שב־$5,000 נקנה מעט מניות.

‏אבל אף אחד מהדברים האלה אינו אומר אוטומטית שהמניה גרועה.

---

# ‏15. עדיף לעיתים לסנן לפי תוצאה כלכלית ולא לפי מחיר גולמי

‏במקום:

```text
price > $10
```

‏אפשר לשאול:

```text
כמה shares אקנה בגודל העסקה שלי?
מה ה-spread בדולרים על הכמות הזאת?
כמה מה-target profit הוא אוכל?
```

‏זה Filter שמתאים יותר לבעיה האמיתית שלנו.

---

# ‏16. `Spread Filter`

‏אפשר לדרוש למשל:

```text
spread_pct <= threshold
```

‏או אפילו טוב יותר:

```text
estimated_round_trip_spread_cost <= allowed_cost
```

‏כי אצלך השאלה אינה רק:

> ‏האם Spread קטן?

‏אלא:

> ‏האם הוא קטן מספיק ביחס לרווח שאנחנו מנסים לקחת?

---

# ‏17. `Executable Edge Filter`

‏זה Filter מאוד חשוב לרובוט שלך.

‏נניח שה־Scanner חושב שהמניה יכולה לעלות:

```text
expected_move = +$0.04/share
```

‏אבל הערכת החיכוך היא:

```text
spread + slippage + fees = $0.05/share
```

‏גם אם התחזית נכונה:

```text
net edge < 0
```

‏לכן אפשר לחשוב על כלל:

```text
expected_gross_edge > estimated_total_cost + safety_margin
```

‏זה כבר Filter כלכלי, לא טכני בלבד.

---

# ‏18. `Depth Filter`

‏אם רוצים לקנות למשל:

```text
100 shares
```

‏אפשר לבדוק כמה נזילות גלויה קיימת קרוב למחיר.

‏למשל:

```text
ask_size = 20
```

‏זה סימן שהכמות ברמה הראשונה אינה מספיקה.

‏אבל חשוב לזכור:

> ‏Top-of-book size אינו כל הנזילות בעולם.

‏לכן Depth הוא אינדיקציה, לא אמת מוחלטת.

---

# ‏19. `Order Size / Liquidity Filter`

‏Filter טוב יותר יכול להיות יחסי לגודל שלנו.

‏לדוגמה:

```text
visible_liquidity / desired_shares
```

‏אם התוצאה היא:

```text
20x
```

‏הכמות שלנו קטנה יחסית.

‏אם היא:

```text
0.3x
```

‏אנחנו כבר גדולים יותר מהנזילות הגלויה ברמה.

---

# ‏20. Filter לפי Activity

‏אפשר לסנן מניות כמעט מתות.

‏לדוגמה:

```text
trades_10s >= minimum
```

‏או:

```text
volume_10s >= minimum
```

‏אבל חשוב לא להפוך את זה לאמונה.

‏המספר הנכון צריך להגיע ממחקר.

---

# ‏21. `Trade Count` לעומת `Volume` כ־Filter

‏שני Filters שונים יכולים לזהות בעיות שונות.

‏לדוגמה:

```text
1 trade × 20,000 shares
```

‏לעומת:

```text
200 trades × 100 shares
```

‏לשניהם אותו Volume.

‏אבל קצב הפעילות שונה.

‏לכן לפעמים נרצה:

```text
min_trade_count
AND/OR
min_volume
```

---

# ‏22. `Dollar Volume Filter`

‏Volume של 100,000 מניות אינו אותו דבר במניה של $2 ובמניה של $200.

‏לכן אפשר לחשב:

```text
dollar_volume = price × volume
```

‏זה נותן מושג על הערך הכספי שעבר בשוק.

---

# ‏23. Activity Filter צריך להיות קצר־טווח אצלך

‏למסחר רגיל מסתכלים הרבה על:

```text
Average Daily Volume
```

‏זה ידע חשוב.

‏אבל לרובוט שלך אנחנו צריכים גם:

```text
trades_1s
trades_5s
trades_10s
volume_5s
volume_10s
activity_acceleration
```

‏כי מניה שפעילה מאוד ביום כולו יכולה להיות מתה כרגע.

---

# ‏24. `Volatility Filter`

‏תנודתיות גבוהה אינה תמיד טובה.

‏אם המחיר קופץ:

```text
+0.5%
-0.6%
+0.7%
-0.5%
```

‏יש תנועה רבה, אבל גם חוסר יציבות.

‏אפשר לסנן קיצוניות לפי:

- ‏Range קצר.
- ‏Standard deviation.
- ‏Max jump.
- ‏Path efficiency.

‏או להשתמש בהם כ־Penalty במקום Hard Filter.

---

# ‏25. `Single-Jump Filter`

‏אחד ה־Filters המעניינים לסורק מומנטום קצר:

> ‏האם כל העלייה נוצרה מאירוע יחיד?

‏לדוגמה:

```text
change_10s = +0.50%
```

‏אבל:

```text
9.8 seconds: flat
0.2 seconds: one jump
```

‏זה שונה מאוד מתנועה רציפה.

‏אפשר לזהות זאת בעזרת:

- ‏Trade count.
- ‏Path consistency.
- ‏Max single-step contribution.
- ‏Number of positive intervals.

---

# ‏26. `Price Gap / Outlier Filter`

‏אם Tick אחד קפץ בצורה לא סבירה:

```text
100.00
100.01
112.00
100.02
```

‏ייתכן שיש:

- ‏Bad tick.
- ‏Trade condition מיוחד.
- ‏אירוע חריג.

‏אסור שה־Scanner יקפיץ מיד את המניה למקום ראשון בלי בדיקה.

---

# ‏27. `Corporate Action Filter`

‏Split או שינוי דומה יכול לגרום לנתונים להיראות כאילו התרחשה תנועה ענקית.

‏במחקר ובמערכת חיה צריך לדעת:

```text
corporate_action_today?
reference_data_changed?
```

‏ולא להכניס תנועה טכנית ל־Momentum רגיל.

---

# ‏28. `IPO / Newly Listed Filter`

‏נייר חדש יכול להיות מעניין מאוד, אבל אין לו בהכרח היסטוריה מספקת.

‏לכן אפשר להחליט:

```text
new_listing → separate regime
```

‏ולא בהכרח:

```text
new_listing → reject forever
```

‏זה Best Practice חשוב:

> ‏מצב מיוחד לא חייב להיות פסילה; לפעמים הוא צריך מודל נפרד.

---

# ‏29. `News/Event Filter`

‏אירוע חדשותי יכול לגרום לתנועה חריגה.

‏אפשר לבחור:

- ‏לסחור גם באירועים כאלה.
- ‏להחריג אותם.
- ‏לבנות Regime נפרד.

‏העיקר הוא לא לערבב בלי לדעת.

‏לרובוט קצר מאוד, אירועים כאלה יכולים לשנות Spread, latency, halts ו־fill behavior במהירות.

---

# ‏30. `Market-Wide Filter`

‏לפעמים הבעיה אינה במניה.

‏כל השוק יכול להיות במצב חריג.

‏למשל:

```text
feed problem
extreme volatility
a broad market halt
broker outage
```

‏לכן יש Filters גם ברמת:

```text
SYSTEM
MARKET
SYMBOL
ORDER
```

‏ולא רק Symbol.

---

# ‏31. ארבע שכבות Filter מומלצות

## ‏שכבה 1 — System Safety

```text
feed alive
broker alive
clock valid
system healthy
```

## ‏שכבה 2 — Symbol Validity

```text
tradable
not halted
valid data
correct session
```

## ‏שכבה 3 — Executability

```text
spread acceptable
depth acceptable
cost acceptable
```

## ‏שכבה 4 — Opportunity Quality

```text
activity
momentum quality
volatility quality
```

‏ככל שיורדים בשכבות, פחות ברור שהכלל צריך להיות Hard Filter.

---

# ‏32. למה סדר ה־Filters חשוב גם לביצועים

‏אם Filter זול יכול לפסול 80% מהמניות, כדאי להריץ אותו לפני חישוב כבד.

‏לדוגמה:

```text
invalid data          cost ≈ tiny
halt check            cost ≈ tiny
spread check          cost ≈ small
complex pattern model cost ≈ high
```

‏לכן:

```text
cheap + decisive first
expensive later
```

‏זה Best Practice גם במסחר וגם בתוכנה בכלל.

---

# ‏33. אבל אסור שסדר הביצוע ישנה את הלוגיקה

‏אופטימיזציה טובה:

> ‏משנה את עלות החישוב, לא את המשמעות של ההחלטה.

‏אם העברת Filter מוקדם גורמת לכך שחסר לנו מידע חשוב למחקר או לתיעוד, צריך לשקול זאת.

---

# ‏34. `Fail Closed` מול `Fail Open`

‏זה מושג חשוב מאוד.

## ‏`Fail Closed`

‏אם לא יודעים — לא סוחרים.

‏לדוגמה:

```text
quote missing → reject
halt status unknown → reject
broker disconnected → reject
```

## ‏`Fail Open`

‏אם לא יודעים — ממשיכים.

‏זה יכול להתאים רק לדברים שאינם בטיחותיים.

‏במערכת מסחר אוטומטית, Filters של בטיחות צריכים בדרך כלל להיות `Fail Closed`.

---

# ‏35. `Rejection Reason`

‏כל פסילה צריכה להסביר למה.

‏במקום:

```text
AAA rejected
```

‏נשמור:

```text
AAA rejected:
- stale_quote
- spread_too_wide
```

‏זה קריטי כדי לשפר את המערכת.

---

# ‏36. אל תסתפק ב־Boolean אחד

‏במקום רק:

```text
eligible = false
```

‏עדיף לשמור:

```text
eligible = false
reasons = ["spread_too_wide", "activity_low"]
filter_version = "v12"
```

‏כך אפשר לחקור בדיעבד.

---

# ‏37. `Filter Funnel Metrics`

‏צריך לדעת כמה מניות נפסלו בכל שלב.

‏לדוגמה:

```text
Universe                4,200
Valid data              4,050
Tradable                3,980
Fresh                    3,700
Spread OK                2,800
Activity OK              650
Momentum candidate        42
Ranked                     42
```

‏אם Filter חדש פתאום משאיר:

```text
3 symbols
```

‏אולי הוא חזק מדי.

---

# ‏38. שיעור פסילה הוא Metric תפעולי חשוב

‏אפשר למדוד:

```text
rejection_rate_by_reason
```

‏למשל:

```text
stale_quote       2.1%
spread_too_wide  31.4%
low_activity     64.0%
```

‏זה עוזר לזהות גם בעיות ב־Feed.

‏אם פתאום:

```text
stale_quote = 80%
```

‏אולי הבעיה אינה בשוק — אלא אצלנו.

---

# ‏39. Filter Versioning

‏אם היום הגדרנו:

```text
spread_pct < 0.10%
```

‏ומחר שינינו ל:

```text
spread_pct < 0.08%
```

‏צריך לדעת באיזו גרסה כל החלטה התקבלה.

‏לכן נשמור:

```text
filter_set_version
```

‏אחרת לא נוכל להשוות מחקר בצורה אמינה.

---

# ‏40. ה־Filter עצמו צריך Backtest

‏לא מספיק לבדוק Strategy שלמה.

‏אפשר לבדוק Filter בפני עצמו.

‏למשל:

> ‏מה קרה למניות שנפסלו בגלל Spread?

‏אם הן באמת נתנו תוצאות גרועות נטו — טוב.

‏אם הן דווקא היו המניות הרווחיות ביותר — אולי Threshold לא נכון.

---

# ‏41. `Rejected Opportunity Analysis`

‏זה אחד מרזי המקצוע החשובים.

‏לא חוקרים רק את מה שסחרנו.

‏חוקרים גם:

> ‏מה היה קורה אם לא היינו פוסלים?

‏לדוגמה:

```text
Rejected by activity filter
Forward 10s return = +0.40%
```

‏אם זה קורה שוב ושוב, Filter אולי הורג Edge.

---

# ‏42. Filter יכול לשפר Precision ולהרוס Recall

‏בפשטות:

## ‏`Precision`

‏כמה מהמועמדות שעברו היו באמת טובות.

## ‏`Recall`

‏כמה מההזדמנויות הטובות הצלחנו בכלל להשאיר.

‏Filter קשוח מאוד יכול לתת:

```text
high precision
low recall
```

‏כלומר מעט מאוד טעויות — אבל גם לפספס כמעט את כל ההזדמנויות.

---

# ‏43. זה חשוב במיוחד אצלך כי אתה סורק את כל השוק

‏היתרון של הסורק שלך הוא רוחב.

‏אם נבנה Filters קשוחים מדי:

> ‏אנחנו בעצמנו נהרוס את היתרון של סריקת כל השוק.

‏לכן צריך לשאול:

```text
Did this filter remove noise?
OR
Did it remove opportunity?
```

---

# ‏44. `Dynamic Filters`

‏Threshold קבוע אינו תמיד נכון.

‏לדוגמה Spread של:

```text
0.05%
```

‏יכול להיות נורמלי במניה אחת וחריג במניה אחרת.

‏אפשר להשתמש ב־Threshold יחסי:

```text
current_spread / typical_spread
```

‏או Percentile:

```text
spread_percentile
```

---

# ‏45. Filters לפי `Regime`

‏ייתכן שנרצה כללים שונים ב:

```text
market open
midday
market close
high volatility
low volatility
```

‏למשל Spread נורמלי ב־09:31 אינו בהכרח Spread נורמלי ב־13:00.

‏את זה נלמד לעומק בפרק `Regime Analysis`.

---

# ‏46. `Relative Filters`

‏במקום לשאול:

```text
trades_10s > 100?
```

‏אפשר לשאול:

```text
האם trades_10s נמצאת ב-Top 5% של כל השוק עכשיו?
```

‏זה מתאים מאוד לגישה שלך של השוואת כל השוק בכל רגע.

---

# ‏47. `Cross-Sectional Filter`

‏זה השם המקצועי לסינון יחסית למניות האחרות באותו זמן.

‏לדוגמה:

```text
keep top 10% by activity
```

‏או:

```text
keep symbols with momentum percentile >= 95
```

‏כך Threshold מתאים את עצמו למצב השוק.

---

# ‏48. אבל גם Relative Filter יכול להכריח עסקאות גרועות

‏תמיד יהיה Top 1%.

‏גם ביום מת.

‏לכן צריך לשלב:

```text
Relative quality
AND
Absolute minimum quality
```

‏לדוגמה:

```text
activity_percentile >= 95
AND
trades_10s >= 20
```

---

# ‏49. `Cascading Filters`

‏אפשר לבנות משפך:

```text
4,000
↓ data valid
3,900
↓ fresh
3,600
↓ executable
2,500
↓ active
500
↓ positive momentum
80
↓ high-quality momentum
20
↓ score
Top 5
```

‏כל שלב מצמצם את מרחב החיפוש.

---

# ‏50. Filter לעומת Feature — מבחן פשוט

‏שאל:

> ‏אם הערך יהיה קצת פחות טוב, האם באמת אסור לסחור?

‏אם כן:

`Filter`

‏אם לא:

`Feature / Penalty`

‏לדוגמה:

```text
halted = true
```

‏כמעט בוודאות Filter.

```text
trades_10s = 47 vs 52
```

‏כנראה Feature רציף עדיף.

---

# ‏51. Filter לעומת Risk Rule

‏גם כאן חשוב להפריד.

‏`Filter` בדרך כלל עוסק במועמדת.

‏`Risk Rule` עוסק בחשבון או בפעילות הכוללת.

‏לדוגמה:

```text
spread too wide → filter
max daily loss reached → risk rule
```

‏שניהם יכולים להוביל ל־`NO TRADE`, אבל מסיבות שונות.

---

# ‏52. Filter לעומת Execution Recheck

‏מניה יכולה לעבור Filter בזמן:

```text
T0
```

‏אבל עד שנשלח Order עברו:

```text
600 ms
```

‏ולפתע Spread נפתח.

‏לכן לפני ביצוע אמיתי צריך לעשות:

`Execution Recheck`

‏כלומר לבדוק שוב תנאים קריטיים ממש לפני הפקודה.

---

# ‏53. Filters אצלך צריכים להיות מחוברים לזמן החזקה

‏אצלך עסקה אמורה לעבוד מהר.

‏לכן Filters בעלי משמעות יכולים לכלול:

```text
freshness very strict
recent activity
recent liquidity
signal age
recent spread stability
```

‏ולא רק Metrics יומיים.

---

# ‏54. Filter על `Signal Age`

‏נניח שה־Scanner זיהה Burst ב־:

```text
14:30:01.000
```

‏אבל ההחלטה מגיעה ב־:

```text
14:30:04.000
```

‏אות בן שלוש שניות יכול להיות ישן מאוד לאסטרטגיה מסוימת.

‏אפשר להגדיר:

```text
if signal_age_ms > threshold:
    reject
```

---

# ‏55. Filter על "המומנטום עדיין קיים"

‏לפני קנייה נרצה לבדוק שהסיבה שבגללה בחרנו את המניה לא נעלמה.

‏למשל:

```text
rank_at_scan = #1
latest_velocity > 0
spread still acceptable
quote fresh
```

‏זה מגן מפני מצב שבו Rank #1 היה נכון לפני שנייה אבל כבר לא עכשיו.

---

# ‏56. Filter על `Time-to-Opportunity`

‏במחקר אפשר לזהות תבניות שבהן אות מסוים עובד רק אם הכניסה מהירה מאוד.

‏למשל:

```text
within 500ms → good
1-2s later    → neutral
3s later      → bad
```

‏אז Latency עצמה הופכת לחלק מה־Filter.

---

# ‏57. אל תשתמש ב־Filter שלא תוכל להסביר

‏אם יש Filter כמו:

```text
magic_rule_17
```

‏ואף אחד לא יודע למה הוא קיים — זו בעיה.

‏כל Filter צריך לכלול Metadata:

```text
name
reason
owner/version
threshold
source feature
why it exists
```

---

# ‏58. `Filter Registry`

‏אפשר לחשוב על רשימה מסודרת:

| Filter | סוג | Hard/Soft | סיבה |
|---|---|---|---|
| `stale_quote` | Data | Hard | מידע ישן |
| `halted` | Market | Hard | אי אפשר לסחור רגיל |
| `spread_cost` | Execution | Hard/Soft | עלות גבוהה |
| `activity_low` | Opportunity | Soft | פחות אמון |

‏זה הופך את הסורק למערכת שניתן לנהל ולא לאוסף `if` אקראיים.

---

# ‏59. Avoid `Filter Spaghetti`

‏טעות נפוצה היא:

```text
if A and B and C and not D and (E or F) and ...
```

‏עד שאף אחד כבר לא יודע למה מניה נפסלת.

‏במקום זאת:

```text
run filter
record result
run next filter
record result
```

‏עם שמות ברורים.

---

# ‏60. אל תשתמש ב־Thresholds “יפים” בלי מחקר

‏מספרים כמו:

```text
100 trades
0.10%
1,000 shares
```

‏נראים נוחים.

‏אבל השוק לא יודע שבני אדם אוהבים מספרים עגולים.

‏צריך לבדוק טווחים:

```text
20
40
60
80
100
```

‏ולראות האם קיימת נקודת שינוי אמיתית.

---

# ‏61. `Threshold Sensitivity`

‏Filter טוב לא אמור בדרך כלל לקרוס בגלל שינוי קטן.

‏אם:

```text
threshold = 50
```

‏נותן תוצאה מעולה,

‏אבל:

```text
49 → גרוע
51 → גרוע
```

‏יש חשש ל־Overfitting.

‏נרצה אזור יציב ולא מספר קסם.

---

# ‏62. `Ablation Test`

‏אחת הדרכים לבדוק Filter:

```text
Strategy A = with filter
Strategy B = without filter
```

‏משווים:

- ‏Net PnL.
- ‏Expected Value.
- ‏Hit Rate.
- ‏Trade Count.
- ‏MFE/MAE.
- ‏Time-to-profit.
- ‏Drawdown.

‏כך יודעים מה Filter באמת תרם.

---

# ‏63. Filter יכול לשפר ממוצע אבל לפגוע בכמות הזדמנויות

‏לדוגמה:

```text
Without filter:
EV = +$0.04
1000 opportunities

With filter:
EV = +$0.10
80 opportunities
```

‏השאלה אינה רק איזה EV גבוה יותר.

‏צריך לבדוק גם:

```text
expected net opportunity per hour/day
```

‏זה חשוב במיוחד למודל שלך שמעדיף רווח קטן והרבה הזדמנויות.

---

# ‏64. אל תכריח מספר עסקאות

‏אם Filters משאירים רק 12 עסקאות טובות ביום — לא מורידים איכות רק כדי להגיע ל־300.

‏אם המחקר יראה שיש מאות הזדמנויות אמיתיות — מצוין.

‏המספר צריך להיות תוצאה של Edge, לא יעד מלאכותי.

---

# ‏65. `Filter Budget`

‏אפשר לחשוב על כל Filter כעלות:

```text
Compute cost
Opportunity cost
Complexity cost
Maintenance cost
```

‏Filter טוב צריך להצדיק את עצמו.

---

# ‏66. Filter פשוט עדיף על מורכב כאשר התוצאה דומה

‏אם:

```text
simple filter = same result
complex filter = same result
```

‏עדיף בדרך כלל הפשוט.

‏למה?

- ‏קל לבדוק.
- ‏קל להסביר.
- ‏קל לתחזק.
- ‏פחות סיכוי לבאג.
- ‏פחות Overfitting.

---

# ‏67. דוגמה למשפך שמתאים לרובוט שלך

```text
BASE UNIVERSE
    ↓
Valid instrument?
    ↓
Market data healthy?
    ↓
Quote fresh?
    ↓
Tradable now?
    ↓
Halt? → reject
    ↓
Spread/cost executable?
    ↓
Enough recent activity?
    ↓
Recent momentum exists?
    ↓
FEATURE ENGINE
    ↓
SCORE
    ↓
TOP N
    ↓
EXECUTION RECHECK
    ↓
TRADE / NO TRADE
```

---

# ‏68. דוגמה: מניה שנראית מדהימה אבל צריכה להיפסל

```text
Symbol       = AAA
change_10s   = +1.20%
rank         = #1
quote_age    = 4.8s
spread       = 1.4%
trades_10s   = 2
```

‏אם מסתכלים רק על מומנטום:

> ‏מדהים.

‏אם מסתכלים על יכולת מסחר:

> ‏כנראה מועמדת גרועה מאוד לרווח קטן ומהיר.

---

# ‏69. דוגמה: מניה פחות מרשימה אבל יותר סחירה

```text
Symbol       = BBB
change_10s   = +0.18%
quote_age    = 40ms
spread       = 0.02%
trades_10s   = 140
liquidity    = strong
```

‏ייתכן ש־`BBB` עדיפה בפועל משום שאפשר לבצע בה את העסקה בצורה אמינה יותר.

---

# ‏70. אצלך ה־Filter צריך להגן על `Net Edge`

‏העיקרון המרכזי:

> ‏המטרה אינה למצוא את המניה עם הגרף הכי יפה. המטרה היא להשאיר רק מצבים שבהם קיימת אפשרות אמיתית לרווח נטו אחרי ביצוע.

‏לכן Filters חשובים אצלך במיוחד סביב:

- ‏Freshness.
- ‏Spread.
- ‏Recent activity.
- ‏Liquidity relative to order size.
- ‏Signal age.
- ‏Execution cost.
- ‏Halt/tradability.

---

# ‏71. אבל אל תסנן את כל היצירתיות החוצה

‏אם כל Feature חדש הופך מיד ל־Filter, מהר מאוד יישארו אפס מניות.

‏לכן סדר טוב הוא:

```text
Safety → Hard Filter
Impossible execution → Hard Filter
Weak evidence → Score/Penalty
Interesting uncertainty → keep for research
```

---

# ‏72. Best Practice — שמור גם את הנפסלות

‏גם אם מניה נפסלה, כדאי במחקר לשמור:

```text
snapshot
features
rejection reasons
future returns
```

‏למה?

‏כדי שנוכל אחר כך לשאול:

> ‏האם באמת היה נכון לפסול אותה?

---

# ‏73. Best Practice — `Shadow Filters`

‏אפשר להוסיף Filter חדש בלי לתת לו עדיין להשפיע.

‏לדוגמה:

```text
shadow_filter_spread_v2 = pass/fail
```

‏אבל המערכת ממשיכה עם הכללים הישנים.

‏אחר כך בודקים:

> ‏מה היה קורה אילו הפעלנו אותו?

‏זו דרך מצוינת להקטין סיכון בשינויים.

---

# ‏74. Best Practice — `Reason Codes` יציבים

‏במקום טקסט חופשי:

```text
"spread is bad today"
```

‏נשתמש בקוד:

```text
SPREAD_TOO_WIDE
STALE_QUOTE
HALTED
LOW_ACTIVITY
```

‏כך אפשר לספור, לנתח ולהשוות גרסאות.

---

# ‏75. Best Practice — אין Filter בלי Observability

‏אם Filter משפיע על כסף אמיתי, צריך לדעת:

```text
כמה פעמים הופעל?
על אילו מניות?
באילו שעות?
מה היה קורה בלי הפסילה?
```

‏Filter שאי אפשר למדוד הוא חוב מחקרי.

---

# ‏76. Best Practice — Filter Sets לפי Strategy Version

‏נשמור משהו כמו:

```text
strategy_version = 3.2
filter_set_version = 7
feature_set_version = 11
score_version = 5
```

‏כך אפשר לשחזר כל החלטה.

---

# ‏77. Anti-pattern — להשתמש ב־Filter כדי לתקן Score גרוע

‏אם ה־Score מדרג מניות גרועות במקום ראשון, קל לומר:

> ‏"בוא נוסיף עוד Filter."

‏אבל לפעמים הבעיה האמיתית היא:

- ‏Feature רע.
- ‏משקל שגוי.
- ‏Label לא נכון.
- ‏Data leakage.

‏Filters לא צריכים להפוך לטלאים שמסתירים בעיה בסיסית.

---

# ‏78. Anti-pattern — Filter אחרי שראינו Trade מפסיד אחד

‏Trade אחד נכשל.

‏מוסיפים:

```text
if x > 17.3 reject
```

‏זה מתכון ל־Overfitting.

‏שינוי Filter צריך להתבסס על קבוצת מקרים ועל בדיקה מחוץ למדגם.

---

# ‏79. Anti-pattern — להסתמך רק על Successful Trades

‏אם מסתכלים רק על עסקאות שבוצעו, לעולם לא נדע מה Filters פספסו.

‏צריך Dataset שמכיל גם:

```text
passed
rejected
not_selected
```

---

# ‏80. מה צריך למדוד לכל Filter

‏לפחות:

```text
pass_count
reject_count
reject_rate
future_return_of_rejected
net_result_if_included
latency_cost
```

‏ואם מדובר ב־Soft Filter:

```text
outcome_by_bucket
```

---

# ‏81. Filter Quality Dashboard

‏אפשר לבנות טבלה:

| Filter | Reject % | EV של העוברים | EV של הנפסלים | הערה |
|---|---:|---:|---:|---|
| `stale_quote` | 3% | + | ? | Safety |
| `spread_cost` | 24% | + | - | useful |
| `activity_low` | 55% | + | + | suspicious |

‏אם הנפסלים של Filter מסוים טובים כמעט כמו העוברים — צריך לבדוק אותו.

---

# ‏82. איך Filter מתחבר ל־RCA של Rank #1

‏כאשר מקום ראשון נכשל, נשאל גם:

```text
Which filters passed?
Which near-failures existed?
Was spread near threshold?
Was activity barely acceptable?
Was data almost stale?
```

‏לפעמים כישלון נמצא ממש ליד גבול Filter.

---

# ‏83. `Margin to Threshold`

‏במקום לשמור רק:

```text
pass = true
```

‏נשמור גם:

```text
value = 0.049%
threshold = 0.050%
margin = 0.001%
```

‏כך יודעים אם המניה עברה בקלות או בקושי.

---

# ‏84. למה Margin חשוב למחקר

‏אם הרבה עסקאות גרועות נמצאות:

```text
just above threshold
```

‏אולי צריך להזיז את הגבול.

‏אם אין הבדל סביב הגבול — אולי ה־Filter עצמו אינו משמעותי.

---

# ‏85. Filters ו־Machine Learning

‏גם אם בעתיד נשתמש ב־ML, עדיין יהיו Filters.

‏לדוגמה:

```text
invalid data
halted
broker unavailable
```

‏אלה אינם דברים שצריך “לתת למודל ללמוד”.

‏מצד שני Features רציפים כמו:

```text
activity
spread
velocity
```

‏יכולים להיות טובים יותר כקלט למודל מאשר Threshold קשיח.

---

# ‏86. Rule of Thumb שימושי

‏שאל על כל כלל:

> ‏האם זה תנאי של **אפשרי/לא אפשרי**, או תנאי של **טוב יותר/טוב פחות**?

‏אם:

```text
אפשרי / לא אפשרי
```

‏נוטה ל־Filter.

‏אם:

```text
טוב יותר / טוב פחות
```

‏נוטה ל־Feature/Score.

---

# ‏87. תהליך עבודה מומלץ להוספת Filter חדש

```text
1. Define the problem
2. Define the measurable variable
3. Inspect distribution
4. Check relation to future outcome
5. Decide hard vs soft
6. Choose initial threshold
7. Backtest
8. Run sensitivity analysis
9. Check rejected opportunities
10. Shadow it live
11. Promote only if proven
```

‏זה הרבה יותר בטוח מלהוסיף `if` לפי תחושת בטן.

---

# ‏88. Checklist לפני שמפעילים Filter בכסף אמיתי

‏שאל:

1. ‏מה בדיוק הוא מונע?
2. ‏למה הוא Hard ולא Soft?
3. ‏מה ה־Threshold ולמה?
4. ‏כמה הזדמנויות הוא מוחק?
5. ‏מה התוצאות של הנפסלות?
6. ‏האם הוא יציב בימים שונים?
7. ‏האם הוא עובד בשעות שונות?
8. ‏האם הוא תלוי ב־Feed מסוים?
9. ‏האם הוא מתועד ומנוטר?
10. ‏האם אפשר להשבית אותו במהירות?

---

# ‏89. תכנון Filter Engine פשוט

‏אפשר לחשוב על Output כזה לכל Symbol:

```text
symbol = XYZ
eligible = false

results:
  DATA_VALID       = PASS
  QUOTE_FRESH      = PASS
  TRADABLE         = PASS
  HALT             = PASS
  SPREAD_COST      = FAIL
  ACTIVITY         = PASS

rejection_reasons:
  - SPREAD_TOO_WIDE
```

‏זה הרבה יותר טוב מ־Boolean מסתורי.

---

# ‏90. Snapshot למחקר

‏לכל החלטת Filter נרצה לשמור:

```text
timestamp
symbol
filter_set_version
raw values
thresholds
pass/fail per filter
rejection reasons
future outcomes
```

‏כך אפשר לשחזר ולהשתפר.

---

# ‏91. מה חשוב במיוחד לרובוט שלך

‏אם נזקק את הפרק למערכת שלך, ה־Filters הקריטיים הראשונים כנראה יגיעו מהקטגוריות הבאות:

```text
DATA HEALTH
TRADABILITY
FRESHNESS
SPREAD / COST
RECENT ACTIVITY
LIQUIDITY RELATIVE TO SIZE
SIGNAL AGE
EXECUTION RECHECK
```

‏אבל הערכים עצמם לא ייבחרו לפי אינטואיציה.

‏נוכיח אותם במחקר.

---

# ‏92. מה לא נעשה עדיין

‏בשלב הזה אנחנו לא בונים:

- ‏`Score` מלא.
- ‏משקלים בין Features.
- ‏מודל ML.
- ‏כלל כניסה סופי.

‏למה?

‏כי קודם צריך להחליט:

> ‏מי בכלל ראויה להגיע לשלב הדירוג.

---

# ‏93. מה צריך לזכור משלב 12

1. ‏`Filter` קובע מי משתתף; `Score` קובע מי עדיף.
2. ‏תנאי בטיחות/תקינות/אפשרות ביצוע מתאימים בדרך כלל ל־Hard Filters.
3. ‏משתנים רציפים של איכות מתאימים לעיתים יותר ל־Soft Filters או Score.
4. ‏Filter קשוח מדי יכול למחוק את היתרון של סריקת כל השוק.
5. ‏יש לשמור `Rejection Reasons` ולא רק Pass/Fail.
6. ‏צריך למדוד גם מה קרה למניות שנפסלו.
7. ‏Threshold צריך לעבור Sensitivity Analysis ולא להיות “מספר יפה”.
8. ‏Filters צריכים Versioning, Observability ו־Shadow Mode.
9. ‏לפני Order אמיתי עושים `Execution Recheck` של התנאים הקריטיים.
10. ‏המטרה הסופית היא להגן על `Net Edge`, לא לייצר רשימת חוקים ארוכה.

---

# ‏94. בדיקת הבנה עצמית

‏נסה לענות בלי לחזור למעלה:

1. ‏מה ההבדל בין `Universe`, ‏`Filter` ו־`Score`?
2. ‏מה ההבדל בין Hard Filter ל־Soft Filter?
3. ‏למה `trades_10s >= 50` אינו בהכרח Hard Filter טוב?
4. ‏למה צריך לשמור גם את המניות שנפסלו?
5. ‏מה זה `Rejected Opportunity Analysis`?
6. ‏מה זה `Fail Closed`?
7. ‏למה Filter יחסי בלבד יכול להכריח מועמדות גרועות ביום חלש?
8. ‏מה זה `Margin to Threshold`?
9. ‏למה צריך להריץ Filter חדש קודם ב־Shadow?
10. ‏אילו Filters היית מגדיר כבטיחותיים לחלוטין לפני מסחר חי?

---

# ‏Checkpoint

‏שלב 12 בנה את שכבת הסינון שבין ה־Universe לבין מנוע ה־Features וה־Score. למדנו להפריד בין Filters של בטיחות ואפשרות ביצוע לבין העדפות איכות, לבנות משפך מדיד, לשמור סיבות פסילה, ולחקור גם הזדמנויות שנפסלו כדי לא להרוג Edge בטעות.

‏בשלב 13 נעבור ל־`Feature Engineering`: איך לוקחים Raw Market Data והופכים אותו למדדים שימושיים, יציבים ומדידים שיכולים באמת לעזור לדירוג כל השוק.