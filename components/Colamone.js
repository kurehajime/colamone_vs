import GameCanvas from './GameCanvas';
import Panel from './Panel';
import Header from './Header';
import Footer from './Footer';

export default function Colamone() {
  return (
    <>
      <Header />
      <div id="page">
        <div id="main">
          <GameCanvas />
          <Panel />
        </div>
      </div>
      <Footer />
    </>
  );
}
