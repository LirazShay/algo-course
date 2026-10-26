# ‏שלב 31 — ספקי `Market Data` ואלטרנטיבות: איך לבחור Feed שמתאים ל־Whole-Market Scanner

> ‏מטרת הפרק: להבין כיצד משווים ספקי `Market Data` בצורה מקצועית עבור מערכת שסורקת אלפי מניות, אילו סוגי Feeds קיימים, מה ההבדל בין Consolidated Data ל־Direct/Venue Data, ואיך לבנות ארכיטקטורה שמאפשרת להחליף ספק בלי לשכתב את ה־Strategy.
>
> ‏העיקרון המרכזי: **הספק הטוב ביותר אינו “מי שמחזיר מחיר”. הוא הספק שנותן את הכיסוי, הטריות, הסמנטיקה, הקצב, ההיסטוריה והאמינות שהאסטרטגיה באמת צריכה — במחיר ובמורכבות שמתאימים למערכת.**
>
> ‏הערת עדכניות: תכניות, מחירים, entitlement, מגבלות subscriptions ותכונות API משתנים. הדוגמאות המסחריות בפרק נבדקו מול תיעוד רשמי באוקטובר 2026, אבל לפני Production יש לאמת אותן מחדש.

---

# ‏1. `Market Data Provider` הוא רכיב עצמאי

‏ה־Scanner לא צריך לדעת מי הספק.

```text
MarketDataProvider
        ↓
Canonical Market Events
        ↓
Feature Engine
        ↓
Scanner
        ↓
Score / Rank
```

‏ה־Strategy צריכה לעבוד על schema פנימי יציב.

---

# ‏2. למה לא לקשור Data לברוקר

‏Broker טוב לביצוע אינו בהכרח Feed טוב לסריקה של אלפי מניות.

‏ולהפך.

‏לכן הארכיטקטורה שלנו היא:

```text
MarketDataProvider != ExecutionBroker
```

---

# ‏3. ארבע שאלות בסיסיות לכל ספק

1. ‏מה הוא מכסה?
2. ‏כמה מהר הוא שולח?
3. ‏כמה Symbols אפשר לצרוך במקביל?
4. ‏האם אפשר לשחזר היסטורית את מה שקיבלנו Live?

---

# ‏4. Coverage

‏Coverage אינו רק מספר Symbols.

‏צריך לדעת:

- ‏אילו Exchanges.
- ‏אילו ATS/TRF.
- ‏האם OTC נכלל.
- ‏האם Pre-market נכלל.
- ‏האם After-hours נכלל.
- ‏האם Overnight נכלל.
- ‏האם Halts/LULD נכללים.
- ‏האם Corporate Actions ו־Reference Data זמינים.

---

# ‏5. `Trade` Data

‏Trade event בסיסי כולל בדרך כלל:

```text
symbol
price
size
exchange
timestamp
conditions
sequence
```

‏אבל השדות המדויקים משתנים בין ספקים.

---

# ‏6. `Quote` Data

‏Quote בסיסי כולל:

```text
bid_price
bid_size
ask_price
ask_size
exchange/tape
timestamp
conditions
```

‏לרובוט של שניות, Quote הוא לעיתים חשוב יותר מ־Last.

---

# ‏7. `NBBO`

‏`NBBO` הוא ה־National Best Bid and Offer.

‏הוא נותן תמונת Top-of-Book מאוחדת ברמת השוק.

---

# ‏8. `Venue-Specific BBO`

‏Feed של Exchange יחיד נותן רק את ה־Bid/Ask של אותו Venue.

‏הוא אינו בהכרח ה־NBBO.

---

# ‏9. דוגמה קריטית: `IEX`

‏אם Feed מסוים מכסה רק את `IEX`, הוא אינו מייצג את כל שוק המניות האמריקאי.

‏הוא יכול להיות שימושי ללימוד, Prototype או Feature מסוים.

‏אבל אסור להתייחס אליו אוטומטית כאל Full-Market Tape.

---

# ‏10. `SIP`

‏`SIP` מאחד מידע ממספר Venues.

‏במניות אמריקאיות קיימים מנגנוני consolidated tape עבור securities שונים.

‏לרובוט רחב-שוק, SIP הוא נקודת ייחוס חשובה.

---

# ‏11. `Direct Feed`

‏Direct Feed מגיע ישירות מ־Exchange או דרך Vendor שמעביר אותו.

‏הוא עשוי לספק:

- ‏יותר עומק.
- ‏timestamps מפורטים יותר.
- ‏order-level events.
- ‏latency שונה.

---

# ‏12. Direct אינו בהכרח Consolidated

‏Direct Feed של Venue אחד יכול להיות מהיר ועשיר מאוד.

‏אבל הוא עדיין Venue אחד.

---

# ‏13. `Top of Book`

‏Top-of-Book נותן את הרמה הטובה ביותר בלבד.

```text
Best Bid
Best Ask
```

---

# ‏14. `Depth of Book`

‏Depth מוסיף מספר רמות מחיר.

```text
Bid1
Bid2
Bid3
...
Ask1
Ask2
Ask3
...
```

---

# ‏15. `L2` ו־`L3`

‏המונחים משתנים מעט בין ספקים.

‏באופן כללי:

- ‏`L1` — Top of Book.
- ‏`L2` — מספר רמות/participants.
- ‏`L3` — order-level detail במקומות שבהם הוא זמין.

---

# ‏16. לרובוט שלנו אין צורך להתחיל מ־L3

‏אלפי Symbols כפול order-level data עלולים ליצור נפח עצום.

‏לכן מתחילים מהשאלה:

> ‏איזה Feature באמת דורש Depth?

---

# ‏17. `Bars`

‏Bars הם aggregation של Trades.

‏לדוגמה:

```text
1 second OHLCV
1 minute OHLCV
```

---

# ‏18. Bar אינו Tick Stream

‏אם בתוך שנייה היו 50 Trades, Bar מסתיר את הסדר שלהם.

---

# ‏19. מתי Second Bars מספיקים

‏אם ה־Feature שלנו מסתכל על:

- ‏return של 5–60 שניות.
- ‏volume per second.
- ‏directional acceleration.

