getDetails = async (req: ExpressRequest): Promise<ControllerResult<FoodCollection[]>> => {
  const { foodIds } = req.body;
  Array.isArray(foodIds) ? foodIds : [foodIds];
  if (foodIds.length === 0) throw new BadRequestError();
};
