import React from 'react';
import { motion } from 'framer-motion';

export default function VideoEmbedSection({ section }) {
  const { video_url, video_title, video_description } = section;
  
  if (!video_url) return null;

  const getEmbedUrl = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (url.includes('vimeo.com')) {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
    return url;
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          {video_title && (
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">{video_title}</h2>
          )}
          {video_description && (
            <p className="text-lg text-gray-300 text-center mb-12 max-w-2xl mx-auto">{video_description}</p>
          )}
          
          <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video">
            <iframe
              src={getEmbedUrl(video_url)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </motion.div>
      </div>
    </section>
    </>
  );
}