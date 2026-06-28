import { Router } from "express";
import { db } from "../db";
import { authenticateJWT, AuthRequest } from "../middleware/auth";
import multer from "multer";
import path from "path";

const router = Router();

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `medical_cert_${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

// 1. POST: Apply for an opportunity
router.post("/:postingId/apply", authenticateJWT, async (req: AuthRequest, res) => {
    const employeeId = req.user.id; // From the JWT
    const postingId = req.params.postingId;
    const { roEmployeeId, roName, formData } = req.body;

    // This is the initial timeline object
    const initialTimeline = [
        {
            step: 1,
            title: "Applied",
            status: "COMPLETED",
            date: new Date().toISOString(),
            note: "Application submitted successfully."
        },
        { step: 2, title: "R.O. Approval", status: "PENDING", date: null },
        { step: 3, title: "CSR & SD Review", status: "PENDING", date: null },
        { step: 4, title: "HR/T&HRD Review", status: "PENDING", date: null },
        { step: 5, title: "Forwarded to NGO", status: "PENDING", date: null },
        { step: 6, title: "Waiting Acknowledgement", status: "PENDING", date: null },
        { step: 7, title: "All Set", status: "PENDING", date: null }
    ];

    try {
        // Insert into database, converting the timeline array to a JSON string
        const [result]: any = await db.query(
            `INSERT INTO applications (employee_id, posting_id, current_status, timeline_log, form_data) 
       VALUES (?, ?, 'APPLIED', ?, ?)`,
            [employeeId, postingId, JSON.stringify(initialTimeline), formData ? JSON.stringify(formData) : null]
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
                a.employee_id,
                a.medical_certificate_path,
                a.form_data,
                p.title as posting_title, 
                p.expected_hours, 
                p.location,
                p.nature_of_work,
                e.name as employee_name,
                n.name as ngo_name
            FROM approvals ap
            JOIN applications a ON ap.application_id = a.id
            JOIN volunteer_postings p ON a.posting_id = p.id
            JOIN employees_local e ON ap.employee_id = e.employee_id
            JOIN ngos_local n ON p.ngo_id = n.id
            WHERE ap.ro_employee_id = ? AND ap.status = 'PENDING'
        `, [roEmployeeId]);

        res.json(rows);
    } catch (error) {
        console.error("Fetch Approvals Error:", error);
        res.status(500).json({ error: "Failed to fetch approvals" });
    }
});

// 4. PATCH: Manager Review Application
router.patch("/:applicationId/review", authenticateJWT, async (req: AuthRequest, res) => {
    const roEmployeeId = req.user.id;
    const applicationId = req.params.applicationId;
    const { action, comments, managerName, managerDesignation } = req.body;

    try {
        // Find the approval record
        const [approvals]: any = await db.query(
            "SELECT * FROM approvals WHERE application_id = ? AND ro_employee_id = ?",
            [applicationId, roEmployeeId]
        );

        if (approvals.length === 0) {
            return res.status(404).json({ error: "Approval request not found or unauthorized" });
        }

        const approval = approvals[0];

        // Update approval status
        await db.query(
            "UPDATE approvals SET status = ? WHERE id = ?",
            [action, approval.id]
        );

        // Fetch current application
        const [applications]: any = await db.query(
            "SELECT timeline_log FROM applications WHERE id = ?",
            [applicationId]
        );

        if (applications.length > 0) {
            let timeline = typeof applications[0].timeline_log === 'string' 
                ? JSON.parse(applications[0].timeline_log) 
                : applications[0].timeline_log;

            // Find step 2 (R.O. Approval)
            const step2Index = timeline.findIndex((s: any) => s.step === 2);
            if (step2Index !== -1) {
                timeline[step2Index].status = action === 'APPROVED' ? 'COMPLETED' : (action === 'REJECTED' ? 'REJECTED' : 'PENDING');
                timeline[step2Index].date = new Date().toISOString();
                timeline[step2Index].note = `RO Review: ${action}. Remarks: ${comments || 'None'}`;
            }

            // Update application current status
            let newAppStatus = action;
            if (action === 'APPROVED') newAppStatus = 'RO_APPROVED';

            await db.query(
                "UPDATE applications SET current_status = ?, timeline_log = ? WHERE id = ?",
                [newAppStatus, JSON.stringify(timeline), applicationId]
            );
        }

        res.json({ success: true, message: "Review submitted successfully" });
    } catch (error) {
        console.error("Review Error:", error);
        res.status(500).json({ error: "Failed to submit review" });
    }
});

