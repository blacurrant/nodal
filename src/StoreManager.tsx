import { Suspense } from 'react'
import useStore from './store'
import StoreBlock from './StoreBlock'

interface PlacedObject {
    id: string
    position: [number, number, number]
}

export default function StoreManager() {
    const placedObjects = useStore((state) => state.placedObjects)

    return (
        <group>
            {placedObjects.map((obj: PlacedObject) => (
                <Suspense key={obj.id} fallback={null}>
                    <StoreBlock position={obj.position} />
                </Suspense>
            ))}
        </group>
    )
}