‏Second Bars יכולים להיות Baseline זול ופשוט.

---

# ‏20. מתי צריך Tick Data

‏אם רוצים לחקור:

- ‏trade frequency.
- ‏micro bursts.
- ‏quote changes.
- ‏spread dynamics.
- ‏fill realism.

‏Tick Data נהיה חשוב יותר.

---

# ‏21. Snapshot API מול Streaming

‏Polling של snapshot כל 10 שניות אינו אותו דבר כמו Stream רציף.

---

# ‏22. Polling יכול לפספס Path

‏מחיר יכול:

```text
100.00
100.30
99.95
100.05
```

‏בין שתי דגימות.

‏Snapshot בלבד יכול לראות רק:

```text
100.00 → 100.05
```

---

# ‏23. Streaming נותן Event Flow

‏WebSocket/streaming מתאים יותר ל־real-time features.

---

# ‏24. אבל Stream יוצר בעיית Burst

‏השוק אינו שולח events בקצב קבוע.

‏בפתיחה יכולים להגיע bursts גדולים מאוד.

---

# ‏25. תכננו לפי Peak ולא Average

‏זו אחת מנקודות ה־Best Practice החשובות.

---

# ‏26. Messages ≠ Events

‏Vendor יכול לארוז כמה events בתוך message אחד.

‏לכן capacity צריך להימדד ב־events/sec וב־bytes/sec.

---

# ‏27. Backpressure

‏אם consumer איטי מה־feed:

```text
incoming rate > processing rate
```

‏נוצר backlog.

---

# ‏28. Backlog הוא Latency

‏גם אם network latency נמוך, מערכת שמפגרת 4 שניות כבר אינה real-time.

---

# ‏29. מדד חיוני

```text
processing_lag_ms = now - latest_processed_event_time
```

---

# ‏30. Whole-Market Scanner דורש Coverage Metric

```text
fresh_symbols / expected_symbols
```

---

# ‏31. Coverage ללא Freshness מטעה

‏4,000 Symbols שקיבלנו לפני 30 שניות אינם 4,000 Symbols עדכניים.

---

# ‏32. לכן צריך שני מדדים

```text
coverage_pct
fresh_coverage_pct
```

---

# ‏33. `Data Freshness`

‏לכל Symbol:

```text
age_ms = now - last_market_event_time
```

---

# ‏34. Freshness Threshold

‏Threshold צריך להיות תלוי use case.

‏לא hard-code גלובלי בלי מחקר.

---

# ‏35. Active מול Quiet Symbols

‏מניה שקטה יכולה להיות fresh גם אם לא היה Trade חדש.

‏לכן Freshness חייבת להבין event type.

---

# ‏36. Trade Freshness ≠ Quote Freshness

‏יכול לא להיות Trade חדש אבל Quotes להשתנות.

---

# ‏37. Quote Freshness חשובה לביצוע

‏ל־Entry/Exit צריך B/A עדכני.

---

# ‏38. Trade Freshness חשובה ל־Momentum

‏תלוי Feature.

---

# ‏39. `Sequence Numbers`

‏אם Feed נותן sequence, שמרו אותו.

---

# ‏40. Gap Detection

```text
expected_sequence != actual_sequence
```

‏יכול להצביע על missing events.

---

# ‏41. לא כל Sequence הוא Global

‏חלק מהספקים מנהלים sequence לפי Symbol, Channel או Session.

‏חייבים להבין semantics.

---

# ‏42. `Exchange Timestamp`

‏זמן שבו Venue יצר את event.

---

# ‏43. `SIP Timestamp`

‏זמן שבו event עבר דרך consolidated infrastructure.

---

# ‏44. `Provider Timestamp`

‏זמן פנימי של הספק.

---

# ‏45. `Receive Timestamp`

‏הזמן שבו אנחנו קיבלנו את האירוע.

---

# ‏46. אל תדרוס timestamps

‏שמור כמה clocks אם הם זמינים.

---

# ‏47. Canonical Event

‏ה־Adapter צריך למפות כל Provider ל־schema אחיד.

```text
MarketEvent {
  provider
  symbol
  type
  event_time
  provider_time
  receive_time
  sequence
  payload
}
```

---

# ‏48. Raw Event חייב להישמר

‏Normalization יכול להכיל bug.

‏לכן במחקר חשוב לשמור גם raw payload או representation ניתן לשחזור.

---

# ‏49. `Schema Version`

‏כל event צריך להיות ניתן לקישור לגרסת schema.

---

# ‏50. `Provider Version`

‏גם mapping rules משתנים.

---

# ‏51. Symbol Mapping

‏AAPL הוא פשוט.

‏אבל Symbols מורכבים, class shares ושינויים היסטוריים אינם תמיד פשוטים.

---

# ‏52. Canonical Instrument ID

‏עדיף לא לבסס כל מערכת פנימית רק על string ticker.

---

# ‏53. Reference Data

‏צריך לדעת לפחות:

- ‏symbol.
- ‏primary exchange.
- ‏asset type.
- ‏listing status.
- ‏currency.
- ‏corporate-action history.

---

# ‏54. Corporate Actions

‏Split יכול לשבור Features אם ההיסטוריה אינה מותאמת נכון.

---

# ‏55. אבל Execution Data אינו תמיד Adjusted

‏אסור לערבב adjusted historical bars עם raw live quotes בלי הגדרה ברורה.

---

# ‏56. Halt Data

‏מערכת צריכה לדעת שמניה נעצרה.

---

# ‏57. LULD

‏Limit Up/Limit Down הוא context משמעותי במצבי שוק מהירים.

---

# ‏58. Conditions

‏Trade/Quote conditions משנות את משמעות האירוע.

---

# ‏59. לא כל Trade מתאים ל־Last שלנו

‏יש trades בעלי conditions מיוחדים.

‏צריך להגדיר eligibility rules.

---

# ‏60. Vendor Aggregates משתמשים Rules

‏Bar של Vendor אינו בהכרח “כל ה־trades”.

‏צריך להבין אילו events נכללים.

---

# ‏61. `Consolidated` מול `Venue-Specific`

‏אין כאן winner מוחלט.

