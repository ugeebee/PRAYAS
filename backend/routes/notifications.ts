import { Router } from "express";
import { db } from "../db.js";
import { authenticateJWT, AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/action-required", authenticateJWT, async (req: AuthRequest, res) => {
    try {
        const role = req.user?.role;
        const userId = req.user?.id;
        const actions: any[] = [];

        if (role === 'employee' || role === 'dept') {
            if (role === 'employee') {
                // 1. Applications needing medical certificates
                const [medicalApps]: any = await db.query(
                    "SELECT id, current_status FROM applications WHERE employee_id = ? AND current_status = 'PENDING_MEDICAL'",
                    [userId]
                );
                medicalApps.forEach((app: any) => {
                    actions.push({
                        id: app.id,
                        type: 'PENDING_MEDICAL',
                        message: `Application #${app.id} needs a medical certificate uploaded.`,
                        link: '/dashboard/employee/applications?tab=action'
                    });
                });

                // 2. Pending Form-C (Section A)
                const [formCApps]: any = await db.query(
                    "SELECT id, current_status, completion_data FROM applications WHERE employee_id = ? AND (current_status = 'COMPLETED' OR current_status LIKE '%TERMINATED%')",
                    [userId]
                );
                formCApps.forEach((app: any) => {
                    const completionData = typeof app.completion_data === 'string' ? JSON.parse(app.completion_data) : (app.completion_data || {});
                    if (!completionData?.formC?.sectionA) {
                        actions.push({
                            id: app.id,
                            type: 'PENDING_FORM_C',
                            message: `Application #${app.id} needs Form-C (Volunteering Completion Report) filled.`,
                            link: '/dashboard/employee/applications?tab=action'
                        });
                    }
                });
            }

            // RO Duties
            const [roApprovals]: any = await db.query(
                "SELECT application_id FROM approvals WHERE ro_employee_id = ? AND status = 'PENDING'",
                [userId]
            );
            roApprovals.forEach((app: any) => {
                actions.push({
                    id: app.application_id,
                    type: 'PENDING_RO_APPROVAL',
                    message: `Application #${app.application_id} needs your approval as Reporting Officer.`,
                    link: '/dashboard/employee/approvals'
                });
            });

            const [roFormC]: any = await db.query(
                `SELECT a.id FROM applications a
                 JOIN approvals ap ON a.id = ap.application_id
                 WHERE ap.ro_employee_id = ? AND a.current_status = 'PENDING_RO_COMPLETION'`,
                [userId]
            );
            roFormC.forEach((app: any) => {
                actions.push({
                    id: app.id,
                    type: 'PENDING_RO_FORM_C',
                    message: `Application #${app.id} needs RO Form-C Section B acceptance.`,
                    link: '/dashboard/employee/approvals'
                });
            });
        } 
        else if (role === 'ngo') {
            // 1. Postings needing approval
            const [approvalApps]: any = await db.query(
                `SELECT a.id, p.title FROM applications a 
                 JOIN volunteer_postings p ON a.posting_id = p.id 
                 WHERE p.ngo_id = ? AND a.current_status = 'RO_APPROVED'`,
                [userId]
            );
            approvalApps.forEach((app: any) => {
                actions.push({
                    id: app.id,
                    type: 'PENDING_APPROVAL',
                    message: `Application #${app.id} for "${app.title}" needs NGO approval.`,
                    link: '/dashboard/ngo?tab=volunteers&subtab=action'
                });
            });

            // 2. Logs needing verification
            const [pendingLogs]: any = await db.query(
                `SELECT DISTINCT a.id, p.title FROM volunteer_logs l
                 JOIN applications a ON l.application_id = a.id
                 JOIN volunteer_postings p ON a.posting_id = p.id
                 WHERE p.ngo_id = ? AND l.ngo_status = 'PENDING'`,
                [userId]
            );
            pendingLogs.forEach((app: any) => {
                actions.push({
                    id: app.id,
                    type: 'PENDING_LOGS',
                    message: `Application #${app.id} for "${app.title}" has pending logs to verify.`,
                    link: '/dashboard/ngo?tab=logs'
                });
            });

            // 3. Pending Form-D
            const [ngoFormApps]: any = await db.query(
                `SELECT a.id, a.completion_data FROM applications a
                 JOIN volunteer_postings p ON a.posting_id = p.id
                 WHERE p.ngo_id = ? AND (a.current_status = 'COMPLETED' OR a.current_status = 'PENDING_RO_COMPLETION' OR a.current_status LIKE '%TERMINATED%')`,
                 [userId]
            );
            ngoFormApps.forEach((app: any) => {
                const completionData = typeof app.completion_data === 'string' ? JSON.parse(app.completion_data) : (app.completion_data || {});
                if (!completionData?.formD) {
                    actions.push({
                        id: app.id,
                        type: 'PENDING_FORM_D',
                        message: `Application #${app.id} needs NGO Form-D feedback.`,
                        link: `/dashboard/ngo?tab=volunteers&subtab=past` 
                    });
                }
            });
        }

        res.json({ actions });
    } catch (error) {
        console.error("Action Required Error:", error);
        res.status(500).json({ error: "Failed to fetch action required" });
    }
});

export default router;
