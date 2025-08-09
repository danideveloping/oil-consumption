import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Fuel } from 'lucide-react';
import { dataAPI, machineryAPI, Machinery } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

interface OilEntryFormData {
  machinery_id: number;
  date: string;
  litres: number;
  type: 'consumption' | 'refill' | 'maintenance';
  notes?: string;
}

interface AddOilEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddOilEntryModal: React.FC<AddOilEntryModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [machinery, setMachinery] = useState<Machinery[]>([]);
  const [isLoadingMachinery, setIsLoadingMachinery] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OilEntryFormData>({
    defaultValues: {
      type: 'consumption',
    }
  });

  // Load machinery data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadMachinery();
    }
  }, [isOpen]);

  const loadMachinery = async () => {
    try {
      setIsLoadingMachinery(true);
      const response = await machineryAPI.getAll();
      setMachinery(response.data);
    } catch (error) {
      toast.error('Failed to load machinery');
      console.error('Error loading machinery:', error);
    } finally {
      setIsLoadingMachinery(false);
    }
  };

  const onSubmit = async (data: OilEntryFormData) => {
    try {
      setIsSubmitting(true);
      
      // Automatically set current date and time in Albanian timezone
      const now = new Date();
      const albanianDate = now.toLocaleDateString('en-CA', { timeZone: 'Europe/Tirane' }); // YYYY-MM-DD format
      const albanianTime = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Europe/Tirane'
      });
      
      const dateTimeString = `${albanianDate}T${albanianTime}:00`;
      const submissionData = {
        ...data,
        date: dateTimeString
      };
      
      await dataAPI.create(submissionData);
      toast.success('Oil entry added successfully!');
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add oil entry';
      toast.error(message);
      console.error('Error adding oil entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

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
            <div className="flex items-center">
              <div className="bg-primary-100 p-2 rounded-lg mr-3">
                <Fuel className="h-5 w-5 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Add Oil Entry</h3>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4">
            {/* Machinery Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Machinery *
              </label>
              {isLoadingMachinery ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <select
                  {...register('machinery_id', {
                    required: 'Please select machinery',
                    valueAsNumber: true,
                  })}
                  className="input"
                >
                  <option value="">Select machinery...</option>
                  {machinery.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {item.type} {item.place_name && `(${item.place_name})`}
                    </option>
                  ))}
                </select>
              )}
              {errors.machinery_id && (
                <p className="mt-1 text-sm text-red-600">{errors.machinery_id.message}</p>
              )}
            </div>



            {/* Litres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Litres *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('litres', {
                  required: 'Litres is required',
                  valueAsNumber: true,
                  min: {
                    value: 0,
                    message: 'Litres must be positive',
                  },
                })}
                className="input"
                placeholder="Enter litres consumed/refilled"
              />
              {errors.litres && (
                <p className="mt-1 text-sm text-red-600">{errors.litres.message}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entry Type *
              </label>
              <select
                {...register('type', {
                  required: 'Entry type is required',
                })}
                className="input"
              >
                <option value="consumption">Consumption</option>
                <option value="refill">Refill</option>
                <option value="maintenance">Maintenance</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="input resize-none"
                placeholder="Add any additional notes..."
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
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoadingMachinery}
                className="w-full sm:w-auto btn btn-primary flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Fuel className="h-4 w-4 mr-2" />
                    Add Entry
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddOilEntryModal; 