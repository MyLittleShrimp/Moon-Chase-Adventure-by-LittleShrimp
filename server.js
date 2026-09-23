import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('./dist/',import.meta.url)));
import {serveStatic} from './static-server.js';
const port=Number(process.env.PORT)||4188;
http.createServer((req,res)=>serveStatic(req,res,root)).listen(port,'0.0.0.0',()=>console.log(`Moon Chase: http://localhost:${port}`));
