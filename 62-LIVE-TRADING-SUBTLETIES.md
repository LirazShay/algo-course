# ‏שלב 62 — `Live Trading Subtleties`: כשהמערכת פוגשת כסף אמיתי

> ‏מטרת הפרק: להבין את שכבת ה־Live שבה Strategy שכבר עברה Research, Backtest, Replay ו־Paper פוגשת Market Data אמיתי, Broker אמיתי, latencies אמיתיים, fills אמיתיים, operational state אמיתי וכסף אמיתי. נלמד למדוד ולבודד `prediction drift`, ‏`data drift`, ‏`execution drift`, ‏`latency drift`, ‏`cost drift` ו־`operational drift`, לזהות פערי Backtest/Paper/Live ולנהל מעבר הדרגתי שמייצר Evidence במקום ביטחון מדומה.
>
> ‏העיקרון המרכזי: **Live אינו “Backtest ששולח Orders”. זו סביבת מדידה חדשה שבה כל boundary חיצוני יכול לשנות את התוצאה.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. למה Live הוא שלב מחקר בפני עצמו

‏ב־Research אנחנו שואלים:

```text
Does the signal predict something useful?
```

‏ב־Backtest אנחנו שואלים:

```text
Could the strategy have captured that prediction under modeled execution?
```

‏ב־Paper/Shadow אנחנו שואלים:

```text
Does the live system detect and decide correctly under current market conditions?
```

‏ב־Live אנחנו מוסיפים שאלה חדשה:

```text
Does the entire real system preserve enough edge after actual market-data, broker, routing, fill, latency, cost and operational effects?
```

‏זו שאלה שונה.

---

# ‏2. ארבע שכבות אמת שונות

‏צריך להפריד בין:

```text
Research Truth
Simulation Truth
Local System Truth
Broker / Market Truth
```

‏אסור להניח שאחת מהן זהה לאחרת.

---

# ‏3. Local Truth אינו Broker Truth

‏המערכת המקומית יכולה לחשוב:

```text
Order = Canceled
Position = 0
```

‏כאשר בפועל אצל הברוקר:

```text
Order partially filled during cancel race
Position = 37 shares
```

‏לכן Broker reconciliation אינו optional.

---

# ‏4. `Sent` אינו `Accepted`

‏שליחת request מוצלחת ברשת לא אומרת שהברוקר קיבל את ה־Order.

‏צריך להבדיל:

```text
IntentCreated
SendAttempted
TransportSucceeded
BrokerAccepted
Working
PartiallyFilled
Filled
Canceled
Rejected
UnknownEffect
```

---

# ‏5. `ACK` אינו Fill

‏Broker acknowledgement יכול רק לומר שהבקשה התקבלה לעיבוד.

‏הוא אינו אומר:

- ‏שה־Order הגיע ל־Venue.
- ‏שהוא קיבל queue priority מסוים.
- ‏שהוא fillable.
- ‏שהוא מולא.
- ‏שה־Execution Price עדיין מתאים ל־Edge.

---

# ‏6. Fill Report יכול להגיע מאוחר

‏ב־Live ייתכן שה־Fill התרחש בשוק לפני שהמערכת שלנו ידעה עליו.

‏לכן חשוב לשמור:

```text
exchange/venue event time when available
broker event time
local receive time
processing time
```

---

# ‏7. Partial Fill הוא מצב רגיל

‏אסור לבנות State Machine שבה יש רק:

```text
Open
Filled
Canceled
```

‏בפועל:

```text
0 / 100
17 / 100
42 / 100
42 / 100 + cancel pending
57 / 100 + cancel accepted later
```

‏יכולים להיות מצבים לגיטימיים.

---

# ‏8. Exposure צריך לכלול גם Pending

‏Risk אמיתי הוא לא רק Position שכבר מולא.

‏צריך לחשוב על:

```text
CurrentPosition
+ PotentialRemainingEntryFill
- PotentialRemainingExitFill
```

‏בהתאם למבנה הפקודות.

---

# ‏9. `UNKNOWN_EFFECT` הוא מצב עסקי

‏אם connection נפל אחרי send ולפני confirmation:

```text
Did the broker receive it?
Did it route?
Did it fill?
```

‏התשובה יכולה להיות:

```text
UNKNOWN
```

‏אסור לפתור זאת ב־retry עיוור.

---

# ‏10. Reconciliation לפני Retry

‏כאשר side effect חיצוני אינו ידוע:

```text
query open orders
query executions
query positions
match stable IDs
reconcile
then decide
```

‏זה בדרך כלל בטוח יותר מ־send again.

---

# ‏11. Live צריך Stable IDs

‏לכל Trade Intent רצוי לשמור לפחות:

```text
DecisionId
IntentId
ClientOrderId
BrokerOrderId
ExecutionId
PositionEpisodeId
StrategyVersion
```

---

# ‏12. Position Episode

‏עסקה קצרה עדיף לנתח כ־Episode מלא:

```text
Candidate selected
→ Entry intent
→ Entry fills
→ Position open
→ Exit trigger
→ Exit intent
→ Exit fills
→ Flat
```

‏ולא כאוסף Orders מנותק.

---

# ‏13. `Flat` חייב להיות מוכח

‏Flat אינו:

```text
we sent a sell
```

‏Flat הוא מצב שניתן לאמת מול Broker Truth.

---

# ‏14. Backtest-to-Live Gap צריך פירוק

‏אם Live גרוע מ־Backtest, לא מתחילים מהמשפט:

```text
The strategy stopped working.
```

‏קודם מפרקים את הפער.

---

# ‏15. Attribution Stack

‏אפשר לפרק Live degradation ל:

```text
Prediction Gap
Data Gap
Ranking Gap
Decision Gap
Latency Gap
Execution Gap
Cost Gap
Risk/Size Gap
Operational Gap
```

---

