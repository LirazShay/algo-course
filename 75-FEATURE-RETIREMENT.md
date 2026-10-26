# ‏שלב 75 — `Feature Retirement`: מתי Feature מפסיק להצדיק את מקומו במערכת

> ‏מטרת הפרק: לבנות Lifecycle מקצועי ל־Features כך שלא רק נדע להוסיף Feature חדש, אלא גם לזהות מתי Feature קיים הפך למיותר, חלש, יקר, שביר, כפול, מיושן או מסוכן — ולהוציא אותו מהמערכת בצורה מבוקרת, מדידה וניתנת לשחזור.
>
> ‏העיקרון המרכזי: **Feature אינו נכס נצחי. הוא Hypothesis ממומש בקוד, עם עלות חישובית, תלות בנתונים, assumptions ו־maintenance burden. הוא צריך להמשיך להצדיק את קיומו באמצעות Incremental Decision Value ולא באמצעות היסטוריה או הרגל.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

## ‏1. למה בכלל צריך `Feature Retirement`

‏מערכת מחקרית נוטה לצבור Features מהר יותר משהיא מוחקת אותם.

‏כל רעיון חדש הופך בקלות ל:

```text
New idea
→ New feature
→ Small improvement
→ Keep forever
```

‏אחרי זמן מתקבלת מערכת שקשה להסביר, לבדוק, לתחזק ולהריץ בזמן.

---

## ‏2. `Feature Debt`

‏`Feature Debt` הוא החוב המצטבר של Features שכבר אינם מצדיקים את העלות שהם מוסיפים.

‏העלות יכולה להיות:

- ‏CPU.
- ‏Memory.
- ‏Latency.
- ‏Data dependency.
- ‏Storage.
- ‏Testing.
- ‏Operational complexity.
- ‏Debugging complexity.
- ‏Research confusion.

---

## ‏3. Feature הוא חוזה, לא רק מספר

‏Feature אמיתי כולל לפחות:

```text
Name
Definition
Inputs
Timestamp semantics
Freshness
Missing semantics
Warmup
Version
Cost
Expected use
Validation evidence
```

‏אם אחד מאלה לא ברור, קשה לדעת אם אפשר גם לפרוש ממנו בבטחה.

---

## ‏4. `Feature Lifecycle`

```text
IDEA
→ RESEARCH
→ SHADOW
→ ACTIVE
→ WATCH
→ DEPRECATED
→ RETIRED
→ ARCHIVED
```

‏המעבר בין המצבים צריך להיות מפורש.

---

## ‏5. `IDEA`

‏בשלב הזה יש Hypothesis בלבד.

‏אין עדיין הצדקה להכניס את ה־Feature למסלול Production.

---

## ‏6. `RESEARCH`

‏ה־Feature מחושב Offline או בסביבה מחקרית.

‏נבדקים:

- ‏Predictive value.
- ‏Incremental value.
- ‏Stability.
- ‏Cost.
- ‏Failure modes.

---

## ‏7. `SHADOW`

‏ה־Feature מחושב ב־Live path אבל אינו משנה החלטה.

‏זה מאפשר למדוד:

- ‏Freshness.
- ‏Latency.
- ‏Missingness.
- ‏Online/Offline parity.
- ‏Decision counterfactuals.

---

## ‏8. `ACTIVE`

‏ה־Feature משפיע בפועל על:

- ‏Score.
- ‏Rank.
- ‏Veto.
- ‏Entry.
- ‏Exit.
- ‏Execution.

---

## ‏9. `WATCH`

‏Feature נכנס ל־`WATCH` כאשר יש סימני היחלשות, drift או cost inflation.

‏הוא עדיין פעיל, אבל תחת בדיקה מוגברת.

---

## ‏10. `DEPRECATED`

‏ה־Feature עדיין קיים לצורך compatibility, replay או rollback, אבל אין להרחיב את השימוש בו.

---

## ‏11. `RETIRED`

‏Feature שיצא ממסלול ההחלטה הפעיל.

‏הוא לא משפיע על Production decisions חדשים.

---

## ‏12. `ARCHIVED`

‏הגדרה, קוד, version, evidence והיסטוריה נשמרים לצורכי audit/replay, אך אינם חלק מה־runtime הרגיל.

---

## ‏13. למה לא מוחקים Feature מיד

‏מחיקה מיידית יכולה לשבור:

- ‏Historical replay.
- ‏Model compatibility.
- ‏Stored snapshots.
- ‏Old experiments.
- ‏Incident RCA.
- ‏Rollback.

