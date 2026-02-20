const MANUAL_EN = `# How to play Colamone\n* Colamone is a board game similar to chess.\n* Players will be able to advance in the direction of the point of each piece.\n* The number of a piece will be scoring if it advances to the position of the other side most.\n* Piece won the scoring can not be moved, it will be invincible.\n* It is a victory of the player score became 8 or more points.\n* When the movable piece of one is lost, the player high score is winning at that point.`;

export default function RulesPanel() {
  return (
    <div id="collapsible">
      <h5 className="howtoplay">
        <span id="htp">How to play</span>
      </h5>
      <pre id="manual">{MANUAL_EN}</pre>
    </div>
  );
}
