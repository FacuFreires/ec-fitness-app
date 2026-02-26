'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Users, Dumbbell, LayoutDashboard, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { href: '/admin/alumnos', label: 'Alumnos', icon: Users },
    { href: '/admin/ejercicios', label: 'Ejercicios', icon: Dumbbell },
    { href: '/admin/rutinas', label: 'Rutinas', icon: LayoutDashboard },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { perfil, loading, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (!loading && perfil?.rol !== 'admin') router.replace('/entrenar');
    }, [perfil, loading]);

    if (loading) return (
        <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--neon)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100dvh', flexDirection: 'column' }}>
            {/* Top Header */}
            <header style={{
                background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
                padding: '0 20px', height: 60, display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '10px',
                        background: 'linear-gradient(135deg, var(--neon), #00c6ff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Dumbbell size={20} color="#000" />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 18 }}>EC <span className="neon-text">Fitness</span></span>
                    <span style={{ background: 'rgba(5,255,122,0.15)', color: 'var(--neon)', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(5,255,122,0.3)' }}>ADMIN</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{perfil?.nombre}</span>
                    <button onClick={signOut} className="btn-ghost" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <LogOut size={14} /> Salir
                    </button>
                </div>
            </header>

            <div style={{ display: 'flex', flex: 1 }}>
                {/* Sidebar (desktop) */}
                <nav style={{
                    width: 220, background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
                    padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: 6,
                    position: 'sticky', top: 60, height: 'calc(100dvh - 60px)',
                }} className="admin-sidebar">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const active = pathname.startsWith(href);
                        return (
                            <Link key={href} href={href} style={{
                                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                                borderRadius: 12, textDecoration: 'none', fontWeight: 500, fontSize: 14,
                                transition: 'all 0.15s',
                                background: active ? 'rgba(5,255,122,0.12)' : 'transparent',
                                color: active ? 'var(--neon)' : 'var(--text-secondary)',
                                border: active ? '1px solid rgba(5,255,122,0.2)' : '1px solid transparent',
                            }}>
                                <Icon size={18} />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Main Content */}
                <main style={{ flex: 1, padding: '28px 24px', overflow: 'auto' }}>
                    {children}
                </main>
            </div>

            <style>{`
        @media (max-width: 640px) {
          .admin-sidebar { display: none; }
        }
      `}</style>
        </div>
    );
}
