import * as http from 'node:http';
import { AddressInfo } from 'node:net';
import type { TeamOrchestrator } from './teamOrchestrator';

const REALTIME_MODEL = 'gpt-realtime-2.1';
const DEFAULT_VOICE = 'marin';

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
let pc=null, stream=null, dc=null, audio=null, busy=false;
const status=document.getElementById('status');
const log=document.getElementById('log');
function say(s){status.textContent=s; log.textContent += s + "\\n";}
function sendBrainResult(result){
  if(!dc || dc.readyState!=='open') return;
  dc.send(JSON.stringify({type:'conversation.item.create',item:{
    type:'message',role:'user',content:[{type:'input_text',text:
      'Результат выполнения BIORICHE BRAIN ORCHESTRATOR. Озвучь пользователю краткий итог на русском, не выдумывая ничего и явно обозначая незавершённые пункты:\\n'+result
    }]
  }}));
  dc.send(JSON.stringify({type:'response.create',response:{modalities:['text','audio']}}));
}
async function delegate(text){
  if(busy || !text || text.length<2) return;
  busy=true; say('ORCHESTRATOR выполняет задачу…');
  try{
    const r=await fetch('/orchestrate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:text})});
    const d=await r.json();
    if(!r.ok) throw new Error(d.error||'Ошибка ORCHESTRATOR');
    sendBrainResult(d.synthesis || d.result || 'Нет результата.');
    say('ORCHESTRATOR завершил обработку.');
  }catch(e){say('Ошибка BIORICHE BRAIN: '+e.message);}
  finally{busy=false;}
}
async function start(){
  try{
    say('Получаю защищённый временный ключ…');
    const token=await fetch('/token',{method:'POST'}).then(async r=>{
      const d=await r.json(); if(!r.ok) throw new Error(d.error||'Не удалось получить ключ'); return d.value;
    });
    pc=new RTCPeerConnection();
    audio=document.createElement('audio'); audio.autoplay=true;
    pc.ontrack=e=>audio.srcObject=e.streams[0];
    stream=await navigator.mediaDevices.getUserMedia({audio:true});
    pc.addTrack(stream.getTracks()[0],stream);
    dc=pc.createDataChannel('oai-events');
    dc.onopen=()=>say('Готово. Говорите. Команды передаются в ORCHESTRATOR BIORICHE BRAIN.');
    dc.onmessage=e=>{
      try{
        const ev=JSON.parse(e.data);
        if(ev.type==='conversation.item.input_audio_transcription.completed' && ev.transcript) {
          log.textContent+='Вы: '+ev.transcript+'\\n';
          void delegate(ev.transcript);
        }
        if(ev.type==='response.output_audio_transcript.delta' && ev.delta) log.textContent+=ev.delta;
        if(ev.type==='response.done') log.textContent+='\\n';
        if(ev.type==='error') say('Ошибка Realtime: '+(ev.error?.message||'unknown'));
      }catch{}
    };
    const offer=await pc.createOffer();
    await pc.setLocalDescription(offer);
    const sdp=await fetch('https://api.openai.com/v1/realtime/calls',{
      method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/sdp'},body:offer.sdp
    }).then(async r=>{const t=await r.text(); if(!r.ok) throw new Error(t); return t;});
    await pc.setRemoteDescription({type:'answer',sdp});
    document.getElementById('start').disabled=true;
    document.getElementById('stop').disabled=false;
  }catch(e){say('Не удалось запустить голос: '+e.message); stop();}
}
function stop(){
  if(dc) dc.close(); if(stream) stream.getTracks().forEach(t=>t.stop()); if(pc) pc.close();
  pc=null; dc=null; stream=null; busy=false;
  document.getElementById('start').disabled=false; document.getElementById('stop').disabled=true;
  say('Голосовой сеанс остановлен.');
}
document.getElementById('start').onclick=start;
document.getElementById('stop').onclick=stop;
</script>
</body>
</html>`;
}

export async function startBioricheVoiceServer(
  apiKey: string,
  orchestrator: TeamOrchestrator,
): Promise<{ url: string; close: () => Promise<void> }> {
  if (!apiKey) throw new Error('OPENAI_API_KEY is required for BIORICHE BRAIN voice mode.');

  const server = http.createServer(async (req, res) => {
    try {
      if (req.method === 'POST' && req.url === '/token') {
        const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session: {
              type: 'realtime',
              model: REALTIME_MODEL,
              audio: {
                input: { transcription: { model: 'gpt-4o-mini-transcribe', language: 'ru' } },
                output: { voice: DEFAULT_VOICE },
              },
              instructions: 'Ты — голосовой интерфейс BIORICHE BRAIN. Отвечай на русском, кратко и естественно. Любую содержательную команду пользователя передавай в локальный ORCHESTRATOR BIORICHE BRAIN. Не выполняй внешние опасные или необратимые действия без явного подтверждения пользователя.',
            },
          }),
        });
        const body = await response.text();
        res.writeHead(response.status, {'Content-Type':'application/json','Cache-Control':'no-store'});
        res.end(body); return;
      }

      if (req.method === 'POST' && req.url === '/orchestrate') {
        let raw = '';
        for await (const chunk of req) raw += chunk;
        const parsed = JSON.parse(raw) as { input?: unknown };
        if (typeof parsed.input !== 'string' || !parsed.input.trim()) {
          res.writeHead(400, {'Content-Type':'application/json'}); res.end(JSON.stringify({error:'input is required'})); return;
        }
        const result = await orchestrator.run(parsed.input.trim().slice(0, 12000));
        res.writeHead(200, {'Content-Type':'application/json','Cache-Control':'no-store'});
        res.end(JSON.stringify({synthesis: result.synthesis, plan: result.plan}));
        return;
      }

      if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
        res.writeHead(200, {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
        res.end(html()); return;
      }
      res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'}); res.end('Not found');
    } catch (error) {
      res.writeHead(500, {'Content-Type':'application/json'});
      res.end(JSON.stringify({error:error instanceof Error ? error.message : String(error)}));
    }
  });

  await new Promise<void>((resolve,reject)=>{
    server.once('error',reject);
    server.listen(0,'127.0.0.1',()=>resolve());
  });
  const address=server.address() as AddressInfo;
  return {
    url:`http://127.0.0.1:${address.port}/`,
    close:()=>new Promise<void>((resolve,reject)=>server.close(err=>err?reject(err):resolve())),
  };
}
