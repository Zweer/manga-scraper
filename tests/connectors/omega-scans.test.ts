import { OmegaScansConnector } from '../../lib/connectors/omega-scans';

describe('connectors -> omega scans', () => {
  let connector: OmegaScansConnector;

  beforeEach(() => {
    connector = new OmegaScansConnector();
  });

  describe('getMangas', () => {
    it('should search for a non-existent comic', async () => {
      const mangas = await connector.getMangas('foooooooo');

      expect(mangas).toHaveLength(0);
    });

    it('should retrieve the "My Illustrator" comic (+ others)', async () => {
      const mangas = await connector.getMangas('illustrator');

      expect(mangas).toHaveLength(1);

      mangas.forEach((manga) => {
        expect(manga).toHaveProperty('id', '2');
        expect(manga).toHaveProperty('title', 'My Illustrator');
        expect(manga).toHaveProperty('excerpt', expect.any(String));
        expect(manga).toHaveProperty('image', expect.any(String));
        expect(manga).toHaveProperty('url', 'https://omegascans.org/series/my-illustrator');
        expect(manga).toHaveProperty('releasedAt', new Date('2023-03-30T19:19:02.865Z'));
        expect(manga).toHaveProperty('status', 'Ongoing');
        expect(manga).toHaveProperty('genres', []);
        expect(manga).toHaveProperty('score', 0);
        expect(manga).toHaveProperty('chaptersCount', 81);
        expect(manga).not.toHaveProperty('chapters');
      });
    });
  });

  describe('getManga', () => {
    it('should retrieve a non-existent comic', async () => {
      await expect(connector.getManga('non-existent')).rejects.toThrow('Comic not found');
    });

    it('should retrieve the "My Illustrator" comic details', async () => {
      const manga = await connector.getManga('2');

      expect(manga).toHaveProperty('id', '2');
      expect(manga).toHaveProperty('title', 'My Illustrator');
      expect(manga).toHaveProperty('excerpt', expect.any(String));
      expect(manga).toHaveProperty('image', expect.any(String));
      expect(manga).toHaveProperty('url', 'https://omegascans.org/series/my-illustrator');
      expect(manga).toHaveProperty('releasedAt', new Date('2023-04-01T17:51:32.095Z'));
      expect(manga).toHaveProperty('status', 'Ongoing');
      expect(manga).toHaveProperty('genres', []);
      expect(manga).toHaveProperty('score', 0);
      expect(manga).toHaveProperty('chaptersCount', 81);
      expect(manga).not.toHaveProperty('chapters');
    });
  });

  describe('getChapters', () => {
    it('should retrieve a non-existent comic chapters', async () => {
      await expect(connector.getChapters('non-existent')).rejects.toThrow('Comic not found');
    });

    it(
      'should retrieve the "my illustrator" comic chapters',
      async () => {
        const chapters = await connector.getChapters('2');

        expect(chapters).toHaveLength(81);

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
      },
      20 * 1000,
    );
  });

  describe('getChapter', () => {
    it('should retrieve a chapter from a non-existent comic', async () => {
      await expect(connector.getChapter('non-existent', 'non-existent')).rejects.toThrow(
        'Comic not found',
      );
    });

    it('should retrieve a non-existent comic chapter', async () => {
      await expect(connector.getChapter('2', 'non-existent')).rejects.toThrow('Chapter not found');
    });

    it('should retrieve the "my illustrator" comic chapter', async () => {
      const chapter = await connector.getChapter('2', '37');

      expect(chapter).toHaveProperty('id', '37');
      expect(chapter).toHaveProperty('name', 'Chapter 1');
      expect(chapter).toHaveProperty('slug', 'chapter-1');
      expect(chapter).toHaveProperty('title', null);
      expect(chapter).toHaveProperty('index', 1);
      expect(chapter).toHaveProperty(
        'url',
        'https://omegascans.org/series/my-illustrator/chapter-1',
      );
      expect(chapter).toHaveProperty('releasedAt', new Date('2023-04-01T17:52:02.129Z'));
      expect(chapter).toHaveProperty('images', expect.any(Array));
      expect(chapter.images).toHaveLength(20);
    });
  });
});
