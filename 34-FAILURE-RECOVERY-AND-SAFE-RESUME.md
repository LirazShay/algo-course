# ‏שלב 34 — `Failure Recovery`: להתאושש מתקלה בלי לאבד שליטה על כסף אמיתי

> ‏מטרת הפרק: לבנות שיטת התאוששות מסודרת מ־`process crash`, ניתוק מהברוקר, outage ב־`Market Data`, ‏`network partition`, ‏`partial fill`, ‏`unknown order effect`, state מקומי חלקי או סותר, וכל מצב שבו המערכת כבר אינה יכולה להניח שהיא יודעת מה קורה.
>
> ‏העיקרון המרכזי: **אחרי תקלה לא “ממשיכים”. קודם מוכיחים מחדש מה מצב העולם.** מסלול ההתאוששות הוא `Detect → Contain → Reconcile → Rebuild → Validate → Resume`.
>
> ‏במערכת מסחר, התאוששות גרועה עלולה להיות מסוכנת יותר מהתקלה המקורית. תהליך שנפל הוא בעיה; תהליך שחזר והניח בטעות שאין Position פתוח — עלול להפוך לבעיה כספית אמיתית.

---

# ‏1. מהי בכלל `Failure Recovery`?

‏`Failure Recovery` היא היכולת של המערכת לעבור ממצב שבו אחד או יותר מה־assumptions שלה כבר אינם אמינים, אל מצב שבו היא שוב יודעת מספיק כדי לפעול בבטחה.

‏המילה החשובה היא **יודעת**.

‏לא:

```text
connection restored
```

‏אלא:

```text
connection restored
+ broker state reconciled
+ market data fresh
+ local state rebuilt
+ invariants verified
+ risk engine ready
+ resume explicitly allowed
```

---

# ‏2. למה Restart פשוט אינו Recovery

‏Restart רק מפעיל שוב process.

‏הוא לא עונה על השאלות:

- ‏האם נשלחה פקודה לפני הקריסה?
- ‏האם היא התקבלה אצל הברוקר?
- ‏האם היא התמלאה חלקית?
- ‏האם היא התמלאה אחרי שהprocess כבר מת?
- ‏האם יש Position פתוח?
- ‏האם קיימת פקודת Exit פעילה?
- ‏האם נשלחה אותה פקודה שוב אחרי ה־restart?
- ‏האם נתוני השוק שלנו עדיין טריים?

‏לכן:

> ‏`Process Restart != Trading Recovery`.

---

# ‏3. ששת שלבי ה־Recovery

```text
1. Detect
2. Contain
3. Reconcile
4. Rebuild
5. Validate
6. Resume
```

‏הסדר חשוב.

‏לא רצים ישירות מ־Detect ל־Resume.

---

# ‏4. `Detect`

‏ראשית צריך לזהות שהמערכת איבדה אמון באחד מה־domains שלה.

‏דוגמאות:

- ‏Broker heartbeat חסר.
- ‏Market-data freshness חורגת מהסף.
- ‏פער sequence.
- ‏local state checksum לא תקין.
- ‏broker order שאינו מוכר מקומית.
- ‏Position אצל הברוקר שאינו מופיע אצלנו.
- ‏timeout אחרי `placeOrder` בלי ACK.
- ‏clock skew חריג.
- ‏process restart.

---

# ‏5. `Contain`

‏Containment אומר לעצור את האפשרות להחמיר את הבעיה.

‏בדרך כלל:

```text
new entries = blocked
risk increasing actions = blocked
risk reducing actions = allowed when state is known enough
```

‏המערכת יכולה לעבור למשל ל־:

```text
DEGRADED
RECOVERING
EXIT_ONLY
PAUSED
FAULTED
```

---

# ‏6. למה `Fail Closed`

‏כאשר איננו יודעים אם פקודה קיימת, ברירת המחדל אינה לשלוח אחת נוספת.

‏כאשר איננו יודעים אם Position קיים, ברירת המחדל אינה לפתוח Position חדש.

‏זהו `Fail Closed`.

---

# ‏7. `Reconcile`

‏בשלב זה שואלים את מקורות האמת החיצוניים:

```text
What orders exist?
What executions occurred?
What positions exist?
What balances/exposure exist?
```

‏ב־Execution domain, הברוקר הוא מקור האמת.

---

# ‏8. `Rebuild`

‏אחרי reconciliation צריך לבנות מחדש את ה־state המקומי.

‏למשל:

```text
broker executions
    ↓
fill ledger
    ↓
position state
    ↓
trade lifecycle state
```

---

# ‏9. `Validate`

‏לפני Resume בודקים invariants.

‏למשל:

```text
local_position == broker_position
known_working_orders == broker_working_orders
no unresolved unknown-effect commands
market_data_fresh == true
risk_state_consistent == true
```

---

# ‏10. `Resume`

‏רק עכשיו אפשר לעבור ל־`READY`.

‏וגם אז לא בהכרח מיד למסחר מלא.

‏אפשר לבצע staged recovery:

```text
RECOVERING
→ EXIT_ONLY
→ READY_NO_ENTRY
→ READY
```

---

# ‏11. ה־Recovery צריך להיות State Machine

‏Recovery אינו function יחיד.

‏הוא lifecycle בפני עצמו.

```text
RECOVERY_DETECTED
    ↓
CONTAINING
    ↓
RECONCILING
    ↓
REBUILDING
    ↓
VALIDATING
    ↓
READY_TO_RESUME
```

‏אם משהו נכשל:

```text
RECOVERY_BLOCKED
```

---

# ‏12. `Recovery Reason`

‏כל recovery חייב לשמור reason מפורש.

‏לדוגמה:

```text
PROCESS_RESTART
BROKER_DISCONNECT
MARKET_DATA_STALE
NETWORK_PARTITION
UNKNOWN_ORDER_EFFECT
POSITION_MISMATCH
ORDER_MISMATCH
STATE_CORRUPTION
CLOCK_ANOMALY
```

---

# ‏13. Recovery context

‏יש לשמור:

```text
recovery_id
started_at
reason
previous_system_state
previous_trade_state
last_known_market_event
last_known_broker_event
open_intents
known_orders
known_fills
known_positions
```

---

# ‏14. `Process Crash`

‏נניח שהתהליך נופל בזמן:

```text
ENTRY_PENDING
```

‏ה־restart אינו יכול פשוט להחזיר:

```text
FLAT
```

‏צריך קודם לבדוק מה קרה אצל הברוקר.

---

# ‏15. Crash לפני שליחת order

‏זה המקרה הקל.

‏אם ה־intent persisted אך אין evidence שנשלחה פקודה:

```text
intent = exists
broker order = none
```

‏אפשר לבטל את ה־intent או להעריך מחדש.

‏אסור לשלוח אוטומטית signal ישן בלי בדיקה מחודשת.

---

# ‏16. Crash אחרי שליחה ולפני ACK

