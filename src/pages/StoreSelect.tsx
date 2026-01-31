import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Lock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

// Images
import brutalistImg from '../assets/stores/brutalist-vault.png'
import cyberImg from '../assets/stores/cyber-bodega.png'
import zenImg from '../assets/stores/zen-garden.png'

const STORES = [
    {
        id: 'brutalist-vault',
        name: 'The Brutalist Vault',
        description: 'Heavy concrete. Sharp shadows. Underground luxury.',
        status: 'unlocked',
        accent: '#B87333',
        image: brutalistImg,
    },
    {
        id: 'cyber-bodega',
        name: 'Cyber-Bodega',
        description: 'Neon-lit convenience store from 2087.',
        status: 'locked',
        accent: '#5B8DEF',
        image: cyberImg,
    },
    {
        id: 'zen-garden',
        name: 'Zen Garden',
        description: 'Minimalist tranquility. Stone and water.',
        status: 'locked',
        accent: '#7CB87C',
        image: zenImg,
    },
]

function StoreCard({ store, onSelect }: { store: typeof STORES[0], onSelect: () => void }) {
    const isLocked = store.status === 'locked'
    const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
    const [isHovered, setIsHovered] = useState(false)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height
        setMousePos({ x, y })
    }

    const rotateX = isHovered ? (mousePos.y - 0.5) * -15 : 0
    const rotateY = isHovered ? (mousePos.x - 0.5) * 15 : 0

    return (
        <motion.div
            style={{ width: '340px', height: '420px', perspective: '1200px' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
        >
            {/* Floating animation wrapper */}
            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: '100%', height: '100%' }}
            >
                {/* 3D Tilt wrapper */}
                <motion.div
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => { setIsHovered(false); setMousePos({ x: 0.5, y: 0.5 }) }}
                    onClick={!isLocked ? onSelect : undefined}
                    animate={{ rotateX, rotateY }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    style={{
                        width: '100%',
                        height: '100%',
                        background: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border-default)',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        opacity: isLocked ? 0.6 : 1,
                        filter: isLocked ? 'grayscale(0.4)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        transformStyle: 'preserve-3d',
                        boxShadow: isHovered
                            ? `0 50px 100px -20px rgba(0,0,0,0.7), 0 30px 60px -15px rgba(0,0,0,0.5), 0 0 80px -10px ${store.accent}50`
                            : '0 30px 60px -15px rgba(0,0,0,0.5), 0 15px 30px -10px rgba(0,0,0,0.3)',
                    }}
                >
                    {/* Card Image Area */}
                    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                        {/* The Image */}
                        <img
                            src={store.image}
                            alt={store.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.5s ease',
                                transform: isHovered && !isLocked ? 'scale(1.1)' : 'scale(1)',
                            }}
                        />

                        {/* Gradient Overlay for Text Readability */}
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--color-bg-elevated) 0%, transparent 60%)', zIndex: 10 }} />

                        {/* Locked Overlay */}
                        {isLocked && (
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 20,
                                background: 'rgba(0,0,0,0.5)',
                                backdropFilter: 'blur(2px)'
                            }}>
                                <Lock style={{ width: '36px', height: '36px', color: 'rgba(255,255,255,0.8)' }} />
                            </div>
                        )}
                    </div>

                    {/* Card Content */}
                    <div style={{ padding: '20px 24px', transform: 'translateZ(30px)', background: 'var(--color-bg-elevated)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <h3 style={{ fontFamily: 'var(--font-family-display)', fontSize: '22px', color: 'var(--color-text-primary)', margin: 0 }}>
                                {store.name}
                            </h3>
                            {!isLocked && (
                                <span
                                    className="badge"
                                    style={{
                                        fontSize: '10px',
                                        padding: '3px 10px',
                                        background: `${store.accent}20`,
                                        color: store.accent,
                                        border: `1px solid ${store.accent}40`,
                                    }}
                                >
                                    Ready
                                </span>
                            )}
                        </div>

                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 14px 0' }}>
                            {store.description}
                        </p>

                        {!isLocked ? (
                            <motion.div
                                animate={{ x: isHovered ? 6 : 0 }}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: store.accent, fontSize: '13px', fontWeight: 500 }}
                            >
                                Enter World
                                <ArrowRight style={{ width: '14px', height: '14px' }} />
                            </motion.div>
                        ) : (
                            <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>Coming Soon</span>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}

function NavArrow({ direction, onClick }: { direction: 'left' | 'right', onClick: () => void }) {
    const Icon = direction === 'left' ? ChevronLeft : ChevronRight

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.1, background: 'var(--color-bg-hover)' }}
            whileTap={{ scale: 0.95 }}
            style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
            }}
        >
            <Icon style={{ width: '26px', height: '26px', color: 'var(--color-text-primary)' }} />
        </motion.button>
    )
}

