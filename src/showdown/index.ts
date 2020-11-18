import { Client } from 'ts-psim-client';
import { ChallengeType, VerificationClient } from '../verification';

const toId = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '');

interface ShowdownVerifierConfiguration {
  username: string;
  password: string;
  avatar?: string;
}

// eslint-disable-next-line import/prefer-default-export
export const createShowdownVerifier = (
  showdownVerifierConfiguration: ShowdownVerifierConfiguration,
  verificationClient: VerificationClient,
) => {
  const bot = new Client({});
  const { username, password, avatar } = showdownVerifierConfiguration;

  bot.onReady.subscribe((client) => {
    client.login(username, password, true);
  });

  bot.onLogin.subscribe((client) => {
    client.setAvatar(avatar || 'scientistf');
  });

  bot.onPrivateMessage.subscribe(async (showdownUser, message) => {
    if (message.text.startsWith('#verify')) {
      const secret = message.text.substr(7).trim();

      const user = await verificationClient.verifyChallengeAndUpdateUser(
        secret,
        ChallengeType.SHOWDOWN,
        {
          showdownId: toId(showdownUser.username),
          showdownDisplayName: showdownUser.displayName,
        },
      );

      if (user) {
        await message.reply('Successfully verified');
      } else {
        await message.reply('Invalid challenge, please check your message or try again');
      }
    }
  });

  return bot;
};
