# ‏שלב 80 — `Complete Robot Architecture`: ארכיטקטורה מלאה לרובוט Short-Horizon מקצועי

> ‏מטרת הפרק: לחבר את כל מה שנבנה בקורס לארכיטקטורת מערכת אחת, עקבית וניתנת למימוש. נבנה את שרשרת ה־`Market Data → Canonical State → Features → Ranking → Negative Evidence → Decision → Execution → Broker Truth → Position → Exit → Ledger → Replay → Learning`, נגדיר גבולות אחריות, Contracts, State Machines, Hot/Cold Paths, Failure Containment, Recovery, Observability, Versioning ו־Operational Governance.
>
> ‏העיקרון המרכזי: **Robot מקצועי אינו לולאה שמוצאת Symbol ושולחת Order. הוא מערכת של Planes נפרדים עם Truth Sources ברורים, Contracts מפורשים ו־Failure Boundaries שמונעים מתקלה מקומית להפוך לחשיפה לא ידועה.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח. שימוש בכסף אמיתי מחייב זכאות והרשאה מתאימות, עמידה בכללי החשבון וה־Broker, ותהליך readiness מלא.

---

## ‏1. ה־North Star הארכיטקטוני

```text
MarketDataProvider
→ Ingestion
→ Canonical Market State
→ Feature Engine
→ Eligibility
→ Positive Evidence / Score
→ Negative Evidence / Veto
→ Execution Feasibility
→ Decision Aggregator
→ Order Intent
→ ExecutionBroker
→ Broker Truth
→ Position State
→ Exit Engine
→ Flat / Reconciled

Everything
→ Event Journal
→ Metrics / Traces / Logs
→ Replay / RCA / Daily Review / Research
```

‏המטרה אינה רק לקבל החלטה מהר.

‏המטרה היא לקבל החלטה שניתן:

- ‏להסביר.
- ‏לשחזר.
- ‏לבדוק.
- ‏לבטל.
- ‏להשוות לגרסה אחרת.
- ‏להתאושש ממנה אחרי failure.

---

## ‏2. שבעת ה־Planes של המערכת

### ‏2.1 `Data Plane`

‏אחראי לקבל, לנרמל, לאמת ולהפיץ Market Data.

### ‏2.2 `Decision Plane`

‏אחראי Features, Eligibility, Score, Rank, Veto ו־`TRADE / NO_TRADE`.

### ‏2.3 `Execution Plane`

‏אחראי להפוך `OrderIntent` לפעולות Broker ולעקוב אחרי lifecycle של Orders.

### ‏2.4 `Position / Exit Plane`

‏אחראי לחשיפה קיימת, Exit urgency, flattening ו־`TimeToFlat`.

### ‏2.5 `Control Plane`

‏אחראי permissions, kill switches, mode, configuration, deployment state ו־operator controls.

### ‏2.6 `Evidence / Replay Plane`

‏אחראי event journal, Decision Packets, deterministic replay, RCA ו־historical reproducibility.

### ‏2.7 `Learning Plane`

‏אחראי research, Daily Review, Champion/Challenger ו־Continuous Improvement.

‏ה־Learning Plane אינו משנה Production ישירות.

---

## ‏3. הפרדת Hot Path מ־Cold Path

```text
Hot Path
Data → Features → Rank/Veto → Decision → Order → Position/Exit

Cold Path
Persistence
Analytics
Daily Review
Deep diagnostics
Research
Model training
Long-term reports
```

‏מה שלא חייב להיות ב־Hot Path לא צריך להיות בו.

‏כל millisecond של עבודה שאינה נדרשת להחלטה צריך להצדיק את קיומו.

---

## ‏4. `MarketDataProvider` כ־Port

‏ה־Strategy אינה יודעת אם המקור הוא Broker, Exchange feed או Provider חיצוני.

```text
interface MarketDataProvider
{
    SubscribeUniverse(...)
    GetSnapshot(...)
    StreamEvents(...)
    GetHealth(...)
}
```

‏ה־Contract צריך להגדיר semantics, לא רק method names.

---

## ‏5. `ExecutionBroker` כ־Port נפרד

```text
interface ExecutionBroker
{
    Submit(...)
    Cancel(...)
    Replace(...)
    GetOpenOrders(...)
    GetPositions(...)
    GetAccountState(...)
}
```

‏Data provider ו־execution broker יכולים להיות אותו ספק — אבל הארכיטקטורה לא מניחה זאת.

---

## ‏6. Adapter Boundary

‏כל Provider-specific quirk נשאר ב־Adapter.

‏לדוגמה:

- ‏field naming.
- ‏status codes.
- ‏reconnect behavior.
- ‏throttling.
- ‏order IDs.
- ‏partial-fill semantics.
- ‏market-data condition codes.

‏ה־Domain Core לא צריך לזהות שם Broker.

---

## ‏7. Canonical Market Event

```text
MarketEvent
- SymbolId
- EventType
- ExchangeTimestamp
- ProviderTimestamp
- ReceiveTimestamp
- Sequence
- Price
- Size
- Bid
- Ask
- BidSize
- AskSize
- Conditions
- DataQualityState
- DataGeneration
```

‏לא כל event חייב להכיל את כל השדות.

---

## ‏8. `SymbolId` ולא Symbol String בלבד

‏Ticker יכול להשתנות.

‏לכן יש להחזיק identity יציב פנימי ולהפריד בינו לבין display symbol.

---

## ‏9. Time Domains

‏נשמור לפחות:

