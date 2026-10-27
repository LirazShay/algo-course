# ‏Review 4 — Consistency, Terminology, Duplication and Contradictions

> ‏סקירה רביעית מתוך סדרת Reviews לקורס `Advanced Order Mastery`.
>
> ‏מטרת השלב הזה אינה לתקן עדיין את הקורס, אלא לזהות drift במונחים, חזרות שאפשר לאחד, הבדלים בין שכבות abstraction, וטענות מוקדמות שצריך לחדד מול חלקים מאוחרים יותר.
>
> ‏Scope: Advanced Orders וה־Execution שלהן בלבד.

---

# ‏1. מסקנה ראשית

‏לא מצאתי כרגע סתירה יסודית שממוטטת את המודל המקצועי של הקורס.

‏הבעיה המרכזית היא אחרת: ככל שהקורס התקדם, ה־mental model נעשה מדויק יותר, אבל המונחים המוקדמים לא תמיד הותאמו לרמת הדיוק המאוחרת.

‏לכן יש כמה מקומות שבהם שתי פסקאות אינן באמת סותרות — אבל הקורא עלול לחשוב שכן, מפני שהן משתמשות באותו שם עבור שכבות שונות.

‏הפתרון אינו Rewrite מלא. צריך normalization שיטתי.

---

# ‏2. ממצא `P0` — חייבת להיות Taxonomy אחת לכל המושגים

‏כרגע לאורך המסמך מופיעים זה לצד זה:

```text
Market
Limit
Marketable Limit
IOC
Post Only
Bracket
OCA
Adaptive
SMART
Direct
MidPrice
```

‏אבל אלה אינם אובייקטים מאותה קטגוריה.

‏ה־taxonomy הסופית צריכה להיות מפורשת:

```text
PRICE / EXECUTION ORDER TYPE
TIME / FILL ATTRIBUTE
DISPLAY / LIQUIDITY ATTRIBUTE
COMPOSITE ORDER STRUCTURE
ROUTING POLICY
BROKER ALGO
APPLICATION EXECUTION MODE
```

‏לדוגמה:

```text
Limit                = broker order primitive
Marketable Limit     = behavior/state of a Limit relative to the market
IOC                  = Time-in-Force / fill policy
Post Only            = execution/liquidity attribute
Bracket              = composite parent/child structure
SMART                = routing policy
Adaptive             = broker algo
MARKETABLE_LIMIT_IOC = our application execution mode
```

‏בלי normalization כזה, המונח "Order Type" נהיה רחב מדי ומטשטש את ההבדל בין Broker primitive לבין Policy שהמנוע שלנו בונה.

---

# ‏3. ממצא `P0` — `Marketable Limit` חייבת לקבל ניסוח קנוני אחד

‏בחלקים מוקדמים אפשר לקרוא על `Marketable Limit` לצד Market ו־Limit כאילו היא Order Type עצמאית.

‏בחלקים המאוחרים כבר מופיע המודל המדויק יותר:

```text
Marketable Limit = Limit order whose price currently allows immediate execution
```

‏כלומר marketability היא state ביחס ל־current book, לא בהכרח enum חדש של הברוקר.

‏ניסוח קנוני עתידי:

```text
Broker primitive: Limit
Execution behavior: marketable at this snapshot
Application mode: MARKETABLE_CAPPED / MARKETABLE_LIMIT_IOC
```

‏זה ימנע גם בלבול בתיעוד ה־API.

---

# ‏4. ממצא `P0` — Execution Mode names עברו drift בין הפרקים

‏במהלך הקורס נוצרו כמה vocabularies:

```text
PASSIVE_PROBE
PASSIVE_JOIN
PASSIVE_DISPLAYED
PASSIVE_LIMIT
PASSIVE_POST_ONLY
MARKETABLE_CAPPED
AGGRESSIVE_CAPPED_LIMIT
MARKETABLE_LIMIT_IOC
EXIT_FAST
FAST_EXIT
EMERGENCY_REDUCE
```

‏הרעיונות טובים, אך השמות אינם תמיד באותה abstraction level.

‏לדוגמה:

```text
PASSIVE_JOIN
```

‏מתאר behavior.

