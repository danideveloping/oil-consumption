import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { machineryAPI, Machinery } from '../services/api';
import toast from 'react-hot-toast';

interface DeleteMachineryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  machinery: Machinery | null;
}

const DeleteMachineryModal: React.FC<DeleteMachineryModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  machinery 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!machinery) return;

    try {
      setIsDeleting(true);
      await machineryAPI.delete(machinery.id);
      toast.success('Machinery deleted successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error deleting machinery:', error);
      toast.error(error.response?.data?.message || 'Failed to delete machinery');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !machinery) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Delete Machinery</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning Icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          {/* Warning Message */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Are you sure you want to delete this machinery?
            </h3>
            <p className="text-gray-600 mb-4">
              This action cannot be undone. All oil consumption data associated with this machinery will also be deleted.
            </p>
            
            {/* Machinery Details */}
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <div className="font-medium text-gray-900">{machinery.name}</div>
              <div className="text-sm text-gray-600">
                Type: {machinery.type}
              </div>
              {machinery.place_name && (
                <div className="text-sm text-gray-600">
                  Location: {machinery.place_name}
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-secondary"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 btn bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Machinery'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteMachineryModal; 