# ‏16. Prediction Gap

‏האם candidates שבחרנו באמת המשיכו כפי שה־Research חזה?

‏אם לא — ייתכן שהבעיה ב־Signal/Regime ולא ב־Execution.

---

# ‏17. Data Gap

‏האם ה־Live feed שונה מה־historical dataset מבחינת:

- ‏coverage.
- ‏latency.
- ‏conditions.
- ‏aggregation.
- ‏missing events.
- ‏corrections.
- ‏quote semantics.

---

# ‏18. Ranking Gap

‏האם אותו market state שהיה אמור לייצר Rank #1 אכן יצר אותו ב־Live?

‏אם לא, צריך לבדוק:

```text
feature parity
freshness
ordering
timing
normalization
universe coverage
```

---

# ‏19. Decision Gap

‏ייתכן שה־Scanner היה נכון, אבל Decision Gate חסם או איחר.

‏למשל:

```text
candidate was #1
but freshness gate waited
then signal decayed
```

---

# ‏20. Latency Gap

‏ה־Backtest אולי השתמש ב־80ms.

‏ב־Live ייתכן:

```text
p50 = 75ms
p95 = 220ms
p99 = 900ms
```

‏וה־p99 קורה דווקא בזמן bursts.

---

# ‏21. Execution Gap

‏המודל צפה Fill.

‏Live קיבל:

```text
no fill
partial fill
worse price
late fill
toxic fill
```

---

# ‏22. Cost Gap

‏צריך להשוות:

```text
modeled spread
actual spread paid
modeled slippage
actual slippage
modeled fees
actual fees
modeled impact
actual impact
```

---

# ‏23. Operational Gap

‏פער יכול להגיע בכלל מ:

- ‏reconnect.
- ‏wrong config.
- ‏stale deployment.
- ‏clock drift.
- ‏logging stall.
- ‏disk pressure.
- ‏duplicate process.
- ‏wrong account.

---

# ‏24. Paper אינו Live

‏Paper יכול להיות שימושי מאוד ל־System Behavior.

‏אבל הוא לא בהכרח משחזר במדויק:

- ‏queue.
- ‏venue routing.
- ‏fill priority.
- ‏hidden liquidity.
- ‏partial fill dynamics.
- ‏real fees.
- ‏real adverse selection.

---

# ‏25. Shadow Mode חשוב במיוחד

‏ב־Shadow:

```text
make full decision
record intended order
send nothing
observe what happened
```

‏כך אפשר לבדוק Prediction/Ranking/Decision בלי execution risk.

---

# ‏26. Shadow מול Live Side-by-Side

‏כאשר עוברים ל־Small Live, כדאי להשאיר Shadow reference במקביל.

‏כך ניתן להשוות:

```text
WouldHaveDone
vs
ActuallyDid
```

---

# ‏27. `Decision Twin`

‏לכל Live Trade אפשר לשמור twin מחקרי:

```text
same candidate
theoretical entry
actual entry
theoretical exit
actual exit
```

‏כך קל לפרק Edge Loss.

---

# ‏28. Arrival Price

‏אחד ה־benchmarks החשובים הוא המחיר כאשר החלטנו לפעול.

‏לא רק מחיר כאשר Fill הגיע.

---

# ‏29. Decision Price

‏אפשר לשמור גם:

```text
MidAtDecision
BidAtDecision
AskAtDecision
MicropriceAtDecision
```

‏בהתאם ל־data הזמין.

---

# ‏30. Submit Price Context

‏ב־submit יש לשמור snapshot נוסף.

‏כך אפשר להפריד:

```text
signal decay before submit
vs
execution after submit
```

---

# ‏31. Fill Context

‏בעת Fill רצוי לשמור:

```text
fill price
bid/ask around fill
spread
market state
signal age
rank age
remaining edge estimate
```

---

# ‏32. Post-Fill Markout

‏כמו בפרק Adverse Selection:

```text
Markout +100ms
+250ms
+500ms
+1s
+2s
+5s
```

‏כאשר data resolution מאפשר.

---

# ‏33. Markout חשוב יותר מ־Fill Rate לבדו

‏Fill rate גבוה יכול להיות סימן טוב.

‏אבל הוא יכול גם לומר:

```text
we get filled exactly when the market is moving against us
```

---

# ‏34. No-Fill Samples חשובים

‏צריך לשמור גם Orders שלא מולאו.

‏אחרת אי אפשר למדוד:

```text
MissedOpportunity
```

---

# ‏35. Rejected Orders הם Data

‏Reject אינו רק תקלה.

‏הוא יכול לחשוף:

- ‏invalid parameters.
- ‏capability mismatch.
- ‏price-band issue.
- ‏account restriction.
- ‏session rule.
- ‏quantity rule.

---

# ‏36. Reject Taxonomy

‏כל reject צריך Reason Code פנימי.

‏לא רק raw broker message.

---

# ‏37. Broker Messages משתנים

‏אין לבנות business logic על substring פריך כאשר אפשר להימנע מכך.

---

# ‏38. Capability Discovery

‏מערכת Live צריכה לדעת מה באמת נתמך בסביבה הנוכחית.

‏לא מה שהקוד “חושב” שנתמך.

---

# ‏39. Feature Flags ל־Execution

‏יכולות מתקדמות עדיף לקדם בהדרגה:

```text
Disabled
Shadow
Small Live
Expanded Live
```

---

# ‏40. Capital Ramp הוא Experiment

‏לא עוברים מ־Paper ישירות ל־Full Size.

‏המטרה של Small Live היא למדוד את הפער בין simulation למציאות.

---

# ‏41. Ramp לפי Evidence

‏הגדלת size צריכה להיות קשורה למדדים.

‏לא רק ל־“עברו כמה ימים”.

---

# ‏42. Example Promotion Criteria

