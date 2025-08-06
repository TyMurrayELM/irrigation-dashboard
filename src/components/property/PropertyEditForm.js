import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { timerTypes } from '../../data/constants';

function PropertyEditForm({ property, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    timer_type: property.timer_type || '',
    gate_code: property.gate_code || '',
    days_since_irrigation_invoice: property.days_since_irrigation_invoice || '',
    days_since_irrigation_visit: property.days_since_irrigation_visit || ''
  });

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-600">Timer Type</label>
          <select
            value={formData.timer_type}
            onChange={(e) => setFormData({ ...formData, timer_type: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Timer Type</option>
            {timerTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-600">Gate Code</label>
          <input
            type="text"
            value={formData.gate_code}
            onChange={(e) => setFormData({ ...formData, gate_code: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter gate code"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600">Days Since Irrigation Invoice</label>
          <input
            type="number"
            value={formData.days_since_irrigation_invoice}
            onChange={(e) => setFormData({ ...formData, days_since_irrigation_invoice: parseInt(e.target.value) || '' })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Days"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600">Days Since Irrigation Visit</label>
          <input
            type="number"
            value={formData.days_since_irrigation_visit}
            onChange={(e) => setFormData({ ...formData, days_since_irrigation_visit: parseInt(e.target.value) || '' })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Days"
          />
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}

export default PropertyEditForm;