import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { db } from "../db";

const router = express.Router();

router.post("/ngo/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Query ngo_dept for the NGO user
        const [localRows]: any = await db.query(
            "SELECT * FROM ngo_dept WHERE email = ? AND role = 'ngo'",
            [email]
        );

        if (localRows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = localRows[0];
        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await db.query(
            "UPDATE ngo_dept SET otp = ?, ttl = DATE_ADD(NOW(), INTERVAL 30 MINUTE) WHERE id = ?",
            [otp, user.id]
        );

        const { sendEmail } = await import("../utils/email");
        await sendEmail(email, "Your Prayas NGO Login OTP", `Your OTP is: ${otp}. It will expire in 30 minutes.`);

        return res.json({ success: true, otp_status: false, email });
    } catch (error) {
        res.status(500).json({ error: "Internal server error during authentication" });
    }
});

router.post("/ngo/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    try {
        const [localRows]: any = await db.query("SELECT * FROM ngo_dept WHERE email = ? AND role = 'ngo'", [email]);
        if (localRows.length === 0) return res.status(404).json({ error: "NGO not found" });

        const user = localRows[0];
        if (user.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
        if (new Date() > new Date(user.ttl)) return res.status(400).json({ error: "otp expired resend", expired: true });

        let [localNgo]: any = await db.query("SELECT id, name FROM ngos_local WHERE email = ?", [email]);
        let localNgoId = localNgo.length > 0 ? localNgo[0].id : user.id;
        let localNgoName = localNgo.length > 0 ? localNgo[0].name : user.username;

        if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not set");
        const token = jwt.sign({ id: localNgoId, role: "ngo", name: localNgoName }, process.env.JWT_SECRET, { expiresIn: "1h" });

        return res.json({ success: true, token });
    } catch (error) {
        res.status(500).json({ error: "Internal server error during authentication" });
    }
});

