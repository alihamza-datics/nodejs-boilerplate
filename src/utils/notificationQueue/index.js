import Queue from 'bull';
import debugObj from 'debug';
import { uniq } from 'lodash';
import { redis } from '../../config/redisCredentials';
import {
  QUEUE_NAMES,
  RESOURCE,
  NOTIFICATION_QUEUE_TYPES,
  COURSE_STATUS,
  PERMISSIONS,
} from '../constants';
import {
  getByIdQuery,
  getCourseAssignments,
  queueErrorLogs,
  sendNotificationToUsers,
} from '../helper';
import { getGroupUsersByResource } from '../notification';
import models from '../../models';

const { EDUCATION, LEADERSHIP } = RESOURCE;

const {
  EDUCATION_WRITE_USERS_EXCEPT_LOGGED_IN,
  EDUCATION_WRITE_USERS_EXCEPT_LOGGED_IN_WITH_ASSIGNED_USERS,
  EDUCATION_WRITE_USERS_AND_FIXED_USERS,
  EDUCATION_FIXED_USERS,
  ALL_READ_WRITE_LEADERSHIP_USERS,
} = NOTIFICATION_QUEUE_TYPES;

const debug = debugObj('api:notification-queue');

const { NOTIFICATION_QUEUE } = QUEUE_NAMES;
export const notificationQueue = new Queue(NOTIFICATION_QUEUE, {
  redis,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
  },
});
const getWriteUserIds = async ({ loggedInUserId }) => {
  const educationWriteUserIds = await getGroupUsersByResource({
    slug: LEADERSHIP,
    permission: PERMISSIONS.WRITE,
  });
  const educationWriteFilteredIds = educationWriteUserIds.filter(
    (educationWriteUserId) => educationWriteUserId !== loggedInUserId
  );
  return educationWriteFilteredIds;
};

const getLeadershipReadUserIds = async () => {
  const educationReadUserIds = await getGroupUsersByResource({
    slug: LEADERSHIP,
    permission: PERMISSIONS.READ,
    isAdmin: false,
  });
  return educationReadUserIds;
};

const { Course } = models;

notificationQueue.process(async (job, done) => {
  const {
    userIds = [],
    referenceType,
    referenceId,
    highlightedText,
    message,
    frontendRoute,
    notificationQueueType,
    loggedInUserId,
    courseId,
    replaceString,
    routeForAdmins,
  } = job?.data || {};
  try {
    let targetUserIds = [];
    let adminIds;
    let course;
    if (courseId) {
      course = await Course.findOne(getByIdQuery({ id: courseId, attributes: ['status'] }));
    }
    if (
      notificationQueueType === EDUCATION_WRITE_USERS_EXCEPT_LOGGED_IN ||
      course?.status === COURSE_STATUS.UNPUBLISHED
    ) {
      const educationWriteUserIds = await getGroupUsersByResource({
        slug: EDUCATION,
      });
      targetUserIds = educationWriteUserIds.filter(
        (educationWriteUserId) => educationWriteUserId !== loggedInUserId
      );
    } else if (
      notificationQueueType === EDUCATION_WRITE_USERS_EXCEPT_LOGGED_IN_WITH_ASSIGNED_USERS
    ) {
      const educationWriteUserIds = await getGroupUsersByResource({
        slug: EDUCATION,
      });
      const educationWriteFilteredIds = educationWriteUserIds.filter(
        (educationWriteUserId) => educationWriteUserId !== loggedInUserId
      );
      const { users: assignedUserIds } = await getCourseAssignments({
        courseId,
        userOnly: true,
      });
      targetUserIds = [...assignedUserIds, ...educationWriteFilteredIds];
    } else if (notificationQueueType === EDUCATION_WRITE_USERS_AND_FIXED_USERS) {
      const educationWriteUserIds = await getGroupUsersByResource({
        slug: EDUCATION,
      });
      const educationWriteFilteredIds = educationWriteUserIds.filter(
        (educationWriteUserId) => educationWriteUserId !== loggedInUserId
      );
      targetUserIds = [...userIds, ...educationWriteFilteredIds];
      adminIds = educationWriteUserIds;
    } else if (notificationQueueType === EDUCATION_FIXED_USERS) {
      targetUserIds = userIds;
    } else if (notificationQueueType === ALL_READ_WRITE_LEADERSHIP_USERS) {
      const educationWriteIds = await getWriteUserIds({ loggedInUserId });
      const educationReadIds = await getLeadershipReadUserIds();
      adminIds = userIds;
      targetUserIds = [...educationReadIds, ...userIds, ...educationWriteIds];
    }

    await sendNotificationToUsers({
      userIds: uniq(targetUserIds),
      referenceType,
      referenceId,
      highlightedText,
      message,
      frontendRoute,
      adminIds,
      replaceString,
      routeForAdmins,
    });
    done();
  } catch (error) {
    done(error);
  }
});

notificationQueue.on('failed', async (job, error) => {
  await queueErrorLogs({ job, error });
  debug(
    `${job?.data?.notificationQueueType} Job failed with reason: ${job?.failedReason} error: ${error}`
  );
});

notificationQueue.on('completed', async (job) => {
  debug(`${job?.data?.notificationQueueType} Job completed`);
});
