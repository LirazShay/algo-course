# ‏שלב 77 — `Strategy Versioning`: לדעת בדיוק איזו אסטרטגיה יצרה כל החלטה

> ‏מטרת הפרק: לבנות שיטת Versioning מקצועית ל־Strategy כך שכל Backtest, Replay, Shadow run, Paper run, Live decision, Order ו־RCA יהיו מקושרים לגרסה חד־משמעית וניתנת לשחזור של הקוד, ה־config, ה־features, ה־models, ה־vetoes, ה־execution policy וה־data contracts.
>
> ‏העיקרון המרכזי: **Strategy Version אינו רק Git commit. Strategy אמיתית היא Composite Artifact; אם אי־אפשר לשחזר בדיוק את הקוד, ה־configuration, ה־inputs וה־policies שיצרו החלטה, אין לנו גרסה — יש לנו רק זיכרון חלקי.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

## ‏1. למה Strategy Versioning הוא רכיב מחקרי ולא רק DevOps

‏בלי Versioning אפשר לראות ש־PnL השתפר ולא לדעת למה.

‏אולי השתנה:

- ‏Feature.
- ‏Threshold.
- ‏Universe filter.
- ‏Data provider.
- ‏Normalization.
- ‏Veto rule.
- ‏Order type.
- ‏Latency.
- ‏Broker adapter.
- ‏Fee model.

‏לכן Versioning הוא תנאי ל־causal attribution.

---

## ‏2. `GitCommit != StrategyVersion`

‏Git commit הוא חלק מהזהות.

‏אבל Strategy בפועל יכולה להשתנות גם אם הקוד לא השתנה.

‏לדוגמה:

```text
Same code
+ Different config
+ Different weights
+ Different feature flags
= Different behavior
```

---

## ‏3. `Composite Strategy Identity`

‏זהות Strategy צריכה לכלול לפחות:

```text
CodeVersion
ConfigFingerprint
FeatureSetVersion
ModelVersion
VetoPolicyVersion
ExecutionPolicyVersion
RiskPolicyVersion
DataContractVersion
UniverseDefinitionVersion
CostModelVersion
```

---

## ‏4. `StrategyVersionId`

‏נרצה מזהה קצר וברור.

‏לדוגמה:

```text
strategy-2026.10.26.3
```

‏או SemVer אם הוא מתאים לתהליך.

---

## ‏5. Human-readable מול Machine-stable identity

‏שם אנושי טוב לקריאה.

‏Fingerprint טוב להשוואה אוטומטית.

‏צריך את שניהם.

---

## ‏6. `ConfigFingerprint`

‏כל Config פעיל צריך לעבור canonical serialization ואז hashing.

‏לדוגמה רעיונית:

```text
ConfigFingerprint = SHA256(CanonicalConfig)
```

---

## ‏7. Canonical Serialization

‏אותו Config לוגי צריך להפיק אותו hash.

‏לכן:

- ‏סדר properties קבוע.
- ‏numeric formatting קבוע.
- ‏timezone מפורש.
- ‏null semantics קבועים.
- ‏default values מפורשים.

---

## ‏8. Defaults הם חלק מהגרסה

‏Default חבוי הוא config חבוי.

‏אם קוד חדש משנה default בלי שינוי config file, ההתנהגות השתנתה.

---

## ‏9. `ResolvedConfig`

‏צריך לשמור לא רק source config אלא את ה־Resolved Config בפועל אחרי:

- ‏defaults.
- ‏environment overrides.
- ‏secret references.
- ‏feature flags.
- ‏runtime policy resolution.

---

## ‏10. Environment variables

‏Environment variable שמשנה behavior הוא חלק מ־runtime identity.

‏אסור להתעלם ממנו ב־reproducibility.

---

## ‏11. Secrets אינם נשמרים ב־fingerprint כ־plaintext

‏שומרים:

- ‏secret reference/version.
- ‏לא secret value.

---

## ‏12. `FeatureSetVersion`

‏לא מספיק לדעת אילו Features קיימים בקוד.