```text
PASSIVE_POST_ONLY
```

‏מערב behavior עם broker attribute.

```text
MARKETABLE_LIMIT_IOC
```

‏כבר כולל concrete implementation choice.

‏בתיקון צריך לבחור vocabulary קנוני אחת עבור `ExecutionMode`, ולהשאיר את פרטי ה־Order בתוך `ConcreteOrderPlan`.

‏דוגמה אפשרית:

```text
ExecutionMode:
PASSIVE
PRICE_IMPROVING
MIDPOINT_SEEKING
AGGRESSIVE_CAPPED
FAST_EXIT
EMERGENCY_REDUCE
```

‏ואז:

```text
ConcreteOrderPlan:
orderType = LMT
postOnly = true
TIF = IOC
route = SMART
algo = ADAPTIVE
```

‏לא חייבים לבחור דווקא את השמות האלה; העיקר ששכבות לא יתערבבו.

---

# ‏5. ממצא `P0` — `Entry Mode` ו־`Exit Mode` צריכים Namespace ברור

‏יש מונחים כגון:

```text
EXIT_FAST
FAST_EXIT
NORMAL_EXIT
EMERGENCY_REDUCE
```

‏לעומת Entry modes כגון:

```text
PASSIVE_JOIN
RELATIVE_PRIMARY
MIDPRICE
MARKETABLE_LIMIT_IOC
```

‏צריך להחליט האם אלה כולם `ExecutionMode`, או שיש:

```text
LifecycleIntent
EntryExecutionMode
ExitExecutionMode
ProtectionMode
```

‏המלצה ל־Gap List: לאחד את nomenclature כך ש־`FAST_EXIT` לא יתחרה בשם עם concrete order family.

---

# ‏6. ממצא `P0` — `Broker-resident`, ‏`Native` ו־`Broker-simulated` אינם synonyms

‏בחלקים שונים משתמשים במונחים:

```text
broker-resident
broker-managed
broker-simulated
native
client-managed
```

‏הם מתארים dimensions שונות.

‏לדוגמה, Protection יכולה להיות:

```text
resident אצל Broker
```

‏אבל עדיין:

```text
simulated by Broker rather than native at exchange
```

‏לכן צריך canonical matrix:

```text
WHERE STATE LIVES
WHO EVALUATES / REPRICES / TRIGGERS
WHERE FINAL ORDER IS NATIVE
```

‏לדוגמה:

```text
client-managed
broker-managed/simulated
venue-native
```

‏ו־`broker-resident` ישמש רק כדי לומר שה־instruction יכולה להמשיך להתקיים בלי התהליך המקומי, כאשר זה אכן נכון.

---

# ‏7. ממצא `P0` — `Supported` הוא מונח מסוכן מדי בלי qualifier

‏חלק 9 כבר מתקן זאת היטב באמצעות:

```text
DOC_ONLY
RUNTIME_CONFIRMED
PAPER_ACCEPTED
LIVE_SMALL_ACCEPTED
PRODUCTION_ENABLED
```

‏אבל בחלקים מוקדמים עדיין אפשר למצוא ניסוחים בסגנון:

```text
IBKR supports X
```

‏בלי תמיד לציין:

```text
product
route
destination
API
account
session
```

‏בתיקון עתידי, כל שימוש ב־`supported` צריך לעבור normalization.

‏הניסוח הקנוני צריך להיות למשל:

```text
Documented for US Stocks via SMART in TWS
```

‏ולא:

```text
IBKR supports it
```

---

# ‏8. ממצא `P0` — Capability availability אינה Production eligibility

‏הקורס המאוחר כבר מבדיל יפה בין:

```text
available
accepted in paper
accepted live-small
production enabled
```

‏צריך לוודא שכל Recommendation מוקדמת שאומרת "אפשר להשתמש" אינה נשמעת כאילו feature כבר מותרת ב־Production.

‏נדרש distinction קבוע:

```text
AVAILABLE
RESEARCH_CANDIDATE
PRODUCTION_ENABLED
```

---

# ‏9. ממצא `P1` — `Hard Cap` מופיעה בכמה שמות

‏לאורך הקורס מופיעים ניסוחים כגון:

