# ‏שלב 35 — `Monitoring`, ‏`Logging` ו־`Observability`: לראות מה הרובוט יודע, עושה ולמה

> ‏מטרת הפרק: לבנות שכבת Observability שמאפשרת להבין בזמן אמת ובדיעבד מה קורה בכל חלק של מערכת המסחר — Market Data, Scanner, Features, Ranking, Risk, Broker, Execution, Positions ו־Recovery — בלי לנחש ובלי להסתמך על “זה נראה תקין”.
>
> ‏העיקרון המרכזי: **מערכת Production שאי אפשר להסביר את ההתנהגות שלה בזמן תקלה אינה באמת נשלטת.** Observability טובה מאפשרת לענות במהירות על שלוש שאלות: מה קרה, למה זה קרה, ומה ה־blast radius.

---

# ‏1. מה ההבדל בין `Monitoring` ל־`Observability`

‏`Monitoring` עונה בעיקר על שאלות שכבר ידענו לשאול מראש.

‏לדוגמה:

```text
Is broker connected?
Is market-data feed fresh?
How many orders are working?
What is p95 decision latency?
```

‏`Observability` רחבה יותר.

‏היא אמורה לאפשר לחקור גם תופעה שלא הגדרנו מראש בדיוק.

‏לדוגמה:

```text
Why did Rank #1 change three times in 700ms?
Why did the strategy choose ABC but the order arrive 240ms later?
Why did one symbol become stale while the rest of the universe stayed fresh?
```

---

# ‏2. שלושת עמודי התווך

‏נהוג לחשוב על שלושה סוגי telemetry מרכזיים:

- ‏`Metrics` — מספרים מצטברים ומדידים לאורך זמן.
- ‏`Logs` — אירועים מפורטים עם הקשר.
- ‏`Traces` — מסלול של פעולה אחת דרך כמה רכיבים.

‏במערכת מסחר צריך להוסיף בפועל גם:

- ‏`Decision Records`.
- ‏`Order/Fill Ledger`.
- ‏`State Transition Journal`.
- ‏`Replay Artifacts`.

---

# ‏3. למה Logs בלבד אינם מספיקים

‏נניח שהמערכת מייצרת מיליון שורות לוג ביום.

‏זה לא אומר שאפשר לענות על:

```text
Which market-data event caused this feature change?
Which score change caused the rank flip?
Which decision created this order?
Which fill created this position?
```

‏אם אין correlation בין הישויות — יש הרבה טקסט, אבל מעט Observability.

---

# ‏4. מטרת העל: `Explainability Chain`

‏אנחנו רוצים שרשרת מלאה:

```text
Market Event
    ↓
Feature Snapshot
    ↓
Score Snapshot
    ↓
Rank Snapshot
    ↓
Decision
    ↓
Risk Decision
    ↓
Order Intent
    ↓
Broker Order
    ↓
Fill
    ↓
Position
    ↓
Exit Decision
    ↓
PnL Attribution
```

‏כל חוליה צריכה להיות מקושרת לחוליות האחרות.

---

# ‏5. מזהים מרכזיים

‏מומלץ להחזיק מזהים מפורשים כגון:

```text
run_id
session_id
decision_id
candidate_snapshot_id
order_intent_id
client_order_id
broker_order_id
execution_id
position_id
recovery_id
incident_id
```

‏לא כל מערכת חייבת בדיוק את כל השמות האלה.

‏העיקרון הוא שהקשרים יהיו יציבים וברורים.

---

# ‏6. `Correlation ID`

‏`Correlation ID` מאפשר לעקוב אחרי פעולה אחת שחצתה מספר רכיבים.

‏לדוגמה:

```text
scanner → decision → risk → execution → broker → fill
```

‏אם כל רכיב מייצר מזהה חדש בלי לקשר לקודם — החקירה הופכת קשה מאוד.

---

# ‏7. `Decision ID`

‏לרובוט שלנו כדאי שלכל החלטה משמעותית יהיה `decision_id`.

‏גם אם ההחלטה הייתה:

```text
NO_TRADE
```

‏צריך להיות אפשר להסביר למה.

---

# ‏8. למה גם `NO TRADE` צריך telemetry

‏אם אנחנו שומרים רק עסקאות שבוצעו, אנחנו מאבדים את רוב התנהגות ה־Scanner.

‏צריך לדעת:

- ‏מי היה Rank #1.
- ‏מה היה ה־Score שלו.
- ‏איזה Gate חסם אותו.
- ‏מה היה Rank #2.
- ‏מה קרה למועמד אחר כך.

---

# ‏9. ארבע שכבות של Observability

‏אפשר לחשוב על המערכת בארבע שכבות:

1. ‏Infrastructure.
2. ‏Data Pipeline.
3. ‏Trading Engine.
4. ‏Business/Trading Outcomes.

‏מערכת טובה מודדת את כולן.

---

# ‏10. Infrastructure Metrics

‏דוגמאות:

```text
CPU
Memory
GC pauses
Thread-pool saturation
Disk latency
Network latency
Queue depth
Process uptime
Restart count
```

‏אלה חשובים, אבל הם רק השכבה התחתונה.

---

# ‏11. Data Pipeline Metrics

‏כאן אנחנו מודדים את מצב ה־Market Data עצמו.

‏לדוגמה:

```text
events/sec
symbols/sec
fresh symbols
stale symbols
sequence gaps
out-of-order events
dropped events
parse errors
provider reconnects
```

---

# ‏12. Trading Engine Metrics

‏דוגמאות:

```text
scanner cycles/sec
feature compute latency
rank latency
decision latency
risk latency
order-submit latency
ack latency
fill latency
exit latency
```

---

# ‏13. Trading Outcome Metrics

‏דוגמאות:

```text
trade count
NO_TRADE count
fill rate
partial-fill rate
cancel rate
reject rate
slippage
implementation shortfall
MFE
MAE
time to first profit
time to target
net PnL
```

---

# ‏14. Golden Signals — עם התאמה למסחר

‏במערכות כלליות נפוצים רעיונות כמו:

- ‏Latency.
- ‏Traffic.
- ‏Errors.
- ‏Saturation.

‏אצלנו נוסיף גם:

- ‏Freshness.
- ‏Coverage.
- ‏Exposure.
- ‏Order uncertainty.
- ‏Position protection.

---

# ‏15. `Fresh Coverage Ratio`

‏זה אחד המדדים החשובים ביותר ל־whole-market scanner.

```text
fresh_symbols / expected_active_symbols
```

‏אם ה־ratio יורד, ה־Scanner עלול לדרג universe חלקי כאילו הוא מלא.

---

# ‏16. לא מספיק לספור Symbols

‏נרצה לדעת גם:

```text
eligible_symbols
fresh_symbols
scored_symbols
ranked_symbols
rejected_symbols
```

‏הפער בין השלבים הוא מידע תפעולי חשוב.

---

# ‏17. `Universe Funnel`

‏אפשר למדוד:

```text
raw universe
→ data valid
→ tradable
→ feature ready
→ passes filters
→ scored
→ ranked
→ candidate
→ trade ready
```

‏כל מעבר צריך Counter וסיבת דחייה.

---

# ‏18. Rejection Reasons

‏לא נסתפק ב:

```text
candidate rejected
```

‏נשמור reason codes כגון:

