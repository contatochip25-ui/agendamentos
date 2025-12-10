import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  CheckCircle2, 
  Circle, 
  Tag, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  Sparkles, 
  MapPin, 
  X, 
  LayoutDashboard,
  CalendarDays,
  LogOut,
  Lock,
  User,
  Timer,
  ArrowRight,
  CalendarClock,
  CloudCheck,
  Save,
  Leaf,
  Menu,
  Phone,
  MessageCircle,
  DollarSign
} from 'lucide-react';
import { generateAgenda } from './services/geminiService';
import { Meeting, MeetingFormData, FilterState } from './types';

// --- Utility Functions & Components ---

// Safe ID generation
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Get today's date in local time YYYY-MM-DD format
const getTodayString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'white' }> = ({ 
  children, variant = 'primary', className = '', ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";
  
  const variants = {
    primary: "bg-pink-600 text-white hover:bg-pink-700 focus:ring-pink-500 shadow-sm hover:shadow-md shadow-pink-200 active:scale-95",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-pink-500 shadow-sm",
    ghost: "text-slate-600 hover:bg-pink-50 hover:text-pink-700",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500",
    white: "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = "bg-slate-100 text-slate-700" }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
    {children}
  </span>
);

// --- Custom Brand Components ---

const BrandLogo: React.FC<{ size?: 'sm' | 'md' | 'lg', light?: boolean }> = ({ size = 'md', light = false }) => {
  const sizes = {
    sm: { text: 'text-2xl', sub: 'text-[0.5rem]' },
    md: { text: 'text-4xl', sub: 'text-[0.6rem]' },
    lg: { text: 'text-6xl', sub: 'text-xs' },
  };

  const textColor = light ? 'text-white' : 'text-slate-800';
  
  return (
    <div className="flex flex-col items-center">
      <div className={`flex items-baseline leading-none select-none relative group cursor-default`}>
        <span className={`font-script ${sizes[size].text} ${textColor} mr-1`}>Candi</span>
        <span className={`font-sans font-black ${sizes[size].text} text-pink-500 tracking-tight group-hover:text-pink-400 transition-colors`}>STOP</span>
        <Leaf className="text-lime-400 absolute -top-2 -right-6 rotate-12 drop-shadow-sm group-hover:rotate-45 transition-transform duration-500" size={size === 'lg' ? 40 : size === 'md' ? 24 : 16} fill="currentColor" />
      </div>
      <span className={`font-sans ${sizes[size].sub} tracking-[0.2em] uppercase mt-1 ${light ? 'text-pink-100/80' : 'text-slate-400'}`}>
        Saúde Íntima Natural
      </span>
    </div>
  );
};

// --- Constants ---
// Sales funnel tags
const AVAILABLE_TAGS = [
  "Interessada", 
  "Primeiro Contato", 
  "Follow-up", 
  "Venda Realizada", 
  "Aguardando Pagamento", 
  "Dúvidas", 
  "Retorno", 
  "Perdido"
];

const INITIAL_FORM_STATE: MeetingFormData = {
  title: '',
  date: getTodayString(),
  time: '10:00',
  duration: 30, // Default duration for sales call
  description: '',
  tags: [],
  location: '' // Now represents "Channel"
};

// --- Sub-Components ---

// 1. Login Component
const LoginScreen: React.FC<{ onLogin: (user: string) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'Gmeskita' && password === 'Senhateste') {
      onLogin(username);
    } else {
      setError('Usuário ou senha incorretos.');
    }
  };

  return (
    <div className="min-h-screen bg-[#2e1065] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative z-10 animate-[fadeIn_0.5s_ease-out]">
        <div className="bg-[#2e1065]/50 p-10 text-center border-b border-white/5">
          <BrandLogo size="lg" light />
        </div>
        
        <div className="p-8 bg-white">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Acesso à Gestão de Vendas</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center flex items-center justify-center gap-2">
                <CheckCircle2 size={16} className="text-red-500 rotate-45" /> {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Usuário</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                  placeholder="Seu usuário de acesso"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3.5 rounded-xl font-bold hover:opacity-90 focus:ring-4 focus:ring-pink-500/30 transition-all shadow-lg shadow-pink-200/50 mt-4 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              Acessar Painel <ArrowRight size={18} />
            </button>
          </form>
          
          <div className="mt-8 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} CandiSTOP. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Dashboard Component (Authenticated View)
const Dashboard: React.FC<{ user: string; onLogout: () => void }> = ({ user, onLogout }) => {
  const storageKey = `candistop_sales_meetings_${user}`; // Updated storage key
  
  // Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Critical: Failed to parse meetings from storage.", e);
      return []; // Fail safe to empty array
    }
  });

  const [filter, setFilter] = useState<FilterState>({ status: 'all', search: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<MeetingFormData>(INITIAL_FORM_STATE);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Persistence with visual feedback
  useEffect(() => {
    setIsSaving(true);
    localStorage.setItem(storageKey, JSON.stringify(meetings));
    const timer = setTimeout(() => setIsSaving(false), 800);
    return () => clearTimeout(timer);
  }, [meetings, storageKey]);

  // --- Sorting & Filtering Logic ---
  const filteredMeetings = useMemo(() => {
    return meetings
      .filter(m => {
        const matchesStatus = filter.status === 'all' || m.status === filter.status;
        const matchesSearch = m.title.toLowerCase().includes(filter.search.toLowerCase()) || 
                              m.description.toLowerCase().includes(filter.search.toLowerCase());
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        // Strict Sort with Fail-safe for invalid dates
        const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
        const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
        // Handle invalid dates (push to end)
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        return dateA.getTime() - dateB.getTime();
      });
  }, [meetings, filter]);

  const nextMeeting = useMemo(() => {
    const now = new Date();
    // Strict sort for upcoming logic
    const scheduled = meetings
      .filter(m => m.status === 'scheduled')
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
        const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
        return dateA.getTime() - dateB.getTime();
      });
    
    return scheduled.find(m => new Date(`${m.date}T${m.time}`) > now) || null;
  }, [meetings]);

  // --- Handlers ---

  const handleOpenModal = (meeting?: Meeting) => {
    if (meeting) {
      setFormData({
        title: meeting.title,
        date: meeting.date,
        time: meeting.time,
        duration: meeting.duration,
        description: meeting.description,
        tags: meeting.tags,
        location: meeting.location
      });
      setEditingId(meeting.id);
    } else {
      setFormData({ ...INITIAL_FORM_STATE, date: getTodayString() });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(INITIAL_FORM_STATE);
    setEditingId(null);
  };

  const handleSaveMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!formData.title.trim() || !formData.date || !formData.time) {
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }

    if (editingId) {
      setMeetings(prev => prev.map(m => m.id === editingId ? { ...m, ...formData } : m));
    } else {
      const newMeeting: Meeting = { ...formData, id: generateId(), status: 'scheduled' };
      setMeetings(prev => [...prev, newMeeting]);
    }
    handleCloseModal();
  };

  const toggleStatus = (id: string) => {
    setMeetings(prev => prev.map(m => 
      m.id === id ? { ...m, status: m.status === 'scheduled' ? 'completed' : 'scheduled' } : m
    ));
  };

  const deleteMeeting = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
      setMeetings(prev => prev.filter(m => m.id !== id));
    }
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => {
      const tags = prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag];
      return { ...prev, tags };
    });
  };

  const handleGenerateAgenda = async () => {
    if (!formData.title) {
      alert("Por favor, insira o nome da cliente antes de gerar o roteiro.");
      return;
    }
    setIsGenerating(true);
    const agenda = await generateAgenda(formData.title, formData.duration);
    setFormData(prev => ({ ...prev, description: agenda }));
    setIsGenerating(false);
  };

  const stats = useMemo(() => {
    const total = meetings.length;
    const completed = meetings.filter(m => m.status === 'completed').length;
    const scheduled = total - completed;
    return { total, completed, scheduled };
  }, [meetings]);

  return (
    <div className="min-h-screen bg-[#fdf4ff] flex flex-col md:flex-row font-sans text-slate-900 overflow-x-hidden">
      
      {/* --- Sidebar (Desktop: Fixed/Sticky, Mobile: Drawer) --- */}
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#2e1065] text-white shadow-2xl transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:h-screen md:sticky md:top-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 border-b border-white/10 flex flex-col items-center relative">
          <BrandLogo size="md" light />
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 right-4 text-white/50 hover:text-white md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 flex flex-col overflow-y-auto space-y-1 custom-scrollbar">
          {/* User Info */}
          <div className="mb-8 flex items-center gap-3 px-4 py-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white ring-2 ring-white/20 shadow-lg shrink-0">
               <User size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-pink-200 font-bold uppercase tracking-wider">Vendedor(a)</p>
              <p className="text-sm font-bold text-white truncate" title={user}>{user}</p>
            </div>
          </div>

          <button onClick={() => { setFilter({ ...filter, status: 'all' }); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${filter.status === 'all' ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/20' : 'text-purple-200 hover:bg-white/5 hover:text-white'}`}>
            <LayoutDashboard size={18} /> Painel de Vendas
            <span className={`ml-auto py-0.5 px-2 rounded-full text-xs font-bold ${filter.status === 'all' ? 'bg-white/20 text-white' : 'bg-white/5 text-purple-300'}`}>{stats.total}</span>
          </button>
          
          <button onClick={() => { setFilter({ ...filter, status: 'scheduled' }); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${filter.status === 'scheduled' ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/20' : 'text-purple-200 hover:bg-white/5 hover:text-white'}`}>
            <Calendar size={18} /> Agendamentos
            <span className={`ml-auto py-0.5 px-2 rounded-full text-xs font-bold ${filter.status === 'scheduled' ? 'bg-white/20 text-white' : 'bg-white/5 text-purple-300'}`}>{stats.scheduled}</span>
          </button>
          
          <button onClick={() => { setFilter({ ...filter, status: 'completed' }); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${filter.status === 'completed' ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/20' : 'text-purple-200 hover:bg-white/5 hover:text-white'}`}>
            <CheckCircle2 size={18} /> Finalizados/Vendidos
            <span className={`ml-auto py-0.5 px-2 rounded-full text-xs font-bold ${filter.status === 'completed' ? 'bg-white/20 text-white' : 'bg-white/5 text-purple-300'}`}>{stats.completed}</span>
          </button>

          <div className="mt-auto pt-6 border-t border-white/10">
             <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-pink-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors group">
               <LogOut size={18} className="group-hover:text-pink-400 transition-colors" /> 
               <span>Sair do Sistema</span>
             </button>
          </div>
        </nav>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#fdf4ff] relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-pink-100 flex items-center justify-between px-4 md:px-10 flex-shrink-0 z-20 sticky top-0">
          
          {/* Mobile Menu Toggle & Title */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              aria-label="Abrir menu"
            >
              <Menu size={24} />
            </button>

            <div className="flex flex-col">
              <h2 className="text-lg md:text-xl font-bold text-slate-800 leading-tight">
                {filter.status === 'all' ? 'Visão Geral' : filter.status === 'scheduled' ? 'Próximas Reuniões' : 'Histórico de Vendas'}
              </h2>
              <div className="flex items-center gap-1.5 text-xs font-medium mt-0.5">
                 {isSaving ? (
                   <span className="flex items-center gap-1 text-pink-500 animate-pulse"><Save size={12} /> Salvando...</span>
                 ) : (
                   <span className="flex items-center gap-1 text-emerald-600"><CloudCheck size={12} /> Sincronizado</span>
                 )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-48 md:w-80 hidden md:block group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300 group-focus-within:text-pink-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-pink-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all shadow-sm placeholder-pink-200"
              />
            </div>
            <Button onClick={() => handleOpenModal()} className="shadow-lg shadow-pink-200 hover:shadow-pink-300 gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl font-bold bg-pink-600 hover:bg-pink-700 whitespace-nowrap">
               <Plus size={20} /> <span className="hidden md:inline">Nova Cliente</span>
            </Button>
          </div>
        </header>

        {/* Mobile Search Bar (Visible only on mobile below header) */}
        <div className="md:hidden px-4 py-2 bg-white/50 border-b border-pink-50">
           <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300" size={16} />
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="w-full pl-9 pr-4 py-2 bg-white border border-pink-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-pink-200"
              />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-8 pb-10">
            
            {/* NEXT MEETING HERO SECTION */}
            {filter.status !== 'completed' && !filter.search && (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-white shadow-2xl group transition-all hover:shadow-pink-900/20">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-pink-500/20 blur-[60px] group-hover:bg-pink-500/30 transition-all duration-700"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 rounded-full bg-lime-400/10 blur-[50px]"></div>
                
                <div className="relative z-10 p-6 md:p-10">
                  <div className="flex items-center gap-2 mb-6 text-pink-200">
                    <div className="bg-pink-500/20 p-1.5 rounded-lg animate-pulse">
                      <Timer size={20} className="text-pink-300" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-widest">Próxima Reunião</span>
                  </div>

                  {nextMeeting ? (
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                      <div className="space-y-4 flex-1">
                        <h1 className="text-3xl md:text-5xl font-bold leading-tight font-script tracking-wide break-words">{nextMeeting.title}</h1>
                        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-pink-100">
                          <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-md border border-white/5">
                            <Calendar size={18} className="text-pink-300 shrink-0" />
                            <span className="font-medium text-sm md:text-base">{new Date(nextMeeting.date).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'long' })}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-md border border-white/5">
                            <Clock size={18} className="text-pink-300 shrink-0" />
                            <span className="font-medium text-lg">{nextMeeting.time}</span>
                          </div>
                          {nextMeeting.location && (
                            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-md border border-white/5 max-w-full">
                              <Phone size={18} className="text-pink-300 shrink-0" />
                              <span className="truncate">{nextMeeting.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 min-w-[160px]">
                         <Button variant="white" onClick={() => handleOpenModal(nextMeeting)} className="bg-white text-purple-900 hover:bg-pink-50 font-bold border-none shadow-lg">
                            Ver Detalhes
                         </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center md:text-left">
                      <h3 className="text-3xl font-bold text-white mb-2 font-script">Sem atendimentos!</h3>
                      <p className="text-pink-200 max-w-lg">Você não tem reuniões de venda agendadas. Aproveite para prospectar novos clientes.</p>
                      <Button variant="white" onClick={() => handleOpenModal()} className="mt-6 bg-pink-600 border-none hover:bg-pink-500">
                        Nova Cliente
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LIST OF MEETINGS */}
            <div>
               {filteredMeetings.length > 0 && (
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                     <CalendarClock size={16} />
                     Agenda de Vendas
                  </h3>
               )}

               {filteredMeetings.length === 0 ? (
                 <div className="h-80 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-dashed border-pink-200 p-4 text-center">
                   <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
                     <Calendar size={40} className="text-pink-300" />
                   </div>
                   <p className="text-xl font-bold text-slate-600">Nenhum agendamento encontrado</p>
                   <p className="text-sm text-pink-300 mt-2">Cadastre uma nova cliente para iniciar.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                   {filteredMeetings.map(meeting => (
                     <div key={meeting.id} className={`group relative bg-white rounded-2xl border transition-all duration-300 hover:-translate-y-1 overflow-hidden ${meeting.status === 'completed' ? 'border-slate-200 bg-slate-50/50 opacity-60' : 'border-white shadow-sm hover:shadow-xl hover:shadow-pink-100 hover:border-pink-200'}`}>
                       <div className="p-6">
                         <div className="flex items-start justify-between mb-5">
                           <div className="flex-1 min-w-0 pr-4">
                             <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className={`font-bold text-xl leading-tight truncate w-full md:w-auto ${meeting.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{meeting.title}</h3>
                                {meeting.status === 'completed' && <Badge color="bg-emerald-100 text-emerald-700">Concluído</Badge>}
                             </div>
                             <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-3">
                               <div className={`flex items-center gap-1.5 font-bold ${meeting.status !== 'completed' ? 'text-pink-600' : ''}`}>
                                 <Calendar size={16} />
                                 {new Date(meeting.date).toLocaleDateString('pt-BR')}
                               </div>
                               <div className="flex items-center gap-1.5">
                                 <Clock size={16} />
                                 {meeting.time}
                               </div>
                               <div className="flex items-center gap-1.5 bg-pink-50 text-pink-700 px-2 py-1 rounded-md text-xs font-bold">
                                 <Timer size={14} />
                                 {meeting.duration} min
                               </div>
                             </div>
                             {meeting.location && <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-3 truncate"><Phone size={16} className="text-pink-400 shrink-0" />{meeting.location}</div>}
                           </div>
                           
                           {/* Actions */}
                           <div className="flex items-center gap-2 shrink-0">
                             <button onClick={() => toggleStatus(meeting.id)} title={meeting.status === 'completed' ? "Reabrir" : "Finalizar/Vendido"} className={`p-2 rounded-full transition-all ${meeting.status === 'completed' ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-300 hover:text-emerald-600 hover:bg-emerald-50'}`}>
                               {meeting.status === 'completed' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                             </button>
                             <div className="relative group/menu">
                                <button className="p-2 text-slate-300 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors"><MoreVertical size={20} /></button>
                                <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-200/50 opacity-0 group-hover/menu:opacity-100 invisible group-hover/menu:visible transition-all z-20 flex flex-col p-1.5">
                                  <button onClick={() => handleOpenModal(meeting)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-pink-50 hover:text-pink-700 rounded-lg text-left transition-colors"><Edit2 size={16} /> Editar</button>
                                  <button onClick={() => deleteMeeting(meeting.id)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg text-left transition-colors"><Trash2 size={16} /> Excluir</button>
                                </div>
                             </div>
                           </div>
                         </div>
                         
                         {meeting.tags.length > 0 && (
                           <div className="flex flex-wrap gap-2 mb-5 pt-3 border-t border-slate-50">
                             {meeting.tags.map(tag => (
                               <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50 text-xs font-bold text-slate-600 border border-slate-100"><Tag size={12} className="text-pink-400" /> {tag}</span>
                             ))}
                           </div>
                         )}
                         <div className="bg-pink-50/50 rounded-xl p-4 border border-pink-100/50 group-hover:border-pink-200 transition-colors">
                           <h4 className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Sparkles size={12} /> Roteiro de Vendas / Notas</h4>
                           <div className="text-sm text-slate-700 whitespace-pre-wrap break-words leading-relaxed max-h-24 overflow-y-auto custom-scrollbar">
                             {meeting.description || <span className="text-slate-400 italic">Sem anotações.</span>}
                           </div>
                         </div>
                       </div>
                       {/* Left colored border based on status */}
                       <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${meeting.status === 'completed' ? 'bg-emerald-400' : 'bg-pink-500'}`}></div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#2e1065]/80 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] scale-100 animate-[fadeIn_0.2s_ease-out] border border-white/20">
            <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-slate-100 bg-gradient-to-r from-pink-50 to-white">
              <div className="flex items-center gap-3">
                 <div className={`w-3 h-3 rounded-full shadow-sm ring-4 ring-white ${editingId ? 'bg-pink-500' : 'bg-emerald-500'}`}></div>
                 <h2 className="text-lg md:text-xl font-bold text-slate-800">{editingId ? 'Editar Cliente' : 'Nova Cliente'}</h2>
              </div>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-pink-600 transition-colors bg-white p-2 rounded-full hover:bg-pink-50 shadow-sm border border-slate-100"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveMeeting} className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nome da Cliente / Lead <span className="text-red-500">*</span></label>
                  <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Maria Silva - Interessada via Instagram" className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all font-medium text-lg placeholder-slate-400" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">Data <span className="text-red-500">*</span></label><input required type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pink-500 outline-none bg-white" /></div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">Horário <span className="text-red-500">*</span></label><input required type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pink-500 outline-none bg-white" /></div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">Duração (min)</label><input type="number" min="15" step="15" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pink-500 outline-none bg-white" /></div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Canal de Atendimento</label>
                  <div className="relative">
                    <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="WhatsApp, Ligação, Zoom..." className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pink-500 outline-none" />
                  </div>
                </div>
                <div>
                   <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold text-slate-700">Roteiro / Notas de Venda</label>
                      <button type="button" onClick={handleGenerateAgenda} disabled={isGenerating} className="text-xs flex items-center gap-1.5 text-pink-600 bg-pink-50 px-3 py-1.5 rounded-lg hover:bg-pink-100 font-bold disabled:opacity-50 transition-colors"><Sparkles size={14} /> {isGenerating ? 'Criando Roteiro de Vendas...' : 'Gerar Roteiro IA'}</button>
                   </div>
                   <textarea rows={5} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} disabled={isGenerating} placeholder="Objeções da cliente, produtos de interesse, etc." className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pink-500 outline-none resize-none font-sans text-sm leading-relaxed disabled:opacity-70" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Status do Funil</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_TAGS.map(tag => (
                      <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${formData.tags.includes(tag) ? 'bg-pink-600 text-white border-pink-600 shadow-lg shadow-pink-200' : 'bg-white text-slate-500 border-slate-200 hover:border-pink-300 hover:text-pink-600'}`}>{tag}</button>
                    ))}
                  </div>
                </div>
              </div>
            </form>
            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
              <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancelar</Button>
              <Button onClick={handleSaveMeeting} className="pl-4 pr-6 py-3 bg-pink-600 hover:bg-pink-700 shadow-lg shadow-pink-200"><CheckCircle2 size={18} className="mr-2" /> {editingId ? 'Salvar' : 'Agendar Contato'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- App Root Component ---

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('candistop_currentUser');
  });

  const handleLogin = (user: string) => {
    setCurrentUser(user);
    localStorage.setItem('candistop_currentUser', user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('candistop_currentUser');
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <Dashboard user={currentUser} onLogout={handleLogout} />;
}