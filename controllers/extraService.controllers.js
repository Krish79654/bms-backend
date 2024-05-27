const ExtraService = require("../models/extraService.models.js");
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");
const asyncHandler = require("../utils/asyncHandler.js");

exports.addExtraService = asyncHandler(async (req, res) => {
  const { name, price } = req.body;
  if ([name, price].some((field) => !field || field?.trim() === ""))
    throw new ApiError(400, "All fields are required");

  const serviceExist = await ExtraService.findOne({ name });
  if (serviceExist) throw new ApiError(400, "Service already exists");

  const service = await ExtraService.create({ name, price });
  return res
    .status(201)
    .json(new ApiResponse(201, service, "Service added successfully"));
});

exports.updateExtraService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  if ([name, price].some((field) => !field || String(field)?.trim() === ""))
    throw new ApiError(400, "All fields are required");

  const service = await ExtraService.findByIdAndUpdate(
    id,
    { name, price },
    { new: true }
  );
  if (!service) throw new ApiError(404, "Service not found");

  return res
    .status(200)
    .json(new ApiResponse(200, service, "Service updated successfully"));
});

exports.getAllExtraServices = asyncHandler(async (req, res) => {
  const services = await ExtraService.find();
  return res.status(200).json(new ApiResponse(200, services, "All services"));
});

exports.deleteExtraService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const service = await ExtraService.findByIdAndDelete(id);
  if (!service) throw new ApiError(404, "Service not found");

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Service deleted successfully"));
});

exports.getExtraService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const service = await ExtraService.findById(id);
  if (!service) throw new ApiError(404, "Service not found");

  return res.status(200).json(new ApiResponse(200, service, "Service found"));
});
