export interface IEvents {
    id: number;
    title: string;
    description: string;
    capacity: number;
    date: string;
    state: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
    registered_count: number;
    /** Rol del usuario actual respecto al evento (p. ej. organizador, asistente) en listados contextualizados. */
    role?: string | null;
    /** Participantes (rol usuario) que cuentan para el aforo; sin organizador ni asistentes ni admins. */
    total_inscritos?: number;
}