```text
reconciliation clean
no duplicate orders
no unknown exposure
latency within budget
execution slippage within envelope
post-fill toxicity acceptable
strategy metrics consistent with expectation
```

---

# ‏43. Stop Ramp Conditions

‏אם אחד מהדברים הבאים מחמיר materially:

```text
unknown-effect rate
position mismatch
slippage
latency tail
reject rate
data quality
post-fill markout
```

‏עוצרים הגדלה ובודקים RCA.

---

# ‏44. Live Drift אינו רק Strategy Drift

‏נגדיר לפחות:

```text
PredictionDrift
DataDrift
FeatureDrift
RankDrift
ExecutionDrift
LatencyDrift
CostDrift
OperationalDrift
```

---

# ‏45. Prediction Drift

‏הקשר בין Score לבין future outcome משתנה.

---

# ‏46. Feature Drift

‏distribution של Feature משתנה.

‏למשל:

```text
trade rate
spread bps
imbalance
volatility
```

---

# ‏47. Rank Drift

‏Score distribution דומה, אבל Top candidates מתנהגים אחרת.

---

# ‏48. Execution Drift

‏אותו tactic מייצר Fill Quality שונה.

---

# ‏49. Latency Drift

‏אותו code path נהיה איטי יותר בגלל:

- ‏provider.
- ‏network.
- ‏broker.
- ‏load.
- ‏GC.
- ‏storage.
- ‏deployment.

---

# ‏50. Cost Drift

‏Spread/fees/slippage/impact משתנים לאורך זמן.

---

# ‏51. Operational Drift

‏מערכת production משתנה גם בלי שינוי Strategy:

```text
OS updates
runtime updates
config changes
infrastructure changes
provider changes
broker changes
```

---

# ‏52. Version Everything

‏לכל Live decision צריך לדעת:

```text
strategy version
feature version
ranking version
veto version
execution policy version
risk config version
broker adapter version
market data parser version
```

---

# ‏53. Config הוא Code מבחינת Risk

‏שינוי threshold יכול לשנות התנהגות יותר משינוי source code.

‏לכן config צריך versioning ו־audit.

---

# ‏54. Runtime Overrides

‏אם operator משנה threshold בזמן Live, השינוי חייב להירשם עם:

```text
who
what
when
why
old value
new value
```

---

# ‏55. Wrong Environment Risk

‏צריך להקשות מאוד על מצב שבו binary שמיועד ל־Paper שולח ל־Live.

---

# ‏56. Environment Identity

‏מומלץ שהמערכת תציג ותתעד בבירור:

```text
ENV = LIVE
ACCOUNT = ...
EXECUTION_ENABLED = TRUE
```

‏בלי להסתמך על צבע UI בלבד.

---

# ‏57. Startup Readiness

‏`ProcessStarted` אינו `ReadyToTrade`.

---

# ‏58. Startup Gate

‏לפני new risk צריך לאמת לפחות:

```text
market data connected
broker connected
account verified
positions reconciled
open orders reconciled
clock sane
config loaded
strategy version known
risk limits loaded
kill switch operational
```

---

# ‏59. Cold Start

‏ב־startup ייתכן שאין מספיק history ל־Features.

---

# ‏60. Warmup State

‏לכל Feature כדאי לדעת:

```text
NOT_READY
WARMING
READY
```

---

# ‏61. Cold Candidate Risk

‏אין לתת Rank גבוה ל־symbol רק משום שחסרים לו מספיק historical observations.

---

# ‏62. Reconnect אינו Startup רגיל

‏ב־Reconnect קיימים Orders/Positions קיימים.

‏לכן semantics שונים.

---

# ‏63. Reconnect Sequence

```text
freeze new entries
restore connectivity
query broker truth
reconcile positions
reconcile open orders
restore market-data generation
validate freshness
resume only after readiness
```

---

# ‏64. Market Data Generation

‏לאחר reconnect כדאי לסמן generation חדש.

‏Signals מהדור הקודם עלולים להיות stale.

---

# ‏65. Broker Session Generation

‏גם broker session יכול לקבל generation/epoch.

‏כך אפשר לזהות callbacks ישנים.

---

# ‏66. Stale Callback

‏Event שמגיע מאוחר מסשן ישן לא חייב להיות תקף להחלטה חדשה.

---

# ‏67. Duplicate Callback

‏Callbacks יכולים להיות repeated.

‏Consumers צריכים להיות idempotent.

---

# ‏68. Event Ordering

‏אין להניח שכל broker event מגיע בדיוק בסדר business-state הנוח לנו.

---

# ‏69. Snapshot + Stream

‏כאשר API מספק snapshot ו־stream, צריך להגדיר מי authoritative ובאיזה שלב.

---

# ‏70. Reconciliation Is a State Machine

‏לא רק method בשם `Sync()`.

---

# ‏71. Position Mismatch

‏אם:

```text
LocalPosition != BrokerPosition
```

‏זה Incident עד שיוכח אחרת.

---

# ‏72. Open Order Mismatch

‏אותו עיקרון חל על working orders.

---

# ‏73. Orphan Broker Order

‏Order שקיים אצל הברוקר ואין לו owner מקומי ברור דורש טיפול מפורש.

---

# ‏74. Orphan Local Intent

‏Intent מקומי ללא evidence אצל הברוקר דורש reconciliation.

---

# ‏75. Recovery Priority

‏ב־recovery סדר עדיפויות טוב הוא בדרך כלל:

```text
know exposure
control exposure
restore exits/cancels
then consider new entries
```

---

# ‏76. Exit Path מקבל עדיפות

‏במערכת short-horizon, Position פתוח יכול לדרוש תגובה בזמן שה־Scanner עמוס.

‏לכן Exit monitoring לא צריך להיות תלוי בסריקת כל ה־Universe.

---

# ‏77. Dedicated Position Monitor

‏Position פעיל צריך לקבל:

- ‏fresh market data.
- ‏low-latency path.
- ‏priority scheduling.
- ‏independent health checks.

---

# ‏78. Exit Trigger אינו Exit Fill

‏צריך למדוד:

```text
ExitTriggerTime
ExitDecisionTime
ExitSubmitTime
ExitAckTime
ExitFillTime
```

---

# ‏79. `TimeToFlat`

‏אחד המדדים החשובים ביותר לרובוט שלנו.

```text
TimeToFlat = FinalExitFillTime - ExitTriggerTime
```

---

# ‏80. Exit Giveback

‏צריך למדוד כמה Edge אבד בין trigger לבין Flat.

---

# ‏81. Exit Liquidity יכול להיות שונה מ־Entry Liquidity

‏במיוחד אחרי move מהיר.

---

# ‏82. Entry Success אינו Trade Success

‏Fill טוב בכניסה לא עוזר אם Exit אינו executable.

---

# ‏83. Exit Capacity

‏Capacity צריך להימדד גם ביציאה, לא רק בכניסה.

---

# ‏84. Fast Market Correlation

‏הבעיה הכי קשה היא שהכול יכול להחמיר יחד:

```text
more signals
more feed traffic
wider spreads
higher latency
worse fills
lower exit liquidity
```

---

# ‏85. Independence Assumption מסוכנת

‏אי אפשר תמיד למדל latency, spread ו־slippage כמשתנים בלתי תלויים.

---

# ‏86. Conditional Metrics

‏צריך למדוד metrics לפי:

```text
volatility bucket
spread bucket
trade-rate bucket
market regime
session phase
signal strength
```

---

# ‏87. Live Baseline

‏לפני optimization מורכב, צריך baseline פשוט שאפשר להסביר.

---

# ‏88. Complexity Hides Attribution

‏אם בזמן ההשקה מפעילים בבת אחת:

```text
new score
new veto engine
new routing
new order tactic
new exit logic
```

‏קשה לדעת מה עבד ומה נשבר.

---

# ‏89. Controlled Promotion

‏קדם שינוי אחד או קבוצה קוהרנטית בכל פעם כאשר אפשר.

---

# ‏90. Champion / Challenger ב־Live

‏Challenger יכול לרוץ:

```text
Shadow only
Decision only
Small capital
```

‏לפני promotion מלא.

---

# ‏91. Decision Impact Rate

‏שאל:

```text
How often would this change alter the actual TRADE / NO TRADE / candidate / order decision?
```

‏Feature שמשנה metric אבל כמעט אף פעם לא decision אולי פחות חשוב ממה שנראה.

---

# ‏92. Economic Impact Rate

‏עדיף גם לבדוק:

```text
When decision changed, did net outcome improve?
```

---

# ‏93. Shadow Logging צריך להיות זהה ככל האפשר

‏אם Shadow path משתמש בקוד אחר לגמרי מ־Live path, ההשוואה חלשה.

---

# ‏94. Shared Decision Core

‏רצוי ש־Research/Replay/Shadow/Live ישתפו business logic מרכזי ככל האפשר.

---

# ‏95. Side-Effect Boundary

‏ההבדל בין Shadow ל־Live רצוי להיות בעיקר ב־Execution boundary.

---

# ‏96. Live-only State

‏עם זאת, Live חייב לנהל state שלא קיים ב־Backtest פשוט:

- ‏connection state.
- ‏session generation.
- ‏pending broker effects.
- ‏manual intervention.
- ‏real account state.

---

# ‏97. Manual Intervention הוא Event

‏אם אדם canceled order ידנית או סגר Position, זה חייב להיכנס ל־journal.

---

# ‏98. Manual Action Ownership

‏המערכת צריכה לדעת להבדיל:

```text
strategy-generated
operator-generated
broker-generated
external/unknown
```

---

# ‏99. Manual/Algo Race

‏Operator ו־algo יכולים לפעול על אותו Position במקביל.

‏צריך policy ברור.

---

# ‏100. Single Writer Principle

‏במידת האפשר, בעלות אחת על mutation של trading state מפחיתה races.

---

# ‏101. Split Brain

‏שני instances שחושבים שהם Active יכולים ליצור Orders כפולים.

---

# ‏102. Fencing

‏Epoch/fencing token יכול לעזור למנוע process ישן מלהמשיך לפעול אחרי failover.

---

# ‏103. Heartbeat אינו מספיק

‏Process יכול להיות alive אבל stale.

‏צריך readiness המבוסס על freshness ו־broker truth.

---

# ‏104. Trading Readiness

‏Readiness טובה שואלת:

```text
Can this instance safely create new exposure right now?
```

---

# ‏105. Exit Readiness

‏נפרד מ־Entry Readiness.

‏ייתכן שהמערכת לא מוכנה ליצור risk חדש אבל חייבת עדיין לדעת לצמצם risk קיים.

---

# ‏106. Degraded Mode

‏אפשר להגדיר:

```text
FULL
NO_NEW_ENTRIES
EXIT_ONLY
CANCEL_ONLY
HALTED
```

---

# ‏107. Fail Closed for New Risk

‏כאשר state קריטי אינו ידוע, ברירת מחדל בטוחה היא בדרך כלל לא ליצור exposure חדש.

---

# ‏108. Unknown Data Quality

‏Data feed מחובר אך stale אינו equivalent ל־healthy.

---

# ‏109. Freshness Gate

‏לפני Entry צריך לבדוק freshness של fields קריטיים.

---

# ‏110. Fresh Coverage

‏בסריקה רחבה צריך גם coverage ברמת Universe.

---

# ‏111. Stale Winner

‏Rank #1 על symbol stale יכול להיות artifact.

---

# ‏112. Pre-Submit Revalidation

‏לפני submit בדוק מחדש לפחות:

