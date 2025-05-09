// Manage Boarders Section
// Data is saved using a unique key for each user
let boarders = JSON.parse(localStorage.getItem(`boarders_${currentUser.username}`)) || [];
const tableBody = document.getElementById("boardersBody");
const addBtn = document.getElementById("addB");
const editBtn = document.getElementById("editB");
const deleteBtn = document.getElementById("deleteB");
const clearBtn = document.getElementById("clearF");

let selectedRow = null;

//////////////////// ADD BOARDER ////////////////////

addBtn.onclick = function () {
    // Get values from input fields
    const room = document.getElementById("room").value.trim();
    const name = document.getElementById("boarderName").value.trim();
    const movedInDate = document.getElementById("movedInDate").value.trim();
    const birthDate = document.getElementById("birthDate").value.trim();
    const address = document.getElementById("address").value.trim();
    const phone = document.getElementById("contactNumber").value.trim();

    // Check if any input is empty
    if (!room || !name || !movedInDate || !birthDate || !address || !phone) {
        return showModal("alert", "Empty Fields", "Please fill out all fields first.");
    }

    // Validate dates and phone number
    if (!isValidDateFormat(movedInDate)) {
        return showModal("alert", "Invalid ate", "Please enter a valid 'MOVED-IN DATE' (YYYY/MM/DD) and ensure the date is not greater than today's date.");
    }

    if (!isValidDateFormat(birthDate)) {
        return showModal("alert", "Invalid Date", "Please enter a valid 'BIRTHDATE' (YYYY/MM/DD) and ensure the date is not greater than today's date.");
    }

    if (!isValidPhoneNumber(phone)) {
        return showModal("alert", "Invalid Phone Number", "Please enter a valid phone number (starts with 09 and followed by 9 digits).");
    }

    // Check if the name already exists
    const boarderExists = boarders.some(boarder => boarder.name.toLowerCase() === name.toLowerCase());
    if (boarderExists) {
        return showModal("alert", "Boarder Name Exists", "Boarder with this name already exists.");
    }

    // Ask user to confirm adding
    showModal("confirm", "Confirm Add", "Are you sure you want to add this boarder?", (confirmed) => {
        if (!confirmed) return;

        const newBoarder = { room, name, movedIn: movedInDate, birthDate, address, phone };
        boarders.push(newBoarder);

        saveBoarders();
        clearForm();
        renderTable();
        renderTransactionsTable();
        renderBillTable();
        autoMatchTransactionsToBills();
        updateKPICards();
        loadBoardersForBills();
        loadBoardersDropdown();

        addActivityLog("Added Boarder", `Boarder: ${name}, Room: ${room}, Moved In: ${movedInDate}`);
        showModal("alert", "Boarder Added", "Boarder has been added successfully.");
    });
};

//////////////////// EDIT BOARDER ////////////////////

editBtn.onclick = function () {
    if (selectedRow === null) {
        return showModal("alert", "Select a Row", "Please click a row to select a boarder from the table.");
    }

    const originalBoarder = boarders[selectedRow];

    // Get updated values
    const room = document.getElementById("room").value.trim();
    const name = document.getElementById("boarderName").value.trim();
    const movedInDate = document.getElementById("movedInDate").value.trim();
    const birthDate = document.getElementById("birthDate").value.trim();
    const address = document.getElementById("address").value.trim();
    const phone = document.getElementById("contactNumber").value.trim();

    // Validate again
    if (!isValidDateFormat(movedInDate)) {
        return showModal("alert", "Invalid Date", "Please enter a valid 'Moved In' date (YYYY/MM/DD).");
    }

    if (!isValidDateFormat(birthDate)) {
        return showModal("alert", "Invalid Date", "Please enter a valid 'Birth Date' (YYYY/MM/DD).");
    }

    if (!isValidPhoneNumber(phone)) {
        return showModal("alert", "Invalid Phone Number", "Please enter a valid phone number (starts with 09 and followed by 9 digits).");
    }

    // If no changes were made
    if (
        originalBoarder.room === room &&
        originalBoarder.name === name &&
        originalBoarder.movedIn === movedInDate &&
        originalBoarder.birthDate === birthDate &&
        originalBoarder.address === address &&
        originalBoarder.phone === phone
    ) {
        return showModal("alert", "No Changes Made", "No changes made to the form.");
    }

    // Ask user to confirm edit
    showModal("confirm", "Confirm Edit", "Are you sure you want to edit this boarder?", (confirmed) => {
        if (!confirmed) return;

        // Track what was changed
        let logMessage = `Updated boarder: ${name} (Room: ${room})`;
        if (originalBoarder.room !== room) logMessage += `, Room: ${originalBoarder.room} → ${room}`;
        if (originalBoarder.movedIn !== movedInDate) logMessage += `, Moved In: ${originalBoarder.movedIn} → ${movedInDate}`;
        if (originalBoarder.birthDate !== birthDate) logMessage += `, Birth Date: ${originalBoarder.birthDate} → ${birthDate}`;
        if (originalBoarder.address !== address) logMessage += `, Address: ${originalBoarder.address} → ${address}`;
        if (originalBoarder.phone !== phone) logMessage += `, Phone: ${originalBoarder.phone} → ${phone}`;

        addActivityLog("Edited Boarder", logMessage);

        // Save changes
        boarders[selectedRow] = { room, name, movedIn: movedInDate, birthDate, address, phone };
        saveBoarders();

        clearForm();
        renderTable();
        renderBillTable();
        renderTransactionsTable();
        autoMatchTransactionsToBills();
        updateKPICards();
        loadBoardersForBills();
        loadBoardersDropdown();

        showModal("alert", "Update Successful", "Boarder details have been updated successfully.");
    });
};

