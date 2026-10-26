# ‏שלב 68 — `Market Regimes and Context`: למה אותו Signal עובד אחרת בסביבות שוק שונות

> ‏מטרת הפרק: להבין איך Market Regime ו־Context משנים את המשמעות הכלכלית של אותו Signal. נלמד להגדיר, למדוד ולאמת volatility, liquidity, breadth, correlation, session state, trend/range behavior, market-wide stress, event context ו־transition states — בלי להשתמש במידע עתידי ובלי להפוך את המערכת לאוסף חוקים שביר.
>
> ‏העיקרון המרכזי: **Regime הוא Context מותנה בזמן. הוא שימושי רק אם ניתן לזהות אותו Point-in-Time, אם הוא משנה החלטה או Expected Outcome באופן יציב, ואם השיפור נשאר גם מחוץ למדגם ותחת execution ריאלי.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. מהו `Market Regime`

‏Regime הוא מצב שוק שבו יחסי ההתנהגות בין Signals, Liquidity, Volatility, Costs ו־Outcomes שונים באופן מספיק משמעותי ממצבים אחרים.

‏דוגמאות כלליות:

```text
Low Volatility / High Liquidity
High Volatility / High Liquidity
High Volatility / Thin Liquidity
Broad Market Trend
Range / Mean-Reversion Environment
Market-Wide Stress
Sector-Led Move
Opening Transition
Midday Quiet
Closing Transition
Post-Halt / Post-News-Like State
```

‏Regime אינו חייב להיות category אחת.

‏לעיתים נכון יותר לחשוב על Vector של Context:

```text
VolatilityState
LiquidityState
BreadthState
CorrelationState
SessionState
StressState
EventState
TrendState
```

---

# ‏2. למה אותו Signal משתנה בין Regimes

‏נניח שיש Signal של עלייה מהירה ב־5 שניות.

‏ב־Regime אחד הוא עשוי להמשיך כי:

- ‏יש breadth רחב.
- ‏ה־market עצמו נע באותו כיוון.
- ‏liquidity טובה.
- ‏spread קטן.
- ‏participation רחבה.

‏ב־Regime אחר אותה תנועה עשויה להיות:

- ‏single-print artifact.
- ‏liquidity vacuum.
- ‏short-lived spike.
- ‏reversal בתוך שוק range-bound.
- ‏move עם spread רחב מדי.

‏לכן Feature אינו נפרד מה־Context שבו הוא מופיע.

---

# ‏3. `Conditional Edge`

‏במקום לשאול:

```text
What is E[Return | Signal]?
```

‏אפשר לשאול:

```text
What is E[Return | Signal, Regime]?
```

‏אבל צריך להיזהר.

‏ככל שמוסיפים Conditions:

- ‏sample קטן.
- ‏variance גדל.
- ‏multiple testing גדל.
- ‏overfitting נהיה קל יותר.

‏לכן Context טוב צריך לשפר החלטה, לא רק לייצר יותר buckets.

---

# ‏4. Context מול Regime

‏`Context` הוא כל מידע סביב Signal שעשוי לשנות את משמעותו.

‏`Regime` הוא Context יציב יחסית לאורך חלון מסוים.

‏לדוגמה:

```text
SpreadNow = Context
VolatilityState = Regime-like Context
OpeningAuctionJustEnded = Context / Transition State
MarketStressHighFor15Min = Regime
```

‏הגבול אינו חד.

‏העיקר הוא semantics ברורים.

---

# ‏5. Regime חייב להיות Point-in-Time

‏אסור להגדיר Regime באמצעות מידע שלא היה ידוע בזמן ההחלטה.

‏דוגמה גרועה:

```text
Regime = "Trending Day"
```

‏כאשר label נקבע לפי כל יום המסחר בדיעבד.

‏בשעה 10:05 לא ידענו עדיין אם היום כולו יהיה Trending Day.

‏במקום זאת:

```text
ObservedTrendStrengthAsOfNow
ObservedBreadthAsOfNow
ObservedVolatilityAsOfNow
```

‏זה ההבדל בין Research אמיתי לבין Look-Ahead.

---

# ‏6. `Regime Leakage`

‏Regime Leakage קורה כאשר classification של המצב משתמש בעתיד.

‏מקורות נפוצים:

- ‏end-of-day volatility.
- ‏daily high/low שטרם נוצרו.
- ‏full-session VWAP.
- ‏future breadth.
- ‏future realized volatility.
- ‏event label שנקבע לפי reaction עתידי.

‏כל Regime Feature צריך `AsKnownAt` ברור.

---

# ‏7. Hard Label מול Soft State

‏אפשר לייצג Regime כך:

```text
LOW_VOL
NORMAL_VOL
HIGH_VOL
```

‏אבל לעיתים המציאות רציפה יותר.

‏אפשר גם:

```text
P(LowVol) = 0.12
P(NormalVol) = 0.58
P(HighVol) = 0.30
```

‏Soft State מאפשר לעבוד עם uncertainty.

---

# ‏8. למה Labels קשיחים מסוכנים

‏אם threshold הוא:

