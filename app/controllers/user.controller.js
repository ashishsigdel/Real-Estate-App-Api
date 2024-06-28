import FileStorageDirectory from "../enums/fileStorageDirectory.js";
import MediaType from "../enums/mediaType.js";
import Media from "../models/media.model.js";
import User from "../models/user.model.js";
import UserProfile from "../models/userProfile.model.js";
import {
  comparePassword,
  hashPassword,
  validatePassword,
} from "../services/passwordService.js";
import { errorHandler } from "../utils/error.js";
import { createMedia, deleteMediaById } from "./media.controller.js";

export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, gender, username, dob } = req.body;

    let profilePicture = req.file;

    const user = req.user;

    //return response if none of the fields are provided
    if (!fullName && !phone && !gender && !profilePicture && !username) {
      return next(errorHandler(400, "Nothings to update."));
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
      const alreadyUsernameExist = await UserProfile.findOne({ username });

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

    let profilePictureUrl = null;
    if (updatedUserProfile.profilePictureId) {
      const media = await Media.findById(updatedUserProfile.profilePictureId);
      if (media) {
        profilePictureUrl = media.url;
      }
    }
    //append profilepicture url also inside userprofile object
    const userProfileData = updatedUserProfile.toObject();
    userProfileData.profilePicture = profilePictureUrl;

    const responseData = {
      message: "Profile updated successfully",
      userProfile: userProfileData,
    };

    await res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return next(errorHandler(400, "All field are required."));
    }

    if (newPassword !== confirmPassword) {
      return next(errorHandler(400, "Password do not match."));
    }

    const isPasswordValid = validatePassword(newPassword);
    if (!isPasswordValid) {
      return next(
        errorHandler(
          400,
          "Password Error. Minimum 6 chars, needs uppercase, lowercase, number & symbol."
        )
      );
    }

    const user = req.user;

    const validUser = await User.findOne({ _id: user._id });
    if (!validUser) return next(errorHandler(404, "User not found !"));

    const validPassword = await comparePassword(
      oldPassword,
      validUser.password
    );
    if (!validPassword)
      return next(errorHandler(401, "Password is incorrect!"));

    // check if password is same as previous password
    const isSamePassword = await comparePassword(
      newPassword,
      validUser.password
    );

    // if password is same as previous password
    if (isSamePassword) {
      return next(errorHandler(400, "Password should be different."));
    }

    // hash password
    const passwordHash = await hashPassword(newPassword);

    // update user password
    await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          password: passwordHash,
        },
      },
      { new: true }
    );

    await res.status(200).json("Password Changed successfully.");
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
      profilePictureUrl = media.url;
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

export const fetchProfile = async (req, res, next) => {
  const { username } = req.params;
  const userProfile = await UserProfile.findOne({ username }).select(
    "-createdAt -isEmailVerified -updatedAt "
  );

  if (!userProfile) {
    return res.status(404).json({ message: "User profile not found" });
  }

  let profilePictureUrl = null;

  if (userProfile.profilePictureId) {
    const media = await Media.findById(userProfile.profilePictureId);
    if (media) {
      profilePictureUrl = media.url;
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
