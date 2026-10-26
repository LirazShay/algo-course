# ‏שלב 76 — `Continuous Improvement Loop`: איך לשפר מערכת בלי להפוך אותה ל־Continuous Overfitting

> ‏מטרת הפרק: לחבר את ה־Daily Review, ‏Scanner Diagnostics, ‏Feature Retirement, ‏RCA, ‏Research, ‏Replay, ‏Shadow, ‏Champion/Challenger ו־Production Governance ללולאת שיפור אחת, מדידה ומבוקרת. המטרה אינה “לשנות משהו כל יום”, אלא להגדיל לאורך זמן את איכות ההחלטה, ה־robustness, ה־execution וה־operational safety בלי לרדוף אחרי Noise.
>
> ‏העיקרון המרכזי: **Continuous Improvement אינו Continuous Change. מערכת מקצועית משתפרת כאשר Evidence חדש עובר מסלול מבוקר של Observation → Hypothesis → Experiment → Validation → Shadow → Promotion → Monitoring → Reassessment.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

## ‏1. שתי לולאות שונות: `Production Loop` ו־`Learning Loop`

```text
Production Loop
Market Data
→ Features
→ Rank
→ Veto
→ Decision
→ Execution
→ Exit
→ Outcome

Learning Loop
Outcome + Counterfactuals + Diagnostics
→ Evidence
→ Hypothesis
→ Experiment
→ Validation
→ Shadow / Challenger
→ Promotion or Rejection
```

‏אסור לערבב בין השתיים.

‏ה־Production Loop צריך להיות מהיר, deterministic ככל האפשר ושמרני בשינוי.

‏ה־Learning Loop יכול להיות איטי, רחב, exploratory ומבוסס Evidence.

---

## ‏2. למה `Continuous Change` מסוכן

‏אם כל יום משנים Threshold, Feature או Weight בגלל התוצאה של אתמול:

```text
Noise
→ Story
→ Parameter Change
→ New Noise
→ Another Story
```

‏זו אינה למידה.

‏זו התאמה רציפה לרעש.

---

## ‏3. `Continuous Improvement` הוא מערכת Governance

‏צריך לענות תמיד על:

- ‏מה השתנה?
- ‏למה?
- ‏איזה Evidence תמך בשינוי?
- ‏איזה Evidence יכול להפריך אותו?
- ‏מי הגרסה הקודמת?
- ‏איך חוזרים אליה?
- ‏מה Promotion Criteria?
- ‏מה Kill Criteria?

---

## ‏4. יחידת העבודה אינה “רעיון” אלא `Improvement Candidate`

‏כל Candidate צריך לפחות:

```text
ImprovementId
ProblemStatement
ObservedEvidence
Hypothesis
ExpectedDecisionImpact
ExpectedEconomicImpact
AffectedComponents
Risks
ExperimentPlan
ValidationPlan
PromotionCriteria
RejectionCriteria
RollbackPlan
Status
```

---

## ‏5. מקור ראשון: `Automatic Daily Review`

‏שלב 73 מייצר:

- ‏חריגות.
- ‏First Divergence.
- ‏Missed Winners.
- ‏False Winners.
- ‏Veto effects.
- ‏Execution degradation.
- ‏Cost drift.
- ‏Latency drift.
- ‏Research Queue.

‏אבל Daily Review אינו רשאי לשנות Production ישירות.

---

## ‏6. מקור שני: `Scanner Diagnostics`

‏שלב 74 יכול לזהות בעיות שאינן Strategy problems:

- ‏Coverage נמוך.
- ‏Freshness נמוכה.
- ‏Rank churn חריג.
- ‏Starvation.
- ‏Deep-path backlog.
- ‏Score compression.
- ‏Torn cross-sectional state.

‏לפני שמשנים Strategy צריך לשלול system defect.

---

## ‏7. מקור שלישי: `Feature Retirement`

‏שלב 75 מספק מקור לשיפור דרך הסרה, לא רק הוספה.

‏שיפור יכול להיות:

```text
Remove Feature
Reduce Frequency
Move Feature to Deep Path
Simplify Model
Retire Rule
Reduce Dependency
```

