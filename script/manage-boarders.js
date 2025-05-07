
// Manage Boarders Section
// Use a unique key for each user's boarders
let boarders = JSON.parse(localStorage.getItem(`boarders_${currentUser.username}`)) || [];
const tableBody = document.getElementById("boardersBody");
const addBtn = document.getElementById("addB");
const editBtn = document.getElementById("editB");
const deleteBtn = document.getElementById("deleteB");
const clearBtn = document.getElementById("clearF");

let selectedRow = null;

////////// adding a boarder ////////////////////////////////////////////////////////////////////////////////////////////////////////

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
        return alert("Please enter a valid 'MOVED-IN DATE' (YYYY/MM/DD) and ensure the date is not greater than today's date");
    }

    if (!isValidDateFormat(birthDate)) {
        return alert("Please enter a valid 'BIRTHDATE' (YYYY/MM/DD) and ensure the date is not greater than today's date");
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

    const newBoarder = { room, name, movedIn: movedInDate, birthDate, address, phone };
    boarders.push(newBoarder);

    // Save updated data
    saveBoarders();

    // Clear the form and update the tables
    clearForm();
    renderTable();

    renderTransactionsTable();
    renderBillTable();
    autoMatchTransactionsToBills();

    updateKPICards(); // for overview section

    loadBoardersForBills();
    loadBoardersDropdown();

    addActivityLog("Added Boarder", `Boarder: ${name}, Room: ${room}, Moved In: ${movedInDate}`);
    alert("Boarder has been added successfully.");
};

////////// editing a boarder ////////////////////////////////////////////////////////////////////////////////////////////////////////

editBtn.onclick = function () {
    if (selectedRow === null) return alert("Please click a row to select a boarder from the table.");

    // Get the current (original) boarder data from selectedRow
    const originalBoarder = boarders[selectedRow];

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

    // Check if there's no changes in the form
    if (originalBoarder.room === room && originalBoarder.name === name && originalBoarder.movedIn === movedInDate && originalBoarder.birthDate === birthDate && originalBoarder.address === address && originalBoarder.phone === phone) {
        return alert("No changes made to the form.");
    }

    if (!confirm("Are you sure you want to edit this boarder?")) return;

    // Log the changes
    let logMessage = `Updated boarder: ${name} (Room: ${room})`;
    if (originalBoarder.room !== room) logMessage += `, Room: ${originalBoarder.room} → ${room}`;
    if (originalBoarder.movedIn !== movedInDate) logMessage += `, Moved In: ${originalBoarder.movedIn} → ${movedInDate}`;
    if (originalBoarder.birthDate !== birthDate) logMessage += `, Birth Date: ${originalBoarder.birthDate} → ${birthDate}`;
    if (originalBoarder.address !== address) logMessage += `, Address: ${originalBoarder.address} → ${address}`;
    if (originalBoarder.phone !== phone) logMessage += `, Phone: ${originalBoarder.phone} → ${phone}`;

    addActivityLog("Edited Boarder", logMessage);

    // Save updated boarder data
    boarders[selectedRow] = { room, name, movedIn: movedInDate, birthDate, address, phone };
    // Save updated data
    saveBoarders();

    // Clear the form and update the tables
    clearForm();
    renderTable();

    renderBillTable();
    renderTransactionsTable();
    autoMatchTransactionsToBills();

    updateKPICards();

    loadBoardersForBills();
    loadBoardersDropdown();

    alert("Boarder details have been updated successfully.");
};


///////// deleting a boarder ////////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", function () {
    deleteBtn.onclick = function () {
        if (selectedRow === null) return alert("Please select a boarder in the table to delete.");

        const boarderToDelete = boarders[selectedRow];

        if (confirm(`Are you sure you want to delete the boarder ${boarderToDelete.name}? This will also delete all their transactions and bills.`)) {
            // Delete boarder from list
            boarders.splice(selectedRow, 1);
            saveBoarders();

            // Normalize name for comparison
            const nameToDelete = boarderToDelete.name.toLowerCase().trim();

            // Load and filter transactions
            let transactions = JSON.parse(localStorage.getItem(`transactions_${currentUser.username}`)) || [];
            transactions = transactions.filter(tx => tx.person.toLowerCase().trim() !== nameToDelete);
            localStorage.setItem(`transactions_${currentUser.username}`, JSON.stringify(transactions));

            // Load and filter boarder bills
            let boarderBills = JSON.parse(localStorage.getItem(`bills_${currentUser.username}`)) || [];
            boarderBills = boarderBills.filter(bill => bill.boarder.toLowerCase().trim() !== nameToDelete);
            localStorage.setItem(`bills_${currentUser.username}`, JSON.stringify(boarderBills));

            clearForm();
            // 🔄 Re-sync the global variables from localStorage
            boarders = JSON.parse(localStorage.getItem(`boarders_${currentUser.username}`)) || [];

            transactions = JSON.parse(localStorage.getItem(`transactions_${currentUser.username}`)) || [];

            boarderBills = JSON.parse(localStorage.getItem(`bills_${currentUser.username}`)) || [];

            // Re-render all relevant tables
            renderTable();
            renderBillTable();
            renderTransactionsTable();
            autoMatchTransactionsToBills();
            updateKPICards();
            loadBoardersDropdown();

            addActivityLog("Deleted Boarder", `Boarder: ${boarderToDelete.name}, Room: ${boarderToDelete.room}`);
            alert("Boarder and related data successfully deleted.");
        }
    };
});

////////// clearing form fields  ////////////////////////////////////////////////////////////////////////////////////////////////////////

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

    document.getElementById("boarderName").disabled = false;
}

////////// save boarder to local storage ////////////////////////////////////////////////////////////////////////////////////////////////////////

function saveBoarders() {
    localStorage.setItem(`boarders_${currentUser.username}`, JSON.stringify(boarders));
}

////////// fill form with boarder details ////////////////////////////////////////////////////////////////////////////////////////////////////////

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

////////// render boarder table ////////////////////////////////////////////////////////////////////////////////////////////////////////

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
        };
        tableBody.appendChild(row);
    });
}

////////// search / filter ////////////////////////////////////////////////////////////////////////////////////////////////////////

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