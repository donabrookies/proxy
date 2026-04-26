import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey']
}));
app.options('*', cors());
app.use(express.json());

// ─── Configurações da Evolution API ─────────────────────────────────────────
const EVOLUTION_URL     = 'https://dedo-no-boga-production.up.railway.app';
const EVOLUTION_API_KEY = '429683C4C977415CAAFCCE10F7D57E11';
const EVOLUTION_INSTANCE = 'rola-pequena';
// ────────────────────────────────────────────────────────────────────────────

// Rota para envio de mensagem WhatsApp (instância dinâmica)
app.post('/api/send-whatsapp', async (req, res) => {
  const { number, message, instance } = req.body;
  const instanceName = instance || EVOLUTION_INSTANCE;

  if (!number || !message) {
    return res.status(400).json({ error: 'Número e mensagem são obrigatórios' });
  }

  try {
    console.log(`📱 Enviando mensagem para: ${number} via instância: ${instanceName}`);

    const response = await fetch(
      `${EVOLUTION_URL}/message/sendText/${instanceName}`,
      {
        method: 'POST',
        headers: {
          'apikey': EVOLUTION_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ number, text: message })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Evolution API Error: ${response.status} - ${JSON.stringify(data)}`);
    }

    console.log('✅ Mensagem enviada com sucesso');
    res.json({ success: true, data });

  } catch (error) {
    console.error('❌ Erro:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Proxy genérico para Evolution API (gerenciamento de instâncias)
app.use('/api/evolution', async (req, res) => {
  const evolutionPath = req.path;
  const url = `${EVOLUTION_URL}${evolutionPath}`;

  console.log(`🔄 Proxy: ${req.method} ${url}`);

  try {
    const options = {
      method: req.method,
      headers: {
        'apikey': EVOLUTION_API_KEY,
        'Content-Type': 'application/json'
      }
    };

    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, options);

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const text = await response.text();
      res.status(response.status).send(text);
    }

  } catch (error) {
    console.error(`❌ Erro no proxy Evolution (${evolutionPath}):`, error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy WhatsApp rodando em http://localhost:${PORT}`);
});