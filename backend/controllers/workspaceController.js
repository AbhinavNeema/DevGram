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
      owner: userId,
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
  try {
    const userId = req.userId;

    const workspaces = await Workspace.find({
      "members.user": userId,
    }).select("name description createdAt");

    res.json(workspaces);
  } catch (err) {
    console.error("getMyWorkspaces error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* INVITE USER BY EMAIL */
exports.inviteByEmail = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Authorization: only owner/admin can invite
    const requester = workspace.members.find(
      (m) => m.user && m.user.toString() === req.userId
    );
    if (!requester || !["owner", "admin"].includes(requester.role)) {
      return res.status(403).json({ message: "Only admins can invite members" });
    }

    // Prevent duplicate invites
    const alreadyInvited = workspace.pendingInvites.some(
      (inv) => inv.email && inv.email.toLowerCase().trim() === normalizedEmail
    );

    if (alreadyInvited) {
      return res.status(409).json({ message: "User already invited" });
    }

    // Check if the invited email belongs to an existing member
    const invitedUser = await User.findOne({ email: normalizedEmail });
    if (invitedUser) {
      const alreadyMember = workspace.members.some(
        (m) => m.user && m.user.toString() === invitedUser._id.toString()
      );
      if (alreadyMember) {
        return res.status(409).json({ message: "User is already a member" });
      }
    }

    workspace.pendingInvites.push({ email: normalizedEmail });
    await workspace.save();

    // 👉 EMAIL SENDING
    await sendInviteEmail(normalizedEmail, workspace._id);

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

    const workspace = await Workspace.findById(workspaceId).populate(
      "members.user",
      "name email username profilePhoto"
    );

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Filter out null users before isMember check
    workspace.members = workspace.members.filter((m) => m.user != null);

    const isMember = workspace.members.some(
      (m) => m.user._id.toString() === userId
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

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const userEmail = (user.email || "").toLowerCase().trim();
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const inviteIndex = workspace.pendingInvites.findIndex(
      (i) => i.email && i.email.toLowerCase().trim() === userEmail
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
        (memberId) => memberId.toString() === userId.toString()
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

/* ACCEPT INVITE BY TOKEN */
exports.acceptInviteByToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Invite token required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      return res.status(400).json({ message: "Invalid or expired invite token" });
    }

    const { email, workspaceId, type } = decoded;
    if (type !== "workspace-invite" || !email || !workspaceId) {
      return res.status(400).json({ message: "Invalid token payload" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const user =
      (await User.findOne({ email: normalizedEmail })) ||
      (req.userId ? await User.findById(req.userId) : null);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const inviteIndex = workspace.pendingInvites.findIndex(
      (i) => i.email && i.email.toLowerCase().trim() === normalizedEmail
    );

    if (inviteIndex === -1) {
      const isAlreadyMember = workspace.members.some(
        (m) => m.user && m.user.toString() === user._id.toString()
      );
      if (isAlreadyMember) {
        return res.json({
          message: "Already a member of this workspace",
          workspaceId: workspace._id,
        });
      }
      return res.status(400).json({ message: "No pending invite found" });
    }

    const invite = workspace.pendingInvites[inviteIndex];

    const alreadyMember = workspace.members.some(
      (m) => m.user && m.user.toString() === user._id.toString()
    );
    if (!alreadyMember) {
      workspace.members.push({
        user: user._id,
        role: invite.role || "member",
      });
    }

    workspace.pendingInvites.splice(inviteIndex, 1);
    await workspace.save();

    const generalChannel = await Channel.findOne({
      workspace: workspaceId,
      name: "general",
    });

    if (generalChannel) {
      const alreadyInChannel = generalChannel.members.some(
        (memberId) => memberId.toString() === user._id.toString()
      );

      if (!alreadyInChannel) {
        generalChannel.members.push(user._id);
        await generalChannel.save();
      }
    }

    res.json({
      message: "Joined workspace successfully",
      workspaceId: workspace._id,
    });
  } catch (err) {
    console.error("acceptInviteByToken error:", err);
    res.status(500).json({ message: "Failed to accept invite" });
  }
};

exports.changeRole = async (req, res) => {
  try {
    const { workspaceId, targetUserId } = req.params;
    const { role } = req.body;

    if (!["admin", "member"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Authorization: only owner can change roles
    const requester = workspace.members.find(
      (m) => m.user && m.user.toString() === req.userId
    );
    if (!requester || requester.role !== "owner") {
      return res.status(403).json({ message: "Only owner can change roles" });
    }

    const member = workspace.members.find(
      (m) => m.user && m.user.toString() === targetUserId
    );

    if (!member) {
      return res.status(404).json({ message: "User not in workspace" });
    }

    member.role = role;
    await workspace.save();

    res.json(workspace);
  } catch (err) {
    console.error("changeRole error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

async function sendInviteEmail(email, workspaceId) {
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

  try {
    await transporter.sendMail({
      from: `"Devgram" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "You’re invited to join a Devgram workspace",
      html,
    });
  } catch (mailErr) {
    console.warn("Mail send warning (non-fatal):", mailErr.message);
  }

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
      (m) => m.user && m.user.toString() === requesterId.toString()
    );

    const target = workspace.members.find(
      (m) => m.user && m.user.toString() === targetUserId.toString()
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
      (m) => m.user && m.user.toString() !== targetUserId.toString()
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