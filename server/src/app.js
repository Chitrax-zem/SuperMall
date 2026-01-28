const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

// Routes
const adminRoutes = require("./routes/adminRoutes");
const shopRoutes = require("./routes/shopRoutes");
const productRoutes = require("./routes/productRoutes");
const offerRoutes = require("./routes/offerRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const floorRoutes = require("./routes/floorRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

// Error handler
const errorHandler = require("./middleware/errorHandler");

const app = express();

/* ======================================================
   GLOBAL MIDDLEWARE
====================================================== */
app.use(helmet());

// 🔥 FIXED CORS (Vercel + Render compatible)
app.use(
  cors({
    origin: true, // allow all origins
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

/* ======================================================
   DISABLE CACHE IN DEVELOPMENT
====================================================== */
if (process.env.NODE_ENV !== "production") {
  app.set("etag", false);
  app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
}

/* ======================================================
   ROOT & HEALTH ROUTES
====================================================== */
app.get("/", (req, res) => {
  res.status(200).send("✅ SuperMall Backend is running");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    message: "Server is healthy",
  });
});

/* ======================================================
   API ROUTES
====================================================== */
app.use("/api/admin", adminRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/products", productRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/floors", floorRoutes);
app.use("/api/uploads", uploadRoutes);

/* ======================================================
   STATIC FILES
====================================================== */
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

/* ======================================================
   JSON PARSE ERROR HANDLER
====================================================== */
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload",
      error: err.message,
    });
  }
  next(err);
});

/* ======================================================
   GLOBAL ERROR HANDLER
====================================================== */
app.use(errorHandler);

module.exports = app;
