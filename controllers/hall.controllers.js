const Hall = require("../models/hall.models.js");
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");
const asyncHandler = require("../utils/asyncHandler.js");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary.js");

exports.addHall = asyncHandler(async (req, res) => {
  const { name, capacity } = req.body;
  const images = req.files.map((file) => file.path) || [];
  console.log(images);

  if ([name, capacity].some((field) => !field || field?.trim() === ""))
    throw new ApiError(400, "Fill all required fields");
  if (capacity < 1) throw new ApiError(400, "Capacity must be greater than 0");

  if (images.length > 6)
    throw new ApiError(400, "Maximum 6 images allowed for a hall");

  // Already exists
  const alreadyExist = await Hall.findOne({ name });
  if (alreadyExist) throw new ApiError(400, "Hall already exists");

  // Upload images to cloudinary
  const cloudinaryUrls = await Promise.all(
    images.map(async (localPath) => {
      const cloudinaryRes = await uploadToCloudinary(localPath);
      if (!cloudinaryRes)
        throw new ApiError(500, "Failed to upload file to cloudinary");
      const { url, public_id } = cloudinaryRes;

      return { url, public_id };
    })
  );

  const newHall = await Hall.create({
    name,
    capacity,
    images: cloudinaryUrls,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, newHall, "Hall added successfully"));
});

exports.deleteHall = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedHall = await Hall.findByIdAndDelete(id);
  if (!deletedHall) throw new ApiError(404, "Hall not found");

  // Delete images from cloudinary
  await Promise.all(
    deletedHall.images?.map(
      async (image) => await deleteFromCloudinary(image.public_id)
    )
  );

  return res
    .status(200)
    .json(new ApiResponse(200, deletedHall, "Hall deleted successfully"));
});

exports.updateHall = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, capacity } = req.body;
  const images = req.files?.map((file) => file.path) || [];

  const hall = await Hall.findById(id);
  if (!hall) throw new ApiError(404, "Hall not found");

  if ([name, capacity].some((field) => !field || field?.trim() === ""))
    throw new ApiError(400, "Fill all required fields");

  if (capacity < 1) throw new ApiError(400, "Capacity must be greater than 0");

  if (hall.images.length + images.length > 6)
    throw new ApiError(400, "Maximum 6 images allowed for a hall");

  // Upload images to cloudinary
  const cloudinaryUrls = await Promise.all(
    images.map(async (localPath) => {
      const { url, public_id } = await uploadToCloudinary(localPath);
      return { url, public_id };
    })
  );

  const updatedHall = await Hall.findByIdAndUpdate(
    id,
    {
      name,
      capacity,
      images: cloudinaryUrls.concat(hall.images),
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedHall, "Hall updated successfully"));
});

exports.getAllHalls = asyncHandler(async (req, res, next) => {
  const halls = await Hall.find();
  return res.status(200).json(new ApiResponse(200, halls, "All halls"));
});

exports.getHallById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const hall = await Hall.findById(id);
  if (!hall) throw new ApiError(404, "Hall not found");

  return res.status(200).json(new ApiResponse(200, hall, "Hall"));
});

exports.removeImage = asyncHandler(async (req, res) => {
  const { id, imageId } = req.params;

  const hall = await Hall.findById(id);
  if (!hall) throw new ApiError(404, "Hall not found");

  const image = hall.images.id(imageId);
  if (!image) throw new ApiError(404, "Image not found");

  // Delete image from cloudinary
  await deleteFromCloudinary(image.public_id);

  hall.images.pull(imageId);
  await hall.save();

  return res
    .status(200)
    .json(new ApiResponse(200, hall, "Image removed successfully"));
});