//code-review done
router.post("/employee/login", async (req, res) => {
    const { employeeId, password } = req.body;

    try {
        const authResponse = await fetch("https://apihub.nhpc.in:8443/erp-auth-prayas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: employeeId, password }),
        });

        const authData: any = await authResponse.json();

        if (authData.success) {

            const employeeDetails = authData.employeeDetails;
            if (!employeeDetails ||
                !employeeDetails.NAME_ENG ||
                !employeeDetails.DESIG_ENG ||
                !employeeDetails.DEPT_ENG ||
                !employeeDetails.EML_erp ||
                !employeeDetails.MOB_erp ||
                !employeeDetails.Sup_emp ||
                !employeeDetails.Sup_emp_mobile ||
                !employeeDetails.Sup_emp_email) {
                return res.status(400).json({ error: "Incomplete employee details received from NHPC Auth" });
            }

            const provisionedName = employeeDetails.NAME_ENG;
            const designation = employeeDetails.DESIG_ENG;
            const department = employeeDetails.DEPT_ENG;
            const email = employeeDetails.EML_erp;
            const mobile = employeeDetails.MOB_erp;
            const reporting_officer = employeeDetails.Sup_emp;
            const reporting_officer_mobile = employeeDetails.Sup_emp_mobile;
            const reporting_officer_email = employeeDetails.Sup_emp_email;

            let [localEmployee]: any = await db.query(
                "SELECT id, employee_id, name FROM employees_local WHERE employee_id = ?",
                [employeeId]
            );

            if (localEmployee.length === 0) {
                await db.query(
                    `INSERT INTO employees_local 
                    (employee_id, name, designation, department, email, mobile, reporting_officer, reporting_officer_mobile, reporting_officer_email) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [employeeId, provisionedName, designation, department, email, mobile, reporting_officer, reporting_officer_mobile, reporting_officer_email]
                );
            } else {
                await db.query(
                    `UPDATE employees_local 
                    SET name = ?, designation = ?, department = ?, email = ?, mobile = ?, reporting_officer = ?, reporting_officer_mobile = ?, reporting_officer_email = ?
                    WHERE employee_id = ?`,
                    [provisionedName, designation, department, email, mobile, reporting_officer, reporting_officer_mobile, reporting_officer_email, employeeId]
                );
            }

            // Generate OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            // TTL 30 minutes
            await db.query(
                `UPDATE employees_local SET otp = ?, ttl = DATE_ADD(NOW(), INTERVAL 30 MINUTE) WHERE employee_id = ?`,
                [otp, employeeId]
            );

            // Send SMS (using conversational text to avoid DLT/carrier spam blocks for standard SIMs in India)
            const { sendSms } = await import("../utils/sms");
            await sendSms(mobile, `Hey there, your login code is ${otp}. It expires in 30 mins.`);

            return res.json({
                success: true,
                otp_status: false,
                mobile: mobile,
                employeeId: employeeId,
                name: provisionedName
            });
        } else {
            return res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (error) {
        console.error("EMPLOYEE LOGIN CRASH:", error);
        res.status(500).json({ error: "Internal server error during authentication" });
    }
});

router.post("/employee/verify-otp", async (req, res) => {
    const { employeeId, otp, clientTime } = req.body;
    try {
        let [localEmployee]: any = await db.query(
            "SELECT * FROM employees_local WHERE employee_id = ?",
            [employeeId]
        );

        if (localEmployee.length === 0) {
            return res.status(404).json({ error: "Employee not found" });
        }

        const employee = localEmployee[0];

        if (employee.otp !== otp) {
            return res.status(400).json({ error: "Invalid OTP" });
        }

        const now = new Date();
        const ttl = new Date(employee.ttl);

        if (now > ttl) {
            return res.status(400).json({ error: "otp expired resend", expired: true });
        }

        // OTP is correct and within TTL, issue token
        if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not set");
        const token = jwt.sign(
            {
                id: employee.employee_id,
                role: "employee",
                name: employee.name,
                designation: employee.designation,
                department: employee.department,
                email: employee.email,
                mobile: employee.mobile
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.json({ success: true, token });
    } catch (error) {
        console.error("OTP VERIFY ERROR:", error);
        res.status(500).json({ error: "Internal server error during OTP verification" });
    }
});

// Department / HR Login (JIT Provisioning)
router.post("/dept/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Query ngo_dept for the department user
        const [localRows]: any = await db.query(
            "SELECT * FROM ngo_dept WHERE email = ? AND role = 'dept'",
            [email]
        );

        if (localRows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = localRows[0];
        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await db.query(
            "UPDATE ngo_dept SET otp = ?, ttl = DATE_ADD(NOW(), INTERVAL 30 MINUTE) WHERE id = ?",
            [otp, user.id]
        );

        const { sendEmail } = await import("../utils/email");
        await sendEmail(email, "Your Prayas Department Login OTP", `Your OTP is: ${otp}. It will expire in 30 minutes.`);

        return res.json({ success: true, otp_status: false, email });
    } catch (error) {
        console.error("Dept Login Error:", error);
        res.status(500).json({ error: "Login failed" });
    }
});

router.post("/dept/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    try {
        const [localRows]: any = await db.query("SELECT * FROM ngo_dept WHERE email = ? AND role = 'dept'", [email]);
        if (localRows.length === 0) return res.status(404).json({ error: "Department not found" });

        const user = localRows[0];
        if (user.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
        if (new Date() > new Date(user.ttl)) return res.status(400).json({ error: "otp expired resend", expired: true });

        if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not set");
        const token = jwt.sign({ id: user.id, dept_id: user.id, name: user.username, role: "dept" }, process.env.JWT_SECRET, { expiresIn: "8h" });

        return res.json({ success: true, token });
    } catch (error) {
        console.error("Dept Login Error:", error);
        res.status(500).json({ error: "Login failed" });
    }
});

export default router;