```text
STALE_DATA
SPREAD_TOO_WIDE
LOW_ACTIVITY
INSUFFICIENT_HISTORY
RISK_BLOCK
BROKER_NOT_READY
EDGE_TOO_SMALL
SIGNAL_EXPIRED
```

---

# ‏19. למה Reason Codes עדיפים על טקסט חופשי

‏טקסט חופשי קשה לאגרגציה.

‏Reason Code מאפשר לשאול:

```text
What percentage of NO_TRADE decisions were caused by stale data?
```

---

# ‏20. `State Transition Metrics`

‏מהשלב הקודם כבר יש לנו State Machines.

‏עכשיו נמדוד:

```text
READY → DEGRADED
DEGRADED → RECOVERING
RECOVERING → READY
READY → PAUSED
READY → EXIT_ONLY
```

---

# ‏21. זמן בכל State

‏מדד חשוב:

```text
time_in_state_seconds
```

‏כך אפשר לגלות למשל שהמערכת נמצאת 18% מה-session ב־`DEGRADED`.

---

# ‏22. Transition Reason

‏כל מעבר State צריך סיבה.

‏לדוגמה:

```text
MARKET_DATA_STALE
BROKER_DISCONNECTED
POSITION_MISMATCH
MANUAL_PAUSE
DAILY_RISK_LIMIT
RECOVERY_FAILED
```

---

# ‏23. Metric Cardinality

‏זו מלכודת חשובה.

‏אם ניצור metric עם label לכל symbol מתוך אלפי מניות, לכל `decision_id` ולכל order — cardinality עלולה להתפוצץ.

---

# ‏24. Metrics אינם Database

‏לא צריך לשים כל detail בתוך labels.

‏ב־Metrics נשמור dimensions מוגבלות.

‏את הפרטים העשירים נשמור ב־Logs/Events/Traces.

---

# ‏25. דוגמה ל־Metric טוב

```text
scanner_candidates_total{reason="passed"}
scanner_candidates_total{reason="stale_data"}
scanner_candidates_total{reason="spread_too_wide"}
```

---

# ‏26. דוגמה ל־Metric מסוכן

```text
scanner_score{symbol="...",decision_id="...",order_id="..."}
```

‏אם נוצרים מיליוני label combinations, מערכת ה־monitoring עצמה עלולה להפוך לבעיה.

---

# ‏27. Metrics ברמת Symbol

‏לפעמים כן צריך telemetry לפי symbol.

‏במקום label לכל symbol בכל metric אפשר:

- ‏לשמור Top-N בלבד.
- ‏לשמור sampling.
- ‏לשמור detailed snapshots ב־event store.
- ‏ליצור on-demand diagnostics.

---

# ‏28. `Structured Logging`

‏לא נכתוב:

```text
Something went wrong while sending order
```

‏אלא event מובנה.

```text
OrderSubmitFailed
client_order_id=...
symbol=...
side=BUY
quantity=...
reason=...
broker_state=...
```

---

# ‏29. Machine-Readable Logs

‏המטרה היא שכל log event יהיה ניתן לחיפוש לפי שדות.

‏לא רק string ארוך.

---

# ‏30. Event Name קבוע

‏לדוגמה:

```text
MarketDataGapDetected
ScannerCycleCompleted
TopCandidateChanged
DecisionCreated
RiskRejected
OrderIntentCreated
OrderSubmitted
OrderAcknowledged
OrderPartiallyFilled
OrderFilled
OrderCancelRequested
OrderCancelled
PositionOpened
ExitTriggered
RecoveryStarted
RecoveryCompleted
```

---

# ‏31. Log Levels

‏נשתמש בצורה עקבית ב:

```text
TRACE
DEBUG
INFO
WARN
ERROR
FATAL
```

‏לא כל Rank update צריך להיות `ERROR`.

---

# ‏32. `ERROR` אינו “משהו מעניין”

‏`ERROR` צריך לציין פעולה שנכשלה או invariant שנשבר.

‏אם כל דבר חשוב נכתב כ־Error, התרעות מאבדות משמעות.

---

# ‏33. `WARN`

‏מתאים למצב חריג שהמערכת עדיין יודעת לטפל בו.

‏לדוגמה:

```text
provider latency elevated
single symbol stale
partial fill taking longer than expected
```

---

# ‏34. `INFO`

‏אירועים עסקיים חשובים:

```text
state transition
trade decision
order lifecycle milestone
recovery milestone
config loaded
version started
```

---

# ‏35. `DEBUG`

‏מיועד לחקירה מפורטת.

‏ב־Production אפשר לשמור אותו selectively או להפעיל לזמן מוגבל.

---

# ‏36. `TRACE`

‏יכול לכלול פירוט ברמת event pipeline.

‏צריך להיזהר מנפח אדיר.

---

# ‏37. Dynamic Logging

‏רז מקצוע חשוב הוא היכולת להגביר logging בלי restart.

‏למשל:

```text
DEBUG for symbol ABC for 5 minutes
```

‏במקום להפעיל debug לכל 4,000 symbols.

---

# ‏38. Scoped Diagnostics

‏אפשר לסנן לפי:

- ‏symbol.
- ‏order.
- ‏decision.
- ‏component.
- ‏provider.
- ‏incident.

---

# ‏39. Log Sampling

‏אירועים בתדירות גבוהה יכולים לעבור sampling.

‏אבל אסור לעשות sampling לאירועים קריטיים כגון:

- ‏Order submit.
- ‏Fill.
- ‏Position change.
- ‏Risk block.
- ‏State transition.

---

# ‏40. Never Sample Truth Events

‏אירועים שמשנים כסף או state authoritative חייבים להיות שלמים.

---

# ‏41. Tracing

‏`Distributed Trace` מאפשר לראות פעולה אחת מקצה לקצה.

‏לדוגמה:

```text
market event
→ feature update
→ rank update
→ decision
→ risk
→ order serialization
→ network
→ broker ack
```

---

# ‏42. Trace Span

‏כל שלב יכול להיות span עם:

```text
start_time
end_time
duration
status
attributes
parent_span
```

---

# ‏43. Trading Trace

‏עבור רובוט קצר־טווח, trace יכול להיות כלי מחקרי ממש.

‏הוא מראה כמה מה־Edge נאכל לפני ה־fill.

---

# ‏44. `Latency Budget`

‏נפרק:

```text
market_event_to_receive
receive_to_feature
feature_to_rank
rank_to_decision
decision_to_risk
risk_to_submit
submit_to_ack
ack_to_fill
```

---

# ‏45. End-to-End Latency

‏המדד החשוב:

```text
market_event → executable action
```

‏ולא רק latency של פונקציה אחת.

---

# ‏46. Percentiles

‏Average latency אינו מספיק.

‏נרצה לפחות:

```text
p50
p90
p95
p99
max
```

---

# ‏47. למה p99 חשוב

‏במערכת שמבצעת מאות או אלפי מחזורים, tails קורים בפועל.

‏ה־outlier הוא לא אירוע תיאורטי.

---

# ‏48. Tail Correlation

‏נרצה לדעת האם latency גבוה מופיע יחד עם:

- ‏market bursts.
- ‏GC.
- ‏provider lag.
- ‏broker backlog.
- ‏CPU saturation.

---

# ‏49. `Queue Depth`

‏כל queue פנימי משמעותי צריך מדד עומק.

