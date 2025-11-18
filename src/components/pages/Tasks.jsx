import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { format, isToday, isPast } from 'date-fns';
import { taskService } from '@/services/api/taskService';
import { contactService } from '@/services/api/contactService';
import { dealService } from '@/services/api/dealService';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';
import Select from '@/components/atoms/Select';
import Modal from '@/components/molecules/Modal';
import SearchBar from '@/components/molecules/SearchBar';
import FilterDropdown from '@/components/molecules/FilterDropdown';
import Loading from '@/components/ui/Loading';
import Empty from '@/components/ui/Empty';
import ErrorView from '@/components/ui/ErrorView';
import { cn } from '@/utils/cn';

function Tasks() {
  // State management
  const [tasks, setTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'not-started',
    contactId: '',
    dealId: ''
  });
  const [saving, setSaving] = useState(false);

  // Load initial data
  useEffect(() => {
    loadTasks();
    loadContacts();
    loadDeals();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const taskData = await taskService.getAll();
      setTasks(taskData);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      const contactData = await contactService.getAll();
      setContacts(contactData);
    } catch (err) {
      console.error('Error loading contacts:', err);
    }
  };

  const loadDeals = async () => {
    try {
      const dealData = await dealService.getAll();
      setDeals(dealData);
    } catch (err) {
      console.error('Error loading deals:', err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      setSaving(true);
      const newTask = await taskService.create(formData);
      setTasks(prev => [newTask, ...prev]);
      setShowCreateModal(false);
      resetForm();
      toast.success('Task created successfully');
    } catch (err) {
      console.error('Error creating task:', err);
      toast.error('Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      setSaving(true);
      const updatedTask = await taskService.update(editingTask.Id, formData);
      setTasks(prev => prev.map(task => 
        task.Id === editingTask.Id ? updatedTask : task
      ));
      setShowEditModal(false);
      setEditingTask(null);
      resetForm();
      toast.success('Task updated successfully');
    } catch (err) {
      console.error('Error updating task:', err);
      toast.error('Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const updatedTask = await taskService.update(task.Id, {
        completed: !task.completed
      });
      setTasks(prev => prev.map(t => 
        t.Id === task.Id ? updatedTask : t
      ));
      toast.success(updatedTask.completed ? 'Task completed' : 'Task reopened');
    } catch (err) {
      console.error('Error updating task:', err);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(task => task.Id !== taskId));
      toast.success('Task deleted successfully');
    } catch (err) {
      console.error('Error deleting task:', err);
      toast.error('Failed to delete task');
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate || '',
      priority: task.priority || 'medium',
      status: task.status || 'not-started',
      contactId: task.contactId || '',
      dealId: task.dealId || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      status: 'not-started',
      contactId: '',
      dealId: ''
    });
  };

