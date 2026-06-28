import { Router } from "express";
import { db } from "../db";
import { authenticateJWT, AuthRequest } from "../middleware/auth";

const router = Router();

// 1. POST: Apply for an opportunity
router.post("/:postingId/apply", authenticateJWT, async (req: AuthRequest, res) => {
    const employeeId = req.user.id; // From the JWT
    const postingId = req.params.postingId;
    const { roEmployeeId, roName } = req.body;

    // This is the initial timeline object
    const initialTimeline = [
        {
            step: 1,
            title: "Applied",
            status: "COMPLETED",
            date: new Date().toISOString(),
            note: "Application submitted successfully."
        },
        { step: 2, title: "Manager Approval", status: "PENDING", date: null },
        { step: 3, title: "CSR & SD Review", status: "PENDING", date: null },
        { step: 4, title: "HR/T&HRD Review", status: "PENDING", date: null },
        { step: 5, title: "Forwarded to NGO", status: "PENDING", date: null },
        { step: 6, title: "Waiting Acknowledgement", status: "PENDING", date: null },
        { step: 7, title: "All Set", status: "PENDING", date: null }
    ];

    try {
        // Insert into database, converting the timeline array to a JSON string
        const [result]: any = await db.query(
            `INSERT INTO applications (employee_id, posting_id, current_status, timeline_log) 
       VALUES (?, ?, 'APPLIED', ?)`,
            [employeeId, postingId, JSON.stringify(initialTimeline)]
        );

        const applicationId = result.insertId;

        // Insert into approvals table
        if (roEmployeeId) {
            await db.query(
                `INSERT INTO approvals (application_id, employee_id, ro_employee_id, ro_name, status)
                 VALUES (?, ?, ?, ?, 'PENDING')`,
                [applicationId, employeeId, roEmployeeId, roName]
            );
        }

        res.json({ success: true, message: "Applied successfully" });
    } catch (error) {
        console.error("Apply Error:", error);
        res.status(500).json({ error: "Failed to submit application" });
    }
});

// 2. GET: Fetch My Applications (for the Sidebar)
router.get("/my-applications", authenticateJWT, async (req: AuthRequest, res) => {
    const employeeId = req.user.id;

    try {
        const [rows]: any = await db.query(`
      SELECT 
        a.id as application_id, 
        a.current_status, 
        a.timeline_log,
        p.title as posting_title,
        n.name as ngo_name,
        ap.ro_name as ro_name
      FROM applications a
      JOIN volunteer_postings p ON a.posting_id = p.id
      JOIN ngos_local n ON p.ngo_id = n.id
      LEFT JOIN approvals ap ON ap.application_id = a.id
      WHERE a.employee_id = ?
      ORDER BY a.updated_at DESC
    `, [employeeId]);

        // Parse the JSON string back into an object before sending to frontend
        const formattedRows = rows.map((row: any) => ({
            ...row,
            timeline_log: typeof row.timeline_log === 'string' ? JSON.parse(row.timeline_log) : row.timeline_log
        }));

        res.json(formattedRows);
    } catch (error) {
        console.error("Fetch Applications Error:", error);
        res.status(500).json({ error: "Failed to fetch applications" });
    }
});

// 3. GET: Fetch Pending Approvals for an RO
router.get("/approvals/pending", authenticateJWT, async (req: AuthRequest, res) => {
    const roEmployeeId = req.user.id; 

    try {
        const [rows]: any = await db.query(`
            SELECT 
                ap.id as approval_id,
                ap.application_id,
                ap.status as approval_status,
                a.current_status, 
                p.title as posting_title, 
                p.expected_hours, 
                e.name as applicant_name
            FROM approvals ap
            JOIN applications a ON ap.application_id = a.id
            JOIN volunteer_postings p ON a.posting_id = p.id
            JOIN employees_local e ON ap.employee_id = e.employee_id
            WHERE ap.ro_employee_id = ? AND ap.status = 'PENDING'
        `, [roEmployeeId]);

        res.json(rows);
    } catch (error) {
        console.error("Fetch Approvals Error:", error);
        res.status(500).json({ error: "Failed to fetch approvals" });
    }
});

export default router;