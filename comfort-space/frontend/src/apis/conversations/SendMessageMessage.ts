import { sendMessage } from '../../system/api/send';
import names from '../../system/api/message-names.json';
import { conversationSchema } from '../../domain/types';
export class SendMessageMessage {
  readonly conversationId: string;
  readonly requestId: string;
  readonly content: string;
  constructor(conversationId: string, requestId: string, content: string) {
    this.conversationId = conversationId;
    this.requestId = requestId;
    this.content = content;
  }
  send() {
    return sendMessage(
      names.SendMessageMessage,
      {
        conversationId: this.conversationId,
        requestId: this.requestId,
        content: this.content,
      },
      conversationSchema,
    );
  }
}
