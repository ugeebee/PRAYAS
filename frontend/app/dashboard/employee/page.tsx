"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EmployeeDashboard() {
    const router = useRouter();
    const [postings, setPostings] = useState<any[]>([]);
    const [applyingTo, setApplyingTo] = useState<any | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authPassword, setAuthPassword] = useState("");

    // Form E States
    const [showFormE, setShowFormE] = useState(false);
    const [formEChecks, setFormEChecks] = useState({
        mission: false,
        roles: false,
        docs: false,
        punctual: false,
        journal: false,
        safety: false,
        reports: false,
        reflect: false
    });
    const [formEAccepted, setFormEAccepted] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [employeeForm, setEmployeeForm] = useState({
        name: "",
        id: "", // Will be populated from JWT
        designation: "",
        department: "",
        contact: "",
        email: "",
        fromDate: "",
        toDate: ""
    });
    // Filter State
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("prayas_token");
        if (!token) {
            router.push("/login/employee");
            return;
        }

        // Decode the JWT to get the real Name and ID
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const decodedToken = JSON.parse(jsonPayload);

            // Lock in the known variables
            setEmployeeForm((prev) => ({
                ...prev,
                name: decodedToken.name || "Unknown Name",
                id: decodedToken.id || "Unknown ID", // Assuming your backend JWT includes the employee ID
            }));
        } catch (error) {
            console.error("Error decoding token");
        }

        fetchFeed(token, currentPage);
    }, [router, currentPage]);

    const fetchFeed = async (token: string, page: number) => {
        const res = await fetch(`/api/postings/feed?page=${page}&limit=20`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            const result = await res.json();
            setPostings(result.data);
            setTotalPages(result.meta.totalPages);
            setTotalCount(result.meta.total);
        }
    };

    const handleSubmitApplication = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!applyingTo) return;

        if (employeeForm.fromDate && employeeForm.toDate) {
            if (new Date(employeeForm.fromDate) > new Date(employeeForm.toDate)) {
                alert("From Date cannot be later than To Date.");
                return;
            }
        }

        setIsSubmitting(true);
        const token = localStorage.getItem("prayas_token");

        try {
            // 1. Verify Password with Mock API (via backend to avoid CORS)
            const authRes = await fetch("/api/auth/verify-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    employeeId: employeeForm.id,
                    password: authPassword,
                    role: "employee"
                })
            });
            const authData = await authRes.json();
            if (!authData.is_correct) {
                alert("Invalid NHPC Password.");
                setIsSubmitting(false);
                return;
            }

            // 2. Submit Application to Backend with RO info
            const res = await fetch(`/api/applications/${applyingTo.id}/apply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    roEmployeeId: authData.ro_employee_id,
                    roName: authData.ro_name,
                    formData: employeeForm
                })
            });

            if (res.ok) {
                setApplyingTo(null); // Close the modal
                setAuthPassword(""); // Reset password
                setFormEAccepted(false);
                setFormEChecks({
                    mission: false,
                    roles: false,
                    docs: false,
                    punctual: false,
                    journal: false,
                    safety: false,
                    reports: false,
                    reflect: false
                });
                // Optionally, show a success toast or redirect to "My Applications"
                router.push("/dashboard/employee/applications");
            } else {
                const errData = await res.json();
                alert(errData.error || "Failed to submit application.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredPostings = postings.filter((post) => {
        return post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.location.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="flex h-screen bg-white text-gray-900 font-sans overflow-hidden">

            {/* 1. LEFT SIDEBAR */}
            <div className="w-64 border-r border-gray-200 flex flex-col justify-between bg-gray-50 shrink-0">
                <div>
                    <div className="p-6 border-b border-gray-200">
                        <h1 className="text-xl font-bold tracking-tight uppercase">Prayas</h1>
                        <p className="text-[10px] text-gray-500 font-bold tracking-widest mt-1">Impact Engine</p>
                    </div>
                    <nav className="p-4 space-y-1">
                        {/* Active State for Opportunities */}
                        <Link
                            href="/dashboard/employee"
                            className="block px-4 py-3 text-sm font-bold text-black bg-white border border-gray-200 shadow-sm"
                        >
                            Opportunities
                        </Link>
                        {/* My Application Section */}
                        <div>
                            <Link
                                href="/dashboard/employee/applications"
                                className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-200 hover:text-black transition-colors"
                            >
                                My Application
                            </Link>
                            <div className="pl-4 border-l-2 border-gray-200 ml-4 space-y-1 mt-1 mb-2">
                                <Link href="/dashboard/employee/applications?tab=present" className="block px-4 py-2 text-xs font-medium text-gray-500 hover:text-black hover:bg-gray-100 transition-colors">
                                    Present
                                </Link>
                                <Link href="/dashboard/employee/applications?tab=action" className="block px-4 py-2 text-xs font-medium text-gray-500 hover:text-black hover:bg-gray-100 transition-colors">
                                    Need Action
                                </Link>
                                <Link href="/dashboard/employee/applications?tab=past" className="block px-4 py-2 text-xs font-medium text-gray-500 hover:text-black hover:bg-gray-100 transition-colors">
                                    Past
                                </Link>
                            </div>
                        </div>
                        <Link
                            href="/dashboard/employee/approvals"
                            className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-200 hover:text-black transition-colors"
                        >
                            Team Approvals
                        </Link>
                        <Link
                            href="/dashboard/employee/logs"
                            className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-200 hover:text-black transition-colors"
                        >
                            Volunteer Log
                        </Link>
                    </nav>
                </div>
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={() => {
                            localStorage.removeItem("prayas_token");
                            router.push("/login/employee");
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-200 transition-colors"
                    >
                        Logout &rarr;
                    </button>
                </div>
            </div>

            {/* 2. MAIN CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-10 bg-white">
                <div className="max-w-5xl mx-auto">

                    {/* Header */}
                    <div className="mb-8 flex justify-between items-end border-b border-gray-200 pb-4">
                        <div>
                            <h2 className="text-3xl font-bold mb-1">Opportunities Feed</h2>
                            <p className="text-gray-500 text-sm">Find and apply for CSR initiatives.</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="bg-white border border-gray-200 mb-6 flex gap-4 p-2">
                        <input
                            type="text"
                            placeholder="Search opportunities by title or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 p-2 text-sm outline-none placeholder-gray-400"
                        />
                    </div>

                    {/* LIST VIEW */}
                    <div className="space-y-3">
                        {filteredPostings.length === 0 ? (
                            <div className="py-12 text-center text-gray-500 border border-gray-200">
                                No opportunities found.
                            </div>
                        ) : (
                            filteredPostings.map((post) => (
                                <div
                                    key={post.id}
                                    className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-gray-200 p-4 hover:border-black transition-colors"
                                >
                                    <div className="flex-1 mb-4 md:mb-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-lg leading-none">{post.title}</h3>
                                            <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 border uppercase ${post.status === 'OPEN'
                                                ? 'text-green-700 bg-green-50 border-green-200'
                                                : 'text-gray-700 bg-gray-50 border-gray-200'
                                                }`}>
                                                {post.status}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-600">
                                            {post.ngo_name}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                            <span>📍 {post.location || post.ngo_base_location}</span>
                                            <span>🗓️ {new Date(post.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <span className="text-[10px] font-medium uppercase tracking-wide border border-gray-300 px-2 py-1 text-gray-600">
                                            ⏱️ {post.expected_hours} HRS
                                        </span>
                                    </div>

                                    <div className="hidden md:flex flex-wrap gap-2 mx-6 max-w-[200px]">
                                        <span className="text-[10px] font-medium uppercase tracking-wide border border-gray-300 px-2 py-1 text-gray-600">
                                            {post.nature_of_work}
                                        </span>
                                    </div>

                                    <div className="w-full md:w-auto">
                                        <button
                                            onClick={() => setApplyingTo(post)}
                                            className="w-full md:w-auto bg-black text-white px-6 py-3 text-xs font-bold tracking-wider hover:bg-gray-800 transition-colors uppercase"
                                        >
                                            Apply to Volunteer &rarr;
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* PAGINATION CONTROLS */}
                    {totalCount > 0 && (
                        <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-center text-sm font-medium">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 border ${currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-black text-black hover:bg-gray-50'}`}
                            >
                                &larr; Back
                            </button>

                            <span className="text-gray-500 text-xs tracking-widest uppercase">
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 border ${currentPage === totalPages ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-black text-black hover:bg-gray-50'}`}
                            >
                                Next &rarr;
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* THE APPLICATION MODAL (FORM A) */}
            {applyingTo && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-start p-4 md:p-10 overflow-y-auto">
                    <div className="bg-white w-full max-w-3xl border border-gray-300 shadow-2xl relative my-auto">

                        <div className="flex justify-between items-center border-b border-gray-200 p-6 bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold uppercase tracking-tight">Form A: Volunteer Application</h2>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Official NHPC Record</p>
                            </div>
                            <button onClick={() => setApplyingTo(null)} className="text-gray-400 hover:text-black font-bold text-xl">
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmitApplication} className="p-6 md:p-8 space-y-8">

                            {/* SECTION A: Employee Info (Mixed Read-Only and Interactive) */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Section A: Employee Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    {/* Read-Only Fields (From JWT) */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Name</label>
                                        <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-100 text-gray-400 cursor-not-allowed">
                                            {employeeForm.name}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Employee ID</label>
                                        <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-100 text-gray-400 cursor-not-allowed">
                                            {employeeForm.id}
                                        </div>
                                    </div>

                                    {/* Interactive Fields */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Designation</label>
                                        <input
                                            type="text" required
                                            value={employeeForm.designation}
                                            onChange={(e) => setEmployeeForm({ ...employeeForm, designation: e.target.value })}
                                            className="w-full border border-gray-300 p-2.5 text-sm outline-none focus:border-black rounded-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Department/Division</label>
                                        <input
                                            type="text" required
                                            value={employeeForm.department}
                                            onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                                            className="w-full border border-gray-300 p-2.5 text-sm outline-none focus:border-black rounded-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Contact Number</label>
                                        <input
                                            type="tel" required
                                            pattern="[0-9]{10}"
                                            maxLength={10}
                                            minLength={10}
                                            value={employeeForm.contact}
                                            onChange={(e) => {
                                                const numericValue = e.target.value.replace(/\D/g, '');
                                                setEmployeeForm({ ...employeeForm, contact: numericValue });
                                            }}
                                            className="w-full border border-gray-300 p-2.5 text-sm outline-none focus:border-black rounded-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Official Email</label>
                                        <input
                                            type="email" required
                                            value={employeeForm.email}
                                            onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                                            className="w-full border border-gray-300 p-2.5 text-sm outline-none focus:border-black rounded-none"
                                        />
                                    </div>

                                </div>
                            </div>

                            {/* SECTION B: Activity Details */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Section B: Activity Details</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Activity Name</label>
                                        <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50 font-bold text-black">{applyingTo.title}</div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Partner Organization</label>
                                            <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50">{applyingTo.ngo_name}</div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Location</label>
                                            <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50">{applyingTo.location || applyingTo.ngo_base_location || "Not specified"}</div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Expected Hours</label>
                                            <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50">{applyingTo.expected_hours || 0} Hrs</div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Nature of Work</label>
                                            <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50">{applyingTo.nature_of_work || "N/A"}</div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Required Skills</label>
                                            <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50">{applyingTo.technical_skills || "None specified"}</div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">From Date</label>
                                            <input
                                                type="date" required
                                                min={new Date().toISOString().split('T')[0]}
                                                value={employeeForm.fromDate}
                                                onChange={(e) => setEmployeeForm({ ...employeeForm, fromDate: e.target.value })}
                                                className="w-full border border-gray-300 p-2.5 text-sm outline-none focus:border-black rounded-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">To Date</label>
                                            <input
                                                type="date" required
                                                min={new Date().toISOString().split('T')[0]}
                                                value={employeeForm.toDate}
                                                onChange={(e) => setEmployeeForm({ ...employeeForm, toDate: e.target.value })}
                                                className="w-full border border-gray-300 p-2.5 text-sm outline-none focus:border-black rounded-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* SECTION C: Declarations (Interactive) */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Section C: Declarations</h3>
                                <div className="space-y-3">
                                    {[
                                        { text: "I confirm that my participation is voluntary and will not interfere with my official responsibilities.", reqE: false },
                                        { text: "I understand that for physically strenuous or high-risk activities(e.g., disaster relief, extensive travel, emergency response), I may required to submit a Medical Fitness Certificate issued by a Registered Medical Practitioner.", reqE: false },
                                        { text: "I undertake to comply with all safety guidelines, organizational protocols, and the PRAYAS Code of Conduct / Volunteer Guidance (Form-E)", reqE: true },
                                        { text: "I undertake the full responsibility of my own travel and related expenses.", reqE: false },
                                        { text: "I undertake to adhere to safety, ethical, and cultural protocols", reqE: false },
                                        { text: "I undertake for timely submission of reports", reqE: false }
                                    ].map((desc, i) => (
                                        <label key={i} className="flex items-start gap-3 cursor-pointer group">
                                            {desc.reqE ? (
                                                <input
                                                    type="checkbox"
                                                    required
                                                    checked={formEAccepted}
                                                    onChange={(e) => {
                                                        if (!formEAccepted) {
                                                            e.preventDefault();
                                                            setShowFormE(true);
                                                        }
                                                    }}
                                                    className="mt-1 w-4 h-4 rounded-none border-2 border-gray-300 text-black focus:ring-black accent-black"
                                                />
                                            ) : (
                                                <input type="checkbox" required className="mt-1 w-4 h-4 rounded-none border-2 border-gray-300 text-black focus:ring-black accent-black" />
                                            )}
                                            <span className="text-sm text-gray-700 group-hover:text-black transition-colors">
                                                {desc.reqE ? (
                                                    <>
                                                        I undertake to comply with all safety guidelines, organizational protocols, and the PRAYAS Code of Conduct /
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.preventDefault(); setShowFormE(true); }}
                                                            className="text-blue-600 font-bold hover:underline ml-1"
                                                        >
                                                            Volunteer Guidance (Form-E)
                                                        </button>
                                                    </>
                                                ) : desc.text}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* SECTION D: Office Use Only (Read-Only) */}
                            <div className="bg-gray-100 border border-gray-200 p-6 opacity-70">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Section D: For Office Use Only (Reporting Officer)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="border-b border-gray-300 pb-1 text-sm text-gray-400">Signature: ____________________</div>
                                    <div className="border-b border-gray-300 pb-1 text-sm text-gray-400">Date: ____________________</div>
                                    <div className="col-span-2 text-xs text-gray-500">Status: <span className="font-bold">PENDING APPROVAL</span></div>
                                </div>
                            </div>

                            {/* Authentication */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Verify NHPC Password to Apply</label>
                                <input
                                    type="password" required
                                    value={authPassword}
                                    onChange={(e) => setAuthPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full md:w-1/2 border border-gray-300 p-2.5 text-sm outline-none focus:border-black rounded-none"
                                />
                            </div>

                            {/* SUBMIT */}
                            <div className="pt-4 flex justify-end gap-4 border-t border-gray-200">
                                <button type="button" onClick={() => setApplyingTo(null)} className="px-6 py-3 text-sm font-bold text-gray-600 hover:text-black uppercase tracking-wider">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 transition-colors">
                                    {isSubmitting ? 'Submitting...' : 'Submit Application ->'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* FORM E MODAL */}
            {showFormE && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-start p-4 md:p-10 overflow-y-auto backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl border border-gray-300 shadow-2xl relative my-auto p-8">
                        <div className="flex justify-between items-start mb-6 border-b border-gray-200 pb-4">
                            <div>
                                <h3 className="text-2xl font-bold uppercase tracking-tight">Volunteer Guidance Sheet</h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Form-E</p>
                            </div>
                            <button onClick={() => setShowFormE(false)} className="text-gray-400 hover:text-black font-bold text-2xl transition-colors">
                                &times;
                            </button>
                        </div>

                        <div className="space-y-6 text-sm">
                            <p className="text-gray-600 mb-4">Please read and acknowledge the following guidelines before applying. You must tick all boxes to proceed.</p>

                            <div>
                                <h4 className="font-bold text-black uppercase tracking-widest text-xs mb-3 border-b border-gray-200 pb-1">Before Volunteering:</h4>
                                <div className="space-y-2 pl-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={formEChecks.mission} onChange={(e) => setFormEChecks({ ...formEChecks, mission: e.target.checked })} className="w-4 h-4 accent-black" />
                                        <span>Understand the partner organization's mission</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={formEChecks.roles} onChange={(e) => setFormEChecks({ ...formEChecks, roles: e.target.checked })} className="w-4 h-4 accent-black" />
                                        <span>Clarify roles and responsibilities</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={formEChecks.docs} onChange={(e) => setFormEChecks({ ...formEChecks, docs: e.target.checked })} className="w-4 h-4 accent-black" />
                                        <span>Complete necessary documentation</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-black uppercase tracking-widest text-xs mb-3 border-b border-gray-200 pb-1">During Volunteering:</h4>
                                <div className="space-y-2 pl-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={formEChecks.punctual} onChange={(e) => setFormEChecks({ ...formEChecks, punctual: e.target.checked })} className="w-4 h-4 accent-black" />
                                        <span>Be punctual and professional</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={formEChecks.journal} onChange={(e) => setFormEChecks({ ...formEChecks, journal: e.target.checked })} className="w-4 h-4 accent-black" />
                                        <span>Maintain a journal/log</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={formEChecks.safety} onChange={(e) => setFormEChecks({ ...formEChecks, safety: e.target.checked })} className="w-4 h-4 accent-black" />
                                        <span>Follow safety protocols</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-black uppercase tracking-widest text-xs mb-3 border-b border-gray-200 pb-1">After Volunteering:</h4>
                                <div className="space-y-2 pl-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={formEChecks.reports} onChange={(e) => setFormEChecks({ ...formEChecks, reports: e.target.checked })} className="w-4 h-4 accent-black" />
                                        <span>Submit reports and feedback forms</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={formEChecks.reflect} onChange={(e) => setFormEChecks({ ...formEChecks, reflect: e.target.checked })} className="w-4 h-4 accent-black" />
                                        <span>Reflect and share learnings</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-4">
                            <button onClick={() => setShowFormE(false)} className="px-6 py-2 text-sm font-bold text-gray-600 hover:text-black uppercase tracking-wider">
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setFormEAccepted(true);
                                    setShowFormE(false);
                                }}
                                disabled={!Object.values(formEChecks).every(Boolean)}
                                className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                I Agree & Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}