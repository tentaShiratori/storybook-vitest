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
  - `src/components/ColorChangeBox.tsx`を実装
  - シンプルな色変更ボックス
  - 画面内に入ったら色が変わる
  - カスタムサイズ、色、閾値対応
  - アニメーション付き
- [x] CI/CD連携
  - GitHub Actionsワークフロー作成
  - 複数Node.jsバージョンでのテスト
  - リンター、型チェック、テストの自動実行
  - Storybookテストの自動実行
  - カバレッジレポートの自動アップロード
  - GitHub Pagesへの自動デプロイ

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

### ColorChangeBox コンポーネント
- **ファイル**: `src/components/ColorChangeBox.tsx`
- **機能**:
  - IntersectionObserverによる色変更
  - 画面内に入ったら色が変わる
  - カスタムサイズ（width、height）
  - カスタム色（initialColor、activeColor）
  - カスタム閾値（threshold）
  - アニメーション（transition-colors）
  - テキスト表示（画面外/画面内！）

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

- **ColorChangeBox**: `src/components/ColorChangeBox.stories.tsx`
  - Default, Large, Small, CustomColors
  - LowThreshold, HighThreshold, MultipleBoxes
  - WithIntersectionObserver（基本的なテスト）
  - ScrollTest（スクロールテスト）
  - CustomThresholdTest（カスタム閾値）
  - MultipleBoxesTest（複数ボックス）
  - AnimationTest（アニメーション）

### Play Functions - ブラウザAPIテスト
- **WithBrowserAPIs**: モーダルの存在確認、aria属性、要素の存在確認
- **KeyboardNavigation**: フォーカス可能要素の取得、タブナビゲーション
- **EscapeKeyTest**: ESCキーイベント、モーダル閉じる動作
- **BackdropClickTest**: バックドロップクリック、イベント伝播
- **FocusTrapTest**: フォーカストラップ、循環ナビゲーション
- **ScrollLockTest**: document.body.style.overflow、スクロール制御
- **ComplexContent**: フォーム入力、フォーカス移動、値の検証

### Play Functions - IntersectionObserverテスト
- **WithIntersectionObserver**: ボックス要素の存在確認、初期色の確認
- **ScrollTest**: スクロールによる色変更、クラス名の変更確認
- **CustomThresholdTest**: カスタム閾値の動作確認
- **MultipleBoxesTest**: 複数ボックスの同時色変更確認
- **AnimationTest**: アニメーションクラスの確認

### 使用したブラウザAPI
- **DOM操作**: querySelectorAll、focus、activeElement
- **イベント**: addEventListener、removeEventListener、keydown、click
- **スタイル**: document.body.style.overflow
- **タイマー**: setTimeout、clearTimeout
- **フォーカス**: tabindex、focusable要素の取得
- **アクセシビリティ**: aria-modal、role="dialog"、aria-labelledby
- **IntersectionObserver**: observe、disconnect、isIntersecting
- **スクロール**: scrollIntoView、スクロール位置の制御

## CI/CD設定

### GitHub Actions ワークフロー
- **ファイル**: `.github/workflows/test.yml`
- **機能**:
  - プッシュ・プルリクエスト時の自動実行
  - Node.js 18.x、20.xでの並列テスト
  - pnpmキャッシュの活用
  - リンター、型チェック、テストの実行
  - Storybookテストの実行
  - カバレッジレポートのアップロード
  - GitHub Pagesへの自動デプロイ

### 追加されたスクリプト
- **lint**: Biomeによるリンター実行
- **type-check**: TypeScript型チェック
- **test:run**: テストの一括実行
- **test:ui**: Vitest UIでのテスト実行
- **test-storybook**: Storybookテストの実行

### カバレッジ設定
- **Vitest設定**: v8プロバイダー、複数レポーター
- **除外設定**: node_modules、.storybook、storiesファイル等
- **レポート形式**: text、json、html、lcov

## 参考資料
- [Storybook Vitest Addon](https://storybook.js.org/addons/@storybook/addon-vitest)
- [Vitest Documentation](https://vitest.dev/)
- [clsx](https://github.com/lukeed/clsx)
- [tailwind-merge](https://github.com/dcastil/tailwind-merge)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Storybook Test Runner](https://storybook.js.org/docs/writing-tests/test-runner)

## 検証結果
（検証後に記入予定）
