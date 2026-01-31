import { useRef } from 'react'
import { PointLight, Mesh } from 'three'

interface StoreBlockProps {
    position: [number, number, number]
}

export default function StoreBlock({ position }: StoreBlockProps) {
    const meshRef = useRef<Mesh>(null)
    const lightRef = useRef<PointLight>(null)

    // Adjust position so pillar sits on ground (half height offset)
    const adjustedPosition: [number, number, number] = [
        position[0],
        position[1] + 1.5, // Half of 3 units height
        position[2]
    ]

    return (
        <group position={adjustedPosition}>
            {/* Brutalist Monolith Pillar */}
            <mesh ref={meshRef} castShadow receiveShadow>
                <boxGeometry args={[0.5, 3, 0.5]} />
                <meshStandardMaterial
                    color="#1a1a1a"
                    roughness={0.7}
                    metalness={0.3}
                />
            </mesh>

            {/* Base Glow */}
            <pointLight
                ref={lightRef}
                position={[0, -1.4, 0]}
                color="#4a9eff"
                intensity={2}
                distance={3}
                decay={2}
            />

            {/* Emissive Base Ring */}
            <mesh position={[0, -1.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.3, 0.5, 32]} />
                <meshStandardMaterial
                    color="#4a9eff"
                    emissive="#4a9eff"
                    emissiveIntensity={2}
                    transparent
                    opacity={0.8}
                />
            </mesh>
        </group>
    )
}
