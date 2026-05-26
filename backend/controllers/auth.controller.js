const User = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');
const {
  signToken,
  signRefreshToken,
  verifyToken,
  verifyRefreshToken
} = require('../utils/jwt');


// ================= REGISTER =================
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password, telegramUsername } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Phone number';
      return ApiResponse.error(res, `${field} already exists`, 400);
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      telegramUsername
    });

    const token = signToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    // store refresh token safely (no validation triggers)
    await User.findByIdAndUpdate(user._id, {
      refreshToken
    });

    return ApiResponse.success(
      res,
      'User registered successfully',
      {
        user, // schema toJSON will clean sensitive fields
        token,
        refreshToken
      },
      201
    );

  } catch (error) {
    next(error);
  }
};


// ================= LOGIN =================
const login = async (req, res, next) => {
  try {
    const { loginValue, password } = req.body;

    if (!loginValue || !password) {
      return ApiResponse.error(res, 'Login value and password required', 400);
    }

    const isEmail = loginValue.includes('@');

    const user = await User.findOne(
      isEmail ? { email: loginValue } : { phone: loginValue }
    ).select('+password +refreshToken');

    if (!user) {
      return ApiResponse.error(
        res,
        `No account found with this ${isEmail ? 'email' : 'phone number'}`,
        401
      );
    }

    if (!user.isActive) {
      return ApiResponse.error(res, 'Account has been deactivated', 401);
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return ApiResponse.error(res, 'Invalid password', 401);
    }

    // update last login WITHOUT triggering hooks
    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date()
    });

    const token = signToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    await User.findByIdAndUpdate(user._id, {
      refreshToken
    });

    return ApiResponse.success(res, 'Login successful', {
      user, // cleaned by toJSON
      token,
      refreshToken
    });

  } catch (error) {
    next(error);
  }
};


// ================= GET ME =================
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    return ApiResponse.success(res, 'User retrieved successfully', {
      user
    });

  } catch (error) {
    next(error);
  }
};


// ================= UPDATE PROFILE =================
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, address, profileImage, telegramUsername } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (telegramUsername !== undefined) updateData.telegramUsername = telegramUsername;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    return ApiResponse.success(res, 'Profile updated successfully', {
      user
    });

  } catch (error) {
    next(error);
  }
};


// ================= CHANGE PASSWORD =================
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return ApiResponse.error(res, 'Current password is incorrect', 401);
    }

    user.password = newPassword;
    user.passwordChangedAt = Date.now();

    await user.save(); // safe now (password exists)

    return ApiResponse.success(res, 'Password changed successfully');

  } catch (error) {
    next(error);
  }
};


// ================= LOGOUT =================
const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      refreshToken: null
    });

    return ApiResponse.success(res, 'Logged out successfully');

  } catch (error) {
    next(error);
  }
};

// ================= DELETE MY ACCOUNT =================
const deleteMyAccount = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);

    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    return ApiResponse.success(res, 'Account deleted successfully');

  } catch (error) {
    next(error);
  }
};


// ================= REFRESH TOKEN =================
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return ApiResponse.error(res, 'Refresh token is required', 400);
    }

    const decoded = verifyRefreshToken(token);

    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return ApiResponse.error(res, 'Invalid refresh token', 401);
    }

    const newToken = signToken(user._id);
    const newRefreshToken = signRefreshToken(user._id);

    await User.findByIdAndUpdate(user._id, {
      refreshToken: newRefreshToken
    });

    return ApiResponse.success(res, 'Token refreshed successfully', {
      token: newToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    next(error);
  }
};


// ================= TELEGRAM SIGN-IN =================
const bot = require('../telegramBot');
const crypto = require('crypto');

const verifyTelegramAuth = (authData) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;

  const { hash, ...data } = authData;

  // Sort and construct check string
  const dataCheckString = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join('\n');

  // SHA256 of bot token
  const secretKey = crypto.createHash('sha256').update(token).digest();

  // HMAC-SHA256 signature
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return signature === hash;
};

const telegramLogin = async (req, res, next) => {
  try {
    const authData = req.body;
    if (!authData || !authData.hash || !authData.id) {
      return ApiResponse.error(res, 'Missing Telegram authentication data', 400);
    }

    const isValid = verifyTelegramAuth(authData);
    if (!isValid) {
      return ApiResponse.error(res, 'Invalid Telegram authentication signature', 401);
    }

    const now = Math.floor(Date.now() / 1000);
    const authDate = parseInt(authData.auth_date, 10);
    if (!authDate || now - authDate > 86400) {
      return ApiResponse.error(res, 'Authentication session expired. Please login again.', 401);
    }

    const telegramId = String(authData.id);
    const telegramUser = authData.username || '';

    // Find user by telegramChatId or telegramUsername (case-insensitive)
    let user = await User.findOne({
      $or: [
        { telegramChatId: telegramId },
        { telegramUsername: { $regex: new RegExp(`^${telegramUser}$`, 'i') } }
      ]
    }).select('+refreshToken');

    if (!user) {
      return ApiResponse.error(
        res,
        'No registered account is linked to this Telegram user. Please register/log in with email first and link your Telegram account.',
        444 // Specific custom code so frontend knows it's a link missing case
      );
    }

    if (!user.isActive) {
      return ApiResponse.error(res, 'Account has been deactivated', 401);
    }

    // Update telegramChatId if not linked yet
    if (!user.telegramChatId) {
      user.telegramChatId = telegramId;
    }
    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    await User.findByIdAndUpdate(user._id, {
      refreshToken
    });

    return ApiResponse.success(res, 'Login successful', {
      user,
      token,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

const getTelegramConfig = async (req, res, next) => {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return ApiResponse.success(res, 'Telegram bot not configured', { enabled: false });
    }

    let botName = bot.username;
    if (!botName) {
      try {
        const me = await bot.getMe();
        botName = me.username;
      } catch (err) {
        console.error('Failed to query Telegram Bot Username dynamically:', err.message);
      }
    }

    return ApiResponse.success(res, 'Telegram config retrieved', {
      enabled: true,
      botName: botName || 'LostPeopleCarDetectionBot'
    });
  } catch (error) {
    next(error)
  }
};

const getGoogleConfig = async (req, res, next) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return ApiResponse.success(res, 'Google OAuth not configured', { enabled: false });
    }

    return ApiResponse.success(res, 'Google config retrieved', {
      enabled: true,
      clientId: clientId
    });
  } catch (error) {
    next(error);
  }
};

// ================= EXPORTS =================
module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  refreshToken,
  deleteMyAccount,
  telegramLogin,
  getTelegramConfig,
  getGoogleConfig
};