---

## ‏8. מקור רביעי: Incidents

‏Incident הוא Evidence יקר.

‏אסור לסגור Incident ב־“fixed”.

‏צריך לשאול:

- ‏למה זה היה אפשרי?
- ‏למה לא גילינו קודם?
- ‏איזו הגנה הייתה חסרה?
- ‏אילו אזורים דומים יכולים להיפגע?

---

## ‏9. מקור חמישי: Counterfactuals

‏לא רק Trades שבוצעו.

‏צריך לבדוק גם:

- ‏Rank #2–#K.
- ‏Candidates שנפסלו.
- ‏Candidates שלא קיבלו Deep evaluation.
- ‏Trades שלא בוצעו בגלל `NO TRADE`.

---

## ‏10. מקור שישי: External Change

‏שינוי יכול להגיע מבחוץ:

- ‏Market Data behavior.
- ‏Broker API.
- ‏Fees.
- ‏Regulation.
- ‏Exchange behavior.
- ‏Universe composition.
- ‏Corporate-action semantics.

‏שינוי חיצוני יוצר Hypothesis חדש גם בלי שינוי ב־Strategy.

---

## ‏11. `Observation != Hypothesis`

‏Observation:

```text
Fill latency p95 increased 35%
```

‏Hypothesis:

```text
Deep-path backlog is delaying submit decisions during high activity
```

‏אלו דברים שונים.

---

## ‏12. `Hypothesis != Change Request`

‏Hypothesis צריך להיבדק.

‏רק אם Evidence תומך בו, הוא הופך ל־Change Candidate.

---

## ‏13. כל Hypothesis חייב להיות Falsifiable

‏לא:

```text
This feature probably helps
```

‏אלא:

```text
Adding X should improve net top-1 outcome in regime Y by at least Z
without increasing p99 decision latency above budget B
```

---

## ‏14. צריך `Baseline`

‏אין “שיפור” בלי baseline.

‏Baseline יכול להיות:

- ‏Champion current production.
- ‏Previous release.
- ‏Simple model.
- ‏No-feature version.
- ‏No-veto version.

---

## ‏15. למדוד `Incremental Value`

‏לא:

```text
New Model PnL = good
```

‏אלא:

```text
Delta vs Champion
```

---

## ‏16. שיפור חייב להיות Multi-Dimensional

‏צריך לבדוק לפחות:

```text
Prediction
Ranking
Executability
Latency
Costs
Robustness
Operational Complexity
Safety
```

---

## ‏17. `Metric Improvement` אינו בהכרח `Decision Improvement`

‏AUC יכול להשתפר בלי לשנות Top-1 decisions.

‏Feature importance יכול להשתנות בלי לשנות trade outcomes.

‏לכן מודדים `Decision Impact`.

---

## ‏18. `Decision Impact Rate`

```text
Changed Decisions / Total Decisions
```

‏אם Feature חדש משנה 0.01% מההחלטות, צריך להבין אם הערך מצדיק את העלות.

---

## ‏19. למדוד `Economic Impact`

‏האם השינוי משפיע על:

- ‏Net edge.
- ‏Fill probability.
- ‏Adverse selection.
- ‏TimeToFlat.
- ‏Giveback.
- ‏Costs.

---

## ‏20. למדוד `Complexity Tax`

‏כל שינוי מוסיף אולי:

- ‏Code.
- ‏Tests.
- ‏State.
- ‏Monitoring.
- ‏Latency.
- ‏Dependencies.
- ‏Failure modes.

---

## ‏21. `Complexity-Adjusted Improvement`

‏שינוי קטן בביצועים עם complexity גדולה יכול להיות שלילי נטו.

---

## ‏22. סדר עדיפויות למחקר

‏לא כל בעיה שווה אותו דבר.

‏אפשר לדרג לפי:

```text
Expected Impact
× Confidence
× Frequency
× Severity
÷ Effort
```

---

## ‏23. אבל אין להפוך את הנוסחה לאמת מוחלטת

‏אירוע בטיחות נדיר יכול לקבל Priority גבוה גם אם Frequency נמוכה.

---

## ‏24. `P0 Safety` עוקף Research Ranking

