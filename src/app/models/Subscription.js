import Sequelize, { Model } from 'sequelize';

class Subscription extends Model {
  static init(sequelize) {
    super.init(
      {
        meetup_id: Sequelize.UUID,
        user_id: Sequelize.UUID,
        canceled_at: Sequelize.DATE,
      },
      { sequelize }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.Meetup, { foreignKey: 'meetup_id', as: 'meetup' });
  }
}

export default Subscription;
