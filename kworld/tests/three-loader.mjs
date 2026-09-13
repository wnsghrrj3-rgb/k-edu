// Resolve browser import-map names to the repository's existing Three.js files.
export async function resolve(specifier,context,next){
  if(specifier==='three')return {url:new URL('../../labs/vendor/three185/three.module.min.js',import.meta.url).href,shortCircuit:true};
  if(specifier.startsWith('three/addons/'))return {url:new URL('../../labs/vendor/three185/'+specifier.slice(6),import.meta.url).href,shortCircuit:true};
  return next(specifier,context);
}
