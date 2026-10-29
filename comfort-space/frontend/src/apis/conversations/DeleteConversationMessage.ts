import { sendMessage, acknowledgementSchema } from '../../system/api/send';
import names from '../../system/api/message-names.json';
export class DeleteConversationMessage {
  readonly id: string;
  constructor(id: string) {
    this.id = id;
  }
  send() {
    return sendMessage(
      names.DeleteConversationMessage,
      { id: this.id },
      acknowledgementSchema,
    );
  }
}
