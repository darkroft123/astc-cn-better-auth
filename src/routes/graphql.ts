import express, { Request, Response } from "express";
import { graphql, buildSchema, GraphQLError } from "graphql";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { db } from "../db.js";

const schema = buildSchema(`
  type RoleOutput {
    id: ID!
    code: String!
    name: String!
  }

  type UserOutput {
    id: ID
    username: String
    email: String
    firstName: String
    lastName: String
    fullName: String
    phone: String
    avatarUrl: String
    roleId: String
    roleCode: String
    roleName: String
  }

  type CreateUserResponse {
    id: ID
    username: String
    email: String
    firstName: String
    lastName: String
    phone: String
    roleId: String
    avatarUrl: String
    roleCode: String
    roleName: String
  }

  input CreateUserInput {
    id: String
    username: String
    email: String!
    password: String
    firstName: String
    lastName: String
    phone: String
    roleId: String!
    avatarUrl: String
  }

  input EditUserInput {
    username: String
    email: String
    firstName: String
    lastName: String
    phone: String
    roleId: String
    avatarUrl: String
    password: String
  }

  type Query {
    ping: String
    listRoles: [RoleOutput]
    listUsers: [UserOutput]
    getUser(id: String): UserOutput
  }

  type Mutation {
    createUser(input: CreateUserInput): CreateUserResponse
    editUser(id: String, input: EditUserInput): UserOutput
    deleteUser(id: String): Boolean
  }
`);

function formatAvatarUrl(avatarUrl: string | null | undefined): string | null {
  if (!avatarUrl) return null;
  const s3Public = process.env.S3_PUBLIC_ENDPOINT || "https://minio-s3.astc.joyit.io";
  if (avatarUrl.includes("http://minio:9000") || avatarUrl.includes("astc.local")) {
    return avatarUrl
      .replace("http://minio:9000", s3Public)
      .replace("https://minio-s3.astc.local", s3Public)
      .replace("http://minio-s3.astc.local", s3Public);
  }
  return avatarUrl;
}

function mapUserToOutput(user: any) {
  if (!user) return null;
  const role = user.role || {};
  const firstName = user.first_name || null;
  const lastName = user.last_name || null;
  const fullName = user.full_name || [firstName, lastName].filter(Boolean).join(" ") || user.username;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName,
    lastName,
    fullName,
    phone: user.phone || null,
    avatarUrl: formatAvatarUrl(user.avatar_url),
    roleId: user.role_id,
    roleCode: role.code || null,
    roleName: role.name || null,
  };
}

async function resolveRoleId(roleIdOrCode: string): Promise<string> {
  if (!roleIdOrCode || !roleIdOrCode.trim()) {
    throw new GraphQLError("roleId es obligatorio.");
  }
  const trimmed = roleIdOrCode.trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);
  if (isUuid) {
    const role = await db.role.findUnique({ where: { id: trimmed } });
    if (role) return role.id;
  }
  const roleByCode = await db.role.findUnique({ where: { code: trimmed } });
  if (roleByCode) return roleByCode.id;
  throw new GraphQLError("El rol especificado no existe.");
}