‏זה אחד המצבים המסוכנים ביותר.

```text
send order
process crashes
ACK not recorded
```

‏אנחנו לא יודעים אם הברוקר קיבל את הפקודה.

‏זהו:

```text
UNKNOWN_ORDER_EFFECT
```

---

# ‏17. אסור retry עיוור

‏Retry עיוור יכול ליצור duplicate order.

‏נדרשים:

- ‏`client_order_id` יציב.
- ‏idempotency כאשר הברוקר תומך.
- ‏reconciliation לפי identifiers.
- ‏חיפוש executions/working orders.

---

# ‏18. Crash אחרי ACK ולפני Fill

‏ב־restart צריך לגלות:

```text
order still working?
partially filled?
fully filled?
cancelled?
rejected?
```

‏אי אפשר להסיק מ־state המקומי.

---

# ‏19. Crash בזמן Partial Fill

‏לדוגמה:

```text
wanted = 100 shares
filled before crash = 40
```

‏בזמן שהprocess כבוי ייתכן שנוספו fills.

‏לכן `40` אינו בהכרח האמת אחרי restart.

---

# ‏20. Crash בזמן Exit

‏זה אפילו רגיש יותר.

‏המטרה הראשונה היא לברר:

```text
actual position quantity
actual open exit orders
```

‏לפני כל Exit נוסף.

---

# ‏21. Restart עם Position פתוח

‏Position פתוח אינו error.

‏המערכת צריכה לדעת לעלות לתוך מצב:

```text
RECOVERING + POSITION_OPEN
```

‏ואז לשחזר את ניהול ה־Exit.

---

# ‏22. Startup Recovery תמידי

‏גם אחרי shutdown “נקי” כדאי להתחיל ב־reconciliation.

‏למה?

‏כי ייתכן שהתרחש שינוי חיצוני:

- ‏Manual trade.
- ‏Broker-side cancellation.
- ‏Fill מאוחר.
- ‏Account adjustment.

---

# ‏23. `Graceful Shutdown`

‏Shutdown טוב:

```text
stop new entries
persist state
flush event log
cancel or preserve working orders per policy
record shutdown marker
```

‏אבל גם Graceful Shutdown אינו מבטל reconciliation ב־startup.

---

# ‏24. `Crash Marker`

‏אם process עולה בלי shutdown marker תקין, אפשר לסמן:

```text
unclean_shutdown = true
```

‏וזה יכול לדרוש recovery מחמיר יותר.

---

# ‏25. `Broker Disconnect`

‏Disconnect אינו בהכרח אומר שהפקודות נעצרו.

‏פקודות שכבר אצל הברוקר יכולות להמשיך להתמלא.

---

# ‏26. הבעיה המרכזית ב־Disconnect

‏יש פער בין:

```text
what broker may be doing
```

‏לבין:

```text
what our process can observe
```

‏זהו information gap.

---

# ‏27. Policy בזמן Broker Disconnect

‏ברוב המקרים:

```text
new entries = false
new risk = false
```

‏אבל ניהול risk קיים תלוי ביכולות שנותרו.

---

# ‏28. Native Broker Protection

‏אחת הסיבות להשתמש לעיתים בפקודות הגנה native אצל הברוקר היא שהן יכולות להמשיך להתקיים גם אם client נעלם.

‏אבל צריך להבין היטב את semantics של הברוקר וה־order type.

---

# ‏29. Client-Side Exit Risk

‏אם Exit קיים רק כ־logic בזיכרון המקומי:

```text
process dead → exit logic dead
```

‏זה operational risk.

---

# ‏30. `Reconnect != Recovered`

‏socket connected מחדש אינו מספיק.

‏אחרי reconnect:

```text
fetch orders
fetch executions
fetch positions
compare
rebuild
validate
```

---

# ‏31. Reconnect sequence

```text
CONNECTING
→ CONNECTED_UNVERIFIED
→ RECONCILING
→ VERIFIED
→ READY
```

‏כך נמנעים ממצב:

```text
connected = true
therefore trade = true
```

---

# ‏32. `Market Data Outage`

‏Market data יכול להיכשל בעוד הברוקר נשאר מחובר.

‏זו תקלה מסוג אחר.

---

# ‏33. Data stale while connected

‏connection alive אינה אומרת feed healthy.

‏לכן צריך למדוד:

```text
last_event_age
fresh_symbol_ratio
sequence_gap_count
update_rate
```

---

# ‏34. Whole-market outage

‏אם כל feed נעצר:

```text
new entries = blocked
```

‏לרוב זו החלטה ברורה.

---

# ‏35. Partial Market Data Outage

‏מסוכן יותר כאשר רק חלק מה־universe נעלם.

‏ה־Scanner עדיין יכול לייצר Rank #1 — אך על universe חלקי.

---

# ‏36. `Fresh Coverage Ratio`

‏לכן נשתמש למשל ב־:

```text
fresh_symbols / expected_symbols
```

‏ולא רק ב־“קיבלנו tick לאחרונה”.

---

# ‏37. Coverage Bias

‏אם symbols מסוימים נעלמו, הדירוג יכול להשתנות באופן מלאכותי.

‏לכן recovery של feed צריך לכלול גם universe integrity.

---

# ‏38. Re-subscription

‏אחרי reconnect ל־feed צריך לשחזר subscriptions.

‏אסור להניח שהserver זוכר אותן.

---

# ‏39. Subscription Registry

‏שמרו desired state:

```text
wanted subscriptions
```

‏בנפרד מ־observed state:

```text
active subscriptions
```

---

# ‏40. Desired vs Observed State

‏זה pattern חשוב בכל המערכת.

```text
Desired State
Observed State
Diff
Reconciliation Action
```

---

# ‏41. Data warm-up אחרי recovery

‏גם אחרי שהfeed חזר, Features מסוימים עדיין אינם מוכנים.

‏למשל:

```text
return_60s
trade_count_60s
volatility_30s
```

‏זקוקים לחלון היסטורי.

---

# ‏42. `WARMING_UP`

‏לכן אפשר מצב:

```text
MARKET_DATA_CONNECTED
but
FEATURE_ENGINE_WARMING_UP
```

---

# ‏43. Snapshot restore

‏אפשר לשחזר state מחלון persisted.

‏אבל רק אם:

- ‏ה־snapshot עקבי.
- ‏ידוע timestamp שלו.
- ‏ניתן להשלים ממנו את האירועים החסרים.

---

# ‏44. Snapshot + Event Replay

‏pattern נפוץ:

```text
load snapshot
replay events after snapshot
arrive at current state
```

---

# ‏45. Snapshot version

‏Snapshot חייב לכלול:

```text
schema_version
code_version
state_version
created_at
last_event_sequence
```

---

# ‏46. Snapshot compatibility

‏לא כל גרסת קוד יכולה לקרוא כל snapshot.

‏צריך migration או rejection מפורש.

---

# ‏47. `Network Partition`

