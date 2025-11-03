import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle, Settings, ChevronDown, ChevronUp, Droplets, TreePine, User, StickyNote, Play } from 'lucide-react';

function PropertiesOverview({ properties, onSelectProperty }) {
  const [expandedProperties, setExpandedProperties] = useState(new Set());
  const [expandedNotes, setExpandedNotes] = useState(new Set());

  const getStatusIcon = (days) => {
    if (days === null || days === undefined) return <AlertCircle className="w-4 h-4 text-gray-400" />;
    if (days <= 7) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (days <= 30) return <Clock className="w-4 h-4 text-yellow-600" />;
    return <AlertCircle className="w-4 h-4 text-red-600" />;
  };

  const getStatusColor = (days) => {
    if (days === null || days === undefined) return 'text-gray-400';
    if (days <= 7) return 'text-green-600';
    if (days <= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTotalDuration = (zones) => {
    if (!zones || zones.length === 0) return 0;
    return zones.reduce((total, zone) => total + (zone.duration || 0), 0);
  };

  const getScheduleSummary = (zones) => {
    if (!zones || zones.length === 0) return 'No zones';
    
    const schedules = zones.map(zone => {
      if (zone.frequency === 'custom-days' && zone.days && zone.days.length > 0) {
        return zone.days.join(',');
      }
      return zone.frequency?.replace(/-/g, ' ') || 'Not set';
    });
    
    // Get unique schedules
    const uniqueSchedules = [...new Set(schedules)];
    return uniqueSchedules.join(' | ');
  };

  const getStartTimes = (zones) => {
    if (!zones || zones.length === 0) return null;
    
    // Collect all start times from all zones
    const allTimes = [];
    
    zones.forEach(zone => {
      if (zone.start_times && Array.isArray(zone.start_times) && zone.start_times.length > 0) {
        zone.start_times.forEach(time => {
          const [hours, minutes] = time.split(':');
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
          allTimes.push(`${displayHour}:${minutes}${ampm}`);
        });
      }
    });
    
    // Return unique times, sorted
    const uniqueTimes = [...new Set(allTimes)];
    return uniqueTimes.length > 0 ? uniqueTimes.join(', ') : null;
  };

  const getMostRecentAdjuster = (zones) => {
    if (!zones || zones.length === 0) return 'N/A';
    
    // Get all zones with dates
    const zonesWithDates = zones
      .filter(zone => zone.last_adjusted_at)
      .map(zone => ({
        adjuster: zone.last_adjusted_by || 'Unknown',
        date: new Date(zone.last_adjusted_at)
      }));
    
    if (zonesWithDates.length === 0) return 'N/A';
    
    // Sort by date and get the most recent
    zonesWithDates.sort((a, b) => b.date - a.date);
    return zonesWithDates[0].adjuster;
  };

  const toggleExpanded = (propertyId) => {
    const newExpanded = new Set(expandedProperties);
    if (newExpanded.has(propertyId)) {
      newExpanded.delete(propertyId);
    } else {
      newExpanded.add(propertyId);
    }
    setExpandedProperties(newExpanded);
  };

  const toggleNotes = (propertyId, e) => {
    e.stopPropagation(); // Prevent triggering property selection
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(propertyId)) {
      newExpanded.delete(propertyId);
    } else {
      newExpanded.add(propertyId);
    }
    setExpandedNotes(newExpanded);
  };

  const getZoneIcon = (type) => {
    switch(type) {
      case 'turf':
        return <Droplets className="w-4 h-4 text-green-500" />;
      case 'shrubs':
        return <TreePine className="w-4 h-4 text-emerald-600" />;
      case 'trees':
        return <TreePine className="w-4 h-4 text-green-700" />;
      default:
        return <Droplets className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatFrequency = (frequency, days) => {
    if (frequency === 'custom-days' && days && days.length > 0) {
      return days.join(', ');
    }
    return frequency?.replace(/-/g, ' ') || 'Not set';
  };

  const formatTime = (timeString) => {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatMultipleStartTimes = (startTimes) => {
    if (!startTimes || !Array.isArray(startTimes) || startTimes.length === 0) {
      return null;
    }
    
    return startTimes.map(time => formatTime(time)).join(', ');
  };

  // Get the most recent note from property or zones
  const getMostRecentNote = (property) => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    let recentNotes = [];
    
    // Check property notes (now an array)
    if (property.notes && Array.isArray(property.notes)) {
      property.notes.forEach(note => {
        const noteDate = new Date(note.timestamp);
        if (noteDate >= twoWeeksAgo) {
          recentNotes.push({
            note: note.text,
            date: noteDate,
            source: 'Property',
            by: note.user
          });
        }
      });
    } else if (property.notes && typeof property.notes === 'string') {
      // Fallback for old string format
      const updatedDate = new Date(property.updated_at);
      if (updatedDate >= twoWeeksAgo) {
        recentNotes.push({
          note: property.notes,
          date: updatedDate,
          source: 'Property',
          by: null
        });
      }
    }
    
    // Check zone history for recent notes
    if (property.zones) {
      for (const zone of property.zones) {
        if (zone.history && zone.history.length > 0) {
          for (const historyItem of zone.history) {
            if (historyItem.note) {
              // Parse the date string (format: "01/15/2025")
              const [month, day, year] = historyItem.changed_at.split('/');
              const historyDate = new Date(year, month - 1, day);
              if (historyDate >= twoWeeksAgo) {
                recentNotes.push({
                  note: historyItem.note,
                  date: historyDate,
                  source: `Zone: ${zone.name}`,
                  by: historyItem.changed_by
                });
              }
            }
          }
        }
      }
    }
    
    // Sort by date and return the most recent
    if (recentNotes.length > 0) {
      recentNotes.sort((a, b) => b.date - a.date);
      return recentNotes[0];
    }
    
    return null;
  };

  const hasRecentNote = (property) => {
    return getMostRecentNote(property) !== null;
  };

  // Sort properties: those with recent notes first, then alphabetically
  const sortedProperties = [...properties].sort((a, b) => {
    const aHasRecentNote = hasRecentNote(a);
    const bHasRecentNote = hasRecentNote(b);
    
    if (aHasRecentNote && !bHasRecentNote) return -1;
    if (!aHasRecentNote && bHasRecentNote) return 1;
    
    // If both have or don't have recent notes, sort by name
    return a.name.localeCompare(b.name);
  });

  // Format tooltip text for the note
  const formatNoteTooltip = (noteData) => {
    if (!noteData) return '';
    
    const dateStr = noteData.date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    let tooltip = `${noteData.source} - ${dateStr}`;
    if (noteData.by) {
      tooltip += ` by ${noteData.by}`;
    }
    tooltip += `\n\n${noteData.note}`;
    
    return tooltip;
  };

  // Mobile Card Component for User Activity
  const PropertyCard = ({ property }) => {
    const recentNote = getMostRecentNote(property);
    const hasNote = recentNote !== null;
    const isExpanded = expandedProperties.has(property.id);
    const startTimes = getStartTimes(property.zones);
    
    return (
      <div className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden ${hasNote ? 'ring-2 ring-yellow-400' : ''}`}>
        {/* Card Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <button
                onClick={() => onSelectProperty(property)}
                className="text-blue-600 hover:text-blue-800 font-semibold text-left"
              >
                {property.name}
              </button>
              <p className="text-sm text-gray-600 mt-1">{property.region}</p>
            </div>
            <button
              onClick={() => onSelectProperty(property)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
          
          {hasNote && (
            <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded-md">
              <StickyNote className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="flex-1 text-xs">
                <p className="font-medium text-gray-700">
                  {recentNote.source} - {recentNote.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {recentNote.by && <span> by {recentNote.by}</span>}
                </p>
                <p className="text-gray-600 mt-1 line-clamp-2">{recentNote.note}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Card Body */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Timer</p>
              <p className={property.timer_type ? 'font-medium text-blue-600' : 'text-gray-400'}>
                {property.timer_type || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Zones</p>
              <p className="font-medium">{property.zones?.length || 0} zones / {getTotalDuration(property.zones)} min</p>
            </div>
            <div>
              <p className="text-gray-500">Last Invoice</p>
              <div className="flex items-center gap-1">
                {getStatusIcon(property.days_since_irrigation_invoice)}
                <span className={getStatusColor(property.days_since_irrigation_invoice)}>
                  {property.days_since_irrigation_invoice || 'N/A'} days
                </span>
              </div>
            </div>
            <div>
              <p className="text-gray-500">Last Visit</p>
              <div className="flex items-center gap-1">
                {getStatusIcon(property.days_since_irrigation_visit)}
                <span className={getStatusColor(property.days_since_irrigation_visit)}>
                  {property.days_since_irrigation_visit || 'N/A'} days
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-gray-500 text-sm">Schedule</p>
            <p className="font-medium text-sm">{getScheduleSummary(property.zones)}</p>
          </div>

          {startTimes && (
            <div>
              <p className="text-gray-500 text-sm">Start Times</p>
              <p className="font-medium text-sm text-green-700">{startTimes}</p>
            </div>
          )}
          
          {property.zones && property.zones.length > 0 && (
            <button
              onClick={() => toggleExpanded(property.id)}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              {isExpanded ? (
                <>Hide Zones <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>Show Zones <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          )}
        </div>
        
        {/* Expanded Zones */}
        {isExpanded && property.zones && property.zones.length > 0 && (
          <div className="px-4 pb-4">
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              {property.zones.map((zone) => (
                <div key={zone.id} className="bg-white p-2 rounded border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    {getZoneIcon(zone.type)}
                    <span className="font-medium text-sm">{zone.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full capitalize">
                      {zone.type}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                    {zone.start_times && zone.start_times.length > 0 && (
                      <span className="flex items-center gap-1 text-green-700">
                        <Play className="w-3 h-3" />
                        {formatMultipleStartTimes(zone.start_times)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {zone.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatFrequency(zone.frequency, zone.days)}
                    </span>
                    {zone.last_adjusted_by && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {zone.last_adjusted_by}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[600px] flex flex-col">
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Properties Overview</h2>
        <p className="text-sm text-gray-600 mt-1">
          <span className="hidden lg:inline">Click property name to view details • Click arrow to expand zones</span>
          <span className="lg:hidden">Tap property to view details</span>
          <span className="hidden sm:inline ml-2">
            <StickyNote className="w-3 h-3 text-yellow-600 inline mr-1" />
            = Recent note
          </span>
        </p>
      </div>
      
      {/* Mobile View - Cards */}
      <div className="lg:hidden flex-1 overflow-y-auto p-4">
        {sortedProperties.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No properties found matching the selected filters
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sortedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
      
      {/* Desktop View - Table */}
      <div className="hidden lg:block flex-1 overflow-x-auto overflow-y-auto relative" style={{ maxHeight: 'calc(100% - 88px)' }}>
        <table className="w-full table-auto">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="sticky top-0 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">Property</th>
              <th className="sticky top-0 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 bg-gray-50 border-b border-gray-200">Region</th>
              <th className="sticky top-0 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">Timer</th>
              <th className="sticky top-0 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16 bg-gray-50 border-b border-gray-200">Zones</th>
              <th className="sticky top-0 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20 bg-gray-50 border-b border-gray-200">Total Min</th>
              <th className="sticky top-0 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">Start Times</th>
              <th className="sticky top-0 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px] bg-gray-50 border-b border-gray-200">Schedule</th>
              {/* <th className="sticky top-0 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20 bg-gray-50 border-b border-gray-200">Days Since<br/>Invoice</th>
              <th className="sticky top-0 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20 bg-gray-50 border-b border-gray-200">Days Since<br/>Visit</th> */}
              <th className="sticky top-0 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 bg-gray-50 border-b border-gray-200">Last Adjuster</th>
              <th className="sticky top-0 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20 bg-gray-50 border-b border-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedProperties.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                  No properties found matching the selected filters
                </td>
              </tr>
            ) : (
              sortedProperties.map((property) => {
                const startTimes = getStartTimes(property.zones);
                const recentNote = getMostRecentNote(property);
                
                return (
                  <React.Fragment key={property.id}>
                    <tr className={`hover:bg-gray-50 ${recentNote ? 'bg-yellow-50' : ''}`}>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {property.notes && Array.isArray(property.notes) && property.notes.length > 0 && (
                            <button
                              onClick={(e) => toggleNotes(property.id, e)}
                              className="text-gray-600 hover:text-gray-800 flex-shrink-0"
                              title={expandedNotes.has(property.id) ? "Hide notes" : "Show notes"}
                            >
                              {expandedNotes.has(property.id) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronUp className="w-4 h-4 transform rotate-90" />
                              )}
                            </button>
                          )}
                          {recentNote && (
                            <div className="relative group">
                              <StickyNote className="w-4 h-4 text-yellow-600 cursor-help flex-shrink-0" />
                              <div className="invisible group-hover:visible absolute left-0 bottom-full mb-2 z-50">
                                <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg" style={{ width: '400px', maxWidth: '400px' }}>
                                  <div className="font-semibold mb-1">
                                    {recentNote.source} - {recentNote.date.toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                    {recentNote.by && <span className="font-normal"> by {recentNote.by}</span>}
                                  </div>
                                  <div className="whitespace-pre-wrap break-words">
                                    {recentNote.note.length > 300 
                                      ? recentNote.note.substring(0, 300) + '...' 
                                      : recentNote.note}
                                  </div>
                                  <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                                </div>
                              </div>
                            </div>
                          )}
                          <span
                            onClick={() => onSelectProperty(property)}
                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            {property.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap w-20">
                        {property.region}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className={`${property.timer_type ? 'text-blue-600 font-medium' : 'text-gray-400'}`} title={property.timer_type}>
                          {property.timer_type || 'Not set'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-center w-16">
                        {property.zones?.length || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-center font-medium w-20">
                        {getTotalDuration(property.zones)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {startTimes ? (
                          <div className="flex items-center gap-1 text-green-700">
                            <Play className="w-3 h-3" />
                            <span className="font-medium">{startTimes}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 min-w-[150px]">
                        <span className="block">
                          {getScheduleSummary(property.zones)}
                        </span>
                      </td>
                      {/* <td className="px-4 py-3 text-sm text-center w-20">
                        <div className="flex items-center justify-center gap-1">
                          {getStatusIcon(property.days_since_irrigation_invoice)}
                          <span className={getStatusColor(property.days_since_irrigation_invoice)}>
                            {property.days_since_irrigation_invoice || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center w-20">
                        <div className="flex items-center justify-center gap-1">
                          {getStatusIcon(property.days_since_irrigation_visit)}
                          <span className={getStatusColor(property.days_since_irrigation_visit)}>
                            {property.days_since_irrigation_visit || 'N/A'}
                          </span>
                        </div>
                      </td> */}
                      <td className="px-4 py-3 text-sm text-gray-600 w-32">
                        <div className="flex items-center gap-1 truncate">
                          <User className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{getMostRecentAdjuster(property.zones)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center w-20">
                        <div className="flex items-center justify-center gap-2">
                          {property.zones && property.zones.length > 0 && (
                            <button
                              onClick={() => toggleExpanded(property.id)}
                              className="text-gray-600 hover:text-gray-800"
                              title={expandedProperties.has(property.id) ? "Hide zones" : "Show zones"}
                            >
                              {expandedProperties.has(property.id) ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => onSelectProperty(property)}
                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded notes section */}
                    {expandedNotes.has(property.id) && property.notes && Array.isArray(property.notes) && property.notes.length > 0 && (
                      <tr>
                        <td colSpan="9" className="px-4 py-3 bg-blue-50">
                          <div className="ml-8">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <StickyNote className="w-4 h-4 text-blue-600" />
                              Property Notes ({property.notes.length})
                            </h4>
                            <div className="space-y-2">
                              {property.notes.map((note, index) => (
                                <div key={index} className="bg-white p-3 rounded border border-gray-200">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <User className="w-3 h-3" />
                                      <span className="font-medium">{note.user || 'Unknown'}</span>
                                      <span>•</span>
                                      <span>{new Date(note.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-700">{note.text}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    
                    {/* Expanded zones section */}
                    {expandedProperties.has(property.id) && property.zones && property.zones.length > 0 && (
                      <tr>
                        <td colSpan="9" className="px-4 py-3 bg-gray-50">
                          <div className="ml-8">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Zones:</h4>
                            <div className="space-y-2">
                              {property.zones.map((zone) => (
                                <div key={zone.id} className="flex items-center gap-4 text-sm bg-white p-2 rounded border border-gray-200">
                                  <div className="flex items-center gap-2 flex-1">
                                    {getZoneIcon(zone.type)}
                                    <span className="font-medium">{zone.name}</span>
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full capitalize">
                                      {zone.type}
                                    </span>
                                  </div>
                                  {zone.start_times && zone.start_times.length > 0 && (
                                    <div className="flex items-center gap-1 text-green-700">
                                      <Play className="w-3 h-3" />
                                      <span className="font-medium text-xs">{formatMultipleStartTimes(zone.start_times)}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <Clock className="w-3 h-3" />
                                    <span>{zone.duration} min</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <Calendar className="w-3 h-3" />
                                    <span className="text-xs">{formatFrequency(zone.frequency, zone.days)}</span>
                                  </div>
                                  {zone.last_adjusted_by && (
                                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                                      <User className="w-3 h-3" />
                                      <span>{zone.last_adjusted_by}</span>
                                      {zone.last_adjusted_at && (
                                        <span className="text-gray-400">
                                          ({new Date(zone.last_adjusted_at).toLocaleDateString()})
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {zone.history && zone.history.length > 0 && zone.history[0].note && (
                                    <div className="flex items-center gap-1">
                                      <StickyNote className="w-3 h-3 text-yellow-600" />
                                      <span className="text-xs text-gray-600 italic truncate max-w-[200px]" title={zone.history[0].note}>
                                        {zone.history[0].note}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PropertiesOverview;