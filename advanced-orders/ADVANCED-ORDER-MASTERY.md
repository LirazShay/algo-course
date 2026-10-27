# ‏Advanced Order Mastery — פקודות מסחר וביצוע ברמה מקצועית

> ‏מיני־קורס עומק משלים ל־`04-ORDER-TYPES-FOR-PERSONAL-ALGO.md`.
>
> ‏התוצר הסופי של המיני־קורס הוא **הקובץ היחיד הזה**. בכל שלב נרחיב ונעדכן אותו עד שיהפוך למסמך ארוך, רציף וניתן להדפסה.
>
> ‏המיקוד המרכזי: `Short-Horizon Momentum` — כניסה ויציאה בשניות ועד בערך דקה כאשר ה־Edge עדיין חי. פקודות שרלוונטיות בעיקר ל־market making, institutional execution ארוך או order sizes גדולים מאוד יוסברו, אבל יקבלו פחות עומק אלא אם יש להן השלכה ממשית על המערכת שלנו.

---

## ‏סטטוס המסמך

- ‏מצב: `IN PROGRESS`.
- ‏שלב נוכחי: `10C — Exit Decision, Protection Ownership and Double-Exit Safety`.
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

[הערה מערכתית: חלקים 1–9 וחלקים 10A–10B נשמרים כאן ללא שינוי מהגרסה הקודמת. תוכנם המלא נשמר במקור האמת ב־GitHub.]

---

# ‏חלק 10 — Engine Decision Guide

## ‏10A — Decision Inputs ו־Elimination Gates

‏חלק 10A מגדיר את מעטפת ההחלטה, ה־`DecisionContext`, ‏`EntryEnvelope`, ‏שש משפחות ה־State, ‏Elimination Gates, ‏Reason Codes, ‏`NO_TRADE`, ‏`DEFER`, ‏`EXIT_ONLY`, ‏`CANCEL_EXISTING`, ‏Decision Revisions, deterministic replay ו־telemetry.

---

## ‏10B — Entry Decision and Execution-Behavior Selection

‏חלק 10B מתרגם את `EntryEnvelope` לבחירה elimination-first בין `PASSIVE_JOIN`, ‏`PASSIVE_POST_ONLY`, ‏`RELATIVE_PRIMARY`, ‏`MIDPRICE`, ‏`SNAP_MIDPOINT`, ‏`PEGGED_MIDPOINT_DIRECT`, ‏`ADAPTIVE_LIMIT_URGENT`, ‏`ADAPTIVE_LIMIT_NORMAL` ו־`MARKETABLE_LIMIT_IOC`; הוא מגדיר TTL לפי behavior, ‏cumulative concession budget, ‏anti-chase, partial-fill re-decision, capability conflicts, capital reservation ו־shadow evaluation.

---

# ‏10C — Exit Decision, Protection Ownership ו־Double-Exit Safety

## ‏10C.1 Exit אינה Entry בכיוון ההפוך

‏ב־Entry תמיד קיימת אפשרות מקצועית פשוטה:

```text
NO_TRADE
```

‏כאשר כבר קיימת Position, המצב שונה. Exposure כבר קיימת ולכן השאלה אינה רק אם כדאי לבצע Order, אלא מי נושא את הסיכון בזמן שאנחנו מחכים.

‏לכן Exit Engine מקבלת objective שונה:

```text
reduce unwanted exposure
while preserving as much execution quality as the risk state allows
```

‏זו הסיבה שאסור לקחת את Entry Selector, להחליף `BUY` ב־`SELL` ולקרוא לזה Exit Engine.

---

## ‏10C.2 ארבע שאלות קודמות לכל Exit Order

‏לפני בחירת Order Type, המנוע חייב לדעת:

```text
1. What position actually exists?
2. Why do we want to reduce it now?
3. How urgent is risk reduction?
4. What other exit/protection orders can still execute?
```

‏אם אחת מארבע התשובות אינה ידועה, הבעיה היא קודם כול State/Reconciliation ולא Price Selection.

---

## ‏10C.3 `ExitContext` המוצע

```text
ExitContext {
  decision_id
  trade_intent_id
  evaluated_at
  policy_version

  position_state
  active_entry_state
  active_exit_orders
  protective_orders
  broker_reconciliation_state

  exit_reason
  exit_urgency
  signal_state
  market_state
  risk_state
  capability_state
  system_health_state
}
```

‏ה־Exit Selector אינה עובדת על `entry_price` בלבד. היא רואה את כל מה שעוד יכול לשנות Position.

---

## ‏10C.4 `Exit Reason` ו־`Exit Urgency` הם שני שדות שונים

‏סיבות אפשריות:

```text
TARGET_REACHED
SIGNAL_DECAY
SIGNAL_REVERSAL
MAX_HOLD_EXCEEDED
SPREAD_DETERIORATION
LIQUIDITY_DROPPED
PROTECTIVE_STOP_TRIGGERED
SYSTEM_DEGRADED
RISK_LIMIT
MANUAL_EXIT
BROKER_INCONSISTENCY
```

‏Urgency אפשרית:

```text
NORMAL
FAST
EMERGENCY
```

‏אותה סיבה יכולה לקבל urgency שונה לפי market/risk state.

---

## ‏10C.5 ששת מצבי ה־Exit המרכזיים

‏ברמת policy נשתמש לפחות ב־:

```text
NORMAL_EXIT
FAST_EXIT
EMERGENCY_REDUCE
STOP_BACKSTOP
BROKER_BRACKET
HYBRID_PROTECTION
```

‏אלה אינם בהכרח Order Types. אלה **Execution Behaviors** שממופים ל־Orders בפועל לפי Capability ו־State.

---

## ‏10C.6 `HOLD` היא החלטה מפורשת, לא היעדר החלטה

‏כאשר Position קיימת ואין עדיין סיבה לצאת, Exit Engine יכולה להחזיר:

```text
HOLD
```

‏אבל `HOLD` חייבת להיות תוצאה של state תקין:

```text
signal still valid
risk inside bounds
protection state acceptable
market/system health acceptable
```

‏אין להשתמש ב־`HOLD` כדי להסתיר מצב `UNKNOWN`.

---

## ‏10C.7 הכמות האמיתית היא `confirmed_position_qty`

