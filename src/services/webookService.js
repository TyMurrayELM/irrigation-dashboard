// src/services/webhookService.js

export const webhookService = {
  // Get webhook URL from environment variable
  webhookUrl: process.env.REACT_APP_WEBHOOK_URL,

  // Send webhook notification
  async sendWebhook(eventType, payload) {
    // Only send if webhook URL is configured
    if (!this.webhookUrl) {
      console.log('Webhook URL not configured, skipping webhook');
      return { success: true, skipped: true };
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any authentication headers if needed
          // 'Authorization': `Bearer ${process.env.REACT_APP_WEBHOOK_TOKEN}`
        },
        body: JSON.stringify({
          event: eventType,
          timestamp: new Date().toISOString(),
          ...payload
        })
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
      }

      console.log(`Webhook sent successfully for event: ${eventType}`);
      return { success: true, response };
    } catch (error) {
      console.error('Error sending webhook:', error);
      // Don't fail the main operation if webhook fails
      return { success: false, error };
    }
  },

  // Send zone change notification
  async notifyZoneChange(property, zone, changes, user, changeType = 'update') {
    const payload = {
      property: {
        id: property.id,
        name: property.name,
        branch: property.branch,
        region: property.region,
        account_manager: property.account_manager
      },
      zone: {
        id: zone.id,
        name: zone.name,
        type: zone.type,
        controller_id: zone.controller_id
      },
      changes: changes,
      changeType: changeType, // 'update', 'create', or 'delete'
      user: {
        id: user?.id || 'unknown',
        name: user?.name || 'Unknown User',
        email: user?.email || 'unknown@example.com'
      }
    };

    return this.sendWebhook('zone_change', payload);
  },

  // Send note addition notification
  async notifyNoteAdded(property, note, user) {
    const payload = {
      property: {
        id: property.id,
        name: property.name,
        branch: property.branch,
        region: property.region,
        account_manager: property.account_manager
      },
      note: {
        text: note.text,
        timestamp: note.timestamp,
        user: note.user
      },
      user: {
        id: user?.id || 'unknown',
        name: user?.name || 'Unknown User',
        email: user?.email || 'unknown@example.com'
      }
    };

    return this.sendWebhook('note_added', payload);
  },

  // Send property update notification
  async notifyPropertyUpdate(property, changes, user) {
    const payload = {
      property: {
        id: property.id,
        name: property.name,
        branch: property.branch,
        region: property.region,
        account_manager: property.account_manager
      },
      changes: changes,
      user: {
        id: user?.id || 'unknown',
        name: user?.name || 'Unknown User',
        email: user?.email || 'unknown@example.com'
      }
    };

    return this.sendWebhook('property_update', payload);
  },

  // Batch webhook for multiple changes
  async notifyBatchChanges(changes) {
    const payload = {
      batchSize: changes.length,
      changes: changes
    };

    return this.sendWebhook('batch_update', payload);
  }
};