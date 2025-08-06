import React from 'react';
import { Filter } from 'lucide-react';

// Define allowed values
const ALLOWED_REGIONS = ['Phoenix', 'Las Vegas'];
const ALLOWED_BRANCHES = ['Phoenix', 'Las Vegas'];

function Filters({ properties, filters, onFilterChange }) {
  // Get unique values based on current filter state
  const getUniqueValues = (field) => {
    let sourceData = [...properties];
    
    // For cascading effect, filter the source data based on higher-level selections
    if (field === 'branch' && filters.region) {
      sourceData = sourceData.filter(p => p.region === filters.region);
    }
    else if (field === 'account_manager') {
      if (filters.region) {
        sourceData = sourceData.filter(p => p.region === filters.region);
      }
      if (filters.branch) {
        sourceData = sourceData.filter(p => p.branch === filters.branch);
      }
    }
    else if (field === 'property_type') {
      if (filters.region) {
        sourceData = sourceData.filter(p => p.region === filters.region);
      }
      if (filters.branch) {
        sourceData = sourceData.filter(p => p.branch === filters.branch);
      }
      if (filters.account_manager) {
        sourceData = sourceData.filter(p => p.account_manager === filters.account_manager);
      }
    }
    else if (field === 'company') {
      if (filters.region) {
        sourceData = sourceData.filter(p => p.region === filters.region);
      }
      if (filters.branch) {
        sourceData = sourceData.filter(p => p.branch === filters.branch);
      }
      if (filters.account_manager) {
        sourceData = sourceData.filter(p => p.account_manager === filters.account_manager);
      }
      if (filters.property_type) {
        sourceData = sourceData.filter(p => p.property_type === filters.property_type);
      }
    }
    
    const values = [...new Set(sourceData.map(p => p[field]).filter(Boolean))].sort();
    
    // Apply restrictions for regions and branches
    if (field === 'region') {
      return ALLOWED_REGIONS.filter(region => values.includes(region));
    }
    if (field === 'branch') {
      return ALLOWED_BRANCHES.filter(branch => values.includes(branch));
    }
    
    return values;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-800">Filters</h3>
        <span className="text-xs text-gray-500 ml-2">(Options update based on selections)</span>
      </div>
      <div className="grid grid-cols-5 gap-3">
        <FilterSelect
          label="Region"
          value={filters.region}
          onChange={(value) => onFilterChange({ ...filters, region: value })}
          options={getUniqueValues('region')}
          placeholder="All Regions"
        />
        <FilterSelect
          label="Branch"
          value={filters.branch}
          onChange={(value) => onFilterChange({ ...filters, branch: value })}
          options={getUniqueValues('branch')}
          placeholder="All Branches"
        />
        <FilterSelect
          label="Account Manager"
          value={filters.account_manager}
          onChange={(value) => onFilterChange({ ...filters, account_manager: value })}
          options={getUniqueValues('account_manager')}
          placeholder="All Managers"
        />
        <FilterSelect
          label="Property Type"
          value={filters.property_type}
          onChange={(value) => onFilterChange({ ...filters, property_type: value })}
          options={getUniqueValues('property_type')}
          placeholder="All Types"
        />
        <FilterSelect
          label="Company"
          value={filters.company}
          onChange={(value) => onFilterChange({ ...filters, company: value })}
          options={getUniqueValues('company')}
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