const Campground = require('../models/Campground')

// @desc    Create a new site for campground
// @route   /api/campgrounds/:cgid/sites
// @access  Admin
exports.createCampgroundSite = async (req, res, next) => {
  try {
    // Check if there is a valid campground
    const campground = await Campground.findById(req.params.cgid)
    if (!campground) {
      return res
        .status(400)
        .json({ sucess: false, message: 'Cannot find this campground' })
    }

    // Check if new site's data is valid
    const newSite = req.body
    let isOk = true

    let countKey = 0
    let validKey = ['zone', 'number', 'size']
    for (key in newSite) {
      countKey++
      if (validKey.includes[key]) {
        isOk = false
        break
      }
    }
    if (countKey !== 3) {
      isOk = false
    }
    if (!isOk) {
      return res
        .status(400)
        .json({ sucess: false, message: "The new site's data is not valid" })
    }

    campground.sites.forEach((element) => {
      if (element.zone === newSite.zone && element.number === newSite.number) {
        isOk = false
      }
    })
    if (!isOk) {
      return res
        .status(400)
        .json({ sucess: false, message: "The new site's data is duplicated" })
    }

    // Add new site to a campground
    const updatedCampground = await Campground.findByIdAndUpdate(
      req.params.cgid,
      { $push: { sites: req.body } },
      { runValidators: true }
    )
    if (!updatedCampground) {
      return res
        .status(400)
        .json({ sucess: false, message: 'Cannot add the new site' })
    }

    // Send response
    res.status(201).json({ sucess: true, data: updatedCampground })
  } catch (err) {
    res.status(400).json({ sucess: false })
  }
}

// @desc    Get a campground site in specific campground
// @route   /api/campgrounds/:cgid/sites/:sid
// @access  Public
exports.getCampgroundSite = async (req, res, next) => {
  try {
    // Find a campground
    let campground = await Campground.findById(req.params.cgid)
    if (!campground) {
      return res
        .status(400)
        .json({ success: false, message: 'Cannot find this campground' })
    }

    // Find a site in a campground & Delete unmatch sites
    campground.sites = campground.sites.filter(
      (element) => element.id === req.params.sid
    )
    if (campground.sites.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Cannot find this site' })
    }

    // Send response
    res.status(200).json({ sucess: true, data: campground })
  } catch (err) {
    res.status(400).json({ success: false })
  }
}