‏אם Entry ביקשה 100 וקיבלה 37:

```text
target_entry_qty = 100
confirmed_position_qty = 37
```

‏ה־Exit מתכננת סביב 37.

‏היא אינה מוכרת 100 רק משום שזה היה ה־Intent המקורי.

---

## ‏10C.8 Pending Entry ממשיכה להשפיע על Exit

‏נניח:

```text
position = 37
entry remainder = 63
entry state = CANCEL_PENDING
```

‏Exit Engine אינה יכולה להניח שה־Position המקסימלית היא 37.

‏יש פוטנציאל ל־:

```text
37 confirmed
+ up to 63 late entry fill
```

‏לכן סגירת Position בזמן Entry שעדיין potentially executable דורשת coordination בין Entry ו־Exit owners.

---

## ‏10C.9 `Potential Exit Exposure` חשוב כמו Potential Entry Exposure

‏אם Position היא Long 100 ויש:

```text
protective stop SELL 100
profit taker SELL 100
client fast exit SELL 100
```

‏אי אפשר לומר "יש לי שלוש דרכים לצאת" ולסיים בזה.

‏צריך לדעת אילו מהן יכולות להתבצע בו־זמנית ומה מונע Position הפוכה.

---

## ‏10C.10 `Exit Ownership` הוא Primitive של המנוע

‏לכל Position נגדיר authority מפורשת:

```text
ExitOwnership {
  position_id
  owner_mode
  active_exit_intent_id
  broker_protection_ids[]
  ownership_revision
  transfer_state
}
```

‏המטרה היא למנוע מצב שבו כמה subsystems חושבים בו־זמנית שהם רשאים לשלוח Full-Size Exit עצמאית.

---

## ‏10C.11 Owner אפשריים

```text
NO_POSITION
BROKER_PROTECTION_ONLY
CLIENT_NORMAL_EXIT
CLIENT_FAST_EXIT
EMERGENCY_REDUCER
BROKER_STOP_TRIGGERED
BRACKET_EXIT_IN_PROGRESS
OWNERSHIP_TRANSFER_PENDING
FLAT_VERIFYING
UNKNOWN
```

‏`UNKNOWN` או `TRANSFER_PENDING` אינם states שבהם שולחים עוד Exit כאילו הכול נקי.

---

## ‏10C.12 Protection Authority ו־Active Exit Authority אינן אותו דבר

‏אפשר של־Broker יש Stop backstop חיה, אבל ה־Client Engine עדיין מחזיקה ב־normal exit intelligence.

‏זה בדיוק Hybrid:

```text
Broker protection authority:
    catastrophic backstop

Client active-exit authority:
    signal-aware normal exit
```

‏אבל ברגע שה־Client מתחילה Exit אמיתית, צריך protocol שמונע משתי הרשויות להוציא יותר מה־Position.

---

## ‏10C.13 `NORMAL_EXIT`

‏מטרתה:

```text
close/reduce position
without paying unnecessary execution cost
while risk is still controlled
```

‏Candidates יכולות לכלול לפי Capability:

```text
PASSIVE_LIMIT
MIDPRICE
RELATIVE
ADAPTIVE_LIMIT
AGGRESSIVE_CAPPED_LIMIT
```

‏Normal Exit יכולה להרשות זמן קצר ל־price improvement, אבל לא אינסופי.

---

## ‏10C.14 Normal Exit אינה חייבת להיות Passive

‏אם Position כבר איבדה את ה־Edge, המתנה ב־Ask רק כדי "לחסוך Spread" יכולה להיות false economy.

‏לכן גם במצב NORMAL יכול להיבחר:

```text
marketable capped limit
```

‏אם expected cost של waiting גבוה יותר מה־spread שנחסך.

---

## ‏10C.15 `FAST_EXIT`

‏FAST אומר:

> ‏אנחנו עדיין שומרים גבולות מחיר וסיכון, אבל ערך הזמן גדל משמעותית.

‏Candidates הטבעיות נעות לכיוון:

```text
AGGRESSIVE_CAPPED_LIMIT
MARKETABLE_LIMIT_IOC
ADAPTIVE_LIMIT_URGENT
```

‏כאשר no-fill או partial fill גורמים re-decision כמעט מיידית.

---

## ‏10C.16 FAST אינה מילה נרדפת ל־Market

‏אפשר להיות מאוד אגרסיביים ועדיין לשמור:

```text
worst acceptable price
max slippage band
max quantity per attempt
```

‏לכן FAST מתחילה בדרך כלל מ־price-bounded behavior כל עוד Risk Budget מאפשר.

---

## ‏10C.17 `EMERGENCY_REDUCE`

‏במצב Emergency סדר העדיפויות משתנה:

```text
position risk reduction
>
spread saving
>
queue preservation
>
price improvement search
```

‏אבל גם Emergency אינה הרשאה לקוד לא מוגבל.

‏עדיין צריכים:

```text
current position truth
quantity guard
session awareness
market-data/broker health classification
absolute risk limits
```

---

## ‏10C.18 Emergency Policy צריכה להיות מוגדרת מראש

‏לא ממציאים אותה בזמן incident.

‏לדוגמה, policy יכולה להגדיר:

```text
max emergency attempts
max interval between attempts
price-bound relaxation schedule
absolute worst boundary if applicable
whether market order is ever permitted
what to do if data is unavailable
```

‏הערכים עצמם הם Config שנבדק ב־Paper/Live-small, לא מספרים שמקודדים מתוך לחץ.

---

## ‏10C.19 `Market` היא כלי Risk — לא ברירת מחדל של Panic

‏יש מצבים שבהם certainty של הפחתת Position חשובה יותר מ־price certainty.

‏אבל Market עדיין יכולה לסבול מ־slippage, gaps והגנות Broker משלה.

‏לכן היא צריכה להיות branch מפורש של Emergency Policy, לא fallback נסתר מכל failure אחר.

---

## ‏10C.20 `Exit Urgency Ladder`

‏מודל שימושי:

```text
HOLD
↓
NORMAL_EXIT
↓
FAST_EXIT
↓
EMERGENCY_REDUCE
```

‏אבל אין חובה לעבור כל מדרגה.

