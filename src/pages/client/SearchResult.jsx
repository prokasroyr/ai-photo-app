import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFavorites, toggleFavorite } from '../../utils/favorite';
import { handleSingleDownload, handleZipDownload } from '../../utils/download';

export default function SearchResult({ matchedPhotos = [], eventId = "default_event" }) {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState(() => getFavorites(eventId));

  const handleFavToggle = (photo) => {
    const updatedFavs = toggleFavorite(eventId, photo);
    setFavorites([...updatedFavs]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Your Found Photos ({matchedPhotos.length})
        </h2>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/favorites/${eventId}`)}
            className="bg-pink-100 hover:bg-pink-200 text-pink-700 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 border border-pink-300 transition"
          >
            ❤️ Favorites ({favorites.length})
          </button>

          <button
            onClick={() => {
              const urls = matchedPhotos.map((item) => item.imageUrl || item.url || item.cloudinaryUrl);
              handleZipDownload(urls, "My_Event_Photos.zip", "Your Studio Name");
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition flex items-center gap-2"
          >
            📦 Download All (ZIP)
          </button>
        </div>
      </div>

      {matchedPhotos.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No photos matched your face.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {matchedPhotos.map((photo, index) => {
            const photoUrl = photo.imageUrl || photo.cloudinaryUrl || photo.url;
            const isFav = favorites.some((fav) => (fav.imageUrl || fav.url) === photoUrl);

            return (
              <div key={index} className="relative bg-white rounded-lg overflow-hidden border shadow-sm group">
                <button
                  onClick={() => handleFavToggle(photo)}
                  className="absolute top-2 right-2 z-10 p-2 bg-white/80 backdrop-blur rounded-full shadow hover:scale-110 transition cursor-pointer"
                  title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                >
                  {isFav ? '❤️' : '🤍'}
                </button>

                <img src={photoUrl} alt="Result" className="w-full h-48 object-cover" />

                <div className="p-2 flex justify-between items-center bg-gray-50 border-t">
                  <span className="text-xs text-gray-500 font-medium">
                    Match: {photo.score ? (photo.score * 100).toFixed(0) : 0}%
                  </span>

                  <button
                    onClick={() =>
                      handleSingleDownload(photoUrl, `photo_${index + 1}.jpg`, "Your Studio Name")
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded transition flex items-center gap-1"
                  >
                    📥 Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}