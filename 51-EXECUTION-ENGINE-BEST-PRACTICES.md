# ‏שלב 51 — `Execution Engine Best Practices`: להפוך החלטת מסחר ל־Fill בלי ליצור כאוס

> ‏מטרת הפרק: להבין כיצד בונים `Execution Engine` מקצועי שמתרגם `Order Intent` לפעולות אצל הברוקר תוך שמירה על idempotency, מניעת כפילויות, ניהול partial fills, cancel/replace races, pending exposure, unknown-effect handling, reconciliation, recovery ו־execution invariants.
>
> ‏העיקרון המרכזי: **“שלחתי Order” אינו מצב עסקי. זו רק בקשה ל־side effect חיצוני. עד שלא הצלחנו להוכיח מה הברוקר קיבל, מה פתוח, מה מולא ומה ה־Position בפועל — המערכת חייבת לנהל אי־ודאות במפורש.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. איפה `Execution Engine` יושב במערכת

```text
Market Data
   ↓
Scanner / Strategy
   ↓
Risk Gate
   ↓
Order Intent
   ↓
Execution Engine
   ↓
Broker Adapter
   ↓
Broker / Venue
   ↓
ACK / Order Status / Fill / Reject / Cancel
   ↓
Reconciliation + Position State
```

‏ה־Strategy מחליטה **מה היא רוצה**.

‏ה־Execution Engine אחראי על **איך לבצע את זה בבטחה**.

‏זו הפרדה קריטית.

---

# ‏2. `Intent` אינו `Order`

‏נרצה להבדיל בין:

```text
Intent:
"אני רוצה לקנות עד 120 מניות AAPL,
כל עוד ה-edge חי,
במחיר מוגן,
ולא יותר מ-X exposure."
```

‏לבין:

```text
Broker Order:
BUY 120 @ LIMIT 201.15
```

‏ה־Intent הוא semantic.

‏ה־Broker Order הוא implementation detail.

---

# ‏3. למה ההפרדה הזו חשובה

‏אותו Intent יכול להתממש באמצעות:

- ‏`Marketable Limit`.
- ‏`Passive Limit`.
- ‏`IOC`.
- ‏`Pegged`.
- ‏`Midpoint`.
- ‏`Smart Routing`.
- ‏כמה child orders.
- ‏Broker Algo.

‏ה־Strategy לא צריכה לדעת את כל הפרטים האלה.

---

# ‏4. `Order Intent` צריך להיות immutable ככל האפשר

‏Intent טוב מכיל:

- ‏`IntentId`.
- ‏`DecisionId`.
- ‏Symbol.
- ‏Side.
- ‏Target quantity.
- ‏Max price / Min price.
- ‏Max slippage.
- ‏Urgency.
- ‏Signal timestamp.
- ‏Signal TTL.
- ‏Execution deadline.
- ‏Strategy version.
- ‏Risk snapshot.
- ‏Reason code.

‏אם צריך שינוי מהותי — יוצרים Intent חדש או Version חדש.

---

# ‏5. `IntentId` הוא עוגן Idempotency

‏אותו Intent אסור שייצר פעמיים exposure בגלל retry.

```text
IntentId = stable business identity
```

‏Retry של אותה פעולה חייב להישען על אותו identity.

---

# ‏6. “Exactly Once” הוא בדרך כלל אשליה

‏במערכת מבוזרת יכול לקרות:

```text
Client sends order
→ Broker receives it
→ ACK is lost
→ Client times out
```

‏המחשב המקומי לא יודע אם ההשפעה קרתה.

‏אם פשוט שולחים שוב — אפשר ליצור order כפול.

---

# ‏7. `UNKNOWN_EFFECT`

‏זהו מצב מפורש שבו:

```text
We attempted an external side effect,
but cannot prove whether it happened.
```

‏זה אינו Exception טכני רגיל.

‏זה מצב עסקי מסוכן.

---

# ‏8. מה עושים ב־`UNKNOWN_EFFECT`

‏ברירת המחדל:

1. ‏לא שולחים שוב אוטומטית.
2. ‏עוצרים creation של risk חדש עבור אותו Intent.
3. ‏מבצעים reconciliation.
4. ‏מחפשים order לפי IDs/attributes אצל הברוקר.
5. ‏בודקים executions/fills.
6. ‏בודקים position בפועל.
7. ‏רק לאחר מכן מחליטים אם מותר retry.

---

# ‏9. `ClientOrderId`

‏כאשר הברוקר מאפשר client-defined identifier, הוא נכס חשוב.

‏נרצה mapping:

```text
IntentId
→ ClientOrderId
→ BrokerOrderId
→ ExecutionIds
```

‏אסור להסתמך רק על ID זמני בזיכרון.

---

# ‏10. Generation / Attempt Number

‏לאותו Intent יכולים להיות כמה attempts חוקיים:

```text
Intent I-100
Attempt 1
Attempt 2
Attempt 3
```

‏אבל כל Attempt חייב להיות distinguishable.

‏דוגמה:

```text
I-100:A1
I-100:A2
I-100:A3
```

---

# ‏11. Retry ≠ New Business Intent

‏צריך להבדיל:

```text
Transport Retry
```

‏מול:

```text
Execution Reprice / New Attempt
```

‏Retry טכני מנסה להשלים אותה בקשה.

‏Reprice הוא החלטת ביצוע חדשה.

---

# ‏12. `Order Journal`

‏לפני כל side effect חשוב נרצה durable record.

```text
IntentCreated
RiskApproved
SubmitAttempted
SubmitAcknowledged
BrokerOrderObserved
PartialFill
CancelRequested
CancelConfirmed
FillObserved
Reconciled
Closed
```

‏זהו audit trail וגם בסיס recovery.

---

# ‏13. Write-before-Send

‏דפוס בטוח:

```text
persist intent/attempt
→ commit
→ send to broker
```

‏לא:

```text
send
→ hope persistence succeeds later
```

‏אחרת crash בדיוק אחרי send יכול למחוק את הידע שהפקודה קיימת.

---

# ‏14. `Outbox` Concept

‏כאשר מתאים, ניתן להשתמש ב־Outbox-style pattern:

```text
Business state + outbound command intent
committed together
```

‏ואז worker שולח את הפקודה ומסמן progress.

‏אבל גם Outbox לא פותר לבדו unknown external effects.

---

# ‏15. State Machine של Order

‏State Machine מקומית אפשרית:

