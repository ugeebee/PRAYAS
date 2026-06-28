"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MyApplications() {
    const router = useRouter();
    const [applications, setApplications] = useState<any[]>([]);
    const [selectedApp, setSelectedApp] = useState<any | null>(null);

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
            const res = await fetch("http://localhost:5000/api/applications/my-applications", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setApplications(data);
                // Auto-select the first application if it exists
                if (data.length > 0) setSelectedApp(data[0]);
            }
        } catch (error) {
            console.error("Failed to fetch applications");
        }
    };

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
                        <Link
                            href="/dashboard/employee/applications"
                            className="block px-4 py-3 text-sm font-bold text-black bg-white border border-gray-200 shadow-sm"
                        >
                            My Applications
                        </Link>
                        <Link
                            href="/dashboard/employee/history"
                            className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-200 hover:text-black transition-colors"
                        >
                            History
                        </Link>
                        <Link
                            href="/dashboard/employee/approvals"
                            className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-200 hover:text-black transition-colors"
                        >
                            Team Approvals
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

                    <div className="space-y-3">
                        {applications.length === 0 ? (
                            <p className="text-sm text-gray-500 border border-gray-200 p-4">No applications found.</p>
                        ) : (
                            applications.map((app) => (
                                <div
                                    key={app.application_id}
                                    onClick={() => setSelectedApp(app)}
                                    className={`p-4 border cursor-pointer transition-colors ${selectedApp?.application_id === app.application_id
                                        ? 'border-black bg-gray-50'
                                        : 'border-gray-200 hover:border-gray-400'
                                        }`}
                                >
                                    <h3 className="font-bold text-sm truncate">{app.posting_title}</h3>
                                    <p className="text-xs text-gray-600 mt-1 truncate">{app.ngo_name}</p>
                                    <div className="mt-3 inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider border border-gray-300 bg-white">
                                        {app.current_status}
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
        </div>
    );
}