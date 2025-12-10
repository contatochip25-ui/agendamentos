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
  User
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

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }> = ({ 
  children, variant = 'primary', className = '', ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm hover:shadow",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-indigo-500 shadow-sm",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500",
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
        <div className="bg-indigo-600 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <CalendarDays size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Cronos</h1>
          <p className="text-indigo-100 mt-2">Gestão Inteligente de Reuniões</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center">
                {error}
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
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/30 transition-all shadow-lg shadow-indigo-200 mt-4"
            >
              Entrar no Sistema
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
  // Use a user-specific storage key
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

  // Persist to local storage whenever meetings change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(meetings));
  }, [meetings, storageKey]);

  const filteredMeetings = useMemo(() => {
    return meetings
      .filter(m => {
        const matchesStatus = filter.status === 'all' || m.status === filter.status;
        const matchesSearch = m.title.toLowerCase().includes(filter.search.toLowerCase()) || 
                              m.description.toLowerCase().includes(filter.search.toLowerCase());
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
  }, [meetings, filter]);

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
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <CalendarDays size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Cronos</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* User Info */}
          <div className="mb-6 flex items-center gap-3 px-3 py-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700">
               <User size={16} />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-slate-500 font-medium">Logado como</p>
              <p className="text-sm font-bold text-slate-800 truncate">{user}</p>
            </div>
          </div>

          <button onClick={() => setFilter({ ...filter, status: 'all' })} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter.status === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <LayoutDashboard size={18} /> Visão Geral
            <span className="ml-auto bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">{stats.total}</span>
          </button>
          
          <button onClick={() => setFilter({ ...filter, status: 'scheduled' })} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter.status === 'scheduled' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Calendar size={18} /> Agendadas
            <span className="ml-auto bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">{stats.scheduled}</span>
          </button>
          
          <button onClick={() => setFilter({ ...filter, status: 'completed' })} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter.status === 'completed' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <CheckCircle2 size={18} /> Finalizadas
            <span className="ml-auto bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">{stats.completed}</span>
          </button>

          <div className="mt-8 px-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Resumo</h3>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
              <p className="text-indigo-100 text-xs mb-1">Próximas</p>
              <p className="text-2xl font-bold">{stats.scheduled}</p>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
           <Button onClick={() => handleOpenModal()} className="w-full gap-2 shadow-indigo-200">
             <Plus size={18} /> Nova Reunião
           </Button>
           <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
             <LogOut size={16} /> Sair
           </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8 flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">
            {filter.status === 'all' ? 'Todas as Reuniões' : filter.status === 'scheduled' ? 'Reuniões Agendadas' : 'Histórico Completo'}
          </h2>
          <div className="relative w-64 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar reunião..." 
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {filteredMeetings.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Calendar size={32} className="text-slate-300" />
              </div>
              <p className="text-lg font-medium text-slate-600">Nenhuma reunião encontrada</p>
              <p className="text-sm">Comece organizando sua agenda.</p>
              <Button onClick={() => handleOpenModal()} variant="secondary" className="mt-6">Criar Reunião</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredMeetings.map(meeting => (
                <div key={meeting.id} className={`group relative bg-white rounded-xl border transition-all duration-200 ${meeting.status === 'completed' ? 'border-slate-200 bg-slate-50/50' : 'border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200'}`}>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <h3 className={`font-bold text-lg ${meeting.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{meeting.title}</h3>
                           {meeting.status === 'completed' && <Badge color="bg-green-100 text-green-700">Finalizada</Badge>}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-2">
                          <div className="flex items-center gap-1.5"><Calendar size={14} />{new Date(meeting.date).toLocaleDateString('pt-BR')}</div>
                          <div className="flex items-center gap-1.5"><Clock size={14} />{meeting.time} | {meeting.duration} min</div>
                          {meeting.location && <div className="flex items-center gap-1.5"><MapPin size={14} />{meeting.location}</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleStatus(meeting.id)} title={meeting.status === 'completed' ? "Reabrir" : "Finalizar"} className={`p-2 rounded-full transition-colors ${meeting.status === 'completed' ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-slate-400 hover:text-green-600 hover:bg-green-50'}`}>
                          {meeting.status === 'completed' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </button>
                        <div className="relative group/menu">
                           <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"><MoreVertical size={20} /></button>
                           <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 group-hover/menu:opacity-100 invisible group-hover/menu:visible transition-all z-20 flex flex-col p-1">
                             <button onClick={() => handleOpenModal(meeting)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-md text-left"><Edit2 size={14} /> Editar</button>
                             <button onClick={() => deleteMeeting(meeting.id)} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md text-left"><Trash2 size={14} /> Excluir</button>
                           </div>
                        </div>
                      </div>
                    </div>
                    {meeting.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {meeting.tags.map(tag => (
                          <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-600 border border-slate-200"><Tag size={10} /> {tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pauta / Descrição</h4>
                      <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                        {meeting.description || <span className="text-slate-400 italic">Sem descrição definida.</span>}
                      </div>
                    </div>
                  </div>
                  <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full transition-colors ${meeting.status === 'completed' ? 'bg-green-400' : 'bg-indigo-500'}`}></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Editar Reunião' : 'Nova Reunião'}</h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveMeeting} className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                  <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Planejamento de Vendas" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Data</label><input required type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Horário</label><input required type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Duração (min)</label><input type="number" min="15" step="15" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Local / Link</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Sala 304 ou Link do Meet..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
                <div>
                   <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-slate-700">Pauta</label>
                      <button type="button" onClick={handleGenerateAgenda} disabled={isGenerating} className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"><Sparkles size={12} /> {isGenerating ? 'Gerando com IA...' : 'Gerar Pauta com IA'}</button>
                   </div>
                   <textarea rows={5} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} disabled={isGenerating} placeholder="Tópicos da reunião..." className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-sm disabled:opacity-70" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Etiquetas</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_TAGS.map(tag => (
                      <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${formData.tags.includes(tag) ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>{tag}</button>
                    ))}
                  </div>
                </div>
              </div>
            </form>
            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
              <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancelar</Button>
              <Button onClick={handleSaveMeeting}>{editingId ? 'Salvar' : 'Agendar'}</Button>
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
