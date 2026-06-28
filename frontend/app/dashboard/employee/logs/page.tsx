"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function VolunteerLogs() {
    const router = useRouter();
    const [activeApp, setActiveApp] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    
    // Log form state
    const [dailyLog, setDailyLog] = useState("");
    const [checkInTime, setCheckInTime] = useState("");
    const [checkOutTime, setCheckOutTime] = useState("");
    const [totalHours, setTotalHours] = useState("");
    
    // Termination state
    const [showTerminationPrompt, setShowTerminationPrompt] = useState(false);
    const [terminationReason, setTerminationReason] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("prayas_token");
        if (!token) {
            router.push("/login/employee");
            return;
        }
        fetchActiveApplication(token);
    }, [router]);

    const fetchActiveApplication = async (token: string) => {
        try {
            const res = await fetch("http://localhost:5000/api/applications/my-applications", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const app = data.find((a: any) => a.current_status === "ALL SET");
                if (app) {
                    setActiveApp(app);
                    let fromDate: Date | null = null;
                    let toDate: Date | null = null;
                    
                    try {
                        const formData = typeof app.form_data === 'string' ? JSON.parse(app.form_data) : app.form_data;
                        const parsed = typeof formData === 'string' ? JSON.parse(formData) : formData;
                        
                        if (parsed && parsed.fromDate && parsed.toDate) {
                            fromDate = new Date(parsed.fromDate);
                            toDate = new Date(parsed.toDate);
                        }
                    } catch (e) {
                        console.error("Could not parse dates", e);
                    }

                    if (!fromDate || !toDate || isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
                        setMessage("Application dates are missing or invalid.");
                        setLoading(false);
                        return;
                    }

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    fromDate.setHours(0, 0, 0, 0);
                    toDate.setHours(0, 0, 0, 0);

                    if (today < fromDate || today > toDate) {
                        setMessage("No volunteering activity scheduled for today.");
                        setLoading(false);
                        return;
                    }

                    const localTodayStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                    const logsRes = await fetch(`http://localhost:5000/api/logs/application/${app.application_id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (logsRes.ok) {
                        const result = await logsRes.json();
                        const logs = result.data || result;
                        const logForToday = logs.find((l: any) => l.log_date.startsWith(localTodayStr));
                        if (logForToday) {
                            setMessage("You have already submitted a log for today.");
                        } else {
                            setMessage("");
                        }
                    }

                } else {
                    setMessage("You do not have any active volunteering activity (Status: ALL SET).");
                }
            }
        } catch (error) {
            console.error("Failed to fetch application", error);
            setMessage("Failed to load application data.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogSubmit = async (e: any) => {
        e.preventDefault();
        const token = localStorage.getItem("prayas_token");
        if (!activeApp) return;

        const today = new Date();
        const localTodayStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

        try {
            const res = await fetch("http://localhost:5000/api/logs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    applicationId: activeApp.application_id,
                    logDate: localTodayStr,
                    activityName: dailyLog,
                    checkInTime,
                    checkOutTime,
                    totalHours
                })
            });

            if (res.ok) {
                alert("Log submitted successfully.");
                setDailyLog("");
                setCheckInTime("");
                setCheckOutTime("");
                setTotalHours("");
                fetchActiveApplication(token as string);
            } else {
                alert("Failed to submit log.");
            }
        } catch (error) {
            console.error(error);
            alert("Error submitting log.");
        }
    };

    const handleTerminate = async () => {
        if (!terminationReason.trim()) {
            alert("Please provide a reason for termination.");
            return;
        }
        
        const token = localStorage.getItem("prayas_token");
        try {
            const res = await fetch(`http://localhost:5000/api/applications/${activeApp.application_id}/terminate`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ reason: terminationReason })
            });

            if (res.ok) {
                alert("Activity terminated successfully.");
                setShowTerminationPrompt(false);
                setTerminationReason("");
                fetchActiveApplication(token as string);
            } else {
                alert("Failed to terminate activity.");
            }
        } catch (error) {
            console.error("Terminate error", error);
        }
    };

    const calculateHours = (inTime: string, outTime: string) => {
        if (!inTime || !outTime) return;
        const [inH, inM] = inTime.split(':').map(Number);
        const [outH, outM] = outTime.split(':').map(Number);
        let diff = (outH * 60 + outM) - (inH * 60 + inM);
        if (diff < 0) diff += 24 * 60;
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        setTotalHours(`${h}.${Math.round(m / 6 * 10)}`);
    };

    useEffect(() => {
        if (checkInTime && checkOutTime) {
            calculateHours(checkInTime, checkOutTime);
        }
    }, [checkInTime, checkOutTime]);

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
                        <Link href="/dashboard/employee/approvals" className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-200 hover:text-black transition-colors">
                            Team Approvals
                        </Link>
                        <Link href="/dashboard/employee/logs" className="block px-4 py-3 text-sm font-bold text-black bg-white border border-gray-200 shadow-sm">
                            Volunteer Log
                        </Link>
                    </nav>
                </div>
            </div>

            {/* 2. MAIN CONTENT AREA */}
            <div className="flex-1 overflow-y-auto bg-white p-10">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold leading-tight mb-8">Daily Activity Log</h2>

                    {loading ? (
                        <p className="text-gray-500">Loading...</p>
                    ) : message ? (
                        <div className="p-6 border-2 border-gray-200 bg-gray-50 text-center text-gray-600 font-medium">
                            {message}
                        </div>
                    ) : activeApp ? (
                        <div className="space-y-8">
                            <div className="border border-gray-200 p-6 bg-gray-50">
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Active Activity</p>
                                <h3 className="text-xl font-bold">{activeApp.posting_title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{activeApp.ngo_name}</p>
                            </div>

                            <form onSubmit={handleLogSubmit} className="border border-gray-200 p-8 shadow-sm">
                                <h3 className="text-lg font-bold mb-6 border-b border-gray-200 pb-2">Log Hours for {new Date().toLocaleDateString()}</h3>
                                
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Check-in Time</label>
                                            <input 
                                                type="time" 
                                                required 
                                                value={checkInTime} 
                                                onChange={(e) => setCheckInTime(e.target.value)}
                                                className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Check-out Time</label>
                                            <input 
                                                type="time" 
                                                required 
                                                value={checkOutTime} 
                                                onChange={(e) => setCheckOutTime(e.target.value)}
                                                className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none" 
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Total Hours</label>
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={totalHours} 
                                            className="w-full border border-gray-200 bg-gray-50 p-3 text-sm font-bold" 
                                            placeholder="Calculated automatically"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Activities Performed (Max 400 words)</label>
                                        <textarea 
                                            required 
                                            value={dailyLog} 
                                            onChange={(e) => e.target.value.split(/\s+/).filter(w=>w).length <= 400 && setDailyLog(e.target.value)}
                                            className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none" 
                                            rows={5}
                                            placeholder="Describe what you worked on today... (Max 400 words)"
                                        ></textarea>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button type="submit" className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors">
                                            Submit Log
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {/* Early Termination */}
                            <div className="border border-red-200 bg-red-50 p-6 mt-12">
                                <h3 className="text-red-800 font-bold mb-2 uppercase tracking-wide text-sm">Emergency / Early Termination</h3>
                                <p className="text-sm text-red-700 mb-4">If you are unable to continue the volunteering activity, you can terminate it early. This will notify your HR and the NGO.</p>
                                
                                {!showTerminationPrompt ? (
                                    <button 
                                        onClick={() => setShowTerminationPrompt(true)}
                                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider py-2 px-4 transition-colors"
                                    >
                                        Initiate Termination
                                    </button>
                                ) : (
                                    <div className="mt-4">
                                        <label className="block text-xs font-bold text-red-800 uppercase tracking-wider mb-2">Reason for Termination (Max 400 words)</label>
                                        <textarea 
                                            value={terminationReason}
                                            onChange={(e) => e.target.value.split(/\s+/).filter(w=>w).length <= 400 && setTerminationReason(e.target.value)}
                                            placeholder="Please provide a valid reason... (Max 400 words)"
                                            className="w-full border border-red-300 p-3 text-sm focus:border-red-500 outline-none mb-4"
                                            rows={3}
                                        />
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={handleTerminate}
                                                className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider py-2 px-6 transition-colors"
                                            >
                                                Confirm Termination
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setShowTerminationPrompt(false);
                                                    setTerminationReason("");
                                                }}
                                                className="bg-white border border-red-300 text-red-700 hover:bg-red-100 text-xs font-bold uppercase tracking-wider py-2 px-6 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}