‏צריך לדעת אילו Features היו Active בהחלטה.

---

## ‏13. Feature parameters

‏Feature אחד עם horizon של `10s` ו־אותו Feature עם `30s` הם למעשה שתי הגדרות שונות.

---

## ‏14. Feature normalization

‏Normalization method הוא חלק מה־Feature identity.

‏למשל:

```text
RawReturn10s
ZScoreReturn10s
CrossSectionalRankReturn10s
```

‏הם אינם אותו Feature.

---

## ‏15. Feature dependencies

‏אם Feature תלוי ב־Mid במקום Last, identity השתנתה גם אם השם נשאר.

---

## ‏16. Feature retirement והגרסה

‏כאשר Feature עובר Retirement, צריך StrategyVersion חדש.

---

## ‏17. Feature reactivation

‏החזרת Feature retired אינה “undo”.

‏זו גרסה חדשה עם Evidence חדש.

---

## ‏18. `ModelVersion`

‏אם יש ML, model artifact הוא חלק בלתי נפרד מה־Strategy.

---

## ‏19. Training data identity

‏ModelVersion צריך לדעת על איזה dataset/window הוא אומן.

---

## ‏20. Training code identity

‏אותו dataset עם training code אחר יכול לייצר model אחר.

---

## ‏21. Hyperparameters

‏Hyperparameters הם חלק מה־model identity.

---

## ‏22. Random seed

‏במקום שבו training אינו deterministic, seed צריך להיות מתועד.

---

## ‏23. Model artifact hash

‏שומרים hash של artifact עצמו.

---

## ‏24. `VetoPolicyVersion`

‏Hard Vetoes, Soft Penalties ו־Cooldowns צריכים version עצמאי.

---

## ‏25. ReasonCode schema

‏שינוי semantics של ReasonCode הוא version change.

---

## ‏26. Veto TTL

‏שינוי `TTL` או decay יכול לשנות decisions משמעותית.

---

## ‏27. Entry veto מול Exit urgency

‏Policy mapping ביניהם הוא חלק מהגרסה.

---

## ‏28. `ExecutionPolicyVersion`

‏Execution policy כוללת:

- ‏order type.
- ‏price construction.
- ‏TTL.
- ‏cancel/replace.
- ‏chase budget.
- ‏routing policy.
- ‏partial-fill behavior.

---

## ‏29. `RiskPolicyVersion`

‏Risk limits הם חלק מה־Strategy behavior.

---

## ‏30. Risk change הוא Strategy change

‏גם אם Signal זהה, שינוי max position או exposure משנה outcome.

---

## ‏31. `UniverseDefinitionVersion`

‏Universe הוא חלק מהאסטרטגיה.

‏שינוי eligibility משנה את distribution של candidates.

---

## ‏32. Historical universe rules

‏Backtest חייב להשתמש ב־UniverseVersion המתאים לזמן.

---

## ‏33. `DataContractVersion`

‏Schema ו־semantics של Market Data חייבים version.

---

## ‏34. Provider change

‏מעבר Provider יכול לשנות:

- ‏timestamps.
- ‏trade conditions.
- ‏quotes.
- ‏coverage.
- ‏latency.

‏לכן הוא behaviorally significant.

---

## ‏35. Same schema, different semantics

‏שני providers יכולים לספק field בשם `last`, אבל עם semantics שונים.

---

## ‏36. `CostModelVersion`

‏Commission, fees, spread model, slippage model ו־impact model צריכים version.

---

## ‏37. Backtest result בלי CostModelVersion אינו self-contained

‏אי־אפשר להשוות אותו מקצועית לאורך זמן.

---

## ‏38. `StrategyManifest`

‏נגדיר artifact מרכזי:

```text
StrategyManifest
- StrategyVersionId
- CodeCommit
- ConfigFingerprint
- FeatureSetVersion
- ModelVersion
- VetoPolicyVersion
- ExecutionPolicyVersion
- RiskPolicyVersion
- UniverseDefinitionVersion
- DataContractVersion
- CostModelVersion
```

