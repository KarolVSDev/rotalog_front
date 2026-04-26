import type { ComponentType } from 'react';
import { LayoutDashboard, Package, ShoppingCart, Truck, BarChart3, Settings, LogOut, Sun, Moon } from 'lucide-react';

export type DashboardSection = 'VISAO_GERAL' | 'PEDIDOS' | 'ESTOQUE' | 'ENTREGAS' | 'RELATORIOS' | 'CONFIGURACOES';

const menuItems: Array<{ section: DashboardSection; icon: ComponentType<{ size?: number }>; label: string }> = [
  { section: 'VISAO_GERAL', icon: LayoutDashboard, label: 'Visão Geral' },
  { section: 'PEDIDOS', icon: ShoppingCart, label: 'Pedidos' },
  { section: 'ESTOQUE', icon: Package, label: 'Estoque' },
  { section: 'ENTREGAS', icon: Truck, label: 'Entregas' },
  { section: 'RELATORIOS', icon: BarChart3, label: 'Relatórios' },
];

interface SidebarProps {
  theme: string;
  toggleTheme: () => void;
  onLogout: () => void;
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
}

export function Sidebar({ theme, toggleTheme, onLogout, activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className="w-64 h-screen bg-[#0a0a0a] dark:bg-[#0a0a0a] light:bg-white border-r border-[#222222] dark:border-[#222222] light:border-gray-200 flex flex-col p-4 transition-colors duration-300">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-10">
        <div className="w-8 h-8 bg-[#00ff66] rounded-lg flex items-center justify-center">
          <span className="text-black font-bold">R</span>
        </div>
        <span className="text-white dark:text-white light:text-black font-bold text-xl tracking-tight">ROTALOG</span>
      </div>

      {/* Menu de Navegação */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => onSectionChange(item.section)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
              activeSection === item.section
                ? 'bg-[#00ff66]/10 text-[#00ff66] light:bg-green-100 light:text-green-700' 
                : 'text-gray-500 hover:bg-[#141414] hover:text-gray-300 light:text-gray-600 light:hover:bg-gray-100 light:hover:text-gray-700'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
            {activeSection === item.section && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00ff66] light:bg-green-700" />}
          </button>
        ))}
      </nav>

      {/* Rodapé da Sidebar */}
      <div className="border-t border-[#222222] light:border-gray-200 pt-4 space-y-2">
        {/* Botão de Alternar Tema */}
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-3 text-gray-500 hover:text-[#00ff66] light:text-gray-600 light:hover:text-gray-900 transition-colors"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span className="font-medium">{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
        </button>

        <button
          onClick={() => onSectionChange('CONFIGURACOES')}
          className={`w-full flex items-center gap-3 px-3 py-3 transition-colors ${
            activeSection === 'CONFIGURACOES'
              ? 'text-[#00ff66] light:text-green-700'
              : 'text-gray-500 hover:text-gray-300 light:text-gray-600 light:hover:text-gray-700'
          }`}
        >
          <Settings size={20} />
          <span className="font-medium">Configurações</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-3 text-red-500/80 hover:text-red-500 light:text-red-600 light:hover:text-red-700 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}