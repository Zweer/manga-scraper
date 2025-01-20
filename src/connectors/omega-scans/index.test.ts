import { OmegaScansConnector } from '.';

describe('connectors -> omega scans', () => {
  let connector: OmegaScansConnector;

  beforeEach(() => {
    connector = new OmegaScansConnector();
  });

  it('should retrieve the bully comic', async () => {
    const mangas = await connector.getMangas('illustrator');

    expect(mangas).toHaveLength(1);

    mangas.forEach((manga) => {
      expect(manga).toHaveProperty('id', '2');
      expect(manga).toHaveProperty('title', 'My Illustrator');
      expect(manga).toHaveProperty('excerpt', expect.any(String));
      expect(manga).toHaveProperty('image', expect.any(String));
      expect(manga).toHaveProperty('url', 'https://omegascans.org/series/my-illustrator');
      expect(manga).toHaveProperty('releasedAt');
      expect(manga).toHaveProperty('status', 'Ongoing');
      expect(manga).toHaveProperty('genres', []);
      expect(manga).toHaveProperty('score', 0);
      expect(manga).toHaveProperty('chaptersCount', 71);
    });
  });

  it(
    'should retrieve the bully comic chapters',
    async () => {
      const mangas = await connector.getMangas('illustrator');
      const manga = mangas.find((manga) => manga.id === '2')!;

      const chapters = await connector.getChapters(manga);

      expect(chapters).toHaveLength(71);
      chapters.forEach((chapter) => {
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
