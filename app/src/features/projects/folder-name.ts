import type { ProjectFolder } from "@/types/types";

// Folders are created empty and named in place, so an unnamed folder is a
// normal state rather than an error.
export const folderName = (folder: ProjectFolder) =>
  folder.Name !== "" ? folder.Name : "Untitled Folder";
