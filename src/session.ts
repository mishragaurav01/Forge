import OpenAI from "openai";

export class Session {
  messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  constructor() {
    this.messages = [];
  }

  addMessage(message: OpenAI.Chat.ChatCompletionMessageParam) {
    this.messages.push(message);
  }

  getMessages() {
    return this.messages;
  }
}