‏זו שאלה של use case.

---

# ‏62. עבור Broad Scanner

‏בדרך כלל חשוב כיסוי רחב ועקבי.

---

# ‏63. עבור Microstructure Research

‏Direct depth feed יכול להיות בעל ערך גבוה יותר.

---

# ‏64. Multi-Stage Data Architecture

```text
Broad Feed
    ↓
Rank entire market
    ↓
Top N
    ↓
Richer Feed / Depth / Broker Validation
```

---

# ‏65. היתרון

‏לא צריך להזרים L3 על 4,000 מניות כדי לקבל Depth על 5 Candidates.

---

# ‏66. Data Funnel

‏בדיוק כמו Filter Funnel.

```text
Universe
→ Broad L1
→ Eligible Candidates
→ Top 100
→ Top 10 enriched
→ Top 1 execution validation
```

---

# ‏67. Cost-aware Data Architecture

‏נתונים יקרים יותר צריכים להוסיף ערך מדיד.

---

# ‏68. שאלת המחקר

> ‏האם Feed עשיר יותר משפר Rank/Execution מספיק כדי להצדיק את העלות והמורכבות?

---

# ‏69. Data Cost הוא חלק מ־Infrastructure Cost

‏לא עמלת Trade.

---

# ‏70. אבל עדיין צריך למדוד ROI

‏אם Feed עולה כסף אך לא משפר Decision Quality, אין הצדקה אוטומטית לשמור אותו.

---

# ‏71. `Entitlement`

‏קבלת Market Data תלויה לעיתים ב־subscription, user classification והרשאות.

---

# ‏72. `Display` מול `Non-Display`

‏Licensing יכול להשתנות אם data מוצג לאדם או משמש Algorithmically.

---

# ‏73. Professional מול Non-Professional

‏חלק מהבורסות והספקים מבחינים בין סוגי משתמשים.

---

# ‏74. אל תניח ש־API Plan כולל Legal Right לכל שימוש

‏צריך לבדוק licensing terms.

---

# ‏75. Redistribution

‏אם בעתיד המערכת תציג data למשתמשים אחרים, licensing יכול להשתנות מהותית.

---

# ‏76. Historical Rights

‏גם שמירת raw data לאורך זמן יכולה להיות כפופה לתנאים שונים.

---

# ‏77. Live + Historical Parity

‏למחקר שלנו זה קריטי.

‏רצוי שההיסטוריה תהיה דומה ככל האפשר ל־Live feed.

---

# ‏78. אחרת נוצר Feed Skew

```text
Backtest feed != Live feed
```

---

# ‏79. דוגמה

‏Backtest על consolidated quotes.

‏Live על Venue יחיד.

‏זו אינה אותה אסטרטגיה בפועל.

---

# ‏80. `Historical Tick Data`

‏בדוק:

- ‏כמה שנים.
- ‏Trades?
- ‏Quotes?
- ‏Depth?
- ‏Conditions?
- ‏Sequence?
- ‏nanosecond/microsecond/ms timestamps?

---

# ‏81. Bulk Files

‏למחקר גדול bulk files יכולים להיות טובים יותר מ־REST pagination.

---

# ‏82. REST

‏טוב ל־lookup, reference, snapshots ו־backfill קטן.

---

# ‏83. WebSocket

‏טוב ל־live stream.

---

# ‏84. Flat Files/Object Storage

‏טוב ל־large-scale historical research.

---

# ‏85. אל תכריח API אחד לכל Use Case

‏אותו Vendor יכול לתת REST + WebSocket + Bulk.

‏השתמש בכל transport למה שהוא מתאים.

---

# ‏86. Compression

‏Whole-market raw quotes מייצרים הרבה bytes.

‏Compression ו־binary formats יכולים להיות משמעותיים.

---

# ‏87. JSON קל לפיתוח

‏אבל יקר יחסית ב־CPU וב־bandwidth.

---

# ‏88. Binary Feeds

‏יעילים יותר אך מורכבים יותר.

---

# ‏89. KISS First

‏אל תעבור ל־ITCH binary direct feed לפני שהוכחת שהוא פותר bottleneck אמיתי.

---

# ‏90. Data Throughput Budget

‏מדוד:

```text
events/sec
MB/sec
parse_cpu
queue_depth
processing_lag
storage_GB/day
```

---

# ‏91. Opening Burst Test

‏Average day אינו מספיק.

‏בדוק פתיחה.

---

# ‏92. News Burst Test

‏גם באמצע היום יכול להגיע sudden market-wide burst.

---

# ‏93. Slow Consumer Detection

‏צריך alert לפני שה־Scanner עובד על מידע ישן.

---

# ‏94. Drop Policy

‏אם המערכת לא עומדת בקצב, צריך מדיניות מפורשת.

---

# ‏95. אסור Drop שקט

‏Missing data שלא סומן הוא מסוכן יותר מ־pause.

---

# ‏96. Recovery

‏אחרי reconnect צריך לדעת:

- ‏מה פספסנו.
- ‏אם אפשר backfill.
- ‏אם state עדיין תקף.

---

# ‏97. Snapshot Recovery

‏לעיתים snapshot יכול להחזיר state עכשווי.

---

# ‏98. אבל Snapshot אינו משחזר Path

‏לכן Features rolling מסוימים עדיין עלולים להיות לא תקפים.

---

# ‏99. `WARMING_UP`

‏אחרי reconnect ייתכן שה־Feature Engine צריך חלון זמן מחדש.

---

# ‏100. Data State Machine

```text
DISCONNECTED
CONNECTING
SYNCING
WARMING_UP
READY
DEGRADED
STALE
```

---

# ‏101. Trading Gate

‏Scanner יכול לחשב בזמן `DEGRADED`.

‏אבל Order Policy יכולה לאסור Entry.

---

# ‏102. Cross-Provider Comparison

‏דרך חזקה לבדוק Feed היא להריץ שני ספקים יחד לזמן מוגבל.

---

# ‏103. אל תשווה Event-to-Event נאיבי

‏timestamps וה־consolidation שונים.

---

# ‏104. השווה Metrics