```text
HighVol if RV > 1.50
```

‏אז ערכים 1.49 ו־1.51 כמעט זהים כלכלית, אבל מקבלים label שונה.

‏זו discontinuity מלאכותית.

‏לכן אפשר להשתמש ב:

- ‏continuous features.
- ‏soft probabilities.
- ‏hysteresis.
- ‏transition bands.

---

# ‏9. `Hysteresis`

‏Hysteresis מונע flip-flop בין regimes.

‏לדוגמה:

```text
Enter HIGH_VOL above 1.60
Exit HIGH_VOL below 1.40
```

‏כך המערכת אינה משנה state כל tick סביב threshold אחד.

---

# ‏10. Transition State

‏מעבר בין Regimes הוא לעיתים state בפני עצמו.

‏לדוגמה:

```text
NORMAL → STRESS
STRESS → RECOVERY
QUIET → BURST
```

‏ה־transition עצמו יכול להיות תקופה עם behavior שונה.

---

# ‏11. Volatility Regime

‏Volatility יכולה להימדד בכמה אופנים:

- ‏realized return variance.
- ‏absolute returns.
- ‏range.
- ‏spread-adjusted movement.
- ‏cross-sectional dispersion.
- ‏market-index movement.

‏אין metric יחיד שמתאים תמיד.

---

# ‏12. Volatility אינה Direction

‏High volatility יכולה להיות:

- ‏עלייה חזקה.
- ‏ירידה חזקה.
- ‏whipsaw.
- ‏wide range ללא trend.

‏לכן `VolatilityState` ו־`DirectionState` הם דברים שונים.

---

# ‏13. Liquidity Regime

‏Liquidity Context יכול לכלול:

- ‏spread.
- ‏displayed depth.
- ‏trade rate.
- ‏quote update rate.
- ‏top-of-book stability.
- ‏fill probability.
- ‏market impact proxy.

‏Liquidity אינה רק Volume.

---

# ‏14. Thin Liquidity

‏ב־thin liquidity:

- ‏מחיר יכול לזוז מהר.
- ‏Signal נראה חזק.
- ‏אבל execution cost גדל.

‏לכן fast move אינו בהכרח better opportunity.

---

# ‏15. Breadth

‏Breadth עונה על:

> ‏האם התנועה רחבה או מרוכזת במספר Symbols?

‏אפשר למדוד למשל:

```text
% symbols positive over horizon
% symbols above reference
advancers / decliners
cross-sectional median return
sector breadth
```

---

# ‏16. Breadth ו־Short-Horizon Momentum

‏מניה שעולה כאשר הרבה מניות דומות עולות עשויה להיות חלק מ־market-wide move.

‏מניה שעולה לבד עשויה להיות idiosyncratic.

‏שני המצבים יכולים להיות טובים או רעים — אך הם שונים.

---

# ‏17. Market Beta Context

‏נרצה להבחין בין:

```text
StockReturn
MarketReturn
ResidualReturn
```

‏אם כל השוק עלה 0.4% והמניה עלתה 0.45%, ה־relative edge עשוי להיות קטן.

---

# ‏18. Residual Momentum

‏אפשר לחקור:

```text
Residual = StockReturn - beta * MarketReturn
```

‏או approximation פשוט יותר.

‏המטרה היא להבדיל בין market-driven move לבין stock-specific move.

---

# ‏19. Sector Context

‏לעיתים sector מסביר יותר מה־market כולו.

‏אפשר להשוות Candidate מול:

- ‏broad market.
- ‏sector ETF/proxy.
- ‏peer group.

‏אבל צריך Point-in-Time constituent mapping.

---

# ‏20. Correlation Regime

‏בזמנים מסוימים correlations בין מניות עולות.

‏אז הרבה Signals שנראים עצמאיים הם למעשה אותו factor.

‏זה חשוב ל:

- ‏diversification.
- ‏ranking.
- ‏exposure.
- ‏false sample size.

---

# ‏21. Cross-Sectional Dispersion

‏Dispersion מודדת כמה Symbols שונים זה מזה באותו זמן.

‏High dispersion יכולה לתת יותר differentiation ל־ranking.

‏Low dispersion יכולה לגרום ל־score compression.

---

# ‏22. Score Compression כ־Context

‏אם כל ה־Top candidates כמעט זהים:

```text
Rank1 = 0.811
Rank2 = 0.809
Rank3 = 0.807
```

‏ה־winner פחות משכנע.

‏זה למעשה Context של ranking uncertainty.

---

# ‏23. Trend Regime

‏Trend state יכול להימדד באמצעות:

- ‏multi-horizon returns.
- ‏slope.
- ‏directional persistence.
- ‏higher-high/lower-low style features.
- ‏breadth persistence.

‏אבל לא צריך להסתמך על indicator אחד בלבד.

---

# ‏24. Range Regime

‏Range state מתאפיין לעיתים ב:

- ‏low directional persistence.
- ‏frequent reversals.
- ‏contained price range.
- ‏mean reversion סביב reference.

‏Momentum signal עשוי להתנהג אחרת כאן.

---

