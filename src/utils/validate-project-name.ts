const validateProjectNameRegex = /^[a-zA-Z0-9]+([a-zA-Z0-9-_]*[a-zA-Z0-9]+)?$/;

export function validateProjectName(name: string) { 
  if (!validateProjectNameRegex.test(name)) {
    return "Invalid project name. Please use only letters, numbers, hyphens, and underscores.";
  }
  
  return undefined;
}