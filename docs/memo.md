# Storybook Vitest アドオン検証メモ

## 検証したいこと

### 1. 基本セットアップ
- [x] Storybook + Vitest の初期セットアップ
    - `pnpm create next-app`に`pnpm create storybook@latest`だけでstorybookだけでなくvitestのセットアップまで行われる
    - ただpostcss.config.mjsでエラーが出るのでそれだけ以下のようにする
```diff postcss.config.mjs
 const config = {
-  plugins: ["@tailwindcss/postcss"],
+  plugins: {
+    "@tailwindcss/postcss": {},
+  },
 };
 
 export default config;
```
```diff package.json 
scripts: {
    ...
+  test: "vitest",
}
```
   - またpnpmを使ってるならせい？かテストを実行するとのログが出る
```
Failed to resolve dependency: @mdx-js/react, present in client 'optimizeDeps.include'                                                                                          
Failed to resolve dependency: @mdx-js/react, present in client 'optimizeDeps.include'                                                                                          
Failed to resolve dependency: markdown-to-jsx, present in client 'optimizeDeps.include'        
```
   - なので`pnpm i -D @mdx-js/react markdown-to-jsx`を実行してログをなくす
- [x] vitestアドオンのインストールと設定
    - 上記で終わる
- [x] 基本的なテストファイルの作成
    - 通常通り

### 2. 機能検証
- [x] vitesのprojectsって？
  - https://vitest.dev/guide/projects
  - 複数の設定を同居させるための機能らしい
  - だからとくにpluginとか入れずにオブジェクトを追加するだけで普通のテストも実行される
```diff vitest.config.ts
    projects: [
      ...storybook用の設定
      {
        extends: true,
        test: {
          name: "unit",
          setupFiles: ["vitest.setup.ts"],
        },
      },
    ]
```
- [x] コンポーネントの単体テスト
  - `src/components/Button.tsx`を実装
  - 6つのバリアント（default, destructive, outline, secondary, ghost, link）
  - 4つのサイズ（default, sm, lg, icon）
  - disabled状態対応
  - TypeScript対応
  - Tailwind CSSクラス使用
  - `cn`関数を使用してクラス名結合（Tailwind競合解決）
- [x] Storybookストーリー内でのテスト実行
  - `src/components/Button.stories.tsx`を作成
  - 各バリアント・サイズのストーリー
  - Play function付きのストーリー
  - インタラクションテスト
  - アクセシビリティテスト
  - rerenderがないのでargsの更新ができない
    - renderでwrapすることで対応可能
- [x] インタラクションテスト（user-event等）
  - Play functionでuserEvent.click()、userEvent.tab()、userEvent.keyboard()を使用
  - フォーカステスト
  - キーボードナビゲーションテスト
  - fireEventもある
- [x] カバレッジレポート

### 3. 設定検証
- [x] カスタムマッチャーの設定
  - storybook/testで十分

### 4. 開発体験
- [x] ブラウザAPIの充実
  - `src/components/Modal.tsx`を実装
  - useEffect、useState、useCallbackを使用
  - イベントリスナー（keydown、click）
  - DOM操作（querySelectorAll、focus）
  - キーボードイベント（ESC、Tab）
  - フォーカストラップ
  - スクロール無効化（document.body.style.overflow）
  - タイマー（setTimeout、clearTimeout）
  - アニメーション状態管理
- [x] IntersectionObserverのテスト
  - `src/components/LazyImage.tsx`を実装
  - 画像の遅延読み込み
  - IntersectionObserver API
  - プレースホルダー表示
  - エラーハンドリング
  - ローディングインジケーター
  - カスタム閾値とルートマージン
- [ ] CI/CD連携

### 5. パフォーマンス
- [ ] テスト実行速度

## 実装したコンポーネント

### Button コンポーネント
- **ファイル**: `src/components/Button.tsx`
- **機能**:
  - 6つのバリアント（default, destructive, outline, secondary, ghost, link）
  - 4つのサイズ（default, sm, lg, icon）
  - disabled状態
  - カスタムクラス名対応
  - ref転送対応
  - アクセシビリティ対応
  - `cn`関数によるTailwind CSS競合解決

### Modal コンポーネント
- **ファイル**: `src/components/Modal.tsx`
- **機能**:
  - モーダルの表示/非表示
  - アニメーション（opacity、transform）
  - ESCキーで閉じる
  - バックドロップクリックで閉じる
  - フォーカストラップ
  - スクロール無効化
  - アクセシビリティ対応（aria-modal、role="dialog"）
  - キーボードナビゲーション
  - タイトル付き/なし対応

