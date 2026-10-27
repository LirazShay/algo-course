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