```text
CREATED
RISK_APPROVED
SUBMITTING
ACKNOWLEDGED
WORKING
PARTIALLY_FILLED
CANCEL_REQUESTED
CANCELED
FILLED
REJECTED
EXPIRED
UNKNOWN_EFFECT
RECONCILING
TERMINAL
```

‏שמות מדויקים יכולים להשתנות.

‏העיקר הוא transition חוקי ומפורש.

---

# ‏16. Broker Status אינו בהכרח State פנימי

‏ברוקר יכול להשתמש בסטטוסים משלו.

‏ה־Adapter צריך למפות אותם ל־canonical semantics.

‏אסור לתת ל־Strategy להיות תלויה במחרוזות status של ספק מסוים.

---

# ‏17. Events יכולים להגיע out of order

‏דוגמה אפשרית:

```text
Fill callback
arrives before
Order status callback
```

‏או reconnect גורם ל־snapshot שמכיל state מתקדם יותר ממה שראינו קודם.

‏המערכת חייבת להיות tolerant לכך.

---

# ‏18. Duplicate Events

‏אותו execution/event יכול להופיע יותר מפעם אחת.

‏כל ingestion path צריך להיות idempotent.

‏למשל לפי:

- ‏Broker execution ID.
- ‏Order ID + fill sequence.
- ‏Stable event identity.

---

# ‏19. `Fill` הוא fact חשוב יותר מ־status

‏אם execution report מוכיח שמולאו 40 מניות — זה fact.

‏אסור למחוק אותו בגלל status callback ישן.

---

# ‏20. Event Precedence

‏צריך להגדיר precedence בין facts.

‏לדוגמה:

```text
Execution facts
> order summaries
> local expectations
```

‏אבל exact mapping תלוי בברוקר.

---

# ‏21. Partial Fill הוא state רגיל

‏אין להתייחס ל־Partial Fill כתקלה.

‏הוא חלק טבעי מה־execution lifecycle.

```text
Requested = 100
Filled = 37
Remaining = 63
```

---

# ‏22. Partial Fill משנה Exposure

‏מרגע שמולאו 37 מניות:

```text
Actual Position += 37
Pending Exposure = remaining live risk
```

‏אסור להמשיך לחשוב במונחי “או 0 או 100”.

---

# ‏23. Partial Fill משנה גם את ה־Exit Problem

‏אם ה־signal מת:

‏ייתכן שצריך:

- ‏לבטל remaining entry.
- ‏להוציא את 37 שכבר מולאו.
- ‏למנוע order חדש שמתנגש עם הפעולות האלה.

---

# ‏24. `Pending Exposure`

‏זהו exposure שעדיין לא הפך בהכרח ל־Position אבל עלול להפוך.

‏כולל למשל:

- ‏Working buy orders.
- ‏Unknown-effect submissions.
- ‏Cancel requests שעדיין לא אושרו.
- ‏Child orders שעוד פעילים.

---

# ‏25. Risk חייב לספור Pending Exposure

‏דוגמה:

```text
Current position = 100
Working buy = 80
Unknown buy = 50
```

‏אי אפשר לחשב exposure כ־100 בלבד.

‏Risk צריך להיות שמרני.

---

# ‏26. Cancel אינו “מחיקה”

‏`CancelRequested` אינו אומר שה־Order כבר לא יכול להתמלא.

‏עד שיש confirmation אמין, הוא עדיין יכול לקבל Fill.

---

# ‏27. `Cancel/Fill Race`

‏תרחיש קלאסי:

```text
T0 Cancel sent
T1 order executes at venue
T2 cancel ACK arrives
T3 fill callback arrives
```

‏לכן:

```text
CancelRequested != SafeToForget
```

---

# ‏28. Replace אינו פעולה אטומית אוניברסלית

‏במערכות מסוימות replace יכול להיות amend.

‏באחרות הוא עשוי להתנהג כ־cancel + new.

‏זה משפיע על:

- ‏Queue priority.
- ‏IDs.
- ‏Race conditions.
- ‏Exposure.

---

# ‏29. `Cancel-Then-New` מסוכן

‏אם ה־cancel לא ברור וה־new כבר נשלח, ייתכן ששניהם חיים יחד.

‏צריך `replacement generation` ו־pending exposure שמכסה את worst case.

---

# ‏30. `No Overfill` Invariant

‏Invariant חשוב:

```text
FilledQty + PotentiallyLiveQty
must not exceed
maximum allowed exposure
```

‏אלא אם זו התנהגות מפורשת ומתוכננת.

---

# ‏31. Order Quantity היא Delta, לא תמיד Target

‏צריך להחליט semantics מפורשים:

```text
Target position = 100
```

‏שונה מ־:

```text
Buy additional 100
```

‏בלבול בין השניים יכול ליצור duplicate exposure.

---

# ‏32. Target-Position Execution

‏לעיתים safer לחשוב:

```text
Desired Position = +100
Current Position = +37
Potentially Live Buy = +20
Required New Exposure = +43
```

‏במקום “שלח עוד 63” בלי reconciliation.

---

# ‏33. `Position Controller`

‏אפשר להפריד רכיב שאחראי על:

```text
Desired position
vs
Actual position
vs
Potential position
```

‏וה־Execution Engine מנסה לצמצם את הפער בבטחה.

---

# ‏34. Broker Truth מול Local Truth

‏יש לפחות שלושה סוגי truth:

```text
Local intended state
Broker-reported order state
Broker/account actual position
```

‏במצב recovery, ה־broker/account facts מקבלים משקל גבוה.

---

# ‏35. `Reconciliation`

‏Reconciliation משווה:

- ‏Open orders.
- ‏Executions.
- ‏Positions.
- ‏Cash / buying power כאשר רלוונטי.
- ‏Local journal.

‏ומזהה discrepancies.

---

# ‏36. Reconciliation אינו רק Startup Feature

‏צריך reconciliation:

- ‏ב־startup.
- ‏אחרי reconnect.
- ‏אחרי timeout חריג.
- ‏אחרי unknown effect.
- ‏מחזורית לפי צורך.
- ‏לפני resume מ־safety halt.

---

# ‏37. Startup Rule

‏אחרי restart:

```text
Do not assume local memory is current.
```

‏לפני creation של risk חדש:

1. ‏טוענים journal.
2. ‏מתחברים לברוקר.
3. ‏מביאים open orders.
4. ‏מביאים positions.
5. ‏מביאים recent executions אם אפשר.
6. ‏מבצעים reconciliation.
7. ‏רק אז readiness.

---

# ‏38. Orphan Order

‏`Orphan Order` הוא order שהברוקר רואה אבל המערכת המקומית לא מצליחה לקשר ל־Intent חוקי.

‏זה אירוע Safety.

---

# ‏39. Missing Order

‏המצב ההפוך:

```text
Local says WORKING
Broker cannot find it
```

‏לא מניחים אוטומטית שהוא canceled.

‏בודקים fills / executions / history.

---

# ‏40. Position Mismatch

‏אם:

```text
Local position != Broker position
```

‏Strategy לא ממשיכה כאילו הכול תקין.

‏זה reconciliation incident.

---

# ‏41. Unknown Position הוא מצב מסוכן במיוחד

‏אם לא ניתן לדעת exposure אמיתי:

```text
BLOCK_NEW_ENTRIES
```

‏הוא default הגיוני.

‏Risk-reducing actions נשמרות אם אפשר לבצע אותן בבטחה.

---

# ‏42. `Execution Epoch`

‏לאחר recovery/restart/kill event אפשר להשתמש ב־generation/epoch.

‏Intent שנוצר ב־epoch ישן לא חייב להיות חוקי ב־epoch החדש.

---

# ‏43. Stale Intent Rejection

‏לפני Submit בודקים מחדש:

- ‏Signal TTL.
- ‏Price bound.
- ‏Market status.
- ‏Risk.
- ‏Position.
- ‏Existing live orders.
- ‏Pending exposure.
- ‏Execution epoch.

---

# ‏44. Decision-to-Submit Revalidation

‏גם אם Strategy אישרה candidate לפני 80ms, השוק יכול להשתנות.

‏ה־Execution Engine צריך last-mile recheck.

---

# ‏45. `Execution Budget`

‏נרצה לדעת כמה מה־edge מותר “לבזבז” על execution.

```text
Predicted Edge
- spread
- fees
- expected slippage
- expected adverse selection
- latency decay
= remaining execution budget
```

---

# ‏46. Hard Price Protection

‏במיוחד באסטרטגיה קצרה:

‏Order דינמי צריך hard bounds.

‏לדוגמה:

- ‏Max buy price.
- ‏Min sell price.
- ‏Max slippage.
- ‏Max chase distance.

---

# ‏47. `Marketable Limit` כ־Safety Primitive

‏במקרים רבים הוא מאפשר aggression עם price cap.

‏אבל הוא עדיין אינו מבטיח Fill.

‏והוא עדיין יכול לקבל partial fill.

---

# ‏48. Order TTL

‏Order יכול להיות חוקי רק לזמן קצר.

```text
Signal TTL != Order TTL
```

‏Signal יכול לחיות 2s, אך Order passive אולי יקבל 300ms בלבד לפני reassessment.

---

# ‏49. TTL Expiration אינו תמיד Cancel Confirmation

‏אם ה־Engine מחליט שה־Order “expired” מבחינה פנימית:

‏עדיין צריך cancel/reconciliation מול broker.

---

# ‏50. `Execution Policy`

‏רכיב נפרד יכול להחליט:

- ‏Passive / aggressive.
- ‏Price.
- ‏TTL.
- ‏Reprice threshold.
- ‏Fallback.
- ‏Max attempts.
- ‏Route intent.

‏אבל הוא לא עוקף Risk Engine.

---

# ‏51. Execution Policy Versioning

‏כל Fill צריך לדעת באיזו policy version נוצר.

‏אחרת אי אפשר לבצע attribution אמין.

---

# ‏52. Capability Checks

‏לפני שימוש ביכולת:

```text
supports IOC?
supports pegged?
supports midpoint?
supports native bracket?
supports client IDs?
```

‏לא מניחים.

---

# ‏53. Never Silently Change Semantics

‏אם Strategy מבקשת:

```text
POST_ONLY
```

‏והברוקר אינו תומך — אסור Adapter להפוך בשקט ל־ordinary limit.

‏או:

- ‏Reject capability.
- ‏Fallback מפורש ומאושר.

---

# ‏54. Native מול Simulated Orders

‏צריך לדעת האם:

- ‏ה־venue מנהל את ההתנהגות.
- ‏הברוקר מנהל אותה.
- ‏הלקוח שלנו מסמלץ אותה.

‏ההבדל משנה latency, failure modes ו־recovery.

---

# ‏55. Parent / Child Orders

‏ב־Broker Algo או routing מתקדם:

```text
Parent Intent
→ one or more child orders
```

‏Risk ו־reconciliation צריכים לאחד אותם ל־business intent אחד.

---

# ‏56. Child Order אינו Position עצמאי

‏אסור שכל child יחשב כאילו הוא Strategy חדשה.

‏הוא חלק מה־same execution objective.

---

# ‏57. OCO / OCA / Bracket Semantics

‏פקודות קשורות דורשות state משותף.

‏גם אם הברוקר מציע native linkage, ה־Engine צריך לדעת:

- ‏מה ה־parent.
- ‏מה הילדים.
- ‏מה מבטל מה.
- ‏מה קורה ב־partial fill.

---

# ‏58. Exit Orders יכולים ליצור Over-Exit

‏אם יש Position 50 ויש שתי exit orders פעילות של 50 כל אחת ללא linkage אמין — worst case הוא Sell 100.

‏צריך invariant שמונע זאת.

---

# ‏59. Duplicate Exit Protection

‏במיוחד בזמן panic/retry:

```text
Exit requested
→ timeout
→ strategy requests exit again
```

‏אסור לשלוח duplicate blind.

---

# ‏60. `Flatten Intent`

‏Flatten הוא semantic target:

```text
Desired Position = 0
```

‏לא “שלח Market Sell של quantity שזכורה לי”.

---

# ‏61. Flatten צריך Reconciliation

‏אם position השתנה בגלל fill בזמן שה־flatten התחיל, quantity חייב להתעדכן.

---

# ‏62. Risk-Reducing Actions מקבלות Priority

‏ב־backpressure:

```text
Exit / cancel / risk reduction
> new entries
```

‏זה כלל תפעולי חשוב.

---

# ‏63. Single Writer Principle

‏כאשר אפשר, state קריטי של account/order צריך writer לוגי יחיד.

‏זה מפחית race conditions.

---

# ‏64. Actor / Partition Model

