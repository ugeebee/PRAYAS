import express from "express";
import { db } from "../db";
import { authenticateJWT } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const router = express.Router();

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
            "SELECT * FROM volunteer_postings WHERE ngo_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
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
    const { title, location, volunteersNeeded, technicalSkills, natureOfWork } = req.body;
    const ngoId = req.user.id;

    try {
        await db.query(
            "INSERT INTO volunteer_postings (ngo_id, title, location, volunteers_needed, technical_skills, nature_of_work) VALUES (?, ?, ?, ?, ?, ?)",
            [ngoId, title || natureOfWork, location, volunteersNeeded, technicalSkills, natureOfWork]
        );
        res.json({ success: true });
    } catch (error) {
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

export default router;