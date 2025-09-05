import { supabase } from '../utils/supabase';
import { webhookService } from './webhookService';

export const dataService = {
  // Fetch all properties with their zones and controllers
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

      // Get controllers for all properties
      const { data: controllers, error: controllersError } = await supabase
        .from('property_controllers')
        .select('*')
        .order('controller_type');

      // Handle if controllers table doesn't exist yet
      const propertyControllers = controllers || [];

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

        // Add controllers to property
        const propertyControllersList = propertyControllers.filter(c => c.property_id === property.id);

        // Convert notes to array format if it's still a string (for backward compatibility)
        let notesArray = property.notes;
        if (typeof property.notes === 'string' && property.notes) {
          notesArray = [{
            text: property.notes,
            user: 'System',
            timestamp: property.updated_at || new Date().toISOString(),
            userId: 'system'
          }];
        } else if (!property.notes) {
          notesArray = [];
        }

        return {
          ...property,
          notes: notesArray,
          zones: zonesWithHistory,
          controllers: propertyControllersList
        };
      });

      return propertiesWithZones;
    } catch (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
  },

  // Update property details (NO WEBHOOK - only for zones and notes)
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

  // Add controller to property
  async addController(propertyId, controllerData) {
    try {
      const { data, error } = await supabase
        .from('property_controllers')
        .insert({
          property_id: propertyId,
          ...controllerData,
          created_at: new Date(),
          updated_at: new Date()
        })
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error adding controller:', error);
      return null;
    }
  },

  // Update controller
  async updateController(controllerId, updates) {
    try {
      const { data, error } = await supabase
        .from('property_controllers')
        .update({
          ...updates,
          updated_at: new Date()
        })
        .eq('id', controllerId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating controller:', error);
      return null;
    }
  },

  // Delete controller
  async deleteController(controllerId) {
    try {
      const { error } = await supabase
        .from('property_controllers')
        .delete()
        .eq('id', controllerId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting controller:', error);
      return false;
    }
  },

  // Migrate existing timer_type to controllers (one-time migration)
  async migrateTimerTypes() {
    try {
      const { data: properties, error } = await supabase
        .from('properties')
        .select('id, timer_type')
        .not('timer_type', 'is', null);

      if (error) throw error;

      for (const property of properties) {
        if (property.timer_type) {
          // Check if already migrated
          const { data: existing } = await supabase
            .from('property_controllers')
            .select('id')
            .eq('property_id', property.id)
            .eq('controller_type', property.timer_type)
            .single();

          if (!existing) {
            await supabase
              .from('property_controllers')
              .insert({
                property_id: property.id,
                controller_type: property.timer_type,
                controller_location: 'Main',
                created_at: new Date(),
                updated_at: new Date()
              });
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error migrating timer types:', error);
      return { success: false, error };
    }
  },

  // Update zone with webhook notification
  async updateZone(zoneId, updates, changeNote, currentUser) {
    try {
      // First, get the zone's property information for the webhook
      const { data: zoneInfo, error: fetchError } = await supabase
        .from('zones')
        .select('*, properties(*)')
        .eq('id', zoneId)
        .single();

      if (fetchError) throw fetchError;

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

      // Send webhook notification
      await webhookService.notifyZoneChange(
        zoneInfo.properties,
        zoneData[0],
        updates,
        currentUser,
        'update'
      );

      return zoneData[0];
    } catch (error) {
      console.error('Error updating zone:', error);
      return null;
    }
  },

  // Add new zone with webhook notification
  async addZone(propertyId, zoneData, currentUser) {
    try {
      // Get property information for webhook
      const { data: property, error: propError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (propError) throw propError;

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

      // Send webhook notification
      await webhookService.notifyZoneChange(
        property,
        data[0],
        zoneData,
        currentUser,
        'create'
      );

      return data[0];
    } catch (error) {
      console.error('Error adding zone:', error);
      return null;
    }
  },

  // Delete zone with webhook notification
  async deleteZone(zoneId, currentUser) {
    try {
      // Get zone and property info before deletion
      const { data: zoneInfo, error: fetchError } = await supabase
        .from('zones')
        .select('*, properties(*)')
        .eq('id', zoneId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('zones')
        .delete()
        .eq('id', zoneId);

      if (error) throw error;

      // Send webhook notification
      await webhookService.notifyZoneChange(
        zoneInfo.properties,
        zoneInfo,
        { deleted: true },
        currentUser,
        'delete'
      );

      return true;
    } catch (error) {
      console.error('Error deleting zone:', error);
      return false;
    }
  },

  // Update notes with webhook notification
  async updateNotes(propertyId, notes) {
    try {
      // Get property info for webhook
      const { data: property, error: propError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (propError) throw propError;

      // Ensure notes is always an array
      const notesArray = Array.isArray(notes) ? notes : [];
      
      // Check if a new note was added (compare lengths)
      const existingNotesLength = Array.isArray(property.notes) ? property.notes.length : 0;
      const newNotesLength = notesArray.length;
      
      const { data, error } = await supabase
        .from('properties')
        .update({ 
          notes: notesArray, 
          updated_at: new Date() 
        })
        .eq('id', propertyId)
        .select();

      if (error) throw error;

      // If a new note was added, send webhook
      if (newNotesLength > existingNotesLength) {
        const newNote = notesArray[notesArray.length - 1];
        const user = {
          id: newNote.userId,
          name: newNote.user,
          email: 'unknown@example.com' // You might want to store email in notes
        };
        
        await webhookService.notifyNoteAdded(property, newNote, user);
      }

      return data[0];
    } catch (error) {
      console.error('Error updating notes:', error);
      return null;
    }
  },

  // Update a single note
  async updateNote(propertyId, noteIndex, updatedNote) {
    try {
      // First get the current property to access existing notes
      const { data: property, error: fetchError } = await supabase
        .from('properties')
        .select('notes')
        .eq('id', propertyId)
        .single();

      if (fetchError) throw fetchError;

      // Get current notes
      let currentNotes = property.notes || [];
      
      // Update the specific note
      if (noteIndex >= 0 && noteIndex < currentNotes.length) {
        currentNotes[noteIndex] = updatedNote;
      }

      // Update the property
      const { data, error } = await supabase
        .from('properties')
        .update({ 
          notes: currentNotes, 
          updated_at: new Date() 
        })
        .eq('id', propertyId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating note:', error);
      return null;
    }
  },

  // Delete a single note
  async deleteNote(propertyId, noteIndex) {
    try {
      // First get the current property to access existing notes
      const { data: property, error: fetchError } = await supabase
        .from('properties')
        .select('notes')
        .eq('id', propertyId)
        .single();

      if (fetchError) throw fetchError;

      // Get current notes
      let currentNotes = property.notes || [];
      
      // Remove the specific note
      if (noteIndex >= 0 && noteIndex < currentNotes.length) {
        currentNotes.splice(noteIndex, 1);
      }

      // Update the property
      const { data, error } = await supabase
        .from('properties')
        .update({ 
          notes: currentNotes, 
          updated_at: new Date() 
        })
        .eq('id', propertyId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error deleting note:', error);
      return null;
    }
  },

  // Add a single note to a property with webhook (helper method)
  async addNote(propertyId, noteText, currentUser) {
    try {
      // First get the current property to access existing notes
      const { data: property, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (fetchError) throw fetchError;

      // Handle existing notes
      let existingNotes = property.notes || [];
      
      // Convert old string format if needed
      if (typeof existingNotes === 'string' && existingNotes) {
        existingNotes = [{
          text: existingNotes,
          user: 'System',
          timestamp: new Date().toISOString(),
          userId: 'system'
        }];
      } else if (!Array.isArray(existingNotes)) {
        existingNotes = [];
      }

      // Create the new note
      const newNote = {
        text: noteText,
        user: currentUser?.name || 'Unknown User',
        timestamp: new Date().toISOString(),
        userId: currentUser?.id || 'unknown'
      };

      // Combine notes
      const updatedNotes = [...existingNotes, newNote];

      // Update the property
      const { data, error } = await supabase
        .from('properties')
        .update({ 
          notes: updatedNotes, 
          updated_at: new Date() 
        })
        .eq('id', propertyId)
        .select();

      if (error) throw error;

      // Send webhook notification for new note
      await webhookService.notifyNoteAdded(property, newNote, currentUser);

      return data[0];
    } catch (error) {
      console.error('Error adding note:', error);
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
          .select('id, notes')
          .eq('name', property.name)
          .single();

        if (existing) {
          // Preserve existing notes when updating
          const updateData = { ...property };
          
          // If the existing property has notes and the CSV doesn't include notes,
          // preserve the existing notes
          if (!property.notes && existing.notes) {
            updateData.notes = existing.notes;
          } else if (property.notes && typeof property.notes === 'string') {
            // Convert string notes from CSV to array format
            updateData.notes = [{
              text: property.notes,
              user: 'CSV Import',
              timestamp: new Date().toISOString(),
              userId: 'csv-import'
            }];
          }
          
          // Update existing property
          const { error } = await supabase
            .from('properties')
            .update({
              ...updateData,
              updated_at: new Date()
            })
            .eq('id', existing.id);

          if (!error) updated++;
        } else {
          // Handle notes for new properties
          const insertData = { ...property };
          
          if (property.notes && typeof property.notes === 'string') {
            // Convert string notes to array format
            insertData.notes = [{
              text: property.notes,
              user: 'CSV Import',
              timestamp: new Date().toISOString(),
              userId: 'csv-import'
            }];
          } else if (!property.notes) {
            insertData.notes = [];
          }
          
          // Create new property with a placeholder address if not provided
          const { error } = await supabase
            .from('properties')
            .insert({
              ...insertData,
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
          .select('id, notes')
          .eq('name', property.name)
          .single();

        if (existing) {
          // Preserve existing notes when updating
          const updateData = { ...property };
          
          // If the existing property has notes and the CSV doesn't include notes,
          // preserve the existing notes
          if (!property.notes && existing.notes) {
            updateData.notes = existing.notes;
          } else if (property.notes && typeof property.notes === 'string') {
            // Convert string notes from CSV to array format
            updateData.notes = [{
              text: property.notes,
              user: 'CSV Import',
              timestamp: new Date().toISOString(),
              userId: 'csv-import'
            }];
          }
          
          // Update existing property
          const { error } = await supabase
            .from('properties')
            .update({
              ...updateData,
              updated_at: new Date()
            })
            .eq('id', existing.id);

          if (!error) updated++;
        } else {
          // Handle notes for new properties
          const insertData = { ...property };
          
          if (property.notes && typeof property.notes === 'string') {
            // Convert string notes to array format
            insertData.notes = [{
              text: property.notes,
              user: 'CSV Import',
              timestamp: new Date().toISOString(),
              userId: 'csv-import'
            }];
          } else if (!property.notes) {
            insertData.notes = [];
          }
          
          // Create new property with a placeholder address if not provided
          const { error } = await supabase
            .from('properties')
            .insert({
              ...insertData,
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