‏אפשר partition לפי:

- ‏Account.
- ‏Order.
- ‏Symbol.

‏אבל צריך להיזהר כש־Risk הוא account-wide.

---

# ‏65. Locks אינם אסטרטגיית correctness בפני עצמה

‏Lock מקומי לא מונע:

- ‏Duplicate process.
- ‏Restart.
- ‏Broker callback מאוחר.
- ‏Network retry.

‏Correctness חייב להיות durable ומבוסס IDs/state.

---

# ‏66. Optimistic Concurrency

‏Version numbers יכולים למנוע update על state ישן.

```text
OrderVersion = 7
```

‏Update מ־version 5 לא צריך לדרוס state מתקדם יותר.

---

# ‏67. Fencing Tokens

‏אם יש סכנה ששני executors ירוצו במקביל:

‏נרצה lease/fencing model שמבטיח שרק executor generation הנוכחי מורשה ליצור side effects.

---

# ‏68. Split Brain

‏שני processes שחושבים שהם active executor הם failure חמור.

‏הגנה נדרשת ברמת ownership, לא רק logging.

---

# ‏69. Heartbeat אינו Ownership Proof

‏Heartbeat אומר שמישהו חי.

‏הוא לא בהכרח אומר שרק הוא רשאי לבצע Orders.

---

# ‏70. Durable Ownership

‏אם architecture דורשת active/passive executors, ownership צריך להיות durable וברור.

---

# ‏71. Broker Session Identity

‏חשוב לתעד:

- ‏Session ID.
- ‏Connection generation.
- ‏Account.
- ‏Environment.
- ‏Paper/Live.

‏כדי לא לערבב state בין sessions.

---

# ‏72. Environment Guard

‏`Paper` ו־`Live` לא צריכים להיות רק config string.

‏רצוי visual/operational separation חזקה.

---

# ‏73. Account Guard

‏לפני readiness:

‏מאמתים שהחשבון שאליו התחברנו הוא החשבון הצפוי.

---

# ‏74. Symbol Identity

‏לא להסתמך רק על ticker אם broker משתמש ב־contract IDs.

‏Corporate actions וסימבולים דומים יכולים ליצור ambiguity.

---

# ‏75. Price/Tick Validation

‏לפני Submit:

- ‏Tick size.
- ‏Price increment.
- ‏Positive quantity.
- ‏Allowed order type.
- ‏Session eligibility.

---

# ‏76. Quantity Normalization

‏Fractional / whole-share rules צריכים capability-aware handling.

‏אין לעגל silently אם זה משנה exposure מהותית.

---

# ‏77. Reject הוא מידע

‏Reject אינו רק Exception.

‏הוא צריך:

- ‏Reason code canonical.
- ‏Broker raw code.
- ‏Intent context.
- ‏Whether retry is safe.

---

# ‏78. Retry Taxonomy

‏Rejectים מתחלקים למשל ל־:

- ‏Permanent.
- ‏Transient.
- ‏Ambiguous.
- ‏Capability error.
- ‏Risk rejection.
- ‏Session/state error.

‏לא כל Reject retryable.

---

# ‏79. Timeout אינו Reject

‏Timeout פירושו:

```text
No answer observed in time.
```

‏הוא לא מוכיח שהברוקר דחה את הפקודה.

---

# ‏80. ACK אינו Fill

‏ACK אומר שהפקודה התקבלה/נרשמה לפי semantics של הברוקר.

‏הוא לא אומר שהתבצעה.

---

# ‏81. Fill אינו בהכרח Final

‏במקרים מסוימים יכולים להיות corrections/busts או updates נוספים לפי infrastructure/provider.

‏לכן Execution Ledger צריך לתמוך בתיקון fact ולא רק append של PnL סופי מוקדם מדי.

---

# ‏82. Commission יכולה להגיע מאוחר

‏Net PnL בזמן אמת יכול להיות provisional אם fee data מגיע מאוחר יותר.

---

# ‏83. Execution Ledger

‏לכל execution נשמור לפחות:

- ‏Execution ID.
- ‏Order identity.
- ‏Side.
- ‏Qty.
- ‏Price.
- ‏Timestamp(s).
- ‏Venue אם ידוע.
- ‏Liquidity flag אם זמין.
- ‏Commission/fees כאשר זמינים.
- ‏Correction status.

---

# ‏84. Position Ledger

‏Position עדיף להיגזר מ־facts כאשר אפשר, ולא להיות counter לא מוסבר בזיכרון.

---

# ‏85. Average Price אינו מספיק

‏ל־RCA נרצה לשמור את כל fills, לא רק average fill price.

---

# ‏86. Order Timeline

‏כל Order צריך timeline מלא:

```text
Decision
Intent
RiskApproval
SubmitAttempt
ACK
Working
PartialFill(s)
Cancel/Replace
FinalFill/Cancel/Reject
Flat
```

---

# ‏87. Timestamp Domains

‏נשמור בנפרד:

- ‏Event time.
- ‏Local receive time.
- ‏Decision time.
- ‏Submit time.
- ‏Broker ACK time.
- ‏Fill time.

‏לא מערבבים.

---

# ‏88. Latency Attribution

‏Execution Engine צריך לאפשר למדוד:

```text
decision_to_submit
submit_to_ack
ack_to_first_fill
submit_to_first_fill
first_to_last_fill
cancel_to_cancel_ack
exit_intent_to_flat
```

---

# ‏89. `Time to Flat`

‏לרובוט קצר שלנו זה metric קריטי.

‏לא מספיק למדוד זמן ל־entry.

---

# ‏90. Repricing Budget

‏אין לעשות cancel/replace אינסופי.

‏נרצה:

- ‏Max reprices.
- ‏Min move threshold.
- ‏Cooldown.
- ‏Max chase distance.
- ‏TTL.

---

# ‏91. Hysteresis

‏Reprice על כל tick קטן יכול לגרום churn ולאבד queue priority.

‏Hysteresis מונע oscillation.

---

# ‏92. Reprice אינו Free

‏הוא עולה:

- ‏Latency.
- ‏Queue position.
- ‏Messaging budget.
- ‏Operational complexity.

---

# ‏93. Cancel Rate / Message Rate

‏מערכת צריכה למדוד גם כמות modifications/cancels.

‏לא רק fills.

---

# ‏94. Broker/API Pacing

‏API יכול להגביל request rates או להתנהג גרוע תחת עומס.