# ‏25. Trend Strength ≠ Trend Direction

‏אפשר להיות ב־strong downtrend.

‏לכן:

```text
TrendDirection
TrendStrength
```

‏הם שני features שונים.

---

# ‏26. Session Context

‏התנהגות השוק משתנה לאורך session.

‏לדוגמה כללית:

- ‏open transition.
- ‏early regular session.
- ‏mid-session.
- ‏late session.
- ‏close transition.

‏אבל אין להניח מראש שכל יום מתנהג אותו דבר.

---

# ‏27. Time-of-Day אינו Regime לבדו

‏`10:00` אינו regime.

‏הוא Context temporal.

‏Regime עשוי להיות:

```text
10:00 + elevated volatility + high breadth + high liquidity
```

---

# ‏28. Opening Transition

‏סביב פתיחת session יכולים להיות:

- ‏price discovery.
- ‏high update rates.
- ‏spread changes.
- ‏imbalances.
- ‏fast ranking turnover.

‏לכן baseline שנלמד באמצע היום לא בהכרח מועבר ישירות לפתיחה.

---

# ‏29. Closing Transition

‏גם לקראת סיום session יכולים להשתנות:

- ‏liquidity.
- ‏volume.
- ‏routing behavior.
- ‏auction-related flow.
- ‏risk behavior.

‏צריך Context נפרד.

---

# ‏30. Intraday Seasonality

‏Metrics רבים תלויים בשעה:

- ‏volume.
- ‏volatility.
- ‏spread.
- ‏trade rate.

‏לכן normalization לעיתים צריך להיות time-of-day aware.

---

# ‏31. Relative Activity

‏במקום:

```text
TradesPerSecond = 20
```

‏נוכל לשאול:

```text
CurrentTradeRate / ExpectedTradeRateAtThisTime
```

‏זה Context טוב יותר לעיתים.

---

# ‏32. Relative Volume

‏`RVOL` הוא דוגמה לעיקרון רחב:

> ‏השווה activity למה שנורמלי לאותו Symbol ולאותה שעה.

‏אבל calibration חייב להיות Point-in-Time.

---

# ‏33. Market-Wide Stress

‏Stress state יכול לכלול:

- ‏spread widening רחב.
- ‏latency increase.
- ‏quote churn.
- ‏correlation jump.
- ‏volatility jump.
- ‏liquidity withdrawal.

‏זה Context תפעולי וכלכלי גם יחד.

---

# ‏34. Stress אינו בהכרח `NO TRADE`

‏Stress יכול ליצור Opportunities.

‏אבל גם:

- ‏costs גבוהים יותר.
- ‏adverse selection גבוה יותר.
- ‏execution uncertainty גבוהה יותר.

‏לכן צריך למדוד Net Edge, לא לפסול אוטומטית.

---

# ‏35. `NO TRADE` Context

‏Regime engine יכול לתמוך ב־NO TRADE כאשר:

```text
ExpectedEdge
- ExpectedCosts
- UncertaintyBuffer
<= 0
```

‏אבל זה Economic Gate, לא label רגשי כמו “שוק מפחיד”.

---

# ‏36. Event Context

‏יש מצבים שבהם Symbol או Market נמצאים סביב Event.

‏הפרק אינו מניח שנדע תמיד את האירוע עצמו.

‏אפשר למדוד Context observable:

- ‏sudden volatility burst.
- ‏abnormal trade rate.
- ‏spread shock.
- ‏gap-like move.
- ‏halt/resume status.

---

# ‏37. Known Event מול Observed Event State

‏יש הבדל בין:

```text
KnownScheduledEvent
ObservedAbnormalMarketState
```

‏שניהם Context, אבל מקור המידע שונה.

---

# ‏38. Halt/Resume Context

‏אחרי Halt/Resume:

- ‏historical features יכולים להיות stale.
- ‏spread/depth יכולים להשתנות.
- ‏rank יכול לקפוץ.

‏לכן אפשר להפעיל warmup/context reset.

---

# ‏39. Market Generation

‏אחרי discontinuity משמעותי אפשר לייצר:

```text
MarketGeneration++
```

‏כדי לא לערבב state ישן עם state חדש.

---

# ‏40. Data Generation

‏גם אחרי reconnect/resync של feed ייתכן:

```text
DataGeneration++
```

‏Context engine צריך לדעת מאיזו generation הגיע כל feature.

---

# ‏41. Regime Feature Freshness

‏Regime עצמו יכול להיות stale.

‏לכל State צריך:

```text
ComputedAt
SourceAge
WindowEnd
Confidence
```

---

# ‏42. Decision Age

‏לא מספיק לדעת ש־Regime feature fresh.

‏צריך לדעת כמה זמן עבר מאז כל Context snapshot עד ההחלטה.

---

# ‏43. Multi-Horizon Context

‏אפשר להחזיק Context בכמה horizons:

```text
100ms
1s
5s
30s
5m
```

‏לא כל horizon רלוונטי לכל סוג Context.

---

# ‏44. Fast Context ו־Slow Context

‏לדוגמה:

