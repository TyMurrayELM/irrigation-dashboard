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
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-600" />
          Irrigation Zones
        </h3>
        <button
          onClick={() => currentUser ? setAddingZone(true) : alert('Please sign in to add zones')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Zone
        </button>
      </div>

      <div className="space-y-4">
        {addingZone && (
          <div className="border-2 border-green-400 rounded-lg p-4">
            <ZoneForm
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