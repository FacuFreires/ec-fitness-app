export type Role = 'admin' | 'alumno';

export interface Perfil {
    id: string;
    nombre: string;
    email: string;
    rol: Role;
    fecha_pago: string | null;
    fecha_vencimiento: string | null;
    id_entrenador: string | null;
    created_at: string;
}

export interface EjercicioMaster {
    id: string;
    nombre: string;
    musculo: string;
    gif_url: string | null;
    descripcion: string | null;
    created_at: string;
}

export interface Rutina {
    id: string;
    alumno_id: string;
    nombre_rutina: string;
    activo: boolean;
    creado_at: string;
}

export interface RutinaEjercicio {
    id: string;
    rutina_id: string;
    ejercicio_id: string;
    series: number;
    repeticiones: number;
    tiempo_descanso: number;
    orden: number;
    ejercicio?: EjercicioMaster;
}

export interface LogProgreso {
    id: string;
    alumno_id: string;
    ejercicio_id: string;
    rutina_ejercicio_id: string | null;
    peso_cargado: number | null;
    reps_hechas: number | null;
    fecha: string;
    created_at: string;
}
