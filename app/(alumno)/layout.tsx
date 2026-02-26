'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Dumbbell, TrendingUp, User } from 'lucide-react';

const tabs = [
    { href: '/entrenar', label: 'Entrenar', icon: Dumbbell },
    { href: '/progreso', label: 'Progreso', icon: TrendingUp },
    { href: '/perfil', label: 'Perfil', icon: User },
];

export default function AlumnoLayout({ children }: { children: React.ReactNode }) {
    const { perfil, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && perfil?.rol === 'admin') router.replace('/admin/alumnos');
    }, [perfil, loading]);

    if (loading) return (
        <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--neon)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
            {/* Top bar */}
            <header style={{
                background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
                padding: '0 20px', height: 56, display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '9px', background: 'linear-gradient(135deg, var(--neon), #00c6ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Dumbbell size={18} color="#000" />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 17 }}>EC <span className="neon-text">Fitness</span></span>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{perfil?.nombre}</span>
            </header>

            {/* Content */}
            <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
                {children}
            </main>

            {/* Bottom Tab Bar */}
            <nav style={{
                position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: '100%', maxWidth: 480,
                background: 'var(--bg-card)', borderTop: '1px solid var(--border)',
                display: 'flex', height: 68, zIndex: 50,
                paddingBottom: 'env(safe-area-inset-bottom)',
            }}>
                {tabs.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href;
                    return (
                        <Link key={href} href={href} style={{
                            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            gap: 4, textDecoration: 'none', color: active ? 'var(--neon)' : 'var(--text-secondary)',
                            transition: 'color 0.15s', position: 'relative',
                        }}>
                            {active && (
                                <div style={{ position: 'absolute', top: 0, left: '25%', right: '25%', height: 2, background: 'var(--neon)', borderRadius: '0 0 2px 2px' }} />
                            )}
                            <Icon size={22} />
                            <span style={{ fontSize: 11, fontWeight: active ? 600 : 400 }}>{label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
