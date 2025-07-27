const User = require('../models/user.model'); // or wherever your User schema is
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
};

exports.updateProfile = async (req, res) => {
  const { name, email, theme } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, email, theme },
    { new: true }
  ).select('-password');
  res.json(user);
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  const isMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: 'Old password is incorrect' });
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.json({ message: 'Password updated successfully' });
};
