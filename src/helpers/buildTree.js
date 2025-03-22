module.exports = function buildTree(categories) {
  const categoriesTree = [];
  const mapChildren = new Map();

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const categoryId = category._id.toString(); // Chuyển _id thành string

    if (!mapChildren.has(categoryId)) {
      mapChildren.set(categoryId, []);
    }

    category.children = mapChildren.get(categoryId);

    if (!category.parentId) {
      categoriesTree.push(category);
    } else {
      const parentId = category.parentId.toString(); // Chuyển parentId thành string
      const children = mapChildren.get(parentId);
      children ? children.push(category) : mapChildren.set(parentId, [category]);
    }
  }

  return categoriesTree;
};
