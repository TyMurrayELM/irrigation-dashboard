import React from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle, Settings } from 'lucide-react';

function PropertiesOverview({ properties, onSelectProperty }) {
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

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Properties Overview</h2>
        <p className="text-sm text-gray-600 mt-1">All properties and their current irrigation settings</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timer</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Zones</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Min</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Visit</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
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
                <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {property.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {property.region}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {property.account_manager}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    <span className={property.timer_type ? 'text-blue-600 font-medium' : 'text-gray-400'}>
                      {property.timer_type || 'Not set'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">
                    {property.zones?.length || 0}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center font-medium">
                    {getTotalDuration(property.zones)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span className="truncate block max-w-xs" title={getScheduleSummary(property.zones)}>
                      {getScheduleSummary(property.zones)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getStatusIcon(property.days_since_irrigation_invoice)}
                      <span className={getStatusColor(property.days_since_irrigation_invoice)}>
                        {property.days_since_irrigation_invoice || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getStatusIcon(property.days_since_irrigation_visit)}
                      <span className={getStatusColor(property.days_since_irrigation_visit)}>
                        {property.days_since_irrigation_visit || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <button
                      onClick={() => onSelectProperty(property)}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 mx-auto"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Manage</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {properties.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          Showing {properties.length} {properties.length === 1 ? 'property' : 'properties'}
        </div>
      )}
    </div>
  );
}

export default PropertiesOverview;