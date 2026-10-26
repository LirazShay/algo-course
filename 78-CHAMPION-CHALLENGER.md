# ‏שלב 78 — `Champion / Challenger`: להשוות שינויים בלי להמר על Production

> ‏מטרת הפרק: לבנות מסגרת מקצועית שבה ה־`Champion` — הגרסה הפעילה או המאושרת — מושווה ל־`Challenger` אחד או יותר על אותם מצבי שוק ככל האפשר. נלמד למדוד disagreement, incremental decision value, guardrails, regime robustness, execution realism, cost impact ו־promotion evidence, כך ששינוי יתקדם רק כאשר הוא מוכיח ערך אמיתי ולא מפני שנראה טוב בחלון קצר.
>
> ‏העיקרון המרכזי: **Challenger אינו מנצח בגלל Metric יחיד. הוא מתקדם רק כאשר ניתן להסביר איפה הוא שינה החלטה, למה השינוי היה טוב יותר, כמה הוא היה שווה נטו, באילו תנאים הוא נשבר, ומה הסיכון שנלקח כדי להשיג את השיפור.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

## ‏1. מהו `Champion`

‏ה־`Champion` הוא הגרסה שנחשבת כרגע ל־baseline המחייב להשוואה.

‏הוא יכול להיות:

- ‏הגרסה הפעילה ב־Production.
- ‏הגרסה המאושרת האחרונה ב־Shadow.
- ‏Baseline מחקרי פשוט.
- ‏Strategy שאושרה אך עדיין אינה מורשית למסחר אמיתי.

---

## ‏2. מהו `Challenger`

‏`Challenger` הוא שינוי מוגדר היטב שנבחן מול ה־Champion.

‏לדוגמה:

- ‏Feature חדש.
- ‏Feature שהוסר.
- ‏Threshold שונה.
- ‏Ranking logic חדש.
- ‏Veto חדש.
- ‏Execution policy אחרת.
- ‏Exit logic חדש.
- ‏Cost model מעודכן.
- ‏Model חדש.

---

## ‏3. לא משווים “מערכת חדשה” מעורפלת

‏כל Challenger צריך `Change Thesis` ברור:

```text
What changed?
Why should it help?
Which decisions should change?
Which metrics should improve?
Which guardrails must not degrade?
```

---

## ‏4. כלל `One Primary Change`

‏ככל האפשר, Challenger טוב משנה דבר עיקרי אחד.

‏אם משנים בו זמנית Feature, Threshold, Exit ו־Execution policy, קשה לייחס תוצאה לגורם מסוים.

---

## ‏5. `StrategyVersion` חובה

‏Champion ו־Challenger חייבים להיות מזוהים באמצעות `StrategyVersion` מלא משלב 77.

---

## ‏6. `ConfigFingerprint` חובה

‏אסור להשוות שתי ריצות כאשר לא ברור אילו configurations באמת הופעלו.

---

## ‏7. אותו Data Context

‏ככל האפשר, שתי הגרסאות צריכות לראות את אותו `As-Known-At` market state.

---

## ‏8. אותו Universe

‏שינוי Universe צריך להיות חלק מפורש מה־experiment, לא הבדל סמוי.

---

## ‏9. אותו Clock Domain

‏Timestamp mismatch יכול ליצור Challenger שנראה מהיר או חכם יותר רק בגלל misalignment.

---

## ‏10. אותו Cost Model

‏כאשר בודקים predictive logic, cost assumptions צריכים להיות זהים בין הגרסאות.

---

## ‏11. אותו Execution Simulator

‏אלא אם execution הוא המשתנה הנבדק, שניהם צריכים להשתמש באותו simulator.

---

## ‏12. אותו Failure Semantics

‏`UNKNOWN`, ‏`NOT_READY`, ‏`STALE` ו־missing data צריכים להיות מוגדרים באופן עקבי.

---

## ‏13. `Decision Twin`

‏ב־Shadow אפשר להריץ שתי גרסאות על אותו market event:

```text
Market Snapshot
├─ Champion Decision
└─ Challenger Decision
```

---

## ‏14. `Disagreement Set`

‏החלק החשוב ביותר בהשוואה הוא המקומות שבהם ההחלטות שונות.

---

## ‏15. למה agreement פחות מעניין

