"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EvaluationFormG() {
    const params = useParams();
    const router = useRouter();
    const applicationId = params.id as string;
    
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(true);

    const clamp = (val: number, max: number) => Math.max(0, Math.min(val || 0, max));
    
    const [appDetails, setAppDetails] = useState<any>(null);
    const [evaluation, setEvaluation] = useState<any>({
        self_assessment: {
            hoursScore: 0,
            feedbackScore: 0,
            leadershipScore: 0,
            impactScore: 0,
            consistencyScore: 0,
            isSubmitted: false
        },
        ngo_assessment: {
            taskCompletion: 0,
            professionalism: 0,
            communityEngagement: 0,
            leadership: 0,
            overallSatisfaction: 0,
            hoursScore: 0,
            feedbackScore: 0,
            leadershipScore: 0,
            impactScore: 0,
            consistencyScore: 0,
            remarks: "",
            isSubmitted: false
        },
        final_score: {
            hoursScore: 0,
            feedbackScore: 0,
            leadershipScore: 0,
            impactScore: 0,
            consistencyScore: 0,
            total: 0,
            isSubmitted: false
        },
        recommendation: ""
    });

    useEffect(() => {
        const token = localStorage.getItem("prayas_token");
        if (!token) {
            router.push("/login/employee");
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setRole(payload.role || "");
        } catch (e) {}

        fetchData(token);
    }, [applicationId]);

    const fetchData = async (token: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/evaluations/${applicationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                setAppDetails(data.appDetails);
                if (data.evaluation) {
                    setEvaluation({
                        self_assessment: data.evaluation.self_assessment || evaluation.self_assessment,
                        ngo_assessment: data.evaluation.ngo_assessment || evaluation.ngo_assessment,
                        final_score: data.evaluation.final_score || evaluation.final_score,
                        recommendation: data.evaluation.recommendation || evaluation.recommendation
                    });
                }
            } else {
                alert("Failed to load evaluation data");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (section: string) => {
        const token = localStorage.getItem("prayas_token");
        if (!token) return;

        let payload: any = {};
        
        // Auto calculate final scores if NGO is saving
        let finalEval = { ...evaluation };

        if (section === 'employee') {
            payload = { self_assessment: { ...evaluation.self_assessment, isSubmitted: true } };
            finalEval.self_assessment.isSubmitted = true;
        } else if (section === 'ngo') {
            const ngo = evaluation.ngo_assessment;
            const finalScore = {
                hoursScore: ngo.hoursScore,
                feedbackScore: ngo.feedbackScore,
                leadershipScore: ngo.leadershipScore,
                impactScore: ngo.impactScore,
                consistencyScore: ngo.consistencyScore,
                total: ngo.hoursScore + ngo.feedbackScore + ngo.leadershipScore + ngo.impactScore + ngo.consistencyScore
            };
            
            let recommendation = "";
            if (finalScore.total < 60) recommendation = "Not Recommended";
            else if (finalScore.total >= 85) recommendation = "Outstanding Volunteer";
            else recommendation = "Impact Leader";

            payload = { 
                ngo_assessment: { ...ngo, isSubmitted: true },
                final_score: finalScore,
                recommendation: recommendation
            };
            
            finalEval.ngo_assessment.isSubmitted = true;
            finalEval.final_score = finalScore;
            finalEval.recommendation = recommendation;
        } else if (section === 'final') {
            payload = {
                final_score: { ...evaluation.final_score, isSubmitted: true },
                recommendation: evaluation.recommendation
            }
            finalEval.final_score.isSubmitted = true;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/evaluations/${applicationId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Saved successfully!");
                setEvaluation(finalEval);
            } else {
                alert("Failed to save.");
            }
        } catch (error) {
            alert("Error saving data.");
        }
    };

    if (loading) return <div className="p-10 font-bold">Loading Form-G...</div>;
    if (!appDetails) return <div className="p-10 text-red-600 font-bold">Application not found.</div>;

    const isEmployee = role === 'employee';
    const isNgo = role === 'ngo';
    const isDept = role === 'dept'; // Reporting officer

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-5xl mx-auto bg-white border border-gray-300 shadow-xl p-10">
                
                {/* Header */}
                <div className="text-center mb-10 border-b-2 border-black pb-6">
                    <h1 className="text-3xl font-black uppercase tracking-wider mb-2">PRAYAS Volunteer Evaluation Format</h1>
                    <h2 className="text-lg font-bold text-gray-600 uppercase tracking-widest">(For Recognition and Performance Assessment)</h2>
                    <div className="mt-4 inline-block bg-black text-white px-4 py-1 text-sm font-bold uppercase">Form-G</div>
                </div>

                {/* Part A: Basic Details */}
                <div className="mb-10">
                    <h3 className="text-xl font-bold uppercase tracking-wide border-b border-gray-200 pb-2 mb-4 bg-gray-100 p-2">Part A: Basic Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="border p-3"><span className="font-bold uppercase text-gray-500 block text-xs">Name of Volunteer</span> {appDetails.volunteer_name}</div>
                        <div className="border p-3"><span className="font-bold uppercase text-gray-500 block text-xs">Employee ID</span> {appDetails.employee_id}</div>
                        <div className="border p-3"><span className="font-bold uppercase text-gray-500 block text-xs">Designation</span> {appDetails.designation}</div>
                        <div className="border p-3"><span className="font-bold uppercase text-gray-500 block text-xs">Department/Unit</span> {appDetails.department}</div>
                        <div className="border p-3"><span className="font-bold uppercase text-gray-500 block text-xs">Contact Number</span> {appDetails.phone}</div>
                        <div className="border p-3"><span className="font-bold uppercase text-gray-500 block text-xs">Reporting Officer</span> {appDetails.reporting_officer || 'N/A'}</div>
                        <div className="border p-3 col-span-2"><span className="font-bold uppercase text-gray-500 block text-xs">Partner Organization</span> {appDetails.ngo_name}</div>
                    </div>
                </div>

                {/* Part B: Evaluation Criteria */}
                <div className="mb-10">
                    <h3 className="text-xl font-bold uppercase tracking-wide border-b border-gray-200 pb-2 mb-4 bg-gray-100 p-2">Part B: Evaluation Criteria</h3>
                    <table className="w-full text-sm border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-black text-white">
                                <th className="border border-gray-300 p-3 text-left">Evaluation Parameters</th>
                                <th className="border border-gray-300 p-3 text-center">Max Score</th>
                                <th className="border border-gray-300 p-3 text-center">Self-Assessment</th>
                                <th className="border border-gray-300 p-3 text-center">Partner Org Assessment</th>
                                <th className="border border-gray-300 p-3 text-center">Remarks (NGO)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Criteria 1 */}
                            <tr>
                                <td className="border border-gray-300 p-3">
                                    <p className="font-bold mb-1">1. Total Volunteering Hours</p>
                                    <ul className="text-xs text-gray-600 list-disc pl-4">
                                        <li>&lt; 24 Hours (0)</li>
                                        <li>24-50 Hours (10)</li>
                                        <li>&gt; 50 Hours (20)</li>
                                    </ul>
                                    <p className="mt-2 text-xs font-bold text-blue-600">Actual Hours Logged: {appDetails.total_hours}</p>
                                </td>
                                <td className="border border-gray-300 p-3 text-center font-bold">20</td>
                                <td className="border border-gray-300 p-3 text-center">
                                    <input type="number" min="0" max="20" disabled={!isEmployee || evaluation.self_assessment.isSubmitted} value={evaluation.self_assessment.hoursScore} onChange={(e) => setEvaluation({...evaluation, self_assessment: {...evaluation.self_assessment, hoursScore: clamp(Number(e.target.value), 20)}})} className="w-16 border border-gray-300 p-1 text-center font-bold disabled:bg-gray-100" />
                                </td>
                                <td className="border border-gray-300 p-3 text-center">
                                    <input type="number" min="0" max="20" disabled={!isNgo || evaluation.ngo_assessment.isSubmitted} value={evaluation.ngo_assessment.hoursScore} onChange={(e) => setEvaluation({...evaluation, ngo_assessment: {...evaluation.ngo_assessment, hoursScore: clamp(Number(e.target.value), 20)}})} className="w-16 border border-gray-300 p-1 text-center font-bold disabled:bg-gray-100" />
                                </td>
                                <td className="border border-gray-300 p-3" rowSpan={5}>
                                    <textarea disabled={!isNgo || evaluation.ngo_assessment.isSubmitted} value={evaluation.ngo_assessment.remarks} onChange={(e) => setEvaluation({...evaluation, ngo_assessment: {...evaluation.ngo_assessment, remarks: e.target.value}})} className="w-full h-full min-h-[200px] border border-gray-300 p-2 outline-none resize-none placeholder-gray-400 disabled:bg-gray-100 disabled:text-black" placeholder="NGO Remarks..."></textarea>
                                </td>
                            </tr>
                            {/* Criteria 2 */}
                            <tr>
                                <td className="border border-gray-300 p-3">
                                    <p className="font-bold mb-1">2. Feedback Score from Partner Org</p>
                                    <ul className="text-xs text-gray-600 list-disc pl-4">
                                        <li>4.0 - 4.49 (15)</li>
                                        <li>4.5 - 4.99 (20)</li>
                                        <li>5.0 (25)</li>
                                    </ul>
                                </td>
                                <td className="border border-gray-300 p-3 text-center font-bold">25</td>
                                <td className="border border-gray-300 p-3 text-center">
                                    <input type="number" min="0" max="25" disabled={!isEmployee || evaluation.self_assessment.isSubmitted} value={evaluation.self_assessment.feedbackScore} onChange={(e) => setEvaluation({...evaluation, self_assessment: {...evaluation.self_assessment, feedbackScore: clamp(Number(e.target.value), 25)}})} className="w-16 border border-gray-300 p-1 text-center font-bold disabled:bg-gray-100" />
                                </td>
                                <td className="border border-gray-300 p-3 text-center">
                                    <input type="number" min="0" max="25" disabled={!isNgo || evaluation.ngo_assessment.isSubmitted} value={evaluation.ngo_assessment.feedbackScore} onChange={(e) => setEvaluation({...evaluation, ngo_assessment: {...evaluation.ngo_assessment, feedbackScore: clamp(Number(e.target.value), 25)}})} className="w-16 border border-gray-300 p-1 text-center font-bold disabled:bg-gray-100" />
                                </td>
                            </tr>
                            {/* Criteria 3 */}
                            <tr>
                                <td className="border border-gray-300 p-3">
                                    <p className="font-bold mb-1">3. Leadership / Initiative</p>
                                    <ul className="text-xs text-gray-600 list-disc pl-4">
                                        <li>Active Participant (10)</li>
                                        <li>Team Organizer (15)</li>
                                        <li>Team Leader (20)</li>
                                    </ul>
                                </td>
                                <td className="border border-gray-300 p-3 text-center font-bold">20</td>
                                <td className="border border-gray-300 p-3 text-center">
                                    <input type="number" min="0" max="20" disabled={!isEmployee || evaluation.self_assessment.isSubmitted} value={evaluation.self_assessment.leadershipScore} onChange={(e) => setEvaluation({...evaluation, self_assessment: {...evaluation.self_assessment, leadershipScore: clamp(Number(e.target.value), 20)}})} className="w-16 border border-gray-300 p-1 text-center font-bold disabled:bg-gray-100" />
                                </td>
                                <td className="border border-gray-300 p-3 text-center">
                                    <input type="number" min="0" max="20" disabled={!isNgo || evaluation.ngo_assessment.isSubmitted} value={evaluation.ngo_assessment.leadershipScore} onChange={(e) => setEvaluation({...evaluation, ngo_assessment: {...evaluation.ngo_assessment, leadershipScore: clamp(Number(e.target.value), 20)}})} className="w-16 border border-gray-300 p-1 text-center font-bold disabled:bg-gray-100" />
                                </td>
                            </tr>
                            {/* Criteria 4 */}
                            <tr>
                                <td className="border border-gray-300 p-3">
                                    <p className="font-bold mb-1">4. Documented Community Impact</p>
                                    <ul className="text-xs text-gray-600 list-disc pl-4">
                                        <li>Limited Impact (10)</li>
                                        <li>Notable Impact (15)</li>
                                        <li>Significant Impact (25)</li>
                                    </ul>
                                </td>
                                <td className="border border-gray-300 p-3 text-center font-bold">25</td>
                                <td className="border border-gray-300 p-3 text-center">
                                    <input type="number" min="0" max="25" disabled={!isEmployee || evaluation.self_assessment.isSubmitted} value={evaluation.self_assessment.impactScore} onChange={(e) => setEvaluation({...evaluation, self_assessment: {...evaluation.self_assessment, impactScore: clamp(Number(e.target.value), 25)}})} className="w-16 border border-gray-300 p-1 text-center font-bold disabled:bg-gray-100" />
                                </td>
                                <td className="border border-gray-300 p-3 text-center">
                                    <input type="number" min="0" max="25" disabled={!isNgo || evaluation.ngo_assessment.isSubmitted} value={evaluation.ngo_assessment.impactScore} onChange={(e) => setEvaluation({...evaluation, ngo_assessment: {...evaluation.ngo_assessment, impactScore: clamp(Number(e.target.value), 25)}})} className="w-16 border border-gray-300 p-1 text-center font-bold disabled:bg-gray-100" />
                                </td>
                            </tr>
                            {/* Criteria 5 */}
                            <tr>
                                <td className="border border-gray-300 p-3">
                                    <p className="font-bold mb-1">5. Consistency and Commitment</p>
                                    <ul className="text-xs text-gray-600 list-disc pl-4">
                                        <li>One-time Engagement (5)</li>
                                        <li>Sustained Engagement (10)</li>
                                    </ul>
                                </td>
                                <td className="border border-gray-300 p-3 text-center font-bold">10</td>
                                <td className="border border-gray-300 p-3 text-center">
                                    <input type="number" min="0" max="10" disabled={!isEmployee || evaluation.self_assessment.isSubmitted} value={evaluation.self_assessment.consistencyScore} onChange={(e) => setEvaluation({...evaluation, self_assessment: {...evaluation.self_assessment, consistencyScore: clamp(Number(e.target.value), 10)}})} className="w-16 border border-gray-300 p-1 text-center font-bold disabled:bg-gray-100" />
                                </td>
                                <td className="border border-gray-300 p-3 text-center">
                                    <input type="number" min="0" max="10" disabled={!isNgo || evaluation.ngo_assessment.isSubmitted} value={evaluation.ngo_assessment.consistencyScore} onChange={(e) => setEvaluation({...evaluation, ngo_assessment: {...evaluation.ngo_assessment, consistencyScore: clamp(Number(e.target.value), 10)}})} className="w-16 border border-gray-300 p-1 text-center font-bold disabled:bg-gray-100" />
                                </td>
                            </tr>
                            {/* Totals */}
                            <tr className="bg-gray-100 font-bold">
                                <td className="border border-gray-300 p-3 text-right">TOTAL</td>
                                <td className="border border-gray-300 p-3 text-center">100</td>
                                <td className="border border-gray-300 p-3 text-center">
                                    {evaluation.self_assessment.hoursScore + evaluation.self_assessment.feedbackScore + evaluation.self_assessment.leadershipScore + evaluation.self_assessment.impactScore + evaluation.self_assessment.consistencyScore}
                                </td>
                                <td className="border border-gray-300 p-3 text-center text-blue-700 text-lg">
                                    {evaluation.ngo_assessment.hoursScore + evaluation.ngo_assessment.feedbackScore + evaluation.ngo_assessment.leadershipScore + evaluation.ngo_assessment.impactScore + evaluation.ngo_assessment.consistencyScore}
                                </td>
                                <td className="border border-gray-300 p-3"></td>
                            </tr>
                        </tbody>
                    </table>

                    {isEmployee && !evaluation.self_assessment.isSubmitted && (
                        <div className="mt-4 flex justify-end">
                            <button onClick={() => handleSave('employee')} className="bg-black text-white px-6 py-2 font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors">
                                Save Self-Assessment
                            </button>
                        </div>
                    )}
                    {isEmployee && evaluation.self_assessment.isSubmitted && (
                        <div className="mt-4 flex justify-end">
                            <span className="bg-gray-200 text-gray-500 px-6 py-2 font-bold uppercase tracking-wide cursor-not-allowed">
                                Self-Assessment Submitted
                            </span>
                        </div>
                    )}
                </div>

                {/* Part C: Partner Organization Feedback Summary */}
                <div className="mb-10">
                    <h3 className="text-xl font-bold uppercase tracking-wide border-b border-gray-200 pb-2 mb-4 bg-gray-100 p-2">Part C: Partner Org Feedback</h3>
                    <table className="w-full text-sm border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-black text-white">
                                <th className="border border-gray-300 p-3 text-left w-1/3">Feedback Area</th>
                                <th className="border border-gray-300 p-2 text-center text-xs">Poor (1)</th>
                                <th className="border border-gray-300 p-2 text-center text-xs">Fair (2)</th>
                                <th className="border border-gray-300 p-2 text-center text-xs">Good (3)</th>
                                <th className="border border-gray-300 p-2 text-center text-xs">Very Good (4)</th>
                                <th className="border border-gray-300 p-2 text-center text-xs">Excellent (5)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {['taskCompletion', 'professionalism', 'communityEngagement', 'leadership', 'overallSatisfaction'].map((field) => (
                                <tr key={field} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 p-3 font-bold capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</td>
                                    {[1, 2, 3, 4, 5].map(val => (
                                        <td key={val} className="border border-gray-300 p-3 text-center">
                                            <input type="radio" name={field} disabled={!isNgo || evaluation.ngo_assessment.isSubmitted} checked={evaluation.ngo_assessment[field] === val} onChange={() => setEvaluation({...evaluation, ngo_assessment: {...evaluation.ngo_assessment, [field]: val}})} className="w-4 h-4 cursor-pointer" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Part D & E Group */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                    {/* Part D: Final Evaluation Score */}
                    <div>
                        <h3 className="text-xl font-bold uppercase tracking-wide border-b border-gray-200 pb-2 mb-4 bg-gray-100 p-2">Part D: Final Score</h3>
                        <table className="w-full text-sm border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-black text-white">
                                    <th className="border border-gray-300 p-2 text-left">Component</th>
                                    <th className="border border-gray-300 p-2 text-center">Max</th>
                                    <th className="border border-gray-300 p-2 text-center">Awarded</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 p-2">Total Volunteering Hours</td>
                                    <td className="border border-gray-300 p-2 text-center font-bold">20</td>
                                    <td className="border border-gray-300 p-2 text-center text-blue-700 font-bold">{evaluation.final_score.hoursScore}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-2">Feedback Score</td>
                                    <td className="border border-gray-300 p-2 text-center font-bold">25</td>
                                    <td className="border border-gray-300 p-2 text-center text-blue-700 font-bold">{evaluation.final_score.feedbackScore}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-2">Leadership/Initiative</td>
                                    <td className="border border-gray-300 p-2 text-center font-bold">20</td>
                                    <td className="border border-gray-300 p-2 text-center text-blue-700 font-bold">{evaluation.final_score.leadershipScore}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-2">Documented Community Impact</td>
                                    <td className="border border-gray-300 p-2 text-center font-bold">25</td>
                                    <td className="border border-gray-300 p-2 text-center text-blue-700 font-bold">{evaluation.final_score.impactScore}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-2">Consistency/Commitment</td>
                                    <td className="border border-gray-300 p-2 text-center font-bold">10</td>
                                    <td className="border border-gray-300 p-2 text-center text-blue-700 font-bold">{evaluation.final_score.consistencyScore}</td>
                                </tr>
                                <tr className="bg-gray-100 font-black">
                                    <td className="border border-gray-300 p-2 text-right">TOTAL SCORE</td>
                                    <td className="border border-gray-300 p-2 text-center">100</td>
                                    <td className="border border-gray-300 p-2 text-center text-xl text-green-700">{evaluation.final_score.total}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Part E: Recommendation */}
                    <div>
                        <h3 className="text-xl font-bold uppercase tracking-wide border-b border-gray-200 pb-2 mb-4 bg-gray-100 p-2">Part E: Recommendation</h3>
                        
                        <div className="space-y-4 text-sm font-bold mt-6">
                            <label className="flex items-center space-x-3 cursor-pointer p-3 border hover:bg-gray-50">
                                <input type="radio" disabled={(!isDept && !isNgo) || (isDept && evaluation.final_score.isSubmitted) || (isNgo && evaluation.ngo_assessment.isSubmitted)} name="recommendation" checked={evaluation.recommendation === 'Outstanding Volunteer'} onChange={() => setEvaluation({...evaluation, recommendation: 'Outstanding Volunteer'})} className="w-5 h-5 text-black focus:ring-black" />
                                <span>Outstanding Volunteer</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer p-3 border hover:bg-gray-50">
                                <input type="radio" disabled={(!isDept && !isNgo) || (isDept && evaluation.final_score.isSubmitted) || (isNgo && evaluation.ngo_assessment.isSubmitted)} name="recommendation" checked={evaluation.recommendation === 'Impact Leader'} onChange={() => setEvaluation({...evaluation, recommendation: 'Impact Leader'})} className="w-5 h-5 text-black focus:ring-black" />
                                <span>Impact Leader</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer p-3 border hover:bg-gray-50">
                                <input type="radio" disabled={(!isDept && !isNgo) || (isDept && evaluation.final_score.isSubmitted) || (isNgo && evaluation.ngo_assessment.isSubmitted)} name="recommendation" checked={evaluation.recommendation === 'Not Recommended'} onChange={() => setEvaluation({...evaluation, recommendation: 'Not Recommended'})} className="w-5 h-5 text-black focus:ring-black" />
                                <span>Not Recommended for Award (Score &lt; 60%)</span>
                            </label>
                        </div>
                    </div>
                </div>

                {isNgo && !evaluation.ngo_assessment.isSubmitted && (
                    <div className="flex justify-end mb-10 border-t border-gray-300 pt-6">
                        <button onClick={() => handleSave('ngo')} className="bg-blue-600 text-white px-8 py-3 font-bold uppercase tracking-wide hover:bg-blue-800 transition-colors shadow-lg">
                            Submit NGO Assessment & Finalize Score
                        </button>
                    </div>
                )}
                {isNgo && evaluation.ngo_assessment.isSubmitted && (
                    <div className="flex justify-end mb-10 border-t border-gray-300 pt-6">
                        <span className="bg-gray-200 text-gray-500 px-8 py-3 font-bold uppercase tracking-wide cursor-not-allowed shadow-lg">
                            NGO Assessment Submitted
                        </span>
                    </div>
                )}
                
                {isDept && !evaluation.final_score.isSubmitted && (
                    <div className="flex justify-end mb-10 border-t border-gray-300 pt-6">
                        <button onClick={() => handleSave('final')} className="bg-black text-white px-8 py-3 font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors shadow-lg">
                            Save Recommendation (Dept)
                        </button>
                    </div>
                )}
                {isDept && evaluation.final_score.isSubmitted && (
                    <div className="flex justify-end mb-10 border-t border-gray-300 pt-6">
                        <span className="bg-gray-200 text-gray-500 px-8 py-3 font-bold uppercase tracking-wide cursor-not-allowed shadow-lg">
                            Dept Recommendation Submitted
                        </span>
                    </div>
                )}

                {/* Footer Notes */}
                <div className="text-xs text-gray-500 border-t-2 border-dashed border-gray-300 pt-6 space-y-1 font-medium">
                    <p><strong>Notes:</strong> Minimum total score for recognition: 60/100</p>
                    <p>This format should be completed jointly by the volunteer, partner organization, and the evaluation committee.</p>
                    <p>Supporting documents: NGO reports, community testimonials, photos, or media coverage must be attached separately.</p>
                </div>
            </div>
            
            <div className="max-w-5xl mx-auto mt-6">
                <button onClick={() => router.back()} className="text-gray-600 hover:text-black font-bold uppercase tracking-wider text-sm">
                    &larr; Back to Dashboard
                </button>
            </div>
        </div>
    );
}
