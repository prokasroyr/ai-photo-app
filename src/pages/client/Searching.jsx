import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { db } from "../../services/firebase";

import {
  doc,
  onSnapshot
} from "firebase/firestore";

function Searching() {

  const { jobId } = useParams();
  const navigate = useNavigate();

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("pending");

  useEffect(() => {

    if (!jobId) {
      console.error("❌ Job ID missing");
      return;
    }

    console.log("🔎 Listening AI Job:", jobId);

    // IMPORTANT:
    // Backend aiJobs collection update করছে
    const jobRef = doc(
      db,
      "aiJobs",
      jobId
    );

    const unsubscribe = onSnapshot(
      jobRef,
      (snapshot) => {

        if (!snapshot.exists()) {
          console.log("❌ AI Job not found:", jobId);
          return;
        }

        const data = snapshot.data();

        console.log("🔥 AI JOB UPDATE:", data);

        setProgress(data.progress || 0);
        setStatus(data.status || "pending");

        // AI completed
        if (data.status === "completed") {

          console.log("✅ AI Processing Completed");

          navigate(`/client/result/${jobId}`);
        }

        // AI error
        if (data.status === "error") {

          console.error(
            "❌ AI Processing Error:",
            data.error
          );

        }

      },
      (error) => {

        console.error(
          "❌ Firestore Listener Error:",
          error
        );

      }
    );

    return () => {
      console.log("🧹 Removing AI Job listener");
      unsubscribe();
    };

  }, [jobId, navigate]);

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white shadow-xl rounded-xl p-8 text-center w-[400px]">

        <h1 className="text-3xl font-bold">
          🤖 AI Searching...
        </h1>

        <p className="mt-4 text-gray-600">
          Please wait, AI is matching your face with event photos...
        </p>

        {/* Progress Bar */}

        <div className="w-full bg-gray-200 rounded-full h-5 mt-6 overflow-hidden">

          <div
            className="bg-indigo-600 h-5 rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`
            }}
          />

        </div>

        <p className="mt-3 font-semibold">
          {progress}% Complete
        </p>

        <p className="text-gray-600">
          Status: {status}
        </p>

      </div>

    </div>

  );
}

export default Searching;