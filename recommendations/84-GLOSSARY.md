# ‏84 — Recommendation Sheet: Glossary

> ‏מקור לימודי עיקרי: `../84-GLOSSARY.md`.
>
> ‏מטרת הקובץ: להכריע כיצד להשתמש ב־Glossary קנוני כ־semantic contract בין Research, Code, Telemetry, Replay, RCA ו־Operations, כך שאותו מונח ייצג אותה משמעות, אותו source of truth ואותם state semantics בכל המערכת.
>
> ‏המקטע מוגבל ל־`Research / Replay / Shadow / Paper` ולתכנון Architecture/Governance. הוא אינו הוראה לבצע מסחר בכסף אמיתי ואינו אישור `Live`.

---

## ‏1. Decision

‏השאלה המרכזית אינה:

```text
Do we have a list of definitions?
```

‏אלא:

```text
Can every critical term be interpreted identically
across code, data, telemetry, tests, replay, RCA and documentation?
```

‏ברירת המחדל:

```text
Canonical Term
→ Precise Definition
→ Explicit Non-Equivalents
→ Source / Benchmark / Clock Semantics
→ Machine-Readable State / Reason Code
→ Code + Schema + Metric Naming
→ Tests / Replay / RCA
→ Versioned Change
```

‏העיקרון המנחה:

```text
Terminology is part of Correctness.
Ambiguous language creates ambiguous state.
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Glossary קנוני אחד

‏נשתמש ב־`84-GLOSSARY.md` כבסיס הקנוני להגדרות המערכת, ולא נאפשר לכל רכיב להמציא semantics מקומיים למונחים קריטיים.

‏מונחים כגון:

```text
Last
Bid / Ask
Fresh / Stale
Score / Rank
TRADE / NO_TRADE / UNKNOWN
Submitted / Accepted / Working / Filled
Position / Exposure / Pending Exposure
Edge / Net Edge / RemainingNetEdge
Local Truth / Broker Truth
Latency
```

‏חייבים לקבל משמעות עקבית בכל שכבה.

### ‏`P0 — Required`: אותו שם אינו רשאי לייצג שני concepts שונים

‏אם שני concepts שונים זקוקים לאותו שם כללי, משנים את השם עד שה־semantics מפורשים.

‏לדוגמה, לא משתמשים ב־`price` כאשר הכוונה יכולה להיות:

```text
lastPrice
bidPrice
askPrice
midPrice
arrivalPrice
fillPrice
```

‏ולא משתמשים ב־`latency` ללא start/end:

```text
receiveToDecisionLatency
submitToAckLatency
submitToFillLatency
decisionToUsefulFillLatency
```

### ‏`P0 — Required`: State names מייצגים state אמיתי

‏ההבחנות הבאות נשמרות במפורש:

```text
NO_TRADE != UNKNOWN
Submitted != Accepted != Working != Filled
PendingCancel != Cancelled
LocalPositionEstimate != BrokerPosition != ReconciledPosition
Missing != Zero
NOT_READY != Zero
HealthyNoTrade != BrokenNoTrade
```

‏אין לקצר אותן ל־boolean או `status=ok` אם הקיצור מוחק משמעות תפעולית.

### ‏`P0 — Required`: External Truth לעומת Local Projection

‏בכל domain חיצוני יש שם שמבהיר מי authoritative.

‏במיוחד:

```text
Order Intent → Internal durable truth
Broker Order / Fill / Position → External truth after reconciliation
Current local state → Projection / estimate until reconciled
```

‏מונח `Position` לא ישמש ל־cached assumption כאשר בפועל הכוונה היא `localPositionEstimate`.

### ‏`P0 — Required`: Time semantics הם חלק מהשם וה־contract

‏כל metric זמן משמעותי חייב להגדיר:

- ‏Start event.
- ‏End event.
- ‏Clock domain.
- ‏Unit.
- ‏Aggregation אם מדובר ב־p50/p95/p99.

‏`Latency = 40ms` לבדו אינו Evidence מספיק.

### ‏`P0 — Required`: Price semantics הם חלק מהשם וה־contract

‏כל price metric חייב לציין source/benchmark.

‏לדוגמה:

```text
DecisionPrice = Mid at DecisionTime
ArrivalPrice = Mid/quote benchmark at submit boundary
FillPrice = actual simulated/paper fill
ReferencePrice = explicitly named benchmark
```

‏`Last` לעולם אינו מקבל אוטומטית משמעות של executable price.

### ‏`P0 — Required`: Canonical Reason Codes

‏Veto, rejection, no-trade, degraded state, recovery transition ו־incident צריכים reason codes יציבים ומכונתיים.

‏המטרה היא ש־UI, logs, metrics, replay ו־RCA ידברו באותה taxonomy.

### ‏`P0 — Required`: Glossary change הוא contract change

‏שינוי definition של מונח קריטי אינו עריכת ניסוח בלבד.

‏לפני שינוי נבדוק השפעה על:

```text
Code identifiers
Schemas
Metrics / dashboards
Alerts
Tests
Decision packets
Replay
Historical evidence
RCA documents
Runbooks
```

‏שינוי משמעותי דורש versioning/migration לפי impact.

### ‏`P1 — Baseline`: Naming lint / review checklist

‏ב־code review וב־schema review נבדוק לפחות:

- ‏האם `price` מציין איזה price.
- ‏האם `latency` מציינת start/end.
- ‏האם `fresh` מציין threshold/age.
- ‏האם `position` מציין source of truth.
- ‏האם `score` באמת score ולא probability/expected return.
- ‏האם `error` הוא failure טכני, reject, veto או business no-trade.
- ‏האם `status` אינו מסתיר capabilities שונות.

### ‏`P1 — Baseline`: Capability health במקום `status=ok`

‏נפריד לפחות:

```text
dataHealth
scannerHealth
executionHealth
brokerOrSimulatorHealth
positionTruthHealth
replayHealth
readinessState
```

‏כך subsystem יכול להיות alive אך לא ready, או scanner יכול להיות healthy בזמן שאין market opportunity.

### ‏`P1 — Baseline`: Glossary links ב־contracts

‏Schemas, telemetry dictionaries, runbooks ו־design docs צריכים להפנות להגדרה הקנונית במקום לשכפל definition חדש.

### ‏`P2 — Improvement`: Machine-readable terminology registry

‏כאשר מספר ה־contracts גדל, אפשר להחזיק registry קטן עם:

```text
TermId
CanonicalName
DefinitionVersion
Domain
StateType
Owner
DeprecatedAliases
```

‏המטרה היא validation ו־discoverability, לא להקים ontology platform כבדה.

### ‏`P3 — Advanced`: Automated semantic consistency checks

‏ניתן להוסיף checks שמזהים:

- ‏metrics בשם `latency` ללא endpoints.
- ‏fields גנריים כגון `price`/`status`/`error` ב־critical schemas.
- ‏deprecated aliases.
- ‏ReasonCodes שאינם registry-known.
- ‏schema fields שמתנגשים ב־canonical state naming.

### ‏`P4 — Specialist`: Formal schema/ontology generation

‏Code generation, typed semantic schemas או ontology רחבה ייכנסו רק אם scale ומספר consumers מצדיקים Complexity Tax נוסף.

---

## ‏3. Why

‏מערכת יכולה להיות נכונה בתוך כל module ועדיין להיכשל ברמת המערכת אם שני modules מפרשים אותו term אחרת.

‏לדוגמה:

```text
Execution says "Accepted"
Dashboard interprets it as "Working"
Position service assumes "Working" means exposure exists
RCA reads "Filled" from another lifecycle definition
```

‏זו אינה בעיית documentation בלבד; זו semantic integration failure.

‏Glossary קנוני מקטין ambiguity ומאפשר:

- ‏State machines עקביים.
- ‏Metrics ברי השוואה.
- ‏Replay שניתן לפרש.
- ‏RCA מהיר יותר.
- ‏Tests שמגינים על אותה משמעות.
- ‏Version migrations שניתן להסביר.

---

## ‏4. Use When

‏המדיניות חלה במיוחד כאשר:

- ‏אותו concept מופיע ביותר מרכיב אחד.
- ‏מונח משפיע על safety/readiness.
- ‏metric משמש acceptance gate.
- ‏field נשמר ל־replay/RCA.
- ‏Broker/provider semantics מתורגמים ל־domain state.
- ‏Dashboard או UI מציגים operational truth.
- ‏מחקר משווה results בין StrategyVersions.
- ‏אירוע יכול לקבל כמה meanings כגון reject/veto/no-trade/failure.

---

## ‏5. Do Not Use When

‏אין צורך להפוך כל variable מקומי זמני ל־Glossary entry.

‏אין להשתמש במילון כדי:

- ‏להחליף domain model אמיתי.
- ‏להסתיר ambiguity תחת definition ארוכה.
- ‏לנעול wording כאשר concept עצמו עדיין ניסויי.
- ‏לקודד details חיצוניים משתנים כאילו הם invariants.
- ‏לייצר מאות aliases רק כדי לשמור backward compatibility לנצח.

‏כאשר detail תלוי Broker, venue, regulation, fee schedule או API version — ה־Glossary מגדיר את concept, וה־current exact value נשאר ב־Reference versioned.

---

## ‏6. Alternatives

### ‏Alternative A — Documentation-only Glossary

‏פשוט וזול, אך אינו מונע schema/code drift.

### ‏Alternative B — Typed Domain Model בלבד

‏מחזק compile-time semantics, אבל אינו פותר metrics, dashboards, docs ו־RCA אם terminology שם שונה.

### ‏Alternative C — Machine-readable Registry

‏טוב כאשר יש consumers רבים; מוסיף governance overhead.

### ‏Alternative D — Formal Ontology

‏מתאים רק למערכת גדולה ורב־צוותית. עבור baseline אישי זו בדרך כלל מורכבות מיותרת.

---

## ‏7. Trade-offs

### ‏Precision מול Verbosity

‏`submitToAckLatency` ארוך מ־`latency`, אבל ambiguity יקרה יותר מהשם הארוך.

### ‏Stability מול Evolution

‏הגדרה קנונית צריכה להיות יציבה, אך לא קדושה. שינוי evidence/domain אמיתי מותר — רק לא silent mutation.

### ‏Centralization מול Local Convenience

‏Glossary מרכזי מפחית freedom מקומית אך מגדיל interoperability ו־RCA quality.

### ‏Strictness מול Research Speed

‏ב־research scratch space אפשר שמות זמניים; ברגע שהנתון נכנס ל־shared evidence, replay או decision contract הוא חייב terminology קנונית.

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מתחיל עם:

- ‏Enterprise ontology platform.
- ‏Code generation לכל term.
- ‏Hundreds of aliases.
- ‏Automatic renaming across history.
- ‏Natural-language classifier שמנסה לנחש meaning.
- ‏Glossary score יחיד שמסתיר סוגי ambiguity שונים.
- ‏Schema migration רחבה ללא consumer map.

‏ה־baseline הוא Markdown קנוני + naming rules + review/tests סביב critical contracts.

---

## ‏9. What to Add Later

‏לפי Evidence אפשר להוסיף:

1. ‏Machine-readable `TermRegistry`.
2. ‏Deprecated alias map.
3. ‏Schema lints.
4. ‏Telemetry dictionary generation.
5. ‏Cross-repo terminology checks.
6. ‏Migration reports כאשר definition משתנה.
7. ‏Dashboard links מה־metric להגדרה הקנונית.
8. ‏RCA tooling שמציג canonical definition של כל state/reason code.

---

## ‏10. Required Data / Evidence

‏לפני שינוי terminology מהותי צריך לאסוף:

- ‏Consumers של המונח בקוד.
- ‏Schemas ושדות persisted.
- ‏Metrics/dashboards/alerts.
- ‏Tests ו־fixtures.
- ‏Replay/historical datasets.
- ‏Reason-code usage.
- ‏Runbooks ו־operator commands.
- ‏Known incidents שנבעו מאי־בהירות.
- ‏Backward compatibility requirements.
- ‏Current owner וה־definition version.

‏עבור term חדש צריך להראות לפחות:

```text
Canonical definition
Non-equivalent terms
Domain location
Source of truth / benchmark / clock semantics when relevant
Examples
Failure / UNKNOWN semantics
Owner
```

---

## ‏11. Promotion Criteria

‏מונח חדש או definition חדשה יכולים להפוך לקנוניים כאשר:

1. ‏ה־concept נדרש ביותר מ־context מקומי אחד או משפיע על critical contract.
2. ‏ההגדרה חד־משמעית וניתנת לבדיקה.
3. ‏ברור עם אילו terms אסור לבלבל אותו.
4. ‏Source/benchmark/clock semantics מפורשים כאשר רלוונטי.
5. ‏Code/schema/telemetry naming יכולים להתיישר להגדרה.
6. ‏Migration impact ידוע.
7. ‏Historical/replay interpretation נשמרת או מקבלת version מפורש.
8. ‏אין P0 ambiguity פתוח.

---

## ‏12. Rejection Criteria

‏נرفض terminology change כאשר:

- ‏המונח נשאר תלוי context ללא qualifier.
- ‏אותו שם עדיין מייצג שני states שונים.
- ‏ההגדרה משתמשת במילים עמומות כמו “current”, “valid”, “good”, “fast” בלי threshold/source.
- ‏אין דרך לדעת source of truth.
- ‏שינוי יפרש מחדש evidence היסטורי בלי version/migration.
- ‏השם החדש מטשטש `UNKNOWN`/failure semantics.
- ‏ה־change נועד רק לקיצור שם אך מפחית precision.

---

## ‏13. Metrics

### ‏Semantic Quality

- ‏`AmbiguousCriticalTermCount`.
- ‏`DuplicateMeaningCount`.
- ‏`ConflictingDefinitionCount`.
- ‏`DeprecatedAliasUsageRate`.
- ‏`UnnamedSourceOfTruthCount`.

### ‏Telemetry / Schema Quality

- ‏`GenericPriceFieldCount`.
- ‏`UnboundedLatencyMetricCount`.
- ‏`GenericStatusFieldCount` ב־critical schemas.
- ‏`UnknownReasonCodeRate`.
- ‏`MissingClockSemanticsRate`.

### ‏Operations / Learning

- ‏Incidents עם terminology ambiguity כגורם.
- ‏RCA time lost to semantic clarification.
- ‏Replay mismatches שנבעו מהגדרות שונות.
- ‏Migration defects לאחר glossary changes.

---

## ‏14. Failure Modes

### ‏Semantic Drift

‏הקוד ממשיך להתפתח אבל ה־Glossary נשאר ישן.

### ‏Alias Explosion

‏שמות ישנים וחדשים חיים יחד ללא deprecation lifecycle.

### ‏Dashboard Reinterpretation

‏metric נשאר באותו שם אך formula/source משתנים.

### ‏Historical Meaning Rewrite

‏definition חדשה מוחלת בדיעבד על records שנוצרו תחת definition ישנה.

### ‏Provider Leakage

‏שם provider-specific מחלחל ל־domain model ומקבל בטעות משמעות כללית.

### ‏Unknown Collapse

‏`UNKNOWN`, ‏`NOT_READY`, ‏`MISSING`, ‏`NO_TRADE` או `REJECTED` מתמזגים ל־false/0/null אחד.

### ‏Truth Collapse

‏Local estimate ו־external truth נקראים באותו שם.

### ‏Metric Boundary Loss

‏`latency`, ‏`price`, ‏`cost` או `edge` נשמרים בלי benchmark/endpoint שמאפשר פירוש.

---

## ‏15. User-Specific Application

‏למערכת ה־Short-Horizon הנחקרת שלנו ה־Glossary חשוב במיוחד בגלל ארבעה אזורים:

1. ‏**Cross-sectional ranking** — `Universe`, ‏`Eligible`, ‏`FreshCoverage`, ‏`Score`, ‏`Rank`, ‏`Top-K`, ‏`RankGap` ו־`StaleWinner` חייבים להיות אחידים.
2. ‏**Short-lived information** — `FeatureAge`, ‏`DecisionTTL`, ‏`CandidateTTL`, ‏`LatencyPressure` ו־`RemainingNetEdge` אינם interchangeable.
3. ‏**Execution simulation / Paper** — `Intent`, ‏`Submitted`, ‏`Accepted`, ‏`Working`, ‏`PartialFill`, ‏`Filled`, ‏`Cancelled` ו־`UNKNOWN_EFFECT` חייבים lifecycle מפורש.
4. ‏**Evidence learning** — `As-Known-At`, ‏`HistoricalTruth`, ‏`DecisionSnapshot`, ‏`FirstDivergence`, ‏`DisagreementSet` ו־`StrategyVersion` חייבים להישאר reproducible.

‏ברירת המחדל שלנו תהיה naming מדויק גם אם הוא ארוך יותר, משום שהמחיר של ambiguity במערכת קצרה ומהירה גבוה מהמחיר של כמה תווים נוספים.

---

## ‏16. Confidence

‏**Confidence: High** לגבי העיקרון שה־Glossary צריך להיות semantic contract ושמונחים קריטיים צריכים definitions, truth/clock/benchmark semantics ו־versioned evolution.

‏**Confidence: Medium** לגבי רמת האוטומציה המדויקת של registry/lints; היא תלויה בגודל הקוד, מספר ה־schemas וה־consumers בפועל.

‏**Confidence: Low / Hypothesis** לגבי הצורך ב־formal ontology או code generation; אין להכניסם בלי Evidence לבעיה שלא נפתרת ב־baseline הפשוט.

---

## ‏17. Time-Sensitive Facts

‏ה־definitions הפנימיים של המערכת אינם אמורים להשתנות לפי זיכרון או לפי שינוי חיצוני שקט.

‏לעומת זאת, details כגון:

- ‏Broker order support.
- ‏API behavior/limits.
- ‏Venue rules.
- ‏Regulatory definitions/rates.
- ‏Fees.
- ‏Tax/account rules.
- ‏Market-data entitlements.

‏נשמרים כ־Reference חיצוני עם `Source`, ‏`VerifiedAt`, ‏`AppliesTo` ו־`Version`; ה־Glossary מגדיר את concept אך אינו מקפיא ערך חיצוני משתנה.

---

## ‏Fact / Judgment / Hypothesis

### ‏Fact

‏אותו term יכול ליצור integration bug כאשר רכיבים שונים מייחסים לו semantics שונים, גם אם כל רכיב בפני עצמו עקבי.

### ‏Judgment

‏במערכת שלנו עדיף semantic precision על שמות קצרים, ו־Markdown קנוני + code/schema naming discipline הוא baseline מספיק לפני tooling כבד.

### ‏Hypothesis

‏הוספת machine-readable registry ו־automated semantic checks תקטין incidents ו־RCA time רק לאחר שהיקף ה־contracts יצדיק את העלות.

---

# ‏Minimal Canonical Contract

```text
Term
→ One Meaning
→ Explicit Non-Equivalents
→ Domain
→ Source / Benchmark / Clock Semantics
→ Machine-Readable State / Reason Code where applicable
→ Version
→ Owner
→ Consumers
```

‏אם אחד מהשדות הקריטיים חסר, המונח עדיין אינו מספיק מדויק כדי לבסס עליו invariant, acceptance gate או RCA conclusion.

---

# ‏Definition of Done

‏מקטע Glossary נחשב מיושם כאשר:

1. ‏כל state קריטי משתמש בשם חד־משמעי.
2. ‏`Local` ו־external truth אינם חולקים שם עמום.
3. ‏כל price metric מציין source/benchmark.
4. ‏כל latency metric מציין start/end ו־clock semantics.
5. ‏`NO_TRADE`, ‏`UNKNOWN`, ‏`NOT_READY`, ‏`MISSING` ו־failure states נפרדים.
6. ‏כל veto/reject/state transition משמעותי ניתן לסיווג ב־ReasonCode.
7. ‏Strategy/evidence records נושאים version identity.
8. ‏Historical evidence שומר את definition/version שבו נוצר.
9. ‏שינוי terminology קריטי עובר impact review ולא silent rename.
10. ‏Code, telemetry, replay ו־RCA משתמשים באותה שפה.

‏המטרה אינה “מילון יפה”, אלא מערכת שבה precision בשפה יוצר precision ב־state, ב־metrics, בהחלטות וב־failures.