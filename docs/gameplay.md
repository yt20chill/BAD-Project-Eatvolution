# Eatvolution 為之食變

Feed slimes with healthy food and they will reward you with their ability to earn

## Highlights

- Slimes will **evolve** depends on what you feed them
- Collections of {n}+ evolution of slimes
- Collections of food with their nutrient values
- **Support custom recipes**: serve your slime with your favorite recipes!
- **AI** classification of food type
- **Idle** game-play: slime will work for you even when you are offline

## Evolve type

requirements:

- Keto: eat >=10 food && > 50% protein
- Skinny fat: eat >= 10 food >  > 60% carbs
- Obese: eat >= 10 food, extra calories > 2000

**slime_type table**
| Attribute | Balanced | Keto | Skinny Fat | Obese |
| --------- | -------- | ---- | ---------- | ----- |
| max_cal | 500 | 800 | 400 | 500 |
| BMR_factor | 1 | 1.2 | 0.8 | 0.5 |
| earning_rate_factor | 1 | 1.5 | 0.8 | 0.5 |

extra calories will reduce once current calories is 0.

formula:

`earning_rate` = `slime_type.earning_rate_factor` x `total_protein` x`constant`
