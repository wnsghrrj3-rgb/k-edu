import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
for(const test of ['test_paleo_loop.mjs','test_landscape.mjs']){
 const result=spawnSync(process.execPath,['--experimental-loader',fileURLToPath(new URL('three-loader.mjs',import.meta.url)),fileURLToPath(new URL(test,import.meta.url)),fileURLToPath(new URL('../eras/paleo/',import.meta.url))],{stdio:'inherit'});
 if(result.status!==0)process.exit(result.status||1);
}
