const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middlewares');
const upload = require('../middlewares/upload.middlewares');
const { importTransactions } = require('../controllers/import.controllers');

router.post('/upload', auth, upload.single('file'), importTransactions);

module.exports = router;