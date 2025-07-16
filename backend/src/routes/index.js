import express from "express";
import userAuthRoute from "./userRoutes.js";
import urlScanRoute from "./urlScanRoutes.js";
import fileScanRoute from "./fileScanRoutes.js";
import ipScanRoute from "./ipScanRoutes.js";
import domainRoute from "./domainRoutes.js";
import aiRoute from "./aiRoutes.js";
import chatRoute from "./chatRoutes.js";
import newsRoute from "./newsRoutes.js";
const router = express.Router();

const Routes = [
  {
    path: "/user",
    route: userAuthRoute,
  },
  {
    path: "/url",
    route: urlScanRoute,
  },
  {
    path: "/file",
    route: fileScanRoute,
  },
  {
    path: "/ip",
    route: ipScanRoute,
  },
  {
    path: "/domain",
    route: domainRoute,
  },
  {
    path: "/ai",
    route: aiRoute,
  },
  {
    path: "/chat",
    route: chatRoute,
  },
  {
    path: "/news",
    route: newsRoute,
  }
];

Routes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
