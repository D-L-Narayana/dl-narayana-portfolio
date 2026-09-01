window.Extras=(function(){
function corridor(){
var st=document.getElementById('stage');
if(!st||document.getElementById('corridor'))return;
var cor=document.createElement('div');cor.id='corridor';
st.insertBefore(cor,st.firstChild);
gsap.set(cor,{autoAlpha:0});
var imgs=['assets/cityhelp.jpg','assets/staynest.jpg','assets/resumeforge.jpg','assets/ascii.jpg'];
for(var i=0;i<4;i++){
[['L',imgs[i]],['R',imgs[3-i]]].forEach(function(side){
var p=document.createElement('div');
p.className='corP';
p.style.backgroundImage='url('+side[1]+')';
p.style[side[0]==='L'?'left':'right']=(3+i*9.5)+'vw';
p.style.zIndex=String(5-i);
cor.appendChild(p);
gsap.set(p,{yPercent:-50,rotationY:side[0]==='L'?54:-54,scale:1-i*0.15,transformOrigin:'50% 50%'});
gsap.to(p,{y:(i%2?-13:13),duration:2.4+(i%3)*0.6,yoyo:true,repeat:-1,ease:'sine.inOut'});});}}
var gcv=null,gctx,gpts=null,graf=null,grot=0,gDPR=1;
function globeBuild(){
var sec=document.getElementById('sec-about');
if(!sec||gcv)return;
gcv=document.createElement('canvas');gcv.id='globe';
sec.appendChild(gcv);
gctx=gcv.getContext('2d',{desynchronized:true});
gDPR=Math.min(2,window.devicePixelRatio||1);
var sz=Math.min(window.innerHeight*0.5,440);
gcv.style.width=sz+'px';gcv.style.height=sz+'px';
gcv.width=gcv.height=Math.round(sz*gDPR);
var chars='DLNARAYANA·WEB·DESIGN·',N=760;gpts=[];
for(var k=0;k<N;k++){
var yy=1-(k/(N-1))*2,rr=Math.sqrt(Math.max(0,1-yy*yy)),th=k*2.399963;
gpts.push({x:Math.cos(th)*rr,y:yy,z:Math.sin(th)*rr,c:chars[k%chars.length]});}}
function gloop(){
var Wp=gcv.width,R=Wp*0.42,cx=Wp/2,cy=Wp/2;
grot+=0.0045;
gctx.clearRect(0,0,Wp,Wp);
gctx.textAlign='center';gctx.textBaseline='middle';
gctx.fillStyle='#ffffff';
var cs=Math.cos(grot),sn=Math.sin(grot);
for(var k=0;k<gpts.length;k++){
var p=gpts[k],x=p.x*cs-p.z*sn,z=p.x*sn+p.z*cs;
var sc=(z+1.6)/2.6;
gctx.globalAlpha=0.12+0.78*sc*sc;
gctx.font=Math.max(5,Math.round(10*sc*gDPR))+'px monospace';
gctx.fillText(p.c,cx+x*R,cy+p.y*R);}
gctx.globalAlpha=1;
graf=requestAnimationFrame(gloop);}
function globeOn(){globeBuild();if(gpts&&!graf)graf=requestAnimationFrame(gloop);}
function globeOff(){if(graf){cancelAnimationFrame(graf);graf=null;}}
function boot(){corridor();}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',boot);}else{boot();}
return{globeOn:globeOn,globeOff:globeOff};
})();
