import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Spinner from "./Spinner";
import LoadingDots from "./LoadingDots";
import Footer from "./Footer";
import Copy from "./Copy";

// import userDetails from "./Navbar";

import { useNavigate } from "react-router-dom";

const Main = () => {
  const token = localStorage.getItem("Token");
  const navigate = useNavigate();

  const [videoFile, setVideoFile] = useState(null);
  const [videoSize, setVideoSize] = useState(null);

  const [status, setStatus] = useState("");
  const [data, setData] = useState(null);
  const [process, setProcess] = useState(false);
  const [isDisable, setIsDisable] = useState(false);

  const handleFileChange = (e) => {
    handleReset()
    setVideoFile(e.target.files[0]);
    const fil = videoFile;
    if (videoFile) {
      const fileSizeInMB = (videoFile.size / (1024 * 1024)).toFixed(2);
      setVideoSize(fileSizeInMB);
    }
  };

  const handleReset = () => {
    setData(null)
    setStatus("")
    setVideoFile(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    setProcess(true);
    setIsDisable(true);

    if (!videoFile) return setStatus("Please select a video file.");

    const formData = new FormData();
    formData.append("video", videoFile);

    try {
      const response = await fetch("http://localhost:5000/process_video", {
        method: "POST",
        body: formData,
      });
      console.log(response);

      if (response.ok) {
        const textResponse = await response.text();
        const parsed = JSON.parse(textResponse);
        console.log(parsed);
        setData(parsed);
        setStatus("Video processed successfully!");
      } else {
        setStatus(`Video processing failed: ${await response.text()}`);
      }
    } catch (error) {
      setStatus("An error occurred during the video processing.");
    }

    setProcess(false);
    setIsDisable(false);
  };

  const [copySuccess, setCopySuccess] = useState("");

  const handleCopyText = () => {
    navigator.clipboard.writeText("textToCopy").then(
      () => setCopySuccess("Text copied!"),
      () => setCopySuccess("Failed to copy!")
    );
  };

  useEffect(() => {
    if (!token) {
      alert("Session Logged Out.\nPlease Login Again.");
      navigate("/signin");
    }
  }, []);

  const fakeTrendData = {
    score: 87,
    trends: ["AI Tools", "Short-form Content", "Productivity Hacks", "Tech Reviews"],
    growth: "+23% engagement potential"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-black text-white flex flex-col">
      <Navbar />

      <div className="flex-grow flex flex-col items-center justify-center px-4 mt-20">

        {/* HERO CARD */}
        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-2xl text-center">

          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            AI Video Processor
          </h1>
          <p className="text-gray-400 mb-6">
            Upload your video and generate summaries, titles & hashtags instantly
          </p>

          {/* FILE INPUT */}
          <input
            className="mb-4 w-full p-3 rounded-lg bg-white/10 border border-white/20 cursor-pointer"
            type="file"
            accept="video/mp4"
            onChange={handleFileChange}
            disabled={isDisable}
          />

          {/* FILE DETAILS */}
          {videoFile && (
            <div className="mb-4 text-sm text-gray-300">
              <p>📁 {videoFile.name}</p>
              <p className="text-green-400">
                {videoSize} MB
              </p>
            </div>
          )}

          {/* BUTTON */}
          <button
            disabled={isDisable}
            onClick={handleSubmit}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 
            ${isDisable
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105 hover:shadow-lg"
              }`}
          >
            🚀 Process Video
          </button>

          {/* STATUS */}
          {process && (
            <div className="flex justify-center items-center gap-3 mt-6">
              <Spinner />
              <p className="text-lg">Processing...</p>
            </div>
          )}

          {!process && status && (
            <p className="mt-4 text-lg text-green-400">{status}</p>
          )}
        </div>

        {/* RESULTS */}
        {data && !process && (
          <div className="mt-10 w-full max-w-5xl space-y-6">

            {/* SUMMARY */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-3 flex justify-between">
                Summary <Copy text={data.Summary} />
              </h2>
              <p className="text-gray-300">{data.Summary}</p>
            </div>

            {/* TITLES */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-3 flex justify-between">
                Titles <Copy text={data.Titles} />
              </h2>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                {data.Titles.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>

            {/* KEYWORDS + HASHTAGS */}
            <div className="grid md:grid-cols-2 gap-6">

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-3 flex justify-between">
                  Keywords <Copy text={data.Keywords} />
                </h2>
                <ul className="text-gray-300 space-y-1">
                  {data.Keywords.map((k, i) => (
                    <li key={i}>• {k}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-3 flex justify-between">
                  Hashtags <Copy text={data.Hashtags} />
                </h2>
                <div className="flex flex-wrap gap-2">
                  {data.Hashtags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-purple-600/30 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-white/10 rounded-xl p-6 shadow-xl">

              <h2 className="text-2xl font-semibold mb-4 flex justify-between items-center">
                🚀 Trend Mapping
                <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                  Demo Preview
                </span>
              </h2>

              {/* Trend Score */}
              <div className="mb-4">
                <p className="text-gray-400">Trend Score</p>
                <div className="w-full bg-white/10 rounded-full h-3 mt-1">
                  <div
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full"
                    style={{ width: `${fakeTrendData.score}%` }}
                  ></div>
                </div>
                <p className="text-green-400 mt-1 font-semibold">
                  {fakeTrendData.score}/100
                </p>
              </div>

              {/* Growth */}
              <p className="text-sm text-blue-400 mb-4">
                📈 {fakeTrendData.growth}
              </p>

              {/* Trending Topics */}
              <div>
                <p className="text-gray-400 mb-2">Trending Topics</p>
                <div className="flex flex-wrap gap-2">
                  {fakeTrendData.trends.map((t, i) => (
                    <span
                      key={i}
                      className="bg-purple-500/30 px-3 py-1 rounded-full text-sm"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Main;
