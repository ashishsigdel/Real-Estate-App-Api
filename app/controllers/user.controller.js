import FileStorageDirectory from "../enums/fileStorageDirectory.js";
import MediaType from "../enums/mediaType.js";
import Media from "../models/media.model.js";
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

  if (!userProfile) {
    return res.status(404).json({ message: "User profile not found" });
  }

  let profilePictureUrl = null;

  if (userProfile.profilePictureId) {
    const media = await Media.findById(userProfile.profilePictureId);
    if (media) {
      profilePictureUrl = media.url; // `url` is a virtual property
    }
  }

  //append profilepicture url also inside userprofile object
  const userProfileData = userProfile.toObject();
  userProfileData.profilePicture = profilePictureUrl;

  try {
    let responseData = {
      user: userProfileData,
      message: "User profile fetched successfully",
    };

    res.status(201).json(responseData);
  } catch (error) {
    next(error);
  }
};
