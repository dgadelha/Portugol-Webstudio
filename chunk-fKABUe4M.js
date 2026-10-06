import{a as x$1,i as E}from"./main-KMK6A6YZ.js";import{n as o}from"./chunk-Cvof6wl4.js";import{R as ct$1}from"./chunk-CA__pNLu.js";import{C as Os,M as Wa,Q as qa,Y as mr,_ as Ma,f as Ia,it as za,m as Ks,n as Da,nt as va,x as Oa}from"./chunk-BYjSKBcW.js";import"./chunk-C8HUhTIH.js";import{d as ft$1}from"./chunk-DbrGsWAC.js";import{t}from"./chunk-Bb2aY00R.js";import{j as m}from"./chunk-BDQ6zSsI.js";import{n as a}from"./chunk-CoKBDiX3.js";var x={showLegend:!0,ticks:5,max:null,min:0,graticule:`circle`};var w=32;var G={axes:[],curves:[],options:x};var g=structuredClone(G);var K=Ks.radar;var N=o(()=>ft$1(x$1(x$1({},K),mr().radar)),`getConfig`);var B=o(()=>g.axes,`getAxes`);var Y=o(()=>g.curves,`getCurves`);var Z=o(()=>g.options,`getOptions`);var q=o(a=>{g.axes=a.map(t=>({name:t.name,label:t.label??t.name}))},`setAxes`);var J=o(a=>{g.curves=a.map(t=>({name:t.name,label:t.label??t.name,entries:Q(t.entries)}))},`setCurves`);var Q=o(a=>{if(a[0].axis==null)return a.map(e=>e.value);let t=B();if(t.length===0)throw new Error(`Axes must be populated before curves for reference entries`);return t.map(e=>{let r=a.find(n=>n.axis?.$refText===e.name);if(r===void 0)throw new Error(`Missing entry for axis `+e.label);return r.value})},`computeCurveEntries`);var $={getAxes:B,getCurves:Y,getOptions:Z,setAxes:q,setCurves:J,setOptions:o(a=>{let t=a.reduce((e,r)=>(e[r.name]=r,e),{});g.options={showLegend:t.showLegend?.value??x.showLegend,ticks:t.ticks?.value??x.ticks,max:t.max?.value??x.max,min:t.min?.value??x.min,graticule:t.graticule?.value??x.graticule},g.options.ticks>w&&(ct$1.warn(`Radar diagram ticks (${g.options.ticks}) exceeds maximum allowed (${w}). Using ${w} instead.`),g.options.ticks=w)},`setOptions`),getConfig:N,clear:o(()=>{Oa(),g=structuredClone(G)},`clear`),setAccTitle:qa,getAccTitle:Ma,setDiagramTitle:za,getDiagramTitle:Wa,getAccDescription:Da,setAccDescription:Ia};var at=o(a=>{t(a,$);let{axes:t$1,curves:e,options:r}=a;$.setAxes(t$1),$.setCurves(e),$.setOptions(r)},`populate`);var rt={parse:o(a=>E(null,null,function*(){let t=yield m(`radar`,a);ct$1.debug(t),at(t)}),`parse`)};var nt=o((a$1,t,e,r)=>{let n=r.db,l=n.getAxes(),c=n.getCurves(),s=n.getOptions(),o=n.getConfig(),d=n.getDiagramTitle(),u=st(a(t),o),m=s.max??Math.max(...c.map(f=>Math.max(...f.entries))),h=s.min,v=Math.min(o.width,o.height)/2;ot(u,l,v,s.ticks,s.graticule),it(u,l,v,o),W(u,l,c,h,m,s.graticule,o),j(u,c,s.showLegend,o),u.append(`text`).attr(`class`,`radarTitle`).text(d).attr(`x`,0).attr(`y`,-o.height/2-o.marginTop)},`draw`);var st=o((a,t)=>{let e=t.width+t.marginLeft+t.marginRight,r=t.height+t.marginTop+t.marginBottom,n={x:t.marginLeft+t.width/2,y:t.marginTop+t.height/2};return va(a,r,e,t.useMaxWidth??!0),a.attr(`viewBox`,`0 0 ${e} ${r}`).attr(`overflow`,`visible`),a.append(`g`).attr(`transform`,`translate(${n.x}, ${n.y})`)},`drawFrame`);var ot=o((a,t,e,r,n)=>{if(n===`circle`)for(let l=0;l<r;l++){let c=e*(l+1)/r;a.append(`circle`).attr(`r`,c).attr(`class`,`radarGraticule`)}else if(n===`polygon`){let l=t.length;for(let c=0;c<r;c++){let s=e*(c+1)/r,o=t.map((d,p)=>{let u=2*p*Math.PI/l-Math.PI/2;return`${s*Math.cos(u)},${s*Math.sin(u)}`}).join(` `);a.append(`polygon`).attr(`points`,o).attr(`class`,`radarGraticule`)}}},`drawGraticule`);var it=o((a,t,e,r)=>{let n=t.length;for(let l=0;l<n;l++){let c=t[l].label,s=2*l*Math.PI/n-Math.PI/2,o=Math.cos(s),d=Math.sin(s);a.append(`line`).attr(`x1`,0).attr(`y1`,0).attr(`x2`,e*r.axisScaleFactor*o).attr(`y2`,e*r.axisScaleFactor*d).attr(`class`,`radarAxisLine`);let p=o>.01?`start`:o<-.01?`end`:`middle`,u=d>.01?`hanging`:d<-.01?`auto`:`central`,m=4;a.append(`text`).text(c).attr(`x`,e*r.axisLabelFactor*o+m*o).attr(`y`,e*r.axisLabelFactor*d+m*d).attr(`text-anchor`,p).attr(`dominant-baseline`,u).attr(`class`,`radarAxisLabel`)}},`drawAxes`);function W(a,t,e,r,n,l,c){let s=t.length,o=Math.min(c.width,c.height)/2;e.forEach((d,p)=>{if(d.entries.length!==s)return;let u=d.entries.map((m,h)=>{let v=2*Math.PI*h/s-Math.PI/2,f=V(m,r,n,o);return{x:f*Math.cos(v),y:f*Math.sin(v)}});l===`circle`?a.append(`path`).attr(`d`,H(u,c.curveTension)).attr(`class`,`radarCurve-${p}`):l===`polygon`&&a.append(`polygon`).attr(`points`,u.map(m=>`${m.x},${m.y}`).join(` `)).attr(`class`,`radarCurve-${p}`)})}o(W,`drawCurves`);function V(a,t,e,r){return r*(Math.min(Math.max(a,t),e)-t)/(e-t)}o(V,`relativeRadius`);function H(a,t){let e=a.length,r=`M${a[0].x},${a[0].y}`;for(let n=0;n<e;n++){let l=a[(n-1+e)%e],c=a[n],s=a[(n+1)%e],o=a[(n+2)%e],d={x:c.x+(s.x-l.x)*t,y:c.y+(s.y-l.y)*t},p={x:s.x-(o.x-c.x)*t,y:s.y-(o.y-c.y)*t};r+=` C${d.x},${d.y} ${p.x},${p.y} ${s.x},${s.y}`}return`${r} Z`}o(H,`closedRoundCurve`);function j(a,t,e,r){if(!e)return;let n=(r.width/2+r.marginRight)*3/4,l=-(r.height/2+r.marginTop)*3/4,c=20;t.forEach((s,o)=>{let d=a.append(`g`).attr(`transform`,`translate(${n}, ${l+o*c})`);d.append(`rect`).attr(`width`,12).attr(`height`,12).attr(`class`,`radarLegendBox-${o}`),d.append(`text`).attr(`x`,16).attr(`y`,0).attr(`class`,`radarLegendText`).text(s.label)})}o(j,`drawLegend`);var lt={draw:nt};var ct=o((a,t)=>{let e=``;for(let r=0;r<a.THEME_COLOR_LIMIT;r++){let n=a[`cScale${r}`];e+=`
		.radarCurve-${r} {
			color: ${n};
			fill: ${n};
			fill-opacity: ${t.curveOpacity};
			stroke: ${n};
			stroke-width: ${t.curveStrokeWidth};
		}
		.radarLegendBox-${r} {
			fill: ${n};
			fill-opacity: ${t.curveOpacity};
			stroke: ${n};
		}
		`}return e},`genIndexStyles`);var dt=o(a=>{let t=Os(),e=mr(),r=ft$1(t,e.themeVariables);return{themeVariables:r,radarOptions:ft$1(r.radar,a)}},`buildRadarStyleOptions`);var ft={parser:rt,db:$,renderer:lt,styles:o(({radar:a}={})=>{let{themeVariables:t,radarOptions:e}=dt(a);return`
	.radarTitle {
		font-size: ${t.fontSize};
		color: ${t.titleColor};
		dominant-baseline: hanging;
		text-anchor: middle;
	}
	.radarAxisLine {
		stroke: ${e.axisColor};
		stroke-width: ${e.axisStrokeWidth};
	}
	.radarAxisLabel {
		font-size: ${e.axisLabelFontSize}px;
		color: ${e.axisColor};
	}
	.radarGraticule {
		fill: ${e.graticuleColor};
		fill-opacity: ${e.graticuleOpacity};
		stroke: ${e.graticuleColor};
		stroke-width: ${e.graticuleStrokeWidth};
	}
	.radarLegendText {
		text-anchor: start;
		font-size: ${e.legendFontSize}px;
		dominant-baseline: hanging;
	}
	${ct(t,e)}
	`},`styles`)};export{ft as diagram};
//# debugId=0b03d18f-fa63-549c-be74-2c141879e668
//# sourceMappingURL=chunk-fKABUe4M.js.map