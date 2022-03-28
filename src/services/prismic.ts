import Prismic from '@prismicio/client';

export function getPrismicClient(req?: unknown): any {
  const prismic = Prismic.client(process.env.PRISMIC_API_ENDPOINT, {
    req,
  });

  return prismic;
}
