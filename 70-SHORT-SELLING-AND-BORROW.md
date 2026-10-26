# ‏שלב 70 — `Short Selling and Borrow`: למה Short אינו פשוט Long עם סימן הפוך

> ‏מטרת הפרק: להבין לעומק את המכניקה, הסיכונים והאילוצים של Short Selling — Borrow availability, Locate, Hard-to-Borrow, Borrow Fees, Recall, Buy-In, Short-Sale Restrictions, Squeeze Dynamics, Asymmetric Risk ו־Backtest realism — ולחבר אותם ל־Universe, Ranking, Veto, Execution, Risk ו־Live Operations.
>
> ‏העיקרון המרכזי: **Short Signal טוב אינו מספיק. כדי ש־Short יהיה Candidate אמיתי צריך גם להוכיח `Borrow Feasibility`, יכולת ביצוע, יכולת Exit, עלות נטו סבירה וסיכון תפעולי נשלט.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע Short אמיתי ואינו מבטיח רווח. פרטי Broker, account eligibility, זמינות Borrow וכללים רגולטוריים יכולים להשתנות; לפני שימוש מעשי יש לאמת אותם מול המקור העדכני.

---

# ‏1. מהו Short Selling

‏ב־Long:

```text
Buy first
Sell later
```

‏ב־Short:

```text
Borrow shares
Sell borrowed shares
Buy back later
Return shares
```

‏כלומר Short מוסיף תלות בגורם נוסף:

```text
Stock Borrow Market
```

‏ולכן יש שרשרת נוספת של feasibility.

---

# ‏2. למה Short אינו סימטרי ל־Long

‏ב־Long, הפסד תיאורטי מוגבל כאשר המחיר מגיע לאפס.

‏ב־Short, מחיר יכול לעלות באופן עקרוני הרבה מעל מחיר הכניסה.

‏לכן פרופיל הסיכון אינו סימטרי.

‏גם operationally Short מוסיף:

- ‏Borrow availability.
- ‏Locate requirements כאשר רלוונטי.
- ‏Borrow fee.
- ‏Recall risk.
- ‏Buy-in risk.
- ‏Short-sale execution restrictions.
- ‏Squeeze risk.
- ‏Dividend/substitute-payment effects.
- ‏Broker-specific eligibility.

---

# ‏3. `Borrow Availability`

‏כדי למכור Short צריך שיהיו מניות שניתנות להשאלה דרך מנגנון ה־Broker/clearing/lending שלו.

‏מצב Borrow יכול להיות:

```text
AVAILABLE
LIMITED
HARD_TO_BORROW
UNAVAILABLE
UNKNOWN
```

‏`UNKNOWN` אינו צריך להיחשב `AVAILABLE`.

---

# ‏4. `Easy-to-Borrow` מול `Hard-to-Borrow`

‏מניה יכולה להיות קלה יחסית להשאלה או קשה להשאלה.

‏כאשר היא `Hard-to-Borrow`:

- ‏זמינות יכולה להיות נמוכה.
- ‏Borrow fee יכול להיות גבוה יותר.
- ‏availability יכולה להשתנות מהר.
- ‏Locate עשוי להיות נחוץ בהתאם למבנה Broker/חשבון/שוק.
- ‏Risk של Recall/Buy-In יכול להיות גבוה יותר.

‏לכן `HTB` אינו רק label תפעולי; הוא Economic State.

---

# ‏5. `Locate`

‏Locate הוא אישור/איתור של מניות זמינות להשאלה לפני Short כאשר הדבר נדרש במסגרת הרלוונטית.

‏חשוב להבחין בין:

```text
CanShort(symbol)
BorrowAvailable(symbol)
LocateRequired(symbol)
LocateObtained(symbol)
```

‏אסור לערבב אותם ל־Boolean אחד לא מוסבר.

---

# ‏6. Borrow יכול להיעלם

‏Borrow availability אינה בהכרח קבועה.

‏Candidate יכול להיות:

```text
BorrowAvailable at scan time
BorrowUnavailable at submit time
```

‏לכן צריך `BorrowAge` ו־pre-submit revalidation.

---

# ‏7. `Borrow Freshness`

‏בדיוק כמו Market Data, גם Borrow Data יכול להיות stale.

‏שדות שימושיים:

```text
BorrowStatus
BorrowTimestamp
BorrowAge
BorrowSource
BorrowQuantityAvailable
BorrowFeeEstimate
BorrowGeneration
```

‏Candidate Short עם `BorrowAge` גבוה מדי צריך להיחשב לא ודאי.

---

# ‏8. `BorrowGeneration`

‏אחרי reconnect או refresh משמעותי, Borrow state ישן עלול לא להיות תקף.

‏לכן אפשר לחשוב על:

```text
BorrowGenerationId
```

‏וכאשר generation מתחלף, יש לבצע revalidation.

---

# ‏9. `Borrow Fee`

‏השאלת מניות יכולה לעלות כסף.

‏העלות תלויה במנגנון Broker/lending ובתנאי השוק.

