import React,{useState,useEffect,useRef,useMemo,useLayoutEffect,memo} from 'react';
import {KW} from './engine.js';
import {cx,STORE_KEY,VIEWS,SIZES,DEFAULTS,loadStore,fmtDur,fmtDate,shortDate,testLabel,pct,useWidth,Tile,SpeedChart,TrendChart,BarChart,Keyboard,RecCard,Seg} from './shared.jsx';
export function ReportView({store,reportId,startEx,go,retrySame,hasLastText}){
  const history=store.history;
  const r=history.find(x=>x.id===reportId)||history[0];
  const idx=r?history.indexOf(r):-1;
  const recs=useMemo(()=>r?KW.recommend(history.slice(idx),r,store.settings.target,4):[],[history,r&&r.id,store.settings.target]);
  if(!r)return (<div className="card empty"><h2>No report yet</h2><p className="muted">Finish a typing test and your analysis shows up here.</p><button className="btn primary" onClick={()=>go('test')}>Take a test</button></div>);
  const prior=history.slice(idx+1).filter(x=>!x.exercise).slice(0,10);
  const avg=prior.length?prior.reduce((s,x)=>s+x.wpm,0)/prior.length:null;
  const diff=avg!=null?r.wpm-avg:null;
  const ser=r.series||[];
  const peak=ser.length?ser.reduce((a,b)=>b[2]>a[2]?b:a):null;
  const slow=ser.length>2?ser.slice(0,-1).reduce((a,b)=>b[2]<a[2]?b:a):null;
  const A=KW.aggregate([r]);
  const wk=KW.weakKeys(A);
  const missed=Object.entries(A.keys).filter(e=>e[1][1]>0).sort((a,b)=>b[1][1]-a[1][1]).slice(0,6);
  const bad=Object.entries(r.bad||{}).filter(e=>e[0].length>1).slice(0,10);
  const zones=Object.entries(r.cats||{}).filter(e=>e[1][1]>0).sort((a,b)=>b[1][1]-a[1][1]);
  const zmax=zones.length?zones[0][1][1]:1;
  const inst=k=>{let b='',n=0;for(const c in (r.conf||{})){if(c[0]===k&&c[1]==='>'&&r.conf[c]>n){n=r.conf[c];b=c.slice(2);}}return b;};
  return (<>
    <div className="card hero">
      <div>
        <div className="eyebrow">{testLabel(r)} · {fmtDate(r.ts)}</div>
        <div className="bignum">{Math.round(r.wpm)}<small>WPM</small></div>
        <div className="row" style={{marginTop:10,gap:6}}>
          {r.pb&&r.pb.wpm?(<span className="badge good">New best speed</span>):null}
          {r.pb&&r.pb.acc?(<span className="badge good">New best accuracy</span>):null}
          {r.pb&&r.pb.first?(<span className="badge">First test, your baseline</span>):null}
          {diff!=null?(<span className={cx('badge',diff<0&&'warn')}>{(diff>=0?'+':'')+diff.toFixed(1)+' vs recent average'}</span>):null}
        </div>
        <p className="muted" style={{marginTop:10}}>Net speed: correct characters only, 5 characters per word.</p>
      </div>
      <div className="metrics">
        <Tile label="Accuracy" value={r.acc.toFixed(1)+'%'} sub={r.keystrokes-r.mistakes+' of '+r.keystrokes+' keystrokes'}/>
        <Tile label="Error rate" value={r.err.toFixed(1)+'%'} sub={r.mistakes+' wrong keystrokes'}/>
        <Tile label="Consistency" value={r.cons==null?'n/a':pct(r.cons)} sub={r.cons==null?'needs 3+ seconds':'steadiness of pace'}/>
        <Tile label="Raw speed" value={Math.round(r.raw)} sub="WPM, errors included"/>
        <Tile label="Time" value={r.seconds+'s'}/>
        <Tile label="Characters" value={r.correct+' / '+r.incorrect} sub="correct / incorrect"/>
      </div>
    </div>
    <div className="card">
      <div className="row between"><h2>Speed over time</h2>
        <div className="legend"><span><i style={{background:'var(--accent)'}}></i>Net WPM</span><span><i style={{background:'var(--muted)'}}></i>Raw per second</span><span><i style={{background:'var(--bad)',borderRadius:99}}></i>Mistakes</span></div></div>
      <SpeedChart series={ser}/>
      {peak&&slow?(<p className="muted">Fastest second reached {peak[2]} WPM at {peak[0]}s. Slowest was {slow[2]} WPM at {slow[0]}s.</p>):null}
    </div>
    <div className="card">
      <h2>Mistake summary</h2>
      {r.mistakes===0?(<p style={{marginTop:8}}>Clean run. Every keystroke landed.</p>):(<>
        <p className="muted" style={{margin:'6px 0 14px'}}>{r.mistakes} wrong keystrokes, {r.backspaces} backspaces, {r.incorrect} characters left uncorrected.</p>
        <div className="cols">
          <div><div className="eyebrow" style={{marginBottom:8}}>Keys you missed</div>
            <table className="tbl"><thead><tr><th>Key</th><th className="n">Missed</th><th className="n">Accuracy</th><th>Often typed</th></tr></thead><tbody>
            {missed.map(e=>(<tr key={e[0]}><td><span className="keycap">{KW.keyLabel(e[0])}</span></td><td className="n mono">{e[1][1]}</td><td className="n mono">{Math.round(e[1][0]/(e[1][0]+e[1][1])*100)}%</td><td>{inst(e[0])?(<span className="keycap">{KW.keyLabel(inst(e[0]))}</span>):'-'}</td></tr>))}
            </tbody></table></div>
          <div style={{display:'grid',gap:16,alignContent:'start'}}>
            {bad.length?(<div><div className="eyebrow" style={{marginBottom:8}}>Words that tripped you</div><div className="chips">{bad.map(e=>(<span className="chip" key={e[0]}>{e[0]}<b>×{e[1]}</b></span>))}</div></div>):null}
            <div><div className="eyebrow" style={{marginBottom:8}}>Where mistakes happened</div>
              {zones.map(e=>(<div key={e[0]} style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 90px 26px',gap:8,alignItems:'center',marginBottom:6}}><span>{KW.CAT_LABEL[e[0]]}</span><div className="meter"><i style={{width:(e[1][1]/zmax*100)+'%',background:'var(--bad)'}}></i></div><span className="mono">{e[1][1]}</span></div>))}
            </div></div>
        </div></>)}
    </div>
    <div className="card">
      <h2>Suggested exercises</h2>
      {recs.length?(<div className="recs" style={{marginTop:12}}>{recs.map((x,i)=>(<RecCard key={i} rec={x} onStart={startEx}/>))}</div>):(<p className="muted">Keep testing and suggestions will appear.</p>)}
    </div>
    <div className="row">
      <button className="btn primary" onClick={()=>go('test')}>Take another test</button>
      {hasLastText&&r.id===history[0].id?(<button className="btn" onClick={retrySame}>Retry same text</button>):null}
      <button className="btn" onClick={()=>go('practice')}>All exercises</button>
    </div>
  </>);
}

