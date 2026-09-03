import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";


function Gallery({ eventId }) {
  const [previewImage, setPreviewImage] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const togglePhoto = (id) => {
  if (selectedPhotos.includes(id)) {
    setSelectedPhotos(selectedPhotos.filter((item) => item !== id));
  } else {
    setSelectedPhotos([...selectedPhotos, id]);
  }
    };
    const selectAll = () => {
  if (selectedPhotos.length === photos.length) {
    setSelectedPhotos([]);
  } else {
    setSelectedPhotos(photos.map((p) => p.id));
  }
    };


  useEffect(() => {

    const q = query(
    collection(db, "photos"),
    where("eventId", "==", eventId)
        );


        const unsubscribe = onSnapshot(q, (snapshot) => {

      const list = [];

      snapshot.forEach((doc) => {
        list.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setPhotos(list);
      setLoading(false);

    });


    return () => unsubscribe();

  }, [eventId]);

const deletePhoto = async (photoId) => {
  const ok = window.confirm("এই ছবিটি Delete করতে চান?");

  if (!ok) return;

  try {
    await deleteDoc(doc(db, "photos", photoId));
    alert("✅ Photo Deleted");
  } catch (err) {
    console.error(err);
    alert("Delete Failed");
  }
};

const deleteSelected = async () => {
  if (selectedPhotos.length === 0) {
    alert("No photo selected");
    return;
  }

  const ok = window.confirm(
    `${selectedPhotos.length} টি ছবি Delete করতে চান?`
  );

  if (!ok) return;

  try {
    for (const id of selectedPhotos) {
      await deleteDoc(doc(db, "photos", id));
    }

    setSelectedPhotos([]);

    alert("✅ Selected Photos Deleted");
  } catch (err) {
    console.error(err);
    alert("Delete Failed");
  }
};

  if (loading) {
    return <p>Loading Photos...</p>;
  }


  return (
        

    <div style={{ marginTop: "30px" }}>
        <div style={{ marginBottom: "20px" }}>

<button onClick={selectAll}>
  {selectedPhotos.length === photos.length
    ? "Unselect All"
    : "Select All"}
</button>


<span style={{ marginLeft: "20px" }}>
Selected : {selectedPhotos.length}
</span>

<button
  onClick={deleteSelected}
  style={{
    marginLeft: "20px",
    background: "red",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "6px",
    cursor: "pointer",
  }}
>
🗑 Delete Selected
</button>

</div>

      <h2>📷 Gallery ({photos.length})</h2>


      {photos.length === 0 && (
        <p>No Photos Uploaded</p>
      )}


      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill,minmax(200px,1fr))",
          gap: "15px",
        }}
      >

        {photos.map((photo) => (
            

          <div key={photo.id}>
            
            <input
            type="checkbox"
            checked={selectedPhotos.includes(photo.id)}
            onChange={() => togglePhoto(photo.id)}
            />
          
  <img
  src={photo.imageUrl}
  alt=""
  onClick={() => setPreviewImage(photo)}
  style={{
    width: "200px",
    height: "200px",
    objectFit: "cover",
    borderRadius: "10px",
    cursor: "pointer",
  }}
/>

  <button
    onClick={() => deletePhoto(photo.id)}
    style={{
      marginTop: "8px",
      width: "200px",
      background: "red",
      color: "white",
      border: "none",
      padding: "8px",
      cursor: "pointer",
      borderRadius: "5px",
    }}
  >
    🗑 Delete
  </button>
</div>
        ))}

      </div>

          {previewImage && (
  <div
    onClick={() => setPreviewImage(null)}
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
  >
    <div
      className="bg-white rounded-xl p-4 max-w-5xl"
      onClick={(e) => e.stopPropagation()}
    >
      <img
        src={previewImage.imageUrl}
        alt=""
        className="max-h-[80vh] rounded-lg"
      />

      <div className="flex justify-end mt-4">
        <button
          onClick={() => setPreviewImage(null)}
          className="bg-red-500 text-white px-5 py-2 rounded-lg"
        >
          Close
        </button>
        <div className="flex justify-end gap-3 mt-4">

  <a
    href={previewImage.imageUrl}
    download
    target="_blank"
    rel="noopener noreferrer"
    className="bg-green-600 text-white px-5 py-2 rounded-lg"
  >
    📥 Download
  </a>

  <button
    onClick={() => setPreviewImage(null)}
    className="bg-red-500 text-white px-5 py-2 rounded-lg"
  >
    ✖ Close
  </button>
{!loading && photos.length === 0 && (
  <p className="text-center text-gray-500 mt-8">
    No matching photos found.
  </p>
)}
</div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default Gallery;