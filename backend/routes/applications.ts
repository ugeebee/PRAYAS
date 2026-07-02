import { Router } from "express";
import { db } from "../db";
import { authenticateJWT, AuthRequest } from "../middleware/auth";
import multer from "multer";
import path from "path";
import { sendSms } from "../utils/sms";
import { sendEmail } from "../utils/email";

const router = Router();

// Multer storage config
async function checkAndNotifyDept(applicationId: string) {
    try {
        const [forms]: any = await db.query("SELECT formC, formD FROM forms WHERE application_id = ?", [applicationId]);
        if (forms.length > 0) {
            const formC = typeof forms[0].formC === 'string' ? JSON.parse(forms[0].formC) : (forms[0].formC || {});
            const formD = typeof forms[0].formD === 'string' ? JSON.parse(forms[0].formD) : (forms[0].formD || {});

            // Ensure Form C Section B is filled by Manager and Form D is filled by NGO
            if (formC.sectionB && Object.keys(formD).length > 0) {
                const [depts]: any = await db.query("SELECT email FROM ngo_dept WHERE role = 'dept'");
                const emails = depts.map((d: any) => d.email).filter(Boolean);

                if (emails.length > 0) {
                    for (const email of emails) {
                        await sendEmail(
                            email,
                            "Action Required: Fill Form G",
                            `Volunteer Application #${applicationId} has received both Form-C and Form-D.\n\nPlease login to the Prayas Portal to fill Form-G and issue the Form-F Certificate.`
                        );
                    }
                }
            }
        }
    } catch (err) {
        console.error("Error in checkAndNotifyDept:", err);
    }
}

