import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Edit, Trash2, LayoutDashboard, Users, ClipboardList, Handshake, Search, Calendar, AlertCircle, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- DADOS MOCK (APENAS PARA O DASHBOARD) ---
const initialReceivables = [
    { id: 1, clientId: 1, description: 'Pilates Mensal (Julho)', value: 350.00, dueDate: '2025-07-10', status: 'Pago' },
    { id: 2, clientId: 2, description: 'Sessão Fisioterapia', value: 150.00, dueDate: '2025-07-15', status: 'Pago' },
    { id: 3, clientId: 3, description: 'Sessão Fisioterapia', value: 150.00, dueDate: '2025-06-05', status: 'Vencido' },
];
const initialPayables = [
    { id: 1, description: 'Aluguel do Espaço (Julho)', value: 2500.00, dueDate: '2025-07-05', status: 'Pago' },
    { id: 2, description: 'Aluguel do Espaço (Junho)', value: 2500.00, dueDate: '2025-06-05', status: 'Pago' },
];

// --- FUNÇÕES UTILITÁRIAS ---
const maskCPF = v => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').substring(0, 14);
const maskPhone = v => v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 15);
const maskCEP = v => v.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 9);

// --- COMPONENTES DE PÁGINA ---

const Sidebar = ({ currentPage, setCurrentPage }) => {
    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard },
        { name: 'Agenda', icon: Calendar },
        { name: 'Clientes', icon: Users },
        { name: 'Serviços', icon: ClipboardList },
        { name: 'Profissionais', icon: Handshake },
    ];
    return (
        <aside className="w-64 bg-white text-gray-800 flex flex-col shadow-lg">
            <div className="p-6 text-center border-b"><h1 className="text-2xl font-bold text-indigo-600">ClinicFlow</h1><p className="text-sm text-gray-500">Gestão Inteligente</p></div>
            <nav className="flex-1 px-4 py-4"><ul>{navItems.map(item => (<li key={item.name} className="mb-2"><a href="#" onClick={() => setCurrentPage(item.name)} className={`flex items-center p-3 rounded-lg transition-all duration-200 ${currentPage === item.name ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-gray-200'}`}><item.icon className="h-5 w-5 mr-3" /><span className="font-medium">{item.name}</span></a></li>))}</ul></nav>
            <div className="p-4 border-t"><div className="flex items-center"><img className="h-10 w-10 rounded-full object-cover" src="https://placehold.co/100x100/6366f1/white?text=A" alt="Admin" /><div className="ml-3"><p className="font-semibold">Admin</p><p className="text-sm text-gray-500">Clínica Fisiopilates</p></div></div></div>
        </aside>
    );
};

const Dashboard = ({ clients, receivables, payables }) => {
    const today = new Date();
    const stats = useMemo(() => {
        const monthlyRevenue = (receivables || []).filter(r => { const d = new Date(r.dueDate); return r.status === 'Pago' && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear(); }).reduce((sum, r) => sum + r.value, 0);
        const overdueReceivables = (receivables || []).filter(r => r.status === 'Vencido');
        return { totalClients: (clients || []).length, monthlyRevenue, overdueCount: overdueReceivables.length, overdueAmount: overdueReceivables.reduce((sum, r) => sum + r.value, 0) };
    }, [clients, receivables, today]);

    const comparisonData = useMemo(() => {
        const data = {};
        const addData = (dateStr, value, type) => {
            const date = new Date(dateStr);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!data[key]) data[key] = { name: date.toLocaleString('pt-BR', { month: 'short' }), Receitas: 0, Despesas: 0 };
            data[key][type] += value;
        };
        (receivables || []).forEach(r => addData(r.dueDate, r.value, 'Receitas'));
        (payables || []).forEach(p => addData(p.dueDate, p.value, 'Despesas'));
        return Object.values(data).sort((a,b) => new Date(a.name) - new Date(b.name)).slice(-6);
    }, [receivables, payables]);

    const StatCard = ({ title, value, icon, colorClass }) => (
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
            <div><p className="text-sm text-gray-500 font-medium">{title}</p><p className="text-2xl font-bold text-gray-800">{value}</p></div>
            <div className={`p-3 rounded-full ${colorClass}`}>{icon}</div>
        </div>
    );

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard title="Total de Clientes" value={stats.totalClients} icon={<Users className="text-white"/>} colorClass="bg-blue-500" />
                <StatCard title="Faturamento do Mês" value={`R$ ${stats.monthlyRevenue.toFixed(2)}`} icon={<TrendingUp className="text-white"/>} colorClass="bg-green-500" />
                <StatCard title="Inadimplentes" value={stats.overdueCount} icon={<AlertCircle className="text-white"/>} colorClass="bg-yellow-500" />
                <StatCard title="Valor Vencido" value={`R$ ${stats.overdueAmount.toFixed(2)}`} icon={<TrendingDown className="text-white"/>} colorClass="bg-red-500" />
            </div>
             <div className="bg-white p-6 rounded-xl shadow-md mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Comparativo: Receitas vs. Despesas</h3>
                <ResponsiveContainer width="100%" height={300}><BarChart data={comparisonData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis tickFormatter={v => `R$${v}`} /><Tooltip formatter={v => `R$ ${v.toFixed(2)}`} /><Legend /><Bar dataKey="Receitas" fill="#22c55e" name="Receitas" /><Bar dataKey="Despesas" fill="#ef4444" name="Despesas" /></BarChart></ResponsiveContainer>
            </div>
        </div>
    );
};

