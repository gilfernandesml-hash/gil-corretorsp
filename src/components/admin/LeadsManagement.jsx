import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ExternalLink, Loader2 } from 'lucide-react';
import { getDefaultLeadMessage, updateLeadStatus } from '@/services/leadService';
import { useAuth } from '@/context/AuthContext';

const ALLOWED_STATUS = new Set(['new', 'contacted', 'closed']);

const getStatusLabel = (status) => {
  if (status === 'new') return 'Novo';
  if (status === 'contacted') return 'Contatado';
  if (status === 'closed') return 'Fechado';
  return 'Novo';
};

const buildWhatsAppUrl = ({ phone, message }) => {
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  const encoded = encodeURIComponent(message || 'Olá!');
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
};

export default function LeadsManagement() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [leads, setLeads] = useState([]);

  const isAdmin = user?.email === 'gilfernandesml@gmail.com';

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          created_at,
          status,
          name,
          phone,
          message,
          source,
          property:properties(id, title, slug, neighborhood)
        `)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('[LeadsManagement] fetch error:', error);
      toast({
        title: 'Erro ao carregar leads',
        description: error?.message || 'Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchLeads();
  }, [isAdmin]);

  const total = useMemo(() => leads.length, [leads]);

  const handleOpenWhatsApp = (lead) => {
    const cleanLeadPhone = String(lead?.phone || '').replace(/\D/g, '');
    if (cleanLeadPhone.length < 10) {
      toast({
        title: 'Telefone inválido',
        description: 'Este lead não possui um telefone/WhatsApp válido.',
        variant: 'destructive'
      });
      return;
    }

    const msg = getDefaultLeadMessage({
      name: lead?.name,
      property: lead?.property,
      message: lead?.message
    });

    const url = buildWhatsAppUrl({
      phone: cleanLeadPhone,
      message: msg
    });

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleStatusChange = async (leadId, nextStatus) => {
    setUpdatingId(leadId);
    try {
      const result = await updateLeadStatus(leadId, nextStatus);
      if (!result?.success) {
        throw result?.error || new Error('Falha ao atualizar status');
      }
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: nextStatus } : l)));
    } catch (error) {
      toast({
        title: 'Erro ao atualizar status',
        description: error?.message || 'Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <h3 className="text-lg font-bold text-red-700">Acesso negado</h3>
        <p className="text-red-600 mt-2">Apenas o administrador (gilfernandesml@gmail.com) pode acessar esta seção.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Leads</h2>
          <p className="text-sm text-muted-foreground">Total: {total}</p>
        </div>

        <Button variant="outline" onClick={fetchLeads} disabled={loading}>
          Atualizar
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center text-muted-foreground">
          Nenhum lead encontrado.
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-muted/30 text-xs font-semibold text-muted-foreground">
            <div className="col-span-3">Nome</div>
            <div className="col-span-2">Telefone</div>
            <div className="col-span-4">Imóvel</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Ação</div>
          </div>

          <div className="divide-y">
            {leads.map((lead) => {
              const propertyTitle = lead?.property?.title || '—';
              const propertyNeighborhood = lead?.property?.neighborhood ? ` (${lead.property.neighborhood})` : '';
              const normalizedStatus = ALLOWED_STATUS.has(lead?.status) ? lead.status : 'new';
              const statusLabel = getStatusLabel(normalizedStatus);

              return (
                <div key={lead.id} className="grid grid-cols-12 gap-3 px-4 py-4 items-center">
                  <div className="col-span-3">
                    <div className="font-semibold text-sm text-foreground truncate">{lead.name || '—'}</div>
                    <div className="text-xs text-muted-foreground truncate">{new Date(lead.created_at).toLocaleString()}</div>
                  </div>

                  <div className="col-span-2 text-sm">{lead.phone || '—'}</div>

                  <div className="col-span-4">
                    <div className="text-sm font-medium truncate">{propertyTitle}{propertyNeighborhood}</div>
                    {lead?.property?.slug ? (
                      <a
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                        href={`/imovel/${lead.property.slug}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir página
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : null}
                  </div>

                  <div className="col-span-2">
                    <select
                      className="w-full border rounded-md px-2 py-1 text-sm bg-white"
                      value={normalizedStatus}
                      disabled={updatingId === lead.id}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                    >
                      <option value="new">Novo</option>
                      <option value="contacted">Contatado</option>
                      <option value="closed">Fechado</option>
                    </select>
                    <div className="text-[11px] text-muted-foreground mt-1">{statusLabel}</div>
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleOpenWhatsApp(lead)}
                      disabled={!String(lead?.phone || '').replace(/\D/g, '')}
                    >
                      WhatsApp
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
