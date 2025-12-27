'use client';

import { useState, useRef, useEffect } from 'react';

interface Scene {
  text: string;
  duration: number;
  audioUrl?: string;
}

export default function VideoGenerator() {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [adDuration, setAdDuration] = useState('30');
  const [script, setScript] = useState('');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [step, setStep] = useState<'input' | 'script' | 'video'>('input');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateScript = async () => {
    if (!productName || !productDescription) {
      alert('Please fill in product name and description');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          productDescription,
          targetAudience,
          duration: parseInt(adDuration),
        }),
      });

      const data = await response.json();
      if (data.script) {
        setScript(data.script);
        setScenes(data.scenes || []);
        setStep('script');
      }
    } catch (error) {
      console.error('Error generating script:', error);
      alert('Failed to generate script');
    } finally {
      setLoading(false);
    }
  };

  const generateVideo = async () => {
    if (!script) return;

    setGeneratingVideo(true);
    try {
      // Generate TTS for each scene
      const scenesWithAudio = await Promise.all(
        scenes.map(async (scene) => {
          const response = await fetch('/api/text-to-speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: scene.text }),
          });
          const data = await response.json();
          return { ...scene, audioUrl: data.audioUrl };
        })
      );

      setScenes(scenesWithAudio);

      // Generate video
      const videoBlob = await createVideoFromScenes(scenesWithAudio);
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);
      setStep('video');
    } catch (error) {
      console.error('Error generating video:', error);
      alert('Failed to generate video');
    } finally {
      setGeneratingVideo(false);
    }
  };

  const createVideoFromScenes = async (scenesWithAudio: Scene[]): Promise<Blob> => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error('Canvas not available');

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    canvas.width = 1920;
    canvas.height = 1080;

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 2500000,
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(blob);
      };

      mediaRecorder.onerror = reject;

      mediaRecorder.start();

      let currentTime = 0;
      let sceneIndex = 0;

      const renderFrame = () => {
        if (sceneIndex >= scenesWithAudio.length) {
          mediaRecorder.stop();
          return;
        }

        const scene = scenesWithAudio[sceneIndex];

        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Product name at top
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(productName, canvas.width / 2, 150);

        // Scene text
        ctx.font = '48px Arial';
        const words = scene.text.split(' ');
        let line = '';
        let y = canvas.height / 2 - 50;
        const maxWidth = canvas.width - 200;
        const lineHeight = 60;

        for (let word of words) {
          const testLine = line + word + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && line !== '') {
            ctx.fillText(line, canvas.width / 2, y);
            line = word + ' ';
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, canvas.width / 2, y);

        // Progress indicator
        const progress = sceneIndex / scenesWithAudio.length;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(50, canvas.height - 50, canvas.width - 100, 10);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(50, canvas.height - 50, (canvas.width - 100) * progress, 10);

        currentTime += 1000 / 30; // 30 fps

        if (currentTime >= scene.duration * 1000) {
          currentTime = 0;
          sceneIndex++;
        }

        if (sceneIndex < scenesWithAudio.length) {
          requestAnimationFrame(renderFrame);
        } else {
          setTimeout(() => mediaRecorder.stop(), 100);
        }
      };

      renderFrame();
    });
  };

  const downloadVideo = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `${productName.replace(/\s+/g, '_')}_ad.webm`;
    a.click();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
      <canvas ref={canvasRef} className="hidden" />

      {step === 'input' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product Name
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g., SmartWatch Pro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product Description
            </label>
            <textarea
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Describe your product, its features, and benefits..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Audience (Optional)
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g., fitness enthusiasts, tech-savvy professionals"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ad Duration (seconds)
            </label>
            <select
              value={adDuration}
              onChange={(e) => setAdDuration(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="15">15 seconds</option>
              <option value="30">30 seconds</option>
              <option value="60">60 seconds</option>
            </select>
          </div>

          <button
            onClick={generateScript}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating Script...' : 'Generate Script'}
          </button>
        </div>
      )}

      {step === 'script' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Generated Script
              </h2>
              <button
                onClick={() => setStep('input')}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Edit Details
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-4">
              <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 font-sans">
                {script}
              </pre>
            </div>

            {scenes.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Scenes Breakdown
                </h3>
                <div className="space-y-2">
                  {scenes.map((scene, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          Scene {idx + 1}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {scene.duration}s
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{scene.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={generateScript}
              disabled={loading}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 disabled:opacity-50"
            >
              Regenerate Script
            </button>
            <button
              onClick={generateVideo}
              disabled={generatingVideo}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingVideo ? 'Creating Video...' : 'Create Video'}
            </button>
          </div>
        </div>
      )}

      {step === 'video' && videoUrl && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Video Ad
            </h2>
            <button
              onClick={() => {
                setStep('input');
                setVideoUrl(null);
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Create New
            </button>
          </div>

          <div className="bg-black rounded-lg overflow-hidden">
            <video
              src={videoUrl}
              controls
              className="w-full"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={downloadVideo}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200"
            >
              Download Video
            </button>
            <button
              onClick={() => setStep('script')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200"
            >
              View Script
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
