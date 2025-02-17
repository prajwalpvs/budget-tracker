const balanceEl = document.getElementById('balance');
const incomeAmountEl = document.getElementById('income-amount');
const expenseAmountEl = document.getElementById('expense-amount');
const transactionFormEl = document.getElementById('transaction-form');
const descriptionEl = document.getElementById('description');
const amountEl = document.getElementById('amount');
const transactionListEl = document.getElementById('transaction-list');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

function init() {
    transactionListEl.innerHTML = '';
    transactions.forEach(addTransactionToDOM);
    updateValues();
}

function addTransaction(e) {
    e.preventDefault();

    if (!descriptionEl.value.trim() || !amountEl.value.trim()) {
        alert('Please add both description and amount');
        return;
    }

    const transaction = {
        id: generateID(),
        description: descriptionEl.value.trim(),
        amount: parseFloat(amountEl.value),
        timestamp: new Date().toISOString()
    };

    transactions.push(transaction);
    addTransactionToDOM(transaction);
    updateValues();
    updateLocalStorage();

    descriptionEl.value = '';
    amountEl.value = '';
}

function generateID() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

function addTransactionToDOM(transaction) {
    const sign = transaction.amount < 0 ? '-' : '+';
    const amount = Math.abs(transaction.amount).toFixed(2);
    
    const li = document.createElement('li');
    li.classList.add('transaction-item');
    li.classList.add(transaction.amount < 0 ? 'expense' : 'income');
    
    li.innerHTML = `
        <div class="transaction-info">
            <span class="description">${transaction.description}</span>
            <span class="amount">${sign}$${amount}</span>
        </div>
        <button class="delete-btn" onclick="removeTransaction(${transaction.id})">×</button>
    `;

    transactionListEl.insertBefore(li, transactionListEl.firstChild);
}

function updateValues() {
    const amounts = transactions.map(transaction => transaction.amount);
    
    const total = amounts.reduce((acc, item) => (acc + item), 0);
    
    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc + item), 0);
    
    const expense = Math.abs(amounts
        .filter(item => item < 0)
        .reduce((acc, item) => (acc + item), 0));
    
    balanceEl.textContent = `$${total.toFixed(2)}`;
    incomeAmountEl.textContent = `$${income.toFixed(2)}`;
    expenseAmountEl.textContent = `$${expense.toFixed(2)}`;
}

function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateLocalStorage();
    init();
}

function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function exportToCSV() {
    // Exit if no transactions
    if (transactions.length === 0) {
        alert('No transactions to export');
        return;
    }

    // Prepare CSV headers and data
    const headers = ['Date', 'Description', 'Amount', 'Type'];
    const csvData = transactions.map(transaction => {
        const date = new Date(transaction.timestamp).toLocaleDateString();
        const type = transaction.amount >= 0 ? 'Income' : 'Expense';
        return [
            date,
            transaction.description,
            Math.abs(transaction.amount).toFixed(2),
            type
        ];
    });

    // Add headers to the beginning of csvData
    csvData.unshift(headers);

    // Convert to CSV string
    const csvString = csvData.map(row => 
        row.map(cell => 
            // Escape quotes and wrap in quotes if contains comma
            typeof cell === 'string' && (cell.includes(',') || cell.includes('"')) 
                ? `"${cell.replace(/"/g, '""')}"` 
                : cell
        ).join(',')
    ).join('\n');

    // Create and trigger download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `budget-tracker-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


transactionFormEl.addEventListener('submit', addTransaction);


init();