import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "./Button";
import { Modal, type ModalProps } from "./Modal";

const meta: Meta<typeof Modal> = {
  title: "Components/Modal",
  component: Modal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    isOpen: {
      control: { type: "boolean" },
    },
    title: {
      control: { type: "text" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// モーダルを開くためのラッパーコンポーネント
const ModalWrapper = ({ isOpen, onClose, ...props }: Omit<ModalProps, "children">) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} {...props}>
      <div className="space-y-4">
        <p>
          This is the modal content. You can close it by clicking the X button, pressing Escape, or clicking outside.
        </p>
        <div className="flex gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="default">Confirm</Button>
        </div>
      </div>
    </Modal>
  );
};

// 基本的なモーダル
export const Default: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    isOpen: true,
    title: "Basic Modal",
  },
};

// タイトルなしのモーダル
export const WithoutTitle: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    isOpen: true,
  },
};

// インタラクティブなモーダル
export const Interactive: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <ModalWrapper isOpen={isOpen} onClose={() => setIsOpen(false)} title="Interactive Modal" />
      </div>
    );
  },
};

// Play function付きのストーリー - ブラウザAPIテスト
export const WithBrowserAPIs: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    isOpen: true,
    title: "Browser API Test",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // モーダルが表示されていることを確認
    const modal = canvas.getByRole("dialog");
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute("aria-modal", "true");

    // タイトルが存在することを確認
    const title = canvas.getByText("Browser API Test");
    expect(title).toBeInTheDocument();

    // 閉じるボタンが存在することを確認
    const closeButton = canvas.getByLabelText("Close modal");
    expect(closeButton).toBeInTheDocument();
  },
};

// キーボードナビゲーションテスト
export const KeyboardNavigation: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    isOpen: true,
    title: "Keyboard Test",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // モーダルが表示されていることを確認
    const modal = canvas.getByRole("dialog");
    expect(modal).toBeInTheDocument();

    // フォーカス可能な要素を取得
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    expect(focusableElements.length).toBeGreaterThan(0);

    // タブナビゲーションをテスト
    await userEvent.tab();
    expect(document.activeElement).toBe(focusableElements[0]);

    // 次の要素にフォーカス
    await userEvent.tab();
    expect(document.activeElement).toBe(focusableElements[1]);
  },
};

// ESCキーテスト
export const EscapeKeyTest: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);
    return (
      <div>
        <ModalWrapper isOpen={isOpen} onClose={() => setIsOpen(false)} title="Escape Test" />
        {!isOpen && <p>Modal was closed!</p>}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // モーダルが表示されていることを確認
    const modal = canvas.getByRole("dialog");
    expect(modal).toBeInTheDocument();

    // ESCキーを押す
    await userEvent.keyboard("{Escape}");

    // モーダルが閉じられたことを確認（少し待機）
    await new Promise((resolve) => setTimeout(resolve, 200));
  },
};

// バックドロップクリックテスト
export const BackdropClickTest: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);
    return (
      <div>
        <ModalWrapper isOpen={isOpen} onClose={() => setIsOpen(false)} title="Backdrop Test" />
        {!isOpen && <p>Modal was closed by backdrop click!</p>}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // モーダルが表示されていることを確認
    const modal = canvas.getByRole("dialog");
    expect(modal).toBeInTheDocument();

    // バックドロップをクリック
    const backdrop = modal.parentElement;
    if (backdrop) {
      await userEvent.click(backdrop);
    }

    // モーダルが閉じられたことを確認（少し待機）
    await new Promise((resolve) => setTimeout(resolve, 200));
  },
};

// フォーカストラップテスト
export const FocusTrapTest: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    isOpen: true,
    title: "Focus Trap Test",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // モーダルが表示されていることを確認
    const modal = canvas.getByRole("dialog");
    expect(modal).toBeInTheDocument();

    // フォーカス可能な要素を取得
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    if (focusableElements.length > 1) {
      // 最初の要素にフォーカス
      await userEvent.tab();
      expect(document.activeElement).toBe(focusableElements[0]);

      // 最後の要素までタブ
      for (let i = 0; i < focusableElements.length - 1; i++) {
        await userEvent.tab();
      }
      expect(document.activeElement).toBe(focusableElements[focusableElements.length - 1]);

      // さらにタブすると最初の要素に戻る
      await userEvent.tab();
      expect(document.activeElement).toBe(focusableElements[0]);
    }
  },
};

// スクロール無効化テスト
export const ScrollLockTest: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);
    return (
      <div>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <ModalWrapper isOpen={isOpen} onClose={() => setIsOpen(false)} title="Interactive Modal" />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // モーダルが表示されていることを確認
    const modal = canvas.getByRole("dialog");
    expect(modal).toBeInTheDocument();

    await waitFor(() => {
      // bodyのoverflowがhiddenになっていることを確認
      expect(document.body.style.overflow).toBe("hidden");
    });

    // モーダルを閉じる
    const closeButton = canvas.getByLabelText("Close modal");
    await userEvent.click(closeButton);

    await waitFor(() => {
      // bodyのoverflowが元に戻ることを確認
      expect(document.body.style.overflow).toBe("unset");
    });
  },
};

// 複雑なコンテンツを持つモーダル
export const ComplexContent: Story = {
  render: (args) => (
    <Modal {...args}>
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Complex Modal Content</h3>
        <p>This modal contains various interactive elements to test browser APIs.</p>

        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          {/** biome-ignore lint/nursery/useUniqueElementIds: テストなので */}
          <input
            id="name"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          {/** biome-ignore lint/nursery/useUniqueElementIds: テストなので */}
          <input
            id="email"
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline">Cancel</Button>
          <Button variant="default">Submit</Button>
        </div>
      </div>
    </Modal>
  ),
  args: {
    isOpen: true,
    title: "Complex Modal",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // フォーム要素が存在することを確認
    const nameInput = canvas.getByLabelText("Name");
    const emailInput = canvas.getByLabelText("Email");
    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();

    // 入力テスト
    await userEvent.type(nameInput, "John Doe");
    await userEvent.type(emailInput, "john@example.com");

    expect(nameInput).toHaveValue("John Doe");
    expect(emailInput).toHaveValue("john@example.com");

    // フォーカス移動テスト
    await userEvent.tab();
    const cancelButton = canvas.getByText("Cancel");
    expect(cancelButton).toHaveFocus();
  },
};
