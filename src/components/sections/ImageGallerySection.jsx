import React from 'react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageGallerySection({ section }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const { gallery_images = [], gallery_layout = 'grid', title, description } = section;

  if (!gallery_images.length) return null;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
            {description && <p className="text-lg text-gray-600">{description}</p>}
          </motion.div>
        )}

        {gallery_layout === 'carousel' ? (
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {gallery_images.map((img, idx) => (
                  <div key={idx} className="flex-[0_0_100%] min-w-0 px-2">
                    <div className="relative aspect-video rounded-2xl overflow-hidden">
                      <img src={img.url} alt={img.alt || img.caption} className="w-full h-full object-cover" />
                      {img.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                          <p className="text-white text-lg">{img.caption}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => emblaApi?.scrollPrev()} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={() => emblaApi?.scrollNext()} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className={`grid ${gallery_layout === 'masonry' ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'} gap-6`}>
            {gallery_images.map((img, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} whileHover={{ y: -8 }} className="relative group rounded-xl overflow-hidden shadow-lg">
                <img src={img.url} alt={img.alt || img.caption} className="w-full h-full object-cover aspect-square group-hover:scale-110 transition duration-500" />
                {img.caption && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                    <p className="text-white">{img.caption}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}