
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Shield, Bell, ArrowLeft, ChevronRight, Mail, Lock } from 'lucide-react';

export default function AdminSettings() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', paddingTop: '1rem', fontFamily: '"Inter", sans-serif' }}>

            {/* Header with Back Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '0.6rem',
                        cursor: 'pointer',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Settings</h2>
                    <p style={{ color: '#64748b', margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>Manage your account preferences</p>
                </div>
            </div>

            {/* Profile Card */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                border: '1px solid #f1f5f9'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#334155',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        fontWeight: '600',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>{user?.name || 'Administrator'}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: '#64748b' }}>
                            <span style={{
                                backgroundColor: '#eef2ff',
                                color: '#4f46e5',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px'
                            }}>
                                {user?.role || 'Admin'}
                            </span>
                            <span style={{ fontSize: '0.9rem' }}>mituniversity.edu.in</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '1rem', borderRadius: '12px',
                        border: '1px solid #f1f5f9', background: '#fafafa',
                        cursor: 'pointer', textAlign: 'left',
                        color: '#334155', transition: 'all 0.2s',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '8px', background: 'white', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                <User size={20} color="#64748b" />
                            </div>
                            <div>
                                <div style={{ color: '#0f172a', fontWeight: '600', fontSize: '0.95rem' }}>Personal Information</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Update your details</div>
                            </div>
                        </div>
                        <ChevronRight size={18} color="#cbd5e1" />
                    </button>

                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '1rem', borderRadius: '12px',
                        border: '1px solid #f1f5f9', background: '#fafafa',
                        cursor: 'pointer', textAlign: 'left',
                        color: '#334155', transition: 'all 0.2s',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '8px', background: 'white', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                <Shield size={20} color="#64748b" />
                            </div>
                            <div>
                                <div style={{ color: '#0f172a', fontWeight: '600', fontSize: '0.95rem' }}>Login & Security</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Password and 2FA</div>
                            </div>
                        </div>
                        <ChevronRight size={18} color="#cbd5e1" />
                    </button>

                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '1rem', borderRadius: '12px',
                        border: '1px solid #f1f5f9', background: '#fafafa',
                        cursor: 'pointer', textAlign: 'left',
                        color: '#334155', transition: 'all 0.2s',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '8px', background: 'white', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                <Bell size={20} color="#64748b" />
                            </div>
                            <div>
                                <div style={{ color: '#0f172a', fontWeight: '600', fontSize: '0.95rem' }}>Notifications</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Manage alerts</div>
                            </div>
                        </div>
                        <ChevronRight size={18} color="#cbd5e1" />
                    </button>
                </div>
            </div>

            {/* Sign Out Section */}
            <div style={{
                backgroundColor: '#fff1f2',
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid #ffe4e6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#be123c', marginBottom: '0.25rem' }}>Sign Out</h3>
                    <p style={{ color: '#e11d48', fontSize: '0.85rem', margin: 0 }}>Terminates your current session</p>
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        backgroundColor: 'white',
                        color: '#be123c',
                        border: '1px solid #fecdd3',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s'
                    }}
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
