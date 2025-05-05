// Boarder Bills Section

let boarderBills = JSON.parse(localStorage.getItem(`bills_${currentUser.username}`)) || [];
const billTableBody = document.getElementById("billTableBody");
const addBillBtn = document.getElementById("addBill");

function saveBoarderBills() {
    localStorage.setItem(`bills_${currentUser.username}`, JSON.stringify(boarderBills));
}

function clearBillsForNewMonth() {
    const currentMonth = new Date().toISOString().slice(0, 7); // e.g., "2025-05"
    const savedMonth = localStorage.getItem(`lastClearedMonth_${currentUser.username}`);

    if (savedMonth !== currentMonth) {
        // Remove all bills NOT from this month
        boarderBills = boarderBills.filter(bill => bill.month === currentMonth);

        // Save updated bills and mark current month as cleared
        saveBoarderBills();

        renderBillTable();
        clearBillForm();
        renderTransactionsTable();
    
        autoMatchTransactionsToBills();
        loadBoardersForBills();
        
        


        localStorage.setItem(`lastClearedMonth_${currentUser.username}`, currentMonth);
        alert("Old bills cleared. Current month:", currentMonth);
    }
}

function renderBillTable() {
    billTableBody.innerHTML = "";
    if (boarderBills.length === 0) {
        billTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No bills logged yet</td></tr>`;
        return;
    }

    boarderBills.forEach((bill) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${bill.boarder}</td>
            <td>${bill.billType}</td>
            <td>₱${bill.amount}</td>
            <td>₱${bill.paidAmount || 0}</td>
            <td>${bill.status}</td>
            <td>${bill.month}</td>
        `;

        row.addEventListener("click", () => {
            document.querySelectorAll("#billTableBody tr").forEach(r => r.classList.remove("selected-row"));
            row.classList.add("selected-row");

            
            document.getElementById("billBoarder").value = bill.boarder;
            document.getElementById("billBoarder").disabled = true;
            document.getElementById("billType").value = bill.billType;
            document.getElementById("billAmount").value = bill.amount;
            document.getElementById("billMonth").value = bill.month;

        

        });

        billTableBody.appendChild(row);
    });

}

function clearBillForm() {
    if (!document.getElementById("billMonth").value && !document.getElementById("billBoarder").value && !document.getElementById("billType").value && !document.getElementById("billAmount").value) {
        return alert("Form is already empty.");
    }
    document.getElementById("billMonth").value = "";
    document.getElementById("billBoarder").value = "";
    document.getElementById("billType").value = "";
    document.getElementById("billAmount").value = "";
    editingBillIndex = null;

    document.getElementById("billBoarder").disabled = false;


}

addBillBtn.onclick = function () {

    const billMonthInput = document.getElementById("billMonth").value || new Date().toISOString().slice(0, 7);
    const boarder = document.getElementById("billBoarder").value;
    const billType = document.getElementById("billType").value.toLowerCase();
    const amount = parseFloat(document.getElementById("billAmount").value);

    if (!boarder || !billType || isNaN(amount)) {
        return alert("Please fill in all the fields correctly.");
    }

    const monthKey = billMonthInput;

    const alreadyExists = boarderBills.some(bill =>
        bill.boarder === boarder &&
        bill.billType === billType &&
        bill.month === monthKey
    );

    if (alreadyExists) {
        return alert("This bill already exists for the boarder this month.");
    }


    const newBill = {
        boarder,
        billType,
        amount,
        paidAmount: 0,
        status: "unpaid",
        month: monthKey
    };

    boarderBills.push(newBill);
    saveBoarderBills();
    renderTable();
    renderBillTable();
    clearBillForm();
    renderTransactionsTable();

    autoMatchTransactionsToBills();
    loadBoardersForBills();
    loadBoardersDropdown();
    
};

const editBillBtn = document.getElementById("editBill");

editBillBtn.onclick = function () {
    const selectedRow = document.querySelector("#billTableBody .selected-row");
    if (!selectedRow) {
        return alert("Please select a bill from the table to edit.");
    }

    const billMonthInput = document.getElementById("billMonth").value;
    const boarder = document.getElementById("billBoarder").value;
    const billType = document.getElementById("billType").value.toLowerCase();
    const amount = parseFloat(document.getElementById("billAmount").value);

    if (!boarder || !billType || isNaN(amount)) {
        return alert("Please fill in all the fields correctly.");
    }

    // Find and update the bill
    const billIndex = boarderBills.findIndex(bill =>
        bill.boarder === boarder &&
        bill.billType === billType &&
        bill.month === billMonthInput
    );

    if (billIndex === -1) {
        return alert("Could not find a matching bill to update.");
    }

    // Update values
    boarderBills[billIndex].amount = amount;

    // Recalculate status if paidAmount exists
    const paid = boarderBills[billIndex].paidAmount || 0;
    boarderBills[billIndex].status = paid >= amount ? "paid" : paid > 0 ? "partial" : "unpaid";

    saveBoarderBills();
    renderTable();
    renderBillTable();
    clearBillForm();
    renderTransactionsTable();
    autoMatchTransactionsToBills();
    alert("Bill updated successfully.");
};


// Match bills with transactions
function autoMatchTransactionsToBills() {
    const transactions = JSON.parse(localStorage.getItem(`transactions_${currentUser.username}`)) || [];

    // Reset all paid amounts and statuses first
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
                // Add to paid amount
                bill.paidAmount = (bill.paidAmount || 0) + amount;

                /// Don't cap the paidAmount — allow overpayment
                if (bill.paidAmount >= bill.amount) {
                    bill.status = "paid";
                } else if (bill.paidAmount > 0) {
                    bill.status = "partial";
                }

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


function loadBoardersForBills() {
    const dropdown = document.getElementById("billBoarder");
    dropdown.innerHTML = `<option value="" disabled selected>Select Boarder</option>`;

    const boarders = JSON.parse(localStorage.getItem(`boarders_${currentUser.username}`)) || [];
    if (boarders.length === 0) {
        console.warn("No boarders found in the system.");
        return; // No boarders to load
    }
    boarders.forEach(b => {
        const option = document.createElement("option");
        option.value = b.name;
        option.textContent = b.name;
        dropdown.appendChild(option);
    });
}

// Initialize
clearBillsForNewMonth()
renderTransactionsTable();
renderTable();
renderBillTable();
autoMatchTransactionsToBills();
loadBoardersForBills();
loadBoardersDropdown();


