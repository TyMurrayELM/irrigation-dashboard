import React from 'react';
import { Droplets, Plus } from 'lucide-react';
import ZoneCard from './ZoneCard';
import ZoneForm from './ZoneForm';

function ZoneList({ 
  property, 
  onZoneUpdate, 
  onAddZone, 
  onDeleteZone,
  currentUser,
  editingZone,
  setEditingZone,
  addingZone,
  setAddingZone
}) {
  const controllers = property.controllers || [];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-600" />
          Irrigation Zones
        </h3>
        <button
          onClick={() => currentUser ? setAddingZone(true) : alert('Please sign in to add zones')}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px] w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add Zone
        </button>
      </div>

      <div className="space-y-4">
        {addingZone && (
          <div className="border-2 border-green-400 rounded-lg p-4">
            <ZoneForm
              controllers={controllers}
              onSave={(zone) => {
                onAddZone(property.id, zone);
                setAddingZone(false);
              }}
              onCancel={() => setAddingZone(false)}
            />
          </div>
        )}
        
        {property.zones.map(zone => (
          <ZoneCard
            key={zone.id}
            zone={zone}
            propertyId={property.id}
            controllers={controllers}
            onZoneUpdate={onZoneUpdate}
            onDeleteZone={onDeleteZone}
            currentUser={currentUser}
            isEditing={editingZone === zone.id}
            setIsEditing={(editing) => setEditingZone(editing ? zone.id : null)}
          />
        ))}
      </div>
    </div>
  );
}

export default ZoneList;