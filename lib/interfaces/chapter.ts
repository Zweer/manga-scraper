export interface Chapter {
  id: string;
  name: string;
  slug: string;
  title?: string;
  index: number;
  url: string;
  releasedAt?: Date;
  images: string[];
}
