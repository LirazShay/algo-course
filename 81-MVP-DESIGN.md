# ‏שלב 81 — `MVP Design`: הגרסה הקטנה ביותר שמייצרת Evidence אמיתי

> ‏מטרת הפרק: להגדיר `MVP` לרובוט ה־Short-Horizon שלנו כך שהוא יהיה קטן מספיק כדי להיבנות ולהיבדק מהר, אבל מלא מספיק כדי לענות על השאלות העסקיות־מחקריות החשובות: האם ה־Scanner מזהה Candidates בעלי יתרון, האם היתרון נשאר לאחר מגבלות ביצוע ועלויות, והאם אפשר לשחזר ולהסביר כל החלטה.
>
> ‏העיקרון המרכזי: **MVP טוב אינו המערכת עם הכי מעט קוד; הוא המערכת עם הכי מעט רכיבים שעדיין מאפשרים למדוד את ה־Hypothesis בצורה אמינה.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח. ברירת המחדל של ה־MVP היא `Replay / Shadow / Paper`; מעבר לכסף אמיתי שייך לשערי המוכנות של שלב 64 ולזכאות והרשאות מתאימות.

---

## ‏1. מה אנחנו באמת מנסים להוכיח

‏ה־MVP אינו נועד להוכיח שהמערכת “מגניבה” או שה־UI נראה טוב.

‏הוא נועד לבדוק שרשרת אחת:

```text
Fresh Market Data
→ Candidate Detection
→ Cross-Sectional Ranking
→ Eligibility / Veto
→ Executable Decision
→ Simulated / Paper Execution
→ Measured Outcome
→ Replayable Evidence
```

‏אם השרשרת הזו אינה ניתנת למדידה, אין לנו MVP מחקרי.

---

## ‏2. שלוש שאלות ה־MVP

1. ‏האם Candidate שנבחר גבוה בדירוג באמת מנבא outcome טוב יותר מ־Candidates חלשים יותר?
2. ‏האם היתרון נשאר לאחר spread, slippage, latency, partial fills ועלויות?
3. ‏האם ניתן לשחזר כל החלטה עם אותם inputs ולקבל אותה תוצאה?

‏כל Feature שאינו עוזר לענות על אחת מהשאלות האלה הוא חשוד כ־Scope Creep.

---

## ‏3. `Evidence MVP` ולא `Feature MVP`

‏הגדרה:

```text
Evidence MVP =
Minimum System
that can produce
credible, replayable, decision-level evidence
```

‏ה־MVP אינו צריך לדעת לעשות הכל.

‏הוא כן צריך לדעת להוכיח מה הוא עשה.

---

## ‏4. מה ה־MVP לא כולל כברירת מחדל

‏לא נתחיל מ:

- ‏Multiple brokers.
- ‏Multiple execution venues.
- ‏Short selling.
- ‏Advanced broker algos.
- ‏Machine Learning כ־production dependency.
- ‏News NLP.
- ‏Complex regime engines.
- ‏Multi-account routing.
- ‏Microservices.
- ‏Kubernetes.
- ‏Distributed consensus.
- ‏Automatic strategy promotion.
- ‏Auto-tuning.
- ‏Options.
- ‏Futures.
- ‏Crypto.
- ‏Portfolio optimization.

‏כל אחד מהנושאים האלה יכול להיות חשוב בהמשך.

‏אבל הוא אינו נדרש כדי לבדוק את ה־core hypothesis הראשון.

---

## ‏5. מה ה־MVP כן חייב לכלול

‏ה־MVP חייב לכלול לפחות:

```text
Market Data ingestion
Canonical state
Feature computation
Whole-universe scan
Eligibility filters
Score / Rank
NO TRADE support
Decision snapshots
Execution simulation / paper adapter
Exit simulation / paper logic
Cost model
Outcome labels
Replay
Diagnostics
Version identity
```

---

## ‏6. Long-only כ־Scope ראשוני

‏`Judgment`:

‏ל־MVP מחקרי ראשון עדיף להתחיל ב־Long-only.

‏הסיבה אינה ש־Short אינו חשוב.

‏הסיבה היא ש־Short מוסיף:

- ‏Borrow state.
- ‏Locate semantics.
- ‏Borrow fees.
- ‏Recall risk.
- ‏Regulatory restrictions.
- ‏Additional broker state.

‏כל אלה מקשים על בידוד שאלת המחקר הראשונית.

---

## ‏7. Position אחת בכל רגע

‏`Judgment`:

‏ל־MVP ראשון, Position אחת בכל רגע יכולה לפשט מאוד:

- ‏State management.
- ‏Risk attribution.
- ‏Exit logic.
- ‏PnL attribution.
- ‏Replay.
- ‏RCA.

‏זו אינה מסקנה כלכלית סופית.

‏זו החלטת Scope שמקטינה מספר משתנים בו־זמנית.

---

## ‏8. Whole-Market Scanner נשאר Core

‏אחד היסודות של ההשערה הוא השוואה Cross-Sectional רחבה.