```text
ExchangeTime
ProviderTime
ReceiveTime
ProcessTime
DecisionTime
SubmitTime
AckTime
FillTime
FlatTime
```

‏בלי הפרדה זו אי־אפשר לבצע latency attribution אמין.

---

## ‏10. Clock Health

‏Clock drift הוא failure תפעולי.

‏המערכת צריכה למדוד:

- ‏offset.
- ‏jitter.
- ‏last synchronization.
- ‏clock anomaly.

---

## ‏11. Canonical Market State

‏לכל Symbol נשמור state נורמלי אחד:

```text
SymbolMarketState
- LastTrade
- BestBid
- BestAsk
- Mid
- Spread
- TradeRate
- VolumeState
- DepthState
- Freshness
- SessionState
- HaltState
- DataQuality
```

---

## ‏12. Immutable Events, Mutable State

‏Events נשמרים append-only.

‏State הוא projection משתנה של events.

‏ההפרדה מאפשרת replay ו־RCA.

---

## ‏13. `DataGeneration`

‏Reconnect או provider reset יכול לפתוח generation חדש.

‏Callbacks מ־generation ישן אינם רשאים לעדכן state חדש.

---

## ‏14. Sequence Integrity

‏כאשר feed מספק sequence, יש לזהות:

- ‏gap.
- ‏duplicate.
- ‏out-of-order.
- ‏reset.

---

## ‏15. Data Quality State

```text
GOOD
DEGRADED
STALE
GAPPED
UNKNOWN
INVALID
```

‏Quality הוא חלק מה־domain, לא log message.

---

## ‏16. `Freshness` פר Symbol

‏Market-wide heartbeat אינו מספיק.

‏Symbol יכול להיות stale כאשר שאר הפיד חי.

---

## ‏17. Fresh Coverage

```text
FreshCoverage = FreshEligibleSymbols / EligibleSymbols
```

‏Rank על universe שחלקו stale אינו rank הוגן.

---

## ‏18. Session Service

‏שירות נפרד אחראי ל־calendar, session phase, holidays, early closes ו־auction phases.

‏Strategy אינה מחזיקה לוח שנה hard-coded.

---

## ‏19. Universe Service

‏אחראי להרכב universe ול־eligibility בסיסי.

```text
UniverseMember
- SymbolId
- ActiveFrom
- ActiveTo
- InstrumentType
- Exchange
- EligibilityState
```

---

## ‏20. Historical Universe

‏Backtest צריך universe point-in-time, לא רשימת symbols של היום.

---

## ‏21. Feature Engine

‏Feature Engine צורך Canonical State, לא Provider DTOs.

---

## ‏22. Incremental Features

‏ב־~4,000 symbols אין סיבה לחשב כל feature מהיסטוריה מלאה בכל tick.

‏נעדיף updates אינקרמנטליים.

---

## ‏23. Feature State

```text
FeatureValue
- FeatureId
- Value
- ComputedAt
- BasedOnDataThrough
- Status
- Version
```

---

## ‏24. Feature Status

```text
READY
NOT_READY
STALE
INVALID
UNKNOWN
```

‏`0` אינו תחליף ל־`NOT_READY`.

---

## ‏25. Feature TTL

‏לכל Feature יש validity horizon.

‏Feature valid ל־30 שניות אינו בהכרח usable אחרי 3 שניות אם ה־signal half-life קצר.

---

## ‏26. Feature Dependency Graph

‏צריך לדעת איזה Feature תלוי באיזה raw fields ובאילו Features אחרים.

---

## ‏27. Feature Version

‏שינוי formula הוא שינוי Version.

‏אסור להשתמש באותו `FeatureId` ל־semantics שונים.

---

## ‏28. Fast Features

‏Features זולים, עדכניים ורחבים לכל universe.

---

## ‏29. Deep Features

‏Features יקרים יותר שמחושבים רק ל־Top-N או shortlist.

---

## ‏30. Two-Stage Scanner

```text
Whole Universe
→ Fast Features
→ Fast Rank
→ Top-N
→ Deep Features
→ Deep Rank / Veto
```

---

## ‏31. Fast Path Deadline

‏Fast pass חייב להסתיים בתוך budget ידוע.

‏אחרת rank של symbols מאוחרים נהיה לא הוגן.

---

## ‏32. Scheduler Fairness

‏אין לתת ל־hot symbols להרעיב symbols אחרים.

---

## ‏33. Work Coalescing

‏אם הגיעו חמישה updates לפני שה־feature worker הספיק לעבד, לעיתים נכון לעבד את המצב האחרון במקום כל intermediate event.

‏אבל raw events עדיין נשמרים ל־replay.

---

## ‏34. Backpressure

‏Backpressure חייב להיות observable ומדיד.

‏אסור ש־queue תגדל בלי bound.

---

## ‏35. Load Shedding

‏בעת overload:

1. ‏נעדיף מידע הנדרש ל־open positions.
2. ‏אחר כך active orders.
3. ‏אחר כך top candidates.
4. ‏ורק בסוף low-priority exploration.

---

## ‏36. Prediction Layer

‏יכול להיות rule-based, linear, tree, ML או hybrid.

‏ה־architecture אינה תלויה בסוג המודל.

---

## ‏37. Score Contract

```text
ScoreResult
- SymbolId
- Score
- Confidence
- FeatureSnapshotId
- StrategyVersion
- ComputedAt
- ValidUntil
```

---

## ‏38. Rank Engine

‏Rank Engine עובד על set קוהרנטי של candidates.

---

## ‏39. `DecisionEpoch`

‏כל ranking cycle מקבל epoch.

