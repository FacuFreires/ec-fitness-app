'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Dumbbell, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, perfil } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await signIn(email, password);
        if (error) {
            toast.error('Credenciales incorrectas');
            setLoading(false);
            return;
        }
        // Redirect based on role (perfil updates via onAuthStateChange)
        await new Promise(r => setTimeout(r, 600));
        const rol = perfil?.rol;
        router.push(rol === 'admin' ? '/admin/alumnos' : '/entrenar');
    };

    return (
        <div style={{
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(5,255,122,0.08) 0%, transparent 65%), var(--bg-base)',
        }}>
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{
                    width: 72, height: 72, borderRadius: '20px',
                    background: 'linear-gradient(135deg, var(--neon), #00c6ff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px', boxShadow: '0 0 32px rgba(5,255,122,0.3)',
                }}>
                    <Dumbbell size={36} color="#000" />
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>
                    EC <span className="neon-text">Fitness</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 14 }}>
                    Tu entrenamiento, tu progreso
                </p>
            </div>

            {/* Card */}
            <div className="glass-card" style={{ width: '100%', maxWidth: 400, padding: '32px 28px' }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Iniciar sesión</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ position: 'relative' }}>
                        <Mail size={16} color="var(--text-secondary)"
                            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="input-base"
                            style={{ paddingLeft: 42 }}
                            required
                            id="login-email"
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock size={16} color="var(--text-secondary)"
                            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="input-base"
                            style={{ paddingLeft: 42 }}
                            required
                            id="login-password"
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading} id="login-submit"
                        style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Ingresando...</> : 'Ingresar'}
                    </button>
                </form>
            </div>

            <p style={{ color: 'var(--text-secondary)', marginTop: 24, fontSize: 13 }}>
                © 2026 EC Fitness · Todos los derechos reservados
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
