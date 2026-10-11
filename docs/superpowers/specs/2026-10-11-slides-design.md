# スライド機能 設計

## 目的

勉強会・LTで発表しつつ、ブログ上でアーカイブとして公開できるスライドを、MDXで書いて生成する。

- 配色・レイアウトはブログに合わせて固定（スカイブルー基調、Noto Sans JP、16:9）
- 内容に応じて画像・図形・任意のHTMLを差し込める
- 対象外：発表者ノート、PDF書き出し

## コンテンツ

```
src/content/slides/
  20261020-isucon-review/
    index.mdx
    architecture.png
```

- ディレクトリ名は `yyyymmdd-名前`（名前部分は必須）。
  - 日付はディレクトリ名の先頭8桁から求める。
  - URLは名前部分のみ：`/slides/isucon-review`。
  - 名前部分が重複したらビルドエラーにする。
- 画像は同じディレクトリに置き、MDXから相対パスで参照する（`astro:assets` で最適化）。
- `content.config.ts` に `slides` コレクションを追加（`glob` で `**/index.mdx`）。

frontmatter：

| key | 必須 | 用途 |
|---|---|---|
| `title` | ○ | タイトル（表紙・一覧・OGP） |
| `event` | | イベント名 |
| `eventUrl` | | イベントURL |
| `description` | | 一覧・OGPの説明 |
| `draft` | | ブログと同じく、本番ビルドで除外 |

## MDXの書き方

- `---`（thematic break）でスライドを区切る。
- 表紙は frontmatter の title / event / 日付から自動生成し、本文は2枚目から書く。
- 各スライド先頭の `{/* layout: xxx */}` でレイアウトを指定する（省略時は `default`）。

| layout | 用途 |
|---|---|
| `default` | 見出し＋本文・箇条書き・コード |
| `section` | 章区切り（大きな見出し、配色反転） |
| `center` | 一言メッセージを大きく中央に表示 |
| `image` | 画像を全面に表示し、alt をキャプションにする |
| `end` | 締めのスライド |

未知の layout はビルドエラーにする。

差し込み用コンポーネント（`src/components/slides/`）：

- `<Columns ratio="1:1">`：子要素を列に並べる
- `<Box title color>`：強調カード（color はテーマ内の数色から選ぶ）
- `<Place x y w h>`：1280×720 キャンバス上の座標で絶対配置する
- 上記で足りない場合は Tailwind クラス付き HTML やインライン SVG を直接書く
- ` ```mermaid ` を使える（既存 `remarkMermaid` を MDX でも動く出力に対応させる）

## ビルド構成

- `@astrojs/mdx` を追加する。ブログ用の `remarkBreaks` 等は MDX と相性が悪いため `extendMarkdownConfig: false` とし、MDX には `remarkMermaid` と `remarkSlides` だけを適用する。
- `src/lib/remarkSlides.mjs`：ルート直下の `---` で子ノードを分割し、各グループを `<section class="slide" data-layout="...">` に包む。
- スタイルは `.slide` 配下にスコープし、ブログの `.article-body` とは分ける。

## ページ

- `/slides`：一覧（新しい順のカード。タイトル・イベント名・日付・説明）。ヘッダーに「Slides」を追加する。
- `/slides/[slug]`：BaseLayout 内にビューアを埋め込み、下にイベント情報と一覧への戻りリンクを置く。

## ビューア（`SlideViewer.astro`）

表示：

- 各スライドは 1280×720 固定で描画し、親要素の幅に合わせて `transform: scale()` する。
- JS 無効時は全スライドを縦に並べて表示し、JS 有効時に1枚ずつの表示に切り替える。

操作：

- 次へ：`→` `↓` `Space` `PageDown`、右半分クリック、左スワイプ
- 前へ：`←` `↑` `PageUp`、左半分クリック、右スワイプ
- `Home` / `End`：最初・最後、`F`：全画面切替
- キー操作はビューアにフォーカスがあるときか全画面中のみ反応する。
- 操作バー：前へ・次へ、`3 / 24`、進捗バー、全画面ボタン。

全画面：

- ビューア要素に Fullscreen API を使う。黒背景中央に16:9で表示し、操作バーは無操作数秒で隠す。
- Fullscreen API が使えない環境（iOS Safari 等）では CSS の固定表示で疑似全画面にする。

URL：

- 表示中のページ番号を `#5` 形式で `history.replaceState` に反映する。
- 初期表示時に `#n` があればそのページを開き、範囲外なら1枚目にする。

## テスト

- `remarkSlides`（分割・layout 読み取り・未知 layout のエラー）と、ディレクトリ名から slug / 日付を求める処理を `bun test` でユニットテストする。
- ビューアはサンプルスライドを1つ入れ、ブラウザで操作して確認する。
