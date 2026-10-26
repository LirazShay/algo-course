# ‏שלב 06 — זמן, Sampling ו־Latency: האם האות עדיין שווה משהו כשהפקודה מגיעה לשוק?

> ‏מטרת הפרק: להבין את ממד הזמן במערכת שלך. לא רק **מה** קרה למניה, אלא **מתי** זה קרה, מתי המחשב שלך ראה את זה, מתי הסורק החליט, ומתי הפקודה באמת הגיעה לשוק.
>
> ‏במערכת שמחזיקה עסקה שניות עד דקה, זמן אינו פרט טכני. הוא חלק מהאסטרטגיה.
>
> ‏עיקרון נוסף של הקורס: **אנחנו לא מתכננים לפי המגבלה של ספק נתונים מסוים. קודם מגדירים מה המערכת האידאלית צריכה, אחר כך בוחרים מקור או שילוב מקורות שיכולים לספק זאת.**

---

# ‏1. הרעיון המרכזי

‏נניח שהסורק שלך מצא מניה מצוינת.

‏היא התחילה לעלות ב־:

```text
14:30:00.000
```

‏אבל הרובוט קנה אותה רק ב־:

```text
14:30:03.000
```

‏אם כל המהלך החזק נמשך ארבע שניות, רוב היתרון כבר נעלם.

‏לכן לא מספיק לשאול:

> ‏האם מצאנו מניה טובה?

‏צריך לשאול:

> ‏האם מצאנו אותה **בזמן**?

---

# ‏2. שני סוגי זמן שקל לערבב

## ‏א. `Sampling Interval`

‏כל כמה זמן אנחנו בודקים, מחשבים או מדרגים את השוק.

‏לדוגמה:

```text
Every 10 seconds
Every 1 second
Every 250 ms
```

## ‏ב. `Latency`

‏כמה זמן עובר מרגע שאירוע קרה בשוק ועד שהמערכת שלנו הגיבה אליו.

‏לדוגמה:

```text
Market Event
    ↓
Data Provider
    ↓
Internet
    ↓
Collector
    ↓
Features
    ↓
Scanner
    ↓
Decision
    ↓
Broker
    ↓
Exchange / Venue
    ↓
Fill
```

‏אלה שני דברים שונים.

‏אפשר לסרוק פעם בשנייה ועדיין להיות עם `Latency` של שלוש שניות.

‏ואפשר לקבל Feed מהיר מאוד אבל לדרג את כל השוק רק פעם בשנייה.

---

# ‏3. מה זה `Sampling` בפשטות?

‏`Sampling` = לקחת תמונת מצב בפרקי זמן מסוימים.

‏לדוגמה:

```text
12:00:00  price = 100.00
12:00:10  price = 100.20
12:00:20  price = 100.35
```

‏אם אנחנו דוגמים כל 10 שניות, אנחנו רואים שלוש תמונות.

‏אבל אנחנו לא יודעים בדיוק מה קרה ביניהן.

---

# ‏4. מה יכול לקרות בין שתי דגימות?

‏נניח שדגמנו ב־0 וב־10 שניות:

```text
00s = 100.00
10s = 100.01
```

‏זה נראה כמעט ללא תנועה.

‏אבל בפועל יכול היה לקרות:

```text
00s = 100.00
02s = 100.15
04s = 100.30
06s = 100.10
08s = 99.95
10s = 100.01
```

‏כל האירוע החשוב נעלם מה־Sampling שלנו.

‏לכן:

> ‏דגימה לא רק מקטינה כמות נתונים. היא גם משנה את מה שאנחנו מסוגלים לראות.

---

# ‏5. למה זה חשוב במיוחד למומנטום קצר?

‏האסטרטגיה שלך מחפשת תנועה שיכולה להימשך:

```text
שניות
עד
בערך דקה
```

‏אם אתה בודק רק פעם ב־10 שניות, תנועה של שתי שניות יכולה להתחיל ולהסתיים בין שתי בדיקות.

‏זה לא אומר ש־10 שניות תמיד גרוע.

‏זה אומר שאנחנו חייבים לשאול:

> ‏מהו משך החיים הטיפוסי של האות שאנחנו מנסים לזהות?

---

# ‏6. מושג חשוב: `Signal Half-Life`

‏המונח נשמע מסובך, אבל הרעיון פשוט.

‏נניח שמצאנו אות שמנבא תנועה חיובית.

‏ברגע האיתות יש לו ערך מסוים.

‏אחרי שנייה אולי הוא עדיין חזק.

‏אחרי 10 שניות אולי הוא חלש.

‏אחרי דקה אולי כבר אין לו שום משמעות.

‏אפשר לחשוב על זה כך:

```text
Signal detected       = strong
+1 second             = still strong
+5 seconds            = medium
+15 seconds           = weak
+60 seconds           = gone
```

‏המטרה שלנו בהמשך המחקר תהיה למדוד את זה בפועל.

‏אם האות שלך שווה משהו רק ל־2 שניות, מערכת עם Latency של 3 שניות לא יכולה לנצל אותו.

---

# ‏7. `Event-Driven` מול `Polling`

‏יש שתי דרכים בסיסיות לקבל מידע.

## ‏`Polling`

‏התוכנה שואלת שוב ושוב:

```text
מה המחיר עכשיו?
מה המחיר עכשיו?
מה המחיר עכשיו?
```

‏למשל פעם בשנייה.

## ‏`Event-Driven`

‏הספק שולח אלינו אירוע כאשר משהו משתנה.

```text
Trade happened
→ event

Bid changed
→ event

Ask changed
→ event
```

‏למערכת מסחר בזמן אמת, Stream/Event-Driven הוא בדרך כלל מבנה טבעי יותר כאשר הספק מאפשר אותו.

---

# ‏8. אבל Event-Driven לא אומר שחייבים לדרג את כל השוק בכל Tick

‏זאת נקודה חשובה מאוד.

‏נניח שיש לנו 4,000 מניות וכל אחת מייצרת הרבה אירועים.

‏גישה נאיבית:

```text
Every event
    ↓
Recalculate every stock
    ↓
Sort all 4,000
    ↓
Choose best
```

‏זו עבודה מיותרת.

‏גישה טובה יותר:

```text
Event arrives for XYZ
    ↓
Update only XYZ state/features
    ↓
Keep latest score/state
    ↓
Rank/select at controlled cadence
```

‏כלומר:

> ‏ה־Feed יכול להיות Event-Driven, בזמן שהחלטת ה־Ranking פועלת בקצב אחר.

---

# ‏9. שלושה קצבים שונים במערכת

‏כדאי להפריד לפחות בין שלושה קצבים.

## ‏`Feed Rate`

‏כמה מהר מקור הנתונים שולח עדכונים.

## ‏`Feature Update Rate`

‏כמה מהר אנחנו מעדכנים Features למניה.

## ‏`Decision Rate`

‏כמה מהר אנחנו שואלים:

