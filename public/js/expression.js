const video = document.querySelector("#video");
const overlay = document.querySelector("#overlay");

const ws = new WebSocket("ws://localhost:7474"); // while open the connection


const faceDetectorOptions = new faceapi.SsdMobilenetv1Options({
    minConfidence: 0.8
});

const faceLandmarksTinyModel = true;


async function detect() {
   const results =  await faceapi
   .detectAllFaces(video, faceDetectorOptions)
   .withFaceLandmarks(faceLandmarksTinyModel)
   .withFaceExpressions();
    console.log(results);
/* Display face landmarks */ 

//if ( results && results.expressions){
     //Preparing the overlay canvas
     const dims = faceapi.matchDimensions(overlay, video, true); 
     // resize the detected boxes and landmarks in case your displayed image has a different size than the original
     const resizedResults = faceapi.resizeResults(results, dims);
     // draw detections into the canvas
     faceapi.draw.drawDetections(overlay, resizedResults);
     // draw the landmarks into the canvas
     faceapi.draw.drawFaceLandmarks(overlay, resizedResults);
     /* Display face expression results */
     faceapi.draw.drawFaceExpressions(overlay, resizedResults, 0.05);
     
     ws.send(JSON.stringify(results));
//}


   requestAnimationFrame(detect);

}

async function run(){
  await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri("/weights"), // list
      faceapi.nets.tinyFaceDetector.loadFromUri("/weights"), 
      faceapi.nets.faceLandmark68TinyNet.loadFromUri("/weights"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/weights"),
      faceapi.nets.faceExpressionNet.loadFromUri("/weights"),
  ]);

  const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
  video.srcObject = stream;

  video.addEventListener("play", detect);
}

run();
