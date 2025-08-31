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
      toast.success('Makineri u fshi me sukses!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error deleting machinery:', error);
      toast.error(error.response?.data?.message || 'Dështoi fshirja e makinerisë');
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
          <h2 className="text-xl font-semibold text-gray-900">Fshi Makineri</h2>
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
              A jeni të sigurt që dëshironi ta fshini këtë makineri?
            </h3>
            <p className="text-gray-600 mb-4">
              Ky veprim nuk mund të anulohet. Të gjitha të dhënat e konsumit të naftës që lidhen me këtë makineri do të fshihen gjithashtu.
            </p>
            
            {/* Machinery Details */}
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <div className="font-medium text-gray-900">{machinery.name}</div>
              <div className="text-sm text-gray-600">
                Tipi: {machinery.type}
              </div>
              {machinery.place_name && (
                <div className="text-sm text-gray-600">
                  Vendndodhja: {machinery.place_name}
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
              Anulo
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 btn bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? 'Duke fshirë...' : 'Fshi Makineri'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteMachineryModal; 