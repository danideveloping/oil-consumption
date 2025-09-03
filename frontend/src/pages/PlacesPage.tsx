import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Settings } from 'lucide-react';
import AddPlaceModal from '../components/AddPlaceModal';
import { placesAPI, Place } from '../services/api';
// import toast from 'react-hot-toast';

const PlacesPage: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);



  // Load places data
  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Loading places...');
      const response = await placesAPI.getAll();
      console.log('📦 Places response:', response);
      console.log('📦 Places data:', response.data);
      setPlaces(response.data || []);
      console.log('✅ Places state updated with:', response.data || []);
    } catch (error: any) {
      console.error('❌ Error loading places:', error);
      setError(error.message || 'Failed to load places');
      setPlaces([]); // Empty array if no data
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuccess = () => {
    loadPlaces();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Menaxhimi i Vendeve</h1>
          <p className="text-sm sm:text-base text-gray-600">Menaxho vendndodhjet ku është vendosur makineri</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary flex items-center justify-center w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Shto Vend
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vende Totale</p>
              <p className="text-2xl font-bold text-gray-900">{places.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Makineri Totale</p>
              <p className="text-2xl font-bold text-gray-900">
                0
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vendndodhje Aktive</p>
              <p className="text-2xl font-bold text-gray-900">{places.length}</p>
            </div>
          </div>
        </div>
      </div>



      {/* Places Table */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Të Gjitha Vendet</h2>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Kërko vende..."
              className="input w-full sm:w-64"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Duke ngarkuar vendet...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Gabim në ngarkim</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button 
                  onClick={loadPlaces}
                  className="mt-2 text-sm text-red-800 hover:text-red-900 underline"
                >
                  Provo përsëri
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table - only show when not loading and no error */}
        {!isLoading && !error && (
          <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
          <div className="min-w-full">
            <table className="table min-w-full">
              <thead>
                <tr>
                  <th className="text-xs sm:text-sm">Emri</th>
                  <th className="text-xs sm:text-sm hidden sm:table-cell">Vendndodhja</th>
                  <th className="text-xs sm:text-sm hidden lg:table-cell">Përshkrimi</th>
                  <th className="text-xs sm:text-sm">Numri i Makinerisë</th>
                </tr>
              </thead>
              <tbody>
                {places.map((place) => (
                  <tr key={place.id}>
                    <td>
                      <div className="flex items-center">
                        <div className="bg-gray-100 p-1 sm:p-2 rounded-lg mr-2 sm:mr-3">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        </div>
                        <div>
                          <span className="font-medium text-xs sm:text-sm">{place.name}</span>
                          <p className="text-xs text-gray-500 sm:hidden">{place.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell text-xs sm:text-sm">{place.location}</td>
                    <td className="hidden lg:table-cell text-gray-600 text-xs sm:text-sm">{place.description}</td>
                    <td>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {place.id} makineri
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>

      {/* Add Place Modal */}
      <AddPlaceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default PlacesPage; 