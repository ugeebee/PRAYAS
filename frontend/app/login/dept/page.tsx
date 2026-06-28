"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DeptLogin() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/dept/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("prayas_token", data.token);
                router.push("/dashboard/dept");
            } else {
                setError(data.error || "Invalid credentials. Please check with IT.");
            }
        } catch (err) {
            setError("Connection error. Ensure the main backend is running.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 font-sans">
            <div className="w-full max-w-md bg-white border border-gray-300 p-8 shadow-xl relative">

                {/* Decorative Header Bar */}
                <div className="absolute top-0 left-0 w-full h-2 bg-black"></div>

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold uppercase tracking-tight text-gray-900 mb-1">Prayas</h1>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest border-b border-gray-200 pb-4 inline-block px-4">
                        Department Access Portal
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Official Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 p-3 text-sm outline-none focus:border-black transition-colors rounded-none"
                            placeholder="e.g., csr@nhpc.com"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 p-3 text-sm outline-none focus:border-black transition-colors rounded-none"
                            placeholder="••••••••"
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-black text-white p-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-colors mt-4"
                    >
                        {isLoading ? "Authenticating..." : "Login to Console"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col gap-3 text-center">
                    <Link href="/login/employee" className="text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wider transition-colors">
                        &larr; Employee Login
                    </Link>
                    <Link href="/login/ngo" className="text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wider transition-colors">
                        &larr; NGO Login
                    </Link>
                </div>
            </div>

            <div className="mt-8 text-center text-xs text-gray-400 font-medium">
                <p>Restricted Access. Authorized Personnel Only.</p>
            </div>
        </div>
    );
}