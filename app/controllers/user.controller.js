export const updateProfile = async (req, res, next) => {
  try {
    console.log(req.user);
    let profilePicture = req.file;
    console.log(profilePicture);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