‏אירוע Risk חזק יכול להעביר ישירות מ־HOLD ל־EMERGENCY.

---

## ‏10C.21 Escalation ב־Exit שונה מ־Entry

‏ב־Entry escalation יכולה להסתיים ב־:

```text
NO_TRADE
```

‏ב־Exit, אם Position עדיין לא רצויה, המטרה נשארת להפחית אותה.

‏לכן לאחר no-fill אנחנו לא בהכרח "מוותרים"; אנחנו מעדכנים urgency, price bounds ו־remaining quantity לפי מצב חדש.

---

## ‏10C.22 ובכל זאת כל Escalation היא Decision חדשה

‏אותו עיקרון מ־10B נשמר:

```text
attempt
→ outcome
→ new position
→ new market
→ new risk state
→ new decision
```

‏לא:

```text
keep widening forever until filled
```

---

## ‏10C.23 שני Price Boundaries שונות ביציאה

‏כדאי להפריד:

```text
economic_exit_boundary
risk_exit_boundary
```

‏הראשונה אומרת עד איפה העסקה עדיין עומדת ביעד הכלכלי הרגיל.

‏השנייה אומרת עד איפה מוכנים להתפשר כדי לצמצם Exposure כאשר Risk עולה.

‏ב־Emergency, Risk Boundary יכולה לגבור על Economic Boundary.

---

## ‏10C.24 `STOP_BACKSTOP` — תפקיד אחד ברור

‏Backstop אצל Broker אינו אמור להיות ה־Signal-aware exit engine שלנו.

‏התפקיד שלו הוא:

```text
if local intelligence/connectivity/process fails
or market moves beyond tolerated risk,
there is already a broker-resident protective instruction
```

‏זה ערך של survivability.

---

## ‏10C.25 Stop Trigger אינה Exit Fill

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת ש־Stop רגילה הופכת ל־Market instruction כאשר ה־trigger מתקיים, אך מחיר הביצוע אינו מובטח ויכול להיות רחוק מה־Stop. IBKR גם עשויה לדמות Stops לפי Venue/Product.

‏לכן State חייב להפריד:

```text
STOP_ARMED
STOP_TRIGGERED
EXIT_EXECUTING
EXIT_PARTIAL
FLAT_CONFIRMED
```

‏`STOP_TRIGGERED` אינה `FLAT`.

---

## ‏10C.26 Stop-Limit Triggered-but-Unfilled הוא State קריטי

‏אם Stop-Limit הופעלה אבל השוק עבר דרך ה־Limit:

```text
risk condition = true
position still exists
```

‏זה צריך להעלות urgency ולהפעיל policy מפורשת — לא להשאיר את המערכת במחשבה שה־Stop "טיפלה בזה".

---

## ‏10C.27 `BROKER_BRACKET`

‏במודל הזה Broker מחזיקה את מערכת ה־Parent/Children כמרכיב execution מרכזי.

‏יתרונות:

```text
protection pre-staged
survivability if client process fails
explicit parent/child relation
sibling exit coordination
```

‏חסרונות:

```text
less awareness of private signal
partial/race semantics require careful tests
dynamic exit modifications add complexity
```

---

## ‏10C.28 `HYBRID_PROTECTION`

‏זה המודל שמעניין במיוחד למנוע שלנו:

```text
broker-resident protection
+
client-managed dynamic exit
```

‏אבל הוא גם המסוכן ביותר אם ownership אינו מוגדר.

‏ה־Client אינה רשאית פשוט לשלוח Full Exit בזמן Stop מלאה עדיין potentially executable.

---

## ‏10C.29 הבעיה הבסיסית של Hybrid

‏Long 100:

```text
broker stop SELL 100 live
client decides SELL 100 now
```

‏אם שתיהן מתבצעות:

```text
100 long
-100 client exit
-100 stop
= 100 short
```

‏לכן Double Exit היא Risk ראשון במעלה, לא corner case שאפשר להשאיר לאחר כך.

---

## ‏10C.30 אין Transition קסום ללא Trade-off

‏כאשר עוברים מ־Broker Protection ל־Client Exit יש שלוש משפחות פתרון עקרוניות:

```text
A. cancel protection first, then exit
B. overlap under explicit bounded rules
C. transform/modify an existing broker exit when supported and semantically safe
```

‏לכל אחת מחיר:

```text
A -> protection gap
B -> double-execution risk
C -> capability / modify-semantics complexity
```

‏לכן המנוע לא מסתיר את ה־trade-off מאחורי helper function בשם `exitNow()`.

---

## ‏10C.31 ברירת המחדל ההנדסית: אין Unbounded Overlap

‏אסור לאפשר באופן שגרתי:

```text
potentially executable exits > quantity that can be safely closed
```

‏אם בוחרים deliberate overlap כדי להקטין latency, הוא חייב להיות Mode נפרד עם acceptance tests ו־Risk Budget מפורש.

---

## ‏10C.32 `Pending Cancel` Protection עדיין נחשבת חיה

‏אם שלחנו Cancel ל־Stop:

```text
STOP_CANCEL_REQUESTED
```

‏עד terminal evidence היא עדיין יכולה להתבצע.

‏לכן quantity budget חייב לספור אותה כחלק מ־potential exit exposure.

---

## ‏10C.33 `OCA/OCO` עוזרת — אך אינה הופכת את העולם לאטומי

> ‏אימות אחרון: `2026-10-27`.

‏ב־TWS API קיימים `ocaGroup` ו־`ocaType`; הערכים 1/2/3 קובעים cancel-all או proportional reduction, עם/בלי block. IBKR מתארת `with block` כ־overfill protection בכך שרק Order אחת בקבוצה מנותבת בכל זמן.

‏עם זאת, עדיין מתכננים state machine שמקבלת late/overlapping events ולא מניחה שכל cancellation בעולם היא transaction אטומית.

---

## ‏10C.34 Parent/Child Relation היא חלק מה־Exit Ownership

> ‏אימות אחרון: `2026-10-27`.

‏`TWS API Order.parentId` משמש לקישור children ל־Parent, ו־`transmit` קובע אם Order נשלחת הלאה מ־TWS. Orders עם `Transmit=false` נשארות בתוך אותה TWS session עד transmission ונמחקות ב־restart.

