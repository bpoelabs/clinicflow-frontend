import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BookUser, ChevronDown, PlusCircle, Edit, Trash2, LayoutDashboard, Users, ClipboardList, Calendar, DollarSign, Handshake, AlertCircle, TrendingUp, TrendingDown, MoreHorizontal, Search, FileText, ChevronLeft, ChevronRight, Activity, Percent, Target } from 'lucide-react';

// --- DADOS MOCK (SIMULAÇÃO DE BANCO DE DADOS) ---
// A constante `initialClients` foi removida. Os dados de clientes agora virão da API.

const initialInteractions = [
    { id: 1, clientId: 1, date: '2025-07-26', type: 'Evolução', notes: 'Paciente relatou melhora significativa na dor lombar. Amplitude de movimento aumentada em 15 graus.' },
    { id: 2, clientId: 1, date: '2025-07-20', type: 'Cobrança', notes: 'Contato via WhatsApp para lembrar do vencimento do pacote de Pilates. Pagamento confirmado.' },
    { id: 3, clientId: 2, date: '2025-07-25', type: 'Avaliação', notes: 'Realizada avaliação postural. Identificado desvio na coluna cervical. Plano de tratamento iniciado.' },
    { id: 4, clientId: 2, date: '2025-07-15', type: 'Contato Telefônico', notes: 'Paciente ligou para reagendar a sessão do dia 16 para o dia 18.' },
];

const initialServices = [
    { id: 1, name: 'Sessão de Fisioterapia', price: 150.00, duration: 50 },
    { id: 2, name: 'Pilates Mensal', price: 350.00, duration: 50 },
    { id: 3, name: 'Drenagem Linfática', price: 180.00, duration: 60 },
    { id: 4, name: 'Avaliação Postural', price: 200.00, duration: 60 },
];

const initialProfessionals = [
    { id: 1, name: 'Dra. Helena Borges', commission: 40 },
    { id: 2, name: 'Dr. Ricardo Lima', commission: 45 },
];

const initialAppointments = [
    { id: 1, clientId: 2, serviceId: 1, professionalId: 1, date: '2025-07-25T10:00:00', status: 'Realizado' },
    { id: 2, clientId: 1, serviceId: 2, professionalId: 2, date: '2025-07-25T11:00:00', status: 'Realizado' },
    { id: 3, clientId: 4, serviceId: 1, professionalId: 1, date: '2025-07-26T14:00:00', status: 'Agendado' },
    { id: 4, clientId: 1, serviceId: 1, professionalId: 1, date: '2025-06-15T09:00:00', status: 'Realizado' },
    { id: 5, clientId: 3, serviceId: 3, professionalId: 2, date: '2025-06-22T16:00:00', status: 'Realizado' },
    { id: 6, clientId: 2, serviceId: 1, professionalId: 1, date: '2025-08-05T10:00:00', status: 'Agendado' },
    { id: 7, clientId: 5, serviceId: 4, professionalId: 2, date: '2025-07-22T15:00:00', status: 'Realizado' },
    { id: 8, clientId: 2, serviceId: 1, professionalId: 1, date: '2025-07-18T10:00:00', status: 'Realizado' },
    { id: 9, clientId: 1, serviceId: 1, professionalId: 1, date: '2025-07-11T09:00:00', status: 'Realizado' },
];

const initialReceivables = [
    { id: 1, clientId: 1, description: 'Pilates Mensal (Julho)', value: 350.00, dueDate: '2025-07-10', status: 'Pago', paymentMethodId: 1 },
    { id: 2, clientId: 2, description: 'Sessão Fisioterapia', value: 150.00, dueDate: '2025-07-15', status: 'Pago', paymentMethodId: 2 },
    { id: 3, clientId: 3, description: 'Sessão Fisioterapia', value: 150.00, dueDate: '2025-06-05', status: 'Vencido', paymentMethodId: null },
    { id: 4, clientId: 4, description: 'Avaliação Postural', value: 200.00, dueDate: '2025-08-01', status: 'Aberto', paymentMethodId: null },
    { id: 5, clientId: 1, description: 'Pilates Mensal (Agosto)', value: 350.00, dueDate: '2025-08-10', status: 'Aberto', paymentMethodId: null },
    { id: 6, clientId: 1, description: 'Fisioterapia', value: 150.00, dueDate: '2025-06-15', status: 'Pago', paymentMethodId: 3 },
    { id: 7, clientId: 3, description: 'Drenagem', value: 180.00, dueDate: '2025-06-22', status: 'Pago', paymentMethodId: 1 },
    { id: 8, clientId: 5, description: 'Avaliação Postural', value: 200.00, dueDate: '2025-07-22', status: 'Pago', paymentMethodId: 3 },
    { id: 9, clientId: 2, description: 'Sessão Fisioterapia', value: 150.00, dueDate: '2025-07-18', status: 'Pago', paymentMethodId: 2 },
    { id: 10, clientId: 1, description: 'Sessão Fisioterapia', value: 150.00, dueDate: '2025-07-11', status: 'Pago', paymentMethodId: 1 },
];

const initialChartOfAccounts = [
    { id: 1, name: 'Aluguel' },
    { id: 2, name: 'Energia Elétrica' },
    { id: 3, name: 'Água e Esgoto' },
    { id: 4, name: 'Internet e Telefone' },
    { id: 5, name: 'Salários e Pró-labore' },
    { id: 6, name: 'Marketing e Publicidade' },
    { id: 7, name: 'Material de Consumo' },
    { id: 8, name: 'Manutenção e Reparos' },
];