‏Network partition שונה מ־disconnect פשוט.

‏ייתכן שכל צד עדיין “חי”, אך הם אינם יכולים לדבר.

---

# ‏48. Split Brain

‏אם שני instances חושבים שהם active trader, אפשר לקבל duplicate orders.

‏זה `split brain`.

---

# ‏49. Single Active Writer

‏לכן execution צריך בדרך כלל owner יחיד.

‏אפשר להשתמש ב־:

- ‏lease.
- ‏leadership lock.
- ‏fencing token.

---

# ‏50. למה lock רגיל אינו תמיד מספיק

‏instance שאיבד lease אך לא יודע שאיבד אותו עדיין עלול לפעול.

‏לכן `fencing token` יכול להיות חזק יותר.

---

# ‏51. Fencing Token

‏כל leader חדש מקבל generation גבוה יותר.

‏פעולות מ־generation ישן נדחות במקומות שתומכים בכך.

---

# ‏52. Broker side limitation

‏לא תמיד ניתן להעביר fencing token לברוקר.

‏לכן architecture פנימית עדיין חייבת למנוע multiple execution owners.

---

# ‏53. Heartbeat אינו consensus

‏heartbeat עוזר לזהות failure.

‏הוא לא מוכיח שאין שני writers.

---

# ‏54. `Unknown Order Effect`

‏זהו מצב שבו שלחנו command אבל לא יודעים אם השפיע.

‏דוגמאות:

```text
PlaceOrder timeout
CancelOrder timeout
ModifyOrder timeout
```

---

# ‏55. Unknown אינו Failed

‏הטעות המסוכנת:

```text
timeout == failure
```

‏Timeout רק אומר:

```text
we do not know
```

---

# ‏56. Unknown אינו Success

‏גם ההפך שגוי.

‏אין להניח שהפעולה בוצעה.

---

# ‏57. Unknown Resolution

‏הפתרון:

```text
query broker truth
match by stable identifiers
inspect fills/orders
resolve state
```

---

# ‏58. Unknown budget

‏אם unknown נשאר בלתי פתור מעבר לסף מסוים, אפשר להסלים:

```text
RECOVERING → EXIT_ONLY → FAULTED
```

‏לפי severity.

---

# ‏59. `Recovery Budget`

‏Recovery Budget הוא מגבלת זמן/ניסיונות לפני escalation.

‏למשל conceptually:

```text
reconnect attempts
reconciliation attempts
maximum unresolved time
```

‏אין מספר קסם אוניברסלי.

---

# ‏60. למה לא retry לנצח

‏Retry אינסופי יכול להסתיר outage ארוך ולהשאיר מערכת במצב ביניים מסוכן.

---

# ‏61. Retry with Backoff

‏ב־infrastructure requests אפשר להשתמש ב־:

```text
exponential backoff
jitter
maximum attempts
```

‏אבל לא על commands כספיים בלי idempotency/reconciliation.

---

# ‏62. Retry Taxonomy

‏נחלק פעולות ל־:

```text
SAFE_TO_RETRY
RETRY_WITH_IDEMPOTENCY
RECONCILE_BEFORE_RETRY
NEVER_AUTO_RETRY
```

---

# ‏63. Query מול Command

‏Query בדרך כלל בטוח יותר ל־retry.

‏Command עשוי לשנות state.

‏זו הבחנה בסיסית.

---

# ‏64. `Idempotency`

‏פעולה idempotent יכולה להתבצע כמה פעמים ולהביא לאותה תוצאה לוגית.

‏במסחר זה קריטי.

---

# ‏65. Application Idempotency

‏גם אם API חיצוני אינו idempotent, אפשר לשמור:

```text
intent_id
client_order_id
command_id
```

‏ולהגן מפני duplicate generation בצד שלנו.

---

# ‏66. Event Deduplication

‏גם callbacks יכולים להגיע שוב.

‏צריך dedupe לפי identifiers מתאימים.

---

# ‏67. Duplicate Fill Event

‏אם אותו fill נרשם פעמיים, Position מקומי עלול להכפיל את הכמות.

‏לכן Fill Ledger חייב להיות idempotent.

---

# ‏68. Out-of-order callbacks

‏Events עשויים להגיע לא לפי הסדר שציפינו.

‏ה־state machine צריכה להיות tolerant לכך במידה שה־API מאפשר.

---

# ‏69. Late Fill

‏Fill יכול להגיע אחרי cancel request.

‏לכן:

```text
cancel requested != cancelled
```

---

# ‏70. Cancel Confirmation

‏רק broker truth מאשר שהorder כבר אינו working.

---

# ‏71. Cancel/Fill Race

‏תסריט:

```text
cancel sent
fill happens
cancel ACK arrives
```

‏או וריאציה אחרת.

‏המערכת צריכה לתמוך בזה מפורשות.

---

# ‏72. Modify race

‏גם שינוי order יכול להתחרות עם fill.

‏יש למדל את ה־semantics של הברוקר הספציפי.

---

# ‏73. `Position Mismatch`

‏מצב שבו:

```text
local position != broker position
```

‏הוא recovery trigger.

---

# ‏74. Broker wins

‏לגבי quantity שבוצעה בפועל, broker truth גובר.

‏אבל צריך להבין למה נוצר הפער.

---

# ‏75. Position mismatch categories

```text
missing fill
manual trade
duplicate local event
late event
wrong account
mapping error
state corruption
```

---

# ‏76. `Order Mismatch`

‏למשל:

```text
local says working
broker says filled
```

‏או:

```text
broker has order unknown locally
```

---

# ‏77. Orphan Broker Order

‏Order שקיים אצל הברוקר אבל אין לו local intent מוכר.

‏אין למחוק אותו אוטומטית בלי policy.

---

# ‏78. Orphan Local Intent

‏Intent מקומי ללא order אצל הברוקר.

‏יכול להיות:

- ‏לא נשלח.
- ‏נשלח ונעלם מהquery scope.
- ‏נדחה.
- ‏מופה לא נכון.

---

# ‏79. Manual Intervention

‏משתמש יכול לשנות Position או Order ידנית.

‏המערכת צריכה לזהות זאת.

---

# ‏80. Manual action policy

‏אפשר לבחור:

```text
manual action triggers reconciliation
manual action transfers ownership
manual action pauses strategy
```

‏אבל המדיניות חייבת להיות מפורשת.

---

# ‏81. Ownership

‏כל Position צריך owner לוגי.

‏למשל:

```text
STRATEGY
MANUAL
RECOVERY
UNKNOWN
```

---

# ‏82. למה ownership חשוב

‏בלי ownership, robot יכול לנסות לסגור Position שהמשתמש פתח ידנית.

---

# ‏83. `State Corruption`

‏State מקומי יכול להיפגם בגלל:

- ‏write חלקי.
- ‏bug.
- ‏schema mismatch.
- ‏disk issue.
- ‏concurrent writers.

