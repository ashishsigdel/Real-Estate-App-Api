import Country from "../models/country.model.js";
import { errorHandler } from "../utils/error.js";

export const createCountry = async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    return next(errorHandler(400, "Country name is required."));
  }

  try {
    const alreadyCountryExists = await Country.findOne({ name });
    if (alreadyCountryExists) {
      return next(errorHandler(400, "Country Already Exists."));
    }

    const newCountry = await Country.create({
      name: name,
    });

    res
      .status(201)
      .json({ newCountry, message: "Country Created Successfully." });
  } catch (error) {
    next(error);
  }
};

export const allCountry = async (req, res, next) => {
  try {
    const countries = await Country.find();

    res.status(200).json({ data: countries });
  } catch (error) {
    next(error);
  }
};

export const getCountry = async (req, res, next) => {
  const { id } = req.params;
  try {
    const country = await Country.findById(id);

    if (!country) return next(errorHandler(404, "Country not found!"));

    res.status(201).json(country);
  } catch (error) {
    next(error);
  }
};

export const updateCountry = async (req, res, next) => {
  const { id } = req.params;
  try {
    const country = await Country.findById(id);
    if (!country) return next(errorHandler(404, "Country not found!"));

    const updateCountry = await Country.findByIdAndUpdate(
      id,
      {
        $set: {
          name: req.body.name,
        },
      },
      {
        new: true,
      }
    );
    res
      .status(201)
      .json({ updateCountry, message: "Country updated successfully." });
  } catch (error) {
    next(error);
  }
};

export const deleteCountry = async (req, res, next) => {
  const { id } = req.params;
  try {
    const country = await Country.findById(id);
    if (!country) return next(errorHandler(404, "Country not found!"));

    await Country.findByIdAndDelete({ _id: id });
    res.status(201).json("Country deleted successfully!");
  } catch (error) {
    next(error);
  }
};
