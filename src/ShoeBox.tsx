import { useRef, useState } from 'react'
import { Group, Vector3 } from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import useStore from './store'

interface ShoeBoxProps {
    id: string
    name: string
    price: string
    position: [number, number, number]
    rotation?: [number, number, number]
}

export default function ShoeBox({ id, name, price, position, rotation = [0, 0, 0] }: ShoeBoxProps) {
    const groupRef = useRef<Group>(null)
    const { camera } = useThree()

    // Global State
    const activeProductId = useStore((state) => state.activeProductId)
    const setActiveProduct = useStore((state) => state.setActiveProduct)

    // Local State
    const [hovered, setHovered] = useState(false)
    const [showTag, setShowTag] = useState(false)

    const isActive = activeProductId === id

    useFrame((state) => {
        if (!groupRef.current) return

        // Tag Visibility Logic
        const distance = camera.position.distanceTo(new Vector3(...position))
        const lookDir = new Vector3()
        camera.getWorldDirection(lookDir)
        const objPos = new Vector3(...position)
        const dirToObj = objPos.sub(camera.position).normalize()
        const dot = lookDir.dot(dirToObj)
        const isLookingAt = dot > 0.85

        setShowTag(distance < 3 && isLookingAt)

        // Animation
        if (hovered || isActive) {
            document.body.style.cursor = 'pointer'
            // Lift lid slightly or float box? Let's float the whole box
            groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05 + 0.05
        } else {
            document.body.style.cursor = 'auto'
            groupRef.current.position.y = position[1]
        }
    })

    const handleClick = (e: any) => {
        e.stopPropagation()
        setActiveProduct(id)
        console.log('Selected Shoe:', name)
    }

    // Modern Shoebox dimensions ~ 35cm x 25cm x 13cm
    const boxArgs: [number, number, number] = [0.35, 0.13, 0.25]
    // Lid is slightly larger
    const lidArgs: [number, number, number] = [0.36, 0.04, 0.26]

    return (
        <group
            ref={groupRef}
            position={position}
            rotation={rotation as [number, number, number]}
            onClick={handleClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            userData={{ productId: id }}
        >
            {/* Box Body */}
            <mesh castShadow receiveShadow position={[0, boxArgs[1] / 2, 0]}>
                <boxGeometry args={boxArgs} />
                <meshStandardMaterial
                    color="#dcb48b" // Cardboard brown
                    roughness={0.8}
                />
            </mesh>

            {/* Box Lid */}
            <mesh castShadow receiveShadow position={[0, boxArgs[1] + lidArgs[1] / 2 - 0.01, 0]}>
                <boxGeometry args={lidArgs} />
                <meshStandardMaterial
                    color="#222" // Contrast lid (Black)
                    roughness={0.6}
                />
            </mesh>

            {/* Brand/Label Patch on side */}
            <mesh position={[0, boxArgs[1] / 2, boxArgs[2] / 2 + 0.001]}>
                <planeGeometry args={[0.1, 0.05]} />
                <meshBasicMaterial color="white" />
            </mesh>

            {/* Floating Tag UI */}
            {showTag && (
                <Html position={[0, 0.4, 0]} center transform sprite>
                    <div style={{
                        color: 'white',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        fontSize: '10px',
                        letterSpacing: '1px',
                        whiteSpace: 'nowrap',
                        background: 'rgba(0,0,0,0.9)',
                        padding: '4px 6px',
                        border: '1px solid #333'
                    }}>
                        {name.toUpperCase()} <span style={{ color: '#888' }}>|</span> {price}
                    </div>
                </Html>
            )}
        </group>
    )
}