‏ל־Short קצר מאוד העלות הישירה של Borrow עשויה להיות קטנה יחסית בזמן, אבל אסור להניח שהיא תמיד זניחה.

‏במיוחד ב־HTB יש לבדוק Economic Impact בפועל.

---

# ‏10. `All-In Short Cost`

‏עלות Short אינה רק Commission.

```text
NetShortEdge
= PredictedMove
- Spread
- Slippage
- Commission
- BorrowCost
- Impact
- AdverseSelection
- OtherOperationalCosts
```

‏המודל צריך להיות זהה ברוחו לצד Long: Edge נמדד נטו.

---

# ‏11. Borrow fee שנתי מול holding קצר

‏גם כאשר Broker מציג שיעור annualized, צריך להמיר אותו לעלות רלוונטית להחזקה בפועל לפי מנגנון החיוב האמיתי.

‏אין להניח נוסחת חיוב בלי לאמת Broker semantics.

---

# ‏12. `Recall`

‏מלווה המניות יכול לדרוש את החזרתן.

‏במקרה כזה ה־Short עלול להפוך לבעיה תפעולית גם אם ה־Signal המקורי עדיין קיים.

‏כלומר:

```text
Signal State
!= Borrow State
```

---

# ‏13. `Buy-In`

‏במצבים מסוימים Broker/clearing יכול לכפות סגירה של Short כדי להחזיר מניות.

‏מבחינת המערכת:

```text
ForcedExit
```

‏הוא Event נפרד מ־Strategy Exit.

---

# ‏14. Exit שלא נבחר על ידי Strategy

‏Short system חייב להבדיל:

```text
StrategyExit
RiskExit
BorrowRecallExit
ForcedBuyInExit
OperationalExit
```

‏אחרת RCA של PnL יהיה מטעה.

---

# ‏15. Short Squeeze

‏כאשר הרבה משתתפים Short ומחיר מתחיל לעלות, קניות לכיסוי יכולות להוסיף ביקוש נוסף.

‏כך נוצר feedback loop אפשרי:

```text
Price Up
→ Shorts Cover
→ More Buy Pressure
→ Price Up Further
```

‏זה אחד ההבדלים המרכזיים בין downside momentum ל־upside squeeze dynamics.

---

# ‏16. `Crowded Short`

‏Short crowded יכול להציג:

- ‏Borrow scarcity.
- ‏Higher borrow fees.
- ‏Fast upside reversals.
- ‏Gap risk.
- ‏Liquidity instability.
- ‏Higher forced-cover sensitivity.

‏לכן short interest-like context יכול להיות Feature/Risk Context, לא בהכרח Signal בפני עצמו.

---

# ‏17. `Squeeze Risk` אינו Binary

‏אפשר לחשוב על composite research features כגון:

```text
BorrowScarcity
BorrowFeeLevel
RecentUpsideAcceleration
VolumeShock
SpreadExpansion
LiquidityWithdrawal
GapBehavior
CrowdingProxy
```

‏אבל צריך validation ולא “סיפור יפה”.

---

# ‏18. Upside Tail Risk

‏ב־Short, אירוע חיובי חד יכול לייצר move חריג מאוד.

‏לכן distribution של הפסדים יכולה להיות fat-tailed במיוחד.

‏Mean בלבד לא מספיק.

---

# ‏19. Stop אינו Guarantee

‏Stop יכול להקטין exposure בתנאים מסוימים, אבל אינו מבטיח fill במחיר הרצוי.

‏ב־gap או fast market:

```text
TriggerPrice != FillPrice
```

---

# ‏20. Position Size בצד Short

‏Sizing צריך לקחת בחשבון:

- ‏Upside tail risk.
- ‏Borrow state.
- ‏Liquidity.
- ‏Spread.
- ‏Event risk.
- ‏Gap risk.
- ‏Exit capacity.
- ‏Portfolio concentration.

‏לא נכון להעתיק אוטומטית Long sizing.

---

# ‏21. `Short Eligibility`

‏לפני Ranking אפשר לבנות שכבה:

```text
ShortEligibility
```

‏שבודקת לפחות:

```text
AccountEligible
SymbolShortable
BorrowKnown
BorrowAvailable
TradingStateValid
DataFresh
ExecutionAllowed
RiskAllowed
```

---

# ‏22. `EligibleUniverseLong` מול `EligibleUniverseShort`

‏אין סיבה להניח ששתי הקבוצות זהות.

```text
ObservedUniverse
EligibleLongUniverse
EligibleShortUniverse
```

‏עשויות להיות קבוצות שונות לחלוטין.

---

# ‏23. Short Ranking

‏גם אם משתמשים ב־Score דומה, Ranking Short עשוי להזדקק ל־features נוספים:

- ‏Borrow quality.
- ‏Borrow freshness.
- ‏Squeeze risk.
- ‏Upside tail risk.
- ‏Exit liquidity.
- ‏Short-sale constraints.

---

# ‏24. `Predictive Rank` מול `Executable Short Rank`

