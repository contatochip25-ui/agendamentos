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
  CalendarClock
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
  const baseStyles = "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm hover:shadow",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-indigo-500 shadow-sm",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
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

// --- Constants ---
const AVAILABLE_TAGS = ["Estratégia", "Vendas", "Equipe", "Produto", "Design", "Engenharia", "RH", "Cliente"];
const INITIAL_FORM_STATE: MeetingFormData = {
  title: '',
  date: getTodayString(),
  time: '10:00',
  duration: 60,
  description: '',
  tags: [],
  location: ''
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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
          
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm relative z-10">
            <CalendarDays size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white relative z-10">Cronos</h1>
          <p className="text-indigo-100 mt-2 relative z-10">Gestão Inteligente de Reuniões</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center flex items-center justify-center gap-2">
                <CheckCircle2 size={16} className="text-red-500 rotate-45" /> {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Usuário</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Seu usuário de acesso"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/30 transition-all shadow-lg shadow-indigo-200 mt-4 flex items-center justify-center gap-2"
            >
              Entrar no Sistema <ArrowRight size={18} />
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Cronos App. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Dashboard Component (Authenticated View)
const Dashboard: React.FC<{ user: string; onLogout: () => void }> = ({ user, onLogout }) => {
  const storageKey = `cronos_meetings_${user}`;

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Erro ao carregar reuniões:", e);
      return [];
    }
  });

  const [filter, setFilter] = useState<FilterState>({ status: 'all', search: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<MeetingFormData>(INITIAL_FORM_STATE);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(meetings));
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
        // Strict Sort: Date (asc) then Time (asc)
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
  }, [meetings, filter]);

  const nextMeeting = useMemo(() => {
    const now = new Date();
    // Filter only scheduled meetings
    const scheduled = meetings.filter(m => m.status === 'scheduled');
    
    // Sort chronologically
    scheduled.sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

    // Find the first meeting that is in the future
    const upcoming = scheduled.find(m => new Date(`${m.date}T${m.time}`) > now);
    
    // If no future meeting found but there are scheduled ones (e.g. today earlier), take the last one added or handle as needed. 
    // Here we prefer strictly future, otherwise null.
    return upcoming || null;
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
    if (confirm('Tem certeza que deseja excluir esta reunião?')) {
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
      alert("Por favor, insira um título antes de gerar a pauta.");
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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col h-auto md:h-screen sticky top-0 z-10">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <CalendarDays size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Cronos</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* User Info */}
          <div className="mb-6 flex items-center gap-3 px-3 py-3 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200">
            <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 ring-2 ring-white shadow-sm">
               <User size={18} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Logado como</p>
              <p className="text-sm font-bold text-slate-800 truncate">{user}</p>
            </div>
          </div>

          <button onClick={() => setFilter({ ...filter, status: 'all' })} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter.status === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <LayoutDashboard size={18} /> Visão Geral
            <span className="ml-auto bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs font-bold">{stats.total}</span>
          </button>
          
          <button onClick={() => setFilter({ ...filter, status: 'scheduled' })} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter.status === 'scheduled' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Calendar size={18} /> Agendadas
            <span className="ml-auto bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs font-bold">{stats.scheduled}</span>
          </button>
          
          <button onClick={() => setFilter({ ...filter, status: 'completed' })} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter.status === 'completed' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <CheckCircle2 size={18} /> Finalizadas
            <span className="ml-auto bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs font-bold">{stats.completed}</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
           <Button onClick={() => handleOpenModal()} className="w-full gap-2 shadow-lg shadow-indigo-200 hover:shadow-indigo-300">
             <Plus size={18} /> Nova Reunião
           </Button>
           <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
             <LogOut size={16} /> Sair
           </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8 flex-shrink-0 z-20">
          <h2 className="text-lg font-semibold text-slate-800">
            {filter.status === 'all' ? 'Visão Geral' : filter.status === 'scheduled' ? 'Próximos Compromissos' : 'Histórico de Reuniões'}
          </h2>
          <div className="relative w-64 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar reunião..." 
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* NEXT MEETING HERO SECTION */}
            {filter.status !== 'completed' && !filter.search && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-black/10 blur-3xl"></div>
                
                <div className="relative z-10 p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-4 text-indigo-100">
                    <Timer size={20} className="animate-pulse" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Próximo Compromisso</span>
                  </div>

                  {nextMeeting ? (
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                      <div className="space-y-4 flex-1">
                        <h1 className="text-3xl md:text-4xl font-bold leading-tight">{nextMeeting.title}</h1>
                        <div className="flex flex-wrap items-center gap-6 text-indigo-100">
                          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            <Calendar size={18} />
                            <span className="font-medium">{new Date(nextMeeting.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            <Clock size={18} />
                            <span className="font-medium text-lg">{nextMeeting.time}</span>
                          </div>
                          {nextMeeting.location && (
                            <div className="flex items-center gap-2">
                              <MapPin size={18} />
                              <span>{nextMeeting.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 min-w-[140px]">
                         <Button variant="white" onClick={() => handleOpenModal(nextMeeting)}>
                            Ver Detalhes
                         </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center md:text-left">
                      <h3 className="text-2xl font-bold text-white mb-2">Tudo limpo por enquanto!</h3>
                      <p className="text-indigo-100">Você não tem reuniões agendadas para o futuro próximo. Aproveite para organizar suas tarefas.</p>
                      <Button variant="white" onClick={() => handleOpenModal()} className="mt-4">
                        Agendar Agora
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LIST OF MEETINGS */}
            <div>
               {filteredMeetings.length > 0 && (
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                     <CalendarClock size={16} />
                     Linha do Tempo
                  </h3>
               )}

               {filteredMeetings.length === 0 ? (
                 <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-200 border-dashed">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                     <Calendar size={32} className="text-slate-300" />
                   </div>
                   <p className="text-lg font-medium text-slate-600">Nenhuma reunião encontrada</p>
                   <p className="text-sm">Ajuste os filtros ou crie um novo evento.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                   {filteredMeetings.map(meeting => (
                     <div key={meeting.id} className={`group relative bg-white rounded-xl border transition-all duration-300 hover:-translate-y-1 ${meeting.status === 'completed' ? 'border-slate-200 bg-slate-50/50 opacity-75' : 'border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300'}`}>
                       <div className="p-5">
                         <div className="flex items-start justify-between mb-4">
                           <div className="flex-1">
                             <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-bold text-lg leading-tight ${meeting.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{meeting.title}</h3>
                                {meeting.status === 'completed' && <Badge color="bg-green-100 text-green-700">Finalizada</Badge>}
                             </div>
                             <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-3">
                               <div className={`flex items-center gap-1.5 font-medium ${meeting.status !== 'completed' ? 'text-indigo-600' : ''}`}>
                                 <Calendar size={14} />
                                 {new Date(meeting.date).toLocaleDateString('pt-BR')}
                               </div>
                               <div className="flex items-center gap-1.5">
                                 <Clock size={14} />
                                 {meeting.time}
                               </div>
                               <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded text-xs">
                                 <Timer size={12} />
                                 {meeting.duration} min
                               </div>
                             </div>
                             {meeting.location && <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-2"><MapPin size={14} />{meeting.location}</div>}
                           </div>
                           
                           {/* Actions */}
                           <div className="flex items-center gap-1">
                             <button onClick={() => toggleStatus(meeting.id)} title={meeting.status === 'completed' ? "Reabrir" : "Finalizar"} className={`p-2 rounded-full transition-colors ${meeting.status === 'completed' ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-slate-300 hover:text-green-600 hover:bg-green-50'}`}>
                               {meeting.status === 'completed' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                             </button>
                             <div className="relative group/menu">
                                <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"><MoreVertical size={20} /></button>
                                <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 group-hover/menu:opacity-100 invisible group-hover/menu:visible transition-all z-20 flex flex-col p-1">
                                  <button onClick={() => handleOpenModal(meeting)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-md text-left"><Edit2 size={14} /> Editar</button>
                                  <button onClick={() => deleteMeeting(meeting.id)} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md text-left"><Trash2 size={14} /> Excluir</button>
                                </div>
                             </div>
                           </div>
                         </div>
                         
                         {meeting.tags.length > 0 && (
                           <div className="flex flex-wrap gap-2 mb-4 pt-2 border-t border-slate-50">
                             {meeting.tags.map(tag => (
                               <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-600 border border-slate-200"><Tag size={10} /> {tag}</span>
                             ))}
                           </div>
                         )}
                         <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 group-hover:border-indigo-100 transition-colors">
                           <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Sparkles size={10} /> Pauta</h4>
                           <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto custom-scrollbar">
                             {meeting.description || <span className="text-slate-400 italic">Sem descrição definida.</span>}
                           </div>
                         </div>
                       </div>
                       {/* Left colored border based on status */}
                       <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full transition-colors ${meeting.status === 'completed' ? 'bg-green-400' : 'bg-indigo-500'}`}></div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] scale-100 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                 <div className={`w-2 h-8 rounded-full ${editingId ? 'bg-indigo-500' : 'bg-green-500'}`}></div>
                 <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Editar Reunião' : 'Nova Reunião'}</h2>
              </div>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 p-1 rounded-full hover:bg-slate-200"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveMeeting} className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Título da Reunião</label>
                  <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Planejamento de Vendas Q3" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-lg" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div><label className="block text-sm font-bold text-slate-700 mb-1">Data</label><input required type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-1">Horário</label><input required type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-1">Duração (min)</label><input type="number" min="15" step="15" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Local / Link</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Sala de Reuniões 1 ou Link do Google Meet" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
                <div>
                   <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold text-slate-700">Pauta da Reunião</label>
                      <button type="button" onClick={handleGenerateAgenda} disabled={isGenerating} className="text-xs flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md hover:bg-indigo-100 font-bold disabled:opacity-50 transition-colors"><Sparkles size={14} /> {isGenerating ? 'Criando mágica...' : 'Gerar com IA'}</button>
                   </div>
                   <textarea rows={5} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} disabled={isGenerating} placeholder="- Tópico 1&#10;- Tópico 2&#10;- Definições finais" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-sm leading-relaxed disabled:opacity-70" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Etiquetas</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_TAGS.map(tag => (
                      <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${formData.tags.includes(tag) ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}>{tag}</button>
                    ))}
                  </div>
                </div>
              </div>
            </form>
            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
              <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancelar</Button>
              <Button onClick={handleSaveMeeting} className="pl-3 pr-5"><CheckCircle2 size={18} className="mr-2" /> {editingId ? 'Salvar Alterações' : 'Agendar Agora'}</Button>
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
    return localStorage.getItem('cronos_currentUser');
  });

  const handleLogin = (user: string) => {
    setCurrentUser(user);
    localStorage.setItem('cronos_currentUser', user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cronos_currentUser');
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <Dashboard user={currentUser} onLogout={handleLogout} />;
}
