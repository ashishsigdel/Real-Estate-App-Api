import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPostAttached: {
      type: Boolean,
      default: false,
    },
    postAttachedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    message: {
      type: String,
      required: true,
    },
    editAbleUntil: {
      type: Date,
      required: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
