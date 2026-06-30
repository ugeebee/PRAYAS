"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function TokenExpiry() {
    const [expiryTime, setExpiryTime] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const token = localStorage.getItem("prayas_token");
        if (!token) {
            setExpiryTime(null);
            return;
        }

        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const decodedToken = JSON.parse(jsonPayload);
            if (decodedToken.exp) {
                const date = new Date(decodedToken.exp * 1000);
                setExpiryTime(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

                const handleLogout = () => {
                    localStorage.removeItem("prayas_token");
                    if (decodedToken.role === 'ngo') window.location.href = "/login/ngo";
                    else if (decodedToken.role === 'employee') window.location.href = "/login/employee";
                    else if (decodedToken.role === 'dept') window.location.href = "/login/department";
                    else window.location.href = "/";
                };

                // Optional: Auto logout when time expires
                const timeUntilExpiry = (decodedToken.exp * 1000) - Date.now();
                if (timeUntilExpiry > 0) {
                    const timer = setTimeout(handleLogout, timeUntilExpiry);
                    return () => clearTimeout(timer);
                } else {
                    handleLogout();
                }
            }
        } catch (error) {
            console.error("Error decoding token for expiry");
        }
    }, [router, pathname]);

    if (!expiryTime) return null;

    return (
        <div className="fixed top-4 right-4 z-50 bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-lg">
            Auto-logout at: {expiryTime}
        </div>
    );
}
