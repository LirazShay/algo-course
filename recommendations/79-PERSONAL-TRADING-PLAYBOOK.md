# ‏79 — Recommendation Sheet: Personal Trading Playbook

> ‏מקור לימודי עיקרי: `../79-PERSONAL-TRADING-PLAYBOOK.md`.
>
> ‏מטרת הקובץ: לרכז את ההמלצות שכבר הוכרעו לאורך ה־Recommendation Playbook ל־Operating Doctrine אחת, versioned, auditable וניתנת לשחזור — בלי להפוך את ה־Playbook לקובץ Config, בלי לקבע Hypotheses כאמת, ובלי לאפשר ל־Score, לתוצאה יומית או לשינוי ידני לעקוף Safety/Correctness invariants.
>
> ‏המקטע מוגבל ל־`Research / Replay / Shadow / Paper` ולתכנון Architecture/Governance. הוא אינו הוראה לבצע מסחר בכסף אמיתי, אינו אישור Production למסחר אמיתי ואינו מחליף זכאות, הרשאה, בדיקת Broker/Account או Readiness review מתאים.

---

## ‏1. Decision

‏השאלה המרכזית היא:

```text
Given the evidence and system state currently known,
what is the approved operating doctrine,
what must remain invariant,
what may vary only through controlled research,
and what must cause the system to refuse a new simulated/paper decision?
```

‏ברירת המחדל:

```text
Facts + Current Judgments + Explicit Hypotheses
→ Versioned Playbook
→ Runtime Invariants
→ Decision / Refusal Doctrine
→ Failure / Recovery Doctrine
→ Research / Change Doctrine
→ Evidence-driven Revision
```

‏ה־Playbook אינו מנסה להיות “האסטרטגיה המושלמת”.

‏הוא מגדיר **מה כרגע מותר למערכת המחקרית לעשות, למה, ומה אסור לה לעשות ללא Evidence חדש**.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Playbook הוא חוזה תפעולי, לא README ולא Config

‏ה־Playbook צריך לענות על:

```text
What does the system currently believe?
Which parts are facts, judgments or hypotheses?
What is it allowed to do?
What must it refuse to do?
Which invariants are non-negotiable?
What makes a decision stale or invalid?
How does it fail safely?
What evidence permits change?
```

‏`README` מסביר שימוש.

‏`Config` מגדיר ערכים.

‏`StrategyVersion` מזהה artifact.

‏ה־Playbook מגדיר **Doctrine**.

### ‏`P0 — Required`: Playbook versioned ו־immutable per published version

‏לכל גרסה:

```text
PlaybookVersion
EffectiveFrom
AuthoritativeStatus
RelatedStrategyVersions
ChangeReason
EvidenceLinks
SupersedesVersion
```

‏לא משכתבים היסטוריה. שינוי Doctrine יוצר גרסה חדשה.

### ‏`P0 — Required`: כל טענה משמעותית מסווגת

```text
FACT
JUDGMENT
HYPOTHESIS
```

‏ברירת המחדל:

- ‏`FACT` — ניתן לאימות ישיר או נובע מחוזה מערכת ברור.
- ‏`JUDGMENT` — בחירת Architecture/Governance הנתמכת ב־Evidence הנוכחי.
- ‏`HYPOTHESIS` — טענה אמפירית שעדיין צריכה Validation.

‏אסור ש־Hypothesis תהפוך בשקט ל־Invariant.

### ‏`P0 — Required`: Core Invariants קודמים ל־Strategy Score

‏ה־Playbook ישמור לפחות את ה־invariants הבאים:

```text
Unknown critical state blocks new simulated/paper exposure.
Broker/account truth cannot be replaced by local assumption.
Unknown order effect is never retried blindly.
Stale critical data is not treated as fresh.
Hard safety/correctness veto cannot be overridden by score.
Critical cost uncertainty is not silently converted to zero.
Open-position / exit-state handling has operational priority over new candidate work.
Recovery requires reconciliation before resume.
Critical telemetry absence is not treated as healthy state.
Behavior-changing configuration requires explicit version identity.
```

