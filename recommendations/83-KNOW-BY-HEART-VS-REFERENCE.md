# ‏83 — Recommendation Sheet: Know by Heart vs Reference

> ‏מקור לימודי עיקרי: `../83-KNOW-BY-HEART-VS-REFERENCE.md`.
>
> ‏מטרת הקובץ: להכריע איזה ידע חייב להיות internalized ומיידי, איזה ידע מספיק לדעת לגזור, ואיזה ידע חייב להישאר ב־Reference authoritative, versioned ועדכני — כדי למנוע גם תלות במסמכים עבור reasoning בסיסי וגם false confidence מפרטים שנשמרו בזיכרון והפכו stale.
>
> ‏המקטע מוגבל ל־`Research / Replay / Shadow / Paper` ולתכנון Architecture/Governance. הוא אינו הוראה לבצע מסחר בכסף אמיתי ואינו אישור `Live`.

---

## ‏1. Decision

‏השאלה המרכזית היא:

```text
Which knowledge must be immediately available from memory,
which knowledge must be derivable from first principles,
and which knowledge must always be verified from an authoritative current reference?
```

‏ברירת המחדל:

```text
L1 — KNOW BY HEART
Stable mental models + invariants + failure semantics + reflex questions

L2 — KNOW HOW TO DERIVE
Formulas + assumptions + required inputs + interpretation

L3 — KNOW WHERE TO LOOK
Changing / provider-specific / regulatory / numeric details
with Source + Scope + Version + VerifiedAt
```

‏העיקרון:

