import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import {
  addFieldUpdate,
  addFieldImage,
  assignFieldToAgent,
  createFieldImageSchema,
  createFieldRecord,
  getFieldByIdForUser,
  getFieldImages,
  getFieldUpdates,
  getFieldsForUser,
  updateFieldRecord
} from '../services/fieldService';
import { AppError } from '../utils/errors';

export async function listFieldsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const result = await getFieldsForUser({
      userId: user.id,
      role: user.role,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
      status: req.query.status as 'ACTIVE' | 'AT_RISK' | 'COMPLETED' | undefined,
      cropType: req.query.cropType as string | undefined,
      noUpdateDaysThreshold: env.atRiskNoUpdateDays,
      stuckStageDaysThreshold: env.atRiskStuckStageDays
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getFieldController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const result = await getFieldByIdForUser({
      id: req.params.id,
      userId: user.id,
      role: user.role,
      noUpdateDaysThreshold: env.atRiskNoUpdateDays,
      stuckStageDaysThreshold: env.atRiskStuckStageDays
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function createFieldController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const created = await createFieldRecord(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}

export async function updateFieldController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const updated = await updateFieldRecord(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function assignFieldController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const assigned = await assignFieldToAgent(req.params.id, req.body.agentId);
    res.json(assigned);
  } catch (error) {
    next(error);
  }
}

export async function createFieldUpdateController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const update = await addFieldUpdate({
      fieldId: req.params.id,
      agentId: user.id,
      role: user.role,
      stage: req.body.stage,
      note: req.body.note
    });
    res.status(201).json(update);
  } catch (error) {
    next(error);
  }
}

export async function listFieldUpdatesController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const updates = await getFieldUpdates({
      fieldId: req.params.id,
      userId: user.id,
      role: user.role
    });
    res.json(updates);
  } catch (error) {
    next(error);
  }
}

export async function uploadFieldImageController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const parsedBody = createFieldImageSchema.parse(req.body);

    if (!req.file) {
      throw new AppError('Image file is required', 400);
    }

    const image = await addFieldImage({
      fieldId: req.params.id,
      agentId: user.id,
      role: user.role,
      fileBuffer: req.file.buffer,
      mimeType: req.file.mimetype,
      note: parsedBody.note
    });

    res.status(201).json(image);
  } catch (error) {
    next(error);
  }
}

export async function listFieldImagesController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const images = await getFieldImages({
      fieldId: req.params.id,
      userId: user.id,
      role: user.role
    });
    res.json(images);
  } catch (error) {
    next(error);
  }
}
