export interface Tag {
  id: string;
  name: string;
}

export interface TagAssignment {
  id: string;
  tagId: string;
  entryType: string;
  entryId: string;
}
