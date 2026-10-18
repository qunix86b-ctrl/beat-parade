const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context=vm.createContext({console, setInterval,clearInterval});
for(const f of ['songs','game'])vm.runInContext(fs.readFileSync(`web/${f}.js`,'utf8'),context);
vm.runInContext(`
let checks=0;
function check(v,m){if(!v)throw Error(m);checks++}
check(SONGS.length>=12,'12 tracks');
check(new Set(SONGS.map(s=>s.id)).size===SONGS.length,'unique tracks');
for(const song of SONGS)for(const difficulty of ['easy','normal','hard']){
 const c=chart(song,difficulty);
 check(c.duration>45&&c.duration<140,'duration '+song.id);
 for(const type of ['tap','slide','spin'])check(c.notes.some(n=>n.type===type),'missing '+type+' '+song.id);
 let end=-1;
 for(const n of c.notes){check(n.time>=end-.001,'overlapping gesture '+song.id);end=n.time+n.duration;check(n.x>.1&&n.x<.9&&n.y>.3&&n.y<.8,'safe position');check(end<c.duration,'end time');check(n.number>=1&&n.number<=5,'phrase numbering range');if(n.id){const previous=c.notes[n.id-1],reset=previous.number===5||n.time-previous.time-previous.duration>=Math.max(.6,60/song.bpm*1.5)-.001||previous.type!=='tap';check(n.number===(reset?1:previous.number+1),'phrase restart '+song.id)}else check(n.number===1,'first label');if(n.id){const p=c.notes[n.id-1],x=p.type==='slide'?p.endX:p.x,y=p.type==='slide'?p.endY:p.y;check(Math.abs(n.x-x)<=.22&&Math.abs(n.y-y)<=.08,'continuous route '+song.id)}check(visibleNotes(c.notes,n.time-.1).length<=3,'visible cap')}
 for(const n of c.arrangement.notes)check(Number.isFinite(midi(n.pitch)),'valid pitch')
}
const phraseFixture=[0,.4,.8,2,2.4,2.8,3.2,4.5,4.9,5.3,5.7,6.1,6.5].map(time=>({time,duration:0,type:'tap'}));
numberPhrases(phraseFixture,.4);check(phraseFixture.map(n=>n.number).join(',')==='1,2,3,1,2,3,4,1,2,3,4,5,1','three/four notes then pause restarts');
check(RING_SPEED===40&&APPROACH_LEAD===2.4,'slower approach configuration');check(Math.abs(ringRadius(-2)-ringRadius(-1)-40)<.001,'continuous slow shrink');
check(visibleNotes([{state:'pending',time:2,duration:0}],0).length===1,'two second preview');
check(timingGrade(.074)==='perfect','perfect window');check(timingGrade(.12)==='great','great window');check(timingGrade(-.18)==='good','good window');check(timingGrade(.2)==='bad','bad window');check(timingGrade(.281)==='miss','miss window');
for(const diff of ['easy','normal','hard']){const w=timingWindows(diff);for(const sign of [-1,1])for(const [error,expected] of [[0,'perfect'],[(w[0]+w[1])/2,'great'],[(w[1]+w[2])/2,'good'],[(w[2]+BAD_WINDOW)/2,'bad']]){const radius=ringRadius(sign*error);const reconstructed=(RING_TARGET-radius)/RING_SPEED;check(timingGrade(reconstructed,diff)===expected,'visual ring matches timing '+diff)}}
check(points('perfect',10,'tap')===1500,'combo multiplier');check(points('perfect',80,'tap')===5000,'combo cap');check(points('perfect',1000,'tap')===5000,'cap remains');check(points('miss',80,'spin')===0,'miss score');check(points('perfect',0,'spin')===3000,'spin score');check(Math.abs(wrapAngle(-6.2))<.1,'angle unwrap');
console.log(checks+' chart/scoring assertions passed across 36 charts');
`,context);
