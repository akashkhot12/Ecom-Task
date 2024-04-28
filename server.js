const express = require('express');
const mongodb = require('mongodb');

const app = express();

// Connect to MongoDB
const MongoClient = mongodb.MongoClient;
const mongoURL = 'mongodb://localhost:27017'; // Change this URL as per your MongoDB setup
const dbName = 'Ecom-Task'; // Change this to your database name

MongoClient.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    const db = client.db(dbName);

    // Define routes
    app.get('/', async (req, res) => {
      const data = await db.collection('products').find().toArray(); // Change collection name
      res.render('index', { data });
    });

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

// Set EJS as view engine
app.set('view engine', 'ejs');
