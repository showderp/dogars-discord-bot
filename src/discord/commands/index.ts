import { registeredCommand as dataCommand } from './data';
import { registeredCommand as randomPokemonCommand } from './random-pokemon';
import { registeredCommand as searchcommand } from './search';
import { createHelpCommand } from './help';
import { createVerifyPsCommand } from './verify-ps';
import { createVerifyTripCommand } from './verify-trip';
import { createWhoAmICommand } from './who-am-i';
import { createWhoIsCommand } from './who-is';
import { createPsCommand } from './ps';
import { createTripCommand } from './trip';
import { createUnverifyPsCommand } from './unverify-ps';
import { createUnverifyTripCommand } from './unverify-trip';
import { VerificationClient, UserDatabaseClient } from '../../verification';
import { createRefreshCommand } from './refresh';
import { ConfigurationStore } from '../../configuration';
import { BotSettings } from '../../settings';

// eslint-disable-next-line import/prefer-default-export
export const createCommands = (
  settings: BotSettings,
  configurationStore: ConfigurationStore,
  verificationClient: VerificationClient,
  userDatabaseClient: UserDatabaseClient,
) => {
  const verifyPsCommand = createVerifyPsCommand(verificationClient);
  const verifyTripCommand = createVerifyTripCommand(verificationClient);
  const whoAmICommand = createWhoAmICommand(userDatabaseClient);
  const whoIsCommand = createWhoIsCommand(userDatabaseClient);
  const psCommand = createPsCommand(userDatabaseClient);
  const tripCommand = createTripCommand(userDatabaseClient);
  const unverifyPsCommand = createUnverifyPsCommand(userDatabaseClient);
  const unverifyTripCommand = createUnverifyTripCommand(userDatabaseClient);
  const refreshCommand = createRefreshCommand(settings, configurationStore, userDatabaseClient);
  const helpCommand = createHelpCommand([
    dataCommand,
    randomPokemonCommand,
    searchcommand,
    verifyPsCommand,
    verifyTripCommand,
    unverifyPsCommand,
    unverifyTripCommand,
    psCommand,
    tripCommand,
    whoAmICommand,
    whoIsCommand,
    refreshCommand,
  ]);

  return [
    helpCommand,
    dataCommand,
    randomPokemonCommand,
    searchcommand,
    verifyPsCommand,
    verifyTripCommand,
    unverifyPsCommand,
    unverifyTripCommand,
    psCommand,
    tripCommand,
    whoAmICommand,
    whoIsCommand,
    refreshCommand,
  ];
};
