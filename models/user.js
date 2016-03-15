/**
 * Created by yigit on 29.2.2016.
 */
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [7,100]
            }
        }
    }, {
        hooks: {
            beforeValidate: function(user, options) {
                if(typeof user.email === 'string') {
                    user.email = user.email.toLowerCase();
                }
            }
        }
    });
};