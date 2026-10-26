# ‏01 — Recommendation Sheet: Personal Algo System Foundations

> ‏מקור לימודי עיקרי: `../01-FOUNDATIONS-PERSONAL-ALGO-SYSTEM.md`.
>
> ‏מטרת הקובץ: להחליט מהו מודל המערכת וה־Baseline העקרוני שממנו נכון להתחיל עבור רובוט `Short-Horizon Momentum` אישי, לפני החלטות מפורטות על Data, Features, Orders, Broker או Infrastructure.

---

## ‏1. Decision

‏איזה מודל מערכת צריך לשמש כברירת המחדל למחקר ולבנייה, ומה בדיוק המערכת צריכה למקסם?

---

## ‏2. Recommended Default

### ‏`P1 — Preferred Default`

‏לבנות מערכת שלמה שמפרידה במפורש בין:

```text
Market Data
→ Candidate Discovery
→ Hard Eligibility Filters
→ Ranking
→ Absolute Trade Gate
→ Execution Feasibility Recheck
→ Entry
→ Position Monitoring
→ Exit
→ Cost / Net-PnL Accounting
→ Logs + Replay Evidence
→ Research / Improvement Loop
```

‏ה־Scanner אינו המוצר הסופי. הוא רק שלב בשרשרת החלטה וביצוע.

### ‏`P1 — Preferred Default`

‏להשתמש בבחירה `cross-sectional`: להשוות בכל מחזור את יקום הניירות הכשיר ולדרג את המועמדים היחסיים, אבל **לא לבצע עסקה רק משום שקיים Rank #1**.

‏לאחר הדירוג חייב להיות Gate מוחלט שמאפשר:

```text
TRADE
or
NO TRADE
```

### ‏`P1 — Preferred Default`

‏להגדיר את מטרת המחקר כך:

```text
maximize repeatable executable net edge
subject to explicit risk and operational constraints
```

‏ולא כך:

```text
maximize gross price move
maximize hit rate
maximize number of trades
maximize scanner score
```

### ‏`P0 — Required Before Live Risk`

‏לא לקדם שום Baseline למסחר חי לפני שניתן למדוד מקצה לקצה לפחות:

- ‏מה היה המידע בזמן ההחלטה.
- ‏למה המועמד נבחר.
- ‏למה התקבלה החלטת `TRADE / NO TRADE`.
- ‏איזו פקודה נשלחה ומה בוצע בפועל.
- ‏כמה זמן עבר בין השלבים המרכזיים.
- ‏מה היו כל העלויות הרלוונטיות.
- ‏מה היה ה־Net outcome.
- ‏מה גרם ליציאה.
- ‏האם ניתן לשחזר ולחקור את האירוע בדיעבד.

---

## ‏3. Fact / Judgment / Hypothesis

### ‏Facts

- ‏`Fact` — Rank #1 הוא בהכרח הטוב ביותר **רק יחסית לקבוצת המועמדים ולפונקציית הדירוג שהוגדרה**; הוא אינו מוכיח שקיימת עסקה כדאית.
- ‏`Fact` — `Spread`, ‏`Slippage`, עמלות ועלויות ביצוע יכולים להפוך יתרון Gross קטן לתוצאה Net שלילית.
- ‏`Fact` — `Partial Fill` פירושו שה־position בפועל יכול להיות שונה מהכמות שנשלחה בפקודה, ולכן ניהול המצב חייב להתבסס על fills ולא על intent בלבד.
- ‏`Fact` — Latency מצטברת לאורך השרשרת Data → Decision → Order → Fill, ולכן signal קצר־חיים עלול להתיישן לפני הביצוע.
- ‏`Fact` — העובדה שנייר כבר עלה אינה מוכיחה שהוא ימשיך לעלות לאחר הכניסה.

### ‏Judgments

