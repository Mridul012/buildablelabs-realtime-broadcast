import { Router } from 'express';
import {
  createStreamHandler,
  getLiveStreamsHandler,
  getStreamByIdHandler,
  endStreamHandler,
  generateStreamTokenHandler,
} from '../controllers/stream.controller';

const router = Router();

router.post('/', createStreamHandler);
router.get('/', getLiveStreamsHandler);
router.get('/:id', getStreamByIdHandler);
router.patch('/:id/end', endStreamHandler);
router.post('/:id/token', generateStreamTokenHandler);

export default router;
