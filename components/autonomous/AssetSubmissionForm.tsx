import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Basic API call stub - adapt to your actual API logic
async function createSubmission(data: any) {
    // Use the NEW Backend URL (Port 3001)
    const response = await fetch('http://localhost:3001/submissions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to create submission');
    }

    return response.json();
}

export default function AssetSubmissionForm() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        did: user?.id || 'did:polygon:guest',
        walletSignature: '0xmocksignature',
        category: 'real-estate',
        tokenizationIntent: '',
        location: {
            address: '',
            city: '',
            state: '',
            country: '',
            coordinates: { lat: 0, lng: 0 }
        },
        financials: {
            expectedYield: 0,
            expenses: 0,
            cashFlow: 0
        },
        registryIds: [],
        imageUrls: []
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const submission = await createSubmission(formData);
            // Navigate to verification status page (we need to create this too)
            navigate(`/autonomous/verify/${submission.submissionId}`);
        } catch (error) {
            console.error(error);
            alert('Failed to submit asset');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (section: string, field: string, value: any) => {
        if (section === 'root') {
            setFormData(prev => ({ ...prev, [field]: value }));
        } else {
            // @ts-ignore
            setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-lg shadow border border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Submit Asset for ABM Verification</h2>

            {/* Asset Data */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Asset Details</h3>
                <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400">Category</label>
                    <select
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 shadow-sm p-2 border bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        value={formData.category}
                        onChange={(e) => handleChange('root', 'category', e.target.value)}
                    >
                        <option value="real-estate">Real Estate</option>
                        <option value="commercial">Commercial</option>
                        <option value="commodity">Commodity</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400">Intent</label>
                    <textarea
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 shadow-sm p-2 border bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        rows={3}
                        value={formData.tokenizationIntent}
                        onChange={(e) => handleChange('root', 'tokenizationIntent', e.target.value)}
                        placeholder="Why do you want to tokenize this asset?"
                    />
                </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Location</h3>
                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text" placeholder="Address"
                        className="col-span-2 rounded border p-2 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        value={formData.location.address}
                        onChange={(e) => handleChange('location', 'address', e.target.value)}
                    />
                    <input
                        type="text" placeholder="City"
                        className="rounded border p-2 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        value={formData.location.city}
                        onChange={(e) => handleChange('location', 'city', e.target.value)}
                    />
                    <input
                        type="text" placeholder="Country"
                        className="rounded border p-2 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        value={formData.location.country}
                        onChange={(e) => handleChange('location', 'country', e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="col-span-1">
                        <label className="block text-xs text-slate-500 mb-1">Latitude</label>
                        <input
                            type="number" step="0.000001" placeholder="e.g. 28.4595"
                            className="w-full rounded border p-2 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            value={formData.location.coordinates.lat}
                            onChange={(e) => handleChange('location', 'coordinates', { ...formData.location.coordinates, lat: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs text-slate-500 mb-1">Longitude</label>
                        <input
                            type="number" step="0.000001" placeholder="e.g. 77.0266"
                            className="w-full rounded border p-2 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            value={formData.location.coordinates.lng}
                            onChange={(e) => handleChange('location', 'coordinates', { ...formData.location.coordinates, lng: parseFloat(e.target.value) })}
                        />
                    </div>
                </div>
            </div>

            {/* Financials */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Financials</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-slate-500">Expected Yield (%)</label>
                        <input
                            type="number" step="0.1"
                            className="w-full rounded border p-2 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            value={formData.financials.expectedYield}
                            onChange={(e) => handleChange('financials', 'expectedYield', parseFloat(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500">Annual Expenses</label>
                        <input
                            type="number"
                            className="w-full rounded border p-2 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            value={formData.financials.expenses}
                            onChange={(e) => handleChange('financials', 'expenses', parseFloat(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:bg-gray-400 font-bold uppercase tracking-widest"
            >
                {loading ? 'Submitting...' : 'Submit for Autonomous Verification'}
            </button>
        </form>
    );
}
