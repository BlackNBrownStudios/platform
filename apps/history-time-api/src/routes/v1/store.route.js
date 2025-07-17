const express = require('express');

const storeController = require('../../controllers/store.controller');
const { auth } = require('@platform/auth-backend');
const { validate } = require('@platform/backend-core');
const storeValidation = require('../../validations/store.validation');

const router = express.Router();

// Public routes
router.route('/items').get(validate(storeValidation.getStoreItems), storeController.getStoreItems);

router
  .route('/items/:itemId')
  .get(validate(storeValidation.getStoreItem), storeController.getStoreItem);

// Authenticated routes
router.route('/inventory').get(auth(), storeController.getUserInventory);

router
  .route('/inventory/set-active')
  .post(
    auth(),
    validate(storeValidation.setActiveInventoryItem),
    storeController.setActiveInventoryItem
  );

router
  .route('/items/:itemId/purchase')
  .post(auth(), validate(storeValidation.purchaseItem), storeController.purchaseItem);

// Admin routes
router
  .route('/items')
  .post(
    auth('manageGames'),
    validate(storeValidation.createStoreItem),
    storeController.createStoreItem
  );

router
  .route('/items/:itemId')
  .patch(
    auth('manageGames'),
    validate(storeValidation.updateStoreItem),
    storeController.updateStoreItem
  )
  .delete(
    auth('manageGames'),
    validate(storeValidation.deleteStoreItem),
    storeController.deleteStoreItem
  );

module.exports = router;