```text
candidate still valid
signal not expired
vetoes still clear
market data fresh
spread acceptable
execution budget positive
risk state valid
```

---

# ‏113. Submit-time Evidence

‏שמור למה ה־Order עדיין היה מוצדק בזמן submit.

---

# ‏114. Fill-time Evidence

‏שמור מה השתנה עד fill.

---

# ‏115. Edge Decay Attribution

‏אפשר לפרק:

```text
EdgeAtDetection
EdgeAtDecision
EdgeAtSubmit
EdgeAtFill
EdgeAtExitTrigger
EdgeAtFlat
```

---

# ‏116. `NetEdgeRetained`

‏מדד שימושי:

```text
NetEdgeRetained = RealizedNetOutcome / PredictedExecutableEdge
```

‏כאשר denominator מוגדר באופן עקבי.

---

# ‏117. Live Edge Funnel

```text
GrossPrediction
→ ExecutablePrediction
→ EdgeAfterLatency
→ EdgeAfterEntryExecution
→ EdgeAfterExitExecution
→ NetRealized
```

---

# ‏118. Funnel Leakage

‏במקום רק PnL, שאל איפה ה־Edge נעלם.

---

# ‏119. Good Prediction, Bad Execution

‏אם candidate עלה כצפוי אבל Fill היה רע — זו בעיית Execution.

---

# ‏120. Bad Prediction, Good Execution

‏Fill מצוין על Trade לא נכון אינו הצלחה.

---

# ‏121. Good Entry, Bad Exit

‏חשוב במיוחד לרובוט שלנו.

---

# ‏122. No Trade Can Be Correct

‏אם candidate היה טוב אבל execution economics היו שליליים, `NO TRADE` יכול להיות decision נכון.

---

# ‏123. False Negative

‏עם זאת צריך למדוד כמה opportunities טובות פסלנו.

---

# ‏124. Veto Live Calibration

‏מנוע 60A צריך לקבל Live metrics:

```text
veto count
false-veto estimate
avoided-loss estimate
opportunity cost
reason-code distribution
```

---

# ‏125. Cooldown Calibration

‏Cooldown ארוך מדי יכול לפספס recovery אמיתי.

---

# ‏126. Negative Memory Drift

‏Anti-signal שעבד בתקופה אחת יכול לאבד ערך.

---

# ‏127. Live Label Delay

‏חלק מה־labels זמינים רק לאחר זמן.

‏לכן monitoring מיידי ו־research evaluation מאוחר יותר אינם אותו דבר.

---

# ‏128. Immediate Operational Labels

‏אפשר לדעת מיד:

```text
reject
fill
latency
position mismatch
unknown effect
```

---

# ‏129. Delayed Economic Labels

‏למשל:

```text
5s markout
30s MFE/MAE
post-exit move
```

‏מגיעים מאוחר יותר.

---

# ‏130. Incident Packet

‏לכל חריגה משמעותית רצוי לאסוף snapshot אחד עם:

```text
decision context
market data
features
rank
vetoes
orders
fills
positions
latencies
logs
versions
```

---

# ‏131. First Divergence RCA

‏במקום לשאול “למה הפסדנו?”, שאל:

```text
What was the first point where actual behavior diverged from expected behavior?
```

---

# ‏132. RCA Classification

‏אפשר להשתמש בקטגוריות:

```text
LIVE_DATA_DIVERGENCE
LIVE_FEATURE_DIVERGENCE
LIVE_RANK_DIVERGENCE
LIVE_SIGNAL_EXPIRED
LIVE_VETO_CHANGED
LIVE_REJECT
LIVE_NO_FILL
LIVE_PARTIAL_FILL
LIVE_SLIPPAGE_HIGH
LIVE_ADVERSE_SELECTION
LIVE_EXIT_DELAY
LIVE_POSITION_MISMATCH
LIVE_UNKNOWN_EFFECT
LIVE_RECONNECT
LIVE_STALE_STATE
LIVE_OPERATOR_ACTION
LIVE_CONFIG_DRIFT
LIVE_LATENCY_SPIKE
```

---

# ‏133. Near Miss חשוב כמו Incident

‏אם תקלה כמעט יצרה exposure לא נכון אבל guard עצר אותה — זו Evidence חשובה.

---

# ‏134. Guard Effectiveness

‏שמור:

```text
guard triggered
what it prevented
whether it was correct
false-positive rate
```

---

# ‏135. Kill Switch Drills

‏Kill switch שלא נבדק תחת load הוא Hypothesis.

---

# ‏136. Exit Under Load Test

‏צריך לבדוק שהמערכת עדיין יכולה לצמצם exposure בזמן Scanner burst.

---

# ‏137. Broker Disconnect Drill

‏סימולציה של disconnect בזמן:

```text
entry pending
partial fill
exit pending
cancel pending
```

---

# ‏138. Market Data Disconnect Drill

‏Position פתוח + data feed stale הוא תרחיש שחייב policy מפורש.

---

# ‏139. Data/Broker Split Failure

‏ייתכן Market Data עובד וה־Broker לא.

‏או להפך.

‏המערכת צריכה לדעת להגיב לכל שילוב.

---

# ‏140. Provider Failover

‏אם עוברים provider, חשוב לדעת שה־semantics עשויים להשתנות.

---

# ‏141. Cross-Feed Continuity

‏לא בהכרח נכון לחבר state משני feeds כאילו הם sequence רציף אחד.

---

# ‏142. Generation Reset

‏Failover יכול להצדיק feature warmup מחדש.

---

# ‏143. Clock Health

‏Live analysis נשבר אם timestamps אינם אמינים.

---

# ‏144. Monotonic Durations

‏למדידת durations מקומיים השתמש ב־monotonic clock.

---

# ‏145. Cross-System Time

‏אל תחסר שני timestamps ממערכות שונות בלי להבין synchronization.

---

