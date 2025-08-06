import React, { useState } from 'react';
import { Clock, Calendar, User, History, Edit2, Trash2, ChevronUp } from 'lucide-react';
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
  setIsEditing
}) {
  const [expandedHistory, setExpandedHistory] = useState(false);

  if (isEditing) {
    return (
      <div className="border-2 border-blue-400 rounded-lg p-4">
        <ZoneForm
          zone={zone}
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
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getZoneIcon(zone.type)}
            <h4 className="font-semibold text-lg truncate">{zone.name}</h4>
            <span className="px-2 py-1 bg-gray-100 text-xs rounded-full capitalize whitespace-nowrap">
              {zone.type}
            </span>
            <div className="flex items-center gap-6 text-sm text-gray-600">
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
              <div className="flex items-center gap-1 whitespace-nowrap">
                <User className="w-4 h-4 text-gray-500" />
                <span className="truncate">{zone.last_adjusted_by}</span>
                <span className="text-gray-400">•</span>
                <span>{zone.last_adjusted_at}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setExpandedHistory(!expandedHistory)}
              className={`p-2 ${zone.history?.length > 0 ? 'text-purple-600 hover:bg-purple-50' : 'text-gray-400 cursor-not-allowed'} rounded-lg transition-colors`}
              disabled={!zone.history?.length}
              title={zone.history?.length > 0 ? 'View History' : 'No history available'}
            >
              <History className="w-4 h-4" />
            </button>
            <button
              onClick={() => currentUser ? setIsEditing(true) : alert('Please sign in to edit zones')}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => currentUser ? onDeleteZone(propertyId, zone.id) : alert('Please sign in to delete zones')}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
            <button onClick={() => setExpandedHistory(false)} className="text-gray-500 hover:text-gray-700">
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {zone.history.map((entry, index) => (
              <div key={index} className="bg-white rounded-lg p-2 text-sm border border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-700">{entry.changed_by}</span>
                  <span className="text-xs text-gray-400">•</span>
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