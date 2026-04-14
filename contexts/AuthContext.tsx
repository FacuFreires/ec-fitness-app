'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Perfil } from '@/types/database';

interface AuthContextType {
    user: User | null;
    perfil: Perfil | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signUp: (email: string, password: string, nombre: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [perfil, setPerfil] = useState<Perfil | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);

            if (session?.user) {
                try {
                    const { data, error } = await supabase
                        .from('perfiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (error) {
                        console.error('[AuthContext] Error al obtener perfil:', error.message);
                        setPerfil(null);
                    } else {
                        setPerfil(data as Perfil);
                    }
                } catch (err) {
                    console.error('[AuthContext] Excepción al obtener perfil:', err);
                    setPerfil(null);
                }
            } else {
                setPerfil(null);
            }

            // Siempre cerrar el loading, sin importar el resultado
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
    };

    /**
     * Registra un nuevo usuario.
     * El trigger `handle_new_user` en Supabase lee `raw_user_meta_data->>'nombre_completo'`
     * y crea la fila en `perfiles` con ese valor.
     */
    const signUp = async (email: string, password: string, nombre: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { nombre_completo: nombre },
            },
        });
        return { error: error?.message ?? null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, perfil, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
