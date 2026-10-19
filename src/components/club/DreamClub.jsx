import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { OfficialPip } from '../OfficialArt';
import DreamCatcher from './DreamCatcher';
import './DreamClub.css';

const PipSculpture = lazy(() => import('./PipSculpture'));
const read = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    if (key === 'pip_chat_v1') return Array.isArray(value) ? value.filter(m => m && ['pip','you'].includes(m.who) && typeof m.text === 'string').map(m=>({...m,text:m.text.slice(0,600)})) : fallback;
    if (key === 'pip_visitor_v1') return value && typeof value.name === 'string' && Number.isFinite(value.visits) ? {name:value.name.slice(0,30),visits:Math.max(0,value.visits)} : fallback;
    return value ?? fallback;
  } catch { return fallback; }
};
const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };
const reply = (text, name) => {
  const t = text.toLowerCase(), friend = name || 'dreamer';
  if (/hello|hi\b|hey|name/.test(t)) return `Hello, ${friend}! I’m Pip. Junior Dream Engineer, senior bedtime avoider. Shall we make something sleepy?`;
  if (/sad|scared|worr|lonely|bad day/.test(t)) return 'You can sit on my cloud for a little while. We don’t have to fix everything tonight. Let’s find one warm little light.';
  if (/sleep|bed|tired|night/.test(t)) return 'My professional advice: one soft light, one slow breath, and absolutely no counting CSS columns. Shall we try the Moonlight Lab?';
  if (/star|music|song|sing/.test(t)) return 'The first star is shy. The second likes to hum. The third thinks it’s the entire orchestra. Collect all three and listen!';
  if (/train|deliver|dream/.test(t)) return 'A dream for the cottage, a giggle for the ghosts, a moonbeam for the lighthouse. The Dream Express has room for yours, too.';
  if (/joke|funny/.test(t)) return 'Why did the moon learn to code? It wanted to fix its eclipse! …The stars told me that one. I accept no responsibility.';
  if (/thank|love|friend/.test(t)) return `That goes straight in my pocket of good things, ${friend}. There’s always a little room for you here.`;
  if (/bye|leave/.test(t)) return `Goodnight, ${friend}. I’ll keep one tiny star awake for your next visit.`;
  return 'Hmm. That sounds like a very big thought for a very small skull. Tell me about dreams, stars, bedtime, or how you’re feeling. I know a joke, too.';
};

