# ‏חלק 9A — Product-Specific / Out-of-Scope Advanced Orders

> ‏הפרק הזה משלים את Part 9. המטרה אינה להעמיק בכל Order שקיימת אצל Broker, אלא ללמד לזהות Advanced Order מקצועית גם כאשר היא **אינה Candidate למנוע US Stocks שלנו**.
>
> ‏`FACT` — עובדות `IBKR` תלויות־זמן בפרק זה נשענות על ה־review שאומת ב־`2026-10-27` מול התיעוד הרשמי של IBKR.

---

## ‏9A.1 למה צריך בכלל פרק Out-of-Scope

‏טעות נפוצה היא לחלק Orders לשתי קבוצות בלבד:

```text
supported
unsupported
```

‏זה גס מדי.

‏Order יכולה להיות:

```text
real broker capability
professionally relevant concept
but not applicable to our target product / strategy scope
```

‏לכן נשתמש במצב קנוני נוסף:

```text
CONCEPT_RELEVANT_PRODUCT_OUT_OF_SCOPE
```

‏המשמעות:

- ‏ה־Order קיימת וראוי להכיר אותה.
- ‏יש בה concept שיכול לחדד taxonomy או execution reasoning.
- ‏היא אינה נכנסת ל־Candidate Set של מנוע US Stocks הנוכחי.
- ‏אין צורך לממש, לבדוק או לקדם אותה ל־Production כל עוד scope המוצר לא השתנה.

---

## ‏9A.2 `Out-of-Scope` אינו `Unsupported`

‏נפריד:

```text
UNSUPPORTED
=> capability path שאינו זמין או שאינו מאומת עבור ה־scope המבוקש

CONCEPT_RELEVANT_PRODUCT_OUT_OF_SCOPE
=> capability אמיתית/מתועדת, אך product family או use case אינם בתוך scope המנוע
```

‏זו הבחנה חשובה ב־Capability Resolver.

‏אם בעתיד נוסיף Options או Futures, חלק מה־Orders כאן יכולות לעבור הערכה מחדש בלי לשנות את ה־taxonomy הבסיסית.

---

## ‏9A.3 Scope הנוכחי של המנוע

‏ה־scope של `Advanced Order Mastery` עבור המימוש המתוכנן הוא:

```text
primary product family = US Stocks / ETFs
short-horizon execution
IBKR execution path
advanced-order selection only when relevant to that execution problem
```

‏Order שמיועדת בעיקר ל־Options, multi-leg או Futures לא צריכה לקבל אותו עומק של Candidate שניתן באמת להכניס למנוע.

---

## ‏9A.4 טבלת Product-Specific / Out-of-Scope

| Order / Family | Product focus לפי ה־review המאומת | Concept ששווה ללמוד | סטטוס אצלנו |
|---|---|---|---|
| `Pegged-to-Stock` | Options-focused | repricing לפי reference של underlying stock | `CONCEPT_RELEVANT_PRODUCT_OUT_OF_SCOPE` |
| `Relative + Market` | Options / multi-leg-focused | שילוב reference-relative logic עם market-style execution component | `CONCEPT_RELEVANT_PRODUCT_OUT_OF_SCOPE` |
| `Trailing Relative + Market` | Options-focused | path-dependent trailing reference + relative/market execution behavior | `CONCEPT_RELEVANT_PRODUCT_OUT_OF_SCOPE` |
| `Market with Protection` | Futures / FOP-focused | urgent execution עם broker protection mechanism | `CONCEPT_RELEVANT_PRODUCT_OUT_OF_SCOPE` |
| `Stop with Protection` | Futures-only לפי ה־review | trigger + protected post-trigger execution | `CONCEPT_RELEVANT_PRODUCT_OUT_OF_SCOPE` |

> ‏`ENGINE RULE` — עצם קיום Order בקטלוג Broker אינו סיבה להוסיף אותה ל־Candidate Registry של Product אחר.

---

## ‏9A.5 `Pegged-to-Stock`

‏הערך הלימודי שלה הוא ה־concept:

```text
order behavior references another instrument / underlying stock
```

