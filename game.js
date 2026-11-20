const island = document.getElementById('island');
const crystalsEl = document.getElementById('crystals');
const coinsEl = document.getElementById('coins');
const progressBar = document.getElementById('progressBar');
const toast = document.getElementById('toast');

let player = { r: 5, c: 0 };
let crystals = new Set(['0,2','1,4','3,1','4,4','5,3']);
let coins = new Set(['0,4','2,1','2,5','4,2','5,5']);
let collected = 0;
let coinCount = 0;
let soundOn = true;

function tilePosition(r,c) {
  return `left:${(c * 16.667 + .75)}%; top:${(r * 16.667 + .75)}%;`;
}

function render() {
  island.innerHTML = '';
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      const key = `${r},${c}`;
      const tile = document.createElement('button');
      tile.className = `tile ${(r+c)%3===0?'alt':((r+c)%3===2?'dark':'')}`;
      tile.style.cssText = tilePosition(r,c);
      tile.setAttribute('aria-label', `Tile row ${r+1}, column ${c+1}`);
      tile.addEventListener('click', () => moveTo(r,c));

      const content = document.createElement('span');
      content.className = 'tile-content';
      if (player.r === r && player.c === c) {
        tile.classList.add('player');
        content.innerHTML = '<span class="player-model"></span>';
      } else if (crystals.has(key)) {
        content.innerHTML = '<span class="crystal"></span>';
      } else if (coins.has(key)) {
        content.innerHTML = '<span class="coin2"></span>';
      } else if (r === 0 && c === 0) {
        tile.classList.add('goal');
        content.innerHTML = '<span class="flag"></span>';
      }
      tile.appendChild(content);
      island.appendChild(tile);
    }
  }
  crystalsEl.textContent = collected;
  coinsEl.textContent = coinCount;
  progressBar.style.width = `${(collected / 5) * 100}%`;
}

function moveTo(r,c) {
  if (r < 0 || r > 5 || c < 0 || c > 5) return;
  if (Math.abs(r-player.r)+Math.abs(c-player.c) !== 1) {
    tileNudge(r,c); return;
  }
  player = {r,c};
  const key = `${r},${c}`;
  if (crystals.has(key)) {
    crystals.delete(key); collected++;
    showToast(collected === 5 ? 'Island complete!' : 'Crystal found!');
  }
  if (coins.has(key)) {
    coins.delete(key); coinCount++;
    if (!crystals.size) showToast('Bonus coin!');
  }
  if (collected === 5 && r === 0 && c === 0) {
    showToast('QUEST COMPLETE!');
  }
  render();
}

function tileNudge(r,c) {
  const index = r*6+c;
  const tile = island.children[index];
  if (!tile) return;
  tile.animate([{transform:'translateZ(0)'},{transform:'translateZ(10px)'},{transform:'translateZ(0)'}],{duration:180});
}

function moveDir(dir) {
  const moves = {up:[-1,0], down:[1,0], left:[0,-1], right:[0,1]};
  const [dr,dc] = moves[dir];
  moveTo(player.r+dr, player.c+dc);
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1500);
}

document.querySelectorAll('.move-btn').forEach(btn => btn.addEventListener('click', () => moveDir(btn.dataset.dir)));
window.addEventListener('keydown', e => {
  const keys = {ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'};
  if (keys[e.key]) { e.prevent; moveDir(keys[e.key]); }
});
document.getElementById('resetBtn').addEventListener('click', () => {
  player={r:5,c:0}; crystals=new Set(['0,2','1,4','3,1','4,4','5,3']); coins=new Set(['0,4','2,1','2,5','4,2','5,5']); collected=0;coinCount=0; render();showToast('Island reset');
});
document.getElementById('soundBtn').addEventListener('click', e => { soundOn=!soundOn;e.target.textContent=soundOn?'♪':'×'; });
document.getElementById('centerBtn').addEventListener('click', () => showToast('View centered'));

render();
