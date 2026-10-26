# ‏שלב 47 — `Price Impact` ו־`Capacity`: מתי אנחנו מתחילים להזיז את השוק בעצמנו

> ‏מטרת הפרק: להבין כיצד גודל הפקודה שלנו משפיע על המחיר שבו נצליח להתבצע, איך מפרידים בין `Spread`, ‏`Slippage`, ‏`Market Impact` ו־`Adverse Selection`, כיצד בונים `Capacity Curve`, ולמה Strategy שנראית מצוין בגודל קטן יכולה להפסיק להיות רווחית כאשר מגדילים Capital או Position Size.
>
> ‏העיקרון המרכזי: **Capacity אינה כמה כסף יש לנו. Capacity היא כמה Risk/Notional אפשר להעביר דרך השוק לפני שה־execution עצמו מוחק את ה־Edge.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. למה `Price Impact` חשוב במיוחד לרובוט קצר־טווח

‏אם ה־Edge הצפוי שלנו קטן ונמשך שניות, גם שינוי זעיר במחיר הביצוע יכול להיות משמעותי.

‏במערכת קצרה מאוד:

```text
Small edge
+ spread
+ slippage
+ impact
+ latency
= edge can disappear quickly
```

‏לכן Position Size הוא לא רק החלטת Risk.

‏הוא גם החלטת Execution.

---

# ‏2. ארבעה מושגים שחייבים להפריד

‏כאשר מחיר הביצוע גרוע מהמחיר שראינו בזמן ההחלטה, לא נכון לקרוא לכל ההפרש `Slippage`.

‏צריך להפריד לפחות בין:

- ‏`Spread Cost`.
- ‏`Market Movement` בזמן latency.
- ‏`Market Impact` שנגרם מהפקודה שלנו.
- ‏`Adverse Selection`.

‏בלי ההפרדה הזו קשה מאוד להבין למה הביצוע יקר.

---

# ‏3. `Spread Cost`

‏אם אנחנו קונים בצורה אגרסיבית ב־Ask ומוכרים אחר כך ב־Bid, חלק מהעלות נובע פשוט מה־spread.

‏זו עלות שהייתה קיימת גם אם הגודל שלנו היה זעיר.

---

# ‏4. `Slippage`

‏`Slippage` הוא מונח רחב המתאר פער בין benchmark מסוים לבין מחיר הביצוע בפועל.

‏למשל:

```text
Decision Ask = 20.00
Average Fill = 20.03
Slippage = +0.03
```

‏אבל הפער הזה לא מספר לנו לבדו למה נוצר.

---

# ‏5. `Market Impact`

‏`Market Impact` הוא החלק בשינוי המחיר שנגרם, לפחות חלקית, מהאינטראקציה של הפקודה שלנו עם השוק.

‏לדוגמה:

‏אם Ask מוצג כך:

```text
20.00 x 200
20.01 x 300
20.02 x 600
```

‏ואנחנו רוצים לקנות 800 מניות מיד, אנחנו עשויים לצרוך יותר מרמת מחיר אחת.

‏המחיר הממוצע שלנו יעלה ככל שניקח liquidity עמוק יותר.

---

# ‏6. `Adverse Selection`

‏בשלב 46 למדנו שמחיר יכול לזוז נגדנו אחרי Fill משום שמישהו בצד השני היה מהיר או מעודכן יותר.

‏זה שונה מ־Impact.

‏`Impact` שואל:

```text
How much did our own execution move the market?
```

‏`Adverse Selection` שואל:

```text
Why did the market move against us after we got filled?
```

---

# ‏7. הבעיה: במציאות הם מתערבבים

‏ב־Production לא תמיד ניתן לזהות באופן מושלם איזה חלק מהתנועה נגרם מאיתנו ואיזה חלק היה קורה ממילא.

‏לכן עובדים עם attribution הסתברותי ולא עם certainty מזויפת.

---

# ‏8. `Temporary Impact`

‏`Temporary Impact` הוא חלק מהשינוי במחיר שנוטה להיעלם לאחר שהלחץ הזמני של הביצוע מסתיים.

‏לדוגמה:

‏פקודת Buy גדולה צורכת את ה־Ask ומעלה את המחיר.

‏אחרי כמה שניות liquidity חדשה חוזרת והמחיר נסוג חלקית.

---

# ‏9. `Persistent Impact`

‏`Persistent Impact` הוא שינוי שנשאר גם לאחר שהביצוע הסתיים.

‏זה יכול לקרות אם הביצוע שלנו חשף מידע, הצטרף ל־flow חזק, או פשוט התרחש בזמן שבו השוק באמת עבר לרמת מחיר חדשה.

---

# ‏10. למה ההבחנה אינה פשוטה

‏איננו יכולים לראות עולם חלופי שבו שלחנו בדיוק אותה Strategy אבל בלי הפקודה שלנו.

‏כלומר אין לנו counterfactual מושלם.

‏לכן מודדים Impact בעזרת proxies, comparisons ו־controlled experiments.

---

# ‏11. `Participation Rate`

‏אחד המדדים החשובים הוא היחס בין הכמות שלנו לבין volume השוק בזמן הביצוע.

```text
ParticipationRate = OurExecutedVolume / MarketVolumeDuringWindow
```

‏ככל שהיחס גבוה יותר, עולה הסיכוי שהביצוע שלנו משפיע על השוק.

---

# ‏12. Participation הוא contextual

‏10% participation במניה עמוקה ויציבה אינו בהכרח דומה ל־10% participation במניה דקה עם book לא יציב.

‏צריך להוסיף context של:

- ‏Spread.
- ‏Depth.
- ‏Volatility.
- ‏Trade rate.
- ‏Book churn.
- ‏Regime.
- ‏Time of day.

---

# ‏13. `Depth Consumption`

‏בפקודה אגרסיבית נרצה למדוד כמה מה־displayed depth צרכנו.

```text
DepthConsumption = ExecutedQty / VisibleDepthAtRelevantPrices
```

‏אבל זה estimate בלבד.

‏Hidden liquidity, routing ו־book changes יכולים לשנות את התוצאה.

---

# ‏14. `Sweep Depth`

‏אפשר למדוד כמה price levels חצינו כדי להשלים את הכמות.

```text
LevelsConsumed = 1, 2, 3, ...
```

‏ככל שהמספר עולה, לרוב עולה גם execution risk.

---

# ‏15. `VWAP of Fill`

‏כאשר יש כמה fills, מחיר הביצוע הרלוונטי אינו fill בודד אלא volume-weighted average.

```text
FillVWAP = Sum(price_i * qty_i) / Sum(qty_i)
```

---

# ‏16. `Implementation Shortfall`

‏נרצה להשוות את ה־execution ל־benchmark בזמן ההחלטה.

‏לדוגמה:

```text
Decision Price
→ Order Send
→ Fills
→ Final Position
```

‏הפער הכולל בין intent לבין reality הוא חשוב יותר מהשאלה “באיזה מחיר היה ה־last fill”.

---

# ‏17. `Decision Price` חייב להיות מוגדר

‏אפשר לבחור benchmark כגון:

- ‏Mid.
- ‏Side-aware Bid/Ask.
- ‏Microprice.
- ‏Arrival price.
- ‏Executable quote.

‏אסור להחליף benchmark לפי מה שנראה טוב אחרי האירוע.

---

# ‏18. `Impact Curve`

‏נרצה למדוד כיצד execution cost משתנה כפונקציה של size.

```text
Size ↑
Impact ↑
Net Edge ↓
```

‏הקשר אינו חייב להיות לינארי.

---

# ‏19. למה Impact לעיתים לא לינארי

‏Book depth מגיע במדרגות.

‏לכן מעבר מ־100 ל־200 מניות יכול להיות כמעט חינם, בעוד מעבר מ־200 ל־300 חוצה level נוסף ויוצר קפיצה משמעותית בעלות.

---

# ‏20. `Capacity Curve`

‏`Capacity Curve` מתארת כיצד performance כלכלי משתנה כאשר size עולה.

‏לדוגמה:

```text
$500 position  -> +8 bps expected net edge
$1,000         -> +7 bps
$2,000         -> +4 bps
$4,000         -> +1 bps
$6,000         -> -2 bps
```

