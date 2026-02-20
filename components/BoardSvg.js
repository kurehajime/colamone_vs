import { useEffect, useMemo, useState } from 'react';

const SIZE = 500;
const GRID = 6;
const CELL = SIZE / GRID;

const COLOR_LINE = '#333333';
const COLOR_PANEL_1 = '#550025';
const COLOR_PANEL_2 = '#003856';
const COLOR_PANEL_3 = '#FFFFFF';
const COLOR_PANEL_4 = '#111111';
const COLOR_SELECT = '#88FF88';
const COLOR_RED = '#E5004F';
const COLOR_BLUE = '#00A0E9';
const COLOR_WHITE = '#FFFFFF';
const COLOR_GOLD = '#FFFF00';

const PIECES = {
  1: [1, 1, 1, 1, 0, 1, 1, 1, 1],
  2: [1, 1, 1, 1, 0, 1, 1, 0, 1],
  3: [1, 1, 1, 0, 0, 0, 1, 1, 1],
  4: [1, 1, 1, 0, 0, 0, 1, 0, 1],
  5: [1, 0, 1, 0, 0, 0, 1, 0, 1],
  6: [1, 0, 1, 0, 0, 0, 0, 1, 0],
  7: [0, 1, 0, 0, 0, 0, 0, 1, 0],
  8: [0, 1, 0, 0, 0, 0, 0, 0, 0],
  '-1': [1, 1, 1, 1, 0, 1, 1, 1, 1],
  '-2': [1, 0, 1, 1, 0, 1, 1, 1, 1],
  '-3': [1, 1, 1, 0, 0, 0, 1, 1, 1],
  '-4': [1, 0, 1, 0, 0, 0, 1, 1, 1],
  '-5': [1, 0, 1, 0, 0, 0, 1, 0, 1],
  '-6': [0, 1, 0, 0, 0, 0, 1, 0, 1],
  '-7': [0, 1, 0, 0, 0, 0, 0, 1, 0],
  '-8': [0, 0, 0, 0, 0, 0, 0, 1, 0]
};

function Cell({ x, y }) {
  const fill = y === 0 ? COLOR_PANEL_1 : y === 5 ? COLOR_PANEL_2 : (x + y) % 2 === 0 ? COLOR_PANEL_3 : 'url(#darkGrad)';
  return <rect x={x * CELL} y={y * CELL} width={CELL} height={CELL} fill={fill} stroke={COLOR_LINE} strokeWidth="1" />;
}

function Piece({ x, y, number, goal }) {
  if (!number) return null;
  const key = String(number);
  const wkColor = number > 0 ? COLOR_BLUE : COLOR_RED;
  const inset = CELL / 10;
  const pieceSize = CELL - (CELL / 5);
  const dots = PIECES[key] || [];

  return (
    <g>
      <defs>
        <linearGradient id={`pieceGrad-${x}-${y}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgb(255,255,255)" />
          <stop offset="40%" stopColor={wkColor} />
          <stop offset="100%" stopColor={wkColor} />
        </linearGradient>
      </defs>
      <rect x={x + inset} y={y + inset} width={pieceSize} height={pieceSize} fill={`url(#pieceGrad-${x}-${y})`} />
      <text x={x + CELL / 2} y={y + CELL / 2} fill={goal ? COLOR_GOLD : COLOR_WHITE} fontSize={CELL * 0.24} dominantBaseline="middle" textAnchor="middle" fontFamily="Arial">{Math.abs(number)}</text>
      {dots.map((dot, i) => {
        if (!dot) return null;
        const dotX = x + CELL / 4.16 + (Math.floor(pieceSize) / 3) * (i % 3);
        const dotY = y + CELL / 4.16 + (Math.floor(pieceSize) / 3) * Math.floor(i / 3);
        return <circle key={i} cx={dotX} cy={dotY} r={CELL * 0.06} fill={goal ? COLOR_GOLD : COLOR_WHITE} />;
      })}
    </g>
  );
}

export default function BoardSvg() {
  const [state, setState] = useState(() => (typeof window === 'undefined' ? {} : window.__colamoneRenderState || {}));

  useEffect(() => {
    const onRender = () => setState({ ...(window.__colamoneRenderState || {}) });
    window.addEventListener('colamone:render', onRender);
    onRender();
    return () => window.removeEventListener('colamone:render', onRender);
  }, []);

  const cells = useMemo(() => {
    const list = [];
    for (let x = 0; x < 6; x += 1) for (let y = 0; y < 6; y += 1) list.push({ x, y });
    return list;
  }, []);

  const map = state.map || {};
  const hoverPiece = state.hoverPiece ?? null;
  const hoverNumber = state.hoverNumber ?? 0;
  const mouseX = state.mouseX ?? 0;
  const mouseY = state.mouseY ?? 0;
  const highlights = state.highlights || [];
  const selectedCell = state.selectedCell;

  return (
    <div id="canvWrap">
      <svg id="canv" viewBox={`0 0 ${SIZE} ${SIZE}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="darkGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#888888" />
            <stop offset="30%" stopColor="#444444" />
            <stop offset="100%" stopColor="#111111" />
          </linearGradient>
        </defs>

        {cells.map((cell) => <Cell key={`${cell.x}-${cell.y}`} {...cell} />)}

        <circle cx={CELL * 1} cy={-3 * CELL} r={7 * CELL} fill={COLOR_WHITE} opacity="0.07" />

        {selectedCell ? <rect x={selectedCell.x * CELL} y={selectedCell.y * CELL} width={CELL} height={CELL} fill={COLOR_SELECT} opacity="0.5" /> : null}
        {highlights.map((p) => {
          const x = Math.floor(p / 10);
          const y = p % 10;
          return <circle key={p} cx={x * CELL + CELL / 2} cy={y * CELL + CELL / 2} r={CELL / 2 - 10} fill="none" stroke={COLOR_SELECT} strokeWidth="5" />;
        })}

        {cells.map(({ x, y }) => {
          const idx = x * 10 + y;
          const number = map[idx] || 0;
          if (!number || idx === hoverPiece) return null;
          const goal = (number > 0 && y === 0) || (number < 0 && y === 5);
          return <Piece key={`piece-${idx}`} x={x * CELL} y={y * CELL} number={number} goal={goal} />;
        })}

        {hoverPiece != null && hoverNumber ? (
          <Piece x={mouseX - CELL / 2} y={mouseY - CELL / 2} number={hoverNumber} goal={false} />
        ) : null}

        {state.message ? (
          <g>
            <rect x={CELL * 1.5} y={CELL * 2.5} width={CELL * 3} height={CELL * 1} fill={COLOR_WHITE} opacity="0.8" />
            <text x={CELL * 3} y={CELL * 3} fill={COLOR_LINE} fontWeight="bold" fontSize={CELL * 0.36} dominantBaseline="middle" textAnchor="middle">
              {state.message}
            </text>
          </g>
        ) : null}
      </svg>
    </div>
  );
}
