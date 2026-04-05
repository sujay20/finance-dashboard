let currentRole='viewer';

let currentSection= 'dashboard';

let transactions=[...transactionData];

// menu navigation
function setMenuButtons(){
    const menuButtons= document.querySelectorAll(".menu-btn");
     menuButtons.forEach(function(button,index){
        button.addEventListener('click',function(){
            menuButtons.forEach(function(btn){
                btn.classList.remove('active');
            });

            button.classList.add('active');
            
            if(index===0){
                currentSection='dashboard';
                showDashboard();
            }
            else if(index===1){
                currentSection='transactions';
                showTransactions();
            }
            else if(index===2){
                currentSection='insights';
                showInsights();
            }
        });
     });
}

// role switching 
function setRoleSwitch(){
    const role= document.getElementById('roleselect');

    role.addEventListener('change',function(){
        currentRole= this.value;

        if(currentSection ==='dashboard'){
            showDashboard();
        }
        else if(currentSection ==='transactions'){
            showTransactions();
        }
        else if(currentSection === 'insights'){
            showInsights();
        }
    });
}

// calculate income
function getIncome(){
    let total=0;
    for(let i=0; i<transactions.length; i++){
        if(transactions[i].type === 'income'){
            total+= transactions[i].amount;
        }
    }
    return total;
}
// calculate expense
function getExpense(){
    let total=0;
    for( let i=0; i<transactions.length; i++){
        if(transactions[i].type === 'expense'){
            total+= transactions[i].amount;
        }
    }
    return total;
}
// calculate balance
function getTotalBalance(){
     return getIncome()-getExpense();
}

// cards ( dashboard )
function updateCards(){
    const cards=document.querySelectorAll('.card .amount');

    cards[0].textContent = '₹' + getTotalBalance().toFixed(1);
    cards[1].textContent = '₹' + getIncome().toFixed(1);
    cards[2].textContent = '₹' + getExpense().toFixed(1);
}

// Dashboard Section

function showDashboard(){
    const container= document.querySelector('.container');

    container.innerHTML=`
        <nav class="navbar">
            <h3>Dashboard</h3>
        </nav>

        <!-- Cards Content -->
        <div class="cards-container">
            <div class="card">
                <h4>Total Balance</h4>
                <p class="amount">₹0.0</p>
            </div>
            <div class="card">
                <h4>Income</h4>
                <p class="amount income">₹0.0</p>
            </div>
            <div class="card">
                <h4>Expense</h4>
                <p class="amount expense">₹0.0</p>
            </div>
        </div>

        <div class="chart-section">
            <div class="chart-box">
                <h4> Balance Trend </h4>
                <canvas id="balanceChart"></canvas>
            </div>

            <div class="chart-box">
                <h4>Spending By Category </h4>
                <canvas id="categoryChart"></canvas>
            </div>
        </div>`;
    updateCards();
    getbalanceChart();
    getcategoryChart();
}

