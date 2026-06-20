// Navigation paths defined in single file to avoid hard coded strings
// Makes it easier to change paths  and avoid typos

export const navigation = {
  page: {
    home: "/",
  },
  api: {
    getFile: (filename: string) => `/api/${filename}`,
  },
};