const root = {
  ping: () => "better-auth running",

  listRoles: async () => {
    const roles = await db.role.findMany({
      orderBy: { name: "asc" }
    });
    return roles.map((r: any) => ({ id: r.id, code: r.code, name: r.name }));
  },

  listUsers: async () => {
    const users = await db.user.findMany({
      where: { deleted_at: null },
      include: { role: true },
      orderBy: { created_at: "desc" }
    });
    return users.map(mapUserToOutput);
  },

  getUser: async ({ id }: { id: string }) => {
    if (!id) return null;
    const user = await db.user.findFirst({
      where: { id, deleted_at: null },
      include: { role: true }
    });
    return mapUserToOutput(user);
  },

  createUser: async ({ input }: { input: any }) => {
    console.log("🚀 [BETTER-AUTH GRAPHQL] createUser request:", {
      username: input.username,
      email: input.email,
      roleId: input.roleId
    });

    const email = input.email?.trim();
    if (!email) {
      throw new GraphQLError("El correo electrónico es obligatorio.");
    }

    const existingEmail = await db.user.findFirst({
      where: {
        email: { equals: email, mode: "insensitive" },
        deleted_at: null
      }
    });
    if (existingEmail) {
      throw new GraphQLError("El correo electrónico ya se encuentra registrado en el sistema.");
    }

    let username = input.username?.trim();
    if (!username) {
      if (email.includes("@")) {
        username = email.split("@")[0];
      } else {
        username = `user_${randomUUID().substring(0, 8)}`;
      }
    }

    const existingUsername = await db.user.findFirst({
      where: {
        username: { equals: username, mode: "insensitive" },
        deleted_at: null
      }
    });
    if (existingUsername) {
      throw new GraphQLError("El nombre de usuario ya se encuentra registrado en el sistema.");
    }

    const roleId = await resolveRoleId(input.roleId);

    const password = input.password && input.password.trim()
      ? input.password.trim()
      : randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    const userId = input.id && input.id.trim()
      ? input.id.trim()
      : randomUUID();

    const firstName = input.firstName?.trim() || null;
    const lastName = input.lastName?.trim() || null;
    const fullName = [firstName, lastName].filter(Boolean).join(" ") || username;

    const created = await db.user.create({
      data: {
        id: userId,
        username,
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        phone: input.phone?.trim() || null,
        avatar_url: input.avatarUrl?.trim() || null,
        role_id: roleId,
        created_at: new Date(),
        updated_at: new Date()
      },
      include: { role: true }
    });

    console.log("✅ [BETTER-AUTH GRAPHQL] User created successfully:", created.id);
    return mapUserToOutput(created);
  },

  editUser: async ({ id, input }: { id: string; input: any }) => {
    console.log("🚀 [BETTER-AUTH GRAPHQL] editUser request for id:", id);

    const existing = await db.user.findUnique({
      where: { id },
      include: { role: true }
    });
    if (!existing) {
      throw new GraphQLError("Usuario no encontrado.");
    }

    const updateData: any = {
      updated_at: new Date()
    };

    if (input.email && input.email.trim()) {
      const email = input.email.trim();
      if (email.toLowerCase() !== existing.email.toLowerCase()) {
        const dup = await db.user.findFirst({
          where: {
            email: { equals: email, mode: "insensitive" },
            id: { not: id },
            deleted_at: null
          }
        });
        if (dup) {
          throw new GraphQLError("El correo electrónico ya se encuentra registrado en el sistema.");
        }
      }
      updateData.email = email;
    }

    if (input.username && input.username.trim()) {
      const username = input.username.trim();
      if (username.toLowerCase() !== existing.username.toLowerCase()) {
        const dup = await db.user.findFirst({
          where: {
            username: { equals: username, mode: "insensitive" },
            id: { not: id },
            deleted_at: null
          }
        });
        if (dup) {
          throw new GraphQLError("El nombre de usuario ya se encuentra registrado en el sistema.");
        }
      }
      updateData.username = username;
    }

    if (input.roleId && input.roleId.trim()) {
      updateData.role_id = await resolveRoleId(input.roleId);
    }

    if (input.firstName !== undefined) {
      updateData.first_name = input.firstName ? input.firstName.trim() : null;
    }
    if (input.lastName !== undefined) {
      updateData.last_name = input.lastName ? input.lastName.trim() : null;
    }
    const fn = updateData.first_name !== undefined ? updateData.first_name : existing.first_name;
    const ln = updateData.last_name !== undefined ? updateData.last_name : existing.last_name;
    updateData.full_name = [fn, ln].filter(Boolean).join(" ") || (updateData.username || existing.username);

    if (input.phone !== undefined) {
      updateData.phone = input.phone ? input.phone.trim() : null;
    }
    if (input.avatarUrl !== undefined && input.avatarUrl.trim()) {
      updateData.avatar_url = input.avatarUrl.trim();
    }
    if (input.password && input.password.trim()) {
      updateData.password_hash = await bcrypt.hash(input.password.trim(), 10);
    }

    const updated = await db.user.update({
      where: { id },
      data: updateData,
      include: { role: true }
    });

    console.log("✅ [BETTER-AUTH GRAPHQL] User updated successfully:", updated.id);
    return mapUserToOutput(updated);
  },

  deleteUser: async ({ id }: { id: string }) => {
    console.log("🚀 [BETTER-AUTH GRAPHQL] deleteUser request for id:", id);
    try {
      await db.user.delete({ where: { id } });
      console.log("✅ [BETTER-AUTH GRAPHQL] User hard-deleted from DB:", id);
      return true;
    } catch (err: any) {
      console.warn("⚠️ [BETTER-AUTH GRAPHQL] Hard delete failed, applying soft-delete:", err.message);
      try {
        await db.user.update({
          where: { id },
          data: { deleted_at: new Date() }
        });
        return true;
      } catch (softErr: any) {
        console.error("❌ [BETTER-AUTH GRAPHQL] Failed to delete user:", softErr.message);
        return false;
      }
    }
  }
};

export const graphqlRouter = express.Router();

graphqlRouter.all("/", async (req: Request, res: Response) => {
  try {
    const body = req.method === "GET" ? req.query : req.body;
    const query = body?.query;
    let variables = body?.variables;

    if (typeof variables === "string") {
      try {
        variables = JSON.parse(variables);
      } catch {
        variables = undefined;
      }
    }

    if (!query) {
      return res.status(400).json({
        errors: [{ message: "Must provide query string." }]
      });
    }

    const result = await graphql({
      schema,
      source: query,
      rootValue: root,
      variableValues: variables,
      operationName: body?.operationName
    });

    return res.json(result);
  } catch (err: any) {
    console.error("💥 [BETTER-AUTH GRAPHQL] Error executing query:", err);
    return res.status(500).json({
      errors: [{ message: err.message || "Internal server error" }]
    });
  }
});
