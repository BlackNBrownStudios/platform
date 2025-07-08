const allRoles = {
  user: ['getGames', 'manageGames'],
  admin: ['getUsers', 'manageUsers', 'getGames', 'manageGames'],
  dataAnalyst: ['getGames', 'getAnalytics', 'exportData'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
