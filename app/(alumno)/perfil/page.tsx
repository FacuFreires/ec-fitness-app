'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, User, CreditCard, Calendar, Mail, CheckCircle, XCircle, Clock } from 'lucide-react';

function PaymentStatus({ fechaVencimiento }: { fechaVencimiento: string | null }) {
    if (!fechaVencimiento) return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={16} color="var(--yellow)" />
            <span style={{ color: 'var(--yellow)', fontWeight: 600 }}>Sin fecha de vencimiento</span>
        </div>
    );
    const diff = Math.floor((new Date(fechaVencimiento).getTime() - Date.now()) / 86400000);
    if (diff < 0) return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <XCircle size={16} color="var(--red)" />
                <span style={{ color: 'var(--red)', fontWeight: 700 }}>Pago vencido</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Venció hace {Math.abs(diff)} días. Contactá a tu entrenador.</p>
        </div>
    );
    if (diff <= 7) return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Clock size={16} color="var(--yellow)" />
                <span style={{ color: 'var(--yellow)', fontWeight: 700 }}>Por vencer</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Vence en <strong style={{ color: 'var(--yellow)' }}>{diff} días</strong> ({fechaVencimiento})</p>
        </div>
    );
    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <CheckCircle size={16} color="var(--neon)" />
                <span style={{ color: 'var(--neon)', fontWeight: 700 }}>Al día</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Próximo vencimiento: <strong style={{ color: 'var(--text-primary)' }}>{fechaVencimiento}</strong> ({diff} días)</p>
        </div>
    );
}

export default function PerfilPage() {
    const { perfil, signOut } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    if (!perfil) return null;

    return (
        <div style={{ padding: '24px 16px' }}>
            {/* Avatar & name */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32, paddingTop: 12 }}>
                <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--neon), #00c6ff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 32, fontWeight: 800, color: '#000', marginBottom: 14,
                    boxShadow: '0 0 24px rgba(5,255,122,0.3)',
                }}>
                    {perfil.nombre.charAt(0).toUpperCase()}
                </div>
                <h1 style={{ fontSize: 22, fontWeight: 800, textAlign: 'center' }}>{perfil.nombre}</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>{perfil.email}</p>
            </div>

            {/* Info cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Personal info */}
                <div className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <User size={16} color="var(--neon)" />
                        <span style={{ fontWeight: 700, fontSize: 14 }}>Datos Personales</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Nombre</span>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>{perfil.nombre}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={12} /> Email</span>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>{perfil.email}</span>
                        </div>
                    </div>
                </div>

                {/* Payment */}
                <div className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <CreditCard size={16} color="var(--neon)" />
                        <span style={{ fontWeight: 700, fontSize: 14 }}>Estado de Pago</span>
                    </div>
                    <PaymentStatus fechaVencimiento={perfil.fecha_vencimiento} />
                    {perfil.fecha_pago && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                            <Calendar size={14} color="var(--text-secondary)" />
                            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Último pago: <strong style={{ color: 'var(--text-primary)' }}>{perfil.fecha_pago}</strong></span>
                        </div>
                    )}
                </div>

                {/* Sign out */}
                <button className="btn-danger" onClick={handleSignOut} id="signout-btn"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px', width: '100%', borderRadius: 14, fontSize: 15, fontWeight: 700, marginTop: 8 }}>
                    <LogOut size={18} />
                    Cerrar sesión
                </button>
            </div>
        </div>
    );
}
