import { useEffect, useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type React from 'react';
import type { StockItem, StockMovement, StockMovementType } from '../types/orders';

interface StockManagementSectionProps {
  stock: StockItem[];
  setStock: Dispatch<SetStateAction<StockItem[]>>;
  movements: StockMovement[];
  onRegisterMovements: (movements: Array<Omit<StockMovement, 'id' | 'createdAt'>>) => void;
}

type EditableRowState = Record<string, { total: string; reserved: string }>;

const movementTypeLabels: Record<StockMovementType, string> = {
  ENTRY: 'Entrada',
  RESERVATION: 'Reserva',
  RELEASE: 'Liberacao',
  EXIT: 'Saida',
};

const movementTypeClass: Record<StockMovementType, string> = {
  ENTRY: 'bg-emerald-500/15 text-emerald-400 light:bg-emerald-100 light:text-emerald-700',
  RESERVATION: 'bg-sky-500/15 text-sky-400 light:bg-sky-100 light:text-sky-700',
  RELEASE: 'bg-amber-500/15 text-amber-400 light:bg-amber-100 light:text-amber-700',
  EXIT: 'bg-rose-500/15 text-rose-400 light:bg-rose-100 light:text-rose-700',
};

function toLocalDateTime(isoDate: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(isoDate));
}