```text
Fast Context = spread shock, quote churn, current breadth
Slow Context = session volatility state, sector trend
```

‏השילוב יכול להיות יעיל יותר ממנגנון אחד.

---

# ‏45. Context Hierarchy

‏אפשר לחשוב על:

```text
Market
→ Sector
→ Symbol
→ Execution
```

‏כל שכבה מוסיפה Context אחר.

---

# ‏46. Context Collision

‏לפעמים Market bullish אבל Symbol bearish.

‏אין כלל אוניברסלי איזה Context “מנצח”.

‏זו שאלת Research.

---

# ‏47. Feature × Regime Interaction

‏אפשר לבדוק Interaction:

```text
SignalStrength × VolatilityState
SignalStrength × Breadth
SignalStrength × LiquidityState
```

‏אם Interaction יציב, אותו Feature באמת מתנהג אחרת לפי Context.

---

# ‏48. Interaction אינו תירוץ ל־Overfitting

‏אם בודקים אלפי combinations, נמצא משהו.

‏צריך:

- ‏hypothesis מראש.
- ‏holdout.
- ‏OOS.
- ‏ablation.
- ‏economic effect size.

---

# ‏49. Context as Filter

‏אפשר להשתמש Context כדי:

```text
allow / block
```

‏זו החלטה חזקה.

‏דורשת Evidence חזק במיוחד.

---

# ‏50. Context as Penalty

‏חלופה רכה:

```text
AdjustedScore = Score - ContextPenalty
```

‏זה שומר ranking אך מוריד confidence.

---

# ‏51. Context as Threshold Modifier

‏לדוגמה:

```text
TradeThreshold = f(Regime)
```

‏ב־regime קשה אפשר לדרוש Edge גבוה יותר.

---

# ‏52. Context as Position-Sizing Input

‏Regime יכול להשפיע על size cap.

‏אבל size reduction אינו תחליף ל־NO TRADE אם economics שליליים.

---

# ‏53. Context as Execution Input

‏Execution tactic יכול להשתנות לפי:

- ‏spread.
- ‏depth.
- ‏volatility.
- ‏urgency.

‏אבל שינוי execution צריך להיבדק בנפרד משינוי signal.

---

# ‏54. Context as Exit Input

‏Exit policy יכולה להיות רגישה ל:

- ‏giveback rate.
- ‏market reversal.
- ‏liquidity deterioration.
- ‏volatility burst.

‏שוב: זה hypothesis, לא כלל אוטומטי.

---

# ‏55. Context as Veto Input

‏60A יכול לקבל Context signals.

‏לדוגמה:

```text
MarketStressTooHigh
LiquidityRegimeTooThin
RecentGivebackRegime
```

‏אבל Hard Veto דורש Evidence חזק.

---

# ‏56. Regime Overfitting

‏Regime Overfitting קורה כאשר:

```text
Strategy bad overall
but good in 7 tiny buckets found after the fact
```

‏זו לא הוכחה ל־Edge.

---

# ‏57. Bucket Explosion

‏אם יש:

```text
3 volatility states
× 3 liquidity states
× 4 session states
× 3 breadth states
```

‏כבר יש 108 combinations.

‏Sample size נשחק במהירות.

---

# ‏58. Prefer Continuous First

‏לעיתים עדיף להתחיל ב־continuous context features לפני bucketization.

‏למשל:

```text
spread_bps
realized_vol
breadth_pct
market_return
```

‏ואחר כך לבדוק אם regimes דיסקרטיים באמת מועילים.

---

# ‏59. Regime Definitions חייבות להיות Versioned

‏צריך:

```text
RegimeDefinitionVersion
```

‏כי שינוי threshold משנה את dataset ואת התוצאות.

---

# ‏60. Regime Model Version

‏אם classification נעשה במודל:

```text
RegimeModelVersion
```

‏חייב להיכנס לכל Trade/Decision record.

---

# ‏61. Feature Version + Regime Version

‏Trade record טוב כולל:

```text
FeatureSetVersion
RegimeVersion
StrategyVersion
ExecutionPolicyVersion
```

‏כך RCA אפשרי.

---

# ‏62. Regime Confidence

‏לא כל classification בטוח.

‏אפשר לשמור:

```text
RegimeConfidence
```

‏או probability vector.

---

# ‏63. Unknown Regime

‏`UNKNOWN` הוא state לגיטימי.

‏עדיף Unknown מפני confidence נמוך מאשר classification שקרי.

---

# ‏64. Novel State

‏לפעמים market state אינו דומה למה שראינו באימון.

‏אפשר למדוד distance / anomaly score.

‏זה לא אומר אוטומטית `NO TRADE`, אבל מעלה uncertainty.

---

# ‏65. Out-of-Distribution Context

‏אם Context מחוץ ל־training support:

- ‏prediction confidence צריך לרדת.
- ‏capital/size יכול להצטמצם.
- ‏Shadow may be preferable.

---

# ‏66. Regime Drift

‏גם frequency של regimes משתנה לאורך זמן.

‏לכן צריך לעקוב אחרי:

```text
RegimeDistributionOverTime
```

