import mongoose from "mongoose";


const usersCollections = 'Users';

const usersSchema = new mongoose.Schema({
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    email: {type: String, required: true, unique: true },
    age: {type: Number, required: true},
    password: {type: String, required: true},
    rol: {type: String, default: "user"},
    cartId: { type: mongoose.Schema.Types.ObjectId, ref: 'carts', required: true }
})

const usersModel = mongoose.model(usersCollections, usersSchema);

export default usersModel;