‏בעיה שמסכנת state correctness, exposure או reconciliation אינה מחכה ל־research queue רגיל.

---

## ‏25. `Research Queue` צריך להיות מוגבל

‏Backlog אינסופי יוצר illusion של progress.

‏צריך WIP limit.

---

## ‏26. מעט Hypotheses במקביל

‏כך קל יותר להבין causality.

---

## ‏27. שינוי אחד עיקרי בכל Experiment

‏אם משנים Feature, threshold ו־exit יחד, attribution נשבר.

---

## ‏28. `One Unknown at a Time`

‏זה עיקרון שימושי במיוחד ב־Shadow וב־Small Live calibration.

---

## ‏29. `Experiment Contract`

```text
Hypothesis
Population
Time Window
Features
Labels
Baseline
Primary Metric
Guardrail Metrics
Stopping Rule
Promotion Rule
```

---

## ‏30. Primary Metric אחד

‏ריבוי metrics מאפשר לבחור בדיעבד את זה שנראה טוב.

---

## ‏31. Guardrails

‏גם אם Primary Metric משתפר, Guardrail יכול לפסול שינוי.

‏לדוגמה:

```text
NetEdge ↑
Latency p99 ↑↑
```

---

## ‏32. `Promotion Criteria` לפני הרצה

‏לא אחרי שרואים Results.

---

## ‏33. `Rejection Criteria` לפני הרצה

‏גם תנאי דחייה צריכים להיות ידועים מראש.

---

## ‏34. `Kill Criteria`

‏שינוי יכול להיראות טוב ואז להיכשל ב־Shadow/Live.

‏צריך תנאי עצירה.

---

## ‏35. הפרדת `Exploration` מ־`Confirmation`

‏Exploration מייצר רעיונות.

‏Confirmation בודק אותם על Evidence שלא שימש לבנייתם.

---

## ‏36. Holdout אינו playground

‏Repeated peeking שוחק את ערך ה־holdout.

---

## ‏37. Multiple Testing

‏Continuous Improvement מייצר הרבה ניסויים.

‏זה מגדיל Winner's Curse.

---

## ‏38. Experiment Registry

‏צריך לשמור גם ניסויים שנכשלו.

---

## ‏39. Negative Results הם Assets

‏הם מונעים לחזור לאותו רעיון בעוד חודש בשם אחר.

---

## ‏40. `Research Memory`

‏לכל Hypothesis צריך היסטוריה:

- ‏מי בדק.
- ‏מתי.
- ‏באילו נתונים.
- ‏מה הייתה התוצאה.
- ‏למה נדחה/קודם.

---

## ‏41. Version Everything

‏לפחות:

```text
StrategyVersion
FeatureVersion
ModelVersion
ConfigVersion
DataSchemaVersion
ProviderVersion
BrokerAdapterVersion
```

---

## ‏42. Improvement בלי versioning אינו reproducible

‏אם לא יודעים איזה stack יצר Outcome, לא ניתן ללמוד ממנו.

---

## ‏43. `Change Set`

‏כל Promotion צריך לתאר במדויק את הדלתא.

---

## ‏44. Avoid Mega Changes

‏שינוי גדול מדי מונע attribution ו־rollback ממוקד.

---

## ‏45. `Champion`

‏הגרסה הפעילה המאושרת.

---

## ‏46. `Challenger`

‏גרסה שמנסה להוכיח שהיא טובה יותר.

---

## ‏47. Challenger לא מקבל אמון רק כי הוא חדש

‏הנטל עליו להוכיח incremental value.

---

## ‏48. `Shadow Challenger`

‏מריץ החלטות בלי לשלוח Orders.

---

## ‏49. Decision Parity

‏צריך לדעת איפה Champion ו־Challenger מסכימים ואיפה לא.

---

## ‏50. `Disagreement Set`

‏זה לעיתים dataset בעל הערך הגבוה ביותר.

---

## ‏51. לנתח Disagreement, לא רק aggregate PnL

‏שם נמצאת הסיבה האמיתית לשינוי.

---

## ‏52. `Counterfactual Outcome`

