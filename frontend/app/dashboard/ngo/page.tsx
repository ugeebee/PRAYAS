"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NgoDashboard() {
    const router = useRouter();
    const [otherNatureOfWork, setOtherNatureOfWork] = useState("");
    const [postings, setPostings] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLedgerOpen, setIsLedgerOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        location: "",
        volunteersNeeded: "",
        expectedHours: "",
        technicalSkills: "",
        natureOfWork: "",
    });

    useEffect(() => {
        const token = localStorage.getItem("prayas_token");
        if (!token) {
            router.push("/login/ngo");
            return;
        }
        fetchPostings(token);
    }, [router]);

    const fetchPostings = async (token: string, fetchAll = false) => {
        // If opening the ledger, fetch everything (or a much higher limit). Otherwise, fetch 15.
        const limit = fetchAll ? totalCount : 15;

        const res = await fetch(`http://localhost:5000/api/postings?page=1&limit=${limit}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
            const result = await res.json();
            setPostings(result.data);        // Set the actual array of postings
            setTotalCount(result.meta.total); // Set the total count for the UI
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("prayas_token");

        const res = await fetch("http://localhost:5000/api/postings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                title: formData.title,
                location: formData.location,
                volunteersNeeded: parseInt(formData.volunteersNeeded),
                expectedHours: parseInt(formData.expectedHours), // Send the new field
                technicalSkills: formData.technicalSkills,
                natureOfWork: formData.natureOfWork === "Other" ? otherNatureOfWork : formData.natureOfWork
            })
        });

        if (res.ok) {
            // Reset ALL fields, including the new expectedHours field
            setFormData({
                title: "",
                location: "",
                volunteersNeeded: "",
                expectedHours: "", // <-- Added here
                technicalSkills: "",
                natureOfWork: ""
            });
            setOtherNatureOfWork("");
            fetchPostings(token as string);
        }
    };

    const handleClosePosting = async (postingId: number) => {
        const token = localStorage.getItem("prayas_token");

        const res = await fetch(`http://localhost:5000/api/postings/${postingId}/close`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`
            },
        });

        if (res.ok) {
            fetchPostings(token as string);
        }
    };

    // UI Helper to render a single posting card (keeps code DRY)
    const renderPostingCard = (post: any) => (
        <div key={post.id} className={`border p-5 mb-4 ${post.status === 'CLOSED' ? 'border-gray-200 bg-gray-50 opacity-75' : 'border-gray-200 bg-white'}`}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-semibold text-lg">{post.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span>📍 {post.location || "No location specified"}</span>
                        <span className="font-bold text-black border-l border-gray-300 pl-3">
                            ⏱️ {post.expected_hours} Expected Hours
                        </span>
                    </div>
                </div>

                {post.status === 'OPEN' ? (
                    <span className="text-xs text-green-700 bg-green-50 px-2 py-1 flex items-center gap-1 border border-green-100">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Open (Need {post.volunteers_needed})
                    </span>
                ) : (
                    <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 flex items-center gap-1 border border-gray-300">
                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                        Closed
                    </span>
                )}
            </div>

            <div className="flex gap-2 mt-4 mb-4">
                <span className="text-xs bg-white text-gray-600 border border-gray-200 px-2 py-1">{post.nature_of_work}</span>
                {post.technical_skills && post.technical_skills !== 'nil' && (
                    <span className="text-xs bg-white text-gray-600 border border-gray-200 px-2 py-1">{post.technical_skills}</span>
                )}
            </div>

            {post.status === 'OPEN' && (
                <div className="border-t border-gray-100 pt-3 mt-2 flex justify-end">
                    <button
                        onClick={() => handleClosePosting(post.id)}
                        className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors"
                    >
                        Close Posting &times;
                    </button>
                </div>
            )}
        </div>
    );

    // Grab only the first 15 for the main dashboard view
    const recentPostings = postings.slice(0, 15);

    return (
        <div className="min-h-screen bg-white text-gray-900 p-8 max-w-6xl mx-auto relative">
            <div className="mb-8 border-b border-gray-200 pb-4 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-1">NGO Dashboard</h1>
                    <p className="text-gray-500 text-sm">Manage your organization's volunteer opportunities.</p>
                </div>
                <button
                    onClick={() => {
                        localStorage.removeItem("prayas_token");
                        router.push("/login/ngo");
                    }}
                    className="text-sm text-gray-500 hover:text-black underline"
                >
                    Logout
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* POSTING FORM */}
                <div className="col-span-1 border border-gray-200 p-6 h-fit">
                    <h2 className="text-lg font-semibold mb-6 border-b border-gray-100 pb-2">Post New Requirement</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Project Title</label>
                            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-black" placeholder="e.g., Tree Plantation Drive" required />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Location</label>
                            <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-black" placeholder="e.g., Hyderabad, Telangana" required />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Volunteers Needed</label>
                            <input type="number" value={formData.volunteersNeeded} onChange={(e) => setFormData({ ...formData, volunteersNeeded: e.target.value })} className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-black" placeholder="e.g., 5" required />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Expected Hours</label>
                            <input type="number" min="1" value={formData.expectedHours} onChange={(e) => setFormData({ ...formData, expectedHours: e.target.value })} className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-black rounded-none" placeholder="e.g., 5" required />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Required Skills</label>
                            <input type="text" value={formData.technicalSkills} onChange={(e) => setFormData({ ...formData, technicalSkills: e.target.value })} className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-black" placeholder="e.g., Web Development" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Nature of Work</label>
                            <select className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-black bg-white" value={formData.natureOfWork} onChange={(e) => setFormData({ ...formData, natureOfWork: e.target.value })} required>
                                <option value="" disabled>Select nature of work</option>
                                <option value="Education">Education / Training</option>
                                <option value="Environment">Environmental Conservation</option>
                                <option value="Healthcare">Health / Well-being</option>
                                <option value="Community Development">Community Development</option>
                                <option value="Disaster Relief/ Emergency Response">Disaster Relief/ Emergency Response</option>
                                <option value="Other">Other (please specify below)</option>
                            </select>
                        </div>
                        {formData.natureOfWork === "Other" && (
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Please Specify</label>
                                <input type="text" value={otherNatureOfWork} onChange={(e) => setOtherNatureOfWork(e.target.value)} className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-black" placeholder="e.g., Animal Welfare" required />
                            </div>
                        )}
                        <button type="submit" className="w-full bg-black text-white p-3 text-sm font-medium hover:bg-gray-800 transition-colors mt-4">
                            Post Requirement &rarr;
                        </button>
                    </form>
                </div>

                {/* RECENT POSTINGS FEED */}
                <div className="col-span-2">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-2">
                        <h2 className="text-lg font-semibold">Recent Postings</h2>
                        <span className="text-xs bg-gray-100 px-2 py-1 text-gray-600 rounded">{recentPostings.length} of {totalCount} Displayed</span>
                    </div>

                    {recentPostings.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-10 border border-dashed border-gray-300">No active postings yet.</p>
                    ) : (
                        <>
                            {recentPostings.map(renderPostingCard)}

                            {/* Show the Ledger button if there are more than 15 items, or just to view history */}
                            {totalCount > 15 && (
                                <button
                                    onClick={() => {
                                        const token = localStorage.getItem("prayas_token");
                                        fetchPostings(token as string, true); // Fetch all data
                                        setIsLedgerOpen(true);
                                    }}
                                    className="w-full mt-4 py-4 border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex justify-center items-center gap-2"
                                >
                                    View Full Posting Ledger ({totalCount} Total) &rarr;
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* SLIDING LEDGER WINDOW */}
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${isLedgerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsLedgerOpen(false)}
            ></div>

            {/* Slide-over Panel */}
            <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-gray-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isLedgerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-6 bg-white border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Posting Ledger</h2>
                        <p className="text-xs text-gray-500 mt-1">Complete history of all requirements.</p>
                    </div>
                    <button
                        onClick={() => setIsLedgerOpen(false)}
                        className="p-2 text-gray-400 hover:text-black transition-colors"
                    >
                        <span className="text-2xl leading-none">&times;</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {postings.map(renderPostingCard)}
                </div>
            </div>
        </div>
    );
}