document.addEventListener('DOMContentLoaded',function(){
window.Overlay.init();
window.Nav.init();
window.buildName();
var started=false;
function start(){
if(started)return;started=true;
window.Slider.show();
window.Stage.ready();
}
window.Loader.run(start);
});
