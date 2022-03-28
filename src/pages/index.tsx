import { ReactElement, useCallback, useState } from 'react';
import Prismic from '@prismicio/client';
import Link from 'next/link';
import { AiOutlineCalendar, AiOutlineUser } from 'react-icons/ai';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';
import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): ReactElement {
  const [posts, setPosts] = useState(postsPagination?.results);
  const [nextPage, setNextpage] = useState(Boolean(postsPagination.next_page));
  console.log(posts);
  const refetchPosts = useCallback(() => {
    fetch(postsPagination.next_page)
      .then(response => response.json())
      .then(res => {
        const newPosts = res.results.map(result => ({
          data: {
            title: result.data.title,
            subtitle: result.data.subtitle,
            author: result.data.author,
            slug: result.data.slug,
          },
          first_publication_date: result.first_publication_date,
          uid: result.slugs[0],
        }));
        setNextpage(res.next_page);
        setPosts(prevState => [...prevState, ...newPosts]);
      });
  }, [postsPagination.next_page]);

  return (
    <>
      <div className={styles['main-container']}>
        <div>
          <Header />
        </div>
        <div className={styles['posts-container']}>
          {posts?.map(post => {
            return (
              <div
                className={styles['posts-item']}
                key={String(post.uid) + String(post.first_publication_date)}
              >
                <Link href={`/post/${post.uid}`}>
                  <a>{post.data.title}</a>
                </Link>
                <p>{post.data.subtitle}</p>
                <div className={styles['footer-post-container']}>
                  <div>
                    <AiOutlineCalendar className={styles.icon} />
                    <span>
                      {format(
                        new Date(post.first_publication_date),
                        'dd/mm/yyyy',
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
                </div>
              </div>
            );
          })}
          {nextPage && (
            <button
              className={styles['load-posts-button']}
              onClick={refetchPosts}
              type="button"
            >
              Carregar mais posts
            </button>
          )}
        </div>
      </div>
    </>
  );
}

interface IGetStaticProps {
  props: {
    postsPagination: PostPagination;
  };
}

export const getStaticProps = async (): Promise<IGetStaticProps> => {
  const prismic = getPrismicClient();
  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.content', 'posts.author', 'posts.subtitle'],
      pageSize: 1,
    }
  );

  console.log(response.results[0]);
  const posts = response.results.map(result => ({
    data: {
      title: result.data.title,
      subtitle: result.data.subtitle,
      author: result.data.author,
    },
    first_publication_date: result.first_publication_date,
    uid: result.uid,
  }));

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: response.next_page,
      },
    },
  };
};
