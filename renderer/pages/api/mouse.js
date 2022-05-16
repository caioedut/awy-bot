import { dispatch } from '../../../main/events/mouse';

export default function handler(req, res) {
  dispatch();

  res.status(200).json({ name: 'John Doe' });
}
