import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Smartphone, ShieldCheck, BarChart3, MapPin, Menu, X, ChevronDown, Mail } from 'lucide-react';
import './LandingPage.css';
import compre from '../assets/compre.jpg';
import bg from '../assets/bg.jpg';

const LandingPage = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openFaqIndex, setOpenFaqIndex] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Prevent scrolling when mobile menu is active
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

    return (
        <div className="landing-page">
            <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
                <div className="landing-logo-group">
                    <img src={compre} alt="Mintal Comprehensive Stand-Alone SHS" className="nav-logo" onError={(e) => e.target.style.display = 'none'} />
                    <div className="nav-divider"></div>
                    <div className="nav-text-group">
                        <span className="nav-uni-name desktop-name">Mintal Comprehensive Stand-Alone SHS</span>
                        <span className="nav-uni-name mobile-name">MCHSA-SHS</span>
                        <span className="nav-dept-name">Senior High School Department</span>
                    </div>
                </div>

                {/* Desktop Links */}
                <div className="nav-links desktop-only">
                    <a href="#strands">Strands</a>
                    <a href="#fqa">FQA</a>
                    <a href="#contact">Enrollment</a>
                </div>

                {/* Desktop Auth Button */}
                <Link to="/login" className="auth-btn desktop-only">
                    <ShieldCheck size={16} style={{ marginRight: '6px' }} />
                    Portal Login
                </Link>

                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Mobile Menu Overlay */}
                <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`}>
                    <div className="mobile-menu-content">
                        <a href="#strands" onClick={() => setIsMobileMenuOpen(false)}>Strands</a>
                        <a href="#fqa" onClick={() => setIsMobileMenuOpen(false)}>FQA</a>
                        <a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>Enrollment</a>
                        <div className="mobile-menu-divider"></div>
                        <Link to="/login" className="mobile-auth-btn" onClick={() => setIsMobileMenuOpen(false)}>
                            <ShieldCheck size={18} />
                            Portal Login
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Redesigned Hero Section */}
            <main className="landing-hero-new">
               <img src={bg} alt="bg" className='hero-bg-video'/>
                <div className="hero-overlay">
                    <div className="hero-content">
                        {/* Badge removed to match new reference */}
                        <h1 className="hero-title-large">
                            Campus placements,<br />
                            simplified.
                        </h1>

                        <p className="hero-subtitle-new">
                            Secure attendance, assessments, seat allocation, and placement workflows all in one unified system.
                        </p>

                        <div className="hero-actions">
                            <Link to="/login" className="hero-access-btn">
                                Access Portal
                            </Link>
                            <div className="hero-trust-indicator">
                                Developed by Pranavgawaii & Adrx
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Stats Section with restored data */}
            <section className="landing-stats">
                <div className="stats-row">
                    <div className="stat-item">
                        <span className="stat-value">125+</span>
                        <span className="stat-label">Acres Campus</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">500+</span>
                        <span className="stat-label">Visiting Companies</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">4</span>
                        <span className="stat-label">Specialized Course</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">10,000+</span>
                        <span className="stat-label">Student Community</span>
                    </div>
                </div>
                <div className="stats-context">
                    * Not Real Data - For Demonstration Purposes Only
                </div>
            </section>

            {/* Marquee Section */}
            <div className="marquee-wrapper" id="strands">
                <div className="marquee-title-fancy">Available Strands</div>
                <div className="marquee-track">
                    {/* Double the items for seamless loop */}
                    {[
                        "STEM", "ABM","HUMS", "TVL-ICT", "TVL-EIM", "TVL-HE",
                    ].map((company, index) => (
                        <div key={index} className="marquee-item">{company}</div>
                    ))}
                    {[
                        "STEM", "ABM","HUMS", "TVL-ICT", "TVL-EIM", "TVL-HE",
                    ].map((company, index) => (
                        <div key={`duplicate-${index}`} className="marquee-item">{company}</div>
                    ))}
                </div>
            </div>

            {/* Who Is This For Section */}
            <section className="segments-section">
                <div className="section-container">
                    <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '3rem' }}>Who Is This Platform For?</h2>
                    <div className="segments-grid">
                        <div className="segment-item">
                            <h4>Students</h4>
                            <p>Secure access to placement drives, assessment schedules, and digital attendance records.</p>
                        </div>
                        <div className="segment-divider"></div>
                        <div className="segment-item">
                            <h4>Faculty & Admin</h4>
                            <p>Live monitoring of sessions, automated reports, and centralized resource control.</p>
                        </div>
                    </div>
                </div>
            </section>



            {/* FAQ Section */}
            <section className="faq-section" id='fqa'>
                <h2 className="faq-title">Common Queries</h2>

                <div className="faq-container">
                    {[
                        {
                            q: "How does the system prevent proxy attendance?",
                            a: "Our mandated Device Lock technology binds a student's account to their specific smartphone hardware ID. Attempting to log in or scan from an unauthorized device triggers a security lock, effectively eliminating proxy attempts."
                        },
                        {
                            q: "Are QR codes time-bound and secure?",
                            a: "Yes. The generated QR codes are dynamic and encrypted, rotating every few seconds. This prevents 'photo-sharing' or unauthorized distribution of codes to absent peers."
                        },
                        {
                            q: "Is attendance visibility available to parents or guardians?",
                            a: "Yes. The system supports a dedicated parent portal and automated SMS notifications, ensuring guardians are kept informed of daily attendance status and academic engagement."
                        },
                        {
                            q: "What happens if a student changes their device?",
                            a: "Device changes require administrative approval. A student must submit a formal request through the portal, which resets their hardware ID binding after verification by the department coordinator."
                        },
                        {
                            q: "Is student data stored securely?",
                            a: "All student data is encrypted at rest and in transit, adhering to institutional data privacy standards. Access is strictly role-based, ensuring only authorized faculty and administrators can view sensitive records."
                        },
                        {
                            q: "Does the system scale for large auditoriums?",
                            a: "Absolutely. The robust backend infrastructure handles thousands of concurrent requests, making it suitable for mass-attendance events, orientation sessions, and campus-wide placement drives."
                        }
                    ].map((item, index) => (
                        <div
                            key={index}
                            className={`faq-item ${openFaqIndex === index ? 'active' : ''}`}
                            onClick={() => toggleFaq(index)}
                        >
                            <div className="faq-question">
                                {item.q}
                                <ChevronDown
                                    size={20}
                                    className={`faq-icon ${openFaqIndex === index ? 'rotate' : ''}`}
                                />
                            </div>
                            <div
                                className="faq-answer-wrapper"
                                style={{ maxHeight: openFaqIndex === index ? '200px' : '0' }}
                            >
                                <div className="faq-answer">
                                    {item.a}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="contact-cta" id="contact">
                    <div className="contact-icon-wrapper">
                        <Mail size={32} strokeWidth={1.5} />
                    </div>
                    <h3>Want to Enroll?</h3>
                    <p>For administrative assistance regarding to the Enrollment, please contact the Administration.</p>
                    <a href="mailto:" className="contact-btn">Send Email</a>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-col">
                        <h4>Platform</h4>
                        <Link to="/login">Student Portal</Link>
                        <Link to="/login">Faculty Login</Link>
                        <Link to="/login">Admin Dashboard</Link>
                        <a href="#">Check Status</a>
                    </div>
                    <div className="footer-col">
                        <h4>Resources</h4>
                        <a href="#">Academic Calendar</a>
                        <a href="#">Library Access</a>
                        <a href="#">Placement Cell</a>
                        <a href="#">Research Papers</a>
                    </div>
                    <div className="footer-col">
                        <h4>Contact</h4>
                        <a href="#">test@project.com</a>
                        <a href="#">+91 123 456 7890</a>
                        <a href="#">Mintal, Davao City</a>
                        <div className="social-links-row">
                            <a href="#">Twitter</a>
                            <a href="#">LinkedIn</a>
                            <a href="#">Instagram</a>
                        </div>
                    </div>
                    <div className="footer-col newsletter-col">
                        <h4>Stay Updated</h4>
                        <p>Get the latest placement news and campus updates.</p>
                        <div className="footer-input-group">
                            <input type="email" placeholder="Enter your email" />
                            <button>→</button>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    &copy; 2026 Pranavgawaii & Adrx.dev. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
