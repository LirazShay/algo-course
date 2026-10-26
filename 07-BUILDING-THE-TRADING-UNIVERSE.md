# ‏שלב 07 — בניית ה־`Universe`: מה באמת נחשב "כל השוק" עבור הרובוט שלך

> ‏מטרת הפרק: להבין איך בונים את רשימת כל ניירות הערך שהרובוט רשאי לבדוק, איך לא לפספס הזדמנויות, ואיך במקביל לא לתת לניירות לא מתאימים להתחרות עם מניות שאפשר באמת לקנות ולמכור תוך שניות.
>
> ‏העיקרון המרכזי: **"כל השוק" הוא נקודת התחלה רחבה, לא רשימת קנייה.** אנחנו מתחילים רחב ומצמצמים בשלבים.

---

# ‏1. מה זה בכלל `Universe`?

‏`Universe` הוא פשוט:

> ‏רשימת כל הניירות שהמערכת שלנו מוכנה בכלל לשקול.

‏אם יש בארה״ב אלפי Symbols, הרובוט צריך לדעת:

```text
מי קיים?
מי מניה רגילה?
מי ETF?
מי Warrant?
מי נעצר למסחר?
מי בכלל לא ניתן למסחר בחשבון שלי?
מי פעיל עכשיו?
מי מספיק נזיל?
```

‏לפני שמחשבים מומנטום או Score, צריך לדעת על מה אנחנו עובדים.

---

# ‏2. הטעות הראשונה: לחשוב ש־"כל הסימולים" = "כל המניות"

‏רשימת Symbols אמריקאית יכולה לכלול הרבה סוגי ניירות:

- ‏מניות רגילות.
- ‏`ETF`.
- ‏`ADR/ADS`.
- ‏מניות בכורה — `Preferred`.
- ‏`Warrants`.
- ‏`Rights`.
- ‏`Units`.
- ‏קרנות.
- ‏ניירות מיוחדים.
- ‏ניירות בדיקה.
- ‏Symbols שכבר אינם פעילים.

‏לכן אסור לקחת קובץ Symbols ופשוט לומר:

```text
scan everything
```

‏בלי להבין מה נמצא בפנים.

---

# ‏3. ארבע שכבות במקום רשימה אחת

‏לרובוט שלך עדיף לחשוב על ארבע שכבות:

```text
Base Universe
    ↓
Tradable Universe
    ↓
Active Universe
    ↓
Candidate Set
```

‏אחר כך:

```text
Ranking
    ↓
Top Candidate
    ↓
Trade / No Trade
```

‏כל שכבה עונה על שאלה אחרת.

---

# ‏4. `Base Universe`

‏זו הרשימה הרחבה ביותר.

‏השאלה שלה היא:

> ‏אילו ניירות בכלל קיימים ורלוונטיים לשוק שאני רוצה לכסות?

‏למשל:

```text
NASDAQ-listed
NYSE-listed
NYSE American
other exchange-listed US equities
```

‏לא בהכרח נכלול `OTC` בשלב הראשון.

‏ולא נניח ש־Nasdaq-listed אומר שהמסחר מתבצע רק ב־Nasdaq.

---

# ‏5. מאיפה מקבלים את הרשימה?

‏יש כמה חלופות אפשריות:

```text
Nasdaq Symbol Directory
Market Data Provider reference data
Broker contract database
Exchange reference files
Commercial security master
```

‏אנחנו לא תלויים במקור אחד.

‏המערכת שלנו צריכה Adapter שמתרגם כל מקור למבנה אחיד.

---

# ‏6. `Nasdaq Symbol Directory`

‏`Nasdaq Trader` מפרסמת Symbol Directory הכולל גם ניירות Nasdaq וגם ניירות הרשומים בבורסות אחרות.

‏הקבצים מתעדכנים במהלך יום המסחר.

‏הם כוללים שדות שימושיים כמו:

```text
Symbol
Security Name
Market Category
ETF flag
Test Issue flag
Round Lot Size
```

‏זה יכול להיות מקור טוב לבניית Reference Universe.

‏אבל גם כאן:

> ‏Reference data אינו בהכרח Market Data חי.

---

# ‏7. `Tradable Universe`

‏השכבה השנייה שואלת:

