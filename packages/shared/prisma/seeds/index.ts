import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
    },
  });

  // Create regular users
  const users = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.user.create({
        data: {
          email: faker.internet.email(),
          name: faker.person.fullName(),
          role: 'user',
        },
      })
    )
  );

  // Create posts for each user
  const posts = await Promise.all(
    users.flatMap((user) =>
      Array.from({ length: 3 }).map(() =>
        prisma.post.create({
          data: {
            title: faker.lorem.sentence(),
            content: faker.lorem.paragraphs(3),
            published: faker.datatype.boolean(),
            authorId: user.id,
          },
        })
      )
    )
  );

  // Create comments on posts
  await Promise.all(
    posts.flatMap((post) =>
      Array.from({ length: 5 }).map(() =>
        prisma.comment.create({
          data: {
            content: faker.lorem.paragraph(),
            authorId: faker.helpers.arrayElement(users).id,
            postId: post.id,
          },
        })
      )
    )
  );

  console.log('Database has been seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 