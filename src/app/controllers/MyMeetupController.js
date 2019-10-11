import * as Yup from 'yup';
import { startOfHour, isBefore } from 'date-fns';

import Meetup from '../models/Meetup';

class MyMeetupController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: {
        user_id: req.userId,
      },
      order: ['datetime'],
      attributes: ['id', 'title', 'datetime'],
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      localization: Yup.string().required(),
      file_id: Yup.string().required(),
      datetime: Yup.date()
        .test('PastDate', 'Past dates are not permitted', value =>
          isBefore(new Date(), startOfHour(value))
        )
        .required(),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });

      const meetup = await Meetup.create({
        user_id: req.userId,
        ...req.body,
      });

      return res.json(meetup);
    } catch (err) {
      let errorList = [];
      errorList = err.inner.map(error => ({
        [error.path]: error.message,
      }));
      return res
        .status(400)
        .json({ error: 'ValidationError', errors: errorList });
    }
  }

  async update(req, res) {
    const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

    if (!req.params.id.match(uuidRegex)) {
      return res.status(400).json({ error: 'Parameter id is invalid' });
    }

    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      localization: Yup.string(),
      file_id: Yup.string(),
      datetime: Yup.date().test(
        'PastDate',
        'Past dates are not permitted',
        value => {
          if (value) {
            return isBefore(new Date(), startOfHour(value));
          }
          return true;
        }
      ),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });

      const meetup = await Meetup.findByPk(req.params.id);

      if (!meetup) {
        return res.status(400).json({ error: 'Meetup was not found' });
      }

      if (meetup.user_id !== req.userId) {
        return res.status(401).json({
          error: "You don't have permission to edit this meetup.",
        });
      }

      if (!isBefore(new Date(), startOfHour(meetup.datetime))) {
        return res.status(401).json({
          error: 'you cannot edit a meetup that has already occurred',
        });
      }

      const meetupUpdated = await meetup.update(req.body);

      return res.json(meetupUpdated);
    } catch (err) {
      let errorList = [];
      errorList = err.inner.map(error => ({
        [error.path]: error.message,
      }));
      return res
        .status(400)
        .json({ error: 'ValidationError', errors: errorList });
    }
  }

  async show(req, res) {
    const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

    if (!req.params.id.match(uuidRegex)) {
      return res.status(400).json({ error: 'Parameter id is invalid' });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(400).json({ error: 'Meetup was not found' });
    }

    return res.json(meetup);
  }

  async delete(req, res) {
    const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

    if (!req.params.id.match(uuidRegex)) {
      return res.status(400).json({ error: 'Parameter id is invalid' });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(400).json({
        error: 'This meetup not exists',
      });
    }

    if (meetup.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to cancel this meetup.",
      });
    }

    if (!isBefore(new Date(), startOfHour(meetup.datetime))) {
      return res.status(401).json({
        error: 'you cannot cancel a meetup that has already occurred',
      });
    }

    await meetup.destroy();

    return res.status(204).send();
  }
}

export default new MyMeetupController();