export default function StoreSelect() {
    const navigate = useNavigate()
    const [currentIndex, setCurrentIndex] = useState(0)

    const goNext = () => setCurrentIndex((prev) => (prev + 1) % STORES.length)
    const goPrev = () => setCurrentIndex((prev) => (prev - 1 + STORES.length) % STORES.length)

    const currentStore = STORES[currentIndex]

    return (
        <div
            style={{
                height: '100vh',
                width: '100%',
                background: 'var(--color-bg-canvas)',
                color: 'var(--color-text-primary)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Navbar */}
            <nav style={{ padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border-default)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <div style={{ width: '10px', height: '10px', background: 'var(--color-accent-gold)', borderRadius: '2px' }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-family-display)', fontSize: '18px' }}>Nodal</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '20px' }}
                >
                    <a href="#" style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Docs</a>
                    <button className="btn btn-ghost" style={{ fontSize: '13px', padding: '8px 16px' }}>Log In</button>
                </motion.div>
            </nav>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', padding: '0 48px', minHeight: 0 }}>
                {/* Left: Hero Content */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ width: '420px', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: '48px' }}
                >
                    <div className="text-label" style={{ marginBottom: '20px' }}>3D Retail Design Platform</div>

                    <h1 style={{
                        fontFamily: 'var(--font-family-display)',
                        fontSize: '42px',
                        color: 'var(--color-text-primary)',
                        marginBottom: '20px',
                        lineHeight: 1.05,
                        fontWeight: 400,
                    }}>
                        Design your retail<br />
                        <span style={{ color: 'var(--color-accent-gold)' }}>universe</span> in minutes.
                    </h1>

                    <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: 1.7, maxWidth: '360px' }}>
                        Select a template, place intelligent assets, and let AI handle the rest. The next generation of store planning.
                    </p>
                </motion.div>

                {/* Vertical Divider */}
                <motion.div
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    style={{
                        width: '1px',
                        height: '200px',
                        background: 'var(--color-border-default)',
                        alignSelf: 'center',
                        flexShrink: 0,
                    }}
                />

                {/* Right: Card Carousel */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingLeft: '48px' }}>
                    <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                        <span className="text-label">Choose Template</span>
                    </div>

                    {/* Card with Arrows */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '64px' }}>
                        <NavArrow direction="left" onClick={goPrev} />

                        <AnimatePresence mode="wait">
                            <StoreCard
                                key={currentStore.id}
                                store={currentStore}
                                onSelect={() => navigate('/builder')}
                            />
                        </AnimatePresence>

                        <NavArrow direction="right" onClick={goNext} />
                    </div>

                    {/* Pagination Dots */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '28px' }}>
                        {STORES.map((_, i) => (
                            <motion.button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                animate={{
                                    width: i === currentIndex ? '28px' : '8px',
                                    background: i === currentIndex ? 'var(--color-accent-gold)' : 'var(--color-border-default)',
                                }}
                                style={{ height: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                                whileHover={{ opacity: 0.8 }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '20px 48px', textAlign: 'center', flexShrink: 0 }}>
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: '11px', fontFamily: 'var(--font-family-mono)', margin: 0 }}>
                    Nodal Engine v0.1 — Early Access
                </p>
            </div>
        </div>
    )
}