‏המספרים בדוגמה אינם תחזית.

‏הם רק מדגימים את הרעיון.

---

# ‏21. Capacity אינה נקודה קסומה

‏אין בדרך כלל “capacity = 4,372 דולר”.

‏עדיף לחשוב על אזורים:

```text
Comfortable
Degrading
Marginal
Unprofitable
Unsafe / Uncertain
```

---

# ‏22. `Marginal Edge`

‏השאלה החשובה אינה רק כמה הרווח הכולל עולה עם size.

‏צריך לשאול מה ה־edge של היחידה הנוספת.

```text
MarginalEdge(size) = NetPnL(size + Δ) - NetPnL(size)
```

‏כאשר marginal edge מתקרב לאפס, capacity מתקרבת לגבול הכלכלי שלה.

---

# ‏23. `Average Edge` יכול להטעות

‏ייתכן שה־position כולו עדיין רווחי בממוצע, אבל החלק האחרון של size כבר מפסיד כסף.

‏זו סיבה חשובה לא להשתמש רק ב־average fill.

---

# ‏24. `Capacity` לפי Symbol

‏אין Capacity אחת לכל Strategy.

‏לכל Symbol יכולים להיות:

- ‏Depth שונה.
- ‏Spread שונה.
- ‏Volume שונה.
- ‏Volatility שונה.
- ‏Book resilience שונה.
- ‏Flow toxicity שונה.

---

# ‏25. `Capacity` לפי Time of Day

‏אותו Symbol יכול להיות עמוק מאוד בשעה אחת ודק מאוד בשעה אחרת.

‏לכן Capacity צריכה להיות time-aware.

---

# ‏26. `Capacity` לפי Regime

‏ב־fast market, depth שמוצג עכשיו יכול להיעלם לפני שהפקודה מגיעה.

‏לכן historical average depth אינו מספיק.

---

# ‏27. `Displayed Depth` אינו כל ה־Liquidity

‏כפי שלמדנו בשלב 40:

```text
Displayed Liquidity != Total Executable Liquidity
```

‏אבל גם ההפך נכון:

‏אי אפשר להניח hidden liquidity כדי להצדיק size גדול.

---

# ‏28. `Book Resilience`

‏Resilience מתארת כמה מהר הספר נבנה מחדש לאחר consuming liquidity.

‏שני symbols יכולים להציג אותו depth כרגע, אבל להתנהג שונה לגמרי אחרי sweep.

---

# ‏29. `Refill Rate`

‏נוכל למדוד כמה מהר depth חוזר אחרי depletion.

‏זה יכול להיות feature חשוב ל־capacity.

---

# ‏30. `Liquidity Half-Life`

‏אפשר למדוד כמה מהר displayed depth משתנה או נעלם.

‏אם liquidity half-life קצרה מה־execution latency שלנו, depth snapshot הופך פחות אמין.

---

# ‏31. `Latency-to-Liquidity-Half-Life`

‏יחס שימושי:

```text
ExecutionLatency / LiquidityHalfLife
```

‏ככל שהיחס גבוה יותר, כך capacity estimate המבוסס על snapshot פחות אמין.

---

# ‏32. `Aggressive Capacity`

‏Capacity של Marketable execution תלויה בכמות liquidity שאפשר לקחת במחיר סביר לפני שה־edge נעלם.

---

# ‏33. `Passive Capacity`

‏Capacity של Passive execution תלויה בדברים אחרים:

- ‏Queue size.
- ‏Fill probability.
- ‏Signal TTL.
- ‏Adverse selection.
- ‏Opportunity cost.

‏אפשר להציב order גדול בלי להזיז מייד את המחיר, אבל לא בהכרח לקבל אותו בזמן.

---

# ‏34. גדול יותר יכול להקטין Fill Quality

‏Order גדול יותר עשוי:

- ‏להמתין יותר זמן.
- ‏לקבל יותר partial fills.
- ‏להישאר אחרי שה־signal מת.
- ‏לחשוף interest.
- ‏להגדיל adverse selection.

---

# ‏35. `Footprint`

‏`Footprint` הוא האופן שבו הפעילות שלנו נעשית נראית או מורגשת בשוק.

‏אין צורך להיות מוסדי ענק כדי ליצור footprint במניה דקה.

---

# ‏36. Relative Size חשוב יותר מ־Absolute Size

‏100 מניות יכולות להיות זניחות ב־Symbol אחד ומשמעותיות מאוד באחר.

‏לכן size צריך להימדד יחסית ל־liquidity.

---

# ‏37. מדדי Relative Size

‏אפשר להשתמש בין היתר ב־:

```text
OrderQty / TopOfBookDepth
OrderQty / NLevelDepth
OrderQty / RecentVolume
OrderNotional / RecentDollarVolume
ExpectedExecutionVolume / MarketVolumeWindow
```

---

# ‏38. `Recent Volume` חייב להתאים ל־Horizon

‏אסטרטגיה של שניות אינה צריכה להסתפק ב־daily volume.

‏מניה עם ADV גבוה יכולה להיות כמעט שקטה כרגע.

---

# ‏39. `Dollar Volume`

‏Dollar volume לעיתים מועיל יותר מ־share volume כאשר משווים symbols במחירים שונים.

---

# ‏40. `Turnover` קצר־טווח

‏אפשר למדוד notional שעבר ב־1s, ‏5s, ‏10s, ‏30s, ‏60s.

‏זה קרוב יותר לבעיה שלנו מאשר average daily volume בלבד.

---

# ‏41. `Expected Time to Fill` כחלק מ־Capacity

‏Size גדול יותר יכול להיות אפשרי תיאורטית אך לא בתוך signal horizon.

‏לכן:

```text
ExecutableCapacity != EventuallyFillableCapacity
```

---

# ‏42. `Time Budget`

‏אם ה־signal חי 15 שניות, order שדורש 40 שניות להשלמה אינו capacity אמיתית עבור האסטרטגיה הזאת.

---

# ‏43. `Edge Budget`

‏נוכל לחשוב כך:

```text
PredictedGrossEdge
- Spread
- Fees
- Slippage
- ExpectedImpact
- ExpectedAdverseSelection
- OpportunityCost
= ExpectedNetEdge
```

---

# ‏44. `Impact Budget`

‏אפשר להקצות רק חלק מה־edge המוערך ל־impact.

‏לדוגמה קונספטואלית:

```text
MaxAcceptableImpact <= fraction_of_expected_edge
```

‏הפרמטר צריך להיבדק אמפירית ולא להיקבע שרירותית.

---

# ‏45. למה Profit Target קטן רגיש מאוד ל־Impact

‏ככל שה־target קצר וקטן יותר, כל basis point של execution cost מהווה חלק גדול יותר מה־edge.

---

# ‏46. `Break-Even Size`

‏נרצה למצוא את size שבו:

```text
ExpectedNetEdge(size) = 0
```

‏זו נקודת break-even כלכלית, לא בהכרח גבול Risk.

---

# ‏47. `Safety Margin`

‏Production size לא חייב לשבת בדיוק על break-even capacity.

‏נרצה מרווח שמכסה uncertainty, tails ו־model error.

---

# ‏48. `Capacity Under Uncertainty`

‏Capacity estimate עצמה היא מודל.

‏לכן אפשר לייצג:

```text
ExpectedCapacity
ConservativeCapacity
StressCapacity
```

---

# ‏49. `Stress Capacity`

‏נבדוק מה קורה אם:

- ‏Spread מוכפל.
- ‏Depth נחתך.
- ‏Latency עולה.
- ‏Fill probability יורדת.
- ‏Volatility עולה.
- ‏Market impact גרוע יותר מהחציון.

---

# ‏50. Tails חשובים יותר מהממוצע

‏Capacity שמבוססת על average slippage בלבד עלולה להיראות בטוחה מדי.

‏צריך לבדוק P90/P95/P99 או quantiles אחרים של execution cost.

---

# ‏51. `Impact Distribution`

‏לכל size נרצה distribution ולא מספר יחיד.

```text
Median impact
P90 impact
P95 impact
Worst observed / stress estimate
```

---

