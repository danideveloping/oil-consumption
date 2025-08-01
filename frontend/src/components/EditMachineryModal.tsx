import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { machineryAPI, placesAPI, Place, Machinery } from '../services/api';
import toast from 'react-hot-toast';

interface EditMachineryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  machinery: Machinery | null;
  existingMachinery?: any[]; // Add this prop to check for duplicates
}

interface MachineryFormData {
  name: string;
  type?: string;
  place_id: number;
  capacity?: number;
  description?: string;
}

const EditMachineryModal: React.FC<EditMachineryModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  machinery,
  existingMachinery = []
}) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<MachineryFormData>();

  // Fetch places when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPlaces();
    }
  }, [isOpen]);

  // Populate form when machinery data changes
  useEffect(() => {
    if (machinery && isOpen) {
      setValue('name', machinery.name);
      setValue('type', ''); // Don't auto-populate type - keep it empty
      setValue('place_id', machinery.place_id || 0);
      setValue('capacity', machinery.capacity || 0);
      setValue('description', machinery.description || '');
    }
  }, [machinery, isOpen, setValue]);

  const fetchPlaces = async () => {
    try {
      setLoadingPlaces(true);
      const response = await placesAPI.getAll();
      setPlaces(response.data || []);
    } catch (error) {
      console.error('Error fetching places:', error);
      toast.error('Failed to load places');
    } finally {
      setLoadingPlaces(false);
    }
  };

  const onSubmit = async (data: MachineryFormData) => {
    if (!machinery) return;

    try {
      // Clean up the data - remove empty strings and convert to proper types
      const cleanData = {
        name: data.name,
        type: data.type || null,
        place_id: Number(data.place_id),
        capacity: data.capacity || null,
        description: data.description || null
      };

      // Check for duplicate machinery at the same location (excluding current machinery)
      const selectedPlace = places.find(place => place.id === cleanData.place_id);
      const isDuplicate = existingMachinery.some(existingMachinery => 
        existingMachinery.id !== machinery.id && // Exclude current machinery being edited
        existingMachinery.name.toLowerCase() === cleanData.name.toLowerCase() && 
        existingMachinery.place_id === cleanData.place_id
      );

      if (isDuplicate) {
        toast.error(`A machinery with the name "${cleanData.name}" already exists at "${selectedPlace?.name}". Please choose a different name or location.`);
        return;
      }

      await machineryAPI.update(machinery.id, cleanData);
      toast.success('Machinery updated successfully!');
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating machinery:', error);
      toast.error(error.response?.data?.message || 'Failed to update machinery');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen || !machinery) return null;

  const machineryTypes = [
    'Heavy Equipment',
    'Lifting Equipment',
    'Power Generation',
    'Transportation',
    'Construction Equipment',
    'Agricultural Equipment',
    'Other'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Machinery</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Machinery Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Machinery Name *
            </label>
            <input
              type="text"
              id="name"
              className="input w-full"
              placeholder="e.g., Excavator #3, Generator #1"
              {...register('name', {
                required: 'Machinery name is required',
                minLength: {
                  value: 2,
                  message: 'Machinery name must be at least 2 characters'
                }
              })}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Machinery Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="type"
              className="input w-full"
              {...register('type')}
            >
              <option value="">Select machinery type</option>
              {machineryTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
            )}
          </div>

          {/* Place */}
          <div>
            <label htmlFor="place_id" className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            {loadingPlaces ? (
              <div className="input w-full bg-gray-50 flex items-center justify-center">
                Loading places...
              </div>
            ) : (
              <select
                id="place_id"
                className="input w-full"
                {...register('place_id', {
                  required: 'Please select a location'
                })}
              >
                <option value="">Select location</option>
                {places.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.name} {place.location ? `(${place.location})` : ''}
                  </option>
                ))}
              </select>
            )}
            {errors.place_id && (
              <p className="text-red-500 text-sm mt-1">{errors.place_id.message}</p>
            )}
          </div>

          {/* Capacity */}
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
              Oil Capacity (Litres)
            </label>
            <input
              type="number"
              id="capacity"
              step="0.1"
              min="0"
              className="input w-full"
              placeholder="e.g., 50.5"
              {...register('capacity', {
                min: {
                  value: 0,
                  message: 'Capacity must be positive'
                },
                valueAsNumber: true
              })}
            />
            {errors.capacity && (
              <p className="text-red-500 text-sm mt-1">{errors.capacity.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="input w-full resize-none"
              placeholder="Additional details about this machinery..."
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
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn btn-primary"
              disabled={isSubmitting || loadingPlaces}
            >
              {isSubmitting ? 'Updating...' : 'Update Machinery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMachineryModal; 