---

# ‏67. Regime Performance Drift

‏אפילו אם regime definitions יציבות, performance בתוך regime יכול להשתנות.

‏צריך:

```text
OutcomeByRegimeByVersion
```

---

# ‏68. Transition Frequency

‏אם state מתחלף מהר מדי, classification אולי noise.

‏Metric:

```text
RegimeTransitionsPerMinute
```

---

# ‏69. State Dwell Time

‏אפשר למדוד:

```text
RegimeDwellTime
```

‏כדי להבין stability.

---

# ‏70. Regime Half-Life

‏גם Context יכול להיות בעל half-life.

‏לדוגמה spread shock יכול להיעלם תוך שניות.

‏Session volatility state יכול להחזיק דקות.

---

# ‏71. Context TTL

‏לכל Context feature אפשר להגדיר TTL משלו.

‏אין TTL אחד לכולם.

---

# ‏72. Transition Penalty

‏בעת transition אפשר להעלות uncertainty buffer.

‏לא בהכרח לחסום Trade.

---

# ‏73. Market-Wide Breadth Change

‏לא רק breadth level חשוב.

‏גם:

```text
BreadthVelocity
BreadthAcceleration
```

‏יכולים להיות Context.

---

# ‏74. Correlation Shock

‏עלייה פתאומית ב־correlation cross-sectionally יכולה להעיד על factor domination.

‏זה משנה diversification ו־ranking interpretation.

---

# ‏75. Dispersion Shock

‏עלייה ב־dispersion יכולה לייצר יותר relative opportunities.

‏אך גם volatility גבוהה יותר.

---

# ‏76. Liquidity Withdrawal

‏אם depth נעלם ו־spread מתרחב:

‏אותו predicted move דורש יותר Edge כדי להיות executable.

---

# ‏77. Quote Churn

‏High quote churn יכול להיות Context של unstable book.

‏Displayed depth נהיה פחות אמין.

---

# ‏78. Trade/Quote Imbalance Context

‏Order flow signal עצמו יכול לקבל משמעות אחרת לפי market-wide imbalance.

---

# ‏79. Market Synchronization

‏אפשר למדוד כמה Symbols זזים יחד באותו זמן.

‏High synchronization עשוי להעיד על market-driven event.

---

# ‏80. Idiosyncratic Move Score

‏אפשר ליצור proxy:

```text
StockMove - MarketComponent - SectorComponent
```

‏ואז לבדוק אם residual momentum predictive יותר.

---

# ‏81. Context Feature Leakage דרך Normalization

‏אם normalization משתמש בכל היום או בעתיד, יש leakage.

‏כל rolling baseline חייב להיות As-Of current time בלבד.

---

# ‏82. Same-Day Adaptive Baselines

‏אפשר להשתמש ב־current-day history בלבד.

‏אבל צריך warmup ולהיזהר מקטן sample.

---

# ‏83. Historical Baseline

‏אפשר להשוות לימים קודמים.

‏אבל אז יש:

- ‏seasonality.
- ‏corporate changes.
- ‏regime drift.

---

# ‏84. Rolling Context Baseline

‏Rolling historical baselines יכולים להסתגל.

‏אבל window choice הוא parameter שדורש validation.

---

# ‏85. Robust Normalization

‏ב־fat-tailed data אפשר להעדיף:

- ‏median.
- ‏MAD.
- ‏rank percentile.

‏על פני mean/std בלבד.

---

# ‏86. Z-Score Context

‏Z-score שימושי רק אם distribution מספיק יציבה.

‏ב־heavy tails הוא יכול להטעות.

---

# ‏87. Percentile Context

‏לדוגמה:

```text
CurrentSpreadPercentile = 97%
```

‏יכול להיות יותר robust.

---

# ‏88. Relative-to-Symbol מול Cross-Sectional

‏אפשר לשאול:

```text
Is this unusual for this symbol?
Is this unusual versus all symbols now?
```

‏שתי שאלות שונות.

---

# ‏89. Regime Features ל־Scanner

‏Scanner יכול לשמור לכל Candidate:

```text
MarketContext
SectorContext
SymbolContext
ExecutionContext
```

‏בלי לחשב Deep Context לכל 4,000 symbols בכל event.

---

# ‏90. Fast/Deep Context Architecture

‏Fast Path:

- ‏market-wide metrics.
- ‏basic symbol freshness.
- ‏spread/activity.

‏Deep Path ל־Top-N:

- ‏richer peer context.
- ‏book dynamics.
- ‏execution context.
- ‏veto memory.

---

# ‏91. Shared Context Snapshot

‏Market-wide Context צריך להיות snapshot אחיד לכל Candidates באותו decision cycle.

‏אחרת ranking לא fair.

---

# ‏92. Cross-Sectional Timing Bias

‏אם Candidate A נמדד עם market context חדש ו־B עם context ישן, ranking יכול להתעוות.

---

# ‏93. Context Snapshot ID

‏לכן כדאי לשמור:

```text
ContextSnapshotId
```

‏בכל decision.

---

# ‏94. Context Fresh Coverage