// 5. PATCH: Upload Medical Certificate
router.patch("/:applicationId/upload-medical", authenticateJWT, upload.single('certificate'), async (req: AuthRequest, res: any) => {
    const applicationId = req.params.applicationId;
    const employeeId = req.user.id;
    
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    const certificateUrl = `/uploads/${req.file.filename}`;

    try {
        // Fetch current application
        const [applications]: any = await db.query(
            "SELECT timeline_log FROM applications WHERE id = ? AND employee_id = ?",
            [applicationId, employeeId]
        );

        if (applications.length === 0) {
            return res.status(404).json({ error: "Application not found" });
        }

        let timeline = typeof applications[0].timeline_log === 'string' 
            ? JSON.parse(applications[0].timeline_log) 
            : applications[0].timeline_log;

        // Find step 2 (R.O. Approval)
        const step2Index = timeline.findIndex((s: any) => s.step === 2);
        if (step2Index !== -1) {
            timeline[step2Index].status = 'PENDING';
            timeline[step2Index].date = new Date().toISOString();
            timeline[step2Index].note = 'Medical certificate uploaded. Awaiting R.O. Approval.';
        }

        // Update application
        await db.query(
            "UPDATE applications SET current_status = 'APPLIED', medical_certificate_path = ?, timeline_log = ? WHERE id = ?",
            [certificateUrl, JSON.stringify(timeline), applicationId]
        );

        // Update approval to PENDING so RO sees it again
        await db.query(
            "UPDATE approvals SET status = 'PENDING' WHERE application_id = ?",
            [applicationId]
        );

        res.json({ success: true, message: "Medical certificate uploaded successfully" });
    } catch (error) {
        console.error("Upload Medical Error:", error);
        res.status(500).json({ error: "Failed to upload medical certificate" });
    }
});

// 6. GET: Fetch Medical Certificate (Authorized)
router.get("/:applicationId/medical-certificate", authenticateJWT, async (req: AuthRequest, res: any) => {
    const applicationId = req.params.applicationId;
    const userId = req.user.id;

    try {
        // Find application
        const [applications]: any = await db.query(
            "SELECT employee_id, medical_certificate_path FROM applications WHERE id = ?",
            [applicationId]
        );

        if (applications.length === 0) {
            return res.status(404).json({ error: "Application not found" });
        }

        const app = applications[0];

        // Check if the user is the applicant
        let isAuthorized = app.employee_id === userId;

        // If not applicant, check if the user is the RO assigned to this application
        if (!isAuthorized) {
            const [approvals]: any = await db.query(
                "SELECT id FROM approvals WHERE application_id = ? AND ro_employee_id = ?",
                [applicationId, userId]
            );
            if (approvals.length > 0) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({ error: "Unauthorized to view this certificate" });
        }

        if (!app.medical_certificate_path) {
            return res.status(404).json({ error: "No medical certificate found for this application" });
        }

        // Send the file
        const filePath = path.join(process.cwd(), app.medical_certificate_path.replace('/uploads', 'uploads'));
        res.sendFile(filePath);
    } catch (error) {
        console.error("Fetch Medical Error:", error);
        res.status(500).json({ error: "Failed to fetch medical certificate" });
    }
});

export default router;