### ‏`P0 — Required`: ‏`TRADE`, ‏`NO_TRADE`, ‏`UNKNOWN` נשארים semantics נפרדים

```text
TRADE      = the research/paper decision passed all required gates
NO_TRADE   = a valid, explainable decision not to act
UNKNOWN    = the system lacks enough trustworthy state to decide
```

‏אסור למזג `UNKNOWN` לתוך `NO_TRADE`, כי הראשון הוא knowledge failure והשני decision outcome תקין.

### ‏`P0 — Required`: Decision Pipeline אחד, מוסבר ומדיד

```text
Observed Universe
→ Fresh / Eligible Universe
→ Point-in-Time Features
→ Filters
→ Ranking
→ Absolute Quality Gate
→ Negative Evidence / Veto
→ Execution Feasibility
→ Account Eligibility
→ Cost / Remaining Net Edge Estimate
→ TRADE / NO_TRADE / UNKNOWN
→ Pre-Action Revalidation
```

‏ב־scope הנוכחי, כל “action” הוא מחקרי, Replay, Shadow או Paper בלבד.

### ‏`P0 — Required`: Decision Packet מלא

‏לכל החלטה משמעותית נשמור לפחות:

```text
DecisionId
DecisionEpoch
StrategyVersionId
PlaybookVersion
ConfigFingerprint
DataGeneration
UniverseState
TopKSnapshot
FeatureSnapshot
RankSnapshot
VetoSnapshot
CostSnapshot
ContextSnapshot
AccountEligibilityState
ExecutionFeasibilityState
Decision
ReasonCodes
```

### ‏`P0 — Required`: Change Governance אינו חלק מה־hot path

‏שינוי Doctrine או Strategy עובר:

```text
Observation
→ Hypothesis
→ Experiment
→ OOS / Replay
→ Shadow Challenger
→ Promotion / Rejection Review
→ Versioned Change
```

‏לא:

```text
Bad day
→ parameter change
```

### ‏`P0 — Required`: Failure Doctrine מפורש

‏ה־Playbook חייב להכיל התנהגות מפורשת לפחות עבור:

```text
Data disconnect
Broker/account-state disconnect or ambiguity
Unknown order effect
Partial state / partial fill simulation state
Duplicate or out-of-order events
Stale market data
Clock-health failure
Second-writer / fencing violation
Logging / telemetry degradation
State-schema or version mismatch
```

‏הכלל העליון: **fail safe for new risk; preserve the safest available path for existing state management.**

### ‏`P1 — Preferred`: Playbook בנוי משכבות Doctrine קצרות

‏במקום מסמך של מאות exceptions, מומלץ להחזיק Sections יציבים:

```text
Mission / Non-Goals
Core Invariants
Universe Doctrine
Data Doctrine
Feature Doctrine
Ranking Doctrine
Negative-Evidence Doctrine
Decision Doctrine
Execution-Simulation Doctrine
Exit / Flat-State Doctrine
Cost Doctrine
Latency Doctrine
Risk Doctrine
Account / Eligibility Doctrine
Context Doctrine
Research Doctrine
Learning Doctrine
Operational Doctrine
Observability Doctrine
Change Doctrine
Do-Not-Do
```

### ‏`P1 — Preferred`: כל Rule צריך להיות testable או לפחות observable

‏Rule כמו:

```text
Trade only when it looks strong
```

‏אינו מתאים.

‏Rule מקצועי צריך להשאיר:

```text
condition
state
reason code
observable metric
expected behavior
failure behavior
```

### ‏`P1 — Preferred`: Explicit `Do Not Do`

‏ה־Playbook צריך לאסור במפורש לפחות:

```text
No forced participation.
No bypass of hard vetoes because rank/score is high.
No production-style behavior mutation after one weak day.
No duplicate retry when effect is unknown.
No stale-as-fresh substitution.
No paper/simulated fill treated as proof of real fill behavior.
No backtest acceptance without execution realism.
No Challenger promotion from one metric or one short window.
No deletion of negative research results.
No silent manual override.
No mixing Fact, Judgment and Hypothesis.
```

