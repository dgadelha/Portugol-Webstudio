import{n as B,r as C}from"./main-2TDMAIPG.js";import{n as o}from"./chunk-Cvof6wl4.js";import{B as ga,F as be,H as li$1,I as bt,J as va,L as ci$1,N as _a,R as ct$1,U as mu,V as ge,W as pf,X as ya,Y as ve,Z as ye,_ as On,a as Cf,et as zr,k as Xa,n as $t,o as Dt$1,p as Jt$1,q as ui$1,y as Pt,z as du}from"./chunk-BkbPehHZ.js";import{A as Uh,M as Wa,Q as qa,_ as Ma,f as Ia,it as za,n as Da,nt as va$1,s as Ge$1,x as Oa}from"./chunk-BK62kYTb.js";import{t as v}from"./chunk-DqQya4TT.js";import{h as pi$1}from"./chunk-1s6DS1a-.js";var $e=B((Wt,Vt)=>{"use strict";(function(t,e){typeof Wt==`object`&&typeof Vt<`u`?Vt.exports=e():typeof define==`function`&&define.amd?define(e):(t=typeof globalThis<`u`?globalThis:t||self).dayjs_plugin_isoWeek=e()})(Wt,(function(){"use strict";var t=`day`;return function(e,r,s){var n=function(_){return _.add(4-_.isoWeekday(),t)},f=r.prototype;f.isoWeekYear=function(){return n(this).year()},f.isoWeek=function(_){if(!this.$utils().u(_))return this.add(7*(_-this.isoWeek()),t);var D,R,Y,V,P=n(this),H=(D=this.isoWeekYear(),R=this.$u,Y=(R?s.utc:s)().year(D).startOf(`year`),V=4-Y.isoWeekday(),Y.isoWeekday()>4&&(V+=7),Y.add(V,t));return P.diff(H,`week`)+1},f.isoWeekday=function(_){return this.$utils().u(_)?this.day()||7:this.day(this.day()%7?_:_-7)};var y=f.startOf;f.startOf=function(_,D){var R=this.$utils(),Y=!!R.u(D)||D;return R.p(_)===`isoweek`?Y?this.date(this.date()-(this.isoWeekday()-1)).startOf(`day`):this.date(this.date()-1-(this.isoWeekday()-1)+7).endOf(`day`):y.bind(this)(_,D)}}}))});var Le=B((Pt,zt)=>{"use strict";(function(t,e){typeof Pt==`object`&&typeof zt<`u`?zt.exports=e():typeof define==`function`&&define.amd?define(e):(t=typeof globalThis<`u`?globalThis:t||self).dayjs_plugin_customParseFormat=e()})(Pt,(function(){"use strict";var t={LTS:`h:mm:ss A`,LT:`h:mm A`,L:`MM/DD/YYYY`,LL:`MMMM D, YYYY`,LLL:`MMMM D, YYYY h:mm A`,LLLL:`dddd, MMMM D, YYYY h:mm A`},e=/(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|Q|YYYY|YY?|ww?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g,r=/\d/,s=/\d\d/,n=/\d\d?/,f=/\d*[^-_:/,()\s\d]+/,y={},_=function(b){return(b=+b)+(b>68?1900:2e3)},D=function(b){return function(w){this[b]=+w}},R=[/[+-]\d\d:?(\d\d)?|Z/,function(b){(this.zone||(this.zone={})).offset=(function(w){if(!w||w===`Z`)return 0;var x=w.match(/([+-]|\d\d)/g),A=60*x[1]+(+x[2]||0);return A===0?0:x[0]===`+`?-A:A})(b)}],Y=function(b){var w=y[b];return w&&(w.indexOf?w:w.s.concat(w.f))},V=function(b,w){var x,A=y.meridiem;if(A){for(var U=1;U<=24;U+=1)if(b.indexOf(A(U,0,w))>-1){x=U>12;break}}else x=b===(w?`pm`:`PM`);return x},P={A:[f,function(b){this.afternoon=V(b,!1)}],a:[f,function(b){this.afternoon=V(b,!0)}],Q:[r,function(b){this.month=3*(b-1)+1}],S:[r,function(b){this.milliseconds=100*+b}],SS:[s,function(b){this.milliseconds=10*+b}],SSS:[/\d{3}/,function(b){this.milliseconds=+b}],s:[n,D(`seconds`)],ss:[n,D(`seconds`)],m:[n,D(`minutes`)],mm:[n,D(`minutes`)],H:[n,D(`hours`)],h:[n,D(`hours`)],HH:[n,D(`hours`)],hh:[n,D(`hours`)],D:[n,D(`day`)],DD:[s,D(`day`)],Do:[f,function(b){var w=y.ordinal,x=b.match(/\d+/);if(this.day=x[0],w)for(var A=1;A<=31;A+=1)w(A).replace(/\[|\]/g,``)===b&&(this.day=A)}],w:[n,D(`week`)],ww:[s,D(`week`)],M:[n,D(`month`)],MM:[s,D(`month`)],MMM:[f,function(b){var w=Y(`months`),x=(Y(`monthsShort`)||w.map((function(A){return A.slice(0,3)}))).indexOf(b)+1;if(x<1)throw new Error;this.month=x%12||x}],MMMM:[f,function(b){var w=Y(`months`).indexOf(b)+1;if(w<1)throw new Error;this.month=w%12||w}],Y:[/[+-]?\d+/,D(`year`)],YY:[s,function(b){this.year=_(b)}],YYYY:[/\d{4}/,D(`year`)],Z:R,ZZ:R};function H(b){var w=b,x=y&&y.formats;for(var A=(b=w.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,(function(W,F,k){var p=k&&k.toUpperCase();return F||x[k]||t[k]||x[p].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,(function(v,T,a){return T||a.slice(1)}))}))).match(e),U=A.length,X=0;X<U;X+=1){var $=A[X],g=P[$],m=g&&g[0],I=g&&g[1];A[X]=I?{regex:m,parser:I}:$.replace(/^\[|\]$/g,``)}return function(W){for(var F={},k=0,p=0;k<U;k+=1){var v=A[k];if(typeof v==`string`)p+=v.length;else{var T=v.regex,a=v.parser,h=W.slice(p),d=T.exec(h)[0];a.call(F,d),W=W.replace(d,``)}}return(function(u){var C=u.afternoon;if(C!==void 0){var i=u.hours;C?i<12&&(u.hours+=12):i===12&&(u.hours=0),delete u.afternoon}})(F),F}}return function(b,w,x){x.p.customParseFormat=!0,b&&b.parseTwoDigitYear&&(_=b.parseTwoDigitYear);var A=w.prototype,U=A.parse;A.parse=function(X){var $=X.date,g=X.utc,m=X.args;this.$u=g;var I=m[1];if(typeof I==`string`){var W=m[2]===!0,F=m[3]===!0,k=W||F,p=m[2];F&&(p=m[2]),y=this.$locale(),!W&&p&&(y=x.Ls[p]),this.$d=(function(h,d,u,C){try{if([`x`,`X`].indexOf(d)>-1)return new Date((d===`X`?1e3:1)*h);var i=H(d)(h),M=i.year,c=i.month,j=i.day,o=i.hours,S=i.minutes,E=i.seconds,z=i.milliseconds,N=i.zone,L=i.week,O=new Date,et=j||(M||c?1:O.getDate()),it=M||O.getFullYear(),lt=0;M&&!c||(lt=c>0?c-1:O.getMonth());var ut,dt=o||0,B=S||0,rt=E||0,K=z||0;return N?new Date(Date.UTC(it,lt,et,dt,B,rt,K+60*N.offset*1e3)):u?new Date(Date.UTC(it,lt,et,dt,B,rt,K)):(ut=new Date(it,lt,et,dt,B,rt,K),L&&(ut=C(ut).week(L).toDate()),ut)}catch(q){return new Date(``)}})($,I,g,x),this.init(),p&&p!==!0&&(this.$L=this.locale(p).$L),k&&$!=this.format(I)&&(this.$d=new Date(``)),y={}}else if(I instanceof Array)for(var v=I.length,T=1;T<=v;T+=1){m[1]=I[T-1];var a=x.apply(this,m);if(a.isValid()){this.$d=a.$d,this.$L=a.$L,this.init();break}T===v&&(this.$d=new Date(``))}else U.call(this,X)}}}))});var Ae=B((Nt,Rt)=>{"use strict";(function(t,e){typeof Nt==`object`&&typeof Rt<`u`?Rt.exports=e():typeof define==`function`&&define.amd?define(e):(t=typeof globalThis<`u`?globalThis:t||self).dayjs_plugin_advancedFormat=e()})(Nt,(function(){"use strict";return function(t,e){var r=e.prototype,s=r.format;r.format=function(n){var f=this,y=this.$locale();if(!this.isValid())return s.bind(this)(n);var _=this.$utils(),D=(n||`YYYY-MM-DDTHH:mm:ssZ`).replace(/\[([^\]]+)]|Q|wo|ww|w|WW|W|zzz|z|gggg|GGGG|Do|X|x|k{1,2}|S/g,(function(R){switch(R){case`Q`:return Math.ceil((f.$M+1)/3);case`Do`:return y.ordinal(f.$D);case`gggg`:return f.weekYear();case`GGGG`:return f.isoWeekYear();case`wo`:return y.ordinal(f.week(),`W`);case`w`:case`ww`:return _.s(f.week(),R===`w`?1:2,`0`);case`W`:case`WW`:return _.s(f.isoWeek(),R===`W`?1:2,`0`);case`k`:case`kk`:return _.s(String(f.$H===0?24:f.$H),R===`k`?1:2,`0`);case`X`:return Math.floor(f.$d.getTime()/1e3);case`x`:return f.$d.getTime();case`z`:return`[`+f.offsetName()+`]`;case`zzz`:return`[`+f.offsetName(`long`)+`]`;default:return R}}));return s.bind(this)(D)}}}))});var Fe=B((Ht,jt)=>{"use strict";(function(t,e){typeof Ht==`object`&&typeof jt<`u`?jt.exports=e():typeof define==`function`&&define.amd?define(e):(t=typeof globalThis<`u`?globalThis:t||self).dayjs_plugin_duration=e()})(Ht,(function(){"use strict";var t,e,r=1e3,s=6e4,n=36e5,f=864e5,y=31536e6,_=2628e6,D=/^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/,R=/\[([^\]]+)]|YYYY|YY|Y|M{1,2}|D{1,2}|H{1,2}|m{1,2}|s{1,2}|SSS/g,Y={years:y,months:_,days:f,hours:n,minutes:s,seconds:r,milliseconds:1,weeks:6048e5},V=function($){return $ instanceof U},P=function($,g,m){return new U($,m,g.$l)},H=function($){return e.p($)+`s`},b=function($){return $<0},w=function($){return b($)?Math.ceil($):Math.floor($)},x=function($){return Math.abs($)},A=function($,g){return $?b($)?{negative:!0,format:``+x($)+g}:{negative:!1,format:``+$+g}:{negative:!1,format:``}},U=(function(){function $(m,I,W){var F=this;if(this.$d={},this.$l=W,m===void 0&&(this.$ms=0,this.parseFromMilliseconds()),I)return P(m*Y[H(I)],this);if(typeof m==`number`)return this.$ms=m,this.parseFromMilliseconds(),this;if(typeof m==`object`)return Object.keys(m).forEach((function(v){F.$d[H(v)]=m[v]})),this.calMilliseconds(),this;if(typeof m==`string`){var k=m.match(D);if(k){var p=k.slice(2).map((function(v){return v!=null?Number(v):0}));return this.$d.years=p[0],this.$d.months=p[1],this.$d.weeks=p[2],this.$d.days=p[3],this.$d.hours=p[4],this.$d.minutes=p[5],this.$d.seconds=p[6],this.calMilliseconds(),this}}return this}var g=$.prototype;return g.calMilliseconds=function(){var m=this;this.$ms=Object.keys(this.$d).reduce((function(I,W){return I+(m.$d[W]||0)*Y[W]}),0)},g.parseFromMilliseconds=function(){var m=this.$ms;this.$d.years=w(m/y),m%=y,this.$d.months=w(m/_),m%=_,this.$d.days=w(m/f),m%=f,this.$d.hours=w(m/n),m%=n,this.$d.minutes=w(m/s),m%=s,this.$d.seconds=w(m/r),m%=r,this.$d.milliseconds=m},g.toISOString=function(){var m=A(this.$d.years,`Y`),I=A(this.$d.months,`M`),W=+this.$d.days||0;this.$d.weeks&&(W+=7*this.$d.weeks);var F=A(W,`D`),k=A(this.$d.hours,`H`),p=A(this.$d.minutes,`M`),v=this.$d.seconds||0;this.$d.milliseconds&&(v+=this.$d.milliseconds/1e3,v=Math.round(1e3*v)/1e3);var T=A(v,`S`),a=m.negative||I.negative||F.negative||k.negative||p.negative||T.negative,h=k.format||p.format||T.format?`T`:``,d=(a?`-`:``)+`P`+m.format+I.format+F.format+h+k.format+p.format+T.format;return d===`P`||d===`-P`?`P0D`:d},g.toJSON=function(){return this.toISOString()},g.format=function(m){var I=m||`YYYY-MM-DDTHH:mm:ss`,W={Y:this.$d.years,YY:e.s(this.$d.years,2,`0`),YYYY:e.s(this.$d.years,4,`0`),M:this.$d.months,MM:e.s(this.$d.months,2,`0`),D:this.$d.days,DD:e.s(this.$d.days,2,`0`),H:this.$d.hours,HH:e.s(this.$d.hours,2,`0`),m:this.$d.minutes,mm:e.s(this.$d.minutes,2,`0`),s:this.$d.seconds,ss:e.s(this.$d.seconds,2,`0`),SSS:e.s(this.$d.milliseconds,3,`0`)};return I.replace(R,(function(F,k){return k||String(W[F])}))},g.as=function(m){return this.$ms/Y[H(m)]},g.get=function(m){var I=this.$ms,W=H(m);return W===`milliseconds`?I%=1e3:I=W===`weeks`?w(I/Y[W]):this.$d[W],I||0},g.add=function(m,I,W){var F=I?m*Y[H(I)]:V(m)?m.$ms:P(m,this).$ms;return P(this.$ms+F*(W?-1:1),this)},g.subtract=function(m,I){return this.add(m,I,!0)},g.locale=function(m){var I=this.clone();return I.$l=m,I},g.clone=function(){return P(this.$ms,this)},g.humanize=function(m){return t().add(this.$ms,`ms`).locale(this.$l).fromNow(!m)},g.valueOf=function(){return this.asMilliseconds()},g.milliseconds=function(){return this.get(`milliseconds`)},g.asMilliseconds=function(){return this.as(`milliseconds`)},g.seconds=function(){return this.get(`seconds`)},g.asSeconds=function(){return this.as(`seconds`)},g.minutes=function(){return this.get(`minutes`)},g.asMinutes=function(){return this.as(`minutes`)},g.hours=function(){return this.get(`hours`)},g.asHours=function(){return this.as(`hours`)},g.days=function(){return this.get(`days`)},g.asDays=function(){return this.as(`days`)},g.weeks=function(){return this.get(`weeks`)},g.asWeeks=function(){return this.as(`weeks`)},g.months=function(){return this.get(`months`)},g.asMonths=function(){return this.as(`months`)},g.years=function(){return this.get(`years`)},g.asYears=function(){return this.as(`years`)},$})(),X=function($,g,m){return $.add(g.years()*m,`y`).add(g.months()*m,`M`).add(g.days()*m,`d`).add(g.hours()*m,`h`).add(g.minutes()*m,`m`).add(g.seconds()*m,`s`).add(g.milliseconds()*m,`ms`)};return function($,g,m){t=m,e=m().$utils(),m.duration=function(F,k){return P(F,{$l:m.locale()},k)},m.isDuration=V;var I=g.prototype.add,W=g.prototype.subtract;g.prototype.add=function(F,k){return V(F)?X(this,F,1):I.bind(this)(F,k)},g.prototype.subtract=function(F,k){return V(F)?X(this,F,-1):W.bind(this)(F,k)}}}))});var Pe=C(v(),1);var Q=C(ui$1(),1);var ze=C($e(),1);var Ne=C(Le(),1);var Re=C(Ae(),1);var mt=C(ui$1(),1);var Je=C(Fe(),1);var Gt=(function(){var t=o(function(T,a,h,d){for(h=h||{},d=T.length;d--;h[T[d]]=a);return h},`o`),e=[6,8,10,12,13,14,15,16,17,18,20,21,22,23,24,25,26,27,28,29,30,31,33,35,36,38,40],r=[1,26],s=[1,27],n=[1,28],f=[1,29],y=[1,30],_=[1,31],D=[1,32],R=[1,33],Y=[1,34],V=[1,9],P=[1,10],H=[1,11],b=[1,12],w=[1,13],x=[1,14],A=[1,15],U=[1,16],X=[1,19],$=[1,20],g=[1,21],m=[1,22],I=[1,23],W=[1,25],F=[1,35],k={trace:o(function(){},`trace`),yy:{},symbols_:{error:2,start:3,gantt:4,document:5,EOF:6,line:7,SPACE:8,statement:9,NL:10,weekday:11,weekday_monday:12,weekday_tuesday:13,weekday_wednesday:14,weekday_thursday:15,weekday_friday:16,weekday_saturday:17,weekday_sunday:18,weekend:19,weekend_friday:20,weekend_saturday:21,dateFormat:22,inclusiveEndDates:23,topAxis:24,axisFormat:25,tickInterval:26,excludes:27,includes:28,todayMarker:29,title:30,acc_title:31,acc_title_value:32,acc_descr:33,acc_descr_value:34,acc_descr_multiline_value:35,section:36,clickStatement:37,taskTxt:38,taskData:39,click:40,callbackname:41,callbackargs:42,href:43,clickStatementDebug:44,$accept:0,$end:1},terminals_:{2:`error`,4:`gantt`,6:`EOF`,8:`SPACE`,10:`NL`,12:`weekday_monday`,13:`weekday_tuesday`,14:`weekday_wednesday`,15:`weekday_thursday`,16:`weekday_friday`,17:`weekday_saturday`,18:`weekday_sunday`,20:`weekend_friday`,21:`weekend_saturday`,22:`dateFormat`,23:`inclusiveEndDates`,24:`topAxis`,25:`axisFormat`,26:`tickInterval`,27:`excludes`,28:`includes`,29:`todayMarker`,30:`title`,31:`acc_title`,32:`acc_title_value`,33:`acc_descr`,34:`acc_descr_value`,35:`acc_descr_multiline_value`,36:`section`,38:`taskTxt`,39:`taskData`,40:`click`,41:`callbackname`,42:`callbackargs`,43:`href`},productions_:[0,[3,3],[5,0],[5,2],[7,2],[7,1],[7,1],[7,1],[11,1],[11,1],[11,1],[11,1],[11,1],[11,1],[11,1],[19,1],[19,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,2],[9,2],[9,1],[9,1],[9,1],[9,2],[37,2],[37,3],[37,3],[37,4],[37,3],[37,4],[37,2],[44,2],[44,3],[44,3],[44,4],[44,3],[44,4],[44,2]],performAction:o(function(a,h,d,u,C,i,M){var c=i.length-1;switch(C){case 1:return i[c-1];case 2:this.$=[];break;case 3:i[c-1].push(i[c]),this.$=i[c-1];break;case 4:case 5:this.$=i[c];break;case 6:case 7:this.$=[];break;case 8:u.setWeekday(`monday`);break;case 9:u.setWeekday(`tuesday`);break;case 10:u.setWeekday(`wednesday`);break;case 11:u.setWeekday(`thursday`);break;case 12:u.setWeekday(`friday`);break;case 13:u.setWeekday(`saturday`);break;case 14:u.setWeekday(`sunday`);break;case 15:u.setWeekend(`friday`);break;case 16:u.setWeekend(`saturday`);break;case 17:u.setDateFormat(i[c].substr(11)),this.$=i[c].substr(11);break;case 18:u.enableInclusiveEndDates(),this.$=i[c].substr(18);break;case 19:u.TopAxis(),this.$=i[c].substr(8);break;case 20:u.setAxisFormat(i[c].substr(11)),this.$=i[c].substr(11);break;case 21:u.setTickInterval(i[c].substr(13)),this.$=i[c].substr(13);break;case 22:u.setExcludes(i[c].substr(9)),this.$=i[c].substr(9);break;case 23:u.setIncludes(i[c].substr(9)),this.$=i[c].substr(9);break;case 24:u.setTodayMarker(i[c].substr(12)),this.$=i[c].substr(12);break;case 27:u.setDiagramTitle(i[c].substr(6)),this.$=i[c].substr(6);break;case 28:this.$=i[c].trim(),u.setAccTitle(this.$);break;case 29:case 30:this.$=i[c].trim(),u.setAccDescription(this.$);break;case 31:u.addSection(i[c].substr(8)),this.$=i[c].substr(8);break;case 33:u.addTask(i[c-1],i[c]),this.$=`task`;break;case 34:this.$=i[c-1],u.setClickEvent(i[c-1],i[c],null);break;case 35:this.$=i[c-2],u.setClickEvent(i[c-2],i[c-1],i[c]);break;case 36:this.$=i[c-2],u.setClickEvent(i[c-2],i[c-1],null),u.setLink(i[c-2],i[c]);break;case 37:this.$=i[c-3],u.setClickEvent(i[c-3],i[c-2],i[c-1]),u.setLink(i[c-3],i[c]);break;case 38:this.$=i[c-2],u.setClickEvent(i[c-2],i[c],null),u.setLink(i[c-2],i[c-1]);break;case 39:this.$=i[c-3],u.setClickEvent(i[c-3],i[c-1],i[c]),u.setLink(i[c-3],i[c-2]);break;case 40:this.$=i[c-1],u.setLink(i[c-1],i[c]);break;case 41:case 47:this.$=i[c-1]+` `+i[c];break;case 42:case 43:case 45:this.$=i[c-2]+` `+i[c-1]+` `+i[c];break;case 44:case 46:this.$=i[c-3]+` `+i[c-2]+` `+i[c-1]+` `+i[c]}},`anonymous`),table:[{3:1,4:[1,2]},{1:[3]},t(e,[2,2],{5:3}),{6:[1,4],7:5,8:[1,6],9:7,10:[1,8],11:17,12:r,13:s,14:n,15:f,16:y,17:_,18:D,19:18,20:R,21:Y,22:V,23:P,24:H,25:b,26:w,27:x,28:A,29:U,30:X,31:$,33:g,35:m,36:I,37:24,38:W,40:F},t(e,[2,7],{1:[2,1]}),t(e,[2,3]),{9:36,11:17,12:r,13:s,14:n,15:f,16:y,17:_,18:D,19:18,20:R,21:Y,22:V,23:P,24:H,25:b,26:w,27:x,28:A,29:U,30:X,31:$,33:g,35:m,36:I,37:24,38:W,40:F},t(e,[2,5]),t(e,[2,6]),t(e,[2,17]),t(e,[2,18]),t(e,[2,19]),t(e,[2,20]),t(e,[2,21]),t(e,[2,22]),t(e,[2,23]),t(e,[2,24]),t(e,[2,25]),t(e,[2,26]),t(e,[2,27]),{32:[1,37]},{34:[1,38]},t(e,[2,30]),t(e,[2,31]),t(e,[2,32]),{39:[1,39]},t(e,[2,8]),t(e,[2,9]),t(e,[2,10]),t(e,[2,11]),t(e,[2,12]),t(e,[2,13]),t(e,[2,14]),t(e,[2,15]),t(e,[2,16]),{41:[1,40],43:[1,41]},t(e,[2,4]),t(e,[2,28]),t(e,[2,29]),t(e,[2,33]),t(e,[2,34],{42:[1,42],43:[1,43]}),t(e,[2,40],{41:[1,44]}),t(e,[2,35],{43:[1,45]}),t(e,[2,36]),t(e,[2,38],{42:[1,46]}),t(e,[2,37]),t(e,[2,39])],defaultActions:{},parseError:o(function(a,h){if(h.recoverable)this.trace(a);else{var d=new Error(a);throw d.hash=h,d}},`parseError`),parse:o(function(a){var h=this,d=[0],u=[],C=[null],i=[],M=this.table,c=``,j=0,o$1=0,S=0,E=2,z=1,N=i.slice.call(arguments,1),L=Object.create(this.lexer),O={yy:{}};for(var et in this.yy)Object.prototype.hasOwnProperty.call(this.yy,et)&&(O.yy[et]=this.yy[et]);L.setInput(a,O.yy),O.yy.lexer=L,O.yy.parser=this,typeof L.yylloc>`u`&&(L.yylloc={});var it=L.yylloc;i.push(it);var lt=L.options&&L.options.ranges;typeof O.yy.parseError==`function`?this.parseError=O.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function ut(Z){d.length=d.length-2*Z,C.length=C.length-Z,i.length=i.length-Z}o(ut,`popStack`);function dt(){var Z=u.pop()||L.lex()||z;return typeof Z!=`number`&&(Z instanceof Array&&(u=Z,Z=u.pop()),Z=h.symbols_[Z]||Z),Z}o(dt,`lex`);for(var B,rt,K,q,Mt,ft={},bt,st,ae,xt;;){if(K=d[d.length-1],this.defaultActions[K]?q=this.defaultActions[K]:((B===null||typeof B>`u`)&&(B=dt()),q=M[K]&&M[K][B]),typeof q>`u`||!q.length||!q[0]){var Et=``;xt=[];for(bt in M[K])this.terminals_[bt]&&bt>E&&xt.push(`'`+this.terminals_[bt]+`'`);L.showPosition?Et=`Parse error on line `+(j+1)+`:
`+L.showPosition()+`
Expecting `+xt.join(`, `)+`, got '`+(this.terminals_[B]||B)+`'`:Et=`Parse error on line `+(j+1)+`: Unexpected `+(B==z?`end of input`:`'`+(this.terminals_[B]||B)+`'`),this.parseError(Et,{text:L.match,token:this.terminals_[B]||B,line:L.yylineno,loc:it,expected:xt})}if(q[0]instanceof Array&&q.length>1)throw new Error(`Parse Error: multiple actions possible at state: `+K+`, token: `+B);switch(q[0]){case 1:d.push(B),C.push(L.yytext),i.push(L.yylloc),d.push(q[1]),B=null,rt?(B=rt,rt=null):(o$1=L.yyleng,c=L.yytext,j=L.yylineno,it=L.yylloc,S>0&&S--);break;case 2:if(st=this.productions_[q[1]][1],ft.$=C[C.length-st],ft._$={first_line:i[i.length-(st||1)].first_line,last_line:i[i.length-1].last_line,first_column:i[i.length-(st||1)].first_column,last_column:i[i.length-1].last_column},lt&&(ft._$.range=[i[i.length-(st||1)].range[0],i[i.length-1].range[1]]),Mt=this.performAction.apply(ft,[c,o$1,j,O.yy,q[1],C,i].concat(N)),typeof Mt<`u`)return Mt;st&&(d=d.slice(0,-1*st*2),C=C.slice(0,-1*st),i=i.slice(0,-1*st)),d.push(this.productions_[q[1]][0]),C.push(ft.$),i.push(ft._$),ae=M[d[d.length-2]][d[d.length-1]],d.push(ae);break;case 3:return!0}}return!0},`parse`)};k.lexer=(function(){return{EOF:1,parseError:o(function(h,d){if(this.yy.parser)this.yy.parser.parseError(h,d);else throw new Error(h)},`parseError`),setInput:o(function(a,h){return this.yy=h||this.yy||{},this._input=a,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match=``,this.conditionStack=[`INITIAL`],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},`setInput`),input:o(function(){var a=this._input[0];this.yytext+=a,this.yyleng++,this.offset++,this.match+=a,this.matched+=a;return a.match(/(?:\r\n?|\n).*/g)?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),a},`input`),unput:o(function(a){var h=a.length,d=a.split(/(?:\r\n?|\n)/g);this._input=a+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-h),this.offset-=h;var u=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),d.length-1&&(this.yylineno-=d.length-1);var C=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:d?(d.length===u.length?this.yylloc.first_column:0)+u[u.length-d.length].length-d[0].length:this.yylloc.first_column-h},this.options.ranges&&(this.yylloc.range=[C[0],C[0]+this.yyleng-h]),this.yyleng=this.yytext.length,this},`unput`),more:o(function(){return this._more=!0,this},`more`),reject:o(function(){if(this.options.backtrack_lexer)this._backtrack=!0;else return this.parseError(`Lexical error on line `+(this.yylineno+1)+`. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
`+this.showPosition(),{text:``,token:null,line:this.yylineno});return this},`reject`),less:o(function(a){this.unput(this.match.slice(a))},`less`),pastInput:o(function(){var a=this.matched.substr(0,this.matched.length-this.match.length);return(a.length>20?`...`:``)+a.substr(-20).replace(/\n/g,``)},`pastInput`),upcomingInput:o(function(){var a=this.match;return a.length<20&&(a+=this._input.substr(0,20-a.length)),(a.substr(0,20)+(a.length>20?`...`:``)).replace(/\n/g,``)},`upcomingInput`),showPosition:o(function(){var a=this.pastInput(),h=new Array(a.length+1).join(`-`);return a+this.upcomingInput()+`
`+h+`^`},`showPosition`),test_match:o(function(a,h){var d,u,C;if(this.options.backtrack_lexer&&(C={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(C.yylloc.range=this.yylloc.range.slice(0))),u=a[0].match(/(?:\r\n?|\n).*/g),u&&(this.yylineno+=u.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:u?u[u.length-1].length-u[u.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+a[0].length},this.yytext+=a[0],this.match+=a[0],this.matches=a,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(a[0].length),this.matched+=a[0],d=this.performAction.call(this,this.yy,this,h,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),d)return d;if(this._backtrack){for(var i in C)this[i]=C[i];return!1}return!1},`test_match`),next:o(function(){if(this.done)return this.EOF;this._input||(this.done=!0);var a,h,d,u;this._more||(this.yytext=``,this.match=``);for(var C=this._currentRules(),i=0;i<C.length;i++)if(d=this._input.match(this.rules[C[i]]),d&&(!h||d[0].length>h[0].length)){if(h=d,u=i,this.options.backtrack_lexer){if(a=this.test_match(d,C[i]),a!==!1)return a;if(this._backtrack){h=!1;continue}else return!1}else if(!this.options.flex)break}return h?(a=this.test_match(h,C[u]),a!==!1?a:!1):this._input===``?this.EOF:this.parseError(`Lexical error on line `+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:``,token:null,line:this.yylineno})},`next`),lex:o(function(){return this.next()||this.lex()},`lex`),begin:o(function(h){this.conditionStack.push(h)},`begin`),popState:o(function(){return this.conditionStack.length-1>0?this.conditionStack.pop():this.conditionStack[0]},`popState`),_currentRules:o(function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},`_currentRules`),topState:o(function(h){return h=this.conditionStack.length-1-Math.abs(h||0),h>=0?this.conditionStack[h]:`INITIAL`},`topState`),pushState:o(function(h){this.begin(h)},`pushState`),stateStackSize:o(function(){return this.conditionStack.length},`stateStackSize`),options:{"case-insensitive":!0},performAction:o(function(h,d,u,C){switch(u){case 0:return this.begin(`open_directive`),`open_directive`;case 1:return this.begin(`acc_title`),31;case 2:return this.popState(),`acc_title_value`;case 3:return this.begin(`acc_descr`),33;case 4:return this.popState(),`acc_descr_value`;case 5:this.begin(`acc_descr_multiline`);break;case 6:this.popState();break;case 7:return`acc_descr_multiline_value`;case 8:break;case 9:break;case 10:break;case 11:return 10;case 12:break;case 13:break;case 14:this.begin(`href`);break;case 15:this.popState();break;case 16:return 43;case 17:this.begin(`callbackname`);break;case 18:this.popState();break;case 19:this.popState(),this.begin(`callbackargs`);break;case 20:return 41;case 21:this.popState();break;case 22:return 42;case 23:this.begin(`click`);break;case 24:this.popState();break;case 25:return 40;case 26:return 4;case 27:return 22;case 28:return 23;case 29:return 24;case 30:return 25;case 31:return 26;case 32:return 28;case 33:return 27;case 34:return 29;case 35:return 12;case 36:return 13;case 37:return 14;case 38:return 15;case 39:return 16;case 40:return 17;case 41:return 18;case 42:return 20;case 43:return 21;case 44:return`date`;case 45:return 30;case 46:return`accDescription`;case 47:return 36;case 48:return 38;case 49:return 39;case 50:return`:`;case 51:return 6;case 52:return`INVALID`}},`anonymous`),rules:[/^(?:%%\{)/i,/^(?:accTitle\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*\{\s*)/i,/^(?:[\}])/i,/^(?:[^\}]*)/i,/^(?:%%(?!\{)*[^\n]*)/i,/^(?:[^\}]%%*[^\n]*)/i,/^(?:%%*[^\n]*[\n]*)/i,/^(?:[\n]+)/i,/^(?:\s+)/i,/^(?:%[^\n]*)/i,/^(?:href[\s]+["])/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:call[\s]+)/i,/^(?:\([\s]*\))/i,/^(?:\()/i,/^(?:[^(]*)/i,/^(?:\))/i,/^(?:[^)]*)/i,/^(?:click[\s]+)/i,/^(?:[\s\n])/i,/^(?:[^\s\n]*)/i,/^(?:gantt\b)/i,/^(?:dateFormat\s[^#\n;]+)/i,/^(?:inclusiveEndDates\b)/i,/^(?:topAxis\b)/i,/^(?:axisFormat\s[^#\n;]+)/i,/^(?:tickInterval\s[^#\n;]+)/i,/^(?:includes\s[^#\n;]+)/i,/^(?:excludes\s[^#\n;]+)/i,/^(?:todayMarker\s[^\n;]+)/i,/^(?:weekday\s+monday\b)/i,/^(?:weekday\s+tuesday\b)/i,/^(?:weekday\s+wednesday\b)/i,/^(?:weekday\s+thursday\b)/i,/^(?:weekday\s+friday\b)/i,/^(?:weekday\s+saturday\b)/i,/^(?:weekday\s+sunday\b)/i,/^(?:weekend\s+friday\b)/i,/^(?:weekend\s+saturday\b)/i,/^(?:\d\d\d\d-\d\d-\d\d\b)/i,/^(?:title\s[^\n]+)/i,/^(?:accDescription\s[^#\n;]+)/i,/^(?:section\s[^\n]+)/i,/^(?:[^:\n]+)/i,/^(?::[^#\n;]+)/i,/^(?::)/i,/^(?:$)/i,/^(?:.)/i],conditions:{acc_descr_multiline:{rules:[6,7],inclusive:!1},acc_descr:{rules:[4],inclusive:!1},acc_title:{rules:[2],inclusive:!1},callbackargs:{rules:[21,22],inclusive:!1},callbackname:{rules:[18,19,20],inclusive:!1},href:{rules:[15,16],inclusive:!1},click:{rules:[24,25],inclusive:!1},INITIAL:{rules:[0,1,3,5,8,9,10,11,12,13,14,17,23,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52],inclusive:!0}}}})();function v(){this.yy={}}return o(v,`Parser`),v.prototype=k,k.Parser=v,new v})();Gt.parser=Gt;var ei=Gt;Q.default.extend(ze.default);Q.default.extend(Ne.default);Q.default.extend(Re.default);var Oe={friday:5,saturday:6};var tt=``;var Zt=``;var Qt=void 0;var Kt=``;var yt=[];var gt=[];var Jt=new Map;var te=[];var St=[];var pt=``;var ee=``;var He=[`active`,`done`,`crit`,`milestone`,`vert`];var ie=[];var ht=``;var Tt=!1;var se=!1;var ne=`sunday`;var Ct=`saturday`;var Ut=0;var ii=o(function(){te=[],St=[],pt=``,ie=[],_t=0,qt=void 0,Dt=void 0,G=[],tt=``,Zt=``,ee=``,Qt=void 0,Kt=``,yt=[],gt=[],Tt=!1,se=!1,Ut=0,Jt=new Map,ht=``,Oa(),ne=`sunday`,Ct=`saturday`},`clear`);var si=o(function(t){ht=t},`setDiagramId`);var ni=o(function(t){Zt=t},`setAxisFormat`);var ri=o(function(){return Zt},`getAxisFormat`);var ai=o(function(t){Qt=t},`setTickInterval`);var oi=o(function(){return Qt},`getTickInterval`);var ci=o(function(t){Kt=t},`setTodayMarker`);var li=o(function(){return Kt},`getTodayMarker`);var ui=o(function(t){tt=t},`setDateFormat`);var di=o(function(){Tt=!0},`enableInclusiveEndDates`);var fi=o(function(){return Tt},`endDatesAreInclusive`);var hi=o(function(){se=!0},`enableTopAxis`);var mi=o(function(){return se},`topAxisEnabled`);var ki=o(function(t){ee=t},`setDisplayMode`);var yi=o(function(){return ee},`getDisplayMode`);var gi=o(function(){return tt},`getDateFormat`);var je=o((t,e)=>{let r=e.toLowerCase().split(/[\s,]+/).filter(s=>s!==``);return[...new Set([...t,...r])]},`mergeTokens`);var pi=o(function(t){yt=je(yt,t)},`setIncludes`);var vi=o(function(){return yt},`getIncludes`);var Ti=o(function(t){gt=je(gt,t)},`setExcludes`);var bi=o(function(){return gt},`getExcludes`);var xi=o(function(){return Jt},`getLinks`);var wi=o(function(t){pt=t,te.push(t)},`addSection`);var _i=o(function(){return te},`getSections`);var Di=o(function(){let t=We(),e=10,r=0;for(;!t&&r<e;)t=We(),r++;return St=G,St},`getTasks`);var Be=o(function(t,e,r,s){let n=t.format(e.trim()),f=t.format(`YYYY-MM-DD`);return s.includes(n)||s.includes(f)?!1:r.includes(`weekends`)&&(t.isoWeekday()===Oe[Ct]||t.isoWeekday()===Oe[Ct]+1)||r.includes(t.format(`dddd`).toLowerCase())?!0:r.includes(n)||r.includes(f)},`isInvalidDate`);var Si=o(function(t){ne=t},`setWeekday`);var Ci=o(function(){return ne},`getWeekday`);var Mi=o(function(t){Ct=t},`setWeekend`);var Ge=o(function(t,e,r,s){if(!r.length||t.manualEndTime)return;let n;t.startTime instanceof Date?n=(0,Q.default)(t.startTime):n=(0,Q.default)(t.startTime,e,!0),n=n.add(1,`d`);let f;t.endTime instanceof Date?f=(0,Q.default)(t.endTime):f=(0,Q.default)(t.endTime,e,!0);let[y,_]=Ei(n,f,e,r,s);t.endTime=y.toDate(),t.renderEndTime=_},`checkTaskDates`);var Ei=o(function(t,e,r,s,n){let f=!1,y=null,_=e.add(1e4,`d`);for(;t<=e;){if(f||(y=e.toDate()),f=Be(t,r,s,n),f&&(e=e.add(1,`d`),e>_))throw new Error("Failed to find a valid date that was not excluded by `excludes` after 10,000 iterations.");t=t.add(1,`d`)}return[e,y]},`fixTaskDates`);var Ue=o(function(t,e){ct$1.warn(`Gantt: the "${t}" statement references unknown task id(s): ${e.join(`, `)}. Make sure the referenced tasks exist and declare an id. Milestones need both an id and a duration, e.g. "Milestone :milestone, m1, 2023-01-01, 0d".`)},`warnAboutUnknownTaskIds`);var Xt=o(function(t,e,r){if(r=r.trim(),o(_=>{let D=_.trim();return D===`x`||D===`X`},`isTimestampFormat`)(e)&&/^\d+$/.test(r))return new Date(Number(r));let f=/^after\s+(?<ids>[\d\w- ]+)/.exec(r);if(f!==null){let _=null,D=[],R=f.groups.ids.split(` `).filter(V=>V!==``);for(let V of R){let P=ct(V);if(P===void 0){D.push(V);continue}(!_||P.endTime>_.endTime)&&(_=P)}if(D.length>0&&Ue(`after`,D),_)return _.endTime;let Y=new Date;return Y.setHours(0,0,0,0),Y}let y=(0,Q.default)(r,e.trim(),!0);if(y.isValid())return y.toDate();{ct$1.debug(`Invalid date:`+r),ct$1.debug(`With date format:`+e.trim());let _=new Date(r);if(_===void 0||isNaN(_.getTime())||_.getFullYear()<-1e4||_.getFullYear()>1e4)throw new Error(`Invalid date:`+r);return _}},`getStartDate`);var Xe=o(function(t){let e=/^(\d+(?:\.\d+)?)([Mdhmswy]|ms)$/.exec(t.trim());return e!==null?[Number.parseFloat(e[1]),e[2]]:[NaN,`ms`]},`parseDuration`);var qe=o(function(t,e,r,s=!1){r=r.trim();let f=/^until\s+(?<ids>[\d\w- ]+)/.exec(r);if(f!==null){let Y=null,V=[],P=f.groups.ids.split(` `).filter(b=>b!==``);for(let b of P){let w=ct(b);if(w===void 0){V.push(b);continue}(!Y||w.startTime<Y.startTime)&&(Y=w)}if(V.length>0&&Ue(`until`,V),Y)return Y.startTime;let H=new Date;return H.setHours(0,0,0,0),H}let y=(0,Q.default)(r,e.trim(),!0);if(y.isValid())return s&&(y=y.add(1,`d`)),y.toDate();let _=(0,Q.default)(t),[D,R]=Xe(r);if(Number.isNaN(D))ct$1.warn(`Gantt: "${r}" is neither a valid date for the "${e.trim()}" date format nor a valid duration (e.g. "3d"), so it is ignored and the task gets a zero duration. Milestones need a duration too, e.g. "Milestone :milestone, m1, 2023-01-01, 0d".`);else{let Y=_.add(D,R);Y.isValid()&&(_=Y)}return _.toDate()},`getEndDate`);var _t=0;var kt=o(function(t){return t===void 0?(_t=_t+1,`task`+_t):t},`parseId`);var Ii=o(function(t,e){let r;e.substr(0,1)===`:`?r=e.substr(1,e.length):r=e;let s=r.split(`,`),n={};re(s,n,He);for(let y=0;y<s.length;y++)s[y]=s[y].trim();let f=``;switch(s.length){case 1:n.id=kt(),n.startTime=t.endTime,f=s[0];break;case 2:n.id=kt(),n.startTime=Xt(void 0,tt,s[0]),f=s[1];break;case 3:n.id=kt(s[0]),n.startTime=Xt(void 0,tt,s[1]),f=s[2]}return f&&(n.endTime=qe(n.startTime,tt,f,Tt),n.manualEndTime=(0,Q.default)(f,`YYYY-MM-DD`,!0).isValid(),Ge(n,tt,gt,yt)),n},`compileData`);var Yi=o(function(t,e){let r;e.substr(0,1)===`:`?r=e.substr(1,e.length):r=e;let s=r.split(`,`),n={};re(s,n,He);for(let f=0;f<s.length;f++)s[f]=s[f].trim();switch(s.length){case 1:n.id=kt(),n.startTime={type:`prevTaskEnd`,id:t},n.endTime={data:s[0]};break;case 2:n.id=kt(),n.startTime={type:`getStartDate`,startData:s[0]},n.endTime={data:s[1]};break;case 3:n.id=kt(s[0]),n.startTime={type:`getStartDate`,startData:s[1]},n.endTime={data:s[2]}}return n},`parseData`);var qt;var Dt;var G=[];var Ze={};var $i=o(function(t,e){let r={section:pt,type:pt,processed:!1,manualEndTime:!1,renderEndTime:null,raw:{data:e},task:t,classes:[]},s=Yi(Dt,e);r.raw.startTime=s.startTime,r.raw.endTime=s.endTime,r.id=s.id,r.prevTaskId=Dt,r.active=s.active,r.done=s.done,r.crit=s.crit,r.milestone=s.milestone,r.vert=s.vert,r.vert?r.order=-1:(r.order=Ut,Ut++);let n=G.push(r);Dt=r.id,Ze[r.id]=n-1},`addTask`);var ct=o(function(t){let e=Ze[t];return G[e]},`findTaskById`);var Li=o(function(t,e){let r={section:pt,type:pt,description:t,task:t,classes:[]},s=Ii(qt,e);r.startTime=s.startTime,r.endTime=s.endTime,r.id=s.id,r.active=s.active,r.done=s.done,r.crit=s.crit,r.milestone=s.milestone,r.vert=s.vert,qt=r,St.push(r)},`addTaskOrg`);var We=o(function(){let t=o(function(r){let s=G[r],n=``;switch(G[r].raw.startTime.type){case`prevTaskEnd`:s.startTime=ct(s.prevTaskId).endTime;break;case`getStartDate`:n=Xt(void 0,tt,G[r].raw.startTime.startData),n&&(G[r].startTime=n)}return G[r].startTime&&(G[r].endTime=qe(G[r].startTime,tt,G[r].raw.endTime.data,Tt),G[r].endTime&&(G[r].processed=!0,G[r].manualEndTime=(0,Q.default)(G[r].raw.endTime.data,`YYYY-MM-DD`,!0).isValid(),Ge(G[r],tt,gt,yt))),G[r].processed},`compileTask`),e=!0;for(let[r,s]of G.entries())t(r),e=e&&s.processed;return e},`compileTasks`);var Ai=o(function(t,e){let r=e;Ge$1().securityLevel!==`loose`&&(r=(0,Pe.sanitizeUrl)(e)),t.split(`,`).forEach(function(s){ct(s)!==void 0&&(Ke(s,()=>{window.open(r,`_self`)}),Jt.set(s,r))}),Qe(t,`clickable`)},`setLink`);var Qe=o(function(t,e){t.split(`,`).forEach(function(r){let s=ct(r);s!==void 0&&s.classes.push(e)})},`setClass`);var Fi=o(function(t,e,r){if(Ge$1().securityLevel!==`loose`||e===void 0)return;let s=[];if(typeof r==`string`){s=r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);for(let f=0;f<s.length;f++){let y=s[f].trim();y.startsWith(`"`)&&y.endsWith(`"`)&&(y=y.substr(1,y.length-2)),s[f]=y}}s.length===0&&s.push(t),ct(t)!==void 0&&Ke(t,()=>{pi$1.runFunc(e,...s)})},`setClickFun`);var Ke=o(function(t,e){ie.push(function(){let r=ht?`${ht}-${t}`:t,s=document.querySelector(`[id="${r}"]`);s!==null&&s.addEventListener(`click`,function(){e()})},function(){let r=ht?`${ht}-${t}`:t,s=document.querySelector(`[id="${r}-text"]`);s!==null&&s.addEventListener(`click`,function(){e()})})},`pushFun`);var Oi=o(function(t,e,r){t.split(`,`).forEach(function(s){Fi(s,e,r)}),Qe(t,`clickable`)},`setClickEvent`);var Wi=o(function(t){ie.forEach(function(e){e(t)})},`bindFunctions`);var Vi={getConfig:o(()=>Ge$1().gantt,`getConfig`),clear:ii,setDateFormat:ui,getDateFormat:gi,enableInclusiveEndDates:di,endDatesAreInclusive:fi,enableTopAxis:hi,topAxisEnabled:mi,setAxisFormat:ni,getAxisFormat:ri,setTickInterval:ai,getTickInterval:oi,setTodayMarker:ci,getTodayMarker:li,setAccTitle:qa,getAccTitle:Ma,setDiagramTitle:za,getDiagramTitle:Wa,setDiagramId:si,setDisplayMode:ki,getDisplayMode:yi,setAccDescription:Ia,getAccDescription:Da,addSection:wi,getSections:_i,getTasks:Di,addTask:$i,findTaskById:ct,addTaskOrg:Li,setIncludes:pi,getIncludes:vi,setExcludes:Ti,getExcludes:bi,setClickEvent:Oi,setLink:Ai,getLinks:xi,bindFunctions:Wi,parseDuration:Xe,isInvalidDate:Be,setWeekday:Si,getWeekday:Ci,setWeekend:Mi};function re(t,e,r){let s=!0;for(;s;)s=!1,r.forEach(function(n){let f=`^\\s*`+n+`\\s*$`,y=new RegExp(f);t[0].match(y)&&(e[n]=!0,t.shift(1),s=!0)})}o(re,`getTaskTags`);mt.default.extend(Je.default);var Pi=o(function(){ct$1.debug(`Something is calling, setConf, remove the call`)},`setConf`);var Ve={monday:ve,tuesday:_a,wednesday:ga,thursday:Pt,friday:ya,saturday:va,sunday:$t};var zi=o((t,e)=>{let r=[...t].map(()=>-1/0),s=[...t].sort((f,y)=>f.startTime-y.startTime||f.order-y.order),n=0;for(let f of s)for(let y=0;y<r.length;y++)if(f.startTime>=r[y]){r[y]=f.endTime,f.order=y+e,y>n&&(n=y);break}return n},`getMaxIntersections`);var nt;var Bt=1e4;var Qi={parser:ei,db:Vi,renderer:{setConf:Pi,draw:o(function(t,e,r,s){let n=Ge$1().gantt;s.db.setDiagramId(e);let f=Ge$1().securityLevel,y;f===`sandbox`&&(y=pf(`#i`+e));let _=f===`sandbox`?pf(y.nodes()[0].contentDocument.body):pf(`body`),D=f===`sandbox`?y.nodes()[0].contentDocument:document,R=D.getElementById(e);nt=R.parentElement.offsetWidth,nt===void 0&&(nt=1200),n.useWidth!==void 0&&(nt=n.useWidth);let Y=s.db.getTasks(),V=Y.filter(k=>!k.vert),P=[];for(let k of V)P.push(k.type);P=F(P);let H={},b=2*n.topPadding;if(s.db.getDisplayMode()===`compact`||n.displayMode===`compact`){let k={};for(let v of V)k[v.section]===void 0?k[v.section]=[v]:k[v.section].push(v);let p=0;for(let v of Object.keys(k)){let T=zi(k[v],p)+1;p+=T,b+=T*(n.barHeight+n.barGap),H[v]=T}}else{b+=V.length*(n.barHeight+n.barGap);for(let k of P)H[k]=V.filter(p=>p.type===k).length}R.setAttribute(`viewBox`,`0 0 `+nt+` `+b);let w=_.select(`[id="${e}"]`),x=Xa().domain([ci$1(Y,function(k){return k.startTime}),li$1(Y,function(k){return k.endTime})]).rangeRound([0,nt-n.leftPadding-n.rightPadding]);function A(k,p){let v=k.startTime,T=p.startTime,a=0;return v>T?a=1:v<T&&(a=-1),a}o(A,`taskCompare`),Y.sort(A),U(Y,nt,b),va$1(w,b,nt,n.useMaxWidth),w.append(`text`).text(s.db.getDiagramTitle()).attr(`x`,nt/2).attr(`y`,n.titleTopMargin).attr(`class`,`titleText`);function U(k,p,v){let T=n.barHeight,a=T+n.barGap,h=n.topPadding,d=n.leftPadding,u=zr().domain([0,P.length]).range([`#00B9FA`,`#F95002`]).interpolate(Cf);$(a,h,d,p,v,k,s.db.getExcludes(),s.db.getIncludes()),m(d,h,p,v),X(k,a,h,d,T,u,p,v),I(a,h,d,T,u),W(d,h,p,v)}o(U,`makeGantt`);function X(k,p,v,T,a,h,d){k.sort((o,S)=>o.vert===S.vert?0:o.vert?1:-1);let u=k.filter(o=>!o.vert),i=[...new Set(u.map(o=>o.order))].map(o=>u.find(S=>S.order===o));w.append(`g`).selectAll(`rect`).data(i).enter().append(`rect`).attr(`x`,0).attr(`y`,function(o,S){return S=o.order,S*p+v-2}).attr(`width`,function(){return d-n.rightPadding/2}).attr(`height`,p).attr(`class`,function(o){for(let[S,E]of P.entries())if(o.type===E)return`section section`+S%n.numberSectionStyles;return`section section0`}).enter();let M=w.append(`g`).selectAll(`rect`).data(k).enter(),c=s.db.getLinks();if(M.append(`rect`).attr(`id`,function(o){return e+`-`+o.id}).attr(`rx`,3).attr(`ry`,3).attr(`x`,function(o){return o.milestone?x(o.startTime)+T+.5*(x(o.endTime)-x(o.startTime))-.5*a:x(o.startTime)+T}).attr(`y`,function(o,S){return S=o.order,o.vert?n.gridLineStartPadding:S*p+v}).attr(`width`,function(o){return o.milestone?a:o.vert?.08*a:x(o.renderEndTime||o.endTime)-x(o.startTime)}).attr(`height`,function(o){return o.vert?u.length*(n.barHeight+n.barGap)+n.barHeight*2:a}).attr(`transform-origin`,function(o,S){return S=o.order,(x(o.startTime)+T+.5*(x(o.endTime)-x(o.startTime))).toString()+`px `+(S*p+v+.5*a).toString()+`px`}).attr(`class`,function(o){let S=`task`,E=``;o.classes.length>0&&(E=o.classes.join(` `));let z=0;for(let[L,O]of P.entries())o.type===O&&(z=L%n.numberSectionStyles);let N=``;return o.active?o.crit?N+=` activeCrit`:N=` active`:o.done?o.crit?N=` doneCrit`:N=` done`:o.crit&&(N+=` crit`),N.length===0&&(N=` task`),o.milestone&&(N=` milestone `+N),o.vert&&(N=` vert `+N),N+=z,N+=` `+E,S+N}),M.append(`text`).attr(`id`,function(o){return e+`-`+o.id+`-text`}).text(function(o){return o.task}).attr(`font-size`,n.fontSize).attr(`x`,function(o){let S=x(o.startTime),E=x(o.renderEndTime||o.endTime);if(o.milestone&&(S+=.5*(x(o.endTime)-x(o.startTime))-.5*a,E=S+a),o.vert)return x(o.startTime)+T;let z=this.getBBox().width;return z>E-S?E+z+1.5*n.leftPadding>d?S+T-5:E+T+5:(E-S)/2+S+T}).attr(`y`,function(o,S){return o.vert?n.gridLineStartPadding+u.length*(n.barHeight+n.barGap)+60:(S=o.order,S*p+n.barHeight/2+(n.fontSize/2-2)+v)}).attr(`text-height`,a).attr(`class`,function(o){let S=x(o.startTime),E=x(o.endTime);o.milestone&&(E=S+a);let z=this.getBBox().width,N=``;o.classes.length>0&&(N=o.classes.join(` `));let L=0;for(let[et,it]of P.entries())o.type===it&&(L=et%n.numberSectionStyles);let O=``;return o.active&&(o.crit?O=`activeCritText`+L:O=`activeText`+L),o.done?o.crit?O=O+` doneCritText`+L:O=O+` doneText`+L:o.crit&&(O=O+` critText`+L),o.milestone&&(O+=` milestoneText`),o.vert&&(O+=` vertText`),z>E-S?E+z+1.5*n.leftPadding>d?N+` taskTextOutsideLeft taskTextOutside`+L+` `+O:N+` taskTextOutsideRight taskTextOutside`+L+` `+O+` width-`+z:N+` taskText taskText`+L+` `+O+` width-`+z}),Ge$1().securityLevel===`sandbox`){let o;o=pf(`#i`+e);let S=o.nodes()[0].contentDocument;M.filter(function(E){return c.has(E.id)}).each(function(E){var z=S.querySelector(`#`+CSS.escape(e+`-`+E.id)),N=S.querySelector(`#`+CSS.escape(e+`-`+E.id+`-text`));let L=z.parentNode;var O=S.createElement(`a`);O.setAttribute(`xlink:href`,c.get(E.id)),O.setAttribute(`target`,`_top`),L.appendChild(O),O.appendChild(z),O.appendChild(N)})}}o(X,`drawRects`);function $(k,p,v,T,a,h,d,u){if(d.length===0&&u.length===0)return;let C,i;for(let{startTime:E,endTime:z}of h)(C===void 0||E<C)&&(C=E),(i===void 0||z>i)&&(i=z);if(!C||!i)return;if((0,mt.default)(i).diff((0,mt.default)(C),`year`)>5){ct$1.warn(`The difference between the min and max time is more than 5 years. This will cause performance issues. Skipping drawing exclude days.`);return}let M=s.db.getDateFormat(),c=[],j=null,o=(0,mt.default)(C);for(;o.valueOf()<=i;)s.db.isInvalidDate(o,M,d,u)?j?j.end=o:j={start:o,end:o}:j&&(c.push(j),j=null),o=o.add(1,`d`);w.append(`g`).selectAll(`rect`).data(c).enter().append(`rect`).attr(`id`,E=>e+`-exclude-`+E.start.format(`YYYY-MM-DD`)).attr(`x`,E=>x(E.start.startOf(`day`))+v).attr(`y`,n.gridLineStartPadding).attr(`width`,E=>x(E.end.endOf(`day`))-x(E.start.startOf(`day`))).attr(`height`,a-p-n.gridLineStartPadding).attr(`transform-origin`,function(E,z){return(x(E.start)+v+.5*(x(E.end)-x(E.start))).toString()+`px `+(z*k+.5*a).toString()+`px`}).attr(`class`,`exclude-range`)}o($,`drawExcludeDays`);function g(k,p,v,T){if(v<=0||k>p)return 1/0;let a=p-k,h=mt.default.duration({[T??`day`]:v}).asMilliseconds();return h<=0?1/0:Math.ceil(a/h)}o(g,`getEstimatedTickCount`);function m(k,p,v,T){let a=s.db.getDateFormat(),h=s.db.getAxisFormat(),d;h?d=h:a===`D`?d=`%d`:d=n.axisFormat??`%Y-%m-%d`;let u=du(x).tickSize(-T+p+n.gridLineStartPadding).tickFormat(On(d)),i=/^([1-9]\d*)(millisecond|second|minute|hour|day|week|month)$/.exec(s.db.getTickInterval()||n.tickInterval);if(i!==null){let M=parseInt(i[1],10);if(isNaN(M)||M<=0)ct$1.warn(`Invalid tick interval value: "${i[1]}". Skipping custom tick interval.`);else{let c=i[2],j=s.db.getWeekday()||n.weekday,o=x.domain(),S=o[0],E=o[1],z=g(S,E,M,c);if(z>Bt)ct$1.warn(`The tick interval "${M}${c}" would generate ${z} ticks, which exceeds the maximum allowed (${Bt}). This may indicate an invalid date or time range. Skipping custom tick interval.`);else switch(c){case`millisecond`:u.ticks(Jt$1.every(M));break;case`second`:u.ticks(bt.every(M));break;case`minute`:u.ticks(ge.every(M));break;case`hour`:u.ticks(ye.every(M));break;case`day`:u.ticks(Dt$1.every(M));break;case`week`:u.ticks(Ve[j].every(M));break;case`month`:u.ticks(be.every(M))}}}if(w.append(`g`).attr(`class`,`grid`).attr(`transform`,`translate(`+k+`, `+(T-50)+`)`).call(u).selectAll(`text`).style(`text-anchor`,`middle`).attr(`fill`,`#000`).attr(`stroke`,`none`).attr(`font-size`,10).attr(`dy`,`1em`),s.db.topAxisEnabled()||n.topAxis){let M=mu(x).tickSize(-T+p+n.gridLineStartPadding).tickFormat(On(d));if(i!==null){let c=parseInt(i[1],10);if(isNaN(c)||c<=0)ct$1.warn(`Invalid tick interval value: "${i[1]}". Skipping custom tick interval.`);else{let j=i[2],o=s.db.getWeekday()||n.weekday,S=x.domain(),E=S[0],z=S[1];if(g(E,z,c,j)<=Bt)switch(j){case`millisecond`:M.ticks(Jt$1.every(c));break;case`second`:M.ticks(bt.every(c));break;case`minute`:M.ticks(ge.every(c));break;case`hour`:M.ticks(ye.every(c));break;case`day`:M.ticks(Dt$1.every(c));break;case`week`:M.ticks(Ve[o].every(c));break;case`month`:M.ticks(be.every(c))}}}w.append(`g`).attr(`class`,`grid`).attr(`transform`,`translate(`+k+`, `+p+`)`).call(M).selectAll(`text`).style(`text-anchor`,`middle`).attr(`fill`,`#000`).attr(`stroke`,`none`).attr(`font-size`,10)}}o(m,`makeGrid`);function I(k,p){let v=0,T=Object.keys(H).map(a=>[a,H[a]]);w.append(`g`).selectAll(`text`).data(T).enter().append(function(a){let h=a[0].split(Uh.lineBreakRegex),d=-(h.length-1)/2,u=D.createElementNS(`http://www.w3.org/2000/svg`,`text`);u.setAttribute(`dy`,d+`em`);for(let[C,i]of h.entries()){let M=D.createElementNS(`http://www.w3.org/2000/svg`,`tspan`);M.setAttribute(`alignment-baseline`,`central`),M.setAttribute(`x`,`10`),C>0&&M.setAttribute(`dy`,`1em`),M.textContent=i,u.appendChild(M)}return u}).attr(`x`,10).attr(`y`,function(a,h){if(h>0)for(let d=0;d<h;d++)return v+=T[h-1][1],a[1]*k/2+v*k+p;else return a[1]*k/2+p}).attr(`font-size`,n.sectionFontSize).attr(`class`,function(a){for(let[h,d]of P.entries())if(a[0]===d)return`sectionTitle sectionTitle`+h%n.numberSectionStyles;return`sectionTitle`})}o(I,`vertLabels`);function W(k,p,v,T){let a=s.db.getTodayMarker();if(a===`off`)return;let h=w.append(`g`).attr(`class`,`today`),d=new Date,u=h.append(`line`);u.attr(`x1`,x(d)+k).attr(`x2`,x(d)+k).attr(`y1`,n.titleTopMargin).attr(`y2`,T-n.titleTopMargin).attr(`class`,`today`),a!==``&&u.attr(`style`,a.replace(/,/g,`;`))}o(W,`drawToday`);function F(k){let p={},v=[];for(let T=0,a=k.length;T<a;++T)Object.prototype.hasOwnProperty.call(p,k[T])||(p[k[T]]=!0,v.push(k[T]));return v}o(F,`checkUnique`)},`draw`)},styles:o(t=>`
  .mermaid-main-font {
        font-family: ${t.fontFamily};
  }

  .exclude-range {
    fill: ${t.excludeBkgColor};
  }

  .section {
    stroke: none;
    opacity: 0.2;
  }

  .section0 {
    fill: ${t.sectionBkgColor};
  }

  .section2 {
    fill: ${t.sectionBkgColor2};
  }

  .section1,
  .section3 {
    fill: ${t.altSectionBkgColor};
    opacity: 0.2;
  }

  .sectionTitle0 {
    fill: ${t.titleColor};
  }

  .sectionTitle1 {
    fill: ${t.titleColor};
  }

  .sectionTitle2 {
    fill: ${t.titleColor};
  }

  .sectionTitle3 {
    fill: ${t.titleColor};
  }

  .sectionTitle {
    text-anchor: start;
    font-family: ${t.fontFamily};
  }


  /* Grid and axis */

  .grid .tick {
    stroke: ${t.gridColor};
    opacity: 0.8;
    shape-rendering: crispEdges;
  }

  .grid .tick text {
    font-family: ${t.fontFamily};
    fill: ${t.textColor};
  }

  .grid path {
    stroke-width: 0;
  }


  /* Today line */

  .today {
    fill: none;
    stroke: ${t.todayLineColor};
    stroke-width: 2px;
  }


  /* Task styling */

  /* Default task */

  .task {
    stroke-width: 2;
  }

  .taskText {
    text-anchor: middle;
    font-family: ${t.fontFamily};
  }

  .taskTextOutsideRight {
    fill: ${t.taskTextDarkColor};
    text-anchor: start;
    font-family: ${t.fontFamily};
  }

  .taskTextOutsideLeft {
    fill: ${t.taskTextDarkColor};
    text-anchor: end;
  }


  /* Special case clickable */

  .task.clickable {
    cursor: pointer;
  }

  .taskText.clickable {
    cursor: pointer;
    fill: ${t.taskTextClickableColor} !important;
    font-weight: bold;
  }

  .taskTextOutsideLeft.clickable {
    cursor: pointer;
    fill: ${t.taskTextClickableColor} !important;
    font-weight: bold;
  }

  .taskTextOutsideRight.clickable {
    cursor: pointer;
    fill: ${t.taskTextClickableColor} !important;
    font-weight: bold;
  }


  /* Specific task settings for the sections*/

  .taskText0,
  .taskText1,
  .taskText2,
  .taskText3 {
    fill: ${t.taskTextColor};
  }

  .task0,
  .task1,
  .task2,
  .task3 {
    fill: ${t.taskBkgColor};
    stroke: ${t.taskBorderColor};
  }

  .taskTextOutside0,
  .taskTextOutside2
  {
    fill: ${t.taskTextOutsideColor};
  }

  .taskTextOutside1,
  .taskTextOutside3 {
    fill: ${t.taskTextOutsideColor};
  }


  /* Active task */

  .active0,
  .active1,
  .active2,
  .active3 {
    fill: ${t.activeTaskBkgColor};
    stroke: ${t.activeTaskBorderColor};
  }

  .activeText0,
  .activeText1,
  .activeText2,
  .activeText3 {
    fill: ${t.taskTextDarkColor} !important;
  }


  /* Completed task */

  .done0,
  .done1,
  .done2,
  .done3 {
    stroke: ${t.doneTaskBorderColor};
    fill: ${t.doneTaskBkgColor};
    stroke-width: 2;
  }

  .doneText0,
  .doneText1,
  .doneText2,
  .doneText3 {
    fill: ${t.taskTextDarkColor} !important;
  }

  /* Done task text displayed outside the bar sits against the diagram background,
     not against the done-task bar, so it must use the outside/contrast color. */
  .doneText0.taskTextOutsideLeft,
  .doneText0.taskTextOutsideRight,
  .doneText1.taskTextOutsideLeft,
  .doneText1.taskTextOutsideRight,
  .doneText2.taskTextOutsideLeft,
  .doneText2.taskTextOutsideRight,
  .doneText3.taskTextOutsideLeft,
  .doneText3.taskTextOutsideRight {
    fill: ${t.taskTextOutsideColor} !important;
  }


  /* Tasks on the critical line */

  .crit0,
  .crit1,
  .crit2,
  .crit3 {
    stroke: ${t.critBorderColor};
    fill: ${t.critBkgColor};
    stroke-width: 2;
  }

  .activeCrit0,
  .activeCrit1,
  .activeCrit2,
  .activeCrit3 {
    stroke: ${t.critBorderColor};
    fill: ${t.activeTaskBkgColor};
    stroke-width: 2;
  }

  .doneCrit0,
  .doneCrit1,
  .doneCrit2,
  .doneCrit3 {
    stroke: ${t.critBorderColor};
    fill: ${t.doneTaskBkgColor};
    stroke-width: 2;
    cursor: pointer;
    shape-rendering: crispEdges;
  }

  .milestone {
    transform: rotate(45deg) scale(0.8,0.8);
  }

  .milestoneText {
    font-style: italic;
  }
  .doneCritText0,
  .doneCritText1,
  .doneCritText2,
  .doneCritText3 {
    fill: ${t.taskTextDarkColor} !important;
  }

  /* Done-crit task text outside the bar \u2014 same reasoning as doneText above. */
  .doneCritText0.taskTextOutsideLeft,
  .doneCritText0.taskTextOutsideRight,
  .doneCritText1.taskTextOutsideLeft,
  .doneCritText1.taskTextOutsideRight,
  .doneCritText2.taskTextOutsideLeft,
  .doneCritText2.taskTextOutsideRight,
  .doneCritText3.taskTextOutsideLeft,
  .doneCritText3.taskTextOutsideRight {
    fill: ${t.taskTextOutsideColor} !important;
  }

  .vert {
    stroke: ${t.vertLineColor};
  }

  .vertText {
    font-size: 15px;
    text-anchor: middle;
    fill: ${t.vertLineColor} !important;
  }

  .activeCritText0,
  .activeCritText1,
  .activeCritText2,
  .activeCritText3 {
    fill: ${t.taskTextDarkColor} !important;
  }

  .titleText {
    text-anchor: middle;
    font-size: 18px;
    fill: ${t.titleColor||t.textColor};
    font-family: ${t.fontFamily};
  }
`,`getStyles`)};export{Qi as diagram};
//# debugId=ff787eea-a940-5fcf-8653-0094bfb2f02c
//# sourceMappingURL=chunk-D0Z8Pg1_.js.map