// create balance trend chart 
function getbalanceChart(){
    const canvas= document.getElementById('balanceChart');
    const ctx= canvas.getContext('2d');

// initialize last months
    const monthlyData={};
    const today =new Date();
    for( let i=3; i>=0; i--){
        const date= new Date(today.getFullYear(), today.getMonth()-i, 1);
        const monthKey= date.getFullYear() + '-' +String(date.getMonth()+1).padStart(2, '0');
        monthlyData[monthKey]={ income:0 , expense:0, balance:0 };    
    }

// total of each month
    for(let i=0; i<transactions.length; i++){
        const monthKey= transactions[i].date.substring(0,7);

        if(monthlyData[monthKey]){
            if(transactions[i].type === 'income'){
                monthlyData[monthKey].income = monthlyData[monthKey].income + transactions[i].amount;
            }
            else{
                monthlyData[monthKey].expense = monthlyData[monthKey].expense + transactions[i].amount;
            }
        }
    }

// balance for each month
    for(const month in monthlyData){
        monthlyData[month].balance = monthlyData[month].income - monthlyData[month].expense;
    }

// data for chart
    const months= [];
    const balances= [];
    const monthNames= ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (const month in monthlyData){
        const date = new Date(month+ '-01');
        months.push(monthNames[date.getMonth()]);
        balances.push(monthlyData[month].balance);
    }
// canvas size
    canvas.width = canvas.parentElement.clientWidth - 56;
    canvas.height=300;
// clear canvas
    ctx.clearRect(0,0, canvas.width, canvas.height);


    const maxBalance = Math.max(...balances.map(b => Math.abs(b)));

// No data - show message
    if(maxBalance === 0){
        ctx.fillStyle = '#6b7280';
        ctx.font = '16px Poppins';
        ctx.textAlign = 'center';
        ctx.fillText('No  data available', 300, 150);
        return;
    }

    // Draw bars
    const barWidth = 80;
    const gap = 20;
    
    for (let i = 0; i < balances.length; i++) {
        const barHeight = Math.abs((balances[i] / maxBalance) * 200);
        const x = i * (barWidth + gap) + 30;
        const y = balances[i] >= 0 ? 250 - barHeight : 250;
        
        // Draw bar (green for positive, red for negative)
        ctx.fillStyle = balances[i] >= 0 ? '#10b981' : '#ef4444';
        ctx.fillRect(x, y, barWidth, barHeight);
        
         // Draw month label
        ctx.fillStyle = '#000';
        ctx.font = '12px Poppins';
        ctx.textAlign = 'center';
        ctx.fillText(months[i], x + 40, 270);
        
        // Draw value
        ctx.fillText('₹' + balances[i].toFixed(0), x + 40, y - 5);
    }
}

// create Category Chart
function getcategoryChart(){
    const canvas = document.getElementById("categoryChart");
    const ctx= canvas.getContext('2d');

    const categoryTotals = {};
    // Get spending by category
    for(let i=0;i< transactions.length; i++){
        if(transactions[i].type === 'expense'){
            const cat = transactions[i].category;
            if(categoryTotals[cat]){
                categoryTotals[cat]= categoryTotals[cat] + transactions[i].amount;
            }
            else{
                categoryTotals[cat]= transactions[i].amount;
            }
        }
    }
    // convert to arrays 
    const categories =Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);

    // clear canvas
    ctx.clearRect(0,0,canvas.width,canvas.height);

    canvas.width = canvas.parentElement.clientWidth - 56;
    canvas.height=300;

    // colors for each category 
    const colors = ['#8a2be2', '#ff6b6b', '#4ecdc4', '#45b7d1', '#ffa07a'];

    // calculate total for %
    let total=0;
    for(let i=0; i< amounts.length; i++){
        total=total + amounts[i];
    }

    // Draw pie chart
    let currentAngle = 0;
    const centerX = 200;
    const centerY = 150;
    const radius = 100;
    
    for (let i = 0; i < categories.length; i++) {
        const sliceAngle = (amounts[i] / total) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.fillStyle = colors[i];
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();
        
        currentAngle = currentAngle + sliceAngle;
    }
    // Draw legend
    let legendY = 50;
    for (let i = 0; i < categories.length; i++) {
        ctx.fillStyle = colors[i];
        ctx.fillRect(400, legendY, 20, 20);
        
        ctx.fillStyle = '#000';
        ctx.font = '14px Poppins';
        ctx.fillText(categories[i] + ' - ₹' + amounts[i], 430, legendY + 15);
        
        legendY = legendY + 30;
    }
}

//  Transaction Section

