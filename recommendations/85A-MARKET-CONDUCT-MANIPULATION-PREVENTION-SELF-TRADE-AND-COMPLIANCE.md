# ‏85A — Recommendation Sheet: Market Conduct, Manipulation Prevention, Self-Trade Controls and Automated-Trading Compliance

> ‏מקור לימודי עיקרי: `../85A-MARKET-CONDUCT-MANIPULATION-PREVENTION-SELF-TRADE-AND-COMPLIANCE.md`.
>
> ‏מטרת הקובץ: להכריע כיצד להוסיף לרובוט שכבת `Market Conduct / Compliance` שמונעת self-interaction, duplicate/ambiguous order behavior, environment crossing ו־unowned orders; שומרת audit lineage מלא; ועוצרת יצירת סיכון חדש כאשר intent, ownership או external state אינם ברורים.
>
> ‏המקטע מוגבל ל־`Research / Replay / Shadow / Paper` ולתכנון Architecture/Governance/Compliance. הוא אינו מדריך לביצוע מניפולציה, אינו מספק שיטות לעקיפת surveillance, ואינו אישור למסחר בכסף אמיתי.

---

## ‏1. Decision

‏השאלה המרכזית אינה:

```text
Did the broker accept the order?
```

‏ואינה:

```text
Did the order make money?
```

‏אלא:

```text
Can we prove that every intended order has
bona-fide economic purpose,
clear ownership,
non-conflicting authority,
correct environment,
and complete evidence lineage?
```

‏ברירת המחדל:

```text
Decision
→ Risk Gate
→ Execution Feasibility
→ Compliance Gate
→ Durable OrderIntent
→ Paper/Simulator/Broker Boundary
→ Continuous Reconciliation
→ Audit / Surveillance
```

‏כאשר truth קריטי אינו ידוע:

```text
COMPLIANCE_BLOCK / ENTRY_BLOCKED
→ reconcile
→ preserve risk-reduction capability
→ re-evaluate only after truth is restored
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏Compliance הוא Gate עצמאי, לא Score

‏`Rank #1`, ‏Score גבוה או PnL טוב אינם יכולים לבטל `Compliance Veto`.

‏ה־output יהיה מפורש:

```text
ALLOW
BLOCK
REVIEW_REQUIRED
EXIT_ONLY
```

‏לא Boolean יחיד ולא penalty בתוך ranking score.

### ‏`P0 — Required`: ‏Bona-Fide Intent לפני כל Order Intent

‏לכל `OrderIntent` חייב להיות economic purpose אמיתי ומפורש.

‏ב־Research/Shadow/Paper נשמור לפחות:

```text
OrderIntentId
DecisionId
StrategyInstanceId
StrategyVersion
Environment
AccountScope
Symbol
Side
Purpose
PositionId
EconomicPurpose
CreatedAt
IntentTTL
```

‏`Purpose` יהיה semantic field, למשל:

```text
ENTRY
EXIT
REDUCE_RISK
RECOVERY
MANUAL
SHADOW_ONLY
```

‏העיקרון:

```text
If the intent became executable under its approved policy,
we would genuinely want the modeled action to occur.
```

### ‏`P0 — Required`: ‏Global Order Ownership

‏כל working/intended order חייב להיות ניתן למיפוי ל־authoritative owner אחד ול־intent lineage אחת.

‏ב־scope שבו הארכיטקטורה דורשת writer יחיד:

```text
One authoritative writer
+ fencing / generation
+ no silent second-instance authority
```

‏`Two Active Writers` הוא `P0` candidate.

### ‏`P0 — Required`: ‏Related Opposing Intent Prevention

‏לפני submit/simulation side effect, ה־Compliance Gate בודק לפחות:

```text
related working intents/orders
same account/compliance scope
same symbol
opposing economic objective
manual activity
recovery state
unknown ownership
```

‏ברירת המחדל במקרה conflict:

```text
BLOCK new risk
→ reconcile
→ choose authoritative objective
```

‏לא ננסה להסיק legal intent; אנחנו מונעים conflict ומייצרים evidence ל־review.

### ‏`P0 — Required`: ‏`UNKNOWN_EFFECT` קודם ל־Retry

```text
Timeout / lost ack
!=
No external effect
```

‏לכן:

```text
UNKNOWN_EFFECT
→ no exposure-increasing retry
→ reconcile external truth
→ retry only after state is known
```

‏אותו כלל חל גם על reconnect, replace ו־recovery paths.