# ‏52. `Market Impact` יכול להיות Signed

‏ב־Buy אגרסיבי impact לרוב נמדד כלפי מעלה.

‏ב־Sell אגרסיבי כלפי מטה.

‏אבל attribution צריך להיות side-aware כדי לא לערבב סימנים.

---

# ‏53. `Normalized Impact`

‏אפשר למדוד impact ב־:

- ‏Dollars per share.
- ‏BPS.
- ‏Ticks.
- ‏Spread units.
- ‏Volatility units.

‏השוואה cross-sectional לרוב דורשת normalization.

---

# ‏54. `Impact in Spread Units`

‏מדד שימושי:

```text
ImpactSpreadUnits = Impact / Spread
```

‏כך ניתן להבין האם שילמנו רבע spread נוסף, spread שלם נוסף, וכן הלאה.

---

# ‏55. `Impact in Volatility Units`

‏אפשר לנרמל לפי short-horizon volatility.

‏זה עוזר להשוות בין symbols עם תנודתיות שונה.

---

# ‏56. `Impact per Notional`

‏נרצה למדוד כמה impact מתקבל ביחס ל־notional.

‏אבל אסור להניח יחס לינארי.

---

# ‏57. Concavity / Convexity

‏לעיתים העלות המ שולית עולה ככל שה־size גדל.

‏לכן המודל צריך לאפשר curvature.

---

# ‏58. מודלים פשוטים עדיפים בתחילת הדרך

‏לא חייבים להתחיל ממודל microstructure מתמטי מורכב.

‏Baseline טוב יכול להיות empirical buckets לפי relative size.

---

# ‏59. `Size Buckets`

‏למשל:

```text
0-5% of visible depth
5-10%
10-25%
25-50%
50%+
```

‏הגבולות בדוגמה הם לצורך המחשה בלבד.

---

# ‏60. Bucket לפי Recent Volume

‏אפשר ליצור buckets לפי participation בחלון קצר.

‏כך נקבל impact curves אמפיריות.

---

# ‏61. `Matched Sample`

‏כדי למדוד impact של size, נשווה executions בתנאי שוק דומים ככל האפשר.

‏אחרת size גדול עלול להופיע דווקא ב־high volatility וליצור confounding.

---

# ‏62. Confounding

‏אם אנחנו שולחים פקודות גדולות רק כאשר signal חזק במיוחד, אז:

```text
Large size
correlates with
Strong signal
```

‏ואז קשה להפריד impact מהמשך המהלך הטבעי.

---

# ‏63. Randomization מוגבלת

‏ב־research אפשר לעיתים לבצע shadow/randomized sizing experiments בסביבה מבוקרת.

‏ב־Live עם כסף אמיתי צריך להיות שמרניים מאוד.

---

# ‏64. `Shadow Capacity`

‏אפשר לחשב מה היה קורה אילו size היה גדול יותר, בלי לשלוח אותו בפועל.

‏אבל זה counterfactual חלש כי השוק לא ראה את הפקודה הגדולה.

---

# ‏65. Shadow Capacity אינה הוכחה

‏היא טובה ל־screening ולמחקר מוקדם.

‏היא לא מחליפה small controlled live calibration.

---

# ‏66. `Paper Capacity` גם מוגבלת

‏Paper broker לא בהכרח מדמה impact אמיתי.

‏לכן paper fill של 5,000 מניות אינו evidence שהשוק החי היה נותן אותו execution.

---

# ‏67. `Live Canary Sizing`

‏הדרך הבטוחה יותר ללמוד capacity היא לעלות size בהדרגה ולמדוד execution quality בכל שלב.

---

# ‏68. Capital Ramp

‏לדוגמה רעיונית:

```text
Size A
→ validate
→ Size B
→ validate
→ Size C
```

‏לא קופצים מגודל זעיר לגודל גדול רק כי backtest נראה טוב.

---

# ‏69. Promotion Gate ל־Size

‏הגדלת size היא שינוי Strategy/Execution שצריך promotion criteria.

---

# ‏70. Metrics לפני הגדלה

‏נרצה לבדוק לפחות:

- ‏Net edge retained.
- ‏Slippage distribution.
- ‏Impact estimate.
- ‏Fill rate.
- ‏Time to fill.
- ‏Partial fill rate.
- ‏Post-fill markout.
- ‏Risk utilization.

---

# ‏71. `Net Edge Retained`

‏מדד חשוב:

```text
NetEdgeRetained = RealizedExecutableEdge / PredictedGrossEdge
```

‏כאשר size גדל, נצפה לעיתים שהיחס יורד.

---

# ‏72. `Execution Tax`

‏אפשר לקרוא ל־:

```text
GrossEdge - NetExecutableEdge
```

‏כ־execution tax.

‏Capacity היא בין היתר השאלה כמה tax אנחנו מסוגלים לספוג.

---

# ‏73. `Impact Elasticity`

‏אפשר למדוד כמה impact משתנה כאשר size משתנה.

```text
ΔImpact / ΔSize
```

‏אם elasticity מחמירה במהירות, capacity נמוכה יותר.

---

# ‏74. `Capacity by Rank`

‏ייתכן של־Rank #1 יש edge גבוה אך liquidity נמוכה.

‏Rank #2 יכול להיות מעט פחות predictive אבל הרבה יותר executable.

---

# ‏75. Prediction Rank אינו Capacity Rank

‏זו הרחבה חשובה:

```text
Best predicted candidate
!=
Best scalable candidate
```

---

# ‏76. `Executable Candidate Score`

‏אפשר לשלב research-wise:

```text
ExpectedNetEdge(size)
FillProbability(size)
ImpactRisk(size)
SignalTTL
```

‏לא חייבים להכניס הכול ל־Score אחד; אפשר להשתמש ב־execution gate נפרד.

---

# ‏77. `NO TRADE` בגלל Capacity

‏אם candidate מעולה אך הכמות המינימלית הכלכלית שלנו כבר גדולה מדי ביחס ל־liquidity, `NO TRADE` הוא תוצאה תקינה.

---

# ‏78. `Minimum Economic Size`

‏יש גם צד הפוך.

‏בגלל minimum commissions או fixed costs, size קטן מדי עלול להיות לא כלכלי.

---

# ‏79. Capacity היא Interval

‏לכן לפעמים יש:

```text
MinimumEconomicSize <= Size <= MaximumExecutableSize
```

‏אם אין חפיפה, העסקה אינה כלכלית.

---

# ‏80. `Size Feasibility Contract`

‏לפני Entry אפשר לדרוש:

```text
SizeFeasible =
  expected_net_edge > threshold
  AND impact_estimate <= budget
  AND time_to_fill <= ttl
  AND risk_ok
  AND liquidity_confidence_ok
```

---

# ‏81. `Size` צריך להיות Output, לא Input קשיח

‏במערכת מתקדמת, Position Size יכול להיות תוצאה של:

- ‏Risk limit.
- ‏Liquidity limit.
- ‏Impact limit.
- ‏Signal confidence.
- ‏Execution TTL.

---

# ‏82. נוסחת `min()` שימושית

‏קונספטואלית:

```text
FinalSize = min(
    RiskSize,
    LiquiditySize,
    ImpactSize,
    ExposureSize,
    CapitalSize)
```

---

# ‏83. `LiquiditySize`

‏זה הגודל שניתן לבצע תחת liquidity constraints.

---

# ‏84. `ImpactSize`

‏זה הגודל שבו expected impact עדיין מתחת לתקציב שהוגדר.

---

# ‏85. `RiskSize`

‏זה הגודל שמותר מבחינת loss/risk budget.

---

# ‏86. `CapitalSize`

‏זה הגודל שמותר מבחינת available capital/buying power.

---

# ‏87. למה `CapitalSize` לבדו מסוכן

‏העובדה שיש לנו מספיק כסף אינה אומרת שהשוק יכול לקלוט את הפקודה באיכות סבירה.

---

# ‏88. `Working Orders` משפיעים על Capacity

‏אם כבר יש working orders באותו Symbol או באותו direction, capacity הפנויה קטנה יותר.

---

# ‏89. Pending Exposure

‏צריך לכלול גם Orders שעדיין לא התמלאו.

