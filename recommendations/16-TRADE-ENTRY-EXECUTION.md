# ‏16 — Recommendation Sheet: Trade Entry / Execution

> ‏מקור לימודי עיקרי: `../16-TRADE-ENTRY-EXECUTION.md`.
>
> ‏מטרת הקובץ: לקבוע איך להפוך `TRADE_CANDIDATE` ל־Fill אמיתי בלי למחוק את ה־Edge באמצעות latency, spread, chasing, partial fills או state שגוי — תוך הפרדה ברורה בין Signal, Decision, Order Intent, Broker State ו־Position Truth.

---

## ‏1. Decision

‏מקטע 15 מסתיים ב־:

```text
TRADE_CANDIDATE
```

‏אבל עדיין אין Position.

‏מקטע 16 צריך להחליט:

```text
How do we attempt entry?
At what price cap?
For how long?
How aggressive should we be?
When do we cancel?
When may we reprice?
What happens on partial fill?
When does a real position begin?
```

‏השרשרת המלאה היא:

```text
TRADE_CANDIDATE
→ final pre-submit recheck
→ order intent
→ submit
→ broker acknowledgement / working state
→ partial fill / fill / no fill / reject
→ reconciliation
→ actual position
```

‏העיקרון המרכזי:

```text
Signal quality
!=
Execution quality
```

‏Signal טוב יכול להפוך לעסקה גרועה אם הכניסה איטית, יקרה או רודפת אחרי מהלך שכבר התרחש.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Order Intent מלא לפני Submit

‏לפני כל Entry חייב להיווצר Intent פנימי מפורש:

```text
intent_id
signal_id
decision_id
symbol / canonical instrument id
side
target_qty
execution_mode
order_type
initial_reference_price
limit_price / max_buy_price
order_ttl
max_signal_age
max_entry_drift
max_chase_distance
partial_fill_policy
cancel_policy
reprice_policy
risk_snapshot_id
feature_version
score_version
decision_version
execution_policy_version
```

‏ה־Intent אומר מה התכוונו לעשות לפני שהברוקר החזיר משהו.

‏לא משנים בדיעבד את משמעות ה־Intent כדי להתאים ל־Fill שקיבלנו.

### ‏`P0 — Required`: Final Execution Recheck ממש לפני Submit

‏בין `TRADE_CANDIDATE` ל־Submit עושים Recheck קצר ומהיר:

```text
signal still valid
candidate still acceptable
signal age within budget
quote fresh
bid/ask valid
spread within budget
planned qty still executable
price has not escaped edge budget
expected economics still viable
broker connected
account synchronized
open-order state known
risk state still valid
no duplicate intent/order
```

‏אם תנאי קריטי נכשל:

```text
ABORT ENTRY
```

‏ולא:

```text
submit because we already decided earlier
```

### ‏`P1 — Preferred Default`: Price-Capped Aggressive Entry כ־Baseline

‏ל־Short-Horizon Momentum, ברירת המחדל המחקרית ל־Signal עם urgency אמיתית תהיה:

```text
Marketable Limit
```

‏עם:

```text
explicit max_buy_price
```

‏ולא `Market` לא־מוגבלת.

‏הכוונה:

```text
try to obtain a prompt fill
but never beyond the validated economic price cap
```

‏ה־cap אינו Offset קבוע כמו:

```text
ask + $0.01 always
```

‏אלא נגזר מ־:

```text
current ask / executable levels
remaining expected edge
expected exit friction
fees
slippage allowance
safety margin
```

### ‏`P1 — Preferred Default`: שלושה Execution Modes מפורשים

‏המערכת תתמוך רעיונית בשלושה Modes:

```text
PASSIVE
BALANCED
AGGRESSIVE
```

‏כל Mode מגדיר Contract מלא.

#### ‏`PASSIVE`

```text
initial price near same-side quote
very short app-managed TTL
no assumption of fill on touch
cancel if signal or economics deteriorate
```

#### ‏`BALANCED`

```text
improved limit / midpoint-like attempt when supported
short wait
predefined escalation or cancel rule
```

#### ‏`AGGRESSIVE`

```text
marketable limit
strict worst acceptable price
optionally IOC when semantics/support are verified
```

