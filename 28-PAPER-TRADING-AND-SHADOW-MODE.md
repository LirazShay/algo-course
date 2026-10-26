# ‏שלב 28 — `Paper Trading` ו־`Shadow Mode`: לעבור מהיסטוריה לשוק חי בלי לקפוץ ישר לכסף אמיתי

> ‏מטרת הפרק: לבנות מסלול מעבר מקצועי מ־`Replay` ו־`Backtest` אל שוק חי, תוך הפרדה בין בדיקת ה־Signal, בדיקת ה־Execution ובדיקת המערכת התפעולית. נלמד איך להשתמש ב־`Shadow Mode`, ב־`Paper Trading` וב־`Forward Validation` כדי לגלות פערים שהיסטוריה לבדה אינה חושפת.
>
> ‏העיקרון המרכזי: **לפני שכסף אמיתי נכנס לתמונה, המערכת צריכה להוכיח שהיא מסוגלת לקבל נתוני שוק חיים, לקבל החלטות עקביות, לנהל Order Lifecycle מלא, להתאושש מתקלות ולהסביר את הפער בין מה שהיא ציפתה שיקרה לבין מה שבאמת קרה.**
>
> ‏כמו בכל הקורס: קודם נלמד את העקרונות המקצועיים הכלליים, אחר כך Best Practices ורזי מקצוע, ולבסוף נתאים אותם לרובוט שלך — Scanner של כל השוק, דירוג מתמשך והחזקה של שניות בודדות ועד בערך דקה.

---

# ‏1. למה `Backtest` ו־`Replay` עדיין לא מספיקים

‏גם `Backtest` מצוין ו־`Replay` דטרמיניסטי עדיין עובדים על מידע שכבר נאסף.

‏שוק חי מוסיף דברים שלא תמיד קיימים בנתונים ההיסטוריים:

- ‏אירועים שמגיעים באיחור.
- ‏Burst של עדכונים.
- ‏נתונים חסרים.
- ‏פערי clocks.
- ‏latency משתנה.
- ‏connection resets.
- ‏broker acknowledgements שמתעכבים.
- ‏order states שלא מגיעים בסדר שציפינו.
- ‏symbol metadata שמשתנה.
- ‏rate limits.
- ‏API errors.
- ‏reconnects.
- ‏תלות בין שירותים.

‏לכן צריך שלב ביניים שחי על השוק האמיתי אבל אינו מסתכן בכסף אמיתי.

---

# ‏2. שלושת המצבים שצריך להפריד ביניהם

```text
SHADOW
PAPER
LIVE
```

‏הם אינם אותו דבר.

---

# ‏3. `Shadow Mode`

‏ב־`Shadow Mode`:

```text
Live Market Data
→ Real Scanner
→ Real Features
→ Real Score
→ Real Rank
→ Real Decision
→ Simulated Intent
→ NO broker order
```

‏המערכת רואה את השוק בזמן אמת ומקבלת החלטות אמתיות, אבל אינה שולחת Order לברוקר.

---

# ‏4. מה Shadow בודק

‏Shadow בודק בעיקר:

- ‏האם ה־Scanner מצליח לעמוד בקצב.
- ‏האם Features מחושבים בזמן.
- ‏האם Rank יציב.
- ‏האם Data Freshness תקין.
- ‏האם Decision latency סביר.
- ‏האם `NO TRADE` מופעל כשצריך.
- ‏האם Regime detection עובד בזמן אמת.
- ‏האם ה־Risk Engine מקבל state נכון.

---

# ‏5. מה Shadow לא בודק

‏Shadow אינו בודק בפועל:

- ‏Broker acknowledgement.
- ‏Broker rejection.
- ‏Order routing.
- ‏Partial fill אמיתי.
- ‏Cancel/replace אמיתי.
- ‏Broker-side state.

‏לכן Shadow הוא שלב חשוב, אבל לא האחרון.

---

# ‏6. `Paper Trading`

‏ב־Paper Trading המערכת כבר שולחת Orders לסביבת דמו/סימולציה של ברוקר או למנוע paper פנימי.

```text
Live Market Data
→ Strategy
→ Risk
→ Order Intent
→ Paper Broker
→ Ack
→ Fill / Partial Fill / Cancel / Reject
→ Position
→ Exit
```

---

# ‏7. למה Paper הוא לא Live

‏Paper יכול להיות שימושי מאוד, אבל אסור להסיק ממנו שכל מה שקרה שם יקרה כך בכסף אמיתי.

‏סיבות אפשריות:

- ‏מודל Fill שונה.
- ‏queue לא אמיתי.
- ‏latency שונה.
- ‏market impact חסר.
- ‏routing שונה.
- ‏liquidity assumption אופטימי.
- ‏fees שונים.
- ‏order types מסוימים יכולים להיות מסומלצים אחרת.

‏לכן:

```text
Paper success != Live proof
```

---

# ‏8. ארבע שכבות הוכחה

‏נרצה מסלול כזה:

```text
Historical Backtest
→ Deterministic Replay
→ Live Shadow
→ Paper Trading
→ Small Controlled Live
```

‏כל שכבה מוכיחה משהו אחר.

---

# ‏9. מה Backtest מוכיח

‏אם נבנה נכון, הוא יכול להראות:

- ‏Predictive Edge היסטורי.
- ‏Rank quality.
- ‏robustness.
- ‏estimated economics.

---

# ‏10. מה Replay מוכיח

‏Replay מוסיף:

- ‏determinism.
- ‏state correctness.
- ‏event ordering.
- ‏debuggability.
- ‏regression testing.

---

# ‏11. מה Shadow מוכיח

‏Shadow מוסיף:

- ‏real-time data handling.
- ‏live timing.
- ‏production compute path.
- ‏operational stability.

---

# ‏12. מה Paper מוכיח

‏Paper מוסיף:

