import "./App.css";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import { useEffect, useRef, useState } from "react";

function App() {
  const videoRef = useRef(null);
  const canavsRef = useRef(null);
  const [model, setModel] = useState(null);

  useEffect(() => {
    // Load the coco-SSD model
    cocoSsd.load().then((loadedModel) => {
      console.log(loadedModel, "loadedModel");
      setModel(loadedModel);
    });

    // Access the webcam
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
          };
        }
      })
      .catch((err) => {
        console.error("Error accessing webcam", err);
      });
  }, []);

  const detectObjects = async () => {
    if (model && videoRef.current) {
      const predictions = await model.detect(videoRef.current);
      console.log(predictions, "predictions");
      // Draw the detections on the canvas
      if (canavsRef.current) {
        const canvas = canavsRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        predictions.forEach((prediction) => {
          const [x, y, width, height] = prediction.bbox;
          ctx.strokeStyle = "green";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);
          ctx.font = "18px Arial";
          ctx.fillStyle = "red";
          ctx.fillText(
            `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
            x,
            y > 20 ? y - 10 : 10
          );
        });
      }
    }
  };

  // Set up a detection interval inside useEffect
  useEffect(() => {
    const interval = setInterval(detectObjects, 100);
    return () => clearInterval(interval);
  }, [model]);

  return (
    <div className="flex justify-center mt-20">
      <div>
        <h1 className="underline text-3xl mb-10 text-center">
          Real-time object detection with abdelrahman and React.js
        </h1>
        <video ref={videoRef} autoPlay muted width="0" height="0" />
        <canvas ref={canavsRef} className="rounded-lg"></canvas>
      </div>
    </div>
  );
}

export default App;