‏Queue שגדל הוא לעיתים סימן מוקדם יותר מ־CPU.

---

# ‏50. Queue Age

‏עוד יותר חשוב:

```text
age_of_oldest_item
```

‏Queue קטן עם אירוע ישן מאוד עדיין מסוכן.

---

# ‏51. Backpressure Metrics

‏נמדוד:

```text
dropped_events
coalesced_events
backpressure_activations
queue_rejections
```

---

# ‏52. Market Data Freshness

‏לכל provider נרצה metrics כמו:

```text
last_event_age
symbol_freshness_distribution
fresh_coverage_ratio
sequence_gap_count
reconnect_count
```

---

# ‏53. Freshness Distribution

‏לא מספיק לדעת average age.

‏אפשר למדוד buckets:

```text
<100ms
100-250ms
250-500ms
500ms-1s
>1s
```

‏הספים המדויקים צריכים להתאים לאסטרטגיה ולספק.

---

# ‏54. Provider Lag מול Local Lag

‏אם timestamps מאפשרים, נרצה להפריד:

```text
provider/exchange → local receive
local receive → processed
```

---

# ‏55. Clock Health

‏במערכת רגישה לזמן צריך לנטר גם clock skew.

‏אם ה־clock המקומי לא אמין, כל ניתוח latency נפגע.

---

# ‏56. Scanner Cycle Metrics

‏לדוגמה:

```text
cycle_duration
symbols_processed
features_computed
candidates_passed
rank_changes
no_trade_count
```

---

# ‏57. Rank Churn

‏מדד שימושי:

```text
rank1_changes_per_minute
```

‏אם הוא קופץ בחדות, זה יכול להעיד על regime, data issue או instability.

---

# ‏58. Rank Persistence

‏נמדוד כמה זמן Candidate נשאר Top-1.

‏זה מתחבר ישירות ל־Signal TTL.

---

# ‏59. Score Distribution

‏ננטר:

- ‏median.
- ‏percentiles.
- ‏Top-1 score.
- ‏Top-1 vs Top-2 gap.
- ‏candidate density.

---

# ‏60. Distribution Drift

‏אם כל score distribution משתנה, ייתכן:

- ‏Market regime changed.
- ‏Data semantics changed.
- ‏Feature bug.
- ‏Provider changed.

---

# ‏61. Feature Health

‏לכל Feature family נרצה:

```text
missing rate
invalid rate
zero rate
percentiles
extreme-value count
update frequency
```

---

# ‏62. Feature Staleness

‏Feature יכולה להיות מספר תקין אך מבוססת על input ישן.

‏לכן צריך provenance/freshness ולא רק value.

---

# ‏63. Feature Computation Errors

‏ננטר:

```text
NaN
Infinity
divide-by-zero
window underflow
unexpected reset
```

---

# ‏64. `Feature Version`

‏כל telemetry משמעותי צריך לשאת גרסה של feature schema/config.

---

# ‏65. Score Version

‏אותו דבר ל־Score.

‏בלי זה אי אפשר להשוות ימים בצורה אמינה.

---

# ‏66. Strategy Version

‏Decision Record צריך לכלול לפחות:

```text
strategy_version
config_version
feature_version
score_version
execution_policy_version
risk_policy_version
```

---

# ‏67. Config Hash

‏כדאי לשמור hash של config בפועל.

‏לא רק שם קובץ.

---

# ‏68. Deployment Metadata

‏בכל process startup:

```text
commit_sha
build_id
environment
host/process id
start_time
```

---

# ‏69. Decision Snapshot

‏כשנבחר Candidate, נשמור snapshot קומפקטי של הסיבות.

‏לדוגמה:

```text
rank=1
score=...
rank_gap=...
features=...
regime=...
spread=...
freshness=...
expected_net_edge=...
```

---

# ‏70. Decision Explainability

‏אנחנו רוצים לענות:

```text
Why this symbol?
Why now?
Why not #2?
Why trade instead of NO_TRADE?
```

---

# ‏71. Risk Decision Telemetry

‏Risk Engine צריך להחזיר result מובנה.

‏לדוגמה:

```text
ALLOW
REDUCE_SIZE
BLOCK
EXIT_ONLY
```

‏עם reason code.

---

# ‏72. Risk Budget Metrics

‏נמדוד:

```text
current exposure
pending exposure
daily realized PnL
daily unrealized PnL
loss streak
drawdown
risk budget remaining
```

---

# ‏73. Pending Exposure

‏Working orders חייבים להיכלל ב־observability.

‏אחרת dashboard מציג Position קטן בזמן שיש orders שעלולים להגדיל אותו.

---

# ‏74. Broker Connectivity

‏`connected=true` הוא metric חלש.

‏נרצה:

```text
session authenticated
orders query works
positions query works
account query works
last broker event age
last successful heartbeat
```

---

# ‏75. Broker Health State

‏אפשר להציג:

```text
DISCONNECTED
CONNECTING
CONNECTED_UNSYNCED
READY
DEGRADED
RECOVERING
```

---

# ‏76. Order Pipeline Metrics

```text
intents_created
risk_approved
orders_submitted
orders_acked
orders_rejected
partial_fills
full_fills
cancels
cancel_rejects
unknown_effects
```

---

# ‏77. Order Funnel

‏כמו Scanner Funnel, גם ל־orders נרצה funnel.

```text
Decision
→ Risk Approved
→ Intent
→ Submitted
→ Acked
→ Filled
```

---

# ‏78. Funnel Drop Reasons

‏כל נפילה חייבת סיבה.

---

# ‏79. `Submit-to-Ack`

‏מדד latency חשוב.

‏אם הוא עולה, ייתכן שהבעיה בברוקר, ברשת או ב־rate limits.

---

# ‏80. `Ack-to-Fill`

‏זה כבר תלוי גם בשוק ובסוג הפקודה.

‏ננתח אותו לפי execution policy.

---

# ‏81. Fill Rate

‏נחלק לפי:

- ‏order type.
- ‏urgency.
- ‏symbol liquidity bucket.
- ‏time of day.
- ‏regime.

---

# ‏82. Partial Fill Rate

‏Partial fills הם לא רק “מקרה קצה”.

‏צריך לדעת כמה הם נפוצים ומה משך הזמן עד completion/cancel.

---

# ‏83. Cancel Latency

‏נמדוד:

```text
cancel_request → cancel_confirmation
```

‏וגם האם fill הגיע בזמן החלון הזה.

---

# ‏84. Unknown Order Effect Counter

‏זה metric חירום חשוב.

‏כל עלייה בו צריכה להיות בולטת.

---

# ‏85. Position Reconciliation Metrics

```text
local_vs_broker_position_mismatch
orphan_order_count
unexpected_position_count
reconciliation_duration
```

---

# ‏86. Position Age

‏לרובוט שמחזיק שניות, Position age חריג הוא alarm חזק.

---

# ‏87. `Time to Flat`

‏מדד קריטי ל־Exit.

‏נמדוד מהחלטת יציאה עד Position=0 בפועל.

---

# ‏88. Unprotected Position Duration

‏אם strategy מצפה להגנה מסוימת, נרצה למדוד כמה זמן Position הייתה ללא מנגנון ההגנה המתוכנן.

---

# ‏89. Execution Quality

‏ננטר:

