import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/image.png';

export default function ProfileSetup() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        enrollment_no: '',
        branch: 'CS',
        academic_year: new Date().getFullYear()
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put('/users/profile', formData);
            if (res.data.token) {
                login(res.data.token); // Update context with new user data
                navigate('/student');
            }
        } catch (err) {
            console.error('Profile update error:', err);
            setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-grey)' }}>

            {/* Header */}
            <div className="mit-header" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <img src={logo} alt="Logo" className="mit-logo" style={{ height: '40px', width: 'auto' }} />
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ fontSize: 'clamp(0.9rem, 3vw, 1.25rem)', marginBottom: 0, whiteSpace: 'nowrap' }}>Placement & Attendance Portal</h1>
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(0.5rem, 5vw, 2rem)' }}>
                <div className="mit-card" style={{ width: '100%', maxWidth: '500px', padding: 'clamp(1rem, 5vw, 1.5rem)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ color: 'var(--mit-purple)', marginBottom: '0.5rem', fontSize: 'clamp(1.25rem, 4vw, 1.75rem)' }}>Complete Your Profile</h2>
                        <p style={{ color: 'var(--text-light)', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>Please enter your academic details to continue.</p>
                    </div>

                    {error && <div style={{ marginBottom: '1rem', color: 'var(--error-red)', textAlign: 'center' }}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>Full Name</label>
                            <input
                                className="mit-input"
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Rohini Sharma"
                                style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>Enrollment Number</label>
                            <input
                                className="mit-input"
                                type="text"
                                name="enrollment_no"
                                required
                                value={formData.enrollment_no}
                                onChange={handleChange}
                                placeholder="e.g. MIT12345678"
                                style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>Branch</label>
                            <select
                                className="mit-input"
                                name="branch"
                                value={formData.branch}
                                onChange={handleChange}
                                style={{ background: 'white', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}
                            >
                                <option value="CS">Computer Science</option>
                                <option value="IT">Information Technology</option>
                                <option value="ECE">Electronics (ECE)</option>
                                <option value="EE">Electrical (EE)</option>
                                <option value="ME">Mechanical</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>Academic Year</label>
                            <select
                                className="mit-input"
                                name="academic_year"
                                value={formData.academic_year}
                                onChange={handleChange}
                                style={{ background: 'white', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}
                            >
                                <option value={2024}>2024</option>
                                <option value={2025}>2025</option>
                                <option value={2026}>2026</option>
                                <option value={2027}>2027</option>
                            </select>
                        </div>

                        <button type="submit" className="mit-btn" style={{ width: '100%', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>Save & Continue</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
