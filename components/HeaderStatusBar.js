export default function HeaderStatusBar() {
  return (
    <div id="head">
      <span id="gamename">Colamone VS</span> β by{' '}
      <a href="https://twitter.com/kurehajime">@kurehajime</a>
      <br />
      <b>Turn:</b> <span id="turn" />
      <span className="score">
        Blue: <span id="blue" /> / Red: <span id="red" />
      </span>
      <span id="wins" /> <span id="status" />
    </div>
  );
}