- ‏Last divergence.
- ‏NBBO divergence.
- ‏event count.
- ‏volume.
- ‏staleness.
- ‏missing symbols.
- ‏timestamp skew.

---

# ‏105. `Provider Divergence`

```text
abs(price_A - price_B)
```

‏לבד אינו מספיק.

---

# ‏106. Quote Divergence

```text
bid_A vs bid_B
ask_A vs ask_B
```

---

# ‏107. Time-Aligned Comparison

‏השווה לפי as-of semantics.

---

# ‏108. Primary + Secondary Provider

‏אפשר להשתמש בספק שני ל־health validation.

---

# ‏109. אבל Failover אינו טריוויאלי

‏Feed B יכול להשתמש semantics שונים.

---

# ‏110. Failover יכול לשנות Score

‏לכן מעבר ספק הוא אירוע Strategy-relevant.

---

# ‏111. רשום Provider בכל Decision

```text
market_data_provider
feed_type
feed_version
```

---

# ‏112. `Feed Epoch`

‏אם עוברים Provider באמצע session, כדאי לסמן epoch חדש.

---

# ‏113. Provider Failover Policy

‏אפשרויות:

```text
PAUSE_NEW_ENTRIES
USE_SECONDARY
EXIT_ONLY
CONTINUE_DEGRADED
```

---

# ‏114. הבחירה תלויה Evidence

‏לא hard-code בלי בדיקה.

---

# ‏115. Provider Selection Matrix

‏עמודות מומלצות:

```text
Coverage
Trades
NBBO Quotes
Depth
Historical Ticks
Bulk Files
WebSocket
All-Symbol Subscription
Latency
Burst Capacity
Licensing
Cost
Reliability
SDK Quality
Support
```

---

# ‏116. משקל לכל Dimension

‏המשקל תלוי באסטרטגיה.

---

# ‏117. לרובוט שלנו

‏Coverage, Freshness ו־Whole-Market Streaming הם בעלי חשיבות גבוהה.

---

# ‏118. Depth בתחילת הדרך

‏חשוב פחות מ־broad coverage אם עדיין לא הוכחנו predictive edge.

---

# ‏119. Data Vendor אינו Feature

‏אל תיתן ל־provider-specific field לדלוף ישירות ל־Strategy בלי normalization.

---

# ‏120. `Provider Adapter`

```text
IStockMarketDataProvider
```

‏צריך להחזיר events canonical.

---

# ‏121. Capabilities

```text
SupportsTrades
SupportsQuotes
SupportsNbbo
SupportsDepth
SupportsHistoricalTicks
SupportsAllSymbols
SupportsBackfill
```

---

# ‏122. Capability Negotiation

‏ה־system startup צריך לדעת אילו capabilities זמינים.

---

# ‏123. לא להיכשל מאוחר

‏אם Strategy דורשת NBBO וה־feed הוא venue-only, עדיף לזהות זאת ב־startup.

---

# ‏124. Data Contract

‏Strategy צריכה להגדיר דרישות.

```text
RequiredDataContract
```

---

# ‏125. דוגמה

```text
requires:
  trades: true
  nbbo: true
  max_quote_age_ms: X
  historical_lookback: Y
```

---

# ‏126. Validation בזמן Startup

‏אם contract לא מתקיים:

```text
NOT_READY
```

---

# ‏127. Validation בזמן Live

‏Capability קיים אינו אומר שה־feed בריא עכשיו.

---

# ‏128. Data SLA פנימי

‏הגדר:

- ‏max lag.
- ‏min coverage.
- ‏max gap rate.
- ‏max reconnect frequency.

---

# ‏129. SLA הוא Strategy-specific

‏לא כל strategy דורשת אותו latency.

---

# ‏130. Latency Measurement

```text
receive_time - event_time
```

---

# ‏131. אבל clocks שונים

‏צריך clock synchronization ופרשנות זהירה.

---

# ‏132. Network RTT

‏Ping ל־API endpoint אינו שווה market-data latency.

---

# ‏133. Measure Actual Feed

‏מדוד event timestamps עצמם.

---

# ‏134. Percentiles

‏P50 לבדו אינו מספיק.

‏מדוד P95/P99.

---

# ‏135. Tail Latency

‏במסחר קצר, tails יכולים להיות משמעותיים יותר מהממוצע.

---

# ‏136. Regional Hosting

‏מיקום השרת יכול להשפיע.

---

# ‏137. אבל אל תתחזה ל־HFT

‏לפני colocating, הוכח שה־Edge תלוי בעשרות/מאות microseconds ולא בשניות.

---

# ‏138. Historical/Live Clock Parity

‏Backtest צריך להבין איזה timestamp שימש בלייב.

---

# ‏139. Research Dataset Manifest

```text
provider
feed
symbol_set
date_range
schema_version
normalizer_version
checksum
```

---

# ‏140. Dataset Versioning

‏אחרת אותו experiment עלול להשתנות בלי שנדע למה.

---

# ‏141. Vendor Corrections

‏ספק יכול לתקן היסטוריה.

‏שמור dataset version/hash.

---

# ‏142. Raw + Derived Storage

```text
Raw Events
↓
Normalized Events
↓
Features
↓
Decisions
```

---

# ‏143. אל תשמור רק Features

‏אחרת קשה לבצע RCA על parser/data bug.

---

# ‏144. Data Quality Score

‏אפשר לייצר score נפרד ל־data health.

---

# ‏145. אבל Data Quality אינו Trading Score

‏אל תערבב ביניהם.

---

# ‏146. Data Quality Gate

‏אם data אינו אמין:

```text
NO TRADE
```

---

# ‏147. Candidate-level Data Gate

‏ייתכן שכל השוק תקין אבל Candidate מסוים stale.

---

# ‏148. Market-wide Data Gate

‏ייתכן Candidate נראה תקין אבל universe coverage נפגעה.

‏אז Rank #1 אינו אמין.

---

# ‏149. Whole-Market Rank דורש Comparable Freshness

‏זו נקודה קריטית.

---

# ‏150. `Freshness Bias`

‏Symbols שמתעדכנים בתדירות שונה עלולים לקבל יתרון/חיסרון מלאכותי.

---

# ‏151. Sampling Policy