### ‏`P0 — Required`: ‏Environment Isolation

‏כל intent נושא:

```text
Environment = REPLAY | SHADOW | PAPER | LIVE
```

‏במסגרת Playbook זה:

```text
REPLAY never reaches real execution adapter
SHADOW produces WouldHaveOrdered only
PAPER uses isolated credentials/environment
Ambiguous environment blocks external side effect
```

‏`PAPER → LIVE` escalation שקטה היא property violation.

### ‏`P0 — Required`: ‏Entry Block אינו Exit Block

‏Conduct uncertainty חוסם יצירת exposure חדשה, אך אינו אמור למחוק יכולת לצמצם exposure שכבר קיים.

```text
Block new risk
Preserve approved risk-reduction path
```

‏לכן `COMPLIANCE_BLOCK`, ‏`ENTRY_BLOCKED`, ‏`EXIT_ONLY` ו־`FULL_STOP` מקבלים semantics נפרדים.

### ‏`P0 — Required`: ‏Immutable Audit Lineage

‏כל chain מהותית ניתנת לשחזור:

```text
DecisionId
→ ComplianceDecisionId
→ OrderIntentId
→ Simulated/Broker Order Id
→ Execution/Outcome Id
```

‏כל block כולל:

```text
ReasonCodes[]
EvidenceRefs[]
PolicyVersion
EvaluatedAt
NextSafeAction
```

‏אין מחיקה שקטה של compliance events; correction היא record חדש.

### ‏`P0 — Required`: ‏Hard Controls ראשונים

‏ב־baseline נעדיף deterministic correctness checks:

```text
DUPLICATE_INTENT
RELATED_OPPOSING_ORDER_EXISTS
UNKNOWN_EXTERNAL_STATE
UNKNOWN_ORDER_OWNERSHIP
ENVIRONMENT_MISMATCH
RECOVERY_IN_PROGRESS
MANUAL_ORDER_CONFLICT
```

‏לפני anomaly model מורכב.

### ‏`P1 — Preferred`: ‏Internal Prevention לפני Venue/Broker STP

‏מנגנון `Self-Match Prevention` של venue/broker הוא defense-in-depth בלבד.

```text
Internal conflict prevention
→ broker/venue SMP/STP capability when available
→ post-event surveillance
```

‏אירוע STP שנחסם חיצונית הוא גם success של שכבת ההגנה וגם signal לבדוק למה internal gate לא עצר קודם.

### ‏`P1 — Preferred`: ‏Canonical Reason Codes

‏נשתמש ב־ReasonCodes explainable עבור:

```text
RELATED_OPPOSING_ORDER_EXISTS
DUPLICATE_INTENT
UNKNOWN_BROKER_STATE
SELF_MATCH_RISK
MANUAL_ORDER_CONFLICT
RECOVERY_IN_PROGRESS
ENVIRONMENT_MISMATCH
COMPLIANCE_REFERENCE_STALE
```

‏Cancel/replace actions יקבלו reason כלכלי קנוני, ולא `UNKNOWN` כברירת מחדל.

### ‏`P1 — Preferred`: ‏Conduct Metrics כחלק מ־Daily Review

‏ה־Daily Review כולל לפחות:

```text
Compliance blocks
Prevented conflicts
STP/SMP events when observable
Unknown cancel reasons
Orphan intents/orders
Opposing-overlap episodes
Manual conflicts
Blind-retry attempts blocked
Order/replace churn distributions
```

‏המדדים מיועדים לחקירה ול־RCA; metric בודד אינו verdict משפטי.

### ‏`P1 — Preferred`: ‏Official References are Versioned State

‏נשמור:

```text
PolicyVersion
BrokerRuleReferenceVersion
VenueCapabilityVersion
VerifiedAt
AppliesTo
```

‏Broker/Venue/Regulatory behavior אינו `eternal constant`.

### ‏`P2 — High Value`: ‏Replay/Shadow Conduct Harness

‏נבדוק את ה־Compliance Gate תחילה ב־Replay/Shadow עם order lifecycle מלא ככל האפשר:

```text
Intent
Submit/WouldSubmit
Ack/Working Model
Partial Fill / Fill
Cancel / Replace
Reconnect
Manual intervention
Recovery
```

‏נשמור `Golden Scenarios` ו־`Golden Failures`.

### ‏`P2 — High Value`: ‏Compliance Capability Snapshot

‏לכל release משמעותי נצלם capabilities רלוונטיות של adapter/environment:

```text
supportsSelfMatchPrevention
supportsOrderGroupId
supportsNativeOCO
supportsCancelReplace
supportsVenueDetails
```

‏`Unknown != False`, אבל capability קריטית לא מנחשים.

### ‏`P3 — Challenger`: ‏Explainable Anomaly Detection

‏רק אחרי baseline deterministic אפשר לבחון anomaly detection על sequence/order behavior.

‏תפקידו:

```text
Raise REVIEW_REQUIRED
```

‏לא להסיק “illegal” ולא לשנות authority אוטומטית.

### ‏`P4 — Specialist`: ‏Cross-Strategy Graph / Separate Compliance Service

‏רק אם המערכת גדלה לכמה strategies/accounts/processes ויש Evidence שה־complexity מוצדקת.

‏ב־Production v1 קטן עדיף `Modular Monolith` עם module boundary חזק.

---

## ‏3. Why

‏Execution correctness אינו מספיק.

‏מערכת יכולה להיות:

```text
technically functioning
+ fast
+ profitable in simulation
```

‏ועדיין לייצר behavior לא נשלט בגלל:

```text
duplicate processes
manual/automatic conflicts
stale retries
unknown broker effects
entry/exit overlap
wrong environment routing
orphan orders
recovery races
```

‏שכבת Compliance נועדה להבטיח שהתנהגות המערכת עצמה נשארת explainable, owned, bounded ו־auditable.

---

## ‏4. Use When

‏ה־Recommendation חלה כאשר קיימים אחד או יותר מהבאים:

- ‏יותר מ־component אחד שיכול ליצור/לשנות order intent.
- ‏Entry, Exit, Recovery או Manual flows שחולקים אותו account/symbol scope.
- ‏Retry/reconnect paths.
- ‏Broker/venue capabilities כגון STP/SMP.
- ‏Paper/Shadow/Replay adapters לצד production-like code path.
- ‏כמה strategy instances או failover.
- ‏order churn, cancel/replace או working-order state שדורשים explanation.
- ‏צורך ב־RCA/audit מלא של behavior.

---

## ‏5. Do Not Use When

‏לא נשתמש בשכבה הזו כדי:

- ‏ללמד כיצד ליצור false market signal.
- ‏לכוון thresholds שמטרתם לעבור מתחת ל־surveillance.
- ‏להסיק legal guilt מתוך `cancel_rate`, ‏`self-trade count` או metric בודד.
- ‏להפוך conduct control ל־PnL optimizer.
- ‏להכשיר behavior רק משום שה־broker קיבל אותו.
- ‏להחליף ייעוץ/Reference רשמי בכללים משפטיים או venue-specific.
- ‏לחסום אוטומטית exit/risk reduction בלי policy מפורשת.

---

## ‏6. Alternatives

| Alternative | יתרון | חיסרון | Recommendation |
|---|---|---|---|
| ‏ללא Gate פנימי | פשוט | conflicts/ownership אינם נשלטים | ‏להימנע |
| ‏Broker/Venue STP בלבד | קל אם נתמך | אינו רואה את כל ה־system intent וה־scope | ‏Defense-in-depth בלבד |
| ‏Deterministic internal gate | explainable ומהיר | דורש ownership/state נכון | ‏Baseline מועדף |
| ‏Post-event surveillance בלבד | עשיר ב־evidence | מאוחר מדי למנוע conflict | ‏משלים בלבד |
| ‏Black-box anomaly model | יכול לזהות patterns לא צפויים | false positives/explainability | ‏Challenger מאוחר |
| ‏Independent compliance service | isolation חזק | complexity/latency/ops | ‏רק לאחר Evidence |

---

## ‏7. Trade-offs

### ‏Correctness מול Latency

‏Compliance מוסיף עבודה ל־hot path, אבל ownership/conflict correctness קודמים לאופטימיזציית microseconds.

‏נעדיף:

```text
Fast deterministic P0 checks on hot path
Deep pattern analysis async / post-event
```

### ‏False Positive מול False Negative

‏Gate קשיח מדי יכול לחסום פעילות לגיטימית; gate חלש מדי משאיר conflicts.

‏Calibration נעשה לפי evidence ותוצאות control — לא לפי PnL בלבד.

### ‏Visibility מול Broker/Router Opacity

‏Native algos ו־smart routing יכולים להסתיר child/venue detail.

‏Observability gap מוריד confidence; הוא אינו הופך ל־assumed visibility.

### ‏KISS מול Coverage

