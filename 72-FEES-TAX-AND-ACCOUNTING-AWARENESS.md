# ‏שלב 72 — `Fees, Tax and Accounting Awareness`: להבין את כלכלת העסקה ואת מה שחייבים לתעד

> ‏מטרת הפרק: להבין את שכבת העמלות, המס והחשבונאות סביב Algo Trading בלי לערבב בין שלושה דברים שונים: `Trading Economics`, ‏`Tax Treatment` ו־`Accounting / Recordkeeping`. נלמד למדוד עלות אמיתית לעסקה, לשמור Ledger שניתן לשחזור, להבין Tax Lots, realized/unrealized PnL, FX, withholding, regulatory fees ו־loss carryforwards, ולדעת אילו פרטים חייבים להישאר configurable ותלויי jurisdiction.
>
> ‏העיקרון המרכזי: **מערכת יכולה להיות רווחית לפני עלויות ולהפסיד אחריהן; והיא יכולה להיות כלכלית נכונה אך מדווחת חשבונאית בצורה שגויה. לכן חייבים להפריד בין Execution Economics, Ledger Truth ו־Tax Reporting.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו ייעוץ מס, משפטי, השקעות או חשבונאות. שיעורי מס, כללי קיזוז, withholding, עמלות Broker וכללי דיווח משתנים לפי מדינה, תושבות, סוג חשבון, Broker, סוג נייר ושנת מס; לפני שימוש מעשי יש לאמת מול רשות המסים/יועץ מוסמך וה־Broker הרלוונטי.

---

# ‏1. שלוש שכבות שחייבים להפריד

```text
Trading Economics
→ האם העסקה צפויה להיות כדאית נטו?

Accounting / Ledger
→ מה באמת קרה בחשבון?

Tax Treatment
→ איך החוק מסווג וממסה את מה שקרה?
```

‏שלוש השכבות קשורות, אבל אינן זהות.

---

# ‏2. `Gross PnL` אינו `Net PnL`

```text
GrossPnL = ExitValue - EntryValue
```

‏אבל בפועל:

```text
NetPnL = GrossPnL
         - Commissions
         - ExchangeAndRegulatoryFees
         - SpreadCost
         - Slippage
         - MarketImpact
         - BorrowCost
         - FXCost
         - OtherExecutionCosts
```

‏במערכת קצרה מאוד, ההפרש הזה יכול להיות כל ה־Edge.

---

# ‏3. `Tax` אינו פשוט עוד שורת Slippage

‏מס תלוי ב:

- ‏תושבות.
- ‏סוג חשבון.
- ‏סוג נייר.
- ‏סוג הכנסה.
- ‏האם מדובר ברווח הון או פעילות עסקית.
- ‏Tax lots.
- ‏קיזוז הפסדים.
- ‏Withholding.
- ‏שנת מס.
- ‏אמנות מס.
- ‏כללים מקומיים מיוחדים.

‏לכן אסור להכניס שיעור מס קשיח לתוך `Execution Cost Model` כאילו הוא microstructure cost.

---

# ‏4. מה כן צריך להיכנס ל־Decision Engine

‏לפני Entry, מנוע ההחלטה צריך לפחות לאמוד:

```text
ExpectedGrossEdge
- ExpectedSpreadCost
- ExpectedSlippage
- ExpectedCommission
- ExpectedRegulatoryFees
- ExpectedImpact
- ExpectedBorrowCostIfRelevant
- ExpectedFXExecutionCostIfRelevant
= ExpectedPreTaxNetEdge
```

‏זהו המדד הכלכלי המרכזי להחלטת Trade.

---

# ‏5. למה `Pre-Tax` הוא baseline טוב למחקר Strategy

‏Strategy צריכה להיבחן קודם כל על economics שנובעים מהשוק והביצוע.

‏מס הוא שכבה חיצונית שתלויה במשתמש ובחשבון.

‏אם מערבבים אותו מוקדם מדי, קשה לדעת האם ה־Edge עצמו טוב או שהשיפור נובע ממבנה מס מסוים.

---

# ‏6. אבל After-Tax כן חשוב לתכנון הון

‏לצורך:

- ‏Cash planning.
- ‏Capital allocation.
- ‏Withdrawal planning.
- ‏Tax reserve.
- ‏Year-end planning.

‏אפשר להוסיף `AfterTaxScenario`, אבל לא במקום `PreTax Economics`.

---

# ‏7. Cost Taxonomy מקצועי

```text
Explicit Costs
Implicit Costs
Financing Costs
Regulatory Costs
Tax Costs
Operational Costs
Opportunity Costs
```

---

# ‏8. `Explicit Costs`

‏דוגמאות:

- ‏Broker commission.
- ‏Exchange/venue fee.
- ‏Clearing fee.
- ‏Regulatory transaction fee.
- ‏Borrow fee.
- ‏Subscription/data fee כאשר מייחסים אותה לפעילות.

---

# ‏9. `Implicit Costs`

‏דוגמאות:

- ‏Spread crossing.
- ‏Slippage.
- ‏Price impact.
- ‏Adverse selection.
- ‏Delay cost.
- ‏Missed opportunity.

---

# ‏10. אל תבלבל Commission עם Cost

‏`Zero Commission` אינו אומר `Zero Cost`.

‏עסקה יכולה להיות ללא עמלת Broker ועדיין להיות יקרה בגלל Spread, Slippage ו־Impact.