‏אם שתי הגרסאות בחרו אותו Candidate, אותו Veto ואותו Exit, אין שם הרבה מידע על incremental value.

---

## ‏16. סוגי Disagreement

‏נרצה לתייג:

- ‏Different Candidate.
- ‏Trade vs `NO TRADE`.
- ‏Different Entry Timing.
- ‏Different Order Tactic.
- ‏Different Size.
- ‏Different Exit Timing.
- ‏Different Veto.

---

## ‏17. `DecisionDelta`

‏לכל disagreement כדאי לשמור object מפורש:

```text
DecisionDelta
- DecisionId
- ChampionAction
- ChallengerAction
- ChangedComponents
- Context
- LaterOutcome
```

---

## ‏18. `Incremental Decision Value`

‏השאלה אינה כמה Challenger הרוויח.

‏השאלה:

```text
Value(Challenger Decision)
-
Value(Champion Decision)
```

---

## ‏19. Counterfactual limitation

‏אם רק פעולה אחת בוצעה באמת, התוצאה של הפעולה השנייה היא counterfactual ודורשת simulation או shadow estimation.

---

## ‏20. Counterfactual אינו Truth

‏יש לתייג בבירור:

- ‏Observed.
- ‏Simulated.
- ‏Estimated.
- ‏Unknown.

---

## ‏21. `Observed Advantage`

‏יתרון בפעולות שבוצעו בפועל חזק יותר מיתרון סימולטיבי בלבד.

---

## ‏22. `Shadow Advantage`

‏Shadow מספק coverage רחב בלי סיכון כספי, אך אינו מוכיח fill quality אמיתי.

---

## ‏23. `Replay Advantage`

‏Replay טוב לבידוד logic, אך עדיין תלוי באיכות simulator.

---

## ‏24. Evidence Ladder

```text
Backtest
→ Replay
→ Shadow
→ Paper
→ Controlled Live Evidence
```

---

## ‏25. לא חייבים להגיע ל־Live כדי לפסול Challenger

‏רוב ה־Challengers צריכים להיפסל מוקדם יותר אם אין incremental value.

---

## ‏26. `Primary Metric`

‏לכל experiment צריך metric ראשי אחד שהוגדר מראש.

---

## ‏27. `Guardrail Metrics`

‏בנוסף ל־Primary Metric צריך מדדי הגנה.

‏לדוגמה:

- ‏Tail Loss.
- ‏Latency.
- ‏Fill Rate.
- ‏TimeToFlat.
- ‏Data Coverage.
- ‏Operational Error Rate.

---

## ‏28. PnL אינו Guardrail מספיק

‏PnL ירוק יכול להסתיר deterioration ב־tail risk או execution.

---

## ‏29. `Economic Metric`

‏השוואה צריכה להיעשות נטו:

```text
Gross Outcome
- Spread
- Slippage
- Fees
- Impact
- Borrow/Other Costs
```

---

## ‏30. `Decision Quality Metric`

‏נרצה למדוד גם איכות החלטה לפני ביצוע.

---

## ‏31. Rank Quality

‏אם Challenger משנה ranking, נבדוק:

- ‏Top1 outcome.
- ‏TopK ordering.
- ‏Rank stability.
- ‏Rank gap.

---

## ‏32. Veto Quality

‏אם Challenger משנה veto logic, נבדוק:

- ‏Bad trades avoided.
- ‏Good trades blocked.
- ‏False veto rate.
- ‏Decision impact.

---

## ‏33. Entry Quality

‏נבדוק arrival-to-fill economics ולא רק signal price.

---

## ‏34. Exit Quality

‏נבדוק:

- ‏TimeToFlat.
- ‏Giveback.
- ‏Exit slippage.
- ‏Residual risk.

---

## ‏35. `EdgeRetention`

‏Metric חשוב:

```text
Net Realized Edge / Predicted Gross Edge
```

---

## ‏36. `Capture Ratio`

‏כמה מה־opportunity שנחזתה באמת נשמרה אחרי ביצוע.

---

## ‏37. `Cost Ratio`

‏כמה מה־gross edge נאכל על ידי costs.

---

## ‏38. `Latency Tax`

‏כמה edge אבד בין detection, decision, submission, fill ו־exit.

---

