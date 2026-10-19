import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';

export default function ABTestRenderer({ section, children }) {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);

  const { data: variants = [] } = useQuery({
    queryKey: ['variants', section.id],
    queryFn: () => base44.entities.PageSectionVariant.filter({ 
      parent_section_id: section.id,
      is_active: true 
    }),
    enabled: !!section.id
  });

  const trackImpressionMutation = useMutation({
    mutationFn: (variantId) => base44.entities.PageSectionVariant.update(variantId, {
      impressions: (selectedVariant?.impressions || 0) + 1
    })
  });

  const trackClickMutation = useMutation({
    mutationFn: (variantId) => base44.entities.PageSectionVariant.update(variantId, {
      clicks: (selectedVariant?.clicks || 0) + 1
    })
  });

  // Select variant on mount
  useEffect(() => {
    if (variants.length === 0) {
      setSelectedVariant(null);
      return;
    }

    // Check if user has a stored variant for this section
    const storageKey = `ab_test_${section.id}`;
    const stored = sessionStorage.getItem(storageKey);

    if (stored) {
      const storedVariant = variants.find(v => v.id === stored);
      if (storedVariant) {
        setSelectedVariant(storedVariant);
        return;
      }
    }

    // Select variant based on traffic percentage
    const activeVariants = variants.filter(v => v.is_active);
    if (activeVariants.length === 0) {
      setSelectedVariant(null);
      return;
    }

    const random = Math.random() * 100;
    let cumulative = 0;

    for (const variant of activeVariants) {
      cumulative += variant.traffic_percentage || 50;
      if (random <= cumulative) {
        setSelectedVariant(variant);
        sessionStorage.setItem(storageKey, variant.id);
        return;
      }
    }

    // Fallback to first variant
    setSelectedVariant(activeVariants[0]);
    sessionStorage.setItem(storageKey, activeVariants[0].id);
  }, [variants, section.id]);

  // Track impression once
  useEffect(() => {
    if (selectedVariant && !hasTrackedImpression) {
      trackImpressionMutation.mutate(selectedVariant.id);
      setHasTrackedImpression(true);
    }
  }, [selectedVariant, hasTrackedImpression]);

  // Track clicks on CTA
  const handleCTAClick = () => {
    if (selectedVariant) {
      trackClickMutation.mutate(selectedVariant.id);
    }
  };

  // If no variants, render original
  if (!selectedVariant) {
    return <div onClick={handleCTAClick}>{children}</div>;
  }

  // Render the variant with modified section data
  const variantSection = {
    ...section,
    title: selectedVariant.title || section.title,
    subtitle: selectedVariant.subtitle || section.subtitle,
    description: selectedVariant.description || section.description,
    cta_text: selectedVariant.cta_text || section.cta_text,
    cta_link: selectedVariant.cta_link || section.cta_link
  };

  return (
    <div onClick={handleCTAClick} data-ab-variant={selectedVariant.variant_name}>
      {React.cloneElement(children, { section: variantSection })}
    </div>
  );
}