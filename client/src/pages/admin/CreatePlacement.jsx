import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Save, X } from 'lucide-react';

export default function CreatePlacement() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        company_name: '',
        role: '',
        job_type: 'INTERNSHIP',
        stipend_ctc: '',
        description: '',
        deadline: '',
        min_cgpa: 0,
        allowed_branches: [], // Will verify if backend supports open by empty, for now UI handles basic input
    });

    const [branches, setBranches] = useState([]); // Simple text input for now or multi-select could be complex
    // Let's use a simpler approach for branches: pre-defined checkboxes for common branches
    const availableBranches = ['CSE', 'IT', 'AI', 'ENTC', 'MECH', 'CIVIL'];
    const availableYears = [1, 2, 3, 4];
    const [selectedYears, setSelectedYears] = useState([]);
    const [selectedBranches, setSelectedBranches] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                ...formData,
                eligibility: {
                    min_cgpa: Number(formData.min_cgpa),
                    allowed_branches: selectedBranches,
                    allowed_years: selectedYears
                }
            };

            const response = await fetch('/api/placement/admin/drives', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to create drive');
            }

            navigate('/admin/placements');

        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const toggleBranch = (branch) => {
        setSelectedBranches(prev =>
            prev.includes(branch) ? prev.filter(b => b !== branch) : [...prev, branch]
        );
    };

    const toggleYear = (year) => {
        setSelectedYears(prev =>
            prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
        );
    };

    return (
        <AdminLayout title="Create New Drive">
            <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>

                {/* Section 1: Job Details */}
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#334155', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    Job Details
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>Company Name</label>
                        <input
                            required
                            type="text"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            value={formData.company_name}
                            onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>Job Role</label>
                        <input
                            required
                            type="text"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>Job Type</label>
                        <select
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            value={formData.job_type}
                            onChange={e => setFormData({ ...formData, job_type: e.target.value })}
                        >
                            <option value="INTERNSHIP">Internship</option>
                            <option value="FULL_TIME">Full Time</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>Stipend / CTC</label>
                        <input
                            type="text"
                            placeholder="e.g. 15k/month or 12 LPA"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            value={formData.stipend_ctc}
                            onChange={e => setFormData({ ...formData, stipend_ctc: e.target.value })}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>Description</label>
                    <textarea
                        rows={4}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>Application Deadline</label>
                    <input
                        required
                        type="datetime-local"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        value={formData.deadline}
                        onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                    />
                </div>

                {/* Section 2: Eligibility */}
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#334155', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    Eligibility Criteria
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>Minimum CGPA</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="10"
                            style={{ width: '100px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            value={formData.min_cgpa}
                            onChange={e => setFormData({ ...formData, min_cgpa: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>Allowed Branches</label>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {availableBranches.map(branch => (
                                <button
                                    key={branch}
                                    type="button"
                                    onClick={() => toggleBranch(branch)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        border: selectedBranches.includes(branch) ? '1px solid #4c1d95' : '1px solid #cbd5e1',
                                        background: selectedBranches.includes(branch) ? '#f3e8ff' : 'white',
                                        color: selectedBranches.includes(branch) ? '#4c1d95' : '#64748b',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {branch}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>Allowed Years</label>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {availableYears.map(year => (
                                <button
                                    key={year}
                                    type="button"
                                    onClick={() => toggleYear(year)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        border: selectedYears.includes(year) ? '1px solid #4c1d95' : '1px solid #cbd5e1',
                                        background: selectedYears.includes(year) ? '#f3e8ff' : 'white',
                                        color: selectedYears.includes(year) ? '#4c1d95' : '#64748b',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    Year {year}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/placements')}
                        style={{
                            padding: '1rem 2rem', borderRadius: '12px', border: '1px solid #cbd5e1',
                            background: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            padding: '1rem 2rem', borderRadius: '12px', border: 'none',
                            background: '#4c1d95', color: 'white', fontWeight: '600', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: submitting ? 0.7 : 1
                        }}
                    >
                        <Save size={20} />
                        {submitting ? 'Creating...' : 'Create Drive'}
                    </button>
                </div>

            </form>
        </AdminLayout>
    );
}