‏כך ניתן לדעת אילו symbols השתתפו באותו cross-section.

---

## ‏40. Rank Fairness

‏אין להשוות score fresh מלפני 20ms ל־score stale מלפני 3 שניות בלי penalty/eligibility מפורש.

---

## ‏41. Rank Metadata

```text
RankResult
- Rank
- Score
- RankGap
- RankAge
- RankPersistence
- RankChurn
- EpochId
```

---

## ‏42. Top-K Snapshot

‏לא נשמור רק Rank #1.

‏Top-K נדרש ל־RCA ול־counterfactual research.

---

## ‏43. Positive Evidence Engine

‏מחשב עד כמה Candidate נראה מבטיח.

---

## ‏44. Negative Evidence Engine

‏מחשב למה Candidate לא צריך להתקדם.

```text
HardVeto
SoftPenalty
Cooldown
```

---

## ‏45. Negative Memory Store

‏שומר failed breakout, toxic fills, spread shocks, liquidity withdrawal ו־recent adverse behavior.

---

## ‏46. Veto TTL

‏Negative evidence צריך expiration או reset semantics.

---

## ‏47. Veto Reason Codes

‏כל חסימה חייבת ReasonCode יציב.

---

## ‏48. Entry Blocks אינם Exit Blocks

‏מנגנון שמונע entry לא צריך למנוע יציאה מפוזיציה.

---

## ‏49. Execution Feasibility Engine

‏בודק:

- ‏spread.
- ‏depth.
- ‏fill probability.
- ‏expected slippage.
- ‏fees.
- ‏latency.
- ‏account eligibility.
- ‏borrow feasibility אם רלוונטי.

---

## ‏50. Remaining Net Edge

```text
RemainingNetEdge
= ExpectedGrossEdge
- ExpectedSpreadCost
- ExpectedSlippage
- ExpectedFees
- ExpectedImpact
- ExpectedLatencyDecay
- ExpectedAdverseSelection
```

---

## ‏51. `NO_TRADE` הוא Output תקין

‏המערכת אינה חייבת לבחור מניה בכל cycle.

---

## ‏52. Decision Aggregator

```text
Decision
- TRADE
- NO_TRADE
- UNKNOWN
```

---

## ‏53. `UNKNOWN` אינו `NO_TRADE`

‏`NO_TRADE` = ראינו מספיק והחלטנו לא לפעול.

‏`UNKNOWN` = אין לנו confidence שהמערכת רואה את המציאות נכון.

---

## ‏54. Fail Closed for New Exposure

‏ב־`UNKNOWN` לא פותחים exposure חדש.

---

## ‏55. Decision Snapshot

‏כל החלטה צריכה לשמור:

```text
DecisionPacket
- DecisionId
- EpochId
- SymbolId
- TopK
- FeatureSnapshot
- PositiveEvidence
- NegativeEvidence
- Feasibility
- Context
- StrategyVersion
- DataGeneration
- DecisionTime
```

---

## ‏56. Order Intent

‏Decision אינו Order.

```text
OrderIntent
- IntentId
- DecisionId
- SymbolId
- Side
- QuantityPolicy
- PricePolicy
- TimeInForcePolicy
- Expiry
- Reason
```

---

## ‏57. Persist Intent Before Send

‏לפני network call ל־Broker, ה־intent צריך להיות durable.

---

## ‏58. Idempotency

‏Retry אינו רשאי לייצר Order חדש במקרה שהראשון כבר התקבל.

---

## ‏59. Client Order ID

‏מזהה יציב מקשר בין internal intent לבין broker order.

---

## ‏60. Execution State Machine

```text
CREATED
PERSISTED
SUBMITTING
UNKNOWN_EFFECT
ACKNOWLEDGED
WORKING
PARTIALLY_FILLED
FILLED
CANCEL_PENDING
CANCELLED
REJECTED
EXPIRED
```

---

## ‏61. `UNKNOWN_EFFECT`

‏אם connection נפל בזמן submit, אסור להניח failure.

‏צריך reconcile מול Broker Truth.

---

## ‏62. Broker Truth

‏ל־orders ו־positions, Broker Truth גובר על local assumption אחרי reconciliation.

---

## ‏63. Reconciliation Service

‏משווה:

- ‏local orders.
- ‏broker open orders.
- ‏fills.
- ‏positions.
- ‏cash/account state.

---

## ‏64. Startup Reconciliation

‏אסור להתחיל trading לפני שיודעים מה כבר קיים בחשבון.

---

## ‏65. Reconnect Reconciliation

‏כל reconnect משמעותי מחייב re-sync לפני new exposure.

---

## ‏66. Partial Fills

‏Partial fill יוצר exposure אמיתי.

‏State machine חייב להתייחס אליו כ־position, לא כ־order “שעוד לא סיים”.

---

## ‏67. Cancel/Fill Race

‏Cancel request אינו אומר cancelled.

‏Fill יכול להגיע בזמן cancel pending.

---

## ‏68. Replace Semantics

‏Replace יכול לאבד queue priority או להפוך ל־cancel+new בהתאם למקום הביצוע.

‏ה־Adapter חייב להסתיר provider-specific mechanics אך לא להסתיר את המשמעות הכלכלית.

---

## ‏69. Order TTL

‏Order שאינו מתמלא בזמן שבו ה־signal עדיין חי צריך להיבחן מחדש.

---

## ‏70. Decision TTL

‏Decision ישן אינו reusable אוטומטית.

---

## ‏71. Pre-Submit Revalidation

