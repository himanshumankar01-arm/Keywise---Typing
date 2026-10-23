import React,{useState,useEffect,useRef,useMemo,useLayoutEffect,memo} from 'react';
import {KW} from './engine.js';
import {cx,STORE_KEY,VIEWS,SIZES,DEFAULTS,loadStore,fmtDur,fmtDate,shortDate,testLabel,pct,useWidth,Tile,SpeedChart,TrendChart,BarChart,Keyboard,RecCard,Seg} from './shared.jsx';
export function SettingsView({store,setStore}){
  const s=store.settings;
  const set=p=>setStore(x=>({...x,settings:{...x.settings,...p}}));
  const [msg,setMsg]=useState('');
  const [showJson,setShowJson]=useState(false);
  const [imp,setImp]=useState('');
  const [armed,setArmed]=useState(false);
  const json=JSON.stringify({v:1,settings:store.settings,cfg:store.cfg,history:store.history});
  const doCopy=()=>{
    const fail=()=>{setShowJson(true);setMsg('Copy was blocked. Select the text below and copy it.');};
    try{navigator.clipboard.writeText(json).then(()=>setMsg('Copied to clipboard.'),fail);}catch(e){fail();}
  };
  const doImport=()=>{
    try{const o=JSON.parse(imp);if(!o||!Array.isArray(o.history))throw new Error('x');
      setStore(()=>({v:1,settings:{...DEFAULTS.settings,...(o.settings||{})},cfg:{...DEFAULTS.cfg,...(o.cfg||{})},history:o.history.slice(0,200)}));
      setMsg('Imported '+o.history.length+' results.');setImp('');}
    catch(e){setMsg('That does not look like a Keywise backup.');}
  };
  return (<div className="card" style={{maxWidth:720}}>
    <div className="field"><h3>Appearance</h3>
      <div className="row"><span className="cfg-l" style={{width:80}}>Theme</span><Seg label="Theme" value={s.theme} onChange={v=>set({theme:v})} options={[['system','Auto'],['light','Light'],['dark','Dark']]}/></div>
      <div className="row"><span className="cfg-l" style={{width:80}}>Text size</span><Seg label="Text size" value={s.size} onChange={v=>set({size:v})} options={[['s','Small'],['m','Medium'],['l','Large']]}/></div>
      <div className="row"><span className="cfg-l" style={{width:80}}>Caret</span><Seg label="Caret style" value={s.caret} onChange={v=>set({caret:v})} options={[['block','Block'],['line','Line'],['under','Underline']]}/></div>
    </div>
    <div className="field"><h3>Typing</h3>
      <label className="row" style={{cursor:'pointer'}}><input id="live-toggle" type="checkbox" checked={s.live} onChange={e=>set({live:e.target.checked})} style={{width:18,height:18,accentColor:'var(--accent)'}}/><span>Show live WPM and accuracy while typing</span></label>
      <p className="muted">Turn off to type without watching the numbers. Results still appear at the end.</p>
    </div>
    <div className="field"><h3>Goals</h3>
      <div className="row"><span className="cfg-l" style={{width:80}}>Daily</span><Seg label="Daily goal in minutes" value={s.goalMin} onChange={v=>set({goalMin:v})} options={[[5,'5 min'],[10,'10 min'],[15,'15 min'],[20,'20 min'],[30,'30 min'],[45,'45 min']]}/></div>
      <div className="row"><span className="cfg-l" style={{width:80}}>Target</span>
        <button className="btn sm" aria-label="Lower target" onClick={()=>set({target:Math.max(10,s.target-5)})}>−</button>
        <b className="mono" style={{minWidth:80,textAlign:'center'}}>{s.target} WPM</b>
        <button className="btn sm" aria-label="Raise target" onClick={()=>set({target:Math.min(250,s.target+5)})}>+</button></div>
    </div>
    <div className="field"><h3>Your data</h3>
      <p className="muted">Everything is saved in this browser. {store.history.length} results stored.</p>
      <div className="row"><button className="btn" onClick={doCopy}>Copy backup</button><button className="btn" onClick={()=>setShowJson(!showJson)}>{showJson?'Hide':'Show'} backup text</button></div>
      {showJson?(<textarea id="export-box" className="box" readOnly value={json} onFocus={e=>e.target.select()}></textarea>):null}
      <textarea id="import-box" className="box" placeholder="Paste a backup here to restore it" value={imp} onChange={e=>setImp(e.target.value)}></textarea>
      <div className="row"><button className="btn" disabled={!imp.trim()} onClick={doImport}>Restore from backup</button></div>
      {msg?(<p role="status">{msg}</p>):null}
      <div className="row" style={{marginTop:6}}>
        {armed?(<><button className="btn danger" onClick={()=>{setStore(()=>JSON.parse(JSON.stringify(DEFAULTS)));setArmed(false);setMsg('All data and settings were reset.');}}>Yes, erase everything</button><button className="btn" onClick={()=>setArmed(false)}>Cancel</button></>)
        :(<button className="btn danger" onClick={()=>setArmed(true)}>Reset all data</button>)}
      </div>
    </div>
  </div>);
}

