"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NgoLogin() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    // OTP States
    const [showOtpScreen, setShowOtpScreen] = useState(false);
    const [otp, setOtp] = useState("");

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/ngo/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.token) {
                    localStorage.setItem("prayas_token", data.token);
                    router.push("/dashboard/ngo");
                } else if (data.otp_status === false) {
                    setShowOtpScreen(true);
                }
            } else {
                setError(data.error || "Invalid organizational credentials.");
            }
        } catch (err) {
            setError("Failed to connect to server.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/ngo/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            const data = await res.json();

            if (res.ok && data.token) {
                localStorage.setItem("prayas_token", data.token);
                router.push("/dashboard/ngo");
            } else {
                if (data.expired) {
                    setError("otp expired resend");
                } else {
                    setError(data.error || "Invalid OTP");
                }
            }
        } catch (err) {
            setError("Failed to verify OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md border border-gray-200 p-10 bg-white">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">NGO Access</h1>
                    <p className="text-sm text-gray-500">Manage opportunities and view impact metrics.</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex justify-between items-center">
                        <span>{error}</span>
                        {error === "otp expired resend" && (
                            <button 
                                type="button"
                                onClick={() => handleLogin()}
                                className="ml-4 underline text-red-900 font-semibold"
                            >
                                Resend OTP
                            </button>
                        )}
                    </div>
                )}

                {!showOtpScreen ? (
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
                                disabled={isLoading}
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
                                disabled={isLoading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-black text-white p-3 text-sm font-medium hover:bg-gray-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? "Authenticating..." : "Login"} <span aria-hidden="true">&rarr;</span>
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-4 border border-gray-200">
                            An OTP has been sent to your organizational email. Valid for 30 minutes.
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Enter 6-digit OTP</label>
                            <input
                                type="text"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full border border-gray-300 p-3 text-xl tracking-widest text-center outline-none focus:border-black"
                                placeholder="------"
                                maxLength={6}
                                disabled={isLoading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-black text-white p-3 text-sm font-medium hover:bg-gray-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? "Verifying..." : "Verify OTP"} <span aria-hidden="true">&rarr;</span>
                        </button>

                        <div className="mt-4 flex flex-col gap-2 text-center">
                            <button
                                type="button"
                                onClick={() => handleLogin()}
                                className="text-xs font-bold text-gray-500 hover:text-black underline transition-colors"
                            >
                                Didn't receive OTP? Resend
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowOtpScreen(false);
                                    setOtp("");
                                    setError("");
                                }}
                                className="text-xs font-bold text-gray-500 hover:text-black underline transition-colors"
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}