---

## ‏14. `Retire != Delete`

‏Retirement הוא החלטה עסקית/מחקרית.

‏Deletion הוא שלב טכני מאוחר יותר.

---

## ‏15. `Incremental Value`

‏השאלה המרכזית אינה:

```text
Does this feature correlate with outcome?
```

‏אלא:

```text
Does this feature improve decisions
beyond what the current system already knows?
```

---

## ‏16. `Standalone Value` מול `Incremental Value`

‏Feature יכול להיראות חזק לבדו, אבל להיות מיותר לחלוטין בתוך מערכת קיימת.

---

## ‏17. Redundancy

‏שני Features יכולים למדוד כמעט אותו דבר בצורות שונות.

‏לדוגמה:

```text
Return_10s
EMA_Slope_10s
ShortMomentumScore
```

‏ייתכן ששלושתם משכפלים אותו מידע.

---

## ‏18. Correlation אינה מספיקה

‏Correlation גבוהה היא סימן אפשרי ל־redundancy, אבל אינה הוכחה.

‏Feature יכול להיות correlated ועדיין להוסיף מידע בקצוות או ב־regime מסוים.

---

## ‏19. `Conditional Redundancy`

‏Feature יכול להיות מיותר ברוב הזמן אך חשוב ב־specific regime.

---

## ‏20. `Interaction Value`

‏Feature חלש לבדו יכול להיות חשוב כאשר הוא interacts עם Feature אחר.

---

## ‏21. לכן לא פורשים Feature לפי metric אחד

‏צריך evidence bundle ולא כלל יחיד.

---

## ‏22. `Feature Retirement Evidence`

‏נרצה לפחות:

```text
Predictive evidence
Incremental evidence
Decision impact
Economic impact
Operational cost
Drift evidence
Failure history
Dependency map
```

---

## ‏23. `Ablation Test`

‏מריצים את אותה מערכת:

```text
WITH feature
vs
WITHOUT feature
```

‏ומשווים.

---

## ‏24. Ablation צריך להיות End-to-End

‏לא מספיק לבדוק AUC או correlation.

‏צריך לבדוק גם:

- ‏Rank changes.
- ‏Trade/No-Trade changes.
- ‏Veto changes.
- ‏Execution outcomes.
- ‏Net edge.

---

## ‏25. `Decision Impact Rate`

```text
DecisionImpactRate = DecisionsChangedByFeature / TotalDecisions
```

‏אם Feature כמעט אף פעם לא משנה החלטה, צריך לשאול למה הוא קיים.

---

## ‏26. שינוי החלטה אינו בהכרח ערך

‏Feature יכול לשנות הרבה החלטות ולפגוע בתוצאה.

---

## ‏27. `Marginal Decision Value`

‏נרצה להעריך האם השינויים שה־Feature יוצר משפרים Outcome נטו.

---

## ‏28. `Rank Impact`

‏בודקים:

- ‏כמה פעמים Rank #1 השתנה.
- ‏כמה Top-K השתנה.
- ‏האם RankGap השתפר.
- ‏האם RankChurn עלה.

---

## ‏29. `Veto Impact`

‏אם Feature מזין Veto:

- ‏כמה trades נחסמו.
- ‏כמה חסימות היו מועילות.
- ‏כמה winners נפסלו.

---

## ‏30. `Entry Impact`

‏Feature יכול לשנות timing של Entry גם בלי לשנות Candidate.

---

## ‏31. `Exit Impact`

‏Feature יכול להיות כמעט חסר ערך ב־Entry אבל חשוב מאוד ב־Exit.

---

## ‏32. לא מערבבים Roles

‏צריך למדוד Feature לפי התפקיד האמיתי שלו.

---

## ‏33. `Economic Impact`

‏Feature שיפור סטטיסטי קטן יכול להיות חסר ערך אם הוא לא משפר:

```text
NetOutcome
CostAdjustedOutcome
EdgeRetention
```

---

## ‏34. Feature יקר יכול למחוק את הערך שלו

‏אם Feature מוסיף latency משמעותי, השיפור התחזיתי שלו עלול להיעלם לפני ה־fill.

---

## ‏35. `Feature Cost Budget`

‏לכל Feature כדאי למדוד:

- ‏CPU cost.
- ‏Memory cost.
- ‏Allocation cost.
- ‏Network dependency.
- ‏Storage cost.
- ‏Latency contribution.

---

