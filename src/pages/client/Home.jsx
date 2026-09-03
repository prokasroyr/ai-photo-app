import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-xl w-full text-center">

        <h1 className="text-4xl font-bold text-purple-700 mb-4">
          📸 AI Photo Gallery
        </h1>

        <p className="text-gray-600 mb-8">
          Upload your selfie and instantly find all your event photos.
        </p>

        <button
          onClick={() => navigate("/search")}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl text-lg"
        >
          Find My Photos
        </button>

      </div>
    </div>
  );
}

export default Home;