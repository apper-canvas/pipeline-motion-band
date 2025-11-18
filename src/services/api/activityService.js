import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

export const activityService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      const response = await apperClient.fetchRecords('activities_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{
          "fieldName": "timestamp_c",
          "sorttype": "DESC"
        }]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map(activity => ({
        Id: activity.Id,
        type: activity.type_c || 'note',
        subject: activity.subject_c || activity.Name || '',
        content: activity.content_c || '',
        contactId: activity.contact_id_c?.Id || activity.contact_id_c,
        dealId: activity.deal_id_c?.Id || activity.deal_id_c,
        timestamp: activity.timestamp_c || activity.CreatedOn
      }));
    } catch (error) {
      console.error("Error fetching activities:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      const response = await apperClient.getRecordById('activities_c', id, {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      });

      if (!response?.data) {
        throw new Error("Activity not found");
      }

      const activity = response.data;
      return {
        Id: activity.Id,
        type: activity.type_c || 'note',
        subject: activity.subject_c || activity.Name || '',
        content: activity.content_c || '',
        contactId: activity.contact_id_c?.Id || activity.contact_id_c,
        dealId: activity.deal_id_c?.Id || activity.deal_id_c,
        timestamp: activity.timestamp_c || activity.CreatedOn
      };
    } catch (error) {
      console.error(`Error fetching activity ${id}:`, error?.response?.data?.message || error);
      throw new Error("Activity not found");
    }
  },

  async getByContactId(contactId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      const response = await apperClient.fetchRecords('activities_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [{
          "FieldName": "contact_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(contactId)]
        }],
        orderBy: [{
          "fieldName": "timestamp_c",
          "sorttype": "DESC"
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map(activity => ({
        Id: activity.Id,
        type: activity.type_c || 'note',
        subject: activity.subject_c || activity.Name || '',
        content: activity.content_c || '',
        contactId: activity.contact_id_c?.Id || activity.contact_id_c,
        dealId: activity.deal_id_c?.Id || activity.deal_id_c,
        timestamp: activity.timestamp_c || activity.CreatedOn
      }));
    } catch (error) {
      console.error("Error fetching activities by contact:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getByDealId(dealId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      const response = await apperClient.fetchRecords('activities_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [{
          "FieldName": "deal_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(dealId)]
        }],
        orderBy: [{
          "fieldName": "timestamp_c",
          "sorttype": "DESC"
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map(activity => ({
        Id: activity.Id,
        type: activity.type_c || 'note',
        subject: activity.subject_c || activity.Name || '',
        content: activity.content_c || '',
        contactId: activity.contact_id_c?.Id || activity.contact_id_c,
        dealId: activity.deal_id_c?.Id || activity.deal_id_c,
        timestamp: activity.timestamp_c || activity.CreatedOn
      }));
    } catch (error) {
      console.error("Error fetching activities by deal:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getRecent(limit = 10) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      const response = await apperClient.fetchRecords('activities_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{
          "fieldName": "timestamp_c",
          "sorttype": "DESC"
        }],
        pagingInfo: {
          "limit": limit,
          "offset": 0
        }
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map(activity => ({
        Id: activity.Id,
        type: activity.type_c || 'note',
        subject: activity.subject_c || activity.Name || '',
        content: activity.content_c || '',
        contactId: activity.contact_id_c?.Id || activity.contact_id_c,
        dealId: activity.deal_id_c?.Id || activity.deal_id_c,
        timestamp: activity.timestamp_c || activity.CreatedOn
      }));
    } catch (error) {
      console.error("Error fetching recent activities:", error?.response?.data?.message || error);
      return [];
    }
  },

  async create(activityData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      const timestamp = activityData.timestamp || new Date().toISOString();

      const params = {
        records: [{
          Name: activityData.subject,
          type_c: activityData.type || 'note',
          subject_c: activityData.subject,
          content_c: activityData.content || '',
          contact_id_c: activityData.contactId ? parseInt(activityData.contactId) : null,
          deal_id_c: activityData.dealId ? parseInt(activityData.dealId) : null,
          timestamp_c: timestamp
        }]
      };

      const response = await apperClient.createRecord('activities_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} activities:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const createdActivity = successful[0].data;
          return {
            Id: createdActivity.Id,
            type: createdActivity.type_c || 'note',
            subject: createdActivity.subject_c || createdActivity.Name || '',
            content: createdActivity.content_c || '',
            contactId: createdActivity.contact_id_c?.Id || createdActivity.contact_id_c,
            dealId: createdActivity.deal_id_c?.Id || createdActivity.deal_id_c,
            timestamp: createdActivity.timestamp_c || createdActivity.CreatedOn
          };
        }
      }
    } catch (error) {
      console.error("Error creating activity:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, activityData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      const updateFields = {};
      if (activityData.subject !== undefined) {
        updateFields.Name = activityData.subject;
        updateFields.subject_c = activityData.subject;
      }
      if (activityData.type !== undefined) updateFields.type_c = activityData.type;
      if (activityData.content !== undefined) updateFields.content_c = activityData.content;
      if (activityData.contactId !== undefined) updateFields.contact_id_c = activityData.contactId ? parseInt(activityData.contactId) : null;
      if (activityData.dealId !== undefined) updateFields.deal_id_c = activityData.dealId ? parseInt(activityData.dealId) : null;
      if (activityData.timestamp !== undefined) updateFields.timestamp_c = activityData.timestamp;

      const params = {
        records: [{
          Id: parseInt(id),
          ...updateFields
        }]
      };

      const response = await apperClient.updateRecord('activities_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} activities:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const updatedActivity = successful[0].data;
          return {
            Id: updatedActivity.Id,
            type: updatedActivity.type_c || 'note',
            subject: updatedActivity.subject_c || updatedActivity.Name || '',
            content: updatedActivity.content_c || '',
            contactId: updatedActivity.contact_id_c?.Id || updatedActivity.contact_id_c,
            dealId: updatedActivity.deal_id_c?.Id || updatedActivity.deal_id_c,
            timestamp: updatedActivity.timestamp_c || updatedActivity.CreatedOn
          };
        }
      }
    } catch (error) {
      console.error("Error updating activity:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      const params = { 
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('activities_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} activities:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        return successful.length === 1;
      }
      return true;
    } catch (error) {
      console.error("Error deleting activity:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async getActivityStats() {
    try {
      const activities = await this.getAll();
      
      const stats = {
        total: activities.length,
        byType: {
          email: activities.filter(a => a.type === "email").length,
          call: activities.filter(a => a.type === "call").length,
          meeting: activities.filter(a => a.type === "meeting").length,
          note: activities.filter(a => a.type === "note").length
        },
        thisWeek: 0,
        thisMonth: 0
      };
      
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      activities.forEach(activity => {
        const activityDate = new Date(activity.timestamp);
        if (activityDate >= weekAgo) {
          stats.thisWeek++;
        }
        if (activityDate >= monthAgo) {
          stats.thisMonth++;
        }
      });
      
      return stats;
    } catch (error) {
      console.error("Error getting activity stats:", error);
      return {
        total: 0,
        byType: {
          email: 0,
          call: 0,
          meeting: 0,
          note: 0
        },
        thisWeek: 0,
        thisMonth: 0
      };
    }
  }
};