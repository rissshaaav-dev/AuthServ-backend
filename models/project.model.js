import mongoose from "mongoose";
import crypto from "crypto";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

const projectSchema = new mongoose.Schema({
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    projectCredentials: {
        projectId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        projectSecret: {
            type: String,
            required: true,
        },
    },
    projectDetails: {
        projectName: {
            type: String,
            required: true,
        },
        projectDescription: {
            type: String,
            required: true,
        },
        projectLogo: {
            type: String,
            required: true,
        },
    },
    settings: {
        roles: [
            {
                roleName: {
                    type: String,
                    required: true,
                },
                permissions: {
                    type: [String],
                    required: true,
                },
            },
        ],
        authMethods: {
            emailLogin: { type: Boolean, default: false, required: true },
            usernameLogin: { type: Boolean, default: true, required: true },
        },
        socialLogin: {
            google: { type: Boolean, default: false, required: true },
            github: { type: Boolean, default: false, required: true },
        },
        passwordPolicy: {
            minLength: { type: Number, default: 8, required: true },
            requireNumbers: { type: Boolean, default: false, required: true },
            requireSpecialCharacters: {
                type: Boolean,
                default: false,
                required: true,
            },
            requireUppercase: { type: Boolean, default: false, required: true },
        },
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        required: true,
        default: "active",
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false,
    },
});

projectSchema.pre("save", async function (next) {
    try {
        if (!this.isNew) {
            return next();
        }

        if (!this.projectCredentials.projectId) {
            this.projectCredentials.projectId = `${this.creatorId}prj${nanoid(
                8
            )}`;
        }

        if (!this.projectCredentials.projectSecret) {
            const uniqueSecret = crypto.randomBytes(16).toString("hex");
            // this._unhashedSecret = uniqueSecret;
            this.projectCredentials.projectSecret = await bcrypt.hash(
                uniqueSecret,
                10
            );
        }

        next();
    } catch (error) {
        next(error);
    }
});

projectSchema.methods = {
    authenticateProject: async function (projectSecret) {
        return await bcrypt.compare(
            projectSecret,
            this.projectCredentials.projectSecret
        );
    },
    regenerateProjectSecret: async function () {
        try {
            const uniqueSecret = crypto.randomBytes(16).toString("hex");
            this.projectCredentials.projectSecret = await bcrypt.hash(
                uniqueSecret,
                10
            );
            await this.save();
            return uniqueSecret;
        } catch (error) {
            throw new Error(error);
        }
    },
};

const Project = mongoose.model("Project", projectSchema);
export default Project;
