import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Settings } from 'lucide-react';
import AddPlaceModal from '../components/AddPlaceModal';
import { placesAPI, Place } from '../services/api';
// import toast from 'react-hot-toast';

const PlacesPage: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  // const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);



  // Load places data
  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    try {
      const response = await placesAPI.getAll();
      setPlaces(response.data || []);
    } catch (error) {
      console.error('Error loading places:', error);
      setPlaces([]); // Empty array if no data
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
                {places.length}
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