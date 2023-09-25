const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render('index', { title: 'Home Page' })
})

router.get('/item/create', (req, res) => {
    res.render('create_item', { title: "Create Item" })
})

router.get('/category/create', (req, res) => {
    res.render('create_category', { title: "Create Category" })
})

module.exports = router