- ‏`Judgment` — עבור המטרה שלנו, `NO TRADE` צריך להיות תוצאה First-Class ולא מצב חריג.
- ‏`Judgment` — נכון להתחיל מארכיטקטורה מודולרית שבה Signal/Selection, Execution, Risk ו־Operations ניתנים למדידה ולהחלפה בנפרד.
- ‏`Judgment` — נכון לאופטם את השרשרת לפי Net Edge ולא לפי Metric בודד של Scanner או Predictor.
- ‏`Judgment` — נכון לשמור את שלב 01 פשוט ברמת ה־Policy; החלטות מימוש כמו Event-driven מול Polling, Score יחיד מול מודלים אחרים או Order tactic ספציפי ייקבעו בפרקי ההמלצה המתאימים.

### ‏Hypotheses

- ‏`Hypothesis` — סריקה רחבה של השוק יכולה לייצר מספיק הזדמנויות קצרות בעלות Edge בר־ביצוע עבור חשבון אישי קטן.
- ‏`Hypothesis` — Candidate שנבחר כטוב ביותר לפי Momentum + Executability ימשיך מספיק זמן כדי לאפשר כניסה ויציאה חיוביות Net.
- ‏`Hypothesis` — יתרון הגודל הקטן והגמישות התפעולית יפצו במידה מספקת על חיסרון התשתית לעומת שחקנים מקצועיים מהירים יותר.

‏שלוש ההשערות האלה אינן מקבלות סטטוס Fact עד שהן עוברות Validation אמפירי.

---

## ‏4. Why

‏המטרה שלנו היא קצרה מאוד בזמן וב־Edge הצפוי. לכן שגיאה קטנה בכל חוליה — Data ישן, Rank טוב אך בלתי־סחיר, כניסה מאוחרת, Fill גרוע, יציאה איטית או Cost שלא נמדד — יכולה למחוק את כל היתרון.

‏הפרדה לשלבים מאפשרת לענות בנפרד על שאלות שונות:

- ‏האם מצאנו תנועה מעניינת?
- ‏האם היא מנבאת משהו Forward?
- ‏האם היא עדיין קיימת עכשיו?
- ‏האם ניתן לבצע אותה במחיר סביר?
- ‏האם ה־Risk סביר?
- ‏האם התוצאה נשארת חיובית Net?

‏בלי ההפרדה הזו, קל לייחס הצלחה או כישלון לרכיב הלא נכון.

---

## ‏5. Use When

‏ה־Baseline הזה מתאים כאשר:

- ‏המטרה היא החזקה של milliseconds/seconds ועד עשרות שניות, ובמקרים מוצדקים בערך דקה.
- ‏רוצים להשוות Universe רחב ולא לעקוב רק אחרי Symbol קבוע.
- ‏ה־Edge הצפוי קטן ולכן עלויות וביצוע מהותיים.
- ‏רוצים מערכת שאפשר לחקור ולשפר באופן הדרגתי.
- ‏רוצים יכולת להחליף Data Provider או Broker בלי לשכתב את כל הלוגיקה המחקרית.

---

## ‏6. Do Not Use When

‏אין להעתיק את ה־Baseline הזה ללא התאמה כאשר:

- ‏האסטרטגיה היא Investment או Swing ארוך שבו milliseconds/seconds אינם משמעותיים.
- ‏המערכת עוסקת רק בנייר אחד או באירוע ידוע מראש ואין צורך ב־cross-sectional selection.
- ‏אין יכולת לאסוף נתוני ביצוע ועלויות ברזולוציה מספקת.
- ‏אין אפשרות לשחזר החלטות ולבצע Validation; במצב כזה אין בסיס אמין לקידום מערכת אוטונומית.

---

## ‏7. Alternatives

### ‏Alternative A — Signal per Symbol ללא דירוג רוחבי

‏כל Symbol מקבל החלטת Trade עצמאית כאשר הוא חוצה Threshold.

**יתרון:** פשוט יותר, parallel וקל להבנה.

**חיסרון:** כאשר הרבה Symbols מאותתים יחד, אין מנגנון טבעי לבחירת ההזדמנות העדיפה תחת Capital מוגבל.

