import { useRef, useState } from 'react'
import { PointLight, Mesh, Vector3 } from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import useStore from './store'

interface ProductDisplayProps {
    id: string
    name: string
    price: string
    position: [number, number, number]
}

export default function ProductDisplay({ id, name, price, position }: ProductDisplayProps) {
    const meshRef = useRef<Mesh>(null)
    const lightRef = useRef<PointLight>(null)
    const { camera } = useThree()

    // Global State
    const activeProductId = useStore((state) => state.activeProductId)
    const setActiveProduct = useStore((state) => state.setActiveProduct)

    // Local State
    const [hovered, setHovered] = useState(false)
    const [showTag, setShowTag] = useState(false)

    // Derived State
    const isActive = activeProductId === id

    // Adjust position for visual centering
    const adjustedPosition: [number, number, number] = [
        position[0],
        position[1] + 1.5,
        position[2]
    ]

    useFrame(() => {
        if (!meshRef.current) return

        // Tag Visibility Logic
        // 1. Distance check (< 3m)
        const distance = camera.position.distanceTo(new Vector3(...position))

        // 2. Gaze check (dot product of look direction and direction to object)
        const lookDir = new Vector3() // Camera forward vector
        camera.getWorldDirection(lookDir)

        const objPos = new Vector3(...position) // Object world position
        const dirToObj = objPos.sub(camera.position).normalize()

        const dot = lookDir.dot(dirToObj)
        const isLookingAt = dot > 0.85 // ~30 degree cone

        // Only show if close enough AND looking roughly at it
        setShowTag(distance < 3 && isLookingAt)

        // Visual feedback based on hover/active
        const material = meshRef.current.material as any
        if (hovered || isActive) {
            material.emissiveIntensity = 2.0
            document.body.style.cursor = 'pointer'
        } else {
            material.emissiveIntensity = 0.5
            document.body.style.cursor = 'auto'
        }
    })

    const handleClick = (e: any) => {
        e.stopPropagation()
        setActiveProduct(id)
        console.log('Focused product:', name)
    }

    return (
        <group position={adjustedPosition}>
            <mesh
                ref={meshRef}
                castShadow
                receiveShadow
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onClick={handleClick}
            >
                <boxGeometry args={[0.5, 3, 0.5]} />
                <meshStandardMaterial
                    color="#1a1a1a"
                    roughness={0.7}
                    metalness={0.3}
                    emissive="#4a9eff"
                    emissiveIntensity={0.5}
                />
            </mesh>

            {/* Base Glow */}
            <pointLight
                ref={lightRef}
                position={[0, -1.4, 0]}
                color="#4a9eff"
                intensity={isActive ? 5 : 2}
                distance={3}
                decay={2}
            />

            {/* Emissive Base Ring */}
            <mesh position={[0, -2.95, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.8, 1.0, 32]} />
                <meshStandardMaterial
                    color="#4a9eff"
                    emissive="#4a9eff"
                    emissiveIntensity={2}
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Floating Tag UI */}
            {showTag && (
                <Html position={[0.5, 1, 0]} center transform sprite>
                    <div style={{
                        color: 'white',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        fontSize: '12px',
                        letterSpacing: '2px',
                        whiteSpace: 'nowrap',
                        background: 'rgba(0,0,0,0.8)',
                        padding: '4px 8px',
                        borderLeft: '2px solid #4a9eff'
                    }}>
                        {name.toUpperCase()} // {price}
                    </div>
                </Html>
            )}
        </group>
    )
}