‏לפני submit יש לבדוק מחדש:

- ‏freshness.
- ‏spread.
- ‏price move.
- ‏veto state.
- ‏position state.
- ‏account state.
- ‏remaining edge.

---

## ‏72. Entry Policy

‏Entry Policy הוא component עצמאי.

‏הוא אינו חלק מה־Prediction model.

---

## ‏73. Exit Engine נפרד

‏Exit Engine מקבל עדיפות גבוהה יותר מ־new-entry scanning כאשר יש exposure.

---

## ‏74. Position State Machine

```text
FLAT
ENTRY_PENDING
OPEN
EXIT_PENDING
PARTIALLY_EXITED
UNKNOWN_EXPOSURE
```

---

## ‏75. Position Truth

‏Position state נגזר מ־fills + broker reconciliation, לא רק מה־orders ששלחנו.

---

## ‏76. Dedicated Position Monitor

‏Position monitor ממשיך גם אם Scanner מושבת.

---

## ‏77. Exit Signals

‏Exit יכול להיגרם מ:

- ‏target.
- ‏signal decay.
- ‏negative evidence.
- ‏liquidity deterioration.
- ‏time stop.
- ‏risk event.
- ‏operator kill.
- ‏system degradation.

---

## ‏78. Exit Urgency

```text
NORMAL
ELEVATED
URGENT
EMERGENCY
```

---

## ‏79. Exit Feasibility

‏גם Exit צריך market-aware execution policy.

---

## ‏80. `TimeToFlat`

‏זה metric תפעולי וכלכלי מרכזי.

---

## ‏81. Exit Giveback

‏נמדוד כמה edge נעלם בין החלטת exit לבין flat בפועל.

---

## ‏82. Entry vs Exit Resource Priority

‏בעת resource pressure, Exit מקבל קדימות.

---

## ‏83. Control Plane

‏Control Plane אינו תלוי ב־Strategy runtime בלבד.

---

## ‏84. Trading Modes

```text
OFF
REPLAY
SHADOW
PAPER
LIVE_DISABLED
LIVE_ARMED
LIVE_ACTIVE
SAFE_MODE
```

---

## ‏85. Explicit Arming

‏מעבר ל־mode עם אפשרות לשליחת orders דורש state מפורש ולא implication מקונפיגורציה מקרית.

---

## ‏86. Environment Separation

‏`DEV`, ‏`TEST`, ‏`PAPER`, ‏`LIVE` צריכים credentials, endpoints ו־state stores נפרדים.

---

## ‏87. Kill Switch

‏Kill Switch צריך להיות מסוגל לעצור new exposure במהירות.

---

## ‏88. `DisableNewEntries`

‏פעולה זו אינה זהה ל־`FlattenAll`.

---

## ‏89. Symbol Quarantine

‏אפשר להשבית Symbol בעייתי בלי לכבות את כל המערכת.

---

## ‏90. Global Quarantine

‏כאשר Data/Broker/Clock/State health נפגע ברמה מערכתית.

---

## ‏91. Kill Switch Independence

‏רצוי שמנגנון safety קריטי לא יהיה תלוי לחלוטין באותו component שעלול להיות התקול.

---

## ‏92. Single Writer

‏ל־live account צריך authority ברורה אחת לשליחת strategy orders.

---

## ‏93. Fencing Token

‏Instance חדש מקבל generation/token שמונע instance ישן להמשיך לפעול אחרי failover.

---

## ‏94. Split-Brain Protection

‏שני instances שחושבים שהם leader הם failure קריטי.

---

## ‏95. Strategy Manifest

```text
StrategyManifest
- StrategyVersion
- CodeRevision
- ConfigFingerprint
- FeatureSetVersion
- ModelVersion
- VetoPolicyVersion
- RiskPolicyVersion
- ExecutionPolicyVersion
- DataContractVersion
- BrokerAdapterVersion
```

---

## ‏96. Immutable Deployment Identity

‏כל process live מדווח manifest immutable.

---

## ‏97. Config Validation

‏Config שגוי צריך לעצור startup לפני trading.

---

## ‏98. Config Fingerprint

‏Hash קנוני מאפשר לזהות בדיוק מה היה loaded.

---

## ‏99. Hot Reload

‏Hot reload מותר רק ל־fields שהוגדרו מראש כ־hot-reload safe.

---

## ‏100. Strategy Transition Event

‏כל שינוי פעיל נרשם כ־event audit.

---

## ‏101. Persistence Layers

‏נפריד בין:

- ‏event journal.
- ‏current state snapshots.
- ‏research warehouse.
- ‏metrics store.
- ‏configuration registry.

---

## ‏102. Event Journal

‏Append-only source ל־RCA ו־replay.

---

## ‏103. Snapshot Store

‏מאיץ restart אך אינו מחליף את journal.

---

## ‏104. Snapshot + Journal Recovery

```text
Load latest valid snapshot
→ Replay journal tail
→ Reconcile broker
→ Validate invariants
→ Enter safe ready state
```

---

## ‏105. Exactly-Once אינו הנחת בסיס

‏נבנה consumers idempotent שיכולים להתמודד עם duplicates.

---

## ‏106. Event Identity

‏כל event משמעותי צריך unique identity או deterministic dedup key.

---

## ‏107. Schema Versioning

‏Persisted events צריכים version.

---

## ‏108. Forward/Backward Compatibility

‏שינוי schema צריך migration strategy.

---

## ‏109. Retention Policy

‏Raw market data, decisions, orders, fills ו־incidents לא חייבים אותו retention horizon.