‏לכן `BRACKET_STAGED` אינה שקולה ל־`BROKER_PROTECTED`.

---

## ‏10C.35 `Transmit` הוא Commit Boundary של Protection

‏ב־Bracket ידנית, התבנית המתועדת היא:

```text
Parent       transmit=false
Profit Child transmit=false
Stop Child   transmit=true
```

‏ה־child האחרונה גורמת להעברת המבנה.

‏מנוע לא יכריז `PROTECTED` רק כי שלושת Objects נוצרו בזיכרון המקומי.

---

## ‏10C.36 Partial Parent Fill משנה Exit מיד

‏אם Parent התמלאה ב־37:

```text
actual_position = 37
```

‏גם אם Parent עדיין עובדת ל־63 נוספים.

‏Exit Engine חייבת לדעת:

```text
what quantity is protected now?
what quantity can still enter?
what happens if late entry fill arrives during exit?
```

‏זו הסיבה ש־Entry ו־Exit State Machines מחוברות דרך Position Ledger משותף.

---

## ‏10C.37 Documentation ambiguity נשארת Acceptance Test חובה

‏כבר מצאנו בחלק 6 תיאורים שונים של partial-parent/child activation בין חומרי IBKR שונים.

‏10C אינה בוחרת צד תיאורטי.

‏ה־production rule נשאר:

```text
verify exact partial-fill child behavior
for the actual adapter + product + route
before enabling broker bracket live
```

---

## ‏10C.38 Exit Partial Fill היא מצב רגיל

‏נניח:

```text
position before exit = 100
fast exit IOC fills = 43
remainder canceled = 57
```

‏עכשיו:

```text
position = 57
```

‏המנוע מריץ Decision חדשה עבור 57 בלבד.

‏הוא אינו retries אוטומטית את 100 המקוריות.

---

## ‏10C.39 Exit Quantity תמיד נגזרת מ־Position Truth חדשה

‏לפני כל attempt:

```text
remaining_exit_qty =
confirmed_position_qty
adjusted for executions already observed
and protected against potentially executable sibling exits
```

‏אין variable ארוך־חיים בשם `original_exit_qty` שממשיך להישלח שוב ושוב.

---

## ‏10C.40 IOC ביציאה — יתרון וסיכון

‏`Marketable Limit + IOC` יכולה לתת attempt מאוד נקייה:

```text
reduce what can be reduced now within bound
cancel remainder
```

‏היתרון: אין stale remainder.

‏החיסרון: Position שנותרה דורשת follow-up מיידי כאשר urgency גבוהה.

---

## ‏10C.41 No-Fill ב־Exit מסווגת לפי סיבה

```text
CAP_TOO_TIGHT
QUOTE_MOVED
DEPTH_VANISHED
ORDER_REJECTED
SESSION_RESTRICTION
ROUTE_UNAVAILABLE
MARKET_HALTED
DATA_UNCERTAIN
```

‏הסיבה קובעת מה מותר לעשות בהמשך.

‏למשל rejection בגלל capability אינה הצדקה להרחיב מחיר.

---

## ‏10C.42 `NORMAL_EXIT` יכולה להשתמש ב־Midpoint

‏כאשר:

```text
risk is controlled
spread is meaningful
position size is manageable
there is time budget
```

‏`MIDPRICE` או midpoint candidate אחרת יכולה לנסות לחסוך Spread.

‏ברגע שה־risk/time budget נשחק, היא יוצאת מה־Candidate Set.

---

## ‏10C.43 `Relative` ביציאה דורשת אותו Validity Watchdog

‏Broker יכולה להמשיך reprice גם כאשר הסיבה שלנו להמתין נעלמה.

‏לכן:

```text
max_exit_wait_ms
risk escalation trigger
cap/floor
market-data health
```

‏נשארים אצלנו.

---

## ‏10C.44 `Adaptive` ביציאה היא Delegation — לא הפקרת Risk

‏Adaptive Urgent/Normal יכולה להיות Candidate ל־Normal/Fast exit אם capability ו־time budget מתאימים.

‏אבל אם Risk state עוברת ל־Emergency, המנוע לא מחכה ל־Broker Algo רק מפני שכבר התחילה לעבוד; הוא מבצע re-decision ו־cancel/reconciliation לפי policy.

---

## ‏10C.45 Trailing יכולה להיות Protection Policy, לא Exit Brain

‏Trailing Broker order יכולה להתאים כרכיב הגנה או profit-protection מסוים.

‏אבל היא אינה יודעת:

```text
signal reversed
spread exploded
scanner found data inconsistency
system entered degraded mode
```

‏לכן Dynamic Exit Engine נשארת authority על `whether to continue holding`.

---

## ‏10C.46 `Target Profit` אינו Ownership

‏Take-Profit child ב־Bracket יכולה להיות חיה, אבל עצם קיומה אינו אומר שהמנוע חייב להמתין לה.

‏אם Signal מתה קודם, Dynamic Exit יכולה לדרוש יציאה מוקדמת — תוך מעבר ownership בטוח מול ה־child הקיימת.

---

## ‏10C.47 `Exit Transfer Protocol`

‏כאשר ownership עוברת למשל מ־Broker Protection ל־Client Fast Exit, נרצה state מפורש:

```text
TRANSFER_REQUESTED
PROTECTION_CANCEL_OR_REDUCE_REQUESTED
OVERLAP_POLICY_EVALUATED
BROKER_STATE_RECONCILED
ACTIVE_EXIT_AUTHORIZED
```

‏הסדר המדויק תלוי architecture, אבל אין מעבר atomic מדומיין.

---

## ‏10C.48 Client Exit שמצליחה אינה סוף הסיפור

‏לאחר Fill שמביאה Position לאפס:

```text
position locally looks flat
```

‏עדיין צריך:

```text
cancel/reconcile protective siblings
check late fills
verify broker position
verify no orphan orders
```

‏ורק אז:

```text
FLAT_CONFIRMED
```

---

## ‏10C.49 `FLAT_VERIFYING` הוא State חובה

‏המעבר:

```text
last exit fill
→ FLAT
```

‏מהיר מדי.

‏נרצה:

```text
last exit fill
→ FLAT_VERIFYING
→ reconcile orders + executions + position
→ FLAT_CONFIRMED
```