‏מניה יכולה להיות Rank #1 לחיזוי ירידה אך Rank נמוך מאוד לביצוע Short.

```text
PredictiveShortRank
→ BorrowFeasibility
→ ExecutionFeasibility
→ NetShortUtility
```

---

# ‏25. `NO TRADE` בצד Short

‏אם אין Borrow תקין או שהסיכון התפעולי גבוה מדי:

```text
NO TRADE
```

‏גם אם Predictive Score מצוין.

---

# ‏26. Short-side Veto Engine

‏60A מתחבר ישירות ל־Short.

‏דוגמאות ל־Hard Veto:

```text
BORROW_UNKNOWN
BORROW_UNAVAILABLE
SYMBOL_NOT_SHORTABLE
TRADING_STATE_INVALID
DATA_STALE
EXIT_LIQUIDITY_UNACCEPTABLE
BROKER_STATE_UNKNOWN
```

---

# ‏27. Soft Penalties בצד Short

‏דוגמאות מחקריות:

```text
HIGH_BORROW_COST
BORROW_AGE_HIGH
SQUEEZE_RISK_ELEVATED
SPREAD_WIDE
UPSIDE_ACCELERATION_RECENT
LIQUIDITY_DETERIORATING
```

‏אין להפוך אותן אוטומטית ל־Hard Veto בלי Evidence.

---

# ‏28. `Short Sale Restrictions`

‏יש מסגרות שוק ורגולציה שיכולות להגביל כיצד ומתי ניתן לבצע Short.

‏הכללים המדויקים עשויים להשתנות ודורשים verification עדכני לפני implementation.

‏מבחינת Architecture צריך לתמוך ב:

```text
ShortRestrictionState
```

---

# ‏29. Regulation הוא Input ל־Execution

‏Restriction אינו רק Legal Note.

‏הוא יכול לשנות:

- ‏Allowed order behavior.
- ‏Fill probability.
- ‏Price aggressiveness.
- ‏Entry timing.
- ‏Opportunity availability.

---

# ‏30. Broker Rules ≠ Exchange Rules

‏Broker יכול להוסיף מגבלות מעבר לדרישות השוק.

‏לכן צריך להפריד:

```text
MarketRule
BrokerRule
AccountRule
StrategyRule
```

---

# ‏31. `Shortable` אינו בהכרח `Borrowed`

‏תווית “shortable” יכולה להיות broad eligibility, בעוד Borrow בפועל הוא state יותר ספציפי.

‏צריך להבין semantics של provider/broker ולא להניח.

---

# ‏32. Pre-Submit Borrow Revalidation

‏לפני order אמיתי:

```text
RevalidateBorrow()
RevalidateTradingState()
RevalidateRisk()
RevalidateMarketData()
```

‏במיוחד כאשר Signal Half-Life קצר.

---

# ‏33. Borrow latency

‏אם בדיקת Borrow איטית, היא צורכת Signal Half-Life.

‏לכן:

```text
BorrowCheckLatency
```

‏הוא חלק מ־End-to-End latency.

---

# ‏34. Cache Borrow State בזהירות

‏Caching יכול להפחית latency אך להגדיל stale risk.

‏זו trade-off אמיתית:

```text
Freshness vs Speed
```

---

# ‏35. Fast Path / Deep Path

‏אפשר לבנות:

```text
Fast Path:
shortable + borrow-known + basic fee/risk gate

Deep Path:
borrow depth/quality + squeeze context + detailed execution economics
```

‏Deep result שמגיע מאוחר מדי צריך להיזרק.

---

# ‏36. Long Signal ו־Short Signal אינם חייבים להיות Mirror

‏למשל:

```text
+Momentum
```

‏ו־

```text
-Momentum
```

‏לא בהכרח בעלי אותו Expected Outcome בגלל:

- ‏Different market microstructure.
- ‏Different crowding.
- ‏Different news asymmetry.
- ‏Borrow constraints.
- ‏Different execution restrictions.

---

# ‏37. Short Momentum Research

‏צריך לבדוק אותו כבעיה עצמאית.

‏לא נכון להניח:

```text
ShortModel(x) = -LongModel(x)
```

---

# ‏38. Features asymmetric

‏Feature יכול לעבוד מצוין ב־Long ולא לעבוד ב־Short.

‏למשל trade-rate spike או imbalance יכולים לקבל משמעות אחרת בצד היורד.

---

# ‏39. Labels asymmetric

‏גם Labels צריכים להיות נפרדים:

```text
ForwardDownReturn
TimeToDownTarget
DownsideMFE
UpsideMAE
TimeToCover
PostTargetReversal
```

---

# ‏40. Exit בצד Short

‏כדי לצאת מ־Short צריך לקנות חזרה.

‏לכן Exit feasibility תלוי ב־Ask/liquidity בצד הקנייה.

---

# ‏41. Short Entry ו־Short Exit אינם אותה פעולה

```text
EntryShort = Sell
ExitShort = BuyToCover
```

‏זה משפיע על spread/slippage/adverse selection.

---

# ‏42. `BuyToCover` urgency

