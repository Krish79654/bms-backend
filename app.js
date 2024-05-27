const express = require("express");
const cors = require("cors");
const handleError = require("./middlewares/handleError");

const app = express();
const corsOptions = {
  origin: "http://localhost:5173",
};
app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// Import routes
const authRoute = require("./routes/auth.routes.js");
const hallRoute = require("./routes/hall.routes.js");
const menuRoute = require("./routes/menu.routes.js");
const bookingRoute = require("./routes/booking.routes.js");
const extraServiceRoute = require("./routes/extraService.routes.js");

// Declare routes
app.use("/api/auth", authRoute);
app.use("/api/hall", hallRoute);
app.use("/api/menu", menuRoute);
app.use("/api/booking", bookingRoute);
app.use("/api/extra-service", extraServiceRoute);

app.use(handleError);

module.exports = app;
