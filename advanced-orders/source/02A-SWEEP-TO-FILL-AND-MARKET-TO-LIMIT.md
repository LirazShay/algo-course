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