‏הגדר איך ממירים streams לקצב Feature.

---

# ‏152. Fixed 1s Sampling

‏אפשרי Baseline.

---

# ‏153. Event-Driven Features

‏יכולים להיות מדויקים יותר אך מורכבים יותר.

---

# ‏154. Hybrid

‏Raw events נכנסים event-driven.

‏Ranking נבנה בכל cadence מוגדר.

---

# ‏155. Snapshot Consistency

‏כאשר מדרגים 4,000 מניות, צריך להגדיר as-of cut.

---

# ‏156. אחרת Rank מערבב זמנים

‏Symbol A יכול להיות מ־T.

‏Symbol B מ־T-3s.

---

# ‏157. Universe Snapshot Time

‏כל Rank cycle צריך timestamp משלו.

---

# ‏158. Feature Age

‏שמור age לכל Feature/Source.

---

# ‏159. Staleness Penalty

‏יכול להיות Feature.

‏או Eligibility Gate.

---

# ‏160. עדיף להתחיל כ־Gate

‏פשוט יותר להסביר ולבדוק.

---

# ‏161. Provider Example — `Alpaca`

‏נכון לבדיקת התיעוד באוקטובר 2026:

- ‏קיים WebSocket למניות.
- ‏קיים feed מסוג `IEX`.
- ‏קיים feed מסוג `SIP`.
- ‏יש גם delayed SIP ומסלולי extended/overnight מסוימים.

---

# ‏162. המשמעות של `IEX` בלבד

‏זהו feed צר יותר מ־SIP full-market.

‏אל תשתמש בו כראיה לכך שכל השוק התנהג כך.

---

# ‏163. המשמעות של `SIP`

‏מתאים יותר למחקר broad-market כאשר צריך consolidated coverage.

---

# ‏164. Provider Example — `Massive`

‏נכון לבדיקת התיעוד באוקטובר 2026:

- ‏WebSocket ל־Trades.
- ‏WebSocket ל־NBBO Quotes.
- ‏Second/Minute aggregates.
- ‏אפשרות wildcard לכל Symbols בערוצים מתאימים.
- ‏Bulk historical files ו־REST.

---

# ‏165. Whole-Market Wildcard אינו חינם מבחינת Compute

‏גם אם הספק מאפשר subscription לכל השוק, consumer שלנו חייב לעמוד בקצב.

---

# ‏166. Massive עצמו מדגיש Burst Capacity

‏Quotes יכולים להיות כבדים מאוד.

‏לכן benchmark אמיתי חשוב יותר מהבטחת “WebSocket אחד”.

---

# ‏167. Provider Example — `Databento`

‏נכון לבדיקת התיעוד באוקטובר 2026:

‏הפלטפורמה מציעה datasets של US Equities עם שילוב של top-of-book, depth ו־historical/live בהתאם ל־dataset.

---

# ‏168. Databento כדוגמה ל־Depth Research

‏אם בעתיד נחקור queue/microstructure, provider עם direct depth datasets יכול להפוך רלוונטי יותר.

---

# ‏169. Direct Exchange Example — `Nasdaq TotalView`

‏Nasdaq מציעה Full Depth דרך TotalView.

---

# ‏170. Direct Feed אינו פתרון Whole Market בפני עצמו

‏Nasdaq depth אינו כל Venues בארה"ב.

---

# ‏171. Direct Feeds מוסיפים Complexity

‏צריך להתמודד עם:

- ‏protocols.
- ‏entitlements.
- ‏connectivity.
- ‏storage.
- ‏normalization.

---

# ‏172. אל תקנה Complexity לפני Evidence

‏זו אחת מהמלצות ה־KISS המרכזיות.

---

# ‏173. `IBKR` כ־Market Data Source

‏כבר למדנו בשלב 30:

‏יש מגבלות market-data lines ו־subscription model שאינן אידאליות בהכרח ל־streaming של כל 4,000 המניות בו־זמנית.

---

# ‏174. לכן ארכיטקטורה טובה מאפשרת

```text
Provider A → whole-market data
IBKR → execution
```

---

# ‏175. אפשר גם Provider B ל־validation

```text
Primary Feed
Secondary Health Feed
Execution Broker
```

---

# ‏176. אך אל תבנה שלושה ספקים ביום הראשון

‏התחל פשוט.

---

# ‏177. Provider Evaluation POC

‏לפני החלטה:

1. ‏התחבר.
2. ‏הירשם ל־Universe הרצוי.
3. ‏הרץ בזמן פתיחה.
4. ‏מדוד throughput.
5. ‏מדוד lag.
6. ‏מדוד gaps.
7. ‏שמור raw sample.
8. ‏השווה Historical API.

---

# ‏178. POC צריך להיות Reproducible

‏שמור date, plan, region, client version ו־config.

---

# ‏179. Benchmark Dataset

‏בחר כמה סוגי ימים:

- ‏יום רגוע.
- ‏יום תנודתי.
- ‏פתיחה חזקה.
- ‏אירוע חד.

---

# ‏180. Provider Evaluation Scorecard

‏אל תשתמש בתחושה.

---

# ‏181. Metric — Coverage

```text
symbols_with_data / expected_symbols
```

---

# ‏182. Metric — Fresh Coverage

```text
symbols_fresh_within_X / expected_symbols
```

---

# ‏183. Metric — Lag

```text
P50/P95/P99 receive lag
```

---

# ‏184. Metric — Gap Rate

```text
sequence/data gaps per million events
```

---

# ‏185. Metric — Reconnect Rate

```text
reconnects/session
```

---

# ‏186. Metric — Recovery Time

```text
time_to_ready_after_disconnect
```

---

# ‏187. Metric — Historical Parity

‏כמה קל לשחזר את אותו feed למחקר.

---

# ‏188. Metric — Cost per Useful Capability

‏לא רק monthly price.

---

# ‏189. Metric — Developer Complexity

‏כמה code/ops נדרש כדי להיות אמינים.

---

# ‏190. Metric — Licensing Risk

‏האם השימוש שלנו ברור ומותר.

---

# ‏191. Reject Condition

‏Provider שאינו עומד ב־coverage/freshness קריטיים לא צריך להינצל בגלל מחיר זול.

