# ‏שלב 33 — `Production State Machine`: להפוך את הרובוט למערכת שניתן לסמוך עליה

> ‏מטרת הפרק: להגדיר בצורה מפורשת באיזה מצב המערכת נמצאת בכל רגע, אילו פעולות מותרות בכל מצב, אילו אירועים גורמים למעבר מצב, ואיך מתאוששים מתקלה בלי לנחש מה מצב השוק, הפקודות או הפוזיציות.
>
> ‏העיקרון המרכזי: **מערכת מסחר Production אינה “רץ / לא רץ”. היא אוסף של State Machines עם invariants ברורים. החלטה עסקית, פקודה לברוקר, פוזיציה, בריאות נתונים ומצב תפעולי הם צירים שונים שאסור לדחוס ל־boolean אחד.**

---

# ‏1. למה בכלל צריך `State Machine`

‏בקוד צעיר קל להגיע ללוגיקה כמו:

```text
if connected && hasData && !paused && !hasPosition:
    trade()
```

‏אחרי כמה חודשים נוספים:

```text
if connected && hasData && !paused && !recovering &&
   !hasPosition && !hasWorkingOrder && !killSwitch &&
   brokerReady && riskReady && sessionOpen && ...
```

‏זה סימן שהמערכת כבר מנהלת State — רק בלי מודל מפורש.

‏`State Machine` הופך את ה־State לדבר שאפשר:

- ‏להבין.
- ‏לבדוק.
- ‏לשחזר.
- ‏לנטר.
- ‏להסביר.
- ‏ולאכוף.

---

# ‏2. הבעיה ב־boolean soup

‏כאשר לכל מצב יש boolean נפרד:

```text
isConnected
isReady
isPaused
isRecovering
hasPosition
hasWorkingOrder
isDataHealthy
```

‏אפשר להגיע לצירופים לא חוקיים.

‏לדוגמה:

```text
isReady = true
isRecovering = true
```

‏או:

```text
hasPosition = false
hasWorkingExitOrder = true
```

‏State Machine מגדיר אילו צירופים מותרים.

---

# ‏3. State אינו רק UI status

‏`READY` אינו טקסט ירוק במסך.

‏הוא Contract.

‏אם המערכת אומרת `READY`, משמעות הדבר שכל ה־preconditions שהגדרנו ל־Ready מתקיימים.

‏לדוגמה:

```text
Market data healthy
Broker synchronized
Risk state loaded
Clock healthy
No unresolved order state
Configuration loaded
Session policy known
```

---

# ‏4. State Machine טובה עונה על ארבע שאלות

‏לכל State צריך לדעת:

1. ‏איך נכנסים אליו?
2. ‏מה מותר לעשות בו?
3. ‏מה אסור לעשות בו?
4. ‏איך יוצאים ממנו?

---

# ‏5. לא State Machine אחת ענקית

‏אחת הטעויות הנפוצות היא לבנות enum אחד כזה:

```text
READY_FLAT
READY_ENTRY_PENDING
READY_POSITION_OPEN
PAUSED_FLAT
PAUSED_POSITION_OPEN
DEGRADED_FLAT
DEGRADED_POSITION_OPEN
...
```

‏מספר המצבים מתפוצץ קומבינטורית.

‏עדיף כמה State Machines אורתוגונליות.

---

# ‏6. ארבעת צירי ה־State המרכזיים שלנו

‏נשתמש לפחות בארבעה צירים:

```text
SystemState
TradingLifecycleState
BrokerState
MarketDataState
```

‏ובהמשך אפשר להוסיף:

```text
RiskState
SessionState
StrategyState
```

---

# ‏7. `SystemState`

‏מצב המערכת ברמת ה־Production process.

‏Baseline:

```text
STARTING
SYNCING
READY
DEGRADED
PAUSED
RECOVERING
EXIT_ONLY
STOPPING
STOPPED
FAULTED
```

---

# ‏8. `TradingLifecycleState`

‏מצב מחזור העסקה.

```text
FLAT
ENTRY_INTENT
ENTRY_PENDING
PARTIALLY_FILLED
POSITION_OPEN
EXIT_INTENT
EXIT_PENDING
PARTIALLY_EXITED
RECONCILING
```

---

# ‏9. `BrokerState`

```text
DISCONNECTED
CONNECTING
CONNECTED_UNSYNCED
SYNCING
READY
DEGRADED
UNKNOWN
```

---

# ‏10. `MarketDataState`

```text
DISCONNECTED
CONNECTING
WARMING_UP
HEALTHY
STALE
PARTIAL
DEGRADED
FAILED
```

---

# ‏11. למה ההפרדה חשובה

‏אפשר להיות:

```text
SystemState = DEGRADED
TradingLifecycleState = POSITION_OPEN
BrokerState = READY
MarketDataState = STALE
```

‏זה מצב הגיוני לחלוטין.

‏ייתכן שהמערכת לא מאפשרת כניסות חדשות, אבל עדיין חייבת לנהל Position קיים.

---

# ‏12. State הוא Fact; Policy מחליטה מה לעשות

‏לדוגמה:

```text
MarketDataState = STALE
```

‏זו עובדה.

‏החלטה כמו:

```text
DisableNewEntries = true
```

‏היא Policy.

‏אסור לערבב בין השניים.

---

# ‏13. `STARTING`

‏זהו המצב מיד לאחר עליית process.

‏במצב זה:

- ‏לא שולחים Orders חדשים.
- ‏לא מניחים שאין Position.
- ‏לא מניחים שאין Working Orders.
- ‏לא מניחים שה־Market Data כבר usable.

---

# ‏14. Startup אינו `READY`

‏אפליקציה שעלתה בהצלחה אינה מערכת מסחר שמוכנה לפעול.

‏Startup רק אומר:

```text
process is alive
```

‏לא:

```text
trading is safe
```

---

# ‏15. מעבר `STARTING → SYNCING`

‏לאחר טעינת:

- ‏Configuration.
- ‏Secrets.
- ‏Strategy version.
- ‏Risk limits.
- ‏Persistent local state.
- ‏Trading calendar/session configuration.

‏המערכת יכולה להתחיל synchronization.

---

# ‏16. `SYNCING`

‏ב־`SYNCING` המערכת בונה מחדש את האמת התפעולית.

‏היא צריכה להשוות:

```text
Local state
vs
Broker orders
vs
Broker executions
vs
Broker positions
vs
Account state
```

---

# ‏17. כלל קריטי: Startup Reconciliation לפני Entries

‏עד שאין reconciliation מספיק טוב:

```text
new entries = forbidden
```

‏גם אם ה־Scanner כבר רואה Candidate מצוין.

---

# ‏18. למה?

‏כי ייתכן שלפני הקריסה:

- ‏נשלחה פקודה.
- ‏התקבל Fill.
- ‏האירוע לא נשמר מקומית.
- ‏האפליקציה עלתה מחדש.

‏אם נניח שאנחנו `FLAT`, נוכל לפתוח Position כפול.

---

# ‏19. `READY`

‏`READY` פירושו שכל Preconditions החיוניים לפעילות רגילה מתקיימים.

‏לדוגמה:

```text
Broker ready
Market data healthy
Risk ready
Clock healthy
No unresolved state
Strategy initialized
Universe ready
```

---

# ‏20. `READY` אינו אומר שחייבים לסחור

