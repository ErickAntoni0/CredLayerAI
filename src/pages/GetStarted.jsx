import React, { useState, useLayoutEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    ArrowRight,
    ArrowLeft,
    Check,
    ShieldCheck,
    Wallet,
    Globe,
    AlertCircle,
    Sparkles,
} from 'lucide-react'
import gsap from 'gsap'
import Lenis from 'lenis'

import '../styles/getstarted.css'

const ROLES = [
    { value: '', label: 'Select your role…' },
    { value: 'developer', label: 'Developer / Builder' },
    { value: 'cooperative', label: 'Cooperative Member' },
    { value: 'creator', label: 'Content Creator' },
    { value: 'investor', label: 'Investor / Backer' },
    { value: 'community', label: 'Community Leader' },
    { value: 'other', label: 'Other' },
]

const STEPS = [
    { id: 1, label: 'Identity' },
    { id: 2, label: 'Details' },
    { id: 3, label: 'Confirm' },
]

const featureCards = [
    {
        icon: ShieldCheck,
        title: 'Verified Reputation',
        description:
            'Your financial activity is recorded on-chain to build a portable and verifiable credit score.',
    },
    {
        icon: Wallet,
        title: 'P2P Payments',
        description:
            'Send and receive assets with minimal fees on Arbitrum and Scroll L2 networks.',
    },
    {
        icon: Globe,
        title: 'Built for LATAM',
        description:
            'Designed with regional stablecoins, subsidized gas, and Spanish ENS subdomains.',
    },
]

function validate(step, data) {
    const errors = {}
    if (step === 1) {
        if (!data.fullName.trim()) errors.fullName = 'Full name is required'
        if (!data.email.trim()) errors.email = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
            errors.email = 'Enter a valid email address'
    }
    if (step === 2) {
        if (!data.role) errors.role = 'Please select a role'
    }
    if (step === 3) {
        if (!data.termsAccepted) errors.termsAccepted = 'You must accept the terms'
    }
    return errors
}