### ‏`P1 — Preferred`: Daily questions, not daily retuning

‏ה־Playbook יכול לתרגם Doctrine לשאלות בקרה:

```text
Before session:
Is data state healthy enough for research?
Is the intended StrategyVersion loaded?
Are clocks / generations / risk controls known?

Before candidate decision:
Is coverage sufficient?
Is the candidate fresh?
Are required features ready?
Is context known enough?

Before simulated/paper action:
Is the decision still valid?
Any hard veto?
Is execution feasibility known?
Is the cost estimate complete enough?

After outcome:
What was expected?
What actually happened?
Where was First Divergence?
What evidence should enter the research queue?
```

### ‏`P2 — Useful`: Doctrine Compliance Checker

‏בהמשך אפשר לבנות checker אוטומטי שמוודא:

```text
Every decision has a StrategyVersion and PlaybookVersion.
Every rejection has ReasonCodes.
Every critical unknown changes eligibility explicitly.
Every experiment has frozen criteria.
Every change points to evidence.
Every manual override is journaled.
Every failure path has a known safe-state transition.
```

### ‏`P3 — Advanced`: Machine-readable Playbook Rules

‏אפשר בהמשך לייצג חלק מה־invariants וה־gates ב־machine-readable policy schema.

‏אבל אין להפוך את כל ה־Playbook ל־rule engine מורכב לפני שיש צורך אמיתי.

### ‏`P4 — Avoid Unless Evidence`: Fully autonomous doctrine mutation

‏לא מומלץ baseline שבו מערכת משנה בעצמה את Doctrine, thresholds, vetoes או promotion gates לפי תוצאות אחרונות.

---

## ‏3. Why

‏ה־Playbook פותר בעיה ש־code, tests ו־monitoring לבדם אינם פותרים: **drift של כוונה**.

‏מערכת יכולה להמשיך “לעבוד” טכנית, ובכל זאת לשנות לאורך זמן:

- ‏מה היא מחשיבה ל־valid data.
- ‏איך היא מפרשת `NO_TRADE`.
- ‏אילו unknowns היא מוכנה לקבל.
- ‏אילו costs היא כוללת.
- ‏איך היא מתייחסת ל־failure.
- ‏כמה evidence נדרש לפני שינוי.

‏Playbook versioned יוצר baseline שמאפשר לשאול:

```text
Did the implementation follow the approved doctrine?
Did the doctrine itself change?
Was the change evidence-backed?
```

‏הוא גם מונע `Narrative Drift`: שינוי בדיעבד של הסיפור על “מה התכוונו שהמערכת תעשה”.

---

## ‏4. Use When

‏נשתמש ב־Playbook כאשר:

- ‏צריך לחבר החלטות מפוזרות של Data, Scanner, Ranking, Veto, Execution Simulation, Cost, Risk, Recovery ו־Research.
- ‏יש כמה StrategyVersions וצריך Doctrine משותפת שמסבירה מה נחשב התנהגות מקובלת.
- ‏צריך לבצע RCA ולבדוק לא רק “מה הקוד עשה” אלא “האם זה מה שהמערכת הייתה אמורה לעשות”.
- ‏נדרש להחליט אם anomaly הוא bug, violation של invariant, hypothesis failure או שינוי context תקין.
- ‏יש צורך ב־handoff ברור בין Research, Replay, Shadow ו־Paper.
- ‏נדרש למנוע שינויי כיוון בעקבות תוצאה בודדת.

---

## ‏5. Do Not Use When

‏לא נשתמש ב־Playbook כתחליף ל־:

- ‏`Config` עם הערכים הפעילים בפועל.
- ‏`StrategyManifest` שמזהה artifact מדויק.
- ‏Runbook תפעולי מפורט ל־incident מסוים.
- ‏Broker/account truth.
- ‏Data contract.
- ‏Backtest/Replay evidence.
- ‏Testing.
- ‏Readiness review.