‏Exact limits הם broker-specific ויש לבדוק אותם מול תיעוד עדכני.

---

# ‏95. Backpressure בתוך Execution Engine

‏אם callbacks או commands נערמים:

‏אסור ליצור latency נסתרת.

‏נמדוד:

- ‏Queue length.
- ‏Queue age.
- ‏Oldest command age.
- ‏Processing lag.

---

# ‏96. Command Priority

‏Priority הגיוני:

```text
Safety / flatten
Cancel stale risk
Exit
Reconcile unknown
Entry
Background diagnostics
```

---

# ‏97. Load Shedding

‏במצב overload עדיף לדחות entries חדשים מאשר לעכב exits/reconciliation.

---

# ‏98. Fail Closed for New Risk

‏כאשר execution state לא אמין:

```text
new risk = blocked
risk-reducing path = preserved if possible
```

---

# ‏99. Safety Overrides Strategy

‏Strategy לא יכולה לבטל `EXIT_ONLY`, ‏`BLOCK_NEW_ENTRIES` או kill state.

---

# ‏100. Broker Disconnect

‏Disconnect דורש להבחין בין:

```text
connection lost
broker state lost locally
orders still alive externally
```

‏Orders לא נעלמים רק כי socket נפל.

---

# ‏101. Reconnect

‏לאחר reconnect:

1. ‏לא מניחים continuity.
2. ‏מקבלים broker state.
3. ‏משווים open orders.
4. ‏משווים executions.
5. ‏משווים positions.
6. ‏פותרים discrepancies.
7. ‏רק אז resume.

---

# ‏102. Late Fill after Reconnect

‏צריך להיות מסוגלים לקלוט Fill שמתייחס ל־Order שנוצר לפני הניתוק.

---

# ‏103. Late Fill after Cancel

‏גם Order מקומי שמסומן cancel-requested יכול לקבל fill מאוחר.

‏ה־Engine חייב לעדכן position ולפעול בהתאם.

---

# ‏104. Late Fill after Strategy Gave Up

‏Strategy יכולה להחליט שה־signal מת.

‏אבל execution fact מאוחר עדיין אמיתי.

‏האחריות עוברת ל־position/risk handling.

---

# ‏105. `Abandoned Intent` אינו Ignored Order

‏אם intent כבר לא רצוי, עדיין צריך לסגור lifecycle של order חיצוני.

---

# ‏106. Entry ו־Exit הם לא Symmetric

‏Entry יכול לבחור `NO TRADE`.

‏Exit מ־Position קיים הוא בעיית risk reduction.

‏לכן policy יכולה להיות aggressive יותר ביציאה.

---

# ‏107. Exit Feasibility

‏לפני Entry נרצה לשאול:

```text
Can I plausibly get out fast enough?
```

‏Execution Engine צריך לספק metrics שתומכים בהחלטה הזו.

---

# ‏108. Position Locking

‏אם יש Position פתוח, Strategy חדשה באותו Symbol צריכה policy ברורה:

- ‏אסור entry נוסף.
- ‏מותר add.
- ‏מותר reverse.

‏לא משאירים זאת implicit.

---

# ‏109. Reverse Position

‏מעבר מ־Long ל־Short הוא לא “Sell” פשוט.

‏הוא כולל:

```text
flatten existing long
+ establish short
```

‏ויש לו implications של borrow/risk/regulation.

---

# ‏110. `One Position per Symbol` הוא Policy

‏לא חוק טבע.

‏אבל לרובוט אישי KISS הוא baseline טוב עד שיש צורך מוכח ביותר מורכבות.

---

# ‏111. Cross-Symbol Risk

‏גם אם Execution Engine partitioned לפי Symbol, account-level limits חייבים להישמר.

---

# ‏112. Reservation Model

‏לפני Submit אפשר לבצע reservation של risk/capital.

```text
Risk available
→ reserve
→ submit
→ release unused reservation
```

‏זה מונע ששני intents מקבילים ישתמשו באותו budget.

---

# ‏113. Reservation חייב לכלול Worst Case

‏במיוחד בזמן cancel/replace ו־unknown effect.

---

# ‏114. Buying Power Snapshot יכול להיות Stale

‏לא משתמשים בנתון ישן כאילו הוא guarantee.

---

# ‏115. Execution Truth אינו Market Data Truth

‏Market Data Provider יכול לומר מחיר אחד.

‏Broker execution יכול להתרחש במחיר אחר.

‏ל־PnL ו־position, execution facts הם authoritative.

---

# ‏116. Provider Divergence לפני Submit

‏אם market data שלנו רחוק משמעותית מ־broker quote, ייתכן שיש stale feed או fragmentation issue.

‏זה יכול לחסום Entry.

---

# ‏117. `Pre-Submit Snapshot`

‏לכל attempt נשמור:

- ‏Bid/Ask.
- ‏Spread.
- ‏Last.
- ‏Relevant book/flow features.
- ‏Signal score.
- ‏Risk state.
- ‏Price bound.

‏כדי לבצע RCA אמיתי.

---

# ‏118. `Post-Fill Snapshot`

‏נשמור markouts לאחר fill כדי למדוד execution quality ו־adverse selection.

---

# ‏119. Execution Metrics

‏נמדוד לפחות:

- ‏Submit success rate.
- ‏Reject rate.
- ‏Fill rate.
- ‏Partial fill rate.
- ‏Cancel success latency.
- ‏Reprice count.
- ‏Time to first fill.
- ‏Time to full fill.
- ‏Time to flat.
- ‏Slippage.
- ‏Effective spread.
- ‏Markout.
- ‏Missed opportunity.

---

# ‏120. Metrics לפי Segment

‏לא רק global average.

‏נחתוך לפי:

- ‏Symbol liquidity.
- ‏Spread bucket.
- ‏Regime.
- ‏Order type.
- ‏Execution policy.
- ‏Signal age.
- ‏Venue/route כאשר ידוע.
- ‏Position size.

---

# ‏121. P50 אינו מספיק

‏Execution failures חיים ב־tails.

‏נרצה P95/P99 וגם worst incidents.

---

# ‏122. `Unknown Effect Rate`

‏זה metric Production חשוב.

‏אם הוא גדל — reliability יורדת גם אם PnL עדיין נראה טוב.

---

# ‏123. Reconciliation Drift Rate

‏כמה פעמים local state אינו תואם broker state.

