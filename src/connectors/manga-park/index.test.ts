import { readFileSync } from 'fs';
import { join } from 'path';

import axios from 'axios';

import { MangaParkConnector } from '.';

const getMangas = JSON.parse(readFileSync(join(__dirname, 'mocks', 'getMangas.json'), 'utf8'));
const getManga = JSON.parse(readFileSync(join(__dirname, 'mocks', 'getManga.json'), 'utf8'));

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('connectors -> manga park', () => {
  let connector: MangaParkConnector;

  beforeAll(() => {
    mockedAxios.create.mockReturnThis();
  });

  beforeEach(() => {
    connector = new MangaParkConnector();
  });

  it('should retrieve the bully comic', async () => {
    mockedAxios.post.mockResolvedValue({ data: getMangas });

    const mangas = await connector.getMangas('illustrator');

    expect(mangas).toHaveLength(10);

    mangas.forEach((manga) => {
      expect(manga).toHaveProperty('id');
      expect(manga).toHaveProperty('title');
      expect(manga).toHaveProperty('excerpt');
      expect(manga).toHaveProperty('image');
      expect(manga).toHaveProperty('url');
      expect(manga).toHaveProperty('releasedAt');
      expect(manga).toHaveProperty('status');
      expect(manga).toHaveProperty('genres');
      expect(manga).toHaveProperty('score');
      expect(manga).toHaveProperty('chaptersCount');
    });
  });

  it('should retrieve the bully comic chapters', async () => {
    mockedAxios.post.mockResolvedValue({ data: getMangas });
    const mangas = await connector.getMangas('illustrator');
    const manga = mangas.find((manga) => manga.id === '341963')!;

    mockedAxios.post.mockResolvedValue({ data: getManga });
    const chapters = await connector.getChapters(manga);

    expect(chapters).toHaveLength(47);
    chapters.forEach((chapter) => {
      expect(chapter).toHaveProperty('id');
      expect(chapter).toHaveProperty('title');
      expect(chapter).toHaveProperty('index');
      expect(chapter).toHaveProperty('url');
      expect(chapter).toHaveProperty('images');
    });
  });
});
