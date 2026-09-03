import { CLOUD_NAME, UPLOAD_PRESET } from "./cloudinary";
import { db } from "./firebase";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export const uploadSelfie = async (eventId, file) => {
  // 1. Upload to Cloudinary
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Cloudinary upload failed");
  }

  // 2. Save selfie in Firestore
  const selfieRef = await addDoc(
    collection(db, "selfies"),
    {
      eventId,
      imageUrl: data.secure_url,
      publicId: data.public_id,
      status: "uploaded",
      createdAt: serverTimestamp(),
    }
  );

  // 3. Create Search Job
  const searchJobRef = await addDoc(
  collection(db, "searchJobs"),
  {
    eventId,

    selfieId: selfieRef.id,

    // 👇 Python AI এর জন্য দরকার হবে
    selfieUrl: data.secure_url,

    status: "pending",

    progress: 0,

    totalPhotos: 0,
    processedPhotos: 0,
    matchedPhotos: 0,

    error: "",

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
);

return {
  selfieId: selfieRef.id,
  searchJobId: searchJobRef.id,
  imageUrl: data.secure_url,
};
};