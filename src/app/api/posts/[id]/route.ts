import { connectToDB } from "@/lib/database/database";
import Post from "@/lib/database/models/Post";
import { postSchema } from "@/lib/utils/validation";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Retrieve a post by ID
 *     description: Fetches a single post from the database using its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to retrieve.
 *     responses:
 *       200:
 *         description: Successfully retrieved the post.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 author:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *                   format: url
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid ID format.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Internal server error.
 */

type Params = Promise<{ id: string }>;
export async function GET(req: Request, { params }: { params: Params }) {
  const { id } = await params;
  try {
    await connectToDB();

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json("Post not found", { status: 404 });
    }

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a post by ID
 *     description: Updates a post in the database using its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               author:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *                 format: url
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Successfully updated the post.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input or ID format.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Internal server error.
 */

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;

  // Validate if the ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  try {
    // Parse body once
    const body = await req.json();
    const parseResult = postSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors },
        { status: 400 }
      );
    }

    await connectToDB();

    // Use the validated data from parseResult.data
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      parseResult.data,
      { new: true } // This returns the updated document
    );

    if (!updatedPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Post updated successfully", post: updatedPost },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     description: Removes a post from the database using its unique ID

 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to delete
 *     responses:
 *       200:
 *         description: Post successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post deleted successfully"
 *                 deletedPost:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     author:
 *                       type: string
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Post not found"
 *       400:
 *         description: Invalid ID format
 *       500:
 *         description: Internal server error
 */

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    await connectToDB();

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Post deleted successfully",
        deletedPost,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