‏ה־Mode אינו נבחר לפי תחושת בטן בזמן אמת.

‏בשלב הראשון אפשר לקבע Mode אחד כ־Baseline ולחקור אחרים ב־Replay/Shadow.

### ‏`P1 — Preferred Default`: Urgency נגזרת מ־Signal Half-Life, לא מ־"Signal חזק"

‏הגורם המרכזי לאגרסיביות צריך להיות:

```text
How quickly does the edge decay?
```

‏ולא רק:

```text
How high is the score?
```

‏רעיון מחקרי:

```text
short half-life + fresh high-quality signal
→ higher execution urgency

longer-lived stable signal
→ more room for price improvement
```

‏אבל `dynamic urgency` נשאר Challenger עד שה־Baseline הקבוע נמדד היטב.

### ‏`P0 — Required`: Entry Window / Signal Expiry

‏כל Intent חייב לכלול:

```text
valid_until
```

‏או equivalent כגון:

```text
max_signal_age_ms
```

‏אם לפני Submit או בזמן waiting:

```text
now > valid_until
```

‏התוצאה היא:

```text
CANCEL / ABORT
```

‏לא מנסים להציל Signal שפג תוקפו.

### ‏`P0 — Required`: Max Entry Price / Edge Budget

‏ה־Execution Engine מקבל Budget ברור.

‏בקנייה:

```text
current_entry_price <= max_buy_price
```

‏כאשר `max_buy_price` נגזר מאותה Economics שהצדיקה את ה־Trade Candidate.

‏אם המחיר עבר אותו:

```text
NO ENTRY
```

‏גם אם:

```text
candidate still Rank #1
```

### ‏`P0 — Required`: אין Infinite Chase

‏אסור Policy מסוג:

```text
keep repricing until filled
```

‏לכל Entry נדרש לפחות אחד או יותר מ־:

```text
max_entry_price
max_chase_distance
max_reprice_count
order_ttl
signal_ttl
```

‏וכאשר התקציב נגמר:

```text
CANCEL
RE-EVALUATE
```

### ‏`P1 — Preferred Default`: Cancel/Reprice רק לפי Policy

‏לא עושים Cancel/Replace על כל Tick.

‏Policy צריכה להגדיר:

```text
when repricing is allowed
how many times
how far
whether queue loss is acceptable
whether signal must be revalidated
```

‏כל Replace הוא החלטת Execution חדשה, לא "עדכון טכני" חסר משמעות.

### ‏`P0 — Required`: Cancel Request אינו Terminal State

‏לאחר:

```text
cancel_requested
```

‏ה־Order עדיין יכולה להתמלא.

‏לכן:

```text
CANCEL_PENDING
```

‏הוא State אמיתי.

‏אסור לשלוח replacement או entry נוספת שמניחה שהקודמת נעלמה עד שהמערכת יודעת את מצבה או ביצעה reconciliation.

### ‏`P0 — Required`: Partial Fill הוא Position אמיתית

‏אם ביקשנו:

```text
target_qty = 100
```

‏וקיבלנו:

```text
filled_qty = 37
```

‏אז מיד:

```text
position_qty = 37
```

‏ולא:

```text
position_qty = 100
```

‏המערכת חייבת להפעיל Position/Exit protection על הכמות שבאמת התמלאה.

‏Partial Fill Policy תגדיר מראש:

```text
minimum useful fill
whether remaining qty is still desired
when remainder is canceled
whether any reprice is allowed
whether filled exposure should immediately be reduced/exited
```

### ‏`P0 — Required`: Position Truth מגיעה מ־Execution Events

‏לא עוברים ל־`POSITION` בגלל:

```text
submit succeeded
broker ack received
order status == submitted
```

‏Position נוצרת רק מ־:

```text
actual fills / executions
```

‏והכמות מתעדכנת לפי cumulative actual filled quantity.

### ‏`P0 — Required`: Unknown Order State ⇒ Reconcile, לא Retry עיוור

‏תרחיש:

```text
submit
→ network disconnect
→ local state uncertain
```

‏התגובה אינה:

```text
submit again
```

‏אלא:

```text
freeze duplicate entry
reconcile broker orders/executions/position
restore authoritative state
then decide
```

### ‏`P0 — Required`: Idempotency / Duplicate Protection