```text
slippage
implementation shortfall
effective spread
markout after fill
fill probability
time to fill
```

---

# ‏90. Side-Aware Benchmarks

‏Buy ו־Sell צריכים benchmark שמתאים לצד.

‏אי אפשר תמיד להשוות ל־Last.

---

# ‏91. Markout

‏אחרי fill אפשר למדוד מה קרה למחיר אחרי:

```text
100ms
500ms
1s
5s
10s
```

‏החלונות צריכים להתאים ל־strategy horizon.

---

# ‏92. Adverse Selection Monitor

‏אם המחיר נע בעקביות נגדנו מיד אחרי fill, ייתכן שה־execution policy סופגת adverse selection.

---

# ‏93. Entry Edge Decay

‏נמדוד את ה־expected edge:

```text
at decision
at submit
at ack
at fill
```

---

# ‏94. `Edge Lost Before Fill`

‏מדד אפשרי:

```text
expected_edge_at_decision - expected_edge_at_fill
```

---

# ‏95. Exit Observability

‏לכל exit נשמור trigger.

‏לדוגמה:

```text
TAKE_PROFIT
STOP
TIME_STOP
SIGNAL_DECAY
NO_PROGRESS
RISK_EXIT
EMERGENCY_EXIT
```

---

# ‏96. Exit Efficiency

‏נוכל להשוות realized exit ל־MFE.

‏אבל נזהר לא להפוך hindsight ליעד אוטומטי.

---

# ‏97. Recovery Metrics

‏מהשלב הקודם נרצה:

```text
recovery_count
recovery_duration
reconciliation_mismatches
safe_resume_success
safe_resume_failure
```

---

# ‏98. Recovery Phase Timing

‏נפרק:

```text
Detect
Contain
Reconcile
Rebuild
Validate
Resume
```

‏ונמדוד זמן בכל שלב.

---

# ‏99. Incident ID

‏כאשר תקלה משמעותית מתרחשת, כדאי ליצור `incident_id` שמקשר:

- ‏logs.
- ‏traces.
- ‏state transitions.
- ‏orders.
- ‏recovery events.
- ‏postmortem.

---

# ‏100. Incident Packet

‏נוכל לאסוף אוטומטית snapshot הכולל:

```text
system state
broker state
data health
working orders
positions
last decisions
last errors
recent latency percentiles
config versions
```

---

# ‏101. `Flight Recorder`

‏רז מקצוע שימושי הוא buffer בזיכרון/דיסק של האירועים האחרונים ברזולוציה גבוהה.

‏בעת incident שומרים את החלון המלא.

---

# ‏102. למה Flight Recorder עוזר

‏לא צריך לשמור TRACE מלא לנצח.

‏אפשר לשמור למשל חלון קצר מאוד בפירוט גבוה ואז persist כשמתרחשת חריגה.

---

# ‏103. Pre-Incident Context

‏התקלה עצמה פחות מעניינת בלי הדקות/שניות שלפניה.

‏לכן incident packet צריך לכלול pre-roll.

---

# ‏104. Post-Incident Context

‏לפעמים גם מה שקורה מיד אחרי התקלה חשוב.

---

# ‏105. Dashboards

‏Dashboard טוב הוא כלי החלטה, לא קיר גרפים.

---

# ‏106. Dashboard 1 — System Readiness

‏צריך לענות מהר:

```text
Can the system safely enter a new trade right now?
```

‏יציג למשל:

- ‏System State.
- ‏Broker State.
- ‏Market Data Health.
- ‏Fresh Coverage.
- ‏Risk State.
- ‏Open Positions.
- ‏Working Orders.

---

# ‏107. Dashboard 2 — Market Data

‏יציג:

- ‏events/sec.
- ‏freshness.
- ‏coverage.
- ‏stale symbols.
- ‏gaps.
- ‏reconnects.
- ‏provider lag.

---

# ‏108. Dashboard 3 — Scanner

‏יציג:

- ‏cycles/sec.
- ‏cycle duration.
- ‏candidate funnel.
- ‏Top-1 score.
- ‏rank gap.
- ‏rank churn.
- ‏NO_TRADE reasons.

---

# ‏109. Dashboard 4 — Execution

‏יציג:

- ‏submit latency.
- ‏ack latency.
- ‏fill latency.
- ‏fill rate.
- ‏partial-fill rate.
- ‏slippage.
- ‏cancel latency.

---

# ‏110. Dashboard 5 — Risk

‏יציג:

- ‏exposure.
- ‏pending exposure.
- ‏daily loss.
- ‏drawdown.
- ‏risk blocks.
- ‏kill-switch state.

---

# ‏111. Dashboard 6 — Trading Outcomes

‏יציג:

- ‏gross/net results.
- ‏MFE/MAE.
- ‏time to first profit.
- ‏time to target.
- ‏cost attribution.
- ‏execution attribution.

---

# ‏112. Dashboard 7 — Recovery

‏יציג:

- ‏current recovery state.
- ‏last incident.
- ‏reconciliation mismatches.
- ‏time since last healthy sync.

---

# ‏113. Real-Time מול Research Dashboards

‏לא כל metric צריך להיות מוצג live.

‏Research dashboards יכולים להיות כבדים יותר ולהתעדכן מאוחר יותר.

---

# ‏114. Alerting

‏Alert טוב דורש פעולה.

‏אם אין פעולה אפשרית, אולי הוא dashboard signal ולא alert.

---

# ‏115. Severity

‏אפשר להגדיר למשל:

```text
INFO
WARNING
CRITICAL
```

‏או severity model אחר.

---

# ‏116. Alert על Symptom ולא על כל Cause

‏לדוגמה, עדיף alert על:

```text
Fresh Coverage below safe threshold
```

‏מאשר 400 alerts נפרדים על symbols שהתיישנו.

---

# ‏117. Alert Aggregation

‏אם 2,000 symbols הופכים stale בגלל provider outage, צריך incident אחד ברור — לא 2,000 notifications.

---

# ‏118. Alert Deduplication

‏אותה תקלה שחוזרת כל שנייה לא צריכה להציף.

---

# ‏119. Alert Hysteresis

‏כמו ב־State Machine, גם alerts צריכים להימנע מ־flapping.

---

# ‏120. Alert Cooldown

‏אחרי התרעה אפשר להמתין לפני חזרה עליה, אם אין שינוי מהותי.

---

# ‏121. Multi-Window Alerts

‏רז מקצוע שימושי:

‏אפשר להתריע גם על spike חריף קצר וגם על degradation מתון שנמשך זמן רב.

---

# ‏122. Error Budget Concept

‏במקום לדרוש “אפס תקלות”, אפשר לחשוב על budget לתקלות מסוימות.

‏אבל בתחום money state יש invariants שלא מקבלים budget.

---

# ‏123. No Error Budget for Double Order

‏לדוגמה, duplicate order בגלל retry לא יכול להפוך ל־“מותר פעם בשבוע”.

‏זה invariant safety.

---

# ‏124. SLI

‏`Service Level Indicator` הוא המדד עצמו.

‏לדוגמה:

```text
fresh_coverage_ratio
broker_ack_latency_p99
scanner_cycle_latency_p99
```

---

# ‏125. SLO

‏`Service Level Objective` הוא היעד.

‏לדוגמה רעיונית:

```text
fresh coverage must stay above a defined safe threshold
```

