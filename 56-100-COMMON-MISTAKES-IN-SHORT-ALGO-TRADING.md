# ‏שלב 56 — `100 Common Mistakes in Short Algo Trading`: הטעויות שמוחקות Edge לפני שהן נראות כמו באג

> ‏מטרת הפרק: לרכז מאה טעויות נפוצות, subtle failure modes ו־anti-patterns במסחר אלגוריתמי קצר־טווח — משלב המחקר והנתונים ועד Scanner, Execution, Orders, Latency, Risk ו־Operations — כדי שנוכל לזהות מוקדם מתי מערכת “נראית מקצועית” אבל בפועל בונה fake alpha, stale decisions או execution שלא ניתן לממש.
>
> ‏העיקרון המרכזי: **הסכנה הגדולה ביותר אינה תמיד טעות גסה. לעיתים המערכת עושה בדיוק מה שבנינו — אבל ההנחות שמאחוריה שגויות.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏איך להשתמש בפרק

‏לכל טעות נשאל שלוש שאלות:

1. ‏למה היא נראית סבירה בזמן הפיתוח?
2. ‏איך היא יכולה למחוק `Net Edge` או ליצור false confidence?
3. ‏איזה Test, Metric, Guard או RCA יכול לחשוף אותה?

‏הפרק יכול לשמש גם:

- ‏`Pre-Live Checklist`.
- ‏`RCA Index` לאחר כשל.
- ‏Review לפני שינוי Strategy.
- ‏Review לפני הגדלת Capital או Position Size.
- ‏מקור לרעיונות ל־fault injection ול־golden scenarios.

---

# ‏חלק א — Research ו־Backtest

## ‏1. להתאהב ב־Backtest יפה

‏הטעות: לראות equity curve חלקה ולהניח שמצאנו Edge.

‏למה זה מסוכן: curve יכולה להיבנות מ־leakage, overfitting, unrealistic fills או data bias.

‏במקום: לפרק את התוצאה ל־prediction, execution, costs, latency, regimes ו־out-of-sample stability.

## ‏2. לשנות את ההשערה אחרי שרואים את התוצאה

‏הטעות: להריץ ניסוי, לראות תוצאה מעניינת, ואז להסביר בדיעבד שזה בדיוק מה שרצינו לבדוק.

‏במקום: לשמור מראש `Hypothesis`, ‏Primary Metric ו־Decision Rule.

## ‏3. לעשות יותר מדי ניסויים ולזכור רק את המנצחים

‏הטעות: parameter hunting במסווה של exploration.

‏במקום: לשמור גם failures, מספר ניסויים ו־multiple-testing risk.

## ‏4. להשתמש שוב ושוב באותו Holdout

‏הטעות: לקרוא ל־dataset “test” אחרי שכבר קיבלנו עליו עשרות החלטות.

‏במקום: frozen holdout אמיתי או rolling/walk-forward discipline.

## ‏5. למדוד רק Average Return

‏הטעות: להסתיר tails, skew, regimes ו־rare losses בתוך ממוצע אחד.

‏במקום: distribution, quantiles, hit rate, expected value, MFE/MAE, time-to-profit ו־drawdowns.

## ‏6. לא למדוד `Net` אחרי כל העלויות

‏הטעות: לחגוג gross edge של כמה basis points כאשר spread/slippage/fees אוכלים אותו.

‏במקום: `NetExecutableEdge` בכל ניסוי משמעותי.

## ‏7. להניח Fill במחיר הרצוי

‏הטעות: Backtest שמשתמש ב־touch כאילו הוא fill.

‏במקום: latency, queue, fill probability, partial fills ו־price movement during execution.

## ‏8. להתעלם מ־Missed Opportunity

‏הטעות: passive order שלא התמלא נרשם כאפס במקום כעלות הזדמנות.

‏במקום: למדוד outcomes של `filled`, ‏`unfilled`, ‏`late-filled` ו־`canceled` בנפרד.

