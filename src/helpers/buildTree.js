module.exports = function buildTree(categories) {
  const categoriesTree = [];
  const mapChildren = new Map();

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];

    if (!mapChildren.get(`${category._id}`)) {
      mapChildren.set(`${category._id}`, []);
    }

    category.children = mapChildren.get(`${category._id}`);

    if (!category.parentId) {
      categoriesTree.push(category);
    } else {
      const children = mapChildren.get(category.parentId);
      children ? children.push(category) : mapChildren.set(category.parentId, [category]);
    }
  }

  return categoriesTree;
}