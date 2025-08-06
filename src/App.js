import React, { useState, useEffect } from 'react';
import './App.css';
import LoginScreen from './components/common/LoginScreen';
import Header from './components/common/Header';
import Filters from './components/common/Filters';
import CSVUpload from './components/common/CSVUpload';
import PropertySelector from './components/property/PropertySelector';
import PropertyDetails from './components/property/PropertyDetails';
import PropertiesOverview from './components/property/PropertiesOverview';
import ZoneList from './components/zones/ZoneList';
import NotesSection from './components/property/NotesSection';
import AdminDashboard from './components/admin/AdminDashboard';
import { dataService } from './services/dataService';
import { authService } from './services/authService';
import { LayoutGrid, LayoutList, Users } from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editingProperty, setEditingProperty] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [addingZone, setAddingZone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'detail'
  const [showUserActivity, setShowUserActivity] = useState(false); // Admin dashboard toggle
  const [filters, setFilters] = useState({
    region: '',
    branch: '',
    account_manager: '',
    property_type: '',
    company: ''
  });

  // Check for existing auth session on mount
  useEffect(() => {
    checkAuth();
    
    // Listen for auth changes
    const { data: authListener } = authService.onAuthStateChange((user) => {
      console.log('Auth state changed:', user);
      setCurrentUser(user);
      setAuthLoading(false);
      // Load properties when user signs in
      if (user) {
        loadProperties();
        // Log user activity
        logUserActivity(user);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Load properties only when authenticated
  useEffect(() => {
    if (currentUser) {
      loadProperties();
    }
  }, [currentUser]);

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

  const checkAuth = async () => {
    try {
      console.log('Checking authentication...');
      const user = await authService.getCurrentUser();
      console.log('Current user:', user);
      setCurrentUser(user);
      setAuthLoading(false);
    } catch (error) {
      console.error('Error checking auth:', error);
      setAuthLoading(false);
    }
  };

  const logUserActivity = async (user) => {
    // Log user activity for admin dashboard
    try {
      await authService.logUserActivity('login');
    } catch (error) {
      console.error('Error logging user activity:', error);
    }
  };

  const loadProperties = async () => {
    setLoading(true);
    const data = await dataService.getProperties();
    setProperties(data);
    setFilteredProperties(data);
    setLoading(false);
  };

  const handleSignIn = async () => {
    const result = await authService.signInWithGoogle();
    if (!result.success) {
      alert('Error signing in. Please try again.');
    }
  };

  const handleSignOut = async () => {
    // Log the sign out
    await authService.logUserActivity('logout');
    
    const result = await authService.signOut();
    if (result.success) {
      setCurrentUser(null);
      setProperties([]);
      setFilteredProperties([]);
      setSelectedProperty(null);
      setShowUserActivity(false); // Reset admin view
    }
  };

  const handleZoneUpdate = async (propertyId, zoneId, updates, changeNote) => {
    const result = await dataService.updateZone(zoneId, updates, changeNote, currentUser);
    if (result) {
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

  const handleSelectPropertyFromOverview = (property) => {
    setSelectedProperty(property);
    setViewMode('detail');
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!currentUser) {
    return <LoginScreen onSignIn={handleSignIn} />;
  }

  // Show loading while fetching properties
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading properties...</div>
      </div>
    );
  }

  // Main dashboard (only shown when authenticated)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Header 
          currentUser={currentUser}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
        />
        
        {/* Admin User Activity Button - Simple and non-intrusive */}
        {currentUser?.isAdmin && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setShowUserActivity(!showUserActivity)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showUserActivity 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
              }`}
            >
              <Users className="w-4 h-4" />
              {showUserActivity ? 'Hide User Activity' : 'View User Activity'}
            </button>
          </div>
        )}
        
        {/* Admin Dashboard - Shows when toggled */}
        {showUserActivity && currentUser?.isAdmin && (
          <AdminDashboard currentUser={currentUser} />
        )}
        
        {/* Regular Dashboard Content - Always shows unless admin dashboard is open */}
        {!showUserActivity && (
          <>
            <Filters 
              properties={properties}
              filters={filters}
              onFilterChange={setFilters}
            />
            
            {/* Only show CSV Upload to admins */}
            {currentUser?.isAdmin && (
              <CSVUpload 
                onUploadComplete={loadProperties}
              />
            )}
            
            {/* View Mode Toggle */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">View Mode:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('overview')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        viewMode === 'overview'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <LayoutList className="w-4 h-4" />
                      Overview
                    </button>
                    <button
                      onClick={() => setViewMode('detail')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        viewMode === 'detail'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                      Detail View
                    </button>
                  </div>
                </div>
                {viewMode === 'overview' && (
                  <div className="text-sm text-gray-600">
                    {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} shown
                  </div>
                )}
              </div>
            </div>
            
            {/* Content based on view mode */}
            {viewMode === 'overview' ? (
              <PropertiesOverview
                properties={filteredProperties}
                onSelectProperty={handleSelectPropertyFromOverview}
              />
            ) : (
              <>
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
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;