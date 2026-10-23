import React,{useState,useEffect,useRef,useMemo,useLayoutEffect,memo} from 'react';
import {KW} from './engine.js';
import {cx,STORE_KEY,VIEWS,SIZES,DEFAULTS,loadStore,fmtDur,fmtDate,shortDate,testLabel,pct,useWidth,Tile,SpeedChart,TrendChart,BarChart,Keyboard,RecCard,Seg} from './shared.jsx';
export function ProgressView({store,setStore,go,openReport}){
  const {history,settings}=store;
  const [showAll,setShowAll]=useState(false);
  const [confirm,setConfirm]=useState(false);
  const tests=history.filter(r=>!r.exercise);
  const goal=settings.goalMin;
  const dm=KW.dayMinutes(history);
  const todayMin=dm[KW.dayKey(Date.now())]||0;
  const streak=KW.streak(history,goal);
  const days=[];
  for(let i=13;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const key=KW.dayKey(d);
    days.push({key:key,min:dm[key]||0,short:d.toLocaleDateString(undefined,{weekday:'short'}).slice(0,w3(d)),label:d.toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'}),today:i===0});}
  function w3(){return 3;}
  const bestWpm=tests.length?Math.max(...tests.map(r=>r.wpm)):null;
  const accList=tests.filter(r=>r.typedLen>=20);
  const bestAcc=accList.length?Math.max(...accList.map(r=>r.acc)):null;
  const last10=tests.slice(0,10);
  const avgWpm=last10.length?last10.reduce((s,r)=>s+r.wpm,0)/last10.length:null;
  const avgAcc=last10.length?last10.reduce((s,r)=>s+r.acc,0)/last10.length:null;
  const bestBy=d=>{const l=tests.filter(r=>r.mode==='time'&&r.duration===d);return l.length?Math.max(...l.map(r=>r.wpm)):null;};
  const chron=(tests.length>=2?tests:history).slice(0,30).slice().reverse();
  const wpmPts=chron.map(r=>({y:r.wpm,label:shortDate(r.ts)}));
  const accPts=chron.map(r=>({y:r.acc,label:shortDate(r.ts)}));
  const agg=useMemo(()=>KW.aggregate(history.slice(0,30)),[history]);
  const wk=KW.weakKeys(agg).slice(0,6);
  const pr={};history.filter(r=>r.exercise).forEach(r=>{const g=pr[r.exercise.name]||(pr[r.exercise.name]={name:r.exercise.name,n:0,best:0,acc:0,last:0});g.n++;g.best=Math.max(g.best,r.wpm);g.acc+=r.acc;g.last=Math.max(g.last,r.ts);});
  const prl=Object.values(pr).sort((a,b)=>b.last-a.last);
  const rows=showAll?history:history.slice(0,10);
  if(!history.length)return (<div className="card empty"><h2>Nothing to track yet</h2><p className="muted">Results, personal bests and goals build up after your first test.</p><button className="btn primary" onClick={()=>go('test')}>Take a test</button></div>);
  return (<>
    <div className="live">
      <Tile tone="big" label="Best speed" value={bestWpm==null?'-':Math.round(bestWpm)} sub="WPM"/>
      <Tile label="Best accuracy" value={bestAcc==null?'-':bestAcc.toFixed(1)+'%'} sub="20+ characters"/>
      <Tile label="Recent speed" value={avgWpm==null?'-':avgWpm.toFixed(1)} sub="avg of last 10 tests"/>
      <Tile label="Recent accuracy" value={avgAcc==null?'-':avgAcc.toFixed(1)+'%'} sub="avg of last 10 tests"/>
      <Tile label="Tests taken" value={tests.length} sub={(history.length-tests.length)+' drills'}/>
    </div>
    <div className="card">
      <div className="row between"><h2>Daily goal</h2><span className="muted">{Math.floor(todayMin)} of {goal} min today · {streak} day streak</span></div>
      <BarChart days={days} goal={goal}/>
    </div>
    <div className="cols">
      <div className="card"><h2>Speed per test</h2><TrendChart points={wpmPts} fmt={v=>v.toFixed(0)+' WPM'} refLine={{value:settings.target,label:'target '+settings.target}}/></div>
      <div className="card"><h2>Accuracy per test</h2><TrendChart points={accPts} mode="pct" fmt={v=>v.toFixed(1)+'%'} refLine={{value:95,label:'95%'}}/></div>
    </div>
    <div className="cols">
      <div className="card"><h2>Personal bests</h2>
        <table className="tbl" style={{marginTop:8}}><thead><tr><th>Test</th><th className="n">Best WPM</th></tr></thead><tbody>
          {[15,30,60,120].map(d=>(<tr key={d}><td>{d} seconds</td><td className="n mono">{bestBy(d)==null?'-':Math.round(bestBy(d))}</td></tr>))}
          <tr><td>Any test</td><td className="n mono">{bestWpm==null?'-':Math.round(bestWpm)}</td></tr>
        </tbody></table></div>
      <div className="card"><h2>Weak keys</h2>
        <p className="muted" style={{margin:'4px 0 10px'}}>Last {Math.min(30,history.length)} results, misses vs. hits per key.</p>
        <Keyboard agg={agg}/>
        {wk.length?(<div className="chips" style={{marginTop:12}}>{wk.map(w=>(<span className="chip" key={w.k}>{KW.keyLabel(w.k)}<b>{w.m} missed</b></span>))}</div>):null}
        <div style={{marginTop:12}}><button className="btn sm" onClick={()=>go('practice')}>Practice these</button></div></div>
    </div>
    {prl.length?(<div className="card"><h2>Practice history</h2><div className="scroll"><table className="tbl" style={{marginTop:8}}><thead><tr><th>Exercise</th><th className="n">Runs</th><th className="n">Best WPM</th><th className="n">Avg accuracy</th><th className="n">Last</th></tr></thead><tbody>
      {prl.map(g=>(<tr key={g.name}><td>{g.name}</td><td className="n mono">{g.n}</td><td className="n mono">{Math.round(g.best)}</td><td className="n mono">{(g.acc/g.n).toFixed(1)}%</td><td className="n">{shortDate(g.last)}</td></tr>))}
    </tbody></table></div></div>):null}
    <div className="card">
      <div className="row between"><h2>History</h2>
        <div className="row">
          {history.length>10?(<button className="btn sm" onClick={()=>setShowAll(!showAll)}>{showAll?'Show recent':'Show all '+history.length}</button>):null}
          {confirm?(<><button className="btn sm danger" onClick={()=>{setStore(s=>({...s,history:[]}));setConfirm(false);}}>Yes, clear history</button><button className="btn sm" onClick={()=>setConfirm(false)}>Cancel</button></>)
          :(<button className="btn sm" onClick={()=>setConfirm(true)}>Clear history</button>)}
        </div></div>
      <div className="scroll"><table className="tbl" style={{marginTop:8}}><thead><tr><th>When</th><th>Test</th><th className="n">WPM</th><th className="n">Acc</th><th className="n">Cons</th><th></th></tr></thead><tbody>
        {rows.map(r=>(<tr key={r.id}><td style={{whiteSpace:'nowrap'}}>{fmtDate(r.ts)}</td><td>{testLabel(r)}</td><td className="n mono">{Math.round(r.wpm)}</td><td className="n mono">{r.acc.toFixed(1)}%</td><td className="n mono">{r.cons==null?'-':Math.round(r.cons)+'%'}</td><td className="n"><button className="btn sm" onClick={()=>openReport(r.id)}>Report</button></td></tr>))}
      </tbody></table></div>
    </div>
  </>);
}

