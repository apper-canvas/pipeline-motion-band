import { toast } from 'react-toastify';
import { csvExportService } from '@/services/csvExportService';
import { getApperClient } from '@/services/apperClient';

// Get table name from database schema
const TABLE_NAME = 'sales_order_c';

export const salesOrderService = {
  // Get all sales orders
  getAll: async () => {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "order_number_c"}},
          {"field": {"Name": "order_date_c"}},
          {"field": {"Name": "customer_id_c"}},
          {"field": {"Name": "total_amount_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "Tags"}}
        ],
        orderBy: [{"fieldName": "order_date_c", "sorttype": "DESC"}]
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching sales orders:", error?.response?.data?.message || error);
      toast.error("Failed to load sales orders");
      return [];
    }
  },

  // Get sales order by ID
  getById: async (id) => {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "order_number_c"}},
          {"field": {"Name": "order_date_c"}},
          {"field": {"Name": "customer_id_c"}},
          {"field": {"Name": "total_amount_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "Tags"}}
        ]
      };

      const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error('Sales order not found');
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching sales order ${id}:`, error?.response?.data?.message || error);
      throw new Error('Sales order not found');
    }
  },

  // Create new sales order
  create: async (salesOrderData) => {
    try {
      const apperClient = getApperClient();
      
// Prepare data with only Updateable fields and ensure Name is always present
      const recordData = {};
      recordData.Name = salesOrderData.Name || salesOrderData.order_number_c || 'New Sales Order'; // Always required
      
      // Add other fields only if they have values
      if (salesOrderData.order_number_c) recordData.order_number_c = salesOrderData.order_number_c;
      if (salesOrderData.order_date_c) recordData.order_date_c = salesOrderData.order_date_c;
      if (salesOrderData.customer_id_c) recordData.customer_id_c = parseInt(salesOrderData.customer_id_c);
      if (salesOrderData.total_amount_c !== undefined && salesOrderData.total_amount_c !== null && salesOrderData.total_amount_c !== '') {
        recordData.total_amount_c = parseFloat(salesOrderData.total_amount_c);
      }
      if (salesOrderData.status_c) recordData.status_c = salesOrderData.status_c;
      if (salesOrderData.notes_c) recordData.notes_c = salesOrderData.notes_c;
      if (salesOrderData.Tags) recordData.Tags = salesOrderData.Tags;

      const params = {
        records: [recordData]
      };

      const response = await apperClient.createRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error('Failed to create sales order');
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} sales orders:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
          throw new Error('Failed to create sales order');
        }

        if (successful.length > 0) {
          toast.success('Sales order created successfully');
          return successful[0].data;
        }
      }

      throw new Error('Failed to create sales order');
    } catch (error) {
      console.error("Error creating sales order:", error?.response?.data?.message || error);
      throw error;
    }
  },

  // Update existing sales order
  update: async (id, updates) => {
    try {
      const apperClient = getApperClient();
      
// Prepare data with only Updateable fields and ensure at least one field is updated
      const recordData = { Id: parseInt(id) };
      let hasUpdateableFields = false;
      
      if (updates.Name !== undefined) {
        recordData.Name = updates.Name || 'Updated Sales Order';
        hasUpdateableFields = true;
      }
      if (updates.order_number_c !== undefined) {
        recordData.order_number_c = updates.order_number_c;
        hasUpdateableFields = true;
      }
      if (updates.order_date_c !== undefined) {
        recordData.order_date_c = updates.order_date_c;
        hasUpdateableFields = true;
      }
      if (updates.customer_id_c !== undefined) {
        recordData.customer_id_c = updates.customer_id_c ? parseInt(updates.customer_id_c) : null;
        hasUpdateableFields = true;
      }
      if (updates.total_amount_c !== undefined) {
        recordData.total_amount_c = updates.total_amount_c ? parseFloat(updates.total_amount_c) : null;
        hasUpdateableFields = true;
      }
      if (updates.status_c !== undefined) {
        recordData.status_c = updates.status_c;
        hasUpdateableFields = true;
      }
      if (updates.notes_c !== undefined) {
        recordData.notes_c = updates.notes_c;
        hasUpdateableFields = true;
      }
      if (updates.Tags !== undefined) {
        recordData.Tags = updates.Tags;
        hasUpdateableFields = true;
      }

      // Ensure we have at least one updateable field beyond Id
      if (!hasUpdateableFields) {
        throw new Error("At least one field must be provided for update");
      }

      const params = {
        records: [recordData]
      };

      const response = await apperClient.updateRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error('Failed to update sales order');
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} sales orders:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
          throw new Error('Failed to update sales order');
        }

        if (successful.length > 0) {
          toast.success('Sales order updated successfully');
          return successful[0].data;
        }
      }

      throw new Error('Failed to update sales order');
    } catch (error) {
      console.error("Error updating sales order:", error?.response?.data?.message || error);
      throw error;
    }
  },

  // Delete sales order
  delete: async (id) => {
    try {
      const apperClient = getApperClient();
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} sales orders:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }

        if (successful.length > 0) {
          toast.success('Sales order deleted successfully');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error deleting sales order:", error?.response?.data?.message || error);
      return false;
    }
  },

  // Export sales orders to CSV
  exportToCsv: async (filteredOrders = null) => {
    try {
      let ordersToExport = filteredOrders;
      
      if (!ordersToExport) {
        ordersToExport = await salesOrderService.getAll();
      }

      const csvData = ordersToExport.map(order => ({
        'Order Number': order.order_number_c || 'N/A',
        'Customer': order.customer_id_c?.Name || 'N/A',
        'Order Date': order.order_date_c || 'N/A',
        'Status': order.status_c || 'N/A',
        'Total': order.total_amount_c || '0',
        'Notes': order.notes_c || ''
      }));

      return csvExportService.exportToCsv(csvData, 'sales-orders');
    } catch (error) {
      console.error("Error exporting sales orders:", error?.response?.data?.message || error);
      toast.error("Failed to export sales orders");
      throw error;
    }
  },

  // Get sales orders by customer
  getByCustomer: async (customerId) => {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "order_number_c"}},
          {"field": {"Name": "order_date_c"}},
          {"field": {"Name": "customer_id_c"}},
          {"field": {"Name": "total_amount_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}}
        ],
        where: [{
          "FieldName": "customer_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(customerId)]
        }]
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching sales orders by customer:", error?.response?.data?.message || error);
      return [];
    }
  },

  // Get sales orders by status
  getByStatus: async (status) => {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "order_number_c"}},
          {"field": {"Name": "order_date_c"}},
          {"field": {"Name": "customer_id_c"}},
          {"field": {"Name": "total_amount_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}}
        ],
        where: [{
          "FieldName": "status_c",
          "Operator": "EqualTo",
          "Values": [status]
        }]
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching sales orders by status:", error?.response?.data?.message || error);
      return [];
    }
  }
};