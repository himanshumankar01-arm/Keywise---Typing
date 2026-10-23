import React,{useState,useEffect,useRef,useMemo,useLayoutEffect,memo} from 'react';
import {KW} from './engine.js';
import {cx,STORE_KEY,VIEWS,SIZES,DEFAULTS,loadStore,fmtDur,fmtDate,shortDate,testLabel,pct,useWidth,Tile,SpeedChart,TrendChart,BarChart,Keyboard,RecCard,Seg} from './shared.jsx';
import {TestView} from './TestView.jsx';
import {ReportView} from './ReportView.jsx';
import {PracticeView} from './PracticeView.jsx';
import {ProgressView} from './ProgressView.jsx';
import {SettingsView} from './SettingsView.jsx';
export default function App(){
  const [store,setStore]=useState(loadStore);
  const [view,setViewS]=useState(()=>{let h='';try{h=(location.hash||'').slice(1);}catch(e){}return VIEWS.some(v=>v[0]===h)?h:'test';});
  const [reportId,setReportId]=useState(null);
  const [session,setSession]=useState(null);
  const [retry,setRetry]=useState(null);
  const lastText=useRef('');
  const setView=v=>{setViewS(v);try{history.replaceState(null,'','#'+v);}catch(e){}window.scrollTo(0,0);};
  useEffect(()=>{
    try{localStorage.setItem(STORE_KEY,JSON.stringify(store));}
    catch(e){try{localStorage.setItem(STORE_KEY,JSON.stringify({...store,history:store.history.slice(0,60)}));}catch(e2){}}
  },[store]);
  useEffect(()=>{
    const r=document.documentElement;
    if(store.settings.theme==='system')r.removeAttribute('data-theme');else r.setAttribute('data-theme',store.settings.theme);
    r.style.setProperty('--tsize',SIZES[store.settings.size]||SIZES.m);
  },[store.settings.theme,store.settings.size]);
  useEffect(()=>{
    const h=()=>{let x='';try{x=(location.hash||'').slice(1);}catch(e){}if(VIEWS.some(v=>v[0]===x))setViewS(x);};
    window.addEventListener('hashchange',h);return()=>window.removeEventListener('hashchange',h);
  },[]);
  const startEx=(id,params)=>{
    const d=KW.exercise(id,params);
    setSession({id:Date.now(),exId:id,name:d.name,desc:d.desc,make:d.make});setView('test');
  };
  const onFinish=(id,text)=>{setReportId(id);lastText.current=text;setView('report');};
  const retrySame=()=>{setRetry(lastText.current);setView('test');};
  const themeNext={system:'light',light:'dark',dark:'system'};
  const themeName={system:'Auto',light:'Light',dark:'Dark'};
  const openReport=id=>{setReportId(id);setView('report');};
  return (<div className="app">
    <header className="top">
      <button className="brand" onClick={()=>setView('test')} aria-label="Keywise home"><span className="mark">k</span>KeyType</button>
      <nav className="nav" aria-label="Main">{VIEWS.map(v=>(<button key={v[0]} className={view===v[0]?'on':''} aria-current={view===v[0]?'page':null} onClick={()=>setView(v[0])}>{v[1]}</button>))}</nav>
      <button className="themebtn" onClick={()=>setStore(s=>({...s,settings:{...s.settings,theme:themeNext[s.settings.theme]}}))} title="Switch theme">Theme: {themeName[store.settings.theme]}</button>
    </header>
    <main>
      {view==='test'?(<TestView key="test" store={store} setStore={setStore} session={session} setSession={setSession} retryText={retry} clearRetry={()=>setRetry(null)} onFinish={onFinish}/>):null}
      {view==='report'?(<ReportView store={store} reportId={reportId} startEx={startEx} go={setView} retrySame={retrySame} hasLastText={!!lastText.current}/>):null}
      {view==='practice'?(<PracticeView store={store} startEx={startEx} go={setView}/>):null}
      {view==='progress'?(<ProgressView store={store} setStore={setStore} go={setView} openReport={openReport}/>):null}
      {view==='settings'?(<SettingsView store={store} setStore={setStore}/>):null}
    </main>
  </div>);
}