## ‏36. `Compute Cost per Decision`

‏Feature שמחושב ל־4,000 Symbols כל 100ms יכול להיות יקר מאוד גם אם חישוב בודד זול.

---

## ‏37. `Opportunity Cost of Compute`

‏CPU שנשרף על Feature חלש אינו זמין ל־Feature חשוב או ל־Exit path.

---

## ‏38. `Critical Path Cost`

‏Feature שנמצא ב־critical path צריך להצדיק רף גבוה יותר.

---

## ‏39. `Deep Path Feature`

‏Feature כבד יכול להישאר אם הוא מחושב רק ל־Top-N ולא לכל ה־Universe.

---

## ‏40. Retirement אינו תמיד בינארי

‏אפשר לשנות Feature מ־global fast path ל־deep path במקום לפרוש לחלוטין.

---

## ‏41. `Scope Reduction`

‏אפשר לצמצם Feature ל:

- ‏Certain symbols.
- ‏Certain regimes.
- ‏Top-N only.
- ‏Entry only.
- ‏Exit only.

---

## ‏42. `Frequency Reduction`

‏Feature יכול להישאר אבל להתעדכן פחות לעיתים.

---

## ‏43. `Precision Reduction`

‏לפעמים אפשר להשתמש approximation זול יותר.

---

## ‏44. `Data Dependency Cost`

‏Feature שתלוי ב־feed נוסף מגדיל complexity גם אם החישוב עצמו פשוט.

---

## ‏45. `Dependency Fragility`

‏נבדוק:

- ‏כמה פעמים המקור חסר.
- ‏כמה פעמים stale.
- ‏כמה פעמים schema משתנה.
- ‏כמה failure modes הוא מוסיף.

---

## ‏46. `Feature Availability`

```text
FeatureAvailability = ReadyDecisions / ExpectedDecisions
```

---

## ‏47. `Feature Freshness`

‏Feature יכול להיות technically present אבל stale.

---

## ‏48. `Feature Age Distribution`

‏לא מספיק p50.

‏נבדוק גם:

- ‏p95.
- ‏p99.
- ‏max.

---

## ‏49. `Missingness Pattern`

‏Missing אינו בהכרח random.

‏אם Feature חסר דווקא בשווקים מהירים, זה יכול להטות מחקר.

---

## ‏50. `Missing Not At Random`

‏זו אחת הסיבות המסוכנות לפרישה או redesign.

---

## ‏51. `Feature Drift`

‏התפלגות Feature יכולה להשתנות עם הזמן.

---

## ‏52. `Input Drift`

‏ה־inputs עצמם השתנו.

---

## ‏53. `Definition Drift`

‏הקוד השתנה בלי שהשם או version שונו.

---

## ‏54. `Semantic Drift`

‏אותו מספר כבר מייצג משמעות שונה בגלל שינוי market structure או provider semantics.

---

## ‏55. `Predictive Drift`

‏הקשר בין Feature לבין outcome נחלש.

---

## ‏56. `Decision Drift`

‏Feature עדיין predictive, אבל כבר כמעט לא משנה החלטה בגלל Features חדשים שנוספו.

---

## ‏57. `Economic Drift`

‏Feature ממשיך לחזות נכון, אך edge כבר קטן מדי אחרי costs.

---

## ‏58. `Operational Drift`

‏Feature נהיה יקר או לא יציב יותר עקב שינוי data/provider/load.

---

## ‏59. `Regime-Specific Drift`

‏Feature יכול למות רק בחלק מה־regimes.

---

## ‏60. Retirement לפי Regime

‏לא חייבים למחוק Feature גלובלית אם הוא עדיין useful בתנאים מסוימים.

---

## ‏61. סכנת `Regime Overfitting`

‏אם נשאיר Feature רק ב־7 buckets קטנים כדי להצדיק אותו, ייתכן שאנחנו פשוט מתאימים noise.

---

## ‏62. `Feature Health Score`

‏אפשר לבנות health summary, אך לא לתת לו להחליף evidence מפורט.

---

## ‏63. Health Score אינו Decision Rule יחיד

‏Score משוקלל יכול להסתיר failure קריטי.

---

## ‏64. `Hard Retirement Trigger`

‏דוגמאות:

- ‏Leakage discovered.
- ‏Definition incorrect.
- ‏Provider semantics invalid.
- ‏Unrecoverable timestamp ambiguity.
- ‏Critical safety issue.

---

## ‏65. Leakage שהתגלתה מחייבת quarantine