export default function GetStarted() {
    const navigate = useNavigate()
    const pageRef = useRef(null)
    const [currentStep, setCurrentStep] = useState(1)
    const [submitted, setSubmitted] = useState(false)
    const [errors, setErrors] = useState({})

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        role: '',
        organization: '',
        message: '',
        termsAccepted: false,
    })

    /* ── Smooth Scroll + GSAP ── */
    useLayoutEffect(() => {
        let lenis, ctx
        try {
            lenis = new Lenis({ duration: 1.2, smooth: true })
            const raf = (time) => {
                lenis.raf(time)
                requestAnimationFrame(raf)
            }
            requestAnimationFrame(raf)

            ctx = gsap.context(() => {
                gsap.from('.gs-hero-anim', {
                    y: 40,
                    opacity: 0,
                    duration: 1,
                    stagger: 0.12,
                    ease: 'power3.out',
                })
                gsap.from('.gs-form-card', {
                    y: 50,
                    opacity: 0,
                    duration: 0.9,
                    delay: 0.4,
                    ease: 'power3.out',
                })
                gsap.from('.gs-feature-card', {
                    y: 30,
                    opacity: 0,
                    duration: 0.8,
                    stagger: 0.12,
                    delay: 0.7,
                    ease: 'power3.out',
                })
            }, pageRef)
        } catch (err) {
            console.error(err)
        }
        return () => {
            if (lenis) lenis.destroy()
            if (ctx) ctx.revert()
        }
    }, [])

    /* ── Handlers ── */
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
        if (errors[name]) {
            setErrors((prev) => {
                const copy = { ...prev }
                delete copy[name]
                return copy
            })
        }
    }

    const handleNext = () => {
        const stepErrors = validate(currentStep, formData)
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors)
            return
        }
        setErrors({})
        if (currentStep < 3) {
            setCurrentStep((s) => s + 1)
        } else {
            setSubmitted(true)
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setErrors({})
            setCurrentStep((s) => s - 1)
        }
    }

    /* ── Step Content Renderer ── */
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <>
                        <div className="gs-field">
                            <label className="gs-label" htmlFor="gs-fullName">
                                Full Name
                            </label>
                            <input
                                id="gs-fullName"
                                className={`gs-input ${errors.fullName ? 'gs-input--error' : ''}`}
                                type="text"
                                name="fullName"
                                placeholder="Erick Jair Muciño"
                                value={formData.fullName}
                                onChange={handleChange}
                                autoComplete="name"
                            />
                            {errors.fullName && (
                                <span className="gs-error-msg">
                                    <AlertCircle size={13} /> {errors.fullName}
                                </span>
                            )}
                        </div>

                        <div className="gs-field">
                            <label className="gs-label" htmlFor="gs-email">
                                Email Address
                            </label>
                            <input
                                id="gs-email"
                                className={`gs-input ${errors.email ? 'gs-input--error' : ''}`}
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                            />
                            {errors.email && (
                                <span className="gs-error-msg">
                                    <AlertCircle size={13} /> {errors.email}
                                </span>
                            )}
                        </div>
                    </>
                )

            case 2:
                return (
                    <>
                        <div className="gs-field">
                            <label className="gs-label" htmlFor="gs-role">
                                Your Role
                            </label>
                            <select
                                id="gs-role"
                                className={`gs-input gs-select ${errors.role ? 'gs-input--error' : ''}`}
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                {ROLES.map((r) => (
                                    <option key={r.value} value={r.value} disabled={!r.value}>
                                        {r.label}
                                    </option>
                                ))}
                            </select>
                            {errors.role && (
                                <span className="gs-error-msg">
                                    <AlertCircle size={13} /> {errors.role}
                                </span>
                            )}
                        </div>

                        <div className="gs-field">
                            <label className="gs-label" htmlFor="gs-org">
                                Organization
                                <span className="gs-label-hint">(optional)</span>
                            </label>
                            <input
                                id="gs-org"
                                className="gs-input"
                                type="text"
                                name="organization"
                                placeholder="Your company or cooperative"
                                value={formData.organization}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="gs-field">
                            <label className="gs-label" htmlFor="gs-message">
                                Tell us about your goals
                                <span className="gs-label-hint">(optional)</span>
                            </label>
                            <textarea
                                id="gs-message"
                                className="gs-input gs-textarea"
                                name="message"
                                placeholder="What do you want to build or achieve with CredLayer AI?"
                                value={formData.message}
                                onChange={handleChange}
                            />
                        </div>
                    </>
                )

            case 3:
                return (
                    <>
                        {/* Review Summary */}
                        <div style={{
                            padding: '1.5rem',
                            borderRadius: '16px',
                            background: '#fafafa',
                            border: '1px solid #f4f4f5',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Review Your Info
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(1)}
                                    style={{ fontSize: '0.75rem', fontWeight: 600, color: '#000', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                                >
                                    Edit
                                </button>
                            </div>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 500 }}>Name</span>
                                    <p style={{ margin: 0, fontWeight: 600, color: '#18181b' }}>{formData.fullName}</p>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 500 }}>Email</span>
                                    <p style={{ margin: 0, fontWeight: 600, color: '#18181b' }}>{formData.email}</p>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 500 }}>Role</span>
                                    <p style={{ margin: 0, fontWeight: 600, color: '#18181b' }}>
                                        {ROLES.find((r) => r.value === formData.role)?.label || '—'}
                                    </p>
                                </div>
                                {formData.organization && (
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 500 }}>Organization</span>
                                        <p style={{ margin: 0, fontWeight: 600, color: '#18181b' }}>{formData.organization}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Terms Checkbox */}
                        <label className="gs-checkbox-row" htmlFor="gs-terms">
                            <input
                                id="gs-terms"
                                className="gs-checkbox"
                                type="checkbox"
                                name="termsAccepted"
                                checked={formData.termsAccepted}
                                onChange={handleChange}
                            />
                            <span className="gs-checkbox-text">
                                I agree to the{' '}
                                <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>{' '}
                                and{' '}
                                <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
                                My data will be processed in accordance with CredLayer AI standards.
                            </span>
                        </label>
                        {errors.termsAccepted && (
                            <span className="gs-error-msg">
                                <AlertCircle size={13} /> {errors.termsAccepted}
                            </span>
                        )}
                    </>
                )

            default:
                return null
        }
    }

    /* ── Success View ── */
    if (submitted) {
        return (
            <div ref={pageRef} className="gs-page">
                {/* Nav */}
                <header className="sticky top-0 z-50 h-20 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
                    <div className="marketing-container h-full">
                        <nav className="relative flex h-full items-center justify-between">
                            <Link to="/" className="flex items-center z-10">
                                <img src="/landing/Logo.png" alt="CredLayer AI" className="h-10 w-auto" />
                            </Link>
                            <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-8">
                                <Link to="/about" className="nav-link">About Us</Link>
                                <Link to="/community" className="nav-link">Community</Link>
                            </div>
                            <div className="flex items-center gap-4 z-10">
                                <Link to="/connect" className="btn-pill bg-black px-7 py-3 text-sm text-white hover:bg-zinc-800 transition-all">
                                    Connect Wallet
                                </Link>
                            </div>
                        </nav>
                    </div>
                </header>

                <div className="gs-form-section" style={{ paddingTop: '8rem' }}>
                    <div className="gs-form-card">
                        <div className="gs-success">
                            <div className="gs-success-icon">
                                <Check size={32} strokeWidth={3} />
                            </div>
                            <h2>You're In!</h2>
                            <p>
                                Welcome to CredLayer AI, {formData.fullName.split(' ')[0]}. We'll reach out to{' '}
                                <strong>{formData.email}</strong> with next steps to activate your account.
                            </p>
                            <div className="gs-success-actions">
                                <Link
                                    to="/connect"
                                    className="gs-btn-primary"
                                    style={{ textDecoration: 'none' }}
                                >
                                    <Wallet size={18} />
                                    Connect Wallet
                                </Link>
                                <Link
                                    to="/"
                                    className="gs-btn-secondary"
                                    style={{ textDecoration: 'none' }}
                                >
                                    Back to Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="gs-footer">
                    <div className="gs-footer-inner">
                        <div className="gs-footer-top">
                            <div className="gs-footer-brand">
                                <img src="/landing/Logo.png" alt="CredLayer AI" />
                                <p>Building the portable financial reputation infrastructure for the next billion users.</p>
                            </div>
                            <div className="gs-footer-links">
                                <div className="gs-footer-col">
                                    <span className="gs-footer-col-title">Product</span>
                                    <Link to="/payments">Payments</Link>
                                    <Link to="/dashboard">Dashboard</Link>
                                </div>
                                <div className="gs-footer-col">
                                    <span className="gs-footer-col-title">Company</span>
                                    <Link to="/about">About</Link>
                                    <Link to="/community">Community</Link>
                                </div>
                                <div className="gs-footer-col">
                                    <span className="gs-footer-col-title">Social</span>
                                    <a href="#">X (Twitter)</a>
                                    <a href="#">GitHub</a>
                                    <a href="#">Discord</a>
                                </div>
                            </div>
                        </div>
                        <div className="gs-footer-bottom">
                            <p>© {new Date().getFullYear()} CredLayer AI. All rights reserved.</p>
                            <div className="gs-footer-legal">
                                <a href="#">Privacy</a>
                                <a href="#">Terms</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        )
    }

    /* ── Main Render ── */
    return (
        <div ref={pageRef} className="gs-page">
            {/* ── Navigation ── */}
            <header className="sticky top-0 z-50 h-20 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
                <div className="marketing-container h-full">
                    <nav className="relative flex h-full items-center justify-between">
                        <Link to="/" className="flex items-center z-10">
                            <img src="/landing/Logo.png" alt="CredLayer AI" className="h-10 w-auto" />
                        </Link>
                        <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-8">
                            <Link to="/about" className="nav-link">About Us</Link>
                            <Link to="/community" className="nav-link">Community</Link>
                        </div>
                        <div className="flex items-center gap-4 z-10">
                            <Link to="/connect" className="btn-pill bg-black px-7 py-3 text-sm text-white hover:bg-zinc-800 transition-all">
                                Connect Wallet
                            </Link>
                        </div>
                    </nav>
                </div>
            </header>

            {/* ── Hero ── */}
            <section className="gs-hero">
                <div className="gs-hero-content">
                    <div className="gs-hero-anim gs-chip">
                        <span className="gs-chip-dot" />
                        <span>Join the Network</span>
                    </div>
                    <h1 className="gs-hero-anim">
                        Start Building Your<br />Financial Reputation
                    </h1>
                    <p className="gs-hero-anim">
                        Create your CredLayer AI account and begin recording portable, verifiable credit history on Ethereum.
                    </p>
                </div>
            </section>

            {/* ── Form ── */}
            <section className="gs-form-section">
                <div className="gs-form-card">
                    {/* Header */}
                    <div className="gs-form-header">
                        <div className="gs-form-header-left">
                            <h2>{STEPS[currentStep - 1].label}</h2>
                            <p>Step {currentStep} of {STEPS.length}</p>
                        </div>
                        <div className="gs-step-indicator">
                            {STEPS.map((s) => (
                                <span
                                    key={s.id}
                                    className={`gs-step-dot ${
                                        s.id === currentStep
                                            ? 'gs-step-dot--active'
                                            : s.id < currentStep
                                              ? 'gs-step-dot--done'
                                              : ''
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Form Body */}
                    <div className="gs-form">
                        {renderStep()}

                        {/* Actions */}
                        <div className="gs-actions">
                            {currentStep > 1 && (
                                <button type="button" className="gs-btn-secondary" onClick={handleBack}>
                                    <ArrowLeft size={16} />
                                    Back
                                </button>
                            )}
                            <button type="button" className="gs-btn-primary" onClick={handleNext}>
                                {currentStep < 3 ? (
                                    <>
                                        Continue
                                        <ArrowRight size={18} />
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} />
                                        Create Account
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Feature Cards ── */}
            <section className="gs-features">
                <div className="gs-features-grid">
                    {featureCards.map((card) => {
                        const Icon = card.icon
                        return (
                            <article key={card.title} className="gs-feature-card">
                                <div className="gs-feature-icon">
                                    <Icon size={22} />
                                </div>
                                <h4>{card.title}</h4>
                                <p>{card.description}</p>
                            </article>
                        )
                    })}
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="gs-footer">
                <div className="gs-footer-inner">
                    <div className="gs-footer-top">
                        <div className="gs-footer-brand">
                            <img src="/landing/Logo.png" alt="CredLayer AI" />
                            <p>Building the portable financial reputation infrastructure for the next billion users.</p>
                        </div>
                        <div className="gs-footer-links">
                            <div className="gs-footer-col">
                                <span className="gs-footer-col-title">Product</span>
                                <Link to="/payments">Payments</Link>
                                <Link to="/dashboard">Dashboard</Link>
                            </div>
                            <div className="gs-footer-col">
                                <span className="gs-footer-col-title">Company</span>
                                <Link to="/about">About</Link>
                                <Link to="/community">Community</Link>
                            </div>
                            <div className="gs-footer-col">
                                <span className="gs-footer-col-title">Social</span>
                                <a href="#">X (Twitter)</a>
                                <a href="#">GitHub</a>
                                <a href="#">Discord</a>
                            </div>
                        </div>
                    </div>
                    <div className="gs-footer-bottom">
                        <p>© {new Date().getFullYear()} CredLayer AI. All rights reserved.</p>
                        <div className="gs-footer-legal">
                            <a href="#">Privacy</a>
                            <a href="#">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}