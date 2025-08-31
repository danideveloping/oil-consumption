import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { machineryAPI, placesAPI, Place } from '../services/api';
import toast from 'react-hot-toast';

interface AddMachineryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingMachinery?: any[]; // Add this prop to check for duplicates
}

interface MachineryFormData {
  name: string;
  type?: string;
  place_id: number;
  capacity?: number;
  description?: string;
}

const AddMachineryModal: React.FC<AddMachineryModalProps> = ({ isOpen, onClose, onSuccess, existingMachinery = [] }) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<MachineryFormData>();

  // Fetch places when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPlaces();
    }
  }, [isOpen]);

  const fetchPlaces = async () => {
    try {
      setLoadingPlaces(true);
      const response = await placesAPI.getAll();
      setPlaces(response.data || []);
    } catch (error) {
      console.error('Error fetching places:', error);
      toast.error('Dështoi ngarkimi i vendeve');
    } finally {
      setLoadingPlaces(false);
    }
  };

  const onSubmit = async (data: MachineryFormData) => {
    try {
      // Clean up the data - remove empty strings and convert to proper types
      const cleanData = {
        name: data.name,
        type: data.type || undefined,
        place_id: Number(data.place_id),
        capacity: data.capacity ? Number(data.capacity) : 0,
        description: data.description || undefined
      };

      // Check for duplicate machinery at the same location
      const selectedPlace = places.find(place => place.id === cleanData.place_id);
      const isDuplicate = existingMachinery.some(machinery => 
        machinery.name.toLowerCase() === cleanData.name.toLowerCase() && 
        machinery.place_id === cleanData.place_id
      );

      if (isDuplicate) {
        toast.error(`Një makineri me emrin "${cleanData.name}" ekziston tashmë në "${selectedPlace?.name}". Ju lutem zgjidhni një emër tjetër ose vendndodhje.`);
        return;
      }

      console.log('Submitting machinery data:', cleanData);
      console.log('Data being sent to API:', JSON.stringify(cleanData, null, 2));

      const response = await machineryAPI.create(cleanData);
      console.log('API Response:', response);
      toast.success('Makineri u shtua me sukses!');
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error adding machinery:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Dështoi shtimi i makinerisë');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  const machineryTypes = [
    'Pajisje e Rëndë',
    'Ekskavator',
    'Buldozer',
    'Ngarkues',
    'Kami',
    'Traktor',
    'Kompresor',
    'Gjenerator',
    'Pompë',
    'Tjetër'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md sm:max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Shto Makineri të Re</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emri i Makinerisë *
              </label>
              <input
                type="text"
                {...register('name', {
                  required: 'Emri i makinerisë është i detyrueshëm',
                  minLength: {
                    value: 2,
                    message: 'Emri duhet të ketë të paktën 2 karaktere',
                  },
                })}
                className="input"
                placeholder="Shkruaj emrin e makinerisë"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipi i Makinerisë
              </label>
              <select
                {...register('type')}
                className="input"
              >
                <option value="">Zgjidh tipin...</option>
                {machineryTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Place */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendndodhja *
              </label>
              {loadingPlaces ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <select
                  {...register('place_id', {
                    required: 'Vendndodhja është e detyrueshme',
                    valueAsNumber: true,
                  })}
                  className="input"
                >
                  <option value="">Zgjidh vendndodhjen...</option>
                  {places.map((place) => (
                    <option key={place.id} value={place.id}>
                      {place.name} - {place.location}
                    </option>
                  ))}
                </select>
              )}
              {errors.place_id && (
                <p className="mt-1 text-sm text-red-600">{errors.place_id.message}</p>
              )}
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kapaciteti (Litra)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('capacity', {
                  valueAsNumber: true,
                  min: {
                    value: 0,
                    message: 'Kapaciteti duhet të jetë pozitiv',
                  },
                })}
                className="input"
                placeholder="Shkruaj kapacitetin në litra"
              />
              {errors.capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Përshkrimi
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="input resize-none"
                placeholder="Shto përshkrim për makinerinë..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto btn btn-secondary"
                disabled={isSubmitting}
              >
                Anulo
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto btn btn-primary flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Duke shtuar...
                  </>
                ) : (
                  'Shto Makineri'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMachineryModal; 