# ‏77 — Recommendation Sheet: Strategy Versioning

> ‏מקור לימודי עיקרי: `../77-STRATEGY-VERSIONING.md`.
>
> ‏מטרת הקובץ: להגדיר `StrategyVersion` כזהות מלאה, immutable וניתנת לשחזור של כל הרכיבים שקובעים התנהגות — קוד, Config, Features, Models, Veto/Risk/Execution policies, Data contracts, Universe, Cost model ו־Runtime contracts.
>
> ‏המקטע מוגבל ל־`Research / Replay / Shadow / Paper` ולתכנון Architecture/Governance. הוא אינו הוראה לבצע מסחר בכסף אמיתי ואינו אישור Production למסחר אמיתי.

---

## ‏1. Decision

‏השאלה המרכזית אינה:

```text
Which Git commit ran?
```

‏אלא:

```text
Can we identify, reproduce and compare the exact composite strategy behavior
that produced this decision, run or research result?
```

‏ה־default:

```text
Code Artifact
+ Resolved Config
+ Feature Set
+ Model
+ Veto / Risk / Execution Policies
+ Data / Universe / Cost Contracts
+ Runtime / State / Calendar Contracts
→ Immutable StrategyManifest
→ StrategyVersionId
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏`GitCommit != StrategyVersion`

‏`GitCommit` הוא רכיב בזהות, לא הזהות כולה.

‏אותו code עם Config, thresholds, feature flags, data provider semantics או execution policy שונים יכול לייצר behavior שונה.

### ‏`P0 — Required`: ‏`StrategyManifest` immutable

‏לכל גרסה נשמור Manifest מלא לפחות עם:

```text
Identity
- StrategyVersionId
- CodeCommit
- BuildArtifactDigest

Decision Logic
- ResolvedConfigFingerprint
- FeatureSetVersion
- ModelVersion
- VetoPolicyVersion
- RiskPolicyVersion

Execution / Simulation
- ExecutionPolicyVersion
- BrokerAdapterOrSimulatorVersion
- OrderContractVersion

Data
- DataProviderVersion
- DataContractVersion
- ReferenceDataVersion
- UniverseDefinitionVersion
- DataSnapshotCompatibility

Research Economics
- CostModelVersion
- ExecutionSimulatorVersion

