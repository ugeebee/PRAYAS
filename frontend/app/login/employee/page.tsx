"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EmployeeLogin() {
    const router = useRouter();
    const [employeeId, setEmployeeId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    
    // OTP States
    const [otpStatus, setOtpStatus] = useState(false); // false = not verified/waiting
    const [showOtpScreen, setShowOtpScreen] = useState(false);
    const [otp, setOtp] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/auth/employee/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employeeId, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // If it returns a token immediately (fallback)
                if (data.token) {
                    localStorage.setItem("prayas_token", data.token);
                    router.push("/dashboard/employee");
                } 
                // If it indicates OTP is sent
                else if (data.otp_status === false) {
                    setMobileNumber(data.mobile);
                    setShowOtpScreen(true);
                    setOtpStatus(false);
                    setError(""); // clear any previous errors
                }
            } else {
                setError(data.error || "Login failed. Please check your credentials.");
            }
        } catch (err) {
            setError("Failed to connect to the server.");
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/auth/employee/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    employeeId, 
                    otp,
                    clientTime: new Date().toISOString()
                }),
            });

            const data = await res.json();

            if (res.ok && data.token) {
                setOtpStatus(true);
                localStorage.setItem("prayas_token", data.token);
                router.push("/dashboard/employee");
            } else {
                if (data.expired) {
                    setError("otp expired resend");
                } else {
                    setError(data.error || "Invalid OTP");
                }
            }
        } catch (err) {
            setError("Failed to verify OTP.");
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
                    <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 flex justify-between items-center">
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
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Employee ID</label>
                            <input
                                type="text"
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                                className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-black uppercase"
                                placeholder="000000A"
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
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-3 border border-gray-200">
                            An OTP has been sent to your mobile number: <span className="font-semibold text-black">{mobileNumber.replace(/.(?=.{4})/g, '*')}</span>. Valid for 30 minutes.
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Enter 6-digit OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-black tracking-widest text-center text-lg"
                                placeholder="------"
                                maxLength={6}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-black text-white p-3 text-sm font-medium hover:bg-gray-800 transition-colors mt-2"
                        >
                            Verify OTP &rarr;
                        </button>
                        
                        <div className="mt-4 text-center">
                            <button
                                type="button"
                                onClick={() => handleLogin()}
                                className="text-xs text-gray-500 hover:text-black underline"
                            >
                                Didn't receive OTP? Resend
                            </button>
                        </div>
                        <div className="mt-2 text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowOtpScreen(false);
                                    setOtp("");
                                    setError("");
                                }}
                                className="text-xs text-gray-500 hover:text-black underline"
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-6 text-center text-xs text-gray-500">
                    Are you an NGO? <Link href="/login/ngo" className="text-black underline">Login here</Link>
                </div>
            </div>
        </div>
    );
}