---

## ‏39. Manifest immutable

‏Manifest שפורסם לגרסה אינו משתנה.

---

## ‏40. שינוי קטן יוצר Manifest חדש

‏גם שינוי “קטן” יכול לשנות decisions.

---

## ‏41. `VersionedDecision`

‏כל decision snapshot צריך לכלול `StrategyVersionId`.

---

## ‏42. `VersionedOrderIntent`

‏לפני שליחת order נשמור את version identity שיצר אותו.

---

## ‏43. Fill inheritance

‏Fill צריך להיות traceable ל־OrderIntent ול־StrategyVersion.

---

## ‏44. Exit inheritance

‏Exit יכול להתרחש תחת גרסה שונה מהגרסה שפתחה את position.

‏צריך לתעד את שתיהן.

---

## ‏45. `EntryStrategyVersion`

‏Position שומר את version שפתח אותו.

---

## ‏46. `CurrentControlVersion`

‏Position פתוח צריך לדעת איזו גרסה כרגע מנהלת אותו.

---

## ‏47. Mid-position deploy

‏Deploy בזמן position פתוח הוא edge case קריטי.

---

## ‏48. Policy לביצוע deploy בזמן exposure

‏צריך להיות מפורש:

```text
Continue old logic
Migrate control
Block deploy
Hybrid controlled handoff
```

---

## ‏49. Default בטוח

‏אין migration אוטומטי של position ownership בלי policy מפורש.

---

## ‏50. `StateSchemaVersion`

‏Persisted strategy state חייב version משלו.

---

## ‏51. State migration

‏אם schema משתנה, migration צריך להיות deterministic ונבדק.

---

## ‏52. Incompatible state

‏אם state אינו compatible, אסור להעמיד פנים שאפשר Resume.

---

## ‏53. Replay compatibility

‏כל StrategyVersion צריכה להגדיר אילו event/schema versions היא יודעת לקרוא.

---

## ‏54. `As-Traded Replay`

‏Replay של אירוע היסטורי צריך לטעון את StrategyVersion המקורית.

---

## ‏55. `Counterfactual Replay`

‏Replay עם Strategy חדשה הוא experiment נפרד.

---

## ‏56. אסור לערבב בין השניים

‏`As-Traded` עונה “מה קרה”.

‏Counterfactual עונה “מה היה קורה”.

---

## ‏57. Backtest identity

‏כל Backtest run צריך לכלול:

```text
StrategyVersion
DataSnapshotVersion
ExecutionSimulatorVersion
CostModelVersion
RunConfigFingerprint
```

---

## ‏58. `ExperimentId`

‏Experiment אינו StrategyVersion.

‏Experiment יכול להשוות כמה versions.

---

## ‏59. `RunId`

‏כל run צריך מזהה ייחודי גם אם אותה גרסה הורצה פעמיים.

---

## ‏60. Deterministic run

‏אם inputs זהים ו־engine deterministic, outcome צריך להיות זהה.

---

## ‏61. Nondeterministic run

‏אם יש stochastic simulation, שומרים seed ו־simulation version.

---

## ‏62. Version lifecycle

```text
DRAFT
→ RESEARCH
→ VALIDATED
→ SHADOW
→ CANDIDATE
→ ACTIVE
→ SUSPENDED
→ RETIRED
→ ARCHIVED
```

---

## ‏63. `DRAFT`

‏רעיון שעדיין אינו evidence-backed.

---

## ‏64. `RESEARCH`

‏גרסה שנבדקת במעבדה.

---

## ‏65. `VALIDATED`

‏עברה gates מחקריים מוגדרים.

---

## ‏66. `SHADOW`

‏מקבלת live inputs בלי שליחת orders.

---

## ‏67. `CANDIDATE`

‏כשירה ל־promotion review.

---

## ‏68. `ACTIVE`

‏הגרסה המורשית לקבל החלטות production.

---

## ‏69. `SUSPENDED`

‏גרסה שהשימוש בה הושהה עקב drift, incident או evidence deterioration.

