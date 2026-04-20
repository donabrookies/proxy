// server.js - Colocar na RAIZ do projeto (mesma pasta do package.json)
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

const TALK_API_URL = 'https://talkapi.ingaja.com.br/api/messages/send';
const TALK_API_TOKEN = 'xO6iMSrK0uecIJ2uh4TqJFZcuTo9th';

app.post('/api/send-whatsapp', async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({ error: 'Número e mensagem são obrigatórios' });
  }

  try {
    console.log('📱 Enviando mensagem para:', number);
    console.log('📝 Mensagem:', message.substring(0, 100));

    const response = await fetch(TALK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TALK_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        number: number,
        body: message,
        userId: "",
        queueId: ""
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`TalkAPI Error: ${response.status} - ${JSON.stringify(data)}`);
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