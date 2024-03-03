const Campground = require('../models/Campground')

// @desc : Get all campgrounds (with filter, sort, select and pagination)
// @route : GET /api/campgrounds
// @access : Public
exports.getCampgrounds = async (req, res, next) => {
  try {
    let query

    // Copy req.query
    const reqQuery = { ...req.query }

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit']

    // Loop over to remove fields and delete from reqQuery
    removeFields.forEach((param) => delete reqQuery[param])

    let queryStr = JSON.stringify(reqQuery)

    // Create operator $gt $gte
    queryStr = queryStr.replace(
      /\b(gt|get|lt|lte|in)\b/g,
      (match) => `$${match}`
    )
    query = Campground.find(JSON.parse(queryStr))

    // Select field
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ')
      query = query.select(fields)
    } else {
      query = query.select('-sites')
    }

    // Sort field
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ')
      query = query.sort(sortBy)
    } else {
      query = query.sort('name')
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 25
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = await Campground.countDocuments()

    query = query.skip(startIndex).limit(limit)

    // Executing
    const campgrounds = await query

    // Pagination result
    const pagination = {}

    // Check if can goto next or prev page
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      }
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      }
    }

    // Send response
    return res
      .status(200)
      .json({ success : true, count : campgrounds.length, pagination, data : campgrounds })

  } catch (err) {
    // console.log(err.stack)
    return res
      .status(500)
      .json({ sucess: false })
  }
}

// @desc : Get a campground
// @route : GET /api/campgrounds/:cgid
// @access : Public
exports.getCampground = async (req,res,next) =>{
  try{
    const campground = await Campground.findById(req.params.id)

    if(!campground) {
      return res.status(400).json({success:false})
    }
    
    return res.status(200).json({
      success : true, 
      data : campground
    })
  } catch(err){
    return res.status(500).json({success:false})
  }
}

// @desc : Create a new campground (without any sites and amount = 0)
// @route : POST /api/campgrounds
// @access : Admin
exports.createCampground = async (req,res,next) =>{
  try{

    // Check if data is valid
    const { name, tel, address, website, pictures, facilities, tentForRent, amount, sites} = req.body
    const { houseNumber, lane, road, subDistrict, district, province, postalCode, link} = address

    if(!name || !tel || !tentForRent || !houseNumber || !subDistrict || !district || !province || !postalCode){
      // console.log(name + tel + tentForRent + houseNumber + subDistrict + district + province + postalCode);
      return res
        .status(400)
        .json({ success : false, message : 'Please enter all required data'})
    }

    req.body.amount = 0
    req.body.sites = []

    const campground = await Campground.create(req.body)

    return res
      .status(201)
      .json({ success : true, data : campground})

  } catch(err){
    console.log(err);
    return res
      .status(500)
      .json({success:false})
  }
}

// @desc : Update a campground
// @route : PUT /api/campgrounds/:cgid
// @access : Admin
exports.updateCampground = async (req,res,next) => {
  try{
    // console.log(req.params.id,req.body); 
    const campground = await Campground.findByIdAndUpdate(req.params.id , req.body, {
      new : true,
      runValidators : true
    })

    if(!campground) {
      return res
        .status(404)
        .json({success:false})
    }

    return res
      .status(201)
      .json({success : true, data : campground})

  } catch(err) {
    return res
      .status(500)
      .json({success:false})
  }
}

// @desc : Delete a campground
// @route : DEL /api/campgrounds/:cgid
// @access : Admin
exports.deleteCampground = async (req,res,next) =>{
  try{
    const campground = await Campground.findById(req.params.id)

    if(!campground) {
      return res
        .status(404)
        .json({success:false})
    }

    await campground.deleteOne();

    return res
      .status(200)
      .json({success:true, data:{}})

  } catch(err) {
    return res
      .status(500)
      .json({success:false})
  }
}