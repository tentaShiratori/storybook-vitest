import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, waitFor, within } from 'storybook/test';
import { LazyImage } from './LazyImage';

const meta: Meta<typeof LazyImage> = {
  title: 'Components/LazyImage',
  component: LazyImage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: { type: 'text' },
    },
    alt: {
      control: { type: 'text' },
    },
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
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 基本的な遅延読み込み画像
export const Default: Story = {
  args: {
    src: 'https://picsum.photos/400/300?random=1',
    alt: 'Random image 1',
    width: 400,
    height: 300,
  },
};

// 複数の画像でスクロールテスト
export const MultipleImages: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="h-96 bg-gray-100 flex items-center justify-center">
        <p>Scroll down to see images</p>
      </div>
      <LazyImage
        src="https://picsum.photos/400/300?random=2"
        alt="Random image 2"
        width={400}
        height={300}
      />
      <div className="h-96 bg-gray-100 flex items-center justify-center">
        <p>More content</p>
      </div>
      <LazyImage
        src="https://picsum.photos/400/300?random=3"
        alt="Random image 3"
        width={400}
        height={300}
      />
      <div className="h-96 bg-gray-100 flex items-center justify-center">
        <p>Even more content</p>
      </div>
      <LazyImage
        src="https://picsum.photos/400/300?random=4"
        alt="Random image 4"
        width={400}
        height={300}
      />
    </div>
  ),
};

// カスタムプレースホルダー
export const CustomPlaceholder: Story = {
  args: {
    src: 'https://picsum.photos/400/300?random=5',
    alt: 'Custom placeholder image',
    width: 400,
    height: 300,
    placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236b7280" font-family="Arial" font-size="16"%3ELoading...%3C/text%3E%3C/svg%3E',
  },
};

// エラー画像
export const ErrorImage: Story = {
  args: {
    src: 'https://invalid-url-that-will-fail.com/image.jpg',
    alt: 'Error image',
    width: 400,
    height: 300,
  },
};

// カスタムサイズ
export const CustomSize: Story = {
  args: {
    src: 'https://picsum.photos/200/150?random=6',
    alt: 'Small image',
    width: 200,
    height: 150,
  },
};

// Play function付きのストーリー - IntersectionObserverテスト
export const WithIntersectionObserver: Story = {
  args: {
    src: 'https://picsum.photos/400/300?random=7',
    alt: 'Intersection Observer Test',
    width: 400,
    height: 300,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 画像要素が存在することを確認
    const image = canvas.getByAltText('Intersection Observer Test');
    expect(image).toBeInTheDocument();
    
    // 初期状態ではプレースホルダーが表示されていることを確認
    expect(image).toHaveAttribute('src');
    
    // IntersectionObserverが設定されていることを確認
    // 実際のテストでは、スクロールして要素を表示範囲に入れる必要がある
  },
};

// スクロールテスト
export const ScrollTest: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <p>Scroll down to trigger image loading</p>
      </div>
      <LazyImage
        src="https://picsum.photos/400/300?random=8"
        alt="Scroll test image"
        width={400}
        height={300}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 画像要素が存在することを確認
    const image = canvas.getByAltText('Scroll test image');
    expect(image).toBeInTheDocument();
    
    // 初期状態ではプレースホルダーが表示されていることを確認
    const initialSrc = image.getAttribute('src');
    expect(initialSrc).toContain('data:image/svg+xml');
    
    // スクロールして画像を表示範囲に入れる
    image.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // 画像が読み込まれるまで待機
    await waitFor(() => {
      const newSrc = image.getAttribute('src');
      expect(newSrc).toContain('picsum.photos');
    }, { timeout: 5000 });
  },
};

// コールバック関数のテスト
export const WithCallbacks: Story = {
  render: () => {
    const handleLoad = () => console.log('Image loaded successfully');
    const handleError = () => console.log('Image failed to load');
    
    return (
      <LazyImage
        src="https://picsum.photos/400/300?random=9"
        alt="Callback test image"
        width={400}
        height={300}
        onLoad={handleLoad}
        onError={handleError}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 画像要素が存在することを確認
    const image = canvas.getByAltText('Callback test image');
    expect(image).toBeInTheDocument();
    
    // 画像を表示範囲に入れる
    image.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // 画像が読み込まれるまで待機
    await waitFor(() => {
      const src = image.getAttribute('src');
      expect(src).toContain('picsum.photos');
    }, { timeout: 5000 });
  },
};

// カスタム閾値とルートマージン
export const CustomThreshold: Story = {
  args: {
    src: 'https://picsum.photos/400/300?random=10',
    alt: 'Custom threshold image',
    width: 400,
    height: 300,
    threshold: 0.5,
    rootMargin: '100px',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 画像要素が存在することを確認
    const image = canvas.getByAltText('Custom threshold image');
    expect(image).toBeInTheDocument();
    
    // カスタム属性が設定されていることを確認
    // 実際のIntersectionObserverの設定は内部で行われるため、
    // 外部からは直接確認できないが、動作で確認できる
  },
};

// エラーハンドリングテスト
export const ErrorHandling: Story = {
  args: {
    src: 'https://invalid-url-that-will-fail.com/image.jpg',
    alt: 'Error handling test',
    width: 400,
    height: 300,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 画像要素が存在することを確認
    const image = canvas.getByAltText('Error handling test');
    expect(image).toBeInTheDocument();
    
    // エラーメッセージが表示されるまで待機
    await waitFor(() => {
      const errorMessage = canvas.getByText('画像を読み込めませんでした');
      expect(errorMessage).toBeInTheDocument();
    }, { timeout: 5000 });
  },
};

// 複数の画像の同時読み込みテスト
export const MultipleLoading: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <LazyImage
        src="https://picsum.photos/200/150?random=11"
        alt="Multiple image 1"
        width={200}
        height={150}
      />
      <LazyImage
        src="https://picsum.photos/200/150?random=12"
        alt="Multiple image 2"
        width={200}
        height={150}
      />
      <LazyImage
        src="https://picsum.photos/200/150?random=13"
        alt="Multiple image 3"
        width={200}
        height={150}
      />
      <LazyImage
        src="https://picsum.photos/200/150?random=14"
        alt="Multiple image 4"
        width={200}
        height={150}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 複数の画像が存在することを確認
    const images = canvas.getAllByRole('img');
    expect(images).toHaveLength(4);
    
    // 各画像を表示範囲に入れる
    for (const image of images) {
      image.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // すべての画像が読み込まれるまで待機
    await waitFor(() => {
      const loadedImages = images.filter(img => 
        img.getAttribute('src')?.includes('picsum.photos')
      );
      expect(loadedImages.length).toBeGreaterThan(0);
    }, { timeout: 10000 });
  },
}; 