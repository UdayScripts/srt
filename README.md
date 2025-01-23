# SrtLink Telegram Bot

A Telegram bot for the SrtLink URL shortener service. This bot allows users to create and manage shortened URLs directly through Telegram.

## Features

- Create shortened URLs
- Track URL click statistics
- Premium user system
- Automatic URL validation
- MongoDB integration

## Requirements

- Node.js 16+
- MongoDB
- PM2 (for production)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/srtlink-telegram-bot.git
cd srtlink-telegram-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
NEXT_PUBLIC_APP_URL=https://your-website.com
MONGODB_URI=your_mongodb_uri
```

## Development

Start the bot in development mode:
```bash
npm run dev
```

## Production Deployment

1. Install PM2 globally:
```bash
npm install -g pm2
```

2. Start the bot:
```bash
pm2 start ecosystem.config.js
```

3. Set up PM2 to start on system boot:
```bash
pm2 startup
pm2 save
```

## Commands

- `/start` - Start the bot and see available commands
- `/shorten <url>` - Create a short URL
- `/stats` - View your URL statistics
- `/premium` - Get information about premium features

## Monitoring

- View logs: `pm2 logs srtlink-bot`
- Monitor status: `pm2 status`
- View metrics: `pm2 monit`

## License

MIT

## Author

Your Name
