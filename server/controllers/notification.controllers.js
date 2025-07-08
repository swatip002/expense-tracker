const Notifications = require('../models/notification.model');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await notification.remove();
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};