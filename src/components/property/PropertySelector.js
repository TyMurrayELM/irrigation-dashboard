import React from 'react';
import { Home } from 'lucide-react';

function PropertySelector({ properties, selectedProperty, onPropertySelect }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center gap-4">
        <Home className="w-5 h-5 text-blue-600" />
        <label className="text-lg font-semibold text-gray-800">Select Property:</label>
        <select
          value={selectedProperty?.id || ''}
          onChange={(e) => {
            const property = properties.find(p => p.id === parseInt(e.target.value));
            onPropertySelect(property);
          }}
          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        >
          <option value="">Choose a property...</option>
          {properties.map(property => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </select>
      </div>
      {properties.length === 0 && (
        <div className="mt-3 text-sm text-gray-500">
          No properties match the selected filters. Try adjusting your filters.
        </div>
      )}
    </div>
  );
}

export default PropertySelector;