---

## ‏70. `RETIRED`

‏אינה מועמדת לשימוש חדש.

---

## ‏71. `ARCHIVED`

‏נשמרת לצורך reproducibility ו־audit.

---

## ‏72. Version status אינו mutable history

‏שינוי status צריך audit trail.

---

## ‏73. `PromotionRecord`

‏Promotion צריך לשמור:

- ‏from version.
- ‏to version.
- ‏evidence packet.
- ‏review date.
- ‏known risks.
- ‏rollback target.

---

## ‏74. `RollbackTarget`

‏לפני deploy צריך לדעת לאיזו גרסה חוזרים.

---

## ‏75. Rollback אינו “deploy old binary” בלבד

‏צריך גם config/state compatibility.

---

## ‏76. `Rollback Readiness`

‏צריך לבדוק מראש:

- ‏artifact זמין.
- ‏config זמין.
- ‏state compatible.
- ‏data contracts compatible.
- ‏runbook קיים.

---

## ‏77. `Canary` concept

‏אפשר לחשוף גרסה חדשה לחלק מוגבל מה־decision flow כאשר הארכיטקטורה מאפשרת זאת.

---

## ‏78. Shadow לפני Canary

‏במערכת מסחר קצרה Shadow הוא בדרך כלל שכבת evidence חשובה לפני exposure אמיתי.

---

## ‏79. Version comparison

‏השוואה צריכה להיות מול אותו data/context ככל האפשר.

---

## ‏80. `Decision Diff`

‏נרצה לראות:

```text
Same input
Champion → NO TRADE
Challenger → TRADE A
```

---

## ‏81. `Decision Diff` חשוב יותר מ־aggregate score בלבד

‏הוא מראה איפה בפועל behavior השתנה.

---

## ‏82. `Rank Diff`

‏משווים:

- ‏Top1.
- ‏TopK.
- ‏RankGap.
- ‏churn.
- ‏candidate eligibility.

---

## ‏83. `Veto Diff`

‏איזה candidates נחסמו בגרסה אחת ולא באחרת.

---

## ‏84. `Execution Diff`

‏אותו candidate יכול לקבל order behavior שונה.

---

## ‏85. `Exit Diff`

‏Versioning של Exit חשוב לא פחות מ־Entry.

---

## ‏86. `Cost Diff`

‏שינוי execution יכול לשפר gross PnL ולהחמיר net PnL.

---

## ‏87. `Latency Diff`

‏Strategy חדשה יכולה להיות predictive יותר אבל איטית יותר.

---

## ‏88. End-to-end comparison

‏השוואה נכונה:

```text
Prediction
→ Decision
→ Execution
→ Fill
→ Exit
→ Net Outcome
```

---

## ‏89. Version naming

‏שם צריך להיות machine-friendly ולא תיאור שיווקי.

---

## ‏90. SemVer — מתי כן

‏SemVer מתאים אם יש contract יציב ומשמעות ל־major/minor/patch.

---

## ‏91. SemVer — מתי פחות

‏אם Strategy behavior משתנה תכופות ורב־ממדית, manifest fingerprint חשוב יותר מהמספר עצמו.

---

## ‏92. Date-based versioning

‏יכול להיות נוח לתפעול:

```text
2026.10.26.1
```

---

## ‏93. Human label

‏אפשר לצרף label כמו:

```text
short-momentum-veto-r3
```

‏אבל הוא אינו primary key.

---

## ‏94. Immutable artifacts

‏Artifact שפורסם תחת version לא מוחלף במקום.

---

## ‏95. Never overwrite a model artifact

‏מודל חדש מקבל version חדש.

---

## ‏96. Never reuse a config hash

‏Hash derived מהתוכן בלבד.

---

## ‏97. `BuildArtifactVersion`

‏Binary/container image צריך digest immutable.

---

## ‏98. Container tag אינו מספיק

‏`latest` אינו reproducible.

---

## ‏99. Image digest

‏שומרים digest מדויק.

---

