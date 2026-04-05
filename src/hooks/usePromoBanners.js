import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const usePromoBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeSupabaseError = (err) => {
    if (!err) return null;
    return {
      message: err?.message || String(err),
      details: err?.details,
      hint: err?.hint,
      code: err?.code,
      status: err?.status,
      raw: err,
    };
  };

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('promo_banners')
        .select('id,title,subtitle,price,image_url,link,cta_text,is_active,order_index,created_at')
        .eq('is_active', true)
        .order('order_index', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      console.info('[PromoBanners] fetched:', Array.isArray(data) ? data.length : 0);
      setBanners(Array.isArray(data) ? data : []);
    } catch (err) {
      const normalized = normalizeSupabaseError(err);
      console.error('[PromoBanners] fetch error:', normalized);
      setError(normalized);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  return {
    banners,
    loading,
    error,
    refetch: fetchBanners,
  };
};

export default usePromoBanners;
