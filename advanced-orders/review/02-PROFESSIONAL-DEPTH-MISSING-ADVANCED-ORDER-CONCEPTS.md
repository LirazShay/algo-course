# ‏Review 2 — Professional Depth and Missing Advanced-Order Concepts

> ‏סקירה שנייה מתוך סדרת Reviews לקורס `Advanced Order Mastery`.
>
> ‏מטרת השלב הזה אינה לתקן את הקורס, אלא לבדוק אם חסרים Order Types, ‏execution semantics, ‏failure modes או distinctions מקצועיים שנדרשים דווקא לקורס על **פקודות מתקדמות**.
>
> ‏Scope מפורש: לא מרחיבים כאן לנושאי Market Data, ‏Auctions, ‏LULD, ‏Scanner או Microstructure כללית, אלא רק כאשר הם משנים ישירות את semantics או lifecycle של Order מתקדמת.
>
> ‏אימות עובדות IBKR תלויות־זמן: `2026-10-27`.

---

# ‏1. מסקנה ראשית

‏הליבה של הקורס חזקה מאוד: `Pegged`, ‏`Relative`, ‏`MidPrice`, ‏`Snap`, ‏`Post Only`, ‏`Hidden`, ‏`Reserve/Iceberg`, ‏Stops, ‏Trailing, ‏Bracket, ‏OCA, ‏Conditional, ‏Routing, ‏Broker Algos, ‏Cancel/Replace, ‏Capability Matrix ו־Decision Engine כבר מכוסים בעומק גבוה.

‏כלומר אין צורך להרחיב את הקורס לעשרות Order Types רק כדי להיות "אנציקלופדיה".

‏עם זאת, נמצאו כמה **חוסרים ישירים בעולם Advanced Orders** שכדאי להכניס לפני הסגירה, בעיקר משום שהם משלימים distinctions שהקורס כבר בונה:

```text
P0/P1 candidates:
- Sweep-to-Fill
- Discretionary Order
- Market-to-Limit
- Market-if-Touched / Limit-if-Touched
- Trailing MIT / Trailing LIT as concise extensions
- explicit taxonomy of trigger direction vs execution behavior
- explicit separation of visible price vs hidden executable discretion
- explicit aggressive-multi-venue family comparison
```

‏בנוסף נמצאו כמה Order Types מתקדמים שקיימים ב־IBKR אך **לא צריכים לקבל פרק עמוק** אצלנו, מפני שהם options/futures-specific או אינם מתאימים ל־US-stock short-horizon engine.

---

# ‏2. כלל Scope מתוקן — לא כל Order Type שקיימת ב־IBKR חייבת להיכנס

‏כדי להימנע מבלאגן, כל candidate חדש צריך לעבור שלושה Gates:

```text
1. Is it genuinely an advanced-order concept?
2. Is it relevant to stocks / ETFs or to understanding our execution model?
3. Does it teach a new execution idea not already covered elsewhere?
```

‏אם התשובה השלישית היא `NO`, עדיף cross-reference קצר ולא פרק חדש.

‏אם ה־Order היא options/futures-only ואין לה ערך conceptual חדש למנוע שלנו, היא צריכה להופיע לכל היותר ב־`Out-of-Scope / Product-Specific` table.

---

# ‏3. ממצא `P0` — חסרה `Sweep-to-Fill`

‏זה החוסר המקצועי המשמעותי ביותר שמצאתי ב־Advanced Order Mastery.

‏IBKR מתעדת `Sweep to Fill` עבור Stocks/ETFs בארה״ב, דרך `SMART`, כאשר המטרה היא להעדיף מהירות ביצוע: המערכת מזהה כמה נזילות זמינה בכל מחיר ושולחת בו־זמנית portions של Order למספר destinations כדי לקחת את הכמות הזמינה בכמה רמות/venues.

‏ב־TWS API קיים גם השדה:

```text
sweepToFill
```

‏כלומר זה אינו רק UI trick; ה־Order model מכיר את ההתנהגות.

## ‏למה זה חסר דווקא אצלנו

