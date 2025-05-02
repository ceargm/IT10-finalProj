
function showSection(id) {
    const sections = document.querySelectorAll('.card-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    const activeSection = document.getElementById(id);
    activeSection.classList.add('active');
}

// Get current logged-in user from localStorage
let currentUser = JSON.parse(localStorage.getItem('bhmsUser')) || null;
if (!currentUser) {
    alert('Please log in first!');
    window.location.href = 'login.html'; // Redirect if no user is logged in
    throw new Error('User not logged in');
}

////////////////////////////////////////////////////////////////////////////////////////////
// Manage Boarders Section
// Use a unique key for each user's boarders
let boarders = JSON.parse(localStorage.getItem(`boarders_${currentUser.username}`)) || [];
const tableBody = document.getElementById("boardersBody");
const addBtn = document.getElementById("addB");
const editBtn = document.getElementById("editB");
const deleteBtn = document.getElementById("deleteB");
const clearBtn = document.getElementById("clearF");

let selectedRow = null;

// Render the boarders table
function renderTable() {
    tableBody.innerHTML = "";

    if (boarders.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="7" style="text-align: center;">No boarders yet</td>`;
        tableBody.appendChild(row);
        return;
    }

    boarders.forEach((boarder, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${boarder.room}</td>
            <td>${boarder.name}</td>
            <td>${boarder.movedIn}</td>
            <td>${boarder.birthDate}</td>
            <td>${boarder.address}</td>
            <td>${boarder.phone}</td>
        `;

        row.onclick = function () {
            selectedRow = index;
            fillForm(boarder, row);
        };
        

        tableBody.appendChild(row);
    });
}

//filter boarders based on search input
function filterBoarders() {
    const query = document.getElementById("searchBoarder").value.toLowerCase();
    const rows = document.querySelectorAll("#boardersBody tr");

    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        const match = Array.from(cells).some(cell =>
            cell.textContent.toLowerCase().includes(query)
        );

        // Hide row if no match found and it's not the "No boarders yet" row
        if (cells.length === 7) {
            row.style.display = match ? "" : "none";
        }
    });
}


// Fill the form with boarder details
function fillForm(boarder,rowElement) {
    document.getElementById("room").value = boarder.room;
    document.getElementById("boarderName").value = boarder.name;
    document.getElementById("movedInDate").value = boarder.movedIn;
    document.getElementById("birthDate").value = boarder.birthDate;
    document.getElementById("address").value = boarder.address;
    document.getElementById("contactNumber").value = boarder.phone;

    document.querySelectorAll("#boardersBody tr").forEach(row => row.classList.remove("selected-row"));
    if (rowElement) rowElement.classList.add("selected-row");
}

// Clear the form
function clearForm() {
    document.getElementById("room").value = "";
    document.getElementById("boarderName").value = "";
    document.getElementById("movedInDate").value = "";
    document.getElementById("birthDate").value = "";
    document.getElementById("address").value = "";
    document.getElementById("contactNumber").value = "";
    selectedRow = null;
}

// Save boarders to localStorage
function saveBoarders() {
    localStorage.setItem(`boarders_${currentUser.username}`, JSON.stringify(boarders));
}

