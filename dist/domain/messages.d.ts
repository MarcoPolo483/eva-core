export type Role = "user" | "assistant" | "tool" | "system";
export type MessageBase = {
    id?: string;
    role: Role;
    createdAt?: string;
};
export type UserMessage = MessageBase & {
    role: "user";
    content: string;
};
export type AssistantMessage = MessageBase & {
    role: "assistant";
    content: string;
    toolCalls?: ToolCall[];
};
export type ToolMessage = MessageBase & {
    role: "tool";
    toolName: string;
    content: string;
};
export type SystemMessage = MessageBase & {
    role: "system";
    content: string;
};
export type Message = UserMessage | AssistantMessage | ToolMessage | SystemMessage;
export type ToolCall = {
    id: string;
    name: string;
    arguments: unknown;
    status?: "requested" | "running" | "succeeded" | "failed";
    error?: string;
};
//# sourceMappingURL=messages.d.ts.map