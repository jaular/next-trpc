import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createRouter } from "~/server/createRouter";

/**
 * Default selector for User.
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 */

const defaultUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  email: true,
  createdAt: true,
});

export const userRouter = createRouter()
  // read all
  .query("all", {
    async resolve({ ctx: { prisma } }) {
      return prisma.user.findMany({
        select: defaultUserSelect,
        orderBy: { createdAt: "desc" },
      });
    },
  })
  // by id
  .query("byId", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx: { prisma } }) {
      const { id } = input;
      const user = await prisma.user.findUnique({
        where: { id },
        select: defaultUserSelect,
      });
      return user;
    },
  })
  // create user
  .mutation("add", {
    input: z.object({
      name: z.string().min(1).max(32),
      email: z.string().min(1).max(32),
    }),
    async resolve({ input, ctx: { prisma } }) {
      const user = await prisma.user.create({
        data: input,
        select: defaultUserSelect,
      });
      return user;
    },
  })
  // delete user
  .mutation("delete", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx: { prisma } }) {
      const { id } = input;
      await prisma.user.delete({
        where: { id },
      });
    },
  });
