import axios from 'axios';
import { DogarsPage, DogarsSet } from './types';

export const getSet = async (id: number): Promise<DogarsSet | undefined> => {
  try {
    return (await axios.get<DogarsSet>(`https://dogars.ga/api/sets/${id}`)).data;
  } catch (error) {
    // TODO: Log error
    return undefined;
  }
};

export const getRandomSetId = async () => {
  try {
    return (await axios.get<number>('https://dogars.ga/api/random')).data;
  } catch (error) {
    // TODO: Log error
    return undefined;
  }
};

export const searchSets = async (query: string): Promise<DogarsPage | undefined> => {
  try {
    return (await axios.get<DogarsPage>('https://dogars.ga/api/search', { params: { q: query, page: 1 } })).data;
  } catch (error) {
    // TODO: Log error
    return undefined;
  }
};

export const advancedSearchSets = async (
  queries: { [key: string]: string },
  isRandom: boolean = false,
): Promise<DogarsPage | undefined> => {
  try {
    const params = { ...queries };
    if (isRandom) {
      params.random = 'true';
    }

    return (await axios.get<DogarsPage>('https://dogars.ga/api/search', { params })).data;
  } catch (error) {
    // TODO: Log error
    return undefined;
  }
};
