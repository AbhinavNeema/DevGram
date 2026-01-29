const Workspace = require("../models/Workspace");
const User = require("../models/User");
const Channel = require("../models/Channel"); 
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
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
  try {
    const userId = req.userId;

    // ✅ fetch user to get email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const userEmail = user.email;
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const inviteIndex = workspace.pendingInvites.findIndex(
      i => i.email === userEmail
    );

    if (inviteIndex === -1) {
      return res.status(400).json({ message: "No invite found" });
    }

    const invite = workspace.pendingInvites[inviteIndex];

    workspace.members.push({
      user: userId,
      role: invite.role || "member",
    });

    workspace.pendingInvites.splice(inviteIndex, 1);
    await workspace.save();
    const generalChannel = await Channel.findOne({
  workspace: workspaceId,
  name: "general",
});

if (generalChannel) {
  const alreadyInChannel = generalChannel.members.some(
    memberId => memberId.toString() === userId.toString()
  );

  if (!alreadyInChannel) {
    generalChannel.members.push(userId);
    await generalChannel.save();
  }
}
    res.json({
      message: "Joined workspace successfully",
      workspaceId: workspace._id,
    });
  } catch (err) {
    console.error("acceptInvite error:", err);
    res.status(500).json({ message: "Failed to accept invite" });
  }
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
  // 🔐 create invite token
  const token = jwt.sign(
    {
      email,
      workspaceId,
      type: "workspace-invite",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const inviteLink = `${process.env.FRONTEND_URL}/invite/${token}`;

  // 📮 mail transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  
  const html = `
  <div style="font-family: Inter, Arial, sans-serif; background:#f9fafb; padding:40px">
    <div style="max-width:520px;margin:auto;background:white;border-radius:12px;padding:32px;border:1px solid #e5e7eb">
      
      <h2 style="margin:0 0 12px;color:#111827;">You’re invited to Devgram 🚀</h2>
      
      <p style="color:#374151;font-size:15px;">
        You’ve been invited to join a workspace on <b>Devgram</b>.
      </p>

      <div style="margin:28px 0;text-align:center">
        <a href="${inviteLink}"
           style="
            display:inline-block;
            background:#4f46e5;
            color:white;
            padding:12px 20px;
            border-radius:8px;
            text-decoration:none;
            font-weight:600;
           ">
          Join Workspace
        </a>
      </div>

      <p style="color:#6b7280;font-size:13px;">
        This invitation will expire in <b>7 days</b>.
        If you weren’t expecting this invite, you can safely ignore this email.
      </p>

      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb" />

      <p style="color:#9ca3af;font-size:12px;">
        Devgram • Team collaboration made simple
      </p>
    </div>
  </div>
  `;

  // 🚀 send mail
  await transporter.sendMail({
    from: `"Devgram" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "You’re invited to join a Devgram workspace",
    html,
  });

  console.log("📧 Invite email sent to:", email);
  console.log("🔗 Invite link:", inviteLink);

  return inviteLink;
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
      m => m.user.toString() === requesterId.toString()
    );

    const target = workspace.members.find(
      m => m.user.toString() === targetUserId.toString()
    );

    if (!requester || !target) {
      return res.status(404).json({ message: "Member not found" });
    }

    // ❌ Cannot remove yourself
    if (requesterId.toString() === targetUserId.toString()) {
      return res.status(403).json({ message: "You cannot remove yourself" });
    }

    // ❌ Cannot remove owner
    if (target.role === "owner") {
      return res.status(403).json({ message: "Cannot remove owner" });
    }

    // ❌ Admin cannot remove admin
    if (requester.role === "admin" && target.role === "admin") {
      return res.status(403).json({ message: "Admins cannot remove admins" });
    }

    // ❌ Only owner/admin allowed
    if (!["owner", "admin"].includes(requester.role)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // ✅ Remove from workspace
    workspace.members = workspace.members.filter(
      m => m.user.toString() !== targetUserId.toString()
    );
    await workspace.save();

    // ✅ Remove from ALL channels of this workspace
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