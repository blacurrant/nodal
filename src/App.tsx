import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import StoreSelect from './pages/StoreSelect'
import Builder from './pages/Builder'

// Minimum width for the app (tablet and above)
const MIN_WIDTH = 1024

function ScreenTooSmall() {
    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0D0D0D',
            padding: '40px',
            textAlign: 'center',
        }}>
            {/* Logo */}
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#161616',
                border: '1px solid #2A2A2A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '32px',
            }}>
                <div style={{
                    width: '16px',
                    height: '16px',
                    background: '#C9A227',
                    borderRadius: '4px'
                }} />
            </div>

            {/* Message */}
            <h1 style={{
                fontFamily: 'var(--font-family-display, serif)',
                fontSize: '28px',
                color: '#F5F0E8',
                marginBottom: '16px',
                fontWeight: 400,
            }}>
                Big dreams need big screens
            </h1>

            <p style={{
                fontSize: '15px',
                color: '#6B665C',
                maxWidth: '320px',
                lineHeight: 1.6,
                marginBottom: '32px',
            }}>
                Nodal is a 3D store builder designed for desktop.
                Please switch to a larger screen to start creating.
            </p>

            {/* Min requirement badge */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '8px',
                background: '#161616',
                border: '1px solid #2A2A2A',
            }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B665C" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                <span style={{ fontSize: '12px', color: '#6B665C' }}>
                    Minimum: {MIN_WIDTH}px wide
                </span>
            </div>
        </div>
    )
}

export default function App() {
    const [isTooSmall, setIsTooSmall] = useState(false)

    useEffect(() => {
        const checkSize = () => {
            setIsTooSmall(window.innerWidth < MIN_WIDTH)
        }

        checkSize()
        window.addEventListener('resize', checkSize)
        return () => window.removeEventListener('resize', checkSize)
    }, [])

    if (isTooSmall) {
        return <ScreenTooSmall />
    }

    return (
        <Routes>
            <Route path="/" element={<StoreSelect />} />
            <Route path="/builder" element={<Builder />} />
        </Routes>
    )
}
