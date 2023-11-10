const gameConfig = {
  EARNING_RATE_CONSTANT: 1,
  MONEY_UPDATE_SCHEDULE: "* /5 * * * *", // every 5 minutes
  SHOP_REFRESH_SCHEDULE: "0 0 8,13,19 * * *", // every 8am, 1pm, 7pm
  FOOD_NUM_ALLOWED: 12, // number of food allowed in shop
};

export default gameConfig;