‏אחרת כמה components עלולים לשלוח יחד יותר size ממה שתכננו.

---

# ‏90. Cross-Strategy Capacity

‏אם בעתיד כמה Strategies סוחרות באותו Symbol, capacity צריכה להיות account-level ולא strategy-local בלבד.

---

# ‏91. `Self-Competition`

‏שתי Strategies יכולות להתחרות זו בזו על אותה liquidity או אפילו לפעול בכיוונים מנוגדים.

---

# ‏92. `Aggregate Intent`

‏לפני שליחה כדאי לדעת מהו net intent ברמת account/symbol.

---

# ‏93. `Order Slicing`

‏אפשר לחלק Parent Order לכמה Child Orders.

‏אבל slicing אינו יוצר liquidity חדשה.

---

# ‏94. Slicing Trade-off

‏יותר slices יכולים:

- ‏להקטין instantaneous footprint.
- ‏להאריך execution time.
- ‏להגדיל signal-decay risk.
- ‏להגדיל message count.

---

# ‏95. `TWAP` אינו פתרון אוטומטי ל־Impact

‏ב־Strategy של שניות, פיזור execution על פני זמן יכול פשוט לפספס את כל ה־Edge.

---

# ‏96. `POV` אינו פתרון אוטומטי

‏Participation-based execution מתאים רק אם horizon וה־objective תואמים.

---

# ‏97. `Urgency vs Impact`

‏זה אחד ה־trade-offs המרכזיים:

```text
More urgency
→ faster fill
→ potentially more impact

Less urgency
→ lower immediate impact
→ higher missed-opportunity risk
```

---

# ‏98. Capacity של Entry שונה מ־Capacity של Exit

‏ב־Entry אפשר לבחור לא להיכנס.

‏ב־Exit, אם כבר יש position, לעיתים אין לנו את הפריבילגיה לחכות.

---

# ‏99. `Exit Capacity`

‏צריך לשאול:

```text
How fast can we flatten under stress?
```

‏זו שאלה שונה מ־“כמה אפשר לקנות בנוחות”.

---

# ‏100. `Liquidity at Risk`

‏Position שנראה קטן בכניסה עלול להפוך גדול יחסית ל־liquidity בזמן stress.

---

# ‏101. `Time-to-Flat` כחלק מ־Risk

‏ככל שה־position גדול יותר ביחס ל־liquidity, time-to-flat יכול לגדול.

---

# ‏102. `Stress Exit Impact`

‏נרצה להעריך גם impact במקרה שבו חייבים לצאת מהר.

---

# ‏103. `Capacity` אינה רק Profit Optimization

‏היא גם Safety Constraint.

---

# ‏104. `Position Size` ו־LULD/Halt Risk

‏במצבי שוק מיוחדים liquidity יכולה להיעלם כמעט לחלוטין.

‏לכן capacity רגילה אינה מבטיחה exit capacity בזמן halt/reopen.

---

# ‏105. `Reopening Capacity`

‏לאחר halt או auction, הספר יכול להיראות שונה מהותית.

‏אין להניח ש־pre-halt liquidity חוזרת מיד.

---

# ‏106. `Capacity` לפי Volatility

‏כאשר volatility עולה, אותה כמות יכולה לגרום ליותר execution uncertainty.

---

# ‏107. `Capacity` לפי Spread

‏Spread רחב יותר מגדיל את execution tax גם לפני impact.

---

# ‏108. `Capacity` לפי Book Depth

‏Depth קטן יותר מצמצם את aggressive capacity.

---

# ‏109. `Capacity` לפי Flow Toxicity

‏גם אם depth קיים, toxic flow יכול להפוך passive fills למסוכנים.

---

# ‏110. `Capacity` לפי Signal Strength

‏Signal חזק יותר יכול להצדיק execution cost גבוה יותר, אך רק אם הקשר הזה הוכח מחוץ למדגם.

---

# ‏111. `Capacity` לפי Signal Horizon

‏Signal קצר דורש execution מהיר יותר ולכן לעיתים capacity נמוכה יותר.

---

# ‏112. `Capacity` לפי Edge Size

‏Edge גדול יותר יכול לספוג יותר cost.

‏אבל אין להניח ש־high score באמת מתרגם ל־high monetary edge בלי calibration.

---

# ‏113. `Score-to-Edge Calibration`

‏אם משתמשים ב־score כדי להצדיק size, צריך למפות score ל־expected executable outcome.

---

# ‏114. `Confidence` אינו Size לינארי

‏אין כלל טבעי שאומר:

```text
Twice the score = twice the size
```

‏זו הנחה שצריך לבדוק.

---

# ‏115. `Capacity Surface`

‏במקום curve חד־ממדית, אפשר לחשוב על surface:

```text
Size × Liquidity × Volatility × Spread × Regime
→ Expected Impact
```

---

# ‏116. Complexity Budget

‏לא חייבים לבנות surface ענק מיד.

‏מתחילים ממספר קטן של dimensions עם value ברור.

---

# ‏117. KISS Baseline

‏לרובוט שלנו baseline ראשוני יכול להיות:

```text
RelativeSize
Spread
TopNDepth
RecentDollarVolume
SignalTTL
```

‏ובהמשך מוסיפים dynamics אם הם מוכיחים value.

---

# ‏118. `Top-of-Book` בלבד עלול להטעות

‏אם size שלנו חוצה כמה levels, L1 אינו מספיק להערכת aggressive execution.

---

# ‏119. `N-Level VWAP`

‏אפשר לחשב simulated sweep cost על כמה levels:

```text
ExpectedSweepVWAP(size)
```

---

# ‏120. אבל גם `N-Level VWAP` אופטימי

‏הספר יכול להשתנות בזמן שהפקודה נוסעת ומבוצעת.

---

# ‏121. `Book Drift`

‏נמדוד את ההבדל בין הספר בזמן decision לבין הספר בזמן broker arrival/fill.

---

# ‏122. `Decision Depth` מול `Arrival Depth`

‏אלה שני snapshots שונים.

‏Capacity model צריך לדעת באיזה מהם הוא משתמש.

---

# ‏123. `Decision-Time Capacity`

‏זה estimate שנעשה כאשר Strategy מקבלת החלטה.

---

# ‏124. `Pre-Submit Capacity Recheck`

‏לפני שליחה אפשר לחשב שוב עם data עדכני יותר.

---

# ‏125. `Pre-Fill` אין לנו שליטה מלאה

‏בזמן שבין send ל־fill השוק ממשיך להשתנות.

‏לכן נדרש price protection.

---

# ‏126. `Marketable Limit` כ־Impact Guard

‏Marketable limit יכול להגביל את המחיר הגרוע ביותר שאנחנו מוכנים לשלם.

‏הוא לא מבטל impact, אבל מגביל tail מסוים של execution price.

---

# ‏127. `Max Sweep Distance`

‏אפשר להגדיר מרחק מחיר מקסימלי מה־reference שבו לא ממשיכים לצרוך liquidity.

---

# ‏128. `Max Levels Consumed`

‏Guard נוסף יכול להגביל כמה levels אנחנו מוכנים לחצות.

---

# ‏129. `Max Participation`

‏Guard אפשרי נוסף:

```text
EstimatedParticipation <= Limit
```

---

# ‏130. Guards צריכים להיות Research-backed

‏Thresholds אקראיים נותנים תחושת ביטחון מזויפת.

---

# ‏131. `Capacity Gate` לפני Entry

‏Pipeline אפשרי:

```text
Candidate
→ Prediction Gate
→ Risk Gate
→ Capacity Gate
→ Execution Intent
```

---

# ‏132. `Capacity Gate` יכול להקטין Size

‏לא תמיד צריך reject מוחלט.

‏אפשר:

```text
RequestedSize = 500
CapacityAllowed = 220
FinalSize = 220
```

---

# ‏133. אבל partial sizing משנה Economics

‏אם size קטן מדי, fixed costs יכולים להפוך את העסקה ללא כדאית.

‏לכן צריך re-run net-edge calculation אחרי resizing.

---

# ‏134. `Resize Loop`

‏Pipeline נכון:

```text
Proposed Size
→ Capacity Limit
→ New Size
→ Recalculate Net Edge
→ Trade / No Trade
```

---

# ‏135. `Capacity` ב־Scanner

‏אין צורך לחשב מודל depth כבד על 4,000 symbols כל cycle.

‏אפשר לבצע coarse capacity screening בשלב רחב.

---

# ‏136. Fast Capacity Filter

‏למשל:

- ‏Recent dollar volume.
- ‏Top-of-book size.
- ‏Spread.
- ‏Trade activity.

---

# ‏137. Deep Capacity Check

‏רק ל־Top N:

- ‏Multi-level depth.
- ‏Book dynamics.
- ‏Short-term impact model.
- ‏Route-specific feasibility.

---

# ‏138. `Coverage` חשוב גם כאן

‏אם אין לנו depth data לרוב השוק, אין להשוות candidate עם rich data ל־candidate עם sparse data כאילו measurement quality זהה.

---

# ‏139. `Capacity Confidence`

‏לכל estimate אפשר לצרף confidence.

```text
HIGH
MEDIUM
LOW
UNKNOWN
```

---

# ‏140. `UNKNOWN` אינו אפס

‏אם אין לנו מספיק data להעריך capacity, אין לפרש זאת כאפס impact.

---

# ‏141. `NO TRADE_CAPACITY_UNKNOWN`

‏Reason Code מפורש יכול להיות עדיף על assumption אופטימי.

---

# ‏142. `Historical Capacity Backtest`

‏Backtest שרוצה לבדוק scaling חייב להשתמש ב־historical liquidity שניתן היה לדעת בזמן אמת.

---

# ‏143. Leakage ב־Capacity

‏אסור להשתמש ב־full-day volume כדי להחליט מה היה מותר לבצע ב־10:03 בבוקר אם ה־full-day volume עדיין לא היה ידוע.

---

# ‏144. Point-in-Time Volume

‏השתמש רק ב־volume שכבר התרחש עד decision time או במודל forecast שנבנה ללא future leakage.

---

# ‏145. `Historical Book` Fidelity

‏אם backtest כולל depth, צריך לדעת:

- ‏Snapshot frequency.
- ‏Sequence integrity.
- ‏Venue coverage.
- ‏Hidden liquidity limitations.

---

# ‏146. `Touch` אינו Capacity Evidence

‏עצם העובדה שהשוק הגיע למחיר מסוים אינה מוכיחה שהיה אפשר לבצע שם את כל size שלנו.

---

# ‏147. `Trade Volume` אינו כולו Available Liquidity עבורנו

‏Volume שנרשם בשוק יכול לכלול executions שלא היינו מקבלים באותה queue position או route.

---

# ‏148. `Queue Capacity`

‏ב־passive execution capacity צריכה להתחשב בכמות לפנינו וב־time budget.

---

# ‏149. `Partial Fill Capacity`

‏ייתכן שאפשר לבצע 30% מה־size באיכות טובה, אבל לא את כולו.

‏אז צריך להחליט אם partial position עדיין תואמת Strategy.

---

# ‏150. `Minimum Fill Ratio`

‏אפשר להגדיר requirement מחקרי:

```text
filled_qty / target_qty >= minimum_ratio
```

‏אבל שוב, threshold צריך validation.

---

# ‏151. Capacity ו־Exit Logic

‏אם Entry מתבצע חלקית, Exit Logic חייב לדעת את הכמות האמיתית ולא target המקורי.

---

# ‏152. Capacity ו־Risk Engine

‏Risk Engine צריך לעבוד על:

- ‏Filled exposure.
- ‏Working exposure.
- ‏Unknown exposure.

---

# ‏153. Capacity ו־Recovery

‏לאחר restart, אי אפשר להסתמך על target size ששמור מקומית.

‏צריך reconcile מול broker truth.

---

# ‏154. `Impact` ו־Routing

‏Route יכול לשנות:

- ‏Depth available.
- ‏Queue position.
- ‏Fees.
- ‏Fill rate.
- ‏Impact path.

---

# ‏155. Smart Routing מול Direct Routing

‏Capacity model צריך למדוד את execution policy האמיתית שלנו, לא book תיאורטי של venue אחד בלבד.

---

# ‏156. `Venue Capacity`

‏אפשר למדוד capacity לפי venue כאשר יש data מספיק.

---

# ‏157. `Fragmented Capacity`

‏בפועל liquidity יכולה להיות מפוצלת בין venues.

‏Smart router עשוי לאחד אותה מבחינת execution, אבל latency ו־routing logic משפיעים.

---

# ‏158. `Hidden Capacity`

‏Hidden/ATS liquidity יכולה לשפר execution בפועל, אבל לא כדאי להכניס אותה למודל כ־guaranteed quantity.

---

# ‏159. `Observed vs Inferred`

‏כמו בפרקים הקודמים:

```text
Observed
Inferred
Unknown
```

‏Capacity model צריך לשמור את ההבחנה.

---

# ‏160. `Impact Attribution`

‏אחרי trade נרצה לפרק:

```text
Spread cost
Latency move
Sweep cost
Temporary impact
Persistent move
Adverse selection
Fees
```

‏גם אם חלק מהשדות הם estimates.

---

# ‏161. `Post-Trade Decay`

‏כדי להעריך temporary impact אפשר לבדוק אם המחיר חוזר חלקית לאחר סיום execution.

---

# ‏162. `Markout Curve` מול `Impact Curve`

‏Markout שואל מה קרה אחרי fill.

‏Impact curve שואלת איך execution quality השתנתה עם size.

‏צריך את שתיהן.

---

# ‏163. `Own-Trade Marker`

‏ב־event journal חשוב לזהות fills שלנו כדי לחבר אותם לתנועת השוק סביבם.

---

# ‏164. `Execution Episode`

‏כמה child fills של אותו intent צריכים להיות מקובצים לאותו execution episode.

---

# ‏165. `Episode-Level Impact`

‏במקום לנתח כל fill לבד, נרצה גם aggregate של כל parent intent.

---

# ‏166. `Pre-Trade` מול `Post-Trade` Analysis

‏Pre-trade estimate משמש להחלטה.

‏Post-trade analysis משמש calibration ו־RCA.

---

# ‏167. אסור להשתמש ב־Post-Trade Data כדי להצדיק Pre-Trade Decision

‏זה מקור leakage קלאסי.

---

# ‏168. `Impact Model Version`

‏כל החלטת size צריכה לדעת איזו גרסת impact model שימשה.

---

# ‏169. Feature Versioning

‏גם inputs כמו depth, volume windows ו־volatility צריכים versioning.

---

# ‏170. `Capacity Decision Record`

‏לכל trade כדאי לשמור:

```text
requested_size
approved_size
risk_limit_size
liquidity_limit_size
impact_limit_size
expected_impact
capacity_confidence
model_version
reason_codes
```

---

# ‏171. `Why was size 183?`

‏זו שאלה שהמערכת צריכה להיות מסוגלת לענות עליה בדיעבד.

---

# ‏172. `Why not 300?`

‏גם זה חשוב.

‏Explainability של sizing צריכה לכלול את constraint שקבע את ה־minimum.

---

# ‏173. `Binding Constraint`

‏נרצה לשמור מה היה ה־constraint הקובע:

```text
RISK
LIQUIDITY
IMPACT
CAPITAL
EXPOSURE
MIN_ECONOMIC_SIZE
UNKNOWN_DATA
```

---

# ‏174. `Capacity Telemetry`

‏Metrics אפשריים:

- ‏Requested size.
- ‏Approved size.
- ‏Resize ratio.
- ‏Expected impact.
- ‏Realized slippage.
- ‏Participation rate.
- ‏Levels consumed.
- ‏Time to fill.

---

# ‏175. Distribution of Resize Ratio

‏אם רוב trades מקבלים resize חריף, ייתכן שה־scanner בוחר candidates שאינם מתאימים לגודל ההון.

---

# ‏176. Capacity Rejection Rate

‏מדד שימושי נוסף:

```text
CapacityRejected / CandidateDecisions
```

---

# ‏177. `Capacity Opportunity Cost`

‏אם candidate #1 נדחה בגלל capacity, כדאי לעקוב האם #2 היה trade טוב יותר בפועל.

