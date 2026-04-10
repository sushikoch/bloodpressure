import { Router, Request, Response } from 'express';
import * as measurementService from '../services/measurementService';
import { measurementsToCSV, generateCSVFilename } from '../utils/csvExporter';

const router = Router();

/**
 * POST /api/measurements
 * Create a new measurement
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { measured_at, systolic, diastolic, pulse, notes } = req.body;

    const measurement = await measurementService.createMeasurement({
      measured_at,
      systolic,
      diastolic,
      pulse,
      notes,
    });

    return res.status(201).json({
      success: true,
      data: measurement,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return res.status(400).json({
      success: false,
      error: message,
    });
  }
});

/**
 * GET /api/measurements
 * Get all measurements
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

    const measurements = await measurementService.getAllMeasurements(limit, offset);

    return res.json({
      success: true,
      data: measurements,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return res.status(500).json({
      success: false,
      error: message,
    });
  }
});

/**
 * GET /api/measurements/:id
 * Get a single measurement by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(typeof req.params.id === 'string' ? req.params.id : '');

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid measurement ID',
      });
    }

    const measurement = await measurementService.getMeasurementById(id);

    if (!measurement) {
      return res.status(404).json({
        success: false,
        error: 'Measurement not found',
      });
    }

    return res.json({
      success: true,
      data: measurement,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return res.status(500).json({
      success: false,
      error: message,
    });
  }
});

/**
 * GET /api/export/csv
 * Export all measurements as CSV
 */
router.get('/export/csv', async (req: Request, res: Response) => {
  try {
    const measurements = await measurementService.getAllMeasurementsForExport();
    const csv = measurementsToCSV(measurements);
    const filename = generateCSVFilename();

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(csv));

    return res.send(csv);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return res.status(500).json({
      success: false,
      error: message,
    });
  }
});

export default router;
