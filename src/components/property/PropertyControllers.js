import React, { useState } from 'react';
import { Settings, Plus, Edit2, Trash2, MapPin, Hash, StickyNote, X, Save, Droplets } from 'lucide-react';
import { timerTypes } from '../../data/constants';

function PropertyControllers({ property, controllers, onAddController, onUpdateController, onDeleteController, currentUser }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    controller_type: '',
    controller_location: '',
    serial_number: '',
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      controller_type: '',
      controller_location: '',
      serial_number: '',
      notes: ''
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (formData.controller_type) {
      await onAddController(property.id, formData);
      resetForm();
    }
  };

  const handleEdit = (controller) => {
    setEditingId(controller.id);
    setFormData({
      controller_type: controller.controller_type || '',
      controller_location: controller.controller_location || '',
      serial_number: controller.serial_number || '',
      notes: controller.notes || ''
    });
    setIsAdding(false);
  };

  const handleUpdate = async () => {
    if (formData.controller_type) {
      await onUpdateController(editingId, formData);
      resetForm();
    }
  };

  const handleDelete = async (controllerId) => {
    if (window.confirm('Are you sure you want to remove this controller? Any zones assigned to it will be unassigned.')) {
      await onDeleteController(controllerId);
    }
  };

  // Count zones assigned to each controller
  const getZoneCount = (controllerId) => {
    if (!property.zones) return 0;
    return property.zones.filter(zone => zone.controller_id === controllerId).length;
  };

  // Get zone names for a controller
  const getZoneNames = (controllerId) => {
    if (!property.zones) return [];
    return property.zones
      .filter(zone => zone.controller_id === controllerId)
      .map(zone => zone.name);
  };

  const ControllerForm = ({ isEdit = false }) => {
    // Use local state for form to prevent re-renders affecting parent
    const [localFormData, setLocalFormData] = useState(formData);

    const handleLocalSubmit = () => {
      setFormData(localFormData);
      if (isEdit) {
        handleUpdate();
      } else {
        handleAdd();
      }
    };

    return (
      <div className="bg-blue-50 rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-600 block mb-1">Controller Type *</label>
            <select
              value={localFormData.controller_type}
              onChange={(e) => setLocalFormData({ ...localFormData, controller_type: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[40px]"
            >
              <option value="">Select Controller Type</option>
              {timerTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Location</label>
            <input
              type="text"
              placeholder="e.g., Front yard, Back yard"
              value={localFormData.controller_location}
              onChange={(e) => setLocalFormData({ ...localFormData, controller_location: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[40px]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Serial Number</label>
            <input
              type="text"
              placeholder="Serial/Model number"
              value={localFormData.serial_number}
              onChange={(e) => setLocalFormData({ ...localFormData, serial_number: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[40px]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Notes</label>
            <input
              type="text"
              placeholder="Additional notes"
              value={localFormData.notes}
              onChange={(e) => setLocalFormData({ ...localFormData, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[40px]"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleLocalSubmit}
            disabled={!localFormData.controller_type}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-h-[40px]"
          >
            <Save className="w-4 h-4" />
            {isEdit ? 'Update' : 'Add'} Controller
          </button>
          <button
            onClick={resetForm}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors min-h-[40px]"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const ControllerCard = ({ controller }) => {
    if (editingId === controller.id) {
      return <ControllerForm isEdit={true} />;
    }

    const zoneCount = getZoneCount(controller.id);
    const zoneNames = getZoneNames(controller.id);

    return (
      <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">{controller.controller_type}</span>
              {zoneCount > 0 && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  {zoneCount} zone{zoneCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              {controller.controller_location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{controller.controller_location}</span>
                </div>
              )}
              {controller.serial_number && (
                <div className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  <span>{controller.serial_number}</span>
                </div>
              )}
              {controller.notes && (
                <div className="flex items-center gap-1">
                  <StickyNote className="w-3 h-3" />
                  <span className="italic">{controller.notes}</span>
                </div>
              )}
            </div>
            {zoneCount > 0 && (
              <div className="mt-2 flex items-start gap-1">
                <Droplets className="w-3 h-3 text-blue-500 mt-0.5" />
                <div className="text-xs text-gray-500">
                  Zones: {zoneNames.join(', ')}
                </div>
              </div>
            )}
          </div>
          {currentUser && (
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(controller)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit controller"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(controller.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove controller"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" />
          Controllers
        </h3>
        {currentUser && !isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Controller
          </button>
        )}
      </div>

      {isAdding && <ControllerForm />}

      {controllers.length === 0 && !isAdding ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <Settings className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No controllers configured</p>
          {currentUser && (
            <button
              onClick={() => setIsAdding(true)}
              className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Add your first controller
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {controllers.map(controller => (
            <ControllerCard key={controller.id} controller={controller} />
          ))}
        </div>
      )}
    </div>
  );
}

export default PropertyControllers;