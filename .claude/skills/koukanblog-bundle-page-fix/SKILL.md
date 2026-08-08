---
name: koukanblog-bundle-page-fix
description: 交換ブログまとめページ（src/content/blog/20260308.md）を修正する。ユーザーが「koukanblog-bundle-page-fix」を明示的に指定した場合のみ使用すること。他の文脈から推測して自動的に起動してはならない。
---

# 交換ブログまとめページの修正

## 対象ファイル

以下の2ファイルのみを修正する。他のファイルは触らない。

- `src/content/blog/20260308.md`（交換ブログまとめページ本文: 交換ブログとは？ / 登場人物 / 過去テーマリスト）
- `src/data/koukanblog.json`（過去記事一覧のURLリスト）

## 手順

1. 修正対象に応じて `src/content/blog/20260308.md` または `src/data/koukanblog.json` を読む
2. ユーザーの指示（引数）に従って修正する
3. 修正内容を簡潔に報告する

## ページ構造と編集パターン

ファイルは以下のセクションで構成されている。修正時は既存のフォーマットを厳密に踏襲すること。

### 登場人物

投稿順に並ぶ。1人分のエントリのフォーマット:

```markdown
<img src="アイコンURL" alt="○○さんアイコン" width="200">

名前 / 在住地ネタ / 人物紹介（とぴの主観） / ○○の人
交換ブログに参加した経緯
X: [@handle](https://x.com/handle)
```

- エントリ間は空行2つで区切る
- アイコンは X のプロフィール画像 URL（`pbs.twimg.com/profile_images/...`）または `/icon01.png` のようなローカルパス
- `width="200"` 固定

### 過去テーマリスト

`数字はvol` の形式で `vol範囲. テーマ名` を列挙する（例: `20-24. 印象に残っている記事`）。進行中のテーマは `25-. 検索するときよくやること` のように終端を空けておく。

### 過去記事一覧

本文には URL を書かない。`src/data/koukanblog.json` の `urls` 配列で管理し、記事ページ側が自動でリンクカード表示する（frontmatter の `koukanblogList: true` がトリガー）。新着順（先頭が最新）なので、新しい記事の URL は配列の**先頭**に追加する。

## 注意

- frontmatter（`title` / `pinned` / `tags` / `koukanblogList`）は指示がない限り変更しない
- 人物紹介の文体（とぴの主観によるユーモアのある紹介）を勝手に変えない
