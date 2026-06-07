const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "teacher", "student"], required: true },
    name: { type: String, required: true, trim: true },
    avatar: { type: String, default: "" },
    studentId: { type: String, default: null },
    teacherId: { type: String, default: null },
    disabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

function isBcryptHash(str) {
  return typeof str === "string" && /^\$2[aby]\$/.test(str);
}

userSchema.methods.comparePassword = async function comparePassword(plain) {
  if (!this.password) return false;
  if (!isBcryptHash(this.password)) {
    return plain === this.password;
  }
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.upgradePasswordHash = async function upgradePasswordHash(plain) {
  if (!isBcryptHash(this.password)) {
    this.password = plain;
    await this.save();
  }
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    email: this.email,
    role: this.role,
    name: this.name,
    avatar: this.avatar,
    studentId: this.studentId,
    teacherId: this.teacherId,
    disabled: this.disabled,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