function showTransactions(){
    const container = document.querySelector(".container");

    // dispaly add button based on role 
    const addButton = currentRole === 'admin'?
    `<button class="add-btn" onclick="openAddDialog()">
        <span class="material-icons">add</span>
        Add
    </button>` : '' ;

    container.innerHTML=`
        <nav class="navbar">
            <h3>Transactions</h3>
            ${addButton}
        </nav>
        <div class="transaction-filters">
            <input type="text" id="searchInput" placeholder="Search transactions...">
            
            <select id="typeFilter">
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
            </select>
            
            <select id="categoryFilter">
                <option value="all">All Categories</option>
                <option value="Salary">Salary</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Shopping">Shopping</option>
            </select>
            
            <select id="monthFilter">
                <option value="all">All Months</option>
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
            </select>
        </div>

        <div class="transaction-table-container">
            <table class="transaction-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Amount</th>
                        ${currentRole === 'admin' ? '<th>Actions</th>' : ''}
                    </tr>
                </thead>
                <tbody id="transactionTableBody">
                </tbody>
            </table>
        </div>`;
    displayTransactions(transactions);
    setupFilters();
}

// Display transactions in table
function displayTransactions(transactionsToShow) {
    const tbody = document.getElementById('transactionTableBody');
    tbody.innerHTML = '';
    
    for (let i = transactionsToShow.length-1; i >=0 ; i--) {
        const t = transactionsToShow[i];
        const row = document.createElement('tr');
        
        const typeClass = t.type === 'income' ? 'income-type' : 'expense-type';
        
        row.innerHTML = `
            <td>${t.date}</td>
            <td>${t.description}</td>
            <td>${t.category}</td>
            <td><span class="${typeClass}">${t.type}</span></td>
            <td>₹${t.amount}</td>
            ${currentRole === 'admin' ? 
                `<td>
                    <button class="edit-btn" onclick="editTransaction(${t.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteTransaction(${t.id})">Delete</button>
                </td>` : ''}
        `;
        
        tbody.appendChild(row);
    }
}

// Setup filter listeners
function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const monthFilter = document.getElementById('monthFilter');
    
    // Filter function
    function filterTransactions() {
        let filtered = transactions;
        
        // Search filter
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(function(t) {
                return t.description.toLowerCase().includes(searchTerm) ||
                       t.category.toLowerCase().includes(searchTerm);
            });
        }
        
        // Type filter
        if (typeFilter.value !== 'all') {
            filtered = filtered.filter(function(t) {
                return t.type === typeFilter.value;
            });
        }
        
        // Category filter
        if (categoryFilter.value !== 'all') {
            filtered = filtered.filter(function(t) {
                return t.category === categoryFilter.value;
            });
        }
        
        // Month filter
        if (monthFilter.value !== 'all') {
            filtered = filtered.filter(function(t) {
                return t.date.split('-')[1] === monthFilter.value;
            });
        }
        
        displayTransactions(filtered);
    }
    
    // Add event listeners
    searchInput.addEventListener('input', filterTransactions);
    typeFilter.addEventListener('change', filterTransactions);
    categoryFilter.addEventListener('change', filterTransactions);
    monthFilter.addEventListener('change', filterTransactions);
}

// open add dialog box 
function openAddDialog() {
    const dialog = document.createElement('div');

    dialog.className = 'dialog-overlay';

    dialog.innerHTML = `
        <div class="dialog-box">
            <h3>Add Transaction</h3>
            
            <label>Date</label>
            <input type="date" id="dialogDate" value="${new Date().toISOString().split('T')[0]}">
            
            <label>Type</label>
            <select id="dialogType">
                <option value="income">Income</option>
                <option value="expense">Expense</option>
            </select>
            
            <label>Category</label>
            <select id="dialogCategory">
                <option value="Salary">Salary</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Shopping">Shopping</option>
            </select>
            
            <label>Amount</label>
            <input type="number" id="dialogAmount" placeholder="Enter amount">
            
            <label>Description</label>
            <input type="text" id="dialogDescription" placeholder="Enter description">
            
            <div class="dialog-buttons">
                <button class="cancel-btn" onclick="closeDialog()">Cancel</button>
                <button class="save-btn" onclick="saveTransaction()">Save</button>
            </div>
        </div>`;
    
    document.body.appendChild(dialog);
}
// Close Dialog
function closeDialog() {
    const dialog = document.querySelector('.dialog-overlay');
    if (dialog) {
        dialog.remove();
    }
}