‏לכן אין טעם ב־MVP שבודק רק 20 Symbols נבחרים ידנית אם מטרת המערכת היא למצוא את המוביל מתוך אלפים.

‏ה־MVP צריך לשמור את הרעיון:

```text
Broad Universe
→ Fair Comparison
→ Rank Candidates
```

---

## ‏9. אבל Universe צריך להיות מוגדר

‏צריך להגדיר:

- ‏איזה סוגי ניירות נכנסים.
- ‏איזה Exchanges.
- ‏איך מטפלים ב־ETF.
- ‏איך מטפלים ב־OTC אם בכלל.
- ‏איך מטפלים ב־delisted symbols היסטורית.
- ‏מהם מינימום מחיר / נזילות אם קיימים.

‏Universe אינו “כל מה שה־API החזיר”.

---

## ‏10. Universe Snapshot

‏כל Run חייב לשמור:

```text
UniverseId
UniverseVersion
AsOfTimestamp
IncludedSymbols
ExcludedSymbols
ExclusionReasons
```

‏אחרת קשה לשחזר Ranking היסטורי.

---

## ‏11. Market Data MVP

‏ה־MVP צריך להתחיל מ־Market Data קטן אך שימושי.

‏Baseline אפשרי:

- ‏Last trade.
- ‏Best bid.
- ‏Best ask.
- ‏Bid size.
- ‏Ask size.
- ‏Trade timestamp.
- ‏Quote timestamp.

‏אם provider מסוים לא מספק הכל, יש לסמן את מה שחסר במפורש.

---

## ‏12. למה `Last` בלבד אינו מספיק ל־Execution Research

‏`Last` יכול להספיק למחקר ראשוני של price momentum.

‏הוא אינו מספיק להערכת:

- ‏Spread.
- ‏Marketability.
- ‏Entry price.
- ‏Exit price.
- ‏Immediate execution cost.

‏לכן `Last-only` יכול להיות שלב מוקדם יותר, אבל לא Evidence MVP מלא לביצוע.

---

## ‏13. Canonical Market State

‏כל provider event חייב לעבור נרמול ל־state פנימי אחד.

‏לדוגמה:

```text
SymbolState
- Last
- LastTradeTime
- Bid
- Ask
- BidSize
- AskSize
- QuoteTime
- ReceiveTime
- DataQualityState
- Generation
```

---

## ‏14. Data Quality State

‏כל Symbol צריך state כגון:

```text
READY
STALE
GAPPED
INVALID
NOT_READY
```

‏ולא רק nullים אקראיים.

---

## ‏15. Freshness הוא חלק מה־Feature

‏Feature ללא age אינו Feature מלא.

‏לדוגמה:

```text
Return10s = +0.18%
FeatureAge = 240ms
```

‏לעומת:

```text
Return10s = +0.18%
FeatureAge = 4200ms
```

‏אותו מספר, משמעות שונה.

---

## ‏16. Clock Model

‏ל־MVP צריך להיות לפחות:

- ‏Source/event time כשזמין.
- ‏Receive time.
- ‏Decision time.
- ‏Submit time בסימולציה/Paper.
- ‏Fill time בסימולציה/Paper.

‏בלי זה אי אפשר ללמוד latency.

---

## ‏17. Horizons ראשוניים

‏`Judgment`:

‏כדי לא להעמיס, ה־MVP יכול להתחיל עם מספר קטן של horizons מייצגים, למשל:

```text
10s
30s
60s
```

‏אחרי Evidence אפשר להרחיב.

‏לא צריך להתחיל עם עשרות horizons.

---

## ‏18. Feature baseline קטן

‏ה־MVP לא צריך 100 Features.

‏מספיק להתחיל עם משפחות ברורות:

- ‏Price return.
- ‏Momentum consistency.
- ‏Acceleration/shape בסיסי.
- ‏Trade activity.
- ‏Relative activity.
- ‏Spread.
- ‏Freshness.
- ‏Liquidity / executability.

---

## ‏19. Feature Definitions חייבות להיות versioned

‏לדוגמה:

```text
FeatureDefinitionId = return_10s_v1
```

‏ולא רק column בשם `Return10s`.

---

## ‏20. No Hidden Mutable Formula

‏שינוי נוסחה משנה Strategy.

‏לכן שינוי Feature definition חייב ליצור version חדש.

---

## ‏21. Feature Engine incremental

‏ל־~4,000 Symbols אין טעם לחשב מחדש את כל ההיסטוריה בכל tick.

‏ה־MVP צריך להשתמש ב־incremental updates היכן שאפשר.

---

## ‏22. אבל Optimization מגיע אחרי Correctness

‏אין לבצע micro-optimization לפני שיש:

- ‏Correctness tests.
- ‏Replay parity.
- ‏Latency measurements.

---

## ‏23. Positive Evidence Engine

‏ה־MVP צריך Score פשוט ומוסבר.

‏למשל:

```text
Score =
MomentumStrength
+ MomentumConsistency
+ RelativeActivity
+ LiquidityQuality
```

‏המשקלים המדויקים אינם המלצה.

‏הם Hypothesis לבדיקה.

---

## ‏24. Score פשוט עדיף בתחילת הדרך

