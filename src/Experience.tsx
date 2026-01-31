import { MeshReflectorMaterial, useTexture, Environment, RoundedBox } from '@react-three/drei'
import { ThreeEvent } from '@react-three/fiber'
// @ts-ignore
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib'
import * as THREE from 'three'
import StoreManager from './StoreManager'
import Player from './Player'
import HeroObject from './HeroObject'
import useStore from './store'
import { useMemo, useEffect } from 'react'
import ShoeBox from './ShoeBox' // Kept single import
import { PRODUCTS } from './store'
import GlassDoor from './GlassDoor'

// Initialize RectAreaLight
RectAreaLightUniformsLib.init()

function Ground() {
    useEffect(() => { console.log('Ground mounted') }, [])
    const addPlacedObject = useStore((state) => state.addPlacedObject)

    // Polished industrial concrete floor - worn with scratches
    const floorProps = useTexture({
        map: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_floor_worn_001/concrete_floor_worn_001_diff_1k.jpg',
        normalMap: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_floor_worn_001/concrete_floor_worn_001_nor_gl_1k.jpg',
        roughnessMap: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_floor_worn_001/concrete_floor_worn_001_rough_1k.jpg',
        aoMap: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_floor_worn_001/concrete_floor_worn_001_arm_1k.jpg',
    })

    useMemo(() => {
        [floorProps.map, floorProps.normalMap, floorProps.roughnessMap, floorProps.aoMap].forEach((tex) => {
            if (tex) {
                tex.wrapS = tex.wrapT = THREE.RepeatWrapping
                tex.repeat.set(6, 12) // Repeat for floor coverage
            }
        })
    }, [floorProps])

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        console.log('Placed monolith at:', e.point)
        addPlacedObject([e.point.x, e.point.y, e.point.z])
    }

    return (
        <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.01, 0]}
            onClick={handleClick}
            receiveShadow
        >
            <planeGeometry args={[22, 42]} />
            <MeshReflectorMaterial
                {...floorProps}
                blur={[400, 100]}
                resolution={512}
                mixBlur={0.9}
                mixStrength={6}
                roughness={1}
                depthScale={0.6}
                minDepthThreshold={0.4}
                maxDepthThreshold={1.2}
                color="#111111"
                metalness={0.1}
                mirror={0.25}
            />
        </mesh>
    )
}

function Tunnel() {
    useEffect(() => { console.log('Tunnel mounted') }, [])

    // Board-formed concrete - horizontal grooves from wooden planks
    const props = useTexture({
        map: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_layers_02/concrete_layers_02_diff_1k.jpg',
        normalMap: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_layers_02/concrete_layers_02_nor_gl_1k.jpg',
        roughnessMap: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_layers_02/concrete_layers_02_rough_1k.jpg',
        aoMap: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_layers_02/concrete_layers_02_arm_1k.jpg',
    })

    // Rotate 90 degrees so lines run vertically (floor to ceiling) for height
    useMemo(() => {
        [props.map, props.normalMap, props.roughnessMap, props.aoMap].forEach((tex) => {
            if (tex) {
                tex.wrapS = tex.wrapT = THREE.RepeatWrapping
                tex.repeat.set(2, 2)
                tex.rotation = Math.PI / 2 // 90 degree rotation for vertical lines
                tex.center.set(0.5, 0.5) // Rotate around center
            }
        })
    }, [props])

    const tunnelGeometry = useMemo(() => {
        const shape = new THREE.Shape()
        // Outer Rectangle (Counter-clockwise) - starts at Y=0 (no floor, only walls and ceiling)
        shape.moveTo(-11, 0)
        shape.lineTo(11, 0)
        shape.lineTo(11, 11)
        shape.lineTo(-11, 11)
        shape.lineTo(-11, 0)

        // Inner Hole (Clockwise) - R=2 Rounded Rect (20x10)
        const hole = new THREE.Path()
        const w = 20, h = 10, r = 2
        hole.moveTo(-w / 2 + r, 0)
        hole.lineTo(w / 2 - r, 0)
        hole.quadraticCurveTo(w / 2, 0, w / 2, r)
        hole.lineTo(w / 2, h - r)
        hole.quadraticCurveTo(w / 2, h, w / 2 - r, h)
        hole.lineTo(-w / 2 + r, h)
        hole.quadraticCurveTo(-w / 2, h, -w / 2, h - r)
        hole.lineTo(-w / 2, r)
        hole.quadraticCurveTo(-w / 2, 0, -w / 2 + r, 0)

        shape.holes.push(hole)

        const extrudeSettings = {
            steps: 2,
            depth: 40,
            bevelEnabled: false,
            curveSegments: 32
        }

        return new THREE.ExtrudeGeometry(shape, extrudeSettings)
    }, [])

    return (
        <group>
            {/* Tunnel Body */}
            <mesh geometry={tunnelGeometry} position={[0, 0, -20]} receiveShadow castShadow>
                <meshStandardMaterial
                    {...props}
                    side={THREE.DoubleSide}
                    envMapIntensity={0.3}
                    displacementScale={0}
                    roughness={0.7}
                    color="#888"
                />
            </mesh>

            {/* End Cap Doors */}
            <GlassDoor position={[0, 5, -20]} />
            <GlassDoor position={[0, 5, 20]} />
        </group>
    )
}



