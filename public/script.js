const debtForm = document.getElementById('debtForm');
const debtList = document.getElementById('debtList');

// Fetch debts and display with date information
function fetchDebts() {
    fetch('/debts')
        .then(response => response.json())
        .then(debts => {
            debts.forEach(debt => {
                addDebt(debt.creditor, debt.amount, new Date(debt.addedDate), debt.id, debt.paidDate);
            });
            // Update debt summary based on fetched debts
            updateDebtSummary(debts);

        })
        .catch(error => console.error('Error fetching debts:', error));
}



// Initial fetching of debts when the page loads
fetchDebts();

// Function to generate a unique ID
function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9); // Generate a random alphanumeric string
}

debtForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const creditor = document.getElementById('creditor').value;
    const amount = document.getElementById('amount').value;
    const addedDate = new Date(); // Get current date
    const id = generateUniqueId(); // Generate a unique ID
    addDebt(creditor, amount, addedDate, id); // Pass the generated ID to addDebt
    saveDebt(creditor, amount, addedDate, id); // Pass the generated ID to saveDebt
    debtForm.reset();
});


// Modify the addDebt function to include the id parameter
function addDebt(creditor, amount, addedDate, id, paidDate) {
    if (!(addedDate instanceof Date) || isNaN(addedDate.getTime())) {
        addedDate = new Date(); // If addedDate is not a valid Date object, initialize it to current date
    }
    const li = document.createElement('li');
    const formattedDateTime = addedDate.toLocaleString(); // Include date and time
    li.dataset.id = id; // Set the data-id attribute with the debt ID

    if (paidDate) {
        // If paidDate is provided, mark the debt as paid and style it accordingly
        const formattedPaidTime = new Date(paidDate).toLocaleString();
        li.innerHTML = `
            <input type="checkbox" checked disabled>
            <span style="text-decoration: line-through;">${creditor}: ₱${amount} (Added: ${formattedDateTime}, Paid: ${formattedPaidTime})</span>
        `;
    } else {
        // If paidDate is not provided, the debt is unpaid
        li.innerHTML = `
            <input type="checkbox">
            <span>${creditor}: ₱${amount} (Added: ${formattedDateTime})</span>
        `;
    }

    debtList.appendChild(li);
}




function saveDebt(creditor, amount, addedDate, id) {
    fetch('/debts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creditor, amount, addedDate, id }), // Include addedDate in the request body
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save debt');
        }
        console.log('Debt saved successfully');
    })
    .catch(error => console.error('Error saving debt:', error));
}

// Function to handle checkbox click event
function handleCheckboxClick(event) {
    const checkbox = event.target;
    const li = checkbox.closest('li');
    console.log(li);
    const debtId = li.dataset.id; // Correctly extract the debt ID
    
    // Ask for confirmation
    const confirmed = confirm("Are you sure you want to mark this debt as paid?");
    if (confirmed) {
        if (checkbox.checked) {
            markDebtAsPaid(debtId);
        }
    } else {
        // If not confirmed, uncheck the checkbox
        checkbox.checked = false;
    }
}



// Function to mark a debt as paid
function markDebtAsPaid(debtId) {
    fetch(`/debts/${debtId}`, { // Include debtId in the URL
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paidDate: new Date() }),
    })
    .then(response => {
        console.log(response);
        if (!response.ok) {
            throw new Error('Failed to mark debt as paid');
        }
        console.log('Debt marked as paid successfully');
    })
    .catch(error => console.error('Error marking debt as paid:', error));
}


// Add event listener for checkbox clicks
debtList.addEventListener('click', handleCheckboxClick);
// Calculate debt summary
function calculateDebtSummary(debts) {
    const unpaidCreditorDebts = {};
    const paidCreditorDebts = {};
    let totalUnpaidDebt = 0;
    let totalPaidDebt = 0;

    debts.forEach(debt => {
        const creditor = debt.creditor;
        const amount = parseFloat(debt.amount);
        const paidDate = debt.paidDate; // Assuming paidDate is present for paid debts

        if (paidDate) {
            // If debt is paid, update paidCreditorDebts and totalPaidDebt
            paidCreditorDebts[creditor] = (paidCreditorDebts[creditor] || 0) + amount;
            totalPaidDebt += amount;
        } else {
            // If debt is unpaid, update unpaidCreditorDebts and totalUnpaidDebt
            unpaidCreditorDebts[creditor] = (unpaidCreditorDebts[creditor] || 0) + amount;
            totalUnpaidDebt += amount;
        }
    });

    return { unpaidCreditorDebts, paidCreditorDebts, totalUnpaidDebt, totalPaidDebt };
}

// Update debt summary in the UI
function updateDebtSummary(debts) {
    const { unpaidCreditorDebts, paidCreditorDebts, totalUnpaidDebt, totalPaidDebt } = calculateDebtSummary(debts);
    const totalDebtElement = document.getElementById('totalDebt');
    const totalPaidDebtElement = document.getElementById('totalPaidDebt');
    const unpaidCreditorSummaryElement = document.getElementById('unpaidCreditorSummary');
    const paidCreditorSummaryElement = document.getElementById('paidCreditorSummary');

    // Construct the HTML string for total debt
    const totalDebtHTML = `<p><b>Total Debt (Unpaid): ₱${totalUnpaidDebt}</b></p>`;
    const totalPaidDebtHTML = `<p><b>Total Paid Debt: ₱${totalPaidDebt}</b></p>`;

    // Construct the HTML string for unpaid creditor summary
    let unpaidCreditorSummaryHTML = '<ul>';
    for (const creditor in unpaidCreditorDebts) {
        if (unpaidCreditorDebts.hasOwnProperty(creditor)) {
            const debtAmount = unpaidCreditorDebts[creditor];
            unpaidCreditorSummaryHTML += `<li>${creditor}: ₱${debtAmount}</li>`;
        }
    }
    unpaidCreditorSummaryHTML += '</ul>';

    // Construct the HTML string for paid creditor summary
    let paidCreditorSummaryHTML = '<ul>';
    for (const creditor in paidCreditorDebts) {
        if (paidCreditorDebts.hasOwnProperty(creditor)) {
            const debtAmount = paidCreditorDebts[creditor];
            paidCreditorSummaryHTML += `<li>${creditor}: ₱${debtAmount}</li>`;
        }
    }
    paidCreditorSummaryHTML += '</ul>';

    // Set the HTML content for total debt and creditor summaries
    totalDebtElement.innerHTML = totalDebtHTML;
    unpaidCreditorSummaryElement.innerHTML = unpaidCreditorSummaryHTML;
    totalPaidDebtElement.innerHTML = totalPaidDebtHTML
    paidCreditorSummaryElement.innerHTML = paidCreditorSummaryHTML;
}


// Login
// script.js

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the form data
    const formData = new FormData(this);

    // Send a POST request to the server's /login endpoint
    fetch('/login', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            // Redirect to dashboard or another page upon successful login
            window.location.href = '/dashboard';
        } else {
            // Handle authentication failure
            console.error('Login failed:', response.statusText);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
