const mongoose = require("mongoose");
const slugger = require("slugger");
const Schema = mongoose.Schema;

const articleSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    likes: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    slug: { type: String, unique: true },
  },
  { timestamps: true }
);

articleSchema.pre("save", function (next) {
  if (this.title && this.isModified("title")) {
    this.slug = slugger(this.title);
    next();
  } else {
    next();
  }
});

articleSchema.pre("findOneAndUpdate", function (next) {
  console.log("Before Upadet", this._update);
  this._update.$set.slug = slugger(this._update.title);
  next();
});

module.exports = mongoose.model("Article", articleSchema);
