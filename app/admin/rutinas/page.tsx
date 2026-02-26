'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Perfil, EjercicioMaster, Rutina, RutinaEjercicio } from '@/types/database';
import { Plus, Trash2, X, Loader2, ChevronDown, ChevronUp, GripVertical, Save } from 'lucide-react';
import toast from 'react-hot-toast';

function RutinasPageInner() {
    const searchParams = useSearchParams();
    const preselectedAlumno = searchParams.get('alumno');

    const [alumnos, setAlumnos] = useState<Perfil[]>([]);
    const [selectedAlumno, setSelectedAlumno] = useState<string>(preselectedAlumno ?? '');
    const [rutinas, setRutinas] = useState<Rutina[]>([]);
    const [ejerciciosMaster, setEjerciciosMaster] = useState<EjercicioMaster[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRutina, setExpandedRutina] = useState<string | null>(null);
    const [rutinaEjercicios, setRutinaEjercicios] = useState<Record<string, RutinaEjercicio[]>>({});
    const [newRutinaName, setNewRutinaName] = useState('');
    const [creating, setCreating] = useState(false);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        Promise.all([
            supabase.from('perfiles').select('*').eq('rol', 'alumno').order('nombre'),
            supabase.from('ejercicios_master').select('*').order('nombre'),
        ]).then(([{ data: a }, { data: e }]) => {
            setAlumnos(a ?? []);
            setEjerciciosMaster(e ?? []);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (!selectedAlumno) { setRutinas([]); return; }
        supabase.from('rutinas').select('*').eq('alumno_id', selectedAlumno).order('creado_at')
            .then(({ data }) => setRutinas(data ?? []));
    }, [selectedAlumno]);

    const loadRutinaEjercicios = async (rutinaId: string) => {
        if (rutinaEjercicios[rutinaId]) return;
        const { data } = await supabase.from('rutina_ejercicios')
            .select('*, ejercicio:ejercicios_master(*)')
            .eq('rutina_id', rutinaId).order('orden');
        setRutinaEjercicios(prev => ({ ...prev, [rutinaId]: data ?? [] }));
    };

    const toggleRutina = (id: string) => {
        if (expandedRutina === id) { setExpandedRutina(null); return; }
        setExpandedRutina(id);
        loadRutinaEjercicios(id);
    };

    const createRutina = async () => {
        if (!selectedAlumno || !newRutinaName.trim()) { toast.error('Seleccioná un alumno y un nombre'); return; }
        setCreating(true);
        const { data, error } = await supabase.from('rutinas').insert({ alumno_id: selectedAlumno, nombre_rutina: newRutinaName.trim(), activo: true }).select().single();
        if (error) { toast.error('Error al crear'); } else {
            setRutinas(r => [...r, data]);
            setNewRutinaName('');
            toast.success('Rutina creada');
        }
        setCreating(false);
    };

    const deleteRutina = async (id: string) => {
        if (!confirm('¿Eliminar esta rutina y todos sus ejercicios?')) return;
        await supabase.from('rutinas').delete().eq('id', id);
        setRutinas(r => r.filter(x => x.id !== id));
        toast.success('Rutina eliminada');
    };

    const addEjercicio = async (rutinaId: string, ejercicioId: string) => {
        const current = rutinaEjercicios[rutinaId] ?? [];
        const { data, error } = await supabase.from('rutina_ejercicios').insert({
            rutina_id: rutinaId, ejercicio_id: ejercicioId,
            series: 3, repeticiones: 10, tiempo_descanso: 60, orden: current.length,
        }).select('*, ejercicio:ejercicios_master(*)').single();
        if (error) { toast.error('Error'); return; }
        setRutinaEjercicios(prev => ({ ...prev, [rutinaId]: [...(prev[rutinaId] ?? []), data] }));
    };

    const updateEjercicioField = (rutinaId: string, reId: string, field: string, value: number) => {
        setRutinaEjercicios(prev => ({
            ...prev,
            [rutinaId]: prev[rutinaId].map(re => re.id === reId ? { ...re, [field]: value } : re),
        }));
    };

    const saveRutinaEjercicios = async (rutinaId: string) => {
        setSaving(true);
        const items = rutinaEjercicios[rutinaId] ?? [];
        const updates = items.map(re =>
            supabase.from('rutina_ejercicios').update({ series: re.series, repeticiones: re.repeticiones, tiempo_descanso: re.tiempo_descanso, orden: re.orden }).eq('id', re.id)
        );
        await Promise.all(updates);
        toast.success('Rutina guardada');
        setSaving(false);
    };

    const removeEjercicio = async (rutinaId: string, reId: string) => {
        await supabase.from('rutina_ejercicios').delete().eq('id', reId);
        setRutinaEjercicios(prev => ({ ...prev, [rutinaId]: prev[rutinaId].filter(r => r.id !== reId) }));
    };

    return (
        <div>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Rutinas</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Armá y editá las rutinas de tus alumnos</p>
            </div>

            {/* Alumno selector */}
            <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Alumno</label>
                <select className="input-base" value={selectedAlumno} onChange={e => setSelectedAlumno(e.target.value)}
                    style={{ maxWidth: 380, cursor: 'pointer' }} id="select-alumno">
                    <option value="">Seleccionar alumno...</option>
                    {alumnos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
            </div>

            {selectedAlumno && (
                <>
                    {/* New routine */}
                    <div className="glass-card" style={{ padding: '18px 20px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
                        <input className="input-base" placeholder='Nombre ej: "Empuje A"' value={newRutinaName}
                            onChange={e => setNewRutinaName(e.target.value)} style={{ flex: 1 }}
                            onKeyDown={e => e.key === 'Enter' && createRutina()} id="new-rutina-name" />
                        <button className="btn-primary" onClick={createRutina} disabled={creating}
                            style={{ width: 'auto', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            {creating ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={16} />}
                            Agregar
                        </button>
                    </div>

                    {/* Rutinas list */}
                    {rutinas.length === 0 && (
                        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                            No hay rutinas para este alumno. ¡Creá la primera!
                        </div>
                    )}
                    {rutinas.map(rutina => (
                        <div key={rutina.id} className="glass-card" style={{ marginBottom: 12, overflow: 'hidden' }}>
                            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                onClick={() => toggleRutina(rutina.id)}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 16 }}>{rutina.nombre_rutina}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                                        {rutina.activo ? <span className="badge-active">Activa</span> : <span className="badge-expired">Inactiva</span>}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <button className="btn-danger" onClick={e => { e.stopPropagation(); deleteRutina(rutina.id); }}
                                        style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Trash2 size={14} />
                                    </button>
                                    {expandedRutina === rutina.id ? <ChevronUp size={18} color="var(--neon)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
                                </div>
                            </div>

                            {expandedRutina === rutina.id && (
                                <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px' }}>
                                    {/* Add exercise */}
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Agregar ejercicio</label>
                                        <select className="input-base" defaultValue="" onChange={e => { if (e.target.value) addEjercicio(rutina.id, e.target.value); e.target.value = ''; }}
                                            style={{ cursor: 'pointer' }}>
                                            <option value="">Seleccionar ejercicio...</option>
                                            {ejerciciosMaster.map(e => <option key={e.id} value={e.id}>{e.nombre} — {e.musculo}</option>)}
                                        </select>
                                    </div>

                                    {/* Exercise rows */}
                                    {(rutinaEjercicios[rutina.id] ?? []).map((re, idx) => (
                                        <div key={re.id} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 70px 32px', gap: 8, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>{re.ejercicio?.nombre}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{re.ejercicio?.musculo}</div>
                                            </div>
                                            <div>
                                                <label style={{ fontSize: 10, color: 'var(--text-secondary)', display: 'block' }}>Series</label>
                                                <input type="number" className="input-base" value={re.series} min={1} max={10}
                                                    onChange={e => updateEjercicioField(rutina.id, re.id, 'series', +e.target.value)}
                                                    style={{ padding: '6px 8px', textAlign: 'center', fontSize: 13 }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: 10, color: 'var(--text-secondary)', display: 'block' }}>Reps</label>
                                                <input type="number" className="input-base" value={re.repeticiones} min={1} max={100}
                                                    onChange={e => updateEjercicioField(rutina.id, re.id, 'repeticiones', +e.target.value)}
                                                    style={{ padding: '6px 8px', textAlign: 'center', fontSize: 13 }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: 10, color: 'var(--text-secondary)', display: 'block' }}>Desc(s)</label>
                                                <input type="number" className="input-base" value={re.tiempo_descanso} min={10} max={600} step={5}
                                                    onChange={e => updateEjercicioField(rutina.id, re.id, 'tiempo_descanso', +e.target.value)}
                                                    style={{ padding: '6px 8px', textAlign: 'center', fontSize: 13 }} />
                                            </div>
                                            <button className="btn-danger" onClick={() => removeEjercicio(rutina.id, re.id)} style={{ padding: '6px', alignSelf: 'flex-end' }}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}

                                    {(rutinaEjercicios[rutina.id] ?? []).length > 0 && (
                                        <button className="btn-primary" onClick={() => saveRutinaEjercicios(rutina.id)} disabled={saving}
                                            style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                            {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                                            Guardar cambios
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default function RutinasPage() {
    return (
        <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando...</div>}>
            <RutinasPageInner />
        </Suspense>
    );
}