‏Score מסובך מדי יוצר:

- ‏יותר degrees of freedom.
- ‏יותר overfitting.
- ‏יותר קושי ב־RCA.

---

## ‏25. Rank הוא Cross-Sectional

‏בכל Decision Epoch:

```text
Eligible Symbols
→ Score
→ Sort
→ Top-K
```

---

## ‏26. Top-K חייב להישמר

‏לא לשמור רק Rank #1.

‏צריך לפחות Top-N קטן כדי להבין:

- ‏Rank gap.
- ‏Missed alternatives.
- ‏Winner's Curse.
- ‏Counterfactuals.

---

## ‏27. `RankGap`

‏שמור:

```text
RankGap = Score1 - Score2
```

‏זה עוזר להבדיל בין Winner ברור לבין tie כמעט מלא.

---

## ‏28. `RankChurn`

‏מדוד כמה מהר ה־Top-K משתנה.

‏Rank #1 שמתחלף כל 100ms עשוי להיות לא שימושי גם אם Score נראה טוב.

---

## ‏29. Eligibility לפני Ranking

‏לפחות חלק מהתנאים צריכים לחסום Candidates לפני ranking.

‏לדוגמה:

- ‏Data invalid.
- ‏Price invalid.
- ‏Spread קיצוני.
- ‏Insufficient history.

---

## ‏30. Negative Evidence MVP

‏אין צורך להתחיל עם עשרות vetoes.

‏Baseline:

- ‏Stale data veto.
- ‏Invalid market veto.
- ‏Spread/economic infeasibility veto.
- ‏Missing critical state veto.

---

## ‏31. Behavioral Vetoes מתחילים ב־Shadow

‏Veto כמו failed breakout או giveback יכול להיות שימושי.

‏אבל ב־MVP עדיף למדוד אותו תחילה בלי לחסום Trades.

---

## ‏32. Reason Codes

‏כל פסילה חייבת להחזיר:

```text
ReasonCode
ObservedValue
Threshold
Timestamp
```

---

## ‏33. `NO TRADE` הוא Output ראשון במעלה

‏ה־Decision Engine אינו חייב להחזיר Candidate.

‏הוא יכול להחזיר:

```text
NO_TRADE
```

‏וזו אינה תקלה.

---

## ‏34. Decision States

‏Baseline:

```text
TRADE
NO_TRADE
UNKNOWN
```

‏`UNKNOWN` שונה מ־`NO_TRADE`.

---

## ‏35. `UNKNOWN` חוסם Entry

‏אם חסר critical state:

```text
Decision = UNKNOWN
EntryAllowed = false
```

---

## ‏36. Decision Snapshot

‏כל Decision Epoch צריך לשמור:

```text
DecisionId
Timestamp
StrategyVersion
UniverseVersion
TopK
SelectedSymbol
Features
Score
Vetoes
DataAges
MarketContext
Decision
```

---

## ‏37. למה Snapshot מלא הוא חלק מה־MVP

‏בלי Snapshot אי אפשר לענות מאוחר יותר:

> ‏“למה קנינו דווקא אותו?”

---

## ‏38. Pre-Submit Revalidation

‏לפני simulated/paper order:

```text
Check freshness again
Check symbol still eligible
Check spread again
Check decision TTL
```

---

## ‏39. Decision TTL

‏Decision קצר־אופק חייב לפוג.

‏לדוגמה קונספטואלית:

```text
if Now - DecisionTime > DecisionTTL:
    reject intent
```

‏הערך המדויק דורש Evidence.

---

## ‏40. Order Intent

‏לפני כל שליחה לסימולטור/Paper:

```text
OrderIntent
- IntentId
- DecisionId
- Symbol
- Side
- Quantity
- IntendedOrderType
- LimitPrice
- CreatedAt
- StrategyVersion
```

---

## ‏41. Durable-before-send

‏אפילו ב־MVP, שמור את ה־Intent לפני האפקט החיצוני.

‏זה מלמד discipline שיידרש ב־Production.

---

## ‏42. Execution MVP לא חייב Broker אמיתי

‏שלב ראשון:

```text
Replay execution simulator
```

‏שלב שני:

```text
Paper adapter
```

‏כסף אמיתי אינו חלק מברירת המחדל של MVP המחקרי.

---

## ‏43. Execution Simulator חייב להיות שמרני

‏אסור להניח:

```text
Touch == Fill
```

---

## ‏44. לפחות שלושה Execution Scenarios

‏מומלץ לשמור:

```text
Optimistic
Base
Stress
```

‏כדי לדעת אם ה־edge תלוי בהנחה עדינה מדי.

---

## ‏45. Arrival Price

‏שמור את מצב השוק ברגע ההחלטה והשליחה.

‏Arrival Price הוא benchmark קריטי.

---

## ‏46. Slippage

‏מדוד ביחס ל־benchmark מוגדר.

‏אל תשתמש במילה “slippage” בלי להגדיר reference price.

---

## ‏47. Spread Cost

‏ה־MVP צריך למדוד לפחות:

```text
QuotedSpread
EffectiveEntrySpread
EffectiveExitSpread
```

