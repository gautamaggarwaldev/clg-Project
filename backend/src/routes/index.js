import express from "express";
import userAuthRoute from "./userRoutes.js";
import urlScanRoute from "./urlScanRoutes.js";
import fileScanRoute from "./fileScanRoutes.js";
import ipScanRoute from "./ipScanRoutes.js";

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
];
  
Routes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;