// Save Transaction
function saveTransaction() {
    const date = document.getElementById('dialogDate').value;
    const type = document.getElementById('dialogType').value;
    const category = document.getElementById('dialogCategory').value;
    const amount = parseFloat(document.getElementById('dialogAmount').value);
    const description = document.getElementById('dialogDescription').value;
    
    // Validation
    if (!date || !amount || !description) {
        alert('Please fill all fields');
        return;
    }
    
    // Create new transaction
    const newTransaction = {
        id: transactions.length + 1,
        date: date,
        type: type,
        category: category,
        amount: amount,
        description: description
    };
    
    // Add to transactions array
    transactions.push(newTransaction);
    
    // Close dialog and refresh
    closeDialog();
    showTransactions();
    updateCards();
}

// Edit Transaction
function editTransaction(id) {
    const transaction = transactions.find(function(t) {
        return t.id === id;
    });
    
    if (!transaction) return;
    
    // Create edit dialog
    const dialog = document.createElement('div');
    dialog.className = 'dialog-overlay';
    dialog.innerHTML = `
        <div class="dialog-box">
            <h3>Edit Transaction</h3>
            
            <label>Date</label>
            <input type="date" id="dialogDate" value="${transaction.date}">
            
            <label>Type</label>
            <select id="dialogType">
                <option value="income" ${transaction.type === 'income' ? 'selected' : ''}>Income</option>
                <option value="expense" ${transaction.type === 'expense' ? 'selected' : ''}>Expense</option>
            </select>
            
            <label>Category</label>
            <select id="dialogCategory">
                <option value="Salary" ${transaction.category === 'Salary' ? 'selected' : ''}>Salary</option>
                <option value="Food" ${transaction.category === 'Food' ? 'selected' : ''}>Food</option>
                <option value="Transport" ${transaction.category === 'Transport' ? 'selected' : ''}>Transport</option>
                <option value="Shopping" ${transaction.category === 'Shopping' ? 'selected' : ''}>Shopping</option>
            </select>
            
            <label>Amount</label>
            <input type="number" id="dialogAmount" value="${transaction.amount}">
            
            <label>Description</label>
            <input type="text" id="dialogDescription" value="${transaction.description}">
            
            <div class="dialog-buttons">
                <button class="cancel-btn" onclick="closeDialog()">Cancel</button>
                <button class="save-btn" onclick="updateTransaction(${id})">Update</button>
            </div>
        </div>`;
    
    document.body.appendChild(dialog);
}

// Update Transaction
function updateTransaction(id) {
    const date = document.getElementById('dialogDate').value;
    const type = document.getElementById('dialogType').value;
    const category = document.getElementById('dialogCategory').value;
    const amount = parseFloat(document.getElementById('dialogAmount').value);
    const description = document.getElementById('dialogDescription').value;
    
    // Find and update transaction
    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].id === id) {
            transactions[i].date = date;
            transactions[i].type = type;
            transactions[i].category = category;
            transactions[i].amount = amount;
            transactions[i].description = description;
            break;
        }
    }
    
    closeDialog();
    showTransactions();
    updateCards();
}

// Delete Transaction
function deleteTransaction(id) {
    transactions = transactions.filter(function(t) {
            return t.id !== id;
        });
        
    showTransactions();
    updateCards();
}

// Insights Section

function showInsights(){
    const container = document.querySelector('.container');
    
    // Calculate insights
    const mostSpendingCategory = getMostSpendingCategory();
    const mostUsedCategory = getMostUsedCategory();
    
    container.innerHTML = `
        <nav class="navbar">
            <h3>Insights</h3>
        </nav>

        <div class="insights-cards">
            <div class="insight-card">
                <h4>Most Spending Category</h4>
                <p class="insight-value">${mostSpendingCategory.category}</p>
                <p class="insight-amount">₹${mostSpendingCategory.amount}</p>
            </div>
            
            <div class="insight-card">
                <h4>Most Used Category</h4>
                <p class="insight-value">${mostUsedCategory.category}</p>
                <p class="insight-count">${mostUsedCategory.count} transactions</p>
            </div>
        </div>

        <div class="chart-section">
            <div class="chart-box">
                <h4>Monthly Income vs Expense</h4>
                <canvas id="incomeExpenseChart"></canvas>
            </div>
        </div>`;
    
    createIncomeExpenseChart();
}

