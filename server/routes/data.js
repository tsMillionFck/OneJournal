const express = require("express");
const router = express.Router();
const dataController = require("../controllers/dataController");
const auth = require("../middleware/auth"); // Need to create middleware or use inline

// Middleware to check token (assuming we extract it from header)
// For now, I'll assume we have a middleware file or I need to create one.
// I will create `server/middleware/auth.js` next.

router.get("/day/:date", auth, dataController.getDayData);
router.post("/day/:date", auth, dataController.updateDayEntry);

router.post("/journal", auth, dataController.saveJournal);
router.delete("/journal/:id", auth, dataController.deleteJournal);

router.get("/config", auth, dataController.getUserConfig);
router.post("/config", auth, dataController.updateUserConfig);

module.exports = router;
