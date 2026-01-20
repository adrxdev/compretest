import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { QrCode, LogOut, MapPin, ClipboardList, Home, History, ScanLine, X, Briefcase, ArrowRight, UserCheck } from 'lucide-react';
import logo from '../assets/image.png';

export default function StudentDashboard() {
    const { user, logout } = useAuth();

    const [activeEvent, setActiveEvent] = useState(null);
    const [activeAssessment, setActiveAssessment] = useState(null);
    const [myAllocation, setMyAllocation] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('HOME');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [scanResult, setScanResult] = useState(null);

    // UI Navigation helper
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Simplified fetch just for status / history
            const allocationRes = await api.get('/student/my-allocation');
            if (allocationRes.data.status !== 'NO_ACTIVE_ASSESSMENT') {
                setActiveAssessment({
                    title: allocationRes.data.assessment_name,
                    start_time: allocationRes.data.start_time || '00:00',
                    end_time: allocationRes.data.end_time || '23:59',
                    status: 'LIVE'
                });
                if (allocationRes.data.status === 'ALLOCATED') {
                    setMyAllocation({
                        lab_name: allocationRes.data.lab_name,
                        seat_number: allocationRes.data.seat_number
                    });
                }
            }

            const historyRes = await api.get('/attendance/my-history');
            setHistory(historyRes.data);

        } catch (error) {
            console.error("Dashboard fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Render Helpers
    const isMarkedPresent = false; // logic moved or simplified? 
    // Actually, we can check history for today's event if we want to show status on the dashboard still.
    // But since we removed activeEvent detailed polling here to simplify, let's just keep history.

    const renderHome = () => (
        <div style={{ padding: '1.5rem', paddingBottom: '7rem', maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Dashboard Actions */}
            <div style={{ padding: '1.5rem', maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Placements Card */}
                <Link to="/student/placements" style={{ textDecoration: 'none' }}>
                    <div style={{
                        background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0',
                        display: 'flex', alignItems: 'center', gap: '1.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        transition: 'transform 0.2s'
                    }}>
                        <div style={{
                            background: '#f0f9ff', width: '56px', height: '56px', borderRadius: '16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7'
                        }}>
                            <Briefcase size={28} strokeWidth={2.5} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>Placement Drives</h3>
                            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#64748b' }}>View and apply for opportunities</p>
                        </div>
                        <ArrowRight size={20} color="#cbd5e1" />
                    </div>
                </Link>

                {/* Mark Attendance Card */}
                <Link to="/student/attendance" style={{ textDecoration: 'none' }}>
                    <div style={{
                        background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0',
                        display: 'flex', alignItems: 'center', gap: '1.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        transition: 'transform 0.2s'
                    }}>
                        <div style={{
                            background: '#fdf4ff', width: '56px', height: '56px', borderRadius: '16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c026d3'
                        }}>
                            <QrCode size={28} strokeWidth={2.5} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>Mark Attendance</h3>
                            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#64748b' }}>Scan QR or enter code manually</p>
                        </div>
                        <ArrowRight size={20} color="#cbd5e1" />
                    </div>
                </Link>

            </div>

            {/* Today's Assessment Card */}
            {(activeAssessment || myAllocation) && (
                <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>Today's Assessment</h3>
                        {activeAssessment && (
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#7e22ce', background: '#f3e8ff', padding: '6px 12px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {activeAssessment.status}
                            </span>
                        )}
                    </div>

                    {activeAssessment && (
                        <div style={{ marginBottom: '1.25rem' }}>
                            <h4 style={{ margin: '0', fontSize: '1.1rem', fontWeight: '600', color: '#334155' }}>{activeAssessment.title}</h4>
                        </div>
                    )}

                    {myAllocation && (
                        <div style={{
                            background: '#f8fafc',
                            padding: '1.25rem',
                            borderRadius: '16px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{
                                background: '#dbeafe',
                                padding: '12px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <MapPin size={20} color="#2563eb" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '4px' }}>YOUR SEAT</div>
                                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
                                    {myAllocation.lab_name} • Seat {myAllocation.seat_number}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
    );

    const renderHistory = () => (
        <div style={{ padding: '1.5rem', paddingBottom: '7rem', maxWidth: '640px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.025em' }}>Attendance History</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {history.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <div style={{ background: '#f8fafc', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                            <History size={32} color="#94a3b8" />
                        </div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#334155', fontSize: '1.1rem', fontWeight: '600' }}>No Records Yet</h4>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
                            Your past attendance will appear here.
                        </p>
                    </div>
                ) : (
                    history.map((h, i) => (
                        <div key={i} style={{
                            padding: '1.25rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'white',
                            borderRadius: '16px',
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ background: '#dcfce7', padding: '12px', borderRadius: '12px', color: '#166534' }}>
                                    <ClipboardList size={20} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '1rem' }}>{h.event_name}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                                        {new Date(h.scan_time).toLocaleDateString()} • {new Date(h.scan_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                            <span style={{ color: '#15803d', fontWeight: '700', fontSize: '0.75rem', background: '#dcfce7', padding: '6px 12px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Present
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    if (!user) return null;

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

            {/* Header */}
            <div style={{
                background: 'white',
                padding: '1rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 50,
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={logo} alt="Logo" style={{ height: '36px' }} />
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student Portal</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>{user.name}</div>
                    </div>
                </div>

                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: '#4c1d95',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            fontWeight: '700',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(76, 29, 149, 0.2)'
                        }}
                    >
                        {user.name?.charAt(0)}
                    </button>

                    {showProfileMenu && (
                        <>
                            <div
                                style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                                onClick={() => setShowProfileMenu(false)}
                            />
                            <div style={{
                                position: 'absolute',
                                top: '120%',
                                right: 0,
                                width: '220px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '16px',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                overflow: 'hidden',
                                zIndex: 100
                            }}>
                                <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                                    <p style={{ margin: 0, fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{user.name}</p>
                                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>{user.enrollment_no}</p>
                                </div>
                                <button
                                    onClick={logout}
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1.25rem',
                                        background: 'none',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        color: '#dc2626',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        textAlign: 'left',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <LogOut size={18} /> Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div style={{ minHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}>
                {activeTab === 'HOME' && renderHome()}
                {activeTab === 'HISTORY' && renderHistory()}

                {/* Result Overlay */}
                {scanResult && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 200,
                        background: 'rgba(0,0,0,0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem'
                    }}>
                        <div style={{
                            background: 'white',
                            padding: '2.5rem',
                            borderRadius: '24px',
                            textAlign: 'center',
                            width: '100%',
                            maxWidth: '360px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                margin: '0 auto 1.5rem auto',
                                background: scanResult.status === 'success' ? '#dcfce7' : '#fee2e2',
                                color: scanResult.status === 'success' ? '#166534' : '#991b1b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {scanResult.status === 'success' ? <ClipboardList size={40} /> : <X size={40} />}
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#0f172a', fontWeight: '700' }}>{scanResult.title}</h3>
                            <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.95rem' }}>{scanResult.message}</p>
                            <button
                                onClick={() => { setScanResult(null); setActiveTab('HOME'); }}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: '#4c1d95',
                                    color: 'white',
                                    borderRadius: '12px',
                                    border: 'none',
                                    fontWeight: '700',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px -1px rgba(76, 29, 149, 0.3)'
                                }}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: '68px',
                background: 'white',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                zIndex: 100,
                boxShadow: '0 -2px 10px rgba(0,0,0,0.03)'
            }}>
                <button
                    onClick={() => setActiveTab('HOME')}
                    style={{
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        flex: 1,
                        padding: '8px 0',
                        color: activeTab === 'HOME' ? '#4c1d95' : '#94a3b8',
                        cursor: 'pointer'
                    }}
                >
                    <Home size={24} strokeWidth={activeTab === 'HOME' ? 2.5 : 2} />
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Home</span>
                </button>

                <Link
                    to="/student/attendance"
                    style={{
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        flex: 1,
                        padding: '8px 0',
                        transform: 'translateY(-16px)',
                        cursor: 'pointer',
                        textDecoration: 'none'
                    }}
                >
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: '#4c1d95',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 10px 25px -5px rgba(76, 29, 149, 0.4)'
                    }}>
                        <QrCode size={32} />
                    </div>
                </Link>

                <button
                    onClick={() => setActiveTab('HISTORY')}
                    style={{
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        flex: 1,
                        padding: '8px 0',
                        color: activeTab === 'HISTORY' ? '#4c1d95' : '#94a3b8',
                        cursor: 'pointer'
                    }}
                >
                    <History size={24} strokeWidth={activeTab === 'HISTORY' ? 2.5 : 2} />
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>History</span>
                </button>
            </div>

        </div>
    );
}
