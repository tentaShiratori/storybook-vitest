# Storybook v9で革命が起きた！Vitestアドオンでテストが超簡単になった件

## はじめに

Storybook v9がリリースされて、開発者の世界に革命が起きました！特に注目すべきは**Vitestアドオン**の登場です。これまでStorybookでテストを書くのは面倒でしたが、v9からは本当に簡単になりました。

この記事では、実際にStorybook v9 + Vitestアドオンを検証して、その驚くべき機能を紹介します。

## 🚀 Storybook v9の衝撃的な新機能

### 1. Vitestアドオンが標準搭載！

```bash
# これだけでVitestまでセットアップされる
pnpm create next-app my-app
cd my-app
pnpm create storybook@latest
```

たったこれだけで、Storybook + Vitestの環境が整います。以前は手動で設定していたVitestが、自動でセットアップされる時代になりました。

### 2. Storybookのテストもユニットテストも`npm run test`で実行できる


`pnpm create storybook@latest`を実行するだけだと↓の形のコンフィグですが
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: "playwright",
            instances: [{ browser: "chromium" }],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
```

ユニットテスト用の設定を書き加えることでStorybookのテストもユニットテストも`npm run test`で実行できる
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: "playwright",
            instances: [{ browser: "chromium" }],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
        },
      },
    ],
  },
});
```

## 🎯 実際にコンポーネントを作って検証してみた

### Button コンポーネント

まずは基本的なButtonコンポーネントから始めました。

```tsx
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors";
    
    const variantClasses = {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline: "border border-gray-300 hover:bg-gray-50",
      // ... 他のバリアント
    };
    
    return (
      <button
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
```

### Storybookストーリー + Play function

ここからが本題！Storybook v9の真価が発揮されます。

```tsx
export const WithInteraction: Story = {
  args: {
    children: 'Click me!',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    // ボタンが存在することを確認
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me!');
    
    // クリックイベントをシミュレート
    await userEvent.click(button);
  },
};
```

**これだけでテストが書けるんです！** 以前は別ファイルでテストを書いていましたが、Storybookストーリー内でPlay functionを使うことで、コンポーネントの動作を直接テストできます。

## 🌈 IntersectionObserverもモックしなくていい

### ColorChangeBox コンポーネント

IntersectionObserverを使ったコンポーネントも作ってみました。

```tsx
export const ColorChangeBox = forwardRef<HTMLDivElement, ColorChangeBoxProps>(
  ({ width = 200, height = 200, threshold = 0.5, ...props }, ref) => {
    const [isInView, setIsInView] = useState(false);
    
    const setupIntersectionObserver = useCallback(() => {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setIsInView(entry.isIntersecting);
          });
        },
        { threshold, rootMargin: "0px" }
      );
      observerRef.current.observe(boxRef.current);
    }, [threshold]);

    return (
      <div
        className={cn(
          "transition-colors duration-500 ease-in-out rounded-lg",
          isInView ? activeColor : initialColor
        )}
      >
        {isInView ? "画面内！" : "画面外"}
      </div>
    );
  }
);
```

### IntersectionObserverのテスト

```tsx
export const ScrollTest: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <p>下にスクロールしてください</p>
      </div>
      <ColorChangeBox width={200} height={200} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // ボックス要素が存在することを確認
    const box = canvas.getByText('画面外');
    expect(box).toBeInTheDocument();
    
    // 初期状態では灰色であることを確認
    expect(box).toHaveClass('bg-gray-300');
    
    // スクロールしてボックスを表示範囲に入れる
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // 色が変わるまで待機
    await waitFor(() => {
      expect(box).toHaveClass('bg-blue-500');
      expect(box).toHaveTextContent('画面内！');
    }, { timeout: 3000 });
  },
};
```

**IntersectionObserverのテストも本当に簡単！** スクロール、色の変更、テキストの変更まで、すべてPlay functionでテストできます。

## 💡 注意点

### 1. rerenderがない問題

```tsx
// ❌ これは動作しない
export const TestStory: Story = {
  args: { variant: 'default' },
  play: async ({ args }) => {
    args.variant = 'destructive'; // これは反映されない
  },
};

// ✅ これが正解
export const TestStory: Story = {
  render: (args) => <Button {...args} />,
  args: { variant: 'default' },
  play: async ({ args }) => {
    // renderでwrapすることで対応可能
  },
};
```

### 2. storybook/testで十分

```tsx
import { expect, userEvent, waitFor, within } from 'storybook/test';
```

`@testing-library/jest-dom`を別途インストールする必要がなく、`storybook/test`だけで十分です。

### 3. カバレッジも自動生成

```bash
pnpm coverage
```

Vitestのカバレッジ機能も標準で使えます。

## 🚀 まとめ

Storybook v9 + Vitestアドオンの組み合わせは、本当に革命的な進化でした。

### メリット

1. **セットアップが超簡単** - コマンド一発で環境構築完了
2. **テストが直感的** - Play functionでコンポーネントの動作を直接テスト
3. **ブラウザAPIも簡単** - 複雑な機能も簡単にテスト可能
4. **開発体験が向上** - ストーリーとテストが同じファイルに
5. **カバレッジも自動** - テストカバレッジも簡単に確認

### これからの開発

Storybook v9の登場により、コンポーネント開発のワークフローが大きく変わりました。テストを書くのが楽しくなり、品質向上も簡単になりました。

**Storybook v9 + Vitestアドオン**、これは本当におすすめです！

---

*この記事は実際にStorybook v9 + Vitestアドオンを検証した結果をまとめたものです。ぜひ皆さんも試してみてください！*