‏Feature עם leakage לא נכנס ל־WATCH בלבד.

‏הוא יוצא מהחלטות עד RCA מלא.

---

## ‏66. `Soft Retirement Trigger`

‏לדוגמה:

- ‏Incremental value near zero.
- ‏High redundancy.
- ‏High cost.
- ‏Persistent drift.
- ‏Low decision impact.

---

## ‏67. `Retirement Candidate`

‏לפני `DEPRECATED`, אפשר לסמן Feature כ־candidate לפרישה.

---

## ‏68. `Retirement Queue`

‏כמו Research Queue, צריך גם Queue של דברים לבדיקה להסרה.

---

## ‏69. Feature חדש יוצר מועמדים לפרישה

‏כאשר Feature חדש מחליף מידע של ישן, צריך לבדוק מה ניתן להסיר.

---

## ‏70. `Replacement Analysis`

‏נבדוק:

```text
Old only
New only
Old + New
Neither
```

---

## ‏71. `Dominance`

‏אם New feature נותן לפחות אותו Decision Value עם פחות cost/fragility, הוא עשוי dominate את הישן.

---

## ‏72. Dominance צריך להיות יציב

‏לא מסיקים dominance מ־week אחד.

---

## ‏73. `Champion / Challenger`

‏Feature replacement יכול לעבוד באותה פילוסופיה של Champion/Challenger.

---

## ‏74. `Shadow Retirement`

‏אחד הכלים החשובים ביותר.

‏Production מתנהג כאילו Feature קיים, אבל במקביל מחשבים counterfactual:

```text
What would have happened without it?
```

---

## ‏75. `Reverse Shadow`

‏לאחר פרישה אפשר להמשיך לחשב Feature לזמן מוגבל בלי להשתמש בו.

‏כך רואים האם פספסנו deterioration או recovery.

---

## ‏76. `Feature Graveyard`

‏לא מוחקים היסטוריה של Features שנפסלו.

‏שומרים Registry.

---

## ‏77. למה Graveyard חשוב

‏הוא מונע מהצוות “להמציא מחדש” Feature שכבר נבדק ונכשל.

---

## ‏78. `Retirement Registry`

‏לכל Feature שנפרש נשמור:

```text
FeatureId
Version
RetiredAt
Reason
Evidence
Dependencies
Replacement
RollbackPlan
```

---

## ‏79. `Reason Codes`

‏דוגמאות:

```text
NO_INCREMENTAL_VALUE
REDUNDANT
HIGH_LATENCY_COST
DATA_FRAGILE
DRIFTED
LEAKAGE
REPLACED
TOO_COMPLEX
UNSTABLE
```

---

## ‏80. Feature Owner

‏לכל Feature חשוב צריך להיות owner ברור או component owner.

---

## ‏81. Owner אינו “האדם שהמציא אותו”

‏Owner אחראי על:

- ‏definition.
- ‏tests.
- ‏metrics.
- ‏drift.
- ‏deprecation.

---

## ‏82. `Feature Documentation Debt`

‏Feature ללא documentation מלא הוא מועמד ל־risk review גם אם עובד.

---

## ‏83. `Unknown Feature`

‏אם אף אחד לא יודע למה Feature קיים, אסור פשוט למחוק אותו.

‏קודם צריך usage tracing.

---

## ‏84. `Feature Usage Graph`

‏נמפה:

```text
Feature
→ Score
→ Models
→ Vetoes
→ Dashboards
→ Alerts
→ Backtests
```

---

## ‏85. Hidden Dependencies

‏Feature יכול להיות בשימוש בקוד לא צפוי:

- ‏debug UI.
- ‏incident tooling.
- ‏stored reports.
- ‏offline jobs.

---

## ‏86. Static dependency analysis אינו מספיק

‏צריך גם runtime usage telemetry.

---

## ‏87. `Feature Read Counter`

‏אפשר למדוד כמה פעמים Feature באמת נצרך.

---

## ‏88. `Feature Decision Counter`

‏חשוב יותר: כמה פעמים הוא תרם להחלטה.

---

## ‏89. Feature Importance אינה Feature Value

‏ב־ML, importance יכולה להיות misleading בגלל:

- ‏correlated features.
- ‏model structure.
- ‏scale.
- ‏interaction.

---

## ‏90. `SHAP` אינו Retirement Oracle

‏SHAP נמוך אינו הוכחה לפרישה.

---

## ‏91. Permutation Importance