const Clients = ({ clients, setClients }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);

    const handleDelete = async (clientId) => {
        if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
        try {
            const response = await fetch(`https://clinicflow-backend.onrender.com/api/pacientes/${clientId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falha ao excluir o cliente.');
            setClients(prev => prev.filter(c => c.id !== clientId));
        } catch (err) { alert(err.message); }
    };

    const filteredClients = (clients || []).filter(c => (c.nome?.toLowerCase().includes(searchTerm.toLowerCase())) || (c.cpf?.includes(searchTerm)));

    return (
        <div>
            <div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold text-gray-800">Clientes</h2><button onClick={() => setIsModalOpen(true)} className="flex items-center bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700"><PlusCircle className="h-5 w-5 mr-2" />Novo Cliente</button></div>
            <div className="mb-4 relative"><input type="text" placeholder="Buscar por nome ou CPF..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 pl-10 border rounded-lg" /><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /></div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b"><tr><th className="p-4 font-semibold text-gray-600">Nome</th><th className="p-4 font-semibold text-gray-600">CPF</th><th className="p-4 font-semibold text-gray-600">Contato</th><th className="p-4 font-semibold text-gray-600">Ações</th></tr></thead>
                    <tbody>{filteredClients.map(client => (<tr key={client.id} className="border-b hover:bg-gray-50"><td className="p-4 font-medium text-gray-800">{client.nome}</td><td className="p-4 text-gray-600">{client.cpf}</td><td className="p-4 text-gray-600">{client.email}<br/>{client.telefone}</td><td className="p-4"><button onClick={() => setEditingClient(client)} className="text-indigo-600 hover:text-indigo-800 mr-2"><Edit size={18} /></button><button onClick={() => handleDelete(client.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button></td></tr>))}</tbody>
                </table>
            </div>
            {(isModalOpen || editingClient) && <ClientFormModal clientToEdit={editingClient} closeModal={() => { setIsModalOpen(false); setEditingClient(null); }} setClients={setClients} />}
        </div>
    );
};

const ClientFormModal = ({ closeModal, setClients, clientToEdit = null }) => {
    const [formData, setFormData] = useState({ nome: clientToEdit?.nome || '', cpf: clientToEdit?.cpf || '', email: clientToEdit?.email || '', telefone: clientToEdit?.telefone || '', endereco: clientToEdit?.endereco || '', cep: clientToEdit?.cep || '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!clientToEdit;

    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === 'cpf') value = maskCPF(value);
        if (name === 'telefone') value = maskPhone(value);
        if (name === 'cep') value = maskCEP(value);
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const url = isEditing ? `https://clinicflow-backend.onrender.com/api/pacientes/${clientToEdit.id}` : 'https://clinicflow-backend.onrender.com/api/pacientes';
        const method = isEditing ? 'PUT' : 'POST';
        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
            if (!response.ok) throw new Error((await response.json()).mensagem || 'Falha na operação.');
            const { paciente: resultClient } = await response.json();
            if (isEditing) { setClients(prev => prev.map(c => c.id === resultClient.id ? resultClient : c)); } 
            else { setClients(prev => [...prev, resultClient].sort((a,b) => a.nome.localeCompare(b.nome))); }
            closeModal();
        } catch (err) { setError(err.message); } 
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4"><input type="text" name="nome" value={formData.nome} onChange={handleChange} required placeholder="Nome Completo" className="w-full p-2 border rounded-lg" /><input type="text" name="cpf" value={formData.cpf} onChange={handleChange} required placeholder="CPF" className="w-full p-2 border rounded-lg" /><input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="E-mail" className="w-full p-2 border rounded-lg" /><input type="tel" name="telefone" value={formData.telefone} onChange={handleChange} placeholder="Telefone" className="w-full p-2 border rounded-lg" /><input type="text" name="endereco" value={formData.endereco} onChange={handleChange} placeholder="Endereço" className="w-full p-2 border rounded-lg" /><input type="text" name="cep" value={formData.cep} onChange={handleChange} placeholder="CEP" className="w-full p-2 border rounded-lg" /></div>
                    {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                    <div className="mt-8 flex justify-end space-x-4"><button type="button" onClick={closeModal} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">Cancelar</button><button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">{isSubmitting ? 'Salvando...' : 'Salvar'}</button></div>
                </form>
            </div>
        </div>
    );
};

const Services = ({ services, setServices }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleDelete = async (serviceId) => {
        if (!window.confirm('Tem certeza que deseja excluir este serviço?')) return;
        try {
            const response = await fetch(`https://clinicflow-backend.onrender.com/api/servicos/${serviceId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falha ao excluir o serviço.');
            setServices(prev => prev.filter(s => s.id !== serviceId));
        } catch (err) { alert(err.message); }
    };
    return (
        <div>
            <div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold text-gray-800">Serviços</h2><button onClick={() => setIsModalOpen(true)} className="flex items-center bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700"><PlusCircle className="h-5 w-5 mr-2" />Novo Serviço</button></div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b"><tr><th className="p-4 font-semibold text-gray-600">Nome do Serviço</th><th className="p-4 font-semibold text-gray-600">Preço</th><th className="p-4 font-semibold text-gray-600">Duração (min)</th><th className="p-4 font-semibold text-gray-600">Ações</th></tr></thead>
                    <tbody>{(services || []).map(service => (<tr key={service.id} className="border-b hover:bg-gray-50"><td className="p-4 font-medium text-gray-800">{service.nome}</td><td className="p-4 text-gray-600">R$ {parseFloat(service.preco).toFixed(2)}</td><td className="p-4 text-gray-600">{service.duracao_minutos}</td><td className="p-4"><button className="text-indigo-600 hover:text-indigo-800 mr-2"><Edit size={18} /></button><button onClick={() => handleDelete(service.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button></td></tr>))}</tbody>
                </table>
            </div>
            {isModalOpen && <NewServiceModal closeModal={() => setIsModalOpen(false)} setServices={setServices} />}
        </div>
    );
};

const NewServiceModal = ({ closeModal, setServices }) => {
    const [formData, setFormData] = useState({ nome: '', preco: '', duracao_minutos: '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch('https://clinicflow-backend.onrender.com/api/servicos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, preco: parseFloat(formData.preco), duracao_minutos: parseInt(formData.duracao_minutos) }) });
            if (!response.ok) throw new Error((await response.json()).mensagem || 'Falha ao criar serviço.');
            const { servico: novoServico } = await response.json();
            setServices(prev => [...prev, novoServico].sort((a,b) => a.nome.localeCompare(b.nome)));
            closeModal();
        } catch (err) { setError(err.message); } 
        finally { setIsSubmitting(false); }
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Novo Serviço</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4"><input type="text" name="nome" value={formData.nome} onChange={handleChange} required placeholder="Nome do Serviço" className="w-full p-2 border rounded-lg" /><input type="number" name="preco" step="0.01" value={formData.preco} onChange={handleChange} required placeholder="Preço (R$)" className="w-full p-2 border rounded-lg" /><input type="number" name="duracao_minutos" value={formData.duracao_minutos} onChange={handleChange} required placeholder="Duração (em minutos)" className="w-full p-2 border rounded-lg" /></div>
                    {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                    <div className="mt-8 flex justify-end space-x-4"><button type="button" onClick={closeModal} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">Cancelar</button><button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">{isSubmitting ? 'Salvando...' : 'Salvar Serviço'}</button></div>
                </form>
            </div>
        </div>
    );
};

const Professionals = ({ professionals, setProfessionals }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProfessional, setEditingProfessional] = useState(null);
    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este profissional?')) return;
        try {
            const response = await fetch(`https://clinicflow-backend.onrender.com/api/profissionais/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falha ao excluir profissional.');
            setProfessionals(prev => prev.filter(p => p.id !== id));
        } catch (err) { alert(err.message); }
    };
    return (
        <div>
            <div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold text-gray-800">Profissionais</h2><button onClick={() => setIsModalOpen(true)} className="flex items-center bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700"><PlusCircle className="h-5 w-5 mr-2" />Novo Profissional</button></div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b"><tr><th className="p-4 font-semibold text-gray-600">Nome</th><th className="p-4 font-semibold text-gray-600">Comissão (%)</th><th className="p-4 font-semibold text-gray-600">Ações</th></tr></thead>
                    <tbody>{(professionals || []).map(prof => (<tr key={prof.id} className="border-b hover:bg-gray-50"><td className="p-4 font-medium text-gray-800">{prof.nome}</td><td className="p-4 text-gray-600">{prof.comissao_percentual}%</td><td className="p-4"><button onClick={() => setEditingProfessional(prof)} className="text-indigo-600 hover:text-indigo-800 mr-2"><Edit size={18} /></button><button onClick={() => handleDelete(prof.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button></td></tr>))}</tbody>
                </table>
            </div>
            {(isModalOpen || editingProfessional) && <ProfessionalFormModal professionalToEdit={editingProfessional} closeModal={() => { setIsModalOpen(false); setEditingProfessional(null); }} setProfessionals={setProfessionals} />}
        </div>
    );
};

const ProfessionalFormModal = ({ closeModal, setProfessionals, professionalToEdit = null }) => {
    const [formData, setFormData] = useState({ nome: professionalToEdit?.nome || '', comissao_percentual: professionalToEdit?.comissao_percentual || '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!professionalToEdit;
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const url = isEditing ? `https://clinicflow-backend.onrender.com/api/profissionais/${professionalToEdit.id}` : 'https://clinicflow-backend.onrender.com/api/profissionais';
        const method = isEditing ? 'PUT' : 'POST';
        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, comissao_percentual: parseInt(formData.comissao_percentual) }) });
            if (!response.ok) throw new Error((await response.json()).mensagem || 'Falha na operação.');
            const { profissional: resultProf } = await response.json();
            if (isEditing) { setProfessionals(prev => prev.map(p => p.id === resultProf.id ? resultProf : p)); } 
            else { setProfessionals(prev => [...prev, resultProf].sort((a,b) => a.nome.localeCompare(b.nome))); }
            closeModal();
        } catch (err) { setError(err.message); } 
        finally { setIsSubmitting(false); }
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">{isEditing ? 'Editar Profissional' : 'Novo Profissional'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4"><input type="text" name="nome" value={formData.nome} onChange={handleChange} required placeholder="Nome do Profissional" className="w-full p-2 border rounded-lg" /><input type="number" name="comissao_percentual" value={formData.comissao_percentual} onChange={handleChange} required placeholder="Comissão (%)" className="w-full p-2 border rounded-lg" /></div>
                    {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                    <div className="mt-8 flex justify-end space-x-4"><button type="button" onClick={closeModal} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">Cancelar</button><button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">{isSubmitting ? 'Salvando...' : 'Salvar'}</button></div>
                </form>
            </div>
        </div>
    );
};

const Agenda = ({ appointments, setAppointments, clients, services, professionals }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [modalState, setModalState] = useState({ isOpen: false, date: null, appointment: null });

    const changeMonth = (offset) => setCurrentDate(prev => { const newDate = new Date(prev); newDate.setMonth(newDate.getMonth() + offset); return newDate; });
    
    const handleDayClick = (date) => setModalState({ isOpen: true, date, appointment: null });
    const handleAppointmentClick = (appointment, e) => {
        e.stopPropagation();
        setModalState({ isOpen: true, date: null, appointment });
    };
    const closeModal = () => setModalState({ isOpen: false, date: null, appointment: null });

    const calendarGrid = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const grid = [];
        let day = 1;
        for (let i = 0; i < 6; i++) {
            const week = [];
            for (let j = 0; j < 7; j++) {
                if ((i === 0 && j < firstDayOfMonth) || day > daysInMonth) { week.push(null); } 
                else {
                    const dayAppointments = (appointments || []).filter(app => { const appDate = new Date(app.data_hora_inicio); return appDate.getDate() === day && appDate.getMonth() === month && appDate.getFullYear() === year; });
                    week.push({ day, date: new Date(year, month, day), appointments: dayAppointments });
                    day++;
                }
            }
            grid.push(week);
            if (day > daysInMonth) break;
        }
        return grid;
    }, [currentDate, appointments]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Agenda</h2>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2"><button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronLeft /></button><span className="text-xl font-semibold text-gray-700 w-48 text-center capitalize">{currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</span><button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronRight /></button></div>
                    <button onClick={() => handleDayClick(new Date())} className="flex items-center bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700"><PlusCircle className="h-5 w-5 mr-2" />Novo Agendamento</button>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-md">
                <div className="grid grid-cols-7 text-center font-semibold text-gray-600 border-b">{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day} className="p-4">{day}</div>)}</div>
                <div className="grid grid-cols-7" style={{ minHeight: '60vh' }}>{calendarGrid.flat().map((dayData, index) => (<div key={index} className="border-r border-b p-2 overflow-y-auto cursor-pointer hover:bg-gray-50" onClick={() => dayData && handleDayClick(dayData.date)}>{dayData && (<><span className="font-bold">{dayData.day}</span><div className="mt-1 space-y-1">{dayData.appointments.map(app => (<div key={app.id} onClick={(e) => handleAppointmentClick(app, e)} className="bg-indigo-100 text-indigo-800 p-1 rounded-md text-xs cursor-pointer hover:bg-indigo-200"><p className="font-semibold truncate">{(services || []).find(s => s.id === app.id_servico)?.nome}</p><p>{new Date(app.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p><p className="truncate">{(app.participantes || []).map(p => p.nome).join(', ')}</p></div>))}</div></>)}</div>))}</div>
            </div>
            {modalState.isOpen && <AppointmentFormModal 
                closeModal={closeModal} 
                setAppointments={setAppointments} 
                clients={clients} 
                services={services} 
                professionals={professionals} 
                appointmentToEdit={modalState.appointment}
                selectedDate={modalState.date}
            />}
        </div>
    );
};

