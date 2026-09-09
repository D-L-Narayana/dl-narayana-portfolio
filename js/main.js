document.addEventListener('DOMContentLoaded',function(){
window.Overlay.init();
window.Nav.init();
window.buildName();
var started=false;
function start(){
if(started)return;started=true;
gsap.set('#nwrap',{visibility:'visible',opacity:0});
gsap.to('#nwrap',{opacity:1,duration:0.9,ease:'power2.out'});
if(document.getElementById('corridor'))gsap.to('#corridor',{autoAlpha:1,duration:1.2,delay:0.2});
window.Stage.ready();
}
window.Loader.run(start);
});