---

# ‏178. `Liquidity-Aware Fallback`

‏אפשר לשקול candidate הבא כאשר הראשון אינו executable בגודל הדרוש.

---

# ‏179. אבל Fallback משנה את Strategy

‏צריך לבדוק אותו בניסוי מסודר, לא להוסיף אותו ad hoc ב־Live.

---

# ‏180. `Capacity-Aware Ranking`

‏אפשר למחקר להשוות:

```text
Prediction Rank
vs
Executable Rank
```

---

# ‏181. `Gross Alpha` מול `Scalable Alpha`

‏Strategy יכולה לייצר Gross Alpha טוב אך Scalable Alpha נמוך.

---

# ‏182. `Scalable Alpha`

‏זה ה־edge שנשאר אחרי עלויות execution שעולות עם size.

---

# ‏183. `Capacity Collapse`

‏Strategy יכולה להיראות מצוין בכמות קטנה ולהפוך כמעט לא רווחית כאשר מנסים לנצל אותה עם capital גדול יותר.

---

# ‏184. `Edge Saturation`

‏מעבר לנקודה מסוימת, עוד capital לא מייצר proportional PnL.

---

# ‏185. `PnL vs Capital Curve`

‏נרצה לבדוק:

```text
Capital
→ Deployable Capital
→ Executed Notional
→ Net PnL
```

‏לא רק PnL באחוזים.

---

# ‏186. Idle Capital

‏אם capacity נמוכה, חלק מההון יישאר לא מנוצל.

‏זה לא בהכרח רע.

---

# ‏187. Opportunity Cost של Idle Capital

‏אפשר להשוות ל־alternative candidates או strategies, אבל בלי לכפות deployment רק כדי להיות “מושקע תמיד”.

---

# ‏188. `Always Invested` יכול להילחם ב־Capacity

‏אם מאלצים את המערכת להשקיע כל capital בכל רגע, היא עלולה להיכנס ל־symbols שאין בהם מספיק liquidity איכותית.

---

# ‏189. `NO TRADE` הוא Capacity Tool

‏לפעמים אין candidate שיכול לקלוט את size שלנו בלי למחוק את ה־edge.

‏זו סיבה תקינה לא לבצע.

---

# ‏190. `Capital Allocation` מול `Capacity Allocation`

‏Capital allocation שואל איפה לשים כסף.

‏Capacity allocation שואל איפה בכלל אפשר לבצע אותו.

---

# ‏191. Capacity Portfolio-Wide

‏אם כמה opportunities מופיעות יחד, צריך לחלק capacity ולא רק risk.

---

# ‏192. `Liquidity Correlation`

‏ב־stress, liquidity של כמה symbols יכולה להידרדר יחד.

‏לכן assumptions של independent capacity עלולים להיות אופטימיים.

---

# ‏193. `Market-Wide Capacity Stress`

‏נבדוק scenarios שבהם:

- ‏Spreads מתרחבים יחד.
- ‏Depth נעלם יחד.
- ‏Latency עולה.
- ‏Rejects עולים.

---

# ‏194. `Capacity` ו־Kill Switch

‏אם realized impact או slippage קופצים מעבר לרמה סבירה, Safety layer יכולה לחסום Entries חדשים.

---

# ‏195. `Impact Drift`

‏גם אם model היה calibrated בעבר, execution environment יכול להשתנות.

---

# ‏196. Drift Indicators

‏אפשר לעקוב אחרי:

- ‏Expected vs realized impact.
- ‏Expected vs realized fill time.
- ‏Expected vs realized participation.
- ‏Slippage residuals.

---

# ‏197. `Residual Impact Error`

```text
Residual = RealizedImpact - ExpectedImpact
```

‏Distribution של residuals חשובה יותר מממוצע בלבד.

---

# ‏198. `Capacity Model Calibration`

‏נרצה לבדוק האם buckets עם expected impact גבוה באמת מייצרים impact גבוה יותר.

---

# ‏199. Monotonicity

‏באופן כללי נצפה שככל relative size עולה, execution cost לא ישתפר באופן שיטתי ללא סיבה.

‏אם המודל מציג pattern מוזר, נדרש RCA.

---

# ‏200. `Calibration by Regime`

‏מודל יכול להיות טוב בשוק רגוע ורע ב־fast market.

---

# ‏201. `Calibration by Symbol Class`

‏אפשר להפריד large-cap, mid-cap, small-cap או liquidity buckets בלי להניח שכל class זהה.

---

# ‏202. Overfitting Risk

‏יותר מדי buckets יוצרים sample size קטן ומודל לא יציב.

---

# ‏203. Robust Regions

‏עדיף policy שעובדת טוב בטווח רחב של conditions מאשר threshold מושלם היסטורית בנקודה אחת.

---

# ‏204. `Capacity Sensitivity Test`

‏נשנה size assumptions ונראה אם conclusion משתנה קיצונית.

---

# ‏205. `Impact Stress Multiplier`

‏במחקר אפשר להריץ:

```text
0.5x expected impact
1.0x
1.5x
2.0x
```

‏ולבדוק מתי edge נעלם.

---

# ‏206. `Break-Even Impact`

‏אפשר לחשב כמה impact נוסף האסטרטגיה יכולה לספוג לפני שה־net edge הופך לאפס.

---

# ‏207. `Impact Headroom`

```text
ImpactHeadroom = ExpectedNetEdgeBeforeImpact - ExpectedImpact
```

‏הגדרה מדויקת תלויה במודל העלויות.

---

# ‏208. Low Headroom = Fragile Trade

‏Trade שורד רק תחת execution כמעט מושלם הוא fragile.

---

# ‏209. `Fragility` כחלק מ־Decision

‏אפשר להשתמש ב־execution fragility כ־gate או diagnostic.

---

# ‏210. `Capacity RCA`

‏כאשר trade גדול נכשל, לא מספיק לומר “slippage גבוה”.

‏צריך לשאול:

- ‏האם size היה גדול יחסית ל־depth?
- ‏האם liquidity נעלמה?
- ‏האם latency גדלה?
- ‏האם route היה שונה?
- ‏האם market regime השתנה?
- ‏האם adverse selection התחזתה ל־impact?

---

# ‏211. `First Divergence`

‏נחפש את הנקודה הראשונה שבה execution בפועל סטה מהתוכנית.

---

# ‏212. `Capacity Failure Codes`

‏דוגמאות:

```text
CAPACITY_DEPTH_TOO_LOW
CAPACITY_SPREAD_TOO_WIDE
CAPACITY_IMPACT_BUDGET_EXCEEDED
CAPACITY_TTL_TOO_SHORT
CAPACITY_CONFIDENCE_LOW
CAPACITY_PARTIAL_FILL_RISK
CAPACITY_STRESS_FAILED
```

---

# ‏213. `Success RCA`

‏גם trade גדול שהצליח צריך להיבדק.

‏אולי הצלחנו משום שהיה hidden liquidity מקרי שלא ניתן לסמוך עליו להבא.

---

# ‏214. `Near Miss`

‏אם order כמעט חצה impact limit אך בסוף יצא טוב, זה עדיין useful evidence.

---

# ‏215. `Capacity Incident`

‏Execution חריג יכול ליצור incident packet עם:

- ‏Book snapshots.
- ‏Orders/Fills.
- ‏Latency.
- ‏Market data health.
- ‏Routes.
- ‏Expected vs realized impact.

---

# ‏216. Replay

‏Replay יכול לשחזר את inputs והחלטות.

‏אבל impact אמיתי של hypothetical larger order לא תמיד ניתן לשחזור מושלם.

---

# ‏217. `Counterfactual Capacity` מוגבלת

‏אי אפשר לדעת בדיוק איך השוק היה מגיב אילו שלחנו פי 10 size.

---

# ‏218. לכן Scaling Evidence היררכי

```text
Historical estimate
→ Replay model
→ Shadow estimate
→ Paper sanity
→ Small Live canary
→ Controlled ramp
```

---

# ‏219. `Paper` אינו Evidence ל־Impact

‏Paper שימושי ל־state machine ול־order flow תפעולי, לא להוכחת market impact אמיתי.

