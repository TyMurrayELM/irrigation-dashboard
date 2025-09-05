import React from 'react';
import { Edit2, Settings } from 'lucide-react';
import { getStatusIcon, getStatusColor } from '../../utils/helpers';
import PropertyEditForm from './PropertyEditForm';
import PropertyControllers from './PropertyControllers';

function PropertyDetails({ 
  property, 
  onEdit, 
  onUpdate, 
  currentUser, 
  isEditing, 
  setIsEditing,
  onAddController,
  onUpdateController,
  onDeleteController 
}) {
  const StatusIcon = getStatusIcon(property.days_since_irrigation_invoice);
  const VisitIcon = getStatusIcon(property.days_since_irrigation_visit);

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Property Details</h2>
        <PropertyEditForm
          property={property}
          onSave={(updates) => {
            onUpdate(property.id, updates);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{property.name}</h2>
          <p className="text-gray-600">
            {property.address}
            {property.gate_code && (
              <span className="text-gray-500"> • Gate: {property.gate_code}</span>
            )}
          </p>
        </div>
        <button
          onClick={() => currentUser ? setIsEditing(true) : alert('Please sign in to edit property details')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          Edit Property
        </button>
      </div>
      
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mb-4">
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Region:</span>
          <span className="font-medium">{property.region}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Branch:</span>
          <span className="font-medium">{property.branch}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Manager:</span>
          <span className="font-medium">{property.account_manager}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Type:</span>
          <span className="font-medium">{property.property_type}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Company:</span>
          <span className="font-medium">{property.company}</span>
        </div>
      </div>

      {/* Controllers Section */}
      <div className="border-t border-b py-4 my-4">
        <PropertyControllers
          property={property}
          controllers={property.controllers || []}
          onAddController={onAddController}
          onUpdateController={onUpdateController}
          onDeleteController={onDeleteController}
          currentUser={currentUser}
        />
      </div>
      
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-4 h-4 ${getStatusColor(property.days_since_irrigation_invoice)}`} />
          <div>
            <span className="text-xs text-gray-500">Days Since Invoice</span>
            <p className={`font-medium ${getStatusColor(property.days_since_irrigation_invoice)}`}>
              {property.days_since_irrigation_invoice || 'N/A'} days
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <VisitIcon className={`w-4 h-4 ${getStatusColor(property.days_since_irrigation_visit)}`} />
          <div>
            <span className="text-xs text-gray-500">Days Since Visit</span>
            <p className={`font-medium ${getStatusColor(property.days_since_irrigation_visit)}`}>
              {property.days_since_irrigation_visit || 'N/A'} days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetails;