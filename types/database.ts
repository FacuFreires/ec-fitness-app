export type Role = 'admin' | 'alumno';

// ── Tabla: perfiles ────────────────────────────────────────────────────────
export interface Perfil {
    id: string;
    nombre_completo: string;
    email: string;
    rol: Role;
    fecha_vencimiento: string | null;
    pago_al_dia: boolean;
    creado_at: string;
}

// ── Tabla: ejercicios ──────────────────────────────────────────────────────
export interface Ejercicio {
    id: string;
    nombre: string;
    grupo_muscular: string;
    video_url: string | null;
    instrucciones: string | null;
    creado_at: string;
}

// ── Tabla: rutinas ─────────────────────────────────────────────────────────
export interface Rutina {
    id: string;
    alumno_id: string;
    nombre_rutina: string;
    activa: boolean;
    fecha_inicio: string | null;
    creado_at: string;
}

// ── Tabla: rutina_ejercicios ───────────────────────────────────────────────
export interface RutinaEjercicio {
    id: string;
    rutina_id: string;
    ejercicio_id: string;
    series: number;
    repeticiones: number;
    tiempo_descanso: number;
    orden: number;
    ejercicio?: Ejercicio;
}

// ── Tabla: logs_progreso ───────────────────────────────────────────────────
export interface LogProgreso {
    id: string;
    alumno_id: string;
    ejercicio_id: string;
    rutina_ejercicio_id: string | null;
    peso_cargado: number | null;
    reps_hechas: number | null;
    fecha: string;
    creado_at: string;
}