> ‏מתוך כל מה שקיים — במה החשבון שלי באמת יכול לסחור?

‏לדוגמה נייר יכול להיות קיים בשוק אבל:

- ‏אין לחשבון Trading Permission מתאים.
- ‏הברוקר לא מאפשר אותו.
- ‏הוא נסחר ב־Venue שלא נתמך.
- ‏הוא מסוג נייר שלא בחרנו לעבוד איתו.
- ‏הוא במצב שאינו מאפשר פתיחת עסקה.

‏לכן:

```text
Exists != Tradable
```

---

# ‏8. `Active Universe`

‏עכשיו אנחנו שואלים:

> ‏במה בכלל יש טעם להסתכל כרגע?

‏לדוגמה:

```text
Symbol exists
Tradable by broker
Market data is live
Not halted
Has recent activity
Has valid quote
```

‏רק עכשיו הוא נהיה מועמד אמיתי לסריקה.

---

# ‏9. `Candidate Set`

‏זוהי הקבוצה שנשארת אחרי Filters.

‏למשל:

```text
4,500 instruments in Base Universe
3,900 tradable
2,800 active
180 pass basic liquidity filters
23 show positive short-term momentum
7 pass execution filters
```

‏ואז רק את ה־7 האלה באמת צריך להשוות לעומק.

---

# ‏10. למה השכבות האלה חשובות?

‏כי הן מפרידות בין שאלות שונות:

```text
Does it exist?
Can I trade it?
Is it alive now?
Is it suitable now?
Is it one of the best now?
```

‏אם מערבבים הכול בתוך Score אחד, קשה להבין למה מניה נפסלה.

---

# ‏11. כלל חשוב: Filters קשים מול Filters רכים

## ‏`Hard Filter`

‏פסילה מוחלטת.

‏לדוגמה:

```text
trading_halted = true
```

‏אין טעם לתת Score.

## ‏`Soft Filter`

‏לא בהכרח פסילה — אולי רק הורדת עדיפות.

‏לדוגמה:

```text
spread slightly wider than ideal
```

‏אולי עדיין יש מצב שבו התנועה חזקה מספיק כדי לפצות על כך.

---

# ‏12. למה לא כדאי לסנן אגרסיבית מדי

‏נניח שקבענו:

```text
minimum trades per 10s = 100
```

‏מניה שעושה:

```text
95 trades
```

‏נפסלת.

‏אבל אולי היא דווקא המועמדת הטובה ביותר.

‏לכן כל Filter צריך לענות על השאלה:

> ‏האם זה תנאי בטיחות אמיתי, או פשוט Feature שאולי עדיף להשתמש בו בדירוג?

---

# ‏13. סוגי ניירות — מה מתאים לנו?

‏לקורס נשתמש כברירת מחדל ב־Core Universe פשוט יחסית:

```text
US exchange-listed common stocks
+
ADRs/ADSs where broker and data support them cleanly
```

‏ואפשר להוסיף בהמשך קבוצות נוספות בנפרד.

---

# ‏14. `Common Stock`

‏מניה רגילה היא המקרה הפשוט ביותר.

‏זו תהיה נקודת הפתיחה העיקרית שלנו.

‏למה?

- ‏מבנה ברור.
- ‏כיסוי נתונים טוב.
- ‏נזילות טובה בחלק גדול מהשוק.
- ‏קל יותר להשוות בין ניירות דומים.

---

# ‏15. `ADR / ADS`

‏אלה ניירות שמייצגים מניות של חברה זרה אבל נסחרים בארה״ב.

‏הם יכולים להתאים לרובוט שלנו.

‏אבל צריך לדעת שהם יכולים להיות מושפעים גם מ:

- ‏שוק הבית של החברה.
- ‏מטבע.
- ‏שעות מסחר שונות.
- ‏אירועים בחו״ל.

‏לכן כדאי לשמור `security_type` ולא להתייחס לכל Symbol כאותו דבר.

---

# ‏16. `ETF`

‏`ETF` הוא קרן נסחרת.

‏לדוגמה, היא יכולה לעקוב אחרי:

- ‏מדד.
- ‏סקטור.
- ‏אג״ח.
- ‏סחורה.

