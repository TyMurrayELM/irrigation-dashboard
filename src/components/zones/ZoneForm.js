import React, { useState } from 'react';
import { Save, X, Settings, Clock, Plus, Trash2 } from 'lucide-react';
import { frequencyOptions, weekDays } from '../../data/constants';

function ZoneForm({ zone, onSave, onCancel, controllers = [] }) {
  // Initialize start_times array - convert old single start_time to array if needed
  const initializeStartTimes = () => {
    if (zone?.start_times && Array.isArray(zone.start_times)) {
      return zone.start_times;
    } else if (zone?.start_time) {
      // Migrate old single start_time to array format
      return [zone.start_time];
    }
    return [];
  };

  const [formData, setFormData] = useState({
    name: zone?.name || '',
    type: zone?.type || 'turf',
    duration: zone?.duration || 15,
    frequency: zone?.frequency || 'daily',
    days: zone?.days || [],
    controller_id: zone?.controller_id || null,
    start_times: initializeStartTimes()
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

  const addStartTime = () => {
    setFormData(prev => ({
      ...prev,
      start_times: [...prev.start_times, '']
    }));
  };

  const updateStartTime = (index, value) => {
    setFormData(prev => ({
      ...prev,
      start_times: prev.start_times.map((time, i) => i === index ? value : time)
    }));
  };

  const removeStartTime = (index) => {
    setFormData(prev => ({
      ...prev,
      start_times: prev.start_times.filter((_, i) => i !== index)
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

      {/* Start Times Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-600 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Start Times
          </label>
          <button
            type="button"
            onClick={addStartTime}
            className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100 rounded transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Time
          </button>
        </div>
        
        {formData.start_times.length === 0 ? (
          <div className="text-xs text-gray-500 italic py-2">
            No start times set. Click "Add Time" to add one.
          </div>
        ) : (
          <div className="space-y-2">
            {formData.start_times.map((time, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => updateStartTime(index, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[40px]"
                  placeholder="HH:MM"
                />
                <button
                  type="button"
                  onClick={() => removeStartTime(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove this start time"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controller Selection */}
      {controllers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs text-gray-600 block mb-1">
              <Settings className="w-3 h-3 inline mr-1" />
              Assign to Controller
            </label>
            <select
              value={formData.controller_id || ''}
              onChange={(e) => setFormData({ ...formData, controller_id: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[40px]"
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