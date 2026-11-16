// Stockfish is a separate, GPL-licensed engine; see engine/README.txt.
const square=i=>'abcdefgh'[i%8]+(8-Math.floor(i/8));
export function uciMoves(game, index){
  return game.positions.slice(1,index+1).map((p,i)=>{
    const previous=game.positions[i].state.b, moved=previous[p.from], landed=p.state.b[p.to];
    const promotion=moved?.toLowerCase()==='p'&&landed?.toLowerCase()!=='p'?landed.toLowerCase():'';
    return square(p.from)+square(p.to)+promotion;
  }).join(' ');
}
export class LiveEvaluation {
  constructor(onUpdate){this.onUpdate=onUpdate;this.worker=null;this.ready=false;this.active=false;this.stopping=false;this.desired=null;this.current=null;}
  start(){if(this.worker)return;try{const worker=new Worker('./engine/stockfish.js');this.worker=worker;worker.onmessage=e=>{if(this.worker===worker)this.receive(String(e.data))};worker.onerror=()=>{if(this.worker===worker)this.fail()};worker.postMessage('uci');this.onUpdate({status:'loading'});}catch{this.fail()}}
  fail(){this.stop();this.onUpdate({status:'unavailable'})}
  stop(){if(this.worker)this.worker.terminate();this.worker=null;this.ready=false;this.active=false;this.stopping=false;this.desired=null;this.current=null}
  setPosition(game,index){if(!this.worker||!game)return;const moves=uciMoves(game,index),key=moves||'start';if(this.desired?.key===key)return;this.desired={key,moves,side:index%2?'b':'w'};this.onUpdate({status:'thinking'});if(!this.ready)return;if(this.active&&!this.stopping){this.stopping=true;this.worker.postMessage('stop')}else if(!this.active)this.run()}
  run(){if(!this.ready||!this.desired||!this.worker)return;this.current=this.desired;this.active=true;this.stopping=false;this.worker.postMessage('position startpos'+(this.current.moves?' moves '+this.current.moves:''));this.worker.postMessage('go infinite')}
  receive(line){if(!this.worker)return;if(line==='uciok'){this.worker.postMessage('setoption name Hash value 16');this.worker.postMessage('isready');return}if(line==='readyok'){this.ready=true;this.run();return}if(line.startsWith('bestmove')){const wasStopping=this.stopping;this.active=false;this.stopping=false;if(wasStopping&&this.desired)this.run();return}if(!this.active||this.stopping||this.current?.key!==this.desired?.key)return;let m=line.match(/\bscore (cp|mate) (-?\d+)/);if(!m||/\b(?:upperbound|lowerbound)\b/.test(line))return;let value=Number(m[2])*(this.current.side==='w'?1:-1);this.onUpdate({status:'ready',kind:m[1],value})}
}