## ‏9. להשתמש ב־future information בעקיפין

‏הטעות: join, resampling, normalization או feature window שמכניסים מידע שטרם היה ידוע.

‏במקום: `As-Known-At` semantics ו־causal cutoff מפורש.

## ‏10. לשכוח Survivorship Bias

‏הטעות: לבדוק רק Symbols שקיימים היום.

‏במקום: historical universe אמיתי לכל timestamp.

---

# ‏חלק ב — Labels ו־Prediction

## ‏11. להשתמש ב־`Last` עתידי במקום מחיר שניתן היה לבצע בו

‏הטעות: label חיובי שאינו executable.

‏במקום: גם forward mid/quote וגם executable entry/exit labels.

## ‏12. לבחור Horizon שלא מתאים ל־Strategy

‏הטעות: לנבא 5 דקות עבור רובוט שמחזיק 3 שניות.

‏במקום: labels לפי 100ms/500ms/1s/2s/5s/10s וכו' רק כשה־data fidelity תומך בהם.

## ‏13. להסתכל רק על סוף ה־Horizon

‏הטעות: return אחרי 10 שניות מסתיר מה קרה בדרך.

‏במקום: `time_to_first_profit`, ‏MFE, MAE, time-to-target ו־giveback.

## ‏14. להתעלם מהזמן שבו ה־signal עדיין חי

‏הטעות: feature מנבא, אבל רק ל־100ms בעוד pipeline לוקח 150ms.

‏במקום: למדוד `SignalHalfLife` ו־Latency Pressure.

## ‏15. להניח ש־Top 1 עדיף כי הוא Top 1

‏הטעות: winner's curse בקצה ההתפלגות.

‏במקום: rank separation, stability, calibration ו־Top-K diagnostics.

## ‏16. למדוד Accuracy במקום Economics

‏הטעות: direction hit rate גבוה עם gains קטנים ו־losses גדולים.

‏במקום: net expected value ו־distribution של outcomes.

## ‏17. להתעלם מ־Regime Dependence

‏הטעות: feature טוב בפתיחה מקבל אותו weight באמצע יום שקט.

‏במקום: regime-conditioned evaluation.

## ‏18. להניח ש־Correlation = Tradable Edge

‏הטעות: signal קשור למחיר אבל לא מספיק מוקדם או לא מספיק גדול אחרי costs.

‏במקום: time ordering + execution-aware validation.

## ‏19. להוסיף Features כי “יותר מידע טוב יותר”

‏הטעות: feature redundancy ו־complexity ללא incremental value.

‏במקום: ablation ו־incremental contribution.

## ‏20. לא לפרוש Feature שאיבד ערך

‏הטעות: feature נשאר כי פעם היה טוב.

‏במקום: drift monitoring, shadow retirement ו־revalidation.

---

# ‏חלק ג — Market Data

## ‏21. להתייחס ל־`Last` כאילו הוא מצב השוק כולו

‏הטעות: print אחד יכול להיות stale, odd-lot, venue-specific או לא executable.

‏במקום: contextualize עם quotes, age, spread, trade conditions ו־activity.

## ‏22. להתייחס ל־`Bid/Ask Size` כאמת קבועה

‏הטעות: displayed size יכול להיעלם מיד.

‏במקום: persistence, depletion, replenishment ו־book dynamics.

## ‏23. לא להבדיל `EventTime` מ־`ReceiveTime`

‏הטעות: feature נראה מהיר כי השעונים מעורבבים.

‏במקום: timestamps נפרדים ומדידה end-to-end.

## ‏24. להתעלם מ־Sequence Gaps

‏הטעות: state “נראה תקין” אבל חסרים events באמצע.

‏במקום: gap detection, resync ו־quality downgrade.

## ‏25. לעבד Duplicate Events פעמיים

‏הטעות: volume/activity/flow מנופחים.

‏במקום: idempotent ingestion ו־dedup policy.

## ‏26. למיין out-of-order events כאילו הגיעו בזמן