‏מה היה קורה אילו Challenger היה נבחר?

---

## ‏53. Counterfactual execution חייב להיות ריאלי

‏אי אפשר להניח fill רק כי המחיר נגע.

---

## ‏54. `Shadow Duration`

‏הזמן נקבע לפי evidence coverage, לא מספר ימים שרירותי.

---

## ‏55. צריך לראות מגוון Conditions

- ‏Low/high volatility.
- ‏Thin/deep liquidity.
- ‏Open/midday/close.
- ‏Events.
- ‏Provider degradation.

---

## ‏56. `Promotion Packet`

‏כל שינוי משמעותי צריך Evidence Pack.

---

## ‏57. Promotion Packet צריך לכלול

```text
Hypothesis
Baseline
ExperimentResults
OOSResults
StressResults
ReplayResults
ShadowResults
Guardrails
KnownRisks
RollbackPlan
Decision
```

---

## ‏58. `GO` אינו “נראה טוב”

‏GO הוא החלטה מול criteria שהוגדרו מראש.

---

## ‏59. `NO-GO` הוא תוצאה תקינה

‏הרבה רעיונות צריכים להידחות.

---

## ‏60. `KEEP RESEARCHING`

‏לפעמים Evidence אינו מספיק לשום כיוון.

---

## ‏61. `Retire` הוא סוג של Improvement

‏המערכת משתפרת גם כשמורידים רכיב מיותר.

---

## ‏62. `Simplification Dividend`

‏הסרת complexity יכולה לשפר:

- ‏Latency.
- ‏Reliability.
- ‏Interpretability.
- ‏Testability.
- ‏Recovery.

---

## ‏63. `Latency Budget` בתוך Improvement Loop

‏כל Feature/Model חדש צריך להראות את העלות שלו.

---

## ‏64. `Latency Pressure`

```text
EndToEndLatency / SignalHalfLife
```

‏שיפור predictive שאוכל יותר מדי מה־half-life יכול להיות regression.

---

## ‏65. Cost Budget

‏שינוי Entry יכול לשפר fill rate אבל להחמיר slippage.

---

## ‏66. Net Outcome בלבד

‏צריך לחשב את הדלתא אחרי כל costs הרלוונטיים.

---

## ‏67. `Edge Retention`

‏כמה מה־edge התיאורטי נשמר עד Fill ועד Flat.

---

## ‏68. Prediction improvement שלא נשמר בביצוע אינו Improvement

---

## ‏69. `Execution Improvement`

‏לא כל Improvement קשור ל־Signal.

‏אפשר לשפר:

- ‏Order timing.
- ‏Cancel/replace.
- ‏Revalidation.
- ‏Exit urgency.
- ‏Reconciliation.

---

## ‏70. `Data Improvement`

‏לפעמים Data quality נותן יותר ערך מעוד Feature.

---

## ‏71. `Observability Improvement`

‏Telemetry טובה יותר יכולה לחשוף Edge leakage שלא ראינו.

---

## ‏72. `Recovery Improvement`

‏פחות UNKNOWN_EFFECT יכול להיות שיפור חשוב יותר מ־score קטן.

---

## ‏73. `Safety Improvement`

‏Safety אינו נמדד רק ב־PnL.

---

## ‏74. Leading Indicators

‏צריך לעקוב אחרי precursors:

- ‏Freshness drift.
- ‏Queue age.
- ‏Rank churn.
- ‏Fill markout.
- ‏Reconciliation latency.

---

## ‏75. לא לחכות ל־PnL damage

‏PnL הוא לעיתים lagging metric.

---

## ‏76. `Drift → Investigation`, לא מיד `Drift → Retrain`

‏Drift יכול להגיע מ־data bug, regime shift או execution change.

---

## ‏77. Four Drift Classes

```text
Data Drift
Feature Drift
Decision Drift
Outcome Drift
```

---

## ‏78. Execution Drift בנפרד

‏אותו Signal יכול להישחק בגלל fills ולא בגלל prediction.

---

## ‏79. Cost Drift בנפרד

‏Spread/fees/impact יכולים לשנות economics.

---

## ‏80. `First Divergence`