‏צריך להיות נמוך מאוד ומוסבר.

---

# ‏124. Orphan Order Rate

‏כל orphan הוא incident שדורש RCA.

---

# ‏125. Duplicate Prevention Metrics

‏גם prevented duplicate attempts שווים telemetry.

‏הם יכולים לחשוף race שמערכת safety הצליחה לעצור.

---

# ‏126. Near Misses

‏Near miss יכול להיות:

- ‏duplicate blocked milliseconds לפני submit.
- ‏stale signal rejected.
- ‏price cap prevented bad execution.
- ‏reconciliation found orphan before new entry.

‏לומדים גם ממה שכמעט קרה.

---

# ‏127. Execution RCA

‏RCA טוב מתחיל ב־timeline עובדתי.

‏לא ב־“כנראה הברוקר היה איטי”.

---

# ‏128. First Divergence

‏שואלים:

```text
What was the first point where reality diverged from the expected execution path?
```

‏זו נקודת RCA חזקה.

---

# ‏129. Failure Taxonomy

‏דוגמאות:

```text
EX_DUPLICATE_INTENT
EX_DUPLICATE_SUBMIT_BLOCKED
EX_UNKNOWN_EFFECT
EX_BROKER_REJECT
EX_STALE_SIGNAL
EX_PRICE_BOUND_FAILED
EX_CANCEL_FILL_RACE
EX_PARTIAL_FILL_ABORT
EX_ORPHAN_ORDER
EX_POSITION_MISMATCH
EX_RECONCILIATION_REQUIRED
EX_CAPABILITY_MISMATCH
EX_PENDING_EXPOSURE_LIMIT
EX_TIMEOUT_AMBIGUOUS
EX_REPLACE_PRIORITY_LOSS
EX_EXIT_DELAYED
```

---

# ‏130. Tests — Happy Path

‏בדיקה בסיסית:

```text
Intent
→ risk approve
→ submit
→ ACK
→ fill
→ position update
→ exit
→ flat
```

---

# ‏131. Tests — Duplicate Intent

‏אותו Intent מגיע פעמיים.

‏ציפייה:

```text
one business effect
```

---

# ‏132. Tests — Timeout after Broker Received Order

‏מדמים:

```text
broker accepted
ACK lost
```

‏אסור לשלוח duplicate blind.

---

# ‏133. Tests — Partial Fill then Cancel

‏דוגמה:

```text
100 requested
37 filled
cancel remaining
```

‏ה־Position חייב להיות 37, לא 0 ולא 100.

---

# ‏134. Tests — Fill during Cancel

‏מגיע Fill נוסף אחרי cancel request.

‏Quantity ו־risk חייבים להתעדכן נכון.

---

# ‏135. Tests — Replace Race

‏ה־old order עדיין potentially live בזמן new generation.

‏לא עוברים max exposure.

---

# ‏136. Tests — Duplicate Fill Callback

‏אותו execution event מגיע פעמיים.

‏Position לא מוכפל.

---

# ‏137. Tests — Out-of-Order Callbacks

‏Fill מגיע לפני ACK/status.

‏המערכת עדיין מגיעה ל־state נכון.

---

# ‏138. Tests — Restart with Working Order

‏Process מת בזמן Order חי.

‏אחרי restart הוא מזוהה ומקושר מחדש.

---

# ‏139. Tests — Restart with Unknown Fill

‏Order מולא בזמן שהמערכת הייתה למטה.

‏Reconciliation מגלה Position.

---

# ‏140. Tests — Orphan Order

‏Broker מחזיר Order שאין לו local Intent.

‏המערכת חוסמת new risk ומעלה incident.

---

# ‏141. Tests — Position Mismatch

‏Local=0, Broker=50.

‏לא חוזרים ל־SCANNING רגיל.

---

# ‏142. Tests — Disconnect during Entry

‏אין assumption שה־Order canceled.

---

# ‏143. Tests — Disconnect during Exit

‏עדיפות גבוהה ל־reconciliation ולהקטנת risk.

---

# ‏144. Tests — Broker Reject

‏Reject קבוע אינו retry loop.

---

# ‏145. Tests — Capability Missing

‏Requested semantic שאינו נתמך חייב להיכשל explicit או להשתמש fallback מאושר.

---

# ‏146. Tests — Stale Intent

‏Intent שפג TTL לפני submit לא נשלח.

---

# ‏147. Tests — Price Runs Away

‏Marketable limit cap מונע chase בלתי מוגבל.

---

# ‏148. Tests — Kill During Partial Fill

‏New entries נחסמים, remaining entry מטופל, וה־filled position מקבל exit/risk handling לפי policy.

---

# ‏149. Tests — Split Brain

‏שני executors לא מצליחים לייצר side effects חוקיים בו־זמנית.

---

# ‏150. Property Tests

‏Invariants שאפשר לבדוק אוטומטית:

```text
position = sum(authoritative executions)
filled_qty <= allowed_qty
no duplicate execution application
new entries forbidden when safety blocks them
unknown effect cannot silently become canceled
terminal state cannot regress without explicit correction event
```

---

# ‏151. Replay Tests

‏אותו sequence של broker/market events צריך להוביל לאותו canonical state.

---

# ‏152. Fault Injection

‏מזריקים:

- ‏Network delay.
- ‏Dropped ACK.
- ‏Duplicate event.
- ‏Out-of-order event.
- ‏Process crash.
- ‏DB write failure.
- ‏Broker disconnect.
- ‏Slow callback consumer.

---

# ‏153. Soak Testing

‏Execution Engine צריך לרוץ שעות עם mock/paper event stream בלי memory leaks, queue growth או drift.

---

# ‏154. Deterministic Core

‏ככל האפשר:

```text
Current State + Event
→ New State + Commands
```

‏זה מקל מאוד על testing/replay.

---

# ‏155. Side Effects at the Edge

‏Broker calls, persistence ו־clock I/O עדיף להפריד מה־pure transition logic.

---

# ‏156. `ExecutionReducer`

‏מודל אפשרי:

```text
ExecutionState Reduce(ExecutionState state, ExecutionEvent e)
```

‏כך כל callback הופך transition שניתן לבדוק.

---

# ‏157. Commands נפרדים מ־Events

```text
Command: CancelOrder
Event: CancelRequested
Event: CancelConfirmed
```

‏לא מערבבים רצון עם fact.

---

# ‏158. Idempotent Reducer

