const {Schema} = require('mongoose');

const OrderSchema = new Schema({
    name: String,
    qty: Number,
    price:String,
    mode: String,
    owner:{
        type: Schema.Types.ObjectId,
        ref: "UserModel",
    }
})
module.exports = {OrderSchema};