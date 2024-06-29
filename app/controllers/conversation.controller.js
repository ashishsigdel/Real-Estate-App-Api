import Conversation from "../models/conversation.model.js";

export const fetchConversation = async (req, res, next) => {
  const user = req.user;
  try {
    const conversations = await Conversation.find({
      participants: user._id,
    }).populate({
      path: "participants",
      model: "User",
      select: "_id email userProfileId",
      populate: {
        path: "userProfileId",
        model: "UserProfile",
        select: "fullName username email phone gender dob profilePictureId",
        populate: {
          path: "profilePictureId",
          model: "Media",
        },
      },
    });

    // Filter out the requested user from participants
    const filteredConversations = conversations.map((conversation) => {
      const otherParticipant = conversation.participants.find(
        (participant) => participant._id.toString() !== user._id.toString()
      );
      return {
        ...conversation._doc, // Ensure you get the document object
        participants: otherParticipant,
      };
    });

    res.status(200).json({
      message: "Conversations fetched successfully.",
      conversations: filteredConversations,
    });
  } catch (error) {
    next(error);
  }
};