‏אפשר לסחור ב־ETF, אבל מבחינת המחקר כדאי לשקול Universe נפרד.

‏למה?

‏המנגנון שמניע ETF יכול להיות שונה ממניה בודדת.

‏לכן במקום לערבב:

```text
Stocks + ETFs
```

‏אפשר להחזיק:

```text
Universe A = Stocks
Universe B = ETFs
```

‏ולבדוק כל אחד בנפרד.

---

# ‏17. `Preferred Stock`

‏מניית בכורה היא מוצר שונה ממניה רגילה.

‏מאפייני המסחר והנזילות יכולים להיות שונים.

‏לשלב ראשון:

> ‏עדיף להשאיר אותה מחוץ ל־Core Universe.

‏אם בעתיד נראה סיבה טובה — נבנה לה מחקר נפרד.

---

# ‏18. `Warrant`

‏`Warrant` הוא נייר שנותן זכות לרכוש מניה לפי תנאים מסוימים.

‏הוא יכול להיות תנודתי מאוד ובעל Spread גדול.

‏למערכת שמנסה להרוויח מעט מאוד במהירות:

> ‏ברירת המחדל תהיה לא לערבב Warrants עם מניות רגילות.

---

# ‏19. `Rights` ו־`Units`

‏גם אלה מוצרים מיוחדים.

‏הם יכולים להופיע בתוך רשימות Symbols.

‏לכן אם לא מסננים לפי `security_type`, הם עלולים להיכנס לסורק בטעות.

---

# ‏20. `OTC`

‏`OTC` הוא מסחר מחוץ לבורסות המרכזיות.

‏יכולים להיות שם:

- ‏Spreads גדולים.
- ‏נזילות נמוכה.
- ‏מידע פחות אחיד.
- ‏סיכוני ביצוע שונים.

‏ל־Core Universe הראשוני שלנו:

```text
OTC = excluded
```

‏לא משום שאין שם הזדמנויות, אלא משום שזה שוק עם מאפיינים שונים שדורש אסטרטגיה ובדיקות משלו.

---

# ‏21. `Test Issues`

‏בורסות יכולות לכלול Symbols שמשמשים לבדיקות.

‏Nasdaq Symbol Directory מסמנת שדה:

```text
Test Issue = Y/N
```

‏ברובוט אמיתי:

```text
Test Issue = Y
→ reject
```

‏זה Hard Filter ברור.

---

# ‏22. מניות שחדלו להיסחר

‏Symbols יכולים:

- ‏להימחק.
- ‏להשתנות.
- ‏לעבור בורסה.
- ‏להתמזג.
- ‏לעבור Corporate Action.

‏לכן Universe אינו קובץ שמייצרים פעם אחת ושוכחים.

‏צריך Refresh.

---

# ‏23. Universe הוא Dynamic

‏המערכת צריכה לעדכן אותו.

‏למשל:

```text
Startup
    ↓
Load reference universe
    ↓
Validate against broker/provider
    ↓
During day: apply status updates
    ↓
Next session: rebuild/refresh
```

‏לא חייבים לבצע Full Rebuild כל שנייה.

---

# ‏24. IPO חדש

‏חברה חדשה יכולה להתחיל להיסחר במהלך היום.

‏השאלה היא:

> ‏האם להכניס אותה מיד לסורק?

‏אין תשובה אחת נכונה.

‏IPO חדש יכול להיות:

- ‏מאוד פעיל.
- ‏מאוד תנודתי.
- ‏בעל Spreads משתנים.
- ‏עם מעט היסטוריה.

‏לכן נוכל להגדיר:

```text
new_listing = special class
```

‏ולא להתייחס אליו אוטומטית כמו מניה ותיקה.

---

# ‏25. `Trading Halt`

‏מניה יכולה להיעצר למסחר.

‏זה יכול לקרות למשל בגלל:

- ‏חדשות.
- ‏תנודתיות חריגה.
- ‏בעיה רגולטורית.
- ‏אירוע תפעולי.

‏Nasdaq מפרסמת רשימת Halts ו־reason codes.

‏עבור רובוט:

```text
halted = true
→ no new orders
```

‏וצריך גם לטפל נכון בחזרה למסחר.

---

# ‏26. למה Resume אחרי Halt הוא מצב מיוחד

