
// Transactions Section
let transactions = JSON.parse(localStorage.getItem(`transactions_${currentUser.username}`)) || [];
const transactionTableBody = document.getElementById("transactionsBody");
const addTransactionBtn = document.getElementById("addT");
const editTransactionBtn = document.getElementById("editT");
const deleteTransactionBtn = document.getElementById("deleteT");
const clearTransactionBtn = document.getElementById("clearT");
let selectedTransactionRow = null;

// Load boarders into dropdown
function loadBoardersDropdown() {
    const dropdown = document.getElementById("boarderDropdown");
    dropdown.innerHTML = `<option value="" disabled selected>Select Boarder or Admin</option>`;

    const boarders = JSON.parse(localStorage.getItem(`boarders_${currentUser.username}`)) || [];
    boarders.forEach(b => {
        const option = document.createElement("option");
        option.value = b.name;
        option.textContent = b.name;
        dropdown.appendChild(option);
    });

    const adminOption = document.createElement("option");
    adminOption.value = "Admin";
    adminOption.textContent = "Admin";
    dropdown.appendChild(adminOption);
}

// Render transactions table
function renderTransactionsTable() {
    transactionTableBody.innerHTML = "";

    if (transactions.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="6" style="text-align: center;">No transactions yet</td>`;
        transactionTableBody.appendChild(row);
        return;
    }

    transactions.forEach((transaction, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.person}</td>
            <td>${transaction.particulars}</td>
            <td>₱${transaction.debit || "0"}</td>
            <td>₱${transaction.credit || "0"}</td>
            <td>${transaction.month || ''}</td>
        `;

        row.onclick = function () {
            selectedTransactionRow = index;
            fillTransactionForm(transaction, row);
            document.getElementById("boarderDropdown").disabled = true;
        };

        transactionTableBody.appendChild(row);
    });
}

// Fill the form
function fillTransactionForm(transaction, rowElement) {
    document.getElementById("transactionDate").value = transaction.date;
    document.getElementById("boarderDropdown").value = transaction.person || "";
    document.getElementById("particulars").value = transaction.particulars;
    document.getElementById("debit").value = transaction.debit || "";
    document.getElementById("credit").value = transaction.credit || "";
    document.getElementById("transactionMonth").value = transaction.month || "";


    document.querySelectorAll("#transactionsBody tr").forEach(row => row.classList.remove("selected-row"));
    if (rowElement) rowElement.classList.add("selected-row");
}

// Clear form
function clearTransactionForm() {
    // check if the form is empty
    if (!document.getElementById("transactionDate").value && !document.getElementById("boarderDropdown").value && !document.getElementById("particulars").value && !document.getElementById("debit").value && !document.getElementById("credit").value && !document.getElementById("transactionMonth").value) {
        return alert("Form is already empty.");
    }
    document.getElementById("transactionDate").value = "";
    document.getElementById("boarderDropdown").value = "";
    document.getElementById("particulars").value = "";
    document.getElementById("debit").value = "";
    document.getElementById("credit").value = "";
    document.getElementById("transactionMonth").value = "";
    selectedTransactionRow = null;

    document.getElementById("boarderDropdown").disabled = false;


}

function saveTransactions() {
    localStorage.setItem(`transactions_${currentUser.username}`, JSON.stringify(transactions));
}

// Add
addTransactionBtn.onclick = function () {
    const date = document.getElementById("transactionDate").value;
    const person = document.getElementById("boarderDropdown").value;
    const particulars = document.getElementById("particulars").value;
    const debit = document.getElementById("debit").value || 0;
    const credit = document.getElementById("credit").value || 0;
    const month = document.getElementById("transactionMonth").value;

    if (!date || !person || !particulars) {
        return alert("Please fill out all fields first.");
    }

    if (!isValidDateFormat(date)) {
        return alert("Please enter a valid date (YYYY/MM/DD) and ensure the date is not greater than today's date");
    }

    if (!confirm("Are you sure you want to add this transaction?")) return;

    if (!month) {
        return alert("Please select the transaction month.");
    }

    const newTransaction = { date, person, particulars, debit, credit, month };
    transactions.push(newTransaction);

    
    saveTransactions();
    clearTransactionForm();
    autoMatchTransactionsToBills()
    localStorage.setItem(`boarderBills_${currentUser.username}`, JSON.stringify(boarderBills));

    renderTable();
    renderBillTable();
    
    loadBoardersForBills();
    loadBoardersDropdown();
    renderTransactionsTable();
};

