import os
import numpy as np
import pandas as pd
import tensorflow as tf
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans

dirname = os.path.dirname(os.path.realpath(__file__))
food_data_path = os.path.abspath(
    dirname, "../../../", "node_server/src/db/food.csv")

food_data = pd.read_csv(food_data_path)
headers = food_data.columns
nutrient_headers = headers[1:-2]
food_nutrient = food_data[headers[1:-2]].values
X = np.array(food_nutrient)

clusters_n = 4
iteration_n = 1000
# TODO: optimize and visualize the model
# TODO: weighting? what's the desired result?
kmeans = KMeans(init="k-means++", n_clusters=clusters_n,
                random_state=0, max_iter=iteration_n).fit(X)
print(kmeans.labels_)
names = food_data[headers[0]].values
for name, label in zip(names, kmeans.labels_):
    print(f'{name}: {label}')
