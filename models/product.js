const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  id:{
    type: String,
    required: true
  },
  name:{
    type:String,
    required: true,
  },
  image:{
    type: String,
  },
  price:{
    type: Number,
    require : true
  }
});

module.exports = mongoose.model("product", productSchema);