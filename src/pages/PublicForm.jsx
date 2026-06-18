import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabase'

export default function PublicForm() {
  const { formId } = useParams()
  const [form, setForm] = useState(null)
  const [client, setClient] = useState(null)
  const [answers, setAnswers] = useState({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchForm() }, [formId])

  async function fetchForm() {
    const { data: f } = await supabase.from('forms').select('*').eq('id', formId).single()
    if (f) {
      setForm(f)
      const { data: c } = await supabase.from('clients').select('*').eq('id', f.client_id).single()
      setClient(c)
    }
    setLoading(false)
  }

  async function handleSubmit() {
    setSubmitting(true)
    await supabase.from('responses').insert({ form_id: form.id, client_id: form.client_id, answers })
    setSubmitted(true)
    setSubmitting(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#090909', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontFamily: "'Inter', sans-serif", fontSize: '13px' }}>
      Carregando...
    </div>
  )

  if (!form) return (
    <div style={{ minHeight: '100vh', background: '#090909', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontFamily: "'Inter', sans-serif", fontSize: '13px' }}>
      Formulário não encontrado.
    </div>
  )

  const questions = form.questions || []
  const current = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1
  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0

  function handleNext() {
    if (isLast) handleSubmit()
    else setCurrentIndex(currentIndex + 1)
  }

  function handleBack() {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
  }

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: '#090909', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid rgba(214,186,138,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', fontSize: '18px' }}>✓</div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#f0f0f0', marginBottom: '12px', letterSpacing: '-0.5px' }}>Respostas enviadas.</h2>
        <p style={{ color: '#444', fontSize: '14px', lineHeight: '1.7', margin: '0 0 48px 0' }}>
          Obrigado, <span style={{ color: '#D6BA8A' }}>{client?.name}</span>. Suas respostas foram recebidas com sucesso. Em breve entraremos em contato.
        </p>
        <div style={{ borderTop: '1px solid rgba(255,255,255,.04)', paddingTop: '32px' }}>
          <p style={{ fontSize: '11px', color: '#2a2a2a', letterSpacing: '0.12em', margin: 0 }}>FRAME VISUALS</p>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#090909', color: '#e8e8e8', fontFamily: "'Inter', -apple-system, sans-serif", display: 'flex', flexDirection: 'column' }}>

      {/* Progress bar */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,.04)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <div style={{ height: '100%', background: '#D6BA8A', width: `${progress}%`, transition: 'width 0.5s ease' }} />
      </div>

      {/* Header */}
      <div style={{ padding: '24px 48px', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
        <span style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.1em', color: '#D6BA8A' }}>FRAME VISUALS</span>
      </div>

      {/* Question area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
        <div style={{ width: '100%', maxWidth: '580px' }}>

          {/* Counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <span style={{ fontSize: '11px', color: '#333', fontWeight: '600', letterSpacing: '0.1em' }}>
              {String(currentIndex + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,.04)' }} />
          </div>

          {/* Question */}
          <h2 style={{ fontSize: '22px', fontWeight: '600', lineHeight: '1.5', marginBottom: '20px', letterSpacing: '-0.3px', color: '#f0f0f0' }}>
            {current?.text}
          </h2>

          {/* Description */}
          {current?.desc && (
            <p style={{ fontSize: '13px', color: '#3a3a3a', lineHeight: '1.7', marginBottom: '32px', paddingLeft: '14px', borderLeft: '2px solid rgba(255,255,255,.06)' }}>
              {current.desc}
            </p>
          )}

          {/* Answer */}
          <textarea
            key={currentIndex}
            value={answers[current?.id] || ''}
            onChange={e => setAnswers({ ...answers, [current.id]: e.target.value })}
            rows={5}
            autoFocus
            placeholder="Sua resposta..."
            style={{
              width: '100%', background: '#111',
              border: '1px solid rgba(255,255,255,.06)',
              borderRadius: '8px', padding: '16px', color: '#e8e8e8',
              fontSize: '15px', boxSizing: 'border-box', outline: 'none',
              resize: 'none', fontFamily: "'Inter', sans-serif", lineHeight: '1.7',
              transition: 'border-color 0.2s',
              boxShadow: '0 0 0 1px rgba(255,255,255,.02), 0 20px 50px rgba(0,0,0,.3)'
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(214,186,138,.3)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.06)'}
          />

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
            <button
              onClick={handleBack}
              disabled={currentIndex === 0}
              style={{ background: 'none', border: 'none', color: currentIndex === 0 ? '#1a1a1a' : '#444', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', fontSize: '13px', padding: '10px 0', transition: 'color 0.15s' }}
              onMouseEnter={e => { if (currentIndex > 0) e.currentTarget.style.color = '#888' }}
              onMouseLeave={e => { if (currentIndex > 0) e.currentTarget.style.color = '#444' }}
            >
              ← Anterior
            </button>
            <button
              onClick={handleNext}
              disabled={submitting}
              style={{ background: '#D6BA8A', color: '#090909', border: 'none', borderRadius: '7px', padding: '11px 24px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', opacity: submitting ? 0.6 : 1, letterSpacing: '0.01em' }}
            >
              {submitting ? 'Enviando...' : isLast ? 'Enviar respostas' : 'Próxima →'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '20px 48px', borderTop: '1px solid rgba(255,255,255,.03)', display: 'flex', justifyContent: 'center' }}>
        <p style={{ fontSize: '11px', color: '#1a1a1a', letterSpacing: '0.12em', margin: 0 }}>BRIEFING CONFIDENCIAL</p>
      </div>
    </div>
  )
}