‏הטעות: live ו־replay נותנים results שונים.

‏במקום: explicit ordering policy ו־bounded lateness.

## ‏27. להשתמש ב־Snapshot קרוע

‏הטעות: `Bid` מרגע אחד ו־`Ask` מרגע אחר יוצרים spread או imbalance שלא באמת התקיימו יחד.

‏במקום: logical snapshot consistency.

## ‏28. לא למדוד Quote Age

‏הטעות: quote חוקי תחבירית אבל stale עסקית.

‏במקום: per-field freshness gates.

## ‏29. להניח שכל Provider רואה אותו שוק

‏הטעות: coverage, aggregation ו־venue scope שונים.

‏במקום: provenance ו־cross-provider comparison.

## ‏30. להחליף Feed בלי Revalidation

‏הטעות: אותו feature name מקבל semantics שונים.

‏במקום: provider fingerprint + recalibration.

---

# ‏חלק ד — Scanner ו־Cross-Sectional Ranking

## ‏31. לחשב הכול מחדש לכל 4,000 Symbols בכל tick

‏הטעות: עבודה מיותרת יוצרת stale decisions.

‏במקום: incremental state ו־cheap fast path.

## ‏32. להריץ Deep Analysis על כל השוק

‏הטעות: CPU/Data cost מוחקים freshness.

‏במקום: candidate funnel ו־Top-N enrichment.

## ‏33. להשוות Symbols עם timestamps שונים מאוד

‏הטעות: ranking cross-sectional שאינו snapshot אמיתי.

‏במקום: freshness window ו־coverage gate.

## ‏34. לא למדוד `Fresh Coverage`

‏הטעות: Top 1 נבחר מתוך subset מעודכן בלבד בלי לדעת זאת.

‏במקום: explicit denominator ו־minimum coverage.

## ‏35. להשתמש ב־raw values שלא ניתנים להשוואה בין מניות

‏הטעות: volume, depth או spread מושפעים מאוד ממחיר וגודל Symbol.

‏במקום: normalization, percentiles, notional metrics ו־own-history baselines.

## ‏36. לא לקבע Tie-Breaker דטרמיניסטי

‏הטעות: אותו state מייצר winner אחר בין runs.

‏במקום: stable ordering contract.

## ‏37. לבחור Top 1 בלי לבדוק Separation

‏הטעות: מקום ראשון ומקום שני כמעט זהים אבל מוצגים כהחלטה ברורה.

‏במקום: rank gap/confidence.

## ‏38. לא למדוד Rank Churn

‏הטעות: winner משתנה כל 100ms והמערכת רודפת אחריו.

‏במקום: persistence, hysteresis ו־minimum dwell.

## ‏39. להניח שה־highest score הוא גם הכי executable

‏הטעות: symbol מנבא מצוין אבל spread/queue/impact גרועים.

‏במקום: Prediction Rank ו־Executable Rank נפרדים.

## ‏40. לא לאפשר `NO TRADE`

‏הטעות: המערכת תמיד מוצאת “winner” גם כשכל האפשרויות גרועות.

‏במקום: absolute thresholds ו־quality gates.

---

# ‏חלק ה — Momentum ו־Microstructure

## ‏41. לפרש כל עלייה קצרה כ־Momentum

‏הטעות: noise, one-print jump או spread bounce נראים כמו acceleration.

‏במקום: multi-horizon consistency ו־activity confirmation.

## ‏42. להסתכל רק על Return ולא על Path

‏הטעות: אותה תשואה יכולה להגיע בצורה חלקה או בקפיצה שכבר נגמרה.

‏במקום: shape, acceleration, pullback, persistence ו־age.

## ‏43. להתעלם מ־Trade Activity

‏הטעות: price move ללא participation מספיק עשוי להיות fragile.

‏במקום: trade count, notional rate ו־activity surprise.

## ‏44. להתייחס ל־Book Imbalance כאות כיוון ודאי

‏הטעות: displayed liquidity אינה התחייבות.