### ‏Alternative B — Rank בלבד, תמיד לסחור ב־#1

**יתרון:** פשוט מאוד ומבטיח Decision בכל מחזור.

**חיסרון:** כופה עסקאות גם כאשר כל השוק באיכות נמוכה. זה מנוגד לעקרון Absolute Trade Gate.

### ‏Alternative C — Search only / Human execution

‏המערכת מדרגת ומציגה מועמדים; אדם מחליט ומבצע.

**יתרון:** שימושי כשלב מחקר ולמידה מוקדם.

**חיסרון:** latency אנושית, שונות בהחלטות וקושי למדוד Policy אוטומטי עקבי.

### ‏Alternative D — End-to-end opaque model

‏מודל אחד מקבל Raw Data ומחזיר Action.

**יתרון:** עשוי ללמוד אינטראקציות מורכבות.

**חיסרון:** קשה יותר ל־RCA, ל־safety gating, לבידוד execution economics ולבדיקת leakage. אינו Baseline מומלץ.

---

## ‏8. Trade-offs

| בחירה | מה מרוויחים | מה מפסידים |
|---|---|---|
| Cross-sectional ranking + absolute gate | ‏Capital allocation ברור ויכולת `NO TRADE` | ‏מורכבות דירוג והשוואה רוחבית |
| Modular pipeline | ‏RCA, testability, החלפת רכיבים | ‏יותר boundaries ו־contracts |
| Net-edge objective | ‏מחובר לכלכלה האמיתית | ‏דורש מודל עלויות וביצוע אמין |
| Full observability before live | ‏יכולת הסבר ושחזור | ‏עבודה הנדסית מוקדמת שאינה מייצרת Signal חדש |
| Simple baseline first | ‏פחות confounders וקל יותר למדוד | ‏ייתכן שמוותרים זמנית על optimization מועיל |

---

## ‏9. What I Would Avoid Initially

### ‏Avoid Initially

- ‏מודל Score מורכב מאוד לפני שיש Baseline פשוט למדידה.
- ‏עשרות Features לפני שמוכח ש־Features בסיסיים מנבאים Forward outcome.
- ‏אופטימיזציה למספר עסקאות ליום.
- ‏כניסה אוטומטית בכל פעם שקיים Rank #1.
- ‏חיבור Signal, Execution ו־Risk לפונקציה אחת שקשה לפרק ולבדוק.
- ‏אופטימיזציות latency עמוקות לפני Measurement של latency budget אמיתי.

### ‏Avoid Unless Measured

- ‏כל תוספת Complexity שאין לה Metric שמראה איזה Bottleneck היא פותרת.
- ‏כל Rule שנבחר משום שהוא “נראה מקצועי” אך לא שיפר OOS Net outcome.
- ‏כל תהליך שמסתיר rejects, stale signals, partial fills או execution degradation.

### ‏Avoid Entirely for the Baseline

- ‏הנחה שקיים Profit משום שהמחיר המשיך בכיוון הנכון בגרף.
- ‏הנחה ש־high hit rate שווה Profitability.
- ‏הבטחה לכמות עסקאות קבועה לשעה או ליום.

---

## ‏10. What to Add Later

‏רק לאחר שיש Baseline מדיד:

- ‏Challenger ranking methods.
- ‏Dynamic thresholds לפי Regime.
- ‏Top-N portfolio/candidate arbitration במקום Top-1 בלבד.
- ‏Adaptive execution tactics.
- ‏Advanced queue/liquidity models.
- ‏Machine-learning components כאשר Baseline פשוט מספק benchmark אמין.
- ‏Latency optimization ממוקד לפי measured critical path.

---

## ‏11. Required Data / Evidence

‏לפני שנוכל לטעון שהגישה עצמה ראויה להמשך, צריך Dataset שמאפשר לקשר בין:

```text
market state at decision time
→ candidate set
→ ranking result
→ trade gate result
→ order/fill outcome
→ exit outcome
→ all-in costs
→ net result
```

‏נדרשים לפחות:

- ‏Timestamp עקבי לכל שלב מרכזי.
- ‏Snapshot או event context שממנו חושבו Features.
- ‏Candidate set ו־rejection reasons.
- ‏Rank ו־score/sub-scores כאשר קיימים.
- ‏Decision reason ל־`TRADE / NO TRADE`.
- ‏Order intent, acknowledgements, fills ו־partial fills.
- ‏Entry/exit prices בפועל.
- ‏עלות מלאה ככל שניתן למדוד.
- ‏Forward outcomes במספר horizons.
- ‏Session/Regime context לצורכי diagnostics.

---

## ‏12. Promotion Criteria

‏Baseline Research יכול להתקדם לשלב Shadow/Paper רק אם:

1. ‏ה־pipeline דטרמיניסטי או לכל הפחות ניתן לשחזור מספק.
2. ‏אין look-ahead/data leakage ידוע.
3. ‏ה־ranking וה־gate נמדדים על OOS/forward data.
4. ‏ה־execution simulation כולל assumptions ריאליסטיים מספיק לשלב המחקר.
5. ‏ה־Net result נשאר חיובי תחת Cost/Latency stress סביר.
6. ‏המערכת מתעדת rejects, decisions ו־fills בצורה שמאפשרת RCA.

‏Shadow/Paper יכול להתקדם ל־Live candidate רק כאשר Cross-Cutting Production Safety ו־Risk recommendations העתידיים מתקיימים; קובץ זה לבדו אינו אישור Live.

---

## ‏13. Rejection Criteria

‏יש לדחות או לשנות מהותית את ה־Hypothesis המרכזית אם אחד מהבאים נשאר עקבי לאחר Validation תקין:

- ‏אין Forward predictive value מעבר לרעש.
- ‏Gross edge חיובי אך Net edge שלילי לאחר execution realism.
- ‏ה־edge קיים רק ב־in-sample ולא שורד OOS.
- ‏ה־edge נעלם תחת latency שמתאימה למערכת שאנחנו באמת יכולים להפעיל.
- ‏מספר ההזדמנויות האמיתיות קטן מדי ביחס למורכבות ולסיכון.
- ‏ה־tail losses או failure modes מוחקים את הרווח המצטבר.

---

## ‏14. Metrics

### ‏Primary

- ‏`Net expected value per eligible trade`.
- ‏`Net expected value per unit time` כאשר Opportunity frequency נמדדת בנפרד.
- ‏`Drawdown / tail loss` ביחס ל־Risk policy.

### ‏Execution-Critical

- ‏Signal-to-decision latency.
- ‏Decision-to-order latency.
- ‏Order-to-fill latency.
- ‏Fill ratio / partial-fill ratio.
- ‏Realized slippage.
- ‏Round-trip all-in cost.

### ‏Predictive Diagnostics

- ‏Forward return by rank bucket.
- ‏Top-1 versus Top-N separation.
- ‏Time-to-first-profit.
- ‏Time-to-target.
- ‏MFE / MAE.
- ‏Opportunity count per hour/day.

### ‏Diagnostic Only, Not Sufficient Alone

- ‏Hit rate.
- ‏Gross PnL.
- ‏Raw momentum magnitude.
- ‏Number of trades.
- ‏Scanner score.

---

## ‏15. Failure Modes

- ‏`Winner by rank, loser by execution` — המועמד טוב תאורטית אך Spread/Slippage מוחקים את ה־edge.
- ‏`Stale winner` — המועמד היה הטוב ביותר בזמן החישוב אך ה־signal כבר דעך לפני הכניסה.
- ‏`Forced trading` — המערכת סוחרת משום שתמיד יש Rank #1.
- ‏`Metric gaming` — שיפור Hit Rate או Score בלי שיפור Net outcome.
- ‏`Pipeline coupling` — שינוי קטן ב־ranking משנה בטעות execution/risk behavior.
- ‏`Hidden cost blindness` — מחקר על Last/Gross ללא עלויות ברות־ביצוע.
- ‏`Unreplayable decision` — אי אפשר להסביר בדיעבד למה המערכת פעלה.
- ‏`Opportunity illusion` — Backtest מראה הרבה הזדמנויות שלא היו ניתנות לביצוע בזמן אמת.

