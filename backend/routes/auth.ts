import express from "express";
import jwt from "jsonwebtoken";
import { db } from "../db";

const router = express.Router();

router.post("/ngo/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const authResponse = await fetch("http://localhost:5001/mock-nhpc-auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uname: email, password: password }),
        });

        const authData = await authResponse.json();

        if (authData.is_correct) {
            const [ngo]: any = await db.query("SELECT id, name FROM ngos WHERE email = ?", [email]);

            if (ngo.length > 0) {
                const token = jwt.sign(
                    { id: ngo[0].id, role: "ngo", name: ngo[0].name },
                    process.env.JWT_SECRET || "prayas_super_secret_key",
                    { expiresIn: "8h" }
                );
                return res.json({ success: true, token });
            }
        }

        return res.status(401).json({ success: false, message: "Invalid credentials" });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

export default router;