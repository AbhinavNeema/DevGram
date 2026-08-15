const Workspace = require("../models/Workspace");
const User = require("../models/User");
const Channel = require("../models/Channel");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Constants
const GENERAL_CHANNEL = "general";
const INVITE_EXPIRY_DAYS = 7;

/* CREATE WORKSPACE */
exports.createWorkspace = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Workspace name is required" });
    }

    const workspace = await Workspace.create({
      name: name.trim(),
      description: description?.trim() || "",
      owner: userId,
      members: [{ user: userId, role: "owner" }],
    });

    // Create default #general channel
    await Channel.create({
      name: GENERAL_CHANNEL,
      workspace: workspace._id,
      members: [userId],
      createdBy: userId,
    });

    const populated = await Workspace.findById(workspace._id)
      .populate("members.user", "name email username");

    res.status(201).json(populated);
  } catch (err) {
    console.error("Create workspace error:", err);
    res.status(500).json({ message: "Failed to create workspace" });
  }
};

/* GET MY WORKSPACES */
exports.getMyWorkspaces = async (req, res) => {
  try {
    const userId = req.userId;

    const workspaces = await Workspace.find({
      "members.user": userId,
    })
      .select("name description createdAt members")
      .populate("members.user", "name email username")
      .sort({ createdAt: -1 });

    res.json(workspaces);
  } catch (err) {
    console.error("Get workspaces error:", err);
    res.status(500).json({ message: "Failed to get workspaces" });
  }
};

/* GET WORKSPACE BY ID */
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

