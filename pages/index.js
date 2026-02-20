import { useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import GameCanvas from '../components/GameCanvas';
import HeaderStatusBar from '../components/HeaderStatusBar';
import Controls from '../components/Controls';
import LogPanel from '../components/LogPanel';
import FaceButtons from '../components/FaceButtons';
import RulesPanel from '../components/RulesPanel';

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

      <span id="dialogue" />
      <span id="dialogue2" />

      <div id="page">
        <div id="main">
          <GameCanvas />

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
        </div>
      </div>

      <div id="footer">
        <p>
          (c)2014–<span id="year">{new Date().getFullYear()}</span>{' '}
          <a href="https://twitter.com/kurehajime">@kurehajime</a>
        </p>
      </div>

      <Script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js" strategy="beforeInteractive" />
      <Script type="module" src="/skyway-sdk-loader.js" strategy="afterInteractive" />
      <Script src="/boardgame_vs.js?202107132000" strategy="afterInteractive" />
      <Script src="/rtc.js?2026022001" strategy="afterInteractive" />
    </>
  );
}
