export type TodoTitle = Readonly<{
  value: string;
}>;

export function createTodoTitle(rawTitle: string): TodoTitle {
  const normalizedTitle = rawTitle.trim();

  if (normalizedTitle.length === 0) {
    throw new Error("Todo title must not be empty");
  }

  if (normalizedTitle.length > 120) {
    throw new Error("Todo title must be 120 characters or fewer");
  }

  return {
    value: normalizedTitle
  };
}
