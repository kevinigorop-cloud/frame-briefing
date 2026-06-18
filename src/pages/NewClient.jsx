import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { ArrowLeft, ChevronRight } from 'lucide-react'

const CATEGORIES = [
  {
    key: 'marca_pessoal',
    label: 'Marca Pessoal',
    desc: 'Profissionais, especialistas e criadores que constroem autoridade em torno do próprio nome.',
    blocks: [
      {
        title: 'Identidade e História',
        questions: [
          { id: 'mp1', text: 'Me conta sua trajetória — o que você faz, como chegou até aqui e o que te move.', desc: 'Não precisa ser cronológico. Queremos a história real, não o currículo. O que te moveu até aqui.' },
          { id: 'mp2', text: 'Qual foi a sua maior virada — profissional ou pessoal?', desc: 'O momento de antes e depois que mudou o rumo. Pode ser uma crise, uma decisão, uma descoberta.' },
          { id: 'mp3', text: 'Quais são suas maiores forças? E suas maiores fraquezas profissionais?', desc: 'As fraquezas importam tanto quanto as forças. O que você esconde chega antes de você.' },
          { id: 'mp4', text: 'O que guia suas decisões? Pode ser fé, família, valores, um princípio.', desc: 'Não precisa parecer profissional. Pode ser uma frase simples, uma crença, um modo de ver o mundo.' },
          { id: 'mp5', text: 'Qual é o momento mais difícil que você já passou? E como você saiu dele?', desc: 'Existe um capítulo de superação na sua história?' },
        ]
      },
      {
        title: 'Objetivo e Posicionamento',
        questions: [
          { id: 'mp6', text: 'Qual é o objetivo principal: autoridade, audiência ou receita? E em quanto tempo?', desc: 'Pode ser os três — mas qual é a prioridade real agora?' },
          { id: 'mp7', text: 'Pelo que você quer ser lembrado daqui a 2 anos?', desc: 'Uma frase, uma área, uma sensação. O que você quer que fique na mente de quem te acompanha.' },
          { id: 'mp8', text: 'Quais são suas referências de marca pessoal que você admira?', desc: 'E o que você admira especificamente em cada um? Tom, formato, frequência, estética, posicionamento.' },
          { id: 'mp9', text: 'Se você pudesse escolher como os seus clientes te descrevem para um amigo, o que gostaria que dissessem?', desc: 'Não sobre o serviço. Sobre você como pessoa, como profissional.' },
        ]
      },
      {
        title: 'Público e Mercado',
        questions: [
          { id: 'mp10', text: 'Quem é seu público hoje e quem você quer atrair mais?', desc: 'Descreva comportamento, não só demografia. Como essa pessoa pensa, o que ela busca, onde ela está.' },
          { id: 'mp11', text: 'O que esse público deseja — declarado e não declarado?', desc: 'O que ele diz querer e o que ele realmente quer nas entrelinhas? Como ele quer ser visto pelo mundo?' },
          { id: 'mp12', text: 'Quem são seus concorrentes diretos? O que eles fazem bem e o que deixam de fazer?', desc: 'Quem mais seu público poderia contratar no seu lugar?' },
        ]
      },
      {
        title: 'Conteúdo e Execução',
        questions: [
          { id: 'mp13', text: 'Você tem disposição para aparecer em vídeo? Como se sente diante da câmera?', desc: 'Não existe resposta errada. Isso define os formatos prioritários da estratégia.' },
          { id: 'mp14', text: 'Qual foi o conteúdo que mais gerou reação — comentários, mensagens, novos clientes?', desc: 'O que você acha que funcionou nele? Tema, formato, momento, abordagem.' },
          { id: 'mp15', text: 'De 0 a 10, quanto tempo real você tem para dedicar ao conteúdo por semana? E o que te trava hoje?', desc: 'Falta de tempo, de ideia, de confiança, de equipamento — o que for real.' },
        ]
      }
    ]
  },
  {
    key: 'negocio_local',
    label: 'Negócio Local',
    desc: 'Empresas e estabelecimentos que vendem produto ou serviço e precisam de clientes, agenda cheia ou recorrência.',
    blocks: [
      {
        title: 'O Negócio',
        questions: [
          { id: 'nl1', text: 'O que você vende, como funciona o atendimento e qual serviço tem maior margem?', desc: 'Detalhe o processo: o cliente chega como, é atendido como, sai com o quê?' },
          { id: 'nl2', text: 'Qual é o objetivo principal agora: atrair clientes novos, fidelizar ou aumentar o ticket médio?', desc: 'Pode ser os três — mas qual é urgente agora?' },
          { id: 'nl3', text: 'Como os clientes chegam até você hoje — indicação, Instagram, Google, passagem pela rua?', desc: 'Tente estimar o percentual de cada origem se possível.' },
          { id: 'nl4', text: 'Você tem uma base de clientes ativa? Com que frequência eles voltam?', desc: 'Eles estão no WhatsApp? Existe alguma comunicação recorrente com eles hoje?' },
        ]
      },
      {
        title: 'Diferencial e Concorrência',
        questions: [
          { id: 'nl5', text: 'Por que alguém escolheria você e não o concorrente? O que só você faz, ou faz melhor?', desc: 'Não é sobre preço. Pode ser atendimento, processo, resultado, experiência, personalidade.' },
          { id: 'nl6', text: 'O que os concorrentes fazem bem que você reconhece? E o que eles deixam de fazer?', desc: 'Seja honesto. O espaço que os concorrentes ignoram é onde a estratégia entra.' },
          { id: 'nl7', text: 'Como você imagina a experiência completa do cliente — do primeiro contato até depois do serviço?', desc: 'O que acontece antes, durante e depois. Experiência é conteúdo.' },
        ]
      },
      {
        title: 'Cliente e Objeções',
        questions: [
          { id: 'nl8', text: 'Quem é o seu cliente típico? Descreva comportamento, rotina, o que ele valoriza.', desc: 'Pode ter mais de um perfil — se tiver, descreva os dois ou três principais.' },
          { id: 'nl9', text: 'Por que as pessoas deixam de comprar — qual é a principal objeção?', desc: 'Preço, desconfiança, não conhecer o serviço, não entender o valor?' },
          { id: 'nl10', text: 'Você já teve algum cliente que veio de outro lugar e explicou por que trocou? O que ele disse?', desc: 'Essas histórias reais valem mais do que qualquer pesquisa de mercado.' },
        ]
      },
      {
        title: 'Conteúdo e Execução',
        questions: [
          { id: 'nl11', text: 'Quais bastidores do seu trabalho podem ser mostrados?', desc: 'O que acontece antes, durante e depois do serviço que seria interessante pra quem está de fora.' },
          { id: 'nl12', text: 'Você tem provas de resultado — fotos, depoimentos, antes e depois?', desc: 'Se sim, quantas e em que formato. Se não, o que impede de ter.' },
          { id: 'nl13', text: 'De 0 a 10, quanto tempo tem para dedicar ao conteúdo? E o que te trava hoje?', desc: 'Falta de tempo, de ideia, de equipamento, de confiança na câmera.' },
        ]
      }
    ]
  },
  {
    key: 'marca_negocio',
    label: 'Marca Pessoal + Negócio',
    desc: 'Quem é a face do próprio negócio e precisa de dois perfis com papéis distintos.',
    blocks: [
      {
        title: 'Quem é a Pessoa',
        questions: [
          { id: 'mn1', text: 'Me conta sua história — como você chegou até onde está hoje?', desc: 'Trajetória real, pontos de virada, o que te move. Não o currículo — a história.' },
          { id: 'mn2', text: 'Qual foi o momento mais difícil que você já passou — profissionalmente ou pessoalmente?', desc: 'E como você saiu dele? Existe um "antes" e um "depois" na sua trajetória?' },
          { id: 'mn3', text: 'O que guia suas decisões — fé, família, um princípio, uma visão de mundo?', desc: 'Pode ser uma frase simples. O que for genuinamente seu.' },
          { id: 'mn4', text: 'Quais são suas maiores forças profissionais? E as fraquezas que mais te incomodam?', desc: 'Seja honesto nas duas. As fraquezas são tão importantes quanto as forças aqui.' },
          { id: 'mn5', text: 'Como você quer que os clientes te descrevam para um amigo — sobre você, não sobre o serviço?', desc: 'Uma frase, uma percepção, uma sensação.' },
          { id: 'mn6', text: 'Qual é a sua relação com família, fé ou outros elementos pessoais? Eles entram no conteúdo?', desc: 'Isso define o quanto de vida pessoal vai aparecer — e como.' },
        ]
      },
      {
        title: 'O Negócio',
        questions: [
          { id: 'mn7', text: 'O que você vende, como funciona e qual é o serviço prioritário agora?', desc: 'Detalhe o processo completo: como o cliente chega, como é atendido, o que leva.' },
          { id: 'mn8', text: 'Como você imagina a experiência dentro do negócio — o que o cliente vai sentir do início ao fim?', desc: 'Ambiente, música, conversa, tempo de espera. O que torna diferente de qualquer concorrente?' },
          { id: 'mn9', text: 'Qual é a meta para os próximos 6 meses — em clientes, agenda ou faturamento?', desc: 'Pode ser número de clientes fixos, agenda cheia em quantos dias, faturamento mensal.' },
          { id: 'mn10', text: 'O negócio vai crescer com equipe ou vai continuar sendo você sozinho?', desc: 'Isso muda completamente a estratégia dos dois perfis no médio prazo.' },
          { id: 'mn11', text: 'Além do serviço principal, existe algo que os clientes pedem e você ainda não oferece?', desc: 'Pode ser um pacote, um serviço complementar, uma frequência diferente.' },
        ]
      },
      {
        title: 'Mercado e Concorrência',
        questions: [
          { id: 'mn12', text: 'Quem são seus concorrentes? O que eles fazem bem e o que deixam de fazer?', desc: 'Descreva a experiência: atendimento, ambiente, resultado, comunicação digital.' },
          { id: 'mn13', text: 'Você já teve algum cliente que veio de outro lugar e explicou por que trocou? O que ele disse?', desc: 'O motivo real de troca revela o gatilho de decisão.' },
          { id: 'mn14', text: 'Quem é o seu cliente típico — e existe mais de um perfil de público que você quer atingir?', desc: 'Descreva comportamento, rotina, o que valoriza.' },
        ]
      },
      {
        title: 'Conteúdo e Referências',
        questions: [
          { id: 'mn15', text: 'Quais são suas referências de conteúdo — perfis que você admira? O que admira especificamente?', desc: 'Tom, formato, frequência, estética, posicionamento — seja específico.' },
          { id: 'mn16', text: 'Qual foi o conteúdo que mais gerou reação — comentários, mensagens, agendamentos?', desc: 'O que você acha que funcionou nele?' },
          { id: 'mn17', text: 'Na sua rotina de trabalho, o que acontece antes, durante e depois do serviço que ainda não foi mostrado?', desc: 'O que parece óbvio pra você mas seria interessante pra quem está de fora.' },
          { id: 'mn18', text: 'Você tem alguém de confiança que pode ajudar com fotos e vídeos? Qual é o equipamento disponível?', desc: 'Celular, câmera, ring light, suporte — o que tiver.' },
          { id: 'mn19', text: 'De 0 a 10, quanto tempo real tem para conteúdo? E o que te trava — tempo, ideia ou confiança?', desc: 'Estratégia que não cabe na vida real não serve.' },
          { id: 'mn20', text: 'Daqui a 1 ano com o negócio funcionando, o que você quer que as pessoas falem sobre você?', desc: 'Pode ser uma frase, uma palavra, uma sensação. O que você quer que fique.' },
        ]
      }
    ]
  },
  {
    key: 'audiovisual',
    label: 'Audiovisual',
    desc: 'Produtoras, diretores, editores e criadores cujo produto principal é vídeo.',
    blocks: [
      {
        title: 'O Serviço e o Diferencial',
        questions: [
          { id: 'av1', text: 'O que exatamente você produz — vídeo social, institucional, Reels, documentário, edição, direção?', desc: 'Seja específico. Cada formato tem um cliente ideal e uma estratégia de posicionamento diferente.' },
          { id: 'av2', text: 'Qual é o seu diferencial técnico e estético — o que torna o seu trabalho reconhecível?', desc: 'Paleta de cores, ritmo de edição, tipo de narrativa, uso de som, enquadramento.' },
          { id: 'av3', text: 'Você tem um nicho de mercado preferido — gastronomia, moda, corporativo, música, cultura?', desc: 'Ou trabalha com qualquer nicho? Qual você mais gosta e qual te gera mais resultado?' },
        ]
      },
      {
        title: 'Público e Objetivo',
        questions: [
          { id: 'av4', text: 'Quem é seu cliente ideal — criadores, marcas locais, agências, artistas, empresas?', desc: 'Descreva o perfil de quem te contrata hoje e de quem você quer atrair mais.' },
          { id: 'av5', text: 'Qual é o objetivo principal: atrair clientes, construir portfólio, gerar autoridade ou ampliar alcance?', desc: 'Pode ser os quatro — mas qual é urgente agora?' },
          { id: 'av6', text: 'Como os clientes chegam até você hoje — indicação, Instagram, LinkedIn, busca direta?', desc: 'Tente estimar a origem de cada cliente nos últimos 6 meses.' },
        ]
      },
      {
        title: 'Concorrência e Mercado',
        questions: [
          { id: 'av7', text: 'Quem são suas referências no mercado audiovisual que você admira?', desc: 'E o que você admira especificamente? Portfólio, posicionamento, forma de comunicar.' },
          { id: 'av8', text: 'O que os seus concorrentes fazem bem e o que deixam de fazer no mercado audiovisual?', desc: 'Comunicação, portfólio apresentado, atendimento, especialização.' },
        ]
      },
      {
        title: 'Conteúdo e Processo',
        questions: [
          { id: 'av9', text: 'Você quer aparecer no próprio conteúdo ou prefere que o trabalho apareça sem você?', desc: 'Não existe resposta errada — mas a resposta muda completamente o tipo de conteúdo.' },
          { id: 'av10', text: 'Quais bastidores do processo podem ser mostrados — reunião, gravação, edição, entrega?', desc: 'O que acontece nos bastidores que as pessoas não veem e que seria interessante mostrar.' },
          { id: 'av11', text: 'Você tem trabalhos anteriores que podem ser usados como portfólio e prova de resultado?', desc: 'Quantos, em quais nichos. Existe algum trabalho que você considera o melhor da sua trajetória?' },
          { id: 'av12', text: 'De 0 a 10, quanto tempo tem para dedicar ao próprio conteúdo — separado do trabalho dos clientes?', desc: 'E o que te trava — tempo, energia, falta de ideia, ou a sensação de que "filho de ferreiro tem faca de pau"?' },
        ]
      }
    ]
  }
]

