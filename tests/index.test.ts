import { Chapter, ConnectorNames, Manga, Status, connectors } from '../lib';
import { Connector } from '../lib/connectors/abstract';

describe('main', () => {
  it('should export the main interfaces', () => {
    const chapterId = 'id';
    const chapterImages = ['image-1', 'image-2'];
    const chapterIndex = 1;
    const chapterTitle = 'title';
    const chapterUrl = 'url';
    const chapterReleasedAt = new Date();

    const chapter: Chapter = {
      id: chapterId,
      images: chapterImages,
      index: chapterIndex,
      title: chapterTitle,
      url: chapterUrl,
      releasedAt: chapterReleasedAt,
    };

    expect(chapter).toHaveProperty('id', chapterId);
    expect(chapter).toHaveProperty('images', chapterImages);
    expect(chapter).toHaveProperty('index', chapterIndex);
    expect(chapter).toHaveProperty('title', chapterTitle);
    expect(chapter).toHaveProperty('url', chapterUrl);
    expect(chapter).toHaveProperty('releasedAt', chapterReleasedAt);

    const mangaChapters = [chapter];
    const mangaChaptersCount = 1;
    const mangaGenres = ['genre-1', 'genre-2'];
    const mangaId = 'id';
    const mangaStatus = Status.Completed;
    const mangaTitle = 'title';
    const mangaUrl = 'url';
    const mangaExcerpt = 'excerpt';
    const mangaImage = 'image';
    const mangaReleasedAt = new Date();
    const mangaScore = 10;

    const manga: Manga = {
      chapters: mangaChapters,
      chaptersCount: mangaChaptersCount,
      genres: mangaGenres,
      id: mangaId,
      status: mangaStatus,
      title: mangaTitle,
      url: mangaUrl,
      excerpt: mangaExcerpt,
      image: mangaImage,
      releasedAt: mangaReleasedAt,
      score: mangaScore,
    };

    expect(manga).toHaveProperty('chapters', mangaChapters);
    expect(manga).toHaveProperty('chapters.0.id', chapterId);
    expect(manga).toHaveProperty('chapters.0.images', chapterImages);
    expect(manga).toHaveProperty('chapters.0.index', chapterIndex);
    expect(manga).toHaveProperty('chapters.0.title', chapterTitle);
    expect(manga).toHaveProperty('chapters.0.url', chapterUrl);
    expect(manga).toHaveProperty('chapters.0.releasedAt', chapterReleasedAt);
    expect(manga).toHaveProperty('chaptersCount', mangaChaptersCount);
    expect(manga).toHaveProperty('genres', mangaGenres);
    expect(manga).toHaveProperty('id', mangaId);
    expect(manga).toHaveProperty('status', mangaStatus);
    expect(manga).toHaveProperty('title', mangaTitle);
    expect(manga).toHaveProperty('url', mangaUrl);
    expect(manga).toHaveProperty('excerpt', mangaExcerpt);
    expect(manga).toHaveProperty('image', mangaImage);
    expect(manga).toHaveProperty('releasedAt', mangaReleasedAt);
    expect(manga).toHaveProperty('score', mangaScore);
  });

  it('should export the connectors', () => {
    const expectedConnectorNames: ConnectorNames[] = ['mangapark', 'omegascans'];
    const connectorNames = Object.keys(connectors);
    const connectorsValues = Object.values(connectors);

    expect(connectorNames).toHaveLength(2);
    expect(connectorNames).toEqual(expectedConnectorNames);
    connectorsValues.forEach((connector) => expect(connector).toBeInstanceOf(Connector));
  });
});
