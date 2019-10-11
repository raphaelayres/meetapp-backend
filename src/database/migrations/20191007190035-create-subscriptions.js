module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
      .then(() => {
        return queryInterface.createTable('subscriptions', {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.DataTypes.UUID,
            defaultValue: Sequelize.literal('uuid_generate_v4()'),
          },
          user_id: {
            type: Sequelize.DataTypes.UUID,
            refereces: { model: 'users', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            allowNull: false,
          },
          meetup_id: {
            type: Sequelize.DataTypes.UUID,
            refereces: { model: 'files', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            allowNull: false,
          },
          canceled_at: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
          },
        });
      });
  },

  down: queryInterface => {
    return queryInterface.dropTable('subscriptions');
  },
};
