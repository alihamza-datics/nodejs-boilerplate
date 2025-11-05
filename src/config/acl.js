export default [
  {
    group: 'admin',
    permissions: [
      {
        resource: '*',
        methods: '*',
        action: 'allow',
      },
    ],
  },
  {
    group: 'user',
    permissions: [
      {
        resource: '/users/profile',
        methods: ['GET', 'PUT'],
        action: 'allow',
      },
      {
        resource: '/users',
        methods: 'GET',
        action: 'allow',
      },
    ],
  },
  {
    group: 'patient',
    permissions: [
      {
        resource: '/users/profile',
        methods: 'GET',
        action: 'allow',
      },
    ],
  },
];