```text
Stable concept → internalize
Changing detail → reference
Dangerous ambiguity → verify before action
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: שלוש רמות ידע מפורשות

‏כל knowledge item משמעותי יקבל אחת משלוש קטגוריות:

```text
L1 — Know by Heart
L2 — Know How to Derive
L3 — Know Where to Look
```

‏לא ננסה לשנן את כל הקורס.

‏נרצה לזכור את מה שמונע conceptual/safety error, לדעת לגזור את מה שדורש reasoning, ולשלוף את מה שעלול להשתנות.

### ‏`P0 — Required`: ‏`L1` הוא Invariants ו־Failure Semantics

‏חייבים לדעת ללא חיפוש לפחות את העקרונות הבאים:

```text
Signal != Edge
Gross Edge != Net Edge
Rank #1 != Best Decision
NO_TRADE is valid
UNKNOWN != NO_TRADE
Critical UNKNOWN blocks new simulated/paper exposure
Local Truth != Broker/Simulator Truth
Sent != Accepted != Working != Filled
Cancel Sent != Cancelled
No Ack != No Order
Touch != Fill
Paper Fill != execution proof
Freshness is part of information
Missing != Zero
Entry is optional; Exit may be mandatory
Pending/unknown exposure is still risk
Position / Exit work outranks new opportunity work
Blind retry after UNKNOWN_EFFECT is forbidden
Point-in-Time correctness precedes attractive PnL
Production learning must not auto-change production authority
```

‏אלה אינם פרטים לזיכרון קצר־טווח; הם חלק מה־operating model.

### ‏`P0 — Required`: ‏`L1` כולל שלוש שרשראות בסיס

‏השרשרת הכלכלית:

```text
Detect
→ Rank
→ Veto
→ Revalidate
→ Execute / Simulate
→ Fill Model
→ Manage
→ Exit
→ Measure Net
```

‏השרשרת התפעולית:

```text
Intent
→ Persist
→ Submit / Simulate
→ Observe External Truth
→ Reconcile
→ Maintain Position Truth
→ Exit
→ Confirm Flat
```

‏השרשרת המחקרית:

```text
Hypothesis
→ Point-in-Time Dataset
→ Backtest
→ Replay
→ Shadow
→ Evidence
→ Promotion or Rejection
```

### ‏`P0 — Required`: ‏`L2` נמדד לפי derivation, לא לפי שינון נוסחה

‏בכל חישוב משמעותי צריך לדעת:

```text
What are we trying to estimate?
Which inputs are required?
What is the reference point?
Which assumptions make the calculation valid?
What uncertainty remains?
What would make the result misleading?
```

‏דוגמאות ל־`L2`:

- ‏Return לפי horizon ו־reference price.
- ‏Volatility estimator בהתאם לשאלה.
- ‏Expected Value ולא רק win rate.
- ‏Break-even cost.
- ‏Capture ratio.
- ‏Adverse-selection markout.
- ‏Confidence interval.
- ‏Effective sample size.
- ‏Correlation/Regression interpretation.

### ‏`P0 — Required`: ‏`L3` אינו Memory

‏פרטים הבאים נשארים ב־Reference current, לא בזיכרון אנושי:

- ‏Broker/API capabilities.
- ‏Fees ו־fee schedules.
- ‏Market-data entitlements.
- ‏Regulatory/settlement details.
- ‏Order-type availability.
- ‏Exchange/session calendars.
- ‏Provider field semantics ו־error codes.
- ‏Corporate-action history.
- ‏Tax/reporting details.
- ‏Deployment/recovery commands.
- ‏Version/schema compatibility matrices.

‏כל פרט שתלוי בזמן, account, provider, jurisdiction, instrument או API version הוא candidate חזק ל־`L3`.

### ‏`P0 — Required`: Metadata לכל Reference משתנה

```text
Source
VerifiedAt
EffectiveFrom
AppliesTo
Version
Owner
NextReview
```

‏`Reference` ללא `Scope` או `VerifiedAt` אינו מקבל implicit trust.

### ‏`P0 — Required`: Primary Source קודם ל־memory/cache

‏כאשר מידע חיצוני יכול להשתנות, סדר האמון:

```text
Current authoritative source
> versioned internal reference derived from it
> cached note
> human memory
```

### ‏`P0 — Required`: Emergency Knowledge צריך להיות muscle memory

‏ב־incident צריך לדעת מיד:

```text
Who is authoritative?
How do we stop new entries?
What exposure exists or may exist?
Is external state known or UNKNOWN?
Where is position truth checked?
Why must we not blind-retry?
Is cancel confirmed or only requested?
Did a partial fill create exposure?
How do we enter EXIT_ONLY / SAFE_MODE semantics?
When must automation stop and reconciliation begin?
```

### ‏`P1 — Baseline`: Reflex Questions לפני החלטה

‏השאלות הבאות צריכות להיות default reasoning pattern:

```text
What exactly do we know right now?
How fresh is it?
Compared to what?
What changed since the signal was created?
Is the candidate still executable?
What is the remaining net edge?
What could make this observation misleading?
What is the current external truth?
What exposure already exists or may exist?
Can we exit if conditions degrade?
Is this evidence or a story?
Was this information available at decision time?
Is this improvement incremental over baseline?
Did cost or latency consume the edge?
Where is the First Divergence?
Would the conclusion survive another regime?
Is this a process failure or a normal losing outcome?
What would falsify the hypothesis?
What do we not know?
Is NO_TRADE the correct answer?
```

### ‏`P1 — Baseline`: Role-based Knowledge Map

‏נחזיק מטריצה מפורשת לפי role:

| Role | L1 Core |
|---|---|
| Research | Leakage, selection bias, OOS, multiple testing, effect size, execution realism, regimes, counterfactuals |
| Scanner | Freshness, coverage, cross-sectional fairness, Top-K, churn, backpressure, TTL |
| Execution | Order lifecycle, partial fills, cancel/fill race, unknown effect, idempotency, reconciliation, exit priority |
| Operations | Safe modes, kill semantics, recovery sequence, truth sources, incident evidence, rollback |
| Strategy | Mechanism, expected domain, failure domain, edge consumers, falsification criteria |

### ‏`P1 — Baseline`: Knowledge Drills

‏נקיים drills קצרים ולא מבחני זיכרון ארוכים.

‏אדם/מערכת תכנון צריכים להיות מסוגלים להסביר ללא notes:

- ‏`Signal != Edge`.
- ‏למה Rank #1 יכול להוביל ל־`NO_TRADE`.
- ‏`UNKNOWN_EFFECT`.
- ‏`Touch != Fill`.
- ‏Local vs external truth.
- ‏Signal half-life מול latency.
- ‏Winner's Curse.
- ‏Point-in-Time leakage.
- ‏למה Paper אינו execution proof.
- ‏למה Feature יכול לצאת למרות historical value.
- ‏למה PnL טוב יכול להסתיר process שבור.
- ‏למה exit capability קודמת ל־entry בזמן exposure.
- ‏איזה Evidence צריך לגרום להפסיק לסמוך על Hypothesis.

### ‏`P1 — Baseline`: ‏`Retrieval Drill` ל־L3

‏`Know Where to Look` הוא capability שניתן לבדיקה.

‏Reference חשוב צריך להיות:

- ‏searchable.
- ‏עם owner.
- ‏עם source authority.
- ‏עם scope.
- ‏עם freshness metadata.
- ‏ניתן למציאה בזמן סביר.

‏Reference שלא מצליחים לאתר תחת לחץ הוא Reference תיאורטי בלבד.

### ‏`P1 — Baseline`: Review Cadence

‏ברירת מחדל:

```text
Concept / invariant review → periodic
Changing-reference review → risk/freshness based
Pre-release → verify assumptions touched by the release
After provider/API change → verify semantics/limits/fields
Post-incident → classify knowledge gap vs stale reference vs implementation fault
After strategy change → refresh the mental model
```

‏אין צורך להפוך calendar cadence קשיח למטרה; frequency נגזרת מקצב השינוי והסיכון.

### ‏`P2 — Improvement`: Knowledge Registry

‏ניתן לנהל Registry קל:

```text
KnowledgeItemId
Level = L1 | L2 | L3
Domain
Statement / Question
Authority
Owner
VerifiedAt
AppliesTo
ReviewTrigger
RelatedTests
RelatedRunbook
```

‏המטרה היא traceability, לא knowledge-management platform כבדה.

### ‏`P2 — Improvement`: Stale Reference Detection

‏Reference חיצוני יכול להפוך `STALE` על בסיס:

- ‏עבר `NextReview`.
- ‏Provider/API version השתנה.
- ‏Broker/account context השתנה.
- ‏Release נוגע בהנחה הרלוונטית.
- ‏incident מצביע על semantic mismatch.

‏`STALE` אינו אומר בהכרח “שגוי”; הוא אומר “דורש verification לפני reliance”.

### ‏`P3 — Challenger`: Generated Cheat Sheets

‏אפשר לייצר אוטומטית cheat sheets מ־authoritative registry לפי role/environment/version.

‏זה שימושי רק אם generation שומר lineage ו־freshness; אין ערך ב־cheat sheet אוטומטי שמקבע מידע stale.

### ‏`P4 — Specialist`: Automated policy-to-code verification

‏בהמשך ניתן לבדוק programmatically שחלק מה־L1 invariants מופיעים גם כ־tests/guards/alerts.

‏לדוגמה:

```text
L1: critical UNKNOWN blocks entry
→ invariant test
→ runtime guard
→ reason code
→ incident evidence
```

‏זה אינו מחליף הבנה אנושית; הוא סוגר פער בין doctrine לבין implementation.

---

## ‏3. Why

‏יש שני failure modes מנוגדים:

1. ‏ידע בסיסי אינו internalized, ולכן reasoning פשוט דורש כל פעם חיפוש מחדש.
2. ‏פרט משתנה נשמר בזיכרון והופך ל־“עובדה” למרות שה־provider, rule, fee או API כבר השתנו.

‏ה־L1/L2/L3 split מונע את שניהם.

‏הוא גם מתאים לאופי של מערכת `Short-Horizon`: בזמן incident אין זמן לפתוח מסמך כדי לזכור ש־`No Ack != No Order`; לעומת זאת, fee מדויק או API limit דווקא מסוכן יותר לזכור בעל־פה מאשר לבדוק מול source current.

---

## ‏4. Use When

‏המסגרת שימושית עבור:

- ‏onboarding למערכת.
- ‏design/review של רכיב חדש.
- ‏incident response.
- ‏pre-release review.
- ‏RCA.
- ‏החלפת provider/broker/API.
- ‏שינוי משמעותי ב־strategy/config.
- ‏כתיבת runbook/checklist.
- ‏החלטה מה להכניס למסמך Reference ומה ל־invariant tests.

---

## ‏5. Do Not Use When

‏אין להשתמש ב־“Know by Heart” כדי להצדיק:

- ‏שינון fees/rules/limits משתנים.
- ‏הסתמכות על התנהגות Broker שזכורה מגרסה קודמת.
- ‏עקיפת source authoritative כי “אנחנו כבר יודעים”.
- ‏קידוד magic numbers מתוך memory.
- ‏החלפת runbook בידע שבעל־פה.
- ‏החלפת understanding ב־checklist בלבד.

‏גם מומחה צריך Reference; גם Reference טוב אינו מחליף mental model.

---

## ‏6. Alternatives

### ‏Alternative A — Memorize Everything

‏נדחה. פרטים משתנים מקבלים false confidence ומתיישנים.

### ‏Alternative B — Document Everything, Internalize Nothing

‏נדחה. incident reasoning ו־architecture review נעשים איטיים ושבירים.

### ‏Alternative C — Checklist-only Operations

‏שימושי כתמיכה, אך checklist ללא understanding נכשל כשמופיע failure שלא תועד בדיוק.

### ‏Alternative D — Expert Intuition Only

‏נדחה. אינו reproducible, auditable או transferable.

---

## ‏7. Trade-offs

### ‏Internalization מול Staleness

‏ככל ששומרים יותר פרטים בראש, retrieval מהיר יותר אך risk של outdated truth עולה.

### ‏Reference Richness מול Retrieval Speed

‏מערכת Reference עמוקה אך קשה לחיפוש נכשלת תחת לחץ. לכן relevance ו־retrievability חשובים לצד completeness.

### ‏Checklist מול Flexibility

‏Checklist מגן משכחה, אך אינו מכסה כל novel failure. לכן הוא companion ל־mental model.

### ‏Frequent Verification מול Operational Cost

‏אימות כל reference כל יום יקר ומיותר. עדיף review triggers ו־freshness policy לפי risk וקצב שינוי.

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מתחיל עם:

- ‏knowledge graph מורכב.
- ‏AI assistant שמחליט לבד מה current truth.
- ‏עשרות cadences שונים.
- ‏quiz platform כבדה.
- ‏automatic policy mutation.
- ‏מאגר duplicate של documentation חיצונית ללא lineage.

‏ה־Baseline צריך להיות קטן:

```text
L1 invariants
+ L2 derivation map
+ L3 authoritative references
+ role cheat sheets
+ incident/release checklists
+ simple review triggers
```

---

## ‏9. What to Add Later

‏לאחר Baseline:

- ‏Knowledge Registry searchable.
- ‏auto-generated role cheat sheets.
- ‏stale-reference alerts.
- ‏links מ־incident packet ל־relevant reference.
- ‏coverage mapping בין L1 invariants ל־tests/guards.
- ‏retrieval telemetry.
- ‏drills מתוך Golden Incidents.

‏כל תוספת צריכה לשפר decision quality או response quality, לא “לנהל ידע” לשם ניהול ידע.

---

## ‏10. Required Data / Evidence

‏כדי לבחון אם מודל הידע עובד נדרשים:

- ‏רשימת L1/L2/L3 מפורשת.
- ‏References עם source/scope/version/`VerifiedAt`.
- ‏זמן retrieval לפרטי L3 קריטיים.
- ‏תוצאות drills של L1.
- ‏incidents שבהם knowledge gap תרם לבעיה.
- ‏incidents שבהם stale reference תרם לבעיה.
- ‏מקרים שבהם memory contradicted current authoritative source.
- ‏coverage בין invariants לבין tests/runbooks/guards.
- ‏post-release/post-provider-change verification records.

---

## ‏11. Promotion Criteria

‏מודל הידע מתקדם מ־informal baseline ל־governed baseline כאשר:

1. ‏כל invariant קריטי מסווג `L1` ובעל ניסוח חד־משמעי.
2. ‏כל changing detail קריטי מסווג `L3` עם authoritative source.
3. ‏אין Reference חיצוני קריטי ללא `VerifiedAt` ו־`AppliesTo`.
4. ‏drills מראים שאפשר להסביר failure semantics מרכזיים ללא notes.
5. ‏פרטי L3 קריטיים ניתנים למציאה בזמן סביר.
6. ‏release/incident workflow יודע לזהות stale-reference risk.
7. ‏אין תלות ב־human memory לפרטים חיצוניים משתנים.

---

## ‏12. Rejection Criteria

‏הגישה נכשלת אם:

- ‏L1 הופך לאוסף של מאות עובדות במקום mental models.
- ‏L3 נשמר ללא source/scope/freshness.
- ‏Reference search איטי או לא ברור מי authoritative.
- ‏צוות/מפתח ממשיך לקודד numeric assumptions מזיכרון.
- ‏checklist מחליף reasoning.
- ‏knowledge review הופך לטקס ללא incidents/tests/evidence.
- ‏אין הבחנה בין “לא יודע” לבין “יודע שזה לא נכון”.

---

## ‏13. Metrics

### ‏Knowledge Readiness

- ‏`L1DrillPassRate`.
- ‏`CriticalInvariantRecallRate`.
- ‏`FailureSemanticExplanationRate`.
- ‏`ReflexQuestionCoverage`.

### ‏Reference Quality

- ‏`CriticalReferenceVerifiedRate`.
- ‏`StaleReferenceRate`.
- ‏`MissingScopeRate`.
- ‏`PrimarySourceCoverage`.
- ‏`ReferenceRetrievalTimeP50/P95`.

### ‏Operational Learning

- ‏`IncidentKnowledgeGapRate`.
- ‏`StaleReferenceIncidentRate`.
- ‏`MemoryVsSourceConflictCount`.
- ‏`PostIncidentKnowledgeUpdateRate`.

### ‏Doctrine-to-Code

- ‏`CriticalInvariantTestCoverage`.
- ‏`InvariantGuardCoverage`.
- ‏`RunbookCoverage`.

---

## ‏14. Failure Modes

### ‏False Confidence

‏מספר/כלל ישן נשמר בזיכרון ומופעל כאילו current.

### ‏Reference without Scope

‏מידע נכון לחשבון/גרסה/שוק אחד מיושם במקום אחר.

### ‏Search Failure

‏המידע קיים אך לא ניתן לשליפה בזמן שצריך אותו.

### ‏Checklist Blindness

‏ה־operator מבצע checklist גם כשהמציאות אינה מתאימה למסלול המתועד.

### ‏Concept Drift in People

‏Strategy/architecture השתנו אך mental model לא עודכן.

### ‏Doctrine / Code Divergence

‏כולם “יודעים” invariant, אך implementation אינו אוכף אותו.

### ‏Unowned Reference

‏אין owner ולכן stale knowledge נשאר שנים.

### ‏Over-Memorization

‏L1 גדל עד שאינו באמת זמין בעל־פה.

### ‏Under-Memorization

‏failure semantics בסיסיים דורשים browsing בזמן incident.

---

## ‏15. User-Specific Application

‏למערכת ה־`Short-Horizon Momentum` האישית, ה־L1 צריך להיות קטן וחד סביב ארבעה צירים:

```text
1. Information Truth
   freshness / timestamps / point-in-time / coverage / unknown

