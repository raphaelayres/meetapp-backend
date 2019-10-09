import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';
// import pt from 'date-fns/locale/pt';
import Meetup from '../models/Meetup';
import File from '../models/File';

class MeetupController {
  async store(req, res) {
    const { title, description, localization, datetime } = req.body;
    const hourStart = startOfHour(parseISO(datetime));

    // validação dos campos padrão
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      localization: Yup.string().required(),
      datetime: Yup.date()
        .test('PastDate', 'Past dates are not permitted', value =>
          isBefore(new Date(), startOfHour(value))
        )
        .required(),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });

      const { filename: path, originalname: name } = req.file;

      const file = await File.create({ name, path });

      const meetup = await Meetup.create({
        user_id: req.userId,
        file_id: file.id,
        title,
        description,
        localization,
        datetime,
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
