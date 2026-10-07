import{a as x,i as E}from"./main-ZCWXYDND.js";import{n as o}from"./chunk-Cvof6wl4.js";import{R as ct}from"./chunk-UEgcggNo.js";import{C as Os,M as Wa,Q as qa,Y as mr,_ as Ma,f as Ia,it as za,m as Ks,n as Da,nt as va,x as Oa}from"./chunk-BvUMW1_4.js";import"./chunk-C_iToxIV.js";import{d as ft}from"./chunk-BeDZOGAg.js";import{t}from"./chunk-Bb2aY00R.js";import{j as m}from"./chunk-QxU_FBN4.js";import{n as a}from"./chunk-DBCkLcRI.js";var $t=o(()=>({domains:new Map,transitions:[]}),`createDefaultData`);var G=$t();var j={getDomains:o(()=>G.domains,`getDomains`),getTransitions:o(()=>G.transitions,`getTransitions`),setDomains:o(t=>{if(t)for(let e of t){let n=e.domain,o=(e.items??[]).map(c=>({label:c.label}));G.domains.set(n,{name:n,items:o})}},`setDomains`),setTransitions:o(t=>{t&&(G.transitions=t.filter(e=>e.from===e.to?(ct.warn(`Cynefin: self-loop transition on domain "${e.from}" is not meaningful and will be skipped.`),!1):!0).map(e=>({from:e.from,to:e.to,label:e.label||void 0})))},`setTransitions`),getConfig:o(()=>ft(x(x({},Ks.cynefin),mr().cynefin)),`getConfig`),clear:o(()=>{Oa(),G=$t()},`clear`),setAccTitle:qa,getAccTitle:Ma,setDiagramTitle:za,getDiagramTitle:Wa,getAccDescription:Da,setAccDescription:Ia};var Rt=o(t$1=>{t(t$1,j),j.setDomains(t$1.domains),j.setTransitions(t$1.transitions)},`populate`);var Ft={parse:o(t=>E(null,null,function*(){let e=yield m(`cynefin`,t);ct.debug(e),Rt(e)}),`parse`)};function H(t){let e=t+1831565813|0;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}o(H,`seededRandom`);function bt(t){let e=0;for(let n=0;n<t.length;n++){let o=t.charCodeAt(n);e=(e<<5)-e+o,e|=0}return e}o(bt,`hashString`);function wt(t,e){return typeof t==`number`&&Number.isFinite(t)&&t!==0?t:bt(e)}o(wt,`resolveSeed`);function Ct(t,e,n,o){let c=t/2,m=o??t*.015,v=7,W=e/v,d=[];for(let a=0;a<=v;a++){let p=H(n+a*17)*m*2-m;d.push({x:c+p,y:a*W})}let D=`M${d[0].x},${d[0].y}`;for(let a=0;a<d.length-1;a++){let p=d[a],s=d[a+1],f=(p.y+s.y)/2,b=a%2===0?1:-1,h=m*1.5*b*H(n+a*31+7),R=p.x+h,F=f,V=s.x-h;D+=` C${R},${F} ${V},${f} ${s.x},${s.y}`}return D}o(Ct,`generateFoldPath`);function vt(t,e,n,o){let c=e/2,m=o??e*.015,v=7,W=t/v,d=[];for(let a=0;a<=v;a++){let p=H(n+a*23)*m*2-m;d.push({x:a*W,y:c+p})}let D=`M${d[0].x},${d[0].y}`;for(let a=0;a<d.length-1;a++){let p=d[a],s=d[a+1],f=(p.x+s.x)/2,b=a%2===0?1:-1,h=m*1.5*b*H(n+a*37+11),R=f,F=p.y+h,V=f,z=s.y-h;D+=` C${R},${F} ${V},${z} ${s.x},${s.y}`}return D}o(vt,`generateHorizontalBoundary`);function Dt(t,e){let n=t/2,o=e*.5,c=e,m=t*.03;return[`M${n},${o}`,`C${n+m},${o+(c-o)*.2}`,`${n-m*1.5},${o+(c-o)*.55}`,`${n+m*.5},${o+(c-o)*.75}`,`C${n-m},${o+(c-o)*.85}`,`${n+m*.3},${o+(c-o)*.95}`,`${n},${c}`].join(` `)}o(Dt,`generateCliffPath`);function kt(t,e,n,o){return[`M${t-n},${e}`,`A${n},${o} 0 1,1 ${t+n},${e}`,`A${n},${o} 0 1,1 ${t-n},${e}`,`Z`].join(` `)}o(kt,`generateConfusionPath`);var gt={complex:{model:`Probe → Sense → Respond`,practice:`Emergent Practices`},complicated:{model:`Sense → Analyse → Respond`,practice:`Good Practices`},clear:{model:`Sense → Categorise → Respond`,practice:`Best Practices`},chaotic:{model:`Act → Sense → Respond`,practice:`Novel Practices`},confusion:{model:``,practice:`Disorder`}};var Vt=o((t,e)=>{let n=t/2,o=e/2;return{complex:{cx:n/2,cy:o/2,x:0,y:0,w:n,h:o},complicated:{cx:n+n/2,cy:o/2,x:n,y:0,w:n,h:o},chaotic:{cx:n/2,cy:o+o/2,x:0,y:o,w:n,h:o},clear:{cx:n+n/2,cy:o+o/2,x:n,y:o,w:n,h:o},confusion:{cx:n,cy:o,x:n*.7,y:o*.7,w:n*.6,h:o*.6}}},`getDomainLayouts`);var _t=o(()=>{let t=Os(),e=mr();return ft(t,e.themeVariables).cynefin},`getCynefinDomainColors`);var J=3;var Ht={draw:o((t,e,n,o)=>{let c=o.db,m=c.getDomains(),v=c.getTransitions(),W=c.getDiagramTitle(),d=c.getAccTitle(),D=c.getAccDescription(),a$1=c.getConfig(),p=_t();ct.debug(`Rendering Cynefin diagram`);let s=a$1.width,f=a$1.height,b=a$1.padding,h=a$1.showDomainDescriptions,R=a$1.boundaryAmplitude,F=s+b*2,V=f+b*2,z={complex:p.complexBg,complicated:p.complicatedBg,clear:p.clearBg,chaotic:p.chaoticBg,confusion:p.confusionBg},k=a(e);va(k,V,F,a$1.useMaxWidth??!0),k.attr(`viewBox`,`0 0 ${F} ${V}`),d&&k.append(`title`).text(d),D&&k.append(`desc`).text(D);let T=k.append(`g`).attr(`transform`,`translate(${b}, ${b})`),_=Vt(s,f),K=wt(a$1.seed,e),Tt=T.append(`g`).attr(`class`,`cynefin-backgrounds`),q=[`complex`,`complicated`,`chaotic`,`clear`];for(let l of q){let i=_[l];Tt.append(`rect`).attr(`class`,`cynefinDomain`).attr(`x`,i.x).attr(`y`,i.y).attr(`width`,i.w).attr(`height`,i.h).attr(`fill`,z[l]).attr(`fill-opacity`,.4).attr(`stroke`,`none`)}let U=T.append(`g`).attr(`class`,`cynefin-boundaries`);U.append(`path`).attr(`class`,`cynefinBoundary`).attr(`d`,Ct(s,f,K,R)).attr(`fill`,`none`),U.append(`path`).attr(`class`,`cynefinBoundary`).attr(`d`,vt(s,f,K+100,R)).attr(`fill`,`none`),U.append(`path`).attr(`class`,`cynefinCliff`).attr(`d`,Dt(s,f)).attr(`fill`,`none`);let At=s*.15,Bt=f*.15;T.append(`path`).attr(`class`,`cynefinConfusion`).attr(`d`,kt(s/2,f/2,At,Bt)).attr(`fill`,z.confusion).attr(`fill-opacity`,.5);let tt=T.append(`g`).attr(`class`,`cynefin-labels`);for(let l of q){let i=_[l];tt.append(`text`).attr(`class`,`cynefinDomainLabel`).attr(`x`,i.cx).attr(`y`,h?i.cy-30:i.cy).attr(`text-anchor`,`middle`).attr(`dominant-baseline`,`middle`).text(l.charAt(0).toUpperCase()+l.slice(1))}if(tt.append(`text`).attr(`class`,`cynefinDomainLabel`).attr(`x`,s/2).attr(`y`,h?f/2-10:f/2).attr(`text-anchor`,`middle`).attr(`dominant-baseline`,`middle`).text(`Confusion`),h){let l=T.append(`g`).attr(`class`,`cynefin-subtitles`);for(let i of q){let u=_[i],y=gt[i];l.append(`text`).attr(`class`,`cynefinSubtitle`).attr(`x`,u.cx).attr(`y`,u.cy-10).attr(`text-anchor`,`middle`).attr(`dominant-baseline`,`middle`).text(y.model),l.append(`text`).attr(`class`,`cynefinSubtitle`).attr(`x`,u.cx).attr(`y`,u.cy+5).attr(`text-anchor`,`middle`).attr(`dominant-baseline`,`middle`).text(y.practice)}l.append(`text`).attr(`class`,`cynefinSubtitle`).attr(`x`,s/2).attr(`y`,f/2+8).attr(`text-anchor`,`middle`).attr(`dominant-baseline`,`middle`).text(gt.confusion.practice)}let et=T.append(`g`).attr(`class`,`cynefin-items`),A=26;for(let l of[`complex`,`complicated`,`chaotic`,`clear`,`confusion`]){let i=m.get(l);if(!i||i.items.length===0)continue;let u=_[l],y=l===`confusion`,L=i.items,N=0;y&&i.items.length>J&&(N=i.items.length-J,L=i.items.slice(0,J));let B;if(y){let g=h?22:14;B=u.cy+g}else B=u.cy+(h?25:15);if([...L].forEach((g,S)=>{let w=B+S*30,M=et.append(`g`),P=M.append(`text`).attr(`class`,`cynefinItemText`).attr(`x`,0).attr(`y`,A/2).attr(`text-anchor`,`middle`).attr(`dominant-baseline`,`central`).text(g.label),$=g.label.length*7,x=P.node();if(x&&typeof x.getBBox==`function`){let Y=x.getBBox();Y.width>0&&($=Y.width)}let C=$+20,I=u.cx-C/2;M.attr(`transform`,`translate(${I}, ${w})`),M.insert(`rect`,`text`).attr(`class`,`cynefinItem`).attr(`x`,0).attr(`y`,0).attr(`width`,C).attr(`height`,A).attr(`rx`,4).attr(`ry`,4).attr(`fill`,z[l]).attr(`fill-opacity`,.95),P.attr(`x`,C/2).attr(`y`,A/2)}),N>0){let g=B+L.length*30,S=`+${N} more`,w=et.append(`g`),M=w.append(`text`).attr(`class`,`cynefinItemText`).attr(`x`,0).attr(`y`,A/2).attr(`text-anchor`,`middle`).attr(`dominant-baseline`,`central`).text(S),P=S.length*7,$=M.node();if($&&typeof $.getBBox==`function`){let I=$.getBBox();I.width>0&&(P=I.width)}let x=P+20,C=u.cx-x/2;w.attr(`transform`,`translate(${C}, ${g})`),w.insert(`rect`,`text`).attr(`class`,`cynefinItemOverflow`).attr(`x`,0).attr(`y`,0).attr(`width`,x).attr(`height`,A).attr(`rx`,4).attr(`ry`,4).attr(`fill`,z[l]).attr(`fill-opacity`,.6),M.attr(`x`,x/2).attr(`y`,A/2)}}if(v.length>0){let l=k.select(`defs`).empty()?k.append(`defs`):k.select(`defs`),i=`cynefin-arrow-${e}`;l.append(`marker`).attr(`id`,i).attr(`viewBox`,`0 0 10 10`).attr(`refX`,9).attr(`refY`,5).attr(`markerWidth`,6).attr(`markerHeight`,6).attr(`orient`,`auto-start-reverse`).append(`path`).attr(`d`,`M 0 0 L 10 5 L 0 10 z`).attr(`class`,`cynefinArrowHead`);let u=T.append(`g`).attr(`class`,`cynefin-arrows`);v.forEach(y=>{let L=_[y.from],N=_[y.to];if(!L||!N)return;if(y.from===y.to){ct.warn(`Cynefin renderer: skipping self-loop on domain "${y.from}"`);return}let B=L.cx,g=L.cy,S=N.cx,w=N.cy,M=(B+S)/2,P=(g+w)/2,$=S-B,x=w-g,C=Math.sqrt($*$+x*x),I=C*.15,Y=-x/C,Mt=$/C,ot=M+Y*I,at=P+Mt*I;u.append(`path`).attr(`class`,`cynefinArrowLine`).attr(`d`,`M${B},${g} Q${ot},${at} ${S},${w}`).attr(`fill`,`none`).attr(`marker-end`,`url(#${i})`),y.label&&u.append(`text`).attr(`class`,`cynefinArrowLabel`).attr(`x`,ot).attr(`y`,at-6).attr(`text-anchor`,`middle`).attr(`dominant-baseline`,`auto`).text(y.label)})}W&&T.append(`text`).attr(`class`,`cynefinTitle`).attr(`x`,s/2).attr(`y`,-b/2).attr(`text-anchor`,`middle`).attr(`dominant-baseline`,`middle`).text(W)},`draw`)};var Gt=o(()=>{let t=Os(),e=mr();return ft(t,e.themeVariables).cynefin},`getCynefinTheme`);var Kt={parser:Ft,db:j,renderer:Ht,styles:o(()=>{let t=Gt();return`
	.cynefinDomain {
		stroke: none;
	}
	.cynefinDomainLabel {
		font-size: ${t.domainFontSize}px;
		font-weight: bold;
		fill: ${t.labelColor};
	}
	.cynefinSubtitle {
		font-size: ${t.itemFontSize-1}px;
		fill: ${t.textColor};
		font-style: italic;
	}
	.cynefinItem {
		fill-opacity: 0.95;
		stroke: ${t.boundaryColor};
		stroke-width: 1;
	}
	.cynefinItemText {
		font-size: ${t.itemFontSize}px;
		fill: ${t.textColor};
	}
	.cynefinItemOverflow {
		fill-opacity: 0.6;
		stroke: ${t.boundaryColor};
		stroke-width: 1;
		stroke-dasharray: 3 2;
	}
	.cynefinBoundary {
		stroke: ${t.boundaryColor};
		stroke-width: ${t.boundaryWidth};
		stroke-dasharray: 6 3;
	}
	.cynefinCliff {
		stroke: ${t.cliffColor};
		stroke-width: ${t.cliffWidth};
	}
	.cynefinConfusion {
		stroke: ${t.boundaryColor};
		stroke-width: 1.5;
		stroke-dasharray: 4 2;
	}
	.cynefinArrowLine {
		stroke: ${t.arrowColor};
		stroke-width: ${t.arrowWidth};
		fill: none;
	}
	.cynefinArrowHead {
		fill: ${t.arrowColor};
		stroke: none;
	}
	.cynefinArrowLabel {
		font-size: ${t.itemFontSize-1}px;
		fill: ${t.textColor};
	}
	.cynefinTitle {
		font-size: ${t.domainFontSize+2}px;
		font-weight: bold;
		fill: ${t.labelColor};
	}
	`},`styles`)};export{Kt as diagram};
//# debugId=a77a5cbe-5caf-5dba-a429-b76855f36ab7
//# sourceMappingURL=chunk-D2mLO1FF.js.map