> ‏מי המניה הטובה ביותר עכשיו?

‏לדוגמה אפשר לקבל:

```text
Feed            = continuous events
Feature updates = on every relevant event
Global ranking  = every 500 ms
Trade decision  = every 500 ms
```

‏או:

```text
Feed            = continuous events
Feature updates = continuous
Global ranking  = every 1 second
Trade decision  = every 1 second
```

‏אין חוק שאומר שכל שלושת הקצבים חייבים להיות זהים.

---

# ‏10. למה זה מצוין לסריקה של כל השוק?

‏במקום לקרוא מחדש 4,000 מניות פעם בשנייה, אפשר לשמור בזיכרון את המצב האחרון של כל מניה.

```text
AAPL → current state
MSFT → current state
NVDA → current state
...
```

‏כל אירוע מעדכן רק את המניה שלו.

‏ואז פעם בפרק זמן שאנחנו בוחרים:

```text
Rank current states
```

‏כך הסורק יכול להיות מהיר גם בלי לעשות אלפי קריאות רשת בכל מחזור.

---

# ‏11. אין סיבה להיות מוגבלים ל־`IBKR`

‏זה עיקרון ארכיטקטוני של הקורס.

‏למערכת יהיו שני Interfaces רעיוניים שונים:

```text
IMarketDataProvider
IExecutionBroker
```

‏במילים פשוטות:

```text
מי מספר לי מה קורה בשוק?

מי מבצע עבורי את העסקה?
```

‏אלה לא חייבים להיות אותו גוף.

---

# ‏12. מקורות נתונים אפשריים

‏מקור הנתונים יכול להיות למשל:

- ‏`IBKR`.
- ‏`Alpaca`.
- ‏ספק Market Data ייעודי אחר.
- ‏מידע שמופיע באתר בנק לאומי, אם הוא מתאים טכנית ומותר לשימוש באופן הדרוש.
- ‏יותר ממקור אחד יחד.
- ‏קובץ Replay ששמרנו בעצמנו.

‏אנחנו לא מניחים מראש שאחד מהם הוא הטוב ביותר.

‏אנחנו מודדים.

---

# ‏13. ומה אם מקור אחד מוגבל?

‏נניח שספק א' מאפשר רק מספר קטן של Symbols בו־זמנית.

‏זו לא סיבה לשנות את האסטרטגיה.

‏זו סיבה לשאול:

```text
Is there another provider?
Can providers be combined?
Can one source scan and another execute?
Can we use a wide feed + deep feed?
```

‏הסדר הנכון הוא:

```text
Strategy requirement
    ↓
Technical requirement
    ↓
Provider evaluation
    ↓
Choose provider(s)
```

‏ולא:

```text
Provider limitation
    ↓
Force strategy to fit it
```

---

# ‏14. דוגמה לארכיטקטורה עם שני ספקים

```text
Alpaca / other broad feed
        ↓
All-market stream
        ↓
Collector
        ↓
Scanner + Ranking
        ↓
Top Candidate
        ↓
Fresh execution check
        ↓
IBKR
        ↓
Order
```

‏זו רק דוגמה.

‏אפשר להחליף כל קופסה.

---

# ‏15. דוגמה עם מקור מהאתר של בנק לאומי

‏אם באתר מסוים מופיעים נתוני שוק שמתאימים למטרה, אפשר עקרונית לבנות Adapter שקורא אותם — **בתנאי שהגישה מותרת, יציבה ומתאימה לשימוש**.

‏אבל אסור להניח שנתוני אתר הם אוטומטית Feed טוב לרובוט.

‏צריך למדוד:

- ‏האם הם בזמן אמת.
- ‏כל כמה זמן הם מתעדכנים.
- ‏האם רואים את כל המניות הדרושות.
- ‏האם הם `Last` בלבד או גם `Bid/Ask`.
- ‏האם הנתונים Consolidated או ממקור חלקי.
- ‏האם האתר משנה DOM/פורמט לעיתים קרובות.
- ‏מה קורה כשה־Session פג.
- ‏מה תנאי השימוש והרישוי.
- ‏כמה מהר אפשר לזהות תקלה.

‏כלומר:

> ‏אתר יכול להיות מקור נתונים אפשרי, אבל הוא חייב לעבור אותה בדיקת איכות כמו API מקצועי.

---

# ‏16. היתרון של Adapter

‏ה־Scanner לא צריך לדעת אם הנתון הגיע מ־:

```text
IBKR
Alpaca
Leumi website
Provider X
Replay file
```

‏כולם צריכים להפוך אצלנו לאותו מבנה:

```text
MarketEvent
{
    Symbol
    EventTime
    ReceiveTime
    Last
    Bid
    Ask
    Volume
    Source
}
```

‏אחר כך שאר המערכת עובדת אותו דבר.

‏זה נותן לנו חופש להחליף ספק בלי לכתוב מחדש את האסטרטגיה.

---

# ‏17. המושג החשוב: `Latency Budget`

‏`Latency Budget` = כמה זמן אנחנו מרשים לכל השרשרת לקחת.

‏נניח שאנחנו רוצים שהחלטה תגיע לביצוע בתוך שנייה אחת.

‏אפשר לחלק את התקציב:

```text
Provider delay       150 ms
Network              50 ms
Collector             20 ms
Feature calculation   30 ms
Ranking               30 ms
Decision              20 ms
Broker/network       150 ms
Venue/fill           200 ms
----------------------------
Total                650 ms
```

‏המספרים כאן רק דוגמה.

‏המטרה היא להבין:

> ‏Latency הוא סכום של כמה חלקים, לא מספר קסם אחד.

---

# ‏18. זמני המפתח שכדאי לשמור

‏לכל החלטה נרצה, ככל האפשר, לשמור:

```text
market_event_time
provider_timestamp
receive_time
feature_ready_time
scan_time
signal_time
order_submit_time
broker_ack_time
fill_time
```

‏לא כל Provider נותן את כולם.

‏אבל מה שאפשר — שומרים.

---

# ‏19. דוגמה מלאה

```text
Market event       14:30:00.000
Our machine sees   14:30:00.180
Features ready     14:30:00.210
Rank completed     14:30:00.240
Decision           14:30:00.245
Order submitted    14:30:00.260
Broker ACK         14:30:00.330
Fill               14:30:00.470
```

‏עכשיו אפשר לחשב.

```text
Data latency       = 180 ms
Compute latency    = 65 ms
Execution latency  = 225 ms
End-to-end         = 470 ms
```

‏בלי המדידות האלה, כל דיון על "המערכת מהירה" הוא רק תחושה.

---

# ‏20. `Event Time` מול `Receive Time`

‏`Event Time` אומר:

> ‏מתי האירוע קרה בשוק לפי המקור.

‏`Receive Time` אומר:

> ‏מתי המחשב שלנו קיבל אותו.

‏ההפרש ביניהם הוא חלק חשוב מה־Latency.