---

# ‏11. `All-In Execution Cost`

```text
AllInExecutionCost =
    Commission
  + RegulatoryFees
  + VenueFees
  + SpreadCost
  + Slippage
  + Impact
  + BorrowCost
  + FXExecutionCost
```

---

# ‏12. `Round-Trip Cost`

‏לרובוט קצר צריך למדוד את כל הסיבוב:

```text
EntryCost + ExitCost
```

‏ולא רק Entry.

---

# ‏13. Exit לעיתים יקר יותר

‏כאשר צריך לצאת מהר:

- ‏spread יכול להיות רחב יותר.
- ‏liquidity יכולה להיעלם.
- ‏ה־order יכול להיות aggressive יותר.
- ‏adverse selection כבר פועל נגדנו.

---

# ‏14. `Cost Per Share`

‏מדד שימושי:

```text
CostPerShare = TotalExecutionCost / FilledQuantity
```

---

# ‏15. `Cost In Bps`

```text
CostBps = Cost / TradedNotional * 10,000
```

‏מאפשר השוואה בין מניות ומחירים שונים.

---

# ‏16. `Cost As % Of Gross Edge`

```text
EdgeConsumption = TotalExpectedCosts / ExpectedGrossEdge
```

‏אם העלויות צורכות כמעט את כל ה־Edge, Signal טוב סטטיסטית אינו Trade טוב.

---

# ‏17. `Edge Retention`

```text
EdgeRetention = NetCapturedEdge / GrossPredictedEdge
```

‏זה אחד המדדים החשובים ביותר לחיבור Research ל־Live.

---

# ‏18. מינימום עמלה משנה אסטרטגיה קטנה

‏בחשבון קטן, `minimum commission` יכול להיות חשוב יותר מאחוז העמלה.

‏לכן תמיד למדל את נוסחת העמלה האמיתית.

---

# ‏19. Tiered vs Fixed Pricing

‏Broker יכול להציע מבני תמחור שונים.

‏אל תניח שמודל אחד עדיף תמיד.

‏צריך להריץ את אותה היסטוריית trades דרך כמה Cost Models.

---

# ‏20. Fees לפי Venue

‏Venue מסוים עשוי לגבות או להחזיר liquidity fee/rebate.

‏המשמעות תלויה ב:

- ‏Maker/Taker.
- ‏Routing.
- ‏Order type.
- ‏Execution venue.
- ‏Broker pass-through policy.

---

# ‏21. Rebate אינו Edge בפני עצמו

‏Rebate קטן יכול להיות מלווה ב־adverse selection גדול יותר.

‏תמיד למדוד:

```text
Rebate - AdverseSelection - OpportunityCost
```

---

# ‏22. Regulatory Fees משתנים

‏עמלות רגולטוריות אינן קבועות לנצח.

‏לכן:

```text
RegulatoryFeeSchedule
```

‏צריך להיות versioned/configurable.

---

# ‏23. דוגמה עדכנית — `SEC Section 31`

‏נכון ל־26 באוקטובר 2026, ה־SEC פרסם כי החל מ־4 באפריל 2026 שיעור `Section 31` לרוב עסקאות המכירה המכוסות הוא:

```text
$20.60 per $1,000,000 of covered sales
```

‏ה־SEC מציין שהשיעור יכול להשתנות ולכן אסור לקודד אותו כקבוע נצחי.

---

# ‏24. `FINRA TAF`

‏גם `Trading Activity Fee` של FINRA הוא Fee Schedule חיצוני שיכול להשתנות.

‏המערכת צריכה לדעת:

```text
EffectiveFrom
EffectiveTo
InstrumentType
Rate
Cap
SourceVersion
```

---

# ‏25. Broker Markup

‏Broker יכול להעביר fee רגולטורי בדיוק, לעגל, לצבור או להציגו בצורה אחרת בדוח.

‏Ledger חייב לשמור גם:

```text
BrokerReportedFee
InternalExpectedFee
Difference
```

---

# ‏26. `Fee Reconciliation`

‏אחת לתקופה:

```text
ExpectedFees vs BrokerStatementFees
```

‏ולחקור divergence.

---

# ‏27. Slippage צריך Benchmark

‏Slippage ללא Reference Price הוא מספר חסר משמעות.

‏אפשר למדוד מול:

- ‏Decision Mid.
- ‏Arrival Mid.
- ‏Best Bid/Ask.
- ‏Submit-time quote.
- ‏VWAP benchmark.

---

# ‏28. `Implementation Shortfall`

‏רעיון מרכזי:

```text
DecisionPrice → ActualExecution
```

‏הפער כולל latency, spread, market movement ו־execution choice.

---

# ‏29. Spread Cost אינו תמיד Half Spread

‏אם Entry/Exit passive או מקבלים price improvement, העלות בפועל שונה.

‏לכן `HalfSpread` הוא approximation בלבד.

---

# ‏30. Opportunity Cost

‏אם לא התמלאנו והמניה עלתה בלעדינו, יש Cost כלכלי גם ללא fee.

---

# ‏31. Missed Opportunity צריך להישמר בנפרד

‏לא לערבב:

```text
ExecutedTradePnL
```

‏עם:

```text
CounterfactualMissedOpportunity
```

---

# ‏32. FX הוא שכבה אמיתית

