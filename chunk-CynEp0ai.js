import{a as x,i as E}from"./main-ZCWXYDND.js";import{n as o}from"./chunk-Cvof6wl4.js";import{R as ct}from"./chunk-UEgcggNo.js";import{M as Wa,Q as qa,Y as mr,_ as Ma,f as Ia,it as za,m as Ks,n as Da,nt as va,x as Oa}from"./chunk-BvUMW1_4.js";import"./chunk-C_iToxIV.js";import{d as ft}from"./chunk-BeDZOGAg.js";import{t}from"./chunk-Bb2aY00R.js";import{j as m}from"./chunk-QxU_FBN4.js";import{n as a}from"./chunk-DBCkLcRI.js";var G=Ks.packet;var Y=class{constructor(){this.packet=[],this.setAccTitle=qa,this.getAccTitle=Ma,this.setDiagramTitle=za,this.getDiagramTitle=Wa,this.getAccDescription=Da,this.setAccDescription=Ia}static{o(this,`PacketDB`)}getConfig(){let t=ft(x(x({},G),mr().packet));return t.showBits&&(t.paddingY+=10),t}getPacket(){return this.packet}pushWord(t){t.length>0&&this.packet.push(t)}clear(){Oa(),this.packet=[]}};var H=1e4;var K=o((t$1,e)=>{t(t$1,e);let a=-1,o=[],s=1,{bitsPerRow:l}=e.getConfig();for(let{start:r,end:i,bits:d,label:h}of t$1.blocks){if(r!==void 0&&i!==void 0&&i<r)throw new Error(`Packet block ${r} - ${i} is invalid. End must be greater than start.`);if(r??=a+1,r!==a+1)throw new Error(`Packet block ${r} - ${i??r} is not contiguous. It should start from ${a+1}.`);if(d===0)throw new Error(`Packet block ${r} is invalid. Cannot have a zero bit field.`);for(i??=r+(d??1)-1,d??=i-r+1,a=i,ct.debug(`Packet block ${r} - ${a} with label ${h}`);o.length<=l+1&&e.getPacket().length<H;){let[c,p]=U({start:r,end:i,bits:d,label:h},s,l);if(o.push(c),c.end+1===s*l&&(e.pushWord(o),o=[],s++),!p)break;({start:r,end:i,bits:d,label:h}=p)}}e.pushWord(o)},`populate`);var U=o((t,e,a)=>{if(t.start===void 0)throw new Error(`start should have been set during first phase`);if(t.end===void 0)throw new Error(`end should have been set during first phase`);if(t.start>t.end)throw new Error(`Block start ${t.start} is greater than block end ${t.end}.`);if(t.end+1<=e*a)return[t,void 0];let o=e*a-1,s=e*a;return[{start:t.start,end:o,label:t.label,bits:o-t.start},{start:s,end:t.end,label:t.label,bits:t.end-s}]},`getNextFittingBlock`);var I={parser:{yy:void 0},parse:o(t=>E(null,null,function*(){let e=yield m(`packet`,t),a=I.parser?.yy;if(!(a instanceof Y))throw new Error(`parser.parser?.yy was not a PacketDB. This is due to a bug within Mermaid, please report this issue at https://github.com/mermaid-js/mermaid/issues.`);ct.debug(e),K(e,a)}),`parse`)};var X=o((t,e,a$1,o)=>{let s=o.db,l=s.getConfig(),{rowHeight:r,paddingY:i,bitWidth:d,bitsPerRow:h}=l,c=s.getPacket(),p=s.getDiagramTitle(),u=r+i,n=u*(c.length+1)-(p?0:r),f=d*h+2,k=a(e);k.attr(`viewBox`,`0 0 ${f} ${n}`),va(k,n,f,l.useMaxWidth);for(let[B,m]of c.entries())q(k,m,B,l);k.append(`text`).text(p).attr(`x`,f/2).attr(`y`,n-u/2).attr(`dominant-baseline`,`middle`).attr(`text-anchor`,`middle`).attr(`class`,`packetTitle`)},`draw`);var q=o((t,e,a,{rowHeight:o,paddingX:s,paddingY:l,bitWidth:r,bitsPerRow:i,showBits:d,bitOrder:h})=>{let c=t.append(`g`),p=a*(o+l)+l,u=h===`descending`;for(let n of e){let f=n.end-n.start+1,k=n.start%i,m=(u?i-k-f:k)*r+1,b=f*r-s;if(c.append(`rect`).attr(`x`,m).attr(`y`,p).attr(`width`,b).attr(`height`,o).attr(`class`,`packetBlock`),c.append(`text`).attr(`x`,m+b/2).attr(`y`,p+o/2).attr(`class`,`packetLabel`).attr(`dominant-baseline`,`middle`).attr(`text-anchor`,`middle`).text(n.label),!d)continue;let[O,j]=u?[n.end,n.start]:[n.start,n.end],w=f===1,$=p-2;c.append(`text`).attr(`x`,m+(w?b/2:0)).attr(`y`,$).attr(`class`,`packetByte start`).attr(`dominant-baseline`,`auto`).attr(`text-anchor`,w?`middle`:`start`).text(O),w||c.append(`text`).attr(`x`,m+b).attr(`y`,$).attr(`class`,`packetByte end`).attr(`dominant-baseline`,`auto`).attr(`text-anchor`,`end`).text(j)}},`drawWord`);var J={draw:X};var Q={byteFontSize:`10px`,startByteColor:`black`,endByteColor:`black`,labelColor:`black`,labelFontSize:`12px`,titleColor:`black`,titleFontSize:`14px`,blockStrokeColor:`black`,blockStrokeWidth:`1`,blockFillColor:`#efefef`};var it={parser:I,get db(){return new Y},renderer:J,styles:o(({packet:t}={})=>{let e=ft(Q,t);return`
	.packetByte {
		font-size: ${e.byteFontSize};
	}
	.packetByte.start {
		fill: ${e.startByteColor};
	}
	.packetByte.end {
		fill: ${e.endByteColor};
	}
	.packetLabel {
		fill: ${e.labelColor};
		font-size: ${e.labelFontSize};
	}
	.packetTitle {
		fill: ${e.titleColor};
		font-size: ${e.titleFontSize};
	}
	.packetBlock {
		stroke: ${e.blockStrokeColor};
		stroke-width: ${e.blockStrokeWidth};
		fill: ${e.blockFillColor};
	}
	`},`styles`)};export{it as diagram};
//# debugId=9ef9f2bf-8b4f-5848-9f12-86a056c957b9
//# sourceMappingURL=chunk-CynEp0ai.js.map