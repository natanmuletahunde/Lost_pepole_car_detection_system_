const TelegramBot = require('node-telegram-bot-api');
const User = require('./models/User');
// const AuditLog = require('./models/AuditLog'); // Uncomment if you have it

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error('❌ TELEGRAM_BOT_TOKEN is missing in .env');
}

// Initialize bot
const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Telegram bot started...');

// ==============================
// MESSAGE HANDLER
// ==============================
bot.on('message', async (msg) => {
  try {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();

    // ==============================
    // START COMMAND
    // ==============================
    if (text === '/start') {
      return bot.sendMessage(
        chatId,
        '👋 Welcome!\n\nSend your registered email to link your account and receive alerts.'
      );
    }

    // ==============================
    // EMAIL LINKING
    // ==============================
    const isEmail = /\S+@\S+\.\S+/.test(text);

    if (isEmail) {
      const email = text.toLowerCase();

      const user = await User.findOne({ email });

      if (!user) {
        return bot.sendMessage(
          chatId,
          '❌ No account found with this email.\nPlease register first.'
        );
      }

      // Already linked
      if (user.telegramChatId === chatId) {
        return bot.sendMessage(
          chatId,
          '✅ Your account is already linked to this Telegram.'
        );
      }

      // Update user
      user.telegramChatId = chatId;
      await user.save();

      // Optional audit log
      /*
      await new AuditLog({
        action: `Telegram linked: ${chatId}`,
        userId: user._id
      }).save();
      */

      return bot.sendMessage(
        chatId,
        '✅ Account linked successfully!\nYou will now receive detection alerts here 🚨'
      );
    }

    // ==============================
    // DEFAULT RESPONSE
    // ==============================
    return bot.sendMessage(
      chatId,
      '📩 Please send your registered email to link your account.\nOr type /start'
    );

  } catch (error) {
    console.error('❌ Telegram Bot Error:', error.message);
  }
});

// ==============================
// EXPORT BOT
// ==============================
module.exports = bot;