‏אם הון בסיסי הוא NIS והמסחר USD, יש לפחות:

- ‏FX conversion spread.
- ‏FX commission.
- ‏Currency PnL.
- ‏Translation לצורכי reporting.

---

# ‏33. Trading PnL מול Currency PnL

‏חשוב להפריד:

```text
SecurityPnLUSD
FXPnLBaseCurrency
```

‏אחרת אי אפשר לדעת האם Strategy הצליחה או שהמטבע זז.

---

# ‏34. Base Currency

‏Ledger צריך להגדיר:

```text
InstrumentCurrency
AccountCurrency
ReportingCurrency
TaxReportingCurrency
```

---

# ‏35. FX Timestamp

‏המרה לצורך accounting חייבת להגדיר איזה שער ובאיזה timestamp שימש.

---

# ‏36. `Realized PnL`

‏PnL שנוצר ממכירה/סגירה בפועל.

---

# ‏37. `Unrealized PnL`

‏PnL תיאורטי של Position פתוח לפי mark שנבחר.

---

# ‏38. Mark Price חייב להיות מוגדר

‏אפשרויות:

- ‏Last.
- ‏Mid.
- ‏Bid liquidation mark.
- ‏Broker mark.

‏לכל אחד משמעות אחרת.

---

# ‏39. Unrealized PnL אינו Cash

‏אסור להשתמש בו כאילו מומש.

---

# ‏40. `Tax Lot`

‏Tax Lot הוא יחידת רכישה עם:

```text
SecurityIdentity
AcquisitionDate
Quantity
CostBasis
Currency
Adjustments
```

---

# ‏41. למה Tax Lots חשובים גם לאלגו קצר

‏אם קונים/מוכרים אותו Symbol פעמים רבות, צריך לדעת אילו lots נסגרו ואיך חושב gain/loss.

---

# ‏42. FIFO אינו חוק אוניברסלי

‏שיטת lot selection תלויה jurisdiction/Broker/rules.

‏אל תניח `FIFO` בלי אימות.

---

# ‏43. Broker PnL יכול להיות שונה מ־Tax PnL

‏הבדלים יכולים לנבוע מ:

- ‏Tax lot method.
- ‏Corporate actions.
- ‏FX translation.
- ‏Wash-sale-like adjustments.
- ‏Withholding.
- ‏Rounding.

---

# ‏44. Cost Basis חייב להיות reproducible

‏לעולם אל תשמור רק final number.

‏שמור:

```text
OriginalCost
FeesCapitalizedIfApplicable
CorporateActionAdjustments
TaxAdjustments
FinalBasis
```

---

# ‏45. Corporate Actions משנים Basis

‏Splits, spin-offs, mergers ו־distributions יכולים לשנות cost basis.

---

# ‏46. Symbol אינו Security Identity

‏Accounting צריך לעבוד עם Stable Security Identity.

---

# ‏47. `Trade Date` מול `Settlement Date`

‏אלה שני timestamps שונים עם שימושים שונים.

---

# ‏48. Revenue Recognition / Tax Recognition אינם בהכרח Settlement

‏לפי jurisdiction, gain יכול להיות מיוחס ל־trade date או לפי כלל אחר.

‏אסור להסיק מה־cash movement בלבד.

---

# ‏49. `Cash Ledger`

‏צריך לשמור תנועות:

```text
TradeSettlement
Commission
Fee
Dividend
Withholding
BorrowFee
Interest
FXConversion
Deposit
Withdrawal
CorporateActionCash
```

---

# ‏50. `Position Ledger`

‏בנפרד מ־Cash Ledger.

---

# ‏51. `Execution Ledger`

‏בנפרד מ־Position Ledger.

‏Execution הוא Event; Position הוא State נגזר.

---

# ‏52. `Tax Ledger`

‏שכבה נפרדת שמתרגמת executions/lots לפי כללי jurisdiction.

---

# ‏53. למה separation חשוב

‏אם Tax Logic מוטמעת בתוך Execution Engine, כל שינוי מס מסכן את ה־Trading Core.

---

# ‏54. Source of Truth

```text
Broker Executions
+ Broker Cash/Position Statements
+ Internal Immutable Event Log
```

‏צריך reconciliation ביניהם.

---

# ‏55. Broker Statement אינו תמיד מספיק למחקר

‏הוא יכול לא לכלול:

- ‏Decision context.
- ‏Arrival quote.
- ‏Signal state.
- ‏Expected cost.
- ‏Candidate rank.

---

# ‏56. Internal Ledger אינו מספיק לחשבונות

‏אם הוא diverged מה־Broker, Broker/clearing truth דורש reconciliation.

---

# ‏57. `Double-Entry` thinking

‏גם אם לא בונים מערכת הנהלת חשבונות מלאה, כדאי לחשוב כך:

‏כל שינוי חייב להשפיע באופן עקבי על לפחות שני צדדים של state.

---

# ‏58. Invariant בסיסי

```text
StartingCash
+ CashMovements
+ RealizedFlows
= EndingCash
```

‏עם התאמות מוגדרות.

---

# ‏59. Position Invariant

```text
OpeningQty
+ BoughtQty
- SoldQty
+ CorporateActionQtyAdjustments
= ClosingQty
```

---

# ‏60. Fee Invariant

‏כל Broker fee צריך להיות משויך ל־event/period/source.

---

# ‏61. Immutable Execution IDs

