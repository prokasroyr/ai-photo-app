const db = require("./firebaseAdmin");
const axios = require("axios");

const processJobs = async () => {

  const snapshot = await db
    .collection("searchJobs")
    .where("status", "==", "pending")
    .get();


  if(snapshot.empty){

    console.log("No pending jobs");
    return;

  }


  snapshot.forEach(async (job)=>{

    const jobId = job.id;
    const jobData = job.data();
    console.log(
      "Processing Job:",
      jobId
    );


    const jobRef = db
      .collection("searchJobs")
      .doc(jobId);



    await jobRef.update({
      status: "processing",
      progress: 0
    });

    let progress = 0;


    const interval = setInterval(async ()=>{


      progress += 20;


      await jobRef.update({

        progress,

        status:
          progress >= 100
          ? "completed"
          : "processing"

      });



      console.log(
        "Progress:",
        progress
      );



      if(progress >= 100){

  clearInterval(interval);


  // Real AI Face Match

const response = await axios.post(
  "https://ai-photo-backend-8le8.onrender.com/search-face",
  {
    eventId: jobData.eventId,
    selfiePath: jobData.selfieUrl,
  }
);

const matches = response.data.matches || [];

for (const match of matches) {

  await db.collection("photoMatches").add({
    jobId,
    eventId: jobData.eventId,
    imageUrl: match.imageUrl,
    score: match.score,
    createdAt: new Date(),
  });

}

await jobRef.update({
  matchedPhotos: matches.length
});

console.log(
  `AI Complete. Found ${matches.length} matches`
);


}


    },3000);



  });


};


module.exports = processJobs;