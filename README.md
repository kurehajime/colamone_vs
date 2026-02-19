colamone_vs
===========

オンライン対応のボードゲームです。

## Status

- ✅ SkyWay依存を削除
- ✅ WebSocketリレー方式に移行
- ✅ リレーがない環境ではローカルフォールバックで起動

## 開発起動

```bash
npm install

# ターミナル1: relay server (ws://localhost:8080)
npm run relay

# ターミナル2: static server (http://localhost:8081)
npm start
```

ブラウザで `http://localhost:8081/colamone_vs.html` を開いてください。

## 接続先の指定

デフォルトでは `ws://<same-host>:8080` に接続します。

別のリレーに接続したい場合:

```text
http://localhost:8081/colamone_vs.html?ws=ws://your-relay.example.com:8080
```
