'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Dumbbell, Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegistroPage() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!nombre.trim()) {
            toast.error('El nombre es obligatorio');
            return;
        }
        if (password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        const { error } = await signUp(email.trim(), password, nombre.trim());

        if (error) {
            // Mensaje amigable para errores comunes de Supabase
            const msg =
                error.includes('already registered') || error.includes('already been registered')
                    ? 'Este email ya está registrado. ¿Querés iniciar sesión?'
                    : error.includes('invalid email')
                    ? 'El email ingresado no es válido'
                    : 'No se pudo crear la cuenta. Intentá de nuevo.';
            toast.error(msg);
            setLoading(false);
            return;
        }

        toast.success('¡Cuenta creada! Revisá tu email para confirmarla.');
        // Si Supabase tiene email confirmation desactivado, redirigimos directo
        router.push('/entrenar');
    };

    return (
        <div
            style={{
                minHeight: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                background:
                    'radial-gradient(ellipse at 50% 0%, rgba(5,255,122,0.08) 0%, transparent 65%), var(--bg-base)',
            }}
        >
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                <div
                    style={{
                        width: 72,
                        height: 72,
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, var(--neon), #00c6ff)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        boxShadow: '0 0 32px rgba(5,255,122,0.3)',
                    }}
                >
                    <Dumbbell size={36} color="#000" />
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>
                    EC <span className="neon-text">Fitness</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 14 }}>
                    Creá tu cuenta y empezá a entrenar
                </p>
            </div>

            {/* Card */}
            <div className="glass-card" style={{ width: '100%', maxWidth: 400, padding: '32px 28px' }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Crear cuenta</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Nombre completo */}
                    <div>
                        <label
                            htmlFor="registro-nombre"
                            style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 500 }}
                        >
                            Nombre completo
                        </label>
                        <div style={{ position: 'relative' }}>
                            <User
                                size={16}
                                color="var(--text-secondary)"
                                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                            />
                            <input
                                id="registro-nombre"
                                type="text"
                                placeholder="Juan Pérez"
                                value={nombre}
                                onChange={e => setNombre(e.target.value)}
                                className="input-base"
                                style={{ paddingLeft: 42 }}
                                required
                                autoComplete="name"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label
                            htmlFor="registro-email"
                            style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 500 }}
                        >
                            Email
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail
                                size={16}
                                color="var(--text-secondary)"
                                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                            />
                            <input
                                id="registro-email"
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="input-base"
                                style={{ paddingLeft: 42 }}
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    {/* Contraseña */}
                    <div>
                        <label
                            htmlFor="registro-password"
                            style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 500 }}
                        >
                            Contraseña <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(mínimo 6 caracteres)</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock
                                size={16}
                                color="var(--text-secondary)"
                                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                            />
                            <input
                                id="registro-password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="input-base"
                                style={{ paddingLeft: 42, paddingRight: 44 }}
                                required
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                style={{
                                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0,
                                }}
                                tabIndex={-1}
                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirmar contraseña */}
                    <div>
                        <label
                            htmlFor="registro-confirm"
                            style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 500 }}
                        >
                            Confirmar contraseña
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock
                                size={16}
                                color={confirmPassword && confirmPassword !== password ? 'var(--red)' : 'var(--text-secondary)'}
                                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                            />
                            <input
                                id="registro-confirm"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="input-base"
                                style={{
                                    paddingLeft: 42,
                                    borderColor:
                                        confirmPassword && confirmPassword !== password
                                            ? 'var(--red)'
                                            : confirmPassword && confirmPassword === password
                                            ? 'var(--neon)'
                                            : undefined,
                                }}
                                required
                                autoComplete="new-password"
                            />
                        </div>
                        {confirmPassword && confirmPassword !== password && (
                            <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 5 }}>
                                Las contraseñas no coinciden
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        id="registro-submit"
                        style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                Creando cuenta...
                            </>
                        ) : (
                            'Crear cuenta'
                        )}
                    </button>
                </form>

                {/* Link a login */}
                <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
                    ¿Ya tenés cuenta?{' '}
                    <Link
                        href="/login"
                        style={{ color: 'var(--neon)', fontWeight: 600, textDecoration: 'none' }}
                    >
                        Ingresar
                    </Link>
                </p>
            </div>

            <p style={{ color: 'var(--text-secondary)', marginTop: 24, fontSize: 13 }}>
                © 2026 EC Fitness · Todos los derechos reservados
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