‏בכל degradation מחפשים את הגבול הראשון שבו Expected ו־Actual נפרדו.

---

## ‏81. `RCA before Optimization`

‏אסור לבצע tuning לפני שמבינים את הבעיה.

---

## ‏82. RCA צריך לחפש Similar Areas

‏בעיה אחת יכולה לחשוף pattern מערכתי.

---

## ‏83. `Prevent Recurrence`

‏Fix טוב מוסיף גם detection/prevention כשאפשר.

---

## ‏84. `Learning Debt`

‏אם Outcomes לא נשמרים עם context מספיק, אי אפשר ללמוד בעתיד.

---

## ‏85. `Decision Snapshot`

‏כל decision חשוב צריך לשמור:

- ‏Inputs.
- ‏Features.
- ‏Rank.
- ‏Vetoes.
- ‏Context.
- ‏Latency.
- ‏Config versions.

---

## ‏86. `Outcome Snapshot`

‏כולל:

- ‏Fill.
- ‏Markouts.
- ‏MFE/MAE.
- ‏TimeToTarget.
- ‏TimeToFlat.
- ‏Costs.

---

## ‏87. בלי linkage בין Decision ל־Outcome אין Learning Loop אמין

---

## ‏88. `Counterfactual Logging`

‏שומרים גם candidates שלא נבחרו.

---

## ‏89. Sampling של Counterfactuals

‏אם העלות גבוהה, אפשר לשמור sample מתוכנן — לא sample אקראי לא מתועד.

---

## ‏90. `Data Retention Policy`

‏צריך לדעת מה נשמר raw ומה aggregated.

---

## ‏91. Improvement תלוי ב־replayability

‏אם אי אפשר לשחזר Episode, קשה להוכיח שינוי.

---

## ‏92. Golden Episodes

‏סט מקרים היסטוריים קריטיים שחייבים לעבור בכל גרסה.

---

## ‏93. Golden Failures

‏גם incidents קודמים נכנסים ל־regression suite.

---

## ‏94. `No Regression` אינו רק unit tests

‏צריך לבדוק behavior/economics/state.

---

## ‏95. `Research Tests`

‏שונים מ־Production Correctness Tests.

---

## ‏96. `Economic Regression Tests`

‏למשל:

```text
Expected cost model does not jump unexpectedly
Rank distribution remains within expected envelope
```

---

## ‏97. `Operational Regression Tests`

‏Restart, reconnect, duplicate events, partial fills.

---

## ‏98. `Performance Regression Tests`

‏p50/p95/p99.

---

## ‏99. `Stress Envelope`

‏שינוי צריך לעבור גם תנאים קשים, לא רק average case.

---

## ‏100. `Robustness > Peak Backtest`

‏עדיף plateau יציב על optimum חד.

---

## ‏101. Parameter Stability

‏אם שינוי קטן בפרמטר מוחק performance, זה warning.

---

## ‏102. `Sensitivity Map`

‏בודקים סביבת פרמטרים, לא נקודה יחידה.

---

## ‏103. `Ablation Map`

‏בודקים אילו רכיבים באמת נחוצים.

---

## ‏104. `Interaction Risk`

‏Feature טוב לבד יכול להזיק בשילוב אחר.

---

## ‏105. Improvements יכולים להתנגש

‏למשל Feature חדש + stricter veto.

---

## ‏106. צריך `Change Dependency Graph`

---

## ‏107. `Promotion Order`

‏אם שני changes תלויים, מקדמים בסדר שמאפשר attribution.

---

## ‏108. `Config-only Change` עדיין Change

‏Threshold חדש צריך governance.

---

## ‏109. `Emergency Change`

‏Safety fix יכול לעקוף research process.

‏אבל עדיין דורש:

- ‏Audit.
- ‏Validation מינימלי בטוח.
- ‏Post-change review.

---

## ‏110. `Rollback` צריך להיות קודם ל־Promotion

‏לא מתכננים rollback בזמן incident.

---

## ‏111. `Rollback Readiness`

‏צריך לדעת:

- ‏איזה artifact.
- ‏איזה config.
- ‏איזה schema.
- ‏איזה state migration.

---

