"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ActionSidebar from "@/components/ActionSidebar";

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

    const [allLogs, setAllLogs] = useState<any[]>([]);
    const [minDate, setMinDate] = useState("");
    const [maxDate, setMaxDate] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

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
            const res = await fetch("/api/applications/my-applications", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const app = data.find((a: any) => a.current_status === "ALL SET" || a.current_status === "Acknowledged and all set");
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
                        } else if (parsed && parsed.dates && Array.isArray(parsed.dates.dates) && parsed.dates.dates.length > 0) {
                            const dateStrings = [...parsed.dates.dates].sort();
                            fromDate = new Date(dateStrings[0]);
                            toDate = new Date(dateStrings[dateStrings.length - 1]);
                        } else if (parsed && Array.isArray(parsed.selectedDates) && parsed.selectedDates.length > 0) {
                            const dateStrings = [...parsed.selectedDates].sort();
                            fromDate = new Date(dateStrings[0]);
                            toDate = new Date(dateStrings[dateStrings.length - 1]);
                        }
                    } catch (e) {
                        console.error("Could not parse dates", e);
                    }

                    if (!fromDate || !toDate || isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
                        setMessage("Application dates are missing or invalid.");
                        setLoading(false);
                        return;
                    }

                    const minD = new Date(fromDate.getTime() - (fromDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                    const maxD = new Date(toDate.getTime() - (toDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                    setMinDate(minD);
                    setMaxDate(maxD);

                    const today = new Date();
                    const localTodayStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                    
                    let initialDate = localTodayStr;
                    if (localTodayStr < minD) initialDate = minD;
                    if (localTodayStr > maxD) initialDate = maxD;
                    // Don't override selectedDate if it's already set (e.g. user selected a date and then submitted)
                    setSelectedDate(prev => prev || initialDate);

                    const logsRes = await fetch(`/api/logs/application/${app.application_id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (logsRes.ok) {
                        const result = await logsRes.json();
                        setAllLogs(result.data || result);
                    }
                    setMessage("");
                } else {
                    setMessage("You do not have any active volunteering activity (Status: Acknowledged and all set).");
                }
            }
        } catch (error) {
            console.error("Failed to fetch application", error);
            setMessage("Failed to load application data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedDate && allLogs) {
            const logForDate = allLogs.find((l: any) => l.log_date.startsWith(selectedDate));
            if (logForDate) {
                setDailyLog(logForDate.activity_name || "");
                setCheckInTime(logForDate.check_in_time ? logForDate.check_in_time.substring(0, 5) : "");
                setCheckOutTime(logForDate.check_out_time ? logForDate.check_out_time.substring(0, 5) : "");
                setTotalHours(logForDate.total_hours || "");
            } else {
                setDailyLog("");
                setCheckInTime("");
                setCheckOutTime("");
                setTotalHours("");
            }
        }
    }, [selectedDate, allLogs]);

    const handleLogSubmit = async (e: any) => {
        e.preventDefault();
        const token = localStorage.getItem("prayas_token");
        if (!activeApp) return;

        try {
            const res = await fetch("/api/logs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    applicationId: activeApp.application_id,
                    logDate: selectedDate,
                    activityName: dailyLog,
                    checkInTime,
                    checkOutTime,
                    totalHours
                })
            });

            if (res.ok) {
                alert("Log saved successfully.");
                fetchActiveApplication(token as string);
            } else {
                alert("Failed to save log.");
            }
        } catch (error) {
            console.error(error);
            alert("Error submitting log.");
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
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={() => {
                            localStorage.removeItem("prayas_token");
                            window.location.href = "/login/employee";
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-200 transition-colors"
                    >
                        Logout &rarr;
                    </button>
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
                                <div className="mb-6 border-b border-gray-200 pb-4">
                                    <h3 className="text-lg font-bold mb-4">Log Hours</h3>
                                    <div className="flex items-center gap-4">
                                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Date:</label>
                                        <input 
                                            type="date"
                                            value={selectedDate}
                                            min={minDate}
                                            max={maxDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="border border-gray-300 p-2 text-sm outline-none focus:border-black bg-white"
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Check-in Time</label>
                                            <input 
                                                type="time" 
                                                required 
                                                value={checkInTime} 
                                                onChange={(e) => setCheckInTime(e.target.value)}
                                                className="w-full border border-gray-300 p-3 text-sm outline-none focus:border-black bg-white" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Check-out Time</label>
                                            <input 
                                                type="time" 
                                                required 
                                                value={checkOutTime} 
                                                onChange={(e) => setCheckOutTime(e.target.value)}
                                                className="w-full border border-gray-300 p-3 text-sm outline-none focus:border-black bg-white" 
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
                                            className="w-full border border-gray-300 p-3 text-sm outline-none focus:border-black bg-white" 
                                            rows={5}
                                            placeholder="Describe what you worked on today... (Max 400 words)"
                                        ></textarea>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button type="submit" className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors">
                                            Save Log
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}