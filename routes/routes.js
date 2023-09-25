const express = require('express')
const router = express.Router()

router.get('/items', (req, res) => {
    res.send('All Items')
})

router.get('/categories', (req, res) => {
    res.send('All categories')
})

module.exports = router