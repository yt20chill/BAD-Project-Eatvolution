import os
import pandas as pd
import tensorflow as tf
from sklearn.model_selection import train_test_split

dirname = os.path.dirname(os.path.realpath(__file__))
food_data_path = os.path.abspath(dirname, "../../../", "node_server/src/db/food.csv")

df = pd.read_csv(food_data_path)
column_name_list = df.columns


import tensorflow as tf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans



food_data = pd.read_csv("food.csv")
headers = food_data.columns
nutrient_headers = headers[1:-2]
food_nutrient = food_data[headers[1:-2]].values
X = np.array(food_nutrient)

clusters_n = 4
iteration_n = 1000

kmeans = KMeans(init="k-means++", n_clusters = clusters_n, random_state=0, max_iter=iteration_n).fit(X)
print(kmeans.labels_)
names = food_data[headers[0]].values
for name, label in zip(names, kmeans.labels_):
  print(f'{name}: {label}')