‏כמו Scanner freshness, גם Context צריך coverage.

‏אם broad-market metrics מבוססים רק על 40% מה־universe, confidence צריך לרדת.

---

# ‏95. Breadth Coverage

‏Breadth בלי universe coverage metric עלול להיות שקרי.

---

# ‏96. Missing Context

‏Missing אינו zero.

‏צריך states:

```text
KNOWN
UNKNOWN
STALE
DEGRADED
```

---

# ‏97. Context Confidence Composition

‏אפשר לחשב confidence מ:

- ‏freshness.
- ‏coverage.
- ‏data quality.
- ‏model confidence.

‏אבל לא חייבים לדחוס הכול למספר אחד.

---

# ‏98. Explainable Context

‏Decision log צריך להסביר:

```text
MarketVol=High
Breadth=Positive
Liquidity=Normal
Sector=Weak
ContextConfidence=Medium
```

---

# ‏99. Reason Codes

‏אם Context משנה החלטה, צריך ReasonCode.

‏לדוגמה:

```text
CONTEXT_HIGH_SPREAD_STRESS
CONTEXT_LOW_BREADTH_SUPPORT
CONTEXT_TRANSITION_UNCERTAIN
```

---

# ‏100. Context Decision Attribution

‏אחרי Trade צריך לדעת:

> ‏האם Context שינה את ה־decision?

‏Metric:

```text
ContextDecisionImpactRate
```

---

# ‏101. Counterfactual Without Context

‏ב־Replay אפשר להשוות:

```text
DecisionWithContext
DecisionWithoutContext
```

‏זה מראה את הערך האינקרמנטלי.

---

# ‏102. `Incremental Context Value`

‏Context מוצדק רק אם הוא מוסיף מעבר ל־Features קיימים.

---

# ‏103. Ablation by Context Family

‏כדאי להסיר בתורו:

- ‏volatility context.
- ‏liquidity context.
- ‏breadth context.
- ‏sector context.

‏ולמדוד מה באמת מוסיף ערך.

---

# ‏104. Context Redundancy

‏Volatility, spread ו־trade rate יכולים להיות correlated.

‏שלושה Rules דומים אינם בהכרח שלושה Evidence עצמאיים.

---

# ‏105. Double Counting

‏אם אותו Context נכנס גם ל־Score וגם ל־Veto וגם ל־size, ייתכן double/triple counting.

---

# ‏106. Separate Roles

‏צריך להגדיר לכל Context:

```text
Predictive
Feasibility
Risk
Execution
Monitoring
```

‏ולא להשתמש בו בכל מקום בלי הצדקה.

---

# ‏107. Predictive Context

‏Predictive Context משנה Expected Return/Probability.

---

# ‏108. Feasibility Context

‏Feasibility Context משנה יכולת כניסה/יציאה.

---

# ‏109. Risk Context

‏Risk Context משנה uncertainty או exposure limits.

---

# ‏110. Execution Context

‏Execution Context משנה tactic, urgency או bounds.

---

# ‏111. Monitoring Context

‏Monitoring Context לא חייב לשנות Trade.

‏הוא יכול רק לייצר observability.

---

# ‏112. Start in Shadow

‏Context חדש עדיף להתחיל ב־Shadow:

```text
observe
log
compare
validate
```

‏לפני שהוא חוסם Trades.

---

# ‏113. Context as Challenger

‏אפשר להריץ:

```text
Champion = current decision
Challenger = context-aware decision
```

‏ולהשוות counterfactually.

---

# ‏114. Promotion Criteria

‏Context rule לא מתקדם רק כי PnL השתפר.

‏צריך לבדוק:

- ‏OOS stability.
- ‏decision impact.
- ‏sample size.
- ‏cost-adjusted value.
- ‏regime coverage.
- ‏robustness.

---

# ‏115. Rejection Criteria

‏Rule נדחה אם:

- ‏effect קטן.
- ‏fragile threshold.
- ‏רק In-Sample.
- ‏sample זעיר.
- ‏execution wipes benefit.

---

# ‏116. Regime-Specific Backtest

‏תוצאות צריכות להיות חתוכות לפי Context.

‏אבל בלי לבחור buckets אחרי שראינו PnL.

---

# ‏117. Regime Distribution Shift

‏אם Backtest מכיל הרבה regime שכמעט לא מופיע Live, aggregate metric מטעה.

---

# ‏118. Reweighting Awareness

‏לפעמים רוצים לדעת:

> ‏איך Strategy הייתה מתנהגת תחת distribution של regimes מהתקופה האחרונה?

‏אבל reweighting הוא כלי מחקר, לא אמת.

---

# ‏119. Effective Sample by Regime

‏צריך למדוד Sample Size אפקטיבי לכל regime.

‏לא רק מספר Trades.

---

# ‏120. Clustered Episodes

‏100 Trades בזמן market burst אחד אינם 100 observations עצמאיות.

---

# ‏121. Episode-Level Analysis

‏לכן כדאי גם לנתח ברמת Episodes.

---

# ‏122. Regime × Execution Costs

‏Costs עצמם משתנים לפי regime.

