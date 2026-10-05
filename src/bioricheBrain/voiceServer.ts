import * as http from 'node:http';
import { AddressInfo } from 'node:net';
import OpenAI from 'openai';
import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime';
import { tool } from '@openai/agents';
import { z } from 'zod';
import type { TeamOrchestrator } from './teamOrchestrator';

const REALTIME_MODEL = 'gpt-realtime-2.1';
const DEFAULT_VOICE = 'marin';
const MAX_SDP_BYTES = 256 * 1024;

type ActiveCall = {
  callId: string;
  session: RealtimeSession;
};

function html(): string {
  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>BIORICHE BRAIN — Голос</title>
<style>
body{font-family:system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;background:#101412;color:#f3f6f4}
button{font-size:18px;padding:14px 20px;border:0;border-radius:12px;cursor:pointer;margin-right:8px}
#status{margin:18px 0;padding:12px;border-radius:10px;background:#1d2521}
#log{white-space:pre-wrap;background:#0a0d0b;padding:14px;border-radius:10px;min-height:120px}
</style>
</head>
<body>
<h1>BIORICHE BRAIN — голосовой режим</h1>
<div id="status">Нажмите «Начать разговор» и разрешите микрофон.</div>
<button id="start">Начать разговор</button>
<button id="stop" disabled>Остановить</button>
<div id="log"></div>
<script>
let pc=null, stream=null;
const status=document.getElementById('status');
const log=document.getElementById('log');
function say(s){status.textContent=s; log.textContent += s + "\\n";}
async function start(){
  try{
    say('Подключаю защищённый голосовой канал BIORICHE BRAIN…');
    pc=new RTCPeerConnection();
    const audio=document.createElement('audio'); audio.autoplay=true;
    pc.ontrack=e=>audio.srcObject=e.streams[0];
    stream=await navigator.mediaDevices.getUserMedia({audio:true});
    pc.addTrack(stream.getTracks()[0],stream);

    const offer=await pc.createOffer();
    await pc.setLocalDescription(offer);
    const answer=await fetch('/session',{
      method:'POST',
      headers:{'Content-Type':'application/sdp'},
      body:offer.sdp
    }).then(async r=>{const t=await r.text(); if(!r.ok) throw new Error(t); return t;});

    await pc.setRemoteDescription({type:'answer',sdp:answer});
    pc.onconnectionstatechange=()=>{
      if(pc.connectionState==='connected') say('Готово. Говорите. Команды выполняются через ORCHESTRATOR BIORICHE BRAIN.');
      if(['failed','disconnected'].includes(pc.connectionState)) say('Голосовой канал прерван.');
    };
    document.getElementById('start').disabled=true;
    document.getElementById('stop').disabled=false;
  }catch(e){say('Не удалось запустить голос: '+(e instanceof Error?e.message:String(e))); stop();}
}
function stop(){
  if(stream) stream.getTracks().forEach(t=>t.stop());
  if(pc) pc.close();
  pc=null; stream=null;
  document.getElementById('start').disabled=false;
  document.getElementById('stop').disabled=true;
  say('Голосовой сеанс остановлен.');
}
document.getElementById('start').onclick=start;
document.getElementById('stop').onclick=stop;
</script>
</body>
</html>`;
}

function parseCallId(location: string | null): string {
  if (!location) throw new Error('Realtime did not return a call location.');
  const url = new URL(location, 'https://api.openai.com');
  if (url.origin !== 'https://api.openai.com') throw new Error('Invalid Realtime call location.');
  const match = /^\/v1\/realtime\/calls\/(rtc_[A-Za-z0-9_-]+)$/.exec(url.pathname);
  if (!match?.[1]) throw new Error('Invalid Realtime call location.');
  return match[1];
}

async function readBody(req: http.IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const b = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += b.byteLength;
    if (size > MAX_SDP_BYTES) throw new Error('SDP offer is too large.');
    chunks.push(b);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export async function startBioricheVoiceServer(
  apiKey: string,
  orchestrator: TeamOrchestrator,
): Promise<{ url: string; close: () => Promise<void> }> {
  if (!apiKey) throw new Error('OPENAI_API_KEY is required for BIORICHE BRAIN voice mode.');

  const openai = new OpenAI({ apiKey, timeout: 15_000, maxRetries: 0 });
  const activeCalls = new Set<ActiveCall>();

  const delegateToOrchestrator = tool({
    name: 'delegate_to_bioriche_orchestrator',
    description: 'Передать содержательную команду пользователя локальному ORCHESTRATOR BIORICHE BRAIN. Используй для задач, планирования, анализа, R&D, продукта, маркетинга, разработки и других рабочих запросов.',
    parameters: z.object({ input: z.string().min(2).max(12000) }),
    async execute({ input }) {
      const result = await orchestrator.run(input.trim());
      return JSON.stringify({
        synthesis: result.synthesis,
        plan: result.plan,
        results: result.results.map(item => ({
          agent: item.agent,
          output: item.output,
          error: item.error,
        })),
      });
    },
  });

  const agent = new RealtimeAgent({
    name: 'BIORICHE BRAIN Voice',
    voice: DEFAULT_VOICE,
    instructions: [
      'Ты — голосовой интерфейс BIORICHE BRAIN.',
      'Отвечай на русском, естественно и кратко.',
      'Любую содержательную рабочую команду пользователя передавай через delegate_to_bioriche_orchestrator.',
      'Не выдумывай результаты. После выполнения инструмента кратко озвучь фактический итог.',
      'Не обещай внешние или необратимые действия без явного подтверждения пользователя.',
      'Если задача требует решения ORCHESTRATOR, не пытайся выполнять её самостоятельно.',
    ].join('\\n'),
    tools: [delegateToOrchestrator],
  });

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', 'http://127.0.0.1');

      if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
        res.writeHead(200, {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self' https://api.openai.com; media-src 'self' blob:; connect-src 'self' https://api.openai.com; script-src 'unsafe-inline'"});
        res.end(html());
        return;
      }

      if (req.method === 'POST' && url.pathname === '/session') {
        if ((req.headers['content-type'] ?? '').split(';',1)[0].trim() !== 'application/sdp') {
          res.writeHead(415, {'Content-Type':'text/plain; charset=utf-8'});
          res.end('Expected application/sdp');
          return;
        }
        const offerSdp = await readBody(req);
        if (!offerSdp.includes('m=audio')) {
          res.writeHead(400, {'Content-Type':'text/plain; charset=utf-8'});
          res.end('Audio media section required');
          return;
        }

        const form = new FormData();
        form.set('sdp', offerSdp);
        form.set('session', JSON.stringify({
          type: 'realtime',
          model: REALTIME_MODEL,
          audio: { output: { voice: DEFAULT_VOICE } },
        }));

        const response = await fetch('https://api.openai.com/v1/realtime/calls', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'OpenAI-Safety-Identifier': 'bioriche-local',
          },
          body: form,
          redirect: 'error',
        });
        if (!response.ok) {
          const body = await response.text();
          res.writeHead(response.status, {'Content-Type':'text/plain; charset=utf-8'});
          res.end(body);
          return;
        }

        const callId = parseCallId(response.headers.get('location'));
        const realtimeSession = new RealtimeSession(agent, {
          model: REALTIME_MODEL,
          transport: 'websocket',
          config: {
            audio: {
              input: {
                turnDetection: {
                  type: 'server_vad',
                  createResponse: true,
                  interruptResponse: true,
                },
              },
              output: { voice: DEFAULT_VOICE },
            },
          },
        });

        const active: ActiveCall = { callId, session: realtimeSession };
        activeCalls.add(active);
        realtimeSession.on('error', (event) => {
          console.error('BIORICHE BRAIN Realtime error:', event.error);
        });
        realtimeSession.transport.on('disconnected', () => {
          activeCalls.delete(active);
          void openai.realtime.calls.hangup(callId).catch(() => undefined);
        });

        try {
          await realtimeSession.connect({ apiKey, callId });
        } catch (error) {
          activeCalls.delete(active);
          await openai.realtime.calls.hangup(callId).catch(() => undefined);
          realtimeSession.close();
          throw error;
        }

        res.writeHead(200, {'Content-Type':'application/sdp','Cache-Control':'no-store'});
        res.end(await response.text());
        return;
      }

      res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'});
      res.end('Not found');
    } catch (error) {
      res.writeHead(500, {'Content-Type':'text/plain; charset=utf-8'});
      res.end(error instanceof Error ? error.message : String(error));
    }
  });

  await new Promise<void>((resolve,reject)=>{
    server.once('error',reject);
    server.listen(0,'127.0.0.1',()=>resolve());
  });

  return {
    url: `http://127.0.0.1:${(server.address() as AddressInfo).port}/`,
    close: async () => {
      for (const active of activeCalls) {
        active.session.close();
        await openai.realtime.calls.hangup(active.callId).catch(() => undefined);
      }
      activeCalls.clear();
      await new Promise<void>((resolve,reject)=>server.close(err=>err?reject(err):resolve()));
    },
  };
}
