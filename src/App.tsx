import { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PrescriptionForm } from './components/PrescriptionForm';
import { ContactLensPrescriptionForm } from './components/ContactLensPrescriptionForm';
import { useProviderConfig } from './hooks/useProviderConfig';
import { useClinicalSession } from './hooks/useClinicalSession';

type Tab = 'oculos' | 'lentes-contacto';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('oculos');
  const { config, updateField } = useProviderConfig();
  const { session, setField, setRefraction, handleAddBlur, setClRefraction, handleClAddBlur, handleLensTypeBlur, clearSession } = useClinicalSession();

  const tabBtn = (tab: Tab, label: string) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
        activeTab === tab
          ? 'bg-emerald-600 text-white shadow-sm'
          : 'text-emerald-700 hover:bg-emerald-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="max-w-4xl w-full mx-auto px-4 py-8 flex flex-col gap-6">
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* Card header with tab switcher */}
          <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-3 flex items-center justify-between">
            <nav className="flex gap-1 bg-white rounded-lg p-1 border border-emerald-200">
              {tabBtn('oculos', 'Óculos')}
              {tabBtn('lentes-contacto', 'Lentes Contacto')}
            </nav>
            <button
              onClick={clearSession}
              className="text-xs text-slate-500 hover:text-slate-700 bg-white border border-slate-300 hover:border-slate-400 rounded-md px-2.5 py-1 transition-colors"
            >
              Limpar
            </button>
          </div>

          {/* Card content */}
          {activeTab === 'oculos' ? (
            <PrescriptionForm
              session={session}
              provider={config}
              onProviderUpdate={updateField}
              setField={setField}
              setRefraction={setRefraction}
              handleAddBlur={handleAddBlur}
            />
          ) : (
            <ContactLensPrescriptionForm
              session={session}
              provider={config}
              onProviderUpdate={updateField}
              setField={setField}
              setRefraction={setClRefraction}
              handleAddBlur={handleClAddBlur}
              handleLensTypeBlur={handleLensTypeBlur}
            />
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