// Validate Date Format (YYYY/MM/DD)
function isValidDateFormat(dateStr) {
    const regex = /^\d{4}\/\d{2}\/\d{2}$/;
    if (!regex.test(dateStr)) return false;

    const [year, month, day] = dateStr.split("/").map(Number);
    const date = new Date(year, month - 1, day); // JS months are 0-based

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

// Validate Phone Number (starts with 09 and followed by 9 digits)
function isValidPhoneNumber(number) {
    const regex = /^09\d{9}$/; // starts with 09 and followed by 9 digits (total 11)
    return regex.test(number);
}

// Add boarder
addBtn.onclick = function () {
    const room = document.getElementById("room").value.trim();
    const name = document.getElementById("boarderName").value.trim();
    const movedInDate = document.getElementById("movedInDate").value.trim();
    const birthDate = document.getElementById("birthDate").value.trim();
    const address = document.getElementById("address").value.trim();
    const phone = document.getElementById("contactNumber").value.trim();

    // check if any fields are empty
    if (!room || !name || !movedInDate || !birthDate || !address || !phone) {
        return alert("Please fill out all fields first.");
    }

    // Validate Date and Phone Number
    if (!isValidDateFormat(movedInDate)) {
        return alert("Please enter a valid 'Moved In' date (YYYY/MM/DD).");
    }

    if (!isValidDateFormat(birthDate)) {
        return alert("Please enter a valid 'Birth Date' (YYYY/MM/DD).");
    }

    if (!isValidPhoneNumber(phone)) {
        return alert("Please enter a valid phone number (starts with 09 and followed by 9 digits).");
    }
    if (!confirm("Are you sure you want to add this boarder?")) return;

    const newBoarder = {
        room,
        name,
        movedIn: movedInDate,
        birthDate,
        address,
        phone
    };

    boarders.push(newBoarder);
    saveBoarders();
    renderTable();
    clearForm();


};

// Edit boarder
editBtn.onclick = function () {
    if (selectedRow === null) return alert("Select a boarder in the table to edit.");


    const room = document.getElementById("room").value.trim();
    const name = document.getElementById("boarderName").value.trim();
    const movedInDate = document.getElementById("movedInDate").value.trim();
    const birthDate = document.getElementById("birthDate").value.trim();
    const address = document.getElementById("address").value.trim();
    const phone = document.getElementById("contactNumber").value.trim();

    // Validate Date and Phone Number
    if (!isValidDateFormat(movedInDate)) {
        return alert("Please enter a valid 'Moved In' date (YYYY/MM/DD).");
    }

    if (!isValidDateFormat(birthDate)) {
        return alert("Please enter a valid 'Birth Date' (YYYY/MM/DD).");
    }

    if (!isValidPhoneNumber(phone)) {
        return alert("Please enter a valid phone number (starts with 09 and followed by 9 digits).");
    }

    if (!confirm("Are you sure you want to save changes to this boarder?")) return;

    boarders[selectedRow] = {
        room,
        name,
        movedIn: movedInDate,
        birthDate,
        address,
        phone
    };

    saveBoarders();
    renderTable();
    clearForm();
};

// Delete boarder
deleteBtn.onclick = function () {
    if (selectedRow === null) return alert("Select a boarder to delete.");

    if (confirm("Are you sure you want to delete this boarder?")) {
        boarders.splice(selectedRow, 1);
        saveBoarders();
        renderTable();
        clearForm();
    }
};

// Clear form fields
clearBtn.onclick = function () {
    clearForm();
};

// Initialize the table
renderTable();

////////////////////////////////////////////////////////////////////////////////////////////
// Transactions Section
// Use a unique key for each user's transactions
let transactions = JSON.parse(localStorage.getItem(`transactions_${currentUser.username}`)) || [];
const transactionTableBody = document.getElementById("transactionsBody");
const addTransactionBtn = document.getElementById("addT");
const editTransactionBtn = document.getElementById("editT");
const deleteTransactionBtn = document.getElementById("deleteT");
const clearTransactionBtn = document.getElementById("clearT");

let selectedTransactionRow = null;

// Render transactions table
function renderTransactionsTable() {
    transactionTableBody.innerHTML = "";

    if (transactions.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="5" style="text-align: center;">No transactions yet</td>`;
        transactionTableBody.appendChild(row);
        return;
    }

    let balance = 0; // Start with a balance of 0
    transactions.forEach((transaction, index) => {
        // Update balance (debit - credit)
        balance += Number(transaction.debit || 0) - Number(transaction.credit || 0);

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.particulars}</td>
            <td>${transaction.debit || "0"}</td>
            <td>${transaction.credit || "0"}</td>
            <td>${balance}</td> <!-- Balance Column -->
        `;

        row.onclick = function () {
            selectedTransactionRow = index;
            fillTransactionForm(transaction,row);
        };

        transactionTableBody.appendChild(row);
    });
}

// Fill the form with transaction details
function fillTransactionForm(transaction,rowElement) {
    document.getElementById("transactionDate").value = transaction.date;
    document.getElementById("particulars").value = transaction.particulars;
    document.getElementById("debit").value = transaction.debit || "";
    document.getElementById("credit").value = transaction.credit || "";

    // Highlight selected row
    document.querySelectorAll("#transactionsBody tr").forEach(row => row.classList.remove("selected-row"));
    if (rowElement) rowElement.classList.add("selected-row");
}