‏אם נשמור רק Receive Time, לא נדע אם הספק עצמו איחר.

---

# ‏21. `Processing Time`

‏אחרי שקיבלנו את הנתון, גם התוכנה צריכה לעבוד.

‏לדוגמה:

```text
receive_time       10.000
features_ready     10.010
ranking_complete   10.060
```

‏כלומר:

```text
Processing latency = 60 ms
```

‏אם עם 4,000 מניות זה הופך ל־1.5 שניות, יש לנו צוואר בקבוק.

---

# ‏22. `Jitter`

‏`Jitter` = Latency שאינו קבוע.

‏לדוגמה:

```text
Trade 1 = 120 ms
Trade 2 = 130 ms
Trade 3 = 125 ms
Trade 4 = 900 ms
Trade 5 = 140 ms
```

‏הממוצע אולי נראה סביר.

‏אבל העסקה הרביעית מסוכנת.

‏לכן לא מספיק למדוד:

```text
Average latency
```

‏נרצה גם להבין:

```text
P50
P95
P99
Maximum
```

---

# ‏23. מה הם `P50`, ‏`P95`, ‏`P99`?

‏בפשטות:

## ‏`P50`

‏חצי מהאירועים היו מהירים יותר מהמספר הזה.

## ‏`P95`

‏95% מהאירועים היו מהירים יותר.

## ‏`P99`

‏99% היו מהירים יותר.

‏למערכת מסחר, זנבות איטיים יכולים להיות חשובים מאוד.

‏מערכת שהממוצע שלה 100ms אבל פעם בכמה דקות נתקעת ל־5 שניות יכולה להיות בעייתית.

---

# ‏24. למה ממוצע לבדו מטעה

‏נניח:

```text
999 events = 50 ms
1 event    = 10,000 ms
```

‏רוב הזמן המערכת מהירה.

‏אבל אירוע אחד נתקע 10 שניות.

‏אם בדיוק הייתה לנו פוזיציה פתוחה, זה יכול להיות אירוע חשוב מאוד.

‏לכן נמדוד גם חריגות.

---

# ‏25. `Staleness`

‏`Staleness` = גיל הנתון.

‏נניח שה־Scanner מדרג עכשיו מניה לפי Quote שקיבל לפני 4 שניות.

‏במערכת של שניות זה יכול להיות עתיק.

‏לכן נחשב:

```text
age_ms = now - last_relevant_event_time
```

‏ואפשר להגדיר:

```text
if age_ms > threshold:
    candidate = invalid
```

---

# ‏26. לא לכל שדה אותו גיל

‏חשוב מאוד.

‏יכול להיות:

```text
Last updated 20 ms ago
Bid updated 30 ms ago
Ask updated 25 ms ago
Volume updated 800 ms ago
```

‏לכן עדיף לא לשמור רק:

```text
symbol_last_updated
```

‏אלא, כאשר צריך:

```text
last_trade_age
quote_age
volume_age
```

---

# ‏27. זמן דגימה אינו זמן האירוע

‏נניח שהסורק רץ בדיוק ב־:

```text
14:30:10.000
```

‏וה־Last האחרון הגיע ב־:

```text
14:30:09.200
```

‏ה־Snapshot שלנו נוצר ב־10.000, אבל המחיר עצמו בן 800ms.

‏לכן:

> ‏Timestamp של ה־Snapshot אינו מוכיח שהמידע שבתוכו טרי.

---

# ‏28. למה חלונות זמן צריכים להתבסס על זמן אמיתי

‏נניח שאנחנו מחשבים:

```text
change_10s
```

‏לא נכון בהכרח לקחת:

```text
10 records backward
```

‏כי אולי הרשומות אינן במרווח קבוע.

‏נכון יותר לחשוב:

```text
value now
vs
value closest to 10 seconds ago
```

‏או להשתמש במבנה Event-Time מוגדר היטב.

---

# ‏29. `Rolling Window`

‏`Rolling Window` = חלון מתגלגל.

‏לדוגמה:

```text
last 1 second
last 5 seconds
last 10 seconds
last 30 seconds
last 60 seconds
```

‏בכל רגע החלון זז קדימה.

‏אנחנו יכולים לחשב בכל חלון:

- ‏שינוי מחיר.
- ‏מספר עסקאות.
- ‏Volume.
- ‏High/Low.
- ‏Spread ממוצע.
- ‏מהירות.

---

# ‏30. Anchor אחד לא מספיק

‏אם נבדוק רק:

```text
change_60s
```

‏שתי מניות יכולות להיראות אותו דבר.

```text
AAA +1% in 60s
BBB +1% in 60s
```

‏אבל:

```text
AAA:
+0.8% happened in first 10s
then flat 50s

BBB:
+0.4% last 10s
+0.3% previous 10s
+0.3% before that
```

‏`BBB` אולי מציגה מומנטום פעיל יותר עכשיו.

‏לכן נשתמש בכמה Anchors.

---

# ‏31. אבל יותר Anchors אינם תמיד טובים יותר

‏אפשר בקלות להגיע ל־:

```text
1s
2s
3s
5s
7s
10s
15s
20s
30s
45s
60s
90s
...
```

‏זה עלול להפוך לרעש ול־Overfitting.

‏נרצה לבחור חלונות שיש להם סיבה אמיתית ולהוכיח את התרומה שלהם בנתונים.

---

# ‏32. `Aliasing` — שם מסובך לבעיה פשוטה

‏אם אנחנו דוגמים תהליך מהיר מדי בקצב איטי מדי, אנחנו יכולים לקבל תמונה שגויה שלו.

‏דוגמה:

```text
מחיר עולה ויורד במהירות
```

‏אבל אנחנו רואים רק נקודה אחת כל 10 שניות.

‏הסדרה שאנחנו שומרים יכולה להיראות חלקה למרות שהמציאות הייתה סוערת.

‏במילים פשוטות:

> ‏אם אתה מצלם סרט מהיר עם מעט מדי תמונות, אתה לא באמת יודע מה קרה בין התמונות.

---

# ‏33. למה 10 שניות יכול להיות מצוין ל־POC אבל לא מספיק ל־Execution

‏למחקר ראשון אפשר לשאול:

> ‏מי עלתה באופן עקבי ב־10s, ‏30s ו־60s?

‏וזה יכול לתת מידע חשוב.

‏אבל לפני `BUY` אמיתי, אנחנו יכולים לעבור לשכבה מהירה יותר:

```text
Wide scan      = 1s / few seconds
Top candidate  = event-driven / faster quote
Execution      = freshest available quote
```

‏כלומר אין צורך לבחור Granularity אחת לכל המערכת.

---

# ‏34. `Wide Scan` ו־`Deep Watch`

‏המודל שאנחנו מאמצים:

```text
ALL STOCKS
    ↓
Wide Scan
    ↓
Top 20
    ↓
Deep Watch
    ↓
Top 3
    ↓
Execution Check
    ↓
Best Candidate / No Trade
```