‏כאשר מסחר חוזר אחרי עצירה:

- ‏המחיר יכול לקפוץ.
- ‏ה־Spread יכול להיות רחב.
- ‏נזילות יכולה להשתנות.
- ‏ה־Last הקודם יכול להיות לא רלוונטי.

‏לכן:

```text
resume_from_halt
```

‏יכול להיות State מיוחד שדורש Cooldown או בדיקת איכות נוספת.

---

# ‏27. `LULD`

‏`LULD` קשור למנגנוני עצירת תנודתיות במניות אמריקאיות.

‏בפשטות:

> ‏כאשר המחיר נע בצורה קיצונית מדי ביחס לטווחים המותרים, המסחר יכול להיכנס למצב מוגבל או להיעצר זמנית.

‏לרובוט של שניות זה חשוב מאוד.

‏מניה שנראית כמו "המומנטום הכי חזק בשוק" יכולה להיות בדיוק מניה שמתקרבת לעצירת תנודתיות.

---

# ‏28. למה לא נרצה לרדוף אחרי כל קפיצה

‏דוגמה:

```text
AAA +8% in 30 seconds
```

‏זה נשמע מדהים.

‏אבל צריך לשאול:

```text
Is trading stable?
Is spread exploding?
Is a halt imminent?
Is there enough liquidity to exit?
```

‏לכן Score גבוה אינו מבטל Safety Gate.

---

# ‏29. מחיר המניה — האם לסנן?

‏אפשר להגדיר טווח:

```text
min_price
max_price
```

‏אבל צריך להבין למה.

‏מניה ב־$1 ומניה ב־$500 מתנהגות אחרת מבחינת:

- ‏Tick size relative to price.
- ‏Spread באחוזים.
- ‏כמות מניות שאפשר לקנות בתקציב קבוע.
- ‏תנודתיות.

‏לכן מחיר הוא Feature חשוב.

‏אבל אין צורך לבחור עכשיו מספר קסם בלי נתונים.

---

# ‏30. מה חשוב יותר ממחיר מוחלט?

‏לעיתים:

```text
spread_pct
```

‏חשוב יותר מהמחיר עצמו.

‏לדוגמה:

```text
Stock A = $2.00
Spread = $0.01
Spread % = 0.50%
```

‏לעומת:

```text
Stock B = $100
Spread = $0.01
Spread % = 0.01%
```

‏אותו סנט — משמעות שונה לחלוטין.

---

# ‏31. נפח יומי אינו מספיק

‏מניה יכולה להיות עם Daily Volume גבוה אבל כרגע שקטה.

‏ומניה אחרת יכולה להיות בדרך כלל שקטה אבל עכשיו להתפוצץ בפעילות.

‏לכן נבדיל בין:

```text
Static liquidity profile
```

‏לבין:

```text
Live activity
```

---

# ‏32. `Static Filters`

‏אלה דברים שמשתנים לאט.

‏לדוגמה:

```text
security_type
exchange
listing_status
average_daily_volume
price_band
broker_permission
```

‏אפשר לחשב אותם לפני המסחר או לרענן מדי פעם.

---

# ‏33. `Dynamic Filters`

‏אלה משתנים כל הזמן.

‏לדוגמה:

```text
spread now
trades_10s
volume_10s
data_age
halt_status
current volatility
```

‏אותם צריך לבדוק בזמן אמת.

---

# ‏34. למה החלוקה חשובה לביצועים

‏אין טעם לחשב כל שנייה לכל מניה:

```text
Is this a warrant?
```

‏זה כמעט לא משתנה.

‏אפשר לחשב פעם אחת.

‏לעומת זאת:

```text
spread now
```

‏יכול להשתנות כל רגע.

‏כך חוסכים עבודה.

---

# ‏35. `Tradability Check`

‏לפני Candidate אמיתי אפשר לבדוק:

```text
can_buy
can_sell
market_open
not_halted
valid_quote
fresh_data
valid_price
```

‏אם אחד התנאים הקריטיים אינו מתקיים:

```text
reject
```

---

# ‏36. מה אם ספק הנתונים רואה מניה אבל הברוקר לא?

‏זה יכול לקרות.

‏לכן צריך Mapping בין:

```text
Market Data Symbol
Broker Contract
```