---

## ‏110. Research Warehouse

‏מחקר כבד לא רץ על storage של ה־Hot Path.

---

## ‏111. Replay Engine

‏Replay צורך את אותם Domain Events ככל האפשר.

---

## ‏112. Deterministic Replay

‏אותם inputs + אותה version צריכים להחזיר אותן decisions כאשר אין stochastic component.

---

## ‏113. Stochastic Execution Simulation

‏אם fill model הסתברותי, seed/version חייבים להישמר.

---

## ‏114. `AsObserved` Replay

‏משחזר מה שהמערכת באמת ראתה.

---

## ‏115. `AsCorrected` Replay

‏משתמש בנתונים שתוקנו מאוחר יותר למחקר אחר.

---

## ‏116. אסור לערבב ביניהם

‏אחרת RCA יכול להסיק מסקנה על מידע שלא היה זמין בזמן אמת.

---

## ‏117. Observability Plane

‏Metrics, Logs ו־Traces הם outputs ראשיים של המערכת.

---

## ‏118. Structured Logs

‏Log צריך fields קבועים:

```text
DecisionId
IntentId
OrderId
SymbolId
StrategyVersion
DataGeneration
ReasonCode
```

---

## ‏119. Trace של Trade Lifecycle

```text
Market Event
→ Feature
→ Rank
→ Decision
→ Intent
→ Submit
→ Ack
→ Fill
→ Exit
→ Flat
```

---

## ‏120. Latency Histograms

‏נמדוד `p50/p95/p99`, לא רק average.

---

## ‏121. Data Metrics

- ‏FreshCoverage.
- ‏event lag.
- ‏gap rate.
- ‏duplicate rate.
- ‏out-of-order rate.

---

## ‏122. Scanner Metrics

- ‏rank churn.
- ‏rank gap.
- ‏top1 age.
- ‏decision rate.
- ‏no-trade rate.

---

## ‏123. Veto Metrics

- ‏veto rate.
- ‏reason distribution.
- ‏false-veto estimate.
- ‏cooldown activation.

---

## ‏124. Execution Metrics

- ‏submit latency.
- ‏ack latency.
- ‏fill latency.
- ‏cancel latency.
- ‏reject rate.
- ‏partial-fill rate.

---

## ‏125. Economic Metrics

- ‏gross edge.
- ‏net edge.
- ‏spread cost.
- ‏slippage.
- ‏fees.
- ‏markout.
- ‏capture ratio.

---

## ‏126. Position Metrics

- ‏time open.
- ‏TimeToFlat.
- ‏MFE.
- ‏MAE.
- ‏exit giveback.

---

## ‏127. Safety Metrics

- ‏unknown exposure count.
- ‏reconciliation mismatch.
- ‏kill-switch activation.
- ‏duplicate-order prevention.

---

## ‏128. Leading Indicators

‏נעדיף alerts שמזהים deterioration לפני PnL loss.

---

## ‏129. Alert Severity

```text
INFO
WARNING
HIGH
CRITICAL
```

---

## ‏130. Alert Deduplication

‏Alert storm אינו observability טוב.

---

## ‏131. Incident Packet

```text
IncidentPacket
- Timeline
- Versions
- DataHealth
- Decisions
- Orders
- BrokerTruth
- PositionState
- FirstDivergence
- Logs
- Metrics
```

---

## ‏132. First Divergence RCA

‏מחפשים את הנקודה הראשונה שבה expected ו־actual נפרדו.

---

## ‏133. Security Boundary

‏Trading credentials אינם זמינים ל־research jobs.

---

## ‏134. Least Privilege

‏כל component מקבל רק הרשאות שהוא צריך.

---

## ‏135. Secret Storage

‏אין secrets בקוד, logs או repo.

---

## ‏136. Secret Rotation

‏Rotation חייבת להיות נתמכת בלי לשבור recovery.

---

## ‏137. Audit of Manual Actions

‏כל manual override נרשם.

---

## ‏138. Operator Identity

‏במערכת multi-user צריך לדעת מי ביצע פעולה.

---

## ‏139. Deployment Strategy

‏Deploy אינו “copy files and restart”.

---

## ‏140. Pre-Deploy Checks

- ‏tests.
- ‏manifest validity.
- ‏config validation.
- ‏schema compatibility.
- ‏replay smoke.
- ‏rollback readiness.

---

## ‏141. Safe Startup

‏Startup מתחיל non-trading.

---

## ‏142. Startup Gate

```text
Config valid
AND clocks healthy
AND data healthy
AND broker connected
AND reconciliation clean
AND permissions valid
AND no unknown exposure
```

---

## ‏143. Warm-up

‏Features עם history requirement חייבים להגיע ל־READY לפני שימוש.

---

## ‏144. Cold Start State

‏Cold start אינו “market empty”.

‏הוא state מפורש.

---

## ‏145. Safe Shutdown

‏צריך להבדיל בין graceful stop לבין emergency stop.

---

## ‏146. Graceful Stop

‏עוצר entries, מסיים/מבטל עבודה בהתאם למדיניות, שומר state ומוודא broker truth.

---

## ‏147. Crash Recovery

‏אין להניח ש־shutdown code רץ.

---

## ‏148. Process Restart with Position

‏תרחיש חובה בבדיקות.

---

## ‏149. Broker Disconnect with Pending Order

‏תרחיש חובה בבדיקות.

---

## ‏150. Data Disconnect while Position Open

‏Exit plane צריך degraded-mode policy.

---

## ‏151. Disk Failure

