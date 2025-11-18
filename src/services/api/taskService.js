import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

export const taskService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      const response = await apperClient.fetchRecords('tasks_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map(task => ({
        Id: task.Id,
        title: task.title_c || task.Name || '',
        description: task.description_c || '',
        dueDate: task.due_date_c,
        completed: task.completed_c || false,
        priority: task.priority_c || 'medium',
        status: task.status_c || 'not-started',
        contactId: task.contact_id_c?.Id || task.contact_id_c,
        dealId: task.deal_id_c?.Id || task.deal_id_c,
        createdAt: task.CreatedOn
      }));
} catch (error) {
      console.error("Error fetching tasks:", error?.response?.data?.message || error?.message || 'Unknown error');
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      const response = await apperClient.getRecordById('tasks_c', id, {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      });

      if (!response?.data) {
        throw new Error("Task not found");
      }

      const task = response.data;
      return {
        Id: task.Id,
        title: task.title_c || task.Name || '',
        description: task.description_c || '',
        dueDate: task.due_date_c,
        completed: task.completed_c || false,
        priority: task.priority_c || 'medium',
        status: task.status_c || 'not-started',
        contactId: task.contact_id_c?.Id || task.contact_id_c,
        dealId: task.deal_id_c?.Id || task.deal_id_c,
        createdAt: task.CreatedOn
      };
    } catch (error) {
console.error(`Error fetching task ${id}:`, error?.response?.data?.message || error?.message || 'Unknown error');
      throw new Error("Task not found");
    }
  },

  async getByContactId(contactId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      const response = await apperClient.fetchRecords('tasks_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [{
          "FieldName": "contact_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(contactId)]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map(task => ({
        Id: task.Id,
        title: task.title_c || task.Name || '',
        description: task.description_c || '',
        dueDate: task.due_date_c,
        completed: task.completed_c || false,
        priority: task.priority_c || 'medium',
        status: task.status_c || 'not-started',
        contactId: task.contact_id_c?.Id || task.contact_id_c,
        dealId: task.deal_id_c?.Id || task.deal_id_c,
        createdAt: task.CreatedOn
      }));
} catch (error) {
      console.error("Error fetching tasks by contact:", error?.response?.data?.message || error?.message || 'Unknown error');
      return [];
    }
  },

  async getByDealId(dealId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      const response = await apperClient.fetchRecords('tasks_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [{
          "FieldName": "deal_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(dealId)]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map(task => ({
        Id: task.Id,
        title: task.title_c || task.Name || '',
        description: task.description_c || '',
        dueDate: task.due_date_c,
        completed: task.completed_c || false,
        priority: task.priority_c || 'medium',
        status: task.status_c || 'not-started',
        contactId: task.contact_id_c?.Id || task.contact_id_c,
        dealId: task.deal_id_c?.Id || task.deal_id_c,
        createdAt: task.CreatedOn
      }));
    } catch (error) {
console.error("Error fetching tasks by deal:", error?.response?.data?.message || error?.message || 'Unknown error');
      return [];
    }
  },

  async getDueTasks() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      const today = new Date().toISOString().split('T')[0];

      const response = await apperClient.fetchRecords('tasks_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [
          {
            "FieldName": "completed_c",
            "Operator": "EqualTo",
            "Values": [false]
          },
          {
            "FieldName": "due_date_c",
            "Operator": "LessThanOrEqualTo",
            "Values": [today]
          }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map(task => ({
        Id: task.Id,
        title: task.title_c || task.Name || '',
        description: task.description_c || '',
        dueDate: task.due_date_c,
        completed: task.completed_c || false,
        priority: task.priority_c || 'medium',
        status: task.status_c || 'not-started',
        contactId: task.contact_id_c?.Id || task.contact_id_c,
        dealId: task.deal_id_c?.Id || task.deal_id_c,
        createdAt: task.CreatedOn
      }));
    } catch (error) {
console.error("Error fetching due tasks:", error?.response?.data?.message || error?.message || 'Unknown error');
      return [];
    }
  },

  async getOverdueTasks() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      const today = new Date().toISOString().split('T')[0];

      const response = await apperClient.fetchRecords('tasks_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [
          {
            "FieldName": "completed_c",
            "Operator": "EqualTo",
            "Values": [false]
          },
          {
            "FieldName": "due_date_c",
            "Operator": "LessThan",
            "Values": [today]
          }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map(task => ({
        Id: task.Id,
        title: task.title_c || task.Name || '',
        description: task.description_c || '',
        dueDate: task.due_date_c,
        completed: task.completed_c || false,
        priority: task.priority_c || 'medium',
        status: task.status_c || 'not-started',
        contactId: task.contact_id_c?.Id || task.contact_id_c,
        dealId: task.deal_id_c?.Id || task.deal_id_c,
        createdAt: task.CreatedOn
      }));
    } catch (error) {
console.error("Error fetching overdue tasks:", error?.response?.data?.message || error?.message || 'Unknown error');
      return [];
    }
  },

