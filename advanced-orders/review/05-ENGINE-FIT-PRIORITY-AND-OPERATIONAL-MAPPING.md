# ‏Review 5 — Engine Fit, Priority and Operational Mapping

> ‏סקירה חמישית מתוך סדרת Reviews לקורס `Advanced Order Mastery`.
>
> ‏מטרת השלב הזה אינה לתקן עדיין את הקורס, אלא לבדוק האם כל משפחת Advanced Orders מחוברת בצורה ברורה למנוע שלנו: מה `Core`, מה `Research Challenger`, מה `Safety Critical`, ומה `Reference` בלבד.
>
> ‏הבחנה חשובה: **חשוב ללמוד** אינו זהה ל־**צריך להכניס ל־V1**.

---

# ‏1. מסקנה ראשית

‏הקורס כבר הגיע לנקודה שבה רוב הידע הנדרש קיים, אבל חסרה שכבה אחת שתהפוך אותו ממסמך לימוד עמוק ל־execution playbook חד:

```text
Concept
→ Engine role
→ Production priority
→ Capability gate
→ Decision inputs
→ Failure behavior
→ Telemetry
```

‏חלקים 9 ו־10 כבר בונים חלק גדול מהגשר הזה, אך הוא עדיין מפוזר.

‏לכן ממצא ה־Review המרכזי הוא:

```text
P0 — every important advanced-order family needs an explicit engine role,
not only an explanation of what the broker order does.
```

---

# ‏2. ארבע קטגוריות עדיפות שאסור לערבב

‏במסמך הסופי כל capability משמעותית צריכה לקבל לפחות אחת מהתוויות הבאות:

```text
CORE
RESEARCH_CHALLENGER
SAFETY_CRITICAL
REFERENCE
```

‏אפשר שלפקודה יהיו שתי תוויות.

‏לדוגמה:

```text
Stop backstop
= SAFETY_CRITICAL
+ RESEARCH_CHALLENGER for exact implementation
```

‏לעומת:

```text
FOK for our US-stock engine
= REFERENCE
```

‏הסיווג הזה אינו המלצת השקעה ואינו טענה שפקודה מסוימת "טובה יותר" תמיד. הוא מגדיר את סדר המחקר והיישום עבור ה־Execution Engine שנבנה.

---

# ‏3. `CORE` — היכולות שהמנוע צריך להבין קודם

‏הליבה המוצעת למחקר ול־V1 היא קטנה יחסית:

```text
Limit
Passive Limit + application TTL
Marketable Limit
Marketable Limit + IOC
SMART routing
Cancel / Modify / Replace lifecycle
Partial-fill handling
Capability gating
Reconciliation
```

‏הסיבה אינה שהכלים האלה תמיד מנצחים.

‏הסיבה היא שהם נותנים לנו baseline ברור למדידה של:

```text
price protection
fill speed
fill probability
partial-fill behavior
missed opportunity
cancel latency
execution cost
```

‏בלי baseline פשוט אי אפשר לדעת אם Order Type מתקדמת באמת מוסיפה ערך.

---

# ‏4. `Marketable Limit + IOC` היא Baseline מחקרית, לא Truth אוניברסלית

‏הקורס מתקרב לזה כבר בכמה מקומות, אבל צריך לחדד בסוף:

```text
Marketable Limit + IOC
```

‏היא Candidate מצוינת למדידה כאשר אנחנו רוצים:

```text
attempt liquidity now
+
explicit price boundary
+
no stale resting remainder
```

‏אבל היא יכולה להיות גרועה כאשר:

```text
spread is wide
signal has enough life to seek improvement
visible immediate depth is poor
repeated IOC attempts create churn
```

‏לכן הסיווג הנכון הוא:

```text
CORE BASELINE
!=
DEFAULT WINNER
```

---

# ‏5. Passive execution צריכה להישאר `CORE`, למרות אופק הזמן הקצר

‏קל מדי להסיק ממומנטום של שניות ש־Passive אינה רלוונטית.

‏זו מסקנה חזקה מדי.

‏Passive Limit + TTL קצרה נותנת baseline הכרחי לשאלה:

```text
Was paying the spread actually worth it?
```

‏בלי challenger פסיבי אי אפשר למדוד באופן הוגן:

```text
spread cost
missed-move cost
queue delay
adverse-selection after passive fill
```

‏לכן Passive היא `CORE RESEARCH BASELINE`, גם אם בסוף היא נבחרת רק בחלק קטן מה־regimes.

---

# ‏6. `RESEARCH_CHALLENGER` — משפחות שצריכות להיבחן מול ה־Core

‏הקבוצה המרכזית:

```text
Relative / Pegged-to-Primary
MidPrice
Snap to Midpoint
Directed Pegged-to-Midpoint
Adaptive Limit Urgent
Adaptive Limit Normal
Sweep-to-Fill
Market-to-Limit
Post Only
Discretionary
```

‏לא כולן באותה עדיפות.

‏אבל כולן מלמדות או בודקות דרך שונה לפתור אחת משלוש בעיות:

```text
1. seek price improvement
2. transfer repricing/routing work to broker/venue
3. increase immediacy without abandoning all price control
```

---

# ‏7. `Relative / Pegged-to-Primary` — High Challenger

‏הערך למנוע שלנו אינו רק "פקודה שזזה".

‏היא בודקת Hypothesis:

```text
Can broker/venue-managed repricing
capture more fills than static passive Limit
without requiring our client to cancel/replace constantly?
```

‏הקורס צריך לחבר אותה במפורש ל־metrics:

```text
fill_rate
fill_latency
number_of_reprices
queue-loss proxy
markout
missed-move cost
cancel count
```

‏וכמובן ל־hard cap ול־signal TTL.

---

# ‏8. `MidPrice`, ‏`Snap Midpoint` ו־`Pegged-to-Midpoint` הן שלוש Hypotheses שונות

‏אסור שה־Decision Engine יראה אותן כ־"midpoint variants" שקולות.

‏הן בודקות ownership שונה של מחיר:

```text
MidPrice
→ broker-managed / SMART execution path

Snap Midpoint
→ calculate once, then fixed Limit

Pegged-to-Midpoint
→ continuously linked midpoint behavior, route-specific
```

‏לכן גם metrics שונות חשובות:

```text
price improvement
fill delay
reprice count / behavior
stale derived-price risk
route dependency
cancel latency
```

‏ממצא לתיקון:

```text
P1 — add one shared engine-facing comparison card for the midpoint family.
```

---

# ‏9. `Adaptive` צריכה להיתפס כ־Delegation, לא כ־Magic Order

‏עבור המנוע:

```text
ADAPTIVE_URGENT
ADAPTIVE_NORMAL
```

‏הן מצבים שבהם אנחנו מעבירים יותר החלטות micro-execution לברוקר.

‏לכן ה־Decision Engine חייב עדיין להחזיק:

```text
intent
hard cap
signal lifetime
position budget
application timeout
cancel authority
fallback policy
```

‏והמחקר צריך לשאול:

```text
Did delegation improve net execution?
```

‏ולא רק:

```text
Did Adaptive fill?
```

---

# ‏10. `Sweep-to-Fill` צריכה להשתלב כ־Aggressive Challenger

‏Review 2 זיהה שהיא חסרה.

‏מבחינת המנוע היא אינה עוד Order Type אקראית; היא candidate למחקר כאשר:

```text
urgency is high
size may require more than one displayed destination/level
hard limit still matters
```

‏היא צריכה להשתלב באותה קבוצת השוואה עם:

```text
MARKETABLE_LIMIT_IOC
ADAPTIVE_URGENT
plain aggressive SMART Limit
```

‏ולא לקבל פרק מנותק מה־Decision Engine.

---

# ‏11. `Post Only` — Guardrail יותר מאשר Strategy

‏מבחינת המנוע, הערך העיקרי של `Post Only` הוא לא "להיות maker".

‏הערך הוא לאכוף invariant:

```text
THIS MODE MUST NOT CROSS
```

‏לכן הסיווג הנכון:

```text
CORE CONCEPT
+
RESEARCH CHALLENGER
+
EXECUTION GUARDRAIL
```

