import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import postingRoutes from "./routes/postings";
import applicationRoutes from "./routes/applications";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
import path from "path";

app.use("/api/auth", authRoutes);
app.use("/api/postings", postingRoutes);
app.use("/api/applications", applicationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Main Backend running on http://localhost:${PORT}`);
});