function Guestbook({ name }) {
  const [wishes, setWishes] = useState([]), [message, setMessage] = useState(''), [author, setAuthor] = useState(name || '');
  const [state, setState] = useState('loading'), [notice, setNotice] = useState('Opening the wish wall…');
  const refresh = async (signal) => { const response = await fetch('/api/wishes', { signal }); if (!response.ok) throw new Error(); const data = await response.json(); setWishes(data.wishes); };
  useEffect(() => { setAuthor(name || ''); }, [name]);
  useEffect(() => {
    const abort = new AbortController();
    refresh(abort.signal).then(()=>{setState('ready');setNotice('Connected · wishes arrive live');}).catch(e=>{if(e.name!=='AbortError'){setState('offline');setNotice('The wish wall is resting. Your draft stays here; try again shortly.');}});
    const events = new EventSource('/api/wishes/events');
    events.onmessage = () => refresh(abort.signal).then(()=>{setState(s=>s==='sending'?s:'ready');setNotice('Connected · wishes arrive live');}).catch(()=>{});
    events.onerror = () => {setState(s=>s==='sending'?s:'offline');setNotice('Reconnecting to the wish wall…');};
    return()=>{abort.abort();events.close();};
  }, []);
  const submit = async e => {
    e.preventDefault(); setState('sending');setNotice('Tucking your wish into the night…');
    try { const response = await fetch('/api/wishes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:author,message})});const data=await response.json();if(!response.ok)throw new Error(data.error);setWishes(old=>[data.wish,...old.filter(w=>w.id!==data.wish.id)].slice(0,100));setMessage('');setState('ready');setNotice('Your wish is on the wall. Someone else can see it now.'); }
    catch(error){setState('offline');setNotice(error.message==='Failed to fetch'?'Couldn’t send your wish. Your draft is safe; please retry.':error.message||'Please try again.');}
  };
  return <section className="club-wishes" aria-labelledby="wish-title">
    <div className="club-wish-heading"><span className="club-kicker">THE NIGHT SHIFT GUESTBOOK</span><h3 id="wish-title">Leave a little light on.</h3><p>One wish for the next dreamer. Shared with everyone who stops by.</p></div>
    <form onSubmit={submit} className="club-wish-form"><label>Your name<input name="wish-name" value={author} onChange={e=>setAuthor(e.target.value)} maxLength={30} required placeholder="A sleepy dreamer" autoComplete="nickname"/></label><label>A wish for the world<textarea name="wish-message" value={message} onChange={e=>setMessage(e.target.value)} maxLength={240} minLength={3} required rows={3} placeholder="I hope tomorrow brings…"/></label><div className="club-form-bottom"><span>{message.length}/240 · public</span><button disabled={state==='sending'}>{state==='sending'?'Sending…':'Pin my wish ↗'}</button></div><p className="club-connection" role="status">{notice}</p></form>
    <div className="club-wish-wall" aria-label="Shared wishes" aria-live="polite">{wishes.length?wishes.slice(0,6).map(w=><article className="club-wish" key={w.id}><span aria-hidden="true">✦</span><p>{w.message}</p><footer>{w.name} <time dateTime={w.createdAt}>{new Date(w.createdAt).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</time></footer></article>):<p className="club-empty">{state==='loading'?'Looking for little lights…':'The first little light could be yours.'}</p>}</div>
  </section>;
}

export default function DreamClub({ soundEnabled }) {
  const [visitor, setVisitor] = useState(()=>read('pip_visitor_v1',{name:'',visits:0}));
  const [name, setName] = useState(visitor.name), [opened, setOpened] = useState(false), [tab, setTab] = useState('hello');
  const [messages, setMessages] = useState(()=>read('pip_chat_v1',[]).slice(-12));
  const [draft, setDraft] = useState(''), [memoryNotice,setMemoryNotice]=useState(''), [showGuestbook,setShowGuestbook]=useState(false);
  const section=useRef(null), chat=useRef(null);
  useEffect(()=>{const key='pip_visit_counted';let counted=false;try{counted=sessionStorage.getItem(key);sessionStorage.setItem(key,'1');}catch{}if(!counted){const next={...visitor,visits:visitor.visits+1};save('pip_visitor_v1',next);setVisitor(next);}},[]);
  useEffect(()=>{const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setShowGuestbook(true);obs.disconnect();}},{rootMargin:'250px'});obs.observe(section.current);return()=>obs.disconnect();},[]);
  const speak = text => { const next=[...messages,{who:'you',text},{who:'pip',text:reply(text,visitor.name)}].slice(-12);setMessages(next);save('pip_chat_v1',next);setDraft(''); };
  useEffect(()=>{if(chat.current)chat.current.scrollTop=chat.current.scrollHeight;},[messages,tab]);
  const remember = e => {e.preventDefault();if(!name.trim()){setMemoryNotice('Pip needs a little name to remember.');return;}const next={...visitor,name:name.trim()};setVisitor(next);save('pip_visitor_v1',next);setMemoryNotice(`Saved. I’ll remember you as ${next.name}.`);};
  const forget=()=>{const next={name:'',visits:1};save('pip_visitor_v1',next);save('pip_chat_v1',[]);setVisitor(next);setName('');setMessages([]);setMemoryNotice('Your name and our conversation have been forgotten on this device.');};
  return <section className="dream-club" id="after-hours" ref={section} aria-labelledby="club-title">
    <header className="club-header"><span className="club-kicker">AFTER HOURS · YOU’RE PART OF THE STORY</span><h2 id="club-title">A little company<br/><span>for the night shift.</span></h2><p>{visitor.name?`Welcome ${visitor.visits>1?'back, ':''}${visitor.name}. I saved you a spot on the cloud.`:'Pip built all this for someone to play with. That someone is you.'}</p></header>
    <div className="club-meet">
      <div className="club-model"><span className="club-model-label">PIP’S LITTLE SCULPTURE · 360°</span>{opened?<Suspense fallback={<div className="club-model-loading" role="status">Pip is putting on his nightcap…</div>}><PipSculpture/></Suspense>:<div className="club-model-invite"><OfficialPip/><button onClick={()=>setOpened(true)}>Meet Pip in 3D ↗</button><p>Turn him around. Wave hello. Stay a while.</p></div>}</div>
      <div className="club-notebook"><div className="club-tabs" role="tablist" aria-label="Pip’s notebook">{[['hello','A proper hello'],['chat','Talk to Pip']].map(([id,label],i)=><button key={id} id={`club-tab-${id}`} role="tab" aria-selected={tab===id} aria-controls={`club-panel-${id}`} tabIndex={tab===id?0:-1} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?'hello':e.key==='End'?'chat':i?'hello':'chat';setTab(next);document.getElementById(`club-tab-${next}`)?.focus();}}} onClick={()=>setTab(id)}>{label}</button>)}</div>
        {tab==='hello'?<div className="club-hello" id="club-panel-hello" role="tabpanel" aria-labelledby="club-tab-hello"><span aria-hidden="true" className="club-doodle">☾</span><h3>“What should I<br/>call you, dreamer?”</h3><p>A name for our little adventures. Pip remembers it on this device.</p><form onSubmit={remember}><label htmlFor="visitor-name">Your nickname</label><div className="club-name-row"><input id="visitor-name" value={name} onChange={e=>setName(e.target.value)} maxLength={30} required autoComplete="nickname" placeholder="Your dreamer name"/><button>Remember me</button></div></form><p role="status">{memoryNotice}</p>{visitor.name&&<button className="club-text-button" onClick={forget}>Forget my name & chat</button>}</div>:<div className="club-chat" id="club-panel-chat" role="tabpanel" aria-labelledby="club-tab-chat"><p className="club-small">Pip’s pocket phrases · a playful, rule-based conversation.</p><div className="club-messages" role="log" aria-label="Conversation with Pip" ref={chat}>{messages.length?messages.map((m,i)=><p key={i} className={`club-message club-message-${m.who}`}><strong>{m.who==='pip'?'Pip':visitor.name||'You'}</strong>{m.text}</p>):<p className="club-message club-message-pip"><strong>Pip</strong>{reply('hello',visitor.name)}</p>}</div><div className="club-prompts">{['Tell me a joke','I feel worried','Tell me about stars'].map(t=><button key={t} onClick={()=>speak(t)}>{t}</button>)}</div><form className="club-chat-form" onSubmit={e=>{e.preventDefault();if(draft.trim())speak(draft.trim());}}><label className="sr-only" htmlFor="pip-message">Message to Pip</label><input id="pip-message" value={draft} onChange={e=>setDraft(e.target.value)} maxLength={240} placeholder="Whisper something to Pip…" required/><button aria-label="Send message to Pip">↗</button></form></div>}
      </div>
    </div>
    <DreamCatcher soundEnabled={soundEnabled}/>
    {showGuestbook&&<Guestbook name={visitor.name}/>}
  </section>;
}
