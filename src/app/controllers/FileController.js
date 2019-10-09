import File from '../models/File';

class FileController {
  async storage(req, res) {
    if (!req.file) {
      return res.status(400).json({
        error: 'validationError',
        errors: [{ file: 'file is a required field' }],
      });
    }

    const { filename: path, originalname: name } = req.file;

    const file = await File.create({ name, path });

    return res.json(file);
  }
}

export default new FileController();