‏יש לנו כבר דיון עמוק ב־:

```text
Marketable Limit
IOC
SMART
Adaptive
aggressiveness
hard price cap
multi-venue routing
```

‏אבל חסר candidate שמייצג במפורש:

```text
I value immediate liquidity strongly,
and I am willing to consume across destinations,
but I still want an explicit Limit boundary.
```

## ‏מה צריך להוסיף בתיקון עתידי

‏לא רק הגדרה, אלא comparison:

```text
Sweep-to-Fill
vs
Marketable Limit + IOC
vs
plain SMART marketable Limit
vs
Adaptive Urgent
```

‏שאלות שחייבות לקבל תשובה:

```text
Who decides the venue split?
Can the order rest?
What happens to unfilled remainder?
How does the hard limit constrain the sweep?
Does splitting across venues increase execution certainty?
What telemetry do we need per venue/fill?
What is the API/platform availability?
```

## ‏רלוונטיות למנוע שלנו

‏`High Challenger`, לא Baseline אוטומטי.

‏היא מעניינת במיוחד ל־`FAST_ENTRY` או `FAST_EXIT` כאשר urgency גבוהה וה־Order size גדולה מספיק ביחס ל־top-of-book, אך היא צריכה acceptance tests של route/fill behavior לפני Production.

---

# ‏4. ממצא `P0/P1` — חסרה `Discretionary Order`

‏IBKR מתעדת `Discretionary` עבור US Stocks/ETFs, ‏`TWS Only`, ‏`SMART`.

‏הרעיון מקצועית חשוב מאוד:

```text
visible limit price
+
hidden discretionary amount
=
wider executable range than the displayed price suggests
```

‏לדוגמה רעיונית:

```text
displayed BUY limit = 64.10
discretionary amount = 0.10
```

‏השוק רואה את ה־64.10, אבל ה־Order יכולה להיות eligible לביצוע במחיר אגרסיבי יותר בתוך טווח ה־discretion.

‏ב־TWS API קיים:

```text
discretionaryAmt
```

## ‏למה זה חשוב לקורס

‏כבר הסברנו לעומק:

```text
Hidden size
Reserve size
Post Only
Pegged repricing
```

‏אבל חסר distinction אחר לגמרי:

```text
hide quantity
```

‏לעומת:

```text
hide willingness-to-pay / willingness-to-sell
```

‏`Discretionary` מלמדת בדיוק את ההבדל הזה.

## ‏השוואה שחסרה

```text
Discretionary
vs
Hidden
vs
Reserve/Iceberg
vs
Relative/Pegged-to-Primary
vs
Marketable Limit
```

‏`Discretionary` אינה Peg; היא לא בהכרח משנה את displayed limit עם השוק.

‏והיא אינה Hidden Order; היא יכולה להציג price מסוים אבל לשמור hidden execution discretion מעבר אליו.

## ‏רלוונטיות למנוע שלנו

‏`Medium/High Research Value`.

‏לא בהכרח Candidate ראשון ל־Production, אבל מקצועית היא חשובה מספיק כדי שקורס Advanced Orders לא ידלג עליה.

---

# ‏5. ממצא `P1` — חסרה `Market-to-Limit (MTL)`

‏IBKR מתעדת `Market-to-Limit` עבור Stocks/ETFs ומוצרים נוספים, ב־`SMART` וב־Direct routing.

‏ה־semantics מעניינת:

```text
submit as market
→ immediate partial/full execution at current best market price
→ if partially filled, cancel remainder
→ resubmit remainder as Limit
   at the price of the executed portion
```

## ‏למה זה חשוב מקצועית

‏זהו hybrid ברור בין:

```text
aggressive immediate execution
```

‏לבין:

```text
controlled passive remainder
```

‏וזה בדיוק סוג ה־execution transformation שהקורס צריך ללמד.

## ‏ההשוואה שחסרה

```text
Market-to-Limit
vs
Marketable Limit
vs
Marketable Limit + IOC
vs
Market
```

‏הבדל מרכזי:

