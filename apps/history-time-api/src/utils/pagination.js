/**
 * Pagination Utility
 * Utilities for consistent pagination handling across services
 */

/**
 * Get pagination options from request query parameters
 * @param {Object} query - Request query object
 * @returns {Object} Pagination options
 */
const getPagination = (query) => {
  const page = query.page ? parseInt(query.page, 10) : 1;
  const limit = query.limit ? parseInt(query.limit, 10) : 10;
  const skip = (page - 1) * limit;

  return {
    skip,
    limit,
    page,
  };
};

/**
 * Format paginated response
 * @param {Array} data - Array of items
 * @param {number} totalItems - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Formatted response with pagination metadata
 */
const formatPaginationResponse = (data, totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    results: data,
    totalItems,
    totalPages,
    currentPage: page,
    limit,
    hasNext,
    hasPrev,
  };
};

module.exports = {
  getPagination,
  formatPaginationResponse,
};