‏ב־squeeze או event shock, urgency יכולה לעלות מהר.

‏Exit policy חייבת לתמוך ב־escalation.

---

# ‏43. `TimeToFlat`

‏גם בצד Short:

```text
ExitSignalTime
→ ExitSubmitTime
→ FirstFillTime
→ FullyFlatTime
```

‏המדד החשוב הוא `FullyFlatTime`.

---

# ‏44. Partial Cover

‏אם קיבלנו רק חלק מה־cover:

```text
RemainingShortExposure > 0
```

‏המערכת עדיין חשופה.

---

# ‏45. Pending Exposure

‏Cancel של cover order לא אומר שאין exposure.

‏צריך reconciliation מול Broker truth.

---

# ‏46. `UNKNOWN_EFFECT`

‏אם submit/cancel/update נכשל באופן לא ברור:

```text
UNKNOWN_EFFECT
```

‏אסור לבצע retry עיוור.

---

# ‏47. Short-specific Broker Reconciliation

‏צריך להשוות:

```text
LocalPosition
BrokerPosition
OpenOrders
BorrowState
ShortabilityState
```

---

# ‏48. Restart with Short Position

‏Restart חייב לזהות Short קיים לפני פתיחת exposure נוסף.

‏אין להניח flat state.

---

# ‏49. Forced Action Priority

‏אם יש Event שדורש cover:

```text
Safety/Broker Forced Action
>
New Signal
```

---

# ‏50. Corporate Actions ו־Short

‏Corporate Actions יכולים לשנות economics, quantity, price reference או obligations.

‏לכן Short system חייב להיות event-aware.

---

# ‏51. Dividends

‏Short seller יכול להיות חשוף לתשלומים/adjustments הקשורים לדיבידנד לפי המכניקה הרלוונטית.

‏אין להניח ש־dividend הוא “רווח חינם” בצד Short.

---

# ‏52. Split / Reverse Split

‏צריך להבטיח ש־position quantity, price, labels ו־historical data מותאמים נכון.

‏אחרת אפשר ליצור PnL פיקטיבי.

---

# ‏53. Symbol/Identity Changes

‏Short position צריך לעקוב אחרי Security Identity, לא רק ticker string.

---

# ‏54. Halts

‏Short בזמן Halt יוצר אותו challenge בסיסי כמו Long — אין execution רגיל בזמן halt — אבל post-halt upside risk יכול להיות חריף במיוחד ל־Short.

---

# ‏55. Resume Risk

‏אחרי resume:

- ‏Spread יכול להיות רחב.
- ‏Price יכול לקפוץ.
- ‏Liquidity יכולה להיות דקה.
- ‏Fill uncertainty גבוהה.

---

# ‏56. Event Risk

‏News/Events משלב 69 חשובים במיוחד ב־Short בגלל upside tail.

‏Event-aware veto יכול להיות רלוונטי.

---

# ‏57. Earnings-like States

‏אירועים עם price discovery אינטנסיבי אינם צריכים להיחשב אוטומטית כמו ordinary momentum.

---

# ‏58. Borrow Cost Drift

‏Borrow fee יכול להשתנות לאורך זמן.

‏לכן Backtest עם fee קבוע עלול להיות misleading.

---

# ‏59. Historical Borrow Data

‏אחד האתגרים הגדולים ב־Short backtesting הוא להשיג historical borrow state אמין.

‏אם אין data כזה, צריך לסמן את limitation במפורש.

---

# ‏60. Backtest Short בלי Borrow Data

‏אם מתעלמים מ־Borrow:

```text
BacktestUniverse > RealShortableUniverse
```

‏והתוצאה אופטימית מדי.

---

# ‏61. Selection Bias ב־Short

‏המניות עם הירידות הכי מעניינות יכולות להיות גם אלה שהכי קשה להשאיל.

‏אם Backtest בוחר אותן כאילו כולן זמינות, מתקבל bias משמעותי.

---

# ‏62. `Borrow Survivorship Bias`

‏שימוש ב־shortability של היום כדי לשפוט historical candidates יוצר leakage.

‏צריך Point-in-Time Borrow data.

---

# ‏63. `BorrowFee Survivorship`

‏גם fee היסטורי צריך להיות Point-in-Time.

‏לא להשתמש ב־current fee עבור עבר.

---

# ‏64. Historical Restriction State

‏גם מגבלות מסחר היסטוריות צריכות להיות משוחזרות לפי מה שהיה ידוע באותו זמן.

---

# ‏65. Short Backtest Layers

```text
Predictive Backtest
→ Short Eligibility Backtest
→ Borrow-Aware Backtest
→ Execution Backtest
→ Stress Backtest
```

---

# ‏66. Best/Base/Stress

‏אפשר לבנות scenarios:

```text
Best: borrow available, normal fill
Base: realistic borrow/latency/slippage
Stress: borrow scarce, worse fill, forced exit risk
```

---

# ‏67. Stress Test Squeeze

‏Backtest/Replay צריך לכלול episodes של sharp upside reversal.

---

# ‏68. Stress Test Borrow Loss

