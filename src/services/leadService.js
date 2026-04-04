import { supabase } from '@/lib/supabase';

const ALLOWED_LEAD_STATUS = new Set(['new', 'contacted', 'closed']);

export const getDefaultLeadMessage = ({ name, property, message }) => {
  const safeName = (name || '').trim() || 'Olá';
  const base = `Olá, ${safeName}! Recebemos seu contato e já vamos te atender.`;

  if (property?.title) {
    const neighborhood = property?.neighborhood ? ` (${property.neighborhood})` : '';
    const extra = message ? `\n\nSua mensagem: ${message}` : '';
    return `${base}\n\nSobre o imóvel: ${property.title}${neighborhood}.\n\nPodemos agendar uma visita?${extra}`;
  }

  if (message) {
    return `${base}\n\nSua mensagem: ${message}\n\nPosso te ajudar com opções e agendamento de visita?`;
  }

  return `${base}\n\nPosso te ajudar com opções e agendamento de visita?`;
};

export const saveLead = async ({ property_id, name, email, phone, message, source, status = 'new' }) => {
  try {
    const normalizedStatus = ALLOWED_LEAD_STATUS.has(status) ? status : 'new';

    let property = null;
    if (property_id) {
      const { data: propData, error: propError } = await supabase
        .from('properties')
        .select('title, neighborhood')
        .eq('id', property_id)
        .maybeSingle();
      if (propError) throw propError;
      property = propData || null;
    }

    const finalMessage = message && String(message).trim().length > 0
      ? message
      : getDefaultLeadMessage({ name, property, message: null });

    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          property_id,
          name: name || 'Lead via Sistema',
          email: email || null,
          phone: phone || null,
          message: finalMessage,
          source: source || null,
          status: normalizedStatus
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving lead:', error);
    return { success: false, error };
  }
};

export const updateLeadStatus = async (leadId, status) => {
  try {
    const normalizedStatus = ALLOWED_LEAD_STATUS.has(status) ? status : null;
    if (!normalizedStatus) {
      return { success: false, error: new Error('Invalid status') };
    }

    const { data, error } = await supabase
      .from('leads')
      .update({ status: normalizedStatus })
      .eq('id', leadId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating lead status:', error);
    return { success: false, error };
  }
};

export const getLeadsByBroker = async (brokerId) => {
  try {
    const { data: propertiesData } = await supabase
      .from('properties')
      .select('id')
      .eq('broker_id', brokerId);

    if (!propertiesData) return { success: true, data: [] };

    const propertyIds = propertiesData.map(p => p.id);
    
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        property:properties(title, neighborhood)
      `)
      .in('property_id', propertyIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching leads:', error);
    return { success: false, error };
  }
};