Runtime
- StateSchemaVersion
- CalendarVersion
- RuntimeVersion
- DecisionContractVersion
```

‏Manifest שפורסם אינו נערך במקום. שינוי behavior יוצר Manifest חדש.

### ‏`P0 — Required`: ‏`ResolvedConfig` הוא חלק מהזהות

‏לא שומרים רק source config.

‏נשמור את התוצאה לאחר:

```text
defaults
environment overrides
feature flags
runtime policy resolution
```

‏ואז:

```text
ResolvedConfigFingerprint = hash(CanonicalResolvedConfig)
```

‏Secrets אינם נשמרים plaintext; נשמר reference/version מתאים.

### ‏`P0 — Required`: ‏Defaults אינם “חינם”

‏שינוי default שמשנה behavior הוא שינוי StrategyVersion גם אם קובץ Config לא השתנה.

### ‏`P0 — Required`: Version every behavior-bearing layer

‏גרסה עצמאית נדרשת לפחות ל־:

```text
FeatureSet
Model
VetoPolicy
RiskPolicy
ExecutionPolicy
UniverseDefinition
DataContract
CostModel
StateSchema
```

‏שם Feature זהה עם horizon/input/normalization שונים אינו אותה הגדרה.

### ‏`P0 — Required`: ‏Decision ו־Run תמיד נושאים Strategy identity

‏כל `DecisionSnapshot`, ‏Replay, Shadow/Paper run ו־Experiment evidence צריכים להיות traceable ל־`StrategyVersionId`.

‏נפריד:

```text
StrategyVersion = מה בדיוק הייתה האסטרטגיה
RunId           = הרצה מסוימת של אותה גרסה
ExperimentId    = ניסוי שמשווה גרסה אחת או יותר
```

### ‏`P0 — Required`: ‏As-Traded/As-Run Replay מול Counterfactual Replay

‏במחקר נשמור הבחנה בין:

```text
Historical Replay with original version
→ what actually produced the recorded decision
```

‏לבין:

```text
Counterfactual Replay with another version
→ what the challenger would have done
```

‏אסור לערבב בין השניים.

### ‏`P0 — Required`: Version transitions הם Events

‏אין silent mutation.

‏כל שינוי effective נשמר כ־transition:

```text
OldVersion
NewVersion
EffectiveAt
Reason
Source
ChangeSet
```

‏גם `hot reload` שמשנה behavior יוצר runtime version חדש.

### ‏`P0 — Required`: ‏State compatibility מפורש

‏`StateSchemaVersion` וה־compatibility שלו הם חלק מה־Manifest.

‏אם state persisted אינו compatible עם הגרסה הנוכחית:

```text
REPLAY / RESUME NOT TRUSTED
```

‏לא ממציאים compatibility.

### ‏`P0 — Required`: Unknown critical version fails closed in research readiness

‏כאשר identity קריטית אינה ידועה או components שאמורים להיות זהים מפרסמים fingerprints שונים:

```text
DecisionReadiness = NOT_READY / UNKNOWN
```

‏אין להפוך output כזה ל־actionable research conclusion.

### ‏`P1 — Preferred Default`: ‏`StrategyDiff`

‏נבנה diff machine-readable בין Manifests לפי שכבות:

```text
Code
Config
Features
Models
Vetoes
Risk
Execution
Data
Universe
Cost
Runtime
```

‏לכל שינוי נסווג impact:

```text
ResearchOnly
ObservabilityOnly
PerformanceOnly
DecisionAffecting
ExecutionAffecting
RiskAffecting
DataContractAffecting
```

### ‏`P1 — Preferred Default`: ‏ValidationScope נגזר מה־diff

‏שינוי Observability-only אינו דורש אותו מסלול כמו Decision-affecting change.

‏לעומת זאת שינוי ב־Data semantics, Risk, Veto, Feature definition או Execution policy מחייב evidence חדש מתאים.

### ‏`P1 — Preferred Default`: ‏Evidence lineage לפי Version

‏כל claim ב־Promotion/Research packet יקשר ל־:

```text
StrategyVersionId
RunId
ExperimentId
DataSnapshotId
ConfigFingerprint
```

‏Evidence ישן אינו מועבר אוטומטית לגרסה חדשה.

### ‏`P1 — Preferred Default`: ‏Version-aware metrics

‏כל metrics של Ranking, Veto, Latency, Costs, Decision impact ו־Outcome מחולקים לפי Version.

‏אם Version התחלפה באמצע Session/Run, אין לערבב את שתי התקופות כמקשה אחת.

### ‏`P1 — Preferred Default`: ‏Version Registry יחיד

‏נחזיק מקור אמת אחד לגרסאות ידועות, status, manifests, evidence lineage ו־transition history.

‏כל instance/run מפרסם בתחילת עבודה את ה־Manifest שלו; mismatch מול expected identity הוא incident.

### ‏`P1 — Preferred Default`: Lifecycle מפורש

```text
DRAFT
→ RESEARCH
→ VALIDATED
→ SHADOW
→ CANDIDATE
→ ACTIVE/APPROVED
→ SUSPENDED
→ RETIRED
→ ARCHIVED
```

‏בפרויקט הנוכחי `ACTIVE/APPROVED` הוא סטטוס Architecture/Research-readiness בלבד, לא אישור למסחר בכסף אמיתי.

### ‏`P1 — Preferred Default`: ‏PromotionRecord ו־RollbackTarget

‏כל Promotion שומר:

```text
FromVersion
ToVersion
WhyThisVersionExists
WhyNotPreviousVersion
WhyNotSimplerAlternative
EvidencePacket
KnownRisks
RollbackTarget
ValidationScope
```

### ‏`P2 — Useful Improvement`: Version-aware CI

‏CI יכול לבדוק:

```text
Manifest completeness
Fingerprint consistency
Golden Decision replay
Golden Execution simulation
Golden Recovery replay
Schema compatibility
Deterministic sample replay
```

### ‏`P2 — Useful Improvement`: ‏Compatibility Matrix

‏כאשר רכיבים מתפתחים בנפרד, נשמור compatibility בין:

```text
Scanner / Decision contract
Execution adapter / simulator
State schema
Event schema
Data contract
```

### ‏`P3 — Advanced Challenger`: ‏Decision/Rank/Veto/Execution Diff

‏להשוואת Champion/Challenger נמדוד היכן בפועל behavior השתנה:

```text
DecisionDiff
RankDiff
VetoDiff
ExecutionDiff
ExitDiff
CostDiff
LatencyDiff
```

‏זה חשוב יותר מלהסתפק בהשוואת aggregate metric יחיד.

### ‏`P4 — Specialist`: Automated revalidation plan from manifest diff

‏לאחר שה־Versioning יציב, אפשר לגזור אוטומטית אילו suites ו־evidence packs נדרשים לכל ChangeSet.

---

## ‏3. Why

‏Versioning הוא תנאי ל־causal attribution.

‏בלי Composite identity אי־אפשר לדעת אם שינוי בתוצאה נבע מ־Signal, Config, Data semantics, execution simulation, Universe, Cost model או Runtime.

‏הוא גם מונע `Narrative Drift`: שינוי הסיפור בדיעבד לגבי “איזו אסטרטגיה הייתה פעילה”.

---

## ‏4. Use When

‏המלצה זו חלה על:

- ‏Backtest ו־Replay.
- ‏Shadow/Paper research.
- ‏Champion/Challenger comparison.
- ‏RCA.
- ‏Feature retirement/reactivation.
- ‏Data provider/contract changes.
- ‏Config/threshold changes.
- ‏Model changes.
- ‏Execution simulator/policy changes.
- ‏State/schema migrations.

---

## ‏5. Do Not Use When

‏אין צורך ליצור StrategyVersion חדש לשינוי שאין לו שום השפעה behaviorally והוא באמת Observability-only/documentation-only; אבל גם אז ChangeSet צריך לסווג זאת במפורש.

---

## ‏6. Alternatives

### ‏Alternative A — Git SHA בלבד

‏פשוט, אך חסר Config/Data/Model/Policy identity.

### ‏Alternative B — SemVer בלבד

‏קריא לאדם, אך חלש ללא Manifest fingerprint.

### ‏Alternative C — Manifest fingerprint בלבד

‏יציב למכונה אך קשה לתפעול אנושי.

### ‏Preferred

```text
Human-readable StrategyVersionId
+ Immutable Manifest
+ Content fingerprints/digests
```

---

## ‏7. Trade-offs

‏Versioning מלא מוסיף metadata, storage, CI checks ו־discipline.

‏אבל האלטרנטיבה היא מחקר שאינו reproducible והשוואות שלא ניתן לייחס סיבתית.

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מתחיל מ־:

- ‏Versioning platform כבדה.
- ‏Service discovery מורכב רק לצורך versions.
- ‏Auto-promotion לפי version metrics.
- ‏Hundreds of independently versioned micro-fields.
- ‏SemVer policy מסובכת לפני שיש Manifest אמין.
- ‏`latest` tags או artifacts mutable.
- ‏Config hot reload ללא transition event.

---

## ‏9. What to Add Later

‏לאחר Baseline יציב:

- ‏`StrategyDiff` UI/tooling.
- ‏Compatibility matrix automation.
- ‏Evidence lineage graph.
- ‏Version-aware dashboards.
- ‏Automatic validation-scope derivation.
- ‏Artifact retention policy לפי reproducibility needs.

---

## ‏10. Required Data / Evidence

‏לכל Version נדרשים לפחות:

```text
Manifest
ResolvedConfig
Artifact digests
Feature/Model/Policy versions
Data and Reference-data identities
State/Contract versions
ChangeSet
Validation results
Known risks
Lifecycle state
```

---

## ‏11. Promotion Criteria

‏Version יכולה להתקדם ב־Research lifecycle רק כאשר:

- ‏Manifest מלא ו־immutable.
- ‏ה־diff מה־baseline ידוע.
- ‏ValidationScope בוצע.
- ‏Replay/Shadow evidence ניתן לשחזור.
- ‏critical compatibility ידועה.
- ‏אין unresolved identity mismatch.
- ‏Known risks מתועדים.
- ‏קיים rollback/recovery target מחקרי ברור.

---

## ‏12. Rejection Criteria

‏אין לקדם Version אם:

- ‏לא ניתן לשחזר ResolvedConfig.
- ‏Data/Feature/Model/Policy identity אינה חד־משמעית.
- ‏artifact mutable או overwritten.
- ‏State/schema compatibility אינה ידועה.
- ‏Replay אינו deterministic במקום שבו הוא אמור להיות.
- ‏Evidence אינו קשור לגרסה המדויקת.
- ‏Version transition התרחש silently.

---

## ‏13. Metrics

‏נמדוד לפחות:

```text
ManifestCompletenessRate
VersionMismatchCount
UnversionedDecisionCount
UnversionedRunCount
ReplayReproductionRate
DeterminismFailureRate
CompatibilityFailureCount
SilentMutationCount
TimeToIdentifyDecisionVersion
TimeToReproduceDecision
VersionSpecificDecisionDiffRate
VersionSpecificLatencyDelta
VersionSpecificCostDelta
```

---

## ‏14. Failure Modes

- ‏Git SHA מזוהה בטעות כ־StrategyVersion מלא.
- ‏Config default משתנה בלי fingerprint חדש.
- ‏Provider semantics משתנים תחת schema זהה.
- ‏Model artifact מוחלף באותו path/tag.
- ‏RunId מתבלבל עם StrategyVersion.
- ‏Counterfactual replay מוצג כאילו היה historical truth.
- ‏partial-day version transition נבלע ב־daily aggregate.
- ‏State migration אינה deterministic.
- ‏Feature retired נמחק ולכן Replay ישן נשבר.
- ‏Metrics משני versions מתערבבים.

---

## ‏15. User-Specific Application

‏ל־whole-market short-horizon research שלנו, ה־KISS baseline הוא:

```text
1. Manifest immutable לכל StrategyVersion.
2. GitCommit + BuildDigest + ResolvedConfigFingerprint.
3. Feature/Veto/Risk/Execution/Data versions מפורשות.
4. DecisionEpoch ו־DecisionPacket שומרים StrategyVersionId.
5. כל Replay/Shadow/Paper run שומר RunId + StrategyVersionId.
6. ExperimentId נפרד מ־RunId ומ־StrategyVersion.
7. No silent config mutation.
8. Data/Rank/State generations נשמרים לצד Version identity.
9. Golden replay מאמת reproducibility.
10. StrategyDiff נבנה לפני infrastructure מורכב יותר.
```

‏כך Recommendation 77 מחבר ישירות את 27 Replay, ‏73 Daily Review, ‏74 Scanner Diagnostics, ‏75 Feature Retirement ו־76 Continuous Improvement למסגרת Evidence אחת שניתנת לשחזור.

---

## ‏16. Confidence

‏**High** לגבי הצורך ב־Composite Manifest, immutable artifacts, resolved config identity והפרדת `StrategyVersion / RunId / ExperimentId`.

‏**Medium** לגבי naming scheme מדויק, granularity של sub-versions ו־retention horizon — אלה החלטות implementation שצריכות להישאר פשוטות עד שיש Evidence לצורך במורכבות נוספת.

---

## ‏17. Fact / Judgment / Hypothesis

### ‏Fact

‏אותו source code יכול לייצר behavior שונה כאשר Config, Models, Data semantics או Policies משתנים.

### ‏Judgment

‏ה־Baseline המומלץ הוא Immutable Composite Manifest + fingerprints, ולא מערכת Versioning כבדה.

### ‏Hypothesis

‏`StrategyDiff` ו־version-aware evidence lineage יקצרו RCA, יצמצמו false comparisons ויעלו את איכות ה־Continuous Improvement. צריך למדוד זאת.

---

## ‏18. Time-Sensitive Facts

‏אין במקטע זה תלות הכרחית ברגולציה, מחיר או API ציבורי עדכני. גרסאות של Provider/Broker/Data contracts עצמן הן inputs versioned שדורשים אימות בזמן שימוש, ולא constants במסמך.

---

## ‏19. Recommended MVP

```text
StrategyManifest.json
VersionRegistry
ResolvedConfigFingerprint
BuildArtifactDigest
StrategyVersionId on DecisionPacket
RunId on every research run
ExperimentId on comparisons
ChangeSet
Golden reproducibility test
StrategyDiff CLI/report
```

‏זה מספיק כדי לקבל ערך משמעותי בלי לבנות platform מורכבת.

---

## ‏20. Final Recommendation

‏נגדיר Strategy לא לפי “איזה commit היה”, אלא לפי **איזה Composite Artifact יצר את ההתנהגות**.

‏כל תוצאה מחקרית משמעותית צריכה לענות באופן חד־משמעי:

```text
Which exact version produced this decision?
What exactly changed from the baseline?
Can we reproduce it?
Can we compare it fairly?
Can we trace the evidence back to that exact version?
```

‏אם אחת מהתשובות הקריטיות היא “לא יודעים”, ה־Versioning עדיין אינו מספיק.