### LazyImage コンポーネント
- **ファイル**: `src/components/LazyImage.tsx`
- **機能**:
  - IntersectionObserverによる遅延読み込み
  - プレースホルダー表示
  - ローディングインジケーター
  - エラーハンドリング
  - カスタム閾値とルートマージン
  - コールバック関数（onLoad、onError）
  - アニメーション（opacity、pulse）
  - アクセシビリティ対応

### Storybook ストーリー
- **Button**: `src/components/Button.stories.tsx`
  - Default, Primary, Destructive, Outline, Secondary, Ghost, Link
  - Small, Large, Disabled
  - WithInteraction（Play function付き）
  - WithFocusTest（フォーカステスト）
  - MultipleButtons（複数ボタン）
  - AccessibilityTest（アクセシビリティ）

- **Modal**: `src/components/Modal.stories.tsx`
  - Default, WithoutTitle, Interactive
  - WithBrowserAPIs（ブラウザAPIテスト）
  - KeyboardNavigation（キーボードナビゲーション）
  - EscapeKeyTest（ESCキーテスト）
  - BackdropClickTest（バックドロップクリック）
  - FocusTrapTest（フォーカストラップ）
  - ScrollLockTest（スクロール無効化）
  - ComplexContent（複雑なコンテンツ）

- **LazyImage**: `src/components/LazyImage.stories.tsx`
  - Default, MultipleImages, CustomPlaceholder
  - ErrorImage, CustomSize
  - WithIntersectionObserver（IntersectionObserverテスト）
  - ScrollTest（スクロールテスト）
  - WithCallbacks（コールバック関数テスト）
  - CustomThreshold（カスタム閾値）
  - ErrorHandling（エラーハンドリング）
  - MultipleLoading（複数画像同時読み込み）

### Play Functions - ブラウザAPIテスト
- **WithBrowserAPIs**: モーダルの存在確認、aria属性、要素の存在確認
- **KeyboardNavigation**: フォーカス可能要素の取得、タブナビゲーション
- **EscapeKeyTest**: ESCキーイベント、モーダル閉じる動作
- **BackdropClickTest**: バックドロップクリック、イベント伝播
- **FocusTrapTest**: フォーカストラップ、循環ナビゲーション
- **ScrollLockTest**: document.body.style.overflow、スクロール制御
- **ComplexContent**: フォーム入力、フォーカス移動、値の検証

### Play Functions - IntersectionObserverテスト
- **WithIntersectionObserver**: 画像要素の存在確認、プレースホルダー確認
- **ScrollTest**: スクロールによる画像読み込み、src属性の変更確認
- **WithCallbacks**: コールバック関数の動作確認
- **CustomThreshold**: カスタム設定の動作確認
- **ErrorHandling**: エラー状態の表示確認
- **MultipleLoading**: 複数画像の同時読み込み確認

### 使用したブラウザAPI
- **DOM操作**: querySelectorAll、focus、activeElement
- **イベント**: addEventListener、removeEventListener、keydown、click
- **スタイル**: document.body.style.overflow
- **タイマー**: setTimeout、clearTimeout
- **フォーカス**: tabindex、focusable要素の取得
- **アクセシビリティ**: aria-modal、role="dialog"、aria-labelledby
- **IntersectionObserver**: observe、disconnect、isIntersecting
- **画像**: onLoad、onError、src属性の動的変更
- **スクロール**: scrollIntoView、スクロール位置の制御

## 次の検証項目

### 1. CI/CD連携
- [ ] GitHub Actionsでの自動テスト
- [ ] デプロイ時のテスト実行
- [ ] プルリクエスト時のテスト実行

### 2. パフォーマンス検証
- [ ] テスト実行速度の測定
- [ ] メモリ使用量の測定
- [ ] 大規模プロジェクトでの動作確認

### 3. より高度なテスト
- [ ] ネットワークリクエストのモック
- [ ] ローカルストレージのテスト
- [ ] ブラウザストレージのテスト
- [ ] ファイルアップロードのテスト

## 参考資料
- [Storybook Vitest Addon](https://storybook.js.org/addons/@storybook/addon-vitest)
- [Vitest Documentation](https://vitest.dev/)
- [clsx](https://github.com/lukeed/clsx)
- [tailwind-merge](https://github.com/dcastil/tailwind-merge)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

## 検証結果
（検証後に記入予定）
