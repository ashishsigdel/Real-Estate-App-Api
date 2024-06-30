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

    const populatedMessage = await Message.findById(newMessage._id).populate([
      {
        path: "receiverId",
        model: "User",
        select: "_id userProfileId",
        populate: {
          path: "userProfileId",
          model: "UserProfile",
          select: "fullName username email phone gender dob profilePictureId",
          populate: {
            path: "profilePictureId",
            model: "Media",
          },
        },
      },
      {
        path: "senderId",
        model: "User",
        select: "_id userProfileId",
        populate: {
          path: "userProfileId",
          model: "UserProfile",
          select: "fullName username email phone gender dob profilePictureId",
          populate: {
            path: "profilePictureId",
            model: "Media",
          },
        },
      },
    ]);

    res.status(200).json(populatedMessage);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  const user = req.user;
  const { receiverId } = req.params;

  const senderId = user._id;

  // Validate receiverId
  if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    return next(errorHandler(400, "Receiver does not exist!"));
  }

  try {
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return next(errorHandler(404, "Receiver does not exist!"));
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate({
      path: "messages",
      model: "Message",
      populate: [
        {
          path: "receiverId",
          model: "User",
          select: "_id userProfileId",
          populate: {
            path: "userProfileId",
            model: "UserProfile",
            select: "fullName username email phone gender dob profilePictureId",
            populate: {
              path: "profilePictureId",
              model: "Media",
            },
          },
        },
        {
          path: "senderId",
          model: "User",
          select: "_id userProfileId",
          populate: {
            path: "userProfileId",
            model: "UserProfile",
            select: "fullName username email phone gender dob profilePictureId",
            populate: {
              path: "profilePictureId",
              model: "Media",
            },
          },
        },
      ],
    });

    if (!conversation) {
      return res.status(200).json([]);
    }

    const messages = conversation.messages;

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

export const updateMessage = async (req, res, next) => {
  const user = req.user;
  const { messageId } = req.params;
  const { message } = req.body;

  if (!message) {
    return next(errorHandler(400, "Nothing to update."));
  }

  // Validate messageId
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    return next(errorHandler(400, "Message does not exist!"));
  }

  try {
    const messageToUpdate = await Message.findById(messageId);

    if (!messageToUpdate) {
      return next(errorHandler(400, "Message does not exist!"));
    }

    if (!messageToUpdate.senderId.equals(user._id)) {
      return next(
        errorHandler(403, "You are not authorized to update this message.")
      );
    }

    if (messageToUpdate.isEdited) {
      return next(errorHandler(400, "This message has already been edited."));
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    if (messageToUpdate.editAbleUntil < fiveMinutesAgo) {
      return next(errorHandler(429, "Message cannot be edited now."));
    }

    // Update the message
    messageToUpdate.message = message;
    messageToUpdate.isEdited = true;
    await messageToUpdate.save();

    res.status(200).json(messageToUpdate);
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  const user = req.user;
  const { messageId } = req.params;

  // Validate messageId
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    return next(errorHandler(400, "Message does not exist!"));
  }

  try {
    const messageToDelete = await Message.findById(messageId);

    if (!messageToDelete) {
      return next(errorHandler(400, "Message does not exist!"));
    }

    if (!messageToDelete.senderId.equals(user._id)) {
      return next(
        errorHandler(403, "You are not authorized to delete this message.")
      );
    }

    if (messageToDelete.isDeleted) {
      return next(errorHandler(400, "This message has already been deleted."));
    }

    // Update the message
    messageToDelete.message = "This message has been deleted.";
    messageToDelete.isDeleted = true;
    await messageToDelete.save();

    res.status(200).json(messageToDelete);
  } catch (error) {
    next(error);
  }
};
