import { sendMessage } from '../../system/api/send';
import names from '../../system/api/message-names.json';
import { conversationSchema } from '../../domain/types';
export class CreateConversationMessage {
  readonly id: string;
  constructor(id: string) {
    this.id = id;
  }
  send() {
    return sendMessage(
      names.CreateConversationMessage,
      { id: this.id },
      conversationSchema,
    );
  }
}