‏תרחיש:

```text
Position Open
→ Borrow State Changes
→ Forced Cover Required
```

---

# ‏69. Stress Test Data/Broker Disconnect

‏Short position קיים בזמן disconnect הוא מצב קריטי.

---

# ‏70. Stress Test Halt/Resume

‏צריך לבדוק Exit logic גם כאשר אין continuous execution.

---

# ‏71. `ShortRiskBudget`

‏אפשר להפריד תקציב Risk ל־Long ול־Short.

‏הם לא חייבים להיות סימטריים.

---

# ‏72. Concentration Risk

‏מספר Shorts correlated באותו sector/theme יכולים להפוך ל־single risk bet.

---

# ‏73. Correlation Shock

‏ב־market-wide rally, הרבה Shorts יכולים לזוז נגדנו יחד.

---

# ‏74. Gross מול Net Exposure

‏כאשר יש Long + Short:

```text
GrossExposure
NetExposure
```

‏שניהם חשובים.

---

# ‏75. Market Neutral אינו Risk Free

‏Long ו־Short יכולים לקזז Beta אך להשאיר:

- ‏Basis risk.
- ‏Liquidity risk.
- ‏Borrow risk.
- ‏Factor risk.
- ‏Execution risk.

---

# ‏76. `ShortCapacity`

‏יכולת להגדיל position תלויה גם ב־borrow supply, לא רק market liquidity.

---

# ‏77. Capacity Constraint נוסף

```text
MaxTradeSizeShort
= min(
  MarketLiquidityCapacity,
  BorrowCapacity,
  RiskCapacity
)
```

---

# ‏78. `BorrowQuantityAvailable`

‏אם provider חושף estimate של quantity, הוא יכול להיות חלק מ־capacity model.

‏אבל semantics צריכים verification.

---

# ‏79. Borrow Quantity אינה Guarantee

‏כמו quote depth, גם displayed/estimated availability יכולה להשתנות.

---

# ‏80. Short Entry Opportunity Cost

‏Candidate יכול להיראות טוב אבל Borrow check איטי מדי.

‏זה Opportunity Cost.

---

# ‏81. Borrow Check as Decision Cost

‏אם borrow validation צורך חלק גדול מ־Signal Half-Life:

```text
LatencyPressureShort ↑
```

---

# ‏82. `RemainingEdge` בצד Short

```text
RemainingShortEdge
= PredictedDownsideEdge
- ExecutionCosts
- BorrowCosts
- LatencyDecay
- SqueezeRiskPenalty
- UncertaintyBuffer
```

---

# ‏83. Hard Gate לפני Rank או אחרי Rank?

‏Borrow status basic validity מתאים לעיתים לפני Rank.

‏Detailed economics יכולים להגיע אחרי Top-K.

---

# ‏84. Fast Universe Filter

‏אפשר לפסול upfront:

```text
NOT_SHORTABLE
BORROW_UNAVAILABLE
BORROW_UNKNOWN_TOO_OLD
```

---

# ‏85. Deep Candidate Check

‏ל־Top-N בלבד:

- ‏Borrow fee.
- ‏Borrow age.
- ‏Squeeze context.
- ‏Detailed exit feasibility.
- ‏Restriction state.

---

# ‏86. `NO TRADE` בגלל Borrow

‏זה outcome תקין לחלוטין.

‏אין “לעקוף” את המגבלה רק כי Signal חזק.

---

# ‏87. Short-specific Reason Codes

‏לדוגמה:

```text
SHORT_NO_BORROW
SHORT_BORROW_STALE
SHORT_HTB_RISK
SHORT_RESTRICTION_ACTIVE
SHORT_SQUEEZE_RISK
SHORT_EXIT_LIQUIDITY_LOW
SHORT_BROKER_STATE_UNKNOWN
```

---

# ‏88. Explainability

‏כאשר Rank #1 נפסל, צריך לדעת למה.

‏זה חשוב במיוחד כי Short has extra gates.

---

# ‏89. Counterfactual Logging

‏לשמור:

```text
What would have happened if borrow were available?
```

‏למחקר בלבד.

---

# ‏90. Do Not Fake Fills

‏אסור להפוך Candidate לא זמין ל־“hypothetical trade” בתוך PnL הרשמי.

‏אפשר לשמור אותו כ־counterfactual dataset נפרד.

---

# ‏91. Opportunity Set

‏צריך למדוד:

```text
PredictiveShortOpportunities
BorrowEligibleOpportunities
ExecutableShortOpportunities
ActualTrades
```

---

# ‏92. Funnel Analysis

```text
Observed
→ Predictive
→ Borrow Eligible
→ Execution Eligible
→ Trade
```

‏כך רואים איפה ההזדמנויות נעלמות.

---

# ‏93. Borrow Hit Rate

‏מדד שימושי:

```text
BorrowEligibleCandidates / PredictiveShortCandidates
```

---

# ‏94. Borrow Rejection Impact

‏כמה net outcome משתנה בגלל פסילות Borrow?

---

# ‏95. False Opportunity