‏במיוחד כאשר Bracket/OCA או pending cancels קיימים.

---

## ‏10C.50 Stop Trigger בזמן Client Exit

‏זה Race שצריך לתרגל:

```text
client exit submitted
broker stop triggers
client exit partial fills
stop execution arrives
```

‏המערכת אינה רשאית לזרוק אף Execution משום ש"כבר יצאנו".

‏כל Fill מעדכנת Position, ואם Position התהפכה — עוברים ל־incident/risk-reduction logic.

---

## ‏10C.51 Double Exit Detection

‏נגדיר invariant:

```text
if position crosses through zero unexpectedly:
    DOUBLE_EXIT_INCIDENT = true
```

‏והתגובה אינה לפתוח Trade חדש כדי "להחזיר" את ה־P&L; היא קודם כול להחזיר את Position למצב שה־Risk Policy מגדירה ולבצע reconciliation מלאה.

---

## ‏10C.52 Orphan Protection אחרי Flat

‏אם Position אפס אבל Stop/TP עדיין חיה:

```text
ORPHAN_EXIT_ORDER
```

‏זו תקלה מהותית משום ש־Order יכולה לפתוח Position הפוכה בעתיד.

‏Startup/reconnect checks חייבים לזהות מצב כזה.

---

## ‏10C.53 External/Manual Position Change

‏אם אדם או API client אחר שינה Position:

```text
expected position != broker position
```

‏ה־Exit Selector קופאת מלקבל הנחות ישנות.

‏היא עוברת ל־reconciliation/ownership classification לפני שינוי children או שליחת Exit חדשה.

---

## ‏10C.54 Multiple API Clients דורשים Owner מפורש

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת ownership/binding לפי `clientId`, ו־orders ניתנות לשינוי/ביטול לפי binding הרלוונטי. לכן execution service, recovery service ו־manual TWS אינם שלושה actors שיכולים לפעול בלי coordination.

‏ב־Position אחת צריך להיות owner תפעולי מוגדר לכל שלב.

---

## ‏10C.55 Disconnect בזמן Position פתוחה

‏Disconnect לא אומר שה־Broker orders מתו.

‏לכן:

```text
connection lost
=> freeze new risk
=> preserve assumption that broker-resident protection may still be live
=> reconnect
=> reconcile
```

‏לא שולחים Orders חלופיות מחיבור חדש לפני שמבינים מה כבר קיים.

---

## ‏10C.56 למה Broker-Resident Backstop שווה במיוחד בזמן Crash

‏אם process המקומי נופל כאשר Position פתוחה, Client-only exit intelligence אינה פעילה.

‏Stop/Bracket שכבר transmitted ל־Broker יכולה להמשיך להתקיים לפי ה־Broker semantics גם בלי התהליך המקומי.

‏זה אינו מבטיח Fill מושלם, אבל מצמצם Failure Domain.

---

## ‏10C.57 Market Data Failure בזמן Position פתוחה

‏Entry חדשה בדרך כלל תיחסם.

‏ב־Exit צריך להבחין:

```text
local smart exit logic may be blind
broker protective orders may still be valuable
```

‏לכן לא מבטלים Stop קיימת רק מפני שה־feed המקומי נכשל.

‏לעומת זאת, גם לא מבצעים client-side chase על בסיס Quote ישנה.

---

## ‏10C.58 Broker Data ו־Market Data יכולות להיכשל בנפרד

‏נרצה מצבים כגון:

```text
MARKET_DATA_DEGRADED
BROKER_CONTROL_DEGRADED
BOTH_DEGRADED
```

‏וה־Exit Policy משתנה בהתאם.

‏למשל, Broker control תקין + market data מקומי פגום יכול להצדיק reliance זמני על protection קיימת במקום Order חדשה המבוססת על מחיר ישן.

---

## ‏10C.59 Session Policy היא חלק מההגנה

‏Protection שלא eligible מחוץ ל־RTH אינה שקולה ל־Protection חיה 24/7.

‏לכל Position נשמור:

```text
current_session
protection_eligible_now
outside_rth_setting
next_session_transition
```

‏כך Risk State יודעת אם backstop באמת יכולה לפעול עכשיו.

---

## ‏10C.60 Halt משנה את הבעיה

‏ב־halt אין משמעות ל־"שלח עוד יותר אגרסיבי" כאשר אין execution רציפה.

‏המנוע עובר ל־:

```text
HALT_RISK_STATE
```

‏ושומר Orders/intent לפי policy, תוך הכנה ל־resume שבו מחיר יכול לקפוץ משמעותית.

---

## ‏10C.61 Reopen/Resume דורש Fresh Decision

‏לאחר Halt, Quote ישנה ו־cap ישן אינם authority.

‏כאשר שוק חוזר:

```text
fresh market state
fresh position truth
fresh protection state
fresh decision
```

‏ולא continuation עיוור של Chase שהתחילה לפני ה־halt.

---

## ‏10C.62 Position Age הוא Input ל־Urgency

‏אם strategy מצפה להחזקה של שניות, Position שכבר עברה בהרבה את expected holding window דורשת בחינה מחדש גם אם המחיר לא פגע ב־Stop.

‏נשמור:

```text
position_age_ms
expected_holding_ms
max_holding_ms
```

‏אבל Time Exit אינה Override ל־state correctness; עדיין חייבים לדעת מה יכול להתבצע.

---

## ‏10C.63 Unrealized P&L אינה לבדה Exit Policy

‏`+0.2%` או `-0.2%` אינם מספיקים כדי לבחור Order.

‏ה־Execution Decision צריכה לראות:

```text
current executable bid/ask
spread
remaining depth
signal state
risk urgency
existing protection
```

‏P&L היא Fact אחת בתוך Context.

---

## ‏10C.64 `ExitPlan` המוצע

```text
ExitPlan {
  decision_id
  position_id
  reason
  urgency
  target_position_qty
  max_exit_qty_now
  behavior
  route_policy
  price_boundary
  tif_policy
  max_wait_ms
  protection_transition
  ownership_revision
  fallback_trigger
}
```

‏ה־Plan היא immutable עבור אותה Decision revision.

---

