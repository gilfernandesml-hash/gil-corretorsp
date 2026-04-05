import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { trackLeadEvent } from '@/utils/gaHelper';

const toSupabasePublicImageUrl = (raw) => {
  if (typeof raw !== 'string') return '';
  const url = raw
    .trim()
    .replace(/^["']+/, '')
    .replace(/["']+$/, '')
    .replace(/,+$/, '')
    .trim();
  if (!url) return '';

  // Keep already absolute URLs and data URIs
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) {
    // If an absolute URL has unencoded spaces, it may cause Supabase Storage to return 400.
    return url.includes(' ') ? url.replace(/ /g, '%20') : url;
  }

  // Convert relative/path formats to the public bucket URL using the configured Supabase client
  // Examples we handle:
  // - "prop_123.jpg"
  // - "/prop_123.jpg"
  // - "property-images/prop_123.jpg"
  // - "/storage/v1/object/public/property-images/prop_123.jpg"
  // - "storage/v1/object/public/property-images/prop_123.jpg"
  let path = url.replace(/^\/+/, '');
  path = path.replace(/^property-images\//, '');
  path = path.replace(/^storage\/v1\/object\/public\/property-images\//, '');
  path = path.replace(/^storage\/v1\/object\/public\//, '');

  // If the path still contains the bucket prefix, strip it
  path = path.replace(/^property-images\//, '');

  const encodedPath = path
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');

  const publicUrl = supabase?.storage?.from?.('property-images')?.getPublicUrl?.(encodedPath)?.data?.publicUrl;
  return publicUrl || url;
};

const normalizeUrlArray = (value) => {
  if (!value) return [];

  let arr = value;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      arr = parsed;
    } catch {
      arr = trimmed
        .split(/\s*[|,]\s*/)
        .map((u) => u.trim())
        .filter(Boolean);
    }
  }

  if (!Array.isArray(arr)) return [];

  return arr
    .map((item) => {
      if (!item) return null;
      if (typeof item === 'string') return toSupabasePublicImageUrl(item);
      if (typeof item === 'object') return toSupabasePublicImageUrl(item.url || item.publicUrl || item.public_url || '');
      return null;
    })
    .filter(Boolean);
};

/**
 * Custom hook to fetch property data and handle related states/tracking
 * @param {string} slug - The property slug to fetch
 * @returns {Object} { property, loading, error }
 */
const useProperty = (slug) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If no slug provided, don't attempt fetch
    if (!slug) return;

    // AbortController to cancel fetch if component unmounts
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch property with broker details
        const { data, error: fetchError } = await supabase
          .from('properties')
          .select('*, broker:brokers(*)')
          .eq('slug', slug)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('Property not found');

        // Only update state if not aborted
        if (!signal.aborted) {
          const normalized = {
            ...data,
            images: normalizeUrlArray(data.images),
            plans_urls: normalizeUrlArray(data.plans_urls),
            floor_plans: normalizeUrlArray(data.floor_plans)
          };

          setProperty(normalized);
          
          // Trigger GA4 event for viewing item
          // This should ideally happen only once per valid view
          trackLeadEvent('view_item', {
            currency: 'BRL',
            value: normalized.business_type === 'rent' ? normalized.rental_price : normalized.price,
            items: [{ 
                item_id: normalized.id, 
                item_name: normalized.title,
                item_category: normalized.business_type === 'rent' ? 'Locação' : 'Venda',
            }],
          });
        }
      } catch (err) {
        if (!signal.aborted) {
          console.error('Error fetching property:', err);
          setError(err);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProperty();

    // Cleanup function
    return () => {
      controller.abort();
    };
  }, [slug]);

  return { property, loading, error };
};

export default useProperty;