‏במקום: dynamics + price response + flow confirmation.

## ‏45. לבלבל `Book Imbalance`, ‏`Order Flow Imbalance` ו־`Trade Flow Imbalance`

‏הטעות: שלושה concepts שונים נשמרים תחת אותו field.

‏במקום: semantics ושמות מפורשים.

## ‏46. לפרש `Microprice` כ־Fair Value אמיתי

‏הטעות: estimator קצר־טווח הופך ל־price target.

‏במקום: calibration מול next-mid/executable outcomes.

## ‏47. לפרש Print גדול כסיבה מספקת לעסקה

‏הטעות: trade בודד אינו מספר את כל flow context.

‏במקום: persistence, response, surrounding book ו־unknown classification.

## ‏48. להתעלם מ־Absorption

‏הטעות: aggression חזקה אך price לא מתקדם — ועדיין scanner קורא לזה continuation.

‏במקום: flow-to-price response.

## ‏49. להתעלם מ־Exhaustion

‏הטעות: momentum נראה חי לפי return אבל activity/flow כבר נחלשים.

‏במקום: acceleration/deceleration features.

## ‏50. להתייחס ל־Market Microstructure כאילו הוא קבוע בכל Symbol

‏הטעות: one-tick, multi-tick, thin ו־liquid names מתנהגים אחרת.

‏במקום: symbol/regime conditioned calibration.

---

# ‏חלק ו — Entry ו־Orders

## ‏51. לבחור Order Type לפי הרגל

‏הטעות: תמיד `Market` או תמיד `Limit` בלי קשר ל־urgency ו־edge.

‏במקום: execution objective מפורש.

## ‏52. לחשוב ש־Limit Order תמיד “בטוח” יותר

‏הטעות: price protection קיימת, אבל missed fills ו־adverse selection יכולים להיות יקרים.

‏במקום: למדוד opportunity cost ו־markout.

## ‏53. לחשוב ש־Market Order תמיד “מהיר” ולכן עדיף

‏הטעות: אין hard price protection.

‏במקום: marketable limit עם bounds כאשר מתאים למחקר ולברוקר.

## ‏54. להתעלם מ־Order TTL

‏הטעות: signal פג אבל order נשאר working.

‏במקום: signal-aware expiration/revalidation.

## ‏55. לעשות Cancel/Replace בתדירות גבוהה מדי

‏הטעות: מאבדים queue priority ורודפים אחרי price.

‏במקום: replace policy עם expected-value justification.

## ‏56. להניח `CancelRequested = Canceled`

‏הטעות: fill יכול להגיע בזמן ה־race.

‏במקום: state machine מפורש.

## ‏57. לא לטפל ב־Partial Fill כמצב רגיל

‏הטעות: position/exposure logic נשברת באמצע.

‏במקום: remaining quantity ו־pending exposure תמידיים.

## ‏58. לא להגדיר Hard Price Bounds

‏הטעות: execution רודף אחרי signal שכבר ברח.

‏במקום: max acceptable price/slippage budget.

## ‏59. להחליף Order Type בלי למדוד את ההשפעה על Economics

‏הטעות: fill rate עולה אבל markout ו־costs מחמירים.

‏במקום: champion/challenger לפי net retained edge.

## ‏60. להניח שהוראה מתקדמת בהכרח טובה יותר

‏הטעות: complexity, broker semantics ו־hidden assumptions גדלים.

‏במקום: simple champion, advanced challenger.

---

# ‏חלק ז — Execution ו־Fills

## ‏61. לחשוב ש־`Sent` אומר שהברוקר קיבל

‏הטעות: side effect חיצוני אינו transaction מקומי.

‏במקום: `UNKNOWN_EFFECT` + reconciliation.

## ‏62. Retry עיוור אחרי timeout

‏הטעות: duplicate order.

‏במקום: stable intent identity ו־broker state query.

## ‏63. לא להפריד `IntentId` מ־Broker Order ID

