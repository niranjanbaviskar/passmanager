const express = require('express');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

dotenv.config();

// MongoDB URI and DB Name
const url = 'mongodb://localhost:27017/';
const dbName = process.env.DB_NAME;
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB
async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the application if MongoDB connection fails
    }
}

connectToDatabase();

// App & Database
const app = express();
const port = 3005;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Get all passwords
app.get('/', async (req, res) => {
    try {
        const db = client.db(dbName);
        const collection = db.collection('passwords');
        const findResult = await collection.find({}).toArray();
        res.json(findResult);
    } catch (error) {
        console.error('Error fetching passwords:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Save a password
app.post('/', async (req, res) => {
    try {
        const password = req.body;
        const db = client.db(dbName);
        const collection = db.collection('passwords');
        const result = await collection.insertOne(password);
        res.send({ success: true, result });
    } catch (error) {
        console.error('Error saving password:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Delete a password by id
app.delete('/', async (req, res) => {
    try {
        const { id } = req.body;
        const db = client.db(dbName);
        const collection = db.collection('passwords');
        const result = await collection.deleteOne({ _id: new MongoClient.ObjectId(id) });
        res.send({ success: true, result });
    } catch (error) {
        console.error('Error deleting password:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port}`);
});
// Update a password by id
app.put('/update', async (req, res) => {
    try {
        const { id, newData } = req.body;
        const db = client.db(dbName);
        const collection = db.collection('passwords');
        
        // Update the document
        const result = await collection.updateOne(
            { _id: new ObjectId(id) }, // Filter
            { $set: newData } // Update operation
        );
        
        res.send({ success: true, result });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Ensure connection is closed on application exit
process.on('SIGINT', async () => {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
});