## ‏100. Dependency lock

‏Runtime dependencies צריכות להיות pinned היכן שהן משפיעות על behavior.

---

## ‏101. Runtime version

‏למשל `.NET` runtime version יכולה להיות רלוונטית ל־performance/reproducibility.

---

## ‏102. Clock/timezone config

‏Time semantics הם חלק מה־runtime contract.

---

## ‏103. Calendar version

‏Market calendar/session rules צריכים version.

---

## ‏104. Holiday/session corrections

‏שינוי calendar data יכול לשנות backtest behavior.

---

## ‏105. `ReferenceDataVersion`

‏Security master, symbol mapping ו־corporate-action mapping צריכים identity.

---

## ‏106. Symbol reuse

‏Ticker לבד אינו identity מספק לאורך זמן.

---

## ‏107. `InstrumentId`

‏נרצה stable security identity.

---

## ‏108. Corporate action versioning

‏Adjusted history תלויה ב־corporate-action dataset version.

---

## ‏109. `DataSnapshotId`

‏Research run צריך לדעת איזה snapshot של data שימש אותו.

---

## ‏110. Corrected data

‏אם historical data תוקן, run חדש צריך DataSnapshotId חדש.

---

## ‏111. Reproducibility מול truth correction

‏צריך לשמור גם את הגרסה המקורית וגם corrected truth.

---

## ‏112. `AsKnownAt` identity

‏Research מקצועי צריך לדעת מה היה ידוע בנקודת הזמן.

---

## ‏113. Schema evolution

‏Schema version צריך להיות explicit.

---

## ‏114. Reader compatibility

‏כל component מצהיר אילו schema versions הוא יודע לקרוא.

---

## ‏115. Writer compatibility

‏Writer חדש אינו מניח שכל consumers עודכנו.

---

## ‏116. Dual-read migration

‏לעיתים migration בטוח דורש תקופה של dual-read/dual-write.

---

## ‏117. Versioned event journal

‏כל event persisted עם schema/version metadata.

---

## ‏118. `DecisionContractVersion`

‏מבנה decision output צריך version.

---

## ‏119. `OrderIntentContractVersion`

‏Intent schema צריך version.

---

## ‏120. `ExecutionReportContractVersion`

‏Execution events צריכים contract ברור.

---

## ‏121. Cross-service compatibility

‏אם Scanner ו־Execution deploy בנפרד, צריך compatibility matrix.

---

## ‏122. `CompatibilityMatrix`

‏לדוגמה:

```text
Scanner v12 -> DecisionContract v4
Execution v9 supports DecisionContract v3-v4
```

---

## ‏123. Unknown version

‏Unknown critical version צריך Fail Closed ל־new entries.

---

## ‏124. Exit path

‏גם במקרה version mismatch צריך לשמור יכולת בטוחה לנהל exposure קיים.

---

## ‏125. `ActiveVersionRegistry`

‏Production צריך מקור אמת אחד לגרסה הפעילה.

---

## ‏126. Split-brain version risk

‏שתי instances עם configs שונים יכולות ליצור behavior לא עקבי.

---

## ‏127. Startup version announcement

‏כל instance מפרסמת בתחילת ריצה את manifest שלה.

---

## ‏128. Version mismatch alert

‏אם instances שאמורות להיות זהות אינן זהות, זו תקלה.

---

## ‏129. `Single Writer` ו־Versioning

‏Version identity לא מחליפה fencing/single-writer controls.

---

## ‏130. Config hot reload

‏Hot reload מסוכן אם אינו versioned.

---

## ‏131. Hot reload יוצר runtime version חדש

‏גם בלי restart.

---

## ‏132. Config effective time

‏שומרים מתי config חדש הפך effective.

---

## ‏133. Decision boundary

‏Decision שנוצר לפני config switch צריך identity ישנה.

---

## ‏134. Pending orders בזמן config switch

‏צריך policy מפורש מי מנהל אותם.

---

## ‏135. Version transition event

‏נשמור event:

