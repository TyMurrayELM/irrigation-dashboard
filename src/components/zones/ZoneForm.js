import React, { useState } from 'react';
import { Save, X, Settings } from 'lucide-react';
import { frequencyOptions, weekDays } from '../../data/constants';

function ZoneForm({ zone, onSave, onCancel, controllers = [] }) {
  const [formData, setFormData] = useState({
    name: zone?.name || '',
    type: zone?.type || 'turf',
    duration: zone?.duration || 15,
    frequency: zone?.frequency || 'daily',
    days: zone?.days || [],
    controller_id: zone?.controller_id || null
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="text-xs text-gray-600 block mb-1">Zone Name</label>
          <input
            type="text"
            placeholder="Zone Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[40px]"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 block mb-1">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[40px]"
          >
            <option value="turf">Turf</option>
            <option value="shrubs">Shrubs</option>
            <option value="trees">Trees</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-600 block mb-1">Duration (min)</label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[40px]"
            min="1"
            placeholder="Minutes"
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="text-xs text-gray-600 block mb-1">Frequency</label>
          <select
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[40px]"
          >
            {frequencyOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Controller Selection */}
      {controllers.length > 0 && (
        <div>
          <label className="text-xs text-gray-600 block mb-1">
            <Settings className="w-3 h-3 inline mr-1" />
            Assign to Controller
          </label>
          <select
            value={formData.controller_id || ''}
            onChange={(e) => setFormData({ ...formData, controller_id: e.target.value ? parseInt(e.target.value) : null })}
            className="w-full sm:max-w-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[40px]"
          >
            <option value="">No Controller Assigned</option>
            {controllers.map(controller => (
              <option key={controller.id} value={controller.id}>
                {controller.controller_type}
                {controller.controller_location && ` - ${controller.controller_location}`}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {formData.frequency === 'custom-days' && (
        <div>
          <label className="text-xs text-gray-600 block mb-2">Select Days</label>
          <div className="flex flex-wrap gap-2">
            {weekDays.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-2 sm:px-3 py-1.5 rounded-lg border-2 transition-colors text-sm min-w-[40px] ${
                  formData.days.includes(day)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {zone && (
        <div className="w-full">
          <label className="text-xs text-gray-600 block mb-1">Change Note (optional)</label>
          <input
            type="text"
            placeholder="Reason for change..."
            value={changeNote}
            onChange={(e) => setChangeNote(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[40px]"
          />
        </div>
      )}

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

export default ZoneForm;