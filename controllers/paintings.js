const Painting = require("../models/painting");

module.exports.index = async (req, res) => {
  const allPaintings = await Painting.find({});
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
    $or: [{ genre: painting.genre }, { medium: painting.medium }],
  }).limit(4);

  res.render("paintings/show", { painting, relatedPaintings });
};

module.exports.createPainting = async (req, res, next) => {
  if (!req.file) {
    req.flash("error", "Image upload failed!");
    return res.redirect("/paintings/new");
  }

  const { path: url, filename } = req.file;
  const newPainting = new Painting(req.body.painting);
  newPainting.owner = req.user._id;
  newPainting.image = { url, filename };

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
  let { id } = req.params;
  await Painting.findByIdAndUpdate(id, { ...req.body.painting });
  req.flash("success", "Painting updated!");
  res.redirect(`/paintings/${id}`);
};

module.exports.destroyPainting = async (req, res) => {
  let { id } = req.params;
  let deletedPainting = await Painting.findByIdAndDelete(id);
  console.log(deletedPainting);
  req.flash("success", "Painting Deleted!");
  res.redirect("/paintings");
};