```text
hard cap
max acceptable price
worst acceptable price
price bound
economic cap
max_price
```

‏בחלק מהמקרים אלה באמת אותו דבר, ובחלקם לא.

‏צריך להגדיר:

```text
Economic Price Bound
```

‏כמושג האב, ואז להבדיל:

```text
entry_max_price
exit_min_price when applicable
emergency_bound
broker_limit_price
```

‏כך לא נשתמש ב־`cap` כאילו הוא תמיד BUY-side maximum.

---

# ‏10. ממצא `P1` — `Signal Lifetime`, ‏`Application TTL`, ‏`Order Age` ו־Broker `TIF` חייבים להישאר נפרדים

‏חלק 3 כבר בונה היטב את שלושת השעונים.

‏אבל אחר כך המונח `TTL` חוזר פעמים רבות בקיצור.

‏בתיקון צריך למנוע משפטים שבהם `TTL` לבדה אינה חד־משמעית.

‏נעדיף:

```text
signal_ttl
application_order_ttl
broker_tif
working_order_age
```

‏במיוחד בפרקים 5, 7 ו־10.

---

# ‏11. ממצא `P1` — `Partial Fill` היא מושג אחד, אבל ההשלכה תלויה Lifecycle

‏Partial Fill חוזרת בצדק כמעט בכל חלק.

‏הבעיה היא חזרת ההסבר הבסיסי עצמו.

‏צריך canonical definition אחת, ואז extensions:

```text
Part 2  -> economic meaning
Part 3  -> IOC/FOK fill semantics
Part 6  -> parent/child and protection consequences
Part 8  -> state-machine truth
Part 10 -> decision after each partial
```

‏כל פרק מאוחר צריך להפנות להגדרה ולא להגדיר Partial Fill מחדש כאילו זו תופעה חדשה.

---

# ‏12. ממצא `P1` — Cancel semantics חוזרות פעמים רבות וצריך Canonical Rule

‏המסר הבא מופיע בצורות רבות:

```text
cancel requested != cancel confirmed
```

‏זה מסר קריטי ולכן אסור למחוק אותו.

‏אבל במקום להסביר אותו מחדש בכל פרק, צריך canonical invariant אחד:

```text
Any order without terminal broker evidence remains potentially executable.
```

‏ואז להשתמש ב־cross-reference ב־Bracket, ‏OCA, ‏Exit, ‏Replace ו־Recovery.

---

# ‏13. ממצא `P1` — `Pending Cancel`, ‏`Cancel Requested` ו־`Cancel Unknown` דורשים State Vocabulary אחת

‏המושגים מופיעים בכמה צורות:

```text
CANCEL_REQUESTED
PENDING_CANCEL
cancel pending
CANCEL_UNKNOWN
```

‏חלקם יכולים להיות states שונים, אבל כרגע זה לא תמיד מפורש.

‏בתיקון צריך ליצור state glossary:

```text
CANCEL_REQUESTED = local command issued
CANCEL_PENDING   = broker has acknowledged pending cancel, if such state exists in adapter
CANCELLED        = terminal evidence
CANCEL_UNKNOWN   = outcome cannot currently be established
```

‏אם Adapter מסוים אינו מספק distinction אמיתי, לא להמציא אחד.

---

# ‏14. ממצא `P1` — `UNKNOWN`, ‏`RECOVERING`, ‏`FROZEN` הם סוגים שונים של State

‏ב־10A/10D מופיעים:

```text
UNKNOWN
RECOVERING
FROZEN
```

‏אבל אלה אינם אותו סוג משתנה:

```text
UNKNOWN    = epistemic state: איננו יודעים אמת מסוימת
RECOVERING = system operating mode
FROZEN     = control/safety mode
```

‏בתיקון צריך להימנע מרשימות state שבהן הם מוצגים כאילו הם alternatives של אותו enum, אלא אם אותו enum אכן מוגדר כך.

---

# ‏15. ממצא `P1` — `Position Truth` צריך שם קנוני אחד

‏מופיעים רעיונות כגון:

```text
actual position
confirmed position
broker position
execution-derived position
position truth
```

‏המודל המאוחר אומר נכון:

```text
fills/executions are the basis for position truth,
then reconcile against broker position state
```

