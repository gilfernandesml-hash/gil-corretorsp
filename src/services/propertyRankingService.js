import { supabase } from '@/lib/supabase';

export const getRankedProperties = async ({ limit = 50 } = {}) => {
  // Simple and functional approach:
  // 1) Fetch properties (with optional views field)
  // 2) Fetch leads (property_id)
  // 3) Count leads by property_id in JS
  // 4) Sort by leads_count desc, then views desc
  try {
    let properties = null;

    // Some databases might not have a `views` column. We try to fetch it and fallback.
    const withViews = await supabase
      .from('properties')
      .select('id, title, slug, neighborhood, views')
      .eq('status', 'active');

    if (!withViews.error) {
      properties = withViews.data;
    } else {
      const withoutViews = await supabase
        .from('properties')
        .select('id, title, slug, neighborhood')
        .eq('status', 'active');

      if (withoutViews.error) throw withoutViews.error;
      properties = (withoutViews.data || []).map((p) => ({ ...p, views: 0 }));
    }

    const { data: leads, error: leadError } = await supabase
      .from('leads')
      .select('id, property_id');

    if (leadError) throw leadError;

    const counts = new Map();
    for (const lead of leads || []) {
      if (!lead?.property_id) continue;
      counts.set(lead.property_id, (counts.get(lead.property_id) || 0) + 1);
    }

    const ranked = (properties || []).map((p) => {
      const leadsCount = counts.get(p.id) || 0;
      const views = typeof p.views === 'number' ? p.views : 0;
      return {
        ...p,
        leads_count: leadsCount,
        views
      };
    });

    ranked.sort((a, b) => {
      if (b.leads_count !== a.leads_count) return b.leads_count - a.leads_count;
      return (b.views || 0) - (a.views || 0);
    });

    return { success: true, data: ranked.slice(0, limit) };
  } catch (error) {
    console.error('Error ranking properties:', error);
    return { success: false, error };
  }
};