---

# ‏192. Reject Condition

‏Provider שאין לנו דרך לשחזר ממנו historical behavior עלול להקשות מאוד על validation.

---

# ‏193. Reject Condition

‏Feed semantics לא ברורים.

---

# ‏194. Reject Condition

‏אין דרך לזהות stale/disconnected state בצורה אמינה.

---

# ‏195. Best Practice — Separate Interfaces

```text
ILiveMarketDataProvider
IHistoricalMarketDataProvider
IReferenceDataProvider
```

---

# ‏196. למה לא Interface אחד ענק

‏כי לא כל ספק טוב בכל תחום.

---

# ‏197. Composite Provider

‏אפשר להרכיב:

```text
Live: Provider A
Historical: Provider B
Reference: Provider C
```

---

# ‏198. אבל זה מגדיל Skew Risk

‏ולכן צריך Mapping ו־parity tests.

---

# ‏199. Provider Abstraction אינו Excuse

‏אסור להסתיר semantics חשובים מדי.

---

# ‏200. Lowest Common Denominator Trap

‏אם interface מכיל רק Last כי כל הספקים תומכים בו, איבדנו Quote/Depth capabilities.

---

# ‏201. פתרון

‏Core contract + capabilities/extensions.

---

# ‏202. Canonical Trade

‏שדות בסיס מומלצים:

```text
InstrumentId
Price
Size
Venue
Conditions
EventTime
ReceiveTime
Sequence
Provider
```

---

# ‏203. Canonical Quote

```text
InstrumentId
BidPrice
BidSize
AskPrice
AskSize
BidVenue
AskVenue
EventTime
ReceiveTime
Sequence
Provider
```

---

# ‏204. Raw Conditions

‏שמור גם raw condition codes.

---

# ‏205. Normalized Conditions

‏בנוסף, מפה ל־internal flags.

---

# ‏206. Parser Tests

‏כל provider adapter צריך fixtures אמיתיים.

---

# ‏207. Golden Messages

‏שמור sample payloads מה־provider.

---

# ‏208. Schema Change Detection

‏אם שדה נעלם/משנה type — alert.

---

# ‏209. Unknown Fields

‏לא חייבים להיכשל על כל שדה חדש.

‏אבל צריך observability.

---

# ‏210. Null/Missing Semantics

‏`null` אינו תמיד zero.

---

# ‏211. One-Sided Market

‏ייתכן Bid בלי Ask או להפך.

‏המערכת צריכה לייצג זאת נכון.

---

# ‏212. Crossed/Locked Markets

‏אל תתקן אותם בשקט.

‏שמור raw state והגדר policy.

---

# ‏213. Odd Lots

‏יכולים להיות משמעותיים ב־microstructure.

‏בדוק אם/how feed מציג אותם.

---

# ‏214. Trade Corrections/Cancels

‏Data feed יכול לכלול תיקונים.

‏Historical pipeline צריך להבין אותם.

---

# ‏215. Late Events

‏Event יכול להגיע אחרי אירוע מאוחר יותר בזמן exchange.

---

# ‏216. Reordering Window

‏אפשר לחקור buffer קצר.

‏אבל הוא מוסיף latency.

---

# ‏217. Live Trade-off

```text
perfect ordering vs fast decision
```

---

# ‏218. Replay Trade-off

‏ב־Replay אפשר לשמר arrival order המקורי כדי לשחזר Live behavior.

---

# ‏219. Event-Time Replay

‏אפשר גם לנתח theoretical exchange order בנפרד.

---

# ‏220. אל תבלבל בין השניים

‏שניהם עונים על שאלות שונות.

---

# ‏221. Data Lineage

‏כל Feature צריך להיות traceable ל־market events.

---

# ‏222. Feature RCA

‏אם Feature קפץ, צריך לדעת איזה event גרם לכך.

---

# ‏223. Provider Incident RCA

‏כשיש anomaly:

```text
Provider issue?
Network issue?
Parser issue?
Backpressure?
Clock issue?
Strategy issue?
```

---

# ‏224. Data Incident Package

‏שמור:

- ‏raw messages.
- ‏connection events.
- ‏lag metrics.
- ‏queue depth.
- ‏affected symbols.
- ‏decision IDs.

---

# ‏225. Data Health Dashboard

‏צריך להראות לפחות:

```text
connection state
coverage
fresh coverage
events/sec
MB/sec
processing lag
gaps
reconnects
provider errors
```

---

# ‏226. Per-Symbol Diagnostics

‏ל־Candidate #1 צריך לראות:

```text
last trade age
last quote age
provider
sequence
bid/ask
spread
```

---

# ‏227. Cross-Section Diagnostics

‏גם:

```text
universe size
fresh universe size
median data age
P95 data age
```

---

# ‏228. Rank Trust Gate

‏אם cross-sectional freshness נמוכה:

```text
rank_trusted = false
```

---

# ‏229. Trade Gate

‏אם Rank אינו trusted:

```text
NO TRADE
```

---

# ‏230. Data Provider אינו “Setup פעם אחת”

‏Plans, feeds, venues ושעות מסחר משתנים.

---

# ‏231. דוגמה לשינוי שוק אמיתי

‏Nasdaq הודיעה ב־2026 על הרחבת שעות ו־data products חדשים/משתנים כחלק מ־23/5.

‏זה מדגים למה assumptions סביב sessions ו־feeds חייבים להיות versioned.

---

# ‏232. Provider Capability Registry

```text
provider
feed
capability
valid_from
valid_to
source_checked_at
```

---

# ‏233. Source of Truth

‏למגבלות Vendor — תיעוד רשמי קודם.

---

# ‏234. Community Reports

‏שימושיים למציאת edge cases.

‏אבל לא כתחליף ל־official contract.

---

# ‏235. POC Before Purchase

‏אם אפשר, בדוק trial/free tier קודם.

‏אבל אל תניח ש־free tier מייצג paid feed.

---

# ‏236. Free Data Trap

‏חינם יכול להיות:

- ‏Venue יחיד.
- ‏Delayed.
- ‏limited symbols.
- ‏limited connections.
- ‏limited history.

---