---

## ‏48. Fees

‏Fee model חייב להיות configurable ו־versioned.

‏אין hard-code נצחי.

---

## ‏49. `RemainingNetEdge`

‏לפני Entry מדוד קונספטואלית:

```text
PredictedGrossEdge
- ExpectedSpreadCost
- ExpectedSlippage
- Fees
- SafetyBuffer
= RemainingNetEdge
```

---

## ‏50. אין צורך בדיוק מזויף

‏אם Cost estimate לא אמין, שמור confidence או range.

---

## ‏51. Entry Policy MVP

‏ה־MVP צריך policy אחד פשוט וברור.

‏לא עשרה Order Types במקביל.

---

## ‏52. Order Tactic נשאר Hypothesis

‏אין להניח מראש ש־Market, Marketable Limit או Passive Limit הוא universal winner.

‏ב־MVP הוא parameterized policy.

---

## ‏53. Exit הוא חלק מה־MVP מהיום הראשון

‏אי אפשר לבדוק Strategy Entry בלי Exit.

---

## ‏54. Exit Policy MVP

‏Baseline יכול לכלול:

- ‏Time-based maximum hold.
- ‏Signal decay.
- ‏Adverse move.
- ‏Target/reversal logic.

‏אך הכל צריך להיות versioned.

---

## ‏55. `TimeToFirstProfit`

‏אחד ה־labels החשובים למחקר שלנו.

---

## ‏56. `TimeToTarget`

‏אם מוגדר target מחקרי, שמור זמן עד אליו.

---

## ‏57. MFE

‏`Maximum Favorable Excursion` מודד כמה טוב המחיר היה במהלך ה־holding window.

---

## ‏58. MAE

‏`Maximum Adverse Excursion` מודד כמה רע המחיר היה במהלך ה־holding window.

---

## ‏59. Giveback

‏מדוד כמה מה־MFE אבד עד Exit.

---

## ‏60. `TimeToFlat`

‏במערכת קצרה חשוב לא רק זמן ל־exit decision אלא זמן עד שה־position בפועל שטוח.

---

## ‏61. Outcome Labels

‏Baseline:

```text
ForwardReturn1s
ForwardReturn2s
ForwardReturn5s
ForwardReturn10s
ForwardReturn30s
ForwardReturn60s
TimeToFirstProfit
TimeToTarget
MFE
MAE
```

---

## ‏62. Labels אינם Strategy

‏אפשר לשמור labels רבים גם אם ה־Strategy משתמש רק בחלקם.

---

## ‏63. Point-in-Time Correctness

‏כל label נבנה רק אחרי event time המתאים.

‏אסור שהוא יזלוג ל־features.

---

## ‏64. Replay הוא Core MVP

‏בלי Replay קשה להבחין בין:

- ‏Algorithm bug.
- ‏Data issue.
- ‏Random timing.
- ‏Strategy failure.

---

## ‏65. Deterministic Replay

‏אותם inputs + אותה version צריכים להפיק אותה Decision sequence.

---

## ‏66. Execution Replay יכול להיות Stochastic

‏Decision replay צריך להיות deterministic ככל האפשר.

‏Fill simulation יכול לכלול uncertainty בנפרד.

---

## ‏67. Event Journal

‏שמור sequence של events חשובים.

‏לא רק final tables.

---

## ‏68. Snapshot + Journal

‏שילוב טוב:

```text
Periodic Snapshot
+ Append-only Event Journal
```

---

## ‏69. Persistence MVP

‏אין צורך במערכת distributed מורכבת.

‏Database מקומי אמין יכול להספיק למחקר ראשון.

---

## ‏70. Schema צריך להיות explicit

‏לא JSON blobs לכל דבר ללא contract.

---

## ‏71. Raw Market Data retention

‏שמור מספיק raw/normalized evidence כדי לבצע RCA.

---

## ‏72. אבל לא חייבים לשמור כל byte לנצח

‏Retention policy יכולה להיות tiered.

---

## ‏73. Hot Data

‏נתונים הדרושים להחלטה מיידית.

---

## ‏74. Warm Data

‏נתונים הדרושים ל־replay ו־recent review.

---

## ‏75. Cold Data

‏היסטוריה למחקר ארוך־טווח.

---

## ‏76. Diagnostics MVP

‏חייבים לפחות:

- ‏FreshCoverage.
- ‏Top1Age.
- ‏Decision latency.
- ‏Rank churn.
- ‏Queue age.
- ‏Veto counts.
- ‏Data quality state.

---

## ‏77. Scanner Health

‏שמור health state נפרד מ־market opportunity state.

---

## ‏78. Healthy `NO_TRADE`

‏המערכת רואה את השוק היטב ואין Candidate מתאים.

---

## ‏79. Broken `NO_TRADE`

‏המערכת לא מייצרת Trade בגלל בעיית data/compute/state.

---

## ‏80. Alerting MVP

‏התראות צריכות להיות impact-oriented.

‏לא כל warning הוא emergency.

---

## ‏81. P0 Alerts

‏לדוגמה:

