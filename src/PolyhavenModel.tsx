import { useGLTF } from '@react-three/drei'
import { GroupProps } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'

// Polyhaven model URLs - using GLB format with embedded textures
const POLYHAVEN_MODELS = {
    tree: 'https://dl.polyhaven.org/file/ph-assets/Models/glb/island_tree_02.glb',
    chair: 'https://dl.polyhaven.org/file/ph-assets/Models/glb/mid_century_lounge_chair.glb',
    sofa: 'https://dl.polyhaven.org/file/ph-assets/Models/glb/Sofa_01.glb',
    lamp1: 'https://dl.polyhaven.org/file/ph-assets/Models/glb/street_lamp_01.glb',
    lamp2: 'https://dl.polyhaven.org/file/ph-assets/Models/glb/street_lamp_02.glb',
    mirror: 'https://dl.polyhaven.org/file/ph-assets/Models/glb/ornate_mirror_01.glb',
    shelves: 'https://dl.polyhaven.org/file/ph-assets/Models/glb/steel_frame_shelves_03.glb',
}

interface PolyhavenModelProps extends GroupProps {
    modelKey: keyof typeof POLYHAVEN_MODELS
    scale?: number | [number, number, number]
}

export function PolyhavenModel({ modelKey, scale = 1, ...props }: PolyhavenModelProps) {
    const { scene } = useGLTF(POLYHAVEN_MODELS[modelKey])

    // Deep clone the scene with materials
    const clonedScene = useMemo(() => {
        const clone = scene.clone(true)
        clone.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                // Clone materials to avoid shared state
                if (child.material) {
                    child.material = child.material.clone()
                }
                child.castShadow = true
                child.receiveShadow = true
            }
        })
        return clone
    }, [scene])

    return (
        <group {...props}>
            <primitive
                object={clonedScene}
                scale={scale}
            />
        </group>
    )
}

// Preload models for faster loading
Object.values(POLYHAVEN_MODELS).forEach(url => {
    useGLTF.preload(url)
})

export { POLYHAVEN_MODELS }