# ‏237. Cheap Data Trap

‏מחיר נמוך אינו בהכרח cost נמוך אם חסרים events וצריך workaround מורכב.

---

# ‏238. Premium Data Trap

‏Feed יקר יותר אינו בהכרח משפר Strategy.

---

# ‏239. Measure Incremental Value

‏השווה:

```text
Broad inexpensive feed
vs
Richer feed
```

‏על אותו experiment.

---

# ‏240. Data Ablation

‏הסר Quote/Depth/conditions ובדוק מה נשבר.

---

# ‏241. Feature Value per Data Cost

‏אפשר לחשוב על:

```text
incremental net edge / incremental data cost
```

---

# ‏242. אבל לא לייעל רק כסף

‏Reliability ו־operational risk חשובים גם הם.

---

# ‏243. Baseline לרובוט שלנו — שכבה 1

‏Whole-market stream עם Trades ו/או Second Aggregates.

---

# ‏244. Baseline — שכבה 2

‏NBBO Quotes אם ה־Score/Filter צריך Spread/Executability.

---

# ‏245. Baseline — שכבה 3

‏Top-N enrichment בלבד.

---

# ‏246. Baseline — שכבה 4

‏Broker-side validation לפני Order.

---

# ‏247. Baseline — שכבה 5

‏Historical dataset ברמת Fidelity דומה ל־Live.

---

# ‏248. מה לא נדרוש ב־MVP

‏לא נדרוש אוטומטית:

- ‏full L3 לכל השוק.
- ‏colocation.
- ‏כמה Vendors במקביל.
- ‏direct exchange connectivity.

---

# ‏249. מה כן נדרוש ב־MVP

- ‏Coverage מדיד.
- ‏Freshness מדידה.
- ‏Reconnect אמין.
- ‏Raw capture.
- ‏Historical replay.
- ‏Provider abstraction.
- ‏Data quality gates.

---

# ‏250. Provider Selection Experiment

‏במקום “איזה ספק הכי טוב?”, נגדיר experiment:

```text
Same day
Same universe
Same features
Same ranking cadence
Provider A vs Provider B
```

---

# ‏251. Outputs

```text
rank overlap
Top1 agreement
forward-return difference
freshness difference
processing lag
missing data
cost
```

---

# ‏252. Top-1 Agreement

```text
same_top1_pct
```

‏מדד מעניין מאוד לרובוט שלנו.

---

# ‏253. Top-N Overlap

‏אם שתי feeds שונות נותנות Top-10 כמעט זהה, ייתכן שה־extra data אינו משנה הרבה.

---

# ‏254. ואם הן שונות מאוד

‏צריך להבין למה לפני שבוחרים.

---

# ‏255. First Divergence Analysis

‏מצא event ראשון שבו Feature/Rank התפצלו בין Providers.

---

# ‏256. Provider RCA

‏זה מחבר ישירות לשלב 26.

---

# ‏257. Strategy Sensitivity to Feed

‏מערכת חזקה מדי ל־micro-differences יכולה להיות fragile.

---

# ‏258. Robustness Test

‏הוסף synthetic delay/drop קטן ובדוק אם ranking מתפרק.

---

# ‏259. Feed Noise

‏לא כל הבדל קטן צריך לשנות החלטה.

---

# ‏260. Hysteresis

‏גם כאן יכולה לעזור למנוע rank churn שמגיע מ־tiny feed differences.

---

# ‏261. `NO TRADE` על Data Uncertainty

‏זו תוצאה תקפה.

---

# ‏262. Data Confidence

‏אפשר לחשב מדד פנימי:

```text
coverage
freshness
gap_rate
provider_health
cross_source_agreement
```

---

# ‏263. אבל Confidence אינו תחליף ל־hard gates

‏תקלות קריטיות צריכות לעצור Entry.

---

# ‏264. Best Practice — Capture before Compute

‏Raw event נכנס ל־durable capture לפני/במקביל לעיבוד ככל שהארכיטקטורה מאפשרת.

---

# ‏265. Best Practice — Observe Queue Depth

‏Queue פנימי הוא market-data latency סמוי.

---

# ‏266. Best Practice — Separate Network from Processing Lag

```text
network/provider lag
processing lag
ranking lag
```

---

# ‏267. Best Practice — Version Everything

- ‏Provider.
- ‏Plan/feed.
- ‏Schema.
- ‏Parser.
- ‏Normalizer.
- ‏Feature engine.

---

# ‏268. Best Practice — Test at Market Open

‏לא רק בערב כשאין עומס.

---

# ‏269. Best Practice — Reconnect Drills

‏נתק בכוונה ב־Paper/Shadow.

---

# ‏270. Best Practice — Compare Live to Stored Replay

‏ה־Replay של מה שקיבלנו Live צריך לשחזר את אותה החלטה.

---

# ‏271. Anti-Pattern — Poll 4,000 Symbols One-by-One

‏בדרך כלל זו ארכיטקטורה חלשה ל־seconds scanner.

---

# ‏272. Anti-Pattern — Assume “Real-Time” Means Same Thing Everywhere

‏בדוק feed source, entitlement ו־latency בפועל.

---

# ‏273. Anti-Pattern — Use `Last` as Universal Truth

‏ל־execution צריך Quotes.

---

# ‏274. Anti-Pattern — Ignore Conditions

‏לא כל print הוא signal טוב.

---

# ‏275. Anti-Pattern — Mix Providers Without Metadata

‏כל event צריך לדעת מאיפה הגיע.

---

# ‏276. Anti-Pattern — Silent Failover

‏החלפת feed בלי סימון יכולה לשנות Strategy behavior בלי trace.

---

# ‏277. Anti-Pattern — Optimize to One Vendor Artifact

‏Feature שעובד רק בגלל quirk של provider מסוים הוא risk.

---

# ‏278. Anti-Pattern — Buy Depth Before Need

‏Depth מעניין אינו בהכרח predictive.

---

# ‏279. Anti-Pattern — Historical Bars for Microstructure Claims

‏אי אפשר להסיק queue/fill dynamics מ־1-minute bars.

---

# ‏280. Anti-Pattern — Data Health as Boolean

