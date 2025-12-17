import { useState } from 'react'
import { Users, Briefcase } from 'lucide-react'
import Employees from './Employees'
import Roles from './Roles'

export default function Team() {
    const [activeTab, setActiveTab] = useState('employees')

    const tabs = [
        { id: 'employees', label: 'Çalışanlar', icon: Users, component: Employees },
        { id: 'roles', label: 'Roller ', icon: Briefcase, component: Roles },
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
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                            activeTab === tab.id
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
