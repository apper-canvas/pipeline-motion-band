import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";
import { csvExportService } from "@/services/csvExportService";
import React from "react";

export const dealService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      const response = await apperClient.fetchRecords('deals_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "contact_id_c"}},
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

      return response.data.map(deal => ({
        Id: deal.Id,
        title: deal.title_c || deal.Name,
        value: deal.value_c || 0,
        stage: deal.stage_c || 'lead',
        probability: deal.probability_c || 0,
        expectedCloseDate: deal.expected_close_date_c,
        contactId: deal.contact_id_c?.Id || deal.contact_id_c,
        createdAt: deal.CreatedOn,
        updatedAt: deal.ModifiedOn
      }));
    } catch (error) {
      console.error("Error fetching deals:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      const response = await apperClient.getRecordById('deals_c', id, {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      });

      if (!response?.data) {
        throw new Error("Deal not found");
      }

      const deal = response.data;
      return {
        Id: deal.Id,
        title: deal.title_c || deal.Name,
        value: deal.value_c || 0,
        stage: deal.stage_c || 'lead',
        probability: deal.probability_c || 0,
        expectedCloseDate: deal.expected_close_date_c,
        contactId: deal.contact_id_c?.Id || deal.contact_id_c,
        createdAt: deal.CreatedOn,
        updatedAt: deal.ModifiedOn
      };
    } catch (error) {
      console.error(`Error fetching deal ${id}:`, error?.response?.data?.message || error);
      throw new Error("Deal not found");
    }
  },

  async getByContactId(contactId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      const response = await apperClient.fetchRecords('deals_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "contact_id_c"}},
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

      return response.data.map(deal => ({
        Id: deal.Id,
        title: deal.title_c || deal.Name,
        value: deal.value_c || 0,
        stage: deal.stage_c || 'lead',
        probability: deal.probability_c || 0,
        expectedCloseDate: deal.expected_close_date_c,
        contactId: deal.contact_id_c?.Id || deal.contact_id_c,
        createdAt: deal.CreatedOn,
        updatedAt: deal.ModifiedOn
      }));
    } catch (error) {
      console.error("Error fetching deals by contact:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getByStage(stage) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      const response = await apperClient.fetchRecords('deals_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [{
          "FieldName": "stage_c",
          "Operator": "EqualTo",
          "Values": [stage]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map(deal => ({
        Id: deal.Id,
        title: deal.title_c || deal.Name,
        value: deal.value_c || 0,
        stage: deal.stage_c || 'lead',
        probability: deal.probability_c || 0,
        expectedCloseDate: deal.expected_close_date_c,
        contactId: deal.contact_id_c?.Id || deal.contact_id_c,
        createdAt: deal.CreatedOn,
        updatedAt: deal.ModifiedOn
      }));
    } catch (error) {
      console.error("Error fetching deals by stage:", error?.response?.data?.message || error);
      return [];
    }
  },

  async create(dealData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      const params = {
        records: [{
          Name: dealData.title,
          title_c: dealData.title,
          value_c: parseFloat(dealData.value) || 0,
          stage_c: dealData.stage || 'lead',
          probability_c: parseInt(dealData.probability) || 0,
          expected_close_date_c: dealData.expectedCloseDate,
          contact_id_c: parseInt(dealData.contactId)
        }]
      };

      const response = await apperClient.createRecord('deals_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} deals:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const createdDeal = successful[0].data;
          return {
            Id: createdDeal.Id,
            title: createdDeal.title_c || createdDeal.Name,
            value: createdDeal.value_c || 0,
            stage: createdDeal.stage_c || 'lead',
            probability: createdDeal.probability_c || 0,
            expectedCloseDate: createdDeal.expected_close_date_c,
            contactId: createdDeal.contact_id_c?.Id || createdDeal.contact_id_c,
            createdAt: createdDeal.CreatedOn,
            updatedAt: createdDeal.ModifiedOn
          };
        }
      }
    } catch (error) {
      console.error("Error creating deal:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, dealData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not available");
      }

      const updateFields = {};
      if (dealData.title !== undefined) {
        updateFields.Name = dealData.title;
        updateFields.title_c = dealData.title;
      }
      if (dealData.value !== undefined) updateFields.value_c = parseFloat(dealData.value);
      if (dealData.stage !== undefined) updateFields.stage_c = dealData.stage;
      if (dealData.probability !== undefined) updateFields.probability_c = parseInt(dealData.probability);
      if (dealData.expectedCloseDate !== undefined) updateFields.expected_close_date_c = dealData.expectedCloseDate;
      if (dealData.contactId !== undefined) updateFields.contact_id_c = parseInt(dealData.contactId);

      const params = {
        records: [{
          Id: parseInt(id),
          ...updateFields
        }]
      };

      const response = await apperClient.updateRecord('deals_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} deals:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const updatedDeal = successful[0].data;
          return {
            Id: updatedDeal.Id,
            title: updatedDeal.title_c || updatedDeal.Name,
            value: updatedDeal.value_c || 0,
            stage: updatedDeal.stage_c || 'lead',
            probability: updatedDeal.probability_c || 0,
            expectedCloseDate: updatedDeal.expected_close_date_c,
            contactId: updatedDeal.contact_id_c?.Id || updatedDeal.contact_id_c,
            createdAt: updatedDeal.CreatedOn,
            updatedAt: updatedDeal.ModifiedOn
          };
        }
      }
    } catch (error) {
      console.error("Error updating deal:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async updateStage(id, newStage) {
    return this.update(id, { stage: newStage });
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

      const response = await apperClient.deleteRecord('deals_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} deals:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        return successful.length === 1;
      }
      return true;
    } catch (error) {
      console.error("Error deleting deal:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async getPipelineStats() {
    try {
      const deals = await this.getAll();
      
      const stats = {
        lead: { count: 0, value: 0 },
        qualified: { count: 0, value: 0 },
        proposal: { count: 0, value: 0 },
        negotiation: { count: 0, value: 0 },
        "closed-won": { count: 0, value: 0 },
        "closed-lost": { count: 0, value: 0 }
      };
      
      deals.forEach(deal => {
        if (stats[deal.stage]) {
          stats[deal.stage].count++;
          stats[deal.stage].value += deal.value || 0;
        }
      });
      
      return stats;
    } catch (error) {
      console.error("Error getting pipeline stats:", error);
      return {
        lead: { count: 0, value: 0 },
        qualified: { count: 0, value: 0 },
        proposal: { count: 0, value: 0 },
        negotiation: { count: 0, value: 0 },
        "closed-won": { count: 0, value: 0 },
        "closed-lost": { count: 0, value: 0 }
      };
    }
  },

  async exportToCSV(dealsToExport = null, contacts = []) {
    try {
      const dataToExport = dealsToExport || await this.getAll();
      
      // Helper function to get contact name
      const getContactName = (contactId) => {
        const contact = contacts.find(c => c.Id?.toString() === contactId?.toString());
        return contact ? `${contact.first_name_c || contact.firstName} ${contact.last_name_c || contact.lastName}` : 'Unknown Contact';
      };

      // Helper function to get contact company
      const getContactCompany = (contactId) => {
        const contact = contacts.find(c => c.Id?.toString() === contactId?.toString());
        return contact?.company_c || contact?.company || '';
      };

      const headers = [
        { key: 'Id', label: 'Deal ID' },
        { key: 'title', label: 'Deal Title' },
        { key: 'contactId', label: 'Contact Name', formatter: getContactName },
        { key: 'contactId', label: 'Contact Company', formatter: getContactCompany },
        { key: 'value', label: 'Deal Value', formatter: csvExportService.formatCurrency },
        { key: 'stage', label: 'Stage' },
        { key: 'probability', label: 'Probability (%)' },
        { key: 'expectedCloseDate', label: 'Expected Close Date', formatter: csvExportService.formatDate },
        { key: 'createdAt', label: 'Created Date', formatter: csvExportService.formatDate },
        { key: 'updatedAt', label: 'Last Updated', formatter: csvExportService.formatDate }
      ];

      const csvContent = csvExportService.convertToCSV(dataToExport, headers);
      const filename = `deals_export_${csvExportService.getTimestamp()}.csv`;
      
      csvExportService.downloadCSV(csvContent, filename);
    } catch (error) {
      console.error("Error exporting deals:", error);
      throw error;
    }
}
};