‏יכול להיות:

```text
SystemState = READY
TradingLifecycleState = FLAT
Decision = NO_TRADE
```

‏וזה מצב תקין לחלוטין.

---

# ‏21. `PAUSED`

‏`PAUSED` פירושו שהמערכת עצרה פעילות אסטרטגית חדשה ביוזמה מכוונת.

‏זה לא בהכרח Shutdown.

---

# ‏22. Pause אינו Cancel Everything

‏צריך להגדיר בדיוק מה Pause עושה.

‏Baseline בטוח:

- ‏אין Entry חדש.
- ‏אין Signals חדשים שמומרים ל־Orders.
- ‏Positions קיימים ממשיכים להיות מנוהלים לפי מדיניות מוגדרת.
- ‏Working Orders מטופלים לפי Policy מפורשת.
- ‏Market Data, Broker callbacks ו־reconciliation ממשיכים לעבוד.

---

# ‏23. `PAUSE_REQUESTED` מול `PAUSED`

‏אפשר להפריד:

```text
READY
→ PAUSE_REQUESTED
→ PAUSED
```

‏כך יש זמן להשלים פעולות שדורשות consistency לפני שהמערכת מודיעה שהיא באמת Paused.

---

# ‏24. Resume אינו “set paused=false”

‏לפני `PAUSED → READY` צריך לבדוק מחדש:

- ‏Broker state.
- ‏Positions.
- ‏Working orders.
- ‏Market data freshness.
- ‏Risk state.
- ‏Session status.

---

# ‏25. Resume הוא Mini-Reconciliation

‏כל Resume צריך להתייחס לזמן שעבר כאילו התרחשו דברים בזמן שלא פתחנו Entries.

---

# ‏26. `DEGRADED`

‏`DEGRADED` פירושו שהמערכת חיה, אך לפחות Capability חשובה אינה עומדת בדרישות הרגילות.

‏דוגמאות:

```text
market data freshness deteriorated
secondary feed unavailable
broker latency elevated
partial universe coverage
logging sink unavailable
```

---

# ‏27. Degraded אינו בהכרח Stop

‏אפשר להגדיר Policies שונות.

‏לדוגמה:

```text
DEGRADED_DATA:
    no new entries
    existing exits allowed
```

‏לעומת:

```text
DEGRADED_OBSERVABILITY:
    entries allowed only if local durable logging healthy
```

---

# ‏28. Capability-based Degradation

‏במקום boolean יחיד:

```text
degraded = true
```

‏עדיף לדעת:

```text
CanScan = true
CanEnter = false
CanExit = true
CanCancel = true
CanReconcile = true
```

---

# ‏29. `EXIT_ONLY`

‏`EXIT_ONLY` הוא מצב Production חשוב במיוחד.

‏במצב זה:

```text
new entry intents = blocked
risk-increasing actions = blocked
risk-reducing exits = allowed
cancel/replace for exits = allowed when policy permits
reconciliation = active
```

---

# ‏30. למה `EXIT_ONLY` שונה מ־`PAUSED`

‏`PAUSED` הוא מצב תפעולי יזום.

‏`EXIT_ONLY` הוא מצב Risk-oriented.

‏ייתכן שהמערכת עדיין פועלת באופן אקטיבי מאוד כדי לסגור Positions.

---

# ‏31. `RECOVERING`

‏נכנסים ל־`RECOVERING` כאשר הייתה תקלה והמערכת אינה יכולה עדיין להצהיר על state אמין.

‏דוגמאות:

- ‏Broker reconnect.
- ‏Market data reconnect.
- ‏Process restart.
- ‏Sequence gap.
- ‏Unknown order effect.
- ‏Position mismatch.

---

# ‏32. Recovery אינו Retry Loop

‏Recovery מקצועי הוא workflow.

```text
Detect
→ Freeze unsafe actions
→ Query authoritative state
→ Reconcile
→ Validate invariants
→ Resume or escalate
```

---

# ‏33. `FAULTED`

‏`FAULTED` מיועד למצב שבו המערכת אינה יכולה להבטיח התנהגות בטוחה.

‏לדוגמה:

```text
position mismatch unresolved
corrupted persistent state
risk engine unavailable
broker state contradictory
```

---

# ‏34. `FAULTED` לא צריך auto-resume עיוור

‏אם לא ידוע מדוע המערכת Faulted, מעבר אוטומטי ל־Ready מסוכן.

---

# ‏35. `STOPPING`

‏Shutdown צריך להיות State Transition מסודר.

‏לא פשוט:

```text
process.kill()
```

---

# ‏36. Shutdown Policy

‏צריך להחליט:

- ‏האם מבטלים Working Entries?
- ‏האם משאירים native protective exits?
- ‏האם סוגרים Positions?
- ‏האם רק מפסיקים Strategy decisions?

‏אין תשובה אחת נכונה לכל מערכת.

---

# ‏37. `STOPPED`

‏ב־`STOPPED` אין לוגיקה פעילה.

‏אבל צריך להשאיר audit trail ברור של:

```text
final positions
open broker orders
reason for stop
last reconciliation time
```

---

# ‏38. Event-driven State Machine

‏מעברים צריכים להתרחש בגלל Events מפורשים.

‏לדוגמה:

```text
BrokerConnected
BrokerDisconnected
MarketDataStale
RiskLimitBreached
PauseRequested
ResumeRequested
EntryFilled
ExitFilled
RecoveryCompleted
```

---

# ‏39. Command מול Event

‏הבדל חשוב:

```text
Command: CancelOrder
Event: OrderCancelled
```

‏ה־Command מבקש.

‏ה־Event אומר מה קרה.

---

# ‏40. Request אינו State Change סופי

‏שלחנו:

```text
CancelOrder
```

‏אבל אסור לעבור מיד ל־`CANCELLED`.

‏עד שהברוקר מאשר או שמבוצע reconciliation, ה־state צריך לשקף אי־ודאות.

---

# ‏41. Guards

‏כל Transition יכול לקבל Guard.

‏לדוגמה:

```text
FLAT → ENTRY_INTENT
```

‏רק אם:

```text
SystemState == READY
RiskAllowsEntry == true
MarketDataState == HEALTHY
BrokerState == READY
```

---

# ‏42. Actions

‏Transition יכול להפעיל Action.

‏לדוגמה:

```text
ENTRY_INTENT → ENTRY_PENDING
```

‏Action:

```text
Persist intent
Submit broker order
Start TTL timer
```

---

# ‏43. Side Effects צריכים להיות מפורשים

‏אם מעבר State שולח פקודה חיצונית, זה Side Effect שצריך להיות מתועד.

---

# ‏44. Invariant בסיסי: Position Truth

‏אם הברוקר אומר שיש Position, המערכת אינה רשאית להציג `FLAT` לאורך זמן בלתי מוגבל.

---

# ‏45. Invariant: Entry חדש דורש `FLAT`

‏אם האסטרטגיה שלנו מוגדרת Position יחיד:

```text
EntryAllowed ⇒ TradingLifecycleState == FLAT
```

---

# ‏46. Invariant: Exit דורש Exposure

‏פקודת Exit רגילה לא צריכה להישלח אם אין Position ידוע.

‏חריגים צריכים להיות מפורשים, לא מקריים.

---

# ‏47. Invariant: Risk אינו optional