## ‏10C.65 `target_position_qty` עדיף על `sell_qty`

‏במקום לומר:

```text
SELL 100
```

‏Business intent אומרת:

```text
target_position = 0
```

‏ואז Execution Layer גוזרת בכל revision מה הכמות הבטוחה שנותרה לבצע.

‏כך late fills ו־partial exits אינם דורשים לנחש מחדש את המטרה.

---

## ‏10C.66 Exit יכולה להיות Reduction ולא Flat

‏`EMERGENCY_REDUCE` אינה חייבת תמיד להיות:

```text
target_position = 0
```

‏Risk Policy יכולה לבקש:

```text
reduce 500 -> 150
```

‏אם הבעיה היא liquidity/position-size risk ולא invalidation מלאה של Strategy.

‏העיקר הוא שהיעד יהיה מפורש.

---

## ‏10C.67 Behavior Selection ל־Exit נשאר Elimination-first

```text
candidates = enabled exit behaviors

remove candidates too slow for urgency
remove candidates violating protection/ownership constraints
remove candidates unable to respect current risk boundary
remove candidates unsupported in current session/route
remove candidates unsafe under current broker/system health

if none survive:
    enter explicit degraded/emergency handling
```

‏לא score יחיד שמאפשר Candidate מסוכנת לנצח בגלל מחיר יפה.

---

## ‏10C.68 מטריצת Exit התחלתית

| מצב | Candidates טבעיות | מה בדרך כלל נפסל |
|---|---|---|
| ‏Signal נחלש, Risk נמוך | Passive / MidPrice / Adaptive / capped aggressive | ‏Emergency Market behavior |
| ‏Signal התהפך מהר | Capped aggressive / IOC / Adaptive Urgent | ‏long passive wait |
| ‏Position לא מוגנת | Protection-first / Fast Exit | ‏Entry חדשה / slow price search |
| ‏Stop הופעלה | Broker exit state + reconciliation | ‏Independent full-size exit בלי ownership check |
| ‏Data מקומי stale אך Stop חיה אצל Broker | preserve/verify protection | ‏client chase על quote ישנה |
| ‏Emergency Risk | aggressive reduction under explicit policy | ‏queue optimization / rebate chasing |

---

## ‏10C.69 State Machine של Exit

```text
POSITION_OPEN
  ├── HOLDING_PROTECTED
  ├── HOLDING_UNPROTECTED
  └── EXIT_DECISION_PENDING
          ↓
     EXIT_AUTHORIZED
          ↓
     EXIT_SUBMIT_REQUESTED
       ├── EXIT_UNKNOWN
       ├── EXIT_REJECTED
       └── EXIT_WORKING
              ├── EXIT_PARTIAL
              ├── EXIT_CANCEL_PENDING
              └── EXIT_FILLED
                      ↓
                 SIBLING_CLEANUP
                      ↓
                 FLAT_VERIFYING
                      ↓
                 FLAT_CONFIRMED
```

‏ובמקביל קיימים transitions ל־:

```text
PROTECTION_TRIGGERED
OWNERSHIP_TRANSFER_PENDING
RECOVERING
EMERGENCY
INCONSISTENT
```

---

## ‏10C.70 Invariants של Exit

```text
all exit quantities derive from latest confirmed position
pending-cancel exits remain potentially executable
no subsystem assumes broker protection is dead before evidence
no new entry while exit ownership is inconsistent
flat is not declared before reconciliation
orphan exit orders are never ignored
partial exit always creates a new remaining-position decision
broker-triggered stop is never treated as fill confirmation
```

---

## ‏10C.71 Invariant של Double-Exit Budget

‏נרצה לחשב:

```text
confirmed_position_qty
potentially_executable_exit_qty
```

‏ולזהות מראש מצב שבו שילוב Orders יכול להפוך Position ללא כוונה.

‏OCA/Bracket semantics יכולות להפחית את הסיכון, אבל המנוע עדיין שומר את החישוב שלו.

---

## ‏10C.72 `Risk Reduction` גוברת על Profit Optimization

‏ברגע שמצב עולה ל־FAST/EMERGENCY, אין היגיון לשמור Queue Position רק בגלל sunk cost.

‏ה־Decision החדשה שואלת:

```text
if this order did not exist now,
would we choose this behavior for the current risk state?
```

‏אם לא — Queue Age אינה סיבה להשאיר אותה.

---

## ‏10C.73 Telemetry שחייבים לשמור

```text
exit_decision_id
position_id
exit_reason
exit_urgency
target_position_qty
confirmed_position_qty
potential_exit_qty
exit_owner
ownership_revision
protection_mode
protection_order_ids
protection_status
selected_exit_behavior
price_boundary
max_wait_ms
attempt_number
submit_ts
first_fill_ts
last_fill_ts
cancel_request_ts
terminal_ts
flat_verification_ts
```

‏ובנוסף:

```text
stop_trigger_ts
stop_fill_ts
stop_slippage
protection_cancel_ts
protection_cancel_ack_ts
unprotected_window_ms
double_exit_incident
orphan_exit_incident
```

---

## ‏10C.74 Metrics של Exit Quality

```text
exit_fill_rate
exit_time_to_first_fill
exit_time_to_flat
exit_slippage_vs_decision_bid
exit_slippage_vs_arrival
normal_to_fast_escalation_rate
fast_to_emergency_escalation_rate
partial_exit_rate
stop_trigger_to_fill_ms
stop_slippage_bps
unprotected_time_ms
double_exit_rate
orphan_exit_rate
reconnect_exit_incidents
```

‏וגם metric כלכלית חשובה:

```text
edge_retained_after_exit_execution
```

‏כדי למדוד כמה מה־Alpha המקורי נשאר לאחר עלות היציאה.

---

## ‏10C.75 Failure Matrix של Exit Engine

