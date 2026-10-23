import React,{useState,useEffect,useRef,useMemo,useLayoutEffect,memo} from 'react';
import {KW} from './engine.js';
import {cx,STORE_KEY,VIEWS,SIZES,DEFAULTS,loadStore,fmtDur,fmtDate,shortDate,testLabel,pct,useWidth,Tile,SpeedChart,TrendChart,BarChart,Keyboard,RecCard,Seg} from './shared.jsx';
export function PracticeView({store,startEx,go}){
  const history=store.history;
  const recs=useMemo(()=>KW.recommend(history,history[0],store.settings.target,5),[history,store.settings.target]);
  const stat=id=>{const l=history.filter(r=>r.exercise&&r.exercise.id===id);return l.length?{n:l.length,best:Math.max(...l.map(x=>x.wpm)),acc:l.reduce((s,x)=>s+x.acc,0)/l.length}:null;};
  const groups=[['zones','Key zones'],['skills','Skill builders']];
  return (<>
    <div className="card">
      <h2>Recommended for you</h2>
      {recs.length?(<><p className="muted" style={{margin:'4px 0 12px'}}>Based on the mistakes in your last {Math.min(15,history.length)} {history.length===1?'test':'tests'}.</p>
        <div className="recs">{recs.map((x,i)=>(<RecCard key={i} rec={x} onStart={startEx}/>))}</div></>)
      :(<div className="empty"><p className="muted">Finish a test and drills matched to your mistakes appear here.</p><button className="btn primary" onClick={()=>go('test')}>Take a test</button></div>)}
    </div>
    {groups.map(g=>(<div className="card" key={g[0]}>
      <h2>{g[1]}</h2>
      <div className="exgrid" style={{marginTop:12}}>
        {KW.EXLIST.filter(e=>e.group===g[0]).map(e=>{const s=stat(e.id);return (<div className="ex" key={e.id}>
          <div><h3>{e.name}</h3><p className="muted" style={{marginTop:4}}>{e.desc}</p></div>
          <div className="row between"><span className="muted mono" style={{fontSize:'.8rem'}}>{s?s.n+' run'+(s.n>1?'s':'')+' · best '+Math.round(s.best)+' WPM':'Not tried yet'}</span>
            <button className="btn primary sm" onClick={()=>startEx(e.id,{})}>Start</button></div></div>);})}
      </div></div>))}
  </>);
}
