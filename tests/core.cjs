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
 for(const n of c.notes){check(n.time>=end-.001,'overlapping gesture '+song.id);end=n.time+n.duration;check(n.x>.1&&n.x<.9&&n.y>.3&&n.y<.8,'safe position');check(end<c.duration,'end time')}
 for(const n of c.arrangement.notes)check(Number.isFinite(midi(n.pitch)),'valid pitch')
}
check(timingGrade(.074)==='perfect','perfect window');check(timingGrade(.12)==='great','great window');check(timingGrade(-.18)==='good','good window');check(timingGrade(.2)==='miss','miss window');
check(points('perfect',10,'tap')===1500,'combo multiplier');check(points('perfect',80,'tap')===5000,'combo cap');check(points('perfect',1000,'tap')===5000,'cap remains');check(points('miss',80,'spin')===0,'miss score');check(points('perfect',0,'spin')===3000,'spin score');check(Math.abs(wrapAngle(-6.2))<.1,'angle unwrap');
console.log(checks+' chart/scoring assertions passed across 36 charts');
`,context);