---

# ‏84. Append-only event log

‏Event log immutable יכול להקל על rebuild ו־audit.

---

# ‏85. Checksums

‏Snapshots ו־event batches יכולים לקבל checksum.

‏כך מזהים corruption מוקדם.

---

# ‏86. Durable Write Before Side Effect

‏Pattern חשוב:

```text
persist intent
then perform external side effect
```

‏אך גם הוא דורש reconciliation בגלל crash ביניהם.

---

# ‏87. Side Effect Before Durable Write

‏מסוכן יותר:

```text
send order
then persist
```

‏כי crash באמצע יכול להשאיר order שאין לו trace מקומי.

---

# ‏88. Outbox Pattern

‏אפשר לשמור command ב־durable outbox לפני שליחה.

‏worker שולח אותו ומעדכן status.

---

# ‏89. Outbox אינו קסם

‏גם עם outbox עדיין צריך idempotency כי worker יכול לקרוס אחרי השליחה ולפני marking sent.

---

# ‏90. Inbox Pattern

‏Broker events יכולים לעבור durable inbox לפני processing.

‏כך קל יותר לבצע dedupe ו־replay.

---

# ‏91. Event Journal

‏כל אירוע recovery משמעותי צריך להישמר:

```text
recovery_id
event_type
source
timestamp
payload_hash
result
```

---

# ‏92. Recovery Timeline

‏ב־RCA נרצה לראות:

```text
14:31:02.100 last market tick
14:31:02.240 order sent
14:31:02.300 broker disconnect
14:31:03.010 process enters RECOVERING
14:31:05.420 reconnect
14:31:05.610 fill discovered
14:31:05.900 position rebuilt
```

---

# ‏93. Time matters

‏במערכת של שניות, recovery של 20 שניות יכול לשנות לחלוטין את outcome.

‏לכן recovery latency הוא metric עסקי, לא רק operational metric.

---

# ‏94. `Recovery Time Objective`

‏`RTO` מתאר כמה זמן recovery יכול לקחת מבחינת היעד שלנו.

‏אבל במערכת מסחר צריך גם להבין מה עושים בזמן הזה עם risk קיים.

---

# ‏95. `Recovery Point Objective`

‏`RPO` מתאר כמה state מותר לאבד.

‏ב־orders/fills השאיפה היא למעשה שלא נאבד את היכולת לשחזר שום event מהותי.

---

# ‏96. Recovery Correctness > Recovery Speed

‏חזרה מהירה למסחר כשהstate שגוי גרועה יותר מהשבתה מעט ארוכה יותר.

---

# ‏97. אבל מהירות עדיין חשובה

‏אם יש Position פתוח, recovery איטי מגדיל market risk.

‏לכן יש tension בין correctness לבין latency.

---

# ‏98. Risk-reducing fast path

‏אפשר לתכנן recovery שמאפשר קודם פעולות risk-reducing לאחר מינימום reconciliation בטוח.

‏ורק אחר כך מחזיר entries.

---

# ‏99. `EXIT_ONLY` כ־Recovery Tool

‏זהו מצב שימושי במיוחד.

```text
new entry = forbidden
increase exposure = forbidden
reduce/close exposure = allowed
```

---

# ‏100. `NO_NEW_RISK`

‏אפשר להגדיר capability מפורש במקום state בודד.

‏למשל:

```text
CAN_ENTER = false
CAN_EXIT = true
CAN_CANCEL = true
CAN_MODIFY_EXIT = true
```

---

# ‏101. Capability-based recovery

‏זה מאפשר התאוששות הדרגתית.

‏לא הכול חייב לעבור בבת אחת מ־OFF ל־ON.

---

# ‏102. Recovery Gate — Broker

‏לפני Entry חדש:

```text
broker_connected
broker_reconciled
no_unknown_orders
positions_verified
```

---

# ‏103. Recovery Gate — Data

```text
feed_connected
freshness_ok
coverage_ok
sequence_integrity_ok
features_warmed_up
```

---

# ‏104. Recovery Gate — Risk

```text
exposure_known
pending_exposure_known
limits_loaded
daily_loss_state_restored
kill_switch_state_restored
```

---

# ‏105. Recovery Gate — Strategy

```text
strategy_version_known
config_version_known
feature_version_known
state restored
```

---

# ‏106. Recovery Gate — Clock

```text
clock_sync_ok
timezone/session_state_known
```

---

# ‏107. Recovery Gate — Universe

‏Whole-market scanner צריך גם:

```text
expected universe known
fresh universe coverage acceptable
symbol mapping verified
```

---

# ‏108. `Safe Resume Contract`

‏אפשר להגדיר contract:

```text
resume allowed only if all required capabilities are VERIFIED
```

---

# ‏109. Resume is an explicit event

‏אל תתנו למערכת “להחליק” ל־READY כי checks במקרה נהיו ירוקים.

‏צרו event מפורש:

```text
RECOVERY_VALIDATED
```

---

# ‏110. Auto Resume מול Manual Resume

‏יש failures שמתאימים ל־auto resume.

‏אחרים דורשים אישור אנושי.

---

# ‏111. Auto Resume candidates

‏למשל:

- ‏קצר.
- ‏סיבה ברורה.
- ‏reconciliation מלא.
- ‏אין unknowns.
- ‏לא היה state corruption.

---

# ‏112. Manual Resume candidates

‏למשל:

- ‏Position mismatch לא מוסבר.
- ‏unknown broker order.
- ‏data corruption.
- ‏split brain suspicion.
- ‏repeated recovery failures.

---

# ‏113. Escalation Policy

```text
retry
→ degraded
→ exit-only
→ manual intervention
→ faulted
```

‏המסלול תלוי severity.

---

# ‏114. Severity Levels

‏לדוגמה:

```text
INFO
DEGRADED
HIGH_RISK
CRITICAL
```

---

# ‏115. Severity לפי impact

‏לא לפי כמה scary נראה ה־exception.

‏אלא לפי:

- ‏האם state ידוע.
- ‏האם יש Position פתוח.
- ‏האם orders עובדים.
- ‏האם ניתן להפחית risk.

---

# ‏116. `Recovery Loop`

‏Recovery עצמו צריך למנוע busy loop.

‏יש לנהל:

```text
attempt number
last attempt time
next retry time
last error
```

---

# ‏117. Recovery storms

‏כאשר dependency עולה ונופלת במהירות, המערכת עלולה להיכנס שוב ושוב ל־recovery.

‏זה נקרא operational flapping.

---

# ‏118. Hysteresis

‏אפשר לדרוש תקופת יציבות לפני Resume.

‏לא מספר קסם; מודדים empirically.

---

# ‏119. Circuit Breaker

‏אם dependency נכשל שוב ושוב:

```text
OPEN circuit
```

‏ומפסיקים להכות בו בבקשות.

---

# ‏120. Bulkhead

‏תקלה ב־Market Data ingestion לא צריכה להפיל persistence של broker fills.

