"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TeamApprovals() {
    const router = useRouter();
    const [approvals, setApprovals] = useState<any[]>([]);

    useEffect(() => {
        const token = localStorage.getItem("prayas_token");
        if (!token) {
            router.push("/login/employee");
            return;
        }
        fetchApprovals(token);
    }, [router]);

    const fetchApprovals = async (token: string) => {
        try {
            const res = await fetch("http://localhost:5000/api/applications/approvals/pending", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setApprovals(data);
            }
        } catch (error) {
            console.error("Failed to fetch approvals");
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
                        <Link href="/dashboard/employee" className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-200 hover:text-black transition-colors">Opportunities</Link>
                        <Link href="/dashboard/employee/applications" className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-200 hover:text-black transition-colors">My Applications</Link>
                        <Link href="/dashboard/employee/history" className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-200 hover:text-black transition-colors">History</Link>
                        <Link href="/dashboard/employee/approvals" className="block px-4 py-3 text-sm font-bold text-black bg-white border border-gray-200 shadow-sm">Team Approvals</Link>
                    </nav>
                </div>
                <div className="p-4 border-t border-gray-200">
                    <button onClick={() => { localStorage.removeItem("prayas_token"); router.push("/login/employee"); }} className="w-full text-left px-4 py-3 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-200 transition-colors">Logout &rarr;</button>
                </div>
            </div>

            {/* 2. MAIN CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-10 bg-white">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8 border-b border-gray-200 pb-4">
                        <h2 className="text-3xl font-bold mb-1">Team Approvals</h2>
                        <p className="text-gray-500 text-sm">Review volunteer applications from your reportees.</p>
                    </div>

                    <div className="space-y-4">
                        {approvals.length === 0 ? (
                            <div className="py-12 text-center text-gray-500 border border-gray-200">No pending approvals.</div>
                        ) : (
                            approvals.map((app) => (
                                <div key={app.approval_id} className="border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                                    <div>
                                        <h3 className="font-bold text-lg">{app.applicant_name}</h3>
                                        <p className="text-sm text-gray-600 font-medium">{app.posting_title}</p>
                                        <p className="text-xs text-gray-500 mt-1">Application #{app.application_id} | Expected Hours: {app.expected_hours || 0}</p>
                                    </div>
                                    <div className="mt-4 md:mt-0 flex gap-3">
                                        <button className="px-4 py-2 border border-red-200 text-red-600 text-sm font-bold uppercase hover:bg-red-50 transition-colors">Reject</button>
                                        <button className="px-4 py-2 bg-black text-white text-sm font-bold uppercase hover:bg-gray-800 transition-colors">Approve</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
