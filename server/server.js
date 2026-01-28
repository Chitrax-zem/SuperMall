require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");
const { PORT } = require("./src/config/env");
const logger = require("./src/utils/logger");

/* ===========================
   DATABASE CONNECTION
=========================== */
connectDB();

/* ===========================
   SERVER START
=========================== */
const port = PORT || 5000;

const server = app.listen(port, "0.0.0.0", () => {
  logger.info(`Server running on port ${port}`);
  console.log(`🚀 Server running on port ${port}`);
});

/* ===========================
   PROCESS ERROR HANDLING
=========================== */
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Promise Rejection", err);
  console.error(err);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  logger.warn("SIGTERM received. Shutting down gracefully.");
  server.close(() => {
    process.exit(0);
  });
});