‏הפרדת resources מגבילה blast radius.

---

# ‏121. Blast Radius

‏שאלה חשובה:

> ‏אם רכיב אחד מת, כמה מהמערכת מת איתו?

---

# ‏122. Dependency Graph

‏מומלץ לתעד dependencies:

```text
Strategy
  → Feature Engine
  → Market Data

Execution
  → Risk
  → Broker
  → Durable Store
```

---

# ‏123. Recovery Dependency Order

‏לא כל רכיב צריך לחזור באותו סדר.

‏למשל execution reconciliation עשוי להיות דחוף יותר מחידוש Scanner מלא כאשר יש Position פתוח.

---

# ‏124. Position-first recovery

‏אם exposure קיים:

```text
broker truth
→ position truth
→ exit protection
→ market-data readiness
→ scanner readiness
```

---

# ‏125. Flat-account recovery

‏אם account flat ואין working orders, אפשר לבצע recovery רגוע יותר.

---

# ‏126. Recovery Path לפי Context

‏לכן recovery אינו תמיד sequence יחיד.

‏הוא decision tree לפי exposure ו־unknowns.

---

# ‏127. Recovery Decision Matrix

| ‏Exposure | ‏Orders | ‏Data | ‏Action |
|---|---|---|---|
| ‏Flat | ‏None | ‏Bad | ‏Block entries, repair data |
| ‏Open | ‏Known | ‏Bad | ‏Protect/exit per policy, no entries |
| ‏Unknown | ‏Unknown | ‏Good | ‏Reconcile broker first |
| ‏Open | ‏Unknown | ‏Unknown | ‏Critical recovery / manual escalation |

---

# ‏128. `Incident ID`

‏כל recovery משמעותי יקבל `incident_id`.

‏כך אפשר לקשר:

```text
logs
orders
fills
alerts
replay
RCA
```

---

# ‏129. Recovery Runbook

‏Runbook הוא הוראות קבועות למקרה תקלה.

‏הוא צריך להיות executable ככל האפשר.

---

# ‏130. Runbook — Broker Disconnect

```text
1. Block new risk
2. Mark broker unverified
3. Reconnect
4. Fetch orders/executions/positions
5. Reconcile
6. Validate invariants
7. Restore capabilities gradually
```

---

# ‏131. Runbook — Market Data Outage

```text
1. Block entries
2. Keep broker reconciliation alive
3. Recover subscriptions
4. Validate fresh coverage
5. Warm features
6. Re-enable scanner
```

---

# ‏132. Runbook — Process Crash

```text
1. Start in RECOVERING
2. Load durable state
3. Reconcile broker
4. Rebuild lifecycle state
5. Restore market data
6. Warm features
7. Validate risk state
8. Resume explicitly
```

---

# ‏133. Runbook — Unknown Order Effect

```text
1. Do not retry blindly
2. Query broker
3. Match client/broker IDs
4. Inspect executions
5. Resolve order state
6. Only then choose next action
```

---

# ‏134. Runbook — Position Mismatch

```text
1. Freeze new entries
2. Accept broker quantity as execution truth
3. Rebuild fills if possible
4. Identify mismatch cause
5. Restore protection
6. Escalate if ownership unclear
```

---

# ‏135. Runbook — Storage Failure

‏אם durable store אינו אמין:

```text
no new risk
```

‏כי גם אם הברוקר עובד, אנחנו עלולים לאבד audit/idempotency/recovery state.

---

# ‏136. Recovery Logging

‏אל תכתבו רק:

```text
Reconnect failed
```

‏כתבו context:

```text
recovery_id
attempt
component
previous_state
current_state
reason
next_action
```

---

# ‏137. Structured Logs

‏Recovery הוא מקום שבו logs מובנים שווים הרבה יותר מטקסט חופשי.

---

# ‏138. Recovery Metrics

‏נמדוד למשל:

```text
recovery_count
recovery_duration
reconciliation_duration
unknown_state_duration
auto_resume_count
manual_resume_count
failed_recovery_count
```

---

# ‏139. Trading-specific metrics

```text
open_exposure_during_recovery
unprotected_position_duration
missed_entries_due_to_recovery
recovery_slippage
```

---

# ‏140. `Unprotected Position Duration`

‏Metric חשוב במיוחד.

‏כמה זמן הייתה Position קיימת בלי מנגנון Exit/Protection תקין?

---

# ‏141. Recovery Slippage

‏הפער בין Exit שהיה צפוי ללא failure לבין Exit בפועל בעקבות recovery.

---

# ‏142. Opportunity Cost

‏Recovery יכול לגרום גם להחמצת עסקאות.

‏נמדוד בנפרד מ־loss risk.

---

# ‏143. Recovery Attribution

‏לא כל loss בזמן recovery נגרם מה־recovery.

‏צריך counterfactual זהיר.

---

# ‏144. Recovery Dashboard

‏מומלץ להציג:

- ‏Current system state.
- ‏Current recovery phase.
- ‏Open exposure.
- ‏Unknown orders.
- ‏Last broker reconciliation.
- ‏Market-data freshness.
- ‏Fresh coverage.
- ‏Recovery blockers.

---

# ‏145. Recovery Blocker

‏במקום רק:

```text
not ready
```

‏הצג:

```text
BROKER_POSITION_NOT_VERIFIED
MARKET_DATA_WARMUP_INCOMPLETE
UNKNOWN_ORDER_EFFECT_UNRESOLVED
```

---

# ‏146. Observability before automation

‏לפני auto-recovery מורכב, ודאו שאתם יכולים לראות מה הוא עושה.

---

# ‏147. Recovery must be replayable

‏Incident אמיתי צריך להיות ניתן לשחזור ב־Replay ככל האפשר.

---

# ‏148. Incident Capture

‏שמרו חלון events לפני ואחרי failure.

‏למשל:

```text
market events
broker events
commands
state transitions
logs
```

---

# ‏149. Deterministic Recovery Tests

‏אותו incident replay צריך להוביל לאותו recovery outcome כאשר הגרסה זהה.

---

# ‏150. Fault Injection

‏אסור לחכות ל־production כדי לבדוק failures.

‏מזריקים אותם בכוונה.

---

# ‏151. Inject broker disconnect

‏בזמן:

- ‏Flat.
- ‏Entry pending.
- ‏Partial fill.
- ‏Position open.
- ‏Exit pending.

---

# ‏152. Inject market-data outage

‏בזמן:

- ‏Scanner idle.
- ‏Top candidate selected.
- ‏Order pending.
- ‏Position open.

---

# ‏153. Inject process kill

‏הרוג process בדיוק:

```text
before persist
between persist and send
after send before ACK
after ACK before fill
after partial fill
while exiting
```

---

# ‏154. Inject duplicate events

‏שלחו אותו Fill callback פעמיים.

‏Position חייב להישאר נכון.

---