‏Event כפול לא צריך לשנות state פעמיים כאשר יש לו identity זהה.

---

# ‏159. Pure Business Invariants

‏Risk-critical invariants צריכים להיות בקוד דומיין, לא רק ב־UI או logs.

---

# ‏160. Observability by Construction

‏כל transition צריך לייצר telemetry עם stable IDs.

---

# ‏161. Correlation IDs

‏לפחות:

```text
RunId
DecisionId
IntentId
AttemptId
ClientOrderId
BrokerOrderId
ExecutionId
PositionId
```

---

# ‏162. Decision Explainability

‏לכל Submit צריך לדעת:

- ‏למה עכשיו.
- ‏למה quantity הזו.
- ‏למה order type הזה.
- ‏למה price הזה.
- ‏למה route/urgency הזה.

---

# ‏163. Execution Explainability

‏בדיעבד צריך לענות:

```text
Why did we get this fill?
Why did we reprice?
Why did we cancel?
Why did we miss the trade?
Why did we exit late?
```

---

# ‏164. `Execution Quality` אינו רק Fill Price

‏נמדוד:

```text
price quality
+ fill probability
+ timing
+ adverse selection
+ opportunity cost
+ fees
+ reliability
```

---

# ‏165. Counterfactuals בזהירות

‏“אם היינו שולחים Market היינו מרוויחים” אינו fact אלא model.

‏צריך לסמן confidence.

---

# ‏166. Passive-vs-Aggressive Challenger

‏אפשר להריץ shadow comparison בין policies.

‏אבל לא להסיק מה־filled samples בלבד.

---

# ‏167. Fill/No-Fill Selection Bias

‏Passive strategy נמדדת גם על missed opportunities, לא רק fills מוצלחים.

---

# ‏168. Execution Policy Drift

‏מה שעבד בתקופת spread צרה יכול להשתנות כאשר liquidity regime משתנה.

---

# ‏169. Broker Behavior Drift

‏Routing, simulated order behavior או API semantics יכולים להשתנות.

‏Capability/conformance tests חשובים.

---

# ‏170. Conformance Suite לברוקר

‏לכל Adapter נרצה בדיקות:

- ‏Submit.
- ‏Cancel.
- ‏Replace.
- ‏Partial fill.
- ‏Reconnect.
- ‏Duplicate callbacks.
- ‏Unsupported capability.
- ‏Order lookup.
- ‏Position reconciliation.

---

# ‏171. Raw Broker Payload Preservation

‏כאשר אפשר ובטוח מבחינת פרטיות/סודות, נשמור raw diagnostic payload לאירועים קריטיים.

‏הוא עוזר ב־RCA.

---

# ‏172. Secrets לא נכנסים ל־Logs

‏API keys, tokens ו־credentials לא צריכים להיות חלק מ־telemetry.

---

# ‏173. Manual Intervention

‏אם מפעיל אנושי משנה Order אצל הברוקר, המערכת צריכה לזהות divergence.

---

# ‏174. External Orders

‏צריך policy ל־Orders שלא נוצרו על ידי המערכת.

‏למשל:

```text
observe only
block automation
adopt explicitly
```

‏לא מניחים ownership.

---

# ‏175. External Position

‏אם יש Position ידנית באותו account/symbol, Strategy automation צריכה לדעת זאת.

---

# ‏176. One Account per Environment

‏ל־KISS ובטיחות, הפרדה בין research/paper/live accounts יכולה לצמצם ambiguity.

---

# ‏177. Execution Readiness

‏Ready אינו רק:

```text
socket connected = true
```

‏Ready דורש למשל:

- ‏Authenticated.
- ‏Correct account.
- ‏State reconciled.
- ‏No blocking unknown effects.
- ‏Risk engine ready.
- ‏Persistence healthy.
- ‏Market status known.

---

# ‏178. Readiness Reason Codes

‏אם לא Ready, צריך להסביר למה.

---

# ‏179. `NO TRADE` גם ברמת Execution

‏Strategy יכולה לבחור candidate, אבל Execution Engine יכול לומר:

```text
NO TRADE: stale signal
NO TRADE: pending exposure
NO TRADE: capability missing
NO TRADE: reconciliation required
NO TRADE: price protection failed
```

---

# ‏180. Execution Feasibility יכולה לשנות Rank

‏Candidate עם prediction מעט חלש יותר יכול להיות עדיף אם הוא executable הרבה יותר.

‏אבל separation בין prediction ל־execution score צריכה להישאר ברורה.

---

# ‏181. Ultra-Short Strategy — מה קריטי במיוחד

‏אצלנו:

- ‏Signal decay מהיר.
- ‏Round-trip cost משמעותי.
- ‏Missed opportunity משמעותי.
- ‏Late exit משמעותי.
- ‏Cancel/replace overhead יכול להיות גדול ביחס ל־holding time.

---

# ‏182. Baseline Execution Architecture לרובוט שלנו

```text
Strategy Decision
→ Intent
→ Risk Reservation
→ Pre-Submit Revalidation
→ Execution Policy
→ Broker Adapter
→ Event Journal
→ Broker Events
→ Canonical Execution State
→ Position Controller
→ Reconciliation
```

---

# ‏183. Baseline Entry Policy

‏בתחילת המחקר עדיף policy פשוטה, שקופה וקלה למדידה.

‏לדוגמה conceptual:

```text
protected aggressive entry
with hard price cap
and strict signal TTL
```

‏לא חובה שזו תהיה policy הסופית.

---

# ‏184. Baseline Exit Policy

‏Exit צריך להעדיף certainty ו־risk reduction כאשר ה־edge מת.

‏אבל גם כאן נשמר price protection בהתאם ל־market conditions ול־policy.

---

# ‏185. Avoid Cleverness Before Evidence

‏לא מתחילים עם:

- ‏5 סוגי pegging.
- ‏multi-venue custom routing.
- ‏complex parent/child algo.
- ‏dynamic queue prediction.

‏לפני שיש baseline אמין.

---

# ‏186. Build the Safety Model First

‏לפני advanced execution tactics:

1. ‏Idempotency.
2. ‏Unknown effect.
3. ‏Partial fills.
4. ‏Pending exposure.
5. ‏Reconciliation.
6. ‏Restart recovery.
7. ‏Kill integration.

---

# ‏187. Practitioner Secret — רוב הכשלים הקשים אינם ב־Happy Path

‏הם קורים בדיוק ב־boundaries:

