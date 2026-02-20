const FACES = ['(´・ω・｀)', 'ヽ(ﾟ∀ﾟ)ﾉ', '(灬ºωº灬)', '(´；ω；｀)', 'ヽ(´∀｀)人(´∀｀)ﾉ'];

export default function FaceButtons() {
  return (
    <div id="faceRow">
      {FACES.map((face, index) => (
        <button key={face} type="button" id={`face${index + 1}`} onClick={() => {}}>
          {face}
        </button>
      ))}
    </div>
  );
}
