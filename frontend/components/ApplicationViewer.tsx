import { useState, useEffect } from "react";
import Link from "next/link";

export default function ApplicationViewer({ app, role, onClose, onAction }: { app: any, role: 'dept' | 'ngo' | 'employee' | 'ro', onClose: () => void, onAction?: () => void }) {
    const [activeTab, setActiveTab] = useState<'details' | 'logs' | 'completion'>('details');
    const [appLogs, setAppLogs] = useState<any[]>([]);

    const fetchLogs = async () => {
        const token = localStorage.getItem("prayas_token");
        const res = await fetch(`/api/logs/application/${app.application_id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
            const result = await res.json();
            setAppLogs(result.data || result);
        }
    };

    useEffect(() => {
        if (activeTab === 'logs') {
            fetchLogs();
        }
    }, [activeTab]);

    const handleViewCertificate = async () => {
        const token = localStorage.getItem("prayas_token");
        try {
            const res = await fetch(`/api/applications/${app.application_id}/medical-certificate`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
            } else {
                alert("Failed to load certificate.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Parsing data safely
    let formData: any = {};
    if (app.form_data) {
        try { formData = typeof app.form_data === 'string' ? JSON.parse(app.form_data) : app.form_data;
              if (typeof formData === 'string') formData = JSON.parse(formData);
        } catch(e) {}
    }
    
    let completionData: any = {};
    if (app.completion_data) {
        try { completionData = typeof app.completion_data === 'string' ? JSON.parse(app.completion_data) : app.completion_data;
        } catch(e) {}
    }

    const step2 = app.timeline_log?.find((step: any) => step.step === 2);
    const isPendingRO = !step2 || step2.status === "PENDING" || app.current_status === "APPLIED";
    let roComments = "";
    if (step2?.note && !isPendingRO) {
        const parts = step2.note.split("Remarks: ");
        roComments = parts.length > 1 ? parts[1] : step2.note;
        if (roComments === "None") roComments = "";
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex justify-center items-start p-4 md:p-10 overflow-y-auto backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl border border-gray-300 shadow-2xl relative my-auto">
                <div className="flex justify-between items-center border-b border-gray-200 p-6 bg-gray-50 sticky top-0 z-10 shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold uppercase tracking-tight">Application Viewer</h2>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">
                            System Record #{app.application_id} &bull; Status: <span className="font-bold text-black">{app.current_status?.replace(/_/g, ' ')}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-black font-bold text-2xl transition-colors">&times;</button>
                </div>

                <div className="flex border-b border-gray-200 bg-gray-50 px-6">
                    <button onClick={() => setActiveTab('details')} className={`px-4 py-3 text-sm font-bold uppercase tracking-wider ${activeTab === 'details' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}>Form-A (Details)</button>
                    <button onClick={() => setActiveTab('logs')} className={`px-4 py-3 text-sm font-bold uppercase tracking-wider ${activeTab === 'logs' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}>Form-B (Logs)</button>
                    <button onClick={() => setActiveTab('completion')} className={`px-4 py-3 text-sm font-bold uppercase tracking-wider ${activeTab === 'completion' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}>Form-C & D (Completion)</button>
                </div>

                <div className="p-6 md:p-8 space-y-8 opacity-95">
                    {activeTab === 'details' && (
                        <>
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Section A: Employee Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Name</label><div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50 font-bold text-black">{formData.name || app.employee_name || "N/A"}</div></div>
                                    <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Employee ID</label><div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50 font-bold text-black">{app.employee_id || "N/A"}</div></div>
                                    <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Designation</label><div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50">{formData.designation || "N/A"}</div></div>
                                    <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Department</label><div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50">{formData.department || "N/A"}</div></div>
                                    <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Contact</label><div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50">{formData.contact || "N/A"}</div></div>
                                    <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label><div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50">{formData.email || "N/A"}</div></div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Section B: Activity Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2"><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Activity Name</label><div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50 font-bold text-black">{app.posting_title}</div></div>
                                    <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Partner Organization</label><div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50">{app.ngo_name}</div></div>
                                    <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Expected Hours</label><div className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50">{app.expected_hours || 0} Hrs</div></div>
                                </div>
                            </div>
                            <div className="bg-gray-100 border border-gray-200 p-6 mt-8">
                                <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-6">Section-D: Approval from Reporting Officer</h3>
                                <div className="space-y-6 pointer-events-none">
                                    <div><label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">Comments</label><div className="w-full border-b border-gray-400 p-2 text-sm min-h-[30px]">{roComments}</div></div>
                                </div>
                            </div>
                            {app.medical_certificate_path && (
                                <div className="pt-6 mt-6 border-t border-gray-300">
                                    <button onClick={handleViewCertificate} className="text-sm font-bold text-blue-700 hover:text-blue-900 underline transition-colors cursor-pointer">View Medical Certificate</button>
                                </div>
                            )}
                        </>
                    )}
                    {activeTab === 'logs' && (
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-6">Volunteer Logs</h3>
                            {appLogs.length === 0 ? <p className="text-sm text-gray-500">No logs submitted yet.</p> : (
                                <div className="space-y-4">
                                    {appLogs.map(log => (
                                        <div key={log.id} className="border border-gray-200 bg-white p-5 shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <div><div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{log.log_date.split('T')[0]}</div><h3 className="font-bold text-lg">{log.activity_name}</h3></div>
                                                <span className={`text-[10px] font-bold tracking-wider px-2 py-1 uppercase border ${log.ngo_status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' : log.ngo_status === 'APPROVED' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>NGO: {log.ngo_status}</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 bg-gray-50 p-4 border border-gray-100">
                                                <div><span className="block text-[10px] font-bold text-gray-400 uppercase">Check-in</span>{log.check_in_time}</div>
                                                <div><span className="block text-[10px] font-bold text-gray-400 uppercase">Check-out</span>{log.check_out_time}</div>
                                                <div><span className="block text-[10px] font-bold text-gray-400 uppercase">Total</span><strong className="text-black">{log.total_hours} hrs</strong></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'completion' && (
                        <div className="space-y-12">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Form C - Section A: Volunteer Report</h3>
                                {completionData.formC?.sectionA ? (
                                    <div className="grid grid-cols-1 gap-4 text-sm bg-gray-50 p-6 border border-gray-200">
                                        <div><span className="text-gray-500 block mb-1">Overview of Activities:</span> <strong>{completionData.formC.sectionA.overview}</strong></div>
                                        <div><span className="text-gray-500 block mb-1">Contributions Made:</span> <strong>{completionData.formC.sectionA.contributions}</strong></div>
                                        <div><span className="text-gray-500 block mb-1">Learnings:</span> <strong>{completionData.formC.sectionA.learnings}</strong></div>
                                    </div>
                                ) : <p className="text-sm text-gray-500 italic">Section A not yet filled.</p>}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Form C - Section B: RO Acceptance</h3>
                                {completionData.formC?.sectionB ? (
                                    <div className="grid grid-cols-1 gap-4 text-sm bg-gray-50 p-6 border border-gray-200">
                                        <div><span className="text-gray-500 block mb-1">Comments:</span> <strong>{completionData.formC.sectionB.comments || "None"}</strong></div>
                                    </div>
                                ) : <p className="text-sm text-gray-500 italic">Section B not yet filled.</p>}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Form D: NGO Feedback</h3>
                                {completionData.formD ? (
                                    <div className="grid grid-cols-1 gap-4 text-sm bg-gray-50 p-6 border border-gray-200">
                                        <div><span className="text-gray-500 block mb-1">Task Completion Details:</span> <strong>{completionData.formD.taskDetails}</strong></div>
                                        <div><span className="text-gray-500 block mb-1">Quality:</span> <strong>{completionData.formD.quality}</strong></div>
                                    </div>
                                ) : <p className="text-sm text-gray-500 italic">Form D not yet filled.</p>}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Form G: Volunteer Evaluation Format</h3>
                                <div className="bg-gray-50 p-6 border border-gray-200">
                                    <Link href={`/evaluation/${app.application_id}`} className="bg-black text-white px-6 py-2 text-xs font-bold uppercase tracking-wider hover:bg-gray-800">Open Form-G</Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
