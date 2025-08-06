import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/common/Header';
import Filters from './components/common/Filters';
import CSVUpload from './components/common/CSVUpload';
import PropertySelector from './components/property/PropertySelector';
import PropertyDetails from './components/property/PropertyDetails';
import ZoneList from './components/zones/ZoneList';
import NotesSection from './components/property/NotesSection';
import { dataService } from './services/dataService';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editingProperty, setEditingProperty] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [addingZone, setAddingZone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    region: '',
    branch: '',
    account_manager: '',
    property_type: '',
    company: ''
  });

  // Load properties from Supabase on component mount
  useEffect(() => {
    loadProperties();
  }, []);

  // Apply filters whenever properties or filters change
  useEffect(() => {
    let filtered = [...properties];
    
    if (filters.region) {
      filtered = filtered.filter(p => p.region === filters.region);
    }
    if (filters.branch) {
      filtered = filtered.filter(p => p.branch === filters.branch);
    }
    if (filters.account_manager) {
      filtered = filtered.filter(p => p.account_manager === filters.account_manager);
    }
    if (filters.property_type) {
      filtered = filtered.filter(p => p.property_type === filters.property_type);
    }
    if (filters.company) {
      filtered = filtered.filter(p => p.company === filters.company);
    }
    
    setFilteredProperties(filtered);
    
    // Update selected property if it exists in filtered list
    if (selectedProperty) {
      const updatedSelected = filtered.find(p => p.id === selectedProperty.id);
      if (updatedSelected) {
        setSelectedProperty(updatedSelected);
      }
    }
  }, [filters, properties, selectedProperty]);

  const loadProperties = async () => {
    setLoading(true);
    const data = await dataService.getProperties();
    setProperties(data);
    setFilteredProperties(data);
    setLoading(false);
  };

  const handleSignIn = () => {
    setCurrentUser({
      email: 'user@example.com',
      name: 'John Doe',
      picture: null
    });
  };

  const handleSignOut = () => {
    setCurrentUser(null);
  };

  const handleZoneUpdate = async (propertyId, zoneId, updates, changeNote) => {
    const result = await dataService.updateZone(zoneId, updates, changeNote, currentUser);
    if (result) {
      // Reload properties to get updated data
      await loadProperties();
      setEditingZone(null);
    }
  };

  const handleDeleteZone = async (propertyId, zoneId) => {
    if (window.confirm('Are you sure you want to delete this zone?')) {
      const result = await dataService.deleteZone(zoneId);
      if (result) {
        await loadProperties();
      }
    }
  };

  const handleAddZone = async (propertyId, newZone) => {
    const result = await dataService.addZone(propertyId, newZone, currentUser);
    if (result) {
      await loadProperties();
      setAddingZone(false);
    }
  };

  const handleNotesUpdate = async (propertyId, notes) => {
    const result = await dataService.updateNotes(propertyId, notes);
    if (result) {
      await loadProperties();
    }
  };

  const handlePropertyUpdate = async (propertyId, updates) => {
    const result = await dataService.updateProperty(propertyId, updates);
    if (result) {
      await loadProperties();
      setEditingProperty(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading properties...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Header 
          currentUser={currentUser}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
        />
        <Filters 
          properties={properties}
          filters={filters}
          onFilterChange={setFilters}
        />
        <CSVUpload 
          onUploadComplete={loadProperties}
        />
        <PropertySelector
          properties={filteredProperties}
          selectedProperty={selectedProperty}
          onPropertySelect={setSelectedProperty}
        />
        {selectedProperty && (
          <>
            <PropertyDetails
              property={selectedProperty}
              onUpdate={handlePropertyUpdate}
              currentUser={currentUser}
              isEditing={editingProperty}
              setIsEditing={setEditingProperty}
            />
            <ZoneList
              property={selectedProperty}
              onZoneUpdate={handleZoneUpdate}
              onAddZone={handleAddZone}
              onDeleteZone={handleDeleteZone}
              currentUser={currentUser}
              editingZone={editingZone}
              setEditingZone={setEditingZone}
              addingZone={addingZone}
              setAddingZone={setAddingZone}
            />
            <NotesSection
              notes={selectedProperty.notes}
              onUpdate={(notes) => handleNotesUpdate(selectedProperty.id, notes)}
              currentUser={currentUser}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;