‏לכן אין להשתמש ב־cost constant אחד לכל המצבים.

---

# ‏123. Regime × Fill Probability

‏Fill probability יכולה להשתנות מאוד בין liquidity states.

---

# ‏124. Regime × Adverse Selection

‏Passive fill ב־fast market עשוי להיות יותר toxic.

---

# ‏125. Regime × Exit Feasibility

‏Entry אולי אפשרי, Exit פחות.

‏Context צריך להתחשב בשניהם.

---

# ‏126. Regime × Signal Half-Life

‏אותו signal יכול לדעוך מהר יותר ב־regime אחד.

---

# ‏127. Regime × Latency Budget

‏אם half-life מתקצר, אותה latency צורכת יותר Edge.

---

# ‏128. `LatencyPressureByRegime`

‏אפשר למדוד:

```text
LatencyPressure = EndToEndLatency / SignalHalfLife
```

‏לפי regime.

---

# ‏129. Regime × Capacity

‏Capacity משתנה עם liquidity/volatility.

---

# ‏130. Regime × Position Size

‏Size policy יכולה להיות context-aware.

‏אבל חייבת להישאר פשוטה ואמפירית.

---

# ‏131. Regime × Risk Limits

‏Risk limit יכול להצטמצם ב־stress.

‏אבל לא להתרחב רק בגלל excitement.

---

# ‏132. Regime × Kill Switch

‏Kill switch אינו Regime strategy.

‏הוא Safety control.

‏אבל Context יכול להפעיל Safety state אם תנאים מוגדרים מראש מתקיימים.

---

# ‏133. Strategy Regime Dependence

‏אסטרטגיה יכולה להיות:

```text
Regime-Agnostic
Regime-Sensitive
Regime-Specific
```

‏כל רמה מוסיפה complexity.

---

# ‏134. Prefer Regime-Aware over Regime-Fragile

‏המטרה אינה לבנות 12 strategies שונות מיד.

‏עדיף קודם Strategy אחת שמודעת ל־Context.

---

# ‏135. Regime Switcher Risk

‏מערכת שמחליפה strategy לחלוטין בכל state יכולה להיות brittle.

---

# ‏136. Smooth Adaptation

‏אפשר לעיתים לשנות:

- ‏threshold.
- ‏confidence.
- ‏size cap.

‏בצורה רציפה יותר.

---

# ‏137. Regime Classification Delay

‏Regime ברור רק אחרי שהתחיל.

‏לכן classification תמיד מאחר במידה מסוימת.

---

# ‏138. Detection Delay Cost

‏צריך למדוד:

```text
RegimeDetectionDelay
```

‏ואת ההשפעה הכלכלית שלו.

---

# ‏139. False Transition

‏מערכת יכולה לזהות מעבר שלא באמת נמשך.

‏צריך למדוד false transitions.

---

# ‏140. Transition Precision/Recall

‏אם transitions חשובים, אפשר להעריך:

- ‏precision.
- ‏recall.
- ‏delay.

‏אבל לפי Economic Impact.

---

# ‏141. Regime Model אינו חייב להיות ML

‏אפשר להתחיל ב־transparent rules.

‏ML מוצדק רק אם מוסיף Decision Value.

---

# ‏142. Simple Regime Baseline

‏Baseline יכול לכלול:

```text
market realized vol
median spread
breadth
cross-sectional dispersion
session phase
```

‏ולהישאר interpretable.

---

# ‏143. Regime Clustering

‏Unsupervised clustering אפשרי.

‏אבל cluster מספר 3 אינו automatically meaningful.

---

# ‏144. Hidden Markov Models

‏HMMs הם כלי אפשרי למצבי latent state.

‏אבל הם advanced, assumption-heavy ולא baseline אצלנו.

---

# ‏145. Change-Point Detection

‏Change-point methods יכולים לזהות שינוי distribution.

‏שימושי למחקר, אך צריך לבדוק latency ו־false alarms.

---

# ‏146. Online Change Detection

‏ב־Live צריך causal online version.

‏לא algorithm שמסתכל על כל הסדרה בדיעבד.

---

# ‏147. Regime Forecasting

‏לנבא את ה־regime הבא קשה יותר מלזהות current context.

‏לא צריך לערבב את שתי הבעיות.

---

# ‏148. Regime Identification vs Prediction

```text
Identification = what state are we in now?
Prediction = what state comes next?
```

‏אלו tasks שונים.

---

# ‏149. Context Calibration

‏אם מודל מוציא probability ל־stress, צריך לבדוק calibration.

---

# ‏150. Context Thresholds

‏Threshold צריך לנבוע מ־Decision economics, לא ממספר עגול יפה.

---

# ‏151. Context and `NO TRADE`

‏Context יכול להעלות RequiredEdge.

‏לדוגמה רעיונית:

```text
RequiredEdge = Costs + UncertaintyBuffer + RegimeRiskPremium
```

---

# ‏152. `RegimeRiskPremium`

‏זה אינו מחיר שוק רשמי.

‏זו abstraction למחקר: כמה יותר Edge נדרש ב־state קשה.