‏כלומר זו הרחבה של רעיון ה־Pegged:

```text
price is not static
price is derived from a reference relationship
```

‏אבל עבור מנוע US Stocks שלנו, אין הצדקה לבנות Candidate רק כדי “לתמוך בעוד Order Type”.

‏ה־nearest in-scope concepts שכבר למדנו הם:

```text
RELATIVE_PRIMARY
PEGGED_MIDPOINT_DIRECT
MIDPRICE
SNAP_* families
```

‏אלה **לא semantic equivalents**, אלא המשפחות הקרובות מבחינת dynamic reference-based pricing.

---

## ‏9A.6 `Relative + Market`

‏ה־review מצא שהמשפחה הזו מתועדת בהקשר Options/multi-leg ולכן אינה baseline למניות.

‏הערך הלימודי:

```text
one order name may combine
reference-relative behavior
+
market-style execution behavior
```

‏זה מחזק את ה־taxonomy שלנו: במקום ללמוד שם Broker כמושג אחד בלתי ניתן לפירוק, מפרקים אותו לצירים.

‏ב־US Stocks שלנו, אם הבעיה היא urgency + bounded price risk, נשווה Candidates שכבר נמצאות ב־scope כגון:

```text
MARKETABLE_LIMIT_IOC
SWEEP_TO_FILL_LIMIT
ADAPTIVE_LIMIT_URGENT
```

‏ולא נכניס Order options-focused רק משום שהשם נשמע “מתקדם יותר”.

---

## ‏9A.7 `Trailing Relative + Market`

‏כאן מופיעים יחד כמה concepts:

```text
path-dependent trigger/reference movement
relative pricing behavior
market-style execution component
```

‏מבחינה לימודית היא מועילה כדי להזכיר:

```text
Trailing
!=
Post-Trigger Primitive
!=
Reference Rule
```

‏אבל היא אינה Core או Research Challenger למנוע US Stocks שלנו.

‏ה־concepts הרלוונטיים כבר מכוסים בנפרד ב־Part 5 וב־Part 6/6A.

---

## ‏9A.8 `Market with Protection`

‏לפי ה־review המאומת, IBKR מתעדת `Market with Protection` עבור Futures/FOPs ולא כ־US-stock baseline.

‏ה־concept המקצועי שחשוב להבין:

```text
high execution urgency
+
broker-defined price protection behavior
```

‏אבל אסור להסיק:

```text
US stock Market order
==
Market with Protection
```

‏או:

```text
because broker uses protection logic somewhere,
our stock engine has the same primitive available
```

‏במנוע המניות שלנו נמשיך להפריד בין:

```text
MKT
marketable LMT
MARKETABLE_LIMIT_IOC
Economic Price Bound
broker price-management behavior
```

---

## ‏9A.9 `Stop with Protection`

‏לפי ה־review המאומת, IBKR מתעדת `Stop with Protection` כ־Futures-only.

‏הערך הלימודי הוא להראות שוב ש־Stop name לבדה אינה כל ה־semantics:

```text
Trigger Mechanism
+
Post-Trigger Execution
+
Protection Mechanism
```

‏אבל ב־US Stocks שלנו לא נכניס אותה ל־Protection architecture כאילו היא זמינה.

‏המשפחות הרלוונטיות אצלנו נשארות:

```text
Stop
Stop Limit
Bracket
STOP_BACKSTOP
HYBRID_PROTECTION
```

‏בכפוף ל־Capability evidence המתאים.

---

## ‏9A.10 למה `Nearest Alternative` אינה תחליף אוטומטי

‏לכל Order out-of-scope אפשר להצביע על concept קרוב, אבל:

```text
nearest conceptual alternative
!=
semantic substitute
```

‏לדוגמה:

```text
Market with Protection
```

‏אינה מוחלפת אוטומטית ב־:

```text
MARKETABLE_LIMIT_IOC
```

‏הן רק עשויות לפתור חלק מאותה בעיה כללית של urgency מול price risk באמצעים שונים.

‏לכן ה־Decision Engine אינה עושה mapping סמוי מ־out-of-scope Order ל־Candidate אחרת.

