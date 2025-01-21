import { OmegaScansConnector } from '../../lib/connectors/omega-scans';

describe('connectors -> omega scans', () => {
  let connector: OmegaScansConnector;

  beforeEach(() => {
    connector = new OmegaScansConnector();
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
      expect(manga).toHaveProperty('chaptersCount', 71);
      expect(manga).not.toHaveProperty('chapters');
    });
  });

  it(
    'should retrieve the "My Illustrator" comic details',
    async () => {
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
      expect(manga).toHaveProperty('chaptersCount', 71);
      expect(manga).toHaveProperty('chapters');

      expect(manga.chapters).toHaveLength(71);
      manga.chapters.forEach((chapter) => {
        expect(chapter).toHaveProperty('id', expect.any(String));
        expect(chapter).toHaveProperty('title', expect.any(String));
        expect(chapter).toHaveProperty('index', expect.any(Number));
        expect(chapter).toHaveProperty('url', expect.any(String));
        expect(chapter).toHaveProperty('images');
      });
    },
    20 * 1000,
  );
});
