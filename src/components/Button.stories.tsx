import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: {
      control: { type: "select" },
      options: ["default", "sm", "lg", "icon"],
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 基本的なストーリー
export const Default: Story = {
  args: {
    children: "Button",
  },
};

// プライマリボタン
export const Primary: Story = {
  args: {
    variant: "default",
    children: "Primary Button",
  },
};

// 破壊的ボタン
export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Delete",
  },
};

// アウトラインボタン
export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline Button",
  },
};

// セカンダリボタン
export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary Button",
  },
};

// ゴーストボタン
export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost Button",
  },
};

// リンクボタン
export const Link: Story = {
  args: {
    variant: "link",
    children: "Link Button",
  },
};

// サイズバリエーション
export const Small: Story = {
  args: {
    size: "sm",
    children: "Small Button",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large Button",
  },
};

export const Icon: Story = {
  args: {
    size: "icon",
    children: "Icon Button",
  },
};

// 無効化されたボタン
export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled Button",
  },
};

// Play function付きのストーリー
export const WithInteraction: Story = {
  args: {
    children: "Click me!",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");

    // ボタンが存在することを確認
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Click me!");

    // クリックイベントをシミュレート
    await userEvent.click(button);
  },
};

// フォーカステスト
export const WithFocusTest: Story = {
  args: {
    children: "Focus Test",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");

    // フォーカスを当てる
    await userEvent.tab();
    expect(button).toHaveFocus();

    // フォーカスが外れることを確認
    await userEvent.tab();
    expect(button).not.toHaveFocus();
  },
};

// 複数のボタンでのテスト
export const MultipleButtons: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="default">Primary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole("button");

    // 3つのボタンが存在することを確認
    expect(buttons).toHaveLength(3);

    // 各ボタンをクリック
    for (const button of buttons) {
      await userEvent.click(button);
    }
  },
};

// アクセシビリティテスト
export const AccessibilityTest: Story = {
  args: {
    children: "Accessible Button",
    "aria-label": "Custom accessible button",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");

    // aria-labelが設定されていることを確認
    expect(button).toHaveAttribute("aria-label", "Custom accessible button");

    // キーボードナビゲーション
    await userEvent.tab();
    expect(button).toHaveFocus();

    // Enterキーでアクティベート
    await userEvent.keyboard("{Enter}");
  },
};