# ‏155. Inject out-of-order events

‏בדקו שהמערכת אינה נשברת אם callbacks מגיעים בסדר שונה.

---

# ‏156. Inject storage latency

‏Persistence איטי עלול לשנות ordering ותזמון.

---

# ‏157. Inject clock jump

‏בדקו שהמערכת אינה מקבלת החלטות שגויות אם wall clock משתנה.

---

# ‏158. Monotonic Clock

‏ל־durations השתמשו ככל האפשר ב־monotonic clock.

‏Wall clock מתאים ל־timestamps עסקיים, לא למדידת elapsed time פנימית.

---

# ‏159. Inject network asymmetry

‏אפשר לקבל events אך להיכשל בשליחת commands, או להפך.

‏אל תניחו failure סימטרי.

---

# ‏160. Inject stale but plausible data

‏אחת התקלות המסוכנות: נתונים שנראים תקינים אך הפסיקו להתעדכן.

---

# ‏161. Inject partial universe loss

‏הורידו 20% מהsymbols ובדקו שה־Scanner אינו ממשיך כאילו universe מלא.

---

# ‏162. Inject broker/manual trade

‏שנו Position מחוץ לרובוט ובדקו שהreconciliation מזהה.

---

# ‏163. Inject unknown order

‏צרו broker order שהמערכת לא מכירה.

‏ודאו שאין auto-cancel מסוכן בלי policy.

---

# ‏164. Golden Recovery Scenarios

‏קבוצה קטנה של incidents חייבת להיות חלק מה־CI.

---

# ‏165. Property: no duplicate risk

‏גם אחרי retries/restarts:

```text
same intent must not create unintended duplicate exposure
```

---

# ‏166. Property: broker quantity converges

‏לאחר reconciliation:

```text
local position == broker position
```

---

# ‏167. Property: future entries blocked during unknown

‏אם order effect בלתי ידוע:

```text
CAN_ENTER == false
```

---

# ‏168. Property: exit remains possible when safe

‏אם state מספיק ידוע להפחתת risk, recovery לא צריך לחסום Exit רק כי Scanner עדיין לא חזר.

---

# ‏169. Property: state survives restart

‏Restart לא צריך להפוך Position פתוח ל־Flat.

---

# ‏170. Property: no READY before reconciliation

‏חוק קשיח:

```text
READY requires successful reconciliation
```

---

# ‏171. Property: no silent state repair

‏אם התגלתה סתירה, היא נרשמת.

‏לא “מתקנים” בלי trace.

---

# ‏172. Recovery Test Matrix

| ‏Failure | ‏Flat | ‏Entry | ‏Open | ‏Exit |
|---|---:|---:|---:|---:|
| ‏Process crash | ✓ | ✓ | ✓ | ✓ |
| ‏Broker disconnect | ✓ | ✓ | ✓ | ✓ |
| ‏Data outage | ✓ | ✓ | ✓ | ✓ |
| ‏Storage failure | ✓ | ✓ | ✓ | ✓ |
| ‏Duplicate event | ✓ | ✓ | ✓ | ✓ |
| ‏Unknown effect |  | ✓ |  | ✓ |

---

# ‏173. Recovery in `Replay`

‏Replay צריך להיות מסוגל להזריק failure events.

‏כך בודקים את אותו incident שוב ושוב.

---

# ‏174. Recovery in `Paper`

‏Paper מאפשר לבדוק broker semantics בלי כסף אמיתי.

‏אבל אינו מוכיח שכל failure behavior זהה ל־Live.

---

# ‏175. Recovery in `Shadow`

‏Shadow מתאים במיוחד ל־Market Data ו־state rebuild paths.

---

# ‏176. Small Live Validation

‏גם אחרי Paper, failures נדירים יכולים להתנהג אחרת ב־Live.

‏לכן promotion הדרגתי חשוב.

---

# ‏177. Recovery Config

‏הגדירו במפורש:

```text
retry policy
reconnect policy
auto resume policy
manual approval policy
warmup policy
staleness thresholds
```

---

# ‏178. Versioned Recovery Policy

‏Recovery behavior הוא חלק מהאסטרטגיה התפעולית.

‏צריך versioning.

---

# ‏179. Config change during recovery

‏אל תאפשרו config להשתנות באמצע recovery בלי trace.

---

# ‏180. Deployment during open exposure

‏Deployment הוא failure-like transition.

‏צריך policy:

```text
block deploy
or
handoff state safely
```

---

# ‏181. Blue/Green danger

‏שני instances יכולים בטעות לשלוח orders.

‏לכן execution ownership קריטי בזמן deployment.

---

# ‏182. Rolling restart danger

‏אותו עיקרון.

‏Availability גבוהה אינה מועילה אם היא יוצרת duplicate writer.

---

# ‏183. Recovery and secrets

‏אם credentials אינם זמינים אחרי restart, recovery עלול להיתקע.

‏צריך startup validation בלי להדפיס secrets.

---

# ‏184. Recovery and permissions

‏Connection מוצלח אינו מוכיח שיש permission למסחר/market data.

‏Capability validation נדרש.

---

# ‏185. Recovery and account selection

‏אחרי reconnect יש לוודא שנבחר account הנכון.

‏זה invariant.

---

# ‏186. Recovery and environment

‏אסור ש־Paper restart יתחבר בטעות ל־Live או להפך.

‏Environment guard קשיח.

---

# ‏187. Recovery Environment Fingerprint

‏למשל:

```text
environment
account_id_hash
broker_endpoint
strategy_version
config_version
```

---

# ‏188. Recovery after code upgrade

‏אם code version השתנה, state migration צריך להיות מפורש.

---

# ‏189. Schema migration

‏Event/Snapshot schema migration צריכה להיות backward-aware.

---

# ‏190. Migration failure

‏אם migration אינה בטוחה:

```text
FAULTED
```

‏עדיף על state שגוי.

---

# ‏191. Recovery and Feature State

‏Feature engine מחזיק rolling windows.

‏הם state עסקי, לא cache חסר משמעות.

---

# ‏192. Rebuild Feature Windows

‏אפשר מ־:

- ‏Persisted rolling state.
- ‏Historical replay.
- ‏Fresh warm-up.

---

# ‏193. Feature warm-up policy

‏אל תשתמשו feature לפני שהוא valid.

‏שמרו:

```text
is_warmed_up
sample_count
oldest_source_time
```

---

# ‏194. Ranking after partial rebuild

‏Whole-market Rank אינו תקף אם חלק גדול מה־universe עדיין לא rebuilt.

---

# ‏195. Recovery and Candidate Persistence

‏Candidate שהיה #1 לפני outage אינו בהכרח רלוונטי אחרי recovery.

‏Signal TTL חל גם כאן.

---

# ‏196. Never resurrect stale intent

‏Intent ישן לא צריך להישלח אוטומטית אחרי recovery.

‏צריך pre-trade revalidation.

---

