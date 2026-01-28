require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { PORT } = require('./src/config/env');
const logger = require('./src/utils/logger');

(async () => {
  try {
    await connectDB();

    const HOST = process.env.HOST || '0.0.0.0';
    const PORT_NUM = Number(PORT) || Number(process.env.PORT) || 3001;

    const server = app.listen(PORT_NUM, HOST, () => {
      logger.info(`Server listening on http://${HOST}:${PORT_NUM}`);
      console.log(`🚀 Server listening on http://${HOST}:${PORT_NUM}`);
    });

    // Graceful shutdown
    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Rejection:', err);
      server.close(() => process.exit(1));
    });
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully.');
      server.close(() => process.exit(0));
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