‏לדוגמה:

```text
Provider symbol = XYZ
Broker contract id = 123456
```

‏אם אין Mapping תקין:

```text
not tradable yet
```

---

# ‏37. `Symbol` אינו תמיד מזהה יציב

‏Symbol יכול להשתנות.

‏חברות יכולות:

- ‏להחליף ticker.
- ‏להתמזג.
- ‏לעבור restructuring.

‏לכן כדאי לשמור גם מזהים יציבים ככל האפשר:

```text
provider_instrument_id
broker_contract_id
exchange
security_type
```

---

# ‏38. `Universe Snapshot`

‏בכל תחילת יום כדאי להיות מסוגלים לשמור:

```text
Universe version
Timestamp
Source
Number of instruments
Inclusion rules
Exclusion rules
```

‏למה?

‏כדי שאחרי חודש נוכל לדעת:

> ‏אילו מניות בכלל היו זמינות לסורק באותו יום?

---

# ‏39. למה זה חשוב ל־Backtest

‏אחת הטעויות הקשות במחקר היא:

`Survivorship Bias`

‏בפשטות:

> ‏לבדוק את העבר רק על מניות ששרדו עד היום.

‏חברות שנמחקו, נכשלו או נרכשו נעלמות מהרשימה הנוכחית.

‏אם עושים Backtest היסטורי רק על הרשימה של היום, מקבלים עולם "יפה מדי".

---

# ‏40. דוגמה ל־Survivorship Bias

‏נניח שב־2022 היו:

```text
4,000 stocks
```

‏והיום נשארו רק:

```text
3,500 of them
```

‏אם אנחנו בודקים אסטרטגיית 2022 רק על 3,500 השורדות, אנחנו מוחקים מהמחקר את 500 הניירות שנעלמו.

‏זה יכול לעוות תוצאות.

---

# ‏41. לכן Historical Universe הוא Dataset בפני עצמו

‏ב־Backtest רציני נרצה לדעת:

```text
Which symbols existed on date X?
Which were tradable?
Which were halted?
Which were newly listed?
```

‏זה חלק מהנתונים, לא פרט מנהלי.

---

# ‏42. האם לכלול מניות קטנות מאוד?

‏זו שאלה אסטרטגית.

‏לסכום קטן יש יתרון בכך שאיננו צריכים עומק ענק.

‏אבל מניות קטנות מאוד יכולות להביא:

- ‏Spread גדול.
- ‏Liquidity נמוכה.
- ‏קפיצות מחיר חדות.
- ‏Partial fills.
- ‏סיכון Halt גבוה יותר.

‏לכן לא נחליט לפי Market Cap בלבד.

‏נבדוק בעיקר:

```text
Can I enter and exit my actual position size efficiently?
```

---

# ‏43. למה הסכום שלך משנה את Universe

‏נניח שיש לך $5,000.

‏אם בכל עסקה אתה משתמש למשל בחלק מהסכום, הכמות שלך קטנה יחסית למניה מאוד נזילה.

‏לכן מניה שלא מתאימה לקרן של מיליארד דולר יכולה להתאים לך מצוין.

‏זה יתרון אמיתי של מערכת קטנה.

‏אבל עדיין צריך לוודא:

```text
available size >> our order size
```

‏ולא להסתפק ב־Daily Volume.

---

# ‏44. `Position-size-aware universe`

‏זה רעיון חשוב.

‏במקום לשאול:

> ‏האם המניה נזילה באופן כללי?

‏נשאל:

> ‏האם היא נזילה מספיק **לכמות שאני רוצה לבצע עכשיו**?

‏אם אנחנו רוצים לקנות 30 מניות, ייתכן ש־300 מניות זמינות ב־Ask הן מספיקות.

‏אם היינו רוצים 100,000 מניות — לא.

---

# ‏45. `Universe` יכול להשתנות לפי הון

‏אם בעתיד החשבון גדל:

```text
$5,000 → $50,000 → $500,000
```

‏ייתכן שחלק מהמניות שהיו מתאימות כבר לא יתאימו לאותו גודל Position.

‏לכן Universe אינו החלטה לכל החיים.

---

# ‏46. `Universe` לפי Session

‏Pre-Market, מסחר רגיל ו־After-Hours אינם אותו שוק.