‏אם ה־Signal דורש Fill מיידי, אותו guardrail יכול להפוך את העסקה לגרועה.

‏כלומר capability לבדה אינה מספיקה; היא חייבת לבוא מתוך `liquidity_intent`.

---

# ‏12. `Hidden`, ‏`Iceberg/Reserve` ו־`Discretionary` — Advanced, לא V1 Core

‏שלוש המשפחות חשובות מקצועית, אבל הן לא צריכות לנפח את המימוש הראשוני.

‏הן נעשות רלוונטיות כאשר קיימת Hypothesis ברורה:

```text
our displayed size changes execution quality
our order reveals information
our size is material relative to liquidity
hidden executable discretion improves outcome
```

‏בלי Evidence כזה:

```text
REFERENCE / ADVANCED RESEARCH
```

‏ולא:

```text
production default
```

---

# ‏13. `SAFETY_CRITICAL` — משפחה נפרדת מ־Entry Optimization

‏הקורס צריך לסמן בצורה חזקה במיוחד:

```text
Stop / Stop backstop
Bracket
OCA/OCO
Hybrid Protection
Exit Ownership
Cancel race handling
Reconciliation
```

‏אלה אינם "עוד Challengers להשגת Fill טוב יותר".

‏הם עוסקים ב־:

```text
position survival
bounded exposure
local-process failure
broker-resident protection
prevention of duplicate exits
```

‏לכן הם צריכים acceptance criteria חזקים יותר מ־Entry optimization.

---

# ‏14. `Bracket` — High Educational Priority, implementation priority תלויה Architecture

‏חשוב להפריד:

```text
Must understand deeply
```

‏מ־:

```text
Must use as V1 architecture
```

‏Bracket היא `SAFETY_CRITICAL KNOWLEDGE` משום שהיא מלמדת:

```text
parent/child lifecycle
transmit sequencing
sibling cancellation
partial fills
protection synchronization
double-exit risk
recovery
```

‏אבל המנוע יכול לבחור בסופו של דבר:

```text
broker bracket
```

‏או:

```text
hybrid broker stop + local dynamic exit
```

‏או architecture אחרת שעברה acceptance tests.

‏לכן הקורס צריך להימנע מהשתמעות ש־"למדנו Bracket לעומק ולכן חייבים להשתמש בה".

---

# ‏15. `Stop Backstop` ו־Dynamic Exit אינן מתחרות ישירות

‏זה אחד החיבורים החשובים ביותר למנוע.

‏אפשר להחזיק בו־זמנית שתי מטרות:

```text
local dynamic exit
= optimize normal exit based on live state

broker stop backstop
= survive local failure / extreme path
```

‏הן הופכות לבעיה רק אם ה־ownership וה־quantity synchronization אינם מוגדרים.

‏לכן `HYBRID_PROTECTION` צריכה להופיע כמבנה Architecture, לא רק כ־Order Type comparison.

---

# ‏16. `REFERENCE` — ידע שחשוב להכיר אבל לא לבנות סביבו כרגע

‏המועמדים:

```text
FOK for US-stock use case
AON as general default
MinQty as general default
MIT / LIT
Trailing MIT / Trailing LIT
IBKR ATS-specific pegged variants
Hidden/Iceberg without footprint hypothesis
long-horizon broker algos
product-specific order families outside US stocks
```

‏הן עדיין צריכות להיות מוסברות כאשר הן מלמדות distinction חשוב.

‏אבל הקורא צריך לראות מיד:

```text
Learn this
!=
Build this now
```

---

# ‏17. ממצא `P0` — חסר `Execution Mode Contract` אחיד

‏חלק 10 כבר משתמש ב־Modes, אך במסמך הסופי כל Mode צריכה לקבל Contract אחיד.

‏למשל:

```text
ExecutionModeDefinition {
  mode_id
  purpose
  side_scope
  liquidity_intent
  price_behavior
  broker_primitive
  required_attributes
  routing_policy
  broker_tif
  application_ttl_policy
  hard_price_bound_required
  partial_fill_policy
  cancel_policy
  capability_requirements
  protection_interaction
  fallback_class
  telemetry_requirements
}
```