# ‏197. Recovery and Signal Decay

‏במערכת של שניות, אפילו recovery קצר יכול להרוג signal.

---

# ‏198. Recovery Entry Rule

```text
old signal ≠ new permission to enter
```

---

# ‏199. Recovery and Exit

‏Exit logic שונה: Position קיימת עדיין דורשת ניהול גם אם signal המקורי מת.

---

# ‏200. Entry state is disposable; exposure is not

‏זה כלל שימושי.

‏Signal אפשר לוותר עליו.

‏Position קיימת חייבים לנהל.

---

# ‏201. Recovery Priority Queue

‏סדר עדיפויות אפשרי:

```text
1. Know exposure
2. Protect exposure
3. Resolve unknown orders
4. Restore broker truth
5. Restore market truth
6. Restore scanner
7. Allow new entries
```

---

# ‏202. No heroics

‏Recovery logic צריך להיות פשוט ככל האפשר.

‏ככל שהוא מורכב יותר, קשה יותר להוכיח שהוא נכון בזמן failure אמיתי.

---

# ‏203. KISS Recovery

‏עדיף:

```text
block → reconcile → verify → resume
```

‏על פני עשרות heuristics אוטומטיים.

---

# ‏204. Recovery knowledge hierarchy

‏בכל רגע סווגו state כ־:

```text
KNOWN
INFERRED
UNKNOWN
```

---

# ‏205. `KNOWN`

‏נתמך ב־source of truth עדכני.

---

# ‏206. `INFERRED`

‏נגזר מstate קודם אך לא אומת מחדש.

---

# ‏207. `UNKNOWN`

‏אין מספיק evidence.

‏אסור להפוך אותו ל־KNOWN רק כי “כנראה”.

---

# ‏208. Evidence timestamp

‏כל fact חשוב צריך timestamp.

‏לדוגמה:

```text
position_verified_at
orders_verified_at
market_data_verified_at
```

---

# ‏209. Knowledge TTL

‏גם fact שהיה KNOWN יכול להתיישן.

‏במערכת מהירה, truth ישן הוא כמעט unknown.

---

# ‏210. Recovery confidence

‏אפשר לחשוב על confidence תפעולי, אבל לא כדאי להחליף invariants קשיחים ב־score עמום.

---

# ‏211. Hard gates first

‏לדוגמה:

```text
position verified? yes/no
unknown orders? yes/no
feed fresh? yes/no
```

---

# ‏212. Soft health second

‏אחר כך metrics כמו degraded latency.

---

# ‏213. Recovery RCA

‏אחרי כל incident משמעותי שאלו:

```text
What failed?
Why did containment trigger?
Was state ever unknown?
How long?
Did exposure exist?
Did recovery behave as designed?
What prevented faster safe recovery?
```

---

# ‏214. Near Misses

‏גם אם לא נגרם הפסד, incident שבו duplicate order כמעט נשלח הוא חשוב.

---

# ‏215. Recovery Failure Taxonomy

```text
DETECTION_LATE
CONTAINMENT_FAILED
RECONCILIATION_FAILED
STATE_REBUILD_FAILED
VALIDATION_FAILED
RESUME_TOO_EARLY
RESUME_TOO_LATE
MANUAL_PROCESS_FAILED
```

---

# ‏216. Recovery SLOs

‏אפשר להגדיר יעדים תפעוליים:

- ‏זמן לזיהוי.
- ‏זמן containment.
- ‏זמן reconciliation.
- ‏זמן עד exit protection.
- ‏זמן safe resume.

---

# ‏217. SLO by exposure state

‏כאשר Position פתוחה, יעדי recovery מחמירים יותר.

---

# ‏218. Alert fatigue

‏לא כל reconnect קצר צריך להעיר אדם.

‏אבל unknown financial state כן.

---

# ‏219. Alert severity by unknown financial state

‏זה heuristic טוב יותר מסתם exception count.

---

# ‏220. Human-in-the-loop

‏למערכת צריך להיות מסך/operator view שמאפשר להבין:

```text
what happened
what is known
what is unknown
what is blocked
what action is safe
```

---

# ‏221. Manual commands

‏פקודות operator צריכות גם הן להיות auditable ו־idempotent ככל האפשר.

---

# ‏222. Manual `RESUME`

‏לאפשר רק אם recovery validation עבר.

‏לא ככפתור שעוקף checks.

---

# ‏223. Manual `FLATTEN`

‏פעולת emergency חשובה, אך גם היא צריכה לדעת actual position ולמנוע duplicate exits.

---

# ‏224. Manual `CANCEL_ALL`

‏יש להבין scope:

- ‏רק strategy orders?
- ‏כל orders בחשבון?

‏אסור להשאיר עמימות.

---

# ‏225. Recovery Permissions

‏מי רשאי:

```text
resume
flatten
cancel
switch exit-only
```

‏זה חלק מ־operations/security.

---

# ‏226. Recovery Audit

‏כל manual action נרשמת עם:

```text
actor
action
time
reason
result
```

---

# ‏227. Recovery and Backtest

‏Backtest רגיל כמעט תמיד מניח infrastructure מושלם.

‏זה בסדר למחקר signal, אבל לא ל־production readiness.

---

# ‏228. Recovery and Execution Replay

‏Execution Replay צריך לכלול failure scenarios נבחרים.

---

# ‏229. Recovery Cost

‏Failures מוסיפים cost אמיתי:

```text
missed opportunities
worse exits
extra spread/slippage
manual intervention
lost uptime
```

---

# ‏230. Operational Alpha Leakage

‏אסטרטגיה עם predictive edge יכולה לאבד אותו בגלל recovery גרוע.

---

# ‏231. Edge budget includes resilience

‏אם edge קטן ומהיר, reliability/latency הם חלק מהכלכלה של האסטרטגיה.

---

# ‏232. Recovery frequency matters

‏Recovery מושלם אך שמתרחש 20 פעמים ביום עדיין מצביע על מערכת לא בריאה.

---

# ‏233. Root cause vs symptom

‏Reconnect הוא טיפול בסימפטום.

‏צריך להבין למה disconnects קורים.

---

# ‏234. Recurring incident detection

‏Cluster incidents לפי:

```text
component
reason
time of day
provider
version
```

---

# ‏235. Recovery Regression

‏אחרי fix, אותו incident צריך להיכנס ל־test suite.

---

# ‏236. Chaos Testing

‏בהמשך אפשר לבצע chaos experiments מבוקרים.

‏אבל רק בסביבות בטוחות וללא כסף אמיתי.

---

# ‏237. Do not chaos-test live money

‏Production resilience אינה הצדקה לייצר בכוונה סיכון פיננסי אמיתי.

---

# ‏238. Recovery maturity levels

```text
L0 — manual restart
L1 — restart + reconciliation
L2 — automated containment
L3 — deterministic recovery
L4 — fault-injected verified recovery
```

---

# ‏239. רובוט אישי לא צריך מערכת של בנק

