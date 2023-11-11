import { Router } from "express";
import { collectionRoutes } from "./collection/collection.routes";
import { foodRoutes } from "./food/food.routes";
import { gameRoutes } from "./game/gameRoutes";
import { shopRoutes } from "./shop/shop.routes";
import { userRoutes } from "./user/user.routes";

export const apiRoutes = Router();

apiRoutes.use("/food", foodRoutes);
apiRoutes.use("/shop", shopRoutes);
apiRoutes.use("/collection", collectionRoutes);
apiRoutes.use("/user", userRoutes);
apiRoutes.use("/game", gameRoutes);
