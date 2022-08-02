import type { GetStaticProps, NextPage } from "next";
import Link from "next/link";
import { createSSGHelpers } from "@trpc/react/ssg";
import superjson from "superjson";
import { createContext } from "~/server/context";
import { appRouter } from "~/server/routers/_app";
import { trpc } from "~/utils/trpc";
import Container from "~/components/Container";

const Home: NextPage = () => {
  const utils = trpc.useContext();
  const usersQuery = trpc.useQuery(["user.all"]);

  const createUser = trpc.useMutation(["user.add"], {
    async onSuccess() {
      await utils.invalidateQueries(["user.all"]);
    },
  });

  const deleteUser = trpc.useMutation(["user.delete"], {
    async onSuccess() {
      await utils.invalidateQueries(["user.all"]);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    /**
     * In a real app you probably don't want to use this manually
     * Checkout React Hook Form - it works great with tRPC
     * @see https://react-hook-form.com/
     */
    const $name: HTMLInputElement = (e as any).target.elements.name;
    const $email: HTMLInputElement = (e as any).target.elements.email;
    const input = {
      name: $name.value,
      email: $email.value,
    };
    try {
      await createUser.mutateAsync(input);
      $name.value = "";
      $email.value = "";
    } catch {}
  };

  const handleDelete = async (id: string) => {
    const input = {
      id: id,
    };
    try {
      await deleteUser.mutateAsync(input);
    } catch {}
  };

  return (
    <Container>
      <h1>Next.js with tRPC</h1>

      <h2>
        Posts
        {usersQuery.status === "loading" && "(loading)"}
      </h2>

      {usersQuery.data?.map((user) => (
        <div key={user.id} style={{ margin: "20px 0px" }}>
          <div>
            {user.name} - {user.email}
            <button
              style={{ margin: "0px 8px" }}
              onClick={() => handleDelete(user.id)}
            >
              Delete
            </button>
          </div>

          <Link href={`/user/${user.id}`}>
            <a>View more</a>
          </Link>
        </div>
      ))}

      <form onSubmit={handleSubmit} autoComplete="off">
        <input type="text" name="name" id="name" placeholder="Name" />
        <input type="email" name="email" id="email" placeholder="Email" />
        <button type="submit" disabled={createUser.isLoading}>
          Submit
        </button>
        {createUser && (
          <p style={{ color: "red" }}>{createUser.error?.message}</p>
        )}
      </form>
    </Container>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const ssg = createSSGHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson,
  });

  await ssg.fetchQuery("user.all");

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 1,
  };
};

export default Home;
