import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Link from "next/link";
import { createSSGHelpers } from "@trpc/react/ssg";
import superjson from "superjson";
import { createContext } from "~/server/context";
import { appRouter } from "~/server/routers/_app";
import prisma from "~/lib/prisma";
import { trpc } from "~/utils/trpc";
import Container from "~/components/Container";

const UserPage: NextPage = ({
  id,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  // const id = useRouter().query.id as string;
  const userQuery = trpc.useQuery(["user.byId", { id }]);

  return (
    <Container title={`User - ${id}`}>
      {userQuery.data ? (
        <>
          <h1>{userQuery.data.id}</h1>
          <em>
            Created {userQuery.data.createdAt.toLocaleDateString("en-us")}
          </em>
          <p>Raw data:</p>
          <pre>{JSON.stringify(userQuery.data, null, 2)}</pre>
        </>
      ) : (
        <h1>No user with id: {id}</h1>
      )}
      <Link href="/">Back to home</Link>
    </Container>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
    },
  });

  const paths = users.map((user) => ({
    params: {
      id: user.id,
    },
  }));

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { id = "" } = params as { id: string };

  const ssg = createSSGHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson,
  });

  const user = await ssg.fetchQuery("user.byId", { id });

  if (!user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
    revalidate: 1,
  };
};

export default UserPage;
