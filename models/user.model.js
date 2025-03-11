import mongoose from "mongoose";
import crypto from "crypto";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            maxlength: 30,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            maxlength: 20,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        credentials: {
            clientId: {
                type: String,
                // required: true,
                index: true,
                unique: true,
            },
            clientSecret: {
                type: String,
                // required: true,
                unique: true,
            },
        },
        projects: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Project",
            },
        ],
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    try {
        if (this.isModified("password")) {
            this.password = await bcrypt.hash(this.password, 10);
        }

        if (!this.credentials.clientId) {
            this.credentials.clientId = nanoid(12);
        }

        if (!this.credentials.clientSecret) {
            const uniqueSecret = crypto.randomBytes(32).toString("hex");
            this._unhashedSecret = uniqueSecret;
            this.credentials.clientSecret = await bcrypt.hash(uniqueSecret, 10);
        }

        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods = {
    comparePassword: async function (password) {
        return await bcrypt.compare(password, this.password);
    },
    compareClientSecret: async function (secret) {
        return await bcrypt.compare(secret, this.credentials.clientSecret);
    },
    regenerateClientSecret: async function () {
        try {
            const uniqueSecret = crypto.randomBytes(16).toString("hex");
            this.credentials.clientSecret = await bcrypt.hash(uniqueSecret, 10);
            await this.save();

            return uniqueSecret;
        } catch (error) {
            throw new Error("Error while regenerating client secret.");
        }
    },
};

const User = mongoose.model("User", userSchema);
export default User;