‏Playbook שאומר “מה צריך לקרות” אינו הוכחה שהמערכת באמת עושה זאת.

---

## ‏6. Alternatives

### ‏חלופה א — Code is the Playbook

‏נדחית כברירת מחדל.

‏הקוד מתאר behavior נוכחי אך לא מסביר למה הוא מאושר, מהו hypothesis, מהו invariant ומה יגרום לשינוי.

### ‏חלופה ב — README + Config בלבד

‏פשוטה אך חלשה מדי ל־governance, RCA ו־evidence lineage.

### ‏חלופה ג — Playbook אנושי קצר + machine contracts נפרדים

‏**זו ברירת המחדל המומלצת.**

‏ה־Playbook נשאר קריא ותמציתי יחסית; StrategyManifest, schemas, configs, tests ו־ReasonCodes נשארים artifacts טכניים עצמאיים.

### ‏חלופה ד — Full Policy Engine

‏מתאימה רק אם complexity עתידית באמת מצדיקה אותה.

---

## ‏7. Trade-offs

### ‏יתרונות

- ‏Doctrine אחידה ומפורשת.
- ‏RCA טוב יותר.
- ‏פחות שינויי אד־הוק.
- ‏הפרדה בין עובדות להשערות.
- ‏שיפור Auditability ו־reproducibility.
- ‏קל יותר לזהות violation של invariant.
- ‏קל יותר לבצע handoff בין Research stages.

### ‏מחירים

- ‏דורש תחזוקה כש־Strategy או contracts משתנים.
- ‏Playbook ארוך מדי עלול להפוך למסמך שאיש אינו קורא.
- ‏Rule explosion עלול ליצור contradictions.
- ‏אם הוא אינו מקושר ל־code/tests/telemetry, הוא עלול להפוך למסמך הצהרתי בלבד.

‏לכן ברירת המחדל היא **KISS: מעט invariants חזקים, doctrine ברורה, וקישורים ל־artifacts טכניים במקום שכפול שלהם.**

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מתחיל עם:

- ‏מאות rules פרטניים לפי Symbol.
- ‏Policy DSL מורכב.
- ‏Auto-tuning של Doctrine.
- ‏Auto-promotion של Hypotheses ל־Judgments.
- ‏שכפול מלא של כל Config בתוך Playbook.
- ‏שכפול מלא של Runbooks.
- ‏שינוי Playbook יומי.
- ‏Exact thresholds ללא evidence ייעודי.
- ‏Exact entry/exit tactic כאילו כבר הוכרעו.
- ‏ML כמרכיב חובה.

---

## ‏9. What to Add Later

‏לאחר Baseline יציב:

- ‏`PlaybookComplianceReport` אוטומטי.
- ‏Machine-readable invariant registry.
- ‏קישור כל rule ל־tests ול־telemetry.
- ‏Impact map: איזה components תלויים בכל doctrine rule.
- ‏Version diff בין Playbook versions.
- ‏Automatic detection של implementation-vs-playbook drift.
- ‏Coverage report: אילו rules מעולם לא נבדקו ב־Replay/Shadow.
- ‏Change proposal template שנגזר ישירות מה־Playbook.

---

## ‏10. Required Data / Evidence

‏כדי שה־Playbook יהיה יותר ממסמך, נדרש Evidence שמקשר Doctrine למציאות:

```text
StrategyVersion / ConfigFingerprint
Decision Packets
Top-K snapshots
Feature / Rank / Veto snapshots
ReasonCodes
Data-health / freshness state
Decision and processing latency
Cost attribution
Execution-simulator outcomes
Account / eligibility state for the research environment
Replay traces
Shadow/Paper outcomes
Incident packets
Recovery traces
Manual intervention journal
Experiment registry
Promotion / rejection records
```

‏לכל invariant קריטי צריך לפחות דרך אחת להוכיח:

```text
Was it evaluated?
Did it pass?
If it failed, what did the system do?
```

---

## ‏11. Promotion Criteria

