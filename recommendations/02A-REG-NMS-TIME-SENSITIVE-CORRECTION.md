# ‏02A — Time-Sensitive Correction: Regulation NMS Status

> ‏מסמך זה הוא תיקון נקודתי ל־`02-US-MARKET-STRUCTURE.md` בעקבות אימות עדכני נוסף שבוצע ב־2026-10-26. במקרה של סתירה בנושא מועדי `Regulation NMS`, המסמך הזה גובר על הניסוח הישן ב־Sheet 02.

---

## ‏Correction

‏ב־`02-US-MARKET-STRUCTURE.md` נכתב כי תיקוני ה־SEC ל־minimum pricing increments ול־access-fee caps מתקרבים ל־compliance בתחילת נובמבר 2026.

‏זה אינו המצב העדכני.

### ‏Fact — verified 2026-10-26

‏ב־11 ביוני 2026 ה־SEC האריך את ה־temporary exemptive relief עבור:

- ‏`Rule 612` — amended minimum pricing increments.
- ‏`Rule 610(c)` — amended access-fee caps.
- ‏החלק הרלוונטי ב־`Rule 600(b)(89)(i)(F)`.

‏המועד המעודכן הוא:

```text
first business day of November 2027
```

‏לכן אין לבנות את ה־Baseline של 2026 כאילו tick size של `$0.005` או access-fee caps החדשים כבר נכנסים לתוקף בנובמבר 2026.

---

## ‏Engineering Consequence

‏ערכי tick size, protected-quote economics ו־venue fees חייבים להישאר configuration/time-sensitive facts ולא constants שמניחים rollout מסוים.

‏לפני כל מעבר ל־Live או מחקר execution שתלוי ב־tick economics יש לבצע אימות רשמי מחדש.

---

## ‏Related 2026 Market-Data Facts

### ‏Round-lot definition

‏הגדרת `round lot` החדשה של `Reg NMS Rule 600(b)(93)` יושמה בנובמבר 2025 והיא מבוססת מחיר:

```text
<= $250.00             => 100 shares
$250.01–$1,000.00      => 40 shares
$1,000.01–$10,000.00   => 10 shares
>= $10,000.01           => 1 share
```

‏השיוך מתעדכן לפי תקופות Evaluation מוגדרות.

### ‏Best Odd-Lot Order

‏ה־SIPs החלו להפיץ `BOLO` — best odd-lot order — ב־27 באפריל 2026.

‏עם זאת, דרישת ההפצה המלאה של יתר odd-lot information לפי MDI Rules קיבלה relief עד מאי 2028.

‏מכאן נובע שבמחקר 2026 יש להבחין בין:

```text
NBBO
best odd-lot order
best available displayed price
```

‏ולא להניח שהם תמיד אותו מחיר.

---

## ‏Official Verification Sources

- ‏`SEC — Statement Regarding Minimum Pricing Increments and Access Fee Caps`, 2026-06-11.
- ‏`SEC — Regulation NMS / Rule 600(b)(93)` round-lot implementation materials.
- ‏`SEC — Rule 605 FAQ`, updated 2026-04-01.
- ‏`SEC — 2026 proposed Rule 611 / locked-crossed-market release`, documenting BOLO dissemination beginning 2026-04-27 and the separate MDI odd-lot delay.

---

## ‏Status

```text
Correction date: 2026-10-26
Applies to: recommendations/02-US-MARKET-STRUCTURE.md
Reason: newer official SEC status supersedes the earlier compliance-date statement
```
