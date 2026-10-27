# ‏Advanced Order Mastery — פקודות מסחר וביצוע ברמה מקצועית

> ‏מיני־קורס עומק משלים ל־`04-ORDER-TYPES-FOR-PERSONAL-ALGO.md`.
>
> ‏Scope: ‏Advanced Orders וה־Execution שלהן — semantics, attributes, routing, broker algos, lifecycle, protection, capability, failure behavior והחיבור למנוע החלטה קצר־טווח.
>
> ‏נושאי Market Data, Scanner, Auctions ו־Microstructure כלליים נכנסים לכאן רק כאשר הם משנים ישירות את ההתנהגות, החוקיות, הסיכון או ה־lifecycle של פקודה מתקדמת.

---

## ‏איך בנוי מקור האמת

‏מקור האמת של הקורס הוא אוסף קבצי ה־Source תחת:

`advanced-orders/source/`

‏הסדר הקנוני מוגדר ב־:

`advanced-orders/source/manifest.json`

‏הקובץ:

`advanced-orders/ADVANCED-ORDER-MASTERY.md`

‏מיועד להיות תוצר מאוחד שנבנה מן המקורות, ולא קובץ שממשיכים לערוך ידנית.

---

# ‏איך לקרוא את הקורס

‏אם אתה חדש בתחום, אין צורך להתחיל משינון ה־Taxonomy. אחרי ה־Front Matter עוברים קודם אל:

`00B-BEGINNER-NAVIGATION-AND-PROBLEM-INDEX.md`

‏שם מתחילים מהשאלות הפשוטות: מה אני מנסה להשיג, איזו משפחת פקודות קשורה לבעיה, ומה כדאי ללמוד קודם.

‏הקובץ:

`00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md`

‏הוא מקור האמת של המונחים המקצועיים. חוזרים אליו כאשר צריך להבין במדויק לאיזו שכבה שייך מונח כגון `Limit`, ‏`IOC`, ‏`Post Only`, ‏`Bracket`, ‏`SMART`, ‏`Adaptive` או `MARKETABLE_LIMIT_IOC`. הוא Reference חשוב, אבל אינו מבחן כניסה לקורס.

‏אם כבר יש לך בעיה מסוימת — למשל “אני רוצה ניסיון ביצוע מיידי בלי להשאיר remainder”, “מי מנהל את הפקודה אחרי disconnect?” או “איך מגינים על Position?” — אפשר להתחיל ישירות ב־Problem → Candidate Index שב־`00B`, להגיע לפרק המשפחה, ואז להמשיך להשוואה, failure/safety ו־engine mapping הרלוונטיים.

---

## ‏מסלול הליבה למתחיל

```text
00 Front Matter
→ 00B Beginner Navigation / Problem Index
→ Part 1: Order Language
→ Part 2: Core Execution
→ Part 3: Time / Fill Policies
→ Parts 4–7: Advanced Order Families and Routing
→ Part 8: Lifecycle and State Machine
→ Part 9: Capability / Production Enablement
→ Part 10A: Decision Gates
→ Part 10B: Entry Selection
→ Part 10C: Exit / Protection
→ Part 10D: Full Decision Engine
```

‏`00A` נשאר Reference קנוני לאורך כל המסלול.

‏הפרקים אינם רשימת פקודות בלבד. המטרה היא לעבור בהדרגה מ־semantics של Order בודדת אל מנוע שמסוגל לבחור, לנהל, לבטל, להחליף, לשחזר ולהגן על Orders בצורה עקבית.

---

# ‏מפת הקורס

## ‏`00B` — Beginner Navigation and Problem → Candidate Index

‏נקודת הכניסה למתחיל: הסברים בסיסיים, prerequisites מינימליים, ושתי דרכי קריאה — מסלול לימוד רציף או התחלה מבעיה מעשית. ה־Index מפנה ממשפחה או צורך לפרקים הנכונים, אך אינו בוחר Order במקום Decision Engine.

## ‏`00A` — Canonical Taxonomy and Vocabulary

‏מגדיר פעם אחת את שכבות המושגים, vocabulary של זמן/מחיר/cancel/partial fill/capability, וההבדל בין `FACT`, ‏`ENGINE RULE`, ‏`RESEARCH HYPOTHESIS` ו־`ACCEPTANCE TEST REQUIRED`.

## ‏חלק 1 — השפה המקצועית של פקודה

‏מה באמת מרכיב Order, מי מחזיק אותה בכל שלב, מה ההבדל בין `venue-native`, ‏`broker-simulated`, ‏`broker-resident` ו־`client-managed`, ומה המשמעות של states כגון `working`, ‏`partially filled`, ‏`pending cancel`, ‏`cancelled`, ‏`filled` ו־`rejected`.

