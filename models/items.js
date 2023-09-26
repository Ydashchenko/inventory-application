const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: String,
    description: String,
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Reference to the Category model
    },
    price: Number,
    amount: Number,
    image: String,
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