‏בכל שלב אפשר להגדיל את רמת העדכון.

---

# ‏35. דוגמה מעשית לקצבים שונים

‏זו רק דוגמה לתכנון, לא מספרים סופיים:

```text
All-market feed     = event stream
State updates       = continuous
Global ranking      = every 1 second
Top-20 refresh      = every 250 ms / on event
Position monitoring = on every relevant event
```

‏את המספרים הסופיים נבחר לפי מדידה ולא לפי תחושת בטן.

---

# ‏36. למה `Every 1 second` אינו מבטיח שנייה אחת מקצה לקצה

‏נניח שה־Ranking רץ פעם בשנייה.

‏אירוע התרחש בדיוק מילישנייה אחרי הריצה.

‏הוא יחכה כמעט שנייה עד הריצה הבאה.

‏אחר כך יש עוד:

- ‏חישוב.
- ‏שליחת Order.
- ‏Broker.
- ‏Routing.
- ‏Fill.

‏לכן זמן החלטה מחזורי מוסיף Latency משלו.

---

# ‏37. `Worst-Case Sampling Delay`

‏אם אנחנו מריצים כל:

```text
1 second
```

‏ההמתנה עד הסבב הבא יכולה להיות כמעט:

```text
1 second
```

‏בממוצע, אם האירועים מפוזרים באופן אקראי, בערך חצי מה־Interval.

‏לכן `1s scanner` יכול להוסיף בערך עד שנייה רק מעצם התזמון.

---

# ‏38. אפשרות טובה יותר: Triggered Ranking

‏במקום לדרג תמיד בזמן קבוע, אפשר לעיתים להפעיל Ranking כאשר קורה אירוע משמעותי.

‏לדוגמה:

```text
if candidate_score_changes_materially:
    re-evaluate top candidates
```

‏אבל צריך להיזהר לא לייצר עומס בלתי נשלט.

‏לכן אפשר לשלב:

```text
event trigger
+
minimum cooldown
+
periodic full reconciliation
```

---

# ‏39. `Debounce` ו־`Throttle`

‏שני מושגים שימושיים.

## ‏`Throttle`

‏אל תפעיל פעולה יותר מפעם אחת בפרק זמן מסוים.

‏לדוגמה:

```text
max 1 global rank every 200 ms
```

## ‏`Debounce`

‏המתן מעט כדי לאחד רצף מהיר של אירועים לפני פעולה.

‏במסחר מהיר צריך להשתמש בזה בזהירות, כי המתנה גדולה מדי מוסיפה Latency.

---

# ‏40. `Backpressure`

‏עוד מושג שנשמע מסובך אבל הרעיון פשוט.

‏נניח שמגיעים:

```text
100,000 events / second
```

‏והתוכנה מסוגלת לעבד:

```text
50,000 events / second
```

‏התור גדל.

‏המערכת מתחילה לעבד את העבר במקום את ההווה.

‏זה נקרא בעיית `Backpressure`.

‏לרובוט מסחר זו בעיה חמורה.

---

# ‏41. למה Queue Length הוא מדד קריטי

‏אם יש לנו Queue של Market Data, נרצה למדוד:

```text
queue_depth
oldest_event_age
processing_rate
incoming_rate
```

‏אם האירועים נערמים:

```text
NO NEW TRADES
```

‏כי הנתונים שאנחנו מעבדים כבר לא מייצגים את השוק הנוכחי.

---

# ‏42. עדיף לפעמים לזרוק מידע ישן מאשר לעבד אותו

‏זה נשמע מוזר.

‏אבל אם אנחנו צריכים לדעת **מה המצב עכשיו**, לעבד 20 שניות של Updates ישנים אחד־אחד יכול להיות חסר ערך.

‏בחלק מרכיבי המערכת אפשר לבצע:

```text
coalescing
```

‏כלומר לשמור רק את המצב העדכני ביותר.

‏לדוגמה:

```text
Bid changed 10 times
```

‏אם המטרה היא Snapshot נוכחי, אולי מעניין אותנו בעיקר השינוי האחרון.

‏אבל אם אנחנו מחשבים Trade Count או Order Flow — אסור לזרוק את האירועים.

‏כלומר:

> ‏מה מותר לאבד תלוי ב־Feature שאנחנו מנסים לחשב.

---

# ‏43. שני מסלולי נתונים

‏אפשר לתכנן:

```text
RAW EVENT PATH
    ↓
Persist / event features

CURRENT STATE PATH
    ↓
Latest state per symbol
    ↓
Scanner
```

‏כך אפשר גם לשמור מחקר מפורט וגם לקבל State מהיר.

---

# ‏44. `Clock Synchronization`

‏אם שעון המחשב שלך טועה בשתי שניות, מדידות Latency של מאות מילישניות הופכות לחסרות משמעות.

‏לכן המחשב צריך Clock מסונכרן.

‏אנחנו לא צריכים ציוד HFT.

‏אבל כן צריכים:

- ‏זמן מערכת תקין.
- ‏סנכרון קבוע.
- ‏מעקב אחרי Clock Drift.
- ‏שמירה ב־UTC בתוך המערכת.

---

# ‏45. למה `UTC`?

‏אתה בישראל.

‏השוק האמריקאי משתמש בדרך כלל ב־Eastern Time.

‏הספק יכול לשלוח Timestamp בפורמט אחר.

‏שעון קיץ משתנה בתאריכים שונים בין מדינות.

‏לכן בתוך המערכת נעדיף:

```text
UTC
```

‏ואת התצוגה נמיר לזמן מקומי לפי הצורך.

---

# ‏46. שעון מונוטוני למדידת משך

‏כשמודדים Duration בתוך תהליך, עדיף להשתמש גם בשעון מונוטוני.

‏בפשטות:

> ‏שעון שמיועד למדוד כמה זמן עבר, ולא "מה השעה".

‏כך שינוי בשעון המערכת לא יגרום פתאום ל־Latency שלילי או קפיצה מוזרה.

‏ב־`.NET`, למשל, `Stopwatch` הוא הכלי הטבעי למדידות משך כאלה.

---

# ‏47. מה נמדוד בכל Cycle?

‏דוגמה:

```text
cycle_started
symbols_considered
symbols_updated
features_duration_ms
ranking_duration_ms
decision_duration_ms
cycle_total_ms
max_data_age_ms
```

‏כך נוכל לראות אם המערכת מצליחה לעמוד בקצב.

---

# ‏48. מה נמדוד בכל Trade?

```text
signal_time
order_created_time
order_sent_time
broker_ack_time
first_fill_time
full_fill_time
exit_signal_time
exit_order_sent_time
exit_fill_time
```

‏מזה נוכל לבנות Timeline מלא של העסקה.

---

# ‏49. `Decision-to-Fill`

‏מדד שימושי מאוד:

```text
fill_time - decision_time
```

‏הוא מספר:

> ‏כמה זמן עבר מהרגע שבו החלטנו לקנות עד שבאמת קיבלנו מניות.

‏באסטרטגיה שלך, המספר הזה יכול להיות חלק מה־Feature Engineering ומהערכת האסטרטגיה עצמה.

---

# ‏50. `Signal-to-Fill`

‏עוד יותר חשוב:

```text
fill_time - signal_time
```

‏כי לפעמים ההחלטה עצמה נולדה מאוחר.

‏אם:

```text
signal detected at 0ms
trade filled at 1800ms
```

‏וה־Edge נעלם אחרי שנייה — האסטרטגיה אינה ניתנת לביצוע, גם אם ה־Backtest על המחיר נראה נהדר.

---

# ‏51. `Execution Drift`

‏נרצה למדוד מה קרה למחיר בזמן ההמתנה.

‏לדוגמה:

```text
Signal Ask  = 50.00
Actual Fill = 50.04
```

‏יש לנו:

```text
+0.04 unfavorable drift
```

‏זה מחבר בין Latency ל־Slippage.

---

# ‏52. למה Latency הוא גם Feature עסקי

‏נניח Strategy A מנבאת טוב יותר מ־Strategy B.

‏אבל Strategy A דורשת חישוב של 800ms.

‏Strategy B דורשת 20ms.

‏בעולם אמיתי B יכולה להרוויח יותר.

‏לכן בבחירת אלגוריתם נבדוק גם:

```text
Prediction quality
+
Computation latency
+
Execution latency
```

---

# ‏53. אין צורך להתחרות ב־HFT

‏המטרה שלנו אינה:

```text
microseconds
```

‏אנחנו לא ננסה לנצח חברות שיושבות ב־Colocation ליד הבורסה.

‏המטרה היא אחרת:

> ‏להבין באיזה טווח זמן האסטרטגיה שלנו עובדת, ולוודא שהמערכת מהירה מספיק ביחס לטווח הזה.

‏אם ה־Edge חי 20 שניות, Latency של 300ms יכול להיות מצוין.

‏אם ה־Edge חי 300ms, כנראה אסטרטגיה ביתית אינה המקום הנכון להתחרות בו.

---

# ‏54. ההחלטה החשובה: לבחור Edge שמתאים לתשתית שלנו

‏במקום לומר:

> ‏אני חייב להפוך את המחשב למהיר פי 1,000.

‏אפשר לומר:

> ‏אני מחפש אותות שהיתרון שלהם נשאר מספיק זמן כדי שמערכת ביתית אמינה תוכל לנצל אותם.

‏זה שינוי מחשבתי חשוב מאוד.

---

# ‏55. `Freshness Gate` לפני BUY

‏לפני פתיחת עסקה, אפשר לדרוש:

```text
quote_age < threshold
trade_age < threshold
feed_healthy = true
scanner_cycle_age < threshold
```

‏אם אחד מהם לא תקין:

```text
NO TRADE
```

‏כך Latency הופך לחלק מכללי המסחר ולא רק Dashboard טכני.

---

# ‏56. `Opportunity Expiry`

‏אפשר לתת לכל Signal זמן תפוגה.

‏לדוגמה:

```text
signal created at 10.000
valid for 1500 ms
```

‏אם הפקודה לא נשלחה עד:

```text
11.500
```

‏האות כבר אינו תקף.

‏כך נמנעים מקנייה של רעיון ישן.

---

# ‏57. למה זה חשוב במיוחד כשעוברים בין Providers

‏נניח שהסורק משתמש ב־Provider A והביצוע דרך Broker B.

‏צריך להבין:

```text
How old is Provider A data?
How long until B receives the order?
Does B see materially different market state?
```

‏לפני Order אפשר לבצע `Execution Recheck`:

```text
signal still valid?
spread still acceptable?
price not too far away?
quote fresh?
```

---

# ‏58. `Execution Recheck`

‏ה־Scanner מצא:

```text
XYZ score = 94
Ask = 20.00
```

‏300ms אחר כך, לפני שליחת Order:

```text
Ask = 20.12
Spread widened
```

‏ייתכן שהעסקה כבר אינה טובה.

‏לכן:

```text
Scanner candidate
    ↓
Fresh execution snapshot
    ↓
Still valid?
    ├── yes → order
    └── no  → skip
```

---

# ‏59. מה אם Provider A ו־Broker B מציגים מחירים שונים?

‏זה יכול לקרות בגלל:

- ‏זמן עדכון שונה.
- ‏Coverage שונה.
- ‏Venue שונה.
- ‏Feed Consolidated מול Feed חלקי.
- ‏Timestamp שונה.

‏לכן נרצה למדוד את הפער בפועל.

‏לא מניחים ששני Feeds זהים.

---

# ‏60. `Cross-Feed Validation`

‏ב־Paper/Shadow Mode אפשר לשמור במקביל:

```text
Provider A Bid/Ask
Provider B Bid/Ask
Timestamp A
Timestamp B
```

‏ואז לחשב:

```text
price difference
age difference
missing events
```

‏כך בוחרים ספק לפי נתונים ולא לפי שיווק.

---

# ‏61. איך לבחור ספק מהבחינה של זמן

‏לכל ספק נמדוד לפחות:

```text
Coverage
Update model
Observed latency
Jitter
Disconnect rate
Reconnect time
Missing data rate
Timestamp quality
Scale to whole universe
Cost
```

‏אם ספק זול איטי ב־3 שניות, אולי הוא לא מתאים.

‏אם ספק יקר יותר חוסך 200ms אבל ה־Edge שלנו חי 30 שניות, אולי התוספת אינה שווה כסף.

---

# ‏62. `IBKR` כדוגמה למקור עם קצב מוגדר

‏בתיעוד `TWS API` של `IBKR`, Streaming Watchlist Data למניות אינו Tick-by-Tick אלא Aggregate Snapshots בתדירות של בערך:

```text
250 ms
```

‏זה לא אומר ש־IBKR טוב או רע.

‏זה פשוט אומר:

> ‏אנחנו צריכים להבין מה בדיוק מגיע ולמדוד אם הוא מתאים לשלב שבו אנחנו משתמשים בו.

---

# ‏63. `Alpaca` כדוגמה ל־Event Stream

‏`Alpaca` מספקת WebSocket ל־Real-Time Stock Market Data.

‏הרעיון הוא לקבל Events דרך Stream במקום לבצע Polling חוזר של HTTP endpoints.

‏גם כאן:

> ‏לא מניחים שהמילה `real-time` אומרת אפס Latency.

‏מודדים בפועל.

---

# ‏64. ומה לגבי אתר בנק לאומי?

‏אם נחליט להשתמש באתר כמקור לסריקה, נבנה עבורו Adapter ונמדוד אותו בדיוק כמו ספק API:

```text
When did displayed data change?
When did our collector see it?
How often does refresh happen?
How many symbols can be obtained?
What breaks after reconnect/login/page refresh?
```

