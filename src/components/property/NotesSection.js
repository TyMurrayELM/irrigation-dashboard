import React, { useState } from 'react';
import { MessageSquare, Send, User, Calendar } from 'lucide-react';

function NotesSection({ notes = [], onAddNote, currentUser }) {
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = () => {
    if (newNote.trim()) {
      onAddNote({
        text: newNote.trim(),
        user: currentUser.name,
        timestamp: new Date().toISOString(),
        userId: currentUser.id
      });
      setNewNote('');
      setIsAdding(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor((now - date) / (1000 * 60));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 168) { // 7 days
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Sort notes by timestamp, newest first
  const sortedNotes = [...notes].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg sm:text-xl font-semibold">Property Notes</h3>
        <span className="text-sm text-gray-500">({notes.length})</span>
      </div>

      {/* Add Note Section */}
      {currentUser ? (
        <div className="mb-4">
          {isAdding ? (
            <div className="space-y-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[80px] text-sm"
                placeholder="Add a note about this property..."
                autoFocus
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={!newNote.trim()}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-h-[40px]"
                >
                  <Send className="w-4 h-4" />
                  Add Note
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewNote('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors min-h-[40px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors min-h-[40px]"
            >
              + Add Note
            </button>
          )}
        </div>
      ) : (
        <div className="mb-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
          Please sign in to add notes
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedNotes.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">No notes added yet</p>
        ) : (
          sortedNotes.map((note, index) => (
            <div key={index} className="border-l-2 border-gray-200 pl-4 py-2 hover:border-blue-400 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                  <User className="w-3 h-3" />
                  {note.user}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {formatTimestamp(note.timestamp)}
                </div>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotesSection;