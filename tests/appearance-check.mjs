import assert from 'node:assert/strict';
import fs from 'node:fs';
class Element {
 constructor(tag='div'){this.tag=tag;this.children=[];this.options=[];this.style={};this.listeners={};this.value='';}
 add(option){this.options.push(option)}
 append(child){this.children.push(child)}
 replaceChildren(){this.children=[]}
 addEventListener(event,fn){this.listeners[event]=fn}
}
const nodes=Object.fromEntries(['appearancePreview','pieceTheme','boardTheme'].map(id=>[id,new Element()]));
globalThis.document={getElementById:id=>nodes[id],createElement:tag=>new Element(tag)};
globalThis.Option=class {constructor(text,value){this.text=text;this.value=value}};
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
const load=async path=>import('data:text/javascript;base64,'+fs.readFileSync(path).toString('base64'));
const app=await load('dist/appearance.js');let changes=0;app.setupAppearance(()=>changes++);
assert.equal(nodes.pieceTheme.value,'cburnett');assert.equal(nodes.boardTheme.value,'sage');
assert.equal(nodes.pieceTheme.options.length,13);assert.equal(nodes.boardTheme.options.length,3);
const chess=await load('dist/chess.js');const pgn=fs.readFileSync('dist/archive/WorldChamp1886.pgn','utf8');
const actual=chess.prepare(chess.parsePGN(pgn)[0]).positions[40].state.b;
const preview=nodes.appearancePreview.children;
assert.equal(preview.length,64);
for(let i=0;i<64;i++){
 const img=preview[i].children[0];
 assert.equal(Boolean(img),Boolean(actual[i]),'preview occupancy at '+i);
 if(img) assert.equal(img.src,app.pieceSrc(actual[i]),'preview piece at '+i);
}
for(const set of nodes.pieceTheme.options)for(const board of nodes.boardTheme.options){
 nodes.pieceTheme.value=set.value;nodes.pieceTheme.listeners.change();
 nodes.boardTheme.value=board.value;nodes.boardTheme.listeners.change();
 assert.equal(preview.length,64);
 for(const sq of preview)for(const img of sq.children)assert.ok(fs.existsSync('dist/'+img.src),'missing '+img.src);
 assert.equal(store.get('jukebox-appearance-piece'),set.value);
 assert.equal(store.get('jukebox-appearance-board'),board.value);
}
assert.equal(changes,78);
assert.equal(app.pieceClass('p').includes('themed'),true);
nodes.pieceTheme.value='chessnut';nodes.pieceTheme.listeners.change();assert.equal(app.pieceClass('p'),'piece black');
const newApp=await import('data:text/javascript;base64,'+fs.readFileSync('dist/appearance.js').toString('base64')+'#reload');newApp.setupAppearance(()=>{});
assert.equal(nodes.pieceTheme.value,'chessnut');assert.equal(nodes.boardTheme.value,'blue');
console.log('PASS: default, exact move-20 position, 39 combinations, image paths, colors, selection persistence');
