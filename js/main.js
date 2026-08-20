window.addEventListener('load',function(){
window.Overlay.init();
var started=false;
function start(){
if(started)return;started=true;
var tl=gsap.timeline({delay:0.25});
window.helloIntro(tl);
window.nameIntro(tl);
tl.call(function(){window.Stage.ready();},null,'exit+=2.3');}
if(document.fonts&&document.fonts.ready){
if(document.fonts.load){
document.fonts.load('600 230px Caveat');
document.fonts.load('400 100px "Archivo Black"');}
document.fonts.ready.then(start);
setTimeout(start,3000);
}else{start();}
});
