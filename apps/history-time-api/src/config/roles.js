const allRoles = {
  user: ['getGames', 'playGame'],
  admin: ['getUsers', 'manageUsers', 'getGames', 'manageGames', 'playGame', 'getStats'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
