const Painting = require("../models/painting");
const { cloudinary } = require("../cloudConfig");

module.exports.index = async (req, res) => {
  const allPaintings = await Painting.find({}).populate("owner");
  console.log("🎨 All paintings:", allPaintings);
  res.render("paintings/index", { allPaintings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("paintings/new");
};

module.exports.createPainting = async (req, res, next) => {
  try {
    console.log("🧠 Current User:", req.user);

    const painting = new Painting(req.body.painting);

    // ✅ Image handling (Cloudinary)
    if (req.file && req.file.path && req.file.filename) {
      painting.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    } else {
      req.flash("error", "Image upload failed.");
      return res.redirect("/paintings/new");
    }

    // ✅ Owner assignment (check login)
    if (req.user && req.user._id) {
      painting.owner = req.user._id;
    } else {
      req.flash("error", "You must be logged in.");
      return res.redirect("/login");
    }

    await painting.save();
    req.flash("success", "Successfully added a new painting!");
    res.redirect("/paintings");
  } catch (err) {
    console.error("❌ Error in createPainting:", err);
    next(err);
  }
};

module.exports.showPainting = async (req, res) => {
  const { id } = req.params;
  const painting = await Painting.findById(id)
    .populate("owner")
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    });

  if (!painting) {
    req.flash("error", "Cannot find that painting.");
    return res.redirect("/paintings");
  }

   // ✅ Add this block to fetch related paintings
    const relatedPaintings = await Painting.find({
        _id: { $ne: painting._id }, // exclude current
        category: painting.category // or use painting.title.split(" ")[0] for loose match
    }).limit(4);

    res.render("paintings/show", { painting, relatedPaintings }); // ✅ Make sure to pass it here
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const painting = await Painting.findById(id);
  if (!painting) {
    req.flash("error", "Cannot find that painting.");
    return res.redirect("/paintings");
  }
  res.render("paintings/edit", { painting });
};

module.exports.updatePainting = async (req, res) => {
  const { id } = req.params;
  const painting = await Painting.findByIdAndUpdate(id, { ...req.body.painting });

  if (req.file) {
    painting.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
    await painting.save();
  }

  req.flash("success", "Successfully updated painting!");
  res.redirect(`/paintings/${painting._id}`);
};

module.exports.destroyPainting = async (req, res) => {
  const { id } = req.params;
  const painting = await Painting.findById(id);

  if (painting.image && painting.image.filename) {
    await cloudinary.uploader.destroy(painting.image.filename);
  }

  await Painting.findByIdAndDelete(id);
  req.flash("success", "Painting deleted successfully.");
  res.redirect("/paintings");
};
