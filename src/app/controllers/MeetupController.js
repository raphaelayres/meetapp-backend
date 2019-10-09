import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';
// import pt from 'date-fns/locale/pt';
import Meetup from '../models/Meetup';
import File from '../models/File';

class MeetupController {
  async store(req, res) {
    // validação dos campos padrão
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      localization: Yup.string().required(),
      datetime: Yup.date().required(),
    });

    let errorListValidation = [];

    await schema.validate(req.body, { abortEarly: false }).catch(err => {
      errorListValidation = err.inner.map(error => ({
        [error.path]: error.message,
      }));
    });

    // validação do arquivo (não encontrei uma forma de resolver usando Yup)
    const errorListFile = [];

    const validFileTypes = [
      'image/jpg',
      'image/jpeg',
      'image/gif',
      'image/png',
    ];

    if (!req.file) {
      errorListFile.push({ banner: 'Banner is required' });
    } else if (!validFileTypes.includes(req.file.mimetype)) {
      errorListFile.push({ banner: 'Banner has an invalid image' });
    }

    // junção dos erros
    errorListValidation = [...errorListFile, ...errorListValidation];

    // exibição, caso existão erros
    if (errorListValidation.length > 0) {
      return res
        .status(400)
        .json({ error: 'ValidationError', errors: errorListValidation });
    }

    const { title, description, localization, datetime } = req.body;

    const hourStart = startOfHour(parseISO(datetime));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

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
  }
}

export default new MeetupController();
