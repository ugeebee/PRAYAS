import { Router } from "express";
import { db } from "../db";
import { authenticateJWT, AuthRequest } from "../middleware/auth";

const router = Router();

// GET: Fetch Evaluation (Form-G) for an application
router.get("/:applicationId", authenticateJWT, async (req: AuthRequest, res) => {
    try {
        const applicationId = req.params.applicationId;

        // Fetch application details first
        const [applications]: any = await db.query(`
            SELECT 
                a.id,
                a.employee_id,
                a.form_data,
                p.ngo_id,
                e.name as volunteer_name,
                ap.ro_name as reporting_officer,
                ap.ro_employee_id,
                n.name as ngo_name,
                (SELECT COALESCE(SUM(total_hours), 0) FROM volunteer_logs WHERE application_id = a.id) as total_hours
            FROM applications a
            JOIN volunteer_postings p ON a.posting_id = p.id
            JOIN employees_local e ON a.employee_id = e.employee_id
            JOIN ngos_local n ON p.ngo_id = n.id
            LEFT JOIN approvals ap ON ap.application_id = a.id
            WHERE a.id = ?
        `, [applicationId]);

        if (applications.length === 0) {
            return res.status(404).json({ error: "Application not found" });
        }

        const appDetails = applications[0];
        
        // Security check
        const role = req.user?.role;
        const jwtId = req.user?.id;
        
        if (role === 'employee') {
            if (appDetails.employee_id !== jwtId && appDetails.ro_employee_id !== jwtId) {
                return res.status(403).json({ error: "Unauthorized Access" });
            }
        } else if (role === 'ngo') {
            if (appDetails.ngo_id !== jwtId) {
                return res.status(403).json({ error: "Unauthorized Access" });
            }
        } else if (role !== 'dept') {
            return res.status(403).json({ error: "Unauthorized Access" });
        }
        
        let formData: any = {};
        if (appDetails.form_data) {
            formData = typeof appDetails.form_data === 'string' ? JSON.parse(appDetails.form_data) : appDetails.form_data;
            if (typeof formData === 'string') formData = JSON.parse(formData); // Handle double stringified JSON
        }
        
        appDetails.designation = formData.designation || "N/A";
        appDetails.department = formData.department || "N/A";
        appDetails.phone = formData.contact || "N/A";
        delete appDetails.form_data; // Remove raw form_data from response

        // Fetch evaluation
        const [evals]: any = await db.query("SELECT * FROM evaluations WHERE application_id = ?", [applicationId]);
        
        let evaluation = evals.length > 0 ? evals[0] : null;

        if (evaluation) {
            evaluation.self_assessment = typeof evaluation.self_assessment === 'string' ? JSON.parse(evaluation.self_assessment) : evaluation.self_assessment;
            evaluation.ngo_assessment = typeof evaluation.ngo_assessment === 'string' ? JSON.parse(evaluation.ngo_assessment) : evaluation.ngo_assessment;
            evaluation.final_score = typeof evaluation.final_score === 'string' ? JSON.parse(evaluation.final_score) : evaluation.final_score;
        }

        res.json({
            appDetails,
            evaluation
        });
    } catch (error) {
        console.error("Fetch Evaluation Error:", error);
        res.status(500).json({ error: "Failed to fetch evaluation" });
    }
});

// PATCH: Update Evaluation (Form-G)
router.patch("/:applicationId", authenticateJWT, async (req: AuthRequest, res) => {
    try {
        const applicationId = req.params.applicationId;
        const role = req.user?.role;
        const { self_assessment, ngo_assessment, final_score, recommendation } = req.body;

        // Verify application
        const [applications]: any = await db.query(`
            SELECT a.employee_id, a.posting_id, p.ngo_id, ap.ro_employee_id
            FROM applications a
            JOIN volunteer_postings p ON a.posting_id = p.id
            LEFT JOIN approvals ap ON ap.application_id = a.id
            WHERE a.id = ?
        `, [applicationId]);
        
        if (applications.length === 0) {
            return res.status(404).json({ error: "Application not found" });
        }
        
        const appRecord = applications[0];
        const jwtId = req.user?.id;
        
        if (role === 'employee') {
            if (appRecord.employee_id !== jwtId && appRecord.ro_employee_id !== jwtId) {
                return res.status(403).json({ error: "Unauthorized Access" });
            }
        } else if (role === 'ngo') {
            if (appRecord.ngo_id !== jwtId) {
                return res.status(403).json({ error: "Unauthorized Access" });
            }
        } else if (role !== 'dept') {
            return res.status(403).json({ error: "Unauthorized Access" });
        }

        const employeeId = appRecord.employee_id;
        const ngoId = appRecord.ngo_id;

        // Check existing evaluation
        const [evals]: any = await db.query("SELECT * FROM evaluations WHERE application_id = ?", [applicationId]);
        
        if (evals.length === 0) {
            // Create new
            await db.query(`
                INSERT INTO evaluations (application_id, employee_id, ngo_id, self_assessment, ngo_assessment, final_score, recommendation)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                applicationId, 
                employeeId, 
                ngoId, 
                self_assessment ? JSON.stringify(self_assessment) : null,
                ngo_assessment ? JSON.stringify(ngo_assessment) : null,
                final_score ? JSON.stringify(final_score) : null,
                recommendation || null
            ]);
        } else {
            // Update
            const updates = [];
            const values = [];

            if (self_assessment !== undefined) {
                updates.push("self_assessment = ?");
                values.push(self_assessment ? JSON.stringify(self_assessment) : null);
            }
            if (ngo_assessment !== undefined) {
                updates.push("ngo_assessment = ?");
                values.push(ngo_assessment ? JSON.stringify(ngo_assessment) : null);
            }
            if (final_score !== undefined) {
                updates.push("final_score = ?");
                values.push(final_score ? JSON.stringify(final_score) : null);
            }
            if (recommendation !== undefined) {
                updates.push("recommendation = ?");
                values.push(recommendation);
            }

            if (updates.length > 0) {
                values.push(applicationId);
                await db.query(`UPDATE evaluations SET ${updates.join(", ")} WHERE application_id = ?`, values);
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Update Evaluation Error:", error);
        res.status(500).json({ error: "Failed to update evaluation" });
    }
});

export default router;
