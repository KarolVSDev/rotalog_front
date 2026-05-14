import { useMemo, useState } from 'react';
import { Sidebar, type DashboardSection } from '../Components/Sidebar';
import { OrderTable } from '../Components/OrderTable';
import { StockManagementSection } from '../Components/StockManagementSection';
import { mockOrders, mockStock } from '../data/mockData';
import type { StockMovement } from '../types/orders';

interface DashboardPageProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onLogout: () => void;
  companyName: string;
}

const topNavItems: Array<{ section: DashboardSection; label: string }> = [
  { section: 'VISAO_GERAL', label: 'Visão geral' },
  { section: 'PEDIDOS', label: 'Pedidos' },
  { section: 'ESTOQUE', label: 'Estoque' },
  { section: 'ENTREGAS', label: 'Entregas' },
  { section: 'RELATORIOS', label: 'Relatórios' },
];

export function DashboardPage({ theme, toggleTheme, onLogout, companyName }: DashboardPageProps) {
  const [activeSection, setActiveSection] = useState<DashboardSection>('VISAO_GERAL');
  const [stock, setStock] = useState(mockStock);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);

  const headerTitle = useMemo(() => {
    switch (activeSection) {
      case 'PEDIDOS':
        return 'Gestão de Pedidos';
      case 'ESTOQUE':
        return 'Controle de Estoque';
      case 'ENTREGAS':
        return 'Entregas do Dia';
      case 'RELATORIOS':
        return 'Relatórios';
      case 'CONFIGURACOES':
        return 'Configurações';
      default:
        return 'Dashboard do Fornecedor';
    }
  }, [activeSection]);

  const reportSummary = useMemo(() => {
    const accepted = mockOrders.filter(order => order.status !== 'RECUSADO').length;
    const rejected = mockOrders.filter(order => order.status === 'RECUSADO').length;
    const preparing = mockOrders.filter(order => order.status === 'EM_SEPARACAO').length;
    const revenue = mockOrders
      .filter(order => order.status !== 'RECUSADO')
      .reduce((sum, order) => sum + order.valorTotal, 0);

    return { accepted, rejected, preparing, revenue };
  }, []);

  const deliveriesToday = useMemo(() => {
    return mockOrders.filter(order => order.status === 'SAIU_PARA_ENTREGA' || order.status === 'ENTREGUE');
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const registerStockMovements = (newMovements: Array<Omit<StockMovement, 'id' | 'createdAt'>>) => {
    if (newMovements.length === 0) {
      return;
    }

    const createdAt = new Date().toISOString();
    const normalized = newMovements.map((movement, index) => ({
      ...movement,
      id: `${Date.now()}-${index}-${movement.product}`,
      createdAt,
    }));

    setStockMovements(current => [...normalized, ...current]);
  };

  const renderSectionContent = () => {
    if (activeSection === 'PEDIDOS') {
      return <OrderTable stock={stock} setStock={setStock} onRegisterStockMovements={registerStockMovements} />;
    }

    if (activeSection === 'ESTOQUE') {
      return (
        <StockManagementSection
          stock={stock}
          setStock={setStock}
          movements={stockMovements}
          onRegisterMovements={registerStockMovements}
        />
      );
    }

    if (activeSection === 'ENTREGAS') {
      return (
        <div className="mt-8 bg-[#141414] dark:bg-[#141414] light:bg-white border border-[#222222] light:border-gray-200 rounded-xl p-5">
          <h2 className="text-lg font-semibold !text-white dark:!text-white light:!text-gray-900 mb-4">Lista de entregas</h2>
          <div className="space-y-2">
            {deliveriesToday.map(order => (
              <div key={order.id} className="rounded-lg border border-[#2a2a2a] light:border-gray-200 p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white dark:text-white light:text-gray-900">{order.id} - {order.cliente}</p>
                  <p className="text-xs text-gray-500">Entrega prevista: {order.dataDesejada}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-400 light:bg-violet-100 light:text-violet-700">
                  {order.status === 'ENTREGUE' ? 'Entregue' : 'Em rota'}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeSection === 'RELATORIOS') {
      return (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-[#141414] dark:bg-[#141414] light:bg-white border border-[#222222] light:border-gray-200 p-6 rounded-xl shadow-sm">
            <p className="text-gray-500 light:text-gray-400 text-sm">Pedidos Aceitos</p>
            <h3 className="text-2xl font-bold text-emerald-400 light:text-emerald-700 mt-1">{reportSummary.accepted}</h3>
          </div>
          <div className="bg-[#141414] dark:bg-[#141414] light:bg-white border border-[#222222] light:border-gray-200 p-6 rounded-xl shadow-sm">
            <p className="text-gray-500 light:text-gray-400 text-sm">Pedidos Recusados</p>
            <h3 className="text-2xl font-bold text-rose-400 light:text-rose-700 mt-1">{reportSummary.rejected}</h3>
          </div>
          <div className="bg-[#141414] dark:bg-[#141414] light:bg-white border border-[#222222] light:border-gray-200 p-6 rounded-xl shadow-sm">
            <p className="text-gray-500 light:text-gray-400 text-sm">Em Separação</p>
            <h3 className="text-2xl font-bold text-amber-400 light:text-amber-700 mt-1">{reportSummary.preparing}</h3>
          </div>
          <div className="bg-[#141414] dark:bg-[#141414] light:bg-white border border-[#222222] light:border-gray-200 p-6 rounded-xl shadow-sm">
            <p className="text-gray-500 light:text-gray-400 text-sm">Faturamento</p>
            <h3 className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mt-1">{formatCurrency(reportSummary.revenue)}</h3>
          </div>
        </div>
      );
    }

    if (activeSection === 'CONFIGURACOES') {
      return (
        <div className="mt-8 bg-[#141414] dark:bg-[#141414] light:bg-white border border-[#222222] light:border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold !text-white dark:!text-white light:!text-gray-900">Configurações da conta</h2>
          <p className="text-sm text-gray-400 light:text-gray-600 mt-2">Em breve: notificações, integrações e preferências de operação.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Novos Pedidos', value: '12' },
          { label: 'Em Preparo', value: '05' },
          { label: 'Saindo Hoje', value: '08' },
          { label: 'Faturado (Mes)', value: 'R$ 4.500' },
        ].map(card => (
          <div key={card.label} className="bg-[#141414] dark:bg-[#141414] light:bg-white border border-[#222222] light:border-gray-200 p-6 rounded-xl shadow-sm">
            <p className="text-gray-500 light:text-gray-400 text-sm">{card.label}</p>
            <h3 className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mt-1">{card.value}</h3>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex w-full min-h-screen bg-[#050505] dark:bg-[#050505] light:bg-gray-50 transition-colors duration-300">
      <Sidebar
        theme={theme}
        toggleTheme={toggleTheme}
        onLogout={onLogout}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <div className="mb-6 rounded-xl border border-[#222222] light:border-gray-200 bg-[#0d0d0d] dark:bg-[#0d0d0d] light:bg-white p-4">
          <p className="text-xs text-gray-400 light:text-gray-600 mb-3">Dashboard / Visão geral</p>
          <nav className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {topNavItems.map(item => (
              <button
                key={item.section}
                type="button"
                onClick={() => setActiveSection(item.section)}
                className={`px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-center ${
                  activeSection === item.section
                    ? 'bg-[#00ff66]/10 text-[#00ff66] light:bg-green-100 light:text-green-700 border border-[#00ff66]/30'
                    : 'bg-[#141414] dark:bg-[#141414] light:bg-gray-50 text-gray-400 light:text-gray-700 border border-[#2a2a2a] light:border-gray-200 hover:text-gray-200 light:hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between bg-[#00ff66]/10 border border-[#00ff66]/20 p-4 rounded-xl gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse" />
            <span className="text-[#00ff66] font-medium text-sm md:text-base">Navegue pela Sidebar para operar pedidos, entregas, estoque e relatórios.</span>
          </div>
          <button onClick={() => setActiveSection('PEDIDOS')} className="text-[#00ff66] text-sm font-bold underline">Ir para pedidos</button>
        </div>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold !text-white dark:!text-white light:!text-gray-900">{headerTitle}</h1>
          <div className="flex items-center gap-4 text-gray-400">
            <div className="text-right">
              <p className="text-xs text-gray-500 light:text-gray-600">Perfil</p>
              <p className="text-sm font-medium text-white dark:text-white light:text-gray-900">{companyName}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#141414] border border-[#222222] light:bg-gray-200 light:border-gray-300" />
          </div>
        </header>

        {renderSectionContent()}
      </main>
    </div>
  );
}