‏המספר עצמו חייב להגיע ממחקר ודרישות המערכת.

---

# ‏126. Trading SLO

‏אפשר להגדיר SLO גם ל־trading pipeline:

```text
X% of decisions reach risk evaluation within Y ms
```

‏אבל X/Y צריכים להיות נגזרים מה־edge horizon, לא מספרים שרירותיים.

---

# ‏127. Burn Rate

‏אם SLO נשבר במהירות, burn rate יכול להפעיל escalation מוקדם.

---

# ‏128. Synthetic Checks

‏אפשר להריץ checks שלא מבצעים כסף אמיתי.

‏לדוגמה:

- ‏broker query.
- ‏market-data heartbeat.
- ‏instrument resolution.
- ‏paper path.

---

# ‏129. Heartbeat אינו מספיק

‏Service יכול לענות heartbeat ועדיין להיות לא כשיר למסחר.

---

# ‏130. Readiness Check

‏Readiness צריך לבדוק capabilities בפועל.

‏לדוגמה:

```text
market data fresh
broker authenticated
positions reconciled
risk engine loaded
state store healthy
```

---

# ‏131. Liveness Check

‏Liveness רק בודק האם process חי מספיק כדי להמשיך.

‏אסור לערבב אותו עם readiness.

---

# ‏132. Health Tree

‏אפשר לבנות health tree:

```text
System
├─ MarketData
│  ├─ ProviderConnection
│  ├─ Freshness
│  └─ Coverage
├─ Broker
│  ├─ Session
│  ├─ Orders
│  └─ Positions
├─ Risk
└─ StateStore
```

---

# ‏133. `DEGRADED` צריך להיות מוסבר

‏אם dashboard אומר `DEGRADED`, צריך להיות ברור:

```text
why
since when
what capability is lost
what actions remain allowed
```

---

# ‏134. High-Cardinality Events

‏Decision records, feature snapshots ו־order details מתאימים יותר ל־event/log storage מאשר metric labels.

---

# ‏135. Retention Tiers

‏לא כל telemetry צריכה אותה תקופת שמירה.

‏אפשר לחשוב על:

- ‏raw high-frequency telemetry לזמן קצר.
- ‏aggregates לזמן ארוך.
- ‏truth ledgers לזמן ארוך יותר.
- ‏incident artifacts לשמירה ייעודית.

---

# ‏136. Retention לפי ערך

‏Order/Fill/Decision records בדרך כלל חשובים יותר מעוד מיליון DEBUG lines.

---

# ‏137. Storage Budget

‏Observability עולה כסף ומשאבים.

‏נמדוד גם:

```text
log volume/day
trace volume/day
metrics cardinality
storage growth
```

---

# ‏138. Observability Overhead

‏אסור שה־telemetry תאט את ה־trading path בצורה משמעותית.

---

# ‏139. Async Export

‏בדרך כלל telemetry export צריך להיות מחוץ ל־critical path ככל האפשר.

---

# ‏140. Fail Open או Fail Closed ל־Telemetry?

‏אם exporter נפל, בדרך כלל לא רוצים לעצור execution רק כי dashboard לא קיבל metric.

‏אבל אם נכשל truth ledger קריטי — זו כבר בעיה אחרת.

---

# ‏141. Telemetry מול Durable Audit

‏אלה שני דברים שונים.

‏Metric exporter יכול לאבד packet.

‏Order/Fill ledger לא אמור להיות best-effort.

---

# ‏142. Audit Events

‏אירועים קריטיים:

```text
risk override
manual resume
kill switch
config change
strategy version change
live mode activation
```

‏צריכים audit trail ברור.

---

# ‏143. Manual Actions

‏כל פעולה ידנית צריכה:

```text
who/what initiated it
when
reason
previous state
new state
```

---

# ‏144. Secrets בלוגים

‏אסור לכתוב:

- ‏tokens.
- ‏passwords.
- ‏API secrets.
- ‏session credentials.

---

# ‏145. PII ו־Account Data

‏צריך לצמצם פרטי חשבון שאינם נדרשים לחקירה.

---

# ‏146. Redaction

‏Logger יכול לבצע redaction לשדות רגישים.

---

# ‏147. Log Injection

‏אם נתונים חיצוניים נכנסים ללוג, צריך לשמור formatting בטוח ולא לתת להם “לשבור” את מבנה האירוע.

---

# ‏148. Observability Security

‏מערכת dashboards לעיתים חושפת מידע רגיש מאוד.

‏צריך הרשאות מתאימות.

---

# ‏149. Environment Label

‏כל telemetry חייבת לדעת אם היא:

```text
REPLAY
SHADOW
PAPER
LIVE
```

---

# ‏150. אסור לערבב Paper ו־Live

‏גרף שמחבר Paper ו־Live PnL בלי הבחנה הוא מסוכן.

---

# ‏151. Environment-Specific Alerts

‏אותו event יכול להיות Warning ב־Paper ו־Critical ב־Live.

---

# ‏152. Deployment Markers

‏בכל dashboard כדאי לסמן deploy/config change.

‏כך אפשר לראות degradation שהתחיל מיד לאחר שינוי.

---

# ‏153. Before/After Deployment Comparison

‏נשווה:

- ‏latency.
- ‏error rates.
- ‏rank churn.
- ‏fill rate.
- ‏NO_TRADE rate.

---

# ‏154. `First Bad Version`

‏אם metric הידרדר, נרצה לזהות באיזו גרסה התחיל השינוי.

---

# ‏155. Config Changes הם Deployments

‏שינוי threshold יכול לשנות התנהגות לא פחות מקוד חדש.

---

# ‏156. Feature Flags

‏כל feature flag משמעותי צריך להופיע ב־telemetry/context.

---

# ‏157. Experiment Metadata

‏Champion/Challenger צריך להיות מובחן בבירור.

---

# ‏158. Shadow Telemetry

‏Shadow candidate יכול לייצר decision metrics בלי לבצע order.

---

# ‏159. Decision Impact Rate

‏נמדוד כמה פעמים Challenger היה משנה החלטה לעומת Champion.

---

# ‏160. Data Provider Comparison

‏אם משתמשים בשני feeds, נוכל למדוד:

```text
quote divergence
trade divergence
freshness divergence
missing-symbol divergence
```

---

# ‏161. Broker vs Data Provider Validation

‏לפני Order אפשר למדוד את הפער בין הנתון ששימש ל־decision לבין quote שהברוקר רואה, אם זמין ורלוונטי.

---

# ‏162. אבל לא לחסום על Noise רגיל

‏Cross-provider differences טבעיים קיימים.

‏צריך threshold/logic שמבוסס על מחקר.

---

# ‏163. Business KPI מול System KPI

‏System KPI:

```text
latency
errors
coverage
```

‏Business/Strategy KPI:

```text
net edge
fill quality
selection regret
NO_TRADE quality
```

‏שניהם חשובים.

---

# ‏164. Correlation בין System ל־Trading

‏נרצה לשאול:

```text
Does higher p99 scanner latency correlate with lower net forward return?
```

---

# ‏165. Correlation אינו Causation

‏Observability מגלה דפוסים.

‏Experiment/RCA צריכים לבדוק סיבה.

---

# ‏166. Daily Operational Review

‏בסוף session אפשר לייצר report קצר:

