const {Schema} = require('mongoose');

//same name as file name
const HoldingSchema = new Schema({
    name: String,
    qty: Number,
    avg: Number,
    price: Number,
    net: String,
    day: String,
    owner:{
        type: Schema.Types.ObjectId,
        ref: "UserModel",
    }
});

module.exports = {HoldingSchema};