import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle, Settings, ChevronDown, ChevronUp, Droplets, TreePine, User } from 'lucide-react';

function PropertiesOverview({ properties, onSelectProperty }) {
  const [expandedProperties, setExpandedProperties] = useState(new Set());

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

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[600px] flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Properties Overview</h2>
        <p className="text-sm text-gray-600 mt-1">Click property name to view details • Click arrow to expand zones</p>
      </div>
      
      <div className="flex-1 overflow-x-auto overflow-y-auto relative" style={{ maxHeight: 'calc(100% - 88px)' }}>
        <table className="w-full table-auto">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="sticky top-0 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] bg-gray-50 border-b border-gray-200">Property</th>
              <th className="sticky top-0 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 bg-gray-50 border-b border-gray-200">Region</th>
              <th className="sticky top-0 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 bg-gray-50 border-b border-gray-200">Timer</th>
              <th className="sticky top-0 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16 bg-gray-50 border-b border-gray-200">Zones</th>
              <th className="sticky top-0 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20 bg-gray-50 border-b border-gray-200">Total Min</th>
              <th className="sticky top-0 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px] bg-gray-50 border-b border-gray-200">Schedule</th>
              <th className="sticky top-0 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20 bg-gray-50 border-b border-gray-200">Days Since<br/>Invoice</th>
              <th className="sticky top-0 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20 bg-gray-50 border-b border-gray-200">Days Since<br/>Visit</th>
              <th className="sticky top-0 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 bg-gray-50 border-b border-gray-200">Last Adjuster</th>
              <th className="sticky top-0 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20 bg-gray-50 border-b border-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                  No properties found matching the selected filters
                </td>
              </tr>
            ) : (
              properties.map((property) => (
                <React.Fragment key={property.id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 min-w-[100px]">
                      <button
                        onClick={() => onSelectProperty(property)}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                      >
                        {property.name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap w-20">
                      {property.region}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 w-32">
                      <span className={`${property.timer_type ? 'text-blue-600 font-medium' : 'text-gray-400'} truncate block`} title={property.timer_type}>
                        {property.timer_type || 'Not set'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center w-16">
                      {property.zones?.length || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center font-medium w-20">
                      {getTotalDuration(property.zones)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 min-w-[150px]">
                      <span className="block">
                        {getScheduleSummary(property.zones)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center w-20">
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
                    </td>
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
                  
                  {/* Expanded zones section */}
                  {expandedProperties.has(property.id) && property.zones && property.zones.length > 0 && (
                    <tr>
                      <td colSpan="10" className="px-4 py-3 bg-gray-50">
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
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PropertiesOverview;