import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// A real, independently modelled mesh sculpture; the supplied 2D artwork is not a rig.
export default function PipSculpture() {
  const host = useRef(null), api = useRef(null);
  const [status, setStatus] = useState('Drag to turn Pip. Tap his head to say hello.');
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const element = host.current;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }); }
    catch { setFailed(true); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    element.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-label', 'Three-dimensional Pip sculpture');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, .1, 30);
    camera.position.set(0, 2.1, 7.9);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.5, 0); controls.enablePan = false; controls.enableDamping = false;
    controls.minDistance = 5; controls.maxDistance = 10; controls.minPolarAngle = .55; controls.maxPolarAngle = 2;
    controls.enableZoom = false; // Keep ordinary page scrolling intact. Explicit buttons zoom the model.
    controls.update();
    scene.add(new THREE.HemisphereLight(0xfff5e3, 0xb498b2, 3));
    const key = new THREE.DirectionalLight(0xffebcc, 4); key.position.set(-3, 5, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(0xc8d8ff, 2.4); rim.position.set(4, 3, -3); scene.add(rim);
    const material = (color, roughness = .8) => new THREE.MeshStandardMaterial({ color, roughness });
    const bone = material(0xfff3df), cream = material(0xf2dcae), pink = material(0xe8a5b0), dark = material(0x493336), gold = material(0xefbd5e), white = material(0xfff9ee), iris = new THREE.MeshStandardMaterial({ color: 0xffd883, emissive: 0xffb541, emissiveIntensity: .65 });
    const sphere = new THREE.SphereGeometry(1, 40, 28);
    const pip = new THREE.Group(); scene.add(pip);
    const ball = (parent, mat, x, y, z, sx, sy, sz) => { const mesh = new THREE.Mesh(sphere, mat); mesh.position.set(x,y,z); mesh.scale.set(sx,sy,sz); parent.add(mesh); return mesh; };
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; ball(pip, white, Math.cos(a) * .78, .22, Math.sin(a) * .45, .47, .25, .43); }
    ball(pip, white, 0, .23, 0, .93, .28, .6);
    ball(pip, cream, 0, .95, 0, .48, .63, .35);
    for (const s of [-1, 1]) { ball(pip, cream, s * .32, .52, .38, .28, .27, .37); ball(pip, pink, s * .32, .5, .67, .19, .18, .05); }
    for (const y of [.78, 1.02, 1.22]) ball(pip, pink, 0, y, .35, .045, .045, .025);
    const head = new THREE.Group(); head.position.y = 1.9; pip.add(head);
    const skull = ball(head, bone, 0, 0, 0, .8, .69, .57);
    ball(head, bone, 0, -.36, .03, .66, .28, .5);
    for (const s of [-1, 1]) {
      ball(head, dark, s * .32, -.01, .487, .235, .265, .108);
      ball(head, iris, s * .32, -.025, .591, .052, .073, .022);
      ball(head, pink, s * .53, -.26, .45, .105, .049, .026);
    }
    const nose = new THREE.Shape(); nose.moveTo(0,.045); nose.bezierCurveTo(-.12,-.02,-.07,-.12,0,-.07); nose.bezierCurveTo(.07,-.12,.12,-.02,0,.045);
    const noseMesh = new THREE.Mesh(new THREE.ShapeGeometry(nose), dark); noseMesh.position.set(0,-.19,.567); head.add(noseMesh);
    const smile = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-.11,-.32,.53), new THREE.Vector3(.02,-.41,.56), new THREE.Vector3(.15,-.28,.53));
    const mouth = new THREE.Mesh(new THREE.TubeGeometry(smile, 20, .017, 8, false), dark); head.add(mouth);
    ball(head, cream, -.02, .46, -.04, .77, .39, .55);
    const brim = new THREE.Mesh(new THREE.TorusGeometry(.67, .073, 14, 64, Math.PI), white); brim.rotation.x = .36; brim.position.set(0,.22,.16); head.add(brim);
    ball(head, cream, -.53,.58,-.05,.32,.3,.32); ball(head, white,-.76,.39,.04,.17,.17,.17);
    for (const s of [-1,1]) { const bow = ball(head,pink,-.54+s*.12,.36,.44,.17,.1,.065); bow.rotation.z = s*.45; } ball(head,pink,-.54,.36,.5,.065,.075,.06);
    const arm = new THREE.Group(); arm.position.set(.44,1.2,0); pip.add(arm);
    const sleeve = ball(arm,cream,.15,.12,.02,.19,.32,.19); sleeve.rotation.z = -.5;
    ball(arm,pink,.27,.32,.05,.17,.065,.17); ball(arm,bone,.29,.45,.05,.14,.17,.12);
    for(let i=0;i<3;i++) ball(arm,bone,.20+i*.08,.58+(i===1?.035:0),.05,.045,.08,.05);
    ball(pip,cream,-.45,1.08,.07,.19,.32,.19); ball(pip,bone,-.4,.84,.31,.16,.18,.13);
    const starShape = new THREE.Shape();
    for(let i=0;i<10;i++) { const a=i*Math.PI/5+Math.PI/2,r=i%2?.095:.21; const x=Math.cos(a)*r,y=Math.sin(a)*r; i?starShape.lineTo(x,y):starShape.moveTo(x,y); } starShape.closePath();
    const starGeo = new THREE.ExtrudeGeometry(starShape,{depth:.065,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:2,steps:1});
    const stars = [-1,1].map((s,i)=>{const m=new THREE.Mesh(starGeo,gold);m.position.set(s*1.12,1.5+i*.8,-.12);m.rotation.z=s*.18;scene.add(m);return m;});
    // Small gold cap appliqués follow its surface, with independent depth.
    for(const [x,y,z] of [[-.3,.65,.37],[.05,.67,.38],[.34,.56,.42]]) { const m=new THREE.Mesh(starGeo,gold);m.scale.setScalar(.33);m.position.set(x,y,z);head.add(m); }
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, visible = true, waveUntil = 0, started = performance.now();
    const draw = (now=performance.now()) => {
      if(!visible || document.hidden) return;
      const t=(now-started)/1000;
      if(!reduced.matches) { pip.position.y=Math.sin(t*1.6)*.025; stars.forEach((s,i)=>{s.rotation.y=Math.sin(t*.65+i)*.3;}); arm.rotation.z=now<waveUntil?Math.sin(t*13)*.25:0; }
      renderer.render(scene,camera);
      if(!reduced.matches || now<waveUntil) frame=requestAnimationFrame(draw);
    };
    const refresh = () => { cancelAnimationFrame(frame); draw(); };
    const wave = () => { waveUntil=performance.now()+1700; if(reduced.matches) { arm.rotation.z=-.28; head.rotation.z=.08; } setStatus('Pip says hello! “Five more minutes?”'); refresh(); };
    const resize = new ResizeObserver(()=>{const {width,height}=element.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();refresh();}); resize.observe(element);
    const visibility = new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;refresh();}); visibility.observe(element);
    document.addEventListener('visibilitychange',refresh);
    controls.addEventListener('change',refresh); reduced.addEventListener('change',refresh);
    let down;
    const onDown = e => { down=[e.clientX,e.clientY]; };
    const onUp = e => { if(!down)return; const distance=Math.hypot(e.clientX-down[0],e.clientY-down[1]);down=null;if(distance>8)return; const rect=element.getBoundingClientRect();const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);if(ray.intersectObjects(pip.children,true).length)wave(); };
    element.addEventListener('pointerdown',onDown);element.addEventListener('pointerup',onUp);
    const onCancel=()=>{down=null;};
    element.addEventListener('pointercancel',onCancel);
    api.current={wave, turn:delta=>{pip.rotation.y+=delta;setStatus('Pip is turning to look around.');refresh();},zoom:factor=>{camera.position.sub(controls.target).multiplyScalar(factor).clampLength(5,10).add(controls.target);controls.update();refresh();},reset:()=>{pip.rotation.y=0;head.rotation.z=0;arm.rotation.z=0;waveUntil=0;camera.position.set(0,2.1,7.9);controls.target.set(0,1.5,0);controls.update();setStatus('Back to Pip’s best side.');refresh();}};
    refresh();
    return()=>{document.removeEventListener('visibilitychange',refresh);cancelAnimationFrame(frame);resize.disconnect();visibility.disconnect();reduced.removeEventListener('change',refresh);controls.dispose();element.removeEventListener('pointerdown',onDown);element.removeEventListener('pointerup',onUp);element.removeEventListener('pointercancel',onCancel);scene.traverse(o=>{if(o.geometry)o.geometry.dispose();});new Set([bone,cream,pink,dark,gold,white,iris]).forEach(m=>m.dispose());renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();api.current=null;};
  }, []);
  return <div className="club-sculpture">
    {failed ? <p role="status">This browser cannot open the 3D sculpture. Pip’s illustrated adventures below still work.</p> : <>
      <div className="club-canvas" ref={host} tabIndex={0} role="group" aria-label="Rotate Pip in 3D. Left and right arrow keys turn; plus and minus zoom."
        onKeyDown={e=>{if(['ArrowLeft','ArrowRight','+','-','Home'].includes(e.key)){e.preventDefault();if(e.key.startsWith('Arrow'))api.current?.turn(e.key==='ArrowLeft'?-.25:.25);else if(e.key==='Home')api.current?.reset();else api.current?.zoom(e.key==='+'?.9:1.1);}}}/>
      <div className="club-model-tools"><button onClick={()=>api.current?.turn(-.35)} aria-label="Turn Pip left">↶</button><button onClick={()=>api.current?.wave()}>Wave to Pip</button><button onClick={()=>api.current?.turn(.35)} aria-label="Turn Pip right">↷</button><button onClick={()=>api.current?.zoom(.9)} aria-label="Zoom in on Pip">+</button><button onClick={()=>api.current?.zoom(1.1)} aria-label="Zoom out from Pip">−</button><button onClick={()=>api.current?.reset()}>Reset</button></div>
      <p className="club-model-hint" role="status">{status}</p>
    </>}
  </div>;
}
