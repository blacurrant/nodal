import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { Vector3, Vector2, Raycaster, Quaternion, Matrix4 } from 'three'
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

        // Click to select products when pointer is locked
        const onClick = () => {
            if (!controlsRef.current?.isLocked) return

            // Raycast from center of screen
            raycaster.current.setFromCamera(new Vector2(0, 0), camera)
            const intersects = raycaster.current.intersectObjects(scene.children, true)

            for (const hit of intersects) {
                // Walk up the parent chain to find a group with a name matching a product
                let current = hit.object
                while (current) {
                    const userData = current.userData
                    if (userData && userData.productId) {
                        console.log('Clicked product:', userData.productId)
                        setActiveProduct(userData.productId)
                        return
                    }
                    current = current.parent as any
                }
            }
        }

        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)
        window.addEventListener('click', onClick)
        return () => {
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
            window.removeEventListener('click', onClick)
        }
    }, [camera, scene, setActiveProduct])

    useFrame((_, delta) => {
        // If product is active, disable controls and lerp to view
        if (activeProductId) {
            // Unlock pointer so user can interact with the panel
            if (controlsRef.current?.isLocked) {
                controlsRef.current.unlock()
            }

            const product = PRODUCTS.find(p => p.id === activeProductId)
            if (product) {
                // Target position: 2 meters in front of the product, at eye level
                const productPos = new Vector3(...product.position)
                const targetPos = new Vector3(
                    productPos.x,
                    1.6, // Eye level
                    productPos.z + 2.5 // In front of the product
                )

                // Smoothly move camera to target position
                camera.position.lerp(targetPos, 0.08)

                // Calculate target rotation to look at product
                const lookTarget = new Vector3(productPos.x, productPos.y + 0.5, productPos.z)

                // Create a temporary matrix to get target quaternion
                const tempMatrix = new Matrix4()
                tempMatrix.lookAt(camera.position, lookTarget, new Vector3(0, 1, 0))
                const targetQuat = new Quaternion().setFromRotationMatrix(tempMatrix)

                // Smoothly interpolate camera rotation
                camera.quaternion.slerp(targetQuat, 0.1)
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
