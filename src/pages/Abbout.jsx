import React, { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
    ArrowRight,
    Sparkles,
    Heart,
    ShieldCheck,
    Globe,
    Users,
    Zap,
    Code2,
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

import '../styles/about.css'
import founderAvatar from '../assets/founder_avatar.png'
import trustVideo from '../assets/video1.mp4'

gsap.registerPlugin(ScrollTrigger)

const teamMembers = [
    {
        initials: 'EJ',
        name: 'Erick Jair Mucino Antonio',
        role: 'Founder · Full Stack Developer',
        stack: ['React', 'Next.js', 'Stylus', 'Solidity', 'Rust'],
        color: 'purple',
    },
]

const values = [
    {
        icon: ShieldCheck,
        eyebrow: 'Transparency',
        title: 'Immutable On-Chain Record',
        description:
            'Every payment, reputation score, and contract is recorded on Arbitrum and Scroll. No intermediaries, no surprises.',
    },
    {
        icon: Globe,
        eyebrow: 'Local Identity',
        title: 'Designed from Mexico',
        description:
            'Regional stablecoins, subsidized gas for cooperatives, and Spanish ENS subdomains.',
    },
    {
        icon: Users,
        eyebrow: 'Governance',
        title: 'Community-Defined Rules',
        description:
            'Interest rates, features, and risk criteria voted on by verified backers and borrowers.',
    },
]

const milestones = [
    {
        year: '2023',
        title: 'Project Genesis',
        copy: 'First prototype of on-chain scoring for credit unions in Mexico City.',
    },
    {
        year: '2024',
        title: 'ENS + Stylus Integration',
        copy: 'Multi-chain reputation engine and Rust smart contracts on Arbitrum Stylus.',
    },
    {
        year: '2025',
        title: 'ETH México · Mainnet',
        copy: 'Public launch with Scroll L2, community dashboard, and P2P microloans in production.',
    },
]

const AboutUs = () => {
    const pageRef = useRef(null)

    useLayoutEffect(() => {
        let lenis, ctx
        try {
            lenis = new Lenis({ duration: 1.2, smooth: true })
            const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf) }
            requestAnimationFrame(raf)

            ctx = gsap.context(() => {
                gsap.from('.hero-element', { y: 40, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out' })
                gsap.from('.stagger-item', {
                    scrollTrigger: { trigger: '.animate-section', start: 'top 85%' },
                    y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
                })
                gsap.from('.stagger-item-2', {
                    scrollTrigger: { trigger: '.animate-section-2', start: 'top 85%' },
                    y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
                })
                gsap.from('.stagger-item-3', {
                    scrollTrigger: { trigger: '.animate-section-3', start: 'top 85%' },
                    y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
                })
            }, pageRef)
        } catch (error) {
            console.error(error)
        }
        return () => { if (lenis) lenis.destroy(); if (ctx) ctx.revert() }
    }, [])

    return (
        <div ref={pageRef} className="min-h-screen flex flex-col bg-white text-black font-inter selection:bg-black selection:text-white pb-0">
            {/* ── Navigation ── */}
            <header className="sticky top-0 z-50 h-20 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
                <div className="marketing-container h-full">
                    <nav className="relative flex h-full items-center justify-between">
                        {/* Logo Section */}
                        <Link to="/" className="flex items-center z-10">
                            <img src="/landing/Logo.png" alt="CredLayer AI" className="h-10 w-auto" />
                        </Link>

                        {/* Desktop Nav Links (Centrado absoluto para diseño premium) */}
                        <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-8">
                            <Link to="/dashboard" className="nav-link">Dashboard</Link>
                            <Link to="/payments" className="nav-link">Payments</Link>
                            <Link to="/loans" className="nav-link">Loans</Link>
                            <Link to="/community" className="nav-link">Community</Link>
                            <Link to="/about" className="nav-link font-bold text-black">About Us</Link>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-4 z-10">
                            <Link to="/payments" className="btn-pill bg-black px-7 py-3 text-sm text-white hover:bg-zinc-800 transition-all">
                                Start with Payments
                            </Link>
                        </div>
                    </nav>
                </div>
            </header>

            <main className="flex-grow">
                {/* ── Hero Section ── */}
                <section className="relative flex min-h-[85vh] w-full items-center overflow-hidden py-20 bg-white">
                    <div className="marketing-container flex w-full flex-col lg:flex-row lg:items-center gap-12">
                        <div className="z-10 flex flex-col items-start lg:w-3/5">
                            <div className="hero-element mb-6 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-semibold text-zinc-900 border border-zinc-200/80">
                                <span className="flex h-2 w-2 rounded-full bg-black animate-pulse"></span>
                                <span>Mission · Team · History</span>
                            </div>

                            <h1 className="hero-element text-5xl lg:text-7xl font-extrabold tracking-tight text-black mb-8 leading-[1.05]">
                                Building the decentralized financial system of <span className="underline decoration-black underline-offset-8">Latin America</span>
                            </h1>

                            <div className="hero-element mb-12 space-y-6">
                                <div className="inline-block border-b-2 border-zinc-900 pb-1">
                                    <span className="text-2xl font-bold tracking-tight text-zinc-900">
                                        Designed for cooperatives, creators, and communities.
                                    </span>
                                </div>
                                <p className="max-w-xl text-xl leading-relaxed text-zinc-600">
                                    CredLayer AI was born in Mexico City to democratize access to credit, payments, and Web3 identity with immutable and transparent infrastructure.
                                </p>
                            </div>

                            <div className="hero-element flex flex-wrap gap-5">
                                <Link to="/community" className="group flex items-center gap-3 rounded-full bg-black px-10 py-5 text-lg font-bold text-white transition-all hover:bg-zinc-800 hover:shadow-lg">
                                    <Heart size={20} className="text-white" />
                                    Join the community <span className="transition-transform group-hover:translate-x-1">→</span>
                                </Link>
                                <Link to="/loans" className="rounded-full bg-zinc-100 px-10 py-5 text-lg font-bold text-black transition-all hover:bg-zinc-200 border border-zinc-200">
                                    Explore microloans
                                </Link>
                            </div>
                        </div>

                        {/* Right Content: Card lateral con datos del equipo y status */}
                        <div className="hero-element relative mt-12 flex justify-center lg:mt-0 lg:w-2/5 lg:justify-end w-full">
                            <div className="relative w-full max-w-[500px] bg-white border border-zinc-200 rounded-[32px] p-8 shadow-2xl shadow-zinc-200/50 flex flex-col gap-8">
                                <div className="flex justify-between items-center border-b border-zinc-100 pb-6">
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">Who Am I</span>
                                        <h3 className="text-2xl font-black text-black mt-1">Founding Team</h3>
                                    </div>
                                    <span className="px-4 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 font-bold text-xs tracking-wide">
                                        CDMX · LIVE
                                    </span>
                                </div>

                                <div className="flex flex-col gap-6">
                                    {teamMembers.map((m) => (
                                        <div key={m.initials} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 transition-all hover:border-zinc-300 hover:bg-zinc-100/80">
                                            <img
                                                src={founderAvatar}
                                                alt={m.name}
                                                className="w-14 h-14 rounded-full object-cover border border-zinc-200 grayscale contrast-110"
                                            />
                                            <div className="flex-grow">
                                                <strong className="text-lg font-bold text-zinc-900 block">{m.name}</strong>
                                                <span className="text-sm font-medium text-zinc-500 block">{m.role}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-100 justify-center">
                                    <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-xs font-semibold border border-zinc-200">Stylus ready</span>
                                    <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-xs font-semibold border border-zinc-200">ENS integrated</span>
                                    <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-xs font-semibold border border-zinc-200">Open source</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Valores Section ── */}
                <section className="animate-section py-32 bg-zinc-50/80 border-t border-b border-zinc-100">
                    <div className="marketing-container">
                        <div className="stagger-item mb-20 max-w-3xl">
                            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-black">Our Foundational Pillars.</h2>
                            <p className="mt-4 text-xl text-zinc-500 leading-relaxed">The principles guiding the development of our decentralized infrastructure.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            {values.map((v) => {
                                const Icon = v.icon
                                return (
                                    <article key={v.eyebrow} className="stagger-item bg-white border border-zinc-200 rounded-[28px] p-10 transition-all hover:border-black hover:shadow-xl group flex flex-col justify-between">
                                        <div>
                                            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white group-hover:scale-105 transition-transform">
                                                <Icon size={28} />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-2">{v.eyebrow}</span>
                                            <h3 className="mb-4 text-2xl font-bold text-black">{v.title}</h3>
                                            <p className="text-zinc-600 leading-relaxed text-lg">{v.description}</p>
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                        <div className="cube-loader">
                            <div className="cube-top"></div>
                            <div className="cube-wrapper">
                                <span style={{ "--i": 0 }} className="cube-span"></span>
                                <span style={{ "--i": 1 }} className="cube-span"></span>
                                <span style={{ "--i": 2 }} className="cube-span"></span>
                                <span style={{ "--i": 3 }} className="cube-span"></span>
                            </div>

                            <style>{`
                                .cube-loader {
                                    position: relative;
                                    width: 75px;
                                    height: 75px;
                                    transform-style: preserve-3d;
                                    transform: rotateX(-30deg);
                                    animation: cubeAnimate 4s linear infinite;
                                }

                                @keyframes cubeAnimate {
                                    0% {
                                        transform: rotateX(-30deg) rotateY(0);
                                    }
                                    100% {
                                        transform: rotateX(-30deg) rotateY(360deg);
                                    }
                                }

                                .cube-loader .cube-wrapper {
                                    position: absolute;
                                    width: 100%;
                                    height: 100%;
                                    transform-style: preserve-3d;
                                }

                                .cube-loader .cube-wrapper .cube-span {
                                    position: absolute;
                                    width: 100%;
                                    height: 100%;
                                    transform: rotateY(calc(90deg * var(--i))) translateZ(37.5px);
                                    background: linear-gradient(
                                        to bottom,
                                        hsl(330, 3.13%, 25.1%) 0%,
                                        hsl(177.27, 21.71%, 32.06%) 5.5%,
                                        hsl(176.67, 34.1%, 36.88%) 12.1%,
                                        hsl(176.61, 42.28%, 40.7%) 19.6%,
                                        hsl(176.63, 48.32%, 43.88%) 27.9%,
                                        hsl(176.66, 53.07%, 46.58%) 36.6%,
                                        hsl(176.7, 56.94%, 48.91%) 45.6%,
                                        hsl(176.74, 62.39%, 50.91%) 54.6%,
                                        hsl(176.77, 69.86%, 52.62%) 63.4%,
                                        hsl(176.8, 76.78%, 54.08%) 71.7%,
                                        hsl(176.83, 83.02%, 55.29%) 79.4%,
                                        hsl(176.85, 88.44%, 56.28%) 86.2%,
                                        hsl(176.86, 92.9%, 57.04%) 91.9%,
                                        hsl(176.88, 96.24%, 57.59%) 96.3%,
                                        hsl(176.88, 98.34%, 57.93%) 99%,
                                        hsl(176.89, 99.07%, 58.04%) 100%
                                    );
                                }

                                .cube-top {
                                    position: absolute;
                                    width: 75px;
                                    height: 75px;
                                    background: hsl(330, 3.13%, 25.1%);
                                    transform: rotateX(90deg) translateZ(37.5px);
                                    transform-style: preserve-3d;
                                }

                                .cube-top::before {
                                    content: '';
                                    position: absolute;
                                    width: 75px;
                                    height: 75px;
                                    background: hsl(176.61, 42.28%, 40.7%);
                                    transform: translateZ(-90px);
                                    filter: blur(10px);
                                    box-shadow: 0 0 10px #323232,
                                        0 0 20px hsl(176.61, 42.28%, 40.7%),
                                        0 0 30px #323232,
                                        0 0 40px hsl(176.61, 42.28%, 40.7%);
                                }
                            `}</style>
                        </div>
                    </div>
                </section>

                {/* ── Historia / Milestones ── */}
                <section className="animate-section-2 py-32 bg-white">
                    <div className="marketing-container">
                        <div className="stagger-item-2 mb-20 max-w-3xl">
                            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-black">From an idea in CDMX to real infrastructure.</h2>
                            <p className="mt-4 text-xl text-zinc-500 leading-relaxed">Our journey building transparent and verifiable financial technology.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            {milestones.map((m) => (
                                <article key={m.year} className="stagger-item-2 p-10 rounded-[28px] bg-zinc-50 border border-zinc-200/80 transition-all hover:bg-zinc-100/80 flex flex-col justify-between">
                                    <div>
                                        <span className="text-5xl font-black text-black block mb-6 tracking-tight">{m.year}</span>
                                        <h4 className="text-2xl font-bold text-zinc-900 mb-4">{m.title}</h4>
                                        <p className="text-zinc-600 leading-relaxed text-lg">{m.copy}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Team Cards ── */}
                <section className="animate-section-3 py-32 bg-zinc-50/80 border-t border-zinc-100">
                    <div className="marketing-container">
                        <div className="stagger-item-3 mb-20 max-w-3xl">
                            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-black">Meet the Builders.</h2>
                            <p className="mt-4 text-xl text-zinc-500 leading-relaxed">A multidisciplinary team uniting smart contracts, product design, and risk engines.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            {teamMembers.map((m) => (
                                <article key={m.initials} className="stagger-item-3 bg-white border border-zinc-200 rounded-[28px] p-10 transition-all hover:shadow-xl hover:border-black flex flex-col justify-between">
                                    <div>
                                        <img
                                            src={founderAvatar}
                                            alt={m.name}
                                            className="w-16 h-16 rounded-2xl object-cover border border-zinc-200 grayscale contrast-110 mb-8"
                                        />
                                        <strong className="text-2xl font-bold text-black block mb-1">{m.name}</strong>
                                        <span className="text-zinc-500 font-medium text-base block mb-6">{m.role}</span>
                                        <div className="flex flex-wrap gap-2">
                                            {m.stack.map((tag) => (
                                                <span key={tag} className="px-4 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-bold tracking-wide">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Trust On-Chain & Video Pitch Section ── */}
                <section className="py-32 bg-black text-white border-t border-zinc-900">
                    <div className="marketing-container flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex flex-col items-start lg:w-1/2">
                            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-1.5 text-sm font-semibold text-zinc-300 border border-zinc-700">
                                Pitch &amp; Demonstration
                            </span>
                            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                                How Trust Works On-Chain
                            </h2>
                            <p className="text-lg text-zinc-400 mb-6 leading-relaxed">
                                Our protocol introduces the concept of sovereign, portable financial reputation. By linking payments directly to Arbitrum Stylus smart contracts, we compute trust scores without intermediaries.
                            </p>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center flex-shrink-0 text-white font-bold border border-zinc-800 text-sm">1</div>
                                    <div>
                                        <h4 className="font-bold text-white">Arbitrum Stylus Wasm Logic</h4>
                                        <p className="text-sm text-zinc-400">Calculates reputation score using high-performance Rust logic compiled directly to WASM.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center flex-shrink-0 text-white font-bold border border-zinc-800 text-sm">2</div>
                                    <div>
                                        <h4 className="font-bold text-white">Scroll L2 Scaling</h4>
                                        <p className="text-sm text-zinc-400">Stores zero-knowledge proofs and state updates efficiently, keeping gas fees near zero for local cooperatives.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Video player box */}
                        <div className="lg:w-1/2 w-full">
                            <div className="relative border border-zinc-800 rounded-[32px] overflow-hidden bg-zinc-950 shadow-2xl">
                                <video 
                                    src={trustVideo}
                                    controls 
                                    className="w-full h-auto aspect-video rounded-[32px]"
                                    style={{ display: 'block' }}
                                />
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-zinc-800/50">
                                    Trust Protocol Demo
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Technology Stack ── */}
                <section className="py-24 bg-white border-t border-zinc-100">
                    <div className="marketing-container text-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-3">Protocol Architecture</span>
                        <h2 className="text-3xl lg:text-4xl font-extrabold text-black mb-12">Built on Next-Gen Web3 Infrastructure</h2>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="p-8 rounded-[24px] border border-zinc-200 bg-zinc-50 hover:border-black transition-all text-left">
                                <strong className="text-xl font-bold text-black block mb-2">Arbitrum Stylus</strong>
                                <p className="text-xs text-zinc-500 leading-relaxed">Rust &amp; WebAssembly execution environment for high-performance, cost-effective on-chain rating logic.</p>
                            </div>
                            <div className="p-8 rounded-[24px] border border-zinc-200 bg-zinc-50 hover:border-black transition-all text-left">
                                <strong className="text-xl font-bold text-black block mb-2">Scroll L2</strong>
                                <p className="text-xs text-zinc-500 leading-relaxed">EVM-equivalent zk-Rollup scaling platform, ensuring transaction privacy and network finality.</p>
                            </div>
                            <div className="p-8 rounded-[24px] border border-zinc-200 bg-zinc-50 hover:border-black transition-all text-left">
                                <strong className="text-xl font-bold text-black block mb-2">Ethereum Sepolia</strong>
                                <p className="text-xs text-zinc-500 leading-relaxed">Active testbed validation for smart contract registry and loan contract minting parameters.</p>
                            </div>
                            <div className="p-8 rounded-[24px] border border-zinc-200 bg-zinc-50 hover:border-black transition-all text-left">
                                <strong className="text-xl font-bold text-black block mb-2">ENS Identity</strong>
                                <p className="text-xs text-zinc-500 leading-relaxed">Domain resolutions for transparent wallet routing and regional subdomains for users.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── CTA final ── */}
                <section className="py-32 bg-white text-center border-t border-zinc-100">
                    <div className="marketing-container max-w-4xl mx-auto flex flex-col items-center gap-8">
                        <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-5 py-2 text-sm font-semibold text-zinc-900 border border-zinc-200">
                            <Code2 size={16} className="text-black" />
                            <span>Open for builders</span>
                        </div>
                        <h2 className="text-4xl lg:text-6xl font-black tracking-tight text-black leading-tight">
                            Want to Build With Us?
                        </h2>
                        <p className="text-xl text-zinc-600 leading-relaxed max-w-2xl mx-auto">
                            We are looking for backers, cooperatives, and developers who want to bring decentralized finance to more Latin American communities.
                        </p>
                        <div className="flex flex-wrap gap-5 justify-center mt-4">
                            <Link to="/community" className="group flex items-center gap-3 rounded-full bg-black px-12 py-6 text-lg font-bold text-white transition-all hover:bg-zinc-800 hover:shadow-lg">
                                <Zap size={20} className="text-white" />
                                Get Started <span className="transition-transform group-hover:translate-x-1">→</span>
                            </Link>
                            <Link to="/dashboard" className="rounded-full bg-zinc-100 px-12 py-6 text-lg font-bold text-black transition-all hover:bg-zinc-200 border border-zinc-200">
                                View Dashboard
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* ── Footer ── */}
            <footer className="border-t border-zinc-800 py-20 bg-black text-white">
                <div className="marketing-container">
                    <div className="flex flex-col items-start justify-between gap-12 md:flex-row">
                        <div className="max-w-xs">
                            <img src="/landing/Logo.png" alt="CredLayer" className="mb-8 h-8 w-auto brightness-0 invert" />
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                CredLayer AI is building the portable financial reputation infrastructure for the next billion users.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-16 md:grid-cols-3">
                            <div className="flex flex-col gap-4">
                                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Product</span>
                                <Link to="/payments" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Payments</Link>
                                <Link to="/loans" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Lending</Link>
                                <Link to="/dashboard" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">ENS Auth</Link>
                            </div>
                            <div className="flex flex-col gap-4">
                                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Company</span>
                                <Link to="/about" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">About</Link>
                                <Link to="/community" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Community</Link>
                                <Link to="/unified" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Unified Panel</Link>
                            </div>
                            <div className="flex flex-col gap-4">
                                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Social</span>
                                <a href="#" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">X (Twitter)</a>
                                <a href="#" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">GitHub</a>
                                <a href="#" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Discord</a>
                            </div>
                        </div>
                    </div>
                    <div className="mt-20 flex items-center justify-between border-t border-zinc-800 pt-8 text-xs text-zinc-500">
                        <p>© {new Date().getFullYear()} CredLayer AI. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default AboutUs