# ‏146. Timestamp Precision ≠ Accuracy

‏ננו־שניות בפורמט לא אומרות שהשעון מדויק לננו־שניות.

---

# ‏147. Log Blocking

‏Logging sync יכול ליצור latency spikes בדיוק בזמן אירוע חשוב.

---

# ‏148. Observability Must Survive Stress

‏אם telemetry נעלם בזמן incident, הוא פחות שימושי.

---

# ‏149. But Telemetry Must Not Break Trading

‏Observability לא אמורה לחסום hot path.

---

# ‏150. Audit Journal

‏אירועים עסקיים קריטיים צריכים durability מתאימה.

---

# ‏151. Replay from Live

‏אחד הכלים החזקים הוא לקחת Live episode ולהריץ אותו ב־Replay.

---

# ‏152. Expected vs Replayed

‏אם Replay לא מצליח לשחזר decision, יש parity problem.

---

# ‏153. Expected vs Actual

‏אם Replay כן משחזר decision אבל Live outcome שונה — חפש Execution/Latency/Market divergence.

---

# ‏154. Golden Live Episodes

‏שמור episodes מייצגים:

- ‏clean win.
- ‏clean loss.
- ‏no fill.
- ‏partial fill.
- ‏toxic fill.
- ‏late exit.
- ‏reconnect.
- ‏halt/fast market.

---

# ‏155. Regression Against Real Episodes

‏גרסה חדשה צריכה להיות מסוגלת להסביר מה הייתה עושה על אותם episodes.

---

# ‏156. Counterfactual Replay

‏אפשר לשאול:

```text
What if latency were 50ms lower?
What if we used IOC?
What if veto X were enabled?
What if exit triggered 250ms earlier?
```

‏אבל צריך לזכור שזה Counterfactual, לא Fact.

---

# ‏157. Live Experiment Budget

‏כל experiment אמיתי צריך budget של risk/exposure/frequency.

---

# ‏158. One Live Variable at a Time

‏כאשר אפשר, עדיף לשנות variable אחד כדי לשפר attribution.

---

# ‏159. Multi-Armed Complexity

‏אם משנים הרבה tactics במקביל, צריך experimental design חזק יותר.

---

# ‏160. Live Sample Size

‏כמה trades עברו אינו מספיק.

‏צריך לשאול כמה independent episodes/regimes ראינו.

---

# ‏161. Correlated Trades

‏100 trades בתוך אותו market event אינם בהכרח 100 observations עצמאיות.

---

# ‏162. Regime Coverage

‏לפני confidence גבוה רצוי לראות:

```text
quiet
normal
fast
wide-spread
high-volume
low-liquidity
open/close if relevant
```

---

# ‏163. Small Live Can Still Be Biased

‏אם Small Live מופעל רק בתנאים “נוחים”, הוא לא בודק stress cases.

---

# ‏164. But Do Not Seek Stress with Money

‏Stress scenarios עדיף קודם לבדוק ב־Replay/Fault Injection, לא לנסות לייצר סיכון אמיתי לצורך ניסוי.

---

# ‏165. Capital Is Not a Testing Tool

‏לא מגדילים exposure רק כדי “לקבל יותר data”.

---

# ‏166. Risk Before Statistics

‏ב־Live, safety invariants קודמים לצורך במחקר.

---

# ‏167. No Overfill

‏Invariant:

```text
filled entry quantity must never exceed allowed target exposure
```

‏בהתאם למדיניות המערכת.

---

# ‏168. No Duplicate Intent

‏אותו business intent לא אמור לייצר risk כפול בגלל retry/reconnect.

---

# ‏169. Flat Means Flat

‏אם state אומר `FLAT`, broker position חייב להיות תואם לאחר reconciliation.

---

# ‏170. Exit Priority Invariant

‏כאשר Position קיים, exit/cancel/risk actions לא אמורים להיתקע מאחורי analytics לא קריטי.

---

# ‏171. Safety Epoch

‏לאחר kill/restart/resume ניתן להשתמש ב־epoch כדי למנוע stale intents מלחזור לחיים.

---

# ‏172. Resume Is a Proof

‏Resume לאחר Incident אינו button.

‏הוא proof ש:

```text
truth reconciled
freshness restored
risk known
orders known
positions known
root cause understood enough
controls healthy
```

---

# ‏173. Live Checklist לפני Session

‏בדוק לפחות:

- ‏environment/account נכונים.
- ‏Market Data healthy.
- ‏Broker healthy.
- ‏Positions/Open Orders reconciled.
- ‏Clocks healthy.
- ‏Strategy/Config versions ידועות.
- ‏Risk limits טעונים.
- ‏Kill switch זמין.
- ‏Storage/Journal writable.
- ‏No stale recovery state.

---

# ‏174. Live Checklist אחרי Session

‏בדוק:

- ‏Positions flat/expected.
- ‏Open Orders expected.
- ‏Unknown effects = 0 או מוסברים.
- ‏Reconciliation clean.
- ‏Incidents/Near Misses מתועדים.
- ‏Live vs expected metrics נשמרו.

---

# ‏175. Daily Live Review

‏אל תתחיל מ־PnL.

‏סדר טוב יותר:

```text
Safety
Data Quality
Decision Quality
Execution Quality
Exit Quality
Costs
Then PnL
```

---

# ‏176. PnL הוא Lagging Metric

‏PnL יכול להיות חיובי גם ביום שבו המערכת התנהגה רע.

---

# ‏177. Bad Process / Good Outcome

‏Trade יכול להרוויח במקרה למרות:

```text
stale data
late entry
overfill
bad exit logic
```

‏אסור לקרוא לזה הצלחה תפעולית.

---

# ‏178. Good Process / Bad Outcome

‏Trade יכול להפסיד למרות שהתהליך היה תקין.

‏זו לא בהכרח תקלה.

---

# ‏179. Process Metrics

