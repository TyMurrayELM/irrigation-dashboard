import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { timerTypes } from '../../data/constants';

function PropertyEditForm({ property, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    timer_type: property.timer_type || ''
  });

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
      <div>
        <label className="text-xs text-gray-600 block mb-1">Timer Type</label>
        <select
          value={formData.timer_type}
          onChange={(e) => setFormData({ ...formData, timer_type: e.target.value })}
          className="w-full sm:max-w-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[40px]"
        >
          <option value="">Select Timer Type</option>
          {timerTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
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