‏גם הוא יכול לטעות כאשר Features correlated.

---

## ‏92. Ablation עדיף לשאלת Retirement

‏כי השאלה היא מה קורה למערכת בלי ה־Feature.

---

## ‏93. אבל גם Ablation יכול להטעות

‏אם model דורש retraining לאחר הסרת Feature, צריך להשוות בצורה הוגנת.

---

## ‏94. `Drop-Column Retraining`

‏במודלים מסוימים נכון לאמן מחדש בלי ה־Feature.

---

## ‏95. `Frozen-Model Ablation`

‏עונה על שאלה אחרת:

‏מה קורה אם Feature נעלם בזמן runtime בלי retraining.

---

## ‏96. שתי הבדיקות חשובות

‏אחת מודדת redundancy מחקרי, והשנייה resilience תפעולי.

---

## ‏97. `Feature Failure Drill`

‏נרצה לדעת מה קורה אם Feature נהיה:

- ‏Missing.
- ‏Stale.
- ‏NaN.
- ‏Extreme.
- ‏Delayed.

---

## ‏98. Feature שחסר וגורם crash הוא סיכון ארכיטקטוני

‏גם אם הוא predictive מאוד.

---

## ‏99. `Graceful Degradation`

‏Feature לא קריטי צריך לאפשר fallback ברור.

---

## ‏100. `Fail Closed`

‏אם Feature משמש safety veto, Missing יכול להצדיק `NO TRADE`.

---

## ‏101. `Fail Open` מסוכן ב־Safety Features

‏אסור להניח שחוסר data פירושו “הכול בסדר”.

---

## ‏102. Feature Entry ו־Feature Exit אינם אותו risk class

‏Feature שפורש מ־Entry יכול עדיין להיות נחוץ ל־Exit.

---

## ‏103. `Exit Dependency Review`

‏לפני retirement נבדוק אם positions קיימים עדיין תלויים בו.

---

## ‏104. `Open Position Compatibility`

‏שינוי Feature version בזמן position פתוח יכול לשנות semantics של Exit.

---

## ‏105. `Decision Version Pinning`

‏אפשר לשמור version שבו position נפתח.

---

## ‏106. Retirement צריך להתחשב ב־Replay

‏Replay של החלטה ישנה צריך לדעת איזו Feature definition הייתה פעילה אז.

---

## ‏107. `FeatureVersion`

‏שם Feature ללא version אינו מספיק.

---

## ‏108. `Semantic Versioning` ל־Feature

‏אפשר להבדיל בין:

- ‏bug fix.
- ‏definition change.
- ‏input change.
- ‏normalization change.

---

## ‏109. שינוי definition עשוי להיות Feature חדש

‏לא תמיד נכון להמשיך אותו identifier.

---

## ‏110. `Feature Lineage`

‏נשמור מאילו inputs ו־transformations הגיע Feature.

---

## ‏111. Lineage חשוב ל־RCA

‏כאשר Feature drifted, נוכל לזהות אם השינוי התחיל ב־raw data או בחישוב.

---

## ‏112. `Feature Provenance`

‏נשמור גם provider/source/version כאשר רלוונטי.

---

## ‏113. Retirement יכול לחסוך Data Subscription

‏אם Feature אחרון שתלוי במקור יקר נפרש, ייתכן שאפשר לפרוש גם את dependency.

---

## ‏114. `Dependency Retirement Cascade`

```text
Feature retired
→ transform unused
→ feed unused
→ storage unused
→ alert unused
```

---

## ‏115. Cascade דורש זהירות

‏Dependency יכולה לשרת רכיב אחר שלא מופיע במסלול Trading.

---

## ‏116. `Storage Retirement`

‏לא מוחקים raw/history רק כי runtime הפסיק להשתמש בהם.

---

## ‏117. Retention Policy

‏Data retention היא החלטה נפרדת מ־Feature retirement.

---

## ‏118. `Backtest Compatibility`

‏אם Backtests ישנים צריכים Feature, אפשר לשמור implementation archival.

---

## ‏119. `Historical Reproducibility`

‏מטרה מקצועית:

```text
Old decision
+ Old data
+ Old feature version
+ Old config
= Reproducible result
```

---

## ‏120. `Retirement Experiment Window`

‏נדרש חלון מספיק ארוך כדי לכלול מגוון תנאים.

---

## ‏121. יום רגוע אחד אינו Evidence

‏Feature יכול להראות מיותר עד שמגיע regime שבו הוא קריטי.

---

