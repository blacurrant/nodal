import { motion } from 'framer-motion'
import { Html } from '@react-three/drei'
import { X, ShoppingBag, Check } from 'lucide-react'
import useStore, { PRODUCTS } from './store'
import { Vector3 } from 'three'

export default function ProductPanel3D() {
    const activeProductId = useStore((state) => state.activeProductId)
    const setActiveProduct = useStore((state) => state.setActiveProduct)
    const cartItems = useStore((state) => state.cartItems)
    const addToCart = useStore((state) => state.addToCart)

    const product = PRODUCTS.find(p => p.id === activeProductId)
    const isInCart = activeProductId ? cartItems.includes(activeProductId) : false

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (activeProductId) {
            addToCart(activeProductId)
        }
    }

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation()
        setActiveProduct(null)
    }

    if (!product) return null

    // Position the panel to the right of the product
    const productPos = new Vector3(...product.position)
    const panelPos: [number, number, number] = [productPos.x + 1.5, productPos.y + 1.2, productPos.z]

    return (
        <Html
            position={panelPos}
            center
            distanceFactor={3}
            occlude={false}
            style={{ pointerEvents: 'auto' }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                style={{
                    width: '280px',
                    userSelect: 'none',
                }}
            >
                <div style={{
                    background: 'rgba(13, 13, 13, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <span style={{
                            fontSize: '9px',
                            fontWeight: 500,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: '#6B665C',
                        }}>
                            Product Details
                        </span>
                        <button
                            onClick={handleClose}
                            style={{
                                padding: '4px',
                                borderRadius: '6px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#6B665C',
                                display: 'flex',
                            }}
                        >
                            <X size={12} />
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '16px' }}>
                        {/* Name & Price */}
                        <div style={{ marginBottom: '12px' }}>
                            <h2 style={{
                                fontSize: '16px',
                                fontWeight: 500,
                                color: '#F5F0E8',
                                marginBottom: '4px',
                                fontFamily: 'var(--font-family-display, serif)',
                            }}>
                                {product.name}
                            </h2>
                            <span style={{
                                fontSize: '20px',
                                fontWeight: 600,
                                color: '#C9A227',
                            }}>
                                {product.price}
                            </span>
                        </div>

                        {/* Description */}
                        <p style={{
                            fontSize: '11px',
                            lineHeight: 1.5,
                            color: '#A09A8C',
                            marginBottom: '14px',
                        }}>
                            {product.description}
                        </p>

                        {/* Color */}
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{
                                fontSize: '9px',
                                fontWeight: 500,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: '#6B665C',
                                display: 'block',
                                marginBottom: '6px',
                            }}>
                                Color
                            </label>
                            <span style={{
                                fontSize: '11px',
                                color: '#F5F0E8',
                            }}>
                                {product.color}
                            </span>
                        </div>

                        {/* Sizes */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                fontSize: '9px',
                                fontWeight: 500,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: '#6B665C',
                                display: 'block',
                                marginBottom: '8px',
                            }}>
                                Size
                            </label>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {product.sizes.map((size, i) => (
                                    <button
                                        key={size}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                            padding: '6px 10px',
                                            borderRadius: '6px',
                                            fontSize: '10px',
                                            fontWeight: 500,
                                            background: i === 0 ? '#B87333' : 'rgba(255, 255, 255, 0.05)',
                                            color: i === 0 ? '#0D0D0D' : '#A09A8C',
                                            border: 'none',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={isInCart}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                fontSize: '12px',
                                fontWeight: 600,
                                background: isInCart ? 'rgba(74, 222, 128, 0.2)' : '#C9A227',
                                color: isInCart ? '#4ADE80' : '#0D0D0D',
                                border: 'none',
                                cursor: isInCart ? 'default' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                            }}
                        >
                            {isInCart ? (
                                <>
                                    <Check size={14} />
                                    Added to Cart
                                </>
                            ) : (
                                <>
                                    <ShoppingBag size={14} />
                                    Add to Cart
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </Html>
    )
}