- ‏Unknown broker/order state.
- ‏Position mismatch.
- ‏Critical data stale.
- ‏Duplicate execution risk.

‏ב־Replay/Paper חלק מהן עדיין חשובות לצורך correctness.

---

## ‏82. P1 Alerts

‏לדוגמה:

- ‏FreshCoverage degradation.
- ‏Latency tail degradation.
- ‏Persistent rank anomalies.

---

## ‏83. Logs אינם Evidence מספיק

‏צריך structured decision records.

---

## ‏84. Correlation IDs

‏חבר:

```text
MarketEvent
→ DecisionId
→ IntentId
→ OrderId
→ FillId
→ PositionEpisodeId
```

---

## ‏85. Position Episode

‏כל Trade צריך episode identity אחד שמכיל Entry עד Flat.

---

## ‏86. One Position Simplifies Episode Semantics

‏ב־MVP, אם יש Position אחת בכל רגע, attribution קל בהרבה.

---

## ‏87. Risk MVP

‏גם Paper system צריך Risk invariants.

---

## ‏88. Risk אינו רק כסף

‏ב־MVP יש גם:

- ‏State risk.
- ‏Data risk.
- ‏Execution risk.
- ‏Operational risk.

---

## ‏89. Entry Block on Stale Data

‏כלל baseline ברור.

---

## ‏90. Entry Block on Unknown State

‏כלל baseline ברור.

---

## ‏91. Exit Priority

‏אם יש Position, data/compute resources הנדרשים לניהולה מקבלים קדימות.

---

## ‏92. New Entries are Optional

‏יציאה מחשיפה קיימת חשובה יותר ממציאת Candidate חדש.

---

## ‏93. Kill Switch במצב Paper

‏כדאי לבדוק כבר ב־MVP את semantics של:

```text
DisableNewEntries
CancelPendingEntries
AllowPositionManagement
FlattenIfConfigured
```

---

## ‏94. Kill Switch אינו כפתור אחד עמום

‏צריך להגדיר מה כל מצב עושה.

---

## ‏95. Restart Test

‏ה־MVP חייב לדעת להיעצר ולהתחיל מחדש בלי לשכוח state חשוב.

---

## ‏96. Crash During Pending Order

‏תרחיש חובה ב־Paper simulation.

---

## ‏97. Duplicate Event

‏תרחיש חובה.

---

## ‏98. Out-of-Order Event

‏תרחיש חובה.

---

## ‏99. Data Gap

‏תרחיש חובה.

---

## ‏100. Provider Disconnect

‏תרחיש חובה.

---

## ‏101. Reconnect Generation

‏לאחר reconnect, stale callbacks מהדור הקודם לא צריכים לזהם state חדש.

---

## ‏102. `Generation` Tokens

‏ל־provider session ול־broker session יכולים להיות generation IDs.

---

## ‏103. Paper Adapter

‏ממשק broker צריך להיות abstraction:

```text
ExecutionBroker
```

‏גם אם כרגע implementation אחד בלבד קיים.

---

## ‏104. Market Data Adapter

‏ממשק data:

```text
MarketDataProvider
```

---

## ‏105. לא לערבב Provider semantics ב־Core

‏ה־Core לא צריך לדעת שמקור מסוים קורא לשדה בשם מסוים.

---

## ‏106. Provider-specific Metadata כן נשמר

‏לצורך diagnostics ו־RCA.

---

## ‏107. Configuration MVP

‏כל הפרמטרים המשמעותיים בקובץ/config versioned.

---

## ‏108. No Hidden Defaults

‏Default משמעותי חייב להופיע ב־resolved config.

---

## ‏109. Config Fingerprint

‏לכל run:

```text
ConfigFingerprint
```

---

## ‏110. Strategy Version

‏לכל decision:

```text
StrategyVersion
```

---

## ‏111. Build Identity

‏שמור גם build/package identity.

---

## ‏112. Environment Identity

‏שמור:

```text
REPLAY
SHADOW
PAPER
```

‏באופן מפורש.

---

## ‏113. אין fallback שקט בין environments

‏Paper לא הופך Live בטעות.

---

## ‏114. UI MVP

‏UI אינו Core Edge.

‏אבל הוא צריך לאפשר לפחות:

- ‏System health.
- ‏Top-K.
- ‏Selected Candidate.
- ‏Why selected.
- ‏Why blocked.
- ‏Current position state.
- ‏Recent decisions.
- ‏Recent incidents.

---

## ‏115. `Why This Candidate?`

‏ה־UI צריך להציג:

- ‏Score components.
- ‏Freshness.
- ‏Eligibility.
- ‏Veto status.
- ‏Rank gap.

---

## ‏116. `Why No Trade?`

‏חשוב באותה מידה.

---

## ‏117. `Why Not Candidate X?`

‏לא חייב להיות UI מושלם ב־MVP.

‏אבל הנתונים צריכים להישמר.

---

## ‏118. Replay UI

‏מספיק כלי פשוט שמאפשר לבחור זמן ולראות Decision Snapshot.

---

## ‏119. Backtest אינו UI Feature