## ‏39. Latency guardrail

‏Challenger “חכם” יותר אך איטי משמעותית עלול להיות גרוע יותר בפועל.

---

## ‏40. Complexity guardrail

‏Complexity היא עלות.

---

## ‏41. `Complexity Tax`

‏נמדוד בין היתר:

- ‏Extra compute.
- ‏Extra latency.
- ‏Extra dependencies.
- ‏Extra failure modes.
- ‏Extra operational burden.

---

## ‏42. `Incremental Value / Complexity`

‏שיפור זעיר עם complexity גדולה אינו בהכרח promotion candidate.

---

## ‏43. Regime robustness

‏Challenger צריך להיבדק לפי regimes.

---

## ‏44. Volatility buckets

‏נבדוק Low / Medium / High volatility.

---

## ‏45. Liquidity buckets

‏נבדוק Liquid / Normal / Thin.

---

## ‏46. Session buckets

‏נבדוק Open / Midday / Close / transition states.

---

## ‏47. Event states

‏נבדוק normal מול event-driven periods.

---

## ‏48. Regime coverage

‏אין להסיק robustness אם ה־experiment ראה רק regime אחד.

---

## ‏49. `Regime Concentration`

‏שיפור שמגיע כמעט כולו מ־bucket אחד צריך להיות מסומן.

---

## ‏50. Tail behavior

‏נבדוק לא רק mean אלא גם worst tails.

---

## ‏51. `Worst-Decile Delta`

‏כמה Challenger שינה את העשירון הגרוע ביותר.

---

## ‏52. `Best-Decile Delta`

‏כמה הוא שינה את הזנב הטוב.

---

## ‏53. Distribution before average

‏ממוצע לבדו יכול להסתיר שינוי התפלגות מסוכן.

---

## ‏54. Sample size

‏נרצה מספר disagreements מספיק, לא רק מספר observations כולל.

---

## ‏55. `Effective Disagreement Sample Size`

‏אם 10,000 disagreements באו מאותו episode, אין לנו 10,000 דוגמאות עצמאיות.

---

## ‏56. Episode clustering

‏נרכז observations לאירועי שוק ולא נספור אותם כאילו היו בלתי תלויים.

---

## ‏57. Multiple testing

‏Challenger הוא חלק מתהליך מחקר ולכן כפוף ל־Winner's Curse ו־multiple comparisons.

---

## ‏58. Challenger Zoo

‏בדיקת מאות Challengers והצגת הטוב ביותר בלבד היא p-hacking מערכתי.

---

## ‏59. Experiment Registry

‏כל Challenger צריך להירשם, כולל אלה שנכשלו.

---

## ‏60. Frozen hypothesis

‏לפני הבדיקה נרשום מה מצפים שישתפר.

---

## ‏61. Frozen promotion criteria

‏Promotion criteria לא משתנים אחרי שרואים תוצאות.

---

## ‏62. Frozen rejection criteria

‏גם תנאי דחייה נקבעים מראש.

---

## ‏63. `KEEP_RESEARCHING`

‏תוצאה לגיטימית כאשר evidence אינו מספיק.

---

## ‏64. `REJECT`

‏לא כל Challenger ראוי לעוד זמן.

---

## ‏65. `PROMOTE_TO_SHADOW`

‏Promotion ביניים לפני Production.

---

## ‏66. `PROMOTE_TO_CANDIDATE`

‏דרגה מתקדמת יותר כאשר evidence מצטבר.

---

## ‏67. `PROMOTE_TO_CHAMPION`

‏החלטה משמעותית הדורשת evidence bundle מלא.

---

## ‏68. `Demote Champion`

‏Champion אינו חסין מירידה בדרגה.

---

## ‏69. Incumbent advantage

‏ל־Champion יש יתרון מובנה: הוא מוכר, operationally proven ויש עליו יותר evidence.

---

## ‏70. Challenger צריך לנצח בפער משמעותי

‏Tie אינו promotion.

---

## ‏71. `Minimum Meaningful Improvement`

‏מגדירים מראש מהו שיפור שמצדיק שינוי.

---

## ‏72. Non-inferiority guardrails

‏בחלק מהמדדים מספיק שה־Challenger לא יהיה גרוע משמעותית.

---

## ‏73. Superiority metrics

