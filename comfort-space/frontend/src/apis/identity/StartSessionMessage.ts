import { z } from 'zod';
import { sendMessage } from '../../system/api/send';
export class StartSessionMessage {
  send(): Promise<{ mode: 'server-demo' }> {
    return sendMessage(
      'StartSessionMessage',
      {},
      z.object({ mode: z.literal('server-demo') }),
    );
  }
}