```text
No Risk Approval
=> No Entry Submission
```

---

# ‏48. Invariant: `UNKNOWN` חוסם הגדלת סיכון

‏אם איננו יודעים האם Order קודם בוצע:

```text
new risk-increasing order = forbidden
```

---

# ‏49. Invariant: stale data אינו בסיס ל־Entry

‏אם הנתונים חורגים מ־freshness SLA שהוגדר:

```text
CanEnter = false
```

---

# ‏50. Invariant: Exit path חייב להישאר אפשרי

‏לפני Entry צריך לבדוק שהמערכת נמצאת במצב שבו היא יכולה לפחות לנסות לנהל Exit.

---

# ‏51. `FLAT`

‏אין Position ואין Entry עובד.

‏אבל צריך להיזהר:

```text
FLAT locally
```

‏אינו מספיק.

‏צריך Broker reconciliation.

---

# ‏52. `ENTRY_INTENT`

‏ה־Strategy החליטה שהיא רוצה Position.

‏עדיין לא נשלחה פקודה.

‏זה שלב מצוין לבצע:

- ‏Risk checks.
- ‏Freshness check.
- ‏Signal recheck.
- ‏Price budget check.

---

# ‏53. Intent הוא Immutable Record

‏עדיף לשמור:

```text
intent_id
symbol
side
requested_qty
max_entry_price
signal_time
score
rank
strategy_version
risk_snapshot
```

---

# ‏54. `ENTRY_PENDING`

‏פקודת הכניסה נשלחה או אושרה אך עדיין אין Position מלא.

---

# ‏55. Entry Pending אינו Flat

‏גם אם fill quantity עדיין 0:

‏יש Pending Exposure.

---

# ‏56. `PARTIALLY_FILLED`

‏קיבלנו Fill חלקי.

‏מהרגע הזה יש Position אמיתי.

‏המערכת חייבת לנהל Risk ו־Exit עבור הכמות שבוצעה.

---

# ‏57. Partial Fill יוצר Dual State

‏ייתכן בו־זמנית:

```text
filled_qty > 0
remaining_entry_qty > 0
```

‏לכן צריך להבחין בין Position State לבין Order State.

---

# ‏58. `POSITION_OPEN`

‏יש Exposure אמיתי שדורש ניהול.

‏זה State שבו:

- ‏Exit policy פעילה.
- ‏Holding timer פעיל.
- ‏Risk monitoring פעיל.
- ‏PnL/MAE/MFE metrics פעילים.

---

# ‏59. `EXIT_INTENT`

‏התקבלה החלטה לצאת.

‏חשוב לשמור:

```text
exit_reason
trigger_time
reference_price
urgency
expected_remaining_edge
```

---

# ‏60. `EXIT_PENDING`

‏פקודת יציאה קיימת אך עדיין לא כל Position נסגר.

---

# ‏61. `PARTIALLY_EXITED`

‏חלק מה־Position נסגר.

‏הכמות שנותרה היא מקור האמת להמשך Risk.

---

# ‏62. `FLAT` רק אחרי אמת ברוקרית

‏לא עוברים ל־`FLAT` רק כי שלחנו Sell על כל הכמות.

‏עוברים כאשר Fill/Position reconciliation מאשרים שאין Exposure.

---

# ‏63. Order State Machine נפרד

‏לכל Order אפשר State עצמאי:

```text
CREATED
SUBMITTING
SUBMITTED
ACKNOWLEDGED
PARTIALLY_FILLED
FILLED
CANCEL_REQUESTED
CANCELLED
REJECTED
UNKNOWN
```

---

# ‏64. למה לא להסתפק ב־Broker status string

‏כל Broker משתמש בסמנטיקה מעט אחרת.

‏אנחנו צריכים Canonical Order State פנימי.

---

# ‏65. Broker Adapter מתרגם

```text
Broker-specific callback
→ Canonical Broker Event
→ Internal State Transition
```

---

# ‏66. `UNKNOWN` הוא State חשוב

‏`UNKNOWN` אומר:

> ‏איננו יכולים להוכיח מה מצב ה־Order.

‏זה עדיף על ניחוש.

---

# ‏67. Unknown State Policy

‏Baseline:

```text
Block new risk
Query broker
Reconcile
Escalate if unresolved
```

---

# ‏68. Duplicate Events

‏Callbacks יכולים להגיע יותר מפעם אחת.

‏State transitions צריכים להיות idempotent.

---

# ‏69. Out-of-order Events

‏אירוע ישן יכול להגיע אחרי אירוע חדש.

‏אי אפשר להסתמך רק על arrival order בלי sequence/version semantics.

---

# ‏70. State Version

‏אפשר לשמור לכל Aggregate:

```text
state_version
```

‏כדי לזהות update ישן.

---

# ‏71. Optimistic Concurrency

‏כאשר שני handlers מנסים לעדכן אותו State:

```text
expected_version == current_version
```

‏או שהעדכון נדחה ומחושב מחדש.

---

# ‏72. Single Writer

‏ל־Position/Order state קריטי, מודל של single logical writer מפשט מאוד consistency.

---

# ‏73. Event Loop

‏ארכיטקטורה נוחה:

```text
Event
→ Normalize
→ Validate
→ Reduce State
→ Evaluate Invariants
→ Produce Commands
```

---

# ‏74. Reducer Deterministic

‏בהינתן:

```text
old_state + event
```

‏צריך לקבל תמיד אותו `new_state`.

---

# ‏75. Side Effects אחרי State Decision

‏ה־Reducer לא צריך בעצמו לעשות network I/O.

‏עדיף שיפיק Commands.

---

# ‏76. Event Log

‏כל transition חשוב צריך להשאיר:

```text
event_id
entity_id
old_state
new_state
reason
source
event_time
processed_time
```

---

# ‏77. Why Transition

‏לא מספיק לדעת:

```text
READY → DEGRADED
```

‏צריך לדעת:

```text
reason = MARKET_DATA_FRESH_COVERAGE_BELOW_THRESHOLD
```

---

# ‏78. Reason Codes

‏Reason codes צריכים להיות machine-readable.

‏לדוגמה:

```text
MD_STALE
BROKER_DISCONNECTED
POSITION_MISMATCH
RISK_LIMIT_BREACH
USER_PAUSE
SESSION_CLOSED
UNKNOWN_ORDER_STATE
```

---

# ‏79. Human-readable Message

‏בנוסף ל־reason code אפשר לשמור הודעה מפורטת.

‏אבל Logic לא צריך להתבסס על parsing של טקסט.

---

# ‏80. Global State מול Per-Symbol State

‏Whole-market scanner לא צריך ליצור trading lifecycle מלא ל־4,000 Symbols.

‏רובם Candidate state בלבד.

‏State עשיר נוצר רק כאשר יש Intent/Order/Position.

---

# ‏81. Candidate State

‏אפשר לנהל קלות:

```text
INELIGIBLE
ELIGIBLE
RANKED
TOP_CANDIDATE
COOLDOWN
```

‏אבל לא לערבב אותו עם Broker lifecycle.

---

# ‏82. Strategy State

‏לדוגמה:

```text
WARMING_UP
ACTIVE
ABSTAINING
DISABLED
```

---

# ‏83. Warm-up

‏Features מבוססי rolling windows דורשים history.

