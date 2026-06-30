"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ActionSidebar from "@/components/ActionSidebar";

export default function EmployeeDashboard() {
    const router = useRouter();
    const [postings, setPostings] = useState<any[]>([]);
    const [applyingTo, setApplyingTo] = useState<any | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [medicalFile, setMedicalFile] = useState<File | null>(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

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
        ro_contact: "",
        selectedDates: [] as string[]
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

    const getCalendarDays = (year: number, month: number) => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, month, i);
            d.setHours(12, 0, 0, 0); // To avoid timezone offset issues when stringifying
            days.push(d);
        }
        return days;
    };

    const handleSubmitApplication = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!applyingTo) return;

        if (employeeForm.selectedDates.length === 0) {
            alert("Please select at least one date.");
            return;
        }

        if (applyingTo.medical_required === 1 && !medicalFile) {
            alert("Please upload the required medical certificate.");
            return;
        }

        setIsSubmitting(true);
        const token = localStorage.getItem("prayas_token");

        try {
            const submitData = new FormData();
            submitData.append("roEmployeeId", "RO-1234");
            submitData.append("roName", "Manager / RO");
            
            const datesPayload = {
                noOfDates: employeeForm.selectedDates.length,
                dates: employeeForm.selectedDates
            };

            const payloadToSave = {
                ...employeeForm,
                dates: datesPayload
            };
            
            submitData.append("formData", JSON.stringify(payloadToSave));
            
            if (medicalFile) {
                submitData.append("certificate", medicalFile);
            }

            const res = await fetch(`/api/applications/${applyingTo.id}/apply`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: submitData
            });

            if (res.ok) {
                setApplyingTo(null); // Close the modal
                setMedicalFile(null); // Clear file
                setEmployeeForm(prev => ({ ...prev, selectedDates: [] }));
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
                    <ActionSidebar />
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

                                    <p className="text-sm font-medium text-gray-600 mb-2">{post.ngo_name}</p>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="text-xs bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 shadow-sm">
                                            <span className="font-semibold text-gray-500">Nature:</span> {post.nature_of_work}
                                        </span>
                                        <span className="text-xs bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 shadow-sm">
                                            <span className="font-semibold text-gray-500">Required Skills:</span> {(post.technical_skills && post.technical_skills !== 'nil') ? post.technical_skills : ""}
                                        </span>
                                    </div>

                                    <div className="mt-4 mb-4 flex flex-col gap-1 text-sm text-gray-500">
                                        <span>📍 {post.location || post.ngo_base_location || "No location specified"}</span>
                                        <span>⏱️ {post.expected_hours} Expected Hours</span>
                                        <span>📅 From: {post.from_date ? new Date(post.from_date).toLocaleDateString() : 'N/A'} - To: {post.to_date ? new Date(post.to_date).toLocaleDateString() : 'N/A'}</span>
                                        <span>🏥 {post.medical_required === 1 ? 'Needs medical certificate' : 'Does not need medical certificate'}</span>
                                    </div>

                                    {post.status === 'OPEN' && (
                                        <div className="border-t border-gray-100 pt-3 mt-2 flex justify-end">
                                            <button
                                                onClick={() => {
                                                    setApplyingTo(post);
                                                    if (post.from_date) {
                                                        setCurrentMonth(new Date(post.from_date));
                                                    } else {
                                                        setCurrentMonth(new Date());
                                                    }
                                                }}
                                                className="w-full md:w-auto bg-black text-white px-6 py-3 text-xs font-bold tracking-wider hover:bg-gray-800 transition-colors uppercase"
                                            >
                                                Apply to Volunteer &rarr;
                                            </button>
                                        </div>
                                    )}
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
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Reporting Officer Mobile (For SMS Notifications)</label>
                                        <input
                                            type="tel" required
                                            pattern="[0-9]{10}"
                                            maxLength={10}
                                            minLength={10}
                                            value={employeeForm.ro_contact}
                                            onChange={(e) => {
                                                const numericValue = e.target.value.replace(/\D/g, '');
                                                setEmployeeForm({ ...employeeForm, ro_contact: numericValue });
                                            }}
                                            placeholder="Enter 10-digit mobile number"
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
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">From Date</label>
                                            <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50">{applyingTo.from_date ? new Date(applyingTo.from_date).toLocaleDateString() : "N/A"}</div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">To Date</label>
                                            <div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50">{applyingTo.to_date ? new Date(applyingTo.to_date).toLocaleDateString() : "N/A"}</div>
                                        </div>
                                        <div className="md:col-span-2 relative">
                                            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Select Available Dates</label>
                                            <div 
                                                className="w-full border border-gray-300 p-2.5 text-sm bg-white cursor-pointer hover:border-black"
                                                onClick={() => setShowCalendar(!showCalendar)}
                                            >
                                                {employeeForm.selectedDates.length > 0 
                                                    ? `${employeeForm.selectedDates.length} date(s) selected` 
                                                    : "Click to open calendar"}
                                            </div>
                                            
                                            {showCalendar && (
                                                <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-300 shadow-xl z-10 p-4">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                                                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-sm font-bold"
                                                        >&lt;</button>
                                                        <span className="text-sm font-bold uppercase tracking-widest">
                                                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                                        </span>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                                                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-sm font-bold"
                                                        >&gt;</button>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                                            <div key={day} className="text-center text-[10px] font-bold text-gray-500 uppercase">{day}</div>
                                                        ))}
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-7 gap-1">
                                                        {getCalendarDays(currentMonth.getFullYear(), currentMonth.getMonth()).map((date, i) => {
                                                            if (!date) return <div key={`empty-${i}`} className="p-2"></div>;
                                                            
                                                            const dateStr = date.toISOString().split('T')[0];
                                                            
                                                            let isValid = true;
                                                            const today = new Date();
                                                            today.setHours(0,0,0,0);
                                                            if (date < today) isValid = false;
                                                            if (applyingTo?.from_date && new Date(dateStr) < new Date(applyingTo.from_date)) isValid = false;
                                                            if (applyingTo?.to_date && new Date(dateStr) > new Date(applyingTo.to_date)) isValid = false;
                                                            
                                                            const isSelected = employeeForm.selectedDates.includes(dateStr);
                                                            
                                                            return (
                                                                <button
                                                                    key={dateStr}
                                                                    type="button"
                                                                    disabled={!isValid}
                                                                    onClick={() => {
                                                                        setEmployeeForm(prev => {
                                                                            const newDates = prev.selectedDates.includes(dateStr)
                                                                                ? prev.selectedDates.filter(d => d !== dateStr)
                                                                                : [...prev.selectedDates, dateStr];
                                                                            return { ...prev, selectedDates: newDates };
                                                                        });
                                                                    }}
                                                                    className={`p-1 text-xs font-bold w-full h-8 flex items-center justify-center
                                                                        ${!isValid ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 
                                                                          isSelected ? 'bg-black text-white' : 'hover:bg-gray-200 text-black'}`}
                                                                >
                                                                    {date.getDate()}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="mt-4 pt-3 border-t border-gray-200 text-right">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setShowCalendar(false)}
                                                            className="text-xs font-bold uppercase tracking-wider text-black hover:underline"
                                                        >
                                                            Done
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {applyingTo.medical_required === 1 && (
                                            <div className="md:col-span-2 bg-blue-50 border border-blue-200 p-4 mt-2">
                                                <label className="block text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-2">Medical Certificate Required</label>
                                                <p className="text-xs text-blue-700 mb-2">This activity requires you to upload a medical certificate.</p>
                                                <input 
                                                    type="file" 
                                                    required 
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={(e) => setMedicalFile(e.target.files?.[0] || null)}
                                                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                                                />
                                            </div>
                                        )}
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

                            {/* Authentication Removed */}

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