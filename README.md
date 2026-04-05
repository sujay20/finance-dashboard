# Finance Dashboard

A simple web-based Finance Dashboard that helps users track income and expenses, view insights, and manage transactions easily.
---

## 🚀 Features

-  **Dashboard Overview**
  - Shows Total Balance, Income, and Expenses
  - Simple charts for balance trend and spending categories

-  **Transaction Management**
  - View all transactions in a table
  - Filter by type, category, and month
  - Search transactions easily

-  **Add / Edit / Delete (Admin only)**
  - Admin can add new transactions
  - Edit or delete existing ones

-  **Role Switching**
  - Viewer → Can only view data
  - Admin → Can manage transactions

-  **Insights Section**
  - Shows:
    - Most spending category
    - Most used category

---

##  Tech Stack

- HTML
- CSS
- JavaScript (Vanilla JS)

---

##  Project Structure
├── index.html # Main HTML file
├── style.css # Styling
├── script.js # Main logic
├── data.js # Sample transaction data
├── images/ # Logo 

---

## Setup Instructions

1. Download or clone the project  
2. Open the project folder  
3. Open `index.html` in your browser  

(No server required)

---

##  How It Works

- Transactions are stored in `data.js`
- `script.js` handles:
  - Calculations (income, expense, balance)
  - UI updates
  - Filtering and search
- Sections (Dashboard / Transactions / Insights) update dynamically
- Charts are drawn using HTML `<canvas>`

---

##  Example Data

Includes sample transactions like:
- Salary (Income)
- Food (Expense)
- Transport (Expense)

---

##  Roles

- **Viewer**
  - Can only view data

- **Admin**
  - Can add, edit, and delete transactions

---
