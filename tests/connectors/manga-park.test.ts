import { MangaParkConnector } from '../../lib/connectors/manga-park';

describe('connectors -> manga park', () => {
  let connector: MangaParkConnector;

  beforeEach(() => {
    connector = new MangaParkConnector();
  });

  describe('getMangas', () => {
    it('should search for a non-existent comic', async () => {
      const mangas = await connector.getMangas('foooooooo');

      expect(mangas).toHaveLength(0);
    });

    it('should search for the "my illustrator" comic', async () => {
      const mangas = await connector.getMangas('illustrator');

      expect(mangas).toHaveLength(11);

      mangas.forEach((manga) => {
        expect(manga).toHaveProperty('id', expect.any(String));
        expect(manga).toHaveProperty('title', expect.any(String));
        expect(manga).toHaveProperty('author', expect.any(String));
        expect(manga).toHaveProperty('artist', expect.any(String));
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
  });

  describe('getManga', () => {
    it('should retrieve a non-existent comic', async () => {
      await expect(connector.getManga('non-existent')).rejects.toThrow('Comic not found');
    });

    it('should retrieve the "my illustrator" comic', async () => {
      const manga = await connector.getManga('341963');

      expect(manga).toHaveProperty('id', '341963');
      expect(manga).toHaveProperty('title', 'My Illustrator');
      expect(manga).toHaveProperty('author', 'It is Fall, Nocturnal');
      expect(manga).toHaveProperty('artist', 'Yooja');
      expect(manga).toHaveProperty('excerpt', 'A small, dazzling romance between the popular novelist Lee Minho, a junior in the Architecture Department, and his muse; illustrator Han Naeun, begins as they continue their activities as sex partners!');
      expect(manga).toHaveProperty('image', 'https://mangapark.net/media/mpim/bee/bee09132ed243e2ecb0efc4fc39781ef109f6e68_640_896_45152.webp');
      expect(manga).toHaveProperty('url', 'https://mangapark.net/title/341963-en-my-illustrator-new');
      expect(manga).toHaveProperty('releasedAt', new Date('2023-03-29T19:54:10.203Z'));
      expect(manga).toHaveProperty('status', 'Completed');
      expect(manga).toHaveProperty('genres', [
        'mature',
        'romance',
        'school_life',
        'adult',
        'manhwa',
        'webtoon',
        'drama',
        'full_color',
      ]);
      expect(manga).toHaveProperty('score', 8.22);
      expect(manga).toHaveProperty('chaptersCount', 83);
      expect(manga).not.toHaveProperty('chapters');
    });
  });

  describe('getChapters', () => {
    it('should retrieve a non-existent comic chapters', async () => {
      await expect(connector.getChapters('non-existent')).rejects.toThrow('Comic not found');
    });

    it('should retrieve the "my illustrator" comic chapters', async () => {
      const chapters = await connector.getChapters('341963');

      expect(chapters).toHaveLength(83);

      chapters.forEach((chapter) => {
        expect(chapter).toHaveProperty('id', expect.any(String));
        expect(chapter).toHaveProperty('name', expect.any(String));
        expect(chapter).toHaveProperty('slug', expect.any(String));
        expect(chapter).toHaveProperty('title');
        expect(chapter).toHaveProperty('index', expect.any(Number));
        expect(chapter).toHaveProperty('url', expect.any(String));
        expect(chapter).toHaveProperty('releasedAt', expect.any(Date));
        expect(chapter).toHaveProperty('images', expect.any(Array));
      });
    });
  });

  describe('getChapter', () => {
    it('should retrieve a chapter from a non-existent comic', async () => {
      await expect(connector.getChapter('non-existent', 'non-existent')).rejects.toThrow(
        'Chapter not found',
      );
    });

    it('should retrieve a non-existent comic chapter', async () => {
      await expect(connector.getChapter('341963', 'non-existent')).rejects.toThrow(
        'Chapter not found',
      );
    });

    it('should retrieve the "my illustrator" comic chapter', async () => {
      const chapter = await connector.getChapter('341963', '7895808');

      expect(chapter).toHaveProperty('id', '7895808');
      expect(chapter).toHaveProperty('name', 'Chapter 1');
      expect(chapter).toHaveProperty('slug', '7895808-chapter-1');
      expect(chapter).toHaveProperty('title', null);
      expect(chapter).toHaveProperty('index', 1);
      expect(chapter).toHaveProperty(
        'url',
        'https://mangapark.net/title/341963-en-my-illustrator-new/7895808-chapter-1',
      );
      expect(chapter).toHaveProperty('releasedAt', new Date('2023-03-29T19:55:09.086Z'));
      expect(chapter).toHaveProperty('images', expect.any(Array));
      expect(chapter.images).toHaveLength(13);
    });
  });
});
