"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NgoLogin() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("http://localhost:5000/api/auth/ngo/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (data.success) {
                localStorage.setItem("prayas_token", data.token);
                router.push("/dashboard/ngo");
            } else {
                setError("Invalid organizational credentials.");
            }
        } catch (err) {
            setError("Failed to connect to server.");
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md border border-gray-200 p-10 bg-white">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">NGO Access</h1>
                    <p className="text-sm text-gray-500">Manage opportunities and view impact metrics.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Organizational Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="contact@ngo-domain.org"
                            className="w-full border border-gray-300 p-3 text-sm outline-none focus:border-black"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full border border-gray-300 p-3 text-sm outline-none focus:border-black"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-xs">{error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-black text-white p-3 text-sm font-medium hover:bg-gray-800 transition-colors flex justify-center items-center gap-2"
                    >
                        Login <span aria-hidden="true">&rarr;</span>
                    </button>
                </form>
            </div>
        </div>
    );
}