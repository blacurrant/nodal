import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { Vector3, Vector2, Raycaster } from 'three'
import useStore from './store'
import { PRODUCTS } from './store'

export default function Player() {
    const { camera, scene } = useThree()
    const controlsRef = useRef<any>(null)
    const raycaster = useRef(new Raycaster())
    const velocity = useRef(new Vector3(0, 0, 0))
    const activeProductId = useStore((state) => state.activeProductId)

    const keys = useRef({
        forward: false,
        backward: false,
        left: false,
        right: false,
    })

    const setActiveProduct = useStore((state) => state.setActiveProduct)

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Escape') {
                setActiveProduct(null)
                // Re-lock controls if we want, or let user click to re-lock.
                // Usually nicer to just free cursor.
            }
            switch (e.code) {
                case 'KeyW': keys.current.forward = true; break
                case 'KeyS': keys.current.backward = true; break
                case 'KeyA': keys.current.left = true; break
                case 'KeyD': keys.current.right = true; break
            }
        }
        const onKeyUp = (e: KeyboardEvent) => {
            switch (e.code) {
                case 'KeyW': keys.current.forward = false; break
                case 'KeyS': keys.current.backward = false; break
                case 'KeyA': keys.current.left = false; break
                case 'KeyD': keys.current.right = false; break
            }
        }

        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)
        return () => {
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
        }
    }, [])

    useFrame((_, delta) => {
        // If product is active, disable controls and lerp to view
        if (activeProductId) {
            // Unlock pointer so they can gaze or click back? 
            // Requirement says: "disable Player controls and smoothly interpolate... 2 meters in front"

            if (controlsRef.current?.isLocked) {
                controlsRef.current.unlock()
            }

            const product = PRODUCTS.find(p => p.id === activeProductId)
            if (product) {
                const targetPos = new Vector3(...product.position).add(new Vector3(0, 0, 2)) // 2 meters in front

                // Smoothly move camera
                camera.position.lerp(targetPos, 0.05)

                // Look at the product (smooth lookAt is harder, but simplified:)
                const productPos = new Vector3(...product.position)
                // Simple slerp-like lookAt? 
                // For now, let's just make it look at it. To do it smoothly we'd need quat slerp.
                camera.lookAt(productPos.x, productPos.y + 1.5, productPos.z) // Look at middle of monolith
            }
            return
        }

        // --- Standard Player Movement ---

        // Raycast forward from camera (center of screen)
        raycaster.current.setFromCamera(new Vector2(0, 0), camera)
        const intersects = raycaster.current.intersectObjects(scene.children, true)

        let blocked = false
        if (intersects.length > 0 && intersects[0].distance < 1.5) {
            blocked = true
        }

        const forward = new Vector3()
        const right = new Vector3()

        camera.getWorldDirection(forward)
        forward.y = 0
        forward.normalize()

        right.crossVectors(forward, new Vector3(0, 1, 0)).normalize()

        const moveVector = new Vector3()

        if (!blocked) {
            if (keys.current.forward) moveVector.add(forward)
            if (keys.current.backward) moveVector.sub(forward)
            if (keys.current.right) moveVector.add(right)
            if (keys.current.left) moveVector.sub(right)
        }

        if (moveVector.length() > 0) {
            moveVector.normalize().multiplyScalar(5.0 * delta)
        }

        velocity.current.lerp(moveVector, 0.05)

        camera.position.add(velocity.current)
        camera.position.y = 1.7
    })

    return (
        <PointerLockControls ref={controlsRef} /> // Note: Ideally we disable this component when activeProductId is set if we want full cursor freedom, but `unlock()` mostly handles it.
    )
}
