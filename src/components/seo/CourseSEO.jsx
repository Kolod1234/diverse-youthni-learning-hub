import React, { useEffect } from 'react';

export default function CourseSEO({ course }) {
  useEffect(() => {
    if (!course) return;

    // Set page title
    document.title = `${course.title} - Learn Online | Diverse Youth NI`;

    // Set meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = course.description?.substring(0, 160) || `Learn ${course.title} online`;

    // Set Open Graph tags
    const ogTags = [
      { property: 'og:title', content: course.title },
      { property: 'og:description', content: course.description?.substring(0, 200) },
      { property: 'og:image', content: course.thumbnail || '' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href }
    ];

    ogTags.forEach(({ property, content }) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.content = content;
    });

    // Set Twitter Card tags
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: course.title },
      { name: 'twitter:description', content: course.description?.substring(0, 200) },
      { name: 'twitter:image', content: course.thumbnail || '' }
    ];

    twitterTags.forEach(({ name, content }) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.name = name;
        document.head.appendChild(tag);
      }
      tag.content = content;
    });

    // Add JSON-LD structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": course.title,
      "description": course.description,
      "provider": {
        "@type": "Organization",
        "name": "Diverse Youth NI"
      },
      "instructor": course.instructor ? {
        "@type": "Person",
        "name": course.instructor
      } : undefined,
      "aggregateRating": course.rating ? {
        "@type": "AggregateRating",
        "ratingValue": course.rating,
        "bestRating": "5",
        "ratingCount": course.enrolled_count || 1
      } : undefined,
      "image": course.thumbnail,
      "offers": {
        "@type": "Offer",
        "price": course.price || 0,
        "priceCurrency": "GBP"
      }
    };

    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);

    return () => {
      document.title = 'Diverse Youth NI';
    };
  }, [course]);

  return null;
}