- ‏order lifecycle.
- ‏broker integration.
- ‏reconciliation.
- ‏position state.
- ‏cancel/replace flow.
- ‏exit lifecycle.

---

# ‏13. מה רק Live יכול להוכיח

‏רק Live אמיתי יכול לחשוף במלואם:

- ‏real fill quality.
- ‏real queue behavior.
- ‏real routing.
- ‏real fees.
- ‏real slippage.
- ‏real market impact.

‏לכן אין קיצור דרך מוחלט.

---

# ‏14. `Signal-Only Shadow`

‏הגרסה הפשוטה ביותר:

```text
timestamp
symbol
score
rank
decision
reason
```

‏בלי Orders בכלל.

---

# ‏15. `Execution Shadow`

‏גרסה מתקדמת יותר:

```text
Signal
→ hypothetical order
→ hypothetical fill model
→ hypothetical exit
```

‏אבל עדיין ללא ברוקר.

---

# ‏16. למה צריך את שניהם

‏אם Signal-only עובד ו־Execution Shadow לא:

‏ייתכן שהבעיה היא Execution Economics.

‏אם Signal-only עצמו לא עובד:

‏אין טעם להאשים את הברוקר.

---

# ‏17. `Forward Validation`

‏Forward Validation פירושו:

> ‏לקבוע גרסה של האסטרטגיה, לא לשנות אותה תוך כדי, ולראות מה היא עושה על נתונים חדשים שמגיעים מעכשיו והלאה.

---

# ‏18. למה זה חשוב

‏זה מפחית את הסיכון שבלי לשים לב התאמת את המודל לעבר.

---

# ‏19. Freeze לפני Forward Test

‏לפני תקופת Shadow רצינית יש להקפיא:

```text
strategy_version
feature_version
score_version
config_version
risk_version
execution_model_version
```

---

# ‏20. למה אסור לשנות כל יום

‏אם משנים כל יום:

‏אי אפשר לדעת איזו גרסה באמת נבחנה.

---

# ‏21. `Run Manifest`

‏כל session צריכה לשמור לפחות:

```text
run_id
start_time
end_time
code_commit
config_hash
data_provider
broker_mode
strategy_version
risk_version
```

---

# ‏22. Live Data Snapshot

‏לכל החלטה משמעותית צריך לשמור את snapshot השוק שעליו התקבלה.

---

# ‏23. Decision Snapshot

‏לכל החלטה:

```text
symbol
rank
score
features
regime
spread
liquidity
freshness
risk_state
decision
reason
```

---

# ‏24. `Decision Latency`

‏נמדוד:

```text
market_event_time
received_time
feature_ready_time
rank_ready_time
decision_time
```

---

# ‏25. End-to-End Signal Latency

```text
signal_latency = decision_time - market_event_time
```

‏זה חשוב במיוחד באסטרטגיה של שניות.

---

# ‏26. Latency Distribution

‏לא נסתפק בממוצע.

‏נמדוד:

```text
P50
P90
P95
P99
MAX
```

---

# ‏27. Burst Behavior

‏מערכת יכולה להיות מהירה רוב הזמן ולהיחנק בדיוק כשהשוק זז מהר.

---

# ‏28. לכן צריך Segment לפי load

```text
normal
busy
burst
extreme
```

---

# ‏29. Candidate Churn

‏ב־Live נמדוד כמה פעמים Top-1 מתחלף.

---

# ‏30. Rank Stability

‏נבדוק:

```text
rank_duration
rank_changes_per_second
top1_persistence
```

---

# ‏31. Signal Age

‏כאשר Decision נוצר:

```text
signal_age_ms
```

‏צריך להיות גלוי.

---

# ‏32. Data Freshness

‏נמדוד לכל symbol:

```text
quote_age
trade_age
book_age
```

---

# ‏33. Stale Data Policy

‏Shadow הוא המקום לבדוק האם המערכת באמת מפסיקה לסמוך על מידע ישן.

---

# ‏34. Missing Data

‏יש לרשום:

- ‏missing quotes.
- ‏gaps.
- ‏sequence jumps.
- ‏symbol silence.

---

# ‏35. Out-of-Order Events

‏יש לבדוק האם אירועים מגיעים מחוץ לסדר.

---

# ‏36. Duplicate Events

‏Live systems צריכים להתמודד גם עם duplicates.

---

# ‏37. Clock Skew

‏יש להפריד בין:

```text
provider timestamp
local receive timestamp
broker timestamp
```

---

# ‏38. `Shadow Fill Model`

‏אם רוצים Execution Shadow, צריך מודל Fill מפורש.

---

# ‏39. Shadow Fill אינו Fill אמיתי

‏לכן כל רשומה צריכה לסמן:

```text
fill_source = SIMULATED
```

---

# ‏40. Paper Fill Source

‏בסביבת Paper:

```text
fill_source = PAPER_BROKER
```

---

# ‏41. Live Fill Source

‏בעתיד:

```text
fill_source = LIVE_BROKER
```

---

# ‏42. למה provenance חשוב

‏אסור לערבב את שלושת הסוגים בדוח אחד כאילו הם שקולים.

---

# ‏43. Shadow PnL

‏אפשר לחשב Shadow PnL, אבל צריך לקרוא לו כך במפורש.

---

# ‏44. Paper PnL

‏גם Paper PnL אינו Realized Live PnL.

---

# ‏45. Comparison Table

‏נרצה להשוות:

```text
Backtest
Replay
Shadow
Paper
Live
```

‏על אותה גרסת Strategy ככל האפשר.

---

# ‏46. `Sim-to-Live Gap`

‏נמדוד פערים בין:

```text
simulated entry
paper entry
live entry
```

‏ובהמשך גם ביציאה.

---

# ‏47. `Signal-to-Paper Gap`

‏נבדוק כמה Edge נעלם מרגע הסיגנל עד ה־Paper Fill.

---

# ‏48. `Paper-to-Live Gap`

