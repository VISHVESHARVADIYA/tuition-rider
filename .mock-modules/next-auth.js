module.exports = {
  SessionProvider: () => null,
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  signIn: async () => {},
  signOut: async () => {},
  getCsrfToken: async () => null,
  getProviders: async () => ({}),
  getSession: async () => null,
};