‏Signal שהיה רווחי תיאורטית אך לא shortable אינו missed profit אמיתי.

‏הוא unavailable opportunity.

---

# ‏96. False Confidence

‏Backtest שמציג אותו כרווח יוצר false confidence.

---

# ‏97. Short-specific Live Calibration

‏למדוד:

- ‏Borrow check latency.
- ‏Borrow success rate.
- ‏Borrow fee estimation error.
- ‏Entry fill quality.
- ‏Cover fill quality.
- ‏Forced-exit frequency.

---

# ‏98. Borrow Drift

‏יכול להיות שינוי systematic בזמינות/עלות borrow לאורך זמן.

---

# ‏99. Broker Adapter

‏`ExecutionBroker` צריך לחשוף semantics ברורים ל־Short capabilities.

---

# ‏100. Provider-agnostic Contract

‏לא לקודד logic ישירות ל־Broker ספציפי.

‏למשל:

```text
GetShortability(symbol)
GetBorrowState(symbol)
ValidateShortOrder(intent)
```

---

# ‏101. Capability Discovery

‏Adapter צריך לדעת אם Broker בכלל תומך בשדות/פעולות מסוימים.

---

# ‏102. `UNKNOWN` Capability

‏אם capability לא ידועה:

```text
UNKNOWN
```

‏ולא assumption optimistic.

---

# ‏103. Broker Data Quality

‏גם Borrow feed דורש health monitoring.

---

# ‏104. Borrow Data SLO

‏אפשר למדוד:

```text
BorrowFreshCoverage
BorrowUnknownRate
BorrowLookupLatencyP95
BorrowLookupFailureRate
```

---

# ‏105. Operational Alerts

‏Alert כאשר:

- ‏Borrow unknown rate קופץ.
- ‏Provider errors עולים.
- ‏Positions קיימים בזמן borrow degradation.
- ‏Forced exits מתרבים.

---

# ‏106. Kill Switch

‏אפשר לחסום **new short entries** בלי לחסום cover exits.

‏זה distinction קריטי.

---

# ‏107. `DisableNewShorts`

‏Control נפרד:

```text
DisableNewShorts = true
```

‏בעוד Exit path נשאר פעיל.

---

# ‏108. Exit תמיד בעדיפות

‏אסור שמנגנון שמגן מפני opening new risk יחסום cover של position קיים.

---

# ‏109. Safe Degradation

‏אם Borrow service degraded:

```text
NoNewShorts
AllowRiskReduction
```

---

# ‏110. Cold Start

‏בתחילת session, Borrow cache אולי עדיין לא מוכן.

‏`NOT_READY` עדיף על guessing.

---

# ‏111. Warmup

‏Universe Short צריך להיות מוכן לפני שמאפשרים Entry.

---

# ‏112. Reconnect

‏אחרי reconnect:

```text
Invalidate stale borrow state
Refresh positions
Refresh open orders
Refresh shortability
Refresh borrow state
```

---

# ‏113. Reconciliation First

‏אם יש discrepancy, אין Entry חדש לפני reconciliation.

---

# ‏114. Manual Intervention

‏Manual borrow/position action צריך להיות audit event.

---

# ‏115. Security / Permissions

‏Short capability יכולה לדרוש account permissions מסוימים.

‏Architecture צריכה להבחין בין `Configured` ל־`ActuallyAllowed`.

---

# ‏116. `Eligibility Ready`

‏לפני Live:

```text
AccountEligibleForShort
BrokerCapabilityVerified
BorrowSemanticsVerified
RiskControlsVerified
```

---

# ‏117. Paper ≠ Borrow Reality

‏Paper environment יכול לא לדמות Borrow בדיוק.

‏לכן Paper success אינו proof של Short feasibility.

---

# ‏118. Shadow Borrow

‏אפשר להריץ live borrow checks בלי לשלוח order ולמדוד feasibility אמיתית.

---

# ‏119. Shadow Dataset

‏לשמור:

```text
CandidateTime
BorrowState
BorrowLatency
FeeEstimate
WouldTrade
SubsequentOutcome
```

---

# ‏120. Champion/Challenger

‏אפשר להשוות Short policies שונות ב־Shadow:

- ‏Strict borrow gates.
- ‏Fee-aware ranking.
- ‏Squeeze-aware veto.

---

# ‏121. Do Not Optimize on One Squeeze Event

‏אירוע קיצון יחיד לא צריך לבדו לקבוע policy שלמה.

‏צריך sample ו־stress logic.

---

# ‏122. אבל אל תתעלם מ־Tail Risk

‏Rare event יכול להיות חשוב מאוד אם impact גדול.

‏צריך לשלב frequency × severity.

---

# ‏123. Expected Short Loss

‏לא רק average adverse move.

‏גם tail distribution.

---

# ‏124. Stress Metrics

‏למשל:

```text
WorstUpsideExcursion
P99UpsideExcursion
TimeToFlatUnderStress
ForcedExitLoss
GapLoss
```

---

# ‏125. MFE/MAE בצד Short

