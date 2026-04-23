import { Router } from 'express';
import {
  assignFieldController,
  createFieldController,
  createFieldUpdateController,
  getFieldController,
  listFieldUpdatesController,
  listFieldsController,
  updateFieldController
} from '../controllers/fieldsController';
import { authorize } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  assignFieldSchema,
  createFieldSchema,
  createUpdateSchema,
  listFieldQuerySchema,
  updateFieldSchema
} from '../services/fieldService';

const router = Router();

router.get('/', validateQuery(listFieldQuerySchema), listFieldsController);
router.get('/:id', getFieldController);
router.post('/', authorize('ADMIN'), validateBody(createFieldSchema), createFieldController);
router.patch('/:id', authorize('ADMIN'), validateBody(updateFieldSchema), updateFieldController);
router.patch('/:id/assign', authorize('ADMIN'), validateBody(assignFieldSchema), assignFieldController);
router.post('/:id/updates', authorize('FIELD_AGENT'), validateBody(createUpdateSchema), createFieldUpdateController);
router.get('/:id/updates', listFieldUpdatesController);

export default router;