- ‏availability.
- ‏data health.
- ‏broker health.
- ‏recovery events.
- ‏orders/fills.
- ‏risk blocks.
- ‏notable anomalies.

---

# ‏167. Daily Trading Review

‏בנפרד:

- ‏candidate quality.
- ‏rank performance.
- ‏execution quality.
- ‏costs.
- ‏exit quality.

---

# ‏168. Weekly Reliability Review

‏נחפש מגמות:

- ‏latency drift.
- ‏error growth.
- ‏provider degradation.
- ‏retry growth.
- ‏recovery frequency.

---

# ‏169. Alert Review

‏Alerts שלא הובילו לפעולה שוב ושוב צריכים tuning או הסרה.

---

# ‏170. Alert Fatigue

‏יותר alerts אינם יותר בטיחות.

‏Alert fatigue גורם להתעלמות.

---

# ‏171. Runbooks מתוך Alert

‏כל alert משמעותי צריך לקשר ל־runbook.

---

# ‏172. Runbook Context

‏ה־alert עצמו צריך כבר להכיל:

```text
state
provider
broker
symbol if relevant
recent transition
relevant dashboard
```

---

# ‏173. Observable Recovery

‏Recovery צריך להיות visible כ־workflow.

‏לא רק log אחד בתחילה ואחד בסוף.

---

# ‏174. Recovery Progress

‏לדוגמה:

```text
RECONCILING_ORDERS
RECONCILING_POSITIONS
REBUILDING_FEATURES
VALIDATING_READINESS
```

---

# ‏175. Stuck Recovery Alert

‏אם recovery phase חורג מה־budget שלו, צריך alert.

---

# ‏176. Stuck Order Alert

‏Order Working זמן חריג צריך signal ברור.

---

# ‏177. Stuck Position Alert

‏לרובוט קצר־טווח, Position שמחזיקה מעבר לחלון חריג היא אירוע תפעולי גם אם המחיר כרגע חיובי.

---

# ‏178. Silence Monitoring

‏היעדר אירועים יכול להיות תקלה.

‏למשל:

```text
zero market events for 2 seconds during active session
```

‏הסף צריך להתאים ל־feed ולשעות המסחר.

---

# ‏179. Deadman Signals

‏רכיבים קריטיים יכולים לפרסם heartbeat עם progress ולא רק process alive.

---

# ‏180. Progress Heartbeat

‏לדוגמה:

```text
last_processed_sequence
last_scanner_cycle
last_broker_event
```

---

# ‏181. Stalled-but-Alive

‏Process יכול להיות חי אבל תקוע.

‏Progress metrics מזהים זאת.

---

# ‏182. Thread/Task Stalls

‏במערכת async נרצה לזהות:

- ‏queue לא מתרוקן.
- ‏task שלא מתקדם.
- ‏deadlock-like symptoms.
- ‏thread-pool starvation.

---

# ‏183. GC Pauses

‏ברובוט קצר־טווח, pauses חריגים יכולים להפוך ל־execution latency.

‏צריך למדוד אותם ולא רק CPU.

---

# ‏184. Allocation Rate

‏אם allocation spikes מתואמים עם latency tails, זה signal לפעולת performance.

---

# ‏185. Database/Storage Latency

‏אם state persistence נמצא ב־critical path, latency שלו חייב להיות visible.

---

# ‏186. Durable Queue Lag

‏אם יש message bus או durable queue, consumer lag חייב להיות metric.

---

# ‏187. Message Age

‏כמו queue פנימי, גם ב־bus age חשוב יותר לפעמים מה־count.

---

# ‏188. Duplicate Events

‏נמדוד duplicate rate ולא רק נדחה אותם בשקט.

---

# ‏189. Out-of-Order Rate

‏עלייה פתאומית יכולה להעיד על provider/network change.

---

# ‏190. Schema Errors

‏אם provider משנה payload/schema, parser error rate יכול להיות alert מוקדם.

---

# ‏191. Capability Drift

‏אם API capability משתנה, startup checks צריכים לחשוף זאת.

---

# ‏192. Observability Tests

‏גם telemetry צריכה tests.

---

# ‏193. Test: Decision Correlation

‏כל order שנוצר צריך להיות traceable חזרה ל־decision.

---

# ‏194. Test: Fill Correlation

‏כל fill צריך להיות traceable ל־order intent ול־position.

---

# ‏195. Test: State Transition Audit

‏כל transition משמעותי צריך reason code.

---

# ‏196. Test: No Secret Logging

‏נוסיף tests/guards שמוודאים ששדות סודיים אינם נכתבים.

---

# ‏197. Test: Metric Cardinality

‏אפשר לבדוק שאין labels בלתי־bounded שנכנסו בטעות.

---

# ‏198. Test: Alert Rule

‏נרצה לבדוק ש־fault injection מייצר alert צפוי.

---

# ‏199. Test: Dashboard Semantics

‏Dashboard צריך להשתמש ב־metric הנכון וביחידות הנכונות.

---

# ‏200. Test: Replay Observability

‏אותו Replay צריך להפיק decision trace עקבי.

---

# ‏201. Replay + Production Parity

‏אותם event names ו־decision fields צריכים להופיע ככל האפשר גם ב־Replay וגם ב־Live.

---

# ‏202. Observability as Product Feature

‏במערכת מסחר אישית רצינית, diagnostics אינם “נוסיף בסוף”.

‏הם חלק מהמערכת.

---

# ‏203. האם לשמור כל Feature לכל Symbol?

‏לא בהכרח.

‏זו יכולה להיות כמות עצומה.

‏אפשר לשמור:

- ‏Top-N.
- ‏Candidates.
- ‏Rejected-near-threshold.
- ‏periodic samples.
- ‏incident windows.

---

# ‏204. Near-Threshold Diagnostics

‏מועמד שנפל מעט מתחת לסף יכול להיות שימושי למחקר.

---

# ‏205. `Top-N Diagnostic Snapshot`

‏בכל decision cycle חשוב אפשר לשמור Top-N עם:

```text
rank
score
score components
freshness
spread
activity
regime
```

---

# ‏206. Why Not #2?

‏Snapshot כזה מאפשר לענות בדיוק מה הפריד בין #1 ל־#2.

---

# ‏207. Rank Flip Diagnostics

‏בעת שינוי Top-1, נוכל לשמור:

```text
old_top1
new_top1
score_delta
feature_deltas
new market events
```

---

# ‏208. Decision Latency מול Signal TTL

‏Dashboard צריך להציג יחס:

```text
end_to_end_decision_latency / estimated_signal_ttl
```

---

# ‏209. Latency Utilization

‏אם processing צורך חלק גדול מחיי ה־signal, זו בעיה גם אם absolute latency “נראה קטן”.

---

# ‏210. Execution Latency מול Edge Half-Life

‏אותו רעיון חל על fill.

---

# ‏211. Opportunity Cost Monitor

‏אפשר למדוד כמה פעמים מערכת הייתה עסוקה/לא מוכנה כאשר הופיע candidate איכותי.

---

# ‏212. `Scanner Healthy` אינו `Strategy Healthy`

‏Scanner יכול לרוץ מושלם טכנית אבל לא לייצר edge.

---

# ‏213. `Strategy Healthy` אינו `Execution Healthy`

‏Signals טובים יכולים להיהרס בביצוע.

---

# ‏214. Layered Health

‏לכן נפריד:

