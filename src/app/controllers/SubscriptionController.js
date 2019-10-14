import * as Yup from 'yup';
import { startOfHour, isBefore } from 'date-fns';
import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import File from '../models/File';
import Mail from '../../lib/Mail';
import User from '../models/User';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          attributes: ['id', 'title', 'localization', 'datetime'],
          include: [
            {
              model: File,
              as: 'banner',
              attributes: ['path'],
            },
          ],
        },
      ],
      attributes: ['id'],
      order: [[{ model: Meetup, as: 'meetup' }, 'datetime', 'asc']],
    });

    return res.json(subscriptions);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      meetup_id: Yup.string().required(),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });

      const { meetup_id } = req.body;

      const meetup = await Meetup.findByPk(meetup_id, {
        include: [
          { model: User, as: 'organizer', attributes: ['name', 'email'] },
        ],
      });

      if (!meetup) {
        return res.status(400).json({
          error: 'This meetup not exists',
        });
      }

      const subscriptionExist = await Subscription.findOne({
        where: { user_id: req.userId, meetup_id },
      });

      if (subscriptionExist) {
        return res.status(400).json({
          error: 'You already subscribed to this meetup',
        });
      }

      if (meetup.user_id === req.userId) {
        return res.status(401).json({
          error: "you can't sign up for meetups you organize",
        });
      }

      if (!isBefore(new Date(), startOfHour(meetup.datetime))) {
        return res.status(401).json({
          error: 'you cannot subscribe to meetups that have already occurred',
        });
      }

      const subscription = await Subscription.create({
        user_id: req.userId,
        meetup_id,
      });

      await Mail.sendMail({
        to: `${meetup.organizer.name} <${meetup.organizer.email}>`,
        subject: `Nova inscrição - meetup: ${meetup.title}`,
        template: 'subscription',
        context: {
          organizer: meetup.organizer.name,
          user: req.userName,
          meetup,
        },
      });

      return res.json(subscription);
    } catch (err) {
      let errorList = [];

      if (err.inner) {
        errorList = err.inner.map(error => ({
          [error.path]: error.message,
        }));
        return res
          .status(400)
          .json({ error: 'ValidationError', errors: errorList });
      }

      return res.status(500).json({ error: 'Error ocurred' });
    }
  }

  async delete(req, res) {
    const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

    if (!req.params.id.match(uuidRegex)) {
      return res.status(400).json({ error: 'Parameter id is invalid' });
    }

    const subscription = await Subscription.findByPk(req.params.id);

    if (!subscription) {
      return res.status(400).json({
        error: 'This subscription not exists',
      });
    }

    if (subscription.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to cancel this subscription.",
      });
    }

    if (!isBefore(new Date(), startOfHour(subscription.meetup.datetime))) {
      return res.status(401).json({
        error: 'you cannot cancel a subscription that has already occurred',
      });
    }

    await subscription.destroy();

    return res.status(204).send();
  }
}

export default new SubscriptionController();
