window.Nav=(function(){
var mode='home',ov=false;
function paint(){
document.querySelectorAll('.navItem').forEach(function(b){
b.classList.toggle('active',b.dataset.m===mode);});}
function sync(m){
ov=false;
if(m===mode)return;
mode=m;paint();}
function open(m){
if(m===mode)return;
var map={home:0,about:2,projects:3,resume:4,contact:5};
['about','resume'].forEach(function(x){gsap.set('#sec-'+x,{opacity:0,visibility:'hidden'});});
gsap.to('#stage',{opacity:1,duration:0.4});
ov=false;
window.Stage.set(map[m]!==undefined?map[m]:0,true);}
function init(){
document.querySelectorAll('.navItem').forEach(function(b){
b.addEventListener('click',function(){open(b.dataset.m);});});}
return{init:init,open:open,sync:sync,blocked:function(){return ov;},mode:function(){return mode;}};
})();
