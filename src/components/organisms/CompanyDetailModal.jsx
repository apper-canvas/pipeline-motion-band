import React, { useState, useEffect } from 'react';
import Modal from '@/components/molecules/Modal';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import ErrorView from '@/components/ui/ErrorView';
import ApperIcon from '@/components/ApperIcon';
import { companyService } from '@/services/api/companyService';
import { contactService } from '@/services/api/contactService';
import { dealService } from '@/services/api/dealService';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

export default function CompanyDetailModal({ isOpen, onClose, company, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [relatedContacts, setRelatedContacts] = useState([]);
  const [relatedDeals, setRelatedDeals] = useState([]);

  // Initialize form data when company changes
  useEffect(() => {
    if (company) {
      setFormData({
        Name: company.Name || '',
        email_c: company.email_c || '',
        phone_c: company.phone_c || '',
        address_c: company.address_c || '',
        Tags: company.Tags || ''
      });
    }
  }, [company]);

  // Load related data when modal opens
  useEffect(() => {
    if (isOpen && company) {
      loadRelatedData();
    }
  }, [isOpen, company]);

  const loadRelatedData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load contacts associated with this company
      const allContacts = await contactService.getAll();
      const companyContacts = allContacts.filter(contact => 
        contact.company_c === company.Name
      );
      setRelatedContacts(companyContacts);

      // Load deals associated with these contacts
      const allDeals = await dealService.getAll();
      const contactIds = companyContacts.map(contact => contact.Id);
      const companyDeals = allDeals.filter(deal => 
        contactIds.includes(deal.contact_id_c?.Id || deal.contact_id_c)
      );
      setRelatedDeals(companyDeals);

    } catch (err) {
      setError('Failed to load related data');
      console.error('Error loading related data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedCompany = await companyService.update(company.Id, formData);
      if (updatedCompany) {
        setIsEditing(false);
        toast.success('Company updated successfully');
        onUpdate();
        onClose();
      }
    } catch (err) {
      console.error('Error saving company:', err);
      toast.error('Failed to save company');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      Name: company.Name || '',
      email_c: company.email_c || '',
      phone_c: company.phone_c || '',
      address_c: company.address_c || '',
      Tags: company.Tags || ''
    });
    setIsEditing(false);
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStageColor = (stage) => {
    const colors = {
      'lead': 'default',
      'qualified': 'info', 
      'proposal': 'warning',
      'negotiation': 'primary',
      'closed-won': 'success',
      'closed-lost': 'error'
    };
    return colors[stage] || 'default';
  };

  if (!company) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-lg bg-primary text-white flex items-center justify-center">
            <ApperIcon name="Building" className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{company.Name}</h2>
            <p className="text-gray-500">Company Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <ApperIcon name="Edit" className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} loading={saving}>
                <ApperIcon name="Save" className="w-4 h-4 mr-2" />
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorView error={error} onRetry={loadRelatedData} />
      ) : (
        <div className="space-y-6">
          {/* Company Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              {isEditing ? (
                <Input
                  value={formData.Name}
                  onChange={(e) => handleInputChange('Name', e.target.value)}
                  placeholder="Company name"
                />
              ) : (
                <p className="text-sm text-gray-900">{company.Name || 'Not specified'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.email_c}
                  onChange={(e) => handleInputChange('email_c', e.target.value)}
                  placeholder="company@example.com"
                />
              ) : (
                <p className="text-sm text-gray-900">{company.email_c || 'Not specified'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              {isEditing ? (
                <Input
                  value={formData.phone_c}
                  onChange={(e) => handleInputChange('phone_c', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              ) : (
                <p className="text-sm text-gray-900">{company.phone_c || 'Not specified'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              {isEditing ? (
                <Input
                  value={formData.Tags}
                  onChange={(e) => handleInputChange('Tags', e.target.value)}
                  placeholder="tag1, tag2, tag3"
                />
              ) : (
                <div className="flex flex-wrap gap-1">
                  {company.Tags ? 
                    company.Tags.split(',').map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag.trim()}
                      </Badge>
                    )) : 
                    <span className="text-sm text-gray-400">No tags</span>
                  }
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              {isEditing ? (
                <textarea
                  value={formData.address_c}
                  onChange={(e) => handleInputChange('address_c', e.target.value)}
                  placeholder="Company address"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              ) : (
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {company.address_c || 'Not specified'}
                </p>
              )}
            </div>
          </div>

          {/* Related Contacts */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <ApperIcon name="Users" className="w-5 h-5 mr-2" />
              Related Contacts ({relatedContacts.length})
            </h3>
            {relatedContacts.length > 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {relatedContacts.map((contact) => (
                  <div key={contact.Id} className="flex items-center justify-between bg-white p-3 rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <ApperIcon name="User" className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{contact.Name}</p>
                        <p className="text-xs text-gray-500">{contact.email_c}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{contact.position_c}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No related contacts found.</p>
            )}
          </div>

          {/* Related Deals */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <ApperIcon name="DollarSign" className="w-5 h-5 mr-2" />
              Related Deals ({relatedDeals.length})
            </h3>
            {relatedDeals.length > 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {relatedDeals.map((deal) => (
                  <div key={deal.Id} className="flex items-center justify-between bg-white p-3 rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <ApperIcon name="DollarSign" className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{deal.title_c}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(deal.value_c)}</p>
                      </div>
                    </div>
                    <Badge variant={getStageColor(deal.stage_c)}>
                      {deal.stage_c?.replace('-', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No related deals found.</p>
            )}
          </div>

          {/* System Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created On
              </label>
              <p className="text-sm text-gray-900">
                {company.CreatedOn ? format(new Date(company.CreatedOn), 'MMM d, yyyy h:mm a') : 'Unknown'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modified On
              </label>
              <p className="text-sm text-gray-900">
                {company.ModifiedOn ? format(new Date(company.ModifiedOn), 'MMM d, yyyy h:mm a') : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}