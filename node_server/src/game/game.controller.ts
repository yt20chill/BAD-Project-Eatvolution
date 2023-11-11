import { Request } from "express";
import { BadRequestError } from "../utils/error";
import { AppUtils } from "../utils/utils";
import GameService from "./game.service";
export default class gameController {
  constructor(private readonly gameService: GameService) {}
  purchaseFood = async (req: Request) => {
    const { foodId } = req.body;
    const userId = req.session.user.id;
    if (!foodId) throw new BadRequestError();
    const isPurchased = await this.gameService.purchaseFood(userId, foodId);
    return AppUtils.setServerResponse<null>(null, isPurchased);
  };
}
