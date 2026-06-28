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
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Only show on dashboard pages
    const isDashboard = pathname?.startsWith("/dashboard");

    const fetchActions = async () => {
        if (!isDashboard) return;
        const token = localStorage.getItem("prayas_token");
        if (!token) return;

        try {
            const res = await fetch("http://localhost:5000/api/notifications/action-required", {
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

    // Auto-open if there are actions and it wasn't explicitly closed, or just leave it up to the user.
    // Let's just have it closed by default but show a badge.

    if (!isDashboard) return null;

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed right-0 top-1/2 -translate-y-1/2 bg-black text-white p-3 rounded-l-lg shadow-lg z-50 flex flex-col items-center gap-2 hover:bg-gray-800 transition-colors"
            >
                <span className="writing-vertical-rl rotate-180 text-xs font-bold uppercase tracking-widest" style={{ writingMode: 'vertical-rl' }}>
                    Action Center
                </span>
                {actions.length > 0 && (
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
                        {actions.length}
                    </span>
                )}
            </button>

            {/* Sidebar */}
            <div 
                className={`fixed right-0 top-0 h-full w-80 bg-gray-50 border-l border-gray-200 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white">
                    <div>
                        <h2 className="text-lg font-bold uppercase tracking-tight">Action Center</h2>
                        <p className="text-[10px] text-gray-500 font-bold tracking-widest mt-1">PENDING TASKS</p>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-black text-2xl font-bold"
                    >
                        &times;
                    </button>
                </div>

                <div className="p-4 overflow-y-auto h-[calc(100vh-80px)]">
                    {loading ? (
                        <div className="text-center text-sm text-gray-500 py-10">Loading...</div>
                    ) : actions.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">✨</span>
                            </div>
                            <p className="text-sm font-bold text-gray-700">All caught up!</p>
                            <p className="text-xs text-gray-500 mt-1">No pending actions required.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {actions.map((action, idx) => (
                                <div key={`${action.id}-${idx}`} className="bg-white border-l-4 border-red-500 border-t border-r border-b border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex gap-3 mb-2">
                                        <span className="text-red-500 text-lg mt-0.5">⚠️</span>
                                        <p className="text-sm font-medium text-gray-800 leading-tight">
                                            {action.message}
                                        </p>
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <Link 
                                            href={action.link}
                                            onClick={() => setIsOpen(false)}
                                            className="text-[10px] font-bold bg-black text-white px-3 py-1.5 uppercase tracking-wider hover:bg-gray-800 transition-colors"
                                        >
                                            Resolve &rarr;
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Backdrop for mobile (optional) */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