```text
submit + timeout
cancel + fill
replace + reconnect
partial fill + kill
restart + orphan
```

‏לכן boundary tests חשובים יותר מעוד demo של order מוצלח.

---

# ‏188. Practitioner Secret — Timeout הוא Ambiguity, לא Failure

‏זה אחד ההבדלים הקריטיים בין מערכת toy למערכת execution אמיתית.

---

# ‏189. Practitioner Secret — `Pending Exposure` חשוב כמעט כמו Position

‏מערכת שלא סופרת potentially-live orders יכולה להכפיל risk בלי להבין זאת.

---

# ‏190. Practitioner Secret — “Cancel Successful” צריך Semantics מדויקים

‏צריך לדעת מה הברוקר באמת מאשר ומה עדיין יכול להגיע לאחר מכן.

---

# ‏191. Practitioner Secret — Fill טוב יכול להגיע ברגע רע

‏לכן Execution Engine מתחבר ישירות למדדי adverse selection של שלב 46.

---

# ‏192. Practitioner Secret — Queue Priority היא State כלכלי

‏Cancel/replace אינו רק API call.

‏הוא יכול לאפס נכס כלכלי: מקום בתור.

---

# ‏193. Practitioner Secret — Simplicity is Edge Protection

‏כל state נוסף מגדיל:

- ‏Race surface.
- ‏Recovery complexity.
- ‏Test matrix.
- ‏Operational uncertainty.

‏מורכבות צריכה להצדיק את עצמה ב־net execution improvement.

---

# ‏194. Practitioner Secret — Broker UI אינו Source of Architecture

‏מה שנראה “פשוט” ב־GUI יכול להסתיר כמה side effects ו־state transitions.

---

# ‏195. Practitioner Secret — Position הוא Result, לא Intention

‏לא משנה מה ניסינו לעשות.

‏מה שקובע risk הוא מה שבוצע בפועל ומה שעוד יכול להתבצע.

---

# ‏196. Practitioner Secret — Recovery Path הוא Production Path

‏מערכת אמיתית תגיע ל־reconnect/restart/partial-fill ambiguity.

‏זה לא edge case שניתן להשאיר לסוף.

---

# ‏197. Practitioner Secret — Execution Engine צריך להיות Boring

‏Strategy יכולה להיות יצירתית.

‏Execution Core צריך להיות:

```text
predictable
auditable
idempotent
conservative under uncertainty
```

---

# ‏198. Definition of Done ל־Execution Engine

‏לפני כסף אמיתי, לפחות:

- ‏כל Order מקושר ל־Intent.
- ‏Duplicate intent לא יוצר duplicate exposure.
- ‏Partial fills נכונים.
- ‏Cancel/fill race מטופל.
- ‏Unknown effect קיים במודל.
- ‏Pending exposure נכנס ל־Risk.
- ‏Restart recovery נבדק.
- ‏Reconciliation מוכח.
- ‏Orphan/mismatch חוסמים new risk.
- ‏Safety overrides Strategy.
- ‏Price/quantity bounds נבדקים.
- ‏Telemetry מאפשר reconstruction מלא.

---

# ‏199. Checklist קצר לפני Submit

```text
Is the intent still valid?
Is the signal fresh?
Is the market tradable?
Is risk reserved?
Is there conflicting live exposure?
Is the price protected?
Is the requested capability supported?
Is execution state reconciled?
```

‏אם אחת התשובות הקריטיות אינה ידועה — לא ממציאים תשובה.

---

# ‏200. Checklist קצר אחרי Submit

```text
Did we persist the attempt?
Do we know the broker identity?
Did we receive a definitive response?
Could the order still be live?
What is pending exposure now?
What fills have occurred?
What must happen next if the signal dies?
```

---

# ‏201. Checklist אחרי Fill

```text
Was the fill applied exactly once?
What is the actual position?
What remains live?
What is the average and per-fill price?
What is the markout?
Is the exit policy armed?
Is the strategy still allowed to add risk?
```

---

# ‏202. Checklist לפני Resume אחרי Incident

```text
Broker connected?
Correct account?
Open orders known?
Executions known?
Positions reconciled?
Unknown effects resolved?
Safety state cleared explicitly?
Epoch advanced if required?
```

---

# ‏203. מה לזכור בעל פה

‏אם צריך לזכור מעט:

1. ‏`Intent != Order`.
2. ‏`Sent != Accepted != Working != Filled`.
3. ‏Timeout יכול להיות `UNKNOWN_EFFECT`.
4. ‏`CancelRequested != Canceled`.
5. ‏Partial Fill הוא מצב רגיל.
6. ‏Risk כולל `Pending Exposure`.
7. ‏Broker reconciliation הוא חלק מה־runtime.
8. ‏Restart לא מאפס את המציאות אצל הברוקר.
9. ‏Side effects חייבים Idempotency ו־stable IDs.
10. ‏כאשר state לא ברור — לא יוצרים risk חדש.

---

# ‏204. התאמה לרובוט שלנו

‏לרובוט שסורק אלפי מניות ומנסה לתפוס מומנטום של מילישניות עד שניות:

- ‏ה־Scanner יכול להיות מהיר מאוד, אבל Entry לא נשלח אם execution state אינו Ready.
- ‏Intent ישא `signal_time`, ‏`signal_ttl` ו־hard price protection.
- ‏Pre-submit recheck יהיה חובה.
- ‏Pending exposure ימנע duplicate entries בזמן retry/reprice.
- ‏Order policy ראשונית תהיה פשוטה כדי שנוכל למדוד אמת.
- ‏Exit intent יקבל priority גבוהה מ־new entries.
- ‏`time_to_flat` יהיה metric ראשון במעלה.
- ‏כל fill יקבל markout כדי שנזהה adverse selection.
- ‏כל restart/reconnect יתחיל reconciliation לפני חזרה למסחר.
- ‏Advanced tactics יתווספו רק כאשר baseline מוכיח איפה בדיוק ה־execution מפסיד edge.

---

# ‏205. מעבר לשלב הבא

‏אחרי שבנינו Execution Engine אמין, אפשר לעבור לשכבה הבאה של Best Practices:

> ‏**שלב 52 — `Data Engineering Best Practices`: איך בונים pipeline של Market Data אמין, point-in-time correct, scalable, replayable וניתן לביקורת — בלי ש־data corruption שקט יהפוך ל־false alpha.**
