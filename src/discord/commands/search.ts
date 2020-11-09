import { Message } from 'discord.js';
import { advancedSearchSets } from '../../dogars';
import { RegisteredCommand } from '../types';
import { createSetEmbed } from '../utility';

export const handleSearch = async (message: Message, commandText: string) => {
  const parameters = commandText.split(',').reduce((currentParameters: { [key: string]: string }, parameter) => {
    if (parameter.indexOf(':') >= 0) {
      const [parameterName, parameterValue] = parameter.trim().split(':').map((value) => value.trim());

      return { ...currentParameters, [parameterName]: parameterValue };
    }

    return currentParameters;
  }, {});

  const advancedSearchPage = await advancedSearchSets(parameters);

  if (advancedSearchPage) {
    const [, sets] = advancedSearchPage;

    message.reply(createSetEmbed(sets[0]));
  }
};

export const registeredCommand: RegisteredCommand = {
  commands: ['dt', 'data'],
  handler: handleSearch,
};