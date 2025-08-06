import { supabase } from '../utils/supabase';

export const dataService = {
  // Fetch all properties with their zones
  async getProperties() {
    try {
      // Get properties
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('*')
        .order('name');

      if (propError) throw propError;

      // Get zones for all properties
      const { data: zones, error: zonesError } = await supabase
        .from('zones')
        .select('*')
        .order('name');

      if (zonesError) throw zonesError;

      // Get zone history
      const { data: history, error: historyError } = await supabase
        .from('zone_history')
        .select('*')
        .order('changed_at', { ascending: false });

      if (historyError) throw historyError;

      // Combine data
      const propertiesWithZones = properties.map(property => {
        const propertyZones = zones.filter(zone => zone.property_id === property.id);
        
        // Add history to each zone
        const zonesWithHistory = propertyZones.map(zone => {
          const zoneHistory = history.filter(h => h.zone_id === zone.id);
          return {
            ...zone,
            history: zoneHistory.map(h => ({
              changed_by: h.changed_by,
              changed_at: new Date(h.changed_at).toLocaleDateString('en-US'),
              changes: h.changes,
              note: h.note
            }))
          };
        });

        return {
          ...property,
          zones: zonesWithHistory
        };
      });

      return propertiesWithZones;
    } catch (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
  },

  // Update property details
  async updateProperty(propertyId, updates) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update({ ...updates, updated_at: new Date() })
        .eq('id', propertyId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating property:', error);
      return null;
    }
  },

  // Update zone
  async updateZone(zoneId, updates, changeNote, currentUser) {
    try {
      // Update the zone
      const { data: zoneData, error: zoneError } = await supabase
        .from('zones')
        .update({
          ...updates,
          last_adjusted_by: currentUser?.name || 'Unknown User',
          last_adjusted_at: new Date().toISOString().split('T')[0],
          updated_at: new Date()
        })
        .eq('id', zoneId)
        .select();

      if (zoneError) throw zoneError;

      // Add history entry
      const { error: historyError } = await supabase
        .from('zone_history')
        .insert({
          zone_id: zoneId,
          changed_by: currentUser?.name || 'Unknown User',
          changes: updates,
          note: changeNote
        });

      if (historyError) throw historyError;

      return zoneData[0];
    } catch (error) {
      console.error('Error updating zone:', error);
      return null;
    }
  },

  // Add new zone
  async addZone(propertyId, zoneData, currentUser) {
    try {
      const { data, error } = await supabase
        .from('zones')
        .insert({
          property_id: propertyId,
          ...zoneData,
          last_adjusted_by: currentUser?.name || 'Unknown User',
          last_adjusted_at: new Date().toISOString().split('T')[0]
        })
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error adding zone:', error);
      return null;
    }
  },

  // Delete zone
  async deleteZone(zoneId) {
    try {
      const { error } = await supabase
        .from('zones')
        .delete()
        .eq('id', zoneId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting zone:', error);
      return false;
    }
  },

  // Update notes
  async updateNotes(propertyId, notes) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update({ notes, updated_at: new Date() })
        .eq('id', propertyId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating notes:', error);
      return null;
    }
  },

  // Bulk update properties from CSV
  async bulkUpdateProperties(properties) {
    try {
      let updated = 0;
      let added = 0;

      for (const property of properties) {
        // Check if property exists by name
        const { data: existing } = await supabase
          .from('properties')
          .select('id')
          .eq('name', property.name)
          .single();

        if (existing) {
          // Update existing property
          const { error } = await supabase
            .from('properties')
            .update({
              ...property,
              updated_at: new Date()
            })
            .eq('id', existing.id);

          if (!error) updated++;
        } else {
          // Create new property with a placeholder address if not provided
          const { error } = await supabase
            .from('properties')
            .insert({
              ...property,
              address: property.address || property.name, // Use name as address if not provided
              created_at: new Date(),
              updated_at: new Date()
            });

          if (!error) added++;
        }
      }

      return { success: true, updated, added };
    } catch (error) {
      console.error('Error in bulk update:', error);
      return { success: false, error };
    }
  },

  // Bulk update properties from CSV with progress tracking
  async bulkUpdatePropertiesWithProgress(properties, onProgress) {
    try {
      let updated = 0;
      let added = 0;
      let current = 0;

      for (const property of properties) {
        current++;
        if (onProgress) {
          onProgress(current);
        }

        // Check if property exists by name
        const { data: existing } = await supabase
          .from('properties')
          .select('id')
          .eq('name', property.name)
          .single();

        if (existing) {
          // Update existing property
          const { error } = await supabase
            .from('properties')
            .update({
              ...property,
              updated_at: new Date()
            })
            .eq('id', existing.id);

          if (!error) updated++;
        } else {
          // Create new property with a placeholder address if not provided
          const { error } = await supabase
            .from('properties')
            .insert({
              ...property,
              address: property.address || property.name, // Use name as address if not provided
              created_at: new Date(),
              updated_at: new Date()
            });

          if (!error) added++;
        }
      }

      return { success: true, updated, added };
    } catch (error) {
      console.error('Error in bulk update:', error);
      return { success: false, error };
    }
  }
};