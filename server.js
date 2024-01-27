const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());


const dataFilePath = 'data.json';

// Read data from file
async function readDataFromFile() {
    return new Promise((resolve, reject) => {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        if(data.length > 0){
            const res = JSON.parse(data);
            resolve(res)
        } else {
            reject(false)
        }
    })
}

// Write data to file
async function writeDataToFile(data) {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data));
    } catch (error) {
        console.error('Error writing data:', error);
        throw error;
    }
}


app.get('/debts', (req, res) => {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading data');
            return;
        }
        res.json(JSON.parse(data));
    });
});

// Add date information to the debt object
app.post('/debts', async (req, res) => {
    try {
        const debt = { ...req.body, addedDate: new Date(), paidDate: null };
        let debts = await readDataFromFile();
        debts.push(debt);
        await writeDataToFile(debts);
        res.status(201).send('Debt added successfully');
    } catch (error) {
        res.status(500).send('Error saving debt');
    }
});

// Update the paidDate when marking a debt as paid
app.put('/debts/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { paidDate } = req.body;
        let debts = await readDataFromFile();
        
        const index = debts.findIndex(debt => debt.id === id);
        if (index !== -1) {
            debts[index].paidDate = new Date(paidDate);
            await writeDataToFile(debts);
            res.status(200).send('Debt marked as paid');
        } else {
            res.status(404).send('Debt not found');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Error marking debt as paid');
    }
});

// server.js or your main application file

const authController = require('./authController');
// server.js or your main application file

const authMiddleware = require('./authMiddleware');
// server.js or your main application file

const debtController = require('./debtController');


// Authentication routes
app.post('/login', authController.login);
app.post('/register', authController.register);
app.post('/logout', authController.logout);

// Debt management routes
app.get('/debts', authMiddleware.authenticate, debtController.getAllDebts);
app.post('/debts', authMiddleware.authenticate, debtController.createDebt);
// Add more routes as needed for updating, deleting debts, etc.


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