‏אין צורך לבנות distributed consensus מורכב אם process יחיד מספיק.

‏אבל invariants של כסף אמיתי עדיין חייבים להיות חזקים.

---

# ‏240. KISS baseline לרובוט שלך

‏Baseline סביר:

```text
Single execution process
Durable local state
Append-only broker/decision journal
Stable client_order_id
Startup reconciliation
Broker reconnect reconciliation
Market-data freshness gate
Whole-market coverage gate
No auto entry during recovery
EXIT_ONLY fallback
Explicit resume
```

---

# ‏241. Baseline restart flow

```text
START
↓
RECOVERING
↓
load durable state
↓
connect broker
↓
fetch orders/fills/positions
↓
reconcile
↓
connect data provider
↓
restore subscriptions
↓
warm features
↓
verify coverage
↓
validate invariants
↓
READY
```

---

# ‏242. Baseline broker-disconnect flow

```text
BROKER_DISCONNECTED
↓
block entries
↓
mark broker truth stale
↓
reconnect
↓
reconcile
↓
resolve unknowns
↓
restore broker capability
```

---

# ‏243. Baseline data-outage flow

```text
DATA_DEGRADED
↓
block entries
↓
keep broker management alive
↓
restore feed
↓
validate coverage
↓
warm features
↓
resume scanner
```

---

# ‏244. Baseline unknown-order flow

```text
UNKNOWN_ORDER_EFFECT
↓
freeze new entries
↓
query broker truth
↓
match IDs
↓
resolve fill/order state
↓
rebuild exposure
↓
continue only when known
```

---

# ‏245. Baseline open-position recovery

```text
position exists
↓
verify exact quantity
↓
verify working exits
↓
restore protection
↓
only then rebuild scanner
```

---

# ‏246. מה לא לעשות — Anti-patterns

‏אל:

- ‏להפוך `connected=true` ל־`READY`.
- ‏לשלוח retry אוטומטי ל־`placeOrder` אחרי timeout.
- ‏להניח ש־local Position הוא truth אחרי crash.
- ‏להחזיר Scanner לפני שה־universe שוב מלא מספיק.
- ‏להחיות signal ישן אוטומטית.
- ‏להתעלם מ־manual trades.
- ‏למחוק broker order לא מוכר בלי policy.
- ‏לאפשר שני execution writers.
- ‏לשמור recovery רק בלוג טקסט לא מובנה.
- ‏לבדוק recovery לראשונה בכסף אמיתי.

---

# ‏247. Checklist — Restart

- ‏האם עלינו ל־`RECOVERING` ולא ל־`READY`?
- ‏האם durable state נטען?
- ‏האם broker state אומת?
- ‏האם כל unknown effect נפתר?
- ‏האם Position תואמת לברוקר?
- ‏האם working orders תואמים?
- ‏האם feed טרי?
- ‏האם whole-market coverage תקין?
- ‏האם rolling features warmed up?
- ‏האם Risk Engine restored?
- ‏האם Resume היה מפורש?

---

# ‏248. Checklist — Broker Failure

- ‏נחסמו Entries?
- ‏האם Position קיימת?
- ‏האם קיימים broker-native exits?
- ‏האם commands אחרונים נמצאים ב־unknown state?
- ‏האם reconnect הוביל ל־reconciliation?
- ‏האם fills שהגיעו בזמן הניתוק נרשמו?
- ‏האם order state converged?

---

# ‏249. Checklist — Data Failure

- ‏האם stale feed זוהה?
- ‏האם Fresh Coverage נבדק?
- ‏האם partial-universe bias נחסם?
- ‏האם subscriptions שוחזרו?
- ‏האם gaps טופלו?
- ‏האם Features נבנו מחדש?
- ‏האם Ranking הופעל רק אחרי readiness?

---

# ‏250. Checklist — Unknown Financial State

- ‏האם new risk חסום?
- ‏האם source of truth נשאל?
- ‏האם stable IDs קיימים?
- ‏האם duplicate command נמנע?
- ‏האם operator מקבל context ברור?
- ‏האם escalation מופעל אם unknown נמשך?

---

# ‏251. Checklist — Recovery Testing

- ‏Process kill בכל נקודת order lifecycle.
- ‏Broker disconnect בכל trade state.
- ‏Market-data outage מלא וחלקי.
- ‏Duplicate callbacks.
- ‏Out-of-order callbacks.
- ‏Late fills.
- ‏Manual broker changes.
- ‏Storage failure.
- ‏Restart עם Position פתוח.
- ‏Restart עם unknown order.
- ‏Repeated flapping.

---

# ‏252. מדדי הצלחה ל־Recovery

‏מערכת טובה אינה מערכת שלעולם אינה נופלת.

‏מערכת טובה היא כזו שכשמשהו נכשל:

1. ‏היא מזהה מהר.
2. ‏היא עוצרת הגדלת סיכון.
3. ‏היא יודעת מתי היא אינה יודעת.
4. ‏היא משיגה מחדש את האמת מהמקורות הנכונים.
5. ‏היא בונה state בצורה deterministic.
6. ‏היא חוזרת לפעילות רק אחרי validation.
7. ‏היא משאירה audit trail שמאפשר ללמוד מהאירוע.

---

# ‏253. משפט המפתח של הפרק

> ‏**Recovery מוצלח אינו “המערכת חזרה לרוץ”. Recovery מוצלח הוא “המערכת חזרה לדעת מה נכון, מה לא ידוע, ומה מותר לה לעשות”.**

---

# ‏254. הקשר לרובוט שלנו

‏ברובוט שסורק אלפי מניות ומחזיק Position לזמן קצר מאוד, failure קטן יכול להיות גדול יחסית לאורך העסקה.

‏לכן במיוחד אצלנו:

- ‏Signal ישן אחרי recovery בדרך כלל דורש revalidation.
- ‏Position קיימת מקבלת קדימות מוחלטת על Scanner חדש.
- ‏Fresh Coverage חשוב יותר מ־“יש חיבור”.
- ‏`UNKNOWN_ORDER_EFFECT` חוסם Entry חדש.
- ‏Broker reconciliation קודם לכל החלטת execution חדשה.
- ‏Recovery latency נמדדת כחלק מה־execution quality.

---

# ‏255. המעבר לשלב הבא

‏עכשיו יש לנו:

```text
Production State Machine
        ↓
Failure Detection
        ↓
Containment
        ↓
Reconciliation
        ↓
State Rebuild
        ↓
Validation
        ↓
Safe Resume
```

‏השלב הבא הוא **35 — `Monitoring`, ‏`Logging` ו־`Observability`**: איך לראות בזמן אמת מה הרובוט יודע, מה הוא עושה, למה הוא עשה זאת, איפה נוצר latency, מה בריאות ה־Scanner/Market Data/Broker/Execution, ואיך לגלות בעיה לפני שהיא הופכת לאירוע כספי.