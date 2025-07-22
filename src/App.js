import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BookUser, ChevronDown, PlusCircle, Edit, Trash2, LayoutDashboard, Users, ClipboardList, Calendar, DollarSign, Handshake, AlertCircle, TrendingUp, TrendingDown, MoreHorizontal, Search, FileText, ChevronLeft, ChevronRight, Activity, Percent, Target, CheckCircle } from 'lucide-react';

// --- DADOS MOCK (APENAS PARA MÓDULOS AINDA NÃO CONECTADOS AO BACKEND) ---
const initialInteractions = [
    { id: 1, clientId: 1, date: '2025-07-26', type: 'Evolução', notes: 'Paciente relatou melhora significativa na dor lombar.' },
];
const initialReceivables = [
    { id: 1, clientId: 1, description: 'Pilates Mensal (Julho)', value: 350.00, dueDate: '2025-07-10', status: 'Pago', paymentMethodId: 1 },
    { id: 2, clientId: 2, description: 'Sessão Fisioterapia', value: 150.00, dueDate: '2025-07-15', status: 'Pago', paymentMethodId: 2 },
    { id: 3, clientId: 3, description: 'Sessão Fisioterapia', value: 150.00, dueDate: '2025-06-05', status: 'Vencido', paymentMethodId: null },
];
const initialChartOfAccounts = [
    { id: 1, name: 'Aluguel' }, { id: 2, name: 'Energia Elétrica' },
];
const initialPayables = [
    { id: 1, description: 'Aluguel do Espaço (Julho)', chartOfAccountId: 1, value: 2500.00, dueDate: '2025-07-05', status: 'Pago' },
    { id: 2, description: 'Aluguel do Espaço (Junho)', chartOfAccountId: 1, value: 2500.00, dueDate: '2025-06-05', status: 'Pago' },
];
const initialPaymentMethods = [
    { id: 1, name: 'Crédito (1x)', fee: 2.99 }, { id: 2, name: 'Débito', fee: 1.49 }, { id: 3, name: 'PIX', fee: 0 }, { id: 4, name: 'Dinheiro', fee: 0 },
];

// --- FUNÇÕES UTILITÁRIAS ---
const maskCPF = v => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').substring(0, 14);
const maskPhone = v => v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 15);
const maskCEP = v => v.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 9);

// --- COMPONENTES DE PÁGINA ---