const AppointmentFormModal = ({ closeModal, setAppointments, clients, services, professionals, appointmentToEdit = null, selectedDate = null }) => {
    const [formData, setFormData] = useState({
        id_servico: appointmentToEdit?.id_servico || '',
        id_profissional: appointmentToEdit?.id_profissional || '',
        data: appointmentToEdit ? new Date(appointmentToEdit.data_hora_inicio).toISOString().split('T')[0] : new Date(selectedDate || Date.now()).toISOString().split('T')[0],
        hora: appointmentToEdit ? new Date(appointmentToEdit.data_hora_inicio).toTimeString().substring(0,5) : '09:00',
        participantes: appointmentToEdit?.participantes.map(p => p.id) || [],
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!appointmentToEdit;

    const selectedService = services.find(s => s.id === parseInt(formData.id_servico));
    const capacity = selectedService?.capacidade || 1;

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    
    const handleParticipantChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
        if (selectedOptions.length <= capacity) {
            setFormData(prev => ({ ...prev, participantes: selectedOptions }));
        } else {
            alert(`Este serviço tem capacidade para apenas ${capacity} participante(s).`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const [hours, minutes] = formData.hora.split(':');
        const startDate = new Date(formData.data);
        startDate.setUTCHours(hours, minutes);

        const serviceDuration = selectedService?.duracao_minutos || 60;
        const endDate = new Date(startDate.getTime() + serviceDuration * 60000);

        const payload = {
            id_servico: parseInt(formData.id_servico),
            id_profissional: parseInt(formData.id_profissional),
            data_hora_inicio: startDate.toISOString(),
            data_hora_fim: endDate.toISOString(),
            status: 'Agendado',
            participantes: formData.participantes,
        };

        const url = isEditing ? `https://clinicflow-backend.onrender.com/api/agendamentos/${appointmentToEdit.id}` : 'https://clinicflow-backend.onrender.com/api/agendamentos';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error((await response.json()).mensagem || 'Falha na operação.');
            const { agendamento: resultAppointment } = await response.json();
            
            if (isEditing) {
                setAppointments(prev => prev.map(a => a.id === resultAppointment.id ? resultAppointment : a));
            } else {
                setAppointments(prev => [...prev, resultAppointment]);
            }
            closeModal();
        } catch (err) { setError(err.message); } 
        finally { setIsSubmitting(false); }
    };

    const handleDelete = async () => {
        if (!window.confirm('Tem certeza que deseja excluir este agendamento?')) return;
        setIsSubmitting(true);
        try {
            const response = await fetch(`https://clinicflow-backend.onrender.com/api/agendamentos/${appointmentToEdit.id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falha ao excluir agendamento.');
            setAppointments(prev => prev.filter(a => a.id !== appointmentToEdit.id));
            closeModal();
        } catch (err) { setError(err.message); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">{isEditing ? 'Editar' : 'Novo'} Agendamento</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select name="id_servico" value={formData.id_servico} onChange={handleChange} className="w-full p-2 border rounded-lg"><option value="">Selecione o Serviço</option>{(services || []).map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}</select>
                        <select name="id_profissional" value={formData.id_profissional} onChange={handleChange} className="w-full p-2 border rounded-lg"><option value="">Selecione o Profissional</option>{(professionals || []).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select>
                        <input type="date" name="data" value={formData.data} onChange={handleChange} className="w-full p-2 border rounded-lg" />
                        <input type="time" name="hora" value={formData.hora} onChange={handleChange} className="w-full p-2 border rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Participantes (Vagas: {formData.participantes.length}/{capacity})</label>
                        <select multiple value={formData.participantes} onChange={handleParticipantChange} className="w-full p-2 border rounded-lg h-32">
                            {(clients || []).map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                    <div className="mt-8 flex justify-between">
                        <div>{isEditing && <button type="button" onClick={handleDelete} disabled={isSubmitting} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Excluir</button>}</div>
                        <div className="space-x-4"><button type="button" onClick={closeModal} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">Cancelar</button><button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">{isSubmitting ? 'Salvando...' : 'Salvar'}</button></div>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL ---
export default function App() {
    const [currentPage, setCurrentPage] = useState('Agenda');
    
    const [clients, setClients] = useState([]); 
    const [services, setServices] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [appointments, setAppointments] = useState([]);
    
    const [receivables, setReceivables] = useState(initialReceivables);
    const [payables, setPayables] = useState(initialPayables);

    useEffect(() => {
        const fetchData = async (endpoint, setter) => {
            try {
                const response = await fetch(`https://clinicflow-backend.onrender.com/api/${endpoint}`);
                if (response.ok) {
                    const data = await response.json();
                    setter(data);
                } else {
                     console.error(`Falha ao buscar ${endpoint}: Status ${response.status}`);
                }
            } catch (error) {
                console.error(`Falha ao buscar ${endpoint}:`, error);
            }
        };
        fetchData('pacientes', setClients);
        fetchData('servicos', setServices);
        fetchData('profissionais', setProfessionals);
        fetchData('agendamentos', setAppointments);
    }, []);

    const renderPage = () => {
        switch (currentPage) {
            case 'Dashboard': return <Dashboard clients={clients} receivables={receivables} payables={payables} />;
            case 'Clientes': return <Clients clients={clients} setClients={setClients} />;
            case 'Serviços': return <Services services={services} setServices={setServices} />;
            case 'Profissionais': return <Professionals professionals={professionals} setProfessionals={setProfessionals} />;
            case 'Agenda': return <Agenda appointments={appointments} setAppointments={setAppointments} clients={clients} services={services} professionals={professionals} />;
            default: return <Dashboard clients={clients} receivables={receivables} payables={payables} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{renderPage()}</main>
        </div>
    );
}