---

## ‏16. User-Specific Application

‏לרובוט שלנו, המשמעות היא:

1. ‏לסרוק Universe רחב ולזהות Candidates, אבל לא להניח שצריך להיות מושקע בכל רגע.
2. ‏להחזיק `NO TRADE` כהחלטה תקינה כאשר אין Edge בר־ביצוע.
3. ‏להפריד בין “מי עולה הכי חזק” לבין “במי אפשר להיכנס ולצאת עם Net Edge”.
4. ‏למדוד latency במילי־שניות ושניות, בלי להפוך את הפרויקט למירוץ HFT של microseconds.
5. ‏לצאת כאשר ה־thesis הקצר מתיישן — מחיר שלא מתקדם בזמן הצפוי הוא Evidence רלוונטי, לא מצב ניטרלי בהכרח.
6. ‏לבנות את המערכת כך שכל Rule משמעותי יהיה ניתן לבדיקה, השוואה והחלפה.

---

## ‏17. Confidence

### ‏Architecture/Process Recommendation — `High`

‏הביטחון גבוה בעקרונות: Separation of concerns, ‏`NO TRADE`, מדידת Net, observability ו־evidence-driven promotion הם Baseline שמקטין טעויות מחקר ותפעול.

### ‏Strategy Profitability — `Low / Unproven`

‏אין כרגע בסיס להצהיר שהאסטרטגיה עצמה רווחית. זה נשאר Hypothesis עד Validation מלא.

### ‏Exact Ranking / Threshold / Execution Policy — `Low at this stage`

‏הפרק הראשון אינו מספק Evidence מספיק כדי לבחור Thresholds, Weights, Orders או Execution tactics ספציפיים. החלטות אלה יתקבלו ב־Recommendation Sheets הייעודיים.

---

## ‏18. Time-Sensitive Facts

‏הקובץ הזה אינו נשען על Capability ספציפי של Broker או Venue לצורך ברירת המחדל הארכיטקטונית.

‏לפני שימוש תפעולי בהמלצות עתידיות יש לאמת עדכנית לפחות:

- ‏Broker order capabilities.
- ‏Market-data subscriptions ו־entitlements.
- ‏Fees / commissions / exchange fees.
- ‏Trading/session rules.
- ‏API rate limits והתנהגות reconnect/order status.
- ‏Regulatory/account constraints הרלוונטיים לחשבון ולשוק.

---

## ‏19. Decision Summary

```text
P0:
Do not take live risk without end-to-end observability, net-cost accounting,
reconstructable decisions, execution state and explicit safety/risk gates.

P1:
Use a modular whole-market selection pipeline.
Rank candidates, then apply an absolute TRADE / NO TRADE gate.
Optimize repeatable executable NET edge, not gross movement or trade count.

P2+:
Add complexity only when measured evidence shows which baseline limitation
it improves and the improvement survives OOS + realistic execution.
```

---

## ‏20. What Would Change This Recommendation

‏נשנה את ה־Baseline אם Evidence יראה באופן עקבי שאחת מהחלופות נותנת תוצאה טובה יותר **Net**, בלי לפגוע בצורה לא־סבירה ב־Risk, observability, robustness או operational safety.

‏לדוגמה, אפשר לקדם Challenger אם:

```text
net EV improves materially
AND result survives OOS
AND execution realism does not erase the gain
AND latency/cost stress remains acceptable
AND failure surface remains controllable
```

‏זהו Baseline למחקר ולבניית המערכת — לא מסקנה שהאסטרטגיה רווחית.
