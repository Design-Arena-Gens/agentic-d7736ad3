'use client';

import { useState } from 'react';
import VideoGenerator from './components/VideoGenerator';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Product Video Ad Generator
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            AI-powered script writing, text-to-speech, and video creation
          </p>
        </div>

        <VideoGenerator />
      </div>
    </main>
  );
}
