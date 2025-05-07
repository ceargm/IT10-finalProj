// Boarder Bills Section

let boarderBills = JSON.parse(localStorage.getItem(`bills_${currentUser.username}`)) || [];
const billTableBody = document.getElementById("billTableBody");
const addBillBtn = document.getElementById("addBill");
const editBillBtn = document.getElementById("editBill");
const deleteBillBtn = document.getElementById("deleteBill");
const clearBillFieldsBtn = document.getElementById("clearBill");
const dropdownBillBoarder = document.getElementById("billBoarder");


let selectedBillRow = null;

////////// save boarder bills to local storage ////////////////////////////////////////////////////////////////////////////////////////////////////////

function saveBoarderBills() {
    localStorage.setItem(`bills_${currentUser.username}`, JSON.stringify(boarderBills));
}

////////// adding a boarder bill ////////////////////////////////////////////////////////////////////////////////////////////////////////

addBillBtn.onclick = function () {
    const billMonthInput = document.getElementById("billMonth").value || new Date().toISOString().slice(0, 7);
    const boarder = document.getElementById("billBoarder").value;
    const billType = document.getElementById("billType").value.toLowerCase();
    const amount = parseFloat(document.getElementById("billAmount").value);

    if (!boarder || !billType || isNaN(amount)) {
        return alert("Please fill out boarder, billType and amount fields first.");
    }

    const monthKey = billMonthInput;
    const alreadyExists = boarderBills.some(bill =>
        bill.boarder === boarder &&
        bill.billType === billType &&
        bill.month === monthKey
    );

    if (alreadyExists) return alert("This bill already exists for the boarder this month.");

    if (!confirm("Are you sure you want to add this bill?")) return;

    const newBill = { boarder, billType, amount, paidAmount: 0, status: "unpaid", month: monthKey };
    boarderBills.push(newBill);

    // Save updated data
    saveBoarderBills();

    // Clear the form and update the tables
    clearBillForm();
    renderBillTable();

    autoMatchTransactionsToBills();
    renderTransactionsTable();

    updateKPICards(); // for overview section
    loadOutstandingBalances(monthKey); // for overview section 

    loadBoardersForBills();


    addActivityLog("Added Bill", `Boarder: ${boarder}, Bill Type: ${billType}, Amount: ₱${amount}, Month: ${billMonthInput}`);
    alert("Bill added successfully.");
};


////////// editing a boarder bill ////////////////////////////////////////////////////////////////////////////////////////////////////////

editBillBtn.onclick = function () {
    if (selectedBillRow === null) return alert("Please click a row to select a bill from the table.");

    // Get the current (original) boarder bill data
    const originalBill = boarderBills[selectedBillRow];

    const billMonthInput = document.getElementById("billMonth").value;
    const boarder = document.getElementById("billBoarder").value;
    const billType = document.getElementById("billType").value.toLowerCase();
    const amount = parseFloat(document.getElementById("billAmount").value);

    if (!boarder || !billType || isNaN(amount)) return alert("Please fill out boarder, billType and amount fields first.");

    // Check if there's no changes in the form
    if (originalBill.month === billMonthInput && originalBill.boarder === boarder &&
        originalBill.billType === billType && originalBill.amount === amount) {
        return alert("No changes made to the transaction.");
    }

    

    // Log the changes
    let logMessage = `Updated bill for ${boarder} (Bill Type: ${billType}, Month: ${billMonthInput})`;
    if (originalBill.amount !== amount) logMessage += `, Amount: ₱${originalBill.amount} → ₱${amount}`;
    const paid = originalBill.paidAmount || 0;
    const status = paid >= amount ? "paid" : paid > 0 ? "partial" : "unpaid";
    if (originalBill.status !== status) logMessage += `, Status: ${originalBill.status} → ${status}`;

    boarderBills[selectedBillRow].amount = amount;
    boarderBills[selectedBillRow].status = status;

    if (!confirm("Are you sure you want to edit this bill?")) return;

    saveBoarderBills();
    renderBillTable();
    clearBillForm();
    updateKPICards();

    renderTransactionsTable();

    loadOutstandingBalances(billMonthInput);
    autoMatchTransactionsToBills();

    addActivityLog("Edited Bill", logMessage);
    alert("Bill updated successfully.");
};

////////// deleting a boarder bill ////////////////////////////////////////////////////////////////////////////////////////////////////////

deleteBillBtn.onclick = function () {
    if (selectedBillRow === null) return alert("Please select a bill from the table to delete.");

    const boarder = document.getElementById("billBoarder").value;
    const billType = document.getElementById("billType").value.toLowerCase();
    const billMonth = document.getElementById("billMonth").value;

    selectedBillRow = boarderBills.findIndex(bill =>
        bill.boarder === boarder &&
        bill.billType === billType &&
        bill.month === billMonth
    );

    if (!confirm("Are you sure you want to delete this bill?")) return;

    // Remove the bill
    boarderBills.splice(selectedBillRow, 1);

    saveBoarderBills();
    renderBillTable();

    clearBillForm();

    updateKPICards();
    loadOutstandingBalances(billMonth);

    renderTransactionsTable();
    autoMatchTransactionsToBills();

    loadBoardersForBills();


    addActivityLog("Deleted Bill", `Boarder: ${boarder}, Bill Type: ${billType}, Month: ${billMonth}`);
    alert("Bill deleted successfully.");
};