// Edit
editTransactionBtn.onclick = function () {
    if (selectedTransactionRow === null) return alert("Select a transaction to edit.");

    const date = document.getElementById("transactionDate").value;
    const person = document.getElementById("boarderDropdown").value;
    const particulars = document.getElementById("particulars").value;
    const debit = document.getElementById("debit").value || 0;
    const credit = document.getElementById("credit").value || 0;
    const month = document.getElementById("transactionMonth").value;


    if (!date || !person || !particulars) {
        return alert("Please fill out all fields first.");
    }

    if (!isValidDateFormat(date)) {
        return alert("Please enter a valid date (YYYY/MM/DD).");
    }

    if (!confirm("Are you sure you want to update this transaction?")) return;

    transactions[selectedTransactionRow] = { date, person, particulars, debit, credit, month };
    saveTransactions();
    clearTransactionForm();
    autoMatchTransactionsToBills();
    localStorage.setItem(`boarderBills_${currentUser.username}`, JSON.stringify(boarderBills));

    renderTable();
    renderBillTable();
    
    loadBoardersForBills();
    loadBoardersDropdown();
    renderTransactionsTable();
};

// Delete
deleteTransactionBtn.onclick = function () {
    if (selectedTransactionRow === null) return alert("Select a transaction to delete.");

    if (confirm("Are you sure you want to delete this transaction?")) {
        // Get the transaction that is being deleted
        const transactionToDelete = transactions[selectedTransactionRow];
        const transactionMonth = transactionToDelete.month;
        const transactionBoarder = transactionToDelete.person;
        const transactionParticulars = transactionToDelete.particulars;

        // Remove the transaction
        transactions.splice(selectedTransactionRow, 1);
        saveTransactions();
        clearTransactionForm();


        // Recalculate all bill matches from scratch
        autoMatchTransactionsToBills();
        

        localStorage.setItem(`boarderBills_${currentUser.username}`, JSON.stringify(boarderBills));
        console.log("Updated boarderBills:", boarderBills); // Debug line



        document.getElementById("boarderDropdown").disabled = false;

        renderTable();
        renderBillTable();
        renderTransactionsTable();
        loadBoardersForBills();
        loadBoardersDropdown();

    }
};

// Clear
clearTransactionBtn.onclick = function () {
    clearTransactionForm();
    autoMatchTransactionsToBills();
    renderTable();
    renderBillTable();
    renderTransactionsTable();
    
    loadBoardersForBills();
    loadBoardersDropdown();

};

// Search
function filterTransactions() {
    const searchTerm = document.getElementById("searchTransaction").value.toLowerCase();
    const filtered = [];

    transactions.forEach((transaction, index) => {
        if (
            transaction.particulars.toLowerCase().includes(searchTerm) ||
            transaction.date.includes(searchTerm) ||
            transaction.person.toLowerCase().includes(searchTerm)) {
            filtered.push({ ...transaction, actualIndex: index });
        }
    });

    renderFilteredTransactionsTable(filtered);
}

function renderFilteredTransactionsTable(filteredTransactions) {
    transactionTableBody.innerHTML = "";
    if (filteredTransactions.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="6" style="text-align: center;">No transactions match the search term</td>`;
        transactionTableBody.appendChild(row);
        return;
    }

    filteredTransactions.forEach((transaction) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.person}</td>
            <td>${transaction.particulars}</td>
            <td>${transaction.debit || "0"}</td>
            <td>₱${transaction.credit || "0"}</td>
            <td>₱${transaction.month || ''}</td>
            
        `;
        row.onclick = function () {
            selectedTransactionRow = transaction.actualIndex;
            fillTransactionForm(transaction, row);

        };
        transactionTableBody.appendChild(row);
    });
}

// Initialize
renderTransactionsTable();