‏צריך לנסח זאת פעם אחת ולהשתמש בשמות קבועים, למשל:

```text
execution_ledger_position
broker_reported_position
reconciled_position
```

‏כך `confirmed_position_qty` תהיה תוצאה מוגדרת, לא מונח אינטואיטיבי.

---

# ‏16. ממצא `P1` — Midpoint vocabulary דורשת הגנה חזקה במיוחד

‏יש לפחות שלוש ישויות שקל מאוד לבלבל:

```text
IBKR MidPrice
Directed Pegged-to-Midpoint
IBKR ATS Pegged-to-Midpoint
```

‏בנוסף קיימת generic application policy של:

```text
seek midpoint liquidity
```

‏הקורס כבר מסביר את ההבדלים, אבל בגלל השמות הקרובים צריך notation קבוע בכל המסמך.

‏לעולם לא לכתוב רק:

```text
midpoint order
```

‏כאשר הכוונה ל־IBKR feature ספציפית.

---

# ‏17. ממצא `P1` — `Relative` ו־`Pegged-to-Primary` צריכים Alias Rule אחד

‏הקורס משתמש נכון בשני השמות יחד, אבל צריך להגדיר פעם אחת:

```text
Relative / Pegged-to-Primary
```

‏ואחר כך לבחור שם primary אחד בטקסט.

‏במקביל צריך לשמר את ההבחנה החשובה בין:

```text
SMART Relative behavior
Directed Relative behavior
```

‏כלומר alias של השם אינו אומר semantics זהות בכל route.

---

# ‏18. ממצא `P1` — `Hidden`, ‏`Reserve/Iceberg` ו־`Discretionary` צריכים שלוש הגדרות orthogonal

‏לאחר Review 2, distinction הסופי צריך להיות:

```text
Hidden      -> hides displayed existence/size according to route semantics
Reserve     -> exposes only part of total quantity
Discretionary -> displays one price but allows hidden execution discretion beyond it
```

‏היום שני הראשונים מכוסים היטב; כאשר נוסיף Discretionary חשוב לא להשתמש במילה `hidden` בלי qualifier כי היא מסתירה dimension אחרת.

---

# ‏19. ממצא `P1` — Stop taxonomy צריכה להפריד Trigger מ־Post-Trigger Execution

‏עם תוספת `MIT/LIT` מ־Review 2, צריך normalization אחת:

```text
TRIGGER DIRECTION
+
POST-TRIGGER EXECUTION TYPE
+
MOVING OR STATIC TRIGGER
```

‏לדוגמה:

```text
Stop Market
Stop Limit
MIT
LIT
Trailing Stop
Trailing LIT/MIT
```

‏כך שמות הפקודות לא ילמדו כרשימה אלא כקומבינציות של semantics.

---

# ‏20. ממצא `P1` — Bracket, OCA/OCO ו־Conditional אינם אותו סוג dependency

‏חלק 6 כבר עושה הבחנה טובה:

```text
Trigger
Dependency
Mutual exclusion
Predicate
```

‏צריך להפוך זאת ל־canonical taxonomy ולאחר מכן להימנע ממשפטים מאוחרים שמכנים את כולם generic "linked orders" בלי qualifier.

---

# ‏21. ממצא `P0` — Bracket partial-fill semantics צריכות להישאר מסומנות כ־Unresolved Acceptance Requirement

‏הקורס מתעד במפורש פער בין תיאורים שונים לגבי activation/quantity של children כאשר Parent מתמלא חלקית.

‏אסור שבתיקון עתידי אחד הפרקים "יפתור" את זה בניסוח החלטי רק כדי ליצור אחידות.

‏הניסוח הקנוני צריך להיות:

```text
Documentation/behavior ambiguity exists for the exact target API/product/path.
Do not assume.
Acceptance test required.
```

‏10C כבר כולל acceptance scenario של Parent partial/proportional protection, ולכן התיקון צריך להפנות אליו ולא להציג זאת כעובדה סגורה.

---

# ‏22. ממצא `P0` — OCA cancellation אינה Atomic Guarantee

‏המסמך חוזר כמה פעמים על race בין fill ל־sibling cancel.

