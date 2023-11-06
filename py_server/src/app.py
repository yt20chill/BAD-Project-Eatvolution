# import tensorflow as tf

from sanic import Sanic
from sanic.response import json

app = Sanic("eatvolution_py")
# classes = ["Setosa", "Versicolor", "Virginica"]
# model = tf.keras.models.load_model("model.keras")


@app.post("/")
def call_model(request):
    # content = request.json
    # predict_dataset = tf.convert_to_tensor(content.get("data", []))
    # if len(predict_dataset) == 0:
    #     return json({"message": "invalid input"})
    # result_prob = model(predict_dataset, training=False)
    # idx_max = tf.argmax(result_prob, axis=-1).numpy()
    # result = list(
    #     map(
    #         lambda item: dict(input=item[0], result=classes[item[1]]),
    #         zip(content["data"], idx_max),
    #     )
    # )
    # return json({"data": result})
    # load model
    # filepath = os.path.join("..", "/AI_model/food_model.sav")
    # food_model = pickle.load(open(filepath, 'rb'))
    pass


debug = True

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=debug, single_process=True)
