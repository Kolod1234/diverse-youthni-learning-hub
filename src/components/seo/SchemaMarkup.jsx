import React from 'react';

export default function SchemaMarkup({ type, data }) {
  const generateSchema = () => {
    switch (type) {
      case 'faq':
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": data.faqs?.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          })) || []
        };

      case 'product':
        return {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": data.name,
          "description": data.description,
          "image": data.image,
          "offers": {
            "@type": "Offer",
            "price": data.price,
            "priceCurrency": "GBP",
            "availability": "https://schema.org/InStock"
          },
          "aggregateRating": data.rating ? {
            "@type": "AggregateRating",
            "ratingValue": data.rating,
            "reviewCount": data.reviewCount || 0
          } : undefined
        };

      case 'article':
        return {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": data.title,
          "description": data.description,
          "image": data.image,
          "datePublished": data.datePublished,
          "dateModified": data.dateModified,
          "author": {
            "@type": "Organization",
            "name": data.authorName || "Diverse Youth NI"
          }
        };

      case 'course':
        return {
          "@context": "https://schema.org",
          "@type": "Course",
          "name": data.title,
          "description": data.description,
          "provider": {
            "@type": "Organization",
            "name": "Diverse Youth NI"
          },
          "courseCode": data.id,
          "hasCourseInstance": {
            "@type": "CourseInstance",
            "courseMode": "online"
          },
          "aggregateRating": data.rating ? {
            "@type": "AggregateRating",
            "ratingValue": data.rating,
            "reviewCount": data.reviewCount || 0
          } : undefined
        };

      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": data.name || "Diverse Youth NI",
          "description": data.description,
          "url": data.url || "https://diverseyouthni.com",
          "logo": data.logo,
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "email": data.email
          },
          "sameAs": data.socialLinks || []
        };

      case 'breadcrumb':
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": data.items?.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
          })) || []
        };

      case 'video':
        return {
          "@context": "https://schema.org",
          "@type": "VideoObject",
          "name": data.title,
          "description": data.description,
          "thumbnailUrl": data.thumbnail,
          "uploadDate": data.uploadDate,
          "contentUrl": data.url
        };

      case 'team':
        return {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": data.members?.map((member, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Person",
              "name": member.name,
              "jobTitle": member.role,
              "description": member.bio,
              "image": member.image,
              "email": member.email,
              "sameAs": [member.linkedin, member.twitter].filter(Boolean)
            }
          })) || []
        };

      default:
        return null;
    }
  };

  const schema = generateSchema();
  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}