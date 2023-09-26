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
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname)
    }
})

var upload = multer({
    storage: storage,
}).single('image');

// Insert item into db
router.post('/item/create', upload, async (req, res) => {
    try {
        const category = await Category.findOne({ name: req.body.category }).exec();

        if (!category) {
            return res.json({ message: 'Category not found', type: 'danger' });
        }

        const item = new Item({
            name: req.body.itemName,
            description: req.body.itemDescription,
            category: category._id, // Store the ObjectId of the category
            price: req.body.price,
            amount: req.body.amount,
            image: req.file.filename,
        });

        await item.save();
        req.session.message = {
            type: 'success',
            message: 'Item added successfully!',
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});


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

router.get('/item/create', async (req, res) => {
    try {
        const categories = await Category.find().exec()
        res.render('create_item', {
            title: "Create Item",
            categories: categories
        })
    } catch (err) {
        res.json({ message: err.message })
    }
})

router.get('/category/create', (req, res) => {
    res.render('create_category', { title: "Create Category" })
})

// Get items within a specific category
router.get('/category/:categoryId', async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const category = await Category.findById(categoryId).exec();
        if (!category) {
            return res.status(404).render('category_not_found', {
                title: 'Category Not Found'
            });
        }

        const itemsInCategory = await Item.find({ category: categoryId }).exec();
        res.render('category_items', {
            title: `Items in ${category.name}`,
            category: category,
            items: itemsInCategory
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});

module.exports = router