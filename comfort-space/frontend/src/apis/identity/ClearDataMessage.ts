import { sendMessage, acknowledgementSchema } from '../../system/api/send';
import names from '../../system/api/message-names.json';
export class ClearDataMessage {
  constructor() {}
  send() {
    return sendMessage(names.ClearDataMessage, {}, acknowledgementSchema);
  }
}
