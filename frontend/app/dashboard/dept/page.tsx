"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ActionSidebar from "@/components/ActionSidebar";

export default function DepartmentDashboard() {
    const router = useRouter();
    const [applications, setApplications] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });
    const [loading, setLoading] = useState(false);
    const [selectedApp, setSelectedApp] = useState<any | null>(null);
    const [selectedAppModalTab, setSelectedAppModalTab] = useState<'details' | 'logs' | 'completion'>('details');
    const [appLogs, setAppLogs] = useState<any[]>([]);

    // Admin Modals
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [thresholdInput, setThresholdInput] = useState("40");
    const [showNgoModal, setShowNgoModal] = useState(false);
    const [ngoForm, setNgoForm] = useState({ name: "", email: "", password: "", confirmPassword: "", representative_name: "", representative_mobile: "", location: "" });

    const fetchLogsForApp = async (appId: number) => {
        const token = localStorage.getItem("prayas_token");
        const res = await fetch(`/api/logs/application/${appId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
            const result = await res.json();
            setAppLogs(result.data || result);
        }
    };

    const fetchAllApplications = async (token: string, page = 1, search = "") => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: "25",
                ...(search ? { search } : {}),
            });
            const res = await fetch(`/api/applications/all?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setApplications(data.data || []);
                setMeta(data.meta || { total: 0, page: 1, limit: 25, totalPages: 1 });
            }
        } catch (error) {
            console.error("Failed to fetch applications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("prayas_token");
        if (!token) {
            router.push("/login/dept");
            return;
        }
        fetchAllApplications(token, 1, "");

        // Fetch settings
        fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                if (data.certificate_threshold) setThresholdInput(data.certificate_threshold);
            })
            .catch(err => console.error(err));
    }, [router]);

    useEffect(() => {
        const token = localStorage.getItem("prayas_token");
        if (!token) return;
        const timer = setTimeout(() => {
            fetchAllApplications(token, 1, searchTerm);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handlePageChange = (newPage: number) => {
        const token = localStorage.getItem("prayas_token");
        if (!token) return;
        fetchAllApplications(token, newPage, searchTerm);
    };

    // NEW: Securely fetch and open the medical certificate
    const handleViewCertificate = async (appId: number) => {
        const token = localStorage.getItem("prayas_token");
        try {
            const res = await fetch(`/api/applications/${appId}/medical-certificate`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank'); // Opens the PDF in a new tab
            } else {
                alert("Failed to load certificate. Ensure the backend is running.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-8">
            <div className="max-w-7xl mx-auto">
                <ActionSidebar />

                {/* Header */}
                <div className="bg-white border border-gray-200 p-6 mb-6 flex justify-between items-center shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold uppercase tracking-tight">Prayas Oversight Console</h1>
                        <p className="text-xs text-gray-500 font-bold tracking-widest mt-1">Department / HR View</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowNgoModal(true)}
                            className="bg-black text-white text-xs font-bold uppercase tracking-wider py-2 px-4 hover:bg-gray-800 transition-colors"
                        >
                            + Add NGO
                        </button>
                        <button
                            onClick={() => setShowSettingsModal(true)}
                            className="border-2 border-black text-black text-xs font-bold uppercase tracking-wider py-2 px-4 hover:bg-gray-100 transition-colors"
                        >
                            Set Cert. Threshold
                        </button>
                        <button
                            onClick={() => {
                                localStorage.removeItem("prayas_token");
                                router.push("/login/dept");
                            }}
                            className="text-sm font-bold text-gray-500 hover:text-black uppercase tracking-wider transition-colors ml-4"
                        >
                            Logout &rarr;
                        </button>
                    </div>
                </div>

                {/* Search & Record Count */}
                <div className="bg-white border border-gray-200 p-4 mb-6 flex gap-4 shadow-sm">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search by Employee ID (e.g., NHPC1001) or NGO Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-4 pr-10 py-3 text-sm outline-none border border-gray-300 focus:border-black transition-colors rounded-none"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {loading ? "⏳" : "🔍"}
                        </span>
                    </div>
                    <div className="px-6 py-3 bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 whitespace-nowrap">
                        {meta.total} Records Found
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 shadow-sm overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-gray-100 border-b-2 border-black">
                                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-600">App ID</th>
                                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-600">Employee ID</th>
                                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-600">Reporting Officer</th>
                                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-600">NGO Partner</th>
                                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-600">Opportunity</th>
                                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-600">Date Applied</th>
                                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-600 text-right">Current Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-sm text-gray-400 font-medium border-b border-gray-200">
                                        Loading...
                                    </td>
                                </tr>
                            ) : applications.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-sm text-gray-500 font-medium border-b border-gray-200">
                                        No applications found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                applications.map((item) => {
                                    const dateApplied = item.timeline_log?.[0]?.date
                                        ? new Date(item.timeline_log[0].date).toLocaleDateString()
                                        : "Unknown";

                                    return (
                                        <tr
                                            key={item.application_id}
                                            onClick={() => setSelectedApp(item)}
                                            className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            <td className="py-4 px-6 text-sm text-gray-500 font-medium">#{item.application_id}</td>
                                            <td className="py-4 px-6 text-sm font-bold text-black">{item.employee_id || "N/A"}</td>
                                            <td className="py-4 px-6 text-sm text-gray-700">{item.ro_name || "N/A"}</td>
                                            <td className="py-4 px-6 text-sm text-gray-700">{item.ngo_name}</td>
                                            <td className="py-4 px-6 text-sm text-gray-700">{item.posting_title}</td>
                                            <td className="py-4 px-6 text-sm text-gray-500">{dateApplied}</td>
                                            <td className="py-4 px-6 text-right">
                                                <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider border ${item.current_status === "ALL SET" || item.current_status === "COMPLETED"
                                                    ? "border-green-300 bg-green-50 text-green-700"
                                                    : item.current_status === "REJECTED"
                                                        ? "border-red-300 bg-red-50 text-red-700"
                                                        : item.current_status === "MANAGER_REVIEW" || item.current_status === "PENDING_MEDICAL"
                                                            ? "border-yellow-300 bg-yellow-50 text-yellow-700"
                                                            : "border-blue-300 bg-blue-50 text-blue-700"
                                                    }`}>
                                                    {item.current_status.replace(/_/g, " ")}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!searchTerm && meta.totalPages > 1 && (
                    <div className="bg-white border border-gray-200 border-t-0 shadow-sm px-6 py-4 flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium">
                            Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} records
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(meta.page - 1)}
                                disabled={meta.page <= 1}
                                className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-gray-300 hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                &larr; Prev
                            </button>
                            <span className="px-4 py-2 text-xs font-bold bg-gray-100 border border-gray-200">
                                {meta.page} / {meta.totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(meta.page + 1)}
                                disabled={meta.page >= meta.totalPages}
                                className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-gray-300 hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                Next &rarr;
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* FULL FORM A OVERLAY MODAL (READ ONLY) */}
            {selectedApp && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-start p-4 md:p-10 overflow-y-auto backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl border border-gray-300 shadow-2xl relative my-auto">

                        <div className="flex justify-between items-center border-b border-gray-200 p-6 bg-gray-50 sticky top-0 z-10 shadow-sm">
                            <div>
                                <h2 className="text-xl font-bold uppercase tracking-tight">Form A: Volunteer Application</h2>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">
                                    System Record #{selectedApp.application_id} &bull; Status: <span className="font-bold text-black">{selectedApp.current_status.replace(/_/g, ' ')}</span>
                                </p>
                            </div>
                            <button onClick={() => { setSelectedApp(null); setSelectedAppModalTab('details'); }} className="text-gray-400 hover:text-black font-bold text-2xl transition-colors">
                                &times;
                            </button>
                        </div>

                        {/* MODAL TABS */}
                        <div className="flex border-b border-gray-200 bg-gray-50 px-6">
                            <button 
                                onClick={() => setSelectedAppModalTab('details')}
                                className={`px-4 py-3 text-sm font-bold uppercase tracking-wider ${selectedAppModalTab === 'details' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}
                            >
                                Application Details
                            </button>
                            <button 
                                onClick={() => {
                                    setSelectedAppModalTab('logs');
                                    fetchLogsForApp(selectedApp.application_id);
                                }}
                                className={`px-4 py-3 text-sm font-bold uppercase tracking-wider ${selectedAppModalTab === 'logs' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}
                            >
                                Form-B Volunteer Logs
                            </button>
                            <button 
                                onClick={() => setSelectedAppModalTab('completion')}
                                className={`px-4 py-3 text-sm font-bold uppercase tracking-wider ${selectedAppModalTab === 'completion' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}
                            >
                                Form-C & D Completion
                            </button>
                        </div>

                        <div className="p-6 md:p-8 space-y-8 opacity-95">

                            {selectedAppModalTab === 'details' ? (
                                <>
                                    {/* SECTION A: Employee Info */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Section A: Employee Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Name</label>
                                        <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50 font-bold text-black">{selectedApp.form_data?.name || "N/A"}</div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Employee ID</label>
                                        <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50 font-bold text-black">{selectedApp.employee_id || "N/A"}</div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Application Date</label>
                                        <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50">
                                            {selectedApp.timeline_log?.[0]?.date ? new Date(selectedApp.timeline_log[0].date).toLocaleString() : "Unknown"}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Designation</label>
                                        <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50">{selectedApp.form_data?.designation || "N/A"}</div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Department</label>
                                        <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50">{selectedApp.form_data?.department || "N/A"}</div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Contact Number</label>
                                        <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50">{selectedApp.form_data?.contact || "N/A"}</div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Official Email</label>
                                        <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50">{selectedApp.form_data?.email || "N/A"}</div>
                                    </div>
                                    <div className="col-span-2 mt-4 pt-4 border-t border-gray-200">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Reporting Officer</label>
                                        <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50 font-medium">
                                            {selectedApp.ro_name || "Not Assigned"} {selectedApp.ro_employee_id ? `(${selectedApp.ro_employee_id})` : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION B: Activity Details */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Section B: Activity Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Activity Name</label>
                                        <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50 font-bold text-black">{selectedApp.posting_title}</div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Partner Organization</label>
                                        <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50">{selectedApp.ngo_name}</div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Location</label>
                                        <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50">{selectedApp.posting_location || "Not specified"}</div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Nature of Work</label>
                                        <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50">{selectedApp.nature_of_work || "N/A"}</div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Expected Hours</label>
                                        <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50">{selectedApp.expected_hours || 0} Hrs</div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Required Skills</label>
                                        <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50">{selectedApp.technical_skills || "None specified"}</div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">From Date</label>
                                        <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50 font-bold text-black">{selectedApp.form_data?.dates?.dates?.length > 0 ? new Date(Math.min(...selectedApp.form_data.dates.dates.map((d: string) => new Date(d).getTime()))).toLocaleDateString() : "N/A"}</div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">To Date</label>
                                        <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50 font-bold text-black">{selectedApp.form_data?.dates?.dates?.length > 0 ? new Date(Math.max(...selectedApp.form_data.dates.dates.map((d: string) => new Date(d).getTime()))).toLocaleDateString() : "N/A"}</div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION C: Declarations */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Section C: Declarations</h3>
                                <div className="space-y-3 pointer-events-none">
                                    {[
                                        "I confirm that my participation is voluntary and will not interfere with my official responsibilities.",
                                        "I understand that for physically strenuous or high-risk activities(e.g., disaster relief, extensive travel, emergency response), I may required to submit a Medical Fitness Certificate issued by a Registered Medical Practitioner.",
                                        "I undertake to comply with all safety guidelines, organizational protocols, and the PRAYAS Code of Conduct/ Volunteer Guidance (Form-E)",
                                        "I undertake the full responsibility of my own travel and related expenses.",
                                        "I undertake to adhere to safety, ethical, and cultural protocols",
                                        "I undertake for timely submission of reports"
                                    ].map((desc, i) => (
                                        <label key={i} className="flex items-start gap-3">
                                            <input type="checkbox" checked readOnly className="mt-1 w-4 h-4 rounded-none border-2 border-gray-300 text-black focus:ring-black accent-black" />
                                            <span className="text-sm text-gray-900 font-medium">{desc}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* SECTION D: Office Use / Approval Log */}
                            <div className="bg-gray-100 border border-gray-200 p-6 mt-8">
                                <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-6">
                                    Section-D: Approval from Reporting Officer
                                </h3>

                                {(() => {
                                    const step2 = selectedApp.timeline_log?.find((step: any) => step.step === 2);
                                    const isPending = !step2 || step2.status === "PENDING" || selectedApp.current_status === "APPLIED";
                                    
                                    let comments = "";
                                    let permission = "";
                                    if (step2?.note && !isPending) {
                                        const parts = step2.note.split("Remarks: ");
                                        if (parts.length > 1) {
                                            comments = parts[1];
                                            if (comments === "None") comments = "";
                                        } else {
                                            comments = step2.note;
                                        }
                                    }
                                    if (step2?.status === "COMPLETED") permission = "Yes";
                                    else if (step2?.status === "REJECTED") permission = "No";

                                    return (
                                        <div className="space-y-6 pointer-events-none">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                                                    Comments (if any)
                                                </label>
                                                <div className="w-full border-b border-gray-400 p-2 text-sm bg-transparent min-h-[30px]">
                                                    {comments}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                                                    Permission Granted
                                                </label>
                                                <div className="flex gap-6 text-sm">
                                                    <label className="flex items-center gap-2">
                                                        <input type="checkbox" readOnly checked={permission === "Yes"} className="w-4 h-4 text-black focus:ring-black accent-black" />
                                                        <span>Yes</span>
                                                    </label>
                                                    <label className="flex items-center gap-2">
                                                        <input type="checkbox" readOnly checked={permission === "No"} className="w-4 h-4 text-black focus:ring-black accent-black" />
                                                        <span>No</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Name of Reporting Officer</label>
                                                    <div className="text-sm font-medium border-b border-gray-400 pb-1 h-[25px]">{!isPending ? (step2?.ro_name || "Digital Approval Logged") : ""}</div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Designation</label>
                                                    <div className="text-sm font-medium border-b border-gray-400 pb-1 h-[25px]">{!isPending ? (step2?.ro_designation || "Reporting Officer") : ""}</div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Date</label>
                                                    <div className="text-sm font-medium border-b border-gray-400 pb-1 h-[25px]">{!isPending && step2?.date ? new Date(step2.date).toLocaleDateString() : ""}</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                                
                                {/* NGO REJECTION REASON */}
                                {(() => {
                                    const step6 = selectedApp.timeline_log?.find((step: any) => step.step === 6);
                                    if (step6?.status === "REJECTED" && step6.note) {
                                        const parts = step6.note.split("Reason: ");
                                        const reason = parts.length > 1 ? parts[1] : step6.note;
                                        return (
                                            <div className="bg-red-50 border border-red-200 p-6 mt-6">
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-red-800 border-b-2 border-red-200 pb-2 mb-4">
                                                    Section-E: NGO Review (Rejected)
                                                </h3>
                                                <div className="text-sm text-red-900 font-medium italic">
                                                    &quot;{reason}&quot;
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                                
                                {/* If there's a medical certificate, show the link */}
                                {selectedApp.medical_certificate_path && (
                                    <div className="pt-6 mt-6 border-t border-gray-300">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Attached Documentation</p>
                                        <button
                                            type="button"
                                            onClick={() => handleViewCertificate(selectedApp.application_id)}
                                            className="text-sm font-bold text-blue-700 hover:text-blue-900 underline transition-colors cursor-pointer text-left pointer-events-auto"
                                        >
                                            View Medical_Clearance_Document.pdf
                                        </button>
                                    </div>
                                )}
                            </div>
                                </>
                            ) : selectedAppModalTab === 'logs' ? (
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-6">Submitted Volunteer Logs</h3>
                                    {appLogs.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-10 border border-dashed border-gray-300">No logs submitted yet for this application.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {appLogs.map(log => (
                                                <div key={log.id} className="border border-gray-200 bg-white p-5 shadow-sm">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{log.log_date.split('T')[0]}</div>
                                                            <h3 className="font-bold text-lg">{log.activity_name}</h3>
                                                        </div>
                                                        <span className={`text-[10px] font-bold tracking-wider px-2 py-1 uppercase border ${
                                                            log.ngo_status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                            log.ngo_status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            'bg-red-50 text-red-700 border-red-200'
                                                        }`}>
                                                            NGO: {log.ngo_status}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 bg-gray-50 p-4 border border-gray-100">
                                                        <div><span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Check-in</span>{log.check_in_time}</div>
                                                        <div><span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Check-out</span>{log.check_out_time}</div>
                                                        <div><span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</span><strong className="text-black">{log.total_hours} hrs</strong></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : selectedAppModalTab === 'completion' ? (
                                <div className="space-y-12">
                                    {/* FORM C - SECTION A (Employee) */}
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Form C - Section A: Volunteer Report</h3>
                                        {(() => {
                                            let completionData: any = {};
                                            try {
                                                completionData = typeof selectedApp.completion_data === 'string' ? JSON.parse(selectedApp.completion_data) : (selectedApp.completion_data || {});
                                            } catch (e) {}
                                            
                                            if (completionData.formC?.sectionA) {
                                                return (
                                                    <div className="grid grid-cols-1 gap-4 text-sm bg-gray-50 p-6 border border-gray-200">
                                                        <div><span className="text-gray-500 block mb-1">Overview of Activities:</span> <strong>{completionData.formC.sectionA.overview}</strong></div>
                                                        <div><span className="text-gray-500 block mb-1">Contributions Made:</span> <strong>{completionData.formC.sectionA.contributions}</strong></div>
                                                        <div><span className="text-gray-500 block mb-1">Learnings & Reflections:</span> <strong>{completionData.formC.sectionA.learnings}</strong></div>
                                                        <div><span className="text-gray-500 block mb-1">Challenges Faced:</span> <strong>{completionData.formC.sectionA.challenges}</strong></div>
                                                        <div><span className="text-gray-500 block mb-1">Suggestions for Future:</span> <strong>{completionData.formC.sectionA.suggestions}</strong></div>
                                                        <div><span className="text-gray-500 block mb-1">Additional Comments:</span> <strong>{completionData.formC.sectionA.comments || "N/A"}</strong></div>
                                                    </div>
                                                );
                                            } else {
                                                return <p className="text-sm text-gray-500 italic border border-gray-200 bg-gray-50 p-4">Section A not yet submitted by the volunteer.</p>;
                                            }
                                        })()}
                                    </div>

                                    {/* FORM C - SECTION B (Manager) */}
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Form C - Section B: Acceptance from Reporting Officer</h3>
                                        {(() => {
                                            let completionData: any = {};
                                            try {
                                                completionData = typeof selectedApp.completion_data === 'string' ? JSON.parse(selectedApp.completion_data) : (selectedApp.completion_data || {});
                                            } catch (e) {}
                                            
                                            if (completionData.formC?.sectionB) {
                                                return (
                                                    <div className="grid grid-cols-1 gap-4 text-sm bg-gray-50 p-6 border border-gray-200">
                                                        <div><span className="text-gray-500 block mb-1">Comments:</span> <strong>{completionData.formC.sectionB.comments || "None"}</strong></div>
                                                        <div><span className="text-gray-500 block mb-1">Manager Designation:</span> <strong>{completionData.formC.sectionB.managerDesignation}</strong></div>
                                                        <div><span className="text-gray-500 block mb-1">Submitted At:</span> <strong>{new Date(completionData.formC.sectionB.submittedAt).toLocaleString()}</strong></div>
                                                    </div>
                                                );
                                            } else {
                                                return <p className="text-sm text-gray-500 italic border border-gray-200 bg-gray-50 p-4">Section B not yet submitted by the Reporting Officer.</p>;
                                            }
                                        })()}
                                    </div>

                                    {/* FORM D (NGO) */}
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Form D: Partner Organization Feedback</h3>
                                        {(() => {
                                            let completionData: any = {};
                                            try {
                                                completionData = typeof selectedApp.completion_data === 'string' ? JSON.parse(selectedApp.completion_data) : (selectedApp.completion_data || {});
                                            } catch (e) {}
                                            
                                            if (completionData.formD) {
                                                return (
                                                    <div className="grid grid-cols-1 gap-4 text-sm bg-gray-50 p-6 border border-gray-200">
                                                        <div><span className="text-gray-500 block mb-1">Task Completion Details:</span> <strong>{completionData.formD.taskDetails}</strong></div>
                                                        <div><span className="text-gray-500 block mb-1">Quality & Professionalism Exhibited:</span> <strong>{completionData.formD.quality}</strong></div>
                                                        <div><span className="text-gray-500 block mb-1">Impact Observed:</span> <strong>{completionData.formD.impact}</strong></div>
                                                        <div><span className="text-gray-500 block mb-1">Suggestions for NHPC:</span> <strong>{completionData.formD.suggestionsNHPC}</strong></div>
                                                        <div><span className="text-gray-500 block mb-1">Submitted At:</span> <strong>{new Date(completionData.formD.submittedAt).toLocaleString()}</strong></div>
                                                    </div>
                                                );
                                            } else {
                                                return <p className="text-sm text-gray-500 italic border border-gray-200 bg-gray-50 p-4">Form D not yet submitted by the NGO Partner.</p>;
                                            }
                                        })()}
                                    </div>
                                    {/* FORM G (EVALUATION) */}
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Form G: Volunteer Evaluation Format</h3>
                                        <div className="bg-gray-50 p-6 border border-gray-200">
                                            <p className="text-sm text-gray-500 mb-4">View and finalize the volunteer performance assessment (Form-G).</p>
                                            <Link 
                                                href={`/evaluation/${selectedApp.application_id}`}
                                                className="bg-black text-white px-6 py-2 text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors inline-block"
                                            >
                                                Open Form-G
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                        </div>
                    </div>
                </div>
            )}
            {/* SETTINGS MODAL */}
            {showSettingsModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm">
                    <div className="bg-white border-2 border-black p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-black uppercase tracking-wider mb-4">Set Certificate Threshold</h2>
                        <p className="text-sm text-gray-600 mb-6 font-medium">Set the minimum percentage of expected hours that must be logged to be eligible for Form-F (Certificate of Appreciation).</p>
                        
                        <div className="mb-6">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Threshold (%)</label>
                            <input 
                                type="number" 
                                min="0" 
                                max="100" 
                                value={thresholdInput}
                                onChange={(e) => setThresholdInput(e.target.value)}
                                className="w-full border-2 border-gray-300 p-3 outline-none focus:border-black font-bold text-lg" 
                            />
                        </div>

                        <div className="flex gap-4 justify-end">
                            <button onClick={() => setShowSettingsModal(false)} className="text-gray-500 hover:text-black font-bold text-sm uppercase tracking-wider">Cancel</button>
                            <button 
                                onClick={async () => {
                                    const token = localStorage.getItem("prayas_token");
                                    const res = await fetch("/api/admin/settings", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                        body: JSON.stringify({ certificate_threshold: thresholdInput })
                                    });
                                    if (res.ok) {
                                        alert("Threshold updated successfully!");
                                        setShowSettingsModal(false);
                                    } else {
                                        alert("Failed to update threshold.");
                                    }
                                }}
                                className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-gray-800"
                            >
                                Save Setting
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD NGO MODAL */}
            {showNgoModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white border-2 border-black p-8 w-full max-w-2xl shadow-2xl my-auto">
                        <h2 className="text-xl font-black uppercase tracking-wider mb-4">Add Partner NGO</h2>
                        <p className="text-sm text-gray-600 mb-6 font-medium">Create a new NGO account. Credentials will be securely created for login.</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">NGO Name</label>
                                <input type="text" value={ngoForm.name} onChange={e => setNgoForm({...ngoForm, name: e.target.value})} className="w-full border-2 border-gray-300 p-3 outline-none focus:border-black font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Email Address</label>
                                <input type="email" value={ngoForm.email} onChange={e => setNgoForm({...ngoForm, email: e.target.value})} className="w-full border-2 border-gray-300 p-3 outline-none focus:border-black font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Location / HQ</label>
                                <input type="text" value={ngoForm.location} onChange={e => setNgoForm({...ngoForm, location: e.target.value})} className="w-full border-2 border-gray-300 p-3 outline-none focus:border-black font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Password</label>
                                <input type="text" value={ngoForm.password} onChange={e => setNgoForm({...ngoForm, password: e.target.value})} className="w-full border-2 border-gray-300 p-3 outline-none focus:border-black font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Confirm Password</label>
                                <input type="text" value={ngoForm.confirmPassword} onChange={e => setNgoForm({...ngoForm, confirmPassword: e.target.value})} className="w-full border-2 border-gray-300 p-3 outline-none focus:border-black font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Representative Name</label>
                                <input type="text" value={ngoForm.representative_name} onChange={e => setNgoForm({...ngoForm, representative_name: e.target.value})} className="w-full border-2 border-gray-300 p-3 outline-none focus:border-black font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Representative Mobile</label>
                                <input 
                                    type="text" 
                                    maxLength={10}
                                    value={ngoForm.representative_mobile} 
                                    onChange={e => setNgoForm({...ngoForm, representative_mobile: e.target.value.replace(/\D/g, '')})} 
                                    className="w-full border-2 border-gray-300 p-3 outline-none focus:border-black font-bold" 
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 border-2 border-dashed border-gray-300 mb-6 flex justify-between items-center">
                            <div className="text-sm font-medium text-gray-700">
                                <strong>Email:</strong> {ngoForm.email || "—"}<br/>
                                <strong>Password:</strong> {ngoForm.password || "—"}
                            </div>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(`NGO Login Details:\nEmail: ${ngoForm.email}\nPassword: ${ngoForm.password}`);
                                    alert("Copied to clipboard!");
                                }}
                                className="bg-white border-2 border-black text-black px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-gray-100"
                            >
                                Copy Credentials
                            </button>
                        </div>

                        <div className="flex gap-4 justify-end">
                            <button onClick={() => setShowNgoModal(false)} className="text-gray-500 hover:text-black font-bold text-sm uppercase tracking-wider">Cancel</button>
                            <button 
                                onClick={async () => {
                                    if (ngoForm.password !== ngoForm.confirmPassword) return alert("Passwords do not match!");
                                    if (!ngoForm.name || !ngoForm.email || !ngoForm.password) return alert("Please fill required fields.");
                                    
                                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                    if (!emailRegex.test(ngoForm.email)) return alert("Please enter a valid email address.");

                                    if (ngoForm.representative_mobile && ngoForm.representative_mobile.length !== 10) return alert("Representative Mobile must be exactly 10 digits.");
                                    
                                    const token = localStorage.getItem("prayas_token");
                                    const res = await fetch("/api/admin/ngos", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                        body: JSON.stringify(ngoForm)
                                    });
                                    if (res.ok) {
                                        alert("NGO Partner Created Successfully!");
                                        setShowNgoModal(false);
                                        setNgoForm({ name: "", email: "", password: "", confirmPassword: "", representative_name: "", representative_mobile: "", location: "" });
                                    } else {
                                        const err = await res.json();
                                        alert(err.error || "Failed to create NGO");
                                    }
                                }}
                                className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-wider hover:bg-gray-800"
                            >
                                Create & Save NGO
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}