‏ב־Primary Metric נדרוש שיפור ברור.

---

## ‏74. Safety metrics

‏בחלק מהמדדים לא נסכים אפילו ל־small regression.

---

## ‏75. P0 regression

‏Safety/correctness regression קריטי פוסל Challenger גם אם PnL משתפר.

---

## ‏76. P1 regression

‏דורש review מפורש.

---

## ‏77. `No Aggregate Override`

‏Score משוקלל לא אמור למחוק blocker קריטי.

---

## ‏78. `Decision Parity`

‏נמדוד באיזה אחוז מההחלטות Challenger מסכים עם Champion.

---

## ‏79. High parity

‏אם parity הוא 99.9%, ייתכן שהשינוי כמעט לא משנה behavior.

---

## ‏80. Low parity

‏אם parity נמוך מאוד, זה כבר שינוי Strategy מהותי ודורש evidence רחב יותר.

---

## ‏81. `Disagreement Rate`

```text
Disagreement Decisions / Comparable Decisions
```

---

## ‏82. `Useful Disagreement Rate`

‏כמה disagreements שיפרו decision outcome.

---

## ‏83. `Harmful Disagreement Rate`

‏כמה disagreements פגעו.

---

## ‏84. `Neutral Disagreement`

‏שינוי behavior ללא ערך כלכלי ברור הוא complexity בלי edge.

---

## ‏85. Trade-vs-NoTrade disagreements

‏אלה לעיתים החשובים ביותר.

---

## ‏86. Candidate-switch disagreements

‏Challenger בחר מניה אחרת.

---

## ‏87. Timing disagreements

‏אותו symbol, זמן שונה.

---

## ‏88. Exit disagreements

‏אותו entry, exit שונה.

---

## ‏89. Execution disagreements

‏אותה thesis, order tactic שונה.

---

## ‏90. `First Divergence`

‏בכל outcome שונה, נרצה לדעת מה הייתה הנקודה הראשונה שבה שתי הגרסאות התפצלו.

---

## ‏91. First Divergence attribution

‏היא יכולה להיות:

- ‏Feature.
- ‏Score.
- ‏Rank.
- ‏Veto.
- ‏Eligibility.
- ‏Execution.
- ‏Exit.

---

## ‏92. `Why Challenger Won`

‏צריך הסבר מכני, לא רק metric.

---

## ‏93. `Why Challenger Lost`

‏גם הפסדים צריכים classification.

---

## ‏94. Win taxonomy

‏לדוגמה:

- ‏Avoided stale winner.
- ‏Selected fresher candidate.
- ‏Reduced adverse selection.
- ‏Exited before giveback.

---

## ‏95. Loss taxonomy

‏לדוגמה:

- ‏Over-filtered.
- ‏Late decision.
- ‏Higher latency.
- ‏False veto.
- ‏Overreacted to noise.

---

## ‏96. Counterfactual logging

‏צריך לשמור מספיק state כדי להעריך מה היה קורה לחלופה.

---

## ‏97. Top-K logging

‏בלי Top-K קשה לנתח candidate switches.

---

## ‏98. Full Decision Snapshot

‏ה־snapshot צריך לכלול inputs רלוונטיים לשתי הגרסאות.

---

## ‏99. Data parity

‏אם Challenger מקבל feed עשיר יותר, זה experiment אחר.

---

## ‏100. Provider parity

‏אם provider שונה, צריך לתייג זאת כמשתנה מפורש.

---

## ‏101. Hardware parity

‏Performance comparison דורש סביבה דומה.

---

## ‏102. Load parity

‏Challenger לא צריך להיבחן רק בשעות שקטות.

---

## ‏103. Burst tests

‏נבדוק behavior תחת bursts.

---

## ‏104. Soak tests

‏נבדוק drift או resource leak לאורך זמן.

---

## ‏105. GC impact

‏מודל או Feature חדש עלולים לשפר prediction ולפגוע latency דרך allocations.

---

## ‏106. Backpressure impact

‏Challenger יכול לשנות compute pressure של כל המערכת.

---

## ‏107. Priority inversion

‏אסור ששיפור scanner יפגע ב־exit processing של position פתוחה.

---

## ‏108. Open-position priority

‏Exit safety קודמת ל־challenger evaluation.

