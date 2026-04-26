import type { Order, OrderStatus, StockItem } from '../types/orders';

export const orderStatusOptions: Array<{ value: OrderStatus; label: string }> = [
  { value: 'SOLICITADO', label: 'Novo' },
  { value: 'ACEITO', label: 'Reservado' },
  { value: 'PAGAMENTO_CONFIRMADO', label: 'Pagamento confirmado' },
  { value: 'EM_SEPARACAO', label: 'Em separacao' },
  { value: 'SAIU_PARA_ENTREGA', label: 'Saiu para entrega' },
  { value: 'ENTREGUE', label: 'Entregue' },
  { value: 'RECUSADO', label: 'Recusado' },
];

export const mockOrders: Order[] = [
  {
    id: 'PED-1042',
    cliente: 'Mercado Aurora',
    valorTotal: 1280.9,
    status: 'SOLICITADO',
    dataDesejada: '2026-04-27',
    itens: [
      { nome: 'Arroz 5kg', quantidade: 12, preco: 26.9 },
      { nome: 'Feijao 1kg', quantidade: 20, preco: 8.5 },
    ],
  },
  {
    id: 'PED-1043',
    cliente: 'Super Bom Preco',
    valorTotal: 892.3,
    status: 'ACEITO',
    dataDesejada: '2026-04-27',
    itens: [
      { nome: 'Acucar 1kg', quantidade: 30, preco: 5.2 },
      { nome: 'Cafe 500g', quantidade: 10, preco: 17.4 },
    ],
  },
  {
    id: 'PED-1044',
    cliente: 'Atacadao Lima',
    valorTotal: 2150,
    status: 'PAGAMENTO_CONFIRMADO',
    dataDesejada: '2026-04-28',
    itens: [
      { nome: 'Oleo 900ml', quantidade: 40, preco: 6.75 },
      { nome: 'Macarrao 500g', quantidade: 60, preco: 4.1 },
    ],
  },
  {
    id: 'PED-1045',
    cliente: 'Mercearia Central',
    valorTotal: 540.4,
    status: 'SAIU_PARA_ENTREGA',
    dataDesejada: '2026-04-26',
    itens: [{ nome: 'Farinha 1kg', quantidade: 25, preco: 7.8 }],
  },
];

export const mockStock: StockItem[] = [
  { produto: 'Arroz 5kg', total: 180, reservado: 0 },
  { produto: 'Feijao 1kg', total: 250, reservado: 0 },
  { produto: 'Acucar 1kg', total: 250, reservado: 30 },
  { produto: 'Cafe 500g', total: 150, reservado: 10 },
  { produto: 'Oleo 900ml', total: 300, reservado: 0 },
  { produto: 'Macarrao 500g', total: 450, reservado: 0 },
  { produto: 'Farinha 1kg', total: 215, reservado: 25 },
  { produto: 'Molho de Tomate 340g', total: 260, reservado: 0 },
];
