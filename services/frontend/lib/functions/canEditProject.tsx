export default function canEditProject(
  userId: string,
  projectMembers: { user_id: string; role: string }[],
): boolean {
  const isProjectOwner = projectMembers.some(
    (member) => member.user_id === userId && member.role === "Owner",
  );
  const isProjectEditor = projectMembers.some(
    (member) => member.user_id === userId && member.role === "Editor",
  );
  const isProjectMember = projectMembers.some(
    (member) => member.user_id === userId && member.role === "Viewer",
  );

  if (isProjectOwner) {
    return true;
  } else if (isProjectEditor) {
    return true;
  }
  if (isProjectMember) {
    return false;
  }

  return false;
}