```text
connected = true
```

‏אינו מספיק.

---

# ‏281. Practitioner Secret — Data Quality is Part of Alpha

‏אם ה־Scanner מדרג מהר יותר ובנתונים טריים יותר, החלטותיו יכולות להשתנות גם בלי Feature חדש.

---

# ‏282. Practitioner Secret — More Data Can Hurt

‏יותר events = יותר noise, CPU, latency ומורכבות.

---

# ‏283. Practitioner Secret — Best Provider Can Depend on Layer

‏Vendor אחד יכול להיות מצוין ל־historical ticks ואחר מצוין ל־live NBBO.

---

# ‏284. Practitioner Secret — Feed Choice Changes Backtest Meaning

‏אם Feed Live שונה, ה־Backtest צריך לייצג אותו.

---

# ‏285. Practitioner Secret — Cross-Section Needs Synchronization

‏Scanner של 4,000 מניות רגיש לא רק לדיוק של Symbol יחיד אלא להשוואה הוגנת ביניהם באותו רגע.

---

# ‏286. Practitioner Secret — Candidate Enrichment is Powerful

‏Broad cheap data לכל השוק + rich expensive data למועמדים יכול להיות trade-off מצוין למחקר.

---

# ‏287. Practitioner Secret — Provider Benchmark is an Engineering Experiment

‏לא די לקרוא Pricing Page.

---

# ‏288. Practitioner Secret — Data Failures Look Like Strategy Failures

‏לכן Data RCA חייב להגיע לפני Score tweaking.

---

# ‏289. Checklist — לפני בחירת ספק

- ‏האם הכיסוי מתאים ל־Universe?
- ‏Trades זמינים?
- ‏NBBO Quotes זמינים?
- ‏איזה Feed source?
- ‏האם כל Symbols יכולים לזרום במקביל?
- ‏מה קורה ב־burst?
- ‏יש historical parity?
- ‏יש raw timestamps/conditions?
- ‏מה licensing?
- ‏מה העלות האמיתית?

---

# ‏290. Checklist — בזמן POC

- ‏מדוד P50/P95/P99 lag.
- ‏מדוד events/sec.
- ‏מדוד MB/sec.
- ‏מדוד fresh coverage.
- ‏בדוק reconnect.
- ‏בדוק פתיחה.
- ‏בדוק missing/gaps.
- ‏שמור raw sample.
- ‏הרץ replay.

---

# ‏291. Checklist — לפני Production

- ‏Provider Adapter tests עוברים.
- ‏Data contract מאומת.
- ‏Licensing נבדק.
- ‏Historical/Live parity נבדקה.
- ‏Data health dashboard קיים.
- ‏Alert על lag/gaps קיים.
- ‏Failover/degraded policy מוגדרים.
- ‏Raw capture קיים.

---

# ‏292. Baseline ארכיטקטוני לרובוט שלנו

```text
Broad Market Data Provider
        ↓
Canonical Normalizer
        ↓
Raw Event Store
        ↓
Feature Engine
        ↓
Whole-Market Ranker
        ↓
Top-N Enrichment
        ↓
Trade Decision
        ↓
Execution Broker Validation
        ↓
Order
```

---

# ‏293. החלטה שאיננו מקבלים עדיין

‏אנחנו **לא** בוחרים בפרק זה Provider סופי.

---

# ‏294. למה

‏בחירה נכונה דורשת benchmark על workload שלנו.

---

# ‏295. מה כן הוכחנו

‏המערכת חייבת להיות מסוגלת להחליף Provider.

---

# ‏296. ומה עוד הוכחנו

‏Feed רחב לשוק ו־Execution Broker יכולים להיות שני מוצרים שונים לחלוטין.

---

# ‏297. דוגמאות עדכניות שנבדקו — אוקטובר 2026

‏`Alpaca` מתעדת WebSocket feeds ל־`IEX`, ‏`SIP` ו־delayed SIP; התיעוד שלה מציין שה־free offering משתמש ב־IEX בעוד subscription רחב יותר יכול להשתמש ב־SIP.

‏`Massive` מתעדת streaming של Trades, ‏NBBO Quotes ו־Aggregates, כולל wildcard לכל tickers בערוצים מתאימים, וכן REST ו־bulk files.

‏`Databento` מציגה US-equities datasets הכוללים feeds שונים עם `L1/L2/L3` בהתאם ל־dataset.

‏`Nasdaq` ממשיכה להציע Direct feeds כגון `TotalView`, וב־2026 הודיעה גם על שינויים במוצרי Depth כחלק מהמעבר ל־23/5.

---

# ‏298. מקורות שנבדקו

‏המידע המסחרי/טכני העדכני בפרק נבדק מול:

- ‏Alpaca Market Data documentation.
- ‏Massive Stocks/WebSocket documentation.
- ‏Databento US Equities documentation.
- ‏Nasdaq Trader market-data product pages ו־2026 technical notices.
- ‏IBKR market-data documentation שכבר נותחה בשלב 30.

---

# ‏299. מבחן עצמי

‏אם ספק אומר “Real-Time US Stocks”, אילו שאלות אתה צריך לשאול לפני שאתה מניח שהוא מתאים לסריקת 4,000 מניות?

‏תשובה טובה צריכה להזכיר לפחות:

- ‏מקור ה־feed.
- ‏coverage.
- ‏Trades/Quotes.
- ‏consolidated מול venue-specific.
- ‏subscription limits.
- ‏burst throughput.
- ‏freshness.
- ‏historical parity.
- ‏licensing.

---

# ‏300. משפט לזכור

> ‏**Market Data הוא לא “מחיר שמגיע מהאינטרנט”. הוא contract של coverage, timing, semantics, quality ו־rights — וכל אחד מהם יכול לשנות את תוצאת האלגוריתם.**

---

# ‏השלב הבא

‏בשלב 32 נלמד לעומק את ההפרדה בין `Market Data` ל־`Execution`: איך שני ספקים שונים משתלבים בלי ליצור symbol mismatch, clock mismatch, price mismatch או dependency מסוכנת — ואיך בונים מערכת שבה החלפת ספק נתונים אינה משנה את מנוע המסחר כולו.
