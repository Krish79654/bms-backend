const Menu = require("../models/menu.models.js");
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");
const asyncHandler = require("../utils/asyncHandler.js");

exports.addMenu = asyncHandler(async (req, res) => {
  const { name, description, price } = req.body;
  if (!name || !description || !price)
    throw new ApiError(400, "All fields are required");

  if (price < 0) throw new ApiError(400, "Price cannot be negative");

  const alreadyExist = await Menu.findOne({ name });
  if (alreadyExist) throw new ApiError(400, "Menu already exists");

  const menu = await Menu.create({ name, description, price });
  return res
    .status(201)
    .json(new ApiResponse(201, menu, "Menu added successfully"));
});

exports.deleteMenu = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedMenu = await Menu.findByIdAndDelete(id);
  if (!deletedMenu) throw new ApiError(404, "Menu not found");

  return res
    .status(200)
    .json(new ApiResponse(200, deletedMenu, "Menu deleted successfully"));
});

exports.getMenus = asyncHandler(async (req, res) => {
  const menus = await Menu.find();
  return res.status(200).json(new ApiResponse(200, menus));
});

exports.updateMenu = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;
  if (!name || !description || !price)
    throw new ApiError(400, "All fields are required");

  if (price < 0) throw new ApiError(400, "Price cannot be negative");

  const menu = await Menu.findByIdAndUpdate(
    id,
    { name, description, price },
    { new: true }
  );
  if (!menu) throw new ApiError(404, "Menu not found");

  return res
    .status(200)
    .json(new ApiResponse(200, menu, "Menu updated successfully"));
});

exports.getMenu = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const menu = await Menu.findById(id);
  if (!menu) throw new ApiError(404, "Menu not found");

  return res.status(200).json(new ApiResponse(200, menu));
});
