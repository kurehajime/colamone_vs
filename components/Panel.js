import HeaderStatusBar from './HeaderStatusBar';
import Controls from './Controls';
import LogPanel from './LogPanel';
import FaceButtons from './FaceButtons';
import RulesPanel from './RulesPanel';

export default function Panel() {
  return (
    <div id="message">
      <HeaderStatusBar />
      <Controls />
      <LogPanel />
      <FaceButtons />
      <RulesPanel />
      <a id="singlePlay" href="http://xiidec.appspot.com/colamone/colamone.html">
        ★マイペースに遊びたい人向けに1人用もあります★
      </a>
    </div>
  );
}