‏Fill חייב לקבל Stable ID.

---

# ‏62. Duplicate Broker Events

‏Reconciliation חייב להיות idempotent.

---

# ‏63. Corrections/Busts

‏אם Broker מתקן Trade, אין למחוק היסטוריה.

```text
OriginalExecution
CorrectionEvent
EffectiveExecution
```

---

# ‏64. `As-Traded` מול `As-Reported`

‏שמור את שניהם.

---

# ‏65. Dividends

‏Dividend הוא Cash Flow נפרד מ־Trading PnL.

---

# ‏66. Withholding Tax

‏עם Dividend או income אחר יכול להיות withholding במקור.

‏זה אינו בהכרח final tax liability.

---

# ‏67. `Withheld != TaxDue`

‏ניכוי במקור הוא payment/credit mechanism, לא בהכרח המס הסופי.

---

# ‏68. Foreign Tax Credit

‏בחלק מה־jurisdictions ייתכן credit על מס זר, בכפוף לכללים.

‏זהו Tax-layer concern, לא Signal concern.

---

# ‏69. Short Borrow Fees

‏Short accounting צריך לכלול Borrow Fees בנפרד.

---

# ‏70. Payments In Lieu Of Dividends

‏Short position עשוי ליצור תשלומים מיוחדים סביב dividends.

‏הטיפול המסי תלוי jurisdiction.

---

# ‏71. Interest

‏Margin interest / credit interest צריכים להישמר בנפרד מ־Trade PnL.

---

# ‏72. Period Cost מול Per-Trade Cost

‏לא כל עלות מתאימה להקצאה לכל Trade.

‏לדוגמה:

- ‏monthly market-data subscription.
- ‏server cost.
- ‏software subscription.

---

# ‏73. `Variable Cost` מול `Fixed Cost`

```text
VariableCost
FixedOperatingCost
```

‏אל תערבב ביניהם ב־per-trade edge.

---

# ‏74. אבל Fixed Cost כן חשוב ל־Business Economics

‏Strategy יכולה להיות profitable per trade אבל לא לכסות operating costs.

---

# ‏75. `Contribution Margin`

```text
TradingNetBeforeFixedCosts
- AllocatedOperatingCosts
```

---

# ‏76. Turnover

‏אסטרטגיה קצרה יכולה לייצר turnover עצום.

‏לכן אפילו fee קטן מאוד מצטבר.

---

# ‏77. `Cost × Frequency`

‏אל תסתכל רק על cost ל־Trade.

```text
DailyCost = AvgCostPerTrade * NumberOfTrades
```

---

# ‏78. Tax Turnover Awareness

‏High turnover יכול ליצור הרבה realized events ויותר complexity חשבונאית.

---

# ‏79. Loss Carryforward

‏במסגרות מס רבות הפסדי הון שלא נוצלו יכולים לעבור לשנים אחרות בכפוף לכללים.

‏Ledger צריך לשמור enough evidence ולא להסתמך על מספר ידני יחיד.

---

# ‏80. Current-Year Loss vs Carryforward Loss

‏אלה categories שונות מבחינת reporting.

---

# ‏81. Loss Harvesting אינו Strategy Baseline

‏אל תשנה Signal רק כדי “לייצר מס” בלי מודל כלכלי כולל.

---

# ‏82. `Wash Sale` אינו כלל עולמי

‏בארה״ב, עבור taxpayers שהכלל חל עליהם, IRS Publication 550 מתאר disallowance של loss כאשר נרכשים substantially identical securities בתוך חלון של 30 ימים לפני או אחרי sale at loss.

‏אין להשליך את הכלל אוטומטית על תושב מדינה אחרת.

---

# ‏83. Tax Residency קודמת ל־Broker Location

‏העובדה שה־Broker אמריקאי אינה אומרת שה־Tax Rules האישיים הם כללי מס אמריקאיים.

---

# ‏84. Broker Entity matters

‏גם בתוך אותו brand, legal entity יכולה להשפיע על:

- ‏statements.
- ‏withholding.
- ‏reporting.
- ‏account rules.

---

# ‏85. Israel — awareness snapshot

‏בטפסי רשות המסים לשנת המס 2025, שפורסמו ב־2026, מופיעים בין היתר שיעורים של `25%` על רווח הון ריאלי מניירות ערך סחירים ליחיד ו־`30%` לבעל מניות מהותי, לצד שיעורים אחרים במקרים מיוחדים.

‏זהו snapshot לימודי בלבד; classification אישי יכול לשנות את התוצאה.

---

# ‏86. Business Income Classification

‏במדינות מסוימות פעילות אינטנסיבית עשויה בנסיבות מסוימות להיות מסווגת אחרת מרווח הון פסיבי.

‏זו שאלה מקצועית/משפטית — לא rule שה־bot צריך לנחש.

---

# ‏87. Israel — reporting forms

‏רשות המסים משתמשת בין היתר ב:

```text
Form 1322
Form 1325
```

‏לדיווח על רווחי הון מניירות ערך סחירים במסגרת הדוח השנתי.

---

# ‏88. עסקאות ללא ניכוי מס במקור

‏הטפסים הרשמיים מבחינים בין עסקאות שבהן נוכה מס במקור לבין עסקאות שבהן לא נוכה מס במקור.

‏זו סיבה נוספת לשמור Broker/withholding metadata בצורה מסודרת.

