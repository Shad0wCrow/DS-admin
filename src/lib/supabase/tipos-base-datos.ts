import type { RolUsuario } from "@/lib/autenticacion/roles";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type EstadoGeneral = "activo" | "inactivo";
export type EstadoTanda =
  | "PLANIFICADA"
  | "ABIERTA"
  | "CERRADA"
  | "CANCELADA"
  | "planificada"
  | "abierta"
  | "cerrada"
  | "cancelada";
export type EstadoLiquidacion = "PENDIENTE" | "PAGADO" | "ANULADA";
export type EstadoInscripcion = string;

export type Usuario = {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string | null;
  rol: RolUsuario;
  estado: EstadoGeneral;
  foto_url: string | null;
  creado_en: string;
  actualizado_en: string;
};

export type Docente = {
  id: string;
  usuario_id: string | null;
  qr_url: string | null;
  creado_en: string;
};

export type Estudiante = {
  id: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  correo: string | null;
  creado_en: string;
};

export type Curso = {
  id: string;
  docente_id: string | null;
  nombre: string;
  descripcion: string | null;
  duracion: string;
  precio: number;
  activo: boolean;
  creado_en: string;
};

export type Tanda = {
  id: string;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: EstadoTanda;
  creado_en: string;
};

export type Inscripcion = {
  id: string;
  estudiante_id: string;
  curso_id: string;
  tanda_id: string;
  registrado_por: string | null;
  monto_pagado: number;
  comprobante_url: string | null;
  estado: EstadoInscripcion;
  creado_en: string;
};

export type Liquidacion = {
  id: string;
  docente_id: string;
  tanda_id: string;
  cantidad_inscritos: number;
  monto_total: number;
  monto_docente: number;
  monto_empresa: number;
  monto_instituto: number | null;
  estado: EstadoLiquidacion;
  creado_en: string;
};

export type PagoDocente = {
  id: string;
  liquidacion_id: string;
  pagado_por: string | null;
  monto: number;
  fecha_pago: string;
};

export type TandaCurso = {
  id: string;
  tanda_id: string;
  curso_id: string;
};

type Tabla<T> = {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
  Relationships: [];
};

export type BaseDatos = {
  public: {
    Tables: {
      usuarios: Tabla<Usuario>;
      docentes: Tabla<Docente>;
      estudiantes: Tabla<Estudiante>;
      cursos: Tabla<Curso>;
      tandas: Tabla<Tanda>;
      tanda_cursos: Tabla<TandaCurso>;
      inscripciones: Tabla<Inscripcion>;
      configuracion: Tabla<{
        id: string;
        porcentaje_docente: number;
        porcentaje_empresa: number;
        actualizado_por: string | null;
        actualizado_en: string;
      }>;
      liquidaciones: Tabla<Liquidacion>;
      pagos_docentes: Tabla<PagoDocente>;
      auditoria: Tabla<{
        id: string;
        usuario_id: string | null;
        accion: string;
        tabla_afectada: string;
        registro_id: string | null;
        datos_anteriores: Json | null;
        datos_nuevos: Json | null;
        fecha: string;
      }>;
      temarios_docentes: Tabla<{
        id: string;
        docente_id: string;
        materia: string;
        descripcion: string | null;
        creado_en: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      rol_usuario: RolUsuario;
      estado_general: EstadoGeneral;
      estado_tanda: EstadoTanda;
      estado_liquidacion: EstadoLiquidacion;
    };
    CompositeTypes: Record<string, never>;
  };
};
