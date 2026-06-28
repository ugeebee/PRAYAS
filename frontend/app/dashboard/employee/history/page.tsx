"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EmployeeHistory() {
    const router = useRouter();
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        const token = localStorage.getItem("prayas_token");
        if (!token) {
            router.push("/login/employee");
            return;
        }
        fetchHistory(token);
    }, [router]);

    const fetchHistory = async (token: string) => {
        try {
            // Reusing our existing applications endpoint!
            const res = await fetch("http://localhost:5000/api/applications/my-applications", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (error) {
            console.error("Failed to fetch history");
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
                            className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-200 hover:text-black transition-colors"
                        >
                            My Applications
                        </Link>
                        {/* Active State for History */}
                        <Link
                            href="/dashboard/employee/history"
                            className="block px-4 py-3 text-sm font-bold text-black bg-white border border-gray-200 shadow-sm"
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

            {/* 2. MAIN CONTENT AREA (Data Table Layout) */}
            <div className="flex-1 overflow-y-auto p-10 bg-white">
                <div className="max-w-6xl mx-auto">

                    <div className="mb-8 pb-4 border-b border-gray-200">
                        <h2 className="text-3xl font-bold mb-1">Volunteer History</h2>
                        <p className="text-gray-500 text-sm">A complete ledger of your CSR initiatives and applications.</p>
                    </div>

                    {/* THE LEDGER TABLE */}
                    <div className="bg-white border border-gray-200">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b-2 border-black">
                                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-600">ID</th>
                                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-600">Date Applied</th>
                                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-600">Opportunity</th>
                                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-600">Organization</th>
                                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-600 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-sm text-gray-500">
                                            No history found. Apply for an opportunity to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((item) => {
                                        // Find the initial application date from the timeline JSON
                                        const dateApplied = item.timeline_log[0]?.date
                                            ? new Date(item.timeline_log[0].date).toLocaleDateString()
                                            : "Unknown";

                                        return (
                                            <tr key={item.application_id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-6 text-sm text-gray-500 font-medium">#{item.application_id}</td>
                                                <td className="py-4 px-6 text-sm text-gray-900">{dateApplied}</td>
                                                <td className="py-4 px-6 text-sm font-bold text-gray-900">{item.posting_title}</td>
                                                <td className="py-4 px-6 text-sm text-gray-600">{item.ngo_name}</td>
                                                <td className="py-4 px-6 text-right">
                                                    <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider border ${item.current_status === 'ALL SET'
                                                            ? 'border-green-300 bg-green-50 text-green-700'
                                                            : item.current_status === 'REJECTED'
                                                                ? 'border-red-300 bg-red-50 text-red-700'
                                                                : 'border-gray-300 bg-white text-gray-700'
                                                        }`}>
                                                        {item.current_status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    );
}