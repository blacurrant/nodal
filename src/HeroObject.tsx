import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Mesh, Raycaster, Vector2 } from 'three'

export default function HeroObject() {
    const meshRef = useRef<Mesh>(null)
    const { camera } = useThree()
    const raycaster = useRef(new Raycaster())
    const baseRoughness = 0.1
    const isLookedAt = useRef(false)

    useFrame((state) => {
        if (!meshRef.current) return

        // Check if camera is looking at this object
        raycaster.current.setFromCamera(new Vector2(0, 0), camera)
        const intersects = raycaster.current.intersectObject(meshRef.current)

        isLookedAt.current = intersects.length > 0

        // Pulse effect when being looked at
        const material = meshRef.current.material as any
        if (isLookedAt.current) {
            // Gentle pulse using sine wave
            const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.5 + 0.5
            material.roughness = baseRoughness + pulse * 0.3
            material.emissiveIntensity = pulse * 0.5

            // Subtle scale pulse
            const scalePulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02
            meshRef.current.scale.setScalar(scalePulse)
        } else {
            // Return to base state
            material.roughness = baseRoughness
            material.emissiveIntensity = 0
            meshRef.current.scale.setScalar(1)
        }
    })

    return (
        <mesh ref={meshRef} position={[0, 1.5, -5]}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshStandardMaterial
                color="#ffffff"
                metalness={1}
                roughness={baseRoughness}
                envMapIntensity={2}
                emissive="#ffffff"
                emissiveIntensity={0}
            />
        </mesh>
    )
}
