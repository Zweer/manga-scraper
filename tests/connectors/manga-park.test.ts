import { MangaParkConnector } from '../../lib/connectors/manga-park';

describe('connectors -> manga park', () => {
  let connector: MangaParkConnector;

  beforeEach(() => {
    connector = new MangaParkConnector();
  });

  it('should retrieve the illustrator comic', async () => {
    const mangas = await connector.getMangas('illustrator');

    expect(mangas).toHaveLength(10);

    mangas.forEach((manga) => {
      expect(manga).toHaveProperty('id', expect.any(String));
      expect(manga).toHaveProperty('title', expect.any(String));
      expect(manga).toHaveProperty('excerpt', expect.any(String));
      expect(manga).toHaveProperty('image', expect.any(String));
      expect(manga).toHaveProperty('url', expect.any(String));
      expect(manga).toHaveProperty('releasedAt', expect.any(Date));
      expect(manga).toHaveProperty('status', expect.any(String));
      expect(manga).toHaveProperty('genres');
      expect(manga).toHaveProperty('score', expect.any(Number));
      expect(manga).toHaveProperty('chaptersCount', expect.any(Number));
      expect(manga).not.toHaveProperty('chapters');
    });
  });

  it('should retrieve the illustrator comic chapters', async () => {
    const manga = await connector.getManga('341963');

    expect(manga).toHaveProperty('id', '341963');
    expect(manga).toHaveProperty('title', 'My Illustrator');
    expect(manga).toHaveProperty('excerpt', expect.any(String));
    expect(manga).toHaveProperty('image', expect.any(String));
    expect(manga).toHaveProperty('url', 'https://mangapark.net/title/341963-en-my-illustrator-new');
    expect(manga).toHaveProperty('releasedAt', new Date('2023-03-29T19:54:10.203Z'));
    expect(manga).toHaveProperty('status', 'Ongoing');
    expect(manga).toHaveProperty('genres', [
      'mature',
      'romance',
      'school_life',
      'adult',
      'manhwa',
      'webtoon',
      'drama',
      'sm_bdsm',
    ]);
    expect(manga).toHaveProperty('score', 8.336283185840708);
    expect(manga).toHaveProperty('chaptersCount', 64);
    expect(manga).toHaveProperty('chapters');

    expect(manga.chapters).toHaveLength(64);
    manga.chapters.forEach((chapter) => {
      expect(chapter).toHaveProperty('id', expect.any(String));
      expect(chapter).toHaveProperty('title', expect.any(String));
      expect(chapter).toHaveProperty('index', expect.any(Number));
      expect(chapter).toHaveProperty('url', expect.any(String));
      expect(chapter).toHaveProperty('images');
    });
  });
});
