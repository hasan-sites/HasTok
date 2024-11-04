import { GetStaticProps, GetStaticPaths } from 'next';

export const getStaticProps: GetStaticProps = async (context) => {
  const uniqueId = context.params?.uniqueId as string;
  return {
    redirect: {
      destination: `/users/${uniqueId}/date/all`,
      permanent: false,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking'
  };
};

export default function UserIndexPage() {
  return null;
}