‏הטעות: retry/replacement מבלבלים business intent עם transport attempt.

‏במקום: stable business identity + attempt IDs.

## ‏64. למדוד Fill Rate בלי Post-Fill Outcome

‏הטעות: fills יכולים להיות רעילים.

‏במקום: markout curve.

## ‏65. להתעלם מ־Adverse Selection

‏הטעות: passive fill במחיר טוב נראה הצלחה למרות שהמחיר מיד נע נגדנו.

‏במקום: expected adverse-selection cost.

## ‏66. להסתכל רק על Entry Fill

‏הטעות: strategy קצרה דורשת גם Exit executable ומהיר.

‏במקום: round-trip execution quality.

## ‏67. לא למדוד `Time To Flat`

‏הטעות: exit “נשלח מהר” אבל position נשאר פתוח.

‏במקום: decision-to-flat metric.

## ‏68. להניח Local Position = Broker Position

‏הטעות: disconnect/restart יכול ליצור divergence.

‏במקום: broker truth + reconciliation.

## ‏69. לא לשמור Pending Exposure בזמן Orders פתוחים

‏הטעות: risk engine חושב שיש פחות exposure ממה שבאמת יכול להיווצר.

‏במקום: reserve risk לפני side effect.

## ‏70. להתעלם מ־Self-Interaction

‏הטעות: כמה intents שלנו מתחרים או מכפילים exposure באותו Symbol.

‏במקום: symbol-level execution ownership/invariants.

---

# ‏חלק ח — Latency ו־Performance

## ‏71. לרדוף אחרי Microseconds בלי למדוד Signal Half-Life

‏הטעות: optimization theatre.

‏במקום: `EndToEndLatency / SignalHalfLife`.

## ‏72. למדוד רק Average Latency

‏הטעות: P99 הוא בדיוק המקום שבו fast market פוגש אותנו.

‏במקום: P50/P95/P99/MAX ו־jitter.

## ‏73. לעשות Microbenchmark לפונקציה ולהסיק על המערכת

‏הטעות: bottleneck אמיתי נמצא ב־network, queue או broker.

‏במקום: distributed/end-to-end profiling.

## ‏74. לתת ל־Unbounded Queue לצבור עבודה

‏הטעות: throughput נראה גבוה בזמן שהחלטות נעשות stale.

‏במקום: bounded queues, deadlines ו־load shedding.

## ‏75. לתת עבודה ישנה לנצח עבודה חדשה

‏הטעות: scanner מסיים feature שכבר אינו רלוונטי.

‏במקום: stale-work cancellation.

## ‏76. לעשות Parallelism בלי לשמור Ordering

‏הטעות: state per-symbol נהיה לא דטרמיניסטי.

‏במקום: partitioned/single-writer processing לפי key.

## ‏77. להשתמש ב־Locks בלי למדוד Contention

‏הטעות: latency spikes בזמן bursts.

‏במקום: profile contention והקטנת shared mutable state.

## ‏78. להניח `lock-free` תמיד מהיר יותר

‏הטעות: complexity, retries ו־cache contention יכולים להחמיר ביצועים.

‏במקום: benchmark workload אמיתי.

## ‏79. להתעלם מ־GC Pauses

‏הטעות: allocation rate קטן בממוצע אבל burst יוצר tail latency.

‏במקום: allocation profiling ו־GC telemetry.

## ‏80. לייעל Throughput על חשבון Freshness

‏הטעות: המערכת מעבדת יותר events אבל מאוחר מדי.

‏במקום: queue age ו־decision age כמדדים עסקיים.

---

# ‏חלק ט — Risk ו־Capacity

## ‏81. להגדיל Position Size לינארית כי Backtest קטן עובד

‏הטעות: impact/capacity אינם לינאריים.

‏במקום: capacity curve ו־controlled ramp.

## ‏82. להשתמש רק ב־Account Capital לקביעת Size

‏הטעות: ignore liquidity, impact, exit capacity ו־risk budget.