## ‏חלק 2 — Core Execution

‏`Market`, ‏`Limit`, ‏marketability של Limit, ‏Passive execution, ‏price boundaries, ‏crossing the spread, ‏partial fills, ‏slippage, ‏fill probability ו־opportunity cost.

## ‏חלק 3 — Time / Fill Policies

‏`DAY`, ‏`GTC`, ‏`GTD`, ‏`IOC`, ‏`FOK`, ‏`AON`, ‏Minimum Quantity וההבדל בין חיי Signal, חיי ניסיון execution ו־Broker `TIF`.

## ‏חלק 4 — Liquidity Control

‏`Post Only`, ‏`Hidden`, ‏`Reserve/Iceberg`, ‏display size, ‏queue behavior, ‏maker/taker behavior, ‏adverse selection והמחיר של המתנה פסיבית.

## ‏חלק 5 — Pegged, Relative, Midpoint ו־Snap

‏פקודות וכללים שמנהלים מחיר באופן דינמי: מי בוחר reference, מי מבצע repricing, מהו cap, מתי מדובר ב־continuous repricing ומתי ב־one-shot calculation.

## ‏חלק 6 — Stops, Trailing, Bracket, OCA/OCO ו־Conditional

‏Trigger semantics, ‏protection, ‏parent/child dependencies, ‏transmit sequencing, ‏mutual exclusion, ‏partial-fill consequences, ‏race conditions, ‏orphan orders ו־double-exit risk.

## ‏חלק 7 — Routing ו־Broker Algos

‏`SMART` מול Direct Routing, ‏venue selection, ‏hidden liquidity, ‏fees/rebates, ‏price improvement ו־broker-managed execution כגון `Adaptive` ו־`MidPrice`.

## ‏חלק 8 — Cancel/Replace ו־Execution State Machine

‏למה `cancel requested` אינו `cancel confirmed`, ‏modify/cancel races, ‏queue implications, ‏duplicate/out-of-order events, ‏late fills, ‏reconnect, reconciliation ו־recovery.

## ‏חלק 9 — `IBKR` Capability Matrix

‏תמיכה אינה Boolean. לכל feature נבדקים Product, Contract, Route/Destination, API Adapter, Account/Legal Entity, Session, implementation owner ו־Production Enablement State.

## ‏חלק 10A — Decision Inputs and Elimination Gates

‏Signal, market, order, position, risk, capability ו־system-health state עוברים Gates שמחליטים מה בכלל חוקי לפני בחירת execution behavior.

## ‏חלק 10B — Entry Decision

‏בחירת Behavior ל־Entry מתוך Candidates חוקיות לפי urgency, remaining signal life, economics, liquidity, hard boundaries, expected fill behavior ו־delegation.

## ‏חלק 10C — Exit Decision, Protection and Ownership

‏Exit רגילה, Exit מהירה, emergency reduction, ‏Stop backstop, ‏Bracket/Hybrid protection והעיקרון של Single Exit Authority.

## ‏חלק 10D — Full Decision Engine

‏חיבור Gates, Entry, Exit, Protection, recovery, precedence, obligations ו־semantic actions למנוע החלטה אחד.

---

# ‏תבנית הלמידה לכל משפחת Advanced Orders

‏בכל משפחה מרכזית נשאף לענות במפורש על:

```text
What is it?
Why does it exist?
When is it useful?
When is it a bad choice?
What is the closest alternative?
What assumption makes it attractive?
What failure invalidates that assumption?
Who owns the behavior after submit?
What survives disconnect/restart?
What must our engine still control?
How does it map to our execution engine?
```

‏כאשר נדרשת השוואה, עדיף Decision Example שמכריע בין שתי חלופות על פני דוגמת syntax בלבד.

‏כלל ההוראה הקנוני בתוצר הסופי הוא:

```text
plain language
→ simple example
→ professional term
→ advanced semantics
→ engine implication
```

---

# ‏כללי Evidence ו־Currentness

‏עובדות תלויות־Broker/Venue/API אינן נלמדות כעובדות נצחיות.

‏כאשר פרט כזה מהותי ל־semantics או ל־Production enablement, נציין context מתאים ונבדיל בין:

```text
FACT
ENGINE RULE
RESEARCH HYPOTHESIS
ACCEPTANCE TEST REQUIRED
```

‏Capability מתועדת אינה הרשאה אוטומטית להשתמש בה ב־Production.

‏המודל הקנוני של enablement מפורט ב־`00A` ובחלק 9.
