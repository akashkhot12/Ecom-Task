const loginSchema  = new mongoose.Schema({
    name:{
        type:String,
        require:false
    },
    email:{
        type:String,
        require:true
    },
   password:{
    type:String,
    require:true
   }
});

// create a model (collection part )

const collection = new mongoose.model("users",loginSchema);

module.exports = collection;