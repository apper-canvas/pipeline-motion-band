import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";
import { salesOrderService } from "@/services/api/salesOrderService";
import ApperIcon from "@/components/ApperIcon";
import Modal from "@/components/molecules/Modal";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";

const SalesOrderDetailModal = ({ isOpen, onClose, salesOrder, onSuccess }) => {
  const [formData, setFormData] = useState({
    contactId: '',
    dealId: '',
    status: 'pending',
    items: [],
    notes: ''
  });
  
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({
    productName: '',
    quantity: 1,
    unitPrice: 0
  });

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (salesOrder) {
        setFormData({
          contactId: salesOrder.contactId || '',
          dealId: salesOrder.dealId || '',
          status: salesOrder.status || 'pending',
          items: salesOrder.items || [],
          notes: salesOrder.notes || ''
        });
      } else {
        setFormData({
          contactId: '',
          dealId: '',
          status: 'pending',
          items: [],
          notes: ''
        });
      }
    }
  }, [isOpen, salesOrder]);

  const loadData = async () => {
    try {
      const [contactsData, dealsData] = await Promise.all([
        contactService.getAll(),
        dealService.getAll()
      ]);
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load contacts and deals');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    if (!newItem.productName || newItem.quantity <= 0 || newItem.unitPrice <= 0) {
      toast.error('Please fill in all item details');
      return;
    }

    const item = {
      id: Date.now(),
      ...newItem,
      total: newItem.quantity * newItem.unitPrice
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));

    setNewItem({
      productName: '',
      quantity: 1,
      unitPrice: 0
    });
  };

  const removeItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === parseInt(contactId));
    return contact ? contact.Name || `${contact.first_name_c || ''} ${contact.last_name_c || ''}`.trim() : 'N/A';
  };

  const getDealName = (dealId) => {
    const deal = deals.find(d => d.Id === parseInt(dealId));
    return deal ? deal.Name || deal.title_c : 'N/A';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const validateForm = () => {
    if (!formData.contactId) {
      toast.error('Please select a contact');
      return false;
    }
    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { subtotal, tax, total } = calculateTotals();
      const orderData = {
        ...formData,
        subtotal,
        tax,
        total
      };

      if (salesOrder?.Id) {
        await salesOrderService.update(salesOrder.Id, orderData);
      } else {
        await salesOrderService.create(orderData);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving sales order:', error);
      toast.error('Failed to save sales order');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={salesOrder ? 'Edit Sales Order' : 'Create Sales Order'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Info */}
        {salesOrder && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-lg">{salesOrder.orderNumber}</h3>
              <p className="text-gray-600">
                Created: {format(new Date(salesOrder.orderDate), 'MMM dd, yyyy')}
              </p>
            </div>
            <Badge variant={getStatusColor(salesOrder.status)}>
              {salesOrder.status.replace('-', ' ').toUpperCase()}
            </Badge>
          </div>
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact *
            </label>
            <Select
              value={formData.contactId}
              onChange={(e) => handleInputChange('contactId', e.target.value)}
              className="w-full"
            >
              <option value="">Select Contact</option>
              {contacts.map(contact => (
                <option key={contact.Id} value={contact.Id}>
                  {contact.Name || `${contact.first_name_c || ''} ${contact.last_name_c || ''}`.trim()}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Associated Deal
            </label>
            <Select
              value={formData.dealId}
              onChange={(e) => handleInputChange('dealId', e.target.value)}
              className="w-full"
            >
              <option value="">Select Deal (Optional)</option>
              {deals.map(deal => (
                <option key={deal.Id} value={deal.Id}>
                  {deal.Name || deal.title_c}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <Select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full max-w-xs"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Items Section */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Order Items</h4>
          
          {/* Add New Item */}
          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <h5 className="font-medium mb-3">Add Item</h5>
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2">
                <Input
                  placeholder="Product Name"
                  value={newItem.productName}
                  onChange={(e) => setNewItem(prev => ({ ...prev, productName: e.target.value }))}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Quantity"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Unit Price"
                  min="0"
                  step="0.01"
                  value={newItem.unitPrice}
                  onChange={(e) => setNewItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                />
                <Button
                  type="button"
                  onClick={addItem}
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  <ApperIcon name="Plus" size={16} />
                </Button>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-2">
            {formData.items.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{item.productName}</div>
                  <div className="text-sm text-gray-600">
                    Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${item.total.toFixed(2)}</div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <ApperIcon name="Trash2" size={14} />
                  </Button>
                </div>
              </div>
            ))}

            {formData.items.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No items added yet
              </div>
            )}
          </div>

          {/* Order Totals */}
          {formData.items.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <div className="space-y-2 max-w-xs ml-auto">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={3}
            placeholder="Additional notes or comments..."
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
          >
            {salesOrder ? 'Update Order' : 'Create Order'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SalesOrderDetailModal;