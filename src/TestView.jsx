import React,{useState,useEffect,useRef,useMemo,useLayoutEffect,memo} from 'react';
import {KW} from './engine.js';
import {cx,STORE_KEY,VIEWS,SIZES,DEFAULTS,loadStore,fmtDur,fmtDate,shortDate,testLabel,pct,useWidth,Tile,SpeedChart,TrendChart,BarChart,Keyboard,RecCard,Seg} from './shared.jsx';
function newEngine(t){
  return {text:t,typed:'',status:'idle',start:0,timer:0,limit:0,
    log:{hits:{},misses:{},conf:{},bad:{},cats:{},total:0,correct:0,backspaces:0},cp:[0],buckets:[],lastSec:0};
}

const Word=memo(function Word({w,t,caret,last,curRef}){
  const out=[];
  for(let i=0;i<w.length;i++){
    const cls=i<t.length?(t[i]===w[i]?'c':'x'):'u';
    out.push((<span key={i} className={cx(cls,caret===i&&'cur')} ref={caret===i?curRef:null}>{w[i]}</span>));
  }
  let sp=null;
  if(!last){const cls=t.length>w.length?(t[w.length]===' '?'c':'x'):'u';
    sp=(<span className={cx('sp',cls,caret===w.length&&'cur')} ref={caret===w.length?curRef:null}>{' '}</span>);}
  return (<><span className="w">{out}</span>{sp}</>);
});

