const http = require('http');
const Koa = require('koa');
const Router = require('koa-router');
const { faker } = require('@faker-js/faker');

const app = new Koa();
const router = new Router();

let postsID = [];

app.use((ctx, next) => {
  if (ctx.request.method !== 'OPTIONS') {
    next();
    return;
  }

  ctx.response.set('Access-Control-Allow-Headers', 'x-requested-with');
  ctx.response.set('Access-Control-Allow-Origin', '*');
  ctx.response.set('Access-Control-Allow-Methods', 'GET');
  ctx.response.status = 204;
});

router.get('/posts/latest', (ctx) => {
  ctx.response.set('Access-Control-Allow-Origin', '*');

  function createRandomPost() {
    return {
      id: faker.string.uuid(),
      author_id: faker.string.uuid(),
      title: faker.lorem.lines(),
      author: faker.person.fullName(),
      avatar: faker.image.avatar(),
      image: faker.image.urlLoremFlickr({width: 640, height: 480}),
      created: Date.now()
    }
  }

  const fakerPosts = faker.helpers.multiple(createRandomPost, {
    count: 1,
  });

  postsID = [];

  fakerPosts.forEach(post => postsID.push(post.id))

  const posts = {
    "status": "ok",
    "data": fakerPosts
  }

  ctx.response.status = 200;
  ctx.response.body = JSON.stringify(posts);
});

router.get('/posts/:id/comments/latest', (ctx) => {
  ctx.response.set('Access-Control-Allow-Origin', '*');

  const { id } = ctx.params;

  function createRandomComment() {
    return {
      id: faker.string.uuid(),
      post_id: null,
      author_id: faker.string.uuid(),
      author: faker.person.fullName(),
      avatar: faker.image.avatar(),
      content: faker.helpers.multiple(faker.internet.emoji, { count: 5 }),
      created: Date.now()
    }
  }

  const fakerComments = faker.helpers.multiple(createRandomComment, {
    count: 15,
  });

  let j = 0;
  let k = 0;

  for (let i = 0; i < fakerComments.length; i++) {
    if (i <= 4) {
      fakerComments[i].post_id = postsID[i];
    }
    if (i > 4 && i <= 9) {
      fakerComments[i].post_id = postsID[j];
      j = j + 1;
    }
    if (i > 9 && i <= 14) {
      fakerComments[i].post_id = postsID[k];
      k = k + 1;
    }
  }

  const filterComments = fakerComments.filter(comment => comment.post_id === id);
  console.log(postsID)
  console.log(id)
  console.log(filterComments)

  const comments = {
    "status": "ok",
    "data": filterComments
  }

  ctx.response.status = 200;
  ctx.response.body = JSON.stringify(comments);
});

app.use(router.routes()).use(router.allowedMethods());

const server = http.createServer(app.callback());

const port = process.env.PORT || 3000;

server.listen(port, (err) => {
  if (err) {
    console.log(err);

    return;
  }

  console.log('Server is listen: ' + port);
});