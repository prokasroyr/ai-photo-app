import { useState } from "react";

function FaceProcessing({ eventId }) {
  const [loading, setLoading] = useState(false);

  const handleProcess = async () => {
    setLoading(true);

    try {
      const response = await fetch("https://ai-photo-backend-8le8.onrender.com/process-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
        }),
      });

      const data = await response.json();

      console.log(data);

      alert(`✅ ${data.totalPhotos} টি ছবি পাওয়া গেছে`);
    } catch (error) {
      console.error(error);
      alert("AI Server Connection Failed");
    }

    setLoading(false);
  };

  return (
    <div className="bg-white shadow rounded-xl p-6 mt-6">
      <h2 className="text-2xl font-bold mb-3">
        🤖 AI Face Processing
      </h2>

      <button
        onClick={handleProcess}
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
      >
        {loading ? "Processing..." : "🚀 Start AI Processing"}
      </button>
      <button disabled={loading}>
  {loading ? "Processing AI..." : "Process AI"}
</button>
    </div>
  );
}

export default FaceProcessing;