function toInputDate(isoDate: string) {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function StockManagementSection({ stock, setStock, movements, onRegisterMovements }: StockManagementSectionProps) {
  const [editableRows, setEditableRows] = useState<EditableRowState>({});
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [importFeedback, setImportFeedback] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState<'ALL' | StockMovementType>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const nextEditableRows = stock.reduce<EditableRowState>((acc, item) => {
      acc[item.produto] = {
        total: String(item.total),
        reserved: String(item.reservado),
      };
      return acc;
    }, {});

    setEditableRows(nextEditableRows);
  }, [stock]);

  const handleSaveRow = (productName: string) => {
    const stockItem = stock.find(item => item.produto === productName);
    const editable = editableRows[productName];

    if (!stockItem || !editable) {
      return;
    }

    const newTotal = Number(editable.total);
    const newReserved = Number(editable.reserved);

    if (!Number.isFinite(newTotal) || !Number.isFinite(newReserved) || newTotal < 0 || newReserved < 0) {
      setRowErrors(current => ({ ...current, [productName]: 'Valores invalidos. Use numeros positivos.' }));
      return;
    }

    if (newReserved > newTotal) {
      setRowErrors(current => ({ ...current, [productName]: 'Reservado nao pode ser maior que total.' }));
      return;
    }

    setRowErrors(current => ({ ...current, [productName]: '' }));

    const movementsToRegister: Array<Omit<StockMovement, 'id' | 'createdAt'>> = [];
    const totalDiff = newTotal - stockItem.total;
    const reservedDiff = newReserved - stockItem.reservado;

    if (totalDiff > 0) {
      movementsToRegister.push({
        product: productName,
        type: 'ENTRY',
        quantity: totalDiff,
        source: 'Ajuste manual de estoque fisico',
      });
    } else if (totalDiff < 0) {
      movementsToRegister.push({
        product: productName,
        type: 'EXIT',
        quantity: Math.abs(totalDiff),
        source: 'Ajuste manual de estoque fisico',
      });
    }

    if (reservedDiff > 0) {
      movementsToRegister.push({
        product: productName,
        type: 'RESERVATION',
        quantity: reservedDiff,
        source: 'Ajuste manual de reservado',
      });
    } else if (reservedDiff < 0) {
      movementsToRegister.push({
        product: productName,
        type: 'RELEASE',
        quantity: Math.abs(reservedDiff),
        source: 'Liberacao manual de reservado',
      });
    }

    setStock(currentStock =>
      currentStock.map(item =>
        item.produto === productName
          ? { ...item, total: newTotal, reservado: newReserved }
          : item,
      ),
    );

    if (movementsToRegister.length > 0) {
      onRegisterMovements(movementsToRegister);
    }
  };

  const handleImportCsv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    const lines = text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      setImportFeedback('CSV vazio ou sem linhas de dados.');
      return;
    }

    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    const productIndex = headers.findIndex(h => h === 'produto' || h === 'product');
    const totalIndex = headers.findIndex(h => h === 'total_quantity' || h === 'total');
    const reservedIndex = headers.findIndex(h => h === 'reserved_quantity' || h === 'reserved' || h === 'reservado');

    if (productIndex === -1 || totalIndex === -1 || reservedIndex === -1) {
      setImportFeedback('Cabecalho invalido. Use: produto,total_quantity,reserved_quantity');
      return;
    }

    const parsedRows = lines.slice(1).map(line => {
      const cols = line.split(',').map(col => col.trim());
      return {
        produto: cols[productIndex],
        total: Number(cols[totalIndex]),
        reservado: Number(cols[reservedIndex]),
      };
    }).filter(row => row.produto);

    let updatedCount = 0;
    const importMovements: Array<Omit<StockMovement, 'id' | 'createdAt'>> = [];

    setStock(currentStock => {
      const byProduct = new Map(currentStock.map(item => [item.produto, item]));

      parsedRows.forEach(row => {
        if (!Number.isFinite(row.total) || !Number.isFinite(row.reservado) || row.total < 0 || row.reservado < 0 || row.reservado > row.total) {
          return;
        }

        const previous = byProduct.get(row.produto);
        if (!previous) {
          byProduct.set(row.produto, { produto: row.produto, total: row.total, reservado: row.reservado });
          updatedCount += 1;

          if (row.total > 0) {
            importMovements.push({
              product: row.produto,
              type: 'ENTRY',
              quantity: row.total,
              source: 'Importacao CSV',
            });
          }

          if (row.reservado > 0) {
            importMovements.push({
              product: row.produto,
              type: 'RESERVATION',
              quantity: row.reservado,
              source: 'Importacao CSV',
            });
          }
          return;
        }

        const totalDiff = row.total - previous.total;
        const reservedDiff = row.reservado - previous.reservado;

        byProduct.set(row.produto, { ...previous, total: row.total, reservado: row.reservado });
        updatedCount += 1;

        if (totalDiff > 0) {
          importMovements.push({
            product: row.produto,
            type: 'ENTRY',
            quantity: totalDiff,
            source: 'Importacao CSV',
          });
        } else if (totalDiff < 0) {
          importMovements.push({
            product: row.produto,
            type: 'EXIT',
            quantity: Math.abs(totalDiff),
            source: 'Importacao CSV',
          });
        }

        if (reservedDiff > 0) {
          importMovements.push({
            product: row.produto,
            type: 'RESERVATION',
            quantity: reservedDiff,
            source: 'Importacao CSV',
          });
        } else if (reservedDiff < 0) {
          importMovements.push({
            product: row.produto,
            type: 'RELEASE',
            quantity: Math.abs(reservedDiff),
            source: 'Importacao CSV',
          });
        }
      });

      return Array.from(byProduct.values());
    });

    if (importMovements.length > 0) {
      onRegisterMovements(importMovements);
    }

    setImportFeedback(`${updatedCount} produto(s) processado(s) via CSV.`);
    event.target.value = '';
  };

  const filteredMovements = useMemo(() => {
    return movements
      .filter(movement => {
        if (movementTypeFilter !== 'ALL' && movement.type !== movementTypeFilter) {
          return false;
        }

        const movementDate = toInputDate(movement.createdAt);
        if (startDate && movementDate < startDate) {
          return false;
        }

        if (endDate && movementDate > endDate) {
          return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [movements, movementTypeFilter, startDate, endDate]);

  return (
    <div className="mt-8 grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6">
      <section className="bg-[#141414] dark:bg-[#141414] light:bg-white border border-[#222222] light:border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#222222] light:border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold !text-white dark:!text-white light:!text-gray-900">Estoque fisico</h2>
            <p className="text-sm text-gray-500 light:text-gray-600">Disponivel = Total - Reservado</p>
          </div>

          <label className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-md border border-[#2a2a2a] light:border-gray-300 text-gray-300 light:text-gray-700 cursor-pointer">
            Importar CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleImportCsv} />
          </label>
        </div>

        {importFeedback && (
          <p className="px-5 py-3 text-sm text-[#00ff66] light:text-green-700 border-b border-[#222222] light:border-gray-200">{importFeedback}</p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-[#222222] light:border-gray-200 text-left">
                <th className="px-5 py-3 text-xs uppercase tracking-wide text-gray-500">Produto</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wide text-gray-500">Total</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wide text-gray-500">Reservado</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wide text-gray-500">Disponivel</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wide text-gray-500">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {stock.map(item => {
                const available = item.total - item.reservado;
                const isLowStock = available <= 20;
                const rowEdit = editableRows[item.produto] ?? { total: String(item.total), reserved: String(item.reservado) };

                return (
                  <tr key={item.produto} className="border-b border-[#222222] light:border-gray-200">
                    <td className="px-5 py-4 text-sm text-white dark:text-white light:text-gray-900">{item.produto}</td>
                    <td className="px-5 py-4 text-sm">
                      <input
                        type="number"
                        min={0}
                        value={rowEdit.total}
                        onChange={event => {
                          const value = event.target.value;
                          setEditableRows(current => ({
                            ...current,
                            [item.produto]: {
                              total: value,
                              reserved: current[item.produto]?.reserved ?? String(item.reservado),
                            },
                          }));
                        }}
                        className="w-24 rounded-md bg-[#0f0f0f] dark:bg-[#0f0f0f] light:bg-gray-50 border border-[#2a2a2a] light:border-gray-300 px-2 py-1 text-xs text-white dark:text-white light:text-gray-900"
                      />
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <input
                        type="number"
                        min={0}
                        value={rowEdit.reserved}
                        onChange={event => {
                          const value = event.target.value;
                          setEditableRows(current => ({
                            ...current,
                            [item.produto]: {
                              total: current[item.produto]?.total ?? String(item.total),
                              reserved: value,
                            },
                          }));
                        }}
                        className="w-24 rounded-md bg-[#0f0f0f] dark:bg-[#0f0f0f] light:bg-gray-50 border border-[#2a2a2a] light:border-gray-300 px-2 py-1 text-xs text-white dark:text-white light:text-gray-900"
                      />
                    </td>
                    <td className={`px-5 py-4 text-sm ${isLowStock ? 'text-amber-400 light:text-amber-700 font-semibold' : 'text-gray-300 light:text-gray-700'}`}>
                      {available}
                      {isLowStock && <span className="ml-2 text-xs">(baixo)</span>}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <button
                        type="button"
                        onClick={() => handleSaveRow(item.produto)}
                        className="text-xs px-2.5 py-1 rounded-md bg-[#00ff66]/15 text-[#00ff66] light:bg-green-100 light:text-green-700 hover:bg-[#00ff66]/25 transition-colors"
                      >
                        Salvar
                      </button>
                      {rowErrors[item.produto] && (
                        <p className="mt-1 text-xs text-red-400 light:text-red-700">{rowErrors[item.produto]}</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-[#141414] dark:bg-[#141414] light:bg-white border border-[#222222] light:border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#222222] light:border-gray-200">
          <h2 className="text-lg font-semibold !text-white dark:!text-white light:!text-gray-900">Historico de movimentacoes</h2>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              value={movementTypeFilter}
              onChange={event => setMovementTypeFilter(event.target.value as 'ALL' | StockMovementType)}
              className="rounded-md bg-[#0f0f0f] dark:bg-[#0f0f0f] light:bg-gray-50 border border-[#2a2a2a] light:border-gray-300 px-2 py-2 text-xs text-white dark:text-white light:text-gray-900"
            >
              <option value="ALL">Todos os tipos</option>
              <option value="ENTRY">ENTRY</option>
              <option value="RESERVATION">RESERVATION</option>
              <option value="RELEASE">RELEASE</option>
              <option value="EXIT">EXIT</option>
            </select>
            <input
              type="date"
              value={startDate}
              onChange={event => setStartDate(event.target.value)}
              className="rounded-md bg-[#0f0f0f] dark:bg-[#0f0f0f] light:bg-gray-50 border border-[#2a2a2a] light:border-gray-300 px-2 py-2 text-xs text-white dark:text-white light:text-gray-900"
            />
            <input
              type="date"
              value={endDate}
              onChange={event => setEndDate(event.target.value)}
              className="rounded-md bg-[#0f0f0f] dark:bg-[#0f0f0f] light:bg-gray-50 border border-[#2a2a2a] light:border-gray-300 px-2 py-2 text-xs text-white dark:text-white light:text-gray-900"
            />
          </div>
        </div>

        <div className="max-h-[520px] overflow-y-auto p-4 space-y-2">
          {filteredMovements.length === 0 && (
            <p className="text-sm text-gray-500 light:text-gray-600">Nenhuma movimentacao para os filtros selecionados.</p>
          )}

          {filteredMovements.map(movement => (
            <div key={movement.id} className="rounded-lg border border-[#2a2a2a] light:border-gray-200 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-white dark:text-white light:text-gray-900">{movement.product}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${movementTypeClass[movement.type]}`}>
                  {movementTypeLabels[movement.type]}
                </span>
              </div>
              <p className="text-xs text-gray-400 light:text-gray-600 mt-1">Quantidade: {movement.quantity}</p>
              <p className="text-xs text-gray-500 mt-1">{movement.source}</p>
              <p className="text-[11px] text-gray-500 mt-1">{toLocalDateTime(movement.createdAt)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
