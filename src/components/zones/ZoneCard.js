import React, { useState } from 'react';
import { Clock, Calendar, User, History, Edit2, Trash2, ChevronUp, Settings } from 'lucide-react';
import { getZoneIcon } from '../../utils/icons';
import { formatFrequency } from '../../utils/helpers';
import ZoneForm from './ZoneForm';

function ZoneCard({ 
  zone, 
  propertyId, 
  onZoneUpdate, 
  onDeleteZone,
  currentUser,
  isEditing,
  setIsEditing,
  controllers = []
}) {
  const [expandedHistory, setExpandedHistory] = useState(false);

  // Find the controller for this zone
  const assignedController = controllers.find(c => c.id === zone.controller_id);

  if (isEditing) {
    return (
      <div className="border-2 border-blue-400 rounded-lg p-4">
        <ZoneForm
          zone={zone}
          controllers={controllers}
          onSave={(updates, note) => {
            onZoneUpdate(propertyId, zone.id, updates, note);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
      <div className="p-4">
        {/* Mobile: Stack vertically, Desktop: Original horizontal layout */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Zone Info Section */}
          <div className="flex-1 min-w-0">
            {/* Zone Header - Always horizontal */}
            <div className="flex items-center gap-3 mb-3 lg:mb-0">
              {getZoneIcon(zone.type)}
              <h4 className="font-semibold text-lg truncate">{zone.name}</h4>
              <span className="px-2 py-1 bg-gray-100 text-xs rounded-full capitalize whitespace-nowrap">
                {zone.type}
              </span>
              {assignedController && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full whitespace-nowrap flex items-center gap-1">
                  <Settings className="w-3 h-3" />
                  {assignedController.controller_type}
                  {assignedController.controller_location && ` - ${assignedController.controller_location}`}
                </span>
              )}
            </div>
            
            {/* Zone Details - Stack on mobile, inline on desktop */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-6 text-sm text-gray-600 lg:ml-9">
              <div className="flex items-center gap-1 whitespace-nowrap">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>{zone.duration} min</span>
              </div>
              <div className="flex items-center gap-1 whitespace-nowrap">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="capitalize font-medium">
                  {formatFrequency(zone.frequency, zone.days)}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="truncate">{zone.last_adjusted_by}</span>
                <span className="text-gray-400">•</span>
                <span className="whitespace-nowrap">{zone.last_adjusted_at}</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons - Larger touch targets on mobile */}
          <div className="flex gap-2 flex-shrink-0 self-end lg:self-auto">
            <button
              onClick={() => setExpandedHistory(!expandedHistory)}
              className={`p-2 lg:p-2 min-w-[40px] min-h-[40px] ${zone.history?.length > 0 ? 'text-purple-600 hover:bg-purple-50' : 'text-gray-400 cursor-not-allowed'} rounded-lg transition-colors`}
              disabled={!zone.history?.length}
              title={zone.history?.length > 0 ? 'View History' : 'No history available'}
            >
              <History className="w-4 h-4" />
            </button>
            <button
              onClick={() => currentUser ? setIsEditing(true) : alert('Please sign in to edit zones')}
              className="p-2 lg:p-2 min-w-[40px] min-h-[40px] text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => currentUser ? onDeleteZone(propertyId, zone.id) : alert('Please sign in to delete zones')}
              className="p-2 lg:p-2 min-w-[40px] min-h-[40px] text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {expandedHistory && zone.history?.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2.5">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <History className="w-4 h-4" />
              Change History
            </h5>
            <button onClick={() => setExpandedHistory(false)} className="text-gray-500 hover:text-gray-700 min-w-[40px] min-h-[40px] flex items-center justify-center">
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {zone.history.map((entry, index) => (
              <div key={index} className="bg-white rounded-lg p-2 text-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="font-medium text-gray-700">{entry.changed_by}</span>
                  <span className="hidden sm:inline text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{entry.changed_at}</span>
                </div>
                {entry.note && (
                  <div className="text-xs text-gray-500 italic mt-0.5">
                    "{entry.note}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ZoneCard;