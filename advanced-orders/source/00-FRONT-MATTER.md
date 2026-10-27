# ‏Advanced Order Mastery — פקודות מסחר וביצוע ברמה מקצועית

> ‏מיני־קורס עומק משלים ל־`04-ORDER-TYPES-FOR-PERSONAL-ALGO.md`.
>
> ‏התוצר הסופי של המיני־קורס הוא **הקובץ היחיד הזה**. בכל שלב נרחיב ונעדכן אותו עד שיהפוך למסמך ארוך, רציף וניתן להדפסה.
>
> ‏המיקוד המרכזי: `Short-Horizon Momentum` — כניסה ויציאה בשניות ועד בערך דקה כאשר ה־Edge עדיין חי. פקודות שרלוונטיות בעיקר ל־market making, institutional execution ארוך או order sizes גדולים מאוד יוסברו, אבל יקבלו פחות עומק אלא אם יש להן השלכה ממשית על המערכת שלנו.

---

## ‏סטטוס המסמך

- ‏מצב: `IN PROGRESS`.
- ‏שלב נוכחי: `10B — Entry Decision and Execution-Behavior Selection`.
- ‏מקור אמת: הקובץ הזה.
- ‏עובדות תלויות־זמן על Broker/Venue/API נבדקות מול תיעוד עדכני ונושאות תאריך אימות.
- ‏אין להניח ש־Order Type הנתמך במוצר אחד, Venue אחד או UI אחד נתמך אוטומטית בכל מוצר, בכל Routing mode ובכל API.

---

# ‏מפת המיני־קורס

‏המסמך ייבנה בהדרגה סביב השאלות שאיש Execution מקצועי צריך לדעת לענות עליהן לפני שהוא מכניס פקודה למנוע מסחר.

## ‏חלק 1 — השפה המקצועית של פקודה

‏מה באמת מרכיב Order, מי מחזיק אותה בכל שלב, מה ההבדל בין `native`, ‏`broker-simulated` ו־`client-managed`, ומה המשמעות של `submitted`, ‏`working`, ‏`partially filled`, ‏`pending cancel`, ‏`cancelled`, ‏`filled`, ‏`rejected` ועוד.

## ‏חלק 2 — Core execution

‏`Market`, ‏`Limit`, ‏`Marketable Limit`, ‏Passive Limit, ‏price caps, ‏aggressiveness, ‏crossing the spread, ‏partial fills, ‏slippage, ‏fill probability ו־opportunity cost.

## ‏חלק 3 — Time in Force ופקודות מיידיות

‏`DAY`, ‏`GTC`, ‏`GTD`, ‏`IOC`, ‏`FOK`, ‏`AON`, ‏Minimum Quantity וההבדל בין "אני רוצה Fill עכשיו" לבין "אני רוצה שכל הכמות תתבצע עכשיו".

## ‏חלק 4 — Liquidity control

‏`Post Only`, ‏`Hidden`, ‏`Reserve/Iceberg`, ‏display size, ‏queue priority, ‏maker/taker behavior, ‏adverse selection, ‏order aging והאם בכלל כדאי לנו להיות passive כאשר חיי ה־Signal קצרים.

## ‏חלק 5 — Pegged, Relative, Midpoint ו־Snap families

‏`Relative/Pegged-to-Primary`, ‏`Pegged-to-Market`, ‏`Pegged-to-Midpoint`, ‏`MidPrice`, ‏`Snap to Market`, ‏`Snap to Midpoint`, ‏`Snap to Primary`, ‏IBKR ATS pegged orders והבדלים קריטיים בין שמות דומים.

## ‏חלק 6 — Stops, Trailing, Bracket, OCA/OCO ו־Conditional

‏מנגנוני הגנה ויציאה, parent/child orders, ‏transmit sequencing, ‏race conditions, ‏orphan orders, ‏double exits ומה באמת קורה כאשר Fill ו־Cancel חוצים זה את זה.

## ‏חלק 7 — Routing ו־Broker Algos

‏`SMART` מול Direct Routing, ‏venue selection, ‏fees/rebates, ‏hidden liquidity, ‏price improvement, ‏IBKR algos כגון `Adaptive` ו־`MidPrice`, ומתי Broker Algo עוזר לעומת מתי הוא מוסיף התנהגות שקשה יותר לחזות במנוע קצר־טווח.

## ‏חלק 8 — Cancel/Replace ו־Execution State Machine

‏למה `cancel()` אינו מחיקה, מהו `cancel/replace`, מתי שינוי פקודה מאבד queue priority, איך עובדים נכון עם partial fills, duplicate events, reconnects, late fills ו־broker reconciliation.

## ‏חלק 9 — `IBKR` capability matrix

‏לכל Order Type חשוב נבדוק:

```text
What it does
Why it exists
Best use case
Bad use case
Who normally uses it
Fill semantics
Queue implications
Adverse-selection implications
Latency implications
TWS support
IBKR Desktop support
Mobile / Client Portal support when relevant
TWS API support
Client Portal API support when relevant
SMART / Direct routing requirements
US-stock relevance
Account / venue caveats
Relevance to our < 1 minute momentum engine
```

## ‏חלק 10 — Engine decision guide

‏בסוף נתרגם הכול ל־Execution Policy ממשי עבור המנוע שלנו:

```text
signal state
+ urgency
+ spread
+ displayed depth
+ expected edge
+ remaining signal life
+ position state
+ fill state
+ exit feasibility
=> choose order behavior
```

‏המטרה אינה לבחור "פקודה הכי טובה" אחת, אלא לדעת **איזו התנהגות נכונה לכל מצב**.

## ‏חלק 11 — Print Optimization Pass

‏רק לאחר שכל התוכן המקצועי יושלם, נעבור על הקובץ כולו להכנה יעילה להדפסה: צפיפות מידע גבוהה אך קריאה, צמצום רווחים מיותרים, טיפול בכותרות ובטבלאות, שבירות עמוד הגיוניות ו־RTL יציב.

## ‏חלק 12 — Final Gap Review וסגירה

‏השלב האחרון יהיה מעבר על חוסרים, כפילויות, עובדות תלויות־זמן, התאמה ל־IBKR ולמנוע שלנו, ורק לאחריו המסמך ייחשב גמור.

---