export function TestView({store,setStore,session,setSession,retryText,clearRetry,onFinish}){
  const {cfg,settings,history}=store;
  const P=useRef();P.current={cfg,session,history};
  const H=useRef();H.current={onFinish,clearRetry};
  const [text,setText]=useState(()=>retryText||(session?session.make():KW.generate(cfg)));
  const [typed,setTyped]=useState('');
  const [status,setStatus]=useState('idle');
  const [elapsed,setElapsed]=useState(0);
  const [focused,setFocused]=useState(false);
  const E=useRef(null);if(E.current===null)E.current=newEngine(text);
  const inputRef=useRef(null),boxRef=useRef(null),curRef=useRef(null);
  const setCfg=p=>setStore(s=>({...s,cfg:{...s.cfg,...p}}));

  const reset=(keep)=>{
    clearInterval(E.current.timer);
    const t=keep?E.current.text:(P.current.session?P.current.session.make():KW.generate(P.current.cfg));
    E.current=newEngine(t);setText(t);setTyped('');setStatus('idle');setElapsed(0);
    setTimeout(()=>{if(inputRef.current)inputRef.current.focus();},0);
  };
  const finish=(ms)=>{
    const e=E.current;if(e.status!=='running')return;
    e.status='done';clearInterval(e.timer);
    const sec=Math.floor(ms/1000),c=KW.countCorrect(e.text,e.typed);
    for(let s=e.lastSec+1;s<=sec;s++)e.cp[s]=c;e.lastSec=Math.max(e.lastSec,sec);
    const res=KW.buildResult({text:e.text,typed:e.typed,ms:ms,log:e.log,cp:e.cp,buckets:e.buckets});
    const {cfg:cf,session:ss,history:hist}=P.current;
    const meta=ss?{mode:'words',duration:0,words:e.text.split(' ').length,difficulty:'-',type:'exercise',exercise:{id:ss.exId,name:ss.name}}
      :{mode:cf.mode,duration:cf.duration,words:cf.mode==='words'?cf.words:0,difficulty:cf.difficulty,type:cf.type,exercise:null};
    const prior=hist.filter(r=>!r.exercise);
    const bw=prior.reduce((m,r)=>Math.max(m,r.wpm),0),ba=prior.reduce((m,r)=>r.typedLen>=20?Math.max(m,r.acc):m,0);
    const pb=ss?{}:{first:prior.length===0,wpm:prior.length>0&&res.wpm>bw,acc:prior.length>0&&res.typedLen>=20&&res.acc>ba};
    const now=Date.now();
    const full={id:now+Math.floor(Math.random()*1000),ts:now,...meta,...res,pb:pb};
    setStore(s=>({...s,history:[full,...s.history].slice(0,200)}));
    setStatus('done');setElapsed(ms);
    H.current.onFinish(full.id,e.text);
  };
  const tick=()=>{
    const e=E.current;if(e.status!=='running')return;
    const ms=performance.now()-e.start,sec=Math.floor(ms/1000);
    if(sec>e.lastSec){const c=KW.countCorrect(e.text,e.typed);for(let s=e.lastSec+1;s<=sec;s++)e.cp[s]=c;e.lastSec=sec;}
    setElapsed(ms);
    if(e.limit>0&&ms>=e.limit)finish(e.limit);
  };
  const start=()=>{
    const e=E.current,{cfg:cf,session:ss}=P.current;
    e.status='running';e.start=performance.now();e.limit=(!ss&&cf.mode==='time')?cf.duration*1000:0;
    setStatus('running');e.timer=setInterval(tick,100);
  };
  const onChange=(ev)=>{
    const e=E.current;if(e.status==='done')return;
    let v=ev.target.value;if(v.length>e.text.length)v=v.slice(0,e.text.length);
    const prev=e.typed;
    if(e.status==='idle'){if(v.length===0)return;start();}
    const now=performance.now()-e.start;
    if(v.length>prev.length){for(let i=prev.length;i<v.length;i++)KW.record(e,i,v[i],now);}
    else if(v.length<prev.length)e.log.backspaces+=prev.length-v.length;
    e.typed=v;setTyped(v);
    if(e.limit>0&&v.length>e.text.length-150){e.text+=' '+KW.more(P.current.cfg);setText(e.text);}
    if(e.limit===0&&v.length>=e.text.length)finish(performance.now()-e.start);
  };

  useEffect(()=>{
    if(retryText)H.current.clearRetry();
    if(inputRef.current)inputRef.current.focus();
    return()=>clearInterval(E.current.timer);
  },[]);
  useEffect(()=>{
    const h=ev=>{if(ev.key==='Escape')reset(false);};
    window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h);
  });
  const cfgKey=[cfg.mode,cfg.duration,cfg.words,cfg.difficulty,cfg.type,session&&session.id].join('|');
  const first=useRef(true);
  useEffect(()=>{if(first.current){first.current=false;return;}reset(false);},[cfgKey]);

  const wordsArr=useMemo(()=>text.split(' '),[text]);
  useLayoutEffect(()=>{
    const el=curRef.current,box=boxRef.current;if(!el||!box)return;
    const lh=parseFloat(getComputedStyle(box).lineHeight)||40;
    box.scrollTop=Math.max(0,el.offsetTop-lh);
  },[typed,text]);

  const correct=KW.countCorrect(text,typed),incorrect=typed.length-correct;
  const log=E.current.log;
  const acc=log.total?log.correct/log.total*100:100;
  const running=status==='running';
  const wpm=status==='idle'?0:correct/5/(Math.max(elapsed,1000)/60000);
  const timed=status==='idle'?(!session&&cfg.mode==='time'):E.current.limit>0;
  const limit=status==='idle'?cfg.duration*1000:E.current.limit;
  const wordsTyped=typed.length?typed.trim().split(/\s+/).filter(Boolean).length:0;
  const totalWords=wordsArr.length;
  const hide=!settings.live&&running;
  const goal=settings.goalMin,todayMin=KW.dayMinutes(history)[KW.dayKey(Date.now())]||0;
  const streak=KW.streak(history,goal);

  let off=0;
  const nodes=wordsArr.map((w,wi)=>{
    const start=off;off+=w.length+1;const isLast=wi===wordsArr.length-1;
    const pos=typed.length-start;
    const caret=(pos>=0&&pos<w.length+(isLast?0:1))?pos:-1;
    return (<Word key={wi} w={w} t={typed.slice(start,start+w.length+1)} caret={caret} last={isLast} curRef={curRef}/>);
  });

  return (<>
    <div className="card">
      {session?(<div className="exbar"><div><div className="eyebrow">Exercise</div><h2>{session.name}</h2><p className="muted">{session.desc}</p></div>
          <button className="btn" onClick={()=>setSession(null)} disabled={running}>Exit exercise</button></div>)
      :(<div className="cfg">
        <div className="cfg-g"><span className="cfg-l">Time</span>
          <div className="seg" role="group" aria-label="Test duration">{[15,30,60,120].map(d=>(<button key={d} disabled={running} aria-pressed={cfg.mode==='time'&&cfg.duration===d} className={cfg.mode==='time'&&cfg.duration===d?'on':cfg.duration===d?'soft':''} onClick={()=>setCfg({mode:'time',duration:d})}>{d}s</button>))}</div></div>
        <div className="cfg-g"><span className="cfg-l">Words</span>
          <div className="seg" role="group" aria-label="Word count">{[10,25,50,100].map(d=>(<button key={d} disabled={running} aria-pressed={cfg.mode==='words'&&cfg.words===d} className={cfg.mode==='words'&&cfg.words===d?'on':cfg.words===d?'soft':''} onClick={()=>setCfg({mode:'words',words:d})}>{d}</button>))}</div></div>
        <div className="cfg-g"><span className="cfg-l">Difficulty</span>
          <Seg label="Difficulty" value={cfg.difficulty} disabled={running} onChange={v=>setCfg({difficulty:v})} options={[['easy','Easy'],['medium','Medium'],['hard','Hard']]}/></div>
        <div className="cfg-g"><span className="cfg-l">Exercise</span>
          <Seg label="Exercise type" value={cfg.type} disabled={running} onChange={v=>setCfg({type:v})} options={[['words','Words'],['sentences','Sentences'],['paragraphs','Paragraphs'],['numbers','Numbers'],['punctuation','Symbols']]}/></div>
      </div>)}
    </div>
    <div className="strip">
      <span>Today <b className="mono">{Math.floor(todayMin)}</b> / {goal} min</span>
      <div className="meter" title="Daily goal"><i style={{width:Math.min(100,todayMin/goal*100)+'%'}}></i></div>
      <span>{streak>0?streak+' day streak':'No streak yet'}</span>
    </div>
    <div className="live" aria-live="off">
      <Tile tone="big" label="WPM" value={hide?'•••':Math.round(wpm)}/>
      <Tile label="Accuracy" value={hide?'•••':Math.round(acc)+'%'}/>
      <Tile label={timed?'Time left':'Elapsed'} value={timed?Math.max(0,Math.ceil((limit-elapsed)/1000))+'s':fmtDur(elapsed)} sub={timed?'Elapsed '+fmtDur(elapsed):null}/>
      <Tile tone="good" label="Correct" value={correct} sub="characters"/>
      <Tile tone="bad" label="Incorrect" value={incorrect} sub="characters"/>
    </div>
    <div className={cx('typebox','caret-'+settings.caret,!focused&&status!=='done'&&'blurred')} onClick={()=>inputRef.current&&inputRef.current.focus()}>
      <div className="textwin" ref={boxRef}>{nodes}</div>
      <input ref={inputRef} id="typing-input" className="ghost-input" value={typed} onChange={onChange}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        onPaste={ev=>ev.preventDefault()} onCut={ev=>ev.preventDefault()} onDrop={ev=>ev.preventDefault()}
        onKeyDown={ev=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(ev.key)||((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==='a'))ev.preventDefault();}}
        onSelect={ev=>{const t=ev.target,l=t.value.length;if(t.selectionStart!==l||t.selectionEnd!==l)t.setSelectionRange(l,l);}}
        autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" aria-label="Typing input. Type the text shown above."/>
      {!focused&&status!=='done'?(<div className="hint">{status==='idle'?'Click here or just start typing':'Click to continue'}</div>):null}
    </div>
    <div className="row between">
      <div className="row">
        <button className="btn primary" onClick={()=>reset(false)}>Restart</button>
        <button className="btn" onClick={()=>reset(true)}>Same text again</button>
      </div>
      <div className="row muted" style={{gap:14}}>
        {timed?(<span className="mono">{Math.min(100,Math.round(elapsed/limit*100))}% of time used</span>):(<span className="mono">{Math.min(wordsTyped,totalWords)}/{totalWords} words</span>)}
        <span><kbd>Esc</kbd> restarts</span>
      </div>
    </div>
  </>);
}