‏למערכת אישית קטנה עדיף מעט invariants חזקים על regulatory rules engine ענק.

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מכניס בגרסה הראשונה:

- ‏Machine-learning compliance classifier.
- ‏cross-instrument surveillance graph.
- ‏complex legal-threshold heuristics.
- ‏venue-by-venue hard-coded assumptions בתוך domain logic.
- ‏single numeric `ComplianceScore`.
- ‏automatic weakening of controls בעקבות ירידת PnL.
- ‏microservice נפרד אם module פנימי מספיק.
- ‏silent debug override שמנטרל gate.

---

## ‏9. What to Add Later

‏לאחר שיש Evidence:

- ‏anomaly/sequence analysis שמעלה `REVIEW_REQUIRED`.
- ‏cross-strategy/account-scope graph.
- ‏automated conduct drift detection.
- ‏broker/venue capability registry.
- ‏policy diff + release impact analysis.
- ‏episode-based surveillance analytics.
- ‏tamper-evident audit storage מתקדם.
- ‏independent compliance process/service אם fault isolation מצדיק זאת.

---

## ‏10. Required Data / Evidence

‏לפחות:

```text
DecisionId
ComplianceDecisionId
OrderIntentId
StrategyInstanceId
StrategyVersion
ConfigFingerprint
PolicyVersion
Environment
AccountScope
RelatedStrategyGroup
Symbol
Side
Purpose
EconomicPurpose
IntentTTL
WorkingRelatedOrders snapshot
Position / pending exposure state
External/Broker state or simulator equivalent
Submit/Ack/Fill/Cancel/Replace timeline
ReasonCodes
Manual actions
Recovery generation / fencing token
Data/clock quality
Reference versions + VerifiedAt
```

‏ל־RCA נשמור גם `AsObserved` מול `AsCorrected` כאשר רלוונטי.

---

## ‏11. Promotion Criteria

‏כאן `Promotion` פירושו קידום capability בתוך `Research / Replay / Shadow / Paper / Production Engineering Readiness` בלבד.

‏ניתן לקדם כאשר:

1. ‏100% מה־intents בתחום הבדיקה מקבלים ownership ו־purpose lineage.
2. ‏Duplicate intents אינם יוצרים side effect כפול בסימולציה/בדיקה.
3. ‏Related opposing intents מזוהים ונחסמים/מועברים ל־reconcile לפי policy.
4. ‏`UNKNOWN_EFFECT` אינו מוביל ל־blind retry.
5. ‏Environment isolation מוכחת בבדיקות.
6. ‏Manual/recovery/second-instance scenarios מכוסים.
7. ‏Compliance blocks כוללים ReasonCode + EvidenceRefs.
8. ‏Entry block אינו משבית risk-reduction path שנבדק.
9. ‏Golden/Fault scenarios reproducible.
10. ‏critical external references אינם stale.
11. ‏אין open `P0` conduct blocker.
12. ‏Latency overhead נשאר בתוך budget שנבדק בלי למחוק correctness.

---

## ‏12. Rejection Criteria

‏נפסול/נחזיר לעיצוב אם:

- ‏Order live/simulated אינו ניתן למיפוי ל־intent authoritative.
- ‏Second instance יכולה לפעול ללא fencing.
- ‏Timeout מוביל ל־retry לפני reconciliation.
- ‏Paper/Shadow intent יכול להגיע ל־real adapter path.
- ‏Manual activity אינה observable.
- ‏related opposing intents יכולים להיות פעילים בלי policy מפורשת.
- ‏Compliance Gate תלוי ב־Score וניתן לעקיפה באמצעות ranking.
- ‏critical block חסר ReasonCode/evidence.
- ‏STP חיצוני הוא מנגנון המניעה היחיד.
- ‏policy relies on magic legal thresholds ללא מקור/Scope/VerifiedAt.
- ‏control calibration נעשה לפי PnL בלבד.
- ‏audit trail ניתן לשינוי שקט.

---

## ‏13. Metrics

### ‏Prevention

```text
DuplicateIntentBlockedCount
RelatedConflictBlockedCount
BlindRetryBlockedCount
EnvironmentCrossingBlockedCount
PreventedSelfMatchCount
```

### ‏State / Ownership

```text
LiveOrSimulatedOrdersWithoutIntent
UnknownOwnershipCount
OrphanOrderCount
GhostLocalOrderCount
UnknownEffectCount
TwoWriterIncidents
```

### ‏Behavior