async function notifyActionAndReaction(
    applicationId: string,
    actionDesc: string,
    employeeSmsText: string | null = null,
    notifyNgo: boolean = false,
    notifyDept: boolean = false
) {
    try {
        const [appData]: any = await db.query(
            `SELECT a.form_data, n.email as ngo_email 
             FROM applications a 
             JOIN volunteer_postings p ON a.posting_id = p.id 
             JOIN ngos_local n ON p.ngo_id = n.id 
             WHERE a.id = ?`,
            [applicationId]
        );

        if (appData.length > 0) {
            const formData = typeof appData[0].form_data === 'string' ? JSON.parse(appData[0].form_data) : (appData[0].form_data || {});
            const employeeContact = formData.contact;
            const ngoEmail = appData[0].ngo_email;

            if (employeeSmsText && employeeContact) {
                sendSms(`+91${employeeContact}`, employeeSmsText).catch(console.error);
            }

            if (notifyNgo && ngoEmail) {
                sendEmail(ngoEmail, "Prayas Portal: Action Required", `Hello,\n\nThere is an update on volunteer application #${applicationId} that requires your attention.\n\nUpdate: ${actionDesc}\n\nPlease login to the Prayas Portal to take the necessary action.`).catch(console.error);
            }
        }

        if (notifyDept) {
            const [depts]: any = await db.query("SELECT email FROM ngo_dept WHERE role = 'dept'");
            const deptEmails = depts.map((d: any) => d.email).filter(Boolean);
            for (const email of deptEmails) {
                sendEmail(email, "Prayas Portal: Action Required", `Hello Department Admin,\n\nThere is an update on volunteer application #${applicationId} that requires your attention.\n\nUpdate: ${actionDesc}\n\nPlease login to the Prayas Portal to take the necessary action.`).catch(console.error);
            }
        }
    } catch (err) {
        console.error("Error in notifyActionAndReaction:", err);
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        if (file.mimetype === 'application/pdf') ext = '.pdf';
        else if (file.mimetype === 'image/jpeg') ext = '.jpg';
        else if (file.mimetype === 'image/png') ext = '.png';
        cb(null, `medical_cert_${Date.now()}${ext}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
    fileFilter: (req, file, cb) => {
        const allowed = ["application/pdf", "image/jpeg", "image/png"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only PDF, JPEG, and PNG are allowed."));
        }
    }
});
// 7. GET: Fetch ALL Applications (For Dept/Admin View with 25-item Pagination)
router.get("/all", authenticateJWT, async (req: AuthRequest, res) => {
    if (req.user?.role !== 'dept') return res.status(403).json({ error: "Access denied" });
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
                f.formA as form_data, 
                f.formC,
                f.formD,
                p.title as posting_title,
                p.location as posting_location,
                p.expected_hours,
                p.nature_of_work,
                p.technical_skills,
                n.name as ngo_name,
                ap.ro_name,
                ap.ro_employee_id
            FROM applications a
            JOIN forms f ON a.id = f.application_id
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
            completion_data: {
                formC: typeof row.formC === 'string' && row.formC ? JSON.parse(row.formC) : row.formC,
                formD: typeof row.formD === 'string' && row.formD ? JSON.parse(row.formD) : row.formD
            }
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
router.post("/:postingId/apply", authenticateJWT, upload.single('certificate'), async (req: AuthRequest, res: any) => {
    const employeeId = req.user.id; // From the JWT
    const postingId = req.params.postingId;
    let { roEmployeeId, roName, formData } = req.body;

    // Fetch the actual RO from the database securely
    const [roDbRows]: any = await db.query(
        "SELECT reporting_officer FROM employees_local WHERE employee_id = ?",
        [employeeId]
    );

    if (roDbRows.length > 0 && roDbRows[0].reporting_officer) {
        roEmployeeId = roDbRows[0].reporting_officer;
    }



    if (typeof formData === 'string') {
        try {
            formData = JSON.parse(formData);
        } catch (e) {
            return res.status(400).json({ error: "Invalid form data format" });
        }
    }

    let certificateUrl = null;
    if (req.file) {
        certificateUrl = `/uploads/${req.file.filename}`;
    }

    // Backend validation: Check if posting requires medical certificate
    const [postingRows]: any = await db.query("SELECT medical_required FROM volunteer_postings WHERE id = ?", [postingId]);
    if (postingRows.length > 0 && postingRows[0].medical_required === 1 && !certificateUrl) {
        return res.status(400).json({ error: "Medical certificate is required for this activity." });
    }

    if (formData?.contact && !/^\d{10}$/.test(formData.contact)) {
        return res.status(400).json({ error: "Contact number must be exactly 10 digits" });
    }

    if (formData?.dates?.dates && Array.isArray(formData.dates.dates)) {
        const newDates: string[] = formData.dates.dates;

        // Fetch existing active applications to check for date overlap
        const [existingApps]: any = await db.query(
            `SELECT form_data, current_status, p.title as posting_title 
             FROM applications a
             JOIN volunteer_postings p ON a.posting_id = p.id
             WHERE a.employee_id = ? 
             AND a.current_status NOT IN ('REJECTED', 'NGO rejected', 'TERMINATED_BY_EMPLOYEE', 'TERMINATED_BY_NGO')`,
            [employeeId]
        );

        for (const app of existingApps) {
            if (!app.form_data) continue;
            const appData = typeof app.form_data === 'string' ? JSON.parse(app.form_data) : app.form_data;

            let existingDates: string[] = [];

            // Check new array format
            if (appData.dates && Array.isArray(appData.dates.dates)) {
                existingDates = appData.dates.dates;
            }
            // Check legacy fromDate/toDate format
            else if (appData.fromDate && appData.toDate) {
                let current = new Date(appData.fromDate);
                const last = new Date(appData.toDate);
                while (current <= last) {
                    existingDates.push(current.toISOString().split('T')[0]);
                    current.setDate(current.getDate() + 1);
                }
            }

            // Overlap check
            const overlaps = newDates.filter(d => existingDates.includes(d));
            if (overlaps.length > 0) {
                return res.status(400).json({
                    error: `You already have an active application ("${app.posting_title}") on conflicting date(s): ${overlaps.join(', ')}.`
                });
            }
        }
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
        { step: 3, title: "Recorded at CSR & SD", status: "PENDING", date: null },
        { step: 4, title: "Recorded at HR/T&HRD division", status: "PENDING", date: null },
        { step: 5, title: "Forwarded to NGO", status: "PENDING", date: null },
        { step: 6, title: "Waiting Acknowledgement", status: "PENDING", date: null },
        { step: 7, title: "All Set", status: "PENDING", date: null }
    ];

    try {
        // Insert into database, converting the timeline array to a JSON string
        const [result]: any = await db.query(
            `INSERT INTO applications (employee_id, posting_id, current_status, timeline_log, form_data, medical_certificate_path) 
       VALUES (?, ?, 'APPLIED', ?, ?, ?)`,
            [employeeId, postingId, JSON.stringify(initialTimeline), formData ? JSON.stringify(formData) : null, certificateUrl]
        );

        const applicationId = result.insertId;

        // Initialize the new unified forms record
        await db.query(
            `INSERT INTO forms (application_id, employee_id, formA, formE)
             VALUES (?, ?, ?, TRUE)`,
            [applicationId, employeeId, formData ? JSON.stringify(formData) : null]
        );

        // Insert into approvals table
        if (roEmployeeId) {
            await db.query(
                `INSERT INTO approvals (application_id, employee_id, ro_employee_id, ro_name, status)
                 VALUES (?, ?, ?, ?, 'PENDING')`,
                [applicationId, employeeId, roEmployeeId, roName]
            );

            // Fetch RO Mobile from database to ensure reliable SMS delivery
            const [roMobileRows]: any = await db.query(
                "SELECT reporting_officer_mobile FROM employees_local WHERE employee_id = ?",
                [employeeId]
            );

            const roContact = roMobileRows.length > 0 && roMobileRows[0].reporting_officer_mobile
                ? roMobileRows[0].reporting_officer_mobile
                : (formData && formData.ro_contact ? formData.ro_contact : null);

            if (roContact) {
                // Send SMS asynchronously
                sendSms(
                    `+91${roContact}`,
                    `Prayas Portal: Employee ${employeeId} has submitted a volunteer application (#${applicationId}) that requires your approval.`
                );
            }
        }

        notifyActionAndReaction(applicationId.toString(), "New volunteer application submitted.", `Prayas Portal: You have successfully applied for the volunteering opportunity (App #${applicationId}).`, false, false);

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
        f.formA as form_data,
        f.formC,
        f.formD,
        e.final_score as eval_final_score,
        e.self_assessment as eval_self_assessment,
        e.ngo_assessment as eval_ngo_assessment,
        p.title as posting_title,
        p.expected_hours,
        n.name as ngo_name,
        ap.ro_name as ro_name,
        (SELECT COALESCE(SUM(total_hours), 0) FROM volunteer_logs WHERE application_id = a.id) as logged_hours
      FROM applications a
      JOIN forms f ON a.id = f.application_id
      JOIN volunteer_postings p ON a.posting_id = p.id
      JOIN ngos_local n ON p.ngo_id = n.id
      LEFT JOIN approvals ap ON ap.application_id = a.id
      LEFT JOIN evaluations e ON e.application_id = a.id
      WHERE a.employee_id = ?
      ORDER BY a.updated_at DESC
    `, [employeeId]);

        const [settingsRows]: any = await db.query("SELECT key_value FROM settings WHERE key_name = 'certificate_threshold'");
        const threshold = settingsRows.length > 0 ? parseFloat(settingsRows[0].key_value) : 40;

        // Parse the JSON string back into an object before sending to frontend
        const formattedRows = rows.map((row: any) => {
            const {
                eval_final_score,
                eval_self_assessment,
                eval_ngo_assessment,
                ...restRow
            } = row;

            return {
                ...restRow,
                timeline_log: typeof restRow.timeline_log === 'string' ? JSON.parse(restRow.timeline_log) : restRow.timeline_log,
                form_data: typeof restRow.form_data === 'string' ? JSON.parse(restRow.form_data) : restRow.form_data,
                completion_data: {
                    formC: typeof restRow.formC === 'string' && restRow.formC ? JSON.parse(restRow.formC) : restRow.formC,
                    formD: typeof restRow.formD === 'string' && restRow.formD ? JSON.parse(restRow.formD) : restRow.formD
                },
                evaluation_data: {
                    final_score: typeof eval_final_score === 'string' ? JSON.parse(eval_final_score) : eval_final_score,
                    self_assessment: typeof eval_self_assessment === 'string' ? JSON.parse(eval_self_assessment) : eval_self_assessment,
                    ngo_assessment: typeof eval_ngo_assessment === 'string' ? JSON.parse(eval_ngo_assessment) : eval_ngo_assessment
                },
                certificate_threshold: threshold
            };
        });

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
                f.formA as form_data,
                p.title as posting_title, 
                p.expected_hours, 
                p.location,
                p.nature_of_work,
                e.name as employee_name,
                n.name as ngo_name
            FROM approvals ap
            JOIN applications a ON ap.application_id = a.id
            LEFT JOIN forms f ON a.id = f.application_id
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
                f.formC,
                f.formD,
                f.formA as form_data,
                p.title as posting_title, 
                p.location,
                p.expected_hours,
                p.nature_of_work,
                e.name as employee_name,
                n.name as ngo_name
            FROM approvals ap
            JOIN applications a ON ap.application_id = a.id
            LEFT JOIN forms f ON a.id = f.application_id
            JOIN volunteer_postings p ON a.posting_id = p.id
            JOIN employees_local e ON ap.employee_id = e.employee_id
            JOIN ngos_local n ON p.ngo_id = n.id
            WHERE ap.ro_employee_id = ? AND a.current_status = 'PENDING_RO_COMPLETION'
        `, [roEmployeeId]);

        // Parse JSON
        const formattedRows = rows.map((row: any) => ({
            ...row,
            completion_data: {
                formC: typeof row.formC === 'string' && row.formC ? JSON.parse(row.formC) : row.formC,
                formD: typeof row.formD === 'string' && row.formD ? JSON.parse(row.formD) : row.formD
            },
            form_data: typeof row.form_data === 'string' ? JSON.parse(row.form_data) : row.form_data
        }));

        res.json(formattedRows);
    } catch (error) {
        console.error("Fetch Completion Approvals Error:", error);
        res.status(500).json({ error: "Failed to fetch completion approvals" });
    }
});

