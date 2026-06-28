"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function MyApplicationsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [applications, setApplications] = useState<any[]>([]);
    const [selectedApp, setSelectedApp] = useState<any | null>(null);
    const [medicalFile, setMedicalFile] = useState<File | null>(null);
    const [activeTab, setActiveTab] = useState<'present' | 'action' | 'past'>('present');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'present' || tab === 'action' || tab === 'past') {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // Form C States
    const [showFormC, setShowFormC] = useState<number | null>(null);
    const [formCData, setFormCData] = useState({
        overview: "",
        contributions: "",
        learnings: "",
        challenges: "",
        suggestions: "",
        comments: ""
    });

    useEffect(() => {
        const token = localStorage.getItem("prayas_token");
        if (!token) {
            router.push("/login/employee");
            return;
        }
        fetchApplications(token);
    }, [router]);

    const fetchApplications = async (token: string) => {
        try {
            const res = await fetch("/api/applications/my-applications", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                
                // Parse timeline_log strings into objects
                const parsedData = data.map((app: any) => {
                    if (typeof app.timeline_log === 'string') {
                        app.timeline_log = JSON.parse(app.timeline_log);
                    }
                    return app;
                });

                setApplications(parsedData);
                // Auto-select logic is handled in useEffect when activeTab changes
            }
        } catch (error) {
            console.error("Failed to fetch applications");
        }
    };

    const handleUploadMedical = async (applicationId: number) => {
        const token = localStorage.getItem("prayas_token");
        if (!token) return;
        if (!medicalFile) {
            alert("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("certificate", medicalFile);

        try {
            const res = await fetch(`/api/applications/${applicationId}/upload-medical`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                alert("Medical certificate uploaded successfully.");
                setMedicalFile(null);
                fetchApplications(token); // Refresh the timeline
            } else {
                alert("Failed to upload certificate.");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        }
    };

    const handleFormCSubmit = async (e: any) => {
        e.preventDefault();
        const token = localStorage.getItem("prayas_token");
        try {
            const res = await fetch(`/api/applications/${showFormC}/completion/employee`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ formData: formCData })
            });

            if (res.ok) {
                alert("Volunteering Completion Report (Section A) submitted successfully.");
                setShowFormC(null);
                setFormCData({ overview: "", contributions: "", learnings: "", challenges: "", suggestions: "", comments: "" });
                fetchApplications(token as string);
            } else {
                alert("Failed to submit form.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const needsFormC = (item: any) => {
        const isTerminated = item.current_status.toLowerCase().includes("terminated");
        const isCompleted = item.current_status === "COMPLETED"; // Or whatever regular completion is
        const alreadySubmitted = item.completion_data?.formC?.sectionA;
        return (isTerminated || isCompleted) && !alreadySubmitted;
    };

    const presentApps = applications.filter(app => {
        const s = app.current_status;
        return !['COMPLETED', 'REJECTED', 'TERMINATED_BY_EMPLOYEE', 'TERMINATED_BY_NGO', 'PENDING_RO_COMPLETION', 'FORWARDED_TO_HR'].includes(s) && !s.includes("TERMINATED");
    });

    const actionApps = applications.filter(app => needsFormC(app) || app.current_status === "PENDING_MEDICAL");

    const pastApps = applications.filter(app => {
        const s = app.current_status;
        return (['COMPLETED', 'REJECTED', 'PENDING_RO_COMPLETION', 'FORWARDED_TO_HR'].includes(s) || s.includes("TERMINATED")) && !needsFormC(app);
    });

    const displayedApps = activeTab === 'present' ? presentApps : activeTab === 'action' ? actionApps : pastApps;

    useEffect(() => {
        if (displayedApps.length > 0) {
            if (!selectedApp || !displayedApps.find(a => a.application_id === selectedApp.application_id)) {
                setSelectedApp(displayedApps[0]);
            }
        } else {
            setSelectedApp(null);
        }
    }, [activeTab, applications]); // Automatically select the first app of the active tab

    return (
        <div className="flex h-screen bg-white text-gray-900 font-sans overflow-hidden">

            {/* 1. LEFT SIDEBAR (Utilitarian & Persistent) */}
            <div className="w-64 border-r border-gray-200 flex flex-col justify-between bg-gray-50 shrink-0">
                <div>
                    <div className="p-6 border-b border-gray-200">
                        <h1 className="text-xl font-bold tracking-tight uppercase">Prayas</h1>
                        <p className="text-[10px] text-gray-500 font-bold tracking-widest mt-1">Impact Engine</p>
                    </div>
                    <nav className="p-4 space-y-1">
                        <Link
                            href="/dashboard/employee"
                            className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-200 hover:text-black transition-colors"
                        >
                            Opportunities
                        </Link>
                        {/* My Application Section */}
                        <div>
                            <Link
                                href="/dashboard/employee/applications"
                                className="block px-4 py-3 text-sm font-bold text-black bg-white border border-gray-200 shadow-sm"
                            >
                                My Application
                            </Link>
                            <div className="pl-4 border-l-2 border-gray-200 ml-4 space-y-1 mt-1 mb-2">
                                <Link href="/dashboard/employee/applications?tab=present" className={`block px-4 py-2 text-xs font-medium transition-colors ${activeTab === 'present' ? 'text-black font-bold bg-gray-100' : 'text-gray-500 hover:text-black hover:bg-gray-100'}`}>
                                    Present
                                </Link>
                                <Link href="/dashboard/employee/applications?tab=action" className={`block px-4 py-2 text-xs font-medium transition-colors ${activeTab === 'action' ? 'text-black font-bold bg-gray-100' : 'text-gray-500 hover:text-black hover:bg-gray-100'}`}>
                                    Need Action
                                </Link>
                                <Link href="/dashboard/employee/applications?tab=past" className={`block px-4 py-2 text-xs font-medium transition-colors ${activeTab === 'past' ? 'text-black font-bold bg-gray-100' : 'text-gray-500 hover:text-black hover:bg-gray-100'}`}>
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

            {/* 2. MAIN CONTENT AREA (Split Pane Layout) */}
            <div className="flex-1 flex flex-col md:flex-row h-full">

                {/* Left Pane: Application List */}
                <div className="w-full md:w-1/3 border-r border-gray-200 overflow-y-auto bg-white p-6">
                    <h2 className="text-2xl font-bold mb-6">Status Tracker</h2>
                    
                    {/* TABS */}
                    <div className="flex space-x-2 mb-6 border-b border-gray-200 pb-2">
                        <button
                            onClick={() => setActiveTab('present')}
                            className={`text-xs font-bold uppercase tracking-wider px-3 py-2 transition-colors ${activeTab === 'present' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-black'}`}
                        >
                            Present
                        </button>
                        <button
                            onClick={() => setActiveTab('action')}
                            className={`text-xs font-bold uppercase tracking-wider px-3 py-2 transition-colors ${activeTab === 'action' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400 hover:text-black'}`}
                        >
                            Need Action {actionApps.length > 0 && `(${actionApps.length})`}
                        </button>
                        <button
                            onClick={() => setActiveTab('past')}
                            className={`text-xs font-bold uppercase tracking-wider px-3 py-2 transition-colors ${activeTab === 'past' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-black'}`}
                        >
                            Past
                        </button>
                    </div>

                    <div className="space-y-3">
                        {displayedApps.length === 0 ? (
                            <p className="text-sm text-gray-500 border border-gray-200 p-4">No applications found.</p>
                        ) : (
                            displayedApps.map((app) => (
                                <div
                                    key={app.application_id}
                                    onClick={() => setSelectedApp(app)}
                                    className={`p-4 border cursor-pointer transition-colors ${selectedApp?.application_id === app.application_id
                                        ? 'border-black bg-gray-50'
                                        : 'border-gray-200 hover:border-gray-400'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-sm truncate">{app.posting_title}</h3>
                                            <p className="text-xs text-gray-600 mt-1 truncate">{app.ngo_name}</p>
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-bold tracking-wider">
                                            {app.timeline_log?.[0]?.date ? new Date(app.timeline_log[0].date).toLocaleDateString() : ''}
                                        </div>
                                    </div>
                                    <div className="mt-3 flex justify-between items-end">
                                        <div className="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider border border-gray-300 bg-white">
                                            {app.current_status}
                                        </div>
                                        {activeTab === 'action' && needsFormC(app) && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowFormC(app.application_id);
                                                }}
                                                className="text-[10px] font-bold bg-black text-white px-2 py-1 uppercase tracking-wider hover:bg-gray-800 transition-colors"
                                            >
                                                Fill Form C
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Pane: The Timeline View */}
                <div className="w-full md:w-2/3 overflow-y-auto bg-white p-10">
                    {selectedApp ? (
                        <div className="max-w-md mx-auto">
                            <div className="mb-10 pb-6 border-b border-gray-200">
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Application ID: #{selectedApp.application_id}</p>
                                <h2 className="text-3xl font-bold leading-tight">{selectedApp.posting_title}</h2>
                                <p className="text-md text-gray-600 mt-2 font-medium">{selectedApp.ngo_name}</p>
                                {selectedApp.ro_name && (
                                    <p className="text-sm text-gray-500 mt-1">Reporting Officer: {selectedApp.ro_name}</p>
                                )}
                            </div>

                            {/* CERTIFICATE DOWNLOAD BLOCK */}
                            {activeTab === 'past' && !selectedApp.current_status.includes('REJECTED') && !selectedApp.current_status.includes('TERMINATED') && (
                                <div className="mb-8 p-6 border-2 border-black bg-gray-50 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold uppercase tracking-wide text-sm">Certificate of Appreciation</h3>
                                        <p className="text-sm text-gray-600 mt-1">Download your Form-F certificate for this activity.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link 
                                            href={`/evaluation/${selectedApp.application_id}`}
                                            className="bg-white text-black border-2 border-black hover:bg-gray-100 text-xs font-bold uppercase tracking-wider py-3 px-6 transition-colors shrink-0"
                                        >
                                            Form-G
                                        </Link>
                                        <button 
                                            onClick={() => {
                                                const token = localStorage.getItem("prayas_token");
                                                fetch(`/api/applications/${selectedApp.application_id}/certificate`, {
                                                    headers: { Authorization: `Bearer ${token}` }
                                                }).then(res => {
                                                    if (res.ok) {
                                                        return res.blob();
                                                    }
                                                    throw new Error("Failed to download");
                                                }).then(blob => {
                                                    const url = window.URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = `Certificate_Form_F_${selectedApp.application_id}.pdf`;
                                                    a.click();
                                                    window.URL.revokeObjectURL(url);
                                                }).catch(err => {
                                                    alert("Certificate is not ready or failed to generate.");
                                                });
                                            }}
                                            className="bg-black hover:bg-gray-800 text-white text-xs font-bold uppercase tracking-wider py-3 px-6 transition-colors shrink-0"
                                        >
                                            Download PDF
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ACTION REQUIRED BLOCK (Medical) */}
                            {selectedApp.current_status === "PENDING_MEDICAL" && (
                                <div className="mb-8 p-6 border-2 border-red-200 bg-red-50">
                                    <h3 className="text-red-800 font-bold mb-2 uppercase tracking-wide text-sm">Action Required: Medical Certificate</h3>
                                    <p className="text-sm text-red-700 mb-4">Your Reporting Officer has requested a medical certificate before approving your application. Please upload it below.</p>
                                    <input 
                                        type="file" 
                                        accept="application/pdf"
                                        onChange={(e) => setMedicalFile(e.target.files?.[0] || null)}
                                        className="mb-4 text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-red-100 file:text-red-700 hover:file:bg-red-200 cursor-pointer"
                                    />
                                    <button 
                                        onClick={() => handleUploadMedical(selectedApp.application_id)}
                                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider py-2 px-4 transition-colors block"
                                    >
                                        Upload Certificate
                                    </button>
                                </div>
                            )}

                            {/* ACTION REQUIRED BLOCK (Form C) */}
                            {needsFormC(selectedApp) && (
                                <div className="mb-8 p-6 border-2 border-red-200 bg-red-50">
                                    <h3 className="text-red-800 font-bold mb-2 uppercase tracking-wide text-sm">Action Required: Completion Report</h3>
                                    <p className="text-sm text-red-700 mb-4">Your activity has concluded. Please fill out the Volunteering Completion Report (Form C).</p>
                                    <button 
                                        onClick={() => setShowFormC(selectedApp.application_id)}
                                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider py-2 px-4 transition-colors block"
                                    >
                                        Fill Form C
                                    </button>
                                </div>
                            )}

                            {/* TIMELINE RENDERER */}
                            <div className="relative">
                                {selectedApp.timeline_log.map((step: any, index: number) => {
                                    const isCompleted = step.status === "COMPLETED";
                                    const isLast = index === selectedApp.timeline_log.length - 1;

                                    return (
                                        <div key={step.step} className="relative pl-10 pb-10">
                                            {/* Vertical Connecting Line (Skip on last item) */}
                                            {!isLast && (
                                                <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-gray-200" />
                                            )}

                                            {/* Status Node (Square block instead of rounded dot for minimalist style) */}
                                            <div className={`absolute left-0 top-1 w-6 h-6 border-2 flex items-center justify-center bg-white ${isCompleted ? 'border-black' : 'border-gray-200'
                                                }`}>
                                                {isCompleted && <div className="w-2.5 h-2.5 bg-black" />}
                                            </div>

                                            {/* Step Content */}
                                            <div>
                                                <h4 className={`text-sm font-bold uppercase tracking-wide ${isCompleted ? 'text-black' : 'text-gray-400'}`}>
                                                    Step {step.step}: {step.title}
                                                </h4>

                                                {step.date ? (
                                                    <p className="text-xs text-gray-500 font-medium mt-1">
                                                        {new Date(step.date).toLocaleDateString()} at {new Date(step.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-gray-400 mt-1 italic">Pending action</p>
                                                )}

                                                {step.note && (
                                                    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 text-sm text-gray-700">
                                                        {step.note}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                            Select an application to view its timeline.
                        </div>
                    )}
                </div>

            </div>

            {/* FORM C MODAL */}
            {showFormC && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-300 p-8 relative">
                        <div className="flex justify-between items-start mb-6 border-b border-gray-200 pb-4">
                            <div>
                                <h3 className="text-xl font-bold uppercase tracking-widest">Volunteering Completion Report</h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Form-C (Section A)</p>
                            </div>
                            <button onClick={() => setShowFormC(null)} className="text-gray-400 hover:text-black font-bold text-2xl transition-colors">&times;</button>
                        </div>

                        <form onSubmit={handleFormCSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Overview of Activities</label>
                                <textarea required placeholder="Max 400 words" value={formCData.overview} onChange={(e) => e.target.value.split(/\s+/).filter(w=>w).length <= 400 && setFormCData({ ...formCData, overview: e.target.value })} className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none" rows={3}></textarea>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Contributions Made</label>
                                <textarea required placeholder="Max 400 words" value={formCData.contributions} onChange={(e) => e.target.value.split(/\s+/).filter(w=>w).length <= 400 && setFormCData({ ...formCData, contributions: e.target.value })} className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none" rows={3}></textarea>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Learnings & Reflections</label>
                                <textarea required placeholder="Max 400 words" value={formCData.learnings} onChange={(e) => e.target.value.split(/\s+/).filter(w=>w).length <= 400 && setFormCData({ ...formCData, learnings: e.target.value })} className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none" rows={3}></textarea>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Challenges Faced</label>
                                <textarea required placeholder="Max 400 words" value={formCData.challenges} onChange={(e) => e.target.value.split(/\s+/).filter(w=>w).length <= 400 && setFormCData({ ...formCData, challenges: e.target.value })} className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none" rows={2}></textarea>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Suggestions for Future</label>
                                <textarea required placeholder="Max 400 words" value={formCData.suggestions} onChange={(e) => e.target.value.split(/\s+/).filter(w=>w).length <= 400 && setFormCData({ ...formCData, suggestions: e.target.value })} className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none" rows={2}></textarea>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Additional Comments</label>
                                <textarea placeholder="Max 400 words" value={formCData.comments} onChange={(e) => e.target.value.split(/\s+/).filter(w=>w).length <= 400 && setFormCData({ ...formCData, comments: e.target.value })} className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none" rows={2}></textarea>
                            </div>

                            <div className="pt-4 border-t border-gray-200 flex justify-end gap-4">
                                <button type="button" onClick={() => setShowFormC(null)} className="px-6 py-2 text-sm font-bold border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="bg-black text-white px-8 py-2 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors">
                                    Submit Report
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function MyApplications() {
    return (
        <Suspense fallback={<div className="p-8">Loading...</div>}>
            <MyApplicationsContent />
        </Suspense>
    );
}
