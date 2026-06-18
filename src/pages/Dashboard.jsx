import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { Plus, LogOut, ArrowRight } from 'lucide-react'

export default function Dashboard() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
    fetchClients()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) navigate('/login')
  }

  async function fetchClients() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setClients(data)
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const typeLabels = {
    marca_pessoal: 'Marca Pessoal',
    negocio_local: 'Negócio Local',
    marca_negocio: 'Marca + Negócio',
    audiovisual: 'Audiovisual'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#090909', color: '#e8e8e8', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Top bar */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,.06)', padding: '0 48px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'rgba(9,9,9,.8)', backdropFilter: 'blur(20px)', zIndex: 10 }}>
        <span style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.08em', color: '#D6BA8A' }}>FRAME VISUALS</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => navigate('/novo-cliente')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#D6BA8A', color: '#090909', border: 'none', borderRadius: '6px', padding: '7px 14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            <Plus size={13} /> Novo cliente
          </button>
          <button onClick={handleLogout} style={{ background: 'none', border: '1px solid rgba(255,255,255,.08)', borderRadius: '6px', padding: '7px 10px', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <LogOut size={13} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '64px 48px' }}>
        {/* Header */}
        <div style={{ marginBottom: '56px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '-0.8px', color: '#f0f0f0', margin: '0 0 8px 0', lineHeight: 1.2 }}>
            Sistema de Estratégia
          </h1>
          <p style={{ fontSize: '15px', color: '#555', margin: 0 }}>
            {clients.length} {clients.length === 1 ? 'cliente ativo' : 'clientes ativos'}
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,.06)', borderRadius: '10px', overflow: 'hidden', marginBottom: '48px' }}>
          {[
            { label: 'Total', value: clients.length },
            { label: 'Marca Pessoal', value: clients.filter(c => c.project_type === 'marca_pessoal').length },
            { label: 'Negócio Local', value: clients.filter(c => c.project_type === 'negocio_local').length },
          ].map((s, i) => (
            <div key={i} style={{ background: '#111', padding: '24px 28px' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-1px', color: '#f0f0f0', marginBottom: '4px' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Client list */}
        <div>
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#333', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>Clientes</p>

          {loading ? (
            <p style={{ color: '#333', fontSize: '14px' }}>Carregando...</p>
          ) : clients.length === 0 ? (
            <div style={{ border: '1px dashed rgba(255,255,255,.06)', borderRadius: '10px', padding: '64px', textAlign: 'center' }}>
              <p style={{ color: '#333', fontSize: '14px', margin: '0 0 16px 0' }}>Nenhum cliente ainda.</p>
              <button onClick={() => navigate('/novo-cliente')} style={{ background: 'none', border: '1px solid rgba(255,255,255,.1)', borderRadius: '6px', padding: '8px 16px', color: '#D6BA8A', fontSize: '13px', cursor: 'pointer' }}>Criar primeiro cliente →</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1px', background: 'rgba(255,255,255,.06)', borderRadius: '10px', overflow: 'hidden' }}>
              {clients.map(client => (
                <div
                  key={client.id}
                  onClick={() => navigate(`/cliente/${client.id}`)}
                  style={{ background: '#111', padding: '18px 24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#161616'}
                  onMouseLeave={e => e.currentTarget.style.background = '#111'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(214,186,138,.1)', border: '1px solid rgba(214,186,138,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#D6BA8A', flexShrink: 0 }}>
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#e8e8e8', marginBottom: '2px' }}>{client.name}</div>
                      <div style={{ fontSize: '12px', color: '#444' }}>{client.email || 'Sem email'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {client.project_type && (
                      <span style={{ fontSize: '11px', color: '#D6BA8A', background: 'rgba(214,186,138,.08)', padding: '3px 8px', borderRadius: '4px', fontWeight: '500' }}>
                        {typeLabels[client.project_type]}
                      </span>
                    )}
                    <span style={{ fontSize: '12px', color: '#333' }}>{new Date(client.created_at).toLocaleDateString('pt-BR')}</span>
                    <ArrowRight size={14} color="#333" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