‏אותה מניה יכולה להיות:

```text
very liquid at 10:30 ET
```

‏אבל:

```text
almost dead at 07:00 ET
```

‏לכן Active Universe צריך להיות Session-aware.

---

# ‏47. `Universe` לפי מצב שוק

‏גם יום מסחר שקט ויום תנודתי שונים.

‏לכן Thresholds קשיחים מדי יכולים להיות בעייתיים.

‏אפשר בעתיד להשוות:

```text
absolute thresholds
```

‏מול:

```text
relative thresholds
```

‏למשל:

> ‏Top 5% activity today

‏במקום:

> ‏לפחות 100 עסקאות בכל 10 שניות תמיד.

---

# ‏48. Universe אינו Score

‏זה חשוב.

‏Universe אומר:

```text
allowed to compete
```

‏Score אומר:

```text
how attractive compared with competitors
```

‏לא כדאי לערבב את שתי השאלות.

---

# ‏49. `NO TRADE` עדיין קיים

‏גם אם יש:

```text
3,000 active symbols
```

‏תמיד יהיה מקום ראשון.

‏אבל מקום ראשון יכול להיות גרוע.

‏לכן:

```text
Universe
→ Ranking
→ Best
→ Quality threshold
→ Trade / No Trade
```

---

# ‏50. איך כדאי לבנות את ה־Universe אצלנו

‏המודל המומלץ לקורס:

```text
REFERENCE UNIVERSE
US exchange-listed equities
        ↓
TYPE FILTER
Common stocks / selected ADRs
        ↓
BROKER ELIGIBILITY
Can our execution broker trade it?
        ↓
MARKET STATUS
Open / not halted / valid
        ↓
DATA QUALITY
Fresh market data
        ↓
LIVE TRADABILITY
Spread / activity / executable size
        ↓
ACTIVE UNIVERSE
        ↓
MOMENTUM FILTERS
        ↓
CANDIDATES
        ↓
SCORE / RANK
```

---

# ‏51. למה לא נשתמש רק ב־IBKR Scanner

‏`IBKR` או כל ברוקר יכולים להציע Scanner משלהם.

‏זה יכול להיות כלי עזר.

‏אבל האסטרטגיה שלנו רוצה:

- ‏Universe בשליטתנו.
- ‏Features משלנו.
- ‏קצב משלנו.
- ‏יכולת להחליף Data Provider.
- ‏יכולת Replay ו־Backtest.

‏לכן Scanner חיצוני יכול להיות Source נוסף, לא Source of Truth יחיד.

---

# ‏52. למה לא נשתמש רק באתר בנק לאומי

‏אם ניתן לקרוא ממנו נתונים בצורה יציבה ומתאימה, הוא יכול להיות Source שימושי.

‏אבל צריך למדוד:

```text
Coverage
Freshness
Update cadence
Fields
Reliability
Terms of use
Recovery behavior
```

‏אם הוא טוב — Adapter.

‏אם לא — מחליפים או משלבים מקור נוסף.

‏האסטרטגיה לא משתנה בגלל ספק.

---

# ‏53. למה לא נשתמש רק ב־Alpaca

‏אותו עיקרון.

‏`Alpaca` יכולה להיות פתרון מצוין לשכבה מסוימת.

‏אבל התכנון שלנו אינו:

```text
Alpaca strategy
```

‏אלא:

```text
Algo strategy
    +
MarketDataProvider adapter
    +
ExecutionBroker adapter
```

‏כך אפשר להחליף ספק בלי לשכתב את הלוגיקה העסקית.

---

# ‏54. כמה Sources אפשר לשלב?

‏טכנית אפשר יותר מאחד.

‏לדוגמה:

```text
Reference symbols → Nasdaq directory
Wide live feed    → Provider A
Execution quotes  → Broker
Orders            → Broker
Halts              → exchange/provider status feed
Historical data   → Provider B
```

‏אבל כל Source נוסף מגדיל מורכבות.

‏לכן:

> ‏נוסיף מקור רק כאשר יש סיבה ברורה.

---

# ‏55. מקור אמת לכל סוג מידע

‏כדאי להגדיר מראש:

