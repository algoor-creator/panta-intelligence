'use client';
import {useEffect,useMemo,useState} from "react";

type Market={marketId:string;category?:string;title:string;phase?:string;volumeUsdc?:any;yesPrice?:any;noPrice?:any;tradeCount?:number;buyPressure?:number};
const num=(x:any)=>{const n=Number(x);return Number.isFinite(n)?n:0};

function intelligence(m:Market){
  const yes=num(m.yesPrice);
  const conviction=Math.min(1,Math.abs(yes-.5)*2);
  const liquidity=Math.min(1,Math.log10(num(m.volumeUsdc)+1)/5);
  const activity=Math.min(1,(m.tradeCount||0)/50);
  const flow=Math.min(1,Math.abs((m.buyPressure??.5)-.5)*2);
  return Math.round((conviction*.35+liquidity*.30+activity*.15+flow*.20)*100);
}
function signal(m:Market){
  const p=m.buyPressure??.5;
  if(p>=.7) return "YES-side flow is dominant";
  if(p<=.3) return "NO-side flow is dominant";
  return "Balanced recent flow";
}

export default function Home(){
  const [items,setItems]=useState<Market[]>([]);
  const [source,setSource]=useState("loading");
  const [sort,setSort]=useState("score");
  async function load(){const r=await fetch("/api/markets",{cache:"no-store"});const j=await r.json();setItems(j.items||[]);setSource(j.source||"unknown")}
  useEffect(()=>{load()},[]);
  const ranked=useMemo(()=>{
    const a=[...items];
    if(sort==="volume")a.sort((x,y)=>num(y.volumeUsdc)-num(x.volumeUsdc));
    else if(sort==="prob")a.sort((x,y)=>num(y.yesPrice)-num(x.yesPrice));
    else if(sort==="activity")a.sort((x,y)=>(y.tradeCount||0)-(x.tradeCount||0));
    else a.sort((x,y)=>intelligence(y)-intelligence(x));
    return a;
  },[items,sort]);

  return <main>
    <div className="badge">Powered by Panta · read-only intelligence MVP</div>
    <h1>Panta Intelligence</h1>
    <p className="sub">An intelligence layer for prediction markets. It combines price conviction, liquidity and recent trade flow to surface markets that deserve attention — without signing transactions or moving funds.</p>
    <div className="toolbar">
      <select value={sort} onChange={e=>setSort(e.target.value)}>
        <option value="score">Intelligence score</option>
        <option value="volume">Volume</option>
        <option value="prob">YES probability</option>
        <option value="activity">Trade activity</option>
      </select>
      <button onClick={load}>Refresh</button>
      <span className="meta">source: {source}</span>
    </div>
    <div className="grid">
      {ranked.map(m=><article className="card" key={m.marketId}>
        <div className="meta">{m.category||"market"} · {m.phase||"unknown"}</div>
        <div className="title">{m.title}</div>
        <div className="row"><span>YES</span><strong>{Math.round(num(m.yesPrice)*100)}%</strong></div>
        <div className="row"><span>Volume</span><strong>${num(m.volumeUsdc).toLocaleString()}</strong></div>
        <div className="row"><span>Recent trades</span><strong>{m.tradeCount||0}</strong></div>
        <div className="row"><span>YES flow</span><strong>{Math.round((m.buyPressure??.5)*100)}%</strong></div>
        <div className="row"><span>Intelligence</span><span className="score">{intelligence(m)}</span></div>
        <div className="signal">{signal(m)}</div>
      </article>)}
    </div>
    <div className="note">Safety boundary: read-only. No transaction building, signing, broadcasting or real-fund operations are implemented in this MVP.</div>
  </main>
}
