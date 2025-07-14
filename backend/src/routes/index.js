import express from "express";
import userAuthRoute from "./userRoutes.js";
import urlScanRoute from "./urlScanRoutes.js";

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
];
  
Routes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;