‏במקום: `min(Risk, Liquidity, Impact, Exposure, Capital)`.

## ‏83. לחשוב ש־Spread קטן אומר שהמניה זולה לביצוע

‏הטעות: depth דק ו־impact גבוה.

‏במקום: effective executable cost.

## ‏84. לחשוב ש־Volume גבוה אומר Capacity גבוהה כרגע

‏הטעות: volume historical אינו depth near touch.

‏במקום: participation/depth/resilience בזמן ההחלטה.

## ‏85. להסתכל רק על Entry Capacity

‏הטעות: קל להיכנס וקשה לצאת.

‏במקום: exit/stress capacity.

## ‏86. לא להגדיר Daily/Session Risk Limits

‏הטעות: הרבה עסקאות קטנות יכולות לצבור loss גדול.

‏במקום: layered risk budget.

## ‏87. להתעלם מ־Correlated Exposure

‏הטעות: כמה Symbols שונים מגיבים לאותו factor/market move.

‏במקום: aggregate exposure context.

## ‏88. לא להקטין Risk כש־Data Quality יורדת

‏הטעות: confidence קבוע למרות uncertainty גבוהה.

‏במקום: degrade/block new entries.

## ‏89. להניח Kill Switch אחד מספיק

‏הטעות: `HALT` כללי אינו מחליף `BLOCK_NEW_ENTRIES`, ‏`EXIT_ONLY`, ‏`CANCEL_ALL`, ‏`FLATTEN` וכו'.

‏במקום: scoped safety levels.

## ‏90. להחזיר Trading מהר מדי אחרי Incident

‏הטעות: restart אינו הוכחה שהמצב בטוח.

‏במקום: reconciliation + resume proof.

---

# ‏חלק י — Production, Operations ו־Learning Loop

## ‏91. להפעיל Live עם Config לא Versioned

‏הטעות: אי אפשר לשחזר איזו Strategy באמת רצה.

‏במקום: immutable versioned config artifact.

## ‏92. לא להפריד `PAPER` ו־`LIVE` ברמה קשיחה

‏הטעות: operator error הופך מיד ל־financial side effect.

‏במקום: environment identity + hard guards.

## ‏93. לשמור Secrets בלוגים או Config רגיל

‏הטעות: security incident הופך ל־trading risk.

‏במקום: secret store, redaction ו־rotation.

## ‏94. לא לדעת מי או מה שלח Order

‏הטעות: אין auditability.

‏במקום: correlation IDs, build version, strategy version ו־operator/system identity.

## ‏95. להסתפק ב־`Process Alive`

‏הטעות: process חי אבל feed stale או broker disconnected.

‏במקום: `SafeToTrade` readiness נפרד.

## ‏96. לא לבצע RCA ל־Near Miss

‏הטעות: מחכים להפסד אמיתי כדי ללמוד.

‏במקום: near-miss → root cause → control/test.

## ‏97. לתקן סימפטום מקומי בלי לבדוק אזורים דומים

‏הטעות: אותו class of bug נשאר במקומות אחרים.

‏במקום: systemic RCA ו־pattern search.

## ‏98. לא להשוות Live מול Replay/Shadow באופן רציף

‏הטעות: drift מצטבר בשקט.

‏במקום: production fingerprint ו־decision comparison.

## ‏99. לחשוב שהמערכת “גמורה” אחרי שהיא רווחית תקופה קצרה

‏הטעות: market regimes, provider behavior, latency ו־costs משתנים.

‏במקום: continuous validation, champion/challenger ו־feature retirement.

## ‏100. לנסות להיות חכמים יותר במקום להיות מדידים יותר

‏הטעות: עוד indicator, עוד rule ועוד model לפני שהוכחנו מה באמת עובד.

‏במקום:

```text
Observe
→ Hypothesize
→ Measure
→ Reproduce
→ Stress
→ Execute realistically
→ Review
→ Keep only what survives
```

‏זהו anti-pattern העל: complexity ללא Evidence.

---