export default function NewClient() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [clientData, setClientData] = useState({ name: '', email: '', phone: '' })
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)
    const allQuestions = selectedCategory.blocks.flatMap(b => b.questions)
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({ ...clientData, project_type: selectedCategory.key })
      .select()
      .single()
    if (clientError) { alert('Erro ao salvar cliente'); setLoading(false); return }
    await supabase.from('forms').insert({
      client_id: client.id,
      title: `Briefing — ${client.name}`,
      questions: allQuestions,
      template: selectedCategory.key
    })
    navigate(`/cliente/${client.id}`)
  }

  const inputStyle = {
    width: '100%', background: '#111', border: '1px solid #1a1a1a', borderRadius: '8px',
    padding: '13px 16px', color: '#f0f0f0', fontSize: '15px', boxSizing: 'border-box',
    outline: 'none', fontFamily: 'Inter, sans-serif'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f0f0f0', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ borderBottom: '1px solid #1a1a1a', padding: '20px 40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => step === 1 ? navigate('/') : setStep(step - 1)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {[1, 2].map(s => (
            <div key={s} style={{ width: s === step ? '24px' : '8px', height: '8px', borderRadius: '4px', background: s === step ? '#c9b99a' : s < step ? '#444' : '#1a1a1a', transition: 'all 0.3s' }} />
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '48px 24px' }}>

        {step === 1 && (
          <div>
            <p style={{ fontSize: '11px', color: '#555', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Passo 1 de 2</p>
            <h2 style={{ fontSize: '26px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '8px' }}>Dados do cliente</h2>
            <p style={{ color: '#555', marginBottom: '36px', fontSize: '15px' }}>Informações básicas para identificar o projeto.</p>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Nome completo *</label>
                <input style={inputStyle} value={clientData.name} onChange={e => setClientData({ ...clientData, name: e.target.value })} placeholder="Ex: Thales Mendonça" onFocus={e => e.target.style.borderColor = '#c9b99a'} onBlur={e => e.target.style.borderColor = '#1a1a1a'} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>E-mail</label>
                <input style={inputStyle} value={clientData.email} onChange={e => setClientData({ ...clientData, email: e.target.value })} placeholder="email@exemplo.com" onFocus={e => e.target.style.borderColor = '#c9b99a'} onBlur={e => e.target.style.borderColor = '#1a1a1a'} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>WhatsApp</label>
                <input style={inputStyle} value={clientData.phone} onChange={e => setClientData({ ...clientData, phone: e.target.value })} placeholder="(31) 99999-9999" onFocus={e => e.target.style.borderColor = '#c9b99a'} onBlur={e => e.target.style.borderColor = '#1a1a1a'} />
              </div>
            </div>
            <button onClick={() => setStep(2)} disabled={!clientData.name} style={{ marginTop: '32px', width: '100%', background: clientData.name ? '#c9b99a' : '#1a1a1a', color: clientData.name ? '#0a0a0a' : '#444', border: 'none', borderRadius: '8px', padding: '14px', fontWeight: '700', fontSize: '15px', cursor: clientData.name ? 'pointer' : 'not-allowed' }}>
              Continuar →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <p style={{ fontSize: '11px', color: '#555', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Passo 2 de 2</p>
            <h2 style={{ fontSize: '26px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '8px' }}>Tipo de projeto</h2>
            <p style={{ color: '#555', marginBottom: '36px', fontSize: '15px' }}>Escolha a categoria que melhor descreve o projeto de {clientData.name}.</p>
            <div style={{ display: 'grid', gap: '10px', marginBottom: '32px' }}>
              {CATEGORIES.map(cat => (
                <div key={cat.key} onClick={() => setSelectedCategory(cat)} style={{ background: '#111', border: `1px solid ${selectedCategory?.key === cat.key ? '#c9b99a' : '#1a1a1a'}`, borderRadius: '10px', padding: '20px', cursor: 'pointer', transition: 'border-color 0.15s' }}>
                  <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px', color: selectedCategory?.key === cat.key ? '#c9b99a' : '#f0f0f0' }}>{cat.label}</div>
                  <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.5' }}>{cat.desc}</div>
                  {selectedCategory?.key === cat.key && (
                    <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
                      {cat.blocks.reduce((acc, b) => acc + b.questions.length, 0)} perguntas em {cat.blocks.length} blocos
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={handleSave} disabled={!selectedCategory || loading} style={{ width: '100%', background: selectedCategory ? '#c9b99a' : '#1a1a1a', color: selectedCategory ? '#0a0a0a' : '#444', border: 'none', borderRadius: '8px', padding: '14px', fontWeight: '700', fontSize: '15px', cursor: selectedCategory ? 'pointer' : 'not-allowed' }}>
              {loading ? 'Criando projeto...' : 'Criar projeto →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}