import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Edit, Trash2, LayoutDashboard, Users, ClipboardList, Handshake, Search, Calendar, AlertCircle, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, X, BookHeart } from 'lucide-react';
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

const ClientForm = ({ onBack, setClients, clientToEdit = null }) => {
    const [formData, setFormData] = useState({ nome: clientToEdit?.nome || '', cpf: clientToEdit?.cpf || '', email: clientToEdit?.email || '', telefone: clientToEdit?.telefone || '', endereco: clientToEdit?.endereco || '', cep: clientToEdit?.cep || '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!clientToEdit.id;

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
            onBack();
        } catch (err) { setError(err.message); } 
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-md">
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <input type="text" name="nome" value={formData.nome} onChange={handleChange} required placeholder="Nome Completo" className="w-full p-2 border rounded-lg" />
                    <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} required placeholder="CPF" className="w-full p-2 border rounded-lg" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="E-mail" className="w-full p-2 border rounded-lg" />
                    <input type="tel" name="telefone" value={formData.telefone} onChange={handleChange} placeholder="Telefone" className="w-full p-2 border rounded-lg" />
                    <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} placeholder="Endereço" className="w-full p-2 border rounded-lg" />
                    <input type="text" name="cep" value={formData.cep} onChange={handleChange} placeholder="CEP" className="w-full p-2 border rounded-lg" />
                </div>
                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                <div className="mt-8 flex justify-end space-x-4">
                    <button type="button" onClick={onBack} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">Cancelar</button>
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">{isSubmitting ? 'Salvando...' : 'Salvar'}</button>
                </div>
            </form>
        </div>
    );
};

const ProntuarioView = ({ client }) => {
    const [sessoes, setSessoes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    useEffect(() => {
        if(client.id) {
            fetch(`https://clinicflow-backend.onrender.com/api/pacientes/${client.id}/prontuario`)
                .then(res => res.json())
                .then(data => setSessoes(data))
                .catch(console.error);
        }
    }, [client.id]);

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-green-700"><PlusCircle className="h-5 w-5 mr-2" />Nova Sessão</button>
            </div>
            <div className="space-y-4">
                {(sessoes || []).map(sessao => (
                    <div key={sessao.id} className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-bold text-indigo-700">{new Date(sessao.data_sessao).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                        <div className="mt-2">
                            <p className="font-semibold">Subjetivo:</p>
                            <p className="text-gray-700 whitespace-pre-wrap">{sessao.subjetivo}</p>
                        </div>
                         <div className="mt-2">
                            <p className="font-semibold">Objetivo:</p>
                            <p className="text-gray-700 whitespace-pre-wrap">{sessao.objetivo}</p>
                        </div>
                         <div className="mt-2">
                            <p className="font-semibold">Plano de Tratamento:</p>
                            <p className="text-gray-700 whitespace-pre-wrap">{sessao.plano_tratamento}</p>
                        </div>
                    </div>
                ))}
            </div>
            {isModalOpen && <SessaoFormModal client={client} closeModal={() => setIsModalOpen(false)} setSessoes={setSessoes} />}
        </div>
    );
};

