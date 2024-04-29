const express = require("express");
const mongodb = require("mongodb");
const path = require("path");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const session = require('express-session');

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: 'Akash3975',
  resave: false,
  saveUninitialized: true
}));

// Connect to MongoDB
const MongoClient = mongodb.MongoClient;
const mongoURL = "mongodb://localhost:27017"; // Change this URL as per your MongoDB setup
const dbName = "Ecom-Task"; // Change this to your database name

MongoClient.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then((client) => {
    console.log("Connected to MongoDB");
    const db = client.db(dbName);

    // Define routes
    app.get("/", async (req, res) => {
      const data = await db.collection("products").find().toArray(); // Change collection name
      res.render("index", { data });
    });

    // singup routes
    app.get("/signup", (req, res) => {
      res.render("signup");
    });

    app.post("/signup", async (req, res) => {
      const collection = db.collection("users");
      const data = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        phone: req.body.phone,
      };

      // checked user already exist in databse
      const existingUser = await collection.findOne({ email: data.email });

      if (existingUser) {
        res.send("user already exists");
        res.status(404);
      } else {
        // hashed password use methode
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        data.password = hashedPassword; //replace the hashed pasword with original password

        const userdata = await collection.insertOne(data);
        console.log(userdata);
        res.redirect('/login');
      }
    });




    // login routes
    app.get("/login", (req, res) => {
      res.render("login");
    });

    app.post("/login", async (req, res) => {
      const collection = db.collection("users");
      const userName = db.collection.findOne(firstName)
      try {
        const check = await collection.findOne({ email: req.body.email });
        if (!check) {
          res.send("this user cannot found");
          res.status(501);
        }

        // compare the hash password from the database with the pain text .

        const isPasswordMatch = await bcrypt.compare(
          req.body.password,
          check.password
        );
        if (isPasswordMatch) {
          res.status(201).json({ message: "login successfull" })
          res.redirect('/');

        } else {
          res.send("wrong password");
          res.status(501);
        }
      } catch {
        res.send("wrong Credentials");
        res.status(404);
      }
    });

    app.get('/cart', (req, res) => {
      // Retrieve cart items from session
      const cartItems = req.session.cart || [];
      res.render('cart', { cartItems });
    });

    app.post('/add-to-cart', (req, res) => {
      const productId = req.body.productId;
      // Assume user's cart is stored in the session
      if (!req.session.cart) {
        req.session.cart = [];
      }
      req.session.cart.push(productId);
      res.redirect('/');
    });


    app.post('/delete-from-cart', (req, res) => {
      const productId = req.body.productId;
      // Ensure req.session.cart is initialized as an array
      req.session.cart = req.session.cart || [];
      // Remove product from cart
      req.session.cart = req.session.cart.filter(id => id !== productId);
      res.redirect('/cart')
    });



    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });




// Set EJS as view engine
app.set("view engine", "ejs");
