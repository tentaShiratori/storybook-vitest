import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, waitFor, within } from 'storybook/test';
import { ColorChangeBox } from './ColorChangeBox';

const meta: Meta<typeof ColorChangeBox> = {
  title: 'Components/ColorChangeBox',
  component: ColorChangeBox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    width: {
      control: { type: 'number' },
    },
    height: {
      control: { type: 'number' },
    },
    threshold: {
      control: { type: 'range', min: 0, max: 1, step: 0.1 },
    },
    rootMargin: {
      control: { type: 'text' },
    },
    initialColor: {
      control: { type: 'text' },
    },
    activeColor: {
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 基本的な色変更ボックス
export const Default: Story = {
  args: {
    width: 200,
    height: 200,
  },
};

// 大きなボックス
export const Large: Story = {
  args: {
    width: 300,
    height: 300,
  },
};

// 小さなボックス
export const Small: Story = {
  args: {
    width: 100,
    height: 100,
  },
};

// カスタム色
export const CustomColors: Story = {
  args: {
    width: 200,
    height: 200,
    initialColor: 'bg-red-300',
    activeColor: 'bg-green-500',
  },
};

// 低い閾値
export const LowThreshold: Story = {
  args: {
    width: 200,
    height: 200,
    threshold: 0.1,
  },
};

// 高い閾値
export const HighThreshold: Story = {
  args: {
    width: 200,
    height: 200,
    threshold: 0.9,
  },
};

// 複数のボックス
export const MultipleBoxes: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="h-96 bg-gray-100 flex items-center justify-center">
        <p>スクロールして色が変わるボックスを見てください</p>
      </div>
      <ColorChangeBox width={150} height={150} />
      <div className="h-32 bg-gray-100 flex items-center justify-center">
        <p>間のコンテンツ</p>
      </div>
      <ColorChangeBox 
        width={150} 
        height={150} 
        initialColor="bg-yellow-300"
        activeColor="bg-purple-500"
      />
      <div className="h-32 bg-gray-100 flex items-center justify-center">
        <p>さらに間のコンテンツ</p>
      </div>
      <ColorChangeBox 
        width={150} 
        height={150} 
        initialColor="bg-pink-300"
        activeColor="bg-indigo-500"
      />
    </div>
  ),
};

// Play function付きのストーリー - 基本的なテスト
export const WithIntersectionObserver: Story = {
  args: {
    width: 200,
    height: 200,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // ボックス要素が存在することを確認
    const box = canvas.getByText('画面外');
    expect(box).toBeInTheDocument();
    
    // 初期状態では灰色であることを確認
    expect(box).toHaveClass('bg-gray-300');
  },
};

// スクロールテスト
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

// カスタム閾値のテスト
export const CustomThresholdTest: Story = {
  args: {
    width: 200,
    height: 200,
    threshold: 0.8,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // ボックス要素が存在することを確認
    const box = canvas.getByText('画面外');
    expect(box).toBeInTheDocument();
    
    // 高閾値なので、完全に表示されるまで色が変わらない
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // 少し待機してから色の変化を確認
    await waitFor(() => {
      expect(box).toHaveClass('bg-blue-500');
    }, { timeout: 3000 });
  },
};

// 複数ボックスの同時テスト
export const MultipleBoxesTest: Story = {
  render: () => (
    <div className="space-y-4">
      <ColorChangeBox width={100} height={100} />
      <ColorChangeBox 
        width={100} 
        height={100} 
        initialColor="bg-red-300"
        activeColor="bg-green-500"
      />
      <ColorChangeBox 
        width={100} 
        height={100} 
        initialColor="bg-yellow-300"
        activeColor="bg-purple-500"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 複数のボックスが存在することを確認
    const boxes = canvas.getAllByText(/画面外|画面内！/);
    expect(boxes).toHaveLength(3);
    
    // 各ボックスを表示範囲に入れる
    for (const box of boxes) {
      box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // すべてのボックスが色を変えるまで待機
    await waitFor(() => {
      const activeBoxes = boxes.filter(box => 
        box.textContent === '画面内！'
      );
      expect(activeBoxes.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  },
};

// アニメーションのテスト
export const AnimationTest: Story = {
  args: {
    width: 200,
    height: 200,
    initialColor: 'bg-gray-300',
    activeColor: 'bg-blue-500',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // ボックス要素が存在することを確認
    const box = canvas.getByText('画面外');
    expect(box).toBeInTheDocument();
    
    // スクロールして色を変える
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // 色が変わるまで待機
    await waitFor(() => {
      expect(box).toHaveClass('bg-blue-500');
    }, { timeout: 3000 });
  },
}; 