- ‏`IOC` בדרך כלל מבטלת remainder שלא בוצעה מיד.
- ‏`MTL` יכולה להפוך את remainder ל־Limit במחיר שנגזר מה־Fill הראשון.

‏למנוע קצר־טווח זה יכול להיות גם יתרון וגם סיכון: remainder יכולה להישאר חיה אחרי שה־signal כבר השתנה.

## ‏רלוונטיות למנוע שלנו

‏`Medium Challenger`.

‏צריך להדגיש במיוחד:

```text
application TTL still required
stale remainder risk
partial-fill transition must enter state machine
```

---

# ‏6. ממצא `P1` — חסרה משפחת `Market-if-Touched / Limit-if-Touched`

‏הקורס מכסה Stop לעומק, אך כמעט כל ה־trigger discussion בנויה סביב trigger שנמצא בצד ה"רע" של Position/price movement.

‏`Market-if-Touched (MIT)` ו־`Limit-if-Touched (LIT)` משלימות את ה־mental model:

```text
Stop-style trigger direction
!=
Touched-style trigger direction
```

‏באופן כללי:

```text
Stop BUY      -> trigger above market
MIT BUY       -> trigger below market
Stop SELL     -> trigger below market
MIT SELL      -> trigger above market
```

‏לאחר trigger:

```text
MIT -> Market-style execution
LIT -> Limit-style execution
```

## ‏למה זה חשוב גם אם לא נשתמש בזה הרבה

‏המשפחה הזאת מאפשרת ללמד שתי שאלות בנפרד:

```text
WHEN should the order activate?
WHAT execution behavior should happen after activation?
```

‏וזה אחד ה־mental models החשובים ביותר בכל Advanced Orders.

## ‏רלוונטיות למנוע שלנו

‏`Low/Medium` ל־baseline, אבל `High Educational Value`.

‏לא צריך עשרות סעיפים; פרק קומפקטי שמשווה Stop/MIT/LIT מספיק.

---

# ‏7. ממצא `P2` — `Trailing MIT` ו־`Trailing LIT` ראויות לפחות ל־extension קצר

‏IBKR מציגה גם:

```text
Trailing Market if Touched
Trailing Limit if Touched
```

‏הן משלבות:

```text
moving trigger
+
MIT/LIT direction semantics
```

‏אין הצדקה לתת להן עומק כמו `Trailing Stop`, אבל קורס Advanced Orders צריך לפחות להראות שה־Trailing concept אינו שייך רק ל־Stops.

## ‏תיקון עתידי מוצע

‏להוסיף subsection קצר:

```text
Trailing Trigger Families:
- Trailing Stop
- Trailing Stop Limit
- Trailing MIT
- Trailing LIT
```

‏וללמד את axis המשותף:

```text
trigger direction
trigger ratchet
post-trigger execution type
```

---

# ‏8. ממצא `P0` רעיוני — חסרה Taxonomy דו־ממדית של Trigger מול Execution

‏חלק 6 כבר מפריד היטב בין Trigger, Dependency ו־Mutual Exclusion.

‏אבל לאחר מציאת MIT/LIT ברור שאפשר לשפר עוד את ה־mental model.

‏במקום לזכור שמות, צריך לבנות מטריצה:

| Trigger mechanism | After trigger |
|---|---|
| ‏Stop | ‏Market |
| ‏Stop Limit | ‏Limit |
| ‏MIT | ‏Market |
| ‏LIT | ‏Limit |
| ‏Trailing Stop | ‏Market after ratcheting stop trigger |
| ‏Trailing Stop Limit | ‏Limit after ratcheting stop trigger |
| ‏Trailing MIT | ‏Market after trailing touched trigger |
| ‏Trailing LIT | ‏Limit after trailing touched trigger |

‏המטרה אינה להוסיף שמות לשינון אלא להראות שהרבה Order Types הן compositions של primitives.

‏זה מתאים מאוד לרוח הקורס:

```text
Order = Price Policy + Trigger Policy + Fill Policy + Time Policy + Routing Policy
```

