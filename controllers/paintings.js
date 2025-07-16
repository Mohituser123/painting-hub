const Painting = require("../models/painting");

module.exports.index = async (req, res) => {
  const allPaintings = await Painting.find({});
  console.log("🎨 All paintings:", allPaintings);
  res.render("paintings/index", { allPaintings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("paintings/new");
};

module.exports.showPainting = async (req, res) => {
  const { id } = req.params;

  const painting = await Painting.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!painting) {
    req.flash("error", "Painting you requested does not exist!");
    return res.redirect("/paintings");
  }

  const relatedPaintings = await Painting.find({
    _id: { $ne: painting._id },
    $or: [
      { genre: painting.genre },
      { medium: painting.medium }
    ]
  }).limit(4);

  res.render("paintings/show", { painting, relatedPaintings });
};

module.exports.createPainting = async (req, res, next) => {
  console.log("DEBUG FILE:", req.file);
  console.log("DEBUG BODY:", req.body);

  const { title, artist, genre, medium, price, description } = req.body.painting;

  const newPainting = new Painting({
    title,
    artist,
    genre,
    medium,
    price,
    description,
    image: {
      url: req.file.path,
      filename: req.file.filename
    },
    owner: req.user._id
  });

  await newPainting.save();
  req.flash("success", "New Painting Created!");
  res.redirect("/paintings");
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const painting = await Painting.findById(id);
  if (!painting) {
    req.flash("error", "Painting you requested does not exist!");
    return res.redirect("/paintings");
  }
  res.render("paintings/edit", { painting });
};

module.exports.updatePainting = async (req, res) => {
  const { id } = req.params;
  await Painting.findByIdAndUpdate(id, { ...req.body.painting });
  req.flash("success", "Painting updated!");
  res.redirect(`/paintings/${id}`);
};

module.exports.destroyPainting = async (req, res) => {
  const { id } = req.params;
  const deletedPainting = await Painting.findByIdAndDelete(id);
  console.log(deletedPainting);
  req.flash("success", "Painting Deleted!");
  res.redirect("/paintings");
};