‏אם הוא מספיק טוב — משתמשים בו.

‏אם לא — מחליפים אותו.

‏האסטרטגיה לא צריכה להיות תלויה בו.

---

# ‏65. `Provider-Agnostic` — מושג מרכזי בקורס

‏`Provider-Agnostic` = המערכת אינה בנויה סביב ספק אחד.

‏לדוגמה:

```text
Provider adapter
        ↓
Normalized events
        ↓
Same scanner
        ↓
Same features
        ↓
Same ranking
```

‏זה מאפשר:

- ‏להחליף מקור.
- ‏לעשות A/B בין מקורות.
- ‏להשתמש ב־Fallback.
- ‏לשלב מקור רחב ומקור עמוק.
- ‏להריץ Replay.

---

# ‏66. Primary ו־Fallback Feed

‏אפשר בעתיד לתכנן:

```text
Primary Feed
    ↓
Scanner

Fallback Feed
    ↓
Health check / emergency switch
```

‏אבל Failover אוטומטי אינו פשוט.

‏אם עוברים Feed, צריך לדעת שה־State החדש תואם ולהימנע ממסחר על מצב חלקי.

---

# ‏67. אין מעבר Feed עיוור

‏אם Provider A נפל ו־B עדיין חי, לא בהכרח מיד ממשיכים לסחור.

‏אפשר לבצע:

```text
Pause new entries
↓
Load/confirm current state from B
↓
Validate timestamps and coverage
↓
Resume
```

‏בטיחות קודמת לכמה שניות של הזדמנות.

---

# ‏68. `Adaptive Sampling`

‏לא חייבים לסרוק כל מניה באותה תדירות.

‏אפשר למשל:

```text
Quiet stocks      → low priority
Active stocks     → higher priority
Top candidates    → very high priority
Open position     → highest priority
```

‏זה יכול לחסוך משאבים בלי לפגוע באזורים החשובים.

---

# ‏69. אבל Adaptive Sampling יכול ליצור Bias

‏אם מסתכלים מהר יותר רק על מניות שכבר נראות מעניינות, אולי נפספס מניה שקטה שהתחילה לזוז בדיוק עכשיו.

‏לכן תמיד צריך שכבת Wide Scan שממשיכה לכסות את כל ה־Universe בקצב מינימלי.

---

# ‏70. `Scan Cycle`

‏נגדיר Cycle כ:

```text
Take current market state
↓
Apply freshness gates
↓
Update/collect features
↓
Filter
↓
Rank
↓
Choose top candidate
↓
Trade / No Trade
```

‏לכל Cycle יהיה מזהה וזמן.

‏כך נוכל לשחזר בדיעבד למה בחרנו מניה מסוימת.

---

# ‏71. Cycle חייב להיות עקבי

‏בעיה אפשרית:

‏אנחנו מתחילים לסרוק 4,000 מניות.

‏בזמן הסריקה הנתונים ממשיכים להתעדכן.

‏המניה הראשונה נבחנה לפי זמן 10.000 והמניה האחרונה לפי 10.800.

‏עכשיו אנחנו משווים מצבים מזמנים שונים.

‏זה יכול להיות בעייתי.

---

# ‏72. פתרון: Logical Snapshot

‏לא תמיד צריך להקפיא את כל ה־Feed.

‏אפשר ליצור `Logical Snapshot`:

> ‏כל Candidate משתמש בנתון האחרון שהיה ידוע עד Cutoff Time מסוים.

‏לדוגמה:

```text
cycle_cutoff = 14:30:10.000
```

‏כך המחקר וה־Replay יכולים להיות עקביים יותר.

---

# ‏73. Live System מול Backtest

‏ב־Backtest קל לעשות:

```text
At time T, rank all symbols
```

‏אבל ב־Live אין באמת עצירה של העולם בזמן T.

‏לכן Backtest צריך לדמות:

- ‏זמן הגעת נתונים.
- ‏זמן החלטה.
- ‏זמן שליחה.
- ‏זמן Fill.

‏אחרת הוא נותן לרובוט כוח שלא יהיה לו במציאות.

---

# ‏74. `Look-Ahead Bias` בזמן

‏טעות מסוכנת:

‏אנחנו מחשבים Score ב־10.000 אבל משתמשים בטעות במידע שהגיע ב־10.100.

‏ב־Backtest זה נראה מצוין.

‏במציאות המידע עוד לא היה קיים.

‏זה נקרא סוג של:

`Look-Ahead Bias`

‏בפשטות:

> ‏נתנו לאלגוריתם להציץ לעתיד.

---

# ‏75. כלל זהב של Backtest בזמן

‏בכל Decision Time:

> ‏מותר להשתמש רק במידע שהיה זמין למערכת עד אותו רגע.

‏לא לפי מה שידענו אחר כך.

---

# ‏76. למה `1-second bars` עדיין יכולים להיות מסוכנים למחקר של שניות

‏Bar של שנייה מסכם:

```text
Open
High
Low
Close
Volume
```

‏אבל לא תמיד מספר את סדר האירועים.

‏אם אנחנו מניחים שהגענו ל־Low לפני High למרות שהמציאות הייתה הפוכה, ה־Backtest יכול לדמיין Fill שלא היה אפשרי.

‏לכן ככל שטווח העסקה קצר יותר, סדר האירועים חשוב יותר.

---

# ‏77. מתי צריך Tick Data?

‏לא בהכרח מהיום הראשון.

‏אבל אם נגיע למצב שבו התוצאות תלויות ב:

```text
מי קרה קודם בתוך אותה שנייה?
```

‏אז Bar של שנייה כבר לא מספיק.

‏זה סימן שצריך נתונים מפורטים יותר.

---

# ‏78. Latency של המחשב המקומי

‏גם המחשב שלך יכול להיות צוואר בקבוק.

‏לדוגמה:

- ‏CPU עמוס.
- ‏Garbage Collection.
- ‏Disk איטי.
- ‏Database lock.
- ‏UI כבד.
- ‏Antivirus scan.
- ‏Network congestion.

‏לכן רכיב המסחר לא צריך להיות תלוי ב־UI יפה כדי להתקדם.

---

# ‏79. הפרדת Hot Path

‏`Hot Path` = המסלול שבו החלטה צריכה לעבור מהר.

‏אצלנו:

```text
Market event
→ update state
→ features
→ decision
→ order
```

‏דברים כמו:

- ‏גרפים.
- ‏דוחות.
- ‏שמירת צילום מסך.
- ‏חישובי Analytics כבדים.

‏לא צריכים לעכב את המסלול הזה.

---

# ‏80. Logging בלי לעצור את המסחר

‏צריך לוגים מפורטים מאוד.

‏אבל אם כל Event מחכה לכתיבה איטית לדיסק לפני שהוא ממשיך — יצרנו Latency.

‏לכן אפשר להשתמש במבנה שבו:

```text
Trading path
    ↓
fast in-memory logging queue
    ↓
background persistence
```

