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
// 7. GET: Fetch ALL Applications (For Dept/Admin View with 25-item Pagination)
router.get("/all", authenticateJWT, async (req: AuthRequest, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const offset = (page - 1) * limit;
    const search = (req.query.search as string || "").trim();

    try {
        const searchWhere = search
            ? `WHERE a.employee_id LIKE ? OR n.name LIKE ?`
            : "";
        const searchParams = search ? [`%${search}%`, `%${search}%`] : [];

        const [countResult]: any = await db.query(
            `SELECT COUNT(*) as total 
             FROM applications a
             JOIN volunteer_postings p ON a.posting_id = p.id
             JOIN ngos_local n ON p.ngo_id = n.id
             ${searchWhere}`,
            searchParams
        );
        const total = countResult[0].total;

        const [rows]: any = await db.query(`
            SELECT 
                a.id as application_id, 
                a.employee_id,
                a.current_status, 
                a.timeline_log,
                a.medical_certificate_path,
                a.form_data, 
                a.completion_data,
                p.title as posting_title,
                p.location as posting_location,
                p.expected_hours,
                p.nature_of_work,
                p.technical_skills,
                n.name as ngo_name,
                ap.ro_name,
                ap.ro_employee_id
            FROM applications a
            JOIN volunteer_postings p ON a.posting_id = p.id
            JOIN ngos_local n ON p.ngo_id = n.id
            LEFT JOIN approvals ap ON a.id = ap.application_id
            ${searchWhere}
            ORDER BY a.updated_at DESC
            LIMIT ? OFFSET ?
        `, [...searchParams, limit, offset]);

        const formattedRows = rows.map((row: any) => ({
            ...row,
            timeline_log: typeof row.timeline_log === 'string'
                ? JSON.parse(row.timeline_log)
                : row.timeline_log,
            // Parse the form_data so the frontend can read it!
            form_data: typeof row.form_data === 'string' && row.form_data
                ? JSON.parse(row.form_data)
                : row.form_data,
            completion_data: typeof row.completion_data === 'string' && row.completion_data
                ? JSON.parse(row.completion_data)
                : row.completion_data
        }));

        res.json({
            data: formattedRows,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error("Fetch All Applications Error:", error);
        res.status(500).json({ error: "Failed to fetch all applications" });
    }
});
// 1. POST: Apply for an opportunity
router.post("/:postingId/apply", authenticateJWT, async (req: AuthRequest, res: any) => {
    const employeeId = req.user.id; // From the JWT
    const postingId = req.params.postingId;
    const { roEmployeeId, roName, formData } = req.body;

    if (formData?.contact && !/^\d{10}$/.test(formData.contact)) {
        return res.status(400).json({ error: "Contact number must be exactly 10 digits" });
    }

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
        { step: 3, title: "Forwarded to CSR & SD", status: "PENDING", date: null },
        { step: 4, title: "Forwarded to HR/T&HRD division", status: "PENDING", date: null },
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
        a.employee_id,
        a.current_status, 
        a.timeline_log,
        a.form_data,
        a.completion_data,
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
            timeline_log: typeof row.timeline_log === 'string' ? JSON.parse(row.timeline_log) : row.timeline_log,
            form_data: typeof row.form_data === 'string' ? JSON.parse(row.form_data) : row.form_data,
            completion_data: typeof row.completion_data === 'string' ? JSON.parse(row.completion_data) : row.completion_data
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

// 3.5 GET: Fetch Pending Completion Reports for an RO
router.get("/approvals/completion-pending", authenticateJWT, async (req: AuthRequest, res) => {
    const roEmployeeId = req.user.id;

    try {
        const [rows]: any = await db.query(`
            SELECT 
                ap.id as approval_id,
                ap.application_id,
                a.current_status, 
                a.employee_id,
                a.completion_data,
                p.title as posting_title, 
                e.name as employee_name
            FROM approvals ap
            JOIN applications a ON ap.application_id = a.id
            JOIN volunteer_postings p ON a.posting_id = p.id
            JOIN employees_local e ON ap.employee_id = e.employee_id
            WHERE ap.ro_employee_id = ? AND a.current_status = 'PENDING_RO_COMPLETION'
        `, [roEmployeeId]);

        // Parse JSON
        const formattedRows = rows.map((row: any) => ({
            ...row,
            completion_data: typeof row.completion_data === 'string' ? JSON.parse(row.completion_data) : row.completion_data
        }));

        res.json(formattedRows);
    } catch (error) {
        console.error("Fetch Completion Approvals Error:", error);
        res.status(500).json({ error: "Failed to fetch completion approvals" });
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
                timeline[step2Index].ro_name = managerName;
                timeline[step2Index].ro_designation = managerDesignation;
            }

            if (action === 'APPROVED') {
                [3, 4, 5].forEach(stepNum => {
                    const idx = timeline.findIndex((s: any) => s.step === stepNum);
                    if (idx !== -1) {
                        timeline[idx].status = 'COMPLETED';
                        timeline[idx].date = new Date().toISOString();
                        timeline[idx].note = "System: Automatically forwarded.";
                    }
                });
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

        // Check if the user is the applicant, OR if they are a Department Admin
        let isAuthorized = app.employee_id === userId || req.user.role === 'dept';

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

// 7. GET: Fetch applications for NGO (Paginated)
router.get("/ngo/applications", authenticateJWT, async (req: AuthRequest, res) => {
    try {
        if (req.user?.role !== 'ngo') return res.status(403).json({ error: "Access denied" });
        
        const type = req.query.type as string; // 'pending' or 'history'
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 15;
        const offset = (page - 1) * limit;

        const statusCondition = type === 'history' ? "a.current_status != 'RO_APPROVED'" : "a.current_status = 'RO_APPROVED'";

        const countQuery = `
            SELECT COUNT(*) as total
            FROM applications a
            JOIN volunteer_postings p ON a.posting_id = p.id
            WHERE p.ngo_id = ? AND ${statusCondition}
        `;
        const [countResult]: any = await db.query(countQuery, [req.user.id]);
        const total = countResult[0].total;

        const dataQuery = `
            SELECT 
                a.id as application_id, 
                a.employee_id,
                a.current_status, 
                a.timeline_log,
                a.medical_certificate_path,
                a.form_data, 
                a.completion_data,
                p.title as posting_title,
                p.location as posting_location,
                p.expected_hours,
                p.nature_of_work,
                p.technical_skills,
                n.name as ngo_name
            FROM applications a
            JOIN volunteer_postings p ON a.posting_id = p.id
            JOIN ngos_local n ON p.ngo_id = n.id
            WHERE p.ngo_id = ? AND ${statusCondition}
            ORDER BY a.created_at DESC
            LIMIT ? OFFSET ?
        `;
        const [rows]: any = await db.query(dataQuery, [req.user.id, limit, offset]);
        
        res.json({
            data: rows,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("NGO applications error:", error);
        res.status(500).json({ error: "Failed to fetch" });
    }
});

// 8. PATCH: NGO Review Application
router.patch("/:applicationId/ngo-review", authenticateJWT, async (req: AuthRequest, res) => {
    try {
        if (req.user?.role !== 'ngo') return res.status(403).json({ error: "Access denied" });
        const { action, comment } = req.body; // 'YES' or 'NO'
        const applicationId = req.params.applicationId;

        const [applications]: any = await db.query("SELECT timeline_log FROM applications WHERE id = ?", [applicationId]);
        if (applications.length > 0) {
            let timeline = typeof applications[0].timeline_log === 'string' ? JSON.parse(applications[0].timeline_log) : applications[0].timeline_log;
            
            const step6Index = timeline.findIndex((s: any) => s.step === 6);
            if (step6Index !== -1) {
                timeline[step6Index].status = action === 'YES' ? 'COMPLETED' : 'REJECTED';
                timeline[step6Index].date = new Date().toISOString();
                timeline[step6Index].note = action === 'YES' ? "NGO Accepted the volunteer" : `NGO Rejected the volunteer. Reason: ${comment || 'None'}`;
            }
            if (action === 'YES') {
                const step7Index = timeline.findIndex((s: any) => s.step === 7);
                if (step7Index !== -1) {
                    timeline[step7Index].status = 'COMPLETED';
                    timeline[step7Index].date = new Date().toISOString();
                    timeline[step7Index].note = "Application process complete.";
                }

                // Decrement the required volunteers for this posting
                await db.query("UPDATE volunteer_postings SET volunteers_needed = GREATEST(volunteers_needed - 1, 0) WHERE id = (SELECT posting_id FROM applications WHERE id = ?)", [applicationId]);
                
                // Automatically close posting if volunteers_needed reaches 0
                await db.query("UPDATE volunteer_postings SET status = 'CLOSED' WHERE id = (SELECT posting_id FROM applications WHERE id = ?) AND volunteers_needed = 0", [applicationId]);
            }
            const newAppStatus = action === 'YES' ? 'Acknowledged and all set' : 'NGO rejected';
            await db.query("UPDATE applications SET current_status = ?, timeline_log = ? WHERE id = ?", [newAppStatus, JSON.stringify(timeline), applicationId]);
        }
        res.json({ success: true });
    } catch (error) {
        console.error("NGO review error:", error);
        res.status(500).json({ error: "Failed" });
    }
});
// 9. GET: Fetch active volunteers for an NGO
router.get("/ngo/active-volunteers", authenticateJWT, async (req: AuthRequest, res) => {
    try {
        if (req.user?.role !== 'ngo') return res.status(403).json({ error: "Access denied" });
        const ngoId = req.user.id;

        const [rows]: any = await db.query(`
            SELECT 
                a.id as application_id,
                a.employee_id,
                a.form_data,
                p.title as posting_title,
                p.location as posting_location,
                p.expected_hours
            FROM applications a
            JOIN volunteer_postings p ON a.posting_id = p.id
            WHERE p.ngo_id = ? AND a.current_status = 'Acknowledged and all set'
            ORDER BY a.updated_at DESC
        `, [ngoId]);
        
        res.json(rows);
    } catch (error) {
        console.error("Fetch Active Volunteers Error:", error);
        res.status(500).json({ error: "Failed to fetch active volunteers" });
    }
});

// 10. PATCH: Terminate Application Early
router.patch("/:applicationId/terminate", authenticateJWT, async (req: AuthRequest, res) => {
    try {
        const { reason } = req.body;
        const applicationId = req.params.applicationId;
        const role = req.user?.role; // 'employee' or 'ngo'

        if (!role) return res.status(403).json({ error: "Access denied" });

        const [applications]: any = await db.query("SELECT timeline_log, current_status, form_data FROM applications WHERE id = ?", [applicationId]);
        if (applications.length > 0) {
            const app = applications[0];
            
            // Only active applications can be terminated
            if (app.current_status !== 'Acknowledged and all set') {
                return res.status(400).json({ error: "Application is not active." });
            }

            let timeline = typeof app.timeline_log === 'string' ? JSON.parse(app.timeline_log) : app.timeline_log;
            
            // Add termination step
            timeline.push({
                step: 8,
                title: role === 'employee' ? "Terminated by Volunteer" : "Terminated by NGO",
                status: "TERMINATED",
                date: new Date().toISOString(),
                note: `Reason: ${reason || 'None provided'}`
            });

            // Update form_data to free up calendar
            let formData = typeof app.form_data === 'string' ? JSON.parse(app.form_data) : (app.form_data || {});
            formData.toDate = new Date().toISOString().split('T')[0];

            const newAppStatus = role === 'employee' ? 'TERMINATED_BY_EMPLOYEE' : 'TERMINATED_BY_NGO';
            
            await db.query("UPDATE applications SET current_status = ?, timeline_log = ?, form_data = ? WHERE id = ?", [newAppStatus, JSON.stringify(timeline), JSON.stringify(formData), applicationId]);
            res.json({ success: true, message: "Application terminated successfully." });
        } else {
            res.status(404).json({ error: "Application not found" });
        }
    } catch (error) {
        console.error("Termination error:", error);
        res.status(500).json({ error: "Failed to terminate application" });
    }
});

// 11. PATCH: Submit Form-C (Section A) - Employee Completion
router.patch("/:applicationId/completion/employee", authenticateJWT, async (req: AuthRequest, res) => {
    try {
        if (req.user?.role !== 'employee') return res.status(403).json({ error: "Access denied" });
        const { formData } = req.body;
        const applicationId = req.params.applicationId;

        const [applications]: any = await db.query("SELECT completion_data, timeline_log FROM applications WHERE id = ?", [applicationId]);
        if (applications.length > 0) {
            const app = applications[0];
            let completionData = typeof app.completion_data === 'string' ? JSON.parse(app.completion_data) : (app.completion_data || {});
            
            // Add employee section of Form C
            completionData.formC = {
                ...completionData.formC,
                sectionA: {
                    ...formData,
                    submittedAt: new Date().toISOString(),
                    signature: req.user.name
                }
            };

            let timeline = typeof app.timeline_log === 'string' ? JSON.parse(app.timeline_log) : app.timeline_log;
            timeline.push({
                step: 9,
                title: "Form-C Section A Submitted",
                status: "COMPLETED",
                date: new Date().toISOString(),
                note: "Employee has submitted their volunteering completion report."
            });

            await db.query(
                "UPDATE applications SET completion_data = ?, timeline_log = ?, current_status = 'PENDING_RO_COMPLETION' WHERE id = ?", 
                [JSON.stringify(completionData), JSON.stringify(timeline), applicationId]
            );
            res.json({ success: true });
        } else {
            res.status(404).json({ error: "Application not found" });
        }
    } catch (error) {
        console.error("Employee completion error:", error);
        res.status(500).json({ error: "Failed to submit completion report" });
    }
});

// 12. PATCH: Submit Form-D - NGO Completion
router.patch("/:applicationId/completion/ngo", authenticateJWT, async (req: AuthRequest, res) => {
    try {
        if (req.user?.role !== 'ngo') return res.status(403).json({ error: "Access denied" });
        const { formData } = req.body;
        const applicationId = req.params.applicationId;

        const [applications]: any = await db.query("SELECT completion_data, timeline_log FROM applications WHERE id = ?", [applicationId]);
        if (applications.length > 0) {
            const app = applications[0];
            let completionData = typeof app.completion_data === 'string' ? JSON.parse(app.completion_data) : (app.completion_data || {});
            
            // Add Form D from NGO
            completionData.formD = {
                ...formData,
                submittedAt: new Date().toISOString(),
                signature: req.user.name
            };

            let timeline = typeof app.timeline_log === 'string' ? JSON.parse(app.timeline_log) : app.timeline_log;
            timeline.push({
                step: 10,
                title: "Form-D Submitted",
                status: "COMPLETED",
                date: new Date().toISOString(),
                note: "NGO has submitted partner organization feedback."
            });

            await db.query(
                "UPDATE applications SET completion_data = ?, timeline_log = ? WHERE id = ?", 
                [JSON.stringify(completionData), JSON.stringify(timeline), applicationId]
            );
            res.json({ success: true });
        } else {
            res.status(404).json({ error: "Application not found" });
        }
    } catch (error) {
        console.error("NGO completion error:", error);
        res.status(500).json({ error: "Failed to submit partner feedback" });
    }
});

// 13. PATCH: Submit Form-C (Section B) - Manager Completion
router.patch("/:applicationId/completion/manager", authenticateJWT, async (req: AuthRequest, res) => {
    try {
        const { formData } = req.body;
        const applicationId = req.params.applicationId;
        const roEmployeeId = req.user.id;

        const [applications]: any = await db.query("SELECT completion_data, timeline_log FROM applications WHERE id = ?", [applicationId]);
        if (applications.length > 0) {
            const app = applications[0];
            let completionData = typeof app.completion_data === 'string' ? JSON.parse(app.completion_data) : (app.completion_data || {});
            
            // Add manager section of Form C
            completionData.formC = {
                ...completionData.formC,
                sectionB: {
                    ...formData,
                    submittedAt: new Date().toISOString(),
                    signature: req.user.name
                }
            };

            let timeline = typeof app.timeline_log === 'string' ? JSON.parse(app.timeline_log) : app.timeline_log;
            timeline.push({
                step: 11,
                title: "Form-C Section B Submitted",
                status: "COMPLETED",
                date: new Date().toISOString(),
                note: "Reporting Officer has submitted their acceptance."
            });

            await db.query(
                "UPDATE applications SET completion_data = ?, timeline_log = ?, current_status = 'FORWARDED_TO_HR' WHERE id = ?", 
                [JSON.stringify(completionData), JSON.stringify(timeline), applicationId]
            );
            res.json({ success: true });
        } else {
            res.status(404).json({ error: "Application not found" });
        }
    } catch (error) {
        console.error("Manager completion error:", error);
        res.status(500).json({ error: "Failed to submit manager review" });
    }
});

// 14. GET: Generate and Download Certificate of Appreciation (Form-F)
router.get("/:applicationId/certificate", authenticateJWT, async (req: AuthRequest, res) => {
    try {
        const applicationId = req.params.applicationId;
        const [applications]: any = await db.query(`
            SELECT 
                a.form_data,
                a.current_status,
                e.name as employee_name,
                p.expected_hours,
                n.name as ngo_name,
                (SELECT COALESCE(SUM(total_hours), 0) FROM volunteer_logs WHERE application_id = a.id) as logged_hours
            FROM applications a
            JOIN employees_local e ON a.employee_id = e.employee_id
            JOIN volunteer_postings p ON a.posting_id = p.id
            JOIN ngos_local n ON p.ngo_id = n.id
            WHERE a.id = ?
        `, [applicationId]);

        if (applications.length === 0) {
            return res.status(404).json({ error: "Application not found" });
        }

        const app = applications[0];

        let formData = typeof app.form_data === 'string' ? JSON.parse(app.form_data) : (app.form_data || {});
        const fromDate = formData.fromDate || "_______________";
        const toDate = formData.toDate || "_______________";
        
        const PDFDocument = (await import('pdfkit')).default;
        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Certificate_Form_F_${applicationId}.pdf`);

        doc.pipe(res);

        doc.fontSize(24).font('Helvetica-Bold').text('CERTIFICATE OF APPRECIATION', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(16).text('Form-F', { align: 'center' });
        doc.moveDown(3);

        doc.fontSize(14).font('Helvetica').text(`This is to certify that Mr./Ms. ${app.employee_name} has successfully contributed ${app.logged_hours} hours of voluntary service under the PRAYAS scheme at ${app.ngo_name} from ${fromDate} to ${toDate}.`, {
            align: 'justify',
            lineGap: 6
        });
        
        doc.moveDown(1.5);
        doc.text('We commend their spirit of service, professionalism, and dedication to community welfare.', {
            align: 'justify',
            lineGap: 6
        });

        doc.moveDown(4);
        doc.text('Signature: ____________________', { continued: true });
        doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
        
        doc.moveDown(1.5);
        doc.text('Head – T&HRD Division');

        doc.end();

    } catch (error) {
        console.error("Certificate Generation Error:", error);
        res.status(500).json({ error: "Failed to generate certificate" });
    }
});

export default router;