‏לכן Market Data יכול להיות Healthy אבל Strategy עדיין `WARMING_UP`.

---

# ‏84. `READY` צריך לדעת את זה

‏אם Strategy לא מוכנה, `CanEnter` עדיין false.

---

# ‏85. Session State

```text
PRE_MARKET
REGULAR
AFTER_HOURS
CLOSED
HALTED
UNKNOWN
```

‏אבל Session State לבדו אינו מספיק לקבוע tradability של כל Symbol.

---

# ‏86. Trading Halt כ־Instrument State

‏Symbol מסוים יכול להיות Halted בזמן שהמערכת כולה Ready.

---

# ‏87. Per-Instrument Tradability

‏לכל Symbol אפשר לחשב:

```text
is_tradable_now
reason
```

---

# ‏88. State Hierarchy

‏State Machine גדולה יכולה להיות היררכית.

‏לדוגמה:

```text
OPERATIONAL
├─ READY
├─ DEGRADED
└─ PAUSED
```

‏אבל אין חובה להשתמש בספריית HSM כבדה.

---

# ‏89. KISS

‏אם enums + transition table + guards מספיקים, אין צורך ב־framework מורכב.

---

# ‏90. Transition Table

‏דוגמה:

| Current | Event | Guard | Next | Action |
|---|---|---|---|---|
| `STARTING` | config loaded | valid config | `SYNCING` | connect/sync |
| `SYNCING` | sync complete | invariants pass | `READY` | enable strategy |
| `READY` | data stale | — | `DEGRADED` | block entries |
| `READY` | pause requested | — | `PAUSED` | freeze new intents |
| `DEGRADED` | risk critical | — | `EXIT_ONLY` | reduce exposure |
| `RECOVERING` | reconciliation complete | safe | `READY` | resume |

---

# ‏91. Illegal Transition

‏אם מתקבל transition שאינו מוגדר:

```text
READY → FILLED
```

‏ברמת System State זה כנראה Bug.

‏צריך log/metric/test.

---

# ‏92. Ignore מול Reject

‏Duplicate benign event אפשר להתעלם ממנו idempotently.

‏Transition בלתי אפשרי צריך להיחשב anomaly.

---

# ‏93. Transition Preconditions

‏לפני `READY` צריך לעבור checklist machine-readable.

---

# ‏94. Ready Gate

```text
CanBecomeReady =
    BrokerReady &&
    MarketDataHealthy &&
    RiskReady &&
    StrategyReady &&
    ReconciliationClean
```

---

# ‏95. CanEnter Gate

```text
CanEnter =
    SystemState == READY &&
    TradingLifecycleState == FLAT &&
    BrokerCanSubmit &&
    DataCanTrade &&
    RiskAllowsEntry &&
    StrategyAllowsEntry
```

---

# ‏96. CanExit Gate

‏Exit צריך להיות הרבה פחות תלוי ב־Strategy health.

‏אם יש Position, כשל ב־Scanner לא צריך למנוע ניהול Risk.

---

# ‏97. Risk-Increasing מול Risk-Reducing Actions

‏זוהי הבחנה חזקה יותר מ־Buy/Sell.

‏Sell יכול להגדיל Short Exposure.

‏לכן Policy צריכה לחשוב ב־Exposure, לא רק Side.

---

# ‏98. `EXIT_ONLY` לפי Risk Delta

‏מותרת פעולה אם היא אינה מגדילה Exposure מעבר למדיניות.

---

# ‏99. Position Reconciliation

‏משווים:

```text
local_qty
broker_qty
```

‏אבל גם:

```text
avg_price
symbol identity
account
working exits
```

---

# ‏100. Mismatch אינו רק Warning

‏Position mismatch יכול להיות סיכון כספי אמיתי.

‏לכן הוא צריך להפעיל transition.

---

# ‏101. Working Order Reconciliation

‏צריך לזהות:

- ‏Order שהברוקר מכיר והמערכת לא.
- ‏Order שהמערכת חושבת שחי והברוקר לא.
- ‏Status שונה.
- ‏Remaining quantity שונה.

---

# ‏102. Orphan Order

‏Order שקיים אצל הברוקר אבל אין לו Intent מקומי מזוהה הוא anomaly משמעותי.

---

# ‏103. Orphan Position

‏Position ללא lifecycle מקומי דורש Recovery.

---

# ‏104. Local Ghost

‏המערכת חושבת שיש Order/Position שאין אצל הברוקר.

‏גם זה דורש reconciliation ולא “מחיקה שקטה”.

---

# ‏105. Restart Scenario

‏נניח:

```text
ENTRY_PENDING
process crashes
broker fills order
process restarts
```

‏Startup חייב לגלות את ה־Fill לפני Strategy resume.

---

# ‏106. Disconnect Scenario

```text
POSITION_OPEN
broker disconnects
```

‏המערכת אינה `FLAT`.

‏היא עדיין חשופה.

---

# ‏107. Broker Disconnect + Position

‏Policy אפשרית:

```text
SystemState = RECOVERING or EXIT_ONLY
TradingLifecycleState = POSITION_OPEN
```

---

# ‏108. Data Disconnect + Position

‏בעיה שונה.

‏הברוקר יכול להיות בריא אבל Strategy blind.

‏צריך Policy ייעודית.

---

# ‏109. Partial Universe Outage

‏אם 10% מה־Universe stale, לא תמיד צריך לעצור הכול.

‏אבל Rank cross-sectional יכול להפוך לאמין פחות.

---

# ‏110. Whole-Market Dependency

‏לרובוט שלנו Top-1 נבחר יחסית לכל השוק.

‏לכן data coverage היא dependency של Decision State.

---

# ‏111. Coverage Gate

```text
FreshCoverageRatio >= threshold
```

‏יכול להיות Guard ל־Entry.

---

# ‏112. Rank Freshness Gate

‏לא מספיק שה־Quote של Top-1 טרי.

‏צריך לדעת שגם התחרות מולו חושבה על Universe טרי מספיק.

---

# ‏113. `DecisionSnapshot`

‏לפני Entry שומרים:

```text
system_state
broker_state
market_data_state
risk_state
strategy_state
trading_state
```

---

# ‏114. למה Snapshot חשוב

‏אחרי הפסד נוכל לדעת באיזה מצב המערכת הייתה כאשר נתנה אישור.

---

# ‏115. State Transition Metrics

‏כדאי למדוד:

```text
transitions_total
state_duration
unexpected_transition_total
recovery_duration
paused_duration
degraded_duration
```

---

# ‏116. State Duration

‏מערכת שנתקעת 30 דקות ב־`SYNCING` צריכה Alert.

---

# ‏117. Transition Rate

‏אם `READY ↔ DEGRADED` קורה מאות פעמים בדקה, ייתכן שיש state flapping.

---

# ‏118. Hysteresis

‏כדי למנוע flapping:

```text
enter degraded quickly
return to ready only after stable healthy window
```

---

# ‏119. Debounce

‏אירוע רגעי אינו תמיד צריך לשנות Global State.

---

# ‏120. אבל Risk Critical Event לא עושים Debounce

‏אירוע מסוכן צריך תגובה מיידית לפי Policy.

---

# ‏121. Timeout הוא Event

‏אם `ENTRY_PENDING` נמשך מעבר ל־TTL:

```text
EntryTimeout
```

‏הוא Event מפורש.

