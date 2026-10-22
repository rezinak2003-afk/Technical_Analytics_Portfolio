
const projectType = document.body.dataset.project;
const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
const endpoints = ['/api/orders','/api/users','/api/search','/api/payments','/api/catalog'];
const devices = Array.from({length:12},(_,i)=>`sensor-${String(i+1).padStart(2,'0')}`);
const services = ['gateway','auth-service','orders-service','inventory-service','payment-service','notification-service'];
let seed=20261022;
function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
function makeRows(){
 const rows=[];
 for(let i=0;i<240;i++){
  const hour=i%24, day=Math.floor(i/24);
  rows.push({i,hour,day,endpoint:endpoints[Math.floor(rand()*endpoints.length)],device:devices[Math.floor(rand()*devices.length)],service:services[Math.floor(rand()*services.length)],requests:180+Math.floor(rand()*620),latency:45+rand()*430+(rand()>.93?350:0),error:rand()>.978,temperature:20+rand()*12+(rand()>.975?14:0),humidity:35+rand()*50,missing:rand()>.994,traceLatency:70+rand()*380+(rand()>.94?500:0),outcome:rand()>.979?'Error':'OK'});
 }
 return rows;
}
const allRows=makeRows();
const $=id=>document.getElementById(id);
function setupFilters(){
 const options=projectType==='iot'?devices:projectType==='trace'?services:endpoints;
 $('filter').innerHTML='<option value="all">All '+(projectType==='iot'?'devices':projectType==='trace'?'services':'endpoints')+'</option>'+options.map(x=>`<option>${x}</option>`).join('');
 $('range').innerHTML='<option value="24">Last 24 hours</option><option value="72">Last 72 hours</option><option value="168" selected>Last 7 days</option><option value="240">All data</option>';
 $('filter').addEventListener('change',render);$('range').addEventListener('change',render);$('reset').addEventListener('click',()=>{$('filter').value='all';$('range').value='168';render()});
}
function rowsFiltered(){
 const n=Number($('range').value);let rows=allRows.slice(-n);
 if($('filter').value!=='all')rows=rows.filter(r=>projectType==='iot'?r.device===$('filter').value:projectType==='trace'?r.service===$('filter').value:r.endpoint===$('filter').value);
 return rows.length?rows:allRows.slice(-24);
}
function setMetrics(rows){
 let vals;
 if(projectType==='api'){
  const req=rows.reduce((a,r)=>a+r.requests,0), errors=rows.filter(r=>r.error).length/rows.length*100, lat=rows.map(r=>r.latency).sort((a,b)=>a-b);
  vals=[req.toLocaleString(),errors.toFixed(2)+'%',Math.round(lat[Math.floor(.95*(lat.length-1))])+' ms',(100-errors/100).toFixed(2)+'%'];
 }else if(projectType==='iot'){
  vals=[rows.length.toLocaleString(),new Set(rows.map(r=>r.device)).size, (rows.filter(r=>r.missing).length/rows.length*100).toFixed(1)+'%',rows.filter(r=>r.temperature>31).length.toString()];
 }else{
  const lat=rows.map(r=>r.traceLatency).sort((a,b)=>a-b);
  vals=[rows.length.toLocaleString(),Math.round(lat[Math.floor(.5*(lat.length-1))])+' ms',Math.round(lat[Math.floor(.95*(lat.length-1))])+' ms',(rows.filter(r=>r.outcome==='Error').length/rows.length*100).toFixed(1)+'%'];
 }
 document.querySelectorAll('.metric-value').forEach((el,i)=>el.textContent=vals[i]??'—');
}
function svgLine(values,label){
 const w=520,h=190,p=24,max=Math.max(...values)*1.12||1,min=Math.min(0,...values),range=max-min||1;
 const pts=values.map((v,i)=>`${p+i*(w-2*p)/(values.length-1)},${h-p-(v-min)*(h-2*p)/range}`).join(' ');
 let grid='';for(let i=0;i<4;i++){let y=p+i*(h-2*p)/3;grid+=`<line x1="${p}" y1="${y}" x2="${w-p}" y2="${y}" stroke="#e9edf5" stroke-dasharray="4 5"/>`}
 return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}"><title>${label}</title>${grid}<polyline points="${pts}" fill="none" stroke="${accent}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${values.map((v,i)=>{let x=p+i*(w-2*p)/(values.length-1),y=h-p-(v-min)*(h-2*p)/range;return `<circle cx="${x}" cy="${y}" r="3.5" fill="${accent}"/>`}).join('')}<text x="${p}" y="${h-3}" font-size="10" fill="#78849a">Earlier</text><text x="${w-p}" y="${h-3}" text-anchor="end" font-size="10" fill="#78849a">Latest</text></svg>`;
}
function svgBars(items,label){
 const w=520,h=190,p=24,max=Math.max(...items.map(x=>x.v))*1.15||1,barW=(w-2*p)/items.length*.55;
 return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}"><title>${label}</title>${items.map((it,i)=>{let x=p+(i+.5)*(w-2*p)/items.length-barW/2,bh=(it.v/max)*(h-2*p),y=h-p-bh;return `<rect x="${x}" y="${y}" width="${barW}" height="${bh}" rx="5" fill="${accent}" opacity="${.65+(i%3)*.15}"/><text x="${x+barW/2}" y="${h-7}" text-anchor="middle" font-size="10" fill="#78849a">${it.k}</text>`}).join('')}</svg>`;
}
function renderCharts(rows){
 const vals=projectType==='api'?rows.map(r=>r.requests):projectType==='iot'?rows.map(r=>r.temperature):rows.map(r=>r.traceLatency);
 const vals2=projectType==='api'?rows.map(r=>r.latency):projectType==='iot'?rows.map(r=>r.humidity):rows.map(r=>r.traceLatency*.35);
 const groups={};rows.forEach(r=>{let k=projectType==='api'?r.endpoint:projectType==='iot'?r.device:r.service;groups[k]=(groups[k]||0)+(projectType==='api'?r.error?1:0:projectType==='iot'?1:r.traceLatency)});
 const bars=Object.entries(groups).sort((a,b)=>b[1]-a[1]).slice(0,7).map(([k,v])=>({k:k.replace('-service','').replace('/api/',''),v}));
 const titles=projectType==='api'?['Request volume over time','Latency over time','Errors / events by endpoint']:projectType==='iot'?['Temperature trend (°C)','Humidity trend (%)','Readings by device']:['Trace latency over time','Estimated service timing','Latency contribution by service'];
 $('chart1title').textContent=titles[0];$('chart2title').textContent=titles[1];$('chart3title').textContent=titles[2];
 $('chart1').innerHTML=svgLine(vals.slice(-40),titles[0]);$('chart2').innerHTML=svgLine(vals2.slice(-40),titles[1]);$('chart3').innerHTML=svgBars(bars,titles[2]);
}
function renderTable(rows){
 let entries=[];
 if(projectType==='api'){
  const groups={};rows.forEach(r=>{let g=groups[r.endpoint]??={name:r.endpoint,requests:0,errors:0,lat:[]};g.requests+=r.requests;g.errors+=r.error?1:0;g.lat.push(r.latency)});
  entries=Object.values(groups).map(g=>({...g,rate:g.errors/Math.max(1,rows.length)*100,p95:g.lat.sort((a,b)=>a-b)[Math.floor(.95*(g.lat.length-1))]})).sort((a,b)=>b.requests-a.requests).map(g=>[g.name,g.requests.toLocaleString(),g.rate.toFixed(2)+'%',Math.round(g.p95)+' ms',g.rate>3?'Review':'Healthy']);
 }else if(projectType==='iot'){
  const groups={};rows.forEach(r=>{let g=groups[r.device]??={name:r.device,n:0,missing:0,temp:[]};g.n++;g.missing+=r.missing?1:0;g.temp.push(r.temperature)});
  entries=Object.values(groups).map(g=>[g.name,g.n,(g.missing/Math.max(1,g.n)*100).toFixed(1)+'%',(g.temp.reduce((a,b)=>a+b,0)/g.temp.length).toFixed(1)+' °C',g.missing/g.n>.03?'Review':'Healthy']);
 }else{
  const groups={};rows.forEach(r=>{let g=groups[r.service]??={name:r.service,n:0,lat:[]};g.n++;g.lat.push(r.traceLatency)});
  entries=Object.values(groups).map(g=>[g.name,g.n,Math.round(g.lat.reduce((a,b)=>a+b,0)/g.lat.length)+' ms',(g.lat.filter(v=>v>400).length/g.n*100).toFixed(1)+'%',g.lat.some(v=>v>650)?'Review':'Healthy']);
 }
 $('tablehead').innerHTML='<tr>'+ (projectType==='api'?['Endpoint','Requests','Error rate','p95 latency','Status']:projectType==='iot'?['Device','Readings','Missing','Avg temperature','Status']:['Service','Spans','Avg trace latency','High-latency share','Status']).map(x=>`<th>${x}</th>`).join('')+'</tr>';
 $('tablebody').innerHTML=entries.map(row=>'<tr>'+row.map((x,i)=>i===row.length-1?`<td><span class="status ${x==='Review'?'warn':''}">${x}</span></td>`:`<td>${x}</td>`).join('')+'</tr>').join('');
}
function render(){const rows=rowsFiltered();setMetrics(rows);renderCharts(rows);renderTable(rows);$('rowslabel').textContent=`Showing ${rows.length} records · deterministic synthetic demo data`;}
setupFilters();render();
