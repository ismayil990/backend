module.exports = function registerRoutes(app) {
  // Public routes
  app.use("/", require("../Category/Categories"));
  app.use("/", require("../post/PostRoute"));
  app.use("/", require("../fields/formConfigRoutes"));
  app.use("/", require("../user/UserRoute"));
  app.use("/", require("../post/PostStatistic"));
  app.use("/", require("../payment/PremiumPayment"));
  app.use("/", require("../reports/reportRoute"));
  app.use("/", require("../admin/settings/settingRoute"));

  // Admin routes
  app.use("/", require("../admin/users/Users"));
  app.use("/", require("../admin/admin-user/AdminLogin"));
  app.use("/", require("../admin/admin-posts/getPosts"));
  app.use("/", require("../admin/admin-reports/getReports"));
  app.use("/", require("../admin/statistics/getStats"));
  app.use("/", require("../admin/aboutPage/aboutRoute"));
  app.use("/", require("../admin/termsPage/termsRoute"));
  app.use("/", require("../admin/contactUs/addInfoRoute"));
  app.use("/", require("../admin/admin-user/createAdmin"));
};
