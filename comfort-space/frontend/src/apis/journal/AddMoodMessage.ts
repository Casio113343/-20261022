import { sendMessage } from '../../system/api/send';
import names from '../../system/api/message-names.json';
import { moodSchema } from '../../domain/types';
export class AddMoodMessage {
  readonly id: string;
  readonly feeling: string;
  readonly note: string;
  constructor(id: string, feeling: string, note: string) {
    this.id = id;
    this.feeling = feeling;
    this.note = note;
  }
  send() {
    return sendMessage(
      names.AddMoodMessage,
      { id: this.id, feeling: this.feeling, note: this.note },
      moodSchema,
    );
  }
}
