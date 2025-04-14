# ⚙️ zapwise-worker

O `zapwise-worker` é o serviço responsável por processar análises com IA no ecossistema do Zapwise. Ele roda de forma desacoplada do app principal, utilizando filas para orquestrar análises assíncronas baseadas em mensagens recebidas via WhatsApp.

---

## 📌 Função

- Processa mensagens de conversas usando **OpenAI GPT-3.5**
- Classifica automaticamente o **status** e **substatus** de uma conversa
- Atualiza o banco de dados com o resultado
- Controla o tempo de análise com **debounce de 10 minutos**
- Expõe uma rota protegida para agendar ou forçar análises

---

## 🧱 Arquitetura

```
Zapwise App (Vercel)
      │
      └─ POST /analyze (chamado ao receber mensagem)
                │
                ▼
        🔃 zapwise-worker (NestJS)
            └── BullMQ
                  └── Redis (Upstash)

        └── GPT (OpenAI)
```

- **Fila de análise**: `analyze-conversation`
- **Delay padrão**: 10 minutos
- **Tentativas**: 3
- **Worker isolado**: pode ser escalado horizontalmente sem impactar o app

---

## 🧠 Classificação por IA

A IA classifica a conversa retornando:

```json
{
  "status": "pending",
  "substatus": "waiting_response_from_seller"
}
```

### Status possíveis:
- `active`
- `pending`
- `lost`
- `done`

### Substatus possíveis:
- `awaiting_payment`
- `negotiating`
- `waiting_response_from_seller`
- `follow_up_required`
- `inactive_7d`
- `ghosted`
- `delivered_and_satisfied`

---

## 🔐 Segurança

Todas as requisições para o worker são protegidas via header:

```http
x-zapwise-secret: zapwise-secure-token
```

Esse valor deve estar presente em `.env` como `WORKER_SECRET`.

---

## 🚀 Endpoints

### `POST /analyze`

Agendar uma análise para uma conversa:

```bash
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -H "x-zapwise-secret: zapwise-secure-token" \
  -d '{"conversation_id": "uuid"}'
```

#### Forçar análise imediata:

```bash
curl -X POST http://localhost:3000/analyze?immediate=true \
  -H "Content-Type: application/json" \
  -H "x-zapwise-secret: zapwise-secure-token" \
  -d '{"conversation_id": "uuid"}'
```

---

## 🧩 Tecnologias utilizadas

- **NestJS**
- **BullMQ** (com Redis via Upstash)
- **OpenAI (GPT-3.5)**
- **Prisma (PostgreSQL)**
- **dotenv** para segredos/envs

---

## 🖥️ Rodando localmente

1. Instale as dependências:

```bash
npm install
```

2. Configure o arquivo `.env`:

```env
WORKER_SECRET=zapwise-secure-token
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
REDIS_HOST=your-upstash-host
REDIS_PORT=6379
REDIS_PASSWORD=...
```

3. Inicie o worker:

```bash
npm run start:dev
```

---

## 💡 Comportamentos inteligentes

- **Debounce embutido**: análises não são reexecutadas constantemente
- **Fallback de análise manual**: caso necessário, o frontend pode forçar nova análise
- **Logs de execução**: sistema loga eventos da fila (`waiting`, `active`, `completed`, `error`, etc)

---

## 📦 Futuro

- Suporte a múltiplos modelos (GPT-4, Claude, etc)
- Classificação com base em emoções ou intenção
- Métricas de uso por conversa
- Integração com logs ou dashboards Bull Board

---

Feito com ☕ por Henrique • Zapwise