// Clear the transaction form
function clearTransactionForm() {
    document.getElementById("transactionDate").value = "";
    document.getElementById("particulars").value = "";
    document.getElementById("debit").value = "";
    document.getElementById("credit").value = "";
    selectedTransactionRow = null;
}

// Save transactions to localStorage
function saveTransactions() {
    localStorage.setItem(`transactions_${currentUser.username}`, JSON.stringify(transactions));
}

// Add transaction
addTransactionBtn.onclick = function () {

    const date = document.getElementById("transactionDate").value;
    const particulars = document.getElementById("particulars").value;
    const debit = document.getElementById("debit").value || 0;
    const credit = document.getElementById("credit").value || 0;

    // Check if any fields are empty
    if (!date || !particulars) {
        return alert("Please fill out all fields first.");
    }

    // Validate date format (YYYY/MM/DD)
    if (!isValidDateFormat(date)) {
        return alert("Please enter a valid date (YYYY/MM/DD).");
    }

    if (!confirm("Are you sure you want to add this transaction?")) return;

    const newTransaction = { date, particulars, debit, credit };
    transactions.push(newTransaction);
    saveTransactions();
    renderTransactionsTable();
    clearTransactionForm();
};

// Edit transaction
editTransactionBtn.onclick = function () {
    if (selectedTransactionRow === null) return alert("Select a transaction to edit.");


    const date = document.getElementById("transactionDate").value;
    const particulars = document.getElementById("particulars").value;
    const debit = document.getElementById("debit").value || 0;
    const credit = document.getElementById("credit").value || 0;

    // Check if any fields are empty
    if (!date || !particulars) {
        return alert("Please fill out all fields first.");
    }

    // Validate date format (YYYY/MM/DD)
    if (!isValidDateFormat(date)) {
        return alert("Please enter a valid date (YYYY/MM/DD).");
    }
    if (!confirm("Are you sure you want to update this transaction?")) return;

    transactions[selectedTransactionRow] = { date, particulars, debit, credit };
    saveTransactions();
    renderTransactionsTable();
    clearTransactionForm();
};

// Delete transaction
deleteTransactionBtn.onclick = function () {
    if (selectedTransactionRow === null) return alert("Select a transaction to delete.");

    if (confirm("Are you sure you want to delete this transaction?")) {
        transactions.splice(selectedTransactionRow, 1);
        saveTransactions();
        renderTransactionsTable();
        clearTransactionForm();
    }
};

// Clear transaction form fields
clearTransactionBtn.onclick = function () {
    clearTransactionForm();
};

// Filter transactions based on search input
function filterTransactions() {
    const searchTerm = document.getElementById("searchTransaction").value.toLowerCase();
    const filtered = [];

    transactions.forEach((transaction, index) => {
        if (
            transaction.particulars.toLowerCase().includes(searchTerm) ||
            transaction.date.includes(searchTerm)
        ) {
            filtered.push({ ...transaction, actualIndex: index });
        }
    });

    renderFilteredTransactionsTable(filtered);
}


// Render filtered transactions table
function renderFilteredTransactionsTable(filteredTransactions) {
    transactionTableBody.innerHTML = "";
    if (filteredTransactions.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="5" style="text-align: center;">No transactions match the search term</td>`;
        transactionTableBody.appendChild(row);
        return;
    }

    let balance = 0;
    filteredTransactions.forEach((transaction) => {
        balance += Number(transaction.debit || 0) - Number(transaction.credit || 0);
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.particulars}</td>
            <td>${transaction.debit || "0"}</td>
            <td>${transaction.credit || "0"}</td>
            <td>${balance}</td>
        `;

        row.onclick = function () {
            selectedTransactionRow = transaction.actualIndex; // set the original index
            fillTransactionForm(transaction, row);
        };

        transactionTableBody.appendChild(row);
    });
}


// Initialize the table
renderTransactionsTable();

////////////////////////////////////////////////////////////////////////////////////////////