---

## ‏9A.11 Capability Resolver — הסטטוס הנכון

‏רשומת Capability יכולה לכלול למשל:

```text
concept_status = CONCEPT_RELEVANT_PRODUCT_OUT_OF_SCOPE
product_scope = OPTIONS | FUTURES | FOP | MULTI_LEG
engine_target_product = US_STOCK
candidate_eligible = false
production_enablement = NOT_APPLICABLE
```

‏זה עדיף על:

```text
supported = false
```

‏כי ה־reason נשמר.

---

## ‏9A.12 שינוי Scope בעתיד

‏אם בעתיד המנוע יתמוך ב־Options או Futures, אסור פשוט לשנות:

```text
candidate_eligible = true
```

‏נדרש מסלול מלא מחדש:

```text
re-read current broker documentation
validate exact product/route/API/account/session
materialize in adapter
paper acceptance
live-small acceptance if appropriate
failure-contract testing
production enablement
```

‏כלומר Out-of-Scope הוא לא “feature toggle כבוי”; הוא גבול מוצר.

---

## ‏9A.13 Failure Mode: זיהוי שם Order כיכולת אוניברסלית

‏תרחיש שגוי:

```text
Broker catalog contains order X
→ engine candidate registry includes X
→ runtime discovers target stock path does not accept X
→ fallback becomes more aggressive order
```

‏התגובה הקנונית:

```text
product/path mismatch detected before selection
→ candidate filtered out
→ reason_code = PRODUCT_SCOPE_MISMATCH
→ fresh decision among in-scope survivors
```

‏אין hidden fallback.

---

## ‏9A.14 Reason Codes מוצעים

```text
PRODUCT_SCOPE_MISMATCH
CONCEPT_RELEVANT_PRODUCT_OUT_OF_SCOPE
ROUTE_SCOPE_MISMATCH
API_PATH_NOT_VALIDATED
ACCOUNT_OR_SESSION_NOT_VALIDATED
PARAMETER_COMBINATION_NOT_VALIDATED
```

‏Reason codes אלו עוזרים להבדיל בין:

```text
not useful
not supported
not validated
not applicable to this product
```

---

## ‏9A.15 Acceptance Tests

```text
1. Out-of-scope order never enters the live Candidate Set for US Stocks.
2. Out-of-scope status is not collapsed into generic UNSUPPORTED.
3. Capability failure never auto-enables a conceptually similar substitute.
4. Product-scope change requires fresh capability evidence.
5. Research reports may reference out-of-scope concepts without enabling them.
6. Candidate Registry records a reason when a product-specific family is filtered out.
7. Same product/account/API/route scope yields deterministic eligibility classification.
8. Broker catalog presence alone never yields PRODUCTION_ENABLED.
```

---

## ‏9A.16 Practitioner Insight

> ‏`ENGINE RULE` — Professional depth אינה נמדדת לפי מספר Order Types שהמנוע “תומך” בהן.

‏מערכת מקצועית יודעת גם לומר:

```text
I know what this order is.
I understand the execution concept.
It is not applicable to the product scope I am trading.
Therefore it is intentionally excluded.
```

‏זו החלטת Architecture טובה יותר מאשר להכניס כל capability של Broker ל־Production Candidate Set.

---

# ‏מקורות לקביעה של Product Scope

- ‏`advanced-orders/review/02-PROFESSIONAL-DEPTH-MISSING-ADVANCED-ORDER-CONCEPTS.md`
- ‏IBKR — Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>

---

# ‏Checkpoint — סוף חלק 9A

‏הוספנו שכבת Product Scope מפורשת. `Pegged-to-Stock`, ‏`Relative + Market`, ‏`Trailing Relative + Market`, ‏`Market with Protection` ו־`Stop with Protection` מוכרות כ־Advanced Orders אמיתיות/רלוונטיות מקצועית, אבל אינן Candidates למנוע US Stocks הנוכחי. במקום `unsupported` גס, הן מקבלות `CONCEPT_RELEVANT_PRODUCT_OUT_OF_SCOPE`, עם reason code ו־Capability scope מפורשים.