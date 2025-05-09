
function updateKPICards() {
    const boarders = JSON.parse(localStorage.getItem(`boarders_${currentUser.username}`)) || [];
    const transactions = JSON.parse(localStorage.getItem(`transactions_${currentUser.username}`)) || [];
    const bills = JSON.parse(localStorage.getItem(`bills_${currentUser.username}`)) || [];

    document.getElementById('kpiBoarders').textContent = boarders.length;

    // Total Income (sum of all debits)
    const incomeTotal = transactions
        .filter(t => t.debit && !isNaN(t.debit))
        .reduce((sum, t) => sum + Number(t.debit), 0);
    document.getElementById('kpiIncome').textContent = incomeTotal.toFixed(2);

    // Total Expenses (sum of all credits)
    const expenseTotal = transactions
        .filter(t => t.credit && !isNaN(t.credit))
        .reduce((sum, t) => sum + Number(t.credit), 0);
    document.getElementById('kpiExpenses').textContent = expenseTotal.toFixed(2);

    // Net Income (Income - Expenses)
    const netIncome = incomeTotal - expenseTotal;
    document.getElementById('kpiNetIncome').textContent = netIncome.toFixed(2);

    // Total Unpaid Bills
    const unpaidTotal = bills
        .filter(b => b.status === 'unpaid')
        .reduce((sum, b) => sum + (b.amount - (b.paidAmount || 0)), 0);
    document.getElementById('kpiUnpaid').textContent = unpaidTotal.toFixed(2);

    // Partially Paid Bills Count
    const partialCount = bills.filter(b => b.status === 'partial').length;
    document.getElementById('kpiPartial').textContent = partialCount;
}

function addActivityLog(action, details) {
    const logBody = document.getElementById("activityLogBody");
    const now = new Date();
    const time = now.toLocaleString();
    const newLog = `<tr><td>${time}</td><td>${action}</td><td>${details}</td></tr>`;
    logBody.insertAdjacentHTML('afterbegin', newLog); // Add new log at the top

    // Get current logs from localStorage, or initialize as empty array
    const activityLogs = JSON.parse(localStorage.getItem("activityLogs")) || [];

    // Add the new log to the array
    activityLogs.unshift({ time, action, details });

    // Keep only the last 50 logs (you can adjust this number as needed)
    if (activityLogs.length > 50) {
        activityLogs.pop(); // Remove the oldest log if more than 50 logs exist
    }

    // Save the updated logs back to localStorage
    localStorage.setItem("activityLogs", JSON.stringify(activityLogs));
}

function renderActivityLog() {
    const logBody = document.getElementById("activityLogBody");
    const activityLogs = JSON.parse(localStorage.getItem("activityLogs")) || [];

    // Clear existing rows
    logBody.innerHTML = "";

    if (activityLogs.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="3" style="text-align: center;">No recent activity yet</td>`;
        logBody.appendChild(row);
        return;
    }

    // Insert each log entry
    activityLogs.forEach(log => {
        const row = `<tr>
            <td>${log.time}</td>
            <td>${log.action}</td>
            <td>${log.details}</td>
        </tr>`;
        logBody.insertAdjacentHTML("beforeend", row);
    });
}


function loadOutstandingBalances(selectedMonth) {
    const bills = JSON.parse(localStorage.getItem(`bills_${currentUser.username}`)) || [];

    // Include both unpaid and partially paid bills for the selected month
    const relevantBills = bills.filter(bill =>
        bill.month === selectedMonth &&
        (bill.status === 'unpaid' || bill.status === 'partial')
    );

    // Initialize an empty object to hold outstanding balances per boarder
    const boarderBalances = {};

    relevantBills.forEach(bill => {
        if (!boarderBalances[bill.boarder]) {
            boarderBalances[bill.boarder] = 0;
        }

        const paidAmount = bill.paidAmount || 0;
        const remainingBalance = bill.amount - paidAmount;

        boarderBalances[bill.boarder] += remainingBalance;
    });

    const boarderBalanceBody = document.getElementById('boarderBalanceBody');
    boarderBalanceBody.innerHTML = '';

    if (Object.keys(boarderBalances).length === 0) {
        boarderBalanceBody.innerHTML = `<tr><td colspan="2" style="text-align:center;">No outstanding balances for ${selectedMonth}</td></tr>`;
    } else {
        for (let boarder in boarderBalances) {
            const balance = boarderBalances[boarder].toFixed(2);
            const row = `<tr>
                            <td>${boarder}</td>
                            <td>₱${balance}</td>
                        </tr>`;
            boarderBalanceBody.insertAdjacentHTML('beforeend', row);
        }
    }
}


document.addEventListener('DOMContentLoaded', function () {
    // Set the default value of the month selector to the current month
    const currentMonth = new Date().toISOString().slice(0, 7); // Format as YYYY-MM
    const monthSelector = document.getElementById('monthSelector');
    monthSelector.value = currentMonth;

    // Load the balances for the current month
    loadOutstandingBalances(currentMonth);

    // Add event listener for month selection change
    monthSelector.addEventListener('change', function () {
        const selectedMonth = this.value; // Get the selected month
        loadOutstandingBalances(selectedMonth);
    });
});

// Initialization

renderActivityLog();
updateKPICards();
autoMatchTransactionsToBills();
renderTable();
renderBillTable();
renderTransactionsTable();
loadBoardersForBills();
loadBoardersDropdown();

