import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { placesAPI } from '../services/api';
import toast from 'react-hot-toast';

interface AddPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PlaceFormData {
  name: string;
  location: string;
  description: string;
}

const AddPlaceModal: React.FC<AddPlaceModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PlaceFormData>();

  const onSubmit = async (data: PlaceFormData) => {
    try {
      await placesAPI.create(data);
      toast.success('Vendi u shtua me sukses!');
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error adding place:', error);
      toast.error(error.response?.data?.message || 'Dështoi shtimi i vendit');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Shto Vend të Ri</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Place Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Emri i Vendit *
            </label>
            <input
              type="text"
              id="name"
              className="input w-full"
              placeholder="p.sh., Magazina A, Kantieri i Ndërtimit"
              {...register('name', {
                required: 'Emri i vendit është i detyrueshëm',
                minLength: {
                  value: 2,
                  message: 'Emri i vendit duhet të ketë të paktën 2 karaktere'
                }
              })}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Vendndodhja
            </label>
            <input
              type="text"
              id="location"
              className="input w-full"
              placeholder="p.sh., Qendra e Qytetit, Zona Industriale"
              {...register('location')}
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Përshkrimi
            </label>
            <textarea
              id="description"
              rows={3}
              className="input w-full resize-none"
              placeholder="Detaje shtesë për këtë vend..."
              {...register('description')}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 btn btn-secondary"
              disabled={isSubmitting}
            >
              Anulo
            </button>
            <button
              type="submit"
              className="flex-1 btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Duke shtuar...' : 'Shto Vend'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlaceModal; 