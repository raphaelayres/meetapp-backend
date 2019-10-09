import * as Yup from 'yup';
import { startOfHour, isBefore } from 'date-fns';
import Meetup from '../models/Meetup';
import File from '../models/File';

class MeetupController {
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
}

export default new MeetupController();
