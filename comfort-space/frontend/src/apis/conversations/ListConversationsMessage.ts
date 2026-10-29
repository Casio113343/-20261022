import { sendMessage } from '../../system/api/send';
import names from '../../system/api/message-names.json';
import { conversationSchema } from '../../domain/types';
import { z } from 'zod';
export class ListConversationsMessage {
  constructor() {}
  send() {
    return sendMessage(
      names.ListConversationsMessage,
      {},
      z.array(conversationSchema).readonly(),
    );
  }
}