‏אותו Intent לא אמור ליצור שתי כניסות בגלל retry.

‏נשמור לפחות:

```text
intent_id
client/internal order id
submission attempt id
broker order id when known
```

‏ומנגנון state שמונע double-submit כאשר המצב אינו ודאי.

### ‏`P1 — Preferred Default`: Short App-Managed Order TTL

‏גם כאשר ה־Venue/Broker TIF הוא `DAY`, ה־Strategy לא חייבת להשאיר Order עובדת זמן רב.

‏ה־Baseline:

```text
short application-managed TTL
```

‏ולא:

```text
rest until filled
```

‏ה־TTL עצמו חייב להיגזר מ־signal decay ו־fill evidence.

### ‏`P1 — Preferred Default`: `IOC` הוא Challenger חזק ל־Now-or-Never Entry

‏כאשר Signal תקף רק עכשיו, `Marketable Limit + IOC` יכול להיות Policy נקייה:

```text
fill immediately what is available within cap
cancel remainder
re-evaluate from fresh state
```

‏אבל השימוש בפועל דורש אימות עדכני של Broker/API/Product/Route semantics.

### ‏`P1 — Preferred Default`: Exit Path Ready Before Entry Risk Exists

‏לפני Submit חייב להיות ברור:

```text
if 1 share fills, how is it managed?
if partial fill occurs, who owns the exposure?
if full fill occurs, which exit state becomes active?
```

‏מקטע 16 אינו מגדיר את Exit Strategy עצמה — זה מקטע 17 — אבל Entry אסור ליצור exposure שהמערכת אינה יודעת לנהל מיד.

---

## ‏3. Why

### ‏Fact

‏Order acknowledgement אינו Fill.

### ‏Fact

‏Limit נותנת price bound אך אינה מבטיחה execution.

### ‏Fact

‏Market prioritizes immediate execution relative to price certainty, אך actual broker/venue handling יכול לכלול protections או implementation details משתנים.

### ‏Fact

‏Price touch אינו מוכיח שה־Passive Order שלנו התמלאה.

### ‏Fact

‏Cancel ו־Fill יכולים לחצות בזמן; לכן `cancel requested` אינו terminal truth.

### ‏Fact

‏Partial Fill יוצר exposure אמיתי.

### ‏Judgment

‏עבור Edge קטן והחזקה של שניות, מחיר מקסימלי מפורש עדיף כ־Baseline על Market Entry ללא גבול מחיר.

### ‏Judgment

‏`Marketable Limit` היא נקודת מחקר ראשונית טובה ל־urgent entry משום שהיא מאפשרת למדוד Fill Probability מול Price Protection בצורה ברורה.

### ‏Hypothesis

‏ייתכן ש־Execution Mode דינמי לפי signal decay, liquidity ו־spread ישפר Net Outcome מעבר ל־Policy קבועה.

‏זו Hypothesis בלבד.

### ‏Economic Chain

```text
Predicted opportunity
→ decision
→ entry price budget
→ submit
→ fill/no-fill
→ actual position
→ exit
→ realized friction
→ net outcome
```

‏Execution יכולה למחוק Edge דרך:

```text
delay
spread
slippage
chasing
partial fill
missed opportunity
adverse selection
```

---

## ‏4. Use When

‏ה־Baseline מתאים כאשר:

- ‏ה־Trade Candidate כבר עברה מקטע 15.
- ‏יש fresh L1 bid/ask/sizes לפחות.
- ‏יש price cap שניתן לחשב מתוך economics.
- ‏אפשר למדוד timestamps של decision/submit/ack/fill/cancel.
- ‏Broker/order state ניתן ל־reconcile.
- ‏Position state נגזרת מ־fills.
- ‏Exit path מוכן לכל filled quantity.

---

## ‏5. Do Not Use When

‏אין להפעיל Entry Live כאשר:

- ‏quote freshness אינה ידועה.
- ‏אין worst acceptable entry price.
- ‏אין idempotency/duplicate protection.
- ‏Partial Fill אינו נתמך לוגית.
- ‏Cancel state אינו reconciled.
- ‏Broker/account/open-order state אינו ידוע.
- ‏אין דרך לנהל position שנוצרה בזמן disconnect.
- ‏Backtest מניח Fill אוטומטי מכל price touch.