‏מנוע המחקר צריך להיות reusable גם בלי UI.

---

## ‏120. Research Query Surface

‏צריך דרך פשוטה לשאול:

```text
How did Rank1 perform vs Rank2-5?
How often did NO_TRADE avoid losses?
What was realized after costs?
```

---

## ‏121. SQL-friendly Evidence

‏בשלב מוקדם, schema שאפשר לחקור ב־SQL הוא יתרון גדול.

---

## ‏122. Raw + Derived separation

‏אל תדרוס raw evidence עם derived values.

---

## ‏123. Derived Feature Version

‏כל derived column משמעותי צריך provenance.

---

## ‏124. Label Version

‏גם labels משתנים אם definition משתנה.

---

## ‏125. Experiment ID

‏כל experiment מחקרי מקבל identity נפרד מה־StrategyVersion.

---

## ‏126. Frozen Experiment Config

‏אסור לשנות parameters באמצע run ואז לקרוא לכל התוצאות experiment אחד.

---

## ‏127. Baseline First

‏לפני tuning:

```text
Simple baseline
```

---

## ‏128. Ablation from Day One

‏Feature חדש צריך להיות ניתן לכיבוי בקלות.

---

## ‏129. Feature Flags

‏Feature flag טוב מאפשר:

- ‏Shadow compute.
- ‏A/B research.
- ‏Fast rollback.

---

## ‏130. אבל Feature Flags אינם Versioning

‏ה־resolved state של flags חייב להיות חלק מה־StrategyVersion.

---

## ‏131. Champion Baseline

‏ה־MVP צריך baseline קבוע להשוואה.

---

## ‏132. Challenger אחד בכל פעם

‏בתחילת הדרך זה מפחית multiple-testing chaos.

---

## ‏133. Daily Review MVP

‏בסוף כל session:

- ‏Decision count.
- ‏Trade count.
- ‏NO_TRADE count.
- ‏Top-K performance.
- ‏Costs.
- ‏Latency.
- ‏Vetoes.
- ‏Incidents.

---

## ‏134. Daily Review אינו Auto-Tune

‏אין שינוי אוטומטי של threshold לפי יום אחד.

---

## ‏135. Research Queue

‏Review יכול ליצור:

```text
Hypothesis Candidate
```

‏אבל לא production change.

---

## ‏136. Minimum Viable Tests

‏לפחות:

- ‏Unit tests לחישובי Features.
- ‏Determinism tests.
- ‏Replay parity tests.
- ‏State-machine tests.
- ‏Recovery tests.
- ‏Cost calculation tests.

---

## ‏137. Property Tests

‏מתאימים במיוחד ל־invariants.

---

## ‏138. Example Invariant

```text
Position cannot become negative in long-only MVP
```

---

## ‏139. Example Invariant

```text
No new entry when critical market data is stale
```

---

## ‏140. Example Invariant

```text
One active position at most
```

---

## ‏141. Example Invariant

```text
Every external order effect has durable intent identity
```

---

## ‏142. Example Invariant

```text
Every decision references a StrategyVersion
```

---

## ‏143. Golden Replay

‏שמור מספר sessions representative כ־Golden Scenarios.

---

## ‏144. Golden Failure

‏שמור גם failure scenarios.

---

## ‏145. CI MVP

‏CI צריך להיות קצר מספיק כדי לרוץ בכל שינוי.

---

## ‏146. Fast CI

‏כולל tests זולים ומהירים.

---

## ‏147. Deep CI

‏Replay/soak/stress יכולים להיות שלב נפרד.

---

## ‏148. Performance Budget

‏הגדר budget לכל שלב:

```text
Ingestion
Feature update
Ranking
Decision
Pre-submit validation
```

---

## ‏149. Measure Before Optimize

‏אסור לנחש bottleneck.

---

## ‏150. p50 אינו מספיק

‏מדוד לפחות:

```text
p50
p95
p99
max / tail incidents
```

---

## ‏151. GC Metrics

‏ב־.NET, pause behavior חשוב יותר מ־allocation pride.

---

## ‏152. Bounded Queues

‏Queue לא מוגבל יכול להפוך lag קטן ל־stale-decision disaster.

---

## ‏153. Load Shedding

‏אם ה־system overloaded:

- ‏drop low-value deep analysis.
- ‏protect position/exit work.

---

## ‏154. Open Position Priority

‏Rule baseline:

```text
Existing Exposure > New Opportunity
```

---

## ‏155. Warm-up State

‏ב־startup אין trading readiness מיד.

---

## ‏156. `WARMING_UP`

‏State explicit.

---

## ‏157. `READY`

‏רק אחרי:

- ‏enough history.
- ‏fresh coverage.
- ‏healthy provider.
- ‏valid config.

---

## ‏158. `DEGRADED`

‏המערכת עובדת חלקית אך לא בהכרח מאפשרת Entry.

---

## ‏159. `SAFE_MODE`

‏חוסם risk חדש.

---

## ‏160. `STOPPED`

‏State explicit.

---

## ‏161. State Machine פשוט עדיף

‏MVP לא צריך עשרות modes.

---

