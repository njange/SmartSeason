import { Router } from 'express';
import {
  assignFieldController,
  createFieldController,
  createFieldUpdateController,
  getFieldController,
  listFieldImagesController,
  listFieldUpdatesController,
  listFieldsController,
  uploadFieldImageController,
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
import { imageUpload } from '../middleware/upload';

const router = Router();

router.get('/', validateQuery(listFieldQuerySchema), listFieldsController);
router.get('/:id', getFieldController);
router.post('/', authorize('ADMIN'), validateBody(createFieldSchema), createFieldController);
router.patch('/:id', authorize('ADMIN'), validateBody(updateFieldSchema), updateFieldController);
router.patch('/:id/assign', authorize('ADMIN'), validateBody(assignFieldSchema), assignFieldController);
router.post('/:id/updates', authorize('FIELD_AGENT'), validateBody(createUpdateSchema), createFieldUpdateController);
router.get('/:id/updates', listFieldUpdatesController);
router.post('/:id/images', authorize('FIELD_AGENT'), imageUpload.single('image'), uploadFieldImageController);
router.get('/:id/images', listFieldImagesController);

export default router;