‏זה עקבי מקצועית, אבל בכל מקום שמופיע ניסוח כגון:

```text
when one fills, the other is cancelled
```

‏צריך לוודא שהוא מתואר כ־intended relationship ולא כהבטחת atomicity.

‏ניסוח קנוני:

```text
execution of one member initiates broker-defined cancellation/reduction behavior for peers;
concurrent execution races must still be handled.
```

---

# ‏23. ממצא `P1` — Modify אינה מושג אחד

‏בחלק 8 יש nuance חשוב:

```text
TWS API modification uses placeOrder with the same orderId
```

‏אבל מזה אסור להסיק:

```text
any order property can safely be mutated in place
```

‏צריך להבחין:

```text
protocol mechanism for modify
```

‏מול:

```text
which fields are safe/supported to modify for this order/path
```

‏ומול:

```text
economic effect such as queue-priority loss
```

‏10C כבר עושה distinction בין same-family safe change לבין Cancel+New; צריך להפוך אותו לכלל אחיד.

---

# ‏24. ממצא `P1` — `Cancel + New`, ‏`Replace` ו־`Modify` צריכים הגדרות חדות

‏לא להשתמש ב־`replace` באופן חופשי לשני דברים שונים:

```text
in-place broker modify
```

‏ו־:

```text
cancel old + submit new
```

‏נציע terminology:

```text
MODIFY_IN_PLACE
CANCEL_THEN_NEW
OVERLAPPED_REPLACEMENT
```

‏כאשר האחרון מותר רק תחת exposure budget מפורש.

---

# ‏25. ממצא `P1` — Queue Priority צריך להיות Consequence, לא הבטחה

‏כמה משפחות — modify, cancel/new, pegged repricing, reserve replenishment, binding — יכולות להשפיע על queue position.

‏צריך להימנע מניסוח אוניברסלי:

```text
this always loses priority
```

‏אלא אם documented route/venue semantics תומכות בכך.

‏ניסוח מקצועי יותר:

```text
may lose / reset / alter priority depending on venue and implementation;
measure or verify route-specific behavior.
```

---

# ‏26. ממצא `P1` — `SMART` ו־Direct אינם Fast/Slow labels

‏הקורס המאוחר כבר מדגיש:

```text
Direct != automatically faster
SMART != automatically slower
```

‏צריך לוודא שאין בחלקים מוקדמים shorthand שמרמז:

```text
direct = speed
smart = optimization
```

‏ההבחנה הנכונה:

```text
SMART = broker-controlled routing policy
Direct = destination chosen explicitly
```

‏Latency היא תוצאה למדידה, לא הגדרה.

---

# ‏27. ממצא `P1` — Broker Algo אינו יודע את ה־Private Signal שלנו

‏Adaptive ומנגנוני Broker אחרים מתוארים לעיתים כ־execution intelligence.

‏צריך לשמור את ה־qualifier הקבוע:

```text
broker algo optimizes according to its execution logic,
not according to our private signal decay model
```

‏ולכן local signal TTL / cancel policy נשארת authority נפרדת.

---

# ‏28. ממצא `P1` — FOK: Conceptual Semantics מול Product Availability

‏הקורס צריך להמשיך ללמד את semantics של `FOK`:

```text
full immediate fill or none
```

‏אבל במקביל חלק ה־Capability צריך להבהיר שהשימוש המעשי תלוי מוצר/Route ושאינה stock baseline אצלנו.

‏אין כאן סתירה בין:

```text
what FOK means
```

‏לבין:

```text
whether our target US-stock path supports/justifies it
```

‏בתיקון צריך פשוט להפריד את שתי השאלות חזותית.

---

# ‏29. ממצא `P1` — AON, FOK ו־MinQty לא להכניס לאותה Bucket של "All or Nothing"

‏הם פותרים אילוצי Fill שונים:

```text
FOK   -> all + immediate
AON   -> all, may wait
MinQty -> minimum acceptable partial fragment
```

‏בחלק 3 ההבחנה קיימת; בכל טבלת סיכום עתידית צריך לשמור אותה.

---

# ‏30. ממצא `P1` — Protection terminology זקוקה ל־Hierarchy

