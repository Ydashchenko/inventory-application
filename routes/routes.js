const express = require('express')
const router = express.Router()
const Item = require('../models/items')
const Category = require('../models/category')
const multer = require('multer')

// image upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads")
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" +file.originalname)
    }
})

var upload = multer({
    storage: storage,
}).single('image')

// Insert item into db
router.post('/item/create', upload, async (req, res) => {
    const item = new Item({
        name: req.body.itemName,
        description: req.body.itemDescription,
        category: req.body.category,
        price: req.body.price,
        amount: req.body.amount,
        image: req.file.filename
    })
    try {
        await item.save();
        req.session.message = {
            type: 'success',
            message: 'Item added successfully!'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger ' });
    }
})

// Insert category into db
router.post('/category/create', upload, async (req, res) => {
    const category = new Category({
        name: req.body.categoryName,
        description: req.body.categoryDescription,
    })
    try {
        await category.save();
        req.session.message = {
            type: 'success',
            message: 'Category added successfully!'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger ' });
    }
})

// Get all Categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().exec();
        res.render('index', {
            title: 'Home Page',
            categories: categories
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});


router.get('/item/create', (req, res) => {
    res.render('create_item', { title: "Create Item" })
})

router.get('/category/create', (req, res) => {
    res.render('create_category', { title: "Create Category" })
})

module.exports = router