---

# ‏9. ממצא `P1` — חסר Axis מפורש של `Displayed Price` מול `Executable Price Range`

‏לאחר `Discretionary`, יש ארבעה דברים שקל לבלבל ביניהם:

```text
displayed price
effective executable price range
hard economic cap
reference/peg-derived current price
```

‏אלה אינם אותו דבר.

‏כדאי להוסיף conceptual table:

| Family | What market sees | What can execute | Who moves price |
|---|---|---|---|
| ‏Plain Limit | ‏Limit | ‏Limit or better | ‏Fixed unless modified |
| ‏Discretionary | ‏Displayed Limit | ‏Wider hidden discretion range | ‏Broker/venue eligibility logic |
| ‏Relative/Pegged | ‏Dynamic working price | ‏Within cap/offset semantics | ‏Peg formula |
| ‏Hidden | ‏No displayed order price/size in normal book view | ‏Working hidden price | ‏Depends on order policy |

‏זה יסגור פער חשוב בין Visibility Policy לבין Price Policy.

---

# ‏10. ממצא `P1` — חסרה משפחת `Aggressive Multi-Venue Execution` כמושג

‏כרגע `SMART`, ‏Marketable Limit ו־Routing נלמדים בפרקים שונים.

‏`Sweep-to-Fill` מראה שיש family רחבה יותר:

```text
AGGRESSIVE MULTI-VENUE EXECUTION
```

‏שאלות מקצועיות:

```text
Do we take only top-of-book?
Do we allow multiple venues simultaneously?
Do we walk multiple price levels?
What is the limit boundary?
Can a remainder rest?
Does broker routing continue after the first wave?
```

‏זה צריך להיות mental model קצר, לא פרק Microstructure כללי.

---

# ‏11. ממצא `P1` — חסר Lifecycle comparison ל־Orders שעוברות Transformation

‏כבר יש לנו transformation ב־Adjustable Stop וב־Bracket lifecycle.

‏`Market-to-Limit` מוסיפה דוגמה אחרת:

```text
one order intent
→ first execution behavior
→ state transition
→ different remainder behavior
```

‏צריך לאחד את הרעיון:

```text
STATIC ORDER
DYNAMIC REPRICING ORDER
TRIGGERED ORDER
TRANSFORMING ORDER
DEPENDENT ORDER GROUP
```

‏כך הקורא יבין ש־advanced orders שונות לא רק במחיר אלא גם ב־lifecycle topology.

---

# ‏12. ממצא `P1` — חסר `Unsupported / Irrelevant Advanced Orders` section מפורש

‏יש כמה Order Types שנראות מתקדמות מאוד, אבל אינן רלוונטיות ל־US-stock engine שלנו.

‏כדאי לציין אותן כדי שהקורא לא יחשוב ששכחנו אותן.

## ‏דוגמאות

### ‏`Pegged-to-Stock`

‏IBKR מתעדת אותה כ־Options Only.

‏לכן אין הצדקה לפרק עמוק בקורס שמכוון למניות US.

### ‏`Relative + Market`

‏מתועדת עבור Options/multi-leg combinations, ולכן אינה baseline למניות.

### ‏`Trailing Relative + Market`

‏גם היא options-focused.

### ‏`Market with Protection`

‏IBKR מתעדת אותה עבור Futures/FOPs, לא כמנגנון US-stock baseline.

### ‏`Stop with Protection`

‏IBKR מתעדת אותה כ־Futures Only.

‏הפתרון אינו ללמד כל אחת לעומק, אלא table קצר:

```text
Order Type
Product limitation
Why excluded from stock-focused deep dive
Conceptual relation to covered family
```

---

# ‏13. ממצא `P1` — `Capability Matrix` צריכה לכלול גם "Concept Present, Product Excluded"

‏כיום Capability Matrix חזקה מאוד ב־supported/not supported וב־production gates.

‏אחרי Review 2 כדאי להוסיף מצב נוסף:

```text
CONCEPT_RELEVANT_PRODUCT_OUT_OF_SCOPE
```

