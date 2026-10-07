import{i as E}from"./main-ZCWXYDND.js";import{n as o}from"./chunk-Cvof6wl4.js";import{$ as ze,R as ct$1,d as Ic,t as $c}from"./chunk-UEgcggNo.js";import{M as Wa,Q as qa,_ as Ma,f as Ia,it as za,m as Ks,n as Da,nt as va,s as Ge,x as Oa}from"./chunk-BvUMW1_4.js";import"./chunk-C_iToxIV.js";import{b as yr,d as ft}from"./chunk-BeDZOGAg.js";import{t}from"./chunk-Bb2aY00R.js";import{j as m}from"./chunk-QxU_FBN4.js";import{n as a}from"./chunk-DBCkLcRI.js";var st=Ks.pie;var L={sections:new Map,showData:!1,config:st};var b=L.sections;var O=L.showData;var xt=structuredClone(st);var wt=o(()=>structuredClone(xt),`getConfig`);var Ct=o(()=>{b=new Map,O=L.showData,Oa()},`clear`);var $t=o(({label:t,value:a})=>{if(a<0)throw new Error(`"${t}" has invalid value: ${a}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);b.has(t)||(b.set(t,a),ct$1.debug(`added new section: ${t}, with value: ${a}`))},`addSection`);var Dt=o(()=>b,`getSections`);var yt=o(t=>{O=t},`setShowData`);var Tt=o(()=>O,`getShowData`);var ct={getConfig:wt,clear:Ct,setDiagramTitle:za,getDiagramTitle:Wa,setAccTitle:qa,getAccTitle:Ma,setAccDescription:Ia,getAccDescription:Da,addSection:$t,getSections:Dt,setShowData:yt,getShowData:Tt};var bt=o((t$1,a)=>{t(t$1,a),a.setShowData(t$1.showData),t$1.sections.map(a.addSection)},`populateDb`);var At={parse:o(t=>E(null,null,function*(){let a=yield m(`pie`,t);ct$1.debug(a),bt(a,ct)}),`parse`)};var _t=o(t=>`
  .pieCircle{
    stroke: ${t.pieStrokeColor};
    stroke-width : ${t.pieStrokeWidth};
    opacity : ${t.pieOpacity};
  }
  .pieCircle.highlighted{
    scale: 1.05;
    opacity: 1;
  }
  .pieCircle.highlightedOnHover:hover{
    transition-duration: 250ms;
    scale: 1.05;
    opacity: 1;
  }
  .pieOuterCircle{
    stroke: ${t.pieOuterStrokeColor};
    stroke-width: ${t.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${t.pieTitleTextSize};
    fill: ${t.pieTitleTextColor};
    font-family: ${t.fontFamily};
  }
  .slice {
    font-family: ${t.fontFamily};
    fill: ${t.pieSectionTextColor};
    font-size:${t.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${t.pieLegendTextColor};
    font-family: ${t.fontFamily};
    font-size: ${t.pieLegendTextSize};
  }
`,`getStyles`);var zt=o(t=>{let a=[...t.values()].reduce((n,m)=>n+m,0),W=[...t.entries()].map(([n,m])=>({label:n,value:m})).filter(n=>n.value/a*100>=1);return Ic().value(n=>n.value).sort(null)(W)},`createPieArcs`);var Nt={parser:At,db:ct,renderer:{draw:o((t,a$1,W,F)=>{ct$1.debug(`rendering pie chart
`+t);let n=F.db,m=Ge(),h=ft(n.getConfig(),m.pie),H=40,i=18,c=4,S=450,x=S,A=a(a$1),$=A.append(`g`);$.attr(`transform`,`translate(225,225)`);let{themeVariables:o}=m,[M]=yr(o.pieOuterStrokeWidth);M??=2;let dt=h.legendPosition,P=h.textPosition,gt=h.donutHole>0&&h.donutHole<=.9?h.donutHole:0,f=Math.min(x,S)/2-H,pt=$c().innerRadius(gt*f).outerRadius(f),ht=$c().innerRadius(f*P).outerRadius(f*P),w=$.append(`g`);w.append(`circle`).attr(`cx`,0).attr(`cy`,0).attr(`r`,f+M/2).attr(`class`,`pieOuterCircle`);let D=n.getSections(),ft$1=zt(D),ut=[o.pie1,o.pie2,o.pie3,o.pie4,o.pie5,o.pie6,o.pie7,o.pie8,o.pie9,o.pie10,o.pie11,o.pie12],k=0;D.forEach(e=>{k+=e});let G=ft$1.filter(e=>(e.data.value/k*100).toFixed(0)!==`0`),_=ze(ut).domain([...D.keys()]);w.selectAll(`mySlices`).data(G).enter().append(`path`).attr(`d`,pt).attr(`fill`,e=>_(e.data.label)).attr(`class`,e=>{let r=`pieCircle`;return h.highlightSlice===`hover`?r+=` highlightedOnHover`:h.highlightSlice===e.data.label&&(r+=` highlighted`),r}),w.selectAll(`mySlices`).data(G).enter().append(`text`).text(e=>(e.data.value/k*100).toFixed(0)+`%`).attr(`transform`,e=>`translate(`+ht.centroid(e)+`)`).style(`text-anchor`,`middle`).attr(`class`,`slice`);let mt=$.append(`text`).text(n.getDiagramTitle()).attr(`x`,0).attr(`y`,-200).attr(`class`,`pieTitleText`),C=[...D.entries()].map(([e,r])=>({label:e,value:r})),u=$.selectAll(`.legend`).data(C).enter().append(`g`).attr(`class`,`legend`);u.append(`rect`).attr(`width`,i).attr(`height`,i).style(`fill`,e=>_(e.label)).style(`stroke`,e=>_(e.label)),u.append(`text`).attr(`x`,22).attr(`y`,14).text(e=>n.getShowData()?`${e.label} [${e.value}]`:e.label);let v=Math.max(...u.selectAll(`text`).nodes().map(e=>e?.getBoundingClientRect().width??0)),y=S,z=490,s=22,E=C.length*s;switch(dt){case`center`:u.attr(`transform`,(e,r)=>{let d=s*C.length/2,g=-v/2-22,p=r*s-d;return`translate(`+g+`,`+p+`)`});break;case`top`:y+=E,u.attr(`transform`,(e,r)=>{let d=f;return`translate(${-v/2-22}, ${r*s-d})`}),w.attr(`transform`,()=>`translate(0, ${E+s})`);break;case`bottom`:y+=E,u.attr(`transform`,(e,r)=>{let d=-207,g=-v/2-22,p=r*s-d;return`translate(`+g+`,`+p+`)`});break;case`left`:z+=22+v,u.attr(`transform`,(e,r)=>{let d=s*C.length/2;return`translate(-207,`+(r*s-d)+`)`}),w.attr(`transform`,()=>`translate(${v+i+c}, 0)`);break;default:z+=22+v,u.attr(`transform`,(e,r)=>{let d=s*C.length/2;return`translate(216,`+(r*s-d)+`)`})}let B=mt.node()?.getBoundingClientRect().width??0,vt=x/2-B/2,St=x/2+B/2,N=Math.min(0,vt),I=Math.max(z,St)-N;A.attr(`viewBox`,`${N} 0 ${I} ${y}`),va(A,y,I,h.useMaxWidth)},`draw`)},styles:_t};export{Nt as diagram};
//# debugId=90e9deeb-1dc7-5120-a1a2-450062e9606c
//# sourceMappingURL=chunk-1vjD6nrY.js.map