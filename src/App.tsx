import { useState, useEffect } from "react";

function DonutChart({ pct, color }) {
  const r = 68, cx = 90, cy = 90;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;
  return (
    <svg width="180" height="180" viewBox="0 0 180 180">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth="15" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="15"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={"rotate(-90 " + cx + " " + cy + ")"}
        style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      <text x={cx} y={cy - 6} textAnchor="middle" fill={color} fontSize="28" fontWeight="bold" fontFamily="system-ui">{pct}%</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#9CA3AF" fontSize="11" fontFamily="system-ui">of salary used</text>
    </svg>
  );
}

const ls = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const ALL_MONTHS = [
  "January 2026","February 2026","March 2026","April 2026","May 2026","June 2026",
  "July 2026","August 2026","September 2026","October 2026","November 2026","December 2026",
];
const HISTORY_INIT = ALL_MONTHS.map(m => ({ month:m, savings:0, spent:0, extraCash:0, status:"Upcoming" }));

export default function BudgetApp() {
  const SALARY=28000,T_OUTINGS=2000,T_SHOPPING=1200,T_LASER=1200,T_GYM=800,T_RENT=5000,T_FOOD=1200,T_TRANSPORT=4500;
  const F_FAMILY=6300,F_CHARITY=1000,F_GOLD=4000,F_BDAY_BASE=800;

  const [tab,setTab]           = useState("dashboard");
  const [actual,setActual]     = useState(() => ls.get("mm_actual",{outings:0,shopping:0,laser:0,gym:0,food:0,transport:0}));
  const [checks,setChecks]     = useState(() => ls.get("mm_checks",{family:false,charity:false}));
  const [goldP,setGoldP]       = useState(() => ls.get("mm_goldp",4000));
  const [history,setHistory]   = useState(() => ls.get("mm_history",HISTORY_INIT));
  const [logMonth,setLogMonth] = useState("July 2026");

  useEffect(() => { ls.set("mm_actual",  actual);  }, [actual]);
  useEffect(() => { ls.set("mm_checks",  checks);  }, [checks]);
  useEffect(() => { ls.set("mm_goldp",   goldP);   }, [goldP]);
  useEffect(() => { ls.set("mm_history", history); }, [history]);

  const isFamilyDone = checks.family && checks.charity;
  const remOutings=T_OUTINGS-actual.outings, remShopping=T_SHOPPING-actual.shopping;
  const remLaser=T_LASER-actual.laser, remGym=T_GYM-actual.gym;
  const remFood=T_FOOD-actual.food, remTransport=T_TRANSPORT-actual.transport;
  const surpOutings=remOutings>0?remOutings:0, surpShopping=remShopping>0?remShopping:0, surpTransport=remTransport>0?remTransport:0;
  const birthdayTotal=F_BDAY_BASE+surpOutings+surpShopping+surpTransport;
  const varSpent=actual.outings+actual.shopping+actual.laser+actual.gym+T_RENT+actual.food+actual.transport;
  const totalSpent=F_FAMILY+F_CHARITY+F_GOLD+F_BDAY_BASE+varSpent;
  const extraCash=SALARY-totalSpent;
  const pct=Math.min(Math.round((totalSpent/SALARY)*100),100);
  const goldGrams=Number(goldP)>0?(F_GOLD/Number(goldP)).toFixed(2):"0.00";

  const health=pct<75
    ?{color:"#22C55E",bg:"#F0FFF4",border:"#BBF7D0",badge:"#16A34A",status:"On track"}
    :pct<95
    ?{color:"#F59E0B",bg:"#FFFBEB",border:"#FDE68A",badge:"#D97706",status:"Getting close"}
    :{color:"#EF4444",bg:"#FFF1F2",border:"#FECDD3",badge:"#DC2626",status:"Over budget"};

  const motivation=!isFamilyDone
    ?"Reminder: Please prioritize Family Support and Charity first, Marmar!"
    :extraCash<0?"Careful Marmar! You have breached your budget pool. Extra cash is negative."
    :"Welcome back, Marmar! Your extra cash tracking is fully optimized.";

  const fmt=n=>Number(n).toLocaleString();
  const setNum=(f,v)=>setActual(p=>({...p,[f]:Math.max(0,Number(v)||0)}));
  const toggleCheck=f=>setChecks(p=>({...p,[f]:!p[f]}));
  const saveMonth=()=>setHistory(p=>p.map(it=>it.month===logMonth?{...it,savings:F_GOLD,spent:totalSpent,extraCash,status:"Logged"}:it));
  const resetMonth=()=>{if(window.confirm("Reset this month workspace?")){setActual({outings:0,shopping:0,laser:0,gym:0,food:0,transport:0});setChecks({family:false,charity:false});}};

  const card=(bg="#fff",border="#F0EDE6")=>({backgroundColor:bg,borderRadius:"20px",padding:"18px 20px",border:"1.5px solid "+border,marginBottom:"14px"});
  const numInput=(ok,blue)=>({width:"100%",padding:"10px 12px",borderRadius:"10px",fontSize:"14px",border:"1.5px solid "+(ok?(blue?"#BFDBFE":"#DDD6FE"):"#FECACA"),backgroundColor:ok?"#fff":"#FFF5F5",boxSizing:"border-box"});

  const RowLabel=({label,target,rem,blue})=>(
    <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",marginBottom:"5px"}}>
      <span style={{fontWeight:"500",color:"#374151"}}>{label} <span style={{color:"#9CA3AF"}}>({fmt(target)})</span></span>
      <span style={{fontWeight:"bold",color:rem>=0?(blue?"#1D4ED8":"#7C3AED"):"#DC2626"}}>{rem>=0?"Left: "+fmt(rem):"Over: +"+fmt(Math.abs(rem))}</span>
    </div>
  );

  const Dashboard=()=>(
    <div style={{padding:"14px"}}>
      <div style={{...card(health.bg,health.border)}}>
        <div style={{fontWeight:"bold",color:"#1F2937",fontSize:"15px",marginBottom:"14px"}}>BUDGET HEALTH</div>
        <div style={{display:"flex",alignItems:"center",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
          <DonutChart pct={pct} color={health.color}/>
          <div>
            <div style={{marginBottom:"16px"}}><div style={{fontSize:"12px",color:"#6B7280"}}>Spent so far</div><div style={{fontSize:"22px",fontWeight:"bold",color:"#1F2937"}}>{fmt(totalSpent)} EGP</div></div>
            <div><div style={{fontSize:"12px",color:"#6B7280"}}>Remaining</div><div style={{fontSize:"22px",fontWeight:"bold",color:health.color}}>{fmt(Math.max(0,extraCash))} EGP</div></div>
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:"12px",fontWeight:"600",fontSize:"14px",color:health.badge}}>{health.status}</div>
      </div>

      <div style={{...card(extraCash>=0?"#F0FFF4":"#FFF1F2",extraCash>=0?"#BBF7D0":"#FECDD3")}}>
        <div style={{fontSize:"13px",color:"#6B7280",marginBottom:"2px"}}>Net Extra Cash Saved</div>
        <div style={{fontSize:"36px",fontWeight:"bold",color:extraCash>=0?"#15803D":"#DC2626",lineHeight:1.1}}>{extraCash>=0?"+":""}{fmt(extraCash)} EGP</div>
        <div style={{fontSize:"12px",color:"#9CA3AF",marginTop:"4px"}}>After all expenses, obligations and gold savings</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"14px"}}>
        <div style={{backgroundColor:"#EFF6FF",borderRadius:"20px",padding:"16px",border:"1.5px solid #BFDBFE"}}><div style={{fontSize:"11px",fontWeight:"bold",color:"#1D4ED8"}}>GOLD SAVINGS</div><div style={{fontSize:"22px",fontWeight:"bold",color:"#1E40AF",marginTop:"4px"}}>{fmt(F_GOLD)} EGP</div></div>
        <div style={{backgroundColor:"#FDF2F8",borderRadius:"20px",padding:"16px",border:"1.5px solid #F9A8D4"}}><div style={{fontSize:"11px",fontWeight:"bold",color:"#BE185D"}}>BIRTHDAY FUND</div><div style={{fontSize:"22px",fontWeight:"bold",color:"#9D174D",marginTop:"4px"}}>{fmt(birthdayTotal)} EGP</div></div>
      </div>

      <div style={{...card("#FFFBEB","#FDE68A")}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:"11px",fontWeight:"bold",color:"#D97706"}}>GOLD WEIGHT TRACKER</div>
            <div style={{fontSize:"26px",fontWeight:"bold",color:"#92400E",marginTop:"4px"}}>{goldGrams} Grams 24k</div>
            <div style={{fontSize:"11px",color:"#B45309",marginTop:"3px"}}>{fmt(F_GOLD)} / {goldP} EGP per gram = {goldGrams}g</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:"10px",color:"#92400E",marginBottom:"4px"}}>Price / gram</div>
            <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
              <input type="text" inputMode="numeric" pattern="[0-9]*" value={goldP} onChange={e=>setGoldP(e.target.value)} style={{width:"72px",padding:"7px",borderRadius:"8px",border:"1.5px solid #FDE68A",textAlign:"center",fontSize:"14px",fontWeight:"bold"}}/>
              <span style={{fontSize:"11px",color:"#92400E"}}>EGP</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{...card()}}>
        {[{label:"Total Outflow",val:fmt(totalSpent)+" EGP",color:"#1F2937"},{label:"Salary",val:fmt(SALARY)+" EGP",color:"#16A34A"},{label:"Extra Cash",val:(extraCash>=0?"+":"")+fmt(extraCash)+" EGP",color:extraCash>=0?"#16A34A":"#DC2626"}].map((row,i,arr)=>(
          <div key={row.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<arr.length-1?"1px solid #F3F4F6":"none"}}>
            <span style={{color:"#6B7280",fontSize:"14px"}}>{row.label}</span>
            <span style={{fontWeight:"bold",fontSize:"14px",color:row.color}}>{row.val}</span>
          </div>
        ))}
      </div>

      <button onClick={()=>alert("Monthly Summary\n\nSalary: "+fmt(SALARY)+" EGP\nTotal Outflow: "+fmt(totalSpent)+" EGP\nGold Savings: "+fmt(F_GOLD)+" EGP\nBirthday Fund: "+fmt(birthdayTotal)+" EGP\nExtra Cash: "+(extraCash>=0?"+":"")+fmt(extraCash)+" EGP")}
        style={{width:"100%",backgroundColor:"#1E3A5F",color:"#fff",border:"none",padding:"17px",borderRadius:"16px",fontSize:"15px",fontWeight:"bold",cursor:"pointer"}}>
        Share Monthly Summary
      </button>
    </div>
  );

  const Tracker=()=>(
    <div style={{padding:"14px"}}>
      <div style={{...card("#FFF5F5","#FECDD3")}}>
        <h3 style={{color:"#B91C1C",margin:"0 0 12px 0",fontSize:"15px"}}>Family and Roy Support</h3>
        {[{f:"family",label:"Family + Roy (6,300 EGP)"},{f:"charity",label:"Charity - Al Oshor (1,000 EGP)"}].map(it=>(
          <label key={it.f} style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px",backgroundColor:checks[it.f]?"#FEE2E2":"#fff",borderRadius:"12px",border:"1px solid #FECDD3",marginBottom:"8px",cursor:"pointer"}}>
            <input type="checkbox" checked={checks[it.f]} onChange={()=>toggleCheck(it.f)} style={{accentColor:"#DC2626",width:"18px",height:"18px"}}/>
            <span style={{textDecoration:checks[it.f]?"line-through":"none",color:checks[it.f]?"#9CA3AF":"#1F2937",fontSize:"14px",fontWeight:"500"}}>{it.label}</span>
          </label>
        ))}
      </div>

      <div style={{...card("#F5F3FF","#DDD6FE")}}>
        <h3 style={{color:"#6D28D9",margin:"0 0 12px 0",fontSize:"15px"}}>Self Care and Lifestyle</h3>
        {[{k:"outings",label:"Outings and Trips",target:T_OUTINGS,rem:remOutings},{k:"shopping",label:"Shopping",target:T_SHOPPING,rem:remShopping},{k:"laser",label:"Laser Session",target:T_LASER,rem:remLaser},{k:"gym",label:"Gym Subscription",target:T_GYM,rem:remGym}].map(f=>(
          <div key={f.k} style={{marginBottom:"12px"}}>
            <RowLabel label={f.label} target={f.target} rem={f.rem} blue={false}/>
            <input type="text" inputMode="numeric" pattern="[0-9]*" value={actual[f.k]||""} placeholder="Enter amount" onChange={e=>setNum(f.k,e.target.value)} style={numInput(f.rem>=0,false)}/>
          </div>
        ))}
      </div>

      <div style={{...card("#EFF6FF","#BFDBFE")}}>
        <h3 style={{color:"#1D4ED8",margin:"0 0 12px 0",fontSize:"15px"}}>Cairo Living Expenses</h3>
        {[{k:"food",label:"Supermarket Food",target:T_FOOD,rem:remFood},{k:"transport",label:"Transport and Travel",target:T_TRANSPORT,rem:remTransport}].map(f=>(
          <div key={f.k} style={{marginBottom:"12px"}}>
            <RowLabel label={f.label} target={f.target} rem={f.rem} blue={true}/>
            <input type="text" inputMode="numeric" pattern="[0-9]*" value={actual[f.k]||""} placeholder="Enter amount" onChange={e=>setNum(f.k,e.target.value)} style={{...numInput(f.rem>=0,true),borderColor:f.rem>=0?"#BFDBFE":"#FECACA"}}/>
          </div>
        ))}
        <div>
          <div style={{fontSize:"12px",marginBottom:"5px",fontWeight:"500",color:"#374151"}}>Rent Room <span style={{color:"#9CA3AF"}}>(Fixed: 5,000)</span></div>
          <input type="number" value={5000} disabled style={{width:"100%",padding:"10px 12px",borderRadius:"10px",border:"1.5px solid #BFDBFE",fontSize:"14px",backgroundColor:"#F0F4F8",color:"#6B7280",boxSizing:"border-box"}}/>
        </div>
      </div>
    </div>
  );

  const Birthdays=()=>{
    const people=[{name:"Menna",month:"July"},{name:"Friend",month:"August"},{name:"Sister",month:"September"},{name:"Mama",month:"October"},{name:"Baba",month:"April"},{name:"Mariam",month:"June"}];
    return(
      <div style={{padding:"14px"}}>
        <div style={{...card("#FDF2F8","#F9A8D4")}}>
          <h3 style={{color:"#9D174D",margin:"0 0 4px 0",fontSize:"15px"}}>Birthday Sinking Fund</h3>
          <p style={{color:"#BE185D",fontSize:"12px",margin:"0 0 14px 0"}}>Base: <b>800 EGP</b> + Surplus from Outings, Shopping and Transport</p>
          <div style={{backgroundColor:"#fff",borderRadius:"14px",padding:"16px",border:"1px solid #F9A8D4",textAlign:"center",marginBottom:"14px"}}>
            <div style={{fontSize:"12px",color:"#BE185D",fontWeight:"600"}}>Total Birthday Fund This Month</div>
            <div style={{fontSize:"34px",fontWeight:"bold",color:"#9D174D"}}>{fmt(birthdayTotal)} EGP</div>
            <div style={{fontSize:"11px",color:"#9CA3AF",marginTop:"4px"}}>{"800 base + "+surpOutings+" outings + "+surpShopping+" shopping + "+surpTransport+" transport"}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
            {people.map((p,i)=>(
              <div key={i} style={{backgroundColor:"#fff",padding:"14px",borderRadius:"14px",border:"1px solid #FFC0D3",textAlign:"center"}}>
                <div style={{fontSize:"15px",fontWeight:"bold",color:"#1F2937"}}>{p.name}</div>
                <div style={{fontSize:"11px",color:"#9D174D",fontWeight:"500",marginTop:"4px"}}>Month: {p.month}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const Ledger=()=>(
    <div style={{padding:"14px"}}>
      <div style={{...card()}}>
        <h3 style={{color:"#1F2937",margin:"0 0 4px 0",fontSize:"15px"}}>2026 Yearly Ledger</h3>
        <p style={{color:"#6B7280",fontSize:"12px",margin:"0 0 14px 0"}}>Save and track each month data</p>
        <div style={{backgroundColor:"#F9FAFB",padding:"12px",borderRadius:"12px",border:"1px solid #E5E7EB",marginBottom:"14px"}}>
          <div style={{fontSize:"12px",fontWeight:"600",color:"#374151",marginBottom:"8px"}}>Log current numbers into:</div>
          <div style={{display:"flex",gap:"8px"}}>
            <select value={logMonth} onChange={e=>setLogMonth(e.target.value)} style={{flex:1,padding:"8px",borderRadius:"8px",border:"1px solid #D1D5DB",fontSize:"13px"}}>
              {ALL_MONTHS.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
            <button onClick={saveMonth} style={{backgroundColor:"#1E3A5F",color:"#fff",border:"none",padding:"8px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"bold",cursor:"pointer"}}>Save</button>
          </div>
        </div>
        {history.map(it=>(
          <div key={it.month} style={{backgroundColor:it.status!=="Upcoming"?"#F0FFF4":"#FAFAFA",borderRadius:"12px",padding:"12px 14px",marginBottom:"8px",border:"1px solid "+(it.status!=="Upcoming"?"#BBF7D0":"#E5E7EB")}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontWeight:"600",fontSize:"14px",color:"#1F2937"}}>{it.month}</span>
              <span style={{fontSize:"11px",padding:"3px 8px",borderRadius:"6px",fontWeight:"bold",backgroundColor:it.status!=="Upcoming"?"#D1FAE5":"#E5E7EB",color:it.status!=="Upcoming"?"#065F46":"#6B7280"}}>{it.status}</span>
            </div>
            {it.status!=="Upcoming"&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",marginTop:"10px"}}>
                {[{label:"Gold Savings",val:fmt(it.savings),color:"#16A34A"},{label:"Extra Cash",val:fmt(it.extraCash||0),color:"#1D4ED8"},{label:"Total Spent",val:fmt(it.spent),color:"#6B7280"}].map(col=>(
                  <div key={col.label} style={{textAlign:"center"}}>
                    <div style={{fontSize:"10px",color:"#6B7280"}}>{col.label}</div>
                    <div style={{fontSize:"13px",fontWeight:"bold",color:col.color}}>{col.val}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const TABS=[{id:"dashboard",label:"Dashboard"},{id:"tracker",label:"Tracker"},{id:"birthdays",label:"Birthdays"},{id:"ledger",label:"Ledger"}];

  return(
    <div style={{backgroundColor:"#FDFBF7",minHeight:"100vh",maxWidth:"430px",margin:"0 auto",fontFamily:"'Segoe UI',system-ui,sans-serif",paddingBottom:"80px",position:"relative"}}>
      {!isFamilyDone&&(
        <div style={{backgroundColor:"#DC2626",color:"#fff",padding:"11px 16px",textAlign:"center",fontWeight:"bold",fontSize:"13px"}}>
          Action Required: Family Support and Charity not cleared yet!
        </div>
      )}
      <div style={{padding:"16px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <h1 style={{margin:0,fontSize:"26px",fontWeight:"bold",color:"#1F2937",lineHeight:1.2}}>Marmar Budget Hub</h1>
          <div style={{fontSize:"13px",color:"#16A34A",fontWeight:"600",marginTop:"4px"}}>Salary: {fmt(SALARY)} EGP</div>
        </div>
        <button onClick={resetMonth} style={{backgroundColor:"#FEF2F2",color:"#DC2626",border:"none",borderRadius:"12px",padding:"10px 14px",cursor:"pointer",fontSize:"13px",fontWeight:"bold",marginTop:"4px"}}>Reset</button>
      </div>
      <div style={{margin:"12px 14px",backgroundColor:"#F9FAFB",borderRadius:"14px",padding:"12px 14px",border:"1px solid #E5E7EB",fontSize:"13px",color:"#374151"}}>{motivation}</div>
      {tab==="dashboard"&&<Dashboard/>}
      {tab==="tracker"&&<Tracker/>}
      {tab==="birthdays"&&<Birthdays/>}
      {tab==="ledger"&&<Ledger/>}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:"430px",backgroundColor:"#fff",borderTop:"1px solid #E5E7EB",display:"flex",zIndex:100}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{flex:1,padding:"12px 0 8px",border:"none",backgroundColor:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",color:tab===t.id?"#1D4ED8":"#9CA3AF"}}>
            <span style={{fontSize:"12px",fontWeight:tab===t.id?"700":"400"}}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