‏בעתיד נוכל למדוד כמה Paper היה אופטימי או פסימי לעומת Live.

---

# ‏49. `Shadow Candidate Ledger`

‏צריך לשמור גם Candidates שלא נבחרו.

---

# ‏50. למה

‏כי אם Rank #1 נכשל, נרצה לדעת מה #2 ו־#3 עשו.

---

# ‏51. `Rejected Candidate Ledger`

‏גם Candidates שנפסלו צריכים להישמר עם reason.

---

# ‏52. `NO TRADE` Ledger

‏נרצה לדעת:

```text
why_no_trade
best_candidate
score
threshold
spread
risk_state
```

---

# ‏53. Opportunity Analysis

‏אחרי יום Shadow נוכל לבדוק:

- ‏עסקאות שהמערכת הייתה לוקחת.
- ‏עסקאות שדחתה.
- ‏כמה Edge היה בכל קבוצה.

---

# ‏54. `Paper Broker Adapter`

‏ה־Strategy לא אמורה לדעת אם היא ב־Paper או Live.

---

# ‏55. Interface

```text
IExecutionBroker
```

‏יכול לקבל implementations כגון:

```text
SimulatedBroker
PaperBroker
LiveBroker
```

---

# ‏56. אותו Order Intent

‏אותו אובייקט Intent צריך לעבור בכל הסביבות.

---

# ‏57. למה

‏כדי למנוע:

```text
backtest logic != paper logic != live logic
```

---

# ‏58. Environment-specific Adapter

‏הבדלים ספציפיים לברוקר נשארים ב־Adapter.

---

# ‏59. `Order Lifecycle`

‏Paper צריך לבדוק לפחות:

```text
CREATED
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

# ‏60. Unknown State

‏אחד המצבים החשובים ביותר לבדיקה.

‏אם לא יודעים מה מצב Order:

‏אסור להניח שהוא לא קיים.

---

# ‏61. Reconciliation

‏המערכת צריכה להיות מסוגלת לשאול את הברוקר:

```text
What orders exist?
What positions exist?
What fills exist?
```

---

# ‏62. Broker Truth

‏כשיש סתירה בין local state לברוקר:

‏צריך מנגנון מוגדר לפתרון.

---

# ‏63. Startup Reconciliation

‏גם ב־Paper יש לבדוק restart כאשר נשאר state.

---

# ‏64. Crash During Order

‏תרחיש חובה:

```text
submit order
process crashes
broker fills order
process restarts
```

---

# ‏65. Duplicate Submit Protection

‏יש לבדוק idempotency.

---

# ‏66. Cancel/Fill Race

‏גם Paper צריך לבדוק:

```text
cancel requested
fill arrives
```

---

# ‏67. Partial Fill

‏ה־Position חייב לשקף רק quantity שבאמת התמלאה.

---

# ‏68. Exit After Partial Entry

‏ברגע שיש Position חלקי, צריך לדעת לנהל יציאה עבורו.

---

# ‏69. Oversell Protection

‏אסור ש־Exit quantity תעלה על position truth.

---

# ‏70. Position Reconciliation

‏נבדוק:

```text
local_qty == broker_qty
```

‏או לפחות שהפער מוסבר ומטופל.

---

# ‏71. Broker Disconnect

‏Paper הוא מקום מצוין לבדוק disconnect/reconnect.

---

# ‏72. Market Data Disconnect

‏גם Feed יכול ליפול בזמן שה־Broker עדיין מחובר.

---

# ‏73. Fail-Closed

‏ברירת המחדל בזמן חוסר ודאות צריכה להיות שמרנית.

---

# ‏74. Existing Position vs New Entry

‏צריך להבדיל בין:

```text
Can I open a new trade?
Can I safely manage an existing trade?
```

---

# ‏75. Risk Engine ב־Shadow

‏גם בלי Orders אמיתיים צריך להריץ Risk checks.

---

# ‏76. למה

‏כדי לוודא שהמערכת לא “מאשרת” עסקאות שב־Live היו צריכות להיחסם.

---

# ‏77. Risk Shadow Ledger

‏לכל Decision:

```text
risk_allowed
risk_reason
requested_size
approved_size
```

---

# ‏78. Paper Position Sizing

‏Paper צריך להשתמש באותו Position Sizing logic המתוכנן ל־Live.

---

# ‏79. אבל לא להסיק מזה שהסיכון אמיתי

‏אין הפסד כספי אמיתי ב־Paper.

‏לכן התנהגות אנושית אינה חלק מהבדיקה כאן.

---

# ‏80. `Kill Switch`

‏גם ב־Paper צריך לבדוק Kill Switch.

---

# ‏81. Kill Switch Test

‏למשל:

```text
new entries blocked
working orders handled
positions reconciled
system state visible
```

---

# ‏82. Pause Mode

‏מצב נוסף שימושי:

```text
PAUSED
```

‏ה־Scanner יכול להמשיך לצפות בשוק, אבל לא ליצור Orders חדשים.

---

# ‏83. `EXIT_ONLY`

‏מצב שבו:

- ‏אין Entries חדשים.
- ‏Positions קיימים עדיין מנוהלים.

---

# ‏84. Mode State Machine

```text
OFFLINE
SHADOW
PAPER
LIVE_DISABLED
EXIT_ONLY
PAUSED
```

‏בעתיד ניתן להרחיב.

---

# ‏85. Environment Guard

‏צריך להיות כמעט בלתי אפשרי לשלוח Live order בטעות מתוך Paper run.

---

# ‏86. Explicit Environment

```text
execution_environment = SHADOW | PAPER | LIVE
```

---

# ‏87. Visible Banner

‏בממשק צריך להיות ברור באיזה Environment המערכת נמצאת.

---

# ‏88. Separate Credentials

‏במערכת production כדאי להפריד credentials לפי environment כאשר הספק מאפשר זאת.

---

# ‏89. Live Disabled by Default

‏מערכת חדשה צריכה לעלות ללא הרשאה למסחר אמיתי כברירת מחדל.

---

# ‏90. `Promotion Gate`

‏מעבר בין שלבים צריך להיות מבוסס Evidence.

---

# ‏91. Backtest → Replay Gate

‏דורש לפחות:

- ‏timeline integrity.
- ‏reproducibility.
- ‏robustness.

---

# ‏92. Replay → Shadow Gate

‏דורש:

- ‏determinism.
- ‏stable state machine.
- ‏known latency budget.

---

# ‏93. Shadow → Paper Gate

‏דורש:

- ‏live data stability.
- ‏no unexplained state drift.
- ‏acceptable decision latency.

---

# ‏94. Paper → Small Live Gate

‏דורש הרבה יותר:

- ‏order lifecycle stable.
- ‏reconciliation tested.
- ‏risk controls tested.
- ‏kill switch tested.
- ‏no unresolved critical incidents.

---

# ‏95. לא Promotion לפי PnL בלבד

‏מערכת יכולה להרוויח ב־Paper ועדיין להיות תפעולית לא בטוחה.

---

# ‏96. Operational Scorecard

‏נמדוד למשל:

```text
uptime
reconnects
data gaps
order errors
reconciliation mismatches
unknown states
latency breaches
```

---

# ‏97. Prediction Scorecard

‏נמדוד:

```text
forward returns
rank monotonicity
top1 premium
MFE
MAE
time_to_first_profit
```

---

# ‏98. Execution Scorecard

‏נמדוד:

```text
fill rate
partial fill rate
entry latency
exit latency
slippage
cancel latency
```

---

# ‏99. Economics Scorecard

‏נמדוד:

```text
gross edge
estimated costs
net edge
cost-to-edge ratio
```

---

# ‏100. Risk Scorecard

‏נמדוד:

```text
blocked trades
risk breaches
loss streaks
exposure peaks
kill switch events
```

---

# ‏101. `Shadow vs Backtest Drift`

‏אם אותה Strategy נראית שונה ב־Shadow לעומת Backtest, זו שאלה חשובה.

---

# ‏102. סיבות אפשריות

- ‏Data feed שונה.
- ‏latency.
- ‏Universe mismatch.
- ‏Feature skew.
- ‏clock semantics.
- ‏missing events.
- ‏config mismatch.

---

# ‏103. `Training/Serving Skew`

‏אותו Feature חייב להיות מחושב באותה משמעות במחקר וב־Live.

---

# ‏104. Feature Parity Test

‏אפשר לקחת snapshot Live ולהריץ עליו offline מחדש.

---

# ‏105. Expected Result

```text
live_feature == replay_feature
```

‏בתוך tolerance מוגדר.

---

# ‏106. Score Parity

‏אותו דבר ל־Score.

---

# ‏107. Rank Parity

‏אותו דבר ל־Rank כאשר Universe זהה.

---

# ‏108. Decision Parity

‏אותו input צריך להפיק אותה Decision.

---

# ‏109. `First Divergence`

‏כאשר Replay של live recording נותן תוצאה אחרת:

‏מחפשים את הנקודה הראשונה שבה state diverged.

---

# ‏110. Live Recording

‏כל Shadow/Paper session צריכה להיות ניתנת ל־Replay מאוחר יותר.

---

# ‏111. למה

‏כך אפשר להפוך אירוע production ל־regression test.

---

# ‏112. `Incident Replay`

‏אם היה bug:

```text
record live incident
replay
reproduce
fix
replay again
add regression test
```

---

# ‏113. Paper Broker Limitations Registry

‏יש לשמור רשימה מפורשת של הבדלים ידועים בין Paper ל־Live אצל הספק שנבחר.

---

# ‏114. למה לא לקודד את הרשימה בקורס

‏כי Broker behavior יכול להשתנות.

‏נבדוק אותו מול documentation עדכני כשנבחר integration ספציפי.

---

# ‏115. `Fill Optimism Ratio`

‏אפשר למדוד:

```text
paper_fill_quality / conservative_sim_fill_quality
```

‏לא כמדד מוחלט אלא כאיתות לכך שה־Paper אולי אופטימי מדי.

---

# ‏116. Paper Fill Suspicion

‏אם Paper ממלא שוב ושוב בדיוק במחיר מושלם:

‏צריך לחקור ולא לחגוג.

---

# ‏117. Shadow Entry Benchmark

‏לכל hypothetical entry נשמור:

```text
bid_at_signal
ask_at_signal
mid_at_signal
bid_at_order_time
ask_at_order_time
```

---

# ‏118. Forward Executability

‏נבדוק גם מה קרה כמה מאות מילישניות/שניות אחרי Decision.

---

# ‏119. Signal Decay Live

‏נמדוד:

```text
score_at_signal
score_100ms_later
score_500ms_later
score_1s_later
```

‏אם רזולוציית הנתונים מאפשרת.

---

# ‏120. Rank Decay Live

‏אותו רעיון ל־Rank.

---

# ‏121. `Time to First Profit` ב־Shadow

‏נמדוד על quote executable, לא רק Last.

---

# ‏122. `Time to Target`

‏גם כאן נדרש מחיר בר־ביצוע.

---

# ‏123. MFE/MAE Live Shadow

‏Shadow מאפשר לראות את path האמיתי של השוק קדימה.

---

# ‏124. למה זה חשוב

‏כי historical dataset מסוים עשוי לא להכיל את אותה fidelity.

---

# ‏125. `No-Trade Shadow Analysis`

‏נרצה לבדוק גם את העסקאות שהמערכת דחתה.

---

# ‏126. False Negative

‏Candidate שנפסל אבל לאחר מכן היה טוב יכול ללמד על Filter או Threshold.

---

# ‏127. False Positive

‏Candidate שאושר אך נכשל יכול ללמד על Score/Regime/Execution.

---

# ‏128. אבל לא משנים מיד

‏כל ממצא עובר דרך RCA ואז Experiment.

---

# ‏129. Session Summary

‏בסוף כל יום Shadow/Paper נשמור summary.

---

# ‏130. Summary Sections

```text
Data Health
Scanner Health
Prediction
Execution
Economics
Risk
Operations
Incidents
Drift
```

---

# ‏131. Daily Review

‏לא צריך להסתכל רק על PnL.

---

# ‏132. Worst Cases

‏נבדוק גם:

- ‏worst latency.
- ‏worst spread.
- ‏worst slippage.
- ‏worst stale-data event.
- ‏worst reconciliation mismatch.

---

# ‏133. Tail Events

‏הזנבות חשובים יותר מהממוצע במערכות קצרות טווח.

---

# ‏134. `Canary Session`

‏כאשר מעלים גרסה חדשה ל־Shadow/Paper, אפשר לתת לה session מצומצמת לפני full session.

---

# ‏135. Champion / Challenger Shadow

‏שתי גרסאות יכולות לקרוא את אותו Live feed במקביל.

---

# ‏136. למה זה חזק

‏הן מקבלות בדיוק אותו שוק בזמן אמת.

---

# ‏137. Challenger אינו שולח Order אמיתי

‏כך אפשר להשוות בלי להכפיל סיכון.

---

# ‏138. Decision Diff

‏לכל timestamp:

```text
champion_top1
challenger_top1
champion_score
challenger_score
champion_decision
challenger_decision
```

---

# ‏139. Changed Winner Analysis

‏ננתח במיוחד נקודות שבהן הגרסאות בחרו מניה שונה.

---

# ‏140. Incremental Value Live

‏זה נותן Evidence חזק יותר מאשר השוואה על ימים שונים.

---

# ‏141. Shadow Mode אינו חייב להיות זול ב־Compute

‏אפשר לחשב יותר diagnostics מאשר ב־Live execution path.

---

# ‏142. אבל צריך גם Production-like Path

‏לפחות גרסה אחת צריכה למדוד את ה־latency של הנתיב האמיתי.

---

# ‏143. Hot Path vs Diagnostics

‏נפריד:

```text
hot path
async diagnostics
```

---

# ‏144. Monitoring

‏Shadow/Paper צריכים dashboards אמיתיים.

---

# ‏145. Core Metrics

- ‏event rate.
- ‏processing lag.
- ‏queue depth.
- ‏decision latency.
- ‏data freshness.
- ‏connection state.
- ‏order state.
- ‏position state.

---

# ‏146. Alerting

‏גם בסביבת Paper צריך Alerts.

---

# ‏147. למה

‏כי אנחנו בודקים Operations, לא רק Strategy.

---

# ‏148. Alert Fatigue

‏Alerts צריכים להיות actionable.

---

# ‏149. Severity

```text
INFO
WARNING
CRITICAL
```

---

# ‏150. Critical Examples

- ‏position mismatch.
- ‏unknown live-like order.
- ‏market data stale מעבר לסף.
- ‏risk engine unavailable.
- ‏unexpected environment.

---

# ‏151. `Synthetic Faults`

‏ב־Paper נרצה להזריק תקלות בכוונה.

---

# ‏152. דוגמאות

```text
feed pause
broker timeout
duplicate ack
late fill
partial fill
cancel race
process restart
clock jump
```

---

# ‏153. Recovery Objective

‏לא מספיק שהמערכת לא נופלת.

‏היא צריכה לחזור ל־known state.

---

# ‏154. Recovery Evidence

‏אחרי recovery:

```text
orders reconciled
positions reconciled
risk state reconciled
market data healthy
mode explicit
```

---

# ‏155. `Operational Invariants`

‏נגדיר invariants כגון:

```text
no order without approved risk
no exit quantity above position
no live order in paper mode
no duplicate client order id
```

---

# ‏156. Invariant Breach

‏כל breach הוא incident גם אם PnL לא נפגע.

---

# ‏157. `Safety Before Profitability`

‏Promotion ל־Live אינו מתרחש אם קיימים defects תפעוליים קריטיים.

---

# ‏158. Sample Size

‏יום Paper אחד אינו מספיק להוכיח יציבות.

---

# ‏159. אבל אין מספר קסם

‏צריך כיסוי של תנאי שוק שונים ולא רק N ימים שרירותי.

---

# ‏160. Coverage Matrix

```text
open
midday
close
quiet
fast
wide spread
high activity
low activity
```

---

# ‏161. Coverage over Count

‏עשרה ימים כמעט זהים יכולים ללמד פחות משלושה ימים שונים מאוד.

---

# ‏162. Regime Coverage

‏נמדוד אילו Regimes נראו בתקופת Shadow/Paper.

---

# ‏163. Unseen Regime

‏אם Live עתידי מגיע ל־Regime שלא נבדק:

‏זו סיבה להורדת confidence.

---

# ‏164. Promotion אינו Binary בלבד

‏אפשר להתקדם בהדרגה.

---

# ‏165. Example Promotion Ladder

```text
shadow only
paper only
paper with production data
small live canary
small live normal
scaled live
```

---

# ‏166. Small Live Canary

‏נלמד אותו לעומק בפרקים מאוחרים יותר.

---

# ‏167. למה לא לקפוץ ישר ל־Live מלא

‏כי חלק מהפערים מופיעים רק כשנכנס כסף אמיתי.

---

# ‏168. `Rollback`

‏לכל Promotion צריך להיות Rollback plan.

---

# ‏169. Rollback Trigger

‏יכול להיות:

- ‏latency regression.
- ‏data drift.
- ‏order errors.
- ‏unexpected fills.
- ‏risk breach.

---

# ‏170. Rollback Destination

‏למשל:

```text
LIVE → EXIT_ONLY
PAPER → SHADOW
new version → previous champion
```

---

# ‏171. Version Pinning

‏כל session חייבת לדעת בדיוק איזו גרסה רצה.

---

# ‏172. Config Pinning

‏גם thresholds ו־weights חייבים להיות versioned.

---

# ‏173. Environment Parity

‏נרצה שהבדלים בין Paper ל־Live יהיו קטנים ככל האפשר מבחינת הקוד שלנו.

---

# ‏174. Infrastructure Parity

‏אותו:

- ‏scheduler.
- ‏state machine.
- ‏logging.
- ‏metrics.
- ‏risk engine.

---

# ‏175. Broker Adapter הוא המשתנה המרכזי

‏ולפעמים credentials/environment endpoint.

---

# ‏176. Separate Market Data Provider

‏אפשר בהחלט להשתמש ב־Market Data Provider אחר מה־Execution Broker.

---

# ‏177. Shadow עם Production Data

‏זה אפילו חשוב אם זה ה־feed שמתוכנן ל־Live.

---

# ‏178. Data Provider Comparison

‏אפשר להריץ שני feeds במקביל ב־Shadow.

---

# ‏179. Compare

```text
quote differences
latency differences
missing symbols
stale rate
rank differences
```

---

# ‏180. Cross-Feed Rank Drift

‏אם Feed A ו־Feed B גורמים ל־Top-1 אחר לעיתים קרובות, זה ממצא חשוב.

---

# ‏181. `Provider Independence`

‏ה־Strategy לא צריכה להיות קשורה לשם של ספק מסוים.

---

# ‏182. Canonical Market Event

‏כל Provider Adapter ממיר לפורמט אחיד.

---

# ‏183. Paper Broker Independence

‏אותו עיקרון גם ב־Execution.

---

# ‏184. `Paper Acceptance Test`

‏לפני Promotion, צריך תרחיש end-to-end קבוע.

---

# ‏185. Happy Path

```text
market data arrives
candidate selected
risk approves
order submitted
ack received
fill received
position created
exit triggered
exit filled
position flat
```

---

# ‏186. Non-Happy Paths

‏חשובים לא פחות.

---

# ‏187. Reject Path

```text
broker rejects order
no position created
reason logged
system remains healthy
```

---

# ‏188. No-Fill Path

```text
order rests
TTL expires
cancel
confirmed cancelled
no position
```

---

# ‏189. Partial-Fill Path

```text
partial fill
position partial
remaining order handled
exit knows actual qty
```

---

# ‏190. Disconnect Path

```text
connection drops
state uncertain
reconnect
reconcile
safe mode
```

---

# ‏191. Restart Path

```text
process stops
broker state survives
process starts
reconcile
resume safely
```

---

# ‏192. `Paper Acceptance Matrix`

‏כל אחד מהתרחישים צריך Status:

```text
PASS
FAIL
NOT_TESTED
```

---

# ‏193. `NOT_TESTED` אינו PASS

‏עיקרון חשוב.

---

# ‏194. Evidence Link

‏לכל PASS כדאי לשמור evidence:

- ‏logs.
- ‏run id.
- ‏order ids.
- ‏timestamps.
- ‏assertions.

---

# ‏195. Manual vs Automated Tests

‏חלק מהבדיקות יכולות להיות אוטומטיות וחלק exploratory.

---

# ‏196. Production Dry Run

‏אפשר להפעיל מערכת מלאה עם execution disabled.

---

# ‏197. Dry Run Goal

‏לראות שהכל עובד יחד במשך session שלם.

---

# ‏198. Continuous Shadow

‏Shadow יכול להישאר פעיל גם לאחר מעבר ל־Live.

---

# ‏199. למה

‏אפשר להריץ Challenger, diagnostics ו־counterfactuals בלי סיכון נוסף.

---

# ‏200. Shadow After Live

‏הוא הופך לכלי Research ו־Monitoring קבוע.

---

# ‏201. `Live Twin`

‏רעיון מתקדם:

‏Shadow instance שמקבלת אותם inputs כמו Live אבל אינה שולחת Orders.

---

# ‏202. Live Twin Use

‏אפשר להשוות:

```text
live decisions
shadow decisions
```

‏ולזהות drift.

---

# ‏203. Why decisions diverged

‏סיבות אפשריות:

- ‏state mismatch.
- ‏broker position state.
- ‏timing.
- ‏config drift.
- ‏data differences.

---

# ‏204. Config Drift Detection

‏כל process צריך לפרסם config hash.

---

# ‏205. Version Drift Detection

‏אותו דבר ל־code version.

---

# ‏206. Live/Paper Separation in Storage

‏לא לערבב datasets בלי Environment field.

---

# ‏207. Mandatory Fields

```text
environment
run_id
strategy_version
execution_source
```

---

# ‏208. Analytics Filter

‏כל dashboard צריך לאפשר פילוח לפי Environment.

---

# ‏209. Common Anti-Pattern — Paper PnL Worship

‏טעות:

> ‏“Paper הרוויח שבוע, אז אנחנו מוכנים.”

‏לא בהכרח.

---

# ‏210. Common Anti-Pattern — Perfect Fill Assumption

‏Paper אינו אישור שה־fills מציאותיים.

---

# ‏211. Common Anti-Pattern — Different Code Path

‏אם Paper משתמש בקוד אחר לגמרי מ־Live, הוא בודק מעט מדי.

---

# ‏212. Common Anti-Pattern — No Reconciliation

‏Order API שעובד בלי reconciliation אינו production-ready.

---

# ‏213. Common Anti-Pattern — Testing Only Happy Path

‏רוב התקלות הקשות נמצאות דווקא ב־edge cases.

---

# ‏214. Common Anti-Pattern — Tweaking During Forward Test

‏כך ה־Forward Test הופך שוב ל־Training.

---

# ‏215. Common Anti-Pattern — Ignoring Data Quality

‏Scanner יכול להיראות מצוין כי Feed קפוא יצר Features מוזרים.

---

# ‏216. Common Anti-Pattern — PnL without Attribution

‏צריך לדעת למה הרווחנו או הפסדנו.

---

# ‏217. Common Anti-Pattern — No Environment Guard

‏זה מסוכן תפעולית.

---

# ‏218. Common Anti-Pattern — Treating Reconnect as Success Because Socket Reopened

‏אחרי reconnect חייבים reconciliation.

---

# ‏219. Common Anti-Pattern — Ignoring Unknown State

‏`UNKNOWN` הוא state אמיתי, לא null.

---

# ‏220. Practitioner Insight — Shadow Finds Different Bugs than Backtest

‏Backtest מוצא research bugs.

‏Shadow מוצא timing/data/operations bugs.

---

# ‏221. Practitioner Insight — Paper Finds Different Bugs than Shadow

‏Paper מוסיף broker lifecycle ו־position management.

---

# ‏222. Practitioner Insight — Winning Paper Trades Can Hide Bad Infrastructure

‏Profitability אינה תחליף ל־correctness.

---

# ‏223. Practitioner Insight — Losing Paper Trades Can Still Be a Successful Test

‏אם המערכת פעלה נכון והאסטרטגיה פשוט חוותה variance, התשתית אולי עברה את המבחן.

---

# ‏224. Practitioner Insight — Separate Alpha Failure from Platform Failure

‏זה חוזר שוב ושוב בקורס כי זה קריטי.

---

# ‏225. Practitioner Insight — Promotion Requires Evidence, Not Confidence

‏תחושת ביטחון אינה metric.

---

# ‏226. Practitioner Insight — Long Quiet Runs Matter

‏לא רק ימים דרמטיים חשובים.

‏מערכת צריכה להישאר נכונה גם כשכמעט אין מה לעשות.

---

# ‏227. Practitioner Insight — `NO TRADE` Stability Matters

‏Scanner שלא יודע להישאר בחוץ יכול לייצר churn גם כשהוא “חכם”.

---

# ‏228. Practitioner Insight — Operational Silence Can Be Dangerous

‏אין Alerts לא אומר שהכול תקין אם monitoring עצמו נפל.

---

# ‏229. Heartbeat

‏כל subsystem מרכזי צריך heartbeat/health state.

---

# ‏230. Health vs Readiness

‏נבדיל בין:

```text
process_alive
ready_to_trade
```

---

# ‏231. Example

‏Process יכול להיות alive אבל לא ready בגלל stale market data.

---

# ‏232. `Trading Readiness Contract`

‏לפני כל Entry:

```text
market_data_healthy
scanner_healthy
risk_healthy
broker_healthy
clock_healthy
mode_allows_entry
```

---

# ‏233. Shadow מאפשר לבדוק את החוזה

‏בלי כסף אמיתי.

---

# ‏234. Paper מאפשר לבדוק אותו עם Broker Lifecycle

‏עוד לפני Live.

---

# ‏235. התאמה לרובוט שלך

‏אצלך ה־Shadow Mode חשוב במיוחד כי ה־Scanner סורק אלפי מניות.

---

# ‏236. מה נרצה למדוד אצלך

```text
universe_size
symbols_fresh
symbols_stale
scan_cycle_ms
feature_compute_ms
ranking_ms
top1_changes
signal_age_ms
```

---

# ‏237. Whole-Market Freshness Ratio

```text
fresh_symbols / expected_universe
```

---

# ‏238. למה זה חשוב

‏Top-1 אינו משמעותי אם חלק גדול מהשוק לא עודכן.

---

# ‏239. Rank Completeness

‏לפני Trade Decision נרצה לדעת כמה מה־Universe באמת השתתף בדירוג.

---

# ‏240. `Coverage Gate`

‏אפשר להגדיר כלל מחקרי:

> ‏לא לקבל Decision אם Coverage נמוך מהסף שנבדק והוגדר מראש.

---

# ‏241. Fast Scanner Problem

‏בסריקה של אלפי symbols, חלק מהמידע תמיד יהיה מעט ישן יותר מאחרים.

---

# ‏242. לכן Age Distribution

‏לא מספיק average quote age.

‏נרצה P50/P95/P99.

---

# ‏243. Top Candidate Freshness

‏Top-1 עצמו צריך לעבור freshness gate קשיח יותר.

---

# ‏244. Rank Snapshot Consistency

‏צריך להבין אם Rank מחושב מסnapshot עקבי או מעדכונים streaming לא־סימולטניים.

---

# ‏245. Shadow הוא המקום למדוד את זה

‏כי כאן אפשר לראות real arrival patterns.

---

# ‏246. Candidate Replacement Rate

‏נמדוד כמה מהר #1 מוחלף ב־#2 חדש.

---

# ‏247. Churn Cost Estimate

‏גם ב־Shadow אפשר להעריך כמה switching היה עולה.

---

# ‏248. `Signal Survival to Order Time`

‏נמדוד איזה אחוז מהSignals עדיין היו תקפים לאחר latency ריאליסטי.

---

# ‏249. `Signal Survival to Fill Time`

‏נמדוד גם לאחר fill latency משוער/Paper.

---

# ‏250. זה metric קריטי אצלך

‏כי אם Rank #1 מתחלף מהר יותר מהזמן שלוקח לבצע Entry, המודל אולי מנבא משהו שלא ניתן למסחר.

---

# ‏251. Research Baseline לרובוט שלך

‏Baseline טוב לשלב זה:

```text
1. Live market data
2. Full scanner
3. Shadow decisions
4. Record Top-N and reasons
5. Simulate conservative execution
6. Measure forward executable outcomes
7. Replay each session offline
8. Compare replay decisions to live-shadow decisions
9. Fix any unexplained divergence
10. Only then add paper broker lifecycle
```

---

# ‏252. לאחר מכן Paper Baseline

```text
1. Same strategy core
2. Same risk engine
3. Same order intents
4. Paper broker adapter
5. Full order state machine
6. Reconciliation
7. Restart/reconnect tests
8. End-of-session audit
```

---

# ‏253. `End-of-Session Audit`

‏בסוף session:

```text
open orders = expected
positions = expected
local state = broker state
no unexplained unknowns
all incidents classified
```

---

# ‏254. Flatness Check

‏אם המדיניות דורשת להיות flat בסוף session:

‏צריך לאמת זאת מול broker truth.

---

# ‏255. Orphan Order Check

‏אין להשאיר Orders שהמערכת איבדה קשר אליהם.

---

# ‏256. Reconciliation Report

‏נשמור דוח מפורש ולא רק log scattered.

---

# ‏257. Daily Promotion Decision

‏לא בהכרח מקדמים כל יום.

‏אפשר להחליט:

```text
CONTINUE_SHADOW
CONTINUE_PAPER
BLOCKED
READY_FOR_NEXT_GATE
```

---

# ‏258. `BLOCKED`

‏מופעל אם יש incident קריטי לא פתור.

---

# ‏259. Best Practice — Freeze Before Measurement

‏אל תשנה Strategy באמצע חלון validation בלי לפתוח version חדשה.

---

# ‏260. Best Practice — Same Core Everywhere

‏Backtest/Replay/Shadow/Paper/Live צריכים לחלוק כמה שיותר logic.

---

# ‏261. Best Practice — Record Raw Inputs

‏כדי שאפשר יהיה לשחזר החלטות.

---

# ‏262. Best Practice — Preserve Failed Sessions

‏דווקא ימים שבורים הם datasets יקרי ערך.

---

# ‏263. Best Practice — Track Unknowns Explicitly

‏לא למחוק חוסר ודאות באמצעות default value.

---

# ‏264. Best Practice — Compare Every Layer

```text
input
feature
score
rank
decision
order
fill
position
exit
```

---

# ‏265. Best Practice — Build Environment Guards Early

‏לא מחכים ליום שבו Live מתחיל.

---

# ‏266. Best Practice — Treat Paper as Systems Test

‏לא רק Strategy test.

---

# ‏267. Best Practice — Shadow Is Permanent Infrastructure

‏לא כלי חד־פעמי לפני ההשקה.

---

# ‏268. Best Practice — Promotion Gates Versioned

‏גם הקריטריונים לקידום צריכים להיות מתועדים.

---

# ‏269. Best Practice — Evidence before Exception

‏לא עוקפים Gate בגלל “נראה שהכול בסדר”.

---

# ‏270. שאלות שאתה צריך לדעת לענות עליהן אחרי הפרק

1. ‏מה ההבדל בין `Shadow`, ‏`Paper` ו־`Live`?
2. ‏מה Shadow יכול להוכיח ומה לא?
3. ‏למה Paper Fill אינו בהכרח Realistic Fill?
4. ‏מהו Forward Validation?
5. ‏למה צריך Freeze לגרסה לפני validation?
6. ‏מהו `Training/Serving Skew`?
7. ‏מהו `First Divergence`?
8. ‏למה Reconciliation הוא חובה?
9. ‏מה עושים ב־Unknown Order State?
10. ‏למה PnL חיובי ב־Paper אינו Promotion criterion מספיק?
11. ‏מהם Promotion Gates?
12. ‏למה Whole-market freshness חשוב במיוחד לרובוט שלך?
13. ‏מהו `Signal Survival to Fill Time`?
14. ‏למה Shadow צריך להישאר גם אחרי מעבר ל־Live?

---

# ‏271. Checklist — Shadow Readiness

- ‏Live feed מחובר.
- ‏Universe ידוע.
- ‏Data freshness נמדד.
- ‏Strategy version pinned.
- ‏Config version pinned.
- ‏Decision snapshots נשמרים.
- ‏Top-N נשמר.
- ‏Rejected candidates נשמרים.
- ‏`NO TRADE` reasons נשמרים.
- ‏Latency נמדד.
- ‏Session ניתנת ל־Replay.

---

# ‏272. Checklist — Paper Readiness

- ‏Shadow יציב.
- ‏Broker adapter קיים.
- ‏Environment guard קיים.
- ‏Order state machine מלא.
- ‏Partial fills נתמכים.
- ‏Cancel/replace נתמך.
- ‏Unknown state נתמך.
- ‏Reconciliation נתמך.
- ‏Restart tested.
- ‏Disconnect/reconnect tested.
- ‏Risk engine פעיל.
- ‏Kill switch tested.

---

# ‏273. Checklist — Promotion Evidence

- ‏אין incidents קריטיים לא פתורים.
- ‏Prediction metrics עקביים.
- ‏Execution metrics מובנים.
- ‏Data quality תקין.
- ‏Latency tails מוכרים.
- ‏Risk invariants לא נשברו.
- ‏Reconciliation נקי.
- ‏Coverage של כמה Regimes.
- ‏גרסה/config frozen.
- ‏Run logs ניתנים לשחזור.

---

# ‏274. משפט המפתח של הפרק

> ‏**`Shadow` בודק אם המוח של הרובוט עובד בשוק חי; `Paper` בודק אם הגוף שלו יודע לבצע lifecycle אמיתי של Orders; ורק אחר כך אפשר בכלל להתחיל לשאול איך הוא מתנהג עם כסף אמיתי.**

---

# ‏275. מה מגיע בשלב הבא

‏בשלב 29 נעבור ל־`Broker API Architecture`.

‏שם נבנה את הגבול המקצועי בין:

```text
Strategy
Risk Engine
Execution Engine
Broker Adapter
Broker API
```

‏נלמד identifiers, callbacks/events, reconnects, idempotency, reconciliation, rate limits, order mapping, broker truth, startup recovery, error taxonomy ו־provider-agnostic design — כדי שהרובוט לא יהיה קשור לברוקר אחד ולא יתפרק כאשר API מתנהג בצורה לא מושלמת.
