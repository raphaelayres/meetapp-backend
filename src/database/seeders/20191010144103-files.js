const faker = require('faker');

function generateFakeFiles(total = 10) {
  const items = [];

  for (let i = 0; i < total; i += 1) {
    items.push({
      name: `${faker.internet.userName()}.jpg`,
      path: `https://picsum.photos/id/${i}/940/300`,
      created_at: faker.date.recent(90),
      updated_at: new Date(),
    });
  }
  return items;
}

module.exports = {
  up: queryInterface => {
    queryInterface.bulkDelete('files', null, {});

    const items = generateFakeFiles();

    return queryInterface.bulkInsert('files', items, {});
  },

  down: queryInterface => {
    return queryInterface.bulkDelete('files', null, {});
  },
};
