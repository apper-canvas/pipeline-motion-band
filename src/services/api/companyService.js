import { toast } from 'react-toastify';
import { csvExportService } from '@/services/csvExportService';
import React from 'react';
import { getApperClient } from '@/services/apperClient';

// Company service using ApperClient for companies_c table
export const companyService = {
  // Fetch all companies with search and filtering
  async getAll(searchTerm = '', tagFilter = '') {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not available');
        return [];
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "address_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "Name", "sorttype": "ASC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      // Add search filter
      if (searchTerm) {
        params.where = [{
          "FieldName": "Name",
          "Operator": "Contains",
          "Values": [searchTerm],
          "Include": true
        }];
      }

      // Add tag filter
      if (tagFilter) {
        const tagCondition = {
          "FieldName": "Tags",
          "Operator": "Contains", 
          "Values": [tagFilter],
          "Include": true
        };
        
        if (params.where) {
          params.where.push(tagCondition);
        } else {
          params.where = [tagCondition];
        }
      }

      const response = await apperClient.fetchRecords('companies_c', params);

      if (!response.success) {
        console.error('Error fetching companies:', response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching companies:', error?.response?.data?.message || error);
      return [];
    }
  },

  // Get company by ID
  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not available');
        return null;
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "address_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };

      const response = await apperClient.getRecordById('companies_c', id, params);

      if (!response.success) {
        console.error('Error fetching company:', response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching company ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  // Create new company
  async create(companyData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not available');
        return null;
      }

      // Only include Updateable fields
      const createData = {};
      if (companyData.Name) createData.Name = companyData.Name;
      if (companyData.Tags) createData.Tags = companyData.Tags;
      if (companyData.address_c) createData.address_c = companyData.address_c;
      if (companyData.phone_c) createData.phone_c = companyData.phone_c;
      if (companyData.email_c) createData.email_c = companyData.email_c;

      const params = {
        records: [createData]
      };

      const response = await apperClient.createRecord('companies_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create company: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Company created successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error creating company:', error?.response?.data?.message || error);
      toast.error('Failed to create company');
      return null;
    }
  },

  // Update company
  async update(id, companyData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not available');
        return null;
      }

      // Only include Updateable fields
      const updateData = { Id: id };
      if (companyData.Name !== undefined) updateData.Name = companyData.Name;
      if (companyData.Tags !== undefined) updateData.Tags = companyData.Tags;
      if (companyData.address_c !== undefined) updateData.address_c = companyData.address_c;
      if (companyData.phone_c !== undefined) updateData.phone_c = companyData.phone_c;
      if (companyData.email_c !== undefined) updateData.email_c = companyData.email_c;

      const params = {
        records: [updateData]
      };

      const response = await apperClient.updateRecord('companies_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update company: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Company updated successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error updating company:', error?.response?.data?.message || error);
      toast.error('Failed to update company');
      return null;
    }
  },

  // Delete company
  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not available');
        return false;
      }

      const params = {
        RecordIds: [id]
      };

      const response = await apperClient.deleteRecord('companies_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete company: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Company deleted successfully');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error deleting company:', error?.response?.data?.message || error);
      toast.error('Failed to delete company');
      return false;
    }
  },

  // Export companies to CSV
  async exportToCsv(companies) {
    try {
      const csvData = companies.map(company => ({
        'Company Name': company.Name || '',
        'Email': company.email_c || '',
        'Phone': company.phone_c || '',
        'Address': company.address_c || '',
        'Tags': company.Tags || '',
        'Created': company.CreatedOn ? new Date(company.CreatedOn).toLocaleDateString() : ''
      }));

      await csvExportService.exportData(csvData, 'companies');
      toast.success('Companies exported successfully');
    } catch (error) {
      console.error('Error exporting companies:', error);
      toast.error('Failed to export companies');
    }
  }
};