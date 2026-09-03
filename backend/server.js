const express = require("express");
const cors = require("cors");
const db = require("./firebaseAdmin");
const app = express();
const processJobs = require("./jobProcessor");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 AI Photo Delivery Backend Running");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  processJobs();

  setInterval(() => {
    processJobs();
  }, 3000);
});
app.get("/test-firestore", async (req, res) => {

  const snapshot = await db
    .collection("events")
    .limit(1)
    .get();


  res.json({
    success: true,
    eventsFound: snapshot.size
  });

});
app.get("/test-firestore", async (req, res) => {

  try {

    const snapshot = await db
      .collection("events")
      .limit(1)
      .get();


    res.json({
      success: true,
      eventsFound: snapshot.size
    });


  } catch(error) {

    console.error(error);

    res.status(500).json({
      success:false,
      error:error.message
    });

  }

});