‏זה יהפוך את הקורס ישירות ל־input של HLD/LLD מאוחר יותר.

---

# ‏18. ממצא `P0` — חסר Mapping מפורש מ־Concept ל־Mode

‏לדוגמה:

```text
Concept: IOC
```

‏אינה Mode בפני עצמה.

‏היא יכולה להיות attribute בתוך:

```text
MARKETABLE_LIMIT_IOC
FAST_EXIT_IOC
EMERGENCY_REDUCE_STEP
```

‏בדומה:

```text
SMART
```

‏היא Routing policy ולא החלטת Entry שלמה.

‏ובתוך:

```text
ADAPTIVE_LIMIT_URGENT
```

‏יש שילוב של:

```text
Limit primitive
+ broker algo
+ urgency parameter
+ routing behavior
+ app TTL
```

‏ה־Mapping הזה צריך להיות מפורש במסמך הסופי.

---

# ‏19. ממצא `P0` — Exit Feasibility צריכה להיות Input ל־Entry, לא מחשבה מאוחרת

‏חלק 10A כבר מתקדם לכיוון הזה, אבל במסמך הסופי זה צריך להיות Principle מרכזי:

```text
Do not ask only:
Can I enter?

Ask:
Can I enter AND plausibly exit this intended size
inside the economic/time constraints of the signal?
```

‏זה רלוונטי במיוחד כאשר Order Type יכולה להשיג Entry יפה אבל ליצור Position שקשה להיפטר ממנה במהירות.

‏הפקודה שמביאה Fill אינה בהכרח הפקודה שמייצרת Trade טוב.

---

# ‏20. ממצא `P0` — Partial Fill חייבת לשנות את Mode Problem

‏אחרי partial fill אין עוד בעיה אחת.

‏יש:

```text
existing_position
+
remaining_entry_intent
```

‏ולכן המנוע חייב להיות רשאי לבחור:

```text
continue entry
stop entry and keep position
protect current position
exit current position
```

‏ולא רק:

```text
retry remainder
```

‏זה כבר מוסבר בחלקים מאוחרים, אבל צריך להיות Principle גלוי בתוך Engine Mapping הסופי.

---

# ‏21. ממצא `P0` — Capability state צריכה לסנן Modes, לא לבחור אותן

‏Capability Matrix עונה:

```text
What is allowed / verified?
```

‏היא אינה עונה:

```text
What is economically best now?
```

‏לכן סדר נכון:

```text
candidate modes
→ eliminate unsupported/unaccepted modes
→ eliminate economically invalid modes
→ apply regime policy among survivors
```

‏אם capability נעלמת בזמן runtime, אין לבצע automatic promotion ל־Market או ל־aggressive mode.

---

# ‏22. שלושה מצבי Enablement שכדאי להוסיף מעל Capability Matrix

‏מעבר לרמות האימות הטכניות, מבחינת המנוע נרצה הבחנה פשוטה:

```text
DISABLED
SHADOW_ONLY
LIVE_ENABLED
```

‏`SHADOW_ONLY` חשובה במיוחד ל־Challengers.

‏המנוע יכול לחשב:

```text
what would MIDPRICE have done?
what would ADAPTIVE have been selected for?
```

‏בלי לשלוח את ה־Order בפועל.

‏כך אפשר לאסוף regime-selection evidence לפני promotion.

---

# ‏23. ממצא `P1` — לכל Mode חסרה `Failure Destination`

‏לא מספיק להגדיר:

```text
MIDPRICE rejected
```

‏צריך להגדיר מה קורה ברמת Decision Engine:

```text
capability conflict?
transient broker reject?
price moved?
signal expired?
unknown submission state?
```

‏ואז:

```text
RECONCILE
RE-EVALUATE
NO_TRADE
TRY LESS AGGRESSIVE MODE
TRY MORE AGGRESSIVE MODE
EXIT_ONLY
```

‏ה־Order עצמה אינה בוחרת fallback.

---

# ‏24. ממצא `P1` — Research Harness צריך להשוות Opportunity, לא רק Order

