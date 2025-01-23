const TelegramUser = require('../models/TelegramUser');
const Url = require('../models/Url');
const { generateShortCode } = require('../utils/helpers');
const { logger } = require('../utils/logger');

async function handleStart(bot, msg) {
  const chatId = msg.chat.id;
  try {
    let user = await TelegramUser.findOne({ telegramId: msg.from.id.toString() });
    
    if (!user) {
      user = await TelegramUser.create({
        telegramId: msg.from.id.toString(),
        username: msg.from.username,
        firstName: msg.from.first_name,
        lastName: msg.from.last_name,
      });
      logger.info(`New user registered: ${user.telegramId}`);
    }

    const message = `Welcome to URL Shortener Bot! 🚀\n\n` +
      `Commands:\n` +
      `/shorten <url> - Create a short URL\n` +
      `/stats - View your URL statistics\n` +
      `/premium - Get premium status\n\n` +
      `${user.isPremium ? '✨ You are a premium user!' : '🔒 Upgrade to premium to create unlimited short URLs!'}`;

    await bot.sendMessage(chatId, message);
  } catch (error) {
    logger.error('Error in handleStart:', error);
    throw error;
  }
}

async function handlePremium(bot, msg) {
  const chatId = msg.chat.id;
  try {
    const user = await TelegramUser.findOne({ telegramId: msg.from.id.toString() });
    
    if (user?.isPremium) {
      await bot.sendMessage(chatId, '✨ You are already a premium user!');
      return;
    }

    const message = 'To get premium status:\n\n' +
      '1. Contact @YourAdminUsername\n' +
      '2. Send payment proof\n' +
      '3. Get unlimited URL shortening!\n\n' +
      'Premium benefits:\n' +
      '✓ Unlimited URL shortening\n' +
      '✓ URL click statistics\n' +
      '✓ Custom short codes (coming soon)';

    await bot.sendMessage(chatId, message);
  } catch (error) {
    logger.error('Error in handlePremium:', error);
    throw error;
  }
}

async function handleStats(bot, msg) {
  const chatId = msg.chat.id;
  try {
    const user = await TelegramUser.findOne({ telegramId: msg.from.id.toString() });
    if (!user) {
      await bot.sendMessage(chatId, 'Please start the bot first with /start');
      return;
    }

    const urls = await Url.find({ createdBy: user.telegramId });
    const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);

    const message = `📊 Your Statistics\n\n` +
      `URLs Created: ${user.urlsCreated}\n` +
      `Total Clicks: ${totalClicks}\n` +
      `Account Type: ${user.isPremium ? 'Premium ✨' : 'Free'}`;

    await bot.sendMessage(chatId, message);
  } catch (error) {
    logger.error('Error in handleStats:', error);
    throw error;
  }
}

async function handleShorten(bot, msg, match) {
  const chatId = msg.chat.id;
  const originalUrl = match[1];

  try {
    const user = await TelegramUser.findOne({ telegramId: msg.from.id.toString() });
    
    if (!user) {
      await bot.sendMessage(chatId, 'Please start the bot first with /start');
      return;
    }

    if (!user.isPremium && user.urlsCreated >= 3) {
      await bot.sendMessage(
        chatId,
        '🔒 Free users can only create 3 short URLs.\n' +
        'Use /premium to upgrade and create unlimited URLs!'
      );
      return;
    }

    try {
      new URL(originalUrl);
    } catch {
      await bot.sendMessage(chatId, '❌ Please provide a valid URL');
      return;
    }

    let shortCode = generateShortCode();
    while (await Url.findOne({ shortCode })) {
      shortCode = generateShortCode();
    }

    const url = await Url.create({
      originalUrl,
      shortCode,
      createdBy: user.telegramId,
    });

    user.urlsCreated += 1;
    await user.save();

    logger.info(`New URL created: ${shortCode} by user ${user.telegramId}`);

    const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${shortCode}`;
    const message = `✅ URL shortened successfully!\n\n` +
      `Original: ${originalUrl}\n` +
      `Short: ${shortUrl}\n\n` +
      `${user.isPremium ? '' : `${3 - user.urlsCreated} free URLs remaining`}`;

    await bot.sendMessage(chatId, message);
  } catch (error) {
    logger.error('Error in handleShorten:', error);
    throw error;
  }
}

module.exports = {
  handleStart,
  handlePremium,
  handleStats,
  handleShorten,
};
