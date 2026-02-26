'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Perfil } from '@/types/database';
import { Users, CheckCircle, XCircle, Clock, Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';

function paymentStatus(fechaVencimiento: string | null) {
    if (!fechaVencimiento) return { label: 'Sin datos', cls: 'badge-warning', icon: Clock };
    const diff = Math.floor((new Date(fechaVencimiento).getTime() - Date.now()) / 86400000);
    if (diff < 0) return { label: `Vencido hace ${Math.abs(diff)}d`, cls: 'badge-expired', icon: XCircle };
    if (diff <= 7) return { label: `Vence en ${diff}d`, cls: 'badge-warning', icon: Clock };
    return { label: `Al día (${diff}d)`, cls: 'badge-active', icon: CheckCircle };
}

export default function AlumnosPage() {
    const [alumnos, setAlumnos] = useState<Perfil[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        supabase.from('perfiles').select('*').eq('rol', 'alumno').order('nombre')
            .then(({ data }) => { setAlumnos(data ?? []); setLoading(false); });
    }, []);

    const filtered = alumnos.filter(a =>
        a.nombre.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase())
    );

    const stats = {
        total: alumnos.length,
        active: alumnos.filter(a => {
            if (!a.fecha_vencimiento) return false;
            return new Date(a.fecha_vencimiento) >= new Date();
        }).length,
        expired: alumnos.filter(a => {
            if (!a.fecha_vencimiento) return false;
            return new Date(a.fecha_vencimiento) < new Date();
        }).length,
    };

    return (
        <div>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Dashboard de Alumnos</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Gestión de pagos y estados</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                {[
                    { label: 'Total', value: stats.total, color: 'var(--neon)', bg: 'rgba(5,255,122,0.08)' },
                    { label: 'Al día', value: stats.active, color: 'var(--neon)', bg: 'rgba(5,255,122,0.08)' },
                    { label: 'Vencidos', value: stats.expired, color: 'var(--red)', bg: 'rgba(255,59,92,0.08)' },
                ].map(s => (
                    <div key={s.label} className="glass-card" style={{ padding: '20px 16px', textAlign: 'center', background: s.bg }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 20 }}>
                <Search size={16} color="var(--text-secondary)"
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input className="input-base" placeholder="Buscar alumno..." value={search}
                    onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 42 }} id="search-alumnos" />
            </div>

            {/* List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Cargando...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filtered.length === 0 && (
                        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                            <Users size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                            <p>No hay alumnos registrados</p>
                        </div>
                    )}
                    {filtered.map(alumno => {
                        const status = paymentStatus(alumno.fecha_vencimiento);
                        const StatusIcon = status.icon;
                        return (
                            <Link key={alumno.id} href={`/admin/rutinas?alumno=${alumno.id}`}
                                style={{ textDecoration: 'none' }}>
                                <div className="glass-card" style={{
                                    padding: '16px 20px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'space-between', cursor: 'pointer', transition: 'border-color 0.2s',
                                }}
                                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--neon)')}
                                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div style={{
                                            width: 44, height: 44, borderRadius: '50%',
                                            background: 'linear-gradient(135deg, var(--neon), #00c6ff)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 800, color: '#000', fontSize: 16, flexShrink: 0,
                                        }}>
                                            {alumno.nombre.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 15 }}>{alumno.nombre}</div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{alumno.email}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span className={status.cls} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <StatusIcon size={12} /> {status.label}
                                        </span>
                                        <ChevronRight size={16} color="var(--text-secondary)" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
