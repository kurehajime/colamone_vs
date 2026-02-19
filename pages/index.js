import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    window.location.replace('/colamone_vs.html');
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>colamone_vs</h1>
      <p>Redirecting to game...</p>
      <p>
        If not redirected, <a href="/colamone_vs.html">open game</a>.
      </p>
    </main>
  );
}
