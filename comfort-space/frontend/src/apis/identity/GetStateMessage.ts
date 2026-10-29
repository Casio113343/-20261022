import { sendMessage } from '../../system/api/send';
import names from '../../system/api/message-names.json';
import { savedSchema } from '../../domain/types';
export class GetStateMessage {
  constructor() {}
  send() {
    return sendMessage(names.GetStateMessage, {}, savedSchema);
  }
}