//////////////////// DELETE BOARDER ////////////////////

deleteBtn.onclick = function () {
    if (selectedRow === null) {
        return showModal("alert", "Select A Row", "Please select a boarder in the table to delete.");
    }

    const boarderToDelete = boarders[selectedRow];

    // Ask user to confirm delete
    showModal("confirm", "Confirm Delete", `Are you sure you want to delete ${boarderToDelete.name}? This will also delete all their transactions and bills.`, (confirmed) => {
        if (!confirmed) return;

        boarders.splice(selectedRow, 1);
        saveBoarders();

        const nameToDelete = boarderToDelete.name.toLowerCase().trim();
        let transactions = JSON.parse(localStorage.getItem(`transactions_${currentUser.username}`)) || [];
        let boarderBills = JSON.parse(localStorage.getItem(`bills_${currentUser.username}`)) || [];

        transactions = transactions.filter(tx => tx.person.toLowerCase().trim() !== nameToDelete);
        boarderBills = boarderBills.filter(bill => bill.boarder.toLowerCase().trim() !== nameToDelete);

        localStorage.setItem(`transactions_${currentUser.username}`, JSON.stringify(transactions));
        localStorage.setItem(`bills_${currentUser.username}`, JSON.stringify(boarderBills));

        clearForm();
        renderTable();
        autoMatchTransactionsToBills();
        renderBillTable();
        renderTransactionsTable();
        updateKPICards();
        loadBoardersDropdown();

        addActivityLog("Deleted Boarder", `Boarder: ${boarderToDelete.name}, Room: ${boarderToDelete.room}`);
        showModal("alert", "Delete Successful", "Boarder and related data successfully deleted.");
    });
};

//////////////////// CLEAR FORM ////////////////////

clearBtn.onclick = function () {
    clearForm();
    renderTable();
    renderBillTable();
    autoMatchTransactionsToBills();
    loadBoardersForBills();
    loadBoardersDropdown();
    renderTransactionsTable();
};

// Clear form inputs and reset selected row
function clearForm() {
    if (
        !document.getElementById("room").value &&
        !document.getElementById("boarderName").value &&
        !document.getElementById("movedInDate").value &&
        !document.getElementById("birthDate").value &&
        !document.getElementById("address").value &&
        !document.getElementById("contactNumber").value
    ) {
        return showModal("alert","", "Form is already empty.");
    }

    document.getElementById("room").value = "";
    document.getElementById("boarderName").value = "";
    document.getElementById("movedInDate").value = "";
    document.getElementById("birthDate").value = "";
    document.getElementById("address").value = "";
    document.getElementById("contactNumber").value = "";
    selectedRow = null;

    document.getElementById("boarderName").disabled = false;
}

// Save boarders to local storage
function saveBoarders() {
    localStorage.setItem(`boarders_${currentUser.username}`, JSON.stringify(boarders));
}

// Show data in form when a row is clicked
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

// Show list of boarders in the table
function renderTable() {
    const boarders = JSON.parse(localStorage.getItem(`boarders_${currentUser.username}`)) || [];
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
        };

        tableBody.appendChild(row);
    });
}

// Filter boarders as you type
function filterBoarders() {
    const query = document.getElementById("searchBoarder").value.toLowerCase();
    const rows = document.querySelectorAll("#boardersBody tr");

    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        const match = Array.from(cells).some(cell =>
            cell.textContent.toLowerCase().includes(query)
        );

        if (cells.length === 7) {
            row.style.display = match ? "" : "none";
        }
    });
}
