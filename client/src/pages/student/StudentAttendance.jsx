
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { QrCode, ScanLine, X, ArrowLeft, Home } from 'lucide-react';
import { Html5Qrcode } from "html5-qrcode";

export default function StudentAttendance() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Data State
    const [activeEvent, setActiveEvent] = useState(null);
    const [manualCode, setManualCode] = useState('');
    const [manualEventId, setManualEventId] = useState('');
    const [scanResult, setScanResult] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isDetected, setIsDetected] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Scanner Refs
    const videoRef = useRef(null);
    const requestRef = useRef(null);
    const lastCodeRef = useRef(null);
    const lastTimeRef = useRef(0);
    const cleanupRef = useRef(null);
    const isSubmittingRef = useRef(false);

    useEffect(() => {
        fetchActiveEvent();
        return () => {
            stopScanner(); // safety cleanup
        };
    }, []);

    useEffect(() => {
        if (activeEvent) {
            setManualEventId(activeEvent.id);
        }
    }, [activeEvent]);

    const fetchActiveEvent = async () => {
        try {
            const eventsRes = await api.get('/events?active=true');
            const now = new Date();
            const currentEvent = eventsRes.data.find(e => {
                const start = new Date(`${e.date}T${e.start_time}`);
                const end = new Date(`${e.date}T${e.end_time}`);
                return now >= start && now <= end;
            });
            setActiveEvent(currentEvent || null);
        } catch (error) {
            console.error(error);
        }
    };

    const startScanner = async () => {
        setScanResult(null);
        setIsScanning(true);
        setIsDetected(false);

        if (cleanupRef.current) cleanupRef.current();

        const constraints = { video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } } };

        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            const readerDiv = document.getElementById("reader");
            if (!readerDiv) return;

            readerDiv.innerHTML = '';
            const video = document.createElement("video");
            video.style.width = "100%";
            video.style.height = "100%";
            video.style.objectFit = "cover";
            video.autoplay = true;
            video.playsInline = true;
            video.muted = true;
            readerDiv.appendChild(video);
            video.srcObject = stream;
            videoRef.current = video;

            await new Promise((resolve) => {
                video.onloadedmetadata = () => video.play().then(resolve);
            });

            // Fallback scanner (Html5Qrcode) setup removed for brevity unless requested, focusing on canvas method
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d", { willReadFrequently: true });

            const scanLoop = async () => {
                if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

                const vWidth = videoRef.current.videoWidth;
                const vHeight = videoRef.current.videoHeight;
                const cropWidth = Math.floor(vWidth * 0.80);
                const cropHeight = Math.floor(vHeight * 0.80);
                const startX = (vWidth - cropWidth) / 2;
                const startY = (vHeight - cropHeight) / 2;

                canvas.width = cropWidth;
                canvas.height = cropHeight;
                ctx.drawImage(videoRef.current, startX, startY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);

                let detectedCode = null;
                let validationStatus = 'NONE';

                try {
                    if ("BarcodeDetector" in window) {
                        const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
                        const barcodes = await barcodeDetector.detect(canvas);
                        if (barcodes.length > 0) {
                            detectedCode = barcodes[0].rawValue;
                            validationStatus = 'VALID';
                        }
                    }
                } catch (e) { console.error(e); }

                if (validationStatus === 'VALID' && detectedCode) {
                    setIsDetected(true);
                    const now = Date.now();
                    if (detectedCode === lastCodeRef.current) {
                        if (now - lastTimeRef.current > 400) {
                            stopScanner();
                            if (navigator.vibrate) navigator.vibrate([100]);
                            handleScan(detectedCode);
                            return;
                        }
                    } else {
                        lastCodeRef.current = detectedCode;
                        lastTimeRef.current = now;
                    }
                } else {
                    setIsDetected(false);
                    if (Date.now() - lastTimeRef.current > 200) lastCodeRef.current = null;
                }
                requestRef.current = requestAnimationFrame(scanLoop);
            };
            requestRef.current = requestAnimationFrame(scanLoop);

            cleanupRef.current = () => {
                if (requestRef.current) cancelAnimationFrame(requestRef.current);
                if (video.srcObject) video.srcObject.getTracks().forEach(track => track.stop());
                if (readerDiv) readerDiv.innerHTML = '';
            };

        } catch (err) {
            console.error(err);
            setIsScanning(false);
            alert("Camera access denied or error.");
        }
    };

    const stopScanner = () => {
        setIsScanning(false);
        if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; }
        if (requestRef.current) { cancelAnimationFrame(requestRef.current); requestRef.current = null; }
    };

    const handleScan = async (qrData) => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setIsSubmitting(true);

        try {
            if (navigator.vibrate) navigator.vibrate(200);
            let eventId, token;
            const eventIdMatch = qrData.match(/[?&]event_id=([^&]+)/);
            const tokenMatch = qrData.match(/[?&]token=([^&]+)/);

            if (eventIdMatch && tokenMatch) {
                eventId = eventIdMatch[1];
                token = tokenMatch[1];
            } else if (qrData.startsWith('EVENT')) {
                const parts = qrData.split(':');
                if (parts.length === 3) { eventId = parts[1]; token = parts[2]; }
            }

            if (!eventId || !token) throw new Error("Invalid QR Code.");

            await api.post('/attendance', { event_id: eventId, token });
            setScanResult({ status: 'success', title: 'Marked Present!', message: 'Attendance recorded.' });
        } catch (error) {
            const msg = error.response?.data?.error || error.message;
            if (msg.includes('already marked')) {
                setScanResult({ status: 'success', title: 'Already Present', message: 'You have already marked attendance.' });
            } else {
                setScanResult({ status: 'error', title: 'Failed', message: msg });
            }
        } finally {
            setTimeout(() => { isSubmittingRef.current = false; setIsSubmitting(false); }, 2000);
        }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!manualCode || manualCode.length < 6) return alert('Enter valid code');
        if (isSubmittingRef.current) return;

        isSubmittingRef.current = true;
        setIsSubmitting(true);
        const targetEventId = manualEventId || activeEvent?.id;

        if (!targetEventId) {
            alert("Event ID required");
            isSubmittingRef.current = false;
            setIsSubmitting(false);
            return;
        }

        try {
            if (navigator.vibrate) navigator.vibrate(200);
            await api.post('/attendance', { event_id: targetEventId, token: manualCode });
            setScanResult({ status: 'success', title: 'Marked Present!', message: 'Manual entry successful.' });
            setManualCode('');
        } catch (error) {
            const msg = error.response?.data?.error || 'Entry failed';
            alert(msg);
        } finally {
            setTimeout(() => { isSubmittingRef.current = false; setIsSubmitting(false); }, 1000);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Header */}
            <div style={{ background: 'white', padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/student')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.1rem' }}>Mark Attendance</div>
                </div>
                <button onClick={() => navigate('/student')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <Home size={24} />
                </button>
            </div>

            <div style={{ padding: '1.5rem', maxWidth: '640px', margin: '0 auto' }}>

                {scanResult && (
                    <div style={{
                        marginBottom: '1.5rem', padding: '1rem', borderRadius: '12px',
                        background: scanResult.status === 'success' ? '#dcfce7' : '#fee2e2',
                        color: scanResult.status === 'success' ? '#166534' : '#991b1b',
                        border: `1px solid ${scanResult.status === 'success' ? '#bbf7d0' : '#fecaca'}`
                    }}>
                        <div style={{ fontWeight: '700' }}>{scanResult.title}</div>
                        <div style={{ fontSize: '0.9rem' }}>{scanResult.message}</div>
                        <button onClick={() => setScanResult(null)} style={{ marginTop: '0.5rem', fontSize: '0.85rem', textDecoration: 'underline', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>Dismiss</button>
                    </div>
                )}

                {isScanning ? (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Scanning...</h3>
                            <button onClick={stopScanner} style={{ background: '#f1f5f9', border: 'none', padding: '0.5rem', borderRadius: '8px' }}><X size={20} /></button>
                        </div>
                        <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', height: '400px', background: 'black' }}>
                            <div id="reader" style={{ width: '100%', height: '100%' }}></div>

                            {/* Overlay */}
                            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ width: '70%', aspectRatio: '1/1', border: isDetected ? '4px solid #4ade80' : '2px solid rgba(255,255,255,0.5)', borderRadius: '24px', transition: 'all 0.2s' }}></div>
                            </div>
                        </div>
                        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '1rem' }}>
                            Point camera at the QR code.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Scan Button */}
                        <div style={{ textAlign: 'center' }}>
                            <button
                                onClick={startScanner}
                                style={{
                                    width: '100%', padding: '2rem', borderRadius: '24px',
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                    color: 'white', border: 'none', cursor: 'pointer',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                                    boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)'
                                }}
                            >
                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '50%' }}>
                                    <QrCode size={48} />
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>Scan QR Code</div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Tap here to open camera</div>
                            </button>
                        </div>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ height: '1px', flex: 1, background: '#e2e8f0' }}></div>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8' }}>OR ENTER MANUALLY</span>
                            <div style={{ height: '1px', flex: 1, background: '#e2e8f0' }}></div>
                        </div>

                        {/* Manual Entry */}
                        <form onSubmit={handleManualSubmit} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>EVENT ID</label>
                                    <input
                                        type="text" value={manualEventId} onChange={e => setManualEventId(e.target.value)} placeholder="000"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: '600' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>CODE</label>
                                    <input
                                        type="text" value={manualCode} onChange={e => setManualCode(e.target.value)} placeholder="XXXXXX" maxLength={6}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: '600', letterSpacing: '2px' }}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit" disabled={!manualCode}
                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: manualCode ? '#0f172a' : '#e2e8f0', color: manualCode ? 'white' : '#94a3b8', border: 'none', fontWeight: '700', cursor: manualCode ? 'pointer' : 'not-allowed' }}
                            >
                                Submit Code
                            </button>
                        </form>

                    </div>
                )}
            </div>
        </div>
    );
}
