"use client";
import { useState, useEffect } from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ActionSidebar from "@/components/ActionSidebar";

function NgoDashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<'postings' | 'volunteers' | 'logs'>('postings');
    const [volunteerSubTab, setVolunteerSubTab] = useState<'active' | 'action' | 'past'>('active');
    const [otherNatureOfWork, setOtherNatureOfWork] = useState("");

    useEffect(() => {
        const tab = searchParams.get('tab');
        const subtab = searchParams.get('subtab');
        
        if (tab === 'postings' || tab === 'volunteers' || tab === 'logs') {
            setActiveTab(tab);
        }
        if (subtab === 'active' || subtab === 'action' || subtab === 'past') {
            setVolunteerSubTab(subtab);
        }
    }, [searchParams]);

    // Data states
    const [postings, setPostings] = useState<any[]>([]);
    const [postingsMeta, setPostingsMeta] = useState<any>({ page: 1, totalPages: 1, total: 0 });

    const [pendingApps, setPendingApps] = useState<any[]>([]);
    const [pendingMeta, setPendingMeta] = useState<any>({ page: 1, totalPages: 1, total: 0 });

    const [historyApps, setHistoryApps] = useState<any[]>([]);
    const [historyMeta, setHistoryMeta] = useState<any>({ page: 1, totalPages: 1, total: 0 });

    const [pendingLogsApps, setPendingLogsApps] = useState<any[]>([]);
    const [selectedAppLogs, setSelectedAppLogs] = useState<any[]>([]);
    const [selectedAppLogsAppId, setSelectedAppLogsAppId] = useState<number | null>(null);

    const [activeVolunteers, setActiveVolunteers] = useState<any[]>([]);

    // Termination states
    const [terminationReason, setTerminationReason] = useState("");
    const [terminatingAppId, setTerminatingAppId] = useState<number | null>(null);

    // Form D States
    const [showFormD, setShowFormD] = useState<number | null>(null);
    const [viewFormDApp, setViewFormDApp] = useState<any | null>(null);
    const [formDData, setFormDData] = useState({
        taskDetails: "",
        quality: "",
        impact: "",
        suggestionsNHPC: ""
    });

    const [selectedApp, setSelectedApp] = useState<any | null>(null);
    const [ngoComment, setNgoComment] = useState("");
    const [showRejectInput, setShowRejectInput] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        location: "",
        volunteersNeeded: "",
        expectedHours: "",
        technicalSkills: "",
        natureOfWork: "",
        fromDate: "",
        toDate: "",
        medicalRequired: false,
    });
    const [editPostingId, setEditPostingId] = useState<number | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("prayas_token");
        if (!token) {
            router.push("/login/ngo");
            return;
        }
        if (activeTab === 'postings') fetchPostings(token, postingsMeta.page);
        if (activeTab === 'volunteers') {
            if (volunteerSubTab === 'active') fetchActiveVolunteers(token);
            if (volunteerSubTab === 'action') fetchPendingApps(token, pendingMeta.page);
            if (volunteerSubTab === 'past') fetchHistoryApps(token, historyMeta.page);
        }
        if (activeTab === 'logs') fetchPendingLogsApps(token);
    }, [router, activeTab, volunteerSubTab]);

    const fetchActiveVolunteers = async (token: string) => {
        const res = await fetch(`/api/applications/ngo/active-volunteers`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
            setActiveVolunteers(await res.json());
        }
    };

    const fetchPendingLogsApps = async (token: string, page = 1) => {
        const res = await fetch(`/api/logs/ngo/pending?page=${page}&limit=15`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
            const result = await res.json();
            setPendingLogsApps(result.data || result);
        }
    };

    const fetchAppLogs = async (token: string, appId: number) => {
        const res = await fetch(`/api/logs/application/${appId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
            const result = await res.json();
            setSelectedAppLogs(result.data || result);
            setSelectedAppLogsAppId(appId);
        }
    };

    const handleVerifyLogs = async (logIds: number[], status: 'APPROVED' | 'REJECTED') => {
        const token = localStorage.getItem("prayas_token");
        const res = await fetch(`/api/logs/ngo/verify`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ logIds, status })
        });
        if (res.ok) {
            alert(`Logs ${status.toLowerCase()} successfully`);
            fetchPendingLogsApps(token as string);
            if (selectedAppLogsAppId) fetchAppLogs(token as string, selectedAppLogsAppId);
        }
    };

    const fetchPendingApps = async (token: string, page = 1) => {
        const res = await fetch(`/api/applications/ngo/applications?type=pending&page=${page}&limit=15`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
            const data = await res.json();
            setPendingApps(data.data);
            setPendingMeta(data.meta);
        }
    };

    const fetchHistoryApps = async (token: string, page = 1) => {
        const res = await fetch(`/api/applications/ngo/applications?type=history&page=${page}&limit=15`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
            const data = await res.json();
            setHistoryApps(data.data);
            setHistoryMeta(data.meta);
        }
    };

    const fetchPostings = async (token: string, page = 1) => {
        const res = await fetch(`/api/postings?page=${page}&limit=15`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            const result = await res.json();
            setPostings(result.data);
            setPostingsMeta(result.meta);
        }
    };

    const handleNGOReview = async (applicationId: number, action: 'YES' | 'NO') => {
        if (action === 'NO' && !ngoComment.trim()) {
            alert("Please provide a reason for rejection.");
            return;
        }
        const token = localStorage.getItem("prayas_token");
        const res = await fetch(`/api/applications/${applicationId}/ngo-review`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ action, comment: ngoComment })
        });
        if (res.ok) {
            setNgoComment("");
            setShowRejectInput(false);
            setSelectedApp(null);
            fetchPendingApps(token as string, pendingMeta.page);
        }
    };

    const handleTerminate = async (appId: number) => {
        if (!terminationReason.trim()) {
            alert("Please provide a reason for ending the activity.");
            return;
        }
        const token = localStorage.getItem("prayas_token");
        try {
            const res = await fetch(`/api/applications/${appId}/terminate`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ reason: terminationReason })
            });

            if (res.ok) {
                alert("Activity ended successfully.");
                setTerminatingAppId(null);
                setTerminationReason("");
                fetchActiveVolunteers(token as string);
            } else {
                alert("Failed to end activity.");
            }
        } catch (error) {
            console.error("End Activity error", error);
        }
    };

    const handleFormDSubmit = async (e: any) => {
        e.preventDefault();
        const token = localStorage.getItem("prayas_token");
        try {
            const res = await fetch(`/api/applications/${showFormD}/completion/ngo`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ formData: formDData })
            });

            if (res.ok) {
                alert("Partner Organization Feedback (Form-D) submitted successfully.");
                setShowFormD(null);
                setFormDData({ taskDetails: "", quality: "", impact: "", suggestionsNHPC: "" });
                fetchHistoryApps(token as string, historyMeta.page);
            } else {
                alert("Failed to submit form.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const needsFormD = (item: any) => {
        const eligibleStatuses = [
            "TERMINATED_BY_EMPLOYEE",
            "TERMINATED_BY_NGO",
            "COMPLETED",
            "PENDING_RO_COMPLETION",
            "FORWARDED_TO_HR"
        ];

        let completionData = item.completion_data;
        if (typeof completionData === 'string') {
            try { completionData = JSON.parse(completionData); } catch (e) { }
        }

        const alreadySubmitted = completionData?.formD;
        return eligibleStatuses.includes(item.current_status) && !alreadySubmitted;
    };

    const hasFormD = (item: any) => {
        let completionData = item.completion_data;
        if (typeof completionData === 'string') {
            try { completionData = JSON.parse(completionData); } catch (e) { }
        }
        return !!completionData?.formD;
    };

    const handleViewMedicalCertificate = async (applicationId: number) => {
        const token = localStorage.getItem("prayas_token");
        try {
            const res = await fetch(`/api/applications/${applicationId}/medical-certificate`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                window.open(url);
            } else {
                alert("Unauthorized or file not found.");
            }
        } catch (error) {
            console.error("Failed to fetch medical certificate");
            alert("An error occurred while fetching the certificate.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("prayas_token");

        const url = editPostingId ? `/api/postings/${editPostingId}` : "/api/postings";
        const method = editPostingId ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                title: formData.title,
                location: formData.location,
                volunteersNeeded: parseInt(formData.volunteersNeeded),
                expectedHours: parseInt(formData.expectedHours),
                technicalSkills: formData.technicalSkills,
                natureOfWork: formData.natureOfWork === "Other" ? otherNatureOfWork : formData.natureOfWork,
                fromDate: formData.fromDate,
                toDate: formData.toDate,
                medicalRequired: formData.medicalRequired
            })
        });

        if (res.ok) {
            setFormData({
                title: "",
                location: "",
                volunteersNeeded: "",
                expectedHours: "",
                technicalSkills: "",
                natureOfWork: "",
                fromDate: "",
                toDate: "",
                medicalRequired: false
            });
            setOtherNatureOfWork("");
            setEditPostingId(null);
            fetchPostings(token as string, postingsMeta.page);
        }
    };

    const handleEditPosting = (post: any) => {
        setEditPostingId(post.id);
        const isStandardWork = ["Education", "Environment", "Healthcare", "Community Development", "Disaster Relief/ Emergency Response"].includes(post.nature_of_work);
        setFormData({
            title: post.title || "",
            location: post.location || "",
            volunteersNeeded: (post.volunteers_needed || "").toString(),
            expectedHours: (post.expected_hours || "").toString(),
            technicalSkills: post.technical_skills !== 'nil' ? (post.technical_skills || "") : "",
            natureOfWork: isStandardWork ? post.nature_of_work : "Other",
            fromDate: post.from_date ? new Date(post.from_date).toISOString().split('T')[0] : "",
            toDate: post.to_date ? new Date(post.to_date).toISOString().split('T')[0] : "",
            medicalRequired: post.medical_required === 1
        });
        if (!isStandardWork && post.nature_of_work) {
            setOtherNatureOfWork(post.nature_of_work);
        } else {
            setOtherNatureOfWork("");
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleClosePosting = async (postingId: number) => {
        const token = localStorage.getItem("prayas_token");

        const res = await fetch(`/api/postings/${postingId}/close`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) fetchPostings(token as string, postingsMeta.page);
    };

    const renderPostingCard = (post: any) => (
        <div key={post.id} className={`border p-5 mb-4 ${post.status === 'CLOSED' ? 'border-gray-200 bg-gray-50 opacity-75' : 'border-gray-200 bg-white'}`}>
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg max-w-[70%]">{post.title}</h3>
                {post.status === 'OPEN' ? (
                    <span className="text-xs text-green-700 bg-green-50 px-3 py-1.5 inline-flex items-center gap-3 border border-green-200 shadow-sm">
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            Open (Need {post.volunteers_needed} Volunteers)
                        </span>
                        <span className="font-bold border-l border-green-300 pl-3">
                            Active Volunteers: {post.active_volunteers || 0}
                        </span>
                    </span>
                ) : (
                    <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 inline-flex items-center gap-1 border border-gray-300">
                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                        Closed
                    </span>
                )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 shadow-sm">
                    <span className="font-semibold text-gray-500">Nature:</span> {post.nature_of_work}
                </span>
                <span className="text-xs bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 shadow-sm">
                    <span className="font-semibold text-gray-500">Required Skills:</span> {(post.technical_skills && post.technical_skills !== 'nil') ? post.technical_skills : ""}
                </span>
            </div>

            <div className="mt-4 mb-4 flex flex-col gap-1 text-sm text-gray-500">
                <span>📍 {post.location || "No location specified"}</span>
                <span>⏱️ {post.expected_hours} Expected Hours</span>
                <span>📅 From: {post.from_date ? new Date(post.from_date).toLocaleDateString() : 'N/A'} - To: {post.to_date ? new Date(post.to_date).toLocaleDateString() : 'N/A'}</span>
                <span> {post.medical_required === 1 ? 'Needs medical certificate' : 'Does not need medical certificate'}</span>
            </div>

            {post.status === 'OPEN' && (
                <div className="border-t border-gray-100 pt-3 mt-2 flex justify-start gap-4">
                    <button
                        onClick={() => handleEditPosting(post)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                        Edit Posting ✎
                    </button>
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

    const renderPagination = (meta: any, fetchFunc: (token: string, page: number) => void) => {
        if (!meta || meta.totalPages <= 1) return null;
        return (
            <div className="mt-6 flex items-center justify-between border border-gray-200 p-4 bg-gray-50">
                <span className="text-xs text-gray-500 font-medium">
                    Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} records
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => fetchFunc(localStorage.getItem("prayas_token") as string, meta.page - 1)}
                        disabled={meta.page <= 1}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-gray-300 bg-white hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        &larr; Prev
                    </button>
                    <span className="px-4 py-2 text-xs font-bold bg-gray-100 border border-gray-200">
                        {meta.page} / {meta.totalPages}
                    </span>
                    <button
                        onClick={() => fetchFunc(localStorage.getItem("prayas_token") as string, meta.page + 1)}
                        disabled={meta.page >= meta.totalPages}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-gray-300 bg-white hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        Next &rarr;
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-white overflow-hidden text-gray-900">
            {/* SIDEBAR */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col justify-between">
                <div>
                    <div className="p-6 border-b border-gray-200">
                        <h1 className="text-xl font-bold tracking-tight">NGO Dashboard</h1>
                        <p className="text-xs text-gray-500 mt-1">Manage your organization's volunteer opportunities.</p>
                    </div>
                    <nav className="mt-4">
                        <button
                            onClick={() => setActiveTab('postings')}
                            className={`w-full text-left px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'postings' ? 'bg-white border-l-4 border-black text-black' : 'text-gray-500 hover:bg-gray-200 hover:text-black border-l-4 border-transparent'}`}
                        >
                            Postings
                        </button>
                        <button
                            onClick={() => setActiveTab('volunteers')}
                            className={`w-full text-left px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors flex justify-between items-center ${activeTab === 'volunteers' ? 'bg-white border-l-4 border-black text-black' : 'text-gray-500 hover:bg-gray-200 hover:text-black border-l-4 border-transparent'}`}
                        >
                            Volunteers
                            {pendingMeta.total > 0 && <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingMeta.total}</span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('logs')}
                            className={`w-full text-left px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'logs' ? 'bg-white border-l-4 border-black text-black' : 'text-gray-500 hover:bg-gray-200 hover:text-black border-l-4 border-transparent'}`}
                        >
                            Log Verification
                        </button>
                    </nav>
                </div>
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={() => {
                            localStorage.removeItem("prayas_token");
                            router.push("/login/ngo");
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-200 transition-colors"
                    >
                        Logout &rarr;
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-10 bg-white">
                <div className="max-w-5xl mx-auto">
                    <ActionSidebar />

                    {/* POSTINGS TAB */}
                    {activeTab === 'postings' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* POSTING FORM */}
                            <div className="col-span-1 border border-gray-200 p-6 h-fit bg-gray-50">
                                <h2 className="text-lg font-semibold mb-6 border-b border-gray-200 pb-2">
                                    {editPostingId ? "Edit Requirement" : "Post New Requirement"}
                                </h2>
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">From Date</label>
                                            <input type="date" value={formData.fromDate} onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })} className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-black" required />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">To Date</label>
                                            <input type="date" value={formData.toDate} onChange={(e) => setFormData({ ...formData, toDate: e.target.value })} className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-black" required />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <input type="checkbox" id="medicalRequired" checked={formData.medicalRequired} onChange={(e) => setFormData({ ...formData, medicalRequired: e.target.checked })} className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black" />
                                        <label htmlFor="medicalRequired" className="text-xs text-gray-700 font-medium">Medical Report Required</label>
                                    </div>
                                    <button type="submit" className="w-full bg-black text-white p-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors mt-4">
                                        {editPostingId ? "Update Requirement" : "Post Requirement"} &rarr;
                                    </button>
                                    {editPostingId && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditPostingId(null);
                                                setFormData({ title: "", location: "", volunteersNeeded: "", expectedHours: "", technicalSkills: "", natureOfWork: "", fromDate: "", toDate: "", medicalRequired: false });
                                                setOtherNatureOfWork("");
                                            }}
                                            className="w-full bg-white text-black border border-gray-300 p-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors mt-2"
                                        >
                                            Cancel Edit
                                        </button>
                                    )}
                                </form>
                            </div>

                            {/* RECENT POSTINGS FEED */}
                            <div className="col-span-2">
                                <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
                                    <h2 className="text-xl font-bold">Recent Postings</h2>
                                </div>
                                {postings.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-10 border border-dashed border-gray-300">No active postings yet.</p>
                                ) : (
                                    <>
                                        {postings.map(renderPostingCard)}
                                        {renderPagination(postingsMeta, fetchPostings)}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* VOLUNTEERS TAB */}
                    {activeTab === 'volunteers' && (
                        <div>
                            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                                <div>
                                    <h2 className="text-2xl font-bold">Volunteers</h2>
                                    <p className="text-sm text-gray-500 mt-1">Manage all volunteer engagements.</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setVolunteerSubTab('active')}
                                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border ${volunteerSubTab === 'active' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-300 hover:border-black'}`}
                                    >
                                        Active Volunteers
                                    </button>
                                    <button
                                        onClick={() => setVolunteerSubTab('action')}
                                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border flex gap-2 items-center ${volunteerSubTab === 'action' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-300 hover:border-black'}`}
                                    >
                                        Action Needed
                                        {pendingMeta.total > 0 && <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">{pendingMeta.total}</span>}
                                    </button>
                                    <button
                                        onClick={() => setVolunteerSubTab('past')}
                                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border ${volunteerSubTab === 'past' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-300 hover:border-black'}`}
                                    >
                                        Past Volunteers
                                    </button>
                                </div>
                            </div>

                            {volunteerSubTab === 'action' && (
                                <div>
                                    {pendingApps.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-10 border border-dashed border-gray-300">No pending applications to review.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {pendingApps.map(app => (
                                                <div key={app.application_id} className="border border-red-200 bg-red-50 p-5 cursor-pointer hover:border-red-400 transition-colors" onClick={() => setSelectedApp(app)}>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-semibold text-lg">{app.posting_title}</h3>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                Applicant ID: {app.employee_id} • Status: RO Approved
                                                                <span className="block mt-1 text-xs text-gray-400">
                                                                    Applied: {app.timeline_log?.[0]?.date ? new Date(app.timeline_log[0].date).toLocaleDateString() : 'N/A'}
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <span className="text-xs bg-red-600 text-white px-3 py-1 font-bold uppercase tracking-wider">Review Required</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {renderPagination(pendingMeta, fetchPendingApps)}
                                        </div>
                                    )}
                                </div>
                            )}

                            {volunteerSubTab === 'past' && (
                                <div>
                                    {historyApps.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-10 border border-dashed border-gray-300">No past applications.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {historyApps.map(app => (
                                                <div key={app.application_id} className="border border-gray-200 bg-white p-5 cursor-pointer hover:border-black transition-colors" onClick={() => setSelectedApp(app)}>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-semibold text-lg">{app.posting_title}</h3>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                Applicant ID: {app.employee_id}
                                                                <span className="block mt-1 text-xs text-gray-400">
                                                                    Applied: {app.timeline_log?.[0]?.date ? new Date(app.timeline_log[0].date).toLocaleDateString() : 'N/A'}
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <span className={`text-[10px] font-bold tracking-wider px-2 py-1 uppercase border ${app.current_status.includes('rejected') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
                                                                }`}>
                                                                {app.current_status}
                                                            </span>
                                                            {needsFormD(app) && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setShowFormD(app.application_id); }}
                                                                    className="text-[10px] font-bold bg-black text-white px-2 py-1 uppercase tracking-wider hover:bg-gray-800 transition-colors"
                                                                >
                                                                    Submit Feedback (Form-D)
                                                                </button>
                                                            )}
                                                            {!needsFormD(app) && hasFormD(app) && (
                                                                <div className="flex gap-2">
                                                                    <Link
                                                                        href={`/evaluation/${app.application_id}`}
                                                                        className="text-[10px] font-bold bg-white text-black border border-black px-2 py-1 uppercase tracking-wider hover:bg-gray-100 transition-colors"
                                                                    >
                                                                        Form-G
                                                                    </Link>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); setViewFormDApp(app); }}
                                                                        className="text-[10px] font-bold bg-gray-200 text-black px-2 py-1 uppercase tracking-wider hover:bg-gray-300 transition-colors"
                                                                    >
                                                                        View Feedback (Form-D)
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {renderPagination(historyMeta, fetchHistoryApps)}
                                        </div>
                                    )}
                                </div>
                            )}

                            {volunteerSubTab === 'active' && (
                                <div>
                                    {activeVolunteers.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-10 border border-dashed border-gray-300">No active volunteers at the moment.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {activeVolunteers.map(vol => {
                                                let empName = "Unknown";
                                                let empContact = "N/A";
                                                let empEmail = "N/A";
                                                if (vol.form_data) {
                                                    try {
                                                        const parsed = typeof vol.form_data === 'string' ? JSON.parse(vol.form_data) : vol.form_data;
                                                        const d = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
                                                        if (d && d.name) empName = d.name;
                                                        if (d && d.contact) empContact = d.contact;
                                                        if (d && d.email) empEmail = d.email;
                                                    } catch (e) { }
                                                }
                                                return (
                                                    <div key={vol.application_id} className="border border-green-200 bg-green-50 p-5">
                                                        <div className="flex justify-between items-start mb-4 border-b border-green-200 pb-3">
                                                            <div>
                                                                <h3 className="font-bold text-lg text-green-900">{empName}</h3>
                                                                <p className="text-sm text-green-700">ID: {vol.employee_id}</p>
                                                                <p className="text-[10px] text-green-700 font-bold tracking-widest mt-1">
                                                                    APPLIED: {vol.timeline_log?.[0]?.date ? new Date(vol.timeline_log[0].date).toLocaleDateString() : 'N/A'}
                                                                </p>
                                                            </div>
                                                            <span className="text-[10px] font-bold bg-green-200 text-green-800 px-2 py-1 uppercase tracking-wider">Active</span>
                                                        </div>
                                                        <div className="space-y-2 text-sm text-gray-700 mb-4">
                                                            <div><span className="font-semibold">Activity:</span> {vol.posting_title}</div>
                                                            <div><span className="font-semibold">Location:</span> {vol.posting_location}</div>
                                                            <div><span className="font-semibold">Contact:</span> {empContact}</div>
                                                            <div><span className="font-semibold">Email:</span> {empEmail}</div>
                                                        </div>
                                                        <button
                                                            onClick={() => setSelectedApp(vol)}
                                                            className="w-full bg-white border border-green-300 text-green-800 text-xs font-bold uppercase tracking-wider py-2 hover:bg-green-100 transition-colors mb-2"
                                                        >
                                                            View Details
                                                        </button>

                                                        {terminatingAppId !== vol.application_id ? (
                                                            <button
                                                                onClick={() => setTerminatingAppId(vol.application_id)}
                                                                className="w-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider py-2 hover:bg-red-100 transition-colors"
                                                            >
                                                                End Activity
                                                            </button>
                                                        ) : (
                                                            <div className="mt-2 bg-red-100 p-3">
                                                                <p className="text-red-700 text-xs font-bold mb-2">This will end future dates for current activity.</p>
                                                                <textarea
                                                                    value={terminationReason}
                                                                    onChange={(e) => e.target.value.split(/\s+/).filter(w => w).length <= 400 && setTerminationReason(e.target.value)}
                                                                    placeholder="Comments required... (Max 400 words)"
                                                                    className="w-full border border-red-300 p-2 text-xs focus:border-red-500 outline-none mb-2"
                                                                    rows={2}
                                                                />
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => { setTerminatingAppId(null); setTerminationReason(""); }}
                                                                        className="flex-1 px-2 py-1 text-xs font-bold border border-red-300 text-red-700 hover:bg-red-200 transition-colors"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleTerminate(vol.application_id)}
                                                                        className="flex-1 bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors"
                                                                    >
                                                                        Confirm
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* LOGS VERIFICATION TAB */}
                    {activeTab === 'logs' && !selectedAppLogsAppId && (
                        <div>
                            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                                <div>
                                    <h2 className="text-2xl font-bold">Volunteer Log Verification</h2>
                                    <p className="text-sm text-gray-500 mt-1">Review and approve daily volunteer logs.</p>
                                </div>
                            </div>

                            {pendingLogsApps.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-10 border border-dashed border-gray-300">No applications with pending logs.</p>
                            ) : (
                                <div className="space-y-4">
                                    {pendingLogsApps.map(app => (
                                        <div key={app.application_id} className="border border-blue-200 bg-blue-50 p-5 cursor-pointer hover:border-blue-400 transition-colors" onClick={() => fetchAppLogs(localStorage.getItem('prayas_token') as string, app.application_id)}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-lg">{app.posting_title}</h3>
                                                    <p className="text-sm text-gray-600 mt-1">Applicant ID: {app.employee_id}</p>
                                                </div>
                                                <span className="text-xs bg-blue-600 text-white px-3 py-1 font-bold uppercase tracking-wider">Pending Logs</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'logs' && selectedAppLogsAppId && (
                        <div>
                            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                                <div>
                                    <button onClick={() => setSelectedAppLogsAppId(null)} className="text-gray-500 hover:text-black font-bold text-sm mb-2">&larr; Back to Applications</button>
                                    <h2 className="text-2xl font-bold">Application Logs</h2>
                                    <p className="text-sm text-gray-500 mt-1 mb-2">Review logs for Application #{selectedAppLogsAppId}</p>
                                    {(() => {
                                        const app = pendingLogsApps.find(a => a.application_id === selectedAppLogsAppId);
                                        let empName = "Unknown";
                                        let empId = app?.employee_id || "Unknown";
                                        if (app && app.form_data) {
                                            try {
                                                const parsed = typeof app.form_data === 'string' ? JSON.parse(app.form_data) : app.form_data;
                                                const d = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
                                                if (d && d.name) empName = d.name;
                                            } catch (e) { }
                                        }
                                        return (
                                            <div className="bg-gray-100 px-4 py-2 border-l-4 border-black inline-block">
                                                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mr-2">Employee:</span>
                                                <span className="font-bold">{empName}</span> <span className="text-gray-500 text-sm">({empId})</span>
                                            </div>
                                        );
                                    })()}
                                </div>
                                <div>
                                    <button onClick={() => handleVerifyLogs(selectedAppLogs.filter(l => l.ngo_status === 'PENDING').map(l => l.id), 'APPROVED')} className="bg-green-600 text-white px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-green-700 transition-colors">
                                        Batch Approve All Pending
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {selectedAppLogs.map(log => (
                                    <div key={log.id} className="border border-gray-200 bg-white p-5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">{log.log_date.split('T')[0]}</div>
                                                <h3 className="font-bold text-lg mb-2">{log.activity_name}</h3>
                                                <div className="flex gap-4 text-sm text-gray-600">
                                                    <span>IN: {log.check_in_time}</span>
                                                    <span>OUT: {log.check_out_time}</span>
                                                    <span className="font-bold text-black border-l border-gray-300 pl-4">Total: {log.total_hours} hrs</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`text-[10px] font-bold tracking-wider px-2 py-1 uppercase border ${log.ngo_status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                    log.ngo_status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        'bg-red-50 text-red-700 border-red-200'
                                                    }`}>
                                                    {log.ngo_status}
                                                </span>
                                                {log.ngo_status === 'PENDING' && (
                                                    <div className="flex gap-2 mt-2">
                                                        <button onClick={() => handleVerifyLogs([log.id], 'REJECTED')} className="text-xs font-bold text-red-600 border border-red-600 px-3 py-1 hover:bg-red-50">REJECT</button>
                                                        <button onClick={() => handleVerifyLogs([log.id], 'APPROVED')} className="text-xs font-bold text-white bg-green-600 px-3 py-1 hover:bg-green-700">APPROVE</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* FORM D MODAL */}
            {showFormD && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-300 p-8">
                        <div className="flex justify-between items-start mb-6 border-b border-gray-200 pb-4">
                            <div>
                                <h3 className="text-xl font-bold uppercase tracking-widest">Partner Organization Feedback</h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Form-D</p>
                            </div>
                            <button onClick={() => setShowFormD(null)} className="text-gray-400 hover:text-black">&times;</button>
                        </div>

                        <form onSubmit={handleFormDSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Task Completion Details</label>
                                <textarea required placeholder="Max 400 words" value={formDData.taskDetails} onChange={(e) => e.target.value.split(/\s+/).filter(w => w).length <= 400 && setFormDData({ ...formDData, taskDetails: e.target.value })} className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none" rows={3}></textarea>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Quality & Professionalism Exhibited</label>
                                <textarea required placeholder="Max 400 words" value={formDData.quality} onChange={(e) => e.target.value.split(/\s+/).filter(w => w).length <= 400 && setFormDData({ ...formDData, quality: e.target.value })} className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none" rows={3}></textarea>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Impact Observed</label>
                                <textarea required placeholder="Max 400 words" value={formDData.impact} onChange={(e) => e.target.value.split(/\s+/).filter(w => w).length <= 400 && setFormDData({ ...formDData, impact: e.target.value })} className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none" rows={3}></textarea>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Suggestions for NHPC</label>
                                <textarea required placeholder="Max 400 words" value={formDData.suggestionsNHPC} onChange={(e) => e.target.value.split(/\s+/).filter(w => w).length <= 400 && setFormDData({ ...formDData, suggestionsNHPC: e.target.value })} className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none" rows={2}></textarea>
                            </div>

                            <div className="pt-4 border-t border-gray-200 flex justify-end gap-4">
                                <button type="button" onClick={() => setShowFormD(null)} className="px-6 py-2 text-sm font-bold border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="bg-black text-white px-8 py-2 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors">
                                    Submit Feedback
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* VIEW FORM D MODAL (READ ONLY) */}
            {viewFormDApp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-300 p-8">
                        <div className="flex justify-between items-start mb-6 border-b border-gray-200 pb-4">
                            <div>
                                <h3 className="text-xl font-bold uppercase tracking-widest">Partner Organization Feedback</h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Form-D (Submitted)</p>
                            </div>
                            <button onClick={() => setViewFormDApp(null)} className="text-gray-400 hover:text-black">&times;</button>
                        </div>
                        {(() => {
                            let cd = viewFormDApp.completion_data;
                            if (typeof cd === 'string') {
                                try { cd = JSON.parse(cd); } catch (e) { }
                            }
                            const formD = cd?.formD || {};
                            return (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Details of Tasks Assigned</h4>
                                        <p className="text-sm bg-gray-50 p-3 border border-gray-200">{formD.taskDetails || "N/A"}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Quality of Work & Dedication</h4>
                                        <p className="text-sm bg-gray-50 p-3 border border-gray-200">{formD.quality || "N/A"}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Impact on NGO/Community</h4>
                                        <p className="text-sm bg-gray-50 p-3 border border-gray-200">{formD.impact || "N/A"}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Suggestions for NHPC</h4>
                                        <p className="text-sm bg-gray-50 p-3 border border-gray-200">{formD.suggestionsNHPC || "N/A"}</p>
                                    </div>
                                    <div className="mt-8 border-t border-gray-200 pt-4 text-right">
                                        <button onClick={() => setViewFormDApp(null)} className="bg-black text-white px-6 py-2 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors">
                                            Close
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* FULL FORM A OVERLAY MODAL (READ ONLY) */}
            {selectedApp && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-start p-4 md:p-10 overflow-y-auto backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl border border-gray-300 shadow-2xl relative my-auto">
                        <div className="flex justify-between items-center border-b border-gray-200 p-6 bg-gray-50 sticky top-0 z-10 shadow-sm">
                            <div>
                                <h2 className="text-xl font-bold uppercase tracking-tight">Form A: Volunteer Application</h2>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">
                                    System Record #{selectedApp.application_id}
                                </p>
                            </div>
                            <button onClick={() => { setSelectedApp(null); setShowRejectInput(false); setNgoComment(""); }} className="text-gray-400 hover:text-black font-bold text-2xl transition-colors">
                                &times;
                            </button>
                        </div>

                        <div className="p-6 md:p-8 space-y-8 opacity-95">
                            {/* SECTION A & B */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-gray-300 pb-2 mb-4">Section A: Employee Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {(() => {
                                        let formData: any = {};
                                        if (selectedApp.form_data) {
                                            try {
                                                formData = typeof selectedApp.form_data === 'string'
                                                    ? JSON.parse(selectedApp.form_data)
                                                    : selectedApp.form_data;
                                                if (typeof formData === 'string') {
                                                    formData = JSON.parse(formData);
                                                }
                                            } catch (e) { }
                                        }
                                        return (
                                            <>
                                                <div><span className="text-gray-500">Name:</span> <strong>{formData.name || "N/A"}</strong></div>
                                                <div><span className="text-gray-500">ID:</span> <strong>{formData.id || selectedApp.employee_id}</strong></div>
                                                <div><span className="text-gray-500">Designation:</span> <strong>{formData.designation || "N/A"}</strong></div>
                                                <div><span className="text-gray-500">Department:</span> <strong>{formData.department || "N/A"}</strong></div>
                                                <div><span className="text-gray-500">Contact:</span> <strong>{formData.contact || "N/A"}</strong></div>
                                                <div><span className="text-gray-500">Email:</span> <strong>{formData.email || "N/A"}</strong></div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-gray-300 pb-2 mb-4">Section B: Activity Details</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="col-span-2"><span className="text-gray-500">Activity:</span> <strong>{selectedApp.posting_title}</strong></div>
                                    <div><span className="text-gray-500">NGO:</span> <strong>{selectedApp.ngo_name}</strong></div>
                                    <div><span className="text-gray-500">Location:</span> <strong>{selectedApp.posting_location || "N/A"}</strong></div>
                                    <div><span className="text-gray-500">Expected Hours:</span> <strong>{selectedApp.expected_hours} Hrs</strong></div>
                                    <div><span className="text-gray-500">Nature of Work:</span> <strong>{selectedApp.nature_of_work || "N/A"}</strong></div>
                                    {(() => {
                                        let formData: any = {};
                                        if (selectedApp.form_data) {
                                            try {
                                                formData = typeof selectedApp.form_data === 'string'
                                                    ? JSON.parse(selectedApp.form_data)
                                                    : selectedApp.form_data;
                                                if (typeof formData === 'string') {
                                                    formData = JSON.parse(formData);
                                                }
                                            } catch (e) { }
                                        }
                                        return (
                                            <>
                                                <div className="col-span-2">
                                                    <span className="text-gray-500 block mb-1">Dates Applied:</span> 
                                                    <div className="flex flex-wrap gap-2">
                                                        {formData.dates?.dates?.length > 0 ? (
                                                            [...formData.dates.dates].sort().map((d: string) => (
                                                                <span key={d} className="bg-gray-200 text-gray-800 px-2 py-1 text-xs font-bold rounded-sm">
                                                                    {new Date(d).toLocaleDateString()}
                                                                </span>
                                                            ))
                                                        ) : (formData.fromDate && formData.toDate) ? (
                                                            <strong>{new Date(formData.fromDate).toLocaleDateString()} to {new Date(formData.toDate).toLocaleDateString()}</strong>
                                                        ) : (
                                                            <strong>N/A</strong>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* SECTION D - RO REVIEW COMMENTS */}
                            {(() => {
                                let fData = selectedApp.form_data;
                                if (typeof fData === 'string') {
                                    try { fData = JSON.parse(fData); } catch (e) {}
                                }
                                if (fData?.sectionD) {
                                    return (
                                        <div>
                                            <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-gray-300 pb-2 mb-4">Section D: For Office Use Only (Reporting Officer)</h3>
                                            <div className="bg-gray-50 border border-gray-200 p-6 text-sm">
                                                <div className="space-y-4">
                                                    <div><span className="font-bold text-gray-700 block mb-1">Status:</span> <span className={`inline-block px-2 py-1 text-xs font-bold uppercase tracking-wider ${fData.sectionD.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{fData.sectionD.status}</span></div>
                                                    <div><span className="font-bold text-gray-700 block mb-1">Comments:</span> <p className="text-gray-900 bg-white p-4 border border-gray-200">{fData.sectionD.comments || "None"}</p></div>
                                                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                                                        <div><span className="font-bold text-gray-500 text-[10px] uppercase tracking-wider block mb-1">Signature</span> <div className="font-medium">{fData.sectionD.signature || "Digital Signature"}</div></div>
                                                        <div><span className="font-bold text-gray-500 text-[10px] uppercase tracking-wider block mb-1">Date</span> <div className="font-medium">{new Date(fData.sectionD.date).toLocaleDateString()}</div></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            {/* SECTION C */}
                            {selectedApp.medical_certificate_path && (
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-gray-300 pb-2 mb-4">Section C: Attachments</h3>
                                    <div className="text-sm">
                                        <span className="text-gray-500 mr-2">Medical Certificate:</span>
                                        <button
                                            onClick={() => handleViewMedicalCertificate(selectedApp.application_id)}
                                            className="text-blue-600 font-bold hover:underline pointer-events-auto"
                                        >
                                            View PDF Document
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons (Only for pending apps) */}
                            {selectedApp.current_status === 'RO_APPROVED' && (
                                <div className="pt-4 border-t border-gray-200">
                                    {showRejectInput ? (
                                        <div className="space-y-4">
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest">Reason for Rejection (Max 400 words)</label>
                                            <textarea
                                                className="w-full border border-gray-300 p-3 text-sm outline-none focus:border-red-500 rounded-none"
                                                rows={3}
                                                value={ngoComment}
                                                onChange={(e) => {
                                                    const words = e.target.value.split(/\s+/).filter(w => w);
                                                    if (words.length <= 400) setNgoComment(e.target.value);
                                                }}
                                                placeholder="Please briefly explain why you are rejecting this application... (Max 400 words)"
                                            ></textarea>
                                            <div className="flex gap-4 justify-end">
                                                <button onClick={() => { setShowRejectInput(false); setNgoComment(""); }} className="text-gray-500 hover:text-black font-medium text-sm">
                                                    Cancel
                                                </button>
                                                <button onClick={() => handleNGOReview(selectedApp.application_id, 'NO')} className="bg-red-600 text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-colors">
                                                    Confirm Rejection
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-4 justify-end">
                                            <button onClick={() => setShowRejectInput(true)} className="border-2 border-red-600 text-red-600 px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-red-50 transition-colors">
                                                NO - Reject
                                            </button>
                                            <button onClick={() => handleNGOReview(selectedApp.application_id, 'YES')} className="bg-green-600 text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-green-700 transition-colors">
                                                YES - Accept Volunteer
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function NgoDashboard() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center text-gray-500">Loading Dashboard...</div>}>
            <NgoDashboardContent />
        </Suspense>
    );
}