## ‏112. State Compatibility

‏rollback של code בלי state compatibility יכול להזיק.

---

## ‏113. `Forward Fix` מול `Rollback`

‏הבחירה תלויה בסיכון וביכולת state recovery.

---

## ‏114. `Change Freeze`

‏בתקופות חריגות אפשר לעצור non-critical improvements.

---

## ‏115. `Change Window`

‏לא חייבים לשחרר change רגע לפני session קריטית.

---

## ‏116. `Canary` Concept

‏אפשר לחשוב על חשיפה מוגבלת של change לפני promotion מלא, כאשר תשתית/הרשאות מתאימות.

---

## ‏117. `Shadow First`

‏ברירת המחדל למחקר היא ללא סיכון הון.

---

## ‏118. `Small Live` הוא Calibration, לא Proof

‏גם ביצוע מוצלח קטן אינו הוכחת Edge סופית.

---

## ‏119. Promotion בשלבים

```text
Research
→ Replay
→ Shadow
→ Paper
→ Small Live Review
→ Broader Production
```

---

## ‏120. אפשר Demotion

‏Champion יכול לחזור ל־Shadow/Disabled.

---

## ‏121. `Automatic Demotion Triggers`

‏למשל:

- ‏critical data failure.
- ‏state mismatch.
- ‏cost explosion.
- ‏unknown broker state.

---

## ‏122. `Performance Demotion` דורש Evidence

‏לא כל יום חלש הוא drift.

---

## ‏123. `Evidence Window`

‏צריך חלון שמכיל sample מספיק ומגוון מספיק.

---

## ‏124. `Effective Sample Size`

‏אלפי observations correlated אינם אלפי ניסויים עצמאיים.

---

## ‏125. Episode-Level Evaluation

‏לעיתים נכון יותר מ־tick-level counts.

---

## ‏126. Regime Coverage

‏Promotion צריך לדעת באילו regimes נבדק השינוי.

---

## ‏127. Unknown Regimes

‏אין להסיק robustness למצבים שלא נצפו.

---

## ‏128. `Confidence` צריך להיות Explicit

```text
High / Medium / Low
```

---

## ‏129. Confidence אינו certainty

---

## ‏130. `Unknown Budget`

‏לפני promotion מונים אילו unknowns נשארו.

---

## ‏131. Critical Unknown = NO-GO

---

## ‏132. `Known Risk Register`

‏Risk ידוע לא נעלם בגלל שהחלטנו לקבל אותו.

---

## ‏133. Residual Risk

‏צריך להיות מתועד ומאושר במסגרת governance המתאימה.

---

## ‏134. `Research Velocity`

‏מהירות טובה היא קצב שבו מייצרים learning אמין, לא מספר commits.

---

## ‏135. `Learning per Experiment`

‏ניסוי טוב מלמד גם אם Hypothesis נדחתה.

---

## ‏136. `Learning Efficiency`

‏כמה uncertainty הוסר ביחס לעלות הניסוי.

---

## ‏137. High-Value Experiments

‏ניסויים שמבדילים בין explanations מתחרות.

---

## ‏138. Avoid Cosmetic Experiments

‏שינוי שלא יכול לשנות decision אינו priority גבוה.

---

## ‏139. `Research Budget`

‏Compute, storage, engineering time ו־attention מוגבלים.

---

## ‏140. `Observability Budget`

‏גם telemetry עולה latency/storage.

---

## ‏141. `Improvement Portfolio`

‏לא כל המחקר צריך להיות Alpha.

‏צריך balance בין:

- ‏Prediction.
- ‏Execution.
- ‏Safety.
- ‏Data.
- ‏Performance.
- ‏Operations.

---

## ‏142. `Reliability Alpha`

‏מערכת שמפספסת פחות opportunities בגלל failures יכולה להשתפר גם בלי Signal חדש.

---

## ‏143. `Execution Alpha`

‏אותו Signal עם capture טוב יותר יכול לייצר יותר net outcome.

---

## ‏144. `Data Alpha`

‏Freshness/quality טובים יותר יכולים לשפר ranking.

---

## ‏145. `Selection Alpha`