## ‏122. `Regime Coverage`

‏נבדוק retirement across:

- ‏volatility regimes.
- ‏liquidity regimes.
- ‏session states.
- ‏event states.

---

## ‏123. `Tail Scenario Coverage`

‏Feature safety-related צריך להיבדק גם באירועים נדירים.

---

## ‏124. `Effective Sample Size`

‏אלפי ticks אינם בהכרח אלפי independent observations.

---

## ‏125. `Retirement Confidence`

‏אפשר לסווג:

```text
LOW
MEDIUM
HIGH
```

‏לפי breadth של evidence.

---

## ‏126. High Confidence אינו Permanent

‏Feature retired יכול להפוך רלוונטי בעתיד אם market structure משתנה.

---

## ‏127. `Resurrection`

‏Feature archived יכול לחזור ל־RESEARCH.

---

## ‏128. Resurrection אינה rollback אוטומטי

‏צריך validation חדש.

---

## ‏129. `Retirement Reversal`

‏אם לאחר retirement נמדדת deterioration אמיתית, אפשר לבצע rollback.

---

## ‏130. Rollback צריך להיות מתוכנן מראש

‏לא לבנות אותו תחת לחץ אחרי תקלה.

---

## ‏131. `Retirement Kill Criteria`

‏לפני deployment של retirement נגדיר מה יחייב ביטול המהלך.

---

## ‏132. דוגמה ל־Kill Criteria

- ‏Rank stability deteriorates materially.
- ‏Net outcome deteriorates OOS.
- ‏False veto/allow rises.
- ‏Latency savings do not materialize.

---

## ‏133. `Promotion Criteria`

‏כדי להפוך retirement לקבוע, נרצה evidence מספיק שאין regression משמעותי.

---

## ‏134. `Shadow → Deprecated → Retired`

‏זה מסלול בטוח יותר מ־delete ישיר.

---

## ‏135. `Two-Key Retirement`

‏ב־critical features, אפשר לדרוש גם evidence מחקרי וגם readiness תפעולי.

---

## ‏136. Feature retirement הוא גם Performance Optimization

‏הסרת Features מיותרים יכולה לשפר:

- ‏latency.
- ‏cache locality.
- ‏GC.
- ‏memory bandwidth.
- ‏queue pressure.

---

## ‏137. `Feature Density`

‏יותר Features אינם בהכרח מערכת טובה יותר.

---

## ‏138. `Signal-to-Complexity Ratio`

‏נרצה כמה שיותר useful decision information עבור כמה שפחות complexity.

---

## ‏139. `Complexity Tax`

‏כל Feature נוסף מגדיל את מרחב השילובים וה־failure modes.

---

## ‏140. `Explainability Tax`

‏יותר Features מקשים להבין למה Rank #1 ניצח.

---

## ‏141. `Testing Tax`

‏Feature חדש יוצר עוד combinations שצריך לבדוק.

---

## ‏142. `Monitoring Tax`

‏Feature production-grade דורש health metrics.

---

## ‏143. `Incident Tax`

‏בעת incident, כל Feature הוא עוד hypothesis לבדיקה.

---

## ‏144. `Research Tax`

‏Feature count גדול מגדיל multiple-testing ו־selection bias.

---

## ‏145. Retirement מפחית Overfitting Surface

‏מערכת פשוטה יותר מקטינה degrees of freedom.

---

## ‏146. `Feature Cemetery Bias`

‏גם רשימת retired Features יכולה להטעות אם זוכרים רק את הכושלים ולא את כל הניסויים.

---

## ‏147. לכן שומרים Experiment Registry מלא

‏לא רק winners ולא רק retired.

---

## ‏148. `Feature Portfolio`

‏נכון לחשוב על Features כ־portfolio של information sources.

---

## ‏149. Diversity אמיתי עדיף על duplicates

‏חמישה Features שמודדים אותו momentum פחות מעניינים משלושה Features בלתי־תלויים יחסית.

---

## ‏150. `Information Diversity`

‏נרצה להבין אילו משפחות מידע קיימות:

```text
Price path
Activity
Liquidity
Order flow
Context
Execution feasibility
Risk
```

---

## ‏151. Retirement לפי משפחות

‏לפעמים אפשר לפרוש family שלמה אם התברר שאין לה incremental value.

---

## ‏152. `Family-Level Ablation`

‏משווים לא רק Feature בודד אלא קבוצה של Features מאותו מקור מידע.

---

## ‏153. `Feature Clustering`

