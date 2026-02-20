export default function Controls() {
  return (
    <div id="connectionRow">
      <input type="text" id="user_name" defaultValue="Anonymous player" />
      <button type="button" id="initpeer" onClick={() => {}}>
        connect
      </button>
      <button type="button" id="disconnect" onClick={() => {}}>
        disconnect
      </button>
    </div>
  );
}
