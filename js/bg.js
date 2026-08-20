(function(){
var c=document.getElementById('bg');
var rnd=new THREE.WebGLRenderer({canvas:c,antialias:true});
rnd.setPixelRatio(Math.min(window.devicePixelRatio,2));
var scene=new THREE.Scene();
scene.background=new THREE.Color(0x050507);
scene.fog=new THREE.FogExp2(0x050507,0.05);
var cam=new THREE.PerspectiveCamera(60,1,0.1,100);
cam.position.set(0,4.2,10);
var N=90,S=0.42,P=N*N;
var geo=new THREE.BufferGeometry();
var pos=new Float32Array(P*3),col=new Float32Array(P*3);
var c1=new THREE.Color(0xef4056),c2=new THREE.Color(0x8b4aff),c3=new THREE.Color(0x2e2e3e),tmp=new THREE.Color();
var i=0,x,z,t;
for(x=0;x<N;x++)for(z=0;z<N;z++){
pos[i*3]=(x-N/2)*S;pos[i*3+1]=0;pos[i*3+2]=(z-N/2)*S;
t=Math.random();
tmp.copy(c3).lerp(t>0.94?c1:c2,t>0.94?0.9:0.3+Math.random()*0.3);
col[i*3]=tmp.r;col[i*3+1]=tmp.g;col[i*3+2]=tmp.b;i++;}
geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
geo.setAttribute('color',new THREE.BufferAttribute(col,3));
var pts=new THREE.Points(geo,new THREE.PointsMaterial({size:0.06,vertexColors:true,transparent:true,opacity:0.9}));
scene.add(pts);
var knot=new THREE.Mesh(new THREE.TorusKnotGeometry(1.5,0.42,140,20),new THREE.MeshBasicMaterial({color:0xef4056,wireframe:true,transparent:true,opacity:0.1}));
knot.position.set(0,2.4,-2);
scene.add(knot);
function size(){var w=window.innerWidth,h=window.innerHeight;rnd.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
window.addEventListener('resize',size);size();
var clock=new THREE.Clock();
(function anim(){
requestAnimationFrame(anim);
var e=clock.getElapsedTime();
var p=geo.attributes.position.array;
for(var j=0;j<P;j++){var px=p[j*3],pz=p[j*3+2];p[j*3+1]=Math.sin(px*0.55+e*1.1)*0.55+Math.cos(pz*0.5+e*0.9)*0.45;}
geo.attributes.position.needsUpdate=true;
knot.rotation.x=e*0.18;knot.rotation.y=e*0.24;
cam.position.x=Math.sin(e*0.12)*1.4;
cam.lookAt(0,0.6,0);
rnd.render(scene,cam);
})();
})();