// Most spending category 
function getMostSpendingCategory() {
    const categoryTotals = {};
    
    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].type === 'expense') {
            const cat = transactions[i].category;
            if (categoryTotals[cat]) {
                categoryTotals[cat] = categoryTotals[cat] + transactions[i].amount;
            } else {
                categoryTotals[cat] = transactions[i].amount;
            }
        }
    }
    
    let maxCategory = 'None';
    let maxAmount = 0;
    
    for (const cat in categoryTotals) {
        if (categoryTotals[cat] > maxAmount) {
            maxAmount = categoryTotals[cat];
            maxCategory = cat;
        }
    }
    
    return { category: maxCategory, amount: maxAmount };
}

// most used category 
function getMostUsedCategory() {
    const categoryCounts = {};
    
    for (let i = 0; i < transactions.length; i++) {
        const cat = transactions[i].category;
        if (categoryCounts[cat]) {
            categoryCounts[cat] = categoryCounts[cat] + 1;
        } else {
            categoryCounts[cat] = 1;
        }
    }
    
    let maxCategory = 'None';
    let maxCount = 0;
    
    for (const cat in categoryCounts) {
        if (categoryCounts[cat] > maxCount) {
            maxCount = categoryCounts[cat];
            maxCategory = cat;
        }
    }
    
    return { category: maxCategory, count: maxCount };
}

// Income Expense Chart

function createIncomeExpenseChart() {
    const canvas = document.getElementById('incomeExpenseChart');
    const ctx = canvas.getContext('2d');
    
    // Get monthly data
    const monthlyData = {
        '01': { income: 0, expense: 0 },
        '02': { income: 0, expense: 0 },
        '03': { income: 0, expense: 0 }
    };
    
    for (let i = 0; i < transactions.length; i++) {
        const month = transactions[i].date.split('-')[1];
        if (monthlyData[month]) {
            if (transactions[i].type === 'income') {
                monthlyData[month].income = monthlyData[month].income + transactions[i].amount;
            } else {
                monthlyData[month].expense = monthlyData[month].expense + transactions[i].amount;
            }
        }
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas size
    canvas.width = canvas.parentElement.clientWidth - 56;
    canvas.height = 350;
    
    // Data
    const months = ['January', 'February', 'March'];
    const incomes = [monthlyData['01'].income, monthlyData['02'].income, monthlyData['03'].income];
    const expenses = [monthlyData['01'].expense, monthlyData['02'].expense, monthlyData['03'].expense];
    
    // Find max value
    const maxValue = Math.max(...incomes, ...expenses);
    
    // Draw bars
    const barWidth = 60;
    const gap = 40;
    const groupGap = 120;
    
    for (let i = 0; i < months.length; i++) {
        const x = i * groupGap + 50;
        
        // Income bar (green)
        const incomeHeight = (incomes[i] / maxValue) * 250;
        ctx.fillStyle = '#10b981';
        ctx.fillRect(x, 300 - incomeHeight, barWidth, incomeHeight);
        
        // Expense bar (red)
        const expenseHeight = (expenses[i] / maxValue) * 250;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + barWidth + 10, 300 - expenseHeight, barWidth, expenseHeight);
        
        // Month label
        ctx.fillStyle = '#000';
        ctx.font = '14px Poppins';
        ctx.fillText(months[i], x + 20, 330);
    }
    
    // Legend
    ctx.fillStyle = '#10b981';
    ctx.fillRect(500, 50, 20, 20);
    ctx.fillStyle = '#000';
    ctx.fillText('Income', 530, 65);
    
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(500, 80, 20, 20);
    ctx.fillStyle = '#000';
    ctx.fillText('Expense', 530, 95);
}

// initialize application
document.addEventListener('DOMContentLoaded', function() {
    setMenuButtons();
    setRoleSwitch();
    showDashboard();
});

