window.addEventListener('load',function(){
window.Overlay.init();
var tl=gsap.timeline({delay:0.4});
window.helloIntro(tl);
window.nameIntro(tl);
tl.call(function(){window.Stage.ready();},null,'exit+=2.3');
});
