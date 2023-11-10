import FoodCollectionService from "../collection/foodCollection/foodCollection.service";
import SlimeCollectionService from "../collection/slimeCollection/slimeCollection.service";
import FoodService from "../food/food.service";
import SlimeService from "../slime/slime.service";
import UserService from "../user/user.service";

export default class gameController {
  constructor(
    private readonly userService: UserService,
    private readonly slimeService: SlimeService,
    private readonly foodCollectionService: FoodCollectionService,
    private readonly slimeCollectionService: SlimeCollectionService,
    private readonly foodService: FoodService
  ) {}
}