const SessaoFormModal = ({ closeModal, client, setSessoes }) => {
    const [formData, setFormData] = useState({ data_sessao: new Date().toISOString().split('T')[0], subjetivo: '', objetivo: '', plano_tratamento: '' });
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...formData, id_paciente: client.id };
        try {
            const response = await fetch(`https://clinicflow-backend.onrender.com/api/pacientes/${client.id}/prontuario`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error('Falha ao salvar sessão.');
            const { sessao: novaSessao } = await response.json();
            setSessoes(prev => [novaSessao, ...prev]);
            closeModal();
        } catch (err) { alert(err.message); }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Nova Sessão do Prontuário</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="date" name="data_sessao" value={formData.data_sessao} onChange={handleChange} className="w-full p-2 border rounded-lg" />
                    <textarea name="subjetivo" value={formData.subjetivo} onChange={handleChange} placeholder="Subjetivo (relato do paciente)" rows="4" className="w-full p-2 border rounded-lg"></textarea>
                    <textarea name="objetivo" value={formData.objetivo} onChange={handleChange} placeholder="Objetivo (avaliação do profissional)" rows="4" className="w-full p-2 border rounded-lg"></textarea>
                    <textarea name="plano_tratamento" value={formData.plano_tratamento} onChange={handleChange} placeholder="Plano de Tratamento para a sessão" rows="4" className="w-full p-2 border rounded-lg"></textarea>
                    <div className="mt-8 flex justify-end space-x-4"><button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">Cancelar</button><button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Salvar Sessão</button></div>
                </form>
            </div>
        </div>
    );
}

const ClientDetailView = ({ client, onBack, setClients }) => {
    const [activeTab, setActiveTab] = useState('prontuario');
    return (
        <div>
            <button onClick={onBack} className="flex items-center text-indigo-600 font-semibold mb-4">&lt; Voltar para a lista</button>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{client.nome || 'Novo Cliente'}</h2>
            <p className="text-gray-500 mb-6">{client.cpf}</p>
            <div className="flex space-x-2 border-b mb-6">
                <button onClick={() => setActiveTab('prontuario')} className={`px-4 py-2 font-semibold ${activeTab === 'prontuario' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Prontuário</button>
                <button onClick={() => setActiveTab('dados')} className={`px-4 py-2 font-semibold ${activeTab === 'dados' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Dados Cadastrais</button>
            </div>
            {activeTab === 'prontuario' ? <ProntuarioView client={client} /> : <ClientForm onBack={onBack} clientToEdit={client} setClients={setClients} />}
        </div>
    );
};

const Clients = ({ clients, setClients }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);

    if (selectedClient) {
        return <ClientDetailView client={selectedClient} onBack={() => setSelectedClient(null)} setClients={setClients} />;
    }

    const filteredClients = (clients || []).filter(c => (c.nome?.toLowerCase().includes(searchTerm.toLowerCase())) || (c.cpf?.includes(searchTerm)));

    return (
        <div>
            <div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold text-gray-800">Clientes</h2><button onClick={() => setSelectedClient({})} className="flex items-center bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700"><PlusCircle className="h-5 w-5 mr-2" />Novo Cliente</button></div>
            <div className="mb-4 relative"><input type="text" placeholder="Buscar por nome ou CPF..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 pl-10 border rounded-lg" /><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /></div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b"><tr><th className="p-4 font-semibold text-gray-600">Nome</th><th className="p-4 font-semibold text-gray-600">CPF</th><th className="p-4 font-semibold text-gray-600">Contato</th><th className="p-4 font-semibold text-gray-600">Ações</th></tr></thead>
                    <tbody>{filteredClients.map(client => (<tr key={client.id} className="border-b hover:bg-gray-50"><td className="p-4 font-medium text-gray-800">{client.nome}</td><td className="p-4 text-gray-600">{client.cpf}</td><td className="p-4 text-gray-600">{client.email}<br/>{client.telefone}</td><td className="p-4"><button onClick={() => setSelectedClient(client)} className="text-indigo-600 hover:text-indigo-800 mr-2"><Edit size={18} /></button></td></tr>))}</tbody>
                </table>
            </div>
        </div>
    );
};

// ... Restante dos componentes (Services, Professionals, Agenda, etc.)
const Services = () => <div>Serviços</div>;
const Professionals = () => <div>Profissionais</div>;
const Agenda = () => <div>Agenda</div>;

// --- COMPONENTE PRINCIPAL ---
export default function App() {
    const [currentPage, setCurrentPage] = useState('Clientes');
    
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
            default: return <Clients clients={clients} setClients={setClients} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{renderPage()}</main>
        </div>
    );
}


