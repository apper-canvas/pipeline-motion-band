import React, { useState, useEffect } from 'react';
import SearchBar from '@/components/molecules/SearchBar';
import FilterDropdown from '@/components/molecules/FilterDropdown';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import ErrorView from '@/components/ui/ErrorView';
import Empty from '@/components/ui/Empty';
import CompanyDetailModal from '@/components/organisms/CompanyDetailModal';
import QuickAddModal from '@/components/organisms/QuickAddModal';
import ApperIcon from '@/components/ApperIcon';
import { companyService } from '@/services/api/companyService';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Load companies data
  const loadCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await companyService.getAll();
      setCompanies(data);
      setFilteredCompanies(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading companies:', err);
    } finally {
      setLoading(false);
    }
  };

  // Export companies to CSV
  const handleExportCompanies = async () => {
    if (filteredCompanies.length === 0) {
      toast.warning('No companies to export');
      return;
    }
    await companyService.exportToCsv(filteredCompanies);
  };

  // Handle quick add company
  const handleAddCompany = () => {
    setShowQuickAdd(true);
  };

  // Filter companies based on search and tag
  const filterCompanies = async () => {
    try {
      const data = await companyService.getAll(searchTerm, selectedTag);
      setFilteredCompanies(data);
    } catch (err) {
      console.error('Error filtering companies:', err);
    }
  };

  // Handle company click
  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
    setShowDetailModal(true);
  };

  // Handle delete company
  const handleDeleteCompany = async (companyId) => {
    if (!confirm('Are you sure you want to delete this company?')) {
      return;
    }

    const success = await companyService.delete(companyId);
    if (success) {
      await loadCompanies();
    }
  };

  // Get unique tags for filter dropdown
  const getUniqueTags = () => {
    const allTags = companies
      .map(company => company.Tags)
      .filter(Boolean)
      .flatMap(tags => tags.split(',').map(tag => tag.trim()));
    return [...new Set(allTags)];
  };

  // Load companies on component mount
  useEffect(() => {
    loadCompanies();
  }, []);

  // Filter companies when search term or tag changes
  useEffect(() => {
    filterCompanies();
  }, [searchTerm, selectedTag]);

  if (loading) {
    return <Loading type="page" />;
  }

  if (error) {
    return <ErrorView error={error} onRetry={loadCompanies} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600 mt-1">Manage your company relationships</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleExportCompanies}
            disabled={filteredCompanies.length === 0}
            className="hidden sm:flex"
          >
            <ApperIcon name="Download" className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddCompany}>
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Company
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search companies..."
            className="w-full"
          />
        </div>
        <div className="sm:w-48">
          <FilterDropdown
            label="Filter by Tag"
            options={[
              { label: 'All Tags', value: '' },
              ...getUniqueTags().map(tag => ({ label: tag, value: tag }))
            ]}
            value={selectedTag}
            onChange={setSelectedTag}
          />
        </div>
      </div>

      {/* Companies Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredCompanies.length} of {companies.length} companies
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCompanies}
          disabled={filteredCompanies.length === 0}
          className="sm:hidden"
        >
          <ApperIcon name="Download" className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Companies List */}
      {filteredCompanies.length === 0 ? (
        <Empty
          title="No companies found"
          description="Start by adding your first company or adjust your search filters."
          actionLabel="Add Company"
          onAction={handleAddCompany}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCompanies.map((company) => (
                  <tr 
                    key={company.Id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleCompanyClick(company)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-primary text-white flex items-center justify-center text-sm font-medium">
                            <ApperIcon name="Building" className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {company.Name}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {company.address_c || 'No address'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {company.email_c && (
                          <div className="text-sm text-gray-900 flex items-center">
                            <ApperIcon name="Mail" className="w-4 h-4 mr-2 text-gray-400" />
                            {company.email_c}
                          </div>
                        )}
                        {company.phone_c && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <ApperIcon name="Phone" className="w-4 h-4 mr-2 text-gray-400" />
                            {company.phone_c}
                          </div>
                        )}
                        {!company.email_c && !company.phone_c && (
                          <div className="text-sm text-gray-400">No contact info</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
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
                    </td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {company.CreatedOn ? format(new Date(company.CreatedOn), 'MMM d, yyyy') : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {company.CreatedBy?.Name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompanyClick(company);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <ApperIcon name="Eye" className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCompany(company.Id);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <ApperIcon name="Trash2" className="w-4 h-4" />
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

      {/* Company Detail Modal */}
      {showDetailModal && (
        <CompanyDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          company={selectedCompany}
          onUpdate={loadCompanies}
        />
      )}

{/* Quick Add Modal */}
      {showQuickAdd && (
        <QuickAddModal
          isOpen={showQuickAdd}
          onClose={() => setShowQuickAdd(false)}
          onSuccess={loadCompanies}
          type="company"
        />
      )}
    </div>
  );
}