2. Decision Quality
   rank != trade / Top-K / veto / no-trade / remaining net edge

3. Execution & State
   intent / unknown effect / reconciliation / partial fill / position first / time-to-flat

4. Research Discipline
   leakage / OOS / costs / regime / replay / disagreement / evidence-gated change
```

‏לעומת זאת, פרטים על provider, broker, fees, permissions, API limits, calendars ו־external rules יישארו ב־L3 בלבד ויידרשו אימות עדכני לפני שימוש תפעולי.

‏ה־Recommendation גם מתאים ל־KISS: עדיף `L1` קצר שאפשר באמת לזכור ו־Reference טוב שאפשר באמת למצוא, מאשר מסמך ענק שאף אחד אינו יודע אם צריך לזכור או לבדוק.

---

## ‏16. Confidence

‏**High** לגבי החלוקה העקרונית `L1/L2/L3`, הצורך ב־authoritative versioned references, ההבחנה בין mental model לבין changing detail, והשילוב בין drills ל־checklists.

‏**Medium** לגבי cadence מדויק של review ו־retrieval targets; הם צריכים להיגזר מהיקף המערכת, קצב השינויים וה־incident history.

---

## ‏17. Time-Sensitive Facts

‏כל אחד מהתחומים הבאים מוגדר כברירת מחדל כ־time-sensitive `L3`:

- ‏Broker/API behavior ותמיכה.
- ‏fees.
- ‏market-data entitlements.
- ‏account permissions/restrictions.
- ‏regulatory/settlement details.
- ‏tax/reporting details.
- ‏session/auction calendars.
- ‏provider field semantics/limits.

‏לפני שימוש תפעולי נדרש current authoritative verification; memory אינה source of truth.

---

## ‏Fact / Judgment / Hypothesis

### ‏Fact

- ‏פרטים חיצוניים רבים יכולים להשתנות בין גרסאות, providers, accounts ותקופות.
- ‏Reference ללא scope יכול להיות נכון במקום אחד ושגוי במקום אחר.
- ‏הסבר של failure semantics ו־truth sources הוא prerequisite ל־RCA/recovery אמין.

### ‏Judgment

- ‏`L1/L2/L3` הוא ה־baseline המומלץ לניהול ידע בפרויקט.
- ‏`L1` צריך להישאר קטן וממוקד ב־invariants, mental models ו־failure semantics.
- ‏כל external changing detail משמעותי צריך Metadata + authoritative source.
- ‏`Knowledge Readiness` צריך להיבדק גם ב־drills וגם ב־retrieval.

### ‏Hypothesis

- ‏המודל יקטין false-confidence incidents ויקצר RCA/recovery.
- ‏Role-based cheat sheets ישפרו onboarding בלי להגדיל overload.
- ‏מיפוי L1 invariants ל־tests/guards יפחית doctrine/code divergence.

---

# ‏Recommended Knowledge Baseline

```text
L1 — Internalize
  mental models
  safety/correctness invariants
  failure semantics
  truth-source hierarchy
  reflex questions