```text
OldVersion
NewVersion
EffectiveAt
Reason
Operator/AutomationSource
```

---

## ‏136. No silent mutation

‏אין שינוי behavior בלי transition event.

---

## ‏137. `ChangeSet`

‏לכל version כדאי לשמור רשימת שינוי machine-readable.

---

## ‏138. Behavioral classification

‏שינוי יכול להיות:

```text
ResearchOnly
ObservabilityOnly
PerformanceOnly
DecisionAffecting
ExecutionAffecting
RiskAffecting
DataContractAffecting
```

---

## ‏139. Observability-only change

‏לא כל code change דורש revalidation מלא.

---

## ‏140. Decision-affecting change

‏כן דורש evidence חדש.

---

## ‏141. Risk-affecting change

‏דורש review ברמת safety.

---

## ‏142. Data-affecting change

‏יכול invalidate historical comparability.

---

## ‏143. `ValidationScope`

‏Version promotion צריך לדעת מה בדיוק צריך revalidate.

---

## ‏144. Major change invalidates evidence

‏Evidence ישן אינו אוטומטית תקף לגרסה חדשה.

---

## ‏145. Partial evidence reuse

‏אפשר reuse רק אם dependencies לא השתנו והטיעון מתועד.

---

## ‏146. `EvidenceLineage`

‏Promotion packet צריך לקשר כל claim ל־evidence ול־version.

---

## ‏147. `KnownRiskVersion`

‏Known risks יכולים להשתנות בין versions.

---

## ‏148. Kill criteria per version

‏גרסה חדשה יכולה לדרוש kill thresholds שונים.

---

## ‏149. Version-specific monitoring

‏Metrics צריך לתייג ב־StrategyVersion.

---

## ‏150. Version-specific PnL

‏אחרת אי־אפשר לדעת איזו גרסה באמת יצרה outcome.

---

## ‏151. Version-specific latency

‏Performance regression יכול להסתתר אם מערבבים versions.

---

## ‏152. Version-specific veto rate

‏שינוי policy צריך להיות observable.

---

## ‏153. Version-specific rank behavior

‏נמדוד churn, gap, persistence לפי version.

---

## ‏154. Version cohort comparison

‏לא משווים periods לא הוגנים בלי context adjustment.

---

## ‏155. A/B במערכות מסחר

‏A/B פשוט יכול להיות מסוכן בגלל nonstationarity ו־shared market state.

---

## ‏156. Shadow comparison עדיף פעמים רבות

‏אותם inputs, שתי decisions, בלי להכפיל risk.

---

## ‏157. `ChampionVersion`

‏הגרסה הפעילה.

---

## ‏158. `ChallengerVersion`

‏הגרסה שנבדקת מול Champion.

---

## ‏159. Multiple challengers

‏יותר מדי challengers מגדילים multiple-testing risk ו־operational complexity.

---

## ‏160. Challenger budget

‏נגדיר מגבלה לכמות experiments פעילים.

---

## ‏161. Version promotion אינו רק metric win

‏נדרשים גם:

- ‏robustness.
- ‏latency.
- ‏cost.
- ‏safety.
- ‏operability.
- ‏rollback readiness.

---

## ‏162. Promotion delta

‏צריך לתאר מה השתנה ולמה.

---

## ‏163. `Why This Version Exists`

‏לכל version צריכה להיות thesis קצרה.

---

## ‏164. `Why Not Previous Version`

‏חשוב לתעד איזה limitation מנסים לפתור.

---

## ‏165. `Why Not Simpler Alternative`

‏מונע complexity creep.

---

## ‏166. Version graveyard

‏Retired versions נשמרות, לא נמחקות.

---

## ‏167. Resurrection

‏גרסה retired לא חוזרת ישירות ל־ACTIVE.

---

## ‏168. Revalidation on resurrection

‏השוק, הנתונים וה־execution environment יכולים להשתנות.

---

## ‏169. `StrategyDiff` tool

‏כדאי לבנות כלי שמציג machine-readable diff בין manifests.

---

## ‏170. Diff by layer

