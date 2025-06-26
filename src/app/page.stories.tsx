import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Page from "./page";

const meta: Meta<typeof Page> = {
  component: Page,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// 基本的なストーリー
export const Default: Story = {
  args: {},
};
