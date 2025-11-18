import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";
import { csvExportService } from "@/services/csvExportService";

export const contactService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      const response = await apperClient.fetchRecords('contacts_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "position_c"}},
          {"field": {"Name": "Tags"}},
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

      return response.data.map(contact => ({
        Id: contact.Id,
        firstName: contact.first_name_c || '',
        lastName: contact.last_name_c || '',
        email: contact.email_c || '',
        phone: contact.phone_c || '',
        company: contact.company_c || '',
        position: contact.position_c || '',
        tags: contact.Tags ? contact.Tags.split(',').map(t => t.trim()) : [],
        createdAt: contact.CreatedOn,
        updatedAt: contact.ModifiedOn
      }));
    } catch (error) {
      console.error("Error fetching contacts:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      const response = await apperClient.getRecordById('contacts_c', id, {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "position_c"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      });

      if (!response?.data) {
        throw new Error("Contact not found");
      }

      const contact = response.data;
      return {
        Id: contact.Id,
        firstName: contact.first_name_c || '',
        lastName: contact.last_name_c || '',
        email: contact.email_c || '',
        phone: contact.phone_c || '',
        company: contact.company_c || '',
        position: contact.position_c || '',
        tags: contact.Tags ? contact.Tags.split(',').map(t => t.trim()) : [],
        createdAt: contact.CreatedOn,
        updatedAt: contact.ModifiedOn
      };
    } catch (error) {
      console.error(`Error fetching contact ${id}:`, error?.response?.data?.message || error);
      throw new Error("Contact not found");
    }
  },

  async create(contactData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      const params = {
        records: [{
          Name: `${contactData.firstName || contactData.name} ${contactData.lastName || ''}`.trim(),
          first_name_c: contactData.firstName || contactData.name?.split(' ')[0] || '',
          last_name_c: contactData.lastName || contactData.name?.split(' ').slice(1).join(' ') || '',
          email_c: contactData.email || '',
          phone_c: contactData.phone || '',
          company_c: contactData.company || '',
          position_c: contactData.position || '',
          Tags: Array.isArray(contactData.tags) ? contactData.tags.join(',') : ''
        }]
      };

      const response = await apperClient.createRecord('contacts_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} contacts:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const createdContact = successful[0].data;
          return {
            Id: createdContact.Id,
            firstName: createdContact.first_name_c || '',
            lastName: createdContact.last_name_c || '',
            email: createdContact.email_c || '',
            phone: createdContact.phone_c || '',
            company: createdContact.company_c || '',
            position: createdContact.position_c || '',
            tags: createdContact.Tags ? createdContact.Tags.split(',').map(t => t.trim()) : [],
            createdAt: createdContact.CreatedOn,
            updatedAt: createdContact.ModifiedOn
          };
        }
      }
    } catch (error) {
      console.error("Error creating contact:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, contactData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      const updateFields = {};
      if (contactData.firstName !== undefined || contactData.lastName !== undefined) {
        updateFields.Name = `${contactData.firstName || ''} ${contactData.lastName || ''}`.trim();
      }
      if (contactData.firstName !== undefined) updateFields.first_name_c = contactData.firstName;
      if (contactData.lastName !== undefined) updateFields.last_name_c = contactData.lastName;
      if (contactData.email !== undefined) updateFields.email_c = contactData.email;
      if (contactData.phone !== undefined) updateFields.phone_c = contactData.phone;
      if (contactData.company !== undefined) updateFields.company_c = contactData.company;
      if (contactData.position !== undefined) updateFields.position_c = contactData.position;
      if (contactData.tags !== undefined) {
        updateFields.Tags = Array.isArray(contactData.tags) ? contactData.tags.join(',') : contactData.tags;
      }

      const params = {
        records: [{
          Id: parseInt(id),
          ...updateFields
        }]
      };

      const response = await apperClient.updateRecord('contacts_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} contacts:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const updatedContact = successful[0].data;
          return {
            Id: updatedContact.Id,
            firstName: updatedContact.first_name_c || '',
            lastName: updatedContact.last_name_c || '',
            email: updatedContact.email_c || '',
            phone: updatedContact.phone_c || '',
            company: updatedContact.company_c || '',
            position: updatedContact.position_c || '',
            tags: updatedContact.Tags ? updatedContact.Tags.split(',').map(t => t.trim()) : [],
            createdAt: updatedContact.CreatedOn,
            updatedAt: updatedContact.ModifiedOn
          };
        }
      }
    } catch (error) {
      console.error("Error updating contact:", error?.response?.data?.message || error);
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

      const response = await apperClient.deleteRecord('contacts_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} contacts:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        return successful.length === 1;
      }
      return true;
    } catch (error) {
      console.error("Error deleting contact:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async search(query, filters = {}) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      let whereConditions = [];
      let whereGroups = [];

      // Text search
      if (query) {
        whereGroups.push({
          "operator": "OR",
          "subGroups": [
            {
              "conditions": [
                {
                  "fieldName": "first_name_c",
                  "operator": "Contains",
                  "values": [query]
                },
                {
                  "fieldName": "last_name_c", 
                  "operator": "Contains",
                  "values": [query]
                },
                {
                  "fieldName": "email_c",
                  "operator": "Contains",
                  "values": [query]
                },
                {
                  "fieldName": "company_c",
                  "operator": "Contains",
                  "values": [query]
                },
                {
                  "fieldName": "position_c",
                  "operator": "Contains",
                  "values": [query]
                },
                {
                  "fieldName": "Tags",
                  "operator": "Contains",
                  "values": [query]
                }
              ],
              "operator": "OR"
            }
          ]
        });
      }

      // Company filter
      if (filters.company && filters.company.length > 0) {
        whereConditions.push({
          "FieldName": "company_c",
          "Operator": "ExactMatch",
          "Values": filters.company,
          "Include": true
        });
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => {
          whereConditions.push({
            "FieldName": "Tags",
            "Operator": "Contains", 
            "Values": [tag],
            "Include": true
          });
        });
      }

      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "position_c"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };

      if (whereConditions.length > 0) {
        params.where = whereConditions;
      }

      if (whereGroups.length > 0) {
        params.whereGroups = whereGroups;
      }

      const response = await apperClient.fetchRecords('contacts_c', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map(contact => ({
        Id: contact.Id,
        firstName: contact.first_name_c || '',
        lastName: contact.last_name_c || '',
        email: contact.email_c || '',
        phone: contact.phone_c || '',
        company: contact.company_c || '',
        position: contact.position_c || '',
        tags: contact.Tags ? contact.Tags.split(',').map(t => t.trim()) : [],
        createdAt: contact.CreatedOn,
        updatedAt: contact.ModifiedOn
      }));
    } catch (error) {
      console.error("Error searching contacts:", error?.response?.data?.message || error);
      return [];
    }
  },

  async exportToCSV(contactsToExport = null) {
    try {
      const dataToExport = contactsToExport || await this.getAll();
      
      const headers = [
        { key: 'Id', label: 'Contact ID' },
        { key: 'firstName', label: 'First Name' },
        { key: 'lastName', label: 'Last Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'company', label: 'Company' },
        { key: 'position', label: 'Position' },
        { key: 'tags', label: 'Tags', formatter: csvExportService.formatArray },
        { key: 'createdAt', label: 'Created Date', formatter: csvExportService.formatDate },
        { key: 'updatedAt', label: 'Last Updated', formatter: csvExportService.formatDate }
      ];

      const csvContent = csvExportService.convertToCSV(dataToExport, headers);
      const filename = `contacts_export_${csvExportService.getTimestamp()}.csv`;
      
      csvExportService.downloadCSV(csvContent, filename);
    } catch (error) {
      console.error("Error exporting contacts:", error);
      throw error;
    }
  }
};