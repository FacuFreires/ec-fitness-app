'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RutinaEjercicio, Rutina } from '@/types/database';
import { ChevronDown, ChevronUp, CheckCircle, Play, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Rest Timer Component ───────────────────────────────────────────────
function RestTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
    const [remaining, setRemaining] = useState(seconds);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setRemaining(r => {
                if (r <= 1) { clearInterval(intervalRef.current ?? undefined); onDone(); return 0; }
                return r - 1;
            });
        }, 1000);
        return () => clearInterval(intervalRef.current ?? undefined);
    }, []);

    const pct = remaining / seconds;
    const r = 44;
    const circ = 2 * Math.PI * r;
    const dash = circ * pct;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)',
                zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
            }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, letterSpacing: 1 }}>DESCANSO</p>
            <div style={{ position: 'relative', width: 120, height: 120 }}>
                <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
                    <circle cx="60" cy="60" r={r} fill="none" stroke="var(--neon)" strokeWidth="6"
                        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 0.9s linear' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 32, fontWeight: 800, color: remaining <= 5 ? 'var(--red)' : 'var(--neon)' }}>{remaining}</span>
                </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>seg restantes</p>
            <button className="btn-ghost" onClick={onDone} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                <X size={14} /> Omitir
            </button>
        </motion.div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function EntrenarPage() {
    const { user } = useAuth();
    const [rutinas, setRutinas] = useState<Rutina[]>([]);
    const [selectedRutina, setSelectedRutina] = useState<string>('');
    const [ejercicios, setEjercicios] = useState<RutinaEjercicio[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [seriesState, setSeriesState] = useState<Record<string, { peso: string; reps: string; done: boolean[] }>>({});
    const [timer, setTimer] = useState<{ seconds: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (!user) return;
        supabase.from('rutinas').select('*').eq('alumno_id', user.id).eq('activo', true).order('creado_at')
            .then(({ data }) => { setRutinas(data ?? []); if (data?.[0]) setSelectedRutina(data[0].id); setLoading(false); });
    }, [user]);

    useEffect(() => {
        if (!selectedRutina) return;
        supabase.from('rutina_ejercicios').select('*, ejercicio:ejercicios_master(*)')
            .eq('rutina_id', selectedRutina).order('orden')
            .then(({ data }) => {
                setEjercicios(data ?? []);
                const init: Record<string, { peso: string; reps: string; done: boolean[] }> = {};
                (data ?? []).forEach(re => {
                    init[re.id] = { peso: '', reps: String(re.repeticiones), done: Array(re.series).fill(false) };
                });
                setSeriesState(init);
                setExpandedId(null);
            });
    }, [selectedRutina]);

    const completeSerie = async (re: RutinaEjercicio, serieIdx: number) => {
        const state = seriesState[re.id];
        if (!state) return;
        const newDone = [...state.done];
        newDone[serieIdx] = true;
        setSeriesState(prev => ({ ...prev, [re.id]: { ...state, done: newDone } }));

        // Log progress
        if (user) {
            await supabase.from('logs_progreso').insert({
                alumno_id: user.id,
                ejercicio_id: re.ejercicio_id,
                rutina_ejercicio_id: re.id,
                peso_cargado: parseFloat(state.peso) || null,
                reps_hechas: parseInt(state.reps) || re.repeticiones,
                fecha: new Date().toISOString().split('T')[0],
            });
        }

        // Fire rest timer
        setTimer({ seconds: re.tiempo_descanso });
        toast.success(`Serie ${serieIdx + 1} completada 💪`);
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60dvh' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--neon)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (rutinas.length === 0) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60dvh', gap: 12, padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>🏋️</div>
            <h2 style={{ fontWeight: 700, fontSize: 20 }}>Sin rutinas asignadas</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Tu entrenador aún no te asignó una rutina.</p>
        </div>
    );

    return (
        <div style={{ padding: '20px 16px' }}>
            {/* Routine selector */}
            {rutinas.length > 1 && (
                <select className="input-base" value={selectedRutina} onChange={e => setSelectedRutina(e.target.value)}
                    style={{ marginBottom: 20, cursor: 'pointer' }}>
                    {rutinas.map(r => <option key={r.id} value={r.id}>{r.nombre_rutina}</option>)}
                </select>
            )}
            {rutinas.length === 1 && (
                <div style={{ marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800 }}>{rutinas[0].nombre_rutina}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{ejercicios.length} ejercicios</p>
                </div>
            )}

            {/* Exercises */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {ejercicios.map((re, idx) => {
                    const expanded = expandedId === re.id;
                    const state = seriesState[re.id];
                    const allDone = state?.done.every(Boolean);

                    return (
                        <div key={re.id} className="glass-card" style={{ overflow: 'hidden', border: allDone ? '1px solid rgba(5,255,122,0.4)' : undefined }}>
                            {/* Header */}
                            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
                                onClick={() => setExpandedId(expanded ? null : re.id)}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                    background: allDone ? 'var(--neon)' : 'var(--bg-card2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '2px solid', borderColor: allDone ? 'var(--neon)' : 'var(--border)',
                                    transition: 'all 0.3s',
                                }}>
                                    {allDone ? <CheckCircle size={18} color="#000" /> : <span style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: 13 }}>{idx + 1}</span>}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {re.ejercicio?.nombre}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                                        {re.series} series × {re.repeticiones} reps · {re.tiempo_descanso}s descanso
                                    </div>
                                </div>
                                {expanded ? <ChevronUp size={18} color="var(--neon)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
                            </div>

                            {/* Expanded */}
                            <AnimatePresence>
                                {expanded && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                                        <div style={{ borderTop: '1px solid var(--border)' }}>
                                            {/* GIF */}
                                            {re.ejercicio?.gif_url && (
                                                <div style={{ background: 'var(--bg-card2)', maxHeight: 220, overflow: 'hidden' }}>
                                                    <img src={re.ejercicio.gif_url} alt={re.ejercicio.nombre} loading="lazy"
                                                        style={{ width: '100%', maxHeight: 220, objectFit: 'cover' }} />
                                                </div>
                                            )}

                                            <div style={{ padding: '16px' }}>
                                                {/* Inputs */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                                                    <div>
                                                        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Peso (kg)</label>
                                                        <input type="number" className="input-base" placeholder="0" value={state?.peso ?? ''}
                                                            onChange={e => setSeriesState(p => ({ ...p, [re.id]: { ...p[re.id], peso: e.target.value } }))}
                                                            style={{ textAlign: 'center', fontSize: 18, fontWeight: 700, padding: '10px' }} inputMode="decimal" />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Reps realizadas</label>
                                                        <input type="number" className="input-base" placeholder={String(re.repeticiones)} value={state?.reps ?? ''}
                                                            onChange={e => setSeriesState(p => ({ ...p, [re.id]: { ...p[re.id], reps: e.target.value } }))}
                                                            style={{ textAlign: 'center', fontSize: 18, fontWeight: 700, padding: '10px' }} inputMode="numeric" />
                                                    </div>
                                                </div>

                                                {/* Series buttons */}
                                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                    {Array.from({ length: re.series }, (_, i) => (
                                                        <button key={i} onClick={() => !state?.done[i] && completeSerie(re, i)}
                                                            style={{
                                                                flex: 1, minWidth: 60, padding: '12px 8px', borderRadius: 12, cursor: state?.done[i] ? 'default' : 'pointer',
                                                                background: state?.done[i] ? 'rgba(5,255,122,0.15)' : 'var(--bg-card2)',
                                                                color: state?.done[i] ? 'var(--neon)' : 'var(--text-primary)',
                                                                fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
                                                                border: `1px solid ${state?.done[i] ? 'rgba(5,255,122,0.4)' : 'var(--border)'}`,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                                                            }}>
                                                            {state?.done[i] ? <CheckCircle size={14} /> : <Play size={14} />}
                                                            Serie {i + 1}
                                                        </button>
                                                    ))}
                                                </div>

                                                {re.ejercicio?.descripcion && (
                                                    <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 14, lineHeight: 1.5, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                                                        {re.ejercicio.descripcion}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* Rest Timer overlay */}
            <AnimatePresence>
                {timer && <RestTimer seconds={timer.seconds} onDone={() => setTimer(null)} />}
            </AnimatePresence>
        </div>
    );
}