‏שיפור rank/top-K יכול להיות משמעותי יותר משינוי entry.

---

## ‏146. `Negative Evidence Alpha`

‏Veto טוב יכול לשפר outcome באמצעות avoidance.

---

## ‏147. `NO TRADE Alpha`

‏היכולת לא לסחור כשאין edge היא Capability.

---

## ‏148. למדוד Opportunity Cost של `NO TRADE`

‏כדי למנוע over-filtering.

---

## ‏149. `False Veto` הוא learning signal

---

## ‏150. `False Allow` הוא learning signal

---

## ‏151. Improvement ל־Veto צריך לבדוק שני הצדדים

---

## ‏152. `Cooldown` גם צריך Lifecycle

‏TTL/decay יכולים להפוך למיושנים.

---

## ‏153. `Rule Explosion`

‏Continuous Improvement לא אמור לייצר עוד rule לכל failure.

---

## ‏154. Prefer General Mechanisms

‏למשל data freshness gate עדיף על exceptions לפי symbol.

---

## ‏155. `Patch Smell`

‏הרבה exceptions הן סימן לבעיה במודל הבסיסי.

---

## ‏156. `Abstraction Review`

‏אחרי כמה fixes דומים צריך לבדוק אם חסר abstraction.

---

## ‏157. אבל לא לעשות Over-Engineering

‏KISS נשאר חשוב.

---

## ‏158. `Complexity Ceiling`

‏אפשר לקבוע גבול complexity לפני שמבקשים evidence חזק יותר.

---

## ‏159. `Evidence Threshold` תלוי Complexity

‏ככל ששינוי מורכב/מסוכן יותר, נדרש Evidence חזק יותר.

---

## ‏160. `Evidence Threshold` תלוי Reversibility

‏שינוי שקל rollback יכול לקבל מסלול ניסוי שונה משינוי stateful עמוק.

---

## ‏161. `Reversibility` היא Feature

‏מערכת שקל לחזור בה יכולה ללמוד בבטחה יותר.

---

## ‏162. `Auditability` היא Feature

‏אם אי אפשר להבין למה change קודם, governance חלש.

---

## ‏163. `Human Review`

‏שינויים משמעותיים צריכים checkpoint אנושי מתאים לפני production promotion.

---

## ‏164. Automation עוזר לאסוף Evidence

‏לא מחליף accountability.

---

## ‏165. `Auto-Research` מותר להיות Exploratory

‏אבל לא Auto-Promotion.

---

## ‏166. `Auto-Retrain` אינו ברירת מחדל

‏Retraining צריך trigger, validation ו־versioning.

---

## ‏167. `Auto-Tuning` מסוכן במיוחד

‏כי הוא יכול ללמוד Noise מהר.

---

## ‏168. `Threshold Drift`

‏שינוי אוטומטי ב־thresholds יכול לשנות behavior בלי visibility.

---

## ‏169. Production Config צריך להיות immutable per version

---

## ‏170. `Configuration Fingerprint`

‏כל Outcome צריך להיות מקושר ל־config המדויק.

---

## ‏171. `Improvement Dashboard`

‏לא רק PnL.

‏צריך להציג:

- ‏Active hypotheses.
- ‏Experiments.
- ‏Champion/Challenger.
- ‏Recent promotions.
- ‏Recent rollbacks.
- ‏Open risks.
- ‏Drift alerts.

---

## ‏172. `Learning Dashboard`

‏כמה hypotheses:

- ‏נוצרו.
- ‏נבדקו.
- ‏נדחו.
- ‏קודמו.
- ‏הוחזרו.

---

## ‏173. Rejection Rate גבוה אינו כישלון

‏Research טוב דוחה הרבה רעיונות.

---

## ‏174. Promotion Rate גבוה מדי יכול להיות Warning

---

## ‏175. `Change Failure Rate`

‏כמה promotions דורשים rollback/demotion.

---

## ‏176. `Time to Detect Regression`

‏מדד חשוב לאיכות observability.

---

## ‏177. `Time to Safe State`

‏כמה מהר אפשר להגיע למצב ללא exposure חדש לאחר failure.

---

## ‏178. `Time to Explain`