‏השוואה מקצועית בין Advanced Orders צריכה להתחיל מאותו signal opportunity.

‏נרצה לשמור עבור Candidate alternatives:

```text
same signal_id
same decision snapshot
same intended size
same economic cap
```

‏ואז להשוות:

```text
fill_rate
fill_latency
filled_qty
arrival_slippage
spread_paid_or_captured
price_improvement
markout
missed_move
cancel_latency
fees
exit_cost
net_trade_edge
operational_failures
```

‏אחרת אפשר בטעות להשוות שתי Orders שנשלחו בתנאי שוק שונים לגמרי.

---

# ‏25. ממצא `P1` — צריך להפריד `Execution Quality` מ־`Trade Outcome`

‏Order יכולה להיות מצוינת מבחינת execution ועדיין להוביל לעסקה מפסידה משום שה־Signal היה שגוי.

‏ולהפך, Strategy חזקה יכולה להרוויח למרות execution גרועה.

‏לכן למדידה:

```text
Execution metrics
!=
Strategy P&L metrics
```

‏אבל בסוף צריך גם:

```text
net_trade_edge_after_execution
```

‏כי אין טעם לשפר Fill metric אם הרווח הכולל נפגע.

---

# ‏26. ממצא `P1` — `Reason Codes` צריכים להיות חלק מהלמידה, לא רק מהקוד

‏Decision סופית צריכה להיות explainable:

```text
selected = MARKETABLE_LIMIT_IOC
reason = SIGNAL_LIFE_SHORT_AND_DEPTH_SUFFICIENT
```

‏ולצדה:

```text
MIDPRICE eliminated = SIGNAL_LIFE_TOO_SHORT
PASSIVE eliminated = MISSED_MOVE_RISK_TOO_HIGH
ADAPTIVE eliminated = SHADOW_ONLY
```

‏זה מחבר באופן ישיר את הקורס ל־replay ולמחקר.

---

# ‏27. ממצא `P1` — V1 צריכה להיות deliberately small

‏אחרי קורס כל כך עשיר יש סכנה הפוכה:

> ‏לנסות לממש את כל מה שלמדנו.

‏ה־V1 אינה צריכה עשרים Modes.

‏Baseline סביר למחקר יכול להתחיל ממשהו כגון:

```text
PASSIVE_LIMIT_SHORT_TTL
MARKETABLE_LIMIT_IOC
SMART
STOP_BACKSTOP / HYBRID_PROTECTION candidate
```

‏ואז Challengers נכנסות אחת־אחת דרך:

```text
SHADOW
→ PAPER
→ SMALL LIVE
→ ENABLED
```

‏הקורס צריך לומר זאת במפורש כדי שעומק הידע לא יהפוך ל־implementation bloat.

---

# ‏28. Matrix מוצעת למסמך הסופי

| משפחה | תפקיד במנוע | עדיפות |
|---|---|---|
| ‏Passive Limit + short TTL | baseline ל־price improvement / waiting | `CORE` |
| ‏Marketable Limit + IOC | baseline אגרסיבי עם cap | `CORE` |
| ‏SMART | routing baseline | `CORE` |
| ‏Relative / Pegged-to-Primary | dynamic passive/aggressive repricing | `RESEARCH_CHALLENGER` |
| ‏MidPrice | midpoint SMART challenger | `RESEARCH_CHALLENGER` |
| ‏Snap Midpoint | one-shot midpoint-derived price | `RESEARCH_CHALLENGER` |
| ‏Directed Pegged-to-Midpoint | continuous direct midpoint candidate | `RESEARCH_CHALLENGER` |
| ‏Adaptive Urgent / Normal | broker delegation challenger | `RESEARCH_CHALLENGER` |
| ‏Sweep-to-Fill | aggressive multi-destination challenger | `RESEARCH_CHALLENGER` |
| ‏Post Only | passive invariant / challenger | `CORE CONCEPT` + `RESEARCH_CHALLENGER` |
| ‏Market-to-Limit | aggressive-to-resting hybrid | `RESEARCH_CHALLENGER` |
| ‏Discretionary | hidden execution discretion | `ADVANCED RESEARCH` |
| ‏Hidden / Iceberg | footprint-management hypothesis | `ADVANCED RESEARCH` |
| ‏Stop backstop | broker-resident protection | `SAFETY_CRITICAL` |
| ‏Bracket | linked protection architecture | `SAFETY_CRITICAL KNOWLEDGE` |
| ‏OCA/OCO | sibling dependency / exposure coordination | `SAFETY_CRITICAL KNOWLEDGE` |
| ‏Hybrid Protection | broker backstop + local intelligence | `SAFETY_CRITICAL CHALLENGER` |
| ‏MIT / LIT | trigger-semantics completeness | `REFERENCE` |
| ‏FOK / AON / MinQty | specialized fill constraints | `REFERENCE / SPECIALIST` |

