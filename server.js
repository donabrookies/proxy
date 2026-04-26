// server.js - Versão produção (CORS completo)
// Colocar na RAIZ do projeto (mesma pasta do package.json)

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(express.json());

// ─── Configurações da Evolution API (local via ngrok) ───────────────────────
const EVOLUTION_URL      = 'https://dedo-no-boga-production.up.railway.app';
const EVOLUTION_API_KEY  = '429683C4C977415CAAFCCE10F7D57E11';
const EVOLUTION_INSTANCE = 'rola-pequena';
// ────────────────────────────────────────────────────────────────────────────

app.post('/api/send-whatsapp', async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({ error: 'Número e mensagem são obrigatórios' });
  }

  try {
    console.log('📱 Enviando mensagem para:', number);
    console.log('📝 Mensagem:', message.substring(0, 100));

    const response = await fetch(
      `${EVOLUTION_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
      {
        method: 'POST',
        headers: {
          'apikey': EVOLUTION_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          number: number,
          text: message
        })
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

app.listen(PORT, () => {
  console.log(`✅ Proxy WhatsApp rodando em http://localhost:${PORT}`);
});