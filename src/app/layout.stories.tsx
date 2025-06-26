import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Layout from "./layout";

const meta: Meta<typeof Layout> = {
  component: Layout,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// 基本的なストーリー
export const Default: Story = {
  args: {
    children: "Layout",
  },
};
