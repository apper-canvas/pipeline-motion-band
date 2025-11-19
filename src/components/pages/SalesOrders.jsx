import React, { useEffect, useState } from "react";
import { salesOrderService } from "@/services/api/salesOrderService";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import FilterDropdown from "@/components/molecules/FilterDropdown";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import ErrorView from "@/components/ui/ErrorView";
import SalesOrderDetailModal from "@/components/organisms/SalesOrderDetailModal";
import QuickAddModal from "@/components/organisms/QuickAddModal";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";

const SalesOrders = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Status filter options
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    loadSalesOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [salesOrders, searchTerm, statusFilter]);

  const loadSalesOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [ordersData, contactsData, dealsData] = await Promise.all([
        salesOrderService.getAll(),
        contactService.getAll(),
        dealService.getAll()
      ]);
      
      setSalesOrders(ordersData);
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (err) {
      console.error('Error loading sales orders:', err);
      setError('Failed to load sales orders');
      setSalesOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...salesOrders];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Search filter
if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        (order.order_number_c || '').toLowerCase().includes(term) ||
        getCustomerName(order.customer_id_c).toLowerCase().includes(term) ||
        getDealName(order.dealId).toLowerCase().includes(term) ||
        (order.notes && order.notes.toLowerCase().includes(term))
      );
    }

    setFilteredOrders(filtered);
  };

const getCustomerName = (customerId) => {
    // Handle lookup field - customerId can be object with Id and Name or just ID
    if (!customerId) return 'N/A';
    
    // If it's a lookup object from database, use the Name property
    if (typeof customerId === 'object' && customerId.Name) {
      return customerId.Name;
    }
    
    // Fallback to searching in contacts array by ID
    const contact = contacts.find(c => c.Id === (typeof customerId === 'object' ? customerId.Id : customerId));
    return contact ? contact.Name || `${contact.first_name_c || ''} ${contact.last_name_c || ''}`.trim() : 'N/A';
  };

  const getDealName = (dealId) => {
    if (!dealId) return 'N/A';
    const deal = deals.find(d => d.Id === dealId);
    return deal ? deal.Name || deal.title_c : 'N/A';
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleDeleteOrder = async (orderId, e) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this sales order? This action cannot be undone.')) {
      return;
    }

    try {
      await salesOrderService.delete(orderId);
      await loadSalesOrders(); // Refresh data
    } catch (error) {
      console.error('Error deleting sales order:', error);
      toast.error('Failed to delete sales order');
    }
  };

  const handleExportOrders = async () => {
    try {
      await salesOrderService.exportToCsv(filteredOrders);
    } catch (error) {
      console.error('Error exporting sales orders:', error);
      toast.error('Failed to export sales orders');
    }
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={loadSalesOrders} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
          <p className="text-gray-600">Manage your sales orders and track fulfillment</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportOrders}
            disabled={filteredOrders.length === 0}
          >
            <ApperIcon name="Download" size={16} />
            Export
          </Button>
          <Button
            onClick={() => {
              setSelectedOrder(null);
              setShowDetailModal(true);
            }}
          >
            <ApperIcon name="Plus" size={16} />
            New Order
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search orders, contacts, or notes..."
          />
        </div>
        
        <div className="flex gap-2">
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
          />
        </div>
      </div>

      {/* Sales Orders Table */}
      {filteredOrders.length === 0 ? (
        <Empty 
          title="No sales orders found"
          description={searchTerm || statusFilter !== 'all' ? 
            'Try adjusting your search or filter criteria' : 
            'Create your first sales order to get started'
          }
          actionLabel="New Order"
          onAction={() => {
            setSelectedOrder(null);
            setShowDetailModal(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
{filteredOrders.map((order) => (
                  <tr 
                    key={order.Id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleOrderClick(order)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.order_number_c || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getCustomerName(order.customer_id_c)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getDealName(order.dealId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.order_date_c ? format(new Date(order.order_date_c), 'MMM dd, yyyy') : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusColor(order.status_c)}>
                        {order.status_c ? order.status_c.replace('-', ' ').toUpperCase() : 'DRAFT'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {/* Note: Items field not in database schema, showing placeholder */}
                        N/A
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.total_amount_c || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOrderClick(order);
                          }}
                        >
                          <ApperIcon name="Eye" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteOrder(order.Id, e)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <SalesOrderDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedOrder(null);
        }}
        salesOrder={selectedOrder}
        contacts={contacts}
        deals={deals}
        onSuccess={loadSalesOrders}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onSuccess={loadSalesOrders}
        type="sales-order"
      />
    </div>
  );
};

export default SalesOrders;