‏גרסת Playbook חדשה זכאית ל־`Authoritative` review כאשר:

1. ‏השינוי מוגדר ומוסבר.
2. ‏ברור אם כל סעיף הוא `FACT`, ‏`JUDGMENT` או `HYPOTHESIS`.
3. ‏אין סתירה ל־P0 safety/correctness invariants קיימים ללא RCA והצדקה מפורשת.
4. ‏שינויים behavior-affecting מקושרים ל־StrategyVersion/experiment/evidence המתאימים.
5. ‏נבדקו implications ל־Replay, Shadow, Paper, Recovery ו־Observability.
6. ‏ה־Do-Not-Do section עדיין שלם ורלוונטי.
7. ‏ה־Playbook נשאר מספיק פשוט לשימוש אנושי.
8. ‏קיימת דרך לזהות implementation drift מול הגרסה החדשה.

---

## ‏12. Rejection Criteria

‏נדחה שינוי Playbook כאשר:

- ‏הוא נולד בעיקר מתוצאה יומית אחת.
- ‏הוא הופך Hypothesis ל־Fact ללא Evidence.
- ‏הוא מחליש invariant קריטי כדי לשפר metric כלכלי.
- ‏הוא מוסיף exception מקומי במקום לתקן abstraction שגוי.
- ‏הוא אינו measurable או observable.
- ‏הוא סותר StrategyManifest/Config בפועל בלי migration מתוכנן.
- ‏הוא מסתיר `UNKNOWN` במקום לטפל בו.
- ‏הוא מגדיל complexity בלי שינוי decision value או safety value ברור.

---

## ‏13. Metrics

### ‏Doctrine / Compliance

```text
PlaybookViolationCount
UnexplainedDecisionRate
UnexplainedRejectionRate
UnknownCriticalStateRate
SilentOverrideCount
ManualOverrideCount
VersionMismatchCount
```

### ‏Evidence / Reproducibility

```text
DecisionPacketCompleteness
ReplayReproducibilityRate
ReasonCodeCoverage
TelemetryCompleteness
EvidenceLinkCoverage
```

### ‏Safety / Operations

```text
UnknownEffectRetryCount
ReconciliationFailureCount
TimeToKnownState
TimeToSafeState
RecoverySuccessRate
CriticalTelemetryGapRate
```

### ‏Research Governance

```text
HypothesisWithoutExperimentCount
PromotionWithoutFrozenCriteriaCount
NegativeResultRetentionRate
ChangeWithEvidenceRate
ChallengerPromotionRate
Rollback/DemotionRate
```

### ‏Complexity

```text
RuleCount
ExceptionCount
RulesWithoutTests
RulesWithoutTelemetry
DoctrineChangeFrequency
```

‏המטרה אינה למקסם RuleCount. לעיתים ירידה ב־RuleCount היא שיפור.

---

## ‏14. Failure Modes

### ‏Playbook Drift

‏המסמך אומר דבר אחד והמערכת עושה דבר אחר.

### ‏Playbook Bloat

‏יותר מדי rules ו־exceptions עד שאי־אפשר להבין hierarchy.

### ‏Hidden Config Doctrine

‏התנהגות קריטית מוגדרת רק ב־config ולא מוסברת ב־Playbook.

### ‏Hypothesis Promotion by Repetition

‏טענה לא מוכחת חוזרת כל כך הרבה עד שמתייחסים אליה כעובדה.

### ‏Narrative Drift

‏לאחר outcome משנים בדיעבד את ההסבר למה המערכת “התכוונה”.

### ‏Safety Dilution

‏Rule economic מקבל precedence על safety/correctness invariant.

### ‏Silent Manual Override

‏Operator משנה behavior ללא event/audit trail.

### ‏Stale Doctrine

‏Provider, schema, Strategy או environment השתנו אך ה־Playbook לא עודכן.

### ‏Unmeasurable Rules

‏כללים סובייקטיביים שלא ניתן לבדוק ב־Replay או telemetry.

### ‏Playbook-as-Proof