////////// clearing form fields  ////////////////////////////////////////////////////////////////////////////////////////////////////////

clearBillFieldsBtn.onclick = function (){
    clearBillForm();

    autoMatchTransactionsToBills();
    renderTable();
    renderBillTable();
    renderTransactionsTable();
    loadBoardersForBills();

}

function clearBillForm() {
     // check if the form is empty
    if (!document.getElementById("billMonth").value && !document.getElementById("billBoarder").value && !document.getElementById("billType").value && !document.getElementById("billAmount").value) {
        return alert("Form is already empty.");
    }
    document.getElementById("billMonth").value = "";
    document.getElementById("billBoarder").value = "";
    document.getElementById("billType").value = "";
    document.getElementById("billAmount").value = "";
    selectedBillRow = null;

    document.getElementById("billBoarder").disabled = false;
}

////////// load boarder dropdown - boarder bill ////////////////////////////////////////////////////////////////////////////////////////////////////////

function loadBoardersForBills() {
    const dropdownBillBoarder = document.getElementById("billBoarder");
    dropdownBillBoarder.innerHTML = `<option value="" disabled selected>Select Boarder</option>`;

    const boarders = JSON.parse(localStorage.getItem(`boarders_${currentUser.username}`)) || [];

    boarders.forEach(b => {
        const option = document.createElement("option");
        option.value = b.name;
        option.textContent = b.name;
        dropdownBillBoarder.appendChild(option);
    });
}

////////// fill form with boarder bill details ////////////////////////////////////////////////////////////////////////////////////////////////////////

function fillBillForm(bill, rowElement) {

    loadBoardersForBills();

    document.getElementById("billBoarder").value = bill.boarder;
    document.getElementById("billType").value = bill.billType;
    document.getElementById("billAmount").value = bill.amount;
    document.getElementById("billMonth").value = bill.month;

    document.querySelectorAll("#billTableBody tr").forEach(row => row.classList.remove("selected-row"));
    if (rowElement) rowElement.classList.add("selected-row");
}

////////// render boarder bill table ////////////////////////////////////////////////////////////////////////////////////////////////////////

function renderBillTable() {
    
    billTableBody.innerHTML = "";

    if (boarderBills.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="6" style="text-align:center;">No bills logged yet</td>`;
        billTableBody.appendChild(row);
        return;
    }

    boarderBills.forEach((bill, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${bill.boarder}</td>
            <td>${bill.billType}</td>
            <td>₱${bill.amount}</td>
            <td>₱${bill.paidAmount || "0"}</td>
            <td>${bill.status}</td>
            <td>${bill.month}</td>
        `;

        row.onclick = function () {
            selectedBillRow = index;
            fillBillForm(bill, row);
            document.getElementById("billBoarder").disabled = true;
        };
        billTableBody.appendChild(row);
    });
    
}

////////// search / filter ////////////////////////////////////////////////////////////////////////////////////////////////////////

function filterBoarderBills() {
    const searchTermB = document.getElementById("searchBill").value.toLowerCase().trim();
    const termsBill = searchTermB.split(/\s+/);

    const filteredB = boarderBills
        .map((bill, index) => ({ ...bill, actualIndex: index }))
        .filter(bill => {
            const searchable = `${bill.boarder} ${bill.billType} ${bill.status} ${bill.month}`.toLowerCase();
            return termsBill.every(term => searchable.includes(term));
        });

    renderFilteredBillTable(filteredB);
}

// render 
function renderFilteredBillTable(filteredBills) {
    billTableBody.innerHTML = "";

    if (filteredBills.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="6" style="text-align:center;">No bills match the search term</td><`;
        transactionTableBody.appendChild(row);
        return;
    }

    filteredBills.forEach((bill) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${bill.boarder}</td>
            <td>${bill.billType}</td>
            <td>₱${bill.amount}</td>
            <td>₱${bill.paidAmount || '0'}</td>
            <td>${bill.status}</td>
            <td>${bill.month}</td>
        `;

        row.onclick = function () {
            selectedBillRow = bill.actualIndex;
            fillBillForm(bill, row);
        };
        billTableBody.appendChild(row);
    });
}

////////// auto match transactions to bills ////////////////////////////////////////////////////////////////////////////////////////////////////////

function autoMatchTransactionsToBills() {
    const transactions = JSON.parse(localStorage.getItem(`transactions_${currentUser.username}`)) || [];
    
    boarderBills.forEach(bill => {
        bill.paidAmount = 0;
        bill.status = "unpaid";
        bill.paymentDate = "";
    });

    boarderBills.forEach(bill => {
        transactions.forEach(tx => {
            const keywordMatched = tx.particulars.toLowerCase().includes(bill.billType.toLowerCase());
            const nameMatched = tx.person.toLowerCase() === bill.boarder.toLowerCase();
            const monthMatched = bill.month === tx.month;
            const amount = Number(tx.debit) || 0;

            if (keywordMatched && nameMatched && monthMatched && amount > 0) {
                bill.paidAmount = (bill.paidAmount || 0) + amount;
                bill.status = bill.paidAmount >= bill.amount ? "paid" : "partial";
                bill.paymentDate = tx.date;
            }
        });
    });

    saveBoarderBills();
    
    renderBillTable();
    renderTransactionsTable();

    loadBoardersForBills();
    loadBoardersDropdown();
}