‏הכלי מפריד:

- ‏Features.
- ‏Thresholds.
- ‏Vetoes.
- ‏Risk.
- ‏Execution.
- ‏Data.
- ‏Models.

---

## ‏171. Diff severity

‏כל שינוי מקבל severity לפי behavioral impact.

---

## ‏172. `RevalidationPlan` from diff

‏אפשר לגזור אוטומטית אילו test suites נדרשים.

---

## ‏173. Version-aware CI

‏CI יכול לחסום promotion אם manifest חסר או inconsistent.

---

## ‏174. Version completeness check

‏אין deploy ל־production בלי manifest מלא.

---

## ‏175. Reproducibility test

‏CI יכול להריץ sample replay ולוודא deterministic output.

---

## ‏176. Golden Decision tests

‏Known input → expected decision תחת version מסוים.

---

## ‏177. Golden Execution tests

‏Known broker events → expected state transitions.

---

## ‏178. Golden Recovery tests

‏Restart/reconnect צריך להחזיר אותו logical state.

---

## ‏179. Version-aware RCA

‏Incident report תמיד מציין version identity מלאה.

---

## ‏180. `First Divergence` בין versions

‏ב־RCA משווים היכן שתי versions התחילו להתנהג אחרת.

---

## ‏181. Version-aware Daily Review

‏Daily Review חייב לחלק metrics לפי version transitions.

---

## ‏182. Partial-day deploy

‏אם הוחלפה גרסה באמצע היום, אין לערבב את כל היום כמקשה אחת.

---

## ‏183. Version-specific regime mix

‏השוואה הוגנת צריכה להבין באילו regimes כל version פעלה.

---

## ‏184. Version-aware feature retirement

‏Feature retired מגרסה חדשה עדיין נחוץ לשחזור versions ישנות.

---

## ‏185. Version-aware data retention

‏שומרים artifacts מספיק זמן כדי לשחזר decisions משמעותיות.

---

## ‏186. `Minimum Reproducible Decision Packet`

```text
DecisionId
Timestamp
InstrumentId
StrategyVersionId
ResolvedConfigFingerprint
DataSnapshotRefs
FeatureSnapshot
RankSnapshot
VetoSnapshot
RiskSnapshot
ExecutionPolicyVersion
Decision
```

---

## ‏187. `Minimum Reproducible Order Packet`

```text
OrderIntentId
DecisionId
StrategyVersionId
BrokerAdapterVersion
OrderParameters
AccountStateVersion
SubmitTimestamp
```

---

## ‏188. `Minimum Reproducible Exit Packet`

```text
PositionId
EntryStrategyVersion
ExitControlVersion
ExitDecisionId
ExitReason
MarketSnapshot
AccountSnapshot
```

---

## ‏189. `Version Integrity Check`

‏ב־startup המערכת מאמתת שכל fingerprints תואמים למה שה־registry מצפה.

---

## ‏190. Mismatch = fail closed for new entries

‏אם strategy identity אינה ודאית, אין לייצר exposure חדש.

---

## ‏191. Version registry corruption

‏גם registry עצמו צריך backup, audit ו־integrity checks.

---

## ‏192. Human override

‏Override ידני לא “עוקף versioning”.

‏הוא event versioned ומתועד.

---

## ‏193. Emergency config

‏Emergency profile צריך manifest משלו.

---

## ‏194. Kill-switch state

‏Kill-switch activation אינו StrategyVersion חדש, אבל הוא Control-State event שחייב audit.

---

## ‏195. Practitioner Secret — Config הוא code

‏במערכת Algo, threshold בקובץ config יכול לשנות economics יותר משינוי של מאות שורות code.

---

## ‏196. Practitioner Secret — Version בלי data identity הוא חצי גרסה

‏אותו code על feed שונה יכול לייצר strategy behavior שונה.

---

## ‏197. Practitioner Secret — Same PnL אינו Same Strategy

‏שתי versions יכולות להגיע לאותו PnL דרך decision paths שונים לחלוטין.

---