‏הנחה שהמערכת בטוחה/טובה רק מפני שהמסמך נראה מקצועי.

---

## ‏15. User-Specific Application

‏ל־whole-market short-horizon research system שלנו, סדר העדיפויות המומלץ הוא:

```text
P0 Versioned doctrine + Fact/Judgment/Hypothesis labels
P0 Unknown / stale / mismatch semantics
P0 Reproducible Decision Packet
P0 Hard correctness/safety invariants
P0 Recovery-before-resume doctrine
P0 Reason-coded TRADE / NO_TRADE / UNKNOWN
P1 Fresh whole-market scan + deeper Top-N research architecture
P1 Absolute gate after relative ranking
P1 Negative-evidence layer separate from positive ranking
P1 Full Top-K / counterfactual logging
P1 Cost / latency / execution-simulation attribution
P1 Daily evidence review without auto-tuning
P1 Champion/Challenger for meaningful changes
P2 Automated compliance checking
P2 Playbook/version diff tooling
P3 Machine-readable policy registry
P4 Autonomous doctrine mutation
```

‏ה־Playbook לא יקבע כאן exact thresholds, exact position size, exact provider, exact routing, exact feature set או exact ML role. אלה נשארים decisions נפרדים שתלויים ב־Evidence וב־current facts.

‏הטענה המחקרית המרכזית — שקיימים מצבי short-horizon שבהם momentum cross-sectional שומר מספיק value לאחר latency, fills ו־costs — נשארת **Hypothesis**, לא Fact.

---

## ‏16. Confidence

### ‏High Confidence

- ‏הפרדת `FACT / JUDGMENT / HYPOTHESIS`.
- ‏Versioned Playbook.
- ‏Unknown/Stale/Mismatch semantics מפורשים.
- ‏Decision reproducibility.
- ‏Reason-coded refusals.
- ‏Recovery before resume.
- ‏Hard invariants שאינם נעקפים על ידי score.
- ‏Evidence-driven change governance.

### ‏Medium Confidence

- ‏המבנה המדויק של Sections.
- ‏כמות ה־rules האופטימלית.
- ‏כמה מה־Playbook כדאי להפוך ל־machine-readable policy.
- ‏Cadence אופטימלי ל־Playbook review.

### ‏Low / Hypothesis

- ‏Exact signal thresholds.
- ‏Exact feature set.
- ‏Exact execution/exit tactics.
- ‏Exact regime logic.
- ‏כל assertion אמפירי על profitability.

---

## ‏17. Time-Sensitive Facts

‏ההמלצה עצמה היא בעיקר Architecture/Governance ולכן אינה תלויה בערך רגולטורי או Broker-specific יחיד.

‏עם זאת, כל סעיף Playbook שתלוי ב־:

```text
Broker capability
Account permission
Data provider semantics
Exchange/session rules
Fees
Regulation
Borrow availability
API contract
```

‏חייב להישמר כ־external dependency versioned ולהיבדק מחדש לפני שימוש תפעולי רלוונטי.

‏אין לקבע current external rule בתוך Doctrine כאילו הוא invariant נצחי.

---

# ‏הכרעה סופית למקטע 79

‏ברירת המחדל המומלצת היא **Playbook קטן יחסית, versioned, evidence-backed ו־testable**, שמחזיק את ה־Doctrine וה־invariants בלבד, בעוד ש־Config, StrategyManifest, schemas, tests, telemetry ו־runbooks נשארים artifacts נפרדים אך מקושרים.

‏ה־Playbook צריך לאפשר לענות בכל רגע:

```text
What do we know?
What do we only believe?
What are we testing?
What is the system allowed to do?
What must it refuse to do?
What evidence justified the current doctrine?
What would invalidate it?
How does the system reach a safe state when uncertain?
```

‏זו שכבת המשמעת שמחברת את כל ה־Recommendation Playbook — בלי להפוך כל רעיון חדש לחוק ובלי לאפשר ל־complexity לצבור סמכות רק מפני שהיא כבר קיימת.