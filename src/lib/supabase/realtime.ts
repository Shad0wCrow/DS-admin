import type { RealtimeClientOptions } from "@supabase/supabase-js";

class TransporteRealtimeDeshabilitado {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  constructor() {
    throw new Error("Realtime no esta habilitado para los clientes Supabase del servidor.");
  }
}

export const realtimeServidor = {
  transport: TransporteRealtimeDeshabilitado
} as unknown as RealtimeClientOptions;