‏מופיעים:

```text
protective stop
stop backstop
broker protection
broker bracket
hybrid protection
protection authority
exit ownership
```

‏הם כולם שימושיים, אבל צריך hierarchy:

```text
ProtectionArchitecture
  ├─ Broker Backstop
  ├─ Broker Bracket
  └─ Hybrid Protection

ExitAuthority / ExitOwner
  ├─ Local Engine
  ├─ Broker Protection
  ├─ Broker Bracket
  └─ Recovery Controller
```

‏כך architecture אינה מתערבבת עם runtime ownership.

---

# ‏31. ממצא `P1` — Entry ו־Exit משתמשות באותן primitives אך לא באותה Objective Function

‏אותה `Limit`, ‏`IOC`, ‏`Adaptive` או midpoint mechanism יכולה לשמש לשני הצדדים.

‏לכן טבלאות השוואה שמציגות:

```text
best use = entry
```

‏עלולות להיות מטעות.

‏עדיף:

```text
primitive behavior
+
entry implications
+
exit implications
```

‏10C כבר מנסחת יפה ש־Exit אינה Entry עם `SELL` במקום `BUY`; העיקרון צריך לחזור לטבלאות הסופיות.

---

# ‏32. ממצא `P1` — `No Trade` ו־`No Action` אינם אותו Outcome

‏10A משתמשת ב־:

```text
NO_TRADE
DEFER
CANCEL_EXISTING
EXIT_ONLY
```

‏10D משתמשת גם ב־:

```text
NO_ACTION
```

‏צריך distinction קבוע:

```text
NO_TRADE = reject new opportunity
NO_ACTION = current state requires no command
DEFER = decision postponed pending specified evidence/time
```

‏זה חשוב מאוד ל־telemetry ול־replay.

---

# ‏33. ממצא `P1` — Fallback ו־Escalation צריכים Definitions קנוניות

‏שני המונחים חוזרים הרבה.

‏נציע:

```text
Fallback = selected capability/path became unavailable or invalid;
           recompute alternatives from policy.

Escalation = urgency/risk changed enough to permit a more aggressive behavior;
             recompute under new constraints.
```

‏שניהם דורשים Decision חדשה.

‏כך `fallback` לא יהפוך לשם נרדף ל־"שלח משהו אגרסיבי יותר".

---

# ‏34. ממצא `P1` — `Reprice` צריך להבחין בין Client Reprice ל־Broker/Venue Reprice

‏ב־Pegged/Relative:

```text
broker/venue logic may reprice automatically
```

‏ב־plain Limit:

```text
our engine may modify/cancel-new
```

‏אם שני המצבים נקראים סתם `reprice`, קשה לדעת מי owner של התהליך ומה latency/failure domain.

‏בתיקון צריך להשתמש למשל:

```text
automatic_reference_repricing
client_initiated_repricing
```

---

# ‏35. ממצא `P1` — `Working`, ‏`Live`, ‏`Active`, ‏`Executable` אינם בהכרח אותו דבר

‏אלה מילים שמופיעות באופן טבעי בפרוזה, אבל ב־state machine מקצועית צריך להיזהר.

‏Order יכולה להיות:

```text
known to broker
held
trigger-pending
working at venue
cancel-pending
potentially executable
```

‏לכן בתיקון צריך להגדיר vocabulary טכנית ולהשאיר `live` רק כמונח אנושי כאשר אין ambiguity.

---

# ‏36. כפילות מותרת מול כפילות שצריך לצמצם

‏לא כל חזרה היא בעיה.

## ‏חזרה שמותר ואף רצוי להשאיר

```text
cancel requested != cancelled
partial fills are first-class
hard price boundary must survive escalation
unknown broker state blocks new risk
```

‏אלה safety invariants. כדאי לחזור עליהן בפרקים קריטיים.

## ‏חזרה שכדאי לקצר

‏הגדרה מלאה מחדש של:

```text
what IOC means
what Marketable Limit means
what a partial fill is
what SMART is
what reconciliation is
```

‏בכל פרק.

‏המודל הרצוי:

```text
canonical definition once
→ short reminder
→ chapter-specific consequence
```

---

# ‏37. `Definition Ownership` מוצע

