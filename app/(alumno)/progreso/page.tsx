'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EjercicioMaster, LogProgreso } from '@/types/database';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ProgresoPage() {
    const { user } = useAuth();
    const [ejercicios, setEjercicios] = useState<EjercicioMaster[]>([]);
    const [selectedEjercicio, setSelectedEjercicio] = useState<string>('');
    const [logs, setLogs] = useState<LogProgreso[]>([]);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (!user) return;
        // Load only exercises this alumno has logged
        supabase.from('logs_progreso').select('ejercicio_id').eq('alumno_id', user.id)
            .then(async ({ data }) => {
                const ids = [...new Set((data ?? []).map(l => l.ejercicio_id))];
                if (ids.length === 0) return;
                const { data: ejs } = await supabase.from('ejercicios_master').select('*').in('id', ids).order('nombre');
                setEjercicios(ejs ?? []);
                if (ejs?.[0]) setSelectedEjercicio(ejs[0].id);
            });
    }, [user]);

    useEffect(() => {
        if (!user || !selectedEjercicio) return;
        setLoading(true);
        supabase.from('logs_progreso').select('*')
            .eq('alumno_id', user.id).eq('ejercicio_id', selectedEjercicio)
            .order('fecha').order('created_at')
            .then(({ data }) => { setLogs(data ?? []); setLoading(false); });
    }, [user, selectedEjercicio]);

    const chartData = logs.reduce<{ fecha: string; peso: number }[]>((acc, l) => {
        if (l.peso_cargado == null) return acc;
        const existing = acc.find(x => x.fecha === l.fecha);
        if (existing) { existing.peso = Math.max(existing.peso, l.peso_cargado); }
        else acc.push({ fecha: l.fecha.slice(5), peso: l.peso_cargado });
        return acc;
    }, []);

    const allWeights = logs.map(l => l.peso_cargado).filter(Boolean) as number[];
    const maxWeight = allWeights.length ? Math.max(...allWeights) : null;
    const lastTwo = chartData.slice(-2);
    const trend = lastTwo.length === 2 ? lastTwo[1].peso - lastTwo[0].peso : null;

    return (
        <div style={{ padding: '20px 16px' }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Mi Progreso</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Historial de pesos por ejercicio</p>

            {ejercicios.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
                    <p style={{ fontWeight: 600, marginBottom: 6 }}>Sin registros aún</p>
                    <p style={{ fontSize: 13 }}>Completá tu primer entrenamiento para ver tu progreso aquí.</p>
                </div>
            ) : (
                <>
                    <select className="input-base" value={selectedEjercicio} onChange={e => setSelectedEjercicio(e.target.value)}
                        style={{ marginBottom: 20, cursor: 'pointer' }}>
                        {ejercicios.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                    </select>

                    {/* Stats row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                        <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
                            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--neon)' }}>{maxWeight ?? '–'}<span style={{ fontSize: 14 }}> kg</span></div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Máximo histórico</div>
                        </div>
                        <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 24, fontWeight: 800,
                                color: trend === null ? 'var(--text-secondary)' : trend > 0 ? 'var(--neon)' : trend < 0 ? 'var(--red)' : 'var(--text-secondary)'
                            }}>
                                {trend === null ? '–' : <>{trend > 0 ? <TrendingUp size={22} /> : trend < 0 ? <TrendingDown size={22} /> : <Minus size={22} />}{Math.abs(trend)} kg</>}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Tendencia</div>
                        </div>
                    </div>

                    {/* Chart */}
                    {chartData.length > 1 && (
                        <div className="glass-card" style={{ padding: '16px', marginBottom: 20 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: 'var(--text-secondary)' }}>Peso máximo por sesión (kg)</h3>
                            <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="fecha" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                                        formatter={(v: number | undefined) => [`${v ?? 0} kg`, 'Peso']} />
                                    <Line type="monotone" dataKey="peso" stroke="var(--neon)" strokeWidth={2.5} dot={{ fill: 'var(--neon)', r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Log table */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Cargando...</div>
                    ) : (
                        <div className="glass-card" style={{ overflow: 'hidden' }}>
                            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 80px 60px', gap: 8 }}>
                                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>FECHA</span>
                                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>PESO</span>
                                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>REPS</span>
                            </div>
                            {[...logs].reverse().slice(0, 20).map(log => (
                                <div key={log.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 80px 60px', gap: 8, alignItems: 'center' }}>
                                    <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{log.fecha}</span>
                                    <span style={{ fontSize: 15, fontWeight: 700, textAlign: 'right', color: log.peso_cargado ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                        {log.peso_cargado != null ? `${log.peso_cargado} kg` : '—'}
                                    </span>
                                    <span style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'right' }}>{log.reps_hechas ?? '—'}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
