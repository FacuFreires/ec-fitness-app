'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Ejercicio } from '@/types/database';
import { Plus, Pencil, Trash2, X, Loader2, Search, Dumbbell, Play } from 'lucide-react';
import toast from 'react-hot-toast';

const GRUPOS_MUSCULARES = [
    'Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps',
    'Piernas', 'Glúteos', 'Core', 'Cardio', 'Full Body',
];

const emptyForm = { nombre: '', grupo_muscular: '', video_url: '', instrucciones: '' };

// Previsualización inteligente de video/imagen
function MediaPreview({ url, nombre }: { url: string; nombre: string }) {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\s]+)/);
    if (ytMatch) {
        return (
            <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 10, overflow: 'hidden', marginTop: 8 }}>
                <iframe
                    src={`https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allowFullScreen title={nombre}
                />
            </div>
        );
    }
    if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
        return <video src={url} controls style={{ width: '100%', height: 140, borderRadius: 10, marginTop: 8 }} />;
    }
    return (
        <img src={url} alt="preview" loading="lazy"
            style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, marginTop: 8 }} />
    );
}

export default function EjerciciosPage() {
    const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState<Ejercicio | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    const fetchEjercicios = async () => {
        // tabla: ejercicios (no ejercicios_master)
        const { data, error } = await supabase.from('ejercicios').select('*').order('nombre');
        if (error) console.error('[Ejercicios] fetch:', error.message);
        setEjercicios(data ?? []);
        setLoading(false);
    };
    useEffect(() => { fetchEjercicios(); }, []);

    const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
    const openEdit = (e: Ejercicio) => {
        setEditing(e);
        setForm({
            nombre: e.nombre,
            grupo_muscular: e.grupo_muscular,
            video_url: e.video_url ?? '',
            instrucciones: e.instrucciones ?? '',
        });
        setModal(true);
    };

    const handleSave = async () => {
        if (!form.nombre || !form.grupo_muscular) {
            toast.error('Nombre y grupo muscular son obligatorios');
            return;
        }
        setSaving(true);
        const payload = {
            nombre: form.nombre,
            grupo_muscular: form.grupo_muscular,
            video_url: form.video_url || null,
            instrucciones: form.instrucciones || null,
        };
        if (editing) {
            const { error } = await supabase.from('ejercicios').update(payload).eq('id', editing.id);
            if (error) { toast.error('Error al guardar'); console.error(error.message); }
            else toast.success('Ejercicio actualizado');
        } else {
            const { error } = await supabase.from('ejercicios').insert(payload);
            if (error) { toast.error('Error al guardar'); console.error(error.message); }
            else toast.success('Ejercicio creado');
        }
        setSaving(false);
        setModal(false);
        fetchEjercicios();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar ejercicio?')) return;
        await supabase.from('ejercicios').delete().eq('id', id);
        toast.success('Eliminado');
        fetchEjercicios();
    };

    const filtered = ejercicios.filter(e =>
        (e.nombre ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (e.grupo_muscular ?? '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Ejercicios</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Base de datos de ejercicios</p>
                </div>
                <button className="btn-primary" onClick={openCreate} id="create-ejercicio"
                    style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px' }}>
                    <Plus size={18} /> Nuevo
                </button>
            </div>

            <div style={{ position: 'relative', marginBottom: 20 }}>
                <Search size={16} color="var(--text-secondary)"
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input className="input-base" placeholder="Buscar ejercicio o músculo..." value={search}
                    onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 42 }} id="search-ejercicios" />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Cargando...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                    {filtered.map(ej => (
                        <div key={ej.id} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                            {/* Media preview */}
                            {ej.video_url ? (
                                (() => {
                                    const ytMatch = ej.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\s]+)/);
                                    if (ytMatch) {
                                        return (
                                            <div style={{ height: 160, background: '#000', position: 'relative', overflow: 'hidden' }}>
                                                <img
                                                    src={`https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`}
                                                    alt={ej.nombre}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
                                                />
                                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <div style={{ background: 'rgba(5,255,122,0.9)', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Play size={20} color="#000" style={{ marginLeft: 3 }} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    if (/\.(gif|jpg|jpeg|png|webp)(\?.*)?$/i.test(ej.video_url)) {
                                        return (
                                            <div style={{ height: 160, overflow: 'hidden', background: 'var(--bg-card2)' }}>
                                                <img src={ej.video_url} alt={ej.nombre} loading="lazy"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                        );
                                    }
                                    return (
                                        <div style={{ height: 100, background: 'var(--bg-card2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Play size={32} color="var(--neon)" />
                                        </div>
                                    );
                                })()
                            ) : (
                                <div style={{ height: 100, background: 'var(--bg-card2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Dumbbell size={40} color="var(--border)" />
                                </div>
                            )}

                            <div style={{ padding: '14px 16px' }}>
                                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{ej.nombre}</div>
                                <span style={{ background: 'rgba(5,255,122,0.1)', color: 'var(--neon)', fontSize: 11, padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                                    {ej.grupo_muscular}
                                </span>
                                {ej.instrucciones && (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 8, lineHeight: 1.4 }}>
                                        {ej.instrucciones}
                                    </p>
                                )}
                                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                                    <button className="btn-ghost" onClick={() => openEdit(ej)}
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px' }}>
                                        <Pencil size={14} /> Editar
                                    </button>
                                    <button className="btn-danger" onClick={() => handleDelete(ej.id)}
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px' }}>
                                        <Trash2 size={14} /> Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                            <Dumbbell size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                            <p>No hay ejercicios. ¡Creá el primero!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {modal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
                    <div className="modal-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700 }}>{editing ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}</h2>
                            <button onClick={() => setModal(false)} className="btn-ghost" style={{ padding: '6px 8px' }}><X size={18} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                                    Nombre del ejercicio *
                                </label>
                                <input className="input-base" placeholder="Ej: Press de banca" value={form.nombre}
                                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                                    Grupo muscular *
                                </label>
                                <select className="input-base" value={form.grupo_muscular}
                                    onChange={e => setForm(f => ({ ...f, grupo_muscular: e.target.value }))}
                                    style={{ cursor: 'pointer' }}>
                                    <option value="">Seleccionar...</option>
                                    {GRUPOS_MUSCULARES.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                                    URL del video / GIF
                                </label>
                                <input className="input-base" placeholder="https://youtube.com/... o https://..." value={form.video_url}
                                    onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} />
                                {form.video_url && <MediaPreview url={form.video_url} nombre={form.nombre} />}
                            </div>
                            <div>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                                    Instrucciones
                                </label>
                                <textarea className="input-base" placeholder="Indicaciones técnicas..." rows={3}
                                    value={form.instrucciones}
                                    onChange={e => setForm(f => ({ ...f, instrucciones: e.target.value }))}
                                    style={{ resize: 'none' }} />
                            </div>
                            <button className="btn-primary" onClick={handleSave} disabled={saving}
                                style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                {saving
                                    ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</>
                                    : 'Guardar ejercicio'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