‏כדי לבצע את התיקונים בבטחה, כל מושג מרכזי יקבל פרק בעלות אחד:

| מושג | Definition owner מוצע |
|---|---|
| ‏Order decomposition | ‏Part 1 |
| ‏Marketable Limit / aggressiveness | ‏Part 2 |
| ‏TIF / IOC / FOK / AON / MinQty | ‏Part 3 |
| ‏Post Only / Hidden / Reserve | ‏Part 4 |
| ‏Pegged / Midpoint / Snap | ‏Part 5 |
| ‏Stops / Bracket / OCA / Conditional | ‏Part 6 |
| ‏SMART / Direct / Adaptive | ‏Part 7 |
| ‏Order lifecycle / cancel / modify / reconciliation | ‏Part 8 |
| ‏Support / capability vocabulary | ‏Part 9 |
| ‏Execution decision vocabulary | ‏Part 10 |

‏פרקים אחרים משתמשים במושג ומרחיבים אותו, אך לא מגדירים אותו מחדש.

---

# ‏38. Terminology Registry מוצע

‏בתהליך הפיצול לקבצים נפרדים כדאי ליצור קובץ metadata קטן או section canonical כגון:

```text
canonical_term
aliases
category
definition_owner
allowed_abbreviations
notes
```

‏לדוגמה:

```text
canonical_term: Marketable Limit
category: execution behavior
broker_primitive: Limit
aliases: none
```

‏או:

```text
canonical_term: Relative / Pegged-to-Primary
preferred_short_name: Relative
category: dynamic-price order family
```

‏אין צורך לבנות מערכת מורכבת; אפילו Markdown table אחת מספיקה.

---

# ‏39. `Fact`, ‏`Engine Rule`, ‏`Research Hypothesis` — גם זו בעיית Consistency

‏Review 1 כבר זיהה שחסרה הבחנה חזותית.

‏מבחינת Consistency זה חשוב במיוחד משום שמשפט כמו:

```text
MidPrice should be preferred when spread is wide
```

‏יכול להישמע כמו Fact, אף שבפועל זו Hypothesis למדידה.

‏לכן בתיקון צריך label אחיד:

```text
FACT
ENGINE INVARIANT
POLICY DEFAULT
RESEARCH HYPOTHESIS
ACCEPTANCE REQUIRED
```

---

# ‏40. Source-of-Truth dates צריכות להיות chapter-level, לא scattered ללא צורך

‏יש הרבה `אימות אחרון: 2026-10-27` וזה טוב מבחינת auditability.

‏אבל בהדפסה זה עלול לייצר עומס וחזרות.

‏אפשר לשמור:

```text
chapter verified_at
```

‏ובסעיף ספציפי להוסיף תאריך רק אם העובדה רגישה במיוחד לשינוי.

‏כך נשמור freshness בלי להעמיס.

---

# ‏41. Checkpoint language אינה חלק מהקורס הסופי

‏כרגע קיימים בסוף חלקים ניסוחים כגון:

```text
החלק הבא יהיה...
Checkpoint...
```

‏הם היו שימושיים בזמן הבנייה אבל במסמך סופי הם יוצרים תחושה של transcript/workflow.

‏בתיקון צריך להמיר אותם ל־:

```text
Chapter Summary
Next Conceptual Step
```

‏או להסירם אם אינם מוסיפים ערך לימודי.

---

# ‏42. סתירות מדומות שצריך לשמר כ־Nuance, לא "לתקן"

‏יש כמה זוגות משפטים שנראים סותרים אבל שניהם נכונים בהקשר:

```text
Passive can improve price
vs
Passive can increase missed-move cost
```

```text
Broker-managed logic can reduce client churn
vs
Broker algo cannot know our private signal
```

```text
Bracket can improve protection resilience
vs
Bracket adds lifecycle/race complexity
```

```text
Direct routing gives control
vs
Direct routing is not automatically faster/better
```

```text
IOC reduces stale remainder
vs
IOC can reduce fill probability
```

‏אלה trade-offs, לא contradictions.

‏בתיקון צריך דווקא להציג אותם יחד ב־`Why / Why Not` blocks.

---