‏יש להגדיר כיוונית נכון.

‏מה שנחשב favorable ל־Short הוא ירידה.

---

# ‏126. Markout בצד Short

‏לאחר fill Short:

```text
Positive short markout
```

‏צריך להוגדר באופן עקבי כדי שלא להפוך signs.

---

# ‏127. Sign Convention

‏אחת הטעויות הנפוצות היא בלבול סימנים.

‏הגדירו פעם אחת:

```text
EconomicPnLPositive = Good
```

‏בלי קשר לצד.

---

# ‏128. Feature Sign Convention

‏גם Features צריכים semantics ברורים.

‏למשל `MomentumScore` האם חיובי תמיד אומר “favorable to action” או פשוט “price up”.

---

# ‏129. Separate Side-aware Features

‏לפעמים עדיף:

```text
UpMomentum
DownMomentum
```

‏במקום variable אחד עם sign מורכב.

---

# ‏130. Separate Models

‏במקרים רבים נכון לבדוק Long ו־Short models בנפרד.

---

# ‏131. Unified Model כ־Challenger

‏אפשר לבדוק unified side-aware model, אבל לא להניח שהוא טוב יותר.

---

# ‏132. Side as Feature

‏אם משתמשים במודל משותף, `Side` חייב להיות מיוצג בצורה ברורה.

---

# ‏133. Asymmetric Calibration

‏Probability calibration עשויה להיות שונה Long/Short.

---

# ‏134. Different Cost Curves

‏Short side יכול להיות בעל cost distribution שונה.

---

# ‏135. Different Latency Curves

‏Borrow validation יכול להוסיף latency שלא קיים ב־Long.

---

# ‏136. Different Failure Modes

‏Short מוסיף failure families חדשות:

```text
BorrowUnavailable
BorrowStale
LocateFailure
Recall
ForcedBuyIn
RestrictionMismatch
```

---

# ‏137. RCA

‏ב־Short failure צריך לשאול:

```text
Was prediction wrong?
Was borrow wrong?
Was execution wrong?
Was restriction state wrong?
Was exit too slow?
Was tail risk underestimated?
```

---

# ‏138. `First Divergence`

‏כמו בשאר המערכת, מחפשים את הנקודה הראשונה שבה actual path סטה מה־expected path.

---

# ‏139. Borrow-aware Replay

‏Replay טוב צריך להזין גם Borrow events אם הם זמינים.

---

# ‏140. Replay בלי Borrow Events

‏אם אין data, limitation חייבת להיות כתובה ב־Experiment Manifest.

---

# ‏141. Borrow-aware Experiment ID

‏צריך לתעד:

```text
BorrowDatasetVersion
BorrowAssumptionVersion
BrokerCapabilityVersion
ShortRuleVersion
```

---

# ‏142. Short Rule Versioning

‏כל שינוי ב־eligibility/gating צריך version.

---

# ‏143. Regulation Versioning

‏כללים רגולטוריים ו־Broker semantics הם Time-Sensitive Facts.

‏לפני production צריך verification עדכני.

---

# ‏144. Do Not Hard-Code Temporary Rules

‏השתמשו ב־config/capability layer כאשר הכלל עשוי להשתנות.

---

# ‏145. `ShortCapabilitySnapshot`

‏לפני החלטה אפשר לשמור:

```text
Shortable
BorrowState
BorrowAge
FeeEstimate
RestrictionState
AccountPermission
BrokerGeneration
```

---

# ‏146. Decision Snapshot

‏לשמור את ה־snapshot יחד עם Candidate decision.

---

# ‏147. Auditability

‏כך אפשר להסביר למה trade הותר או נפסל.

---

# ‏148. `NO TRADE` Reason

‏Short NO TRADE צריך להיות explainable.

---

# ‏149. Short Universe Health

‏Dashboard אפשרי:

```text
ObservedSymbols
ShortableSymbols
BorrowAvailableSymbols
BorrowUnknownSymbols
HTBSymbols
RestrictedSymbols
```

---

# ‏150. Short Economic Health

‏למדוד:

- ‏Net return after costs.
- ‏Borrow cost contribution.
- ‏Fill quality.
- ‏Cover slippage.
- ‏Forced exit contribution.
- ‏Squeeze loss contribution.

---

# ‏151. Opportunity Health

‏למדוד האם רוב ה־predictive opportunities בכלל ניתנות לביצוע.

---

# ‏152. Side Comparison

‏Long vs Short צריך להשוות על בסיס:

```text
PredictiveQuality
Executability
NetEdge
FailureRate
TailRisk
OperationalComplexity
```

---

# ‏153. Complexity Tax

‏Short מוסיף מורכבות תפעולית אמיתית.

‏אם Edge דומה ל־Long אך complexity/risk גבוהים בהרבה, זה מידע חשוב.

---

# ‏154. `Borrow Edge`

‏זמינות Borrow טובה בפני עצמה אינה Alpha.

‏היא רק feasibility advantage.

---

# ‏155. `Borrow Scarcity` גם אינה Alpha בפני עצמה

