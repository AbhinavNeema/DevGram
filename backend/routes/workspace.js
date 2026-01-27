const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/workspaceController");

router.post("/", auth, ctrl.createWorkspace);
router.get("/", auth, ctrl.getMyWorkspaces);

// ✅ single, consistent param
router.get("/:workspaceId", auth, ctrl.getWorkspaceById);
router.post("/:workspaceId/invite", auth, ctrl.inviteByEmail);
router.post("/:workspaceId/accept", auth, ctrl.acceptInvite);
router.put("/:workspaceId/role/:targetUserId", auth, ctrl.changeRole);
router.delete(
  "/:workspaceId/members/:targetUserId",
  auth,
  ctrl.removeMember
);
module.exports = router;