// Simple horizontal wall shelves - 2 heights, 2 segments each for accessibility
function WallShelves({ side = 'left' }: { side: 'left' | 'right' }) {
    const xPos = side === 'left' ? -9.8 : 9.8
    const xOffset = side === 'left' ? 0.3 : -0.3

    const shelfLength = 12 // Shorter segments for accessibility
    const shelfDepth = 0.6
    const shelfThickness = 0.12
    const gap = 6 // Gap between shelf segments for walkway

    // Two shelf heights
    const shelfHeights = [1.4, 3.0]

    // Two segments per height - positioned before and after center gap
    const segmentOffsets = [-(shelfLength / 2 + gap / 2), (shelfLength / 2 + gap / 2)]

    // Same texture as walls - concrete_layers_02
    const concreteProps = useTexture({
        map: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_layers_02/concrete_layers_02_diff_1k.jpg',
        normalMap: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_layers_02/concrete_layers_02_nor_gl_1k.jpg',
        roughnessMap: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_layers_02/concrete_layers_02_rough_1k.jpg',
    })

    // Product positions along each shelf segment
    const productPositions = [-4, 0, 4]

    return (
        <group>
            {/* Two heights, two segments each with gap in center */}
            {shelfHeights.map((height, heightIdx) => (
                segmentOffsets.map((zOffset, segIdx) => (
                    <RoundedBox
                        key={`shelf-${heightIdx}-${segIdx}`}
                        args={[shelfDepth, shelfThickness, shelfLength]}
                        radius={0.03}
                        smoothness={4}
                        position={[xPos + xOffset, height, zOffset]}
                        castShadow
                        receiveShadow
                    >
                        <meshStandardMaterial
                            {...concreteProps}
                            color="#666666"
                            roughness={0.8}
                        />
                    </RoundedBox>
                ))
            ))}

            {/* Products on shelves - 3 per segment */}
            {shelfHeights.map((height, heightIdx) => (
                segmentOffsets.map((zOffset, segIdx) => (
                    productPositions.map((pOffset, prodIdx) => (
                        <ShoeBox
                            key={`shoe-${heightIdx}-${segIdx}-${prodIdx}`}
                            id={`shelf-shoe-${side}-${heightIdx}-${segIdx}-${prodIdx}`}
                            name="Archive Sample"
                            price="$---"
                            position={[xPos + xOffset, height + shelfThickness / 2 + 0.1, zOffset + pOffset]}
                            rotation={[0, side === 'left' ? Math.PI / 2 : -Math.PI / 2, 0]}
                        />
                    ))
                ))
            ))}
        </group>
    )
}

function DisplayTables() {
    useEffect(() => { console.log('Tables mounted') }, [])

    const tables = useMemo(() => {
        return [
            // Three Low, Wide Tables in Center
            { position: [0, 0.4, -8], scale: [3, 0.8, 4] },
            { position: [0, 0.4, 0], scale: [3, 0.8, 4] },
            { position: [0, 0.4, 8], scale: [3, 0.8, 4] },
        ]
    }, [])

    // Raw aggregate concrete - pitted and rough for monoliths
    const props = useTexture({
        map: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_wall_006/concrete_wall_006_diff_1k.jpg',
        normalMap: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_wall_006/concrete_wall_006_nor_gl_1k.jpg',
        roughnessMap: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_wall_006/concrete_wall_006_rough_1k.jpg',
        aoMap: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_wall_006/concrete_wall_006_arm_1k.jpg',
    })

    return (
        <group>
            {tables.map((data, i) => (
                <RoundedBox
                    key={i}
                    args={data.scale as [number, number, number]}
                    radius={0.02}
                    smoothness={4}
                    position={data.position as [number, number, number]}
                    castShadow
                    receiveShadow
                >
                    <meshStandardMaterial
                        {...props}
                        color="#222222"
                        roughness={0.95}
                        metalness={0}
                        envMapIntensity={0.2}
                    />
                </RoundedBox>
            ))}
        </group>
    )
}

