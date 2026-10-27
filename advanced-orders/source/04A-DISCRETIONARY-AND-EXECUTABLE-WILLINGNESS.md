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