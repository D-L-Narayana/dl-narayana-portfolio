window.buildName=function(){
var el=document.getElementById('name');
if(el.children.length)return;
el.classList.add('polish');
'D L NARAYANA'.split('').forEach(function(ch,i){
var s=document.createElement('span');
if(ch===' '){s.className='sp';s.innerHTML='&nbsp;';}else{s.textContent=ch;}
s.style.animationDelay=(i*0.08)+'s';
el.appendChild(s);});
};
