import React, { useEffect } from 'react';

export default function PageSEO({ pageName, sections = [] }) {
  useEffect(() => {
    // Find first active section with SEO data
    const seoSection = sections.find(s => s.is_active && (s.seo_title || s.seo_description || s.seo_keywords));
    
    // Default values
    const defaultTitle = 'Diverse Youth NI - Online Learning Platform';
    const defaultDescription = 'Empower yourself with expert-led courses and cutting-edge content at Diverse Youth NI.';
    
    // Set page title
    const pageTitle = seoSection?.seo_title || `${pageName} - Diverse Youth NI`;
    document.title = pageTitle;

    // Set meta description
    const description = seoSection?.seo_description || defaultDescription;
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description;

    // Set meta keywords
    if (seoSection?.seo_keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.name = 'keywords';
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.content = seoSection.seo_keywords;
    }

    // Set Open Graph tags
    const ogTags = [
      { property: 'og:title', content: pageTitle },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href },
      { property: 'og:site_name', content: 'Diverse Youth NI' }
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
      { name: 'twitter:title', content: pageTitle },
      { name: 'twitter:description', content: description }
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

    // Add JSON-LD structured data for Organization
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "Diverse Youth NI",
      "description": description,
      "url": window.location.origin,
      "sameAs": []
    };

    let script = document.querySelector('script[type="application/ld+json"][data-page-seo]');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-page-seo', 'true');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);

    return () => {
      document.title = defaultTitle;
    };
  }, [pageName, sections]);

  return null;
}