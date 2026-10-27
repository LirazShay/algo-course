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