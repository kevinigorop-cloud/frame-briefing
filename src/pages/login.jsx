import { useState } from 'react'
import { supabase } from '../supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    console.log('data:', data)
    console.log('error:', error)
    if (error) setError(error.message)
    else window.location.href = '/'
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px',
    padding: '14px 16px', color: '#f0f0f0', fontSize: '15px', boxSizing: 'border-box',
    outline: 'none', fontFamily: 'Inter, sans-serif'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '0 24px' }}>
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f0f0f0', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            Frame <span style={{ color: '#c9b99a' }}>Visuals</span>
          </h1>
          <p style={{ color: '#555', fontSize: '14px', margin: 0 }}>Acesso restrito à equipe</p>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '8px' }}>Email</label>
            <input
              style={inputStyle}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              onFocus={e => e.target.style.borderColor = '#c9b99a'}
              onBlur={e => e.target.style.borderColor = '#2a2a2a'}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '8px' }}>Senha</label>
            <input
              style={inputStyle}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              onFocus={e => e.target.style.borderColor = '#c9b99a'}
              onBlur={e => e.target.style.borderColor = '#2a2a2a'}
            />
          </div>

          {error && <p style={{ color: '#e05555', fontSize: '13px', margin: 0 }}>{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ background: '#c9b99a', color: '#0a0a0a', border: 'none', borderRadius: '8px', padding: '14px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', marginTop: '8px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  )
}