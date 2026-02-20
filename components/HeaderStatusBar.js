export default function HeaderStatusBar() {
  return (
    <div id="head">
      <span id="gamename">Colamone VS</span> β by <a href="https://twitter.com/kurehajime">@kurehajime</a>
      <br />
      <span id="turnLabel">Turn:</span> <span id="turn" />
      <span className="score">
        Blue: <span id="blue" /> /8 - Red: <span id="red" /> /8
      </span>
      <span id="wins" />
      <span id="status" />
    </div>
  );
}