# ‏20 טעויות שהכי מסוכנות דווקא לרובוט שלנו

‏מתוך ה־100, אלה דורשות תשומת לב מיוחדת למערכת שמחפשת momentum של מילישניות–שניות:

1. ‏`SignalHalfLife` קצר יותר מה־pipeline.
2. ‏Top 1 נבחר על data שלא מעודכן באותו זמן.
3. ‏`Last` נראה חיובי אבל spread הופך את העסקה לשלילית.
4. ‏Rank winner מתחלף מהר מדי לפני submit.
5. ‏Fill passive מגיע דווקא בגלל adverse selection.
6. ‏Marketable entry רודף אחרי מהלך שכבר הסתיים.
7. ‏Exit logic מגיב מאוחר מדי ל־giveback.
8. ‏`CancelRequested` נתפס בטעות כ־Canceled.
9. ‏Partial fill לא נכנס לחישוב exposure.
10. ‏Queue age גדל בזמן market burst.
11. ‏Garbage collection יוצר tail spike בדיוק באירוע חשוב.
12. ‏Provider gap יוצר momentum מדומה.
13. ‏Book imbalance נלקח ברצינות למרות שהוא transient.
14. ‏Cross-sectional ranking נעשה על coverage חלקי.
15. ‏Backtest מניח fill שאי אפשר לקבל בפועל.
16. ‏Round-trip cost גדול מה־target profit.
17. ‏Exit capacity נמוכה מ־entry capacity.
18. ‏`NO TRADE` אינו אפשרות ולכן נלקחת הזדמנות חלשה.
19. ‏Strategy complexity גדלה מהר יותר מה־evidence.
20. ‏המערכת אוספת metrics יפים אבל לא יכולה להסביר למה עסקה מסוימת נכשלה.

---

# ‏Practitioner Secrets — דפוסים שחוזרים שוב ושוב

## ‏1. הבעיה נמצאת הרבה פעמים בגבול בין שתי מערכות

‏לא בתוך Strategy ולא בתוך Broker, אלא במעבר ביניהם:

```text
Feed → Canonical State
Scanner → Execution
Local State → Broker State
Cancel → Fill
Restart → Reconciliation
Signal → Order
Fill → Exit
```

## ‏2. Metrics חיוביים יכולים להיות Anti-Metrics

‏דוגמאות:

- ‏Fill Rate גבוה מדי יכול לרמוז על toxic fills.
- ‏Latency ממוצעת נמוכה יכולה להסתיר P99 גרוע.
- ‏Win Rate גבוה יכול להסתיר payoff שלילי.
- ‏Coverage גבוה יכול להסתיר symbol-specific staleness.
- ‏Sharpe גבוה יכול להגיע מ־underestimated costs.

## ‏3. ככל שה־Horizon קצר יותר, כך Timing הוא חלק מה־Feature

‏במסחר של שניות או פחות:

```text
same value
at a different age
!= same signal
```

‏לכן feature ללא age/provenance אינו feature מלא.

## ‏4. Execution הוא חלק מה־Alpha

‏אם strategy מצליחה רק בהנחה של fills אידאליים, אין לנו strategy ניתנת למימוש.

## ‏5. Complexity צריכה לשלם שכר דירה

‏כל feature, queue model, order tactic, route או optimization חדש צריכים להוכיח incremental net value.

---

# ‏RCA Taxonomy מוצע לפרק הזה

```text
RS_LEAKAGE
RS_OVERFIT
RS_MULTIPLE_TESTING
DT_STALE
DT_GAP
DT_DUPLICATE
DT_ORDERING
SC_PARTIAL_COVERAGE
SC_RANK_CHURN
SC_TOP1_WINNERS_CURSE
SG_DECAY
BK_TRANSIENT
OF_MISCLASSIFIED
EX_STALE_INTENT
EX_DUPLICATE
EX_CANCEL_FILL_RACE
EX_PARTIAL_FILL
EX_ADVERSE_SELECTION
EX_EXIT_DELAY
LT_QUEUE_AGE
LT_TAIL_SPIKE
RK_PENDING_EXPOSURE
RK_CAPACITY
OP_WRONG_ENV
OP_RECONCILIATION
OP_CONFIG_DRIFT
OP_NEAR_MISS
```

