// src/types/order.ts
export type OrderStatus =
  | 'SOLICITADO'
  | 'ACEITO'
  | 'PAGAMENTO_CONFIRMADO'
  | 'EM_SEPARACAO'
  | 'SAIU_PARA_ENTREGA'
  | 'ENTREGUE'
  | 'RECUSADO';

export interface Order {
  id: string;
  cliente: string;
  valorTotal: number;
  status: OrderStatus;
  dataDesejada: string;
  itens: Array<{ nome: string; quantidade: number; preco: number }>;
}

export interface StockItem {
  codigo: string;
  produto: string;
  total: number;
  reservado: number;
  fotoUrl?: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  description: string;
  createdAt: string;
}

export type StockMovementType = 'ENTRY' | 'RESERVATION' | 'RELEASE' | 'EXIT';

export interface StockMovement {
  id: string;
  product: string;
  type: StockMovementType;
  quantity: number;
  source: string;
  createdAt: string;
}