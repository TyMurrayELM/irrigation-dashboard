import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { frequencyOptions, weekDays } from '../../data/constants';

function ZoneForm({ zone, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: zone?.name || '',
    type: zone?.type || 'turf',
    duration: zone?.duration || 15,
    frequency: zone?.frequency || 'daily',
    days: zone?.days || []
  });
  const [changeNote, setChangeNote] = useState('');

  const handleSubmit = () => {
    if (formData.name && formData.duration > 0) {
      if (formData.frequency === 'custom-days' && formData.days.length === 0) {
        alert('Please select at least one day when using Custom Days');
        return;
      }
      const finalData = {
        ...formData,
        days: formData.frequency === 'custom-days' ? formData.days : null
      };
      onSave(finalData, changeNote);
    }
  };

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  return (
    <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-xs text-gray-600">Zone Name</label>
          <input
            type="text"
            placeholder="Zone Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="w-32">
          <label className="text-xs text-gray-600">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="turf">Turf</option>
            <option value="shrubs">Shrubs</option>
            <option value="trees">Trees</option>
          </select>
        </div>
        <div className="w-24">
          <label className="text-xs text-gray-600">Duration</label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            min="1"
            placeholder="min"
          />
        </div>
        <div className="w-40">
          <label className="text-xs text-gray-600">Frequency</label>
          <select
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {frequencyOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      {formData.frequency === 'custom-days' && (
        <div>
          <label className="text-xs text-gray-600 block mb-2">Select Days</label>
          <div className="flex gap-2">
            {weekDays.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-3 py-1.5 rounded-lg border-2 transition-colors ${
                  formData.days.includes(day)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {zone && (
        <div className="w-full">
          <label className="text-xs text-gray-600">Change Note (optional)</label>
          <input
            type="text"
            placeholder="Reason for change..."
            value={changeNote}
            onChange={(e) => setChangeNote(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      )}

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

export default ZoneForm;