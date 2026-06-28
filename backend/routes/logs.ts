import express from "express";
import { db } from "../db";
import { authenticateJWT } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const router = express.Router();

// 1. Employee: Submit a daily log
router.post("/", authenticateJWT, async (req: AuthRequest, res) => {
    try {
        if (req.user?.role !== 'employee') return res.status(403).json({ error: "Access denied" });
        
        const { applicationId, logDate, activityName, checkInTime, checkOutTime, totalHours } = req.body;
        const employeeId = req.user.id;

        await db.query(`
            INSERT INTO volunteer_logs (application_id, employee_id, log_date, activity_name, check_in_time, check_out_time, total_hours)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [applicationId, employeeId, logDate, activityName, checkInTime, checkOutTime, totalHours]);

        res.json({ success: true, message: "Log submitted successfully" });
    } catch (error) {
        console.error("Submit log error:", error);
        res.status(500).json({ error: "Failed to submit log" });
    }
});

// 2. Fetch logs for a specific application (Used by Employee, NGO, and Dept)
router.get("/application/:applicationId", authenticateJWT, async (req: AuthRequest, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const offset = (page - 1) * limit;

    try {
        const applicationId = req.params.applicationId;
        
        const [countResult]: any = await db.query(
            "SELECT COUNT(*) as total FROM volunteer_logs WHERE application_id = ?",
            [applicationId]
        );
        const total = countResult[0].total;

        const [rows]: any = await db.query(
            "SELECT id, application_id, employee_id, DATE_FORMAT(log_date, '%Y-%m-%d') as log_date, activity_name, check_in_time, check_out_time, total_hours, ngo_status, verified_by_name, verified_by_designation, verified_on, created_at FROM volunteer_logs WHERE application_id = ? ORDER BY log_date ASC LIMIT ? OFFSET ?",
            [applicationId, limit, offset]
        );
        res.json({
            data: rows,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch logs" });
    }
});

// 3. NGO: Get pending applications with logs
router.get("/ngo/pending", authenticateJWT, async (req: AuthRequest, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const offset = (page - 1) * limit;

    try {
        if (req.user?.role !== 'ngo') return res.status(403).json({ error: "Access denied" });

        const [countResult]: any = await db.query(`
            SELECT COUNT(DISTINCT a.id) as total
            FROM volunteer_logs l
            JOIN applications a ON l.application_id = a.id
            JOIN volunteer_postings p ON a.posting_id = p.id
            WHERE p.ngo_id = ? AND l.ngo_status = 'PENDING'
        `, [req.user.id]);
        const total = countResult[0].total;

        // Fetch applications belonging to this NGO that have pending logs
        const [rows]: any = await db.query(`
            SELECT DISTINCT 
                a.id as application_id, 
                a.employee_id,
                a.form_data, 
                p.title as posting_title,
                n.name as ngo_name
            FROM volunteer_logs l
            JOIN applications a ON l.application_id = a.id
            JOIN volunteer_postings p ON a.posting_id = p.id
            JOIN ngos_local n ON p.ngo_id = n.id
            WHERE p.ngo_id = ? AND l.ngo_status = 'PENDING'
            LIMIT ? OFFSET ?
        `, [req.user.id, limit, offset]);
        
        res.json({
            data: rows,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error("NGO pending logs error:", error);
        res.status(500).json({ error: "Failed to fetch" });
    }
});

// 4. NGO: Verify log(s)
router.patch("/ngo/verify", authenticateJWT, async (req: AuthRequest, res) => {
    try {
        if (req.user?.role !== 'ngo') return res.status(403).json({ error: "Access denied" });
        const { logIds, status } = req.body; // logIds is an array of log IDs
        const ngoName = req.user.name;

        if (!logIds || logIds.length === 0) return res.status(400).json({ error: "No logs provided" });

        // Generate placeholders for IN clause
        const placeholders = logIds.map(() => '?').join(',');

        await db.query(`
            UPDATE volunteer_logs 
            SET ngo_status = ?, 
                verified_by_name = ?, 
                verified_by_designation = 'Authorized Person', 
                verified_on = NOW()
            WHERE id IN (${placeholders})
        `, [status, ngoName, ...logIds]);

        res.json({ success: true, message: "Logs verified successfully" });
    } catch (error) {
        console.error("NGO verify log error:", error);
        res.status(500).json({ error: "Failed to verify logs" });
    }
});

export default router;
