import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Image as ImageIcon, Loader2, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';

const emptyForm = {
  id: null,
  title: '',
  subtitle: '',
  price: '',
  image_url: '',
  link: '',
  cta_text: 'Falar no WhatsApp',
  is_active: true,
  order_index: 0,
};

const PromoBannersManagement = () => {
  const { toast } = useToast();

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

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const sortedBanners = useMemo(() => {
    const list = Array.isArray(banners) ? [...banners] : [];
    list.sort((a, b) => {
      const ao = typeof a?.order_index === 'number' ? a.order_index : Number.MAX_SAFE_INTEGER;
      const bo = typeof b?.order_index === 'number' ? b.order_index : Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime();
    });
    return list;
  }, [banners]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('promo_banners')
        .select('id,title,subtitle,price,image_url,link,cta_text,is_active,order_index,created_at')
        .order('order_index', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBanners(Array.isArray(data) ? data : []);
    } catch (err) {
      const normalized = normalizeSupabaseError(err);
      console.error('[PromoBannersAdmin] fetch error:', normalized);
      toast({
        title: 'Erro',
        description: normalized?.message || 'Não foi possível carregar os banners.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBanner = async () => {
    if (!deleteTarget?.id) return;

    try {
      setDeleting(true);
      const { error } = await supabase.from('promo_banners').delete().eq('id', deleteTarget.id);
      if (error) throw error;

      setBanners((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      toast({
        title: 'Sucesso',
        description: 'Banner excluído.',
        className: 'bg-green-50 border-green-200',
      });
    } catch (err) {
      console.error('Error deleting banner:', err);
      toast({
        title: 'Erro ao excluir',
        description: normalizeSupabaseError(err)?.message || 'Falha ao excluir.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const startCreate = () => {
    const maxOrder = sortedBanners.reduce((acc, b) => {
      const v = typeof b?.order_index === 'number' ? b.order_index : acc;
      return Math.max(acc, v);
    }, 0);

    setForm({ ...emptyForm, order_index: sortedBanners.length ? maxOrder + 1 : 1 });
    setEditing(true);
  };

  const startEdit = (banner) => {
    setForm({
      id: banner.id,
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      price: banner.price || '',
      image_url: banner.image_url || '',
      link: banner.link || '',
      cta_text: banner.cta_text || 'Falar no WhatsApp',
      is_active: banner.is_active ?? true,
      order_index: typeof banner.order_index === 'number' ? banner.order_index : 0,
    });
    setEditing(true);
  };

  const cancelEdit = () => {
    setForm(emptyForm);
    setEditing(false);
    setSaving(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleActive = async (banner) => {
    try {
      const next = !(banner.is_active ?? true);
      const { error } = await supabase
        .from('promo_banners')
        .update({ is_active: next })
        .eq('id', banner.id);

      if (error) throw error;
      setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, is_active: next } : b)));
    } catch (err) {
      const normalized = normalizeSupabaseError(err);
      console.error('[PromoBannersAdmin] toggle error:', normalized);
      toast({
        title: 'Erro',
        description: normalized?.message || 'Não foi possível atualizar o status do banner.',
        variant: 'destructive',
      });
    }
  };

  const swapOrder = async (fromIndex, toIndex) => {
    const list = sortedBanners;
    const a = list[fromIndex];
    const b = list[toIndex];
    if (!a || !b) return;

    const aOrder = typeof a.order_index === 'number' ? a.order_index : fromIndex + 1;
    const bOrder = typeof b.order_index === 'number' ? b.order_index : toIndex + 1;

    try {
      const { error } = await supabase
        .from('promo_banners')
        .upsert(
          [
            { id: a.id, order_index: bOrder },
            { id: b.id, order_index: aOrder },
          ],
          { onConflict: 'id' }
        );

      if (error) throw error;

      setBanners((prev) =>
        prev.map((row) => {
          if (row.id === a.id) return { ...row, order_index: bOrder };
          if (row.id === b.id) return { ...row, order_index: aOrder };
          return row;
        })
      );
    } catch (err) {
      const normalized = normalizeSupabaseError(err);
      console.error('[PromoBannersAdmin] order swap error:', normalized);
      toast({
        title: 'Erro',
        description: normalized?.message || 'Não foi possível reordenar.',
        variant: 'destructive',
      });
    }
  };

  const uploadBannerImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `banners/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('property-images').getPublicUrl(fileName);
    return data?.publicUrl || '';
  };

  const handleImageUploadInput = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const publicUrl = await uploadBannerImage(file);
      if (publicUrl) {
        setForm((prev) => ({ ...prev, image_url: publicUrl }));
      }
      toast({
        title: 'Upload concluído',
        description: 'Imagem enviada com sucesso.',
        className: 'bg-green-50 border-green-200',
      });
    } catch (err) {
      const normalized = normalizeSupabaseError(err);
      console.error('[PromoBannersAdmin] upload error:', normalized);
      toast({
        title: 'Erro no upload',
        description: normalized?.message || 'Falha ao enviar a imagem. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const saveBanner = async (e) => {
    e.preventDefault();

    if (!form.title?.trim()) {
      toast({ title: 'Título obrigatório', variant: 'destructive' });
      return;
    }

    if (!form.image_url?.trim()) {
      toast({ title: 'Imagem obrigatória', description: 'Informe uma URL ou faça upload.', variant: 'destructive' });
      return;
    }

    if (!form.link?.trim()) {
      toast({ title: 'Link obrigatório', variant: 'destructive' });
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle?.trim() || null,
        price: form.price?.trim() || null,
        image_url: form.image_url.trim(),
        link: form.link.trim(),
        cta_text: form.cta_text?.trim() || 'Falar no WhatsApp',
        is_active: !!form.is_active,
        order_index: Number.isFinite(Number(form.order_index)) ? Number(form.order_index) : 0,
      };

      if (form.id) {
        const { error } = await supabase.from('promo_banners').update(payload).eq('id', form.id);
        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Banner atualizado.', className: 'bg-green-50 border-green-200' });
      } else {
        const { error } = await supabase.from('promo_banners').insert([payload]);
        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Banner criado.', className: 'bg-green-50 border-green-200' });
      }

      cancelEdit();
      fetchBanners();
    } catch (err) {
      const normalized = normalizeSupabaseError(err);
      console.error('[PromoBannersAdmin] save error:', normalized);
      toast({ title: 'Erro ao salvar', description: normalized?.message || 'Falha ao salvar.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a3a52]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1a3a52]">Oportunidades</h2>
          <p className="text-sm text-gray-600">Gerencie os banners promocionais que aparecem na sidebar do detalhe do imóvel.</p>
        </div>

        <Button onClick={startCreate} className="bg-gray-900 text-white">
          <Plus className="w-4 h-4 mr-2" /> Novo Banner
        </Button>
      </div>

      {editing && (
        <form onSubmit={saveBanner} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{form.id ? 'Editar Banner' : 'Novo Banner'}</h3>
            <Button type="button" variant="ghost" onClick={cancelEdit}>
              <X className="w-4 h-4 mr-2" /> Fechar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input name="title" value={form.title} onChange={handleFormChange} placeholder="Ex: Oportunidade" />
            </div>

            <div className="space-y-2">
              <Label>Texto Principal (subtitle)</Label>
              <Input name="subtitle" value={form.subtitle} onChange={handleFormChange} placeholder="Ex: Studio no Brooklin" />
            </div>

            <div className="space-y-2">
              <Label>Preço</Label>
              <Input name="price" value={form.price} onChange={handleFormChange} placeholder="Ex: A partir de R$ 299 mil" />
            </div>

            <div className="space-y-2">
              <Label>Texto do Botão</Label>
              <Input name="cta_text" value={form.cta_text} onChange={handleFormChange} placeholder="Ex: Falar no WhatsApp" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Link *</Label>
              <Input name="link" value={form.link} onChange={handleFormChange} placeholder="https://wa.me/... ou /imovel/slug" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Imagem (URL) *</Label>
              <Input name="image_url" value={form.image_url} onChange={handleFormChange} placeholder="https://..." />
              <div className="flex items-center gap-3 pt-2">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImageUploadInput} className="hidden" disabled={uploading} />
                  <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                    Upload imagem
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Ativo</span>
                  <Switch checked={!!form.is_active} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked }))} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ordem</Label>
              <Input name="order_index" type="number" value={form.order_index} onChange={handleFormChange} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Prévia</Label>
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                {form.image_url ? (
                  <img src={form.image_url} alt={form.title} className="w-full max-h-[360px] object-contain bg-white" loading="lazy" />
                ) : (
                  <div className="h-[180px] flex items-center justify-center text-gray-400 text-sm">Sem imagem</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={cancelEdit}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || uploading} className="bg-gray-900 text-white">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar
            </Button>
          </div>
        </form>
      )}

      {sortedBanners.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Nenhum banner cadastrado</h3>
          <p className="text-gray-500 mt-1">Clique em "Novo Banner" para criar sua primeira oportunidade.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedBanners.map((banner, idx) => (
            <div key={banner.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="w-full md:w-40 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {banner.image_url ? (
                  <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
              </div>

              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${banner.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {banner.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                  <span className="text-xs text-gray-500">Ordem: {banner.order_index ?? '-'}</span>
                </div>
                <div className="text-lg font-bold text-[#1a3a52] truncate">{banner.title}</div>
                {banner.subtitle && <div className="text-sm text-gray-600 truncate">{banner.subtitle}</div>}
                {banner.price && <div className="text-sm font-semibold text-gray-900 mt-1">{banner.price}</div>}
                <div className="text-xs text-gray-500 mt-1 truncate">{banner.link}</div>
              </div>

              <div className="flex flex-wrap md:flex-col gap-2 w-full md:w-auto md:min-w-[220px] md:flex-shrink-0">
                <div className="flex items-center justify-between md:justify-start gap-3 px-2 py-1">
                  <span className="text-sm text-gray-700">Ativo</span>
                  <Switch checked={!!banner.is_active} onCheckedChange={() => handleToggleActive(banner)} />
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => startEdit(banner)} className="flex-1 md:flex-none">
                    <Pencil className="w-4 h-4 mr-2" /> Editar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteTarget(banner)}
                    className="flex-1 md:flex-none bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Excluir
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" disabled={idx === 0} onClick={() => swapOrder(idx, idx - 1)} className="flex-1 md:flex-none">
                    <ArrowUp className="w-4 h-4 mr-2" /> Subir
                  </Button>
                  <Button type="button" variant="outline" size="sm" disabled={idx === sortedBanners.length - 1} onClick={() => swapOrder(idx, idx + 1)} className="flex-1 md:flex-none">
                    <ArrowDown className="w-4 h-4 mr-2" /> Descer
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleDeleteBanner}
        title="Excluir banner?"
        description={`Esta ação não pode ser desfeita. O banner "${deleteTarget?.title || ''}" será removido.`}
        isLoading={deleting}
      />
    </div>
  );
};

export default PromoBannersManagement;