---

# ‏122. Timer State

‏Timers צריכים להיות חלק ממודל ה־State ולא `Task.Delay` אקראי.

---

# ‏123. Durable Timers

‏אם process נופל, צריך לדעת האם TTL כבר עבר בזמן שהוא היה למטה.

---

# ‏124. Time Source

‏כל State Machine צריכה להשתמש ב־`IClock`/Clock abstraction כדי להיות replayable.

---

# ‏125. Deterministic Replay

‏אותו Event Stream צריך לייצר אותם State Transitions.

---

# ‏126. State Hash

‏אפשר לחשב hash של state אחרי אירועים מרכזיים לצורך regression.

---

# ‏127. Transition Trace

‏דוגמה:

```text
12:00:00.000 READY/FLAT
12:00:00.120 ENTRY_INTENT
12:00:00.180 ENTRY_PENDING
12:00:00.260 PARTIALLY_FILLED
12:00:00.310 POSITION_OPEN
12:00:08.400 EXIT_INTENT
12:00:08.460 EXIT_PENDING
12:00:08.700 FLAT
```

---

# ‏128. Timeline הוא כלי RCA

‏במקום לקרוא אלפי logs, רואים lifecycle ברור.

---

# ‏129. State Machine Visualization

‏אפשר להפיק Mermaid/Graphviz אוטומטית מ־transition definitions.

‏כך documentation נשארת צמודה לקוד.

---

# ‏130. Code-defined Transitions

‏עדיף שה־transition table תהיה מקור אמת אחד.

---

# ‏131. Tests מכל Transition

‏לכל transition חשוב:

```text
Given state
When event
Then next state
And commands
And invariants
```

---

# ‏132. Invalid Transition Tests

‏צריך לבדוק גם מה אסור.

---

# ‏133. Property Tests

‏Invariant לדוגמה:

```text
never submit entry while SystemState != READY
```

‏אפשר לבדוק על רצפי Events אקראיים.

---

# ‏134. Model-based Testing

‏State Machine היא מועמדת מצוינת ל־model-based tests.

---

# ‏135. Chaos/Fault Sequences

‏בדיקות צריכות לכלול:

```text
fill → disconnect → reconnect
cancel request → fill → cancel ack
data stale → exit trigger
restart with working order
partial fill → process crash
```

---

# ‏136. Golden State Traces

‏שומרים רצפי Event ידועים והתוצאה הצפויה שלהם.

---

# ‏137. Same State Machine Across Environments

‏`REPLAY`, ‏`SHADOW`, ‏`PAPER`, ‏`LIVE` צריכים להשתמש באותה לוגיקת lifecycle ככל האפשר.

---

# ‏138. Environment משנה Adapters

```text
MarketDataProvider
ExecutionBroker
Clock
```

‏משתנים.

‏State transitions העסקיים נשארים דומים.

---

# ‏139. Feature Flag אינו State

‏Feature flag אומר מה ה־system מסוגל/מורשה לעשות.

‏State אומר מה קורה עכשיו.

---

# ‏140. Config אינו State

```text
max_position_size = 100
```

‏זו Policy configuration.

‏לא State.

---

# ‏141. Derived State

‏חלק מהמצבים אפשר לחשב מנתונים אחרים.

‏אבל צריך להיזהר לא לחשב שוב ושוב state קריטי בצורה שיכולה להשתנות באמצע transaction.

---

# ‏142. Persisted State מול Reconstructed State

‏הברוקר הוא Authority ל־Orders/Fills/Positions.

‏לכן חלק מה־State המקומי צריך להיות reconstructable.

---

# ‏143. Intent אינו ניתן לשחזור מהברוקר

‏למה נכנסנו לעסקה, איזה Score היה ומה היה Risk Budget — זה מידע שלנו.

‏צריך לשמור אותו durably.

---

# ‏144. Hybrid Recovery

‏Recovery משלב:

```text
broker truth
+
local intent/audit state
+
market context
```

---

# ‏145. Snapshot + Event Log

‏Pattern שימושי:

```text
latest durable snapshot
+
events after snapshot
```

---

# ‏146. לא חייבים Event Sourcing מלא

‏אפשר לקבל את היתרונות העיקריים גם בלי להפוך את כל הפרויקט ל־Event Sourced Architecture.

---

# ‏147. Minimum Durable Record

‏לכל Trade Lifecycle חשוב לשמור לפחות:

```text
intent
orders
fills
position transitions
exit reason
system state transitions
```

---

# ‏148. Crash Consistency

‏צריך לחשוב מה קורה אם process נופל בין:

```text
persist intent
```

‏לבין:

```text
submit order
```

‏או בסדר ההפוך.

---

# ‏149. Outbox Pattern

‏Outbox יכול לעזור כאשר צריך לקשור persistent intent ל־side effect חיצוני.

‏אבל הוא אינו פותר לבדו uncertainty של network call לברוקר.

---

# ‏150. Idempotency נשארת חובה

‏גם עם Outbox, broker submission צריך correlation/idempotency policy.

---

# ‏151. State Ownership

‏צריך להגדיר מי רשאי לשנות איזה State.

‏לדוגמה:

```text
Risk Engine → RiskState
Broker Adapter → broker events
Lifecycle Engine → TradingLifecycleState
Operator → pause/resume commands
```

---

# ‏152. UI אינו Owner

‏כפתור `Pause` שולח Command.

‏ה־UI אינו פשוט משנה state בבסיס הנתונים.

---

# ‏153. Operator Commands

```text
Pause
Resume
EnterExitOnly
Stop
AcknowledgeFault
```

‏צריכים audit trail.

---

# ‏154. Command Authorization

‏ב־Production אפשר לדרוש הרשאות שונות לפעולות מסוכנות.

---

# ‏155. `Pause` בזמן `ENTRY_PENDING`

‏זו שאלה שצריך להכריע במדיניות.

‏Baseline אפשרי:

- ‏לחסום Entries חדשים.
- ‏לטפל ב־working order לפי ה־Order Intent שכבר אושר.
- ‏לא “לשכוח” אותו.

---

# ‏156. `Pause` בזמן `POSITION_OPEN`

‏Position management ממשיך.

‏אחרת Pause עלול להפוך לכפתור שמבטל Risk Controls.

---

# ‏157. `Resume` עם Position קיים

‏Resume אינו חייב לחזור ל־`FLAT`.

‏אחרי reconciliation אפשר להיות:

```text
SystemState = READY
TradingLifecycleState = POSITION_OPEN
```

---

# ‏158. `Stop` מול `Pause`

‏`Pause` מתוכנן להיות reversible.

‏`Stop` מסיים את process/workflow לפי shutdown policy.

---

# ‏159. `Kill Switch`

‏Kill Switch הוא Command/Policy שיכול להעביר את המערכת למצב מוגבל.

‏הפרק המלא עליו יגיע בהמשך.

---

# ‏160. Kill Switch לא בהכרח `STOPPED`

‏לעיתים המצב הבטוח יותר הוא:

```text
EXIT_ONLY
```

‏כדי לאפשר סגירת Exposure.

---

# ‏161. State Priority

‏כאשר כמה אירועים קורים כמעט יחד, צריך סדר עדיפויות.

‏לדוגמה:

```text
RiskCritical
BrokerTruthUpdate
OperatorPause
StrategySignal
```