---

## ‏109. Shadow isolation

‏Challenger ב־Shadow לא צריך לשנות Production state.

---

## ‏110. Side-effect free evaluation

‏קריאות broker, writes או shared mutable state צריכים להיות מבודדים.

---

## ‏111. Deterministic comparison

‏עם אותם inputs, logic deterministic צריך להחזיר אותה החלטה.

---

## ‏112. Random models

‏אם יש randomness, seed ו־model artifact חייבים להיות versioned.

---

## ‏113. `ChallengerBudget`

‏מגבילים כמה CPU/memory/latency Challenger רשאי לצרוך.

---

## ‏114. Challenger must not degrade Champion

‏הניסוי עצמו לא צריך להאט את Production path.

---

## ‏115. Async deep evaluation

‏אפשר להריץ חישובים כבדים מחוץ ל־critical path.

---

## ‏116. Sampling challengers

‏אם העלות גבוהה, ניתן להריץ Challenger על sample מוגדר מראש.

---

## ‏117. Sampling bias

‏Sample צריך להיות representational ולא לבחור רק cases “מעניינים”.

---

## ‏118. Stratified evaluation

‏אפשר לדגום לפי regimes, liquidity ו־event states.

---

## ‏119. `Coverage Matrix`

‏נרצה matrix של evidence לפי context.

---

## ‏120. Sparse cells

‏Bucket עם מעט evidence לא מקבל confidence גבוה.

---

## ‏121. `Confidence`

‏לכל comparison צריך confidence estimate.

---

## ‏122. Confidence אינו probability of profit

‏הוא confidence באיכות evidence, לא הבטחת תוצאה.

---

## ‏123. Champion drift

‏גם baseline עצמו יכול להשתנות בביצועים לאורך זמן.

---

## ‏124. Relative comparison בזמן drift

‏שתי גרסאות יכולות להידרדר יחד.

---

## ‏125. Absolute quality gate

‏Challenger לא צריך להיות promoted רק כי Champion גרוע יותר.

---

## ‏126. `Relative + Absolute`

‏Promotion צריך לעבור גם השוואה יחסית וגם quality floor מוחלט.

---

## ‏127. NO TRADE quality

‏נבדוק האם Challenger יודע להימנע טוב יותר כשאין edge.

---

## ‏128. Trade frequency

‏יותר trades אינם בהכרח טובים יותר.

---

## ‏129. Opportunity efficiency

‏כמה value נוצר לכל decision/trade.

---

## ‏130. Turnover cost

‏Challenger אגרסיבי יותר עלול לשחוק edge דרך turnover.

---

## ‏131. Capacity effect

‏שינוי strategy יכול להשפיע על capacity.

---

## ‏132. Size sensitivity

‏נבדוק האם היתרון נשמר בגדלים שונים.

---

## ‏133. Fill sensitivity

‏נבדוק optimistic/base/stress fill assumptions.

---

## ‏134. Cost sensitivity

‏נבדוק יתרון גם כאשר costs גבוהים יותר מההערכה.

---

## ‏135. Latency sensitivity

‏נבדוק כמה challenger advantage שורד delays.

---

## ‏136. `Stress Advantage`

‏Challenger שמנצח רק בתרחיש אופטימי הוא חלש.

---

## ‏137. `Robust Advantage`

‏יתרון שנשמר תחת stress הוא evidence חזק יותר.

---

## ‏138. `Guardrail Breach Log`

‏כל breach נשמר, גם אם aggregate result טוב.

---

## ‏139. Challenger incident

‏Operational bug ב־Shadow הוא evidence חשוב.

---

## ‏140. Missing telemetry

‏אם לא ניתן למדוד comparison קריטי, הניסוי אינו complete.

---

## ‏141. `Evidence Completeness`

‏נמדוד איזה אחוז מה־required evidence באמת קיים.

---

## ‏142. Unknowns

‏`UNKNOWN` בתחום קריטי אינו נחשב PASS.

---

## ‏143. `Promotion Packet`

‏לפני promotion נבנה artifact מסודר.

---

## ‏144. Promotion Packet fields

