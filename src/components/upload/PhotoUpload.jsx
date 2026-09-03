import { useState, useRef } from "react";
import { CLOUD_NAME, UPLOAD_PRESET } from "../../services/cloudinary";
import { db, auth } from "../../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function PhotoUpload({ eventId }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("You must be logged in to upload photos!");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    const total = files.length;
    setTotalCount(total);
    setUploadedCount(0);
    setProgress(0);

    try {
      // ১. সবগুলো ছবির জন্য আলাদা আলাদা প্রমিস (Promise) তৈরি করা
      const uploadPromises = files.map(async (file) => {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", UPLOAD_PRESET);

          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error?.message || "Upload failed");
          }

          // Firestore-এ ডাটা সেভ করা
          await addDoc(collection(db, "photos"), {
            eventId,
            photographerId: currentUser.uid,
            imageUrl: data.secure_url,
            cloudinaryUrl: data.secure_url,
            publicId: data.public_id,
            aiProcessed: false,
            createdAt: serverTimestamp(),
          });

          // ২. কনকারেন্ট আপলোডের সময় স্টেট সঠিকভাবে আপডেট করা
          setUploadedCount((prevCount) => {
            const newCount = prevCount + 1;
            setProgress(Math.round((newCount / total) * 100));
            return newCount;
          });
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          // এখানে অ্যালার্ট না দিয়ে শুধু লগ রাখাই ভালো, কারণ একসাথে অনেক ফেইল হলে বারবার অ্যালার্ট আসবে
        }
      });

      // ৩. সবগুলো প্রমিস একসাথে রান করা (Parallel Execution)
      await Promise.all(uploadPromises);

      alert("✅ All Photos Uploaded Successfully!");
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred during the upload process.");
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        disabled={uploading}
        onChange={handleUpload}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer disabled:opacity-50"
      />

      {uploading && (
        <div className="mt-5">
          <p className="font-bold text-gray-700">
            Uploading {uploadedCount} / {totalCount} Photos
          </p>

          <div className="w-[300px] bg-gray-200 rounded-full h-4 mt-2 overflow-hidden">
            <div
              className="bg-purple-600 h-4 rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <p className="mt-2 text-sm font-semibold text-purple-700">
            {progress}% Complete
          </p>
        </div>
      )}
    </div>
  );
}

export default PhotoUpload;