---

# ‏220. Small Live צריך Guardrails

‏Calibration live חייב להישאר בתוך risk limits שמרניים.

---

# ‏221. `Size Experiment Registry`

‏כל שינוי size policy צריך להירשם כניסוי.

---

# ‏222. Experiment Fields

```text
hypothesis
baseline_size_policy
challenger_size_policy
primary_metric
risk_guardrails
sample_window
promotion_rule
rollback_rule
```

---

# ‏223. Primary Metric

‏אפשר לבחור למשל:

```text
NetEdgeRetained
```

‏ולצדו guardrails של slippage, drawdown ו־impact tails.

---

# ‏224. `PnL` לבדו אינו מספיק

‏PnL יכול להשתפר רק כי market conditions היו טובות יותר בתקופה החדשה.

---

# ‏225. Matched Comparison

‏נשווה trades דומים ככל האפשר מבחינת liquidity, volatility, signal ו־time of day.

---

# ‏226. `Ablation`

‏נבדוק האם capacity model באמת מוסיף value לעומת policy פשוטה.

---

# ‏227. Baseline חשוב

‏לדוגמה:

```text
Fixed Small Size
```

‏הוא baseline מצוין להשוואה מול adaptive sizing.

---

# ‏228. `Complexity Tax`

‏Capacity model מורכב מוסיף:

- ‏Latency.
- ‏Data requirements.
- ‏Failure modes.
- ‏Research degrees of freedom.

---

# ‏229. Model חייב להצדיק את עצמו

‏אם adaptive capacity משפר רק מעט performance אבל מגדיל complexity מאוד, ייתכן שהוא לא כדאי.

---

# ‏230. `Hot Path` Budget

‏Capacity calculation בזמן decision צריך להיות מהיר מספיק ביחס ל־signal half-life.

---

# ‏231. Precompute

‏אפשר לחשב מראש:

- ‏Rolling liquidity features.
- ‏Recent dollar volume.
- ‏Depth summaries.
- ‏Volatility state.

‏כדי שה־decision path יישאר קצר.

---

# ‏232. Top-N Deep Evaluation

‏Heavy simulation אפשר להריץ רק על המועמדים המובילים.

---

# ‏233. `Capacity Cache`

‏אפשר לשמור estimate קצר־חיים עם timestamp.

‏אבל חייבים TTL.

---

# ‏234. Stale Capacity

‏Capacity estimate בן 10 שניות יכול להיות חסר ערך ב־fast symbol.

---

# ‏235. `Capacity Age`

‏נשמור:

```text
capacity_computed_at
capacity_age_ms
```

---

# ‏236. Freshness Gate

‏לא משתמשים ב־capacity estimate ישן רק כי הוא האחרון שיש.

---

# ‏237. `Capacity Confidence` יכול לרדת עם Age

‏זה מודל פשוט ושימושי.

---

# ‏238. Data Quality Gate

‏אם book data חלקי או provider degraded, capacity estimate צריכה להיחשב unreliable.

---

# ‏239. `Broker Capability`

‏Execution broker יכול להגביל order size, routing או algo choices.

‏Capacity engine צריך לקבל capabilities מה־adapter ולא להניח אותן.

---

# ‏240. `MarketDataProvider` ו־`ExecutionBroker` נשארים נפרדים

‏Capacity research יכול להשתמש ב־market data provider עשיר יותר מהברוקר שמבצע בפועל.

---

# ‏241. אבל Cross-Provider Basis חשוב

‏אם decision feed ו־execution venue שונים, צריך למדוד divergence.

---

# ‏242. `Executable Capacity` לפי Broker Path

‏ה־capacity האמיתית היא capacity של כל השרשרת:

```text
Data
→ Decision
→ Broker
→ Router
→ Venue
→ Fill
```

---

# ‏243. `Capacity` ו־Observability

‏Dashboard יכול להציג:

- ‏Requested vs approved size.
- ‏Expected impact.
- ‏Realized impact proxy.
- ‏Participation.
- ‏Depth consumption.
- ‏Capacity confidence.
- ‏Binding constraint.

---

# ‏244. Alert על Impact Drift

‏אם realized execution cost חורג באופן עקבי מהמודל, זה signal תפעולי ומחקרי.

---

# ‏245. Alert על Capacity Collapse

‏אם מספר רב של trades נדחה בגלל liquidity deterioration, ייתכן שה־regime השתנה.

---

# ‏246. Capacity Dashboard אינו Control Logic

‏ה־guard צריך לחיות ב־Risk/Execution path, לא רק בגרף.

---

# ‏247. `Audit`

‏כל override ידני של size/capacity limit צריך להיות audit-able.

---

# ‏248. Manual Override הוא Risk Event

‏אם operator מגדיל size מעבר ל־model recommendation, המערכת צריכה לתעד זאת במפורש.

---

# ‏249. `Hard Cap`

‏בנוסף למודל adaptive, כדאי לשמור hard absolute caps להגנה מפני model bug.

---

# ‏250. `Soft Cap`

‏Soft cap יכול להגיע מה־capacity model ולהשתנות לפי market state.

---

# ‏251. Hard Cap אינו Capacity Model

‏הוא Safety ceiling בלבד.

---

# ‏252. `Invariant`: no order above approved size

‏זו בדיקת מערכת בסיסית.

---

# ‏253. `Invariant`: resize requires revalidation

‏כל שינוי size צריך לעבור שוב Risk ו־Net Edge checks.

---

# ‏254. `Invariant`: unknown capacity does not become infinite capacity

‏אם הנתון חסר, ברירת המחדל אינה “אין מגבלה”.

---

# ‏255. `Invariant`: working exposure counts

‏אסור לחשב capacity כאילו pending orders אינם קיימים.

---

# ‏256. `Invariant`: exit path survives entry sizing

‏לא נכנסים ל־position שהמערכת אינה מאמינה שתוכל לנהל או לצאת ממנו תחת assumptions סבירים.

---

# ‏257. Unit Tests

‏נבדוק חישובי:

- ‏Relative size.
- ‏Participation.
- ‏Sweep VWAP.
- ‏Impact budget.
- ‏Binding constraint.

---

# ‏258. Property Tests

‏דוגמאות:

```text
ApprovedSize <= RequestedSize
ApprovedSize <= HardCap
ApprovedSize <= RiskSize
UnknownLiquidity never increases ApprovedSize
```

---

# ‏259. Golden Scenarios

‏כדאי ליצור scenarios קבועים:

- ‏Deep stable book.
- ‏Thin book.
- ‏Wide spread.
- ‏Fast disappearing depth.
- ‏Partial fill.
- ‏High participation.
- ‏Data gap.

---

# ‏260. Differential Test

‏משווים capacity model חדש מול baseline על אותם inputs.

---

# ‏261. Replay Test

‏אותו event stream צריך לתת אותה capacity decision תחת אותה גרסה/config.

---

# ‏262. Observability Test

‏צריך להיות מסוגלים לענות:

```text
Why did we approve only 140 shares?
```

‏מתוך logs/decision record בלבד.

---

# ‏263. Stress Test

‏נריץ model תחת:

- ‏Burst data.
- ‏Latency spike.
- ‏Depth collapse.
- ‏Spread expansion.
- ‏Provider degradation.

---

# ‏264. Performance Test

‏Capacity logic לא צריכה להפוך את scanner bottleneck.

---

# ‏265. `Fail Closed`

‏אם capacity subsystem נכשל בזמן Entry, ברירת המחדל השמרנית היא לא להגדיל Risk.

---

# ‏266. Exit Exception

‏ב־Exit, priority היא reduction of risk.

‏לכן failure של capacity model לא צריך למנוע בהכרח ניסיון לצמצם exposure.

---

# ‏267. Entry ו־Exit צריכים Policies שונות

‏זה חוזר שוב:

```text
Entry = optional risk creation
Exit = risk reduction / position management
```

---

# ‏268. `Capacity` ברובוט שלנו — שלב ראשון

‏Baseline ראשוני:

1. ‏Position size קטן וקבוע.
2. ‏Hard maximum size.
3. ‏Spread gate.
4. ‏Recent activity gate.
5. ‏Top-of-book/short-depth sanity.
6. ‏Marketable-limit price protection.
7. ‏Full execution logging.