## ‏198. Practitioner Secret — Reproducibility היא feature של Production

‏לא רק של Research.

---

## ‏199. Practitioner Secret — Rollback שלא נוסה אינו Rollback Plan

‏צריך להוכיח שהוא עובד גם עם persisted state ו־open exposure scenarios.

---

## ‏200. Practitioner Secret — Versioning מונע Narrative Drift

‏בלי version identity קל לשנות בדיעבד את הסיפור על “מה האסטרטגיה הייתה”.

---

# ‏`Strategy Manifest` מומלץ לרובוט שלנו

```text
StrategyManifest

Identity
- StrategyVersionId
- BuildArtifactDigest
- CodeCommit

Decision Logic
- ConfigFingerprint
- FeatureSetVersion
- ModelVersion
- VetoPolicyVersion
- RiskPolicyVersion

Execution
- ExecutionPolicyVersion
- BrokerAdapterVersion
- OrderContractVersion

Data
- MarketDataProviderVersion
- DataContractVersion
- ReferenceDataVersion
- UniverseDefinitionVersion

Research Economics
- CostModelVersion
- ExecutionSimulatorVersion

Runtime
- StateSchemaVersion
- CalendarVersion
- RuntimeVersion
```

---

# ‏`StrategyVersion` מול `RunId` מול `ExperimentId`

```text
StrategyVersion
= מה בדיוק הייתה האסטרטגיה

RunId
= הרצה אחת מסוימת של אותה אסטרטגיה

ExperimentId
= ניסוי שמשווה אחת או יותר StrategyVersions
```

‏ההפרדה הזו חשובה מאוד.

---

# ‏ארכיטקטורת Versioning מומלצת

```text
Git Commit
   │
   ├── Build Artifact Digest
   ├── Resolved Config Fingerprint
   ├── Feature Manifest
   ├── Model Artifact
   ├── Veto Policy
   ├── Risk Policy
   ├── Execution Policy
   ├── Data Contracts
   └── Universe / Cost / Calendar Versions
              │
              ▼
       StrategyManifest
              │
              ▼
       StrategyVersionId
              │
      ┌───────┼────────┐
      ▼       ▼        ▼
   Backtest  Shadow    Live
      │       │        │
      └───────┴────────┘
              │
              ▼
        Evidence Lineage
```

---

# ‏Baseline מעשי לרובוט שלנו

‏בשלב ראשון אין צורך לבנות platform כבד.

‏מספיק להתחיל מ־KISS:

1. ‏Manifest immutable אחד לכל StrategyVersion.
2. ‏`GitCommit` + `BuildDigest` + `ConfigFingerprint`.
3. ‏גרסאות מפורשות ל־Features, ‏Vetoes, ‏Risk ו־Execution.
4. ‏כל Decision ו־Order Intent שומרים `StrategyVersionId`.
5. ‏כל Backtest/Replay/Shadow run שומרים `RunId` ו־StrategyVersion.
6. ‏כל Promotion שומר Evidence Packet ו־RollbackTarget.
7. ‏אין שינוי behavior שקט דרך config/hot reload.
8. ‏Version mismatch קריטי חוסם Entry חדש.
9. ‏Versions ישנות נשמרות לשחזור.
10. ‏בונים `StrategyDiff` לפני שמוסיפים מערכת Versioning מורכבת יותר.

---

# ‏Definition of Done ל־Strategy Versioning

‏נוכל לומר שמערכת ה־Versioning בשלה כאשר לכל החלטה משמעותית אפשר לענות באופן חד־משמעי על השאלות הבאות:

```text
Which exact strategy version produced this decision?
Which code artifact ran?
Which resolved config was active?
Which features and models were active?
Which veto, risk and execution policies applied?
Which data contracts and provider versions were used?
Can we replay the same decision?
Can we compare it fairly to another version?
Can we roll back safely?
Can we explain exactly what changed between versions?
```

‏אם אחת מהתשובות הקריטיות היא “לא יודעים”, ה־Strategy אינה versioned מספיק.
