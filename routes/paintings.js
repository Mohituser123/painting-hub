const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validatePainting } = require("../middleware.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const paintingController = require("../controllers/paintings.js");

router
  .route("/")
  .get(wrapAsync(paintingController.index))
  .post(
    isLoggedIn,
    upload.single("image"), // ✅ Fixed
    validatePainting,
    wrapAsync(paintingController.createPainting)
  );

router.get("/new", isLoggedIn, paintingController.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(paintingController.showPainting))
  .put(
    isLoggedIn,
    isOwner,
    validatePainting,
    wrapAsync(paintingController.updatePainting)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(paintingController.destroyPainting));

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(paintingController.renderEditForm));

module.exports = router;
