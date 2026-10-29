import { sendMessage, acknowledgementSchema } from '../../system/api/send';
import names from '../../system/api/message-names.json';
export class DeleteMoodMessage {
  readonly id: string;
  constructor(id: string) {
    this.id = id;
  }
  send() {
    return sendMessage(
      names.DeleteMoodMessage,
      { id: this.id },
      acknowledgementSchema,
    );
  }
}
