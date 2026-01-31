import { useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronLeft, ChevronRight,
    Box, Lightbulb, Grid3X3, Plus, Send,
    RotateCcw, Move, ZoomIn, Eye, Settings,
    Sparkles, Copy, Trash2
} from 'lucide-react'
import Experience from '../Experience'
import * as THREE from 'three'

// Scene hierarchy data
const SCENE_TREE = [
    {
        id: 'environment',
        name: 'Environment',
        type: 'group',
        children: [
            { id: 'floor', name: 'Floor', type: 'mesh' },
            { id: 'walls', name: 'Walls', type: 'mesh' },
            { id: 'ceiling', name: 'Ceiling', type: 'mesh' },
        ]
    },
    {
        id: 'furniture',
        name: 'Furniture',
        type: 'group',
        children: [
            { id: 'rack-1', name: 'Display Rack 01', type: 'mesh' },
            { id: 'rack-2', name: 'Display Rack 02', type: 'mesh' },
            { id: 'table-1', name: 'Center Table', type: 'mesh' },
        ]
    },
    {
        id: 'lighting',
        name: 'Lighting',
        type: 'group',
        children: [
            { id: 'spot-1', name: 'Spot Light 01', type: 'light' },
            { id: 'spot-2', name: 'Spot Light 02', type: 'light' },
            { id: 'ambient', name: 'Ambient Light', type: 'light' },
        ]
    },
]

