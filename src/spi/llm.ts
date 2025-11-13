import type { ToolCall } from "../domain/messages.js";

export type ToolSpec = {
  name: string;
  description?: string;
  parameters?: unknown; // JSON Schema
};

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  tool_call_id?: string;
};

export type ChatResult = {
  messages: ChatMessage[];
  toolCalls?: ToolCall[];
  usage?: { inputTokens?: number; outputTokens?: number; costUSD?: number };
};

export interface ChatModel {
  readonly name: string;
  generate(input: ChatMessage[], tools?: ToolSpec[], options?: Record<string, unknown>): Promise<ChatResult>;
}