const initialPayables = [
    { id: 1, description: 'Aluguel do Espaço (Julho)', chartOfAccountId: 1, value: 2500.00, dueDate: '2025-07-05', status: 'Pago' },
    { id: 2, description: 'Conta de Luz', chartOfAccountId: 2, value: 450.00, dueDate: '2025-07-20', status: 'Pago' },
    { id: 3, description: 'Plano de Internet Fibra', chartOfAccountId: 4, value: 120.00, dueDate: '2025-07-10', status: 'Pago' },
    { id: 4, description: 'Aluguel do Espaço (Agosto)', chartOfAccountId: 1, value: 2500.00, dueDate: '2025-08-05', status: 'Aberto' },
    { id: 5, description: 'Compra de Faixas Elásticas', chartOfAccountId: 7, value: 200.00, dueDate: '2025-07-15', status: 'Pago' },
    { id: 6, description: 'Aluguel do Espaço (Junho)', chartOfAccountId: 1, value: 2500.00, dueDate: '2025-06-05', status: 'Pago' },
];

const initialPaymentMethods = [
    { id: 1, name: 'Crédito (1x)', fee: 2.99 },
    { id: 2, name: 'Débito', fee: 1.49 },
    { id: 3, name: 'PIX', fee: 0 },
    { id: 4, name: 'Dinheiro', fee: 0 },
];

// --- COMPONENTE PRINCIPAL ---
export default function App() {
    const [currentPage, setCurrentPage] = useState('Dashboard');
    
    // ATUALIZAÇÃO: O estado de `clients` agora começa como um array vazio.
    const [clients, setClients] = useState([]); 
    const [services, setServices] = useState(initialServices);
    const [professionals, setProfessionals] = useState(initialProfessionals);
    const [appointments, setAppointments] = useState(initialAppointments);
    const [receivables, setReceivables] = useState(initialReceivables);
    const [payables, setPayables] = useState(initialPayables);
    const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);
    const [chartOfAccounts, setChartOfAccounts] = useState(initialChartOfAccounts);
    const [interactions, setInteractions] = useState(initialInteractions);

    const renderPage = () => {
        switch (currentPage) {
            case 'Dashboard':
                return <Dashboard clients={clients} receivables={receivables} payables={payables} />;
            case 'Clientes':
                // O componente `Clients` agora gerencia sua própria busca de dados.
                return <Clients clients={clients} setClients={setClients} />;
            case 'CRM':
                return <CRM clients={clients} interactions={interactions} setInteractions={setInteractions} />;
            case 'Serviços':
                return <Services services={services} setServices={setServices} />;
            case 'Profissionais':
                return <Professionals professionals={professionals} setProfessionals={setProfessionals} />;
            case 'Agenda':
                return <Agenda appointments={appointments} clients={clients} services={services} />;
            case 'Financeiro':
                return <Financeiro 
                            receivables={receivables} setReceivables={setReceivables} 
                            payables={payables} setPayables={setPayables}
                            clients={clients} 
                            paymentMethods={paymentMethods}
                            chartOfAccounts={chartOfAccounts}
                        />;
            case 'Relatórios':
                return <Reports 
                            receivables={receivables} 
                            payables={payables} 
                            appointments={appointments} 
                            services={services} 
                            professionals={professionals}
                            clients={clients}
                        />;
            default:
                return <Dashboard clients={clients} receivables={receivables} payables={payables} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                {renderPage()}
            </main>
        </div>
    );
}

// --- COMPONENTES DE NAVEGAÇÃO E PÁGINAS ---

