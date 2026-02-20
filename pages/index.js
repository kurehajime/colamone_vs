import { useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import Colamone from '../components/Colamone';

function getLang() {
  if (typeof navigator === 'undefined') return 'en';
  const lng = (navigator.browserLanguage || navigator.language || navigator.userLanguage || 'en')
    .substr(0, 2)
    .toLowerCase();
  return lng === 'ja' ? 'ja' : 'en';
}

function applyManualLanguage(lang) {
  const manual = document.getElementById('manual');
  if (!manual) return;

  if (lang === 'ja') {
    manual.innerHTML = `【ルール】\n・各コマは、丸が付いている方向に進めます。\n・一番奥の陣地まで進めると、コマに書かれている数字が得点になります。\n・得点になったコマは動かすことができません。\n・得点が8点以上になれば勝利です。\n・片方の動かせるコマが無くなった時はその時点で点数の高い方が勝利です。`;

    const initpeer = document.getElementById('initpeer');
    const disconnect = document.getElementById('disconnect');
    if (initpeer) initpeer.innerHTML = '接続';
    if (disconnect) disconnect.innerHTML = '切断';
  }
}

export default function Home() {
  useEffect(() => {
    window.get_lang = getLang;
    applyManualLanguage(getLang());
  }, []);

  return (
    <>
      <Head>
        <title>colamone VS β</title>
        <meta name="viewport" content="width=device-width,user-scalable=no" />
        <link rel="stylesheet" href="/boardgame.css" />
      </Head>

      <Colamone />

      <Script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js" strategy="beforeInteractive" />
      <Script type="module" src="/skyway-sdk-loader.js" strategy="afterInteractive" />
      <Script src="/boardgame_vs.js?202107132000" strategy="afterInteractive" />
      <Script src="/rtc.js?2026022001" strategy="afterInteractive" />
    </>
  );
}
