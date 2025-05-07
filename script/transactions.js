// Transactions Section

let transactions = JSON.parse(localStorage.getItem(`transactions_${currentUser.username}`)) || [];
const transactionTableBody = document.getElementById("transactionsBody");
const addTransactionBtn = document.getElementById("addT");
const editTransactionBtn = document.getElementById("editT");
const deleteTransactionBtn = document.getElementById("deleteT");
const clearTransactionBtn = document.getElementById("clearT");

let selectedTransactionRow = null;

////////// adding a transaction ////////////////////////////////////////////////////////////////////////////////////////////////////////

addTransactionBtn.onclick = function () {
    const date = document.getElementById("transactionDate").value;
    const person = document.getElementById("boarderDropdown").value;
    const particulars = document.getElementById("particulars").value;
    const debit = document.getElementById("debit").value || 0;
    const credit = document.getElementById("credit").value || 0;
    const month = document.getElementById("transactionMonth").value;

    if (!date || !person || !particulars) {
        return alert("Please fill out date, person, and particular fields first.");
    }

    if (!isValidDateFormat(date)) {
        return alert("Please enter a valid date (YYYY/MM/DD) and ensure the date is not greater than today's date");
    }

    if (!month) {
        return alert("Please select the transaction month.");
    }

    if (!confirm("Are you sure you want to add this transaction?")) return;

    const newTransaction = { date, person, particulars, debit, credit, month };
    transactions.push(newTransaction);

    // Save updated data
    saveTransactions();

    // Clear the form and update the tables
    clearTransactionForm();
    renderTransactionsTable();

    autoMatchTransactionsToBills()
    renderBillTable();

    updateKPICards(); // for overview section
    loadOutstandingBalances(month); // for overview section

    loadBoardersForBills();
    loadBoardersDropdown();

    addActivityLog("Added Transaction", `Date: ${date}, Person: ${person}, Particulars: ${particulars}, Debit: ${debit}, Credit: ${credit}, Month: ${month}`);
    alert("Transaction added successfully.");
};

////////// editing a transaction ////////////////////////////////////////////////////////////////////////////////////////////////////////

editTransactionBtn.onclick = function () {
    if (selectedTransactionRow === null) return alert("Please click a row to select a transaction from the table.");

    // Get the current (original) transaction data
    const originalTransaction = transactions[selectedTransactionRow];

    const date = document.getElementById("transactionDate").value;
    const person = document.getElementById("boarderDropdown").value;
    const particulars = document.getElementById("particulars").value;
    const debit = document.getElementById("debit").value || 0;
    const credit = document.getElementById("credit").value || 0;
    const month = document.getElementById("transactionMonth").value;

    if (!date || !person || !particulars) {
        return alert("Please fill out date, person, and particular fields first.");
    }

    if (!isValidDateFormat(date)) {
        return alert("Please enter a valid date (YYYY/MM/DD).");
    }

    // Check if there's no changes in the form
    if (originalTransaction.date === date && originalTransaction.person === person &&
        originalTransaction.particulars === particulars && originalTransaction.debit === debit &&
        originalTransaction.credit === credit && originalTransaction.month === month) {
        return alert("No changes made to the transaction.");
    }

    if (!confirm("Are you sure you want to edit this transaction?")) return;

    // Log the changes
    let logMessage = `Updated transaction for ${person} (Particulars: ${particulars}, Date: ${date})`;
    if (originalTransaction.date !== date) logMessage += `, Date: ${originalTransaction.date} → ${date}`;
    if (originalTransaction.person !== person) logMessage += `, Person: ${originalTransaction.person} → ${person}`;
    if (originalTransaction.particulars !== particulars) logMessage += `, Particulars: ${originalTransaction.particulars} → ${particulars}`;
    if (originalTransaction.debit !== debit) logMessage += `, Debit: ${originalTransaction.debit} → ${debit}`;
    if (originalTransaction.credit !== credit) logMessage += `, Credit: ${originalTransaction.credit} → ${credit}`;
    if (originalTransaction.month !== month) logMessage += `, Month: ${originalTransaction.month} → ${month}`;

    addActivityLog("Edited Transaction", logMessage);

    // Update the transaction
    transactions[selectedTransactionRow] = { date, person, particulars, debit, credit, month };

    // Save and update UI
    saveTransactions();
    clearTransactionForm();

    autoMatchTransactionsToBills();
    localStorage.setItem(`bills_${currentUser.username}`, JSON.stringify(boarderBills));

    renderTable();
    renderBillTable();
    renderTransactionsTable();

    updateKPICards();
    loadOutstandingBalances(month);

    loadBoardersForBills();
    loadBoardersDropdown();

    alert("Transaction updated successfully.");
};

////////// deleting a transaction ////////////////////////////////////////////////////////////////////////////////////////////////////////

deleteTransactionBtn.onclick = function () {
    if (selectedTransactionRow === null) return alert("Select a transaction from the table to delete.");

        // const transactionToDelete = transactions[selectedTransactionRow];

        const date = document.getElementById("transactionDate").value;
        const person = document.getElementById("boarderDropdown").value;
        const particulars = document.getElementById("particulars").value;
        const debit = document.getElementById("debit").value || 0;
        const credit = document.getElementById("credit").value || 0;
        const month = document.getElementById("transactionMonth").value;

        selectedTransactionRow = transactions.findIndex(transactions =>
            transactions.date === date &&
            transactions.person === person &&
            transactions.particulars === particulars &&
            transactions.debit === debit &&
            transactions.credit === credit &&
            transactions.month === month 
        );
        if (!confirm("Are you sure you want to delete this transaction?")) return;

        // Remove the transaction
        transactions.splice(selectedTransactionRow, 1);

        saveTransactions();
        renderTransactionsTable();

        clearTransactionForm();

        // Recalculate all bill matches from scratch
        autoMatchTransactionsToBills();
        localStorage.setItem(`bills_${currentUser.username}`, JSON.stringify(boarderBills));
        document.getElementById("boarderDropdown").disabled = false;

        renderTable();
        renderBillTable();

        loadOutstandingBalances(month);
        updateKPICards();

        loadBoardersForBills();
        loadBoardersDropdown();

        addActivityLog("Deleted Transaction", `Date: ${date}, Person: ${person}, Particulars: ${particulars}, Debit: ${debit}, Credit: ${credit}, Month: ${month}`);
        alert("Transaction deleted successfully.");

    };

////////// clearing form fields  ////////////////////////////////////////////////////////////////////////////////////////////////////////

clearTransactionBtn.onclick = function () {
    clearTransactionForm();

    autoMatchTransactionsToBills();
    renderTable();
    renderBillTable();
    renderTransactionsTable();
    loadBoardersDropdown();

};

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

////////// load boarder dropdown - transaction  ////////////////////////////////////////////////////////////////////////////////////////////////////////

function loadBoardersDropdown() {
    const dropdownBoarder = document.getElementById("boarderDropdown");
    dropdownBoarder.innerHTML = `<option value="" disabled selected>Select Boarder or Admin</option>`;

    const boarders = JSON.parse(localStorage.getItem(`boarders_${currentUser.username}`)) || [];

    boarders.forEach(b => {
        const option = document.createElement("option");
        option.value = b.name;
        option.textContent = b.name;
        dropdownBoarder.appendChild(option);
    });

    const adminOption = document.createElement("option");
    adminOption.value = "Admin";
    adminOption.textContent = "Admin";
    dropdownBoarder.appendChild(adminOption);
}

////////// save transaction to local storage ////////////////////////////////////////////////////////////////////////////////////////////////////////

function saveTransactions() {
    localStorage.setItem(`transactions_${currentUser.username}`, JSON.stringify(transactions));
}

////////// fill form with tramsaction details ////////////////////////////////////////////////////////////////////////////////////////////////////////

function fillTransactionForm(transaction, rowElement) {

    loadBoardersDropdown();

    document.getElementById("transactionDate").value = transaction.date;
    document.getElementById("boarderDropdown").value = transaction.person || "";
    document.getElementById("particulars").value = transaction.particulars;
    document.getElementById("debit").value = transaction.debit || "";
    document.getElementById("credit").value = transaction.credit || "";
    document.getElementById("transactionMonth").value = transaction.month || "";

    document.querySelectorAll("#transactionsBody tr").forEach(row => row.classList.remove("selected-row"));
    if (rowElement) rowElement.classList.add("selected-row");
}

////////// render transaction table ////////////////////////////////////////////////////////////////////////////////////////////////////////

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


////////// search / filter ////////////////////////////////////////////////////////////////////////////////////////////////////////

function filterTransactions() {
    const searchTerm = document.getElementById("searchTransaction").value.toLowerCase().trim();
    const termsSearch = searchTerm.split(/\s+/); // split input by space

    const filtered = transactions
        .map((transaction, index) => ({ ...transaction, actualIndex: index }))
        .filter(transaction => {
            const searchable = `${transaction.particulars} ${transaction.date} ${transaction.person}`.toLowerCase();
            return termsSearch.every(term => searchable.includes(term));
        });

    renderFilteredTransactionsTable(filtered);
}

// render
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
            <td>₱${transaction.debit || "0"}</td>
            <td>₱${transaction.credit || "0"}</td>
            <td>${transaction.month || ''}</td> 
        `;

        row.onclick = function () {
            selectedTransactionRow = transaction.actualIndex;
            fillTransactionForm(transaction, row);
        };
        transactionTableBody.appendChild(row);
    });
}


// renderTable();
// renderTransactionsTable();
// loadBoardersDropdown();

