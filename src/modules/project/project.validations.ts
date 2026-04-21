import { ProjectRole } from "@/generated/prisma/enums";
import {ProjectPermission} from "@/generated/prisma/client";
import {z} from "zod";
export const updateProjectSchema = z.object({
    name: z.string().min(1, "Name is required"),
});

export const addProjectMemberSchema = z.object({
    userId: z.uuidv4("Invalid user ID"),
    projectRole: z.enum(ProjectRole,{ message: "Invalid project role" }),
    projectPermissions: z.array(z.any()).transform((val) => val as ProjectPermission[]),
}) 
export const updateProjectMemberParamSchema = z.object({
    userId: z.uuidv4("Invalid user ID"),
})
export const updateProjectMemberSchema = z.object({
    userId: z.uuidv4("Invalid user ID"),
    projectRole: z.enum(ProjectRole,{ message: "Invalid project role" }),
    projectPermissions: z.array(z.any()).transform((val) => val as ProjectPermission[]),
})

export const removeProjectMemberParamSchema = z.object({
    userId: z.uuidv4("Invalid user ID"),
})