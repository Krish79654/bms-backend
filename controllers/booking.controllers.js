const Booking = require("../models/booking.models.js");
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");
const asyncHandler = require("../utils/asyncHandler.js");
const Hall = require("../models/hall.models.js");
const Menu = require("../models/menu.models.js");
const constants = require("../constants.js");
const ExtraService = require("../models/extraService.models.js");
const axios = require("axios");

exports.addBooking = asyncHandler(async (req, res) => {
  const { hall, menu, eventDate, shift, guests, eventType, extraServices } =
    req.body;
  const user = req.user;
  if (
    [hall, menu, eventDate, shift, guests, eventType].some(
      (field) => !field || field?.trim() === ""
    )
  )
    throw new ApiError(400, "All fields are required");

  if (new Date(eventDate) < new Date())
    throw new ApiError(400, "Event date must be in the future");

  if (guests < 1) throw new ApiError(400, "Guests must be at least 1");
  if (guests % 1 !== 0)
    throw new ApiError(400, "Number of guests should be an integer");

  const hallExist = await Hall.findById(hall);
  if (!hallExist) throw new ApiError(404, "Hall not found");

  const menuExist = await Menu.findById(menu);
  if (!menuExist) throw new ApiError(404, "Menu not found");

  const alreadyBooked = await Booking.findOne({
    hall,
    eventDate,
    shift,
  });
  if (alreadyBooked)
    throw new ApiError(400, "Hall already booked for this date and shift");

  if (hallExist.capacity < guests)
    throw new ApiError(400, "Hall capacity is less than guests");

  if (!constants.SHIFTS.includes(shift))
    throw new ApiError(400, "Invalid shift");

  let totalCharge = menuExist.price * guests;

  if (Array.isArray(extraServices)) {
    for (const service of extraServices) {
      const serviceExist = await ExtraService.findById(service);
      if (!serviceExist) throw new ApiError(404, "No such extra service found");
      totalCharge += serviceExist.price;
    }
  }

  const advanceAmount = totalCharge * (50 / 100);

  // Initiate payment
  const khaltiResponse = await axios.post(
    "https://a.khalti.com/api/v2/epayment/initiate/",
    {
      return_url: "http://localhost:5173/bookings/",
      website_url: "http://localhost:5173/",
      amount: advanceAmount * 100,
      purchase_order_id: Date.now() + user._id + advanceAmount,
      purchase_order_name: "Taudaha Banquet and Restaurant Booking",
      customer_info: {
        name: user.fullName,
        email: user.email,
        phone: user.phone,
      },
    },
    {
      headers: {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      },
    }
  );

  if (khaltiResponse.status !== 200) {
    throw new ApiError(500, "Khalti API error");
  }

  const booking = await Booking.create({
    user: req.user,
    hall: hallExist,
    menu: menuExist,
    eventDate,
    shift,
    guests,
    eventType,
    totalCharge,
    extraServices,
    advanceAmount,
    pidx: khaltiResponse.data.pidx,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { booking, payment_url: khaltiResponse.data.payment_url },
        "Booked successfully"
      )
    );
});

exports.checkAvailability = asyncHandler(async (req, res) => {
  const { eventDate, guests, shift } = req.query;
  if (
    [eventDate, guests, shift].some((field) => !field || field?.trim() === "")
  )
    throw new ApiError(400, "All fields are required");

  if (new Date(eventDate) < new Date()) {
    throw new ApiError(400, "Event date must be in the future");
  }
  if (guests < 1) throw new ApiError(400, "Guests must be at least 1");
  if (!constants.SHIFTS.includes(shift))
    throw new ApiError(400, "Invalid shift");

  const availableHalls = await Hall.find({
    capacity: { $gte: guests },
  });
  for (const hall of availableHalls) {
    const alreadyBooked = await Booking.findOne({
      hall: hall._id,
      eventDate,
      shift,
    });
    if (alreadyBooked) availableHalls.splice(availableHalls.indexOf(hall), 1);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, availableHalls, "Available halls"));
});

exports.getBookings = asyncHandler(async (req, res) => {
  let bookings;
  if (req.user.isAdmin) {
    bookings = await Booking.find()
      .populate("user")
      .populate("hall")
      .populate("menu")
      .populate("extraServices");
  } else {
    bookings = await Booking.find({ user: req.user });
    // Verify payment status
    await Promise.all(
      bookings.map(async (booking) => {
        if (!booking.advancePaid) {
          await axios
            .post(
              `https://a.khalti.com/api/v2/epayment/lookup/`,
              {
                pidx: booking.pidx,
              },
              {
                headers: {
                  Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
                },
              }
            )
            .then(async (response) => {
              if (response.data.status === "Completed") {
                await Booking.findByIdAndUpdate(booking._id, {
                  advancePaid: true,
                });
              }
            })
            .catch((error) => {
              console.log(error);
            });
        }
      })
    );
    bookings = await Booking.find({ user: req.user })
      .populate("hall")
      .populate("menu")
      .populate("extraServices");
  }

  return res.status(200).json(new ApiResponse(200, bookings));
});

exports.cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.user.toString() !== req.user._id.toString())
    throw new ApiError(403, "You are not authorized");

  if (booking.paid)
    throw new ApiError(400, "Payment already made, cannot cancel");

  await Booking.findByIdAndDelete(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Booking cancelled successfully"));
});

exports.updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.user.toString() !== req.user._id.toString())
    throw new ApiError(403, "You are not authorized");

  if (booking.paid)
    throw new ApiError(400, "Payment already made, cannot update");

  const { hall, menu, eventDate, shift, guests, eventType, extraServices } =
    req.body;
  if (
    [hall, menu, eventDate, shift, guests, eventType].some(
      (field) => !field || field?.trim() === ""
    )
  )
    throw new ApiError(400, "All fields are required");

  if (new Date(eventDate) < new Date())
    throw new ApiError(400, "Event date must be in the future");

  const hallExist = await Hall.findById(hall);
  if (!hallExist) throw new ApiError(404, "Hall not found");

  const menuExist = await Menu.findById(menu);
  if (!menuExist) throw new ApiError(404, "Menu not found");

  const alreadyBooked = await Booking.findOne({
    hall,
    eventDate,
    shift,
  });
  if (alreadyBooked && alreadyBooked._id.toString() !== req.params.id)
    throw new ApiError(400, "Hall already booked for this date and shift");

  if (hallExist.capacity < guests)
    throw new ApiError(400, "Hall capacity is less than guests");

  if (!constants.SHIFTS.includes(shift))
    throw new ApiError(400, "Invalid shift");

  const totalCharge = menuExist.price * guests;

  if (Array.isArray(extraServices)) {
    for (const service of extraServices) {
      const serviceExist = await ExtraService.findById(service);
      if (!serviceExist) throw new ApiError(404, "No such extra service found");
      totalCharge += serviceExist.price;
    }
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    req.params.id,
    {
      hall: hallExist,
      menu: menuExist,
      eventDate,
      shift,
      guests,
      eventType,
      totalCharge,
      extraServices,
    },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, updatedBooking, "Booking updated successfully"));
});