---

## ‏6. Alternatives

### ‏Alternative A — `Market`

‏יתרון:

- ‏execution urgency גבוהה.

‏חסרון:

- ‏אין limit price מפורשת.
- ‏Tail slippage יכול להיות משמעותי.

‏סטטוס:

```text
Avoid initially for normal entry
```

‏אפשר לשקול בהמשך רק אם evidence מוכיח ש־Marketable Limit מפספסת Edge משמעותי וה־tails נשלטים.

### ‏Alternative B — Passive Limit

‏יתרון:

- ‏price improvement אפשרי.
- ‏חיסכון ב־spread crossing.

‏חסרון:

- ‏No Fill.
- ‏queue uncertainty.
- ‏adverse selection.
- ‏missed opportunity.

‏סטטוס:

```text
P2 Challenger
```

### ‏Alternative C — Improved / Midpoint Entry

‏יתרון:

- ‏פשרה אפשרית בין passive ל־aggressive.

‏חסרון:

- ‏fill speed לא מובטח.
- ‏capability תלויה ב־Broker/Venue/Route.

‏סטטוס:

```text
P2/P3 Challenger
```

### ‏Alternative D — `Marketable Limit`

‏יתרון:

- ‏אגרסיבי אך עם price cap.

‏חסרון:

- ‏יכול לא לקבל full fill אם אין מספיק executable liquidity בתוך ה־cap.

‏סטטוס:

```text
P1 Preferred aggressive baseline
```

### ‏Alternative E — `Marketable Limit + IOC`

‏יתרון:

- ‏מתאים ל־now-or-never.
- ‏remainder אינו נשאר stale.

‏חסרון:

- ‏partial fill / no fill נפוצים יותר.
- ‏תלוי semantics תפעוליים.

‏סטטוס:

```text
P2 strong challenger
```

### ‏Alternative F — Dynamic Urgency

‏ממפה:

```text
signal half-life
spread
liquidity
rank/separation
remaining edge
```

‏ל־Execution Mode.

‏סטטוס:

```text
P3
```

‏רק לאחר שיש Baseline telemetry איכותי.

---

## ‏7. Trade-offs

### ‏Price Control vs Fill Certainty

```text
more passive
→ better potential price
→ lower / slower fill probability

more aggressive
→ faster fill probability
→ higher explicit/implicit cost
```

### ‏Confirmation vs Decay

‏יותר זמן להמתין יכול לשפר מחיר — ובאותו זמן להרוג Signal קצר.

### ‏Repricing vs Queue/Latency

‏Cancel/Replace יכול להתקרב לשוק אבל לאבד זמן ומיקום.

### ‏Full Fill vs Fast Partial Exposure

‏המתנה ל־100% fill יכולה להיות יקרה יותר מלקבל partial exposure ולהפסיק לרדוף.

### ‏Complexity vs Adaptivity

‏Policy דינמית יכולה להתאים יותר למצב — אבל מגדילה Overfitting, debug cost ו־operational risk.

---

## ‏8. What I Would Avoid Initially

‏לא להתחיל עם:

- ‏`Always Market`.
- ‏`Always Passive`.
- ‏Infinite Chase.
- ‏Cancel/Replace על כל Tick.
- ‏Full L2 queue simulation כתנאי ל־MVP.
- ‏Venue-specific routing optimization.
- ‏Dynamic urgency עם עשרות rules.
- ‏Broker algos מורכבים לפני telemetry בסיסי.
- ‏Position state שנקבעת מ־requested quantity.
- ‏Retry אוטומטי כאשר order state unknown.
- ‏Backtest שמחשיב price touch כ־full fill ודאי.

---

## ‏9. What to Add Later

‏לאחר Baseline יציב ומדוד:

```text
passive vs aggressive policy selection
midpoint / price-improvement challengers
IOC experiments
fill-probability model
queue/depth features
adaptive urgency
signal-half-life-aware TTL
symbol/liquidity bucket policies
venue/routing experiments
execution-aware cost model
implementation-shortfall optimization
```

‏ורק לאחר מכן:

```text
broker-specific algos
advanced pegged behavior
direct-routing specialists
```

---

