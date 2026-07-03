import express from "express";
import { db } from "../db.js";
import { authenticateJWT } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = express.Router();
router.get("/feed", authenticateJWT, async (req: AuthRequest, res) => {
    // Grab pagination parameters from the URL
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    try {
        // 1. Get the total count of OPEN postings for pagination math
        const [countResult]: any = await db.query(
            "SELECT COUNT(*) as total FROM volunteer_postings WHERE status = 'OPEN'"
        );
        const total = countResult[0].total;

        // 2. Fetch the specific page of data (Joined with local NGOs)
        const [rows] = await db.query(`
      SELECT 
        p.*, 
        n.name as ngo_name, 
        n.location as ngo_base_location,
        (SELECT COUNT(*) FROM applications a WHERE a.posting_id = p.id AND a.current_status IN ('ALL SET', 'Acknowledged and all set')) as active_volunteers
      FROM volunteer_postings p
      JOIN ngos_local n ON p.ngo_id = n.id
      WHERE p.status = 'OPEN'
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

        // 3. Return data and metadata
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
        console.error("Feed Error:", error);
        res.status(500).json({ error: "Failed to fetch global feed" });
    }
});
// Get active postings for the logged-in NGO
// GET all postings for an NGO (with Pagination)
router.get("/", authenticateJWT, async (req: AuthRequest, res) => {
    const ngoId = req.user.id;

    // Get pagination parameters from the URL (default to page 1, 15 items)
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const offset = (page - 1) * limit;

    try {
        // 1. Get the total count of postings for this NGO
        const [countResult]: any = await db.query(
            "SELECT COUNT(*) as total FROM volunteer_postings WHERE ngo_id = ?",
            [ngoId]
        );
        const total = countResult[0].total;

        // 2. Fetch the specific chunk of data
        const [rows] = await db.query(
            `SELECT p.*, 
                (SELECT COUNT(*) FROM applications a WHERE a.posting_id = p.id AND a.current_status IN ('ALL SET', 'Acknowledged and all set')) as active_volunteers
             FROM volunteer_postings p 
             WHERE p.ngo_id = ? 
             ORDER BY p.created_at DESC 
             LIMIT ? OFFSET ?`,
            [ngoId, limit, offset]
        );

        // 3. Return both the data and the metadata
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
        res.status(500).json({ error: "Failed to fetch postings" });
    }
});

// Create a new posting
router.post("/", authenticateJWT, async (req: AuthRequest, res) => {
    if (req.user.role !== "ngo") {
        return res.status(403).json({ error: "Only NGOs can create postings" });
    }

    const { title, location, volunteersNeeded, expectedHours, technicalSkills, natureOfWork, fromDate, toDate, medicalRequired } = req.body;
    const ngoId = req.user.id;

    try {
        const [result]: any = await db.query(
            `INSERT INTO volunteer_postings 
       (ngo_id, title, location, volunteers_needed, expected_hours, technical_skills, nature_of_work, from_date, to_date, medical_required) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [ngoId, title, location, volunteersNeeded, expectedHours, technicalSkills, natureOfWork, fromDate || null, toDate || null, medicalRequired ? 1 : 0]
        );

        res.json({ success: true, postingId: result.insertId });
    } catch (error) {
        console.error("Create Posting Error:", error);
        res.status(500).json({ error: "Failed to create posting" });
    }
});

// Close a posting
router.patch("/:id/close", authenticateJWT, async (req: AuthRequest, res) => {
    const postingId = req.params.id;
    const ngoId = req.user.id; // Ensures an NGO can only close their own postings

    try {
        const [result]: any = await db.query(
            "UPDATE volunteer_postings SET status = 'CLOSED' WHERE id = ? AND ngo_id = ?",
            [postingId, ngoId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Posting not found or unauthorized" });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to close posting" });
    }
});
// Edit a posting
router.put("/:id", authenticateJWT, async (req: AuthRequest, res) => {
    const postingId = req.params.id;
    const ngoId = req.user.id;
    
    if (req.user.role !== "ngo") {
        return res.status(403).json({ error: "Only NGOs can edit postings" });
    }

    const { title, location, volunteersNeeded, expectedHours, technicalSkills, natureOfWork, fromDate, toDate, medicalRequired } = req.body;

    try {
        const [result]: any = await db.query(
            `UPDATE volunteer_postings 
             SET title = ?, location = ?, volunteers_needed = ?, expected_hours = ?, technical_skills = ?, nature_of_work = ?, from_date = ?, to_date = ?, medical_required = ?
             WHERE id = ? AND ngo_id = ?`,
            [title, location, volunteersNeeded, expectedHours, technicalSkills, natureOfWork, fromDate || null, toDate || null, medicalRequired ? 1 : 0, postingId, ngoId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Posting not found or unauthorized" });
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Edit Posting Error:", error);
        res.status(500).json({ error: "Failed to edit posting" });
    }
});

export default router;