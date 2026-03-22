console.log('app.js carregado!');

const { useState, useEffect } = React;

// Configuração da API
const API_URL = window.location.origin + '/api';

console.log('API_URL:', API_URL);

// Componente de Login
function LoginPage({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                username,
                password
            });

            if (response.data.success) {
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('admin', JSON.stringify(response.data.data.admin));
                onLogin(response.data.data.admin);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h1>EUA Bypass</h1>
                    <p>Painel de Administração</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Digite seu username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Digite sua senha"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// Componente Dashboard
function Dashboard({ admin, onLogout }) {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [stats, setStats] = useState(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/users/stats/overview`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data.data);
        } catch (err) {
            console.error('Erro ao carregar estatísticas:', err);
        }
    };

    return (
        <div className="dashboard">
            <Sidebar 
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                admin={admin}
                onLogout={onLogout}
            />
            <div className="main-content">
                {currentPage === 'dashboard' && <DashboardHome stats={stats} />}
                {currentPage === 'users' && <UsersPage />}
                {currentPage === 'products' && <ProductsPage />}
                {currentPage === 'logs' && <LogsPage />}
            </div>
        </div>
    );
}

// Componente Sidebar
function Sidebar({ currentPage, setCurrentPage, admin, onLogout }) {
    const menuItems = [
        { id: 'dashboard', icon: 'fa-home', label: 'Dashboard' },
        { id: 'users', icon: 'fa-users', label: 'Usuários' },
        { id: 'products', icon: 'fa-box', label: 'Produtos' },
        { id: 'logs', icon: 'fa-list', label: 'Logs' },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>EUA Bypass</h2>
                <p>Olá, {admin.username}</p>
            </div>

            <ul className="sidebar-menu">
                {menuItems.map(item => (
                    <li
                        key={item.id}
                        className={`menu-item ${currentPage === item.id ? 'active' : ''}`}
                        onClick={() => setCurrentPage(item.id)}
                    >
                        <i className={`fas ${item.icon}`}></i>
                        <span>{item.label}</span>
                    </li>
                ))}
                <li className="menu-item" onClick={onLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Sair</span>
                </li>
            </ul>
        </div>
    );
}

// Componente Dashboard Home
function DashboardHome({ stats }) {
    if (!stats) {
        return <div className="loading"><i className="fas fa-spinner"></i></div>;
    }

    return (
        <div>
            <div className="content-header">
                <h1>Dashboard</h1>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Total de Usuários</span>
                        <div className="stat-card-icon primary">
                            <i className="fas fa-users"></i>
                        </div>
                    </div>
                    <div className="stat-card-value">{stats.total_users || 0}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Usuários Ativos</span>
                        <div className="stat-card-icon success">
                            <i className="fas fa-check-circle"></i>
                        </div>
                    </div>
                    <div className="stat-card-value">{stats.active_users || 0}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Usuários Banidos</span>
                        <div className="stat-card-icon danger">
                            <i className="fas fa-ban"></i>
                        </div>
                    </div>
                    <div className="stat-card-value">{stats.banned_users || 0}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Licenças Expiradas</span>
                        <div className="stat-card-icon warning">
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                    </div>
                    <div className="stat-card-value">{stats.expired_users || 0}</div>
                </div>
            </div>
        </div>
    );
}

// Componente Usuários
function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        loadUsers();
        loadProducts();
    }, []);

    const loadUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data.data);
        } catch (err) {
            console.error('Erro ao carregar usuários:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/products`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data.data);
        } catch (err) {
            console.error('Erro ao carregar produtos:', err);
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm('Tem certeza que deseja deletar este usuário?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            loadUsers();
        } catch (err) {
            alert('Erro ao deletar usuário');
        }
    };

    const handleBan = async (userId, isBanned) => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = isBanned ? 'unban' : 'ban';
            const reason = !isBanned ? prompt('Motivo do ban:') : '';
            
            await axios.post(`${API_URL}/users/${userId}/${endpoint}`, 
                { reason },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            loadUsers();
        } catch (err) {
            alert('Erro ao banir/desbanir usuário');
        }
    };

    const handleResetHwid = async (userId, currentHwid) => {
        if (!currentHwid) {
            alert('⚠️ Este usuário ainda não possui HWID registrado.');
            return;
        }

        if (!confirm(`🔄 Resetar HWID deste usuário?\n\nHWID atual: ${currentHwid}\n\nO usuário poderá logar em um novo PC.`)) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/users/${userId}/reset-hwid`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            alert('✅ ' + response.data.message);
            loadUsers();
        } catch (err) {
            alert('❌ Erro ao resetar HWID: ' + (err.response?.data?.message || 'Erro desconhecido'));
        }
    };

    if (loading) {
        return <div className="loading"><i className="fas fa-spinner"></i></div>;
    }

    return (
        <div>
            <div className="content-header">
                <h1>Gerenciar Usuários</h1>
                <button className="btn btn-success btn-small" onClick={() => { setEditingUser(null); setShowModal(true); }}>
                    <i className="fas fa-plus"></i> Novo Usuário
                </button>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Discord ID</th>
                            <th>Username</th>
                            <th>Produto</th>
                            <th>HWID</th>
                            <th>Expira em</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.discord_id}</td>
                                <td>{user.discord_username || 'N/A'}</td>
                                <td>{user.product_name || 'Sem produto'}</td>
                                <td>
                                    {user.hwid ? (
                                        <span style={{fontFamily: 'monospace', fontSize: '12px'}} title={user.hwid}>
                                            {user.hwid.substring(0, 12)}...
                                        </span>
                                    ) : (
                                        <span style={{color: '#888'}}>Não registrado</span>
                                    )}
                                </td>
                                <td>{new Date(user.expires_at).toLocaleDateString('pt-BR')}</td>
                                <td>
                                    {user.is_banned ? (
                                        <span className="badge badge-danger">Banido</span>
                                    ) : user.is_active ? (
                                        <span className="badge badge-success">Ativo</span>
                                    ) : (
                                        <span className="badge badge-warning">Inativo</span>
                                    )}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-icon btn-edit" onClick={() => { setEditingUser(user); setShowModal(true); }} title="Editar">
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        {user.hwid && (
                                            <button 
                                                className="btn-icon" 
                                                style={{background: '#6b7280', color: 'white'}}
                                                onClick={() => handleResetHwid(user.id, user.hwid)}
                                                title="Resetar HWID"
                                            >
                                                <i className="fas fa-sync-alt"></i>
                                            </button>
                                        )}
                                        <button 
                                            className="btn-icon btn-ban" 
                                            onClick={() => handleBan(user.id, user.is_banned)}
                                            title={user.is_banned ? 'Desbanir' : 'Banir'}
                                        >
                                            <i className={`fas ${user.is_banned ? 'fa-check' : 'fa-ban'}`}></i>
                                        </button>
                                        <button className="btn-icon btn-delete" onClick={() => handleDelete(user.id)} title="Deletar">
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <UserModal
                    user={editingUser}
                    products={products}
                    onClose={() => setShowModal(false)}
                    onSave={() => { loadUsers(); setShowModal(false); }}
                />
            )}
        </div>
    );
}

// Modal de Usuário
function UserModal({ user, products, onClose, onSave }) {
    const [formData, setFormData] = useState({
        discord_id: user?.discord_id || '',
        discord_username: user?.discord_username || '',
        product_id: user?.product_id || '',
        duration_days: 30
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            
            if (user) {
                // Editar
                await axios.put(`${API_URL}/users/${user.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                // Criar
                await axios.post(`${API_URL}/users`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            onSave();
        } catch (err) {
            alert(err.response?.data?.message || 'Erro ao salvar usuário');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>{user ? 'Editar Usuário' : 'Novo Usuário'}</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Discord ID *</label>
                            <input
                                type="text"
                                value={formData.discord_id}
                                onChange={(e) => setFormData({...formData, discord_id: e.target.value})}
                                required
                                disabled={!!user}
                            />
                        </div>

                        <div className="form-group">
                            <label>Discord Username</label>
                            <input
                                type="text"
                                value={formData.discord_username}
                                onChange={(e) => setFormData({...formData, discord_username: e.target.value})}
                            />
                        </div>

                        {user && user.hwid && (
                            <div className="form-group">
                                <label>HWID Registrado</label>
                                <input
                                    type="text"
                                    value={user.hwid}
                                    disabled
                                    style={{fontFamily: 'monospace', fontSize: '12px', color: '#9ca3af'}}
                                />
                                <small style={{color: '#888', display: 'block', marginTop: '5px'}}>
                                    🔒 Este PC está vinculado à conta. Use o botão de reset para permitir outro PC.
                                </small>
                            </div>
                        )}
                        
                        {user && !user.hwid && (
                            <div className="form-group">
                                <label>HWID</label>
                                <input
                                    type="text"
                                    value="Não registrado"
                                    disabled
                                    style={{color: '#888'}}
                                />
                                <small style={{color: '#888', display: 'block', marginTop: '5px'}}>
                                    ℹ️ HWID será registrado no primeiro login.
                                </small>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Produto</label>
                            <select
                                value={formData.product_id}
                                onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                            >
                                <option value="">Selecione um produto</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {!user && (
                            <div className="form-group">
                                <label>Duração (dias)</label>
                                <input
                                    type="number"
                                    value={formData.duration_days}
                                    onChange={(e) => setFormData({...formData, duration_days: parseInt(e.target.value)})}
                                    min="1"
                                />
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary btn-small" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary btn-small">
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Componente Produtos
function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/products`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data.data);
        } catch (err) {
            console.error('Erro ao carregar produtos:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId) => {
        if (!confirm('Tem certeza que deseja deletar este produto?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/products/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            loadProducts();
        } catch (err) {
            alert('Erro ao deletar produto');
        }
    };

    const handleToggle = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/products/${productId}/toggle`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            loadProducts();
        } catch (err) {
            alert('Erro ao alternar produto');
        }
    };

    if (loading) {
        return <div className="loading"><i className="fas fa-spinner"></i></div>;
    }

    return (
        <div>
            <div className="content-header">
                <h1>Gerenciar Produtos</h1>
                <button className="btn btn-success btn-small" onClick={() => { setEditingProduct(null); setShowModal(true); }}>
                    <i className="fas fa-plus"></i> Novo Produto
                </button>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Descrição</th>
                            <th>Preço</th>
                            <th>Duração</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>{product.description}</td>
                                <td>R$ {product.price.toFixed(2)}</td>
                                <td>{product.duration_days} dias</td>
                                <td>
                                    <span className={`badge ${product.is_active ? 'badge-success' : 'badge-danger'}`}>
                                        {product.is_active ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-icon btn-edit" onClick={() => { setEditingProduct(product); setShowModal(true); }}>
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button className="btn-icon btn-ban" onClick={() => handleToggle(product.id)}>
                                            <i className={`fas ${product.is_active ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                                        </button>
                                        <button className="btn-icon btn-delete" onClick={() => handleDelete(product.id)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <ProductModal
                    product={editingProduct}
                    onClose={() => setShowModal(false)}
                    onSave={() => { loadProducts(); setShowModal(false); }}
                />
            )}
        </div>
    );
}

// Modal de Produto
function ProductModal({ product, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || 0,
        duration_days: product?.duration_days || 30
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            
            if (product) {
                await axios.put(`${API_URL}/products/${product.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/products`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            onSave();
        } catch (err) {
            alert(err.response?.data?.message || 'Erro ao salvar produto');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>{product ? 'Editar Produto' : 'Novo Produto'}</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Nome *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Descrição</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        <div className="form-group">
                            <label>Preço (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Duração (dias)</label>
                            <input
                                type="number"
                                value={formData.duration_days}
                                onChange={(e) => setFormData({...formData, duration_days: parseInt(e.target.value)})}
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary btn-small" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary btn-small">
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Componente Logs
function LogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/logs?limit=50`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLogs(response.data.data);
        } catch (err) {
            console.error('Erro ao carregar logs:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading"><i className="fas fa-spinner"></i></div>;
    }

    return (
        <div>
            <div className="content-header">
                <h1>Logs do Sistema</h1>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Discord ID</th>
                            <th>Ação</th>
                            <th>Detalhes</th>
                            <th>IP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td>{new Date(log.created_at).toLocaleString('pt-BR')}</td>
                                <td>{log.discord_id || 'N/A'}</td>
                                <td>{log.action}</td>
                                <td>{log.details}</td>
                                <td>{log.ip_address || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// App Principal
function App() {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/auth/verify`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setAdmin(response.data.data.admin);
            }
        } catch (err) {
            localStorage.removeItem('token');
            localStorage.removeItem('admin');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (adminData) => {
        setAdmin(adminData);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        setAdmin(null);
    };

    if (loading) {
        return <div className="loading"><i className="fas fa-spinner"></i></div>;
    }

    return admin ? (
        <Dashboard admin={admin} onLogout={handleLogout} />
    ) : (
        <LoginPage onLogin={handleLogin} />
    );
}

// Renderizar
console.log('Renderizando aplicação...');
try {
    const root = ReactDOM.createRoot(document.getElementById('app'));
    root.render(<App />);
    console.log('Aplicação renderizada com sucesso!');
} catch (error) {
    console.error('Erro ao renderizar:', error);
    // Fallback para React 17
    ReactDOM.render(<App />, document.getElementById('app'));
}
