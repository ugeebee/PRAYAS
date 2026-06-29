import express from "express";
import jwt from "jsonwebtoken";
import { db } from "../db";

const router = express.Router();

router.post("/ngo/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Call the Central NHPC Auth API
        const authResponse = await fetch("http://localhost:5001/mock-nhpc-auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, role: "ngo" }),
        });

        const authData: any = await authResponse.json();

        // 2. Check the boolean exactly as specified
        if (authData.is_correct) {

            // 3. Check if they exist in OUR LOCAL database
            let [localNgo]: any = await db.query("SELECT id, name FROM ngos_local WHERE email = ?", [email]);

            let localNgoId;
            let localNgoName;

            // 4. Just-In-Time Provisioning into ngos_local
            if (localNgo.length === 0) {
                // Use the name provided by the auth API payload!
                const provisionedName = authData.name;
                const defaultLocation = "Location not set";

                const [insertResult]: any = await db.query(
                    "INSERT INTO ngos_local (email, name, location) VALUES (?, ?, ?)",
                    [email, provisionedName, defaultLocation]
                );

                localNgoId = insertResult.insertId;
                localNgoName = provisionedName;
            } else {
                // Returning user
                localNgoId = localNgo[0].id;
                localNgoName = localNgo[0].name;
            }

            // 5. Issue the local JWT
            if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not set");
            const token = jwt.sign(
                { id: localNgoId, role: "ngo", name: localNgoName },
                process.env.JWT_SECRET,
                { expiresIn: "30m" }
            );

            return res.json({ success: true, token });
        } else {
            // authData.is_correct was false
            return res.status(401).json({ error: "Invalid credentials from NHPC Auth" });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error during authentication" });
    }
});

router.post("/employee/login", async (req, res) => {
    const { employeeId, password } = req.body;

    try {
        // 1. Pass employeeId instead of email
        const authResponse = await fetch("http://localhost:5001/mock-nhpc-auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ employeeId, password, role: "employee" }),
        });

        const authData: any = await authResponse.json();

        if (authData.is_correct) {

            // 2. Check local DB by employee_id
            let [localEmployee]: any = await db.query(
                "SELECT id, employee_id, name FROM employees_local WHERE employee_id = ?",
                [employeeId]
            );

            let localEmployeeId;
            let localEmployeeName;

            // 3. JIT Provisioning with employee_id
            if (localEmployee.length === 0) {
                const provisionedName = authData.name || "New Employee";

                await db.query(
                    "INSERT INTO employees_local (employee_id, name) VALUES (?, ?)",
                    [employeeId, provisionedName]
                );

                localEmployeeId = employeeId;
                localEmployeeName = provisionedName;
            } else {
                localEmployeeId = localEmployee[0].employee_id;
                localEmployeeName = localEmployee[0].name;
            }

            // 4. Issue token
            if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not set");
            const token = jwt.sign(
                { id: localEmployeeId, role: "employee", name: localEmployeeName },
                process.env.JWT_SECRET,
                { expiresIn: "30m" }
            );

            return res.json({ success: true, token });
        } else {
            return res.status(401).json({ error: "Invalid credentials from NHPC Auth" });
        }
    } catch (error) {
        console.error("🔴 EMPLOYEE LOGIN CRASH:", error);
        res.status(500).json({ error: "Internal server error during authentication" });
    }
});

// Department / HR Login (JIT Provisioning)
router.post("/dept/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Call the Central NHPC Auth API
        const authResponse = await fetch("http://localhost:5001/mock-nhpc-auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, role: "dept" }),
        });

        const authData: any = await authResponse.json();

        if (authData.is_correct) {
            // 2. Check if this department exists in our local Prayas database
            let [localRows]: any = await db.query(
                "SELECT * FROM dept_local WHERE dept_id = ?",
                [authData.id]
            );

            let localDeptId;

            // 3. JIT (Just-In-Time) Provisioning
            if (localRows.length === 0) {
                // First time logging into Prayas, create their local profile without a password
                const [insertResult]: any = await db.query(
                    "INSERT INTO dept_local (dept_id, dept_name) VALUES (?, ?)",
                    [authData.id, authData.name]
                );
                localDeptId = insertResult.insertId;
            } else {
                // They already exist in Prayas
                localDeptId = localRows[0].id;
            }

            // 4. Generate the JWT using the secure, password-less local data
            if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not set");
            const token = jwt.sign(
                {
                    id: localDeptId,          // Prayas Local Database ID
                    dept_id: authData.id,     // NHPC Reference ID
                    name: authData.name,
                    role: "dept"
                },
                process.env.JWT_SECRET,
                { expiresIn: "30m" }
            );

            return res.json({ success: true, token });
        } else {
            return res.status(401).json({ error: "Invalid credentials from NHPC Auth" });
        }
    } catch (error) {
        console.error("Dept Login Error:", error);
        res.status(500).json({ error: "Login failed" });
    }
});

// Proxy to Mock API for password verification during application submission
router.post("/verify-password", async (req, res) => {
    const { employeeId, password, role } = req.body;
    try {
        const authResponse = await fetch("http://localhost:5001/mock-nhpc-auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ employeeId, password, role: role || "employee" }),
        });
        const authData: any = await authResponse.json();
        res.json(authData);
    } catch (error) {
        console.error("Verify Password Error:", error);
        res.status(500).json({ error: "Failed to verify password" });
    }
});

export default router;