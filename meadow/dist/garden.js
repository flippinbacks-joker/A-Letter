const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const letter = document.querySelector("dialog");
let folds = [];
let closing = false;
document.querySelector("#open").onclick = () => {
  if (letter.open) return;
  letter.classList.remove("closing");
  letter.showModal();
  if (motion.matches) return;

  const timing = {duration: 850, easing: "ease-in-out", fill: "both"};
  const top = letter.querySelector(".paper-top");
  const bottom = letter.querySelector(".paper-bottom");
  folds = [
    letter.animate([{opacity: 0, offset: 0}, {opacity: 1, offset: .25}, {opacity: 1}], timing),
    top.animate([{transform: "rotateX(-176deg)"}, {transform: "rotateX(0deg)", offset: .78}, {transform: "none"}], timing),
    bottom.animate([{transform: "rotateX(176deg)"}, {transform: "rotateX(176deg)", offset: .18}, {transform: "rotateX(0deg)"}], timing)
  ];
};
async function foldLetter() {
  if (closing || !letter.open) return;
  closing = true;
  letter.classList.add("closing");
  if (!motion.matches) {
    for (const fold of folds) fold.reverse();
    await Promise.allSettled(folds.map(fold => fold.finished));
  }
  letter.close();
  for (const fold of folds) fold.cancel();
  folds = [];
  closing = false;
}
document.querySelector("#close").onclick = foldLetter;
letter.addEventListener("cancel", event => {
  event.preventDefault();
  foldLetter();
});
let seed = 94;
function random() {
  seed = seed * 16807 % 2147483647;
  return seed / 2147483647;
}
const stems = Array.from({length:68}, (_,i) => {
  const x = (random()-.5)*470;
  return {x,y:24+Math.abs(x)*.24+random()*118, kind:i<19?0:1+i%5,
    size:7+random()*11, phase:random()*6.28, lean:random()-.5};
}).sort((a,b)=>a.y-b.y);
function oval(x,y,w,h,angle,color){
  ctx.beginPath();ctx.ellipse(x,y,w,h,angle,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
}
function line(x,y,cx,cy,ex,ey,color,width){
  ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(cx,cy,ex,ey);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
}
function ease(value){
  const t=Math.max(0,Math.min(1,value));
  return t*t*(3-2*t);
}
function draw(time){
  const w=canvas.clientWidth,h=canvas.clientHeight,d=Math.min(devicePixelRatio||1,2);
  if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){
    canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);
  }
  ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,w,h);
  const s=Math.min(w/525,h/334);
  ctx.translate(w/2,(h-334*s)/2+8*s);ctx.scale(s,s);
  stems.forEach(({x,y,kind,size,phase,lean})=>{
    const age=time-phase*105;
    const growth=ease(age/1850);
    if(!growth)return;
    ctx.save();
    ctx.translate(0,264);
    ctx.scale(growth,growth);
    ctx.translate(0,-264);
    const breeze=Math.sin(time*.00083+x*.003)*3.6;
    const wave=breeze+Math.sin(time*.00126+phase)*1.6;
    const tx=x+wave, base=-x*.14, bend=x*.51+lean*34+wave*.32;
    line(base,306+lean*22,bend,162,tx,y,"#697749",1.4);
    for(let j=1;j<6;j++){
      const t=j/7, u=1-t;
      const lx=u*u*base+2*t*u*bend+t*t*tx;
      const ly=u*u*(306+lean*22)+2*t*u*162+t*t*y;
      const side=j%2?1:-1;
      ctx.save();ctx.translate(lx,ly);ctx.rotate(side*.86+x*.0016);
      const leaf=ease((age-190-j*120)/820);
      ctx.scale(leaf,leaf);
      ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-6,-13,0,-24-size*.5);ctx.quadraticCurveTo(6,-12,0,0);
      ctx.fillStyle=["#839163","#657c52","#a2a579"][j%3];ctx.fill();ctx.restore();
    }
    const bloom=ease((age-1120)/1340);
    ctx.save();ctx.translate(tx,y);ctx.rotate(lean*.7+wave*.008);
    ctx.scale(bloom*bloom,bloom);
    if(kind===0||kind===3){
      for(let j=0;j<12;j++){
        const side=j%2?1:-1,yy=-j*2.4;
        oval(side*(4-j*.24),yy,2.6,5-j*.19,side*.6,kind===0?["#8d88ac","#aba3c3","#716d95"][j%3]:"#8b9965");
      }
    }else{
      const palette={1:["#e3a29c","#eeb8a8"],2:["#d99640","#efb853"],4:["#efe6cd","#fffaf0"],5:["#dc8262","#ef9677"]}[kind];
      const count=kind===5?6:kind===1?9:15;
      ctx.scale(1,.78+Math.abs(lean)*.35);
      for(let j=0;j<count;j++){
        ctx.rotate(2*Math.PI/count);
        oval(0,-size*.57,size*(count===15?.18:.39),size*.62,.09,palette[j%2]);
        line(0,-2,1,-size*.55,0,-size*.93,"#79654740",.65);
      }
      oval(0,0,size*.26,size*.25,0,kind===5?"#56483a":"#b98b37");
      for(let j=0;j<9;j++)oval(Math.cos(j*2.4)*size*.16,Math.sin(j*2.4)*size*.16,.8,.8,0,"#e7bf66");
    }
    ctx.restore();
    ctx.restore();
  });
  ctx.save();
  const ribbon=ease((time-1060)/1050);
  ctx.translate(0,264);ctx.scale(ribbon,ribbon);ctx.translate(0,-264);
  line(-12,263,0,267,13,262,"#ae8466",4);
  for(const side of [-1,1]){
    ctx.beginPath();ctx.moveTo(0,264);ctx.bezierCurveTo(side*59,233,side*44,287,0,264);
    ctx.bezierCurveTo(side*9,279,side*10,291,side*30,299);ctx.strokeStyle="#b58c76";ctx.lineWidth=2.6;ctx.stroke();
  }
  ctx.restore();
}
const motion=matchMedia("(prefers-reduced-motion: reduce)");
let frame;
let started;
function animate(time){
  started ??= time;
  draw(motion.matches ? 3200 : time-started);
  if(!motion.matches)frame=requestAnimationFrame(animate);
}
function restart(){
  cancelAnimationFrame(frame);
  started=undefined;
  frame=requestAnimationFrame(animate);
}
motion.addEventListener("change",restart);
new ResizeObserver(()=>{if(motion.matches)draw(3200);}).observe(canvas);
restart();