// Tree Node Component
function TreeNode({ node, level = 0, selectedId, onSelect }: {
    node: typeof SCENE_TREE[0];
    level?: number;
    selectedId: string | null;
    onSelect: (id: string) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(true)
    const hasChildren = 'children' in node && node.children && node.children.length > 0
    const isSelected = selectedId === node.id

    const getIcon = () => {
        if (node.type === 'group') return <Grid3X3 size={14} />
        if (node.type === 'light') return <Lightbulb size={14} />
        return <Box size={14} />
    }

    return (
        <div>
            <div
                onClick={() => onSelect(node.id)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    paddingLeft: `${12 + level * 16}px`,
                    cursor: 'pointer',
                    borderRadius: '6px',
                    margin: '2px 8px',
                    background: isSelected ? 'rgba(184, 115, 51, 0.15)' : 'transparent',
                    border: isSelected ? '1px solid rgba(184, 115, 51, 0.3)' : '1px solid transparent',
                    transition: 'all 0.15s',
                }}
            >
                {hasChildren && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded) }}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            color: '#6B665C',
                            display: 'flex',
                        }}
                    >
                        <ChevronRight
                            size={12}
                            style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}
                        />
                    </button>
                )}
                {!hasChildren && <span style={{ width: '12px' }} />}
                <span style={{ color: isSelected ? '#B87333' : '#6B665C' }}>{getIcon()}</span>
                <span style={{
                    fontSize: '12px',
                    color: isSelected ? '#F5F0E8' : '#A09A8C',
                    fontWeight: isSelected ? 500 : 400,
                }}>
                    {node.name}
                </span>
            </div>
            {hasChildren && isExpanded && (
                <div>
                    {(node as any).children.map((child: any) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            level={level + 1}
                            selectedId={selectedId}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// Scene Panel (Left)
function ScenePanel({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string) => void }) {
    return (
        <div style={{
            width: '260px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: '#131313',
            borderRight: '1px solid #2A2A2A',
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #2A2A2A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <span style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#6B665C',
                }}>
                    Scene
                </span>
                <button style={{
                    padding: '4px',
                    borderRadius: '4px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6B665C',
                }}>
                    <Plus size={14} />
                </button>
            </div>

            {/* Tree */}
            <div style={{ flex: 1, overflowY: 'auto', paddingTop: '8px' }}>
                {SCENE_TREE.map(node => (
                    <TreeNode
                        key={node.id}
                        node={node}
                        selectedId={selectedId}
                        onSelect={onSelect}
                    />
                ))}
            </div>

            {/* Quick Add */}
            <div style={{
                padding: '12px 16px',
                borderTop: '1px solid #2A2A2A',
            }}>
                <button style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    background: '#1C1C1C',
                    border: '1px solid #2A2A2A',
                    color: '#A09A8C',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                }}>
                    <Plus size={14} />
                    Add Object
                </button>
            </div>
        </div>
    )
}

// Preview Panel (Center)
function PreviewPanel() {
    const canvasRef = useRef<HTMLDivElement>(null)
    const [isInteracting, setIsInteracting] = useState(false)

    // Handle ESC key to exit interaction
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsInteracting(false)
        }
    }

    // Add/remove ESC listener
    useState(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    })

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            background: '#0D0D0D',
        }}>
            {/* Viewport Container */}
            <div
                onClick={() => setIsInteracting(true)}
                style={{
                    flex: 1,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: '#0A0A0A',
                    border: isInteracting ? '1px solid #B87333' : '1px solid #2A2A2A',
                    boxShadow: isInteracting
                        ? 'inset 0 2px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(184, 115, 51, 0.3)'
                        : 'inset 0 2px 30px rgba(0,0,0,0.5)',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    cursor: isInteracting ? 'grab' : 'pointer',
                }}
            >
                <div ref={canvasRef} style={{ position: 'absolute', inset: 0 }}>
                    <Canvas
                        camera={{ position: [0, 2, 10], fov: 60 }}
                        shadows
                        gl={{ antialias: true }}
                        onCreated={({ gl }) => {
                            gl.toneMapping = THREE.ACESFilmicToneMapping
                            gl.toneMappingExposure = 0.9
                        }}
                    >
                        <Experience />
                    </Canvas>
                </div>

                {/* ESC Hint - Shows when interacting */}
                <AnimatePresence>
                    {isInteracting && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                background: 'rgba(22, 22, 22, 0.95)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid #2A2A2A',
                            }}
                        >
                            <kbd style={{
                                padding: '3px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontFamily: 'monospace',
                                fontWeight: 600,
                                color: '#F5F0E8',
                                background: '#B87333',
                            }}>
                                ESC
                            </kbd>
                            <span style={{ fontSize: '12px', color: '#A09A8C' }}>
                                to exit preview
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Click to interact hint - Shows when NOT interacting */}
                {!isInteracting && (
                    <div style={{
                        position: 'absolute',
                        top: '16px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: 'rgba(22, 22, 22, 0.8)',
                        border: '1px solid #2A2A2A',
                    }}>
                        <span style={{ fontSize: '11px', color: '#6B665C' }}>
                            Click to interact with scene
                        </span>
                    </div>
                )}

                {/* Viewport Toolbar */}
                <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 8px',
                    borderRadius: '10px',
                    background: 'rgba(22, 22, 22, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid #2A2A2A',
                }}>
                    {[
                        { icon: <RotateCcw size={14} />, label: 'Orbit' },
                        { icon: <Move size={14} />, label: 'Pan' },
                        { icon: <ZoomIn size={14} />, label: 'Zoom' },
                        { icon: <Eye size={14} />, label: 'Reset' },
                    ].map((tool, i) => (
                        <button
                            key={i}
                            title={tool.label}
                            style={{
                                padding: '8px',
                                borderRadius: '6px',
                                background: i === 0 ? 'rgba(184, 115, 51, 0.2)' : 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: i === 0 ? '#B87333' : '#6B665C',
                            }}
                        >
                            {tool.icon}
                        </button>
                    ))}
                </div>
            </div>

            {/* Properties Bar */}
            <div style={{
                marginTop: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: '#131313',
                border: '1px solid #2A2A2A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '12px', color: '#6B665C' }}>Material:</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {['#545454', '#F5F0E8', '#C9A227', '#B87333', '#1A1A1A'].map((color, i) => (
                            <button
                                key={color}
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '6px',
                                    background: color,
                                    border: i === 3 ? '2px solid #B87333' : '1px solid #2A2A2A',
                                    cursor: 'pointer',
                                }}
                            />
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6B665C',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                    }}>
                        <Copy size={12} /> Duplicate
                    </button>
                    <button style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#F87171',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                    }}>
                        <Trash2 size={12} /> Delete
                    </button>
                </div>
            </div>
        </div>
    )
}

