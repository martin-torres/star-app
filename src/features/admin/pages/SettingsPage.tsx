import { useState } from 'react';
import { Palette, Type, MapPin, CreditCard, Save, Smartphone, Utensils } from 'lucide-react';

interface SettingsPageProps {
  settings: {
    name: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    googleFontUrl?: string;
    googleFontName?: string;
    locationText: string;
    mode?: string;
    paymentSettings?: {
      conektaPublicKey?: string;
      mercadopagoPublicKey?: string;
      transferBankName?: string;
      transferAccountNumber?: string;
    };
  };
  onSave: (settings: any) => Promise<void>;
}

export const SettingsPage = ({ settings, onSave }: SettingsPageProps) => {
  const [formData, setFormData] = useState(settings);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg border cursor-pointer"
      />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-gray-500 font-mono">{value}</p>
      </div>
    </div>
  );

  const modes = [
    { value: 'to-go', label: 'Solo para llevar', description: 'Pedidos para recoger o delivery' },
    { value: 'dine-in', label: 'Solo comedor', description: 'Experiencia en mesa con QR' },
    { value: 'both', label: 'Ambos', description: 'Para llevar y servicio en mesa' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600">Personaliza la apariencia y configura el restaurante</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div className="grid gap-6">
        {/* Restaurant Mode */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-gray-600" />
            Modo del Restaurante
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Selecciona cómo operará tu restaurante en la aplicación
          </p>
          <div className="grid gap-3">
            {modes.map((mode) => (
              <label
                key={mode.value}
                className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.mode === mode.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  value={mode.value}
                  checked={formData.mode === mode.value}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900">{mode.label}</p>
                  <p className="text-sm text-gray-500">{mode.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-gray-600" />
            Colores de Marca
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ColorInput
              label="Primario"
              value={formData.primaryColor}
              onChange={(v) => setFormData({ ...formData, primaryColor: v })}
            />
            <ColorInput
              label="Secundario"
              value={formData.secondaryColor}
              onChange={(v) => setFormData({ ...formData, secondaryColor: v })}
            />
            <ColorInput
              label="Acento"
              value={formData.accentColor}
              onChange={(v) => setFormData({ ...formData, accentColor: v })}
            />
            <ColorInput
              label="Fondo"
              value={formData.backgroundColor}
              onChange={(v) => setFormData({ ...formData, backgroundColor: v })}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Type className="w-5 h-5 text-gray-600" />
            Tipografía
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Font Name</label>
              <input
                value={formData.googleFontName || ''}
                onChange={(e) => setFormData({ ...formData, googleFontName: e.target.value })}
                placeholder="Ej: Poppins, Roboto, Montserrat"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Font URL</label>
              <input
                value={formData.googleFontUrl || ''}
                onChange={(e) => setFormData({ ...formData, googleFontUrl: e.target.value })}
                placeholder="https://fonts.googleapis.com/css2?family=Poppins..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-600" />
            Ubicación
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Texto de ubicación</label>
            <input
              value={formData.locationText}
              onChange={(e) => setFormData({ ...formData, locationText: e.target.value })}
              placeholder="Monterrey, Nuevo León"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-600" />
            Configuración de Pagos
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conekta Public Key</label>
              <input
                value={formData.paymentSettings?.conektaPublicKey || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  paymentSettings: { ...formData.paymentSettings, conektaPublicKey: e.target.value }
                })}
                placeholder="pk_test_xxxx"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mercado Pago Public Key</label>
              <input
                value={formData.paymentSettings?.mercadopagoPublicKey || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  paymentSettings: { ...formData.paymentSettings, mercadopagoPublicKey: e.target.value }
                })}
                placeholder="TEST-xxxx"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banco (Transferencias)</label>
                <input
                  value={formData.paymentSettings?.transferBankName || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    paymentSettings: { ...formData.paymentSettings, transferBankName: e.target.value }
                  })}
                  placeholder="BBVA México"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. de Cuenta</label>
                <input
                  value={formData.paymentSettings?.transferAccountNumber || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    paymentSettings: { ...formData.paymentSettings, transferAccountNumber: e.target.value }
                  })}
                  placeholder="XXXX-XXXX-XXXX"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