## ‏10. Required Data / Evidence

### ‏Order Intent

```text
intent_id
decision_id
signal_id
symbol
side
target_qty
execution_mode
initial_reference_price
limit_price
max_price
valid_until
partial_fill_policy
cancel_policy
execution_policy_version
```

### ‏Market Snapshot at Decision / Submit

```text
bid
ask
bid_size
ask_size
mid
last
spread_abs
spread_bps
quote_age
trade_age
rank
score
signal_age
expected_edge components
```

### ‏Order Lifecycle

```text
intent_created_time
submit_attempt_time
broker_ack_time
working_time
first_fill_time
last_fill_time
cancel_request_time
cancel_confirm_time
reject_time
reconcile_time
```

### ‏Execution Results

```text
requested_qty
filled_qty
remaining_qty
avg_fill_price
fees
reject_reason
terminal_order_state
position_qty_after_event
```

### ‏Counterfactual / No-Fill Evidence

‏לכל No Fill / Cancel:

```text
future_bid/ask/mid path
future executable markouts
what passive/aggressive alternative might have done under the chosen simulation model
```

‏לא מוחקים unsuccessful entry attempts מה־Dataset.

---

## ‏11. Promotion Criteria

### ‏Passive Challenger מתקדם אם:

- ‏Net outcome משתפר אחרי missed opportunities.
- ‏Adverse selection אינו מוחק את price improvement.
- ‏Fill rate וזמני Fill תואמים ל־signal lifetime.
- ‏השיפור שורד OOS ובכמה liquidity buckets.

### ‏`IOC` מתקדם אם:

- ‏הוא מפחית stale resters.
- ‏Net outcome משתפר לאחר partial/no-fill effects.
- ‏לא יוצר excessive missed opportunity.

### ‏Dynamic Urgency מתקדם אם:

- ‏מנצח Policy קבועה OOS.
- ‏הערך מגיע מכמה regimes ולא מ־bucket יחיד.
- ‏לא מגדיל tail slippage בצורה לא מקובלת.
- ‏המורכבות נשארת Observable ו־replayable.

### ‏Reprice Policy מתקדם אם:

- ‏הוא משפר fill-adjusted net outcome.
- ‏chase distance נשלט.
- ‏P95/P99 execution cost אינם מתדרדרים.

---

## ‏12. Rejection Criteria

‏נפסול או נוריד דרגה ל־Execution Policy אם:

- ‏Fill Rate טוב אבל markout / net PnL גרועים.
- ‏Price Improvement טוב אבל missed opportunity גדול יותר.
- ‏Average נראה טוב אך P95/P99 slippage קטסטרופלי.
- ‏היא עובדת רק תחת optimistic fill assumptions.
- ‏היא דורשת chase הולך וגדל.
- ‏היא מייצרת הרבה unknown/reconcile states.
- ‏היא רגישה מאוד לפרמטר אחד מדויק.
- ‏אין parity בין Replay ל־Live semantics.

---

## ‏13. Metrics

### ‏Latency

```text
decision_to_intent
intent_to_submit
submit_to_ack
submit_to_first_fill
submit_to_full_fill
decision_to_first_fill
decision_to_full_fill
cancel_request_to_confirm
```

‏לכולם:

```text
P50
P90
P95
P99
max
```

### ‏Fill

```text
order_fill_rate
quantity_fill_rate
partial_fill_rate
no_fill_rate
cancel_rate
reject_rate
```

### ‏Price / Cost

```text
slippage_vs_decision_mid
slippage_vs_decision_ask
slippage_vs_submit_mid
spread_paid
chase_distance
implementation_shortfall
fees
```

### ‏After-Fill Quality

```text
markout_250ms
markout_1s
markout_2s
markout_5s
markout_10s
```

### ‏Opportunity Cost

```text
no_fill_then_target_reached
cancel_then_target_reached
missed_opportunity_rate
```

### ‏Economic

```text
net outcome by policy
net outcome by latency bucket
net outcome by signal-age bucket
net outcome by chase bucket
net outcome by fill-speed bucket
net outcome by partial/full fill
```

---

## ‏14. Failure Modes

### ‏Stale Entry

‏Signal היה טוב בזמן החלטה אך ישן בזמן Submit.

### ‏Price Escape