| מצב | הסיכון | State/תגובה עקרונית |
|---|---|---|
| Entry partial + remainder working | Position יכולה לגדול בזמן Exit | ‏cancel/reconcile entry + budget exposure |
| Normal exit no-fill | Signal ממשיכה לדעוך | ‏fresh decision / possible escalation |
| Fast IOC partial | Position נשארת | ‏recompute remaining qty מיד |
| Exit reject | אין הפחתת Risk | ‏classify reject + capability/re-decision |
| Stop triggered, no Fill yet | Exposure עדיין קיימת | ‏treat broker exit as in progress |
| Stop-Limit triggered, market עבר | Position יכולה להיתקע | ‏escalation policy |
| Client exit + Stop overlap | Position יכולה להתהפך | ‏ownership/double-exit guard |
| Protection cancel pending | Stop עדיין יכולה לבצע | ‏count as potentially executable |
| Client process crashes | dynamic exit מתה | ‏broker-resident protection + recovery |
| Reconnect with unknown children | local model stale | ‏freeze + rebuild bracket graph |
| Manual partial close | child quantities שגויות | ‏position reconciliation + resize/cancel |
| Halt | אין continuous execution | ‏halt risk state / resume decision |
| Flat locally, child live | future reverse position | ‏orphan cleanup before flat confirmation |

---

## ‏10C.76 Acceptance Tests ל־Exit Selector

```text
1. full position + normal signal decay -> normal exit plan
2. sharp reversal -> fast exit plan
3. risk breach -> emergency reduce
4. normal passive exit no-fill -> fresh decision
5. fast IOC full fill -> flat verification
6. fast IOC partial -> new plan only for remainder
7. exit rejected -> classify, do not widen automatically
8. stop armed + client normal exit requested
9. stop cancel pending + client exit decision
10. stop triggers while client exit working
11. stop fills while sibling/client cancel pending
12. stop-limit triggers without fill
13. bracket TP partial
14. bracket stop partial
15. parent partial while exit condition appears
16. late parent fill during exit
17. local exit fills while protective child remains live
18. orphan child after flat
19. manual partial close while bracket live
20. disconnect before exit submit acknowledgement
21. disconnect after exit partial
22. reconnect with broker stop still live
23. stale market data with valid broker protection
24. stale market data with no confirmed protection
25. halt while position open
26. resume after halt with fresh market state
27. OCA proportional-reduction behavior
28. double-exit simulation
29. exact partial-parent bracket semantics on chosen API/route
30. FLAT_CONFIRMED only after orders/executions/position reconciliation
```

---

## ‏10C.77 Property / Invariant Tests

```text
larger confirmed position must never reduce required protection quantity by itself
pending-cancel exit must never be treated as zero potential exposure
partial exit must never increase the remaining close quantity
STOP_TRIGGERED must never imply FLAT without execution evidence
market-data staleness must never authorize a more price-specific client chase
ownership UNKNOWN must never authorize a second independent full-size exit
flat-confirmed implies no unexplained live exit orders
```

---

## ‏10C.78 Research Architectures שנשווה

```text
A. CLIENT_MANAGED_EXIT
   all normal/fast exits controlled locally
   no assumption of broker intelligence

B. BROKER_BRACKET
   parent + broker-managed TP/Stop structure
   local engine mostly observes/reconciles

C. HYBRID_PROTECTION
   broker-resident catastrophic backstop
   local normal/fast exit intelligence
   explicit ownership-transfer protocol
```

‏אף אחת אינה מוכרזת winner מראש.

---

## ‏10C.79 למה `HYBRID_PROTECTION` היא Candidate מעניינת — ולא Default אוטומטי

‏היא מחברת שני יתרונות:

```text
survivability
+
signal-aware exit
```

‏אבל מוסיפה את הבעיה הקשה ביותר:

```text
two systems can potentially sell the same position
```

‏לכן היא תתקדם רק לאחר Acceptance Tests של ownership, partial fills, stop trigger, cancel races ו־reconnect.

---

## ‏10C.80 Recommendation ל־V1 המחקרית

‏בשלב Research הייתי בונה את Exit Layer כך שכל שלוש architectures יכולות להשתמש באותה State Machine ו־Position Ledger.

‏ה־Behaviors הראשונים למדידה:

```text
NORMAL_CAPPED_LIMIT
NORMAL_MIDPRICE
FAST_MARKETABLE_LIMIT_IOC
FAST_ADAPTIVE_URGENT
BROKER_STOP_BACKSTOP
```

‏Bracket/Hybrid יופעלו בסביבת בדיקות רק לאחר שה־Failure Matrix מחלק 6 ו־10C עוברת.

---

## ‏10C.81 למה Exit Layer אינה צריכה לדעת את כל Strategy

‏Strategy אומרת למשל:

```text
exit reason = SIGNAL_REVERSAL
urgency = FAST
target_position = 0
```

‏Execution Layer מחליטה:

```text
which live orders must be neutralized?
which protection exists?
which behavior can reduce risk within bounds?
```

‏כך אפשר לשנות Signal logic בלי לשכתב race handling.

---

## ‏10C.82 `Reason Code` ל־Exit חייב להיות יציב

‏נשמור למשל:

```text
EXIT_TARGET_REACHED
EXIT_SIGNAL_DECAY
EXIT_SIGNAL_REVERSAL
EXIT_MAX_HOLD
EXIT_RISK_LIMIT
EXIT_PROTECTION_TRIGGERED
EXIT_SYSTEM_DEGRADED
EXIT_MANUAL
EXIT_BROKER_INCONSISTENCY
```

‏כך אפשר להשוות Execution Quality לפי הסיבה האמיתית ליציאה.

---

## ‏10C.83 Outcome Attribution של Exit

‏בסוף lifecycle נשייך:

```text
entry_decision_id
exit_decision_sequence[]
protection_events[]
final_position
realized_execution_cost
holding_time
net_trade_result
```

‏המטרה היא להבין אם הפסד/רווח הגיע מה־Signal, מהכניסה, מהיציאה, מה־routing או מ־risk event.

---

## ‏10C.84 `Protection Gap` חייב להיות Metric

‏אם transition מ־Broker Stop ל־Client Exit דורשת זמן שבו אין protection broker-resident:

```text
unprotected_window_ms
```

‏צריך להימדד.

‏בלי metric כזה, Hybrid יכולה להיראות מצוין ב־P&L אבל להסתיר Failure Risk נדיר וחמור.

---

## ‏10C.85 `Double Protection` גם היא Metric

‏המצב ההפוך:

```text
two exits can still execute
```

‏נמדוד:

```text
overlap_window_ms
max_potential_exit_qty_during_overlap
```

