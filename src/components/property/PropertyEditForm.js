import React, { useState } from 'react';
import { Save, X } from 'lucide-react';

function PropertyEditForm({ property, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    gate_code: property.gate_code || '',
    address: property.address || '',
    company: property.company || ''
  });

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
      <div>
        <label className="text-xs text-gray-600 block mb-1">Address</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full sm:max-w-md px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[40px]"
          placeholder="Property address"
        />
      </div>
      
      <div>
        <label className="text-xs text-gray-600 block mb-1">Company</label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className="w-full sm:max-w-md px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[40px]"
          placeholder="Company name"
        />
      </div>
      
      <div>
        <label className="text-xs text-gray-600 block mb-1">Gate Code</label>
        <input
          type="text"
          value={formData.gate_code}
          onChange={(e) => setFormData({ ...formData, gate_code: e.target.value })}
          className="w-full sm:max-w-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[40px]"
          placeholder="Gate access code"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleSubmit}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px]"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors min-h-[44px]"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}

export default PropertyEditForm;