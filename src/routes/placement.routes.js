const express = require('express');
const router = express.Router();
const placementController = require('../controllers/placement.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');

// Admin Routes
router.post('/admin/drives', authenticateToken, authorizeRole(['admin']), placementController.createDrive);
router.put('/admin/drives/:id', authenticateToken, authorizeRole(['admin']), placementController.updateDrive);
router.delete('/admin/drives/:id', authenticateToken, authorizeRole(['admin']), placementController.deleteDrive);

// Student Routes
// Note: 'getAllDrives' computes eligibility based on the logged-in user, usually student.
// Admins can also view, but might receive 'isEligible: false' or we can tweak logic if needed. 
// For now, let's allow both to view.
router.get('/drives', authenticateToken, placementController.getAllDrives);

router.get('/student/applications', authenticateToken, authorizeRole(['student']), placementController.getStudentApplications);
router.post('/apply', authenticateToken, authorizeRole(['student']), placementController.applyToDrive);

module.exports = router;
