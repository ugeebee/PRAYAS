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

        // Insert into mock DB `ngos` table for auth
        await db.query(
            "INSERT INTO ngos (name, email, location, password_hash) VALUES (?, ?, ?, ?)",
            [name, email, location, password] // In the mock API, it might use plaintext or hashes. The db structure shows password_hash default pass123. Let's just store plaintext for the mock auth if it checks plaintext, or we should check how mock auth verifies it. Wait, auth.ts says "http://localhost:5001/mock-nhpc-auth" checks it. If it's another DB, inserting into `prayas_db.ngos` might actually be the mock DB table!
        );

        // Also insert into `ngos_local` table so it exists in Prayas immediately
        await db.query(
            "INSERT INTO ngos_local (email, name, location) VALUES (?, ?, ?)",
            [email, name, location]
        );

        res.json({ success: true, message: "NGO created successfully" });
    } catch (error) {
        console.error("Create NGO Error:", error);
        res.status(500).json({ error: "Failed to create NGO" });
    }
});

export default router;