---

# ‏269. שלב שני

‏לאחר מספיק evidence:

- ‏Relative-size features.
- ‏Short-window dollar volume.
- ‏Multi-level sweep estimate.
- ‏Capacity confidence.
- ‏Size reduction במקום reject מלא.

---

# ‏270. שלב שלישי

‏רק אם מוכח value:

- ‏Dynamic impact model.
- ‏Regime-conditioned capacity.
- ‏Route-aware capacity.
- ‏Champion/Challenger sizing.

---

# ‏271. מה לא לעשות בהתחלה

‏לא לבנות מיד model מסובך עם עשרות parameters.

‏לא להניח שחוק מוסדי כללי מתאים לרובוט קטן.

‏לא להגדיל capital רק כי backtest percent return נשאר זהה.

---

# ‏272. `Scaling Test` בסיסי

‏לכל Strategy candidate נריץ לפחות כמה גדלים:

```text
0.5x
1x
2x
4x
```

‏הערכים בפועל ייקבעו לפי המערכת ולא לפי הדוגמה.

---

# ‏273. מה נבדוק בכל Size

- ‏Expected net return.
- ‏Fill rate.
- ‏Time to fill.
- ‏Slippage.
- ‏Impact proxy.
- ‏MAE/MFE.
- ‏Post-fill markout.
- ‏Missed opportunity.

---

# ‏274. `Capacity Frontier`

‏אפשר להציג graph רעיוני:

```text
Net Edge
  ^
  |\
  | \
  |  \
  |   \____
  +----------> Size
```

‏המטרה אינה למצוא את הנקודה עם PnL נומינלי מקסימלי בלבד.

‏צריך להתחשב גם ב־risk, uncertainty ו־tails.

---

# ‏275. `Safe Operating Region`

‏עדיף לבחור region שבו:

- ‏Net edge חיובי בצורה יציבה.
- ‏Impact model calibrated.
- ‏Tail execution cost נסבל.
- ‏Exit capacity סבירה.
- ‏Model uncertainty אינה גבוהה מדי.

---

# ‏276. `Capacity Headroom`

‏מערכת Production לא צריכה לעבוד כל הזמן בקצה התיאורטי של capacity.

‏Headroom עוזר לשרוד drift ו־stress.

---

# ‏277. `Capital Scaling` הוא ניסוי חדש

‏זה אחד הלקחים החשובים בפרק.

‏אם Strategy עבדה ב־$X, אין הוכחה שהיא אותה Strategy ב־`10X`.

---

# ‏278. Scaling יכול לשנות את ה־Strategy עצמה

‏בגודל גדול יותר משתנים:

- ‏Fill path.
- ‏Holding time.
- ‏Execution cost.
- ‏Opportunity set.
- ‏Exit behavior.

‏לכן scaling הוא שינוי התנהגותי, לא רק פיננסי.

---

# ‏279. Practitioner Insight — `Alpha` ו־`Capacity` הם זוג

‏Edge קטן עם Capacity גבוהה יכול להיות מעניין יותר מ־Edge גבוה שלא ניתן לבצע מעבר לכמות זעירה.

---

# ‏280. Practitioner Insight — Liquidity היא State, לא Attribute קבוע

‏אל תכתוב במודל:

```text
XYZ is liquid
```

‏עדיף:

```text
XYZ appears executable for size S
at time T
under regime R
with confidence C
```

---

# ‏281. Practitioner Insight — Impact מודדים אחרי עלויות אחרות

‏אם spread כבר מסביר את רוב העלות, אל תייחס הכול ל־impact.

---

# ‏282. Practitioner Insight — Size קטן מדי גם מטעה

‏ב־tiny size אפשר לקבל fills כמעט אידיאליים שלא מלמדים דבר על production capacity גבוהה יותר.

---

# ‏283. Practitioner Insight — Fill טוב אינו הוכחת Capacity

‏Fill אחד יפה יכול להיות מזל, hidden liquidity או market condition חריג.

---

# ‏284. Practitioner Insight — Capacity חייבת להיות דו־צדדית

‏אל תמדוד רק כמה קל להיכנס.

‏מדוד גם כמה קשה לצאת.

---

# ‏285. Practitioner Insight — Stress Liquidity חשובה יותר מ־Normal Liquidity

‏בדיוק ברגע שבו position מסתבכת, liquidity יכולה להיות גרועה יותר מהממוצע.

---

# ‏286. Practitioner Insight — `NO TRADE` הוא לפעמים תוצאה של עודף Capital

‏אם capital גדול יותר מה־capacity של opportunity, לא חייבים לדחוף את כולו לשוק.

---

# ‏287. Practitioner Insight — Scaling exposes hidden bugs

‏Partial fills, race conditions ו־reconciliation bugs הופכים בולטים יותר כאשר size גדל.

---

# ‏288. Practitioner Insight — Capacity Model עצמו צריך Kill Switch

‏אם expected-vs-realized impact מתפרק, אפשר לעבור ל־small fixed size או לעצור Entries.

---

# ‏289. Practitioner Insight — Conservative model beats precise-looking fiction

‏עדיף estimate גס עם uncertainty מפורשת מאשר מספר “מדויק” שמבוסס על assumptions לא ניתנים לצפייה.

---

# ‏290. Checklist לפני הגדלת Size

- ‏האם execution cost נמדד לפי size?
- ‏האם יש מספיק samples?
- ‏האם בדקנו tails?
- ‏האם ההשוואה point-in-time?
- ‏האם exit capacity נבדקה?
- ‏האם working orders נספרים?
- ‏האם impact model calibrated?
- ‏האם יש hard cap?
- ‏האם יש rollback?

---

# ‏291. Checklist ל־Live Trade

- ‏Data fresh?
- ‏Spread acceptable?
- ‏Depth sufficient?
- ‏Capacity estimate fresh?
- ‏Confidence sufficient?
- ‏Impact budget okay?
- ‏Risk okay?
- ‏Signal still alive?
- ‏Execution price protected?

---

# ‏292. שאלות ידע

‏אם אתה מבין את הפרק, אתה אמור להיות מסוגל לענות:

1. ‏למה Slippage ו־Impact אינם אותו דבר?
2. ‏למה Participation Rate צריך context?
3. ‏למה Capacity אינה proportional ל־capital?
4. ‏למה Paper Trading אינו מוכיח Impact?
5. ‏למה Entry Capacity ו־Exit Capacity שונות?
6. ‏למה Rank #1 אינו בהכרח candidate הכי scalable?
7. ‏למה `UNKNOWN` capacity צריכה להיות שמרנית?
8. ‏למה capital ramp הוא ניסוי חדש?

---

# ‏293. מודל מנטלי מסכם

```text
Signal Edge
    ↓
Requested Size
    ↓
Risk Constraints
    ↓
Liquidity / Capacity Constraints
    ↓
Expected Impact
    ↓
Expected Net Edge
    ↓
Approved Size or NO TRADE
    ↓
Execution
    ↓
Realized Cost / Impact / Markout
    ↓
Calibration
```

---

# ‏294. מסקנה

‏`Price Impact` הוא המחיר שאנחנו משלמים כאשר עצם הניסיון לבצע מתחיל לשנות את סביבת המסחר.

‏`Capacity` היא הגבול שבו עדיין ניתן להפוך את ה־Edge התיאורטי ל־Edge executable בצורה סבירה.

‏לכן:

```text
More Capital
!=
More Scalable Edge
```

‏המערכת צריכה לגדול רק בקצב שבו ה־execution evidence מוכיח שהשוק מסוגל לקלוט את הגודל הנוסף.

---

# ‏295. המעבר לשלב הבא

‏אחרי שהבנו מתי הגודל שלנו עצמו מתחיל לשנות את השוק, השלב הבא הוא להבין מימד אחר של microstructure:

‏**כמה מהיתרון שלנו נובע ממהירות, מה אפשר להשיג בלי להיות HFT, ואיפה latency optimization אמיתי נגמר והפנטזיה מתחילה.**

‏זהו נושא של שלב 48 — `Latency Edge without pretending to be HFT`.
