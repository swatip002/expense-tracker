const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middlewares');
const { createRecurring, getRecurring, toggleRecurring, deleteRecurring, updateRecurrin } = require('../controllers/recurringTransaction.controllers');

router.use(auth);

router.post('/', createRecurring);
router.get('/', getRecurring);
router.patch('/:id/toggle', toggleRecurring);
router.delete('/:id', deleteRecurring);
router.put('/:id', updateRecurring); 

module.exports = router;