‏Scarcity יכולה לשקף crowding, risk או information, אך דורשת validation.

---

# ‏156. Avoid Narrative Trading

‏“מניה קשה להשאלה אז בטוח תעלה” או “Short interest גבוה אז בטוח squeeze” הן narratives, לא models.

---

# ‏157. Research Hypotheses

‏אפשר לבדוק למשל:

```text
Does high borrow scarcity reduce net short performance?
Does recent upside acceleration increase short MAE?
Does borrow-age predict rejection rate?
```

---

# ‏158. Ablation

‏לבדוק:

```text
Base short model
+ Borrow gate
+ Fee-aware economics
+ Squeeze veto
```

‏כל שכבה צריכה להוכיח Incremental Decision Value.

---

# ‏159. False Veto

‏Short veto קשיח מדי יכול לפסול הזדמנויות אמיתיות.

‏צריך למדוד cost of rejected trades.

---

# ‏160. False Allow

‏Veto חלש מדי יכול לאפשר trades שלא היו economically executable.

---

# ‏161. Precision vs Opportunity

‏ככל שמחמירים Borrow gates, trade count עשוי לרדת.

‏השאלה היא האם net quality עולה מספיק.

---

# ‏162. Short `NO TRADE` Rate

‏זה metric חשוב, לא כשל.

---

# ‏163. Practitioner Secret — Best Signal Often Unshortable

‏בצד Short, המועמד הכי “יפה” סטטיסטית יכול להיות בדיוק זה שהכי קשה להשאיל.

---

# ‏164. Practitioner Secret — Borrow Is Part of the Market State

‏Borrow אינו רק backend constraint.

‏הוא חלק מה־state הכלכלי של Short opportunity.

---

# ‏165. Practitioner Secret — Availability Can Move Faster Than Your Model

‏Borrow יכול להשתנות מהר מספיק כדי להפוך decision ישן ללא תקף.

---

# ‏166. Practitioner Secret — Paper Can Hide the Hardest Part

‏Paper environment עלול לתת תחושת realism בעוד borrow mechanics בפועל שונים.

---

# ‏167. Practitioner Secret — Exit Risk Matters More Than Entry Elegance

‏ב־Short tail event, ability to cover safely חשובה יותר מ־entry sophistication.

---

# ‏168. Practitioner Secret — Separate “Cannot Trade” from “Should Not Trade”

```text
CannotTrade = feasibility/permission failure
ShouldNotTrade = strategy/risk judgment
```

‏ההפרדה קריטית ל־RCA.

---

# ‏169. Practitioner Secret — Unknown Borrow State Is a State

‏אין להמיר `UNKNOWN` ל־`false` או `true` בלי כוונה מפורשת.

---

# ‏170. Practitioner Secret — Side Symmetry Is Usually a Dangerous Assumption

‏Long ו־Short נראים אלגברית הפוכים, אבל market mechanics לא.

---

# ‏171. Baseline מחקרי לרובוט שלנו

‏בשלב ראשון:

```text
1. Keep Long and Short research separate.
2. Build ShortEligibility explicitly.
3. Require fresh Borrow state before Short entry.
4. Treat UNKNOWN as NO-NEW-SHORT.
5. Log Borrow snapshot with every candidate.
6. Model short costs separately.
7. Backtest with borrow-aware assumptions.
8. Use shadow borrow checks before any live short research.
9. Keep new-short kill switch separate from cover capability.
10. Measure Long vs Short net edge independently.
```

---

# ‏172. מה לא לעשות בתחילת הדרך

‏לא להתחיל מ:

- ‏Complex locate optimization.
- ‏Borrow fee prediction ML.
- ‏Crowding model עמוק.
- ‏Dynamic multi-broker borrow routing.
- ‏Automated forced-buy-in recovery logic שלא נבדק.

‏קודם צריך להוכיח שיש בכלל Short-side Edge נטו.

---

# ‏173. Definition of Done למחקר Short

‏לפני שטוענים ש־Short strategy “עובדת”, צריך לדעת:

```text
Is the signal predictive?
Was the symbol actually shortable then?
Was borrow actually available then?
Was cost modeled realistically?
Could entry have filled?
Could exit have filled?
What was tail risk?
What happens under squeeze/reconnect/halt?
Does it survive OOS?
Does shadow/live feasibility match the backtest?
```

---

# ‏174. סיכום

‏Short Selling מוסיף שכבה שלמה שאינה קיימת ב־Long באותה צורה:

```text
Prediction
→ Short Eligibility
→ Borrow Feasibility
→ Restriction Check
→ Execution Feasibility
→ Risk Gate
→ Entry
→ Position + Borrow Monitoring
→ Cover
→ Reconciliation
```

‏לכן המסקנה החשובה היא:

> ‏**Short אינו “Sell במקום Buy”. הוא אסטרטגיה עם market mechanics, data, operational state ו־risk model נוספים. Signal טוב הוא רק ההתחלה; Short אמיתי דורש Borrow אמיתי, Execution אמיתי ויכולת אמיתית לצאת.**
