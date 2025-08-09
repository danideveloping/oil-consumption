import React, { useState, useEffect } from 'react';
import { Plus, Settings, MapPin, Edit, Trash2 } from 'lucide-react';
import AddMachineryModal from '../components/AddMachineryModal';
import EditMachineryModal from '../components/EditMachineryModal';
import DeleteMachineryModal from '../components/DeleteMachineryModal';
import { machineryAPI, Machinery } from '../services/api';
// import toast from 'react-hot-toast';

const MachineryPage: React.FC = () => {
  const [machinery, setMachinery] = useState<Machinery[]>([]);
  // const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMachinery, setSelectedMachinery] = useState<Machinery | null>(null);



  // Load machinery data
  useEffect(() => {
    loadMachinery();
  }, []);

  const loadMachinery = async () => {
    try {
      // setIsLoading(true);
      const response = await machineryAPI.getAll();
      setMachinery(response.data || []);
    } catch (error) {
      console.error('Error loading machinery:', error);
      setMachinery([]); // Empty array if no data
    } finally {
      // setIsLoading(false);
    }
  };

  const handleAddSuccess = () => {
    loadMachinery();
  };

  const handleEditSuccess = () => {
    loadMachinery();
  };

  const handleDeleteSuccess = () => {
    loadMachinery();
  };

  const handleEdit = (machinery: Machinery) => {
    setSelectedMachinery(machinery);
    setIsEditModalOpen(true);
  };

  const handleDelete = (machinery: Machinery) => {
    setSelectedMachinery(machinery);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Machinery Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your industrial equipment and machinery</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary flex items-center justify-center w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Machinery
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Machinery</p>
              <p className="text-2xl font-bold text-gray-900">{machinery.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Settings className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{machinery.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Settings className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Capacity</p>
              <p className="text-2xl font-bold text-gray-900">
                {machinery.reduce((sum, m) => {
                  const capacity = typeof m.capacity === 'number' ? m.capacity : parseFloat(m.capacity || '0') || 0;
                  return sum + capacity;
                }, 0).toFixed(2)}L
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Machinery Table */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">All Machinery</h2>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search machinery..."
              className="input w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
          <div className="min-w-full">
            <table className="table min-w-full">
              <thead>
                <tr>
                  <th className="text-xs sm:text-sm">Name</th>
                  <th className="text-xs sm:text-sm hidden sm:table-cell">Type</th>
                  <th className="text-xs sm:text-sm">Location</th>
                  <th className="text-xs sm:text-sm hidden md:table-cell">Capacity</th>
                  <th className="text-xs sm:text-sm hidden lg:table-cell">Description</th>
                  <th className="text-xs sm:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {machinery.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="flex items-center">
                        <div className="bg-gray-100 p-1 sm:p-2 rounded-lg mr-2 sm:mr-3">
                          <Settings className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        </div>
                        <div>
                          <span className="font-medium text-xs sm:text-sm">{item.name}</span>
                          <p className="text-xs text-gray-500 sm:hidden">{item.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {item.type}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-1" />
                        <span className="text-xs sm:text-sm">{item.place_name}</span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell text-xs sm:text-sm">{item.capacity ? `${item.capacity}L` : 'N/A'}</td>
                    <td className="hidden lg:table-cell text-gray-600 text-xs sm:text-sm">{item.description}</td>
                    <td>
                      <div className="flex space-x-1 sm:space-x-2">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Machinery Modal */}
      <AddMachineryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
        existingMachinery={machinery}
      />

      {/* Edit Machinery Modal */}
      <EditMachineryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        machinery={selectedMachinery}
        existingMachinery={machinery}
      />

      {/* Delete Machinery Modal */}
      <DeleteMachineryModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleDeleteSuccess}
        machinery={selectedMachinery}
      />
    </div>
  );
};

export default MachineryPage; 