‏המטרה אינה להשתמש בכל הקודים מיד, אלא ליצור vocabulary אחיד כאשר מתחילים לנתח failures.

---

# ‏Checklist קצר לפני שמאשימים את ה־Strategy

‏לפני שאומרים “ה־signal לא עובד”, בודקים:

- ‏האם הנתונים היו fresh ונכונים?
- ‏האם ה־Universe וה־coverage היו תקינים?
- ‏האם ה־ranking היה דטרמיניסטי?
- ‏האם ה־signal עדיין היה חי בזמן ההחלטה?
- ‏האם order נשלח כפי שהתכוונו?
- ‏האם fill היה executable realistic?
- ‏האם הייתה adverse selection?
- ‏האם exit הגיע בזמן?
- ‏האם costs/impact חושבו נכון?
- ‏האם position/exposure המקומיים התאימו לברוקר?
- ‏האם היה incident תפעולי או latency spike?

‏רק לאחר מכן נכון להסיק שהבעיה הייתה באמת ב־Alpha.

---

# ‏מה צריך לזכור בעל־פה

- ‏`Gross Edge` אינו `Net Edge`.
- ‏`Touch` אינו `Fill`.
- ‏`Sent` אינו `Accepted`.
- ‏`CancelRequested` אינו `Canceled`.
- ‏`Filled` אינו בהכרח `Good Fill`.
- ‏`Last` אינו מחיר ביצוע.
- ‏`Bid/Ask Size` אינו התחייבות.
- ‏`Top 1` אינו בהכרח opportunity טובה.
- ‏`Fast` אינו בהכרח fresh.
- ‏`Live` אינו `Replay`.
- ‏`Process Alive` אינו `Safe To Trade`.
- ‏`Complex` אינו `Professional`.
- ‏`More Trades` אינו `More Edge`.
- ‏`More Features` אינו `More Information`.
- ‏`Higher Fill Rate` אינו בהכרח Execution טוב יותר.
- ‏`More Capital` אינו מכפיל Profit לינארית.
- ‏`NO TRADE` הוא החלטה לגיטימית.

---

# ‏יישום לרובוט שלנו

‏למערכת שלנו יש יעד ספציפי:

```text
find a very short-lived opportunity
→ detect it while fresh
→ rank it against the market
→ prove it is executable
→ enter within hard bounds
→ monitor decay continuously
→ exit before the edge disappears
→ measure the entire round trip net
```

‏לכן ארבעת ה־anti-patterns הקריטיים ביותר עבורנו הם:

1. ‏`stale signal` שממשיך ל־execution.
2. ‏winner שנבחר מתוך universe שאינו fresh מספיק.
3. ‏fill שנראה טוב במחיר אבל רע ב־post-fill markout.
4. ‏exit שנשלח בזמן אבל לא נהיה `flat` בזמן.

‏הם מקבלים עדיפות גבוהה יותר מאופטימיזציות אקזוטיות או models מורכבים.

---

# ‏העיקרון האחרון

> ‏**מערכת מקצועית אינה זו שלא טועה. היא זו שמזהה מהר שהנחה נשברה, יודעת לעצור יצירת risk, יכולה לשחזר בדיוק מה קרה, ומשתמשת בכל failure כדי לחזק את המחקר, הבדיקות וה־production controls.**

---

# ‏מעבר לשלב הבא

‏בשלב 57 נעבור לצד המשלים: במקום “מאה טעויות”, נבנה `100 Practical Tips for a Personal Algo Builder` — הרגלים, קיצורי דרך נכונים, סדרי עדיפויות ו־practitioner techniques שעוזרים לבנות מערכת טובה יותר בלי להסתבך שלא לצורך.