‏המהלך כבר קרה לפני Fill.

### ‏Infinite Chase

‏המערכת הופכת Signal ישן לכניסה יקרה.

### ‏Passive Miss

‏חיסכון ב־spread מפספס את המהלך.

### ‏Passive Adverse Selection

‏Fill מגיע בעיקר כאשר השוק מתחיל לנוע נגדנו.

### ‏False Fill Simulation

‏Backtest מניח Fill משום שהמחיר נגע ב־limit.

### ‏Duplicate Entry

‏retry בזמן unknown state יוצר שתי פקודות.

### ‏Cancel/Fill Race

‏המערכת חושבת שבוטל בזמן שהגיע Fill.

### ‏Partial-Fill Desync

‏Exit עובד לפי requested qty במקום actual qty.

### ‏Ack-as-Position Bug

‏State עובר ל־POSITION בלי Fill.

### ‏Benchmark Confusion

‏Slippage נמדד מול `Last` לא מתאים וה־RCA מטעה.

### ‏Tail Blindness

‏Average execution טוב מסתיר rare catastrophic slippage.

### ‏Execution/Signal Confounding

‏שינוי Signal ו־Entry Policy באותו Experiment מונע Attribution.

---

## ‏15. User-Specific Application

‏למטרה שלנו — מניות אמריקאיות, הון קטן יחסית, Opportunity של שניות עד עשרות שניות, ורצון לצאת מהר — אני ממליץ על Baseline כזה:

```text
1. Trade Candidate passes segment 15
2. Fresh L1 recheck
3. Compute remaining edge budget
4. Derive strict max entry price
5. Submit one price-capped aggressive attempt
6. Keep application TTL short
7. If no fill, cancel and return to fresh decision state
8. Do not chase beyond the original economic thesis
9. Any partial fill immediately becomes real position exposure
10. Manage exit using actual filled quantity only
```

‏הדגש הוא:

```text
small size is an advantage
```

‏לא משום שהוא מבטל liquidity constraints, אלא משום שלעיתים ניתן לקבל Fill בכמות קטנה בלי לדרוש infrastructure שמנסה להתחרות ב־HFT.

‏לא הייתי בונה תזה שבה Edge דורש:

```text
sub-millisecond reaction
```

‏אם OOS/Live evidence מראה שה־Edge מתאפס בגלל milliseconds בודדים, זה סימן שה־Horizon אינו מתאים ל־architecture האישית שלנו.

---

## ‏16. Concrete Baseline Contract

### ‏Entry Eligibility

```text
trade_candidate == true
AND signal_valid == true
AND signal_age <= validated_signal_ttl
AND quote_state == VALID_FRESH
AND broker_state == READY
AND account_state == SYNCED
AND open_order_state == KNOWN
AND risk_state == ALLOW_NEW_ENTRY
AND planned_qty > 0
AND execution_feasibility == PASS
=> entry intent may be created
```

### ‏Price Budget

```text
max_buy_price = function(
    current executable ask,
    remaining expected gross edge,
    expected exit friction,
    fees,
    slippage allowance,
    safety margin
)
```

‏הפונקציה המדויקת היא Research/Cost-Model concern, אבל ה־contract הוא:

```text
never submit above max_buy_price
never reprice beyond max_buy_price
```

### ‏Baseline Entry Attempt

```text
mode = AGGRESSIVE_PRICE_CAPPED
order = MARKETABLE_LIMIT
app_managed_ttl = short
reprice_count = 0 initially
```

‏אם אין Fill לפני TTL:

```text
cancel
reconcile terminal state
return to Decision Engine
```

‏לא:

```text
continue chasing by default
```

### ‏Partial Fill

```text
on each execution event:
    position_qty += execution_qty
    remaining_entry_qty = target_qty - position_qty
    enable position protection for actual position_qty
```

‏המשך ניסיון להשלים דורש fresh revalidation.

### ‏Unknown State

```text
unknown order state
=> block duplicate submit
=> reconcile broker state
=> restore authoritative order/position state
=> only then continue
```

---

## ‏17. Confidence

### ‏High Confidence

