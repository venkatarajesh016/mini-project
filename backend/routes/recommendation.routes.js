/**
 * Recommendation Routes
 * API endpoints for getting song recommendations
 */

import express from 'express';
import * as recommendationController from '../controllers/recommendation.controller.js';

const router = express.Router();

// Health check
router.get('/health', recommendationController.healthCheck);

// Get stats
router.get('/stats', recommendationController.getStats);

// Get recommendations for a specific song
router.get('/:id', recommendationController.getRecommendations);

// Get recommendations with custom details
router.post('/', recommendationController.getRecommendationsByDetails);

// Get recommendations from JioSaavn URL
router.post('/from-url', recommendationController.getRecommendationsByJioSaavnUrl);

// Batch recommendations
router.post('/batch', recommendationController.getBulkRecommendations);

// Clear cache (protected route - add auth middleware as needed)
router.post('/cache/clear', recommendationController.clearCache);

export default router;