async create(taskData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      // Sanitize taskData to prevent circular references
      const sanitizeValue = (value) => {
        if (value === null || value === undefined) return value;
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
        if (typeof value === 'object') {
          // Handle DOM elements or React synthetic events
          if (value.target) return value.target.value;
          if (value.value !== undefined) return value.value;
          // Convert objects to string to avoid circular refs
          return String(value);
        }
        return value;
      };

      // Clean the data before creating the record
      const cleanData = {
        title: sanitizeValue(taskData.title),
        description: sanitizeValue(taskData.description) || '',
        dueDate: sanitizeValue(taskData.dueDate),
        completed: Boolean(sanitizeValue(taskData.completed)),
        priority: sanitizeValue(taskData.priority) || 'medium',
        status: sanitizeValue(taskData.status) || 'not-started',
        contactId: sanitizeValue(taskData.contactId),
        dealId: sanitizeValue(taskData.dealId)
      };

      const params = {
        records: [{
          Name: cleanData.title,
          title_c: cleanData.title,
          description_c: cleanData.description,
          due_date_c: cleanData.dueDate,
          completed_c: cleanData.completed,
          priority_c: cleanData.priority,
          status_c: cleanData.status,
          contact_id_c: cleanData.contactId ? parseInt(cleanData.contactId) : null,
          deal_id_c: cleanData.dealId ? parseInt(cleanData.dealId) : null
        }]
      };

      const response = await apperClient.createRecord('tasks_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} tasks:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => {
              const errorMsg = typeof error === 'string' ? error : error?.message || 'Validation error';
              const fieldLabel = error?.fieldLabel || 'Field';
              toast.error(`${fieldLabel}: ${errorMsg}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const createdTask = successful[0].data;
          return {
            Id: createdTask.Id,
            title: createdTask.title_c || createdTask.Name || '',
            description: createdTask.description_c || '',
            dueDate: createdTask.due_date_c,
            completed: createdTask.completed_c || false,
            priority: createdTask.priority_c || 'medium',
            status: createdTask.status_c || 'not-started',
            contactId: createdTask.contact_id_c?.Id || createdTask.contact_id_c,
            dealId: createdTask.deal_id_c?.Id || createdTask.deal_id_c,
            createdAt: createdTask.CreatedOn
          };
        }
      }
    } catch (error) {
      console.error("Error creating task:", error?.response?.data?.message || error?.message || 'Unknown error');
      throw new Error(error?.response?.data?.message || error?.message || 'Failed to create task');
    }
  },

  async update(id, taskData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      const updateFields = {};
      if (taskData.title !== undefined) {
        updateFields.Name = taskData.title;
        updateFields.title_c = taskData.title;
      }
      if (taskData.description !== undefined) updateFields.description_c = taskData.description;
      if (taskData.dueDate !== undefined) updateFields.due_date_c = taskData.dueDate;
      if (taskData.completed !== undefined) updateFields.completed_c = taskData.completed;
      if (taskData.priority !== undefined) updateFields.priority_c = taskData.priority;
      if (taskData.status !== undefined) updateFields.status_c = taskData.status;
      if (taskData.contactId !== undefined) updateFields.contact_id_c = taskData.contactId ? parseInt(taskData.contactId) : null;
      if (taskData.dealId !== undefined) updateFields.deal_id_c = taskData.dealId ? parseInt(taskData.dealId) : null;

      const params = {
        records: [{
          Id: parseInt(id),
          ...updateFields
        }]
      };

      const response = await apperClient.updateRecord('tasks_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} tasks:`, failed);
failed.forEach(record => {
            record.errors?.forEach(error => {
              const errorMsg = typeof error === 'string' ? error : error?.message || 'Validation error';
              const fieldLabel = error?.fieldLabel || 'Field';
              toast.error(`${fieldLabel}: ${errorMsg}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const updatedTask = successful[0].data;
          return {
            Id: updatedTask.Id,
            title: updatedTask.title_c || updatedTask.Name || '',
            description: updatedTask.description_c || '',
            dueDate: updatedTask.due_date_c,
            completed: updatedTask.completed_c || false,
            priority: updatedTask.priority_c || 'medium',
            status: updatedTask.status_c || 'not-started',
            contactId: updatedTask.contact_id_c?.Id || updatedTask.contact_id_c,
            dealId: updatedTask.deal_id_c?.Id || updatedTask.deal_id_c,
            createdAt: updatedTask.CreatedOn
          };
        }
      }
    } catch (error) {
console.error("Error updating task:", error?.response?.data?.message || error?.message || 'Unknown error');
      throw new Error(error?.response?.data?.message || error?.message || 'Failed to update task');
    }
  },

  async toggleComplete(id) {
    try {
      // Get current task first
      const currentTask = await this.getById(id);
      return await this.update(id, { completed: !currentTask.completed });
    } catch (error) {
console.error("Error toggling task completion:", error?.response?.data?.message || error?.message || 'Unknown error');
      throw new Error(error?.response?.data?.message || error?.message || 'Failed to toggle task completion');
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

      const response = await apperClient.deleteRecord('tasks_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} tasks:`, failed);
failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        return successful.length === 1;
      }
      return true;
    } catch (error) {
      console.error("Error deleting task:", error?.response?.data?.message || error);
throw new Error(error?.response?.data?.message || error?.message || 'Failed to delete task');
    }
  },

  async getTaskStats() {
    try {
      const tasks = await this.getAll();
      
      const total = tasks.length;
      const completed = tasks.filter(t => t.completed).length;
      const overdue = tasks.filter(t => {
        const today = new Date().toISOString().split('T')[0];
        return !t.completed && t.dueDate && t.dueDate < today;
      }).length;
      const dueToday = tasks.filter(t => {
        const today = new Date().toISOString().split('T')[0];
        return !t.completed && t.dueDate === today;
      }).length;
      
      return {
        total,
        completed,
        pending: total - completed,
        overdue,
        dueToday
      };
    } catch (error) {
console.error("Error getting task stats:", error?.response?.data?.message || error?.message || 'Unknown error');
      return {
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
        dueToday: 0
      };
    }
  }
};