‏לדוגמה:

```text
Pegged-to-Stock
concept = dynamic reference-based repricing
product = options only
our stock engine = excluded
```

‏כך הקורס לא משדר בטעות "לא קיים" כאשר בפועל הוא פשוט לא רלוונטי למוצר שלנו.

---

# ‏14. ממצא `P1` — צריך להוסיף `Nearest Alternative` לכל Order advanced חדשה

‏במיוחד עבור החוסרים החדשים:

```text
Sweep-to-Fill
nearest alternatives:
  Marketable Limit + IOC
  SMART marketable Limit
  Adaptive Urgent

Discretionary
nearest alternatives:
  Relative/Pegged-to-Primary
  plain Limit
  Hidden / Reserve (different dimension)

Market-to-Limit
nearest alternatives:
  Marketable Limit
  Marketable Limit + IOC
  Market

MIT/LIT
nearest alternatives:
  Stop / Stop Limit
  local conditional trigger + ordinary order
```

‏זה הרבה יותר חשוב מרשימת API fields בלבד.

---

# ‏15. ממצא `P1` — צריך להבחין בין Broker Convenience לבין Execution Primitive

‏לא כל Order Type מתקדמת מוסיפה primitive חדש.

‏חלק הן compositions/automation של primitives שכבר אפשר ליישם client-side.

‏לכל Order משפחה כדאי לשאול:

```text
What primitive does this add?
Could our engine synthesize it client-side?
If yes, what do we gain by broker-resident implementation?
What control do we lose?
Does broker residency improve failure tolerance?
Does it create opaque behavior?
```

‏זה חשוב במיוחד ל־:

```text
MIT / LIT
Trailing variants
Market-to-Limit
Bracket
Conditional
Adaptive
```

---

# ‏16. ממצא `P1` — חסרה טבלת `Where the Intelligence Lives`

‏כדאי שבסוף Advanced Orders תהיה טבלה:

| Family | Client | TWS/IBKR | Venue |
|---|---|---|---|
| ‏Static Limit | ‏Chooses price | ‏Transmits/routes | ‏Matches |
| ‏Relative/Pegged | ‏Chooses formula/cap | ‏May manage/reprice | ‏May natively peg |
| ‏Snap | ‏Chooses parameters | ‏Computes once | ‏Receives resulting Limit |
| ‏Discretionary | ‏Chooses displayed limit + discretion | ‏Routes/handles eligibility | ‏Venue behavior may participate |
| ‏Sweep-to-Fill | ‏Chooses qty/cap | ‏SMART splits/routs | ‏Multiple venues execute |
| ‏Bracket | ‏Defines dependency | ‏Holds/transmits relationships | ‏Individual children execute |
| ‏Client-managed conditional | ‏Owns trigger | ‏Receives ordinary order | ‏Executes order |

‏הקורס כבר מלמד את הרעיון, אבל טבלה אחת תסגור אותו היטב.

---

# ‏17. ממצא `P2` — Advanced Reject / Precaution handling ראוי להזכר בהקשר Orders

‏TWS API Order model כולל גם fields הקשורים ל־advanced rejection / constraints, למשל `advancedErrorOverride` ו־`whatIf`.

‏לא צריך להפוך זאת לפרק API כללי.

‏אבל בקורס Advanced Orders חשוב להסביר:

```text
Order semantics valid in our model
!=
Broker accepts this exact combination
```

‏ולכן:

```text
complex attribute combination rejected
→ do not blindly downgrade to Market
→ classify rejection
→ update capability evidence
→ rerun decision
```

‏הבסיס כבר קיים בחלקים 8–10; התיקון העתידי הוא cross-reference ממוקד, לא תוכן גדול חדש.

---

# ‏18. ממצא `P2` — `GoodAfterTime` / activation scheduling יכולה לקבל cross-reference קצר

‏TWS API תומכת `goodAfterTime` לצד TIF fields.

‏זו אינה Order Type חדשה, אבל היא Advanced activation policy.

