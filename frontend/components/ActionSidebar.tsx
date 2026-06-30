"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

interface ActionItem {
    id: number;
    type: string;
    message: string;
    link: string;
}

export default function ActionSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [actions, setActions] = useState<ActionItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Only show on dashboard pages
    const isDashboard = pathname?.startsWith("/dashboard");

    const fetchActions = async () => {
        if (!isDashboard) return;
        const token = localStorage.getItem("prayas_token");
        if (!token) return;

        try {
            const res = await fetch("/api/notifications/action-required", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setActions(data.actions || []);
            }
        } catch (error) {
            console.error("Failed to fetch actions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActions();
        
        // Poll every 30 seconds
        const interval = setInterval(() => {
            fetchActions();
        }, 30000);

        return () => clearInterval(interval);
    }, [pathname, isDashboard]);

    if (!isDashboard) return null;

    return (
        <div className="bg-white border border-gray-200 shadow-sm p-4 mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-800 mb-3 border-b border-gray-200 pb-2">Action Center</h3>
            {loading ? (
                <div className="text-center text-xs text-gray-500 py-2">Loading...</div>
            ) : actions.length === 0 ? (
                <div className="flex items-center justify-center py-4 bg-gray-50 border border-dashed border-gray-300">
                    <p className="text-sm font-bold text-gray-500">No pending approvals</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                    {actions.map((action, idx) => (
                        <div key={`${action.id}-${idx}`} className="bg-red-50 border border-red-200 p-3 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="text-red-500 text-sm">⚠️</span>
                                <p className="text-xs font-medium text-gray-800">
                                    {action.message}
                                </p>
                            </div>
                            <Link 
                                href={action.link}
                                className="text-[10px] font-bold bg-black text-white px-4 py-2 uppercase tracking-wider hover:bg-gray-800 transition-colors shrink-0"
                            >
                                Resolve &rarr;
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
