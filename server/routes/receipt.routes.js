const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middlewares');
const upload = require('../middlewares/upload.middlewares');
const { extractReceiptData } = require('../controllers/receipt.controllers');

//Route to extract receipt data
router.post('/receipt', auth, upload.single('receipt'), extractReceiptData);

module.exports = router;