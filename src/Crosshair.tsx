import './Crosshair.css'
import useStore from './store'

export default function Crosshair() {
    const activeProductId = useStore((state) => state.activeProductId)

    // Hide crosshair when viewing a product
    if (activeProductId) return null

    return (
        <div className="crosshair">
            <div className="crosshair-ring" />
            <div className="crosshair-dot" />
        </div>
    )
}
