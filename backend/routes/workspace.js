const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/workspaceController");

// Create workspace
router.post("/", auth, ctrl.createWorkspace);

// Get all workspaces for current user
router.get("/", auth, ctrl.getMyWorkspaces);

// Get single workspace by ID
router.get("/:workspaceId", auth, ctrl.getWorkspaceById);

// Update workspace
router.put("/:workspaceId", auth, ctrl.updateWorkspace);

// Delete workspace
router.delete("/:workspaceId", auth, ctrl.deleteWorkspace);

// Invite user by email
router.post("/:workspaceId/invite", auth, ctrl.inviteByEmail);

// Accept invite
router.post("/:workspaceId/accept", auth, ctrl.acceptInvite);

// Change member role
router.put("/:workspaceId/role/:targetUserId", auth, ctrl.changeRole);

// Remove member
router.delete("/:workspaceId/members/:targetUserId", auth, ctrl.removeMember);

// Leave workspace
router.post("/:workspaceId/leave", auth, ctrl.leaveWorkspace);

module.exports = router;