exports.requireAdminOrOwner = (workspace, userId) => {
  const member = workspace.members.find(
    m => m.user.toString() === userId
  );

  if (!member || !["owner", "admin"].includes(member.role)) {
    throw new Error("Not authorized");
  }

  return member;
};