‏אם durability קריטית לא מובטחת, new exposure נחסם.

---

## ‏152. Metrics Failure

‏אובדן observability קריטי יכול להיות readiness failure.

---

## ‏153. Dependency Failure Matrix

‏לכל dependency נגדיר:

```text
Can Enter?
Can Exit?
Can Reconcile?
Can Observe?
Can Recover?
```

---

## ‏154. Failure Containment

‏תקלה ב־Daily Review לא צריכה לעצור Exit.

‏תקלה ב־research DB לא צריכה לשבש broker reconciliation.

---

## ‏155. Priority Inversion

‏Background analytics לא רשאי לחסום hot trading thread.

---

## ‏156. Bounded Queues

‏כל queue ב־Hot Path צריך capacity ו־overflow policy.

---

## ‏157. Async אינו קסם

‏`async` לא פותר overload.

‏Backpressure ו־bounded concurrency עדיין נדרשים.

---

## ‏158. Thread Ownership

‏State shared mutable צריך ownership ברור או synchronization strategy פשוטה ומדידה.

---

## ‏159. Avoid Lock Soup

‏עדיף partitioning/message passing/ownership על רשת locks מורכבת כאשר אפשר.

---

## ‏160. Symbol Partitioning

‏אפשר לחלק symbol state לפי shards/workers כדי לשפר locality ו־parallelism.

---

## ‏161. Global Cross-Section Barrier

‏Ranking cross-sectional דורש snapshot semantics ברורים, לא necessarily global hard lock.

---

## ‏162. Snapshot Version

‏כל cross-sectional snapshot מקבל version/epoch.

---

## ‏163. Performance Budgets

‏לכל stage budget:

```text
IngestionBudget
FeatureBudget
RankBudget
DecisionBudget
SubmitBudget
ExitBudget
```

---

## ‏164. `Latency Pressure`

```text
LatencyPressure = EndToEndLatency / SignalHalfLife
```

---

## ‏165. Optimize the Ratio

‏100ms יכולים להיות מצוינים ל־signal של 30s ורעים ל־signal של 150ms.

---

## ‏166. Tail Latency

‏`p99` יכול להיות חשוב יותר מה־mean במסחר קצר.

---

## ‏167. GC Awareness

‏ב־.NET יש למדוד allocation rate, pause behavior ו־LOH pressure.

---

## ‏168. Object Reuse בזהירות

‏Pooling מוצדק רק אם measurement מראה צורך.

---

## ‏169. Cache Correctness

‏Cache stale יכול להיות מסוכן יותר מחישוב איטי.

---

## ‏170. Precomputation

‏נחשב מראש כל מה שאפשר שאינו תלוי ב־current decision.

---

## ‏171. Deep Path Deadline

‏Deep analysis שחוזר אחרי שה־candidate expired לא צריך להיכנס להחלטה.

---

## ‏172. Cancellation Tokens

‏עבודה stale צריכה להתבטל.

---

## ‏173. Research/Production Code Sharing

‏נשתף domain logic ככל האפשר.

---

## ‏174. אך לא Production Dependencies

‏Research יכול להשתמש adapters/storage שונים בלי לשנות semantics.

---

## ‏175. Simulation Boundary

‏ב־Backtest/Replay מחליפים provider/broker adapters, לא את כל ה־Strategy Core.

---

## ‏176. `SimulatedExecutionBroker`

‏אותו interface, semantics שונים ומפורשים.

---

## ‏177. Paper Broker אינו Live Simulator מושלם

‏Paper fills אינם proof ל־live execution.

---

## ‏178. Shadow Mode

‏Shadow מפעיל production decision path בלי לשלוח real orders.

---

## ‏179. Decision Twin

‏Champion ו־Challenger יכולים לצרוך אותו canonical snapshot.

---

## ‏180. Counterfactual Store

‏נשמור החלטות של challengers בלי לתת להן authority.

---

## ‏181. Daily Review Pipeline

```text
Journal + Metrics + Decisions + Fills
→ Attribution
→ Anomalies
→ Counterfactuals
→ Research Queue
```

---

## ‏182. Daily Review אינו Auto-Tune

‏הוא מייצר evidence בלבד.

---

## ‏183. Continuous Improvement Boundary

‏Promotion מתרחש רק דרך governance מוגדר.

---

## ‏184. Feature Retirement

‏Feature שאינו מוסיף decision value יוצא מה־active set בצורה מבוקרת.

---

## ‏185. Strategy Versioning

‏כל run, decision ו־order מקושרים ל־Composite Strategy Identity.

---

## ‏186. Champion/Challenger

‏השוואה מתבצעת על disagreement set ולא רק aggregate PnL.

---

## ‏187. Data Lineage

‏Decision צריך לדעת איזה market snapshot ו־feature versions יצרו אותו.

---

## ‏188. Evidence Lineage

‏Promotion decision צריך לדעת אילו experiments ו־datasets תמכו בו.

---

## ‏189. No Hidden Mutable Globals

‏State שמשנה החלטה חייב להיות explicit/versioned/auditable.

---

## ‏190. Deterministic Configuration Resolution

‏אותו manifest צריך לפתור לאותו effective config.

---

## ‏191. Account State Service

‏שומר:

- ‏permissions.
- ‏buying power.
- ‏settled cash.
- ‏margin state.
- ‏restrictions.
- ‏borrow state כאשר רלוונטי.

---

## ‏192. Account State Freshness

‏Account data stale יכול לחסום entries.

---

## ‏193. Risk Engine

‏Risk אינו רק stop-loss.