/* INVITE USER BY EMAIL */
exports.inviteByEmail = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email, role = "member" } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!["admin", "member"].includes(role)) {
      return res.status(400).json({ message: "Role must be admin or member" });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check requester's role
    const requester = workspace.members.find(
      m => m.user.toString() === req.userId
    );

    if (!requester || !["owner", "admin"].includes(requester.role)) {
      return res.status(403).json({ message: "Only admins can invite" });
    }

    // Prevent inviting yourself
    const requesterUser = await User.findById(req.userId);
    if (requesterUser?.email.toLowerCase() === email.toLowerCase()) {
      return res.status(400).json({ message: "Cannot invite yourself" });
    }

    // Prevent duplicate invites
    const alreadyInvited = workspace.pendingInvites.some(
      inv => inv.email.toLowerCase() === email.toLowerCase()
    );
    if (alreadyInvited) {
      return res.status(409).json({ message: "User already invited" });
    }

    const targetUser = await User.findOne({ email: email.toLowerCase() });
    if (targetUser) {
      const isMember = workspace.members.some(
        m => m.user.toString() === targetUser._id.toString()
      );
      if (isMember) {
        return res.status(409).json({ message: "User is already a member" });
      }
    }

    workspace.pendingInvites.push({
      email: email.toLowerCase(),
      invitedBy: req.userId,
      role,
    });
    await workspace.save();

    // Send email
    await sendInviteEmail(email, workspaceId, role);

    res.json({ message: "Invite sent successfully" });
  } catch (err) {
    console.error("Invite error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ACCEPT INVITE */
exports.acceptInvite = async (req, res) => {
  try {
    const userId = req.userId;
    const { workspaceId } = req.params;

    // Get user email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Find pending invite for this email
    const inviteIndex = workspace.pendingInvites.findIndex(
      inv => inv.email.toLowerCase() === user.email.toLowerCase()
    );

    if (inviteIndex === -1) {
      return res.status(400).json({ message: "No invite found for your email" });
    }

    const invite = workspace.pendingInvites[inviteIndex];

    // Add user to members
    workspace.members.push({
      user: userId,
      role: invite.role || "member",
    });

    // Remove from pending invites
    workspace.pendingInvites.splice(inviteIndex, 1);
    await workspace.save();

    // Auto-add to #general channel
    await Channel.findOneAndUpdate(
      { workspace: workspaceId, name: GENERAL_CHANNEL },
      { $addToSet: { members: userId } }
    );

    res.json({
      message: "Joined workspace successfully",
      workspaceId: workspace._id,
    });
  } catch (err) {
    console.error("acceptInvite error:", err);
    res.status(500).json({ message: "Failed to accept invite" });
  }
};

/* CHANGE MEMBER ROLE */
exports.changeRole = async (req, res) => {
  try {
    const { workspaceId, targetUserId } = req.params;
    const { role } = req.body;
    const requesterId = req.userId;

    if (!["admin", "member"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (requesterId === targetUserId) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check requester is owner or admin
    const requester = workspace.members.find(
      m => m.user.toString() === requesterId
    );

    if (!requester || !["owner", "admin"].includes(requester.role)) {
      return res.status(403).json({ message: "Not authorized to change roles" });
    }

    // Find target member
    const target = workspace.members.find(
      m => m.user.toString() === targetUserId
    );

    if (!target) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Cannot change owner's role
    if (target.role === "owner") {
      return res.status(403).json({ message: "Cannot change owner's role" });
    }

    // Admin cannot change admin
    if (requester.role === "admin" && target.role === "admin") {
      return res.status(403).json({ message: "Admins cannot change other admins" });
    }

    // Owner can change anyone (except themselves)
    target.role = role;
    await workspace.save();

    const updated = await Workspace.findById(workspaceId)
      .populate("members.user", "name email username");

    res.json({
      message: "Role updated successfully",
      workspace: updated,
    });
  } catch (err) {
    console.error("changeRole error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* REMOVE MEMBER */
exports.removeMember = async (req, res) => {
  try {
    const { workspaceId, targetUserId } = req.params;
    const requesterId = req.userId;

    if (requesterId === targetUserId) {
      return res.status(400).json({ message: "Cannot remove yourself" });
    }

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

    if (!target) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Check permissions
    if (!requester || !["owner", "admin"].includes(requester.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Cannot remove owner
    if (target.role === "owner") {
      return res.status(403).json({ message: "Cannot remove owner" });
    }

    // Admin cannot remove admin
    if (requester.role === "admin" && target.role === "admin") {
      return res.status(403).json({ message: "Admins cannot remove admins" });
    }

    // Remove from workspace
    workspace.members = workspace.members.filter(
      m => m.user.toString() !== targetUserId
    );
    await workspace.save();

    // Remove from all channels
    await Channel.updateMany(
      { workspace: workspaceId },
      { $pull: { members: targetUserId } }
    );

    res.json({ message: "Member removed successfully" });
  } catch (err) {
    console.error("Remove member error:", err);
    res.status(500).json({ message: "Failed to remove member" });
  }
};

/* LEAVE WORKSPACE */
exports.leaveWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.userId;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const member = workspace.members.find(
      m => m.user.toString() === userId
    );

    if (!member) {
      return res.status(400).json({ message: "Not a member" });
    }

    // Owner cannot leave without transferring ownership
    if (member.role === "owner") {
      return res.status(400).json({
        message: "Owner cannot leave. Transfer ownership first or delete the workspace."
      });
    }

    workspace.members = workspace.members.filter(
      m => m.user.toString() !== userId
    );
    await workspace.save();

    // Remove from all channels
    await Channel.updateMany(
      { workspace: workspaceId },
      { $pull: { members: userId } }
    );

    res.json({ message: "Left workspace successfully" });
  } catch (err) {
    console.error("Leave workspace error:", err);
    res.status(500).json({ message: "Failed to leave workspace" });
  }
};

/* SEND INVITE EMAIL */
async function sendInviteEmail(email, workspaceId, role) {
  try {
    // Create invite token
    const token = jwt.sign(
      {
        email: email.toLowerCase(),
        workspaceId,
        role,
        type: "workspace-invite",
      },
      process.env.JWT_SECRET,
      { expiresIn: `${INVITE_EXPIRY_DAYS}d` }
    );

    const inviteLink = `${process.env.FRONTEND_URL}/invite/${token}`;

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f9fafb; margin: 0; padding: 40px; }
        .container { max-width: 520px; margin: auto; background: white; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb; }
        h2 { margin: 0 0 12px; color: #111827; }
        p { color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
        .btn { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
        .footer { color: #6b7280; font-size: 13px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>🚀 You're invited to DevGram</h2>
        <p>You've been invited to join a workspace on <strong>DevGram</strong> as a <strong>${role}</strong>.</p>
        <div style="text-align: center;">
          <a href="${inviteLink}" class="btn">Join Workspace</a>
        </div>
        <p style="font-size: 13px; color: #6b7280;">This invitation will expire in ${INVITE_EXPIRY_DAYS} days. If you weren't expecting this invite, you can safely ignore this email.</p>
        <div class="footer">DevGram • Team collaboration made simple</div>
      </div>
    </body>
    </html>
    `;

    await transporter.sendMail({
      from: `"DevGram" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "You're invited to join a DevGram workspace",
      html,
    });

    console.log("📧 Invite email sent to:", email);
  } catch (err) {
    console.error("Failed to send invite email:", err.message);
    // Don't throw - invite is still created in DB
  }
}

/* UPDATE WORKSPACE */
exports.updateWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.userId;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Workspace name is required" });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check permission (owner or admin)
    const member = workspace.members.find(
      m => m.user.toString() === userId
    );

    if (!member || !["owner", "admin"].includes(member.role)) {
      return res.status(403).json({ message: "Not authorized to update workspace" });
    }

    workspace.name = name.trim();
    workspace.description = description?.trim() || "";
    await workspace.save();

    const populated = await Workspace.findById(workspaceId)
      .populate("members.user", "name email username");

    res.json(populated);
  } catch (err) {
    console.error("Update workspace error:", err);
    res.status(500).json({ message: "Failed to update workspace" });
  }
};

/* DELETE WORKSPACE */
exports.deleteWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.userId;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Only owner can delete
    if (workspace.owner.toString() !== userId) {
      return res.status(403).json({ message: "Only owner can delete workspace" });
    }

    // Delete all channels in workspace
    await Channel.deleteMany({ workspace: workspaceId });

    // Delete workspace
    await workspace.deleteOne();

    res.json({ message: "Workspace deleted successfully" });
  } catch (err) {
    console.error("Delete workspace error:", err);
    res.status(500).json({ message: "Failed to delete workspace" });
  }
};