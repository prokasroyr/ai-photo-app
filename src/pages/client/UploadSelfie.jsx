import { useNavigate, useParams } from "react-router-dom"; // react-router-dom ব্যবহার করা ভালো
import { useState } from "react";

function UploadSelfie() {
  const { id } = useParams(); // eventId
  const navigate = useNavigate();
  const [selfie, setSelfie] = useState(null);
  const [preview, setPreview] = useState("");

  const handleSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // আগের প্রিভিউ থাকলে তা মেমোরি থেকে মুছে ফেলা (Memory Leak রোধ করতে)
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setSelfie(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSearch = () => {
    if (!selfie) {
      alert("Please select a selfie.");
      return;
    }

    // সেলফি ফাইলটি স্টেট আকারে SearchPhotos পেজে পাঠানো হচ্ছে
    navigate("/search", {
      state: {
        eventId: id,
        selfieFile: selfie,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">📷 Upload Your Selfie</h1>

        <input
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleSelect}
          className="mb-5 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />

        {preview && (
          <img
            src={preview}
            alt="Selfie Preview"
            className="w-48 h-48 rounded-full object-cover mx-auto mb-5 border-4 border-indigo-500 shadow"
          />
        )}

        <button
          onClick={handleSearch}
          disabled={!selfie}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg disabled:bg-gray-400 transition"
        >
          🔍 Proceed to Search
        </button>
      </div>
    </div>
  );
}

export default UploadSelfie;