"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ManagerApprovals() {
    const router = useRouter();
    const [pendingApps, setPendingApps] = useState<any[]>([]);
    const [selectedApp, setSelectedApp] = useState<any | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // The state for the Section D form we just built
    const [managerForm, setManagerForm] = useState({
        action: "", // 'APPROVED', 'REJECTED', or 'PENDING_MEDICAL'
        comments: "",
        forwardedToCSR: false,
        medicalFitness: false,
        medicalStatus: ""
    });

    const [managerData, setManagerData] = useState({
        name: "Loading...",
        designation: "Reporting Officer",
    });

    useEffect(() => {
        const token = localStorage.getItem("prayas_token");
        if (!token) {
            router.push("/login/employee");
            return;
        }
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const decodedToken = JSON.parse(jsonPayload);
            setManagerData({
                name: decodedToken.name || "Unknown Manager",
                designation: decodedToken.designation || "Reporting Officer"
            });
        } catch (e) {
            console.error("Error decoding token");
        }

        fetchPendingApprovals(token);
    }, [router]);

    const fetchPendingApprovals = async (token: string) => {
        // Fetch pending approvals for the logged in manager
        try {
            const res = await fetch("/api/applications/approvals/pending", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setPendingApps(data);
                if (data.length > 0) setSelectedApp(data[0]);
            }
        } catch (error) {
            console.error("Failed to fetch approvals");
        }
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

    const handleManagerReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApp || !managerForm.action) return;

        if (managerForm.action === 'APPROVED') {
            if (!managerForm.forwardedToCSR) {
                alert("You must forward the application to the CSR & SD Division before approving.");
                return;
            }
            if (!managerForm.medicalFitness || !managerForm.medicalStatus) {
                alert("Please check and specify the Medical Fitness Certificate status before approving.");
                return;
            }
        }

        setIsSubmitting(true);
        const token = localStorage.getItem("prayas_token");

        try {
            const res = await fetch(`/api/applications/${selectedApp.application_id}/review`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    action: managerForm.action,
                    comments: managerForm.comments,
                    managerName: managerData.name,
                    managerDesignation: managerData.designation
                })
            });

            if (res.ok) {
                // Reset form and refresh list
                setManagerForm({ action: "", comments: "", forwardedToCSR: false, medicalFitness: false, medicalStatus: "" });
                setSelectedApp(null);
                fetchPendingApprovals(token as string);
            } else {
                alert("Failed to submit review.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        <Link href="/dashboard/employee" className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-200 hover:text-black transition-colors">
                            Opportunities
                        </Link>
                        {/* My Application Section */}
                        <div>
                            <Link href="/dashboard/employee/applications" className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-200 hover:text-black transition-colors">
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
                        {/* Active State for Manager Approvals */}
                        <Link href="/dashboard/employee/approvals" className="block px-4 py-3 text-sm font-bold text-black bg-white border border-gray-200 shadow-sm flex justify-between items-center">
                            <span>Approvals</span>
                            {pendingApps.length > 0 && (
                                <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded-full">{pendingApps.length}</span>
                            )}
                        </Link>
                    </nav>
                </div>
            </div>

            {/* 2. MAIN CONTENT AREA (Split Pane) */}
            <div className="flex-1 flex flex-col md:flex-row h-full">

                {/* Left Pane: Pending Queue */}
                <div className="w-full md:w-1/3 border-r border-gray-200 overflow-y-auto bg-white p-6">
                    <h2 className="text-2xl font-bold mb-6">Action Required</h2>
                    <div className="space-y-3">
                        {pendingApps.length === 0 ? (
                            <p className="text-sm text-gray-500 border border-gray-200 p-4">No pending applications to review.</p>
                        ) : (
                            pendingApps.map((app) => (
                                <div
                                    key={app.application_id}
                                    onClick={() => {
                                        setSelectedApp(app);
                                        setManagerForm({ action: "", comments: "", forwardedToCSR: false, medicalFitness: false, medicalStatus: "" }); // Reset form when switching
                                    }}
                                    className={`p-4 border cursor-pointer transition-colors ${selectedApp?.application_id === app.application_id
                                            ? 'border-black bg-gray-50'
                                            : 'border-gray-200 hover:border-gray-400'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-sm truncate">{app.posting_title}</h3>
                                        <span className="text-[10px] text-red-600 font-bold tracking-wider">NEW</span>
                                    </div>
                                    <p className="text-xs text-gray-600 truncate">Applicant ID: {app.employee_id || "Unknown"}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Pane: Review Form */}
                <div className="w-full md:w-2/3 overflow-y-auto bg-white p-10">
                    {selectedApp ? (
                        <div className="max-w-2xl mx-auto">

                            <div className="mb-8 pb-6 border-b border-gray-200">
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Application ID: #{selectedApp.application_id}</p>
                                <h2 className="text-3xl font-bold leading-tight">Volunteer Request Review</h2>
                            </div>

                            {/* READ ONLY SECTION A & B (Simulated for the Manager) */}
                            <div className="space-y-6 mb-8 opacity-80 pointer-events-none">
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
                                                } catch (e) {
                                                    console.error("Error parsing form_data:", e);
                                                }
                                            }
                                            
                                            const applicantName = formData.name || selectedApp.employee_name || "Applicant";
                                            const applicantId = formData.id || selectedApp.employee_id || "N/A";
                                            
                                            return (
                                                <>
                                                    <div><span className="text-gray-500">Name:</span> <strong>{applicantName}</strong></div>
                                                    <div><span className="text-gray-500">ID:</span> <strong>{applicantId}</strong></div>
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
                                        <div><span className="text-gray-500">Location:</span> <strong>{selectedApp.location || "N/A"}</strong></div>
                                        <div><span className="text-gray-500">Expected Hours:</span> <strong>{selectedApp.expected_hours} Hrs</strong></div>
                                        <div><span className="text-gray-500">Nature of Work:</span> <strong>{selectedApp.nature_of_work || "N/A"}</strong></div>
                                    </div>
                                </div>
                            </div>

                            {selectedApp.medical_certificate_path && (
                                <div className="mb-8">
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

                            {/* SECTION D: Approval from Reporting Officer */}
                            <div className="bg-gray-50 border border-gray-300 p-6 md:p-8 mt-8">
                                <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-6">
                                    Section D: Approval from Reporting Officer
                                </h3>

                                <form onSubmit={handleManagerReview} className="space-y-6">

                                    {/* Comments (Optional) */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                                            Comments (Optional)
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={managerForm.comments}
                                            onChange={(e) => setManagerForm({ ...managerForm, comments: e.target.value })}
                                            className="w-full border border-gray-300 p-3 text-sm outline-none focus:border-black rounded-none"
                                            placeholder="Enter your remarks here regardless of approval status..."
                                        />
                                    </div>

                                    {/* Declarations */}
                                    <div className="space-y-4 pt-2">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="mt-1 w-4 h-4" 
                                                checked={managerForm.forwardedToCSR}
                                                onChange={(e) => setManagerForm({ ...managerForm, forwardedToCSR: e.target.checked })}
                                            />
                                            <span className="text-sm text-gray-700 font-medium">This application is hereby forwarded to the CSR & SD Division for necessary recording and follow-up.</span>
                                        </label>
                                        
                                        <div className="flex flex-col gap-2">
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="mt-1 w-4 h-4"
                                                    checked={managerForm.medicalFitness}
                                                    onChange={(e) => setManagerForm({ ...managerForm, medicalFitness: e.target.checked })}
                                                />
                                                <span className="text-sm text-gray-700 font-medium">Medical Fitness Certificate (if applicable):</span>
                                            </label>
                                            
                                            {managerForm.medicalFitness && (
                                                <div className="ml-7 flex items-center gap-6">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input 
                                                            type="radio" 
                                                            name="medicalStatus" 
                                                            checked={managerForm.medicalStatus === 'enclosed'}
                                                            onChange={() => setManagerForm({ ...managerForm, medicalStatus: 'enclosed' })}
                                                        />
                                                        <span className="text-sm text-gray-700">Enclosed</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input 
                                                            type="radio" 
                                                            name="medicalStatus"
                                                            checked={managerForm.medicalStatus === 'not_applicable'}
                                                            onChange={() => setManagerForm({ ...managerForm, medicalStatus: 'not_applicable' })}
                                                        />
                                                        <span className="text-sm text-gray-700">Not Applicable</span>
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Permission Granted Action Buttons */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                                            Permission Granted
                                        </label>
                                        <div className="flex flex-wrap gap-4">
                                            <label className={`border-2 flex items-center justify-center p-3 cursor-pointer transition-colors ${managerForm.action === 'APPROVED' ? 'border-green-600 bg-green-50 text-green-700 font-bold' : 'border-gray-300 bg-white hover:border-gray-400'}`}>
                                                <input type="radio" name="action" className="hidden" onClick={() => setManagerForm({ ...managerForm, action: 'APPROVED' })} />
                                                <span className="text-sm uppercase tracking-wider">Yes</span>
                                            </label>

                                            <label className={`border-2 flex items-center justify-center p-3 cursor-pointer transition-colors ${managerForm.action === 'REJECTED' ? 'border-red-600 bg-red-50 text-red-700 font-bold' : 'border-gray-300 bg-white hover:border-gray-400'}`}>
                                                <input type="radio" name="action" className="hidden" onClick={() => setManagerForm({ ...managerForm, action: 'REJECTED' })} />
                                                <span className="text-sm uppercase tracking-wider">No</span>
                                            </label>

                                            <label className={`border-2 flex items-center justify-center p-3 cursor-pointer transition-colors ${managerForm.action === 'PENDING_MEDICAL' ? 'border-yellow-500 bg-yellow-50 text-yellow-700 font-bold' : 'border-gray-300 bg-white hover:border-gray-400'}`}>
                                                <input type="radio" name="action" className="hidden" onClick={() => setManagerForm({ ...managerForm, action: 'PENDING_MEDICAL' })} />
                                                <span className="text-sm uppercase tracking-wider flex items-center gap-2">
                                                    📄 Request Medical Certificate
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Officer Details (Auto-filled from JWT) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Name of Reporting Officer</label>
                                            <div className="text-sm font-medium border-b border-gray-300 pb-1">{managerData.name}</div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Designation</label>
                                            <div className="text-sm font-medium border-b border-gray-300 pb-1">{managerData.designation}</div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Signature</label>
                                            <div className="text-sm italic font-serif text-gray-400 border-b border-gray-300 pb-1">Digital Approval Logged</div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Date</label>
                                            <div className="text-sm font-medium border-b border-gray-300 pb-1">{new Date().toLocaleDateString()}</div>
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={!managerForm.action || !managerForm.comments || isSubmitting}
                                            className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 transition-colors"
                                        >
                                            {isSubmitting ? "Submitting..." : "Sign & Submit Review"}
                                        </button>
                                    </div>
                                </form>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                            Select an application from the queue to review.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}