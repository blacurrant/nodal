import { useMemo } from 'react'
import * as THREE from 'three'

interface GlassDoorProps {
    position: [number, number, number]
    rotation?: [number, number, number]
}

export default function GlassDoor({ position, rotation = [0, 0, 0] }: GlassDoorProps) {
    const frameColor = "#111"
    const frameRoughness = 0.2
    const frameMetalness = 0.8

    const { frameGeo, glassGeo } = useMemo(() => {
        // Dimensions matching the Tunnel inner profile
        // Width: 20, Height: 10, Radius: 2
        const width = 20
        const height = 10
        const radius = 2
        const frameThickness = 0.4
        const depth = 0.5

        // Helper to create rounded rect shape
        const createRoundedRect = (w: number, h: number, r: number) => {
            const shape = new THREE.Shape()
            // Centered at 0, h/2 (since tunnel is 0 to 10 height)
            // Actually, let's center it at 0,0 locally and offset the group position in usage if needed.
            // Tunnel floor is at -0.6 (visual floor). Center of tunnel is ~5.
            // Let's draw it centered on X, and Y from 0 to h ?
            // Our previous simple box was at Y=5. and Height 10. So it went from 0 to 10.
            // Let's keep local Y centered at 0 to make rotation easy?
            // No, consistency: (0,0) is center.
            const x = -w / 2
            const y = -h / 2

            shape.moveTo(x + r, y)
            shape.lineTo(x + w - r, y)
            shape.quadraticCurveTo(x + w, y, x + w, y + r)
            shape.lineTo(x + w, y + h - r)
            shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
            shape.lineTo(x + r, y + h)
            shape.quadraticCurveTo(x, y + h, x, y + h - r)
            shape.lineTo(x, y + r)
            shape.quadraticCurveTo(x, y, x + r, y)

            return shape
        }

        // 1. Frame Geometry
        const outerShape = createRoundedRect(width + frameThickness, height + frameThickness, radius)
        const innerHole = createRoundedRect(width - frameThickness, height - frameThickness, radius)
        outerShape.holes.push(innerHole)

        const frameGeometry = new THREE.ExtrudeGeometry(outerShape, {
            depth: depth,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelSegments: 4,
            curveSegments: 32
        })
        frameGeometry.center() // Center geometry to pivot around (0,0,0)

        // 2. Glass Geometry
        const glassShape = createRoundedRect(width - frameThickness, height - frameThickness, radius)
        const glassGeometry = new THREE.ExtrudeGeometry(glassShape, {
            depth: depth / 4, // Thinner glass
            bevelEnabled: false,
            curveSegments: 32
        })
        glassGeometry.center()

        return { frameGeo: frameGeometry, glassGeo: glassGeometry }
    }, [])

    return (
        <group position={position} rotation={rotation as [number, number, number]}>
            {/* The Frame */}
            <mesh geometry={frameGeo}>
                <meshStandardMaterial color={frameColor} roughness={frameRoughness} metalness={frameMetalness} />
            </mesh>

            {/* The Glass Pane */}
            <mesh geometry={glassGeo}>
                <meshPhysicalMaterial
                    color="white"
                    transmission={0.98}
                    opacity={1}
                    metalness={0.1}
                    roughness={0}
                    ior={1.5}
                    thickness={0.5}
                    envMapIntensity={1}
                    transparent
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    )
}