// 3.75 GET: Fetch Approval History for an RO (Paginated)
router.get("/approvals/history", authenticateJWT, async (req: AuthRequest, res) => {
    const roEmployeeId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const offset = (page - 1) * limit;

    try {
        const [countResult]: any = await db.query(
            "SELECT COUNT(*) as total FROM approvals WHERE ro_employee_id = ? AND status != 'PENDING'",
            [roEmployeeId]
        );
        const total = countResult[0].total;

        const [rows]: any = await db.query(`
            SELECT 
                ap.id as approval_id,
                ap.application_id,
                ap.status as approval_status,
                a.updated_at as approval_date,
                a.current_status, 
                a.employee_id,
                f.formA as form_data,
                a.timeline_log,
                p.title as posting_title, 
                e.name as employee_name,
                n.name as ngo_name
            FROM approvals ap
            JOIN applications a ON ap.application_id = a.id
            LEFT JOIN forms f ON a.id = f.application_id
            JOIN volunteer_postings p ON a.posting_id = p.id
            JOIN employees_local e ON ap.employee_id = e.employee_id
            JOIN ngos_local n ON p.ngo_id = n.id
            WHERE ap.ro_employee_id = ? AND ap.status != 'PENDING'
            ORDER BY a.updated_at DESC
            LIMIT ? OFFSET ?
        `, [roEmployeeId, limit, offset]);

        const formattedRows = rows.map((row: any) => ({
            ...row,
            form_data: typeof row.form_data === 'string' ? JSON.parse(row.form_data) : row.form_data,
            timeline_log: typeof row.timeline_log === 'string' ? JSON.parse(row.timeline_log) : row.timeline_log
        }));

        res.json({
            data: formattedRows,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error("Fetch Approvals History Error:", error);
        res.status(500).json({ error: "Failed to fetch approvals history" });
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
            "SELECT a.timeline_log, f.formA as form_data FROM applications a JOIN forms f ON a.id = f.application_id WHERE a.id = ?",
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

                // Fetch NGO email to notify them of the new approval
                const [ngoData]: any = await db.query(
                    "SELECT n.email, n.name FROM applications a JOIN volunteer_postings p ON a.posting_id = p.id JOIN ngos_local n ON p.ngo_id = n.id WHERE a.id = ?",
                    [applicationId]
                );
                if (ngoData.length > 0 && ngoData[0].email) {
                    await sendEmail(
                        ngoData[0].email,
                        "New Volunteer Approval",
                        `Hello ${ngoData[0].name},\n\nA new volunteer application (#${applicationId}) has been approved by their Reporting Officer and is now forwarded to your dashboard for acknowledgement.\n\nPlease log in to the Prayas Portal to review it.`
                    );
                }
            }

            // Update application current status
            let newAppStatus = action;
            if (action === 'APPROVED') newAppStatus = 'RO_APPROVED';

            await db.query(
                "UPDATE applications SET current_status = ?, timeline_log = ? WHERE id = ?",
                [newAppStatus, JSON.stringify(timeline), applicationId]
            );

            const formDataStr = typeof applications[0].form_data === 'string' ? JSON.parse(applications[0].form_data) : (applications[0].form_data || {});

            // Add Section D to Form A
            formDataStr.sectionD = {
                status: action,
                comments: comments || '',
                signature: managerName,
                date: new Date().toISOString()
            };

            await db.query("UPDATE forms SET formA = ? WHERE application_id = ?", [JSON.stringify(formDataStr), applicationId]);
            const actionText = action === 'APPROVED' ? 'Approved' : 'Rejected';
            const isApproved = action === 'APPROVED';
            notifyActionAndReaction(applicationId.toString(), `Reporting Officer has ${actionText.toLowerCase()} the volunteer application.`, `Prayas Portal: Your Reporting Officer has ${actionText.toLowerCase()} your volunteer application (#${applicationId}).`, isApproved, false);
        }

        res.json({ success: true, message: "Review submitted successfully" });
    } catch (error) {
        console.error("Review Error:", error);
        res.status(500).json({ error: "Failed to submit review" });
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

        // If still not authorized, check if user is the NGO that owns the posting
        if (!isAuthorized && req.user.role === 'ngo') {
            const [ngoCheck]: any = await db.query(
                "SELECT 1 FROM applications a JOIN volunteer_postings p ON a.posting_id = p.id WHERE a.id = ? AND p.ngo_id = ?",
                [applicationId, userId]
            );
            if (ngoCheck.length > 0) {
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
        res.setHeader('Content-Disposition', `attachment; filename="medical_certificate${path.extname(filePath)}"`);
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
            JOIN forms f ON a.id = f.application_id
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
                f.formA as form_data, 
                f.formC,
                f.formD,
                p.title as posting_title,
                p.location as posting_location,
                p.expected_hours,
                p.nature_of_work,
                p.technical_skills,
                n.name as ngo_name
            FROM applications a
            JOIN forms f ON a.id = f.application_id
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

        const [check]: any = await db.query(
            "SELECT a.id FROM applications a JOIN volunteer_postings p ON a.posting_id = p.id WHERE a.id = ? AND p.ngo_id = ?",
            [applicationId, req.user.id]
        );
        if (check.length === 0) return res.status(403).json({ error: "Unauthorized" });

        const [applications]: any = await db.query("SELECT a.timeline_log, f.formA as form_data FROM applications a JOIN forms f ON a.id = f.application_id WHERE a.id = ?", [applicationId]);
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

            const formDataStr = typeof applications[0].form_data === 'string' ? JSON.parse(applications[0].form_data) : (applications[0].form_data || {});
            const actionText = action === 'YES' ? 'Accepted' : 'Rejected';
            notifyActionAndReaction(applicationId.toString(), `NGO has ${actionText.toLowerCase()} the volunteer application.`, `Prayas Portal: The NGO has ${actionText.toLowerCase()} your volunteer application (#${applicationId}).`, false, false);
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
                f.formA as form_data,
                p.title as posting_title,
                p.location as posting_location,
                p.expected_hours
            FROM applications a
            JOIN forms f ON a.id = f.application_id
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
        const userId = req.user?.id;

        if (!role) return res.status(403).json({ error: "Access denied" });

        const [check]: any = await db.query(
            `SELECT a.id FROM applications a
           LEFT JOIN approvals ap ON a.id = ap.application_id
           WHERE a.id = ? AND (
             (? = 'employee' AND a.employee_id = ?) OR
             (? = 'ngo' AND EXISTS (SELECT 1 FROM volunteer_postings p WHERE p.id = a.posting_id AND p.ngo_id = ?))
           )`,
            [applicationId, role, userId, role, userId]
        );
        if (check.length === 0) return res.status(403).json({ error: "Unauthorized" });

        const [applications]: any = await db.query("SELECT a.timeline_log, a.current_status, f.formA as form_data FROM applications a JOIN forms f ON a.id = f.application_id WHERE a.id = ?", [applicationId]);
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
            const todayStr = new Date().toISOString().split('T')[0];
            formData.toDate = todayStr;

            // Free up future dates if they exist in the new array format
            if (formData.dates && Array.isArray(formData.dates.dates)) {
                formData.dates.dates = formData.dates.dates.filter((d: string) => d <= todayStr);
            }

            const newAppStatus = role === 'employee' ? 'TERMINATED_BY_EMPLOYEE' : 'TERMINATED_BY_NGO';

            await db.query("UPDATE applications SET current_status = ?, timeline_log = ? WHERE id = ?", [newAppStatus, JSON.stringify(timeline), applicationId]);
            await db.query("UPDATE forms SET formA = ? WHERE application_id = ?", [JSON.stringify(formData), applicationId]);

            const termSource = role === 'employee' ? 'Employee' : 'NGO';
            notifyActionAndReaction(applicationId.toString(), `Volunteer application was terminated early by ${termSource}.`, `Prayas Portal: Your volunteer application (#${applicationId}) has been terminated.`, false, false);

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

        const [check]: any = await db.query("SELECT id FROM applications WHERE id = ? AND employee_id = ?", [applicationId, req.user.id]);
        if (check.length === 0) return res.status(403).json({ error: "Unauthorized" });

        const [applications]: any = await db.query("SELECT f.formC as completion_data, a.timeline_log, f.formA as form_data FROM applications a JOIN forms f ON a.id = f.application_id WHERE a.id = ?", [applicationId]);
        if (applications.length > 0) {
            const app = applications[0];
            let completionData = typeof app.completion_data === 'string' ? JSON.parse(app.completion_data) : (app.completion_data || {});
            if (!completionData.formC) completionData = { formC: completionData };

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
                "UPDATE applications SET timeline_log = ?, current_status = 'PENDING_RO_COMPLETION' WHERE id = ?",
                [JSON.stringify(timeline), applicationId]
            );
            await db.query(
                "UPDATE forms SET formC = ? WHERE application_id = ?",
                [JSON.stringify(completionData.formC), applicationId]
            );

            const formDataStr = typeof app.form_data === 'string' ? JSON.parse(app.form_data) : (app.form_data || {});
            if (formDataStr && formDataStr.ro_contact) {
                // Send SMS asynchronously
                sendSms(
                    `+91${formDataStr.ro_contact}`,
                    `Prayas Portal: Employee ${req.user.id} has submitted Form-C Section A for Application #${applicationId}. It is waiting for your review and acceptance.`
                );
            }

            // Fetch NGO email to notify them to fill required forms
            const [ngoData]: any = await db.query(
                "SELECT n.email, n.name FROM applications a JOIN volunteer_postings p ON a.posting_id = p.id JOIN ngos_local n ON p.ngo_id = n.id WHERE a.id = ?",
                [applicationId]
            );
            if (ngoData.length > 0 && ngoData[0].email) {
                await sendEmail(
                    ngoData[0].email,
                    "Action Required: Volunteer Activity Ended",
                    `Hello ${ngoData[0].name},\n\nThe volunteer for application #${applicationId} has officially ended their activity and submitted their completion report.\n\nPlease log in to the Prayas Portal to submit your partner organization feedback (Form-D) for this volunteer.`
                );
            }

            notifyActionAndReaction(applicationId.toString(), `Employee has submitted their Form-C Section A completion report.`, `Prayas Portal: You have submitted Form-C Section A for Application #${applicationId}.`, false, false);

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

        const [check]: any = await db.query(
            "SELECT a.id FROM applications a JOIN volunteer_postings p ON a.posting_id = p.id WHERE a.id = ? AND p.ngo_id = ?",
            [applicationId, req.user.id]
        );
        if (check.length === 0) return res.status(403).json({ error: "Unauthorized" });

        const [applications]: any = await db.query("SELECT f.formD, a.timeline_log FROM applications a JOIN forms f ON a.id = f.application_id WHERE a.id = ?", [applicationId]);
        if (applications.length > 0) {
            const app = applications[0];
            let formD = typeof app.formD === 'string' ? JSON.parse(app.formD) : (app.formD || {});

            // Add Form D from NGO
            formD = {
                ...formD,
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
                "UPDATE applications SET timeline_log = ? WHERE id = ?",
                [JSON.stringify(timeline), applicationId]
            );
            await db.query(
                "UPDATE forms SET formD = ? WHERE application_id = ?",
                [JSON.stringify(formD), applicationId]
            );

            await checkAndNotifyDept(applicationId);
            notifyActionAndReaction(applicationId.toString(), `NGO has submitted Form-D feedback.`, `Prayas Portal: The NGO has submitted feedback (Form-D) for your application (#${applicationId}).`, false, false);
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

        const [check]: any = await db.query(
            "SELECT id FROM approvals WHERE application_id = ? AND ro_employee_id = ?",
            [applicationId, roEmployeeId]
        );
        if (check.length === 0) return res.status(403).json({ error: "Unauthorized" });

        const [applications]: any = await db.query("SELECT f.formC, a.timeline_log, f.formA as form_data FROM applications a JOIN forms f ON a.id = f.application_id WHERE a.id = ?", [applicationId]);
        if (applications.length > 0) {
            const app = applications[0];
            let formC = typeof app.formC === 'string' ? JSON.parse(app.formC) : (app.formC || {});

            // Add manager section of Form C
            formC = {
                ...formC,
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
                "UPDATE applications SET timeline_log = ?, current_status = 'FORWARDED_TO_HR' WHERE id = ?",
                [JSON.stringify(timeline), applicationId]
            );
            await db.query(
                "UPDATE forms SET formC = ? WHERE application_id = ?",
                [JSON.stringify(formC), applicationId]
            );

            const formDataStr = typeof app.form_data === 'string' ? JSON.parse(app.form_data) : (app.form_data || {});
            notifyActionAndReaction(applicationId.toString(), `Reporting Officer has submitted Form-C Section B.`, `Prayas Portal: Your Reporting Officer has completed Form-C Section B for Application #${applicationId}.`, true, false);

            await checkAndNotifyDept(applicationId);
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
                a.employee_id,
                p.ngo_id,
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
        const userId = req.user?.id;

        // Verify authorization
        let isAuthorized = app.employee_id === userId || req.user?.role === 'dept' || app.ngo_id === userId;
        if (!isAuthorized) {
            const [approvals]: any = await db.query(
                "SELECT id FROM approvals WHERE application_id = ? AND ro_employee_id = ?",
                [applicationId, userId]
            );
            if (approvals.length > 0) isAuthorized = true;
        }

        if (!isAuthorized) {
            return res.status(403).json({ error: "Unauthorized to generate this certificate" });
        }

        const [settingsRows]: any = await db.query("SELECT key_value FROM settings WHERE key_name = 'certificate_threshold'");
        const threshold = settingsRows.length > 0 ? parseFloat(settingsRows[0].key_value) : 40;

        const requiredHours = app.expected_hours * (threshold / 100);
        if (app.logged_hours < requiredHours) {
            return res.status(400).json({ error: `Not enough logged hours. Minimum required is ${requiredHours} hours (${threshold}% of ${app.expected_hours} hours).` });
        }

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