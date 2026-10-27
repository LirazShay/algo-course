# ‏72 — Recommendation Sheet: Fees, Tax and Accounting Awareness

> ‏מקור לימודי עיקרי: `../72-FEES-TAX-AND-ACCOUNTING-AWARENESS.md`.
>
> ‏מטרת הקובץ: להגדיר גבול ברור בין `Trading Economics`, ‏`Accounting / Ledger Truth` ו־`Tax Treatment`, כך שמערכת `Short-Horizon Momentum` תוכל למדוד Edge נטו בצורה נכונה, לשחזר את מה שבאמת קרה בחשבון, ולהפיק בעתיד שכבת דיווח מס נפרדת ומגרוסת — בלי לזהם את ה־Strategy בכללי מס תלויי־משתמש.
>
> ‏המקטע מוגבל ל־`Research / Replay / Shadow / Paper` ולתכנון Architecture. הוא אינו ייעוץ מס/משפטי/חשבונאי ואינו הוראה לבצע מסחר בכסף אמיתי. שיעורי מס, withholding, fee schedules, lot rules ודרישות דיווח תלויים במדינה, תושבות, שנת מס, Broker, legal entity וסוג חשבון, ולכן Facts כאלה חייבים אימות עדכני לפני שימוש תפעולי.

---

## ‏1. Decision

‏השאלה המרכזית אינה רק:

```text
Was the trade profitable?
```

‏אלא שלוש שאלות שונות:

```text
Economic Truth:
Did the market opportunity remain positive after realistic execution costs?

Accounting Truth:
What cash, positions, executions, fees and adjustments actually occurred?

Tax Truth:
How should those recorded events be classified and reported
under the applicable jurisdiction and tax-year rules?
```

‏שרשרת המערכת המומלצת:

```text
Candidate
→ Expected Pre-Tax Economics
→ Trade / No-Trade Research Outcome
→ Immutable Execution Events
→ Cash / Position Ledger
→ Broker Reconciliation
→ Economic PnL Attribution
→ Accounting Projection
→ Tax Projection by Jurisdiction / Tax Year
→ Report / Export
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: שלוש אמיתות נפרדות

‏נשמור במפורש:

```text
EconomicPnL
AccountingPnL
TaxablePnL
```

‏אסור לאחד אותן למספר יחיד.

- ‏`EconomicPnL` מיועד למחקר Strategy/Execution ויכול לכלול spread, slippage, impact, delay ו־opportunity measures.
- ‏`AccountingPnL` נגזר מ־transactions אמיתיים, fees, cash flows ו־positions.
- ‏`TaxablePnL` הוא projection תלוי jurisdiction/rule version ואינו source of truth למסחר.

### ‏`P0 — Required`: 72 מרחיב את 18, לא מחליף אותו

‏Recommendation 18 נשאר מקור האמת ל־`Executable Net Edge` ול־Cost Engine של החלטת המסחר.

‏מקטע 72 מוסיף מעליו:

```text
Immutable Ledger
Accounting Reconciliation
Tax-Lot-Ready Data Model
Tax Projection Boundary
Reporting / Auditability
```

‏אין לשכפל Cost logic בין שני מנועים.

### ‏`P0 — Required`: Decision Engine משתמש ב־Pre-Tax Economics

‏Baseline:

```text
ExpectedPreTaxNetEdge
= ExpectedGrossEdge
- ExpectedSpreadCost
- ExpectedSlippage
- ExpectedCommission
- ExpectedRegulatoryFees
- ExpectedImpact
- ExpectedBorrowCostIfRelevant
- ExpectedFXExecutionCostIfRelevant
```

‏Tax אינו microstructure cost ולכן אינו נכנס ל־hot-path כאחוז קשיח אוניברסלי.

‏After-tax analysis יכול להתקיים כשכבת Scenario נפרדת.

### ‏`P0 — Required`: Immutable Execution Ledger

‏כל Fill מקבל identity יציבה ונשמר כאירוע שאינו נכתב מחדש בשקט.

‏Contract מינימלי:

```text
ExecutionId
OrderId
TradeGroupId
SecurityId
AccountIdAlias
BrokerEntity
Side
Quantity
Price
Currency
ExecutionTime
ReceiveTime
Commission
FeeBreakdown
FeeCurrency
RawBrokerPayloadRef
SourceVersion
```

‏Correction/Bust נשמרים כאירוע חדש:

```text
OriginalExecution
→ CorrectionEvent
→ EffectiveExecution
```

### ‏`P0 — Required`: Raw Broker Data נשמר בנפרד מ־Derived Views

‏הארכיטקטורה:

```text
Raw Broker Events / Statements
→ Normalized Immutable Events
→ Derived Ledgers / PnL / Reports
```

‏אם parser או rules משתפרים, rebuild מתבצע מה־raw data — לא מעריכת history ידנית.

### ‏`P0 — Required`: Broker Reconciliation הוא Gate לאיכות הנתונים

‏נבצע reconciliation של:

```text
Executions
Cash
Positions
Fees
CorporateActions
```

‏`UnexplainedDifference` מהותי הוא Error ולא rounding שאפשר להתעלם ממנו.

### ‏`P0 — Required`: ‏`Missing != Zero`

‏חסר `CostBasis`, ‏Fee, ‏FX rate, withholding או corporate-action metadata מסומן:

```text
KNOWN
INFERRED
MISSING
DISPUTED
```

‏לא ממלאים `0` כדי שהדוח “יעבור”.

### ‏`P0 — Required`: Tax Logic מחוץ ל־Strategy Core

‏Tax Engine/Projection מקבל Ledger שכבר הושלם ומוסיף classification לפי:

```text
Jurisdiction
TaxResidencyContext
TaxYear
AccountType
InstrumentType
TaxLotMethod
RuleSetVersion
VerifiedAt
```

‏שינוי מס אינו אמור לשנות את raw signal או את `EconomicPnL`.

---

## ‏3. Recommended Data Model

### ‏3.1 Execution Ledger

```text
ExecutionEvent
- ExecutionId
- OrderId
- TradeGroupId
- SecurityId
- Side
- Quantity
- Price
- InstrumentCurrency
- FeeBreakdown[]
- FeeCurrency
- ExecutedAt
- ReceivedAt
- BrokerEntity
- AccountAlias
- RawSourceId
- ParserVersion
```

### ‏3.2 Cash Ledger

```text
CashEvent
- EventId
- AccountAlias
- Currency
- EventType
- Amount
- EffectiveAt
- SettledAt
- Source
- SourceEventId
```

‏`EventType` יכול לכלול:

```text
TRADE_SETTLEMENT
COMMISSION
REGULATORY_FEE
BORROW_FEE
INTEREST
DIVIDEND
WITHHOLDING
FX_CONVERSION
DEPOSIT
WITHDRAWAL
CORPORATE_ACTION_CASH
MANUAL_CORRECTION
```

### ‏3.3 Position Projection

‏Position הוא State נגזר מאירועים, לא record שמחליף אותם.

```text
OpeningQty
+ BoughtQty
- SoldQty
+ CorporateActionQtyAdjustments
= ClosingQty
```

### ‏3.4 Tax-Lot-Ready Schema

```text
TaxLot
- SecurityId
- AcquisitionDate
- Quantity
- OriginalCost
- Currency
- FeeAdjustments
- CorporateActionAdjustments
- TaxAdjustments
- FinalBasis
- BasisStatus
- EvidenceRefs[]
```

‏אין חובה לממש Tax Engine מלא ב־MVP, אבל schema צריך לאפשר אותו בלי אובדן מידע.

### ‏3.5 FX Metadata

```text
InstrumentCurrency
AccountCurrency
ReportingCurrency
TaxReportingCurrency
FxRate
FxSource
FxTimestamp
FxRuleVersion
```

‏`SecurityPnL` ו־`FXPnL` נשמרים בנפרד.

---

## ‏4. Cost Model — Preferred Default

‏נשתמש ב־Cost Engine של 18 ונרחיב את observability שלו.

### ‏Explicit / Scheduled

```text
commission
exchange / venue fee
clearing / pass-through fee
regulatory fee
borrow fee
FX execution fee
```

### ‏Implicit / Modeled

```text
spread cost
entry slippage
exit slippage
impact
adverse selection
delay cost
missed-opportunity measure
```

### ‏Period / Fixed Operating Costs

```text
market-data subscriptions
servers
software subscriptions
other fixed operations
```

‏Fixed costs אינם נכנסים אוטומטית ל־per-trade hot-path. הם נמדדים בשכבת business economics נפרדת.

---

## ‏5. Metrics

### ‏5.1 Trade Economics

```text
AllInExecutionCost
CostPerShare
CostBps
RoundTripCost
EdgeConsumption
EdgeRetention
CostHeadroom
BreakEvenCost
```

### ‏5.2 Cost Distribution

‏לא להסתפק בממוצע:

```text
p50 / p90 / p95 / p99 slippage
p50 / p95 all-in cost
cost by symbol / liquidity regime / session / execution mode
```

### ‏5.3 Accounting Health

```text
UnreconciledCashDifference
UnreconciledPositionDifference
MissingCostBasisCount
UnknownFeeCount
UnknownFxRateCount
UnmatchedExecutionCount
ManualAdjustmentCount
DuplicateExecutionCount
```

### ‏5.4 Tax Readiness

```text
ClosedLotsWithoutBasis
TradesWithoutFeeBreakdown
DividendsWithoutWithholdingMetadata
CorporateActionsWithoutAdjustment
AccountsNotReconciled
UnknownTaxClassificationCount
```

### ‏5.5 Business Economics

```text
TradingNetBeforeFixedCosts
FixedOperatingCosts
ContributionMargin
CostPerDay
CapitalTurnover
```

---

## ‏6. Why

‏ב־Short-Horizon Strategy, גם עלות קטנה יכולה לצרוך חלק גדול מאוד מה־Edge.

‏בנוסף, אם accounting/tax logic מעורבב ב־Strategy:

- ‏שינוי fee schedule יכול להיראות כמו strategy drift.
- ‏שינוי tax rule יכול לשנות בטעות research metrics.
- ‏FX movement יכול להיראות כמו Security alpha.
- ‏Broker statement correction יכול לשבור PnL historical lineage.
- ‏Tax-lot choice יכול לשנות metric שלא אמור להיות תלוי בו.

‏הפרדה מבנית מונעת את כל משפחת הטעויות הזו.

---

## ‏7. Use When

‏ה־baseline הזה נדרש כאשר:

- ‏מודדים Net Edge ולא רק price movement.
- ‏יש fills חלקיים או executions מרובים.
- ‏יש כמה סוגי fees.
- ‏המסחר והדיווח משתמשים במטבעות שונים.
- ‏יש corporate actions.
- ‏רוצים לשחזר PnL בצורה deterministic.
- ‏רוצים להשוות Internal records ל־Broker statements.
- ‏רוצים להשאיר אופציה עתידית ל־tax projection בלי לשכתב את trading core.

---

## ‏8. Do Not Use When

‏אין להשתמש ב־Tax Projection כדי:

- ‏להחליט ש־Signal גרוע “כדאי” בגלל tax benefit תיאורטי.
- ‏לשנות raw research labels.
- ‏להחליף reconciliation מול Broker.
- ‏להמציא basis חסר.
- ‏להציג withholding כ־final tax due.
- ‏להניח שכל broker location קובע את tax residency/rules.

---

## ‏9. Alternatives

### ‏A. ‏Broker Statement Only

‏פשוט, אבל חסרים Decision Context, arrival quote, expected cost ו־strategy attribution.

‏מתאים כ־reconciliation source, לא כמערכת research מלאה.

### ‏B. ‏Internal Spreadsheet Only

‏קל להתחיל, אבל חלש ב־immutability, duplicate handling, revisions, lineage ו־deterministic rebuild.

### ‏C. ‏Immutable Event Ledger + Derived Projections — Preferred

‏מפריד raw truth מ־views נגזרים, מאפשר rebuild ו־audit.

### ‏D. ‏Full Accounting/Tax Platform

‏עשוי להיות שימושי בעתיד, אבל הוא complexity מוקדם מדי אם עדיין לא הוכח Edge מחקרי.

---

## ‏10. Trade-offs

### ‏Immutable Ledger

‏יתרונות:
- ‏Auditability.
- ‏Deterministic rebuild.
- ‏Corrections בלי מחיקת history.

‏חסרונות:
- ‏יותר storage/schema discipline.
- ‏Migration דורש תכנון.

### ‏Rich Fee Breakdown

‏יתרונות:
- ‏Attribution מדויק.
- ‏קל לזהות drift.

‏חסרונות:
- ‏Provider mappings מורכבים יותר.

### ‏Tax-Lot-Ready Schema מוקדם

‏יתרונות:
- ‏מונע migration כואב בעתיד.

‏חסרונות:
- ‏מעט fields שלא ישמשו ב־MVP הראשוני.

---

## ‏11. What I Would Avoid Initially

‏לא הייתי מתחיל מ:

- ‏Tax optimizer אוטומטי.
- ‏Multi-jurisdiction engine מלא.
- ‏AI שמנחש tax classification.
- ‏Tax-aware signal optimization.
- ‏קבוע tax rate בתוך Strategy code.
- ‏הקצאת כל fixed operating cost לכל Trade בזמן אמת.
- ‏Broker-specific spreadsheet כ־source of truth.
- ‏עריכת Ledger history במקום correction events.
- ‏binary floating point לכסף/fees בלי contract מפורש.

---

## ‏12. What to Add Later

‏רק לאחר Ledger ו־reconciliation יציבים:

- ‏Tax projection לפי jurisdiction/tax year.
- ‏Broker statement parsers נוספים.
- ‏Multi-account aggregation.
- ‏Historical fee schedule library.
- ‏Automated fee-drift detection.
- ‏Tax-lot reporting views.
- ‏Advisor-ready exports.
- ‏After-tax scenarios.
- ‏Loss carryforward projections כאשר הכללים אומתו.
- ‏Rule-change monitoring.

---

## ‏13. Required Data / Evidence

‏לכל calculation משמעותי נדרוש provenance:

```text
Raw Broker Execution
Broker Statement / Cash Event
Security Identity
Corporate Action Lineage
Fee Schedule Version
FX Source + Timestamp
Account / Broker Entity
Tax Year
Tax Rule Version when applicable
Manual Adjustment Evidence when applicable
```

‏כל מספר בדוח צריך לאפשר drill-down:

```text
Annual / Period Summary
→ Day
→ Trade
→ Order
→ Execution
→ Raw Broker Event
```

---

## ‏14. Reconciliation Policy

### ‏Daily

```text
Cash
Positions
Executions
Fees
CorporateActions
```

### ‏Month-End

‏השוואה מול statement רשמי וחקירת divergences.

### ‏Year-End / Reporting Readiness

‏אין להפיק export “סופי” אם קיימים differences מהותיים לא מוסברים, missing basis או unresolved identity.

‏`UNRESOLVED` עדיף על מספר מומצא.

---

## ‏15. Tests

### ‏Unit

- ‏Partial fills.
- ‏Multi-lot closes.
- ‏Commission/fee allocation.
- ‏FX translation.
- ‏Dividend/withholding events.
- ‏Split / reverse split.
- ‏Corporate-action basis adjustment.
- ‏Short close + borrow fee.
- ‏Correction/Bust.
- ‏Rounding/precision.

### ‏Contract

- ‏כל Broker fee code ממופה או מסומן `UNKNOWN_FEE_CODE`.
- ‏Parser schema drift מזוהה.
- ‏Import חוזר הוא idempotent.
- ‏Execution IDs אינם מוכפלים.

### ‏Golden Reconciliation

‏ניקח statement קצר ידוע ונדרוש:

```text
InternalCash == BrokerCash within defined tolerance
InternalPositions == BrokerPositions
Executions match
Fees match or have explained variance
```

### ‏Research

- ‏Cost stress `Base / +25% / +50% / 2x`.
- ‏Historical fee schedules כאשר אפשר.
- ‏Edge retention לפי regimes.
- ‏Cost-tail analysis, לא רק average.

---

## ‏16. Promotion Criteria

‏Accounting/Cost layer מתקדם שלב רק אם:

1. ‏כל execution מיוצג פעם אחת בלבד.
2. ‏Fees מפורקים או מסומנים unknown במפורש.
3. ‏Cash ו־positions מתיישבים מול Broker בתוך tolerance מוגדר.
4. ‏Corrections נשמרים כאירועים ולא מוחקים history.
5. ‏Ledger ניתן ל־deterministic rebuild.
6. ‏FX metadata נשמר במפורש.
7. ‏Security identity אינה תלויה רק ב־ticker.
8. ‏Corporate actions משוחזרים נכון.
9. ‏Economic PnL אינו תלוי ב־tax-lot choice.
10. ‏Historical cost schedules מגרוסים.
11. ‏Unknown accounting states אינם מומרים לאפס.
12. ‏Manual adjustments כוללים audit trail.
13. ‏Tax projection, אם קיים, reproducible לפי rule version.
14. ‏Reports מאפשרים drill-down ל־raw evidence.

---

## ‏17. Rejection Criteria

‏נדחה implementation אם:

- ‏Broker statement וה־internal ledger לא מתיישבים בלי הסבר.
- ‏אותו Fill יכול להופיע פעמיים.
- ‏parser update משנה history בלי versioning.
- ‏cost basis חסר ומוחלף באפס.
- ‏Tax logic משנה Signal research metrics.
- ‏current fee schedule משמש אוטומטית לכל ההיסטוריה.
- ‏fixed costs ו־variable costs נספרים פעמיים.
- ‏withholding מוצג כ־final tax due.
- ‏FX PnL ו־security PnL מעורבבים.
- ‏reporting depends on manual spreadsheet edits without lineage.
- ‏tax rule או fee rate hard-coded ללא effective dates.

---

## ‏18. Failure Modes

- ‏`GrossPnL` מוצג כאילו הוא Net.
- ‏Commission נגרעת פעמיים.
- ‏Entry cost נמדד אך Exit cost לא.
- ‏Fee schedule outdated.
- ‏Regulatory fee changes but config does not.
- ‏Average cost מסתיר p95/p99 tail cost.
- ‏FX move מיוחס ל־Strategy.
- ‏Broker corrections נדרסות.
- ‏Partial fills מאוגדים בלי raw traceability.
- ‏Corporate action משבש basis.
- ‏Transfer בין brokers מאבד acquisition/basis metadata.
- ‏Unknown fee code נזרק.
- ‏Year-end report כולל unresolved lots.
- ‏Tax rule change מחושב רטרואקטיבית על שנים ישנות בלי versioning.
- ‏Manual adjustment ללא evidence.
- ‏Sensitive financial data נשמר בלי access/retention controls.

---

## ‏19. User-Specific Application

‏למחקר `Short-Horizon Momentum` שלנו, העלויות החשובות ביותר להחלטת Candidate נשארות בראש ובראשונה:

```text
spread
entry/exit slippage
commission/minimum commission
regulatory/pass-through fees
impact
adverse selection
FX execution cost if capital currency differs
borrow cost when short research is evaluated
```

‏בגלל שה־Edge המבוקש קצר, נמדוד גם:

```text
EdgeConsumption
EdgeRetention
CostHeadroom
p95/p99 All-In Cost
```

‏ה־Ledger יישמר לכל Candidate שבפועל הפך ל־Execution, ואילו counterfactual missed opportunities יישמרו במחקר נפרד — לא בתוך Accounting PnL.

‏Tax נשאר מחוץ ל־hot path. אם בעתיד נרצה `AfterTaxScenario`, הוא ירוץ על אותה אמת חשבונאית מגרוסת ולא ישנה את signal generation.

---

## ‏20. Fact / Judgment / Hypothesis

### ‏Fact

- ‏Gross PnL ו־Net PnL אינם זהים כאשר קיימות עלויות.
- ‏Broker statements, executions ו־cash/position state יכולים לעבור corrections/revisions ולכן lineage ו־reconciliation נדרשים.
- ‏Withholding אינו בהכרח final tax liability.
- ‏Tax treatment תלוי jurisdiction/taxpayer/account/instrument/year.
- ‏Fee schedules יכולים להשתנות בזמן.

### ‏Judgment

- ‏`EconomicPnL`, ‏`AccountingPnL` ו־`TaxablePnL` צריכים להיות models נפרדים.
- ‏Immutable event ledger + derived projections הוא ה־baseline המועדף.
- ‏Tax-lot-ready schema צריך להיבנות מוקדם גם אם Tax Engine מלא נדחה.
- ‏Unknown accounting data צריך fail closed for reporting, לא להיות filled with zero.

### ‏Hypothesis

- ‏p95/p99 execution cost עשוי להסביר חלק משמעותי יותר מכישלון short-horizon candidates מאשר average cost.
- ‏Cost headroom נמוך עשוי לזהות מראש strategies שאינן robust לשינויי fees/slippage.
- ‏Versioned fee reconciliation עשוי לחשוף “strategy drift” שהוא למעשה cost/config drift.

---

## ‏21. Confidence

### ‏High

- ‏הפרדת Economic/Accounting/Tax truths.
- ‏Immutable ledger.
- ‏Broker reconciliation.
- ‏Versioned fee schedules.
- ‏Stable IDs / idempotent imports.
- ‏Missing != Zero.
- ‏Tax rules מחוץ ל־Strategy hot path.

### ‏Medium

- ‏Double-entry-inspired internal design בלי מערכת הנהלת חשבונות מלאה.
- ‏Early tax-lot-ready schema breadth.
- ‏Allocation policy ל־fixed operating costs.

### ‏Low / Must Be Verified Per Case

- ‏שיעור מס ספציפי.
- ‏Tax-lot method אישי.
- ‏Loss carryforward treatment.
- ‏Foreign-tax-credit treatment.
- ‏Business-vs-capital-income classification.
- ‏Broker withholding behavior.
- ‏Year-end recognition rule.

---

## ‏22. Time-Sensitive Facts — Verified 2026-10-27

‏הפרטים הבאים הם examples/configuration inputs בלבד, לא Constants של Strategy:

- ‏`SEC Section 31`: ה־SEC מציג כרגע את advisory ל־FY2026 שלפיו החל מ־4 באפריל 2026 שיעור העסקאות המכוסות הוא `$20.60 per $1,000,000` של covered sales, עד advisory עתידי.
- ‏`IRS Publication 550 (2025)`: דוגמת ה־Wash Sale האמריקאית משתמשת בכלל של רכישת substantially identical securities בתוך 30 יום לפני/אחרי sale at loss; אין להשליך אותו על תושב/jurisdiction אחר ללא בדיקה.
- ‏רשות המסים בישראל: דוח 2025 מפנה ל־`1322` ול־`1325` עבור רווחי הון מניירות ערך סחירים; הטיפול המדויק תלוי classification האישי ושנת המס.
- ‏רשות המסים בישראל: שירותי `746`/`747` עוסקים בקביעת עלות נייר ערך נסחר לצורך ניכוי מס במקור במקרים המתאימים.

‏לכל Rule/Fee כזה נשמור:

```text
EffectiveFrom
EffectiveTo
Jurisdiction
Applicability
SourceReference
VerifiedAt
RuleSetVersion
```

‏לפני כל שימוש מעשי נדרש אימות מחדש מול המקור הרשמי והגורם המקצועי הרלוונטי.

---

## ‏23. Security / Privacy

‏Statements, tax documents ו־accounting exports הם Financial Data רגיש.

‏Baseline:

- ‏least-privilege access.
- ‏encryption at rest/in transit כאשר רלוונטי.
- ‏retention policy מפורשת.
- ‏אין credentials/API secrets בתוך exports.
- ‏audit trail ל־manual corrections.
- ‏exports לא כוללים secrets שאינם דרושים לדיווח.

---

## ‏24. Recommended MVP

```text
1. Reuse the segment-18 Cost Engine.
2. Store immutable executions with stable IDs.
3. Store explicit fee breakdown and fee currency.
4. Maintain separate cash and position projections.
5. Reconcile daily against broker truth.
6. Preserve raw broker events/statements.
7. Store FX metadata and keep security-vs-FX PnL separate.
8. Make the schema tax-lot-ready.
9. Version fee schedules and parsers.
10. Keep tax projection outside the strategy core.
11. Mark missing accounting data as unresolved, never zero.
12. Add golden reconciliation tests before any tax/report automation.
```

---

## ‏25. Final Recommendation

‏ברירת המחדל עבור הפרויקט היא:

```text
Market / Execution Economics
→ Expected Pre-Tax Net Edge
→ Research Trade Decision
→ Immutable Execution Ledger
→ Cash / Position Projection
→ Broker Reconciliation
→ Economic PnL Attribution
→ Accounting Projection
→ Optional Versioned Tax Projection
→ Auditable Reports
```

‏הכלל המכריע:

> ‏**Costs קובעים אם ה־Edge באמת קיים; Ledger קובע מה באמת קרה; Tax Rules קובעים איך מדווחים את מה שקרה. שלוש השכבות חייבות להיות מקושרות, אך לעולם לא מעורבבות למספר או למנוע אחד.**