‏אפשר להשתמש clustering/correlation graph כדי לזהות redundancy candidates.

---

## ‏154. Clustering הוא Discovery Tool

‏לא retirement rule אוטומטי.

---

## ‏155. `Canonical Feature`

‏כאשר כמה Features שקולים, אפשר לבחור אחד canonical ופשוט יותר.

---

## ‏156. Stable Definition עדיפה לעיתים על Slightly Better Metric

‏שיפור זעיר לא תמיד מצדיק data dependency ו־complexity חדשים.

---

## ‏157. `Feature SLA`

‏ל־Feature קריטי אפשר להגדיר:

- ‏availability.
- ‏freshness.
- ‏latency.
- ‏parity.

---

## ‏158. SLA Failure מתמשך הוא Retirement/Redesign Signal

‏במיוחד אם Feature אינו קריטי ל־edge.

---

## ‏159. `Feature SLO Error Budget`

‏אפשר למדוד כמה זמן Feature אינו עומד ביעד.

---

## ‏160. `Daily Review` מזין Feature Retirement

‏שלב 73 מספק evidence יומי על:

- ‏decision impact.
- ‏drift.
- ‏missingness.
- ‏economic contribution.

---

## ‏161. `Scanner Diagnostics` מזין Feature Retirement

‏שלב 74 מספק evidence על:

- ‏compute lag.
- ‏feature age.
- ‏coverage.
- ‏starvation.

---

## ‏162. RCA מזין Feature Retirement

‏Feature שחוזר שוב ושוב ב־incidents הוא מועמד לבחינה גם אם predictive.

---

## ‏163. `Negative Evidence` על Feature

‏כמו Candidates, גם Features צריכים Negative Evidence history.

---

## ‏164. `Feature Strike Log`

‏אפשר לתעד:

```text
Drift incidents
Data failures
Parity failures
False decisions
Latency spikes
```

---

## ‏165. Strike Log אינו auto-delete

‏הוא evidence ל־review.

---

## ‏166. `Retirement Review Packet`

```text
FeatureId
CurrentRole
CurrentVersion
Hypothesis
IncrementalValue
DecisionImpact
EconomicImpact
RegimeBreakdown
OperationalCost
Dependencies
FailureHistory
AblationResults
ShadowResults
RollbackPlan
Recommendation
```

---

## ‏167. החלטות אפשריות

```text
KEEP
WATCH
REDESIGN
REDUCE_SCOPE
MOVE_TO_DEEP_PATH
DEPRECATE
RETIRE
```

---

## ‏168. `KEEP` אינו ברירת מחדל נצחית

‏גם Feature retained מקבל review date חדש.

---

## ‏169. `REDESIGN`

‏לפעמים הבעיה היא implementation ולא hypothesis.

---

## ‏170. `REDUCE_SCOPE`

‏שימוש רק במקום שבו evidence חזק.

---

## ‏171. `MOVE_TO_DEEP_PATH`

‏פתרון טוב ל־Feature useful אך כבד.

---

## ‏172. `DEPRECATE`

‏שלב מעבר חשוב כאשר קיימים consumers ישנים.

---

## ‏173. `RETIRE`

‏החלטה שה־Feature אינו חלק עוד מהמערכת הפעילה.

---

## ‏174. `Feature Tombstone`

‏כאשר consumer מבקש Feature retired, עדיף לקבל error ברור או metadata ולא silently value ישן.

---

## ‏175. Silent fallback מסוכן

‏הוא יכול לגרום למודל לחשוב שקיבל Feature תקין.

---

## ‏176. `Schema Compatibility`

‏ב־stored datasets צריך להבדיל בין column missing לבין Feature retired.

---

## ‏177. `NOT_AVAILABLE` מול `RETIRED`

‏אלה semantics שונים.

---

## ‏178. `Training Serving Contract`

‏מודל production לא יכול לצפות ל־Feature שכבר retired.

---

## ‏179. Model retraining לפני retirement

‏כאשר המודל תלוי ב־Feature, retirement הוא change למודל ולא רק ל־feature pipeline.

---

## ‏180. `Model Compatibility Matrix`

‏נשמור אילו model versions דורשים אילו feature versions.

---

## ‏181. `Historical Dataset Contract`

‏Dataset version צריך לדעת אילו Features היו קיימים בזמן יצירתו.

---

## ‏182. `Feature Snapshot Completeness`

‏Replay צריך לדעת האם snapshot מכיל כל Feature שהיה זמין אז.

