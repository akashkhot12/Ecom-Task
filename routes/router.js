// sign up 
app.post('/signup', async (req, res) => {
    const data = {
        name: req.body.username,
        email: req.body.email,
        password: req.body.password
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


        const userdata = await collection.insertMany(data);
        console.log(userdata);
    }
})