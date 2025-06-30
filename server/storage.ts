import { 
  folders, 
  videos, 
  users,
  type Folder, 
  type InsertFolder, 
  type Video, 
  type InsertVideo,
  type User,
  type InsertUser 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, isNull, sql } from "drizzle-orm";

export interface IStorage {
  // User methods (keeping for auth)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Folder methods
  getAllFolders(): Promise<Folder[]>;
  getFolderById(id: number): Promise<Folder | undefined>;
  getFoldersByParentId(parentId: number | null): Promise<Folder[]>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  updateFolder(id: number, updates: Partial<InsertFolder>): Promise<Folder | undefined>;
  deleteFolder(id: number): Promise<boolean>;

  // Video methods
  getAllVideos(): Promise<Video[]>;
  getVideoById(id: number): Promise<Video | undefined>;
  getVideoByCustomId(customId: string): Promise<Video | undefined>;
  getVideosByFolderId(folderId: number | null): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: number, updates: Partial<InsertVideo>): Promise<Video | undefined>;
  deleteVideo(id: number): Promise<boolean>;

  incrementVideoViews(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Folder methods
  async getAllFolders(): Promise<Folder[]> {
    return await db.select().from(folders).orderBy(folders.name);
  }

  async getFolderById(id: number): Promise<Folder | undefined> {
    const [folder] = await db.select().from(folders).where(eq(folders.id, id));
    return folder || undefined;
  }

  async getFoldersByParentId(parentId: number | null): Promise<Folder[]> {
    const query = parentId === null 
      ? db.select().from(folders).where(isNull(folders.parentId))
      : db.select().from(folders).where(eq(folders.parentId, parentId));

    return await query.orderBy(folders.name);
  }

  async createFolder(folder: InsertFolder): Promise<Folder> {
    const [newFolder] = await db
      .insert(folders)
      .values(folder)
      .returning();
    return newFolder;
  }

  async updateFolder(id: number, updates: Partial<InsertFolder>): Promise<Folder | undefined> {
    const [updatedFolder] = await db
      .update(folders)
      .set(updates)
      .where(eq(folders.id, id))
      .returning();
    return updatedFolder || undefined;
  }

  async deleteFolder(id: number): Promise<boolean> {
    const result = await db
      .delete(folders)
      .where(eq(folders.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Video methods
  async getAllVideos(): Promise<Video[]> {
    return await db.select().from(videos).orderBy(desc(videos.createdAt));
  }

  async getVideoById(id: number): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video || undefined;
  }

  async getVideoByCustomId(customId: string): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.customId, customId));
    return video || undefined;
  }

  async getVideosByFolderId(folderId: number | null): Promise<Video[]> {
    const query = folderId === null 
      ? db.select().from(videos).where(isNull(videos.folderId))
      : db.select().from(videos).where(eq(videos.folderId, folderId));

    return await query.orderBy(desc(videos.createdAt));
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db
      .insert(videos)
      .values(video)
      .returning();
    return newVideo;
  }

  async updateVideo(id: number, updates: Partial<InsertVideo>): Promise<Video | undefined> {
    const [updatedVideo] = await db
      .update(videos)
      .set(updates)
      .where(eq(videos.id, id))
      .returning();
    return updatedVideo || undefined;
  }

  async deleteVideo(id: number): Promise<boolean> {
    const result = await db
      .delete(videos)
      .where(eq(videos.id, id));
    return (result.rowCount || 0) > 0;
  }

  async incrementVideoViews(id: number): Promise<void> {
    await db
      .update(videos)
      .set({ 
        views: sql`COALESCE(${videos.views}, 0) + 1`
      })
      .where(eq(videos.id, id));
  }
}

export const storage = new DatabaseStorage();