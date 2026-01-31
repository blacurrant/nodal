import { Routes, Route } from 'react-router-dom'
import StoreSelect from './pages/StoreSelect'
import Builder from './pages/Builder'

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<StoreSelect />} />
            <Route path="/builder" element={<Builder />} />
        </Routes>
    )
}

