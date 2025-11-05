import sequelize from 'sequelize';
import { COURSE_STATE, COURSE_STATUS } from './constants';
import models from '../models';

const { fn, col, literal } = sequelize;
const { COMPLETE, IN_PROGRESS } = COURSE_STATE;
const { Course, User } = models;

export const userCourseProgressQuery = ({ courseIds, userIds, locationIds, type, isAdmin }) => {
  const query = {
    where: {
      ...(courseIds && { courseId: courseIds }),
      ...(userIds && { userId: userIds }),
    },
  };
  query.include = [
    {
      model: Course,
      as: 'course',
      where: { status: COURSE_STATUS.PUBLISHED, completionRequired: true },
      attributes: [],
    },
  ];
  if (locationIds?.length > 0 && !isAdmin) {
    query.include.push({
      model: User,
      as: 'user',
      attributes: [],
      where: { locationId: locationIds || [] },
    });
  }
  query.group = ['courseId'];
  query.attributes = [
    'courseId',
    [fn('COUNT', col('UserCourseProgress.userId')), 'assignedUsers'],
    [fn('ROUND', fn('AVG', col('progress'))), 'averageCompletion'],
  ];
  query.having = '';
  if (type === COMPLETE) {
    query.having = literal(`round(avg(progress)) = 100`);
  } else if (type === IN_PROGRESS) {
    query.having = literal(`round(avg(progress)) > 0 AND round(avg(progress)) < 100`);
  }
  return query;
};

export const getDepartmentByIdQuery = ({ id, userIds, isEntityUserRequired }) => {
  const query = { where: { id } };
  query.attributes = ['id', 'name'];
  query.include = [];
  if (isEntityUserRequired) {
    query.include.push({
      model: User,
      as: 'users',
      ...(userIds?.length > 0 && { where: { id: userIds } }),
      required: false,
      attributes: ['id', 'fullName', 'firstName', 'lastName'],
    });
  }
  query.order = [['name', 'asc']];
  return query;
};

export const getLocationByIdQuery = ({ id, userIds, isEntityUserRequired }) => {
  const query = { where: { id } };
  query.attributes = ['id', 'name'];
  query.include = [];
  if (isEntityUserRequired) {
    query.include.push({
      model: User,
      as: 'users',
      ...(userIds?.length > 0 && { where: { id: userIds } }),
      required: false,
      attributes: ['id', 'fullName', 'firstName', 'lastName'],
    });
  }
  query.order = [['name', 'asc']];
  return query;
};

export const getTitleByIdQuery = ({ id, userIds, isEntityUserRequired }) => {
  const query = { where: { id } };
  query.attributes = ['id', 'name'];
  query.include = [];
  if (isEntityUserRequired) {
    query.include.push({
      model: User,
      as: 'users',
      ...(userIds?.length > 0 && { where: { id: userIds } }),
      required: false,
      attributes: ['id', 'fullName', 'firstName', 'lastName'],
    });
  }
  query.order = [['name', 'asc']];
  return query;
};

export const getUserWithAssignmentsByIdQuery = ({ id }) => {
  const query = { where: { id } };
  query.attributes = ['id', 'titleId', 'locationId', 'departmentId'];
  return query;
};
