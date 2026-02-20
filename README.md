# colamone_vs

colamone_vs を **Next.js + Cloud Run** で動かす構成です。  
マルチプレイ通信は legacy `skyway-js v4 Peer` から **SkyWay SDK v2 (`@skyway-sdk/room`)** に移行済みです。

> UI デザイン/コンポーネント構成は `kurehajime/colamone_js` をベースに寄せています。  
> wasm への移行は**意図的に行わず**、既存 `boardgame_vs.js` / `rtc.js` ロジックをそのまま活かしています。

## Local

```bash
npm install
cp .env.example .env.local
# .env.local に SkyWay App ID / Secret を設定
npm run dev
# http://localhost:3000
```

トップ (`/`) は Next.js の React UI を直接表示します。  
互換目的で `/colamone_vs.html`（legacy static entry）も残しています。

---

## React コンポーネント構成

`pages/index.js` でゲーム画面を React で組み立て、legacy スクリプトが必要とする DOM id を維持しています。

- `components/GameCanvas.js` … 盤面 canvas ラッパー
- `components/HeaderStatusBar.js` … タイトル/ターン/スコア/接続ステータス
- `components/Controls.js` … ユーザー名/Connect/Disconnect
- `components/LogPanel.js` … ログ textarea
- `components/FaceButtons.js` … 顔文字送信ボタン群
- `components/RulesPanel.js` … ルール表示

Next.js 側は UI レンダリング担当、`public/boardgame_vs.js` と `public/rtc.js` はゲームロジック/通信担当のまま分離しています。

## SkyWay 設定

このプロジェクトでは、クライアントに secret を渡さず、Next.js API で token を発行します。

必要な環境変数（`.env.local` など）:

```bash
SKYWAY_APP_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
SKYWAY_SECRET_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

API:

- `POST /api/skyway/token`（`GET` も可）
- サーバー側で `@skyway-sdk/token` を使って 1時間有効の token を発行
- クライアント (`public/rtc.js`) は connect 時に token を fetch

> Cloud Run 本番では上記 2 変数をサービス環境変数として設定してください。

---

## Migration notes (SkyWay v4 -> v2)

- 削除: `<script src="//cdn.webrtc.ecl.ntt.com/skyway-4.4.1.js">`
- 追加: `public/skyway-sdk-loader.js`（ESM 経由で `@skyway-sdk/room` を読み込み）
- `public/rtc.js` を v2 ベースに差し替え
  - `SkyWayContext.Create(token)`
  - `SkyWayRoom.FindOrCreate({ type: 'p2p', name: 'ROOM_ID' })`
  - `SkyWayStreamFactory.createDataStream()` + `publish/subscribe`
- 既存のゲームメッセージ payload（`message`, `pid`, `name`, `map`, `turn`, `face`）は維持

---

## Build

```bash
npm run build
```

---

## Cloud Run deploy

### 手動デプロイ

```bash
gcloud config set project xiidec

gcloud run deploy colamone-vs \
  --source . \
  --region asia-northeast1 \
  --allow-unauthenticated
```

### 自動デプロイ（main/master マージ時）

`.github/workflows/deploy-cloud-run.yml` を追加済みです。  
初回セットアップは以下を1回実行:

```bash
PROJECT_ID=xiidec REPO=kurehajime/colamone_vs ./scripts/setup-github-oidc.sh
```

スクリプト実行後に表示される2つを GitHub Actions Secrets に登録:

- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT`

これで `master` への push（PRマージ含む）で Cloud Run に自動デプロイされます。