# ‏43. סתירות אמיתיות פוטנציאליות שדורשות Resolution Pass

‏לפני האיחוד הסופי צריך לחפש במיוחד ניסוחים מסוג:

```text
A is always X
```

‏כאשר פרק מאוחר אומר:

```text
A can be X depending on route/product/state
```

‏מוקדי הסיכון העיקריים:

```text
support claims
queue-priority claims
native/simulated claims
Bracket partial-fill activation
routing-speed claims
order-modification semantics
UI/API parity
```

‏אלה יקבלו pass ייעודי בזמן התיקונים.

---

# ‏44. החלטת תיקון עתידית — Split לפני Rewrite

‏בהתאם להחלטה החדשה:

```text
master document
→ split into canonical chapter files
→ repair terminology per chapter
→ run cross-chapter consistency pass
→ deterministic manifest assembly
→ generated master
→ print viewer
```

‏זה חשוב במיוחד ל־Review 4, כי normalization של מונחים על קובץ ענק אחד מסוכן יותר ופחות ניתן לבדיקה.

---

# ‏45. בדיקות שצריכות להתווסף לכלי האיחוד

‏ה־assembler העתידי יכול לבצע checks פשוטים:

```text
all manifest files exist
no duplicate chapter IDs
no duplicate canonical section anchors
forbidden legacy terms can be flagged
required front matter exists
no placeholder markers remain
```

‏ובהמשך אפשר גם lint פשוט לטרמינולוגיה:

```text
"Marketable Limit Order Type" -> review warning
"Direct is faster" -> review warning
"cancelled" immediately after cancel request -> review warning
```

‏לא כדי להחליף Review אנושי, אלא כדי למנוע regressions.

---

# ‏46. Priorities ל־Final Gap List

## ‏`P0`

```text
1. Create one order/execution taxonomy.
2. Normalize Marketable Limit as behavior of Limit, not independent broker primitive.
3. Normalize application ExecutionMode names.
4. Separate native / broker-simulated / broker-resident / client-managed dimensions.
5. Normalize support/capability vocabulary.
6. Preserve Bracket partial-fill ambiguity as acceptance-test requirement.
7. Preserve OCA non-atomic race semantics.
```

## ‏`P1`

```text
8. Normalize hard/economic price-bound terminology.
9. Normalize all time concepts: signal TTL / app TTL / broker TIF / order age.
10. Create state vocabulary for cancel/unknown/recovery.
11. Canonicalize position truth terms.
12. Canonicalize midpoint-family names.
13. Canonicalize Relative/Pegged-to-Primary naming.
14. Normalize Modify vs Cancel+New vs Replace.
15. Normalize protection architecture vs exit ownership.
16. Normalize NO_TRADE / NO_ACTION / DEFER.
17. Normalize fallback / escalation / reprice ownership.
```

## ‏`P2`

```text
18. Reduce repeated definitions while preserving safety invariants.
19. Replace build-process checkpoint prose in final course.
20. Consolidate verification-date presentation.
21. Add terminology registry / definition ownership map.
```

---

# ‏47. מסקנת Review 4

‏הקורס אינו זקוק ל־"rewrite from scratch" בגלל סתירות.

‏הוא זקוק ל־**normalization pass** שמכיר בכך שיש ארבע שכבות שונות:

```text
broker primitive
order attribute / route / algo
application execution mode
runtime state / decision outcome
```

‏ברגע שהשכבות האלה יקבלו שמות קבועים, חלק גדול מהכפילויות והסתירות המדומות ייעלם.

‏הדגש בתיקון צריך להיות:

```text
preserve depth
remove ambiguity
preserve trade-offs
remove accidental vocabulary drift
```

---

# ‏Checkpoint — סוף Review 4

‏Review 4 הסתיים ללא תיקון של חומר הקורס עצמו.

‏הממצאים ייכנסו ל־`Final Gap List` לאחר השלמת שאר ה־Reviews.

‏השלב הבא הוא Review נפרד של התאמת כל החומר ל־short-horizon engine שלנו: מה באמת Actionable, מה Research-only, מה Safety-critical, ואיפה הקורס עדיין לא מתרגם את הידע מספיק טוב להחלטת מערכת.