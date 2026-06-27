"use client";
import { useState, useEffect } from "react";
import Autocomplete from "react-google-autocomplete";
import { useRouter } from "next/navigation";

export default function NgoDashboard() {
    const router = useRouter();
    const [postings, setPostings] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        title: "",
        location: "",
        volunteersNeeded: "",
        technicalSkills: "",
        natureOfWork: "",
    });

    useEffect(() => {
        const token = localStorage.getItem("prayas_token");
        if (!token) {
            router.push("/login/ngo");
            return;
        }
        fetchPostings(token);
    }, [router]);

    const fetchPostings = async (token: string) => {
        const res = await fetch("http://localhost:5000/api/postings", {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            const data = await res.json();
            setPostings(data);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("prayas_token");

        const res = await fetch("http://localhost:5000/api/postings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(formData),
        });

        if (res.ok) {
            setFormData({ title: "", location: "", volunteersNeeded: "", technicalSkills: "", natureOfWork: "" });
            fetchPostings(token as string);
        }
    };

    const handleClosePosting = async (postingId: number) => {
        const token = localStorage.getItem("prayas_token");

        const res = await fetch(`http://localhost:5000/api/postings/${postingId}/close`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`
            },
        });

        if (res.ok) {
            // Refresh the list to remove the closed posting from the view
            fetchPostings(token as string);
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 p-8 max-w-6xl mx-auto">
            <div className="mb-8 border-b border-gray-200 pb-4 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-1">NGO Dashboard</h1>
                    <p className="text-gray-500 text-sm">Manage your organization's volunteer opportunities.</p>
                </div>
                <button
                    onClick={() => {
                        localStorage.removeItem("prayas_token");
                        router.push("/login/ngo");
                    }}
                    className="text-sm text-gray-500 hover:text-black underline"
                >
                    Logout
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="col-span-1 border border-gray-200 p-6 h-fit">
                    <h2 className="text-lg font-semibold mb-6 border-b border-gray-100 pb-2">Post New Requirement</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Project Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-black"
                                placeholder="e.g., Tree Plantation Drive"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Location</label>
                            <Autocomplete
                                apiKey="YOUR_GOOGLE_MAPS_API_KEY"
                                onPlaceSelected={(place) => {
                                    setFormData({ ...formData, location: place.formatted_address || "" });
                                }}
                                options={{ types: ["geocode", "establishment"] }}
                                className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-black"
                                placeholder="e.g., Downtown Community Center"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Volunteers Needed</label>
                            <input
                                type="number"
                                value={formData.volunteersNeeded}
                                onChange={(e) => setFormData({ ...formData, volunteersNeeded: e.target.value })}
                                className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-black"
                                placeholder="e.g., 5"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Required Skills</label>
                            <input
                                type="text"
                                value={formData.technicalSkills}
                                onChange={(e) => setFormData({ ...formData, technicalSkills: e.target.value })}
                                className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-black"
                                placeholder="e.g., Web Development"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Nature of Work</label>
                            <select
                                className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-black bg-white"
                                value={formData.natureOfWork}
                                onChange={(e) => setFormData({ ...formData, natureOfWork: e.target.value })}
                                required
                            >
                                <option value="" disabled>Select nature of work</option>
                                <option value="Education">Education / Training</option>
                                <option value="Environment">Environmental Conservation</option>
                                <option value="Healthcare">Health / Well-being</option>
                            </select>
                        </div>

                        <button type="submit" className="w-full bg-black text-white p-3 text-sm font-medium hover:bg-gray-800 transition-colors mt-4">
                            Post Requirement <span aria-hidden="true">&rarr;</span>
                        </button>
                    </form>
                </div>

                <div className="col-span-2">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-2">
                        <h2 className="text-lg font-semibold">Active Postings</h2>
                        <span className="text-xs bg-gray-100 px-2 py-1 text-gray-600 rounded">{postings.length} Opportunities</span>
                    </div>

                    {postings.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-10 border border-dashed border-gray-300">No active postings yet.</p>
                    ) : (
                        postings.map((post) => (
                            <div key={post.id} className="border border-gray-200 p-5 mb-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-semibold text-lg">{post.title}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{post.location}</p>
                                    </div>
                                    <span className="text-xs text-green-700 bg-green-50 px-2 py-1 flex items-center gap-1 border border-green-100">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                        Open (Need {post.volunteers_needed})
                                    </span>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <span className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2 py-1">{post.nature_of_work}</span>
                                    {post.technical_skills && (
                                        <span className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2 py-1">{post.technical_skills}</span>
                                    )}
                                </div>
                                <div className="border-t border-gray-100 pt-3 mt-2 flex justify-end">
                                    <button
                                        onClick={() => handleClosePosting(post.id)}
                                        className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors"
                                    >
                                        Close Posting &times;
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}