---

# ‏29. מה לא צריך לעשות בתיקונים

‏לא להפוך את הקורס למסמך implementation מלא של הרובוט.

‏המטרה היא להגיע עד לנקודה שבה אפשר לעבור אחר כך ל־HLD/LLD בלי ambiguity לגבי:

```text
what each advanced order means
what problem it solves
what it competes with
what its failure modes are
where it fits in the engine
what must be tested before enabling it
```

‏הקורס אינו צריך להכיל את כל production code, schemas ו־deployment details.

---

# ‏30. השלכה על שלב הפיצול והתיקון

‏בעת פיצול המסמך לפרקים, כדאי שכל chapter file יוכל להסתיים ב־compact engine card:

```text
ENGINE ROLE
PRIORITY
CLOSEST ALTERNATIVES
REQUIRED GATES
MAIN FAILURE MODE
METRICS TO MEASURE
```

‏כך האיחוד הסופי נשאר לימודי, אבל גם שימושי מאוד כתיעוד תכנון.

---

# ‏31. ממצאים להעברה ל־Final Gap List

```text
P0 — Add explicit CORE / CHALLENGER / SAFETY / REFERENCE classification.
P0 — Define one ExecutionMode contract.
P0 — Map broker primitives/attributes/routes/algos to application Modes.
P0 — Make exit feasibility an explicit entry prerequisite.
P0 — Make partial fill a new decision problem, not an automatic retry.
P0 — Capability gates eliminate modes; they never choose economic winner.
P1 — Add DISABLED / SHADOW_ONLY / LIVE_ENABLED operational state.
P1 — Define failure destination for every enabled Mode.
P1 — Compare advanced orders on the same opportunity snapshot.
P1 — Separate execution-quality metrics from trade-outcome metrics.
P1 — Emit selection and elimination reason codes.
P1 — Keep V1 intentionally small despite broad course coverage.
P1 — Add compact Engine Role cards to important families.
```

---

# ‏32. מסקנה של Review 5

‏הקורס כבר מלמד כמעט את כל ה־building blocks החשובים.

‏הפער העיקרי כעת אינו עוד רשימת Order Types.

‏הפער הוא להפוך את הידע ל־hierarchy תפעולית ברורה:

```text
LEARN
↓
CLASSIFY
↓
TEST
↓
SHADOW
↓
ACCEPT
↓
ENABLE
↓
MEASURE
↓
RE-EVALUATE
```

‏כאשר זה ייכנס בתיקונים, הקורא יוכל להבין גם פקודה מתקדמת בפני עצמה וגם בדיוק **איזה תפקיד היא יכולה לקבל במנוע שלנו — בלי להסיק שכל מה שנלמד צריך להיכנס מיד ל־Production**.

---

# ‏Checkpoint — סוף Review 5

‏Review 5 הסתיים ללא שינוי בתוכן הקורס עצמו.

‏ה־Review הבא צריך לבדוק את שכבת **Production Safety / Failure Completeness** של Advanced Orders: האם לכל משפחה שיכולה להישאר חיה אצל Broker, לבצע אחרי delay, להשתנות אוטומטית או להיות תלויה ב־parent/sibling קיימת התייחסות מלאה ל־disconnect, restart, stale intent, late fill, reject, recovery ו־manual intervention.
