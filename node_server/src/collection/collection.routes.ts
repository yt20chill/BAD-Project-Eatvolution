import { Router } from "express";
import { foodCollectionRoutes } from "./foodCollection/foodCollection.routes";
import { slimeCollectionRoutes } from "./slimeCollection/slimeCollection.routes";

export const collectionRoutes = Router();

collectionRoutes.use("/slime", slimeCollectionRoutes);
collectionRoutes.use("/food", foodCollectionRoutes);