‏הוא layer של pre-trade, in-trade ו־system-level controls.

---

## ‏194. Pre-Trade Risk

- ‏max notional.
- ‏max pending exposure.
- ‏position count.
- ‏account eligibility.
- ‏stale data.
- ‏unknown state.

---

## ‏195. In-Trade Risk

- ‏position duration.
- ‏liquidity deterioration.
- ‏broker mismatch.
- ‏exit feasibility.

---

## ‏196. System Risk

- ‏order storm.
- ‏duplicate submission.
- ‏clock failure.
- ‏provider outage.
- ‏split brain.

---

## ‏197. Risk Override Hierarchy

‏Risk layer יכול לחסום Strategy.

‏Strategy אינה יכולה לעקוף Hard Safety Gate.

---

## ‏198. Eligibility Engine

‏מפריד בין:

```text
Predictively Attractive
Operationally Eligible
Economically Executable
Account Permitted
```

---

## ‏199. Event Context Service

‏מאחד known events, corporate actions, halt/resume state ו־event-like market state.

---

## ‏200. Regime Context Service

‏מספק volatility/liquidity/breadth/correlation/session context עם confidence ו־freshness.

---

## ‏201. Context אינו Business Logic מפוזר

‏עדיף service/contract מרכזי על dozens of hidden conditions בקוד.

---

## ‏202. Cost Model Service

‏מספק expected commissions, fees, spread/slippage/impact assumptions ו־version.

---

## ‏203. Cost Model vs Ledger

‏Cost Model = expectation לפני trade.

‏Ledger = truth אחרי trade.

---

## ‏204. Ledger Service

‏מקשר executions, cash movements, fees ו־position basis באופן audit-able.

---

## ‏205. Reporting אינו Truth Source ל־Trading State

‏Dashboard לא מנהל positions.

---

## ‏206. UI אינו Business Authority

‏UI מציג ומבקש actions; domain services מחליטים אם action חוקי.

---

## ‏207. Operator Command Model

```text
DisableEntries
EnableShadow
QuarantineSymbol
RequestFlatten
AcknowledgeIncident
```

---

## ‏208. Commands אינם Direct Mutation

‏כל command עובר validation, authorization ו־audit.

---

## ‏209. Health Model

```text
DataHealth
DecisionHealth
ExecutionHealth
PositionHealth
AccountHealth
StorageHealth
ClockHealth
ObservabilityHealth
```

---

## ‏210. Composite Readiness

```text
CanOpenNewExposure
CanManageExistingExposure
CanExit
CanRecover
```

‏אלה states שונים.

---

## ‏211. Safe Mode

‏ב־Safe Mode:

- ‏אין entries חדשים.
- ‏נמשכת reconciliation.
- ‏נמשך position monitoring.
- ‏exit remains available ככל האפשר.

---

## ‏212. Degraded Mode

‏Degraded אינו binary failure.

‏לכל degradation מוגדרת capability matrix.

---

## ‏213. Architecture Test Pyramid

- ‏unit tests ל־pure domain logic.
- ‏property tests ל־invariants.
- ‏contract tests ל־adapters.
- ‏component tests ל־state machines.
- ‏replay tests.
- ‏fault-injection tests.
- ‏end-to-end paper/shadow tests.

---

## ‏214. Golden Scenarios

‏נשמור scenarios של:

- ‏happy path.
- ‏no-trade.
- ‏partial fill.
- ‏cancel/fill race.
- ‏reconnect.
- ‏stale data.
- ‏unknown broker state.
- ‏halt/resume.

---

## ‏215. Invariant Tests

‏דוגמאות:

```text
Never have two active entry intents for one-position mode
Never submit new entry with UNKNOWN exposure
Never mark FLAT before broker reconciliation confirms it
Never use expired DecisionIntent
```

---

## ‏216. Fault Injection

‏Failure testing צריך להיות intentional ולא להמתין לתקלה אמיתית.

---

## ‏217. Soak Testing

‏הרצה ממושכת מגלה leaks, timer drift, queue growth ו־resource exhaustion.

---

## ‏218. Load Testing

‏יש לבדוק bursts ולא רק average market load.

---

## ‏219. Production Readiness אינה Architecture Readiness בלבד

‏Architecture טובה עדיין דורשת evidence כלכלי, operational readiness והרשאה מתאימה.

---

## ‏220. הארכיטקטורה המלאה במשפט אחד

```text
Provider-Agnostic Data
→ Canonical Truth
→ Fresh Features
→ Fair Cross-Sectional Rank
→ Negative Evidence
→ Economic/Execution Feasibility
→ Explicit Decision
→ Durable Idempotent Intent
→ Broker-Reconciled Execution
→ Position-First Exit Control
→ Immutable Evidence
→ Replayable Learning
```

---

# ‏`Practitioner Secrets`

## ‏221. הסוד הראשון: State חשוב יותר מ־Class Diagram

‏מערכת יכולה להיראות “Clean Architecture” ולהיות מסוכנת אם state transitions לא מוגדרים.

---

## ‏222. הסוד השני: Broker Truth מנצח זיכרון מקומי

‏אחרי disconnect, לעולם לא מסתמכים רק על מה שחשבנו ששלחנו.

---

## ‏223. הסוד השלישי: Unknown הוא State אמיתי

‏מערכות מסוכנות הופכות `UNKNOWN` ל־false/zero/empty וממשיכות.

‏מערכות טובות עוצרות יצירת exposure חדש.

---

## ‏224. הסוד הרביעי: Exit צריך לשרוד כשה־Scanner מת

