from sanic import Sanic
from sanic.response import json
import pickle
import os
import pandas as pd

app = Sanic("eatvolution_py")


def load_model(filepath):
    return pickle.load(open(filepath, 'rb'))


food_model_path = os.path.join("AI_model", "food_model.sav")
loaded_model = load_model(food_model_path)
food_train_columns = ["calories", "fat", "saturated_fat",
                      "cholesterol", "sodium", "carbohydrates", "fibre", "sugar", "protein"]


class food_model:
    pass


@app.get("/")
def hello(request):
    return json({"message": "Hello, world!"})


@app.post("/foodClassifier")
def classify(request):
    try:
        content = request.json
        # food can be an array
        food = content.get("food")
        print(f'fetch food: {food}')
        if (food == None):
            return json({"success": False})
        predict_dataset = pd.json_normalize(food)
        # re-order df columns based on the order used in training
        predict_dataset = predict_dataset[food_train_columns]
        result = loaded_model.predict(predict_dataset).tolist()
        print(f'fetch result: {result}')
        return json({"success": True, "result": result})
    except:
        return json(body={"success": False}, status=500)


@app.put("/foodClassifier")
def updateModel(request):
    pass


debug = False

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=debug, single_process=True)
