const express = require('express')
const router = express.Router()
const Item = require('../models/items')
const Category = require('../models/category')
const multer = require('multer')
const fs = require('fs')
const mongoose = require('mongoose');


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

        // Replace spaces with underscores in the filename
        const sanitizedFilename = req.file.filename.replace(/ /g, '_');

        // Create a new Item with the sanitized filename
        const item = new Item({
            name: req.body.itemName,
            description: req.body.itemDescription,
            category: category._id, // Store the ObjectId of the category
            price: req.body.price,
            amount: req.body.amount,
            image: sanitizedFilename, // Use the sanitized filename
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

// Create item
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

// Get category items
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

        // Pass the items directly to the template without modifying the image paths
        res.render('category_items', {
            title: `Items in ${category.name}`,
            category: category,
            items: itemsInCategory // Use itemsInCategory in the template
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});


// Edit item
router.get('/item/:itemID/edit/', async (req, res) => {
    try {
        const itemID = req.params.itemID;
        const item = await Item.findById(itemID).exec();

        if (!item) {
            return res.redirect('/');
        }

        const categories = await Category.find().exec();

        res.render('edit_items', { 
            title: "Edit Item",
            item: item,
            categories: categories
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});

// Update item
router.post('/item/:itemID/update', upload, async (req, res) => {
    try {
        const itemID = req.params.itemID;
        let new_image = '';

        if (req.file) {
            new_image = req.file.filename;
            try {
                fs.unlinkSync('./uploads/' + req.body.old_image);
            } catch (err) {
                console.log(err);
            }
        } else {
            new_image = req.body.old_image;
        }

        const item = await Item.findById(itemID).exec();

        if (!item) {
            return res.json({ message: 'Item not found', type: 'danger' });
        }

        item.name = req.body.itemName;
        item.description = req.body.itemDescription;

        // Find the category by name
        const category = await Category.findOne({ _id: req.body.category }).exec();
        console.log(req.body.category)

        if (!category) {
            return res.json({ message: 'Category not found', type: 'danger' });
        }

        item.category = category._id; // Assign the category ID
        item.price = req.body.price;
        item.amount = req.body.amount;
        item.image = new_image;

        const updatedItem = await item.save();

        req.session.message = {
            type: 'success',
            message: 'Item updated successfully!',
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

module.exports = router