‏לא בהכרח באותו priority.

---

# ‏162. Safety Events צריכים לנצח Signal Events

‏אם באותו רגע יש Candidate חדש וגם Risk Limit breach:

‏ה־Risk event גובר.

---

# ‏163. Event Serialization

‏במערכת concurrent, transitions של אותו Aggregate צריכים לעבור serialization לוגי.

---

# ‏164. Race: Entry Signal מול Pause

‏צריך להגדיר cut-off ברור.

‏לדוגמה:

```text
intent must have risk approval before pause_epoch
```

‏או Policy אחרת, אבל היא חייבת להיות דטרמיניסטית.

---

# ‏165. Epoch / Generation

‏אפשר להוסיף:

```text
system_epoch
```

‏כדי לבטל intents ישנים אחרי reconnect/reconfiguration.

---

# ‏166. Stale Intent

‏Intent שנוצר לפני state change משמעותי צריך revalidation.

---

# ‏167. Config Version

‏Decision צריך לשמור:

```text
config_version
strategy_version
risk_version
```

---

# ‏168. State Transition אחרי Config Reload

‏Hot reload של פרמטרים רגישים דורש Policy.

‏לא כל שינוי צריך להיכנס באמצע Position.

---

# ‏169. Safe Configuration Boundary

‏אפשר להחיל Strategy config חדש רק ב־`FLAT`, אלא אם הוגדר אחרת.

---

# ‏170. Version Pinning per Trade

‏Trade יכול לזכור באיזו גרסה נפתח כדי ש־Exit logic לא ישתנה במפתיע באמצע.

---

# ‏171. Observability

‏Dashboard טוב מציג בנפרד:

```text
System State
Trading State
Broker State
Market Data State
Risk State
Session State
```

---

# ‏172. צבע אחד אינו מספיק

‏“System green” יכול להסתיר ש־Market Data degraded אבל Broker healthy.

---

# ‏173. State Age

‏לכל State חשוב להציג:

```text
entered_at
age
reason
```

---

# ‏174. Last Successful Reconciliation

‏מדד Production קריטי:

```text
last_broker_reconciliation_age
```

---

# ‏175. Last Healthy Market Snapshot

‏גם:

```text
last_full_fresh_coverage_at
```

---

# ‏176. Readiness Endpoint

‏`/ready` צריך לשקף readiness אמיתי, לא רק process alive.

---

# ‏177. Liveness Endpoint

‏`/live` יכול לענות:

> ‏האם process חי ומסוגל לבצע recovery?

‏זה שונה מ־Ready to Trade.

---

# ‏178. Kubernetes/Service Monitoring

‏אם בעתיד נריץ containerized, liveness/readiness semantics חייבים להתאים ל־state model.

---

# ‏179. אל תגרום ל־orchestrator להרוג process שמנסה לנהל Position

‏Probe אגרסיבי יכול להיות מסוכן יותר מהתקלה עצמה.

---

# ‏180. Restart Policy תלויה State

‏Crash loop בזמן Position פתוח דורש Alert/Reconciliation, לא endless blind restart.

---

# ‏181. Recovery Budget

‏אפשר להגדיר:

```text
max_recovery_attempts
max_recovery_duration
```

‏לפני מעבר ל־`FAULTED` או escalation.

---

# ‏182. Recovery Progress

‏`RECOVERING` צריך להציג שלבים:

```text
CONNECTING_BROKER
FETCHING_ORDERS
FETCHING_POSITIONS
MATCHING_STATE
VALIDATING_INVARIANTS
```

---

# ‏183. Recovery צריך להיות resumable

‏אם recovery עצמו נקטע, המערכת צריכה להתחיל מחדש בצורה בטוחה.

---

# ‏184. `NO TRADE` הוא Decision, לא System State

‏אסור ליצור:

```text
SystemState = NO_TRADE
```

‏כי מערכת יכולה להיות `READY` ועדיין להחליט `NO_TRADE` בכל cycle.

---

# ‏185. `SCANNING` — האם הוא State?

‏לרוב לא צריך להפוך כל פעולה מחזורית ל־Global State.

‏אם Scanner עובד רצוף, `SCANNING` הוא activity/metric ולא בהכרח mutually-exclusive State.

---

# ‏186. מתי כן להשתמש ב־`SCANNING`

‏אם קיימת workflow אצוותית ברורה:

```text
IDLE → SCANNING → RANKING → DECIDING
```

‏זה יכול להתאים.

‏אבל לרובוט streaming שלנו עדיף state רציף + event pipeline.

---

# ‏187. State Explosion

‏כל State חדש צריך להצדיק:

- ‏התנהגות ייחודית.
- ‏Guard ייחודי.
- ‏Transition ייחודי.

‏אחרת הוא אולי Metric או Flag, לא State.

---

# ‏188. Orthogonal State Machines מפחיתות Explosion

‏זו אחת הסיבות לפצל System/Broker/Data/Trade.

---

# ‏189. Composition Policy

‏צריך פונקציה אחת שמחשבת Capabilities מהמצבים.

‏לדוגמה:

```text
Capabilities = Evaluate(
    SystemState,
    BrokerState,
    MarketDataState,
    RiskState,
    TradingLifecycleState)
```

---

# ‏190. Capability Matrix

| Capability | READY | PAUSED | DEGRADED | EXIT_ONLY | RECOVERING |
|---|---:|---:|---:|---:|---:|
| Scan | yes | optional | maybe | optional | no |
| New entry | yes | no | usually no | no | no |
| Manage position | yes | yes | yes | yes | yes if possible |
| Exit | yes | yes | yes | yes | yes if possible |
| Reconcile | yes | yes | yes | yes | mandatory |

---

# ‏191. “Usually” צריך להפוך ל־Policy בקוד

‏הטבלה מסבירה רעיון.

‏ב־Production אין להשאיר ambiguity.

---

# ‏192. State Invariants מרכזיים לרובוט שלנו

```text
1. No new entry unless system is ready.
2. No new entry with unresolved broker state.
3. No new entry with stale full-market context.
4. Position quantity must reconcile with broker truth.
5. Every non-zero position must have active exit management.
6. Every broker order must map to known intent or be flagged orphan.
7. UNKNOWN state blocks risk increase.
8. Restart cannot skip reconciliation.
```

---

# ‏193. למה Full-market Context הוא Invariant עסקי

‏ה־Strategy שלנו לא בוחרת “מניה טובה”.

‏היא בוחרת “המניה הטובה ביותר כרגע יחסית לאחרות”.

‏לכן Universe health הוא חלק מה־readiness של ההחלטה.

---

# ‏194. Top Candidate Age

‏גם אם המערכת Ready, Candidate יכול להיות stale.

‏State Machine לא מחליפה signal validity checks.

---

# ‏195. Entry Recheck

‏במעבר:

```text
ENTRY_INTENT → ENTRY_PENDING
```

‏נריץ שוב:

- ‏Data freshness.
- ‏Rank validity.
- ‏Risk.
- ‏Price budget.
- ‏Broker readiness.

---

# ‏196. State Machine אינה Strategy

‏היא אינה מחליטה איזו מניה טובה.

‏היא מחליטה האם המערכת נמצאת במצב שמותר לבצע את החלטת ה־Strategy.

---

# ‏197. State Machine אינה Risk Model

