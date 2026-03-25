# Personal Finance Tracker — Complete Requirements & Mental Model

> **Purpose of this document:** This is the complete, finalized specification for a personal finance tracker application. It contains the mental model, all entity definitions, relationships, data flow, features, and reporting requirements. Use this document as the single source of truth when building the backend, designing the database schema, and developing the frontend.

---

## Table of Contents

1. [Project Background & Goals](#1-project-background--goals)
2. [The Core Mental Model](#2-the-core-mental-model)
3. [The Five-Bucket System](#3-the-five-bucket-system)
4. [The Three-Level Hierarchy](#4-the-three-level-hierarchy)
5. [How Money Moves — The Four Actions](#5-how-money-moves--the-four-actions)
6. [The Operating Cycle](#6-the-operating-cycle)
7. [Complete Entity Definitions](#7-complete-entity-definitions)
8. [Entity Relationships](#8-entity-relationships)
9. [The Alert System](#9-the-alert-system)
10. [Complete Feature List](#10-complete-feature-list)
11. [Reporting Requirements](#11-reporting-requirements)
12. [Key Design Decisions & Reasoning](#12-key-design-decisions--reasoning)
13. [Complete Table Reference](#13-complete-table-reference)
14. [Day-to-Day Usage Guide](#14-day-to-day-usage-guide)

---

## 1. Project Background & Goals

### Who This Is For

A junior software engineer with a variable income (salary + occasional freelance). Lives sometimes at home, sometimes in another city — which means cost of living changes month to month. Has tried Excel, Notion, and various apps before but failed due to lack of a clear mental model, not due to lack of tools.

### What This App Must Solve

- Track all money movement (expenses, income, transfers, investments) manually — **no bank API sync**
- Show accurate account balances derived entirely from logged transactions
- Support a **variable monthly budget** that changes every month based on context
- Track financial goals with specific targets and deadlines
- Track investment portfolio with contributions vs market value
- Generate detailed reports at weekly, monthly, quarterly, and yearly intervals
- Fire automatic alerts and warnings before problems become serious

### What This App Must NOT Do

- Connect to any real bank account or payment system
- Store fixed budget limits on categories (budgets are monthly and flexible)
- Treat transfers between accounts as expenses or income
- Require complex setup — must be usable within 10 minutes of first open

### Long-Term Goal

Achieve financial freedom in 10–20 years through consistent tracking, disciplined investing, and data-driven financial decisions.

---

## 2. The Core Mental Model

### The Fundamental Equation

```
Income − Savings = Expenses        ← WRONG (how most people think)
Income − Savings − Investments = Expenses   ← RIGHT (how this system works)
```

The key shift: **money is assigned a destination before it is spent**, not after. Every rupee that arrives has a job. You don't save what's left — you spend what remains after saving and investing.

### The Three Modes of the Application

The app operates in three distinct modes that form a monthly cycle:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   PLANNING MODE          LOGGING MODE         REVIEW MODE  │
│   (before month)    →   (during month)   →   (end of month)│
│                                                             │
│   Decide where           Record what           Compare plan │
│   money will go          actually happens      vs reality   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Most people only use logging mode. The power of this system is the **tension between plan and reality** — that gap is where all the insight lives.

### The Mental Model Visual

```
                         INCOME
                    (arrives variably)
                           │
                           ▼
                    ┌─────────────┐
                    │ MONTHLY     │  ← You decide allocations
                    │ PLAN        │    before month starts
                    │ (5 buckets) │
                    └─────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
       NEEDS          INVESTMENTS        SAVINGS
     CHARITY            (wealth)       EMERGENCY
      FLEX              building          GOALS
   (spending)                          (security)
          │                │                │
          ▼                ▼                ▼
     Expenses        Portfolio         Goal progress
     tracked by      snapshots         tracked by
     category        monthly           transfer logs
     & subcategory
          │
          ▼
     REPORTS
  (weekly / monthly /
   quarterly / yearly)
```

---

## 3. The Five-Bucket System

Buckets are the **top-level mental containers** for money. Budget is allocated at the bucket level — not at the category level. This is the only level where budget limits exist.

### Bucket Definitions

| Bucket          | Purpose                                                             | Budget Behavior                                     |
| --------------- | ------------------------------------------------------------------- | --------------------------------------------------- |
| **NEEDS**       | Rent, food, transport, utilities, healthcare, personal care         | Set monthly — changes when living situation changes |
| **INVESTMENTS** | SIPs, mutual funds, stocks, any wealth-building vehicle             | Set monthly — ideally 20%+ of income                |
| **SAVINGS**     | Emergency fund top-up, MacBook fund, travel fund, other named goals | Set monthly                                         |
| **CHARITY**     | Zakat, Sadaqah, donations                                           | Set monthly — treated as non-negotiable like a bill |
| **FLEX**        | Dining out, subscriptions, entertainment, shopping, Claude Pro      | What remains — guilt-free spending zone             |

### Bucket Allocation Rule

When creating a monthly plan, the five bucket allocations **must sum to the expected income**. The app validates this and will not allow saving a plan that doesn't balance.

```
NEEDS + INVESTMENTS + SAVINGS + CHARITY + FLEX = Expected Income
```

### Why Bucket-Level Budgeting (Not Category-Level)

Setting a budget for individual categories like Food, Transport, Rent is too granular and too rigid. When you live at home, your food cost changes. When you commute differently, transport changes. Budgeting at the bucket level (NEEDS = Rs. 42,000) gives you discipline without over-engineering. You then use category reporting to understand _how_ you spent within a bucket — not to police it.

---

## 4. The Three-Level Hierarchy

This is the core organizational structure for classifying all spending and income. It has three levels with very different roles.

```
Level 1: BUCKET          Level 2: CATEGORY        Level 3: SUBCATEGORY
(budget lives here)      (tracking & insight)     (pure metadata)

NEEDS               →    Food              →    Groceries
                                           →    Dining Out
                    →    Transport         →    Careem / Uber
                                           →    Fuel
                                           →    Public Transport
                    →    Rent              →    (none needed)
                    →    Utilities         →    Electricity
                                           →    Internet
                    →    Healthcare        →    Doctor
                                           →    Pharmacy
                    →    Personal Care     →    Haircut
                                           →    Grooming

FLEX                →    Entertainment     →    Netflix
                                           →    Spotify
                                           →    Gaming
                    →    Subscriptions     →    Claude Pro
                                           →    Notion
                                           →    Cloud / Dev Tools
                    →    Dining Out        →    Lunch
                                           →    Dinner
                                           →    Cafe / Coffee
                    →    Shopping          →    Clothes
                                           →    Tech / Gadgets
                    →    Travel            →    Flights
                                           →    Hotels

INVESTMENTS         →    Mutual Fund       →    Meezan Fund
                                           →    Faysal Fund
                    →    Stocks            →    PSX
                    →    Gold              →    (none needed)

SAVINGS             →    Goal Contribution →    Emergency Fund
                                           →    MacBook Pro
                                           →    Murree Trip

CHARITY             →    Zakat             →    (none needed)
                    →    Sadaqah           →    (none needed)
                    →    Donations         →    Specific cause
```

### Role of Each Level

**Bucket:** Where budget discipline happens. Alerts fire here. Monthly plan allocates here.

**Category:** Where insight happens. You see "I spent Rs. 18,000 on Food this month." No budget limit, no alert — just information. Belongs to exactly one bucket.

**Subcategory:** Where curiosity is satisfied. You see "Rs. 11,200 of my Food spend was groceries and Rs. 6,800 was dining out." Pure metadata — always computed, never configured with limits. Belongs to exactly one category.

---

## 5. How Money Moves — The Four Actions

Every money event in your life maps to exactly one of these four actions. Nothing else exists.

### Action 1: Log Expense

**When:** Any time money leaves your financial world to pay for something.

**What it does:** Reduces the balance of the source account. Counts against the bucket's monthly allocation. Appears in all category and subcategory reports.

**Required fields:**

- Amount
- Account the money left from
- Category (which determines the bucket automatically)
- Date (defaults to today)

**Optional fields:**

- Subcategory (for drill-down insight)
- Payee / merchant name
- Description / note
- Tags
- Receipt photo URL
- Linked financial goal (if expense is goal-related)

**Example:** You pay Rs. 450 at Imtiaz Superstore. Log as: Rs. 450, from Needs Wallet, Category: Food, Subcategory: Groceries, Payee: Imtiaz.

---

### Action 2: Log Income + Allocation

**When:** Any time money enters your financial world from outside.

**Two-step process:**

Step 1 — Log the arrival:

- Amount received
- Source name (e.g. "Contour Technologies")
- Source type: SALARY / FREELANCE / WINDFALL / SIDE_INCOME / OTHER
- Which account it landed in
- Tax deducted (if any)
- Date

Step 2 — Allocate across buckets:

- Split the total amount across your 5 bucket accounts
- Each allocation row has: bucket, amount, destination account, optional goal link
- Sum of allocations must equal income amount (validated by app)

**Why two steps:** Income arrives as a lump sum but belongs to multiple buckets. The allocation step records your actual decision — which is as important as the income itself. Over time, your allocation history shows what % of income went to investments, savings, etc.

**Example:** Rs. 85,000 salary arrives in Meezan account. Allocations: Rs. 27,000 → NEEDS (Needs Wallet), Rs. 17,000 → INVESTMENTS (Investment Account), Rs. 10,000 → SAVINGS (Goal Savings Account), Rs. 4,000 → CHARITY (Charity Wallet), Rs. 12,000 → FLEX (Flex Wallet), Rs. 15,000 stays in main account (rent already paid from there).

**Windfall rule:** For unexpected income (Eid money, bonus, freelance windfall), apply the 50/50 rule: 50% to savings/investments, 50% to flex. Adjust based on emergency fund status — if fund is not full, weight more toward savings.

---

### Action 3: Log Transfer

**When:** Moving money between your own accounts. This is NOT an expense. This is NOT income.

**What it does:** Reduces balance of the source account. Increases balance of the destination account. **Completely invisible to all P&L reports, expense reports, income reports, and savings rate calculations.**

**Required fields:**

- Amount
- From account
- To account
- Date

**Optional fields:**

- Linked financial goal (if topping up a goal-linked account)
- Note

**Critical rule:** A transfer never has a category. It never affects bucket spending totals. If you move Rs. 5,000 from your salary account to your emergency fund account, that is a transfer — categorizing it as an expense would inflate your expense reports and destroy your savings rate calculation.

**Example:** Rs. 10,000 from Meezan Salary Account → Emergency Fund Account. Linked to Emergency Fund goal (so goal's current_amount updates).

---

### Action 4: Log Investment Contribution

**When:** Money goes into an investment vehicle — SIP runs, you buy stocks, you add to a mutual fund.

**What it does:** Reduces the source account balance (as an expense of type INVESTMENT_CONTRIBUTION). Updates the investment record's total_contributed amount. Creates an investment contribution history row for cost basis tracking.

**Required fields:**

- Which investment
- Amount contributed
- Date
- Account debited

**Optional fields:**

- Units purchased (number of fund units or shares)
- Price per unit (NAV or stock price at purchase)
- Notes

**Why it's both a transaction and a contribution:** The money leaves your bank account (transaction, affects account balance) but it also enters a wealth-building vehicle (contribution, affects investment tracking). Both records are needed.

**Example:** Rs. 10,000 → Meezan Islamic Fund. 94.3 units purchased at NAV Rs. 106.04. Debited from Investment Account.

---

## 6. The Operating Cycle

### The Monthly Heartbeat

```
Last day of          Every day           Every Sunday        Monthly          Last day of
current month        of month            evening             (any day)        month
      │                  │                    │                  │               │
      ▼                  ▼                    ▼                  ▼               ▼
┌──────────┐       ┌──────────┐        ┌──────────┐      ┌──────────┐    ┌──────────┐
│ CREATE   │  →    │  LOG     │   →    │ WEEKLY   │  →   │ UPDATE   │ →  │  CLOSE   │
│ MONTHLY  │       │ EXPENSES │        │ REVIEW   │      │INVESTMENT│    │  MONTH   │
│  PLAN    │       │ INCOME   │        │ (10 min) │      │SNAPSHOT  │    │ (30 min) │
│ (20 min) │       │TRANSFERS │        │          │      │ (5 min)  │    │          │
│          │       │INVESTMENTS         │          │      │          │    │          │
└──────────┘       └──────────┘        └──────────┘      └──────────┘    └──────────┘
```

### Phase 1: Monthly Planning (~20 minutes)

Done on the last day of the previous month or the first day of the new month.

**What you do:**

1. Create a new monthly plan entry
2. Enter expected income for the month (use minimum guaranteed amount if uncertain)
3. Allocate expected income across 5 buckets (must sum to total)
4. Review and confirm all recurring rules are active and amounts are correct
5. Check goal monthly targets — confirm you're on track
6. Review last month's report briefly to inform this month's plan

**Context-sensitive planning examples:**

_Living away from home (April):_

```
Expected Income:  Rs. 1,00,000
─────────────────────────────
NEEDS:            Rs. 42,000  (rent + food + transport + utilities)
INVESTMENTS:      Rs. 20,000
SAVINGS:          Rs. 12,000
CHARITY:          Rs.  5,000
FLEX:             Rs. 21,000
─────────────────────────────
Total:            Rs. 1,00,000 ✓
```

_Living at home (May — no rent):_

```
Expected Income:  Rs. 1,00,000
─────────────────────────────
NEEDS:            Rs. 22,000  (food + transport only)
INVESTMENTS:      Rs. 30,000  (extra Rs. 10,000 freed up)
SAVINGS:          Rs. 18,000
CHARITY:          Rs.  5,000
FLEX:             Rs. 25,000
─────────────────────────────
Total:            Rs. 1,00,000 ✓
```

---

### Phase 2: Daily Logging (~2 minutes/day)

Log at the moment of spending, or at end of day before sleeping. These are the only two habits that work.

**The logging decision tree:**

```
Money moved?
     │
     ├── Did it come FROM outside? (salary, freelance, gift)
     │         └──  LOG INCOME + ALLOCATION
     │
     ├── Did it go TO an investment vehicle? (SIP, stocks, fund)
     │         └──  LOG INVESTMENT CONTRIBUTION
     │
     ├── Did it move between YOUR OWN accounts?
     │         └──  LOG TRANSFER  (never a category, never an expense)
     │
     └── Did it leave to pay for something? (food, transport, bills)
               └──  LOG EXPENSE
```

**Recurring transactions:** Your SIP, rent, Netflix, and other recurring items are handled by recurring rules. When due, the app shows a confirmation prompt. You confirm (or adjust amount if needed), and the transaction logs automatically. You never manually enter these.

---

### Phase 3: Weekly Review (~10 minutes, every Sunday)

This is a pulse check, not an audit. One question: **am I on track?**

**What you check:**

- Bucket burn rates: What % of each bucket's allocation has been used vs how far through the month you are
- Active alerts: Any warnings that fired this week
- Recurring confirmations: Did all scheduled items run?
- Goal progress: Are goals moving at the expected pace?

**The key signal:** If you are 50% through the month and a bucket is at 75%, you are running fast. If it's at 45%, you're on track. If it's at 20%, you underspent (which may also be a signal).

**Decision rule:** If FLEX is running fast, slow discretionary spending for the rest of the month. No other action needed — just awareness.

---

### Phase 4: Investment Update (~5 minutes, monthly)

Check your investment platform (SIP app, brokerage) and log the current market value of each investment.

**What you log:** A portfolio snapshot per investment with current market value and units held.

**What the app computes:** Gain/loss in absolute Rs. and percentage. This snapshot feeds the net worth calculation.

---

### Phase 5: Month Close (~30 minutes)

The most important session. This is where the system pays you back.

**What the app does automatically when you trigger month close:**

1. Computes final actual spend per bucket vs planned allocation
2. Creates budget_snapshots rows — locked forever (immutable historical record)
3. Takes a net worth snapshot (liquid cash + emergency + goal savings + investment portfolio value − liabilities)
4. Computes final savings rate: `(total income − total expenses) ÷ total income × 100`
5. Computes investment performance: total contributed vs current value
6. Updates goal progress
7. Fires any end-of-month alerts (goal not contributed this month, etc.)
8. Marks month as `is_closed = true`

**What you do:**

1. Review plan vs actual for each bucket — where did you overspend/underspend?
2. Review category breakdown — what drove the spending?
3. Review net worth change — how much did you grow this month?
4. Note any lessons for next month's planning
5. Begin next month's plan

---

## 7. Complete Entity Definitions

### 7.1 Buckets

**Table: `buckets`**

The five mental containers. A proper table (not just an enum) so each bucket can have a name, color, and icon for the UI.

| Field          | Type       | Description                                          |
| -------------- | ---------- | ---------------------------------------------------- |
| `id`           | INTEGER PK | Auto-increment                                       |
| `name`         | TEXT       | "NEEDS", "INVESTMENTS", "SAVINGS", "CHARITY", "FLEX" |
| `display_name` | TEXT       | "Needs & Essentials", "Investments", etc.            |
| `color`        | TEXT       | Hex color for UI                                     |
| `icon`         | TEXT       | Icon identifier                                      |
| `sort_order`   | INTEGER    | Display order in UI                                  |
| `description`  | TEXT       | What this bucket is for                              |

**Fixed data — 5 rows, never added to or removed.**

---

### 7.2 Accounts

**Table: `accounts`**

Real-world money containers. Balance is always derived from transaction history — never stored directly.

| Field             | Type       | Description                                                       |
| ----------------- | ---------- | ----------------------------------------------------------------- |
| `id`              | INTEGER PK | Auto-increment                                                    |
| `name`            | TEXT       | "Meezan Savings", "JazzCash Wallet", "Cash on Hand"               |
| `type`            | TEXT ENUM  | BANK / WALLET / CASH / INVESTMENT / CREDIT_CARD                   |
| `bucket_id`       | INTEGER FK | Which bucket this account belongs to                              |
| `opening_balance` | REAL       | Balance at the time you added this account to the app             |
| `opening_date`    | TEXT       | Date of opening balance — all transactions from this date forward |
| `currency`        | TEXT       | Default: PKR                                                      |
| `color`           | TEXT       | Hex color for UI                                                  |
| `is_active`       | INTEGER    | 1 = active, 0 = archived (soft delete)                            |
| `notes`           | TEXT       | Optional                                                          |
| `created_at`      | TEXT       | ISO datetime                                                      |

**Account Types:**

| Type        | Examples                     | Balance Behavior                                            |
| ----------- | ---------------------------- | ----------------------------------------------------------- |
| BANK        | Meezan, HBL, UBL             | Sum of transactions                                         |
| WALLET      | JazzCash, Easypaisa, Nayapay | Sum of transactions                                         |
| CASH        | Physical rupees              | Sum of transactions                                         |
| INVESTMENT  | SIP account, brokerage       | Latest portfolio snapshot value                             |
| CREDIT_CARD | Any credit card              | Sum of transactions (liability — subtracted from net worth) |

**Derived balance formula:**

```
current_balance = opening_balance
                + SUM(income landed in this account)
                + SUM(transfers received into this account)
                − SUM(expenses paid from this account)
                − SUM(transfers sent from this account)
                − SUM(investment contributions from this account)
```

**Investment account exception:** For INVESTMENT type accounts, the "balance" shown in net worth is the latest `portfolio_snapshots.market_value`, not the transaction sum. The transaction sum represents contributions; the snapshot represents current worth.

---

### 7.3 Categories

**Table: `categories`**

The nature of spending. Pure organizational and analytical — no budget information whatsoever.

| Field              | Type       | Description                           |
| ------------------ | ---------- | ------------------------------------- |
| `id`               | INTEGER PK | Auto-increment                        |
| `name`             | TEXT       | "Food", "Transport", "Mutual Fund"    |
| `bucket_id`        | INTEGER FK | Which bucket this category belongs to |
| `transaction_type` | TEXT ENUM  | EXPENSE / INCOME / BOTH               |
| `color`            | TEXT       | Hex for UI                            |
| `icon`             | TEXT       | Icon identifier                       |
| `is_active`        | INTEGER    | Soft delete                           |
| `sort_order`       | INTEGER    | Display order                         |
| `created_at`       | TEXT       | ISO datetime                          |

**Key rule:** A category's `bucket_id` is how the system knows which bucket an expense counts against. When you log an expense with Category: Food, the system automatically knows it counts against the NEEDS bucket (because Food belongs to NEEDS). You never manually specify the bucket when logging an expense.

---

### 7.4 Subcategories

**Table: `subcategories`**

Pure metadata labels for drill-down insight. No budget, no limits, no configuration beyond a name.

| Field         | Type       | Description                             |
| ------------- | ---------- | --------------------------------------- |
| `id`          | INTEGER PK | Auto-increment                          |
| `category_id` | INTEGER FK | Parent category                         |
| `name`        | TEXT       | "Groceries", "Careem / Uber", "Netflix" |
| `is_active`   | INTEGER    | Soft delete                             |
| `created_at`  | TEXT       | ISO datetime                            |

---

### 7.5 Monthly Plan

**Table: `monthly_plan`**

Your financial contract with yourself for a given month. One row per month.

| Field                    | Type       | Description                                    |
| ------------------------ | ---------- | ---------------------------------------------- |
| `id`                     | INTEGER PK | Auto-increment                                 |
| `year`                   | INTEGER    | e.g. 2025                                      |
| `month`                  | INTEGER    | 1–12                                           |
| `expected_income`        | REAL       | Total income you expect this month             |
| `needs_allocation`       | REAL       | Budget for NEEDS bucket                        |
| `investments_allocation` | REAL       | Budget for INVESTMENTS bucket                  |
| `savings_allocation`     | REAL       | Budget for SAVINGS bucket                      |
| `charity_allocation`     | REAL       | Budget for CHARITY bucket                      |
| `flex_allocation`        | REAL       | Budget for FLEX bucket                         |
| `notes`                  | TEXT       | Context note ("Living at home this month")     |
| `is_closed`              | INTEGER    | 0 = open, 1 = month has been closed and locked |
| `created_at`             | TEXT       | ISO datetime                                   |
| `closed_at`              | TEXT       | When month was closed                          |

**Constraint:** `needs + investments + savings + charity + flex = expected_income` (validated at app layer)

**Unique constraint:** `UNIQUE(year, month)` — one plan per month only.

**Copy-last-month feature:** When creating a new monthly plan, the app pre-fills all allocation amounts from the previous month as a starting template. User adjusts only what changed.

---

### 7.6 Income Entries

**Table: `income_entries`**

Each arrival of money from outside your financial world.

| Field          | Type       | Description                                                             |
| -------------- | ---------- | ----------------------------------------------------------------------- |
| `id`           | INTEGER PK | Auto-increment                                                          |
| `date`         | TEXT       | ISO date: "2025-04-10"                                                  |
| `amount`       | REAL       | Net amount received                                                     |
| `gross_amount` | REAL       | Before tax, if known                                                    |
| `tax_deducted` | REAL       | Tax withheld at source                                                  |
| `source`       | TEXT       | "Contour Technologies", "Fiverr Client"                                 |
| `source_type`  | TEXT ENUM  | SALARY / FREELANCE / WINDFALL / SIDE_INCOME / INVESTMENT_RETURN / OTHER |
| `account_id`   | INTEGER FK | Account where money landed                                              |
| `notes`        | TEXT       | Optional                                                                |
| `created_at`   | TEXT       | ISO datetime                                                            |

---

### 7.7 Income Allocations

**Table: `income_allocations`**

How each income entry was split across buckets. One income entry → multiple allocation rows.

| Field             | Type       | Description                                             |
| ----------------- | ---------- | ------------------------------------------------------- |
| `id`              | INTEGER PK | Auto-increment                                          |
| `income_entry_id` | INTEGER FK | Parent income entry                                     |
| `bucket_id`       | INTEGER FK | Which bucket this slice goes to                         |
| `amount`          | REAL       | Amount allocated to this bucket                         |
| `to_account_id`   | INTEGER FK | Which account this money was moved to                   |
| `goal_id`         | INTEGER FK | Optional — if this allocation is toward a specific goal |
| `notes`           | TEXT       | Optional                                                |

**Rule:** `SUM(allocations.amount) = income_entries.amount` — enforced at app layer, not DB, for flexibility (partial allocation is allowed if you haven't decided where the rest goes yet).

---

### 7.8 Transactions

**Table: `transactions`**

All outflows from your financial world. Expenses and investment contributions only.

| Field               | Type       | Description                                 |
| ------------------- | ---------- | ------------------------------------------- |
| `id`                | INTEGER PK | Auto-increment                              |
| `date`              | TEXT       | ISO date                                    |
| `amount`            | REAL       | Must be > 0                                 |
| `type`              | TEXT ENUM  | EXPENSE / INVESTMENT_CONTRIBUTION           |
| `account_id`        | INTEGER FK | Account money left from                     |
| `category_id`       | INTEGER FK | Category of this expense                    |
| `subcategory_id`    | INTEGER FK | Optional subcategory                        |
| `investment_id`     | INTEGER FK | Only if type = INVESTMENT_CONTRIBUTION      |
| `recurring_rule_id` | INTEGER FK | Set if this was spawned by a recurring rule |
| `linked_goal_id`    | INTEGER FK | Optional — if expense is linked to a goal   |
| `payee`             | TEXT       | "Imtiaz Superstore", "Careem"               |
| `description`       | TEXT       | Free text note                              |
| `tags`              | TEXT       | Comma-separated tags                        |
| `receipt_url`       | TEXT       | Photo of receipt (cloud URL)                |
| `is_flagged`        | INTEGER    | Manually flagged for review                 |
| `notes`             | TEXT       | Additional notes                            |
| `created_at`        | TEXT       | ISO datetime                                |
| `updated_at`        | TEXT       | ISO datetime                                |

**Critical rules:**

- Income is NEVER in this table — it lives in `income_entries`
- Transfers are NEVER in this table — they live in `transfers`
- A transaction always has a `category_id` — even investment contributions use an INVESTMENTS category

---

### 7.9 Transfers

**Table: `transfers`**

Money moving between your own accounts. Completely separate from transactions.

| Field             | Type       | Description                     |
| ----------------- | ---------- | ------------------------------- |
| `id`              | INTEGER PK | Auto-increment                  |
| `date`            | TEXT       | ISO date                        |
| `amount`          | REAL       | Must be > 0                     |
| `from_account_id` | INTEGER FK | Source account                  |
| `to_account_id`   | INTEGER FK | Destination account             |
| `linked_goal_id`  | INTEGER FK | Optional — if topping up a goal |
| `notes`           | TEXT       | Optional                        |
| `created_at`      | TEXT       | ISO datetime                    |

**Constraint:** `from_account_id ≠ to_account_id`

**Invisible to:** All expense reports, all income reports, savings rate calculation, bucket spending totals, category breakdowns.

**Visible to:** Individual account balance calculations (affects both the from and to accounts).

---

### 7.10 Recurring Rules

**Table: `recurring_rules`**

Templates for repeating money events. Never appear in reports — only their spawned transactions do.

| Field            | Type       | Description                                        |
| ---------------- | ---------- | -------------------------------------------------- |
| `id`             | INTEGER PK | Auto-increment                                     |
| `name`           | TEXT       | "Meezan SIP", "House Rent", "Netflix"              |
| `amount`         | REAL       | Expected amount (can be adjusted at confirmation)  |
| `type`           | TEXT ENUM  | EXPENSE / INVESTMENT_CONTRIBUTION / INCOME         |
| `frequency`      | TEXT ENUM  | DAILY / WEEKLY / MONTHLY / QUARTERLY / YEARLY      |
| `day_of_month`   | INTEGER    | For MONTHLY: 1–31                                  |
| `day_of_week`    | INTEGER    | For WEEKLY: 0=Sun, 6=Sat                           |
| `account_id`     | INTEGER FK | Account to debit/credit                            |
| `category_id`    | INTEGER FK | Category for spawned transactions                  |
| `subcategory_id` | INTEGER FK | Optional                                           |
| `linked_goal_id` | INTEGER FK | Optional                                           |
| `next_due_date`  | TEXT       | Next date this rule fires                          |
| `last_generated` | TEXT       | Last date a transaction was created from this rule |
| `is_active`      | INTEGER    | 1 = active, 0 = paused                             |
| `notes`          | TEXT       | Optional                                           |
| `created_at`     | TEXT       | ISO datetime                                       |

**How it works:**

1. App checks daily for rules where `next_due_date <= today` and `is_active = 1`
2. Creates a pending confirmation notification for the user
3. User confirms (or adjusts amount) → transaction is created, `last_generated` is updated, `next_due_date` advances by one frequency period
4. User can skip → transaction not created, but `next_due_date` still advances
5. If due date passes with no action → OVERDUE_RECURRING alert fires

---

### 7.11 Financial Goals

**Table: `financial_goals`**

Named savings targets. All goals live in one table, distinguished by `goal_type`.

| Field               | Type       | Description                                                 |
| ------------------- | ---------- | ----------------------------------------------------------- |
| `id`                | INTEGER PK | Auto-increment                                              |
| `name`              | TEXT       | "Emergency Fund", "MacBook Pro", "Murree Trip"              |
| `goal_type`         | TEXT ENUM  | EMERGENCY_FUND / SHORT_TERM / LONG_TERM / INVESTMENT_TARGET |
| `target_amount`     | REAL       | Total amount needed                                         |
| `current_amount`    | REAL       | How much has been saved so far                              |
| `deadline`          | TEXT       | ISO date — optional                                         |
| `priority`          | INTEGER    | 1 (highest) to 5 (lowest)                                   |
| `monthly_target`    | REAL       | How much you plan to contribute per month                   |
| `linked_account_id` | INTEGER FK | Account where this goal's money lives                       |
| `status`            | TEXT ENUM  | ACTIVE / PAUSED / COMPLETED / CANCELLED                     |
| `notes`             | TEXT       | Optional                                                    |
| `created_at`        | TEXT       | ISO datetime                                                |
| `updated_at`        | TEXT       | ISO datetime                                                |

**Computed fields (never stored, always derived at query time):**

- `progress_pct = (current_amount / target_amount) × 100`
- `remaining_amount = target_amount − current_amount`
- `months_to_goal = CEIL(remaining_amount / monthly_target)`

**Goal types:**

| Type              | Description                                            | Special behavior                                        |
| ----------------- | ------------------------------------------------------ | ------------------------------------------------------- |
| EMERGENCY_FUND    | 3–6 months of expenses                                 | Shown prominently on dashboard. Alert if balance drops. |
| SHORT_TERM        | < 1 year horizon (travel, gadgets)                     | Standard goal tracking                                  |
| LONG_TERM         | > 1 year horizon (house, car)                          | Standard goal tracking                                  |
| INVESTMENT_TARGET | Portfolio value target (e.g. "Rs. 1M in mutual funds") | Linked to investment value, not savings account         |

**How `current_amount` updates:** When a transfer is logged with `linked_goal_id` set, the app increments `current_amount` by the transfer amount. When an income allocation has `goal_id` set, same update. The app also decrements if money is transferred OUT of the goal account.

---

### 7.12 Investments

**Table: `investments`**

Master record for each investment vehicle.

| Field               | Type       | Description                                                  |
| ------------------- | ---------- | ------------------------------------------------------------ |
| `id`                | INTEGER PK | Auto-increment                                               |
| `name`              | TEXT       | "Meezan Islamic Fund", "PSX Portfolio"                       |
| `type`              | TEXT ENUM  | MUTUAL_FUND / SIP / STOCKS / BONDS / GOLD / CRYPTO / OTHER   |
| `platform`          | TEXT       | "Meezan Asset Management", "CDC Pakistan"                    |
| `total_contributed` | REAL       | Sum of all contributions (updated on each contribution)      |
| `current_value`     | REAL       | Latest known market value (updated from portfolio snapshots) |
| `units_held`        | REAL       | Total units/shares held                                      |
| `account_id`        | INTEGER FK | Linked investment account                                    |
| `start_date`        | TEXT       | ISO date of first contribution                               |
| `is_active`         | INTEGER    | Soft delete                                                  |
| `notes`             | TEXT       | Optional                                                     |
| `created_at`        | TEXT       | ISO datetime                                                 |
| `updated_at`        | TEXT       | ISO datetime                                                 |

**The two numbers that matter:**

- `total_contributed` = what you put in (your actual cost)
- `current_value` = what it's worth today (market price)
- `gain_loss = current_value − total_contributed`

---

### 7.13 Investment Contributions

**Table: `investment_contributions`**

Every individual purchase/contribution event. The historical record of your investing activity.

| Field             | Type       | Description                                      |
| ----------------- | ---------- | ------------------------------------------------ |
| `id`              | INTEGER PK | Auto-increment                                   |
| `investment_id`   | INTEGER FK | Parent investment                                |
| `date`            | TEXT       | ISO date                                         |
| `amount`          | REAL       | Amount invested in this purchase                 |
| `units_purchased` | REAL       | Units/shares received                            |
| `price_per_unit`  | REAL       | NAV or stock price at time of purchase           |
| `transaction_id`  | INTEGER FK | Linked transaction (the debit from bank account) |
| `notes`           | TEXT       | Optional                                         |
| `created_at`      | TEXT       | ISO datetime                                     |

**Enables:** Cost basis calculation, average buy price, comparison of purchase timing, rupee-cost averaging analysis.

---

### 7.14 Portfolio Snapshots

**Table: `portfolio_snapshots`**

Periodic records of investment market value. Taken monthly (or manually anytime).

| Field           | Type       | Description                                    |
| --------------- | ---------- | ---------------------------------------------- |
| `id`            | INTEGER PK | Auto-increment                                 |
| `investment_id` | INTEGER FK | Which investment                               |
| `snapshot_date` | TEXT       | ISO date                                       |
| `market_value`  | REAL       | Current market value on this date              |
| `units_held`    | REAL       | Units held at snapshot time                    |
| `gain_loss`     | REAL       | market_value − total_contributed at this point |
| `gain_loss_pct` | REAL       | (gain_loss / total_contributed) × 100          |
| `notes`         | TEXT       | Optional                                       |
| `created_at`    | TEXT       | ISO datetime                                   |

**Constraint:** `UNIQUE(investment_id, snapshot_date)` — one snapshot per investment per day.

**How it feeds net worth:** The `net_worth_snapshots` table uses the latest `portfolio_snapshots.market_value` for each active investment when computing total investment value.

---

### 7.15 Budget Snapshots

**Table: `budget_snapshots`**

Immutable month-close records of planned vs actual spending per bucket. Generated automatically at month close.

| Field            | Type       | Description                                       |
| ---------------- | ---------- | ------------------------------------------------- |
| `id`             | INTEGER PK | Auto-increment                                    |
| `year`           | INTEGER    |                                                   |
| `month`          | INTEGER    | 1–12                                              |
| `bucket_id`      | INTEGER FK | Which bucket                                      |
| `planned_amount` | REAL       | Copied from monthly_plan at close time            |
| `actual_spent`   | REAL       | Sum of all transactions in this bucket this month |
| `variance`       | REAL       | planned − actual (positive = under budget)        |
| `variance_pct`   | REAL       | (variance / planned) × 100                        |
| `status`         | TEXT ENUM  | OK / WARNING / OVER                               |
| `created_at`     | TEXT       | ISO datetime                                      |

**Constraint:** `UNIQUE(year, month, bucket_id)`

**Why `planned_amount` is copied here:** If the user changes next month's plan, it must not retroactively change what April's snapshot shows. The snapshot is a permanent record of what you planned and what actually happened in April.

---

### 7.16 Net Worth Snapshots

**Table: `net_worth_snapshots`**

Your complete financial picture at end of each month. One row per month, forever.

| Field                 | Type       | Description                                                        |
| --------------------- | ---------- | ------------------------------------------------------------------ |
| `id`                  | INTEGER PK | Auto-increment                                                     |
| `snapshot_date`       | TEXT       | ISO date (usually last day of month)                               |
| `liquid_cash`         | REAL       | Sum of all BANK + WALLET + CASH account balances                   |
| `emergency_fund`      | REAL       | Emergency fund account balance                                     |
| `goal_savings`        | REAL       | Sum of all goal-linked savings account balances                    |
| `investments_value`   | REAL       | Sum of latest portfolio snapshot values for all active investments |
| `total_assets`        | REAL       | liquid_cash + emergency_fund + goal_savings + investments_value    |
| `total_liabilities`   | REAL       | Sum of CREDIT_CARD account balances (money owed)                   |
| `net_worth`           | REAL       | total_assets − total_liabilities                                   |
| `total_income_month`  | REAL       | All income entries for this month                                  |
| `total_expense_month` | REAL       | All transactions (expenses) for this month                         |
| `savings_rate`        | REAL       | ((income − expense) / income) × 100                                |
| `created_at`          | TEXT       | ISO datetime                                                       |

**Constraint:** `UNIQUE(snapshot_date)`

---

### 7.17 Alerts

**Table: `alerts`**

All warnings and signals ever fired. Stored permanently for pattern analysis.

| Field             | Type       | Description                        |
| ----------------- | ---------- | ---------------------------------- |
| `id`              | INTEGER PK | Auto-increment                     |
| `alert_type`      | TEXT ENUM  | See alert types below              |
| `triggered_at`    | TEXT       | ISO datetime                       |
| `bucket_id`       | INTEGER FK | Relevant bucket (nullable)         |
| `category_id`     | INTEGER FK | Relevant category (nullable)       |
| `goal_id`         | INTEGER FK | Relevant goal (nullable)           |
| `account_id`      | INTEGER FK | Relevant account (nullable)        |
| `message`         | TEXT       | Human-readable alert message       |
| `threshold_value` | REAL       | The limit that was set             |
| `actual_value`    | REAL       | The value that triggered the alert |
| `is_dismissed`    | INTEGER    | 0 = active, 1 = acknowledged       |
| `dismissed_at`    | TEXT       | When user dismissed it             |

---

## 8. Entity Relationships

### Relationship Map

```
buckets ──────────────────────────────────────────────────────┐
   │                                                           │
   ├──< categories >──< subcategories                         │
   │        │                                                  │
   │        │                                                  │
   │        └──< transactions >──────────────────────────────>┤
   │                  │                                        │
   │                  │── investment_id ──> investments        │
   │                  │── recurring_rule_id ──> recurring_rules│
   │                  └── linked_goal_id ──> financial_goals   │
   │                                                           │
accounts ──────────────────────────────────────────────────── ┤
   │                                                           │
   ├──< income_entries >──< income_allocations                 │
   │                                                           │
   ├──< transfers (from_account / to_account)                  │
   │                                                           │
   └──< investments >──< investment_contributions              │
                  │                                            │
                  └──< portfolio_snapshots                     │
                                                               │
monthly_plan ──> budget_snapshots ──────────────────────────> ┘
                                                               │
net_worth_snapshots ◄── (computed from all of the above)      │
                                                               │
alerts ◄── (fired by budget_snapshots, goals, accounts)        │
```

### Foreign Key Summary

| Table                      | References                                                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `accounts`                 | `buckets.id`                                                                                                     |
| `categories`               | `buckets.id`                                                                                                     |
| `subcategories`            | `categories.id`                                                                                                  |
| `transactions`             | `accounts.id`, `categories.id`, `subcategories.id`, `investments.id`, `recurring_rules.id`, `financial_goals.id` |
| `transfers`                | `accounts.id` (×2), `financial_goals.id`                                                                         |
| `income_entries`           | `accounts.id`                                                                                                    |
| `income_allocations`       | `income_entries.id`, `buckets.id`, `accounts.id`, `financial_goals.id`                                           |
| `recurring_rules`          | `accounts.id`, `categories.id`, `subcategories.id`, `financial_goals.id`                                         |
| `financial_goals`          | `accounts.id`                                                                                                    |
| `investments`              | `accounts.id`                                                                                                    |
| `investment_contributions` | `investments.id`, `transactions.id`                                                                              |
| `portfolio_snapshots`      | `investments.id`                                                                                                 |
| `budget_snapshots`         | `buckets.id`                                                                                                     |
| `alerts`                   | `buckets.id`, `categories.id`, `financial_goals.id`, `accounts.id`                                               |

---

## 9. The Alert System

Alerts fire automatically. They are stored as rows in the `alerts` table and shown on the dashboard until dismissed.

### Alert Types

| Alert Type                 | When It Fires                                                 | Example Message                                                                 |
| -------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `BUDGET_WARNING`           | A bucket reaches 80% of its monthly allocation                | "Your FLEX bucket is at 82% with 12 days remaining."                            |
| `BUDGET_EXCEEDED`          | A bucket exceeds 100% of its monthly allocation               | "Your NEEDS bucket has exceeded its Rs. 42,000 allocation by Rs. 3,200."        |
| `GOAL_BEHIND_SCHEDULE`     | Month closes and a goal received less than its monthly target | "No contribution to MacBook Pro this month. You are 2 months behind target."    |
| `EMERGENCY_FUND_LOW`       | Emergency fund balance drops below target                     | "Emergency fund is at Rs. 45,000 — below your 3-month target of Rs. 1,20,000."  |
| `LOW_ACCOUNT_BALANCE`      | An account balance drops below a user-set minimum             | "Your Needs Wallet balance is Rs. 800 — below Rs. 1,000 minimum."               |
| `LARGE_EXPENSE`            | A single transaction exceeds a user-set threshold             | "Single expense of Rs. 12,000 logged in FLEX — above your Rs. 8,000 threshold." |
| `NO_INVESTMENT_THIS_MONTH` | 10th of month passes with no investment contribution logged   | "No investment contribution logged yet this month. Your SIP may not have run."  |
| `OVERDUE_RECURRING`        | A recurring rule's due date passes without confirmation       | "Netflix (recurring) was due 3 days ago. Please confirm or mark as skipped."    |

### Alert Dismissal

Dismissed ≠ deleted. Dismissed alerts remain in the database permanently for pattern analysis. Dismissal means "I've seen this." You can view all historical alerts to spot patterns — "FLEX budget warning fires every month by the 22nd" tells you your FLEX budget is consistently too low.

### Warning Threshold

The default budget warning threshold is 80%. This is configurable per bucket. Some buckets (like CHARITY) may never need a warning threshold — you can disable it per bucket.

---

## 10. Complete Feature List

### Setup Features (Done Once)

| Feature                | Description                                                     |
| ---------------------- | --------------------------------------------------------------- |
| Account setup          | Create accounts with name, type, bucket, opening balance        |
| Category setup         | Create categories linked to buckets                             |
| Subcategory setup      | Add subcategories under categories                              |
| Goal setup             | Create financial goals with targets, deadlines, monthly targets |
| Investment setup       | Create investment records with type, platform                   |
| Recurring rule setup   | Create rules for SIP, rent, subscriptions                       |
| Alert threshold config | Set warning % per bucket, set large expense threshold           |

### Monthly Features

| Feature                 | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| Create monthly plan     | Set expected income and 5 bucket allocations             |
| Copy last month         | Pre-fill new plan from previous month                    |
| Close month             | Lock month, generate all snapshots and reports           |
| Monthly plan validation | App validates bucket sum = expected income before saving |

### Daily Logging Features

| Feature                     | Description                                                    |
| --------------------------- | -------------------------------------------------------------- |
| Log expense                 | Amount, account, category, subcategory, payee, optional fields |
| Log income + allocate       | Two-step: log arrival then split across buckets                |
| Log transfer                | From account, to account, optional goal link                   |
| Log investment contribution | Investment, amount, units, price per unit                      |
| Edit transaction            | Correct any logged entry (with audit trail)                    |
| Delete transaction          | Remove incorrect entry (with confirmation)                     |
| Recurring confirmation      | Confirm or adjust pending recurring items                      |
| Skip recurring              | Mark a recurring instance as skipped                           |
| Take portfolio snapshot     | Enter current market value for investments                     |

### Dashboard Features

| Feature                    | Description                                            |
| -------------------------- | ------------------------------------------------------ |
| Bucket burn rates          | Progress bars showing % of each bucket used this month |
| Account balances           | All accounts with current derived balance              |
| Active alerts              | All unread alerts with priority                        |
| Quick log                  | Fast expense entry from dashboard                      |
| Goal progress              | Progress bars for all active goals                     |
| This month summary         | Income received, expenses logged, savings rate so far  |
| Investment portfolio value | Total portfolio value vs total contributed             |
| Net worth current          | Latest net worth figure                                |
| Pending recurring          | Upcoming recurring items due this week                 |

### Reporting Features

| Feature                          | Description                                              |
| -------------------------------- | -------------------------------------------------------- |
| Weekly expense summary           | Transactions this week, by bucket and category           |
| Weekly burn rate                 | Bucket consumption rate with projection                  |
| Monthly plan vs actual           | Planned vs actual for each bucket with variance          |
| Monthly category breakdown       | All categories ranked by spend within each bucket        |
| Monthly subcategory drill-down   | All subcategories ranked by spend within each category   |
| Monthly income summary           | Income by source type, allocation confirmation           |
| Monthly savings rate             | Rate with trend vs last 3 months                         |
| Monthly goal progress            | All goals with progress, remaining, months to target     |
| Monthly net worth                | Full net worth breakdown                                 |
| Monthly investment performance   | All investments with gain/loss                           |
| Monthly account statement        | All transactions for a specific account                  |
| Quarterly spending trends        | Monthly totals per bucket across 3 months                |
| Quarterly income analysis        | Income by source, growth, variability                    |
| Quarterly savings rate trend     | Month-by-month savings rate across quarter               |
| Quarterly net worth progression  | Net worth at end of each month across quarter            |
| Quarterly investment consistency | Investment made each month? Total contributed?           |
| Yearly financial summary         | Full year: income, expenses, investments, savings        |
| Yearly net worth growth          | Net worth at end of each month across year               |
| Yearly savings rate analysis     | Monthly savings rate across year, annual average         |
| Yearly investment review         | Total contributed, portfolio value start vs end, returns |
| Yearly category insights         | Full year spend by category and subcategory              |
| Yearly income analysis           | Income growth, source diversification                    |

### Search and Filter Features

| Feature                | Description                                       |
| ---------------------- | ------------------------------------------------- |
| Search transactions    | Full text search across payee, description, notes |
| Filter by date range   | Any custom date range                             |
| Filter by bucket       | Show only transactions from one bucket            |
| Filter by category     | Show only one category                            |
| Filter by account      | Account statement view                            |
| Filter by tag          | All transactions with a specific tag              |
| Filter by amount range | Transactions above/below amounts                  |

---

## 11. Reporting Requirements

### Report Data Sources

Every report is derived from the raw transaction tables. Snapshot tables (`budget_snapshots`, `net_worth_snapshots`) make historical reporting fast and immutable.

### Weekly Reports

**Bucket burn rate:**

```
For each bucket:
  planned = monthly_plan.{bucket}_allocation for this month
  spent_this_week = SUM(transactions.amount)
                    WHERE date IN this week
                    AND categories.bucket_id = this bucket
  spent_this_month = SUM(transactions.amount)
                     WHERE date IN this month
                     AND categories.bucket_id = this bucket
  burn_rate = spent_this_month / planned × 100
  week_days_passed = day_of_month today
  projected_month_end = (spent_this_month / week_days_passed) × days_in_month
```

**Weekly transaction list:**

```
SELECT t.*, c.name as category, sc.name as subcategory, a.name as account
FROM transactions t
JOIN categories c ON t.category_id = c.id
LEFT JOIN subcategories sc ON t.subcategory_id = sc.id
JOIN accounts a ON t.account_id = a.id
WHERE t.date BETWEEN week_start AND week_end
ORDER BY t.date DESC
```

### Monthly Reports

**Plan vs actual (buckets):**

```
SELECT
  b.name as bucket,
  mp.{bucket}_allocation as planned,
  SUM(t.amount) as actual,
  mp.{bucket}_allocation - SUM(t.amount) as variance,
  (SUM(t.amount) / mp.{bucket}_allocation) * 100 as pct_used
FROM transactions t
JOIN categories c ON t.category_id = c.id
JOIN buckets b ON c.bucket_id = b.id
JOIN monthly_plan mp ON mp.year = YEAR AND mp.month = MONTH
WHERE t.date IN this month
GROUP BY b.id
```

**Category breakdown:**

```
SELECT
  c.name, b.name as bucket,
  SUM(t.amount) as total,
  COUNT(t.id) as count,
  AVG(t.amount) as avg_transaction
FROM transactions t
JOIN categories c ON t.category_id = c.id
JOIN buckets b ON c.bucket_id = b.id
WHERE t.date IN this month AND t.type = 'EXPENSE'
GROUP BY c.id
ORDER BY total DESC
```

**Savings rate:**

```
savings_rate = ((total_income - total_expenses) / total_income) * 100

Where:
  total_income = SUM(income_entries.amount) WHERE month = this month
  total_expenses = SUM(transactions.amount) WHERE month = this month
                   AND type = 'EXPENSE'

Note: INVESTMENT_CONTRIBUTION type transactions are counted as
      "invested" not "spent" for savings rate purposes.
      A higher savings rate includes investment contributions.
```

**Net worth:**

```
liquid_cash = SUM(derived_balance) for BANK + WALLET + CASH accounts
emergency_fund = derived_balance of EMERGENCY bucket account
goal_savings = SUM(financial_goals.current_amount) for ACTIVE goals
investments_value = SUM(latest portfolio_snapshot.market_value)
                    for all active investments
total_assets = liquid_cash + emergency_fund + goal_savings + investments_value
total_liabilities = SUM(derived_balance) for CREDIT_CARD accounts
net_worth = total_assets - total_liabilities
```

### Quarterly Reports

All quarterly reports aggregate 3 monthly data points. The primary view is a bar or line chart comparing the 3 months side by side, with totals and trend direction.

**Key metrics:**

- Bucket spending: 3 months side by side per bucket
- Income by source type: 3 months, showing salary vs freelance vs windfall trend
- Savings rate: 3 data points showing trend
- Net worth: 3 data points (end-of-month values from `net_worth_snapshots`)
- Investment contributions: Did you invest each month? How much?
- Category insights: Which categories appear consistently in top 3?

### Yearly Reports

All yearly reports aggregate 12 monthly data points.

**Annual summary totals:**

```
total_income_year = SUM(income_entries.amount) WHERE year = this year
total_expense_year = SUM(transactions.amount)
                     WHERE year = this year AND type = 'EXPENSE'
total_invested_year = SUM(investment_contributions.amount) WHERE year = this year
total_saved_year = change in (goal savings + emergency fund) from Jan 1 to Dec 31
net_worth_growth = net_worth_snapshot Dec 31 - net_worth_snapshot Jan 1
annual_savings_rate = (total_income - total_expense) / total_income * 100
```

---

## 12. Key Design Decisions & Reasoning

### Decision 1: No Real-Time Bank Sync

**Decision:** Account balances are derived entirely from manually entered transactions.

**Reasoning:** Manual entry creates awareness. Every expense you log is a conscious act of observation. Bank sync removes friction but also removes engagement — you stop thinking about money because the app "handles it." For building discipline, manual entry is the correct choice.

**Implementation:** Account balance = `opening_balance + inflows − outflows` computed from transaction history. There is never a "current balance" column that can drift out of sync with the transaction log.

---

### Decision 2: Transfers Are a Completely Separate Table

**Decision:** Money moving between your own accounts lives in `transfers`, never in `transactions`.

**Reasoning:** If you log a transfer as an expense, your total expenses are inflated. Your savings rate drops. Your bucket spending is wrong. Your monthly plan vs actual report is corrupted. A transfer is not a financial event — it's just money changing pockets. It must be invisible to all P&L reporting.

**Rule:** A transfer never has a category. It never affects bucket totals. It only affects two account balances.

---

### Decision 3: Income Has Its Own Table

**Decision:** Income lives in `income_entries` (with child `income_allocations`), not in `transactions`.

**Reasoning:** Income is qualitatively different from an expense. It has a source type (salary vs freelance vs windfall) that matters for analysis. It needs to be allocated across multiple buckets — one income event produces multiple bucket allocations. This cannot be modeled as a single transaction row.

**The allocation record matters:** Knowing you received Rs. 85,000 is information. Knowing you routed Rs. 20,000 of it to investments is financial intelligence. The allocation history is how you measure whether you're following your own plan.

---

### Decision 4: Budget Lives at Bucket Level, Not Category Level

**Decision:** `monthly_plan` holds bucket-level allocations. Categories have no budget limits.

**Reasoning:** You said clearly — you can easily set a budget for NEEDS (Rs. 42,000) but not for Food (Rs. 8,000) and Transport (Rs. 6,000) etc. Category-level budgets are too granular, too rigid, and too much mental overhead. Bucket-level budgets give you discipline with flexibility. Category reporting gives you insight without policing.

**Consequence:** Alerts fire at the bucket level ("NEEDS at 85%") not the category level ("Food at 120%"). You use category reports to understand why a bucket is over, not to trigger warnings.

---

### Decision 5: Budget Limits Are Monthly (Not Fixed on Categories)

**Decision:** The `monthly_plan` table has one row per month. You set different bucket allocations every month.

**Reasoning:** Your cost of living changes based on where you are (home vs another city). Rent may or may not exist. Transport may be higher or lower. A fixed budget limit on a category would be wrong for at least some months. The monthly plan captures your actual context.

**Copy-last-month feature:** Because creating a plan from scratch every month is annoying, the app pre-fills from the previous month. You only change the numbers that are different. This takes 5 minutes instead of 20.

---

### Decision 6: Subcategories Are Pure Metadata

**Decision:** Subcategories have no budget, no alerts, no configuration beyond a name.

**Reasoning:** You explicitly stated this. Subcategories exist only to answer "where exactly did this money go?" The total spent per subcategory is always computed from transaction sums — no configuration needed. If you bought groceries 12 times and dining out 8 times, the app shows you both totals from the transaction log.

---

### Decision 7: Investments Track Both Contribution and Market Value

**Decision:** Three separate tables: `investments` (master), `investment_contributions` (every purchase), `portfolio_snapshots` (market value over time).

**Reasoning:** Two completely different numbers matter for investments:

- **What you put in** (contribution): This is your actual cost, used for savings rate, cost basis, average buy price
- **What it's worth** (market value): This fluctuates with market price, used for net worth, gain/loss

You cannot store one number and derive the other. Both must be captured explicitly. The contribution history also enables rupee-cost averaging analysis and buy timing insight.

---

### Decision 8: Budget Snapshots Are Immutable Historical Records

**Decision:** When you close a month, `budget_snapshots` rows are created and never modified.

**Reasoning:** If budget snapshot rows were computed on-the-fly, changing next month's plan would appear to change last month's history (because the category/bucket relationships might change). Storing the `planned_amount` at close time means April's snapshot always shows what you planned and spent in April — even if you completely restructure your budget in July.

---

### Decision 9: `buckets` Is a Proper Table, Not Just an Enum

**Decision:** Buckets are stored in a `buckets` table with id, name, color, icon.

**Reasoning:** Buckets appear throughout the UI — they need colors, icons, display names. They are referenced by foreign keys from categories, accounts, income_allocations, and budget_snapshots. Making them a proper table rather than a hardcoded enum means the UI can render them consistently using the same data source.

**Fixed data:** The 5 bucket rows are inserted at setup time and never added to or removed. The `buckets` table is effectively read-only in production.

---

## 13. Complete Table Reference

### All 16 Tables

| #   | Table                      | Rows               | Changes Often?      |
| --- | -------------------------- | ------------------ | ------------------- |
| 1   | `buckets`                  | 5                  | Never               |
| 2   | `accounts`                 | ~5–10              | Rarely              |
| 3   | `categories`               | ~20                | Rarely              |
| 4   | `subcategories`            | ~40                | Occasionally        |
| 5   | `monthly_plan`             | 1/month            | Monthly             |
| 6   | `income_entries`           | ~2–5/month         | On income arrival   |
| 7   | `income_allocations`       | ~10–25/month       | On income arrival   |
| 8   | `transactions`             | ~30–100/month      | Daily               |
| 9   | `transfers`                | ~5–15/month        | On bucket refills   |
| 10  | `recurring_rules`          | ~5–15              | Rarely              |
| 11  | `financial_goals`          | ~3–10              | Occasionally        |
| 12  | `investments`              | ~2–5               | Rarely              |
| 13  | `investment_contributions` | ~1–3/month         | On SIP/purchase     |
| 14  | `portfolio_snapshots`      | ~2–5/month         | Monthly update      |
| 15  | `budget_snapshots`         | 5/month (at close) | Month close only    |
| 16  | `net_worth_snapshots`      | 1/month (at close) | Month close only    |
| 17  | `alerts`                   | Variable           | Triggered by system |

### Recommended Indexes

```sql
-- Most queries filter by date
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_date_category ON transactions(date, category_id);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_type ON transactions(type);

CREATE INDEX idx_income_entries_date ON income_entries(date);
CREATE INDEX idx_transfers_date ON transfers(date);
CREATE INDEX idx_transfers_from ON transfers(from_account_id);
CREATE INDEX idx_transfers_to ON transfers(to_account_id);

CREATE INDEX idx_contributions_investment ON investment_contributions(investment_id);
CREATE INDEX idx_contributions_date ON investment_contributions(date);

CREATE INDEX idx_snapshots_investment_date ON portfolio_snapshots(investment_id, snapshot_date);
CREATE INDEX idx_budget_snapshots_period ON budget_snapshots(year, month);
CREATE INDEX idx_alerts_dismissed ON alerts(is_dismissed, triggered_at);
CREATE INDEX idx_monthly_plan_period ON monthly_plan(year, month);
```

### Recommended Views

```sql
-- Monthly expenses by bucket
CREATE VIEW v_monthly_bucket_expenses AS
SELECT
  strftime('%Y', t.date) AS year,
  strftime('%m', t.date) AS month,
  b.id AS bucket_id,
  b.name AS bucket_name,
  SUM(t.amount) AS total_spent,
  COUNT(t.id) AS transaction_count
FROM transactions t
JOIN categories c ON t.category_id = c.id
JOIN buckets b ON c.bucket_id = b.id
WHERE t.type = 'EXPENSE'
GROUP BY year, month, b.id;

-- Monthly expenses by category
CREATE VIEW v_monthly_category_expenses AS
SELECT
  strftime('%Y', t.date) AS year,
  strftime('%m', t.date) AS month,
  c.id AS category_id,
  c.name AS category_name,
  b.name AS bucket_name,
  SUM(t.amount) AS total_spent,
  COUNT(t.id) AS transaction_count,
  AVG(t.amount) AS avg_transaction
FROM transactions t
JOIN categories c ON t.category_id = c.id
JOIN buckets b ON c.bucket_id = b.id
WHERE t.type = 'EXPENSE'
GROUP BY year, month, c.id;

-- Monthly expenses by subcategory
CREATE VIEW v_monthly_subcategory_expenses AS
SELECT
  strftime('%Y', t.date) AS year,
  strftime('%m', t.date) AS month,
  c.name AS category_name,
  sc.id AS subcategory_id,
  sc.name AS subcategory_name,
  SUM(t.amount) AS total_spent,
  COUNT(t.id) AS transaction_count
FROM transactions t
JOIN categories c ON t.category_id = c.id
LEFT JOIN subcategories sc ON t.subcategory_id = sc.id
WHERE t.type = 'EXPENSE'
GROUP BY year, month, c.id, sc.id;

-- Investment performance
CREATE VIEW v_investment_performance AS
SELECT
  i.id, i.name, i.type, i.platform,
  i.total_contributed,
  i.current_value,
  (i.current_value - i.total_contributed) AS absolute_gain,
  ROUND(((i.current_value - i.total_contributed) / i.total_contributed) * 100, 2) AS gain_pct,
  (SELECT MIN(date) FROM investment_contributions WHERE investment_id = i.id) AS first_contribution_date,
  (SELECT COUNT(*) FROM investment_contributions WHERE investment_id = i.id) AS contribution_count
FROM investments i
WHERE i.is_active = 1;

-- Goal progress
CREATE VIEW v_goal_progress AS
SELECT
  g.id, g.name, g.goal_type,
  g.target_amount, g.current_amount,
  ROUND((g.current_amount / g.target_amount) * 100, 2) AS progress_pct,
  (g.target_amount - g.current_amount) AS remaining,
  g.monthly_target,
  CASE WHEN g.monthly_target > 0
    THEN CEIL((g.target_amount - g.current_amount) / g.monthly_target)
    ELSE NULL
  END AS months_to_goal,
  g.deadline, g.status, g.priority
FROM financial_goals g
WHERE g.status = 'ACTIVE'
ORDER BY g.priority, progress_pct DESC;

-- Active alerts
CREATE VIEW v_active_alerts AS
SELECT a.*, b.name AS bucket_name, c.name AS category_name,
       g.name AS goal_name, ac.name AS account_name
FROM alerts a
LEFT JOIN buckets b ON a.bucket_id = b.id
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN financial_goals g ON a.goal_id = g.id
LEFT JOIN accounts ac ON a.account_id = ac.id
WHERE a.is_dismissed = 0
ORDER BY a.triggered_at DESC;
```

---

## 14. Day-to-Day Usage Guide

### First-Time Setup Checklist

- [ ] Create all your real-world accounts with opening balances
- [ ] Set opening date for each account (transactions before this date are excluded)
- [ ] Review default categories — add, rename, or deactivate as needed
- [ ] Add subcategories for categories you use most
- [ ] Create your financial goals (start with Emergency Fund)
- [ ] Create your investment records
- [ ] Set up recurring rules (SIP, rent, subscriptions)
- [ ] Create your first monthly plan

### Daily Habit (2 minutes)

1. Open app after any money event
2. Choose the correct action: Expense / Income / Transfer / Investment
3. Fill required fields (amount, account, category)
4. Save — done

If you miss a day, log everything the next morning from memory or bank statement. The system tolerates gaps better than abandonment.

### Weekly Habit (10 minutes, every Sunday)

1. Open dashboard
2. Check bucket burn rates — is any bucket running ahead of pace?
3. Review active alerts — any warnings to act on?
4. Confirm all recurring items ran as expected
5. Glance at goal progress

### Monthly Close Habit (30 minutes, last day of month)

1. Make sure all transactions for the month are logged
2. Log any final recurring items
3. Take portfolio snapshot for each investment
4. Trigger "Close Month" in the app
5. Review the generated reports:
   - Plan vs actual by bucket
   - Category breakdown
   - Savings rate
   - Net worth change
6. Note lessons learned in next month's plan notes
7. Create next month's plan

### Windfall Handling (e.g. Eid money, bonus)

1. Log as income entry with source_type = WINDFALL
2. Apply 50/50 rule: 50% → SAVINGS/INVESTMENTS, 50% → FLEX
3. If emergency fund is not yet full: 70% → SAVINGS, 30% → FLEX
4. Transfer appropriate amounts to respective accounts
5. Link savings allocation to specific goal (e.g. Emergency Fund goal)

---

## Appendix: Terminology Glossary

| Term                   | Definition                                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Bucket**             | Top-level mental container for money. Budget is set here. 5 buckets: NEEDS, INVESTMENTS, SAVINGS, CHARITY, FLEX. |
| **Category**           | The nature of spending. Belongs to a bucket. No budget limit. Used for insight only.                             |
| **Subcategory**        | Drill-down label under a category. Pure metadata. Always computed, never configured.                             |
| **Transaction**        | An outflow of money from your financial world (expense or investment contribution).                              |
| **Transfer**           | Money moving between your own accounts. Never an expense. Invisible to P&L.                                      |
| **Income Entry**       | An inflow of money from outside your financial world.                                                            |
| **Income Allocation**  | How an income entry is split across buckets.                                                                     |
| **Recurring Rule**     | A template that generates transaction confirmations on a schedule.                                               |
| **Financial Goal**     | A named savings target with a specific amount and optional deadline.                                             |
| **Investment**         | A wealth-building vehicle (fund, stocks, etc.) with its own contribution and value tracking.                     |
| **Portfolio Snapshot** | A point-in-time record of an investment's market value.                                                          |
| **Monthly Plan**       | Your budget for a month — expected income and 5 bucket allocations.                                              |
| **Budget Snapshot**    | Immutable record of planned vs actual spending per bucket, generated at month close.                             |
| **Net Worth Snapshot** | Immutable record of total assets minus liabilities, generated at month close.                                    |
| **Derived Balance**    | An account balance computed from transaction history, not stored as a column.                                    |
| **Month Close**        | The action that locks a month, generates all snapshots, and produces reports.                                    |
| **Savings Rate**       | (Income − Expenses) ÷ Income × 100. Target: 30%+.                                                                |
| **Burn Rate**          | Percentage of a bucket's monthly allocation consumed so far this month.                                          |
| **Windfall**           | Unexpected income (bonus, gift, Eid money). Apply 50/50 rule.                                                    |

---

_Document version: 1.0 — Finalized mental model and requirements._
_Last updated: based on complete conversation establishing the mental model._
_Use this document as the single source of truth for all backend, database, and frontend development decisions._
