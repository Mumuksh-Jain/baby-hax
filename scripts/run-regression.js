import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
const results=[];
for(const script of ['verify-final.js','verify-artkit.js','verify-pass01c4c.js']) {
 const result=spawnSync(process.execPath,[`scripts/${script}`],{encoding:'utf8'});
 process.stdout.write(result.stdout||'');
 process.stderr.write(result.stderr||'');
 results.push({script,exitCode:result.status,stdout:result.stdout,stderr:result.stderr});
 if(result.status!==0)process.exitCode=1;
}
fs.mkdirSync('screenshots/redesign',{recursive:true});
fs.writeFileSync('screenshots/redesign/regression-results.json',JSON.stringify(results,null,2));
