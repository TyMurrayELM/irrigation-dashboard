import React from 'react';
import { Filter } from 'lucide-react';
import { getUniqueValues } from '../../utils/helpers';

function Filters({ properties, filters, onFilterChange }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-800">Filters</h3>
      </div>
      <div className="grid grid-cols-5 gap-3">
        <FilterSelect
          label="Region"
          value={filters.region}
          onChange={(value) => onFilterChange({ ...filters, region: value })}
          options={getUniqueValues(properties, 'region')}
          placeholder="All Regions"
        />
        <FilterSelect
          label="Branch"
          value={filters.branch}
          onChange={(value) => onFilterChange({ ...filters, branch: value })}
          options={getUniqueValues(properties, 'branch')}
          placeholder="All Branches"
        />
        <FilterSelect
          label="Account Manager"
          value={filters.account_manager}
          onChange={(value) => onFilterChange({ ...filters, account_manager: value })}
          options={getUniqueValues(properties, 'account_manager')}
          placeholder="All Managers"
        />
        <FilterSelect
          label="Property Type"
          value={filters.property_type}
          onChange={(value) => onFilterChange({ ...filters, property_type: value })}
          options={getUniqueValues(properties, 'property_type')}
          placeholder="All Types"
        />
        <FilterSelect
          label="Company"
          value={filters.company}
          onChange={(value) => onFilterChange({ ...filters, company: value })}
          options={getUniqueValues(properties, 'company')}
          placeholder="All Companies"
        />
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      <label className="text-xs text-gray-600">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

export default Filters;