---

# ‏153. Keep Fact / Judgment / Hypothesis Separate

‏לדוגמה:

```text
Fact: spread widened
Judgment: execution risk is higher
Hypothesis: our momentum signal performs worse here
```

‏אלו שלוש טענות שונות.

---

# ‏154. Context Logging

‏לכל decision חשוב לשמור Context snapshot.

---

# ‏155. Context Replay

‏Replay צריך לשחזר Context בדיוק מאותו מידע שהיה זמין אז.

---

# ‏156. Context Golden Scenarios

‏כדאי לבנות scenarios כמו:

- ‏quiet → burst.
- ‏normal → stress.
- ‏wide-spread recovery.
- ‏breadth reversal.

‏ולבדוק behavior דטרמיניסטי.

---

# ‏157. Context Tests

‏Property examples:

```text
stale context cannot become fresh without new data
unknown context cannot silently become normal
future data cannot alter past decision
```

---

# ‏158. Context Incident RCA

‏ב־incident צריך לשאול:

- ‏מה ה־Context היה?
- ‏מה המערכת חשבה שהוא?
- ‏מתי השתנה?
- ‏מה היה stale?
- ‏איזה rule הושפע?

---

# ‏159. First Divergence

‏כמו בשאר המערכת:

> ‏חפש את הנקודה הראשונה שבה Context expected ו־observed נפרדו.

---

# ‏160. Practitioner Secret — Regime Labels נשמעים חכמים מדי בקלות

‏המילים:

```text
risk-on
risk-off
trend day
chop day
```

‏יכולות להיות שימושיות לשיחה.

‏אבל הן מסוכנות אם אין להן הגדרה מדידה בזמן אמת.

---

# ‏161. Practitioner Secret — Context טוב לעיתים משפר NO TRADE יותר מאשר Selection

‏לעיתים הערך הגדול אינו לבחור Rank #1 טוב יותר.

‏אלא לזהות מתי **אף** Candidate אינו מספיק טוב.

---

# ‏162. Practitioner Secret — Regime יכול להשפיע על Costs יותר מאשר על Prediction

‏Signal predictive יכול להישאר דומה.

‏אבל spread/slippage/fills משתנים.

‏ואז Net Edge משתנה דרמטית.

---

# ‏163. Practitioner Secret — מעבר Regime מסוכן יותר מה־Regime עצמו

‏מערכות רבות מכוילות ל־steady state.

‏Transitions הם המקום שבו assumptions נשברים.

---

# ‏164. Practitioner Secret — market-wide context יכול לזהם Cross-Sectional Ranking

‏אם כל השוק זז יחד, Rank differences קטנים יכולים להיות noise.

---

# ‏165. Practitioner Secret — Context אינו License להוסיף חוקים בלי סוף

‏כל Context rule צריך להוכיח Incremental Decision Value.

---

# ‏166. Practitioner Secret — `UNKNOWN` הוא Feature מקצועי

‏מערכת שלא יודעת אם Context תקין צריכה לומר זאת.

‏לא להמציא confidence.

---

# ‏167. Baseline מוצע למחקר שלנו

‏לא כ־Recommendation סופית, אלא כ־Research Baseline:

```text
Market Context:
- broad market return over several short horizons
- breadth
- cross-sectional dispersion
- median spread / liquidity proxy
- market realized volatility
- session phase

Symbol Context:
- relative return vs market/sector
- relative activity
- spread/depth state
- signal persistence

Execution Context:
- current spread
- depth/fill feasibility
- latency pressure
- recent markout quality
```

---

# ‏168. מה לא הייתי עושה בגרסה הראשונה

‏לא להתחיל עם:

- ‏עשרות regime labels.
- ‏HMM מורכב.
- ‏cluster switching אגרסיבי.
- ‏strategy שונה לכל bucket.
- ‏Hard Veto מכל Context.

‏קודם מודדים.

---

# ‏169. סדר מחקר מומלץ

```text
1. Log Context
2. Analyze Outcome by Context
3. Test Interaction
4. Measure Incremental Value
5. Shadow context-aware decisions
6. Promote only robust effects
```

---

# ‏170. Definition of Done לפרק

‏אחרי הפרק צריך לדעת להסביר:

- ‏מהו Regime ומהו Context.
- ‏למה Point-in-Time classification קריטי.
- ‏איך volatility/liquidity/breadth/correlation/session משנים Signal economics.
- ‏איך להימנע מ־Regime Leakage ו־bucket explosion.
- ‏איך לעבוד עם uncertainty ו־transitions.
- ‏איך לשלב Context ב־Score/Veto/Execution/Risk בלי double counting.
- ‏איך למדוד Incremental Context Value.
- ‏איך לחבר Context ל־Short-Horizon Momentum שלנו.

---

# ‏משפט מסכם

> ‏**Context טוב אינו מסביר בדיעבד למה Trade עבד. הוא מידע שהיה זמין בזמן אמת, שינה באופן מדיד את איכות ההחלטה, ושמר על הערך שלו גם מחוץ למדגם ותחת execution אמיתי.**
