import { toast } from 'react-toastify';
import { csvExportService } from '@/services/csvExportService';
import salesOrdersData from '../mockData/salesOrders.json';

// Mock data storage
let salesOrders = [...salesOrdersData];

// Utility function to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generate unique order number
const generateOrderNumber = () => {
  const year = new Date().getFullYear();
  const nextId = Math.max(...salesOrders.map(so => so.Id), 0) + 1;
  return `SO-${year}-${String(nextId).padStart(3, '0')}`;
};

export const salesOrderService = {
  // Get all sales orders
  getAll: async () => {
    await delay(300);
    return [...salesOrders];
  },

  // Get sales order by ID
  getById: async (id) => {
    await delay(200);
    const salesOrder = salesOrders.find(so => so.Id === parseInt(id));
    if (!salesOrder) {
      throw new Error('Sales order not found');
    }
    return { ...salesOrder };
  },

  // Create new sales order
  create: async (salesOrderData) => {
    await delay(400);
    
    const newSalesOrder = {
      ...salesOrderData,
      Id: Date.now(),
      orderNumber: generateOrderNumber(),
      orderDate: salesOrderData.orderDate || new Date().toISOString().split('T')[0]
    };

    salesOrders.push(newSalesOrder);
    toast.success('Sales order created successfully');
    return { ...newSalesOrder };
  },

  // Update existing sales order
  update: async (id, updates) => {
    await delay(350);
    
    const index = salesOrders.findIndex(so => so.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Sales order not found');
    }

    salesOrders[index] = { ...salesOrders[index], ...updates };
    toast.success('Sales order updated successfully');
    return { ...salesOrders[index] };
  },

  // Delete sales order
  delete: async (id) => {
    await delay(250);
    
    const index = salesOrders.findIndex(so => so.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Sales order not found');
    }

    salesOrders.splice(index, 1);
    toast.success('Sales order deleted successfully');
    return true;
  },

  // Export sales orders to CSV
  exportToCsv: async (filteredOrders = null) => {
    await delay(200);
    
    const ordersToExport = filteredOrders || salesOrders;
    const csvData = ordersToExport.map(order => ({
      'Order Number': order.orderNumber,
      'Contact': order.contactId ? `Contact ${order.contactId}` : 'N/A',
      'Deal': order.dealId ? `Deal ${order.dealId}` : 'N/A',
      'Order Date': order.orderDate,
      'Status': order.status,
      'Items Count': order.items.length,
      'Subtotal': order.subtotal,
      'Tax': order.tax,
      'Total': order.total,
      'Notes': order.notes || ''
    }));

    return csvExportService.exportToCsv(csvData, 'sales-orders');
  },

  // Get sales orders by contact
  getByContact: async (contactId) => {
    await delay(300);
    return salesOrders.filter(so => so.contactId === parseInt(contactId));
  },

  // Get sales orders by deal
  getByDeal: async (dealId) => {
    await delay(300);
    return salesOrders.filter(so => so.dealId === parseInt(dealId));
  },

  // Get sales orders by status
  getByStatus: async (status) => {
    await delay(300);
    return salesOrders.filter(so => so.status === status);
  }
};