---

# ‏89. Foreign Broker אינו “Tax Automation”

‏אל תניח שה־Broker יחשב, ינכה או ידווח לרשות המקומית בדיוק כפי שנדרש ממך.

---

# ‏90. `Tax Responsibility Boundary`

‏המערכת צריכה לדעת:

```text
BrokerCalculated
BrokerWithheld
InternalCalculated
TaxAdvisorAdjusted
FiledAmount
```

---

# ‏91. Reconciliation Tax Layer

```text
InternalTaxLedger
vs BrokerTaxDocuments
vs FiledReturn
```

---

# ‏92. Tax Document Versioning

‏שמור את שנת המס ואת גרסת הכללים שעל פיהם בוצע החישוב.

---

# ‏93. `TaxRuleVersion`

‏דוגמה:

```text
Jurisdiction = IL
TaxYear = 2026
RuleSetVersion = ...
```

---

# ‏94. Never Rewrite Historical Tax Logic Silently

‏אם כלל השתנה, אל תחשב מחדש שנים ישנות לפי כלל חדש בלי versioning.

---

# ‏95. Fiscal Year Boundary

‏Year-end הוא boundary חשבונאי חשוב.

‏צריך לדעת אילו trades שייכים לאיזו שנה לפי הכלל הרלוונטי.

---

# ‏96. Trade Date / Settlement Date around Year-End

‏אל תנחש איזה מהם קובע לצורכי מס.

---

# ‏97. Partial Fills

‏Fill אחד גדול יכול להתפצל לעשרות executions.

‏Accounting צריך aggregate בלי לאבד traceability.

---

# ‏98. Execution Group

```text
OrderId
ExecutionId
TradeGroupId
TaxLotId
```

‏אלה IDs שונים.

---

# ‏99. Average Price

‏Average fill price שימושי ל־trading view, אבל לצורכי accounting צריך לשמור את ה־fills המקוריים.

---

# ‏100. Rounding

‏Rounding של:

- ‏quantity.
- ‏price.
- ‏fee.
- ‏FX.
- ‏tax.

‏יכול ליצור divergence קטן שמצטבר.

---

# ‏101. Decimal Precision

‏כסף ו־quantity דורשים precision מפורש.

‏אל תשתמש ב־binary floating point ללא הצדקה.

---

# ‏102. Fee Currency

‏Fee יכול להיות מחויב במטבע אחר מה־instrument.

---

# ‏103. `FeeCurrency`

‏שמור אותו במפורש.

---

# ‏104. Tax-Lot Currency

‏Cost basis יכול לדרוש conversion למטבע הדיווח.

---

# ‏105. FX Source Versioning

‏לצורך reporting, שמור:

```text
FxRate
FxSource
FxTimestamp
FxRule
```

---

# ‏106. Corporate Action Ledger

‏כל adjustment צריך Event עצמאי.

---

# ‏107. Split Example

‏Split משנה quantity ו־per-share basis, אבל לא אמור ליצור Trading PnL מעצמו.

---

# ‏108. Dividend Example

‏Dividend מייצר Cash Flow, לא price alpha.

---

# ‏109. Return of Capital

‏Distribution יכולה להשפיע על cost basis לפי jurisdiction.

---

# ‏110. Merger / Spin-Off

‏Security identity ו־basis allocation יכולים להשתנות.

---

# ‏111. Tax Data Quality

‏Tax data צריך Quality State משלו:

```text
KNOWN
INFERRED
MISSING
DISPUTED
```

---

# ‏112. Missing Basis הוא High Severity

‏לא “ממלאים אפס” כאשר cost basis חסר.

---

# ‏113. `Missing != Zero`

‏אותו עיקרון שלמדנו ב־Market Data נכון גם ל־Accounting.

---

# ‏114. Tax-Lot Reconstruction

‏אם נתונים חסרים, צריך reconstruct עם Evidence chain.

---

# ‏115. Evidence Chain

```text
BrokerStatement
ExecutionReport
TransferStatement
CorporateActionNotice
FXSource
ManualAdjustmentWithReason
```

---

# ‏116. Manual Adjustment חייב Audit Trail

```text
Who
When
Why
OldValue
NewValue
Evidence
```

---

# ‏117. Never Edit Ledger History In Place

‏הוסף correction event.

---

# ‏118. Reproducibility

‏אותו raw ledger + אותה rule version צריכים להפיק אותו report.

---

# ‏119. Deterministic Tax Report Generation

‏אם החישוב אינו deterministic, reconciliation יהפוך לסיוט.

---

# ‏120. Accounting Tests

‏צריך unit tests ל:

- ‏partial fills.
- ‏multi-lot closes.
- ‏split.
- ‏dividend.
- ‏fee allocation.
- ‏FX.
- ‏correction.
- ‏short close.

---

# ‏121. Golden Statements

‏קח תקופה קצרה מה־Broker ובנה golden reconciliation.

---

# ‏122. Daily Reconciliation

‏השווה:

```text
Cash
Positions
Executions
Fees
CorporateActions
```

---

# ‏123. Month-End Reconciliation

‏בדיקה רחבה יותר מול statement רשמי.

---

# ‏124. Year-End Reconciliation

‏לפני דיווח מס, ודא שכל השנה נסגרת ללא unexplained differences.

---

# ‏125. `Unexplained Difference` הוא Error

