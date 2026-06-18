import React, { useState, useEffect } from 'react';

export default function BudgetApp() {
  const totalSalary = 28000;
  
  // 1. Core States with LocalStorage Auto-Save
  const [actual, setActual] = useState(() => {
    const saved = localStorage.getItem('marmar_actual');
    return saved ? JSON.parse(saved) : { outingsAndTrips: 0, shopping: 0, laser: 0, gym: 0, food: 0, transport: 0 };
  });

  const [checklist, setChecklist] = useState(() => {
    const saved = localStorage.getItem('marmar_checklist');
    return saved ? JSON.parse(saved) : { familyAndRoy: false, charity: false };
  });

  const [goldPrice, setGoldPrice] = useState(() => {
    return localStorage.getItem('marmar_gold_price') || '4000'; 
  });

  // Yearly Ledger State (Starting July 2026 for the new job)
  const [yearlyHistory, setYearlyHistory] = useState(() => {
    const saved = localStorage.getItem('marmar_yearly_history');
    return saved ? JSON.parse(saved) : [
      { month: 'July 2026', savings: 0, spent: 0, extraCashSaved: 0, status: 'Upcoming' },
      { month: 'August 2026', savings: 0, spent: 0, extraCashSaved: 0, status: 'Upcoming' },
      { month: 'September 2026', savings: 0, spent: 0, extraCashSaved: 0, status: 'Upcoming' },
      { month: 'October 2026', savings: 0, spent: 0, extraCashSaved: 0, status: 'Upcoming' },
      { month: 'November 2026', savings: 0, spent: 0, extraCashSaved: 0, status: 'Upcoming' },
      { month: 'December 2026', savings: 0, spent: 0, extraCashSaved: 0, status: 'Upcoming' }
    ];
  });

  const [selectedMonthLog, setSelectedMonthLog] = useState('July 2026');
  const [motivation, setMotivation] = useState('Welcome back, Marmar! Let\'s manage this month efficiently. 🚀');

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('marmar_actual', JSON.stringify(actual));
  }, [actual]);

  useEffect(() => {
    localStorage.setItem('marmar_checklist', JSON.stringify(checklist));
  }, [checklist]);

  useEffect(() => {
    localStorage.setItem('marmar_gold_price', goldPrice);
  }, [goldPrice]);

  useEffect(() => {
    localStorage.setItem('marmar_yearly_history', JSON.stringify(yearlyHistory));
  }, [yearlyHistory]);

  // 2. Updated Targets (Clean Numbers for the Eye)
  const targetOutings = 2000;     
  const targetShopping = 1200;    
  const targetLaser = 1200;       
  const targetGym = 800;          
  const targetRent = 5000;        
  const targetFood = 1200;        
  const targetTransport = 4500;   

  const fixedFamilyAndRoy = 6300; 
  const fixedCharity = 1000;      
  const fixedSavingsGold = 4000;  // 4000 Gold savings anchor
  const fixedBirthdayBase = 800;  // 800 birthday fund base

  // Available pools
  const totalDynamicBudgetPool = targetOutings + targetShopping + targetLaser + targetGym + targetRent + targetFood + targetTransport;
  const isFamilyPaid = checklist.familyAndRoy && checklist.charity;

  // Individual Remaining calculations
  const remainingOutings = targetOutings - actual.outingsAndTrips;
  const remainingShopping = targetShopping - actual.shopping;
  const remainingLaser = targetLaser - actual.laser;
  const remainingGym = targetGym - actual.gym;
  const remainingFood = targetFood - actual.food;
  const remainingTransport = targetTransport - actual.transport;

  // Rule Checklist: Any overflow/surplus from Outings, Shopping, or Transport goes directly into Birthday Fund!
  const outingsSurplus = remainingOutings > 0 ? remainingOutings : 0;
  const shoppingSurplus = remainingShopping > 0 ? remainingShopping : 0;
  const transportSurplus = remainingTransport > 0 ? remainingTransport : 0;
  
  const currentMonthBirthdayFundTotal = fixedBirthdayBase + outingsSurplus + shoppingSurplus + transportSurplus;

  // Calculate actual total spent (Rent is always fully spent for safety)
  const actualDynamicSpent = actual.outingsAndTrips + actual.shopping + actual.laser + actual.gym + targetRent + actual.food + actual.transport;
  
  // Overall Financial Calculations
  const totalSpentOverall = fixedFamilyAndRoy + fixedCharity + fixedSavingsGold + fixedBirthdayBase + actualDynamicSpent;
  
  // *** الكاش الصافي النهائي المحوّش زيادة برة الـ 4000 والـ 800 هدايا ***
  const extraCashSavedEndofMonth = totalSalary - totalSpentOverall;

  const isOverbudgetOverall = extraCashSavedEndofMonth < 0;

  // Dynamic Motivation Updates
  useEffect(() => {
    if (!isFamilyPaid) {
      setMotivation(`📌 Reminder: Please prioritize sending Family Support, Roy's treats & Charity first!`);
    } else if (isOverbudgetOverall) {
      setMotivation(`⚠️ Careful Marmar! You have breached your budget pool. Extra cash savings are negative.`);
    } else {
      setMotivation(`Welcome back, Marmar! Your extra cash tracking is fully optimized. 🌟`);
    }
  }, [actual, isOverbudgetOverall, isFamilyPaid]);

  // Gold Grams calculation
  const goldGrams = Number(goldPrice) > 0 ? (fixedSavingsGold / Number(goldPrice)).toFixed(2) : '0.00';

  // Handlers
  const handleInputChange = (field, value) => {
    setActual(prev => ({ ...prev, [field]: Number(value) || 0 }));
  };

  const handleCheckChange = (field) => {
    setChecklist(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const logCurrentMonthToYear = () => {
    setYearlyHistory(prev => prev.map(item => {
      if (item.month === selectedMonthLog) {
        return { ...item, savings: fixedSavingsGold, spent: totalSpentOverall, extraCashSaved: extraCashSavedEndofMonth, status: 'Logged ✓' };
      }
      return item;
    }));
  };

  const resetCurrentMonth = () => {
    if(window.confirm("Are you sure you want to reset current month workspace?")) {
      setActual({ outingsAndTrips: 0, shopping: 0, laser: 0, gym: 0, food: 0, transport: 0 });
      setChecklist({ familyAndRoy: false, charity: false });
    }
  };

  return (
    <div style={{ backgroundColor: '#FDFBF7', color: '#4A4A4A', minHeight: '100vh', padding: '30px', fontFamily: 'Segoe UI, sans-serif', direction: 'ltr' }}>
      
      {/* Critical Family Alert Banner */}
      {!isFamilyPaid && (
        <div style={{ backgroundColor: '#D32F2F', color: '#ffffff', padding: '14px 20px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', maxWidth: '1000px', margin: '0 auto 20px auto', boxShadow: '0 4px 15px rgba(211,47,47,0.3)', fontSize: '15px' }}>
          🚨 Action Required: Family Support, Roy's treats, or Charity (العشور) haven't been cleared for this cycle yet!
        </div>
      )}

      {/* 1. Header & Motivation Banner */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '28px', border: '2px solid #F1EDE4', marginBottom: '30px', maxWidth: '1000px', margin: '0 auto 30px auto', boxShadow: '0 10px 25px rgba(143,168,155,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ color: '#2C3E35', fontSize: '32px', fontWeight: 'bold', margin: '0' }}>Marmar Budget Hub 🚀</h1>
            <p style={{ color: '#7A8B76', fontSize: '14px', margin: '4px 0 0 0' }}>Advanced Granular Budgeting & Extra Cash Savings Calculator</p>
          </div>
          <button onClick={resetCurrentMonth} style={{ backgroundColor: '#F4EBE8', color: '#D32F2F', border: 'none', padding: '10px 18px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>🔄 Reset Month</button>
        </div>
        
        <div style={{ backgroundColor: '#FAF7F2', padding: '12px 18px', borderRadius: '12px', border: '1px solid #EAE2D5', marginTop: '16px', fontSize: '13px', fontWeight: '500', color: '#5C6B59' }}>
          💬 {motivation}
        </div>

        {/* Live Counters */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
          
          {/* العداد المطلوب: وفر الكاش الصافي بعيداً عن الذهب والهدايا */}
          <div style={{ backgroundColor: extraCashSavedEndofMonth >= 0 ? '#E8F5E9' : '#FFEBEE', padding: '16px 20px', borderRadius: '16px', border: extraCashSavedEndofMonth >= 0 ? '1px solid #C8E6C9' : '1px solid #FFCDD2', flex: '1 1 250px' }}>
            <span style={{ fontSize: '11px', color: extraCashSavedEndofMonth >= 0 ? '#2E7D32' : '#C62828', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>💰 صافي تحويش كاش إضافي (برة الذهب والهدايا)</span>
            <span style={{ fontSize: '26px', fontWeight: 'bold', color: extraCashSavedEndofMonth >= 0 ? '#1B5E20' : '#C62828', display: 'block', marginTop: '4px' }}>{extraCashSavedEndofMonth.toLocaleString()} EGP</span>
            <span style={{ fontSize: '11px', color: '#666', display: 'block', marginTop: '4px' }}>هذا هو المبلغ المتبقي الفعلي في جيبك نهاية الشهر.</span>
          </div>
          
          <div style={{ backgroundColor: '#E3F2FD', padding: '16px 20px', borderRadius: '16px', border: '1px solid #BBDEFB', flex: '1 1 200px' }}>
            <span style={{ fontSize: '11px', color: '#1976D2', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Fixed Gold Savings Asset</span>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1565C0', display: 'block', marginTop: '4px' }}>{fixedSavingsGold.toLocaleString()} EGP</span>
          </div>

          <div style={{ backgroundColor: '#FFFDE7', padding: '16px 20px', borderRadius: '16px', border: '1px solid #FFF59D', flex: '1 1 200px' }}>
            <span style={{ fontSize: '11px', color: '#F57F17', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Gold Weight Tracker 🪙</span>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#E65100', display: 'block', marginTop: '4px' }}>{goldGrams} Grams</span>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}>
              <span>24k Gold Price:</span>
              <input type="number" value={goldPrice} onChange={(e) => setGoldPrice(e.target.value)} style={{ width: '65px', padding: '2px', borderRadius: '4px', border: '1px solid #FFF59D', textAlign: 'center' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Workspace Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto 40px auto' }}>
        
        {/* Branch: Family & Blessings */}
        <div style={{ backgroundColor: '#FFF5F5', padding: '24px', borderRadius: '24px', border: '2px solid #FFEBEE' }}>
          <h2 style={{ color: '#C62828', margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold' }}>❤️ Family & Roy Support</h2>
          <p style={{ color: '#EF5350', fontSize: '11px', margin: '0 0 16px 0' }}>Core household & puppy care validation</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: checklist.familyAndRoy ? '#FFEBEE' : '#ffffff', borderRadius: '12px', border: '1px solid #FFCDD2', cursor: 'pointer' }}>
              <input type="checkbox" checked={checklist.familyAndRoy} onChange={() => handleCheckChange('familyAndRoy')} style={{ accentColor: '#D32F2F' }} />
              <span style={{ textDecoration: checklist.familyAndRoy ? 'line-through' : 'none', color: checklist.familyAndRoy ? '#9E9E9E' : '#212121', fontSize: '13px', fontWeight: '500' }}>الأهل + روي 🐕 (6,300)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: checklist.charity ? '#FFEBEE' : '#ffffff', borderRadius: '12px', border: '1px solid #FFCDD2', cursor: 'pointer' }}>
              <input type="checkbox" checked={checklist.charity} onChange={() => handleCheckChange('charity')} style={{ accentColor: '#D32F2F' }} />
              <span style={{ textDecoration: checklist.charity ? 'line-through' : 'none', color: checklist.charity ? '#9E9E9E' : '#212121', fontSize: '13px', fontWeight: '500' }}>العشور / Charity (1,000)</span>
            </label>
          </div>
        </div>

        {/* Branch: Core Savings */}
        <div style={{ backgroundColor: '#E8F5E9', padding: '24px', borderRadius: '24px', border: '2px solid #C8E6C9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ color: '#2E7D32', margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold' }}>🔒 Future Security Base</h2>
            <p style={{ color: '#4CAF50', fontSize: '11px', margin: '0 0 16px 0' }}>Protected monthly anchor savings</p>
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #A5D6A7', textAlign: 'center', fontSize: '26px', fontWeight: 'bold', color: '#1B5E20', margin: '15px 0' }}>
              4,000 EGP
            </div>
          </div>
          <p style={{ color: '#2E7D32', fontSize: '11px', margin: '0', textAlign: 'center', fontStyle: 'italic', fontWeight: '500' }}>Pure Gold accumulation active 🪙</p>
        </div>

        {/* Branch: Flexible Splitting Fields */}
        <div style={{ backgroundColor: '#F3E5F5', padding: '24px', borderRadius: '24px', border: '2px solid #E1BEE7', gridColumn: '1 / -1' }}>
          <h2 style={{ color: '#6A1B9A', margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold' }}>✨ Flexible & Self Care Trackers</h2>
          <p style={{ color: '#8E24AA', fontSize: '11px', margin: '0 0 16px 0' }}>Surplus from Outings, Shopping & Transport goes straight to the Birthday Fund below!</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            
            {/* Outings and Trips */}
<div>
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
    <span>☕ Outings & Trips (Target: 2k)</span>
    <span style={{fontWeight:'bold', color: remainingOutings >= 0 ? '#6A1B9A' : '#D32F2F'}}>
      {remainingOutings >= 0 ? `Left: ${remainingOutings}` : `Over: +${Math.abs(remainingOutings)}`}
    </span>
  </div>
  <input 
    type="number" 
    value={actual.outingsAndTrips || ''} 
    placeholder="Cafes, trips, travel..." 
    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: remainingOutings >= 0 ? '1px solid #E1BEE7' : '2px solid #D32F2F', boxSizing: 'border-box' }} 
    onChange={(e) => handleInputChange('outingsAndTrips', e.target.value)} 
    
  />
</div>
            {/* Shopping */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}><span>🛍️ Shopping (Target: 1.2k)</span><span style={{fontWeight:'bold', color: remainingShopping >= 0 ? '#6A1B9A' : '#D32F2F'}}>{remainingShopping >= 0 ? `Left: ${remainingShopping}` : `Over: +${Math.abs(remainingShopping)}`}</span></div>
              <input type="number" value={actual.shopping || ''} placeholder="Clothes, bags, shoes..." style={{ width: '100%', padding: '10px', borderRadius: '10px', border: remainingShopping >= 0 ? '1px solid #E1BEE7' : '2px solid #D32F2F', boxSizing: 'border-box' }} onChange={(e) => handleInputChange('shopping', e.target.value)} />
            </div>

            {/* Laser */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}><span>⚡ Laser Session (Target: 1.2k)</span><span style={{fontWeight:'bold', color: remainingLaser >= 0 ? '#6A1B9A' : '#D32F2F'}}>{remainingLaser >= 0 ? `Left: ${remainingLaser}` : `Over: +${Math.abs(remainingLaser)}`}</span></div>
              <input type="number" value={actual.laser || ''} placeholder="Laser session cost..." style={{ width: '100%', padding: '10px', borderRadius: '10px', border: remainingLaser >= 0 ? '1px solid #E1BEE7' : '2px solid #D32F2F', boxSizing: 'border-box' }} onChange={(e) => handleInputChange('laser', e.target.value)} />
            </div>

            {/* Gym */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}><span>🏋️ Gym Subscription (Target: 800)</span><span style={{fontWeight:'bold', color: remainingGym >= 0 ? '#6A1B9A' : '#D32F2F'}}>{remainingGym >= 0 ? `Left: ${remainingGym}` : `Over: +${Math.abs(remainingGym)}`}</span></div>
              <input type="number" value={actual.gym || ''} placeholder="Gym subscription..." style={{ width: '100%', padding: '10px', borderRadius: '10px', border: remainingGym >= 0 ? '1px solid #E1BEE7' : '2px solid #D32F2F', boxSizing: 'border-box' }} onChange={(e) => handleInputChange('gym', e.target.value)} />
            </div>

          </div>
        </div>

        {/* Branch: Cairo Living Expenses */}
        <div style={{ backgroundColor: '#E3F2FD', padding: '24px', borderRadius: '24px', border: '2px solid #BBDEFB', gridColumn: '1 / -1' }}>
          <h2 style={{ color: '#0D47A1', margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold' }}>🏢 Cairo & Living Expenses Room Setup</h2>
          <p style={{ color: '#1E88E5', fontSize: '11px', margin: '0 0 16px 0' }}>Core operational costs for workspace housing</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}><span>Rent Room (Fixed: 5k)</span></div>
              <input type="number" value={targetRent} disabled style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #BBDEFB', backgroundColor: '#F0F4F8', boxSizing: 'border-box', color: '#555' }} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}><span>Supermarket Food (Target: 1.2k)</span><span style={{fontWeight:'bold', color: remainingFood >= 0 ? '#0D47A1' : '#D32F2F'}}>{remainingFood >= 0 ? `Left: ${remainingFood}` : `Over: +${Math.abs(remainingFood)}`}</span></div>
              <input type="number" value={actual.food || ''} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: remainingFood >= 0 ? '1px solid #BBDEFB' : '2px solid #D32F2F', boxSizing: 'border-box' }} onChange={(e) => handleInputChange('food', e.target.value)} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}><span>Transport & Travel (Target: 4.5k)</span><span style={{fontWeight:'bold', color: remainingTransport >= 0 ? '#0D47A1' : '#D32F2F'}}>{remainingTransport >= 0 ? `Left: ${remainingTransport}` : `Over: +${Math.abs(remainingTransport)}`}</span></div>
              <input type="number" value={actual.transport || ''} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: remainingTransport >= 0 ? '1px solid #BBDEFB' : '2px solid #D32F2F', boxSizing: 'border-box' }} onChange={(e) => handleInputChange('transport', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Branch: Sinking Fund (Birthday Registry) */}
        <div style={{ backgroundColor: '#FFF0F6', padding: '24px', borderRadius: '24px', border: '2px solid #FFD8E4', gridColumn: '1 / -1' }}>
          <h2 style={{ color: '#9C0F48', margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold' }}>🎁 Birthday Gifts Tracker (Sinking Fund)</h2>
          <p style={{ color: '#D2145A', fontSize: '12px', margin: '0 0 16px 0' }}>
            Base Allowance: <b>800 EGP</b> | Total Pot This Month: <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{currentMonthBirthdayFundTotal.toLocaleString()} EGP</span>
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            {[
              { name: 'منة 🌸', month: 'July' },
              { name: 'صاحبك 👦', month: 'August' },
              { name: 'أختك 👭', month: 'September' },
              { name: 'ماما 👩', month: 'October' },
              { name: 'بابا 👨', month: 'April' },
              { name: 'مريم 🌸', month: 'June' }
            ].map((person, i) => (
              <div key={i} style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '14px', border: '1px solid #FFC0D3', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#4A4A4A' }}>{person.name}</span>
                <span style={{ fontSize: '11px', color: '#9C0F48', fontWeight: '500' }}>Month {person.month}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Yearly Ledger Tracking System */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '28px', border: '2px solid #F1EDE4', maxWidth: '1000px', margin: '0 auto', boxShadow: '0 10px 25px rgba(0,0,0,0.02)' }}>
        <h2 style={{ color: '#2C3E35', margin: '0 0 4px 0', fontSize: '22px', fontWeight: 'bold' }}>📅 2026 Yearly Ledger Dashboard</h2>
        <p style={{ color: '#7A8B76', fontSize: '13px', margin: '0 0 20px 0' }}>Save current numbers into your long-term annual report tracker</p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', backgroundColor: '#FAF9F5', padding: '14px', borderRadius: '16px', border: '1px solid #EAE6DF' }}>
          <span style={{ fontSize: '13px', fontWeight: '600' }}>Log current active numbers into:</span>
          <select value={selectedMonthLog} onChange={(e) => setSelectedMonthLog(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '500' }}>
            {yearlyHistory.map(item => <option key={item.month} value={item.month}>{item.month}</option>)}
          </select>
          <button onClick={logCurrentMonthToYear} style={{ backgroundColor: '#2C3E35', color: '#ffffff', border: 'none', padding: '9px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>💾 Save Month Data</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #EAE6DF', color: '#7A8B76' }}>
                <th style={{ padding: '12px 8px' }}>Month Sequence</th>
                <th style={{ padding: '12px 8px' }}>Core Gold Savings</th>
                <th style={{ padding: '12px 8px' }}>Extra Cash Saved</th>
                <th style={{ padding: '12px 8px' }}>Total Outflow/Spent</th>
                <th style={{ padding: '12px 8px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {yearlyHistory.map((item) => (
                <tr key={item.month} style={{ borderBottom: '1px solid #F5F2EB', backgroundColor: item.status !== 'Upcoming' ? '#F7FAF8' : 'transparent' }}>
                  <td style={{ padding: '14px 8px', fontWeight: '600', color: '#333E37' }}>{item.month}</td>
                  <td style={{ padding: '14px 8px', color: '#1B5E20', fontWeight: 'bold' }}>{item.savings.toLocaleString()} EGP</td>
                  <td style={{ padding: '14px 8px', color: '#0D47A1', fontWeight: 'bold' }}>{(item.extraCashSaved || 0).toLocaleString()} EGP</td>
                  <td style={{ padding: '14px 8px', color: '#4A4A4A' }}>{item.spent.toLocaleString()} EGP</td>
                  <td style={{ padding: '14px 8px' }}>
                    <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', backgroundColor: item.status !== 'Upcoming' ? '#D1FAE5' : '#E2E8F0', color: item.status !== 'Upcoming' ? '#065F46' : '#475569' }}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}