‏לכן שומרים גם:

```text
freshness
rank validity
veto state
latency
execution quality
reconciliation quality
risk compliance
```

---

# ‏180. `Expected Loss` אינו Incident אוטומטי

‏Strategy יכולה להפסיד כחלק מה־distribution.

‏Incident הוא כאשר behavior חורג מה־contract או מה־expected envelope.

---

# ‏181. Envelope Thinking

‏במקום expected point אחד, החזק:

```text
expected range
warning range
critical range
```

---

# ‏182. Control Charts / Drift Bands

‏יכולים לעזור לזהות degradation הדרגתי, כל עוד לא מתייחסים אליהם כקסם סטטיסטי.

---

# ‏183. Alert Fatigue

‏יותר Alerts אינו בהכרח בטוח יותר.

---

# ‏184. Actionable Alerts

‏Alert טוב אומר:

```text
what changed
why it matters
current exposure
recommended operational action
```

---

# ‏185. Page on Risk, Not Noise

‏Events שיכולים ליצור exposure שגוי ראויים לעדיפות גבוהה.

---

# ‏186. Live Dashboards

‏Dashboard חשוב צריך להראות לפחות:

```text
Trading Mode
Readiness
Positions
Pending Exposure
Open Orders
Data Freshness
Scanner Fresh Coverage
Latency p50/p95/p99
Rejects
Unknown Effects
Net Edge Funnel
TimeToFlat
```

---

# ‏187. Position Dashboard

‏לכל Position פעיל כדאי לראות:

```text
entry thesis
entry fills
current market state
signal age
remaining edge
exit status
pending orders
risk state
```

---

# ‏188. Top Candidate Dashboard

‏שמור גם Top-N עם:

```text
score
rank gap
freshness
veto reasons
execution feasibility
```

---

# ‏189. Live-to-Research Feedback

‏Live צריך להזין Research עם:

- ‏actual latencies.
- ‏actual fills.
- ‏actual costs.
- ‏actual markouts.
- ‏actual rejects.
- ‏actual no-fill cases.

---

# ‏190. Calibrate Simulator from Live

‏Simulation assumptions צריכים להתעדכן מ־Evidence Live.

---

# ‏191. But Preserve Historical Versions

‏אם משנים fill model, שמור version.

‏אחרת Results ישנים אינם reproducible.

---

# ‏192. Live Calibration Loop

```text
Live observation
→ classify divergence
→ update model hypothesis
→ replay/backtest
→ shadow
→ controlled promotion
```

---

# ‏193. Do Not Patch Strategy Directly from One Trade

‏Trade חריג אחד הוא Case Study, לא בהכרח statistical evidence.

---

# ‏194. Incident Can Justify Safety Fix Immediately

‏לעומת זאת, violation של invariant בטיחותי יכול להצדיק תיקון מיידי גם בלי sample גדול.

---

# ‏195. Separate Safety from Alpha Changes

‏Safety fix ו־strategy tuning אינם אותו סוג שינוי.

---

# ‏196. Preserve Raw Evidence

‏לפני שינוי בעקבות Incident, שמור raw logs/data/order events/config/version context.

---

# ‏197. Retrospective Reconstruction

‏המטרה היא להיות מסוגלים לענות:

```text
What did the system know?
What did it believe?
Why did it act?
What did it send?
What did the broker do?
What did the market do afterward?
```

---

# ‏198. If You Cannot Reconstruct It, You Cannot Learn Reliably

‏זה כלל תפעולי ומחקרי.

---

# ‏199. Practitioner Secret — Live Exposes Boundary Bugs

‏הרבה bugs אינם בתוך formula.

‏הם בין:

```text
feed ↔ parser
scanner ↔ decision
risk ↔ execution
client ↔ broker
broker ↔ venue
operator ↔ system
```

---

# ‏200. Practitioner Secret — Fast Markets Are Correlated Failure Tests

‏דווקא כשה־Edge נראה הכי גדול, infrastructure יכולה להיות הכי לחוצה.

---

# ‏201. Practitioner Secret — Good Fills Are Not Random Samples

‏מי שממלא אותנו יכול להיות correlated עם future adverse movement.

---

# ‏202. Practitioner Secret — Paper Can Teach the Wrong Fill Intuition

‏לכן צריך להפריד System Validation מ־Execution Validation.

---

# ‏203. Practitioner Secret — Reconnect Bugs Are Often More Dangerous Than Startup Bugs

‏כי קיימים side effects חיים שצריך לשחזר.

---

# ‏204. Practitioner Secret — Config Drift Can Masquerade as Strategy Drift

‏שינוי threshold קטן יכול לשנות candidate mix.

---

# ‏205. Practitioner Secret — Tail Latency Is Often Market-Conditional

‏p99 חשוב במיוחד אם הוא עולה בדיוק בזמן bursts.

---

# ‏206. Practitioner Secret — Exit Quality Deserves Its Own Model

‏אל תניח ש־entry execution statistics מתארים exit.

---

# ‏207. Practitioner Secret — “No Incident” Does Not Mean Safe

‏Near misses ו־guard activations יכולים לחשוף בעיה לפני הפסד אמיתי.

---

# ‏208. Practitioner Secret — Live Should Continuously Challenge the Simulator

‏כל divergence הוא הזדמנות לשפר את model assumptions.

---

# ‏209. Practitioner Secret — Small Live Is Calibration, Not Validation Finale

‏גם לאחר Small Live ממשיכים למדוד drift ו־execution changes.

---

# ‏210. Practitioner Secret — A Profitable Day Can Hide a Broken System

‏Process correctness קודם לפרשנות של PnL יומי.

---

# ‏211. Baseline Live Architecture לרובוט שלנו

