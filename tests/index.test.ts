import type { Chapter, ConnectorNames, Manga } from '../lib';

import { describe, expect, it } from 'vitest';

import { connectors, Status } from '../lib';
import { Connector } from '../lib/connectors/abstract';

describe('main', () => {
  it('should export the main interfaces', () => {
    const chapterId = 'id';
    const chapterName = 'name';
    const chapterSlug = 'slug';
    const chapterTitle = 'title';
    const chapterIndex = 1;
    const chapterUrl = 'url';
    const chapterReleasedAt = new Date();
    const chapterImages = ['image-1', 'image-2'];

    const chapter: Chapter = {
      id: chapterId,
      name: chapterName,
      slug: chapterSlug,
      title: chapterTitle,
      index: chapterIndex,
      url: chapterUrl,
      releasedAt: chapterReleasedAt,
      images: chapterImages,
    };

    expect(chapter).toHaveProperty('id', chapterId);
    expect(chapter).toHaveProperty('name', chapterName);
    expect(chapter).toHaveProperty('slug', chapterSlug);
    expect(chapter).toHaveProperty('title', chapterTitle);
    expect(chapter).toHaveProperty('index', chapterIndex);
    expect(chapter).toHaveProperty('url', chapterUrl);
    expect(chapter).toHaveProperty('releasedAt', chapterReleasedAt);
    expect(chapter).toHaveProperty('images', chapterImages);

    const mangaId = 'id';
    const mangaSlug = 'slug';
    const mangaTitle = 'title';
    const mangaAuthor = 'author';
    const mangaArtist = 'artist';
    const mangaExcerpt = 'excerpt';
    const mangaImage = 'image';
    const mangaUrl = 'url';
    const mangaReleasedAt = new Date();
    const mangaStatus = Status.Completed;
    const mangaGenres = ['genre-1', 'genre-2'];
    const mangaScore = 10;
    const mangaChaptersCount = 1;

    const manga: Manga = {
      id: mangaId,
      slug: mangaSlug,
      title: mangaTitle,
      author: mangaAuthor,
      artist: mangaArtist,
      excerpt: mangaExcerpt,
      image: mangaImage,
      url: mangaUrl,
      releasedAt: mangaReleasedAt,
      status: mangaStatus,
      genres: mangaGenres,
      score: mangaScore,
      chaptersCount: mangaChaptersCount,
    };

    expect(manga).toHaveProperty('id', mangaId);
    expect(manga).toHaveProperty('slug', mangaSlug);
    expect(manga).toHaveProperty('title', mangaTitle);
    expect(manga).toHaveProperty('author', mangaAuthor);
    expect(manga).toHaveProperty('artist', mangaArtist);
    expect(manga).toHaveProperty('excerpt', mangaExcerpt);
    expect(manga).toHaveProperty('image', mangaImage);
    expect(manga).toHaveProperty('url', mangaUrl);
    expect(manga).toHaveProperty('releasedAt', mangaReleasedAt);
    expect(manga).toHaveProperty('status', mangaStatus);
    expect(manga).toHaveProperty('genres', mangaGenres);
    expect(manga).toHaveProperty('score', mangaScore);
    expect(manga).toHaveProperty('chaptersCount', mangaChaptersCount);
  });

  it('should export the connectors', () => {
    const expectedConnectorNames: ConnectorNames[] = ['mangapark', 'omegascans'];
    const connectorNames = Object.keys(connectors);
    const connectorsValues = Object.values(connectors);

    expect(connectorNames).toHaveLength(2);
    expect(connectorNames).toEqual(expectedConnectorNames);
    connectorsValues.forEach(connector => expect(connector).toBeInstanceOf(Connector));
  });
});
