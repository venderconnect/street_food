const Product = require('../models/Product');
const { redis } = require('../utils/cache');

const buildSearchQuery = (filters) => {
  const query = {};

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.priceRange) {
    query.price = {
      $gte: filters.priceRange.min,
      $lte: filters.priceRange.max
    };
  }

  if (filters.rating) {
    query.averageRating = { $gte: filters.rating };
  }

  if (filters.dietary) {
    query.dietaryInfo = { $all: filters.dietary };
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { 'ingredients.name': { $regex: filters.search, $options: 'i' } }
    ];
  }

  if (filters.availability) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5); // HH:mm format

    query['availability.days'] = dayOfWeek;
    query['availability.timeSlots'] = {
      $elemMatch: {
        start: { $lte: currentTime },
        end: { $gte: currentTime }
      }
    };
  }

  return query;
};

const searchProducts = async (filters, page = 1, limit = 10) => {
  const cacheKey = `search:${JSON.stringify(filters)}:${page}:${limit}`;
  const cachedResult = await redis.get(cacheKey);

  if (cachedResult) {
    return JSON.parse(cachedResult);
  }

  const query = buildSearchQuery(filters);
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('supplier', 'name rating location')
      .sort(filters.sort || { createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(query)
  ]);

  const result = {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    filters: {
      applied: Object.keys(filters).length,
      available: await getAvailableFilters()
    }
  };

  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(result));

  return result;
};

const getAvailableFilters = async () => {
  const cacheKey = 'available-filters';
  const cachedFilters = await redis.get(cacheKey);

  if (cachedFilters) {
    return JSON.parse(cachedFilters);
  }

  const [categories, priceRange, dietary] = await Promise.all([
    Product.distinct('category'),
    Product.aggregate([
      {
        $group: {
          _id: null,
          min: { $min: '$price' },
          max: { $max: '$price' }
        }
      }
    ]),
    Product.distinct('dietaryInfo')
  ]);

  const filters = {
    categories,
    priceRange: priceRange[0] || { min: 0, max: 1000 },
    dietary,
    ratings: [1, 2, 3, 4, 5],
    sort: [
      { label: 'Newest', value: '-createdAt' },
      { label: 'Price: Low to High', value: 'price' },
      { label: 'Price: High to Low', value: '-price' },
      { label: 'Rating', value: '-averageRating' }
    ]
  };

  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(filters));

  return filters;
};

module.exports = {
  searchProducts,
  getAvailableFilters
};
