import { connectToDB } from "@/lib/database/database";
import Post from "@/lib/database/models/Post";
import { postSchema } from "@/lib/utils/validation";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Retrieve all posts
 *     description: Fetches all posts from the database.
 *     responses:
 *       200:
 *         description: A list of posts.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   author:
 *                     type: string
 *                     description: The author of the post.
 *                   title:
 *                     type: string
 *                     description: The title of the post.
 *                   description:
 *                     type: string
 *                     description: The content of the post.
 *                   imageUrl:
 *                     type: string
 *                     description: The URL of the post's image.
 *       500:
 *         description: Failed to fetch posts.
 */

export async function GET() {
  try {
    await connectToDB();

    // Use lean() to get plain JavaScript objects
    const posts = await Post.find();

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error("Posts Retrieval Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve posts", details: error },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     description: Creates a new post with the provided data.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               author:
 *                 type: string
 *                 description: The author of the post.
 *                 example: John Doe
 *               title:
 *                 type: string
 *                 description: The title of the post.
 *                 example: My First Post
 *               description:
 *                 type: string
 *                 description: The content of the post.
 *                 example: This is a sample post description.
 *               imageUrl:
 *                 type: string
 *                 description: The URL of the post's image.
 *                 example: https://example.com/image.jpg
 *                 format: url
 *               createdAt:
 *                 type: string
 *                 description: The date and time when the post was created.
 *                 example: 2023-01-01T00:00:00.000Z
 *                 format: date-time
 *
 *     responses:
 *       201:
 *         description: Post has been created.
 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         description: The field that caused the validation error.
 *                       message:
 *                         type: string
 *                         description: The validation error message.
 *       500:
 *         description: Failed to create Post.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsedBody = postSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          errors: parsedBody.error.issues.map((issue) => ({
            field: issue.path[0],
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { author, title, description, imageUrl } = parsedBody.data;

    await connectToDB();

    const newPost = new Post({
      title,
      description,
      imageUrl,
      author,
    });

    await newPost.save();

    return NextResponse.json("Post has been created", { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Input validation error:", error.issues);
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    } else {
      console.error("Error during Post creation:", error);
      return NextResponse.json(
        { error: "Failed to create Post" },
        { status: 500 }
      );
    }
  }
}
