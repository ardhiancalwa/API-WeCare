const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const moment = require("moment-timezone");
const { AppError, errorHandler } = require("./utils/errorHandler");
require("dotenv").config();


const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const hospitalRoutes = require("./routes/hospital.routes");

const app = express();

const allowedOrigins = ["http://localhost:3000"];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE, OPTIONS",
  allowedHeaders: ["Content-Type", "Authorization", "X-Client-Type"],
  credentials: true,
};

app.use(helmet());
app.use(morgan("dev"));
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log("Incoming request:", {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers,
  });
  next();
});

app.use((req, res, next) => {
  req.localTime = moment().tz("Asia/Jakarta").format();
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api", hospitalRoutes);

app.get("/", (req, res) => {
  res.status(404).json({
    status: "gagal",
    statusCode: 404,
    message: "Can't find / on this server!",
    validation: [],
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
