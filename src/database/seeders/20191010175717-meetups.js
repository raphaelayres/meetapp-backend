const faker = require('faker');

module.exports = {
  up: async queryInterface => {
    queryInterface.bulkDelete('meetups', null, {});

    const [users] = await queryInterface.sequelize.query(
      'SELECT id FROM users'
    );
    const [files] = await queryInterface.sequelize.query(
      'SELECT id FROM files'
    );

    const items = [];

    users.forEach((user, index) => {
      const total = Math.floor(Math.random() * 5);

      for (let i = 0; i < total; i += 1) {
        items.push({
          user_id: users[index].id,
          file_id: files[i].id,
          title: faker.lorem.words(3),
          description: faker.lorem.paragraphs(),
          localization: faker.address.streetAddress(),
          datetime: faker.date.recent(90),
          created_at: faker.date.recent(90),
          updated_at: new Date(),
        });
      }
    });

    return queryInterface.bulkInsert('meetups', items, {});
  },

  down: queryInterface => {
    return queryInterface.bulkDelete('meetups', null, {});
  },
};
