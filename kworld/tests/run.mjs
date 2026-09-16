import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
for(const [test,era] of [['test_paleo_loop.mjs','paleo'],['test_landscape.mjs','paleo'],['test_neo_loop.mjs','neolithic'],['test_neo_glb.mjs','neolithic'],['test_bronze_loop.mjs','bronze'],['test_bronze_glb.mjs','bronze'],['test_gojoseon_loop.mjs','gojoseon'],['test_gojoseon_glb.mjs','gojoseon'],['test_story_loop.mjs','story-p1'],['test_assets.mjs','']]){
 const result=spawnSync(process.execPath,['--experimental-loader',fileURLToPath(new URL('three-loader.mjs',import.meta.url)),fileURLToPath(new URL(test,import.meta.url)),fileURLToPath(new URL(`../eras/${era}/`,import.meta.url))],{stdio:'inherit'});
 if(result.status!==0)process.exit(result.status||1);
}