const handleInputChange = (field, value) => {
    // Sanitize value to prevent circular references
    let sanitizedValue = value;
    
    // Handle different value types
    if (typeof value === 'object' && value !== null) {
      if (value.target) {
        // Handle synthetic events
        sanitizedValue = value.target.value;
      } else if (value.value !== undefined) {
        // Handle option objects
        sanitizedValue = value.value;
      } else {
        // Convert to string to avoid circular refs
        sanitizedValue = String(value);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));
  };

  // Filter and search logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'completed' && task.completed) ||
                         (statusFilter === 'pending' && !task.completed) ||
                         task.status === statusFilter;
    
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority) => {
    const colors = {
      high: "error",
      medium: "warning",
      low: "success"
    };
    return colors[priority] || "default";
  };

  const getStatusColor = (status, completed) => {
    if (completed) return "success";
    const colors = {
      'not-started': "default",
      'in-progress': "info", 
      'completed': "success",
      'cancelled': "error"
    };
    return colors[status] || "default";
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return 'No due date';
    const date = new Date(dueDate);
    if (isToday(date)) return 'Due today';
    if (isPast(date)) return `Overdue (${format(date, 'MMM dd')})`;
    return format(date, 'MMM dd, yyyy');
  };

  const getDueDateColor = (dueDate, completed) => {
    if (completed || !dueDate) return 'text-gray-500';
    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date)) return 'text-red-600';
    if (isToday(date)) return 'text-orange-600';
    return 'text-gray-700';
  };

  // Calculate stats
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => !t.completed && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))).length,
    dueToday: tasks.filter(t => !t.completed && isToday(new Date(t.dueDate))).length
  };

  // Status filter options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'not-started', label: 'Not Started' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Priority filter options
  const priorityOptions = [
    { value: 'all', label: 'All Priority' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  // Priority options for forms
  const prioritySelectOptions = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  // Status options for forms
  const statusSelectOptions = [
    { value: 'not-started', label: 'Not Started' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} onRetry={loadTasks} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            {stats.pending} pending • {stats.overdue} overdue • {stats.dueToday} due today
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <ApperIcon name="Plus" size={20} />
          Create Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.dueToday}</div>
          <div className="text-sm text-gray-600">Due Today</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search tasks..."
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <FilterDropdown
              label="Status"
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <FilterDropdown
              label="Priority"
              options={priorityOptions}
              value={priorityFilter}
              onChange={setPriorityFilter}
            />
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow-card">
        {filteredTasks.length === 0 ? (
          <Empty
            title="No tasks found"
            description={searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' ? 
              "No tasks match your current filters" : 
              "Get started by creating your first task"
            }
            actionLabel="Create Task"
            onAction={() => setShowCreateModal(true)}
          />
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTasks.map((task) => (
              <div key={task.Id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={cn(
                        "mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                        task.completed
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300 hover:border-green-500"
                      )}
                    >
                      {task.completed && <ApperIcon name="Check" size={12} />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={cn(
                          "font-medium text-gray-900",
                          task.completed && "line-through text-gray-500"
                        )}>
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-1">
                          <Badge variant={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge variant={getStatusColor(task.status, task.completed)}>
                            {task.completed ? 'Completed' : task.status.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {task.dueDate && (
                          <div className={cn("flex items-center gap-1", getDueDateColor(task.dueDate, task.completed))}>
                            <ApperIcon name="Calendar" size={14} />
                            {formatDueDate(task.dueDate)}
                          </div>
                        )}
                        {task.contactId && contacts.find(c => c.Id === task.contactId) && (
                          <div className="flex items-center gap-1">
                            <ApperIcon name="User" size={14} />
                            {contacts.find(c => c.Id === task.contactId)?.name}
                          </div>
                        )}
                        {task.dealId && deals.find(d => d.Id === task.dealId) && (
                          <div className="flex items-center gap-1">
                            <ApperIcon name="DollarSign" size={14} />
                            {deals.find(d => d.Id === task.dealId)?.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit task"
                    >
                      <ApperIcon name="Edit2" size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.Id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete task"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter task description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
<Select
                value={formData.priority}
                onChange={(value) => handleInputChange('priority', typeof value === 'string' ? value : value?.value || value)}
                options={prioritySelectOptions}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={formData.status}
                onChange={(value) => handleInputChange('status', value)}
                options={statusSelectOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact
              </label>
<Select
                value={formData.contactId}
                onChange={(value) => handleInputChange('contactId', typeof value === 'string' || typeof value === 'number' ? value : value?.value || value)}
                options={[
                  { value: '', label: 'No contact' },
                  ...contacts.map(contact => ({
                    value: contact.Id,
                    label: contact.name
                  }))
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deal
</label>
            <Select
              value={formData.dealId}
              onChange={(value) => handleInputChange('dealId', typeof value === 'string' || typeof value === 'number' ? value : value?.value || value)}
              options={[
                { value: '', label: 'No deal' },
                ...deals.map(deal => ({
                  value: deal.Id,
                  label: deal.name
                }))
              ]}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Task"
      >
        <form onSubmit={handleEditTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter task description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
<Select
                value={formData.priority}
                onChange={(value) => handleInputChange('priority', typeof value === 'string' ? value : value?.value || value)}
                options={prioritySelectOptions}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={formData.status}
                onChange={(value) => handleInputChange('status', value)}
                options={statusSelectOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
Contact
              </label>
              <Select
                value={formData.contactId}
                onChange={(value) => handleInputChange('contactId', typeof value === 'string' || typeof value === 'number' ? value : value?.value || value)}
                options={[
                  { value: '', label: 'No contact' },
                  ...contacts.map(contact => ({
                    value: contact.Id,
                    label: contact.name
                  }))
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deal
            </label>
<Select
              value={formData.dealId}
              onChange={(value) => handleInputChange('dealId', typeof value === 'string' || typeof value === 'number' ? value : value?.value || value)}
              options={[
                { value: '', label: 'No deal' },
                ...deals.map(deal => ({
                  value: deal.Id,
                  label: deal.name
                }))
              ]}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditModal(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Updating...' : 'Update Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Tasks;