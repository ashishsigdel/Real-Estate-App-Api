import FileStorageDirectory from "../enums/fileStorageDirectory.js";
import MediaType from "../enums/mediaType.js";
import User from "../models/user.model.js";
import UserProfile from "../models/userProfile.model.js";
import { errorHandler } from "../utils/error.js";
import { createMedia, deleteMediaById } from "./media.controller.js";

export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, gender, username, dob } = req.body;

    let profilePicture = req.file;

    const user = req.user;

    //return response if none of the fields are provided
    if (!fullName && !phone && !gender && !profilePicture && !username) {
      return next(errorHandler(200, "Nothings to update."));
    }

    // get user profile
    const userProfile = await UserProfile.findOne({
      userId: user._id,
    });

    if (profilePicture) {
      if (userProfile.profilePictureId) {
        //delete old profile picture
        await deleteMediaById(userProfile.profilePictureId);
      }

      const media = await createMedia({
        directory: FileStorageDirectory.USER_IMAGES,
        file: profilePicture,
        user,
        mediaType: MediaType.IMAGE,
      });

      profilePicture = media._id;
    }

    const updatedFields = {
      fullName,
      phone,
      gender,
      dob,
      profilePictureId: profilePicture,
    };

    if (username) {
      const alreadyUsernameExist = await User.findOne({ username });

      if (alreadyUsernameExist) {
        return next(errorHandler(400, "Username doesnot avaiable!"));
      }

      await UserProfile.findOneAndUpdate(
        { userId: user._id },
        { $set: { username } },
        { new: true }
      );
    }

    const updatedUserProfile = await UserProfile.findOneAndUpdate(
      { userId: user._id },
      { $set: updatedFields },
      { new: true }
    );

    const responseData = {
      message: "Profile updated successfully",
      userProfile: updatedUserProfile,
    };

    await res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

export const fetchCurrentUser = async (req, res, next) => {
  const user = req.user;

  const userProfile = await UserProfile.findOne({ userId: user._id });

  try {
    let responseData = {
      user: userProfile,
      message: "User profile fetched successfully",
    };

    res.status(201).json(responseData);
  } catch (error) {
    next(error);
  }
};
