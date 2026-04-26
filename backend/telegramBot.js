const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const User = require('./models/User');


const token = process.env.TELEGRAM_BOT_TOKEN;

// Initialize bot with polling
const bot = new TelegramBot(token, { polling: true });

// Reuse existing MongoDB connection
if (mongoose.connection.readyState === 0) {
  console.warn('No active MongoDB connection. Ensure connectDB is called elsewhere.');
}

// Handle incoming messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text && text.match(/\S+@\S+\.\S+/)) { // Check if text is an email
    const user = await User.findOne({ email: text.toLowerCase() });
    if (user) {
      if (user.telegramChatId === 0 || user.telegramChatId !== chatId) {
        await User.findOneAndUpdate(
          { email: text.toLowerCase() },
          { telegramChatId: chatId },
          { new: true }
        );
        await new AuditLog({ action: `Linked Telegram chat ID ${chatId} for user ID${user.id}`, userId: user.id }).save();
        bot.sendMessage(chatId, 'Your account is linked! You’ll receive detection alerts here.');
      } else {
        bot.sendMessage(chatId, 'This account is already linked to this chat.');
      }
    } else {
      bot.sendMessage(chatId, 'No account found. Please register at the website with this email first.');
    }
  } else if (text === '/start') {
    bot.sendMessage(chatId, 'Welcome to Lost People Detection Bot! Send your registered email to link your account.');
  } else {
    bot.sendMessage(chatId, 'Please send your registered email or type /start for help.');
  }
});

// Export bot for use in routes
module.exports = bot;