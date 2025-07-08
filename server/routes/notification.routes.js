const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, deleteNotification } = require('../controllers/notification.controllers');
const auth = require('../middlewares/auth.middlewares');

router.use(auth);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;