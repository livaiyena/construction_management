import { useState } from 'react'
import { Package, Truck, Building, Tag } from 'lucide-react'
import Equipment from './Equipment'
import Suppliers from './Suppliers'
import Warehouse from './Warehouse'
import MaterialCategories from './MaterialCategories'
import EquipmentTypes from './EquipmentTypes'

export default function Inventory() {
    const [activeTab, setActiveTab] = useState('warehouse')

    const tabs = [
        { id: 'warehouse', label: 'Depo & Stok', icon: Package, component: Warehouse },
        { id: 'categories', label: 'Kategoriler', icon: Tag, component: MaterialCategories },
        { id: 'equipment', label: 'Ekipman', icon: Truck, component: Equipment },
        { id: 'types', label: 'Ekipman Türleri', icon: Tag, component: EquipmentTypes },
        { id: 'suppliers', label: 'Tedarikçiler', icon: Building, component: Suppliers },
    ]

    const ActiveComponent = tabs.find(t => t.id === activeTab)?.component

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Tab Navigation */}
            <div className="bg-white border border-slate-200 rounded-xl p-2 flex gap-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === tab.id
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                            : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        <tab.icon size={20} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Active Tab Content */}
            <div>
                {ActiveComponent && <ActiveComponent />}
            </div>
        </div>
    )
}
