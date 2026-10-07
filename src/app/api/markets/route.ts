import {NextResponse} from "next/server";

const mock = {
  source:"mock",
  items:[
    {marketId:"mock-1",category:"crypto",title:"Will BTC close above $100k this month?",phase:"primary",volumeUsdc:"18420",yesPrice:"0.62",noPrice:"0.38",tradeCount:14,buyPressure:0.72},
    {marketId:"mock-2",category:"crypto",title:"Will ETH outperform BTC this week?",phase:"secondary",volumeUsdc:"12110",yesPrice:"0.47",noPrice:"0.53",tradeCount:8,buyPressure:0.44},
    {marketId:"mock-3",category:"macro",title:"Will the Fed cut at the next meeting?",phase:"primary",volumeUsdc:"28750",yesPrice:"0.71",noPrice:"0.29",tradeCount:21,buyPressure:0.77}
  ]
};

function n(x:any){const v=Number(x);return Number.isFinite(v)?v:0}

export async function GET(){
  const key=process.env.PANTA_API_KEY;
  const base=process.env.PANTA_API_BASE_URL || "https://live-api.panta.market/api/v1";
  if(!key) return NextResponse.json(mock);

  try{
    const listRes=await fetch(`${base}/markets/?limit=12`,{headers:{"X-Api-Key":key},cache:"no-store"});
    if(!listRes.ok) throw new Error(`Panta markets ${listRes.status}`);
    const list=await listRes.json();

    const items=await Promise.all((list.items||[]).map(async(m:any)=>{
      const headers={"X-Api-Key":key};
      const [detailRes,tradesRes]=await Promise.all([
        fetch(`${base}/markets/${m.marketId}/`,{headers,cache:"no-store"}).catch(()=>null),
        fetch(`${base}/markets/${m.marketId}/trades/?limit=50`,{headers,cache:"no-store"}).catch(()=>null)
      ]);
      const detail=detailRes && detailRes.ok ? await detailRes.json() : {};
      const trades=tradesRes && tradesRes.ok ? (await tradesRes.json()).items||[] : [];
      let yes=0,no=0;
      for(const t of trades){
        yes += n(t.yesAmount);
        no += n(t.noAmount);
      }
      const total=yes+no;
      return {
        ...m,...detail,
        tradeCount:trades.length,
        buyPressure: total>0 ? yes/total : .5
      };
    }));
    return NextResponse.json({source:"panta-live",items});
  }catch(e:any){
    return NextResponse.json({...mock,source:"mock-fallback",error:String(e?.message||e)});
  }
}
