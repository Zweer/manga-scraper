export enum Status {
  Ongoing = 'Ongoing',
  Completed = 'Completed',
  Hiatus = 'Hiatus',
  Cancelled = 'Cancelled',
  Unknown = 'Unknown',
}

export interface Manga {
  id: string;
  slug: string;
  title: string;
  author: string;
  artist: string;
  excerpt?: string;
  image: string;
  url: string;
  releasedAt: Date;
  status: Status;
  genres: string[];
  score: number;
  chaptersCount: number;
}