```text
Who is authoritative for symbols?
Who is authoritative for live price?
Who is authoritative for order status?
Who is authoritative for position?
Who is authoritative for halt status?
```

‏למשל:

```text
Order status → execution broker
Position     → execution broker
```

‏גם אם Market Data מגיע ממקום אחר.

---

# ‏56. `Universe Refresh`

‏צריך להחליט מתי מרעננים.

‏דוגמה טובה:

```text
Before market session
Periodic lightweight refresh
On provider/broker status change
On corporate action / new listing event
```

‏לא חייבים להוריד הכול מחדש בכל שנייה.

---

# ‏57. `Universe Version`

‏כל גרסת Universe צריכה מזהה.

‏לדוגמה:

```text
universe_version = 2026-10-26-RTH-001
```

‏כאשר עסקה מתבצעת, נשמור גם:

```text
which universe version selected this symbol
```

‏כך אפשר לשחזר החלטות.

---

# ‏58. Audit — למה מניה נכנסה או יצאה

‏עבור כל Symbol כדאי להיות מסוגלים לומר:

```text
included: common_stock
tradable: yes
halted: no
data_fresh: yes
spread_gate: passed
activity_gate: passed
```

‏או:

```text
rejected_reason = stale_quote
```

‏זה עושה Debugging הרבה יותר קל.

---

# ‏59. למה `rejected_reason` חשוב למחקר

‏נניח אחרי חודש אנחנו מגלים שמניות שנפסלו בגלל Spread רחב דווקא המשיכו לעלות הרבה.

‏אם שמרנו רק:

```text
candidate = false
```

‏אין לנו מושג למה.

‏אם שמרנו:

```text
rejected_reason = spread_too_wide
```

‏אפשר לבדוק את ההחלטה.

---

# ‏60. Universe Funnel Metrics

‏כל מחזור אפשר למדוד:

```text
Base             = 4,500
Tradable         = 4,100
Fresh Data       = 3,980
Not Halted       = 3,970
Liquidity Pass   = 2,300
Momentum Pass    = 45
Final Candidates = 8
```

‏זה נותן לנו בריאות מערכתית.

‏אם פתאום:

```text
Fresh Data = 300
```

‏יש כנראה תקלה ב־Feed.

---

# ‏61. Universe Health הוא גם מנגנון בטיחות

‏אם בדרך כלל יש:

```text
4,000 tradable symbols
```

‏ופתאום יש:

```text
17
```

‏לא ממשיכים לסחור כאילו הכול רגיל.

‏זה יכול להיות:

- ‏Feed failure.
- ‏Reference data failure.
- ‏Authentication problem.
- ‏Session problem.

‏לכן:

```text
Universe abnormal → NO NEW TRADES
```

---

# ‏62. Universe לא חייב להיות כולו בזיכרון כבד

‏אפשר לשמור לכל Symbol State קטן:

```text
symbol
instrument_id
type
tradable
halted
last_price
last_update
basic_activity
```

‏ורק למועמדות מובילות לשמור מידע עשיר יותר.

‏זה ממשיך את עקרון:

```text
Wide cheap scan
→ Deep expensive analysis
```

---

# ‏63. מה אנחנו לא צריכים בשלב הזה

‏אנחנו עדיין לא צריכים להחליט:

- ‏Score סופי.
- ‏משקלים.
- ‏חלון מומנטום מנצח.
- ‏פקודת כניסה סופית.

‏שלב 07 רק בונה את הזירה שבה המניות יתחרו.

---

# ‏64. ברירת המחדל המעשית שלנו

‏למחקר הראשוני של האסטרטגיה הייתי מתחיל ב:

```text
US exchange-listed common stocks
+ selected ADR/ADS
- test issues
- warrants
- rights
- units
- preferreds
- OTC
- currently halted securities
```

‏ו־ETF נשמור כ־Universe נפרד להשוואה.

‏זו לא אמת נצחית.

‏זו נקודת פתיחה נקייה למחקר.

---

# ‏65. למה זו נקודת פתיחה טובה

‏היא נותנת לנו:

- ‏אלפי מניות.
- ‏מגוון עצום של מומנטום.
- ‏מבנה יחסית אחיד.
- ‏פחות רעש ממוצרים מיוחדים.
- ‏יכולת להוסיף קבוצות נוספות בעתיד בלי לבלבל את המחקר הראשוני.