‏היא אוכפת את output של ה־Risk Engine ואת מצבו.

---

# ‏198. State Machine אינה Broker Adapter

‏היא צורכת canonical broker events.

---

# ‏199. State Machine היא Orchestration Contract

‏היא מחברת את כל הרכיבים בלי לתת להם לנחש זה את זה.

---

# ‏200. Anti-pattern: Happy-path-only FSM

‏אם תרשים המצבים כולל רק:

```text
FLAT → BUY → OPEN → SELL → FLAT
```

‏זו אינה Production State Machine.

---

# ‏201. Anti-pattern: מצב `ERROR` אחד

‏`ERROR` לא אומר:

- ‏מה ידוע.
- ‏מה לא ידוע.
- ‏מה מותר.
- ‏איך מתאוששים.

---

# ‏202. Anti-pattern: Catch → Reset to Ready

‏Exception אינו סיבה לעבור ל־Ready.

---

# ‏203. Anti-pattern: Local State Wins

‏אם local state חולק על Broker לגבי Position/Fill, אסור לבחור מקומי רק כי הוא “האובייקט שלנו”.

---

# ‏204. Anti-pattern: כל Disconnect גורם ל־process restart

‏Disconnect הוא Event שצריך stateful recovery.

---

# ‏205. Anti-pattern: Resume ללא Reconciliation

‏הזמן שעבר בזמן Pause/Disconnect יכול לשנות Orders, Positions ו־Market Context.

---

# ‏206. Anti-pattern: Exit תלוי ב־Scanner

‏אם Scanner תקול, Position עדיין דורש Exit management.

---

# ‏207. Anti-pattern: UI הוא האמת

‏UI יכול להיות stale.

‏הוא צריך להציג State, לא להמציא אותו.

---

# ‏208. Anti-pattern: Side effect לפני durable intent בלי recovery design

‏אם order נשלח לפני שיש durable correlation, crash יכול ליצור orphan.

---

# ‏209. Anti-pattern: Persist ואז assume submit הצליח

‏גם הצד השני מסוכן.

‏צריך model ל־unknown effects.

---

# ‏210. Anti-pattern: Infinite Recovery

‏מערכת שנתקעת לנצח ב־`RECOVERING` בלי escalation אינה באמת מתאוששת.

---

# ‏211. Best Practice: State Transition הוא Domain Event

‏מעברים משמעותיים צריכים להיות queryable.

---

# ‏212. Best Practice: Machine-readable Reason Codes

‏מאפשרים metrics ו־RCA אוטומטי.

---

# ‏213. Best Practice: Fail Closed ל־Entries

‏כאשר יש uncertainty מהותי, לא פותחים Exposure חדש.

---

# ‏214. Best Practice: Fail Operationally for Exits

‏כאשר יש Position, צריך לשמור ככל האפשר את היכולת להקטין Risk גם אם רכיבים אחרים נפלו.

---

# ‏215. Best Practice: State Snapshot בכל Decision

‏כך כל Trade ניתן לשחזור.

---

# ‏216. Best Practice: Test Restart באמצע כל State

‏לא רק Startup נקי.

---

# ‏217. Best Practice: Test Duplicate/Delayed Events

‏אלה תקלות מציאותיות במערכות distributed/event-driven.

---

# ‏218. Best Practice: Transition Table לפני Code

‏אם איננו יכולים להסביר את המעבר בטבלה, כנראה המודל לא ברור מספיק.

---

# ‏219. Best Practice: Invariants before Features

‏ה־state machinery היא תשתית Safety.

‏לא כדאי להוסיף Strategy complexity לפני שהיא אמינה.

---

# ‏220. Best Practice: Same Semantics in Replay

‏Replay צריך לעבור באותם states ככל האפשר.

---

# ‏221. Best Practice: Reason-first Debugging

‏בכל unexpected state שואלים:

```text
Which event caused it?
Which guard allowed it?
Which invariant should have detected it?
```

---

# ‏222. Best Practice: No Hidden State

‏אם behavior תלוי במשהו, הוא צריך להיות:

- ‏State.
- ‏Config.
- ‏Input.
- ‏או derived value ברור.

‏לא משתנה גלובלי נסתר.

---

# ‏223. Best Practice: Explicit Ownership

‏כל state field צריך owner יחיד.

---

# ‏224. Best Practice: Audit Operator Actions

‏Pause, Resume, Manual Cancel ו־Emergency Exit צריכים actor/time/reason.

---

# ‏225. Practitioner Insight: Production Bugs רבים הם State Bugs

‏לא תמיד האלגוריתם “טועה”.

‏לפעמים:

- ‏אירוע הגיע פעמיים.
- ‏callback הגיע באיחור.
- ‏reconnect שינה state.
- ‏partial fill לא עודכן.
- ‏timer פעל אחרי שה־state כבר השתנה.

---

# ‏226. Practitioner Insight: State Machine היא גם כלי מחקר

‏אם lifecycle מתועד היטב, אפשר להבין האם Edge אבד ב־Signal, Order או Fill.

---

# ‏227. Practitioner Insight: Unknown הוא מידע

‏`UNKNOWN` אינו כישלון עיצוב.

‏לעיתים הוא הייצוג המדויק ביותר של המציאות ברשת מבוזרת.

---

# ‏228. Practitioner Insight: Recovery הוא חלק מה־Happy Path

‏במערכת שרצה שעות וימים, disconnect/reconnect יקרה בסוף.

‏לכן Recovery אינו edge case.

---

# ‏229. Practitioner Insight: State Complexity צריכה לעקוב אחרי Risk Complexity

‏לא צריך 100 states למערכת פשוטה.

‏אבל אסור לדחוס Risk משמעותי ל־3 booleans.

---

# ‏230. Baseline State Model לרובוט שלנו

```text
SystemState:
  STARTING
  SYNCING
  READY
  DEGRADED
  PAUSED
  RECOVERING
  EXIT_ONLY
  FAULTED
  STOPPING
  STOPPED

TradingLifecycleState:
  FLAT
  ENTRY_INTENT
  ENTRY_PENDING
  PARTIALLY_FILLED
  POSITION_OPEN
  EXIT_INTENT
  EXIT_PENDING
  PARTIALLY_EXITED
  RECONCILING

BrokerState:
  DISCONNECTED
  CONNECTING
  CONNECTED_UNSYNCED
  SYNCING
  READY
  DEGRADED
  UNKNOWN

MarketDataState:
  DISCONNECTED
  CONNECTING
  WARMING_UP
  HEALTHY
  STALE
  PARTIAL
  DEGRADED
  FAILED
```

---

# ‏231. Baseline Entry Flow

```text
READY + FLAT
→ Candidate selected
→ ENTRY_INTENT
→ Pre-trade recheck
→ Risk approval
→ Submit
→ ENTRY_PENDING
→ Fill events
→ POSITION_OPEN
```

---

# ‏232. Baseline Exit Flow

```text
POSITION_OPEN
→ Exit trigger
→ EXIT_INTENT
→ Submit/modify exit
→ EXIT_PENDING
→ Fill events
→ FLAT
```

---

# ‏233. Baseline Disconnect Flow

```text
READY
→ BrokerDisconnected
→ RECOVERING
→ reconnect
→ fetch authoritative orders/positions
→ reconcile
→ validate invariants
→ READY / EXIT_ONLY / FAULTED
```

