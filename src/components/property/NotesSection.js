import React, { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';

function NotesSection({ notes, onUpdate, currentUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(notes || '');

  const handleSave = () => {
    onUpdate(editedNotes);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedNotes(notes || '');
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-semibold mb-4">Property Notes</h3>
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editedNotes}
            onChange={(e) => setEditedNotes(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[100px]"
            rows="4"
            placeholder="Add notes about this property..."
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors min-h-[44px]"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">
            {notes || 'No notes added yet.'}
          </p>
          <button
            onClick={() => currentUser ? setIsEditing(true) : alert('Please sign in to edit notes')}
            className="mt-3 flex items-center justify-center sm:justify-start gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors min-h-[44px] w-full sm:w-auto"
          >
            <Edit2 className="w-4 h-4" />
            Edit Notes
          </button>
        </div>
      )}
    </div>
  );
}

export default NotesSection;