```text
DATA_HEALTH
SCANNER_HEALTH
RISK_HEALTH
EXECUTION_HEALTH
BROKER_HEALTH
SYSTEM_HEALTH
```

---

# ‏215. Overall Health הוא Derived

‏`SYSTEM_HEALTH` לא צריך להיות boolean עצמאי.

‏הוא נגזר מה־capabilities וה־health של השכבות.

---

# ‏216. Health Reason Codes

‏לדוגמה:

```text
READY
DEGRADED_DATA
DEGRADED_EXECUTION
BROKER_UNSYNCED
RISK_LOCKED
RECOVERY_ACTIVE
```

---

# ‏217. Business Invariants

‏ננטר violations כגון:

```text
position_without_known_origin
working_entry_while_exit_only
negative_remaining_quantity
multiple_conflicting_exit_orders
```

---

# ‏218. Invariant Violation = High Severity

‏Invariant שבור הוא בדרך כלל חמור יותר מ־latency spike רגיל.

---

# ‏219. Automatic Containment

‏חלק מה־alerts צריכים גם trigger אוטומטי ל־containment.

‏לדוגמה:

```text
position mismatch → block new entries
```

---

# ‏220. Alert אינו Recovery Logic

‏אבל חשוב להפריד.

‏ה־state machine/risk engine צריכים לבצע containment גם אם מערכת ההתרעות עצמה לא זמינה.

---

# ‏221. Observability Failure

‏גם monitoring system יכולה להיכשל.

‏צריך לדעת שזה קרה.

---

# ‏222. Telemetry Export Health

‏ננטר:

```text
export queue depth
export failures
dropped telemetry
last successful export
```

---

# ‏223. Local Fallback

‏אירועים קריטיים יכולים להישמר מקומית אם exporter חיצוני נפל.

---

# ‏224. Postmortem Inputs

‏Postmortem טוב צריך להגיע מראיות:

- ‏logs.
- ‏metrics.
- ‏traces.
- ‏orders/fills.
- ‏state transitions.
- ‏replay.

---

# ‏225. Timeline Reconstruction

‏מטרת telemetry היא לאפשר timeline מדויק.

---

# ‏226. `First Divergence`

‏בחקירה ננסה למצוא את הנקודה הראשונה שבה המציאות סטתה מהציפייה.

---

# ‏227. לא להתחיל מה־PnL

‏PnL שלילי הוא הסימפטום הסופי.

‏ה־first divergence יכול להיות כמה שכבות קודם.

---

# ‏228. Example Investigation

```text
Loss observed
→ exit was late
→ exit decision was on time
→ broker submit was late
→ execution queue was backed up
→ CPU was normal
→ telemetry shows provider burst caused serialization backlog
```

‏זו חקירה שימושית.

---

# ‏229. Counterfactual from Observability

‏Telemetry טובה מאפשרת אחר כך להריץ Replay:

```text
What if order-submit latency had remained at baseline?
```

---

# ‏230. RCA Feedback Loop

```text
Observation
→ Incident/RCA
→ Hypothesis
→ Controlled Experiment
→ Fix
→ Regression Test
→ New Monitor
```

---

# ‏231. Every Serious Incident Improves Observability

‏אם incident היה קשה לחקירה בגלל שחסר signal, נוסיף אותו כחלק מהתיקון.

---

# ‏232. אבל לא “לוג הכל”

‏המטרה היא signal איכותי, לא נפח אינסופי.

---

# ‏233. Practitioner Rule — Questions First

‏לפני שבונים dashboard, מנסחים את השאלות שהוא צריך לענות עליהן.

---

# ‏234. שאלות שחייבות לקבל תשובה

‏לדוגמה:

```text
Is the robot allowed to enter now?
Is the market-data universe fresh enough?
Why was there NO_TRADE?
Why did Rank #1 change?
Why was an order rejected?
Why is a position still open?
Why is execution slower than usual?
What changed after the last deployment?
```

---

# ‏235. Practitioner Rule — Context Beats Volume

‏לוג אחד עם `decision_id`, ‏version ו־reason code שווה יותר ממאה שורות טקסט ללא context.

---

# ‏236. Practitioner Rule — Percentiles Beat Averages

‏במערכת latency-sensitive, tails חשובים.

---

# ‏237. Practitioner Rule — Monitor Transitions

‏הרבה failures מתגלים דרך שינוי מגמה, לא absolute threshold.

---

# ‏238. Practitioner Rule — Silence Is Data

‏אם stream שהיה פעיל נהיה שקט — זה signal.

---

# ‏239. Practitioner Rule — `UNKNOWN` Must Be Visible

‏אם order state לא ידוע, dashboard צריך להראות זאת בולט.

---

# ‏240. Practitioner Rule — No Green Dashboard with Unknown Money State

‏אם יש Position/Order uncertainty, overall status לא יכול להיות ירוק.

---

# ‏241. Practitioner Rule — Observability Must Survive Failure

‏אירועי recovery הקריטיים צריכים להישמר גם בזמן degradation.

---

# ‏242. Practitioner Rule — Compare to Baseline

‏“p99 = 180ms” לא אומר הרבה בלי לדעת שה־baseline היה 40ms.

---

# ‏243. Baseline Profiles

‏אפשר לבנות baseline לפי:

- ‏time of day.
- ‏market regime.
- ‏provider.
- ‏execution mode.

---

# ‏244. Dynamic Thresholds

‏חלק מה־alerts יכולים להיות יחסיים ל־baseline ולא absolute בלבד.

---

# ‏245. אבל Dynamic Alerts יכולים להסתיר Drift

‏אם baseline מתעדכן אוטומטית מהר מדי, degradation איטי יכול להפוך ל“נורמלי”.

---

# ‏246. Long-Term Trend

‏לכן שומרים גם historical trend ארוך.

---

# ‏247. User-Specific Baseline Architecture

‏לרובוט שלך אפשר להתחיל בפשטות:

```text
MarketData Adapter
      ↓
Metrics + Event Journal
      ↓
Scanner / Feature / Rank
      ↓
Decision Record
      ↓
Risk Decision
      ↓
Execution Trace
      ↓
Broker Events
      ↓
Order/Fill/Position Ledger
      ↓
Dashboards + Alerts + RCA Store
```

---

# ‏248. Baseline Dashboard ראשון

‏בשלב ראשון מספיק dashboard אחד עם sections:

```text
System State
Market Data Health
Scanner Health
Top Candidates
Risk State
Broker State
Open Orders
Open Positions
Latency
Recent Alerts
```

---

# ‏249. Baseline Logs

‏נרצה structured events לפחות ל:

```text
StateTransition
DataHealthChanged
TopCandidateChanged
DecisionCreated
RiskDecision
OrderLifecycle
PositionChanged
RecoveryLifecycle
ConfigChanged
```

---

# ‏250. Baseline Metrics

‏סט מינימלי שימושי:

```text
fresh_coverage_ratio
market_data_last_event_age
scanner_cycle_p95/p99
rank1_changes_per_minute
decision_latency_p95/p99
broker_ack_latency_p95/p99
fill_latency_p95/p99
working_orders
open_positions
unknown_order_effects
reconciliation_mismatches
state_transition_count
```

---

# ‏251. Baseline Alerts

‏בתחילת הדרך נתמקד ב־safety:

```text
market data unsafe
broker unsynced
position mismatch
unknown order effect
position age abnormal
recovery stuck
risk lock
critical invariant violation
```

---

# ‏252. מה לא חייבים ביום הראשון

‏לא חייבים מיד:

- ‏מערכת traces ענקית.
- ‏עשרות dashboards.
- ‏מאות alerts.
- ‏לוג לכל tick.

‏עדיף מעט telemetry איכותי עם correlation נכון.

---

# ‏253. סדר בנייה מומלץ

```text
1. Truth ledgers
2. Structured logs
3. Core metrics
4. State/readiness dashboard
5. Safety alerts
6. Decision correlation
7. Latency traces
8. Research/strategy dashboards
9. Advanced anomaly detection
```

---

# ‏254. Checklist — Market Data

- ‏האם אני יודע כמה מה־Universe באמת fresh?
- ‏האם gaps ו־out-of-order events נמדדים?
- ‏האם freshness נמדדת לפי symbol ולא רק connection?
- ‏האם provider reconnect נראה ב־dashboard?
- ‏האם data degradation יכול לחסום entry?

---

# ‏255. Checklist — Scanner

- ‏האם cycle latency נמדדת?
- ‏האם candidate funnel visible?
- ‏האם Rank #1, gap ו־churn נשמרים?
- ‏האם לכל `NO_TRADE` יש reason?
- ‏האם אפשר להסביר למה #1 ניצח את #2?

---

# ‏256. Checklist — Risk

- ‏האם כל block/reduction מקבלים reason code?
- ‏האם pending exposure visible?
- ‏האם risk state visible?
- ‏האם kill switch / exit-only actions audited?

---

# ‏257. Checklist — Broker/Execution

- ‏האם Order Intent מקושר ל־Decision?
- ‏האם Submit/Ack/Fill latencies נמדדות?
- ‏האם partial fills ו־cancel races visible?
- ‏האם unknown effect מקבל alert?
- ‏האם local/broker mismatch נמדד?

---

# ‏258. Checklist — Positions

- ‏האם כל Position מקושרת ל־fills?
- ‏האם age נמדד?
- ‏האם time-to-flat נמדד?
- ‏האם unprotected duration נמדד אם רלוונטי?
- ‏האם orphan position גורמת containment?

---

# ‏259. Checklist — Recovery

- ‏האם recovery phases visible?
- ‏האם reconciliation duration נמדד?
- ‏האם Resume דורש explicit validation?
- ‏האם recovery failure יוצר incident?

---

# ‏260. Checklist — Security

- ‏אין secrets בלוגים.
- ‏אין tokens ב־trace attributes.
- ‏יש redaction.
- ‏גישה ל־dashboards מוגבלת.
- ‏manual actions audited.

---

# ‏261. Checklist — Operability

- ‏יש runbook לכל alert קריטי.
- ‏יש דרך להעלות logging נקודתית.
- ‏יש incident packet.
- ‏יש flight recorder או חלופה.
- ‏יש retention policy.

---

# ‏262. Checklist — Research Feedback

- ‏אפשר לקשר trade outcome ל־decision snapshot.
- ‏אפשר להשוות rank at decision מול rank at fill.
- ‏אפשר לנתח edge decay.
- ‏אפשר לבצע RCA על failures.
- ‏אפשר להפעיל Replay על incident.

---

# ‏263. Anti-Pattern — “יש לנו Grafana אז יש Observability”

‏כלי visualization אינו מבטיח שהמידע הנכון קיים.

---

# ‏264. Anti-Pattern — Log Everything

‏יוצר noise, storage cost וחקירה קשה.

---

# ‏265. Anti-Pattern — Only Errors

‏בלי context של state ו־decisions, error לבדו לא מספר את הסיפור.

---

# ‏266. Anti-Pattern — Only Infrastructure

‏CPU ירוק לא אומר שה־Scanner נכון.

---

# ‏267. Anti-Pattern — Only PnL

‏PnL הוא lagging indicator.

---

# ‏268. Anti-Pattern — Average Latency

‏מסתיר tails.

---

# ‏269. Anti-Pattern — One Global `isHealthy`

‏מסתיר degraded capabilities.

---

# ‏270. Anti-Pattern — Alerts without Runbook

‏יוצרים רעש ולא פעולה.

---

# ‏271. Anti-Pattern — High-Cardinality Labels

‏יכול להפיל את monitoring stack עצמו.

---

# ‏272. Anti-Pattern — Missing Version Context

‏אי אפשר לדעת איזו Strategy יצרה את הנתון.

---

# ‏273. Anti-Pattern — Losing `NO_TRADE`

‏גורם ל־selection bias בחקירה.

---

# ‏274. Anti-Pattern — Silent Data Degradation

‏ה־Scanner ממשיך לפעול על universe חלקי בלי flag.

---

# ‏275. Anti-Pattern — Green while Unsynced

‏אם broker reconciliation לא הושלם, readiness לא יכולה להיות ירוקה.

---

# ‏276. Anti-Pattern — Telemetry in Critical Path

‏מערכת logging איטית לא אמורה לעכב order submit.

---

# ‏277. Anti-Pattern — Dashboard without Decision Question

‏גרף שאין ממנו פעולה או חקירה הוא לעיתים decoration.

---

# ‏278. המבחן האמיתי

‏Observability טובה צריכה לאפשר לנו לקחת אירוע אחד ולענות:

```text
What did the system know?
What did it decide?
Why did it decide that?
What was allowed by risk?
What was sent?
What did the broker do?
What changed while the order was working?
What did the position do?
Why did we exit?
Where was edge lost?
```

---

# ‏279. מבחן שני — לפני שהכסף נפגע

‏השאלה אינה רק האם אנחנו מסוגלים להסביר הפסד אחרי שהוא קרה.

‏מערכת טובה צריכה לזהות degradation מוקדם מספיק כדי לעצור כניסות חדשות או לעבור ל־`EXIT_ONLY` לפני שנגרם אירוע גדול יותר.

---

# ‏280. העיקרון המסכם

> ‏**Observability אינה אוסף גרפים. היא היכולת להפוך כל החלטה, כל Order, כל Fill וכל תקלה לשרשרת ראיות שניתן לחקור, למדוד ולשחזר.**

‏עבור הרובוט שלך זה קריטי במיוחד בגלל horizon קצר: אם ה־Edge חי שניות, גם data lag קטן, queue קצר או broker delay יכולים לשנות את התוצאה. לכן Monitoring צריך לעקוב לא רק אחרי “האם המערכת עובדת”, אלא אחרי **האם היא עדיין מהירה, מסונכרנת וראויה למסחר ביחס ל־Edge שהיא מנסה לנצל**.

---

# ‏Checkpoint לימודי

‏אחרי שלב זה אנחנו יודעים כיצד להפוך את כל מה שבנינו עד עכשיו למערכת נצפית:

```text
Market Data
→ Features
→ Ranking
→ Decision
→ Risk
→ Execution
→ Broker
→ Position
→ Exit
→ Recovery
```

‏בשלב הבא נעבור ל־**Kill Switches ו־Safety Controls**: מנגנונים שמפסיקים כניסות חדשות, מבטלים Orders, עוברים ל־`EXIT_ONLY`, מגבילים נזק ומאפשרים התערבות בטוחה כשה־Observability אומרת שמשהו אינו תקין.