```text
ChampionVersion
ChallengerVersion
Hypothesis
PrimaryMetric
Guardrails
EvidenceWindow
DisagreementCount
EffectiveSampleSize
RegimeCoverage
EconomicDelta
LatencyDelta
CostDelta
TailRiskDelta
KnownRisks
Unknowns
RollbackPlan
Decision
```

---

## ‏145. Reviewer question

‏“איפה בדיוק Challenger טוב יותר?”

---

## ‏146. Reviewer question 2

‏“איפה הוא גרוע יותר?”

---

## ‏147. Reviewer question 3

‏“מה יכול לגרום לנו להתחרט על promotion?”

---

## ‏148. Pre-mortem

‏לפני promotion נכתוב מראש תרחישי failure.

---

## ‏149. Rollback criteria

‏מוגדרים לפני promotion.

---

## ‏150. Automatic demotion criteria

‏Critical safety/operational regression יכול להפעיל demotion אוטומטי.

---

## ‏151. Manual review criteria

‏Economic drift שאינו קריטי יכול לדרוש review ולא kill מיידי.

---

## ‏152. Promotion is not permanent

‏Champion חדש מתחיל תקופת monitoring.

---

## ‏153. `Post-Promotion Watch`

‏ננטר את metrics שהכריעו את promotion.

---

## ‏154. Regression after promotion

‏אם live evidence סותר shadow evidence, נעצור ונבצע RCA.

---

## ‏155. Simulator calibration

‏פער Champion/Challenger בין simulation ל־live צריך לעדכן את simulator.

---

## ‏156. `Promotion Debt`

‏Promotion ללא observability מספקת יוצר debt מסוכן.

---

## ‏157. Multiple Challengers

‏אפשר להריץ כמה challengers, אבל יש מחיר statistical ו־operational.

---

## ‏158. Tournament trap

‏בחירת “המנצח” מתוך עשרות גרסאות מגבירה Winner's Curse.

---

## ‏159. Sequential testing discipline

‏לא מפסיקים ניסוי ברגע שנראה Metric חיובי זמני.

---

## ‏160. Stopping rules

‏מגדירים מראש תנאים לסיום.

---

## ‏161. Evidence horizon

‏החלון צריך להיות מספיק לכסות regimes רלוונטיים, לא רק מספר ימים קבוע.

---

## ‏162. Calendar time vs sample time

‏שבוע עם מעט disagreements לא שקול לשבוע עם הרבה evidence.

---

## ‏163. `Disagreement Density`

‏כמה evidence שימושי נוצר ליחידת זמן.

---

## ‏164. Candidate-specific Challengers

‏אפשר לשנות רק ranking.

---

## ‏165. Veto-specific Challengers

‏אפשר לבחון veto חדש בלי לשנות score.

---

## ‏166. Execution-specific Challengers

‏אפשר להשוות order policy על אותה decision intent.

---

## ‏167. Exit-specific Challengers

‏אפשר להשוות exit policy על אותה entry cohort.

---

## ‏168. Feature-specific Challengers

‏Feature חדש נבחן מול identical system חוץ ממנו.

---

## ‏169. Model-specific Challengers

‏Model חדש נבחן מול same labels/features ככל האפשר.

---

## ‏170. Data-provider Challenger

‏Provider comparison הוא experiment עצמאי.

---

## ‏171. Provider comparison metrics

‏Freshness, completeness, corrections, gaps, latency ו־decision impact.

---

## ‏172. Cost-model Challenger

‏לפעמים ה־Challenger הוא estimate טוב יותר ל־costs, לא strategy חדשה.

---

## ‏173. Risk-policy Challenger

‏אפשר לבחון risk policy ב־shadow/counterfactual בלי להגדיל exposure.

---

## ‏174. `Challenger Scope`

‏כל experiment מציין אילו components הוא רשאי לשנות.

---

## ‏175. `Out-of-Scope Change`

‏שינוי לא מתוכנן מבטל comparability.

---

## ‏176. Contamination detection

‏אם config השתנה באמצע experiment, צריך split evidence.

---

## ‏177. Version transition boundary

‏Evidence לפני ואחרי transition לא מתערבב ללא תיוג.

---

## ‏178. `As-Traded Champion`

‏Baseline צריך לשקף מה שבאמת רץ, לא מה שחשבנו שרץ.

---

## ‏179. `As-Configured Challenger`

