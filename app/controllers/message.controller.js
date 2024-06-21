import mongoose from "mongoose";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

export const sendMessage = async (req, res, next) => {
  const user = req.user;
  const { receiverId } = req.params;
  const { message, postId } = req.body;

  if (!message) {
    return next(errorHandler(400, "Message is required"));
  }

  const senderId = user._id;

  // Validate receiverId
  if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    return next(errorHandler(400, "Receiver does not exist!"));
  }

  // Validate postId
  if (postId) {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return next(errorHandler(400, "Post does not exist!"));
    }
  }

  try {
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return next(errorHandler(404, "Receiver does not exist!"));
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      editAbleUntil: postId ? new Date() : new Date(Date.now() + 5 * 60 * 1000),
      isPostAttached: !!postId,
      postAttachedId: postId || null,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    //socket io here later

    // await conversation.save();
    // await newMessage.save();

    // this will run in parallel
    await Promise.all([conversation.save(), newMessage.save()]);

    conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    res.status(200).json({ newMessage, message: "message sent", conversation });
  } catch (error) {
    next(error);
  }
};
