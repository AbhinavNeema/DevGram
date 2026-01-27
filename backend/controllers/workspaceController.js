const Workspace = require("../models/Workspace");
const User = require("../models/User");
const Channel = require("../models/Channel"); 
exports.createWorkspace = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, description } = req.body;

    const workspace = await Workspace.create({
      name,
      description,
      owner: userId, // ✅ FIX
      members: [{ user: userId, role: "owner" }],
    });

    // default #general channel
    await Channel.create({
      name: "general",
      workspace: workspace._id,
      members: [userId],
      createdBy: userId,
    });

    res.status(201).json(workspace);
  } catch (err) {
    console.error("Create workspace error:", err);
    res.status(500).json({ message: "Failed to create workspace" });
  }
};

/* GET MY WORKSPACES */
exports.getMyWorkspaces = async (req, res) => {
  const userId = req.userId;

  const workspaces = await Workspace.find({
    "members.user": userId,
  }).select("name description createdAt");

  res.json(workspaces);
};

/* INVITE USER BY EMAIL */
exports.inviteByEmail = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // ✅ PREVENT DUPLICATE INVITES
    const alreadyInvited = workspace.pendingInvites.some(
      inv => inv.email === email
    );

    if (alreadyInvited) {
      return res.status(409).json({ message: "User already invited" });
    }

    // ✅ PREVENT INVITING EXISTING MEMBER
    const isMember = workspace.members.some(
      m => m.user?.toString() === req.userId
    );

    if (isMember && email === req.user?.email) {
      return res.status(409).json({ message: "Already a member" });
    }

    workspace.pendingInvites.push({ email });
    await workspace.save();

    // 👉 EMAIL SENDING (only once)
    await sendInviteEmail(email, workspace._id);

    res.json({ message: "Invite sent successfully" });
  } catch (err) {
    console.error("INVITE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
/* GET WORKSPACE DETAILS */
exports.getWorkspaceById = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.userId;

    const workspace = await Workspace.findById(workspaceId)
      .populate("members.user", "name email username");

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isMember = workspace.members.some(
      m => m.user._id.toString() === userId
    );

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(workspace);
  } catch (err) {
    console.error("getWorkspaceById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.acceptInvite = async (req, res) => {
  const userId = req.userId;
  const userEmail = req.user.email;
  const { workspaceId } = req.params;

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) return res.status(404).json({ message: "Workspace not found" });

  const inviteIndex = workspace.pendingInvites.findIndex(
    i => i.email === userEmail
  );

  if (inviteIndex === -1) {
    return res.status(400).json({ message: "No invite found" });
  }

  const invite = workspace.pendingInvites[inviteIndex];

  workspace.members.push({
    user: userId,
    role: invite.role,
  });

  workspace.pendingInvites.splice(inviteIndex, 1);
  await workspace.save();

  res.json({ message: "Joined workspace successfully" });
};

exports.changeRole = async (req, res) => {
  const { workspaceId, targetUserId } = req.params;
  const { role } = req.body; // "admin" | "member"

  if (!["admin", "member"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    return res.status(404).json({ message: "Workspace not found" });
  }

  const member = workspace.members.find(
    m => m.user.toString() === targetUserId
  );

  if (!member) {
    return res.status(404).json({ message: "User not in workspace" });
  }

  member.role = role;
  await workspace.save();

  res.json(workspace);
};

async function sendInviteEmail(email, workspaceId) {
  console.log("📧 Sending invite email to:", email);
  // nodemailer / resend / sendgrid logic here
}

exports.removeMember = async (req, res) => {
  try {
    const { workspaceId, targetUserId } = req.params;
    const requesterId = req.userId;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const requester = workspace.members.find(
      m => m.user.toString() === requesterId
    );

    const target = workspace.members.find(
      m => m.user.toString() === targetUserId
    );

    if (!requester || !target) {
      return res.status(404).json({ message: "Member not found" });
    }

    // ❌ Cannot remove owner
    if (target.role === "owner") {
      return res.status(403).json({ message: "Cannot remove owner" });
    }

    // ❌ Admin cannot remove admin
    if (
      requester.role === "admin" &&
      target.role === "admin"
    ) {
      return res.status(403).json({ message: "Admins cannot remove admins" });
    }

    // ❌ Only owner/admin allowed
    if (!["owner", "admin"].includes(requester.role)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    workspace.members = workspace.members.filter(
      m => m.user.toString() !== targetUserId
    );

    await workspace.save();

    res.json({ message: "Member removed successfully" });
  } catch (err) {
    console.error("Remove member error:", err);
    res.status(500).json({ message: "Failed to remove member" });
  }
};