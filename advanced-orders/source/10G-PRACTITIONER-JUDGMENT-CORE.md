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