// Chat Panel (Right)
function ChatPanel() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Welcome to the Brutalist Vault. I'm your AI architect. What would you like to build?" },
    ])
    const [input, setInput] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        setMessages(prev => [...prev, { role: 'user', content: input }])

        // Mock AI response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'll add that to the scene. Placing a display shelf on the north wall with brushed copper finish..."
            }])
        }, 1000)

        setInput('')
    }

    return (
        <div style={{
            width: '360px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: '#131313',
            borderLeft: '1px solid #2A2A2A',
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #2A2A2A',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
            }}>
                <Sparkles size={16} style={{ color: '#C9A227' }} />
                <span style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#6B665C',
                }}>
                    AI Architect
                </span>
                <div style={{
                    marginLeft: 'auto',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#4ADE80',
                }} />
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
            }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    }}>
                        <div style={{
                            maxWidth: '85%',
                            padding: '12px 16px',
                            borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            background: msg.role === 'user' ? '#B87333' : '#1C1C1C',
                            color: msg.role === 'user' ? '#0D0D0D' : '#A09A8C',
                            fontSize: '13px',
                            lineHeight: 1.5,
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div style={{
                padding: '0 16px 12px',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
            }}>
                {['Add shelf', 'Change lighting', 'Apply material'].map(action => (
                    <button
                        key={action}
                        onClick={() => setInput(action)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            background: '#1C1C1C',
                            border: '1px solid #2A2A2A',
                            color: '#6B665C',
                            fontSize: '11px',
                            cursor: 'pointer',
                        }}
                    >
                        {action}
                    </button>
                ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} style={{ padding: '12px 16px', borderTop: '1px solid #2A2A2A' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: '#1C1C1C',
                    border: '1px solid #2A2A2A',
                }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Describe what to build..."
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            fontSize: '13px',
                            color: '#F5F0E8',
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            padding: '8px',
                            borderRadius: '8px',
                            background: input ? '#B87333' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: input ? '#0D0D0D' : '#6B665C',
                            transition: 'all 0.15s',
                        }}
                    >
                        <Send size={16} />
                    </button>
                </div>
            </form>
        </div>
    )
}

// Main Builder Page
export default function Builder() {
    const [selectedId, setSelectedId] = useState<string | null>('rack-1')

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: '#0D0D0D',
            overflow: 'hidden',
        }}>
            {/* Header */}
            <header style={{
                height: '56px',
                padding: '0 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#131313',
                borderBottom: '1px solid #2A2A2A',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <a href="/" style={{
                        padding: '8px',
                        color: '#6B665C',
                        textDecoration: 'none',
                        display: 'flex',
                    }}>
                        <ChevronLeft size={18} />
                    </a>
                    <div style={{ height: '20px', width: '1px', background: '#2A2A2A' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                            fontFamily: 'var(--font-family-display)',
                            fontSize: '16px',
                            color: '#F5F0E8',
                        }}>
                            Nodal
                        </span>
                        <span style={{ color: '#2A2A2A' }}>/</span>
                        <span style={{ fontSize: '14px', color: '#A09A8C' }}>Brutalist Vault</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button style={{
                        padding: '8px',
                        borderRadius: '8px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6B665C',
                    }}>
                        <Settings size={18} />
                    </button>
                    <button style={{
                        padding: '8px 20px',
                        borderRadius: '8px',
                        background: '#C9A227',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#0D0D0D',
                        fontSize: '13px',
                        fontWeight: 500,
                    }}>
                        Publish
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
                <ScenePanel selectedId={selectedId} onSelect={setSelectedId} />
                <PreviewPanel />
                <ChatPanel />
            </div>
        </div>
    )
}
