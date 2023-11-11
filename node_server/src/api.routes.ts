import { Router } from "express";
import { collectionRoutes } from "./collection/collection.routes";
import { foodRoutes } from "./food/food.routes";
import { shopRoutes } from "./shop/shop.routes";
import { slimeRoutes } from "./slime/slime.routes";
import { userRoutes } from "./user/user.routes";

export const apiRoutes = Router();

apiRoutes.use("/food", foodRoutes);
apiRoutes.use("/shop", shopRoutes);
apiRoutes.use("/collection", collectionRoutes);
apiRoutes.use("/slime", slimeRoutes);
apiRoutes.use("/user", userRoutes);