---

# ‏234. Baseline Data Failure Flow

```text
READY
→ FreshCoverageBelowThreshold
→ DEGRADED
→ block new entries
→ continue broker/position management
→ stable healthy window
→ READY
```

---

# ‏235. Baseline Pause Flow

```text
READY
→ PauseRequested
→ PAUSED
→ continue callbacks/reconciliation/position management
→ ResumeRequested
→ mini-reconciliation
→ READY
```

---

# ‏236. Baseline Unknown Order Flow

```text
ENTRY_PENDING
→ submit outcome uncertain
→ OrderState.UNKNOWN
→ block new risk
→ broker query/reconciliation
→ resolved state
```

---

# ‏237. Baseline Startup Flow

```text
STARTING
→ load durable state
→ connect providers
→ SYNCING
→ broker reconciliation
→ market-data warm-up
→ strategy/risk readiness
→ invariants pass
→ READY
```

---

# ‏238. Baseline Shutdown Flow

```text
READY/PAUSED/DEGRADED
→ StopRequested
→ STOPPING
→ execute shutdown policy
→ persist final audit state
→ STOPPED
```

---

# ‏239. Minimum Dashboard

‏ב־Production נרצה לראות לפחות:

```text
SystemState
TradingLifecycleState
BrokerState
MarketDataState
RiskState
Current position
Working orders
Fresh coverage
Last reconciliation
State age
Last transition reason
```

---

# ‏240. Minimum Alerts

‏Alerts חשובים:

```text
unexpected transition
state stuck too long
position mismatch
orphan order
unknown order state
broker disconnected with exposure
data stale with exposure
recovery timeout
state flapping
```

---

# ‏241. Acceptance Test — Clean Startup

‏המערכת אינה נכנסת ל־`READY` לפני synchronization מלא.

---

# ‏242. Acceptance Test — Restart During Entry

‏Restart בזמן `ENTRY_PENDING` אינו יוצר Entry כפול.

---

# ‏243. Acceptance Test — Partial Fill Crash

‏אחרי Restart המערכת משחזרת את הכמות שבוצעה ומנהלת אותה כ־Exposure אמיתי.

---

# ‏244. Acceptance Test — Pause

‏Pause מונע Entries חדשים אבל אינו מפסיק reconciliation או ניהול Position קיים.

---

# ‏245. Acceptance Test — Resume

‏Resume מחייב mini-reconciliation לפני חזרה ל־Ready.

---

# ‏246. Acceptance Test — Data Stale

‏Stale full-market data חוסם Entry חדש.

---

# ‏247. Acceptance Test — Broker Disconnect

‏Disconnect בזמן Position אינו גורם למערכת לחשוב שהיא Flat.

---

# ‏248. Acceptance Test — Cancel/Fill Race

‏Fill שמגיע בזמן cancel מטופל idempotently וה־Position הסופי נכון.

---

# ‏249. Acceptance Test — Duplicate Fill Event

‏אותו Fill שמתקבל שוב אינו מכפיל Position.

---

# ‏250. Acceptance Test — Unknown State

‏ב־Unknown אין הגדלת Risk עד reconciliation.

---

# ‏251. Acceptance Test — Fault Recovery

‏המערכת אינה חוזרת ל־Ready עד שכל ה־invariants הקריטיים עוברים.

---

# ‏252. Acceptance Test — Replay Determinism

‏אותו event stream מפיק אותו transition trace.

---

# ‏253. Acceptance Test — Operator Audit

‏Pause/Resume/Stop/ExitOnly נשמרים עם זמן וסיבה.

---

# ‏254. Acceptance Test — Version Boundary

‏שינוי Strategy config אינו משנה באמצע lifecycle התנהגות שאמורה להיות pinned לגרסת העסקה.

---

# ‏255. שאלות שהמערכת חייבת לדעת לענות עליהן בכל רגע

1. ‏באיזה `SystemState` אנחנו?
2. ‏האם מותר לפתוח Exposure חדש?
3. ‏האם יש Position אמיתי?
4. ‏האם יש Working Orders?
5. ‏מתי בוצע reconciliation לאחרונה?
6. ‏האם Market Data מספיק טרי לצורך Rank?
7. ‏אם המערכת תקרוס עכשיו — האם נוכל לשחזר את המצב?
8. ‏מה היה האירוע האחרון ששינה State?
9. ‏למה אנחנו לא ב־`READY`, אם איננו Ready?
10. ‏איזו פעולה מותרת כרגע להקטנת Risk?

---

# ‏256. מה צריך לזכור בעל פה

- ‏`Process alive` אינו `Ready to trade`.
- ‏Startup דורש reconciliation.
- ‏Broker truth קובע Orders/Fills/Positions.
- ‏`UNKNOWN` חוסם הגדלת Risk.
- ‏Pause אינו Shutdown.
- ‏Position management ממשיך גם כאשר Strategy/Scanner אינם בריאים.
- ‏State, Policy ו־Config הם דברים שונים.
- ‏אותו event stream צריך לייצר אותו state trace.

---

# ‏257. מה אפשר לדעת שקיים ולבדוק לפי הצורך

- ‏Hierarchical State Machines.
- ‏Event Sourcing.
- ‏Outbox/Inbox patterns.
- ‏Model-based testing.
- ‏Formal verification.
- ‏Distributed consensus patterns.

‏לא צריך ליישם הכול כדי לבנות מערכת אמינה.

---

# ‏258. תרגיל מחשבתי

‏נניח שהמערכת במצב:

```text
SystemState = READY
TradingLifecycleState = ENTRY_PENDING
BrokerState = READY
MarketDataState = HEALTHY
```

‏ואז באותה מאית שנייה:

1. ‏ה־Market Data נהיה stale.
2. ‏המשתמש לוחץ Pause.
3. ‏הברוקר מדווח Partial Fill.

‏מערכת טובה צריכה לקבל את שלושת האירועים בלי לאבד את ה־Fill, בלי לפתוח Entry נוסף, ולדעת שהכמות שבוצעה היא עכשיו Position שחייב ניהול.

---

# ‏259. הסוד המקצועי של State Machines במסחר

‏הערך הגדול ביותר אינו התרשים.

‏הערך הוא שהמערכת מפסיקה “להניח” דברים.

‏היא יודעת:

```text
what we know
what we do not know
what is allowed
what is forbidden
what evidence is required before proceeding
```

---

# ‏260. המסקנה

‏רובוט Production אמין אינו מערכת שתמיד ממשיכה לעבוד.

‏הוא מערכת שיודעת **מתי מותר להמשיך, מתי צריך להאט, מתי צריך לעצור כניסות, מתי חייבים לבצע reconciliation, ומתי אין מספיק מידע כדי להעמיד פנים שהכול תקין**.

‏עבור הרובוט שלנו זה קריטי במיוחד: כאשר ההחלטות נמשכות שניות, אין זמן לאלתר recovery אחרי שה־state כבר נשבר.

---

# ‏השלב הבא

‏בשלב 34 נלמד `Failure Recovery`: איך מתכננים התאוששות מ־process crash, ‏broker disconnect, ‏market-data outage, ‏partial state, ‏unknown order effect, ‏restart ו־network partition — ומה הופך Recovery ממנגנון retry למנגנון שמחזיר את המערכת לאמת מוכחת.