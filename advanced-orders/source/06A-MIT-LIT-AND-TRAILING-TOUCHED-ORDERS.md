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