‏אל תעגל divergence גדול ל־“probably fine”.

---

# ‏126. Tolerance חייב להיות מוגדר

‏למשל precision/rounding tolerance בלבד.

---

# ‏127. PnL Attribution

‏פצל:

```text
SignalPnL
SpreadCost
SlippageCost
CommissionCost
RegulatoryFeeCost
BorrowCost
FXPnL
Other
```

---

# ‏128. Tax Attribution בנפרד

```text
TaxableGain
TaxableLoss
Withholding
Carryforward
Credits
Adjustments
```

---

# ‏129. Avoid Double Counting

‏אם commission כבר נכללה ב־execution net PnL, אל תפחית אותה שוב ב־accounting summary.

---

# ‏130. `Economic PnL` מול `Accounting PnL`

‏Economic PnL יכול למדוד opportunity/slippage.

‏Accounting PnL חייב להתבסס על transactions אמיתיים.

---

# ‏131. `Accounting PnL` מול `Taxable PnL`

‏גם אלה אינם תמיד זהים.

---

# ‏132. Three-PnL Model

```text
EconomicPnL
AccountingPnL
TaxablePnL
```

‏שמירה על שלושתם מונעת בלבול.

---

# ‏133. Daily Strategy Review משתמש בעיקר ב־Economic PnL

‏כי מטרתו להבין Edge וביצוע.

---

# ‏134. Financial Reconciliation משתמש ב־Accounting PnL

---

# ‏135. Tax Filing משתמש ב־Taxable PnL

---

# ‏136. `NetEdge` לא צריך להשתנות בגלל Tax Lot Choice

‏אם שינוי lot method משנה את ה־Signal research metric, ערבבנו שכבות לא נכון.

---

# ‏137. Fee Schedule Effective Dates

‏כל fee schedule צריך:

```text
EffectiveFrom
EffectiveTo
Source
Version
```

---

# ‏138. Backtest עם Historical Fees

‏אם בודקים שנים ישנות, עדיף להשתמש fee schedule היסטורי ולא fee של היום.

---

# ‏139. Historical Tax Rules

‏אותו עיקרון למס אם עושים after-tax historical analysis.

---

# ‏140. Stress Test Costs

‏בדוק:

```text
BaseCost
+25%
+50%
2x
```

‏כדי להבין Margin of Safety.

---

# ‏141. Break-Even Cost

```text
BreakEvenCost = GrossEdge
```

‏או בצורה מפורטת יותר, כמה cost נוסף יכול להופיע לפני שה־Edge נעלם.

---

# ‏142. Cost Headroom

```text
CostHeadroom = ExpectedGrossEdge - ExpectedCosts
```

---

# ‏143. Thin Edge = Fragile Edge

‏אם headroom קטן, כל שינוי fee/latency/spread יכול למחוק אותו.

---

# ‏144. Fee Drift Monitoring

‏עקוב אחר:

- ‏Avg commission/share.
- ‏Regulatory fees/share.
- ‏Spread bps.
- ‏Slippage bps.
- ‏All-in cost bps.

---

# ‏145. Tax Drift אינו Real-Time Signal

‏שינויים במס הם Config/Policy concern, לא microsecond input.

---

# ‏146. אבל Tax Rule Change הוא Production Change

‏צריך:

- ‏Review.
- ‏Versioning.
- ‏Regression tests.
- ‏Report comparison.

---

# ‏147. Accounting Schema Migration

‏שינוי schema על Ledger צריך להיות זהיר כמו שינוי Strategy state.

---

# ‏148. Never Lose Raw Broker Data

‏שמור original statements/executions באופן immutable כאשר מותר.

---

# ‏149. PII / Financial Data Security

‏Statements ומסמכי מס הם sensitive data.

‏הגבל access, הצפן ושמור לפי מדיניות retention.

---

# ‏150. Secrets אינם Ledger

‏אין לשמור API keys או credentials בתוך accounting export.

---

# ‏151. Auditability

‏לכל מספר בדוח צריך להיות נתיב חזרה ל־raw events.

---

# ‏152. `Drill-Down`

```text
Annual Number
→ Month
→ Day
→ Trade
→ Order
→ Execution
→ Raw Broker Event
```

---

# ‏153. Tax Adviser Interface

‏במקום לשלוח אלפי screenshots, הפק export מסודר:

```text
Executions
Lots
Fees
FX
Dividends
Withholding
CorporateActions
RealizedPnL
OpenPositions
```

---

# ‏154. Explainability

‏Tax/Accounting calculation צריך Reason Codes, לא magic spreadsheet.

---

# ‏155. Example Reason Codes

```text
COMMISSION
REGULATORY_FEE
BORROW_FEE
DIVIDEND
WITHHOLDING
FX_TRANSLATION
CORPORATE_ACTION_ADJUSTMENT
TAX_LOT_CLOSE
MANUAL_CORRECTION
```

---

# ‏156. `AsOf` Reporting

‏כל report צריך `AsOf` timestamp ברור.

---

# ‏157. Open Positions

‏בדוח Year-End צריך לזהות Positions פתוחים בנפרד מ־realized activity.

---

# ‏158. Multi-Account

‏אם בעתיד יהיו כמה accounts/brokers, אל תאחד raw ledger מוקדם מדי.

---

# ‏159. Account-Level IDs

```text
BrokerEntity
AccountIdAlias
ExecutionId
SecurityId
```

