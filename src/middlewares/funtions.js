import debugObj from 'debug';
import app from '../app';
import {
  ACTIONS,
  defaultGroup,
  defaultPermissions,
  OWN_ACTIONS,
  STATUS_CODES,
  REVERSE_ACTIONS,
  REVERSE_ACTION_FEATURES,
  PERMISSION,
  RESOURCE,
} from '../utils/constants';
import { BadRequestError, checkPermission } from '../utils/helper';

const debug = debugObj('api:permissions');
const { EDUCATION, CAREER, BLOG } = RESOURCE;

export const filterGoupInfo = (groups, reqUrl) => {
  let group = {
    groupName: '',
    resourceSlug: '',
    permission: [],
  };
  const groupInfo = [];
  groups.forEach(({ resources, name: groupName }) =>
    resources.map(({ url: featureUrl, slug: resourceSlug, permissions }) => {
      const resourceUrl = featureUrl.split('/')[1];
      if (reqUrl.includes(resourceUrl)) {
        group = {
          ...group,
          groupName,
          resourceSlug,
          permissions,
          permissionLength: permissions.length,
        };
        groupInfo.push(group);
      }
      return false;
    })
  );
  const groupWithMaximumPermissions = groupInfo?.reduce(
    (prev, current) => (prev?.permissionLength > current?.permissionLength ? prev : current),
    0
  );
  return groupWithMaximumPermissions || group;
};

export const checkGroupPermission = ({ reqUrl, method, groups, isUserProfile, isComment }) => {
  let { groupName, resourceSlug } = filterGoupInfo(groups, reqUrl);
  if (!groupName || isUserProfile) {
    groupName = defaultGroup;
  }
  const acl = app.get('acl');
  let permission;
  let defaulPermission = false;
  defaultPermissions.forEach(({ slug, url: defaultResourceUrl }) => {
    if (resourceSlug === '' && reqUrl.includes(defaultResourceUrl)) {
      resourceSlug = slug;
      if (isUserProfile) {
        permission = acl.can(groupName)[OWN_ACTIONS[method]](resourceSlug);
      } else if (REVERSE_ACTION_FEATURES.includes(resourceSlug)) {
        permission = acl.can(groupName)[REVERSE_ACTIONS[method]](resourceSlug);
      } else {
        permission = acl.can(groupName)[ACTIONS[method]](resourceSlug);
      }

      defaulPermission = permission.granted;
    }
  });

  if (!groupName || !resourceSlug) {
    debug(`Feature does not exist in user groups reqUrl: ${reqUrl}`);
    return BadRequestError(`You are not allowed to perform this action`, STATUS_CODES.FORBIDDEN);
  }

  if (isUserProfile) {
    permission = acl.can(groupName)[OWN_ACTIONS[method]](resourceSlug);
  } else if (REVERSE_ACTION_FEATURES.includes(resourceSlug)) {
    permission = acl.can(groupName)[REVERSE_ACTIONS[method]](resourceSlug);
  } else if (isComment) {
    permission = acl.can(groupName)[ACTIONS.GET](resourceSlug);
  } else {
    permission = acl.can(groupName)[ACTIONS[method]](resourceSlug);
  }
  const permissionObj = {
    defaulPermission,
    permission,
    resourceSlug,
  };
  return permissionObj;
};

export const checkParentFeatPermission = ({ user, next, method, reqUrl }) => {
  const associatedFeatures = [EDUCATION, CAREER, BLOG];
  const featuresPermissions = associatedFeatures.map((feature) =>
    checkPermission({
      user,
      resource: `${RESOURCE[feature]}-${PERMISSION.WRITE}`,
    })
  );
  const isAssociatedFeatureAllowed = featuresPermissions.includes(true);

  if (isAssociatedFeatureAllowed) {
    return next();
  }
  debug(`${ACTIONS[method]} permission denied on slug: url: ${reqUrl}`);
  return BadRequestError(`You are not allowed to perform this action`, STATUS_CODES.FORBIDDEN);
};