- ‏Position חייבת להיגזר מ־fills אמיתיים.
- ‏Unknown order state מחייב reconciliation לפני retry.
- ‏Partial Fill דורש handling מפורש.
- ‏Entry צריך signal expiry ו־price bound.
- ‏Execution צריך telemetry נפרדת מ־Signal quality.

### ‏Medium Confidence

- ‏`Marketable Limit` היא Baseline אגרסיבי מתאים למחקר עבור המטרה שלנו.
- ‏Short app-managed TTL צפוי להתאים יותר מ־resting entry ממושכת.

### ‏Low / Unproven

- ‏ה־TTL המספרי האופטימלי.
- ‏ה־price cap המספרי האופטימלי.
- ‏האם `IOC` עדיפה.
- ‏האם Passive/Midpoint משפרים Net Outcome.
- ‏האם Dynamic Urgency מוסיפה Edge.

---

## ‏18. Time-Sensitive Facts

‏לפני Production יש לאמת מחדש:

```text
broker/API supported order types
IOC semantics
Midpoint/MidPrice semantics
SMART vs Direct routing requirements
session eligibility
price increments / tick rules
order-status vocabulary
client/order-id behavior
cancel/replace semantics
bracket/OCA behavior
rate/message limits
```

‏אין להניח ש־capability שקיימת ב־UI קיימת באותו אופן ב־API.

---

## ‏19. Current Verification Snapshot

‏מקטע 04 כבר ביצע Snapshot עדכני ל־2026-10-26 עבור Order Types ו־IBKR-specific semantics, כולל:

- ‏`Marketable Limit` כ־price-capped aggressive baseline.
- ‏`IOC` כ־now-or-never challenger.
- ‏`IBKR MidPrice` ו־`Pegged-to-Midpoint` כמנגנונים שונים.
- ‏העובדה ש־OCA/cancel semantics דורשים reconciliation ולא הנחת atomicity.
- ‏העובדה ששם Order לבדו אינו תמיד מתאר את implementation path בפועל.

‏מקטע 16 אינו מקבע capability חדשה מעבר לכך.

‏כל implementation בפועל יפתח מחדש את התיעוד הרשמי הרלוונטי ל־Broker/API/Product/Route באותו זמן.

---

## ‏20. Relationship to Later Sheets

### ‏מקטע 17 — Exit

‏יגדיר:

```text
profit-taking
stop / adverse move handling
time exit
momentum decay exit
exit order tactics
```

‏מקטע 16 רק דורש שה־Exit Path תהיה מוכנה לכל Fill.

### ‏מקטע 18 — Costs

‏יכייל:

```text
fees
spread cost
slippage
implementation shortfall
round-trip economics
```

‏ומשם ישתפר `max_entry_price`.

### ‏מקטע 19 — Position Sizing / Risk

‏יגדיר Target Qty ו־Risk Budget.

### ‏מקטעים 20+ — Backtest / Replay

‏יחייבו סימולציית execution שמכירה:

```text
no fill
partial fill
latency
queue uncertainty
price cap
cancel timing
```

### ‏Cross-Cutting Execution Policy

‏יאחד בהמשך:

```text
order type
routing
entry mode
TTL
reprice
partial fill
reconciliation
telemetry
```

---

## ‏Recommendation Summary

### ‏Baseline

```text
TRADE_CANDIDATE
→ final fresh recheck
→ explicit Order Intent
→ compute strict price cap
→ one price-capped aggressive attempt
→ short app TTL
→ actual fills define position
→ cancel/reconcile on expiry
→ no blind retry
→ no infinite chase
```

### ‏Preferred Default

```text
Marketable Limit
+ explicit max price
+ short application TTL
+ zero/very limited repricing initially
+ fill-driven position state
```

### ‏Challengers

```text
Passive Limit
Midpoint / price improvement
Marketable Limit + IOC
limited reprice policy
```

### ‏Advanced

```text
Dynamic Urgency
fill-probability model
depth/queue-aware execution
venue/routing optimization
```

### ‏Avoid Unless Evidence

```text
Always Market
Always Passive
Infinite Chase
price-touch == fill
retry on unknown order state
requested_qty == position_qty
complex broker algos before baseline telemetry
```

### ‏Core Principle

```text
The best entry is not the cheapest fill.
The best entry is the execution policy that preserves the most
repeatable net edge from decision to actual position.
```
