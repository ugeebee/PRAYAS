"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EmployeeLogin() {
    const router = useRouter();
    const [employeeId, setEmployeeId] = useState(""); // Changed from email
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("http://localhost:5000/api/auth/employee/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employeeId, password }), // Changed from email
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("prayas_token", data.token);
                router.push("/dashboard/employee");
            } else {
                setError(data.error || "Login failed. Please check your credentials.");
            }
        } catch (err) {
            setError("Failed to connect to the server.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 text-gray-900">
            <div className="w-full max-w-md bg-white border border-gray-200 p-8 shadow-sm">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">Employee Login</h1>
                    <p className="text-sm text-gray-500">Sign in with your NHPC credentials.</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        {/* Updated Label and Input */}
                        <label className="block text-xs font-medium text-gray-700 mb-1">Employee ID</label>
                        <input
                            type="text"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                            className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-black uppercase"
                            placeholder="e.g., NHPC1001"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-black"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black text-white p-3 text-sm font-medium hover:bg-gray-800 transition-colors mt-2"
                    >
                        Sign In &rarr;
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-500">
                    Are you an NGO? <Link href="/login/ngo" className="text-black underline">Login here</Link>
                </div>
            </div>
        </div>
    );
}