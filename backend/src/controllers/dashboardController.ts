import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { getAdminDashboardData, getAgentDashboardData } from '../services/dashboardService';

export async function adminDashboardController(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getAdminDashboardData({
      noUpdateDaysThreshold: env.atRiskNoUpdateDays,
      stuckStageDaysThreshold: env.atRiskStuckStageDays
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function agentDashboardController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getAgentDashboardData({
      userId: req.user!.id,
      noUpdateDaysThreshold: env.atRiskNoUpdateDays,
      stuckStageDaysThreshold: env.atRiskStuckStageDays
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
}