L2 — Derive
  formulas
  assumptions
  estimators
  uncertainty
  economic interpretation

L3 — Verify / Retrieve
  external changing details
  provider/broker/API specifics
  fees/rules/calendars
  runbooks/commands
  compatibility matrices

Governance
  Source
  Scope
  Version
  VerifiedAt
  ReviewTrigger
  Owner
```

# ‏Definition of Knowledge Ready

‏ה־Knowledge model נחשב מוכן כאשר ניתן:

1. ‏להסביר את economic/operational/research chains ללא notes.
2. ‏להסביר `UNKNOWN_EFFECT`, ‏`NO_TRADE` מול `UNKNOWN`, ‏`Touch != Fill` ו־Local vs external truth.
3. ‏להסביר point-in-time correctness, execution economics ו־promotion evidence.
4. ‏לזהות במהירות אם פרט הוא invariant, derivation או changing reference.
5. ‏לשלוף Reference authoritative לפרט חיצוני קריטי בלי לנחש.
6. ‏להראות `VerifiedAt` ו־`AppliesTo` לפרטים time-sensitive.
7. ‏לתרגם incident ל־knowledge gap / stale reference / implementation fault.
8. ‏לומר במפורש “לא ידוע — צריך Reference current” במקום להמציא certainty.

‏המטרה אינה לזכור יותר.

‏המטרה היא לדעת **מה חייבים לדעת, מה חייבים להבין, ומה חייבים לבדוק**.