import { Schema, model, models } from "mongoose";

const PostSchema = new Schema(
  {
    author: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "Post",
  }
);

const Post = models.Post || model("Post", PostSchema);
export default Post;