‏מאחר שהקורס כבר מפריד `Time Policy` מ־`Trigger Policy`, אפשר להוסיף distinction קצר:

```text
GoodAfterTime = time-based activation
Condition      = predicate-based activation
MIT/Stop       = price-event activation
```

‏אין צורך להרחיב מעבר לזה עבור המנוע שלנו.

---

# ‏19. דברים שנבדקו ואינם Gap משמעותי

‏הנושאים הבאים כבר מכוסים מספיק עמוק ואין הצדקה להוסיף להם עוד פרקים רק כדי להגדיל נפח:

```text
Market / Limit / Marketable Limit
IOC / FOK / AON / MinQty
Post Only
Hidden / Reserve / Iceberg
Relative / Pegged-to-Primary
Pegged-to-Midpoint
MidPrice
Snap family
IBKR ATS pegged orders
Pegged-to-Benchmark
Stop / Stop Limit
Trailing Stop / Trailing Stop Limit
Adjustable Stop
Bracket
OCA/OCO
Conditional Orders
SMART / Direct Routing
Adaptive
Broker algos overview
Cancel/Replace
Execution State Machine
Capability Matrix
Entry / Exit decision engine
```

‏בתיקונים עתידיים צריך בעיקר לשפר `Why / When / Why Not`, comparisons ו־cross references שלהם, לא להמציא עוד עומק מלאכותי.

---

# ‏20. Priority List שנכנס ל־Final Gap List

## ‏`P0 — must add / strengthen`

```text
1. Sweep-to-Fill deep subsection
2. Discretionary Order deep subsection
3. Trigger-vs-Execution taxonomy including MIT/LIT
4. Aggressive multi-venue comparison
```

## ‏`P1 — should add`

```text
5. Market-to-Limit
6. MIT / LIT comparison
7. Displayed price vs hidden executable discretion
8. Transforming-order lifecycle taxonomy
9. Out-of-scope advanced-order table
10. Where-the-intelligence-lives table
11. Nearest Alternative cards
```

## ‏`P2 — concise completeness additions`

```text
12. Trailing MIT / Trailing LIT
13. GoodAfterTime vs price/condition triggers
14. Advanced rejection cross-reference
```

---

# ‏21. Repair Strategy בעקבות ההחלטה החדשה

‏התיקונים לא יבוצעו על הקובץ הענק ישירות.

‏בשלב ה־Repair:

```text
split existing master into chapter files
→ repair each chapter independently
→ add missing advanced-order chapters/cards
→ validate chapter order via manifest
→ deterministic assembler rebuilds master
→ print viewer consumes same manifest/source set
```

‏ה־assembler צריך להיות deterministic:

```text
same source files
+ same manifest
= byte-stable logical chapter order
```

‏כך ה־master הופך ל־build artifact ולא ל־קובץ שעורכים ידנית שוב ושוב.

---

# ‏22. מקורות רשמיים שנבדקו ל־Review 2

- ‏IBKR — Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>

‏עובדות שנבדקו מהמקורות האלו כוללות בין היתר את קיום/מגבלות `Sweep-to-Fill`, ‏`Discretionary`, ‏`Market-to-Limit`, ‏`MIT`, ‏`LIT`, ‏Trailing MIT/LIT, ‏`Pegged-to-Stock`, ‏`Market with Protection`, ‏`Stop with Protection`, וכן fields כגון `sweepToFill` ו־`discretionaryAmt`.

---

# ‏Checkpoint — סוף Review 2

‏Review 2 מצא שחסר לקורס **מספר קטן וממוקד** של Advanced Orders אמיתיות — לא נושאי שוק כלליים.

‏הפער המרכזי הוא לא "עוד עשרות שמות", אלא ארבעה mental models שעדיין אינם שלמים:

```text
hidden execution discretion
aggressive multi-venue sweep
trigger direction vs post-trigger execution
order transformation after partial execution
```

‏ה־Review הבא צריך לבדוק **Why / When / Why Not + comparisons + examples** לאורך כל משפחות ה־Advanced Orders, בלי להתחיל עדיין תיקונים.