---

# ‏160. Transfer Between Brokers

‏Transfer יכול לשבור cost basis אם metadata לא עבר נכון.

---

# ‏161. Transfer Reconciliation

‏בדוק:

```text
Quantity
AcquisitionDate
CostBasis
Currency
Adjustments
```

---

# ‏162. Tax Forms הם Output, לא Source of Truth יחיד

‏ה־source הוא transaction ledger + verified rules.

---

# ‏163. Current Israeli Filing Snapshot

‏לשנת המס 2025, רשות המסים מפרסמת את `1322` ו־`1325` כחלק מהדיווח על רווחי הון מניירות ערך סחירים.

‏הטפסים גם מבחינים בין עסקאות שבהן נוכה מס במקור לבין כאלה שבהן לא נוכה מס במקור.

---

# ‏164. Cost Basis בישראל

‏רשות המסים מפעילה גם מנגנונים כגון `746`/`747` לקביעת עלות נייר ערך נסחר לצורך ניכוי מס במקור במקרים המתאימים.

‏זה מדגים למה `CostBasis` חייב להיות נתון שניתן להוכיח ולא רק מספר פנימי של האפליקציה.

---

# ‏165. Tax Rate הוא Data, לא Constant

‏גם כאשר שיעור מס נפוץ נראה יציב, שמור אותו ב־RuleSet ולא בקוד Strategy.

---

# ‏166. Regulatory Fee הוא Data, לא Constant

‏אותו עיקרון.

---

# ‏167. Fee Schedule Change Detector

‏אפשר בעתיד להחזיק תהליך שמתריע על שינוי fee schedule לפני deploy.

---

# ‏168. Accounting Health Metrics

```text
UnreconciledCashDifference
UnreconciledPositionDifference
MissingCostBasisCount
UnknownFeeCount
UnknownFxRateCount
UnmatchedExecutionCount
ManualAdjustmentCount
```

---

# ‏169. Tax Readiness Metrics

```text
ClosedLotsWithoutBasis
TradesWithoutFeeBreakdown
DividendsWithoutWithholdingMetadata
CorporateActionsWithoutAdjustment
AccountsNotReconciled
```

---

# ‏170. `NO TRADE` בגלל Cost

‏גם ללא Risk Veto, Trade יכול להפוך ל־`NO TRADE` אם:

```text
ExpectedPreTaxNetEdge <= RequiredEdgeBuffer
```

---

# ‏171. Required Edge Buffer

‏ה־buffer צריך לכסות uncertainty ב:

- ‏slippage.
- ‏latency.
- ‏fill quality.
- ‏cost estimate.

---

# ‏172. Tax אינו justification ל־Trade רע

‏אל תבצע Trade שלילי כלכלית רק בגלל tax benefit תיאורטי.

---

# ‏173. Fees אינם justification ל־Hold רע

‏אל תחזיק Position מסוכן רק כדי “לחסוך commission”.

---

# ‏174. Sunk Cost

‏עמלה שכבר שולמה היא sunk cost.

‏Exit decision צריך להסתכל על remaining economics.

---

# ‏175. `RemainingEdge`

```text
RemainingEdge = ExpectedFutureExitValue
                - CurrentExecutableExitCost
                - RiskPenalty
```

‏ולא להחזיר עלויות עבר שכבר אינן ניתנות לשינוי.

---

# ‏176. Tax-Aware Research — רק בשכבה נפרדת

‏אפשר להריץ:

```text
PreTaxModel
AfterTaxScenarioA
AfterTaxScenarioB
```

‏ולא לשנות את raw signal כדי להתאים למס.

---

# ‏177. Broker Statement Parsing

‏Parser צריך להיות versioned כי statement format יכול להשתנות.

---

# ‏178. Schema Drift

‏שינוי column name או fee code הוא Production Incident פוטנציאלי.

---

# ‏179. Unknown Fee Code

‏לעולם אל תזרוק.

```text
UNKNOWN_FEE_CODE
```

‏ושמור את raw value.

---

# ‏180. Backfill

‏אם parser השתפר, אפשר לחשב מחדש derived accounting מ־raw immutable data.

---

# ‏181. Idempotent Imports

‏ייבוא statement פעמיים לא צריך להכפיל transactions.

---

# ‏182. Import Fingerprint

```text
Broker
Account
StatementPeriod
FileHash
```

---

# ‏183. Reconciliation Before Tax Export

‏Tax export אסור אם יש unexplained accounting differences מהותיים.

---

# ‏184. Fail Closed For Reporting

‏כאשר basis או identity לא ידועים, עדיף לסמן `UNRESOLVED` מאשר להמציא מספר.

---

# ‏185. Practitioner Secret — “Small Fees” Kill Short Horizons

‏עמלה זעירה ביחס למחיר המניה יכולה להיות עצומה ביחס ל־Edge של כמה basis points.

---

# ‏186. Practitioner Secret — Average Cost Hides Tail Cost

‏`AvgCost` יכול להיראות מצוין בזמן ש־p95/p99 של slippage מוחק את העסקאות הטובות ביותר.

---

# ‏187. Practitioner Secret — Fee Schedule Errors Look Like Strategy Drift

‏אם עלויות חישוב שגויות, אפשר לחשוב שה־Alpha נעלם כאשר בפועל ה־accounting השתנה.

---

# ‏188. Practitioner Secret — Tax PnL Can Hide Good/Bad Execution

‏אל תשתמש ב־Tax report כדי להעריך execution quality.

---

# ‏189. Practitioner Secret — Broker Report Is Necessary, Not Sufficient

‏הוא טוב ל־cash/positions/fees, אבל לא מספר למה קיבלת החלטה ומה היה ה־market context.

---

# ‏190. Practitioner Secret — Internal Ledger Must Be Rebuildable

‏אם database נגזר נפגם, raw events צריכים לאפשר rebuild מלא.

---

# ‏191. Practitioner Secret — Cost Basis Errors Survive For Years

‏טעות קטנה בהעברה/Corporate Action יכולה לזהם reports עתידיים אם אין lineage.

---

# ‏192. Practitioner Secret — Tax Rules Are Versioned Business Logic

‏התייחס אליהם כמו לכל integration חיצוני שמשתנה.

---

# ‏193. Baseline Architecture לרובוט שלנו

```text
Execution Events
→ Immutable Trading Ledger
→ Position/Cash Projection
→ Economic PnL Attribution
→ Broker Reconciliation
→ Accounting Projection
→ Tax Projection by Jurisdiction/Year
→ Reports
```

---

# ‏194. Baseline Cost Pipeline

```text
Candidate
→ Gross Expected Edge
→ Spread/Slippage/Commission/Fees/Impact
→ Expected Pre-Tax Net Edge
→ Edge Buffer
→ TRADE / NO TRADE
```

---

# ‏195. מה לא לעשות ב־MVP

‏לא להתחיל עם:

- ‏Tax optimizer אוטומטי מורכב.
- ‏Multi-jurisdiction engine מלא.
- ‏AI שמנחש tax classification.
- ‏הקצאת כל fixed cost לכל Trade בזמן אמת.

---

# ‏196. מה כן לעשות מוקדם

‏כן לבנות:

- ‏Immutable executions.
- ‏Fee breakdown.
- ‏Cash/position reconciliation.
- ‏Stable IDs.
- ‏FX metadata.
- ‏Tax-lot-ready schema.
- ‏Versioned fee rules.

---

# ‏197. Validation Checklist

- ‏כל Fill מופיע פעם אחת.
- ‏כל Fee משויך.
- ‏Cash מתיישב מול Broker.
- ‏Positions מתיישבות מול Broker.
- ‏Cost basis ידוע או מסומן unknown.
- ‏FX source ידוע.
- ‏Corporate actions מיושמות.
- ‏Economic PnL נפרד מ־Tax PnL.
- ‏Historical rules versioned.

---

# ‏198. שאלות שחייבים לדעת לענות עליהן

1. ‏כמה עלתה העסקה נטו לפני מס?
2. ‏כמה מה־Edge נצרך על ידי execution?
3. ‏מהו ה־Realized PnL לפי Ledger?
4. ‏אילו Tax Lots נסגרו?
5. ‏איזה withholding בוצע?
6. ‏איזה FX rate שימש?
7. ‏האם Broker ו־Internal Ledger מתיישבים?
8. ‏איזו Rule Version שימשה לדוח?

---

# ‏199. Definition of Done לפרק

‏אנחנו מבינים ש־Trading System מקצועי צריך להחזיק שלוש אמיתות במקביל:

```text
Economic Truth
Accounting Truth
Tax Truth
```

‏והן חייבות להיות מקושרות אך לא מעורבבות.

---

# ‏200. מסקנה

‏לרובוט קצר־טווח, Fees ו־Accounting אינם Back Office משעמם.

‏הם חלק ישיר מהשאלה האם ה־Edge באמת קיים.

‏אבל Tax הוא שכבה נוספת שדורשת rules, jurisdiction ו־evidence משלה.

‏הארכיטקטורה הנכונה היא:

```text
Signal
→ Executable Economics
→ Trade
→ Immutable Ledger
→ Reconciliation
→ Accounting Projection
→ Tax Projection
```

‏כך אפשר לשפר Strategy בלי לזהם אותה בכללי מס, ובמקביל להגיע לדיווח שבו כל מספר ניתן להסבר ולשחזור.

---

# ‏מקורות עדכניים ששימשו ל־snapshot העובדתי

- ‏`SEC` — `Section 31 Transaction Fee Rate Advisory for Fiscal Year 2026`, פורסם 27 בפברואר 2026: שיעור של `$20.60 per million` החל מ־4 באפריל 2026 לרוב covered sales, עד שינוי נוסף לפי מנגנון ה־SEC.
- ‏`IRS Publication 550 (2025)` — דוגמה לכללי `Wash Sale` בארה״ב; הכלל תלוי taxpayer/jurisdiction ואינו כלל אוניברסלי.
- ‏רשות המסים בישראל — דוח שנתי 2025, טפסי `1322` ו־`1325` לרווחי הון מניירות ערך סחירים; טופס 1325 מציג בין היתר `25%` ליחיד ו־`30%` לבעל מניות מהותי במקרים המתוארים בטופס.
- ‏רשות המסים בישראל — `746`/`747` לקביעת עלות נייר ערך נסחר לצורך ניכוי מס במקור במקרים המתאימים.

‏כל הנתונים לעיל הם snapshot ל־26 באוקטובר 2026 ואינם תחליף לבדיקה עדכנית בעת שימוש מעשי.