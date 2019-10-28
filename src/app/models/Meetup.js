import Sequelize, { Model } from 'sequelize';
import { isBefore } from 'date-fns';

class Meetup extends Model {
  static init(sequelize) {
    super.init(
      {
        title: Sequelize.STRING,
        description: Sequelize.STRING,
        localization: Sequelize.STRING,
        datetime: Sequelize.DATE,
        past: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(this.datetime, new Date());
          },
        },
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