‏אם architecture דורשת Scanner בריא כדי לצאת מפוזיציה, boundary שגוי.

---

## ‏225. הסוד החמישי: כל Optimization מגדיל Complexity Budget

‏אם optimization חוסך 2ms ומוסיף failure mode שלא ניתן לבדיקה — ייתכן שהעסקה גרועה.

---

## ‏226. הסוד השישי: Fast Path צריך להיות קטן

‏קוד מהיר בדרך כלל גם קל יותר למדוד, לבדוק ולבודד.

---

## ‏227. הסוד השביעי: Reconciliation הוא Feature עסקי

‏הוא לא cleanup task.

‏הוא הדרך לדעת מה החשיפה האמיתית.

---

## ‏228. הסוד השמיני: Replayability היא דרישת Production

‏אם אי־אפשר לשחזר incident, גם אי־אפשר לדעת אם התיקון באמת פתר אותו.

---

## ‏229. הסוד התשיעי: Observability חסרה = Evidence חסר

‏אירוע שלא נמדד אינו “עבר בסדר”.

‏לעיתים הוא פשוט לא ניתן להערכה.

---

## ‏230. הסוד העשירי: עדיף Failure Explicit על Success מזויף

‏Reject, `NO_TRADE`, ‏`UNKNOWN`, quarantine ו־safe mode הם outputs מקצועיים.

---

# ‏Baseline ארכיטקטוני ראשוני לרובוט שלנו

> ‏הסעיף הבא הוא `Judgment / Hypothesis` ארכיטקטוני לצורכי לימוד ותכנון. הוא אינו Recommendation סופית של פרויקט ההמלצות.

## ‏231. Baseline מוצע

```text
1 process for Market/Data/Scanner hot path
+ dedicated execution/position authority
+ durable local journal/state store
+ provider adapters behind interfaces
+ whole-universe fast scan
+ top-N deep analysis
+ one canonical decision pipeline
+ hard safety vetoes
+ pre-submit revalidation
+ explicit broker reconciliation
+ full decision snapshots
+ separate research/replay process
```

---

## ‏232. למה להתחיל פשוט

‏Distribution למיקרו־services אינה מטרה בפני עצמה.

‏לרובוט אישי, process boundaries צריכים להיווצר רק כאשר הם נותנים יתרון ברור ב־failure isolation, deployment או scaling.

---

## ‏233. מה כן כדאי להפריד גם אם מתחילים ב־process אחד

‏Logical components/contracts:

```text
MarketDataAdapter
CanonicalMarketState
FeatureEngine
Scanner
NegativeEvidenceEngine
DecisionEngine
ExecutionEngine
PositionManager
RiskEngine
ReconciliationService
Journal
Observability
ReplayEngine
```

---

## ‏234. אחדות הקוד, הפרדת authority

‏אפשר שרכיבים יהיו באותו binary ועדיין תהיה ownership ברורה.

---

## ‏235. Priority ראשוני

‏ל־short-horizon personal robot:

```text
Correct state
> Recoverability
> Exit capability
> Freshness
> Economic realism
> Latency optimization
> Architectural elegance
```

---

## ‏236. לא לבנות HFT stack

‏אין צורך ב־co-location, FPGA, kernel bypass או nanosecond architecture רק מפני שה־horizon קצר.

‏היעד הוא latency סביר ביחס ל־signal half-life.

---

## ‏237. לא לבנות distributed system מוקדם מדי

‏Network hops, consistency ו־deployment complexity יכולים להזיק יותר משהם עוזרים.

---

## ‏238. לא לשמור רק Trades

‏צריך לשמור גם החלטות שלא הפכו ל־Trade.

---

## ‏239. לא לשמור רק Winner

‏צריך Top-K ו־rejected candidates כדי להבין selection bias.

---

## ‏240. לא לתת ל־PnL להיות Health Check

‏מערכת יכולה להיות ירוקה ב־PnL ושבורה ב־state.

---

# ‏Definition of Architecture Ready

‏הארכיטקטורה נחשבת מוכנה לשלב תכנון ה־MVP כאשר ניתן לענות בצורה חד־משמעית על כל השאלות הבאות:

- ‏מהו Source of Truth לכל סוג State?
- ‏מי רשאי לפתוח exposure?
- ‏מי רשאי לסגור exposure?
- ‏מה קורה אם submit outcome אינו ידוע?
- ‏איך משחזרים Position אחרי restart?
- ‏איך מזהים stale data?
- ‏איך rank נשאר fair לכל ה־universe?
- ‏איך מונעים duplicate order?
- ‏איך עוצרים entries בלי לאבד exit capability?
- ‏איך יודעים איזו Strategy Version קיבלה החלטה?
- ‏איך משחזרים החלטה ב־Replay?
- ‏איך מפרידים Production Learning מ־Production Authority?
- ‏איך failure ברכיב אחד לא משבית safety קריטי?
- ‏איך כל critical state הופך ל־metric, event או invariant שניתן לבדיקה?

```text
Clear Truth Sources
+ Explicit State Machines
+ Provider-Agnostic Contracts
+ Idempotent Execution
+ Broker Reconciliation
+ Position-First Safety
+ Full Observability
+ Durable Evidence
+ Deterministic Replay
+ Versioned Governance
= Complete Robot Architecture
```

‏זה עדיין אינו אומר שה־Strategy רווחית או שהמערכת מוכנה לכסף אמיתי.

‏זה אומר שיש לנו architecture שאפשר לבנות, לבדוק, לחקור ולהפעיל בצורה מקצועית.