document.addEventListener('DOMContentLoaded',function(){
window.Overlay.init();
window.Nav.init();
window.Extras.init();
var started=false;
function start(){
if(started)return;started=true;
var tl=gsap.timeline({delay:0.15});
window.helloIntro(tl);
window.nameIntro(tl);
tl.call(function(){window.Stage.ready();},null,'exit+=2.3');}
window.Loader.run(start);
});
