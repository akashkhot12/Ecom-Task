const express = require('express');
const mongodb = require('mongodb');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

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



    // singup routes
    app.get('/signup', (req, res) => {
        res.render('signup');
    });

    app.post('/signup', async(req,res)=>{
        const collection = db.collection('users');
        const data = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone
        }
    
        // checked user already exist in databse 
        const existingUser = await collection.findOne({ email: data.email })
    
        if (existingUser) {
            res.send("user already exists");
            res.status(404)
        }
        else {
            // hashed password use methode 
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    
            data.password = hashedPassword //replace the hashed pasword with original password 
    
    
            const userdata = await collection.insertOne(data);
            console.log(userdata);
        }
    })

    
    // login routes
    app.get('/login', (req, res) => {
        res.render('login');
    });

    app.post("/login",async(req,res)=>{
      const collection = db.collection('users');
      try{
          const check = await collection.findOne({email:req.body.email});
          if (!check) {
              res.send("this user cannot found");
              res.status(501)
          }
  
          // compare the hash password from the database with the pain text .
  
          const isPasswordMatch = await bcrypt.compare(req.body.password,check.password)
          if (isPasswordMatch) {
              res.send("login Successfully");
              res.status(201)
          }
          else{
               res.send("wrong password")
               res.status(501)
          }
      }
      catch{
          res.send("wrong Credentials");
          res.status(404)
      }
   })

   

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
