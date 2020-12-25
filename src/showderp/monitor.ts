import Emittery from 'emittery';
import {
  getCatalog,
  getThread,
  Post,
} from './yotsuba';
import { ConfigurationStore } from '../configuration';

const showderpKeywords: string[] = ['showderp', 'dogars.ml', 'dogars.ga'];
const battleLinkPatterns: RegExp[] = [
  /(https?:\/\/)?play.pokemonshowdown.com\/(?<room>battle-([A-Za-z0-9-]+))/gi,
  /(https?:\/\/)?play.dogars.ga\/(?<room>battle-([A-Za-z0-9-]+))/gi,
];

const isShowderpThread = (post: Post) => {
  const comment = (post.com || '')
    .replace(/<wbr>/gm, '')
    .replace(/<(?:.|\n)*?>/gm, ' ')
    .toLowerCase();
  const subject = (post.sub || '')
    .replace(/<wbr>/gm, '')
    .replace(/<(?:.|\n)*?>/gm, ' ')
    .toLowerCase();
  const doesCommentContainKeyword = showderpKeywords
    .some((keyword) => comment.includes(keyword));
  const doesSubjectContainKeyword = showderpKeywords
    .some((keyword) => subject.includes(keyword));

  return doesCommentContainKeyword || doesSubjectContainKeyword;
};

const getCurrentThreads = async (): Promise<Post[]> => {
  const catalog = await getCatalog('vp');

  return catalog
    .filter((thread) => isShowderpThread(thread));
};

export type ShowdownMonitor = Emittery.Typed<{
  thread: Post,
  battlePost: [Post, Post, string],
  challengePosts: Post[],
}>;

type ThreadPostsPair = [Post, Post[]];
type ThreadPostPair = [Post, Post];

export const createShowderpMonitor = async (
  frequency: number,
  configurationStore: ConfigurationStore,
): Promise<[NodeJS.Timeout, ShowdownMonitor]> => {
  const showdownEventEmitter: ShowdownMonitor = new Emittery.Typed<{
    thread: Post,
    battlePost: [Post, Post, string],
    challengePosts: Post[],
  }>();

  let lastExecutedTime: number | undefined = await configurationStore.getGlobalConfigurationValue('lastExecutedTime');
  let currentThreadNo: number | undefined = await configurationStore.getGlobalConfigurationValue('currentThread');

  const timeout = setInterval(async () => {
    const currentThreads = (await getCurrentThreads()).sort((a, b) => a.no - b.no);

    // eslint-disable-next-line no-restricted-syntax
    for (const currentThread of currentThreads) {
      if (!currentThreadNo || currentThread.no > currentThreadNo) {
        // eslint-disable-next-line no-await-in-loop
        currentThreadNo = await configurationStore.setGlobalConfigurationValue(
          'currentThread',
          currentThread.no,
        );

        showdownEventEmitter.emit('thread', currentThread);
      }
    }

    const showderpPosts = (await Promise.all(currentThreads.map(async (currentThread) => {
      const posts = await getThread('vp', currentThread.no);

      return [currentThread, posts] as ThreadPostsPair;
    })))
      .reduce((threadPostPairs: ThreadPostPair[], [thread, posts]) => {
        const mappedPosts = posts.map((post) => ([thread, post] as ThreadPostPair));
        const result = [...threadPostPairs, ...mappedPosts];

        return result;
      }, [])
      .sort((a, b) => a[1].no - b[1].no);

    let latestExecutionTime = lastExecutedTime || -1;

    // eslint-disable-next-line no-restricted-syntax
    for (const [showderpThread, showderpPost] of showderpPosts) {
      latestExecutionTime = Math.max(latestExecutionTime, showderpPost.time);

      if (!lastExecutedTime || (showderpPost.time > lastExecutedTime)) {
        if (showderpPost.trip && showderpPost.com) {
          const comment = showderpPost.com
            .replace(/<wbr>/gm, '')
            .replace(/<(?:.|\n)*?>/gm, ' ');

          battleLinkPatterns.forEach((battleLinkPattern) => {
            const matches = [...comment.matchAll(battleLinkPattern)];

            const rooms = matches.reduce((currentRooms: { [key: string]: boolean }, match) => {
              if (match?.groups?.['room']) {
                return {
                  ...currentRooms,
                  [match?.groups?.['room']]: true,
                };
              }

              return currentRooms;
            }, {});

            Object.keys(rooms).forEach((room) => {
              showdownEventEmitter.emit('battlePost', [
                showderpThread,
                showderpPost,
                room,
              ]);
            });
          });
        }

        if (showderpPost.trip && showderpPost.name && showderpPost.name.startsWith('VerifyUser')) {
          showdownEventEmitter.emit('challengePosts', [showderpPost]);
        }
      }
    }

    lastExecutedTime = await configurationStore.setGlobalConfigurationValue(
      'lastExecutedTime',
      latestExecutionTime,
    );
  }, frequency);

  return [timeout, showdownEventEmitter];
};
