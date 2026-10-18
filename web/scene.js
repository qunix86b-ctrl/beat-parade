/* Original generated anime artwork, cel-pose animation and beat-locked atmosphere. */
class StoryScene {
 static images = {};
 static ready = Promise.all(['worlds','conductor'].map(name=>new Promise(resolve=>{
  const image=new Image();StoryScene.images[name]=image;image.onload=resolve;image.onerror=resolve;image.src='art/'+name+'.png';
 })));
 constructor(canvas){this.canvas=canvas;this.c=canvas.getContext('2d');this.last=null;StoryScene.ready.then(()=>{if(this.last)this.draw(...this.last)})}
 draw(theme,beat=0,progress=0,energy=0,guide=null){
  this.last=[theme,beat,progress,energy,guide];const c=this.c,W=this.canvas.width,H=this.canvas.height;
  const themes=['space','winter','farm','bridge','river','village','meadow','festival','parade','theatre','garden','mountain'];
  const index=Math.max(0,themes.indexOf(theme)),stage=Math.min(3,Math.floor(progress*4)),pulse=Math.max(0,Math.sin(beat*Math.PI*2));
  const bg=StoryScene.images.worlds,actor=StoryScene.images.conductor;
  c.clearRect(0,0,W,H);c.fillStyle='#172638';c.fillRect(0,0,W,H);
  if(bg.complete&&bg.naturalWidth){
   const tw=bg.naturalWidth/4,th=bg.naturalHeight/3;
   // Crop inside a tile to prevent neighboring atlas artwork leaking at the edges.
   const scale=Math.max(W/(tw-4),H/(th-4))*(1.04+stage*.012);
   const dw=(tw-4)*scale,dh=(th-4)*scale;
   const pan=Math.sin(beat/24+index)*Math.min((dw-W)/2,W*.045);
   c.drawImage(bg,index%4*tw+2,Math.floor(index/4)*th+2,tw-4,th-4,(W-dw)/2+pan,(H-dh)/2,dw,dh);
  }
  const shade=c.createLinearGradient(0,0,0,H);shade.addColorStop(0,'#0a132bb0');shade.addColorStop(.4,'#0a132b08');shade.addColorStop(1,'#0a132b85');c.fillStyle=shade;c.fillRect(0,0,W,H);
  // Music-driven atmosphere appropriate to each setting, with no full-screen flashes.
  c.save();
  const snow=theme==='winter',petals=['garden','meadow'].includes(theme),spark=['space','mountain'].includes(theme),confetti=['festival','parade','theatre'].includes(theme);
  if(snow||petals||spark||confetti){for(let i=0;i<26;i++){
   const x=((i*97+beat*(snow?3:7))%541)/540*W,y=((i*71+beat*(spark?2:9))%961)/960*H;
   c.globalAlpha=.3+.3*Math.sin(i+beat/4)**2;c.fillStyle=snow?'#f3f8ff':petals?'#ffb8ce':spark?'#b5e8ff':['#c6e6fa','#e7c38b','#dca8bc'][i%3];
   c.beginPath();c.ellipse(x,y,Math.max(1,W*(petals?.007:.003)),Math.max(1,W*(petals?.003:.003)),beat/4+i,0,Math.PI*2);c.fill();
  }}
  if(['river','bridge'].includes(theme)){c.globalAlpha=.15;c.strokeStyle='#cbefff';c.lineWidth=W*.002;for(let i=0;i<10;i++){let y=H*(.65+i*.025);c.beginPath();c.moveTo(W*(.1+Math.sin(i+beat/8)*.04),y);c.quadraticCurveTo(W*.5,y+Math.sin(beat+i)*4,W*.9,y);c.stroke()}}
  c.restore();
  if(actor.complete&&actor.naturalWidth){
   const cell=actor.naturalWidth/4;
   // Four deliberately drawn key poses switch on musical phrases, not every frame.
   const pose=energy>.45||stage===3?3:stage===0?0:1+(Math.floor(Math.max(0,beat)/2)%2);
   const portrait=H>W*1.2,dh=portrait?H*.62:H*.94,dw=dh*cell/actor.naturalHeight;
   const side=stage%2===0?.70:.31,dx=clampScene(W*side-dw/2,0,W-dw),dy=H*.99-dh-pulse*H*.003;
   c.save();c.translate(dx+dw/2,dy+dh);c.rotate(Math.sin(beat*Math.PI/4)*.008);c.drawImage(actor,pose*cell,0,cell,actor.naturalHeight,-dw/2,-dh,dw,dh);c.restore();
  }
  // Small rhythmic light traces tie the scenery to the input route.
  if(guide){const x=guide.x*W,y=(guide.y-.10)*H;c.save();c.globalAlpha=.7;c.strokeStyle='#ffe6aa';c.lineWidth=2;c.beginPath();c.moveTo(x-8,y);c.lineTo(x+8,y);c.moveTo(x,y-8);c.lineTo(x,y+8);c.stroke();c.restore()}
  if(energy>.1){c.save();c.globalAlpha=energy*.18;c.strokeStyle='#e5f2ff';c.lineWidth=1;for(let i=0;i<12;i++){let y=H*i/12;c.beginPath();c.moveTo(0,y);c.lineTo(W*.09,y-H*.025);c.moveTo(W,y);c.lineTo(W*.91,y-H*.025);c.stroke()}c.restore()}
 }
}
function clampScene(v,a,b){return Math.max(a,Math.min(b,v))}