const Sidebar = ({ currentPage, setCurrentPage }) => {
    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard }, { name: 'CRM', icon: BookUser }, { name: 'Clientes', icon: Users }, { name: 'Serviços', icon: ClipboardList }, { name: 'Profissionais', icon: Handshake }, { name: 'Agenda', icon: Calendar }, { name: 'Financeiro', icon: DollarSign }, { name: 'Relatórios', icon: FileText },
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
    const churnDaysThreshold = 60;

    const stats = useMemo(() => {
        const monthlyRevenue = (receivables || []).filter(r => { const d = new Date(r.dueDate); return r.status === 'Pago' && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear(); }).reduce((sum, r) => sum + r.value, 0);
        const overdueReceivables = (receivables || []).filter(r => r.status === 'Vencido');
        return { totalClients: (clients || []).length, monthlyRevenue, overdueCount: overdueReceivables.length, overdueAmount: overdueReceivables.reduce((sum, r) => sum + r.value, 0) };
    }, [clients, receivables, today]);

    const revenueData = useMemo(() => {
        const months = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setMonth(d.getMonth() - i); return { name: d.toLocaleString('pt-BR', { month: 'short' }).toUpperCase(), Faturamento: 0 }; }).reverse();
        (receivables || []).forEach(r => {
            if (r.status === 'Pago') {
                const date = new Date(r.dueDate);
                const monthStr = date.toLocaleString('pt-BR', { month: 'short' }).toUpperCase();
                const monthData = months.find(m => m.name === monthStr);
                if (monthData) monthData.Faturamento += r.value;
            }
        });
        return months;
    }, [receivables]);

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

    const overdueClients = useMemo(() => (receivables || []).filter(r => r.status === 'Vencido').map(r => ({ ...r, clientName: (clients || []).find(c => c.id === r.clientId)?.nome || 'N/A' })), [receivables, clients]);
    const churnClients = useMemo(() => {
        const churnDate = new Date();
        churnDate.setDate(churnDate.getDate() - churnDaysThreshold);
        return (clients || []).filter(c => c.data_ultima_visita && new Date(c.data_ultima_visita) < churnDate);
    }, [clients]);

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Faturamento dos Últimos 6 Meses</h3>
                        <ResponsiveContainer width="100%" height={300}><LineChart data={revenueData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis tickFormatter={v => `R$${v}`} /><Tooltip formatter={v => `R$ ${v.toFixed(2)}`} /><Legend /><Line type="monotone" dataKey="Faturamento" stroke="#4f46e5" strokeWidth={2} activeDot={{ r: 8 }} /></LineChart></ResponsiveContainer>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Comparativo: Receitas vs. Despesas</h3>
                        <ResponsiveContainer width="100%" height={300}><BarChart data={comparisonData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis tickFormatter={v => `R$${v}`} /><Tooltip formatter={v => `R$ ${v.toFixed(2)}`} /><Legend /><Bar dataKey="Receitas" fill="#22c55e" name="Receitas" /><Bar dataKey="Despesas" fill="#ef4444" name="Despesas" /></BarChart></ResponsiveContainer>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-md"><h3 className="text-lg font-semibold text-gray-700 mb-4">Clientes Inadimplentes</h3><div className="space-y-3 max-h-60 overflow-y-auto">{overdueClients.length > 0 ? overdueClients.map(r => (<div key={r.id} className="flex justify-between items-center text-sm"><p className="font-medium text-gray-600">{r.clientName}</p><p className="font-bold text-red-600">R$ {r.value.toFixed(2)}</p></div>)) : <p className="text-sm text-gray-500">Nenhum cliente inadimplente.</p>}</div></div>
                    <div className="bg-white p-6 rounded-xl shadow-md"><h3 className="text-lg font-semibold text-gray-700 mb-4">Alerta de Evasão ({churnDaysThreshold} dias)</h3><div className="space-y-3 max-h-60 overflow-y-auto">{churnClients.length > 0 ? churnClients.map(c => (<div key={c.id} className="flex justify-between items-center text-sm"><p className="font-medium text-gray-600">{c.nome}</p><p className="text-gray-500">Última visita: {new Date(c.data_ultima_visita).toLocaleDateString('pt-BR')}</p></div>)) : <p className="text-sm text-gray-500">Nenhum cliente em risco de evasão.</p>}</div></div>
                </div>
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

const Agenda = ({ appointments, clients, services }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const changeMonth = (offset) => setCurrentDate(prev => { const newDate = new Date(prev); newDate.setMonth(newDate.getMonth() + offset); return newDate; });
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
                    const dayAppointments = (appointments || []).filter(app => { const appDate = new Date(app.data_hora); return appDate.getDate() === day && appDate.getMonth() === month && appDate.getFullYear() === year; });
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
                    <button className="flex items-center bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700"><PlusCircle className="h-5 w-5 mr-2" />Novo Agendamento</button>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-md">
                <div className="grid grid-cols-7 text-center font-semibold text-gray-600 border-b">{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day} className="p-4">{day}</div>)}</div>
                <div className="grid grid-cols-7 grid-rows-6">{calendarGrid.flat().map((dayData, index) => (<div key={index} className="h-40 border-r border-b p-2 overflow-y-auto">{dayData && (<><span className="font-bold">{dayData.day}</span><div className="mt-1 space-y-1">{dayData.appointments.map(app => (<div key={app.id} className="bg-indigo-100 text-indigo-800 p-1 rounded-md text-xs"><p className="font-semibold truncate">{(clients || []).find(c => c.id === app.id_paciente)?.nome}</p><p className="truncate">{(services || []).find(s => s.id === app.id_servico)?.nome}</p><p>{new Date(app.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p></div>))}</div></>)}</div>))}</div>
            </div>
        </div>
    );
};

const Reports = ({ receivables, payables, appointments, services, professionals, clients }) => {
    return <div className="text-center p-8">Módulo de Relatórios em desenvolvimento.</div>
};

const CRM = ({ clients, interactions, setInteractions }) => {
    return <div className="text-center p-8">Módulo de CRM em desenvolvimento.</div>
};
