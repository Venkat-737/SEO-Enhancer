import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Film,
  FileVideo,
  X,
  CheckCircle2,
  AlertCircle,
  CloudUpload,
} from 'lucide-react';
import LoadingScreen from '../common/LoadingScreen';
import axios from 'axios';

export default function UploadPage({ onAnalysisComplete }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('video/')) {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please upload a valid video file.');
    }
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const removeFile = () => {
    setFile(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('video', file);

    try {
      // Simulate progressive loading stages
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 8 + 2;
        });
      }, 500);

      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          const uploadPct = Math.round((event.loaded * 30) / event.total);
          setProgress(uploadPct);
        },
      });

      clearInterval(progressInterval);
      setProgress(100);

      setTimeout(() => {
        setUploading(false);
        onAnalysisComplete(response.data);
      }, 800);
    } catch (err) {
      setUploading(false);
      setError(err.response?.data?.error || 'Upload failed. Please ensure the backend is running.');
      setProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (uploading) {
    return <LoadingScreen progress={progress} />;
  }

  return (
    <motion.div
      className="max-w-2xl mx-auto py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="text-center mb-10">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
          style={{
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Film size={14} style={{ color: '#818cf8' }} />
          <span className="text-xs font-medium" style={{ color: '#818cf8' }}>
            AI Video Analysis
          </span>
        </motion.div>
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--viq-text-primary)' }}>
          Upload Your Video
        </h2>
        <p className="text-sm" style={{ color: 'var(--viq-text-tertiary)' }}>
          Drop your YouTube video file and let AI analyze SEO, content, and performance
        </p>
      </div>

      {/* Dropzone */}
      <motion.div
        className={`viq-dropzone ${isDragging ? 'active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !file && fileInputRef.current?.click()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="empty"
              className="relative z-10 flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                style={{
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <CloudUpload size={36} style={{ color: '#818cf8' }} />
              </motion.div>
              <p className="text-base font-semibold mb-1" style={{ color: 'var(--viq-text-primary)' }}>
                Drag & drop your video file here
              </p>
              <p className="text-sm mb-4" style={{ color: 'var(--viq-text-tertiary)' }}>
                or click to browse files
              </p>
              <div className="flex gap-2 flex-wrap justify-center">
                {['MP4', 'AVI', 'MOV', 'MKV', 'WebM'].map((fmt) => (
                  <span
                    key={fmt}
                    className="viq-tag viq-tag-indigo text-[10px]"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="file"
              className="relative z-10 flex items-center gap-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(52, 211, 153, 0.15)' }}
              >
                <FileVideo size={28} style={{ color: '#34d399' }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold truncate max-w-xs" style={{ color: 'var(--viq-text-primary)' }}>
                  {file.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--viq-text-tertiary)' }}>
                  {formatFileSize(file.size)} · {file.type}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} style={{ color: '#34d399' }} />
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(); }}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={16} style={{ color: 'var(--viq-text-tertiary)' }} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="flex items-center gap-2 mt-4 px-4 py-3 rounded-xl"
            style={{
              background: 'rgba(251, 113, 133, 0.1)',
              border: '1px solid rgba(251, 113, 133, 0.2)',
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <AlertCircle size={16} style={{ color: '#fb7185' }} />
            <span className="text-sm" style={{ color: '#fb7185' }}>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Button */}
      <motion.div
        className="mt-6 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <button
          className="viq-btn-primary w-full max-w-xs"
          onClick={handleUpload}
          disabled={!file}
          style={{ opacity: file ? 1 : 0.4, cursor: file ? 'pointer' : 'not-allowed' }}
        >
          <Upload size={18} />
          Analyze with AI
        </button>
      </motion.div>

      {/* Features Footer */}
      <motion.div
        className="grid grid-cols-3 gap-4 mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {[
          { label: 'AI Transcription', desc: 'Auto-transcribe video audio' },
          { label: 'SEO Analysis', desc: 'Keyword & metadata scoring' },
          { label: 'Smart Titles', desc: 'AI-generated title suggestions' },
        ].map((feat, i) => (
          <div key={i} className="text-center">
            <p className="text-sm font-semibold" style={{ color: 'var(--viq-text-primary)' }}>
              {feat.label}
            </p>
            <p className="text-[11px]" style={{ color: 'var(--viq-text-tertiary)' }}>
              {feat.desc}
            </p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
