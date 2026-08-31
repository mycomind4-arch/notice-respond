import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
const root = new URL('.', import.meta.url).pathname;
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css'};
createServer(async (req,res)=>{try{const path=req.url==='/'?'/index.html':req.url;const data=await readFile(join(root,path));res.writeHead(200,{'content-type':types[extname(path)]??'application/octet-stream'});res.end(data)}catch{res.writeHead(404);res.end('Not found')}}).listen(4173,()=>console.log('Platform UI: http://localhost:4173'));
