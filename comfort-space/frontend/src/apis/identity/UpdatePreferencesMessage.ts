import { sendMessage } from '../../system/api/send';
import names from '../../system/api/message-names.json';
import { preferenceSchema } from '../../domain/types';
import type { Preferences } from '../../domain/types';
export class UpdatePreferencesMessage {
  readonly preferences: Preferences;
  constructor(preferences: Preferences) {
    this.preferences = preferences;
  }
  send() {
    return sendMessage(
      names.UpdatePreferencesMessage,
      { preferences: this.preferences },
      preferenceSchema,
    );
  }
}
