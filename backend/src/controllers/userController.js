const User = require('../models/User');
const { logActivity } = require('../utils/activityLogger');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, role, phone } = req.body;

    const user = await User.create({
      username,
      email,
      password,
      first_name,
      last_name,
      role,
      phone
    });

    await logActivity(
      req.user.id,
      'Create User',
      'Users',
      user.id,
      `Created user ${username} with role ${role}`,
      req.ip
    );

    const userData = user.toJSON();
    delete userData.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { username, email, first_name, last_name, role, phone, status, password } = req.body;

    const updateData = {
      username,
      email,
      first_name,
      last_name,
      role,
      phone,
      status
    };

    if (password) {
      updateData.password = password;
    }

    await user.update(updateData);

    await logActivity(
      req.user.id,
      'Update User',
      'Users',
      user.id,
      `Updated user ${user.username}`,
      req.ip
    );

    const userData = user.toJSON();
    delete userData.password;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: userData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin' && user.id === 1) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete the main administrator account'
      });
    }

    await user.update({ status: 'inactive' });

    await logActivity(
      req.user.id,
      'Delete User',
      'Users',
      user.id,
      `Deactivated user ${user.username}`,
      req.ip
    );

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};
