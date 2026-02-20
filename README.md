# colamone_vs

colamone_vs を **Next.js + Cloud Run** で動かす構成です。  
マルチプレイ通信は legacy `skyway-js v4 Peer` から **SkyWay SDK v2 (`@skyway-sdk/room`)** に移行済みです。

## Local

```bash
npm install
cp .env.example .env.local
# .env.local に SkyWay App ID / Secret を設定
npm run dev
# http://localhost:3000
```

トップ (`/`) は `/colamone_vs.html` にリダイレクトします。

---

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
