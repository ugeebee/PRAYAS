import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import postingRoutes from "./routes/postings";
import applicationRoutes from "./routes/applications";
import logsRoutes from "./routes/logs";
import evaluationRoutes from "./routes/evaluations";
import notificationRoutes from "./routes/notifications";
import adminRoutes from "./routes/admin";

dotenv.config();

const app = express();
const allowedOrigins = [
  "http://localhost:3000",
  "https://staging.ugbhartariya.com",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
import path from "path";

app.use("/api/auth", authRoutes);
app.use("/api/postings", postingRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Main Backend running on http://localhost:${PORT}`);
});