const pieceSets = [
  ['cburnett','Cburnett'], ['chessnut','Chessnut (original)'], ['kaneo','Kaneo'],
  ['livius','Livius'], ['hera','Hera'], ['celtic','Celtic'], ['fantasy','Fantasy'],
  ['spatial','Spatial'], ['firi','Firi'], ['papercut','Papercut'], ['totoy','Totoy'],
  ['rhosgfx','RhosGFX'], ['kiwen-suwi','Kiwen-suwi']
];
const boards = [['sage','Sage (original)'], ['walnut','Walnut tones'], ['blue','Blue']];
const colors = {sage:['#dedac1','#79907b'],walnut:['#f0d9b5','#946b50'],blue:['#e3e8eb','#768f9e']};
// Zukertort–Steinitz, 1886 game 1, after 20...Rg6.
const position = 'r2qk3/ppb2pp1/2p2nr1/1PPp1b1p/P2Pp3/2N1P2P/1B1NB3/R4KQR';
const state = {piece:'cburnett',board:'sage'};
for (const kind of ['piece','board']) {
  try {
    const saved=localStorage.getItem('jukebox-appearance-'+kind);
    if ((kind==='piece'?pieceSets:boards).some(([id])=>id===saved)) state[kind]=saved;
  } catch {}
}
export function pieceSrc(p) {
  if (state.piece==='chessnut') return `pieces/w${p.toUpperCase()}.svg`;
  const color=p===p.toUpperCase()?'w':'b', ext=state.piece==='hera'?'png':'svg';
  return `theme-assets/pieces/${state.piece}/${color}${p.toUpperCase()}.${ext}`;
}
export function pieceClass(p) {
  const color=p===p.toUpperCase()?'white':'black';
  return 'piece '+color+(state.piece==='chessnut'?'':' themed');
}
export function styleSquare(el,i) {
  const dark=(Math.floor(i/8)+i%8)%2;
  el.style.backgroundColor=colors[state.board][dark];
}
export function setupAppearance(onChange) {
  const preview=document.getElementById('appearancePreview');
  for (const [kind, options] of [['piece',pieceSets], ['board',boards]]) {
    const select=document.getElementById(kind+'Theme');
    for (const [id,label] of options) select.add(new Option(label,id));
    select.value=state[kind];
    select.addEventListener('change',()=>{
      state[kind]=select.value;
      try {localStorage.setItem('jukebox-appearance-'+kind,state[kind])} catch {}
      drawPreview(); onChange();
    });
  }
  function drawPreview() {
    preview.replaceChildren(); let i=0;
    for (const rank of position.split('/')) for (const c of rank) {
      const n=/\d/.test(c)?Number(c):1;
      for (let j=0;j<n;j++,i++) {
        const sq=document.createElement('div');
        sq.className='square'+((Math.floor(i/8)+i%8)%2?' dark-square':'');
        styleSquare(sq,i);
        if (!/\d/.test(c)) {
          const img=document.createElement('img'); img.className=pieceClass(c);
          img.src=pieceSrc(c); img.alt=''; img.draggable=false; sq.append(img);
        }
        preview.append(sq);
      }
    }
  }
  drawPreview();
}
