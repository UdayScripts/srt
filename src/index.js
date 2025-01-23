const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const winston = require('winston');
const { connectDB } = require('./config/db');
const { handleStart, handlePremium, handleStats, handleShorten } = require('./handlers');
const { logger } = require('./utils/logger');

// Load environment variables
require('dotenv').config();

// Initialize bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true
});

// Connect to MongoDB
connectDB();

// Error handling for bot
bot.on('polling_error', (error) => {
  logger.error('Polling error:', error);
});

bot.on('error', (error) => {
  logger.error('Bot error:', error);
});

// Handle bot commands
bot.onText(/\/start/, async (msg) => {
  try {
    await handleStart(bot, msg);
  } catch (error) {
    logger.error('Error in /start command:', error);
    bot.sendMessage(msg.chat.id, 'Sorry, an error occurred. Please try again later.');
  }
});

bot.onText(/\/premium/, async (msg) => {
  try {
    await handlePremium(bot, msg);
  } catch (error) {
    logger.error('Error in /premium command:', error);
    bot.sendMessage(msg.chat.id, 'Sorry, an error occurred. Please try again later.');
  }
});

bot.onText(/\/stats/, async (msg) => {
  try {
    await handleStats(bot, msg);
  } catch (error) {
    logger.error('Error in /stats command:', error);
    bot.sendMessage(msg.chat.id, 'Sorry, an error occurred. Please try again later.');
  }
});

bot.onText(/\/shorten (.+)/, async (msg, match) => {
  try {
    await handleShorten(bot, msg, match);
  } catch (error) {
    logger.error('Error in /shorten command:', error);
    bot.sendMessage(msg.chat.id, 'Sorry, an error occurred. Please try again later.');
  }
});

// Handle invalid commands
bot.on('message', (msg) => {
  if (msg.text && msg.text.startsWith('/') && !['/start', '/shorten', '/stats', '/premium'].includes(msg.text.split(' ')[0])) {
    bot.sendMessage(msg.chat.id, '❌ Invalid command. Use /start to see available commands.');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  bot.stopPolling();
  mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  bot.stopPolling();
  mongoose.connection.close();
  process.exit(0);
});

logger.info('Bot started successfully!');
