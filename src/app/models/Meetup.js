import Sequelize, { Model } from 'sequelize';

class Meetup extends Model {
  static init(sequelize) {
    super.init(
      {
        title: Sequelize.STRING,
        description: Sequelize.STRING,
        localization: Sequelize.STRING,
        datetime: Sequelize.DATE,
        canceled_at: Sequelize.DATE,
      },
      { sequelize }
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.Subscription, {
      foreignKey: 'meetup_id',
      as: 'meetup',
    });
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'organizer' });
    this.belongsTo(models.File, { foreignKey: 'file_id', as: 'banner' });
  }
}

export default Meetup;