‏כמה מהר אפשר להסביר incident באמצעות stored evidence.

---

## ‏179. `Improvement Health` אינו metric יחיד

‏זו תמונה של learning + reliability + economics.

---

## ‏180. Weekly Review

‏Daily Review אוסף signals; Weekly Review מתאים יותר להערכת patterns רחבים.

---

## ‏181. Monthly / Version Review

‏לבדוק technical debt, feature debt, experiment debt ו־data debt.

---

## ‏182. `Experiment Debt`

‏ניסויים שהתחילו ולא נסגרו משאירים ambiguity.

---

## ‏183. `Data Debt`

‏Missing lineage/quality contracts פוגע במחקר העתידי.

---

## ‏184. `Monitoring Debt`

‏רכיב בלי SLO/alerts קשה לקדם בבטחה.

---

## ‏185. `Rollback Debt`

‏גרסה שאי אפשר לחזור ממנה היא סיכון.

---

## ‏186. `Knowledge Debt`

‏החלטות שלא תועדו חוזרות שוב ושוב.

---

## ‏187. `Discovered Topics`

‏אם Improvement Loop חושף תחום חדש מהותי, רושמים אותו ולא דוחפים אותו בשקט לפרק קיים.

---

## ‏188. `Practitioner Secret`: הבעיה הכי מסוכנת היא הצלחה מקרית

‏Failure ברור מזמין RCA.

‏Success מקרי מזמין promotion שגוי.

---

## ‏189. `Practitioner Secret`: שיפור קטן ועקבי עדיף על קפיצה בלתי מוסברת

---

## ‏190. `Practitioner Secret`: Best Backtest Candidate הוא לעיתים Winner's Curse

---

## ‏191. `Practitioner Secret`: שינוי שלא משנה Decisions לא באמת משנה Strategy

---

## ‏192. `Practitioner Secret`: PnL ירוק יכול להסתיר Regression תפעולי

---

## ‏193. `Practitioner Secret`: Missing telemetry הוא Failed Experiment

‏אם אי אפשר לדעת מה קרה, אין Evidence.

---

## ‏194. `Practitioner Secret`: rollback מהיר הוא חלק מיכולת המחקר

---

## ‏195. `Practitioner Secret`: stability היא output של process, לא של parameter tuning

---

## ‏196. Baseline לרובוט שלנו

‏ל־Short-Horizon whole-market scanner שלנו, baseline סביר למחקר הוא:

```text
Daily Review
→ Ranked Research Queue
→ One primary hypothesis
→ Offline validation
→ Realistic replay
→ Shadow challenger
→ Promotion review
→ Versioned deployment
→ Live monitoring
→ Reassessment
```

---

## ‏197. מה לא הייתי עושה כ־baseline

‏לא:

- ‏Auto-retune כל ערב.
- ‏Auto-promote model.
- ‏Auto-add rule אחרי loss.
- ‏Retrain בגלל יום חלש.
- ‏שינוי thresholds לפי PnL יומי.
- ‏Promotion על metric יחיד.

---

## ‏198. `Definition of Ready for Promotion`

```text
Clear problem
+ Falsifiable hypothesis
+ Clean baseline
+ OOS evidence
+ Realistic execution evidence
+ Guardrails pass
+ Shadow evidence
+ Known risks documented
+ Rollback ready
= Eligible for Promotion Review
```

---

## ‏199. `Definition of Continuous Improvement`

```text
Observe
→ Explain
→ Hypothesize
→ Test
→ Compare
→ Stress
→ Shadow
→ Promote or Reject
→ Monitor
→ Learn
```

‏בלי קיצורי דרך.

---

## ‏200. סיכום

‏מערכת מקצועית אינה משתפרת מפני שהיא משתנה הרבה.

‏היא משתפרת כאשר היא **לומדת מהר יותר ממה שהיא צוברת complexity**.

‏לכן הלולאה הנכונה היא:

```text
Evidence
→ Controlled Learning
→ Minimal Validated Change
→ Measured Production Effect
→ New Evidence
```

‏זהו ההבדל בין `Continuous Improvement` לבין `Continuous Overfitting`.