‏אבל אם התור מתמלא, המערכת צריכה לזהות זאת.

---

# ‏81. Database אינו חייב להיות בתוך כל החלטה

‏אם בכל Tick אנחנו שואלים Database כבד:

```text
SELECT ...
```

‏אנחנו עלולים להוסיף זמן מיותר.

‏Features חמים יכולים להישמר בזיכרון.

‏Database משמש לשמירה, Replay ומחקר.

‏צריך להפריד בין Online State לבין Historical Storage.

---

# ‏82. Benchmark אמיתי

‏לא נסתפק ב:

> ‏"נראה מהיר."

‏נריץ Benchmark עם עומס שמדמה את העולם האמיתי:

```text
4,000 symbols
high update rate
feature calculations
ranking
logging
```

‏ונמדוד:

```text
P50 cycle
P95 cycle
P99 cycle
queue depth
CPU
memory
```

---

# ‏83. למה Test על 10 מניות לא מספיק

‏קוד שרץ מצוין על:

```text
10 symbols
```

‏יכול לקרוס על:

```text
4,000 symbols
```

‏לכן Performance Test צריך להשתמש ב־Universe בגודל אמיתי או גדול ממנו.

---

# ‏84. `Latency SLO`

‏אפשר להגדיר יעד תפעולי.

‏לדוגמה רעיונית:

```text
95% of scanner cycles < 200 ms
99% < 500 ms
No cycle > 2 s
```

‏אלה לא המספרים הסופיים שלנו.

‏אבל העיקרון חשוב:

> ‏מהירות צריכה להיות דרישה נמדדת.

---

# ‏85. Latency Alarm

‏אם פתאום:

```text
P95 latency doubles
```

‏או:

```text
data age > threshold
```

‏המערכת צריכה להתריע.

‏ואם המצב מסוכן:

```text
STOP NEW ENTRIES
```

---

# ‏86. `Circuit Breaker` פנימי

‏זה לא ה־Circuit Breaker של הבורסה.

‏זה מנגנון שלנו.

‏לדוגמה:

```text
if feed stale
or broker disconnected
or queue too deep
or latency too high
or clock unhealthy:
    block new buys
```

‏זה אחד מעקרונות הבטיחות של הרובוט.

---

# ‏87. פוזיציה פתוחה מקבלת עדיפות

‏אם יש עומס במערכת ויש לך מניה פתוחה, היא חשובה יותר מסריקת 4,000 מניות חדשות.

‏סדר עדיפויות אפשרי:

```text
1. Manage open position
2. Confirm broker/order state
3. Monitor top candidates
4. Scan full universe
5. UI/reporting
```

‏זה עיקרון חשוב למערכת אישית.

---

# ‏88. Latency של קנייה ו־Latency של מכירה

‏צריך למדוד אותם בנפרד.

‏יכול להיות שהכניסה מהירה אבל היציאה איטית בגלל תנאי שוק, Routing או לוגיקה אחרת.

‏לכן:

```text
entry_signal_to_fill
exit_signal_to_fill
```

‏שני מדדים נפרדים.

---

# ‏89. זמן המתנה בתור הוא לא אותו דבר כמו Latency רשת

‏נניח שלחנו `Limit Order` והיא הגיעה לבורסה מהר.

‏אבל היא יושבת בתור 8 שניות עד Fill.

‏ה־Network Latency היה מצוין.

‏ה־Fill Latency היה ארוך.

‏לכן צריך להפריד:

```text
transport latency
broker latency
market waiting time
```

---

# ‏90. זה משפיע על בחירת Order Type

‏בהמשך, כשנשווה `Marketable Limit`, ‏`Passive Limit`, ‏`Post Only` וכדומה, הזמן יהיה חלק מהשיקול.

‏פקודה פסיבית יכולה לקבל מחיר טוב יותר אבל לחכות.

‏פקודה אגרסיבית יכולה להתבצע מהר יותר אבל לשלם Spread.

‏אצלך זו אחת ההחלטות המרכזיות:

```text
better price
vs
faster fill
```

---

# ‏91. `Time-to-Profit`

‏אחרי Fill אפשר למדוד:

```text
time until position first became profitable
```

‏לדוגמה:

```text
Entry = 10.000
First profitable exit opportunity = 10.700
Time-to-profit = 700 ms
```

‏זה יכול לעזור להבין איזה סוג מומנטום אנחנו באמת תופסים.

---

# ‏92. `Time-in-Trade`

‏נמדוד כמה זמן כל פוזיציה הייתה פתוחה.

‏לא רק ממוצע.

‏נרצה Distribution:

```text
< 5s
5-10s
10-30s
30-60s
> 60s
```

‏כך נראה האם האסטרטגיה באמת מתנהגת כמו שחשבנו.

---

# ‏93. `Time Stop`

‏אם נכנסנו בגלל מומנטום קצר והוא לא התממש בזמן הצפוי, הזמן עצמו יכול להיות סיבה לצאת.

‏לדוגמה רעיונית:

```text
if no expected continuation within X seconds:
    exit / reassess
```

‏את X לא מנחשים.

‏לומדים מהנתונים.

---

# ‏94. למה “אותו מחיר” אחרי דקה אינו בהכרח הצלחה

‏אם קנינו ב־$20 והמניה נשארה $20 במשך דקה, אפשר לומר:

> ‏לא הפסדנו במחיר.

‏אבל אם האסטרטגיה אמרה:

> ‏היא אמורה להמשיך לעלות מיד,

‏אז למעשה התחזית נכשלה.

‏בנוסף שילמנו זמן, עמלות והזדמנות חלופית.

---

# ‏95. `Opportunity Cost`

‏`Opportunity Cost` = מה הפסדנו בגלל שהכסף היה תקוע במקום אחד.

‏נניח שקנינו `AAA` והיא לא זזה 40 שניות.

‏באותו זמן `BBB` הפכה למועמדת חזקה.

‏אם כל ההון כבר ב־AAA, איבדנו הזדמנות.

‏לכן זמן הוא גם משאב הון.

---

# ‏96. זה מתחבר לרעיון “המניה הכי טובה כרגע”

‏המערכת שלך צריכה לשאול לא רק:

```text
Is current position still profitable?
```

‏אלא בהמשך אולי גם:

```text
Is current position still the best use of capital?
```

‏זו שאלה מתקדמת שנחזור אליה בפרקי הכניסה/יציאה.

---

# ‏97. Frequency גבוהה אינה מטרה בפני עצמה

‏אפשר להריץ Scanner:

```text
100 times / second
```

‏אבל אם Feed מתעדכן רק כל 250ms, רוב הריצות יעבדו על אותו מידע.

‏זה סתם CPU.

‏לכן קצב הסריקה צריך להתאים לקצב שבו מידע חדש משמעותי מגיע.

---

# ‏98. ולהפך: Feed מהיר לא אומר שחייבים להגיב לכל Event