```text
Market Data
→ Canonical State
→ Scanner / Rank
→ Negative Evidence Engine
→ Trade / No Trade
→ Risk Gate
→ Order Intent
→ Execution Engine
→ Broker

Parallel:
Position Monitor
Reconciliation
Event Journal
Telemetry
Safety Control Plane
```

---

# ‏212. Baseline Promotion Path

```text
Research
→ Deterministic Replay
→ Paper
→ Shadow
→ Tiny/Controlled Live
→ Calibrated Small Live
→ Only then consider larger exposure
```

---

# ‏213. Baseline Live Rules

‏לגרסה הראשונה הייתי רוצה שמבחינה מערכתית יהיו לפחות:

- ‏Broker reconciliation לפני new risk.
- ‏Stable Intent IDs.
- ‏Explicit `UNKNOWN_EFFECT`.
- ‏Pre-submit revalidation.
- ‏Pending exposure accounting.
- ‏Dedicated position/exit monitoring.
- ‏Fast fail-closed for new entries when state is uncertain.
- ‏Durable business-event journal.
- ‏Live latency/fill/cost measurement.
- ‏Versioned strategy/config.
- ‏Capital ramp controlled by Evidence.

‏זו אינה המלצת מסחר אלא baseline הנדסי למחקר Live בטוח ומדיד.

---

# ‏214. Metrics שחייבים להתחיל לאסוף מהר

```text
candidate_to_decision_ms
decision_to_submit_ms
submit_to_ack_ms
submit_to_first_fill_ms
exit_trigger_to_submit_ms
exit_trigger_to_flat_ms
signal_age_at_submit_ms
signal_age_at_fill_ms
fill_rate
partial_fill_rate
reject_rate
unknown_effect_rate
position_mismatch_count
entry_slippage_bps
exit_slippage_bps
post_fill_markout
realized_round_trip_cost_bps
net_edge_retained
```

---

# ‏215. Metrics לפי Context

‏לא רק global averages.

‏חתוך לפחות לפי:

```text
symbol liquidity
spread bucket
volatility
market activity
session phase
signal horizon
order tactic
route/venue when known
```

---

# ‏216. Live Acceptance אינו “היה רווח”

‏Acceptance אמיתי כולל:

```text
state correctness
reconciliation correctness
no duplicate risk
latency within envelope
fills understood
costs understood
exit behavior understood
safety controls verified
```

---

# ‏217. Rule of Thumb למחקר שלנו

‏ל־Short-Horizon Momentum, כל מילישנייה אינה קדושה.

‏אבל כל delay שצורך חלק משמעותי מ־Signal Half-Life הוא משתנה כלכלי.

---

# ‏218. Rule of Thumb ל־Execution שלנו

‏אל תמדוד רק אם קיבלנו Fill.

‏מדוד:

```text
Did we get filled?
At what price?
How late?
What happened after fill?
Could we exit?
What remained net?
```

---

# ‏219. Rule of Thumb ל־Operations

‏כאשר איננו יודעים אם state אמיתי:

```text
stop creating new risk
reconcile truth
then resume
```

---

# ‏220. Rule of Thumb ל־Learning Loop

‏Live אינו המקום שבו Research נגמר.

‏Live הוא המקור האיכותי ביותר ל־Evidence על פערי Execution ו־Operations — בתנאי שאוספים אותו בצורה בטוחה ומבוקרת.

---

# ‏221. מה צריך לדעת בעל־פה

1. ‏`Sent != Accepted != Working != Filled`.
2. ‏`CancelRequested != Canceled`.
3. ‏Local Truth אינו Broker Truth.
4. ‏`UNKNOWN_EFFECT` מחייב reconciliation, לא retry עיוור.
5. ‏Partial fills הם state רגיל.
6. ‏Pending Exposure הוא Risk אמיתי.
7. ‏Live Drift צריך פירוק לפי שכבות.
8. ‏Paper אינו מודל מושלם ל־fills.
9. ‏Small Live הוא Calibration Experiment.
10. ‏`TimeToFlat` חשוב במיוחד לרובוט קצר.
11. ‏Fast markets יכולים להחמיר latency, spread ו־fills יחד.
12. ‏Process Quality ו־PnL אינם אותו דבר.
13. ‏Versioning של config חשוב כמו versioning של code.
14. ‏Recovery חייב להתחיל מ־Broker Truth.
15. ‏Exit/Risk actions מקבלים priority על analytics לא קריטי.
16. ‏Live evidence צריך לחזור ולכייל את ה־Simulator.

---

# ‏222. Checklist לפני שמקדמים Live Scale

- ‏האם reconciliation נקי?
- ‏האם אין duplicate intents/orders?
- ‏האם `UNKNOWN_EFFECT` מטופל נכון?
- ‏האם latency distribution נמדדה, כולל tails?
- ‏האם fill model מכויל מול Live?
- ‏האם no-fill opportunity נמדד?
- ‏האם post-fill adverse selection נמדד?
- ‏האם exit latency ו־giveback נמדדים?
- ‏האם broker/data disconnects נבדקו?
- ‏האם kill switch נבדק תחת load?
- ‏האם config/version provenance מלא?
- ‏האם incidents ו־near misses נכנסים ל־RCA?
- ‏האם capital promotion תלוי Evidence?
- ‏האם simulator עודכן מנתוני Live בלי למחוק reproducibility של גרסאות קודמות?

---

# ‏223. משפט הסיום

> ‏**ב־Live אנחנו לא מנסים להוכיח שה־Backtest “צדק”. אנחנו מנסים למדוד היכן המציאות שונה מהמודל, לשמור על שליטה בסיכון, וללמוד מספיק מהר כדי לשפר את המודל בלי לאבד את היכולת להסביר כל החלטה וכל Fill.**

---

# ‏224. המעבר לשלב הבא

‏השלב הבא בקורס הוא:

```text
63 — How Professionals Think About Edge
```

‏לא מתחילים אותו בתוך שלב זה.