---

# ‏66. מתי נרחיב?

‏רק אם יש שאלה מחקרית ברורה.

‏לדוגמה:

```text
Do ETFs produce cleaner short momentum?
```

‏אז נוסיף ETF ונבדוק.

‏לא נוסיף פשוט כי הם קיימים.

---

# ‏67. כלל הזהב של Universe

> ‏**ה־Universe צריך להיות רחב מספיק כדי לא לפספס הזדמנויות, אבל נקי מספיק כדי שכל מה שנשאר יהיה מוצר שהרובוט באמת מבין ויכול לבצע בו עסקה.**

---

# ‏68. מה צריך לזכור משלב 07

‏אם תזכור עשר נקודות:

1. ‏`Universe` אינו רשימת קנייה — הוא מרחב החיפוש.
2. ‏"כל השוק" כולל סוגי ניירות שונים, לא רק מניות רגילות.
3. ‏נשתמש בשכבות: `Base → Tradable → Active → Candidates`.
4. ‏`Hard Filters` מיועדים למצבים שאסור/לא הגיוני לסחור בהם; Features אחרים עדיף לעיתים להשאיר לדירוג.
5. ‏לשלב הראשון עדיף Core Universe של מניות רגילות + ADR/ADS נבחרים.
6. ‏ETF עדיף לבדוק כ־Universe נפרד ולא לערבב אוטומטית.
7. ‏Halts ו־LULD חייבים להיות חלק ממצב המניה.
8. ‏Universe חייב להיות Dynamic ומתועד לפי Version.
9. ‏Backtest חייב להשתמש ב־Historical Universe כדי להימנע מ־Survivorship Bias.
10. ‏ה־Universe צריך להתחשב בגודל הפוזיציה האמיתי שלך, לא רק בנזילות "כללית".

---

# ‏69. בדיקת הבנה עצמית

‏נסה לענות בלי לחזור למעלה:

1. ‏מה ההבדל בין `Base Universe` ל־`Active Universe`?
2. ‏למה לא כדאי להכניס Warrants אוטומטית עם מניות רגילות?
3. ‏מה ההבדל בין Hard Filter לבין Feature לדירוג?
4. ‏למה `Daily Volume` לבדו אינו מספיק?
5. ‏מה זה Survivorship Bias?
6. ‏למה צריך Historical Universe ב־Backtest?
7. ‏למה Halt חייב לפסול מסחר חדש?
8. ‏למה ETF כדאי לבדוק בנפרד?
9. ‏למה גודל החשבון שלך משפיע על מה שנחשב נזיל מספיק?
10. ‏למה חשוב לשמור `rejected_reason`?

---

# ‏70. מקורות רשמיים שנבדקו לפרק

‏הפרק נבדק מול מקורות רשמיים עדכניים נכון ל־26 באוקטובר 2026:

- ‏`Nasdaq Trader Symbol Directory` — רשימות Symbols, שדות `ETF`, ‏`Test Issue`, ‏Market Category ועוד.
- ‏`Nasdaq Trader Symbol Directory Definitions` — הגדרות השדות והעדכון במהלך יום המסחר.
- ‏`Nasdaq Trader Trading Halts` — סטטוס עצירות מסחר.
- ‏`Nasdaq Trader Trade Halt Codes` — סיבות לעצירה, Resume, ‏LULD ומצבים רגולטוריים.

‏במערכת חיה נעדיף Feed/Status source שמתאים לקצב הדרוש לנו; מקור שמתעדכן פעם בדקה יכול להיות Reference חשוב אבל אינו בהכרח מספיק לבדו להחלטת מסחר של שניות.

---

# ‏Checkpoint

‏שלב 07 הגדיר את מרחב החיפוש של הרובוט ואת מנגנון הצמצום מ־"כל השוק" אל קבוצה של ניירות שבאמת ראויים להתחרות על העסקה הבאה.

‏בשלב 08 נתחיל למדוד את הדבר המרכזי שהאסטרטגיה מחפשת: **מומנטום קצר — איך מודדים תנועה בחלונות של שנייה, 5, 10, 30 ו־60 שניות, ומה כל חלון באמת מספר לנו.**