import { sendMessage, acknowledgementSchema } from '../../system/api/send';
import names from '../../system/api/message-names.json';
export class SetFavouriteMessage {
  readonly id: string;
  readonly saved: boolean;
  constructor(id: string, saved: boolean) {
    this.id = id;
    this.saved = saved;
  }
  send() {
    return sendMessage(
      names.SetFavouriteMessage,
      { id: this.id, saved: this.saved },
      acknowledgementSchema,
    );
  }
}