---

## ‏183. Retirement לא מוחק Evidence

‏גם אם Feature יצא מהמערכת, תוצאות המחקר שלו נשארות.

---

## ‏184. `Practitioner Secret`: Feature טוב יכול להפוך למיותר בלי “להפסיק לעבוד”

‏אם Features אחרים כבר תופסים את אותו מידע, הוא יכול להישאר predictive אבל לא incremental.

---

## ‏185. `Practitioner Secret`: המון Features קטנים יכולים ליצור Latency Tail גדול

‏הבעיה אינה תמיד Feature יחיד כבד.

---

## ‏186. `Practitioner Secret`: Missingness itself can be signal

‏לפני retirement צריך לבדוק אם עצם החוסר שימש את המערכת בעקיפין.

---

## ‏187. `Practitioner Secret`: Feature Importance משתנה כשמסירים Feature אחר

‏המערכת היא joint system.

---

## ‏188. `Practitioner Secret`: Low-use Feature יכול להיות insurance

‏Feature שכמעט לא מופעל יכול להיות קריטי באירוע נדיר.

---

## ‏189. `Practitioner Secret`: Safety Feature נמדד אחרת מ־Alpha Feature

‏Safety Feature לא צריך “לייצר רווח” כדי להצדיק קיום.

---

## ‏190. `Practitioner Secret`: Runtime cost צריך להימדד ב־tails

‏p99 חשוב יותר מהממוצע כאשר Feature נמצא ב־critical path.

---

## ‏191. `Practitioner Secret`: פרישה מוצלחת היא לפעמים בלתי נראית

‏אם הסרנו Feature והמערכת מתנהגת אותו דבר אבל מהר ופשוט יותר — זו הצלחה.

---

## ‏192. `Practitioner Secret`: אל תפרוש Feature בדיוק אחרי תקופה חלשה בלי context

‏אחרת נקבל performance chasing.

---

## ‏193. `Practitioner Secret`: אל תשאיר Feature בגלל sunk cost

‏הזמן שכבר השקענו אינו סיבה להמשיך לשלם complexity tax.

---

## ‏194. `Practitioner Secret`: feature count הוא לא maturity metric

‏מערכת מקצועית לעיתים מתבגרת דווקא כשהיא לומדת למחוק.

---

## ‏195. Baseline לרובוט שלנו

‏ברובוט Short-Horizon שלנו, כל Feature פעיל צריך לפחות:

```text
FeatureId
Version
Role
FreshnessSLO
ComputeCost
DecisionImpact
IncrementalEvidence
DriftState
Owner
```

---

## ‏196. Baseline Review Cadence

‏לא משנים Feature כל יום.

‏Daily Review אוסף evidence; review משמעותי נעשה על חלון רחב יותר או כאשר anomaly מחייב זאת.

---

## ‏197. Baseline Retirement Flow

```text
Evidence accumulation
→ Retirement candidate
→ Ablation
→ Regime analysis
→ Shadow retirement
→ Operational validation
→ Deprecate
→ Retire
→ Reverse shadow / watch
```

---

## ‏198. Baseline Hard Rules

‏לרובוט שלנו:

- ‏Leakage = quarantine.
- ‏Unknown critical semantics = no use.
- ‏Feature stale ב־critical decision = invalid.
- ‏Safety dependency לא מוסרת בלי replacement מוכח.
- ‏Feature removal חייב להיות replayable.

---

## ‏199. `Definition of Retirable`

```text
Low or replaceable incremental value
+ understood dependencies
+ acceptable counterfactual performance
+ no unresolved safety role
+ rollback path
+ preserved historical reproducibility
= Eligible for retirement
```

‏`Eligible` אינו אומר שחייבים לפרוש.

---

## ‏200. מסקנה

‏Feature Engineering מקצועי אינו מסתיים ב־“איזה Feature נוסיף?”.

‏הוא כולל גם את השאלה:

> ‏**איזה Feature כבר לא מצדיק את המחיר שהוא גובה מהמערכת?**

‏מערכת Short-Horizon טובה צריכה להתכנס לאורך זמן לסט קטן יותר של Features שכל אחד מהם בעל תפקיד ברור, evidence ברור, semantics ברורים ועלות מוצדקת.

‏כך מתקבלת מערכת שקל יותר להבין, לבדוק, להריץ, לשחזר ולשפר — ומרחב קטן יותר שבו Complexity יכולה להסתיר Noise כאילו הוא Edge.
