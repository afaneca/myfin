export default function (sequelize, Sequelize) {
  const User = sequelize.define('users', {
    user_id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
    sessionkey: {
      type: Sequelize.STRING,
    },
    trustlimit: {
      type: Sequelize.BIGINT,
    },
    trustlimit_mobile: {
      type: Sequelize.BIGINT,
    },
    sessionkey_mobile: {
      type: Sequelize.BIGINT,
    },
    last_update_timestamp: {
      type: Sequelize.BIGINT,
    },
  });

  return User;
}