```text
CancelRate
ReplaceRate
OrderAgeAtCancel
OpposingOrderOverlapTime
OrderChurnPerEconomicObjective
UnknownCancelReasonRate
```

### ‏Evidence / Operations

```text
ComplianceBlockRate
ReasonCodeCoverage
AuditLineageCoverage
ReferenceFreshness
ComplianceGateLatency p50/p95/p99
IncidentPacketCompleteness
```

‏לא נשתמש ב־metric בודד כ־legal verdict.

---

## ‏14. Failure Modes

### ‏`Intentless Order`

‏Order קיים בלי economic purpose שניתן להסביר.

### ‏`Ownership Split`

‏שני components מאמינים שהם authoritative.

### ‏`Blind Retry`

‏effect לא ידוע מוביל ל־duplicate behavior.

### ‏`Environment Crossing`

‏Research/Paper path מגיע ל־external side effect לא מאושר.

### ‏`STP Dependence`

‏Internal coordination חסר כי “ה־venue כבר יגן”.

### ‏`Metric-as-Verdict`

‏Cancel rate או pattern diagnostic הופכים אוטומטית לקביעה משפטית.

### ‏`Compliance-PnL Coupling`

‏Guardrail נחלש בגלל performance כלכלי.

### ‏`Audit Gap`

‏אין דרך לענות מי יצר Order, למה, ומה השתנה.

### ‏`Exit Suppression`

‏Entry block משבית בטעות את Position/Exit path.

### ‏`Reference Drift`

‏broker/venue/regulatory assumption נשאר hard-coded אחרי שהעולם השתנה.

### ‏`Churn Symptom Fix`

‏מעלים threshold במקום לטפל ב־rank instability/retry/recovery root cause.

---

## ‏15. User-Specific Application

‏לרובוט ה־Short-Horizon הרחב שלנו, ה־baseline המחקרי יהיה:

```text
One authoritative writer per controlled scope
→ Decision Snapshot
→ Risk Gate
→ Compliance Gate
→ Durable Paper/Shadow OrderIntent
→ Related-intent conflict check
→ Revalidation
→ Simulated/Paper execution boundary
→ Continuous ownership/reconciliation
→ Outcome + Conduct evidence
```

‏ה־Compliance Gate נשאר קטן ומהיר:

```text
Duplicate intent?
Unknown effect?
Related opposing intent?
Manual/recovery conflict?
Wrong/unknown environment?
Unknown owner?
```

‏Deep surveillance, anomaly detection ו־cross-strategy analytics נשארים מחוץ ל־hot path.

‏בגלל ה־short horizon, נמדוד גם את `ComplianceGateLatency`, אבל לא נוותר על P0 correctness כדי לחסוך latency.

---

## ‏16. Confidence

### ‏High

‏Confidence גבוה בעקרונות:

- ‏bona-fide economic intent ו־ownership lineage.
- ‏internal conflict prevention.
- ‏no blind retry under unknown effect.
- ‏environment isolation.
- ‏auditability ו־ReasonCodes.
- ‏STP/SMP כ־defense-in-depth.
- ‏separation בין conduct, risk, execution quality ו־PnL.

### ‏Medium

‏Confidence בינוני ב־exact operational thresholds עבור churn/anomaly review, משום שהם תלויי strategy, venue, product ו־observed behavior.

### ‏Low / Reference-Dependent

‏כל legal/regulatory interpretation ספציפי, ownership scope משפטי, retention period, venue capability או broker behavior מדויק דורש Reference רשמי ועדכני.

---

## ‏17. Time-Sensitive Facts

‏נכון ל־27 באוקטובר 2026, אימות מול מקור Nasdaq הרשמי מאשר ש־`Equity Trader Alert #2026-45` הכריז על `Order-by-Order Self Match Prevention` עבור Nasdaq, Nasdaq Texas ו־Nasdaq PSX, עם launch dates בספטמבר 2026 ו־order-level fields שמרחיבים את הגדרות ה־SMP הקיימות.

‏זהו `Fact` תלוי־venue/protocol/date בלבד; הוא אינו כלל אוניברסלי עבור brokers או venues אחרים.

‏FINRA מפרסמת supervisory guidance שמדגישה surveillance/control סביב manipulative trading patterns ו־algorithmic trading. Exact obligations, scope ו־applicability נשארים Reference רשמי שצריך לאמת עבור הסביבה הרלוונטית.

‏לכל Reference תפעולי נשמור:

```text
Source
VerifiedAt
EffectiveFrom
AppliesTo
Version
Owner
NextReview
```

