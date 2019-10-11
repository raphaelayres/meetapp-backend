// import * as Yup from 'yup';
import {
  // startOfHour,
  // isBefore,
  parseISO,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { Op } from 'sequelize';

import Meetup from '../models/Meetup';
import User from '../models/User';

class MeetupController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const perpage = 10;

    const parseDate = req.query.date ? parseISO(req.query.date) : null;

    const meetups = await Meetup.findAll({
      where: {
        user_id: {
          [Op.ne]: req.userId,
        },
        canceled_at: null,
        datetime: parseDate
          ? { [Op.between]: [startOfDay(parseDate), endOfDay(parseDate)] }
          : { [Op.ne]: null },
      },
      order: ['datetime'],
      limit: perpage,
      offset: (page - 1) * perpage,
      attributes: ['id', 'title', 'datetime'],
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['name', 'email'],
        },
      ],
    });

    return res.json(meetups);
  }

  // async store(req, res) {
  //   const schema = Yup.object().shape({
  //     title: Yup.string().required(),
  //     description: Yup.string().required(),
  //     localization: Yup.string().required(),
  //     file_id: Yup.string().required(),
  //     datetime: Yup.date()
  //       .test('PastDate', 'Past dates are not permitted', value =>
  //         isBefore(new Date(), startOfHour(value))
  //       )
  //       .required(),
  //   });

  //   try {
  //     await schema.validate(req.body, { abortEarly: false });

  //     const meetup = await Meetup.create({
  //       user_id: req.userId,
  //       ...req.body,
  //     });

  //     return res.json(meetup);
  //   } catch (err) {
  //     let errorList = [];
  //     errorList = err.inner.map(error => ({
  //       [error.path]: error.message,
  //     }));
  //     return res
  //       .status(400)
  //       .json({ error: 'ValidationError', errors: errorList });
  //   }
  // }

  // async update(req, res) {
  //   const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

  //   if (!req.params.id.match(uuidRegex)) {
  //     return res.status(400).json({ error: 'Parameter id is invalid' });
  //   }

  //   const schema = Yup.object().shape({
  //     title: Yup.string(),
  //     description: Yup.string(),
  //     localization: Yup.string(),
  //     file_id: Yup.string(),
  //     datetime: Yup.date().test(
  //       'PastDate',
  //       'Past dates are not permitted',
  //       value => {
  //         if (value) {
  //           return isBefore(new Date(), startOfHour(value));
  //         }
  //         return true;
  //       }
  //     ),
  //   });

  //   try {
  //     await schema.validate(req.body, { abortEarly: false });

  //     const meetup = await Meetup.findByPk(req.params.id);

  //     if (!meetup) {
  //       return res.status(400).json({ error: 'Meetup was not found' });
  //     }

  //     const meetupUpdated = await meetup.update(req.body);

  //     return res.json(meetupUpdated);
  //   } catch (err) {
  //     let errorList = [];
  //     errorList = err.inner.map(error => ({
  //       [error.path]: error.message,
  //     }));
  //     return res
  //       .status(400)
  //       .json({ error: 'ValidationError', errors: errorList });
  //   }
  // }
}

export default new MeetupController();