‏כך אפשר להשוות protection gap מול over-exit risk בצורה אמפירית.

---

## ‏10C.86 Broker Truth גוברת על Intent בזמן Recovery

‏אם local ledger אומר Position 0 אבל Broker Position אומר 37:

```text
position = 37 until reconciled otherwise
```

‏לא מוחקים Exposure משום שה־Strategy סיימה את Trade.

‏ב־Recovery, כסף אמיתי קודם ל־business narrative.

---

## ‏10C.87 `Stop` אינה Insurance

‏גם Stop broker-resident תלויה ב־trigger, market state, route, liquidity ובחלק מהמקרים simulation.

‏לכן המונח `protected` אצלנו לא אומר:

```text
guaranteed maximum loss
```

‏אלא:

```text
an accepted broker-resident protective mechanism exists
and its limitations are known
```

---

## ‏10C.88 Bracket אינה `set-and-forget`

‏גם אחרי שהמבנה transmitted:

```text
parent fills
children activate
position changes
market changes
```

‏המנוע ממשיך לנטר:

```text
actual position
actual protected qty
child status
sibling state
ownership
```

‏Broker-managed אינו unobserved.

---

## ‏10C.89 Production Secret: הבעיה הקשה אינה "איך לצאת" אלא "מי עדיין יכול לצאת"

‏ברוב תרחישי race, האלגוריתם יודע שהוא רוצה להיות Flat.

‏הסיכון נוצר משום שיש כמה Orders או Actors שעדיין יכולים לפעול:

```text
old entry
profit child
stop child
client exit
manual order
other API client
```

‏לכן `potentially executable graph` חשוב יותר מ־UI status יחיד.

---

## ‏10C.90 Practitioner Secrets — Exit Decision

### ‏1. Exit אינה Entry הפוכה

‏אי־ביצוע הוא Risk כאשר Position כבר קיימת.

### ‏2. `STOP_TRIGGERED` אינה `FLAT`

‏Trigger הוא תחילת execution path, לא סופו.

### ‏3. Stop-Limit יכולה להגן על המחיר ולהיכשל בהגנה על Position

‏Triggered-but-unfilled חייבת escalation policy.

### ‏4. Hybrid דורשת Ownership Protocol

‏Broker Stop + Client Exit בלי coordination היא הזמנה ל־double exit.

### ‏5. Pending Cancel עדיין חיה מבחינת Risk

‏סופרים אותה עד terminal evidence.

### ‏6. Flat היא מסקנה מאומתת

‏Fill אחרונה אינה מספיקה כאשר siblings או pending orders קיימים.

### ‏7. Partial Exit יוצרת Decision חדשה

‏לא retry של הכמות המקורית.

### ‏8. Emergency אינה "Market בכל מחיר"

‏היא סדר עדיפויות אחר עם policy מוגדרת מראש.

### ‏9. Broker-resident protection שווה בעיקר ביום שבו משהו נכשל

‏הערך שלה הוא survivability, לא חיזוי Signal.

### ‏10. Protection Gap ו־Double-Protection Window הם שני צדדים של אותו Trade-off

‏צריך למדוד את שניהם.

### ‏11. Position Truth גוברת על Trade Intent

‏אם Broker אומר שיש Exposure, המנוע חייב לטפל בה גם אם ה־Strategy חושבת שהעסקה כבר נגמרה.

### ‏12. Exit Ownership צריכה להיות Versioned

‏אירוע ישן אינו רשאי להחזיר authority ל־subsystem שכבר ויתר עליה.

### ‏13. OCA מסייעת ל־coordination אבל אינה פטור מ־reconciliation

‏ה־engine עדיין חייב לקבל כל Execution כעובדה.

### ‏14. Data Failure ו־Broker Failure הם אירועים שונים

‏Broker protection יכולה להישאר שימושית כאשר analytics מקומית עיוורת.

### ‏15. ה־Exit הטובה ביותר היא זו שמקטינה Risk בלי למחוק את ה־Edge שנותר — בהתאם ל־urgency האמיתית

‏לכן Normal, Fast ו־Emergency הן Policies שונות ולא אותו Order עם מחיר אחר.

---

# ‏מקורות רשמיים לחלק 10C

- ‏IBKR TWS API — `Order` reference (`parentId`, `transmit`, `ocaGroup`, `ocaType`, `triggerMethod`): <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR TWS API — Placing Orders / `Transmit`: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/place-order/introduction>
- ‏IBKR TWS API — Adding a Profit Taker and Stop Loss: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/place-order/adding-a-profit-taker-and-stop-loss>
- ‏IBKR — Order Types and Algos / Stop behavior: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR Web API — Bracket Orders: <https://www.interactivebrokers.com/campus/ibkr-api-page/web-api-staging/>

---

# ‏Checkpoint — סוף חלק 10C

‏בחלק הזה בנינו את Exit Engine כ־Risk/Execution system נפרדת מה־Entry: הגדרנו `ExitContext`, ‏Exit Reasons ו־Urgency, ‏`NORMAL_EXIT`, ‏`FAST_EXIT`, ‏`EMERGENCY_REDUCE`, ‏`STOP_BACKSTOP`, ‏`BROKER_BRACKET` ו־`HYBRID_PROTECTION`; חיברנו Partial Entry/Exit, ‏Stop Trigger, ‏OCA, ‏Bracket, reconnect, stale data ו־manual changes למודל אחד של Position Truth ו־Exit Ownership.

‏העיקרון המרכזי הוא: **לפני שהמנוע שואל באיזו Order לצאת, הוא חייב לדעת מי כבר יכול לצאת בשמו.** כל protective Order ב־pending cancel עדיין potentially executable; כל Partial Fill משנה את הכמות; `STOP_TRIGGERED` אינה `FLAT`; ו־Flat מוכרזת רק אחרי reconciliation של Orders, Executions ו־Position.

‏השלב הבא יהיה **חלק 10D — Full Decision Engine**: נחבר את 10A, ‏10B ו־10C ל־state machine אחת עם precedence rules, ‏fallback/re-evaluation, ‏pseudocode, ‏decision contracts ומטריצת end-to-end שמתרגמת Market + Signal + Position + Orders + Risk + Capabilities ל־Execution Command חוקית.