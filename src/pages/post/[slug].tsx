/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import { ReactElement } from 'react';
import {
  AiOutlineCalendar,
  AiOutlineUser,
  AiOutlineClockCircle,
} from 'react-icons/ai';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): ReactElement {
  const totalWords = post.data.content.reduce(
    (totalContent, currentContent) => {
      const headingWords = currentContent.heading?.split(' ').length || 0;

      const bodyWords = currentContent.body.reduce((totalBody, currentBody) => {
        const textWords = currentBody.text.split(' ').length;
        return totalBody + textWords;
      }, 0);

      return totalContent + headingWords + bodyWords;
    },
    0
  );

  const timeToRead = Math.ceil(totalWords / 200);

  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  return (
    <div className={styles['main-container']}>
      <div className={styles['header-container']}>
        <Header />
      </div>
      <div className={styles['image-container']}>
        <Image src={String(post.data.banner.url)} layout="fill" />
      </div>
      <div className={styles['body-container']}>
        <div>
          <h1 id="title">{post.data.title}</h1>
        </div>
        <div className={styles['details-container']}>
          <div>
            <AiOutlineCalendar className={styles.icon} />
            <span>
              {format(
                new Date(new Date(post.first_publication_date)),
                'dd MMM yyyy',
                {
                  locale: ptBR,
                }
              )}
            </span>
          </div>
          <div>
            <AiOutlineUser className={styles.icon} />
            <span>{post.data.author}</span>
          </div>
          <div>
            <AiOutlineClockCircle className={styles.icon} />
            <span> {timeToRead} min</span>
          </div>
        </div>
        <div className={styles['text-container']}>
          <div>
            {post.data.content.map(content => {
              return (
                <section key={content.heading} className={styles.postContent}>
                  <h2>{content.heading}</h2>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(content.body),
                    }}
                  />
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: [],
      pageSize: 100,
    }
  );

  const paths = response.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });
  return {
    paths,
    fallback: 'blocking', // could be true, false or blocking
  };
};

interface IGetStaticProps {
  props: {
    post: Post;
  };
}

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const { slug } = context.params;
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  return {
    props: {
      post,
    },
  };
};
