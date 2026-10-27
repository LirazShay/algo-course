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

‏הוא מקור האמת של שכבות המושגים וה־contracts הקנוניים. חוזרים אליו כאשר צריך להבין במדויק לאיזו שכבה שייך מונח כגון `Limit`, ‏`IOC`, ‏`Post Only`, ‏`Bracket`, ‏`SMART`, ‏`Adaptive` או `MARKETABLE_LIMIT_IOC`.

‏ל־quick lookup של מונח בודד משתמשים ב־:

`00C-CANONICAL-GLOSSARY.md`

‏ה־Glossary מתחיל בכל מונח מ־**במילים פשוטות**, ואז נותן את המשמעות המקצועית, מה לא לבלבל איתו ולאיזה פרק ממשיכים. הוא אינו מבחן כניסה לקורס ואינו מחליף את ההסבר המלא בפרקי המשפחות.

‏כאשר קופצים ישר לבעיה מסוימת ורוצים לדעת מה prerequisite, לאן ממשיכים אחר כך, או מי מנהל את ה־Order לאחר Submit, משתמשים ב־:

`00D-PREREQUISITES-CROSS-REFERENCES-AND-OWNERSHIP-MAP.md`

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

‏`00A` נשאר Reference קנוני של taxonomy, ‏`00C` נשאר Reference מהיר של definitions, ו־`00D` הוא מפת prerequisites/cross-references/ownership לאורך כל המסלול.

‏הפרקים אינם רשימת פקודות בלבד. המטרה היא לעבור בהדרגה מ־semantics של Order בודדת אל מנוע שמסוגל לבחור, לנהל, לבטל, להחליף, לשחזר ולהגן על Orders בצורה עקבית.

---

# ‏מפת הקורס

## ‏`00B` — Beginner Navigation and Problem → Candidate Index

‏נקודת הכניסה למתחיל: הסברים בסיסיים, prerequisites מינימליים, ושתי דרכי קריאה — מסלול לימוד רציף או התחלה מבעיה מעשית. ה־Index מפנה ממשפחה או צורך לפרקים הנכונים, אך אינו בוחר Order במקום Decision Engine.

## ‏`00A` — Canonical Taxonomy and Vocabulary

‏מגדיר פעם אחת את שכבות המושגים, vocabulary של זמן/מחיר/cancel/partial fill/capability, וההבדל בין `FACT`, ‏`ENGINE RULE`, ‏`RESEARCH HYPOTHESIS` ו־`ACCEPTANCE TEST REQUIRED`.

## ‏`00C` — Canonical Glossary

‏מילון beginner-first למונחים שחוזרים לאורך הקורס: Mode, Candidate, Primitive, TIF, materialization, queue, markout, ownership, residency, survivability, reconciliation, capability ועוד. כל ערך מתחיל בהסבר פשוט ורק אחר כך בשם ובהגדרה המקצועיים.

## ‏`00D` — Prerequisites, Cross-References and Ownership Map

‏מפה שמראה מה צריך להבין לפני כל חלק, לאן ממשיכים ממנו, ואיך להבדיל בין `venue-native`, ‏`broker-resident`, ‏`broker-simulated`, ‏`broker-managed` ו־`client-managed`. היא גם קובעת את כלל `Define Once → Cross-reference → Extend Only When Needed` כדי לצמצם חזרות מיותרות.

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

# ‏00B — Beginner Navigation & Problem → Candidate Index

> ‏מטרת הפרק: לאפשר לקורא חדש להתחיל מהבעיה שהוא מנסה לפתור, להבין קודם את השאלה בשפה פשוטה, ורק אחר כך להגיע לשם המקצועי של ה־Candidate או משפחת הפקודות.
>
> ‏זהו **Index ללמידה**, לא מנגנון שבוחר Order אוטומטית ולא המלצת מסחר. כל Candidate חייבת לעבור את ה־Decision Gates, ה־Capability checks וה־fresh decision המתאימים בזמן אמת.

---

## ‏00B.1 אם אתה חדש — אל תנסה לזכור הכול מראש

‏אין צורך לשנן לפני תחילת הקורס את כל המילים:

```text
Behavior Candidate
Broker Primitive
Routing Policy
Broker Algo
residency
reconciliation
markout
atomicity
```

‏המסלול הלימודי הוא:

```text
בעיה אמיתית
→ דוגמה פשוטה
→ משפחת פתרונות
→ השם המקצועי
→ trade-offs
→ failure modes
→ engine mapping
```

‏כאשר מופיע מונח שאתה עדיין לא מכיר, אפשר להמשיך לקרוא את ההסבר הפשוט ולחזור ל־`00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md` כמקור taxonomy או ל־`00C-CANONICAL-GLOSSARY.md` כהסבר קצר beginner-first.

> ‏כלל לימודי: `00A` הוא מקור האמת של המונחים, אבל הוא **לא מבחן כניסה לקורס**.

---

## ‏00B.2 מה כן צריך לדעת לפני שמתחילים

‏מספיק להבין ברמה בסיסית מאוד:

- ‏`Bid` — המחיר הגבוה ביותר שקונה גלוי מציע כרגע.
- ‏`Ask` — המחיר הנמוך ביותר שמוכר גלוי מבקש כרגע.
- ‏`Spread` — המרחק בין `Bid` ל־`Ask`.
- ‏`Market Order` — בקשה לבצע מול המחירים הזמינים, בלי Limit שמגדירה מחיר מקסימלי/מינימלי משלנו.
- ‏`Limit Order` — Order שמגדירה גבול מחיר שמעבר לו איננו מוכנים לבצע.
- ‏`Fill` — הכמות שבוצעה בפועל.
- ‏`Partial Fill` — רק חלק מן הכמות בוצע.
- ‏`Position` — הכמות שכבר מוחזקת בפועל לאחר executions.

‏שאר המושגים נבנים בתוך הקורס.

---

# ‏00B.3 Problem → Candidate Index — Entry / Execution

| ‏מה אני מנסה להשיג? | ‏Candidate / Family שכדאי ללמוד קודם | ‏האלטרנטיבה הקרובה | ‏איפה ללמוד |
|---|---|---|---|
| ‏לנסות להתבצע **עכשיו**, אבל לא להשאיר remainder ישנה בשוק | `MARKETABLE_LIMIT_IOC` | Marketable Limit רגילה, `SWEEP_TO_FILL_LIMIT`, `ADAPTIVE_LIMIT_URGENT` | `02`, `02B`, `03`, `10F` |
| ‏להמתין ב־Bid/Ask ולהימנע ככל האפשר מחציית Spread | `PASSIVE_JOIN` | `PASSIVE_POST_ONLY`, `IMPROVE_ONE_TICK` | `02`, `04`, `04B` |
| ‏להבטיח שה־Order לא תהפוך liquidity-taking בזמן הגעה | `PASSIVE_POST_ONLY` | `PASSIVE_JOIN` | `04`, `04B`, `10H` |
| ‏לשפר מעט את המחיר לעומת passive join, בלי לקפוץ ישר לביצוע אגרסיבי | `IMPROVE_ONE_TICK` | `PASSIVE_JOIN`, `RELATIVE_PRIMARY` | `04B`, `10B` |
| ‏שהמחיר שלנו יזוז אוטומטית עם same-side quote | `RELATIVE_PRIMARY` | static Limit, `SNAP_MIDPOINT` | `05`, `05A`, `10I` |
| ‏לחפש execution סביב midpoint דרך broker-managed SMART behavior | `MIDPRICE` | `PEGGED_MIDPOINT_DIRECT`, `SNAP_MIDPOINT` | `05`, `05A`, `07`, `10H` |
| ‏לעקוב אחרי midpoint באופן מתמשך ב־destination מפורש | `PEGGED_MIDPOINT_DIRECT` | `MIDPRICE` | `05`, `05A`, `07A` |
| ‏לחשב מחיר מתוך midpoint פעם אחת ואז להשאיר Limit קבועה | `SNAP_MIDPOINT` | continuous midpoint peg | `05`, `05A`, `10I` |
| ‏להאציל לברוקר execution tactics עם urgency גבוהה | `ADAPTIVE_LIMIT_URGENT` | `MARKETABLE_LIMIT_IOC`, `SWEEP_TO_FILL_LIMIT` | `07`, `07A`, `10F` |
| ‏להאציל execution tactics אבל לא באותה urgency | `ADAPTIVE_LIMIT_NORMAL` | `ADAPTIVE_LIMIT_URGENT`, passive/dynamic candidates | `07`, `07A` |
| ‏לצרוך liquidity בכמה levels/destinations בתוך price bound | `SWEEP_TO_FILL_LIMIT` | `MARKETABLE_LIMIT_IOC`, Adaptive Urgent | `02A`, `02B`, `10F` |
| ‏להתחיל בסגנון market execution ואז להשאיר remainder כ־Limit | `MARKET_TO_LIMIT` | Marketable Limit, `MARKETABLE_LIMIT_IOC` | `02A`, `10F`, `10I` |

> ‏הטבלה עונה על “איפה להתחיל ללמוד”, לא על “איזו Order תנצח עכשיו”.

---

# ‏00B.4 Problem → Candidate Index — Liquidity / Visibility

| ‏מה הבעיה? | ‏Family שכדאי ללמוד | ‏הבדל מרכזי | ‏איפה ללמוד |
|---|---|---|---|
| ‏אני לא רוצה להציג את כל הנוכחות/הכמות שלי | `Hidden` | נראות מצומצמת/מוסתרת | `04`, `04B`, `10I` |
| ‏אני רוצה להציג רק Slice מתוך quantity גדולה יותר | `Reserve / Iceberg` | חלק גלוי + reserve quantity | `04`, `04B`, `10I` |
| ‏אני רוצה להציג מחיר אחד אבל להיות מוכן לבצע בטווח נוסף שאינו מוצג | `Discretionary` | hidden executable willingness, לא hidden quantity | `04A`, `04B`, `10F` |
| ‏אני רוצה למנוע accidental taking | `Post Only` | constraint על liquidity-taking | `04`, `04B`, `10H` |

‏לפני שימוש במנגנון concealment שואלים קודם:

```text
What information am I actually trying to hide?
```

‏אם אין footprint משמעותי, complexity נוספת יכולה להיות מיותרת.

---

# ‏00B.5 Problem → Candidate Index — Trigger / Exit / Protection

| ‏מה אני רוצה שיקרה? | ‏Family שכדאי ללמוד | ‏מה חשוב להבין קודם | ‏איפה ללמוד |
|---|---|---|---|
| ‏להתחיל exit כשהמחיר נע נגדי | `Stop` / `Stop Market` | Trigger price אינה guaranteed fill price | `06`, `06B`, `10H` |
| ‏להפעיל exit אבל לשמור Limit אחרי trigger | `Stop Limit` | יותר price protection, פחות exit certainty | `06`, `06B` |
| ‏להפעיל execution כאשר המחיר “נוגע” בכיוון ההפוך מ־Stop רגילה | `MIT` / `LIT` | להפריד trigger direction מ־post-trigger execution | `06A`, `06B` |
| ‏להזיז protection בעקבות מהלך חיובי | `Trailing Stop` / `Trailing Stop Limit` | ה־state תלויה ב־path, לא רק במחיר הנוכחי | `06`, `06B`, `10H` |
| ‏לקשור Entry עם Profit Taker ו־Protective Stop | `Bracket` | Parent/Child, partial fills ו־protection verification | `06`, `06C`, `08C` |
| ‏לתאם כמה Orders כך שביצוע של אחת ישפיע על האחרות | `OCA / OCO` | coordination אינה atomic guarantee | `06`, `06C`, `08C`, `10H` |
| ‏להפעיל Order רק אם predicate נוסף מתקיים | `Conditional Order` | מי מחזיק ומעריך את התנאי | `06`, `06C` |
| ‏לקבל exit החלטתי מקומי לפי state עשיר ועדכני | local dynamic exit | survivability ו־broker protection fallback | `06B`, `10C`, `10F` |

---

# ‏00B.6 Problem → Candidate Index — Routing / Control

| ‏מה אני מנסה לשלוט בו? | ‏נושא | ‏איפה ללמוד |
|---|---|---|
| ‏לתת לברוקר לבחור destination | `SMART Routing` | `07`, `07A` |
| ‏לבחור destination מפורש | Direct Routing | `07`, `07A` |
| ‏להבין אם Broker Algo מחליפה Strategy decision | Broker Algo ownership | `07`, `10H` |
| ‏להבין מי ממשיך לנהל Peg/Trigger/Algo אחרי disconnect | implementation owner / residency | `00A`, `00D`, `08B` |
| ‏לבדוק אם feature נתמך **בדיוק במסלול שלנו** | Capability tuple | `09`, `09B`, `10I` |

---

# ‏00B.7 Problem → Chapter Index — כשכבר קיימת Order

| ‏מה קרה? | ‏מה ללמוד | ‏איפה |
|---|---|---|
| ‏אני רוצה לשנות מחיר/כמות | Modify vs Cancel+New | `08`, `08A`, `10H` |
| ‏שלחתי Cancel — האם הפקודה כבר נעלמה? | Cancel lifecycle | `08`, `09C`, `10H` |
| ‏קיבלתי Partial Fill | fresh position decision | `08`, `09C`, `10E` |
| ‏לא קיבלתי Fill | `NO_FILL` outcome + fresh decision | `09C`, `10G` |
| ‏הברוקר דחה את ה־Order | `REJECT` classification | `09C` |
| ‏אני לא יודע אם Submit/Cancel הצליח | `UNKNOWN` + reconciliation | `08`, `08B`, `08D`, `10I` |
| ‏ה־Signal פג אבל Order עדיין Working | stale intent vs executable order | `08B`, `09C` |
| ‏התוכנה התחברה מחדש | Recovery / earned `READY` | `08D` |
| ‏המשתמש שינה Order ידנית | Ownership reclassification | `08C`, `08D` |

---

# ‏00B.8 שתי דרכי קריאה חוקיות

## ‏מסלול א — מתחיל שרוצה ללמוד מההתחלה

```text
00 Front Matter
→ 00B Beginner Navigation
→ Part 1
→ Part 2
→ Part 3
→ Parts 4–7
→ Part 8
→ Part 9
→ Part 10
```

‏במסלול הזה `00A` משמש Reference קנוני ו־`00C` משמש Glossary מהיר. אין צורך לשנן אותם לפני Part 1.

## ‏מסלול ב — קורא שמחפש לפתור בעיה מסוימת

```text
00B Problem Index
→ family chapter
→ decision/comparison chapter
→ failure/safety chapter if relevant
→ Part 9 capability check
→ Part 10 engine mapping if implementing
```

‏אם אינך בטוח מהו prerequisite או מי מנהל את ה־behavior לאחר Submit, השתמש ב־`00D-PREREQUISITES-CROSS-REFERENCES-AND-OWNERSHIP-MAP.md`.

---

# ‏00B.9 Cross-Reference Rule

‏בכל family משמעותית, התוצר הסופי מאפשר לעבור בין ארבע שכבות:

```text
Learn the semantics
→ Compare alternatives
→ Understand failure/survivability
→ Map to engine/capability
```

‏דוגמה:

```text
MidPrice
→ 05 / 05A
→ 10F / 10H
→ 08B
→ 07 / 09B / 10B
```

‏ודוגמה נוספת:

```text
Bracket
→ 06 / 06C
→ 10F / 10H
→ 08C / 08D
→ 10C
```

‏למפה מרוכזת של prerequisites, סוגי cross-reference ו־ownership ראו `00D`.

---

# ‏00B.10 שלושה כללים לפני שבוחרים Candidate

```text
1. Problem first, order name second.
2. Capability can eliminate a candidate; it does not choose the winner.
3. A changed state requires a fresh decision; never treat this index as automatic fallback logic.
```

‏אם שום Candidate אינה עומדת יחד בדרישות Signal, Risk, timing, price bound ו־Capability, התוצאה החוקית יכולה להיות:

```text
NO_TRADE
NO_ACTION
REDUCE_SIZE
CANCEL_EXISTING
DEFER
EXIT_ONLY
```

---

## ‏00B.11 מה ה־Index מבטיח — ומה לא

‏ה־Index מבטיח שלמתחיל תהיה נקודת כניסה לפי הבעיה שהוא מזהה, בלי צורך להכיר מראש את כל שמות הפקודות.

‏הוא אינו מחליף:

```text
family semantics
comparison / trade-off analysis
failure / survivability analysis
capability validation
fresh Decision Engine evaluation
```

‏לכן כל מסלול שמתחיל כאן ממשיך לפרקי המקור המתאימים לפני implementation או Production use.

# ‏Taxonomy ו־Vocabulary קנוניים ל־`Advanced Order Mastery`

> ‏הפרק הזה הוא מילון המבנה של הקורס. כאשר פרק מאוחר משתמש במונח בצורה שנראית רחבה או עמומה יותר, ההגדרות כאן קובעות את שכבת ה־abstraction שאליה המונח שייך.

---

## ‏0A.1 למה צריך Taxonomy לפני שלומדים עוד שמות של פקודות

‏בעולם ה־Execution קל לקרוא לכל דבר `Order Type`, אבל `Limit`, ‏`IOC`, ‏`Post Only`, ‏`Bracket`, ‏`SMART`, ‏`Adaptive` ו־`PASSIVE_JOIN` אינם אובייקטים מאותו סוג.

‏אם מערבבים ביניהם, קשה להבין מה באמת בחרה האסטרטגיה, מה הברוקר קיבל, מה ה־Venue מנהל ומה המנוע שלנו עדיין חייב לנהל בעצמו.

‏לכן הקורס משתמש בשכבות הבאות:

```text
STRATEGY / TRADE INTENT
APPLICATION EXECUTION MODE
BEHAVIOR CANDIDATE
BROKER ORDER PRIMITIVE
TIME / FILL POLICY
DISPLAY / LIQUIDITY ATTRIBUTE
TRIGGER / DEPENDENCY / COMPOSITE STRUCTURE
ROUTING POLICY
BROKER ALGO
OWNERSHIP / IMPLEMENTATION DIMENSIONS
CAPABILITY / ENABLEMENT STATE
```

---

## ‏0A.2 `Strategy / Trade Intent`

‏זו השכבה שאומרת **מה אנחנו רוצים להשיג**, לא איך הברוקר יבצע זאת.

‏דוגמאות:

```text
enter long while signal is valid
exit current position quickly
reduce risk immediately
protect an open position if client process disappears
```

‏Intent אינה `Order Type`.

---

## ‏0A.3 `Application Execution Mode`

‏`Execution Mode` היא החלטה סמנטית של המערכת שלנו על **אופי הביצוע**.

‏היא אינה אמורה לערבב בתוכה שדות API ספציפיים.

‏ה־vocabulary הקנוני ברמת mode הוא:

```text
PASSIVE
PRICE_IMPROVING
MIDPOINT_SEEKING
BROKER_MANAGED
AGGRESSIVE_CAPPED
NORMAL_EXIT
FAST_EXIT
EMERGENCY_REDUCE
```

‏Mode עונה על שאלות כמו:

```text
Do we intend to provide or take liquidity?
How much price improvement are we seeking?
How urgent is the fill?
How much execution control are we delegating?
Is the purpose entry, normal exit or emergency risk reduction?
```

---

## ‏0A.4 `Behavior Candidate`

‏`Behavior Candidate` היא implementation strategy קונקרטית יותר שה־Decision Engine יכולה להשוות, אך היא עדיין אינה בהכרח Broker Order יחידה.

‏לדוגמה, ב־Entry:

```text
PASSIVE_JOIN
PASSIVE_POST_ONLY
IMPROVE_ONE_TICK
RELATIVE_PRIMARY
MIDPRICE
SNAP_MIDPOINT
PEGGED_MIDPOINT_DIRECT
ADAPTIVE_LIMIT_URGENT
ADAPTIVE_LIMIT_NORMAL
MARKETABLE_LIMIT_IOC
```

‏השמות האלה נשמרים משום שהם שימושיים למחקר ולהשוואת outcomes, אבל הקורס לא יקרא להם "Order Types" בלי qualifier.

‏דוגמה:

```text
Execution Mode      = AGGRESSIVE_CAPPED
Behavior Candidate  = MARKETABLE_LIMIT_IOC
Concrete Broker Plan:
    orderType = LMT
    tif       = IOC
    route     = SMART
    limit     = hard economic price boundary
```

---

## ‏0A.5 `Broker Order Primitive`

‏זו הוראת הבסיס שה־Broker/API מבינים כ־order semantics.

‏דוגמאות נפוצות בקורס:

```text
Market
Limit
Stop
Stop Limit
Trailing Stop
Trailing Stop Limit
MIT
LIT
Market-to-Limit
Relative / Pegged variants
Snap variants
```

‏השם והמימוש המדויקים תלויים Broker, Product, Route ו־API.

### ‏כלל קנוני: `Marketable Limit`

‏`Marketable Limit` אינה בהכרח primitive נפרדת.

‏המשמעות הקנונית בקורס היא:

```text
Limit order
whose current price allows immediate execution
against available contra liquidity
```

‏לכן:

```text
Broker primitive = Limit
Current marketability = marketable
```

‏אם מוסיפים `IOC`, ‏SMART ו־hard cap כחלק מה־policy שלנו, אפשר לקבל את ה־Behavior Candidate ‏`MARKETABLE_LIMIT_IOC`.

---

## ‏0A.6 `Time / Fill Policy`

‏השכבה הזו מגדירה כמה זמן הפקודה יכולה לחיות ואילו תנאי Fill היא מקבלת.

‏דוגמאות:

```text
DAY
GTC
GTD
IOC
FOK
AON
Minimum Quantity
```

‏`IOC` אינה Order Type מתחרה ב־`Limit`; אפשר למשל לשלוח `Limit + IOC`.

---

## ‏0A.7 `Display / Liquidity Attribute`

‏השכבה הזו משנה כיצד הפקודה מוצגת או איזה liquidity intent היא כופה.

‏דוגמאות:

```text
Post Only
Hidden
Display Size
Reserve / Iceberg
Discretionary amount
```

‏`Post Only` היא constraint על liquidity behavior, לא "Limit טובה יותר".

‏`Hidden` ו־`Reserve` עוסקות בעיקר בכמות/נראות.

‏`Discretionary` עוסקת ביכולת execution מעבר למחיר המוצג, ולכן אינה synonym של Hidden.

---

## ‏0A.8 `Trigger Policy`

‏Trigger עונה על השאלה:

```text
WHEN does another execution behavior become active?
```

‏צריך תמיד להפריד אותה מהשאלה:

```text
WHAT happens after activation?
```

‏לדוגמה:

```text
Stop Market -> trigger, then market-style execution
Stop Limit  -> trigger, then limit execution
MIT         -> opposite trigger direction, then market-style execution
LIT         -> opposite trigger direction, then limit execution
```

‏להשוואה המקצועית המלאה של trigger direction מול post-trigger execution ראו `06A` ו־`06B`.

---

## ‏0A.9 `Dependency / Composite Structure`

‏מבנים אלה מקשרים כמה Orders או הוראות זו לזו.

‏דוגמאות:

```text
Bracket
parent / child
OCA / OCO
Conditional Order
```

‏הם אינם primitive יחיד ואינם מבטיחים transaction אטומית.

‏כלל קנוני:

```text
coordination semantics
!=
transactional atomic guarantee
```

---

## ‏0A.10 `Routing Policy`

‏Routing עונה על השאלה **לאן מותר או רצוי לשלוח את הפקודה**.

‏דוגמאות:

```text
SMART
Direct Routing
specific destination / venue
```

‏`SMART` אינה Order Type.

‏אותו Broker primitive יכול לקבל semantics או capabilities שונות לפי route/destination.

---

## ‏0A.11 `Broker Algo`

‏Broker Algo מקבלת מן הלקוח intent וגבולות, ומנהלת חלק מה־execution policy אצל הברוקר.

‏דוגמאות בקורס:

```text
Adaptive
MidPrice
```

‏כלל קנוני:

```text
Broker Algo may optimize HOW
but our engine still owns WHETHER, limits, lifetime and risk.
```

‏כלומר delegated execution אינה delegated strategy.

---

## ‏0A.12 שלושה ממדים שאסור לערבב: Residency, Behavior Owner, Native Semantics

‏המונחים הבאים אינם synonyms:

```text
client-managed
broker-managed
broker-simulated
broker-resident
venue-native
```

‏נפריד שלוש שאלות:

### ‏א. איפה ה־state שיכול להמשיך לחיות?

```text
local client
broker
venue
```

### ‏ב. מי מעריך Trigger / Reprice / Algo rule?

```text
client
broker
venue
```

### ‏ג. האם ה־Venue עצמו מכיר את semantics?

```text
venue-native
or
simulated / synthesized upstream
```

‏לכן Order יכולה להיות:

```text
broker-resident
+
broker-simulated
```

‏באותו זמן.

‏ו־`broker-resident` משמש בקורס רק כאשר רוצים לומר שהוראה מסוימת יכולה להמשיך להתקיים ללא process המקומי; הוא אינו אומר אוטומטית שהפקודה Native בבורסה.

---

## ‏0A.13 Vocabulary קנוני של זמן

‏המילה `TTL` לבדה אינה מספיקה.

‏נשתמש ב־:

```text
signal_ttl
application_order_ttl
broker_tif
working_order_age
```

‏המשמעות:

- ‏`signal_ttl` — כמה זמן ה־Alpha/Intent עדיין תקפים.
- ‏`application_order_ttl` — כמה זמן המנוע שלנו מוכן להשאיר ניסיון execution מסוים חי.
- ‏`broker_tif` — מדיניות הזמן שהוגדרה אצל הברוקר/venue, כגון `DAY`, ‏`GTC`, ‏`IOC`.
- ‏`working_order_age` — כמה זמן Order חיה בפועל מאז שהפכה ל־working/relevant.

‏אף אחד מארבעת השעונים אינו תחליף לאחר.

---

## ‏0A.14 Vocabulary קנוני של מחיר

‏המושג האב הוא:

```text
Economic Price Boundary
```

‏וממנו נגזרים לפי lifecycle:

```text
entry_max_price
exit_min_price when applicable
emergency_price_boundary
broker_limit_price
```

‏`broker_limit_price` היא הוראה טכנית שנשלחת; היא אינה בהכרח זהה למודל הכלכלי שממנו נגזרה.

‏המונח `hard cap` יכול להישאר כקיצור מקומי כאשר ברור שמדובר בגבול מחיר כלכלי שאסור ל־execution לעבור.

---

## ‏0A.15 Vocabulary קנוני של Cancel

‏ה־invariant הוא:

```text
CANCEL_REQUESTED
!=
CANCEL_CONFIRMED
!=
NO_LONGER_EXECUTABLE
```

‏כל Order שאינה terminal לפי Broker evidence נשארת חלק מ־potential exposure.

‏פרקים מאוחרים יכולים ליישם את הכלל, אך אינם צריכים להמציא לו משמעות חדשה.

---

## ‏0A.16 Vocabulary קנוני של Partial Fill

‏`Partial Fill` מוגדרת פעם אחת:

```text
executed_qty > 0
and
remaining_qty > 0
```

‏אבל המשמעות התפעולית תלויה בהקשר:

```text
Part 2  -> economics and fill quality
Part 3  -> IOC/FOK semantics
Part 6  -> protection and parent/child consequences
Part 8  -> broker truth and lifecycle
Part 10 -> fresh decision for position + remaining intent
```

‏אין להתייחס ל־partial fill כתקלה אוטומטית או כהרשאה אוטומטית להשלים את היתרה.

---

## ‏0A.17 Capability אינה Boolean

‏הקורס אינו משתמש ב־:

```text
supported = true
```

‏כראיה שמותר להשתמש ב־feature ב־Production.

‏ה־enablement ladder הקנוני הוא:

```text
DOC_ONLY
RUNTIME_CONFIRMED
PAPER_ACCEPTED
LIVE_SMALL_ACCEPTED
PRODUCTION_ENABLED
```

‏וצריך לצרף context כגון:

```text
product
contract
route / destination
API adapter
account / legal entity
session
```

‏`Capability Gate` רשאית להסיר Candidate; היא אינה בוחרת Candidate חלופית ואינה מעניקה אוטומטית הרשאה להיות אגרסיביים יותר.

---

## ‏0A.18 ארבעה Labels של Evidence ו־Policy

‏כדי לא לערבב תיעוד, החלטת מערכת והשערת מחקר, הקורס משתמש בארבעה labels:

> **`FACT`**  
> ‏טענה עובדתית שנועדה להיות מגובה בתיעוד מתאים. כאשר היא תלויה Broker/API/Venue או זמן, יש לציין context ותאריך אימות במקום שבו הדבר מהותי.

> **`ENGINE RULE`**  
> ‏החלטת תכנון מחייבת של המנוע שלנו. זו אינה טענה ש"כך השוק עובד", אלא policy שאנחנו בוחרים לאכוף.

> **`RESEARCH HYPOTHESIS`**  
> ‏השערה שצריכה להיבדק ב־Replay/Paper/Live-small או בניסוי אחר. היא אינה מוצגת כעובדה.

> **`ACCEPTANCE TEST REQUIRED`**  
> ‏נקודה שבה תיעוד בלבד אינו מספיק עבור Production, או שה־semantics תלויים adapter/product/route ולכן צריך למדוד התנהגות בפועל לפני enablement.

---

## ‏0A.19 דוגמה אחת שמחברת את כל השכבות

‏נניח שהמנוע רוצה Entry מהירה אך תחומה במחיר.

```text
Trade Intent:
    enter long while signal is still valid

Execution Mode:
    AGGRESSIVE_CAPPED

Behavior Candidate:
    MARKETABLE_LIMIT_IOC

Broker Order Primitive:
    LIMIT

Time / Fill Policy:
    IOC

Routing Policy:
    SMART

Economic Price Boundary:
    entry_max_price = 50.05

Concrete Broker Limit:
    50.05

Lifecycle owner:
    client manages intent lifetime and post-fill decision
```

‏כך אפשר לדבר על אותה פעולה בלי לקרוא לכל השכבות "Order Type".

---

## ‏0A.20 כלל קריאה לכל שאר הקורס

‏בכל פעם שמופיע כלי מתקדם, הקורא צריך להיות מסוגל למקם אותו לפחות בארבע שאלות:

```text
1. What layer is this concept in?
2. Who owns its behavior after submit?
3. What constraints remain owned by our engine?
4. What evidence is required before Production enablement?
```

‏אם אחת מארבע התשובות אינה ברורה, ההסבר עדיין אינו שלם.

---

## ‏0A.21 כלל `Define Once → Cross-reference → Extend`

‏כדי שהקורס לא יחזור שוב ושוב על אותם contracts, ארבעה נושאים מוגדרים כאן פעם אחת ומשם מורחבים רק כאשר למשפחה מסוימת יש consequence ייחודי:

| נושא קנוני | מקור ההגדרה | מה מותר לפרק משפחה להוסיף |
|---|---|---|
| clocks / TTL | `00A.13` | רק איך השעונים משפיעים על אותה family |
| Economic Price Boundary / hard cap | `00A.14` | רק materialization או failure ייחודיים |
| cancel / broker truth | `00A.15` + Part `08` | רק race/late-effect ייחודי |
| Partial Fill | `00A.16` | רק economics, protection או lifecycle ייחודיים |

‏כאשר אין consequence חדש, מפנים להגדרה הקנונית במקום להגדיר אותה מחדש.

‏`00C` משמש quick-reference beginner-first לאותם מונחים; הוא אינו מקור semantics חלופי.

# ‏00C — Canonical Glossary: מילון Advanced Orders למתחיל

> ‏מטרת הפרק: לתת מקום אחד שבו אפשר לעצור על מונח מקצועי, להבין קודם **מה הוא אומר בעולם האמיתי**, ורק אחר כך לראות את ההגדרה הקנונית שבה הקורס והמנוע משתמשים.
>
> ‏זהו Glossary קצר־יחסית. ההסבר המלא וההשוואות נשארים בפרקי המשפחות. כאשר יש סתירה, `00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md` קובע את שכבת ה־taxonomy וה־contracts המאוחרים קובעים את ה־lifecycle/safety.

---

## ‏00C.1 איך להשתמש במילון

‏לכל מונח נשמור את הסדר:

```text
במילים פשוטות
→ המונח המקצועי
→ מה הוא לא
→ לאן ממשיכים בקורס
```

‏המטרה אינה לשנן את הרשימה מראש. חוזרים לכאן כאשר מונח עוצר את הקריאה.

---

# ‏A — שכבות ההחלטה והפקודה

## ‏`Trade Intent`

‏**במילים פשוטות:** מה אנחנו רוצים להשיג כלכלית — למשל להיכנס כל עוד ה־Signal תקפה, לצאת מהר, או להקטין Risk.

‏**קנוני:** שכבת Strategy/Purpose. היא אינה Order Type ואינה אומרת עדיין איך הברוקר יבצע.

‏**לא להתבלבל עם:** `Application Execution Mode` או `Behavior Candidate`.

‏**המשך:** `00A`, `10A`.

## ‏`Application Execution Mode`

‏**במילים פשוטות:** איזה אופי ביצוע אנחנו רוצים — פסיבי, מחפש שיפור מחיר, midpoint, מנוהל בידי Broker, או אגרסיבי אבל מוגבל במחיר.

‏**קנוני:** אחת מן ה־modes כגון `PASSIVE`, ‏`PRICE_IMPROVING`, ‏`MIDPOINT_SEEKING`, ‏`BROKER_MANAGED`, ‏`AGGRESSIVE_CAPPED`, וכן Modes של Exit.

‏**לא להתבלבל עם:** `LMT`, ‏`IOC`, ‏`SMART` או `Adaptive`.

‏**המשך:** `00A`, `09B`, `10B`, `10C`.

## ‏`Behavior Candidate`

‏**במילים פשוטות:** דרך ביצוע קונקרטית שהמנוע יכול להשוות מול דרכים אחרות.

‏**דוגמאות:** `PASSIVE_JOIN`, ‏`MIDPRICE`, ‏`SNAP_MIDPOINT`, ‏`MARKETABLE_LIMIT_IOC`.

‏**קנוני:** Candidate עדיין אינה בהכרח Broker Order אחת; היא צריכה לעבור materialization ו־Capability checks.

‏**המשך:** `09B`, `10B`.

## ‏`Broker Order Primitive`

‏**במילים פשוטות:** הוראת הבסיס שה־Broker/API מקבלים, למשל Market, Limit, Stop או Stop Limit.

‏**קנוני:** primitive היא שכבה אחרת מ־Mode, TIF, Route או Broker Algo.

‏**המשך:** `00A`, `01`, `02`.

## ‏`Materialization`

‏**במילים פשוטות:** להפוך החלטה מופשטת כמו “בצע אגרסיבי אבל אל תעבור מחיר מסוים” לשדות Broker ממשיים.

‏**קנוני:** המעבר מ־Mode/Candidate אל primitive, ‏TIF, attributes, routing, algo ו־parameters.

‏**לא להתבלבל עם:** בחירת ה־winner. Materialization מתרגמת החלטה; היא אינה אמורה לשנות אותה.

‏**המשך:** `09B`.

## ‏`Concrete Order Plan`

‏**במילים פשוטות:** התכנית הסופית לפני Adapter/API — quantity, גבולות, primitive, ‏TIF, route, algo ו־capability evidence.

‏**קנוני:** הגבול שבו ה־Decision Engine כבר הכריעה, וה־Adapter רשאי רק לתרגם payload בלי לשנות semantics.

‏**המשך:** `09B`.

---

# ‏B — מחיר, זמן ו־Fill

## ‏`Economic Price Boundary`

‏**במילים פשוטות:** המחיר הגרוע ביותר שאנחנו עדיין מוכנים לקבל מבחינה כלכלית.

‏**קנוני:** boundary כלכלית של המנוע. `broker_limit_price` הוא שדה טכני שנגזר ממנה, אך אינו בהכרח אותו concept.

‏**המשך:** `00A`, `02`, `10A`.

## ‏`Marketable Limit`

‏**במילים פשוטות:** Limit שהמחיר שלה מאפשר לבצע מיד מול liquidity זמינה, אבל עדיין יש לה גבול מחיר.

‏**קנוני:** לרוב `Limit` primitive במצב marketable, לא primitive חדשה בפני עצמה.

‏**המשך:** `02`, `02B`.

## ‏`TIF — Time in Force`

‏**במילים פשוטות:** כמה זמן ומה תנאי החיים שה־Broker נותן ל־Order.

‏**דוגמאות:** `DAY`, ‏`GTC`, ‏`GTD`, ‏`IOC`.

‏**לא להתבלבל עם:** כמה זמן ה־Signal שלנו תקפה.

‏**המשך:** `03`.

## ‏`signal_ttl`

‏**במילים פשוטות:** כמה זמן הסיבה העסקית/Signal עדיין שווה משהו.

‏**קנוני:** clock של ה־Intent, לא של ה־Broker Order.

‏**המשך:** `00A`, `10A`.

## ‏`application_order_ttl`

‏**במילים פשוטות:** כמה זמן המנוע שלנו מוכן להשאיר ניסיון execution מסוים חי.

‏**חשוב:** כשהוא פג, Order מרוחקת אינה נעלמת מעצמה; צריך Cancel/Reconciliation לפי ה־state.

‏**המשך:** `00A`, `08B`, `09C`.

## ‏`working_order_age`

‏**במילים פשוטות:** כמה זמן Order כבר חיה/עובדת בפועל.

‏**שימוש:** Queue, staleness ו־decision telemetry.

‏**המשך:** `00A`, `08A`, `10G`.

## ‏`Fill`

‏**במילים פשוטות:** כמות שבוצעה בפועל.

‏**קנוני:** execution משנה Position Truth; היא אינה רק שינוי ב־Order status.

‏**המשך:** `01`, `02`, `09C`.

## ‏`Partial Fill`

‏**במילים פשוטות:** רק חלק מן הכמות בוצע.

‏**קנוני:** Position השתנתה ולכן זו Decision State חדשה; אסור להמשיך אוטומטית כאילו לא קרה דבר.

‏**המשך:** `00A`, `08`, `09C`, `10E`.

## ‏`NO_FILL`

‏**במילים פשוטות:** הניסיון הסתיים בלי ביצוע מן ה־Order attempt הזה.

‏**קנוני:** outcome, לא authorization אוטומטי לרדוף אחרי המחיר או להרחיב גבולות.

‏**המשך:** `09C`, `10G`.

## ‏`REJECT`

‏**במילים פשוטות:** ה־Broker/route לא קיבלו את ה־Order כפי שנשלחה.

‏**קנוני:** צריך classification של capability/parameter/permission/risk וכו'; Reject אינה No-Fill.

‏**המשך:** `09C`.

---

# ‏C — Liquidity, Queue ו־Execution Quality

## ‏`Post Only`

‏**במילים פשוטות:** דרישה לא להפוך ל־liquidity taker בזמן ההגעה.

‏**קנוני:** constraint, לא “Limit טובה יותר”. יכולה לגרום reject/reprice/no-fill לפי route semantics.

‏**המשך:** `04`, `04B`, `10H`.

## ‏`Hidden`

‏**במילים פשוטות:** להסתיר את הנוכחות/הכמות המוצגת.

‏**לא להתבלבל עם:** `Discretionary`, שמסתירה willingness במחיר ולא רק quantity/display.

‏**המשך:** `04`, `10I`.

## ‏`Reserve / Iceberg`

‏**במילים פשוטות:** להציג רק חלק מן הכמות הכוללת ולהחזיק remainder כ־reserve לפי semantics של המסלול.

‏**המשך:** `04`, `10I`.

## ‏`Discretionary`

‏**במילים פשוטות:** להציג מחיר אחד אבל להיות מוכנים לבצע בטווח נוסף שאינו מוצג.

‏**קנוני:** hidden executable willingness, לא hidden quantity.

‏**המשך:** `04A`, `04B`.

## ‏`Queue Position / Queue Value`

‏**במילים פשוטות:** המקום היחסי שלנו בתור של Orders שמחכות במחיר מסוים, והערך האפשרי של הזמן שכבר חיכינו.

‏**קנוני:** asset מותנה בלבד; Signal/Risk validity קודמים לה.

‏**המשך:** `08A`, `10G`.

## ‏`Adverse Selection`

‏**במילים פשוטות:** קיבלנו Fill דווקא ברגע שבו הצד השני היה שמח לבצע מולנו כי המחיר עומד לזוז נגדנו.

‏**קנוני:** צריך למדוד outcome אחרי ה־Fill, לא להניח ש־passive/price improvement בהכרח זולים.

‏**המשך:** `04B`, `10G`.

## ‏`Markout`

‏**במילים פשוטות:** איפה היה המחיר זמן קצר אחרי ה־Fill ביחס למחיר שבו ביצענו.

‏**שימוש:** מדד ל־execution quality/adverse selection בטווח שמתאים ל־signal horizon.

‏**לא להתבלבל עם:** PnL מלא של העסקה.

‏**המשך:** `10G`, `10H`.

---

# ‏D — Routing ו־Broker-managed behavior

## ‏`SMART Routing`

‏**במילים פשוטות:** לתת ל־Broker לבחור execution destination/path לפי מנגנון ה־routing שלו.

‏**קנוני:** Routing Policy, לא Order Type ולא Broker Algo.

‏**המשך:** `07`, `07A`.

## ‏`Direct Routing`

‏**במילים פשוטות:** לבחור destination מפורש במקום להעביר את בחירת ה־destination ל־SMART.

‏**קנוני:** route/destination יכול לשנות capabilities ו־semantics ולכן הוא חלק מ־Capability scope.

‏**המשך:** `07`, `07A`, `09B`.

## ‏`Broker Algo`

‏**במילים פשוטות:** אנחנו נותנים לברוקר גבולות ומטרה execution מסוימת והוא מנהל חלק מן הטקטיקה.

‏**דוגמאות בקורס:** `Adaptive`, ‏`MidPrice`.

‏**קנוני:** Broker יכול לייעל **איך** לבצע; המנוע שלנו עדיין מחזיק **האם**, lifetime, limits ו־risk.

‏**המשך:** `07`, `10H`.

---

# ‏E — Ownership, Residency ו־מי ממשיך לפעול

## ‏`implementation_owner`

‏**במילים פשוטות:** מי אחראי כרגע להעריך את הכלל שמזיז/מפעיל/מנהל את ה־Order — client, broker או venue.

‏**קנוני:** Behavior ownership הוא dimension נפרד מ־residency ומ־native semantics.

‏**המשך:** `00A`, `00D`, `08B`.

## ‏`Client-Managed`

‏**במילים פשוטות:** התוכנה שלנו צריכה להמשיך לחשב/להחליט/לשלוח פעולות כדי שההתנהגות תמשיך.

‏**משמעות disconnect:** behavior מקומי עלול להפסיק; Orders שכבר נשלחו יכולות עדיין להישאר executable לפי ה־state שלהן.

‏**המשך:** `00D`, `08B`, `08D`.

## ‏`Broker-Managed`

‏**במילים פשוטות:** Broker מנהל את behavior לאחר submit לפי הפרמטרים שקיבל.

‏**לא אומר:** שה־Broker יודע שה־Signal שלנו מתה או שה־Order בטוחה להשאיר ללא watchdog מקומי.

‏**המשך:** `00D`, `07`, `08B`, `10H`.

## ‏`Broker-Resident`

‏**במילים פשוטות:** state/Order יכולה להמשיך להתקיים אצל Broker גם בלי process המקומי.

‏**קנוני:** residency בלבד. זה **לא** אומר שה־Venue מכיר את ה־semantics Native.

‏**המשך:** `00A`, `00D`, `08B`.

## ‏`Broker-Simulated`

‏**במילים פשוטות:** Broker מחקה/מיישם behavior שאינה בהכרח native ב־Venue.

‏**קנוני:** simulation semantics. Order יכולה להיות גם `Broker-Resident` וגם `Broker-Simulated` באותו זמן.

‏**המשך:** `00A`, `00D`, `08B`.

## ‏`Venue-Native`

‏**במילים פשוטות:** ה־Venue עצמו מכיר ומיישם את semantics של ה־Order/feature.

‏**לא אומר:** שה־feature מתאים לחשבון/route שלנו או Production-enabled אצלנו.

‏**המשך:** `00A`, `00D`, `09`.

## ‏`Survivability`

‏**במילים פשוטות:** מה עדיין יכול להישאר חי ולבצע אם client מתנתק/קורס/מופעל מחדש.

‏**קנוני:** נקבעת לפי implementation path בפועל, לא לפי שם ה־Order בלבד.

‏**המשך:** `08B`.

---

# ‏F — Lifecycle, Uncertainty ו־Recovery

## ‏`CANCEL_REQUESTED`

‏**במילים פשוטות:** ביקשנו לבטל; עדיין אין הוכחה שה־Order אינה יכולה לבצע.

‏**Invariant:**

```text
CANCEL_REQUESTED
!= CANCEL_CONFIRMED
!= TERMINAL_NON_EXECUTABLE
```

‏**המשך:** `00A`, `08`, `10H`.

## ‏`UNKNOWN`

‏**במילים פשוטות:** אנחנו באמת לא יודעים אם side effect קרה — למשל האם Submit הגיע, האם Cancel הצליח או האם Fill קרתה בזמן disconnect.

‏**קנוני:** state מקצועית. לא מנחשים certainty כדי להמשיך מהר.

‏**המשך:** `08B`, `08D`, `09C`, `10I`.

## ‏`STALE`

‏**במילים פשוטות:** ההחלטה/Intent כבר אינה תקפה, אף שה־Order עצמה אולי עדיין Working ויכולה לבצע.

‏**קנוני:** stale intent יוצרת cancellation/reconciliation obligation; היא אינה terminal broker state.

‏**המשך:** `08B`, `09C`.

## ‏`Late Effect`

‏**במילים פשוטות:** אירוע מגיע אחרי שהמנוע כבר שינה הנחה או state — למשל late fill אחרי Cancel request.

‏**דוגמאות:** late fill, late trigger, late reprice, late child activation, late cancel ACK.

‏**המשך:** `08B`, `08C`.

## ‏`Reconciliation`

‏**במילים פשוטות:** להשוות מחדש את מה שהמערכת חושבת עם מה שה־Broker/executions/position מראים שבאמת קרה.

‏**קנוני:** acquisition מחדש של external truth לפני החזרת authority מלאה למנוע.

‏**המשך:** `08D`.

## ‏`READY`

‏**במילים פשוטות:** המערכת לא רק מחוברת — היא הוכיחה שהיא מבינה מספיק טוב Position, Orders, ownership, protection ו־unknowns כדי לפעול שוב.

‏**Invariant:**

```text
CONNECTED != READY
```

‏**המשך:** `08D`.

---

# ‏G — Protection ו־Composite structures

## ‏`Bracket`

‏**במילים פשוטות:** מבנה של Parent/Entry עם children כגון Profit Taker ו־Protective Stop.

‏**קנוני:** כמה Orders ויחסים ביניהן, לא transaction אטומית אחת.

‏**המשך:** `06`, `06C`, `08C`.

## ‏`OCA / OCO`

‏**במילים פשוטות:** קבוצת Orders שבה event באחת אמור להשפיע על האחרות, למשל לבטל sibling.

‏**קנוני:** coordination primitive, לא atomic guarantee. Member שאינה terminal עדיין יכולה להיות executable.

‏**המשך:** `06C`, `08C`, `10H`.

## ‏`Protection Coverage`

‏**במילים פשוטות:** כמה מן ה־Position האמיתית מכוסה כרגע ב־protection שאומת אצל Broker.

‏**קנוני:** נגזרת מ־`reconciled_position` ו־verified executable protective quantity, לא מן הכמות שתכננו.

‏**המשך:** `08C`.

## ‏`UNTRANSMITTED != PROTECTED`

‏**במילים פשוטות:** Order שקיימת רק מקומית/במצב שלא נשלח אינה הגנה אמיתית על Position.

‏**המשך:** `08C`.

---

# ‏H — Capability, Evidence ו־Rollout

## ‏`Capability`

‏**במילים פשוטות:** האם behavior מסוימת באמת נתמכת במסלול המדויק שלנו.

‏**קנוני:** combination-specific — product, contract, adapter, route/destination, session, account/legal entity ו־parameter combination.

‏**המשך:** `09`, `09B`.

## ‏`PRODUCTION_ENABLED`

‏**במילים פשוטות:** יש מספיק evidence במסלול המדויק כדי לאשר שימוש Production לפי policy שלנו.

‏**לא להתבלבל עם:** “כתוב בתיעוד שה־feature קיימת”.

‏**המשך:** `09`, `09B`.

## ‏`SHADOW_ONLY`

‏**במילים פשוטות:** מותר למנוע לחשב מה Candidate הייתה עושה ולמדוד אותה, אבל אסור לה לתת live side effect.

‏**קנוני:** Candidate rollout state, נפרד מ־Capability enablement.

‏**המשך:** `09B`.

## ‏`LIVE_ENABLED`

‏**במילים פשוטות:** policy של המנוע מאפשרת Candidate במסלול חי — אבל זה עדיין לא מספיק בלי Capability requirements ב־`PRODUCTION_ENABLED`.

‏**המשך:** `09B`.

---

# ‏I — Labels של Evidence

## ‏`FACT`

‏עובדה תיעודית/מאומתת ב־scope שמצוין.

## ‏`ENGINE RULE`

‏כלל שאנחנו בוחרים לאכוף במערכת, גם אם אינו Broker fact.

## ‏`RESEARCH HYPOTHESIS`

‏השערה שצריך למדוד לפני שמקבלים אותה כיתרון execution.

## ‏`ACCEPTANCE TEST REQUIRED`

‏פרט שאין לנעול כהנחה עד שבדקנו את behavior במסלול המדויק שלנו.

‏**המשך:** `00A`, `09`.

---

## ‏00C.2 מפת “אל תבלבל בין”

| ‏מונח א' | ‏מונח ב' | ‏ההבדל הקצר |
|---|---|---|
| `Execution Mode` | `Broker Primitive` | ‏Intent execution מול הוראת Broker בסיסית |
| `Behavior Candidate` | `Concrete Order Plan` | ‏חלופה להשוואה מול materialization סופי |
| `IOC` | `signal_ttl` | ‏Broker fill/time policy מול חיי Signal |
| `Post Only` | `Passive Join` | ‏constraint מול placement behavior |
| `SMART` | `Adaptive` | ‏Routing Policy מול Broker Algo |
| `Broker-Resident` | `Broker-Simulated` | ‏איפה state חי מול מי מסנתז semantics |
| `Broker-Managed` | `Broker-Resident` | ‏מי מנהל behavior מול איפה state נמצא |
| `Venue-Native` | `PRODUCTION_ENABLED` | ‏Venue semantics מול authorization אצלנו |
| `NO_FILL` | `REJECT` | ‏attempt תקף ללא Fill מול Order שלא התקבלה כמתוכנן |
| `Partial Fill` | `NO_FILL` | ‏Position השתנתה מול Position שלא השתנתה מן attempt |
| `Cancel Requested` | `Cancelled` | ‏בקשה מול evidence terminal |
| `Connected` | `READY` | ‏חיבור transport מול state בטוח לפעולה |
| `Execution Quality` | `Trade Outcome` | ‏איכות הביצוע מול מה שקרה כלכלית אחר כך |
| `Bracket` | atomic transaction | ‏מבנה מתואם של Orders מול guarantee שאינה קיימת |

---

## ‏00C.3 Cross-Reference rule

‏כאשר Chapter משתמש לראשונה במונח שקשה להבין בלי prerequisite, מפנים אל אחד מארבעת סוגי המקור:

```text
definition / vocabulary → 00A or 00C
prerequisite / ownership → 00D
family semantics        → Parts 2–7
lifecycle / safety      → Parts 8–9
engine decision         → Parts 10A–10I
```

‏המטרה היא למנוע מצב שבו המתחיל נשלח לחפש הסבר בתוך Review, Audit או מסמך עבודה שאינו חלק מן הקורס.

---

## ‏00C.4 היררכיית מקור האמת

‏ה־Glossary נועד ל־quick lookup ולהסבר beginner-first. הוא אינו יוצר הגדרה מקבילה כאשר כבר קיים contract קנוני.

```text
00A
→ canonical taxonomy / clocks / price boundary / cancel / partial-fill vocabulary

00C
→ short beginner-first explanation

family chapters
→ family-specific semantics and trade-offs

08–09
→ lifecycle / failure / capability contracts

10A–10I
→ decision / engine / practitioner application
```

‏כאשר אין consequence ייחודי למשפחה מסוימת, מפנים להגדרה הקנונית במקום להגדיר מחדש את אותו מושג.

# ‏00D — Prerequisites, Cross-References & Ownership Map

> ‏מטרת הפרק: לתת לקורא מפה אחת פשוטה של **מה צריך לדעת לפני כל חלק**, **לאן ממשיכים אחריו**, ו־**מי באמת מחזיק ומנהל את הפקודה לאחר Submit**. זהו פרק ניווט והבהרה; הוא אינו מוסיף Order Type חדשה.

---

# ‏00D.1 איך להשתמש בפרק הזה

‏אם אתה קורא את הקורס ברצף, אפשר להשתמש בפרק הזה כ־Checklist קצר לפני כל חלק.

‏אם קפצת ישר מ־`00B` לבעיה מסוימת, השתמש בטבלאות כדי לראות מה כדאי לקרוא קודם ומהו ה־follow-up המקצועי הנכון.

‏הכלל הוא:

```text
בעיה
→ prerequisite מינימלי
→ family chapter
→ comparison / failure chapter
→ engine mapping
```

‏אין צורך לקרוא את כל הקורס מחדש בכל פעם.

---

# ‏00D.2 Prerequisites לפי חלק

| חלק | מה צריך להבין קודם | אם חסר — קרא קודם | אחר כך כדאי להמשיך אל |
|---|---|---|---|
| `01` Order Language | ‏רק `Bid / Ask / Spread / Fill` בסיסיים | `00B` | `02`, `03` |
| `02` Core Execution | ‏Market מול Limit, Fill בסיסי | `01` | `02A`, `02B`, `03` |
| `02A/02B` Aggressive / Sweep / MTL | ‏Limit, marketability, partial fill | `02` | `09C`, `10F` |
| `03` Time / Fill Policy | ‏Order primitive בסיסית | `01`, `02` | `08`, `09C` |
| `04/04A/04B` Liquidity / Display | ‏Passive מול aggressive, queue בסיסית | `02` | `08A`, `10G`, `10H` |
| `05/05A` Pegged / Midpoint / Snap | ‏Limit, reference price, price bound | `02`, `04` | `07`, `08B`, `10F` |
| `06/06A/06B/06C` Trigger / Protection / Composite | ‏Position, trigger, partial fill | `01`, `02`, `03` | `08C`, `10C` |
| `07/07A` Routing / Broker Algos | ‏Primitive מול attribute מול route | `00A`, `02` | `09`, `09B` |
| `08/08A` Cancel / Replace | ‏Order lifecycle ו־working state | `01`, `03` | `08B`, `09C` |
| `08B/08C/08D` Safety / Recovery | ‏Cancel state, ownership, Position truth | `08`, `00D.4` | `09C`, `10C`, `10D` |
| `09/09B` Capability / Materialization | ‏Mode, Candidate, Primitive, Route | `00A`, `00C` | `10A`, `10B`, `10C` |
| `09C` Outcome Contracts | ‏Fill / Partial / Reject / Unknown | `08`, `00C` | `10E`, `10G` |
| `10A` Decision Gates | ‏כל שכבות ה־context | `00A`, `09B` | `10B`, `10C` |
| `10B` Entry | ‏Candidates + Capability | `09B`, `10A` | `10E`, `10F` |
| `10C` Exit / Protection | ‏Position truth + ownership | `08C`, `08D`, `10A` | `10E`, `10D` |
| `10D` Full Engine | ‏Entry, Exit, Recovery, Outcome | `10A`, `10B`, `10C`, `09C` | `10G–10I` |
| `10G–10I` Practitioner Judgment | ‏Semantics של המשפחה הרלוונטית | family chapter | חזרה ל־family עם judgment מקצועי |

---

# ‏00D.3 Cross-Reference Rules — איך מפנים בין פרקים

‏הקורס משתמש בארבעה סוגי הפניות. כדאי להבין מה כל אחת אומרת:

```text
PREREQUISITE
→ read this first if the concept is unfamiliar

SEE ALSO
→ related concept; useful but not required

FAILURE / SAFETY
→ read this before relying on the behavior in production

ENGINE MAPPING
→ how the concept becomes a Candidate / Plan / Capability requirement
```

‏דוגמה:

```text
MIDPRICE
PREREQUISITE → 02, 05
SEE ALSO → 05A, 07
FAILURE / SAFETY → 08B, 09C
ENGINE MAPPING → 09B, 10B
```

‏כך cross-reference אינה “עוד לינק”, אלא אומרת **למה** כדאי לעבור לפרק אחר.

---

# ‏00D.4 חמש מילים דומות — אבל הן עונות על שאלות שונות

‏זהו אחד המקומות שהכי קל למתחיל להתבלבל בהם:

```text
venue-native
broker-resident
broker-simulated
broker-managed
client-managed
```

‏במילים פשוטות, צריך לשאול **שלוש שאלות שונות**.

## ‏שאלה 1 — איפה ה־state ממשיך לחיות?

```text
client
broker
venue
```

‏זהו ציר ה־**residency**.

### ‏`broker-resident`

‏ה־Order/state נמצאים אצל הברוקר כך שהם יכולים להמשיך להתקיים בלי שה־process המקומי יהיה מחובר.

‏זה **לא** אומר שה־Venue מבינה את ה־semantics בעצמה.

### ‏`local-only / untransmitted`

‏ה־state קיימת רק מקומית או עדיין לא הועברה לבעלות remote execution path.

‏ולכן:

```text
UNTRANSMITTED != PROTECTED
```

---

## ‏שאלה 2 — מי מחשב את ההתנהגות?

‏למשל מי מחליט מתי Trigger מתקיים או לאיזה מחיר Reprice.

```text
client-managed
broker-managed
venue-managed
```

### ‏`client-managed`

‏המנוע המקומי מחשב ומחליט את הפעולה הבאה.

### ‏`broker-managed`

‏הברוקר מנהל tactic/algorithm/repricing מסוים לאחר שקיבל boundaries ו־parameters.

‏אבל:

```text
broker execution objective
!=
private strategy objective
```

‏Signal validity, ‏Risk, ‏TTL ו־economic boundaries נשארים אחריות המערכת שלנו אלא אם contract אחר הוגדר במפורש.

---

## ‏שאלה 3 — מי מכיר את ה־semantics המקוריים?

### ‏`venue-native`

‏ה־Venue עצמה מכירה ומבצעת את ה־semantics.

### ‏`broker-simulated`

‏הברוקר מדמה behavior שאינה בהכרח native אצל ה־Venue, למשל באמצעות monitoring/triggering/routing בצד הברוקר.

‏חשוב:

```text
broker-simulated
can also be
broker-resident
```

‏אין כאן סתירה: מונח אחד מתאר **מי מסמלץ את ההתנהגות**, והשני מתאר **איפה ה־state חיה**.

---

# ‏00D.5 Canonical Ownership Card

‏בכל Advanced Order משמעותית נרצה להיות מסוגלים למלא את הכרטיס הבא:

```text
Behavior / Family:

State residency:
  CLIENT | BROKER | VENUE | UNKNOWN

Behavior evaluator:
  CLIENT | BROKER | VENUE | MIXED | UNKNOWN

Native semantics:
  VENUE_NATIVE | BROKER_SIMULATED | CLIENT_SYNTHESIZED | UNKNOWN

Can remain executable after local disconnect?
  YES | NO | UNKNOWN

Can local intent expire while remote order remains executable?
  YES | NO | UNKNOWN

What must be reconciled before new side effects?
  orders / executions / position / protection / ownership
```

> ‏`ENGINE RULE` — אם אחד השדות המהותיים אינו מוכח ב־Capability scope הנוכחי, משתמשים ב־`UNKNOWN`; לא ממלאים אותו לפי שם ה־Order בלבד.

---

# ‏00D.6 Cross-Reference Map לפי משפחה

| Family | Learn First | Decision / Comparison | Failure / Safety | Engine Mapping |
|---|---|---|---|---|
| Marketable / IOC / Sweep / MTL | `02`, `03` | `02B`, `10F` | `09C` | `09B`, `10B` |
| Post Only / Hidden / Reserve / Discretionary | `04`, `04A` | `04B`, `10H`, `10I` | `08B` | `09B` |
| Relative / Pegged / Midpoint / Snap | `05` | `05A`, `10F` | `08B`, `09C` | `09B`, `10B` |
| Stops / MIT / LIT / Trailing | `06`, `06A` | `06B`, `10H` | `08B`, `08D` | `10C` |
| Bracket / OCA / Conditional | `06`, `06C` | `10F` | `08C`, `08D` | `10C` |
| SMART / Direct / Broker Algo | `07` | `07A`, `10H` | `08B`, `09` | `09B` |
| Modify / Cancel+New | `08` | `08A`, `10H` | `08B`, `09C` | `10D` |
| Recovery / Ownership | `08B`, `08C` | `08D` | `08D` | `10C`, `10D` |

---

# ‏00D.7 Beginner Check — האם אני מבין לפני שאני ממשיך?

‏לפני מעבר לפרקים המאוד מתקדמים, מספיק שתוכל לענות במילים שלך על חמש שאלות:

1. ‏מה ההבדל בין “מה אני רוצה להשיג” לבין “איזו פקודה הברוקר מקבל”?
2. ‏למה `IOC` יכולה להיות תכונה של Limit ולא Order Type מתחרה בה?
3. ‏למה `broker-resident` אינה אומרת בהכרח `venue-native`?
4. ‏למה Cancel שנשלח עדיין לא מוכיח שה־Order אינה יכולה לבצע?
5. ‏למה Order יכולה להמשיך להיות חוקית אצל Broker גם אחרי שה־Signal המקומי כבר פג?

‏אם אחת מהתשובות לא ברורה, חוזרים ל־`00B`, ‏`00C` או לפרק prerequisite המתאים. אין צורך לזכור terminology מושלם — המטרה היא להבין את הבעיה בעולם האמיתי.

---

# ‏00D.8 Define Once → Cross-reference → Extend Only When Needed

‏כדי לשמור את הקורס קצר יותר וברור יותר, Concepts שחוזרים בהרבה families אינם מקבלים הגדרה מלאה מחדש בכל פרק.

| Concept | מקור קנוני | איך להשתמש בהמשך |
|---|---|---|
| `signal_ttl / application_order_ttl / broker_tif / working_order_age` | `00A.13` | ‏להוסיף רק consequence ייחודי למשפחה |
| `Economic Price Boundary` / hard cap | `00A.14` | ‏להראות רק איך Candidate מסוימת materializes או נכשלת מול הגבול |
| Cancel / broker truth | `00A.15`, `08` | ‏להוסיף race/late-effect ייחודי בלבד |
| Partial Fill | `00A.16` | ‏להוסיף economics / protection / lifecycle ייחודיים בלבד |
| ownership / residency / native semantics | `00D.4–00D.5` | ‏למלא את ה־Ownership Card, לא להמציא synonym חדש |
| Capability / Production enablement | `00A.17`, `09`, `09B` | ‏להוסיף רק scope/evidence ספציפיים |

‏כלל העריכה הקנוני:

```text
DEFINE ONCE
→ CROSS-REFERENCE
→ EXTEND ONLY WHEN THE FAMILY CHANGES THE CONSEQUENCE
```

‏חזרה קצרה לצורך הוראה למתחיל מותרת; חזרה של contract שלם ללא consequence חדש אינה נדרשת.

# ‏חלק 1 — השפה המקצועית של פקודה

> ‏הגדרות ה־taxonomy וה־vocabulary הקנוניות של הקורס נמצאות ב־`00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md`. חלק זה מלמד את המודל; כאשר מונח נראה רחב מדי, `00A` קובע את שכבת ה־abstraction המדויקת שלו.

## ‏1.1 פקודה אינה `BUY` או `SELL`

‏פקודת מסחר מקצועית היא חוזה ביצוע קטן. כאשר המנוע שולח Order הוא אינו אומר רק "קנה"; הוא מגדיר סט של אילוצים והעדפות לגבי מחיר, זמן, כמות, Routing והתנהגות במקרה שהשוק אינו נותן בדיוק את מה שרצינו.

‏אפשר לחשוב עליה כך:

```text
Order =
    Instrument
  + Side
  + Quantity
  + Price policy
  + Time policy
  + Fill policy
  + Display policy
  + Routing policy
  + Trigger / dependency policy
  + Session policy
  + Failure / cancel policy
```

‏אם אחד מהחלקים האלה נשאר לא מוגדר, בפועל נתנו לברוקר או ל־Venue לקבל החלטה במקומנו.

### ‏דוגמה

‏שתי הפקודות הבאות הן שתיהן `BUY 100`, אבל ההתנהגות שלהן שונה כמעט לחלוטין:

```text
A:
BUY 100
LIMIT 50.00
DAY
SMART
```

```text
B:
BUY 100
LIMIT 50.05
IOC
DIRECT
```

‏`A` יכולה לנוח ב־Book, לצבור גיל ותור, להתבצע בחלקים ולהישאר חיה זמן רב יחסית.

‏`B` אומרת למעשה: נסה לקחת עכשיו נזילות שניתנת לביצוע עד מחיר 50.05, ומה שלא בוצע מייד — אל תשאיר מאחור.

‏מבחינת מנוע מומנטום קצר, ההבדל הזה הוא לעיתים חשוב יותר מההבדל בין שני Signals.

---

## ‏1.2 שלוש שכבות שצריך להפריד: Strategy, Execution Policy, Order

‏טעות ארכיטקטונית נפוצה היא שה־Strategy עצמה מחליטה ישירות:

```text
BUY MARKET
```

‏עדיף להפריד:

```text
Strategy
    ↓
Intent
    ↓
Execution Policy
    ↓
Concrete Order
```

### ‏`Strategy`

‏אומרת:

> ‏"מצאתי הזדמנות שבה אני רוצה להיות Long עכשיו."

### ‏`Intent`

‏מתאר את מטרת העסקה:

```text
side = BUY
max_position = 100 shares
signal_expiry = 4.0 sec
expected_edge = 0.18%
urgency = high
```

### ‏`Execution Policy`

‏מתרגמת את המטרה להתנהגות:

```text
Do not pay more than X
Try immediate liquidity first
Accept partial fill above Y shares
Do not leave remainder after signal expiry
Cancel if quote deteriorates
```

### ‏`Concrete Order`

‏רק כאן מתקבלת למשל החלטה:

```text
BUY 100
LMT 50.03
IOC
SMART
```

‏ההפרדה הזאת קריטית אצלנו משום שאותו Signal יכול להצדיק Order שונה לפי Spread, ‏Depth, ‏volatility, ‏time-to-expiry והאם אנחנו נכנסים לפוזיציה או כבר מנסים לצאת ממנה.

‏ב־taxonomy הקנונית יש עוד שכבה באמצע שכדאי לזכור:

```text
Trade Intent
→ Application Execution Mode
→ Behavior Candidate
→ Concrete Broker Order
```

‏כך `PASSIVE` או `FAST_EXIT` אינן מתחרות בשם עם `Limit`, ‏`IOC`, ‏`SMART` או `Adaptive`; הן נמצאות בשכבות שונות.

---

## ‏1.3 `Order Type` אינו מספר לנו את כל הסיפור

‏כאשר כתוב `Limit`, עדיין איננו יודעים:

- ‏האם היא Passive או Marketable.
- ‏האם היא `DAY`, ‏`IOC` או `GTC`.
- ‏האם היא Routed דרך `SMART` או ישירות ל־Venue.
- ‏האם היא גלויה במלואה.
- ‏האם יש לה parent/child relationship.
- ‏האם היא מותנית ב־Trigger.
- ‏האם הברוקר שולח אותה Native או מדמה חלק מההתנהגות.
- ‏כמה זמן המנוע עצמו מוכן להשאיר אותה בחיים.

‏לכן במנוע שלנו אסור להשתמש ב־`order_type` בתור תיאור מלא של execution behavior.

> ‏`ENGINE RULE` — בקורס הזה `Marketable Limit` אינה Broker primitive נפרדת. היא `Limit` שמחירה marketable מול snapshot השוק הנוכחי. ‏`MARKETABLE_LIMIT_IOC` הוא Behavior Candidate קונקרטי יותר שמשלב Limit marketable עם `IOC`.

‏עדיף לחשוב על אובייקט עשיר יותר:

```text
ExecutionInstruction {
  side
  quantity
  order_type
  limit_price
  stop_price
  tif
  route
  display_size
  allow_partial
  minimum_useful_fill
  signal_expiry
  application_ttl
  chase_policy
  cancel_policy
  parent_id
  oca_group
}
```

‏השמות המדויקים בקוד יכולים להיות שונים; העיקר הוא שהמשמעות תהיה מפורשת ושלא נכניס Primitive, Attribute, Routing ו־Application Mode לאותו enum.

---

# ‏1.4 איפה ה־state חי, מי מנהל אותו, ומה Native

‏ה־taxonomy הקנונית מפרידה שלושה צירים שקל לערבב ביניהם:

```text
WHERE STATE LIVES
WHO EVALUATES / REPRICES / TRIGGERS
WHERE THE FINAL INSTRUCTION IS NATIVE
```

‏לכן המונחים הבאים אינם synonyms.

## ‏`Venue-Native`

‏ה־Venue עצמו מכיר את סוג הפקודה או את התכונה שלה ומנהל אותה בתוך ה־matching infrastructure שלו.

‏לדוגמה עקרונית, אם Venue תומך בפקודה מסוימת Native, הברוקר שולח אליו הוראה שה־Venue יודע לנהל.

### ‏למה זה טוב?

- ‏פחות תלות בלוגיקה מקומית של ה־Broker עבור אותה semantics.
- ‏לעיתים reaction מהיר יותר לשינויי Market State.
- ‏הסמנטיקה יכולה להיות מוגדרת היטב על ידי ה־Venue.

### ‏מה הבעיה?

- ‏לא כל Venue תומך באותו דבר.
- ‏אותו שם מסחרי יכול להתנהג אחרת בין Venues.
- ‏Direct Routing עשוי להיות דרוש.

## ‏`Broker-Managed / Broker-Simulated`

‏הברוקר מחזיק או מפעיל חלק מהלוגיקה ומגיש/משנה Orders או triggers לפי semantics שהוא מספק.

‏`Broker-Simulated` מתאר **איך ההתנהגות מיושמת**; הוא אינו אומר בהכרח אם instruction היא או אינה resident אצל הברוקר לאורך זמן.

‏זה לא אומר שהפקודה "לא אמיתית". זה אומר שמי שמחזיק חלק מן ה־state machine או evaluation logic הוא הברוקר ולא בהכרח ה־Exchange.

### ‏למה זה חשוב לנו?

‏כאשר Signal חי רק שניות, צריך להבין:

```text
Where is the state?
Who evaluates or reprices it?
What market data drives it?
When does it reprice or trigger?
What happens during disconnects?
What happens outside supported sessions?
Can the behavior differ by destination?
```

## ‏`Broker-Resident`

‏זהו dimension נפרד: האם instruction יכולה להישאר חיה אצל הברוקר גם אם ה־process המקומי שלנו נעלם.

‏לכן ייתכן concept שהוא:

```text
broker-resident
+
broker-simulated
```

‏ואין להסיק מ־`resident` שהוא Venue-native.

## ‏`Client-Managed`

‏המנוע שלנו עצמו מחזיק את הלוגיקה.

‏למשל:

```text
place passive limit
wait 300 ms
if not filled and signal still valid:
    cancel
    wait for cancel/fill reconciliation
    submit more aggressive limit
```

‏כאן אנחנו מקבלים שליטה מקסימלית, אבל גם אחריות מקסימלית.

‏צריך לטפל ב־latency, ‏late fills, ‏duplicate events, ‏reconnects, ‏race conditions ו־state recovery.

### ‏כלל עבודה

> ‏לפני שמכניסים Advanced Order למנוע, צריך לדעת לפחות: **איפה ה־state חי, מי מנהל את ההתנהגות, ומה ממשיך לחיות אם ה־client נעלם**.

---

# ‏1.5 פקודה היא State Machine, לא קריאת פונקציה

‏מבחינת קוד קל לחשוב:

```text
placeOrder()
```

‏ואז:

```text
cancelOrder()
```

‏אבל מבחינת מערכת מסחר חיה, Order עוברת מצבים ואירועים אסינכרוניים.

‏מודל מפושט:

```text
CREATED
  ↓
SUBMIT_REQUESTED
  ↓
ACKNOWLEDGED / WORKING
  ↓
PARTIALLY_FILLED ───────────────┐
  ↓                             │
FILLED                          │
                                │
WORKING → CANCEL_REQUESTED      │
               ↓                │
          CANCELLED             │
               │                │
               └── but a late fill may have crossed in flight
```

‏במציאות יש עוד מצבים: Validation, ‏Held, ‏PendingSubmit, ‏Inactive, ‏Rejected, ‏PendingCancel ועוד, והשם המדויק תלוי API/Broker.

> ‏`ENGINE RULE` — `CANCEL_REQUESTED != CANCEL_CONFIRMED != TERMINAL_NON_EXECUTABLE`.

‏כלומר `cancel requested` אינו שווה ל־`cancel confirmed`, וגם `cancel confirmed` צריך להיות מפורש לפי ה־evidence וה־state model של ה־adapter; אסור להסיק רק מה־intent המקומי שאי אפשר יותר לקבל Fill.

---

## ‏1.6 ה־Race החשוב ביותר: Fill מול Cancel

‏נניח:

```text
12:00:00.000  order is working
12:00:00.120  our signal weakens
12:00:00.121  engine sends cancel
12:00:00.123  venue matches the order
12:00:00.127  broker processes cancel request
12:00:00.130  fill event reaches us
```

‏אם המנוע מניח שברגע שקראנו `cancelOrder()` הפקודה נעלמה, הוא יכול לשלוח Order חלופית ולהגיע לפוזיציה כפולה.

‏לכן State נכון צריך להפריד לפחות:

```text
local cancel intent
broker cancel acknowledgement
terminal order evidence
executed quantity
remaining quantity
position quantity
```

‏זה אינו edge case תיאורטי. במנוע מהיר זו אחת מנקודות הכשל המרכזיות שצריך לתכנן לפני Live.

‏מכאן ואילך פרקים מאוחרים משתמשים ב־Cancel invariant הזה כהגדרה קנונית ואינם אמורים להגדיר מחדש מהו Cancel בכל פעם.

---

# ‏1.7 Partial Fill הוא מצב רגיל, לא תקלה

‏הגדרה קנונית:

```text
0 < cumulative_filled_qty < requested_qty
```

‏Partial Fill אינה Error ואינה "Order שלא הצליחה". היא Execution fact שמשנה את ה־Position, את ה־remaining intent ואת ה־risk.

‏נניח שרצינו 100 מניות וקיבלנו:

```text
37 filled
63 remaining
```

‏מכאן יש כמה מדיניות אפשריות:

1. ‏לקבל את ה־37 ולבטל את השאר.
2. ‏להמשיך להמתין על ה־63.
3. ‏לבטל ולהגיש מחדש את ה־63 בצורה אגרסיבית יותר.
4. ‏להחליט ש־37 קטן מדי ולכן לצאת מהפוזיציה.
5. ‏להתאים את Exit לגודל שבוצע בפועל בלבד.

‏אין תשובה אוניברסלית.

‏אצלנו השאלות יהיו:

```text
How much signal life remains?
Is 37 shares economically meaningful after commissions/costs?
Did the partial fill occur because liquidity disappeared?
Did the fill itself indicate adverse selection?
Can the remaining quantity still enter without destroying net edge?
```

‏לכן `minimum useful fill` צריך להיות חלק מה־Execution Policy ולא תגובת חירום מאוחרת.

‏הפרקים המאוחרים מרחיבים את אותה הגדרה לפי context במקום להגדיר תופעה חדשה:

```text
Part 2  -> economic meaning
Part 3  -> IOC/FOK fill semantics
Part 6  -> parent/child and protection consequences
Part 8  -> execution-state truth
Part 10 -> fresh decision after each partial fill
```

---

# ‏1.8 מחיר טוב ללא Fill אינו בהכרח ביצוע טוב

‏פקודה Passive יכולה להיראות מצוין:

```text
Bid = 50.00
Ask = 50.02
we join Bid at 50.00
```

‏אם המחיר מיד עולה ל־50.10 ואיננו מתבצעים, "חסכנו" שני סנטים אבל הפסדנו את כל ההזדמנות.

‏לעומת זאת, פקודה אגרסיבית ב־50.02 שילמה Spread אבל אולי תפסה את המהלך.

‏לכן איכות Execution אינה:

```text
lowest entry price
```

‏אלא משהו קרוב יותר ל־:

```text
expected realized net edge
=
probability of fill
× value if filled
- spread/slippage
- adverse selection
- missed-opportunity cost
- fees
- exit cost
```

‏זו הסיבה שהמסמך הזה יבחן כל Order Type דרך השאלה **איזה trade-off הוא משנה**, ולא רק דרך ההגדרה הטכנית שלו.

---

# ‏1.9 Queue position היא נכס — אבל נכס מתכלה

‏כאשר אנחנו מצטרפים ל־Bid או ל־Ask, ייתכן שיש לפנינו Orders אחרות.

‏במודל Price-Time Priority טיפוסי:

```text
better price wins first
then earlier order at same price wins first
```

‏לכן אם אנחנו מבטלים ומגישים מחדש באותו מחיר, אנו עלולים לאבד מקום בתור.

‏אבל אצלנו יש קונפליקט:

```text
queue priority
vs
signal freshness
```

‏פקודה בתור מצוין שאין מאחוריה יותר Edge אינה נכס. היא סיכון.

‏ב־holding horizon של שניות, לעיתים עדיף לאבד Queue Position מאשר להישאר עם Order שהסיבה לקיומה כבר נעלמה.

---

# ‏1.10 ארבעה שעונים שאסור לערבב

‏`TIF` הוא רק אחד מכמה clocks שונים.

‏ה־vocabulary הקנוני הוא:

```text
broker_tif
signal_ttl
application_order_ttl
working_order_age
```

### ‏`broker_tif`

‏כמה זמן Broker/Venue רשאים להשאיר את הפקודה חיה לפי הוראת הזמן שלה, למשל `DAY`, ‏`GTC` או `IOC`.

### ‏`signal_ttl`

‏כמה זמן ה־Trade Intent או Signal עדיין נחשבים תקפים מבחינת Strategy.

### ‏`application_order_ttl`

‏כמה זמן האפליקציה שלנו מוכנה להשאיר את ה־Order/attempt המסוים בחיים לפני cancel/re-decision.

### ‏`working_order_age`

‏כמה זמן ה־Order הקונקרטית כבר חיה ועובדת בפועל.

‏לדוגמה:

```text
broker_tif = DAY
signal_ttl = 1800 ms
application_order_ttl = 750 ms
working_order_age = 420 ms
```

‏אין סתירה: כל clock עונה על שאלה אחרת.

> ‏`ENGINE RULE` — כאשר הקורס אומר `TTL`, יש לציין איזה TTL. ‏`TTL` ללא qualifier אינה vocabulary קנונית.

---

# ‏1.11 Support הוא רב־ממדי

‏השאלה "האם IBKR תומך בפקודה X?" אינה מספיק מדויקת.

‏צריך לשאול לפחות:

```text
Which product?
Which region?
Which venue?
SMART or direct?
Which trading session?
Which IBKR platform?
Which API?
Which account permissions?
Native or simulated?
```

‏לדוגמה, IBKR מתעדת Order Types שבהם מצוין במפורש `TWS Only`, אחרים זמינים גם ב־`IBKR Desktop`, ‏`Mobile` או `Client Portal`, וחלקם דורשים Direct Routing במקום `SMART`.

‏אבל גם תשובה מלאה לשאלות האלה אומרת רק מה **מתועד או זמין**, לא בהכרח מה מותר למנוע שלנו ב־Production.

‏לכן הקורס משתמש ב־Capability/Enablement progression הקנונית:

```text
DOC_ONLY
RUNTIME_CONFIRMED
PAPER_ACCEPTED
LIVE_SMALL_ACCEPTED
PRODUCTION_ENABLED
```

‏רק `PRODUCTION_ENABLED` היא הרשאה של המערכת להשתמש ב־capability ב־Production.

---

# ‏1.12 איך המנוע יכול לבדוק תמיכה במקום לנחש

‏`IBKR TWS API` מספק ב־`ContractDetails` שדה בשם:

```text
orderTypes
```

‏שמתאר את סוגי הפקודות הנתמכים עבור אותו Contract, ולצדו:

```text
validExchanges
```

‏לכן עיקרון הנדסי טוב הוא:

```text
documented capability knowledge
+ runtime contract capability discovery
+ acceptance evidence
+ broker rejection handling
```

‏ולא:

```text
hard-code once and assume forever
```

‏זה חשוב במיוחד כאשר אנחנו סורקים אלפי מניות ורוצים שה־Execution Engine יהיה robust לשינויים במוצר, Venue או Broker configuration.

> ‏`ENGINE RULE` — Capability discovery מסננת מה אפשר לשקול; היא אינה בוחרת את Execution Behavior המנצחת ואינה הופכת feature אוטומטית ל־`PRODUCTION_ENABLED`.

---

# ‏1.13 עובדות `IBKR` שאומתו למסגרת הקורס

> ‏אימות אחרון: `2026-10-27`. אלה עובדות תיעוד כלליות של IBKR; לפני Live נבדוק גם את החשבון, המוצר וה־routing בפועל.

### ‏`FACT` — `TWS API` חושף Order Object עשיר

‏ה־API כולל בין היתר `orderType`, ‏`lmtPrice`, ‏`auxPrice`, ‏`tif`, ‏`displaySize`, ‏`allOrNone`, ‏parent relationships ושדות מתקדמים נוספים. כלומר ה־API אינו מוגבל ל־Market/Limit בסיסיות.

### ‏`FACT` — IBKR מפרידה בין פקודות דומות לפי Routing

‏לדוגמה, התיעוד הנוכחי של `Pegged-to-Midpoint` מציין שלפקודות מניות אמריקאיות נדרש Direct Routing, בעוד `MidPrice` מתועד כ־IBKR Algo עם `SMART` routing. לכן שני שמות שנשמעים דומים יכולים לעבור execution path שונה לגמרי.

### ‏`FACT` — לא כל Order Type מופיע בכל UI

‏לדוגמה, `Iceberg / Reserve` מתועד כיום כ־`TWS Only`, בעוד `MidPrice` מתועד ב־`TWS`, ‏`IBKR Desktop`, ‏`IBKR Mobile` ו־`Client Portal`.

### ‏`FACT` — OCA אינה מבטיחה ביטול אטומי בבורסה

‏IBKR מציינת במפורש שאין הבטחה שבקשת Cancel/Modify של OCA תגיע ל־Exchange לפני Order שכבר מתבצעת. זה בדיוק סוג ה־race שמנוע מקומי חייב לדעת להתמודד איתו.

---

# ‏1.14 המשמעות הישירה למנוע שלנו

‏לפני שנדון בשמות המתקדמים, כבר אפשר לקבוע כמה עקרונות הנדסיים:

1. ‏ה־Strategy לא תשלח Broker Order ישירות; היא תיצור `Trade Intent`.
2. ‏שכבת Execution נפרדת תבחר `Application Execution Mode`, אחר כך Behavior Candidate, ורק לבסוף Concrete Broker Order.
3. ‏כל Order תחזיק `Economic Price Bound` מפורש כאשר הדבר מתאים; ה־broker limit price הוא materialization של הגבול, לא המושג עצמו.
4. ‏Partial Fill יהיה first-class execution state.
5. ‏Cancel יהיה תהליך אסינכרוני הנשען על evidence, לא Boolean.
6. ‏ה־Position יחושב מ־Fills בפועל, לא מ־requested quantity.
7. ‏Capability תיבדק לפי Contract/Route/Adapter/Session וגם לפי enablement state, לא רק לפי תיעוד סטטי.
8. ‏פקודה שלא מתאימה יותר ל־Signal תבוטל גם אם יש לה Queue Position טוב.
9. ‏לא נבחר Primitive, Attribute או Algo לפי השם המרשים ביותר; נבחר Behavior לפי הבעיה שהוא פותר ואז נממש אותו בשכבות הנכונות.
10. ‏כל Advanced Order שתיכנס למנוע תצטרך להראות שיפור ב־`net executable edge` או ב־safety/reliability הרלוונטיים, לא רק Fill Price יפה יותר.

---

# ‏1.15 שאלות מקצועיות שחייבות לקבל תשובה לפני Live

‏בסיום המיני־קורס נוכל לענות באופן מדויק על כל אחת מהשאלות הבאות:

- ‏מתי Limit שהיא marketable עדיפה על `Market`, ומתי לבחור Behavior של `MARKETABLE_LIMIT_IOC`?
- ‏מתי `IOC` עדיפה על Limit קצרה שאנחנו מבטלים בעצמנו?
- ‏מה ההבדל המעשי בין `IOC`, ‏`FOK`, ‏`AON` ו־Minimum Quantity?
- ‏מתי `Post Only` עוזרת ומתי היא גורמת לנו לפספס מומנטום?
- ‏האם Midpoint execution אמיתי מתאים לסיגנל שחי שניות?
- ‏מה ההבדל בין `MidPrice`, ‏`Pegged-to-Midpoint` ו־`Snap to Midpoint` ב־IBKR?
- ‏מתי כדאי להשתמש ב־`Reserve/Iceberg` גם אם הכמות שלנו אינה מוסדית?
- ‏מה `Hidden` עושה ל־queue ול־fill probability?
- ‏איזו התנהגות שומרת מחיר אבל לא משאירה stale remainder?
- ‏מתי כדאי לנהל repricing/chase בעצמנו ומתי לתת ל־Broker Algo לעשות זאת?
- ‏איך מתכננים Exit כאשר Entry התמלאה חלקית?
- ‏איך מונעים parent/child race ב־Bracket Orders?
- ‏מה קורה בזמן reconnect כאשר Order עדיין חיה אצל Broker?
- ‏איך המנוע יודע מה מתועד, מה זמין runtime ומה באמת `PRODUCTION_ENABLED` במניה/Route מסוימים?
- ‏איזה `Application Execution Mode` מתאים ל־Entry פסיבית, Entry אגרסיבית תחומה, `FAST_EXIT` או `EMERGENCY_REDUCE`, ואיזה Broker Order מממש אותו בפועל?

---

# ‏מקורות רשמיים למסגרת חלק 1

‏הקישורים הבאים הם מקורות רשמיים של Interactive Brokers ונבדקו בעת כתיבת החלק הזה:

- ‏IBKR API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR API — `ContractDetails` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/contract-details>
- ‏IBKR API — placing orders introduction: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/place-order/introduction>
- ‏IBKR General/API order types introduction: <https://www.interactivebrokers.com/docs/general/order-types/introduction>
- ‏IBKR Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>

---

# ‏Checkpoint — סוף חלק 1

‏בשלב הזה בנינו את המודל שעליו כל שאר הפקודות יישבו: Order כ־Execution Contract וכ־State Machine, ההפרדה בין Trade Intent, ‏Application Execution Mode, ‏Behavior Candidate ו־Concrete Broker Order, ההבחנה בין Venue-native / broker-managed / broker-resident / client-managed, והמשמעות הקנונית של Fill, Cancel, Partial Fill, clocks ו־Capability Enablement.

‏החלק הבא ירד לעומק של **`Market`, ‏`Limit`, ‏marketable Limit, ‏Passive Limit ו־price bounds** — לא כהגדרות בסיסיות שכבר למדנו, אלא ברמת execution mechanics: מה קורה מול ה־Book, אילו failure modes יש, איך מודדים slippage ו־fill quality, ומה צריך להיות ה־baseline למנוע מומנטום שמנסה להיכנס ולצאת בתוך שניות.

---

# ‏חלק 2 — Core Execution: ‏`Market`, ‏`Limit`, ‏marketable Limit ו־Passive Limit

> ‏ה־taxonomy הקנונית נמצאת ב־`00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md`. בחלק הזה `Market` ו־`Limit` הם Broker Order Primitives; ‏marketable/passive מתארים את מצב הביצוע של ה־Limit ביחס לשוק; ו־`Application Execution Mode` נשאר שכבה נפרדת.

## ‏2.1 אותו Broker Order Primitive יכול להיות אגרסיבי או פסיבי

‏הטעות הראשונה שצריך למחוק היא ההנחה:

```text
Market = aggressive
Limit = passive
```

‏החלק הראשון נכון בדרך כלל; השני אינו נכון.

‏`Limit` אומרת רק:

> ‏אל תבצע אותי במחיר גרוע יותר מהגבול שקבעתי.

‏היא אינה אומרת אם אנחנו לוקחים נזילות או מספקים נזילות.

‏נניח:

```text
Bid = 50.00
Ask = 50.02
```

‏שלוש פקודות `BUY LMT` שונות:

```text
BUY LMT 49.99   -> passive below bid
BUY LMT 50.00   -> passive at bid
BUY LMT 50.03   -> marketable / aggressive
```

‏אותו `broker_order_primitive = LMT`, שלוש התנהגויות ביצוע שונות.

‏לכן מנוע מקצועי צריך לשמור בנפרד לפחות:

```text
broker_order_primitive
behavior_candidate
application_execution_mode
aggressiveness
limit_price
reference_bid
reference_ask
reference_mid
```

---

## ‏2.2 מה `Market` באמת מבקשת

‏פקודת `Market` אומרת למעשה:

> ‏העדף ביצוע עכשיו על פני שליטה מפורשת במחיר.

‏היא לא אומרת:

> ‏"קנה בדיוק ב־Ask שאני רואה על המסך."

‏ה־Quote שאתה רואה הוא snapshot. בזמן שהפקודה עוברת דרך האפליקציה, ה־Broker, ה־Router וה־Venue, הספר יכול להשתנות.

‏נניח שבזמן ההחלטה ראינו:

```text
Ask book
100 @ 50.02
150 @ 50.03
300 @ 50.05
500 @ 50.08
```

‏ואנחנו רוצים 400 מניות.

‏אם הנזילות לא השתנתה, ביצוע אגרסיבי עשוי לקבל:

```text
100 @ 50.02
150 @ 50.03
150 @ 50.05
```

‏המחיר הממוצע הוא כבר גבוה מה־best ask.

‏זה נקרא בהקשר הזה `walking the book`: הכמות שלנו צורכת מספר רמות מחיר.

---

## ‏2.3 `Best Ask` אינו מחיר מובטח לכמות שלנו

‏כאשר רואים:

```text
Ask = 50.02 x 100
```

‏זה אומר שיש כמות מוצגת מסוימת במחיר הזה בזמן ה־snapshot.

‏זה אינו אומר:

```text
my full order will fill at 50.02
```

‏צריך להפריד בין:

```text
Top of Book
```

‏לבין:

```text
Executable depth for my requested quantity
```

‏במנוע שלנו, אם רוצים לקנות 800 מניות, אין משמעות מספקת לשאלה "מה ה־Ask?". השאלה הנכונה יותר היא:

> ‏מהו המחיר הממוצע והמחיר הגרוע ביותר שאני צפוי לשלם אם אקח עכשיו עד 800 מניות מתוך הנזילות הנראית — ומה הסיכון שהנזילות הזו תיעלם לפני שהפקודה תגיע?

---

## ‏2.4 `Market` — למה היא כן קיימת ולמי היא מועילה

‏ל־`Market` יש יתרון אמיתי: היא מבטאת `urgency` גבוהה מאוד.

‏היא יכולה להתאים כאשר:

- ‏חשוב יותר לצאת מהפוזיציה מאשר לשמור על מחיר יעד צר.
- ‏ה־instrument נזיל מאוד והכמות קטנה יחסית לעומק.
- ‏ה־spread צר וה־book יציב יחסית.
- ‏הסיכון מהישארות בפוזיציה גדול מהסיכון ל־slippage.
- ‏יש מצב `EMERGENCY_REDUCE` שבו price certainty משנית ל־position certainty.

‏מי משתמש בה? כמעט כל סוגי המשתתפים יכולים להשתמש בה, אבל מקצוענים לא מתייחסים אליה כאל "כפתור מהיר" בלבד. הם מתייחסים אליה כהצהרה:

```text
execution urgency > explicit price protection
```

---

## ‏2.5 למה `Market` מסוכנת במיוחד למנוע שלנו

‏המטרה שלנו היא Edge קטן וחיי עסקה קצרים. לכן כמה סנטים של execution loss יכולים להיות אחוז גדול מהרווח הצפוי.

‏הסיכונים המרכזיים:

1. ‏`Slippage` — המחיר בפועל גרוע מהמחיר שעליו התקבלה ההחלטה.
2. ‏`Depth consumption` — הכמות חוצה יותר מרמה אחת בספר.
3. ‏`Quote fade` — הנזילות שראינו נעלמת לפני שהפקודה מגיעה.
4. ‏`Volatility burst` — בזמן קצר מאוד המחיר יכול לעבור כמה ticks.
5. ‏`No explicit worst price` — המנוע לא הגדיר בעצמו נקודת "מכאן העסקה כבר לא כלכלית".
6. ‏`Round-trip amplification` — גם בכניסה וגם ביציאה אפשר לשלם execution cost.

‏לכן `Market` אינה baseline טבעי לכניסה רגילה אצלנו רק משום שהיא מהירה.

---

## ‏2.6 פרט חשוב ב־IBKR: `Market` לא בהכרח נשלחת כ־Market פשוטה

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מתעדת שבדרך כלל היא מטפלת ב־Market Orders באמצעות **סדרה של marketable limit orders מדומות**, כחלק מהגנת מחיר, ובמקומות מתאימים יכולה להשתמש ב־`Market With Protection`.

‏המשמעות המקצועית:

- ‏השם שהלקוח שולח הוא `Market`.
- ‏אבל ה־execution path הפנימי של הברוקר עשוי להשתמש ב־price caps.
- ‏לכן אפילו `Market` אינה מבטיחה semantics של "כל מחיר, בלי שום מגבלה".
- ‏במצבים קיצוניים יכולה להיות גם השהיה או אי־ביצוע אם מנגנוני ההגנה אינם מאפשרים execution מיידי.

‏זה חשוב מאוד למנוע: לא בונים assumptions על השם בלבד; מודדים בפועל `ack latency`, ‏`fill latency`, ‏fills ו־rejections.

---

## ‏2.7 `Limit` — ההבטחה שהיא כן נותנת

‏בקנייה:

```text
BUY LMT 50.05
```

‏פירושו:

> ‏מותר לבצע ב־50.05 או טוב יותר; אסור לבצע במחיר גרוע מ־50.05.

‏במכירה:

```text
SELL LMT 50.05
```

‏פירושו:

> ‏מותר לבצע ב־50.05 או טוב יותר; אסור לבצע במחיר נמוך מ־50.05.

‏`Limit` נותנת `price protection`, אבל **אינה נותנת fill guarantee**.

‏זה trade-off בסיסי:

```text
Market:
more execution urgency
less explicit price certainty

Limit:
explicit worst acceptable price
less execution certainty
```

---

## ‏2.8 Limit במצב `marketable` — אחד הכלים המרכזיים לרובוט קצר־טווח

> ‏`ENGINE RULE` — `Marketable Limit` אינה Broker Order Primitive נפרדת. זו `Limit` שמחירה, ביחס ל־snapshot הנוכחי, מאפשר execution מיידי מול הצד הנגדי.

‏נניח:

```text
Bid = 50.00
Ask = 50.02
```

‏ואנחנו שולחים:

```text
BUY 100 LMT 50.04
```

‏זו עדיין `Limit Order`, אבל היא marketable מפני שהמחיר שלנו מספיק אגרסיבי כדי לפגוש את ה־Ask הקיים.

‏אם יש 100 מניות זמינות ב־50.02 והיא מגיעה בזמן, היא יכולה להתבצע ב־50.02 — לא חייבים לשלם 50.04 רק משום שזה ה־Limit.

‏ה־50.04 הוא ה־broker limit שמממש במקרה הזה את `Economic Price Bound`; הוא **אינו יעד תשלום**.

‏זה בדיוק מה שהופך את ההתנהגות הזו למעניינת אצלנו:

```text
try to execute now
but refuse execution beyond economic boundary
```

---

## ‏2.9 Marketability אינה קבועה ואינה מבטיחה Fill

‏נניח שהמנוע רואה:

```text
Ask = 50.02
```

‏ושולח:

```text
BUY LMT 50.04
```

‏בזמן ההגעה לשוק ייתכן שכבר יש:

```text
Bid = 50.04
Ask = 50.06
```

‏עכשיו ה־Limit שלנו אינה marketable יותר.

‏היא יכולה להישאר Working ב־50.04 אם ה־TIF וה־routing מאפשרים זאת.

‏כלומר:

> ‏Marketability היא state ביחס למצב השוק **ברגע מסוים**, לא תווית נצחית של הפקודה.

‏מכאן נובע שמנוע חייב למדוד:

```text
decision_time
submit_time
ack_time
first_fill_time
last_fill_time
market_state_at_each_stage
```

---

## ‏2.10 Limit marketable יכולה להפוך ל־Passive remainder

‏נניח:

```text
Ask:
40 @ 50.02
30 @ 50.03
```

‏אנחנו שולחים:

```text
BUY 100 LMT 50.03
DAY
```

‏ייתכן שיתבצעו 70 מניות מיד:

```text
40 @ 50.02
30 @ 50.03
```

‏ויישארו:

```text
30 remaining @ 50.03
```

‏אם אין `IOC`, היתרה יכולה להפוך לפקודה נחה ב־50.03.

‏עבור Signal שחי שניות, זו יכולה להיות בעיה: הפקודה התחילה כאגרסיבית אבל סיימה כ־stale passive order.

‏לכן בהמשך נלמד מדוע Behavior Candidate של:

```text
MARKETABLE_LIMIT_IOC
```

‏מעניין במיוחד כאשר רוצים "מה שניתן עכשיו — כן; שארית ישנה — לא".

---

## ‏2.11 Passive Limit — אנחנו מבקשים מהשוק להגיע אלינו

‏אם:

```text
Bid = 50.00
Ask = 50.02
```

‏ואנחנו שולחים:

```text
BUY LMT 50.00
```

‏אנחנו בדרך כלל מצטרפים לצד הקונים ולא משלמים מיד את ה־Ask.

‏היתרונות האפשריים:

- ‏חיסכון ב־spread.
- ‏מחיר כניסה טוב יותר.
- ‏ב־venues מסוימים ייתכנו maker economics שונים.
- ‏אפשרות ל־price improvement לעומת לקיחת ה־Ask.

‏אבל המחיר הכלכלי האמיתי הוא לא רק commission/rebate. הוא כולל:

```text
no-fill risk
queue delay
missed opportunity
adverse selection
signal decay
```

---

## ‏2.12 הבעיה המקצועית של Passive Fill: למה דווקא עכשיו מישהו מכר לי?

‏זה לב ה־`adverse selection`.

‏נניח שאנחנו ממתינים ב־Bid ב־50.00.

‏קיבלנו Fill.

‏מתחיל עלול לחשוב:

> ‏מעולה, קניתי זול יותר.

‏אבל איש execution שואל:

> ‏למה המוכר בחר לקחת את ה־Bid דווקא עכשיו?

‏אולי מיד אחרי ה־Fill השוק הופך:

```text
Bid = 49.97
Ask = 49.99
```

‏קיבלנו מחיר שנראה טוב ביחס ל־Ask הישן, אבל קיבלנו Fill בדיוק כאשר המידע החדש הפך את המחיר לפחות טוב.

‏לכן צריך למדוד לאחר Passive Fill:

```text
markout_100ms
markout_250ms
markout_500ms
markout_1s
markout_2s
markout_5s
```

‏כלומר: מה קרה למחיר אחרי שהתבצענו?

---

## ‏2.13 `No Fill` הוא גם תוצאה כלכלית

‏אם Passive Entry לא התמלאה והמניה עלתה בלעדינו, אין P&L של עסקה — אבל כן היה `opportunity cost`.

‏לכן השוואה לא הוגנת היא:

```text
passive filled trades
vs
aggressive filled trades
```

‏צריך לכלול גם Signals שבהם Passive לא התמלאה.

‏אחרת נקבל selection bias.

‏מדד מחקר טוב יותר צריך לכלול:

```text
fill rate
conditional P&L when filled
missed-move value when not filled
adverse-selection markout
net outcome per signal opportunity
```

---

## ‏2.14 איך לבחור `Economic Price Bound` נכון ל־Limit אגרסיבית

‏טעות קלה היא לומר:

```text
always cross by 2 cents
```

‏זה פשוט, אבל לא מקצועי מספיק.

‏שני סנטים יכולים להיות:

- ‏זניחים במניה של מאות דולרים עם spread רחב.
- ‏חלק עצום מה־Edge במניה זולה עם spread של tick אחד.
- ‏מספיק לעומק קטן אבל לא לכמות גדולה.
- ‏רחבים מדי בזמן volatility גבוהה.

‏ה־boundary צריך להיות קשור לכלכלה של העסקה.

‏מודל עקרוני:

```text
entry_max_price =
    expected_exit_price
  - required_net_edge
  - expected_exit_cost
  - commissions_and_fees
  - safety_margin
```

‏ובמכירה/יציאה אפשר להגדיר בהתאם `exit_min_price` כאשר יש bound כלכלי מתאים.

‏הנוסחה המדויקת תשתנה לפי המודל שלנו, אבל העיקרון הוא:

> ‏ה־Economic Price Bound הוא מושג ההחלטה; ה־broker limit price הוא הדרך הקונקרטית לממש אותו ב־Order מסוימת.

---

## ‏2.15 `Economic Price Bound` חייב להכיר גם Depth

‏נניח:

```text
Ask book:
100 @ 20.00
100 @ 20.01
100 @ 20.02
1000 @ 20.10
```

‏אם רוצים 250 מניות ו־entry bound הוא 20.02, יש displayed depth מספק לפי ה־snapshot.

‏אם רוצים 600 מניות, אין displayed depth מספק עד ה־bound.

‏מכאן שני דברים:

1. ‏הכמות היא חלק ממדיניות המחיר.
2. ‏גם אם ה־Top of Book נראה מצוין, full-size execution יכול להיות בלתי כלכלי.

‏לכן מנוע יכול לחשב לפני שליחה:

```text
visible_qty_within_bound
expected_vwap_within_bound
worst_visible_price_within_bound
requested_qty / visible_qty_within_bound
```

‏זה עדיין לא מבטיח Fill, כי Book יכול להשתנות ויש hidden liquidity, אבל זו בדיקת feasibility טובה יותר מ־Ask בודד.

---

## ‏2.16 `Slippage` — חייבים להגדיר מול איזה Benchmark

‏המילה `slippage` לבדה אינה מספיקה.

‏אפשר למדוד:

```text
fill - decision ask
fill - submit ask
fill - arrival ask
fill - midpoint at decision
fill - midpoint at arrival
fill - last trade
```

‏כל אחד עונה על שאלה אחרת.

‏למנוע שלנו חשוב במיוחד להפריד:

### ‏`Decision slippage`

‏כמה הפסדנו מהרגע שבו האסטרטגיה החליטה עד הביצוע.

### ‏`Arrival slippage`

‏כמה הביצוע היה גרוע ביחס לשוק כשהפקודה הגיעה ל־execution layer / broker.

### ‏`Implementation shortfall`

‏העלות הכוללת של המעבר מהחלטה לתוצאה בפועל, כולל no-fills, partials, fees ותנועה בזמן.

‏כך אפשר לדעת אם הבעיה היא Signal איטי, תוכנה איטית, routing, order policy או שוק שברח.

---

## ‏2.17 למה `Last` הוא Benchmark חלש לביצוע

‏אם:

```text
Last = 49.98
Bid = 50.00
Ask = 50.02
```

‏קנייה ב־50.02 אינה בהכרח "slippage של 4 סנטים".

‏ה־Last יכול להיות עסקה ישנה, venue אחר, trade condition אחר או פשוט מחיר שאינו זמין יותר.

‏לצורך execution, בדרך כלל חשוב יותר לדעת:

```text
what was executable when we decided?
what was executable when we arrived?
what did we actually receive?
```

‏זו אחת הסיבות שבמנוע קצר אנחנו צריכים Quote/Depth timestamps ולא רק stream של Last trades.

---

## ‏2.18 Aggressive Entry מול Passive Entry — אין מנצח קבוע

‏אפשר לחשוב על זה כבעיה של Expected Value:

```text
Aggressive:
+ higher immediate fill probability
+ lower missed-move risk
- spread/taker cost
- more slippage/depth consumption

Passive:
+ potentially better price
+ possible spread capture
- lower fill probability
- queue risk
- adverse selection
- missed signal
```

‏אם Signal חזק מאוד וקצר, no-fill cost יכול להיות גדול יותר מה־spread.

‏אם Signal חלש יותר, spread רחב והזמן מאפשר, Passive יכולה להיות עדיפה.

‏לכן `Application Execution Mode` צריך להיות פונקציה של מצב השוק ולא setting קבוע.

---

## ‏2.19 כניסה ויציאה אינן סימטריות

‏בכניסה אפשר תמיד לבחור:

```text
NO TRADE
```

‏אם המחיר נהיה גרוע מדי — לא נכנסים.

‏ביציאה, כבר יש Position. לפעמים אי־ביצוע הוא עצמו סיכון.

‏לכן יכול להיות שמדיניות נכונה תהיה:

```text
Entry:
strict economic price bound
accept no-fill

Normal Exit:
price-capped but more aggressive

Emergency Exit:
prioritize reducing position risk
```

‏זו סיבה חשובה לא להשתמש באותו Execution Policy אוטומטית ל־Entry ול־Exit.

---

## ‏2.20 להפריד `Application Execution Mode` מ־`Behavior Candidate`

‏המנוע לא צריך לבחור ישירות "Order Type". הוא צריך קודם לבחור **אופי ביצוע**, ורק אחר כך Candidate קונקרטית שמממשת אותו.

‏ה־Modes הקנוניים הרלוונטיים כאן:

```text
PASSIVE
PRICE_IMPROVING
AGGRESSIVE_CAPPED
NORMAL_EXIT
FAST_EXIT
EMERGENCY_REDUCE
```

‏ומתחתיהם יכולים להופיע Behavior Candidates כגון:

```text
PASSIVE_JOIN
IMPROVE_ONE_TICK
MARKETABLE_LIMIT_IOC
```

‏לדוגמה:

```text
ApplicationExecutionMode = PASSIVE
BehaviorCandidate = PASSIVE_JOIN
ConcreteOrder:
  primitive = LMT
  tif = DAY
  application_order_ttl = short
```

‏או:

```text
ApplicationExecutionMode = AGGRESSIVE_CAPPED
BehaviorCandidate = MARKETABLE_LIMIT_IOC
ConcreteOrder:
  primitive = LMT
  tif = IOC
  limit_price = derived from Economic Price Bound
```

‏כך `PASSIVE_JOIN`, ‏`MARKETABLE_LIMIT_IOC` ו־`FAST_EXIT` אינם מתחרים באותו enum ואינם מתערבבים עם `LMT`/`IOC` עצמם.

---

## ‏2.21 למה רובוט מונחה תוכנה יכול לנצל `Limit` טוב יותר מאדם

‏אדם יכול להסתכל על הספר ולשנות מחיר ידנית, אבל תוכנה יכולה לבצע את התהליך באופן עקבי ומהיר:

```text
recompute economic price bound
recompute visible depth
recompute signal age
recompute expected edge
choose application execution mode
choose behavior candidate
materialize concrete order
submit
observe fills
cancel/re-evaluate
```

‏היתרון אינו "ללחוץ מהר" בלבד.

‏היתרון הוא שהמנוע יכול להשתמש באותה מדיניות בדיוק אלפי פעמים ולמדוד את התוצאה.

‏זה מאפשר לבצע ניסוי אמיתי בין Behaviors כגון:

```text
PASSIVE_JOIN
MARKETABLE_LIMIT_IOC
MIDPRICE
RELATIVE_PRIMARY
ADAPTIVE_LIMIT_URGENT
```

‏במקום לבחור לפי תחושת בטן.

---

## ‏2.22 מתי Automation הופכת למסוכנת

‏אותה מהירות יכולה להגדיל טעויות.

‏דוגמאות:

- ‏Quote stale גורם ל־bound לא נכון.
- ‏כפל event גורם לשליחת Order פעמיים.
- ‏Cancel שלא אושר גורם ל־overfill.
- ‏לולאת chase מרחיבה מחיר שוב ושוב בלי לשים לב שה־Edge כבר נעלם.
- ‏Partial fill אינו מעדכן quantity ונשלחת יתרה גדולה מדי.
- ‏Market data נתקע אבל execution עדיין פעיל.
- ‏יחידות מחיר/tick size שגויות יוצרות Limit לא חוקית.
- ‏Reconnect מחזיר Orders חיות שהמנוע המקומי שכח.

‏לכן כל Mode אוטומטי חייב גבולות:

```text
max_total_qty
economic_price_bound
max_chase_steps
application_order_ttl
signal_ttl
max_position
max_outstanding_orders
kill_switch
```

---

## ‏2.23 `Chase` — המנגנון שמסוכן להפוך ל־Market מוסווית

‏נניח שהתחלנו:

```text
BUY LMT 50.02
```

‏לא התמלאנו, ואז:

```text
50.03
50.04
50.05
50.06
...
```

‏אם כל פעם אנחנו מעלים Limit בלי לחשב מחדש את Edge, בנינו למעשה Market Order איטית בלי לקרוא לה Market.

‏Chase מקצועי צריך תנאי עצירה:

```text
signal still valid
remaining edge > required threshold
price <= economic price bound
chase_count < max_chase_steps
signal_age < signal_ttl
```

‏כאשר אחד נשבר — `NO MORE CHASE`.

---

## ‏2.24 האם כדאי "להצמיד למוביל" ב־Bid או Ask?

‏זו טקטיקה אפשרית, אבל צריך להבין מה היא באמת עושה.

‏בקנייה, הצטרפות ל־`Bid1` נותנת לנו מחיר פסיבי טוב יותר מלקיחת ה־Ask, אבל:

- ‏אנחנו נכנסים לתור.
- ‏לא ידוע כמה כמות לפנינו באמת, במיוחד עם hidden liquidity.
- ‏אם ה־Bid זז, צריך להחליט אם לעקוב.
- ‏כל cancel/replace יכול לפגוע ב־queue priority.
- ‏אם המחיר עולה מהר, אנחנו עלולים להישאר מאחור.

‏לכן "להיצמד למוביל" אינה אסטרטגיית ביצוע מלאה. היא initial placement rule בתוך Behavior Candidate כגון `PASSIVE_JOIN`.

‏צריך להוסיף:

```text
max_wait
cancel trigger
reprice trigger
max chase
signal expiry
partial-fill policy
```

---

## ‏2.25 האם להיות לבד ברמת מחיר זה בהכרח רע?

‏לא בהכרח.

‏אם אנחנו היחידים ב־Bid מסוים, ייתכן שאנחנו פשוט מציעים מחיר טוב יותר מהשאר.

‏אבל עבור המנוע שלנו זה יכול להיות Diagnostic שימושי:

- ‏האם אנחנו יוצרים price level חדש שלא התכוונו ליצור?
- ‏האם אנחנו הופכים גלויים מדי ביחס לכמות שלנו?
- ‏האם price improvement קטן באמת שווה אובדן של queue context קיים?
- ‏האם order book השתנה מאז החישוב?

‏לכן אפשר להחזיק Policy שמעדיפה להצטרף לרמה קיימת, אבל לא להפוך זאת לחוק שוק אוניברסלי. צריך לבדוק אמפירית אם זה משפר Fill/Markout/Net Edge.

---

## ‏2.26 מדדי Telemetry שחייבים לכל Order

‏כדי ללמוד איזה Mode ו־Behavior עובדים, נשמור לפחות:

```text
signal_id
order_id
symbol
side
requested_qty
filled_qty
application_execution_mode
behavior_candidate
broker_order_primitive
tif
limit_price
reference_bid
reference_ask
reference_mid
visible_depth_within_bound
signal_timestamp
decision_timestamp
submit_timestamp
ack_timestamp
first_fill_timestamp
last_fill_timestamp
cancel_request_timestamp
cancel_ack_timestamp
avg_fill_price
worst_fill_price
commission
fees
route
venue when available
```

‏ומדדים נגזרים:

```text
submit_latency
ack_latency
time_to_first_fill
time_to_full_fill
fill_ratio
decision_slippage
arrival_slippage
spread_paid_or_captured
markout_100ms
markout_500ms
markout_1s
markout_5s
missed_move_if_no_fill
net_edge_after_execution
```

‏בלי הנתונים האלה לא נוכל לדעת אם `Pegged`, ‏`Bracket`, ‏`IOC`, ‏`Adaptive` או כל Advanced Order באמת שיפרו את המערכת.

---

## ‏2.27 מטריצת החלטה ראשונית לחלק 2

| מצב | Behavior/Primitive בסיסי למחקר | למה | הסיכון המרכזי |
|---|---|---|---|
| ‏Signal חזק וקצר, Spread סביר | marketable `Limit` עם bound כלכלי | ‏מהירות עם price protection | ‏bound רחב מדי או שוק שבורח לפני arrival |
| ‏Signal תקף אך urgency נמוכה יותר | Passive `Limit` | ‏ניסיון לחסוך spread | ‏no-fill / adverse selection |
| ‏נזילות דקה או volatility גבוהה | `Limit` שמרנית / `NO TRADE` | ‏מונע runaway price | ‏פספוס הזדמנות |
| ‏יציאה רגילה | Aggressive price-capped `Limit` | ‏איזון בין מהירות להגנת מחיר | ‏position נשאר אם bound צר מדי |
| ‏מצב חירום | `EMERGENCY_REDUCE` + materialization מתאים | ‏position risk קודם | ‏slippage גבוה |
| ‏Edge קטן מה־round-trip execution cost | `NO TRADE` | ‏אין עסקה כלכלית | ‏FOMO בלבד |

‏זו אינה טבלת Live סופית. היא baseline מחקרי שיקבל refinement אחרי `IOC`, ‏Pegged/Midpoint, routing ו־broker algos.

---

## ‏2.28 `IBKR` — מה מתועד כרגע עבור `Market` ו־`Limit`

> ‏`FACT` — אימות אחרון: `2026-10-27`, לפי התיעוד הרשמי של IBKR. לפני שימוש אמיתי צריך לבדוק גם account/product/route בפועל ולהעביר Capability דרך שלבי ה־enablement הקנוניים.

### ‏`Market`

‏IBKR מתעדת `Market` עבור מניות ומוצרים נוספים, עם תמיכה ב־`TWS`, ‏`IBKR Desktop`, ‏`IBKR Mobile` ו־`Client Portal`, וב־Smart או Directed routing לפי המוצר/מסלול.

### ‏`Limit`

‏IBKR מתעדת `Limit` עבור מניות ומוצרים נוספים, גם ב־`TWS`, ‏`IBKR Desktop`, ‏`IBKR Mobile` ו־`Client Portal`, עם Smart ו־Directed routing.

### ‏`TWS API`

‏ב־Order object קיימים בין היתר:

```text
orderType
lmtPrice
tif
```

‏ולכן `MKT` ו־`LMT` הם חלק מה־API automation path הרגיל.

### ‏Limit במצב marketable

‏אין צורך ב־Order Type נפרד כדי לקבל את ההתנהגות הבסיסית. זו `Limit` שמחירה חוצה או פוגש את הצד הנגדי בזמן שהיא ניתנת לביצוע.

### ‏Price filters ו־Price Management

‏IBKR מתעדת pre-trade price/size filters, ויכולה לדחות, להגביל או price-cap Orders במצבים מסוימים. בנוסף קיים `Price Management Algo` attribute למקרים שבהם מחיר Limit רחוק מה־reference price המותר.

‏מבחינתנו:

> ‏גם אם המנוע חושב שה־bound חוקי וכלכלי, צריך לטפל ב־broker rejection/price-cap behavior כחלק מה־state machine.

---

## ‏2.29 ה־baseline ההנדסי הראשוני למנוע שלנו

‏לפני שבודקים Advanced Orders, baseline טוב למחקר הוא לא "תמיד Market" ולא "תמיד Bid".

‏שלושה Behavior Candidates בסיסיים:

```text
A. PASSIVE_JOIN
   -> Limit + short application_order_ttl

B. AGGRESSIVE_CAPPED via marketable Limit
   -> Limit with economically derived bound

C. MARKETABLE_LIMIT_IOC
   -> marketable Limit + IOC
```

‏ולכל אחד למדוד:

```text
fill rate
fill speed
entry markout
missed opportunity
round-trip net edge
exit feasibility
failure rate
```

‏רק אחר כך אפשר להחליט מהו Default לפי Regime.

‏הסיבה היא שכל פקודה "יפה" על הנייר יכולה להפסיד בממד אחר:

```text
better price but no fill
faster fill but too much slippage
high fill rate but adverse selection
cheap entry but expensive exit
```

---

## ‏2.30 Practitioner Secrets — הדברים שקל לפספס

### ‏1. `Limit` אינה בהכרח פסיבית

‏אגרסיביות היא יחס בין ה־Limit ל־Book, לא שם הפקודה.

### ‏2. Limit marketable יכולה להפוך ל־resting

‏אם השוק זז או אם נשאר remainder ואין `IOC`, ההתנהגות משתנה באמצע חיי אותה Order.

### ‏3. Fill טוב יכול להיות Fill רע

‏מחיר שנראה טוב בזמן ה־Fill יכול להיות סימן ל־adverse selection אם השוק מיד ממשיך נגדנו.

### ‏4. No-fill חייב להיכנס למחקר

‏התעלמות מהזדמנויות שפספסנו גורמת ל־Passive להיראות טוב מדי.

### ‏5. `Last` אינו executable price

‏אסטרטגיה שמודדת Alpha על Last אבל מבצעת על Bid/Ask יכולה לדמיין Edge שלא ניתן למימוש.

### ‏6. Chase בלי Economic Price Bound הוא Market בתחפושת

‏השם `Limit` אינו מציל אותנו אם הקוד ממשיך להעלות את המחיר עד שמתבצע.

### ‏7. Exit economics חשובים כבר בזמן Entry

‏אסור לחשב "יש לי 0.20% upside" בלי לשאול באיזה מחיר נוכל לצאת ומה יהיה round-trip cost.

### ‏8. Broker protection משנה semantics

‏ב־IBKR, Market יכולה להיות מטופלת באמצעות simulated marketable limits. לכן telemetry אמיתי חשוב יותר מהנחה פשטנית על order name.

---

# ‏מקורות רשמיים לחלק 2

- ‏IBKR — Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR — Market Order Handling using Simulated Market Orders: <https://www.interactivebrokers.com/en/trading/simulated-market-orders.php>
- ‏IBKR — Price Management Algo: <https://www.interactivebrokers.com/en/trading/orders/pricemanagementalgo.php>
- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR TWS API — `ContractDetails` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/contract-details>
- ‏IBKR General — Order Types introduction: <https://www.interactivebrokers.com/docs/general/order-types/introduction>

---

# ‏Checkpoint — סוף חלק 2

‏בחלק הזה עברנו מהגדרות בסיסיות ל־execution mechanics תוך שמירה על ה־taxonomy הקנונית: `Market` ו־`Limit` הם Broker Order Primitives; marketability/passivity הן states של הביצוע; `Economic Price Bound` הוא constraint של ההחלטה; ו־`Application Execution Mode` נפרד מ־Behavior Candidate ומ־Concrete Broker Order.

‏ה־baseline שנוצר הוא: **לא לבחור Order לפי שם, אלא לבחור Mode ו־Behavior לפי urgency, economic price bound, depth, signal lifetime, fill state ו־exit feasibility — ורק אחר כך לממש אותם ב־primitive/attributes מתאימים.**

‏החלק הבא יהיה `Time in Force` ופקודות מיידיות — `DAY`, ‏`GTC`, ‏`GTD`, ‏`IOC`, ‏`FOK`, ‏`AON` ו־Minimum Quantity — עם דגש עמוק על השאלה מתי אנחנו רוצים partial fill עכשיו, full fill עכשיו, או בכלל לא להשאיר remainder.

---

# ‏חלק 2A — `Sweep-to-Fill` ו־`Market-to-Limit`: ביצוע אגרסיבי מתקדם

> ‏הפרק הזה משלים את Part 2. הוא עוסק בשתי משפחות Advanced Execution שחסרו בקורס: `Sweep-to-Fill` ו־`Market-to-Limit (MTL)`. שתיהן עשויות להיראות "מהירות", אבל ה־lifecycle וה־risk semantics שלהן שונות מהותית.
>
> ‏`FACT` — עובדות `IBKR` תלויות־זמן בפרק זה אומתו לאחרונה ב־`2026-10-27` מול התיעוד הרשמי של IBKR.

---

## ‏2A.1 למה בכלל צריך עוד שתי משפחות מעבר ל־Marketable Limit

‏`MARKETABLE_LIMIT_IOC` נותנת לנו semantics פשוטה יחסית:

```text
try immediate execution
within Economic Price Bound
accept allowed partial
cancel unfilled remainder
```

‏אבל קיימות בעיות execution שונות:

```text
A. I want aggressive access to liquidity across price levels / destinations now.
B. I want an initial market-style attempt, but if only part fills I want the remainder to become a resting Limit at the execution price.
```

‏`Sweep-to-Fill` עוסקת יותר ב־A.

‏`Market-to-Limit` עוסקת יותר ב־B.

‏הן אינן aliases של `IOC`, ‏`Market`, ‏`Adaptive` או זו של זו.

---

## ‏2A.2 `Sweep-to-Fill` — מה היא עושה

> ‏`FACT` — IBKR מתארת `Sweep-to-Fill` כפקודה שמזהה את המחיר הטוב ביותר ואת הכמות הזמינה בו, שולחת את החלק המתאים לביצוע מיידי, ובמקביל ממשיכה לרמות המחיר הבאות ולכמויות הזמינות שם.

‏מבחינת taxonomy:

```text
Broker Primitive      = LMT
Execution Attribute   = sweepToFill = true
Routing                = SMART
Application Intent     = aggressive multi-level / multi-destination liquidity access
Economic Price Bound   = lmtPrice
```

‏ב־TWS API קיים field מפורש:

```text
sweepToFill = true
```

‏והדוגמה הרשמית משתמשת ב־:

```text
orderType = LMT
lmtPrice  = <limit>
sweepToFill = true
```

---

## ‏2A.3 למה `Sweep-to-Fill` מעניינת מקצועית

‏Marketable Limit רגילה יכולה להיות אגרסיבית, אבל `Sweep-to-Fill` מבטאת intent מפורש יותר:

```text
speed matters
consume currently available liquidity across successive levels
stay bounded by a Limit
```

‏כלומר היא יכולה להיות Candidate למחקר כאשר:

- ‏ה־Signal קצר וה־missed-move cost גבוה.
- ‏יש displayed liquidity במספר רמות עד ה־Economic Price Bound.
- ‏אנחנו רוצים execution אגרסיבי אך עדיין עם bound מפורש.
- ‏אנחנו רוצים להשוות behavior של sweep מפורש מול SMART marketable Limit רגילה.

---

## ‏2A.4 למה `Sweep-to-Fill` אינה "Market טובה יותר"

‏היא עדיין יכולה:

```text
consume several price levels
pay meaningful spread/depth cost
receive only partial execution
encounter disappearing liquidity
produce worse average price than top-of-book snapshot suggested
```

‏וה־Limit אינו אומר שהמחיר הממוצע יהיה טוב; הוא רק מגדיר את המחיר הגרוע ביותר שהפקודה רשאית לעבור לפי semantics של Limit.

> ‏`ENGINE RULE` — `Sweep-to-Fill` אינה פטור מ־Economic Price Bound, ‏Depth Feasibility או Exit Feasibility.

---

## ‏2A.5 `Sweep-to-Fill` מול `MARKETABLE_LIMIT_IOC`

| שאלה | `MARKETABLE_LIMIT_IOC` | `Sweep-to-Fill` |
|---|---|---|
| ‏Broker primitive בסיסי | `LMT` | `LMT` |
| ‏Bound מפורש | כן | כן |
| ‏מטרה | ניסיון מיידי תחום | sweep אגרסיבי של liquidity זמינה |
| ‏Remainder | מתבטלת בגלל `IOC` | תלוי TIF / concrete order plan |
| ‏Multi-level aggression | יכולה לקרות | intent מרכזי ומפורש יותר |
| ‏Control | פשוט יחסית | יותר broker/router behavior |
| ‏סיכון מרכזי | partial/no-fill | depth consumption + slippage within bound |

‏למנוע שלנו אין סיבה להניח מראש שאחת טובה יותר. זו השוואה אמפירית.

---

## ‏2A.6 `Sweep-to-Fill` מול `Adaptive Urgent`

‏שתיהן עשויות לשמש כאשר urgency גבוהה, אבל הן מעבירות control בצורה שונה.

```text
Sweep-to-Fill:
explicit Limit boundary
explicit sweep behavior
SMART routing
focus on immediate available liquidity

Adaptive Urgent:
broker algo manages part of speed/price search
client still owns Signal, TTL and Economic Price Bound policy
```

‏לכן ניסוי הוגן צריך להשוות לפחות:

```text
time_to_useful_fill
fill_ratio
avg_fill_price
worst_fill_price
slippage_vs_arrival
missed_move_if_unfilled
post-fill markout
```

---

## ‏2A.7 Failure semantics של `Sweep-to-Fill`

‏Failure Contract מינימלי:

```text
Where does it live?             Broker / SMART routing path after acceptance
Who manages price-level sweep?  Broker/router
Can it outlive local intent?     Yes, while working unless TIF/local cancel ends it
Can liquidity disappear?        Yes
Can partial fills arrive?        Yes
What does cancel mean?           Pending cancel remains potentially executable
What invalidates it locally?     Signal expiry, bound invalidation, risk/capability change
```

‏בפרט, אם ה־Signal מתה בזמן שה־Broker עדיין מנהלת את ה־Order, אין להניח שה־Broker "יודעת" שה־Alpha נעלמה.

---

## ‏2A.8 `Sweep-to-Fill` — Classification אצלנו

‏בשלב זה:

```text
research_role = RESEARCH_CHALLENGER
```

‏ולא:

```text
CORE_BASELINE
```

‏הסיבה: ה־core baseline שלנו כבר מכיל `MARKETABLE_LIMIT_IOC`, שהיא פשוטה יותר להסבר, telemetry ו־failure handling. ‏Sweep ראויה למחקר רק אם היא מוסיפה execution quality מדידה.

---

## ‏2A.9 `Market-to-Limit (MTL)` — Order שמשנה צורה

> ‏`FACT` — IBKR מתארת `Market-to-Limit` כך: הפקודה נשלחת תחילה כ־Market כדי לבצע במחיר השוק הטוב הנוכחי. אם מתקבלת רק Partial Fill, היתרה מבוטלת ומוגשת מחדש כ־Limit במחיר שבו החלק הראשון התמלא.

‏לכן `MTL` שייכת ל־lifecycle family:

```text
TRANSFORMING ORDER
```

‏היא אינה רק `Market` ואינה רק `Limit`.

‏ה־state transition העקרוני:

```text
INITIAL_MARKET_PHASE
→ partial fill
→ remainder canceled/rebuilt
→ RESTING_LIMIT_AT_FIRST_EXECUTION_PRICE
```

---

## ‏2A.10 מה מיוחד ב־MTL

‏נניח:

```text
BUY 300 MTL
```

‏והחלק הראשון שמתבצע הוא:

```text
100 @ 50.02
```

‏לפי semantics המתועדת, היתרה יכולה להפוך ל־Limit סביב:

```text
200 @ 50.02
```

‏מבחינת intent:

```text
get immediate market-style access first
then stop chasing and rest remainder at the execution price
```

‏זו התנהגות שונה מאוד מ־Market מלאה, IOC או Marketable Limit רגילה.

---

## ‏2A.11 למה MTL יכולה להיות מושכת

‏היא מנסה לשלב:

```text
initial execution urgency
+
no unlimited chase by the remainder
```

‏כלומר לאחר execution ראשוני היא "נועלת" את remainder למחיר שנקבע מתוך execution בפועל.

‏זה יכול להיות מעניין כאשר רוצים להתחיל מהר, אבל לא רוצים שהיתרה תמשיך ללכת אחרי שוק מתרחק.

---

## ‏2A.12 למה MTL מסוכנת במיוחד ל־Signal קצר

‏הבעיה היא שה־remainder יכולה להפוך ל־resting Limit בדיוק אחרי שהמצב השתנה.

‏לדוגמה:

```text
initial partial fill happened
signal then decayed
remainder is now resting at first fill price
```

‏אם המנוע מתייחס ל־MTL כאל "Market attempt שכבר נגמר", הוא עלול לשכוח שה־remainder עדיין חיה.

> ‏`ENGINE INVARIANT` — transformation אינה terminal state. אחרי Partial Fill צריך לעקוב במפורש אחר ה־remainder החדשה וליישם עליה `application_order_ttl`, ‏Signal validity ו־Cancel semantics.

---

## ‏2A.13 MTL וה־`Economic Price Bound`

‏יש כאן הבדל קריטי מול `MARKETABLE_LIMIT_IOC`:

```text
MARKETABLE_LIMIT_IOC
=> client supplies an explicit Limit that can implement the Economic Price Bound

MTL initial phase
=> market-style initial execution before the remainder transforms to Limit
```

‏לכן עבור מנוע שבו Edge קטן ו־price certainty קריטית, MTL אינה תחליף אוטומטי ל־capped aggressive execution.

‏היא Candidate אחרת עם trade-off אחר.

---

## ‏2A.14 `MTL` מול `MARKETABLE_LIMIT_IOC`

| שאלה | `MARKETABLE_LIMIT_IOC` | `MTL` |
|---|---|---|
| ‏Initial behavior | aggressive Limit | market-style |
| ‏Client-defined bound בתחילת attempt | כן | לא באותה צורה |
| ‏Partial remainder | מתבטלת | הופכת ל־Limit במחיר ה־Fill |
| ‏Resting remainder | לא | כן, אפשרי |
| ‏Lifecycle complexity | נמוכה יחסית | גבוהה יותר — transforming |
| ‏מתאים ל־Signal קצר מאוד | לעיתים טבעי יותר | דורש watchdog חזק על remainder |

---

## ‏2A.15 `MTL` מול Market רגילה

```text
Market:
seek execution now
no intentional resting remainder rule from the client semantics

MTL:
seek initial market execution
then convert an unfilled remainder to Limit at execution price
```

‏כלומר MTL אינה "Market עם limit שהוגדר מראש". ה־Limit של remainder נגזרת מתוצאת ה־execution הראשונית.

---

## ‏2A.16 `MTL` מול `Adaptive Urgent`

‏`Adaptive Urgent` היא delegated execution search.

‏`MTL` היא lifecycle transformation rule.

‏השאלות שונות:

```text
Adaptive:
how should broker search for execution within the configured plan?

MTL:
what should happen to remainder after initial market-style execution?
```

‏לכן אין להשוות אותן רק לפי Fill Rate; צריך למדוד גם remainder behavior, stale-order incidence ו־cancel latency.

---

## ‏2A.17 Failure semantics של MTL

```text
Where does it live?              Broker/venue path after acceptance
Who performs transformation?     Broker execution path
Can it outlive local intent?      Yes, especially transformed remainder
Can partial fills arrive?         Yes — partial fill is the transformation trigger
Can remainder rest?               Yes
What becomes stale?               transformed Limit remainder
What must be reconciled?          initial fill + transformed working remainder
```

‏מבחינת state machine, אירוע Partial Fill אינו רק:

```text
filled_qty += x
```

‏אלא יכול לשנות גם את semantics של מה שנשאר.

---

## ‏2A.18 Telemetry ייעודית ל־MTL

‏בנוסף ל־telemetry הרגילה נרצה:

```text
initial_market_submit_ts
first_fill_ts
first_fill_price
transformation_detected_ts
transformed_limit_price
transformed_remaining_qty
transformed_order_working_ts
transformed_order_cancel_request_ts
transformed_order_terminal_ts
stale_remainder_incident
```

‏בלי telemetry כזו קשה לדעת אם MTL באמת קיצרה time-to-fill או רק יצרה resting remainder שלא שמנו לב אליה.

---

## ‏2A.19 Capability facts ב־IBKR

> ‏`FACT` — אימות אחרון: `2026-10-27`.

### ‏`Sweep-to-Fill`

‏בקטלוג Order Types של IBKR היא מתועדת ל־US products, ‏SMART routing, וב־TWS. בתיעוד ה־API קיימת דוגמה ל־`STK/WAR/CFD` ב־SMART עם:

```text
orderType = LMT
sweepToFill = true
```

‏הבדלי ניסוח בין surface של קטלוג המוצרים לבין surface של ה־API הם בדיוק סיבה לא להחזיק `supported=true` גלובלי. צריך capability scope ספציפי ל־product/contract/API/route/account/session.

### ‏`Market-to-Limit`

‏IBKR מתעדת `MTL` למספר מוצרים כולל Stocks/ETFs, עם Smart ו־Directed routing, ובמספר פלטפורמות. ה־Capability בפועל עדיין חייבת לעבור את שלבי ה־enablement הקנוניים לפני Production.

---

## ‏2A.20 Candidate Registry מוצע

```text
SWEEP_TO_FILL_LIMIT {
  category              = ADVANCED_AGGRESSIVE_EXECUTION
  primitive             = LMT
  attribute             = sweepToFill
  routing_requirement   = SMART
  research_role         = RESEARCH_CHALLENGER
  requires_price_bound  = true
  partial_fill_policy   = FRESH_DECISION
  failure_destination   = REDECIDE_OR_RECONCILE
}

MARKET_TO_LIMIT {
  category              = TRANSFORMING_ORDER
  primitive             = MTL
  research_role         = RESEARCH_CHALLENGER
  initial_phase         = MARKET_STYLE
  partial_fill_effect   = TRANSFORM_REMAINDER_TO_LIMIT
  transformed_ttl       = REQUIRED
  failure_destination   = REDECIDE_OR_RECONCILE
}
```

‏השמות הם internal research contracts; הם אינם טענה על enum מדויק בכל API surface.

---

## ‏2A.21 Direct Comparison — שלוש דרכים להתמודד עם Urgency

| Candidate | מה היא מנסה להשיג | מה נשאר בשליטתנו | הסיכון המיוחד |
|---|---|---|---|
| `MARKETABLE_LIMIT_IOC` | Fill מיידי תחום | Bound + IOC semantics | no/partial fill |
| `SWEEP_TO_FILL_LIMIT` | Sweep מהיר של liquidity עד Limit | Bound + local validity | depth/slippage בתוך ה־bound |
| `ADAPTIVE_LIMIT_URGENT` | Broker-managed speed/price search | Bound + TTL + cancel policy | private Signal אינה ידועה ל־Broker |
| `MARKET_TO_LIMIT` | Market-style start + resting remainder | local watchdog לאחר transformation | transformed remainder יכולה להתיישן |

---

## ‏2A.22 Decision Example

‏נניח Opportunity חוקית לאחר 10A, עם:

```text
short remaining signal life
sufficient visible depth within Economic Price Bound
high missed-move cost
fresh market data
```

‏מחקר יכול להשאיר survivors כגון:

```text
MARKETABLE_LIMIT_IOC
SWEEP_TO_FILL_LIMIT
ADAPTIVE_LIMIT_URGENT
```

‏הבחירה אינה נעשית לפי השם "הכי מהיר", אלא לפי evidence של useful-fill latency, execution cost ו־post-fill markout.

---

## ‏2A.23 Counterexample

‏נניח ש־MTL קיבלה Partial Fill, ואז:

```text
signal = INVALIDATED
remainder = still working as Limit
```

‏טעות:

```text
initial market phase is over
=> nothing to do
```

‏התגובה הקנונית:

```text
partial fill fact
→ update position/protection
→ identify transformed remainder
→ fresh decision
→ cancel/reconcile remainder if intent no longer valid
```

---

## ‏2A.24 Acceptance Tests

```text
1. Sweep-to-Fill never violates Economic Price Bound.
2. Sweep partial fill updates position before any retry decision.
3. Sweep capability failure does not auto-fallback to unbounded Market.
4. Sweep cancel-pending quantity remains potentially executable.
5. MTL partial fill is recognized as lifecycle transformation.
6. MTL transformed remainder receives application_order_ttl.
7. Signal invalidation after MTL transformation triggers fresh cancel/reconcile decision.
8. Transformed remainder is included in potential exposure.
9. Reconnect discovers transformed MTL remainder before READY.
10. Same snapshot + same policy produces same candidate decision.
```

---

## ‏2A.25 Practitioner Insight

> ‏`ENGINE RULE` — Order מתקדמת אינה יוצרת Alpha. היא רק משנה את הדרך שבה אנחנו מנסים לממש Alpha שכבר קיימת.

‏`Sweep-to-Fill` יכולה להיות מהירה יותר במימוש liquidity קיימת, אבל גם לחשוף אותנו ליותר depth consumption.

‏`MTL` יכולה לעצור chase של remainder, אבל היא עושה זאת על ידי שינוי lifecycle — ולכן היא מוסיפה state שצריך לנהל.

‏המדד המקצועי אינו:

```text
which order sounds smartest?
```

‏אלא:

```text
which behavior improves opportunity-level execution outcome
under the same signal, same market snapshot and same risk bounds?
```

---

# ‏מקורות רשמיים לחלק 2A

- ‏IBKR — Order Types and Algos / `Sweep-to-Fill` / `Market-to-Limit`: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR API — Order Types / `Sweep-to-Fill`: <https://www.interactivebrokers.com/campus/?p=195739&post_type=ibkr-api-page>
- ‏IBKR TWS API — `Order` reference / `sweepToFill`: <https://www.interactivebrokers.com/docs/tws-api/ref/order>

---

# ‏Checkpoint — סוף חלק 2A

‏הוספנו שתי משפחות execution מתקדמות שחסרו בקורס. `Sweep-to-Fill` היא aggressive bounded behavior שמנסה לגשת במהירות לנזילות במספר רמות; `Market-to-Limit` היא Transforming Order שמתחילה market-style ועל Partial Fill הופכת את ה־remainder ל־Limit במחיר ה־Fill. שתיהן נשארות `RESEARCH_CHALLENGER` עד evidence, telemetry ו־capability validation מתאימים.

# ‏חלק 2B — Aggressive Execution Decision Guide: ‏`IOC`, ‏Sweep, ‏Adaptive ו־`MTL`

> ‏הפרק הזה הוא שכבת Decision מעל Parts 2 ו־2A. הוא אינו מוסיף Order Types חדשים; הוא משווה ארבע דרכים שונות לפתור בעיית urgency תחת מגבלות מחיר, זמן ו־state.
>
> ‏העיקרון: לא שואלים "איזו פקודה הכי מהירה?" אלא **איזו Candidate מבטאת נכון את ה־Intent הנוכחי, ומה קורה ל־remainder ול־control אחרי submit**.

---

## ‏2B.1 ארבע Candidates שנראות דומות — אבל אינן פותרות אותה בעיה

```text
MARKETABLE_LIMIT_IOC
SWEEP_TO_FILL_LIMIT
ADAPTIVE_LIMIT_URGENT
MARKET_TO_LIMIT
```

‏כולן יכולות להיות רלוונטיות כאשר latency ו־missed-move cost חשובים, אבל הן שונות בארבע שאלות:

```text
Who controls the execution path?
How long may the order remain executable?
What happens to unfilled remainder?
How deterministic are the semantics from the local engine's point of view?
```

---

## ‏2B.2 Comparison Matrix

| Candidate | Control owner | Immediate attempt | Remainder semantics | Bound | תפקיד אצלנו |
|---|---|---:|---|---|---|
| `MARKETABLE_LIMIT_IOC` | Client decides price + IOC | כן | unfilled remainder canceled | `Economic Price Bound` via Limit | `CORE_BASELINE` |
| `SWEEP_TO_FILL_LIMIT` | Client bound + broker/router sweep | כן, sweep-oriented | לפי TIF/concrete plan | `Economic Price Bound` via Limit | `RESEARCH_CHALLENGER` |
| `ADAPTIVE_LIMIT_URGENT` | Broker Algo manages execution tactics | broker-managed urgent | broker-managed until terminal/cancel/TTL | explicit Limit/bound policy | `RESEARCH_CHALLENGER` |
| `MARKET_TO_LIMIT` | Broker executes transformation lifecycle | market-style initial phase | partial remainder becomes resting Limit | remainder price derives from initial fill semantics | `RESEARCH_CHALLENGER / SPECIALIST` |

> ‏`ENGINE RULE` — ארבעתן אינן values של אותו Broker enum. זו שכבת `Behavior Candidate`/execution family להשוואת החלטה.

---

## ‏2B.3 `MARKETABLE_LIMIT_IOC` — Decision Card

### ‏What

```text
LMT priced marketable
+
IOC
```

‏ניסיון לקחת liquidity זמינה עכשיו, עד `Economic Price Bound`, בלי להשאיר remainder נחה.

### ‏Why

‏כדי לקבל semantics מקומית פשוטה:

```text
try now
accept allowed fills
kill remainder
re-decide
```

### ‏When

‏מתאימה במיוחד כאשר:

```text
remaining signal life is very short
stale remainder is unacceptable
Economic Price Bound is known
partial/no-fill is acceptable
fresh re-decision is cheap
```

### ‏Why Not

‏היא עלולה להחזיר `NO_FILL` או Partial Fill בדיוק לפני שנזילות חדשה מגיעה. היא גם אינה מנצלת broker-managed scheduling מעבר לניסיון המיידי.

### ‏Closest Alternative

`SWEEP_TO_FILL_LIMIT` כאשר רוצים intent אגרסיבי מפורש יותר מול liquidity במספר levels/destinations.

### ‏Main Failure Mode

```text
zero/partial fill
→ signal still alive
→ naive code blindly retries
→ hidden chase / duplicate exposure
```

### ‏For Our Engine

```text
CORE_BASELINE
```

‏היתרון המרכזי הוא לא superiority, אלא simplicity של lifecycle ו־telemetry.

---

## ‏2B.4 `SWEEP_TO_FILL_LIMIT` — Decision Card

### ‏What

‏`LMT` עם sweep behavior במסלול התומך, שנועדה לצרוך במהירות liquidity זמינה על פני successive levels/destinations עד ה־Limit.

### ‏Why

‏כאשר הכמות גדולה מה־top-of-book או liquidity מפוזרת, sweep מפורש יכול להתאים יותר מניסיון אגרסיבי פשוט ברמה אחת.

### ‏When

```text
urgency is high
size is meaningful relative to top-of-book
visible/executable liquidity exists within Economic Price Bound
multi-level / multi-destination access is useful
capability is validated
```

### ‏Why Not

‏Order קטנה מאוד עשויה לא להרוויח מספיק מהמורכבות. בנוסף execution telemetry, venue effects ו־depth consumption נעשים מורכבים יותר.

### ‏Closest Alternative

`MARKETABLE_LIMIT_IOC` כאשר רוצים ניסיון מיידי פשוט יותר עם remainder חד־משמעית.

### ‏Main Failure Mode

```text
sweep consumes several levels
average fill remains inside bound
but execution cost destroys remaining edge
```

### ‏For Our Engine

```text
RESEARCH_CHALLENGER
```

---

## ‏2B.5 `ADAPTIVE_LIMIT_URGENT` — Decision Card

### ‏What

‏Behavior Candidate שמשתמשת ב־Broker Algo כדי לנהל חלק מה־execution tactics תחת Limit/constraints שהוגדרו מראש.

### ‏Why

‏כדי להאציל לברוקר את שאלת timing/aggressiveness הטקטית במקום לבצע client-side chase בכל שינוי Quote.

### ‏When

```text
signal still has enough life for broker-managed tactics
immediate-or-cancel is too rigid
client still owns Economic Price Bound and local TTL
broker capability is production-eligible
```

### ‏Why Not

‏ה־Broker אינה יודעת את private Signal half-life שלנו, opportunity supersession או local risk context אלא אם ביטלנו/שינינו את Order בעצמנו.

### ‏Closest Alternative

`MARKETABLE_LIMIT_IOC` כאשר local engine רוצה ניסיון קצר ודטרמיניסטי יותר; `SWEEP_TO_FILL_LIMIT` כאשר המטרה המפורשת היא immediate available liquidity sweep.

### ‏Main Failure Mode

```text
broker-managed order remains economically legal by broker terms
while local signal has already decayed
```

### ‏For Our Engine

```text
RESEARCH_CHALLENGER
```

> ‏`ENGINE RULE` — Broker Algo מנהלת `HOW`; ה־client עדיין אחראי ל־`WHETHER` ה־Intent חי.

---

## ‏2B.6 `MARKET_TO_LIMIT` — Decision Card

### ‏What

‏Transforming Order: מתחילה market-style; אם יש Partial Fill, remainder יכולה להפוך ל־Limit במחיר ה־execution הראשוני לפי broker semantics.

### ‏Why

‏כדי להתחיל בניסיון execution מהיר ואז לעצור את ה־remainder מלרדוף אחרי שוק מתרחק.

### ‏When

```text
initial urgency is useful
resting remainder after first fill is acceptable
application can observe/reconcile transformation
signal life is long enough for remainder management
```

### ‏Why Not

‏ל־Signal קצר היא עלולה ליצור בדיוק את מה שאיננו רוצים: remainder נחה לאחר שה־state השתנה.

### ‏Closest Alternative

`MARKETABLE_LIMIT_IOC` אם אסור להשאיר remainder; `ADAPTIVE_LIMIT_URGENT` אם רוצים broker-managed execution לאורך זמן בלי transformation rule כזה.

### ‏Main Failure Mode

```text
partial fill
→ remainder transforms to Limit
→ signal expires
→ local engine forgets that transformed remainder is still executable
```

### ‏For Our Engine

```text
RESEARCH_CHALLENGER / SPECIALIST
```

---

## ‏2B.7 אותו Signal — שלושה תרחישים שונים

‏נניח שבכל שלושת המקרים Strategy כבר עברה 10A, הכיוון זהה וה־`Economic Price Bound` זהה. ההבדל הוא רק state הביצוע.

### ‏Scenario A — `remaining_signal_life = 300ms`

```text
small order
fresh quote
stale remainder unacceptable
```

‏Survivor טבעי למחקר:

```text
MARKETABLE_LIMIT_IOC
```

‏למה:

```text
very short life
immediate attempt
remainder dies instead of resting
```

‏למה האחרות נחלשות:

- ‏`Adaptive Urgent` עלולה לקבל מעט מדי זמן כדי שה־delegated behavior יוסיף ערך.
- ‏Sweep עשויה להיות unnecessary אם הכמות קטנה ביחס לנזילות.
- ‏MTL עלולה ליצור remainder resting כשה־Signal כבר פגה.

---

## ‏2B.8 Scenario B — `remaining_signal_life = 2s`

```text
moderate size
market remains healthy
client can enforce local TTL
```

‏Survivors למחקר יכולים להיות:

```text
MARKETABLE_LIMIT_IOC
ADAPTIVE_LIMIT_URGENT
```

‏כאן השאלה אינה "מי יותר מתקדמת", אלא:

```text
Does broker-managed execution improve useful-fill rate / price
within the same signal lifetime and Economic Price Bound?
```

‏אם לא — complexity אינה מוצדקת.

---

## ‏2B.9 Scenario C — `order_size > top_of_book_depth`

```text
significant visible depth exists across multiple levels
all relevant levels remain inside Economic Price Bound
urgency is high
```

‏כאן `SWEEP_TO_FILL_LIMIT` יכולה לשרוד כ־Challenger משמעותית לצד `MARKETABLE_LIMIT_IOC` ו־`Adaptive Urgent`.

‏ה־Decision Questions:

```text
How much quantity is executable now within bound?
How fragmented is that liquidity?
What is the expected VWAP within bound?
What is the cost of no-fill / partial fill?
How much control do we want to delegate?
```

---

## ‏2B.10 Scenario D — initial fill useful, remainder may rest briefly

‏אם ה־Intent אומר:

```text
get an initial position quickly
but do not chase the remainder upward after first fill
```

‏`MARKET_TO_LIMIT` הופכת conceptually relevant.

‏אבל רק אם:

```text
transformed remainder is observable
application_order_ttl exists
partial fill creates fresh decision
position/protection is updated immediately
```

---

## ‏2B.11 Direct Elimination Questions

‏לפני ranking, נבטל Candidates שלא מתאימות:

```text
Must remainder disappear immediately?
YES -> eliminate MTL; usually eliminate non-IOC working paths

Is order tiny relative to executable top-of-book liquidity?
YES -> Sweep may add little value

Is remaining signal life too short for delegated tactics?
YES -> eliminate Adaptive

Can a transformed resting remainder be managed safely?
NO -> eliminate MTL

Is Economic Price Bound unknown or stale?
YES -> eliminate all bounded aggressive entry candidates; return to 10A
```

> ‏`ENGINE RULE` — קודם `filter survivors`, אחר כך compare/rank. Candidate חזקה בממד אחד אינה מפצה על violation של Gate.

---

## ‏2B.12 `Fallback` אינה Ladder קבועה

‏אסור לקודד:

```text
IOC failed
→ Sweep
→ Adaptive
→ Market
```

‏זה hidden escalation.

‏ה־flow הקנוני:

```text
outcome/failure fact
→ update state
→ fresh 10A gates
→ rebuild survivors
→ choose again
```

‏ייתכן שה־Decision החדשה תהיה:

```text
same candidate
another candidate
smaller size
NO_TRADE
DEFER
```

---

## ‏2B.13 Partial Fill משנה את הבעיה

‏בכל ארבע המשפחות:

```text
partial fill
!=
continue original intent mechanically
```

‏לאחר Partial Fill יש עכשיו:

```text
new reconciled position
new remaining quantity
new protection responsibility
new capital/exposure state
less remaining signal life
possibly different exit feasibility
```

‏לכן remainder עוברת fresh Decision.

‏ב־MTL יש בנוסף lifecycle transformation של remainder; ב־IOC ה־remainder אינה אמורה להישאר working; ב־Sweep/Adaptive צריך לבדוק concrete broker state.

---

## ‏2B.14 Counterexample — “Adaptive היא תמיד טובה יותר כי היא חכמה יותר”

‏נניח:

```text
signal life at decision = 250ms
order qty = small
top-of-book depth = sufficient
Economic Price Bound = tight
```

‏אם `MARKETABLE_LIMIT_IOC` יכולה לבצע את הניסיון כולו מיד ולסיים remainder, delegated sophistication יכולה להיות חסרת ערך ואף להגדיל state/lifecycle complexity.

‏כלומר:

```text
more sophisticated order
!=
better fit
```

---

## ‏2B.15 Counterexample — “Sweep עדיפה כי היא מוצאת יותר liquidity”

‏נניח שה־Sweep מצליחה למלא 100% אך צורכת כמה levels עד ה־bound, בעוד IOC מילאה רק 60% במחיר טוב יותר.

‏אין מנצחת בלי למדוד:

```text
opportunity-level net edge
post-fill markout
unfilled opportunity cost
exit feasibility
```

‏Fill Rate לבדה אינה objective function.

---

## ‏2B.16 Counterexample — “MTL פותרת slippage”

‏MTL אינה מבטיחה מחיר טוב; היא משנה את ה־lifecycle של remainder לאחר fill ראשוני.

‏אם ה־fill הראשון עצמו יקר או adverse, remainder שנחה במחיר הזה אינה מתקנת את הבעיה.

---

## ‏2B.17 Metrics להשוואה הוגנת

```text
useful_fill_rate
fill_ratio
zero_fill_rate
time_to_first_fill
time_to_useful_fill
avg_fill_price
worst_fill_price
decision_slippage
arrival_slippage
visible_depth_consumed
post_fill_markout
missed_move_if_unfilled
stale_remainder_incidents
cancel_latency
reconciliation_incidents
net_edge_after_execution
```

‏ל־MTL נוסיף transformation metrics; ל־Sweep venue/level metrics; ל־Adaptive broker-algo lifecycle metrics.

---

## ‏2B.18 Decision Record מומלץ

```text
AggressiveExecutionDecision {
  snapshot_id
  signal_remaining_life_ms
  requested_qty
  visible_qty_within_bound
  expected_vwap_within_bound
  economic_price_bound
  survivors[]
  eliminated[] { candidate, reason_code }
  selected_candidate
  closest_alternative
  decision_reason
  application_order_ttl
  failure_destination
}
```

‏כך אפשר לבצע Replay ולהסביר למה Candidate מסוימת נבחרה בלי להסתמך על intuition בדיעבד.

---

## ‏2B.19 Acceptance Tests

```text
1. Candidate with stale/unknown Economic Price Bound is eliminated.
2. MARKETABLE_LIMIT_IOC never leaves intended remainder working after IOC terminal semantics.
3. Adaptive capability failure triggers fresh decision, not automatic escalation.
4. Sweep is not selected solely because order size exceeds top-of-book; depth must be useful within bound.
5. MTL is eliminated when resting transformed remainder is forbidden by policy.
6. Partial fill always creates a fresh decision state.
7. More aggressive fallback never occurs without fresh economics.
8. Same snapshot + same policy yields the same survivor set and selected candidate.
9. Fill Rate alone cannot determine winner in research evaluation.
10. Candidate lifecycle state (`DISABLED/SHADOW_ONLY/LIVE_ENABLED`) remains separate from broker capability enablement.
```

---

## ‏2B.20 Practitioner Insight

> ‏`ENGINE RULE` — Urgency אינה Order Type.

‏ה־Professional Decision היא לפרק urgency ל־constraints:

```text
How much time remains?
How much quantity must execute now?
How much price concession is economically legal?
May remainder rest?
Who may manage repricing/timing?
What happens after partial fill?
```

‏רק לאחר מכן בוחרים Candidate.

---

# ‏Checkpoint — סוף חלק 2B

‏יצרנו שכבת Decision אחידה ל־`MARKETABLE_LIMIT_IOC`, ‏`SWEEP_TO_FILL_LIMIT`, ‏`ADAPTIVE_LIMIT_URGENT` ו־`MARKET_TO_LIMIT`. לכל Candidate יש עכשיו `What / Why / When / Why Not / Closest Alternative / Main Failure Mode / For Our Engine`, ונוספו ארבעה scenarios שמראים כיצד אותו Signal יכול להשאיר Survivors שונים לפי signal life, quantity, depth ו־remainder policy.

# ‏חלק 3 — Time / Fill Policy ופקודות מיידיות

> ‏לפי ה־taxonomy הקנונית ב־`00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md`, ‏`DAY/GTC/GTD/IOC/FOK` שייכים לשכבת Time / Fill Policy; ‏`AON` ו־`Minimum Quantity` הם Fill/Quantity constraints. הם אינם Broker Order Primitives מקבילים ל־`Market` או `Limit`.

## ‏3.1 `Time in Force` הוא חלק מהאלגוריתם, לא שדה מנהלתי

‏ה־`TIF` עונה על שאלה שונה מ־Broker Order Primitive:

```text
Broker Order Primitive = מהו מנגנון המחיר/ביצוע הבסיסי
TIF / Fill Policy      = כמה זמן ובאילו תנאי fill הפקודה רשאית לעבוד
```

‏במנוע קצר־טווח יש לפחות ארבעה clocks נפרדים:

```text
signal_ttl
application_order_ttl
broker_tif
working_order_age
```

‏לדוגמה:

```text
signal_ttl             = 3.0 s
application_order_ttl  = 350 ms
broker_tif             = DAY
working_order_age      = 120 ms
```

‏זו אינה סתירה. ה־Broker רשאי להחזיק את הפקודה כ־`DAY`, אבל המנוע שלנו מחליט שאם לא קיבלנו את ההתנהגות הרצויה בתוך 350 מילישניות — אנחנו כבר לא רוצים את attempt הזה.

> ‏`ENGINE RULE` — `broker_tif`, ‏`signal_ttl`, ‏`application_order_ttl` ו־`working_order_age` הם מושגים שונים. המילה `TTL` בלי qualifier אינה vocabulary קנונית.

---

## ‏3.2 `DAY` — ברירת מחדל טכנית, לא החלטה אסטרטגית

‏`DAY` אומר שהפקודה תקפה לסשן המסחר הרלוונטי של אותו יום, אלא אם התמלאה או בוטלה קודם.

‏למסחר ידני זו ברירת מחדל טבעית בהרבה מקרים.

‏לרובוט שלנו היא מסוכנת אם מתייחסים אליה כאילו משמעותה:

```text
valid while my signal is valid
```

‏היא לא.

‏אם Signal חי 700 מילישניות והפקודה היא `DAY`, אז ללא ביטול אפליקטיבי היא יכולה להישאר עובדת הרבה אחרי שהסיבה המקורית לעסקה נעלמה.

### ‏מתי `DAY` כן שימושית לנו?

‏כאשר אנחנו רוצים Order רגילה שהמנוע עצמו מנהל לה `application_order_ttl` קצר, לדוגמה:

```text
place passive DAY limit
wait 250 ms
re-evaluate signal
cancel if stale
```

‏כאן `DAY` היא מעטפת תפעולית בלבד; ה־policy האמיתי נמצא אצלנו.

---

## ‏3.3 `GTC` — פקודה שחיה עד Fill או Cancel

‏`GTC` — ‏`Good-Til-Canceled` — ממשיכה לעבוד עד שהיא מתבצעת או מבוטלת, בכפוף לכללי הברוקר/בורסה ולחריגים כגון corporate actions.

‏זו תכונה מצוינת לאסטרטגיות שבהן הכוונה עצמה יכולה להישאר תקפה לאורך זמן.

‏אבל אצלנו, Signal של שניות יוצר כמעט את ההפך:

```text
very short information half-life
+
very long broker_tif
=
stale-order risk
```

‏לכן `GTC` אינה baseline טבעי ל־Entry קצר.

### ‏איפה בכל זאת אפשר לפגוש אותה?

- ‏Orders תפעוליות ארוכות שאינן קשורות ישירות ל־momentum signal.
- ‏מנגנוני הגנה מסוימים כאשר deliberately רוצים שהפקודה תשרוד session boundaries.
- ‏תרחישים עתידיים שבהם strategy אחרת חיה זמן רב.

‏אבל כל שימוש כזה צריך להיות מופרד לחלוטין מ־short-lived entry intent.

---

## ‏3.4 `GTD` — תאריך/שעה שהברוקר מנהל

‏`GTD` — ‏`Good-Til-Date/Time` — מאפשר להגדיר expiration time שבו פקודה שלא התמלאה אמורה להפסיק לעבוד.

‏זה נשמע כאילו זו בדיוק התשובה ל־Signal קצר, אבל צריך להיזהר.

‏אם אנחנו רוצים TTL של מאות מילישניות, מנגנון expiration ברמת Broker/UI אינו בהכרח הכלי הנכון או המדויק מספיק לכל use case.

‏`GTD` מתאים יותר כאשר רוצים לומר:

```text
this order is valid until a known broker-clock time
```

‏למשל עד רגע מסוים בסשן.

‏לעומת זאת, אצלנו הרבה פעמים נכון יותר:

```text
submit
start local monotonic timer
observe fills and market state
cancel/reconcile when application_order_ttl expires
```

‏כלומר `GTD` הוא capability חשוב, אבל אינו מחליף application-level lifetime.

---

## ‏3.5 `IOC` — בדיוק השאלה: מה ניתן לבצע עכשיו?

‏`IOC` — ‏`Immediate or Cancel` — היא Time / Fill Policy שאומרת:

> ‏נסה לבצע מיד את מה שניתן; כל יתרה שלא התמלאה מיידית מתבטלת.

‏נניח:

```text
Ask:
40 @ 20.00
30 @ 20.01
200 @ 20.05
```

‏ואנחנו שולחים:

```text
BUY 100 LMT 20.01 IOC
```

‏אם המצב עדיין קיים כאשר הפקודה ניתנת לביצוע, אפשר לקבל:

```text
40 @ 20.00
30 @ 20.01
70 filled
30 canceled
```

‏החלק החשוב הוא לא רק המהירות. הוא שה־remainder אינו נשאר מאחור כ־resting order.

---

## ‏3.6 `MARKETABLE_LIMIT_IOC` — Behavior Candidate, לא Order Primitive חדש

‏השילוב נותן semantics מאוד נקיות:

```text
Limit primitive
+
marketable price at current snapshot
+
IOC time/fill policy
+
Economic Price Bound
```

‏ברמת המנוע נשתמש בשם Behavior Candidate:

```text
MARKETABLE_LIMIT_IOC
```

‏שמשמעותו:

```text
price bound
+
try now
+
accept allowed partial fill
+
do not leave stale remainder
```

‏לדוגמה:

```text
signal says BUY now
entry_max_price = 50.04
requested qty = 200
```

‏במקום:

```text
BUY 200 LMT 50.04 DAY
```

‏שעלולה להפוך אחרי partial fill לפקודה נחה, אפשר לחקור:

```text
BUY 200 LMT 50.04 IOC
```

‏ואז אחרי התוצאה:

```text
filled_qty = 73
remaining = 0 because remainder canceled
```

‏המנוע מחליט מחדש מה לעשות עם ה־127 שלא נכנסו — מתוך Market State חדש, ולא מפני שפקודה ישנה עדיין יושבת שם.

---

## ‏3.7 למה `IOC` עדיפה לפעמים על `DAY + cancel after 200ms`

‏שתי האפשרויות אינן זהות.

### ‏`DAY + client cancel`

```text
submit
order becomes working
wait application_order_ttl
send cancel
wait for cancel acknowledgement
```

‏בחלון הזה Order יכולה:

- ‏להישאר נחה.
- ‏לקבל Fill מאוחר יותר.
- ‏להיכנס ל־Fill-vs-Cancel race.
- ‏להמשיך להיות חשופה לשוק עד שהביטול אכן אפקטיבי.

### ‏`IOC`

‏ה־intent הוא מראש:

```text
execute immediately if possible
cancel unfilled remainder immediately
```

‏אין צורך שהמנוע ינסה לייצר בעצמו semantics של immediate expiry בעזרת timer + cancel.

### ‏היתרון הרובוטי

‏אנחנו מעבירים חלק מה־state machine ל־Broker/Venue path ומקטינים את משך חיי ה־stale remainder.

‏אבל עדיין חייבים לקבל ולפרש execution reports; `IOC` אינה פוטרת אותנו מ־Partial Fill accounting.

---

## ‏3.8 `IOC` אינה אומרת `ALL OR NONE`

‏זו אחת הטעויות הנפוצות ביותר.

‏`IOC` אומרת:

```text
partial fill now = acceptable
remainder later = not acceptable
```

‏כלומר:

```text
requested = 100
available now = 37
result = 37 filled + 63 canceled
```

‏אם 37 מניות אינן Position שימושית מבחינת economics, צריך להגדיר זאת בנפרד.

‏`IOC` לבדה לא יודעת מהו `minimum useful fill` שלנו.

---

## ‏3.9 הסיכון של `IOC`: Partial Position שאולי לא רצינו

‏היתרון שלה הוא גם הסיכון שלה.

‏נניח שה־Strategy תוכננה סביב 500 מניות, אבל רק 41 זמינות בתוך bound:

```text
BUY 500 LMT X IOC
=> 41 filled
=> 459 canceled
```

‏עכשיו יש לנו Position של 41.

‏המנוע חייב להחליט מראש:

```text
accept_any_partial?
minimum_useful_fill?
scale_exit_to_actual_fill?
retry_remainder?
re-evaluate_signal_before_retry?
```

‏אסור שההחלטות האלה יוולדו אחרי האירוע.

---

## ‏3.10 `FOK` — כל הכמות עכשיו או כלום

‏`FOK` — ‏`Fill or Kill` — מקשיחה את הדרישה:

```text
full quantity
immediately
or
zero
```

‏בניגוד ל־`IOC`, partial fill אינו התוצאה הרצויה.

‏תיאור רעיוני:

```text
requested = 100
available immediately = 100
=> full fill
```

‏אבל:

```text
requested = 100
available immediately = 99
=> no fill / cancel
```

‏זה כלי חזק כאשר partial position היא בעיה אמיתית.

---

## ‏3.11 למה `FOK` לרוב פחות טבעית למומנטום שלנו

‏אצל מנוע שמנסה לתפוס Signal קצר, `FOK` יכולה להגדיל מאוד את no-fill rate.

‏אם 80% מהכמות זמינה עכשיו ועדיין יש Edge, `IOC` יכולה לקחת אותה.

‏`FOK` תוותר על הכול אם לא ניתן להשלים full size באופן מיידי.

‏לכן צריך לשאול:

> ‏האם Position חלקית באמת חסרת ערך, או שהיא פשוט פחות גדולה ממה שתכננו?

‏במקרה שלנו, ברוב עסקאות מניה קצרות, סביר יותר לבדוק `IOC + minimum useful fill policy` מאשר לדרוש full-size atomicity בכל מצב.

‏זו `RESEARCH HYPOTHESIS`, לא כלל מוחלט.

---

## ‏3.12 פרט קריטי ב־IBKR: `FOK` אינה כרגע כלי כללי למניות

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏בדף Order Types הנוכחי של IBKR, `Fill or Kill` מתועד עבור:

```text
Products: Options Only
Regions: US Products Only
Platforms: TWS, IBKR Desktop
Routing: Smart, Directed
```

‏לכן עבור מנוע המניות האמריקאיות שלנו אסור לתכנן ארכיטקטורה שמניחה ש־`FOK` היא capability כללית של stock orders ב־IBKR.

‏זו דוגמה מצוינת לעיקרון:

> ‏מושג קיים בעולם המסחר אינו אומר שה־Broker שלנו מאפשר אותו עבור המוצר שלנו.

---

## ‏3.13 `AON` — Fill/Quantity Constraint, לא `TIF`

‏`AON` — ‏`All or None` — פותרת בעיה אחרת מ־`FOK`.

‏הדרישה העקרונית היא:

```text
no partial fill
```

‏אבל הפקודה יכולה להמשיך לעבוד עד שהכמות המלאה זמינה, לפי ה־Broker Order Primitive וה־`broker_tif`.

‏כלומר:

```text
FOK = full size + immediate time/fill policy
AON = all-or-none quantity/fill constraint, waiting may still be allowed
```

‏הבדל קטן בניסוח — הבדל עצום בהתנהגות.

---

## ‏3.14 למה `AON` מסוכנת במיוחד לסיגנל קצר

‏נניח שה־Signal היה חזק בזמן 0:

```text
BUY 500 AON LMT 20.00
```

‏אבל רק 300 מניות זמינות.

‏הפקודה אינה מתבצעת חלקית.

‏אחרי שתי שניות מופיעות 500 מניות — אבל ה־Signal כבר מת.

‏אם לא ניהלנו `application_order_ttl` קצר, דווקא התכונה שנועדה להגן עלינו מ־Partial Fill עלולה לגרום ל־**stale full fill**.

‏לכן AON אצלנו דורשת לפחות:

```text
explicit signal_ttl
application_order_ttl
cancel policy
reconciliation after cancel
```

---

## ‏3.15 פרט מתקדם ב־IBKR: `AON` יכולה להיות Broker-Simulated

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מתעדת `AON` עבור מניות, ETF, Options, Bonds ו־EFPs בארה״ב, דרך `SMART`, וב־`TWS`, ‏`IBKR Desktop`, ‏`IBKR Mobile` ו־`Client Portal`.

‏אבל כאשר ה־primary exchange אינו תומך ב־AON באופן Native, IBKR יכולה **להחזיק את הפקודה ולדמות את ההתנהגות**.

‏למניות אמריקאיות, התיעוד הנוכחי אומר שבמצב simulated נדרש שה־NBBO יתאים ל־Limit ושגודל ה־NBBO יהיה לפחות:

```text
order size + 1000 shares
```

‏לפני ניסיון הביצוע.

‏לכן `AON` אינה רק "checkbox שמונע partial". היא יכולה לשנות:

- ‏מתי Order בכלל נעשית eligible.
- ‏איפה ה־state שלה מוחזק.
- ‏את fill probability.
- ‏את latency עד ניסיון Fill.

‏עבור מנוע קצר, זה caveat משמעותי מאוד.

---

## ‏3.16 `Minimum Quantity` — Fill/Quantity Constraint עם רף מינימלי

‏`Minimum Quantity` אומרת בקירוב:

> ‏אל תבצע Fill קטן מדי; אני רוצה שלפחות כמות מסוימת תהיה זמינה.

‏היא יכולה להיות יותר גמישה מ־AON.

‏לדוגמה רעיונית:

```text
requested_qty = 500
min_qty = 200
```

‏המטרה אינה לדרוש בהכרח 500 בבת אחת, אלא למנוע Fill זעיר שאינו כלכלי.

‏אבל התמיכה תלויה Product/Venue/Broker path, ולכן אסור לבנות עליה בלי capability check.

‏ב־`TWS API` קיים שדה:

```text
minQty
```

‏וב־Order reference הוא מוגדר כזיהוי של minimum quantity order behavior.

---

## ‏3.17 `AON` מול `MinQty` — מה ההבדל הרעיוני למנוע

‏אפשר לחשוב כך:

```text
AON:
minimum acceptable execution = total requested quantity
```

‏לעומת:

```text
MinQty:
minimum acceptable execution chunk < total requested quantity
```

‏אם כל Fill קטן מ־100 מניות אינו שווה לנו בגלל commissions/exit economics, אבל 100–500 כן שימושי — `MinQty` היא רעיון טבעי יותר מ־AON.

‏אם Position של 499 מתוך 500 אינה מקובלת מבחינה לוגית — AON/FOK מתאימות יותר רעיונית.

‏אצלנו בדרך כלל הבעיה היא **economic minimum**, לא atomic portfolio construction, ולכן חשוב למדוד לפני שבוחרים semantics קשיחה.

---

## ‏3.18 ארבע שכבות שונות שאסור לערבב

| מנגנון | שכבה קנונית | השאלה שהוא עונה עליה |
|---|---|---|
| `DAY/GTC/GTD` | Time policy / `broker_tif` | ‏כמה זמן Order רשאית להישאר חיה? |
| `IOC` | Immediate time/fill policy | ‏מה אפשר לבצע מיד, ואז לבטל remainder? |
| `FOK` | Immediate full-fill policy | ‏האם אפשר לבצע את כל הכמות מיד? |
| `AON` | Fill/quantity constraint | ‏האם אפשר להימנע מכל Partial Fill גם אם צריך להמתין? |
| `MinQty` | Fill/quantity constraint | ‏מהו Fill קטן מדי מכדי שנרצה לקבל אותו? |

‏לכן אין משמעות לשאלה "איזו מהן הכי טובה" בלי להגדיר קודם את הבעיה ואת השכבה.

---

## ‏3.19 החלטה רובוטית נכונה מתחילה ב־Fill Policy

‏לפני שבוחרים materialization קונקרטי, המנוע צריך לענות:

```text
Do we accept partial fills?
If yes, what is the minimum useful fill?
Do we accept waiting?
If yes, for how long?
Do we want unfilled remainder to rest?
Do we want a fresh re-evaluation after every attempt?
```

‏מכאן אפשר לתרגם:

```text
accept partial + now only
=> IOC-compatible candidate

full size + now only
=> FOK conceptually, if supported for product

full size + waiting allowed
=> AON-compatible materialization

partial allowed + short local wait
=> DAY/GTD + application_order_ttl candidate
```

‏זו דרך מקצועית יותר מאשר להתחיל מרשימת Order Types ולחפש למי "יש שם יפה".

---

## ‏3.20 `IOC` כ־execution primitive-like behavior במנוע Event-Driven

‏ברמת המנוע נוח לחשוב על IOC כמו על attempt קצר וסגור:

```text
market state
→ compute Economic Price Bound
→ choose Behavior Candidate
→ materialize LMT + IOC
→ receive fill result
→ update position
→ recompute signal and remaining edge
→ decide next action
```

‏אבל מבחינת taxonomy, ‏`IOC` עדיין Time / Fill Policy — לא Broker Order Primitive.

‏המודל הזה מעניין במיוחד כי כל ניסיון קצר ומוגדר.

‏אין resting remainder שצריך לזכור שעות; כל attempt מסתיים מהר יחסית ב־fill/partial/no-fill ואפשר לבצע re-evaluation.

‏אבל יש מחיר:

- ‏יותר order attempts.
- ‏יותר messages.
- ‏אפשרות ל־rejections/throttling/rate constraints.
- ‏סיכון ל־overtrading אם loop לא מוגבל.
- ‏כל attempt עדיין צריך reconciliation.

‏לכן גם כאן צריך:

```text
max_attempts_per_signal
min_recheck_interval
max_total_filled_qty
Economic Price Bound
signal_ttl
```

---

## ‏3.21 `IOC` אינה פותרת את בעיית Latency

‏אם Quote היה:

```text
Ask = 20.00
```

‏ואנחנו מחשבים:

```text
BUY IOC LMT 20.01
```

‏אבל עד שהפקודה מגיעה:

```text
Ask = 20.04
```

‏ה־IOC יכולה פשוט לחזור עם `0 fill`.

‏זה טוב מבחינת price protection, אבל הפסדנו את ההזדמנות.

‏לכן צריך למדוד בנפרד:

```text
IOC no-fill because bound too tight
IOC no-fill because market moved
IOC no-fill because visible size vanished
IOC partial because depth insufficient
IOC rejection because capability/rules
```

‏אחרת נאשים את ה־TIF במה שהוא בעצם latency או stale-data problem.

---

## ‏3.22 Entry ו־Exit שוב אינם סימטריים

### ‏Entry

‏Behavior עם `IOC` מתאימה מאוד למחקר כאשר:

```text
I want execution now
I accept partial
I reject stale remainder
I have a hard Economic Price Bound
```

### ‏Normal Exit

‏גם כאן `IOC` יכולה להיות שימושית, אך Partial Exit משאיר Position פתוחה ולכן צריך immediate follow-up policy.

### ‏Emergency Exit

‏אם הסיכון העיקרי הוא להישאר בפוזיציה, TIF שמבטלת remainder עלולה להיות פחות מתאימה בלי retry/escalation מהיר.

‏כלומר:

> ‏אותה `IOC` שיפה ב־Entry יכולה להיות רק materialization של attempt ראשון בתוך `FAST_EXIT` או `EMERGENCY_REDUCE`.

‏לדוגמה רעיונית:

```text
exit attempt 1: aggressive capped IOC
if partial and risk remains:
    recompute
    widen within emergency bounds
    retry
```

---

## ‏3.23 מתי `DAY + application_order_ttl` עדיפה דווקא על `IOC`

‏אם רוצים להיות Passive לזמן קצר ולתת לשוק להגיע אלינו, `IOC` אינה מתאימה — כי היא תנסה לבצע מיד ואז תיעלם.

‏למשל:

```text
join Bid
wait up to 300 ms
cancel if not filled
```

‏כאן אנחנו **רוצים resting time קצר**.

‏זה use case טבעי ל־:

```text
PASSIVE application mode
+
PASSIVE_JOIN behavior candidate
+
LMT primitive
+
DAY broker_tif
+
short application_order_ttl
```

‏לכן:

```text
IOC = no waiting
short passive TTL = deliberate waiting
```

‏אלה execution behaviors שונים לחלוטין.

---

## ‏3.24 `GTC` ו־`GTD` ברובוט — סכנת Recovery

‏Order שחיה מעבר לחיי process המקומי דורשת תשומת לב מיוחדת.

‏נניח:

```text
local process crashes
order remains active at broker
process restarts
```

‏אם המנוע מניח שאין Orders כי הזיכרון המקומי ריק, הוא יכול לשלוח Order חדשה ולהכפיל exposure.

‏לכן לכל Order שיכולה לשרוד מעבר ל־session/process lifecycle צריך:

```text
startup reconciliation
open-order download
position reconciliation
ownership identification
unknown-order handling
```

‏זה חשוב במיוחד ל־GTC, אבל העיקרון חל על כל `broker-resident` Order שחיה מעבר לחיבור המקומי.

---

## ‏3.25 `TIF` ו־Outside RTH אינם אותו דבר

‏פקודה יכולה להיות `DAY`, `GTC` וכו', ובנפרד יש כללים לגבי eligibility מחוץ לשעות המסחר הרגילות.

‏לכן המנוע לא ישמור רק:

```text
broker_tif = DAY
```

‏אלא גם session policy מפורשת:

```text
regular_hours_only
allow_outside_rth
pre_market_policy
after_hours_policy
```

‏הסיבה היא שנזילות, spread, routing והתנהגות Order יכולים להשתנות דרמטית בין sessions.

‏במנוע קצר־טווח, session regime הוא חלק מה־execution model ולא feature קוסמטי.

---

## ‏3.26 `IBKR TWS API` — השדות הרלוונטיים

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏ב־Order object של `TWS API` קיימים בין היתר:

```text
tif
allOrNone
minQty
goodTillDate
goodAfterTime
```

‏כלומר הממשק התכנותי מאפשר לייצג את משפחת החלטות הזמן והכמות ברמת Order object.

‏עם זאת:

> ‏עצם קיום השדה ב־API אינו הוכחה שהשילוב הספציפי נתמך בכל Product/Venue/Route ואינו מעביר אותו אוטומטית ל־`PRODUCTION_ENABLED`.

‏לכן ה־engine adapter צריך לטפל גם ב־capability discovery, acceptance evidence וב־broker rejection.

---

## ‏3.27 `Client Portal / Web API` — לא מניחים parity עם `TWS API`

‏בתיעוד ה־Web API הנוכחי, endpoints של Orders חושפים ערכי `tif` כגון `DAY`, ‏`IOC`, ‏`GTC` ועוד לפי endpoint/context, ו־contract rules יכולים להחזיר `tifTypes` נתמכים.

‏זו נקודה ארכיטקטונית חשובה:

```text
TWS API capability set
!= automatically
Web API capability set
```

‏אם בעתיד נבחר Broker Adapter דרך Web API, נבנה capability matrix נפרדת ולא נעתיק assumptions מ־TWS API.

---

## ‏3.28 מטריצת התאמה ראשונית למנוע שלנו

| מנגנון | שכבה | התאמה ראשונית | הסיכון העיקרי |
|---|---|---|---|
| `DAY` + `application_order_ttl` קצר | Time policy + local lifecycle | `High` ל־Passive | ‏Cancel race / stale order אם ה־TTL נכשל |
| `GTC` | Time policy | `Low` ל־Entry מומנטום | ‏stale fills / recovery complexity |
| `GTD` | Time policy | `Medium/Low` ל־core entry | ‏לא תחליף ל־sub-second/second signal TTL |
| `IOC` | Immediate time/fill policy | `High` למחקר אגרסיבי | ‏Partial Position / no-fill |
| `FOK` | Immediate full-fill policy | `Low` למניות שלנו | ‏ב־IBKR כרגע אינו stock baseline; no-fill גבוה |
| `AON` | Fill/quantity constraint | `Low` לרוב Signal קצר | ‏waiting + broker simulation + stale fill risk |
| `MinQty` | Fill/quantity constraint | `Challenger` | ‏support semantics תלויות Venue/Product |

‏זו מטריצת Research, לא configuration סופית ל־Live.

---

## ‏3.29 Recommendation — מה נכנס לגרסה הראשונה של Execution Research

‏למנוע מניות קצר־טווח אפשר להתחיל משלוש משפחות Behavior ברורות:

```text
1. PASSIVE_JOIN
   -> LMT + DAY + short application_order_ttl

2. MARKETABLE_LIMIT_IOC
   -> marketable LMT + IOC + Economic Price Bound

3. AGGRESSIVE_CAPPED attempt
   -> LMT + application-managed retry/exit policy
```

‏ואת הבאים להשאיר כ־Challengers/Advanced עד Evidence:

```text
AON
MinQty
long-lived GTD/GTC behavior
```

‏`FOK` נשאר ידע מקצועי חשוב, אבל לפי support הנוכחי של IBKR אינו candidate בסיסי למנוע המניות שלנו.

‏הסיבה אינה פשטות לשמה. שלושת ה־baseline behaviors מכסים את שלוש השאלות המרכזיות שלנו:

```text
Can I get a better passive fill briefly?
Can I take what is available now without stale remainder?
Can I exit/retry under explicit price and risk bounds?
```

---

## ‏3.30 Telemetry שחייבים להוסיף עבור Time / Fill Policy

‏בנוסף למדדים מחלק 2, נשמור:

```text
broker_tif
application_order_ttl_ms
signal_ttl_ms
working_order_age_ms
all_or_none
min_qty
attempt_number
immediate_fill_qty
canceled_remainder_qty
no_fill_reason
retry_reason
retry_delay_ms
order_terminal_reason
```

‏ומדדים נגזרים:

```text
IOC_fill_rate
IOC_partial_rate
IOC_zero_fill_rate
avg_IOC_fill_ratio
value_of_canceled_remainder
retry_conversion_rate
late_fill_after_cancel_request_rate
stale_fill_rate
partial_position_exit_cost
```

‏רק כך נדע אם IOC באמת עוזרת או פשוט מייצרת הרבה ניסיונות קטנים ורעש.

---

## ‏3.31 Practitioner Secrets — הדברים שקל לפספס

### ‏1. `IOC` היא Time / Fill Policy, לא Price Policy

‏בלי Limit/price bound נכון, עצם ה־IOC לא מגינה על economics.

### ‏2. `IOC` יכולה לשפר state cleanliness

‏היתרון שלה אינו רק latency; היא מפחיתה resting remainder שממשיך לחיות אחרי attempt.

### ‏3. `FOK` ו־`AON` אינן מילים נרדפות — ואינן אותה שכבה

‏`FOK` דורשת full fill מיד; `AON` היא quantity/fill constraint שיכולה לאפשר waiting לפי ה־TIF.

### ‏4. `AON` יכולה להיות Simulated

‏לכן fill behavior אינו בהכרח matching-engine primitive פשוט.

### ‏5. `GTC` מוסיפה Operational Risk

‏כל Order ששורדת process restart הופכת reconciliation לדרישת בטיחות בסיסית.

### ‏6. `DAY` יכולה להיות נכונה גם לסיגנל של 200ms

‏אם `application_order_ttl` אמין, TIF ארוך יותר אינו אומר שהמנוע באמת מתכוון לחכות עד סוף היום.

### ‏7. `MinQty` עונה על שאלה כלכלית חשובה

‏לעיתים הבעיה אינה Partial Fill כשלעצמה אלא Fill קטן מדי מכדי להצדיק commissions, exit cost וניהול Position.

### ‏8. No-fill ב־IOC הוא מידע

‏הוא יכול להעיד על quote fade, latency, bound tightness או insufficient depth — ולכן צריך לסווג אותו, לא רק לספור אותו.

---

# ‏מקורות רשמיים לחלק 3

- ‏IBKR — Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR — All or None: <https://www.interactivebrokers.com/en/trading/orders/aon_2.php>
- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR Web API — Contract rules / supported TIF: <https://www.interactivebrokers.com/docs/web-api/v1/endpoints/contract/find-all-info-and-rules-for-a-given-contract>
- ‏IBKR Web API — Modify Open Order: <https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/modify-open-order>

---

# ‏Checkpoint — סוף חלק 3

‏בחלק הזה הפרדנו בין שכבות שאסור לערבב: `broker_tif`, ‏Fill/Quantity constraints, ‏`application_order_ttl`, ‏`signal_ttl` ו־`working_order_age`. ירדנו לעומק של `DAY`, ‏`GTC`, ‏`GTD`, ‏`IOC`, ‏`FOK`, ‏`AON` ו־`Minimum Quantity`, אבל בלי להציג אותן כאילו כולן Order Types מאותה קטגוריה.

‏המסקנה הראשונית למנוע שלנו היא ש־`MARKETABLE_LIMIT_IOC` היא Behavior Candidate מרכזית ל־aggressive entry קצר, בעוד Passive Entry דורשת דווקא resting time קצר שמנוהל באפליקציה. `AON/FOK` אינן ברירות מחדל למנוע המניות שלנו: הן פותרות בעיות אחרות ועלולות לפגוע ב־fill probability או להוסיף waiting/simulation behavior.

‏החלק הבא יהיה **Liquidity Control** — `Post Only`, ‏`Hidden`, ‏`Reserve/Iceberg`, ‏display size, ‏maker/taker, queue priority ו־order aging — ושם נרד לעומק בשאלה מתי כדאי לרובוט שלנו לספק נזילות, מתי אסור לו בטעות להפוך ל־taker, ומתי הסתרת גודל באמת מועילה.

---

# ‏חלק 4 — Liquidity Control: ‏`Post Only`, ‏`Hidden`, ‏`Reserve/Iceberg` ו־Queue Behavior

> ‏לפי ה־taxonomy הקנונית ב־`00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md`, ‏`Post Only`, ‏`Hidden` ו־`Reserve/Iceberg` הם Liquidity / Display attributes או constraints. הם אינם `Application Execution Mode` בפני עצמם. המנוע בוחר קודם intent ו־Mode, ורק אחר כך מחבר attributes ל־Concrete Broker Order.

## ‏4.1 השאלה האמיתית: האם אנחנו רוצים **לספק** נזילות או **לקחת** נזילות?

‏לפני `Post Only`, ‏`Hidden` או `Iceberg`, צריך להבין שהמנוע מקבל החלטה עמוקה יותר:

```text
Provide liquidity
or
Consume liquidity
```

‏בקנייה לדוגמה:

```text
join Bid / improve Bid
=> usually provide liquidity

cross to Ask
=> consume liquidity
```

‏זו אינה הבחנה אסתטית. היא משנה:

```text
fill probability
fill timing
spread paid/captured
queue exposure
adverse selection
fees/rebates
signal decay
```

‏למנוע שלנו, ש־Edge שלו קטן וחי שניות, כל אחד מהמרכיבים האלה יכול להיות גדול יותר מהרווח שאנחנו מנסים להשיג.

---

## ‏4.2 `Maker` ו־`Taker` הם תיאור של הביצוע, לא זהות קבועה של Order

‏קל לחשוב:

```text
Limit = maker
Market = taker
```

‏אבל זה פשטני מדי.

‏`Limit` שחוצה את ה־Ask יכולה לקחת נזילות. `Limit` שנחה ב־Bid יכולה לספק נזילות. אותה פקודה יכולה אפילו להתחיל אגרסיבית, להתמלא חלקית, ואז remainder שלה יהפוך resting/passive.

‏לכן המנוע צריך לתעד בפועל:

```text
liquidity_intent
was_liquidity_added?
was_liquidity_removed?
venue
fee_or_rebate
```

‏ולא להסיק זאת רק מ־Broker Order Primitive.

---

## ‏4.3 מה `Post Only` מנסה להבטיח

‏`Post Only` היא Liquidity Constraint בסגנון:

> ‏אל תהפוך אותי ל־liquidity taker. אם הייתי מתבצע מיד נגד Order קיימת, טפל בי לפי כללי ה־Venue/Broker במקום לקחת אותה.

‏המטרה יכולה להיות:

- ‏להבטיח שנישאר Passive.
- ‏להימנע מתשלום spread/taker economics במצב שבו התכוונו לספק נזילות.
- ‏למנוע bug שבו price calculation שלנו חצה בטעות את השוק.
- ‏לאכוף Behavior כגון `PASSIVE_POST_ONLY` כאשר passive intent הוא חובה.

> ‏`ENGINE RULE` — `Post Only` אינה Mode קנוני. ‏`PASSIVE` הוא `Application Execution Mode`; ‏`PASSIVE_POST_ONLY` הוא Behavior Candidate; ‏`postOnly=true` הוא attribute/materialization detail.

‏זה שימוש רובוטי חשוב מאוד: `Post Only` יכולה להיות **guardrail**, לא רק כלי למי שעושה Market Making.

---

## ‏4.4 למה `Post Only` מעניינת דווקא אותנו

‏נניח שהמנוע רוצה להצטרף ל־Bid:

```text
Bid = 20.00
Ask = 20.01
```

‏הוא מחשב:

```text
BUY LMT 20.00
```

‏אבל בין החישוב לשליחה ה־Ask יורד ל־20.00.

‏Limit רגילה יכולה להפוך marketable ולהתבצע מיד. אם הכוונה של ה־Mode הייתה `PASSIVE`, קיבלנו execution שונה ממה שתכננו.

‏`Post Only` יכולה, כאשר הנתיב תומך בסמנטיקה המתאימה, למנוע את המעבר השקט הזה מ־maker intent ל־taker execution.

‏מבחינת קוד זה מאפשר invariant שימושי:

```text
if application_execution_mode == PASSIVE
and behavior_candidate == PASSIVE_POST_ONLY:
    never intentionally take displayed liquidity
```

---

## ‏4.5 אבל `Post Only` אינה אומרת "אני אקבל Fill טוב"

‏היא מגינה על **סוג הנזילות**, לא על איכות האסטרטגיה.

‏פקודת Post Only יכולה:

- ‏להידחות או לעבור התאמה לפי כללי Venue/Broker.
- ‏לא להתמלא בכלל.
- ‏להישאר בתור בזמן שהמחיר בורח.
- ‏להתמלא בדיוק כאשר הצד השני נהיה אגרסיבי נגדנו.
- ‏להפוך stale בזמן שה־Signal נחלש.

‏לכן:

```text
post_only_success != profitable_execution
```

‏היא רק אומרת שהצלחנו לשמור על passive intent.

---

## ‏4.6 `Post Only` וה־Venue Semantics

‏אין להניח ש־Post Only מתנהגת זהה בכל Destination.

‏כאשר Order הייתה חוצה את השוק, Venue מסוים יכול לדחות אותה; אחר יכול לבצע price-slide/reprice לפי כללים; Broker יכול להפעיל logic משלו; ובחלק מהנתיבים התכונה כלל לא זמינה.

‏לכן מנוע לא צריך לקודד:

```text
post_only = always rejected if marketable
```

‏אלא:

```text
post_only_behavior = capability_and_route_specific
```

‏ונדרש למדוד `reject/reprice/ack` בפועל.

---

## ‏4.7 `Queue Priority` — מחיר זהה אינו מעמד זהה

‏נניח:

```text
Bid = 50.00 x 10,000
```

‏ואנחנו מצטרפים עם 100 מניות.

‏גם אם המחיר שלנו הוא ה־Best Bid, אין משמעות לכך שאנחנו "ראשונים". במודל price-time נפוץ יש לפנינו כמות שקדמה לנו.

‏מכאן:

```text
best_price != best_queue_position
```

‏לרובוט צריך להיות מושג של:

```text
queue_ahead_estimate
working_order_age
executed_volume_at_level_since_join
level_size_change
```

‏גם אם Queue Position אמיתי אינו ידוע בדיוק.

---

## ‏4.8 למה Queue Position קשה למדידה

‏ה־Depth שאנחנו רואים אינו אמת מלאה על התור:

- ‏יש hidden/reserve liquidity.
- ‏Orders מתבטלות ומתווספות במהירות.
- ‏לא כל feed נותן אותה רמת פירוט.
- ‏Trades יכולים להגיע ממספר Venues.
- ‏ה־Router יכול לפצל את Order שלנו.
- ‏Priority rules משתנים בין Venues וסוגי Orders.

‏לכן לא נבנה מודל שאומר:

```text
queue_ahead = displayed_size_before_us
```

‏כאמת מוחלטת.

‏עדיף להתייחס אליו כ־estimate עם uncertainty.

---

## ‏4.9 `Order Aging` — לפעמים Order ישנה נהיית דווקא מסוכנת יותר

‏פקודה Passive שיושבת זמן רב צוברת שני clocks שונים:

```text
working_order_age
signal_age
```

‏הראשון יכול להיות טוב — אולי התקדמנו בתור.

‏השני יכול להיות רע — ה־Signal שעליו התבססנו כבר התיישן.

‏לכן צריך להימנע מכלל פשטני:

> ‏"חיכינו כבר הרבה, חבל לבטל עכשיו."

‏זו יכולה להיות `sunk-cost` thinking.

‏השאלה הנכונה היא:

```text
If this order did not exist right now,
would we still want to place it at this price?
```

‏אם התשובה לא — Queue Position אינה סיבה להשאיר אותה.

---

## ‏4.10 Queue Toxicity — מתי Fill פסיבי הוא חדשות רעות

‏נניח שהצטרפנו ל־Bid והמניה עולה לאט. אנחנו לא מתמלאים.

‏פתאום מגיע pressure למטה וה־sell flow מתחיל לפגוע ב־Bid. דווקא עכשיו אנחנו מקבלים Fill.

‏זה מצב טיפוסי שבו Fill probability עולה **בדיוק כאשר quality של ה־fill יכולה לרדת**.

‏לכן חשוב למדוד:

```text
fill_probability
and
post_fill_markout
```

‏ביחד.

‏Passive behavior עם fill rate גבוה אבל markout רע יכול להיות גרוע יותר מ־aggressive behavior עם מחיר כניסה פחות יפה.

---

## ‏4.11 `Join` מול `Improve`

‏בקנייה אפשר לבחור בין:

```text
join existing bid
```

‏לבין:

```text
improve bid by one tick
```

‏`Improve` יכולה להביא אותנו לראש מחיר חדש ולמשוך מוכרים, אבל היא גם:

- ‏מוותרת על חלק מה־spread.
- ‏יוצרת price level חדש.
- ‏עלולה לחשוף urgency.
- ‏יכולה להזיז את ה־NBBO אם אנחנו באמת הטובים ביותר.
- ‏עדיין אינה מבטיחה Fill.

‏לכן עבורנו `IMPROVE_ONE_TICK` הוא Behavior Candidate נפרד ולא fallback אוטומטי בכל פעם שלא התמלאנו. ברמת Mode הוא עדיין בדרך כלל `PRICE_IMPROVING` או `PASSIVE`, לפי policy הקנונית.

---

## ‏4.12 `Hidden` — Display Attribute שמסתיר את הכמות המוצגת

‏`Hidden` מבקשת שה־Order לא תופיע ככמות גלויה ב־market depth, בכפוף ל־Venue/Broker semantics.

‏הסיבה הקלאסית היא להימנע מחשיפת Order גדול שעלולה לגרום למשתתפים אחרים להגיב אליה.

‏זה שימוש חשוב למוסדיים או לכמויות גדולות יחסית לנזילות.

‏אבל עבורנו צריך לשאול קודם:

> ‏האם הכמות שלנו בכלל גדולה מספיק כדי ש־display footprint יהיה בעיה?

‏אם אנחנו שולחים כמות קטנה יחסית לעומק, הסתרת הכמות יכולה להוסיף מורכבות בלי לפתור בעיה אמיתית.

---

## ‏4.13 `Hidden` אינה "בלתי נראית" במובן קסום

‏גם אם Order אינה מוצגת ב־book, היא עדיין יכולה להשפיע על execution ולהיחשף בעקיפין דרך fills והתנהגות שוק.

‏בנוסף, priority של hidden liquidity ותנאי eligibility יכולים להיות שונים לפי Venue.

‏לכן אין להניח:

```text
hidden = same fill probability as displayed + perfect secrecy
```

‏צריך לבדוק בפועל:

```text
hidden_fill_rate
hidden_time_to_fill
hidden_markout
hidden_vs_displayed_net_edge
```

---

## ‏4.14 פרט חשוב ב־IBKR: Hidden יכולה להיות Simulated

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מתעדת שהיא תנסה לנתב Hidden Orders ל־Exchanges שתומכים בהן Native. אם אין Destination מתאים עם native support, היא עשויה לדמות Hidden Order בכך שהיא מחזיקה אותה אצלה ושולחת `IOC` לבורסה כאשר הפקודה נעשית marketable.

‏IBKR גם מזהירה שבמצב simulated execution יכול להתעכב או לא להתרחש, ושהטיפול הוא best-efforts.

‏למנוע שלנו זה משמעותי מאוד:

```text
Venue-native Hidden
!=
Broker-simulated Hidden
```

‏ושני המצבים גם אינם אומרים אותו דבר לגבי `broker-resident`. אלה dimensions נפרדים לפי `00A`.

---

## ‏4.15 `Reserve / Iceberg` — Display Attribute שמציג חלק ומסתיר את היתר

‏`Iceberg` או `Reserve` מאפשרת להחזיק Order כוללת גדולה יותר, אבל לפרסם לשוק רק `display size` קטן ממנה.

‏לדוגמה:

```text
total_qty   = 5000
display_qty = 200
```

‏לשוק מוצגת רק פרוסה, בעוד הכוונה הכוללת גדולה יותר.

‏המטרה:

- ‏להקטין מידע שאנחנו חושפים על גודל הכוונה.
- ‏להימנע מהצגת wall גדול.
- ‏לעבוד כמות גדולה בהדרגה.

‏זה כלי מקצועי מאוד — אבל הוא אינו אוטומטית שימושי למסחר קטן ומהיר.

---

## ‏4.16 איך `Display Size` עובד ב־IBKR

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מתעדת Iceberg/Reserve דרך שדה `Display Size`. בדוגמה הרשמית, Order של 5,000 מניות עם Display Size של 200 מציגה 200, ולאחר שהכמות המוצגת מתמלאת מוגשת פרוסה נוספת עד להשלמת הכמות הכוללת.

‏עוד פרט חשוב: IBKR מציינת שאם Order היא `Market` או אם Limit היא marketable, המערכת יכולה לשלוח עד הכמות הכוללת הזמינה ולהשתמש ב־`IOC` attribute במקום לעבוד כ־Iceberg פסיבית רגילה.

‏מכאן:

> ‏Iceberg אינה רק `total_qty` עם מספר קטן בשדה display; ההתנהגות תלויה גם בשאלה אם Order passive או marketable.

---

## ‏4.17 Replenishment ו־Queue Priority

‏כאשר displayed slice מתמלאת ופרוסה חדשה מופיעה, אסור להניח שהיא שומרת תמיד את אותה Priority כאילו כל הכמות הייתה גלויה מלכתחילה.

‏הכללים תלויים Venue וביישום Native/Simulated.

‏לכן במחקר שלנו צריך למדוד:

```text
slice_number
slice_submit_time
slice_fill_time
queue_delay_per_slice
```

‏ולא להתייחס ל־Iceberg כאל Order אחת הומוגנית מבחינת queue.

---

## ‏4.18 למה Iceberg בדרך כלל אינה Baseline טבעי עבורנו

‏אם ה־Position שלנו קטנה יחסית ל־displayed depth, אין הרבה מה להסתיר.

‏החסרונות האפשריים:

- ‏מורכבות execution נוספת.
- ‏replenishment latency/priority effects.
- ‏פחות שקיפות במחקר שלנו לגבי מה בדיוק היה working בכל רגע.
- ‏התנהגות שונה כאשר Order נעשית marketable.
- ‏capability תלויה Venue/Broker.

‏לכן `Reserve/Iceberg` היא מבחינתנו `Advanced Option`, לא baseline — אלא אם הנתונים יראו שהגודל שלנו באמת יוצר footprint או market impact.

---

## ‏4.19 מתי Iceberg כן יכולה להפוך לרלוונטית גם לרובוט אישי

‏לא צריך להיות מוסדי כדי שגודל יחסי יהיה גדול.

‏אם מניה דקה מאוד וב־Bid יש רק:

```text
300 shares displayed
```

‏ואנחנו רוצים 500, הכמות שלנו כבר משמעותית יחסית לרמה.

‏במצב כזה אפשר לחקור האם display קטן יותר:

- ‏מקטין signaling.
- ‏משפר markout.
- ‏מקטין תגובת שוק לכמות שלנו.

‏אבל אז עולה שאלה קודמת:

> ‏אם 500 מניות הן כבר גדולות ביחס לנזילות, האם בכלל נכון לבצע את העסקה במסגרת Edge קצר כל כך?

‏לפעמים התשובה המקצועית יותר היא `NO TRADE` או size קטן יותר, לא Order Type מתוחכם יותר.

---

## ‏4.20 `Hidden` מול `Iceberg`

| תכונה | `Hidden` | `Iceberg / Reserve` |
|---|---|---|
| שכבה קנונית | Display attribute | Display / reserve attribute |
| כמות גלויה | ‏אפס, לפי semantics | ‏חלק מהכמות |
| מטרה | ‏להסתיר את קיום/גודל ה־Order | ‏להראות slice קטן בלבד |
| Fill behavior | ‏תלוי Venue/priority/simulation | ‏תלוי slices/replenishment |
| שימוש טיפוסי | ‏כמות גדולה/מידע רגיש | ‏כמות גדולה שרוצים לעבוד בהדרגה |
| התאמה ראשונית לנו | `Low/Challenger` | `Low/Advanced` |

‏אין כאן מנצח אוניברסלי. השאלה היא איזה מידע אנחנו מנסים לא לחשוף ומה המחיר בביצוע שאנחנו משלמים תמורת ההסתרה.

---

## ‏4.21 Maker/Taker Economics — לא לרדוף אחרי Rebate

‏ב־Venues מסוימים הוספת נזילות ולקיחת נזילות מקבלות fee/rebate economics שונים.

‏זה חשוב, אבל אצלנו אסור שהמנוע יהפוך ל־rebate strategy בלי שהתכוונו לכך.

‏אם חסכנו לדוגמה fee קטן אבל פספסנו מהלך של עשרות basis points, זו עסקה גרועה.

‏הסדר הנכון הוא:

```text
net executable edge
then execution quality
then fees/rebates as one component
```

‏לא:

```text
maximize maker rebate
```

---

## ‏4.22 `Post Only` כ־Safety Constraint ברובוט

‏יש שימוש שאני כן רואה כרלוונטי במיוחד למנוע שלנו:

```text
application_execution_mode = PASSIVE
behavior_candidate = PASSIVE_POST_ONLY
post_only = required
```

‏כלומר אם המנוע החליט שהעסקה כדאית **רק** אם אנחנו לא חוצים Spread, אז Post Only יכולה לאכוף את ההנחה ברמת Order path.

‏אם אין capability אמינה, המנוע צריך לפחות לבצע pre-submit check ולהתמודד עם race שבו השוק משתנה לפני arrival.

‏זו דוגמה שבה attribute מתקדם אינו "טריק להשגת מחיר טוב" — אלא דרך להפוך החלטת Execution Policy ל־constraint תפעולי.

---

## ‏4.23 למה `Post Only` יכולה להיות מסוכנת למומנטום קצר

‏ב־Signal מהיר מאוד, refusal to take liquidity יכול להיות יקר.

‏תרחיש:

```text
signal edge = strong
spread = 1 tick
expected move = 12 ticks
```

‏אם Post Only גורמת לנו שוב ושוב להישאר מאחור, אנחנו "חוסכים" tick אחד ומפסידים 12.

‏לכן Post Only מתאימה יותר כאשר:

```text
passive fill economics are materially better
and
signal lifetime allows waiting
```

‏ופחות כאשר:

```text
missed-move cost >> spread cost
```

---

## ‏4.24 `IBKR ATS` — דוגמה מיוחדת ל־Liquidity Posting

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מתעדת שה־ATS שלה זמין למניות ו־ETF אמריקאיים כ־Directed destination. Orders שמנותבות ל־IBKR ATS כדי להוסיף נזילות מתויגות אוטומטית כ־`not held` ומפורסמות ב־order book של IBKR ATS; הן יכולות להיפגש עם SmartRouted Orders שנעשות marketable נגדן.

‏בתיעוד `TWS API`, השדה `notHeld` מציין ש־Orders המנותבות ל־IBDARK מתויגות כ־`post only` ומוחזקות ב־IB order book.

‏זה מלמד אותנו שני דברים:

1. ‏`Post Only` יכולה להיות קשורה ל־Destination ספציפי ולא רק checkbox כללי.
2. ‏Routing ו־liquidity attributes הם dimensions נפרדים אבל משתלבים באותה Concrete Order.

‏נרד לזה עוד יותר בחלק Routing.

---

## ‏4.25 `TWS API` — ה־attributes הרלוונטיים

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏ב־`Order` object הנוכחי של `TWS API` קיימים בין היתר:

```text
displaySize
hidden
postOnly
notHeld
```

‏`displaySize` מוגדר ככמות שתיחשף לציבור.

‏`hidden` מסמן שה־Order לא תיראה ב־market depth; התיעוד של ה־API מציין במפורש שהשדה הזה חל על Orders שמנותבות ל־NASDAQ, ולכן שוב אסור להסיק availability כללית רק מכך שהשדה קיים באובייקט.

‏`postOnly` קיים כ־boolean ב־Order object, אך התיעוד הכללי אינו אומר שכל Contract/Route מקבל אותו.

‏מכאן הארכיטקטורה הנכונה:

```text
API field exists
+
contract/route capability
+
broker acceptance
+
observed semantics
+
enablement evidence
=
usable capability
```

---

## ‏4.26 `IBKR` — Hidden ו־Iceberg ב־UI

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏בדף Order Types הנוכחי של IBKR:

```text
Hidden:
Products: Stocks, ETFs, Options, Futures, FOPs, Bonds, Warrants
Platforms: TWS Only
Regions: US and Non-US Products
Routing: Smart, Directed
```

‏ו־Iceberg/Reserve מתועד כך:

```text
Products: Stocks, ETFs, Options, Futures, Warrants
Platforms: TWS Only
Regions: US and Non-US Products
Routing: Smart, Directed
```

‏לכן במסמך הסופי נסמן בנפרד:

```text
UI availability
API field availability
runtime capability
production enablement
```

‏ולא נכתוב פשוט `IBKR supports Hidden = yes`.

---

## ‏4.27 Behaviors שנרצה לחקור — לא Modes חדשים

‏ה־Application Modes הקנוניים נשארים כגון `PASSIVE`, ‏`PRICE_IMPROVING` ו־`AGGRESSIVE_CAPPED`.

‏מתחתיהם אפשר לחקור Behavior Candidates:

### ‏`PASSIVE_JOIN`

```text
mode = PASSIVE
join displayed quote
short application_order_ttl
normal visible size
```

### ‏`PASSIVE_POST_ONLY`

```text
mode = PASSIVE
postOnly = required
reject/reprice outcome handled explicitly
```

### ‏`PASSIVE_HIDDEN`

```text
mode = PASSIVE
hidden = true
only when capability and economics justify it
```

### ‏`PASSIVE_RESERVE`

```text
mode = PASSIVE
large relative size
displaySize < total quantity
```

### ‏`AGGRESSIVE_CAPPED`

```text
mode = AGGRESSIVE_CAPPED
consume liquidity within Economic Price Bound
```

‏המנוע לא צריך לעבור אוטומטית בין Behaviors. מעבר מ־Passive ל־Aggressive הוא **Decision חדשה** שדורשת re-evaluation של Signal ו־Edge.

---

## ‏4.28 כלל חשוב: Passive Behavior חייב `escape condition`

‏כל Passive Behavior צריך לענות מראש:

```text
When do we give up?
```

‏לדוגמה:

```text
application_order_ttl
signal_ttl
max_queue_wait_ms
cancel_if_bid_weakens
cancel_if_ask_runs_away
cancel_if_expected_edge_below_threshold
cancel_if_market_data_stale
```

‏בלי escape condition, המנוע אינו "סבלני" — הוא פשוט נשאר עם Order ישנה.

---

## ‏4.29 Telemetry שחייבים להוסיף לחקר Liquidity

‏בנוסף למדדים הקודמים:

```text
application_execution_mode
behavior_candidate
liquidity_intent = add/remove
post_only_requested
post_only_outcome
hidden_requested
display_size
total_order_size
slice_number
queue_join_timestamp
price_level
visible_size_at_join
visible_size_ahead_estimate
executed_volume_at_level
cancel_replace_count
maker_taker_flag_if_available
venue_fee
venue_rebate
```

‏ומדדים נגזרים:

```text
passive_fill_rate
passive_time_to_fill
passive_markout_100ms
passive_markout_1s
passive_markout_5s
post_only_reject_rate
post_only_reprice_rate
hidden_vs_displayed_fill_delta
hidden_vs_displayed_markout_delta
iceberg_slice_fill_rate
queue_wait_cost
missed_move_after_passive_no_fill
net_edge_by_liquidity_behavior
```

‏כך נוכל לדעת האם "הוספת נזילות" באמת מוסיפה לנו ערך או רק גורמת לנו לקבל fills רעילים.

---

## ‏4.30 מטריצת התאמה ראשונית למנוע שלנו

| כלי / Behavior | שכבה | התאמה ראשונית | הסיכון המרכזי |
|---|---|---|---|
| Passive displayed Limit / `PASSIVE_JOIN` | Behavior + LMT | `High` כ־Challenger | ‏No-fill / adverse selection |
| `PASSIVE_POST_ONLY` | Behavior + liquidity attribute | `High/Challenger` | ‏פספוס move / route semantics |
| `Hidden` | Display attribute | `Low/Challenger` | ‏fill/priority/simulation uncertainty |
| `Reserve/Iceberg` | Display attribute | `Low/Advanced` | ‏replenishment/priority/complexity |
| `IMPROVE_ONE_TICK` | Behavior | `Medium` | ‏מוותרים על spread וחושפים urgency |
| `AGGRESSIVE_CAPPED` | Application mode | `High` ל־urgent context | ‏spread/slippage |

‏זו עדיין מטריצת Research ולא החלטת Live.

---

## ‏4.31 Recommendation למנוע שלנו בשלב הזה

‏אין סיבה להפוך `Hidden` או `Iceberg` לברירת מחדל רק מפני שהן מתקדמות ומעניינות.

‏כן נרצה לחקור מוקדם:

```text
A. PASSIVE_JOIN
B. PASSIVE_POST_ONLY, כאשר capability מאומתת
C. MARKETABLE_LIMIT_IOC
```

‏ואז להשוות לפי:

```text
net edge per signal
fill probability
fill latency
markout
missed opportunity
fees/rebates
exit feasibility
```

‏`Hidden` ו־`Reserve/Iceberg` יקודמו רק אם נראה שה־order size שלנו גדול יחסית לנזילות וש־display footprint פוגע בתוצאה.

---

## ‏4.32 Practitioner Secrets — הדברים שקל לפספס

### ‏1. `Post Only` היא Constraint, לא Alpha ולא Mode

‏היא אוכפת passive intent; היא לא יוצרת Edge.

### ‏2. Queue Position בלי Signal תקף אינה נכס

‏אל תשאיר Order רעילה רק מפני שחיכית זמן רב בתור.

### ‏3. Fill Rate גבוה יכול להיות סימן רע

‏אם fills מגיעים בעיקר לפני תנועה נגדנו, יש adverse selection.

### ‏4. Hidden יכולה לשנות Execution Path

‏ב־IBKR היא עשויה להיות Venue-native או broker-simulated, ולכן latency/fill semantics יכולות להשתנות.

### ‏5. Iceberg אינה רק הסתרת מספר

‏Replenishment, priority ו־marketability משנים את ההתנהגות שלה.

### ‏6. Fee/Rebate הוא רק רכיב אחד

‏אין היגיון לחסוך fee קטן במחיר של missed move גדול.

### ‏7. `IMPROVE_ONE_TICK` הוא Behavior חדש

‏זו אינה "תחזוקה" של אותה החלטה; ויתרנו על מחיר כדי לקנות Priority טובה יותר.

### ‏8. Displayed Depth אינו כל הנזילות

‏Hidden/Reserve liquidity היא אחת הסיבות ש־visible queue estimate לעולם אינו אמת מוחלטת.

### ‏9. Passive-to-Aggressive transition חייב re-evaluation

‏אסור שהמנוע יתחיל Passive ואז יחצה Spread אוטומטית רק מפני שפג timer. לפני escalation מחשבים מחדש Edge, bound ו־signal validity.

---

# ‏מקורות רשמיים לחלק 4

- ‏IBKR — Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR — Hidden Order Handling using Simulated Hidden Orders: <https://www.interactivebrokers.com/en/trading/orders/hidden-order-handling-using-simulated.php>
- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR TWS API — placing orders introduction: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/place-order/introduction>

---

# ‏Checkpoint — סוף חלק 4

‏בחלק הזה בנינו את שכבת ה־Liquidity Control תוך הפרדה קנונית בין `Application Execution Mode`, ‏Behavior Candidate ו־Liquidity/Display attributes. ‏`Post Only`, ‏`Hidden` ו־`Reserve/Iceberg` אינם Modes עצמאיים; הם constraints/attributes שמממשים intent בתוך Concrete Order.

‏המסקנה למנוע שלנו בשלב זה: **`PASSIVE_JOIN`, ‏`PASSIVE_POST_ONLY` ו־`MARKETABLE_LIMIT_IOC` הם Behaviors מרכזיים למחקר. Hidden/Iceberg נשארות attributes מתקדמים עד שנוכיח שהגודל שלנו באמת יוצר footprint שמצדיק אותן.**

‏החלק הבא יהיה **Pegged, Relative, Midpoint ו־Snap families** — שם נרד לעומק בפקודות שהמחיר שלהן זז עם השוק, כולל ההבדלים בין `MidPrice`, ‏`Pegged-to-Midpoint`, ‏`Relative/Pegged-to-Primary`, ‏`Pegged-to-Market` ו־`Snap` ב־IBKR, ומה מהן באמת מתאים למנוע מומנטום של שניות.

---

# ‏חלק 4A — `Discretionary Order`: מחיר מוצג מול נכונות ביצוע נסתרת

> ‏הפרק הזה משלים את Part 4. הוא מוסיף את `Discretionary Order` ואת הציר המקצועי שחסר בקורס: **Displayed Price אינו בהכרח כל טווח המחירים שבו Order מוכנה לבצע**.
>
> ‏`FACT` — עובדות `IBKR` תלויות־זמן בפרק זה אומתו לאחרונה ב־`2026-10-27` מול התיעוד הרשמי של IBKR.

---

## ‏4A.1 הבעיה: Visibility ו־Executability הם שני צירים שונים

‏קל לחשוב על Order כאילו יש לה מחיר אחד בלבד:

```text
price shown to market
=
price at which order may execute
```

‏אבל ב־advanced execution זו הנחה מסוכנת.

‏צריך להפריד לפחות בין:

```text
displayed_price
executable_price_range
displayed_quantity
executable_quantity
liquidity_constraint
```

‏`Discretionary Order` היא דוגמה מרכזית לכך: השוק יכול לראות Limit מסוימת, בעוד Order רשאית להיות Eligible לביצוע בתוך טווח נוסף שאינו מוצג באותו אופן.

---

## ‏4A.2 מהי `Discretionary Order`

> ‏`FACT` — IBKR מתעדת Discretionary Order כ־Limit Order עם `discretionary amount` נסתר, שיכול להרחיב את טווח המחירים שבו Order כשירה לביצוע; השוק רואה את ה־Limit המוצגת.

‏מבחינת taxonomy:

```text
Broker Primitive      = LMT
Advanced Attribute    = discretionary amount
Displayed Price       = base/displayed limit
Executable Willingness = base limit + hidden discretionary range
```

‏לכן `Discretionary` אינה `Application Execution Mode` בפני עצמה.

‏במנוע שלנו Candidate מחקרית יכולה להיקרא:

```text
DISCRETIONARY_LIMIT
```

‏והיא יכולה להשתייך, לפי ה־Intent, ל־Mode כגון:

```text
PRICE_IMPROVING
or
PASSIVE
```

‏אך ה־classification בפועל חייבת להיגזר מה־materialized semantics ולא מהשם בלבד.

---

## ‏4A.3 דוגמה אינטואיטיבית — BUY

‏נניח לצורך המחשה:

```text
visible bid / base limit = 50.00
discretionary amount     = 0.03
```

‏השוק עשוי לראות את ה־Order סביב ה־base limit, בעוד מנגנון ה־Discretion מאפשר eligibility לביצוע במחיר גבוה יותר בתוך הטווח המותר.

‏הרעיון:

```text
show less aggressiveness
while preserving hidden willingness to trade somewhat more aggressively
```

‏אבל אין להסיק מכך Fill guarantee, queue guarantee או universal venue behavior.

---

## ‏4A.4 Displayed Price אינו `Economic Price Bound`

‏זה distinction קריטי.

‏נניח:

```text
displayed_limit = 50.00
discretionary_amount = 0.03
```

‏אסור למנוע להסיק:

```text
Economic Price Bound = 50.00
```

‏אם ה־Order בפועל יכולה לבצע מעבר ל־50.00.

‏ה־Decision Engine צריכה לדעת את **worst executable price** האפשרי לפי ה־semantics האמיתיות של Candidate.

> ‏`ENGINE INVARIANT` — Price שמוצג לשוק אינו בהכרח Price Bound של המנוע.

---

## ‏4A.5 `Discretionary` מול `Hidden`

‏אלה מנגנונים שונים.

### ‏`Hidden`

‏עוסקת בעיקר ב־visibility של Order/Quantity.

```text
hide order/display
```

### ‏`Discretionary`

‏עוסקת בעיקר ב־visibility של **price willingness**.

```text
show base limit
allow hidden discretionary execution range
```

‏לכן:

```text
Hidden != Discretionary
```

‏Order יכולה להיות hidden בלי discretionary range, ו־Discretionary יכולה לשנות executable willingness גם כאשר base price מוצגת.

---

## ‏4A.6 `Discretionary` מול `Reserve / Iceberg`

‏`Reserve/Iceberg` מפרידה בין:

```text
displayed_quantity
and
total executable quantity
```

‏`Discretionary` מפרידה בין:

```text
displayed/base price
and
hidden executable price range
```

‏זהו הבדל של dimension:

```text
Reserve = quantity visibility
Discretionary = price willingness visibility
```

‏שילוב ביניהם, אם Capability מסוימת מאפשרת, יוצר surface מורכב יותר ולכן דורש validation ולא הנחה.

---

## ‏4A.7 `Discretionary` מול `Post Only`

‏`Post Only` היא Liquidity Constraint:

```text
provide liquidity or do not intentionally take
```

‏`Discretionary` מרחיבה execution eligibility מעבר למחיר המוצג.

‏לכן הן אפילו יכולות למשוך לכיוונים מנוגדים:

```text
Post Only
=> preserve passive intent

Discretionary
=> allow hidden additional willingness to execute
```

‏אסור להניח שהשילוב ביניהן חוקי או בעל semantics רצויות במסלול כלשהו בלי Capability evidence ספציפית.

---

## ‏4A.8 `Discretionary` מול marketable `Limit`

### ‏Marketable Limit

```text
visible limit itself is already aggressive enough
```

### ‏Discretionary Limit

```text
base/displayed limit may look less aggressive
while hidden discretion extends execution eligibility
```

‏Marketable Limit חושפת את ה־Limit האגרסיבית כ־Order price.

‏Discretionary יכולה להסתיר חלק מה־willingness.

‏אבל שתיהן עדיין חייבות להיכנס תחת `Economic Price Bound` של המנוע.

---

## ‏4A.9 `Discretionary` אינה `Pegged`

‏`Pegged/Relative` משנה מחיר לפי reference rule לאורך זמן.

‏`Discretionary` אינה בהכרח dynamic repricing rule; היא מוסיפה eligibility range נסתר סביב/מעבר ל־base limit לפי semantics של המסלול.

‏לכן:

```text
Pegged = dynamic price reference behavior
Discretionary = hidden execution willingness around a displayed/base limit
```

---

## ‏4A.10 למה להשתמש בה

### ‏Why

‏היא יכולה להגדיל Fill opportunity בלי לחשוף לשוק מראש את כל מידת האגרסיביות שאנו מוכנים לקבל.

‏ב־spread משמעותי היא מאפשרת לנסות לשמור displayed posture פחות אגרסיבי ובכל זאת לקבל execution כאשר המחיר הנגדי נכנס לטווח המותר.

### ‏When

‏Candidate מחקרית יכולה להיות מעניינת כאשר:

```text
spread is economically meaningful
some hidden willingness is acceptable
Economic Price Bound remains explicit
signal has enough life
route/product capability is verified
```

### ‏Why Not

‏היא פחות מתאימה כאשר:

```text
we require strict visible-price semantics
signal life is too short for nuanced resting behavior
hidden willingness would consume too much edge
route/account/API semantics are unverified
```

---

## ‏4A.11 הטעות המקצועית: “אם אני מציג 50.00, אני לא אשלם יותר”

‏ב־Discretionary זו יכולה להיות הנחה שגויה.

‏ה־displayed/base price אינה מספרת לבדה את מלוא execution range.

‏לכן telemetry, risk checks ו־incident analysis חייבים לשמור בנפרד:

```text
displayed_limit_price
discretionary_amount
derived_max_executable_buy_price
derived_min_executable_sell_price
Economic Price Bound
```

‏ה־derived executable bound חייב להישאר בתוך ה־Economic Price Bound של Decision Engine.

---

## ‏4A.12 Visibility Matrix

| Mechanism | Price מוצג | Quantity מוצגת | Executable willingness נסתרת | Liquidity constraint |
|---|---|---|---|---|
| Plain Limit | כן | בדרך כלל כן | לא מעבר ל־Limit | לא |
| `Hidden` | יכול להיות מוסתר | מוסתרת/לא מוצגת | לא זה הייעוד | לא |
| `Reserve/Iceberg` | כן | חלקית | Quantity נוספת נסתרת | לא |
| `Post Only` | כן | לפי Order | לא זה הייעוד | כן — passive intent |
| `Discretionary` | Base/Limit מוצגת | לפי Order | **כן — price range נוסף** | לא בהכרח |
| Marketable Limit | Limit אגרסיבית גלויה | לפי Order | לא מעבר ל־Limit | לא |

> ‏`ENGINE RULE` — Display, quantity visibility, executable price range ו־liquidity intent הם dimensions נפרדים.

---

## ‏4A.13 `Displayed Price vs Executable Willingness` כ־Engine Contract

‏Candidate Registry צריכה להיות מסוגלת לתאר:

```text
DisplayPolicy {
  displayed_price_rule
  displayed_qty_rule
}

ExecutionEligibility {
  economic_price_bound
  broker_limit_price
  discretionary_amount
  effective_executable_range
}
```

‏כך Risk Engine אינה נאלצת לנחש executable exposure מתוך price שמופיעה ב־UI.

---

## ‏4A.14 Failure Contract

```text
Where does it live?               Broker / supported venue path after acceptance
Who manages discretion?           Broker/venue semantics
Can it execute beyond displayed?  Yes, within accepted discretionary semantics
Can it outlive local intent?       Yes while still working
Can late fills occur?              Yes, subject to normal order lifecycle
What becomes stale?                base price + discretionary range relative to new signal/market
What must be reconciled?           actual fills + current working order + effective executable range
```

‏כללי Part 8 ממשיכים לחול:

```text
CANCEL_REQUESTED != TERMINAL
```

‏כל עוד אין terminal broker evidence, ה־Order עדיין potentially executable בתוך ה־semantics שאושרו לה.

---

## ‏4A.15 Signal Decay חשוב יותר מהסתרת Intent

‏ייתכן שה־Discretionary range הייתה כלכלית לפני 500ms, אבל כבר אינה מוצדקת עכשיו.

‏לכן:

```text
signal invalidated
Economic Price Bound tightened
spread regime changed
exit feasibility worsened
```

‏מפעילים fresh Decision / cancel path.

‏העובדה שה־Order “חכמה” יותר מבחינת display אינה נותנת לה חיים ארוכים יותר.

---

## ‏4A.16 Queue ו־Adverse Selection

‏Discretionary אינה פותרת queue uncertainty.

‏היא גם אינה פותרת adverse selection.

‏ייתכן שהיא משיגה Fill שלא היינו מקבלים ב־plain displayed Limit — אבל בדיוק משום שהצד הנגדי הגיע לתוך hidden willingness שלנו.

‏לכן צריך להשוות:

```text
incremental_fill_probability
incremental_execution_cost
post_fill_markout
missed_move_if_no_fill
```

‏ולא להסתפק ב־Fill Rate.

---

## ‏4A.17 Telemetry ייעודית

```text
displayed_limit_price
discretionary_amount
effective_executable_range
market_bid_at_decision
market_ask_at_decision
market_bid_at_fill
market_ask_at_fill
fill_price
fill_qty
was_fill_inside_discretionary_range
application_order_ttl
cancel_request_ts
terminal_ts
markout_100ms
markout_500ms
markout_1s
```

‏במחקר נרצה לדעת במיוחד כמה Fills התקבלו **רק** בגלל ה־Discretion, ומה היה ה־markout שלהם.

---

## ‏4A.18 Capability facts ב־IBKR

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏בקטלוג Order Types של IBKR, `Discretionary` מתועדת עבור:

```text
Products  = Stocks, ETFs
Regions   = US Products Only
Routing   = Smart
Platform  = TWS Only (catalog surface)
```

‏בתיעוד `TWS API Order` קיים field:

```text
discretionaryAmt
```

‏שמתואר ככמות המחיר מחוץ ל־Limit המותרת ל־Discretionary Orders.

‏אין להפוך את שתי העובדות האלה ל־:

```text
supported_everywhere = true
```

‏ה־Capability Resolver עדיין חייב scope מפורש של:

```text
product
contract
API/platform path
route
account/legal entity
session
parameter combination
```

‏ולעבור את שלבי ה־enablement הקנוניים לפני Production.

---

## ‏4A.19 Candidate Registry מוצע

```text
DISCRETIONARY_LIMIT {
  category                 = DISPLAY_PRICE_VS_EXECUTABLE_WILLINGNESS
  primitive                = LMT
  attribute                = discretionaryAmt
  routing_requirement      = SMART according to current catalog surface
  research_role            = RESEARCH_CHALLENGER
  requires_economic_bound  = true
  requires_local_ttl       = true
  partial_fill_policy      = FRESH_DECISION
  failure_destination      = REDECIDE_OR_RECONCILE
}
```

‏זה internal research contract, לא טענה שזו enum מדויקת של IBKR.

---

## ‏4A.20 Direct Comparison

| Candidate/Attribute | מה מוסתר או נשלט | מתי זה מועיל | הסיכון המרכזי |
|---|---|---|---|
| `Hidden` | visibility של Order/Qty | רוצים פחות display | fill/priority semantics תלויות venue |
| `Reserve/Iceberg` | חלק מה־Quantity | רוצים total size גדול יותר מה־display | replenishment/queue uncertainty |
| `Post Only` | לא concealment אלא liquidity intent | passive-only economics | reject/reprice/no-fill |
| `DISCRETIONARY_LIMIT` | חלק מ־price willingness | רוצים Fill range רחב יותר בלי להציג את כולו | execution במחיר אגרסיבי יותר מהמחיר המוצג |
| Marketable Limit | אין concealment של limit aggressiveness | urgency תחומה וברורה | crossing/depth cost |

---

## ‏4A.21 Decision Example

‏נניח:

```text
spread = meaningful
signal = valid
remaining life = sufficient
plain passive fill probability = low
Economic Price Bound permits small additional willingness
Discretionary capability = validated
```

‏אפשר להשאיר למחקר:

```text
PASSIVE_JOIN
IMPROVE_ONE_TICK
DISCRETIONARY_LIMIT
```

‏המבחן אינו “מי מסתירה יותר”, אלא איזו Candidate משפרת opportunity-level outcome לאחר costs ו־markout.

---

## ‏4A.22 Counterexample

‏נניח שה־Order מציגה 50.00 אבל מחזיקה hidden discretionary willingness עד 50.03.

‏בינתיים Signal נחלשה ו־Economic Price Bound החדשה היא 50.01.

‏טעות:

```text
displayed price is still 50.00
=> order is safe to keep
```

‏התגובה הנכונה:

```text
derive actual executable range
compare to fresh Economic Price Bound
invalidate old decision
cancel/reconcile if range is no longer legal
```

---

## ‏4A.23 Acceptance Tests

```text
1. Displayed price is never treated as the sole executable bound for Discretionary orders.
2. Effective executable range never exceeds the current Economic Price Bound.
3. Tightening Economic Price Bound invalidates a wider existing discretionary range.
4. Signal invalidation triggers fresh cancel/reconcile decision.
5. CANCEL_REQUESTED discretionary order remains potentially executable until terminal evidence.
6. Partial fill updates position before any remainder decision.
7. Hidden, Reserve, Post Only and Discretionary remain distinct taxonomy dimensions.
8. Capability failure does not auto-fallback to Market or wider discretion.
9. Reconnect rebuilds actual discretionary parameters before READY.
10. Same snapshot + same policy yields the same eligibility decision.
```

---

## ‏4A.24 Practitioner Insight

> ‏`ENGINE RULE` — מה שהשוק רואה אינו בהכרח כל מה שה־Order מוכנה לעשות.

‏ב־advanced execution צריך לשאול תמיד ארבע שאלות נפרדות:

```text
What price is displayed?
What quantity is displayed?
At what prices can the order actually execute?
What liquidity behavior is allowed?
```

‏`Discretionary`, ‏`Hidden`, ‏`Reserve` ו־`Post Only` נותנות תשובות שונות לארבע השאלות האלה.

---

# ‏מקורות רשמיים לחלק 4A

- ‏IBKR — Order Types and Algos / `Discretionary`: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR TWS API — `Order` reference / `discretionaryAmt`: <https://www.interactivebrokers.com/docs/tws-api/ref/order>

---

# ‏Checkpoint — סוף חלק 4A

‏הוספנו את `Discretionary Order` ואת הציר `Displayed Price vs Executable Willingness`. ‏`Hidden` מסתירה visibility, ‏`Reserve/Iceberg` מסתירה חלק מהכמות, ‏`Post Only` מגבילה liquidity-taking, ואילו `Discretionary` יכולה להשאיר Base Limit מוצגת תוך הרחבת טווח הביצוע הנסתר. במנוע שלנו היא נשארת `RESEARCH_CHALLENGER` עם `Economic Price Bound`, ‏TTL, Capability validation ו־fresh decision לאחר fills, invalidation או failure.

# ‏חלק 4B — Liquidity & Display Decision Guide: ‏Passive, Post Only, Hidden, Reserve ו־Discretionary

> ‏הפרק הזה הוא שכבת Decision מעל Parts 4 ו־4A. הוא אינו מוסיף Order Types חדשים; הוא מחדד שתי הכרעות שקל מאוד לבלבל ביניהן: **איך מבטאים/אוכפים passive intent**, ו־**מה בדיוק אנחנו מנסים לא לחשוף לשוק**.

---

## ‏4B.1 שתי שאלות שונות שצריך לענות עליהן בנפרד

```text
Question A — Liquidity behavior
Do we merely intend to be passive now,
or must the order be prevented from intentionally taking displayed liquidity at handling time?

Question B — Information exposure
What are we trying not to reveal?
- order presence?
- total quantity?
- executable price willingness?
```

‏אם מערבבים את שתי השאלות מתקבלות מסקנות שגויות כמו:

```text
Hidden = passive
Reserve = Post Only
Discretionary = Hidden Limit
```

‏אף אחת מהשקילויות האלה אינה נכונה.

> ‏`ENGINE RULE` — `liquidity_intent`, ‏`display_policy`, ‏`quantity_visibility`, ‏`executable_price_range` ו־`liquidity_constraint` הם dimensions נפרדים.

---

# ‏חלק א — `Passive Limit` מול `Post Only`

## ‏4B.2 משפט הזיכרון

```text
Passive Limit expresses current passive intent.
Post Only enforces a passive-only constraint at order handling time.
```

‏זה ההבדל המרכזי.

‏`PASSIVE_JOIN` יכולה להיווצר כ־Limit שנמצאת passive לפי ה־snapshot שלנו.

‏`PASSIVE_POST_ONLY` מוסיפה constraint שמנסה למנוע מעבר שקט ל־liquidity-taking כאשר מצב השוק משתנה לפני שה־Order מטופלת.

---

## ‏4B.3 `PASSIVE_JOIN` — Decision Card

### ‏What

‏Limit שנבחרת כך שב־Decision snapshot היא נחה בצד שלנו של הספר ואינה אמורה לחצות את ה־spread.

### ‏Why

‏כדי לקבל behavior פשוט, שקוף וקל ל־telemetry, ללא constraint נוסף שתלוי ב־Venue/Broker semantics.

### ‏When

```text
passive intent is desired but not absolute
arrival race is acceptable
simple lifecycle is preferred
missed-move cost matters enough that accidental marketability is not automatically unacceptable
```

### ‏Why Not

‏ה־market יכולה להשתנות בין Decision ל־Arrival. Limit שהייתה passive ב־`t0` יכולה להיות marketable ב־`t1`.

### ‏Closest Alternative

`PASSIVE_POST_ONLY` כאשר passive-only economics הם invariant ולא רק preference.

### ‏Main Failure Mode

```text
decision sees passive price
→ market moves before broker/venue handling
→ order becomes marketable
→ execution takes liquidity although local intent was passive
```

### ‏For Our Engine

```text
CORE_BASELINE
```

---

## ‏4B.4 `PASSIVE_POST_ONLY` — Decision Card

### ‏What

‏Passive Limit materialization עם Post Only constraint במסלול שתומך בכך.

### ‏Why

‏כדי להגן על assumption כלכלי/התנהגותי:

```text
if taking liquidity would invalidate the trade economics,
do not silently cross merely because the market moved before arrival
```

### ‏When

```text
maker/passive economics are required
liquidity-taking would violate the plan
route-specific Post Only semantics are validated
reject/reprice/no-fill outcomes are acceptable
```

### ‏Why Not

‏Momentum מהיר יכול לברוח בזמן שה־Order נדחית, מוסתת או נשארת passive. אם missed-move cost גדול מה־spread/taker cost שנחסך, Post Only יכולה להיות constraint יקרה מדי.

### ‏Closest Alternative

`PASSIVE_JOIN` כאשר passive behavior היא preference בלבד ולא hard constraint.

### ‏Main Failure Mode

```text
passive-only guard works exactly as designed
→ order does not take liquidity
→ market runs away
→ no fill / missed move dominates saved spread
```

### ‏For Our Engine

```text
RESEARCH_CHALLENGER / POLICY_GUARDRAIL
```

---

## ‏4B.5 Arrival-Race Example — אותה Decision, תוצאה אחרת

‏נניח BUY:

```text
t0 Decision:
Bid = 20.00
Ask = 20.01
selected price = 20.00
```

‏ב־`t0` גם `PASSIVE_JOIN` וגם `PASSIVE_POST_ONLY` נראות passive.

‏לפני arrival:

```text
t1:
Bid = 19.99
Ask = 20.00
```

### ‏Plain Passive Limit

‏`BUY LMT 20.00` יכולה כעת להיות marketable ולבצע מול Ask 20.00, בכפוף ל־normal limit semantics.

### ‏Post Only

‏ה־Order אמורה להישאר כפופה ל־passive-only handling semantics של הנתיב: reject/reprice/slide/other supported behavior במקום לקחת liquidity באופן שסותר את constraint.

‏מכאן:

```text
same decision price
!=
same arrival behavior
```

‏וזה בדיוק הערך של Post Only כ־guardrail.

---

## ‏4B.6 Elimination Questions — Passive מול Post Only

```text
Is taking displayed liquidity forbidden by economics/policy?
YES -> PASSIVE_JOIN alone is insufficient; Post Only-capable path may be required

Is missed-move cost currently larger than passive-only benefit?
YES -> Post Only may be eliminated; return to broader execution decision

Are route-specific Post Only semantics unvalidated?
YES -> PASSIVE_POST_ONLY is not production-eligible

Is signal life too short for reject/reprice/no-fill handling?
YES -> eliminate passive-only behavior and re-decide execution mode
```

> ‏`ENGINE RULE` — Post Only failure does not authorize an automatic cross. It returns to fresh Decision.

---

# ‏חלק ב — `Hidden` מול `Reserve/Iceberg` מול `Discretionary`

## ‏4B.7 משפט הזיכרון

```text
Hidden        -> hide displayed presence / displayed quantity
Reserve       -> hide part of total quantity
Discretionary -> hide part of executable price willingness
```

‏שלושתן עוסקות ב־information exposure, אבל כל אחת בציר אחר.

---

## ‏4B.8 Comparison Matrix — מה בדיוק מוסתר

| Mechanism | Displayed presence | Displayed quantity | Total quantity hidden? | Hidden executable price range? | Primary problem solved |
|---|---|---|---|---|---|
| Plain Limit | בדרך כלל visible | בדרך כלל visible | לא | לא | simple price control |
| `Hidden` | מופחתת/מוסתרת לפי semantics | מוסתרת/לא מוצגת | בפועל visibility מצטמצמת | לא זה הייעוד | conceal displayed footprint |
| `Reserve/Iceberg` | visible slice | partial | **כן** | לא | conceal total size while exposing a slice |
| `Discretionary` | base Limit יכולה להיות visible | לפי concrete order | לא זה הייעוד | **כן** | conceal extra executable price willingness |
| `Post Only` | לא concealment mechanism | לפי concrete order | לא | לא | enforce passive-only liquidity handling |

> ‏`ENGINE RULE` — “כמה רואים?” ו־“באילו מחירים Order יכולה לבצע?” הן שאלות שונות.

---

## ‏4B.9 `Hidden` — Decision Card

### ‏What

‏Display attribute שמפחיתה/מסתירה את נוכחות ה־Order או הכמות המוצגת, בהתאם ל־route/venue semantics.

### ‏Why

‏כדי לצמצם displayed footprint כאשר עצם חשיפת ה־Order או הכמות עלולה לשנות behavior של משתתפים אחרים או לחשוף intent.

### ‏When

```text
information leakage is material
visible footprint is undesirable
route capability is validated
queue/fill trade-off is acceptable
```

### ‏Why Not

‏פחות display אינו free advantage. Priority/fill behavior יכול להיות שונה, וה־Order עדיין יכולה להישאר stale או לקבל adverse fill.

### ‏Closest Alternative

`Reserve/Iceberg` כאשר רוצים להציג slice אך להסתיר total size.

### ‏Main Failure Mode

```text
less visible footprint
→ worse queue/fill outcome
→ missed move exceeds any information benefit
```

### ‏For Our Engine

```text
SPECIALIST / RESEARCH_CHALLENGER
```

---

## ‏4B.10 `Reserve/Iceberg` — Decision Card

### ‏What

‏Order שמציגה חלק מהכמות ומשאירה quantity נוספת לא מוצגת, עם replenishment/refresh semantics שתלויות בנתיב.

### ‏Why

‏כדי לעבוד quantity גדולה יותר בלי לחשוף מראש את כל ה־size.

### ‏When

```text
total size is meaningful relative to displayed liquidity
full size disclosure is undesirable
replenishment semantics are understood
queue consequences are measurable
```

### ‏Why Not

‏ל־Order קטנה מאוד אין כמעט מה “להסתיר”. בנוסף replenishment יכול לשנות queue outcome וה־hidden remainder עדיין נשאר executable exposure.

### ‏Closest Alternative

`Hidden` כאשר רוצים concealment רחב יותר של displayed presence; plain Limit כאשר size קטן והפשטות עדיפה.

### ‏Main Failure Mode

```text
displayed slice fills/replenishes
→ engine mistakes visible slice for total remaining exposure
→ quantity/risk reconciliation becomes wrong
```

### ‏For Our Engine

```text
SPECIALIST
```

---

## ‏4B.11 `DISCRETIONARY_LIMIT` — Decision Card

### ‏What

‏Limit עם base/displayed price ו־hidden discretionary execution range מעבר למחיר המוצג, בתוך capability וה־`Economic Price Bound`.

### ‏Why

‏כדי לשמור displayed posture פחות אגרסיבי תוך מתן willingness נוספת לביצוע שאינה משתקפת כולה במחיר המוצג.

### ‏When

```text
spread is economically meaningful
some hidden price willingness is useful
signal has enough life
actual executable range remains inside Economic Price Bound
capability is validated
```

### ‏Why Not

‏המחיר המוצג כבר אינו מספר את כל ה־risk. אם המנוע, UI או recovery מסתכלים רק על base price, הם יכולים להעריך בחסר את executable exposure.

### ‏Closest Alternative

Marketable Limit כאשר רוצים להציג במפורש את ה־aggressive Limit; `Hidden/Reserve` כאשר הבעיה היא quantity/presence visibility ולא price willingness.

### ‏Main Failure Mode

```text
displayed price looks safe
→ hidden discretionary range remains wider
→ Economic Price Bound tightens
→ order can still execute at a price no longer justified
```

### ‏For Our Engine

```text
RESEARCH_CHALLENGER
```

---

## ‏4B.12 ארבע שאלות שמונעות taxonomy mistakes

‏לפני בחירת attribute נשאל:

```text
1. Must the order remain passive?
2. How much order presence should be displayed?
3. How much total quantity should be displayed?
4. What is the full executable price range, including hidden discretion?
```

‏מיפוי:

```text
Question 1 -> Post Only / liquidity constraint
Question 2 -> Hidden / display policy
Question 3 -> Reserve/Iceberg / quantity visibility
Question 4 -> Discretionary / executable willingness
```

‏Order אחת יכולה עקרונית לשלב כמה dimensions רק אם ה־capability המדויקת מאשרת את השילוב. אין להסיק combinability משמות features בלבד.

---

## ‏4B.13 Decision Example — “אני רוצה להסתיר” אינו מספיק

‏נניח:

```text
order_qty = 100
spread = meaningful
base passive price = 50.00
Economic Price Bound = 50.03
```

### ‏Case A — רוצים להסתיר עצם footprint

```text
problem = displayed presence
candidate dimension = Hidden
```

### ‏Case B — הכמות היא 20,000 ורוצים להראות רק slice

```text
problem = total quantity disclosure
candidate dimension = Reserve/Iceberg
```

### ‏Case C — רוצים להציג 50.00 אך להיות מוכנים לבצע עד 50.03

```text
problem = displayed price vs executable willingness
candidate dimension = Discretionary
```

### ‏Case D — אסור לקחת liquidity גם אם השוק זז

```text
problem = liquidity-taking constraint
candidate dimension = Post Only
```

‏המילה “hidden” אינה תשובה מספקת; צריך לזהות **איזה information/execution dimension** אנחנו רוצים לשלוט בו.

---

## ‏4B.14 Counterexample — “Post Only היא פשוט Passive Limit בטוחה יותר”

‏לא תמיד.

‏אם:

```text
signal life = 250ms
market moving rapidly upward
maker-only savings = 1 cent
missed move if no fill = materially larger
```

‏Post Only יכולה לבצע את מטרתה בצורה מושלמת — לא לקחת liquidity — ובכל זאת להיות decision גרועה יותר ל־opportunity.

‏כלומר:

```text
constraint success
!=
opportunity success
```

---

## ‏4B.15 Counterexample — “Hidden תמיד פחות חושפת ולכן טובה יותר”

‏אם Order קטנה ואין evidence ש־display footprint פוגע בנו, Hidden מוסיפה complexity/venue dependence בלי benefit מוכח.

‏ההשוואה צריכה להיות:

```text
information leakage avoided
versus
fill probability / queue outcome / missed move / markout
```

‏לא:

```text
less visible = automatically better
```

---

## ‏4B.16 Counterexample — “Reserve פותרת את אותה בעיה כמו Discretionary”

‏Reserve מסתירה **quantity**.

‏Discretionary מסתירה **price willingness**.

‏Order של 10,000 מניות עם visible slice 500 יכולה עדיין להיות בעלת Limit price שקופה לחלוטין.

‏Order של 100 מניות יכולה להיות Discretionary גם כאשר אין שום סיבה להסתיר quantity.

‏אלה dimensions orthogonal.

---

## ‏4B.17 Counterexample — “Displayed Limit היא ה־worst price שלי”

‏ב־plain Limit זה יכול להיות contract סביר.

‏ב־Discretionary אין להשתמש בכלל הזה.

‏Risk חייב לגזור:

```text
effective_executable_range
```

‏מתוך ה־concrete order semantics, ואז לבדוק אותו מול:

```text
Economic Price Bound
```

‏ולא מול `displayed_limit_price` בלבד.

---

## ‏4B.18 Partial Fill משנה גם כאן את הבעיה

‏לאחר Partial Fill:

```text
reconciled_position changes
remaining_qty changes
visible slice may change/replenish
hidden remainder may still exist
discretionary range may still be executable
signal life is shorter
```

‏לכן:

```text
partial fill
→ reconcile total remaining executable exposure
→ refresh economics
→ fresh decision
```

‏אסור להמשיך אוטומטית רק משום שה־attribute המקורי עדיין חוקי אצל Broker.

---

## ‏4B.19 Telemetry משותפת להשוואה

```text
behavior_candidate
liquidity_intent
post_only_requested
post_only_outcome
display_policy
displayed_qty
total_qty
reserve_qty
hidden_flag
displayed_limit_price
discretionary_amount
effective_executable_range
arrival_bid
arrival_ask
was_marketable_at_arrival
was_liquidity_added
was_liquidity_removed
reject_or_reprice_reason
fill_qty
fill_price
remaining_executable_qty
application_order_ttl
post_fill_markout_100ms
post_fill_markout_500ms
post_fill_markout_1s
missed_move_if_unfilled
```

‏ה־telemetry צריכה לאפשר לענות גם על:

```text
Did the constraint work?
```

‏וגם על:

```text
Was using the constraint economically worthwhile?
```

---

## ‏4B.20 Decision Record מומלץ

```text
LiquidityDisplayDecision {
  snapshot_id
  liquidity_intent
  passive_only_required
  information_exposure_problem
  displayed_price
  displayed_qty
  total_qty
  effective_executable_range
  economic_price_bound
  survivors[]
  eliminated[] { candidate_or_attribute, reason_code }
  selected_behavior
  selected_attributes[]
  closest_alternative
  decision_reason
  application_order_ttl
  failure_destination
}
```

‏כך ניתן להסביר אם בחירה מסוימת הייתה על liquidity constraint, display, quantity concealment או price discretion — במקום לשמור רק `order_type` עמום.

---

## ‏4B.21 Acceptance Tests

```text
1. PASSIVE_JOIN may become marketable after the decision snapshot; the engine does not assume passive-at-decision means passive-at-arrival.
2. PASSIVE_POST_ONLY is selected only when passive-only behavior is actually required and capability is validated.
3. Post Only reject/reprice/no-fill never triggers an automatic aggressive fallback.
4. Hidden is never treated as equivalent to Post Only.
5. Reserve/Iceberg hidden quantity remains part of total executable exposure.
6. Discretionary displayed price is never treated as the sole executable price bound.
7. Discretionary effective executable range never exceeds Economic Price Bound.
8. Partial fill causes fresh reconciliation of visible and hidden remaining exposure.
9. Attribute combinations require explicit capability evidence; no combinability is inferred from field availability.
10. Same snapshot + same policy yields the same survivor set and selected liquidity/display plan.
```

---

## ‏4B.22 Practitioner Insight

> ‏`ENGINE RULE` — “Passive”, “Hidden” ו־“Protected from taking” אינם אותו רעיון.

‏הדרך לזכור:

```text
Passive Limit  = where the price is now
Post Only      = what liquidity behavior is allowed at handling time
Hidden         = whether presence/quantity is displayed
Reserve        = how much of total quantity is displayed
Discretionary  = how much executable price willingness is not displayed
```

‏מערכת מקצועית אינה שואלת רק “איזה Order Type נבחר?”, אלא **איזה dimension אנחנו מנסים לשלוט בו, ומה failure mode שנוצר בגלל הבחירה הזאת**.

---

# ‏Checkpoint — סוף חלק 4B

‏יצרנו שכבת Decision אחידה ל־`PASSIVE_JOIN` מול `PASSIVE_POST_ONLY`, ול־`Hidden` מול `Reserve/Iceberg` מול `DISCRETIONARY_LIMIT`. נוסף Arrival-Race example שמראה מדוע passive-at-decision אינה passive-at-arrival, ונקבעה taxonomy ברורה: Post Only שולטת ב־liquidity-taking, Hidden ב־displayed footprint, Reserve בכמות המוצגת, ו־Discretionary בטווח מחיר הביצוע הנסתר. כל attribute נשאר כפוף ל־Capability evidence, ‏TTL, ‏fresh decision ו־reconciliation.

# ‏חלק 5 — Pegged, Relative, Midpoint ו־Snap: Dynamic Pricing Behaviors

> ‏לפי ה־taxonomy הקנונית ב־`00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md`, חלק מהשמות בפרק הזה הם Broker Order Primitives/variants, חלקם Broker Algos וחלקם Behavior Candidates של המנוע. לכן בכל section נפריד בין **מה הברוקר מקבל**, **מי מנהל את repricing/routing**, ו־**איזה Behavior המנוע שלנו בחר**.

## ‏5.1 למה המשפחה הזאת חשובה במיוחד לרובוט

‏ב־Limit רגילה המנוע בוחר מחיר. אם השוק זז, המנוע צריך לבחור האם להישאר, לבטל, להגיש מחדש, לשנות מחיר או לוותר על העסקה.

‏במשפחות dynamic pricing אנחנו יכולים למסור חלק מהחלטת המחיר ל־Broker/Venue באמצעות כלל כגון:

```text
reference price
+/- offset
bounded by Economic Price Bound
```

‏זה יכול להיות חזק במיוחד למנוע של שניות, כי הוא מצמצם `cancel/replace` מקומי ומאפשר לפקודה להתאים את עצמה לשוק מהר יותר מהלולאה שלנו.

‏אבל המחיר של האוטומציה הוא אובדן חלק מהשליטה. לכן כל כלי במשפחה נבחן אצלנו לפי חמש שאלות:

```text
What is the reference?
Does price move once or continuously?
Who performs the repricing/routing?
What is the Economic Price Bound?
What happens when the signal dies before the order does?
```

---

## ‏5.2 ארבע משפחות שנשמעות דומות אך שייכות לשכבות שונות

‏צריך להפריד בין:

```text
Relative / Pegged-to-Primary
Pegged-to-Midpoint
MidPrice
Snap family
```

‏באופן רעיוני:

| משפחה | שכבה קנונית | Reference | Repricing מתמשך? | מי מנהל |
|---|---|---|---:|---|
| `Relative/Pegged-to-Primary` | Broker primitive/variant + Behavior Candidate `RELATIVE_PRIMARY` | ‏הצד שלנו ב־NBBO | ‏כן | Broker/Venue path |
| `Pegged-to-Midpoint` | Broker primitive/variant + `PEGGED_MIDPOINT_DIRECT` | ‏אמצע ה־NBBO | ‏כן | Venue/Broker path |
| `MidPrice` | Broker Algo + Behavior Candidate `MIDPRICE` | ‏midpoint-or-better | ‏כן, כחלק מה־algo/routing | IBKR |
| `Snap` | Broker primitive/variant + Behavior Candidate כגון `SNAP_MIDPOINT` | ‏Bid/Ask/Midpoint ברגע ההגשה | ‏לא | IBKR computes once |

‏אותו יעד כללי — מחיר חכם יותר — יכול להוביל ל־state machine שונה לחלוטין.

---

## ‏5.3 `Peg` היא נוסחת מחיר, לא מספר קבוע

‏נניח:

```text
Bid = 50.00
Ask = 50.04
```

‏Limit רגילה:

```text
BUY LMT 50.01
```

‏נשארת 50.01 עד שינוי מפורש.

‏Peg יכולה לומר רעיונית:

```text
BUY = NBB + 0.01
bound = 50.03
```

‏אם ה־NBB עולה ל־50.01, effective price יכולה לעלות ל־50.02. אם ה־NBB ממשיך לעלות, ה־Economic Price Bound אמור לעצור את האגרסיביות בנקודה שקבענו.

‏לכן ברמת המודל צריך לשמור בנפרד:

```text
reference
offset
economic_price_bound
current_effective_price
```

---

## ‏5.4 `Economic Price Bound` הוא לא תוספת — הוא תנאי בטיחות

‏Pegged behavior ללא גבול כלכלי יכולה להפוך ל־automatic chase.

‏אצלנו ה־bound צריך להגיע מאותו מודל כלכלי של חלק 2:

```text
entry_max_price =
expected_exit
- required_net_edge
- expected_exit_cost
- fees
- safety_margin
```

‏ולא מתוך כלל כמו:

```text
keep following bid + 1 cent forever
```

‏ברובוט קצר־טווח, `offset` קובע **איך לנוע**; `Economic Price Bound` קובע **מתי אסור להמשיך לנוע**.

---

## ‏5.5 `Relative / Pegged-to-Primary` — Broker-managed dynamic pricing

‏IBKR מתארת `Relative`, הידועה גם כ־`Pegged-to-Primary`, כפקודה שמנסה להיות אגרסיבית יותר מה־NBBO תוך כדי הוספת נזילות.

‏בקנייה הרעיון הוא בקירוב:

```text
NBB + offset
```

‏ובמכירה:

```text
NBO - offset
```

‏ה־offset מאפשר לנו לשפר את המחיר מול התור הקיים בלי לנהל כל שינוי Quote ידנית.

‏ברמת המנוע שלנו:

```text
ApplicationExecutionMode = BROKER_MANAGED or PRICE_IMPROVING
BehaviorCandidate = RELATIVE_PRIMARY
Concrete Broker Plan = Relative/Pegged-to-Primary + route + bound
```

‏ה־repricing rule חי אצל Broker/Venue path; ה־Signal validity נשארת אצלנו.

---

## ‏5.6 `Relative` מול `PASSIVE_JOIN`

‏נניח:

```text
Bid = 20.00
Ask = 20.04
```

‏Join רגיל:

```text
BUY LMT 20.00
```

‏Relative עם offset של tick:

```text
BUY near NBB + 0.01
```

‏היתרון הפוטנציאלי הוא Queue Position טובה יותר דרך price improvement.

‏המחיר:

- ‏מוותרים על חלק מה־spread.
- ‏עלולים לחשוף urgency.
- ‏עלולים להעלות את ה־NBBO.
- ‏ה־Order יכולה להמשיך לזוז גם כאשר ה־Signal שלנו כבר נחלש.

‏לכן `Relative` אינה "Execution Policy" שלמה ואינה פשוט "Limit יותר חכמה". היא Broker-side pricing mechanism שהמנוע יכול לבחור כחלק מ־Behavior Candidate.

---

## ‏5.7 פרט קריטי ב־IBKR: `SMART Relative` אינה סימטרית

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מתעדת:

```text
Directed Relative:
floats both ways with the market
```

‏אבל ב־`SMART`:

```text
BUY:
NBB up   -> order can move up
NBB down -> no automatic downward adjustment

SELL:
NBO down -> order can move down
NBO up   -> no automatic upward adjustment
```

‏זו אינה הערת שוליים. היא משנה את הסיכון.

‏BUY SMART Relative שעלתה עם ה־Bid יכולה להישאר במחיר אגרסיבי יותר גם אחרי שה־Bid נסוג. לכן מנוע שמניח "הפקודה תמיד צמודה ל־Bid" יכול לטעות בדיוק ברגע שבו המומנטום נחלש.

---

## ‏5.8 למה הא־סימטריה הזו יכולה להיות שימושית — ומסוכנת

‏היתרון האפשרי: היא לא נסוגה מיד מכל ירידה קטנה ב־Bid ולכן אינה מאבדת אגרסיביות/מיקום בכל noise.

‏הסיכון: היא יכולה להשאיר אותנו קרובים מדי לצד הנגדי אחרי deterioration אמיתי.

‏לכן ב־SMART Relative צריך guardrail מקומי:

```text
if current_reference_deteriorates materially:
    re-evaluate edge
    cancel if old effective price is no longer justified
```

‏כלומר גם כאשר Broker מנהל repricing, המנוע שלנו עדיין מנהל **validity**.

---

## ‏5.9 Zero Offset אינו אומר "Order רגילה"

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מתעדת ש־Relative עם `0` offset יכולה להיות מוצבת ב־best bid/ask ולהמשיך לנוע עם ה־inside quote בהתאם ל־route semantics.

‏לכן:

```text
Relative(offset=0)
!=
static Limit at current Bid/Ask
```

‏הראשונה היא dynamic price rule; השנייה היא מחיר קבוע.

‏זה distinction מצוין ל־A/B test אצלנו.

---

## ‏5.10 Percentage Offset ו־Tick Rounding

‏IBKR מאפשרת גם offset באחוזים בחלק מהקשרים, ואז היא צריכה לעגל את המחיר ל־tick חוקי.

‏למניות אמריקאיות מעל $1, שינוי קטן מאוד בחישוב יכול להיתרגם ל־tick שלם.

‏מכאן ש־Execution Engine חייב לדעת:

```text
requested theoretical peg price
actual allowed tick price
rounding direction
```

‏ולא להשוות Backtest theoretical price ל־Live price כאילו הם תמיד זהים.

---

## ‏5.11 `Relative` ו־Queue Priority

‏יתרון אפשרי מול client-side chase הוא שפחות פעולות `cancel/replace` נעשות אצלנו.

‏אבל אסור להסיק מכך שה־queue age נשמר תמיד כאשר effective price משתנה.

‏Priority היא Venue-specific.

‏לכן נשמור:

```text
reprice_count
price_level_count
time_at_current_level
fill_after_reprice
```

‏ונמדוד במקום להניח.

---

## ‏5.12 `Relative` מול Client-Managed Repricing

‏Client-managed repricing נראה כך:

```text
read quote
place limit
quote moves
cancel
reconcile
replace
repeat
```

‏הוא נותן לנו שליטה מלאה, אבל יוצר:

- ‏יותר messages.
- ‏יותר cancel/fill races.
- ‏יותר חלונות שבהם quote כבר השתנה לפני replacement.
- ‏אפשרות לאיבוד queue priority.
- ‏יותר קוד recovery.

‏`Relative` מעבירה חלק מהלולאה הזאת החוצה.

‏אבל מבחינתנו היא עדיפה רק אם:

```text
broker semantics
+
route behavior
+
Economic Price Bound
+
application_order_ttl
```

‏תואמים בדיוק את ה־Execution Intent שלנו.

---

## ‏5.13 Broker-managed pricing אינה Signal Automation

‏זו אחת הנקודות החשובות ביותר בחלק הזה:

```text
Broker knows quote movement.
Broker does not know our alpha died.
```

‏ה־Order יכולה לבצע repricing מושלם מול NBBO ובכל זאת להיות עסקה גרועה מפני שה־Signal שלנו התהפך.

‏לכן כל broker-managed/dynamic pricing Behavior דורש:

```text
application_order_ttl
signal_ttl
signal_decay_cancel
market_data_freshness_guard
economic_price_bound
position_guard
```

---

## ‏5.14 `Pegged-to-Midpoint` — לעקוב אחרי אמצע ה־NBBO

‏ה־midpoint הוא:

```text
mid = (NBB + NBO) / 2
```

‏אם:

```text
Bid = 50.00
Ask = 50.04
```

‏אז:

```text
Mid = 50.02
```

‏מבחינת BUY, Fill ב־50.02 במקום 50.04 חוסך חצי Spread מול לקיחת ה־Ask.

‏כאשר Edge צפוי קטן, שתי אגורות כאלה יכולות לשנות מהותית את `round-trip net edge`.

---

## ‏5.15 למה Midpoint הוא לא "Bid משופר"

‏Midpoint liquidity היא עולם ביצוע שונה.

‏ב־displayed Bid אנחנו נחים בספר הגלוי.

‏ב־midpoint אנחנו מחפשים contra liquidity שמוכנה להיפגש בתוך ה־spread, לעיתים במסגרת non-displayed execution.

‏לכן יכול להיות:

```text
excellent price improvement
but low fill probability
```

‏וזה בדיוק trade-off שמנוע של שניות חייב למדוד.

---

## ‏5.16 `Pegged-to-Midpoint` ב־IBKR — Routing משנה הכול

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מתעדת את `Pegged-to-Midpoint` עבור Stocks, ETFs ו־Options ב־`TWS` וב־`IBKR Desktop`.

‏לפקודות מניה אמריקאיות, IBKR דורשת **Direct Routing** כדי להשתמש בפקודה הזו.

‏לכן ברמת המנוע:

```text
BehaviorCandidate = PEGGED_MIDPOINT_DIRECT
RoutingPolicy = DIRECT
```

‏היא אינה שקולה ל־:

```text
SMART + midpoint preference
```

‏וזו בדיוק הסיבה שצריך להבדיל בינה לבין `MidPrice`.

---

## ‏5.17 Offset ב־Pegged-to-Midpoint אינו Capability אחידה

‏IBKR מציינת שרוב ה־venues, כולל דוגמאות כגון NASDAQ/ISLAND, אינם מקבלים offset מה־midpoint בפקודה הרגילה הזו.

‏ללא offset יש להזין `0`/`0.0` ב־TWS.

‏לכן המנוע לא צריך לבנות Policy שתלויה ב־:

```text
midpoint + arbitrary offset
```

‏בלי לבדוק Destination capability אמיתי.

---

## ‏5.18 Economic Price Bound ב־Pegged-to-Midpoint

‏גם כאן ניתן להגדיר Limit Price כ־broker-level cap.

‏זה מאפשר שילוב מקצועי:

```text
follow midpoint
but never exceed Economic Price Bound
```

‏עבור BUY:

```text
midpoint may rise
order may follow
but bound stops further aggressiveness
```

‏כך ה־Peg מנהלת micro-pricing וה־engine שומר את economics.

---

## ‏5.19 למה Midpoint יכולה לפספס בדיוק את המניה הכי חזקה

‏במומנטום חזק, הצד השני לא חייב להסכים לתת לנו midpoint.

‏נניח שה־Ask כל הזמן נלקחת והמחיר מטפס. Order שמחכה באמצע ה־spread יכולה להישאר ללא Fill בזמן שהמהלך בורח.

‏לכן midpoint אינה "כניסה זולה יותר" בלבד. היא wager על כך שה־fill probability וה־price improvement יחד עדיפים על missed-move cost.

‏נמדוד:

```text
midpoint_fill_rate
midpoint_time_to_fill
price_improvement
missed_move_on_no_fill
markout_after_fill
```

---

## ‏5.20 `MidPrice` — Broker Algo, לא synonym של `Pegged-to-Midpoint`

‏`MidPrice` היא IBKR Smart-routed Broker Algo שנועד לנסות לקבל את midpoint של ה־NBBO או מחיר טוב יותר, עם Price Cap אופציונלי.

‏כלומר:

```text
Pegged-to-Midpoint = directed broker order behavior/variant
MidPrice            = IBKR broker algo + SMART routing behavior
```

‏וברמת המנוע:

```text
ApplicationExecutionMode = MIDPOINT_SEEKING or BROKER_MANAGED
BehaviorCandidate = MIDPRICE
BrokerAlgo = MidPrice
RoutingPolicy = SMART
```

‏זה הבדל גדול מאוד עבור המנוע.

---

## ‏5.21 מה IBKR עושה בתוך `MidPrice`

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מתעדת ש־MidPrice מנסה לנתב ל־exchange בעל הסתברות גבוהה למלא כ־`Pegged-to-Midpoint`; ב־IEX היא יכולה להשתמש ב־`D-Peg`. אם אין exchange מתאים, היא יכולה לנתב כ־native או simulated `Relative` order.

‏כלומר `MidPrice` איננה primitive אחד.

‏היא policy של Broker שיכולה לבחור execution path שונה לפי מצב השוק והיעדים הזמינים.

---

## ‏5.22 למה זה טוב לרובוט

‏במקום שהמנוע שלנו יצטרך לבחור בעצמו:

```text
which venue?
which midpoint primitive?
when to use relative fallback?
```

‏אפשר לתת ל־IBKR לנהל את החיפוש.

‏זה מקטין routing logic מקומי ויכול לפתוח גישה ל־midpoint opportunities במספר venues.

‏המחיר הוא פחות determinism:

```text
same logical behavior candidate
may take different execution paths
```

‏ולכן Telemetry חייבת לשמור venue/fill behavior ולא רק `behavior_candidate = MIDPRICE`.

---

## ‏5.23 `MidPrice` מול `Pegged-to-Midpoint`

| מאפיין | `MidPrice` | `Pegged-to-Midpoint` |
|---|---|---|
| שכבה | Broker Algo | Broker order variant / directed behavior |
| Routing | `SMART` | ‏Directed למניות US |
| מי בוחר destination | IBKR | ‏אנחנו/route שנבחר |
| מטרה | ‏midpoint-or-better | ‏peg ל־midpoint ביעד |
| Fallback behavior | ‏יכול להשתנות לפי IBKR | ‏תלוי Destination |
| Control | ‏נמוך יותר | ‏גבוה יותר |
| Operational complexity אצלנו | ‏נמוכה יותר | ‏גבוהה יותר |
| Determinism למחקר | ‏פחות | ‏יותר לפי route |

‏שניהם ראויים למחקר. הם פשוט עונים על שאלה אחרת.

---

## ‏5.24 מתי `MIDPRICE` יכולה להיות Candidate מצוינת

‏תרחיש טבעי:

```text
spread is meaningful
signal still has some life
we prefer midpoint improvement
but do not want to direct-route manually
```

‏במקרה כזה:

```text
BehaviorCandidate = MIDPRICE
Economic Price Bound = explicit
application_order_ttl = short
```

‏היא Challenger רצינית.

‏היא פחות מתאימה כאשר:

```text
signal is expiring now
and
missed-fill cost dominates half-spread savings
```

---

## ‏5.25 `Snap` — לחשב מחיר פעם אחת ואז להפסיק לרדוף

‏`Snap` נראית כמו Pegged בזמן יצירתה, אבל ההבדל הוא קריטי:

```text
Pegged:
reference moves -> order price keeps changing

Snap:
reference sampled -> initial limit calculated -> price stays fixed
```

‏עבורנו זה יכול להיות בדיוק האמצע בין:

```text
static manually-calculated limit
```

‏לבין:

```text
continual broker-managed reprice
```

---

## ‏5.26 `Snap to Market`

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מתעדת:

```text
SELL price = Bid + offset
BUY price  = Ask - offset
```

‏זו פקודה למניות/ETF ועוד, זמינה ב־`TWS` וב־`IBKR Desktop`, עם `SMART` או Direct Routing במוצרי US המתאימים.

‏המחיר מחושב בזמן ההגשה ואינו ממשיך להיצמד לשוק.

---

## ‏5.27 `Snap to Midpoint`

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏המחיר הראשוני:

```text
SELL = midpoint + offset
BUY  = midpoint - offset
```

‏והוא נשאר Limit לאחר החישוב הראשוני.

‏ברמת המנוע:

```text
ApplicationExecutionMode = MIDPOINT_SEEKING
BehaviorCandidate = SNAP_MIDPOINT
```

‏זה מעניין במיוחד אצלנו כ־Candidate ל־:

```text
get a midpoint-derived initial price
without continual repricing
```

---

## ‏5.28 `Snap to Primary`

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏המחיר הראשוני:

```text
SELL = Ask - offset
BUY  = Bid + offset
```

‏כלומר הוא מתחיל מהצד שלנו ב־NBBO ומשפר אותו לפי offset, אבל אינו ממשיך לעקוב אחרי השוק.

‏ב־IBKR הוא מתועד ל־US products וב־Directed routing.

---

## ‏5.29 כל משפחת `Snap` היא Broker-Simulated ב־IBKR

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מציינת ש־`Snap to Market`, ‏`Snap to Midpoint` ו־`Snap to Primary` מדומות על כל ה־exchanges.

‏זה אומר שה־Broker מחשב ומנהל את ה־initial transformation.

‏לפי ה־taxonomy הקנונית, `broker-simulated` מתאר **איך** ההתנהגות מיושמת; אין להסיק ממנו לבדו מהו ה־residency או מה ישרוד disconnect.

‏לכן צריך למדוד:

```text
quote_at_submit
snap_reference
computed_limit
ack_time
actual_first_working_price
```

‏כדי להבין מה קרה באמת בין Decision ל־Working Order.

---

## ‏5.30 `Snap` מול `Pegged` — הבחירה החשובה

‏השאלה אינה "איזו יותר חכמה".

‏השאלה היא:

> ‏האם אנחנו רוצים שהמחיר ימשיך להגיב לשוק בלי התערבות שלנו?

‏אם כן — Pegged יכולה להתאים.

‏אם לא — Snap יכולה לתת מחיר התחלתי מבוסס שוק ואז לעצור.

‏ב־Signal שחי שניות, דווקא העצירה הזו יכולה להיות יתרון: אין auto-chase אחרי שה־Order נוצרה.

---

## ‏5.31 `Snap` עדיין יכולה להפוך ל־Stale Order

‏העובדה שהיא לא רודפת אחרי השוק אינה אומרת שהיא בטוחה להשאיר.

‏אם:

```text
snap price calculated at t0
signal dies at t0 + 300ms
order still rests at old price
```

‏אפשר לקבל stale fill.

‏לכן Snap צריכה בדרך כלל:

```text
short application_order_ttl
signal-aware cancel
fill/cancel reconciliation
```

---

## ‏5.32 `IBKR ATS Pegged-to-Best`

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏`Pegged-to-Best` היא פקודה ייחודית ל־IBKR ATS עבור Stocks/ETFs אמריקאיים ב־Directed routing.

‏היא אינה מסתכלת רק על near-side NBBO. היא יכולה להתחרות גם מול same-side liquidity שמונחת בתוך IBKR ATS.

‏IBKR מתעדת שהמחיר יכול להיות one tick יותר אגרסיבי מהטוב מבין:

```text
near-side NBBO
or
best same-side resting ATS liquidity
```

‏עד מגבלה הקשורה ל־midpoint ול־offsets שהמשתמש מגדיר.

---

## ‏5.33 `Minimum Competing Size` — רעיון מקצועי חשוב

‏ב־Pegged-to-Best אפשר להגדיר כמות מצטברת מינימלית של same-side orders שמצדיקה תחרות במחיר טוב יותר.

‏זה פותר בעיה מעניינת:

> ‏לא לרדוף אחרי Order קטנה וזניחה רק מפני שהיא קפצה לפנינו.

‏ברובוט זו יכולה להיות הגנה מפני over-reaction ל־tiny displayed/ATS liquidity.

‏זה אינו baseline אצלנו כרגע, אבל העיקרון עשוי להיות שימושי גם במדיניות client-side עתידית.

---

## ‏5.34 `IBKR ATS Pegged-to-Midpoint`

‏IBKR מציעה גם גרסת ATS של Pegged-to-Midpoint עבור Stocks/ETFs אמריקאיים, עם Directed routing, ובפלטפורמות רחבות יותר כולל `TWS`, ‏`IBKR Desktop`, ‏`IBKR Mobile` ו־`Client Portal`.

‏היא מאפשרת resting midpoint liquidity בתוך IBKR ATS ויכולה לכלול offsets לפי כללי ATS.

‏מבחינתנו זו Candidate מתקדמת רק לאחר שנבין אם IBKR ATS נותנת לנו fill quality עדיפה על SMART/venues אחרים.

---

## ‏5.35 `Pegged-to-Benchmark`

‏`Pegged-to-Benchmark` מזיזה את מחיר Order אחת לפי תנועת Contract אחר.

‏רעיון:

```text
primary order
tracks movement of
reference contract
```

‏IBKR מתעדת ששני ה־contracts צריכים להשתמש באותו מטבע, ושהפקודה יכולה להגיב לשינוי reference ביחס ל־starting reference price.

‏זו פקודה חשובה למי שעושה relative-value, hedging או pair logic.

‏ל־core momentum שלנו היא כרגע פחות טבעית, אבל אם בעתיד Signal יוגדר כ־:

```text
stock momentum relative to SPY
stock momentum relative to QQQ
stock momentum relative to sector ETF
```

‏היא יכולה להפוך רלוונטית הרבה יותר.

---

## ‏5.36 `Retail Price Improvement` כקרובת משפחה רעיונית

‏`RPI` אינה Peg רגילה, אבל ב־IBKR היא מתנהגת רעיונית כמו liquidity-adding order עם offset מול best bid/offer ו־limit bound, במסגרת תוכנית Retail Price Improvement של NASDAQ.

‏IBKR מתעדת אותה ל־US stocks/ETFs בתנאים הרלוונטיים, עם `SMART` routing, ול־NASDAQ-listed stocks בהקשר המתואר.

‏למנוע שלנו היא אינה Candidate ראשונה, אבל חשוב לדעת שהיא קיימת משום שהיא מחברת:

```text
relative pricing
+
hidden price improvement liquidity
+
venue/program-specific eligibility
```

---

## ‏5.37 מה פחות רלוונטי כרגע — אבל עדיין צריך להכיר

‏IBKR מחזיקה גם משפחות Pegged שמכוונות יותר ל־Options או multi-leg execution, כגון `Pegged-to-Stock` ו־`Relative + Market` בהקשרים מסוימים.

‏אותן נלמד ברמת זיהוי מקצועי, אבל לא נקדיש להן את אותו נפח כמו לפקודות שממש יכולות להיכנס למנוע המניות שלנו.

‏זה כלל העומק שלנו:

```text
relevant to US-stock short-horizon execution -> deep
adjacent but not actionable for our engine -> know it, do not overbuild around it
```

---

## ‏5.38 `API` — אסור לייצג את כל המשפחה במחרוזת אחת

‏ב־`TWS API`, ה־Order object מכיל `orderType`, ‏`lmtPrice` ושדות נוספים המשמשים Order families מתקדמות. `ContractDetails.orderTypes` ו־`validExchanges` מאפשרים לנו לבדוק capabilities של Contract.

‏מבחינת הארכיטקטורה, עדיף מודל כגון:

```text
DynamicPricingPlan {
  behavior_candidate
  broker_primitive_or_algo
  reference
  offset
  economic_price_bound
  routing_policy
  destination
  continuous_reprice
  application_order_ttl
  signal_ttl
}
```

‏ולא:

```text
orderType = PEG
```

‏כי `Relative SMART`, ‏`Relative Directed`, ‏`Pegged-to-Midpoint`, ‏`MidPrice` ו־`Snap` הן combinations שונות של primitives, algos, routing ו־ownership.

---

## ‏5.39 למה Runtime Capability Discovery חשוב במיוחד כאן

‏משפחת Peg/Snap רגישה מאוד ל־:

```text
product
venue
route
region
platform
adapter
```

‏לכן נשתמש בשילוב:

```text
documented capability knowledge
+
ContractDetails.orderTypes
+
validExchanges
+
broker acceptance
+
acceptance evidence
```

‏לא נניח שהעובדה ש־TWS מציגה Order Type מסוימת אומרת שכל מניה וכל destination יקבלו אותה דרך ה־API, ובוודאי לא שהיא כבר `PRODUCTION_ENABLED`.

---

## ‏5.40 `Pegged` יכולה להפוך ל־Chase אוטומטי

‏זו אחת הסכנות המרכזיות.

‏אם:

```text
reference rises
peg follows
reference rises again
peg follows again
```

‏וה־bound רחב, יצרנו chase בלי לולאת chase מקומית.

‏לכן כל Pegged execution אצלנו תצטרך:

```text
economic_price_bound
signal_ttl
max_effective_price_deviation
cancel_on_edge_decay
cancel_on_market_data_stale
```

‏אוטומציה במחיר אינה אישור אינסופי להמשיך לשלם יותר.

---

## ‏5.41 `Snap` פותרת חלק מהבעיה הזאת — אבל יוצרת אחרת

‏Snap אינה ממשיכה לרדוף.

‏לכן היא מגבילה auto-chase.

‏אבל המחיר שקפא יכול להפוך מיושן.

‏כלומר:

```text
Peg risk  = moving too far
Snap risk = staying too long at stale price
```

‏שניהם דורשים `application_order_ttl`; הסיבה שונה.

---

## ‏5.42 Midpoint Execution ו־Adverse Selection

‏גם Fill במידפוינט אינו אוטומטית "free half-spread".

‏צריך לבדוק markout לאחר Fill.

‏אם midpoint fills מגיעים בעיקר רגע לפני תנועה נגדנו, ה־price improvement יכול להיעלם מיד.

‏לכן:

```text
price improvement
without
post-fill markout
```

‏הוא מדד חלקי ומטעה.

---

## ‏5.43 Dynamic Pricing ב־Exit — לא אותו intent כמו Entry

‏ב־Entry אנחנו יכולים לקבל no-fill ולבחור `NO TRADE`.

‏ב־Exit יש Position קיימת.

‏לכן Pegged/Midpoint יכולה להתאים ל־`NORMAL_EXIT` כאשר:

```text
we still have time
position risk is controlled
spread savings matter
```

‏אבל ב־`FAST_EXIT` או `EMERGENCY_REDUCE` היא יכולה להיות איטית מדי.

‏מכאן שה־taxonomy נשארת:

```text
ApplicationExecutionMode:
NORMAL_EXIT
FAST_EXIT
EMERGENCY_REDUCE

Behavior Candidate:
may be midpoint/pegged/aggressive depending on the mode
```

‏לא ניצור Modes כגון `ENTRY_PEGGED` רק משום שה־materialization משתמשת ב־Peg.

---

## ‏5.44 שילוב Pegged עם `IOC` אינו אוטומטי

‏Pegged Orders נועדו לעיתים לנוח ולהתעדכן.

‏`IOC` אומרת לא להשאיר remainder.

‏לכן צירוף כזה, כאשר בכלל נתמך, משנה מהותית את הרעיון.

‏אסור לייצר combinations על סמך שמות שדות בלבד. כל שילוב:

```text
broker primitive / algo
+
time/fill policy
+
routing policy
+
attributes
```

‏צריך capability verification נפרד.

---

## ‏5.45 המבחן הנכון: `Broker-managed reprice` מול `Client-managed reprice`

‏אנחנו צריכים להשוות לא רק מחיר Fill אלא מערכת שלמה:

```text
fill_rate
first_fill_latency
full_fill_latency
reprice_count
cancel_replace_count
queue_outcome
price_improvement
adverse_selection
missed_move
broker_rejections
net_edge_per_signal
```

‏יכול להיות ש־Pegged מפחיתה latency ומעלה Fill Rate אבל מגדילה adverse selection.

‏יכול להיות ש־Client-managed policy איטית יותר אבל מגיבה טוב יותר ל־Signal-specific information.

‏אין תשובה תיאורטית שתכריע בלי נתונים.

---

## ‏5.46 קבוצת ה־Behavior Challengers למחקר מוקדם

‏אחרי חמשת החלקים הראשונים, יש לנו קבוצת ניסוי מעניינת:

```text
A. PASSIVE_JOIN
B. MARKETABLE_LIMIT_IOC
C. RELATIVE_PRIMARY
D. MIDPRICE
E. SNAP_MIDPOINT
F. PEGGED_MIDPOINT_DIRECT
```

‏לכל אחת יש תפקיד אחר:

```text
A = simple passive baseline
B = immediate capped aggression
C = continuously adaptive passive/price-improving behavior
D = broker-managed midpoint search
E = midpoint-derived one-shot price
F = explicit directed midpoint peg
```

‏זה לא אומר שנשתמש בכולן ב־Live. המטרה היא לגלות איזה trade-off עובד בכל Market Regime.

---

## ‏5.47 מה נשאר `Advanced Challenger / Reference`

```text
IBKR ATS Pegged-to-Best
IBKR ATS Pegged-to-Midpoint
RPI
Pegged-to-Benchmark
```

‏לא משום שהן פחות מקצועיות, אלא משום שהן מוסיפות destination/program/reference complexity שמוצדקת רק אם baseline המחקר מראה צורך.

---

## ‏5.48 איך המנוע יבחר Family בזמן אמת

‏לא לפי שם הפקודה, אלא לפי state:

```text
signal_strength
signal_age
expected_edge
spread_ticks
spread_bps
quote_velocity
visible_depth
max_wait_ms
liquidity_intent
position_state
route_capability
```

‏דוגמת מחקר:

```text
if urgency is extreme:
    candidate = MARKETABLE_LIMIT_IOC
elif spread is wide and signal still has life:
    mode = MIDPOINT_SEEKING
    candidate = MIDPRICE or SNAP_MIDPOINT
elif passive intent and quote is moving:
    mode = BROKER_MANAGED
    candidate = RELATIVE_PRIMARY
elif want market-derived initial price without chase:
    candidate = SNAP_MIDPOINT
else:
    candidate = PASSIVE_JOIN
```

‏זו לא לוגיקת Production סופית; זו taxonomy נקייה לניסויים.

---

## ‏5.49 Telemetry ייעודית למשפחה

‏נוסיף:

```text
application_execution_mode
behavior_candidate
broker_primitive_or_algo
peg_family
peg_reference
offset_type
offset_value
economic_price_bound
routing_policy
destination
continuous_reprice
initial_effective_price
current_effective_price
reprice_count
reprice_up_count
reprice_down_count
midpoint_at_decision
midpoint_at_submit
midpoint_at_fill
price_improvement_vs_near_side
price_improvement_vs_mid
snap_reference
snap_fixed_price
broker_algo_name
```

‏ומדדים נגזרים:

```text
fill_rate_by_behavior
time_to_fill_by_behavior
reprice_to_fill_ratio
price_improvement_bps
missed_move_after_no_fill
markout_100ms
markout_500ms
markout_1s
markout_5s
net_edge_by_behavior
```

---

## ‏5.50 Failure Modes שחייבים לבדוק לפני Live

```text
unsupported route
order rejected because destination does not support type
offset invalid for venue
price rounded unexpectedly
bound reached and order stops following
SMART Relative remains high after bid falls
midpoint moves beyond economic value
Snap price becomes stale
partial fill while peg continues
cancel crosses with fill
broker reconnect returns live pegged order
market data stale while order still reprices externally
```

‏כל אחד מהתרחישים האלה צריך להפוך בעתיד לבדיקת קבלה או סימולציית failure.

---

## ‏5.51 מטריצת התאמה ראשונית למנוע שלנו

| כלי | שכבה קנונית | התאמה ראשונית | סיכון מרכזי |
|---|---|---|---|
| `RELATIVE_PRIMARY` | Behavior + Relative primitive/variant | `High/Challenger` | ‏SMART asymmetry / auto-chase |
| `PEGGED_MIDPOINT_DIRECT` | Behavior + directed pegged primitive | `High/Challenger` | ‏Direct routing / no-fill |
| `MIDPRICE` | Behavior + Broker Algo | `High/Challenger` | ‏execution path פחות deterministic |
| `Snap to Market` | Broker primitive/variant | `Medium/High` | ‏stale fixed limit |
| `SNAP_MIDPOINT` | Behavior + Snap primitive/variant | `High/Challenger` | ‏no-fill / stale order |
| `Snap to Primary` | Broker primitive/variant | `Medium/High` | ‏Directed routing / stale price |
| `IBKR ATS Pegged-to-Best` | destination-specific advanced behavior | `Advanced Challenger` | ‏ATS-specific complexity |
| `IBKR ATS Pegged-to-Midpoint` | destination-specific advanced behavior | `Advanced Challenger` | ‏destination dependence |
| `Pegged-to-Benchmark` | Broker primitive/variant | `Low now / Future` | ‏לא תואם core signal כיום |
| `RPI` | program-specific behavior | `Advanced/Future` | ‏eligibility/program dependence |

---

## ‏5.52 Recommendation למנוע בשלב הזה

‏המשפחה הזו מספיק רלוונטית כדי שלא נסתפק ב־Marketable Limit ו־Passive Limit בלבד.

‏ב־Research Harness נשמור תמיכה מפורשת לפחות ב־:

```text
RELATIVE_PRIMARY
MIDPRICE
SNAP_MIDPOINT
PEGGED_MIDPOINT_DIRECT
```

‏ומשווה אותם ל־:

```text
PASSIVE_JOIN
MARKETABLE_LIMIT_IOC
```

‏אבל שום dynamic pricing Behavior לא מקבלת פטור מ־:

```text
Economic Price Bound
application_order_ttl
signal validity
fill reconciliation
runtime capability checks
```

---

## ‏5.53 Practitioner Secrets — הדברים שקל מאוד לפספס

### ‏1. `Pegged` אינה "Limit שמתעדכנת"

‏ה־reference, route והכיוון שבו המחיר רשאי לזוז הם חלק מה־Order semantics.

### ‏2. `SMART Relative` יכולה להיות חד־כיוונית

‏זה הבדל מהותי מ־Directed Relative.

### ‏3. `MidPrice` אינה פשוט `Pegged-to-Midpoint + SMART`

‏היא Broker Algo שיכול לבחור execution paths שונים.

### ‏4. `Snap` אינה Peg איטית

‏היא חישוב חד־פעמי של מחיר ואז Limit קבועה.

### ‏5. Midpoint Fill אינו בהכרח Fill איכותי

‏חצי Spread שנחסך יכול להימחק ב־adverse markout רגע לאחר הביצוע.

### ‏6. `Economic Price Bound` אינו optional מבחינה כלכלית

‏גם אם ה־UI מאפשר להשאיר התנהגות רחבה יותר, המנוע צריך לדעת את worst acceptable economics שלו.

### ‏7. Routing הוא dimension נפרד שיכול לשנות semantics

‏במשפחה הזו במיוחד, `SMART` מול Directed יכול לשנות את ההתנהגות עצמה — אבל `Routing Policy` עדיין אינה Broker Order Primitive.

### ‏8. Fewer cancels אינם אוטומטית better execution

‏Peg יכולה לחסוך message churn אבל עדיין להיות גרועה יותר מבחינת Fill quality.

### ‏9. Repricing חיצוני לא פוטר אותנו מ־Market Data Monitoring

‏גם אם IBKR/Venue מזיזים את המחיר, המנוע חייב לדעת מתי ה־Signal או ה־Edge כבר אינם תקפים.

### ‏10. ה־Order הכי "אוטומטית" אינה בהכרח הטובה ביותר לרובוט

‏לפעמים דווקא `SNAP_MIDPOINT + application_order_ttl` נותנת state machine פשוטה וצפויה יותר מ־continual peg.

---

# ‏מקורות רשמיים לחלק 5

- ‏IBKR — Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR — Relative / Pegged-to-Primary בתוך Order Types and Algos: <https://investors.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR — Pegged-to-Midpoint בתוך Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php?menu=B>
- ‏IBKR — Snap to Market / Midpoint / Primary בתוך Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR — MidPrice Order Type release/documentation: <https://www.interactivebrokers.com/en/general/tws-notes-975.php>
- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR TWS API — `ContractDetails` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/contract-details>
- ‏IBKR API — Order Types introduction: <https://www.interactivebrokers.com/docs/general/order-types/introduction>

---

# ‏Checkpoint — סוף חלק 5

‏בחלק הזה הפרדנו בין ארבע משפחות שנראות במבט ראשון דומות אבל שייכות לשכבות שונות ומעבירות אחריות שונה בין המנוע, IBKR וה־Venue: `Relative/Pegged-to-Primary`, ‏`Pegged-to-Midpoint`, ‏`MidPrice` ו־`Snap`.

‏למדנו שהשאלה המקצועית אינה רק "באיזה מחיר Order נמצאת עכשיו", אלא **מי רשאי לשנות אותו, לפי איזה reference, באיזה כיוון, עד איזה Economic Price Bound, תחת איזה Routing Policy ובאיזה ownership model**.

‏ה־Behavior Challengers המרכזיים למחקר הם `RELATIVE_PRIMARY`, ‏`MIDPRICE`, ‏`SNAP_MIDPOINT` ו־`PEGGED_MIDPOINT_DIRECT`, לצד `PASSIVE_JOIN` ו־`MARKETABLE_LIMIT_IOC` — בלי לבלבל ביניהם לבין Broker primitives, Broker Algos או Routing Policies.

‏החלק הבא יהיה **חלק 6 — Stops, Trailing, Bracket, OCA/OCO ו־Conditional Orders**. שם `Bracket` תקבל טיפול עמוק במיוחד ברמת Production: parent/child lifecycle, partial fills, transmit sequencing, OCA races, orphan children, double exits, reconnect/recovery, broker-resident protection מול client-managed exits ו־Failure Matrix מלא — בלי לגרוע מהעומק של Stop, Stop-Limit, Trailing, Adjustable ו־Conditional Orders הרלוונטיות למנוע.

---

# ‏חלק 5A — Dynamic Pricing Decision Guide: ‏`Relative`, ‏`MidPrice`, ‏Directed `Pegged-to-Midpoint` ו־`Snap Midpoint`

> ‏הפרק הזה הוא שכבת Decision מעל Part 5. הוא אינו מוסיף Order Types חדשים; הוא עונה על השאלה המקצועית: **כאשר כמה Candidates גוזרות מחיר מהשוק, מי מנהל את שינוי המחיר, האם השינוי חד־פעמי או מתמשך, ומה קורה כשה־Signal המקומי משתנה לפני שה־Order מסתיימת?**

---

## ‏5A.1 ארבע Candidates — ארבעה מודלי שליטה שונים

```text
RELATIVE_PRIMARY
MIDPRICE
PEGGED_MIDPOINT_DIRECT
SNAP_MIDPOINT
```

‏כולן יכולות להיראות כמו "מחיר חכם שקשור ל־NBBO", אבל הן שונות לפחות בצירים הבאים:

```text
reference source
continuous vs one-shot repricing
routing ownership
broker/venue delegation
local determinism
auto-chase risk
stale-price risk
```

> ‏`ENGINE RULE` — Dynamic pricing family אינה enum אחת. ‏Behavior Candidate, ‏Broker primitive/algo ו־Routing Policy נשארים dimensions נפרדים.

---

## ‏5A.2 Comparison Matrix — מי מחזיק את המחיר

| Candidate | Reference עיקרי | מחיר משתנה אחרי submit? | מי מנהל שינוי | Routing | הסיכון המרכזי |
|---|---|---:|---|---|---|
| `RELATIVE_PRIMARY` | same-side NBBO + offset | כן | Broker/Venue לפי semantics | SMART או Directed לפי plan/capability | auto-reprice שאינו יודע שה־Signal מת |
| `MIDPRICE` | midpoint-or-better logic | כן, broker-managed | IBKR Broker Algo | SMART | פחות determinism לגבי path/destination |
| `PEGGED_MIDPOINT_DIRECT` | midpoint | כן | Venue/Broker path | Directed | destination dependence + no-fill |
| `SNAP_MIDPOINT` | midpoint בזמן submit | **לא** | Broker מחשב פעם אחת; אחר כך Limit קבועה | לפי capability/concrete plan | fixed price נהיית stale |

‏הבדל הזיכרון החשוב:

```text
Relative            = follow same-side reference
MidPrice            = broker-managed SMART midpoint search
Pegged Midpoint     = continuously follow midpoint on explicit destination path
Snap Midpoint       = sample midpoint once, then stop following
```

---

## ‏5A.3 `RELATIVE_PRIMARY` — Decision Card

### ‏What

‏Dynamic pricing behavior שמצמידה את המחיר ל־same-side best quote בתוספת/הפחתת offset, לפי route semantics, עד `Economic Price Bound`.

### ‏Why

‏כדי להישאר תחרותיים בלי client-side cancel/replace בכל שינוי Quote.

### ‏When

```text
passive / price-improving intent remains valid
quote is moving enough that static join becomes stale quickly
signal life is long enough to justify continuous repricing
Economic Price Bound is explicit
route-specific semantics are validated
```

### ‏Why Not

‏Broker/Venue יודעים שה־quote זזה; הם אינם יודעים שה־private Signal שלנו נחלשה. ב־SMART קיימת גם asymmetry מתועדת שיכולה להשאיר BUY במחיר גבוה יותר לאחר נסיגה ב־Bid.

### ‏Closest Alternative

`PASSIVE_JOIN` כאשר רוצים מחיר סטטי ושליטה מקומית פשוטה יותר; `SNAP_MIDPOINT` כאשר רוצים market-derived initial price בלי continual repricing.

### ‏Main Failure Mode

```text
reference rises
→ effective price rises
→ signal deteriorates locally
→ broker-managed order remains economically executable
```

### ‏For Our Engine

```text
RESEARCH_CHALLENGER
```

---

## ‏5A.4 `MIDPRICE` — Decision Card

### ‏What

‏`IBKR` Broker Algo שמחפש midpoint-or-better execution באמצעות SMART routing ויכול לבחור execution path פנימי בהתאם למצב השוק והיעדים הזמינים.

### ‏Why

‏כדי להאציל לברוקר גם midpoint execution search וגם חלק מה־routing logic, במקום שה־client יבחר destination ומנגנון peg בעצמו.

### ‏When

```text
spread is economically meaningful
signal still has useful life
midpoint price improvement is valuable
manual direct-routing logic is undesirable
broker-managed path is acceptable
```

### ‏Why Not

‏ה־path פחות deterministic מבחינת המחקר המקומי, ו־midpoint fill probability עלולה להיות נמוכה בדיוק בזמן Momentum חזק.

### ‏Closest Alternative

`PEGGED_MIDPOINT_DIRECT` אם רוצים midpoint peg עם destination מפורש; `SNAP_MIDPOINT` אם רוצים מחיר midpoint-derived קבוע לאחר submit.

### ‏Main Failure Mode

```text
broker algo remains valid by broker constraints
but signal half-life expires locally
or midpoint no-fill causes missed move
```

### ‏For Our Engine

```text
RESEARCH_CHALLENGER
```

---

## ‏5A.5 `PEGGED_MIDPOINT_DIRECT` — Decision Card

### ‏What

‏Continuous midpoint peg במסלול Directed התומך בכך, עם destination semantics מפורשים ו־Limit/`Economic Price Bound` מתאים.

### ‏Why

‏כדי לקבל midpoint repricing מתמשך תוך שליטה גבוהה יותר ב־destination לעומת Broker Algo מסוג `MidPrice`.

### ‏When

```text
midpoint execution is desired
explicit destination behavior matters
route capability is validated
destination-specific telemetry is available
signal can tolerate potential no-fill
```

### ‏Why Not

‏Direct routing מגדיל operational responsibility; destination מסוים יכול להיות פחות מתאים מ־SMART aggregate search, וה־Order עדיין יכולה להישאר ללא Fill בזמן שהשוק בורח.

### ‏Closest Alternative

`MIDPRICE` כאשר רוצים להעביר בחירת destination ל־IBKR SMART; `SNAP_MIDPOINT` כאשר continual midpoint following אינו רצוי.

### ‏Main Failure Mode

```text
midpoint keeps moving
order follows legally within bound
but chosen destination provides poor/no contra liquidity
```

### ‏For Our Engine

```text
RESEARCH_CHALLENGER
```

---

## ‏5A.6 `SNAP_MIDPOINT` — Decision Card

### ‏What

‏Broker computes a Limit from midpoint at submit time; לאחר החישוב המחיר נשאר קבוע ואינו ממשיך לעקוב אחרי midpoint.

### ‏Why

‏כדי לקבל market-derived initial price בלי continual broker-managed chase.

### ‏When

```text
midpoint is a useful reference now
we want deterministic fixed price after submit
continuous repricing is undesirable
short local application_order_ttl is enforceable
```

### ‏Why Not

‏המחיר שקפא יכול להפוך stale במהירות. עצירת chase אינה מבטלת stale-fill risk.

### ‏Closest Alternative

`PEGGED_MIDPOINT_DIRECT` כאשר רוצים להמשיך לעקוב אחרי midpoint; static client-calculated Limit כאשר איננו צריכים Broker-side one-shot calculation.

### ‏Main Failure Mode

```text
snap price calculated at t0
market changes materially
signal weakens
old fixed limit remains executable
```

### ‏For Our Engine

```text
RESEARCH_CHALLENGER
```

---

## ‏5A.7 Timeline — אותו Quote, ארבע התנהגויות שונות

‏נשתמש בדוגמה רעיונית ל־BUY. המספרים נועדו להמחיש ownership/lifecycle, לא לשחזר כל route-specific pricing rule של Broker.

### ‏Policy בתחילת הדוגמה

```text
Economic Price Bound = 50.05
Relative offset      = +0.01 from same-side bid
Snap offset          = 0 from midpoint
```

### ‏Market Timeline

| זמן | Bid | Ask | Mid |
|---|---:|---:|---:|
| `t0` | 50.00 | 50.04 | 50.02 |
| `t1` | 50.01 | 50.05 | 50.03 |
| `t2` | 50.03 | 50.05 | 50.04 |
| `t3` | 49.99 | 50.03 | 50.01 |

### ‏`RELATIVE_PRIMARY`

‏ב־`t0` היא יכולה להתחיל סביב same-side reference + offset.

‏כאשר Bid עולה ב־`t1`/`t2`, effective price יכולה לעלות בהתאם עד ה־bound ובהתאם ל־route semantics.

‏ב־`t3`, אסור למנוע להניח שהמחיר בהכרח ירד חזרה עם Bid; ב־SMART Relative קיימת asymmetry route-specific שנלמדה ב־Part 5.

‏המסקנה:

```text
continuous reference following
+
route-specific directionality
```

### ‏`MIDPRICE`

‏בכל אחד מהמצבים IBKR מנהלת midpoint-oriented execution search דרך SMART.

‏המנוע המקומי אינו אומר:

```text
set exact order price = current midpoint
```

‏אלא:

```text
use broker-managed midpoint behavior
within our constraints
```

‏לכן `t0 → t3` הוא רצף שבו ה־Broker Algo יכולה לבחור paths שונים; telemetry חייבת למדוד outcome בפועל.

### ‏`PEGGED_MIDPOINT_DIRECT`

‏ה־effective reference משתנה יחד עם midpoint:

```text
t0 mid = 50.02
t1 mid = 50.03
t2 mid = 50.04
t3 mid = 50.01
```

‏ה־Order ממשיכה לעקוב אחרי midpoint לפי destination semantics כל עוד היא Working וה־bound מאפשר.

‏המסקנה:

```text
continuous midpoint repricing
+
explicit destination ownership
```

### ‏`SNAP_MIDPOINT`

‏ב־`t0` ה־Broker מחשב מחיר התחלתי מתוך midpoint:

```text
snap_fixed_price ≈ 50.02
```

‏לאחר מכן:

```text
t1 -> remains fixed
t2 -> remains fixed
t3 -> remains fixed
```

‏עד Modify/Cancel/terminal event.

‏המסקנה:

```text
market-derived at creation
!=
market-following after creation
```

---

## ‏5A.8 מה ה־timeline מלמד

‏אם ה־שוק עולה מ־`t0` ל־`t2`:

- ‏`Relative` ו־`Pegged Midpoint` יכולות להמשיך לנוע.
- ‏`MidPrice` ממשיכה Broker-managed midpoint search.
- ‏`Snap Midpoint` נשארת מאחור במחיר שחושב ב־`t0`.

‏אם השוק נופל ב־`t3`:

- ‏Directed midpoint peg יכולה לנוע בהתאם ל־destination semantics.
- ‏SMART Relative אינה בהכרח סימטרית כלפי מטה ב־BUY.
- ‏MidPrice נשארת Broker-managed ולכן צריך למדוד את ההתנהגות בפועל.
- ‏Snap נשארת בדיוק במחיר הקבוע שלה ועלולה להפוך stale/aggressive יחסית לשוק החדש.

‏כלומר אין “dynamic order” אחת. יש ownership models שונים לחלוטין.

---

## ‏5A.9 Direct Elimination Questions

```text
Do we need the order price to remain fixed after submit?
YES -> eliminate continuous pegs; SNAP_MIDPOINT may survive

Do we need continual same-side quote following rather than midpoint?
YES -> RELATIVE_PRIMARY may survive

Do we need midpoint behavior with broker-selected destinations?
YES -> MIDPRICE may survive

Do we need explicit directed midpoint semantics?
YES -> PEGGED_MIDPOINT_DIRECT may survive

Is the signal too short to tolerate midpoint no-fill / delegated repricing?
YES -> eliminate midpoint/managed candidates and return to broader execution decision

Is Economic Price Bound stale or unknown?
YES -> eliminate all candidates that could continue repricing
```

> ‏`ENGINE RULE` — Routing preference אינה סיבה מספקת לבחור Candidate. קודם intent/lifecycle fit, אחר כך capability/routing fit.

---

## ‏5A.10 Continuous Repricing מול One-Shot Price Derivation

‏זה ה־decision split החשוב ביותר במשפחה:

```text
CONTINUOUS:
RELATIVE_PRIMARY
MIDPRICE
PEGGED_MIDPOINT_DIRECT

ONE_SHOT:
SNAP_MIDPOINT
```

‏ב־Continuous family הסיכון הוא:

```text
auto-chase / externally managed price survives local signal decay
```

‏ב־One-Shot family הסיכון הוא:

```text
fixed price becomes stale while still executable
```

‏לכן לשתיהן נדרש `application_order_ttl`, אבל מסיבות שונות.

---

## ‏5A.11 Broker-managed versus Client-managed Control

‏ה־client תמיד שומר ownership על:

```text
signal validity
Economic Price Bound
application_order_ttl
position / exposure rules
cancel decision
```

‏הוא יכול להאציל:

```text
price reference following
route selection
midpoint search
one-shot price derivation
```

‏אבל delegated pricing אינה delegated strategy.

> ‏`ENGINE RULE` — Broker knows market mechanics; Broker does not know private signal decay.

---

## ‏5A.12 Pairwise Decision — `MIDPRICE` מול `PEGGED_MIDPOINT_DIRECT`

### ‏בחר `MIDPRICE` למחקר כאשר

```text
we want SMART broker-managed midpoint search
we do not want to own destination selection
some path nondeterminism is acceptable
```

### ‏בחר `PEGGED_MIDPOINT_DIRECT` למחקר כאשר

```text
we want explicit destination semantics
we want route-level attribution
we accept more operational responsibility
```

### ‏אל תכריע לפי

```text
which name sounds more advanced
```

‏הכרעה דורשת evidence של:

```text
useful_fill_rate
price_improvement
missed_move
post_fill_markout
venue/destination behavior
```

---

## ‏5A.13 Pairwise Decision — `SNAP_MIDPOINT` מול continuous midpoint

### ‏`SNAP_MIDPOINT`

‏מתאימה יותר כאשר:

```text
we trust the current midpoint reference
we do not want automatic chase
we prefer fixed-price lifecycle after submit
```

### ‏Continuous midpoint behavior

‏מתאימה יותר כאשר:

```text
midpoint is expected to move while intent remains valid
we want the order to remain aligned without client modify loop
```

‏השאלה היא לא רק Fill probability; היא גם:

```text
what type of stale state are we willing to own?
```

---

## ‏5A.14 Pairwise Decision — `RELATIVE_PRIMARY` מול midpoint family

‏`RELATIVE_PRIMARY` עוקבת אחרי **same-side quote**; midpoint family מתמקדת ב־**inside-spread midpoint**.

‏לכן:

```text
Need to stay competitive on our side of book?
→ Relative

Need to seek contra liquidity around midpoint?
→ Midpoint family
```

‏אלה אינם שני implementations של אותו intent; לעיתים הם מבטאים liquidity posture שונה לחלוטין.

---

## ‏5A.15 Counterexample — “Midpoint תמיד חוסך חצי Spread”

‏נניח:

```text
spread = 4 cents
midpoint fill saves 2 cents
```

‏אבל אם midpoint no-fill גורם לפספוס מהלך של 12 cents, או אם Fill מגיעה בדיוק לפני adverse move של 5 cents, “חצי Spread שנחסך” אינו ה־outcome הכלכלי האמיתי.

‏לכן:

```text
price_improvement
+
fill probability
+
missed move
+
post-fill markout
```

‏נמדדים יחד.

---

## ‏5A.16 Counterexample — “Snap בטוחה יותר כי היא לא רודפת”

‏נניח שה־Snap נקבעה ב־50.02.

‏אחרי 400ms:

```text
Bid = 49.98
Ask = 50.00
signal = weakened
```

‏Limit קבועה ב־50.02 יכולה להיות אגרסיבית מדי יחסית ל־market state החדש.

‏כלומר:

```text
no auto-chase
!=
no stale-price risk
```

---

## ‏5A.17 Counterexample — “Pegged עדיפה כי היא חוסכת cancel/replace”

‏פחות client-side messages יכולים להיות יתרון תפעולי, אך אינם objective function.

‏Peg יכולה לבצע יותר reprices ועדיין להפיק:

```text
worse markout
higher price concession
more stale-signal fills
```

‏ולכן נמדוד outcome, לא רק message count.

---

## ‏5A.18 Decision Example — Spread רחב, Signal עדיין חי

‏נניח:

```text
spread = 6 cents
remaining_signal_life = 2.5s
missed-move cost = moderate
midpoint savings = economically material
Economic Price Bound = valid
```

‏Survivors אפשריים:

```text
MIDPRICE
SNAP_MIDPOINT
PEGGED_MIDPOINT_DIRECT
```

‏השאלות המכריעות:

```text
Need fixed price after submit?
→ SNAP_MIDPOINT

Need SMART broker-managed venue search?
→ MIDPRICE

Need explicit destination midpoint semantics?
→ PEGGED_MIDPOINT_DIRECT
```

‏`RELATIVE_PRIMARY` יכולה להישאר Candidate רק אם same-side quote following תואם את liquidity intent; היא אינה midpoint substitute.

---

## ‏5A.19 Decision Example — Quote זזה מהר, Passive intent נשמר

‏נניח:

```text
passive/price-improving intent = required
same-side quote migrates frequently
client cancel/replace churn = costly
midpoint liquidity is not the desired posture
```

‏אז `RELATIVE_PRIMARY` היא Challenger טבעית מול `PASSIVE_JOIN`/client-managed repricing.

‏השאלה המחקרית:

```text
Does broker-managed same-side repricing improve net execution outcome
without producing stale-signal fills or excessive price concession?
```

---

## ‏5A.20 Partial Fill ו־Repricing

‏Partial Fill בכל אחת מהמשפחות יוצרת Decision State חדשה.

‏אסור להניח:

```text
remaining_qty should continue under original dynamic pricing rule automatically
```

‏לאחר Fill נעדכן:

```text
reconciled_position
remaining_qty
protection responsibility
remaining signal life
Economic Price Bound
exit feasibility
```

‏ורק אז נחליט אם remainder נשארת, מתבטלת או עוברת Candidate אחרת.

---

## ‏5A.21 Metrics להשוואה הוגנת

```text
useful_fill_rate
time_to_first_fill
time_to_useful_fill
price_improvement_vs_near_side
price_improvement_vs_midpoint
reprice_count
reprice_up_count
reprice_down_count
price_level_count
cancel_replace_count
missed_move_if_no_fill
stale_signal_fill_rate
stale_fixed_price_incidents
bound_hit_rate
post_fill_markout_100ms
post_fill_markout_500ms
post_fill_markout_1s
net_edge_after_execution
```

‏ל־`MIDPRICE` ו־Directed midpoint נוסיף route/destination attribution; ל־`SNAP_MIDPOINT` נשמור `snap_reference` ו־`snap_fixed_price`.

---

## ‏5A.22 Decision Record מומלץ

```text
DynamicPricingDecision {
  snapshot_id
  signal_remaining_life_ms
  liquidity_intent
  reference_type
  economic_price_bound
  requires_continuous_reprice
  routing_requirement
  survivors[]
  eliminated[] { candidate, reason_code }
  selected_candidate
  closest_alternative
  decision_reason
  application_order_ttl
  failure_destination
}
```

‏כך Replay יכול להסביר לא רק איזו Candidate נבחרה, אלא **איזה ownership model של price movement נבחר**.

---

## ‏5A.23 Acceptance Tests

```text
1. SNAP_MIDPOINT never silently becomes a continuous peg after initial price derivation.
2. Continuous dynamic-pricing candidate is invalidated when Economic Price Bound becomes stale or violated.
3. MIDPRICE remains classified as Broker Algo + Behavior Candidate, not directed peg.
4. PEGGED_MIDPOINT_DIRECT always carries an explicit directed-routing requirement in the plan.
5. RELATIVE_PRIMARY remains distinct from midpoint-seeking candidates.
6. SMART Relative is never assumed to reprice symmetrically in both directions.
7. Signal invalidation triggers fresh cancel/reconcile decision for every still-working dynamic-pricing order.
8. Partial fill creates a fresh decision before remainder policy continues.
9. Price-improvement metric alone cannot determine research winner.
10. Same snapshot + same policy yields the same survivor set and selected candidate.
```

---

## ‏5A.24 Practitioner Insight

> ‏`ENGINE RULE` — השאלה החשובה ביותר ב־dynamic pricing אינה “מה המחיר עכשיו?”, אלא **מי רשאי לשנות אותו לאחר submit, לפי איזה reference, ולכמה זמן ההרשאה הזו נשארת חוקית מבחינת ה־Signal שלנו**.

‏הדרך לזכור את המשפחה:

```text
Relative        = follow our side
MidPrice        = delegate midpoint search to SMART broker algo
Pegged Midpoint = continuously follow midpoint on directed path
Snap Midpoint   = derive midpoint price once, then freeze
```

---

# ‏Checkpoint — סוף חלק 5A

‏יצרנו שכבת Decision אחידה ל־`RELATIVE_PRIMARY`, ‏`MIDPRICE`, ‏`PEGGED_MIDPOINT_DIRECT` ו־`SNAP_MIDPOINT`. לכל Candidate יש `What / Why / When / Why Not / Closest Alternative / Main Failure Mode / For Our Engine`, ונוסף timeline שמראה כיצד אותה סדרת Quotes מייצרת lifecycle שונה לחלוטין לפי ownership של repricing. העיקרון הקנוני נשאר: delegated pricing אינה delegated strategy; ה־client עדיין מחזיק Signal validity, ‏`Economic Price Bound`, ‏TTL, exposure ו־cancel authority.

# ‏חלק 6 — Trigger, Protection ו־Composite Structures: ‏Stops, Trailing, Bracket, OCA/OCO ו־Conditional Orders

> ‏לפי ה־taxonomy הקנונית ב־`00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md`, הפרק הזה אינו משפחה אחת של "Order Types". הוא משלב `Trigger Policy`, ‏post-trigger execution, ‏dependency, ‏predicate, ‏mutual-exclusion/quantity coordination ו־composite order structures. ‏`Venue-Native`, ‏`Broker-Managed/Broker-Simulated`, ‏`Broker-Resident` ו־`Client-Managed` הם dimensions נפרדים.

## ‏6.1 לפני השמות: ארבעה מנגנונים ושתי שאלות שחייבים להפריד

‏המשפחה הזו מערבבת ארבעה רעיונות שונים:

```text
Trigger
Dependency
Mutual exclusion / quantity coordination
Predicate
```

‏ובפקודה מבוססת Trigger תמיד יש שתי שאלות שונות:

```text
WHEN does activation happen?
WHAT execution behavior happens after activation?
```

‏`Stop` ו־`Trailing` עוסקות קודם כול ב־Trigger: מתי Order משנה מצב או הופכת executable; לאחר מכן חייבים לשאול האם post-trigger execution היא Market-style, ‏Limit-style או transformation אחרת.

‏`Bracket` היא `Composite Order Structure`: children קשורות ל־parent ואמורות לנהל/להגן על Position שנוצרה מה־parent.

‏`OCA/OCO` הן relationships של mutual exclusion / quantity coordination: ביצוע של Order אחת אמור לגרום לביטול או התאמה של האחרות, אך אינו מבטיח transaction אטומית.

‏`Conditional` מוסיפה Predicate: Order פעילה או מתבטלת רק כאשר תנאי מסוים מתקיים.

> ‏`ENGINE RULE` — במנוע Production אסור להכניס את כולן למחלקה אחת בשם `advancedOrder`. כל מנגנון מייצר lifecycle ו־failure modes אחרים.

---

## ‏6.2 `Stop` — Trigger ואז Market-Style Execution

‏פקודת `Stop` רגילה אינה Market Order פעילה מהרגע הראשון. היא מחכה ל־trigger.

‏כאשר ה־trigger מתקיים, ההתנהגות הופכת בקירוב ל־Market-style execution.

‏לכן היא מפרידה בין:

```text
trigger policy / trigger price
```

‏לבין:

```text
post-trigger execution behavior
actual execution price
```

‏והם אינם חייבים להיות זהים.

> ‏`ENGINE RULE` — בקורס, כאשר נאמר `Stop` בלי qualifier בהקשר הזה, הכוונה היא ל־Stop עם Market-style execution לאחר trigger; ‏`Stop Limit` היא Trigger דומה עם Limit-style execution לאחר trigger.

---

## ‏6.3 למה Stop Price אינה מחיר יציאה מובטח

‏נניח Position Long והגנה:

```text
stop trigger = 50.00
```

‏אם השוק עובר במהירות מ־50.03 ל־49.90, עצם העובדה שה־Stop הופעלה ב־50.00 אינה אומרת שנקבל Fill ב־50.00.

‏ה־Stop מגדירה **מתי להתחיל לחפש יציאה**, לא worst acceptable execution price.

‏לכן Stop רגילה מתאימה למצבים שבהם:

```text
position certainty > price certainty
```

‏אבל היא יכולה להיות יקרה במונחי slippage בזמן gap או burst של volatility.

---

## ‏6.4 `Trigger Method` הוא חלק מה־Order semantics

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מתעדת שב־simulated stop orders ניתן להשתמש ב־default trigger methodology שלה או לבחור trigger methodology מותאמת, ושה־default עשוי להשתנות לפי Product.

‏מכאן ש־:

```text
stop_price = 50.00
```

‏אינו תיאור מלא.

‏המנוע צריך לדעת גם:

```text
what market event can trigger it?
last?
bid/ask?
double bid/ask?
other broker-defined trigger logic?
```

‏את ה־trigger הספציפי נוודא לפי Product/Route לפני Live.

---

## ‏6.5 `Venue-Native`, ‏`Broker-Simulated` ו־`Broker-Resident` אינם אותו דבר

> ‏`FACT` — IBKR מציינת שחלק מסוגי ה־Stop יכולים להיות Native בבורסה וחלקם simulated על ספרי IBKR, לפי Exchange ו־Order Type.

‏זה חשוב כי simulated trigger תלוי גם ב־market data וב־filters של Broker.

‏לכן צריך לשמור שלושה דברים בנפרד:

```text
where the instruction/state lives
who evaluates the trigger
whether the final instruction is venue-native
```

‏לדוגמה:

```text
broker-resident
+
broker-simulated trigger
```

‏אינו שקול ל־:

```text
venue-native stop inside matching engine
```

‏ועלינו לשמור Capability/Route/implementation metadata יחד עם ההגנה.

---

## ‏6.6 הסיכון הייחודי של Simulated Stop

‏IBKR מזהירה באופן כללי ש־simulated orders יכולות להיות מושפעות מ־:

```text
missing or inconsistent market data
data filters
erroneous trades
halts/interruption
third-party performance issues
```

‏לכן Stop אצל Broker היא שכבת הגנה חשובה, אבל אינה הצדקה למחוק מן המנוע:

```text
position monitoring
market-data health
broker connectivity health
reconciliation
```

---

## ‏6.7 `Stop Limit` — Trigger ואז Limit-Style Execution

‏`Stop Limit` מפרידה לשני מחירים:

```text
stop trigger
limit execution boundary
```

‏כאשר ה־trigger מתקיים, Order הופכת ל־Limit במקום Market-style execution.

‏כך אנחנו מגבילים price risk — אבל מקבלים סיכון חדש:

```text
triggered
but not filled
```

‏וזו נקודה קריטית במיוחד ביציאה מפוזיציה.

---

## ‏6.8 `Stop` מול `Stop Limit`: איזה סיכון אנחנו מעדיפים?

| כלי | הסיכון שאנחנו מקבלים | הסיכון שאנחנו מצמצמים |
|---|---|---|
| `Stop` | ‏Slippage / execution price לא ידוע | ‏סיכוי גבוה יותר לצאת לאחר trigger |
| `Stop Limit` | ‏Position יכולה להישאר פתוחה | ‏מונע execution מעבר ל־limit |

‏לכן אין "בטוח יותר" באופן מוחלט.

‏`Stop` מגינה יותר על **יציאה**.

‏`Stop Limit` מגינה יותר על **מחיר**.

‏במנוע קצר־טווח, זו החלטת Risk Policy — לא preference של UI.

---

## ‏6.9 Gap הוא מבחן האמת של Stop-Limit

‏נניח:

```text
stop = 50.00
limit = 49.95
```

‏והשוק קופץ ישירות ל־49.80.

‏ה־trigger יכול להתקיים, אבל Limit ב־49.95 אינה executable מול Bid נמוך יותר.

‏התוצאה האפשרית:

```text
risk detected
protection triggered
position still open
```

‏לכן Stop-Limit אינה disaster protection אוטומטית. היא compromise.

---

## ‏6.10 `Trailing Stop` — Trigger Policy עם Ratchet

‏Trailing Stop מזיזה את ה־trigger בכיוון המיטיב, אבל אינה מחזירה אותו לאחור כאשר השוק נסוג.

‏ב־SELL trailing stop על Position Long:

```text
market rises -> stop rises
market falls -> stop does not fall
```

‏זה מנגנון `ratchet`.

‏הוא מאפשר ל־risk boundary להתקרב למחיר תוך כדי תנועה חיובית בלי שהמנוע ישלח כל שינוי בעצמו.

---

## ‏6.11 Trailing Amount מול Trailing Percent

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏ב־`TWS API` קיימים `auxPrice`/trailing amount וגם `trailingPercent`; התיעוד מציין שהם mutually exclusive.

‏לכן במודל שלנו:

```text
trail_mode = ABSOLUTE | PERCENT
trail_value
```

‏ולא שני שדות שיכולים להיות פעילים יחד.

---

## ‏6.12 למה Trailing יכולה להיות מסוכנת במיקרו־מומנטום

‏ב־holding של שניות, normal microstructure noise יכול להיות גדול ביחס ל־trail קטן.

‏Trail צר מדי יכול לייצר:

```text
good entry
small favorable move
normal one-tick pullback
trigger
premature exit
```

‏Trail רחב מדי יכול להפוך את ההגנה ללא רלוונטית ביחס ל־Edge הקטן.

‏לכן trailing distance חייב להיות קשור לפחות ל־:

```text
spread
short-horizon volatility
quote noise
expected edge
position age
```

‏ולא percentage קבוע לכל המניות.

---

## ‏6.13 `Trailing Stop Limit` — Ratchet עם Limit-Style Post-Trigger Execution

‏Trailing Stop Limit מזיזה גם stop trigger וגם limit price לפי trailing amount ו־limit offset.

‏כאשר ה־trigger מופעל, נשלחת Limit לפי המחיר המחושב האחרון.

‏אנחנו שוב מקבלים trade-off:

```text
trail adapts automatically
+
explicit execution boundary
-
risk of triggered-but-unfilled exit
```

---

## ‏6.14 `Limit Offset` ב־Trailing Stop Limit דורש משמעת

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מתעדת שב־`TRAIL LIMIT` יש `lmtPriceOffset`, ושלא שולחים במקביל גם explicit limit price וגם limit-price offset באותה צורה.

‏לכן adapter צריך validate combinations לפני שליחה ולא לתת ל־Strategy לייצר payload בלתי חוקי.

---

## ‏6.15 Trailing אינה תחליף למנוע Exit

‏Trailing יודעת לעקוב אחרי מחיר.

‏היא אינה יודעת:

```text
momentum reversed
spread exploded
order flow disappeared
signal score collapsed
market data became stale
```

‏לכן אצלנו Trailing היא Broker-managed trigger behavior שיכול להיות Candidate להגנה או exit style מסוים; היא אינה `Application Execution Mode` ואינה תחליף לכל ה־Exit Intelligence.

---

## ‏6.16 `Adjustable Stop` — Transforming Order במקום Trigger שמוציא מיד

‏Adjustable Stop מעניינת משום שה־trigger שלה אינו בהכרח אומר "צא עכשיו".

‏IBKR מתעדת שאפשר להגדיר trigger שגורם **לשינוי של ה־parent stop order** לסוג/מחיר אחר.

‏לדוגמה רעיונית:

```text
initial stop
when price reaches X:
    transform parent into tighter stop
```

‏זו דוגמה ל־`TRANSFORMING ORDER`: trigger מפעיל state transition של Order קיימת, ולא בהכרח ביצוע מיידי.

---

## ‏6.17 שדות API של Adjustable Stop

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏`TWS API Order` כולל בין היתר:

```text
adjustedOrderType
triggerPrice
adjustedStopPrice
adjustedStopLimitPrice
adjustedTrailingAmount
adjustableTrailingUnit
lmtPriceOffset
```

‏מבחינת מנוע, זו לא Order חדשה; זו policy של one-time transformation שחייבת להיות מתועדת ב־state.

---

## ‏6.18 מתי Adjustable Stop יכולה להיות שימושית לנו

‏תרחיש מחקר אפשרי:

```text
entry filled
price moves favorably by threshold
broker automatically tightens protection
```

‏היתרון: גם אם process מקומי נתקע בדיוק ברגע המעבר, לוגיקת ההתאמה כבר נמצאת ב־Broker.

‏החיסרון: היא פחות גמישה ממנוע שמעריך כל tick מחדש ויכול לשנות policy לפי signal state.

---

## ‏6.19 `Conditional Order` — Predicate שמקדים את ה־Order

‏Conditional Order אומרת בקירוב:

```text
Order may activate/cancel only if condition is satisfied
```

‏IBKR מתעדת תנאים כגון:

```text
Price
Time
Margin
Execution
Volume
PercentChange
```

‏וב־API אפשר לחבר תנאים עם `AND` או `OR`.

‏ברמת ה־taxonomy זהו `Predicate / Dependency Policy`, לא Broker Order Primitive שמתחרה ב־Market/Limit.

---

## ‏6.20 למה Conditions מעניינות לרובוט

‏אפשר להעביר Broker-side חלק מלוגיקת gating פשוטה, לדוגמה:

```text
submit only after time X
submit if another instrument crosses price Y
cancel if condition becomes true
```

‏היתרון הוא survivability מסוים מחוץ ל־process המקומי.

‏אבל Condition של Broker אינה יודעת להחליף Signal מורכב שמחושב אצלנו מזרם נתונים עשיר.

---

## ‏6.21 תנאים מרובים: `AND` ו־`OR`

‏ב־`OrderCondition` קיים `isConjunctionConnection` שמבדיל בין conjunction לבין alternative trigger.

‏לכן חשוב לא לייצג conditions כרשימה סתמית.

‏צריך Abstract Syntax ברור כגון:

```text
(price_condition AND volume_condition)
OR
time_condition
```

‏ולא להניח שכל הרשימה היא AND.

---

## ‏6.22 Conditional Order יכולה להיות Simulated

‏IBKR מציינת במפורש ש־simulated order types כוללות לדוגמה Stop או Conditional כאשר Exchange אינו מספק את ה־primitive.

‏לכן condition שמופעלת לפי Market Data יכולה לרשת את אותם סיכונים:

```text
missing data
filtered data
halt
delayed/inconsistent event
```

‏ב־safety-critical exit לא מסתמכים על condition מורכבת בלי להבין איפה היא מחושבת והאם היא broker-resident.

---

## ‏6.23 `OCA` — Mutual Exclusion / Quantity Coordination Relationship

‏`OCA` מקבצת Orders כך שביצוע Order אחת אמור להשפיע על האחרות.

‏זה מתאים ליותר משני Orders, ולא חייב להיות קשור ל־Parent.

‏ה־use case הוא:

```text
multiple alternative executions
but do not want all of them to complete independently
```

‏זה relationship primitive של mutual exclusion / quantity coordination — לא Broker Order Primitive יחיד ולא transaction אטומית.

---

## ‏6.24 שלושת `OcaType` ב־TWS API

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מתעדת:

```text
1 = Cancel all remaining orders with block
2 = Proportionately reduce remaining orders with block
3 = Proportionately reduce remaining orders with no block
```

‏`with block` מוסיף overfill protection בכך שרק Order אחת בקבוצה מנותבת בכל רגע לפי התיעוד.

‏זו semantics חשובה מאוד — OCA אינה Boolean בשם `cancelOthers=true`.

---

## ‏6.25 Partial Fill ב־OCA משנה את שאר הקבוצה

‏ב־OCA proportional modes, Partial Fill יכולה להקטין את הכמויות של Orders האחרות.

‏מכאן שה־engine צריך להקשיב ל־updated order states ולא להחזיק snapshot ישן של quantities.

‏אחרת הוא יכול לחשוב:

```text
remaining sibling qty = 100
```

‏כאשר Broker כבר rebalance אותה ל־63.

---

## ‏6.26 OCA אינה Transaction אטומית מול Exchanges

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מזהירה שאין הבטחה שבקשות cancel/modify של OCA יגיעו ל־Exchange לפני Order שכבר נמצאת בתהליך execution.

‏לכן:

```text
one filled
=> cancel requested for sibling
```

‏אינו שקול ל־:

```text
sibling can no longer fill
```

> ‏`ENGINE RULE` — `OCA/OCO coordination != transactional atomic guarantee`. ‏Sibling שנמצא ב־pending cancel נשאר potentially executable עד evidence terminal מתאים.

‏המנוע עדיין חייב להתמודד עם late fill ו־overfill reconciliation.

---

## ‏6.27 `OCO` מול `OCA`

‏`OCO` הוא בדרך כלל השם הרעיוני למצב של שתי Orders חלופיות — למשל Take Profit ו־Stop Loss — שבהן ביצוע אחת אמור לבטל את השנייה.

‏`OCA` הוא ה־IBKR mechanism הכללי לקבוצה של Orders.

‏Bracket יכולה להציג התנהגות של OCO בין שני exits, אבל אסור לנו להניח שכל Bracket ממומשת פנימית בדיוק כ־OCA Group שאנחנו יצרנו ידנית.

‏ברמת המודל נשמור בנפרד:

```text
parent_child_dependency
sibling_exclusion_semantics
```

---

# ‏6.28 `Bracket` — Composite Order Structure, לא Order אחת

‏Bracket בסיסית היא:

```text
Parent Entry
    ├── Profit-Taker Child
    └── Protective Stop Child
```

‏אבל ברמת Production היא בעצם distributed state machine בין:

```text
our engine
TWS / Gateway
IBKR servers
router
venue(s)
market data
```

‏הערך הגדול שלה אינו רק נוחות. היא מאפשרת לשלוח מראש **תכנית הגנה שקשורה ל־Entry** במקום לחכות שהקוד המקומי יראה Fill ורק אז יתחיל ליצור exit protection.

---

## ‏6.29 למה Bracket רלוונטית מאוד למסחר של שניות

‏כאשר holding period קצר, חלון הזמן בין:

```text
entry fill
```

‏לבין:

```text
protective exit becomes active
```

‏יכול להיות חלק משמעותי מכל חיי העסקה.

‏Bracket יכולה לצמצם את הסיכון של:

```text
entry filled
process delayed/crashed
no protection sent yet
```

‏וזה בדיוק סוג הבעיה שרובוט צריך לפתור ארכיטקטונית, לא ידנית.

---

## ‏6.30 Parent ו־Children הם Orders נפרדות

‏ב־`TWS API`, כל רכיב מקבל `orderId` משלו.

‏ה־children מקבלות:

```text
parentId = parent.orderId
```

‏ולכל Order יש state, fills, quantity ו־events משלה.

‏לכן אסור למודל שלנו לשמור רק:

```text
bracket_status = ACTIVE
```

‏צריך לשמור את שלוש ה־Orders כישויות נפרדות עם קשרים ביניהן.

---

## ‏6.31 `Transmit` — החלק שאסור לטעות בו

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏הדוגמה הרשמית של `TWS API` משתמשת בתבנית:

```text
Parent:      transmit = false
Take Profit: transmit = false
Stop Loss:   transmit = true
```

‏כאשר ה־child האחרונה נשלחת עם `Transmit=true`, TWS מפרשת זאת כאות להעביר גם את ה־parent ואת ה־siblings שקדמו לה.

‏המטרה: לא לתת ל־Parent להגיע לביצוע לפני שכל מבנה ההגנה נבנה ב־TWS.

---

## ‏6.32 למה סדר השליחה הוא Safety Property

‏תרחיש שגוי:

```text
send Parent with transmit=true
Parent fills immediately
process pauses/crashes
Take Profit not sent
Stop not sent
```

‏עכשיו נוצרה Position ללא Bracket.

‏לכן `Transmit` אינו optimization — הוא חלק מה־correctness protocol של יצירת Bracket.

---

## ‏6.33 `UNTRANSMITTED != PROTECTED`

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מתעדת ש־untransmitted Orders נמצאות רק בתוך אותו TWS session, אינן נשלחות ל־IB server, ונמחקות בעת restart/logout של אותה session.

‏לכן אם process יצר Parent ו־TP עם `Transmit=false` אבל מעולם לא הצליח לשלוח את ה־child האחרונה:

```text
no broker-resident protection exists yet
```

> ‏`ENGINE RULE` — `UNTRANSMITTED != PROTECTED`. ‏Order שנמצאת ב־TWS המקומי אך טרם transmitted אינה נחשבת Broker-resident protection.

‏זה מצב שחייב להופיע ב־state machine כ־`STAGING`, לא כ־`PROTECTED`.

---

## ‏6.34 ארבעה IDs שונים שצריך להכיר

‏במנוע נשמור לפחות:

```text
orderId
parentId
permId
clientId
```

‏`orderId` הוא identifier בהקשר ה־API client.

‏`parentId` יוצר את dependency.

‏`permId` הוא מזהה Host קבוע יותר של Order לפי IBKR.

‏`clientId` חשוב ל־ownership וליכולת modify/cancel דרך TWS API.

‏ב־reconnect לא מספיק לזכור רק מספר אחד.

---

## ‏6.35 Bracket אינה "מופעלת" ברגע ששלחנו אותה

‏צריך להבדיל:

```text
BRACKET_STAGED
BRACKET_TRANSMITTED
PARENT_WORKING
PARENT_PARTIAL
PARENT_FILLED
CHILDREN_HELD
CHILDREN_ACTIVE
EXIT_PARTIAL
EXIT_FILLED
SIBLING_CANCEL_PENDING
FLAT_CONFIRMED
```

‏המילים המדויקות בקוד יכולות להשתנות, אבל ההבחנות חייבות להיות קיימות.

---

## ‏6.36 Parent Partial Fill — `ACCEPTANCE TEST REQUIRED`

‏מצאנו כאן nuance משמעותי בתיעוד IBKR.

‏מפרט FIX של IBKR מתאר Auto Stops/Brackets כך ש־partial executions של Parent מפעילות את **הכמות המקבילה** של Child orders.

‏לעומת זאת, חומר הדרכה עדכני של `TWS API` מתאר attached children כ־held עד שה־Parent מתמלא לחלוטין ואז נעשות active.

> ‏`ACCEPTANCE TEST REQUIRED` — אין לקורס "לפתור" את הפער על ידי בחירת אחת הגרסאות. עבור ה־API, Product, Route ו־adapter שבהם נשתמש יש למדוד במפורש מה קורה ל־children לאחר Parent partial fill.

‏עד לקבלת evidence מתאים, capability זו אינה מקבלת semantics סופיות ב־Production.

---

## ‏6.37 ה־Invariant החשוב ביותר: `Protected Qty <= Actual Position Qty`

‏אסור ש־exit children יוכלו למכור יותר מה־Position שנוצרה בפועל — אלא אם אנחנו מתכוונים במפורש לפתוח Position הפוכה.

‏לכן בכל event:

```text
actual_position_qty
active_exit_qty
pending_exit_qty
```

‏צריכים לעבור reconciliation.

‏אם Parent התמלאה ב־37 מתוך 100, מנוע לא מניח אוטומטית ששתי children של 100 בטוחות.

---

## ‏6.38 וה־Invariant המשלים: `Protected Qty` לא יכולה להישאר קטנה מדי

‏הכשל ההפוך:

```text
parent gets another late fill
position grows from 37 to 63
protective child still covers 37
```

‏עכשיו 26 מניות לא מוגנות.

‏לכן quantity synchronization היא תהליך מתמשך עד שה־Parent terminal וה־Position ידועה.

---

## ‏6.39 Parent Cancel לפני שום Fill

‏המצב הפשוט:

```text
parent filled = 0
cancel confirmed
```

‏מבחינה עסקית אין Position שצריך להגן עליה.

‏אבל המנוע עדיין חייב לוודא:

```text
children are not independently live
no late parent fill arrived
no orphan child remains
```

‏לפני שהוא סוגר את ה־Bracket state.

---

## ‏6.40 Parent Cancel אחרי Partial Fill

‏זה כבר מצב מורכב:

```text
requested = 100
filled = 37
remaining parent = 63
cancel parent remainder
```

‏העסקה לא "בוטלה". יש Position של 37.

‏מכאן צריכים להיות exits המתאימים ל־37, גם אם Entry intent המקורי של 100 הסתיים.

‏לכן:

```text
cancel_parent_remainder
!=
cancel_trade
```

---

## ‏6.41 Late Fill אחרי `cancelOrder(parent)`

‏זה race קלאסי:

```text
cancel requested
fill crosses in flight
cancel acknowledgement arrives
fill event arrives
```

‏המנוע צריך לקבל כל Fill כאמת על Position, גם אם local intent כבר היה `CANCEL`.

‏התגובה הנכונה היא reconciliation — לא התעלמות מה־Fill כי "כבר ביטלנו".

---

## ‏6.42 Profit-Taker Child היא Exit Behavior בפני עצמה

‏Take Profit אינה רק מספר יעד.

‏צריך להחליט:

```text
LMT passive?
marketable when target reached?
IOC?
Pegged?
modify dynamically?
partial exit allowed?
```

‏Bracket בסיסית משתמשת בדרך כלל ב־opposite-side Limit, אבל המנוע שלנו צריך לחשוב על **Exit Behavior** ואז על Concrete Order שמממשת אותו — לא רק על target price.

---

## ‏6.43 Stop-Loss Child היא שכבת Risk, לא Forecast

‏Protective stop אינה אמורה לנבא שהמחיר בהכרח ימשיך לרדת.

‏תפקידה להגדיר:

```text
this market state is unacceptable while position is open
```

‏לכן צריך להפריד בין:

```text
signal reversal exit
```

‏לבין:

```text
protective disaster/risk stop
```

‏הראשון יכול להיות dynamic ומהיר יותר; השני יכול להישאר Broker-resident כ־backstop אם capability ו־residency אכן הוכחו.

---

## ‏6.44 `Stop` או `Stop Limit` בתוך Bracket?

‏שוב זו לא שאלה של "איזו מקצועית יותר".

‏Protective `Stop`:

```text
better chance of reducing position
but price can slip
```

‏Protective `Stop Limit`:

```text
price boundary
but position can remain open after trigger
```

‏למנוע שמחזיק שניות, Stop-Limit צרה מדי עלולה להיות מסוכנת דווקא בזמן burst שבו הכי רצינו הגנה.

---

## ‏6.45 Trailing Stop כ־Child

‏אפשר להשתמש ב־Trailing behavior כחלק מ־exit structure כאשר capability תומכת בכך.

‏אבל אז state מורכב יותר:

```text
entry fill price
trail reference
current trail stop
position qty
manual/dynamic exit signal
```

‏והמנוע חייב לדעת מי "בעל הסמכות" לצאת ראשון: Trailing child או client-managed exit.

---

## ‏6.46 הבעיה של שתי מערכות Exit במקביל

‏נניח שיש:

```text
broker stop child
+
local momentum reversal exit
```

‏המנוע המקומי שולח SELL בדיוק כאשר Stop child מופעלת.

‏בלי coordination ניתן לקבל:

```text
local sell fills
broker stop also fills
=> position flips short
```

‏לכן hybrid architecture חייבת מנגנון `exit ownership` ו־reconciliation.

---

## ‏6.47 Bracket אינה חייבת להיות Strategy Brain

‏עבורנו רעיון חזק הוא להפריד:

```text
Broker Composite Protection = safety envelope
Client Engine               = dynamic exit intelligence
```

‏ה־Broker מחזיק catastrophic protection ו־optional profit boundary.

‏המנוע יכול לצאת מוקדם יותר כאשר signal reverses.

‏אבל ברגע שהמנוע יוצא, הוא חייב לבטל/לעדכן את children ולחכות ל־terminal confirmation.

---

## ‏6.48 `Broker-Resident` מול `Client-Managed` הם dimensions של ownership/residency

| מודל | יתרון | חסרון |
|---|---|---|
| Broker-resident protection | ‏יכול להמשיך להתקיים גם אם process המקומי נופל, כאשר residency הוכחה | ‏פחות יודע על ה־Signal הפרטי שלנו |
| Client-managed exit | ‏גמיש ומגיב לכל feature שלנו | ‏תלוי connectivity/process/data |
| Hybrid | ‏Backstop אצל Broker + intelligence מקומית | ‏state coordination מורכב יותר |

‏אלה אינם Order Types. הם מתארים **איפה state חי ומי מחזיק authority** על protection/exit.

‏למנוע Production, Hybrid הוא Candidate חשוב למחקר — אבל רק אחרי בדיקות races קפדניות.

---

## ‏6.49 למה Bracket קבועה יכולה להיות איטית מדי למסחר שלנו

‏אם המערכת אומרת:

```text
TP = +0.30%
SL = -0.20%
```

‏ולא משנה דבר במשך 20 שניות, היא מתעלמת מ־:

```text
spread changes
bid weakness
trade velocity
wave reversal
new liquidity
signal decay
```

‏לכן Bracket לא בהכרח קובעת את ה־exit האופטימלי. הערך שלה יכול להיות קודם כול `protection that already exists`.

---

## ‏6.50 שינוי Child בזמן Position חיה

‏כאשר המנוע רוצה להזיז TP או Stop, זו Order modification — לא שינוי משתנה מקומי בלבד.

‏צריך לעקוב אחרי:

```text
modify requested
broker acknowledgement
old order still potentially executable during transition
new effective parameters
```

‏וחלק מהשינויים יכולים להשפיע על routing/priority או להידחות.

---

## ‏6.51 אסור לבצע Modify על Snapshot ישן

‏נניח שהמנוע קיבל state:

```text
child remaining = 100
```

‏באותו זמן הגיע partial fill של 20, אבל event עוד לא עובד אצלנו.

‏אם נשלח Modify ל־100 במקום ל־80, אפשר לייצר quantity mismatch.

‏לכן כל modify path צריך sequence/revision discipline ו־post-ack reconciliation.

---

## ‏6.52 `autoCancelParent` — capability שצריך להבין, לא להפעיל אוטומטית

‏`TWS API Order` כולל `autoCancelParent`, שמתועד כיכולת לבטל Parent אם Child בוטלה.

‏זו התנהגות חזקה שיכולה להתאים לחלק מה־workflows, אבל יכולה גם להפתיע אם cancellation של Child הייתה רק פעולה מקומית זמנית.

‏לכן לא נשתמש בה כברירת מחדל בלי state model מפורש.

---

## ‏6.53 `OCA` בתוך עולם ה־Bracket — לא להניח אטומיות

‏גם אם שני exits מתפקדים כ־one-cancels-other, צריך לזכור את אזהרת IBKR על cancellation latency.

‏תרחיש קיצון:

```text
profit child starts filling
stop child is being canceled
market jumps
stop child also executes
```

‏נדיר אינו שווה בלתי אפשרי.

‏המנוע חייב לדעת לטפל ב־Position הסופית, לא להניח שה־Broker תמיד מנע race.

---

## ‏6.54 `Double Exit` — הכשל שמסוכן יותר מ־Missed Exit

‏אם יש לנו Long 100 ושתי SELL orders של 100 מתבצעות, אנחנו לא רק flat — אנחנו Short 100.

‏לכן invariant:

```text
sum(potentially executable exit qty)
```

‏חייב להיות מובן בכל רגע, כולל Orders שנמצאות ב־pending cancel.

‏`pending cancel` עדיין נחשבת Potentially Executable עד terminal confirmation.

---

## ‏6.55 `Orphan Child`

‏Orphan היא Child שנשארה חיה כאשר ההנחה שמצדיקה אותה כבר אינה קיימת.

‏דוגמאות:

```text
position already closed manually
parent canceled without expected cleanup
local engine lost relationship metadata
child survived reconnect
```

‏ב־startup reconciliation, כל Child ללא Position/Parent relationship תקף צריכה להיות מסווגת כ־incident עד שיוכח אחרת.

---

## ‏6.56 Child Rejection היא אירוע Risk

‏אם Parent Fill יצר Position אבל Stop Child נדחתה, אין לנו Bracket תקינה.

‏זה לא `warning` רגיל.

‏State צריך לעבור למשל ל־:

```text
POSITION_UNPROTECTED
```

‏ואז policy מוגדרת מראש מחליטה אם לנסות protective order חלופית, לצמצם Position, או לעצור את המנוע.

---

## ‏6.57 System Cancel ו־User Cancel אינם אותו דבר

‏ב־OCA documentation קיימת הבחנה חשובה: cancellation מצד client יכולה להשפיע על הקבוצה באופן שונה מ־rejection/system cancellation.

‏לכן callback reason ו־terminal status צריכים להישמר.

‏אסור לתרגם כל `Cancelled` ל־:

```text
user intentionally canceled trade
```

---

## ‏6.58 Manual/External Position Change

‏אם אדם מוכר ידנית חלק מה־Position בזמן Bracket קיימת, quantities של children עלולות כבר לא להתאים ל־Position.

‏אותו דבר אם API client אחר משנה Order.

‏לכן נפריד בין:

```text
execution_ledger_position
broker_reported_position
reconciled_position
```

> ‏`ENGINE RULE` — decisions חדשות מסתמכות על `reconciled_position`; requested quantity או ledger מקומי לבדם אינם Position truth מספקת לאחר external/manual activity או recovery.

---

## ‏6.59 Reconnect: לא משחזרים Bracket מהזיכרון בלבד

‏אחרי reconnect עושים לפחות:

```text
request/open orders reconciliation
executions reconciliation
positions reconciliation
map orderId/permId/parentId
rebuild bracket graph
```

‏ורק אז המנוע מחליט אם מותר לו לשלוח Orders חדשות.

‏עד אז `RECOVERING` הוא **System Operating Mode**, לא Bracket lifecycle state רגיל.

---

## ‏6.60 Crash אחרי Parent Fill הוא בדיוק הסיבה ל־Broker-Resident Protection

‏תרחיש:

```text
parent fills
local process dies 2 ms later
```

‏אם Stop כבר חלק מ־Bracket שהגיעה ל־Broker וה־residency שלה הוכחה, ההגנה יכולה להמשיך להתקיים בלי התהליך המקומי.

‏אם ה־Exit כולו client-managed, אין שום לוגיקה מקומית פעילה עד restart.

‏זו אחת הסיבות החזקות ביותר לבחון Hybrid architecture.

---

## ‏6.61 Multiple API Clients ו־Ownership

‏IBKR מתעדת `clientId` כחלק מ־order ownership; modify/cancel capabilities תלויות במי placed/bound את Order.

‏לכן אם בעתיד יהיו:

```text
execution service
manual TWS session
recovery service
```

‏צריך ownership policy מפורשת ולא להניח שכל client יכול לנהל כל Order באותה דרך.

---

## ‏6.62 Outside RTH הוא חלק מההגנה

‏Stop/Bracket שמוגדרת ל־Regular Trading Hours בלבד אינה נותנת אותה הגנה ב־pre-market/after-hours.

‏מצד שני, execution outside RTH יכולה לפגוש spread ונזילות שונים מאוד.

‏לכן כל protective order צריכה לשמור:

```text
outsideRth
session_policy
```

‏וה־risk model צריך לדעת מתי protection אינה eligible.

---

## ‏6.63 Halts ו־Resumptions

‏ב־halt אין guarantee ש־protective order תבצע.

‏לאחר resume המחיר יכול להיפתח רחוק מה־trigger.

‏לכן Stop אינה insurance contract עם payout ידוע; היא instruction שתלויה במצב השוק וביכולת execution לאחר trigger.

‏ב־backtest שלנו חייבים להימנע מהנחה:

```text
stop touched => filled exactly at stop
```

---

## ‏6.64 Stop Trigger Price מול Actual Fill Price חייבים להיות שני שדות

‏Telemetry:

```text
stop_trigger_price
trigger_timestamp
market_at_trigger
first_executable_quote_after_trigger
fill_price
slippage_from_trigger
```

‏בלי ההפרדה הזו Backtest יכול לייחס ל־Risk Policy ביצועים שאי אפשר לקבל Live.

---

## ‏6.65 Failure Matrix של Bracket — מה המנוע חייב לדעת לענות

| מצב | מה עלול להיות חי אצל Broker | הסיכון | Recovery עקרוני |
|---|---|---|---|
| Parent לא התמלאה | Parent working, children held | stale entry | validate signal / cancel parent |
| Parent partial | Parent remainder + חלק/כל children לפי semantics בפועל | under/over protection | reconcile fills + child qty |
| Parent full | exits held/active | protection gap אם child rejected | verify both exit legs |
| TP partial | remaining TP + stop sibling | qty mismatch / OCA rebalance | recompute actual position |
| Stop triggered | stop execution in progress + TP cancel pending | double exit | treat sibling as potentially executable |
| Cancel in flight | old order עדיין יכולה להתבצע | late fill | wait for terminal + executions |
| Local connection lost | broker orders may remain live | local state stale | freeze new orders, reconcile |
| Process crash | broker-resident bracket may survive | unknown state on restart | rebuild from broker truth |
| Child rejected | Parent may already be Position | unprotected position | emergency protection policy |
| Child canceled unexpectedly | sibling/position may remain | asymmetric protection | classify reason, reconcile |
| Price gaps through Stop | triggered execution can slip | larger loss | emergency/risk accounting |
| Stop-Limit gaps | trigger but no fill | position remains | escalation policy |
| Manual position change | children no longer match Position | over-exit | resize/cancel after reconciliation |
| Second API client modifies | local assumptions stale | unexpected price/qty | ownership/version checks |
| Both exits fill | position may reverse | unintended exposure | detect immediately and neutralize per policy |

‏המטריצה הזו תהפוך בהמשך ל־acceptance tests, לא תישאר רק חומר קריאה.

---

## ‏6.66 State Machine מומלץ ל־Bracket — בלי לערבב System Modes

```text
CREATED
  ↓
STAGING
  ↓
TRANSMITTED
  ↓
PARENT_WORKING
  ├── PARENT_CANCEL_PENDING
  ├── PARENT_PARTIAL
  └── PARENT_FILLED
          ↓
     EXITS_VERIFYING
          ↓
     POSITION_PROTECTED
       ├── TP_WORKING
       ├── STOP_WORKING
       ├── EXIT_MODIFY_PENDING
       └── EXIT_CANCEL_PENDING
          ↓
     EXIT_PARTIAL
          ↓
     SIBLING_CANCEL_PENDING
          ↓
     FLAT_VERIFYING
          ↓
     FLAT_CONFIRMED
```

‏לצד lifecycle הזה יש **epistemic/control states** כגון:

```text
UNKNOWN
INCONSISTENT
UNPROTECTED
```

‏ובנפרד **System Operating Modes** כגון:

```text
RECOVERING
FROZEN
```

> ‏`ENGINE RULE` — `UNKNOWN`, ‏`RECOVERING` ו־`FROZEN` אינם אותו סוג enum: הראשון מתאר מה איננו יודעים, השני את מצב הפעולה של המערכת, והשלישי control/safety mode.

---

## ‏6.67 Invariants שצריכים להיבדק אחרי כל Event

```text
reconciled_position matches broker/execution evidence
no new entry while bracket state is inconsistent
no exit assumes pending-cancel sibling is dead
active protective qty never intentionally exceeds reconciled position qty
position qty never remains intentionally unprotected beyond allowed window
all live children map to a known parent/position
all modifications use latest known filled/remaining qty
```

‏אלה guardrails חזקים יותר מאלפי `if` נקודתיים.

---

## ‏6.68 Telemetry שחייבים לשמור ל־Stops/Bracket/OCA

```text
bracket_id
parent_order_id
parent_perm_id
take_profit_order_id
stop_order_id
parent_filled_qty
position_qty
protected_qty
tp_remaining_qty
stop_remaining_qty
transmit_state
parent_status
tp_status
stop_status
oca_group
oca_type
stop_trigger_method
stop_trigger_price
stop_limit_price
trail_mode
trail_value
trail_stop_price
condition_types
condition_state
last_reconciliation_timestamp
reconnect_generation
```

‏ואירועים:

```text
parent_first_fill_ts
parent_full_fill_ts
child_activation_ts
stop_trigger_ts
exit_first_fill_ts
sibling_cancel_request_ts
sibling_cancel_ack_ts
flat_confirmed_ts
unprotected_window_ms
double_exit_incident
orphan_detected
```

---

## ‏6.69 Metrics שמעניינות במיוחד אותנו

```text
entry_fill_to_protection_active_ms
percentage_time_position_unprotected
stop_slippage_bps
stop_limit_nonfill_rate
trailing_premature_exit_rate
bracket_child_reject_rate
late_fill_after_cancel_rate
double_exit_rate
orphan_order_rate
recovery_success_rate
reconnect_to_consistent_state_ms
```

‏אם Bracket נראית יפה ב־UI אבל `entry_fill_to_protection_active_ms` גבוה או recovery fragile — היא לא Production-ready עבורנו.

---

## ‏6.70 Acceptance Tests שחייבים לפני שימוש אמיתי

‏לפחות:

```text
1. Parent no-fill then cancel
2. Parent instant full fill
3. Parent partial fill then wait
4. Parent partial fill then cancel remainder
5. Parent fill racing with cancel
6. TP full fill
7. TP partial fill
8. Stop trigger and fill
9. Stop trigger with gap
10. Stop-Limit trigger without fill
11. Modify TP while active
12. Modify Stop while active
13. Cancel one child
14. Child rejection
15. Disconnect before Parent fill
16. Disconnect after Parent fill
17. Process restart with bracket live
18. Manual partial close while bracket live
19. Late fill after sibling cancel request
20. Verify exact partial-fill child activation semantics
```

‏הבדיקה ה־20 היא `ACCEPTANCE TEST REQUIRED` אצלנו בגלל ההבדל שמצאנו בין מסמכי IBKR.

---

## ‏6.71 `IBKR` — תמיכה נוכחית ברמת UI

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏לפי Order Types של IBKR:

| כלי | Products רלוונטיים | Platforms מתועדות | Routing |
|---|---|---|---|
| `Stop` | Stocks, ETFs ועוד | `TWS`, `IBKR Desktop`, `IBKR Mobile`, `Client Portal` | Smart, Directed |
| `Stop Limit` | Stocks, ETFs ועוד | כל הפלטפורמות המרכזיות | Smart, Directed |
| `Trailing` | Stocks, ETFs ועוד | `TWS`, `IBKR Desktop`, `IBKR Mobile`, `Client Portal` | Smart, Directed |
| `Trailing Limit` | Stocks, ETFs ועוד | `TWS`, `IBKR Desktop`, `IBKR Mobile`, `Client Portal` | Smart, Directed |
| `Adjustable Stop` | Stocks, ETFs ועוד | `TWS`, `IBKR Desktop`, `IBKR Mobile`, `Client Portal` | Smart, Directed |
| `Bracket` | Stocks, ETFs ועוד | `TWS`, `IBKR Desktop`, `IBKR Mobile` | Smart, Directed |
| `OCA` | Stocks, ETFs ועוד | `TWS` | Smart, Directed |
| `Conditional` | Stocks, ETFs ועוד | `TWS` ו־`IBKR Mobile` לפי הדף הנוכחי | Smart, Directed |

‏זו תמיכת Product/Platform כללית של IBKR, לא הבטחה שכל combination נתמך בכל Legal Entity/Contract/Route, ובוודאי לא `PRODUCTION_ENABLED` אצלנו.

---

## ‏6.72 `TWS API` — מה באמת קיים באובייקט

‏`Order` הנוכחי כולל בין היתר:

```text
parentId
transmit
ocaGroup
ocaType
triggerMethod
trailingPercent
trailStopPrice
adjustedOrderType
triggerPrice
adjustedStopPrice
adjustedStopLimitPrice
adjustedTrailingAmount
conditions
conditionsCancelOrder
conditionsIgnoreRth
autoCancelParent
```

‏כלומר ה־API נותן primitives/attributes אמיתיים לבניית המנגנונים של החלק הזה.

‏אבל IBKR עצמה ממליצה לבדוק Order Type ידנית ב־TWS לפני שמקודדים tactic מורכבת, משום שלא כל combination של advanced features נתמך.

---

## ‏6.73 `Web API` — Bracket קיימת גם שם, אבל semantics אינן זהות ל־TWS API

‏בתיעוד Web API, parent מקבל `cOID` וה־children משתמשות באותו ערך ב־`parentId`; אפשר לשלוח Bracket יחד ב־request מתאים.

‏כלומר Bracket אינה מוגבלת ל־TWS API.

‏אבל אין להניח parity מלאה ב־fields, lifecycle ו־error handling.

‏אם נבחר Web API ל־Execution Adapter, נכתוב בדיקות קבלה נפרדות.

---

## ‏6.74 דרך נוספת ב־TWS API: Preset-based Profit Taker ו־Stop Loss

‏IBKR מתעדת גם fields:

```text
ptOrderId
ptOrderType = PRESET
slOrderId
slOrderType = PRESET
```

‏שמאפשרים לבקש children על בסיס TWS Presets.

‏זה יכול לפשט setup אחיד, אבל יוצר dependency על configuration חיצונית ב־TWS.

‏למנוע reproducible, במחקר הראשון עדיף parameters מפורשים בקוד כדי שהניסוי יהיה ניתן לשחזור; Preset-driven workflow הוא capability נפרדת להשוואה, לא הנחה מובלעת.

---

## ‏6.75 שלוש `Protection Architectures` למחקר

‏במקום להתייחס אליהן כ־Order Types, נשווה שלוש ארכיטקטורות ownership/residency:

```text
A. CLIENT_MANAGED_EXIT
   entry at broker
   engine manages all exits

B. BROKER_BRACKET
   parent + TP + protective stop at broker
   minimal local intervention

C. HYBRID_PROTECTION
   broker-resident protective stop/backstop
   engine manages dynamic normal exit
   broker child is canceled/reconciled when local exit succeeds
```

‏עבור holding של שניות, `C` היא Research Candidate חשובה מפני שהיא משלבת survivability עם signal-aware exit — אבל היא גם דורשת את ה־race handling הקשוח ביותר.

---

## ‏6.76 איך נחליט מי מנצחת

‏לא לפי תחושה ולא לפי מספר שורות קוד.

‏נמדוד:

```text
protection activation latency
normal exit quality
stop slippage
number of broker modifications
race incidents
reconnect behavior
unprotected time
operational complexity
net edge after execution
```

‏ה־architecture הטובה היא זו שנותנת Risk Control אמין בלי להרוס את execution economics של ה־Signal הקצר.

---

## ‏6.77 Bracket לא יוצרת Edge

‏חשוב במיוחד לא להתאהב במבנה.

‏Bracket יכולה:

```text
reduce operational risk
pre-stage protection
enforce relationships
simplify some failure handling
```

‏אבל היא לא גורמת ל־entry Signal להיות רווחי.

‏ה־Edge עדיין צריך להגיע מ־Signal + Execution quality + costs.

---

## ‏6.78 Practitioner Secrets — הדברים שהופכים Bracket מ־UI Feature למערכת Production

### ‏1. `Transmit` הוא פרוטוקול Commit קטן

‏הוא נועד למנוע מצב שבו חלק מהמבנה חי וחלק עוד לא הגיע.

### ‏2. `Transmit=false` אינו Broker Protection

‏עד שהקבוצה באמת transmitted, Orders יכולות להיות רק בתוך ה־TWS session.

### ‏3. Partial Fill היא לא Edge Case

‏היא משנה Position Qty, protection qty ו־exit state.

### ‏4. Pending Cancel היא עדיין Order מסוכנת

‏עד שאין terminal evidence מתאים, היא יכולה לקבל Fill.

### ‏5. OCA אינה Atomic Transaction

‏צריך לתכנן כאילו rare double executions אפשריות.

### ‏6. Stop Price אינה Fill Price

‏Backtests שממלאים תמיד בדיוק ב־Stop אופטימיים מדי.

### ‏7. Stop-Limit יכולה "להגן" על מחיר ולהיכשל בהגנה על Position

‏זה trade-off, לא שדרוג אוטומטי.

### ‏8. Broker-Resident Protection שווה הרבה דווקא בזמן תקלה

‏הערך שלה נמדד כשמחשב/Process/Data נופלים — ורק כאשר residency הוכחה — לא רק כשהכול עובד.

### ‏9. Dynamic Exit + Broker Stop הם שתי רשויות ביצוע

‏בלי ownership/reconciliation הן יכולות להילחם זו בזו.

### ‏10. Flat אינו State מקומי — הוא עובדה שצריך לאמת מול Broker

‏רק לאחר positions + executions + live orders reconciliation אפשר להכריז `FLAT_CONFIRMED`.

### ‏11. Documentation mismatch הוא Signal לבדיקה, לא הזמנה לניחוש

‏כאשר מקורות IBKR מתארים partial-parent behavior בצורה שונה, אנחנו לא בוחרים גרסה שנוחה לנו; אנחנו מסמנים `ACCEPTANCE TEST REQUIRED` וכותבים acceptance test.

### ‏12. Bracket טובה היא מערכת שמצליחה גם כשמשהו משתבש

‏Happy Path הוא רק תחילת הבדיקה.

---

# ‏מקורות רשמיים לחלק 6

- ‏IBKR — Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR TWS API — placing orders introduction / `Transmit`: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/place-order/introduction>
- ‏IBKR TWS API — Adding a Profit Taker and Stop Loss: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/place-order/adding-a-profit-taker-and-stop-loss>
- ‏IBKR API — Order Types / Bracket / OCA examples: <https://www.interactivebrokers.com/campus/?p=195739&post_type=ibkr-api-page>
- ‏IBKR — Trailing Stop Limit documentation: <https://www.interactivebrokers.com/docs/general/order-types/trailing-stop-limit>
- ‏IBKR TWS API — Order Conditions reference: <https://www.interactivebrokers.com/docs/tws-api/protobuf/order-condition>
- ‏IBKR Web API — Modify Open Order / `parentId`: <https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/modify-open-order>
- ‏IBKR — Bracket Orders for IBKR Desktop: <https://www.interactivebrokers.com/campus/trading-lessons/bracket-orders-for-ibkr-desktop/>
- ‏IBKR FIX Specification — Auto Stops / Bracket partial-execution semantics: <https://www.interactivebrokers.com/campus/wp-content/uploads/sites/2/2023/07/IBKR-FIX-Specification.pdf>

---

# ‏Checkpoint — סוף חלק 6

‏בחלק הזה הפכנו Stops ו־Bracket מ־"פקודות יציאה" למערכת Risk/Execution מלאה. הפרדנו בין `Trigger Policy`, ‏post-trigger execution, ‏Predicate, ‏Dependency, ‏Mutual Exclusion ו־Composite Structure; ירדנו לעומק של `Stop`, ‏`Stop Limit`, ‏`Trailing`, ‏`Trailing Limit`, ‏`Adjustable Stop`, ‏`Conditional` ו־`OCA`; ובנינו ל־Bracket מודל Production עם `parentId`, ‏`Transmit`, partial fills, quantity invariants, pending-cancel races, orphan/double exits, reconnect/recovery, Failure Matrix ו־acceptance tests.

‏הנקודה החשובה ביותר למנוע שלנו היא ש־Bracket יכולה להיות **שכבת survivability מצוינת**, אבל היא אינה תחליף ל־Signal-aware Exit. שלוש `Protection Architectures` — client-managed, broker-bracket ו־hybrid protection — ייבחנו אמפירית ולא ייבחרו לפי אינטואיציה.

‏החלק הבא יהיה **חלק 7 — Routing ו־Broker Algos**: `SMART` מול Direct Routing, בחירת Venue, fees/rebates, hidden liquidity, price improvement, ‏`Adaptive`, ‏`MidPrice` ושאלת המפתח למנוע של שניות — מתי כדאי למסור לברוקר החלטת execution ומתי אנחנו צריכים לשמור אותה אצלנו.

# ‏חלק 6A — `MIT`, ‏`LIT` ו־Trailing If-Touched: ‏Trigger מול Post-Trigger Execution

> ‏הפרק הזה משלים את Part 6. הוא מוסיף את `Market If Touched (MIT)`, ‏`Limit If Touched (LIT)`, ‏`Trailing Market If Touched` ו־`Trailing Limit If Touched`, ומקבע את ההפרדה הקנונית בין **Trigger Mechanism** לבין **Post-Trigger Execution**.
>
> ‏`FACT` — עובדות `IBKR` תלויות־זמן בפרק זה אומתו לאחרונה ב־`2026-10-27` מול התיעוד הרשמי של IBKR.

---

## ‏6A.1 השאלה הראשונה אינה "Stop או MIT?"

‏השאלה המקצועית היא שתי שאלות נפרדות:

```text
1. What event activates the order?
2. What execution behavior exists after activation?
```

‏כלומר:

```text
Trigger Mechanism
!=
Post-Trigger Execution
```

‏זו ההפרדה שמונעת מערבוב שמות של Orders להפוך לבלבול תפעולי.

---

## ‏6A.2 ה־taxonomy הקנונית

‏נפריד לפחות את הצירים הבאים:

```text
TriggerDirection
TriggerReference
TriggerPriceRule
TriggerMovementRule
PostTriggerPrimitive
PostTriggerPriceProtection
BrokerTIF
ApplicationOrderTTL
```

‏דוגמאות:

```text
Stop Market
TriggerDirection        = adverse / stop-style
PostTriggerPrimitive    = MKT

Stop Limit
TriggerDirection        = adverse / stop-style
PostTriggerPrimitive    = LMT

MIT
TriggerDirection        = if-touched / favorable-side trigger
PostTriggerPrimitive    = MKT

LIT
TriggerDirection        = if-touched / favorable-side trigger
PostTriggerPrimitive    = LMT
```

> ‏`ENGINE RULE` — שם ה־Order הוא shorthand. המנוע צריך להבין בנפרד את ה־trigger ואת מה שנשלח/מופעל לאחריו.

---

## ‏6A.3 מהו `Market If Touched (MIT)`

> ‏`FACT` — IBKR מתארת `MIT` כ־Order שנשמרת במערכת עד שה־trigger price נוגע, ואז נשלחת כ־Market Order.

‏במונחי המנוע:

```text
Trigger = touched-price condition
PostTriggerPrimitive = MKT
```

‏לכן `MIT` אינה Market Order "שממתינה" במובן הפשוט; היא Conditional/Triggered Order שה־Market execution נוצר רק לאחר activation.

---

## ‏6A.4 Direction של `MIT` שונה מ־Stop רגילה

‏במודל הקלאסי של IBKR:

```text
BUY MIT
=> trigger placed below current market

SELL MIT
=> trigger placed above current market
```

‏לעומת Stop טיפוסית:

```text
BUY STOP
=> trigger above current market

SELL STOP
=> trigger below current market
```

‏לכן `MIT` ו־Stop יכולות להשתמש שתיהן ב־Market לאחר trigger, אבל הן מבטאות **trigger intent הפוך**.

---

## ‏6A.5 מהו `Limit If Touched (LIT)`

> ‏`FACT` — IBKR מתארת `LIT` כ־Order שנשמרת עד שה־trigger price נוגע, ואז נשלחת כ־Limit Order במחיר ה־limit שהוגדר.

‏במונחי המנוע:

```text
Trigger = touched-price condition
PostTriggerPrimitive = LMT
PostTriggerLimit = explicit
```

‏לכן `LIT` מוסיפה Price Protection לאחר activation — במחיר של non-fill risk.

---

## ‏6A.6 `MIT` מול `LIT` — ההבדל אינו ה־Trigger

‏בשתי המשפחות ה־Intent יכול להיות:

```text
wait until market reaches the trigger condition
```

‏ההבדל המרכזי הוא לאחר trigger:

```text
MIT
=> Market-style execution
=> higher execution urgency
=> no client-defined post-trigger limit

LIT
=> Limit execution
=> explicit price protection
=> may trigger and remain unfilled
```

‏זו אותה trade-off בסיסית של Market מול Limit — אבל **רק לאחר activation**.

---

## ‏6A.7 `LIT` יכולה להיות Triggered בלי Fill

‏זה failure mode שחייב להיות explicit.

‏אפשר לקבל:

```text
TRIGGERED
but
NOT_FILLED
```

‏למשל, השוק נוגע ב־trigger, אך ה־Limit שלאחר trigger אינה executable או שהשוק זז לפני הביצוע.

> ‏`ENGINE RULE` — `TRIGGERED != FILLED`.

‏לכן telemetry ו־state machine חייבות לשמור trigger event ו־execution lifecycle בנפרד.

---

## ‏6A.8 `MIT` יכולה Trigger ואז לקבל Slippage

‏הצד השני של אותה trade-off:

```text
trigger occurs
→ Market order becomes active
→ available market can already be elsewhere
```

‏לכן trigger price אינה fill guarantee.

‏Telemetry חייבת להפריד:

```text
trigger_price
trigger_ts
market_at_trigger
first_fill_ts
avg_fill_price
slippage_from_trigger
```

---

## ‏6A.9 Direct Comparison — `Stop`, ‏`Stop Limit`, ‏`MIT`, ‏`LIT`

| Family | Trigger intent | Post-trigger execution | Price protection לאחר trigger | Failure מרכזי |
|---|---|---|---|---|
| `Stop` | adverse/stop-side | Market | לא client-defined | slippage/gap |
| `Stop Limit` | adverse/stop-side | Limit | כן | triggered but no fill |
| `MIT` | if-touched/opposite-side | Market | לא client-defined | slippage after trigger |
| `LIT` | if-touched/opposite-side | Limit | כן | triggered but no fill |

‏הטבלה מראה למה לא נכון ללמוד אותן כארבעה שמות בלתי קשורים. יש כאן שני צירים:

```text
trigger direction
×
post-trigger execution primitive
```

---

## ‏6A.10 Why / When / Why Not — `MIT`

### ‏Why

‏מאפשרת להמתין לרמת מחיר מסוימת ורק אז לבקש execution מיידי יחסית.

### ‏When

‏כאשר עצם ההגעה ל־trigger היא תנאי ל־Intent, ולאחר ההגעה execution certainty חשובה יותר מ־price protection צרה.

### ‏Why Not

‏כאשר Edge קטן וה־slippage האפשרי לאחר trigger יכול למחוק אותו, או כאשר Market-style execution אינה מותרת ב־Risk Policy.

---

## ‏6A.11 Why / When / Why Not — `LIT`

### ‏Why

‏משלבת activation לפי touched price עם post-trigger price protection.

### ‏When

‏כאשר איננו רוצים Order פעילה לפני ה־trigger, אבל גם לאחר activation איננו מוכנים לבצע מעבר ל־Limit מוגדרת.

### ‏Why Not

‏כאשר trigger ללא Fill יוצר missed-move/risk גדול מדי, במיוחד ב־Exit דחופה.

---

## ‏6A.12 Trigger Price אינו `Economic Price Bound`

‏אלו שני מושגים שונים:

```text
Trigger Price
=> when activation occurs

Economic Price Bound
=> how far execution may remain economically/risk-legally acceptable
```

‏ב־`LIT`, ה־Limit materialization צריכה להישאר compatible עם `Economic Price Bound`.

‏ב־`MIT`, אם אין client-defined Limit לאחר trigger, Risk Policy צריכה להבין במפורש שהיא מאשרת Market-style post-trigger semantics.

---

## ‏6A.13 `Trailing Market If Touched`

> ‏`FACT` — IBKR מתארת `Trailing Market If Touched` כ־if-touched trigger דינמית שעוקבת אחרי השוק לפי trailing rule; כאשר ה־trigger נוגעת, נשלחת Market Order.

‏כלומר:

```text
TriggerMovementRule = TRAILING
PostTriggerPrimitive = MKT
```

‏ה־Trailing משנה את **מיקום ה־trigger לאורך המסלול**. היא אינה משנה את העובדה שאחרי activation מדובר ב־Market execution.

---

## ‏6A.14 `Trailing Limit If Touched`

> ‏`FACT` — IBKR מתארת `Trailing Limit If Touched` כ־trigger דינמית עם trailing amount ו־limit offset; כאשר ה־trigger נוגעת, נשלחת Limit Order.

‏במונחי taxonomy:

```text
TriggerMovementRule = TRAILING
PostTriggerPrimitive = LMT
PostTriggerLimitRule = trigger/offset-derived according to broker semantics
```

‏לכן היא path-dependent גם לפני trigger, וגם דורשת להבין את Limit שנוצרת לאחר trigger.

---

## ‏6A.15 Trailing היא Path-Dependent Trigger Policy

‏אי אפשר לשחזר Trailing Order רק מ־:

```text
current_market_price
current_trigger_price
```

‏צריך גם לדעת לפחות:

```text
initial_reference
trailing_amount_or_percent
extreme/favorable path state
current_calculated_trigger
limit_offset if relevant
broker order state
```

‏אותו מחיר שוק נוכחי יכול להוביל ל־trigger שונה אם המסלול ההיסטורי היה שונה.

---

## ‏6A.16 `Trailing MIT/LIT` אינן Trailing Stop aliases

‏שתיהן משתמשות ב־moving trigger, אבל ה־trigger orientation וה־intent שונים.

```text
Trailing Stop
=> trailing protection / adverse reversal logic

Trailing If-Touched
=> if-touched family with moving activation threshold
```

‏לא מספיק לומר "שתיהן trail ולכן הן אותו דבר".

---

## ‏6A.17 Why / When / Why Not — Trailing If-Touched

### ‏Why

‏מאפשרת ל־activation threshold להשתפר/להסתגל למסלול המחיר במקום להישאר ברמה סטטית אחת.

### ‏When

‏כאשר עצם דפוס התנועה וה־retracement הם חלק מה־Intent, וה־Broker-managed trigger behavior מתאים ל־holding horizon.

### ‏Why Not

‏כאשר horizon קצר ורעש microstructure יכול להזיז/להפעיל את ה־trigger בצורה שאינה תואמת את Signal; או כאשר קשה לנו לשחזר בדיוק את broker-side path state.

---

## ‏6A.18 Failure Contract — Triggered Orders

```text
Where does trigger live?          Broker/venue path according to capability
Who evaluates trigger?            Broker/venue semantics after acceptance
Can it outlive local intent?       Yes while active
Can trigger arrive late locally?   Yes as observed event
Can fill arrive after cancel?      Yes until terminal evidence proves otherwise
What becomes stale?                trigger intent, post-trigger order, or both
What must be reconciled?           trigger state + post-trigger order + fills
```

> ‏`ENGINE INVARIANT` — Local state `NOT_TRIGGERED` אינה proof שה־Broker לא הפעילה כבר את ה־Order.

---

## ‏6A.19 Late Effect Taxonomy עבור Triggered Orders

‏Late effect אינה רק Fill.

‏לאחר local invalidation/cancel request אפשר תיאורטית לצפות ב־events כגון:

```text
trigger activation
post-trigger order acknowledgement
partial fill
full fill
cancel acknowledgement
reject
```

‏לכן recovery צריכה לשאול:

```text
Did trigger occur?
What child/post-trigger execution object exists now?
Can it still execute?
What quantity is already filled?
```

‏ולא רק "האם קיבלנו Fill".

---

## ‏6A.20 Signal Decay מול Broker-Managed Trigger

‏Broker אינה יודעת שה־private Signal שלנו פגה.

‏לכן:

```text
signal invalidated
application_order_ttl expired
Economic Price Bound changed
system entered EXIT_ONLY/FROZEN
```

‏יכולים להפוך Triggered Order קיימת ל־stale intent גם אם Broker עדיין מחזיקה אותה באופן חוקי.

‏התגובה היא fresh Decision / cancel-reconcile path, לא המתנה עיוורת ל־trigger.

---

## ‏6A.21 Partial Fill אחרי Trigger היא Decision State חדשה

‏אם `LIT`, ‏`MIT` או גרסה Trailing קיבלה Partial Fill:

```text
apply execution fact
→ update/reconcile position
→ assign protection responsibility
→ inspect remaining working quantity
→ fresh decision
```

‏אין continuation סמנטי אוטומטי רק משום שה־Order המקורית עדיין חיה.

---

## ‏6A.22 Capability facts ב־IBKR

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏בקטלוג Order Types הנוכחי של IBKR:

- ‏`Market If Touched` מופיעה עבור מוצרים רבים, כולל Stocks/ETFs, עם Smart/Directed/Lite במסלולים המוצגים בקטלוג.
- ‏`Limit If Touched` מופיעה עם Smart/Directed/Lite במסלולים המוצגים בקטלוג.
- ‏`Trailing Market If Touched` מתועדת עבור Stocks/ETFs ומוצרים נוספים, ב־TWS, עם Smart/Directed.
- ‏`Trailing Limit If Touched` מתועדת עבור Stocks/ETFs ומוצרים נוספים, ב־TWS, עם Smart/Directed.

‏אין להסיק מכך:

```text
supported_for_every_contract_account_api_session = true
```

‏ה־Capability Resolver עדיין חייב scope של Product/Contract/API or platform path/Route/Account/Session/parameter combination ולעבור enablement evidence לפני Production.

---

## ‏6A.23 Candidate Registry מוצע

```text
MARKET_IF_TOUCHED {
  category                = TRIGGERED_ORDER
  trigger_family          = IF_TOUCHED
  post_trigger_primitive  = MKT
  research_role           = REFERENCE
  failure_destination     = REDECIDE_OR_RECONCILE
}

LIMIT_IF_TOUCHED {
  category                = TRIGGERED_ORDER
  trigger_family          = IF_TOUCHED
  post_trigger_primitive  = LMT
  requires_economic_bound = true
  research_role           = REFERENCE
  failure_destination     = REDECIDE_OR_RECONCILE
}

TRAILING_MIT {
  category                = DYNAMIC_TRIGGERED_ORDER
  trigger_family          = IF_TOUCHED
  trigger_movement        = TRAILING
  post_trigger_primitive  = MKT
  research_role           = REFERENCE
}

TRAILING_LIT {
  category                = DYNAMIC_TRIGGERED_ORDER
  trigger_family          = IF_TOUCHED
  trigger_movement        = TRAILING
  post_trigger_primitive  = LMT
  research_role           = REFERENCE
}
```

‏בשלב הזה הן `REFERENCE`, לא Core V1 candidates. הערך העיקרי שלהן לקורס הוא להבין Trigger semantics מקצועית ולמנוע ערבוב עם Stop/Trailing Stop.

---

## ‏6A.24 Decision Example

‏נניח Strategy אומרת:

```text
only consider entry if price retraces to a defined trigger
```

‏אחרי trigger:

```text
if execution certainty dominates price protection
=> MIT semantics may be conceptually relevant

if explicit post-trigger price bound is mandatory
=> LIT semantics may be conceptually relevant
```

‏זו אינה המלצת Live; זו דרך להפריד trigger intent מ־execution intent.

---

## ‏6A.25 Counterexample

‏נניח `LIT` הופעלה, אך ה־Limit שלאחר trigger לא התמלאה וה־Signal כבר פגה.

‏טעות:

```text
trigger happened
=> strategy condition was satisfied forever
=> keep order until fill
```

‏התגובה הקנונית:

```text
trigger fact
→ post-trigger order state
→ fresh signal/market/risk snapshot
→ ORDER_STILL_VALID?
→ keep / cancel / reconcile
```

---

## ‏6A.26 Acceptance Tests

```text
1. Trigger event and Fill event are persisted separately.
2. MIT trigger never implies a guaranteed fill price.
3. LIT trigger never implies a fill.
4. LIT post-trigger limit never exceeds current Economic Price Bound.
5. Trailing trigger state is treated as path-dependent broker-managed state.
6. Local signal invalidation can cancel a not-yet-triggered order via fresh decision.
7. Cancel-requested triggered order remains potentially executable until terminal evidence.
8. Partial fill after trigger creates a new decision state.
9. Reconnect rebuilds trigger/post-trigger lifecycle before READY.
10. Capability failure never auto-falls back from LIT to unbounded Market.
11. Triggered order that activated while disconnected is discovered and reconciled.
12. Same facts + same policy produce the same semantic decision.
```

---

## ‏6A.27 Practitioner Insight

> ‏`ENGINE RULE` — Trigger אינה Execution.

‏ארבע שאלות מקצועיות נפרדות:

```text
What moves the trigger?
What event activates it?
What order exists after activation?
What can still execute if local intent expires?
```

‏מי שמחבר את כולן למילה אחת כמו `Stop`, ‏`MIT` או `Trailing` מפספס את ה־failure modes החשובים ביותר.

---

# ‏מקורות רשמיים לחלק 6A

- ‏IBKR — Order Types and Algos / `Market If Touched`, ‏`Limit If Touched`, ‏`Trailing Market If Touched`, ‏`Trailing Limit If Touched`: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR — `Limit If Touched` example/order description: <https://www.interactivebrokers.com/en/trading/ordertypes.php?m=goodTilDateTimeModal>

---

# ‏Checkpoint — סוף חלק 6A

‏הוספנו את משפחת If-Touched ואת ה־Trigger taxonomy החסרה. `MIT` ו־`LIT` חולקות activation לפי touched-price condition אך נבדלות ב־post-trigger primitive: Market מול Limit. ‏Trailing MIT/LIT מוסיפות path-dependent moving trigger, בלי לשנות את ההפרדה העקרונית בין activation לבין execution. במנוע הן נשארות כרגע `REFERENCE`, עם capability validation, lifecycle reconciliation ו־fresh decision לאחר trigger/fill/invalidation.

# ‏חלק 6B — Trigger & Dynamic Exit Decision Guide: ‏`Stop`, ‏`Stop Limit`, ‏`MIT`, ‏`LIT`, ‏Trailing ו־Adjustable

> ‏הפרק הזה הוא שכבת Decision מעל Parts 6 ו־6A. הוא אינו מוסיף Order Types חדשים; הוא מסביר איך לבחור בין משפחות Trigger דומות, ואיך להפריד בין **מי מזיז את trigger/protection לאורך זמן** לבין **מה קורה לאחר activation**.

---

## ‏6B.1 שתי הכרעות שונות

‏בכל Triggered Order יש לפחות שתי החלטות:

```text
A. Activation semantics
What market event activates the order?

B. Post-trigger execution
What execution primitive/behavior exists after activation?
```

‏וב־dynamic protection יש החלטה שלישית:

```text
C. Rule ownership
Who is allowed to change the trigger/protection rule over time?
```

> ‏`ENGINE RULE` — אין לבחור לפי שם Order בלבד. ‏Trigger direction, ‏post-trigger execution ו־rule ownership הם dimensions נפרדים.

---

# ‏חלק א — `Stop` מול `Stop Limit` מול `MIT` מול `LIT`

## ‏6B.2 Comparison Matrix — שני צירים, ארבע משפחות

| Family | Trigger intent | Post-trigger execution | Price protection לאחר trigger | failure המרכזי |
|---|---|---|---|---|
| `Stop` | adverse / stop-side | Market-style | אין client-defined Limit | slippage / gap |
| `Stop Limit` | adverse / stop-side | Limit-style | כן | triggered but unfilled |
| `MIT` | if-touched / favorable-side | Market-style | אין client-defined Limit | slippage after touch |
| `LIT` | if-touched / favorable-side | Limit-style | כן | triggered but unfilled |

‏אפשר לחשוב עליהן כעל מכפלה של שני axes:

```text
TriggerDirection:
ADVERSE_STOP_SIDE
IF_TOUCHED_SIDE

PostTriggerPrimitive:
MKT
LMT
```

‏מכאן:

```text
Stop       = ADVERSE_STOP_SIDE + MKT
Stop Limit = ADVERSE_STOP_SIDE + LMT
MIT        = IF_TOUCHED_SIDE    + MKT
LIT        = IF_TOUCHED_SIDE    + LMT
```

---

## ‏6B.3 `Stop` — Decision Card

### ‏What

‏Trigger adverse-side שלאחר activation מוביל ל־Market-style execution.

### ‏Why

‏כדי להעדיף **execution certainty** לאחר שה־risk condition הופעלה.

### ‏When

```text
position/risk must be reduced after trigger
remaining exposure is more dangerous than uncertain execution price
post-trigger price protection is secondary
```

### ‏Why Not

‏Gap, burst volatility או thin liquidity יכולים לייצר execution רחוק מה־trigger.

### ‏Closest Alternative

`Stop Limit` כאשר worst acceptable execution price חשוב יותר מהבטחת יציאה לאחר trigger.

### ‏Main Failure Mode

```text
trigger fires
→ market has already moved
→ fill occurs materially beyond trigger
```

### ‏For Our Engine

```text
PROTECTION_REFERENCE / SPECIALIST
```

---

## ‏6B.4 `Stop Limit` — Decision Card

### ‏What

‏אותו adverse-style trigger, אבל לאחר activation נוצרת Limit-style execution עם price boundary.

### ‏Why

‏כדי להגביל את המחיר שבו נרצה לבצע לאחר trigger.

### ‏When

```text
price protection is mandatory
remaining-position risk is tolerable if order does not fill immediately
there is a defined recovery/escalation policy for triggered-but-unfilled state
```

### ‏Why Not

‏ה־Order יכולה לעשות בדיוק את מה שביקשנו מבחינת trigger — ועדיין להשאיר את ה־Position פתוחה.

### ‏Closest Alternative

`Stop` כאשר position certainty עדיפה על price certainty.

### ‏Main Failure Mode

```text
trigger fires
→ market gaps through limit
→ order remains unfilled
→ position risk continues
```

### ‏For Our Engine

```text
SPECIALIST_CONDITIONAL
```

---

## ‏6B.5 `MIT` — Decision Card

### ‏What

‏If-touched trigger בצד ההפוך מ־Stop טיפוסית; לאחר touch מופעלת Market-style execution.

### ‏Why

‏כדי להמתין לרמת מחיר רצויה ורק אז לבקש execution מיידי יחסית.

### ‏When

```text
reaching the trigger is itself part of the entry/exit intent
post-trigger fill urgency matters more than exact fill price
Market-style execution is allowed by policy
```

### ‏Why Not

‏Touch אינו fill guarantee במחיר ה־trigger; execution יכולה להתרחש לאחר שהשוק כבר זז.

### ‏Closest Alternative

`LIT` כאשר לאחר touch עדיין נדרשת Limit מפורשת.

### ‏Main Failure Mode

```text
touch occurs
→ Market execution activates
→ slippage consumes expected edge
```

### ‏For Our Engine

```text
REFERENCE
```

---

## ‏6B.6 `LIT` — Decision Card

### ‏What

‏If-touched trigger שלאחריו נוצרת Limit Order במחיר מוגדר.

### ‏Why

‏כדי להפריד בין "רק אם המחיר הגיע לרמה" לבין "גם אז אל תבצע מעבר ל־Limit".

### ‏When

```text
activation must be conditional on touch
post-trigger price protection is mandatory
triggered-but-unfilled outcome is acceptable and observable
```

### ‏Why Not

‏ה־trigger יכולה להתקיים בדיוק לפני שהשוק מתרחק, וה־Limit נשארת ללא Fill.

### ‏Closest Alternative

`MIT` כאשר execution certainty לאחר touch חשובה יותר מה־Limit.

### ‏Main Failure Mode

```text
touch occurs
→ LMT becomes active
→ market moves away
→ TRIGGERED != FILLED
```

### ‏For Our Engine

```text
REFERENCE
```

---

## ‏6B.7 Decision Questions — ארבע המשפחות

```text
Is the trigger adverse/protective or favorable/if-touched?

After activation, do we prefer execution certainty or price protection?

Can triggered-but-unfilled exposure remain open safely?

Can Market-style post-trigger slippage destroy the trade economics?

Who observes and reconciles trigger activation if the client is disconnected?
```

‏מיפוי ראשוני:

```text
adverse trigger + execution certainty
→ Stop

adverse trigger + explicit price boundary
→ Stop Limit

if-touched trigger + execution certainty
→ MIT

if-touched trigger + explicit price boundary
→ LIT
```

‏זה אינו recommendation אוטומטי; זו taxonomy שמונעת בחירה בשם בלבד.

---

## ‏6B.8 Trigger Price אינו Fill Price ואינו `Economic Price Bound`

‏שלושה מושגים שונים:

```text
trigger_price
fill_price
Economic Price Bound
```

‏ב־Market-style post-trigger execution אין client-defined Limit שמבטיחה שה־fill תישאר בתוך trigger price.

‏ב־Limit-style post-trigger execution Limit יכולה להיות compatible עם `Economic Price Bound`, אך אינה מבטיחה Fill.

> ‏`ENGINE RULE` — Trigger answers `WHEN`; price bound answers `HOW FAR`; neither answers `WILL IT FILL`.

---

## ‏6B.9 Counterexample — “Stop Limit בטוחה יותר מ־Stop”

‏נניח Position קיימת והשוק יורד מהר.

```text
Stop:
may fill with slippage
but position may be reduced

Stop Limit:
may preserve price boundary
but position may remain open
```

‏אין סדר בטיחות מוחלט.

‏ההכרעה תלויה ב־risk objective:

```text
protect execution certainty
or
protect execution price
```

---

## ‏6B.10 Counterexample — “MIT ו־Stop זה אותו דבר כי שניהם הופכים ל־Market”

‏לא.

‏ה־post-trigger primitive יכול להיות דומה, אבל ה־trigger intent הפוך.

```text
Stop
→ activate on adverse/stop-side movement

MIT
→ activate on if-touched/favorable-side condition
```

‏אותו `MKT` לאחר trigger אינו הופך את ה־Orders לשקולות.

---

# ‏חלק ב — `Trailing Stop` מול `Adjustable Stop` מול local dynamic exit

## ‏6B.11 השאלה המרכזית: מי מחזיק את ה־dynamic rule

‏שלושת המנגנונים יכולים להגיב לשינוי מצב לאורך זמן, אבל ownership שונה:

| Mechanism | מי משנה את הכלל לאורך זמן | מה משתנה | context מקומי זמין? | תלות ב־client |
|---|---|---|---|---|
| `Trailing Stop` | Broker/Venue path | trigger ratchet | מוגבל ל־broker rule | נמוכה יותר לאחר acceptance |
| `Adjustable Stop` | Broker לפי trigger/transformation rule שנשלחה מראש | Order יכולה להשתנות ל־order behavior אחר | מוגבל לפרמטרים שנשלחו | נמוכה יותר לאחר acceptance |
| local dynamic exit | Decision Engine שלנו | mode/candidate/price/size/exit action | מלאה לפי state המקומי | גבוהה |

> ‏`ENGINE RULE` — Broker-managed dynamic protection יודעת market rule; היא אינה יודעת את מלוא private Signal, ‏position context או local opportunity state שלנו.

---

## ‏6B.12 `Trailing Stop` — Decision Card

### ‏What

‏Broker-managed/path-dependent trigger ratchet: trigger יכולה לנוע בכיוון המיטיב ואינה נסוגה בחזרה לפי trailing semantics.

### ‏Why

‏כדי לקבל dynamic protective boundary בלי לשלוח client-side modify בכל שינוי מחיר.

### ‏When

```text
simple ratchet captures the intended protection logic
broker-side survivability is valuable
local client may disconnect
path-dependent trailing state can be reconciled reliably
```

### ‏Why Not

‏Trailing rule לרוב אינה יודעת Signal decay, spread regime, quote quality, exit feasibility או context רחב יותר של Strategy.

### ‏Closest Alternative

local dynamic exit כאשר נדרש context-aware decision; `Adjustable Stop` כאשר רוצים broker-side transformation rule ולא רק ratchet.

### ‏Main Failure Mode

```text
microstructure noise hits trailing threshold
→ protection triggers correctly by rule
→ exit occurs too early for the strategy context
```

### ‏For Our Engine

```text
RESEARCH_CHALLENGER / PROTECTION_REFERENCE
```

---

## ‏6B.13 `Adjustable Stop` — Decision Card

### ‏What

‏Broker-managed transforming-order mechanism: trigger מסוימת יכולה לשנות Order קיימת ל־Stop/Stop-Limit או behavior אחר לפי semantics שהוגדרו מראש.

### ‏Why

‏כדי להטמיע transformation rule אצל Broker במקום להסתמך על client wake-up → cancel/modify → submit sequence.

### ‏When

```text
transformation rule is simple and known in advance
broker-side execution of the transformation has operational value
client-side latency/disconnect risk is material
capability and exact transformation semantics are validated
```

### ‏Why Not

‏ה־rule קבועה יחסית למה שהוגדר מראש ואינה מחליפה Decision Engine שמבינה Signal, position, liquidity ו־risk state חדשים.

### ‏Closest Alternative

local dynamic exit כאשר transformation צריכה להיות context-dependent; Trailing Stop כאשר dynamic behavior הוא בעיקר moving ratchet.

### ‏Main Failure Mode

```text
broker transforms order exactly as configured
→ local strategy state has already changed
→ transformed order is still executable under stale intent
```

### ‏For Our Engine

```text
SPECIALIST / REFERENCE
```

---

## ‏6B.14 local dynamic exit — Decision Card

### ‏What

‏Client-managed exit logic שבה כל market/signal/order/position event יכול להוביל ל־fresh decision, למשל:

```text
NORMAL_EXIT
FAST_EXIT
EMERGENCY_REDUCE
```

‏ולבחירת Behavior Candidate חדשה בהתאם ל־state הנוכחי.

### ‏Why

‏כדי להשתמש ב־context שרק המנוע שלנו מכיר:

```text
signal decay
quote deterioration
remaining edge
position age
partial fills
pending-entry exposure
exit feasibility
system health
```

### ‏When

```text
client connectivity and reconciliation are healthy
exit policy depends on more than one market threshold
fresh context materially changes the right action
broker-side backstop exists if required by risk design
```

### ‏Why Not

‏Client-managed intelligence יכולה להיעלם בדיוק בזמן outage/disconnect; ללא broker-resident protection היא עלולה להפוך single point of failure.

### ‏Closest Alternative

Trailing/Adjustable כאשר כלל broker-side פשוט מספיק; Hybrid architecture כאשר רוצים local intelligence + broker backstop.

### ‏Main Failure Mode

```text
client owns all exit intelligence
→ client disconnects / data becomes stale
→ no valid local exit decision can be emitted
```

### ‏For Our Engine

```text
CORE DECISION AUTHORITY
```

---

## ‏6B.15 `Trailing` מול `Adjustable` מול local dynamic exit — משפטי הזיכרון

```text
Trailing Stop
= move a trigger by a predefined path-dependent ratchet rule

Adjustable Stop
= transform an order when a predefined broker-side trigger/rule occurs

Local Dynamic Exit
= re-decide from the full current state whenever relevant facts change
```

‏כלומר:

```text
Trailing = dynamic trigger
Adjustable = broker-managed transformation
Local Exit = dynamic decision
```

---

## ‏6B.16 Decision Example — אותו Long Position, שלוש ארכיטקטורות

‏נניח שה־Position עלתה לטובתנו, אבל המנוע רוצה להגן מפני reversal.

### ‏Case A — rule פשוטה ויציבה

```text
protect with ratchet N cents below favorable extreme
```

‏`Trailing Stop` יכולה להיות conceptually מתאימה.

### ‏Case B — כאשר רמה מסוימת מושגת, להפוך Order להגנה אחרת

```text
when activation condition occurs
transform resting instruction into stop-style protection
```

‏`Adjustable Stop` יכולה להיות conceptually מתאימה אם ה־capability מדויקת ומאומתת.

### ‏Case C — ההחלטה תלויה גם ב־Signal וב־market state

```text
if signal decays AND spread widens AND quote velocity reverses
→ FAST_EXIT
else if price remains healthy
→ keep NORMAL_EXIT
```

‏זה כבר domain של local Decision Engine, לא של trailing amount יחיד.

---

## ‏6B.17 Hybrid Protection — לא חייבים לבחור צד אחד בלבד

‏Architecture שימושית יכולה להיות:

```text
local engine
= owns dynamic NORMAL_EXIT / FAST_EXIT decisions

broker-resident stop/backstop
= owns last-resort protection
```

‏אבל זה דורש ownership/handoff discipline:

```text
local exit starts
→ broker protection may still be executable
→ do not assume cancel request removed it
→ reconcile fills and position
→ confirm safe handoff
```

‏לכן Hybrid אינה "שתי הגנות = יותר בטוח" באופן אוטומטי; היא יוצרת coordination problem שצריך לנהל במפורש.

---

## ‏6B.18 Counterexample — “Broker-managed תמיד בטוח יותר כי הוא שורד disconnect”

‏Survivability היא יתרון אמיתי, אבל היא אינה Strategy intelligence.

‏Broker rule יכולה להמשיך לפעול בצורה נכונה מבחינת parameters שלה גם לאחר שה־Signal המקומי כבר השתנה.

```text
survives disconnect
!=
knows current strategy intent
```

---

## ‏6B.19 Counterexample — “Local exit תמיד חכמה יותר”

‏Local engine יכולה להיות context-aware יותר, אבל אם היא היחידה שיודעת לצאת וה־client מאבד connectivity, sophistication לא עוזרת.

‏לכן צריך להפריד:

```text
Decision Intelligence
from
Protection Survivability
```

‏ולבחור architecture בהתאם ל־failure model.

---

## ‏6B.20 Partial Fill ו־Triggered State

‏בכל המשפחה:

```text
TRIGGERED != FILLED
PARTIALLY_FILLED != ORIGINAL_DECISION_STILL_VALID
```

‏לאחר Fill:

```text
update execution_ledger_position
reconcile broker_reported_position
derive reconciled_position
assign protection ownership
inspect remaining working order
fresh decision
```

‏וב־Limit-style post-trigger Order, triggered-but-unfilled state חייב להיות first-class lifecycle state מבחינת risk.

---

## ‏6B.21 Late Effects

‏לאחר cancel/invalidation עדיין יכולים להגיע:

```text
trigger activation
order transformation
post-trigger acknowledgement
partial fill
full fill
cancel acknowledgement
reject/inactive status
```

‏לכן:

```text
CANCEL_REQUESTED != TERMINAL_NON_EXECUTABLE
```

‏וה־Decision Engine חייבת לעבד late facts לפני כל פעולה חדשה שמגדילה exposure.

---

## ‏6B.22 Telemetry להשוואה

```text
trigger_family
trigger_direction
trigger_price
trigger_method
trigger_movement_rule
trigger_ts
post_trigger_primitive
post_trigger_limit
market_at_trigger
first_fill_ts
avg_fill_price
slippage_from_trigger
triggered_unfilled_duration
trail_mode
trail_value
favorable_extreme
current_calculated_trigger
adjustment_rule
transformation_ts
local_exit_mode
protection_authority
exit_authority
application_order_ttl
cancel_request_ts
terminal_ts
late_effect_type
```

‏במחקר נפריד גם בין:

```text
execution_quality
protection_survivability
strategy_outcome
```

---

## ‏6B.23 Acceptance Tests

```text
1. Stop and MIT are never treated as equivalent merely because both can produce Market-style execution after trigger.
2. Stop Limit and LIT can remain TRIGGERED_BUT_UNFILLED and risk logic observes that state explicitly.
3. Trigger price is never treated as a guaranteed fill price.
4. Limit-style post-trigger execution remains compatible with current Economic Price Bound.
5. Trailing state is treated as path-dependent broker-managed state.
6. Adjustable transformation and local dynamic exit remain separate ownership models.
7. Local signal invalidation can cancel/reconcile a still-working broker-managed trigger order.
8. Partial fill always produces a fresh position/protection decision.
9. Cancel-requested triggered order remains potentially executable until terminal evidence.
10. Hybrid handoff never assumes protection is gone before terminal cancel/replacement evidence.
11. Reconnect reconstructs trigger/transformation/fill state before READY.
12. Same facts + same policy produce the same semantic decision.
```

---

## ‏6B.24 Practitioner Insight

> ‏`ENGINE RULE` — Advanced trigger selection היא בחירה של **risk trade-off + ownership**, לא בחירה של שם שנשמע "בטוח יותר".

‏הדרך לזכור:

```text
Stop       = adverse trigger + Market-style execution
Stop Limit = adverse trigger + Limit-style execution
MIT        = if-touched trigger + Market-style execution
LIT        = if-touched trigger + Limit-style execution

Trailing   = broker/path-managed moving trigger
Adjustable = broker-managed transformation
Local Exit = client-managed fresh decision from full context
```

‏הבחירה הנכונה תלויה בשאלה איזה failure אנחנו מוכנים להחזיק: slippage, non-fill, stale broker rule, או dependence על client availability.

---

# ‏Checkpoint — סוף חלק 6B

‏יצרנו שכבת Decision אחידה ל־`Stop`, ‏`Stop Limit`, ‏`MIT` ו־`LIT`, והפרדנו את trigger direction מן ה־post-trigger execution. בנוסף השווינו `Trailing Stop`, ‏`Adjustable Stop` ו־local dynamic exit לפי ownership של הכלל הדינמי, survivability ו־context awareness. העיקרון הקנוני נשאר: Trigger אינה Fill, Broker-managed protection אינה Strategy intelligence, ו־local intelligence אינה survivable protection בפני עצמה.

# ‏חלק 6C — Composite, Coordination & Conditional Decision Guide: ‏`Bracket`, ‏`OCA/OCO` ו־`Conditional`

> ‏הפרק הזה הוא שכבת Decision מעל Part 6. הוא אינו מוסיף Order Types חדשים; הוא מפריד בין שלושה מנגנונים שנראים לעיתים כאילו כולם פשוט “קושרים Orders יחד”, אך בפועל פותרים בעיות שונות לחלוטין: **Dependency / Composite Structure**, ‏**Mutual Exclusion / Quantity Coordination**, ו־**Predicate**.

---

## ‏6C.1 שלוש שאלות שונות

```text
A. Dependency / Composite Structure
Which orders exist because another order/position exists?

B. Mutual Exclusion / Quantity Coordination
What should happen to peer orders when one of them fills or changes quantity?

C. Predicate
Under what external/internal condition may an order become active or be canceled?
```

‏מיפוי קנוני:

```text
Bracket     -> Composite Order Structure + parent/child dependency
OCA / OCO   -> Mutual exclusion / quantity coordination relationship
Conditional -> Predicate / activation-cancellation policy
```

> ‏`ENGINE RULE` — שלושת המנגנונים אינם `Application Execution Mode`, אינם Routing Policy, ואינם aliases זה של זה.

---

## ‏6C.2 Comparison Matrix

| Mechanism | הבעיה העיקרית שהוא פותר | Relationship מרכזי | האם הוא אטומי? | failure מרכזי |
|---|---|---|---|---|
| `Bracket` | לקשור Entry ל־dependent exits/protection | Parent → Children | לא להניח atomicity | orphan/unprotected/double-exit סביב lifecycle ו־partial fills |
| `OCA/OCO` | לתאם peer orders כך ש־fill/quantity change באחת ישפיע על האחרות | Peer coordination | **לא** | multiple executions before coordination settles |
| `Conditional` | להפעיל/לבטל Order רק כאשר Predicate מתקיים | Predicate → Order action | לא transaction עם market | stale predicate, delayed observation, order still executable after local invalidation |

‏הטבלה מבהירה: `Bracket` עוסקת בעיקר ב־**dependency**, ‏`OCA/OCO` ב־**coordination**, ו־`Conditional` ב־**eligibility based on a predicate**.

---

# ‏חלק א — `Bracket`

## ‏6C.3 `Bracket` — Decision Card

### ‏What

‏Composite structure שבה Parent Entry ו־Child exits/protection מקושרות כך שה־Children תלויות ב־Parent וב־Position שנוצרת ממנה.

### ‏Why

‏כדי להעביר לברוקר חלק מה־dependency/protection graph במקום להסתמך על רצף מקומי בלבד:

```text
entry accepted/fills
→ dependent protection/exit structure becomes relevant
```

### ‏When

```text
position must receive broker-side protection architecture
parent/child semantics are validated for the exact API/path
protection survivability matters
child sizing and activation can be reconciled reliably
```

### ‏Why Not

‏Bracket מוסיפה lifecycle graph: Parent, Children, transmit/activation state, partial fills, cancel races ו־recovery. אם המנוע אינו יודע לשחזר את הגרף אחרי reconnect, ה־structure עלולה להסתיר יותר risk משהיא פותרת.

### ‏Closest Alternative

‏`HYBRID_PROTECTION` כאשר ה־client רוצה להחזיק dynamic Exit Authority אך להשאיר broker-resident backstop; או local-managed exits כאשר dependency פשוטה ו־client availability מקובלת מבחינת failure model.

### ‏Main Failure Mode

```text
parent partially fills
→ actual position exists
→ child/protection quantity or activation is not what local engine assumes
→ position is under-protected, over-protected, or coordination becomes ambiguous
```

### ‏For Our Engine

```text
PROTECTION_ARCHITECTURE / COMPOSITE_STRUCTURE
```

‏`Bracket` אינה Behavior Candidate של Entry ואינה Exit Mode.

---

## ‏6C.4 Parent Partial Fill הוא Contract נפרד

‏הנקודה החשובה ביותר היא שלא מספיק לדעת:

```text
parent filled? yes/no
```

‏צריך לדעת:

```text
parent_filled_qty
current_child_active_qty
current_child_remaining_qty
reconciled_position
protection_coverage_qty
```

‏למשל:

```text
parent target = 100
parent actual fill = 40
```

‏אסור להסיק בלי evidence:

```text
both children now protect exactly 40
```

‏או:

```text
children remain inactive until 100 fills
```

‏ההתנהגות המדויקת היא `ACCEPTANCE TEST REQUIRED` לפי Broker/API/path.

> ‏`ENGINE INVARIANT` — Protection coverage נגזרת מ־broker-observed child state + `reconciled_position`, לא מה־intended parent quantity.

---

## ‏6C.5 `UNTRANSMITTED != PROTECTED`

‏Composite graph מקומי אינו הוכחת הגנה.

```text
parent object exists locally
children objects exist locally
transmit sequencing prepared
```

‏אינו שקול ל־:

```text
broker has accepted executable protection for actual position
```

‏לכן Protection State חייבת להיות observable מה־broker lifecycle.

---

## ‏6C.6 Bracket Decision Example

‏נניח:

```text
entry may fill partially
client can disconnect
position without protection is not allowed by policy
```

‏Bracket יכולה להיות architecture רלוונטית **רק אם** acceptance evidence מוכיחה כיצד child activation/quantity מתנהגות ב־partial fills וב־reconnect.

‏אם הראיות אינן קיימות:

```text
capability documented
!=
production-safe bracket architecture
```

‏והמנוע צריך להשאיר אותה מתחת ל־production enablement הנדרש.

---

# ‏חלק ב — `OCA / OCO`

## ‏6C.7 `OCA/OCO` — Decision Card

### ‏What

‏Relationship בין Orders שבו execution או שינוי quantity של member אחד אמורים לגרום לביטול/התאמה של peers לפי group semantics.

### ‏Why

‏כדי לתאם חלופות mutually exclusive או exits מתחרות בלי שה־client יצטרך לגלות Fill ואז להתחיל coordination מאפס.

### ‏When

```text
multiple live orders represent alternatives for the same exposure
one execution should reduce/cancel peer intent
broker-side coordination provides operational value
group behavior is acceptance-tested
```

### ‏Why Not

‏OCA/OCO אינה transaction אטומית. בתקופת race יותר מ־member אחד יכולה עדיין להיות potentially executable, במיוחד סביב fills/cancels/latency.

### ‏Closest Alternative

‏Client-managed mutual exclusion כאשר צריך policy/context מורכב יותר; `Bracket` כאשר הבעיה היא Parent→Child dependency ולא peer exclusion.

### ‏Main Failure Mode

```text
order A fills
→ broker begins peer coordination
→ order B is still executable during race
→ order B also fills
→ resulting position differs from intended target
```

### ‏For Our Engine

```text
COORDINATION_RELATIONSHIP
```

---

## ‏6C.8 `OCA/OCO` אינה Guarantee של “רק אחת תתבצע”

‏ה־mental model הבטוח הוא:

```text
coordination intent
!=
atomic market transaction
```

‏לכן worst-case exposure צריך להניח שבחלון מסוים כמה Members עדיין יכולים לבצע.

‏במנוע:

```text
for each non-terminal group member:
    include potentially executable quantity in exposure budget
```

‏עד שיש terminal evidence שמסירה אותו מן ה־risk set.

---

## ‏6C.9 Quantity Coordination אחרי Partial Fill

‏Partial Fill יכולה להפוך OCA מבעיה בינארית לבעיה כמותית.

‏נניח:

```text
position = 100
exit A = sell 100
exit B = sell 100
```

‏אם A מתמלאת חלקית ב־35, המצב החדש אינו:

```text
A won, cancel B, done
```

‏אלא:

```text
reconciled_position = 65
A remaining executable qty = ?
B remaining executable qty = ?
coordination update state = ?
```

‏ומכאן fresh Decision/Protection reconciliation.

> ‏`ENGINE RULE` — Partial Fill היא Position Fact חדשה; group semantics אינן תחליף ל־position reconciliation.

---

## ‏6C.10 OCA Decision Example

‏נניח Position קיימת ויש שתי דרכי Exit חלופיות, אבל רק אחת אמורה בסוף לסגור exposure.

‏`OCA` יכולה להיות שימושית כדי להעביר coordination בסיסית לברוקר.

‏אבל Risk Engine עדיין חייבת לשאול:

```text
What if both orders fill before cancellation settles?
What is the maximum temporary/worst-case position?
Can the account tolerate that state?
How is over-exit detected and repaired?
```

‏אם אין תשובה, OCA אינה “הגנה”; היא רק coordination feature.

---

# ‏חלק ג — `Conditional`

## ‏6C.11 `Conditional` — Decision Card

### ‏What

‏Order או action שה־eligibility שלה תלויה ב־Predicate מוגדרת — market, time, instrument, account/other supported condition בהתאם ל־capability.

### ‏Why

‏כדי להצמיד activation/cancellation ל־condition בלי שה־client יצטרך להיות היחיד שמנטר ומגיב בזמן אמת.

### ‏When

```text
predicate is simple and broker-supported
broker-side evaluation improves survivability/latency
condition semantics are explicit
post-condition order behavior remains independently valid
```

### ‏Why Not

‏Predicate אינה Strategy Engine. Broker יכול לדעת שהתנאי התקיים, אבל לא בהכרח שה־Signal שלנו עדיין תקפה או שה־Economic Price Bound לא השתנתה.

### ‏Closest Alternative

‏Client-managed fresh decision כאשר activation דורשת context עשיר; Triggered Orders כאשר ה־condition היא price-trigger semantics מובנית כמו Stop/MIT/LIT.

### ‏Main Failure Mode

```text
predicate becomes true
→ broker activates order
→ local signal/economics have already changed
→ activated order is legal by broker rule but stale by strategy intent
```

### ‏For Our Engine

```text
PREDICATE_POLICY / SPECIALIST
```

---

## ‏6C.12 Predicate אינה Execution Behavior

‏Conditional עונה קודם כול על:

```text
WHEN / WHETHER may this order become active?
```

‏היא אינה עונה לבדה על:

```text
HOW will it execute once active?
```

‏לכן model נכון מפריד:

```text
ConditionPlan
+
PostConditionConcreteOrderPlan
```

‏ולא:

```text
orderType = CONDITIONAL
```

‏כאילו כל ה־execution semantics מוכלים בשם אחד.

---

## ‏6C.13 Conditional Decision Example

‏נניח Order צריכה להתקיים רק כאשר Predicate חיצונית פשוטה מתקיימת.

‏אם ה־Broker יכולה להעריך אותה בעצמה, Conditional יכולה לשפר survivability.

‏אבל לאחר activation עדיין צריך לבדוק:

```text
signal still valid?
Economic Price Bound still valid?
position/exposure still compatible?
working order still wanted?
```

‏אם אין מנגנון invalidation/reconciliation, העברת Predicate לברוקר יכולה להפוך stale intent ל־broker-resident executable order.

---

# ‏חלק ד — איך בוחרים את המנגנון הנכון

## ‏6C.14 Decision Questions

```text
Is the problem parent-child dependency?
→ Bracket / composite architecture

Is the problem mutual exclusion or quantity coordination among peers?
→ OCA/OCO

Is the problem activation based on a predicate?
→ Conditional

Do we actually need more than one mechanism?
→ model each dimension separately; validate the exact combination
```

‏למשל Bracket יכולה להשתמש גם ב־coordination בין exit children, אבל זה אינו הופך `Bracket == OCA`.

‏Composite Structure יכולה **להכיל** coordination relationship ועדיין להישאר concept נפרד.

---

## ‏6C.15 Direct Comparison — `Bracket` מול `OCA/OCO`

### ‏`Bracket`

```text
entry/position dependency is central
children exist because parent/position exists
protection coverage matters
```

### ‏`OCA/OCO`

```text
peer orders already represent competing alternatives
one peer's execution should affect the others
```

‏השאלה המקצועית:

```text
Are these orders dependent children,
or independent peers that need coordination?
```

---

## ‏6C.16 Direct Comparison — `OCA/OCO` מול `Conditional`

‏`OCA/OCO` מגיבה בעיקר ל־state של peer orders/fills.

‏`Conditional` מגיבה ל־Predicate.

```text
OCA:
peer A executed
→ coordinate peer B/C

Conditional:
predicate became true/false
→ activate/cancel target order
```

‏שניהם event-driven, אך האירוע וה־relationship שונים.

---

## ‏6C.17 Direct Comparison — `Bracket` מול `Conditional`

‏Bracket מייצגת lifecycle dependency סביב Parent/Position.

‏Conditional מייצגת eligibility rule.

‏אפשר תיאורטית לשלב dependency ו־predicate, אבל Capability + lifecycle חייבות להיות מאומתות לשילוב המדויק.

> ‏`ENGINE RULE` — אל תבנה “mega advanced order” שמחברת Bracket + OCA + Conditions רק מפני שה־API מכיל fields לכל אחד מהם.

---

## ‏6C.18 Counterexample — “Bracket אומרת שה־Position מוגנת”

‏לא בהכרח.

```text
parent partial fill exists
children not yet confirmed for actual quantity
```

‏או:

```text
local bracket objects exist
but transmit/acceptance state is incomplete
```

‏בשני המקרים:

```text
STRUCTURE_DEFINED
!=
PROTECTION_CONFIRMED
```

---

## ‏6C.19 Counterexample — “OCO מבטיחה שאי אפשר לקבל Double Exit”

‏לא.

‏Non-atomic coordination משמעותה שה־risk model חייב לכלול race שבו שתי Orders עדיין executable.

```text
cancel requested on peer
!=
peer terminal
```

‏ולכן over-exit/position flip הם failure cases שיש לבדוק במפורש.

---

## ‏6C.20 Counterexample — “Conditional אצל Broker מחליפה את ה־Decision Engine”

‏Broker Predicate יכולה להחליף monitoring של תנאי מסוים.

‏היא אינה מחליפה:

```text
signal validity
position truth
risk state
Economic Price Bound
exit feasibility
system health
```

‏כלומר:

```text
broker evaluates condition
!=
broker owns strategy intent
```

---

## ‏6C.21 Ownership Model

‏נפריד לפחות:

```text
DependencyOwner
CoordinationOwner
PredicateEvaluator
ExitAuthority
ProtectionAuthority
PositionTruthOwner
```

‏אותו Broker יכול לבצע כמה מהתפקידים, אבל המודל לא מאחד אותם לשדה אחד בשם:

```text
broker_managed = true
```

‏כי failure handling שונה לכל responsibility.

---

## ‏6C.22 Partial Fill — Fresh Decision בכל שלושת המנגנונים

‏לאחר Partial Fill:

```text
apply execution fact
→ update execution ledger
→ reconcile broker position
→ derive reconciled_position
→ recompute protection coverage
→ recompute group executable exposure
→ inspect predicate/dependency state
→ fresh decision
```

‏אסור לבצע:

```text
remaining_qty = original_qty - fill_qty
→ blindly continue original composite/group/conditional plan
```

‏כי Position, protection, timing ו־Signal state כבר השתנו.

---

## ‏6C.23 Late Effects

‏גם לאחר local invalidation/cancel יכולים להגיע:

```text
parent fill
child activation
child fill
OCA peer fill
OCA cancellation acknowledgement
condition activation
post-condition order acknowledgement
partial fill
full fill
reject/inactive
```

‏ולכן invariant של Part 8 נשאר:

```text
Any order without terminal broker evidence remains potentially executable.
```

---

## ‏6C.24 Failure Contracts — Summary

### ‏Bracket

```text
primary failure destination = RECONCILE_POSITION_AND_PROTECTION_GRAPH
```

### ‏OCA/OCO

```text
primary failure destination = RECONCILE_GROUP_AND_WORST_CASE_EXPOSURE
```

### ‏Conditional

```text
primary failure destination = RECONCILE_PREDICATE_AND_ORDER_LIFECYCLE
```

‏בשלושתם failure אינה authorization ל־fallback אגרסיבי.

---

## ‏6C.25 Telemetry

```text
relationship_type
parent_order_id
child_order_ids[]
parent_filled_qty
child_active_qty
protection_coverage_qty
oca_group_id
oca_group_members[]
oca_member_state
oca_group_potential_exposure
predicate_id
predicate_type
predicate_state
predicate_observed_ts
broker_activation_ts
execution_ledger_position
broker_reported_position
reconciled_position
exit_authority
protection_authority
cancel_request_ts
terminal_ts
late_effect_type
```

‏ה־telemetry צריכה לאפשר Reconstruction של **graph + group + predicate**, לא רק רשימת Orders שטוחה.

---

## ‏6C.26 Decision Record מומלץ

```text
CompositeCoordinationDecision {
  decision_id
  snapshot_id
  purpose
  dependency_plan
  coordination_plan
  condition_plan
  reconciled_position
  protection_requirement
  worst_case_executable_exposure
  exit_authority
  protection_authority
  capability_requirements[]
  acceptance_evidence_required[]
  failure_destination
}
```

‏כך אפשר להסביר איזה mechanism נבחר עבור איזו בעיה, במקום להסתמך על Broker order labels.

---

## ‏6C.27 Acceptance Tests

```text
1. Bracket, OCA/OCO and Conditional remain distinct taxonomy categories.
2. Bracket parent partial fill never assumes child coverage without broker-observed evidence.
3. UNTRANSMITTED never counts as protected.
4. Protection coverage is checked against reconciled_position, not intended parent quantity.
5. OCA/OCO is never treated as atomic mutual exclusion.
6. Every non-terminal OCA member contributes to worst-case potentially executable exposure.
7. OCA partial fill triggers quantity/group reconciliation before any new order side effect.
8. Conditional predicate state and post-condition order lifecycle are persisted separately.
9. Predicate activation never proves strategy intent is still valid.
10. Cancel-requested peer/child/conditional order remains potentially executable until terminal evidence.
11. Reconnect reconstructs dependency graph, OCA group state, predicate state, fills and position before READY.
12. Failure in any mechanism returns to reconciliation/fresh decision; it never auto-escalates aggression.
13. Same broker facts + same policy produce the same reconstructed ownership and semantic decision.
```

---

## ‏6C.28 Practitioner Insight

> ‏`ENGINE RULE` — “Orders קשורות” אינה category מקצועית מספקת.

‏הדרך לזכור:

```text
Bracket
= who depends on whom

OCA/OCO
= which peers must coordinate after execution

Conditional
= what predicate controls eligibility
```

‏והשאלה החשובה ביותר ב־Production היא לא “האם הברוקר תומך בזה?”, אלא:

```text
What can still execute concurrently
if messages, fills, cancels and activations cross in flight?
```

‏שם נמצאת ה־risk האמיתית של composite/coordination orders.

---

# ‏Checkpoint — סוף חלק 6C

‏יצרנו שכבת Decision אחידה ל־`Bracket`, ‏`OCA/OCO` ו־`Conditional`. ‏Bracket נשארת Composite/Dependency Structure; ‏OCA/OCO נשארת non-atomic mutual-exclusion/quantity-coordination relationship; ‏Conditional נשארת Predicate Policy שמופרדת מן ה־post-condition execution. ‏Partial Fill, reconnect ו־late effects מובילים תמיד ל־reconciliation ול־fresh decision, ו־Protection נמדדת מול `reconciled_position` ו־broker-observed executable state — לא מול graph מקומי או intended quantity.

# ‏חלק 7 — Routing Policy ו־Broker Algos: מי מחליט לאן ואיך הפקודה תבוצע

> ‏לפי ה־taxonomy הקנונית ב־`00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md`, ‏`SMART` ו־Direct הם `Routing Policy`; ‏`Adaptive` ו־`MidPrice` הם Broker-managed execution mechanisms/algos; ו־`ADAPTIVE_LIMIT_URGENT`, ‏`MIDPRICE` או `PEGGED_MIDPOINT_DIRECT` הם Behavior Candidates של המנוע. אלה שכבות שונות, גם כאשר UI או API מציגים אותן זו ליד זו.

## ‏7.1 `Routing Policy` היא שכבה נפרדת בתוך ה־Execution Plan

‏כאשר המנוע החליט:

```text
BUY 100 LMT 50.03
```

‏עדיין חסרה החלטה חשובה:

```text
Where should this order go?
```

‏במניות אמריקאיות אותו Symbol יכול להיסחר במספר Venues במקביל. לכן מחיר הפקודה לבדו אינו קובע את execution path.

‏צריך להפריד:

```text
what behavior we want
what broker primitive/attributes express it
where the order may be routed
whether broker execution intelligence is delegated
```

‏זו הסיבה ש־Routing אינה `Application Execution Mode` ואינה Broker Algo. היא dimension נפרד ב־Concrete Order Plan.

---

## ‏7.2 שוק מפוצל משנה את משמעות המילה "ה־Book"

‏אין Book יחיד מושלם שמייצג את כל הנזילות.

‏יש:

```text
multiple lit exchanges
ATS / dark liquidity
hidden/reserve orders
broker/internal liquidity paths
venue-specific order types
```

‏ה־NBBO נותן Best Bid ו־Best Offer לאומיים לפי הכללים הרלוונטיים, אבל אינו אומר שכל הכמות שנוכל לבצע נמצאת ב־Venue אחד.

‏לכן:

```text
best displayed price
!=
complete executable liquidity map
```

---

## ‏7.3 `SMART` — Routing Policy שמאצילה את בחירת ה־Venue ל־IBKR

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מתארת `SmartRouting` כמנגנון שסורק bids/offers בין Venues מתחרים ומנתב Orders ליעדי execution מתאימים, תוך הערכה מתמשכת של תנאי השוק.

‏במקום שהמנוע שלנו יאמר:

```text
route to ARCA
```

‏הוא אומר בקירוב:

```text
routing_policy = SMART
```

‏ומוסר ל־IBKR את בחירת היעד בתוך ה־universe שהיא תומכת בו.

> ‏`ENGINE RULE` — `SMART` אינה Exchange ואינה `Application Execution Mode`; היא Routing Policy.

---

## ‏7.4 `SMART` אינו "שלח פעם אחת ל־Venue הכי טוב"

‏IBKR מתעדת ש־SmartRouting יכולה להמשיך להעריך תנאי שוק ולהפנות או להפנות מחדש חלקים מה־Order בהתאם להזדמנויות execution.

‏מכאן ש־Order אחת לוגית אצלנו יכולה לקבל Fills ממספר מקומות או בזמנים שונים.

‏לכן:

```text
one client order
!=
one venue
!=
one fill
```

---

## ‏7.5 `Best Price` מול `Best Total Consideration`

‏Routing מקצועי אינו תמיד פשוט:

```text
choose numerically best displayed price
```

‏IBKR מתעדת שבמסלולים/הגדרות המתאימים SmartRouting יכולה לשקלל `total consideration`, כלומר מחיר יחד עם עלויות execution, ובפרט transaction costs ו־fees/rebates כאשר מספר Venues חולקים את ה־inside market.

‏למנוע שלנו זה קריטי משום ש־Edge קטן יכול להימחק ב־:

```text
exchange fee
maker/taker economics
commission
slippage
```

‏ולכן Price לבדה אינה metric מלאה.

---

## ‏7.6 למה שתי Venues עם אותו Ask אינן בהכרח שקולות

‏נניח:

```text
Venue A Ask = 20.00
Venue B Ask = 20.00
```

‏עדיין יכולים להיות הבדלים ב־:

```text
available size
expected fill probability
fees
rebates
latency
hidden liquidity
order-type support
queue rules
```

‏לכן Router יכול לבחור אחרת גם כאשר המחיר המוצג זהה.

---

## ‏7.7 `Direct Routing` — Routing Policy שבה אנחנו בוחרים Destination

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מתעדת Direct Routing למניות, ETF ומוצרים נוספים, וב־`TWS`, ‏`IBKR Desktop`, ‏`IBKR Mobile` ו־`Client Portal`.

‏במקום `SMART`, הלקוח מציין Destination ספציפי.

‏זה נותן שליטה גבוהה יותר אבל גם מעביר אלינו אחריות גבוהה יותר.

---

## ‏7.8 Direct Routing אינה בהכרח "מהירה יותר"

‏Direct יכולה לקצר החלטת routing מסוימת ולהיות deterministic יותר, אבל אם בחרנו Venue לא נכון:

```text
no liquidity there
better price exists elsewhere
hidden fill opportunity exists elsewhere
venue is slower or degraded
```

‏אז שליטה גבוהה יותר יכולה לייצר execution גרועה יותר.

> ‏`ENGINE RULE` — `Direct` מתארת **מי בוחר Destination**. היא אינה הגדרה של latency, fill quality או aggressiveness; את אלה מודדים.

---

## ‏7.9 למה בכל זאת Direct חשובה מאוד

‏יש מקרים שבהם Broker Order Primitive/variant או execution feature דורשים Destination מסוים.

‏כבר ראינו למשל שב־IBKR `Pegged-to-Midpoint` למניות אמריקאיות דורשת Direct Routing.

‏כלומר לפעמים:

```text
behavior / broker feature choice
=> constrains routing policy
```

‏ולא להפך.

---

## ‏7.10 `SMART` מול Direct — מי מחזיק את ה־Venue Model?

‏ב־SMART:

```text
IBKR maintains venue-selection logic
```

‏ב־Direct:

```text
our engine implicitly owns venue-selection logic
```

‏אם נבחר Direct באופן דינמי, אנחנו צריכים לדעת לפחות:

```text
which venues are valid
what order types each venue supports
fees/rebates
observed latency
fill probability
queue behavior
hidden-liquidity opportunity
reject rates
```

‏זו כבר מערכת Execution Venue Model שלמה.

---

## ‏7.11 `exchange` מול `primaryExchange` ב־TWS API

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏ב־Contract של מניה, `exchange` מגדיר את נתיב ה־routing — למשל `SMART` או Venue ישיר.

‏`primaryExchange` משמש בין היתר לזיהוי מדויק של listing כאשר יש Symbols שעלולים להיות ambiguous, ואינו פשוט "לאן לשלוח את Order".

‏לכן במודל שלנו אסור לערבב:

```text
instrument identity
with
execution destination
```

---

## ‏7.12 `SMART Depth` מול Direct Depth

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏`TWS API` מאפשר `reqMktDepth` עם `isSmartDepth=true` כאשר Contract משתמש ב־`SMART`, ומבדיל זאת מ־Direct-routed depth.

‏זו הבחנה חשובה למחקר:

```text
aggregated/smart execution view
vs
venue-specific book view
```

‏אם בעתיד נבנה Venue Selection משלנו, נצטרך נתונים Venue-specific ולא רק top-of-book מאוחד.

---

## ‏7.13 NBBO אינו מספר לנו איפה כל הנזילות

‏גם אם ה־NBBO הוא:

```text
Bid 20.00
Ask 20.01
```

‏יכולים להיות:

```text
multiple venues quoting 20.01
hidden orders at 20.01
midpoint liquidity at 20.005
non-displayed ATS liquidity
```

‏לכן Router טוב עוסק גם ב־**where**, לא רק ב־**what price**.

---

## ‏7.14 Dark Pools ו־Hidden Liquidity

‏Dark liquidity יכולה להציע Fill בלי להציג את מלוא הכוונה ב־lit book, ולעיתים לאפשר price improvement או להפחית market impact.

‏אבל היא מוסיפה uncertainty:

```text
unknown available size
unknown fill probability
possible information leakage through repeated probing
latency before fallback
```

‏ב־Signal שחי שניות, חיפוש ארוך מדי אחרי hidden liquidity יכול להיות יקר יותר מה־spread שניסינו לחסוך.

---

## ‏7.15 IBKR SmartRouting כוללת גם Dark Pools

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מציינת ש־SmartRouting שלה מחפשת execution גם across exchanges וגם dark pools, ובדף Best Execution הנוכחי היא מתארת שילוב של מספר dark pools בתוך ה־routing logic שלה.

‏זה אחד היתרונות של delegating routing: המנוע שלנו אינו חייב לכתוב בעצמו connector/rules לכל מקור נזילות כדי לקבל חשיפה לחלק מההזדמנויות האלה.

---

## ‏7.16 `SMART DarkOnly` — Routing Variant, לא Execution Mode

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏תיעוד `TWS API` של Smart Routing מציג בין אפשרויות ה־API גם:

```text
SMART
SMART DarkOnly
```

‏זו דוגמה לכך שגם תחת SMART יכולות להיות routing preferences שמשנות את universe של היעדים.

‏עבורנו `DarkOnly` אינה baseline טבעי לסיגנל קצר, משום ש־no-fill/missed-move risk עלול להיות גבוה, אבל היא Candidate מחקרית כש־spread רחב ויש מספיק signal life.

---

## ‏7.17 `IBKR ATS` הוא Destination, לא מילה נרדפת ל־SMART

‏IBKR ATS יכול לשמש Directed destination עבור מניות/ETF אמריקאיים.

‏זה מאפשר לעבוד liquidity בתוך ה־ATS ולנצל order types ייעודיים כגון Pegged-to-Best/Pegged-to-Midpoint.

‏המשמעות:

```text
IBKR broker
!=
SMART only
```

‏אפשר לבחור destination-specific behavior בתוך אותה תשתית Broker.

---

## ‏7.18 `IBKR ATS Reroute to SMART` — רעיון טוב, timeframe לא בהכרח שלנו

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מתעדת אפשרות לתת ל־liquidity-providing Order לנוח ב־IBKR ATS ואז לעבור ל־SMART לאחר מספר דקות שהמשתמש מגדיר.

‏למנוע שבו Signal חי שניות, `minutes` הם בדרך כלל horizon ארוך מדי ל־core entry.

‏לכן הרעיון חשוב מקצועית — staged routing — אבל נצטרך ליישם גרסה קצרה יותר client-side אם נרצה מעבר של מאות מילישניות/שניות.

---

## ‏7.19 Venue Fee אינו פרט חשבונאי שולי

‏Direct Routing documentation של IBKR מזכירה במפורש של־Exchange שנבחר יכולות להיות fees/rebates.

‏אם Edge צפוי קטן, Venue עם מחיר זהה אך fee שונה משנה את economics.

‏לכן נחזיק:

```text
execution_price
+
commission
+
venue_fee
-
venue_rebate
=
all_in_execution_cost
```

---

## ‏7.20 Maker Rebate עלולה לפתות את הרובוט להתנהגות גרועה

‏אם Router מעדיף Venue רק בגלל rebate גבוה, הוא עלול לקבל:

```text
better fee economics
but worse fill probability
or
more adverse selection
```

‏לכן rebate optimization לעולם אינה objective ראשי אצלנו.

‏ה־objective הוא:

```text
maximize realized net edge per signal
```

‏כאשר fee/rebate היא רק אחד המרכיבים.

---

## ‏7.21 `Price Improvement` חייב להימדד מול Benchmark נכון

‏אם BUY התמלאה ב־20.005 כאשר ה־Ask בזמן ההחלטה היה 20.01, אפשר לומר שקיבלנו improvement מול Ask.

‏אבל כדי לדעת אם Routing באמת עזרה צריך גם:

```text
arrival quote
fill latency
missed opportunity on unfilled signals
post-fill markout
fees
```

‏Price improvement לבדה יכולה להסתיר execution איטית או toxic fills.

---

## ‏7.22 Order אחת יכולה להתפצל למספר Fills ו־Venues

‏מנוע צריך לראות Fill כישות בפני עצמה:

```text
fill_id
order_id
venue
qty
price
timestamp
liquidity_flag
fees
```

‏לא רק:

```text
order average fill price
```

‏אחרת אי אפשר להשוות Routing policies מקצועית.

---

## ‏7.23 Routing Latency צריך להימדד, לא לנחש

‏אנחנו לא יכולים להסיק:

```text
Direct = X ms
SMART = Y ms
```

‏באופן אוניברסלי.

‏נמדוד:

```text
decision_to_submit
submit_to_ack
submit_to_first_fill
submit_to_full_fill
```

‏ונפלח לפי:

```text
routing_policy
venue
broker primitive / behavior candidate
symbol regime
session
```

---

## ‏7.24 `SMART` מפחיתה מורכבות מקומית — אבל גם Determinism

‏היתרון:

```text
broker maintains venue logic
router can react without our venue-selection loop
access to multiple venues/dark pools
```

‏החיסרון:

```text
same order intent
may execute differently across market states
```

‏למחקר זה אומר שה־routing policy חייבת להיות feature בטבלה, לא hidden implementation detail.

---

## ‏7.25 Direct מגדילה Determinism — אבל גם Model Risk

‏כאשר אנחנו בוחרים Venue, קל יותר להבין למה Order נמצאת שם.

‏אבל אם ה־Venue Model שלנו מיושן:

```text
fee schedule changed
order type changed
liquidity regime changed
venue degraded
routing rule changed
```

‏השליטה שלנו עצמה נהיית מקור לשגיאה.

‏לכן Direct dynamic routing דורשת תחזוקה רציפה.

---

## ‏7.26 Fallback הוא Re-decision, לא Routing Alias

‏אם Direct Order נדחית או לא מתמלאת, אסור שהתגובה תהיה אוטומטית תמיד:

```text
send SMART immediately
```

‏צריך re-evaluate:

```text
is signal still alive?
is Economic Price Bound still valid?
how much qty already filled?
what changed in the book?
is the fallback capability enabled?
```

> ‏`ENGINE RULE` — `Fallback` פירושו שה־path שנבחר נכשל/אינו זמין ולכן מחשבים חלופות מחדש. ‏`Escalation` פירושה שה־urgency/risk השתנו ולכן מחשבים מחדש תחת constraints חדשים. אף אחד מהם אינו synonym ל־"יותר אגרסיבי".

---

# ‏7.27 `Adaptive` — Broker Algo, לא Routing Policy

‏`Adaptive` הוא לא Venue ולא ערך מקביל ל־`SMART`/Direct ב־taxonomy שלנו.

‏זו שכבת Algo של IBKR שמשלבת SmartRouting עם user-defined priority במטרה לחפש execution טוב יותר תוך שליטה יחסית במהירות.

‏IBKR מתעדת אותו ל־Stocks, ETFs, Options ו־Futures, ב־`TWS`, ‏`IBKR Desktop` ו־`IBKR Mobile`, תחת `IB Algo` routing בממשקי המוצר שלה.

‏מבחינת המודל שלנו:

```text
Routing Policy = broker-required routing path
Broker Algo    = Adaptive
Behavior       = e.g. ADAPTIVE_LIMIT_URGENT
```

‏אין לאחד את שלושת השדות ל־enum אחד.

---

## ‏7.28 `Adaptive` יכולה לעטוף Market או Limit

‏IBKR מציינת שניתן להשתמש ב־Adaptive עם Market או Limit.

‏מבחינתנו ההבדל חשוב:

```text
Adaptive Market
=> no explicit client limit boundary

Adaptive Limit
=> broker algo operates within a client limit
```

‏ל־Edge קטן וקצר, `Adaptive Limit` מעניינת במיוחד משום שהיא מאפשרת ל־Concrete Order לשמר `Economic Price Bound` מפורש.

---

## ‏7.29 המטרה של Adaptive: לעבוד בתוך ה־Spread

‏IBKR מתארת את Adaptive כך ש־Market ואגרסיביות Limit יכולות לנסות להיסחר בין Bid ל־Ask במקום פשוט לקחת מיד את הצד הנגדי.

‏זה בדיוק trade-off שמעניין אותנו:

```text
pay less spread
vs
wait longer and risk missing momentum
```

---

## ‏7.30 שלוש רמות Priority: `Urgent`, ‏`Normal`, ‏`Patient`

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏ב־API IBKR מתעדת:

```text
Urgent
Normal
Patient
```

‏כ־`adaptivePriority`.

‏ה־priority שולטת במשך/אופי החיפוש אחרי price improvement: ‏`Urgent` סורקת לזמן קצר יותר, בעוד `Patient` מחכה יותר במטרה להגדיל סיכוי למחיר טוב.

---

## ‏7.31 למה `Patient` עלולה להיות לא מתאימה ל־Signal שלנו

‏אם Signal life הוא:

```text
800 ms
```

‏אין הרבה ערך ב־Algo שמוכנה להיות סבלנית מעבר לחיי ה־Alpha.

‏לכן אצלנו אין הגיון לבחור Priority לפי שם בלבד.

‏נשווה:

```text
Adaptive Urgent
Adaptive Normal
Adaptive Patient
```

‏מול actual signal lifetime distribution.

---

## ‏7.32 `Urgent` אינה מילה נרדפת ל־`MARKETABLE_LIMIT_IOC`

‏גם Adaptive Urgent עדיין נותנת ל־Broker Algo לנהל execution בתוך framework של Adaptive.

‏לעומת זאת Behavior Candidate של:

```text
MARKETABLE_LIMIT_IOC
```

‏ממומשת באופן ישיר יותר כ־:

```text
Limit that is marketable at decision/materialization
+
IOC
+
Economic Price Bound
```

‏לכן אלו Challengers שונים, לא שתי דרכים לכתוב אותו דבר.

---

## ‏7.33 `Adaptive` מול Passive Limit

‏Passive Limit:

```text
client chooses exact price and waiting policy
```

‏Adaptive:

```text
broker manages part of aggressiveness/search path
```

‏Adaptive יכולה לחסוך client-side repricing ולמצוא in-spread opportunities, אבל פחות קל להסביר מראש בדיוק מה היא תעשה בכל microstate.

---

## ‏7.34 `Adaptive` מול `Relative/Pegged-to-Primary`

‏`Relative` פועלת לפי reference/offset/bound semantics מוגדרות יחסית.

‏`Adaptive` היא Broker Algo רחבה יותר שמחפשת execution לפי priority ו־SmartRouting.

‏לכן:

```text
Relative = explicit dynamic pricing behavior
Adaptive = delegated broker execution intelligence
```

‏למחקר שלנו שניהם חשובים משום שהם בודקים שתי פילוסופיות שונות של אוטומציה.

---

## ‏7.35 `Adaptive` מול `MidPrice`

‏`MidPrice` מכוונת מפורשות ל־NBBO midpoint או טוב יותר.

‏`Adaptive` מכוונת לאיזון בין fill speed ל־price improvement לפי priority.

‏כלומר:

```text
MidPrice objective = midpoint-oriented price improvement
Adaptive objective = configurable speed/price trade-off
```

‏ב־spread רחב, שניהם יכולים להיות מעניינים — מסיבות שונות.

---

## ‏7.36 `Adaptive Limit` צריכה `Economic Price Bound` אמיתי

‏אסור להשתמש ב־Adaptive כדי להתחמק מהשאלה:

```text
what is the maximum economically acceptable buy price?
```

‏ה־Broker Algo משפר execution **בתוך** intent שאנחנו מגדירים; הוא לא אמור להחליט עבורנו אם העסקה עצמה עדיין כלכלית.

---

## ‏7.37 API של Adaptive

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏ב־TWS API התבנית המתועדת היא רעיונית:

```text
algoStrategy = "Adaptive"
adaptivePriority = "Urgent" | "Normal" | "Patient"
```

‏וב־Web API קיימת גם תמיכה ב־`strategy = Adaptive` וב־`strategyParameters`.

‏בנוסף, Web API מספק endpoint לקבלת algos זמינים ל־Contract — דבר שמחזק את עקרון runtime capability discovery.

---

## ‏7.38 Broker Algo לא מכירה את ה־Alpha שלנו

‏זו הנקודה הקריטית ביותר.

‏IBKR יכולה לדעת:

```text
quotes
venues
routing state
execution opportunities
```

‏אבל היא אינה יודעת בהכרח:

```text
our signal just decayed
wave reversed
our scanner found a better stock
our expected edge fell below threshold
```

‏לכן כל Broker Algo חייבת להישאר כפופה ל־:

```text
signal_ttl
application_order_ttl
signal validity
Economic Price Bound
cancel policy
position/risk constraints
```

> ‏`ENGINE RULE` — הברוקר יכול לנהל חלק מ־`HOW`; המנוע שלנו נשאר בעל הסמכות על `WHETHER THE INTENT IS STILL VALID`.

---

## ‏7.39 איפה ה־Intelligence חיה?

| שכבה | מה היא יכולה לדעת/לנהל | מה אסור להניח שהיא יודעת |
|---|---|---|
| Client Engine | ‏Signal, private features, economic bounds, portfolio/risk intent | ‏Venue internals שאינם חשופים |
| Broker / IBKR Algo | ‏routing universe, broker market data, execution opportunities, algo state | ‏שה־private signal שלנו עדיין חי |
| Venue | ‏matching/priority/native order semantics באותו Venue | ‏portfolio intent או cross-venue private policy שלנו |

‏הטבלה הזו אינה אומרת שכל feature באמת resident במקום מסוים; residency ו־implementation צריכים להיבדק לפי capability. היא רק מונעת מאיתנו לייחס intelligence לשכבה שאינה מחזיקה אותה.

---

## ‏7.40 מה קורה אם Signal מת בזמן שה־Algo עובדת?

‏המנוע צריך לשלוח Cancel ולהתייחס אליו בדיוק כמו לכל Order:

```text
cancel requested
!=
cancel confirmed
```

‏Broker-managed execution לא מבטלת fill/cancel races.

‏לכן Algo Order עדיין שייכת לאותה Execution State Machine שלנו.

---

## ‏7.41 `MidPrice` מזווית Routing

‏בחלק 5 למדנו את ה־pricing semantics.

‏כאן חשוב לראות את routing role: IBKR מתעדת ש־MidPrice יכולה לבחור Exchange עם סיכוי גבוה ל־Pegged-to-Midpoint, להשתמש ב־IEX `D-Peg`, או ליפול ל־native/simulated Relative כאשר אין יעד מתאים.

‏כלומר MidPrice היא דוגמה מצוינת ל־:

```text
one client behavior candidate
=> broker-managed execution intelligence
=> multiple possible routing/execution paths
```

‏ולכן אין לקרוא לה פשוט `SMART midpoint order` כאילו SMART ו־MidPrice הם אותו dimension.

---

## ‏7.42 מה עם `VWAP`, ‏`TWAP`, ‏`Arrival Price`, ‏`POV` ו־`Minimize Impact`?

‏אלה Algos מקצועיות מאוד, אבל פותרות בדרך כלל בעיה אחרת משלנו:

```text
large order
longer execution horizon
benchmark tracking
market-impact control
participation scheduling
```

‏ב־Position קטן שרוצה להיכנס ולצאת בתוך שניות, scheduling לאורך זמן בדרך כלל מתנגש עם signal half-life.

‏נכיר אותן לעומק המספיק כדי לא לפספס רעיון רלוונטי, אבל לא נהפוך אותן ל־baseline.

---

## ‏7.43 `Arrival Price`

‏הרעיון הוא לנהל execution ביחס ל־arrival-price benchmark תוך איזון בין urgency ל־market impact.

‏זה חשוב Institutional Execution, אבל אצלנו arrival horizon קצר כל כך שהשאלה המרכזית אינה כיצד לפרוס Order לאורך עשרות דקות — אלא אם בכלל ניתן לבצע את Edge לפני שהוא מת.

‏לכן `Arrival Price` היא כרגע `REFERENCE ONLY / conceptual value` למנוע הזה.

---

## ‏7.44 `TWAP` ו־`VWAP`

‏`TWAP` מפזרת execution לפי זמן; `VWAP` מכוונת לדפוסי volume/benchmark.

‏אם אנחנו רוצים כמות קטנה יחסית בסיגנל שחי שניות, פיצול מתוזמן יכול להיות בדיוק ההפך ממה שאנחנו צריכים.

‏עם זאת, הן מלמדות עיקרון חשוב:

> ‏Order גדולה צריכה לפעמים להיחשב Schedule של Child Orders, לא פקודה אחת.

‏העיקרון הזה יכול להיות שימושי בעתיד אם Size שלנו יגדל.

---

## ‏7.45 `Percent of Volume`

‏POV מכוונת participation יחסית ל־market volume.

‏היא שימושית כאשר רוצים לא להיות חלק גדול מדי מה־flow.

‏לנו היא הופכת רלוונטית רק אם:

```text
our size is materially large relative to short-horizon volume
```

‏אם הגודל שלנו קטן, המורכבות כנראה אינה מוצדקת.

---

## ‏7.46 `Minimize Impact`

‏המטרה היא לעבוד Order בדרך שמנסה לצמצם market impact.

‏זה מקצועי מאוד לכמות משמעותית.

‏אבל עבור Signal שחי שניות, חיפוש איטי אחרי minimal impact יכול לעלות יותר ב־missed move מההשפעה שחסכנו.

---

## ‏7.47 `Dark Ice`

‏Dark/Iceberg-oriented Algo רלוונטית כאשר Size ו־signaling הם בעיה.

‏למנוע קטן היא אינה baseline.

‏אם בעתיד נראה בנתונים:

```text
our displayed size changes book behavior
```

‏נפתח אותה מחדש כ־Research Candidate.

---

## ‏7.48 `Accumulate / Distribute`

‏IBKR מתעדת אותה כ־Algo שמחלקת Order גדולה ל־increments בגודל ובזמנים שיכולים להיות randomized, במטרה לעבוד volume בלי לחשוף את מלוא הכוונה; היא אף מציינת שאפשר להגדיר אותה ל־high-frequency trading.

‏אבל עצם האפשרות להריץ אותה בתדירות גבוהה אינה אומרת שהיא מתאימה ל־momentum signal של שניות.

‏אצלנו random time slicing יכולה להמשיך לעבוד אחרי שה־Alpha המקורי כבר נעלם.

---

## ‏7.49 Third-Party Algos — למה לא נרוץ אליהן מוקדם

‏IBKR מציגה גם Algos של צדדים שלישיים עם dark seeking, participation ו־venue logic מתקדמים.

‏הבעיה עבורנו אינה שהן "רעות", אלא שהן מוסיפות:

```text
opaque decision layer
vendor-specific semantics
additional capability dependencies
harder reproducibility
```

‏לפני שנכניס שכבה כזו, baseline שלנו עם Orders/IBKR Algos פשוטות צריך להיות חזק ומדיד.

---

## ‏7.50 `SMART` כ־Routing Baseline — `POLICY DEFAULT`, לא Fact אוניברסלי

> ‏`POLICY DEFAULT` — ב־Research V1 סביר להשתמש ב־SMART כ־routing baseline רחב מפני שהוא מפחית צורך במודל Venues עצמאי.

‏אבל אסור לקבוע:

```text
SMART is always best
```

‏אם נתונים יראו ש־Directed route מסוים משפר execution עבור regime ספציפי, ניתן לקדם אותו.

‏החלטה כזו חייבת להיות evidence-driven.

---

## ‏7.51 מתי Direct הופכת Candidate רצינית

‏למשל כאשר:

```text
specific broker primitive/variant requires it
specific venue repeatedly shows better fill quality
we need deterministic midpoint semantics
we need ATS-specific behavior
we can model venue fees/latency/rejections reliably
```

‏כלומר Direct צריכה לפתור Problem מוגדר, לא להיות optimization לשם optimization.

---

## ‏7.52 מתי Broker Algo הופכת Candidate רצינית

‏כאשר:

```text
we want broker-side reaction instead of client-side repricing/search
spread is meaningful
price improvement matters
signal lifetime leaves room for search
we can bound price and time
```

‏והיא מסוכנת כאשר:

```text
signal dies extremely fast
behavior is too opaque for our controls
cancel latency dominates
we cannot measure actual path
```

---

## ‏7.53 `RoutingPlan` ו־`BrokerAlgoPlan` הם אובייקטים נפרדים

‏מודל ישן שמערבב הכול כך:

```text
mode = SMART | DIRECT | IB_ALGO
```

‏שגוי מבחינת ה־taxonomy, משום ש־`IB_ALGO` אינו Routing Policy מקביל ל־SMART/Direct.

‏נעדיף מבנה כגון:

```text
RoutingPlan {
  policy               // SMART | DIRECT
  destination
  smart_variant
  dark_liquidity_policy
  cost_consideration
  max_route_latency_ms
}

BrokerAlgoPlan {
  enabled
  algo_name            // ADAPTIVE | MIDPRICE | ...
  algo_params
}

ConcreteOrderPlan {
  broker_primitive
  tif
  attributes
  economic_price_bound
  routing_plan
  broker_algo_plan
  application_order_ttl
}
```

‏כך Broker-specific requirements יכולות להגביל routing/materialization בלי לזהם את `Application Execution Mode`.

---

## ‏7.54 `Trade Intent` נשאר מעל Routing ו־Broker Algo

‏ה־Strategy אומרת למשל:

```text
BUY
urgency = HIGH
signal_ttl = 900ms
entry_max_price = 50.04
partial_fill_ok = true
```

‏Execution layer יכולה לבחור:

```text
ApplicationExecutionMode = AGGRESSIVE_CAPPED
BehaviorCandidate = MARKETABLE_LIMIT_IOC
RoutingPolicy = SMART
```

‏או:

```text
ApplicationExecutionMode = BROKER_MANAGED
BehaviorCandidate = ADAPTIVE_LIMIT_URGENT
BrokerAlgo = Adaptive(Urgent)
EconomicPriceBound = 50.04
```

‏או:

```text
ApplicationExecutionMode = MIDPOINT_SEEKING
BehaviorCandidate = PEGGED_MIDPOINT_DIRECT
RoutingPolicy = DIRECT
Destination = validated venue
```

‏בלי לשנות את ה־Signal עצמו.

---

## ‏7.55 Routing / Algo Capability Model

‏לכל Contract/path נשמור רעיונית dimensions נפרדים:

```text
valid_exchanges
supported_order_primitives
supported_attributes
supported_tifs
supported_algos
smart_available
direct_destinations
session_constraints
outside_rth_support
```

‏ולא נניח שכל Capability גלובלית של IBKR זמינה לחשבון/Contract/Route שלנו.

‏Capability מסננת מה ניתן לשקול; היא אינה בוחרת את ה־Behavior המנצחת.

---

## ‏7.56 Account / Legal Entity — למה לא כותבים YES/NO גורף

‏התיעוד הרשמי שבדקנו הוא תיעוד מוצר/API גלובלי של IBKR ואינו נותן בכל feature תשובת account/legal-entity `yes/no` פשוטה.

‏לכן לפני Production נבדוק בפועל:

```text
account legal entity
trading permissions
contract
route
API path
paper/live behavior
```

‏וגם נשתמש ב־runtime capability endpoints / ContractDetails כאשר הם רלוונטיים.

‏התוצאה תיכנס ל־enablement progression הקנוני:

```text
DOC_ONLY
RUNTIME_CONFIRMED
PAPER_ACCEPTED
LIVE_SMALL_ACCEPTED
PRODUCTION_ENABLED
```

---

## ‏7.57 `TWS API` ו־Smart Routing

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏תיעוד TWS API מציג Smart Routing options גם ב־API, כולל `SMART` ו־`SMART DarkOnly`, ובשווקים מסוימים options נוספים כגון preferences ל־rebate/fill.

‏מבחינת architecture, Router Adapter צריך להיות configurable ולא לקודד string אחד בכל מקום.

---

## ‏7.58 API אינו Router בפני עצמו

‏IBKR מתעדת של־TWS API אין "לוגיקה עסקית" משל עצמה מעבר להעברת messages; validation והחלטות מתבצעות ב־TWS/servers.

‏לכן:

```text
our API client
-> TWS/Gateway/IBKR infrastructure
-> routing/algo logic
```

‏ולא:

```text
our Python library itself performs SmartRouting
```

‏ההבחנה הזו חשובה ל־latency diagnostics ול־ownership.

---

## ‏7.59 Venue Outage ו־Rejection

‏גם Routing טובה צריכה Failure Policy.

‏נשמור reason codes ונבדיל בין:

```text
unsupported order primitive/combination
invalid route
venue unavailable
broker validation reject
price constraint reject
algo unavailable
```

‏תגובה אוטומטית לכולן ב־"שלח Market" תהיה מסוכנת.

> ‏`ENGINE RULE` — Capability failure אינו market escalation. מסווגים את הכשל ומריצים Decision חדשה על המצב העדכני.

---

## ‏7.60 Stale Market Data + Live Broker Algo

‏תרחיש מסוכן:

```text
our data feed freezes
broker algo remains alive
```

‏ה־Broker עדיין יכול לבצע לפי הנתונים והמערכת שלו, בעוד המנוע המקומי כבר לא יודע אם Signal תקף.

‏לכן market-data health failure צריך להיות trigger ל־cancel/freeze policy מוגדרת.

---

## ‏7.61 Split-Brain בין Broker Execution Intelligence ל־Signal Engine

‏כאשר Broker Algo מנהלת execution וה־Signal Engine מנהל validity, יש שתי מערכות החלטה.

‏צריך חוזה ברור:

```text
broker may optimize HOW within delegated bounds
engine owns WHETHER intent remains valid
```

‏ברגע שה־intent מת — המנוע מבקש Cancel ומתחיל reconciliation. ה־Broker אינו מקבל בעלות על `signal_ttl` רק משום שקיבל Algo Order.

---

## ‏7.62 Research Matrix לחלק 7 — Behavior בנפרד מ־Routing/Algo

‏ל־core entry נשווה לפחות:

| Behavior Candidate | Routing Policy | Broker Algo | מטרה |
|---|---|---|---|
| `MARKETABLE_LIMIT_IOC` | SMART | none | ‏baseline אגרסיבי ותחום |
| `PASSIVE_JOIN` | SMART | none | ‏baseline פסיבי |
| `ADAPTIVE_LIMIT_URGENT` | broker-required path | Adaptive/Urgent | ‏price improvement קצר עם urgency גבוהה |
| `ADAPTIVE_LIMIT_NORMAL` | broker-required path | Adaptive/Normal | ‏יותר search מול latency |
| `MIDPRICE` | SMART | MidPrice | ‏midpoint-oriented broker search |
| `PEGGED_MIDPOINT_DIRECT` | DIRECT | none | ‏midpoint behavior ב־Destination מאומת |
| `RELATIVE_PRIMARY` | SMART או DIRECT לפי capability | none / broker-managed primitive semantics | ‏dynamic repricing לפי reference |

‏Direct Venue-specific plain limits יתווספו רק כאשר יש `RESEARCH HYPOTHESIS` מוגדרת.

---

## ‏7.63 הניסוי חייב להשוות Opportunities, לא רק Fills

‏אותו כלל מחלקים קודמים:

```text
filled orders only
```

‏ייצר bias.

‏לכל Signal opportunity נרשום מה היה קורה לכל candidate, כולל:

```text
filled
partial
no fill
missed move
slippage
fees
markout
exit cost
```

---

## ‏7.64 Telemetry שחייבים להוסיף ל־Routing ו־Broker Algo

```text
behavior_candidate
routing_policy
requested_destination
actual_execution_venue
smart_variant
broker_algo
broker_algo_priority
algo_parameters
dark_policy
liquidity_flag
venue_fee
venue_rebate
route_submit_ts
route_ack_ts
first_fill_ts
all_fill_venues
fill_count
reroute_count_if_observable
```

‏ולכל Fill:

```text
fill_venue
fill_price
fill_qty
fill_ts
maker_taker_flag_if_available
fee_component
```

---

## ‏7.65 Metrics מרכזיים

```text
fill_rate_by_behavior_and_route
partial_fill_rate_by_behavior_and_route
time_to_first_fill
time_to_useful_fill
time_to_full_fill
price_improvement_vs_arrival
implementation_shortfall
all_in_fee_bps
markout_100ms
markout_500ms
markout_1s
markout_5s
missed_move_after_no_fill
cancel_latency
stale_fill_rate
reject_rate
net_edge_per_signal
```

‏זו הדרך להחליט אם Smart/Direct/Adaptive באמת עוזרים, בלי לייחס בטעות שיפור של Algo ל־Routing או להפך.

---

## ‏7.66 Failure Modes שחייבים לבדוק

```text
SMART order fills across multiple venues
Direct venue has no liquidity
Direct broker primitive rejected by venue
venue goes unavailable
market moves during reroute
partial fill then route behavior changes
Adaptive outlives signal
Adaptive cancel races with fill
MidPrice receives no midpoint liquidity
DarkOnly produces repeated no-fill
market data freezes while broker algo remains live
fees differ from expected venue model
contract validExchanges changed
algo unavailable for contract
```

---

## ‏7.67 Acceptance Tests לפני Production Enablement

```text
1. SMART marketable limit full fill
2. SMART marketable limit split fill
3. SMART IOC partial then cancel remainder
4. Direct venue full fill
5. Direct venue no-fill
6. Direct unsupported primitive/combination reject
7. Adaptive Limit Urgent full fill
8. Adaptive Limit Urgent partial fill
9. Adaptive cancel before fill
10. Adaptive cancel racing with fill
11. MidPrice fill at midpoint/better
12. MidPrice no-fill then application_order_ttl cancel
13. Directed midpoint rejection/fallback re-decision
14. Market-data stale while broker algo live
15. Reconnect with algo order still active
16. Verify actual venue/fees from executions
17. Verify ContractDetails/validExchanges capability
18. Verify account-specific availability in paper/live environment
```

---

## ‏7.68 מטריצת התאמה ראשונית למנוע שלנו

| כלי | שכבה קנונית | התאמה ראשונית | יתרון מרכזי | סיכון מרכזי |
|---|---|---|---|---|
| `SMART` | Routing Policy | `CORE BASELINE` | ‏multi-venue search בלי Router מקומי | ‏פחות determinism |
| Direct plain Limit | Routing + primitive | `RESEARCH CHALLENGER` | ‏Venue control | ‏missed liquidity/model risk |
| `Adaptive Limit Urgent` | Broker Algo + Behavior | `RESEARCH CHALLENGER` | ‏price/speed trade-off עם bound | ‏behavior פחות deterministic מ־IOC |
| `Adaptive Limit Normal` | Broker Algo + Behavior | `RESEARCH CHALLENGER` | ‏יותר price-improvement potential | ‏signal decay בזמן search |
| `Adaptive Patient` | Broker Algo | `REFERENCE / RESEARCH` | ‏מחיר אולי טוב יותר | ‏זמן המתנה כנראה ארוך מדי ל־core signal |
| `MidPrice` | Broker Algo + Behavior | `RESEARCH CHALLENGER` | ‏SMART midpoint search | ‏no-fill / broker path opacity |
| `SMART DarkOnly` | Routing Variant | `SPECIALIST / CONDITIONAL` | ‏non-displayed liquidity focus | ‏missed move / unknown liquidity |
| `IBKR ATS Direct` | Destination-specific routing | `SPECIALIST / CONDITIONAL` | ‏ATS-specific behavior | ‏destination dependence |
| `VWAP/TWAP/POV` | Broker Algos | `REFERENCE ONLY` | ‏scheduling/impact control | ‏horizon mismatch |
| `Accumulate/Distribute` | Broker Algo | `REFERENCE ONLY` | ‏large-order slicing | ‏signal half-life mismatch |

‏הסיווגים כאן הם course/research priority, לא הוראת Live.

---

## ‏7.69 Recommendation ארכיטקטונית בשלב הזה

> ‏`POLICY DEFAULT` — בגרסת Research ראשונה לא נבנה Smart Order Router עצמאי בלי evidence שהוא נחוץ.

‏Routing layer צריכה להיות מסוגלת לייצג:

```text
SMART
DIRECT(destination)
```

‏ובנפרד Broker Algo layer צריכה להיות מסוגלת לייצג למשל:

```text
NONE
ADAPTIVE(priority)
MIDPRICE
```

‏Behavior Candidates מחברות את השכבות רק כאשר semantics וה־capability דורשות זאת.

---

## ‏7.70 למה לא לבנות Router עצמאי מוקדם מדי

‏Router עצמאי דורש:

```text
venue data
latency model
fee model
order-type matrix
queue model
outage handling
continuous maintenance
```

‏אם גודל העסקאות שלנו קטן וה־Edge חי שניות, ייתכן שהמורכבות הזו לא תייצר מספיק improvement כדי להצדיק את עצמה.

‏קודם מודדים איפה SMART באמת נכשל עבורנו.

---

## ‏7.71 מתי כן לשקול Router עצמאי

‏רק אם הנתונים מראים patterns חוזרים כגון:

```text
specific venue consistently fills faster/better
specific order family requires direct access
SMART adds measurable delay in our regime
venue-specific queue behavior creates durable execution advantage
fees materially alter net edge
```

‏אז יש `RESEARCH HYPOTHESIS` הנדסית שאפשר לבדוק.

---

## ‏7.72 Routing אינו Alpha

‏Router טוב יכול:

```text
reduce execution cost
improve fill probability
reduce latency
find hidden liquidity
```

‏אבל אינו הופך Signal חסר Edge לרווחי.

‏הוא יכול לשמר או לשחוק Edge קיים; אין להסיק משיפור execution ש־Strategy עצמה קיבלה Alpha חדש.

---

## ‏7.73 Practitioner Secrets — הדברים שקל לפספס

### ‏1. `SMART` היא Routing Policy, לא Exchange

‏`SMART` יכולה להפנות Order למספר destinations לפי מצב השוק.

### ‏2. Direct אינה בהכרח מהירה יותר

‏Venue לא נכון יכול להיות איטי יותר במונחי time-to-fill גם אם path טכני קצר יותר.

### ‏3. Price Tie אינו Cost Tie

‏אותו מחיר displayed בשתי Venues יכול להגיע עם fee/rebate שונה.

### ‏4. NBBO אינו Liquidity Map

‏הוא לא חושף את כל hidden/midpoint/dark liquidity.

### ‏5. Broker Algo לא יודעת שה־Signal מת

‏`signal_ttl`, ‏`application_order_ttl` ו־cancel-on-decay נשארים באחריות שלנו.

### ‏6. `Adaptive Urgent` אינה `IOC`

‏האחת Broker Algo behavior; השנייה Time / Fill semantics מיידית.

### ‏7. `MidPrice` אינה שם אחר ל־SMART

‏SMART היא Routing Policy; ‏MidPrice מוסיפה Broker execution intelligence עם objective משלה.

### ‏8. Direct Routing יוצרת Technical Debt

‏ברגע שאנחנו בוחרים Venue לפי data, אנחנו צריכים לשמור את ה־Venue Model עדכני.

### ‏9. Routing Research בלי Fees הוא Research חסר

‏ב־Edge קטן, כמה basis points יכולים להפוך winner ל־loser.

### ‏10. Fill Venue חייבת להישמר לכל Fill

‏Average price בלבד מוחק את המידע שצריך כדי לשפר Router.

### ‏11. Dark Fill במחיר טוב יכול להיות Toxic

‏Price improvement חייבת להיבחן יחד עם post-fill markout.

### ‏12. פחות Client Messages אינם בהכרח ביצוע טוב יותר

‏Broker Algo יכולה לחסוך cancel/replace churn ועדיין להפסיד ב־missed opportunity או adverse selection.

### ‏13. Route Fallback היא Decision חדשה

‏Order שנכשלה ב־Venue מסוים אינה אישור אוטומטי לשלוח אותה במקום אחר אם ה־Signal כבר השתנה.

### ‏14. Availability אינה Production Eligibility

‏Global documentation או runtime acceptance אינן `PRODUCTION_ENABLED` בלי evidence, recovery ו־risk validation.

### ‏15. יותר Broker Intelligence פירושו גם יותר Delegation

‏היתרון יכול להיות פחות churn ותגובה קרובה יותר ל־routing infrastructure; המחיר הוא פחות control ודטרמיניזם. לכן תמיד שואלים איזה `HOW` אנחנו מעבירים החוצה ואיזה `WHETHER` נשאר אצלנו.

---

# ‏מקורות רשמיים לחלק 7

- ‏IBKR — SmartRouting / Best Price Execution: <https://www.interactivebrokers.com/en/trading/smart-routing.php>
- ‏IBKR — Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR — Direct Routing בתוך Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR TWS API — Smart Routing: <https://www.interactivebrokers.com/docs/tws-api/contracts/contract-management/smart-routing>
- ‏IBKR TWS API — Stock Contracts / SMART vs direct exchange: <https://www.interactivebrokers.com/docs/tws-api/contracts/stocks>
- ‏IBKR TWS API — Market Depth / Smart Depth: <https://www.interactivebrokers.com/docs/tws-api/doc/md/market-depth>
- ‏IBKR API — Adaptive Algo examples: <https://www.interactivebrokers.com/campus/?p=195739&post_type=ibkr-api-page>
- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR Web API — Place Order / algo discovery: <https://www.interactivebrokers.com/docs/web-api/v1/endpoints/orders/place-order>
- ‏IBKR — Dark Pools glossary / SMART routing controls: <https://www.interactivebrokers.com/campus/glossary-terms/dark-pools/>

---

# ‏Checkpoint — סוף חלק 7

‏בחלק הזה הפרדנו בין שכבות delegation שאסור לערבב: ‏`SMART` ו־Direct הן Routing Policies שקובעות מי בוחר Destination; ‏Broker Algos כגון `Adaptive` ו־`MidPrice` מוסיפות execution intelligence; ו־Behavior Candidates של המנוע מחברות את השכבות רק כאשר צריך. ירדנו לעומק של fragmentation, NBBO מול liquidity אמיתית, dark/hidden liquidity, fees/rebates, split fills, venue model, routing latency, fallback, capability discovery ו־telemetry.

‏המסקנה למנוע שלנו היא ש־`SMART` יכולה לשמש `POLICY DEFAULT` מחקרי ולא אמת אוניברסלית; ‏Direct תקודם כאשר יש hypothesis מוכחת או capability שדורשת אותה; ו־`Adaptive Limit Urgent/Normal` יחד עם `MidPrice` נשארות Research Challengers מול `MARKETABLE_LIMIT_IOC`, ‏`PASSIVE_JOIN` ו־Pegged families — תחת `Economic Price Bound`, ‏TTL, capability gating ו־fresh re-decision.

‏החלק הבא יהיה **חלק 8 — Cancel/Replace ו־Execution State Machine**: נרד לרמת lifecycle מלאה של modify/cancel, אובדן queue priority, duplicate/out-of-order events, idempotency, reconnect, late fills, broker truth, reconciliation ו־recovery כך שכל ה־Advanced Orders שלמדנו עד עכשיו יוכלו לחיות בתוך מנוע Production אחד.

---

# ‏חלק 7A — Routing Policy Decision Guide: ‏`SMART` מול Direct, ו־Routing מול Broker Algo

> ‏הפרק הזה הוא שכבת Decision מעל Part 7. הוא אינו מוסיף Routing mechanisms חדשים; הוא עונה על שתי שאלות שקל מאוד לערבב: **מי בוחר Destination**, ו־**מי מנהל את טקטיקת הביצוע בתוך ה־Route שנבחרה**.

---

## ‏7A.1 שני צירים שונים

```text
Routing Policy
= where may / should the order be routed?

Broker Algo
= how does the broker manage execution tactics after receiving the intent?
```

‏דוגמאות קנוניות:

```text
SMART
DIRECT
```

‏הן `Routing Policy`.

```text
Adaptive
MidPrice
```

‏הם Broker-managed execution mechanisms/algos.

```text
ADAPTIVE_LIMIT_URGENT
MIDPRICE
PEGGED_MIDPOINT_DIRECT
```

‏הם `Behavior Candidate` של המנוע.

> ‏`ENGINE RULE` — Route אינה Execution Mode, ו־Broker Algo אינה Routing Policy. הן dimensions נפרדים של `ConcreteOrderPlan`.

---

## ‏7A.2 משפט הזיכרון

```text
SMART vs Direct
= who owns destination selection?

Broker Algo vs no Broker Algo
= who owns execution tactics within the allowed path?
```

‏לכן אפשר עקרונית לקבל combinations כגון:

```text
BehaviorCandidate = ADAPTIVE_LIMIT_URGENT
RoutingPolicy     = SMART
BrokerAlgo        = Adaptive
```

‏או:

```text
BehaviorCandidate = PEGGED_MIDPOINT_DIRECT
RoutingPolicy     = DIRECT
Destination       = validated venue
BrokerAlgo        = none
```

‏אבל רק אם Capability evidence מאשרת את השילוב המדויק.

---

## ‏7A.3 Comparison Matrix — `SMART` מול Direct

| Dimension | `SMART` | Direct |
|---|---|---|
| מי בוחר Destination | IBKR router | Client / execution engine |
| Venue model מקומי נדרש | נמוך יותר | גבוה משמעותית |
| יכולת לנצל כמה מקורות נזילות | broker-managed לפי policy | תלויה ב־destination שנבחר |
| Determinism של destination | נמוך יותר | גבוה יותר |
| Venue-specific feature access | רק כאשר SMART/path תומך | יכול להיות הכרחי לפיצ'רים מסוימים |
| Operational responsibility | יותר אצל Broker | יותר אצל Client |
| failure מרכזי | broker path פחות שקוף/דטרמיניסטי | בחירת Venue שגויה או stale |

‏אין בטבלה מנצחת כללית. השאלה היא איזה ownership model מתאים ל־Behavior ול־evidence שיש לנו.

---

## ‏7A.4 `SMART` — Decision Card

### ‏What

‏Routing Policy שבה IBKR מחזיקה את destination-selection logic בתוך universe הנתמך שלה ומנתבת/מנתבת מחדש לפי תנאי execution.

### ‏Why

‏כדי להשתמש ב־broker venue model במקום לבנות בעצמנו routing engine מלא.

### ‏When

```text
behavior does not require an explicit destination
we want broker-managed venue selection
our local venue model is incomplete
multi-venue / hidden-liquidity access may add value
SMART capability is validated for the concrete order plan
```

### ‏Why Not

‏כאשר research question דורשת destination determinism, כאשר primitive מסוים דורש Direct, או כאשר אנחנו חייבים route-level control שאינו מיוצג ב־SMART plan.

### ‏Closest Alternative

‏Direct Routing כאשר destination עצמה היא חלק מן ה־execution hypothesis או requirement של ה־Behavior.

### ‏Main Failure Mode

```text
same logical candidate
→ broker chooses different execution paths across opportunities
→ local analysis attributes result only to candidate name
→ route/path effect is hidden inside the aggregate metric
```

### ‏For Our Engine

```text
DEFAULT ROUTING BASELINE
```

‏זהו baseline policy למחקר, לא universal truth ולא Execution Mode.

---

## ‏7A.5 Direct Routing — Decision Card

### ‏What

‏Routing Policy שבה המנוע מציין Destination מסוים במקום להאציל את destination selection ל־SMART router.

### ‏Why

‏כדי לקבל destination-specific semantics, attribution, queue behavior או access ל־feature שמחייב route מסוים.

### ‏When

```text
behavior explicitly requires Direct routing
venue-specific hypothesis is being tested
we have current capability evidence
venue data/telemetry is sufficient
failure and fallback behavior are explicit
```

### ‏Why Not

‏Direct מעבירה אלינו את בעיית בחירת Venue. אם המודל המקומי stale או חלקי, deterministic routing יכולה להיות deterministically wrong.

### ‏Closest Alternative

`SMART` כאשר אין reason מוכח לבחור destination מסוים ואנו מעדיפים broker-managed venue selection.

### ‏Main Failure Mode

```text
client selects venue X
→ liquidity / latency / capability changes
→ better opportunity exists elsewhere
→ order remains constrained to an inferior path
```

### ‏For Our Engine

```text
SPECIALIST / RESEARCH_CHALLENGER
```

‏למעט Behaviors שבהם Direct היא materialization requirement ולא בחירה אופציונלית.

---

## ‏7A.6 Route יכולה להיות Constraint שנגזרת מן ה־Behavior

‏לפעמים ה־flow אינו:

```text
choose route
→ choose order behavior
```

‏אלא:

```text
choose Behavior Candidate
→ materialization requirements constrain Routing Policy
```

‏לדוגמה, לפי Part 5/7:

```text
BehaviorCandidate = PEGGED_MIDPOINT_DIRECT
→ RoutingPolicy must be DIRECT
→ Destination must support the primitive
```

‏לעומת:

```text
BehaviorCandidate = MIDPRICE
→ BrokerAlgo = MidPrice
→ RoutingPolicy = SMART
```

‏לכן `RoutingPlan` נבנית אחרי Candidate selection ובשיתוף Capability Resolver.

> ‏`ENGINE RULE` — Routing constraint יכולה לסנן Candidate, אבל Route preference לבדה אינה ממציאה Candidate חדשה.

---

## ‏7A.7 `SMART` אינה “Broker Algo אחד גדול”

‏זו טעות taxonomy נפוצה.

```text
SMART
= destination-selection / routing layer

Adaptive
= broker execution algo

MidPrice
= broker-managed midpoint execution mechanism/algo
```

‏לכן המודל צריך לשמור בנפרד:

```text
routing_policy
broker_algo
behavior_candidate
broker_primitive
attributes
```

‏ולא:

```text
execution_type = SMART_ADAPTIVE
```

‏שמערבב שכבות וקשה לשחזר ממנו intent.

---

## ‏7A.8 Decision Example — אותה `LMT`, שתי Routes שונות

‏נניח:

```text
BehaviorCandidate = PASSIVE_JOIN
BrokerPrimitive   = LMT
EconomicPriceBound = valid
```

### ‏Case A — אין venue hypothesis

```text
we want passive execution
no destination-specific feature is required
venue model is incomplete
```

‏`SMART` היא baseline טבעית יותר למחקר.

### ‏Case B — בודקים Venue מסוימת

```text
research hypothesis = venue X improves queue/fill outcome
direct depth/telemetry is available
venue-specific capability is validated
```

‏Direct יכולה להיות Challenger לגיטימית.

‏ה־Behavior לא השתנתה:

```text
PASSIVE_JOIN
```

‏רק ה־Routing Plan השתנתה.

---

## ‏7A.9 Decision Example — אותה urgency, Broker Algo שונה

‏נניח:

```text
ApplicationExecutionMode = BROKER_MANAGED
BehaviorCandidate = ADAPTIVE_LIMIT_URGENT
```

‏כאן:

```text
RoutingPolicy = SMART
BrokerAlgo = Adaptive
```

‏ה־urgency אינה נובעת מן המילה `SMART`.

‏אם במקום זאת נבחר:

```text
MARKETABLE_LIMIT_IOC
```

‏אפשר עדיין להשתמש ב־SMART routing, אבל:

```text
BrokerAlgo = none
BrokerTIF  = IOC
```

‏כלומר אותה Routing Policy יכולה לשאת Behaviors שונים לחלוטין.

---

## ‏7A.10 Decision Example — Direct אינה synonym של low latency

‏נניח שיש שתי Venues:

```text
Venue A
current visible liquidity = small
observed latency = low

Venue B
current visible liquidity = larger
observed latency = slightly higher
```

‏בחירת `DIRECT -> Venue A` רק משום שהיא “מהירה יותר” אינה decision מספקת.

‏צריך לפחות לשקלל:

```text
useful executable quantity
fill probability
queue state
fees/rebates
reject/degrade state
expected opportunity cost
```

‏לכן:

```text
Direct
!=
fast mode
```

---

## ‏7A.11 `SMART` אינה synonym של best execution guarantee

‏Delegating venue selection יכול לשפר execution path, אבל הוא אינו guarantee לתוצאת Trade או Fill מיטבית בכל Opportunity.

‏המנוע עדיין צריך למדוד:

```text
fill quality
fill latency
venue attribution when observable
fees
slippage
markout
missed move
```

‏ולא להסיק:

```text
SMART selected
→ optimal execution achieved
```

---

## ‏7A.12 Routing Decision מתחילה אחרי Eligibility

‏הסדר הקנוני:

```text
10A gates
→ eligible Behavior Candidates
→ choose behavior
→ derive materialization requirements
→ resolve eligible routing plans
→ choose routing plan
→ materialize concrete broker order
```

‏לא:

```text
pick favorite venue
→ force whatever order can run there
```

‏אלא אם ה־Strategy עצמה מגדירה destination-specific research hypothesis, וגם אז זו constraint מפורשת ולא hidden preference.

---

## ‏7A.13 Direct דורשת Venue Model מקומי

‏אם המנוע רוצה לבחור Direct באופן דינמי, הוא למעשה לוקח ownership על subset של routing intelligence.

‏Venue model מינימלי למחקר צריך להיות מסוגל לשמור לפחות:

```text
venue
capability scope
order-family support
recent reject rate
observed ack latency
observed fill latency
fill ratio
fees/rebates when relevant
queue/markout metrics
last_verified_at
health state
```

‏בלי זה, Direct selection אינה evidence-based decision אלא hard-coded destination preference.

---

## ‏7A.14 Route Freshness

‏Venue שהיה מתאים לפני שעה או אפילו לפני שניות אינו בהכרח מתאים עכשיו.

‏לכן Route evidence צריכה freshness משלה:

```text
routing_snapshot_ts
venue_health_ts
capability_last_verified_at
market_data_ts
```

‏אם ה־route-specific evidence stale:

```text
DIRECT candidate may be eliminated
```

‏אבל אין להסיק אוטומטית:

```text
fall back to SMART and submit immediately
```

‏התגובה הקנונית היא fresh decision עם survivor set חדש.

---

## ‏7A.15 `Fallback` מול Route Failure

‏תרחיש:

```text
DIRECT plan rejected by destination
```

‏תגובה שגויה:

```text
retry SMART immediately with more aggressive price
```

‏תגובה קנונית:

```text
record route/capability failure
→ update capability / health state
→ fresh decision
→ rebuild candidate + routing survivors
```

‏ייתכן שהחלטה חדשה תהיה:

```text
same behavior via SMART
same behavior via another validated direct venue
another behavior
DEFER
NO_TRADE
CANCEL_EXISTING
```

‏Route failure אינה escalation authorization.

---

## ‏7A.16 Broker Algo Failure אינה Route Failure

‏יש להפריד reason codes:

```text
ROUTE_REJECTED
DESTINATION_UNAVAILABLE
ROUTE_CAPABILITY_MISMATCH

BROKER_ALGO_REJECTED
BROKER_ALGO_PARAMETER_INVALID
BROKER_ALGO_NOT_PRODUCTION_ENABLED
```

‏אם `Adaptive` אינה מתקבלת, אין להסיק ש־SMART עצמה “נכשלה”.

‏אם Destination Direct מסוים אינו מקבל primitive, אין להסיק שה־Behavior concept כולה לא רלוונטית בכל path.

---

## ‏7A.17 Pairwise Decision — `SMART` מול Direct

### ‏`SMART` שורדת יותר כאשר

```text
no explicit destination is required
broker venue selection is acceptable
local venue model is weak or incomplete
multi-venue access is valuable
research wants simple routing baseline
```

### ‏Direct שורדת יותר כאשר

```text
candidate requires destination-specific semantics
research needs route-level determinism
venue-specific evidence exists
local engine can own route selection and failure handling
```

### ‏אל תכריע לפי

```text
SMART sounds smarter
Direct sounds faster
```

‏אלה slogans, לא Decision Criteria.

---

## ‏7A.18 Pairwise Decision — Routing Policy מול Broker Algo

‏השאלה הראשונה:

```text
Who chooses destination?
```

‏השאלה השנייה:

```text
Who manages execution tactics after submission?
```

‏אפשר למשל:

```text
SMART + no broker algo
SMART + Adaptive
SMART + MidPrice
DIRECT + venue-native primitive
```

‏לכן `BrokerAlgoPlan` ו־`RoutingPlan` חייבים להיות objects נפרדים.

---

## ‏7A.19 Counterexample — “אם `SMART` יודעת לבחור Venue, אין צורך ב־Behavior Engine”

‏Router יכולה לבחור **where**.

‏היא אינה יודעת לבדה:

```text
whether signal is still valid
how much quantity is still desired
Economic Price Bound
partial-fill policy
whether NO_TRADE is now better
protection responsibility
```

‏כלומר:

```text
routing intelligence
!=
strategy / execution-intent intelligence
```

---

## ‏7A.20 Counterexample — “Direct נותנת שליטה ולכן היא מקצועית יותר”

‏שליטה ללא מודל אינה יתרון.

‏אם אין לנו evidence עדכני על:

```text
liquidity
queue
venue health
fees
capability
```

‏Direct יכולה פשוט לקבע טעות מהר יותר ובצורה יותר deterministic.

---

## ‏7A.21 Counterexample — “Broker Algo פותרת Routing”

‏Broker Algo יכולה להשתמש ב־SMART path כחלק מה־implementation שלה, אבל conceptually היא עדיין execution mechanism נפרד.

‏אם נשמור רק:

```text
algo = Adaptive
```

‏ולא נשמור:

```text
routing_policy
broker_algo
concrete_order_plan
```

‏לא נוכל לבצע Replay מדויק של מה באמת נבחר.

---

## ‏7A.22 Telemetry

```text
behavior_candidate
application_execution_mode
routing_policy
destination
broker_algo
broker_primitive
routing_snapshot_ts
route_capability_id
route_health_state
route_decision_reason
broker_algo_decision_reason
submit_ts
ack_ts
first_fill_ts
fill_venue
fill_qty
fill_price
fees_or_rebates
reject_code
reject_scope
reroute_observed
application_order_ttl
signal_remaining_life_ms
post_fill_markout_100ms
post_fill_markout_500ms
post_fill_markout_1s
```

‏המטרה היא לא רק לדעת “SMART או Direct”, אלא לאפשר attribution של outcome ל־Behavior, Route ו־Algo בנפרד.

---

## ‏7A.23 Decision Record מומלץ

```text
RoutingDecision {
  decision_id
  behavior_candidate
  materialization_requirements[]
  eligible_routing_plans[]
  eliminated_routing_plans[] { route, reason_code }
  selected_routing_policy
  selected_destination
  broker_algo_plan
  capability_evidence[]
  routing_snapshot_ts
  decision_reason
  failure_destination
}
```

‏כך Replay יכול להסביר האם Route נבחרה בגלל feature requirement, venue hypothesis או baseline delegation.

---

## ‏7A.24 Acceptance Tests

```text
1. SMART and DIRECT remain Routing Policies, never Application Execution Modes.
2. Adaptive and MidPrice remain Broker Algos/mechanisms, never Routing Policies.
3. Route preference never creates a Behavior Candidate that failed 10A eligibility.
4. PEGGED_MIDPOINT_DIRECT materialization requires a validated DIRECT route.
5. MIDPRICE materialization remains distinct from directed midpoint peg.
6. Direct route selection requires current route/capability evidence.
7. Route failure triggers fresh decision; it never authorizes automatic price escalation.
8. Broker Algo failure and Routing failure produce different reason codes.
9. Same behavior may be compared under different routing plans without renaming the behavior.
10. Same route may carry different behaviors without becoming part of their Execution Mode name.
11. Research attribution records Behavior, Routing Policy and Broker Algo separately.
12. Same facts + same policy yield the same eligible routing set and selected plan.
```

---

## ‏7A.25 Practitioner Insight

> ‏`ENGINE RULE` — `SMART` ו־Direct אינן תשובות לשאלה “כמה אגרסיבי להיות?”. הן תשובות לשאלה **מי מחזיק את בחירת ה־Destination**.

‏הדרך לזכור:

```text
Behavior Candidate
= what execution behavior we want

Routing Policy
= who/where chooses destination

Broker Algo
= who manages execution tactics
```

‏ה־professional mistake היא למדוד רק Fill outcome ולייחס אותו ל־Order name אחד, כאשר בפועל outcome נוצר משילוב של Behavior + Route + Algo + Market State.

---

# ‏Checkpoint — סוף חלק 7A

‏יצרנו שכבת Decision אחידה ל־`SMART` מול Direct Routing והפרדנו Routing Policy מ־Broker Algo. ‏`SMART` היא baseline של delegated venue selection; Direct היא specialist/research path כאשר destination-specific semantics או route-level hypothesis מצדיקות ownership מקומי. Route אינה Execution Mode, Broker Algo אינה Route, ו־failure בכל אחת מן השכבות חוזר ל־fresh decision במקום ליצור fallback אגרסיבי אוטומטי.

# ‏חלק 8 — Cancel/Replace ו־Execution State Machine: להפוך פקודות למערכת אמינה

> ‏לפי ה־taxonomy הקנונית ב־`00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md`, הפרק הזה מפריד בין ארבעה צירים שאסור לדחוס ל־enum אחד: `Order Lifecycle`, ‏`Epistemic Uncertainty`, ‏`System Operating Mode` ו־`Position Truth`. בנוסף, `Modify` הוא שם כללי מדי: הקורס משתמש ב־`MODIFY_IN_PLACE`, ‏`CANCEL_THEN_NEW` ו־`OVERLAPPED_REPLACEMENT` כאשר צריך לתאר מנגנונים שונים.

## ‏8.1 מכאן והלאה הבעיה המרכזית אינה שם הפקודה — אלא אמת מערכתית

‏אפשר לבחור `Marketable Limit`, ‏`IOC`, ‏`Pegged`, ‏`Adaptive` או `Bracket` בצורה מושלמת, ועדיין להיכשל בגלל מנוע שחושב ש־Order בוטלה כאשר היא עדיין יכולה להתבצע.

‏לכן מערכת Production צריכה לענות בכל רגע:

```text
What did strategy want?
What commands did we send?
What did broker acknowledge?
What actually executed?
What is still potentially executable?
What is our reconciled position now?
```

‏זה הלב של Execution State Machine.

---

## ‏8.2 ארבע שכבות אמת שאסור לערבב

‏נפריד בין:

```text
INTENT TRUTH
COMMAND TRUTH
BROKER-OBSERVED TRUTH
EXECUTION / POSITION TRUTH
```

‏`Intent Truth` אומרת מה האסטרטגיה רוצה עכשיו.

‏`Command Truth` אומרת אילו submit/modify/cancel requests שלחנו.

‏`Broker-Observed Truth` היא ה־state האחרון שה־Broker דיווח.

‏`Execution Truth` היא מה שבוצע בפועל. ממנה נבנה `execution_ledger_position`, שאותה בודקים מול `broker_reported_position` עד שמתקבלת `reconciled_position`.

> ‏`ENGINE RULE` — Decision חדשה שמגדילה Risk אינה נשענת על requested quantity או על local ledger לבדם כאשר קיים mismatch; היא נשענת על `reconciled_position`.

---

## ‏8.3 Command אינה Fact

‏קריאה:

```text
placeOrder(...)
```

‏אינה עובדה שה־Order התקבלה.

‏קריאה:

```text
cancelOrder(...)
```

‏אינה עובדה שה־Order בוטלה.

‏קריאה:

```text
placeOrder(existingOrderId, modifiedOrder)
```

‏אינה עובדה שה־Modify נכנס לתוקף.

‏לכן כל command יוצרת מצב `REQUESTED` עד evidence מתאים.

---

## ‏8.4 שלושה צירי State שונים — לא State Machine אחת ענקית

### ‏`Order Lifecycle`

```text
LOCAL_CREATED
SUBMIT_REQUESTED
HELD / PRESUBMITTED / SUBMITTED / WORKING
PARTIALLY_FILLED
MODIFY_REQUESTED
CANCEL_REQUESTED
FILLED
CANCELLED
REJECTED
INACTIVE
```

### ‏`Epistemic Uncertainty`

```text
KNOWN
SUBMIT_UNKNOWN
MODIFY_UNKNOWN
CANCEL_UNKNOWN
STATE_INCONSISTENT
```

### ‏`System Operating Mode`

```text
BOOTING
RECOVERING
READY
ENTRY_DISABLED
EXIT_ONLY
DEGRADED
EMERGENCY
FROZEN
```

> ‏`ENGINE RULE` — `UNKNOWN`, ‏`RECOVERING` ו־`FROZEN` אינם peers. ‏`UNKNOWN` מתאר מה איננו יודעים על Order; ‏`RECOVERING` מתאר מה המערכת עושה; ‏`FROZEN` הוא control/safety mode.

‏לא כל Broker status חייב להפוך אחד־לאחד ל־state פנימי. המטרה היא לשמור semantics שאנחנו יכולים להגן עליהן.

---

## ‏8.5 `Working`, ‏`Live`, ‏`Active` ו־`Executable` אינם מילים נרדפות

‏בפרוזה קל להשתמש בהן כאילו הן זהות, אבל במנוע עדיף להיות מדויק:

```text
WORKING
= broker reports the order as currently working/held in a relevant lifecycle state

POTENTIALLY_EXECUTABLE
= based on available evidence, the order may still produce execution

ACTIVE_PROTECTION
= protection relationship is currently eligible/armed according to verified semantics

LIVE
= informal prose only; avoid as a technical state unless explicitly defined
```

‏Order שנמצאת ב־`CANCEL_REQUESTED` יכולה כבר לא להיראות "working" במובן מסוים ועדיין להיות `POTENTIALLY_EXECUTABLE`.

---

## ‏8.6 `Terminal` אינה מילה נרדפת ל־"אני גמרתי לחשוב על Order"

‏גם אחרי status שנראה terminal, המנוע יכול לקבל מידע שדורש reconciliation — למשל Execution שטרם עובד אצלנו או תיקון Execution.

‏לכן אנחנו מפרידים:

```text
broker_order_terminal
execution_reconciliation_complete
position_reconciliation_complete
```

‏ורק השילוב ביניהם מאפשר לסגור lifecycle עסקי בביטחון.

---

## ‏8.7 מזהים: Order אחת צריכה יותר ממספר אחד

‏ב־IBKR רלוונטיים לפחות:

```text
internal_order_id
orderId
permId
clientId
orderRef
execId per execution
```

‏`internal_order_id` הוא שלנו וצריך להישאר יציב גם אם API binding או recovery משנים identifiers חיצוניים.

‏כך איננו הופכים מזהה של Broker ל־primary key העסקי של כל המערכת.

---

## ‏8.8 `orderId` הוא מזהה API — לא מזהה עסקי גלובלי

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מתעדת ש־`orderId` הוא מזהה של ה־API client, וש־Order חדשה עם ID שכבר שימש אינה חוקית; reuse של אותו `orderId` נועד למעשה ל־modify של Order פתוחה.

‏לכן allocation של IDs צריך להיות רכיב מסודר, לא `counter++` שמאותחל שרירותית בכל restart.

---

## ‏8.9 `nextValidId` הוא חלק מ־connection readiness

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏ב־TWS API, ה־handshake מחזיר בין היתר את ה־next valid order identifier. IBKR מזהירה שבקשות שנשלחות לפני שהחיבור הושלם ו־`nextValidID` התקבל עלולות להיזרק.

‏לכן:

```text
socket connected
!=
execution engine READY
```

‏`CONNECTING`, ‏`HANDSHAKING`, ‏`RECOVERING` ו־`READY` הם System Operating Modes, לא Order lifecycle states.

---

## ‏8.10 `permId` הוא עוגן חשוב ל־reconciliation

‏IBKR מתעדת את `permId` כ־Host order identifier; הוא שימושי במיוחד כאשר אותו Order מקבלת API `orderId` שונה אחרי binding/session אחר.

‏לכן mapping פנימי צריך להיות מסוגל לומר:

```text
internal_order_id
<-> permId
<-> clientId/orderId binding(s)
```

‏ולא להניח `orderId` אחד לכל חיי Order בכל session.

---

## ‏8.11 `execId` הוא מזהה Fill — וכל Partial Fill היא אירוע עצמאי

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מתעדת שלכל partial fill יש `execId` נפרד. היא גם מתעדת Execution corrections באמצעות `execId` שונה בחלק שאחרי הנקודה האחרונה.

‏לכן deduplication של Fills צריך להתבסס על Execution identity ולא רק על:

```text
orderId + price + qty
```

‏שני fills אמיתיים יכולים להיות זהים במחיר ובכמות.

---

## ‏8.12 `orderRef` — מקום טוב ל־correlation, לא ל־state היחיד

‏IBKR מאפשרת `orderRef` מותאם משתמש שנשאר מקושר ל־Order.

‏אנחנו יכולים להשתמש בו כדי לקשור Broker Order ל־:

```text
strategy_instance
signal_id
trade_intent_id
internal_order_id
```

‏אבל עדיין נשמור mapping מקומי מפורש; לא נבנה recovery שתלויה במחרוזת אחת בלבד.

---

## ‏8.13 ארבעה streams שצריך לעבד יחד

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR ממליצה במערכת Order robust לעקוב לפחות אחרי:

```text
error
openOrder
orderStatus
execDetails
```

‏כל אחד מספר חלק אחר של הסיפור.

‏`openOrder` נותנת snapshot עשיר של Order ו־OrderState.

‏`orderStatus` מתאר changes/status/filled/remaining.

‏`execDetails` מתאר executions בפועל.

‏`error` יכולה לשאת rejection, warning או operational failure שחייבים להשתלב ב־state.

---

## ‏8.14 `orderStatus` יכולה להגיע כפול — וזה תקין

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏בחומר ההדרכה של IBKR מצוין שב־`orderStatus` יכולים להיות duplicate callbacks ושעל API client להיות מוכן לסנן אותם.

‏לכן event handler חייב להיות idempotent:

```text
same status twice
=> no second business action
```

‏בפרט, callback כפולה של `Filled` אסור שתייצר Exit כפולה.

---

## ‏8.15 אסור לבנות State Machine שתלויה במספר callbacks קבוע

‏מנוע לא יכתוב:

```text
submit
expect PreSubmitted
then Submitted
then Filled
```

‏כפרוטוקול קשיח.

‏המערכת צריכה לעבוד לפי facts שהתקבלו ולפי invariants, גם אם intermediate observation לא הגיע בצורה שציפינו.

‏`execDetails` של Fill הוא אירוע עסקי חשוב יותר מהנחה שהיינו חייבים קודם לראות כל status אפשרי.

---

## ‏8.16 Position Truth: שלושה מושגים שונים

‏Order status יכולה לומר cumulative filled, אבל Position ledger שלנו צריך להיבנות מאירועי Execution מאומתים ולהיבדק מול Broker position state.

‏נשתמש במונחים:

```text
execution_ledger_position
broker_reported_position
reconciled_position
```

‏כל Execution מעדכנת את ה־ledger המקומי. Broker position היא evidence חיצונית. ‏`reconciled_position` היא המסקנה לאחר יישוב ביניהם.

> ‏`ENGINE RULE` — requested quantity אינה Position, ו־local ledger שאינו reconciled לאחר external/manual activity או recovery אינו מספיק כדי לאשר Risk חדש.

---

## ‏8.17 Invariant כמות בסיסי

‏ל־Order רגילה:

```text
filled_qty + remaining_qty <= current_order_quantity
```

‏ובהיעדר corrections/edge cases מיוחדים, expected relation היא:

```text
filled_qty + remaining_qty == total_quantity
```

‏אבל המנוע לא יתקן broker data בכוח כדי להתאים למשוואה; mismatch הוא trigger ל־reconciliation.

---

## ‏8.18 שלושה מנגנונים שונים שהמילה `Modify` מסתירה

‏ה־taxonomy הקנונית היא:

```text
MODIFY_IN_PLACE
CANCEL_THEN_NEW
OVERLAPPED_REPLACEMENT
```

### ‏`MODIFY_IN_PLACE`

‏בקשת modification לאותה Broker Order כאשר ה־API/path מאפשרים זאת.

### ‏`CANCEL_THEN_NEW`

‏ביטול Order הישנה, המתנה ל־evidence בטוח, חישוב remaining intent חדש ורק אז Submit חדשה.

### ‏`OVERLAPPED_REPLACEMENT`

‏Order חדשה יכולה להישלח בזמן שהישנה עדיין potentially executable, **רק** תחת exposure budget מפורש ובדיקות ייעודיות.

> ‏`ENGINE RULE` — שלושת המנגנונים אינם interchangeable implementation details. הם יוצרים exposure, queue ו־race semantics שונות.

---

## ‏8.19 Modify ב־IBKR הוא `placeOrder` עם אותו `orderId`

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מתעדת Modify של API Order באמצעות קריאה נוספת ל־`placeOrder` עם אותו `orderId` של Order הפתוחה ועם השדות המעודכנים.

‏זו semantics חשובה:

```text
same orderId
+
changed allowed fields
=> MODIFY_IN_PLACE request
```

‏ולא Order חדשה מבחינת ה־API intent.

---

## ‏8.20 IBKR ממליצה לצמצם In-Place Modify לשדות פשוטים

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏בתיעוד הנוכחי IBKR אומרת שבדרך כלל לא מומלץ לשנות שדות מעבר ל־price, size ו־`TIF` במעבר `DAY -> IOC`; לשינויים אחרים עדיף לעיתים לבטל וליצור Order חדשה.

‏לכן adapter שלנו יסווג:

```text
MODIFY_IN_PLACE eligible?
CANCEL_THEN_NEW required?
```

‏ולא ינסה להפוך כל Order family לצורה אחרת באמצעות אותו ID.

---

## ‏8.21 Modify יכולה להידחות מפני שה־Order עדיין Processing

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏Error `2102` של IBKR מתאר מצב שבו מנסים לבצע Modify לפני שה־Order הקודמת סיימה processing.

‏מכאן כלל:

```text
MODIFY_REQUESTED
=> wait for appropriate broker progress
=> do not spam another modify immediately
```

‏לולאת repricing מהירה חייבת backpressure.

---

## ‏8.22 Modify אינה פעולה מקומית על Object

‏אם שינינו:

```text
localOrder.lmtPrice = 50.03
```

‏לא קרה דבר בשוק.

‏רק לאחר request + broker processing יש לנו evidence שהמחיר החדש שייך ל־Order החיה.

‏לכן נשמור:

```text
desired_price
last_submitted_price
last_acknowledged_price
```

‏כשלושה מושגים שונים.

---

## ‏8.23 Queue Priority היא consequence תלוית Venue/Route — לא guarantee אוניברסלי

‏ב־Passive Order, שינוי מחיר/כמות או cancel/replacement **יכול** להשפיע על queue priority לפי Venue, route והפעולה הספציפית.

‏לכן metric של reprice אינה רק:

```text
new price better/worse
```

‏אלא גם, כאשר ניתן למדוד:

```text
queue_age_lost_estimate
new_level_join_time
fill_probability_change
```

‏לפעמים tick טוב יותר במחיר אינו מצדיק איבוד queue context שכבר היה משמעותי, אבל אין לקודד כלל אוניברסלי בלי route-specific evidence.

---

## ‏8.24 Binding של Order יכולה בעצמה לפגוע ב־Queue

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מתעדת ש־binding של Order קיימת דרך API כרוך כיום ב־cancel/resubmit של Order העובדת ב־Exchange ועלול להשפיע על מקומה בתור.

‏זה פרט Production חשוב במיוחד: recovery/ownership operation שנראית "ניהולית" יכולה לשנות execution economics.

‏לכן לא עושים bind מיותר רק כדי שיהיה נוח לקוד.

---

## ‏8.25 `reqOpenOrders` ו־`reqAllOpenOrders` אינם אותו דבר

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏לפי IBKR, `reqOpenOrders` יכולה bind Orders פתוחות שלא קיבלו API order ID בהקשר המתאים; `reqAutoOpenOrders` יכולה bind Orders עתידיות; ואילו `reqAllOpenOrders` אינה מבצעת binding.

‏לכן recovery code חייב לדעת אם הוא רק **צופה** ב־Orders או גם משנה ownership/binding semantics.

---

## ‏8.26 Cancel הוא Request — לא Delete

‏כאשר המנוע מחליט שה־Signal מת:

```text
order_lifecycle = CANCEL_REQUESTED
```

‏אם adapter יודע להבחין ב־broker-side pending state אמיתי, ניתן לשמור גם `CANCEL_PENDING` כ־observation; אין להמציא אותו אם הממשק אינו מספק evidence מתאים.

‏ה־Order נשארת `POTENTIALLY_EXECUTABLE` עד שיש evidence terminal מתאים או reconciliation שמוכיח שאינה יכולה עוד לבצע.

> ‏`ENGINE INVARIANT` — **Any order without terminal broker evidence remains potentially executable.**

---

## ‏8.27 Late Fill אחרי Cancel Request אינו Contradiction

‏תרחיש:

```text
09:30:00.100 cancel sent
09:30:00.101 venue matches order
09:30:00.105 cancel processed
09:30:00.110 fill reaches client
```

‏מבחינת המנוע, ה־Fill היא אמת.

‏לא כותבים:

```text
if cancel_requested:
    ignore execution
```

‏אלא להפך: Fill בתקופת cancel-in-flight היא אירוע שחייב לעדכן `execution_ledger_position` מיד ולהוביל ל־reconciliation.

---

## ‏8.28 שגיאת Cancel אינה הוכחה שה־Order עדיין חיה — וגם לא שהיא מתה

‏IBKR מתעדת errors כגון:

```text
135 = cannot find order
136 = order cannot be cancelled
```

‏תגובה נכונה אינה לנחש את ה־state מתוך error code בלבד.

‏נבקש/נבנה reconciliation של open orders + executions + position ונחליט לפי Broker evidence.

---

## ‏8.29 `CANCEL_THEN_NEW` בטוח הוא Two-Phase Protocol

‏כאשר אנחנו רוצים לעבור מ־Order A ל־Order B:

```text
Phase 1:
request cancel A
track A as potentially executable

Phase 2:
reconcile A fills/terminal state
compute true remaining intent
submit B only for safe remaining quantity
```

‏זה איטי יותר מ־"cancel ואז מיד new", אבל מונע overfill כברירת מחדל.

---

## ‏8.30 למה `Cancel then immediately New` מסוכן

‏נניח:

```text
want 100 shares
A remaining locally = 100
cancel A
immediately submit B for 100
```

‏אם A מקבלת late fill של 60:

```text
A fill = 60
B can fill = 100
=> total = 160
```

‏לכן replacement quantity נגזרת מ־**actual cumulative fills**, לא מ־מה שחשבנו לפני cancel.

---

## ‏8.31 `OVERLAPPED_REPLACEMENT` היא Risk Mode מפורש

‏לפעמים waiting for terminal cancel יכול להיות יקר לסיגנל קצר.

‏אם נרצה deliberate overlap כדי לחסוך latency, זה צריך להיות mode מוגדר עם bound:

```text
max_possible_fill_across_old_and_new <= configured exposure budget
```

‏לא bug שנוצר בגלל impatience.

> ‏`RESEARCH HYPOTHESIS` — overlap עשוי לחסוך latency במצבים מסוימים, אבל הוא אינו Production default עד simulation, acceptance tests ו־exposure accounting מלאים.

---

## ‏8.32 Reprice: להפריד Broker-managed מ־Client-initiated

‏`Reprice` אינה פעולה אחת.

```text
BROKER_MANAGED_REPRICE
= Relative/Pegged/Algo משנה effective behavior לפי semantics שלה

CLIENT_INITIATED_REPRICE
= המנוע שולח MODIFY_IN_PLACE או replacement חדש
```

‏בשני המקרים המחיר יכול להשתנות; ownership, races, queue consequences ו־telemetry שונים.

---

## ‏8.33 Revision Number מונע Modify ישן מלנצח חדש

‏לכל Order פנימית נשמור:

```text
revision = 0,1,2,...
```

‏כל intent לשינוי מקבל revision חדשה.

‏אם callback או timeout שייך ל־revision ישנה, הוא יכול לעדכן Broker observation אבל **לא** להחזיר את desired state לאחור.

‏כך נמנעת תופעה של stale asynchronous completion.

---

## ‏8.34 `Desired State` מול `Observed State`

‏מודל חשוב:

```text
desired:
  price = 50.03
  qty = 60
  should_be_live = true

observed:
  broker price = 50.02
  remaining = 73
  status = Submitted
```

‏הפער הוא לא bug אוטומטי; הוא אומר שיש פעולה in-flight או mismatch שדורש reconciliation.

‏State Machine צריכה לייצג את הפער במקום למחוק אותו.

---

## ‏8.35 Command Ledger — כל side effect מקבל זהות

‏נשמור לכל command:

```text
command_id
internal_order_id
revision
command_type
created_ts
sent_ts
result_observed_ts
status
reason
```

‏כך אפשר לענות אחרי crash:

> ‏האם שלחנו את ה־Cancel, או רק החלטנו לשלוח אותו?

‏במערכת כסף אמיתי זו שאלה מהותית.

---

## ‏8.36 Idempotency מתחילה לפני Broker API

‏נניח שה־Scanner שולח אותו Signal פעמיים בגלל retry.

‏בלי `intent_id` יציב:

```text
signal retry
=> second BUY
```

‏לכן execution layer צריכה deduplication גם ברמת Trade Intent:

```text
(strategy_instance, signal_id, intent_version)
```

‏Broker order IDs לבדם אינם פותרים duplicate business intent.

---

## ‏8.37 `At-Least-Once` Thinking עדיפה על הנחת Exactly-Once

‏במערכת מבוזרת קל לקבל:

```text
request sent
connection drops
client did not see acknowledgement
```

‏אין לנו זכות להסיק שה־request לא הגיע.

‏לכן recovery philosophy היא:

```text
commands may be ambiguous
observations may repeat
facts must be reconciled
```

‏במקום לבנות על exactly-once illusion.

---

## ‏8.38 Ambiguous Submit היא `Epistemic Uncertainty`

‏תרחיש:

```text
placeOrder sent
socket breaks
no callback seen
```

‏אסור לבצע מיד retry כ־Order חדשה.

‏ייתכן שהראשונה כבר חיה אצל IBKR.

‏לכן נשמור למשל:

```text
order_uncertainty = SUBMIT_UNKNOWN
```

‏ונבצע reconciliation לפני יצירת exposure נוסף.

---

## ‏8.39 Ambiguous Cancel גם היא `Epistemic Uncertainty`

‏אם:

```text
cancel sent
connection breaks
```

‏אין לנו מידע אם Order עדיין חיה.

```text
order_uncertainty = CANCEL_UNKNOWN
```

‏היא עדיין `POTENTIALLY_EXECUTABLE` עד evidence אחר, ודורשת reconciliation לפני fallback action שעלולה להתנגש ב־Order הישנה.

---

## ‏8.40 Reconnect אינו `onConnected -> resumeTrading()`

‏אחרי reconnect המנוע המקומי הוא potentially stale.

‏הזרימה הנכונה:

```text
CONNECTED
↓
HANDSHAKE_READY
↓
SystemMode = RECOVERING
↓
FREEZE_NEW_RISK
↓
FETCH / RECEIVE BROKER STATE
↓
RECONCILE
↓
VALIDATE INVARIANTS
↓
SystemMode = READY
```

‏רק אז חוזרים לקבל Entries חדשות.

---

## ‏8.41 Broker Truth אחרי Reconnect

‏נאסוף לפחות:

```text
open orders
recent executions
broker_reported_position
account/order ownership metadata
```

‏ואז נשווה ל־local persisted ledger.

‏הזיכרון המקומי הוא hypothesis; broker executions ו־positions הם evidence שחייבים ליישב איתו.

---

## ‏8.42 `reqExecutions` / Execution History היא חלק מה־Recovery

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מאפשרת לבקש Executions לפי `ExecutionFilter`, כולל זמן, account, symbol, side ועוד; בתיעוד הנוכחי קיימים גם שדות לבקשת ימים/תאריכים אחרונים בטווח הנתמך.

‏זה מאפשר ל־recovery לחפש fills שקרו בזמן שה־client היה מנותק ולא להסתמך רק על live callbacks.

---

## ‏8.43 Unknown Broker Order היא Incident שדורשת Classification לפני Action

‏אם Broker מחזירה Order חיה שאין לנו ב־local ledger:

```text
UNKNOWN_BROKER_ORDER
```

‏לא מבטלים אותה אוטומטית לפני שמבינים:

```text
manual order?
other client?
old process generation?
bracket child?
system-generated order?
```

> ‏`ENGINE RULE` — classify ownership/protection role first; only then decide whether cancellation is safe. ‏Cancel אוטומטי עיוור יכול להסיר protection חשובה.

---

## ‏8.44 Missing Broker Order גם היא Incident

‏אם local state אומר:

```text
WORKING
```

‏אבל reconciliation לא מוצאת אותה ב־open orders, אין להסיק מיד `CANCELLED`.

‏ייתכן שהיא:

```text
filled
cancelled
rejected
expired
not visible in the queried scope
```

‏צריך לבדוק executions/position/terminal records המתאימים.

---

## ‏8.45 Manual Orders ו־API Orders חייבות Ownership Classification

‏מערכת יכולה לפגוש Order שנוצרה ב־TWS ידנית או מ־API client אחר.

‏נשמור למשל:

```text
ownership = OUR_ENGINE | MANUAL | OTHER_CLIENT | UNKNOWN
```

‏ורק `OUR_ENGINE` מקבלת אוטומציה מלאה כברירת מחדל.

‏Manual intervention שמשנה Order או Position משנה **ownership assumptions**; היא אינה רק הערת audit log.

---

## ‏8.46 `clientId=0` נותן כוח — ולכן דורש זהירות

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מתעדת ש־binding של manual/TWS Orders לצורך modify/cancel נעשה דרך client ID 0, וש־`reqAutoOpenOrders` בהקשר הזה יכולה bind Orders עתידיות.

‏זה שימושי ל־recovery/control plane, אבל גם מרחיב את מה שהקוד מסוגל להשפיע עליו.

‏לכן ownership guard הוא חובה.

---

## ‏8.47 Multiple Clients: `permId` חשוב יותר מ־orderId בלבד

‏Order יכולה לקבל bindings שונים בהקשרי TWS users/clients, בעוד `permId` מסייע לזהות אותה ברמת Host.

‏לכן cross-client reconciliation לא ייעשה על:

```text
orderId alone
```

‏אלא על composite identity ומידע Broker נוסף.

---

## ‏8.48 State צריך להיות Persisted לפני Side Effects קריטיים

‏לפני submit/modify/cancel נשמור את ה־intent/command כך שאחרי crash נוכל לדעת שהיה side effect מתוכנן או נשלח.

‏רעיון:

```text
persist command intent
flush durable state
send broker command
persist observed result asynchronously
```

‏המימוש המדויק תלוי storage, אבל העיקרון הוא שלא נשמור רק RAM state.

---

## ‏8.49 Event Log עדיף על Snapshot יחיד בלבד

‏Snapshot אומר:

```text
status = PARTIALLY_FILLED
filled = 37
```

‏Event log יכול להסביר:

```text
submit
ack
fill 20
modify requested
fill 17 during modify
modify ack
cancel requested
cancel confirmed
```

‏ל־debug/replay/incident analysis זה הבדל עצום.

‏לכן נשמור גם Current State וגם append-only execution events.

---

## ‏8.50 Duplicate Event לא צריך ליצור Duplicate Side Effect

‏כל event processor צריך לענות:

```text
Have I already applied this fact?
```

‏לדוגמה:

```text
execId already applied
=> do not add quantity again
```

‏ו־status duplicate יכולה להישמר ב־raw telemetry בלי להפעיל שוב transition עסקי.

---

## ‏8.51 Out-of-Order Thinking

‏גם בלי להניח שה־Broker מבטיחה סדר שרירותי מסוים בין כל סוגי callbacks, המנוע צריך להיות מסוגל לעבד מידע אסינכרוני שלא הגיע בדיוק ברצף שה־UI היה מציג.

‏לדוגמה, אם Fill evidence מגיע לפני שעיבדנו snapshot חדש של `remaining`, אין סיבה להמתין כדי לעדכן `execution_ledger_position`.

‏ה־reducers שלנו צריכים לעבוד לפי identities, cumulative facts ו־invariants.

---

## ‏8.52 State Transition חייבת להיות Monotonic מבחינת Facts

‏Desired state יכולה להשתנות קדימה ואחורה, אך Fact שכבר התרחש לא נעלם:

```text
execution happened
=> cannot be "unfilled" later
```

‏אם מתקבלת Correction, היא אירוע חדש שמתקן Fact קודמת — לא מחיקה שקטה של היסטוריה.

‏זה עיקרון חשוב ל־auditability.

---

## ‏8.53 `Filled` Order יכולה עדיין לדרוש פעולות מערכת

‏אחרי Entry מלאה ייתכן שצריך:

```text
activate/verify protection
cancel competing entries
update reconciled position
start exit policy
record execution costs
```

‏לכן:

```text
ORDER_FILLED
!=
TRADE_LIFECYCLE_COMPLETE
```

‏זו הבחנה חשובה במיוחד ב־Bracket/Hybrid Exit.

---

## ‏8.54 Position היא Aggregation מעל Executions

‏Order State אינה Position State.

‏יכולות להיות מספר Orders שמשפיעות על אותה Position:

```text
entry A
entry B
manual fill
profit exit
protective stop
```

‏לכן Position service צריכה aggregate Executions ל־`execution_ledger_position`, להשוות ל־`broker_reported_position`, ולפרסם `reconciled_position` — לא לקרוא `filled` מ־Order אחת ולהכריז על exposure.

---

## ‏8.55 Quantity Budget מונע Overfill בין Orders מתחרות

‏לכל Trade Intent נגדיר:

```text
target_qty
confirmed_filled_qty
potential_fill_qty_from_live_orders
remaining_safe_qty
```

‏Invariant:

```text
confirmed_filled_qty
+ potentially_executable_entry_qty
<= allowed_max_qty
```

‏אלא אם `OVERLAPPED_REPLACEMENT` מפורשת מרשה overlap מוגבל בתוך exposure budget ידוע.

---

## ‏8.56 `Potentially Executable` היא קטגוריה קריטית

‏נכניס אליה לפחות:

```text
Submitted / Working
PreSubmitted when eligible to progress
PartiallyFilled remainder
Modify in flight when old/new effective revision is uncertain
CancelRequested / broker-side CancelPending when applicable
SubmitUnknown after disconnect
```

‏כך risk calculation אינה מסתכלת רק על Orders שנראות "Working" בצורה נוחה.

---

## ‏8.57 Bracket יושבת מעל אותה State Machine — לא מערכת נפרדת

‏ה־parent, TP ו־Stop משתמשות באותם primitives:

```text
submit
modify
cancel
fill
reconcile
ownership
```

‏Bracket מוסיפה graph relationships ו־invariants, אבל אסור לבנות לה execution stack שני ונפרד.

‏אחרת יהיו לנו שני מנגנוני race-handling שונים עם bugs שונים.

---

## ‏8.58 Broker Algos גם הן Orders מבחינת lifecycle

‏`Adaptive`, ‏`MidPrice` ו־Pegged broker-managed behaviors אינן פטורות מה־state machine.

‏כאשר Signal מת:

```text
cancel requested
```

‏וה־Order נשארת potentially executable עד confirmation/reconciliation.

> ‏`ENGINE RULE` — Broker may optimize `HOW`; the client retains authority over `WHETHER` the intent is still valid.

---

## ‏8.59 Market Data Health ו־Order State חייבים להתחבר

‏אם Data שלנו stale אבל Order broker-resident ממשיכה לעבוד, engine לא יכולה להעריך Signal validity.

‏Policy אפשרית:

```text
market_data_health = DEGRADED
=> block new entries
=> cancel vulnerable entry intents according to policy
=> preserve/verify safety exits according to risk policy
```

‏לא מבטלים protective orders אוטומטית רק מפני ש־data feed מקומי נפל.

---

## ‏8.60 Connectivity Error אינה בהכרח Order Error

‏Network/API disconnect אומר שהיכולת שלנו **לראות ולשלוט** ירדה.

‏הוא אינו אומר שכל broker-resident Orders נעלמו.

‏לכן `DISCONNECTED` מגדיל uncertainty; הוא לא מאפס Order lifecycle ולא מאפס Position.

---

## ‏8.61 `maintainAndResubmitOrdersOnReconnect` היא Capability שדורשת Policy

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏ב־API settings הנוכחיים של IBKR קיים `maintainAndResubmitOrdersOnReconnect`, שמתואר כיכולת להגיש Orders שניסו להישלח בזמן ניתוק לאחר reconnect.

‏זו התנהגות שיכולה להיות נוחה, אבל בסיגנל קצר היא מסוכנת אם Order שהייתה נכונה בזמן הניתוק כבר stale בזמן החיבור מחדש.

‏לכן לא מפעילים semantics כאלה בלי להבין כיצד הן משתלבות עם `signal_ttl`, ‏`application_order_ttl` ו־generation guards שלנו.

---

## ‏8.62 Recovery Generation מונעת מתהליך ישן להמשיך לפעול

‏בכל startup/reconnect cycle נגדיר:

```text
recovery_generation
```

‏Orders/commands מקומיות יקושרו לדור שבו נוצרו.

‏אם callback ישנה מופיעה אחרי recovery, היא עדיין יכולה להכיל Fact אמיתי, אבל אסור לה להפעיל logic של generation קודמת בלי validation.

---

## ‏8.63 `READY` הוא State שצריך להרוויח

‏מנוע לא עובר ל־`READY` רק מפני שיש socket.

‏לפחות:

```text
connection handshake complete
order-id allocator valid
open orders reconciled
recent executions reconciled
reconciled_position available
unknown orders classified
critical invariants pass
market data healthy enough
```

‏רק אז Entry חדשה מותרת.

> ‏`ENGINE INVARIANT` — reconnect restores connectivity; reconciliation earns `READY`.

---

## ‏8.64 Retry Policy צריכה להבדיל בין Failure Classes

‏לא כל failure מקבל retry זהה.

```text
transport failure
validation rejection
unsupported order type
price increment error
order still processing
order already terminal
venue unavailable
```

‏תגובה של:

```text
retry immediately forever
```

‏היא anti-pattern.

‏חלק דורשים backoff, חלק recompute, חלק capability fallback, וחלק stop מוחלט.

---

## ‏8.65 Error `134` מלמד את עקרון ה־Reconciliation

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מתארת `134 — Modify order failed` ומציינת שה־Order אולי כבר executed או cancelled ושיש לבקש open orders כדי לאמת current status.

‏זו בדיוק הפילוסופיה שלנו:

```text
unexpected broker response
=> observe truth
=> reconcile
=> decide
```

‏ולא:

```text
unexpected response
=> blindly retry command
```

---

## ‏8.66 Order Efficiency ו־Message Churn הם Constraint תפעולי

‏IBKR מלמדת גם על Order Efficiency Ratio בהקשר של submissions/modifications/cancellations לעומת executions.

‏עבור client-side chase מהיר, זו סיבה נוספת לא לייצר:

```text
modify every quote tick
```

‏בלי threshold משמעותי.

‏מעבר לסיכון queue/races, message churn עצמו צריך telemetry ו־limits.

---

## ‏8.67 Client Reprice Policy נכונה משתמשת ב־Hysteresis

‏במקום:

```text
if bid changed by 1 tick:
    modify immediately
```

‏נרצה תנאים כגון:

```text
minimum_price_improvement
minimum_time_since_last_client_reprice
signal_still_valid
expected_gain_from_reprice > estimated queue/race cost
no conflicting revision already in flight
```

‏כך נמנעת oscillation סביב quote noise.

‏הסעיף הזה מתייחס ל־`CLIENT_INITIATED_REPRICE`; Broker-managed Pegged/Algo repricing נמדדת ומנוהלת לפי semantics שלה.

---

## ‏8.68 State Model מוצע ל־Order יחידה — צירים נפרדים

### ‏Lifecycle

```text
CREATED
  ↓
SUBMIT_REQUESTED
  ├── REJECTED
  └── WORKING
       ├── PARTIAL
       ├── MODIFY_REQUESTED
       │    ├── MODIFY_REJECTED
       │    └── WORKING(new revision)
       ├── CANCEL_REQUESTED
       │    ├── PARTIAL / FILLED
       │    └── CANCELLED
       └── FILLED
```

### ‏Uncertainty overlay

```text
KNOWN
SUBMIT_UNKNOWN
MODIFY_UNKNOWN
CANCEL_UNKNOWN
STATE_INCONSISTENT
```

### ‏System mode

```text
BOOTING
RECOVERING
READY
ENTRY_DISABLED
EXIT_ONLY
DEGRADED
EMERGENCY
FROZEN
```

‏כך `CANCEL_UNKNOWN` אינו "שלב אחרי Cancel" במובן העסקי בלבד; הוא אומר שהמערכת אינה יודעת אם ה־Cancel אפקטיבי.

---

## ‏8.69 Events שאנחנו רוצים לנרמל בתוך המנוע

‏Broker adapter יתרגם API-specific callbacks ל־events פנימיים כגון:

```text
ORDER_ACCEPTED
ORDER_WORKING
ORDER_REJECTED
ORDER_MODIFIED
ORDER_CANCEL_REQUESTED
ORDER_CANCELLED
EXECUTION_RECORDED
EXECUTION_CORRECTED
ORDER_HELD
CONNECTION_LOST
CONNECTION_RESTORED
RECONCILIATION_STARTED
RECONCILIATION_COMPLETED
```

‏כך Strategy אינה מכירה `EWrapper` או codes של IBKR.

---

## ‏8.70 Commands שאנחנו רוצים לנרמל

```text
SUBMIT_ORDER
MODIFY_ORDER
CANCEL_ORDER
CANCEL_GROUP
REQUEST_OPEN_ORDERS
REQUEST_EXECUTIONS
REQUEST_POSITIONS
```

‏Command handler אחראי ל־validation, capability, sequencing ו־persistence לפני side effect.

---

## ‏8.71 Invariants שחייבים לעבור אחרי כל Event

```text
filled quantity never applied twice
reconciled position derives from execution + broker evidence, not requested orders
no new entry while relevant order state is epistemically UNKNOWN
no new risk while SystemMode is RECOVERING or FROZEN
no replacement assumes cancel is final before evidence
potential entry exposure <= configured max
potential exit exposure cannot silently reverse position
all live/potentially-executable orders have ownership classification
all bracket children map to valid trade/position state
all command revisions are monotonic
```

‏Invariant failure מעבירה את המנוע ל־control path מתאים כגון `FROZEN` או `RECOVERING`; היא אינה רק `log warning and continue`.

---

## ‏8.72 Failure Matrix כללית

| מצב | מה איננו יודעים | הסיכון | תגובה עקרונית |
|---|---|---|---|
| Submit נשלחה, אין Ack | האם Order חיה | duplicate entry | `SUBMIT_UNKNOWN` + reconcile |
| Modify נשלח, connection נפל | איזה revision חיה | stale price/qty | `MODIFY_UNKNOWN` + freeze conflicting modifications + reconcile |
| Cancel נשלח, אין Ack | האם יכולה להתבצע | late fill/overlap | `CANCEL_UNKNOWN`; treat as executable + reconcile |
| Duplicate `orderStatus` | האם זה אירוע חדש | duplicate side effect | dedupe/reducer idempotent |
| Duplicate `execDetails` | האם Fill כבר הוחלה | double position | dedupe by execution identity |
| Partial Fill בזמן Modify | quantity changed mid-flight | over-order | recompute from executions |
| Partial Fill בזמן Cancel | remainder changed | wrong replacement qty | wait/reconcile |
| Unknown broker order | ownership unknown | cancel protection/manual order | classify before action |
| Local working order missing | terminal reason unknown | hidden fill/position mismatch | executions + positions check |
| Restart with live orders | local memory stale | duplicate orders | `RECOVERING` gate |
| Manual trade during runtime | position changed externally | bracket mismatch | ownership update + position reconciliation |
| Market data stale | signal validity unknown | stale live entry | block/cancel entries by policy; preserve/verify protection |

---

## ‏8.73 Telemetry שחייבים להוסיף

```text
internal_order_id
trade_intent_id
signal_id
order_ref
broker_order_id
perm_id
client_id
revision
command_id
command_type
command_created_ts
command_sent_ts
command_result_ts
order_lifecycle_state
order_uncertainty_state
system_operating_mode
observed_broker_status
observed_price
observed_qty
filled_qty
remaining_qty
execution_ledger_position
broker_reported_position
reconciled_position
last_exec_id
cancel_requested_ts
cancel_terminal_ts
modify_requested_ts
modify_terminal_ts
recovery_generation
ownership_class
state_uncertainty_reason
```

‏ולכל raw event נשמור payload מתומצת/מקור ו־receive timestamp לצורכי replay.

---

## ‏8.74 Metrics תפעוליים

```text
submit_to_ack_ms
modify_to_ack_ms
cancel_to_terminal_ms
late_fill_after_cancel_rate
fill_during_modify_rate
duplicate_status_rate
duplicate_execution_rate
unknown_order_incidents
reconciliation_duration_ms
reconciliation_mismatch_rate
reconnect_to_ready_ms
orders_per_signal
modifies_per_order
cancels_per_order
message_to_execution_ratio
```

‏אלה Metrics של correctness ו־operations, לא רק P&L.

---

## ‏8.75 Acceptance Tests לפני Live

```text
1. submit -> normal ack -> cancel
2. submit -> instant fill before normal ack path
3. duplicate orderStatus
4. duplicate execDetails
5. two identical-price partial fills with distinct execIds
6. partial fill then MODIFY_IN_PLACE remaining price
7. partial fill during modify request
8. modify rejected because order still processing
9. modify after order already filled
10. cancel before any fill
11. partial fill during cancel
12. full fill during cancel
13. cancel error then reconciliation
14. CANCEL_THEN_NEW with safe remaining quantity
15. deliberate OVERLAPPED_REPLACEMENT under explicit exposure budget
16. connection drop after submit send before ack
17. connection drop after cancel send before ack
18. restart with one broker-resident order
19. restart with partial position and live exit
20. unknown manual order discovered
21. order from another client discovered
22. binding an external/manual order and observing queue implications
23. stale market data while broker order remains live
24. nextValidId readiness gate
25. old-generation callback after reconnect
26. execution correction handling
27. bracket child + local exit race through common state machine
28. broker-managed reprice while client signal expires
```

‏בלי הבדיקות האלה, Advanced Order אינה Production capability — היא רק API call שעובדת ב־Happy Path.

---

## ‏8.76 Recommendation ארכיטקטונית למנוע שלנו

‏Execution Core צריכה להישען על חמישה רכיבים:

```text
1. Intent Store
2. Order State Reducer
3. Command Dispatcher
4. Execution / Position Ledger
5. Reconciliation Service
```

‏ומעליהם:

```text
Execution Policy
Routing Policy
Broker Algo / Materialization Adapter
Risk / Invariant Guard
```

‏כך `Marketable Limit`, ‏`IOC`, ‏`Pegged`, ‏`Adaptive` ו־`Bracket` משתמשות ב־lifecycle משותף — לא באיים נפרדים של קוד.

---

## ‏8.77 למה `Reducer` הוא מודל טוב

‏במקום שכל callback תעשה side effects ישירות:

```text
callback -> place/cancel something immediately
```

‏נעדיף:

```text
broker event
-> normalize
-> persist
-> reduce current state
-> validate invariants
-> derive next commands
```

‏זה הופך duplicate/replay/reconnect לבעיה הרבה יותר נשלטת.

---

## ‏8.78 `Reconciliation` אינה רק מנגנון חירום

‏גם במערכת בריאה כדאי לבצע reconciliation תקופתי/אירועי:

```text
after reconnect
after ambiguous error
after unknown order
after position mismatch
after bracket anomaly
before resuming from degraded state
```

‏המטרה היא למנוע drift בין local model ל־Broker reality.

---

## ‏8.79 למה זה קריטי במיוחד למסחר של שניות

‏ככל שה־TTL קצר יותר, temptation לעשות:

```text
cancel faster
replace faster
retry faster
```

‏גדלה.

‏אבל אותה מהירות מגדילה:

```text
in-flight overlap
message churn
queue resets
state races
ambiguous outcomes
```

‏לכן מנוע מהיר צריך State Machine **חזקה יותר**, לא פחות.

---

## ‏8.80 כלל המפתח שלנו: קודם Correctness, אחר כך Latency Optimization

‏אין ערך לחסוך 20ms אם פעם באלף ניסיונות אנחנו קונים פעמיים או הופכים Position בטעות.

‏סדר העבודה יהיה:

```text
correct
observable
recoverable
measurable
then faster
```

‏רק לאחר שה־state machine מוכחת, נחקור deliberate overlap או aggressive asynchronous techniques.

---

## ‏8.81 Practitioner Secrets — הדברים שקל מאוד לפספס

### ‏1. `cancelOrder()` אינה מחיקה

‏עד terminal broker evidence, Order נשארת potentially executable.

### ‏2. `placeOrder()` היא גם Submit וגם Modify

‏אותו API call משנה משמעות לפי `orderId` וה־state הקיים.

### ‏3. `Modify` אינו מנגנון אחד

‏`MODIFY_IN_PLACE`, ‏`CANCEL_THEN_NEW` ו־`OVERLAPPED_REPLACEMENT` יוצרים failure/exposure semantics שונות.

### ‏4. Binding היא פעולה Execution-sensitive

‏ב־IBKR היא יכולה לבצע cancel/resubmit ולפגוע בתור.

### ‏5. Duplicate callbacks הן חלק מהחיים

‏Idempotency אינה optimization אלא requirement.

### ‏6. Fill identity חשובה יותר מ־status count

‏`execId` מונעת מאיתנו להחיל אותה Execution פעמיים.

### ‏7. Lost Ack אינו Failed Order

‏זה uncertainty שדורשת reconciliation.

### ‏8. Restart אינו Reset

‏Broker-resident Orders ו־Positions יכולות לשרוד את ה־process שלנו.

### ‏9. Queue Priority היא State כלכלי, אבל route-specific

‏Modify/Bind/Cancel-Replace יכולים לשנות אותה; אין להניח כלל venue-universal בלי evidence.

### ‏10. `orderId` אינו Global Business ID

‏Internal ID + `permId` + binding metadata נותנים מודל אמין יותר.

### ‏11. Error Message אינה Truth מלאה

‏ב־ambiguous modify/cancel failure, בודקים Broker state במקום לנחש.

### ‏12. Safety Exit ו־Entry stale order אינן מטופלות אותו דבר בזמן Data Failure

‏לעיתים צריך לבטל Entry, אבל דווקא לשמר/לאמת protective Stop.

### ‏13. Fast Engine חייב Backpressure

‏אם Modify עדיין processing, עוד Modify אינה בהכרח "מהירה יותר" — היא יכולה להידחות או לייצר churn.

### ‏14. State Machine אחת לכל Order families

‏אם Bracket, Pegged ו־Adaptive מקבלות lifecycle engines שונים, bugs של reconciliation יתרבו.

### ‏15. `READY` היא מסקנה, לא socket state

‏רק אחרי reconciliation ו־invariants המנוע רשאי לקחת Risk חדש.

### ‏16. ה־Broker הוא מקור Evidence, לא תחליף ל־Ledger שלנו

‏אנחנו צריכים גם durable local history כדי להבין intents, revisions והחלטות שלא קיימות אצל Broker.

### ‏17. `UNKNOWN` הוא ידע חסר, לא סוג Order

‏התגובה הנכונה היא לצמצם פעולות שמניחות עובדות ולרכוש evidence מחדש.

### ‏18. Broker-managed repricing ו־client repricing אינם אותו lifecycle

‏שניהם יכולים להזיז מחיר, אבל רק אחד דורש מאיתנו side effect חדש בכל reprice.

---

# ‏מקורות רשמיים לחלק 8

- ‏IBKR TWS API — Modifying Orders: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/modifying-orders>
- ‏IBKR TWS API — Placing Orders / Introduction: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/place-order/introduction>
- ‏IBKR TWS API — Order Placement Considerations: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/place-order/order-placement-considerations>
- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR TWS API — `Execution` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/execution>
- ‏IBKR TWS API — Verify API Connection: <https://www.interactivebrokers.com/docs/tws-api/doc/connectivity/verify-api-connection>
- ‏IBKR TWS API — Error Codes: <https://www.interactivebrokers.com/docs/tws-api/doc/error-handling/error-codes>
- ‏IBKR TWS API — Open Orders sync reference: <https://www.interactivebrokers.com/docs/tws-api/sync-doc/open-orders>
- ‏IBKR TWS API — Executions sync reference: <https://www.interactivebrokers.com/docs/tws-api/sync-doc/executions>
- ‏IBKR Campus — Placing Orders using TWS Python API: <https://www.interactivebrokers.com/campus/trading-lessons/python-placing-orders/>

---

# ‏Checkpoint — סוף חלק 8

‏בחלק הזה חיברנו את כל משפחות הפקודות שלמדנו למנוע Execution אחד, אבל הפרדנו בין הצירים הנכונים: Intent, Command, Broker Observation, Execution/Position Truth; ‏Order Lifecycle מול Epistemic Uncertainty מול System Operating Mode; ו־`MODIFY_IN_PLACE` מול `CANCEL_THEN_NEW` מול `OVERLAPPED_REPLACEMENT`.

‏המסקנה למנוע שלנו היא שאופטימיזציית latency מתחילה **רק לאחר** correctness: Order ללא terminal broker evidence נשארת חלק מחישוב ה־potential exposure; ‏Position חדשה נקבעת מתוך `reconciled_position`; ‏`UNKNOWN` חוסמת הנחות מסוכנות; וכל restart/reconnect עובר `RECOVERING` עד שהמערכת מרוויחה מחדש `READY`.

‏החלק הבא יהיה **חלק 9 — `IBKR` Capability Matrix**: נאחד את כל מה שנבדק עד עכשיו למטריצה שיטתית לפי Broker primitive, Time/Fill Policy, attributes, composite structures, Routing ו־Broker Algos — ונפריד availability מתועדת מ־Production enablement.

# ‏חלק 8A — Modify, Replace & Repricing Decision Guide: ‏`MODIFY_IN_PLACE`, ‏`CANCEL_THEN_NEW`, ‏`OVERLAPPED_REPLACEMENT` ו־Broker-Managed Repricing

> ‏הפרק הזה הוא שכבת Decision מעל Part 8. הוא אינו מוסיף Broker Order Types חדשים; הוא מפריד בין ארבע דרכים שונות לשנות execution intent לאחר שכבר קיימת Order: שינוי אותה Order, ביטול ואז יצירה מחדש, overlap מכוון בין ישנה לחדשה, או repricing שמנוהל מחוץ ל־client לפי Broker/Venue rule.

---

## ‏8A.1 ארבעה מנגנונים שנראים כמו “שינוי מחיר” — אבל מייצרים Risk שונה

```text
MODIFY_IN_PLACE
CANCEL_THEN_NEW
OVERLAPPED_REPLACEMENT
BROKER_MANAGED_REPRICE
```

‏הם נבדלים לפחות בשאלות הבאות:

```text
How many potentially executable orders may exist at once?
Who owns the price-change loop?
What evidence proves the old intent is gone?
What happens to queue / priority?
What broker identity survives the change?
What must recovery reconstruct after disconnect?
```

> ‏`ENGINE RULE` — “Reprice” היא מטרה עסקית; `MODIFY_IN_PLACE`, ‏`CANCEL_THEN_NEW`, ‏`OVERLAPPED_REPLACEMENT` ו־broker-managed repricing הם lifecycle mechanisms שונים.

---

## ‏8A.2 Comparison Matrix

| Mechanism | Side effect חדש מה־client בכל reprice? | כמה Orders עשויות להיות executable במקביל? | Queue certainty | Ownership | Risk מרכזי |
|---|---:|---:|---|---|---|
| `MODIFY_IN_PLACE` | כן | בדרך כלל logical order אחת, אך modify state יכולה להיות unknown | route/venue dependent | Client initiates modify | old/new parameter ambiguity בזמן race |
| `CANCEL_THEN_NEW` | כן | אמורה להיות אחת לאחר terminal cancel; לפני כן הישנה עדיין potentially executable | חדשה מתחילה lifecycle חדש | Client | waiting cost / lost queue / late fill before cancel terminal |
| `OVERLAPPED_REPLACEMENT` | כן | **כן, במכוון** בזמן overlap | שתי lifecycle/queues | Client | duplicate exposure / double fill |
| `BROKER_MANAGED_REPRICE` | לא בכל quote move | Order אחת לוגית יכולה לשנות effective price חיצונית | broker/venue specific | Broker/Venue path | repricing ממשיך אחרי local intent decay |

‏אין מנגנון “טוב ביותר”. השאלה היא איזה failure אנחנו מוכנים להחזיק.

---

## ‏8A.3 `MODIFY_IN_PLACE` — Decision Card

### ‏What

‏שינוי פרמטרים של Order קיימת תוך שמירה על ה־broker order identity הרלוונטית לפי API/path. ב־IBKR API, Modify של Order פתוחה נעשית באמצעות `placeOrder` נוסף עם אותו `orderId` וה־Order המעודכנת.

### ‏Why

‏כדי לשנות price/quantity/attributes בלי לבצע lifecycle מלא של cancel ואז submit חדש.

### ‏When

```text
order identity continuity is useful
requested change is supported as modify
current order state is known enough
worst-case exposure during modify is acceptable
queue consequences are understood or explicitly treated as unknown
```

### ‏Why Not

‏Modify request אינה עובדה שהפרמטרים החדשים כבר נכנסו לתוקף. בזמן `MODIFY_REQUESTED` יכול להיות uncertainty לגבי מה בדיוק executable אצל Broker/Venue.

### ‏Closest Alternative

`CANCEL_THEN_NEW` כאשר semantics של שינוי במקום אינן אמינות/נתמכות או כאשר רוצים boundary ברור בין old intent ל־new intent.

### ‏Main Failure Mode

```text
old order working
→ modify requested
→ fill / reject / acknowledgement crosses in flight
→ local engine assumes new parameters are active
→ broker truth is different
```

### ‏For Our Engine

```text
PRIMARY OPTION WHEN CAPABILITY + STATE CERTAINTY SUPPORT IT
```

---

## ‏8A.4 same `orderId` אינו אומר same queue priority

‏צריך להפריד:

```text
order identity continuity
!=
queue priority continuity
```

‏גם אם Broker/API מתייחסים לפעולה כ־Modify של אותה Order, שינוי price, quantity או attributes יכול להשפיע על priority לפי Venue/order semantics.

‏לכן אסור לקודד:

```text
same orderId
=> same queue age
```

‏Telemetry צריכה לשמור:

```text
modify_count
price_change_count
qty_change_count
working_order_age
price_level_age
queue_outcome_after_modify
```

‏ו־queue consequence נשארת evidence-driven.

---

## ‏8A.5 `CANCEL_THEN_NEW` — Decision Card

### ‏What

‏Cancel של Order קיימת, המתנה ל־terminal broker evidence שמסירה אותה מן ה־potentially executable set, ואז Submit של Order חדשה.

### ‏Why

‏כדי ליצור separation חזק בין old intent ל־replacement intent ולהימנע overlap מכוון.

### ‏When

```text
exposure safety dominates queue continuity
modify semantics are unsupported or ambiguous
we can tolerate waiting for terminal cancel evidence
new decision materially changes order semantics
state certainty is more valuable than preserving old order identity
```

### ‏Why Not

‏יש latency window שבו אנחנו מחכים ל־cancel terminal; בזמן הזה opportunity יכולה לברוח. Order החדשה גם מתחילה queue/lifecycle חדשים.

### ‏Closest Alternative

`MODIFY_IN_PLACE` כאשר שינוי בתוך אותה Order נתמך וברור מספיק; `OVERLAPPED_REPLACEMENT` רק במחקר/מצב מפורש שבו overlap risk מאושר.

### ‏Main Failure Mode

```text
cancel requested
→ engine assumes old order is gone
→ submits replacement too early
→ old order fills late
→ replacement also executable
```

### ‏For Our Engine

```text
SAFE DEFAULT REPLACEMENT PATTERN
```

> ‏`ENGINE INVARIANT` — `CANCEL_REQUESTED != TERMINAL_NON_EXECUTABLE`.

---

## ‏8A.6 `OVERLAPPED_REPLACEMENT` — Decision Card

### ‏What

‏Submit של replacement בזמן שה־old order עדיין יכולה להיות executable, במטרה לצמצם gap בין old/new exposure.

### ‏Why

‏כדי להפחית no-order gap כאשר latency של cancel acknowledgement יקרה מאוד.

### ‏When

```text
only under explicit research/risk mode
worst-case double execution is modeled
account/position limits tolerate overlap
ownership of both orders is deterministic
rapid reconciliation and repair exist
```

### ‏Why Not

‏זהו מנגנון שמייצר בכוונה חלון שבו שתי Orders יכולות לבצע. הוא הופך latency optimization ל־exposure problem.

### ‏Closest Alternative

`CANCEL_THEN_NEW` כאשר double execution אינה מקובלת; `MODIFY_IN_PLACE` כאשר Broker path תומך בשינוי ללא יצירת Order שנייה.

### ‏Main Failure Mode

```text
old order remains executable
+
new replacement becomes executable
→ both fill
→ position exceeds intended target
```

### ‏For Our Engine

```text
RISK / RESEARCH ONLY UNTIL ACCEPTANCE EVIDENCE
```

---

## ‏8A.7 Worst-Case Exposure הוא תנאי מקדים ל־Overlap

‏אם:

```text
old_remaining_qty = 100
new_order_qty = 100
```

‏ב־overlap אסור לחשב:

```text
intended_exposure = 100
```

‏ה־risk bound הזמני צריך להניח:

```text
potentially_executable_qty = 200
```

‏עד evidence שמסירה אחת מה־Orders מן ה־risk set.

‏ב־Exit זה יכול ליצור over-exit ואף position flip; ב־Entry זה יכול להכפיל exposure.

> ‏`ENGINE RULE` — כל Order non-terminal נספרת לפי worst-case potentially executable quantity, לא לפי מה שה־client “התכוון שיישאר”.

---

## ‏8A.8 `BROKER_MANAGED_REPRICE` — Decision Card

### ‏What

‏Order/Algo/peg שבה Broker או Venue משנים effective price לפי rule שנשלחה מראש, בלי שה־client שולח Modify חדש בכל שינוי reference.

### ‏Why

‏כדי להעביר את micro-repricing loop החוצה ולהקטין client-side cancel/modify churn.

### ‏When

```text
pricing rule itself expresses current execution intent
Economic Price Bound is explicit
application_order_ttl remains enforceable
signal validity is monitored locally
route/candidate semantics are validated
```

### ‏Why Not

‏ה־Broker יכולה להמשיך לבצע repricing בצורה נכונה לפי rule שלה גם לאחר שה־Signal שלנו מתה. פחות client commands אינם פחות lifecycle risk; הם פשוט משנים את ownership.

### ‏Closest Alternative

`MODIFY_IN_PLACE` כאשר ה־client רוצה להחליט כל reprice; `CANCEL_THEN_NEW` כאשר intent השתנה מספיק כדי להצדיק lifecycle חדש.

### ‏Main Failure Mode

```text
broker-managed reprice continues
→ local signal invalidates
→ client delays cancel/reconciliation
→ order remains economically executable under stale intent
```

### ‏For Our Engine

```text
BEHAVIOR-DEPENDENT EXTERNAL REPRICING MODEL
```

---

## ‏8A.9 Broker-Managed Repricing מול Client-Managed Repricing

```text
BROKER_MANAGED_REPRICE
reference moves
→ broker/venue changes effective price
→ no new client modify command required

CLIENT_MANAGED_REPRICE
reference moves
→ local decision
→ modify or cancel/new command
→ broker acknowledgement/reconciliation
```

‏לכן metrics שונים:

```text
broker-managed:
reprice_count_observed
current_effective_price
bound_hit_count
stale_signal_fill_rate

client-managed:
modify_count
cancel_replace_count
command_to_ack_latency
cancel_fill_race_count
modify_unknown_duration
```

‏השוואה רק לפי number of API calls תהיה שגויה.

---

## ‏8A.10 Decision Split — האם ה־Intent השתנה או רק ה־Materialization?

‏לפני כל שינוי נשאל:

```text
Did the underlying execution intent change?
Or only the concrete materialization within the same intent?
```

### ‏אותו Intent, materialization קטנה

‏`MODIFY_IN_PLACE` יכולה להיות מועמדת טבעית אם supported.

### ‏Intent השתנה מהותית

‏למשל:

```text
PASSIVE_JOIN
→ MARKETABLE_LIMIT_IOC
```

‏זה אינו “רק מחיר חדש”. זו Decision חדשה עם lifecycle חדש; `CANCEL_THEN_NEW` לרוב מייצגת את boundary טוב יותר.

> ‏`ENGINE RULE` — שינוי `Behavior Candidate` הוא fresh Decision, לא automatic modify shortcut.

---

## ‏8A.11 Queue Value מול Signal Freshness

‏ה־temptation המרכזית היא:

```text
we already waited in queue
therefore preserve the order
```

‏אבל Queue Position היא asset רק אם ה־Order עדיין רצויה.

‏נשאל:

```text
If this order did not exist now,
would we submit it again under current state?
```

‏אם לא — queue age אינה סיבה לשמר stale intent.

‏כך מפרידים:

```text
queue value
from
signal validity
```

---

## ‏8A.12 Decision Example — Quote moved one tick, intent unchanged

‏נניח:

```text
BehaviorCandidate = PASSIVE_JOIN
signal still valid
Economic Price Bound unchanged
new desired price differs by one tick
```

‏Survivors יכולים להיות:

```text
MODIFY_IN_PLACE
CANCEL_THEN_NEW
```

‏השאלות המכריעות:

```text
Is in-place price modification supported?
What is the queue consequence?
Can we tolerate cancel-confirm latency?
How old / valuable is the current queue position?
What is remaining signal life?
```

‏אין כלל “תמיד modify” או “תמיד cancel/new”.

---

## ‏8A.13 Decision Example — Behavior changed from passive to aggressive

‏נניח:

```text
old = PASSIVE_JOIN
new = MARKETABLE_LIMIT_IOC
```

‏זהו שינוי intent/lifecycle משמעותי:

```text
resting passive exposure
→ immediate capped execution attempt + IOC remainder semantics
```

‏ה־engine חייבת לבצע fresh Decision ולתכנן transition שבו ה־old passive order אינה נשארת executable במקביל בלי authorization מפורש.

‏ברירת המחדל הבטוחה:

```text
CANCEL_THEN_NEW
```

‏לא מפני שהיא תמיד מהירה יותר, אלא מפני שהיא מצמצמת ambiguity של overlapping semantics.

---

## ‏8A.14 Decision Example — client repricing churn מול Relative/Pegged

‏נניח שה־Bid משתנה מספר פעמים בשנייה וה־Intent הוא להמשיך לעקוב אחר same-side reference בתוך `Economic Price Bound`.

‏Client loop:

```text
quote moves
→ local decision
→ modify
→ acknowledgement
→ quote moves again
```

‏Broker-managed candidate:

```text
RELATIVE_PRIMARY
→ broker/path follows reference
```

‏ההשוואה אינה:

```text
fewer messages = better
```

‏אלא:

```text
net execution quality
stale-signal fills
bound discipline
reprice behavior
queue outcome
recovery complexity
```

---

## ‏8A.15 Counterexample — “Modify תמיד שומר Queue”

‏לא.

‏API identity continuity אינה proof ל־venue priority continuity.

‏כל שינוי חייב להיחשב queue-sensitive עד שיש evidence route-specific.

---

## ‏8A.16 Counterexample — “Cancel+New תמיד בטוח כי אין overlap”

‏רק אם מחכים ל־terminal evidence לפני Submit החדש.

```text
cancel request sent
!=
old order no longer executable
```

‏אם Submit חדש נשלח לפני terminal confirmation, יצרנו בפועל `OVERLAPPED_REPLACEMENT` גם אם הקוד קורא לזה Cancel+New.

---

## ‏8A.17 Counterexample — “Broker-managed repricing מבטל cancel/fill races”

‏הוא מפחית client-side repricing commands, אבל ברגע שה־Signal מתה עדיין צריך Cancel.

‏אותו Cancel יכול לחצות עם Fill או reprice שכבר התרחשו.

‏לכן:

```text
external repricing
!=
no cancellation race
```

---

## ‏8A.18 Modify/Cancel/Replace State Contract

‏נשמור בנפרד:

```text
requested_change
last_broker_observed_parameters
current_lifecycle_state
epistemic_uncertainty
potentially_executable_qty
replacement_relationship
superseded_by_internal_order_id
supersedes_internal_order_id
```

‏ולא שדה יחיד:

```text
status = REPLACED
```

‏כי replacement היא relationship בין Orders/versions, לא הוכחה שה־old execution authority נעלמה.

---

## ‏8A.19 Failure Destinations

### ‏`MODIFY_IN_PLACE`

```text
MODIFY_UNKNOWN
→ stop assuming requested parameters are active
→ acquire broker evidence
→ reconcile fills and working order
→ fresh decision
```

### ‏`CANCEL_THEN_NEW`

```text
CANCEL_UNKNOWN
→ do not submit replacement that increases worst-case exposure
→ reconcile old order
→ fresh decision
```

### ‏`OVERLAPPED_REPLACEMENT`

```text
unexpected fill on either leg
→ recompute worst-case remaining executable exposure
→ reconcile position
→ cancel/reduce peers as policy allows
→ fresh decision
```

### ‏Broker-managed reprice

```text
local intent invalidated
→ cancel/reconcile external working behavior
→ do not assume last locally observed effective price is current
```

---

## ‏8A.20 Telemetry

```text
replacement_mechanism
old_internal_order_id
new_internal_order_id
broker_order_id
perm_id
modify_request_ts
modify_ack_ts
cancel_request_ts
cancel_terminal_ts
replacement_submit_ts
old_order_terminal_ts
old_order_last_fill_ts
new_order_first_working_ts
overlap_duration_ms
potentially_executable_qty_during_transition
queue_age_before_change
price_level_age_before_change
queue_outcome_after_change
broker_reprice_count
client_reprice_count
modify_unknown_duration_ms
cancel_unknown_duration_ms
late_fill_after_modify_count
late_fill_after_cancel_count
```

‏מכאן אפשר למדוד האם latency optimization באמת שיפרה execution או רק העבירה סיכון למקום אחר.

---

## ‏8A.21 Decision Record מומלץ

```text
ReplacementDecision {
  decision_id
  snapshot_id
  old_internal_order_id
  old_behavior_candidate
  new_behavior_candidate
  intent_changed
  selected_mechanism
  economic_price_bound
  remaining_signal_life_ms
  queue_value_estimate
  worst_case_executable_qty
  capability_requirements[]
  uncertainty_before
  required_terminal_evidence
  failure_destination
}
```

‏כך Replay יכול להסביר למה בחרנו Modify, Cancel+New, overlap או external repricing.

---

## ‏8A.22 Acceptance Tests

```text
1. MODIFY_IN_PLACE never implies queue priority preservation without route-specific evidence.
2. MODIFY_REQUESTED never proves requested parameters are active.
3. CANCEL_THEN_NEW does not submit a risk-increasing replacement before old order is terminal unless policy explicitly chooses overlap.
4. Any replacement submitted while old order is potentially executable is classified as OVERLAPPED_REPLACEMENT regardless of code label.
5. Worst-case exposure includes every non-terminal old/new order during transition.
6. BehaviorCandidate change always creates a fresh semantic decision.
7. Queue age never overrides stale/invalid signal intent.
8. Broker-managed repricing remains subject to local signal validity, Economic Price Bound and application_order_ttl.
9. Cancel/fill race handling is required for broker-managed repricing too.
10. MODIFY_UNKNOWN and CANCEL_UNKNOWN block new risk until reconciliation or explicit bounded policy permits otherwise.
11. Partial fill during modify/cancel/replace recomputes reconciled_position before next side effect.
12. Reconnect reconstructs supersession relationships and all potentially executable orders before READY.
13. Same broker facts + same policy produce the same replacement decision.
```

---

## ‏8A.23 Practitioner Insight

> ‏`ENGINE RULE` — “לשנות Order” היא לא פעולה אחת. זו בחירה בין continuity, certainty, queue value ו־overlap risk.

‏הדרך לזכור:

```text
MODIFY_IN_PLACE
= preserve logical order identity; accept modify uncertainty

CANCEL_THEN_NEW
= prefer state separation; accept cancel-confirm gap and new queue

OVERLAPPED_REPLACEMENT
= minimize transition gap by intentionally accepting concurrent executable exposure

BROKER_MANAGED_REPRICE
= delegate price-change loop; retain local validity/cancel authority
```

‏והשאלה החשובה ביותר היא:

```text
What can execute right now if every in-flight command resolves in the worst plausible order?
```

‏זו השאלה שמבדילה replacement logic מקצועית מ־UI-style “edit order”.

---

# ‏Checkpoint — סוף חלק 8A

‏יצרנו שכבת Decision אחידה ל־`MODIFY_IN_PLACE`, ‏`CANCEL_THEN_NEW`, ‏`OVERLAPPED_REPLACEMENT` ו־broker-managed repricing. הופרדו order identity, queue continuity, intent change, command acknowledgement ו־worst-case executable exposure. ‏`CANCEL_THEN_NEW` נשארת ברירת המחדל הבטוחה כאשר צריך separation; overlap הוא Risk/Research mechanism בלבד; ו־broker-managed repricing אינה מבטלת את local Signal/TTL/Cancel authority.

# ‏חלק 8B — Failure Contracts & Order Survivability: מי ממשיך להחזיק את ה־Order כשהמערכת שלנו נופלת

> ‏הפרק הזה מוסיף את שכבת ה־Production Safety שחסרה מעל Part 8 ו־Part 9. הוא אינו מוסיף Order Types חדשים. הוא מגדיר לכל family את שאלת ה־survivability: **איפה ה־state החי נמצא, מי ממשיך לנהל אותו, מה עדיין יכול לקרות אחרי disconnect/restart, ומה חייבים לשחזר לפני שחוזרים לשליטה.**

---

## ‏8B.1 כלל העל: שם הפקודה אינו קובע Survivability

‏אין כלל חוקי מסוג:

```text
Stop survives restart
Pegged survives disconnect
Broker Algo is always server-resident
```

‏ה־survivability נקבעת על ידי ה־implementation path בפועל:

```text
implementation_owner
implementation_kind
residency_state
routing / destination
adapter / API
session
account / legal entity
parameter combination
broker acceptance evidence
```

> ‏`ENGINE RULE` — כאשר persistence/residency לא הוכחו עבור ה־Capability tuple המדויקת, המצב הקנוני הוא `UNKNOWN`, לא הנחה שה־Order תשרוד.

---

## ‏8B.2 Dimensions שאסור לאחד

```text
Execution Owner
Persistence Owner
Repricing Owner
Trigger Owner
Dependency / Coordination Owner
Cancel Authority
Recovery Source of Truth
Intent Validity
Residency State
```

‏לדוגמה, Order יכולה להיות:

```text
implementation_kind = BROKER_SIMULATED
residency_state      = VERIFIED_BROKER_RESIDENT
```

‏או:

```text
implementation_kind = BROKER_SIMULATED
residency_state      = UNKNOWN
```

‏`Broker-Simulated` אינו synonym ל־`Broker-Resident`.

‏באותה צורה:

```text
VENUE_NATIVE
```

‏מתאר איפה behavior מסוים מיושם, אבל אינו אומר שה־local engine יודעת אוטומטית לשחזר את כל ה־state לאחר restart.

---

## ‏8B.3 Failure Contract קנוני לכל Family

```text
FailureContract {
  family_id
  concrete_capability_scope

  execution_owner
  persistence_owner
  repricing_owner
  trigger_owner
  dependency_owner
  cancel_authority

  implementation_kind
  residency_state
  intent_validity_source

  recovery_sources[]
  potentially_executable_rule
  possible_late_effects[]
  unsafe_assumptions[]
  required_acceptance_tests[]

  stale_intent_obligation
  failure_destination_profile
  control_regain_condition
}
```

‏ה־Contract אינו מבטיח Broker semantics שלא אומתו. הוא אומר בדיוק **מה צריך להיות ידוע** כדי שנוכל להסתמך על ה־family ב־Production.

---

## ‏8B.4 Order Survivability Matrix

| Family / path | Owner של behavior אחרי submit | Persistence / residency שצריך להוכיח | local process death | TWS / session restart | Late effects עיקריים | Recovery requirement |
|---|---|---|---|---|---|---|
| Static transmitted `Limit` / passive Limit | Broker/Venue לאחר acceptance | Broker/Venue לפי path | יכולה להישאר executable אם accepted | capability-specific | fill, partial, reject, cancel ack | open orders + executions + position |
| `Post Only` / `Hidden` / `Reserve` / `Discretionary` | Broker/Venue לפי attribute/path | capability-specific | יכולה להישאר executable אם accepted | capability-specific | fill/partial, attribute/path reject, replenishment effects | full effective exposure, לא רק displayed state |
| `Relative / Pegged-to-Primary` | Broker/Venue repricing path | Broker/Venue + route-specific residency | repricing עשוי להמשיך | capability-specific | late reprice, fill, partial, reject | current working price + order state + executions + intent validity |
| `MIDPRICE` | Broker-managed algo/mechanism | Broker path; residency חייבת evidence | broker behavior עשוי להמשיך | capability-specific | route/algo reprice, fill, reject | broker algo state observable ככל האפשר + executions + position |
| Directed `Pegged-to-Midpoint` | Venue/Broker path | destination-specific | יכול להמשיך לפי path | capability-specific | late reprice/fill | route/destination identity + working state + executions |
| `Snap Midpoint` | Broker derives once; remainder Limit-like | capability-specific | fixed derived order עשויה להישאר | capability-specific | fill/partial/cancel/reject | recover actual derived working price, לא recompute היסטורית |
| `Adaptive` | Broker Algo | Broker-managed path | algo עשוי להמשיך לבצע | capability-specific | fill/partial/reprice/routing/reject | current broker state + executions + local stale-intent check |
| `Sweep-to-Fill` | Broker/router during aggressive attempt | path-specific | in-flight/accepted effects יכולים להמשיך | usually short-lived but never assume terminal | partial/full fill, reject, correction | executions + final order state + position |
| `Market-to-Limit` | Broker; לאחר fill ראשון remainder משנה צורה | transformed remainder residency | remainder עשויה להישאר executable | capability-specific | initial fill + transformation + remainder fill | reconstruct transformation state + actual remainder + position |
| `Stop / Stop Limit / MIT / LIT` | Trigger owner לפי path; post-trigger execution owner לפי plan | native/broker-simulated/resident לפי capability | trigger יכול עדיין לקרות אם resident | capability-specific | late trigger, fill, partial, reject | trigger state + post-trigger order state + executions + position |
| `Trailing` families | Broker/Venue moving-trigger owner לפי path | path-specific dynamic trigger state | moving trigger עשוי להמשיך | capability-specific | late trigger, trigger repricing/update, fill | recover broker-observed trigger/order state; לא rebuild רק ממחיר נוכחי |
| Transmitted `Bracket` | Broker/Venue + dependency semantics | parent/children acceptance/residency | children/parent יכולים להמשיך לפי accepted graph | capability-specific | parent fill, child activation, sibling cancel, child fill | rebuild protection graph + executions + position + protected qty |
| **Untransmitted** staged Bracket component | TWS/session-local staging לפי path | **לא Broker protection** | local process/TWS dependency גבוהה | עלולה לא לשרוד | missing transmit / local staged state loss | treat as not protected until broker acceptance evidence |
| `OCA/OCO` | Broker coordination path | group state capability-specific | siblings יכולים להמשיך | capability-specific | sibling fill, cancel, partial, reject | reconstruct every member + group relationship + worst-case exposure |
| `Conditional` | Predicate evaluator לפי path | broker/session/path-specific | predicate evaluation עשויה להמשיך רק אם path resident | capability-specific | late activation/cancel/fill | recover predicate/order state + activation evidence |
| Local dynamic exit before submit | Client | Local only | **לא שורדת** | לא רלוונטי | none at broker until submit | rebuild from position/risk truth; old local intent אינה authority |

> ‏`ENGINE RULE` — המילים “יכולה”, “עשויה” ו־“capability-specific” בטבלה הן intentional. ‏Survivability אינה מקבלת `true` עד evidence ל־scope המדויק.

---

## ‏8B.5 Canonical Residency Values

‏נשתמש ב־residency states מפורשים:

```text
VERIFIED_VENUE_NATIVE
VERIFIED_BROKER_RESIDENT
VERIFIED_SESSION_LOCAL
CLIENT_DEPENDENT
UNKNOWN
```

‏אלה מתארים persistence/residency בלבד. הם אינם מחליפים:

```text
implementation_kind
= VENUE_NATIVE | BROKER_SIMULATED | BROKER_ALGO | COMPOSITE | CLIENT_MANAGED | MIXED
```

‏לדוגמה, `Broker Algo` יכולה להיות `BROKER_ALGO` מבחינת implementation, אך residency עדיין צריכה evidence נפרד.

---

## ‏8B.6 Universal Submit Failure Contract

```text
send submit
!=
broker accepted
```

‏לאחר submit request יכולים להיות לפחות:

```text
accepted + acknowledgement observed
accepted + acknowledgement lost
rejected + rejection delayed
transport failure before receipt
receipt / acceptance unknown
```

‏במצב האחרון:

```text
SUBMIT_UNKNOWN
```

‏וה־destination היא:

```text
RECONCILE_ORDER_AND_POSITION
```

‏לא:

```text
blind retry
```

> ‏`ENGINE INVARIANT` — retry של submit כאשר ה־effect הקודם אינו ידוע עלול ליצור duplicate executable exposure.

---

## ‏8B.7 Universal Cancel Failure Contract

```text
CANCEL_REQUESTED
!=
CANCEL_CONFIRMED
!=
TERMINAL_NON_EXECUTABLE
```

‏עד terminal broker evidence, ה־Order נשארת:

```text
POTENTIALLY_EXECUTABLE
```

‏ולפי family היא עדיין יכולה לייצר:

```text
fill
partial fill
trigger
reprice
child activation
sibling coordination effect
reject / correction
```

‏כל הכמות הרלוונטית נשארת ב־worst-case executable exposure.

---

## ‏8B.8 Intent Validity היא State נפרדת מ־Broker Lifecycle

```text
broker_order_state = WORKING
intent_state       = EXPIRED
```

‏הצירוף הזה חוקי במודל.

‏הוא אומר:

```text
broker may still execute
local strategy no longer authorizes continued exposure
```

‏במיוחד חשוב עבור:

```text
passive resting orders
Relative / Pegged
MidPrice
Adaptive
Market-to-Limit remainder
Bracket children
Conditional orders
```

> ‏`ENGINE RULE` — `WORKING` אינה הוכחה שה־Intent עדיין רצויה.

---

## ‏8B.9 Broker-managed behavior אחרי `application_order_ttl`

‏ב־broker-managed repricing / algo / trigger behavior:

```text
application_order_ttl expires
→ local cancellation obligation is created
```

‏אבל:

```text
local TTL expiry
!=
remote order termination
```

‏עד cancel terminal evidence:

```text
order remains POTENTIALLY_EXECUTABLE
broker-managed behavior may continue
late effects remain valid
```

‏לכן TTL היא local policy clock; היא אינה remote kill switch.

---

## ‏8B.10 Late Effect Taxonomy

```text
LATE_FILL
LATE_PARTIAL_FILL
LATE_TRIGGER
LATE_REPRICE
LATE_TRANSFORMATION
LATE_CHILD_ACTIVATION
LATE_SIBLING_CANCEL
LATE_REJECT
LATE_MODIFY_ACK
LATE_CANCEL_ACK
LATE_EXECUTION_CORRECTION
```

‏ה־prefix `LATE_` אינו אומר שהאירוע “לא חוקי”. הוא אומר שהוא הגיע אחרי שה־local engine כבר שינתה assumption, intent, mode או lifecycle expectation.

### ‏השפעה טיפוסית

```text
LATE_FILL / LATE_PARTIAL_FILL
→ execution truth changes
→ position changes
→ protection / exit sizing may change

LATE_TRIGGER
→ post-trigger executable state may now exist
→ risk/protection graph changes

LATE_REPRICE
→ effective executable price changed externally
→ stale-intent / Economic Price Bound checks rerun

LATE_TRANSFORMATION
→ order semantics/remainder changed
→ lifecycle reconstruction required

LATE_CHILD_ACTIVATION
→ potentially executable exit exposure changes
→ duplicate-exit guard reruns

LATE_SIBLING_CANCEL
→ group exposure changes
→ never infer atomicity retroactively

LATE_REJECT
→ capability/materialization evidence changes
→ position changes only if separate execution evidence says so

LATE_MODIFY_ACK
→ old/new parameter assumptions must reconcile

LATE_EXECUTION_CORRECTION
→ execution ledger and position truth must be recomputed
```

---

# ‏חלק ב — Failure Contracts לפי Family

## ‏8B.11 Static Limit / Passive / Post Only

```text
Execution owner:      Broker/Venue after acceptance
Persistence owner:    capability/path-specific
Repricing owner:      none unless client modifies
Trigger owner:        none
Cancel authority:     client, subject to broker lifecycle
Recovery truth:       broker open order + executions + position
Possible late effects: fill, partial fill, reject, cancel ack, execution correction
```

‏Unsafe assumptions:

```text
application TTL expired => order disappeared
cancel requested => no fill possible
Post Only => cannot be rejected/repriced under path-specific semantics
```

‏Control safely returns רק כאשר order state, executions ו־position reconciled מספיקים ל־fresh Decision.

---

## ‏8B.12 Hidden / Reserve / Discretionary

‏Failure Contract זהה ל־Limit בסיסית מבחינת command truth, אבל recovery חייבת לכלול **effective executable exposure**, לא רק מה שמוצג בשוק.

```text
Hidden:
  displayed absence != zero executable quantity

Reserve:
  displayed slice != total remaining executable quantity

Discretionary:
  displayed price != full executable willingness
```

‏לכן לאחר reconnect אסור לשחזר risk מתוך displayed view בלבד.

---

## ‏8B.13 Relative / Pegged

```text
Execution owner:      Broker/Venue path
Persistence owner:    capability-specific
Repricing owner:      Broker/Venue rule
Cancel authority:     client subject to lifecycle
Recovery truth:       broker state + current effective price + executions + position
Possible late effects: reprice, fill, partial, reject, cancel ack
```

‏הכשל הייחודי:

```text
local intent expires
while
external repricing continues
```

‏Unsafe assumption:

```text
no new client command
=> nothing changed
```

---

## ‏8B.14 `MIDPRICE` / `Adaptive`

‏ב־Broker-managed mechanisms צריך לשחזר לפחות:

```text
is the order still executable?
which broker algo/mechanism is active?
what quantity remains?
what Economic Price Bound still applies?
what executions occurred?
is local intent still valid?
```

‏ה־Broker מנהלת execution tactics; היא אינה מקבלת ownership על private Signal validity.

‏Disconnect של ה־client אינו מבטל אוטומטית את ה־Algo.

---

## ‏8B.15 `Snap Midpoint`

‏`Snap Midpoint` שונה מ־continuous peg:

```text
reference sampled once
→ derived order price established
→ remainder behaves according to resulting order/path
```

‏Recovery לא תחשב “מה המחיר היה אמור להיות עכשיו” ותניח שזה המחיר working.

‏צריך broker-observed truth של המחיר/Order שנוצרה בפועל.

---

## ‏8B.16 `Sweep-to-Fill`

‏למרות שההתנהגות בדרך כלל short-lived/aggressive, failure contract אינה יכולה להניח:

```text
client timeout
=> sweep produced no fill
```

‏צריך reconcile:

```text
fills / partial fills
final order state
remaining executable state if any
position
```

‏Blind resubmit לאחר `SUBMIT_UNKNOWN` עלול להכפיל exposure.

---

## ‏8B.17 `Market-to-Limit`

‏ה־Failure Contract חייב לדעת באיזה phase נמצאת ה־Order:

```text
PRE_INITIAL_EXECUTION
INITIAL_EXECUTION_OBSERVED
TRANSFORMED_LIMIT_REMAINDER
TERMINAL
UNKNOWN_TRANSFORMATION_STATE
```

‏לאחר restart אסור להסיק את remainder רק מ־original quantity.

‏צריך:

```text
execution evidence
+
broker-observed transformed order state
+
reconciled position
```

‏`LATE_TRANSFORMATION` היא אירוע מהותי משום שהיא משנה את semantics של remainder.

---

## ‏8B.18 Trigger Families — Stop / Stop Limit / MIT / LIT

```text
Trigger owner:          capability/path-specific
Post-trigger execution: Market-style or Limit-style according to family
Persistence owner:      capability/path-specific
Recovery truth:         trigger/activation evidence + order state + executions + position
Possible late effects:  trigger, fill, partial, reject, cancel ack
```

‏אחרי disconnect קיימים לפחות שלושה states שונים:

```text
NOT_TRIGGERED
TRIGGERED_POST_ORDER_ACTIVE
UNKNOWN_TRIGGER_STATE
```

‏אסור להפוך `UNKNOWN_TRIGGER_STATE` ל־“לא הופעלה”.

---

## ‏8B.19 Trailing Families

‏Trailing state היא path-dependent.

‏Recovery אינה יכולה בהכרח לשחזר moving trigger רק מתוך:

```text
current market price
+
original trail amount
```

‏מפני שהמסלול ההיסטורי של reference יכול להיות חלק מה־state.

‏לכן source of truth צריך להיות broker-observed state/evidence לפי capability, ואם state קריטי אינו reconstructable:

```text
STATE_INCONSISTENT / UNKNOWN
→ safety reconciliation
```

‏ולא restart של trailing rule כאילו לא קרה דבר.

---

## ‏8B.20 Bracket — Failure Contract בסיסי

‏Bracket היא graph, לא שלוש Orders בלתי־קשורות:

```text
parent
├── take-profit child
└── protective-stop child
```

‏Recovery source of truth חייבת לכלול:

```text
parent executions
child lifecycle states
child quantities
sibling coordination state
reconciled position
protected quantity
potentially executable exit quantity
```

‏בשלב `R6A` נקבע ה־contract בלבד. ‏ה־deep safety של parent partial-fill, transmit sequencing ו־protection graph validation תטופל ב־`R6B`.

> ‏`ENGINE INVARIANT` — `UNTRANSMITTED != PROTECTED`.

---

## ‏8B.21 OCA/OCO — Failure Contract בסיסי

```text
mutual-cancel intent
!=
atomic execution guarantee
```

‏Recovery חייבת לשחזר **כל member** ולא רק את “ה־winner” המקומי:

```text
member lifecycle
member filled qty
member remaining qty
cancel state
potentially executable qty
group identity
```

‏עד terminal evidence על sibling, היא נשארת בתוך worst-case executable exposure.

‏ה־deep non-atomic safety matrix תטופל ב־`R6B`.

---

## ‏8B.22 Conditional Orders

‏Conditional contract מפריד:

```text
predicate evaluation state
!=
post-condition order lifecycle
```

‏לאחר reconnect צריך לדעת:

```text
Was the condition already satisfied?
Was the order activated?
Was it cancelled by condition semantics?
Can the predicate still be evaluated without our client?
Can the post-condition order still execute?
```

‏אם evaluator residency אינה מוכחת, היא `UNKNOWN` ב־Capability Contract.

---

## ‏8B.23 Local Dynamic Exit

‏Local dynamic exit היא `CLIENT_MANAGED` עד שנשלחת Concrete Order.

‏לכן:

```text
process death before submit
→ local exit intent disappears
→ no broker protection magically appears
```

‏Recovery מתחילה מ־Position/Protection truth, לא מניסיון “להמשיך את האלגוריתם מאותה שורה”.

---

# ‏חלק ג — Regaining Control

## ‏8B.24 `CONNECTED != CONTROL_REGAINED`

‏חיבור תקשורת חדש אינו מוכיח שהמנוע שוב יודע מה קורה.

‏Control נחשב safely regained רק לאחר שה־family הרלוונטית סיפקה מספיק evidence ל־:

```text
order identity reconciled
lifecycle reconciled
epistemic uncertainty resolved or explicitly bounded
executions ingested
position reconciled
potentially executable exposure rebuilt
dynamic trigger/reprice/transformation state recovered when relevant
ownership reconstructed
intent validity evaluated
protection adequacy evaluated when position exists
```

‏רק לאחר מכן אפשר להעביר control ל־fresh Decision.

‏`READY` המלא יטופל לעומק בשלב Recovery של `R6`; כאן נקבע רק ש־survivability evidence היא prerequisite.

---

## ‏8B.25 Manual Action היא Failure-Domain Event

‏פעולה ידנית ב־Broker/TWS יכולה לשנות:

```text
order parameters
quantity
cancel state
position
protection graph
ownership assumptions
```

‏לכן כאשר evidence מצביעה על שינוי שאינו תואם command stream שלנו:

```text
ownership_assumption = INVALIDATED
system_mode = RECOVERING or EXIT_ONLY as policy requires
→ reconcile before new risk
```

‏אין לנסות “לנצח” פעולה ידנית באמצעות auto-resubmit.

---

## ‏8B.26 Acceptance Tests משותפים לכל Family

‏כל family שמועמדת ל־`PRODUCTION_ENABLED` צריכה להוכיח לפחות את התרחישים הרלוונטיים:

```text
submit accepted + normal ack
submit accepted + ack delayed/lost
submit rejected
client disconnect while working
client restart while working
TWS/session restart when relevant
application TTL expires while still working
cancel requested + late fill
cancel acknowledgement delayed
partial fill before disconnect
partial fill during recovery window
manual modification/cancel
late broker event after local intent superseded
execution correction when supported by path
```

‏ול־dynamic/composite families נוספים:

```text
reprice while client disconnected
trigger while client disconnected
transformation while client disconnected
child activation while client disconnected
sibling cancel/fill crossing
```

> ‏`ACCEPTANCE TEST REQUIRED` — אין לקדם family ל־Production על סמך happy-path בלבד כאשר survivability משנה את risk semantics שלה.

---

## ‏8B.27 Telemetry Contract

```text
family_id
capability_scope_id
implementation_kind
residency_state
execution_owner
persistence_owner
repricing_owner
trigger_owner
intent_state
broker_order_state
epistemic_uncertainty
potentially_executable_qty
late_effect_type
late_effect_latency_ms
recovery_started_at
control_regained_at
manual_intervention_detected
```

‏כך אפשר למדוד לא רק Fill Quality אלא גם האם ה־survivability assumptions שלנו נכונות בפועל.

---

## ‏8B.28 Invariants של `R6A`

```text
Order name != survivability guarantee
Broker-Simulated != Broker-Resident
Client disconnect != remote cancellation
Application TTL expiry != remote termination
Submit request != broker acceptance
Cancel request != terminal non-executable
Working order != valid current intent
Displayed state != total executable exposure
Unknown trigger state != not triggered
Untransmitted != protected
Non-terminal order => potentially executable until evidence says otherwise
Recovery must reconstruct external state before new risk
```

---

## ‏8B.29 Checkpoint

‏`R6A` סוגר את שני פערי הבסיס:

```text
AO-GAP-P0-12 — Failure Contract per advanced-order family
AO-GAP-P0-13 — Order Survivability Matrix
```

‏הוא גם מקבע את ה־universal late-effect vocabulary ואת `UNTRANSMITTED != PROTECTED`, אך אינו טוען עדיין שסגר את ה־deep Bracket/OCA/Recovery contracts של `R6`.

‏השלב הבא הוא `R6B`: ‏Bracket/OCA/Protection deep safety — parent partial fills, transmit sequencing, non-atomic sibling races, protected-quantity invariants ו־Protection Graph Recovery.

# ‏חלק 8C — Bracket, OCA/OCO & Protection Deep Safety

> ‏הפרק הזה משלים את `08B-FAILURE-CONTRACTS-AND-ORDER-SURVIVABILITY.md` עבור families שבהן הסיכון אינו Order בודדת אלא **גרף של Orders, protected quantity ו־coordination שאינה אטומית**. הוא אינו מוסיף Strategy חדשה ואינו מניח Broker semantics שלא אומתו. מטרתו היא לקבוע מה חייב להיות מוכח לפני שמערכת יכולה להתייחס ל־Bracket/OCA כ־Protection אמינה.

---

## ‏8C.1 ארבעת ה־invariants שעליהם כל הפרק נשען

```text
UNTRANSMITTED != PROTECTED

MUTUAL-CANCEL INTENT != ATOMIC EXECUTION GUARANTEE

PROTECTED QUANTITY MUST BE DERIVED FROM RECONCILED POSITION

PARENT PARTIAL-FILL CHILD SEMANTICS = ACCEPTANCE TEST REQUIRED
```

‏כל אחד מארבעת המשפטים האלה הוא boundary של Production Safety, לא הערת שוליים.

---

## ‏8C.2 Bracket היא Protection Graph

‏Bracket אינה שלוש Orders נפרדות שהמנוע יכול לשחזר לפי IDs בלבד.

```text
Parent Entry
├── Profit-Taker Child
└── Protective-Stop Child
```

‏ה־state האמיתי כולל לפחות:

```text
parent requested qty
parent filled qty
parent remaining qty
parent lifecycle

profit child lifecycle
profit child executable qty
profit child filled qty

stop child lifecycle
stop child executable qty
stop child filled qty

reconciled_position
protected_qty
potentially_executable_exit_qty
coordination / sibling state
transmit / residency evidence
ownership evidence
```

> ‏`ENGINE RULE` — Recovery של Bracket היא `Protection Graph Recovery`, לא `reload order IDs`.

---

## ‏8C.3 `UNTRANSMITTED != PROTECTED`

‏`Transmit=false` יכולה להיות חלק מ־construction sequence שימושי, אבל היא אינה הוכחה שההגנה קיימת אצל Broker server.

‏בזמן staging אפשר לקבל מצב כגון:

```text
Parent created locally
Take-Profit child created locally
Protective child not yet transmitted
```

‏אם process/TWS/session נעלמים לפני ה־final transmit, אסור למערכת לדווח:

```text
position_is_protected = true
```

‏רק evidence שה־protective path התקבלה במקום שבו היא אמורה לחיות מאפשרת לעבור ל־protected state.

> ‏`ENGINE INVARIANT` — `Transmit sequence complete locally` אינה שקולה ל־`Protection accepted remotely`.

---

## ‏8C.4 Protection Coverage State

‏נשתמש ב־state מפורש במקום boolean גס:

```text
ProtectionCoverageState =
  NO_POSITION
  UNPROTECTED
  PARTIALLY_PROTECTED
  FULLY_PROTECTED_VERIFIED
  OVER_PROTECTED_RISK
  UNKNOWN_PROTECTION
```

‏המעבר ל־`FULLY_PROTECTED_VERIFIED` דורש לפחות:

```text
reconciled_position known
protective order identity known
protective order potentially executable for required qty
residency / activation semantics verified enough for current path
no conflicting unknown exit/protection exposure
```

‏אם אחד מהם חסר, אסור לשדר certainty מזויפת.

---

## ‏8C.5 Protected Quantity אינה Parent Requested Quantity

‏ה־quantity שיש להגן עליה היא Position שנוצרה בפועל.

```text
protected_target_qty
= abs(reconciled_position)
```

‏לא:

```text
original_parent_qty
```

‏ולא:

```text
last_local_remaining_qty
```

‏כאשר קיימות Exit/Protection Orders נוספות, צריך לחשב גם:

```text
potentially_executable_exit_qty
```

‏כדי לזהות גם under-protection וגם over-exit risk.

---

## ‏8C.6 Parent Partial Fill — אסור לנחש Child semantics

> ‏`ACCEPTANCE TEST REQUIRED`

‏כאשר Parent מתמלאת חלקית, אסור לקורס או למנוע להניח באופן אוניברסלי:

```text
children activate immediately for filled qty
```

‏או:

```text
children remain inactive until parent full fill
```

‏או:

```text
broker automatically resizes every child exactly as we expect
```

‏ההתנהגות חייבת להיבדק עבור ה־scope המדויק:

```text
adapter / API
product
route / destination
account / legal entity
session
exact bracket parameter combination
```

‏Production acceptance צריכה להוכיח לפחות:

```text
when each child becomes active
what executable child quantity appears after first parent partial fill
whether quantity changes after additional parent fills
whether both children resize consistently
what happens after child modify
what happens during reconnect
what happens if parent is cancelled after partial fill
what happens if a child rejects while position already exists
```

> ‏`ENGINE RULE` — עד שה־acceptance evidence קיימת, parent partial fill מובילה ל־`UNKNOWN_PROTECTION` או `PARTIALLY_PROTECTED` לפי evidence בפועל, לא להנחת coverage.

---

## ‏8C.7 Parent Partial Fill יוצר שתי בעיות שונות

‏Partial Fill של Parent משנה בו־זמנית:

```text
POSITION TRUTH
+
PROTECTION REQUIREMENT
```

‏לכן flow בטוח הוא:

```text
parent partial execution observed
→ ingest execution
→ recompute execution_ledger_position
→ reconcile broker_reported_position
→ derive reconciled_position
→ observe actual child lifecycle + qty
→ compute ProtectionCoverageState
→ block/restrict new risk if protection insufficient
→ fresh decision on parent remainder
```

‏אסור לבצע:

```text
parent remaining qty
→ blindly continue previous entry order
```

‏לפני שבדקנו שה־Position שכבר נוצרה מקבלת Protection מספקת.

---

## ‏8C.8 Parent Cancel אחרי Partial Fill

‏כאשר Parent כבר יצרה Position חלקית ואז מבטלים את remainder:

```text
cancel parent remainder
!=
cancel existing position
!=
cancel protection need
```

‏צריך להפריד:

```text
entry intent for remaining qty
existing actual position
children / protection for actual position
```

‏ה־Parent יכולה להגיע ל־terminal cancelled state כאשר עדיין קיימת Position שמחייבת Protection.

> ‏`ENGINE INVARIANT` — Parent terminal state אינה terminal state של ה־Protection Graph.

---

## ‏8C.9 Child Reject לאחר Entry Fill

‏זהו failure חמור יותר מ־Entry candidate reject רגיל.

```text
position exists
+
expected protective child rejected
```

‏התגובה אינה:

```text
try same bracket again later
```

‏אלא:

```text
ProtectionCoverageState = UNPROTECTED or PARTIALLY_PROTECTED
→ system mode becomes EXIT_ONLY / EMERGENCY according to risk policy
→ reconcile current orders
→ fresh protection / exit decision
```

‏Reason family אופיינית:

```text
RISK_PROTECTION_INSUFFICIENT
MATERIALIZATION_PROTECTIVE_CHILD_REJECTED
STATE_PROTECTION_GRAPH_INCONSISTENT
```

---

## ‏8C.10 OCA/OCO — Coordination, לא Transaction

```text
mutual-cancel / quantity-reduction intent
!=
atomic execution guarantee
```

‏OCA/OCO אינן מבטיחות שהשוק יראה רק member אחת executable בכל micro-instant.

‏לכן Risk Model חייב להניח שכל member non-terminal עדיין יכולה להשפיע על Position.

---

## ‏8C.11 OCA/OCO Non-Atomic Race Matrix

| Race | מה יכול לקרות | מה אסור להניח | Required response |
|---|---|---|---|
| `A fills` בזמן cancel של `B` in-flight | `B` עדיין יכולה לבצע | ‏`A filled => B gone` | reconcile both members + position |
| `A partial fills`, `B` עדיין working | שתי members עדיין רלוונטיות | ‏partial fill בחרה winner סופי | recompute group qty + worst-case exposure |
| `B triggers` לפני sibling cancel | post-trigger execution יכולה להתחיל | ‏trigger blocked by sibling intent | reconcile trigger + executions + sibling state |
| timeout אחרי first fill | local winner ידוע חלקית בלבד | ‏timeout means sibling cancelled | `UNKNOWN` + group reconciliation |
| sibling cancel rejected/delayed | member נשארת potentially executable | ‏cancel request removed risk | keep member in risk budget |
| manual modify/cancel | group assumptions השתנו | ‏local OCA model still authoritative | ownership invalidated + recovery |
| both members fill | over-exit / position flip אפשריים | ‏OCO prevents double fill by definition | reconcile actual position, then emergency repair if needed |

> ‏`ENGINE RULE` — OCA/OCO safety נמדדת לפי worst-case **concurrent executable exposure**, לא לפי intended winner.

---

## ‏8C.12 Group Exposure Budget

‏ל־OCA/OCO/Bracket exits צריך לחשב לפחות:

```text
group_potentially_executable_exit_qty
= sum(worst_case_executable_qty(member)
      for every non-terminal member)
```

‏השוואה בסיסית:

```text
position_qty = abs(reconciled_position)
```

‏ואז:

```text
group_potentially_executable_exit_qty < position_qty
→ under-protection / under-exit capacity may exist

group_potentially_executable_exit_qty == position_qty
→ quantity-balanced only if ownership/activation semantics also valid

group_potentially_executable_exit_qty > position_qty
→ over-exit / position-flip risk exists
```

‏השוואת quantities לבדה אינה מוכיחה Protection תקינה; היא רק risk invariant אחד.

---

## ‏8C.13 Protected Quantity Invariants

```text
INVARIANT A
protected_target_qty = abs(reconciled_position)

INVARIANT B
untransmitted qty contributes 0 to verified protected qty

INVARIANT C
unknown child state cannot count as guaranteed protection

INVARIANT D
cancel-pending / cancel-unknown exit remains in potentially executable exit qty

INVARIANT E
verified protective qty must not intentionally exceed position qty unless an explicit, separately bounded transition protocol authorizes temporary overlap

INVARIANT F
partial fill forces recomputation before any new protection/exit side effect
```

‏`INVARIANT E` אינו אומר ש־overlap לעולם לא יכול להתרחש; הוא אומר ש־overlap חייב להיות explicit, bounded ומנוהל כ־risk state — לא side effect מקרי.

---

## ‏8C.14 Protection Graph Recovery

‏לאחר disconnect/restart, recovery של Bracket/OCA צריכה להתחיל מ־external truth.

```text
1. fetch open / held / working orders
2. fetch executions / corrections
3. fetch broker-reported position
4. bind external orders to internal identities where evidence allows
5. rebuild parent/child/OCA relationships
6. mark unknown relationships explicitly
7. derive reconciled_position
8. compute every member's potentially executable qty
9. derive protected_target_qty
10. derive ProtectionCoverageState
11. reconstruct ExitAuthority / ProtectionAuthority
12. only then allow fresh decision
```

‏אסור להתחיל מ־:

```text
reload last local signal
→ recreate bracket
```

‏מפני שה־external graph יכולה כבר להיות שונה.

---

## ‏8C.15 Graph States שצריך לזהות במפורש

```text
GRAPH_CONSISTENT_PROTECTED
GRAPH_CONSISTENT_UNPROTECTED
GRAPH_PARTIAL_COVERAGE
GRAPH_OVER_EXIT_RISK
GRAPH_ORPHAN_CHILD
GRAPH_MISSING_EXPECTED_CHILD
GRAPH_UNKNOWN_PARENT_LINK
GRAPH_UNKNOWN_OCA_MEMBERSHIP
GRAPH_CONFLICTING_OWNERSHIP
GRAPH_STATE_INCONSISTENT
```

‏אלה אינם Broker statuses; הם derived safety states של המנוע.

---

## ‏8C.16 Orphan Child

‏Child יכולה להיות קיימת בזמן שה־Parent כבר terminal או אינה מזוהה אצלנו כראוי.

‏`orphan` אינה אומרת אוטומטית לבטל.

‏לפני פעולה צריך לדעת:

```text
can this child still execute?
what side / qty can it execute?
what current position exists?
is it protective or risk-increasing under current position?
who owns it?
was it manually created/modified?
```

‏ה־default בזמן uncertainty הוא:

```text
no new risk
→ reconcile ownership + position + order state
```

‏לא `cancel everything` עיוור.

---

## ‏8C.17 Missing Protective Child

‏אם Position קיימת אבל expected child אינה observable:

```text
expected child missing
!=
child safely cancelled
```

‏צריך להבדיל בין:

```text
never transmitted
rejected
cancelled
filled
unknown / not yet observed
binding mismatch
manual action
```

‏עד שהסיבה ידועה:

```text
ProtectionCoverageState = UNKNOWN_PROTECTION or UNPROTECTED
```

‏לפי evidence הקיים.

---

## ‏8C.18 Handoff בין Broker Protection ל־Local Exit

‏Handoff הוא protocol לא אטומי.

### ‏סכנה 1 — Cancel protection מוקדם מדי

```text
cancel broker protection
→ wait
→ local exit fails / disconnect
→ position temporarily unprotected
```

### ‏סכנה 2 — Local Exit מוקדם מדי

```text
submit local exit
while broker protection still executable
→ both may execute
→ over-exit / position flip
```

‏לכן כל handoff חייב לכלול:

```text
current reconciled_position
current protected qty
all potentially executable exits
transition exposure budget
cancel/submit sequencing policy
late-effect handling
completion condition
```

> ‏`ENGINE RULE` — handoff completion נקבעת לפי broker/execution/position evidence, לא לפי העובדה שה־client שלח את שתי הפקודות המתוכננות.

---

## ‏8C.19 Exit Authority ו־Protection Authority נשארות נפרדות

```text
ExitAuthority
= מי רשאי ליזום Exit חדשה

ProtectionAuthority
= איזה מנגנון מחזיק כרגע protection שאמורה לפעול ללא fresh local signal
```

‏ייתכן מצב שבו:

```text
ExitAuthority = LOCAL_ENGINE
ProtectionAuthority = BROKER_PROTECTION
```

‏וזה תקין רק אם handoff/overlap policy ברורה.

‏Order שעדיין potentially executable אינה מפסיקה להיות risk רק משום שה־Authority ליצירת Orders חדשות עברה למרכיב אחר.

---

## ‏8C.20 Manual Intervention משנה Ownership assumptions

‏אם משתמש משנה ידנית Parent/Child/OCA member:

```text
local dependency graph may no longer be authoritative
local quantity assumptions may be false
local cancel/modify ownership may be false
```

‏לכן:

```text
manual_intervention_detected
→ invalidate affected ownership assumptions
→ enter RECOVERING / EXIT_ONLY as policy requires
→ rebuild graph from broker truth
```

‏אין auto-resubmit שנועד “לתקן” פעולה ידנית לפני reconciliation.

---

## ‏8C.21 Late Effects מיוחדים ל־Protection Graph

‏מעבר ל־taxonomy של Part 8B, כאן חשוב במיוחד:

```text
LATE_PARENT_FILL
LATE_CHILD_ACTIVATION
LATE_CHILD_FILL
LATE_SIBLING_CANCEL
LATE_CHILD_REJECT
LATE_PROTECTION_RESIZE
LATE_EXECUTION_CORRECTION
```

‏כל אחד מהם מחייב recompute של:

```text
reconciled_position
protected_target_qty
verified_protected_qty
potentially_executable_exit_qty
ProtectionCoverageState
ExitAuthority / ProtectionAuthority assumptions
```

---

## ‏8C.22 `FLAT_CONFIRMED` בגרף Protection

‏`reconciled_position == 0` לבדו אינו מספיק אם עדיין קיימות exits שיכולות לבצע.

‏לכן:

```text
FLAT_CONFIRMED requires
reconciled_position == 0
AND
no potentially executable exit/protection order
AND
no UNKNOWN member that could create exit exposure
AND
execution reconciliation complete enough for current policy
```

‏אחרת המערכת יכולה להיות flat עכשיו ועדיין להפוך Short/Long כתוצאה מ־late child fill.

---

## ‏8C.23 Acceptance Matrix — Bracket

> ‏`ACCEPTANCE TEST REQUIRED`

‏לפני `PRODUCTION_ENABLED` עבור Bracket path ספציפית צריך לבדוק לפחות:

```text
full parent fill → children activation
first parent partial fill → child activation state
additional parent fills → child qty evolution
parent cancel after partial fill
profit child partial fill
stop child partial fill
one child fills while sibling cancel is in flight
child reject after position exists
modify child quantity
modify parent while children staged
client disconnect before final transmit
client disconnect after final transmit
TWS/session restart with active parent/children
manual child modify
manual child cancel
late fill during recovery
execution correction affecting protected qty
```

‏ה־expected result חייב להירשם כ־evidence של capability tuple, לא כידע גלובלי על “Bracket”.

---

## ‏8C.24 Acceptance Matrix — OCA/OCO

> ‏`ACCEPTANCE TEST REQUIRED`

```text
A full fill → B cancel timing
A partial fill → B state / qty behavior
A fill while B cancel acknowledgement delayed
A/B simultaneous or near-simultaneous execution attempt
triggered member while sibling cancel is in flight
cancel reject on sibling
manual modify of one member
manual cancel of one member
client disconnect after first member fill
reconnect while sibling state unknown
execution correction after group looked terminal
```

‏Production policy חייבת להיות בטוחה גם אם observed semantics פחות “נוחות” ממה שה־UI מרמזת.

---

## ‏8C.25 Failure Destinations

| Failure | Canonical destination |
|---|---|
| Parent Partial Fill + child coverage unknown | `PROTECTION_REVIEW` + `RECONCILE_ORDER_AND_POSITION` |
| Protective child reject | `PROTECTION_REVIEW` + fresh Exit/Risk decision |
| Sibling cancel unknown | `RECONCILE_ORDER_AND_POSITION` |
| OCA members over-expose position | `REDECIDE_EXIT` / emergency risk reduction לפי current facts |
| Missing expected child | `PROTECTION_REVIEW` |
| Orphan child | `RECOVERY_RECONCILIATION` |
| Manual intervention | `RECOVERY_RECONCILIATION` |
| Graph identity inconsistent | `RECOVERY_RECONCILIATION` |

‏ה־destination אינה hard-coded next Order Type.

---

## ‏8C.26 Telemetry Contract

```text
protection_graph_id
parent_internal_order_id
child_internal_order_ids[]
oca_group_id

reconciled_position
protected_target_qty
verified_protected_qty
potentially_executable_exit_qty
protection_coverage_state

graph_state
exit_authority
protection_authority

parent_filled_qty
child_executable_qty_by_id
child_filled_qty_by_id

untransmitted_member_count
unknown_member_count
cancel_pending_member_count
manual_intervention_detected

late_effect_type
late_effect_member_id
recovery_started_at
protection_verified_at
```

---

## ‏8C.27 Invariants של `R6B`

```text
UNTRANSMITTED != PROTECTED
Parent requested qty != protected target qty
Protected target qty = abs(reconciled_position)
Parent terminal != protection graph terminal
OCA/OCO coordination != atomic execution
Cancel requested sibling != non-executable sibling
Unknown child != safely inactive child
Every non-terminal member contributes to worst-case executable exposure
Partial fill => recompute position + graph + protection before new side effect
Broker protection handoff is non-atomic
Manual intervention invalidates affected ownership assumptions
FLAT now != FLAT_CONFIRMED
```

---

## ‏8C.28 Checkpoint

‏`R6B` סוגר את פערי ה־deep safety הבאים:

```text
AO-GAP-P0-10 — Bracket parent partial-fill semantics remain ACCEPTANCE TEST REQUIRED
AO-GAP-P0-11 — OCA/OCO are explicitly non-atomic coordination
AO-GAP-P0-14 — UNTRANSMITTED != PROTECTED
```

‏בנוסף הוא מגדיר `Protection Graph Recovery`, ‏protected-quantity invariants, OCA race matrix ו־handoff safety.

‏השלב הבא הוא `R6C`: ‏Recovery, ownership, manual intervention, shutdown semantics ו־earned `READY` — Position-First / Ownership-First recovery עד closeout של פערי safety הנותרים.

# ‏חלק 8D — Recovery, Ownership, Shutdown & Earned READY

> ‏הפרק הזה סוגר את שכבת ה־Recovery של Advanced Orders. הוא אינו פרק כללי על Reliability; הוא עוסק רק במקומות שבהם restart, disconnect, manual intervention או shutdown יכולים לשנות את ה־semantics, ה־ownership או ה־risk של Orders שכבר נשלחו או Position שכבר קיימת.

---

## ‏8D.1 Recovery אינה Resume

‏הטעות המסוכנת ביותר היא לחשוב:

```text
process restarted
→ reload last signal
→ continue previous execution plan
```

‏ה־contract הנכון הוא:

```text
process restarted
→ acquire external truth
→ rebuild position / orders / ownership / protection
→ classify unknowns
→ invalidate stale intent
→ earn READY
→ fresh decision
```

> ‏`ENGINE RULE` — Recovery אינה מחיה Decision, Signal, TTL או Entry intent שהיו תקפים לפני הכשל.

---

## ‏8D.2 Position-First + Ownership-First

‏Recovery מתחילה בשתי שאלות לפני כל שאלה על Strategy:

```text
What position exists now?
What orders can still execute now?
```

‏מיד אחריהן:

```text
Who currently owns Exit authority?
Who currently owns Protection authority?
Who owns repricing / trigger / coordination state?
What is UNKNOWN?
```

‏רק לאחר מכן אפשר לשאול האם קיים Intent חדש.

> ‏`ENGINE INVARIANT` — Strategy intent אינה source of truth עבור Position או externally executable Orders.

---

## ‏8D.3 Recovery Truth Set

‏לפני החלטה שמגדילה Risk צריך לרכוש, ככל שה־adapter/path מאפשרים:

```text
broker open / held / working orders
broker executions and execution corrections
broker-reported position
local execution ledger
order identity mappings
parent / child relationships
OCA/OCO memberships
trigger / transformation / broker-algo state where observable
cancel / modify uncertainty
manual intervention evidence
capability state relevant to still-live orders
```

‏מכאן נגזרים:

```text
reconciled_position
potentially_executable_orders
potentially_executable_entry_qty
potentially_executable_exit_qty
protection_coverage_state
exit_authority
protection_authority
ownership_conflicts
unresolved_unknowns
```

---

## ‏8D.4 Recovery Precedence

‏סדר ה־Recovery הקנוני הוא:

```text
1. freeze new risk
2. establish connectivity / handshake readiness
3. ingest broker order state
4. ingest executions / corrections
5. reconcile position
6. rebuild potentially executable exposure
7. rebuild dependency / coordination / protection graph
8. rebuild ownership
9. classify manual intervention
10. evaluate protection adequacy
11. invalidate expired local intent
12. resolve / bound UNKNOWN states
13. run READY gates
14. only then allow fresh decision
```

‏אין שלב שבו “ה־Signal האחרון” מקבל קדימות על Broker truth.

---

## ‏8D.5 Connectivity היא רק Gate ראשון

```text
CONNECTED
!=
HANDSHAKE_READY
!=
RECOVERED
!=
READY
```

‏Socket תקין מוכיח תקשורת בלבד.

‏Handshake תקין מוכיח שה־API path מוכן לקבל/להחזיר state ברמה הבסיסית.

‏Recovery complete דורשת reconciliation.

‏`READY` דורשת בנוסף שכל invariants העסקיים והבטיחותיים עברו.

> ‏`ENGINE RULE` — `READY` היא earned state, לא default state אחרי reconnect.

---

## ‏8D.6 `READY` Gate קנוני

‏מותר לעבור ל־`READY` רק אם כל הדרישות הרלוונטיות ל־scope הנוכחי מתקיימות:

```text
connectivity_ready == true
handshake_ready == true

order_snapshot_acquired == true
execution_reconciliation_complete == true
position_reconciliation_complete == true

no_unbounded_submit_unknown
no_unbounded_modify_unknown
no_unbounded_cancel_unknown

all potentially executable orders classified
all externally observed orders ownership-classified
all dependency / OCA / protection relationships reconstructed or explicitly bounded

reconciled_position known
potentially_executable_exposure within policy
protection coverage acceptable for any open position

ExitAuthority known
ProtectionAuthority known
no unresolved ownership conflict

expired pre-failure signal not reused
fresh market / risk state available for any new decision

manual intervention reconciled
shutdown residue reconciled when recovering from shutdown
```

‏אם אחד מן ה־gates אינו מתקיים, המערכת נשארת למשל ב־:

```text
RECOVERING
ENTRY_DISABLED
EXIT_ONLY
DEGRADED
FROZEN
```

‏לפי חומרת הבעיה וה־policy.

---

## ‏8D.7 `READY` אינה אומרת “הכול מושלם”

‏ייתכן שהמערכת אינה יכולה לאמת feature מסוים, אך עדיין יכולה לפעול במצב מצומצם.

‏לדוגמה:

```text
new entries blocked
+
position known
+
exit path verified
```

‏יכול להצדיק:

```text
EXIT_ONLY
```

‏אבל לא `READY` מלא ל־Entry.

‏לכן System Operating Mode הוא output של Recovery, לא boolean יחיד.

---

## ‏8D.8 Unknown External Order

‏Order שה־Broker מדווח עליה אך המנוע לא מצליח לשייך מיד ל־local intent אינה “Order זרה שאפשר להתעלם ממנה”.

‏נדרש classification:

```text
KNOWN_OWNED_ORDER
KNOWN_MANUAL_ORDER
KNOWN_EXTERNAL_SYSTEM_ORDER
UNKNOWN_OWNERSHIP_ORDER
```

‏ל־`UNKNOWN_OWNERSHIP_ORDER` נשאל לפחות:

```text
Can it execute?
Which side?
Which quantity?
Does it increase or reduce current position risk?
Is it protection?
Is it part of a dependency / OCA graph?
Can our client legally / technically cancel or modify it?
```

> ‏`ENGINE RULE` — Ownership unknown אינה authorization לבצע cancel אוטומטי וגם אינה authorization להתעלם מה־Order.

---

## ‏8D.9 Manual Intervention היא שינוי Authority

‏Manual action ב־TWS/Broker יכולה לשנות:

```text
price
quantity
TIF / attributes
cancel state
position
parent / child relationship assumptions
OCA group state
protection coverage
```

‏לכן כאשר observed state אינה מוסברת על ידי command stream שלנו:

```text
manual_intervention_detected = true
```

‏והתגובה:

```text
invalidate affected ownership assumptions
freeze conflicting automation
reconcile external truth
rebuild protection / exit authority
fresh decision
```

‏אסור:

```text
auto-resubmit local desired state
```

‏רק משום שהמערכת רואה “drift” מול התכנון הישן.

---

## ‏8D.10 Single Decision Authority אחרי Recovery

‏לאחר recovery חייב להיות רכיב יחיד שמורשה ליצור Side Effect חדש בשם execution intent.

```text
Single Decision Authority
```

‏אינה אומרת שרק רכיב אחד יכול להיות executable.

‏Broker-resident protection, OCA siblings או cancel-pending Orders עדיין יכולים לפעול.

‏היא אומרת שרק authority מוגדרת אחת רשאית **ליזום החלטה חדשה** לאחר reconciliation.

---

## ‏8D.11 Exit Authority ו־Protection Authority נשארות נפרדות

```text
ExitAuthority
= who may initiate a new exit action

ProtectionAuthority
= which mechanism currently owns standing protection
```

‏Recovery חייבת לשחזר את שתיהן.

‏מצב חוקי אפשרי:

```text
ExitAuthority       = LOCAL_ENGINE
ProtectionAuthority = BROKER_PROTECTION
```

‏אבל אם Broker protection קיימת ועדיין executable, היא ממשיכה לצרוך exit risk budget גם כאשר Local Engine קיבלה מחדש ExitAuthority.

---

## ‏8D.12 Recovery אינה מחיה Signal ישן

‏צריך לשמור בנפרד:

```text
historical_signal_record
current_signal_validity
```

‏לאחר reconnect:

```text
old signal existed
!=
old signal is valid now
```

‏אם `signal_ttl` פג בזמן disconnect:

```text
signal_state = EXPIRED
```

‏Recovery יכולה להשתמש ברשומה ההיסטורית ל־audit/replay, אבל לא ל־authorization של Entry חדשה.

> ‏`ENGINE INVARIANT` — Recovery restores truth; it does not restore expired intent.

---

## ‏8D.13 Working Order עם Signal שפג

‏מצב אפשרי:

```text
broker_order_state = WORKING
signal_state       = EXPIRED
```

‏התגובה אינה למחוק את ה־Order לוגית.

‏התגובה היא:

```text
create cancellation obligation when policy requires
keep order in potentially_executable exposure
reconcile late effects
fresh decision only after sufficient evidence
```

‏Broker-managed repricing/trigger behavior יכולה להמשיך בזמן שה־local signal כבר מתה.

---

## ‏8D.14 Shutdown אינו `cancel everything`

‏Shutdown היא control transition, לא Broker command יחידה.

‏לפני shutdown צריך להגדיר policy לכל category:

```text
new entry intent
working entry order
working exit order
broker-resident protection
cancel-pending order
unknown order
manual/external order
open position
```

‏למשל, ביטול עיוור של Broker-resident protective stop רק משום שה־process נסגרת יכול להגדיל סיכון.

> ‏`ENGINE RULE` — Shutdown אינה מבטלת Protection כברירת מחדל; היא מעבירה את המערכת ל־state שבו כל surviving order/position חייבת להיות מתועדת ומסווגת.

---

## ‏8D.15 Graceful Shutdown Sequence

‏ה־sequence הקנוני ברמת Advanced Orders:

```text
1. disable new entries
2. stop creation of new non-essential risk
3. snapshot local intent / order / position state
4. classify every potentially executable order
5. apply explicit shutdown policy per order family
6. preserve required broker-resident protection unless policy explicitly replaces it
7. send required cancels / modifications
8. observe acknowledgements / fills within allowed shutdown window
9. persist unresolved UNKNOWN / cancel-pending / working state
10. persist ownership and protection state
11. close process without pretending unresolved external state disappeared
```

‏גם shutdown “נקי” אינו הוכחה שמחר אפשר להתחיל מ־blank state.

---

## ‏8D.16 Shutdown Outcomes

‏בסוף shutdown אפשר להגיע למשל ל־:

```text
FLAT_AND_NO_EXECUTABLE_ORDERS

POSITION_WITH_VERIFIED_BROKER_PROTECTION

POSITION_WITH_EXIT_IN_PROGRESS

NO_POSITION_BUT_CANCEL_PENDING_ORDER_EXISTS

UNKNOWN_EXTERNAL_STATE_REQUIRES_RECOVERY
```

‏רק הראשון דומה באמת ל־“nothing remains”.

‏כל האחרים דורשים startup recovery לפני `READY`.

---

## ‏8D.17 Crash Shutdown שונה מ־Graceful Shutdown

‏ב־crash אין לנו sequence מקומי אמין.

‏לכן startup שלאחר crash מניח:

```text
local final state may be stale
last command may or may not have reached broker
broker-managed behavior may have continued
fills may have occurred
manual intervention may have occurred
```

‏ה־source of truth היא external reconciliation, לא קובץ ה־state האחרון לבדו.

---

## ‏8D.18 Shutdown + Protection Handoff

‏אם local engine מפסיקה לנהל Exit אבל משאירה broker-resident protection:

```text
local dynamic exit authority stops
broker protection remains potentially executable
```

‏צריך persist לפחות:

```text
ProtectionAuthority
protective order identity
protected qty
residency evidence
Economic Price Bound / trigger semantics where relevant
last verified broker state
```

‏ב־startup, protection זו נבדקת מחדש; לא מניחים שהיא קיימת רק משום שה־shutdown התכוונה להשאיר אותה.

---

## ‏8D.19 Shutdown עם Cancel Pending

‏אם shutdown שולחת Cancel אך אינה מקבלת terminal evidence:

```text
CANCEL_REQUESTED / CANCEL_UNKNOWN
```

‏ה־Order נשמרת persistent recovery obligation.

‏אסור לשמור:

```text
cancelled = true
```

‏רק משום שה־process ביקשה Cancel לפני שנסגרה.

---

## ‏8D.20 Recovery של Dynamic / Transforming Orders

‏ל־families דינמיות צריך לשחזר את state שה־semantics שלהן תלויות בו:

```text
Pegged / Relative   -> current effective working state
Trailing            -> broker-observed trigger state
Market-to-Limit     -> transformation phase + remainder
Bracket             -> protection graph
OCA/OCO             -> every member + group state
Conditional         -> predicate/activation state
Broker Algo         -> observable broker-managed state + executions
```

‏אם state קריטי אינו reconstructable:

```text
UNKNOWN / STATE_INCONSISTENT
```

‏ולא synthetic reconstruction שמעמידה פנים שהיא Broker truth.

---

## ‏8D.21 Recovery of Partial Fill

‏Partial Fill שקרתה לפני או בזמן failure משנה את הבעיה מ־Order recovery ל־Position recovery.

```text
partial execution
→ execution ledger changes
→ reconciled_position changes
→ protection target changes
→ remaining intent must be reconsidered
```

‏לכן:

```text
remaining_qty from old order
!=
authorized new order quantity
```

‏אחרי recovery נדרשת fresh Decision.

---

## ‏8D.22 Recovery of Execution Correction

‏Execution correction יכולה להגיע לאחר שהמנוע כבר בנה Position Truth.

‏כאשר מתקבלת correction:

```text
recompute execution ledger
reconcile broker position
recompute potentially executable exposure
recompute protection coverage
recompute exit sizing
invalidate decisions derived from superseded execution truth
```

‏ה־event אינו “telemetry only”.

---

## ‏8D.23 Recovery State Record

```text
RecoveryState {
  recovery_id
  started_at
  cause

  connectivity_ready
  handshake_ready

  order_snapshot_complete
  execution_reconciliation_complete
  position_reconciliation_complete

  reconciled_position
  potentially_executable_entry_qty
  potentially_executable_exit_qty

  protection_coverage_state
  exit_authority
  protection_authority

  unknown_order_count
  unknown_ownership_count
  unknown_dependency_count

  manual_intervention_detected
  expired_intent_count
  unresolved_cancel_count

  ready_gate_failures[]
  resulting_system_mode
  completed_at
}
```

‏כך `READY` ניתנת להסבר ול־replay במקום להיות boolean שנקבע אד־הוק.

---

## ‏8D.24 READY Reason Codes

‏דוגמאות ל־gates שחוסמות `READY`:

```text
SYSTEM_RECOVERY_ORDER_SNAPSHOT_INCOMPLETE
SYSTEM_RECOVERY_EXECUTIONS_INCOMPLETE
SYSTEM_RECOVERY_POSITION_INCONSISTENT
STATE_UNKNOWN_EXECUTABLE_ORDER
STATE_UNKNOWN_ORDER_OWNERSHIP
STATE_UNKNOWN_PROTECTION_GRAPH
RISK_PROTECTION_INSUFFICIENT
RISK_OVER_EXIT_EXPOSURE
SYSTEM_MANUAL_INTERVENTION_UNRECONCILED
STALE_PRE_RECOVERY_SIGNAL_EXPIRED
SYSTEM_SHUTDOWN_RESIDUE_UNRECONCILED
```

‏Reason Code מסבירה למה mode נשאר מצומצם; היא אינה Side Effect.

---

## ‏8D.25 Failure Destination במהלך Recovery

‏בזמן `RECOVERING`, Failure Destination אינה “retry broker command”.

‏היא יכולה להיות:

```text
RECONCILE_ORDER
RECONCILE_POSITION
RECONCILE_ORDER_AND_POSITION
PROTECTION_REVIEW
RECOVERY_RECONCILIATION
NO_NEW_SIDE_EFFECT
```

‏רק לאחר truth acquisition יכולה Decision חדשה לבחור פעולה.

---

## ‏8D.26 Acceptance Tests — Recovery

> ‏`ACCEPTANCE TEST REQUIRED`

```text
restart while passive order is working
restart while broker-managed peg/algo is repricing
restart after submit with ACK missing
restart after cancel request with ACK missing
restart after partial entry fill
restart after partial exit fill
restart while Bracket parent partially filled
restart with active protective child
restart while OCA sibling cancel is in flight
restart after trigger but before fill
restart after MTL transformed remainder
restart with execution correction pending/late
restart after manual modify
restart after manual cancel
restart with unknown external order
restart with expired signal but working order
```

‏לכל scenario צריך להוכיח resulting mode ו־READY gate outcome.

---

## ‏8D.27 Acceptance Tests — Shutdown

> ‏`ACCEPTANCE TEST REQUIRED`

```text
shutdown while flat and no orders exist
shutdown with passive entry working
shutdown with cancel pending
shutdown with open position + verified broker protection
shutdown with open position + local-only exit logic
shutdown during partial fill
shutdown with OCA group active
shutdown with unknown broker state
shutdown after manual intervention
crash before graceful shutdown completes
restart after each of the above
```

‏המבחן אינו “process exited cleanly”; המבחן הוא האם ה־external risk state נשמרה/סווגה וניתנת ל־safe recovery.

---

## ‏8D.28 Invariants של `R6C`

```text
Recovery != resume old decision
Position truth precedes strategy intent
Ownership truth precedes new side effects
CONNECTED != READY
HANDSHAKE_READY != READY
Old signal record != current authorization
Expired signal is never revived by recovery
Manual intervention invalidates affected ownership assumptions
Shutdown != cancel everything
Graceful shutdown != proof of empty broker state
Cancel requested during shutdown != cancelled
Protection left at broker remains risk-relevant after local process stops
Unknown external order must be classified before new risk
Partial fill during failure creates fresh position truth
READY must be earned from reconciliation + safety invariants
```

---

## ‏8D.29 Checkpoint

‏`R6C` סוגר את פערי Recovery הבאים:

```text
AO-GAP-P0-15 — Position-First / Ownership-First Recovery
AO-GAP-P0-16 — READY is an earned state
AO-GAP-P1-27 — Manual intervention changes ownership assumptions
AO-GAP-P1-28 — Shutdown != cancel everything
AO-GAP-P1-29 — Recovery does not revive expired signal
```

‏השלב הבא הוא `R6D`: closeout audit של כל Failure / Survivability / Safety gaps מול Final Gap List; רק אם כולם מכוסים יסומן `R6_COMPLETE`.

# ‏חלק 9 — `IBKR` Capability Matrix: מ־Availability ל־Production Enablement

> ‏לפי ה־taxonomy הקנונית ב־`00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md`, ‏Capability אינה `Supported = Yes/No`. היא צירוף של **feature category + product/contract + route/destination + adapter/API + account/legal entity + session + implementation path + evidence + enablement state**. בנוסף, `Research Priority` היא החלטה שלנו ואינה הוכחה שה־feature זמינה או מותרת ב־Production.

## ‏9.1 מטרת החלק: להפסיק להשתמש ב־`Supported` בלי qualifier

‏השאלה:

```text
Does IBKR support X?
```

‏צרה מדי.

‏בפועל צריך לדעת לפחות:

```text
what capability?
for which product / contract?
through which adapter / API?
through which route / destination?
for which account / legal entity / permissions?
in which session?
where is the behavior implemented?
what evidence do we have?
is it merely available for research or actually production-enabled?
```

‏לכן:

```text
AVAILABLE
!=
RESEARCH_CANDIDATE
!=
PRODUCTION_ENABLED
```

> ‏`ENGINE RULE` — המילה `supported` לבדה אינה verdict קנוני. יש לציין תמיד **באיזה scope**, **על סמך איזה evidence**, ובאיזו רמת enablement.

---

## ‏9.2 Capability categories — לא כל מה שמופיע ב־Order Ticket הוא אותו סוג

‏ה־Capability Matrix משתמשת באותן שכבות של `00A`:

```text
BROKER ORDER PRIMITIVE
TIME / FILL POLICY
DISPLAY / LIQUIDITY ATTRIBUTE
TRIGGER / PREDICATE
COMPOSITE / DEPENDENCY RELATIONSHIP
ROUTING POLICY
BROKER ALGO
APPLICATION BEHAVIOR CANDIDATE
```

‏דוגמאות:

```text
Limit                 -> Broker Order Primitive
IOC                   -> Time / Fill Policy
Post Only             -> Liquidity Attribute
Bracket               -> Composite Structure
OCA                    -> Coordination Relationship
SMART / Direct        -> Routing Policy
Adaptive / MidPrice   -> Broker-managed execution mechanism / Algo
MARKETABLE_LIMIT_IOC  -> Behavior Candidate של המנוע
```

‏`Marketable Limit` נשארת לפי ההגדרה הקנונית **Limit שנמצאת כרגע במצב marketable**, לא Broker enum נפרד.

---

## ‏9.3 Capability היא Tuple, לא Checkbox

‏Capability key מקצועי נראה רעיונית כך:

```text
(
  capability_id,
  product,
  contract,
  region,
  adapter,
  route,
  destination,
  session,
  account_scope,
  legal_entity,
  permissions,
  parameter_combination
)
```

‏לכן:

```text
RELATIVE + SMART
```

‏אינה אותה Capability כמו:

```text
RELATIVE + DIRECT(destination)
```

‏ו־:

```text
PEGGED_MIDPOINT + DIRECT(destination)
```

‏אינה alias של:

```text
MIDPRICE + SMART
```

---

## ‏9.4 שלושה צירים שונים: Availability, Evidence, Enablement

### ‏`Availability`

‏האם feature מתועדת או נראית זמינה ב־scope מסוים.

```text
DOCUMENTED_AVAILABLE
DOCUMENTED_UNAVAILABLE
DOCUMENTED_CONDITIONAL
UNKNOWN
```

### ‏`Evidence`

‏מה ראינו בפועל:

```text
DOC_EVIDENCE
RUNTIME_EVIDENCE
PAPER_EVIDENCE
LIVE_EVIDENCE
REJECTION_EVIDENCE
```

### ‏`Enablement`

‏מה המערכת שלנו מרשה:

```text
DOC_ONLY
RUNTIME_CONFIRMED
PAPER_ACCEPTED
LIVE_SMALL_ACCEPTED
PRODUCTION_ENABLED
```

‏אלה אינם synonyms.

‏לדוגמה:

```text
documented_availability = DOCUMENTED_AVAILABLE
runtime_state            = RUNTIME_CONFIRMED
enablement_state         = PAPER_ACCEPTED
```

‏משמעותו: ה־feature קיימת ונראית חוקית, אבל עדיין **אינה** Production capability של המערכת שלנו.

---

## ‏9.5 `Research Role` היא החלטת Product/Research נפרדת

‏נשתמש ב־classification כגון:

```text
CORE_BASELINE
CORE_SAFETY
RESEARCH_CHALLENGER
SPECIALIST_CONDITIONAL
REFERENCE_ONLY
OUT_OF_SCOPE
```

‏זהו ציר אחר לחלוטין מ־enablement.

‏אפשר לקבל:

```text
research_role    = CORE_BASELINE
enablement_state = PAPER_ACCEPTED
```

‏כלומר חשוב לנו מאוד לחקור אותו, אך עדיין אסור להפעילו Production.

‏ואפשר לקבל:

```text
research_role    = REFERENCE_ONLY
enablement_state = RUNTIME_CONFIRMED
```

‏כלומר Broker עשוי לתמוך בו, אבל הוא אינו חלק מה־roadmap של המנוע.

---

## ‏9.6 תאריך וגבולות האימות

> ‏`FACT` — אימות מטריצת המקור: `2026-10-27`.

‏העובדות המוצריות בפרק מבוססות על התיעוד הרשמי שכבר נאסף בקורס. הן אומרות מה IBKR מתעדת ברמת Product/Platform/API — **לא** שהחשבון, ה־contract, ה־route וה־adapter שלנו עברו acceptance test לכל combination.

‏אין להסיק:

```text
IBKR global docs say available
=> our account + contract + route + API accepts it
=> production safe
```

---

## ‏9.7 Core Price + Time/Fill Matrix

| Capability | שכבה קנונית | מניות US לפי התיעוד שנבדק | Routing / Scope | Caveat מרכזי | Research Role |
|---|---|---|---|---|---|
| `Market` | Broker Primitive | ‏כן | SMART / Direct לפי scope | ‏Price certainty נמוכה יותר; broker protections יכולים להשפיע | `SPECIALIST_CONDITIONAL` |
| `Limit` | Broker Primitive | ‏כן | SMART / Direct | ‏Fill אינו מובטח | `CORE_BASELINE` |
| `Marketable Limit` | Limit behavior | ‏כן דרך `Limit` | SMART / Direct | ‏אינה primitive נפרדת; remainder יכולה לנוח בלי `IOC` | `CORE_BASELINE` |
| `DAY` | TIF | ‏כן | לפי Order/path | ‏אינה `application_order_ttl` | `CORE_BASELINE` |
| `GTC` | TIF | ‏כן | לפי scope | ‏stale/recovery risk | `REFERENCE_ONLY` ל־core entry |
| `GTD` | TIF | ‏כן לפי scope | לפי Order/path | ‏Broker expiry אינה sub-second app TTL | `SPECIALIST_CONDITIONAL` |
| `IOC` | TIF / Fill Policy | ‏כן | SMART / Direct לפי scope | ‏Partial-now + cancel remainder | `CORE_BASELINE` |
| `FOK` | Fill Policy | ‏לא baseline למניות US לפי התיעוד שנבדק | Product-dependent | ‏לא להניח stock availability בגלל enum כללי | `OUT_OF_SCOPE` כרגע |
| `AON` | Fill/Quantity Constraint | ‏כן לפי scope | SMART בתרחיש המתועד | ‏יכולה להיות Broker-Simulated | `SPECIALIST_CONDITIONAL` |
| `MinQty` | Fill/Quantity Constraint | ‏תלוי Contract/Route | Venue/path-dependent | ‏דורש runtime + acceptance validation | `RESEARCH_CHALLENGER` |
| `Market-to-Limit` | Broker Primitive / Transforming behavior | ‏כן לפי התיעוד שנבדק | SMART / Direct לפי scope | ‏remainder הופכת ל־Limit לאחר execution ראשוני | `RESEARCH_CHALLENGER` |

---

## ‏9.8 `FOK` — Concept יכול להיות מקצועי גם אם Product path אינו Core

‏הטעות היא להפוך:

```text
concept exists
```

‏ל־:

```text
US-stock adapter may use it
```

‏לכן Adapter מניות לא יציע:

```text
stock_execution_mode = FOK
```

‏רק מפני שהמונח או enum קיימים בעולם המסחר.

‏ה־concept נשאר בקורס; Product capability עוברת Gate נפרד.

---

## ‏9.9 `AON` — Availability אינה אומרת Venue-Native

‏בתרחיש המתועד למניות US, IBKR יכולה לנהל/לדמות `AON` כאשר ה־primary exchange אינה מספקת native behavior מתאים.

‏לכן Capability Record חייב לשמור בנפרד:

```text
available = true
implementation_owner = BROKER_MANAGED_OR_SIMULATED
venue_native = false_or_unknown
```

‏עמודת `Supported` יחידה הייתה מוחקת מידע קריטי על failure domain, latency ו־market-data dependency.

---

## ‏9.10 Liquidity / Price-Adaptive Matrix

| Capability | שכבה קנונית | Routing / Implementation | Caveat מרכזי | Research Role |
|---|---|---|---|---|
| `Post Only` | Liquidity Attribute | Route-specific Broker/Venue behavior | ‏field קיים אינו הוכחת acceptance לכל destination | `CORE_SAFETY` / passive guardrail |
| `Hidden` | Display Attribute | SMART/Direct; Native או Broker-Simulated לפי path | ‏priority/latency משתנים לפי venue/path | `SPECIALIST_CONDITIONAL` |
| `Iceberg / Reserve` | Display/Quantity Attribute | Broker/Venue managed | ‏slice/replenishment semantics | `SPECIALIST_CONDITIONAL` |
| `Relative / Pegged-to-Primary` | Dynamic Pricing Primitive/Variant | SMART / Direct / ATS לפי path | ‏SMART ו־Directed אינן semantics זהות | `RESEARCH_CHALLENGER` |
| `Pegged-to-Midpoint` | Dynamic Pricing Primitive/Variant | Direct / ATS לפי path | ‏destination capability היא חלק מה־feature | `RESEARCH_CHALLENGER` |
| `MidPrice` | Broker Algo / Mechanism | SMART | ‏execution path יכול להשתנות | `RESEARCH_CHALLENGER` |
| `Snap to Market` | One-shot Dynamic Pricing Primitive/Variant | Broker-Simulated לפי התיעוד שנבדק | ‏מחיר מחושב פעם אחת ועלול להתיישן | `SPECIALIST_CONDITIONAL` |
| `Snap to Midpoint` | One-shot Dynamic Pricing Primitive/Variant | Broker-Simulated | ‏stale fixed price / no-fill | `RESEARCH_CHALLENGER` |
| `Snap to Primary` | One-shot Dynamic Pricing Primitive/Variant | Direct לפי scope; Broker-Simulated | ‏destination + stale-price risk | `SPECIALIST_CONDITIONAL` |
| `IBKR ATS Pegged-to-Best` | ATS-specific Dynamic Pricing | Directed to IBKR ATS | ‏ATS-specific semantics | `SPECIALIST_CONDITIONAL` |
| `IBKR ATS Pegged-to-Midpoint` | ATS-specific Dynamic Pricing | Directed to IBKR ATS | ‏destination-specific semantics | `SPECIALIST_CONDITIONAL` |

---

## ‏9.11 `Relative` — Route היא חלק מה־Capability Key

‏Capability cache לא תכתוב:

```text
RELATIVE = true
```

‏אלא משהו בסגנון:

```text
RELATIVE:SMART
RELATIVE:DIRECT:<destination>
RELATIVE:IBKR_ATS
```

‏משום ש־route יכולה לשנות את repricing semantics עצמן, לא רק את מקום הביצוע.

---

## ‏9.12 `Pegged-to-Midpoint` מול `MidPrice` — אותו objective חלקי, Capability שונה

```text
PEGGED_TO_MIDPOINT:
    category = dynamic-pricing primitive/variant
    routing  = DIRECT / ATS path
    behavior = venue/path-specific

MIDPRICE:
    category = broker-managed algo/mechanism
    routing  = SMART
    behavior = broker-selected execution path
```

‏אם Adapter מתרגם את שתיהן ל־`MIDPOINT`, הוא מוחק route, control delegation ו־failure semantics.

---

## ‏9.13 `Snap` — Implementation Path חייב להיות Field

‏בתיעוד שנבדק, משפחת `Snap` מנוהלת כ־Broker-Simulated behavior.

‏לכן נשמור בנפרד:

```text
implementation_owner = BROKER
implementation_kind  = BROKER_SIMULATED
residency             = verify_per_path
```

‏ולא נסיק מ־`Broker-Simulated` שה־Order בהכרח `Broker-Resident` בכל failure scenario. ‏Simulation ו־Residency הם dimensions שונים.

---

## ‏9.14 Stops / Protection / Relationships Matrix

| Capability | שכבה קנונית | Implementation / Routing | Caveat מרכזי | Research Role |
|---|---|---|---|---|
| `Stop` | Trigger + Market-style post-trigger execution | Native או Broker-Simulated לפי path | ‏Trigger price אינה Fill price | `CORE_SAFETY` |
| `Stop Limit` | Trigger + Limit-style post-trigger execution | Path-dependent | ‏Triggered-but-unfilled risk | `SPECIALIST_CONDITIONAL` |
| `Trailing Stop` | Moving Trigger | Broker/Venue path-dependent | ‏noise / premature trigger | `RESEARCH_CHALLENGER` |
| `Trailing Stop Limit` | Moving Trigger + Limit post-trigger | Path-dependent | ‏Position יכולה להישאר לאחר trigger | `RESEARCH_CHALLENGER` |
| `Adjustable Stop` | Transforming Order | Broker-managed transformation | ‏one-time transition semantics | `SPECIALIST_CONDITIONAL` |
| `Conditional` | Predicate / Dependency | Broker-managed or simulated לפי path | ‏market-data / residency implications | `SPECIALIST_CONDITIONAL` |
| `Bracket` | Composite Order Structure | parent/children + transmit semantics | ‏partial/race/recovery semantics | `CORE_SAFETY` |
| `OCA/OCO` | Coordination Relationship | `ocaGroup` / `ocaType` path | ‏coordination is not atomic | `CORE_SAFETY` |

---

## ‏9.15 `Bracket` מקבלת Production Gate קשוח יותר

‏`Bracket` יכולה להיות documented available ובכל זאת להישאר:

```text
enablement_state = PAPER_ACCEPTED
```

‏עד שנבדקו במפורש לפחות:

```text
parent full fill
parent partial fill
parent cancel + late fill
child activation timing
child rejection
TP partial
stop trigger
sibling cancel race
double-exit prevention
manual position change
disconnect/reconnect
process restart
```

> ‏`ACCEPTANCE TEST REQUIRED` — Parent partial-fill child activation נשארת unresolved עבור ה־API/Product/Route הספציפיים עד evidence אמפירי. Availability בתיעוד אינה פותרת את ה־semantics הזו.

---

## ‏9.16 `OCA/OCO` — Coordination Capability, לא Atomic Guarantee

‏Capability Record צריך להיות מסוגל לשמור safety properties כגון:

```text
atomic_cancel = false
late_sibling_fill_possible = true
reconciliation_required = true
```

> ‏`ENGINE INVARIANT` — sibling שנמצא ב־pending cancel נשאר potentially executable עד terminal broker evidence.

‏כך אזהרה מקצועית הופכת לחלק מה־machine-readable contract.

---

## ‏9.17 Routing ו־Broker Algo — שתי קטגוריות נפרדות

| Capability | שכבה קנונית | מי מחזיק את ההחלטה | Research Role |
|---|---|---|---|
| `SMART` | Routing Policy | IBKR בוחרת destination במסגרת ה־router | `CORE_BASELINE` |
| Direct Routing | Routing Policy | המנוע בוחר destination | `SPECIALIST_CONDITIONAL` |
| `SMART DarkOnly` | Routing Variant | IBKR בתוך universe מוגבל | `SPECIALIST_CONDITIONAL` |
| `IBKR ATS` | Destination | destination ייעודי | `SPECIALIST_CONDITIONAL` |
| `Adaptive` | Broker Algo | IBKR מנהלת speed/price search | `RESEARCH_CHALLENGER` |
| `MidPrice` | Broker Algo / Mechanism | IBKR מנהלת midpoint-oriented path | `RESEARCH_CHALLENGER` |
| `VWAP/TWAP/POV` | Broker Algos | Broker scheduling/participation logic | `REFERENCE_ONLY` כרגע |
| `Accumulate/Distribute` | Broker Algo | Broker/TWS slicing logic | `REFERENCE_ONLY` כרגע |

‏אין enum קנוני כזה:

```text
route = SMART | DIRECT | IB_ALGO
```

‏`RoutingPlan` ו־`BrokerAlgoPlan` נשארים אובייקטים נפרדים כפי שנקבע בחלק 7.

---

## ‏9.18 `Adaptive` — Capability צריכה לתאר גם Parameters

‏רשומה בסגנון:

```text
ADAPTIVE = supported
```

‏אינה מספיקה.

‏נרצה dimensions כגון:

```text
base_order_primitive = MARKET | LIMIT
adaptive_priority    = URGENT | NORMAL | PATIENT
economic_price_bound_required_by_policy
application_order_ttl
routing_requirement
```

‏`ADAPTIVE_LIMIT_URGENT` ו־`ADAPTIVE_MARKET_PATIENT` אינן אותה Behavior Candidate רק משום שהן משתמשות באותו Algo.

---

## ‏9.19 `TWS API` Runtime Discovery

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏`ContractDetails` כולל בין היתר metadata כגון:

```text
orderTypes
validExchanges
```

‏זו evidence שימושית ל־runtime capability discovery.

‏אבל:

```text
orderTypes contains X
```

‏אינו מוכיח שכל combination של:

```text
X + TIF + attributes + route + session + account
```

‏יתקבל.

---

## ‏9.20 `Web API` Runtime Rules

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏ב־Contract Rules שתועדו ב־Web API קיימים metadata fields כגון:

```text
orderTypes
ibAlgoTypes
tifTypes
orderTypesOutside
algoEligible
allOrNoneEligible
displaySize
fraqTypes
cqtTypes
```

‏זה מאפשר Adapter שבונה capability view פר Contract במקום להניח feature flags גלובליים.

---

## ‏9.21 `TWS API` ו־Web API אינם אותו Capability Surface

‏אסור להסיק:

```text
TWS field exists
=> identical Web API field
=> identical lifecycle
=> identical error behavior
```

‏לכן:

```text
adapter = TWS_API
```

‏ו־:

```text
adapter = WEB_API
```

‏הם חלק מ־Capability Key, ולא רק implementation detail.

---

## ‏9.22 `CapabilityRecord` קנוני

```text
CapabilityRecord {
  broker

  // identity / scope
  capability_id
  capability_category
  product
  sec_type
  region
  conid
  symbol
  adapter
  account_scope
  legal_entity
  permission_scope
  session

  // execution path
  routing_policy
  destination
  broker_algo
  parameter_constraints
  tif_values
  attributes
  outside_rth

  // implementation dimensions
  implementation_owner
  implementation_kind      // VENUE_NATIVE | BROKER_SIMULATED | BROKER_ALGO | COMPOSITE | CLIENT_MANAGED | MIXED
  residency_state          // VERIFIED_BROKER_RESIDENT | CLIENT_DEPENDENT | UNKNOWN

  // evidence
  documented_availability
  documented_platforms
  runtime_evidence
  acceptance_evidence
  rejection_history
  last_verified_at
  source_version

  // our policy
  research_role
  enablement_state
  disable_reason
  notes
}
```

‏ה־Record נראה עשיר יותר מ־`supportsIOC=true`, אבל הוא מונע בדיוק את סוג ה־false assumptions שמסוכנים ב־advanced orders.

---

## ‏9.23 Capability Key חייב לכלול Route כאשר Route משנה Semantics

‏דוגמאות:

```text
RELATIVE:SMART
RELATIVE:DIRECT:NASDAQ
PEGGED_MID:DIRECT:NASDAQ
PEGGED_MID:IBKR_ATS
MIDPRICE:SMART
```

‏אם route/destination משנות pricing, activation, support או ownership semantics — הן חלק מה־identity של capability.

---

## ‏9.24 Session היא חלק מה־Capability

‏לא מעתיקים enablement אוטומטית בין:

```text
REGULAR
PRE_MARKET
AFTER_HOURS
OVERNIGHT
```

‏Order שזמינה ב־RTH אינה בהכרח מקבלת אותם trigger, liquidity, route או outside-hours rules בסשן אחר.

‏`orderTypesOutside` ב־Web API היא דוגמה לכך שה־Broker עצמו מפריד את ה־scope הזה.

---

## ‏9.25 Account / Legal Entity / Permissions הם חלק מה־Scope

‏תיעוד מוצר גלובלי אינו תחליף ל־account-specific evidence.

‏Production gate כולל לפחות:

```text
account legal entity
trading permissions
contract eligibility
route eligibility
API adapter
paper behavior
small-live behavior
```

‏לכן ניסוח קנוני הוא:

```text
Documented available in IBKR product docs
```

‏ולא:

```text
Supported in our account
```

‏עד שיש evidence מתאימה.

---

## ‏9.26 Startup Capability Discovery

‏ב־startup או בתחילת session:

```text
1. identify account / adapter / environment
2. resolve contract
3. fetch runtime contract metadata
4. normalize broker primitives
5. normalize TIF / fill policies
6. normalize attributes
7. normalize routes / destinations
8. normalize broker algos
9. attach static documented caveats
10. compare with last-known snapshot
11. freeze features whose assumptions changed materially
```

‏Capability Discovery היא **validation layer**, לא Decision Engine.

---

## ‏9.27 Capability Cache צריכה Freshness ו־Version

‏לא נשמור:

```text
supports_midprice = true forever
```

‏אלא לפחות:

```text
verified_at
source_version
broker_software_version_if_relevant
adapter
account_scope
contract
route
session
```

‏Capabilities הן time-dependent operational data.

---

## ‏9.28 Broker Rejection היא Evidence, לא רק Log

‏אם runtime metadata צפתה שה־feature זמינה אבל submit נדחתה, נרשום:

```text
expected_availability
broker_result = REJECTED
reason_code
contract
route
destination
adapter
session
payload_shape
```

‏ואפשר להעביר את הרשומה למצב כגון:

```text
RUNTIME_CONFLICT
```

‏עד בירור.

‏Rejection אחת אינה בהכרח הוכחה שה־feature נעלמה גלובלית; היא evidence עבור scope מסוים.

---

## ‏9.29 `AVAILABLE` אינה `ENABLED`

‏זה ה־guard המרכזי של הפרק:

```text
Documented Available
    ↓
Runtime Confirmed
    ↓
Paper Accepted
    ↓
Live Small Accepted
    ↓
Production Enabled
```

‏Feature יכולה להיות זמינה לחלוטין אצל Broker ועדיין להיות:

```text
enablement_state = DOC_ONLY
```

‏משום שהמערכת שלנו עוד לא הוכיחה lifecycle, telemetry, recovery או safety semantics.

---

## ‏9.30 Fallback לעולם אינו `Unsupported -> More Aggressive`

‏אם Candidate נדחתה או אינה זמינה:

```text
capability failure
```

‏המנוע חוזר ל־fresh decision:

```text
is signal still valid?
what is current urgency?
what is current Economic Price Bound?
how much qty is already filled or potentially executable?
what alternatives are enabled now?
```

> ‏`ENGINE RULE` — Capability failure מפעיל elimination + re-decision. הוא אינו synonym ל־Market Order, אינו escalation אוטומטי ואינו עוקף את ה־Economic Price Bound.

---

## ‏9.31 Acceptance Gate לפי Family

| Family | Minimum acceptance evidence לפני Production |
|---|---|
| Core `MKT/LMT/IOC` | ‏full/partial/no-fill, rejection, cancel race, Economic Price Bound, reconnect |
| Passive / Post Only | ‏marketable-at-arrival behavior, reject/reprice path, route-specific semantics |
| Hidden / Reserve | ‏native/simulated owner, slice/remainder behavior, cancel/recovery |
| Pegged / Relative | ‏reference moves, bound reached, route semantics, broker-managed repricing אחרי stale signal |
| Midpoint / Snap | ‏midpoint movement, no-fill, stale Snap, route rejects, TTL cancel |
| Stops | ‏trigger method, gap, trigger-vs-fill, session behavior, implementation owner |
| Bracket / OCA | ‏partial parent, child rejection, sibling race, reconnect, double-exit defense, ownership |
| Broker Algos | ‏parameter behavior, app TTL, partial fills, cancel/reconnect, decision-return conditions |
| Direct / ATS | ‏destination acceptance, actual fill venue, fees, no-liquidity/reject handling |

---

## ‏9.32 `PAPER_ACCEPTED` אינה הוכחה ל־Live Microstructure

‏Paper environment שימושית ל־:

```text
payload validation
state machine
basic callbacks
rejection handling
reconciliation paths
```

‏אבל אינה מוכיחה במלואה:

```text
real queue position
real hidden liquidity
real venue latency
real maker/taker economics
real adverse selection
all production routing behavior
```

‏לכן `PAPER_ACCEPTED` היא Gate חשובה — לא סוף תהליך האימות.

---

## ‏9.33 `LIVE_SMALL_ACCEPTED` מאמתת Semantics, לא Profitability

‏המטרה היא לבדוק בסיכון מוגבל:

```text
broker acceptance
actual callbacks
actual routing behavior
fill decomposition
cancel/modify races
fee data
reconnect behavior
```

‏הצלחה אינה הוכחה שה־Signal רווחי. היא evidence שה־execution capability מתנהגת כפי שהמערכת מצפה.

---

## ‏9.34 Enablement Matrix ראשונית למנוע

| Capability / Behavior | Research Role | Production Gate מרכזי |
|---|---|---|
| Passive `LMT` + app TTL | `CORE_BASELINE` | ‏state machine + cancel race |
| `MARKETABLE_LIMIT_IOC` | `CORE_BASELINE` | ‏partial/no-fill + Economic Price Bound |
| `SMART` | `CORE_BASELINE` routing | ‏venue/fill telemetry |
| `Post Only` | `CORE_SAFETY` passive guardrail | ‏route-specific acceptance |
| `Stop` backstop | `CORE_SAFETY` | ‏trigger/gap/session/residency tests |
| `Bracket / Hybrid Protection` | `CORE_SAFETY` / challenger architecture | ‏Part 6 Failure Matrix |
| `Relative/Pegged-to-Primary` | `RESEARCH_CHALLENGER` | ‏SMART/Directed semantics בנפרד |
| `MidPrice` | `RESEARCH_CHALLENGER` | ‏fill/no-fill + TTL + path telemetry |
| Directed `Pegged-to-Midpoint` | `RESEARCH_CHALLENGER` | ‏destination-specific acceptance |
| `Snap to Midpoint` | `RESEARCH_CHALLENGER` | ‏stale-price + TTL |
| `Adaptive Limit Urgent/Normal` | `RESEARCH_CHALLENGER` | ‏algo availability + cancel/reconnect |
| Hidden / Reserve | `SPECIALIST_CONDITIONAL` | ‏רק עם footprint/display hypothesis |
| ATS-specific Pegged | `SPECIALIST_CONDITIONAL` | ‏ATS-specific evidence |
| AON / MinQty | `SPECIALIST_CONDITIONAL` | ‏רק אם partial-fill economics מצדיקות |
| FOK for US-stock core | `OUT_OF_SCOPE` כרגע | ‏לא להניח stock path |
| Long-horizon scheduling algos | `REFERENCE_ONLY` | ‏רק אם horizon/size משתנים |

---

## ‏9.35 ה־Scanner לא צריך לדעת Broker Enums

‏Signal/Scanner layer מוציאה Intent כגון:

```text
urgency
signal_ttl
expected_edge
max_position
partial_fill_tolerance
```

‏Execution Engine משתמשת ב־Intent יחד עם Capability Matrix כדי לסנן implementation candidates.

‏כך שינוי ב־Broker capability אינו משנה את ה־Signal model.

---

## ‏9.36 `Capability Resolver` מסנן; הוא לא בוחר Winner

```text
Intent
  ↓
Application Execution Mode
  ↓
Behavior Candidates
  ↓
Capability Resolver
  ↓
eliminate unavailable / unaccepted combinations
  ↓
Decision Engine compares survivors
  ↓
Concrete Broker Plan
```

> ‏`ENGINE RULE` — Capability Resolver עונה **מה מותר לשקול**. הוא אינו עונה **מה עדיף כלכלית** ואינו מחליף את Decision Engine.

---

## ‏9.37 Capability Matrix היא Kill Switch ממוקד

‏אם feature מסוימת מתחילה להידחות:

```text
ADAPTIVE = DISABLED_RUNTIME_CONFLICT
MIDPRICE = PAPER_ACCEPTED
MARKETABLE_LIMIT_IOC = PRODUCTION_ENABLED
```

‏המערכת יכולה להסיר Candidate אחת בלי להעמיד פנים שכל Broker connectivity נשברה.

‏לעומת זאת, failure של capability safety-critical — למשל path של protective order שעליו נשענת הארכיטקטורה — יכולה לחסום Entries חדשות לחלוטין.

---

## ‏9.38 Telemetry קנונית ל־Capability

```text
capability_id
capability_category
adapter
account_scope
legal_entity
conid
route
destination
session
documented_availability
runtime_state
enablement_state
research_role
implementation_owner
implementation_kind
residency_state
last_verified_at
source_version
submit_attempts
accept_count
reject_count
last_reject_code
last_reject_message
paper_test_version
live_test_version
disable_reason
```

‏ומדדים:

```text
reject_rate_by_capability
runtime_doc_mismatch_rate
capability_change_events
fallback_rate
production_disable_events
```

---

## ‏9.39 Freshness Policy

‏Capabilities שתלויות ב־Broker אינן Specification פנימית נצחית.

‏נגדיר לפחות:

```text
verify docs before major release
refresh runtime contract capabilities at startup/session boundary
invalidate cache on relevant broker/config change
record last_verified_at
```

‏במקרה של conflict:

```text
fresh broker evidence > stale local cache
```

‏אבל evidence מקומית אינה מורחבת אוטומטית ל־scope אחר.

---

## ‏9.40 `UI Support` ו־`API Support` הן Evidence שונות

‏Order שמופיעה ב־TWS אינה הוכחה שה־Web API exposes אותה semantics.

‏ושדה API שקיים אינו הוכחה שה־UI, route או account שלנו מאפשרים אותו.

‏לכן נשמור בנפרד:

```text
manual_ui_evidence
tws_api_evidence
web_api_evidence
runtime_broker_evidence
```

‏ולא שדה יחיד בשם `IBKR_SUPPORTED`.

---

## ‏9.41 `API Field Exists` אינה Capability Proof

‏אם `Order` object מכיל:

```text
allOrNone
minQty
displaySize
hidden
postOnly
```

‏זה מוכיח שה־API model יודע לייצג שדה.

‏הוכחה חזקה יותר ל־Capability דורשת:

```text
documented applicability
+
runtime contract/route evidence
+
broker acceptance
+
observed semantics
```

‏וב־Production נדרשות גם telemetry/recovery/safety acceptance.

---

## ‏9.42 Implementation Owner ו־Residency אינם אותו שדה

‏נבדיל בין:

```text
implementation_kind:
  VENUE_NATIVE
  BROKER_SIMULATED
  BROKER_ALGO
  COMPOSITE_RELATIONSHIP
  CLIENT_MANAGED
  MIXED
```

‏לבין:

```text
residency_state:
  VERIFIED_BROKER_RESIDENT
  CLIENT_DEPENDENT
  UNKNOWN
```

‏פקודה יכולה להיות Broker-Simulated בלי שהקורס יניח אוטומטית survivability מסוים לאחר disconnect/restart.

‏זה משפיע על:

```text
latency
survivability
market-data dependency
cancel behavior
queue behavior
failure domain
recovery contract
```

---

## ‏9.43 Research Allowlist ראשונית

‏ל־Research Harness אפשר לשקול מוקדם, בכפוף ל־enablement המתאים:

```text
LIMIT
PASSIVE_JOIN
PASSIVE_POST_ONLY
MARKETABLE_LIMIT_IOC
SMART
RELATIVE_PRIMARY
MIDPRICE
SNAP_MIDPOINT
PEGGED_MIDPOINT_DIRECT
ADAPTIVE_LIMIT_URGENT
ADAPTIVE_LIMIT_NORMAL
```

‏ול־Protection Research:

```text
STOP
STOP_LIMIT
BRACKET
OCA
HYBRID_PROTECTION
```

‏המילה `allowlist` כאן פירושה **מותר למחקר בשלב שה־environment מאפשר**, לא `PRODUCTION_ENABLED`.

---

## ‏9.44 מה לא נכנס אוטומטית ל־Allowlist

```text
FOK for stocks
AON as default
Hidden as default
Reserve/Iceberg as default
DarkOnly as default
ATS-specific pegged as default
long-horizon scheduling algos
```

‏לא משום שהן "גרועות", אלא משום שהן פותרות Problems אחרים או דורשות evidence נוספת.

---

## ‏9.45 Practitioner Secrets — מה שמטריצת Support רגילה מפספסת

### ‏1. `Support` הוא Tuple

```text
(feature, product, route, destination, session, adapter, account, parameters)
```

### ‏2. `AVAILABLE != PRODUCTION_ENABLED`

‏Broker availability אינה system readiness.

### ‏3. `Research Priority != Capability Evidence`

‏Candidate חשובה למחקר יכולה עדיין להיות `DOC_ONLY`.

### ‏4. `Marketable Limit` אינה Broker enum נפרד

‏זו marketability של Limit מול market snapshot.

### ‏5. `Bracket` אינה Primitive

‏היא graph ולכן ה־Gate שלה בודק relationships, quantities, races ו־recovery.

### ‏6. `SMART` היא Routing Policy

‏לא Price Order Type ולא Broker Algo.

### ‏7. `Adaptive` היא Delegation

‏Broker מנהל חלק מה־HOW; המנוע עדיין מחזיק את ה־WHETHER ואת ה־signal clock.

### ‏8. Broker-Simulated אינו בהכרח רע

‏אבל הוא משנה failure domain ואינו synonym של Broker-Resident.

### ‏9. UI אינה API

‏Manual availability אינה programmatic parity.

### ‏10. Runtime metadata אינה Truth מוחלטת

‏Combination/account/route אמיתי עדיין יכול להידחות.

### ‏11. Paper אינה Live

‏היא בודקת correctness רב, לא את כל ה־microstructure האמיתי.

### ‏12. Fallback הוא Fresh Decision

‏Capability failure אינה הרשאה להגדיל אגרסיביות.

### ‏13. Capability יכולה להשתנות בזמן

‏Cache חייבת freshness/versioning.

### ‏14. Feature Production היא יותר משם Order

```text
semantics
+ capability evidence
+ tests
+ telemetry
+ recovery
+ safety invariants
= production capability
```

---

# ‏מקורות רשמיים לחלק 9

- ‏IBKR — Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR TWS API — `ContractDetails` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/contract-details>
- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR Web API — Place Order: <https://www.interactivebrokers.com/docs/web-api/v1/endpoints/orders/place-order>
- ‏IBKR Web API — Contract Rules: <https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/get-contract-rules>
- ‏IBKR TWS API — Modifying Orders: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/modifying-orders>

---

# ‏Checkpoint — סוף חלק 9

‏בחלק הזה הפכנו את המושג `Supported` למודל מדויק יותר: **Capability היא Tuple עם scope, implementation dimensions, evidence ו־enablement state**. הפרדנו `Availability` מ־`Research Role` ומ־`Production Enablement`; יישרנו את המטריצה ל־taxonomy של Broker Primitive, TIF/Attribute, Trigger/Composite, Routing ו־Broker Algo; והבהרנו ש־Capability Resolver רק מסנן Candidates — הוא אינו בוחר את ה־Winner.

‏הכלל החשוב ביותר הוא:

```text
AVAILABLE != PRODUCTION_ENABLED
```

‏תיעוד אומר מה אפשר לבדוק; runtime metadata ו־Broker acceptance נותנים evidence לגבי ה־scope הנוכחי; ורק acceptance tests, telemetry, recovery ו־risk invariants מאפשרים לקדם feature ל־`PRODUCTION_ENABLED`.

‏החלק הבא יהיה **חלק 10 — Engine Decision Guide**: נחבר Signal state, urgency, spread/depth, expected edge, remaining signal life, position/fill state, exit feasibility ו־capabilities למנגנון החלטה שמסנן Candidates ובוחר Execution Behavior בהתאם ל־state.

# ‏חלק 9A — Product-Specific / Out-of-Scope Advanced Orders

> ‏הפרק הזה משלים את Part 9. המטרה אינה להעמיק בכל Order שקיימת אצל Broker, אלא ללמד לזהות Advanced Order מקצועית גם כאשר היא **אינה Candidate למנוע US Stocks שלנו**.
>
> ‏`FACT` — עובדות `IBKR` תלויות־זמן בפרק זה נשענות על ה־review שאומת ב־`2026-10-27` מול התיעוד הרשמי של IBKR.

---

## ‏9A.1 למה צריך בכלל פרק Out-of-Scope

‏טעות נפוצה היא לחלק Orders לשתי קבוצות בלבד:

```text
supported
unsupported
```

‏זה גס מדי.

‏Order יכולה להיות:

```text
real broker capability
professionally relevant concept
but not applicable to our target product / strategy scope
```

‏לכן נשתמש במצב קנוני נוסף:

```text
CONCEPT_RELEVANT_PRODUCT_OUT_OF_SCOPE
```

‏המשמעות:

- ‏ה־Order קיימת וראוי להכיר אותה.
- ‏יש בה concept שיכול לחדד taxonomy או execution reasoning.
- ‏היא אינה נכנסת ל־Candidate Set של מנוע US Stocks הנוכחי.
- ‏אין צורך לממש, לבדוק או לקדם אותה ל־Production כל עוד scope המוצר לא השתנה.

---

## ‏9A.2 `Out-of-Scope` אינו `Unsupported`

‏נפריד:

```text
UNSUPPORTED
=> capability path שאינו זמין או שאינו מאומת עבור ה־scope המבוקש

CONCEPT_RELEVANT_PRODUCT_OUT_OF_SCOPE
=> capability אמיתית/מתועדת, אך product family או use case אינם בתוך scope המנוע
```

‏זו הבחנה חשובה ב־Capability Resolver.

‏אם בעתיד נוסיף Options או Futures, חלק מה־Orders כאן יכולות לעבור הערכה מחדש בלי לשנות את ה־taxonomy הבסיסית.

---

## ‏9A.3 Scope הנוכחי של המנוע

‏ה־scope של `Advanced Order Mastery` עבור המימוש המתוכנן הוא:

```text
primary product family = US Stocks / ETFs
short-horizon execution
IBKR execution path
advanced-order selection only when relevant to that execution problem
```

‏Order שמיועדת בעיקר ל־Options, multi-leg או Futures לא צריכה לקבל אותו עומק של Candidate שניתן באמת להכניס למנוע.

---

## ‏9A.4 טבלת Product-Specific / Out-of-Scope

| Order / Family | Product focus לפי ה־review המאומת | Concept ששווה ללמוד | סטטוס אצלנו |
|---|---|---|---|
| `Pegged-to-Stock` | Options-focused | repricing לפי reference של underlying stock | `CONCEPT_RELEVANT_PRODUCT_OUT_OF_SCOPE` |
| `Relative + Market` | Options / multi-leg-focused | שילוב reference-relative logic עם market-style execution component | `CONCEPT_RELEVANT_PRODUCT_OUT_OF_SCOPE` |
| `Trailing Relative + Market` | Options-focused | path-dependent trailing reference + relative/market execution behavior | `CONCEPT_RELEVANT_PRODUCT_OUT_OF_SCOPE` |
| `Market with Protection` | Futures / FOP-focused | urgent execution עם broker protection mechanism | `CONCEPT_RELEVANT_PRODUCT_OUT_OF_SCOPE` |
| `Stop with Protection` | Futures-only לפי ה־review | trigger + protected post-trigger execution | `CONCEPT_RELEVANT_PRODUCT_OUT_OF_SCOPE` |

> ‏`ENGINE RULE` — עצם קיום Order בקטלוג Broker אינו סיבה להוסיף אותה ל־Candidate Registry של Product אחר.

---

## ‏9A.5 `Pegged-to-Stock`

‏הערך הלימודי שלה הוא ה־concept:

```text
order behavior references another instrument / underlying stock
```

‏כלומר זו הרחבה של רעיון ה־Pegged:

```text
price is not static
price is derived from a reference relationship
```

‏אבל עבור מנוע US Stocks שלנו, אין הצדקה לבנות Candidate רק כדי “לתמוך בעוד Order Type”.

‏ה־nearest in-scope concepts שכבר למדנו הם:

```text
RELATIVE_PRIMARY
PEGGED_MIDPOINT_DIRECT
MIDPRICE
SNAP_* families
```

‏אלה **לא semantic equivalents**, אלא המשפחות הקרובות מבחינת dynamic reference-based pricing.

---

## ‏9A.6 `Relative + Market`

‏ה־review מצא שהמשפחה הזו מתועדת בהקשר Options/multi-leg ולכן אינה baseline למניות.

‏הערך הלימודי:

```text
one order name may combine
reference-relative behavior
+
market-style execution behavior
```

‏זה מחזק את ה־taxonomy שלנו: במקום ללמוד שם Broker כמושג אחד בלתי ניתן לפירוק, מפרקים אותו לצירים.

‏ב־US Stocks שלנו, אם הבעיה היא urgency + bounded price risk, נשווה Candidates שכבר נמצאות ב־scope כגון:

```text
MARKETABLE_LIMIT_IOC
SWEEP_TO_FILL_LIMIT
ADAPTIVE_LIMIT_URGENT
```

‏ולא נכניס Order options-focused רק משום שהשם נשמע “מתקדם יותר”.

---

## ‏9A.7 `Trailing Relative + Market`

‏כאן מופיעים יחד כמה concepts:

```text
path-dependent trigger/reference movement
relative pricing behavior
market-style execution component
```

‏מבחינה לימודית היא מועילה כדי להזכיר:

```text
Trailing
!=
Post-Trigger Primitive
!=
Reference Rule
```

‏אבל היא אינה Core או Research Challenger למנוע US Stocks שלנו.

‏ה־concepts הרלוונטיים כבר מכוסים בנפרד ב־Part 5 וב־Part 6/6A.

---

## ‏9A.8 `Market with Protection`

‏לפי ה־review המאומת, IBKR מתעדת `Market with Protection` עבור Futures/FOPs ולא כ־US-stock baseline.

‏ה־concept המקצועי שחשוב להבין:

```text
high execution urgency
+
broker-defined price protection behavior
```

‏אבל אסור להסיק:

```text
US stock Market order
==
Market with Protection
```

‏או:

```text
because broker uses protection logic somewhere,
our stock engine has the same primitive available
```

‏במנוע המניות שלנו נמשיך להפריד בין:

```text
MKT
marketable LMT
MARKETABLE_LIMIT_IOC
Economic Price Bound
broker price-management behavior
```

---

## ‏9A.9 `Stop with Protection`

‏לפי ה־review המאומת, IBKR מתעדת `Stop with Protection` כ־Futures-only.

‏הערך הלימודי הוא להראות שוב ש־Stop name לבדה אינה כל ה־semantics:

```text
Trigger Mechanism
+
Post-Trigger Execution
+
Protection Mechanism
```

‏אבל ב־US Stocks שלנו לא נכניס אותה ל־Protection architecture כאילו היא זמינה.

‏המשפחות הרלוונטיות אצלנו נשארות:

```text
Stop
Stop Limit
Bracket
STOP_BACKSTOP
HYBRID_PROTECTION
```

‏בכפוף ל־Capability evidence המתאים.

---

## ‏9A.10 למה `Nearest Alternative` אינה תחליף אוטומטי

‏לכל Order out-of-scope אפשר להצביע על concept קרוב, אבל:

```text
nearest conceptual alternative
!=
semantic substitute
```

‏לדוגמה:

```text
Market with Protection
```

‏אינה מוחלפת אוטומטית ב־:

```text
MARKETABLE_LIMIT_IOC
```

‏הן רק עשויות לפתור חלק מאותה בעיה כללית של urgency מול price risk באמצעים שונים.

‏לכן ה־Decision Engine אינה עושה mapping סמוי מ־out-of-scope Order ל־Candidate אחרת.

---

## ‏9A.11 Capability Resolver — הסטטוס הנכון

‏רשומת Capability יכולה לכלול למשל:

```text
concept_status = CONCEPT_RELEVANT_PRODUCT_OUT_OF_SCOPE
product_scope = OPTIONS | FUTURES | FOP | MULTI_LEG
engine_target_product = US_STOCK
candidate_eligible = false
production_enablement = NOT_APPLICABLE
```

‏זה עדיף על:

```text
supported = false
```

‏כי ה־reason נשמר.

---

## ‏9A.12 שינוי Scope בעתיד

‏אם בעתיד המנוע יתמוך ב־Options או Futures, אסור פשוט לשנות:

```text
candidate_eligible = true
```

‏נדרש מסלול מלא מחדש:

```text
re-read current broker documentation
validate exact product/route/API/account/session
materialize in adapter
paper acceptance
live-small acceptance if appropriate
failure-contract testing
production enablement
```

‏כלומר Out-of-Scope הוא לא “feature toggle כבוי”; הוא גבול מוצר.

---

## ‏9A.13 Failure Mode: זיהוי שם Order כיכולת אוניברסלית

‏תרחיש שגוי:

```text
Broker catalog contains order X
→ engine candidate registry includes X
→ runtime discovers target stock path does not accept X
→ fallback becomes more aggressive order
```

‏התגובה הקנונית:

```text
product/path mismatch detected before selection
→ candidate filtered out
→ reason_code = PRODUCT_SCOPE_MISMATCH
→ fresh decision among in-scope survivors
```

‏אין hidden fallback.

---

## ‏9A.14 Reason Codes מוצעים

```text
PRODUCT_SCOPE_MISMATCH
CONCEPT_RELEVANT_PRODUCT_OUT_OF_SCOPE
ROUTE_SCOPE_MISMATCH
API_PATH_NOT_VALIDATED
ACCOUNT_OR_SESSION_NOT_VALIDATED
PARAMETER_COMBINATION_NOT_VALIDATED
```

‏Reason codes אלו עוזרים להבדיל בין:

```text
not useful
not supported
not validated
not applicable to this product
```

---

## ‏9A.15 Acceptance Tests

```text
1. Out-of-scope order never enters the live Candidate Set for US Stocks.
2. Out-of-scope status is not collapsed into generic UNSUPPORTED.
3. Capability failure never auto-enables a conceptually similar substitute.
4. Product-scope change requires fresh capability evidence.
5. Research reports may reference out-of-scope concepts without enabling them.
6. Candidate Registry records a reason when a product-specific family is filtered out.
7. Same product/account/API/route scope yields deterministic eligibility classification.
8. Broker catalog presence alone never yields PRODUCTION_ENABLED.
```

---

## ‏9A.16 Practitioner Insight

> ‏`ENGINE RULE` — Professional depth אינה נמדדת לפי מספר Order Types שהמנוע “תומך” בהן.

‏מערכת מקצועית יודעת גם לומר:

```text
I know what this order is.
I understand the execution concept.
It is not applicable to the product scope I am trading.
Therefore it is intentionally excluded.
```

‏זו החלטת Architecture טובה יותר מאשר להכניס כל capability של Broker ל־Production Candidate Set.

---

# ‏מקורות לקביעה של Product Scope

- ‏`advanced-orders/review/02-PROFESSIONAL-DEPTH-MISSING-ADVANCED-ORDER-CONCEPTS.md`
- ‏IBKR — Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>

---

# ‏Checkpoint — סוף חלק 9A

‏הוספנו שכבת Product Scope מפורשת. `Pegged-to-Stock`, ‏`Relative + Market`, ‏`Trailing Relative + Market`, ‏`Market with Protection` ו־`Stop with Protection` מוכרות כ־Advanced Orders אמיתיות/רלוונטיות מקצועית, אבל אינן Candidates למנוע US Stocks הנוכחי. במקום `unsupported` גס, הן מקבלות `CONCEPT_RELEVANT_PRODUCT_OUT_OF_SCOPE`, עם reason code ו־Capability scope מפורשים.

# ‏חלק 9B — Engine Mapping & Candidate Registry: מ־Intent ל־Broker Materialization

> ‏הפרק הזה הוא שכבת החיבור בין ה־taxonomy של הקורס, ה־Capability Matrix של Part 9 וה־Decision Engine של Part 10. מטרתו אינה לבחור איזו Candidate "טובה יותר", אלא להגדיר באופן machine-readable **איך Candidate מותרת למנוע יכולה להפוך ל־Concrete Broker Order Plan** — ורק לאחר שכל שכבות ה־Capability וה־enablement עברו.

---

## ‏9B.1 הבעיה שה־Registry פותר

‏בלי שכבת mapping מפורשת קל מאוד להגיע לקוד מסוג:

```text
if order_type == "MIDPRICE": ...
if order_type == "ADAPTIVE": ...
if route == "SMART": ...
```

‏ואז Order Type, ‏Execution Mode, ‏Route ו־Broker Algo הופכים בפועל ל־enum שטוח אחד.

‏ה־contract הקנוני הוא:

```text
Trade Intent
→ Application Execution Mode
→ Behavior Candidate
→ Materialization Requirements
→ Capability Resolver
→ Concrete Broker Order Plan
```

> ‏`ENGINE RULE` — `Capability Resolver` רשאית להסיר Candidates שאינן כשירות. היא אינה רשאית לבחור את ה־winner מבין Candidates שנותרו.

---

## ‏9B.2 ארבע שכבות שאסור לאחד

```text
Application Execution Mode
Behavior Candidate
Broker Materialization
Capability / Enablement
```

‏לדוגמה:

```text
ApplicationExecutionMode = AGGRESSIVE_CAPPED
BehaviorCandidate        = MARKETABLE_LIMIT_IOC
BrokerPrimitive          = LMT
BrokerTIF                = IOC
RoutingPolicy            = SMART
```

‏כאן `LMT`, ‏`IOC` ו־`SMART` אינם Mode.

‏בדוגמה אחרת:

```text
ApplicationExecutionMode = BROKER_MANAGED
BehaviorCandidate        = ADAPTIVE_LIMIT_URGENT
BrokerPrimitive          = LMT
RoutingPolicy            = SMART
BrokerAlgo               = Adaptive
AlgoPriority             = Urgent
```

‏גם כאן `Adaptive` אינה Route ו־`SMART` אינה Algo.

---

## ‏9B.3 `Candidate Registry` הוא Contract, לא Ranking Table

‏Registry מתאר Candidate; הוא אינו נותן לה Score ואינו מצהיר שהיא עדיפה על Candidate אחרת.

```text
CandidateDefinition {
  candidate_id
  supported_purposes[]
  allowed_execution_modes[]
  research_role
  rollout_state

  materialization_requirements {
    base_broker_primitive
    allowed_broker_tif[]
    required_attributes[]
    optional_attributes[]
    routing_requirement
    destination_requirement
    broker_algo_requirement
    parameter_requirements[]
  }

  policy_requirements {
    economic_price_bound_required
    application_order_ttl_required
    local_validity_watchdog_required
    partial_fill_requires_fresh_decision
  }

  capability_requirements[]
  failure_destination_profile
  telemetry_profile
}
```

‏ה־Registry עונה:

```text
How can this behavior be materialized safely?
```

‏הוא אינו עונה:

```text
Which surviving behavior should win now?
```

---

## ‏9B.4 Capability Enablement ו־Candidate Rollout הם שני צירים נפרדים

‏Capability enablement נשארת בדיוק כפי שנקבע ב־Part 9:

```text
DOC_ONLY
RUNTIME_CONFIRMED
PAPER_ACCEPTED
LIVE_SMALL_ACCEPTED
PRODUCTION_ENABLED
```

‏Candidate rollout נשאר:

```text
DISABLED
SHADOW_ONLY
LIVE_ENABLED
```

‏אלה אינם אותו state machine.

‏דוגמה:

```text
capability.enablement_state = PRODUCTION_ENABLED
candidate.rollout_state     = SHADOW_ONLY
```

‏משמעותה:

```text
broker/path capability has enough evidence for production use
but our policy still evaluates this candidate without allowing live side effects
```

‏וההפך אינו חוקי ל־Live execution:

```text
candidate.rollout_state = LIVE_ENABLED
capability.enablement_state = PAPER_ACCEPTED
```

‏אינו נותן authorization למסחר חי.

> ‏`ENGINE INVARIANT` — Live materialization דורשת גם `candidate.rollout_state == LIVE_ENABLED` וגם שכל Capability requirement הרלוונטית תהיה `PRODUCTION_ENABLED` ב־scope המדויק.

---

## ‏9B.5 `SHADOW_ONLY` — Candidate קיימת בהחלטה, אבל לא ב־Side Effects

‏ב־Shadow המנוע רשאי:

```text
generate candidate
apply elimination gates
compute hypothetical materialization
record whether it would have won
measure expected/observed opportunity outcome
```

‏אבל אסור:

```text
submit broker order
modify live order because shadow candidate won
cancel live order solely to follow shadow candidate
change protection ownership
```

‏כך אפשר לחקור Candidate חדשה בלי לערבב research telemetry עם production authority.

---

## ‏9B.6 Mapping קנוני — Entry Behavior Candidates

| `Behavior Candidate` | `Application Execution Mode` | Broker primitive / mechanism | `TIF / Attribute` עיקרי | Routing / Algo requirement | הערת materialization |
|---|---|---|---|---|---|
| `PASSIVE_JOIN` | `PASSIVE` | `LMT` | בדרך כלל resting TIF; app TTL נפרד | SMART או Direct לפי capability | Limit במחיר passive שנבחר לפי placement policy |
| `PASSIVE_POST_ONLY` | `PASSIVE` | `LMT` | `POST_ONLY` / path-specific passive constraint | route-specific | Candidate נפסלת אם Post Only אינה `PRODUCTION_ENABLED` במסלול |
| `IMPROVE_ONE_TICK` | `PRICE_IMPROVING` | `LMT` | resting/short-lived לפי policy | SMART או Direct לפי capability | מחיר משופר אך לעולם לא מעבר ל־`Economic Price Bound` |
| `RELATIVE_PRIMARY` | `BROKER_MANAGED` | Relative / Pegged-to-Primary variant | broker/path-specific | SMART/Direct/ATS לפי capability | continuous external repricing; local TTL/cancel authority נשארת |
| `MIDPRICE` | `MIDPOINT_SEEKING` | broker-managed MidPrice mechanism | path-specific | `SMART` + MidPrice mechanism | Broker מנהל midpoint-oriented execution path |
| `SNAP_MIDPOINT` | `MIDPOINT_SEEKING` | Snap-to-Midpoint variant | Limit-like remainder לפי path | capability-specific | one-shot derived price; לא continuous peg |
| `PEGGED_MIDPOINT_DIRECT` | `MIDPOINT_SEEKING` | Pegged-to-Midpoint variant | path-specific | `DIRECT` + validated destination | destination היא חלק מ־Capability key |
| `ADAPTIVE_LIMIT_URGENT` | `BROKER_MANAGED` | `LMT` | broker TIF לפי plan | `SMART` + Adaptive/Urgent | Broker Algo מנהלת tactics; app TTL נשאר local |
| `ADAPTIVE_LIMIT_NORMAL` | `BROKER_MANAGED` | `LMT` | broker TIF לפי plan | `SMART` + Adaptive/Normal | אותו Algo family, Candidate policy שונה |
| `MARKETABLE_LIMIT_IOC` | `AGGRESSIVE_CAPPED` | `LMT` | `IOC` | SMART/Direct לפי capability | marketable behavior + hard `Economic Price Bound`; אינה primitive נפרדת |

> ‏`ENGINE RULE` — הטבלה היא mapping של **materialization requirements**, לא רשימת עדיפות ולא recommendation שה־Candidate מתאימה בכל מצב.

---

## ‏9B.7 Mapping של Research Challengers שנוספו ב־R3/R4

| Candidate / family | Mode / role | Materialization core | Requirement מרכזי | Rollout ברירת מחדל |
|---|---|---|---|---|
| `SWEEP_TO_FILL_LIMIT` | `AGGRESSIVE_CAPPED` challenger | Limit + Sweep-to-Fill behavior | SMART/path capability + Economic Price Bound | `SHADOW_ONLY` עד evidence |
| `MARKET_TO_LIMIT` | aggressive/transforming specialist | `MTL` transforming primitive | transformed remainder lifecycle + app TTL | `SHADOW_ONLY` |
| `DISCRETIONARY_LIMIT` | price-improving/liquidity specialist | Limit + discretionary executable range | exact route/API support + effective executable bound | `SHADOW_ONLY` |

‏ה־Registry יכולה להכיר Candidate גם כאשר היא אינה Live-enabled.

‏כך:

```text
known concept
!=
live production candidate
```

---

## ‏9B.8 Protection / Trigger / Composite אינם נדחסים ל־Entry Candidate Registry

‏משפחות כגון:

```text
Stop
Stop Limit
MIT
LIT
Trailing Stop
Bracket
OCA/OCO
Conditional
```

‏אינן כולן `Behavior Candidate` של Entry.

‏הן רשומות ב־Capability layer לפי הקטגוריה הקנונית שלהן:

```text
TRIGGER
TRANSFORMING ORDER
COMPOSITE STRUCTURE
COORDINATION RELATIONSHIP
PREDICATE POLICY
PROTECTION ARCHITECTURE
```

‏וה־Exit/Protection planner מחבר אותן ל־Concrete plans לפי Purpose ו־Ownership.

> ‏`ENGINE RULE` — לא מכניסים כל Broker feature ל־Candidate enum רק כדי שיהיה קל יותר לתכנת switch statement.

---

## ‏9B.9 `Capability Resolver` — Filter Pipeline בלבד

‏ה־Resolver מקבל Candidate + Context ומחזיר eligibility facts.

```text
CapabilityResolution {
  candidate_id
  eligible
  matched_capabilities[]
  unmet_capabilities[]
  elimination_reason_codes[]
  evidence_snapshot_ids[]
}
```

‏Pipeline טיפוסי:

```text
candidate known?
→ rollout state permits current environment?
→ product / contract scope matches?
→ adapter supports required materialization?
→ routing/destination requirement matches?
→ broker algo requirement matches?
→ TIF / attributes / parameter combination accepted?
→ session/account/legal-entity permissions match?
→ all required capabilities meet required enablement state?
→ eligible survivor
```

‏לאחר מכן Candidate חוזרת ל־Decision Engine להשוואה מול Survivors אחרים.

‏אסור ל־Resolver לבצע:

```text
eligible candidates = [A, B, C]
→ choose A because capability confidence is highest
```

‏Capability confidence יכולה להיות Gate או Evidence dimension; היא אינה execution objective.

---

## ‏9B.10 Production Gate — scope מדויק, לא feature name

‏הבדיקה אינה:

```text
is MIDPRICE production enabled?
```

‏אלא משהו בסגנון:

```text
is capability tuple for
MIDPRICE
+ US stock contract
+ selected adapter
+ SMART route
+ current session
+ current account/legal entity
+ required parameter combination
PRODUCTION_ENABLED?
```

‏כך נמנעת זליגה מסוכנת של enablement בין:

```text
paper → live
TWS API → Web API
SMART → Direct
regular session → overnight
one destination → another
one account/legal entity → another
```

---

## ‏9B.11 Mapping אינו One-to-One

‏אותה Broker primitive יכולה לממש Behaviors שונות.

```text
LMT
→ PASSIVE_JOIN
→ IMPROVE_ONE_TICK
→ MARKETABLE_LIMIT_IOC
→ ADAPTIVE_LIMIT_URGENT base primitive
```

‏ואותה semantic family יכולה לקבל materialization שונה לפי capability/path.

‏לכן אין function חוקית מסוג:

```text
ExecutionMode mapOrderTypeToMode(orderType)
```

‏ה־mapping צריך לקבל לפחות:

```text
purpose
behavior_candidate
market_state
policy
capability_resolution
```

‏וליצור `ConcreteOrderPlan` מפורש.

---

## ‏9B.12 `ConcreteOrderPlan` — הגבול לפני Adapter payload

```text
ConcreteOrderPlan {
  decision_id
  purpose
  application_execution_mode
  behavior_candidate

  quantity
  economic_price_bound
  application_order_ttl

  broker_primitive
  broker_tif
  attributes[]

  routing_plan
  broker_algo_plan

  capability_resolution_ids[]
  candidate_rollout_state
  failure_destination_profile
  reason_codes[]
}
```

‏ה־Adapter רשאי לתרגם Plan זה לשדות API קונקרטיים.

‏ה־Adapter אינו רשאי:

```text
change Behavior Candidate
widen Economic Price Bound
promote rollout state
replace SMART with Direct silently
add broker algo silently
turn rejection into a different aggressive order
```

‏שינויים כאלה חוזרים ל־Decision Engine.

---

## ‏9B.13 Reason Codes — Selection ו־Elimination נשמרים בנפרד

‏Reason Codes קנוניים בשכבה הזו מתחלקים לפחות ל־:

### ‏Eligibility / Capability

```text
CAPABILITY_NOT_PRODUCTION_ENABLED
CAPABILITY_SCOPE_MISMATCH
ROUTE_REQUIREMENT_UNMET
DESTINATION_REQUIREMENT_UNMET
BROKER_ALGO_REQUIREMENT_UNMET
TIF_REQUIREMENT_UNMET
ATTRIBUTE_REQUIREMENT_UNMET
PARAMETER_COMBINATION_UNVALIDATED
SESSION_SCOPE_MISMATCH
ACCOUNT_SCOPE_MISMATCH
ADAPTER_SCOPE_MISMATCH
```

### ‏Candidate rollout

```text
CANDIDATE_DISABLED
CANDIDATE_SHADOW_ONLY
CANDIDATE_NOT_ALLOWED_FOR_PURPOSE
```

### ‏Materialization

```text
MATERIALIZATION_UNRESOLVED
ECONOMIC_PRICE_BOUND_MISSING
APPLICATION_TTL_MISSING
LOCAL_WATCHDOG_REQUIRED
```

‏Reason Codes אלה מסבירים **למה Candidate אינה eligible**. הם אינם מחליפים את reason codes של selection economics ב־10A/10B/10C.

---

## ‏9B.14 Candidate Registry — example records

```text
CandidateDefinition {
  candidate_id = MARKETABLE_LIMIT_IOC
  supported_purposes = [ENTRY, EXIT]
  allowed_execution_modes = [AGGRESSIVE_CAPPED, NORMAL_EXIT, FAST_EXIT]
  research_role = CORE_BASELINE
  rollout_state = LIVE_ENABLED

  materialization_requirements = {
    base_broker_primitive = LMT
    allowed_broker_tif = [IOC]
    routing_requirement = ANY_VALIDATED
    broker_algo_requirement = NONE
  }

  policy_requirements = {
    economic_price_bound_required = true
    application_order_ttl_required = true
    local_validity_watchdog_required = true
    partial_fill_requires_fresh_decision = true
  }
}
```

‏ה־`LIVE_ENABLED` בדוגמה היא **schema example בלבד**, לא הצהרה שהחשבון או ה־adapter בפועל מאושרים כרגע. Live authorization עדיין תלויה ב־Capability tuples בזמן הריצה.

‏דוגמה נוספת:

```text
CandidateDefinition {
  candidate_id = PEGGED_MIDPOINT_DIRECT
  supported_purposes = [ENTRY, EXIT]
  allowed_execution_modes = [MIDPOINT_SEEKING]
  research_role = RESEARCH_CHALLENGER
  rollout_state = SHADOW_ONLY

  materialization_requirements = {
    routing_requirement = DIRECT
    destination_requirement = VALIDATED_DESTINATION
    broker_algo_requirement = NONE
  }
}
```

‏כאן Candidate יכולה להיות מוכרת ומחושבת במחקר, בלי יכולת ליצור Live side effect.

---

## ‏9B.15 Candidate Promotion אינה Capability Discovery

‏שני תהליכים נפרדים:

```text
Capability promotion:
DOC_ONLY
→ RUNTIME_CONFIRMED
→ PAPER_ACCEPTED
→ LIVE_SMALL_ACCEPTED
→ PRODUCTION_ENABLED
```

```text
Candidate rollout:
DISABLED
→ SHADOW_ONLY
→ LIVE_ENABLED
```

‏Promotion של Candidate דורשת policy/research decision משלנו.

‏Promotion של Capability דורשת evidence על Broker/API/path.

‏אף אחד מהם אינו גורר את השני אוטומטית.

---

## ‏9B.16 `CORE` אינו `LIVE_ENABLED`

‏Research role כגון:

```text
CORE_BASELINE
CORE_SAFETY
RESEARCH_CHALLENGER
REFERENCE_ONLY
```

‏מגדירה חשיבות למחקר/מימוש.

‏היא אינה authorization.

‏לכן חוקי לחלוטין:

```text
research_role = CORE_BASELINE
rollout_state = SHADOW_ONLY
```

‏בשלב מוקדם של adapter חדש.

‏ולעומת זאת Candidate `REFERENCE_ONLY` יכולה להיות Broker-supported, אך לא להשתתף כלל ב־production decision set.

---

## ‏9B.17 Deterministic Resolution

‏אותם Inputs צריכים להחזיר אותו eligibility result:

```text
same candidate definition
+ same capability snapshot
+ same product/contract
+ same adapter/route/session/account
+ same environment
= same capability resolution
```

‏אם Capability evidence משתנה בזמן אמת, נוצר snapshot חדש ו־Decision חדשה.

‏כך Replay יכול להסביר:

```text
Candidate X was eliminated
because requirement Y was not PRODUCTION_ENABLED
under capability snapshot Z
```

---

## ‏9B.18 Acceptance Tests

```text
1. Broker primitive is never treated as Application Execution Mode by itself.
2. Routing Policy is never treated as Broker Algo.
3. Broker Algo is never treated as Behavior Candidate without an explicit candidate definition.
4. MARKETABLE_LIMIT_IOC materializes through LMT + IOC and is never modeled as a separate broker primitive.
5. Candidate Registry describes materialization and policy requirements; it never ranks survivors.
6. Capability Resolver can eliminate candidates but cannot select the winner.
7. Live side effects require candidate rollout LIVE_ENABLED plus all required capability tuples PRODUCTION_ENABLED.
8. SHADOW_ONLY may be evaluated and logged but cannot cause broker side effects.
9. Capability enablement and candidate rollout remain separate state machines.
10. Route/destination constraints are part of capability identity when they change semantics.
11. Adapter cannot silently change Behavior Candidate, Routing Policy, Broker Algo or Economic Price Bound.
12. One broker primitive may map to multiple Behavior Candidates without ambiguity because candidate identity is explicit.
13. Every eliminated candidate receives a machine-readable reason code.
14. Same definitions + same capability snapshot + same scope yield deterministic eligibility.
15. Product-specific out-of-scope capabilities never enter the live candidate set merely because broker documentation lists them.
```

---

## ‏9B.19 Practitioner / Engine takeaway

> ‏`ENGINE RULE` — Broker capabilities answer **what can be expressed on this path**. Decision policy answers **what behavior we want now**. Candidate Registry is the contract that connects the two without letting either layer impersonate the other.

‏הדרך לזכור:

```text
Decision Engine chooses behavior.
Candidate Registry defines how behavior may be materialized.
Capability Resolver removes impossible / unauthorized materializations.
Adapter serializes the already-approved plan.
```

‏אם Candidate אינה ניתנת ל־materialization כרגע, התוצאה היא elimination + reason code — לא hidden fallback ל־Order אחרת.

---

# ‏Checkpoint — סוף חלק 9B

‏נוצר mapping קנוני מ־`Application Execution Mode` ו־`Behavior Candidate` אל Broker Primitive, ‏TIF/Attributes, ‏Routing ו־Broker Algo, עם `Candidate Registry` מפורש. Capability Enablement הופרדה מ־Candidate Rollout; ‏`SHADOW_ONLY` הוגדרה ללא Side Effects; וה־Capability Resolver הוגדרה כ־Filter בלבד. בכך נסגר הבסיס ל־R5 בלי להפוך Broker support או research priority ל־winner selector.

# ‏חלק 9C — Failure Destinations & Outcome Contracts: מ־Outcome ל־Fresh Decision

> ‏הפרק הזה משלים את `09B-ENGINE-MAPPING-AND-CANDIDATE-REGISTRY.md`. ‏`09B` מגדיר איך `Behavior Candidate` יכולה להפוך ל־Concrete Broker Order Plan; ‏`09C` מגדיר מה המנוע עושה כאשר הביצוע אינו מסתיים ב־clean full fill. המטרה היא למנוע Retry אוטומטי, fallback סמוי או ערבוב בין execution outcome, capability failure ו־state uncertainty.

---

## ‏9C.1 Outcome אינו Action

‏אירועים כגון:

```text
NO_FILL
PARTIAL
REJECT
UNKNOWN
STALE
```

‏אינם הוראות:

```text
retry
fallback
escalate
cancel
```

‏הם facts/observations שמייצרים **fresh Decision Context**.

> ‏`ENGINE RULE` — שום execution outcome אינו authorizes side effect חדש לבדו. כל side effect חדש חייב לעבור Decision חדשה עם state מעודכן.

---

## ‏9C.2 Outcome Contract קנוני

```text
ExecutionOutcome {
  outcome_class
  purpose                 // ENTRY | EXIT | PROTECTION | RECOVERY
  candidate_id
  execution_mode
  order_identity
  observed_at

  requested_qty
  filled_qty
  remaining_qty
  average_fill_price

  lifecycle_state
  epistemic_uncertainty
  broker_reason
  normalized_reason_code

  reconciled_position
  potentially_executable_qty
  signal_validity
  market_freshness

  failure_destination
  requires_fresh_decision
}
```

‏ה־Outcome Record מתאר מה קרה. ה־Decision Engine מחליטה מה לעשות בעקבותיו.

---

## ‏9C.3 חמש מחלקות Outcome מרכזיות

### ‏`NO_FILL`

```text
accepted / attempted
filled_qty = 0
no evidence of execution
```

‏`NO_FILL` אינה Capability failure כשלעצמה.

‏היא יכולה לנבוע למשל מ־:

```text
price not reached
liquidity disappeared
queue not reached
IOC found no acceptable executable liquidity
midpoint behavior did not match
application TTL expired before useful fill
```

### ‏`PARTIAL`

```text
0 < filled_qty < requested_qty
```

‏זו אינה "חצי הצלחה" בלבד. היא משנה Position Truth ולכן תמיד יוצרת Decision State חדשה.

### ‏`REJECT`

‏Broker/venue לא קיבלו את ה־Concrete Order Plan או חלק מה־materialization.

‏צריך לסווג את ה־reject, לא רק לשמור טקסט שגיאה.

### ‏`UNKNOWN`

‏אין לנו evidence מספיק לדעת מה executable כרגע או האם command מסוים נכנס לתוקף.

‏דוגמאות:

```text
SUBMIT_UNKNOWN
MODIFY_UNKNOWN
CANCEL_UNKNOWN
STATE_INCONSISTENT
```

### ‏`STALE`

‏ה־Order או ה־Intent עדיין עשויים להיות executable מבחינה טכנית, אבל ה־assumptions שהצדיקו אותם כבר אינן תקפות.

```text
signal expired
market snapshot stale
Economic Price Bound recomputed
application_order_ttl expired
candidate policy no longer valid
```

---

## ‏9C.4 Canonical Failure Destinations

‏נשתמש ב־destinations ברמת מנוע, לא ב־Broker-specific retry strings:

```text
REDECIDE_ENTRY
REDECIDE_EXIT
RECONCILE_ORDER
RECONCILE_POSITION
RECONCILE_ORDER_AND_POSITION
REFRESH_CAPABILITY
CANCEL_AND_RECONCILE
PROTECTION_REVIEW
RECOVERY_RECONCILIATION
NO_NEW_SIDE_EFFECT
```

‏ה־destination אינה אומרת מה ה־winner הבא. היא אומרת **איזה truth צריך לרכוש ואיזה decision domain צריך להפעיל מחדש**.

---

## ‏9C.5 `NO_FILL` Contract

### ‏Entry

```text
NO_FILL
→ verify order terminal / non-executable as required
→ refresh market + signal
→ REDECIDE_ENTRY
```

‏תוצאה אפשרית של ה־fresh decision:

```text
NO_TRADE
DEFER
NO_ACTION
select another surviving candidate
```

‏אין automatic aggression.

### ‏Exit

```text
NO_FILL
→ reconciled_position still exists
→ refresh market + risk + protection
→ REDECIDE_EXIT
```

‏`NO_FILL` ביציאה לעולם אינה `FLAT_CONFIRMED`.

### ‏Reason Codes אופייניים

```text
EXEC_NO_FILL_PRICE_NOT_REACHED
EXEC_NO_FILL_NO_ACCEPTABLE_LIQUIDITY
EXEC_NO_FILL_QUEUE_NOT_REACHED
EXEC_NO_FILL_IOC_ZERO
EXEC_NO_FILL_TTL_EXPIRED
```

---

## ‏9C.6 `PARTIAL` Contract

```text
PARTIAL
→ ingest executions
→ update execution_ledger_position
→ compare broker_reported_position
→ derive reconciled_position
→ recompute potentially executable exposure
→ verify protection
→ fresh decision
```

### ‏Entry Partial

```text
PARTIAL_ENTRY
→ position now exists
→ PROTECTION_REVIEW
→ REDECIDE_ENTRY for any remaining intent
```

‏אסור:

```text
remaining_qty
→ blindly resend old candidate
```

### ‏Exit Partial

```text
PARTIAL_EXIT
→ residual position remains
→ RECONCILE_POSITION
→ REDECIDE_EXIT
```

### ‏Reason Codes

```text
EXEC_PARTIAL_USEFUL
EXEC_PARTIAL_BELOW_MIN_USEFUL
EXEC_PARTIAL_REMAINDER_CANCELLED
EXEC_PARTIAL_REMAINDER_WORKING
EXEC_PARTIAL_POSITION_MISMATCH
```

> ‏`ENGINE RULE` — `PARTIAL` תמיד מחייבת quantity truth חדשה לפני Side Effect נוסף.

---

## ‏9C.7 `REJECT` Contract

‏Reject דורשת classification לפני החלטה על candidate אחרת.

```text
REJECT
→ classify reason
→ decide whether failure is:
   materialization-specific
   capability-specific
   parameter-specific
   account/session-specific
   transient infrastructure
   semantic/policy bug
→ update evidence
→ fresh decision
```

### ‏Capability-related reject

‏לדוגמה:

```text
CAPABILITY_ROUTE_UNAVAILABLE
CAPABILITY_PARAMETER_COMBINATION_REJECTED
CAPABILITY_ORDER_TYPE_UNAVAILABLE
CAPABILITY_SESSION_UNAVAILABLE
CAPABILITY_PERMISSION_UNAVAILABLE
```

‏יכולה להוריד/להשהות את capability tuple המתאימה, אך לא להשבית אוטומטית family שלמה בכל scope.

### ‏Materialization/policy reject

```text
MATERIALIZATION_INVALID_COMBINATION
MATERIALIZATION_BOUND_INVALID
MATERIALIZATION_TIF_INVALID
MATERIALIZATION_ATTRIBUTE_CONFLICT
```

‏עשויה להצביע על bug ב־adapter/registry ולא על Broker capability חסרה.

### ‏Infrastructure reject/failure

```text
BROKER_TRANSPORT_FAILURE
BROKER_RATE_OR_SESSION_FAILURE
BROKER_TEMPORARY_UNAVAILABLE
```

‏אינה evidence שה־Behavior עצמה גרועה.

> ‏`ENGINE RULE` — `REJECT` יכולה לשנות Capability Evidence; ‏`NO_FILL` בדרך כלל אינה עושה זאת.

---

## ‏9C.8 `UNKNOWN` Contract

‏כאשר outcome אינה ידועה, אסור לבחור fallback אגרסיבי כדי "לא להיתקע".

```text
UNKNOWN
→ preserve every non-terminal order as POTENTIALLY_EXECUTABLE
→ block risk-increasing side effects unless explicitly bounded by safety policy
→ acquire broker evidence
→ RECONCILE_ORDER_AND_POSITION
→ fresh decision
```

‏Reason Codes:

```text
STATE_SUBMIT_UNKNOWN
STATE_MODIFY_UNKNOWN
STATE_CANCEL_UNKNOWN
STATE_BROKER_LOCAL_MISMATCH
STATE_EXECUTION_RECONCILIATION_INCOMPLETE
STATE_POSITION_RECONCILIATION_INCOMPLETE
```

‏`UNKNOWN` היא epistemic state, לא execution mode ולא reject.

---

## ‏9C.9 `STALE` Contract

‏Stale אומרת שה־Order יכולה להיות technically valid אבל business intent כבר אינו מספיק טרי.

```text
STALE
→ do not widen Economic Price Bound
→ do not continue automatic retry ladder
→ cancel when cancellation is required by policy
→ reconcile possible late effects
→ fresh decision
```

‏Reason Codes:

```text
STALE_SIGNAL_EXPIRED
STALE_APPLICATION_TTL_EXPIRED
STALE_MARKET_SNAPSHOT
STALE_ECONOMIC_BOUND_CHANGED
STALE_EXECUTION_INTENT_SUPERSEDED
STALE_PROTECTION_ASSUMPTION_CHANGED
```

‏Broker-managed repricing אינה פוטרת מ־stale handling: ה־Broker יכולה להמשיך לבצע rule תקפה מבחינתה בזמן שה־local intent כבר מתה.

---

## ‏9C.10 Failure Destination לפי `Application Execution Mode`

| Mode | `NO_FILL` | `PARTIAL` | `REJECT` | `UNKNOWN` | `STALE` |
|---|---|---|---|---|---|
| `PASSIVE` | ‏fresh Entry/Exit decision; waiting אינה automatic retry | ‏reconcile position + fresh decision | ‏classify capability/materialization | ‏reconcile order/position | ‏cancel/reconcile ואז fresh decision |
| `PRICE_IMPROVING` | ‏re-evaluate whether concession still justified | ‏reconcile + recompute remaining economics | ‏classify price/attribute/path failure | ‏freeze new risk + reconcile | ‏cancel/reconcile; old improvement thesis אינה authority |
| `MIDPOINT_SEEKING` | ‏re-evaluate time cost vs price improvement | ‏reconcile + fresh position decision | ‏classify SMART/direct midpoint capability | ‏reconcile external working state | ‏cancel/reconcile; midpoint rule אינה strategy authority |
| `BROKER_MANAGED` | ‏fresh decision; Broker Algo אינה auto-restart | ‏reconcile + fresh decision | ‏classify algo/path/parameter capability | ‏reconcile Broker-managed state | ‏cancel/reconcile local stale intent |
| `AGGRESSIVE_CAPPED` | ‏fresh decision; no automatic wider cap | ‏reconcile before next aggressive attempt | ‏classify route/TIF/price/materialization failure | ‏freeze/reconcile before new aggression | ‏cancel/reconcile; recompute bound |
| `NORMAL_EXIT` | ‏residual position risk review | ‏reconcile residual position | ‏classify then fresh exit decision | ‏position/order reconciliation | ‏fresh exit decision |
| `FAST_EXIT` | ‏fresh risk decision; may change mode only by policy | ‏reconcile residual exposure immediately | ‏classify quickly; protection remains relevant | ‏block blind retry; reconcile | ‏fresh fast/emergency decision |
| `EMERGENCY_REDUCE` | ‏fresh emergency decision from current risk facts | ‏recompute residual position immediately | ‏classify failure without assuming same path again | ‏safety/recovery reconciliation | ‏refresh risk facts; no stale emergency ladder |

> ‏`ENGINE RULE` — Failure Destination היא contract של Mode/Purpose; היא אינה hard-coded "next order type".

---

## ‏9C.11 Fallback ו־Escalation אינם Failure Destinations

‏נפריד:

```text
Failure Destination
= where control returns after an outcome

Fallback
= alternative materialization/candidate considered after fresh decision because a path is unavailable/invalid

Escalation
= fresh decision increases urgency/aggression because market/risk state changed
```

‏לכן אסור:

```text
REJECT MIDPRICE
→ submit MARKETABLE_LIMIT_IOC
```

‏בלי:

```text
classify reject
refresh capability/state
run fresh decision
```

---

## ‏9C.12 Canonical Reason-Code Namespaces

‏Reason code צריכה לתאר **למה**, בעוד disposition/destination מתארות **מה עושים עכשיו**.

```text
ELIM_*          candidate eliminated before materialization
CAPABILITY_*    capability/enablement/scope problem
MATERIALIZATION_* concrete plan construction/validation problem
EXEC_*          observed execution outcome
STATE_*         epistemic/reconciliation problem
STALE_*         intent/data/time freshness problem
RISK_*          position/protection/risk constraint
SYSTEM_*        operating-mode / infrastructure constraint
```

‏דוגמאות:

```text
ELIM_SIGNAL_TOO_OLD
ELIM_ECONOMIC_BOUND_UNREACHABLE
ELIM_EXIT_FEASIBILITY_INSUFFICIENT

CAPABILITY_NOT_PRODUCTION_ENABLED
CAPABILITY_ROUTE_SCOPE_MISMATCH
CAPABILITY_SESSION_UNAVAILABLE

MATERIALIZATION_REQUIRED_ATTRIBUTE_UNAVAILABLE
MATERIALIZATION_INVALID_PARAMETER_COMBINATION

EXEC_NO_FILL_IOC_ZERO
EXEC_PARTIAL_USEFUL
EXEC_REJECTED_BY_BROKER

STATE_CANCEL_UNKNOWN
STATE_POSITION_MISMATCH

STALE_APPLICATION_TTL_EXPIRED
STALE_SIGNAL_EXPIRED

RISK_WORST_CASE_EXPOSURE_EXCEEDED
RISK_PROTECTION_INSUFFICIENT

SYSTEM_NOT_READY
SYSTEM_RECOVERING
```

---

## ‏9C.13 Selection Reason Codes נפרדים מ־Elimination Reason Codes

‏ל־winner נרשום reason שמסביר **למה survivor הזה נבחר**:

```text
SELECT_PASSIVE_PRICE_IMPROVEMENT_WORTH_WAIT
SELECT_POST_ONLY_PASSIVE_CONSTRAINT_REQUIRED
SELECT_MIDPOINT_SPREAD_SAVING_WORTH_TIME
SELECT_BROKER_MANAGED_REPRICING_PREFERRED
SELECT_AGGRESSIVE_SHORT_SIGNAL_LIFE
SELECT_FAST_EXIT_RISK_REDUCTION_PRIORITY
SELECT_EMERGENCY_REDUCE_HARD_RISK_STATE
```

‏ול־Candidate שנפסלה:

```text
ELIM_CAPABILITY_DISABLED
ELIM_ROLLOUT_NOT_LIVE
ELIM_TTL_TOO_SHORT
ELIM_BOUND_INCOMPATIBLE
ELIM_ROUTE_UNAVAILABLE
ELIM_PARTIAL_FILL_NOT_USEFUL
ELIM_EXIT_FEASIBILITY_INSUFFICIENT
```

> ‏`ENGINE RULE` — Reason code אינה score. היא audit explanation ל־elimination/selection שכבר בוצעה לפי Policy.

---

## ‏9C.14 Broker Error Code אינו Reason Code קנוני

‏נשמור את ה־raw Broker code/message בנפרד:

```text
broker_error_code
broker_error_message
```

‏ונמפה אותו ל־:

```text
normalized_reason_code
failure_destination
capability_evidence_effect
```

‏כך שינוי ב־Broker wording אינו משנה את semantic contract של המנוע.

---

## ‏9C.15 `CapabilityEvidenceEffect`

‏Outcome יכולה להשפיע על Capability Evidence בדרכים שונות:

```text
NONE
POSITIVE_RUNTIME_EVIDENCE
NEGATIVE_SCOPE_EVIDENCE
PARAMETER_COMBINATION_REJECTED
TEMPORARY_INFRASTRUCTURE_ONLY
REQUIRES_MANUAL_REVIEW
```

‏דוגמאות:

```text
NO_FILL
→ normally NONE

accepted working order
→ POSITIVE_RUNTIME_EVIDENCE

route-specific rejection
→ NEGATIVE_SCOPE_EVIDENCE or PARAMETER_COMBINATION_REJECTED

socket failure
→ TEMPORARY_INFRASTRUCTURE_ONLY
```

‏כך `Capability Resolver` אינה "לומדת" בטעות מ־market outcome.

---

## ‏9C.16 Candidate Rollout Failure Policy

### ‏`DISABLED`

‏אינה נוצרת כלל כ־live candidate.

### ‏`SHADOW_ONLY`

‏Outcome היא hypothetical/replay observation בלבד; אין Broker side effect שנוצר בשם Candidate זו.

### ‏`LIVE_ENABLED`

‏יכולה materialize רק אם capability requirements הן `PRODUCTION_ENABLED`.

‏לאחר repeated semantic rejection אפשר להעביר Candidate ל־:

```text
LIVE_ENABLED
→ SHADOW_ONLY
```

‏או:

```text
→ DISABLED
```

‏אבל transition כזה הוא governance/policy decision, לא callback יחיד אוטומטי.

---

## ‏9C.17 Purpose-Aware Destination

‏אותו Outcome מקבל destination שונה לפי Purpose.

### ‏`ENTRY + NO_FILL`

```text
REDECIDE_ENTRY
possibly NO_TRADE
```

### ‏`EXIT + NO_FILL`

```text
REDECIDE_EXIT
residual position still exists
```

### ‏`PROTECTION + REJECT`

```text
PROTECTION_REVIEW
risk severity elevated
```

### ‏`RECOVERY + UNKNOWN`

```text
RECOVERY_RECONCILIATION
READY prohibited until invariants pass
```

‏לכן key של policy צריך לכלול לפחות:

```text
purpose + outcome_class + uncertainty + position/protection state
```

---

## ‏9C.18 Retry Budget אינו Retry Loop

‏אפשר להגדיר budgets כגון:

```text
max_attempts_per_decision_window
max_cancel_replace_count
max_cumulative_price_concession
max_broker_algo_restarts
```

‏אבל כל attempt עדיין מחייב fresh facts.

```text
budget remaining
!=
authorization to repeat stale plan
```

‏Budget היא upper bound על side effects; היא אינה control loop בפני עצמה.

---

## ‏9C.19 Telemetry Contract

```text
outcome_class
purpose
execution_mode
candidate_id
order_internal_id
broker_order_id
perm_id
normalized_reason_code
broker_error_code
failure_destination
capability_evidence_effect
filled_qty
remaining_qty
reconciled_position_before
reconciled_position_after
potentially_executable_qty
signal_age_ms
application_order_age_ms
working_order_age_ms
market_snapshot_age_ms
capability_enablement_state
candidate_rollout_state
redecision_id
```

‏כך אפשר לשאול:

```text
Which candidates fail because of market no-fill?
Which fail because of capability/materialization?
Which outcomes create UNKNOWN states?
How often partial fills improve or worsen final execution?
How often fallback follows a true capability failure versus mere no-fill?
```

---

## ‏9C.20 Acceptance Tests

```text
1. NO_FILL never disables a capability by itself.
2. REJECT is classified before any fallback candidate is materialized.
3. PARTIAL always updates execution/position truth before the next side effect.
4. ENTRY + NO_FILL may end in NO_TRADE.
5. EXIT + NO_FILL never implies FLAT_CONFIRMED while reconciled_position != 0.
6. UNKNOWN never triggers blind retry or blind escalation.
7. Every non-terminal order remains in potentially executable exposure during UNKNOWN.
8. STALE never widens Economic Price Bound automatically.
9. Broker-managed repricing remains cancellable/reconcilable when local intent becomes stale.
10. Failure destination never names a specific next Broker Order Type.
11. Fallback requires a fresh decision after capability/materialization failure.
12. Escalation requires fresh market/risk facts, not merely elapsed time.
13. Raw broker error and normalized reason code are stored separately.
14. Capability evidence changes only when the outcome actually carries capability evidence.
15. SHADOW_ONLY never produces broker side effects.
16. LIVE_ENABLED alone is insufficient without PRODUCTION_ENABLED capabilities.
17. Same facts + same policy + same purpose yield the same normalized outcome and destination.
```

---

## ‏9C.21 Practitioner Rule

‏הדרך הקצרה לזכור:

```text
NO_FILL
= market/execution outcome

REJECT
= acceptance/materialization outcome

PARTIAL
= new position state

UNKNOWN
= missing truth

STALE
= old intent no longer authorized
```

‏ולכל אחד מהם:

```text
observe
→ normalize reason
→ reconcile what changed
→ return to the correct decision domain
```

‏לא:

```text
observe failure
→ send a more aggressive order
```

---

# ‏Checkpoint — סוף חלק 9C

‏הוגדר contract אחיד ל־`NO_FILL`, ‏`PARTIAL`, ‏`REJECT`, ‏`UNKNOWN` ו־`STALE`; נוספו Failure Destinations purpose-aware, ‏Reason-Code namespaces, ‏Capability Evidence effects ו־Acceptance Tests. ‏Outcome אינה Retry command, ‏Capability failure אינה Market no-fill, ו־fresh Decision נשארת השער היחיד לכל Side Effect חדש.

# ‏חלק 10 — Engine Decision Guide

## ‏10A — Decision Inputs ו־Elimination Gates

> ‏לפי ה־taxonomy הקנונית ב־`00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md`, חלק 10A אינו בוחר Broker Order. הוא קובע אם פעולה מותרת, אילו constraints חלים עליה, ואילו Behavior Candidates רשאים בכלל להגיע לשלב הבחירה של 10B.

---

## ‏10A.1 המנוע לא מתחיל מ־Order Type

‏השאלה הראשונה אינה:

```text
Which order type should I send?
```

‏אלא:

```text
Is execution allowed at all?
What constraints must any execution obey?
Which behaviors remain legal after those constraints?
```

‏סדר העבודה הקנוני הוא:

```text
observe
→ validate
→ eliminate
→ derive boundaries
→ generate candidates
→ choose behavior
→ materialize concrete broker order
```

> ‏`ENGINE RULE` — Broker Order Primitive הוא כמעט סוף התהליך, לא תחילתו.

---

## ‏10A.2 אין `Master Score` שמבטל Safety Gates

‏Safety, truth ו־eligibility אינם נקודות שאפשר לפצות עליהן באמצעות Signal חזק.

‏לא נרצה:

```text
strong momentum +10
stale quote -4
broker unreconciled -5
final score = +1
=> BUY
```

‏אלא:

```text
if broker state is unreconciled:
    NEW_ENTRY = FORBIDDEN
```

‏Scores יכולים לשמש למחקר או ל־ranking בתוך קבוצת survivors, אבל לא לעקוף hard gates.

---

## ‏10A.3 תוצאת Decision אינה רק `BUY / NO BUY`

‏נשתמש ב־dispositions מובחנים:

```text
ALLOW_ENTRY
NO_TRADE
DEFER
EXIT_ONLY
CANCEL_EXISTING
NO_ACTION
```

### ‏`ALLOW_ENTRY`

‏מותר ליצור Entry חדשה בתוך constraints שהוחזרו.

### ‏`NO_TRADE`

‏Opportunity שנבחנה אינה עומדת כעת בדרישות Entry. זו מסקנה מקצועית מלאה, לא error.

### ‏`DEFER`

‏אין מספיק certainty זמנית לקבל החלטה סופית; מחכים ל־event או snapshot חדש ואז מריצים Decision חדשה.

### ‏`EXIT_ONLY`

‏אסור להגדיל Risk, אבל פעולות שמקטינות Exposure או משקמות Protection עדיין מותרות.

### ‏`CANCEL_EXISTING`

‏Entry קיימת כבר אינה תקפה וצריך לבקש את ביטולה; אין implication שחייבים ליצור replacement.

### ‏`NO_ACTION`

‏ה־Decision הסתיימה ואין side effect חדש לבצע במחזור הזה. זה אינו synonym ל־`NO_TRADE`: ייתכן שכבר קיימת Order תקפה שצריך פשוט להשאיר כפי שהיא.

> ‏`ENGINE RULE` — `NO_TRADE`, ‏`DEFER` ו־`NO_ACTION` מתארים מצבים שונים ואסור להשתמש בהם כאותו enum value.

---

## ‏10A.4 `DecisionResult` מחזיר Constraints, לא Broker Payload

```text
DecisionResult {
  disposition
  purpose
  elimination_reasons
  allowed_behavior_candidates
  forbidden_behavior_candidates

  max_qty
  economic_price_bound
  max_application_order_ttl_ms
  max_signal_age_ms

  partial_fill_policy
  protection_requirement
  capability_requirements
  reevaluate_at
}
```

‏`economic_price_bound` הוא המונח הקנוני. ב־Entry אפשר לממש אותו כ־`entry_max_price`; ב־Exit כ־`exit_min_price` או boundary מתאים לכיוון הפעולה.

‏לא נשתמש במקביל ב־`hard_cap`, ‏`hard_price_boundary`, ‏`max_price` ו־`economic cap` כאילו הם מושגים שונים.

---

## ‏10A.5 שש משפחות State שהחלטה חייבת לראות

```text
1. SIGNAL STATE
2. MARKET STATE
3. EXECUTION / ORDER STATE
4. POSITION / RISK STATE
5. CAPABILITY STATE
6. SYSTEM HEALTH STATE
```

‏כל אחת מהן יכולה לפסול Entry לבדה.

---

## ‏10A.6 `SignalState`

```text
SignalState {
  signal_id
  side
  created_at
  expires_at
  validity
  urgency
  expected_gross_edge_bps
  expected_holding_ms
  target_qty
  max_position_qty
  partial_fill_tolerance
  reversal_state
  source_data_version
}
```

‏Execution אינה אמורה להמציא Signal מחדש מתוך עשרות indicators. היא מקבלת Contract סמנטי מה־Strategy.

---

## ‏10A.7 `Signal validity`, ‏Age ו־Urgency הם dimensions נפרדים

‏`validity` יכולה להיות למשל:

```text
VALID
WEAKENING
INVALIDATED
EXPIRED
UNKNOWN
```

‏ונחשב:

```text
signal_age_ms = decision_ts - signal_created_ts
remaining_signal_life_ms = signal_expires_at - decision_ts
```

‏Urgency אינה Signal Strength. Signal חזקה יכולה להיות לא דחופה; Signal בינונית יכולה להיות דחופה משום שכמעט לא נשארו לה חיים.

---

## ‏10A.8 ארבעה clocks שאסור לערבב

‏הקורס משתמש בארבעה מושגים שונים:

```text
signal_ttl
application_order_ttl
broker_tif
working_order_age
```

### ‏`signal_ttl`

‏כמה זמן ה־Signal עצמו תקף.

### ‏`application_order_ttl`

‏כמה זמן האפליקציה מוכנה להשאיר Order מסוימת או behavior מסוים בחיים לפני re-decision.

### ‏`broker_tif`

‏`DAY`, ‏`IOC`, ‏`GTC`, ‏`GTD` וכדומה — semantics שמועברות ל־Broker/Venue.

### ‏`working_order_age`

‏כמה זמן Order מסוימת עובדת בפועל מאז submit/ack הרלוונטיים.

> ‏`ENGINE RULE` — `application_order_ttl` אינה `broker_tif`, ו־Order יכולה להיות חוקית לפי TIF אך stale לפי ה־Signal או לפי TTL האפליקטיבי.

---

## ‏10A.9 Momentum features נשארות ב־Strategy

‏Execution יכולה לקבל summary כגון:

```text
last_change_10s
last_change_30s
last_change_60s
last_change_120s
recent_up_sequence
trade_count_10s
trade_count_30s
time_since_last_trade
quote_velocity
reversal_detected
```

‏אבל השימוש הוא להבין validity, decay ו־execution feasibility — לא להחליף את Scanner/Strategy.

---

## ‏10A.10 `Expected Edge` חייב להיות Executable Edge

```text
expected_net_edge =
    expected_gross_move
  - expected_entry_cost
  - expected_exit_cost
  - commissions
  - venue_fees
  - slippage_allowance
  - safety_margin
```

‏אם אין net edge מספק תחת assumptions סבירות לביצוע, Entry נפסלת לפני בחירת Behavior Candidate.

---

## ‏10A.11 `Expected Entry Cost` אינו רק Spread

```text
spread_component
expected_slippage
expected_depth_cost
expected_fee_component
expected_adverse_selection
missed_opportunity_cost_when_relevant
```

‏Passive ואגרסיבי מחלקים את העלויות אחרת. 10A אינה בוחרת מי עדיף; היא רק קובעת את הגבולות שבתוכם בחירה כזו יכולה להיות חוקית.

---

## ‏10A.12 `Exit Feasibility` נבדקת לפני Entry

‏לפני Entry שואלים:

```text
If we get filled now,
can we plausibly reduce or exit the resulting position
within the required risk / holding horizon?
```

‏נבדוק לפחות:

```text
current exit-side depth
spread
recent trade activity
short-horizon liquidity stability
expected exit cost
position size relative to executable liquidity
protection capability
```

‏Entry קלה אינה מספיקה אם Exit צפויה להיות בלתי סבירה.

---

## ‏10A.13 `MarketState`

```text
MarketState {
  market_ts
  bid
  bid_size
  ask
  ask_size
  midpoint
  spread_abs
  spread_bps
  last
  last_size
  last_trade_ts
  quote_ts
  visible_depth_within_entry_bound
  visible_depth_within_exit_bound
  short_horizon_volatility
  quote_velocity
  trade_activity
  session
  halt_state
}
```

‏Top of Book לבדה אינה מספקת לכל החלטה, אך לא נדרוש Data שאינה זמינה בלי להגדיר Missing Data Policy מפורשת.

---

## ‏10A.14 לכל Fact יש Value וגם Freshness

‏לדוגמה:

```text
ask = 20.00
quote_ts = ...
quote_age_ms = ...
```

‏אותו עיקרון חל על Signal, Position, Open Orders, Capabilities ו־Account/System state.

---

## ‏10A.15 `Data Freshness Gate`

```text
if quote_age_ms > max_quote_age_ms:
    deny new entry
```

‏המספרים הם config/versioned research parameters.

> ‏`ENGINE RULE` — Market Data ישנה אינה סיבה לבחור Order אגרסיבית יותר.

---

## ‏10A.16 Freshness תלויה ב־regime

‏Threshold יכול להשתנות לפי:

```text
symbol activity regime
quote update rate
trade rate
volatility
session
```

‏ב־V1 אפשר להשתמש ב־conservative limits קבועים, אבל יש לסמן אותם `POLICY DEFAULT`, לא Fact אוניברסלי.

---

## ‏10A.17 `Spread Gate` היא Gate כלכלית

```text
spread_bps <= allowed_spread_bps?
spread_cost <= allowed_fraction_of_edge?
```

‏Spread רחבה אינה אוטומטית `NO_TRADE`: היא יכולה להפוך midpoint/passive behavior לרלוונטי יותר.

‏השאלה הקנונית היא:

```text
Can any allowed behavior preserve required net edge
inside the Economic Price Bound?
```

---

## ‏10A.18 `Depth Feasibility Gate`

```text
requested_qty
visible_qty_within_economic_bound
visible_qty_at_best
requested_qty / visible_qty_within_economic_bound
```

‏תוצאות אפשריות:

```text
PASS
REDUCE_SIZE
NO_TRADE
```

‏מה שלא עושים הוא להרחיב `Economic Price Bound` אוטומטית רק כדי להשיג Fill.

---

## ‏10A.19 Size היא Decision, לא רק Budget

```text
capital_based_qty
risk_based_qty
liquidity_based_qty
strategy_max_qty
position_limit_qty
exit_feasible_qty
```

```text
max_allowed_qty = min(all applicable bounds)
```

---

## ‏10A.20 `Volatility / Market-State / Session Gates`

‏Volatility גבוהה אינה בהכרח פסילה, אבל היא משנה execution risk.

‏נבדוק למשל:

```text
short_horizon_range
quote_jump_size
recent_gap_ticks
spread_instability
depth_instability
```

‏Market state יכול להיות:

```text
NORMAL_CONTINUOUS
PRE_OPEN
AUCTION
HALTED
RESUMING
UNKNOWN
```

‏ו־Session יכולה להיות:

```text
REGULAR
PRE_MARKET
AFTER_HOURS
OVERNIGHT
```

‏רק states/sessions שה־Policy וה־Capability Matrix מכירות נכנסות למסלול הרגיל.

---

## ‏10A.21 `PositionState` משתמשת ב־Position Truth הקנונית

```text
PositionState {
  symbol
  side
  execution_ledger_position
  broker_reported_position
  reconciled_position
  avg_price
  protection_state
  exit_state
  externally_changed
  last_reconciled_at
}
```

> ‏`ENGINE RULE` — Decision שמגדילה Risk נשענת על `reconciled_position` כאשר קיים סיכון ל־drift, manual activity או recovery.

---

## ‏10A.22 `OrderState` ו־Potential Exposure

‏גם אם `reconciled_position = 0`, יכולות להיות Orders שעדיין potentially executable.

```text
live_entry_qty
cancel_requested_entry_qty
cancel_pending_entry_qty
modify_unknown_qty
submit_unknown_qty
live_exit_qty
cancel_pending_exit_qty
```

‏Potential Exposure Gate:

```text
reconciled_position
+ potentially_executable_entry_qty
+ proposed_new_qty
<= allowed_position
```

> ‏`ENGINE INVARIANT` — Any order without terminal broker evidence remains potentially executable.

---

## ‏10A.23 `Position Protection Gate`

```text
POSITION_UNPROTECTED
=> forbid new unrelated risk
=> allow protection / exit / reconciliation actions
```

‏מצב כזה מוביל בדרך כלל ל־`EXIT_ONLY`, לא ל־Entry נוספת.

---

## ‏10A.24 `RiskState`

```text
RiskState {
  account_ready
  buying_power_state
  symbol_position_limit
  global_position_limit
  max_loss_state
  max_open_intents
  max_live_orders
  emergency_mode
  kill_switch
}
```

‏Hard Risk Limit אינו משהו ש־Signal Quality יכולה לעקוף.

---

## ‏10A.25 `CapabilityState` הוא Snapshot של Resolver, לא אוסף Booleans מקריים

‏10A מקבלת capability snapshot שמכיל לכל feature רלוונטית לפחות:

```text
capability_id
scope
runtime_evidence
enablement_state
disable_reason
last_verified_at
```

‏ב־Production:

```text
if enablement_state != PRODUCTION_ENABLED:
    eliminate candidate requiring that capability
```

‏ב־Research אפשר להגדיר Policy אחרת לפי סביבת הניסוי.

> ‏`ENGINE RULE` — Capability Resolver **מסנן** Candidates. הוא אינו בוחר את ה־winner ואינו מחליף את Decision Engine.

---

## ‏10A.26 `SystemHealthState`

```text
SystemHealthState {
  broker_connection
  broker_reconciled
  market_data_health
  clock_health
  event_loop_health
  persistence_health
  order_id_allocator_health
  capability_cache_health
  operating_mode
}
```

‏`operating_mode` משתמש ב־vocabulary הקנוני:

```text
BOOTING
RECOVERING
READY
ENTRY_DISABLED
EXIT_ONLY
DEGRADED
EMERGENCY
FROZEN
```

---

## ‏10A.27 `Clock Health` היא Safety Feature

‏נבדיל בין:

```text
wall_clock_time
monotonic_elapsed_time
source_exchange_or_feed_time
local_receive_time
```

‏TTL אפליקטיבי מקומי צריך להתבסס על monotonic elapsed time כאשר אפשר.

---

## ‏10A.28 Global Freeze / Entry Disable Gate

‏דוגמאות:

```text
kill_switch = ON
broker_state = UNKNOWN
reconciliation_in_progress
critical_position_mismatch
market_data_unhealthy
required persistence unavailable
order_id_allocator_invalid
```

‏התוצאה אינה תמיד "הכול כבוי". אפשר לקבל:

```text
ENTRY_DISABLED
```

‏או:

```text
EXIT_ONLY
```

‏כך פעולות שמקטינות Risk אינן נחסמות יחד עם Entries חדשות.

---

## ‏10A.29 סדר ה־Gates

```text
1. SYSTEM HEALTH GATE
2. BROKER RECONCILIATION GATE
3. OWNERSHIP / POTENTIAL EXPOSURE GATE
4. MARKET DATA QUALITY / FRESHNESS GATE
5. SIGNAL VALIDITY / AGE GATE
6. SESSION / MARKET-STATE GATE
7. ECONOMIC EDGE GATE
8. LIQUIDITY / DEPTH GATE
9. EXIT FEASIBILITY GATE
10. RISK LIMIT GATE
11. CAPABILITY GATE
12. CANDIDATE GENERATION
```

‏הסדר המדויק יכול להשתנות מעט במימוש, אבל Truth/Safety קודמות ל־Optimization.

---

## ‏10A.30 למה Reconciliation קודמת ל־Signal

```text
unknown execution state
=> no new entry
```

‏Signal מצוין אינו מתיר Risk חדש כאשר איננו יודעים אם Order קודמת עדיין חיה.

---

## ‏10A.31 `Signal Gate`

‏Entry יכולה להיפסל כאשר:

```text
signal.validity != VALID
signal_age_ms > max_signal_age_ms
remaining_signal_life_ms <= minimum_execution_window_ms
reversal_detected = true
```

‏אין להסיק מכך ש־Order קיימת תמיד חייבת להתבטל באותו threshold; לכך יש `ORDER_STILL_VALID` evaluation נפרד.

---

## ‏10A.32 `Economic Gate`

```text
expected_net_edge_at_allowed_execution
>=
minimum_required_net_edge
```

‏הבדיקה משתמשת assumptions שמרניות ומתאימות ל־Behavior Candidate האפשרית, לא במחיר תיאורטי שאינו executable.

---

## ‏10A.33 `Exit Feasibility Gate` יכולה להקטין Size

‏לדוגמה:

```text
entry-side liquidity supports = 500
exit-feasible qty = 180
```

‏תוצאה אפשרית:

```text
max_allowed_qty = 180
```

‏ולא בהכרח `NO_TRADE`.

---

## ‏10A.34 `Capability Gate` לא בוחר Winner

```text
pre-capability candidates:
PASSIVE_JOIN
PASSIVE_POST_ONLY
MIDPRICE
MARKETABLE_LIMIT_IOC
ADAPTIVE_LIMIT_URGENT

runtime:
POST_ONLY path = not production-enabled
ADAPTIVE path = runtime conflict

survivors:
PASSIVE_JOIN
MIDPRICE
MARKETABLE_LIMIT_IOC
```

‏רק 10B משווה בין survivors.

---

## ‏10A.35 Fallback ו־Escalation חוזרים דרך Decision חדשה

‏אם Candidate נדחתה או לא עבדה:

```text
new market snapshot
new signal age
new position/order state
new capability state
run gates again
```

‏`Fallback` פירושו שה־path הקודם נכשל או אינו זמין.

‏`Escalation` פירושה ש־urgency/risk השתנו.

‏שניהם דורשים re-decision; אף אחד מהם אינו synonym ל־"שלח משהו יותר אגרסיבי".

---

## ‏10A.36 `UNKNOWN` הוא Epistemic State אמיתי

```text
YES
NO
UNKNOWN
```

‏לדוגמה:

```text
broker_reconciled = UNKNOWN
exit_protection_active = UNKNOWN
quote_fresh = UNKNOWN
```

‏ב־Entry, `UNKNOWN` קריטי מתנהג בדרך כלל כ־deny/defer.

‏ב־Exit, `UNKNOWN` יכול להעלות עדיפות ל־risk reduction או reconciliation.

---

## ‏10A.37 Missing Data Policy

‏לכל field נגדיר:

```text
REQUIRED_FOR_ENTRY
OPTIONAL_WITH_FALLBACK
DIAGNOSTIC_ONLY
```

‏אם Required חסר — Gate מחזיר `UNKNOWN`/`FAIL` עם reason code מפורש. שפת התכנות אינה מחליטה עבורנו כיצד לפרש `null`.

---

## ‏10A.38 Data Quality היא יותר מ־Freshness

‏בדיקות לדוגמה:

```text
bid <= ask
sizes >= 0
timestamps coherent
symbol identity matches
price increment valid
no impossible jump without regime flag
```

‏Snapshot טרייה אך לא עקבית אינה Market Truth מספקת.

---

## ‏10A.39 Hysteresis ו־`NEW_ENTRY_ELIGIBLE` מול `ORDER_STILL_VALID`

‏Threshold ליצירת Order חדשה אינו חייב להיות זהה ל־threshold שמחליט אם להשאיר Order קיימת.

```text
NEW_ENTRY_ELIGIBLE
ORDER_STILL_VALID
```

‏כך אפשר למנוע oscillation סביב noise, למשל מצב שבו spread עוברת את רף Entry לשבריר שנייה אבל Passive Order קיימת עדיין תקפה לעוד זמן קצר.

‏Signal invalidation, לעומת זאת, יכולה להיות Hard Cancel condition לפי Policy.

---

## ‏10A.40 Decision Revision ו־Deterministic Replay

‏כל evaluation מקבלת:

```text
decision_id
decision_revision
policy_version
config_snapshot_id
input_snapshot_ids
```

‏Config היא immutable בתוך Decision אחת.

‏אם נשמור את snapshots ואת policy version, אותה Decision צריכה להיות replayable באופן דטרמיניסטי.

---

## ‏10A.41 `DecisionTrace`

```text
DecisionTrace {
  decision_id
  signal_id
  revision
  evaluated_at
  policy_version
  gates[]
  eliminated_candidates[]
  surviving_candidates[]
  constraints
  disposition
}
```

‏זהו artifact מחקרי ותפעולי, לא רק log טקסטואלי.

---

## ‏10A.42 `GateResult`

```text
GateResult {
  gate_id
  outcome        // PASS | FAIL | UNKNOWN | REDUCE
  reason_code
  observed_value
  threshold
  input_ts
  action
}
```

‏`REDUCE` מאפשרת Gate להקטין Size בלי לפסול Opportunity כולה.

---

## ‏10A.43 Reason Codes יציבים

```text
SIGNAL_EXPIRED
SIGNAL_INVALIDATED
QUOTE_STALE
MARKET_DATA_INVALID
SPREAD_TOO_COSTLY
INSUFFICIENT_DEPTH
EXIT_NOT_FEASIBLE
POSITION_LIMIT
POTENTIAL_EXPOSURE_LIMIT
BROKER_UNRECONCILED
CAPABILITY_NOT_ENABLED
CAPABILITY_RUNTIME_CONFLICT
SYSTEM_DEGRADED
POSITION_UNPROTECTED
```

‏Reason codes מאפשרים מדידה, replay ו־RCA במקום מחרוזות חופשיות.

---

## ‏10A.44 דוגמה — Signal שעובר את ה־Gates

```text
signal_valid = true
remaining_signal_life = 1400ms
quote_age = 18ms
spread = economically acceptable
requested_qty = 100
visible_qty_within_bound = 500
exit_feasible_qty = 350
broker_reconciled = true
reconciled_position = 0
potentially_executable_entry_qty = 0
required capabilities = production-enabled
```

‏תוצאה:

```text
disposition = ALLOW_ENTRY
max_qty = 100
candidate_generation = allowed
```

‏עדיין לא נבחרו Passive, MidPrice או IOC.

---

## ‏10A.45 דוגמה — Spread הורסת את ה־Edge

```text
expected_gross_edge = 18 bps
conservative_round_trip_execution_cost = 24 bps
```

```text
ECONOMIC_EDGE_GATE = FAIL
disposition = NO_TRADE
```

---

## ‏10A.46 דוגמה — Quote ישנה

```text
signal_valid = true
quote_age = 900ms
activity = very high
```

```text
DATA_FRESHNESS_GATE = FAIL
disposition = DEFER or NO_TRADE according to policy
```

‏לא מגיבים ל־stale data באמצעות aggression גבוהה יותר.

---

## ‏10A.47 דוגמה — Entry ישנה ב־Cancel

```text
reconciled_position = 0
old_entry_remaining = 100
old_entry_state = CANCEL_REQUESTED
new_signal_target = 100
position_limit = 100
```

‏ה־Order הישנה עדיין potentially executable.

```text
potential_exposure = 100 old + 100 proposed
```

‏לכן Entry חדשה מלאה אינה עוברת Potential Exposure Gate.

---

## ‏10A.48 דוגמה — Partial Fill יוצרת Decision חדשה

```text
target = 100
filled = 37
remainder canceled
```

‏ה־Context הבא הוא:

```text
reconciled_position = 37
remaining_intent = 63
protection_state = current evidence
remaining_signal_life = new value
current_market = new snapshot
```

> ‏`ENGINE RULE` — Partial Fill היא Decision state חדשה, לא המשך אוטומטי של ההחלטה הישנה.

---

## ‏10A.49 דוגמה — Capability חסרה

```text
PASSIVE_POST_ONLY = RUNTIME_CONFLICT
PASSIVE_JOIN = PRODUCTION_ENABLED
MIDPRICE = PRODUCTION_ENABLED
```

‏Capability Gate מסירה את `PASSIVE_POST_ONLY` בלבד.

‏היא אינה בוחרת `PASSIVE_JOIN` או `MIDPRICE` אוטומטית.

---

## ‏10A.50 `DEFER` אינו Queue של Submit ישן

‏אם מחכים ל־fresh quote, reconciliation או capability refresh:

```text
disposition = DEFER
```

‏המשמעות היא **להחליט מחדש** כאשר מגיעה evidence חדשה.

‏אין להשאיר stale submit מתוזמן מראש רק משום שב־Decision הקודמת רצינו לבצע.

---

## ‏10A.51 `NO_ACTION` מונע Side Effects מיותרים

‏דוגמה:

```text
existing passive entry is still valid
application_order_ttl not expired
no material market change
no new risk action required
```

‏התוצאה יכולה להיות:

```text
disposition = NO_ACTION
```

‏כלומר להשאיר את ה־Order הקיימת כפי שהיא ולחכות ל־event הבא.

---

## ‏10A.52 Thresholds הם Versioned Config

```text
max_quote_age_ms
minimum_required_net_edge_bps
max_spread_fraction_of_edge
minimum_exit_depth_ratio
minimum_remaining_signal_life_ms
max_application_order_ttl_ms
```

‏כל Decision שומרת `policy_version` ו־`config_snapshot_id`.

---

## ‏10A.53 `DecisionContext`

```text
DecisionContext {
  decision_id
  evaluated_at
  policy_version

  signal_state
  market_state
  order_state
  position_state
  risk_state
  capability_state
  system_health_state

  requested_action
  current_trade_intent
}
```

‏זהו input טהור ככל האפשר. Side effects מתחילים רק לאחר Decision ולפני Dispatch מתבצעת stale-decision validation נוספת בחלק 10D.

---

## ‏10A.54 Output ל־10B: ‏`EntryEnvelope`

```text
EntryEnvelope {
  disposition = ALLOW_ENTRY
  side = BUY
  max_qty = 120
  entry_economic_price_bound = 50.04
  max_application_order_ttl_ms = 700
  remaining_signal_life_ms = 1100
  partial_fill_policy = ACCEPT_ABOVE_MINIMUM
  liquidity_budget = ...
  required_protection = ...
  allowed_behavior_candidates = [...]
}
```

‏10A אינה מחזירה Broker Order. ‏10B מקבלת את ה־Envelope ובוחרת Behavior Candidate חוקית.

---

## ‏10A.55 Telemetry

```text
decision_id
signal_id
decision_revision
policy_version
disposition
first_failed_gate
all_failed_gates
all_reducing_gates
signal_age_ms
remaining_signal_life_ms
quote_age_ms
spread_bps
expected_gross_edge_bps
expected_net_edge_bps
requested_qty
max_allowed_qty
visible_qty_within_economic_bound
exit_feasible_qty
reconciled_position
potential_entry_exposure
operating_mode
broker_reconciled
capability_snapshot_id
```

---

## ‏10A.56 Metrics של ה־Gating Layer

```text
opportunities_seen
allow_rate
no_trade_rate
defer_rate
no_action_rate
exit_only_rate
cancel_existing_rate
rejection_rate_by_gate
size_reduction_rate
avg_requested_vs_allowed_qty
stale_data_rejection_rate
economic_edge_rejection_rate
exit_feasibility_rejection_rate
broker_state_rejection_rate
capability_rejection_rate
```

---

## ‏10A.57 בדיקות בסיסיות

```text
1. valid signal + healthy system => passes early gates
2. expired signal => NO_TRADE
3. stale quote => deny/defer by policy
4. unreconciled broker => no new entry
5. cancel-requested old entry consumes exposure budget
6. expected net edge below threshold => NO_TRADE
7. insufficient depth => REDUCE or NO_TRADE
8. exit infeasible => REDUCE or NO_TRADE
9. missing required field => UNKNOWN/deny
10. capability unavailable => candidate removed, not automatic aggression
11. kill switch => forbid new risk
12. unprotected position => EXIT_ONLY
13. same input snapshot + policy version => same Decision
14. existing valid order + no material change => NO_ACTION
15. partial fill => fresh DecisionContext
```

---

## ‏10A.58 Property / Invariant Tests

```text
increasing potential exposure must never increase allowed new qty
making quote older must never make stale-data gate pass
removing a capability must never create automatic aggressive fallback
making expected costs larger must not improve economic eligibility
setting kill switch must always forbid new entry
partial fill must never preserve the old quantity decision blindly
non-terminal cancel state must remain in potential exposure
```

---

## ‏10A.59 Practitioner Principles

### ‏1. Eliminate לפני Rank

‏Safety ו־truth gates אינן score components.

### ‏2. `NO_TRADE` היא Decision מקצועית

‏בסורק רחב, ויתור מהיר הוא Feature.

### ‏3. `NO_ACTION` אינה `NO_TRADE`

‏לפעמים המצב הנכון הוא להשאיר Order תקפה בלי side effect חדש.

### ‏4. `DEFER` דורשת re-decision

‏היא אינה הרשאה לשמור Intent ישן בתור ולשלוח אותו מאוחר יותר בעיוורון.

### ‏5. `UNKNOWN` היא State אמיתית

‏לא מתרגמים חוסר ידיעה ל־False.

### ‏6. Exit מתחילה לפני Entry

‏Exit feasibility היא חלק מ־entry eligibility.

### ‏7. Size נגזרת גם מ־Liquidity ו־Exit

‏Buying Power לבדה אינה sizing policy.

### ‏8. Stale Data אינה סיבה לאגרסיביות

‏היא סיבה לעצור, להקטין confidence או להיכנס ל־DEFER/NO_TRADE לפי Policy.

### ‏9. Capability Failure אינה Signal Failure

‏היא מסירה implementation path; היא אינה בוחרת replacement.

### ‏10. Fallback ו־Escalation הן Decisions חדשות

‏הזמן, ה־Signal, ה־Book וה־Exposure כבר השתנו.

### ‏11. Partial Fill היא State חדשה

‏Quantity, Protection, economics ו־remaining intent חייבים להיבחן מחדש.

### ‏12. Decision Trace היא חלק מהמערכת

‏בלעדיה אי אפשר להסביר או לשחזר למה פעולה אושרה.

---

# ‏Checkpoint — סוף חלק 10A

‏בחלק הזה בנינו את מעטפת ההחלטה לפני בחירת Entry Behavior: שש משפחות State, ‏`DecisionContext`, ארבעת ה־clocks, ‏`Economic Price Bound`, executable economics, Data Quality/Freshness, Spread/Depth/Volatility/Session, Exit Feasibility, reconciled Position, Potential Exposure, Risk, Capability ו־System Health.

‏הגדרנו Pipeline של Elimination Gates ואת ה־dispositions `ALLOW_ENTRY`, ‏`NO_TRADE`, ‏`DEFER`, ‏`EXIT_ONLY`, ‏`CANCEL_EXISTING` ו־`NO_ACTION`; קיבענו ש־Capability Resolver מסנן בלבד; וש־Partial Fill, Fallback ו־Escalation תמיד מחזירים ל־fresh Decision.

‏העיקרון המרכזי נשאר: **המנוע מסלק קודם מצבים ו־behaviors שאינם חוקיים, בטוחים או כלכליים; רק מתוך survivors מותר לבחור Execution Behavior.**

‏החלק הבא הוא **10B — Entry Decision**: בחירה בפועל בין Behavior Candidates חוקיות, תוך שמירה על ה־Envelope וה־Economic Price Bound שנקבעו כאן.

## ‏10B — Entry Decision: בחירת `Execution Mode` ו־`Behavior Candidate`

> ‏לפי ה־taxonomy הקנונית ב־`00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md`, חלק 10B אינו בוחר "Order Type" מתוך רשימה שטוחה. הוא מקבל `EntryEnvelope` מ־10A, בוחר `Application Execution Mode`, בוחר מתוכו `Behavior Candidate`, ורק לאחר מכן נבנה `Concrete Broker Order Plan`.

---

## ‏10B.1 הקלט של 10B הוא `EntryEnvelope`, לא Signal גולמי

‏10B מתחילה רק אחרי ש־10A כבר קבעה שה־Opportunity כשירה עקרונית ל־Entry.

```text
EntryEnvelope {
  disposition              // ALLOW_ENTRY
  side
  max_qty
  economic_price_bound
  max_application_order_ttl_ms
  remaining_signal_life_ms
  partial_fill_policy
  required_protection
  allowed_behavior_candidates
  capability_requirements
  economic_constraints
  liquidity_constraints
}
```

> ‏`ENGINE RULE` — 10B אינה רשאית לחרוג מ־`economic_price_bound`, ‏`max_qty`, ‏Risk או Capability constraints שנקבעו ב־10A.

---

## ‏10B.2 הפלט הוא `EntryPlan`, לא Broker Order אחת

```text
EntryPlan {
  application_execution_mode
  behavior_candidate
  quantity
  economic_price_bound
  price_policy
  liquidity_intent
  routing_plan
  broker_algo_plan
  broker_tif
  application_order_ttl_ms
  partial_fill_policy
  escalation_policy
  cancel_conditions
  protection_policy
  selection_reason_code
}
```

‏ה־Adapter מתרגם את ה־Plan ל־Broker Primitive, attributes, TIF, route ו־algo parameters.

‏דוגמה:

```text
ApplicationExecutionMode = AGGRESSIVE_CAPPED
BehaviorCandidate        = MARKETABLE_LIMIT_IOC
Broker Primitive         = LMT
Broker TIF               = IOC
Routing Policy           = SMART
Limit                    = Economic Price Bound
```

---

## ‏10B.3 `Application Execution Mode` ו־`Behavior Candidate` אינם אותו דבר

‏ה־Mode מתאר את אופי הביצוע ברמה סמנטית:

```text
PASSIVE
PRICE_IMPROVING
MIDPOINT_SEEKING
BROKER_MANAGED
AGGRESSIVE_CAPPED
```

‏ה־Behavior Candidate מתאר דרך קונקרטית יותר לממש את ה־Mode:

```text
PASSIVE_JOIN
PASSIVE_POST_ONLY
IMPROVE_ONE_TICK
RELATIVE_PRIMARY
MIDPRICE
SNAP_MIDPOINT
PEGGED_MIDPOINT_DIRECT
ADAPTIVE_LIMIT_URGENT
ADAPTIVE_LIMIT_NORMAL
MARKETABLE_LIMIT_IOC
```

‏לדוגמה, `MIDPOINT_SEEKING` יכול להתממש באמצעות `MIDPRICE`, ‏`SNAP_MIDPOINT` או `PEGGED_MIDPOINT_DIRECT` בהתאם ל־Context ול־Capabilities.

---

## ‏10B.4 Candidate Set אינו Ranking

‏הרשימה לעיל אינה סדר עדיפויות. כל Candidate פותרת trade-off אחר.

‏10B נשארת elimination-first:

```text
remaining life too short
=> remove long-wait candidates

passive-only economics required
=> remove taker candidates

midpoint capability unavailable
=> remove midpoint candidates

economic_price_bound cannot reach executable ask
=> remove immediately marketable candidates
```

‏רק לאחר elimination בוחרים מבין survivors.

---

## ‏10B.5 שלושת צירי הבחירה המרכזיים

```text
1. PRICE IMPROVEMENT DESIRE
2. FILL URGENCY
3. CONTROL DELEGATION
```

‏דוגמה:

```text
PASSIVE_JOIN
mode = PASSIVE
price improvement = high
urgency = low
control = client

MARKETABLE_LIMIT_IOC
mode = AGGRESSIVE_CAPPED
price improvement = low
urgency = very high
control = explicit/client-defined

ADAPTIVE_LIMIT_URGENT
mode = BROKER_MANAGED
price improvement = medium
urgency = high
control = partially delegated to broker
```

---

## ‏10B.6 ארבעת ה־clocks נשארים נפרדים

‏ב־Entry selection אסור לערבב:

```text
signal_ttl
application_order_ttl
broker_tif
working_order_age
```

‏`signal_ttl` קובע כמה זמן ה־Alpha תקפה.

‏`application_order_ttl` קובע כמה זמן Behavior/Order מסוימת רשאית להישאר חיה לפני re-decision.

‏`broker_tif` היא semantics כגון `DAY` או `IOC`.

‏`working_order_age` היא מדידה של כמה זמן Order כבר עובדת בפועל.

---

## ‏10B.7 `Remaining Signal Life` הוא Budget עליון — לא TTL של Order

```text
entry_time_budget_ms = min(
    envelope.max_application_order_ttl_ms,
    envelope.remaining_signal_life_ms - safety_reserve_ms
)
```

‏Behavior שאין לה סיכוי סביר לתת Useful Fill בתוך ה־budget נפסלת.

‏אבל כל Candidate יכולה לקבל `application_order_ttl` קצר יותר מה־budget הכולל.

---

## ‏10B.8 לא כל הזמן שנותר מיועד ל־Entry

‏צריך להשאיר זמן ל־:

```text
fill processing
protection activation
exit observation
cancel/reconciliation
```

‏לכן `safety_reserve_ms` הוא חלק מה־Execution Policy ולא slack מקרי.

---

## ‏10B.9 `Expected Time to Useful Fill` הוא Feature מחקרי

‏לכל Candidate נרצה להעריך:

```text
expected_time_to_first_fill
expected_time_to_useful_fill
probability_of_useful_fill_within_budget
```

‏לפי לפחות:

```text
symbol/activity regime
spread
queue/depth
quote velocity
behavior candidate
routing policy
session
```

‏Histogram אמין עדיף על model מורכב ללא Evidence.

---

## ‏10B.10 Candidate שאינה יכולה לתת `Useful Fill` בזמן — נפסלת

‏השאלה אינה:

```text
can it fill anything?
```

‏אלא:

```text
can it plausibly produce at least minimum_useful_fill
within its application_order_ttl
and within the remaining signal life?
```

---

## ‏10B.11 `PASSIVE_JOIN` — ה־baseline הפסיבי

```text
ApplicationExecutionMode = PASSIVE
BehaviorCandidate = PASSIVE_JOIN
```

‏בקנייה, הכוונה היא להצטרף ל־best bid קיים בלי ליצור אוטומטית רמת מחיר חדשה.

‏היא מתאימה כאשר:

```text
there is enough time to wait
spread saving matters
queue is not obviously hopeless
signal is not escaping rapidly
passive markout history is acceptable
```

‏והיא נחלשת כאשר missed-move cost גבוה.

---

## ‏10B.12 `JOIN_EXISTING_LEVEL` היא Placement Policy, לא Order Type

‏העדפה לא ליצור Price Level חדש מיוצגת למשל כ־:

```text
placement_policy = JOIN_EXISTING_LEVEL
avoid_being_sole_displayed_order = true/false
```

‏זו Policy שנבדוק אמפירית, לא חוק שוק.

‏אם אנחנו נשארים לבד ברמה, האפשרויות הן למשל:

```text
keep briefly
cancel
move to another existing level
switch behavior after fresh decision
```

‏עצם היותנו היחידים אינה Hard Reject אוטומטי.

---

## ‏10B.13 `PASSIVE_POST_ONLY` — כאשר Passive היא Constraint

```text
ApplicationExecutionMode = PASSIVE
BehaviorCandidate = PASSIVE_POST_ONLY
Liquidity Attribute / Constraint = POST_ONLY
```

‏ה־semantic intent:

```text
add liquidity or do not execute
```

‏היא Candidate רק לאחר route-specific capability validation.

---

## ‏10B.14 Plain Passive Limit ו־Post Only אינן אותו דבר

‏Plain Limit שהייתה Passive בזמן Decision יכולה להגיע marketable.

‏Post Only מנסה לשמור על passive intent לפי semantics של route/venue.

‏כאשר accidental crossing יהרוס את economics, Post Only היא guardrail. כאשר taking liquidity כבר מוצדקת, Candidate של Post Only צריכה להיעלם ולא "להתכופף".

---

## ‏10B.15 `IMPROVE_ONE_TICK` — `PRICE_IMPROVING`, לא Modify סמוי

```text
ApplicationExecutionMode = PRICE_IMPROVING
BehaviorCandidate = IMPROVE_ONE_TICK
```

‏שיפור מחיר ב־tick קונה עדיפות פוטנציאלית במחיר של concession.

‏נבחן:

```text
price_paid_for_priority
estimated_queue_improvement
remaining_edge_after_improvement
```

‏אם concession פוגעת ב־Economic Price Bound או מוחקת Edge, Candidate נפסלת.

---

## ‏10B.16 `RELATIVE_PRIMARY` — Broker-managed Repricing בתוך Bound

```text
ApplicationExecutionMode = BROKER_MANAGED
BehaviorCandidate = RELATIVE_PRIMARY
```

‏Candidate רלוונטית כאשר:

```text
we still want liquidity-providing behavior
quote moves enough that static join becomes stale
client-side cancel/replace churn is undesirable
economic_price_bound is clear
signal has enough life
```

‏היתרון הוא delegation של repricing. החיסרון הוא שה־Broker אינה יודעת שה־Signal שלנו נחלשה.

---

## ‏10B.17 Broker-managed Repricing דורשת Local Validity Watchdog

‏גם כאשר המחיר מנוהל אצל Broker:

```text
signal invalidated
quote stale
remaining edge below floor
economic price bound no longer valid
system degraded
application_order_ttl expired
```

‏מפעילים fresh decision / cancel path.

> ‏`ENGINE RULE` — Broker-managed repricing אינה Broker-managed strategy.

---

## ‏10B.18 SMART Relative מקבלת Guard נוסף

‏כיוון ש־SMART Relative יכולה לקבל route-specific/asymmetric repricing semantics, deterioration של Intent או economics צריך להיות cancel/re-decision condition מפורש. אין להניח שה־Order תמיד תחזור לבדה למחיר פחות אגרסיבי.

---

## ‏10B.19 משפחת Midpoint היא Trade על זמן מול Spread

```text
ApplicationExecutionMode = MIDPOINT_SEEKING
```

‏Candidates מרכזיות:

```text
MIDPRICE
SNAP_MIDPOINT
PEGGED_MIDPOINT_DIRECT
```

‏המטרה היא price improvement בתוך ה־spread; המחיר הוא uncertainty ב־fill probability וב־time-to-fill.

---

## ‏10B.20 `MIDPRICE`

‏Candidate שורדת כאשר:

```text
spread is economically meaningful
remaining life is sufficient
half-spread saving matters
SMART path is allowed
historical midpoint fill probability is non-trivial
```

‏היא נפסלת כאשר expected useful-fill time אינו מתאים ל־`application_order_ttl`/Signal life.

---

## ‏10B.21 `SNAP_MIDPOINT`

‏מתאימה כאשר:

```text
midpoint-derived initial price is attractive
continuous repricing is undesirable
short application_order_ttl can be enforced
```

‏היתרון הוא יותר determinism לאחר creation; הסיכון הוא fixed price שמתיישן.

---

## ‏10B.22 `PEGGED_MIDPOINT_DIRECT`

‏Candidate שורדת רק כאשר:

```text
direct destination is validated
venue-specific semantics are accepted
midpoint opportunity is meaningful
remaining life supports waiting
```

‏אם אין Venue hypothesis מוכחת, `MIDPRICE` יכולה להישאר baseline פשוטה יותר למחקר.

---

## ‏10B.23 `MIDPRICE` ו־`PEGGED_MIDPOINT_DIRECT` אינן aliases

‏`MIDPRICE` בודקת Broker-managed midpoint-oriented execution דרך path מתאים.

‏`PEGGED_MIDPOINT_DIRECT` בודקת mechanism directed ו־destination-specific.

‏לכן הן מושוות רק ב־contexts שבהם שתיהן חוקיות.

---

## ‏10B.24 `ADAPTIVE_LIMIT_URGENT`

```text
ApplicationExecutionMode = BROKER_MANAGED
BehaviorCandidate = ADAPTIVE_LIMIT_URGENT
BrokerAlgo = Adaptive(Urgent)
EconomicPriceBound = required
```

‏היא מעניינת כאשר רוצים price improvement אם אפשר, אבל אין הרבה זמן ורוצים שה־Broker ינהל חלק מה־search.

‏היא אינה synonym ל־IOC.

---

## ‏10B.25 `ADAPTIVE_LIMIT_NORMAL`

‏Candidate שורדת רק כאשר signal life ו־time budget גדולים מספיק ביחס להתנהגות שנמדדה.

‏`Adaptive Patient` נשארת כרגע `REFERENCE / RESEARCH ONLY` עבור ה־core horizon שלנו, אלא אם Evidence עתידי מצדיק פתיחתה.

---

## ‏10B.26 `MARKETABLE_LIMIT_IOC` — אגרסיביות תחומה

```text
ApplicationExecutionMode = AGGRESSIVE_CAPPED
BehaviorCandidate = MARKETABLE_LIMIT_IOC
BrokerPrimitive = LMT
BrokerTIF = IOC
```

‏ה־intent:

```text
execute available liquidity now
within Economic Price Bound
accept allowed partial
leave no resting remainder from this attempt
```

‏זו Candidate מרכזית כאשר missed-move cost גבוה ויש נזילות מספקת בתוך ה־Bound.

---

## ‏10B.27 `MARKETABLE_LIMIT_IOC` אינה תמיד Winner

‏גם אם היא מהירה:

```text
spread may consume too much edge
depth may be thin
quote may move before arrival
partial fill may be too small
```

‏Urgency אינה מבטלת economics, depth או exit-feasibility constraints.

---

## ‏10B.28 `Market` רגילה אינה Core Entry Candidate

‏Entry יכולה להסתיים ב־`NO_TRADE`, ולכן כאשר Edge קטן אנו מעדיפים baseline אגרסיבי עם `Economic Price Bound` על פני intent ללא client-defined price boundary.

‏`Market` נשארת primitive מקצועית חשובה, בעיקר בהקשר Exit/Risk; היא אינה Entry default במנוע הזה.

---

## ‏10B.29 `Spread-to-Edge Ratio`

```text
spread_to_edge_ratio = spread_cost / expected_gross_edge
```

‏כאשר היחס גבוה, price-improving/midpoint/passive candidates עשויות לקבל הצדקה אם הזמן מאפשר.

‏כאשר היחס נמוך ו־missed-move cost גבוה, `AGGRESSIVE_CAPPED` יכולה לקבל עדיפות.

‏זה Feature למחקר, לא threshold אוניברסלי.

---

## ‏10B.30 `Qty-to-Depth Ratio`

```text
qty_to_visible_bound_depth = requested_qty / visible_qty_within_economic_bound
```

‏Ratio גבוה יכול להוביל ל־:

```text
reduce size
allow partial IOC
remove full-size aggressive candidate
NO_TRADE
```

‏הוא לעולם אינו מרחיב אוטומטית את Economic Price Bound.

---

## ‏10B.31 `Quote Velocity` משנה את ערך ה־Passive Wait

‏אם ה־Book נע מהר יותר מה־client repricing loop, Static Passive יכולה להתיישן כמעט מיד.

‏אז אפשר לשקול, לאחר Gates:

```text
RELATIVE_PRIMARY
ADAPTIVE_LIMIT_URGENT
MARKETABLE_LIMIT_IOC
```

‏הבחירה תלויה בכיוון, spread, remaining life, economics ו־Capabilities.

---

## ‏10B.32 Fill Probability אינה Objective יחידה

‏Behavior עם Fill Rate גבוה יכולה להיות גרועה אם היא מתמלאת בעיקר לפני adverse move.

‏נשווה:

```text
fill probability
conditional execution quality
post-fill markout
no-fill opportunity outcome
missed-move cost
```

‏ולא Fill Rate לבדה.

---

## ‏10B.33 Pairwise Dominance במקום Master Score

‏לאחר elimination, Candidate A יכולה להוציא את B אם היא אינה גרועה יותר בממדים הקריטיים וטובה יותר לפחות באחד:

```text
economic price bound preservation
expected net edge
useful-fill time
risk
capability confidence
state complexity
```

‏כך נמנעים ממשקלים שרירותיים בין safety, economics וזמן.

---

## ‏10B.34 כשאין Dominance — משתמשים ב־Policy Priority מפורשת

‏לדוגמה מחקרית:

```text
WIDE_SPREAD_WITH_TIME:
MIDPRICE
→ SNAP_MIDPOINT
→ PASSIVE_JOIN
→ MARKETABLE_LIMIT_IOC
```

‏לעומת:

```text
FAST_BREAKOUT_SHORT_LIFE:
MARKETABLE_LIMIT_IOC
→ ADAPTIVE_LIMIT_URGENT
→ NO_TRADE
```

‏הסדר הוא `POLICY DEFAULT / RESEARCH HYPOTHESIS`, לא Fact על השוק.

---

## ‏10B.35 Regime חייבת להיות נגזרת מ־Inputs מפורשים

```text
spread_bucket
remaining_life_bucket
quote_velocity_bucket
depth_bucket
volatility_bucket
urgency_bucket
```

‏כך Decision ניתנת לשחזור.

---

## ‏10B.36 `Fallback` ו־`Escalation` אינם אותו דבר

### ‏`Fallback`

‏ה־path שנבחר נכשל, נדחה או אינו זמין; מעדכנים Facts/Capability ומריצים Decision חדשה כדי למצוא חלופה.

### ‏`Escalation`

‏Urgency/Risk/Market state השתנו ולכן Decision חדשה עשויה לבחור Mode אגרסיבי יותר.

> ‏`ENGINE RULE` — אף אחד מהם אינו shortcut של `send a more aggressive order`.

---

## ‏10B.37 Escalation אינה Timer שמעלה מחיר אוטומטית

‏Anti-pattern:

```text
passive 200ms
then midpoint 200ms
then IOC automatically
```

‏המסלול הנכון:

```text
attempt/checkpoint ends
→ update fills and order state
→ fresh market snapshot
→ run 10A
→ run 10B
→ produce a new EntryPlan or NO_ACTION/NO_TRADE
```

---

## ‏10B.38 `Escalation Budget` הוא Bound מצטבר

```text
max_attempts_per_signal
max_total_entry_time_ms
max_cumulative_price_concession
max_cancel_replace_count
max_broker_algo_restarts
```

‏כך סדרה של Decisions חוקיות בנפרד אינה הופכת ל־chase בלתי מוגבל.

---

## ‏10B.39 `Price Concession` נמדדת מה־Reference המקורי

‏לא רק:

```text
new limit - previous limit
```

‏אלא גם:

```text
current_limit - initial_decision_reference
current_limit - original_bid_or_ask
current_limit - original_midpoint
```

‏עשרה צעדים קטנים עדיין יכולים ליצור concession מצטברת גדולה.

---

## ‏10B.40 `Economic Price Bound` נשאר Hard בכל ניסיון

‏אין:

```text
we already tried three times
=> allow one more tick beyond bound
```

‏Bound חדשה יכולה להגיע רק מ־fresh economic decision ב־10A, לא מ־retry counter.

---

## ‏10B.41 `No Chase after Signal Decay`

‏אם Signal עוברת:

```text
VALID -> WEAKENING
```

‏Policy יכולה לאפשר KEEP מוגבל ל־Order פסיבית, אך אינה חייבת לאשר escalation.

‏אם:

```text
VALID -> INVALIDATED
```

‏התגובה היא cancel/reconcile. אין price concession נוספת.

---

## ‏10B.42 Quote שמתרחקת אינה כשלעצמה אישור לרדוף

‏אם Ask עולה, בודקים מחדש:

```text
expected exit
remaining edge
signal validity
exit feasibility
Economic Price Bound
```

‏רק fresh decision יכולה לשנות price policy.

---

## ‏10B.43 `Partial Fill` היא Decision State חדשה

‏אחרי Fill חלקית יש שתי בעיות נפרדות:

```text
A. Position already owned
B. Remaining desired entry
```

‏ה־Position הקיימת עוברת מיד ל־Protection/Exit responsibility; ה־remainder חוזרת ל־10A/10B.

> ‏`ENGINE RULE` — אין "continue filling the original order" כפעולה סמנטית אוטומטית לאחר Partial Fill.

---

## ‏10B.44 ארבע מחלקות של Partial Fill

```text
FULL_FILL
USEFUL_PARTIAL
SUBMINIMUM_PARTIAL
DUST_PARTIAL
```

‏הסיווג תלוי economics, protection ו־minimum useful position — לא במספר קבוע של מניות.

‏`USEFUL_PARTIAL` יכולה להישאר Position תקפה; ‏`SUBMINIMUM_PARTIAL` או `DUST_PARTIAL` יכולות להצדיק אי־הוספה ואף Exit decision נפרדת.

---

## ‏10B.45 Retry של Remainder אינו אוטומטי

‏נניח:

```text
target = 100
IOC filled = 63
remainder = 37
```

‏אין:

```text
retry 37 immediately
```

‏יש:

```text
apply execution fact
update/reconcile position
verify protection responsibility
recompute remaining safe qty
refresh signal/market/capabilities
run 10A
run 10B if entry remains allowed
```

---

## ‏10B.46 `Zero Fill` ו־`Rejection` אינם אותו Outcome

‏Zero Fill אומרת שה־attempt לא יצר execution בתנאים הנתונים.

‏Rejection אומרת שה־Order לא נכנסה למסלול execution כפי שהתכוונו.

‏לכן:

```text
NO_FILL
=> update market/outcome evidence

REJECTED
=> update capability/validation evidence
```

‏בשני המקרים fallback, אם בכלל, עובר דרך fresh decision.

---

## ‏10B.47 Capability Conflict מסירה Candidate — לא בוחרת אחרת

```text
MIDPRICE -> capability conflict
```

‏התגובה:

```text
record scoped capability evidence
remove MIDPRICE from eligible candidates
run 10A/10B again
```

‏לא שולחים Candidate אגרסיבית יותר מתוך error handler.

---

## ‏10B.48 Broker-managed Behavior עדיין מקבלת `application_order_ttl`

‏`Relative`, ‏`MidPrice` ו־`Adaptive` יכולות להמשיך לעבוד אצל Broker ללא local repricing.

‏לכן נשמור:

```text
signal_ttl
application_order_ttl
working_order_age
cancel_conditions
```

‏Delegation של HOW אינה delegation של WHETHER.

---

## ‏10B.49 TTL הוא Behavior-specific

‏אותו Signal יכול לתת TTL שונה ל־Candidates:

```text
PASSIVE_JOIN             = short
MIDPRICE                 = short-to-medium
ADAPTIVE_LIMIT_URGENT    = short
MARKETABLE_LIMIT_IOC     = immediate broker_tif attempt
```

‏אבל `application_order_ttl` לא יכולה לעבור את Signal lifetime או את ה־Envelope bound.

---

## ‏10B.50 Queue Age היא Economic Context, לא זכות להמשיך

‏אם Passive Order צברה queue context, הדבר יכול להשפיע על `KEEP` מול `CANCEL`.

‏אבל:

```text
signal validity
Economic Price Bound
expected net edge
risk/protection state
```

‏גוברים עליה תמיד. אין `sunk-cost exception`.

---

## ‏10B.51 Repricing Mechanism חייב להיות מפורש

‏אם אותה Behavior נשארת תקפה ורק allowed fields משתנים, ה־Adapter יכול לבחור:

```text
MODIFY_IN_PLACE
```

‏מעבר למשפחה אחרת בדרך כלל דורש:

```text
CANCEL_THEN_NEW
```

‏ורק Policy מחקרית מפורשת עם exposure budget יכולה להשתמש ב־:

```text
OVERLAPPED_REPLACEMENT
```

‏`BROKER_MANAGED_REPRICE` הוא mechanism אחר לגמרי ואינו local Modify loop.

---

## ‏10B.52 Candidate אחת בלבד אינה מחייבת Submit

‏גם אם נשארה Candidate יחידה, ה־Selector רשאי להחזיר:

```text
NO_TRADE
DEFER
NO_ACTION
```

‏לפי מצב ה־Intent וה־Order הקיים.

‏"Candidate survived" אינה הוראת שליחה.

---

## ‏10B.53 לא מריצים כמה Entry Candidates חיות כדי לראות מי תתמלא

‏אם target היא 100, המצב הבא מסוכן:

```text
PASSIVE 100
+
MIDPRICE 100
+
IOC 100
```

‏Research comparison נעשית ב־shadow/simulation או תחת exposure budget מפורש; לא באמצעות uncontrolled live race.

---

## ‏10B.54 Capital Reservation כוללת Exposure פוטנציאלית

‏נשמור:

```text
capital_reserved_for_potential_fill
```

‏ונכלול Orders ב־submit/cancel/modify uncertainty.

‏Capital אינה משתחררת רק מפני שה־Intent המקומית כבר רוצה Candidate אחרת.

---

## ‏10B.55 `Superseded Opportunity`

‏כאשר Opportunity חדשה מועדפת:

```text
old_intent = SUPERSEDED
```

‏ואז:

```text
cancel old entry if required
reconcile possible late fill
release only confirmed-safe exposure/capital
then evaluate new intent
```

‏Opportunity חדשה אינה מוחקת Broker state ישן.

---

## ‏10B.56 `Entry Ownership` — Single Decision Authority

‏לכל Entry Intent יש owner אחד של lifecycle decision:

```text
ENTRY_SELECTOR / DECISION ENGINE
```

‏Scanner יכול ליצור/expire/supersede Intent. Broker Adapter מדווח Facts. Error handler אינו מחליט עצמאית על fallback Order.

> ‏`ENGINE RULE` — side-effect callback לא בוחר Behavior חדשה; הוא מעדכן Facts ומפעיל re-decision.

---

## ‏10B.57 מטריצת התאמה ראשונית לפי Regime

| מצב | Candidates טבעיות | מה נחלש |
|---|---|---|
| ‏Spread צר מאוד + urgency גבוהה | `MARKETABLE_LIMIT_IOC`, `ADAPTIVE_LIMIT_URGENT` | ‏Passive savings קטנה |
| ‏Spread רחב + Signal צעיר | `MIDPRICE`, `SNAP_MIDPOINT`, `PASSIVE_JOIN` | ‏Immediate crossing יקר |
| ‏Quote זזה מהר + Passive intent | `RELATIVE_PRIMARY` | ‏Static join מתיישנת מהר |
| ‏Price improvement בלי continual reprice | `SNAP_MIDPOINT` | ‏Continuous pegging פחות רצוי |
| ‏Direct midpoint hypothesis מוכחת | `PEGGED_MIDPOINT_DIRECT` | ‏SMART path פחות deterministic |
| ‏Signal כמעט פג | `MARKETABLE_LIMIT_IOC` או `NO_TRADE` | ‏Waiting families |
| ‏Depth דקה בתוך Bound | ‏Size reduction / partial IOC / `NO_TRADE` | ‏Full-size aggression |

> ‏`RESEARCH HYPOTHESIS` — זו starting policy למחקר, לא חוק Production סופי.

---

## ‏10B.58 Decision Tree ראשוני ללא Score

```text
if envelope.disposition != ALLOW_ENTRY:
    return no_new_entry

candidates = envelope.allowed_behavior_candidates

remove candidates that cannot fit time budget
remove candidates that violate liquidity intent
remove candidates that cannot respect Economic Price Bound
remove candidates with unacceptable expected useful-fill size
remove candidates whose capabilities are not enabled for this scope
remove candidates that exceed complexity/risk policy

if no candidates:
    return NO_TRADE

apply pairwise dominance
apply explicit regime policy

if no side effect is currently required:
    return NO_ACTION

return EntryPlan
```

---

## ‏10B.59 `Selection Reason Code` הוא חלק מהתוצאה

‏לדוגמה:

```text
selected = MIDPRICE
reason = WIDE_SPREAD_WITH_TIME_FOR_MIDPOINT_SEARCH
```

‏או:

```text
selected = MARKETABLE_LIMIT_IOC
reason = SHORT_REMAINING_LIFE_AND_SUFFICIENT_DEPTH_WITHIN_BOUND
```

‏Reason code יציב עדיף על טקסט חופשי או score בלתי מוסבר.

---

## ‏10B.60 Telemetry של Candidate Elimination

```text
candidate_id
application_execution_mode
initially_allowed
eliminated
elimination_reason_code
expected_time_to_useful_fill
expected_useful_fill_probability
expected_entry_cost_bps
expected_price_improvement_bps
expected_missed_move_cost_bps
economic_bound_distance_bps
qty_to_depth_ratio
routing_policy
broker_algo
implementation_owner
```

‏גם Candidates שלא נבחרו נשמרות למחקר.

---

## ‏10B.61 Shadow Evaluation

‏ב־Paper/Live אפשר לבצע Candidate אחת ולחשב אחרות כ־shadow:

```text
chosen_behavior = A
shadow_candidates = B,C,D
```

‏Shadow candidate אינה שולחת Broker Order ואינה צורכת exposure budget אמיתי.

---

## ‏10B.62 Outcome Attribution

‏לאחר Entry attempt נשייך Outcome ל־Decision המקורית:

```text
application_execution_mode
selected_behavior
selection_reason_code
fill_result
fill_latency
execution_quality
entry_cost
markout
missed_move_if_no_fill
subsequent_exit_cost
```

‏`Execution Quality` ו־`Trade Outcome` נשמרים כמדדים שונים: ביצוע מצוין יכול להשתייך לעסקה שה־Signal שלה הפסידה, ולהפך.

---

## ‏10B.63 A/B Test הוגן הוא Opportunity-level

‏לא משווים רק fills של Candidate A מול fills של B.

‏משווים את כל ה־eligible opportunities שהוקצו לכל Policy, כולל:

```text
full fills
partial fills
no fills
missed moves
rejections
execution costs
subsequent trade outcomes
```

‏אחרת Candidate עם no-fill גבוה יכולה להיראות טובה באופן מלאכותי.

---

## ‏10B.64 Acceptance Tests ל־Entry Selector

```text
1. wide spread + sufficient life => midpoint/passive candidates survive
2. very short life => waiting candidates eliminated
3. passive-only economics => taker candidate eliminated
4. post-only unavailable => only post-only candidate removed
5. Economic Price Bound below executable ask => IOC not falsely treated as executable
6. thin depth => size reduced or aggressive candidate removed
7. quote velocity high => static passive can be eliminated
8. Relative chosen only with Bound + local TTL
9. MidPrice chosen only when time budget permits
10. Snap expires without automatic chase
11. IOC partial => remainder becomes new decision state
12. zero-fill IOC => classified, not blindly retried
13. broker reject => capability evidence + re-decision
14. signal invalidates during passive wait => cancel/reconcile
15. signal invalidates during Adaptive => cancel/reconcile
16. old entry cancel-pending prevents unsafe new entry
17. superseding opportunity waits for safe exposure reconciliation
18. cumulative escalation never exceeds concession budget
19. Economic Price Bound never violated across retries
20. identical replay snapshot => same EntryPlan
21. fallback never bypasses 10A
22. OVERLAPPED_REPLACEMENT impossible without explicit exposure budget
```

---

## ‏10B.65 Property Tests

```text
shorter remaining life must never make a slower-only candidate newly eligible
lower buy Economic Price Bound must never permit a higher executable price
higher potential exposure must never increase allowed entry qty
removing post-only capability must never create an automatic taker order
signal INVALIDATED must never produce a new entry plan
cumulative concession must never exceed configured maximum
capability rejection must never directly create a more aggressive order
partial fill must always change the next decision context
```

---

## ‏10B.66 V1 — Mode קטן, Candidate set קטן

> ‏`POLICY DEFAULT` — כדי לא לבנות מערכת ענקית לפני Evidence, V1 המחקרית יכולה להתחיל עם ארבע Candidates מבוצעות היטב:

```text
PASSIVE_JOIN
MIDPRICE
ADAPTIVE_LIMIT_URGENT
MARKETABLE_LIMIT_IOC
```

‏ואחר כך להוסיף:

```text
PASSIVE_POST_ONLY
RELATIVE_PRIMARY
SNAP_MIDPOINT
PEGGED_MIDPOINT_DIRECT
```

‏הסיבה היא כיסוי ארבע פילוסופיות execution שונות, לא טענה שהקבוצה השנייה פחות מקצועית.

---

## ‏10B.67 Candidate lifecycle נפרד מ־Capability enablement

‏לכל Candidate מחקרית אפשר להחזיק:

```text
DISABLED
SHADOW_ONLY
LIVE_ENABLED
```

‏זה אינו מחליף את Capability enablement:

```text
DOC_ONLY
RUNTIME_CONFIRMED
PAPER_ACCEPTED
LIVE_SMALL_ACCEPTED
PRODUCTION_ENABLED
```

‏Capability אומרת האם ה־implementation path חוקי/מאומת; Candidate lifecycle אומרת האם Policy המחקר שלנו רשאית להשתמש בו בפועל.

---

## ‏10B.68 Research Harness צריך להיות Extensible

```text
EntryBehaviorCandidate {
  id
  application_execution_mode
  eligibility(context, envelope)
  derive_constraints(context, envelope)
  estimate_outcome(context)
  materialization_requirements
  failure_destination
  cancel_policy
}
```

‏`failure_destination` אומר האם failure מובילה למשל ל־`DEFER`, ‏`NO_TRADE`, ‏fresh candidate selection, ‏`EXIT_ONLY` או recovery — ולא לאיזה Broker Order לשלוח אוטומטית.

---

## ‏10B.69 Practitioner Insights — Entry Selection

### ‏1. Order Name אינה Execution Behavior מלאה

‏אותו `LMT` יכול להיות Passive או Marketable; Routing, TIF, attributes ו־market state משנים את ההתנהגות.

### ‏2. הפקודה המהירה ביותר אינה תמיד Entry הכלכלית הטובה ביותר

‏Fill מיידית במחיר שמוחק את ה־Edge אינה הצלחה.

### ‏3. Passive אינה ברירת מחדל חסכונית

‏No-fill ו־adverse selection יכולים לעלות יותר מה־spread שנחסך.

### ‏4. Midpoint אינה "חצי Spread בחינם"

‏משלמים ב־fill uncertainty ובזמן.

### ‏5. `Post Only` היא Constraint

‏כאשר urgency משתנה, Candidate יכולה להיעלם במקום לשנות משמעות.

### ‏6. `Relative` חוסכת Client Reprice Loop — לא Signal Monitoring

‏Validity ו־TTL נשארות אצלנו.

### ‏7. `Snap` מפחיתה Auto-Chase — לא Staleness

‏`application_order_ttl` עדיין חובה.

### ‏8. `Adaptive` היא Delegation מבוקרת

‏ה־Broker יכולה לייעל HOW; אנחנו מחזיקים WHETHER, Bound ו־TTL.

### ‏9. `IOC` היא Attempt תחומה, לא Trade lifecycle מלא

‏Partial Fill משנה מיד Position ו־remaining intent.

### ‏10. Escalation היא סדרה של Decisions

‏לא staircase אוטומטי עד Fill.

### ‏11. Chase נמדד מצטבר

‏צעדים קטנים אינם מעלימים concession כוללת.

### ‏12. Queue position היא Asset מותנה

‏היא בעלת ערך רק כל עוד Signal, economics ו־Risk עדיין מצדיקים אותה.

### ‏13. Better Opportunity אינה מוחקת Exposure ישנה

‏Capital/Risk משתחררים רק לאחר reconciliation.

### ‏14. No Fill יכולה להיות Outcome טובה

‏אם האלטרנטיבה הייתה Fill רעילה או מעבר ל־Bound, אי־ביצוע שמר על ה־Edge/Risk.

### ‏15. Candidate שלא נבחרה עדיין חשובה למחקר

‏Shadow telemetry מאפשרת להשוות Policies בלי exposure כפול.

---

# ‏Checkpoint — סוף חלק 10B

‏10B מקבלת `EntryEnvelope` מ־10A ובוחרת בשתי שכבות נפרדות: `Application Execution Mode` ואחריה `Behavior Candidate`. רק לאחר הבחירה נוצר `Concrete Broker Order Plan` שמכיל Primitive, TIF, Routing, Broker Algo ו־attributes.

‏הבחירה נשארת elimination-first: זמן, liquidity intent, ‏`Economic Price Bound`, ‏size, capability ו־risk מסירים Candidates; אחר כך pairwise dominance ו־explicit regime policy בוחרים survivor. ‏`Fallback`, ‏`Escalation`, ‏retry ו־Partial Fill תמיד חוזרים ל־fresh decision. ‏`application_order_ttl`, ‏`signal_ttl`, ‏`broker_tif` ו־`working_order_age` נשארים clocks שונים.

‏העיקרון המכריע הוא: **Order attempt אינה הבטחה להמשיך עד Fill. כל שינוי מהותי ב־Market, Signal, Position, Capability או lifecycle מחזיר את המנוע להחלטה חדשה תחת אותם safety/economic bounds.**

‏השלב הבא יהיה **חלק 10C — Exit Decision**: ננרמל את Exit modes, ‏Protection ownership, ‏Position truth ו־handoff semantics מול אותו vocabulary קנוני.

# ‏חלק 10C — Exit Decision: יציאה, הגנה ו־Ownership

> ‏לפי ה־taxonomy הקנונית ב־`00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md`, הפרק הזה מפריד בין `Application Execution Mode`, ‏`Behavior Candidate`, ‏Protection Architecture, ‏Exit Authority ו־Broker Order lifecycle. אלה שכבות שונות גם כאשר הן פועלות יחד באותה יציאה.
>
> ‏`FACT` — עובדות `IBKR` תלויות־זמן בפרק זה אומתו לאחרונה ב־`2026-10-27`.

---

## ‏10C.1 Exit היא בעיה שונה מ־Entry

‏ב־Entry תמיד קיימת אפשרות מקצועית:

```text
NO_TRADE
```

‏ב־Exit כבר קיימת Position ולכן אי־ביצוע הוא עצמו Risk.

‏לכן Exit Decision אינה Entry Selector עם `SELL` במקום `BUY`. היא צריכה לענות:

```text
What reconciled position actually exists?
How urgent is risk reduction?
What broker protection already exists?
What orders remain potentially executable?
Who owns the authority to create the next exit action?
How much quantity is still safe to exit?
What Economic Price Bound applies to this decision?
```

---

## ‏10C.2 הקלט הוא `ExitContext`

```text
ExitContext {
  evaluated_at
  policy_version

  position_state
  signal_state
  market_state
  order_state
  protection_state
  risk_state
  capability_state
  system_health_state
}
```

‏Exit חייבת לראות גם את Protection שכבר חיה אצל Broker. בלי המידע הזה Local Engine עלולה ליצור Exit חדשה בזמן ש־Stop/Bracket קיימת עדיין יכולה לבצע.

---

## ‏10C.3 Position Truth היא שלושה מושגים

‏המונחים הקנוניים הם:

```text
execution_ledger_position
broker_reported_position
reconciled_position
```

‏אם Entry ביקשה 100 מניות אבל Executions מאומתות יצרו Position של 37, Exit אינה נגזרת מ־requested quantity של 100.

> ‏`ENGINE RULE` — כאשר יש recovery, manual activity או mismatch, פעולה שמגדילה worst-case exit exposure נשענת על `reconciled_position`, לא על requested quantity ולא על local order state בלבד.

---

## ‏10C.4 Exit Disposition אינה `Execution Mode`

‏נרצה outcomes כגון:

```text
HOLD
EXECUTE_EXIT
PROTECTION_ONLY
CANCEL_EXIT
RECONCILE_ONLY
FLAT_CONFIRMED
NO_ACTION
```

‏ורק כאשר disposition היא `EXECUTE_EXIT`, נבחר `Application Execution Mode` כגון:

```text
NORMAL_EXIT
FAST_EXIT
EMERGENCY_REDUCE
```

‏כך `HOLD`, ‏`RECONCILE_ONLY` ו־`FLAT_CONFIRMED` אינם מתערבבים עם אופן הביצוע של Order.

---

## ‏10C.5 שלוש שכבות החלטה ועוד שכבת Safety

```text
1. STRATEGY EXIT CONDITION
2. EXIT EXECUTION MODE
3. EXIT BEHAVIOR CANDIDATE
4. PROTECTION ARCHITECTURE
```

‏דוגמה:

```text
Strategy condition       = SIGNAL_REVERSAL
ApplicationExecutionMode = FAST_EXIT
BehaviorCandidate        = MARKETABLE_LIMIT_IOC
ProtectionArchitecture   = HYBRID_PROTECTION
```

‏ה־Strategy אומרת למה לצאת; Mode אומרת איזה יחס ל־urgency/risk נדרש; Candidate אומרת כיצד לנסות לבצע; Protection Architecture אומרת איזו שכבת safety קיימת סביב ה־Position.

---

## ‏10C.6 `Exit Authority` ו־`Protection Authority`

‏נפריד שתי סמכויות:

```text
ExitAuthority =
  NONE
  LOCAL_ENGINE
  RECOVERY_CONTROLLER

ProtectionAuthority =
  NONE
  BROKER_PROTECTION
  BROKER_BRACKET
  LOCAL_PROTECTION
```

‏Authority אינה אומרת ששאר Orders אינן יכולות Fill. היא אומרת מי רשאי ליצור שינוי חדש בתחום שלו.

> ‏`ENGINE INVARIANT` — לפני יצירת Exit חדשה צריך לדעת גם מי מחזיק Exit Authority וגם אילו protection/exit Orders עדיין potentially executable.

---

## ‏10C.7 למה Ownership קריטית

‏תרחיש מסוכן:

```text
broker stop is active
local engine decides to exit 100
broker stop triggers concurrently
```

‏אם שתי ה־SELL מתבצעות, Long 100 יכולה להפוך ל־Short 100.

‏לכן Local Exit מתחילה ב־inspection של כל Exit/Protection path שעדיין יכולה לבצע — לא רק בהחלטת מחיר.

---

## ‏10C.8 `Potential Exit Exposure`

‏נחשב לפחות:

```text
potential_exit_qty =
  live_exit_qty
+ cancel_requested_exit_qty
+ cancel_pending_exit_qty
+ triggerable_protection_qty
+ submit_unknown_exit_qty
```

‏ונשווה ל־`reconciled_position`.

> ‏`ENGINE INVARIANT` — Any order without terminal broker evidence remains potentially executable.

---

## ‏10C.9 Quantity Invariant

```text
Do not intentionally create a new exit
if worst-case execution of existing exits + proposed exit
can exceed reconciled position quantity,
unless reversal is explicitly intended.
```

‏במנוע הזה incidental reversal אינה Exit תקינה.

---

## ‏10C.10 `NORMAL_EXIT`

‏`NORMAL_EXIT` היא `Application Execution Mode` המתאימה כאשר Position risk בשליטה, market orderly ויש זמן מסוים לשפר execution quality.

‏Behavior Candidates אפשריות:

```text
PASSIVE_JOIN
RELATIVE_PRIMARY
MIDPRICE
SNAP_MIDPOINT
ADAPTIVE_LIMIT_NORMAL
ADAPTIVE_LIMIT_URGENT
MARKETABLE_LIMIT_IOC
```

‏הבחירה נשארת elimination-first לפי economics, depth, time budget, capabilities ו־Position risk.

---

## ‏10C.11 `NORMAL_EXIT` אינה synonym ל־Passive

‏Normal פירושו שאין emergency regime. אם spread צר, Position קטנה והנזילות מספיקה בתוך `Economic Price Bound`, ‏`MARKETABLE_LIMIT_IOC` יכולה להיות Normal Exit חוקית.

---

## ‏10C.12 `FAST_EXIT`

‏`FAST_EXIT` מתאימה כאשר:

```text
signal reversal is clear
remaining expected edge is near zero or negative
position risk is increasing
missed-exit cost > expected price-improvement benefit
```

‏Speed/certainty מקבלות משקל גבוה יותר, אך quantity invariants ו־Economic Price Bound אינם נעלמים.

---

## ‏10C.13 Candidate טבעית ל־`FAST_EXIT`

‏במניות נזילות Candidate מחקרית מרכזית היא:

```text
MARKETABLE_LIMIT_IOC
```

‏כלומר:

```text
ApplicationExecutionMode = FAST_EXIT
BehaviorCandidate        = MARKETABLE_LIMIT_IOC
BrokerPrimitive          = LMT
BrokerTIF                = IOC
Limit                    = Exit Economic Price Bound
```

‏אם נשארת Position אחרי Partial Fill, מתבצעת Exit Decision חדשה.

---

## ‏10C.14 `FAST_EXIT` אינה Chase בלתי מוגבל

‏Price movement נגדנו אינו אישור אוטומטי להרחיב Bound.

‏נדרש:

```text
fresh market snapshot
fresh risk state
reconciled remaining position
potentially executable exits
fresh Economic Price Bound
```

‏כל escalation היא Decision חדשה.

---

## ‏10C.15 `EMERGENCY_REDUCE`

‏זה Mode שונה איכותית, למשל כאשר:

```text
position is unprotected
hard risk boundary breached
system degraded while exposure exists
broker inconsistency creates material risk
market moves violently against position
```

‏המטרה היא reduction של exposure במהירות ובבטיחות יחסית — לא price optimization רגילה.

---

## ‏10C.16 Emergency אינה `send Market blindly`

‏גם Emergency יכולה לעבוד עם guardrails כגון:

```text
emergency_economic_price_bound
max_order_size_per_attempt
session constraints
halt awareness
position reconciliation
```

‏ה־Policy משנה את סדר העדיפויות; היא אינה מבטלת controls.

---

## ‏10C.17 Emergency Ladder היא Series of Decisions

```text
attempt
→ observe executions/order truth
→ reconcile remaining position
→ fresh risk/market snapshot
→ new emergency decision
```

‏אפשר להרחיב Bound רק במסגרת Policy מפורשת ומצטברת; אין continuation עיוור.

---

## ‏10C.18 Protection Architectures אינן Exit Modes

‏שלוש architectures מרכזיות למחקר:

```text
CLIENT_MANAGED_EXIT
BROKER_BRACKET
HYBRID_PROTECTION
```

‏ובנוסף אפשר להשתמש ב־`STOP_BACKSTOP` כ־Protection mechanism בתוך architecture מתאימה.

‏אלו אינן values של `ApplicationExecutionMode`.

---

## ‏10C.19 `STOP_BACKSTOP`

‏Stop Backstop היא שכבת Protection שמטרתה להקטין dependence ב־local process.

```text
Local engine = dynamic NORMAL_EXIT / FAST_EXIT
Broker Stop  = last-resort protection
```

‏ה־Stop היא Trigger + post-trigger execution semantics; היא אינה “Exit intelligence” מלאה.

---

## ‏10C.20 Stop Trigger אינה Fill Price

‏Trigger אומר מתי Stop מופעלת; הוא אינו Fill guarantee.

‏Telemetry צריכה להפריד:

```text
stop_trigger_price
trigger_timestamp
actual_fill_price
slippage_from_trigger
```

---

## ‏10C.21 `Stop Limit` כ־Backstop

‏Stop-Limit מחליפה חלק מ־price uncertainty ב־non-fill risk לאחר Trigger.

‏לכן השאלה היא:

```text
Do we prioritize price protection
or
position reduction certainty?
```

‏התשובה היא Policy/Context dependent.

---

## ‏10C.22 `BROKER_BRACKET`

‏`BROKER_BRACKET` היא Protection/Composite Architecture, לא `Application Execution Mode`.

‏יתרונות אפשריים:

```text
protection can be staged with entry
relationships live outside local strategy logic
survivability can improve relative to client-only exits
```

‏חסרונות:

```text
less signal-aware
partial-fill / child lifecycle complexity
sibling-cancel races
reconciliation complexity
```

> ‏`ACCEPTANCE TEST REQUIRED` — Parent partial-fill → child activation/quantity semantics נשארות unresolved עבור ה־API/Product/Route הספציפיים עד evidence אמפירי.

---

## ‏10C.23 `HYBRID_PROTECTION`

```text
broker-resident protective backstop
+
local signal-aware exit intelligence
```

‏Hybrid יכולה לשלב survivability של Broker עם Exit דינמית, אך רק כאשר Exit Authority, Protection Authority, quantity budgets ו־handoff protocol מוגדרים היטב.

---

## ‏10C.24 Handoff בין Authorities אינו Atomic

‏כאשר Local Exit אמורה לקחת אחריות מ־Broker Protection, קיימות שתי סכנות מנוגדות:

```text
cancel protection too early
=> unprotected window

submit local exit too early
=> overlap / double-exit risk
```

‏לכן אין sequence אוניברסלי של “cancel first” או “exit first”. ה־Policy חייבת להעריך urgency, broker semantics ו־worst-case overlap.

---

## ‏10C.25 Protection Handoff הוא Protocol מפורש

‏נרצה states כגון:

```text
BROKER_PROTECTED
HANDOFF_TO_LOCAL_EXIT
LOCAL_EXIT_IN_FLIGHT
BROKER_PROTECTION_CANCEL_REQUESTED
BROKER_PROTECTION_CANCEL_PENDING
FLAT_VERIFYING
FLAT_CONFIRMED
```

> ‏`ENGINE INVARIANT` — transition בין Protection Authority ל־Exit Authority אינה evidence ש־Order הישנה חדלה להיות executable.

---

## ‏10C.26 Partial Position משנה Protection מיד

‏אם Entry התמלאה ב־37:

```text
reconciled_position = 37
```

‏Protection requirement נגזרת מ־37, לא מ־target 100.

‏אם late fill מגדילה את Position ל־63, Protection coverage חייבת לעבור fresh reconciliation; אין להניח שה־child quantity השתנתה בדיוק כפי שרצינו.

---

## ‏10C.27 Position Qty, Protected Qty ו־Potential Exit Qty

‏נשמור במפורש:

```text
reconciled_position_qty
broker_protective_qty
local_exit_potential_qty
cancel_pending_exit_qty
unknown_exit_qty
```

‏Invariants עקרוניים:

```text
intentional protected qty should not exceed reconciled position qty
```

‏וגם:

```text
required protection coverage must not remain below policy minimum
beyond an explicitly bounded unprotected window
```

---

## ‏10C.28 `Unprotected Window` הוא Metric

```text
entry_fill_ts
protection_active_ts
unprotected_window_ms
```

‏וב־handoff:

```text
protection_cancel_effective_ts
local_exit_fill_ts
handoff_unprotected_ms
```

‏כך architecture נמדדת גם לפי survivability, לא רק לפי P&L.

---

## ‏10C.29 Broker Child Rejection הוא Risk Incident

‏אם Position קיימת ו־protective child נדחתה:

```text
POSITION_UNPROTECTED
```

‏Policy צריכה לבחור מראש בין actions כגון:

```text
retry valid protection path
place alternate validated protection
reduce position
freeze new entries
```

‏Capability failure אינה autorization אוטומטית לפעולה אגרסיבית אחרת; היא מפעילה fresh safety decision.

---

## ‏10C.30 Double Exit Prevention

‏לפני Exit חדשה:

```text
worst_case_total_exit_qty =
  already_filled_exit_qty
+ potentially_executable_existing_exit_qty
+ proposed_new_exit_qty
```

‏ה־proposed action חייבת להישאר בתוך quantity budget של `reconciled_position`, אלא אם reversal מכוונת ומאושרת בנפרד.

---

## ‏10C.31 `OCA/OCO` אינה Transactional Atomicity

‏OCA/OCO היא Coordination Relationship. גם כאשר Broker מספקת cancel/proportional-reduction semantics, sibling ב־cancel path נשאר potentially executable עד terminal evidence.

```text
SIBLING_CANCEL_REQUESTED
SIBLING_CANCEL_PENDING
```

‏הם מצבי lifecycle אמיתיים, לא proof שה־risk נעלם.

---

## ‏10C.32 Profit-Taker Partial Fill

‏נניח Long 100 ו־TP ביצעה 40. אחרי reconciliation:

```text
remaining_position = 60
```

‏Protection צריכה להתאים ל־remaining position. Partial Exit מפעילה fresh decision/reconciliation של כל siblings וה־Protection Graph.

---

## ‏10C.33 Stop Trigger בזמן Sibling Cancel

‏Race אפשרי:

```text
TP fills
stop cancel requested
market moves
stop triggers before cancel becomes terminal
```

‏אין לסמוך על coordination כאילו היא transaction. Executions הן Facts, וכל חריגה מוחזרת ל־position reconciliation ול־risk handling.

---

## ‏10C.34 `FLAT_CONFIRMED` הוא State שצריך להרוויח

‏לא מכריזים Flat מפני ששלחנו Exit בגודל Position.

‏נדרשים לפחות:

```text
reconciled_position == 0
no potentially executable exits
no unknown exit/protection orders
executions reconciled
broker position reconciled
```

‏רק אז:

```text
FLAT_CONFIRMED
```

---

## ‏10C.35 Exit בזמן Cancel

‏אם Exit ישנה נמצאת ב־`CANCEL_REQUESTED`, ‏`CANCEL_PENDING` או `CANCEL_UNKNOWN`, אין לשלוח replacement מלא כאילו היא מתה.

‏Replacement quantity נגזרת מ־worst-case exposure.

---

## ‏10C.36 `Modify` מפוצל לשלושה Mechanisms

‏כפי שנקבע בחלק 8:

```text
MODIFY_IN_PLACE
CANCEL_THEN_NEW
OVERLAPPED_REPLACEMENT
```

‏`MODIFY_IN_PLACE` מתאימה רק כאשר ה־Broker/path וה־field change תומכים בכך בבטחה.

‏מעבר בין Behavior families, למשל Passive ל־`MARKETABLE_LIMIT_IOC`, אינו “modify” סמנטי אוטומטי. בדרך כלל הוא דורש cancel/reconcile/new או overlap מפורש תחת quantity budget.

---

## ‏10C.37 Queue Priority מול Exit Urgency

‏ב־`NORMAL_EXIT`, queue context יכולה להיות נכס. ב־`FAST_EXIT`, אותו queue context יכולה להפוך ל־sunk cost.

‏Queue לעולם אינה גוברת על signal invalidation, protection failure או hard risk boundary.

---

## ‏10C.38 `HOLD`, ‏`NO_ACTION` ו־`RECONCILE_ONLY`

‏אלה outcomes שונים:

```text
HOLD
=> keep position intentionally under current policy

NO_ACTION
=> no new side effect is required this cycle

RECONCILE_ONLY
=> uncertainty blocks a new exit command until broker/position truth is rebuilt
```

‏Reason codes לדוגמה:

```text
HOLD_SIGNAL_VALID
HOLD_PROTECTION_ACTIVE
NO_ACTION_EXISTING_EXIT_STILL_VALID
RECONCILE_EXIT_OWNERSHIP_UNKNOWN
```

---

## ‏10C.39 Signal Exit מול Risk Exit

‏נפריד:

```text
SIGNAL_REVERSAL
```

‏מ־:

```text
RISK_BOUNDARY_BREACHED
```

‏Signal reversal יכולה לבחור `NORMAL_EXIT`/`FAST_EXIT`; hard risk breach יכולה להוביל ל־`EMERGENCY_REDUCE` גם אם ה־Strategy עדיין חיובית.

---

## ‏10C.40 Profit Target אינה Exit Engine מלאה

‏Profit-taking Limit אינה יודעת לבדה אם momentum reversed, spread השתנה, liquidity נעלמה או Signal expired.

‏היא יכולה להיות Child שימושית ב־Protection/Exit structure, אך אינה תחליף ל־Exit Decision.

---

## ‏10C.41 Stop אינה Exit Intelligence מלאה

‏Stop יודעת Trigger semantics. היא אינה יודעת בהכרח על signal decay, opportunity supersession או private strategy state.

‏לכן `STOP_BACKSTOP` היא Safety mechanism, לא מוח האסטרטגיה.

---

## ‏10C.42 Trailing Protection

‏Trailing יכולה להיות Candidate כאשר רוצים broker-managed moving trigger, אך היא path-dependent ועלולה להגיב לרעש.

‏Candidate נשארת רלוונטית רק אם trail policy מתאימה ל־holding horizon ול־normal microstructure noise שנמדדה.

---

## ‏10C.43 `Adjustable Stop`

‏Adjustable Stop מסווגת כ־Transforming Order: trigger מסוים משנה את semantics של Order קיימת לפי Broker-managed rule.

‏היא יכולה לשמש למחקר survivability, אך אינה מחליפה Local Exit Decision משום שה־Broker אינה יודעת את private Signal state שלנו.

---

## ‏10C.44 Exit בזמן Market Data Stale

‏ב־Entry, stale data בדרך כלל חוסמת Risk חדש. ב־Exit עם Position קיימת היא מצב מורכב יותר.

‏המערכת יכולה לעבור ל־:

```text
EXIT_ONLY
PROTECTION_ONLY
EMERGENCY_REDUCE
```

‏בהתאם ל־Broker truth, protection ו־Risk Policy.

---

## ‏10C.45 Exit בזמן Broker Disconnect

‏Disconnect מפחיתה observability/control; היא אינה הוכחה ש־Broker-resident Orders נעלמו.

‏ב־recovery לא יוצרים replacement על בסיס local assumption. קודם rebuild של Broker state, Executions, Position, Protection Graph ו־ownership.

---

## ‏10C.46 `Broker-Resident` ו־`Broker-Simulated` אינם Synonyms

‏Protection יכולה להיות Broker-resident גם אם mechanism מסוים simulated אצל Broker; ולהפך, classification של implementation אינה לבדה proof של survivability.

‏נשמור בנפרד:

```text
implementation_kind
residency_state
```

‏כפי שנקבע ב־Part 9.

---

## ‏10C.47 `UNTRANSMITTED != PROTECTED`

> ‏`FACT` — `Order.transmit=false` יוצרת ב־TWS Order שלא נשלחה ל־IB server; לפי התיעוד שנבדק היא זמינה רק באותה session ונמחקת ב־restart.

‏לכן:

```text
UNTRANSMITTED
!=
BROKER_PROTECTED
```

‏Protection נחשבת פעילה רק לאחר transmission/evidence המתאים למסלול שנבחר.

---

## ‏10C.48 Parent/Child Identity

‏ב־IBKR רלוונטיים בין היתר:

```text
orderId
permId
parentId
clientId
```

‏Recovery ממפה אותם ל־internal trade/position identity ול־Protection Graph שלנו.

---

## ‏10C.49 Protection Graph

```text
Position
 ├── Entry order(s)
 ├── Profit exit(s)
 ├── Protective stop(s)
 └── Local exit intent(s)
```

‏Relations לדוגמה:

```text
protects
replaces
cancels_with
belongs_to
```

‏כך recovery אינה תלויה ב־boolean כגון `bracketActive=true`.

---

## ‏10C.50 Exit Lifecycle מול System Mode

‏אלו dimensions שונים.

‏Exit lifecycle יכולה לכלול:

```text
EXIT_EVALUATING
EXIT_WORKING
EXIT_PARTIAL
HANDOFF_IN_PROGRESS
SIBLING_CANCEL_PENDING
FLAT_VERIFYING
FLAT_CONFIRMED
```

‏System operating mode יכולה להיות במקביל:

```text
READY
EXIT_ONLY
DEGRADED
EMERGENCY
RECOVERING
FROZEN
```

‏אין לדחוס אותן ל־state machine אחת.

---

## ‏10C.51 Exit Decision Tree ראשוני

```text
if reconciled_position == 0:
    if potentially_executable_exit_qty == 0 and no exit uncertainty:
        return FLAT_CONFIRMED
    return RECONCILE_ONLY

if broker/position truth is materially unknown:
    return RECONCILE_ONLY or emergency policy according to risk

if position is unprotected:
    prioritize protection / EMERGENCY_REDUCE

if hard risk boundary breached:
    mode = EMERGENCY_REDUCE
else if signal reversal / edge gone:
    mode = FAST_EXIT
else if normal exit condition:
    mode = NORMAL_EXIT
else:
    return HOLD or NO_ACTION

filter behavior candidates through capability + quantity + economic bounds
select one legal behavior
```

---

## ‏10C.52 Candidate Set ל־`NORMAL_EXIT`

```text
PASSIVE_JOIN
RELATIVE_PRIMARY
MIDPRICE
SNAP_MIDPOINT
ADAPTIVE_LIMIT_NORMAL
ADAPTIVE_LIMIT_URGENT
MARKETABLE_LIMIT_IOC
```

‏Selector משתמש רק ב־Candidates שעברו Capability/Enablement gates.

---

## ‏10C.53 Candidate Set ל־`FAST_EXIT`

```text
ADAPTIVE_LIMIT_URGENT
MARKETABLE_LIMIT_IOC
```

‏Midpoint/Passive behaviors יכולות להישאר רק אם measured useful-fill latency עדיין מתאימה ל־Risk budget.

---

## ‏10C.54 Candidate Set ל־`EMERGENCY_REDUCE`

‏המטרה היא exposure reduction תחת Policy מפורשת. Candidate חייבת להיבדק מול:

```text
reconciled position
potential exits
market state
session
halt state
liquidity
capability
economic / emergency price bound
```

‏`Market` אינה hidden fallback; אם תישקל בעתיד, היא חייבת להיות branch מפורש עם acceptance/risk policy משלה.

---

## ‏10C.55 Exit Time Budget

```text
normal_exit_application_ttl_ms
fast_exit_application_ttl_ms
emergency_step_application_ttl_ms
```

‏אלה `application_order_ttl`/decision budgets — לא `broker_tif`.

‏ב־Emergency expiry של step אינו אומר “לוותר”; הוא מפעיל fresh risk decision.

---

## ‏10C.56 Partial Exit היא Decision State חדשה

‏Position 100 ו־IOC שמכרה 65 אינה “Exit של 100 שעדיין ממשיכה”. אחרי reconciliation יש Position 35, protection/potential exits חדשים ו־Market חדש.

```text
apply execution facts
→ reconcile position/protection
→ fresh market/risk state
→ new Exit Decision
```

---

## ‏10C.57 Dust Position

‏אם נשארת quantity קטנה מאוד, Policy יכולה לסווג אותה `DUST_POSITION` ולבחור action ייעודי. ההגדרה היא כלכלית/תפעולית, לא מספר shares אוניברסלי.

---

## ‏10C.58 External/Manual Position Change משנה Ownership Assumptions

‏אם Position או Order השתנו ידנית/על ידי client אחר:

```text
externally_changed = true
ownership_revalidation_required = true
```

‏אין להמשיך modifications אוטומטיות כאילו ownership לא השתנתה. קודם reconcile Position, live exits, protection qty ו־authority.

---

## ‏10C.59 Reconnect Exit Recovery היא Position-First

```text
freeze new entries
reconcile executions
reconcile broker position
rebuild open orders
rebuild protection graph
classify ownership / authorities
validate quantities
validate protection
```

‏Position Truth קודמת לשחזור intent הישן.

> ‏`ENGINE RULE` — Recovery אינה מחיה Signal או Exit intent שפגו בזמן הניתוק.

---

## ‏10C.60 `READY` צריך להרוויח מחדש

‏Reconnect אינו Ready.

‏חזרה ל־`READY` דורשת לפחות:

```text
reconciled position
classified live orders
known protection state
no unresolved material exit exposure
critical invariants pass
```

‏אם Position קיימת ו־Protection חסרה, המערכת נשארת במצב safety מתאים ולא חוזרת ל־normal entry flow.

---

## ‏10C.61 Exit Telemetry

```text
exit_decision_id
reconciled_position_qty_at_decision
application_execution_mode
exit_authority
protection_authority
protection_architecture
protected_qty
potential_exit_qty
behavior_candidate
selection_reason_code
requested_exit_qty
filled_exit_qty
remaining_reconciled_position_qty
economic_price_bound
stop_trigger_price
stop_trigger_ts
protection_cancel_request_ts
protection_cancel_terminal_ts
local_exit_submit_ts
first_exit_fill_ts
flat_confirmed_ts
unprotected_window_ms
handoff_window_ms
```

---

## ‏10C.62 Metrics מרכזיים

```text
time_from_exit_signal_to_first_fill
full_exit_latency
partial_exit_rate
exit_slippage_bps
exit_markout
emergency_escalation_count
unprotected_time_ms
double_exit_incidents
orphan_exit_incidents
stop_trigger_to_fill_slippage
stop_limit_nonfill_rate
handoff_failure_rate
reconnect_to_protected_state_ms
```

‏אלה Execution + Safety metrics, לא רק average exit price.

---

## ‏10C.63 Failure Matrix ל־Exit

| מצב | סיכון | Destination עקרוני |
|---|---|---|
| ‏Position קיימת, protection חסרה | Unprotected exposure | ‏Protect / Reduce / Freeze Entries |
| ‏Local exit + Stop פעילות יחד | Double exit | ‏Authority + quantity budget |
| ‏TP partial | Protection גדולה מדי | ‏Reconcile / resize safely |
| ‏Stop triggered, sibling cancel pending | Both can fill | ‏Treat sibling as executable |
| ‏Exit cancel pending | Replacement overlap | ‏Bound worst-case qty |
| ‏Disconnect עם Position | Unknown broker truth | ‏Recovery gate |
| ‏Manual partial close | Ownership/protection mismatch | ‏Reconcile authorities |
| ‏Child rejected | Position unprotected | ‏Fresh protection/risk decision |
| ‏Stop-Limit triggered, no fill | Position remains | ‏Fresh Fast/Emergency decision |
| ‏Market halt | Exit path constrained | ‏Preserve truth/protection, reevaluate |
| ‏Data stale | Local decision quality degraded | ‏Exit-only / protection policy |
| ‏Both exits filled | Position reversed | ‏Incident + neutralization policy |

---

## ‏10C.64 Acceptance Tests

```text
1. Normal exit full fill
2. Normal exit partial fill
3. Fast exit full fill
4. Fast exit partial -> fresh decision
5. Emergency reduce multi-step
6. Broker stop active + local exit requested
7. Stop triggers during local exit
8. TP partial then protection reconciliation
9. Stop cancel pending then local exit
10. Local exit fills while stop cancel pending
11. Both exits fill unexpectedly
12. Parent partial + child activation/qty observation
13. Child rejected after entry fill
14. Manual partial close while bracket active
15. Disconnect with protected position
16. Disconnect with unprotected position
17. Restart with bracket still live
18. Stop trigger with gap
19. Stop-Limit trigger without fill
20. Data stale while broker stop remains active
21. Dust position after partial exit
22. Capability failure during exit
23. Old-generation callback after reconnect
24. Flat verification with no live exits
25. untransmitted child is never classified as protected
26. handoff never assumes cancel atomicity
```

---

## ‏10C.65 Property Tests

```text
new local exit must never increase worst-case exit qty beyond reconciled position
smaller reconciled position must never leave larger intentionally active protection
cancel-pending exit must continue to consume exit quantity budget
signal invalidation may increase urgency but must not bypass quantity invariants
unknown broker state must never produce an unbounded replacement order
FLAT_CONFIRMED requires zero reconciled position and zero potentially executable exits
UNTRANSMITTED must never imply BROKER_PROTECTED
```

---

## ‏10C.66 Recommendation ל־V1 Exit Architecture

‏למחקר נשווה:

```text
A. CLIENT_MANAGED_EXIT
B. BROKER_BRACKET
C. HYBRID_PROTECTION
```

‏`HYBRID_PROTECTION` מעניינת במיוחד משום שהיא משלבת broker survivability עם local signal-aware exit, אך היא דורשת handoff/race tests קשים יותר.

‏זו Research Architecture, לא Production default אוטומטי.

---

## ‏10C.67 למה לא לבחור Architecture לפי P&L בלבד

‏Architecture צריכה להימדד גם לפי:

```text
execution quality
unprotected time
recovery correctness
double-exit risk
operational complexity
broker dependency
```

‏Trade Outcome ו־Execution/Protection Quality הם dimensions שונים.

---

## ‏10C.68 Why / When / Why Not — `NORMAL_EXIT`

### ‏Why

‏מאפשר price improvement כאשר Risk עדיין בשליטה.

### ‏When

‏Market orderly, Position מוגנת ויש זמן מסוים לעבוד את ה־Exit.

### ‏Why Not

‏כאשר missed-exit cost עולה מהר או Protection אינה אמינה.

---

## ‏10C.69 Why / When / Why Not — `FAST_EXIT`

### ‏Why

‏מקצר exposure כאשר trade thesis מתפרקת.

### ‏When

‏Reversal/edge decay מהותיים ו־position risk עולה.

### ‏Why Not

‏כאשר aggressive execution cost גדול יותר מה־risk reduction שהיא מספקת תחת ה־Policy.

---

## ‏10C.70 Why / When / Why Not — `EMERGENCY_REDUCE`

### ‏Why

‏מעדיף הורדת Risk על price optimization רגילה.

### ‏When

‏Unprotected position, hard risk breach או system degradation מהותי.

### ‏Why Not

‏לא להפוך noise רגיל ל־Emergency; זה Mode בטיחותי, לא default execution style.

---

## ‏10C.71 Why / When / Why Not — `BROKER_BRACKET`

### ‏Why

‏Protection/relationships יכולות להתקיים מחוץ ל־local strategy loop.

### ‏When

‏Survivability חשובה וה־partial/race/recovery semantics עברו acceptance testing.

### ‏Why Not

‏כאשר dynamic exit משתנה מהר וה־coordination complexity אינה מוצדקת.

---

## ‏10C.72 Why / When / Why Not — `HYBRID_PROTECTION`

### ‏Why

‏משלב Broker backstop עם Local intelligence.

### ‏When

‏Signal-aware exit חשובה אבל אסור להישאר ללא protection בזמן local failure.

### ‏Why Not

‏כאשר אין State Machine שמסוגלת לנהל authority handoff, potential exposure ו־double-exit prevention.

---

## ‏10C.73 Practitioner Rules — Exit

1. ‏Exit היא קודם בעיית Ownership ו־quantity truth; המחיר מגיע אחר כך.
2. ‏`CANCEL_REQUESTED`, ‏`CANCEL_PENDING` ו־`CANCEL_UNKNOWN` אינם terminal.
3. ‏`FLAT_CONFIRMED` הוא state שמוכיחים, לא intent.
4. ‏Protection Authority ו־Exit Authority יכולות להיות שונות; handoff אינו atomic.
5. ‏Partial Exit יוצרת Decision State חדשה.
6. ‏Stop יכולה להיות backstop מצוין ועדיין לא להיות Normal Exit טובה.
7. ‏Stop-Limit מחליפה price uncertainty ב־non-fill risk.
8. ‏Emergency משנה priorities; היא לא מבטלת quantity/bound controls.
9. ‏Broker-resident protection מקבלת את עיקר ערכה דווקא ב־failure path.
10. ‏Architecture נבחנת גם ב־recovery, restart ו־manual-intervention paths.

---

# ‏עובדות `IBKR` שאומתו עבור 10C

- ‏`FACT` — `Order.parentId` משמש לקשר parent/child, כולל attached/bracket orders.
- ‏`FACT` — `Order.transmit=false` משאיר Order ב־TWS ולא שולח אותה ל־IB server; לפי התיעוד שנבדק Orders כאלה זמינות רק באותה session ונמחקות ב־restart.
- ‏`FACT` — `Order.ocaType` תומך ב־cancel/proportional-reduction modes, אך הקורס אינו מפרש זאת כ־transactional atomicity.
- ‏`FACT` — `triggerMethod` הוא חלק מ־Stop semantics עבור simulated stops.
- ‏`FACT` — Modify ב־TWS API נעשית באמצעות `placeOrder` עם אותו `orderId`; התיעוד ממליץ לצמצם in-place changes לשדות מתאימים במקום להשתמש ב־modify כ־arbitrary transformation.
- ‏`FACT` — Binding של Order חיצונית יכולה לכלול cancel/resubmit ולהשפיע על queue priority, ולכן recovery/control action יכולה לשנות execution economics.

---

# ‏מקורות רשמיים לחלק 10C

- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR TWS API — Placing Orders / `Transmit`: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/place-order/introduction>
- ‏IBKR TWS API — Modifying Orders: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/modifying-orders>
- ‏IBKR — Order Types and Algos / Stops and Adjustable Stop: <https://www.interactivebrokers.com/en/trading/ordertypes.php>

---

# ‏Checkpoint — סוף חלק 10C

‏בחלק הזה Exit נורמלה לאותן שכבות קנוניות של שאר הקורס: `NORMAL_EXIT`, ‏`FAST_EXIT` ו־`EMERGENCY_REDUCE` הן `Application Execution Modes`; ‏`Behavior Candidate` מתארת את דרך הביצוע; ‏`STOP_BACKSTOP`, ‏`BROKER_BRACKET` ו־`HYBRID_PROTECTION` שייכות ל־Protection Architecture; ו־Exit Authority/Protection Authority קובעות מי רשאי ליצור שינוי חדש בכל רגע.

‏העיקרון המרכזי הוא: **לפני בחירת מחיר או Candidate, המנוע חייב לדעת מהי `reconciled_position`, אילו Exit/Protection Orders עדיין potentially executable, מי מחזיק Authority, ומהו worst-case quantity אם כמה paths יבוצעו יחד. כל Partial Fill, fallback, escalation או handoff מחייבים fresh decision/reconciliation לפי המצב החדש.**

# ‏חלק 10D — Full Decision Engine: Orchestration, Precedence ו־Single Decision Authority

> ‏לפי ה־taxonomy הקנונית ב־`00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md`, חלק 10D מחבר את 10A, ‏10B ו־10C תחת Orchestrator יחיד. הוא מפריד בין `System Operating Mode`, ‏Semantic Decision, ‏`Application Execution Mode`, ‏`Behavior Candidate`, ‏Exit/Protection Authority ו־Broker lifecycle.

---

## ‏10D.1 המטרה: Orchestrator אחד, לא שלושה מנועים עצמאיים

‏התפקידים נשארים נפרדים:

```text
10A = Eligibility, constraints and elimination gates
10B = Entry mode + behavior selection
10C = Position, protection and exit decision
10D = Orchestration, precedence and command authority
```

‏אבל רק 10D מוסמכת להחליט איזו obligation מקבלת קדימות במחזור הנוכחי.

‏הלולאה הקנונית:

```text
Events
→ Normalize Facts
→ Persist Facts
→ Reduce State
→ Build Immutable Decision Snapshot
→ Orchestrator
→ Relevant 10A / 10B / 10C pipeline
→ Semantic Decision
→ Persist Decision / Command Intent
→ Command Dispatcher
→ Broker
→ New Events
```

> ‏`ENGINE INVARIANT` — Event אינה Command. ‏Callback, Timer, Scanner ו־Risk Monitor מייצרים Facts/Triggers בלבד; הם אינם שולחים fallback או replacement בעצמם.

---

## ‏10D.2 `Decision Engine` אינה Broker Adapter

‏ה־Decision Engine מחזירה Semantic Decision, למשל:

```text
NO_ACTION
NO_TRADE
DEFER
CANCEL_ENTRY
KEEP_ENTRY
SUBMIT_ENTRY
REEVALUATE_ENTRY
PROTECT_POSITION
SUBMIT_EXIT
CANCEL_EXIT
RECONCILE_ONLY
FREEZE_NEW_RISK
```

‏אם נבחרה Entry/Exit לביצוע, ה־Decision נושאת גם:

```text
application_execution_mode
behavior_candidate
constraints
reason_code
```

‏רק `Command Dispatcher` וה־Broker Adapter מתרגמים זאת ל־Order primitive, ‏TIF, attributes, route, broker algo ו־API fields.

---

## ‏10D.3 `System Operating Mode` אינו Semantic Action

‏ה־modes הגלובליים הם:

```text
BOOTING
RECOVERING
READY
ENTRY_DISABLED
EXIT_ONLY
DEGRADED
EMERGENCY
FROZEN
```

‏Mode מגבילה אילו Decisions חוקיות; היא אינה בעצמה Broker command.

‏לדוגמה:

```text
SystemMode = EXIT_ONLY
Decision   = SUBMIT_EXIT
ExitMode   = FAST_EXIT
Behavior   = MARKETABLE_LIMIT_IOC
```

‏אלה ארבע שכבות שונות.

---

## ‏10D.4 כלל העל: Existing Risk קודם ל־Optional Risk

‏כאשר יש התנגשות בין Opportunity חדשה לבין:

```text
unknown position
unprotected position
cancel race
broker unreconciled
exit/protection already potentially executable
```

‏ה־precedence היא:

```text
resolve or contain existing risk first
```

‏Entry חדשה היא Optional Risk; Position קיימת היא Risk שכבר קיים.

---

## ‏10D.5 סדר עדיפויות גלובלי קנוני

```text
P0  CAPITAL / POSITION SAFETY
P1  BROKER TRUTH / RECONCILIATION
P2  PROTECTION OF EXISTING POSITION
P3  EXIT DECISION / RISK REDUCTION
P4  CANCEL / INVALIDATE STALE ENTRY
P5  NEW ENTRY DECISION
P6  EXECUTION OPTIMIZATION / PRICE IMPROVEMENT
P7  RESEARCH / SHADOW EVALUATION
```

‏Priority גבוהה יכולה לדכא נמוכה יותר גם אם ה־Signal החדשה אטרקטיבית מאוד.

---

## ‏10D.6 `DecisionCycle`

```text
1. read immutable state snapshot
2. validate snapshot consistency
3. classify System Operating Mode
4. derive obligations
5. select highest-priority legal obligation
6. invoke relevant 10A / 10B / 10C pipeline
7. emit Semantic Decision
8. persist Decision
9. derive and persist CommandIntent if needed
10. re-check command preconditions
11. dispatch side effect
12. wait for new Facts / timer trigger
13. repeat
```

‏אין loop פנימי של “שלח שוב עד Fill”.

---

## ‏10D.7 Snapshot חייב להיות Immutable בתוך Decision

```text
DecisionSnapshot {
  snapshot_id
  snapshot_ts
  policy_version
  config_snapshot_id
  market_version
  broker_state_version
  position_version
  capability_snapshot_id
  risk_version
}
```

‏Market או Broker Fact חדשה אינה משנה Decision שכבר רצה; היא יוצרת revision חדשה.

---

## ‏10D.8 `BOOTING`

‏ב־Boot:

```text
new entry = forbidden
load durable state
connect broker
initialize identifiers
load configuration
start market data
begin reconciliation
```

‏Signal חדש אינו גובר על חוסר ידיעה לגבי Broker truth.

---

## ‏10D.9 `RECOVERING`

```text
new entries = forbidden
position/protection actions = only under recovery policy
broker/order/position truth = being rebuilt
```

‏Recovery היא `Position-First` ו־`Ownership-First`.

> ‏`ENGINE RULE` — Recovery אינה מחיה Signal או Trade Intent שפגו בזמן שהמערכת הייתה לא זמינה.

---

## ‏10D.10 `READY` הוא Earned State

‏Reconnect לבדו אינו מספיק.

‏`READY` מתקבל רק לאחר שה־required invariants עברו, למשל:

```text
broker connected
open orders reconciled
executions reconciled
positions reconciled
unknown ownership classified
protection state reconciled
market data healthy enough
critical capabilities valid
risk engine healthy
persistence healthy
```

> ‏`ENGINE INVARIANT` — `CONNECTED != READY`.

---

## ‏10D.11 `ENTRY_DISABLED`

‏המערכת יכולה להיות בריאה מספיק לניהול Positions ועדיין לחסום Risk חדש, למשל בגלל:

```text
session policy
loss/risk limit
capability degradation
manual risk control
strategy disablement
```

‏Existing Positions עדיין מקבלות Protection/Exit management.

---

## ‏10D.12 `EXIT_ONLY`

```text
no new entries
no position increase
allow actions that preserve or reduce existing exposure
```

‏זה Mode טבעי כאשר Entry path אינה בטוחה אך Position קיימת עדיין דורשת ניהול.

---

## ‏10D.13 `DEGRADED`

‏`DEGRADED` אינו synonym ל־`UNKNOWN`.

‏הוא System Mode שבו חלק מהיכולות אינן תקינות, אך Policy יודעת אילו actions עדיין מותרות.

‏לדוגמה:

```text
one research capability disabled
core exits still healthy
=> DEGRADED, not necessarily FROZEN
```

---

## ‏10D.14 `EMERGENCY`

‏ב־Emergency:

```text
risk reduction > ordinary price optimization
```

‏אבל עדיין חלים:

```text
reconciled quantity bounds
existing-order overlap checks
duplicate prevention
session / halt awareness
explicit emergency Economic Price Bound policy
```

‏Emergency אינה `send Market blindly`.

---

## ‏10D.15 `FROZEN`

‏כאשר invariant קריטי נשבר ואין פעולה רגילה שניתן להצדיק בבטחה:

```text
normal new side effects = blocked
only explicitly authorized safety/recovery actions may remain
```

‏`FROZEN` היא control state. ‏`UNKNOWN` היא epistemic state. אין לערבב ביניהן.

---

## ‏10D.16 סדר ההכרעה בתוך Symbol

```text
1. MATERIAL UNKNOWN / INCONSISTENT STATE?
2. RECONCILED POSITION EXISTS?
3. PROTECTION RESPONSIBILITY SATISFIED?
4. EXIT / RISK REDUCTION REQUIRED?
5. ENTRY ORDER ALREADY POTENTIALLY EXECUTABLE?
6. EXISTING ENTRY STILL VALID?
7. NEW / ADD / REENTRY INTENT EXISTS?
8. RUN 10A
9. RUN 10B IF ALLOWED
```

‏Position קיימת אינה נבלעת בלוגיקת Scanner חדשה.

---

## ‏10D.17 `Position First`

‏ה־Position vocabulary הקנוני הוא:

```text
execution_ledger_position
broker_reported_position
reconciled_position
```

‏כאשר קיימת `reconciled_position` שאינה Flat, 10C מקבלת precedence לפני Entry חדשה.

‏אם Position truth עדיין אינה reconciled, אין להשתמש ב־local quantity כאילו היא Fact סופית.

---

## ‏10D.18 Entry חדשה, Add ו־Reentry הן Intents שונות

```text
OPEN_NEW_POSITION
ADD_TO_POSITION
REENTER_AFTER_EXIT
```

‏`ADD_TO_POSITION` אינה shortcut של Entry רגילה: היא דורשת Position/Protection/Exit ownership תקינים לפני הגדלת exposure.

‏`REENTER_AFTER_EXIT` דורשת `FLAT_CONFIRMED`, לא רק local quantity אפס.

---

## ‏10D.19 `FLAT_CONFIRMED` הוא Fact מורכב

‏נרצה לפחות:

```text
reconciled_position == 0
no potentially executable entry contradiction
no potentially executable exit/protection contradiction
no material unknown broker order
executions reconciled
broker position reconciled
```

‏רק אז ניתן להתייחס ל־Symbol כ־Flat מבחינת lifecycle חדש.

---

## ‏10D.20 Broker Event אינו Command Trigger אוטומטי

‏Anti-pattern:

```text
onPartialFill -> immediately submit remainder
onReject      -> immediately send fallback
onCancelAck   -> immediately submit replacement
```

‏המסלול הקנוני:

```text
event
→ normalize Fact
→ persist Fact
→ reduce State
→ trigger Decision
→ maybe NO_ACTION
```

---

## ‏10D.21 Events שמעוררים Re-evaluation

```text
ORDER_ACK
ORDER_REJECTED
ORDER_PARTIAL_FILL
ORDER_FILLED
ORDER_CANCELLED
ORDER_MODIFIED
STOP_TRIGGERED
CONNECTION_LOST
CONNECTION_RESTORED
POSITION_UPDATE
CAPABILITY_CONFLICT
MANUAL_ACTIVITY_DETECTED
TIMER_EXPIRED
MARKET_STATE_CHANGED
SIGNAL_CHANGED
```

‏Re-evaluation אינה הבטחה ל־side effect.

---

## ‏10D.22 `Decision Trigger` ו־`Decision Reason`

‏נשמור בנפרד:

```text
trigger = BROKER_FILL
reason  = POSITION_CHANGED
```

‏או:

```text
trigger = TIMER_EXPIRED
reason  = APPLICATION_ORDER_TTL_EXPIRED
```

‏כך אפשר למדוד מה עורר evaluation ומה באמת שינה policy outcome.

---

## ‏10D.23 Priority Queue של Obligations

```text
RECONCILE_BROKER
REPAIR_PROTECTION
REDUCE_EXPOSURE
CANCEL_STALE_ENTRY
MAINTAIN_VALID_EXIT
MAINTAIN_VALID_ENTRY
OPEN_NEW_POSITION
IMPROVE_EXECUTION
RUN_SHADOW_EVALUATION
```

‏ה־Orchestrator בוחר obligation בעלת precedence הגבוהה ביותר שמותר לבצע כרגע.

---

## ‏10D.24 Obligation אחת יכולה לדכא אחרת

‏לדוגמה:

```text
REPAIR_PROTECTION
```

‏מדכאת:

```text
OPEN_NEW_POSITION
IMPROVE_EXECUTION
```

‏עד ש־Protection responsibility חוזרת למצב תקין.

---

## ‏10D.25 `NO_ACTION`, ‏`NO_TRADE` ו־`DEFER` אינם אותו דבר

```text
NO_ACTION
=> no new side effect is required in this cycle

NO_TRADE
=> evaluated opportunity is not eligible for entry now

DEFER
=> temporary missing/uncertain fact requires a future fresh decision
```

‏`NO_ACTION` יכולה להיות החלטה נכונה כאשר קיימת Order תקפה שצריך להשאיר ללא שינוי.

---

## ‏10D.26 `HOLD` הוא Exit Disposition מפורש

‏כאשר Position קיימת:

```text
HOLD
=> position remains intentionally open
=> protection is acceptable
=> no exit obligation currently dominates
```

‏`HOLD` דורשת reason code; היא אינה absence of logic.

---

## ‏10D.27 Timers אינם Commands

‏ארבעת ה־clocks הקנוניים נשארים:

```text
signal_ttl
application_order_ttl
broker_tif
working_order_age
```

‏Timer של `application_order_ttl` שפג מפעיל Decision חדשה. הוא אינו מבצע Cancel ישירות מתוך scheduler.

---

## ‏10D.28 Decision Precedence — Skeleton

```text
if system_mode == FROZEN:
    return safety_or_recovery_decision(snapshot)

if material_broker_or_position_truth_unknown(snapshot):
    return RECONCILE_ONLY

if reconciled_position_exists(snapshot):
    exit_decision = run_10C(snapshot)
    if exit_decision.requires_action_or_hold:
        return exit_decision

existing_entry_decision = evaluate_existing_entry(snapshot)
if existing_entry_decision.requires_action:
    return existing_entry_decision

if system_mode != READY:
    return NO_ACTION

if no_new_entry_intent(snapshot):
    return NO_ACTION

envelope = run_10A(snapshot)
if envelope.disposition != ALLOW_ENTRY:
    return map_10A_disposition(envelope)

return run_10B(snapshot, envelope)
```

‏זהו contract ארכיטקטוני, לא המלצה לפזר `if` כאלה בכמה callbacks.

---

## ‏10D.29 Entry Plan אינה Side Effect עד Commit Point פנימי

```text
decision created
→ invariants checked
→ CommandIntent derived
→ CommandIntent persisted
→ dispatch preconditions rechecked
→ side effect dispatched
```

‏כך crash בין Decision לשליחה נשאר ניתן לשחזור.

---

## ‏10D.30 `CommandIntent` קנוני

```text
CommandIntent {
  command_id
  decision_id
  internal_order_id
  command_type
  expected_effect
  max_qty
  economic_price_bound
  broker_tif
  expires_at
  preconditions
  state_version
}
```

‏`economic_price_bound` הוא אותו מושג שנקבע ב־10A–10C; אין alias נפרד של `hard cap` ברמת Orchestrator.

---

## ‏10D.31 Precondition Check רגע לפני Send

```text
is state_version still current?
is reconciled quantity budget still valid?
is Decision still unexpired?
is System Operating Mode still compatible?
is required capability still enabled?
is ownership unchanged?
```

‏אם אחד מהם נכשל, CommandIntent אינה נשלחת ומופעל fresh decision.

---

## ‏10D.32 `Stale Decision Execution` היא Failure Class

‏תרחיש:

```text
Decision: BUY 100
before dispatch: old order fills 60
```

‏Command guard חייב לחסום את ה־BUY הישן אם quantity/exposure assumptions השתנו.

---

## ‏10D.33 Rejection Pipeline

```text
classify rejection
→ normalize Fact
→ update order/broker state
→ update capability evidence if relevant
→ update risk/ownership if relevant
→ fresh Decision
```

‏אין:

```text
onReject -> sendFallback()
```

---

## ‏10D.34 Failure Classes

```text
CAPABILITY_FAILURE
VALIDATION_FAILURE
PRICE_INCREMENT_FAILURE
TEMPORARY_PROCESSING_FAILURE
CONNECTIVITY_FAILURE
ROUTE_FAILURE
ORDER_ALREADY_TERMINAL
OWNERSHIP_CONFLICT
STATE_VERSION_CONFLICT
UNKNOWN_FAILURE
```

‏כל class מקבלת `failure_destination`; destination יכולה להיות `REDECIDE`, ‏`RECONCILE`, ‏`DISABLE_CANDIDATE`, ‏`EXIT_ONLY`, ‏`FROZEN` או Incident path לפי חומרה.

---

## ‏10D.35 `Fallback` אינה `Escalation`

### ‏Fallback

‏Implementation/Capability שנבחרה אינה זמינה או נכשלה; מעדכנים Facts וחוזרים ל־Decision חדשה. החלופה יכולה להיות פחות אגרסיבית, יותר אגרסיבית או `NO_TRADE`.

### ‏Escalation

‏Risk/Urgency/Market state השתנו כך ש־fresh decision מצדיקה Mode אגרסיבי יותר.

> ‏`ENGINE RULE` — Capability failure לבדה אינה authorization ל־Escalation.

---

## ‏10D.36 Escalation דורשת Economics מחדש

‏מעבר כגון:

```text
PASSIVE_JOIN
→ ADAPTIVE_LIMIT_URGENT
→ MARKETABLE_LIMIT_IOC
```

‏אפשרי רק אחרי fresh evaluation של:

```text
signal validity
remaining signal life
remaining executable edge
reconciled position/exposure
Economic Price Bound
exit feasibility
capability state
```

---

## ‏10D.37 Escalation Budget גלובלי ל־Intent

```text
attempt_count
total_elapsed_ms
cumulative_price_concession
cancel_replace_count
broker_algo_restart_count
```

‏כל Decision חדשה רואה את התקציב המצטבר שכבר נצרך.

---

## ‏10D.38 `Opportunity Supersession`

```text
new opportunity != old execution risk disappeared
```

‏Flow:

```text
mark old intent SUPERSEDED
request cancellation if required
keep old order in exposure budget until terminal evidence
apply/reconcile any late fills
protect/exit any resulting position
release only confirmed-safe capital
then evaluate new opportunity
```

---

## ‏10D.39 Capital Allocation היא State

```text
confirmed_cash_available
reserved_for_live_orders
reserved_for_cancel_requested_orders
reserved_for_cancel_pending_orders
reserved_for_unknown_orders
capital_locked_in_positions
```

‏כך מעבר מהיר בין Symbols אינו יוצר double allocation.

---

## ‏10D.40 Cross-Symbol Arbitration מגיעה אחרי Eligibility

‏הסדר הוא:

```text
filter eligible
→ verify capital / exposure / exit feasibility
→ rank surviving opportunities
```

‏ולא:

```text
rank everything
→ hope the winner is executable and safe
```

‏Strategy ranking אינה עוקפת Risk/Execution gates.

---

## ‏10D.41 `Single Decision Authority`

‏Scanner, Broker Adapter, Timer, Market Data handler ו־Risk Monitor מייצרים Events/Facts.

‏רק Decision Engine/Orchestrator מייצרת Semantic Action.

> ‏`ENGINE INVARIANT` — אין callback שמחליטה בעצמה `cancel`, ‏`replace`, ‏`retry`, ‏`fallback` או `escalate`.

---

## ‏10D.42 `Single Exit Authority`

‏בכל רגע יש authority אחת בלבד שיוזמת **intentional position reduction**:

```text
ExitAuthority =
  NONE
  LOCAL_ENGINE
  RECOVERY_CONTROLLER
```

‏Protection Authority נשמרת בנפרד:

```text
ProtectionAuthority =
  NONE
  BROKER_PROTECTION
  BROKER_BRACKET
  LOCAL_PROTECTION
```

‏Broker Protection עדיין יכולה להיות physically executable בזמן Handoff; לכן `Single Exit Authority` אינה טענה שרק Order אחת יכולה להתבצע.

---

## ‏10D.43 Handoff בין Exit ו־Protection Authorities אינו Atomic

‏ה־protocol:

```text
1. decide local exit is required
2. inspect reconciled position
3. inspect potentially executable protection/exits
4. derive safe overlap/quantity budget
5. request cancel/resize if policy requires
6. treat pending cancel as still executable
7. submit only quantity that remains safe under worst case
8. reconcile executions from all paths
9. earn FLAT_CONFIRMED or establish new protection state
```

‏אין רגע קסום שבו `cancel requested` הופך Protection ללא־קיימת.

---

## ‏10D.44 Emergency יכולה לשנות Handoff Policy — לא את Invariants

‏ב־Emergency Policy יכולה להרשות `OVERLAPPED_REPLACEMENT`/overlap מוגבל אם קיים quantity budget מפורש.

‏אבל:

```text
worst_case_total_exit_qty
```

‏עדיין חייב להיות תחום מול `reconciled_position` וה־risk policy.

---

## ‏10D.45 Reconciliation יכולה לקטוע כל Plan

‏אם מופיעה evidence כגון:

```text
position mismatch
unknown broker order
execution correction
manual activity
broker reconnect
ownership conflict
```

‏Plan קיימת יכולה להפוך invalid ומצב עובר ל־reconciliation.

‏Completion של Plan ישנה אינה חשובה יותר מ־current truth.

---

## ‏10D.46 `Decision Invalidation`

```text
signal invalidated
Economic Price Bound invalidated
state revision changed
position changed
capability changed
System Operating Mode changed
market data became stale
ownership changed
application_order_ttl expired
```

‏Decision יכולה להתבטל לפני dispatch או בזמן working lifecycle.

---

## ‏10D.47 Full Decision Matrix

| System / Position State | Signal / Obligation | Protection | Semantic Decision |
|---|---|---|---|
| `RECOVERING` | כל מצב | לא ידוע/לא reconciled | `RECONCILE_ONLY` או safety action לפי Risk |
| `FROZEN` | כל מצב | כל מצב | Safety/Recovery בלבד |
| `READY`, `FLAT_CONFIRMED` | אין Entry Intent | N/A | `NO_ACTION` |
| `READY`, `FLAT_CONFIRMED` | Entry Intent תקף | N/A | `10A → 10B` |
| Flat + stale live entry | Signal פג/בוטל | N/A | `CANCEL_ENTRY` |
| Position קיימת | Hold condition | תקינה | `HOLD` / `NO_ACTION` |
| Position קיימת | normal exit condition | תקינה | `EXECUTE_EXIT + NORMAL_EXIT` |
| Position קיימת | fast exit condition | תקינה | `EXECUTE_EXIT + FAST_EXIT` |
| Position קיימת | hard risk / emergency | כל מצב | `EXECUTE_EXIT + EMERGENCY_REDUCE` |
| Position קיימת | Protection חסרה | חסרה | `PROTECT_POSITION` / risk reduction |
| Position קיימת | ownership materially unknown | לא ידוע | `RECONCILE_ONLY` |
| `EXIT_ONLY` | Entry Intent חדש | N/A | `NO_TRADE` / Entry denied by mode |
| `ENTRY_DISABLED` | Entry Intent חדש | N/A | `NO_TRADE` / Entry denied by policy |

---

## ‏10D.48 Entry Modes ו־Behavior Candidates בתוך Orchestrator

‏דוגמאות בלבד, לאחר ש־10A כבר אישרה Entry:

| Context | Application Execution Mode | Behavior Candidates אפשריות |
|---|---|---|
| ‏Spread צר + urgency גבוהה | `AGGRESSIVE_CAPPED` | `MARKETABLE_LIMIT_IOC` |
| ‏Spread רחב + זמן קיים | `MIDPOINT_SEEKING` | `MIDPRICE`, `SNAP_MIDPOINT`, `PEGGED_MIDPOINT_DIRECT` |
| ‏Passive intent + quote migration | `BROKER_MANAGED` / `PASSIVE` | `RELATIVE_PRIMARY`, `PASSIVE_JOIN` |
| ‏Passive-only economics | `PASSIVE` | `PASSIVE_POST_ONLY` אם capability מאומתת |
| ‏Signal כמעט פג | `AGGRESSIVE_CAPPED` או none | `MARKETABLE_LIMIT_IOC` או `NO_TRADE` |
| ‏Depth חלשה | לפי survivors | size reduction / partial policy / `NO_TRADE` |

---

## ‏10D.49 Exit Modes, Behaviors ו־Protection Architectures אינם אותה Matrix

### ‏Exit Execution Modes

```text
NORMAL_EXIT
FAST_EXIT
EMERGENCY_REDUCE
```

### ‏Behavior Candidates אפשריות

```text
PASSIVE_JOIN
RELATIVE_PRIMARY
MIDPRICE
ADAPTIVE_LIMIT_NORMAL
ADAPTIVE_LIMIT_URGENT
MARKETABLE_LIMIT_IOC
```

### ‏Protection Architectures / Mechanisms

```text
CLIENT_MANAGED_EXIT
BROKER_BRACKET
HYBRID_PROTECTION
STOP_BACKSTOP
```

‏10C מחברת ביניהם לפי Position, Risk, Capability ו־Authority. אין enum יחיד שמערבב את שלושת הצירים.

---

## ‏10D.50 Pseudocode — Top Level

```text
function decide(snapshot):
    validate_snapshot(snapshot)

    system_mode = classify_system_mode(snapshot)

    if system_mode == FROZEN:
        return decide_safety_or_recovery(snapshot)

    if requires_reconciliation(snapshot):
        return RECONCILE_ONLY

    if has_reconciled_position(snapshot):
        exit_decision = run_10C(snapshot)
        if exit_decision.requires_action_or_hold:
            return exit_decision

    existing_entry = evaluate_existing_entry(snapshot)
    if existing_entry.requires_action:
        return existing_entry

    if system_mode != READY:
        return NO_ACTION

    if not snapshot.intent.new_entry:
        return NO_ACTION

    envelope = run_10A(snapshot)

    if envelope.disposition != ALLOW_ENTRY:
        return map_10A_disposition(envelope)

    return run_10B(snapshot, envelope)
```

---

## ‏10D.51 Pseudocode — Exit Pipeline

```text
function run_10C(snapshot):
    if exit_or_protection_ownership_unknown(snapshot):
        return RECONCILE_ONLY

    if protection_responsibility_unsatisfied(snapshot):
        return PROTECT_POSITION_OR_REDUCE

    if emergency_condition(snapshot):
        return plan_exit(EMERGENCY_REDUCE, snapshot)

    if fast_exit_condition(snapshot):
        return plan_exit(FAST_EXIT, snapshot)

    if normal_exit_condition(snapshot):
        return plan_exit(NORMAL_EXIT, snapshot)

    return HOLD
```

---

## ‏10D.52 Pseudocode — Existing Entry

```text
function evaluate_existing_entry(snapshot):
    if no_potentially_executable_entry(snapshot):
        return NO_ACTION

    if signal_invalid(snapshot):
        return CANCEL_ENTRY

    if entry_constraints_violated(snapshot):
        return CANCEL_ENTRY

    if application_order_ttl_expired(snapshot):
        return REEVALUATE_ENTRY

    return KEEP_ENTRY
```

‏`REEVALUATE_ENTRY` אינה `MODIFY_ENTRY`; היא חוזרת ל־fresh 10A/10B decision.

---

## ‏10D.53 Pseudocode — Command Guard

```text
function dispatch(command_intent, latest_state):
    if command_intent.expired:
        reject_locally(STALE_DECISION)

    if command_intent.state_version != latest_state.version:
        reject_locally(STATE_CHANGED)

    if ownership_changed(command_intent, latest_state):
        reject_locally(OWNERSHIP_CHANGED)

    if violates_quantity_budget(command_intent, latest_state):
        reject_locally(EXPOSURE_CHANGED)

    if capability_no_longer_enabled(command_intent, latest_state):
        reject_locally(CAPABILITY_CHANGED)

    persist_command_intent(command_intent)
    send_to_broker(command_intent)
```

---

## ‏10D.54 Global Invariants

```text
never increase risk while material broker/position truth is unknown
never apply the same execution fact twice
never assume pending cancel is dead
never submit entry beyond current exposure/capital budget
never submit exit beyond safe position/authority budget
never widen Economic Price Bound implicitly
never let expired signal create new entry
never let capability failure auto-escalate aggression
never call FLAT_CONFIRMED before reconciliation
never let callback/timer/adapter bypass Single Decision Authority
```

---

## ‏10D.55 `No Hidden Escalation`

‏שינוי מ־Passive ל־Aggressive, הגדלת Size, הרחבת `Economic Price Bound`, שינוי ל־immediate TIF או מעבר ל־different broker algo חייבים להופיע ב־Decision Trace כבחירה חדשה.

‏Adapter אינו רשאי “לעזור” על דעת עצמו.

---

## ‏10D.56 `DecisionTrace`

```text
DecisionTrace {
  decision_id
  parent_decision_id
  trigger
  reason_code
  snapshot_id
  policy_version
  system_mode
  obligations_considered
  gate_results
  candidates_considered
  selected_disposition
  application_execution_mode
  selected_behavior_candidate
  constraints
  rejected_alternatives
  command_ids
  expires_at
}
```

‏כך ניתן לשחזר שרשרת Decisions ולא רק Order בודדת.

---

## ‏10D.57 Parent Decision ו־Revision Chain

```text
D101 = PASSIVE_JOIN attempt
D102 = CANCEL_ENTRY after application TTL, parent=D101
D103 = fresh MARKETABLE_LIMIT_IOC decision, parent=D102
```

‏D103 אינה “שלב של D101”; היא Decision חדשה המקושרת היסטורית אליה.

---

## ‏10D.58 Decision Outcome

```text
FILLED_FULL
FILLED_PARTIAL
NO_FILL
CANCELLED
REJECTED
SUPERSEDED
EXPIRED
EXITED
EMERGENCY_EXITED
UNKNOWN_RECOVERED
```

‏Partial Fill אינה terminal continuation instruction; היא Fact שמייצרת Position/remaining-intent state חדשה.

---

## ‏10D.59 Execution Quality ו־Trade Outcome הם שני מדדים שונים

### ‏Execution Quality

```text
time_to_useful_fill
price_improvement
slippage_vs_bound
partial_fill_quality
cancel_latency
stale_fill_incidence
exit_completion_latency
```

### ‏Trade Outcome

```text
subsequent_price_move
holding_period_result
net_pnl_or_edge_realization
```

‏Order יכולה לקבל Execution Quality טובה ועדיין להשתייך ל־Trade גרועה, ולהפך.

---

## ‏10D.60 Metrics ברמת Decision Engine

```text
decisions_per_signal
decisions_per_trade
commands_per_decision
redecisions_after_fill
redecisions_after_cancel
reconciliation_interrupt_rate
stale_decision_block_rate
entry_to_exit_transition_ms
protection_repair_count
fallback_count
escalation_count
NO_ACTION_rate
NO_TRADE_rate
DEFER_rate
```

‏Decision churn הוא metric שצריך למדוד, לא מטרה.

---

## ‏10D.61 Safety / Correctness Metrics

```text
unprotected_time_ms
late_fill_incidents
double_exit_prevented_count
double_exit_incidents
orphan_order_incidents
state_mismatch_incidents
recovery_time_ms
ready_reentry_failures
capability_runtime_conflicts
```

---

## ‏10D.62 Acceptance Tests — Orchestrator

```text
1. healthy FLAT_CONFIRMED + valid signal -> 10A then 10B
2. expired signal -> no new entry
3. open position + new signal -> position/protection precedence first
4. unprotected position -> protection/risk reduction before new risk
5. broker unreconciled -> reconcile only
6. stale entry -> cancel before replacement
7. partial entry fill -> protect/reconcile position + fresh decision for remainder
8. IOC zero fill -> fresh re-decision, no blind retry
9. broker reject -> capability/reason update, no direct fallback
10. cancel-pending old entry blocks unsafe new entry
11. superseded symbol waits for confirmed-safe capital release
12. dynamic exit with broker protection follows authority handoff
13. late protection fill during local exit is reconciled
14. connection loss during entry -> no new risk
15. reconnect with live orders -> recovery before READY
16. state changes between decision and send -> command blocked
17. timer fires after order already filled -> no stale cancel side effect
18. duplicate broker event -> no duplicate business side effect
19. kill switch -> no new entries; safety exits remain policy-controlled
20. emergency mode -> risk reduction outranks price optimization
21. manual activity -> ownership/reconciliation before automated mutation
22. capability failure -> candidate disabled/redecision, not hidden aggression
```

---

## ‏10D.63 Property Tests

```text
unknown broker truth must never increase allowed exposure
invalidating a signal must never produce a new entry
reducing capability set must never create hidden aggressive fallback
adding potentially executable qty must not increase free exposure budget
Economic Price Bound must never widen without fresh economic decision
FROZEN must never emit normal entry command
EXIT_ONLY must never increase position
FLAT_CONFIRMED requires reconciled zero position and no material executable contradiction
partial fill must always produce a new decision state
manual ownership change must invalidate incompatible automation decisions
```

---

## ‏10D.64 Deterministic Replay

‏נרצה להזין:

```text
market events
signal events
broker acknowledgements
partial fills
cancel races
rejections
connection events
manual activity events
capability changes
```

‏ולדרוש:

```text
same normalized event stream
+ same config/policy versions
=> same reduced state
=> same semantic decisions
=> same command intents
```

---

## ‏10D.65 Fault Injection

```text
delayed ack
duplicate execution callback
late fill after cancel
child rejection
broker disconnect/reconnect
stale market data
position mismatch
unknown broker order
capability rejection
persistence failure
manual position change during automation
```

‏המטרה היא להוכיח safe state transitions, לא Happy Path בלבד.

---

## ‏10D.66 V1 — Core קטן בכוונה

‏V1 אינה צריכה להפעיל כל advanced order שלמדנו.

```text
System Operating Modes
10A elimination gates
single reducer
single orchestrator
single command dispatcher
reconciliation service
durable decision/command/execution log
```

### ‏Entry Behaviors ראשוניות

```text
PASSIVE_JOIN
MIDPRICE
ADAPTIVE_LIMIT_URGENT
MARKETABLE_LIMIT_IOC
```

### ‏Exit Modes

```text
NORMAL_EXIT
FAST_EXIT
EMERGENCY_REDUCE
```

### ‏Exit Behaviors ראשוניות

```text
PASSIVE_JOIN where still legal
ADAPTIVE_LIMIT_URGENT
MARKETABLE_LIMIT_IOC
```

### ‏Protection בסיסית

```text
STOP_BACKSTOP
```

‏`BROKER_BRACKET` ו־`HYBRID_PROTECTION` אינן נכנסות ל־Production רק משום שהן עשירות יותר; הן דורשות acceptance evidence ל־partial fills, ownership, reconnect ו־handoff.

---

## ‏10D.67 Decision Engine אינה Strategy

‏היא אינה מחליטה איזו מניה צפויה לעלות הכי מהר.

‏היא מקבלת Strategy Intent ושואלת:

```text
what action is legal now?
what existing risk must be handled first?
what execution constraints apply?
which behavior best expresses the current intent?
```

---

## ‏10D.68 Decision Engine אינה Capability Resolver

‏Capability Resolver עונה:

```text
which candidates are eligible in this product/route/API/account/session scope?
```

‏הוא **מסנן** Candidates; הוא אינו בוחר winner.

‏Decision Engine בוחרת רק מתוך survivors.

---

## ‏10D.69 Decision Engine אינה Broker Adapter

‏Broker Adapter אחראי ל־:

```text
concrete broker order construction
API calls
callback normalization
broker error normalization
runtime capability evidence
```

‏ה־Adapter אינו מחליט Strategy, escalation או fallback.

---

## ‏10D.70 Architecture מלאה — Orchestrator במרכז

```text
Scanner / Strategy
      ↓
Trade Intent
      ↓
Normalized Facts + Reducer ───────────────┐
      ↓                                   │
Immutable Decision Snapshot              │
      ↓                                   │
10D Orchestrator                          │
      ├── 10A Eligibility / Gates         │
      ├── 10B Entry Selection             │
      └── 10C Exit / Protection Decision  │
      ↓                                   │
Semantic Decision                         │
      ↓                                   │
Command Intent                            │
      ↓                                   │
Command Dispatcher                        │
      ↓                                   │
Broker Adapter                            │
      ↓                                   │
Broker / Venues                           │
      ↓                                   │
Normalized Events ────────────────────────┘
```

‏כך 10D אינה “אחרי” 10A/10B/10C; היא ה־authority שמחליטה מתי ואיזו מהן להפעיל.

---

## ‏10D.71 Practitioner Rules — Full Decision Engine

### ‏1. רוב הבאגים המסוכנים אינם בחירת Order Type

‏הם ownership, timing, stale state, overlap ו־duplicate side effects.

### ‏2. `NO_ACTION` היא Decision חשובה

‏מנוע טוב אינו משנה Order רק מפני שהגיע tick חדש.

### ‏3. Priority גוברת על Optimization

‏Reconciliation, Protection ו־Risk reduction קודמות ל־price improvement.

### ‏4. Event אינה הוראה

‏Event משנה Facts; Decision Engine מחליטה.

### ‏5. Timer אינה הוראה

‏Expiry מעורר re-evaluation.

### ‏6. Fallback אינה Aggression

‏Alternative יכולה להיות פחות אגרסיבית או `NO_TRADE`.

### ‏7. Decision יכולה להתיישן לפני Send

‏לכן state-version, quantity, ownership ו־capability preconditions קריטיים.

### ‏8. Flat הוא State שצריך להרוויח

‏לא Boolean מקומי.

### ‏9. Capital Reservation רואה גם Orders לא־סופיות

‏אחרת transition בין Symbols יוצר double allocation.

### ‏10. `Single Decision Authority` מפחיתה Race Conditions

‏Modules מדווחים Facts; Orchestrator אחד מחליט.

### ‏11. `Single Exit Authority` אינה מבטלת Broker Protection

‏היא מגדירה מי יוזם intentional reduction; Protection Authority ו־potentially executable Orders עדיין מנוהלות בנפרד.

### ‏12. Production Engine צריכה לדעת לומר `UNKNOWN`

‏`UNKNOWN` מוביל ל־reconciliation, degraded policy או freeze בהתאם לחומרה — לא לניחוש.

---

# ‏Checkpoint — סוף חלק 10D

‏10D מאחדת את 10A, ‏10B ו־10C תחת Orchestrator יחיד עם precedence ברור: Safety ו־Broker Truth לפני Protection, ‏Exit לפני Entry, ו־Optimization רק לאחר שכל החובות הגבוהות יותר סגורות. ‏System Operating Mode, Semantic Decision, ‏Execution Mode, ‏Behavior Candidate, ‏Exit Authority, ‏Protection Authority ו־Broker lifecycle נשארים dimensions נפרדים.

‏העיקרון המסכם: **Events משנים Facts; Reducer בונה State; Orchestrator מחליט; Dispatcher מבצע. שום callback, timer, capability failure או broker rejection אינם רשאים לעקוף את Single Decision Authority.**

# ‏חלק 10E — Entry vs Exit Asymmetry Decision Guide: אותה פקודה, בעיית החלטה שונה

> ‏הפרק הזה הוא שכבת Decision מעל `10B` ו־`10C`. הוא אינו מוסיף Broker Order Types חדשים; הוא מסביר למה אותו `Behavior Candidate`, אותו Broker Primitive ואפילו אותו payload כמעט זהה יכולים לייצג **החלטה עסקית שונה לחלוטין** כאשר משתמשים בהם ל־Entry לעומת Exit.

---

## ‏10E.1 משפט הזיכרון המרכזי

```text
Entry no-fill
can end with NO_TRADE.

Exit no-fill
leaves reconciled_position exposed.
```

‏זו האסימטריה שממנה נגזר כמעט כל ההבדל.

‏ב־Entry אנחנו שואלים:

```text
Should we create exposure at all?
```

‏ב־Exit אנחנו שואלים:

```text
How should we reduce / remove exposure that already exists?
```

> ‏`ENGINE RULE` — Entry ו־Exit יכולות להשתמש באותו Broker Primitive, אבל אינן רשאיות לשתף אוטומטית את אותה Decision Policy.

---

## ‏10E.2 Broker Primitive אינה Purpose

‏נניח בשני המקרים:

```text
BrokerPrimitive = LMT
BrokerTIF       = IOC
BehaviorCandidate = MARKETABLE_LIMIT_IOC
```

‏ב־Entry זה יכול לבטא:

```text
attempt to acquire useful quantity now
within entry Economic Price Bound
otherwise remain flat / smaller than target
```

‏ב־Exit זה יכול לבטא:

```text
attempt to reduce existing reconciled_position now
within exit Economic Price Bound
then re-evaluate any residual position immediately
```

‏ה־Broker רואה Order semantics. המנוע חייב לזכור את ה־**Purpose**.

---

## ‏10E.3 Comparison Matrix — Entry מול Exit

| Dimension | Entry | Exit |
|---|---|---|
| Exposure לפני ההחלטה | בדרך כלל אין exposure חדש מה־intent הנוכחי | כבר קיימת `reconciled_position` |
| שאלת היסוד | האם ליצור exposure | איך להפחית/לסגור exposure |
| `NO_FILL` | יכולה להסתיים ב־`NO_TRADE` / `DEFER` / fresh decision | Position נשארת ולכן risk ממשיך |
| Quantity truth | כמה מותר ליצור תחת `EntryEnvelope` | כמה באמת קיים לפי `reconciled_position` פחות exits קיימות |
| Partial Fill | יצרה Position חדשה שדורשת protection + fresh remainder decision | הפחיתה Position אך הותירה residual exposure |
| Urgency | signal half-life + missed-entry cost | position risk + missed-exit cost |
| Price improvement | יכולה להצדיק אי־כניסה | אינה תמיד מצדיקה הישארות בפוזיציה |
| Escalation | יכולה להסתיים בוויתור על העסקה | חייבת להתחשב ב־residual position וב־risk state |
| Failure destination | cancel/reconcile ואז אולי `NO_TRADE` | reconcile position/protection ואז fresh exit/risk decision |

---

## ‏10E.4 `Economic Price Bound` קיימת בשני הצדדים — אבל המטרה שונה

‏ב־Entry, ה־Bound מגינה מפני יצירת Position במחיר שכבר הורס את economics של ההזדמנות.

‏ב־Exit, ה־Bound מגינה מפני execution שאינה מקובלת לפי Policy/Risk — אבל עצם אי־הביצוע משאיר Position פתוחה.

‏לכן:

```text
Entry bound violation
→ often reject entry / NO_TRADE

Exit bound blocks fill
→ residual position remains
→ fresh risk decision required
```

> ‏`ENGINE RULE` — Exit אינה רשאית להרחיב Bound אוטומטית רק כי ניסיון קודם לא התמלא; אבל גם אינה רשאית להתייחס ל־no-fill כאילו חזרנו ל־flat state.

---

## ‏10E.5 Direction של ה־Bound חייבת להיות מפורשת

‏אין להשתמש בשם עמום כמו:

```text
max_price
```

‏לכל side.

‏ב־BUY אפשר לחשוב על upper economic boundary.

‏ב־SELL אפשר לחשוב על lower economic boundary.

‏אבל המודל הקנוני נשאר:

```text
Economic Price Bound
```

‏עם side-aware validation.

‏כך אותו field semantic נשאר עקבי בלי ליצור aliases שונים ל־Entry ול־Exit.

---

# ‏חלק א — אותו Behavior ב־Entry וב־Exit

## ‏10E.6 `PASSIVE_JOIN` ב־Entry

### ‏Why

‏לנסות לקבל price improvement / spread economics לפני יצירת exposure.

### ‏When

```text
signal has enough remaining life
missed-entry cost is acceptable
passive fill quality is historically useful
exit feasibility remains healthy
```

### ‏Why Not

‏אם no-fill פירושה פספוס Opportunity שה־Edge שלה מתה מהר, waiting cost יכולה להיות גבוהה יותר מן ה־spread שנחסך.

### ‏Failure Destination

```text
no fill / stale signal
→ cancel/reconcile
→ NO_TRADE or fresh entry decision
```

---

## ‏10E.7 `PASSIVE_JOIN` ב־Exit

### ‏Why

‏כאשר Position risk נמוכה יחסית ויש זמן לנסות לשפר את מחיר היציאה.

### ‏When

```text
NORMAL_EXIT
position remains controlled
signal/risk state does not demand immediate reduction
passive waiting remains cheaper than missed-exit risk
```

### ‏Why Not

‏אותה no-fill שב־Entry הייתה יכולה להיות harmless הופכת כאן ל־continued exposure.

### ‏Failure Destination

```text
no fill
→ reconciled_position unchanged
→ reassess risk / remaining edge / protection
→ fresh exit decision
```

‏לכן:

```text
PASSIVE_JOIN entry timeout
!=
PASSIVE_JOIN exit timeout
```

---

## ‏10E.8 `MARKETABLE_LIMIT_IOC` ב־Entry

‏ב־Entry Candidate זו אומרת בקירוב:

```text
Take currently executable liquidity now
up to entry Economic Price Bound
cancel unfilled remainder immediately
```

‏היא מתאימה כאשר:

```text
signal life is short
useful immediate fill matters
stale remainder is undesirable
```

‏אבל `NO_FILL` עדיין יכולה להיות תוצאה תקינה:

```text
IOC returns zero
→ remain flat
→ NO_TRADE / DEFER / fresh decision
```

---

## ‏10E.9 `MARKETABLE_LIMIT_IOC` ב־Exit

‏ב־Exit אותה Candidate אומרת:

```text
Take executable contra liquidity now
up to exit Economic Price Bound
cancel remainder immediately
then inspect residual reconciled_position
```

‏כאן `NO_FILL` אינה סוף התהליך:

```text
IOC returns zero
→ position still exists
→ risk state may be worsening
→ fresh FAST_EXIT / EMERGENCY_REDUCE decision may be required
```

> ‏`ENGINE RULE` — IOC remainder cancellation מסירה את ה־Order; היא אינה מסירה את ה־Position.

---

## ‏10E.10 `MIDPRICE` ב־Entry מול Exit

### ‏Entry

‏`MIDPRICE` יכולה להיות Candidate כאשר price improvement סביב midpoint שווה את סיכון ה־no-fill/latency לפני יצירת Position.

### ‏Exit

‏`MIDPRICE` יכולה להתאים ל־`NORMAL_EXIT` כאשר Position risk נשלטת ויש זמן לחפש price improvement.

‏אבל אם risk עולה:

```text
midpoint no-fill cost
```

‏יכול להיות שונה לחלוטין, כי הוא נמדד מול:

```text
continued position exposure
```

‏ולא רק מול missed opportunity.

---

## ‏10E.11 `ADAPTIVE_LIMIT_URGENT` ב־Entry מול Exit

‏אותו Broker-managed behavior יכול לקבל Purpose שונה:

```text
ENTRY:
delegate urgent execution attempt
while opportunity still exists

EXIT:
delegate urgent risk-reduction execution
while position still exists
```

‏אבל Broker Algo עדיין אינה יודעת אם:

```text
entry signal invalidated
or
exit risk escalated
```

‏ולכן בשני הצדדים local `application_order_ttl` ו־fresh decision נשארות authority של המנוע.

---

# ‏חלק ב — No-Fill אינו אותו Event

## ‏10E.12 Entry No-Fill

‏Entry no-fill יכולה להיות outcome מקצועית טובה.

```text
opportunity existed
price never became acceptable
signal expired
→ stayed flat
```

‏אין חובה “להציל” כל Signal באמצעות escalation.

> ‏`ENGINE RULE` — No-fill ב־Entry אינה כישלון אם האלטרנטיבה הייתה execution גרועה יותר מן ה־Edge המאושרת.

---

## ‏10E.13 Exit No-Fill

‏Exit no-fill משאירה עובדה שאינה נעלמת:

```text
reconciled_position != 0
```

‏לכן ה־failure destination אינה:

```text
DONE
```

‏אלא:

```text
reconcile order state
recompute current position
recompute protection coverage
refresh market/risk state
choose fresh exit disposition/mode/candidate
```

‏זה יכול עדיין להוביל ל־`HOLD` או `NO_ACTION` אם Policy אומרת שה־Position עדיין רצויה ומוגנת — אבל לא משום שה־Order לא התמלאה.

---

## ‏10E.14 Counterexample — “אותו IOC, אז אותה מדיניות Retry”

‏לא.

‏Entry:

```text
IOC no-fill
→ flat
→ retry may be unnecessary
```

‏Exit:

```text
IOC no-fill
→ still long/short
→ retry/escalation question remains open
```

‏Retry policy חייבת להיגזר מ־Purpose ומה־state החדש, לא מסוג ה־Order בלבד.

---

# ‏חלק ג — Partial Fill הוא Decision חדש, אבל מסיבה שונה

## ‏10E.15 Partial Fill ב־Entry

‏נניח:

```text
target_entry_qty = 100
filled = 35
```

‏עכשיו נוצרה Position בפועל.

‏המערכת צריכה לעדכן:

```text
execution_ledger_position
broker_reported_position
reconciled_position
protection coverage
remaining intent
remaining signal life
exit feasibility
```

‏ואז להחליט מחדש אם 65 הנותרות עדיין רצויות.

‏אסור:

```text
remaining_qty = 65
→ blindly resubmit original entry behavior
```

---

## ‏10E.16 Partial Fill ב־Exit

‏נניח:

```text
reconciled_position_before = 100
exit_fill = 35
```

‏העובדה החדשה היא:

```text
reconciled_position_after ≈ 65
```

‏אבל צריך גם לבדוק:

```text
other exit orders still potentially executable?
protection still sized correctly?
pending entry can still increase position?
risk urgency changed?
```

‏ולכן גם כאן:

```text
partial fill
→ fresh decision
```

‏אך ה־decision היא על **residual exposure**, לא על remaining requested order בלבד.

---

## ‏10E.17 Quantity Truth שונה בין הצדדים

‏ב־Entry:

```text
max_new_qty
```

‏נגזרת מ־Entry Envelope, capital/risk/liquidity ו־current exposure.

‏ב־Exit:

```text
safe_new_exit_qty
```

‏נגזרת לפחות מ־:

```text
reconciled_position
minus/against all potentially executable exit/protection quantity
plus pending entry exposure where relevant
```

> ‏`ENGINE INVARIANT` — Exit quantity אינה `original_entry_qty` ואינה `requested_position`; היא נגזרת מ־Position Truth הנוכחית.

---

# ‏חלק ד — Urgency ו־Escalation

## ‏10E.18 Entry Urgency

‏Entry urgency נוצרת בעיקר מ־:

```text
remaining_signal_life
expected missed-move cost
fill opportunity decay
```

‏אבל אם economics נשברות, המנוע יכול לבחור:

```text
NO_TRADE
```

‏זו Exit לגיטימית מה־Decision Process — בלי Position חדשה.

---

## ‏10E.19 Exit Urgency

‏Exit urgency נוצרת מ־:

```text
position risk
signal reversal
protection state
market deterioration
system health
```

‏ככל שה־risk עולה, Mode יכולה לעבור:

```text
NORMAL_EXIT
→ FAST_EXIT
→ EMERGENCY_REDUCE
```

‏אבל כל מעבר הוא fresh decision.

‏אין:

```text
passive timed out
→ therefore automatically cross farther
```

---

## ‏10E.20 Escalation Budget אינו symmetric

‏ב־Entry, budget יכול להסתיים כך:

```text
remaining signal life exhausted
→ cancel
→ NO_TRADE
```

‏ב־Exit, budget יכול להסתיים כך:

```text
application_order_ttl expired
→ cancel/reconcile
→ residual position still exists
→ fresh exit/risk decision
```

‏לכן application TTL זהה במספר milliseconds אינה בהכרח Policy זהה.

---

## ‏10E.21 Counterexample — “אם 500ms טובים ל־Entry, הם טובים גם ל־Exit”

‏לא.

‏אותו 500ms יכול לייצג:

```text
ENTRY:
maximum patience before abandoning opportunity

EXIT:
maximum patience before reconsidering how to reduce existing risk
```

‏ה־clock אולי זהה; המשמעות אינה זהה.

---

# ‏חלק ה — Exit Feasibility כבר לפני Entry

## ‏10E.22 Entry אינה עצמאית מ־Exit

‏לפני יצירת Position חדשה צריך לשאול:

```text
If this entry fills now,
can we plausibly exit the resulting position
within acceptable time / liquidity / price-risk constraints?
```

‏לכן Exit feasibility היא gate של Entry, לא מחשבה שמגיעה רק אחרי Fill.

‏דוגמאות לסיבות להקטין/לפסול Entry:

```text
entry depth looks sufficient
but opposite-side exit depth is weak

spread acceptable for entry
but likely exit cost destroys net edge

position size can be acquired quickly
but not reduced safely within holding horizon
```

> ‏`ENGINE RULE` — Ability to enter is not sufficient evidence that the position size is safe to create.

---

## ‏10E.23 Same Primitive, Different Economic Question

‏נניח Limit Order פסיבית.

### ‏Entry question

```text
Is expected price improvement worth lower fill probability
before we create exposure?
```

### ‏Exit question

```text
Is expected price improvement worth keeping current exposure open longer?
```

‏זו אינה אותה objective function.

---

## ‏10E.24 Same Fill Price, Different Quality

‏נניח מחיר Fill זהה בשני תרחישים.

‏ב־Entry הוא יכול להיות טוב אם לאחריו המחיר מתקדם לטובתנו.

‏ב־Exit אותו מחיר יכול להיות גרוע אם waiting לפני ה־Fill אפשרה risk/markout שלילי משמעותי.

‏לכן execution quality נמדדת גם מול purpose:

```text
Entry:
fill price
+ time-to-fill
+ missed opportunity
+ post-entry markout

Exit:
fill price
+ time-to-risk-reduction
+ residual exposure duration
+ post-exit avoided/adverse move
```

‏אותו `slippage` מספרי אינו מספיק.

---

# ‏חלק ו — Existing Orders ו־Ownership

## ‏10E.25 Entry working order יכולה להפוך ל־Exit problem

‏תרחיש:

```text
entry partially fills
remainder still working
local engine decides position should exit
```

‏עכשיו יש שתי responsibilities:

```text
cancel / reconcile remaining entry exposure
and
manage exit of actual reconciled_position
```

‏אסור לשלוח Exit כאילו remainder אינה קיימת.

‏Worst-case model צריך לכלול:

```text
pending entry may still buy
+
exit may sell
+
protection may still execute
```

‏עד terminal evidence/reconciliation.

---

## ‏10E.26 `NO_ACTION` שונה בין Entry ל־Exit

### ‏Entry

`NO_ACTION` יכולה לומר:

```text
existing entry order remains valid
no new side effect now
```

### ‏Exit

`NO_ACTION` יכולה לומר:

```text
existing exit/protection architecture remains valid
no new side effect now
```

‏בשני המקרים היא אינה אומרת “אין Risk”. היא אומרת שאין **פעולה חדשה** לבצע כרגע.

---

## ‏10E.27 Failure Destinations

### ‏Entry failure

```text
RECONCILE_ENTRY_ORDER
→ refresh eligibility
→ cancel / NO_TRADE / DEFER / select fresh candidate
```

### ‏Exit failure

```text
RECONCILE_POSITION_AND_EXIT_ORDERS
→ verify protection
→ recompute residual risk
→ HOLD / NORMAL_EXIT / FAST_EXIT / EMERGENCY_REDUCE / RECONCILE_ONLY
```

> ‏`ENGINE RULE` — Failure destination נקבעת לפי Purpose, לא לפי Broker error code בלבד.

---

## ‏10E.28 Decision Record משותף

```text
PurposeAwareExecutionDecision {
  decision_id
  purpose                  // ENTRY | EXIT
  reconciled_position_before
  target_position_after
  application_execution_mode
  behavior_candidate
  economic_price_bound
  application_order_ttl
  broker_tif
  potentially_executable_orders[]
  partial_fill_policy
  no_fill_policy
  escalation_policy
  failure_destination
  protection_requirement
  decision_reason
}
```

‏כך אותו Candidate נשאר אותו Candidate — אבל ה־Purpose ו־state מכתיבים contract שונה.

---

## ‏10E.29 Acceptance Tests

```text
1. The same Broker Primitive may be used for ENTRY and EXIT without sharing the same Decision Policy.
2. Entry NO_FILL may terminate as NO_TRADE when no exposure was created.
3. Exit NO_FILL never implies FLAT_CONFIRMED while reconciled_position is non-zero.
4. IOC remainder cancellation never counts as position reduction by itself.
5. Entry partial fill creates a fresh position/protection decision before retrying remainder.
6. Exit partial fill recomputes residual reconciled_position before any next exit side effect.
7. Exit quantity is derived from reconciled_position and all potentially executable exit/protection orders.
8. Pending entry exposure is included when computing worst-case exit transition exposure.
9. Economic Price Bound is side-aware and cannot be widened automatically by retry/escalation.
10. Expired Entry TTL may lead to NO_TRADE; expired Exit TTL leads to fresh residual-risk decision.
11. PASSIVE_JOIN timeout policy is purpose-aware and not reused blindly between Entry and Exit.
12. MARKETABLE_LIMIT_IOC no-fill has different failure destinations for ENTRY and EXIT.
13. Exit feasibility is evaluated before approving new Entry size.
14. NO_ACTION means no new side effect, not zero exposure or zero risk.
15. Same facts + same purpose + same policy produce the same semantic decision.
```

---

## ‏10E.30 Practitioner Insight

> ‏`ENGINE RULE` — Order semantics אומרות **איך הוראה יכולה להתבצע**; Purpose אומר **מה המשמעות העסקית אם היא מתבצעת, לא מתבצעת או מתבצעת חלקית**.

‏הדרך לזכור:

```text
ENTRY
no-fill can preserve safety by keeping us flat

EXIT
no-fill preserves the risk by keeping us exposed
```

‏ולכן השאלה המקצועית אינה רק:

```text
Which order should I use?
```

‏אלא:

```text
What state remains if this exact order does NOT fill?
```

‏זו אחת השאלות החשובות ביותר לבחירת Advanced Order נכונה.

---

# ‏Checkpoint — סוף חלק 10E

‏יצרנו שכבת Decision שמחברת את Entry ו־Exit בלי לאחד אותן. אותו `Behavior Candidate` או Broker Primitive יכול להופיע בשני הצדדים, אך `NO_FILL`, ‏Partial Fill, ‏TTL, ‏Escalation, ‏Quantity Truth ו־Failure Destination נמדדים לפי Purpose. ב־Entry המערכת יכולה להישאר Flat; ב־Exit המערכת נשארת עם `reconciled_position` עד שה־execution/protection facts מוכיחות אחרת.

# ‏חלק 10F — Comparison Closeout Decision Checklist: מה משנה את התשובה

> ‏הפרק הזה סוגר את שכבת `R4 — Why / When / Why Not + Direct Comparisons`. הוא אינו מוסיף Order Types או Broker facts חדשים. מטרתו היא להוסיף לכל comparison family את השאלה שחייבת להגיע אחרי `Decision Example` ו־`Counterexample`: **מה ישתנה ב־state כך שהבחירה המקצועית תתהפך?**

---

## ‏10F.1 כלל העל

‏Advanced Order אינה "טובה יותר" באופן גלובלי.

```text
same candidate
+ different state
= potentially different correct decision
```

‏לכן בכל השוואה נשמור ארבעה דברים:

```text
Why this candidate wins here
Why the closest alternative loses here
What state variable would reverse the preference
What must be re-evaluated before acting
```

> ‏`ENGINE RULE` — שינוי בתשובה מחייב fresh Decision. הוא אינו authorization ל־fallback או escalation אוטומטיים.

---

## ‏10F.2 `MARKETABLE_LIMIT_IOC` מול `SWEEP_TO_FILL_LIMIT` מול `ADAPTIVE_LIMIT_URGENT`

### ‏למה Candidate אחת מנצחת כאן

```text
very short remaining signal life
+ useful quantity visible/executable now
+ stale remainder is undesirable
→ MARKETABLE_LIMIT_IOC can dominate
```

```text
size exceeds immediately available single-path liquidity
+ multi-venue aggressive consumption has measured value
→ SWEEP_TO_FILL_LIMIT may survive
```

```text
some execution time remains
+ broker-managed scheduling/repricing has validated value
→ ADAPTIVE_LIMIT_URGENT may survive
```

### ‏למה האלטרנטיבה מפסידה כאן

‏האלטרנטיבה מפסידה כאשר היא מוסיפה waiting, delegation או complexity שאינה יכולה להחזיר בתוך remaining signal life.

### ‏מה ישנה את התשובה

```text
remaining_signal_life changes
top-of-book / executable depth changes
order size changes
Economic Price Bound changes
remainder policy changes
broker-algo evidence changes
route/capability changes
```

---

## ‏10F.3 `MARKET_TO_LIMIT` מול Marketable Limit מול `IOC`

### ‏למה Candidate אחת מנצחת כאן

‏`MARKET_TO_LIMIT` מעניינת כאשר initial market-style execution רצויה, אבל remainder רשאית להפוך ל־resting Limit לפי semantics של ה־Order.

‏Marketable Limit ללא `IOC` מתאימה כאשר רוצים explicit Limit boundary ו־remainder רשאית להישאר Working.

‏`MARKETABLE_LIMIT_IOC` מתאימה כאשר remainder stale אינה רצויה ולכן היא צריכה להיעלם מיד לאחר immediate attempt.

### ‏למה האלטרנטיבה מפסידה כאן

```text
MTL loses
if transformed remainder is operationally undesirable

plain marketable Limit loses
if resting remainder may outlive the signal

IOC loses
if useful remainder persistence is part of the intended execution
```

### ‏מה ישנה את התשובה

```text
whether remainder may remain executable
remaining signal life
need for explicit client-defined execution bound
partial-fill usefulness
ability to observe/reconcile transformed remainder
```

---

## ‏10F.4 `RELATIVE_PRIMARY` מול `MIDPRICE` מול `PEGGED_MIDPOINT_DIRECT` מול `SNAP_MIDPOINT`

### ‏למה Candidate אחת מנצחת כאן

‏הכרעה תלויה קודם כול ב־reference וב־ownership של repricing:

```text
follow same-side quote continuously
→ RELATIVE_PRIMARY

seek midpoint through SMART broker-managed behavior
→ MIDPRICE

need destination-specific continuous midpoint peg
→ PEGGED_MIDPOINT_DIRECT

need one-shot midpoint-derived fixed Limit
→ SNAP_MIDPOINT
```

### ‏למה האלטרנטיבה מפסידה כאן

‏Candidate מפסידה כאשר ה־reference שלה, ה־repricing ownership שלה או ה־routing constraint שלה אינם תואמים את ה־Intent.

### ‏מה ישנה את התשובה

```text
continuous repricing required or not
same-side vs midpoint reference
need for deterministic fixed price after submit
SMART vs Direct capability
stale-signal risk under continuous repricing
remaining application_order_ttl
```

---

## ‏10F.5 `PASSIVE_JOIN` מול `PASSIVE_POST_ONLY`

### ‏למה Candidate אחת מנצחת כאן

‏`PASSIVE_JOIN` מנצחת כאשר passive intent מספיקה ואין requirement שה־Order לעולם לא תיקח liquidity בזמן handling.

‏`PASSIVE_POST_ONLY` מנצחת כאשר maker/passive-only economics היא constraint אמיתית ולא preference.

### ‏למה האלטרנטיבה מפסידה כאן

‏Post Only מפסידה כאשר missed-move cost גדול יותר מן הערך של passive-only constraint.

‏Plain passive Limit מפסידה כאשר arrival race יכולה להפוך אותה marketable וה־taking outcome אינו מותר.

### ‏מה ישנה את התשובה

```text
maker-only requirement
spread / fee economics
arrival-race probability
remaining signal life
missed-move cost
Post Only capability semantics
```

---

## ‏10F.6 `Hidden` מול `Reserve/Iceberg` מול `Discretionary`

### ‏למה Candidate אחת מנצחת כאן

```text
hide displayed presence / visibility
→ Hidden

hide part of total quantity
→ Reserve / Iceberg

hide executable price willingness beyond displayed price
→ Discretionary
```

### ‏למה האלטרנטיבה מפסידה כאן

‏היא מפסידה כאשר היא מסתירה dimension שאינו הבעיה שלנו.

### ‏מה ישנה את התשובה

```text
what information we actually need to conceal
order size relative to market liquidity
fill probability impact
queue / venue semantics
whether hidden executable range remains inside Economic Price Bound
combination capability evidence
```

> ‏`ENGINE RULE` — `NO_SPECIAL_HIDING` תמיד נשארת alternative חוקית כאשר concealment אינה מוסיפה ערך מדיד.

---

## ‏10F.7 `Stop` מול `Stop Limit` מול `MIT` מול `LIT`

### ‏למה Candidate אחת מנצחת כאן

‏הבחירה היא מכפלה של:

```text
trigger direction
×
post-trigger execution
```

‏Market-style post-trigger behavior מעדיפה execution certainty; Limit-style מעדיפה price protection ומקבלת triggered-but-unfilled risk.

### ‏למה האלטרנטיבה מפסידה כאן

‏היא מפסידה אם ה־trigger intent שלה שגוי או אם post-trigger risk trade-off אינו מתאים.

### ‏מה ישנה את התשובה

```text
adverse vs if-touched trigger intent
execution certainty requirement
price-protection requirement
ability to tolerate triggered-but-unfilled exposure
slippage tolerance
protection purpose vs entry purpose
```

---

## ‏10F.8 `Trailing Stop` מול `Adjustable Stop` מול local dynamic exit

### ‏למה Candidate אחת מנצחת כאן

```text
simple path-dependent ratchet + survivability
→ Trailing Stop

predefined broker-side transformation rule
→ Adjustable Stop

context-rich fresh decisions using local state
→ local dynamic exit
```

### ‏למה האלטרנטיבה מפסידה כאן

‏Broker-managed rule מפסידה כאשר current Signal/Risk context חשוב יותר מכלל קבוע; local logic מפסידה כאשר survivability בזמן disconnect היא requirement שאין לה backstop.

### ‏מה ישנה את התשובה

```text
client connectivity assumptions
need for broker-resident survivability
complexity of desired rule
need for current signal / spread / risk context
availability of hybrid protection
ability to reconstruct broker-side path state
```

---

## ‏10F.9 `Bracket` מול `OCA/OCO` מול `Conditional`

### ‏למה Candidate אחת מנצחת כאן

```text
parent-child dependency / protection graph
→ Bracket

peer mutual exclusion / quantity coordination
→ OCA/OCO

predicate-controlled eligibility
→ Conditional
```

### ‏למה האלטרנטיבה מפסידה כאן

‏היא מפסידה כאשר היא פותרת relationship אחר מן הבעיה האמיתית.

### ‏מה ישנה את התשובה

```text
whether relationship is dependency, peer coordination, or predicate
partial-fill behavior
worst-case concurrent executable exposure
broker-side survivability need
acceptance evidence for child/group semantics
whether the client must own the predicate decision
```

---

## ‏10F.10 `SMART` מול Direct Routing

### ‏למה Candidate אחת מנצחת כאן

‏`SMART` מנצחת כאשר broker venue-selection intelligence רצויה והמנוע המקומי אינו צריך destination determinism.

‏Direct מנצחת כאשר Destination עצמה היא requirement של ה־Behavior או חלק מה־research hypothesis, ויש לנו venue-specific evidence מספקת.

### ‏למה האלטרנטיבה מפסידה כאן

‏SMART מפסידה כאשר route determinism/feature support דורשים destination מפורש.

‏Direct מפסידה כאשר local venue model stale, חלקי או לא מצדיק את האחריות הנוספת.

### ‏מה ישנה את התשובה

```text
behavior route requirement
venue-specific capability
freshness of local venue model
fees / liquidity / reject evidence
need for destination determinism
availability of broker routing intelligence
```

---

## ‏10F.11 `MODIFY_IN_PLACE` מול `CANCEL_THEN_NEW` מול `OVERLAPPED_REPLACEMENT` מול Broker-Managed Repricing

### ‏למה Candidate אחת מנצחת כאן

```text
same semantic intent + supported in-place change
→ MODIFY_IN_PLACE may win

strong old/new separation required
→ CANCEL_THEN_NEW may win

transition gap is unacceptable and bounded double-execution risk is explicitly accepted
→ OVERLAPPED_REPLACEMENT may be research candidate

pricing rule itself should follow an external reference without client command churn
→ BROKER_MANAGED_REPRICE may win
```

### ‏למה האלטרנטיבה מפסידה כאן

‏היא מפסידה כאשר היא מחזיקה את ה־wrong risk: excessive cancel gap, modify uncertainty, intentional overlap או stale externally managed repricing.

### ‏מה ישנה את התשובה

```text
intent changed or only materialization changed
current order certainty
queue value / queue uncertainty
remaining signal life
cancel acknowledgement latency
worst-case double-execution budget
broker-managed repricing capability
```

---

## ‏10F.12 אותה Candidate ב־Entry מול Exit

### ‏למה התשובה יכולה להתהפך

```text
Entry no-fill
may leave us safely flat.

Exit no-fill
may leave reconciled_position exposed.
```

‏לכן Candidate פסיבית שעדיפה ב־Entry יכולה להיות גרועה יותר ב־Exit תחת אותו Market Snapshot אם cost of continued exposure גבוה.

### ‏מה ישנה את התשובה

```text
purpose = ENTRY | EXIT
reconciled_position
protection state
remaining signal life
position risk
missed-entry vs missed-exit cost
potentially executable entry/exit/protection orders
```

---

## ‏10F.13 Decision Questions — checklist אחיד לכל Advanced Order comparison

‏לפני בחירה סופית נשאל:

```text
1. What exact execution problem are we solving?
2. What state already exists if this order does nothing?
3. Do we need fill certainty or price protection more?
4. Can the signal / position safely survive waiting?
5. Is partial fill useful, harmful, or a new decision state?
6. What happens to unfilled remainder?
7. Who owns repricing / trigger / routing / coordination after submit?
8. Can the order remain executable after local intent expires?
9. What is the current Economic Price Bound?
10. Which capability evidence is required for this exact product/route/session/path?
11. What is the worst-case concurrently executable quantity?
12. What event would make the current winner lose to its closest alternative?
13. What failure destination is used if the order rejects, does not fill, or becomes UNKNOWN?
14. What broker facts must be reconciled before another risk-increasing side effect?
```

> ‏`ENGINE RULE` — אם אין תשובה ברורה לשאלה 12, ההשוואה עדיין אינה Decision Guide; היא רק תיאור של Order Types.

---

## ‏10F.14 R4 Coverage Index

| Required comparison | Primary source |
|---|---|
| Marketable Limit + IOC vs Sweep-to-Fill vs Adaptive Urgent | `02B-AGGRESSIVE-EXECUTION-DECISION-GUIDE.md` |
| Market-to-Limit vs Marketable Limit vs IOC | `02A-SWEEP-TO-FILL-AND-MARKET-TO-LIMIT.md` + `02B-AGGRESSIVE-EXECUTION-DECISION-GUIDE.md` |
| Passive Limit vs Post Only | `04B-LIQUIDITY-AND-DISPLAY-DECISION-GUIDE.md` |
| Hidden vs Reserve/Iceberg vs Discretionary | `04B-LIQUIDITY-AND-DISPLAY-DECISION-GUIDE.md` |
| Relative vs MidPrice vs Pegged-to-Midpoint vs Snap Midpoint | `05A-DYNAMIC-PRICING-DECISION-GUIDE.md` |
| Stop vs Stop Limit vs MIT vs LIT | `06B-TRIGGER-AND-DYNAMIC-EXIT-DECISION-GUIDE.md` |
| Trailing Stop vs Adjustable Stop vs local dynamic exit | `06B-TRIGGER-AND-DYNAMIC-EXIT-DECISION-GUIDE.md` |
| Bracket vs OCA/OCO vs Conditional | `06C-COMPOSITE-COORDINATION-CONDITIONAL-DECISION-GUIDE.md` |
| SMART vs Direct | `07A-ROUTING-POLICY-DECISION-GUIDE.md` |
| Modify vs Cancel+New vs broker-managed repricing | `08A-MODIFY-REPLACE-AND-REPRICING-DECISION-GUIDE.md` |
| Same primitive / behavior in Entry vs Exit | `10E-ENTRY-VS-EXIT-ASYMMETRY-DECISION-GUIDE.md` |

---

## ‏10F.15 Acceptance Tests — R4 learning contract

```text
1. Every required direct comparison has a canonical source location.
2. Each major comparison states why a candidate can win under one state.
3. Each major comparison states why the closest alternative can lose under that state.
4. Each major comparison lists state changes that can reverse the answer.
5. Decision Questions are expressed as state/risk/ownership questions, not UI order-name questions.
6. No comparison creates a universal best order.
7. No answer-change condition bypasses Economic Price Bound, capability, position truth or system-health gates.
8. Fallback and escalation still require fresh decision.
9. Partial fill remains a new decision state.
10. Entry and Exit remain purpose-asymmetric even when they share the same Broker Primitive.
```

---

# ‏Checkpoint — סוף חלק 10F

‏`R4` נסגרת עם learning contract אחיד: `What / Why / When / Why Not / Closest Alternative / Main Failure Mode`, ‏Decision Example ו־Counterexample בפרקי המשפחה, ובפרק הזה answer-changing conditions ו־Decision Questions אחידות. השאלה המסכמת לכל comparison היא: **איזה שינוי ב־state היה גורם ל־Candidate שבחרנו להפסיד לאלטרנטיבה הקרובה?**

# ‏חלק 10G — Practitioner Judgment Core: איך לא להסיק מסקנות שגויות מ־Advanced Orders

> ‏המטרה כאן אינה להוסיף עוד `Order Type`. המטרה היא ללמד את שכבת ה־judgment שמפרידה בין הכרת syntax לבין Execution מקצועית: איזה inference נראה אינטואיטיבי אבל אינו תקף, מה צריך למדוד במקום, ואיזה contract המנוע חייב לאכוף כתוצאה מכך.

---

## ‏10G.1 פורמט Practitioner Insight הקנוני

‏בכל insight משמעותי נשתמש בארבעה שדות קבועים:

```text
COMMON WRONG CONCLUSION
WHAT ACTUALLY MATTERS
WHAT PROFESSIONALS MEASURE
ENGINE IMPLICATION
```

‏המבנה הזה אינו `FACT` על Broker מסוים. הוא שכבת reasoning מעל ה־semantics שכבר הוגדרו בחלקים הקודמים.

---

## ‏10G.2 Order Name אינו Behavior Guarantee

### `COMMON WRONG CONCLUSION`

```text
I know the order name
→ I know what the order will do
```

### `WHAT ACTUALLY MATTERS`

‏שם כגון `Limit`, ‏`MidPrice`, ‏`Adaptive`, ‏`Relative`, ‏`Bracket` או `Stop` אינו תיאור מלא של ה־execution semantics.

‏צריך לדעת לפחות:

```text
Application Execution Mode
Behavior Candidate
Broker Order Primitive
broker_tif
attributes
Routing Policy
Broker Algo
Economic Price Bound
application_order_ttl
implementation_owner
residency_state
current lifecycle / uncertainty state
```

‏אפילו `Limit` יכולה להיות passive, marketable, IOC, Post Only, Hidden, SMART, Direct או חלק מ־composite structure.

### `WHAT PROFESSIONALS MEASURE`

```text
materialized primitive + parameters
route / destination
broker algo
effective executable price / range
working age
current lifecycle state
potentially executable qty
observed repricing / trigger behavior
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Decision, telemetry ו־replay חייבים להישמר לפי behavior + materialization + ownership, לא לפי `orderType` label בלבד.

---

## ‏10G.3 Advanced Order אינה יוצרת Trading Edge

### `COMMON WRONG CONCLUSION`

```text
more sophisticated order
→ better trade
```

### `WHAT ACTUALLY MATTERS`

‏Advanced Order יכולה לשפר או לשנות את **דרך הביצוע**:

```text
price concession
fill probability
time-to-fill
queue exposure
stale exposure
routing / repricing ownership
protection persistence
```

‏אבל היא אינה הופכת Signal לא תקף ל־Signal תקף ואינה מגדילה אוטומטית expected edge.

```text
weak / expired signal
+
sophisticated execution
=
still weak / expired intent
```

‏לפעמים primitive פשוטה ובעלת boundaries ברורים עדיפה על mechanism מורכב שקשה יותר למדוד, לבטל, לשחזר או לייחס לו outcome.

### `WHAT PROFESSIONALS MEASURE`

```text
expected executable edge before submit
signal age
signal decay during execution
incremental execution cost
complexity / observability cost
failure / recovery burden
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Candidate selection מתחילה רק אחרי שה־Trade Intent עברה eligibility gates. ‏Broker sophistication לעולם אינה bypass ל־Signal validity, ‏Risk או `Economic Price Bound`.

---

## ‏10G.4 `Best Fill` אינו `Best Trade`

### `COMMON WRONG CONCLUSION`

```text
better fill price
→ better execution
→ better trade
```

### `WHAT ACTUALLY MATTERS`

‏צריך להפריד שלוש שכבות:

```text
Execution Quality
Signal Timing Quality
Trade Outcome
```

‏אפשר לקבל Fill שנראה מצוין יחסית ל־NBBO אך מאוחר מדי ביחס ל־Signal.

‏אפשר גם לקבל Fill אגרסיבי יותר בזמן שבו ה־Edge עדיין חי, ולגלות בדיעבד שה־trade עצמה הפסידה — בלי שזה מוכיח שה־execution decision הייתה שגויה.

‏באותה מידה Trade רווחית אינה מוכיחה שה־execution הייתה טובה; ייתכן ששילמנו spread/slippage מיותרים וה־Signal פשוט היה חזק מספיק כדי לכסות אותם.

### `WHAT PROFESSIONALS MEASURE`

```text
arrival_price
fill_price
price_improvement_vs_arrival
spread_paid_or_saved
signal_age_at_decision
signal_age_at_submit
signal_age_at_first_fill
signal_age_at_last_fill
time_to_first_fill
time_to_useful_fill
filled_fraction
post_fill_markout
missed_move_cost
realized_trade_outcome
```

‏המדדים נשמרים בנפרד; אין Metric יחיד בשם `good_fill` שמסכם את כולם.

### `ENGINE IMPLICATION`

```text
ExecutionQualityRecord
!=
TradeOutcomeRecord
```

‏ה־research layer צריכה להיות מסוגלת להגיד:

```text
GOOD_EXECUTION + BAD_TRADE
BAD_EXECUTION + GOOD_TRADE
GOOD_EXECUTION + GOOD_TRADE
BAD_EXECUTION + BAD_TRADE
```

‏בלי למחוק את ההבחנה ביניהם.

> ‏`ENGINE RULE` — ‏PnL לבדה אינה acceptance metric ל־Execution Candidate.

---

## ‏10G.5 Fill Rate לבדה היא Objective מסוכן

### `COMMON WRONG CONCLUSION`

```text
higher fill rate
→ better execution policy
```

### `WHAT ACTUALLY MATTERS`

‏Fill Probability יכולה לעלות פשוט מפני שהמנוע נעשה אגרסיבי יותר, משלם יותר spread, מוותר על price protection או משאיר Orders חיות זמן רב יותר.

‏לכן צריך לבחון יחד:

```text
fill probability
execution cost
stale-fill rate
adverse-selection markout
missed opportunity
signal survival
price-bound discipline
```

‏`NO_FILL` יכולה להיות outcome נכונה כאשר:

```text
price moved outside Economic Price Bound
signal expired
liquidity was insufficient
candidate could not execute without violating policy
```

‏במצבים כאלה “לפתור” No Fill באמצעות aggression נוספת יכול להיות דווקא failure של ה־guardrail.

### `WHAT PROFESSIONALS MEASURE`

```text
fill_rate
no_fill_rate
no_fill_reason_code
price_bound_block_rate
signal_expiry_before_fill
stale_fill_rate
implementation_shortfall
post_fill_markout
missed_move_after_no_fill
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — ‏`NO_FILL` היא execution outcome שחוזרת ל־fresh decision; היא אינה implicit failure ולא authorization להרחיב `Economic Price Bound`.

---

## ‏10G.6 Passive Fill אינה “Fill זול” באופן אוטומטי

### `COMMON WRONG CONCLUSION`

```text
passive fill
→ saved spread
→ good execution
```

### `WHAT ACTUALLY MATTERS`

‏Passive Fill אינה random sample. ה־Order יכולה לקבל Fill דווקא כאשר counterparties מוכנות לבצע מולנו משום שהמחיר עומד לזוז נגדנו.

‏לכן צריך להפריד:

```text
spread capture / price improvement
```

‏מ־:

```text
adverse selection after fill
```

‏Fill במחיר “יפה” יכולה להיות יקרה אם ה־markout מיד לאחריה שלילי מספיק.

### `WHAT PROFESSIONALS MEASURE`

```text
passive fill cohort
passive no-fill cohort
queue_wait_ms
signal_decay_during_wait
markout_100ms
markout_500ms
markout_1s
markout_at_signal_horizon
price_move_after_no_fill
```

‏ה־horizons בפועל צריכים להתאים ל־holding horizon של המחקר; אין horizon מקצועי אוניברסלי אחד.

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — `PASSIVE_JOIN` ו־`PASSIVE_POST_ONLY` נבחנות לפי net execution economics, לא לפי maker/passive label בלבד.

‏Research צריך להשוות Fill ו־No-Fill cohorts כדי שלא למדוד רק את העסקאות שהצליחו להיכנס.

---

## ‏10G.7 Queue Value מול Signal Freshness

### `COMMON WRONG CONCLUSION`

```text
I already waited in queue
→ keep the order because leaving wastes the wait
```

### `WHAT ACTUALLY MATTERS`

‏Queue age/position יכולה להיות asset אמיתית: Modify, Cancel+New או route change עלולים לפגוע בסיכוי העתידי ל־Fill.

‏אבל Queue value היא **conditional asset**. היא שווה משהו רק כל עוד ה־underlying intent עדיין תקפה.

```text
queue value
<
signal validity / risk validity
```

‏“כבר חיכינו” היא sunk-cost argument, לא execution justification.

### `WHAT PROFESSIONALS MEASURE`

```text
working_order_age
estimated / observed queue progress where available
fill probability conditional on wait age
signal age
remaining signal life
markout by queue-wait bucket
modify frequency
cancel-new frequency
fill probability after modify
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Queue preservation יכולה להשפיע על comparison בין surviving candidates, אך אינה יכולה לעקוף Signal expiry, Risk gate או `Economic Price Bound`.

‏Repricing policy צריכה למדוד גם את המחיר של איבוד Queue וגם את המחיר של stale waiting.

---

## ‏10G.8 `IOC` היא גם Experimental-Control Primitive

### `COMMON WRONG CONCLUSION`

```text
IOC is only a TIF that cancels the remainder
```

### `WHAT ACTUALLY MATTERS`

‏מבחינת Research, ‏`MARKETABLE_LIMIT_IOC` יכולה ליצור attempt בעל boundary נקי:

```text
What quantity was executable immediately
within this Economic Price Bound
at this decision time?
```

‏זה מצמצם ערבוב בין:

```text
immediate liquidity
queue waiting
later market movement
signal decay
later liquidity arrival
```

‏לכן IOC אינה בהכרח ה־winner, אבל היא יכולה להיות baseline attribution טוב למחקר.

### `WHAT PROFESSIONALS MEASURE`

```text
attempt timestamp
arrival snapshot
Economic Price Bound
requested qty
immediate filled qty
fill prices
remainder cancelled qty
time_to_terminal
markout
same-opportunity alternative simulation / shadow result
```

### `ENGINE IMPLICATION`

‏Candidate יכולה לקבל שני תפקידים שונים:

```text
production execution candidate
research control / benchmark candidate
```

‏`research_role` אינה authorization ל־Live Side Effect; ‏`LIVE_ENABLED + PRODUCTION_ENABLED capabilities` עדיין נדרשים למסלול חי.

---

## ‏10G.9 Execution Quality מול Trade Outcome — Contract קנוני

‏זהו ה־contract שסוגר את `AO-GAP-P1-17`.

```text
Execution Quality
= how well the execution process expressed the authorized intent
  under the information and constraints available at decision time

Trade Outcome
= what happened economically to the resulting position afterward
```

‏השניים קשורים, אך אינם זהים.

### ‏Execution Quality יכולה לכלול

```text
arrival-relative price
implementation shortfall
fill latency
useful filled fraction
stale-fill avoidance
Economic Price Bound compliance
cancel / unknown handling
partial-fill handling
queue / adverse-selection trade-off
```

### ‏Trade Outcome יכולה לכלול

```text
realized PnL
mark-to-market path
maximum favorable/adverse excursion
exit result
holding-time outcome
```

### ‏`ENGINE IMPLICATION`

‏אסור ל־training/research pipeline לתייג Candidate כ־`GOOD_EXECUTION` רק כי ה־trade הרוויחה.

‏ואסור לתייג אותה כ־`BAD_EXECUTION` רק כי ה־trade הפסידה.

‏צריך לשמור attribution נפרד לפחות ל־:

```text
signal decision
entry execution
position / protection management
exit execution
market outcome
```

---

## ‏10G.10 Practitioner Metrics Bundle

‏במקום Metric יחיד, כל family שנבחנת במחקר צריכה ככל האפשר לקבל bundle עקבי:

```text
Eligibility / intent
  signal_age
  remaining_signal_life
  expected_executable_edge

Execution
  arrival_price
  fill_price
  filled_qty
  filled_fraction
  time_to_first_fill
  time_to_terminal
  implementation_shortfall

Bound discipline
  economic_price_bound
  bound_violation_count
  no_fill_due_to_bound

Passive / queue
  working_order_age
  modify_count
  cancel_new_count
  queue_wait_ms

Outcome conditioning
  post_fill_markout
  no_fill_market_move
  stale_fill_flag
  adverse_selection_proxy

Truth / safety
  unknown_duration_ms
  late_effect_count
  reconciliation_required
  protection_gap_duration_ms when applicable
```

‏לא כל Candidate חייבת להשתמש בכל metric, אבל אותה משפחה צריכה להימדד באופן שמאפשר comparison הוגן.

---

## ‏10G.11 Anti-Patterns שהמנוע חייב לדחות

```text
ORDER_NAME_ONLY_REASONING
ADVANCED_ORDER_CREATES_ALPHA
PNL_PROVES_EXECUTION_QUALITY
PRICE_IMPROVEMENT_PROVES_GOOD_EXECUTION
FILL_RATE_MAXIMIZATION
NO_FILL_IS_ALWAYS_FAILURE
PASSIVE_FILL_IS_ALWAYS_CHEAP
QUEUE_SUNK_COST
IOC_HAS_NO_RESEARCH_VALUE
```

‏אלה אינם Broker error codes. הם review/research anti-patterns שמטרתם למנוע הסקת מסקנות שגויה.

---

## ‏10G.12 Acceptance Tests של שכבת Judgment

```text
1. Trade profitable + late stale fill -> execution quality may still fail.
2. Trade loses + timely bounded fill -> execution quality may still pass.
3. No Fill because price exceeded Economic Price Bound -> guardrail success is representable.
4. Passive fill with negative markout -> spread saved is not treated as sufficient evidence of quality.
5. Long queue age + expired signal -> order is not retained because of sunk wait time.
6. Modify that may improve price but destroy queue -> decision records both dimensions.
7. IOC attempt records immediate executable quantity and terminal remainder cleanly.
8. Research-role candidate cannot create Live side effects without normal enablement gates.
9. Candidate comparison can use fill and no-fill cohorts.
10. Replaying the same DecisionContext does not derive quality from realized future PnL.
```

---

## ‏10G.13 Checkpoint

‏`R7A` מקבע את שכבת ה־Practitioner Judgment הבסיסית וסוגר במפורש:

```text
AO-GAP-P1-05 — consistent Practitioner Insight format
AO-GAP-P1-09 — queue value is subordinate to signal freshness / adverse selection
AO-GAP-P1-17 — Execution Quality != Trade Outcome
```

‏הוא גם מניח את הבסיס ל־insights הספציפיים שנשארו ל־`R7B`, במיוחד `MidPrice`, ‏`Post Only`, ‏Broker Algos, ‏Stops/Trailing, ‏Bracket/OCA ו־Cancel/Modify.

# ‏חלק 10H — Practitioner Judgment לפי משפחת פקודות

> ‏מטרת הפרק: לקחת את ה־`Practitioner Judgment` של חלק `10G` ולהחיל אותו על המשפחות שבהן הכי קל למתחיל להסיק מסקנה שנשמעת הגיונית — אבל בפועל מסוכנת או לא מדויקת.
>
> ‏כל נושא מתחיל קודם ב־**הסבר פשוט**, אחר כך בדוגמה, ורק אז עובר ל־terminology המקצועי ול־Engine implication.

---

## ‏10H.1 כלל הוראה קנוני: פשוט → דוגמה → מונח מקצועי → עומק

‏לפני כל מונח מתקדם נשאל קודם:

```text
What does this mean in plain language?
What simple market situation creates the problem?
Why was this order/mechanism invented?
Only then: what is the professional name and engine contract?
```

> ‏`ENGINE RULE` — עומק מקצועי אינו תחליף להסבר. הקורס צריך להגיע לרמת Execution מקצועית בלי להניח ידע מוקדם במונחים כמו `markout`, ‏`residency`, ‏`atomicity`, ‏`reconciliation` או `ownership`.

---

## ‏10H.2 `MidPrice` אינה “לקבל חצי Spread בחינם”

### ‏במילים פשוטות

‏נניח:

```text
Bid = 100.00
Ask = 100.10
Mid = 100.05
```

‏נראה מפתה לומר:

```text
instead of buying at 100.10
buy at 100.05
→ saved 0.05
```

‏אבל יש בעיה: אף אחד לא חייב למכור לנו ב־100.05.

‏ייתכן שנקבל Fill מצוין.

‏ייתכן שלא נקבל Fill בכלל והשוק יעלה ל־100.30.

‏ייתכן שנקבל Fill בדיוק לפני שהמחיר יירד — כלומר קיבלנו midpoint, אבל ה־Fill עצמה הייתה adverse.

### `COMMON WRONG CONCLUSION`

```text
midpoint price
→ automatic half-spread saving
→ better execution
```

### `WHAT ACTUALLY MATTERS`

‏צריך למדוד יחד:

```text
price improvement
fill probability
time cost
no-fill missed move
post-fill markout
signal age at fill
routing / broker path
```

‏`MidPrice` היא Broker-managed midpoint execution behavior; היא אינה coupon שמעניק חצי Spread בכל ניסיון.

### `WHAT PROFESSIONALS MEASURE`

```text
midpoint_attempt_count
midpoint_fill_rate
time_to_first_fill
signal_age_at_fill
price_improvement_vs_arrival
post_fill_markout
no_fill_future_move
missed_move_cost
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — `MIDPRICE` נשארת Candidate רק כל עוד remaining signal life וה־`Economic Price Bound` עדיין מצדיקים אותה. ‏No Fill אינה סיבה אוטומטית לעבור ל־aggression גבוהה יותר.

---

## ‏10H.3 `Post Only` אינה “Passive Limit טובה יותר”

### ‏במילים פשוטות

‏נניח שבזמן ההחלטה אנחנו רוצים לקנות ב־100.00 כאשר:

```text
Bid = 100.00
Ask = 100.02
```

‏Limit ב־100.00 היא passive בזמן ההחלטה.

‏אבל לפני שה־Order מגיעה, ה־Ask יכולה לרדת ל־100.00.

‏עכשיו אותה Limit עלולה לקחת נזילות מיד.

‏`Post Only` נועדה לאכוף את הכלל:

```text
Do not become liquidity-taking on arrival.
```

‏לכן היא יכולה להידחות, להשתנות או לקבל טיפול route-specific במקום לבצע מיד.

### `COMMON WRONG CONCLUSION`

```text
Post Only
→ same passive order
→ just safer / cheaper
```

### `WHAT ACTUALLY MATTERS`

‏`Post Only` מחליפה trade-off:

```text
less accidental taking
```

‏מול:

```text
more reject/reprice/no-fill risk
more missed opportunity
```

‏כלומר היא constraint, לא upgrade אוניברסלי.

### `WHAT PROFESSIONALS MEASURE`

```text
post_only_requested
post_only_outcome
arrival_marketable_state
reject_or_reprice_rate
fill_rate
queue_wait
missed_move_after_no_fill
post_fill_markout
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — `PASSIVE_POST_ONLY` צריכה להתחרות מול `PASSIVE_JOIN` לפי current opportunity cost. אם missed-move cost גדול יותר מהערך של איסור taking, Post Only יכולה להיות Candidate גרועה יותר.

---

## ‏10H.4 Broker Algo אינה יודעת למה אנחנו רוצים את העסקה

### ‏במילים פשוטות

‏כאשר אנחנו משתמשים ב־`Adaptive` או `MidPrice`, אנחנו אומרים לברוקר בערך:

```text
Help me execute this order under these broker parameters.
```

‏אנחנו לא שולחים לו את כל הסיבה שבגללה המערכת שלנו רוצה את העסקה.

‏הברוקר לא בהכרח יודע:

```text
our private signal strength
our remaining signal life
our opportunity ranking
our reason to cancel now
our next-best stock
```

### `COMMON WRONG CONCLUSION`

```text
smart broker algo
→ understands when my signal is no longer worth trading
```

### `WHAT ACTUALLY MATTERS`

```text
broker execution objective
!=
private alpha objective
```

‏האצלת execution tactics לברוקר אינה האצלת Strategy judgment.

### `WHAT PROFESSIONALS MEASURE`

```text
signal_age_while_broker_managed
cancel_latency
fills_after_local_signal_expiry
broker_algo_time_to_fill
implementation_shortfall
post_fill_markout
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — `application_order_ttl`, ‏Signal validity, ‏`Economic Price Bound` ו־Cancel authority נשארים בבעלות המערכת גם כאשר repricing/search מבוצעים בידי Broker Algo.

---

## ‏10H.5 Stop אינה מבטיחה את מחיר היציאה

### ‏במילים פשוטות

‏נניח שיש לנו Position והגדרת Stop ב־50.00.

‏אם המחיר יורד במהירות:

```text
50.03
→ 49.90
```

‏ה־Stop יכולה להתחיל את תהליך היציאה כאשר ה־trigger מתקיים — אבל זה לא אומר שה־Fill תהיה ב־50.00.

### `COMMON WRONG CONCLUSION`

```text
stop price = guaranteed exit price
```

### `WHAT ACTUALLY MATTERS`

‏יש שתי שאלות שונות:

```text
When does protection activate?
How does it execute after activation?
```

‏`Stop` נוטה להעדיף exit certainty על פני price certainty.

‏`Stop Limit` מוסיפה price boundary, אך אז Position יכולה להישאר פתוחה לאחר trigger.

### `WHAT PROFESSIONALS MEASURE`

```text
trigger_time
trigger_reference
trigger_to_first_fill_latency
slippage_from_trigger
triggered_but_unfilled_duration
remaining_position_after_trigger
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Triggered state אינה terminal safety state. ‏`TRIGGERED != FILLED`, ולכן protection monitoring ממשיך עד Position/Order reconciliation.

---

## ‏10H.6 Trailing Stop תלויה בדרך, לא רק במחיר הסופי

### ‏במילים פשוטות

‏שתי מניות יכולות להגיע בסוף לאותו מחיר — אבל Trailing Stop יכולה להתנהג אחרת בגלל הדרך שעברו.

‏לדוגמה רעיונית:

```text
Path A:
100 → 105 → 102

Path B:
100 → 102
```

‏בשני המקרים המחיר האחרון הוא 102.

‏אבל ב־Path A ה־trail כבר עלתה בעקבות השיא ב־105, ולכן ייתכן שכבר נוצר trigger שלא היה נוצר ב־Path B.

### `COMMON WRONG CONCLUSION`

```text
same current price
→ same trailing-stop state
```

### `WHAT ACTUALLY MATTERS`

‏Trailing Order היא path-dependent: היסטוריית reference/ratchet משפיעה על state הנוכחי.

### `WHAT PROFESSIONALS MEASURE`

```text
reference_high_or_low
current_trailing_trigger
trail_distance
trigger_adjustment_history
trigger_time
post_trigger_fill_state
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Recovery של Trailing Order אינה יכולה להיבנות מהמחיר הנוכחי בלבד. אם broker-observed trail/trigger state אינה ניתנת לשחזור, היא נשארת `UNKNOWN` עד reconciliation מספקת.

---

## ‏10H.7 Bracket אינה “הפוזיציה מוגנת כי שלחנו שלוש פקודות”

### ‏במילים פשוטות

‏Bracket נראית כך:

```text
Entry
├── Profit Taker
└── Protective Stop
```

‏קל לחשוב:

```text
I created the bracket
→ therefore the position is protected
```

‏אבל protection אמיתית תלויה במה שכבר התקבל/הופעל אצל Broker, איזו quantity התמלאה בפועל, ואיזו child יכולה כרגע לבצע.

### `COMMON WRONG CONCLUSION`

```text
bracket created locally
→ protection exists remotely
```

### `WHAT ACTUALLY MATTERS`

```text
UNTRANSMITTED != PROTECTED
```

‏ואחרי Parent Partial Fill צריך לבדוק את הכמות המוגנת בפועל, לא את הכמות שתכננו לקנות.

### `WHAT PROFESSIONALS MEASURE`

```text
reconciled_position
protected_target_qty
verified_protected_qty
child_activation_state
child_executable_qty
unknown_child_count
protection_gap_duration
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — `FULLY_PROTECTED_VERIFIED` מתקבלת רק מ־broker/execution/position evidence. יצירת graph מקומית אינה evidence מספקת.

---

## ‏10H.8 OCA/OCO אינה קסם אטומי

### ‏במילים פשוטות

‏נניח שיש שתי פקודות יציאה, `A` ו־`B`, בקבוצת OCA.

‏המטרה היא שאם `A` מבצעת, `B` תבוטל או תותאם.

‏אבל בשוק אמיתי האירועים אינם חייבים להתרחש באותו רגע בדיוק.

‏אפשר לקבל:

```text
A fills
→ cancel B is still traveling
→ B remains executable briefly
```

### `COMMON WRONG CONCLUSION`

```text
OCO/OCA
→ impossible for both sides to execute
```

### `WHAT ACTUALLY MATTERS`

```text
coordination intent
!=
atomic execution guarantee
```

‏כל member שאינה Terminal עדיין נכללת ב־worst-case exposure.

### `WHAT PROFESSIONALS MEASURE`

```text
member_lifecycle_by_id
sibling_cancel_latency
simultaneous_executable_qty
partial_fill_by_member
late_sibling_fill
position_flip_events
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Risk sizing ב־OCA/OCO מבוסס על כל ה־members שעדיין potentially executable, לא על intended winner.

---

## ‏10H.9 Cancel אינה מוחקת Order ברגע שלחצנו Cancel

### ‏במילים פשוטות

‏כאשר המנוע שולח:

```text
cancel(order)
```

‏הוא שלח בקשה.

‏באותו זמן ה־Order יכולה כבר להיות בדרך ל־Fill, או שה־Cancel עדיין לא התקבלה.

### `COMMON WRONG CONCLUSION`

```text
cancel requested
→ order gone
```

### `WHAT ACTUALLY MATTERS`

```text
CANCEL_REQUESTED
!=
CANCEL_CONFIRMED
!=
TERMINAL_NON_EXECUTABLE
```

### `WHAT PROFESSIONALS MEASURE`

```text
cancel_requested_at
cancel_ack_at
late_fill_after_cancel
cancel_unknown_duration
potentially_executable_qty_during_cancel
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Replacement, Exit sizing ו־Protection sizing חייבים להמשיך לכלול Order cancel-pending/unknown עד terminal broker evidence.

---

## ‏10H.10 Modify אינה “עריכת שדה בחינם”

### ‏במילים פשוטות

‏נניח שחיכינו בתור לקנייה ב־100.00 ואז החלטנו לשנות ל־100.01.

‏מהצד שלנו זה נראה כמו שינוי קטן במספר.

‏אבל מבחינת execution ייתכן ששינינו:

```text
queue position
fill probability
marketability
price risk
working-order state certainty
```

### `COMMON WRONG CONCLUSION`

```text
same orderId + new price
→ same order, same queue, only better price
```

### `WHAT ACTUALLY MATTERS`

‏`MODIFY_IN_PLACE` אינה הבטחה לשמירת Queue Priority, והיא גם אינה שקולה לשינוי `Behavior Candidate`.

‏אם עוברים למשל מ־`PASSIVE_JOIN` ל־`MARKETABLE_LIMIT_IOC`, זו Decision חדשה גם אם implementation מסוימת מאפשרת reuse של מזהה.

### `WHAT PROFESSIONALS MEASURE`

```text
modify_count
modify_ack_latency
queue outcome after modify
fill probability before/after modify
late fill during modify
unknown_modify_duration
candidate_before
candidate_after
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — ‏Modify policy צריכה לשקלל queue value, signal freshness, state uncertainty ו־candidate semantics; API convenience אינה execution justification.

---

## ‏10H.11 מקצוענות כוללת גם החלטה לא לבצע

### ‏במילים פשוטות

‏אחרי שלומדים הרבה פקודות מתקדמות קל לחשוב שתמיד צריך לבחור אחת מהן.

‏אבל לפעמים ההחלטה המקצועית ביותר היא:

```text
NO_TRADE
REDUCE_SIZE
CANCEL_EXISTING
DEFER
NO_ACTION
EXIT_ONLY
```

‏כלומר: Advanced Order טובה אינה חובה להשתמש ב־Advanced Order.

### `COMMON WRONG CONCLUSION`

```text
there is always a clever order that can rescue the opportunity
```

### `WHAT ACTUALLY MATTERS`

‏אם אין Candidate שעומדת יחד ב־Signal, Risk, price bound, timing ו־Capability gates — התוצאה הנכונה היא לא להכריח execution.

### `WHAT PROFESSIONALS MEASURE`

```text
elimination_reason_codes
no_trade_rate
reduce_size_rate
cancel_due_to_staleness
defer_duration
opportunity outcome after disciplined no-trade
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Candidate selector רשאית להחזיר אפס Candidates. “לא לעשות” היא תוצאה מלאה של Decision Engine, לא error path.

---

## ‏10H.12 Acceptance Tests — Beginner + Practitioner Layer

```text
1. A beginner can explain MidPrice without first knowing the term markout.
2. MidPrice evaluation includes no-fill and time cost, not only midpoint price saving.
3. Post Only is described as a constraint, not a universally better passive order.
4. Broker Algo never receives authority over private signal validity.
5. Stop trigger price is never presented as guaranteed fill price.
6. Two identical current prices can map to different trailing states because path differs.
7. Bracket local construction is never treated as verified protection.
8. OCA/OCO is never treated as atomic execution.
9. Cancel request never removes an order from potentially executable exposure by itself.
10. Modify can change queue economics and state certainty.
11. Candidate selection may validly return NO_TRADE / NO_ACTION / REDUCE_SIZE.
12. Every advanced term introduced here has a plain-language explanation before the deeper engine contract.
```

---

## ‏10H.13 Checkpoint

‏`R7B` סוגר במפורש:

```text
AO-GAP-P1-06 — MidPrice is not free half-spread improvement
AO-GAP-P1-07 — Post Only is not universally better passive execution
AO-GAP-P1-08 — Broker Algo does not understand private signal intent
```

‏בנוסף הוא מוסיף Practitioner Judgment יישומי ל־Stops, ‏Trailing, ‏Bracket, ‏OCA/OCO, ‏Cancel ו־Modify.

‏הפרק גם מקבע דרישת הוראה חדשה לקורס הסופי:

```text
plain language
→ simple example
→ professional term
→ advanced semantics
→ engine implication
```

‏השלב הבא הוא `R7C`: closeout audit של Practitioner Judgment מול Review 7 ו־Final Gap List, ובדיקה האם נשאר insight מהותי שלא קיבל שכבה פשוטה + מקצועית.

# ‏חלק 10I — Practitioner Judgment Completion: השלמת התובנות המקצועיות למתחיל

> ‏מטרת הפרק: לסגור את תובנות Review 7 שעדיין לא קיבלו שכבת `beginner-first` מפורשת. כל נושא מתחיל בשפה פשוטה ובדוגמה קצרה, ורק אחר כך עובר למונח המקצועי ול־Engine implication.

---

## ‏10I.1 `FOK`, ‏`AON` ו־`MinQty`: לא תמיד נכון להילחם ב־Partial Fill

### ‏במילים פשוטות

‏נניח שרצינו לקנות 100 מניות, אבל כרגע אפשר לקבל רק 40 במחיר שמתאים לנו.

‏אפשר לומר:

```text
I want all 100 or nothing
```

‏אבל זו אינה בהכרח החלטה טובה יותר. אם 40 מניות עדיין יוצרות Position שימושית ובטוחה, דרישת “הכול או כלום” יכולה להפוך הזדמנות חלקית טובה ל־No Fill מוחלט.

### `COMMON WRONG CONCLUSION`

```text
partial fills are annoying
→ prevent partial fills whenever possible
```

### `WHAT ACTUALLY MATTERS`

‏השאלה המקצועית היא:

```text
Is partial exposure economically useful and operationally safe?
```

‏`FOK`, ‏`AON` ו־`MinQty` הן constraints על quantity/fill behavior. הן אינן “פתרון” כללי לבעיה של Partial Fill.

### `WHAT PROFESSIONALS MEASURE`

```text
requested_qty
filled_qty
useful_partial_threshold
no_fill_due_to_quantity_constraint
missed_move_after_constraint_no_fill
partial_position_outcome
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Partial Fill היא Decision State חדשה. Quantity constraint מאושרת רק אם היא משפרת את economics/risk של ה־intent, לא רק כדי להקל על state management.

---

## ‏10I.2 Hidden, Reserve/Iceberg ו־Discretionary מסתירות דברים שונים

### ‏במילים פשוטות

‏שלוש פקודות יכולות להיראות “מוסתרות”, אבל הן אינן מסתירות את אותו דבר:

```text
Hidden
→ פחות/בלי נוכחות גלויה

Reserve / Iceberg
→ מציגים רק חלק מהכמות

Discretionary
→ המחיר הגלוי יכול להיות פחות אגרסיבי מהמחיר שבו אנחנו עדיין מוכנים לבצע
```

### `COMMON WRONG CONCLUSION`

```text
more hidden
→ more sophisticated
→ better execution
```

### `WHAT ACTUALLY MATTERS`

‏צריך לשאול קודם **איזה מידע רוצים להסתיר** — presence, quantity או executable willingness — והאם בכלל יש לנו footprint ששווה את המורכבות.

### `WHAT PROFESSIONALS MEASURE`

```text
displayed_qty
actual_working_qty
fill_probability
queue / priority effects
execution_price_vs_displayed_price
debuggability
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Hidden, Reserve ו־Discretionary נשארות dimensions/behaviors נפרדים; אין “concealment mode” יחיד.

---

## ‏10I.3 Pegged / Relative: העברנו את ה־Repricing, לא ביטלנו אותו

### ‏במילים פשוטות

‏במקום שהמחשב שלנו ישנה מחיר בכל תזוזת Quote, אפשר לתת ל־Broker/Venue כלל כמו “עקוב אחרי reference מסוים”.

‏זה חוסך local cancel/replace — אבל הפקודה עדיין משנה את המחיר שלה.

### `COMMON WRONG CONCLUSION`

```text
broker/venue reprices for me
→ repricing risk is gone
```

### `WHAT ACTUALLY MATTERS`

‏צריך לדעת:

```text
reference
offset
cap
route semantics
one-way / two-way behavior
who owns repricing
when local intent expires
```

‏ה־Peg יכולה להמשיך לעבוד “נכון” לפי הכלל שלה גם אחרי שה־Signal שלנו כבר מת.

### `WHAT PROFESSIONALS MEASURE`

```text
reference_changes
effective_price_changes
cap_hits
fills_after_signal_expiry
cancel_latency
route-specific behavior
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Broker/Venue repricing לעולם אינה מבטלת `application_order_ttl`, local cancel authority או `Economic Price Bound`.

---

## ‏10I.4 Snap: נגזרת מהשוק פעם אחת, ואז נשארת קבועה

### ‏במילים פשוטות

‏נניח שה־Midpoint עכשיו הוא 100.05. ‏Snap יכולה לחשב ממנו מחיר פעם אחת — ואז לעבוד כ־Limit קבועה.

‏אם השוק עובר ל־100.15, המחיר הישן אינו “ממשיך לעקוב”.

### `COMMON WRONG CONCLUSION`

```text
Snap uses market reference
→ Snap keeps following market reference
```

### `WHAT ACTUALLY MATTERS`

```text
Peg = ongoing relationship
Snap = one-shot derivation
```

‏לכן הסיכון המרכזי הוא `stale derived price`.

### `WHAT PROFESSIONALS MEASURE`

```text
snap_reference_at_creation
snap_fixed_price
market_move_since_snap
working_age
stale_fill_rate
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Snap דורשת TTL קצר ו־fresh decision logic; אין להניח שהמחיר הקבוע עדיין מייצג את ה־intent המקורי.

---

## ‏10I.5 Sweep-to-Fill: מהירות לבדה אינה הוכחה לאיכות

### ‏במילים פשוטות

‏Sweep מנסה לצרוך נזילות במהירות בכמה מקומות/רמות בתוך Price Cap.

‏זה יכול להשיג Fill מהר יותר — אבל “מהר יותר” יכול גם לעלות יותר ולהשאיר footprint גדול יותר.

### `COMMON WRONG CONCLUSION`

```text
fastest fill
→ best aggressive execution
```

### `WHAT ACTUALLY MATTERS`

‏יש להשוות באותו Market State מול `MARKETABLE_LIMIT_IOC`, ‏plain SMART marketable Limit ו־`ADAPTIVE_LIMIT_URGENT`.

### `WHAT PROFESSIONALS MEASURE`

```text
time_to_useful_fill
average_fill_price
filled_fraction
fees
venue_split_count
price_concession
post_fill_markout
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Sweep אינה מקבלת עדיפות בגלל speed בלבד; היא Candidate בתוך aggressive family ונמדדת על net execution economics.

---

## ‏10I.6 Market-to-Limit: ה־Remainder יכולה להפוך לפקודה ישנה

### ‏במילים פשוטות

‏Market-to-Limit יכולה להתחיל בביצוע מיידי, לקבל Partial Fill, ואז להפוך את השאר ל־Limit.

‏אבל בזמן שבין שני השלבים השוק וה־Signal יכולים להשתנות.

### `COMMON WRONG CONCLUSION`

```text
initial execution was valid
→ remaining transformed limit is automatically still valid
```

### `WHAT ACTUALLY MATTERS`

‏אחרי transformation צריך לשאול מחדש:

```text
Is the signal still valid?
Is the remaining size still useful?
Is the transformed price still economically valid?
```

### `WHAT PROFESSIONALS MEASURE`

```text
initial_fill_qty
remainder_qty
transformed_limit_price
time_since_transformation
signal_age
stale_remainder_cancel_rate
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — transformed remainder כפופה ל־`application_order_ttl` ול־fresh decision; transformation אינה renew של ה־Signal.

---

## ‏10I.7 Exit: לפני ששולחים עוד Exit צריך לדעת מי עוד יכול לבצע

### ‏במילים פשוטות

‏נניח שיש Position של 100 מניות. אנחנו רוצים לצאת, אבל כבר קיימים Stop, Profit Taker ו־Cancel-pending order.

‏אם נשלח עכשיו Sell נוסף של 100 בלי להבין מה עוד יכול לבצע, אפשר לעבור בטעות מ־100 Long ל־Short.

### `COMMON WRONG CONCLUSION`

```text
position = 100
→ safe to send exit for 100
```

### `WHAT ACTUALLY MATTERS`

‏צריך לדעת גם:

```text
what other orders can still change the position?
```

### `WHAT PROFESSIONALS MEASURE`

```text
reconciled_position
potentially_executable_exit_qty
potentially_executable_entry_remainder
protection_qty
cancel_pending_qty
unknown_qty
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Exit sizing מבוסס על Position Truth + כל ה־orders שעדיין potentially executable, לא על Position snapshot בלבד.

---

## ‏10I.8 `UNKNOWN` היא תשובה מקצועית

### ‏במילים פשוטות

‏אחרי disconnect ייתכן שלא נדע אם Order התמלאה או אם Cancel הצליחה.

‏הטעות המסוכנת היא “להחליט” שהיא בטח בוטלה כדי להמשיך מהר.

### `COMMON WRONG CONCLUSION`

```text
unknown state is inconvenient
→ infer the most likely state and continue
```

### `WHAT ACTUALLY MATTERS`

‏חוסר ודאות הוא מצב אמיתי במערכת מבוזרת.

```text
UNKNOWN
```

‏עדיף על certainty מומצאת.

### `WHAT PROFESSIONALS MEASURE`

```text
unknown_duration_ms
unknown_reason
potentially_executable_qty
reconciliation_attempts
late_effects_after_unknown
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — `UNKNOWN` חוסמת blind retry ו־new risk; הפעולה הבאה היא reconciliation או risk-safe decision, לא ניחוש.

---

## ‏10I.9 בזמן Recovery, המציאות אצל Broker קודמת למה שהתכוונו

### ‏במילים פשוטות

‏לפני הנפילה המנוע אולי “חשב” שיש 0 מניות. אבל אם Buy התמלאה רגע לפני disconnect, המציאות הפיננסית שונה מהזיכרון המקומי.

### `COMMON WRONG CONCLUSION`

```text
restore local strategy state
→ continue from where we stopped
```

### `WHAT ACTUALLY MATTERS`

```text
intent = what we wanted
broker/execution truth = what may actually have happened
```

### `WHAT PROFESSIONALS MEASURE`

```text
broker_position
executions
working_orders
unknown_orders
protection_graph
ownership_state
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Recovery היא `Position-First + Ownership-First`; Strategy authority חוזרת רק אחרי reconciliation ו־earned `READY`.

---

## ‏10I.10 יותר Automation יכולה להקטין Explainability

### ‏במילים פשוטות

‏אם Broker Algo עושה הרבה החלטות עבורנו, הקוד המקומי נהיה פשוט יותר — אבל לפעמים קשה יותר להבין אחר כך **למה** Fill התרחשה בדיוק אז ובאותו מסלול.

### `COMMON WRONG CONCLUSION`

```text
less local code
→ simpler system in every sense
```

### `WHAT ACTUALLY MATTERS`

‏מורכבות כוללת גם:

```text
debuggability
attribution
replay fidelity
acceptance-test burden
```

### `WHAT PROFESSIONALS MEASURE`

```text
unexplained_behavior_rate
route_visibility
replay_reproducibility
acceptance_test_coverage
attribution_confidence
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — כאשר economics דומים, Candidate שקל יותר למדוד ולהסביר יכולה להיות Research baseline טובה יותר מ־behavior opaque ומתוחכמת יותר.

---

## ‏10I.11 Capability היא תכונה של Combination, לא של שם הפקודה

### ‏במילים פשוטות

‏זה שראינו `Order Type` מסוים עובד במקום אחד לא אומר שהוא יעבוד בכל Symbol, Route, Account או API combination.

### `COMMON WRONG CONCLUSION`

```text
I saw this feature in TWS
→ it is supported for everything I trade
```

### `WHAT ACTUALLY MATTERS`

‏Capability יכולה להיות תלויה ב־:

```text
product
contract
account / legal entity
route / venue
session
API path
order attributes combination
```

### `WHAT PROFESSIONALS MEASURE`

```text
capability_tuple
runtime_confirmation
paper_acceptance
live_small_acceptance
rejects_by_tuple
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — `PRODUCTION_ENABLED` היא evidence state של tuple מסוים; אינה Feature Flag גלובלית על order name.

---

## ‏10I.12 Entry ו־Exit אינן תמונת מראה

### ‏במילים פשוטות

‏אם ניסינו להיכנס ולא קיבלנו Fill, אפשר להישאר בלי עסקה.

‏אם כבר יש Position ורצינו לצאת ולא קיבלנו Fill, הסיכון עדיין קיים.

### `COMMON WRONG CONCLUSION`

```text
same order primitive
→ same decision logic for entry and exit
```

### `WHAT ACTUALLY MATTERS`

```text
Entry no-fill can end flat.
Exit no-fill leaves exposure.
```

### `WHAT PROFESSIONALS MEASURE`

```text
purpose
remaining_position
remaining_signal_life
exit_urgency
protection_state
no_fill_destination
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Primitive יכולה להיות משותפת, אבל Entry/Exit policy וה־failure destination חייבים להיות purpose-aware.

---

## ‏10I.13 Chase בלי Cumulative Budget היא Market Order מוסווית

### ‏במילים פשוטות

‏נניח שהתחלנו Limit ב־50.01. כל 200ms אנחנו מוסיפים עוד סנט:

```text
50.01
→ 50.02
→ 50.03
→ 50.04
```

‏כל צעד נראה קטן, אבל ביחד ויתרנו כבר 3 סנט.

### `COMMON WRONG CONCLUSION`

```text
one more tick is acceptable
→ keep chasing
```

### `WHAT ACTUALLY MATTERS`

‏צריך לחשב concession מצטברת מול ה־economic intent המקורי.

### `WHAT PROFESSIONALS MEASURE`

```text
initial_authorized_price
current_authorized_price
cumulative_concession
remaining_edge
reprice_count
signal_age
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — כל reprice חייבת להישאר בתוך cumulative chase budget ו־`Economic Price Bound`; סדרת צעדים קטנים אינה bypass לגבול.

---

## ‏10I.14 `NO_FILL`, ‏`PARTIAL` ו־`REJECT` מספרים סיפורים שונים

### ‏במילים פשוטות

‏שלושתם יכולים להיראות כמו “הפקודה לא הושלמה”, אבל:

```text
NO_FILL
→ לא נוצר Fill

PARTIAL
→ חלק התמלא, ולכן Position השתנתה

REJECT
→ מסלול הביצוע שתכננו לא הפך לפקודה תקפה כפי שהתכוונו
```

### `COMMON WRONG CONCLUSION`

```text
not fully filled
→ use the same fallback
```

### `WHAT ACTUALLY MATTERS`

‏כל outcome משנה state אחרת. Reject טכני אינו סיבה כלכלית להעלות aggression; Partial דורשת קודם Position Truth חדשה.

### `WHAT PROFESSIONALS MEASURE`

```text
outcome_class
reason_code
filled_qty
position_after_event
failure_destination
capability_evidence_effect
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Outcome classification קודמת ל־fallback. אין escalation כללית בשם “order failed”.

---

## ‏10I.15 Order מתוחכמת יכולה להיות איטית מדי ל־Signal קצר

### ‏במילים פשוטות

‏פקודה יכולה להיות מאוד חכמה — אבל אם היא צריכה שניות כדי לחפש מחיר טוב וה־Signal שלנו חי רק 300ms, היא פשוט פותרת בעיה בקצב הלא נכון.

### `COMMON WRONG CONCLUSION`

```text
more sophisticated execution
→ more suitable execution
```

### `WHAT ACTUALLY MATTERS`

```text
behavior time scale
must fit
signal time scale
```

### `WHAT PROFESSIONALS MEASURE`

```text
signal_half_life
candidate_time_to_useful_fill
candidate_time_to_terminal
fills_after_signal_expiry
no_fill_missed_move
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Candidate שאינה יכולה לייצר useful outcome בתוך remaining signal life צריכה להיפסל גם אם היא sophisticated ומקצועית.

---

## ‏10I.16 Measurability היא חלק מאיכות Research Candidate

### ‏במילים פשוטות

‏אם שתי שיטות נראות כמעט שוות, לפעמים עדיף להתחיל מזו שאפשר להבין ולשחזר בבירור.

### `COMMON WRONG CONCLUSION`

```text
most sophisticated candidate
→ best research baseline
```

### `WHAT ACTUALLY MATTERS`

‏Research טובה דורשת attribution:

```text
what happened
why it happened
what would likely have happened under the alternative
```

### `WHAT PROFESSIONALS MEASURE`

```text
telemetry completeness
replay fidelity
route visibility
state reconstructability
shadow comparability
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — `research_role` יכולה להעדיף Candidate measurable/replayable כ־baseline גם אם Candidate אחרת נראית “חכמה” יותר.

---

## ‏10I.17 Memory Rule — מה מקצוען שואל לפני Advanced Order

```text
1. Is the intent still valid?
2. What can execute right now?
3. What price / quantity am I actually authorizing?
4. Who manages the behavior after submit?
5. What survives if my process disappears?
6. What could arrive late?
7. What happens on NO_FILL / PARTIAL / REJECT / UNKNOWN?
8. Can I measure and explain the result afterward?
9. Does this behavior fit the signal horizon?
10. Is doing nothing / reducing size better?
```

‏אם אי אפשר לענות על השאלות האלה, השם המתקדם של הפקודה אינו מפצה על החוסר.

---

## ‏10I.18 Checkpoint

‏הפרק משלים את תובנות Review 7 שלא קיבלו קודם שכבת beginner-first מפורשת:

```text
Partial-fill constraints
Hidden / Reserve / Discretionary
Pegged / Relative
Snap
Sweep-to-Fill
Market-to-Limit remainder
Exit executable-graph thinking
UNKNOWN as real state
Broker truth before intent in recovery
Automation vs explainability
Combination-specific capability
Entry vs Exit asymmetry
Cumulative chase budget
NO_FILL vs PARTIAL vs REJECT
Sophistication vs signal horizon
Measurability as research quality
```

‏ביחד עם `10G` ו־`10H`, שכבת Practitioner Judgment מכסה כעת את רשימת Review 7 המלאה.