---

## ‏18. Fact / Judgment / Hypothesis

### ‏Fact

- ‏External/Broker acceptance אינו מוכיח internal policy compliance.
- ‏Lost acknowledgment אינו מוכיח absence of external effect.
- ‏Venue/Broker SMP/STP capabilities הן capability-specific ומשתנות לפי venue/protocol/setup.
- ‏`AsObserved` ו־`AsCorrected` יכולים להיות שונים.

### ‏Judgment

- ‏Deterministic internal compliance gate לפני side effect הוא baseline מועדף.
- ‏One authoritative writer + fencing הוא baseline פשוט וחזק כאשר scope דורש writer יחיד.
- ‏Hard correctness controls קודמים ל־anomaly ML.
- ‏Conduct metrics צריכים להיכנס ל־Daily Review ול־Champion/Challenger guardrails.

### ‏Hypothesis

- ‏Rank stability/debounce/cooldown עשויים להפחית unnecessary churn בלי למחוק edge; יש לבדוק empirically.
- ‏Anomaly detection עשוי לזהות failure patterns שה־deterministic rules מפספסים; צריך למדוד false positives ו־incremental value.

---

## ‏19. Priority Map

### ‏`P0`

- ‏Bona-fide intent.
- ‏Order ownership lineage.
- ‏single-writer/fencing לפי scope.
- ‏related-intent conflict prevention.
- ‏`UNKNOWN_EFFECT → reconcile before retry`.
- ‏environment isolation.
- ‏entry-block/exit-capability separation.
- ‏immutable audit + ReasonCodes.
- ‏critical official references versioned.

### ‏`P1`

- ‏venue/broker STP defense-in-depth.
- ‏conduct metrics + Daily Review.
- ‏continuous working-intent reconciliation.
- ‏release/capability snapshot.

### ‏`P2`

- ‏Golden/Fault conduct scenarios.
- ‏episode-based surveillance.
- ‏conduct guardrails ב־Champion/Challenger.
- ‏conduct drift monitoring.

### ‏`P3`

- ‏explainable anomaly/sequence challenger.
- ‏automated policy/reference freshness checks.

### ‏`P4`

- ‏cross-strategy graph.
- ‏independent compliance service.
- ‏advanced multi-account/multi-instrument surveillance only if evidence and scope justify it.

---

## ‏20. Definition of Done

‏מקטע 85A נחשב מיושם ברמת Recommendation כאשר אפשר לענות `כן` על השאלות הבאות:

1. ‏האם לכל intent יש economic purpose, owner ו־version lineage?
2. ‏האם duplicate/related opposing intents מזוהים לפני side effect?
3. ‏האם `UNKNOWN_EFFECT` חוסם retry מגדיל־סיכון עד reconciliation?
4. ‏האם Replay/Shadow/Paper מבודדים מה־real execution boundary?
5. ‏האם manual/recovery/second-instance paths נמצאים באותו ownership model?
6. ‏האם Compliance הוא Hard Gate שאינו ניתן לעקיפה על ידי Score?
7. ‏האם Entry block משאיר risk-reduction capability לפי policy?
8. ‏האם כל block כולל ReasonCode ו־EvidenceRefs?
9. ‏האם external SMP/STP הוא רק defense-in-depth?
10. ‏האם Golden/Fault tests מכסים retry, partial fill, reconnect, duplicate instance ו־manual conflict?
11. ‏האם conduct metrics משמשים ל־investigation ולא ל־magic legal threshold?
12. ‏האם facts תלויי Broker/Venue/Regulation מנוהלים כ־versioned References עם `VerifiedAt`?

---

## ‏21. Conclusion

‏ה־Recommendation עבור הרובוט שלנו היא:

```text
Bona-Fide Intent
+ Clear Ownership
+ Deterministic Conflict Prevention
+ Reconcile Before Retry
+ Environment Isolation
+ Preserve Exit Capability
+ Immutable Evidence
+ Versioned External References
= Conduct-Safe Engineering Baseline
```

‏היעד אינו “לנחש מה surveillance חיצוני יחפש”.

‏היעד הוא לבנות מערכת שבכל רגע יכולה לענות:

```text
Why does this order exist?
Who owns it?
What exposure does it change?
What conflicts with it?
What external truth do we know?
What do we not know?
What is the next safe action?
```

‏אם אין תשובה אמינה — ברירת המחדל היא לעצור יצירת סיכון חדש, לשחזר truth, ולשמור Evidence.