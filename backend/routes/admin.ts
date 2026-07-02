import { Router } from "express";
import { db } from "../db";
import { authenticateJWT, AuthRequest } from "../middleware/auth";
import bcrypt from "bcrypt";

const router = Router();

// 1. Get Settings
router.get("/settings", authenticateJWT, async (req: AuthRequest, res) => {
    try {
        const [rows]: any = await db.query("SELECT key_name, key_value FROM settings");
        const settings: any = {};
        rows.forEach((row: any) => {
            settings[row.key_name] = row.key_value;
        });
        res.json(settings);
    } catch (error) {
        console.error("Settings GET Error:", error);
        res.status(500).json({ error: "Failed to fetch settings" });
    }
});

// 2. Update Settings
router.post("/settings", authenticateJWT, async (req: AuthRequest, res) => {
    try {
        if (req.user?.role !== 'dept') return res.status(403).json({ error: "Unauthorized" });

        const { certificate_threshold } = req.body;
        if (certificate_threshold !== undefined) {
            await db.query(
                "INSERT INTO settings (key_name, key_value) VALUES ('certificate_threshold', ?) ON DUPLICATE KEY UPDATE key_value = ?",
                [certificate_threshold.toString(), certificate_threshold.toString()]
            );
        }
        res.json({ success: true, message: "Settings updated" });
    } catch (error) {
        console.error("Settings POST Error:", error);
        res.status(500).json({ error: "Failed to update settings" });
    }
});

// 3. Create NGO
router.post("/ngos", authenticateJWT, async (req: AuthRequest, res) => {
    try {
        if (req.user?.role !== 'dept') return res.status(403).json({ error: "Unauthorized" });

        const { name, email, password, location, representative_name, representative_mobile } = req.body;

        if (!name || !email || !password || !location) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Generate bcrypt hash
        const salt = await bcrypt.genSalt(10);
        const hashedPwd = await bcrypt.hash(password, salt);

        // Insert into ngo_dept for authentication
        await db.query(
            "INSERT INTO ngo_dept (username, email, location, password_hash, representative_name, representative_mobile, role) VALUES (?, ?, ?, ?, ?, ?, 'ngo')",
            [name, email, location, hashedPwd, representative_name, representative_mobile]
        );

        // Also insert into ngos_local for local reference compatibility
        await db.query(
            "INSERT INTO ngos_local (email, name, location) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)",
            [email, name, location]
        );

        // Send SMS to the representative if a mobile number was provided
        if (representative_mobile && representative_mobile.length === 10) {
            const { sendSms } = await import("../utils/sms");
            await sendSms(representative_mobile, `Welcome to Prayas! Your NGO login credentials. Email: ${email}, Password: ${password}`);
        }

        res.json({ success: true, message: "NGO created successfully" });
    } catch (error) {
        console.error("Create NGO Error:", error);
        res.status(500).json({ error: "Failed to create NGO" });
    }
});

export default router;