const Sidebar = ({ currentPage, setCurrentPage }) => {
    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard },
        { name: 'CRM', icon: BookUser },
        { name: 'Clientes', icon: Users },
        { name: 'Serviços', icon: ClipboardList },
        { name: 'Profissionais', icon: Handshake },
        { name: 'Agenda', icon: Calendar },
        { name: 'Financeiro', icon: DollarSign },
        { name: 'Relatórios', icon: FileText },
    ];

    return (
        <aside className="w-64 bg-white text-gray-800 flex flex-col shadow-lg">
            <div className="p-6 text-center border-b">
                <h1 className="text-2xl font-bold text-indigo-600">ClinicFlow</h1>
                <p className="text-sm text-gray-500">Gestão Inteligente</p>
            </div>
            <nav className="flex-1 px-4 py-4">
                <ul>
                    {navItems.map(item => (
                        <li key={item.name} className="mb-2">
                            <a
                                href="#"
                                onClick={() => setCurrentPage(item.name)}
                                className={`flex items-center p-3 rounded-lg transition-all duration-200 ${currentPage === item.name ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-gray-200'}`}
                            >
                                <item.icon className="h-5 w-5 mr-3" />
                                <span className="font-medium">{item.name}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-4 border-t">
                <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full object-cover" src="https://placehold.co/100x100/6366f1/white?text=A" alt="Admin" />
                    <div className="ml-3">
                        <p className="font-semibold">Admin</p>
                        <p className="text-sm text-gray-500">Clínica Fisiopilates</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

// --- COMPONENTE CLIENTES (ATUALIZADO E CONECTADO AO BACKEND) ---
const Clients = ({ clients, setClients }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/pacientes`);

                if (!response.ok) {
                    throw new Error('Não foi possível buscar os dados. Verifique se o backend está no ar.');
                }

                const data = await response.json();
                setClients(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, [setClients]);

    const filteredClients = clients.filter(client =>
        (client.nome && client.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.cpf && client.cpf.includes(searchTerm))
    );

    if (loading) {
        return <div className="text-center p-8">Conectando ao servidor e carregando pacientes...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-600">Erro ao conectar com o servidor: {error}</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Clientes</h2>
                <button className="flex items-center bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Novo Cliente
                </button>
            </div>
            <div className="mb-4 relative">
                <input
                    type="text"
                    placeholder="Buscar por nome ou CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Nome</th>
                            <th className="p-4 font-semibold text-gray-600">CPF</th>
                            <th className="p-4 font-semibold text-gray-600">Contato</th>
                            <th className="p-4 font-semibold text-gray-600">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClients.map(client => (
                            <tr key={client.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium text-gray-800">{client.nome}</td>
                                <td className="p-4 text-gray-600">{client.cpf}</td>
                                <td className="p-4 text-gray-600">{client.email}<br/>{client.telefone}</td>
                                <td className="p-4">
                                    <button className="text-indigo-600 hover:text-indigo-800 mr-2"><Edit size={18} /></button>
                                    <button className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- DEMAIS PÁGINAS E COMPONENTES (SEM ALTERAÇÕES) ---
const CRM = ({ clients, interactions, setInteractions }) => {
    const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClients = clients.filter(client =>
        client.nome && client.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const selectedClient = clients.find(c => c.id === selectedClientId);
    const clientInteractions = interactions
        .filter(i => i.clientId === selectedClientId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">CRM - Gestão de Relacionamento</h2>
            <div className="flex h-[calc(100vh-12rem)] bg-white rounded-xl shadow-md">
                <div className="w-1/3 border-r overflow-y-auto">
                    <div className="p-4 border-b">
                         <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <ul>
                        {filteredClients.map(client => (
                            <li key={client.id}>
                                <button 
                                    onClick={() => setSelectedClientId(client.id)}
                                    className={`w-full text-left p-4 border-b hover:bg-indigo-50 ${selectedClientId === client.id ? 'bg-indigo-100' : ''}`}
                                >
                                    <p className="font-semibold text-gray-800">{client.nome}</p>
                                    <p className="text-sm text-gray-500">{client.email}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="w-2/3 p-6 overflow-y-auto">
                    {selectedClient ? (
                        <ClientInteractionView 
                            client={selectedClient} 
                            interactions={clientInteractions}
                            setInteractions={setInteractions}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Selecione um cliente para ver as interações.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ClientInteractionView = ({ client, interactions, setInteractions }) => {
    const [interactionType, setInteractionType] = useState('Evolução');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!notes.trim()) return;

        const newInteraction = {
            id: Date.now(),
            clientId: client.id,
            date: new Date().toISOString().split('T')[0],
            type: interactionType,
            notes: notes,
        };

        setInteractions(prev => [newInteraction, ...prev]);
        setNotes('');
        setInteractionType('Evolução');
    };

    const interactionTypes = ['Evolução', 'Avaliação', 'Contato Telefônico', 'WhatsApp', 'E-mail', 'Cobrança', 'Outro'];
    
    const getTypeBadgeClass = (type) => {
        switch(type) {
            case 'Evolução': return 'bg-blue-100 text-blue-800';
            case 'Avaliação': return 'bg-purple-100 text-purple-800';
            case 'Cobrança': return 'bg-red-100 text-red-800';
            case 'Contato Telefônico': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    return (
        <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{client.nome}</h3>
            <p className="text-gray-600 mb-6">Histórico de interações e contatos</p>
            
            <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-lg mb-4">Registrar Nova Interação</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                        <input type="text" value={new Date().toLocaleDateString('pt-BR')} disabled className="w-full p-2 border bg-gray-200 rounded-lg"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Interação</label>
                        <select value={interactionType} onChange={e => setInteractionType(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                            {interactionTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                    <textarea 
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows="4"
                        placeholder="Descreva a evolução, contato, cobrança, etc."
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    ></textarea>
                </div>
                <div className="text-right mt-4">
                    <button type="submit" className="flex items-center justify-center ml-auto bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                        <PlusCircle className="h-5 w-5 mr-2" />
                        Adicionar Registro
                    </button>
                </div>
            </form>

            <div className="space-y-6">
                {interactions.map(interaction => (
                    <div key={interaction.id} className="p-4 border rounded-lg relative">
                        <div className="flex justify-between items-start">
                             <div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeClass(interaction.type)}`}>
                                    {interaction.type}
                                </span>
                                <p className="text-sm text-gray-500 mt-2">Data: {new Date(interaction.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>
                        <p className="mt-2 text-gray-700 whitespace-pre-wrap">{interaction.notes}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Reports = ({ receivables, payables, appointments, services, professionals, clients }) => {
    const [activeReport, setActiveReport] = useState('indicators');

    const renderReport = () => {
        switch(activeReport) {
            case 'indicators':
                return <KeyIndicatorsView 
                            appointments={appointments} 
                            professionals={professionals} 
                            receivables={receivables} 
                            payables={payables} 
                            clients={clients}
                            services={services}
                        />;
            case 'dre':
                return <DREView receivables={receivables} payables={payables} appointments={appointments} services={services} professionals={professionals} />;
            case 'cashflow':
                return <CashFlowView receivables={receivables} payables={payables} />;
            case 'commissions':
                return <CommissionsView appointments={appointments} services={services} professionals={professionals} clients={clients} />;
            default:
                return null;
        }
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Visão Gerencial</h2>
            <div className="flex space-x-2 border-b mb-6 flex-wrap">
                <button onClick={() => setActiveReport('indicators')} className={`px-4 py-2 font-semibold ${activeReport === 'indicators' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Indicadores Chave</button>
                <button onClick={() => setActiveReport('dre')} className={`px-4 py-2 font-semibold ${activeReport === 'dre' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>DRE</button>
                <button onClick={() => setActiveReport('cashflow')} className={`px-4 py-2 font-semibold ${activeReport === 'cashflow' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Fluxo de Caixa</button>
                <button onClick={() => setActiveReport('commissions')} className={`px-4 py-2 font-semibold ${activeReport === 'commissions' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Relatório de Comissões</button>
            </div>
            <div>
                {renderReport()}
            </div>
        </div>
    );
};

const KeyIndicatorsView = ({ appointments, professionals, receivables, payables, clients, services }) => {
    const [date, setDate] = useState(new Date('2025-07-01'));

    const kpis = useMemo(() => {
        const year = date.getFullYear();
        const month = date.getMonth();

        const getWeekdaysInMonth = (month, year) => {
            let days = new Date(year, month + 1, 0).getDate();
            let weekdays = 0;
            for (let i = 1; i <= days; i++) {
                let day = new Date(year, month, i).getDay();
                if (day !== 0 && day !== 6) {
                    weekdays++;
                }
            }
            return weekdays;
        };

        const weekdaysInMonth = getWeekdaysInMonth(month, year);
        const dailySlotsPerProfessional = 8;
        const totalAvailableSlots = professionals.length * weekdaysInMonth * dailySlotsPerProfessional;
        
        const bookedAppointments = appointments.filter(a => {
            const appDate = new Date(a.date);
            return appDate.getMonth() === month && appDate.getFullYear() === year;
        });
        
        const occupancyRate = totalAvailableSlots > 0 ? (bookedAppointments.length / totalAvailableSlots) * 100 : 0;
        const freeSlots = totalAvailableSlots - bookedAppointments.length;

        const paidReceivablesInMonth = receivables.filter(r => {
            const d = new Date(r.dueDate);
            return r.status === 'Pago' && d.getMonth() === month && d.getFullYear() === year;
        });
        
        const paidPayablesInMonth = payables.filter(p => {
            const d = new Date(p.dueDate);
            return p.status === 'Pago' && d.getMonth() === month && d.getFullYear() === year;
        });
        
        const commissionsInMonth = appointments
            .filter(a => {
                const d = new Date(a.date);
                return a.status === 'Realizado' && d.getMonth() === month && d.getFullYear() === year;
            })
            .reduce((sum, a) => {
                const service = services.find(s => s.id === a.serviceId);
                const professional = professionals.find(p => p.id === a.professionalId);
                return service && professional ? sum + (service.price * (professional.commission / 100)) : sum;
            }, 0);

        const grossRevenue = paidReceivablesInMonth.reduce((sum, r) => sum + r.value, 0);
        const totalCosts = paidPayablesInMonth.reduce((sum, p) => sum + p.value, 0) + commissionsInMonth;
        const netResult = grossRevenue - totalCosts;
        const profitabilityMargin = grossRevenue > 0 ? (netResult / grossRevenue) * 100 : 0;

        const payingClients = new Set(paidReceivablesInMonth.map(r => r.clientId));
        const averageTicket = payingClients.size > 0 ? grossRevenue / payingClients.size : 0;

        const attendedClients = new Set(bookedAppointments.map(a => a.clientId));
        const costPerPatient = attendedClients.size > 0 ? totalCosts / attendedClients.size : 0;

        const revenueByTherapist = professionals.map(prof => {
            const therapistRevenue = appointments
                .filter(a => {
                    const d = new Date(a.date);
                    return a.professionalId === prof.id && a.status === 'Realizado' && d.getMonth() === month && d.getFullYear() === year;
                })
                .reduce((sum, a) => {
                    const service = services.find(s => s.id === a.serviceId);
                    return sum + (service?.price || 0);
                }, 0);
            return { name: prof.name, revenue: therapistRevenue };
        });

        return {
            occupancyRate, freeSlots, averageTicket, revenueByTherapist, costPerPatient, profitabilityMargin
        };
    }, [date, appointments, professionals, receivables, payables, clients, services]);

    const changeMonth = (offset) => {
        setDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };
    
    const KPI_Card = ({ title, value, icon, format = v => v }) => (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-start justify-between">
                <p className="text-base font-semibold text-gray-600">{title}</p>
                <div className="p-2 bg-indigo-100 rounded-full">{icon}</div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">{format(value)}</p>
        </div>
    );

    return (
        <div className="space-y-6">
             <div className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-md max-w-md">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronLeft /></button>
                <span className="text-lg font-semibold text-gray-700 w-48 text-center capitalize">{date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronRight /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <KPI_Card title="Taxa de Ocupação" value={kpis.occupancyRate} icon={<Percent className="text-indigo-600"/>} format={v => `${v.toFixed(1)}%`} />
                <KPI_Card title="Agendas Livres" value={kpis.freeSlots} icon={<Calendar className="text-indigo-600"/>} format={v => v.toFixed(0)} />
                <KPI_Card title="Ticket Médio" value={kpis.averageTicket} icon={<DollarSign className="text-indigo-600"/>} format={v => `R$ ${v.toFixed(2)}`} />
                <KPI_Card title="Custo por Paciente" value={kpis.costPerPatient} icon={<TrendingDown className="text-indigo-600"/>} format={v => `R$ ${v.toFixed(2)}`} />
                <KPI_Card title="Margem de Lucratividade" value={kpis.profitabilityMargin} icon={<Target className="text-indigo-600"/>} format={v => `${v.toFixed(1)}%`} />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
                 <h3 className="text-lg font-semibold text-gray-700 mb-4">Receita Mensal por Fisioterapeuta</h3>
                 <div className="space-y-3">
                    {kpis.revenueByTherapist.map(therapist => (
                        <div key={therapist.name} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                            <p className="font-medium text-gray-800">{therapist.name}</p>
                            <p className="font-bold text-green-600">R$ {therapist.revenue.toFixed(2)}</p>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};

const DREView = ({ receivables, payables, appointments, services, professionals }) => {
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());

    const dreData = useMemo(() => {
        const grossRevenue = receivables
            .filter(r => r.status === 'Pago' && new Date(r.dueDate).getMonth() === month && new Date(r.dueDate).getFullYear() === year)
            .reduce((sum, r) => sum + r.value, 0);

        const commissions = appointments
            .filter(a => a.status === 'Realizado' && new Date(a.date).getMonth() === month && new Date(a.date).getFullYear() === year)
            .reduce((sum, a) => {
                const service = services.find(s => s.id === a.serviceId);
                const professional = professionals.find(p => p.id === a.professionalId);
                if (service && professional) {
                    return sum + (service.price * (professional.commission / 100));
                }
                return sum;
            }, 0);

        const operationalExpenses = payables
            .filter(p => p.status === 'Pago' && new Date(p.dueDate).getMonth() === month && new Date(p.dueDate).getFullYear() === year)
            .reduce((sum, p) => sum + p.value, 0);

        const netRevenue = grossRevenue;
        const grossProfit = netRevenue - commissions;
        const netResult = grossProfit - operationalExpenses;

        return { grossRevenue, commissions, operationalExpenses, grossProfit, netResult };
    }, [receivables, payables, appointments, services, professionals, month, year]);

    return (
        <div className="bg-white p-8 rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Demonstrativo de Resultados do Exercício</h3>
            <p className="text-gray-600 mb-6">Análise financeira para o período de {new Date(year, month).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}.</p>
            <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="font-semibold text-gray-700">(+) Receita Bruta com Serviços</span>
                    <span className="font-bold text-green-600">R$ {dreData.grossRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-4">
                    <span className="font-semibold text-gray-700">(-) Custos dos Serviços (Comissões)</span>
                    <span className="font-bold text-red-600">- R$ {dreData.commissions.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg border-t-2 border-gray-300">
                    <span className="font-bold text-gray-800">(=) Lucro Bruto</span>
                    <span className="font-extrabold text-gray-900">R$ {dreData.grossProfit.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between items-center p-4">
                    <span className="font-semibold text-gray-700">(-) Despesas Operacionais</span>
                    <span className="font-bold text-red-600">- R$ {dreData.operationalExpenses.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between items-center p-4 rounded-lg border-t-2 ${dreData.netResult >= 0 ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'}`}>
                    <span className="font-bold text-gray-800">(=) Resultado Líquido do Período</span>
                    <span className={`font-extrabold ${dreData.netResult >= 0 ? 'text-green-700' : 'text-red-700'}`}>R$ {dreData.netResult.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

const CashFlowView = ({ receivables, payables }) => {
    const cashFlowData = useMemo(() => {
        const data = {};
        const addData = (dateStr, value, type) => {
            const date = new Date(dateStr);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!data[key]) {
                data[key] = { name: new Date(date.getFullYear(), date.getMonth()).toLocaleString('pt-BR', {month: 'short', year: 'numeric'}), realizado: 0, projetado: 0 };
            }
            data[key][type] += value;
        };

        receivables.forEach(r => {
            if (r.status === 'Pago') addData(r.dueDate, r.value, 'realizado');
            if (r.status === 'Aberto') addData(r.dueDate, r.value, 'projetado');
        });

        payables.forEach(p => {
            if (p.status === 'Pago') addData(p.dueDate, -p.value, 'realizado');
            if (p.status === 'Aberto') addData(p.dueDate, -p.value, 'projetado');
        });

        return Object.values(data).sort((a, b) => new Date(a.name.split('/')[1], a.name.split('/')[0] - 1) - new Date(b.name.split('/')[1], b.name.split('/')[0] - 1));
    }, [receivables, payables]);

    return (
        <div className="bg-white p-8 rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Fluxo de Caixa (Realizado vs. Projetado)</h3>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `R$${value}`} />
                    <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                    <Legend />
                    <Line type="monotone" dataKey="realizado" name="Realizado" stroke="#16a34a" strokeWidth={2} />
                    <Line type="monotone" dataKey="projetado" name="Projetado" stroke="#ea580c" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const CommissionsView = ({ appointments, services, professionals, clients }) => {
    const [selectedProfessional, setSelectedProfessional] = useState('');
    
    const commissionData = useMemo(() => {
        if (!selectedProfessional) return [];
        
        return appointments
            .filter(a => a.professionalId === parseInt(selectedProfessional) && a.status === 'Realizado')
            .map(a => {
                const service = services.find(s => s.id === a.serviceId);
                const professional = professionals.find(p => p.id === a.professionalId);
                const client = clients.find(c => c.id === a.clientId);
                if (!service || !professional || !client) return null;

                const commissionValue = service.price * (professional.commission / 100);
                return {
                    id: a.id,
                    date: new Date(a.date).toLocaleDateString('pt-BR'),
                    clientName: client.nome,
                    serviceName: service.name,
                    servicePrice: service.price,
                    commissionValue,
                };
            })
            .filter(Boolean);
    }, [appointments, services, professionals, selectedProfessional, clients]);

    const totalCommission = commissionData.reduce((sum, item) => sum + item.commissionValue, 0);

    return (
        <div className="bg-white p-8 rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Relatório de Comissões</h3>
            <div className="mb-6">
                <label htmlFor="professional-select" className="block text-sm font-medium text-gray-700 mb-1">Selecione o Profissional</label>
                <select 
                    id="professional-select"
                    value={selectedProfessional}
                    onChange={(e) => setSelectedProfessional(e.target.value)}
                    className="w-full max-w-xs p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                    <option value="">-- Selecione --</option>
                    {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
            
            {selectedProfessional && (
                <div>
                    <table className="w-full text-left mb-6">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Data</th>
                                <th className="p-4 font-semibold text-gray-600">Cliente</th>
                                <th className="p-4 font-semibold text-gray-600">Serviço</th>
                                <th className="p-4 font-semibold text-gray-600">Valor Serviço</th>
                                <th className="p-4 font-semibold text-gray-600">Valor Comissão</th>
                            </tr>
                        </thead>
                        <tbody>
                            {commissionData.map(item => (
                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">{item.date}</td>
                                    <td className="p-4">{item.clientName}</td>
                                    <td className="p-4">{item.serviceName}</td>
                                    <td className="p-4">R$ {item.servicePrice.toFixed(2)}</td>
                                    <td className="p-4 font-bold text-indigo-600">R$ {item.commissionValue.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="text-right">
                        <span className="text-lg font-semibold text-gray-700">Total a Pagar: </span>
                        <span className="text-xl font-bold text-green-600">R$ {totalCommission.toFixed(2)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const Dashboard = ({ clients, receivables, payables }) => {
    const today = new Date();
    const churnDaysThreshold = 60;

    const stats = useMemo(() => {
        const monthlyRevenue = receivables
            .filter(r => {
                const dueDate = new Date(r.dueDate);
                return r.status === 'Pago' && dueDate.getMonth() === today.getMonth() && dueDate.getFullYear() === today.getFullYear();
            })
            .reduce((sum, r) => sum + r.value, 0);

        const overdueReceivables = receivables.filter(r => r.status === 'Vencido');

        return {
            totalClients: clients.length,
            monthlyRevenue: monthlyRevenue,
            overdueCount: overdueReceivables.length,
            overdueAmount: overdueReceivables.reduce((sum, r) => sum + r.value, 0),
        };
    }, [clients, receivables, today]);

    const revenueData = useMemo(() => {
        const months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return { month: d.toLocaleString('pt-BR', { month: 'short' }), year: d.getFullYear(), value: 0 };
        }).reverse();

        receivables.forEach(r => {
            if (r.status === 'Pago') {
                const date = new Date(r.dueDate);
                const monthStr = date.toLocaleString('pt-BR', { month: 'short' });
                const year = date.getFullYear();
                const monthData = months.find(m => m.month === monthStr && m.year === year);
                if (monthData) {
                    monthData.value += r.value;
                }
            }
        });
        return months.map(m => ({ name: m.month.toUpperCase(), Faturamento: m.value }));
    }, [receivables]);
    
    const comparisonData = useMemo(() => {
        const data = {};

        const addData = (dateStr, value, type) => {
            const date = new Date(dateStr + 'T00:00:00');
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!data[key]) {
                data[key] = {
                    name: date.toLocaleString('pt-BR', { month: 'short' }) + '/' + date.getFullYear().toString().slice(-2),
                    Receitas: 0,
                    Despesas: 0,
                };
            }
            data[key][type] += value;
        };

        receivables.forEach(r => addData(r.dueDate, r.value, 'Receitas'));
        payables.forEach(p => addData(p.dueDate, p.value, 'Despesas'));

        return Object.keys(data)
            .sort()
            .slice(-6)
            .map(key => data[key]);
    }, [receivables, payables]);

    const overdueClients = useMemo(() => {
        return receivables
            .filter(r => r.status === 'Vencido')
            .map(r => ({
                ...r,
                clientName: clients.find(c => c.id === r.clientId)?.nome || 'Cliente não encontrado'
            }));
    }, [receivables, clients]);

    const churnClients = useMemo(() => {
        const churnDate = new Date();
        churnDate.setDate(churnDate.getDate() - churnDaysThreshold);
        return clients.filter(c => c.lastVisit && new Date(c.lastVisit) < churnDate);
    }, [clients]);

    const StatCard = ({ title, value, icon, colorClass }) => (
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${colorClass}`}>
                {icon}
            </div>
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
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `R$${value}`} />
                                <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                                <Legend />
                                <Line type="monotone" dataKey="Faturamento" stroke="#4f46e5" strokeWidth={2} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Comparativo: Receitas vs. Despesas (Últimos 6 meses)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={comparisonData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `R$${value}`} />
                                <Tooltip formatter={(value, name) => [`R$ ${value.toFixed(2)}`, name]} />
                                <Legend />
                                <Bar dataKey="Receitas" fill="#22c55e" name="Receitas" />
                                <Bar dataKey="Despesas" fill="#ef4444" name="Despesas" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Clientes Inadimplentes</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {overdueClients.length > 0 ? overdueClients.map(r => (
                                <div key={r.id} className="flex justify-between items-center text-sm">
                                    <p className="font-medium text-gray-600">{r.clientName}</p>
                                    <p className="font-bold text-red-600">R$ {r.value.toFixed(2)}</p>
                                </div>
                            )) : <p className="text-sm text-gray-500">Nenhum cliente inadimplente.</p>}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Alerta de Evasão ({churnDaysThreshold} dias)</h3>
                         <div className="space-y-3 max-h-60 overflow-y-auto">
                            {churnClients.length > 0 ? churnClients.map(c => (
                                <div key={c.id} className="flex justify-between items-center text-sm">
                                    <p className="font-medium text-gray-600">{c.nome}</p>
                                    <p className="text-gray-500">Última visita: {new Date(c.lastVisit).toLocaleDateString('pt-BR')}</p>
                                </div>
                            )) : <p className="text-sm text-gray-500">Nenhum cliente em risco de evasão.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Financeiro = ({ receivables, setReceivables, payables, setPayables, clients, paymentMethods, chartOfAccounts }) => {
    const [activeTab, setActiveTab] = useState('receber');
    const [isReceivableModalOpen, setIsReceivableModalOpen] = useState(false);
    const [isPayableModalOpen, setIsPayableModalOpen] = useState(false);

    const getStatusClass = (status) => {
        switch (status) {
            case 'Pago': return 'bg-green-100 text-green-800';
            case 'Aberto': return 'bg-blue-100 text-blue-800';
            case 'Vencido': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Financeiro</h2>
                <button 
                    onClick={() => activeTab === 'receber' ? setIsReceivableModalOpen(true) : setIsPayableModalOpen(true)}
                    className="flex items-center bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Novo Lançamento
                </button>
            </div>

            <div className="flex space-x-2 border-b mb-6">
                <button onClick={() => setActiveTab('receber')} className={`px-4 py-2 font-semibold ${activeTab === 'receber' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Contas a Receber</button>
                <button onClick={() => setActiveTab('pagar')} className={`px-4 py-2 font-semibold ${activeTab === 'pagar' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Contas a Pagar</button>
            </div>

            {activeTab === 'receber' ? (
                <ReceivablesView receivables={receivables} clients={clients} paymentMethods={paymentMethods} getStatusClass={getStatusClass} />
            ) : (
                <PayablesView payables={payables} chartOfAccounts={chartOfAccounts} getStatusClass={getStatusClass} />
            )}

            {isReceivableModalOpen && <NewReceivableModal 
                closeModal={() => setIsReceivableModalOpen(false)} 
                clients={clients} 
                setReceivables={setReceivables}
            />}
            {isPayableModalOpen && <NewPayableModal 
                closeModal={() => setIsPayableModalOpen(false)} 
                chartOfAccounts={chartOfAccounts}
                setPayables={setPayables}
            />}
        </div>
    );
};

const ReceivablesView = ({ receivables, clients, paymentMethods, getStatusClass }) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
                <tr>
                    <th className="p-4 font-semibold text-gray-600">Cliente</th>
                    <th className="p-4 font-semibold text-gray-600">Descrição</th>
                    <th className="p-4 font-semibold text-gray-600">Valor Bruto</th>
                    <th className="p-4 font-semibold text-gray-600">Valor Líquido</th>
                    <th className="p-4 font-semibold text-gray-600">Vencimento</th>
                    <th className="p-4 font-semibold text-gray-600">Status</th>
                </tr>
            </thead>
            <tbody>
                {receivables.map(r => {
                    const method = paymentMethods.find(pm => pm.id === r.paymentMethodId);
                    const netValue = method && method.fee > 0 
                        ? r.value * (1 - method.fee / 100)
                        : r.value;

                    return (
                        <tr key={r.id} className="border-b hover:bg-gray-50">
                            <td className="p-4 font-medium text-gray-800">{clients.find(c => c.id === r.clientId)?.nome}</td>
                            <td className="p-4 text-gray-600">{r.description}</td>
                            <td className="p-4 text-gray-600">R$ {r.value.toFixed(2)}</td>
                            <td className="p-4 text-gray-600 font-semibold">{r.status === 'Pago' ? `R$ ${netValue.toFixed(2)}` : '-'}</td>
                            <td className="p-4 text-gray-600">{new Date(r.dueDate).toLocaleDateString('pt-BR')}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(r.status)}`}>
                                    {r.status}
                                </span>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);

const PayablesView = ({ payables, chartOfAccounts, getStatusClass }) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
                <tr>
                    <th className="p-4 font-semibold text-gray-600">Descrição</th>
                    <th className="p-4 font-semibold text-gray-600">Plano de Contas</th>
                    <th className="p-4 font-semibold text-gray-600">Valor</th>
                    <th className="p-4 font-semibold text-gray-600">Vencimento</th>
                    <th className="p-4 font-semibold text-gray-600">Status</th>
                </tr>
            </thead>
            <tbody>
                {payables.map(p => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-800">{p.description}</td>
                        <td className="p-4 text-gray-600">{chartOfAccounts.find(c => c.id === p.chartOfAccountId)?.name || 'N/A'}</td>
                        <td className="p-4 text-gray-600">R$ {p.value.toFixed(2)}</td>
                        <td className="p-4 text-gray-600">{new Date(p.dueDate).toLocaleDateString('pt-BR')}</td>
                        <td className="p-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(p.status)}`}>
                                {p.status}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const NewPayableModal = ({ closeModal, chartOfAccounts, setPayables }) => {
    const [description, setDescription] = useState('');
    const [chartOfAccountId, setChartOfAccountId] = useState('');
    const [value, setValue] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const newPayable = {
            id: Date.now(),
            description,
            chartOfAccountId: parseInt(chartOfAccountId),
            value: parseFloat(value),
            dueDate,
            status: 'Aberto'
        };
        setPayables(prev => [...prev, newPayable].sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate)));
        closeModal();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Nova Conta a Pagar</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Plano de Contas</label>
                            <select value={chartOfAccountId} onChange={e => setChartOfAccountId(e.target.value)} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                                <option value="">Selecione uma categoria</option>
                                {chartOfAccounts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                            <input type="number" step="0.01" value={value} onChange={e => setValue(e.target.value)} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento</label>
                            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-4">
                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Salvar Despesa</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Agenda = ({ appointments, clients, services }) => {
    const [currentDate, setCurrentDate] = useState(new Date('2025-07-18'));

    const changeMonth = (offset) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

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
                if ((i === 0 && j < firstDayOfMonth) || day > daysInMonth) {
                    week.push(null);
                } else {
                    const date = new Date(year, month, day);
                    const dayAppointments = appointments.filter(app => {
                        const appDate = new Date(app.date);
                        return appDate.getDate() === day && appDate.getMonth() === month && appDate.getFullYear() === year;
                    });
                    week.push({ day, date, appointments: dayAppointments });
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
                    <div className="flex items-center space-x-2">
                        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronLeft /></button>
                        <span className="text-xl font-semibold text-gray-700 w-48 text-center capitalize">{currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronRight /></button>
                    </div>
                    <button className="flex items-center bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                        <PlusCircle className="h-5 w-5 mr-2" />
                        Novo Agendamento
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-md">
                <div className="grid grid-cols-7 text-center font-semibold text-gray-600 border-b">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day} className="p-4">{day}</div>)}
                </div>
                <div className="grid grid-cols-7 grid-rows-6">
                    {calendarGrid.flat().map((dayData, index) => (
                        <div key={index} className="h-40 border-r border-b p-2 overflow-y-auto">
                            {dayData && (
                                <>
                                    <span className="font-bold">{dayData.day}</span>
                                    <div className="mt-1 space-y-1">
                                        {dayData.appointments.map(app => (
                                            <div key={app.id} className="bg-indigo-100 text-indigo-800 p-1 rounded-md text-xs">
                                                <p className="font-semibold truncate">{clients.find(c => c.id === app.clientId)?.nome}</p>
                                                <p className="truncate">{services.find(s => s.id === app.serviceId)?.name}</p>
                                                <p>{new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Services = ({ services, setServices }) => (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Serviços</h2>
            <button className="flex items-center bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                <PlusCircle className="h-5 w-5 mr-2" />
                Novo Serviço
            </button>
        </div>
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="p-4 font-semibold text-gray-600">Nome do Serviço</th>
                        <th className="p-4 font-semibold text-gray-600">Preço</th>
                        <th className="p-4 font-semibold text-gray-600">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {services.map(service => (
                        <tr key={service.id} className="border-b hover:bg-gray-50">
                            <td className="p-4 font-medium text-gray-800">{service.name}</td>
                            <td className="p-4 text-gray-600">R$ {service.price.toFixed(2)}</td>
                            <td className="p-4">
                                <button className="text-indigo-600 hover:text-indigo-800 mr-2"><Edit size={18} /></button>
                                <button className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const Professionals = ({ professionals, setProfessionals }) => (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Profissionais</h2>
            <button className="flex items-center bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                <PlusCircle className="h-5 w-5 mr-2" />
                Novo Profissional
            </button>
        </div>
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="p-4 font-semibold text-gray-600">Nome</th>
                        <th className="p-4 font-semibold text-gray-600">Comissão (%)</th>
                        <th className="p-4 font-semibold text-gray-600">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {professionals.map(prof => (
                        <tr key={prof.id} className="border-b hover:bg-gray-50">
                            <td className="p-4 font-medium text-gray-800">{prof.name}</td>
                            <td className="p-4 text-gray-600">{prof.commission}%</td>
                            <td className="p-4">
                                <button className="text-indigo-600 hover:text-indigo-800 mr-2"><Edit size={18} /></button>
                                <button className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const NewReceivableModal = ({ closeModal, clients, setReceivables }) => {
    const [isRecurring, setIsRecurring] = useState(false);
    const [installments, setInstallments] = useState(1);
    const [clientId, setClientId] = useState('');
    const [description, setDescription] = useState('');
    const [value, setValue] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const newReceivables = [];
        const baseValue = parseFloat(value);
        const firstDueDate = new Date(dueDate + 'T00:00:00');
        const numInstallments = isRecurring ? installments : 1;

        for (let i = 0; i < numInstallments; i++) {
            const currentDueDate = new Date(firstDueDate);
            currentDueDate.setMonth(currentDueDate.getMonth() + i);

            newReceivables.push({
                id: Date.now() + i,
                clientId: parseInt(clientId),
                description: `${description} ${numInstallments > 1 ? `(${i + 1}/${numInstallments})` : ''}`.trim(),
                value: baseValue,
                dueDate: currentDueDate.toISOString().split('T')[0],
                status: 'Aberto',
                paymentMethodId: null,
            });
        }
        
        setReceivables(prev => [...prev, ...newReceivables].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
        closeModal();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Novo Lançamento a Receber</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                            <select value={clientId} onChange={e => setClientId(e.target.value)} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                                <option value="">Selecione um cliente</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Parcela</label>
                            <input type="number" step="0.01" value={value} onChange={e => setValue(e.target.value)} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento da Primeira Parcela</label>
                            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="recurring" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                            <label htmlFor="recurring" className="ml-2 block text-sm text-gray-900">Pagamento Recorrente?</label>
                        </div>
                        {isRecurring && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Parcelas</label>
                                <input type="number" min="2" value={installments} onChange={e => setInstallments(parseInt(e.target.value))} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                            </div>
                        )}
                    </div>
                    <div className="mt-8 flex justify-end space-x-4">
                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Lançar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