‏יש לוודא שהגרסה הפעילה תואמת manifest.

---

## ‏180. Integrity checks

‏Version identity, input parity ו־telemetry completeness נבדקים לפני ניתוח תוצאות.

---

## ‏181. Practitioner Secret — disagreement הוא gold

‏רוב הלמידה האמיתית נמצאת במקומות שבהם שתי הגרסאות לא מסכימות.

---

## ‏182. Practitioner Secret — wins without mechanism are fragile

‏אם לא יודעים להסביר למה Challenger ניצח, צריך confidence נמוך יותר.

---

## ‏183. Practitioner Secret — complexity hides in operations

‏שיפור מחקרי קטן יכול ליצור burden גדול ב־Production.

---

## ‏184. Practitioner Secret — tail regression matters more than average gain

‏שיפור mean קטן לא מצדיק tail risk משמעותי.

---

## ‏185. Practitioner Secret — NO TRADE can be the winning decision

‏Challenger יכול להשתפר בעיקר בכך שהוא נמנע טוב יותר.

---

## ‏186. Practitioner Secret — shadow bugs are valuable

‏Bug שנמצא לפני promotion חסך failure יקר יותר.

---

## ‏187. Practitioner Secret — keep the old Champion reproducible

‏אי אפשר rollback אם ה־Champion הישן אינו artifact מלא.

---

## ‏188. Practitioner Secret — promotion invalidates assumptions

‏ברגע שה־Challenger נהיה Champion, צריך להתחיל למדוד אותו כ־baseline חדש.

---

## ‏189. Practitioner Secret — disagreement can drift

‏גם אם parity היה גבוה בתחילה, market regime חדש יכול להגדיל אותו.

---

## ‏190. Practitioner Secret — compare process, not only outcome

‏Decision latency, telemetry quality ו־recoverability הם חלק מההשוואה.

---

## ‏191. Baseline מומלץ לרובוט שלנו

‏ה־Champion יהיה StrategyVersion יציב, פשוט וברור ככל האפשר.

---

## ‏192. Challenger ראשון

‏כדאי להתחיל מ־single-change challenger, לא redesign מלא.

---

## ‏193. Shadow first

‏Challenger חדש יפעל ב־Shadow לפני כל promotion משמעותי.

---

## ‏194. Full decision snapshot

‏נשמור input/output של שתי הגרסאות בכל disagreement חשוב.

---

## ‏195. Top-K comparison

‏נשווה לא רק Rank #1 אלא גם מבנה top candidates.

---

## ‏196. Economic comparison

‏המדד המרכזי יהיה net executable decision value, לא raw return.

---

## ‏197. Safety comparison

‏שום economic improvement לא עוקף P0 safety blocker.

---

## ‏198. Promotion baseline

```text
Clear Hypothesis
+ Comparable Inputs
+ Enough Disagreements
+ Positive Incremental Net Value
+ No Critical Guardrail Regression
+ Regime Coverage
+ Replay/Shadow Evidence
+ Rollback Ready
= Eligible for Promotion Review
```

---

## ‏199. מה לא לעשות

‏לא לבחור Challenger לפי screenshot יפה, יום מוצלח, PnL יחיד, metric אחד, או משום שהוא “יותר sophisticated”.

---

## ‏200. `Definition of Ready for Champion Promotion`

‏Challenger מוכן לדיון על promotion רק כאשר:

1. ‏ה־change thesis קפואה וברורה.
2. ‏Champion ו־Challenger מזוהים ב־version מלא.
3. ‏השוואת inputs הוגנת ו־Point-in-Time.
4. ‏יש מספיק `Disagreement Set` אפקטיבי.
5. ‏השיפור חיובי נטו לאחר costs ו־latency.
6. ‏השיפור מחזיק ביותר מ־regime אחד או שה־scope המוגבל מפורש.
7. ‏אין P0 regression.
8. ‏ה־tail behavior אינו מדרדר באופן בלתי מתקבל.
9. ‏ה־complexity tax מוצדק.
10. ‏ה־telemetry מלאה.
11. ‏יש rollback path מאומת.
12. ‏ה־Promotion Packet שלם.

‏גם אז המשמעות היא רק: **Eligible for Promotion Review** — לא “מובטח טוב יותר” ולא “בטוח”.
