import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { ArrowLeft, Upload, Plus, Copy, Check, Trash2, Download } from 'lucide-react'
import jsPDF from 'jspdf'

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [form, setForm] = useState(null)
  const [responses, setResponses] = useState([])
  const [files, setFiles] = useState([])
  const [metrics, setMetrics] = useState([])
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('briefing')
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [newMetric, setNewMetric] = useState({ title: '', value: '', goal: '' })
  const [addingMetric, setAddingMetric] = useState(false)

  useEffect(() => { fetchAll() }, [id])

  async function fetchAll() {
    const [{ data: c }, { data: f }, { data: r }, { data: fi }, { data: m }, { data: n }] = await Promise.all([
      supabase.from('clients').select('*').eq('id', id).single(),
      supabase.from('forms').select('*').eq('client_id', id).single(),
      supabase.from('responses').select('*').eq('client_id', id),
      supabase.from('files').select('*').eq('client_id', id).order('uploaded_at', { ascending: false }),
      supabase.from('metrics').select('*').eq('client_id', id),
      supabase.from('notes').select('*').eq('client_id', id).single(),
    ])
    setClient(c); setForm(f); setResponses(r || []); setFiles(fi || []); setMetrics(m || [])
    setNotes(n?.content || '')
  }

  async function saveNotes() {
    setSavingNotes(true)
    const { data: existing } = await supabase.from('notes').select('id').eq('client_id', id).single()
    if (existing) {
      await supabase.from('notes').update({ content: notes, updated_at: new Date().toISOString() }).eq('client_id', id)
    } else {
      await supabase.from('notes').insert({ client_id: id, content: notes })
    }
    setSavingNotes(false)
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2000)
  }

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${id}/${Date.now()}.${ext}`
    const { error: upError } = await supabase.storage.from('client-files').upload(path, file)
    if (upError) { alert('Erro no upload'); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('client-files').getPublicUrl(path)
    const category = file.type.startsWith('image') ? 'imagem' : file.type.startsWith('audio') ? 'audio' : file.type.startsWith('video') ? 'video' : 'documento'
    await supabase.from('files').insert({ client_id: id, name: file.name, type: file.type, url: publicUrl, category })
    await fetchAll()
    setUploading(false)
  }

  async function deleteFile(fileId, url) {
    const path = url.split('/client-files/')[1]
    await supabase.storage.from('client-files').remove([path])
    await supabase.from('files').delete().eq('id', fileId)
    await fetchAll()
  }

  async function saveMetric() {
    if (!newMetric.title) return
    await supabase.from('metrics').insert({ client_id: id, ...newMetric })
    setNewMetric({ title: '', value: '', goal: '' })
    setAddingMetric(false)
    await fetchAll()
  }

  async function deleteMetric(metricId) {
    await supabase.from('metrics').delete().eq('id', metricId)
    await fetchAll()
  }

  function copyFormLink() {
    const link = `${window.location.origin}/formulario/${form?.id}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function exportPDF() {
    const doc = new jsPDF()
    const lastResponse = responses[responses.length - 1]
    const pageWidth = doc.internal.pageSize.getWidth()
    let y = 20

    const addText = (text, x, size, color, maxWidth) => {
      doc.setFontSize(size)
      doc.setTextColor(...color)
      const lines = doc.splitTextToSize(text, maxWidth || pageWidth - 40)
      lines.forEach(line => {
        if (y > 270) { doc.addPage(); y = 20 }
        doc.text(line, x, y)
        y += size * 0.5
      })
      y += 2
    }

    // Header
    doc.setFillColor(9, 9, 9)
    doc.rect(0, 0, pageWidth, 40, 'F')
    doc.setFontSize(10)
    doc.setTextColor(214, 186, 138)
    doc.text('FRAME VISUALS', 20, 18)
    doc.setFontSize(16)
    doc.setTextColor(240, 240, 240)
    doc.text(`Briefing — ${client?.name}`, 20, 30)
    y = 52

    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}  ·  ${client?.project_type || ''}`, 20, y)
    y += 12

    // Divider
    doc.setDrawColor(40, 40, 40)
    doc.line(20, y, pageWidth - 20, y)
    y += 10

    // Blocks
    const BLOCK_MAP = {
      marca_pessoal: ['Identidade e História', 'Objetivo e Posicionamento', 'Público e Mercado', 'Conteúdo e Execução'],
      negocio_local: ['O Negócio', 'Diferencial e Concorrência', 'Cliente e Objeções', 'Conteúdo e Execução'],
      marca_negocio: ['Quem é a Pessoa', 'O Negócio', 'Mercado e Concorrência', 'Conteúdo e Referências'],
      audiovisual: ['O Serviço e o Diferencial', 'Público e Objetivo', 'Concorrência e Mercado', 'Conteúdo e Processo']
    }
    const BLOCK_SIZES = {
      marca_pessoal: [5, 4, 3, 3], negocio_local: [4, 3, 3, 3],
      marca_negocio: [6, 5, 3, 6], audiovisual: [3, 3, 2, 4]
    }

    const questions = form?.questions || []
    const blockNames = BLOCK_MAP[client?.project_type] || []
    const sizes = BLOCK_SIZES[client?.project_type] || []
    let qIndex = 0

    blockNames.forEach((blockName, bi) => {
      const blockQs = questions.slice(qIndex, qIndex + (sizes[bi] || 0))
      qIndex += sizes[bi] || 0

      if (y > 250) { doc.addPage(); y = 20 }

      // Block title
      doc.setFillColor(20, 20, 20)
      doc.roundedRect(20, y - 4, pageWidth - 40, 10, 1, 1, 'F')
      doc.setFontSize(8)
      doc.setTextColor(214, 186, 138)
      doc.text(blockName.toUpperCase(), 24, y + 3)
      y += 14

      blockQs.forEach(q => {
        if (y > 260) { doc.addPage(); y = 20 }
        const answer = lastResponse?.answers?.[q.id]

        doc.setFontSize(9)
        doc.setTextColor(160, 160, 160)
        const qLines = doc.splitTextToSize(q.text, pageWidth - 44)
        qLines.forEach(line => { doc.text(line, 24, y); y += 5 })
        y += 2

        doc.setFontSize(10)
        doc.setTextColor(answer ? 230 : 80, answer ? 230 : 80, answer ? 230 : 80)
        const aText = answer || 'Sem resposta'
        const aLines = doc.splitTextToSize(aText, pageWidth - 44)
        aLines.forEach(line => {
          if (y > 270) { doc.addPage(); y = 20 }
          doc.text(line, 24, y); y += 5.5
        })
        y += 6

        doc.setDrawColor(30, 30, 30)
        doc.line(24, y, pageWidth - 24, y)
        y += 8
      })
      y += 4
    })

    doc.save(`briefing-${client?.name?.toLowerCase().replace(/\s/g, '-')}.pdf`)
  }

  const typeLabels = {
    marca_pessoal: 'Marca Pessoal', negocio_local: 'Negócio Local',
    marca_negocio: 'Marca + Negócio', audiovisual: 'Audiovisual'
  }

  const inputStyle = {
    width: '100%', background: '#0d0d0d', border: '1px solid rgba(255,255,255,.08)', borderRadius: '6px',
    padding: '10px 14px', color: '#e8e8e8', fontSize: '13px', boxSizing: 'border-box', outline: 'none',
    fontFamily: "'Inter', sans-serif"
  }

  const BLOCK_MAP = {
    marca_pessoal: ['Identidade e História', 'Objetivo e Posicionamento', 'Público e Mercado', 'Conteúdo e Execução'],
    negocio_local: ['O Negócio', 'Diferencial e Concorrência', 'Cliente e Objeções', 'Conteúdo e Execução'],
    marca_negocio: ['Quem é a Pessoa', 'O Negócio', 'Mercado e Concorrência', 'Conteúdo e Referências'],
    audiovisual: ['O Serviço e o Diferencial', 'Público e Objetivo', 'Concorrência e Mercado', 'Conteúdo e Processo']
  }
  const BLOCK_SIZES = {
    marca_pessoal: [5, 4, 3, 3], negocio_local: [4, 3, 3, 3],
    marca_negocio: [6, 5, 3, 6], audiovisual: [3, 3, 2, 4]
  }

  const lastResponse = responses[responses.length - 1]
  const questions = form?.questions || []
  const answered = questions.filter(q => lastResponse?.answers?.[q.id]).length
  const progress = questions.length > 0 ? Math.round((answered / questions.length) * 100) : 0

  const blocks = []
  if (form?.questions && client?.project_type) {
    const blockNames = BLOCK_MAP[client.project_type] || []
    const sizes = BLOCK_SIZES[client.project_type] || []
    let qIndex = 0
    blockNames.forEach((name, i) => {
      blocks.push({ title: name, questions: form.questions.slice(qIndex, qIndex + (sizes[i] || 0)) })
      qIndex += sizes[i] || 0
    })
  }

  if (!client) return (
    <div style={{ background: '#090909', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontFamily: "'Inter', sans-serif", fontSize: '13px' }}>
      Carregando...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#090909', color: '#e8e8e8', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Top bar */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,.06)', padding: '0 48px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'rgba(9,9,9,.9)', backdropFilter: 'blur(20px)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
            <ArrowLeft size={15} />
          </button>
          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,.08)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(214,186,138,.1)', border: '1px solid rgba(214,186,138,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#D6BA8A' }}>
              {client.name.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#e8e8e8' }}>{client.name}</span>
            <span style={{ fontSize: '11px', color: '#D6BA8A', background: 'rgba(214,186,138,.08)', padding: '2px 7px', borderRadius: '4px' }}>
              {typeLabels[client.project_type] || client.project_type}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={exportPDF} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid rgba(255,255,255,.08)', borderRadius: '6px', padding: '6px 12px', color: '#555', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#D6BA8A'; e.currentTarget.style.borderColor = 'rgba(214,186,138,.3)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)' }}
          >
            <Download size={12} /> Exportar PDF
          </button>
          {form && (
            <button onClick={copyFormLink} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid rgba(255,255,255,.08)', borderRadius: '6px', padding: '6px 12px', color: copied ? '#D6BA8A' : '#555', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
              {copied ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar link</>}
            </button>
          )}
        </div>
      </div>

      {/* Client hero */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,.06)', padding: '40px 48px 32px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.6px', margin: '0 0 6px 0', color: '#f0f0f0' }}>{client.name}</h1>
              <p style={{ fontSize: '13px', color: '#444', margin: 0 }}>
                {client.email && <span>{client.email} · </span>}
                Criado em {new Date(client.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
            {questions.length > 0 && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px', color: progress === 100 ? '#D6BA8A' : '#f0f0f0' }}>{progress}%</div>
                <div style={{ fontSize: '11px', color: '#444', marginTop: '2px' }}>{answered} de {questions.length} respondidas</div>
                <div style={{ width: '120px', height: '3px', background: 'rgba(255,255,255,.06)', borderRadius: '2px', marginTop: '8px' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: '#D6BA8A', borderRadius: '2px', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,.06)', padding: '0 48px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex' }}>
          {[['briefing', 'Briefing'], ['arquivos', 'Arquivos'], ['metricas', 'Métricas'], ['notas', 'Notas Privadas']].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{
              padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: '500',
              color: activeTab === key ? '#e8e8e8' : '#444',
              borderBottom: '1px solid ' + (activeTab === key ? '#D6BA8A' : 'transparent'),
              marginBottom: '-1px', transition: 'all 0.15s'
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 48px' }}>

        {/* BRIEFING */}
        {activeTab === 'briefing' && (
          <div>
            {responses.length === 0 && (
              <div style={{ background: '#111', border: '1px solid rgba(255,255,255,.06)', borderRadius: '8px', padding: '14px 18px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#444' }}>Aguardando respostas do cliente.</p>
                {form && (
                  <button onClick={copyFormLink} style={{ background: 'none', border: 'none', color: '#D6BA8A', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>
                    Copiar link →
                  </button>
                )}
              </div>
            )}
            {blocks.map((block, bi) => (
              <div key={bi} style={{ marginBottom: '48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '600', color: '#333', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{block.title}</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,.04)' }} />
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {block.questions.map((q) => {
                    const answer = lastResponse?.answers?.[q.id]
                    return (
                      <div key={q.id} style={{ background: '#111', border: '1px solid ' + (answer ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.03)'), borderRadius: '8px', padding: '18px 20px' }}>
                        <p style={{ fontSize: '12px', color: '#555', margin: '0 0 8px 0', lineHeight: '1.5' }}>{q.text}</p>
                        <p style={{ fontSize: '14px', color: answer ? '#e8e8e8' : '#2a2a2a', margin: 0, lineHeight: '1.7', fontStyle: answer ? 'normal' : 'italic' }}>
                          {answer || 'Sem resposta ainda'}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ARQUIVOS */}
        {activeTab === 'arquivos' && (
          <div>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#111', border: '1px dashed rgba(255,255,255,.08)', borderRadius: '8px', padding: '24px', cursor: 'pointer', marginBottom: '16px', color: '#444', fontSize: '13px', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(214,186,138,.3)'; e.currentTarget.style.color = '#D6BA8A' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'; e.currentTarget.style.color = '#444' }}
            >
              <Upload size={15} />
              {uploading ? 'Enviando...' : 'Enviar arquivo'}
              <input type="file" style={{ display: 'none' }} onChange={handleUpload} accept="image/*,audio/*,video/*,.pdf" />
            </label>
            {files.length === 0 ? (
              <p style={{ color: '#2a2a2a', textAlign: 'center', padding: '40px 0', fontSize: '13px' }}>Nenhum arquivo ainda.</p>
            ) : (
              <div style={{ display: 'grid', gap: '1px', background: 'rgba(255,255,255,.04)', borderRadius: '8px', overflow: 'hidden' }}>
                {files.map(file => (
                  <div key={file.id} style={{ background: '#111', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#161616'}
                    onMouseLeave={e => e.currentTarget.style.background = '#111'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '16px' }}>{file.category === 'imagem' ? '🖼' : file.category === 'audio' ? '🎙' : file.category === 'video' ? '🎬' : '📄'}</span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#e8e8e8' }}>{file.name}</div>
                        <div style={{ fontSize: '11px', color: '#333', marginTop: '1px', textTransform: 'capitalize' }}>{file.category}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <a href={file.url} target="_blank" rel="noreferrer" style={{ color: '#D6BA8A', fontSize: '12px', textDecoration: 'none', fontWeight: '500' }}>Abrir</a>
                      <button onClick={() => deleteFile(file.id, file.url)} style={{ background: 'none', border: 'none', color: '#2a2a2a', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#e05555'}
                        onMouseLeave={e => e.currentTarget.style.color = '#2a2a2a'}
                      ><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MÉTRICAS */}
        {activeTab === 'metricas' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
              {metrics.map(m => (
                <div key={m.id} style={{ background: '#111', border: '1px solid rgba(255,255,255,.06)', borderRadius: '8px', padding: '20px', position: 'relative' }}>
                  <button onClick={() => deleteMetric(m.id)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#222', cursor: 'pointer', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#e05555'}
                    onMouseLeave={e => e.currentTarget.style.color = '#222'}
                  ><Trash2 size={12} /></button>
                  <p style={{ fontSize: '10px', color: '#333', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>{m.title}</p>
                  <p style={{ fontSize: '32px', fontWeight: '700', color: '#D6BA8A', margin: 0, letterSpacing: '-1px' }}>{m.value || '—'}</p>
                  {m.goal && <p style={{ fontSize: '11px', color: '#333', margin: '6px 0 0 0' }}>Meta: {m.goal}</p>}
                </div>
              ))}
              {addingMetric ? (
                <div style={{ background: '#111', border: '1px solid rgba(214,186,138,.2)', borderRadius: '8px', padding: '16px', display: 'grid', gap: '8px' }}>
                  <input style={inputStyle} placeholder="Nome da métrica" value={newMetric.title} onChange={e => setNewMetric({ ...newMetric, title: e.target.value })} autoFocus />
                  <input style={inputStyle} placeholder="Valor atual" value={newMetric.value} onChange={e => setNewMetric({ ...newMetric, value: e.target.value })} />
                  <input style={inputStyle} placeholder="Meta" value={newMetric.goal} onChange={e => setNewMetric({ ...newMetric, goal: e.target.value })} />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setAddingMetric(false)} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,.06)', color: '#444', borderRadius: '5px', padding: '7px', cursor: 'pointer', fontSize: '12px' }}>Cancelar</button>
                    <button onClick={saveMetric} style={{ flex: 1, background: '#D6BA8A', color: '#090909', border: 'none', borderRadius: '5px', padding: '7px', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}>Salvar</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingMetric(true)} style={{ background: '#111', border: '1px dashed rgba(255,255,255,.06)', borderRadius: '8px', padding: '20px', cursor: 'pointer', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(214,186,138,.2)'; e.currentTarget.style.color = '#D6BA8A' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.06)'; e.currentTarget.style.color = '#333' }}
                >
                  <Plus size={14} /> Nova métrica
                </button>
              )}
            </div>
          </div>
        )}

        {/* NOTAS PRIVADAS */}
        {activeTab === 'notas' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '13px', color: '#e8e8e8', margin: '0 0 4px 0', fontWeight: '500' }}>Notas Privadas</p>
                <p style={{ fontSize: '12px', color: '#333', margin: 0 }}>Visível apenas para a equipe Frame Visuals.</p>
              </div>
              <button onClick={saveNotes} disabled={savingNotes} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: notesSaved ? 'rgba(214,186,138,.1)' : '#D6BA8A', color: notesSaved ? '#D6BA8A' : '#090909', border: notesSaved ? '1px solid rgba(214,186,138,.3)' : 'none', borderRadius: '6px', padding: '7px 16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>
                {notesSaved ? <><Check size={12} /> Salvo</> : savingNotes ? 'Salvando...' : 'Salvar notas'}
              </button>
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Escreva suas anotações aqui — insights da reunião, próximos passos, observações estratégicas..."
              style={{ width: '100%', minHeight: '400px', background: '#111', border: '1px solid rgba(255,255,255,.06)', borderRadius: '8px', padding: '20px', color: '#e8e8e8', fontSize: '14px', boxSizing: 'border-box', outline: 'none', resize: 'vertical', fontFamily: "'Inter', sans-serif", lineHeight: '1.8', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = 'rgba(214,186,138,.3)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.06)'}
            />
          </div>
        )}
      </div>
    </div>
  )
}