‏אם מגיעים אלפי Events בשנייה אבל האסטרטגיה מבוססת על חלון של 30 שניות, ייתכן שאין צורך לבצע החלטת Portfolio חדשה בכל Event.

‏נרצה לשמור את המידע הדרוש ולעדכן Features ביעילות.

---

# ‏99. איך נבחר את הקצב הסופי?

‏באמצעות ניסוי.

‏למשל נשווה:

```text
decision every 10s
decision every 5s
decision every 2s
decision every 1s
decision every 500ms
```

‏ונבדוק:

- ‏כמה הזדמנויות נוספות נתפסות.
- ‏כמה מוקדם יותר נכנסים.
- ‏כמה CPU/RAM נצרכים.
- ‏האם Net PnL משתפר.
- ‏האם Slippage משתפר.
- ‏האם נוצרים יותר False Signals.

‏הקצב הטוב ביותר הוא זה שמשפר את התוצאה בעולם האמיתי, לא זה שנשמע הכי מהיר.

---

# ‏100. מה אנחנו מניחים מעכשיו בקורס

‏מכאן ואילך נבנה את הידע לפי המודל הבא:

```text
Market data requirements first
        ↓
Choose best provider(s)
        ↓
Normalize all sources
        ↓
Measure freshness and latency
        ↓
Wide all-market scan
        ↓
Deep observation of candidates
        ↓
Fresh execution check
        ↓
Broker of choice
```

‏כלומר:

> ‏לא נהיה מוגבלים ל־`IBKR`, ‏`Alpaca`, בנק לאומי או שום ספק אחר. הם כלים שנבחר לפי הצורך.

---

# ‏101. הארכיטקטורה המומלצת כרגע

```text
                 ┌──────────────────┐
                 │ Market Provider A │
                 └────────┬─────────┘
                          │
                 ┌────────▼─────────┐
                 │ Market Provider B │  optional
                 └────────┬─────────┘
                          │
                 ┌────────▼─────────┐
                 │ Provider Adapters │
                 └────────┬─────────┘
                          │
                 ┌────────▼─────────┐
                 │ Normalized Events │
                 └────────┬─────────┘
                          │
                 ┌────────▼─────────┐
                 │ Current State     │
                 └────────┬─────────┘
                          │
                 ┌────────▼─────────┐
                 │ Feature Engine    │
                 └────────┬─────────┘
                          │
                 ┌────────▼─────────┐
                 │ Scanner / Ranking │
                 └────────┬─────────┘
                          │
                 ┌────────▼─────────┐
                 │ Execution Recheck │
                 └────────┬─────────┘
                          │
                 ┌────────▼─────────┐
                 │ Broker Adapter    │
                 └────────┬─────────┘
                          │
                 ┌────────▼─────────┐
                 │ Broker / Venue    │
                 └──────────────────┘
```

‏זה המבנה שנרצה בראש לאורך הקורס.

---

# ‏102. מה לא צריך להחליט עדיין

‏אנחנו **לא** חייבים עכשיו להחליט:

- ‏איזה Provider סופי נבחר.
- ‏אם נסרוק כל 250ms או כל שנייה.
- ‏אם נשתמש ב־Tick-by-Tick לכל Candidate.
- ‏אם נשתמש ב־IBKR או Alpaca לביצוע.
- ‏אם Level 2 מוסיף לנו ערך.

‏אלה שאלות שנענה עליהן בניסויים.

---

# ‏103. מה כן החלטנו

‏כבר אפשר לקבע:

1. ‏המערכת תהיה `Provider-Agnostic`.
2. ‏Market Data ו־Execution הם תפקידים נפרדים.
3. ‏נמדוד Latency מקצה לקצה.
4. ‏נשמור Event Time ו־Receive Time כאשר אפשר.
5. ‏Freshness תהיה חלק מהחלטת מסחר.
6. ‏Wide Scan ו־Deep Watch יכולים לעבוד בקצבים שונים.
7. ‏פוזיציה פתוחה מקבלת קדימות על פני סריקה חדשה.
8. ‏Feed איטי/תקוע עוצר כניסות חדשות.
9. ‏לא נבחר Sampling Rate לפי תחושת בטן.
10. ‏Backtest יצטרך לדמות גם זמן ולא רק מחיר.

---

# ‏104. בדיקת הבנה עצמית

‏נסה לענות במילים שלך:

1. ‏מה ההבדל בין `Sampling Interval` לבין `Latency`?
2. ‏למה Feed Event-Driven לא מחייב Ranking על כל Event?
3. ‏למה אפשר להשתמש ב־Alpaca לנתונים וב־IBKR לביצוע?
4. ‏מה היתרון ב־Provider Adapter?
5. ‏למה אתר כמו בנק לאומי צריך לעבור בדיקת Latency ו־Coverage כמו API?
6. ‏מה זה `Signal Half-Life`?
7. ‏מה ההבדל בין Event Time ל־Receive Time?
8. ‏למה `P95/P99` חשובים יותר מממוצע בלבד?
9. ‏מה זה `Stale Data`?
10. ‏למה Queue שגדל הוא סכנה למסחר?
11. ‏מהו `Execution Recheck`?
12. ‏למה Ranking פעם בשנייה יכול להוסיף כמעט שנייה של המתנה?
13. ‏למה צריך Clock מסונכרן?
14. ‏מהו `Signal-to-Fill`?
15. ‏למה לא בהכרח כדאי להיות מהירים יותר אם אין מידע חדש?

---

# ‏105. מקורות רשמיים שנבדקו לפרק

‏נכון ל־26 באוקטובר 2026 נבדקו, בין היתר:

- ‏`Interactive Brokers TWS API` — תיעוד Top Market Data: נתוני Watchlist למניות מגיעים כ־Aggregate Snapshots בתדירות של כ־250ms ולא Tick-by-Tick.
- ‏`Interactive Brokers TWS API` — תיעוד Historical Data מציין ש־IBKR אינה ספק Market Data ייעודי וממליץ לשקול ספק מקצועי אם דרישות הנתונים אינן נענות.
- ‏`Alpaca Market Data API` — תיעוד Real-Time Stock Data ו־WebSocket Streaming Data.

‏פרטי ספקים, תמחור, מגבלות והרשאות משתנים. לפני Implementation חי בודקים אותם מחדש.

---

# ‏Checkpoint

‏שלב 06 הגדיר את **מודל הזמן של הרובוט**: Sampling, Event-Driven processing, Latency, Jitter, Staleness, Clock, Backpressure, Wide Scan מול Deep Watch, Execution Recheck והפרדה מלאה בין Market Data Provider לבין Execution Broker.

‏השלב הבא הוא שלב 07 — **בניית Universe**: אילו מניות בכלל נכנסות לסריקה, אילו מניות כדאי לפסול מראש, ואיך לבנות Universe רחב בלי להכניס אלפי ניירות שלא באמת ניתנים למסחר קצר בסכום שלך.