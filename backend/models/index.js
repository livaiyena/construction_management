// models/index.js - Tüm modeller ve ilişkiler
const { sequelize } = require('../config/db');

// Model importları
const User = require('./User');
const Project = require('./Project');
const Employee = require('./Employee');
const Role = require('./Role');
const Activity = require('./Activity');
const Attendance = require('./Attendance');
const Supplier = require('./Supplier');
const Material = require('./Material');
const Equipment = require('./Equipment');
const ProjectMaterial = require('./ProjectMaterial');
const ProjectEquipment = require('./ProjectEquipment');
const Expense = require('./Expense');
const Document = require('./Document');
const Setting = require('./Setting');
const SecurityLog = require('./SecurityLog');

// ==================== İLİŞKİ TANIMLARI ====================

// User İlişkileri
User.hasMany(Project, { foreignKey: 'userId', onDelete: 'CASCADE' });
Project.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Employee, { foreignKey: 'userId', onDelete: 'CASCADE' });
Employee.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Role, { foreignKey: 'userId', onDelete: 'CASCADE' });
Role.belongsTo(User, { foreignKey: 'userId' });

// Project İlişkileri
Project.hasMany(Employee, { foreignKey: 'ProjectId', onDelete: 'SET NULL' });
Employee.belongsTo(Project, { foreignKey: 'ProjectId' });

Project.hasMany(Attendance, { foreignKey: 'ProjectId', onDelete: 'CASCADE' });
Attendance.belongsTo(Project, { foreignKey: 'ProjectId' });

Project.hasMany(Expense, { foreignKey: 'ProjectId', onDelete: 'CASCADE' });
Expense.belongsTo(Project, { foreignKey: 'ProjectId' });

Project.hasMany(Document, { foreignKey: 'ProjectId', onDelete: 'CASCADE' });
Document.belongsTo(Project, { foreignKey: 'ProjectId' });

// Employee İlişkileri
Role.hasMany(Employee, { foreignKey: 'RoleId', onDelete: 'SET NULL' });
Employee.belongsTo(Role, { foreignKey: 'RoleId' });

Employee.hasMany(Attendance, { foreignKey: 'EmployeeId', onDelete: 'CASCADE' });
Attendance.belongsTo(Employee, { foreignKey: 'EmployeeId' });

// Supplier İlişkileri
Supplier.hasMany(Material, { foreignKey: 'SupplierId', onDelete: 'SET NULL' });
Material.belongsTo(Supplier, { foreignKey: 'SupplierId' });

// Many-to-Many: Projects <-> Materials (through ProjectMaterial)
Project.belongsToMany(Material, {
    through: ProjectMaterial,
    foreignKey: 'ProjectId',
    otherKey: 'MaterialId'
});
Material.belongsToMany(Project, {
    through: ProjectMaterial,
    foreignKey: 'MaterialId',
    otherKey: 'ProjectId'
});

// Many-to-Many: Projects <-> Equipment (through ProjectEquipment)
Project.belongsToMany(Equipment, {
    through: ProjectEquipment,
    foreignKey: 'ProjectId',
    otherKey: 'EquipmentId'
});
Equipment.belongsToMany(Project, {
    through: ProjectEquipment,
    foreignKey: 'EquipmentId',
    otherKey: 'ProjectId'
});

// Document - User ilişkisi (kimin yüklediği)
User.hasMany(Document, { foreignKey: 'uploaded_by', onDelete: 'SET NULL' });
Document.belongsTo(User, { as: 'uploader', foreignKey: 'uploaded_by' });

// Export edilecek tüm modeller
module.exports = {
    sequelize,
    User,
    Project,
    Employee,
    Role,
    Activity,
    Attendance,
    Supplier,
    Material,
    Equipment,
    ProjectMaterial,
    ProjectEquipment,
    Expense,
    Document,
    Setting,
    SecurityLog
};
