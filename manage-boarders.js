
// Manage Boarders Section
// Use a unique key for each user's boarders
let boarders = JSON.parse(localStorage.getItem(`boarders_${currentUser.username}`)) || [];
const tableBody = document.getElementById("boardersBody");
const addBtn = document.getElementById("addB");
const editBtn = document.getElementById("editB");
const deleteBtn = document.getElementById("deleteB");
const clearBtn = document.getElementById("clearF");

let selectedRow = null;

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
        return alert("Please enter a valid 'Moved In' date (YYYY/MM/DD) and ensure the date is not greater than today's date");
    }

    if (!isValidDateFormat(birthDate)) {
        return alert("Please enter a valid 'Birth Date' (YYYY/MM/DD) and ensure the date is not greater than today's date");
    }

    if (!isValidPhoneNumber(phone)) {
        return alert("Please enter a valid phone number (starts with 09 and followed by 9 digits).");
    }

    //check if the boarder name already exists
    const boarderExists = boarders.some(boarder => boarder.name.toLowerCase() === name.toLowerCase());
    if (boarderExists) {
        return alert("Boarder with this name already exists.");
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

    // Save updated data
    saveBoarders();
    saveTransactions();  // Make sure to save updated transactions list

    // Clear the form and update the tables
    clearForm();
    renderTable();
    renderBillTable();
    autoMatchTransactionsToBills();
    loadBoardersForBills();
    loadBoardersDropdown();
    renderTransactionsTable();
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

    //check if there's no changes in the form
    if (boarders[selectedRow].room === room && boarders[selectedRow].name === name && boarders[selectedRow].movedIn === movedInDate && boarders[selectedRow].birthDate === birthDate && boarders[selectedRow].address === address && boarders[selectedRow].phone === phone) {
        return alert("No changes made to the form.");
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

    // Save updated data
    saveBoarders();
    saveTransactions();  // Make sure to save updated transactions list

    // Clear the form and update the tables
    clearForm();
    renderTable();
    renderBillTable();
    autoMatchTransactionsToBills();
    loadBoardersForBills();
    loadBoardersDropdown();
    renderTransactionsTable();
};

// Delete boarder
deleteBtn.onclick = function () {
    if (selectedRow === null) return alert("Select a boarder to delete.");

    const boarderToDelete = boarders[selectedRow];

    if (confirm(`Are you sure you want to delete the boarder ${boarderToDelete.name}? This will also delete all their transactions.`)) {

        // Delete boarder
        boarders.splice(selectedRow, 1);
        saveBoarders();

        // Load transactions and boarderBills from localStorage (since you didn't declare them globally)
        let transactions = JSON.parse(localStorage.getItem(`transactions_${currentUser.username}`)) || [];
        let boarderBills = JSON.parse(localStorage.getItem(`boarderBills_${currentUser.username}`)) || [];

        // 2. Remove transactions linked to the deleted boarder
        transactions = transactions.filter(tx => tx.person !== boarderToDelete.name);
        localStorage.setItem(`transactions_${currentUser.username}`, JSON.stringify(transactions));

        /// 3. Remove any bills linked to the deleted boarder
        boarderBills = boarderBills.filter(bill => bill.boarder !== boarderToDelete.name);
        localStorage.setItem(`boarderBills_${currentUser.username}`, JSON.stringify(boarderBills));

        // Clear the form and update the tables
        clearForm();
        renderTable();
        renderBillTable();
        autoMatchTransactionsToBills();
        loadBoardersForBills();
        loadBoardersDropdown();
        
        alert("Boarder and related data successfully deleted.");
    }
};

// Clear form fields
clearBtn.onclick = function () {
    clearForm();
    renderTable();

    renderTable();
    renderBillTable();
    autoMatchTransactionsToBills();
    loadBoardersForBills();
    loadBoardersDropdown();
    renderTransactionsTable();
};


// Save boarders to localStorage
function saveBoarders() {
    localStorage.setItem(`boarders_${currentUser.username}`, JSON.stringify(boarders));
}


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
            document.getElementById("boarderName").disabled = true;
            editBtn.disabled = true;
        };


        tableBody.appendChild(row);
    });
}

// filter boarders based on search input
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
function fillForm(boarder, rowElement) {
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

    // check if the form is empty
    if (!document.getElementById("room").value && !document.getElementById("boarderName").value && !document.getElementById("movedInDate").value && !document.getElementById("birthDate").value && !document.getElementById("address").value && !document.getElementById("contactNumber").value) {
        return alert("Form is already empty.");
    }

    document.getElementById("room").value = "";
    document.getElementById("boarderName").value = "";
    document.getElementById("movedInDate").value = "";
    document.getElementById("birthDate").value = "";
    document.getElementById("address").value = "";
    document.getElementById("contactNumber").value = "";
    selectedRow = null;
}

// Validate Date Format (YYYY/MM/DD) and ensure the date is not greater than today's date
function isValidDateFormat(dateStr) {
    const regex = /^\d{4}\/\d{2}\/\d{2}$/;
    if (!regex.test(dateStr)) return false;

    const [year, month, day] = dateStr.split("/").map(Number);
    const date = new Date(year, month - 1, day); // JS months are 0-based
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set current date to midnight for comparison

    // Ensure that the date is not greater than today's date
    if (date > currentDate) return false;

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

// Initialize the table
renderTable();

