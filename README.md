colamone_vs
===========

オンライン対応のボードゲームです。

## Status

- ✅ **静的サイトとして単体で動作**（デフォルトはローカルモード）
- ✅ SkyWay依存を削除
- ✅ WebSocketリレー方式（任意）に対応

## 使い方（静的サイト）

このリポジトリは静的ホスティング（GitHub Pages等）でそのまま動きます。

- `colamone_vs.html` を開く
- Connectボタンでローカル対戦モード開始

> サーバなしで成立する構成です。

## オンライン対戦（任意）

2人対戦をWebSocketで中継したい場合だけリレーを起動します。

```bash
npm install
npm run relay
```

接続先をURLで指定:

```text
https://<your-static-site>/colamone_vs.html?ws=wss://your-relay.example.com
```

ローカル開発例:

```text
http://localhost:8081/colamone_vs.html?ws=ws://localhost:8080
```
