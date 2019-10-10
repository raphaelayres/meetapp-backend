const faker = require('faker');

function generateFakeUsers(total = 10) {
  const items = [];
  for (let i = 0; i < total; i += 1) {
    items.push({
      name: faker.name.findName(),
      email: `demo${i + 1}@mail.com`,
      password_hash:
        '$2a$08$lcW31OVgdCnKUgLoS1/8SOP3E1RogDV04VIzypbWMd/hVB51NYWS.',
      created_at: faker.date.recent(90),
      updated_at: new Date(),
    });
  }
  return items;
}

module.exports = {
  up: queryInterface => {
    queryInterface.bulkDelete('users', null, {});

    const items = generateFakeUsers();

    return queryInterface.bulkInsert('users', items, {});
  },

  down: queryInterface => {
    return queryInterface.bulkDelete('users', null, {});
  },
};