function Lights() {
    // Light fixture positions
    const ceilingLights = [
        { z: -12 },
        { z: -4 },
        { z: 4 },
        { z: 12 },
    ]

    const trackLightPositions = [
        { x: -6, z: -10 },
        { x: -6, z: 0 },
        { x: -6, z: 10 },
        { x: 6, z: -10 },
        { x: 6, z: 0 },
        { x: 6, z: 10 },
    ]

    return (
        <group>
            {/* Ceiling Panel Light Fixtures */}
            {ceilingLights.map((light, i) => (
                <group key={`ceiling-${i}`} position={[0, 9.5, light.z]}>
                    {/* Fixture housing */}
                    <mesh position={[0, 0.1, 0]}>
                        <boxGeometry args={[2.5, 0.15, 2.5]} />
                        <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.3} />
                    </mesh>
                    {/* Glowing diffuser panel */}
                    <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[2.2, 2.2]} />
                        <meshStandardMaterial
                            color="#fff8f0"
                            emissive="#fff5e6"
                            emissiveIntensity={0.8}
                            roughness={0.3}
                        />
                    </mesh>
                    {/* Actual light source */}
                    <rectAreaLight
                        width={2}
                        height={2}
                        intensity={12}
                        color="#fff5e6"
                        position={[0, -0.05, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                    />
                </group>
            ))}

            {/* Track Lights along ceiling edges */}
            {trackLightPositions.map((pos, i) => (
                <group key={`track-${i}`} position={[pos.x, 9, pos.z]}>
                    {/* Track bar segment */}
                    <mesh>
                        <boxGeometry args={[0.08, 0.08, 3]} />
                        <meshStandardMaterial color="#222" roughness={0.6} metalness={0.5} />
                    </mesh>
                    {/* Light head */}
                    <mesh position={[0, -0.15, 0]} rotation={[Math.PI / 8, 0, 0]}>
                        <cylinderGeometry args={[0.12, 0.15, 0.25, 16]} />
                        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.6} />
                    </mesh>
                    {/* Glowing element inside head */}
                    <mesh position={[0, -0.28, 0.05]}>
                        <sphereGeometry args={[0.06, 16, 16]} />
                        <meshStandardMaterial
                            color="#fff"
                            emissive="#ffecd2"
                            emissiveIntensity={2}
                        />
                    </mesh>
                    {/* Point light from track light */}
                    <pointLight
                        position={[0, -0.3, 0]}
                        intensity={8}
                        color="#ffecd2"
                        distance={15}
                        decay={2}
                    />
                </group>
            ))}

            {/* Subtle downlight spots over tables */}
            <spotLight
                position={[0, 8, -8]}
                angle={0.4}
                penumbra={0.9}
                intensity={15}
                color="#fff8f0"
                castShadow
            />
            <spotLight
                position={[0, 8, 0]}
                angle={0.4}
                penumbra={0.9}
                intensity={15}
                color="#fff8f0"
                castShadow
            />
            <spotLight
                position={[0, 8, 8]}
                angle={0.4}
                penumbra={0.9}
                intensity={15}
                color="#fff8f0"
                castShadow
            />

            {/* Side Wall Windows with Sunlight */}
            {/* Left Wall Window - Framed Glass Panel */}
            <group position={[-9.95, 6.5, 0]} rotation={[0, Math.PI / 2, 0]}>
                {/* Window Frame - Top */}
                <mesh position={[0, 1.1, 0]}>
                    <boxGeometry args={[28, 0.2, 0.15]} />
                    <meshStandardMaterial color="#111" roughness={0.2} metalness={0.8} />
                </mesh>
                {/* Window Frame - Bottom */}
                <mesh position={[0, -1.1, 0]}>
                    <boxGeometry args={[28, 0.2, 0.15]} />
                    <meshStandardMaterial color="#111" roughness={0.2} metalness={0.8} />
                </mesh>
                {/* Window Frame - Left */}
                <mesh position={[-14, 0, 0]}>
                    <boxGeometry args={[0.2, 2.4, 0.15]} />
                    <meshStandardMaterial color="#111" roughness={0.2} metalness={0.8} />
                </mesh>
                {/* Window Frame - Right */}
                <mesh position={[14, 0, 0]}>
                    <boxGeometry args={[0.2, 2.4, 0.15]} />
                    <meshStandardMaterial color="#111" roughness={0.2} metalness={0.8} />
                </mesh>
                {/* Glass Panel */}
                <mesh>
                    <planeGeometry args={[27.8, 2]} />
                    <meshPhysicalMaterial
                        color="#cce8ff"
                        transmission={0.9}
                        opacity={1}
                        metalness={0.05}
                        roughness={0.05}
                        ior={1.5}
                        thickness={0.2}
                        transparent
                        side={THREE.DoubleSide}
                    />
                </mesh>
                {/* Window light source */}
                <rectAreaLight
                    width={28}
                    height={2}
                    intensity={30}
                    color="#fff5e0"
                    position={[-0.2, 0, 0]}
                    rotation={[0, Math.PI, 0]}
                />
            </group>
            {/* Left window fill lights */}
            <pointLight position={[-8.5, 6.5, -10]} intensity={20} color="#ffecd2" distance={18} />
            <pointLight position={[-8.5, 6.5, 0]} intensity={25} color="#ffecd2" distance={18} />
            <pointLight position={[-8.5, 6.5, 10]} intensity={20} color="#ffecd2" distance={18} />

            {/* Right Wall Window - Framed Glass Panel */}
            <group position={[9.95, 6.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
                {/* Window Frame - Top */}
                <mesh position={[0, 1.1, 0]}>
                    <boxGeometry args={[28, 0.2, 0.15]} />
                    <meshStandardMaterial color="#111" roughness={0.2} metalness={0.8} />
                </mesh>
                {/* Window Frame - Bottom */}
                <mesh position={[0, -1.1, 0]}>
                    <boxGeometry args={[28, 0.2, 0.15]} />
                    <meshStandardMaterial color="#111" roughness={0.2} metalness={0.8} />
                </mesh>
                {/* Window Frame - Left */}
                <mesh position={[-14, 0, 0]}>
                    <boxGeometry args={[0.2, 2.4, 0.15]} />
                    <meshStandardMaterial color="#111" roughness={0.2} metalness={0.8} />
                </mesh>
                {/* Window Frame - Right */}
                <mesh position={[14, 0, 0]}>
                    <boxGeometry args={[0.2, 2.4, 0.15]} />
                    <meshStandardMaterial color="#111" roughness={0.2} metalness={0.8} />
                </mesh>
                {/* Glass Panel */}
                <mesh>
                    <planeGeometry args={[27.8, 2]} />
                    <meshPhysicalMaterial
                        color="#cce8ff"
                        transmission={0.9}
                        opacity={1}
                        metalness={0.05}
                        roughness={0.05}
                        ior={1.5}
                        thickness={0.2}
                        transparent
                        side={THREE.DoubleSide}
                    />
                </mesh>
                {/* Window light source */}
                <rectAreaLight
                    width={28}
                    height={2}
                    intensity={30}
                    color="#fff5e0"
                    position={[-0.2, 0, 0]}
                    rotation={[0, Math.PI, 0]}
                />
            </group>
            {/* Right window fill lights */}
            <pointLight position={[8.5, 6.5, -10]} intensity={20} color="#ffecd2" distance={18} />
            <pointLight position={[8.5, 6.5, 0]} intensity={25} color="#ffecd2" distance={18} />
            <pointLight position={[8.5, 6.5, 10]} intensity={20} color="#ffecd2" distance={18} />
        </group>
    )
}

function Products() {
    // Override positions to placed on Tables
    // Table 1: Z=-8, Top Y=0.8
    // Table 2: Z=0, Top Y=0.8
    // Table 3: Z=8, Top Y=0.8

    // We map the main products to these locations
    const tableProducts = [
        { ...PRODUCTS[0], position: [0, 0.8, -8] },
        { ...PRODUCTS[1], position: [0, 0.8, 0] },
        { ...PRODUCTS[2], position: [0, 0.8, 8] },
    ]

    return (
        <group>
            {tableProducts.map((product) => (
                <ShoeBox
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    position={product.position as [number, number, number]}
                    rotation={[0, Math.random(), 0]}
                />
            ))}
        </group>
    )
}

// ... Lights & Tunnel remain ...

export default function Experience() {
    console.log('Experience rendering')
    useEffect(() => { console.log('Experience mounted') }, [])

    return (
        <>
            <color attach="background" args={['#1a1815']} />
            <fog attach="fog" args={['#2a2520', 15, 50]} />

            <ambientLight intensity={0.8} color="#fff5e6" />
            <Environment
                files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/monochrome_studio_01_1k.hdr"
                environmentIntensity={0.4}
            />

            <Ground />
            <Tunnel />

            {/* New Layout Elements */}
            <DisplayTables />
            <WallShelves side="left" />
            <WallShelves side="right" />

            <Products />
            <Lights />

            <StoreManager />
            <Player />
            <HeroObject />
        </>
    )
}