## ‏162. Startup Checklist

‏לפחות:

```text
Config valid
Clock healthy
Provider connected
Universe loaded
Fresh coverage sufficient
Feature warmup complete
Persistence writable
Replay metadata available
```

---

## ‏163. Shutdown Checklist

‏ב־Paper:

- ‏stop new decisions.
- ‏flush journal.
- ‏persist state.
- ‏close provider sessions.

---

## ‏164. Incident Capture

‏כשנשבר invariant, שמור packet.

---

## ‏165. Incident Packet

```text
Timestamp
StrategyVersion
SystemState
MarketSnapshot
TopK
Decision
OrderState
PositionState
RecentEvents
Reason
```

---

## ‏166. RCA First Divergence

‏שאל:

> ‏איפה המציאות סטתה לראשונה מהמסלול הצפוי?

---

## ‏167. Avoid Symptom-Only Fixes

‏Bug fix בלי להבין root cause מגדיל debt.

---

## ‏168. MVP Data SLO

‏צריך לפחות יעד ל־fresh coverage ו־critical stale rate.

---

## ‏169. MVP Decision SLO

‏צריך יעד ל־decision latency.

---

## ‏170. MVP Replay SLO

‏צריך יעד ל־deterministic parity.

---

## ‏171. MVP Evidence SLO

‏כל decision חשוב חייב להיות explainable.

---

## ‏172. MVP Safety SLO

‏אין unknown critical state שמאפשר Entry.

---

## ‏173. Success אינו PnL יומי חיובי

‏MVP מצליח אם הוא מפיק Evidence שמכריע Hypothesis.

---

## ‏174. אפשרות תוצאה: Hypothesis נדחית

‏זו הצלחת מחקר אם הגענו למסקנה אמינה מהר.

---

## ‏175. אפשרות תוצאה: Signal קיים אך לא Executable

‏גם זו תוצאה חשובה.

---

## ‏176. אפשרות תוצאה: Edge רק ב־Regime צר

‏גם זו תוצאה חשובה.

---

## ‏177. אפשרות תוצאה: Edge נשבר בעלויות

‏גם זו תוצאה חשובה.

---

## ‏178. אפשרות תוצאה: Rank עובד אך Exit לא

‏גם זו תוצאה חשובה.

---

## ‏179. Success Criteria צריכים להיות מראש

‏לא להמציא קריטריונים אחרי שרואים תוצאות.

---

## ‏180. MVP Research Gate

‏לפני הרחבת Scope צריך לדעת:

- ‏האם Rank מוסיף predictive value?
- ‏האם value נשאר ב־Top1?
- ‏האם execution assumptions סבירים?
- ‏האם costs משאירים net edge?
- ‏האם results יציבים מספיק?

---

## ‏181. MVP Engineering Gate

‏צריך לדעת:

- ‏Replay עובד.
- ‏Restart עובד.
- ‏Data gaps מזוהים.
- ‏Decision snapshots שלמים.
- ‏Version identity קיימת.

---

## ‏182. MVP Safety Gate

‏צריך לדעת:

- ‏Unknown state חוסם Entry.
- ‏Kill semantics נבדקו.
- ‏אין duplicate order intent.
- ‏Position state recoverable.

---

## ‏183. MVP Observability Gate

‏צריך להיות אפשר לענות מהר על:

```text
Why this candidate?
Why no trade?
Was data fresh?
Was ranking fair?
What happened after decision?
```

---

## ‏184. Promotion מעבר ל־MVP

‏רק אחרי gates עוברים ל־Production v1 design.

---

## ‏185. מה לא עושים בגלל תוצאה ראשונית יפה

‏לא מוסיפים מיד:

- ‏more capital.
- ‏more complexity.
- ‏more models.
- ‏more providers.
- ‏more leverage.

---

## ‏186. What to Add First After MVP

‏תלוי evidence.

‏לא roadmap אוטומטי.

---

## ‏187. אם Bottleneck הוא Data

‏משפרים data.

---

## ‏188. אם Bottleneck הוא Ranking

‏משפרים ranking.

---

## ‏189. אם Bottleneck הוא Execution

‏משפרים execution modeling/tactics.

---

## ‏190. אם Bottleneck הוא Exit

‏משפרים exit research.

---

## ‏191. אם Bottleneck הוא Cost

‏בודקים אם בכלל קיימת כלכלה סבירה.

---

## ‏192. אם Bottleneck הוא Latency

‏מודדים איפה היא נוצרת לפני optimization.

---

## ‏193. אם Bottleneck הוא Complexity

‏מוחקים.

---

## ‏194. KISS הוא כלי מחקרי

‏פחות components מאפשרים Attribution טוב יותר.

---

## ‏195. Monolith מודולרי הוא Baseline סביר

‏`Judgment`:

‏לרובוט אישי MVP, modular monolith יכול להיות עדיף על microservices.

---

## ‏196. Process Boundaries רק כשיש סיבה

‏למשל:

- ‏isolation.
- ‏security.
- ‏provider constraints.
- ‏fault containment.

---

## ‏197. One Database יכול להספיק

