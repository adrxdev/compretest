import React, { useState, useEffect } from 'react';
import { Users, Calendar, Building2, TrendingUp, Monitor, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminHome() {
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState({
        students: 0,
        sessions: { total: 0, active: 0, liveSession: null },
        assessments: { total: 0, published: 0 },
        placements: { total: 0, open: 0 }
    });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [usersRes, eventsRes, assessmentsRes, drivesRes] = await Promise.allSettled([
                api.get('/users').catch(e => ({ data: [] })),
                api.get('/events').catch(e => ({ data: [] })),
                api.get('/assessments').catch(e => ({ data: [] })),
                api.get('/placement/drives').catch(e => ({ data: [] }))
            ]);

            const newCounts = { ...counts };

            // 1. Users
            if (usersRes.status === 'fulfilled') {
                newCounts.students = Array.isArray(usersRes.value.data) ? usersRes.value.data.length : 0;
            }

            // 2. Sessions (Events)
            if (eventsRes.status === 'fulfilled') {
                const events = Array.isArray(eventsRes.value.data) ? eventsRes.value.data : [];
                newCounts.sessions.total = events.length;
                newCounts.sessions.active = events.filter(e => e.session_state === 'ACTIVE' || e.session_state === 'LIVE').length;
                newCounts.sessions.liveSession = events.find(e => e.session_state === 'ACTIVE' || e.session_state === 'LIVE');
            }

            // 3. Assessments
            if (assessmentsRes.status === 'fulfilled') {
                const assessments = Array.isArray(assessmentsRes.value.data) ? assessmentsRes.value.data : [];
                newCounts.assessments.total = assessments.length;
                newCounts.assessments.published = assessments.filter(a => a.status === 'PUBLISHED').length;
            }

            // 4. Placements
            if (drivesRes.status === 'fulfilled') {
                const drives = Array.isArray(drivesRes.value.data) ? drivesRes.value.data : [];
                newCounts.placements.total = drives.length;
                newCounts.placements.open = drives.filter(d => new Date(d.deadline) >= new Date()).length;
            }

            setCounts(newCounts);
        } catch (error) {
            console.error("Dashboard data fetch failed", error);
        } finally {
            setLoading(false);
        }
    };

    const liveSession = counts.sessions.liveSession;

    return (
        <AdminLayout title="Dashboard">
            <div style={{ fontFamily: '"Inter", sans-serif', maxWidth: '1200px', margin: '0 auto' }}>

                {/* Header / Control Center Banner */}
                <div style={{
                    marginBottom: '2rem',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}>
                    <div style={{
                        padding: '1.5rem 2rem',
                        borderBottom: liveSession ? '1px solid #e2e8f0' : 'none',
                        backgroundColor: liveSession ? '#f0fff4' : 'white'
                    }}>
                        <h1 style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: '#0f172a',
                            margin: 0,
                            letterSpacing: '-0.02em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <Monitor size={24} color="#334155" />
                            Administrative Control Center
                        </h1>
                        {!liveSession && (
                            <p style={{ margin: '0.5rem 0 0 2.25rem', color: '#64748b', fontSize: '0.9rem' }}>
                                System Operational. No active sessions currently running.
                            </p>
                        )}
                    </div>

                    {/* Conditional Live Session Display */}
                    {liveSession && (
                        <div style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff' }}>
                            <div>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    backgroundColor: '#dcfce7', color: '#166534',
                                    padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700',
                                    marginBottom: '0.75rem', border: '1px solid #bbf7d0'
                                }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a', boxShadow: '0 0 0 2px #dcfce7' }}></div>
                                    SESSION LIVE
                                </div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: 0, lineHeight: 1.2 }}>
                                    {liveSession.name}
                                </h2>
                                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Building2 size={16} /> {liveSession.venue || 'Venue TBD'}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Clock size={16} /> Refresh: {liveSession.qr_refresh_interval}s
                                    </span>
                                </div>
                            </div>
                            <Link to={`/admin/events/${liveSession.id}`} target="_blank" style={{ textDecoration: 'none' }}>
                                <button style={{
                                    backgroundColor: '#16a34a', color: 'white', border: 'none',
                                    padding: '0.75rem 1.5rem', borderRadius: '10px',
                                    fontWeight: '600', cursor: 'pointer',
                                    boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.3)',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}>
                                    <Monitor size={18} /> Monitor Session
                                </button>
                            </Link>
                        </div>
                    )}
                </div>

                <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', marginLeft: '0.25rem' }}>
                    Administrative Actions
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

                    {/* 1. Sessions Card */}
                    <Link to="/admin/events" style={{ textDecoration: 'none' }}>
                        <div style={{
                            backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem',
                            border: liveSession ? '2px solid #16a34a' : '1px solid #e2e8f0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%',
                            transition: 'transform 0.2s', position: 'relative',
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                        }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#f0f9ff', color: '#0284c7' }}>
                                        <Calendar size={24} />
                                    </div>
                                    {counts.sessions.active > 0 && (
                                        <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '0.75rem', fontWeight: '700', padding: '2px 8px', borderRadius: '12px' }}>
                                            ACTIVE
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>
                                    {loading ? '...' : counts.sessions.total}
                                </div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Sessions</div>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                {loading ? 'Loading...' : `${counts.sessions.active} Active Session(s)`}
                            </div>
                        </div>
                    </Link>

                    {/* 2. Assessments Card */}
                    <Link to="/admin/assessments" style={{ textDecoration: 'none' }}>
                        <div style={{
                            backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem',
                            border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%',
                            transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                        }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#fdf4ff', color: '#a855f7' }}>
                                        <CheckCircle size={24} />
                                    </div>
                                </div>
                                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>
                                    {loading ? '...' : counts.assessments.total}
                                </div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Assessments</div>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                {loading ? 'Loading...' : `${counts.assessments.published} Published`}
                            </div>
                        </div>
                    </Link>

                    {/* 3. Placements Card */}
                    <Link to="/admin/placements" style={{ textDecoration: 'none' }}>
                        <div style={{
                            backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem',
                            border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%',
                            transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                        }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#fff7ed', color: '#ea580c' }}>
                                        <Building2 size={24} />
                                    </div>
                                    {counts.placements.open > 0 && (
                                        <span style={{ backgroundColor: '#fef3c7', color: '#b45309', fontSize: '0.75rem', fontWeight: '700', padding: '2px 8px', borderRadius: '12px' }}>
                                            {counts.placements.open} OPEN
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>
                                    {loading ? '...' : counts.placements.total}
                                </div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Placement Drives</div>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                {loading ? 'Loading...' : `${counts.placements.open} Open for Application`}
                            </div>
                        </div>
                    </Link>

                    {/* 4. Students Card */}
                    <Link to="/admin/users" style={{ textDecoration: 'none' }}>
                        <div style={{
                            backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem',
                            border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%',
                            transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                        }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#eef2ff', color: '#4f46e5' }}>
                                        <Users size={24} />
                                    </div>
                                </div>
                                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>
                                    {loading ? '...' : counts.students.toLocaleString()}
                                </div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Total Students</div>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                Registered & Verified
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </AdminLayout>
    );
}