‏כל עוד schema ו־write path נכונים.

---

## ‏198. Event Bus חיצוני לא חובה

‏In-process queues יכולות להספיק בתחילת הדרך.

---

## ‏199. אבל Contracts חייבים להיות ברורים

‏גם בתוך process אחד.

---

## ‏200. MVP אינו Throwaway Prototype

‏קוד יכול להיות פשוט.

‏אבל semantics של:

- ‏time.
- ‏identity.
- ‏state.
- ‏version.
- ‏evidence.

‏צריכים להיות נכונים מההתחלה.

---

## ‏201. `Practitioner Secret`: אל תבנה קודם את החלק המעניין

‏Scanner/Score בדרך כלל מרגישים מעניינים.

‏אבל Replay, timestamps, versioning ו־evidence הם מה שמאפשר לדעת אם ה־Scanner באמת טוב.

---

## ‏202. `Practitioner Secret`: MVP עם יותר Features יכול להיות פחות אינפורמטיבי

‏כי קשה להבין מה באמת עבד.

---

## ‏203. `Practitioner Secret`: Missing Counterfactuals הורסים Learning

‏אם שמרת רק את המניה שקנית, איבדת את השוק שאליו היית אמור להשוות אותה.

---

## ‏204. `Practitioner Secret`: Happy Path אינו MVP Complete

‏לפחות restart, stale data ו־duplicate scenarios חייבים לעבוד.

---

## ‏205. `Practitioner Secret`: “Paper Worked” אינו הוכחת Fill Quality

‏Paper הוא evidence על integration והתנהגות, לא בהכרח על microstructure אמיתי.

---

## ‏206. `Practitioner Secret`: Timing Bugs מתחבאים ב־Replay Gaps

‏אם Replay לא מסוגל להסביר live/paper divergence, זו בעיית architecture.

---

## ‏207. `Practitioner Secret`: כל Unknown קריטי צריך להיות visible

‏Unknown מוסתר הוא מסוכן יותר מ־known failure.

---

## ‏208. `Practitioner Secret`: אל תמדוד רק Trades

‏מדוד גם:

- ‏rejected candidates.
- ‏NO_TRADE moments.
- ‏missed winners.
- ‏false vetoes.
- ‏no-fill opportunities.

---

## ‏209. `Practitioner Secret`: יכולת למחוק Feature חשובה כמו יכולת להוסיף Feature

‏MVP טוב שומר architecture שמאפשר ablation.

---

## ‏210. `Practitioner Secret`: Production v1 צריך להיבנות מה־Evidence של ה־MVP

‏לא מרשימת Features שתכננו חודשים מראש.

---

# ‏Baseline מוצע ל־MVP שלנו

‏`Judgment / Hypothesis` בלבד — לא Recommendation סופית:

```text
Mode:
Replay + Shadow + Paper

Direction:
Long-only

Exposure:
Single position at a time

Universe:
Broad US equities universe

Data:
Last + Bid/Ask + basic sizes + timestamps

Horizons:
10s / 30s / 60s baseline

Features:
Small explainable set

Decision:
Score + eligibility + hard safety/economic vetoes

Ranking:
Cross-sectional Top-K

Execution:
Versioned simulator + one Paper adapter

Exit:
Simple versioned policy

Evidence:
Decision snapshots + Top-K + outcome labels

Persistence:
Local durable DB / journal

Research:
SQL-friendly + deterministic replay

Operations:
Explicit health states + kill semantics
```

---

# ‏`MVP Definition of Done`

‏ה־MVP נחשב שלם כאשר:

```text
1. Universe רחב נסרק באופן עקבי.
2. Freshness ו־coverage נמדדים.
3. Features מחושבים Point-in-Time.
4. Rank ו־Top-K נשמרים.
5. TRADE / NO_TRADE / UNKNOWN עובדים.
6. Hard vetoes בסיסיים עובדים.
7. Decision Snapshot מלא נשמר.
8. Execution simulator/Paper path עובד.
9. Entry ו־Exit נמדדים עם costs.
10. Outcome labels נוצרים בלי leakage.
11. Replay משחזר החלטות.
12. Restart/failure scenarios בסיסיים עוברים.
13. כל Run מזוהה ב־StrategyVersion + ConfigFingerprint.
14. Daily Review מפיק Evidence.
15. אפשר להחליט אם ה־Hypothesis הראשונית מתחזקת, נחלשת או נדחית.
```

‏אם אחד מהדברים הקריטיים האלה חסר, אין לנו Evidence MVP מלא.

---

# ‏השורה התחתונה

‏ה־MVP שלנו אינו “רובוט קטן שעושה Trades”.

‏הוא **מעבדת החלטות חיה, ניתנת לשחזור, שמסוגלת למדוד האם יש לנו Edge שניתן לבצע**.

‏השרשרת שצריך להגן עליה היא:

```text
Observe correctly
→ Compare fairly
→ Decide explicitly
→ Simulate/execute realistically
→ Measure economically
→ Replay exactly
→ Learn carefully
```

‏אם השרשרת הזו עובדת — יש בסיס אמיתי ל־Production v1.
